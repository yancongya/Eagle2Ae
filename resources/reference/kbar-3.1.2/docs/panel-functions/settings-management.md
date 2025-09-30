# 面板功能: 设置管理

KBar 的设置管理是其高度可定制性的基础。它涉及用户偏好、工具栏配置的加载、保存和持久化。这些功能主要通过 `KBarService` 类及其与宿主环境和 Node.js 后台服务的交互来实现。

## 1. 设置的存储位置

KBar 的配置数据通常以 JSON 格式存储在用户本地的文件系统中。

*   **主要设置文件 (推测)**: `C:\Users\<User>\Documents\KBar\kbar_settings.json`
*   **宿主偏好设置**: 部分关键偏好（如 GA 启用状态、用户 ID）可能存储在 After Effects 的宿主偏好设置中，通过 `host.prefs.getPreference()` 和 `host.prefs.setPreference()` 访问。

## 2. 获取用户配置 (`getUserConfigAsync`)

### 流程

1.  前端面板（`toolbar.js` 或 `config.js`）需要加载配置时，调用 `KBarService.getUserConfigAsync()`。
2.  `KBarService` 异步执行以下操作：
    *   通过 `host.prefs.getPreference()` 从 AE 宿主偏好中读取如 `ga.enabled` 和 `ga.userid` 等信息。
    *   通过 Node.js `fs` 模块从文件系统读取 `kbar_settings.json` 文件内容。
    *   将所有获取到的配置数据合并成一个 JavaScript 对象。
3.  `KBarService` 返回一个 `Promise`，解析为包含所有用户配置的对象。

### 关键代码 (从 `toolbar.js` 和 `config.js` 观察到)

```javascript
// KBarService 内部的 getUserConfigAsync 方法 (伪代码)
async getUserConfigAsync() {
    const gaEnabled = this.host.prefs.getPreference("ga.enabled") === "true";
    const userId = this.host.prefs.getPreference("ga.userid") || "";
    // ... 从文件系统读取 kbar_settings.json
    const fileSettings = await this.fileSystem.readJson(this.settingsFilePath); // 假设有这样的方法
    return {
        ga: gaEnabled,
        userid: userId,
        toolbarFilePath: this.toolbarFilePath, // 可能是动态路径
        importToolbarDir: this.importToolbarDir, // 可能是动态路径
        ...fileSettings
    };
}
```

## 3. 设置用户配置 (`setUserConfigAsync`)

### 流程

1.  前端配置面板 (`config.js`) 在用户修改并保存设置时，调用 `KBarService.setUserConfigAsync(newConfigObject)`。
2.  `KBarService` 异步执行以下操作：
    *   根据 `newConfigObject` 中的数据，通过 `host.prefs.setPreference()` 更新 AE 宿主偏好设置。
    *   将 `newConfigObject` 中与文件相关的部分序列化为 JSON 字符串。
    *   通过 Node.js `fs` 模块将 JSON 字符串写入 `kbar_settings.json` 文件。
3.  `KBarService` 返回一个 `Promise`，表示设置操作的完成。

### 关键代码 (从 `toolbar.js` 和 `config.js` 观察到)

```javascript
// KBarService 内部的 setUserConfigAsync 方法 (伪代码)
async setUserConfigAsync(config) {
    this.host.prefs.setPreference("ga.enabled", config.ga.toString());
    this.host.prefs.setPreference("ga.userid", config.userid);
    // ... 将 config 对象中与文件相关的部分写入 kbar_settings.json
    await this.fileSystem.writeJson(this.settingsFilePath, config); // 假设有这样的方法
}
```

## 4. 实时更新机制

当配置面板保存设置后，它会通过 CEP 事件通知所有打开的工具栏实例重新加载其配置，以确保 UI 的同步。

*   **事件名称**: `com.kbar.settingsUpdated` (推测)
*   **事件类型**: `APPLICATION`
*   **发送方**: `config.js` (通过 `CSInterface.dispatchEvent()`)
*   **接收方**: `toolbar.js` (通过 `CSInterface.addEventListener()`)