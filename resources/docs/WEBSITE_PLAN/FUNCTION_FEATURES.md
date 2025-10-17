# eagle2ae_web 函数功能文档

## 核心功能 (Core Features)
- **路由系统** - 4 个主要路由：首页、AE 预览、Eagle 预览、下载页
- **响应式导航** - 带有深色/浅色主题切换功能
- **页面过渡** - 页面间的平滑过渡动画
- **预览功能** - 使用 Splitpanes 组件在 iframe 中显示扩展界面的多视图
- **下载页面** - 为 AE 和 Eagle 分别提供扩展下载卡
- **Hero 部分** - 带有动画功能卡，点击可平滑滚动到详细区域
- **深色模式** - 使用 @vueuse/core 实现的主题切换
- **分割视图界面** - 用于在不同布局中预览扩展

## 组件功能 (Component Features)
- **Navbar** - 固定头部导航，带有主题切换和下载按钮
- **Hero** - 包含主标题和功能卡片的顶部区域
- **FeatureDetail** - 交错布局的图文详情组件
- **Footer** - 页脚组件
- **DragToTop** - 回到顶部功能组件
- **AE_Preview/Eagle_Preview** - 使用 Splitpanes 组件的预览界面

## 交互功能 (Interactive Features)
- 点击 Hero 中的卡片，页面会平滑滚动到对应的 FeatureDetail 板块
- 悬浮时功能卡片有上浮和放大的效果
- 支持深色/浅色主题切换
- 页面间的过渡动画效果
- DragToTop 组件：通过拖拽操作返回页面顶部