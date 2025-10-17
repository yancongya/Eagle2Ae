# eagle2ae_web 项目综合文档

## 1. 技术栈 (Technical Stack)

### 前端框架与库 (Frontend Frameworks & Libraries)
- **Vue 3** (Composition API) - 渐进式 JavaScript 框架
- **Vue Router 4** - Vue.js 的路由解决方案
- **@vueuse/core** - Vue 组合式工具库集合
- **GSAP (GreenSock Animation Platform)** - 专业级动画库
- **Splitpanes** - 用于可调整大小窗格的 Vue 组件

### 样式与 UI (Styling & UI)
- **Tailwind CSS** - 实用优先的 CSS 框架
- CSS 过渡动画用于页面切换效果

### 构建工具 (Build Tools)
- **Vite** - 下一代前端构建工具
- **PostCSS** - CSS 处理工具
- **Autoprefixer** - CSS 供应商前缀工具

### 开发环境 (Development Environment)
- JavaScript (ES6+)
- Node.js 运行时
- 包管理器 (基于根目录的 pnpm 工作空间)

## 2. 文本内容 (Text Content)

### 主要标题
- "Eagle 与 AE 的无缝桥梁" (Seamless Bridge between Eagle and AE)

### 导航菜单 (Navigation Menu)
- "首页" (Home)
- "AE 预览" (AE Preview)
- "Eagle 预览" (Eagle Preview)
- "详细文档" (Documentation)
- "下载" (Download)

### 功能特性描述 (Feature Descriptions)
1. **AE: 拖拽导入** - 支持从 Eagle、本地、剪贴板等多种来源导入素材
2. **AE: 导入模式** - 选择直接链接、项目旁复制或指定文件夹，安全管理项目文件
3. **AE: 导入行为** - 控制素材是仅入库，还是自动添加到时间轴，或创建为独立预合成
4. **AE: 导出图层** - 将 AE 中的任何图层或预合成快速导出为图片，方便归档和分享
5. **AE: 预设管理** - 保存和加载个性化工作流配置，在不同项目间一键切换
6. **Eagle: 扩展通信** - 实现 AE 与 Eagle 扩展的后台通信，确保数据流畅同步

### 页面内容 (Page Content)
- 下载页面提供 AE 和 Eagle 扩展的下载选项
- 首页包含 Hero 区域和六个功能详情区域
- 预览页面使用 Splitpanes 组件提供多视图预览

## 3. 函数功能 (Function Features)

### 核心功能 (Core Features)
- **路由系统** - 4 个主要路由：首页、AE 预览、Eagle 预览、下载页
- **响应式导航** - 带有深色/浅色主题切换功能
- **页面过渡** - 页面间的平滑过渡动画
- **预览功能** - 使用 Splitpanes 组件在 iframe 中显示扩展界面的多视图
- **下载页面** - 为 AE 和 Eagle 分别提供扩展下载卡
- **Hero 部分** - 带有动画功能卡，点击可平滑滚动到详细区域
- **深色模式** - 使用 @vueuse/core 实现的主题切换
- **分割视图界面** - 用于在不同布局中预览扩展

### 组件功能 (Component Features)
- **Navbar** - 固定头部导航，带有主题切换和下载按钮
- **Hero** - 包含主标题和功能卡片的顶部区域
- **FeatureDetail** - 交错布局的图文详情组件
- **Footer** - 页脚组件
- **DragToTop** - 拖拽返回顶部功能组件，通过在页面任意空白处拖拽操作实现页面滚动到顶部
- **AE_Preview/Eagle_Preview** - 使用 Splitpanes 组件的预览界面

### 交互功能 (Interactive Features)
- 点击 Hero 中的卡片，页面会平滑滚动到对应的 FeatureDetail 板块
- 悬浮时功能卡片有上浮和放大的效果
- 支持深色/浅色主题切换
- 页面间的过渡动画效果
- DragToTop 组件：通过拖拽操作返回页面顶部

