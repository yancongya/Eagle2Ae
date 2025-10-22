# “导出路径”设置功能逻辑

## 1. 概述

“导出路径”设置面板用于控制通过“导出图层”等功能生成的文件，应被保存在何处，以及如何命名。此面板的设置是实时保存的。

一个核心设计理念是，为了简化配置，**导出路径的“项目旁”和“指定文件夹”模式，会直接复用“导入模式”中对应的设置**。

## 2. 功能组件详解

此面板包含两组控件：导出模式（单选按钮）和导出选项（复选框）。

### 2.1 导出模式 (Export Mode)

这组单选按钮 (`name="export-mode"`) 决定了导出的根目录。

- **桌面导出 (`desktop`)**: 
    - **功能**: 将文件直接导出到用户的桌面。
    - **逻辑**: `FileHandler.js` 在导出时会调用一个JSX脚本来获取当前用户的桌面路径，并将其作为导出根目录。

- **项目旁导出 (`project_adjacent`)**:
    - **功能**: 将文件导出到当前AE项目文件（`.aep`）旁边的一个子文件夹中。
    - **重要逻辑**: 此模式**复用**了“导入模式”中“项目旁复制”设置的文件夹名称。例如，如果导入设置的文件夹是 `Eagle_Assets`，那么导出时也会使用 `Eagle_Assets` 这个文件夹。

- **指定文件夹 (`custom_folder`)**:
    - **功能**: 将文件导出到用户在“导入模式”中设定的那个全局文件夹路径。
    - **重要逻辑**: 此模式**复用**了“导入模式”中“指定文件夹”设置的路径。用户无法在此处单独指定一个不同的导出路径，从而保证了导入和导出路径的一致性。

### 2.2 导出选项 (Export Options)

这组复选框提供了对导出文件和文件夹的额外控制。

- **自动复制 (`export-auto-copy`)**:
    - **功能**: 导出完成后，自动将导出文件夹的路径复制到系统剪贴板。
    - **默认**: 开启。

- **阅后即焚 (`export-burn-after-reading`)**:
    - **功能**: 这是一个为临时分享设计的特殊模式。启用后，文件会导出到一个由Eagle插件管理的系统临时文件夹中，而不是用户指定的常规路径。此功能完全依赖于与Eagle插件的连接和其提供的API。
    - **特殊交互 (依赖Eagle插件API)**:
        - **悬浮提示**: 悬浮在复选框上时，会通过API向Eagle插件请求临时文件夹的实时状态（如文件数、大小），并以工具提示的形式显示。
        - **`Alt + 点击`**: 触发对Eagle插件的API调用 (`POST /cleanup-temp-folder`)，由插件负责执行清空临时文件夹的操作。
        - **`Ctrl + 点击`**: 触发对Eagle插件的API调用 (`POST /open-temp-folder`)，由插件负责在用户的系统文件管理器中打开该临时文件夹。
    - **默认**: 关闭。

- **时间戳前缀 (`export-add-timestamp`)**:
    - **功能**: 在导出文件夹的名称前，添加一个 `YYYY-MM-DDTHH-mm-ss_` 格式的时间戳，以确保每次导出的文件夹名称都是唯一的。
    - **默认**: 开启。

- **合成名前缀 (`export-create-subfolders`)**:
    - **功能**: 在导出文件夹的名称前，添加当前活动合成的名称作为前缀。
    - **默认**: 关闭。

## 3. 逻辑流程与数据持久化

1.  **事件监听**: `main.js` 中的 `setupSettingsPanel` 方法为所有上述单选按钮和复选框都绑定了 `change` 事件监听器。

2.  **数据收集**: 当任何一个控件发生变化时，都会触发 `getExportSettingsFromUI()` 函数。此函数会读取**所有8个**导出相关控件的状态，并组装成一个 `exportSettings` 对象。特别地，它会从 `SettingsManager` 中读取**导入设置**的 `projectAdjacentFolder` 和 `customFolderPath` 值，用于填充导出设置。

3.  **实时保存**: `exportSettings` 对象被立即传递给 `settingsManager.saveExportSettings()`。

4.  **数据存储**: `SettingsManager` 将这个 `exportSettings` 对象作为一个**嵌套属性**，存储在 `localStorage` 的 `eagle2ae-import-settings` 主键下。它不是一个独立的存储项。

### 关键代码示例

```javascript
// 位于 main.js，展示了如何从UI收集所有导出设置
getExportSettingsFromUI() {
    const exportMode = document.querySelector('input[name="export-mode"]:checked')?.value || 'project_adjacent';
    
    // 直接读取导入模式的设置
    const importSettings = this.settingsManager.getSettings();
    
    const result = {
        mode: exportMode,
        // 复用导入设置的文件夹名称和路径
        projectAdjacentFolder: importSettings.projectAdjacentFolder || 'Eagle_Assets',
        customExportPath: importSettings.customFolderPath || '',
        // 读取各个复选框的状态
        autoCopy: document.getElementById('export-auto-copy')?.checked,
        burnAfterReading: document.getElementById('export-burn-after-reading')?.checked,
        addTimestamp: document.getElementById('export-add-timestamp')?.checked,
        createSubfolders: document.getElementById('export-create-subfolders')?.checked
    };

    return result;
}
```