# API 测试用例 & cURL 命令

可以用这些命令直接测试后端API是否正常工作。

---

## 1️⃣ 用户快速测试

### 注册用户
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass123","email":"test@example.com"}'
```

**返回示例:**
```json
{
  "success": true,
  "userId": "user_12345",
  "token": "token_abc123def456"
}
```

💾 **保存返回的 token，后续所有请求都需要用到**

---

## 2️⃣ 获取菜系列表

```bash
curl http://localhost:8000/api/foods/categories
```

**返回示例:**
```json
{
  "categories": [
    "川菜",
    "湘菜",
    "粤菜",
    "日料",
    "西餐",
    "火锅",
    "快餐",
    "小吃"
  ]
}
```

---

## 3️⃣ 获取推荐菜品 (核心功能)

```bash
# 替换 token_xxx 为上面获取的实际 token

# 想吃某类菜
curl -X POST http://localhost:8000/api/decision/recommend?token=token_abc123def456 \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "想吃",
    "selected_categories": ["川菜"],
    "excluded_flavors": [],
    "excluded_ingredients": []
  }'

# 不想吃某类菜
curl -X POST http://localhost:8000/api/decision/recommend?token=token_abc123def456 \
  -H "Content-Type: application/json" \
  -d '{
    "intent": "不想吃",
    "selected_categories": ["辣的"],
    "excluded_flavors": ["辣"],
    "excluded_ingredients": []
  }'
```

**返回示例:**
```json
{
  "recommendation": {
    "id": "dish_001",
    "name": "红烧肉",
    "description": "经典川菜，肥而不腻，甜咸适口",
    "category": "川菜",
    "restaurant_name": "川香阁",
    "image_url": "https://picsum.photos/400/600?random=1",
    "rating": 4.8,
    "tags": ["猪肉", "甜", "下饭", "经典"],
    "price": 58.0,
    "icon_type": "pig"
  },
  "confidence": 0.95,
  "message": "为您推荐这道菜"
}
```

---

## 4️⃣ 保存用户决策

```bash
# 右滑接受
curl -X POST http://localhost:8000/api/decision/save?token=token_abc123def456&dish_id=dish_001&decision=accepted

# 左滑拒绝
curl -X POST http://localhost:8000/api/decision/save?token=token_abc123def456&dish_id=dish_001&decision=rejected
```

**返回示例:**
```json
{
  "success": true
}
```

---

## 5️⃣ 获取用户设置 (排雷)

```bash
curl http://localhost:8000/api/user/settings?token=token_abc123def456
```

**返回示例:**
```json
{
  "userId": "user_12345",
  "excluded_flavors": [],
  "excluded_ingredients": [],
  "last_updated": "2026-04-14T10:15:45.862576"
}
```

---

## 6️⃣ 更新用户设置

```bash
curl -X PUT http://localhost:8000/api/user/settings?token=token_abc123def456 \
  -H "Content-Type: application/json" \
  -d '{
    "excluded_flavors": ["辣", "酸"],
    "excluded_ingredients": ["香菜", "葱"]
  }'
```

**返回示例:**
```json
{
  "success": true,
  "message": "设置已更新"
}
```

---

## 7️⃣ 获取历史记录

```bash
# 获取最近10条
curl http://localhost:8000/api/user/history?token=token_abc123def456&limit=10&offset=0
```

**返回示例:**
```json
{
  "history": [
    {
      "id": "hist_001",
      "food_id": "dish_001",
      "food_name": "红烧肉",
      "decision": "accepted",
      "timestamp": "2026-04-14T10:30:00",
      "is_favorite": true
    }
  ],
  "total": 1
}
```

---

## 8️⃣ 标记为收藏

```bash
curl -X PUT http://localhost:8000/api/user/history/hist_001/favorite?token=token_abc123def456
```

**返回示例:**
```json
{
  "success": true
}
```

---

## 🧪 完整测试流程脚本

将下面的脚本保存为 `test.sh`，可以一键测试整个流程：

```bash
#!/bin/bash

echo "🚀 开始API测试..."

# 1. 注册用户
echo -e "\n1️⃣ 注册用户"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser$(date +%s)\",\"password\":\"pass123\"}")

echo "$REGISTER_RESPONSE" | python -m json.tool
TOKEN=$(echo "$REGISTER_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['token'])")
echo "✅ Token: $TOKEN"

# 2. 获取菜系
echo -e "\n2️⃣ 获取菜系列表"
curl -s http://localhost:8000/api/foods/categories | python -m json.tool

