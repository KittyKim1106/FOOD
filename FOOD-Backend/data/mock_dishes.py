from typing import List
from models import Dish


def get_all_dishes() -> List[Dish]:
    """获取所有菜品数据"""
    return DISHES


# ========== Mock 菜品数据库 (精选 18 道) ==========
DISHES = [
    # ==================== 川菜 ====================
    Dish(
        id="dish_001",
        name="红烧肉",
        description="经典川菜，肥而不腻，甜咸适口",
        category="川菜",
        restaurant_name="川香阁",
        image_url="https://picsum.photos/400/600?random=1",
        rating=4.8,
        tags=["猪肉", "甜", "下饭", "经典"],
        price=58.0,
        icon_type="pig"
    ),
    Dish(
        id="dish_002",
        name="宫保鸡丁",
        description="传统川菜，鸡肉鲜嫩，花生酥脆，麻辣鲜香",
        category="川菜",
        restaurant_name="蜀味轩",
        image_url="https://picsum.photos/400/600?random=2",
        rating=4.6,
        tags=["鸡肉", "辣", "花生", "经典"],
        price=32.0,
        icon_type="chicken"
    ),
    Dish(
        id="dish_003",
        name="麻婆豆腐",
        description="川菜经典，豆腐嫩滑，麻辣鲜香，超级下饭",
        category="川菜",
        restaurant_name="老成都",
        image_url="https://picsum.photos/400/600?random=3",
        rating=4.5,
        tags=["豆腐", "辣", "麻辣", "下饭"],
        price=18.0,
        icon_type="vegetable"
    ),
    
    # ==================== 湘菜 ====================
    Dish(
        id="dish_006",
        name="剁椒鱼头",
        description="湖南名菜，鱼头鲜嫩，剁椒香辣，色泽红亮",
        category="湘菜",
        restaurant_name="湘聚楼",
        image_url="https://picsum.photos/400/600?random=6",
        rating=4.7,
        tags=["海鲜", "辣", "鲜香", "招牌"],
        price=56.0,
        icon_type="seafood"
    ),
    Dish(
        id="dish_007",
        name="小炒黄牛肉",
        description="湘菜经典，牛肉嫩滑，香辣下饭，香气扑鼻",
        category="湘菜",
        restaurant_name="湖南人家",
        image_url="https://picsum.photos/400/600?random=7",
        rating=4.6,
        tags=["牛肉", "辣", "香菜", "下饭"],
        price=48.0,
        icon_type="beef"
    ),
    
    # ==================== 粤菜 ====================
    Dish(
        id="dish_010",
        name="白切鸡",
        description="粤菜经典，鸡肉鲜嫩，清淡原味，蘸料精美",
        category="粤菜",
        restaurant_name="粤海轩",
        image_url="https://picsum.photos/400/600?random=10",
        rating=4.6,
        tags=["鸡肉", "清淡", "原味", "经典"],
        price=52.0,
        icon_type="chicken"
    ),
    Dish(
        id="dish_011",
        name="烧鹅",
        description="港式名菜，鹅皮酥脆，肉质鲜美，甜香可口",
        category="粤菜",
        restaurant_name="香港茶餐厅",
        image_url="https://picsum.photos/400/600?random=11",
        rating=4.8,
        tags=["家禽", "甜", "烤制", "招牌"],
        price=88.0,
        icon_type="chicken"
    ),
    
    # ==================== 日料 ====================
    Dish(
        id="dish_018",
        name="三文鱼刺身",
        description="日式料理，鱼肉新鲜，口感细腻，高端美味",
        category="日料",
        restaurant_name="樱之味",
        image_url="https://picsum.photos/400/600?random=18",
        rating=4.7,
        tags=["海鲜", "生食", "新鲜", "高端"],
        price=88.0,
        icon_type="seafood"
    ),
    Dish(
        id="dish_019",
        name="豚骨拉面",
        description="日式拉面，汤底浓郁，面条劲道，温暖胃心",
        category="日料",
        restaurant_name="一风堂",
        image_url="https://picsum.photos/400/600?random=19",
        rating=4.6,
        tags=["猪肉", "汤", "面食", "日式"],
        price=42.0,
        icon_type="noodle"
    ),
    
    # ==================== 西餐 ====================
    Dish(
        id="dish_027",
        name="黑椒牛排",
        description="西式经典，牛肉鲜嫩，黑椒香辣，配餐丰富",
        category="西餐",
        restaurant_name="豪客来",
        image_url="https://picsum.photos/400/600?random=27",
        rating=4.6,
        tags=["牛肉", "黑椒", "煎", "西式"],
        price=128.0,
        icon_type="beef"
    ),
    Dish(
        id="dish_028",
        name="意大利肉酱面",
        description="意式经典，面条劲道，肉酱浓郁，番茄酸甜",
        category="西餐",
        restaurant_name="必胜客",
        image_url="https://picsum.photos/400/600?random=28",
        rating=4.4,
        tags=["猪肉", "牛肉", "面食", "番茄"],
        price=42.0,
        icon_type="noodle"
    ),
    
    # ==================== 火锅 ====================
    Dish(
        id="dish_046",
        name="重庆老火锅",
        description="重庆特色，麻辣鲜香，食材丰富，聚餐首选",
        category="火锅",
        restaurant_name="小龙坎",
        image_url="https://picsum.photos/400/600?random=46",
        rating=4.8,
        tags=["牛肉", "辣", "麻辣", "火锅"],
        price=128.0,
        icon_type="beef"
    ),
    Dish(
        id="dish_047",
        name="潮汕牛肉火锅",
        description="潮汕特色，牛肉新鲜，汤底清淡，原汁原味",
        category="火锅",
        restaurant_name="八合里",
        image_url="https://picsum.photos/400/600?random=47",
        rating=4.7,
        tags=["牛肉", "清淡", "鲜", "潮汕"],
        price=108.0,
        icon_type="beef"
    ),
    
    # ==================== 快餐 ====================
    Dish(
        id="dish_031",
        name="黄焖鸡米饭",
        description="国民快餐，鸡肉鲜嫩，酱汁浓郁，下饭神器",
        category="快餐",
        restaurant_name="杨铭宇黄焖鸡",
        image_url="https://picsum.photos/400/600?random=31",
        rating=4.5,
        tags=["鸡肉", "米饭", "炖", "下饭"],
        price=22.0,
        icon_type="rice"
    ),
    Dish(
        id="dish_032",
        name="兰州拉面",
        description="西北特色，面条劲道，汤清味美，经济实惠",
        category="快餐",
        restaurant_name="马子禄拉面",
        image_url="https://picsum.photos/400/600?random=32",
        rating=4.4,
        tags=["牛肉", "面食", "汤", "清真"],
        price=15.0,
        icon_type="noodle"
    ),
    
    # ==================== 小吃 ====================
    Dish(
        id="dish_037",
        name="肉夹馍",
        description="陕西名吃，馍酥肉香，肥而不腻，街头美食",
        category="小吃",
        restaurant_name="魏家凉皮",
        image_url="https://picsum.photos/400/600?random=37",
        rating=4.6,
        tags=["猪肉", "面食", "陕西", "经典"],
        price=12.0,
        icon_type="pig"
    ),
    Dish(
        id="dish_040",
        name="酸辣粉",
        description="重庆小吃，粉条爽滑，酸辣开胃，回味无穷",
        category="小吃",
        restaurant_name="好又来",
        image_url="https://picsum.photos/400/600?random=40",
        rating=4.5,
        tags=["面食", "酸", "辣", "重庆"],
        price=12.0,
        icon_type="noodle"
    ),
]
