import requests

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("《犹豫就会饿死》API v2.0 - 完整接口测试")
print("=" * 60)

# 1. 访问首页
print("\n1️⃣  访问首页...")
response = requests.get(f"{BASE_URL}/")
print(f"状态码：{response.status_code}")
print(f"响应：{response.json()}")

# 2. 用户注册
print("\n2️⃣  用户注册...")
register_data = {
    "username": "test_user",
    "password": "123456",
    "email": "test@example.com"
}
response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
print(f"状态码：{response.status_code}")
if response.status_code == 200:
    reg_result = response.json()
    print(f"响应：{reg_result}")
    user_id = reg_result["userId"]
    token = reg_result["token"]
    print(f"✅ 注册成功，user_id: {user_id}, token: {token[:20]}...")
else:
    print(f"❌ 错误：{response.json()}")
    # 如果已存在，直接登录
    login_data = {"username": "test_user", "password": "123456"}
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    reg_result = response.json()
    token = reg_result["token"]
    print(f"✅ 登录成功，token: {token[:20]}...")

# 3. 获取用户设置
print("\n3️⃣  获取用户设置...")
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/api/user/settings", params={"token": token})
print(f"状态码：{response.status_code}")
if response.status_code == 200:
    print(f"设置：{response.json()}")

# 4. 更新用户设置（排雷）
print("\n4️⃣  更新用户设置（排除辣味和香菜）...")
settings_update = {
    "excluded_flavors": ["辣"],
    "excluded_ingredients": ["香菜"]
}
response = requests.put(f"{BASE_URL}/api/user/settings", params={"token": token}, json=settings_update)
print(f"状态码：{response.status_code}")
if response.status_code == 200:
    print(f"✅ {response.json()}")

# 5. 获取食物类别
print("\n5️⃣  获取所有食物类别...")
response = requests.get(f"{BASE_URL}/api/foods/categories")
print(f"状态码：{response.status_code}")
if response.status_code == 200:
    categories = response.json()["categories"]
    print(f"类别：{categories}")

# 6. 智能推荐（想吃 + 川菜）
print("\n6️⃣  智能推荐：想吃川菜...")
recommend_request = {
    "intent": "想吃",
    "selected_categories": ["川菜"],
    "excluded_flavors": [],
    "excluded_ingredients": []
}
response = requests.post(f"{BASE_URL}/api/decision/recommend", 
                         params={"token": token}, 
                         json=recommend_request)
print(f"状态码：{response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"推荐菜品：{result['recommendation']['name'] if result['recommendation'] else '无'}")
    print(f"置信度：{result['confidence']}")
    print(f"消息：{result['message']}")
    if result['recommendation']:
        dish_id = result['recommendation']['id']
        print(f"菜品 ID: {dish_id}")

# 7. 保存决策
print("\n7️⃣  保存决策...")
if result['recommendation']:
    response = requests.post(f"{BASE_URL}/api/decision/save", 
                             params={"token": token, "dish_id": dish_id, "decision": "accepted"})
    print(f"状态码：{response.status_code}")
    if response.status_code == 200:
        print(f"✅ 决策已保存")

# 8. 获取历史记录
print("\n8️⃣  获取历史记录...")
response = requests.get(f"{BASE_URL}/api/user/history", 
                        params={"token": token, "limit": 10, "offset": 0})
print(f"状态码：{response.status_code}")
if response.status_code == 200:
    history = response.json()
    print(f"历史记录总数：{history['total']}")
    if history['history']:
        print(f"第一条记录：{history['history'][0]}")

# 9. 标记收藏
print("\n9️⃣  标记收藏...")
if history['history']:
    history_id = history['history'][0]['id']
    response = requests.put(f"{BASE_URL}/api/user/history/{history_id}/favorite",
                            params={"token": token})
    print(f"状态码：{response.status_code}")
    if response.status_code == 200:
        print(f"✅ 已标记为收藏")

# 10. 再次推荐（不想吃西餐）
print("\n🔟  智能推荐：不想吃西餐...")
recommend_request = {
    "intent": "不想吃",
    "selected_categories": ["西餐"],
    "excluded_flavors": [],
    "excluded_ingredients": []
}
response = requests.post(f"{BASE_URL}/api/decision/recommend", 
                         params={"token": token}, 
                         json=recommend_request)
print(f"状态码：{response.status_code}")
if response.status_code == 200:
    result = response.json()
    print(f"推荐菜品：{result['recommendation']['name'] if result['recommendation'] else '无'}")
    print(f"置信度：{result['confidence']}")
    print(f"消息：{result['message']}")

print("\n" + "=" * 60)
print("✅ 所有测试完成！")
print("=" * 60)
