# 动作执行逻辑

KBar 的核心功能是执行用户在按钮上定义的各种动作。本篇文档描述了当用户点击一个 KBar 按钮时，内部的逻辑处理流程。

这个流程主要发生在前端 JavaScript (`js/toolbar.js`) 中，通过 **React 组件**捕获事件，并最终通过 `KBarService` 与宿主脚本 `all.jsxbin` 或 Node.js 后台服务进行交互。

## 1. 事件捕获 (React 组件)

*   用户在 `toolbar.html` 界面上点击一个由 React 渲染的按钮组件。
*   React 组件内部的事件处理器捕获到 `onClick` 事件。
*   该处理器从组件的 `props` 或 `state` 中，获取到该按钮的完整配置数据对象。

## 2. 按钮数据检索

*   按钮数据对象包含了执行动作所需的所有信息，例如：
    ```json
    {
        "id": "btn-123",
        "label": "My Script",
        "type": "script", // 关键字段：决定了执行逻辑
        "scriptContent": "alert('Hello from KBar!');",
        "commandId": null,
        "filePath": null
    }
    ```

## 3. 动作分发 (KBarService)

*   React 组件通常会将按钮数据传递给一个服务层（例如 `KBarService` 的实例），由该服务层负责根据按钮的 `type` 字段来决定下一步的操作。

### Case 1: `type: 'script'` (内联 JSX 脚本)
*   **动作**: 执行存储在按钮配置中的内联 JSX 脚本。
*   **逻辑**:
    1.  `KBarService` 获取 `button.scriptContent` 的值。
    2.  对脚本字符串进行转义处理。
    3.  构建最终的脚本命令: `KBar.runScript("...")`。
    4.  通过 `CSInterface.evalScript()` 发送给宿主执行。

### Case 2: `type: 'scriptfile'` (外部 JSX 脚本文件)
*   **动作**: 执行一个外部的 `.jsx` 或 `.jsxbin` 文件。
*   **逻辑**:
    1.  `KBarService` 获取 `button.filePath` 的值。
    2.  构建脚本命令: `KBar.runScriptFile("C:/path/to/file.jsx")`。
    3.  发送给宿主执行。

### Case 3: `type: 'command'` (AE 菜单命令)
*   **动作**: 执行一个 After Effects 的原生菜单命令。
*   **逻辑**:
    1.  `KBarService` 获取 `button.commandId` 的值 (一个数字)。
    2.  构建脚本命令: `KBar.runMenuCommand(2083)`。
    3.  发送给宿主执行。

### Case 4: `type: 'effect'` (应用效果)
*   **动作**: 将一个效果应用到选中的图层。
*   **逻辑**:
    1.  `KBarService` 获取 `button.effectName` 的值。
    2.  构建脚本命令: `KBar.applyEffect("Gaussian Blur")`。
    3.  发送给宿主执行。

### Case 5: `type: 'importKZip'` (导入 KZip)
*   **动作**: 导入一个 `.kzip` 归档文件。
*   **逻辑**:
    1.  `KBarService` 获取 `.kzip` 文件的路径。
    2.  调用 `KBarService.importToolbarFromKZip(zipFilePath, destinationPath)` 方法。
    3.  该方法内部会与 Node.js 后台服务 (`server.js`) 协作，完成文件的解压和配置的加载。

## 4. 回调处理

*   `evalScript` 和 `KBarService` 的异步方法都会返回 `Promise` 或使用回调函数。
*   前端 React 组件会在这些回调中处理执行结果，例如：
    *   更新 UI 状态（例如显示成功或失败消息）。
    *   如果返回错误信息，则在控制台打印错误 (`console.error`)，或者通过 Sentry (`Raven`) 报告错误。

这个清晰的、基于类型的分发逻辑，使得 KBar 能够以统一的方式处理多种完全不同的动作，保证了代码的可维护性和可扩展性。