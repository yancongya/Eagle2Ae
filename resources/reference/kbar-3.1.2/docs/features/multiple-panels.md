# 功能: 多面板支持与独立内容

KBar 3 扩展的一个显著功能是用户可以同时打开多个工具栏面板，并且每个面板可以显示不同的内容和配置。这得益于 CEP 扩展的架构特性和 KBar 自身精巧的配置管理机制。

## 1. `manifest.xml` 中的多扩展定义

KBar 并非单一的扩展，而是一个包含多个独立工具栏扩展的集合。这在 `CSXS/manifest.xml` 文件中明确定义：

*   **独立扩展 ID**: 在 `<ExtensionList>` 和 `<DispatchInfoList>` 中，KBar 定义了多个独立的扩展 ID，例如：
    *   `com.kraftyfx.kbar.toolbar-1`
    *   `com.kraftyfx.kbar.toolbar-2`
    *   `com.kraftyfx.kbar.toolbar-3`
    *   `com.kraftyfx.kbar.toolbar-4`
*   **共享 UI 和宿主脚本**: 尽管 ID 不同，但这些扩展都指向相同的 UI 入口文件 (`./toolbar.html`) 和相同的宿主脚本 (`./all.jsxbin`)。
*   **独立菜单项**: 每个扩展 ID 在 After Effects 的 `窗口 (Window) -> 扩展 (Extensions)` 菜单下都有一个独立的条目（通过 `Menu` 标签定义，如 `%global-title1`）。

## 2. 独立的 CEF 进程运行

当用户在 After Effects 中打开这些不同的工具栏菜单项时，CEP 环境会为每个扩展 ID 启动一个**完全独立的 Chromium Embedded Framework (CEF) 进程**。

*   **进程隔离**: 每个面板实例都在自己的沙盒环境中运行，拥有独立的内存空间、JavaScript 上下文和 DOM 树。这意味着它们之间默认是隔离的，互不影响。
*   **共享代码库**: 尽管进程独立，但它们都加载并执行同一套前端代码 (`js/toolbar.js`) 和宿主脚本 (`all.jsxbin`)。

## 3. 基于实例 ID 的内容差异化

实现每个面板内容不同的关键在于前端 JavaScript (`js/toolbar.js`) 如何利用其运行实例的唯一标识符来加载和渲染专属内容。

*   **获取实例 ID**: 当 `js/toolbar.js` 启动时，它能够通过 CEP 提供的 API（例如 `CSInterface.getExtensionID()` 或从 URL 参数中解析）获取到当前运行实例的唯一 `Extension Id`（如 `com.kraftyfx.kbar.toolbar-1`）。
*   **加载专属配置**: `js/toolbar.js` 会利用这个唯一的 `Extension Id` 作为键，通过 `KBarService` 从 KBar 的全局设置中加载**该特定面板的配置数据**。例如，如果当前实例是 `toolbar-1`，它就加载“工具栏 1”的按钮配置；如果是 `toolbar-2`，就加载“工具栏 2”的配置。
*   **动态渲染**: React 框架根据加载到的专属配置数据，动态地渲染出该面板的按钮、布局和样式。

## 4. 配置管理与实时同步

*   **集中配置**: KBar 的所有工具栏配置都集中存储在一个地方（通常是用户本地的文件系统中的一个 JSON 文件）。配置面板 (`config.html` 和 `js/config.js`) 负责管理这些数据，允许用户为每个独立的工具栏实例（Toolbar 1、Toolbar 2 等）设置不同的按钮和布局。
*   **CEP 事件同步**: 当用户在配置面板中保存设置时，配置面板会广播一个 CEP 事件。所有正在运行的工具栏实例（独立的 CEF 进程）都会监听这个事件。接收到事件后，每个工具栏实例会重新加载其自身的最新配置数据，并刷新界面，从而实现所有面板内容的实时同步更新。

通过这种方式，KBar 巧妙地利用了 CEP 的多实例特性，结合自身基于 ID 的配置管理，实现了高度灵活和可定制的多工具栏体验。
