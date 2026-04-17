# 犹豫就会饿死 (MealPicker) - 前端工程架构解读

本项目使用 React 19 + Vite + Tailwind CSS 构建。以下是本前端工程 (`FOOD-Frontend`) 的核心目录结构与各个文件的作用解析。

## 1. 根目录 (工程配置层)
这些文件不参与页面的视觉呈现，但决定了项目如何安装、打包和规范运行：
* **`index.html`**: 整个网页的绝对总入口。React 会把所有组件“画”到这个文件内部的 `<div id="root"></div>` 中。
* **`package.json` & `package-lock.json`**: 记录了项目的基础信息、启动脚本（如 `npm run dev`）以及所有第三方前端库（如 React, Tailwind 等）的依赖清单。
* **`vite.config.js`**: Vite 打包构建工具的配置文件，负责极速热更新以及最终打包。
* **`tailwind.config.js` & `postcss.config.js`**: Tailwind CSS 样式引擎的配置文件。用于配置项目专属的主题色（如 Primary 橙色）、间距、字体的自定义标准。
* **`eslint.config.js`**: 代码规范检查工具的配置，防止出现低级语法错误。
* **`.gitignore`**: Git 版本控制配置，声明不需要被代码管家同步的缓存文件或目录（如 `node_modules`）。

---

## 2. `src/` 目录 (核心源码层)
这是日常业务代码的聚集地：
* **`main.jsx`**: JavaScript 的启动总枢纽，负责把 `App.jsx` 这个总路由挂载到 `index.html` 节点里。
* **`App.jsx`**: 最顶层的总控组件，用于配置整个 App 的路由字典和全局上下文结构。
* **`index.css` & `App.css`**: 全局的样式基础设置。特别是 `index.css`，配置了 Tailwind 的核心工具库引入。

---

## 3. 按职责划分的核心业务目录

### 📂 `src/pages/` （主页面视图）
包含手机屏幕上呈现的一大整屏，即各个路由节点对应的页面：
* **`Splash.jsx`**: 闪屏页/开屏动画。
* **`Auth.jsx`**: 账号系统页，包含注册和登录表单。
* **`Home.jsx`**: 【主阵地】类别意向选择主页。处理“想吃/不想吃”双数组意向。
* **`Swipe.jsx`**: 【核心流】滑动决策流页面。展示单张餐饮卡片，支持手势或按钮决定 Pick 还是 Pass。
* **`Result.jsx`**: 揭晓结果页面，展示最终决定去哪吃。
* **`Failure.jsx`**: “天灾”安慰页面，当过滤后菜品库为空时展示。
* **`Settings.jsx`**: 用户配置“避雷阵”的页面，预先设置忌口的口味和食材。
* **`History.jsx`**: 历史与收藏页面，记录过往滑卡记录和点过赞的美味。

### 📂 `src/components/` （可复用 UI 组件）
* **`BottomNav.jsx`**: 底部四大导航悬浮栏（Home, Decision, History, Profile），为独立封装的公共组件。

### 📂 `src/api/` （后端通信层）
* **`client.js`**: 核心网络封装类。统一向 Python 后端发起的请求逻辑、拼接地址、注入 Token，供其它页面无脑调用。

### 📂 `src/utils/` （工具箱）
* **`storage.js`**: Web 存储区管理封装，负责持久化存取 token、短期业务状态等数据。

### 📂 `src/hooks/` （React 状态抽离）
* **`useAuth.jsx`**: 前端鉴权自定义 Hook。将登录、登出、校验 Token 等逻辑高度抽象化。
