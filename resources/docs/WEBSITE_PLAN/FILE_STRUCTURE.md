# eagle2ae_web 文件目录结构文档

## 项目目录结构 (Project Directory Structure)

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

## 目录详细说明 (Directory Details)

### /src/components (组件目录)
- **ActionGroup.vue** - 动作组组件
- **ConfettiEffect.vue** - 彩带效果组件
- **DocsLink.vue** - 文档链接组件
- **Download.vue** - 下载组件
- **DragToTop.vue** - 拖拽返回顶部组件，通过拖拽操作实现页面滚动到顶部功能
- **FeatureCardNav.vue** - 功能卡片导航组件
- **FeatureDetail.vue** - 功能详情组件
- **Features.vue** - 功能组件
- **Footer.vue** - 页脚组件
- **HelloWorld.vue** - 示例组件
- **Hero.vue** - Hero 区域组件
- **HorizontalScrollFeatures.vue** - 水平滚动功能组件
- **Navbar.vue** - 导航栏组件
- **OtherFeatures.vue** - 其他功能组件

### /src/views (视图目录)
- **AE_Preview.vue** - AE 预览页面
- **Download.vue** - 下载页面
- **Eagle_Preview.vue** - Eagle 预览页面
- **Home.vue** - 首页

### /src/utils (工具目录)
- **ConfettiCannon.js** - 使用 GSAP 实现的动画工具类

### /src/router (路由目录)
- **index.js** - 定义应用程序的路由配置