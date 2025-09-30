# UI 交互指南

本指南描述了 KBar 不同 UI 界面之间的交互方式，特别是工具栏 (`toolbar.html`) 和配置面板 (`config.html`) 之间的通信，以及它们如何与 Node.js 后台服务 (`server.html`) 协作。

## 核心交互: 设置的保存与加载

KBar 的核心数据是其设置（包括所有工具栏的按钮、顺序、外观等）。这些设置通常被保存在用户本地的一个 JSON 文件中。

*   **保存路径 (推测)**: `C:\Users\<User>\Documents\KBar\kbar_settings.json` (实际路径可能由 `KBarService` 动态确定)

### 交互流程

1.  **加载 (Toolbar/Config -> KBarService -> AE/Node.js -> Disk)**
    *   当一个 KBar 工具栏 (`toolbar.html`) 或配置面板 (`config.html`) 启动时，它会通过调用 `KBarService.getUserConfigAsync()` 来获取设置。
    *   `KBarService` 内部会协调与宿主 (`all.jsxbin`) 的 `KBar.getSettings()` 调用，以及直接通过 Node.js `fs` 模块从磁盘读取 JSON 设置文件。
    *   `KBarService` 将读取到的设置数据作为 `Promise` 返回给前端 React 组件。
    *   前端 React 组件接收到数据后，解析它，然后根据这些数据动态渲染出 UI。

2.  **修改与保存 (Config -> KBarService -> AE/Node.js -> Disk)**
    *   用户在配置面板中进行修改（如拖动按钮、编辑脚本、更改颜色等）。这些修改会实时更新 React 组件的 `state`。
    *   当用户点击“保存”或面板关闭时，配置面板的 React 组件会调用 `KBarService.setUserConfigAsync(newConfigObject)`。
    *   `KBarService` 会将 `newConfigObject` 序列化为 JSON 字符串。
    *   它会协调与宿主 (`all.jsxbin`) 的 `KBar.saveSettings(jsonString)` 调用，以及直接通过 Node.js `fs` 模块将 JSON 字符串写入 `kbar_settings.json` 文件。

## 工具栏的实时更新 (跨扩展通信)

当用户在配置面板中保存了新设置后，所有当前已打开的工具栏实例都需要更新它们的显示。CEP 提供了事件机制来实现这种跨扩展通信。

### 实现方式: CEP 事件

1.  **发送事件**: 在 `config.html` 成功保存设置后，`KBarService` 或配置面板的 React 组件会广播一个全局的 CEP 事件。
    ```javascript
    // 在 config.js 中 (通过 KBarService 或直接)
    const cs = new CSInterface();
    // ... 保存设置成功后 ...
    const event = new CSEvent("com.kbar.settingsUpdated", "APPLICATION");
    cs.dispatchEvent(event);
    ```

2.  **监听事件**: 所有 `toolbar.html` 实例在启动时都会注册一个对该事件的监听器。
    ```javascript
    // 在 toolbar.js 中 (通过 KBarService 或直接)
    const cs = new CSInterface();
    cs.addEventListener("com.kbar.settingsUpdated", function(event) {
        // 检测到设置已更新，重新加载工具栏配置
        console.log("检测到设置已更新，正在重新加载工具栏...");
        // 重新调用 KBarService.getUserConfigAsync() 并重新渲染 React 组件
        // 或者简单地 location.reload();
    });
    ```

## Node.js 后台服务交互

`server.html` 运行的 Node.js 后台服务不直接与用户交互，但它通过 `KBarService` 响应前端面板的请求。

*   **请求**: 前端面板（`toolbar.js` 或 `config.js`）通过 `KBarService` 调用需要 Node.js 能力的方法（例如 `importToolbarFromKZip`）。
*   **处理**: `KBarService` 将这些请求转发给 `server.js` 进程。
*   **执行**: `server.js` 使用其 Node.js 模块（如 `fs`, `archiver`）执行实际的文件操作、归档/解归档等任务。
*   **响应**: `server.js` 将结果返回给 `KBarService`，再由 `KBarService` 返回给前端面板。