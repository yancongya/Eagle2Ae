# CEP 扩展架构

KBar 3 采用了一个复杂而灵活的多扩展包（Extension Bundle）架构，而不是单一的面板结构。这种设计使其功能模块化，并能提供更灵活的用户体验。

## 扩展包构成

`manifest.xml` 文件定义了整个扩展包，其 Bundle ID 为 `kbar`，包含了以下几个核心的子扩展：

1.  **工具栏 (com.kraftyfx.kbar.toolbar-1 至 4)**
    *   **描述**: 这是用户在 AE 中看到的主要工具栏界面。项目内置了四个独立的工具栏扩展，允许用户同时打开和使用最多四个 KBar 面板。
    *   **UI 入口**: `toolbar.html`
    *   **前端技术**: **React** 框架和 JavaScript (`js/toolbar.js`)。
    *   **宿主脚本**: `all.jsxbin`
    *   **特点**: 所有工具栏实例共享相同的 UI 代码和宿主脚本，但它们在运行时是独立的进程，拥有各自的状态。

2.  **配置面板 (com.kraftyfx.kbar.config)**
    *   **描述**: 一个独立的 "Custom" 类型 UI，用于设置所有工具栏的布局、按钮和全局选项。
    *   **UI 入口**: `config.html`
    *   **前端技术**: **React** 框架和 JavaScript (`js/config.js`)。
    *   **宿主脚本**: `all.jsxbin`
    *   **特点**: 它作为所有工具栏的中央控制器。在此处所做的更改将被保存，并通知所有活动的工具栏实例进行更新。

3.  **后台服务 (com.kraftyfx.kbar.server)**
    *   **描述**: 一个不可见的后台扩展，类型为 "Custom"，大小为 100x100 像素。
    *   **UI 入口**: `server.html`
    *   **后端技术**: 纯 **Node.js** 环境 (`js/server.js`)。
    *   **特点**:
        *   启用了 Node.js (`--enable-nodejs`)。
        *   它不在 AE 启动时自动运行，而是通过一个自定义事件 `com.kraftyfx.cep.message` 触发。
        *   负责处理需要 Node.js API 的重量级任务，例如文件系统操作（读写设置、归档/解归档 `.kzip` 文件）、子进程管理和网络通信。
        *   集成了 Google Analytics 和 Sentry 进行遥测和错误报告。

4.  **关于面板 (com.aescripts.kbar3.about)**
    *   **描述**: 一个标准的 "Modeless" 对话框，用于显示扩展信息。
    *   **UI 入口**: `dialog/dialog.html`

## 技术栈与环境

*   **CEP 版本**: 8.0
*   **宿主兼容**: After Effects v16.0 及以上版本。
*   **前端框架**: **React** (版本 16.14.0)。
*   **Node.js 集成**: 所有核心扩展（工具栏、配置、服务）都通过 CEF 命令行参数 `--enable-nodejs` 启用了 Node.js 环境。这使得前端 JavaScript 可以直接使用 `require()` 来加载 Node 模块，极大地增强了其功能。
*   **文件访问**: 同时启用了 `--allow-file-access` 和 `--allow-file-access-from-files`，为扩展提供了广泛的本地文件系统读写权限。

## 渲染与逻辑流程

1.  **启动**: 当用户在 AE 中打开一个 KBar 工具栏时，对应的 `toolbar.html` 被加载。
2.  **UI 渲染**: `toolbar.html` 加载 `js/toolbar.js` 脚本。该脚本使用 **React** 在 `<div id="page"></div>` 元素内动态生成整个工具栏的用户界面。`config.html` 也以类似方式使用 `js/config.js` 渲染其 React UI。
3.  **用户交互**: 用户点击工具栏上的按钮或在配置面板中进行操作。
4.  **逻辑处理**: 前端 JavaScript (React 组件) 中的事件监听器捕获该交互，并根据按钮的配置或用户输入，准备执行相应的操作。
5.  **与 AE 通信**: 前端 JavaScript 通过 `CSInterface.evalScript()` 方法，调用 `all.jsxbin` 中预定义的函数，并将必要的参数传递给它。
6.  **与 Node.js 服务通信**: 对于文件系统操作、归档/解归档或需要系统级权限的任务，前端 JavaScript 会通过 `KBarService` 或直接调用 Node.js API 与 `server.js` 后台服务进行通信。
7.  **宿主执行**: `all.jsxbin` 在 After Effects 的宿主环境中执行接收到的指令，完成诸如运行脚本、应用效果等操作。`server.js` 则在 Node.js 环境中执行其系统级任务。