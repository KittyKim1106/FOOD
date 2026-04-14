from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Dish(BaseModel):
    """菜品模型"""
    id: str  # 改为字符串类型 foodId
    name: str
    description: str = ""  # 新增描述字段
    category: str  # 菜系：川菜、湘菜等
    restaurant_name: str  # 关联餐厅
    image_url: str
    rating: float = Field(..., ge=0, le=5)
    tags: List[str]
    price: float = Field(..., ge=0)
    icon_type: str  # 图标类型：pig/beef/mutton/chicken/seafood/vegetable/noodle/rice


class SwipeRequest(BaseModel):
    """滑动请求模型"""
    dish_id: str
    direction: str  # "left", "right", "up"


class RecommendationRequest(BaseModel):
    """推荐请求模型"""
    intent: str  # "想吃" 或 "不想吃"
    selected_categories: List[str] = []  # 选中的食物类别
    excluded_flavors: List[str] = []  # 排除的味道
    excluded_ingredients: List[str] = []  # 排除的食材


class RecommendationResponse(BaseModel):
    """推荐响应模型"""
    recommendation: Optional[Dish] = None
    confidence: float = 0.0
    message: str = ""


class ResultResponse(BaseModel):
    """最终结果响应模型"""
    dish: Dish
    message: str


class UserRegister(BaseModel):
    """用户注册请求"""
    username: str
    password: str
    email: Optional[str] = None


class UserLogin(BaseModel):
    """用户登录请求"""
    username: str
    password: str


class AuthResponse(BaseModel):
    """认证响应"""
    success: bool
    userId: str
    token: str


class UserSettings(BaseModel):
    """用户设置模型"""
    userId: str
    excluded_flavors: List[str] = []  # 排除的味道
    excluded_ingredients: List[str] = []  # 排除的食材
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class SettingsUpdate(BaseModel):
    """设置更新请求"""
    excluded_flavors: List[str] = []
    excluded_ingredients: List[str] = []


class HistoryRecord(BaseModel):
    """历史记录模型"""
    id: str
    food_id: str
    food_name: str
    decision: str  # "accepted" 或 "rejected"
    timestamp: datetime
    is_favorite: bool = False


class HistoryResponse(BaseModel):
    """历史响应模型"""
    history: List[HistoryRecord]
    total: int = 0
