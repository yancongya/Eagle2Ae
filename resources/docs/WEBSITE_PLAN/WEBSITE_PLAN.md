### **官网开发规划 (V16 - 动画与交互迭代) - 更新版**

**第一部分：网站结构与布局 (骨架)**

1.  **技术栈**
    *   Vue 3 (Composition API) - 渐进式 JavaScript 框架
    *   Vue Router 4 - Vue.js 的路由解决方案
    *   @vueuse/core - Vue 组合式工具库集合
    *   GSAP (GreenSock Animation Platform) - 专业级动画库
    *   Splitpanes - 用于可调整大小窗格的 Vue 组件
    *   Tailwind CSS - 实用优先的 CSS 框架
    *   Vite - 下一代前端构建工具

2.  **页面路由规划**
    *   `/` - 首页 (Home.vue)
    *   `/ae-preview` - AE 预览 (AE_Preview.vue)
    *   `/eagle-preview` - Eagle 预览 (Eagle_Preview.vue)
    *   `/download` - 下载页面 (Download.vue)

3.  **全局应用骨架 (`App.vue`)**
    *   包含 `<Navbar />`, `<router-view />`, 和 `<DragToTop />` 组件
    *   实现页面过渡动画

4.  **首页组件骨架 (`Home.vue`)**
    *   `[Hero.vue]` (已包含卡片导航)
    *   `[FeatureDetail.vue]` (x6, 简化版，可复用组件)
    *   `[Footer.vue]`

5.  **布局与交互设计**
    *   **Hero**: 包含标题、预览按钮和六个功能卡片。
    *   **FeatureDetail**: 采用"左图右字"或"右图左字"的交错布局。
    *   **核心交互**: 点击 Hero 中的卡片，页面会平滑滚动到对应的 `FeatureDetail` 板块。

---
**第二部分：内容与文案 (血肉)**

1.  **Hero 板块**
    *   **主标题**: "Eagle 与 AE 的无缝桥梁"。
    *   **按钮**: "AE 预览", "Eagle 预览"
    *   **功能卡片**: 包含六个图文卡片，描述 AE 与 Eagle 扩展的核心功能。

2.  **功能详解区 (FeatureDetail)**
    *   包含六个功能的详细图文介绍:
        *   AE: 拖拽导入
        *   AE: 导入模式
        *   AE: 导入行为
        *   AE: 导出图层
        *   AE: 预设管理
        *   Eagle: 扩展通信
    *   每个功能详情采用交错布局展示

3.  **预览页面**
    *   使用 Splitpanes 组件实现多视图预览
    *   可同时展示扩展的不同界面

4.  **下载页面**
    *   提供 AE 扩展和 Eagle 扩展的下载选项
    *   显示兼容版本信息

---
**第三部分：开发步骤**

1.  **首页重构与动画 (已完成)**
    *   [x] Hero 标题更新为"Eagle 与 AE 的无缝桥梁"。
    *   [x] Hero 卡片动画：实现逐个进场效果，无角度变化。
    *   [x] Hero 卡片交互：悬浮时有上浮和放大的效果，点击平滑滚动到详情区。
    *   [x] Hero 区域布局调整：多次调整垂直位置和卡片大小。
    *   [x] `FeatureDetail.vue` 动画：实现滚动触发的"左右交错入场"动画。
    *   [x] `FeatureDetail.vue` 简化为纯图文交错布局。
    *   [x] `Home.vue` 中的 `features` 数据结构简化。

2.  **彩带效果 (已移除)**
    *   [x] 尝试实现 CodePen 彩带效果，但因 `Physics2DPlugin` 兼容性、时序问题及交互冲突，已决定暂时移除。

3.  **实现交互与动画 (当前状态)**
    *   [x] Navbar 滚动效果 - 已通过固定定位实现。
    *   [x] 其他动画效果 - 已实现页面过渡、卡片悬停、滚动触发动画等。
    *   [x] 深色模式切换功能。
    *   [x] 预览页面的 Splitpanes 分割视图功能。

---
**第四部分：文件结构**

1.  **主要目录**
    *   `src/components/` - 存放所有 Vue 组件
    *   `src/views/` - 存放页面级组件
    *   `src/router/` - 存放路由配置
    *   `src/utils/` - 存放工具函数
    *   `public/extensions/` - 存放扩展预览文件

2.  **核心组件**
    *   `Navbar.vue` - 导航栏组件，包含主题切换功能
    *   `Hero.vue` - Hero 区域组件，包含主标题和功能卡片
    *   `FeatureDetail.vue` - 功能详情组件，支持图文交错布局
    *   `AE_Preview.vue` - AE 扩展预览页面，使用 Splitpanes 组件
    *   `Eagle_Preview.vue` - Eagle 扩展预览页面，使用 Splitpanes 组件

---
**第五部分：扩展功能**

1.  **多视图预览**
    *   使用 Splitpanes 组件实现扩展界面的多角度预览
    *   支持拖动调整视图大小

2.  **主题切换**
    *   使用 @vueuse/core 的 useDark 实现深色/浅色主题切换
    *   主题设置保存在 localStorage 中

3.  **响应式设计**
    *   使用 Tailwind CSS 实现移动端和桌面端的响应式布局