# 3. 获取推荐
echo -e "\n3️⃣ 获取推荐菜品"
cat > /tmp/recommend.json << 'EOF'
{"intent":"想吃","selected_categories":["川菜"],"excluded_flavors":[],"excluded_ingredients":[]}
EOF
RECOMMEND_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/decision/recommend?token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/recommend.json)
echo "$RECOMMEND_RESPONSE" | python -m json.tool
DISH_ID=$(echo "$RECOMMEND_RESPONSE" | python -c "import sys, json; print(json.load(sys.stdin)['recommendation']['id'])" 2>/dev/null)

# 4. 保存决策
echo -e "\n4️⃣ 保存用户决策"
curl -s -X POST "http://localhost:8000/api/decision/save?token=$TOKEN&dish_id=$DISH_ID&decision=accepted" | python -m json.tool

# 5. 获取设置
echo -e "\n5️⃣ 获取用户设置"
curl -s "http://localhost:8000/api/user/settings?token=$TOKEN" | python -m json.tool

# 6. 更新设置
echo -e "\n6️⃣ 更新用户设置"
cat > /tmp/settings.json << 'EOF'
{"excluded_flavors":["辣"],"excluded_ingredients":["香菜"]}
EOF
curl -s -X PUT "http://localhost:8000/api/user/settings?token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/settings.json | python -m json.tool

# 7. 获取历史
echo -e "\n7️⃣ 获取历史记录"
curl -s "http://localhost:8000/api/user/history?token=$TOKEN" | python -m json.tool

echo -e "\n✅ 测试完成！"
```

运行方式:
```bash
bash test.sh
```

---

## 🔍 错误代码说明

| 状态码 | 含义 | 处理 |
|--------|------|------|
| 200 | 成功 | 继续正常流程 |
| 400 | 请求参数错误 | 检查请求格式 |
| 401 | 未授权（Token无效） | 重新登录 |
| 404 | 资源不存在 | 检查ID是否正确 |
| 500 | 服务器错误 | 检查后端日志 |

---

## 📱 前端调用示例 (React)

### 基础API服务类
```javascript
class ApiService {
  constructor(baseURL = 'http://localhost:8000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = new URL(endpoint, this.baseURL);
    
    // 自动添加 token 参数
    if (this.token && !endpoint.includes('/auth/')) {
      url.searchParams.append('token', this.token);
    }
    
    const response = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    
    if (response.status === 401) {
      // Token过期，重新登录
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return response.json();
  }

  // 注册
  register(username, password, email) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email })
    });
  }

  // 登录
  login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  // 获取菜系
  getCategories() {
    return this.request('/api/foods/categories');
  }

  // 获取推荐
  getRecommendation(intent, categories, excludedFlavors, excludedIngredients) {
    return this.request('/api/decision/recommend', {
      method: 'POST',
      body: JSON.stringify({
        intent,
        selected_categories: categories,
        excluded_flavors: excludedFlavors,
        excluded_ingredients: excludedIngredients
      })
    });
  }

  // 保存决策
  saveDecision(dishId, decision) {
    const url = new URL('/api/decision/save', this.baseURL);
    url.searchParams.append('token', this.token);
    url.searchParams.append('dish_id', dishId);
    url.searchParams.append('decision', decision);
    
    return fetch(url.toString(), { method: 'POST' }).then(r => r.json());
  }

  // 获取设置
  getSettings() {
    return this.request('/api/user/settings');
  }

  // 更新设置
  updateSettings(excludedFlavors, excludedIngredients) {
    return this.request('/api/user/settings', {
      method: 'PUT',
      body: JSON.stringify({
        excluded_flavors: excludedFlavors,
        excluded_ingredients: excludedIngredients
      })
    });
  }

  // 获取历史
  getHistory(limit = 10, offset = 0) {
    const url = new URL('/api/user/history', this.baseURL);
    url.searchParams.append('token', this.token);
    url.searchParams.append('limit', limit);
    url.searchParams.append('offset', offset);
    
    return fetch(url.toString()).then(r => r.json());
  }
}

// 使用示例
const api = new ApiService();

// 注册
const registerResp = await api.register('user1', 'pass123', 'user@example.com');
localStorage.setItem('token', registerResp.token);

// 获取推荐
const recommendation = await api.getRecommendation('想吃', ['川菜'], [], []);
console.log('推荐菜品:', recommendation.recommendation.name);

// 保存决策
await api.saveDecision(recommendation.recommendation.id, 'accepted');
```

---

## 🎯 前端集成检查清单

- [ ] API基础服务类已实现
- [ ] Token存储和读取已实现
- [ ] 所有接口都已集成
- [ ] 错误处理已实现（尤其是401）
- [ ] 加载状态已实现（loading spinner）
- [ ] 所有接口已手动测试
- [ ] 错误信息已友好展示
- [ ] 网络超时处理已实现

