# JSX 脚本 API (all.jsxbin)

**重要限制**: KBar 的核心宿主端逻辑被编译在一个二进制文件 `all.jsxbin` 中，其源代码不可读。由于前端 JavaScript 代码（如 toolbar.js 和 config.js）经过了高度混淆，我们无法直接通过代码分析来识别 evalScript 的具体调用点和参数。因此，本篇文档中列出的功能和 API 签名，是基于对扩展的**整体行为、架构以及前端与宿主通信模式的逆向分析和推断**。

`all.jsxbin` 似乎在全局范围内暴露了一个名为 `KBar` 的对象，该对象封装了所有与 After Effects 交互的函数。前端 JavaScript 通过 `evalScript` 调用这些函数。

## 观察到的 `KBar` 对象 API

以下是根据 `toolbar.js` 和 `config.js` 中 `evalScript` 调用模式推断出的 `KBar` 对象方法：

### `KBar.runMenuCommand(commandId)`
*   **功能**: 执行一个 After Effects 菜单命令。
*   **参数**:
    *   `commandId` (Number): 要执行的命令的唯一 ID。
*   **返回**: (String) "success" 或错误信息。

### `KBar.runScript(scriptText)`
*   **功能**: 直接执行一段 JSX 脚本字符串。
*   **参数**:
    *   `scriptText` (String): 要执行的脚本内容。
*   **返回**: (String) 脚本的执行结果或错误信息。

### `KBar.runScriptFile(path)`
*   **功能**: 执行一个外部的 `.jsx` 或 `.jsxbin` 脚本文件。
*   **参数**:
    *   `path` (String): 脚本文件的绝对路径。
*   **返回**: (String) "success" 或错误信息。

### `KBar.applyEffect(effectName)`
*   **功能**: 将一个效果应用到当前选定的图层上。
*   **参数**:
    *   `effectName` (String): 效果的显示名称或匹配名称 (e.g., "Gaussian Blur")。
*   **返回**: (String) "success" 或错误信息。

### `KBar.openSettings()`
*   **功能**: 触发打开配置面板 (`config.html`) 的事件。
*   **参数**: 无。
*   **返回**: (String) "success" 或错误信息。

### `KBar.getSettings()`
*   **功能**: 从本地磁盘读取并返回用户的设置文件（通常是 JSON）。
*   **参数**: 无。
*   **返回**: (String) JSON 格式的设置字符串。

### `KBar.saveSettings(settingsJson)`
*   **功能**: 将新的设置字符串写入本地磁盘。
*   **参数**:
    *   `settingsJson` (String): JSON 格式的设置字符串。
*   **返回**: (String) "success" 或错误信息。

### `KBar.importToolbarFromKZip(zipFilePath, destinationPath)`
*   **功能**: 触发宿主脚本执行 `.kzip` 文件的导入操作。
*   **参数**:
    *   `zipFilePath` (String): `.kzip` 文件的路径。
    *   `destinationPath` (String): 导入的目标路径。
*   **返回**: (String) "success" 或错误信息。

### `KBar.getRawManifestFromKZip(zipFilePath)`
*   **功能**: 从 `.kzip` 文件中提取并返回原始的清单文件内容。
*   **参数**:
    *   `zipFilePath` (String): `.kzip` 文件的路径。
*   **返回**: (String) JSON 格式的清单字符串或错误信息。

---
**再次强调**: 以上 API 签名均为推测。真实的函数名称、参数和返回值可能有所不同，但它们代表了 `all.jsxbin` 必须提供的核心功能，以支持 KBar 的全部特性。