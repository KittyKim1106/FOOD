"""
初始化数据库并填充 Mock 数据
用法: python seed_data.py
"""
import uuid
from database import engine, SessionLocal, Base
from db_models import User, UserSettings, Dish, Merchant, MerchantDish


# ========== 菜品数据 ==========
DISHES_DATA = [
    {"id": "dish_001", "name": "红烧肉", "description": "经典川菜，肥而不腻，甜咸适口", "category": "川菜", "image_url": "https://picsum.photos/400/600?random=1", "rating": 4.8, "tags": ["猪肉", "甜", "下饭", "经典"], "price": 58.0, "icon_type": "pig"},
    {"id": "dish_002", "name": "宫保鸡丁", "description": "传统川菜，鸡肉鲜嫩，花生酥脆，麻辣鲜香", "category": "川菜", "image_url": "https://picsum.photos/400/600?random=2", "rating": 4.6, "tags": ["鸡肉", "辣", "花生", "经典"], "price": 32.0, "icon_type": "chicken"},
    {"id": "dish_003", "name": "麻婆豆腐", "description": "川菜经典，豆腐嫩滑，麻辣鲜香，超级下饭", "category": "川菜", "image_url": "https://picsum.photos/400/600?random=3", "rating": 4.5, "tags": ["豆腐", "辣", "麻辣", "下饭"], "price": 18.0, "icon_type": "vegetable"},
    {"id": "dish_006", "name": "剁椒鱼头", "description": "湖南名菜，鱼头鲜嫩，剁椒香辣，色泽红亮", "category": "湘菜", "image_url": "https://picsum.photos/400/600?random=6", "rating": 4.7, "tags": ["海鲜", "辣", "鲜香", "招牌"], "price": 56.0, "icon_type": "seafood"},
    {"id": "dish_007", "name": "小炒黄牛肉", "description": "湘菜经典，牛肉嫩滑，香辣下饭，香气扑鼻", "category": "湘菜", "image_url": "https://picsum.photos/400/600?random=7", "rating": 4.6, "tags": ["牛肉", "辣", "香菜", "下饭"], "price": 48.0, "icon_type": "beef"},
    {"id": "dish_010", "name": "白切鸡", "description": "粤菜经典，鸡肉鲜嫩，清淡原味，蘸料精美", "category": "粤菜", "image_url": "https://picsum.photos/400/600?random=10", "rating": 4.6, "tags": ["鸡肉", "清淡", "原味", "经典"], "price": 52.0, "icon_type": "chicken"},
    {"id": "dish_011", "name": "烧鹅", "description": "港式名菜，鹅皮酥脆，肉质鲜美，甜香可口", "category": "粤菜", "image_url": "https://picsum.photos/400/600?random=11", "rating": 4.8, "tags": ["家禽", "甜", "烤制", "招牌"], "price": 88.0, "icon_type": "chicken"},
    {"id": "dish_018", "name": "三文鱼刺身", "description": "日式料理，鱼肉新鲜，口感细腻，高端美味", "category": "日料", "image_url": "https://picsum.photos/400/600?random=18", "rating": 4.7, "tags": ["海鲜", "生食", "新鲜", "高端"], "price": 88.0, "icon_type": "seafood"},
    {"id": "dish_019", "name": "豚骨拉面", "description": "日式拉面，汤底浓郁，面条劲道，温暖胃心", "category": "日料", "image_url": "https://picsum.photos/400/600?random=19", "rating": 4.6, "tags": ["猪肉", "汤", "面食", "日式"], "price": 42.0, "icon_type": "noodle"},
    {"id": "dish_027", "name": "黑椒牛排", "description": "西式经典，牛肉鲜嫩，黑椒香辣，配餐丰富", "category": "西餐", "image_url": "https://picsum.photos/400/600?random=27", "rating": 4.6, "tags": ["牛肉", "黑椒", "煎", "西式"], "price": 128.0, "icon_type": "beef"},
    {"id": "dish_028", "name": "意大利肉酱面", "description": "意式经典，面条劲道，肉酱浓郁，番茄酸甜", "category": "西餐", "image_url": "https://picsum.photos/400/600?random=28", "rating": 4.4, "tags": ["猪肉", "牛肉", "面食", "番茄"], "price": 42.0, "icon_type": "noodle"},
    {"id": "dish_046", "name": "重庆老火锅", "description": "重庆特色，麻辣鲜香，食材丰富，聚餐首选", "category": "火锅", "image_url": "https://picsum.photos/400/600?random=46", "rating": 4.8, "tags": ["牛肉", "辣", "麻辣", "火锅"], "price": 128.0, "icon_type": "beef"},
    {"id": "dish_047", "name": "潮汕牛肉火锅", "description": "潮汕特色，牛肉新鲜，汤底清淡，原汁原味", "category": "火锅", "image_url": "https://picsum.photos/400/600?random=47", "rating": 4.7, "tags": ["牛肉", "清淡", "鲜", "潮汕"], "price": 108.0, "icon_type": "beef"},
    {"id": "dish_031", "name": "黄焖鸡米饭", "description": "国民快餐，鸡肉鲜嫩，酱汁浓郁，下饭神器", "category": "快餐", "image_url": "https://picsum.photos/400/600?random=31", "rating": 4.5, "tags": ["鸡肉", "米饭", "炖", "下饭"], "price": 22.0, "icon_type": "rice"},
    {"id": "dish_032", "name": "兰州拉面", "description": "西北特色，面条劲道，汤清味美，经济实惠", "category": "快餐", "image_url": "https://picsum.photos/400/600?random=32", "rating": 4.4, "tags": ["牛肉", "面食", "汤", "清真"], "price": 15.0, "icon_type": "noodle"},
    {"id": "dish_037", "name": "肉夹馍", "description": "陕西名吃，馍酥肉香，肥而不腻，街头美食", "category": "小吃", "image_url": "https://picsum.photos/400/600?random=37", "rating": 4.6, "tags": ["猪肉", "面食", "陕西", "经典"], "price": 12.0, "icon_type": "pig"},
    {"id": "dish_040", "name": "酸辣粉", "description": "重庆小吃，粉条爽滑，酸辣开胃，回味无穷", "category": "小吃", "image_url": "https://picsum.photos/400/600?random=40", "rating": 4.5, "tags": ["面食", "酸", "辣", "重庆"], "price": 12.0, "icon_type": "noodle"},
]

