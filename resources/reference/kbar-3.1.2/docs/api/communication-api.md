# Communication API (JavaScript)

此文档描述了在前端 JavaScript (例如 `toolbar.js` 和 `config.js`) 中用于和宿主 JSX 环境以及 Node.js 后台服务进行通信的接口。

## 1. 与宿主 JSX 环境通信 (JS -> JSX)

所有对 After Effects 的操作请求都是通过调用 `CSInterface.evalScript()` 方法发起的。

### 核心方法: `CSInterface.evalScript()`

*   **语法**:
    ```javascript
    const cs = new CSInterface();
    cs.evalScript('functionName("parameter1", "parameter2")', callbackFunction);
    ```
*   **工作流程**:
    1.  **构建脚本字符串**: 前端 JavaScript 根据用户操作，动态构建一个包含要执行的 JSX 函数名和参数的字符串。
    2.  **调用 `evalScript`**: 将构建好的脚本字符串作为第一个参数传递给 `evalScript`。
    3.  **宿主环境执行**: After Effects 的 JSX 引擎接收到该字符串，并像执行普通脚本一样执行它。这会调用到 `all.jsxbin` 中对应的函数。
    4.  **返回值处理**: JSX 函数执行完毕后，可以返回一个值（通常是字符串或序列化后的 JSON）。这个返回值会通过 `evalScript` 的第二个参数——回调函数——异步地返回给前端 JavaScript。

### 示例 (推测)

当用户点击一个配置为“运行菜单命令”的按钮时，通信流程可能如下：

1.  **JS 端 (`toolbar.js`)**:
    ```javascript
    // 用户点击按钮，按钮绑定的数据中包含命令ID: 2083
    const commandId = 2083;

    // 构建脚本字符串
    const script = `KBar.runMenuCommand(${commandId})`; // "KBar.runMenuCommand" 是在 all.jsxbin 中定义的全局函数

    // 调用 evalScript
    const cs = new CSInterface();
    cs.evalScript(script, (result) => {
        if (result === 'success') {
            console.log('菜单命令执行成功');
        } else {
            console.error('菜单命令执行失败:', result);
        }
    });
    ```

## 2. 与 Node.js 后台服务通信 (JS <-> Node.js)

KBar 的前端面板（`toolbar.js`, `config.js`）通过 `KBarService` 类与 `server.js` 运行的 Node.js 后台服务进行交互。这种通信通常涉及文件系统操作、偏好设置管理和归档功能。

### 核心服务类: `KBarService`

在 `toolbar.js` 和 `config.js` 中都观察到了 `KBarService` 类的使用。它封装了与宿主环境和 Node.js 服务交互的逻辑。

*   **实例化**:
    ```javascript
    // 假设 KBarService 是通过 require 导入的
    const { KBarService } = require('./KBarService'); // 路径为推测
    const kbarService = new KBarService(apiServerInstance); // apiServerInstance 可能是用于与 server.js 通信的接口
    ```

*   **主要方法 (从代码中观察到)**:

    *   `getUserConfigAsync()`:
        *   **功能**: 异步获取用户的配置信息，包括 Google Analytics 状态、用户 ID、工具栏文件路径等。
        *   **返回**: `Promise<Object>`，包含配置数据的对象。
        *   **实现**: 内部通过 `host.prefs.getPreference()` 读取宿主偏好设置，并可能从文件系统读取其他配置。

    *   `setUserConfigAsync(configObject)`:
        *   **功能**: 异步设置用户的配置信息。
        *   **参数**: `configObject` (Object)，包含要设置的配置数据。
        *   **实现**: 内部通过 `host.prefs.setPreference()` 写入宿主偏好设置，并可能将其他配置写入文件系统。

    *   `importToolbarFromKZip(zipFilePath, destinationPath)`:
        *   **功能**: 从指定的 `.kzip` 文件导入工具栏配置。
        *   **参数**: `zipFilePath` (String), `destinationPath` (String)。
        *   **实现**: 内部调用 `archiverService.extractZipFile()` 进行解压，并处理清单文件。

    *   `getRawManifestFromKZip(zipFilePath)`:
        *   **功能**: 从 `.kzip` 文件中提取原始的清单文件内容。
        *   **参数**: `zipFilePath` (String)。
        *   **实现**: 内部调用 `archiverService.extractZipFile()`。

### Node.js `require()` 的直接使用

由于 `--enable-nodejs` 参数，前端 JavaScript 可以直接使用 Node.js 的 `require()` 函数来导入 Node.js 模块，例如 `fs`、`path` 等，从而直接进行文件操作。

```javascript
// 在前端 JavaScript 中直接使用 Node.js fs 模块
const fs = require('fs');
const path = require('path');

try {
    const settingsPath = path.join(os.homedir(), 'Documents', 'KBar', 'settings.json');
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    console.log('直接通过 Node.js 读取设置:', settings);
} catch (e) {
    console.error('读取设置失败:', e);
}
```

这种直接访问 Node.js API 的能力，使得 KBar 的前端能够执行传统浏览器环境无法完成的复杂任务。
