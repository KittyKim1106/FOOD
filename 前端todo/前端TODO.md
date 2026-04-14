# 🚀 前端开发任务清单

**项目**: 犹豫就会饿死 (Food Picker)  
**前端状态**: ⏳ 准备开发  
**类型**: React + Tailwind CSS  
**预计周期**: 2周 (40小时)

---

## 📋 任务总览

### 一览表
| 阶段 | 任务数 | 优先级 | 工时 | 状态 |
|------|--------|--------|------|------|
| 基础架构 | 4个 | 🔴 | 9h | ⏳ |
| 核心功能 | 4个 | 🔴 | 15h | ⏳ |
| 辅助功能 | 2个 | 🟠 | 6h | ⏳ |
| 优化完善 | 4个 | 🟡 | 10h | ⏳ |
| **合计** | **14** | - | **40h** | ⏳ |

---

## 🔧 第一阶段：基础架构 (9小时)

### 1.1 项目环境搭建
- [ ] 初始化 React 项目
- [ ] 安装依赖包
  - react-router-dom
  - tailwindcss
- [ ] 创建项目文件结构
  ```
  src/
  ├── api/           // API服务
  ├── pages/         // 页面组件
  ├── components/    // 通用组件
  ├── hooks/         // 自定义hooks
  ├── utils/         // 工具函数
  └── App.jsx
  ```

### 1.2 创建 API 服务类 ⭐
**文件**: `src/api/client.js`

- [ ] 创建 ApiClient 类
- [ ] 方法清单：
  - [ ] `register(username, password, email)`
  - [ ] `login(username, password)`
  - [ ] `getCategories()`
  - [ ] `getRecommendation(intent, categories, flavors, ingredients)`
  - [ ] `saveDecision(dishId, decision)`
  - [ ] `getSettings()`
  - [ ] `updateSettings(flavors, ingredients)`
  - [ ] `getHistory(limit, offset)`
  - [ ] `markFavorite(historyId)`

**验收标准**:
- ✅ 所有方法都能正确调用
- ✅ 返回值为 Promise
- ✅ URL 正确包含 token 参数

### 1.3 Token 管理系统
**文件**: `src/utils/storage.js` 和 `src/hooks/useAuth.js`

- [ ] 实现 token 存储函数
  - [ ] `setToken(token)`
  - [ ] `getToken()`
  - [ ] `removeToken()`
  - [ ] `isTokenValid()`

- [ ] 创建 `useAuth` hook
  ```javascript
  const { token, userId, login, logout, isLoggedIn } = useAuth()
  ```

**验收标准**:
- ✅ 刷新页面后 token 仍存在
- ✅ 登出后 token 被清除
- ✅ 所有组件都能访问 token

### 1.4 错误处理和加载组件
- [ ] 创建统一错误处理函数
- [ ] 创建 Loading 组件
- [ ] 创建错误提示组件
- [ ] 处理 API 错误
  - [ ] 401 错误 → 跳转登录页
  - [ ] 其他错误 → 显示友好提示
  - [ ] 网络错误 → 显示离线提示

**验收标准**:
- ✅ 所有 API 错误都被捕获
- ✅ 用户看到友好的错误提示
- ✅ 加载状态正确显示

---

## 🎯 第二阶段：核心功能 (15小时) ⭐

### 2.1 用户认证流程

**页面**: `src/pages/Auth.jsx`

- [ ] 创建登录表单
  - [ ] 用户名输入框
  - [ ] 密码输入框
  - [ ] 验证输入不为空
  - [ ] 显示加载状态
  - [ ] 错误提示

- [ ] 创建注册表单
  - [ ] 用户名输入框
  - [ ] 密码输入框
  - [ ] 邮箱输入框
  - [ ] 验证邮箱格式
  - [ ] 切换登录/注册

- [ ] 集成登录 API
  ```javascript
  1. 用户输入 → 验证
  2. 调用 api.login() → 获取token
  3. 保存 token 到 localStorage
  4. 跳转到首页
  ```

- [ ] 集成注册 API
  ```javascript
  1. 用户输入 → 验证
  2. 调用 api.register() → 获取token
  3. 自动登录并跳转到首页
  ```

**验收标准**:
- ✅ 能成功注册新用户
- ✅ 能成功登录现有用户
- ✅ Token 被正确保存
- ✅ 错误信息显示正确

### 2.2 首页 - 类别选择

**页面**: `src/pages/Home.jsx`