## 4. 文件目录结构 (File Directory Structure)

```
apps/eagle2ae_web/
├── .vscode/                    # VS Code 设置
├── node_modules/               # 依赖包
├── public/                     # 静态资源
│   ├── extensions/             # 扩展预览文件
│   │   ├── ae/                 # After Effects 扩展预览
│   │   └── eagle/              # Eagle 扩展预览
│   ├── images/                 # 图像资源
│   ├── Cursor.png              # 自定义光标资源
│   └── vite.svg                # Vite 标志
├── src/                        # 源代码
│   ├── assets/                 # 静态资源
│   ├── components/             # Vue 组件
│   │   ├── ActionGroup.vue
│   │   ├── ConfettiEffect.vue
│   │   ├── DocsLink.vue
│   │   ├── Download.vue
│   │   ├── DragToTop.vue
│   │   ├── FeatureCardNav.vue
│   │   ├── FeatureDetail.vue
│   │   ├── Features.vue
│   │   ├── Footer.vue
│   │   ├── HelloWorld.vue
│   │   ├── Hero.vue
│   │   ├── HorizontalScrollFeatures.vue
│   │   ├── Navbar.vue
│   │   └── OtherFeatures.vue
│   ├── router/                 # 路由配置
│   │   └── index.js            # 路由定义
│   ├── utils/                  # 工具函数
│   │   └── ConfettiCannon.js   # GSAP 动画工具
│   ├── views/                  # 页面组件
│   │   ├── AE_Preview.vue      # AE 扩展预览页面
│   │   ├── Download.vue        # 下载页面
│   │   ├── Eagle_Preview.vue   # Eagle 扩展预览页面
│   │   └── Home.vue            # 主页
│   ├── App.vue                 # 主应用组件
│   ├── main.js                 # 应用入口点
│   └── style.css               # 全局样式
├── .gitignore                  # Git 忽略规则
├── index.html                  # HTML 模板
├── package.json                # 项目元数据和依赖
├── postcss.config.js           # PostCSS 配置
├── README.md                   # 项目文档
├── tailwind.config.js          # Tailwind CSS 配置
└── vite.config.js              # Vite 构建配置
```

## 5. TODO 功能 (TODO Functionality)

### 当前项目中的待办事项 (Current Project TODOs)

基于对项目代码的分析，当前 web 应用中没有发现 TODO 注释。但根据 `resources/docs/WEBSITE_PLAN/WEBSITE_PLAN.md` 文档中的记录，有待完成的功能：

- **Navbar 滚动效果** - 添加导航栏的滚动交互效果
- **其他动画效果** - 实现额外的交互动画

### 已完成的功能 (Completed Features)
- Hero 区域的动画和交互（标题更新、卡片动画等）
- FeatureDetail 组件的滚动触发动画
- 彩带效果的尝试实现（最终因兼容性问题移除）

### 扩展功能建议 (Suggested Extensions)
1. **性能优化** - 实现组件懒加载和代码分割
2. **可访问性** - 添加键盘导航和屏幕阅读器支持
3. **国际化** - 支持多语言切换
4. **SEO 优化** - 添加 meta 标签和结构化数据
5. **错误处理** - 改进错误边界的实现

## 6. 项目总结 (Project Summary)

eagle2ae_web 是一个 Vue 3 驱动的网站项目，旨在展示和提供 Eagle 与 After Effects 扩展的下载。项目采用了现代化的前端技术栈，包括 Vite 构建工具、Tailwind CSS 样式框架和 Vue Router 路由系统。网站提供了清晰的功能展示、预览界面和下载选项，支持深色模式和响应式设计，为用户提供良好的浏览体验。

项目结构清晰，组件化程度高，便于维护和扩展。通过 Splitpanes 组件实现了创新的多视图预览功能，使用户能够更好地了解扩展的功能和界面。