# Eagle2Ae 预设配置完整说明

## 📋 配置文件结构

预设 JSON 文件包含以下顶层字段：

```json
{
  "importSettings": {...},      // 导入设置
  "userPreferences": {...},     // 用户偏好
  "uiSettings": {...},          // UI 面板组设置 ✅ 新增
  "language": "...",            // 语言设置 ✅ 新增
  "aeTheme": "...",             // 主题设置 ✅ 新增
  "projectAdjacentSettings": {...}, // 项目旁设置 ✅ 新增
  "customFolderSettings": {...},    // 自定义文件夹设置 ✅ 新增
  "exportedAt": "..."           // 导出时间戳
}
```

---

## 1️⃣ importSettings（导入设置）

### 基础导入设置

```json
{
  "mode": "custom_folder",              // 导入模式
  "projectAdjacentFolder": "Eagle_Assets", // 项目旁文件夹名称
  "customFolderPath": "[已选择] sound",    // 自定义文件夹路径
  "addToComposition": true,             // 是否添加到合成
  "noImportSubMode": "normal"           // 不导入子模式
}
```

#### mode（导入模式）
- **类型**：字符串
- **可选值**：
  - `"direct"` - 直接导入（不复制文件）
  - `"project_adjacent"` - 项目旁复制
  - `"custom_folder"` - 指定文件夹
- **说明**：决定文件导入到 AE 时的存储位置

#### projectAdjacentFolder
- **类型**：字符串
- **默认值**：`"Eagle_Assets"`
- **说明**：当 mode 为 `project_adjacent` 时，在项目文件旁创建的文件夹名称

#### customFolderPath
- **类型**：字符串
- **示例**：`"[已选择] sound"` 或 `"C:/Users/Administrator/Desktop/Assets"`
- **说明**：当 mode 为 `custom_folder` 时，文件复制到的目标路径
- **特殊值**：`"[已选择] sound"` 表示用户通过文件选择器选择了名为 "sound" 的文件夹
- **注意**：预设文件默认保存在 `C:\Users\{用户名}\Documents\Eagle2Ae-Ae\presets\Eagle2Ae-Presets.json`

#### addToComposition
- **类型**：布尔值
- **默认值**：`true`
- **说明**：导入后是否自动添加到当前合成

#### noImportSubMode
- **类型**：字符串
- **可选值**：
  - `"normal"` - 正常模式
  - `"pre_comp"` - 预合成模式
- **说明**：不导入时的子模式（保留用于未来功能）

### 时间轴选项

```json
{
  "timelineOptions": {
    "enabled": false,              // 是否启用时间轴选项
    "placement": "current_time"    // 放置位置
  }
}
```

#### timelineOptions.enabled
- **类型**：布尔值
- **默认值**：`true`
- **说明**：是否在时间轴上放置导入的素材

#### timelineOptions.placement
- **类型**：字符串
- **可选值**：
  - `"current_time"` - 当前时间
  - `"timeline_start"` - 时间轴开始
- **说明**：素材在时间轴上的放置位置

### 文件管理设置

```json
{
  "fileManagement": {
    "keepOriginalName": true,    // 保持原始文件名
    "addTimestamp": false,       // 添加时间戳
    "createTagFolders": false,   // 创建标签文件夹
    "deleteFromEagle": false     // 从 Eagle 删除
  }
}
```

#### fileManagement.keepOriginalName
- **类型**：布尔值
- **默认值**：`true`
- **说明**：复制文件时是否保持原始文件名

#### fileManagement.addTimestamp
- **类型**：布尔值
- **默认值**：`false`
- **说明**：是否在文件名前添加时间戳（如：`20240101_120000_image.png`）

#### fileManagement.createTagFolders
- **类型**：布尔值
- **默认值**：`false`
- **说明**：是否根据 Eagle 标签创建子文件夹

#### fileManagement.deleteFromEagle
- **类型**：布尔值
- **默认值**：`false`
- **说明**：导入后是否从 Eagle 中删除原文件（危险操作）

### 音效设置

```json
{
  "soundSettings": {
    "enabled": true,    // 是否启用音效
    "volume": 60        // 音量（0-100）
  }
}
```

#### soundSettings.enabled
- **类型**：布尔值
- **默认值**：`true`
- **说明**：是否启用操作音效

#### soundSettings.volume
- **类型**：数字
- **范围**：0-100
- **默认值**：60
- **说明**：音效音量百分比

