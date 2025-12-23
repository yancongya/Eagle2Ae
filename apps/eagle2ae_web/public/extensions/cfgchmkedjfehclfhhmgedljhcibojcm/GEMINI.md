# GEMINI.md - Eagle 浏览器扩展代码库分析

## 项目概述

这个目录包含了 **Eagle 浏览器扩展** (版本 3.1.21) 的解压后源代码。该扩展旨在帮助用户高效地从网页上收集、整理和保存图片、截图及网页书签到 Eagle 桌面应用程序中。

这是一个基于 **JavaScript** 的浏览器扩展，核心前端框架为 **AngularJS (v1)**。它采用了模块化的架构，通过一个全局的 `eagle` 命名空间来组织其功能，并通过插件机制来为特定网站（如 Pinterest, Behance, Twitter 等）提供深度集成和优化。

### 主要技术栈
- **核心**: JavaScript (ES6+), HTML5, CSS3
- **框架**: AngularJS (v1)
- **打包**: 无明确的打包工具，直接作为解压扩展加载
- **浏览器 API**: Chrome Extension Manifest V3

## 运行与调试

由于这是一个解压后的扩展程序，因此没有传统的构建步骤。可以按照以下步骤在 Chrome 或 Edge 等 Chromium 内核的浏览器中加载和调试：

1.  打开浏览器，导航到 `chrome://extensions` (或 `edge://extensions`)。
2.  启用右上角的 **“开发者模式”** (Developer mode)。
3.  点击 **“加载解压缩的扩展”** (Load unpacked) 按钮。
4.  在文件选择对话框中，选择包含 `manifest.json` 文件的 `3.1.21_0` 目录。
5.  扩展程序现在应该已加载并处于活动状态。源代码的任何更改都可以通过在扩展管理页面点击“刷新”按钮来生效。

## 开发约定与架构

### 代码结构
- **`manifest.json`**: 扩展的入口点，定义了所有背景脚本、内容脚本、权限和插件规则。
- **`js/`**: 包含核心的 JavaScript 逻辑。
  - **`js/background-v3.js`**: 作为 Service Worker 运行的背景脚本，处理非页面上下文的任务。
  - **`js/content.js`**: 核心的内容脚本，注入到网页中，负责处理拖拽保存、右键菜单保存等页面交互。
  - **`js/lib/`**: 包含核心的 API 模块（如 `eagle.js`）和各种功能的实现（如 `drag-saver.js`, `cropper.js` 等）。
  - **`js/vendors/`**: 存放第三方库，如 `jquery.min.js` 和 `angular.min.js`。
- **`popup/`**: 包含弹出窗口的 UI 和逻辑。它使用 AngularJS 构建，分为多个控制器 (`PopupController`, `ActionController`, `PreferenceController`) 来管理不同的功能。
- **`plugins/`**: 插件目录。每个子目录对应一个网站，包含在该网站上运行的特定内容脚本，以实现更精准的元素抓取。这是一个典型的策略模式应用。
- **`_locales/`**: 包含多语言支持的 `messages.json` 文件，用于国际化 (i18n)。

### 架构模式
- **AngularJS (MVVM)**: 弹出窗口 `popup.html` 及其相关脚本清晰地展示了使用 AngularJS 的 MVVM (Model-View-ViewModel) 模式。数据和视图通过 `ng-model`, `ng-click` 等指令双向绑定，逻辑则封装在控制器中。
- **模块化与命名空间**: 项目将不同的功能（如 `preference`, `i18n`, `elementInspector`）封装在全局 `eagle` 命名空间下的独立模块中，避免了全局变量污染。
- **插件化架构**: 通过在 `manifest.json` 中为特定域名配置不同的内容脚本，项目实现了一种灵活的插件系统，使其能够轻松地为新网站提供支持或更新现有网站的抓取逻辑。
- **事件驱动**: 交互逻辑（如拖拽、右键点击）通过 `DragSaver` 和 `ContextSaver` 等模块进行监听和处理，是典型的事件驱动模型。