- [ ] 加载菜系列表
  ```javascript
  useEffect(() => {
    const categories = await api.getCategories()
    setCategories(categories)
  }, [])
  ```

- [ ] 显示菜系选择网格
  - [ ] 显示菜系图标和名称
  - [ ] 支持多选
  - [ ] 选中状态高亮

- [ ] 意向选择 (想吃/不想吃)
  - [ ] 单选按钮
  - [ ] 选中状态高亮

- [ ] "决定" 按钮
  - [ ] 验证选择不为空
  - [ ] 点击后跳转到卡片页

**验收标准**:
- ✅ 能加载菜系列表
- ✅ 能选中/取消菜系
- ✅ 能选择意向
- ✅ 逻辑正确

### 2.3 卡片页 - 推荐展示和交互 (最重要!)

**页面**: `src/pages/Swipe.jsx`

#### 2.3.1 加载推荐
- [ ] 页面效果时获取第一个推荐
  ```javascript
  useEffect(() => {
    const recommendation = await api.getRecommendation(
      intent, 
      selectedCategories, 
      excludedFlavors, 
      excludedIngredients
    )
    setCurrentDish(recommendation)
  }, [])
  ```

- [ ] 显示菜品卡片
  - [ ] 菜品图片
  - [ ] 菜品名称
  - [ ] 菜品描述
  - [ ] 评分
  - [ ] 价格
  - [ ] 标签

- [ ] 处理图片加载失败

**验收标准**:
- ✅ 卡片显示完整信息
- ✅ 图片能正确加载
- ✅ 排版美观

#### 2.3.2 卡片交互
- [ ] "Pass" 按钮 (左滑)
  ```javascript
  1. 调用 api.saveDecision(dishId, 'rejected')
  2. 获取下一条推荐
  3. 更新卡片
  ```

- [ ] "Save" 按钮 (收藏)
  ```javascript
  1. 调用 api.saveDecision(dishId, 'accepted')
  2. 调用 api.markFavorite(historyId)
  3. 显示成功提示
  4. 获取下一条推荐
  ```

- [ ] "Pick" 按钮 (右滑，主要行动)
  ```javascript
  1. 调用 api.saveDecision(dishId, 'accepted')
  2. 获取下一条推荐
  3. 更新卡片
  ```

- [ ] 处理推荐为空
  ```javascript
  if (!recommendation) {
    navigate('/failure')  // 跳转到全军覆没页面
  }
  ```

**验收标准**:
- ✅ 能成功保存决策
- ✅ 卡片能正确更新
- ✅ 用户能连续推荐多个菜品
- ✅ 无推荐时显示失败页

### 2.4 结果页面

**页面**: `src/pages/Result.jsx` 和 `src/pages/Failure.jsx`

#### 2.4.1 成功结果页
- [ ] 显示最终推荐菜品
  - [ ] 大图显示
  - [ ] 菜品名称（大字体）
  - [ ] 菜品描述
  - [ ] 匹配度显示

- [ ] 操作按钮
  - [ ] "附近哪有卖?" (可禁用)
  - [ ] "分享今日结果" (可禁用)
  - [ ] "返回主页"
  - [ ] "重新决策"

**验收标准**:
- ✅ 菜品信息完整
- ✅ 匹配度显示正确
- ✅ 按钮可交互

#### 2.4.2 失败页
- [ ] 显示 "全军覆没" 提示
- [ ] 显示失败原因
- [ ] 操作按钮
  - [ ] "大赦天下(重选一次)" → 回首页
  - [ ] "返回主页"

**验收标准**:
- ✅ 页面显示完整
- ✅ 按钮可交互

---

## 🔐 第三阶段：辅助功能 (6小时)

### 3.1 用户排雷设置

**页面**: `src/pages/Settings.jsx`

- [ ] 加载用户设置
  ```javascript
  useEffect(() => {
    const settings = await api.getSettings()
    setSettings(settings)
  }, [])
  ```

- [ ] 显示排雷选项
  - [ ] 味道排雷 (辣、酸、生食等)
  - [ ] 食材排雷 (香菜、内脏等)

- [ ] 保存设置
  ```javascript
  await api.updateSettings(flavors, ingredients)
  ```

**验收标准**:
- ✅ 能加载当前设置
- ✅ 能修改并保存
- ✅ 刷新后设置仍存在

### 3.2 历史记录页面

**页面**: `src/pages/History.jsx`

- [ ] 加载历史记录
  ```javascript
  const history = await api.getHistory(limit=10, offset=0)
  ```

