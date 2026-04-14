from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Optional
import hashlib
import uuid
from datetime import datetime

from models import (
    Dish, SwipeRequest, RecommendationRequest, RecommendationResponse,
    ResultResponse, UserRegister, UserLogin, AuthResponse,
    UserSettings, SettingsUpdate, HistoryRecord, HistoryResponse
)
from data.mock_dishes import get_all_dishes

app = FastAPI(title="犹豫就会饿死 API", version="2.0.0")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 内存存储 ==========
# 全局菜品库
ALL_DISHES = get_all_dishes()

# 用户数据存储 (内存 Map)
users_db: Dict[str, dict] = {}  # user_id -> user_data

# Token 到用户的映射
token_to_user: Dict[str, str] = {}  # token -> user_id

# 用户设置存储
user_settings_db: Dict[str, UserSettings] = {}  # user_id -> settings

# 历史记录存储
history_db: Dict[str, List[HistoryRecord]] = {}  # user_id -> [history_records]

# 当前会话 (简化版，用于兼容旧接口)
class Session:
    def __init__(self):
        self.current_user_id: Optional[str] = None
        self.current_recommendations: List[Dish] = []
        self.swiped_right: List[Dish] = []
        self.swiped_left: List[Dish] = []
        self.swiped_up: List[Dish] = []
        self.is_finished = False

session = Session()


# ========== 辅助函数 ==========
def hash_password(password: str) -> str:
    """简单哈希密码"""
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token() -> str:
    """生成随机 token"""
    return f"token_{uuid.uuid4().hex}"


def get_current_user(token: str) -> str:
    """从 token 获取用户 ID"""
    user_id = token_to_user.get(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="未授权，请先登录")
    return user_id


# ========== 认证接口 ==========
@app.post("/api/auth/register", response_model=AuthResponse)
async def register(request: UserRegister):
    """用户注册"""
    # 检查用户名是否已存在
    for user_id, user_data in users_db.items():
        if user_data["username"] == request.username:
            raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 创建新用户
    user_id = f"user_{uuid.uuid4().hex[:8]}"
    users_db[user_id] = {
        "username": request.username,
        "password": hash_password(request.password),
        "email": request.email,
        "created_at": datetime.utcnow()
    }
    
    # 生成 token
    token = generate_token()
    token_to_user[token] = user_id
    
    # 初始化用户设置
    user_settings_db[user_id] = UserSettings(userId=user_id)
    
    # 初始化历史记录
    history_db[user_id] = []
    
    return AuthResponse(success=True, userId=user_id, token=token)


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(request: UserLogin):
    """用户登录"""
    # 查找用户
    for user_id, user_data in users_db.items():
        if user_data["username"] == request.username:
            # 验证密码
            if user_data["password"] != hash_password(request.password):
                raise HTTPException(status_code=401, detail="密码错误")
            
            # 生成新 token
            token = generate_token()
            token_to_user[token] = user_id
            
            return AuthResponse(success=True, userId=user_id, token=token)
    
    raise HTTPException(status_code=404, detail="用户不存在")


@app.get("/api/user/settings")
async def get_user_settings(token: str = Query(...)):
    """获取用户设置"""
    user_id = get_current_user(token)
    settings = user_settings_db.get(user_id)
    if not settings:
        raise HTTPException(status_code=404, detail="未找到用户设置")
    return settings


@app.put("/api/user/settings")
async def update_user_settings(request: SettingsUpdate, token: str = Query(...)):
    """更新用户设置"""
    user_id = get_current_user(token)
    settings = UserSettings(
        userId=user_id,
        excluded_flavors=request.excluded_flavors,
        excluded_ingredients=request.excluded_ingredients,
        last_updated=datetime.utcnow()
    )
    user_settings_db[user_id] = settings
    return {"success": True, "message": "设置已更新"}