### 导出设置

```json
{
  "exportSettings": {
    "mode": "desktop",                    // 导出模式
    "projectAdjacentFolder": "Eagle_Assets", // 项目旁文件夹
    "customExportPath": "[已选择] sound",    // 自定义导出路径
    "autoCopy": true,                     // 自动复制到剪贴板
    "addTimestamp": false,                // 添加时间戳前缀
    "createSubfolders": false,            // 创建子文件夹
    "burnAfterReading": true              // 阅后即焚
  }
}
```

#### exportSettings.mode
- **类型**：字符串
- **可选值**：
  - `"desktop"` - 导出到桌面
  - `"project_adjacent"` - 项目旁文件夹
  - `"custom_folder"` - 自定义文件夹
- **说明**：图层导出到 Eagle 时的临时存储位置

#### exportSettings.autoCopy
- **类型**：布尔值
- **默认值**：`true`
- **说明**：导出后是否自动复制文件到剪贴板

#### exportSettings.burnAfterReading
- **类型**：布尔值
- **默认值**：`false`
- **说明**：导入到 Eagle 后是否删除临时文件

---

## 2️⃣ userPreferences（用户偏好）

```json
{
  "lastUsedMode": "project_adjacent",      // 最后使用的导入模式
  "favoriteFolder": "",                    // 收藏的文件夹
  "autoSaveSettings": true,                // 自动保存设置
  "showWelcomeWizard": true,               // 显示欢迎向导
  "theme": "ae_native",                    // 主题（旧字段，已被 aeTheme 替代）
  "communicationPort": 8080,               // 通信端口
  "lastUsedExportMode": "project_adjacent", // 最后使用的导出模式
  "favoriteExportFolder": ""               // 收藏的导出文件夹
}
```

### 字段说明

#### lastUsedMode
- **类型**：字符串
- **说明**：记录用户最后使用的导入模式，下次启动时恢复

#### autoSaveSettings
- **类型**：布尔值
- **默认值**：`true`
- **说明**：是否自动保存设置变更

#### communicationPort
- **类型**：数字
- **范围**：1024-65535
- **默认值**：8080
- **说明**：与 Eagle 通信的端口号

---

## 3️⃣ uiSettings（UI 面板组设置）✅ 新增

```json
{
  "theme": true,        // 显示主题按钮
  "language": true,     // 显示语言按钮
  "log": true,          // 显示日志按钮
  "projectInfo": true,  // 显示项目信息面板
  "logPanel": true,     // 显示日志面板
  "header": true,       // 显示标题栏
  "fullscreen": false   // 独显模式
}
```

### 字段说明

所有字段都是布尔值，控制对应 UI 元素的显示/隐藏：

- **theme**：右上角的主题切换按钮
- **language**：右上角的语言切换按钮
- **log**：右上角的日志按钮
- **projectInfo**：项目信息面板（显示 AE 项目名称等）
- **logPanel**：底部的日志面板
- **header**：顶部标题栏
- **fullscreen**：独显模式（导入模式面板占满整个页面）

---

## 4️⃣ language（语言设置）✅ 新增

```json
"language": "en-US"
```

- **类型**：字符串
- **可选值**：
  - `"zh-CN"` - 简体中文
  - `"en-US"` - 英文
- **说明**：界面语言设置

---

## 5️⃣ aeTheme（主题设置）✅ 新增

```json
"aeTheme": "dark"
```

- **类型**：字符串
- **可选值**：
  - `"dark"` - 暗色主题
  - `"light"` - 亮色主题
  - `"ae_native"` - AE 原生主题（跟随 AE）
- **说明**：界面主题设置

---

## 6️⃣ projectAdjacentSettings（项目旁设置）✅ 新增

```json
{
  "folderName": "Eagle_Assets"
}
```

### 字段说明

#### folderName
- **类型**：字符串
- **默认值**：`"Eagle_Assets"`
- **说明**：项目旁复制模式下的文件夹名称
- **常用值**：
  - `"Eagle_Assets"`
  - `"Eagle_Import"`
  - `"Source_Files"`
  - `"Assets"`
  - 或自定义名称

---

## 7️⃣ customFolderSettings（自定义文件夹设置）✅ 新增

```json
{
  "folderPath": "[已选择] sound",
  "recentFolders": [
    "[已选择] sound"
  ],
  "directoryHandle": {}
}
```

### 字段说明

