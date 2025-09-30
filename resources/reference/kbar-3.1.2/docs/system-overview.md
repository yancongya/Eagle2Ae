# 系统概览：文件结构与框架作用

本文档旨在提供 KBar 3 After Effects 扩展的整体系统概览，解释其主要文件和目录的作用，并概述其前端、后台和宿主脚本之间的框架结构。

## 1. 整体扩展包结构

KBar 3 是一个 CEP (Common Extensibility Platform) 扩展包，这意味着它是一个包含多个独立扩展的集合。其核心结构由 `CSXS/manifest.xml` 定义，该文件协调了所有子扩展的启动和行为。

## 2. 主要文件与目录作用

以下是 KBar 3 扩展中关键文件和目录的职责：

*   **`CSXS/` 目录**:
    *   **`manifest.xml`**: 扩展的清单文件。它是整个扩展包的入口点，定义了所有子扩展的 ID、版本、UI 入口 (`MainPath`)、宿主脚本 (`ScriptPath`)、CEF 命令行参数（如 `--enable-nodejs`）以及 UI 类型和尺寸等。

*   **`toolbar.html`**:
    *   **作用**: KBar 工具栏面板的 HTML 入口文件。当用户在 After Effects 中打开一个 KBar 工具栏时，此文件被加载。它是一个轻量级的 HTML 骨架，其大部分内容由 JavaScript 动态渲染。

*   **`config.html`**:
    *   **作用**: KBar 配置面板的 HTML 入口文件。它提供了一个独立的界面，用于管理所有工具栏的按钮、布局和全局设置。其内容也由 JavaScript 动态渲染。

*   **`server.html`**:
    *   **作用**: KBar 后台 Node.js 服务的 HTML 入口文件。这是一个不可见的 HTML 页面，其主要目的是提供一个运行 Node.js 环境的沙盒，用于执行系统级任务，如文件操作、归档等。它不直接显示 UI。

*   **`js/` 目录**: 包含了扩展的所有 JavaScript 逻辑文件。
    *   **`toolbar.js`**: KBar 工具栏面板的核心 JavaScript 文件。它使用 React 框架来构建和管理工具栏的用户界面，并处理用户交互，通过 `KBarService` 与宿主和 Node.js 后台通信。
    *   **`config.js`**: KBar 配置面板的核心 JavaScript 文件。同样使用 React 框架构建 UI，并处理配置的加载、保存和管理逻辑。
    *   **`server.js`**: KBar 后台 Node.js 服务的核心 JavaScript 文件。它运行在 Node.js 环境中，负责处理文件系统操作、归档（`.kzip` 文件）、遥测数据发送和错误报告等系统级任务。
    *   **`translate.js`**: 处理扩展的国际化和本地化逻辑。
    *   **`zh_CN.js`**: 中文语言包文件，提供界面文本的中文翻译。
    *   **`styles.js`**: 可能包含动态生成或管理 CSS 样式的 JavaScript 逻辑。

*   **`styles/` 目录**:
    *   **`toolbar.css`**: 工具栏面板的主要 CSS 样式表，定义了工具栏的外观和布局。

*   **`host/` 目录**:
    *   **`all.jsxbin`**: 编译后的 After Effects 宿主脚本文件。它是 KBar 与 After Effects 应用程序本身进行交互的桥梁。所有对 AE 内部功能的调用（如运行脚本、执行菜单命令、应用效果等）都通过这个二进制文件完成。其源代码不可读。

*   **`custom/` 目录**:
    *   **`language.js`**: 可能包含自定义的语言检测或加载逻辑，与 `translate.js` 和 `zh_CN.js` 协同工作。

*   **`img/` 和 `fonts/` 目录**:
    *   **作用**: 存放扩展使用的图像资源（如按钮图标）和自定义字体文件。

## 3. 框架概览

KBar 3 采用了一个分层的架构，结合了多种技术栈以实现其功能：

*   **前端层 (React)**:
    *   **技术**: React (JavaScript 库) 和 ReactDOM。
    *   **作用**: 负责构建和渲染用户界面 (`toolbar.html` 和 `config.html`)。React 的组件化特性使得 UI 模块化、可复用且易于管理状态。
    *   **主要文件**: `js/toolbar.js`, `js/config.js`。

*   **后台服务层 (Node.js)**:
    *   **技术**: Node.js 运行时环境。
    *   **作用**: 运行在独立的 `server.html` 进程中，处理所有需要系统级权限或复杂计算的任务。这包括文件系统读写、归档操作、子进程管理、网络请求以及遥测数据发送。
    *   **主要文件**: `js/server.js`。

*   **宿主脚本层 (JSX)**:
    *   **技术**: After Effects JSX 脚本语言。
    *   **作用**: 作为前端与 After Effects 应用程序编程接口 (API) 之间的桥梁。它接收来自前端的指令，并在 AE 环境中执行实际的操作。
    *   **主要文件**: `host/all.jsxbin`。

## 4. 通信与数据流

KBar 各层之间通过以下方式进行通信：

*   **前端 (React) <-> 宿主 (JSX)**:
    *   主要通过 `CSInterface.evalScript()` 方法。前端 JavaScript 调用 `all.jsxbin` 中定义的函数来执行 AE 内部操作。
    *   宿主脚本执行结果通过 `evalScript` 的回调函数返回给前端。

*   **前端 (React) <-> 后台服务 (Node.js)**:
    *   通过 `KBarService` 类进行封装。前端调用 `KBarService` 的方法（如 `getUserConfigAsync`, `importToolbarFromKZip`），这些方法在内部与 Node.js 后台服务进行通信，执行文件操作、偏好设置管理等。
    *   由于 `--enable-nodejs`，前端也可以直接使用 Node.js 的 `require()` 导入模块进行文件操作。

*   **宿主 (JSX) <-> 后台服务 (Node.js)**:
    *   间接通信，通常通过文件系统或 CEP 事件。例如，宿主脚本可能写入一个文件，然后 Node.js 服务监听该文件变化并作出响应。

*   **跨扩展通信 (CEP Events)**:
    *   不同的 CEP 扩展实例（如多个工具栏面板、配置面板）之间可以通过 CEP 事件进行通信，例如配置面板保存设置后，广播一个事件通知所有工具栏刷新。

*   **核心服务概念**:
    *   **`KBarService`**: 这是一个在前端 JavaScript 中扮演核心角色的服务类。它封装了与宿主 (`all.jsxbin`) 和 Node.js 后台 (`server.js`) 的所有复杂交互，为 React 组件提供了统一且异步的 API 接口。它负责协调数据流、错误处理和偏好设置管理。

这种多层、多技术栈的架构使得 KBar 能够充分利用 CEP 扩展的强大功能，实现复杂的用户界面和深入的系统级集成。
