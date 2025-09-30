# 功能映射表

此表展示了用户在 UI 上的一个典型操作是如何通过 JavaScript API 最终映射到 JSX 函数调用的。

| 用户操作 | UI 元素 | 前端 JavaScript 函数 (推测) | 构建的 `evalScript` 字符串 (示例) | 目标 JSX 函数 (推测) |
| :--- | :--- | :--- | :--- | :--- |
| 点击“清除内存”按钮 | 一个配置为菜单命令的按钮 | `executeButtonAction({type: 'command', ...})` | "KBar.runMenuCommand(2083)" | `KBar.runMenuCommand` |
| 点击一个自定义脚本按钮 | 一个配置为内联脚本的按钮 | `executeButtonAction({type: 'script', ...})` | "KBar.runScript('alert(\'hello\')')" | `KBar.runScript` |
| 点击一个外部脚本按钮 | 一个配置为脚本文件的按钮 | `executeButtonAction({type: 'scriptfile', ...})` | "KBar.runScriptFile('C:/path/to/script.jsx')" | `KBar.runScriptFile` |
| 点击“设置”图标 | 工具栏上的齿轮图标 | `openSettings()` | "KBar.openSettings()" | `KBar.openSettings` |
| 在配置页面保存设置 | 配置页的“保存”按钮 | `saveAllSettings(settingsObject)` | "KBar.saveSettings('{\'key\':\'val\'}')" | `KBar.saveSettings` |
| 启动时加载工具栏 | AE 加载面板 | `loadToolbarSettings()` | "KBar.getSettings()" | `KBar.getSettings` |

---

**解读流程**:

1.  **用户操作**: 用户与 `toolbar.html` 或 `config.html` 上的某个元素进行交互。
2.  **前端 JS 函数**: 一个 JavaScript 事件监听器被触发，调用一个高级别的业务逻辑函数（如 `executeButtonAction`）。
3.  **构建 `evalScript` 字符串**: 该函数根据操作的上下文（例如被点击按钮的数据），动态地构建一个字符串，该字符串是符合 JSX 语法的一行可执行代码。
4.  **目标 JSX 函数**: 这个字符串中包含了要调用的、存在于 `all.jsxbin` 中的全局函数（如 `KBar.runMenuCommand`），以及所需的参数。`evalScript` 最终在 AE 的宿主环境中执行此调用。

```