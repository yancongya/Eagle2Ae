# 开发与调试指南

由于 KBar 3 项目提供的是已编译版本，本指南不涉及源代码的编译流程，而是专注于**安装**、**调试**和**检查**现有的扩展。

## 安装扩展

1.  **获取 ZXP 文件**: 从官方渠道（如 aescripts.com）下载 KBar 的 `.zxp` 安装包文件。
2.  **使用安装器**: 使用一个 ZXP 安装器（如 Anastasiy's Extension Manager 或 ExManCmd 命令行工具）来安装 `.zxp` 文件。
3.  **重启 After Effects**: 安装完成后，重启 AE。
4.  **启用扩展**: 在 AE 的菜单栏中，选择 `窗口 (Window) -> 扩展 (Extensions)`，然后点击 `KBar 3 - Toolbar 1` (或其他编号) 来打开工具栏。

## 开启 CEP 调试模式

为了能够像调试网页一样检查 KBar 的前端代码 (HTML/JS/CSS)，你需要开启 CEP 的调试模式。

1.  **创建 `.debug` 文件**:
    *   **Windows**: 在 `C:\Users\<Your-Username>\AppData\Roaming\Adobe\CEP\extensions` 目录下创建一个名为 `.debug` 的空文件。
    *   **macOS**: 在 `~/Library/Application Support/Adobe/CEP/extensions/` 目录下创建一个名为 `.debug` 的空文件。
    *   **或者**, 对于更高版本的 Adobe 应用，你可能需要在命令行执行以下命令：
        *   **Windows**: `defaults write com.adobe.CSXS.11 PlayerDebugMode 1` (将 `CSXS.11` 替换为你的 CEP 版本号)
        *   **macOS**: `defaults write com.adobe.CSXS.11 PlayerDebugMode -string "1"`

2.  **重启 After Effects**: 再次重启 AE 以使调试模式生效。

## 使用 Chrome DevTools 进行调试

开启调试模式后，每个运行中的 CEP 扩展都会在本地开启一个调试端口。

1.  **打开 Chrome 浏览器**: 必须是基于 Chromium 的浏览器，如 Google Chrome 或 Microsoft Edge。
2.  **访问 `chrome://inspect`**: 在地址栏输入 `chrome://inspect` 并回车。
3.  **找到 KBar 进程**: 在 "Remote Target" 区域，你应该能看到 KBar 的几个进程，例如：
    *   `KBar 3 - Toolbar 1 - toolbar.html`
    *   `KBar 3 - Config - config.html`
    *   `KBar 3 - Server - server.html` (后台 Node.js 进程)
4.  **点击 "Inspect"**: 点击你想要调试的进程旁边的 "inspect" 链接。
5.  **开始调试**:
    *   **Elements**: 查看和修改 `toolbar.html` 的实时 DOM 结构和 CSS 样式。
    *   **Console**: 查看 `console.log` 输出，执行 JavaScript 代码。
    *   **Sources**: 查看已加载的 JavaScript 文件（如 `js/toolbar.js`, `js/config.js`, `js/server.js`）。虽然代码是压缩过的，但你仍然可以设置断点来跟踪执行流程。
    *   **Network**: 查看扩展加载资源的情况。
    *   **Application**: 查看 `localStorage`、`sessionStorage` 等，KBar 可能用它们来存储临时状态。

## React 开发者工具

由于 KBar 前端使用 React，你可以在 Chrome 浏览器中安装 React Developer Tools 扩展。在 `chrome://inspect` 打开的 DevTools 窗口中，你将能看到 "Components" 和 "Profiler" 标签页，这对于理解 React 组件结构和调试其状态非常有帮助。