import math
import uuid
import random
import os
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from db_models import (
    User as DBUser,
    UserSettings as DBUserSettings,
    HistoryRecord as DBHistoryRecord,
    Dish as DBDish,
    Merchant as DBMerchant,
    MerchantDish as DBMerchantDish,
)
from models import (
    Dish, SwipeRequest, RecommendationRequest, RecommendationResponse,
    ResultResponse, UserRegister, UserLogin, AuthResponse,
    UserSettings, SettingsUpdate, HistoryRecord, HistoryResponse,
    NearbyRequest, NearbyMerchant, NearbyResponse, MerchantInfo,
)

app = FastAPI(title="犹豫就会饿死 API", version="3.0.0")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Token 存储（仍用内存，重启需重新登录） ==========
token_to_user: dict = {}


# ========== 辅助函数 ==========
def hash_password(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token() -> str:
    return f"token_{uuid.uuid4().hex}"


def get_current_user(token: str, db: Session) -> str:
    user_id = token_to_user.get(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="未授权，请先登录")
    # 确认用户存在
    user = db.query(DBUser).filter(DBUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user_id


def db_dish_to_pydantic(d: DBDish) -> Dish:
    return Dish(
        id=d.id, name=d.name, description=d.description or "",
        category=d.category, image_url=d.image_url or "",
        rating=d.rating, tags=d.tags or [],
        price=d.price, icon_type=d.icon_type,
    )


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """计算两点之间的距离（公里）"""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def auto_seed(db: Session):
    """如果数据库为空，自动填充种子数据"""
    if db.query(DBDish).count() == 0:
        from seed_data import DISHES_DATA, MERCHANTS_DATA, MERCHANT_DISHES
        try:
            for d in DISHES_DATA:
                db.add(DBDish(**d))
            for m in MERCHANTS_DATA:
                db.add(DBMerchant(**m))
            for mer_id, dish_id, price in MERCHANT_DISHES:
                db.add(DBMerchantDish(merchant_id=mer_id, dish_id=dish_id, price=price))
            db.commit()
        except Exception:
            db.rollback()
            raise


# 启动时建表并自动填充
@app.on_event("startup")
def startup_event():
    # 自动建表（开发环境；生产环境建议用 Alembic 迁移）
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        auto_seed(db)
    finally:
        db.close()


# ========== 认证接口 ==========
@app.post("/api/auth/register", response_model=AuthResponse)
async def register(request: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(DBUser).filter(DBUser.username == request.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="用户名已存在")

    user_id = f"user_{uuid.uuid4().hex[:8]}"
    user = DBUser(
        id=user_id,
        username=request.username,
        password_hash=hash_password(request.password),
        email=request.email,
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.add(DBUserSettings(user_id=user_id, excluded_flavors=[], excluded_ingredients=[]))
    db.commit()

    token = generate_token()
    token_to_user[token] = user_id
    return AuthResponse(success=True, userId=user_id, token=token)


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(request: UserLogin, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.username == request.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    if user.password_hash != hash_password(request.password):
        raise HTTPException(status_code=401, detail="密码错误")

    token = generate_token()
    token_to_user[token] = user.id
    return AuthResponse(success=True, userId=user.id, token=token)


# ========== 用户设置接口 ==========
@app.get("/api/user/settings")
async def get_user_settings(token: str = Query(...), db: Session = Depends(get_db)):
    user_id = get_current_user(token, db)
    settings = db.query(DBUserSettings).filter(DBUserSettings.user_id == user_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="未找到用户设置")
    return UserSettings(
        userId=user_id,
        excluded_flavors=settings.excluded_flavors or [],
        excluded_ingredients=settings.excluded_ingredients or [],
        last_updated=settings.last_updated,
    )


@app.put("/api/user/settings")
async def update_user_settings(request: SettingsUpdate, token: str = Query(...), db: Session = Depends(get_db)):
    user_id = get_current_user(token, db)
    settings = db.query(DBUserSettings).filter(DBUserSettings.user_id == user_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="未找到用户设置")
    settings.excluded_flavors = request.excluded_flavors
    settings.excluded_ingredients = request.excluded_ingredients
    settings.last_updated = datetime.utcnow()
    db.commit()
    return {"success": True, "message": "设置已更新"}


# ========== 智能推荐接口 ==========
@app.post("/api/decision/recommend", response_model=RecommendationResponse)
async def recommend(request: RecommendationRequest, token: str = Query(...), db: Session = Depends(get_db)):
    user_id = get_current_user(token, db)

    # 获取用户设置
    db_settings = db.query(DBUserSettings).filter(DBUserSettings.user_id == user_id).first()
    excluded_flavors = request.excluded_flavors or (db_settings.excluded_flavors if db_settings else [])
    excluded_ingredients = request.excluded_ingredients or (db_settings.excluded_ingredients if db_settings else [])

    # 查询所有菜品
    query = db.query(DBDish)

    # 类别过滤
    if request.selected_categories:
        query = query.filter(DBDish.category.in_(request.selected_categories))
    if request.excluded_categories:
        query = query.filter(~DBDish.category.in_(request.excluded_categories))

    available_dishes = query.all()

    # 排除味道/食材（基于 tags）
    if excluded_flavors:
        available_dishes = [
            d for d in available_dishes
            if not any(f in (d.tags or []) for f in excluded_flavors)
        ]
    if excluded_ingredients:
        available_dishes = [
            d for d in available_dishes
            if not any(ing in (d.tags or []) for ing in excluded_ingredients)
        ]

    if not available_dishes:
        return RecommendationResponse(
            recommendation=None, confidence=0.0,
            message="没有找到符合条件的菜品，请调整您的选择"
        )

    chosen = random.choice(available_dishes)

    confidence = 0.5
    if request.selected_categories and chosen.category in request.selected_categories:
        confidence += 0.3
    if not excluded_flavors and not excluded_ingredients:
        confidence += 0.2

    return RecommendationResponse(
        recommendation=db_dish_to_pydantic(chosen),
        confidence=min(confidence, 1.0),
        message="为您推荐这道菜"
    )


# ========== 旧接口兼容 ==========
@app.get("/v1/recommend", response_model=RecommendationResponse)
async def get_recommendations(db: Session = Depends(get_db)):
    dishes = db.query(DBDish).all()
    if not dishes:
        return RecommendationResponse(recommendation=None, confidence=0.0, message="暂无菜品")
    chosen = random.choice(dishes)
    return RecommendationResponse(
        recommendation=db_dish_to_pydantic(chosen),
        confidence=0.5, message="随便推荐一道菜"
    )


# ========== 历史记录接口 ==========
@app.get("/api/user/history")
async def get_history(token: str = Query(...), limit: int = 10, offset: int = 0, db: Session = Depends(get_db)):
    user_id = get_current_user(token, db)
    total = db.query(DBHistoryRecord).filter(DBHistoryRecord.user_id == user_id).count()
    records = (db.query(DBHistoryRecord)
               .filter(DBHistoryRecord.user_id == user_id)
               .order_by(DBHistoryRecord.timestamp.desc())
               .offset(offset).limit(limit).all())

    history = [
        HistoryRecord(
            id=r.id, food_id=r.food_id, food_name=r.food_name,
            decision=r.decision, timestamp=r.timestamp, is_favorite=r.is_favorite,
        )
        for r in records
    ]
    return HistoryResponse(history=history, total=total)


@app.post("/api/decision/save")
async def save_decision(token: str = Query(...), dish_id: str = Query(...), decision: str = Query(...),
                        db: Session = Depends(get_db)):
    user_id = get_current_user(token, db)
    dish = db.query(DBDish).filter(DBDish.id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="菜品不存在")

    record = DBHistoryRecord(
        id=f"hist_{uuid.uuid4().hex[:8]}",
        user_id=user_id, food_id=dish_id, food_name=dish.name,
        decision=decision, timestamp=datetime.utcnow(), is_favorite=False,
    )
    db.add(record)
    db.commit()
    return {"success": True, "historyId": record.id}


@app.put("/api/user/history/{history_id}/favorite")
async def mark_favorite(history_id: str, token: str = Query(...), db: Session = Depends(get_db)):
    user_id = get_current_user(token, db)
    record = db.query(DBHistoryRecord).filter(
        DBHistoryRecord.id == history_id, DBHistoryRecord.user_id == user_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="历史记录不存在")
    record.is_favorite = True
    db.commit()
    return {"success": True}


# ========== 基础数据接口 ==========
@app.get("/api/foods/categories")
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(DBDish.category).distinct().all()
    return {"categories": [c[0] for c in categories]}


# ========== 附近商家接口（核心新功能） ==========
@app.post("/api/nearby/merchants")
async def get_nearby_merchants(request: NearbyRequest, token: str = Query(...), db: Session = Depends(get_db)):
    """根据用户位置查找提供指定菜品的附近商家"""
    get_current_user(token, db)

    # 查找菜品
    dish = db.query(DBDish).filter(DBDish.id == request.dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="菜品不存在")

    # 查找提供该菜品的商家（通过关联表）
    merchant_dishes = db.query(DBMerchantDish).filter(DBMerchantDish.dish_id == request.dish_id).all()
    merchant_ids = [md.merchant_id for md in merchant_dishes]
    md_map = {md.merchant_id: md for md in merchant_dishes}

    if not merchant_ids:
        # 如果关联表没有数据，按菜系找商家
        merchants = db.query(DBMerchant).filter(DBMerchant.category == dish.category).all()
        md_map = {}
    else:
        merchants = db.query(DBMerchant).filter(DBMerchant.id.in_(merchant_ids)).all()

    # 按距离过滤和排序
    results = []
    for merchant in merchants:
        dist = haversine(request.latitude, request.longitude, merchant.latitude, merchant.longitude)
        if dist > request.radius_km:
            continue
        if request.service_type and merchant.service_type not in (request.service_type, "both"):
            continue

        md = md_map.get(merchant.id)
        results.append(NearbyMerchant(
            merchant=MerchantInfo(
                id=merchant.id, name=merchant.name, address=merchant.address,
                latitude=merchant.latitude, longitude=merchant.longitude,
                service_type=merchant.service_type, rating=merchant.rating,
                distance_km=round(dist, 2),
            ),
            dish_price=md.price if md else None,
        ))

    # 按距离排序
    results.sort(key=lambda x: x.merchant.distance_km or 999)

    return NearbyResponse(
        dish=db_dish_to_pydantic(dish),
        merchants=results,
        total=len(results),
        user_lat=request.latitude,
        user_lng=request.longitude,
    )


@app.get("/api/merchants")
async def list_merchants(
    category: Optional[str] = None,
    service_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """列出所有商家，可按类别和服务类型过滤"""
    query = db.query(DBMerchant)
    if category:
        query = query.filter(DBMerchant.category == category)
    if service_type:
        query = query.filter(
            (DBMerchant.service_type == service_type) | (DBMerchant.service_type == "both")
        )
    merchants = query.all()
    return {
        "merchants": [
            {
                "id": m.id, "name": m.name, "address": m.address,
                "latitude": m.latitude, "longitude": m.longitude,
                "service_type": m.service_type, "rating": m.rating, "category": m.category,
            }
            for m in merchants
        ],
        "total": len(merchants),
    }


# ========== 健康检查 ==========
@app.get("/")
async def root():
    return {
        "message": "犹豫就会饿死 API v3.0 - 数据库版 + 位置匹配",
        "version": "3.0.0",
        "endpoints": [
            "POST /api/auth/register - 用户注册",
            "POST /api/auth/login - 用户登录",
            "GET /api/user/settings - 获取用户设置",
            "PUT /api/user/settings - 更新用户设置",
            "POST /api/decision/recommend - 智能推荐",
            "GET /api/user/history - 获取历史记录",
            "POST /api/decision/save - 保存决策",
            "PUT /api/user/history/{id}/favorite - 标记收藏",
            "GET /api/foods/categories - 获取食物类别",
            "POST /api/nearby/merchants - 附近商家查询",
            "GET /api/merchants - 商家列表",
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