- [ ] 显示历史列表
  - [ ] 菜品名称
  - [ ] 时间戳
  - [ ] 收藏状态

- [ ] 点击收藏功能
  ```javascript
  await api.markFavorite(historyId)
  ```

- [ ] 分页/加载更多

**验收标准**:
- ✅ 能加载历史记录
- ✅ 能标记收藏
- ✅ 分页正常

---

## ✨ 第四阶段：优化完善 (10小时)

### 4.1 UI 微调
- [ ] 响应式设计
  - [ ] 手机 (375px)
  - [ ] 平板 (768px)
  - [ ] 桌面 (1024px+)
- [ ] 暗黑模式支持
- [ ] 页面跳转动画
- [ ] 按钮交互效果

### 4.2 性能优化
- [ ] 图片懒加载
- [ ] API 缓存
- [ ] 代码分割

### 4.3 用户体验
- [ ] 加载状态显示
- [ ] 错误提示优化
- [ ] 成功反馈提示
- [ ] 动画完善

### 4.4 浏览器兼容
- [ ] Chrome 测试
- [ ] Firefox 测试
- [ ] Safari 测试

**验收标准**:
- ✅ 各种设备显示正常
- ✅ 用户体验流畅
- ✅ 性能达标

---

## 📖 API 快速参考

### 后端地址
```
http://localhost:8000
```

### 必需的 API 调用

#### 认证
```javascript
// 注册
POST /api/auth/register
{ username, password, email }

// 登录
POST /api/auth/login
{ username, password }
```

#### 推荐 (核心!)
```javascript
// 获取菜系
GET /api/foods/categories

// 获取推荐
POST /api/decision/recommend?token=xxx
{ intent, selected_categories, excluded_flavors, excluded_ingredients }

// 保存决策
POST /api/decision/save?token=xxx&dish_id=xxx&decision=xxx
```

#### 用户设置
```javascript
// 获取设置
GET /api/user/settings?token=xxx

// 更新设置
PUT /api/user/settings?token=xxx
{ excluded_flavors, excluded_ingredients }
```

#### 历史记录
```javascript
// 获取历史
GET /api/user/history?token=xxx&limit=10&offset=0

// 标记收藏
PUT /api/user/history/{id}/favorite?token=xxx
```

---

## 💻 代码示例

### API 服务类模板
```javascript
// src/api/client.js
class ApiClient {
  constructor(baseURL = 'http://localhost:8000') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const url = new URL(endpoint, this.baseURL);
    
    if (token && !endpoint.includes('/auth/')) {
      url.searchParams.append('token', token);
    }
    
    const response = await fetch(url.toString(), {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return response.json();
  }

  login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  // ... 其他方法
}

export const apiClient = new ApiClient();
```

### useAuth Hook 模板
```javascript
// src/hooks/useAuth.js
import { useState } from 'react';

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  return {
    token,
    userId,
    isLoggedIn: !!token,
    login: (newToken, newUserId) => {
      localStorage.setItem('token', newToken);
      localStorage.setItem('userId', newUserId);
      setToken(newToken);
      setUserId(newUserId);
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setToken(null);
      setUserId(null);
    }
  };
};
```

---

## ✅ 完成检查清单

### 每个任务完成后
- [ ] 在此文件中勾选复选框
- [ ] 代码已提交
- [ ] API 测试通过
- [ ] 没有 console.error

### 每个阶段完成后
- [ ] 所有任务都勾选
- [ ] 代码已 Review
- [ ] 功能测试完成
- [ ] 准备进入下一阶段

---

## 📊 完成度进度

```
第一阶段: [░░░░░░░░░░] 0%
第二阶段: [░░░░░░░░░░] 0%
第三阶段: [░░░░░░░░░░] 0%
第四阶段: [░░░░░░░░░░] 0%

总体进度: [░░░░░░░░░░] 0%
```

---

## 📞 需要帮助时

| 问题 | 查看 |
|------|------|
| API 规格 | 项目根目录 `前端对接需求.md` |
| API 测试 | 项目根目录 `API测试用例.md` |
| 快速查阅 | 项目根目录 `前端对接清单.md` |
| 后端状态 | 询问后端开发者 |

---

## 🎓 技术参考

- [React 官方文档](https://react.dev)
- [React Router 文档](https://reactrouter.com)
- [TailwindCSS 文档](https://tailwindcss.com)

---

**预计完成时间**: 2周  
**每天目标**: 3-5小时开发  

**祝开发顺利！** 🚀