# ========== 智能推荐接口 ==========
@app.post("/api/decision/recommend", response_model=RecommendationResponse)
async def recommend(request: RecommendationRequest, token: str = Query(...)):
    """基于用户输入的个性化推荐"""
    import random
    
    user_id = get_current_user(token)
    
    # 获取用户设置
    user_settings = user_settings_db.get(user_id)
    
    # 合并排除项（请求参数优先，其次用户设置）
    excluded_flavors = request.excluded_flavors or (user_settings.excluded_flavors if user_settings else [])
    excluded_ingredients = request.excluded_ingredients or (user_settings.excluded_ingredients if user_settings else [])
    
    # 过滤菜品
    available_dishes = ALL_DISHES.copy()
    
    # 1. 根据意图过滤
    if request.intent == "不想吃":
        # 反向推荐：排除用户选择的类别
        if request.selected_categories:
            available_dishes = [d for d in available_dishes if d.category not in request.selected_categories]
    else:  # "想吃"
        # 正向筛选：只保留用户选择的类别
        if request.selected_categories:
            available_dishes = [d for d in available_dishes if d.category in request.selected_categories]
    
    # 2. 排除味道
    if excluded_flavors:
        filtered_dishes = []
        for dish in available_dishes:
            # 检查 tags 中是否包含排除的味道
            has_excluded_flavor = any(flavor in dish.tags for flavor in excluded_flavors)
            if not has_excluded_flavor:
                filtered_dishes.append(dish)
        available_dishes = filtered_dishes
    
    # 3. 排除食材
    if excluded_ingredients:
        filtered_dishes = []
        for dish in available_dishes:
            # 检查 tags 中是否包含排除的食材
            has_excluded_ingredient = any(ingredient in dish.tags for ingredient in excluded_ingredients)
            if not has_excluded_ingredient:
                filtered_dishes.append(dish)
        available_dishes = filtered_dishes
    
    # 如果没有符合条件的菜品
    if not available_dishes:
        return RecommendationResponse(
            recommendation=None,
            confidence=0.0,
            message="没有找到符合条件的菜品，请调整您的选择"
        )
    
    # 随机选择一个推荐
    recommended_dish = random.choice(available_dishes)
    
    # 计算置信度（简化版：基于匹配程度）
    confidence = 0.5  # 基础置信度
    if request.selected_categories and recommended_dish.category in request.selected_categories:
        confidence += 0.3
    if not excluded_flavors and not excluded_ingredients:
        confidence += 0.2
    
    return RecommendationResponse(
        recommendation=recommended_dish,
        confidence=min(confidence, 1.0),
        message="为您推荐这道菜"
    )


# ========== 旧接口兼容（保留但简化实现） ==========
@app.get("/v1/recommend", response_model=RecommendationResponse)
async def get_recommendations():
    """获取推荐菜品列表（旧接口，保留兼容）"""
    import random
    # 简化实现，返回随机菜品
    return RecommendationResponse(
        recommendation=random.choice(ALL_DISHES) if ALL_DISHES else None,
        confidence=0.5,
        message="随便推荐一道菜"
    )


# ========== 历史记录接口 ==========
@app.get("/api/user/history")
async def get_history(token: str = Query(...), limit: int = 10, offset: int = 0):
    """获取用户历史决策记录"""
    user_id = get_current_user(token)
    history = history_db.get(user_id, [])
    
    # 分页
    paginated_history = history[offset:offset + limit]
    
    return HistoryResponse(
        history=paginated_history,
        total=len(history)
    )


@app.post("/api/decision/save")
async def save_decision(token: str = Query(...), dish_id: str = Query(...), decision: str = Query(...)):
    """保存用户决策"""
    user_id = get_current_user(token)
    
    # 找到菜品
    dish = next((d for d in ALL_DISHES if d.id == dish_id), None)
    if not dish:
        raise HTTPException(status_code=404, detail="菜品不存在")
    
    # 创建历史记录
    record = HistoryRecord(
        id=f"hist_{uuid.uuid4().hex[:8]}",
        food_id=dish_id,
        food_name=dish.name,
        decision=decision,
        timestamp=datetime.utcnow(),
        is_favorite=False
    )
    
    # 添加到历史记录
    if user_id not in history_db:
        history_db[user_id] = []
    history_db[user_id].append(record)
    
    return {"success": True}


@app.put("/api/user/history/{history_id}/favorite")
async def mark_favorite(history_id: str, token: str = Query(...)):
    """标记历史记录为收藏"""
    user_id = get_current_user(token)
    history = history_db.get(user_id, [])
    
    # 找到记录并标记
    for record in history:
        if record.id == history_id:
            record.is_favorite = True
            return {"success": True}
    
    raise HTTPException(status_code=404, detail="历史记录不存在")


# ========== 基础数据接口 ==========
@app.get("/api/foods/categories")
async def get_categories():
    """获取所有食物类别"""
    categories = list(set(dish.category for dish in ALL_DISHES))
    return {"categories": categories}


@app.get("/")
async def root():
    return {
        "message": "犹豫就会饿死 API v2.0 - 基于个性化推荐的菜品选择系统",
        "version": "2.0.0",
        "endpoints": [
            "POST /api/auth/register - 用户注册",
            "POST /api/auth/login - 用户登录",
            "GET /api/user/settings - 获取用户设置",
            "PUT /api/user/settings - 更新用户设置",
            "POST /api/decision/recommend - 智能推荐",
            "GET /api/user/history - 获取历史记录",
            "POST /api/decision/save - 保存决策",
            "PUT /api/user/history/{id}/favorite - 标记收藏",
            "GET /api/foods/categories - 获取食物类别"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
