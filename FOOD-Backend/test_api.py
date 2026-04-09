import requests

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("《犹豫就会饿死》API 测试")
print("=" * 60)

# 1. 测试根路径
print("\n1️⃣  访问首页...")
response = requests.get(f"{BASE_URL}/")
print(f"状态码：{response.status_code}")
print(f"响应：{response.json()}")

# 2. 获取推荐菜品
print("\n2️⃣  获取推荐菜品...")
response = requests.get(f"{BASE_URL}/v1/recommend")
print(f"状态码：{response.status_code}")
data = response.json()
print(f"品类：{data['category']}")
print(f"消息：{data['message']}")
print(f"菜品数量：{len(data['dishes'])}")
if data['dishes']:
    print("\n前 3 道菜品:")
    for i, dish in enumerate(data['dishes'][:3], 1):
        print(f"  {i}. {dish['name']} - {dish['restaurant_name']} (￥{dish['price']})")

# 3. 模拟滑动操作
if data['dishes']:
    first_dish_id = data['dishes'][0]['id']
    print(f"\n3️⃣  右滑第一道菜：{first_dish_id}...")
    response = requests.post(
        f"{BASE_URL}/v1/swipe",
        json={"dish_id": first_dish_id, "direction": "right"}
    )
    print(f"状态码：{response.status_code}")
    print(f"响应：{response.json()}")
    
    second_dish_id = data['dishes'][1]['id']
    print(f"\n4️⃣  左滑第二道菜：{second_dish_id}...")
    response = requests.post(
        f"{BASE_URL}/v1/swipe",
        json={"dish_id": second_dish_id, "direction": "left"}
    )
    print(f"状态码：{response.status_code}")
    print(f"响应：{response.json()}")

# 5. 获取最终结果
print("\n5️⃣  获取最终结果...")
response = requests.get(f"{BASE_URL}/v1/result")
if response.status_code == 200:
    data = response.json()
    print(f"状态码：{response.status_code}")
    print(f"今日钦定：{data['dish']['name']}")
    print(f"餐厅：{data['dish']['restaurant_name']}")
    print(f"价格：￥{data['dish']['price']}")
else:
    print(f"状态码：{response.status_code}")
    print(f"错误：{response.json()['detail']}")

# 6. 重置会话
print("\n6️⃣  重置会话...")
response = requests.post(f"{BASE_URL}/v1/reset")
print(f"状态码：{response.status_code}")
print(f"响应：{response.json()}")

print("\n" + "=" * 60)
print("✅ 所有测试完成！")
print("=" * 60)