#### folderPath
- **类型**：字符串
- **示例**：`"[已选择] sound"` 或 `"C:/Users/xxx/Desktop/Assets"`
- **说明**：用户选择的自定义文件夹路径

#### recentFolders
- **类型**：字符串数组
- **说明**：最近使用的文件夹列表（最多保留 10 个）

#### directoryHandle
- **类型**：对象
- **说明**：浏览器文件系统 API 的目录句柄（用于 Web 环境）

---

## 8️⃣ exportedAt（导出时间戳）

```json
"exportedAt": "2025-10-24T02:26:57.618Z"
```

- **类型**：字符串（ISO 8601 格式）
- **说明**：预设文件的导出时间

---

## 🔍 特殊值说明：`"[已选择] sound"`

### 这是什么？

`"[已选择] sound"` 是一个**占位符字符串**，表示用户通过文件选择器选择了一个文件夹。

### 为什么这样设计？

1. **浏览器环境限制**
   - 在浏览器中，出于安全考虑，不能直接存储完整的文件系统路径
   - 只能存储用户选择的文件夹的"显示名称"

2. **跨平台兼容**
   - 不同操作系统的路径格式不同（Windows: `C:\`, Mac/Linux: `/`）
   - 使用占位符可以避免路径格式问题

3. **隐私保护**
   - 不暴露用户的完整文件系统路径
   - 只显示文件夹名称

### 格式说明

```
"[已选择] {文件夹名称}"
```

- `[已选择]` - 固定前缀，表示这是用户选择的路径
- `{文件夹名称}` - 用户选择的文件夹的名称

### 示例

```json
"customFolderPath": "[已选择] sound"        // 用户选择了名为 "sound" 的文件夹
"customFolderPath": "[已选择] Desktop"     // 用户选择了桌面
"customFolderPath": "[已选择] My Assets"   // 用户选择了 "My Assets" 文件夹
```

### 在 CEP 扩展中

在 After Effects CEP 扩展中，会存储完整路径：

```json
"customFolderPath": "C:/Users/Administrator/Desktop/Assets"
```

### 预设文件默认位置

- **Windows**: `C:\Users\{用户名}\Documents\Eagle2Ae-Ae\presets\Eagle2Ae-Presets.json`
- **Mac**: `~/Documents/Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json`

### 如何使用

代码中会检测这个占位符：

```javascript
if (customFolderPath.startsWith('[已选择]')) {
    // 这是浏览器环境，需要用户重新选择
    // 或使用 File System Access API 的 directoryHandle
} else {
    // 这是完整路径，可以直接使用
}
```

---

## 📊 配置优先级

当多个配置字段冲突时，优先级如下：

1. **uiSettings** - 最高优先级（直接控制 UI）
2. **language** / **aeTheme** - 全局设置
3. **importSettings** - 导入行为设置
4. **userPreferences** - 用户偏好（最低优先级）

---

## 🔄 配置更新流程

```
用户操作 UI
    ↓
更新对应的配置字段
    ↓
触发自动保存（防抖 600ms）
    ↓
保存到预设 JSON
    ↓
广播配置变更事件
    ↓
其他面板同步更新
```

---

## 📝 配置示例

### 最小配置

```json
{
  "importSettings": {
    "mode": "direct"
  },
  "userPreferences": {},
  "exportedAt": "2025-10-24T00:00:00.000Z"
}
```

### 完整配置（推荐）

参考 `resources/reference/Eagle2Ae-Presets.json` 文件。

### 自定义配置

```json
{
  "importSettings": {
    "mode": "project_adjacent",
    "projectAdjacentFolder": "My_Assets",
    "addToComposition": true,
    "timelineOptions": {
      "enabled": true,
      "placement": "timeline_start"
    }
  },
  "uiSettings": {
    "theme": true,
    "language": true,
    "log": false,
    "projectInfo": true,
    "logPanel": false,
    "header": false,
    "fullscreen": true
  },
  "language": "zh-CN",
  "aeTheme": "dark",
  "exportedAt": "2025-10-24T00:00:00.000Z"
}
```

---

## 🎯 总结

Eagle2Ae 预设文件包含：

1. **8 个顶层字段**（5 个新增）
2. **50+ 个配置项**
3. **完整的导入/导出设置**
4. **UI 自定义选项**
5. **跨平台兼容性**

所有配置都可以通过 UI 修改，并自动保存到预设文件中。