# ========== 商家数据 ==========
# 北京中关村附近坐标作为基准 (39.9042, 116.4074)
MERCHANTS_DATA = [
    {"id": "mer_001", "name": "川香阁", "address": "北京市海淀区中关村大街1号", "phone": "010-88881001", "latitude": 39.9062, "longitude": 116.4094, "service_type": "both", "rating": 4.7, "category": "川菜"},
    {"id": "mer_002", "name": "蜀味轩", "address": "北京市海淀区中关村南大街2号", "phone": "010-88881002", "latitude": 39.9022, "longitude": 116.4054, "service_type": "delivery", "rating": 4.5, "category": "川菜"},
    {"id": "mer_003", "name": "老成都", "address": "北京市海淀区中关村北大街3号", "phone": "010-88881003", "latitude": 39.9082, "longitude": 116.4114, "service_type": "dine_in", "rating": 4.3, "category": "川菜"},
    {"id": "mer_004", "name": "湘聚楼", "address": "北京市海淀区中关村西路4号", "phone": "010-88881004", "latitude": 39.9052, "longitude": 116.4034, "service_type": "both", "rating": 4.6, "category": "湘菜"},
    {"id": "mer_005", "name": "湖南人家", "address": "北京市海淀区中关村东路5号", "phone": "010-88881005", "latitude": 39.9032, "longitude": 116.4084, "service_type": "delivery", "rating": 4.4, "category": "湘菜"},
    {"id": "mer_006", "name": "粤海轩", "address": "北京市海淀区中关村大街6号", "phone": "010-88881006", "latitude": 39.9072, "longitude": 116.4064, "service_type": "dine_in", "rating": 4.6, "category": "粤菜"},
    {"id": "mer_007", "name": "香港茶餐厅", "address": "北京市海淀区知春路7号", "phone": "010-88881007", "latitude": 39.9012, "longitude": 116.4104, "service_type": "both", "rating": 4.5, "category": "粤菜"},
    {"id": "mer_008", "name": "樱之味", "address": "北京市海淀区中关村南大街8号", "phone": "010-88881008", "latitude": 39.9042, "longitude": 116.4074, "service_type": "dine_in", "rating": 4.7, "category": "日料"},
    {"id": "mer_009", "name": "一风堂", "address": "北京市海淀区五道口9号", "phone": "010-88881009", "latitude": 39.9092, "longitude": 116.4124, "service_type": "both", "rating": 4.6, "category": "日料"},
    {"id": "mer_010", "name": "豪客来", "address": "北京市海淀区中关村大街10号", "phone": "010-88881010", "latitude": 39.9062, "longitude": 116.4044, "service_type": "dine_in", "rating": 4.5, "category": "西餐"},
    {"id": "mer_011", "name": "必胜客", "address": "北京市海淀区五道口11号", "phone": "010-88881011", "latitude": 39.9032, "longitude": 116.4134, "service_type": "delivery", "rating": 4.3, "category": "西餐"},
    {"id": "mer_012", "name": "小龙坎", "address": "北京市海淀区中关村南大街12号", "phone": "010-88881012", "latitude": 39.9052, "longitude": 116.4084, "service_type": "both", "rating": 4.8, "category": "火锅"},
    {"id": "mer_013", "name": "八合里", "address": "北京市海淀区知春路13号", "phone": "010-88881013", "latitude": 39.9072, "longitude": 116.4054, "service_type": "dine_in", "rating": 4.7, "category": "火锅"},
    {"id": "mer_014", "name": "杨铭宇黄焖鸡", "address": "北京市海淀区中关村北大街14号", "phone": "010-88881014", "latitude": 39.9042, "longitude": 116.4064, "service_type": "delivery", "rating": 4.4, "category": "快餐"},
    {"id": "mer_015", "name": "马子禄拉面", "address": "北京市海淀区中关村大街15号", "phone": "010-88881015", "latitude": 39.9062, "longitude": 116.4084, "service_type": "both", "rating": 4.3, "category": "快餐"},
    {"id": "mer_016", "name": "魏家凉皮", "address": "北京市海淀区五道口16号", "phone": "010-88881016", "latitude": 39.9022, "longitude": 116.4074, "service_type": "delivery", "rating": 4.5, "category": "小吃"},
    {"id": "mer_017", "name": "好又来", "address": "北京市海淀区中关村西路17号", "phone": "010-88881017", "latitude": 39.9082, "longitude": 116.4094, "service_type": "delivery", "rating": 4.4, "category": "小吃"},
]

