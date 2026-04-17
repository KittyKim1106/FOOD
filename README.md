# 犹豫就会饿死 (MealPicker)

## 项目简介
"犹豫就会饿死"（原设计名"食选 MealPicker"）是一个基于手势决策的轻量化餐饮推荐与选择系统。该项目旨在解决现代人每天面临的“不知道吃什么”难题，通过“品类抽取 + 左右滑选餐”的核心链路，以 Tinder 卡片滑动的交互体验帮助用户轻松、快速地决定吃什么。

## 🛠 技术栈组合
这是一个标准的前后端分离全栈项目：
* **前端 (FOOD-Frontend):** React 19 + Vite + Tailwind CSS 4 + React Router DOM
* **后端 (FOOD-Backend):** Python 3.10+ + FastAPI + Pydantic + Uvicorn

## ✨ 核心功能特性
1. **轻量认证与排雷设置**
   * 支持用户账号注册与登录鉴权（基于 Token）。
   * 支持全局“排坑”设置：用户可以配置自己不喜欢的口味（如“辣”、“酸”）和食材（如“香菜”、“葱”），推荐时会自动避开这些选项。

2. **智能餐品推荐系统**
   * **意图捕获：** 首页支持明确的选择意图（「想吃什么」或「不想吃什么」）及菜系分类筛选（如川菜、日料、火锅等）。
   * **算法过滤：** 后端根据用户传递的意图、品类以及个人排雷字典对菜品库做多维过滤，并附部署置信度，实现盲盒式的随机智能推荐。

3. **滑卡决策心流 (Swipe UI)**
   * 流畅的卡片式 UI 展示（菜品图片、名称、口味标签、评分等）。
   * 采用“右滑接受 (Accept)、左滑拒绝 (Discard)” 物理交互机制，增加决策趣味性。

4. **历史存档与收藏夹**
   * 记录用户的每一次决策（不管接受还是拒绝），支持翻阅。
   * 支持将好吃的、满意的决策单条加入“收藏”列表。

## 📂 项目目录结构
```text
FOOD/
├── FOOD-Backend/       # FastAPI 后端服务
│   ├── main.py         # 路由配置与内存业务逻辑
│   ├── models.py       # Pydantic 数据模型定义
│   ├── data/           # Mock 静态数据源（菜品库等）
│   └── requirements.txt# Python 依赖清单
├── FOOD-Frontend/      # React 前端交互界面
│   ├── src/
│   │   ├── api/        # 封装与后端的 API 通信层
│   │   ├── pages/      # 路由级页面 (Splash, Auth, Home, Swipe, Settings, etc.)
│   │   ├── hooks/      # 自定义 React Hooks (如 useAuth)
│   │   ├── components/ # 共享组件
│   │   └── App.jsx     # 前端入口组件
│   ├── package.json    # Node.js 依赖清单
│   └── tailwind.config.js # 样式配置
├── API测试用例.md        # 详细的 API 文档及可以直接运行的 cURL 自动化测试脚本
├── 需求.txt              # 初始版本的产品需求文档及系统设计草案
├── 前端todo/             # Frontend 迭代任务清单
└── chishenme/          # 其他附加资源
```

## 🚀 快速启动

### 启动后端 (FOOD-Backend)
请确保您的机器已安装 Python 3.10 并在后端目录运行以下命令：
```bash
cd FOOD-Backend
# 推荐使用虚拟环境: python -m venv .venv 并在激活后安装依赖
pip install -r requirements.txt
python main.py
# (此时后端 API 接口运行在 http://localhost:8000)
```

### 启动前端 (FOOD-Frontend)
请确保您的机器已安装 Node.js：
```bash
cd FOOD-Frontend
npm install
npm run dev
# (应用将运行在 Vite 分配的端口上，如 http://localhost:5173，请在浏览器中打开使用)
```

## 💡 架构备注
当前项目定义为“原型验证阶段”，为保证轻量化及低运行门槛：
- 后端数据持久化目前采用了 **内存数据结构 (Memory Maps)**，没有引入如 MySQL 等外部重型数据库配置（重启后端后用户注册信息和设置会被清空）。
- 菜品数据采用的是 Static Mocking 的方式集中定义，无需真实爬取商家 API，能确保项目的完整闭环演示效果。
