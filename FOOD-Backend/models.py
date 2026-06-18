from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class Dish(BaseModel):
    """菜品模型"""
    id: str
    name: str
    description: str = ""
    category: str
    image_url: str
    rating: float = Field(..., ge=0, le=5)
    tags: List[str]
    price: float = Field(..., ge=0)
    icon_type: str


class MerchantInfo(BaseModel):
    """商家信息（用于推荐响应中的附近商家）"""
    id: str
    name: str
    address: Optional[str] = None
    latitude: float
    longitude: float
    service_type: str  # "delivery" / "dine_in" / "both"
    rating: float = 0.0
    distance_km: Optional[float] = None  # 与用户的距离（公里）


class SwipeRequest(BaseModel):
    """滑动请求模型"""
    dish_id: str
    direction: str  # "left", "right", "up"


class RecommendationRequest(BaseModel):
    """推荐请求模型"""
    intent: str  # "想吃" 或 "不想吃"
    selected_categories: List[str] = []
    excluded_categories: List[str] = []
    excluded_flavors: List[str] = []
    excluded_ingredients: List[str] = []


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
    excluded_flavors: List[str] = []
    excluded_ingredients: List[str] = []
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


class NearbyRequest(BaseModel):
    """附近商家请求"""
    dish_id: str
    latitude: float
    longitude: float
    radius_km: float = 5.0  # 搜索半径，默认5公里
    service_type: Optional[str] = None  # 可选过滤: "delivery" / "dine_in"


class NearbyMerchant(BaseModel):
    """附近商家响应项"""
    merchant: MerchantInfo
    dish_price: Optional[float] = None  # 该商家的菜品价格


class NearbyResponse(BaseModel):
    """附近商家响应"""
    dish: Dish
    merchants: List[NearbyMerchant]
    total: int = 0
    user_lat: float
    user_lng: float