# ========== 商家-菜品关联 ==========
# 每个商家提供同菜系的菜品
MERCHANT_DISHES = [
    # 川香阁
    ("mer_001", "dish_001", 58.0), ("mer_001", "dish_002", 30.0), ("mer_001", "dish_003", 16.0),
    # 蜀味轩
    ("mer_002", "dish_001", 55.0), ("mer_002", "dish_002", 32.0), ("mer_002", "dish_003", 18.0),
    # 老成都
    ("mer_003", "dish_001", 60.0), ("mer_003", "dish_003", 15.0),
    # 湘聚楼
    ("mer_004", "dish_006", 56.0), ("mer_004", "dish_007", 46.0),
    # 湖南人家
    ("mer_005", "dish_006", 52.0), ("mer_005", "dish_007", 48.0),
    # 粤海轩
    ("mer_006", "dish_010", 52.0), ("mer_006", "dish_011", 88.0),
    # 香港茶餐厅
    ("mer_007", "dish_010", 48.0), ("mer_007", "dish_011", 85.0),
    # 樱之味
    ("mer_008", "dish_018", 88.0), ("mer_008", "dish_019", 45.0),
    # 一风堂
    ("mer_009", "dish_018", 92.0), ("mer_009", "dish_019", 42.0),
    # 豪客来
    ("mer_010", "dish_027", 128.0), ("mer_010", "dish_028", 45.0),
    # 必胜客
    ("mer_011", "dish_027", 135.0), ("mer_011", "dish_028", 42.0),
    # 小龙坎
    ("mer_012", "dish_046", 128.0), ("mer_012", "dish_047", 112.0),
    # 八合里
    ("mer_013", "dish_046", 135.0), ("mer_013", "dish_047", 108.0),
    # 杨铭宇黄焖鸡
    ("mer_014", "dish_031", 22.0), ("mer_014", "dish_032", 15.0),
    # 马子禄拉面
    ("mer_015", "dish_031", 25.0), ("mer_015", "dish_032", 14.0),
    # 魏家凉皮
    ("mer_016", "dish_037", 12.0), ("mer_016", "dish_040", 13.0),
    # 好又来
    ("mer_017", "dish_037", 14.0), ("mer_017", "dish_040", 12.0),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 检查是否已有数据
        if db.query(Dish).count() > 0:
            print("数据库已有数据，跳过填充")
            return

        # 插入菜品
        for d in DISHES_DATA:
            db.add(Dish(**d))

        # 插入商家
        for m in MERCHANTS_DATA:
            db.add(Merchant(**m))

        # 插入商家-菜品关联
        for mer_id, dish_id, price in MERCHANT_DISHES:
            db.add(MerchantDish(merchant_id=mer_id, dish_id=dish_id, price=price))

        db.commit()
        print(f"填充完成: {len(DISHES_DATA)} 菜品, {len(MERCHANTS_DATA)} 商家, {len(MERCHANT_DISHES)} 关联")
    except Exception as e:
        db.rollback()
        print(f"填充失败: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
