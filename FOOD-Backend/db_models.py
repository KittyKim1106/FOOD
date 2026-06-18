from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(32), primary_key=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    password_hash = Column(String(64), nullable=False)
    email = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    settings = relationship("UserSettings", back_populates="user", uselist=False)
    history = relationship("HistoryRecord", back_populates="user")


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(32), ForeignKey("users.id"), unique=True, nullable=False)
    excluded_flavors = Column(JSON, default=list)
    excluded_ingredients = Column(JSON, default=list)
    last_updated = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="settings")


class HistoryRecord(Base):
    __tablename__ = "history_records"

    id = Column(String(32), primary_key=True)
    user_id = Column(String(32), ForeignKey("users.id"), nullable=False, index=True)
    food_id = Column(String(32), ForeignKey("dishes.id"), nullable=False)
    food_name = Column(String(128), nullable=False)
    decision = Column(String(16), nullable=False)  # "accepted" or "rejected"
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_favorite = Column(Boolean, default=False)

    user = relationship("User", back_populates="history")
    dish = relationship("Dish")


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String(32), primary_key=True)
    name = Column(String(128), nullable=False)
    address = Column(Text, nullable=True)
    phone = Column(String(32), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    service_type = Column(String(16), nullable=False)  # "delivery" / "dine_in" / "both"
    rating = Column(Float, default=0.0)
    category = Column(String(32), nullable=False)  # matches dish category
    image_url = Column(Text, nullable=True)

    dishes = relationship("MerchantDish", back_populates="merchant")


class Dish(Base):
    __tablename__ = "dishes"

    id = Column(String(32), primary_key=True)
    name = Column(String(128), nullable=False)
    description = Column(Text, default="")
    category = Column(String(32), nullable=False, index=True)
    image_url = Column(Text, nullable=True)
    rating = Column(Float, default=0.0)
    tags = Column(JSON, default=list)
    price = Column(Float, default=0.0)
    icon_type = Column(String(16), default="vegetable")

    merchants = relationship("MerchantDish", back_populates="dish")


class MerchantDish(Base):
    """关联表：商家提供的菜品（含价格差异）"""
    __tablename__ = "merchant_dishes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    merchant_id = Column(String(32), ForeignKey("merchants.id"), nullable=False, index=True)
    dish_id = Column(String(32), ForeignKey("dishes.id"), nullable=False, index=True)
    price = Column(Float, nullable=True)  # 商家特定价格，为空则用菜品默认价

    merchant = relationship("Merchant", back_populates="dishes")
    dish = relationship("Dish", back_populates="merchants")
