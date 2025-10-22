# eagle2ae_web 项目文档

欢迎来到 eagle2ae_web 项目文档！这里包含了项目的所有技术文档、架构说明、开发指南和最佳实践。

## 📚 文档目录

### 项目指南 (Guide)
- [**项目介绍与目标**](./guide/project-introduction.md) - 了解项目背景和核心目标
- [**系统架构概览**](./guide/architecture.md) - 项目整体架构设计
- [**开发指南**](./guide/development-guidelines.md) - 环境搭建和开发流程
- [**项目路线图**](./guide/roadmap.md) - 当前和未来版本规划
- [**技术栈详解**](./guide/tech-stack.md) - 项目使用的所有技术栈
- [**依赖包说明**](./guide/dependencies.md) - 第三方依赖详细说明
- [**构建系统配置**](./guide/build-system.md) - Vite 和构建配置
- [**动态配置系统**](./guide/dynamic-config.md) - 配置文件架构和加载机制
- [**部署配置**](./guide/deployment.md) - 部署相关配置
- [**完整功能清单**](./guide/complete-feature-list.md) - 项目所有功能的详细列表

### UI 组件 (UI)
- [**组件库概览**](./ui/component-library.md) - 所有 UI 组件说明
- [**导航组件**](./ui/navigation.md) - 导航栏和其他导航组件
- [**Hero 区域组件**](./ui/hero-section.md) - Hero 区域详细说明
- [**功能详情组件**](./ui/feature-details.md) - 功能详情展示组件
- [**预览组件**](./ui/preview-components.md) - Splitpanes 预览组件
- [**交互组件**](./ui/interactive-elements.md) - 拖拽返回顶部等组件
- [**语言切换器**](./ui/language-switcher.md) - 带动画的下拉语言切换器
- [**Splitpanes 预览**](./ui/splitpanes-preview.md) - 多窗格预览系统
- [**页脚组件**](./ui/footer-component.md) - 页脚组件说明

### 动画系统 (Animation)
- [**GSAP 集成说明**](./animation/gsap-integration.md) - GSAP 动画库集成
- [**滚动动画系统**](./animation/scroll-animations.md) - 滚动触发动画
- [**页面过渡动画**](./animation/page-transitions.md) - View Transitions API 和页面切换动画
- [**交互动画**](./animation/interactive-animations.md) - 用户交互动画
- [**高级动画与物理效果**](./animation/advanced-animations.md) - 彩带效果、自定义光标、主题注入
- [**动画性能优化**](./animation/animation-performance-optimization.md) - 性能优化策略

### 路由与导航 (Routing)
- [**路由架构**](./routing/route-architecture.md) - Vue Router 架构
- [**滚动行为管理**](./routing/scroll-behavior.md) - 滚动行为控制
- [**分页滚动系统**](./routing/paging-system.md) - 分页滚动实现
- [**导航逻辑处理**](./routing/navigation-logic.md) - 导航逻辑说明

### 内容管理 (Content)
- [**国际化系统**](./content/i18n-system.md) - vue-i18n 国际化实现
- [**语言切换机制**](./content/language-switching.md) - 多语言切换
- [**内容结构管理**](./content/content-structure.md) - 内容组织结构和缺失功能
- [**本地化指南**](./content/localization-guidelines.md) - 本地化最佳实践

### 功能详解 (Features)
- [**核心功能详解**](./features/core-features.md) - 项目核心功能
- [**扩展集成机制**](./features/extension-integration.md) - 扩展集成说明
- [**扩展主题模式同步**](./features/extension-theme-sync.md) - 明暗模式同步到扩展
- [**预览页面主题同步**](./features/preview-theme-sync.md) - 预览页面与扩展主题同步
- [**预览功能详解**](./features/preview-functionality.md) - 预览功能实现
- [**下载系统**](./features/download-system.md) - 下载功能实现
- [**用户交互功能**](./features/user-interactions.md) - 用户交互功能

### 样式与主题 (Styling)
- [**Tailwind 配置**](./styling/tailwind-config.md) - Tailwind CSS 配置
- [**深色模式实现**](./styling/dark-mode-implementation.md) - 深色模式实现
- [**响应式设计**](./styling/responsive-design.md) - 响应式设计策略
- [**设计系统**](./styling/design-system.md) - 设计系统规范

### 测试与质量保证 (Testing)
- [**测试策略**](./testing/testing-strategy.md) - 项目测试策略
- [**组件测试**](./testing/component-testing.md) - 组件测试方法
- [**用户验收标准**](./testing/user-acceptance.md) - 验收标准

### 维护管理 (Maintenance)
- [**代码维护指南**](./maintenance/code-maintenance.md) - 代码维护最佳实践
- [**性能监控**](./maintenance/performance-monitoring.md) - 性能监控策略
- [**Bug 跟踪流程**](./maintenance/bug-tracking.md) - Bug 管理流程
- [**发布管理**](./maintenance/release-management.md) - 版本发布流程

## 🚀 快速开始

如果你是新加入项目的开发者，建议按以下顺序阅读文档：

1. [项目介绍与目标](./guide/project-introduction.md) - 了解项目背景
2. [开发指南](./guide/development-guidelines.md) - 环境搭建和开发流程
3. [系统架构概览](./guide/architecture.md) - 了解整体架构
4. [技术栈详解](./guide/tech-stack.md) - 掌握核心技术

## 📄 版本历史

- **V17.5** (2025年10月) - 项目文档重构与功能完善完成，新增高级动画、动态配置、Splitpanes 预览等详细说明
- **V17.0** (2025年10月) - 项目文档重构完成，新增动画系统和国际化详细说明
- **V16.0** (2025年8月) - 完成主页重构与动画优化
- **V15.0** (2025年6月) - 实现分页滚动功能
- **V14.0** (2025年5月) - 添加拖拽返回顶部功能
- **V13.0** (2025年4月) - 实现国际化支持

---

*文档持续更新中...*