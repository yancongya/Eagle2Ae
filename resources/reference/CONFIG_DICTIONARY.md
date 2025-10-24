# Eagle2Ae 配置字典

## 📖 配置变量说明

本文档详细说明配置文件中每个变量的作用、类型、可选值和使用场景。

---

## 🌐 顶层结构

### version
- **类型**: `string`
- **作用**: 配置文件版本号
- **格式**: `主版本.次版本.修订版` (如 "2.0.0")
- **说明**: 用于配置迁移和兼容性检查

### metadata
- **类型**: `object`
- **作用**: 配置文件的元信息
- **说明**: 记录配置的创建、修改历史

### globalSettings
- **类型**: `object`
- **作用**: 全局设置，所有面板共享
- **说明**: 影响所有面板的通用配置

### panels
- **类型**: `object`
- **作用**: 各面板的独立配置
- **说明**: 每个面板ID对应一个配置对象

---

## 📋 metadata (元数据)

### metadata.createdAt
- **类型**: `string` (ISO 8601日期时间)
- **作用**: 配置文件创建时间
- **示例**: `"2025-10-24T07:30:20.967Z"`
- **说明**: 自动生成，不需要手动修改

### metadata.lastModified
- **类型**: `string` (ISO 8601日期时间)
- **作用**: 最后修改时间
- **示例**: `"2025-10-24T11:56:21.835Z"`
- **说明**: 每次保存配置时自动更新

### metadata.modifiedBy
- **类型**: `string`
- **作用**: 最后修改配置的面板ID
- **示例**: `"com.yanrouya.eagle2ae.panel3"`
- **说明**: 用于追踪哪个面板最后修改了配置

### metadata.migratedFrom
- **类型**: `string`
- **作用**: 配置迁移来源
- **可选值**: `"single-panel"`, `"1.0.0"` 等
- **说明**: 记录配置是从哪个版本迁移而来

### metadata.migrationDate
- **类型**: `string` (ISO 8601日期时间)
- **作用**: 配置迁移日期
- **说明**: 记录配置迁移的时间

---

## 🌍 globalSettings (全局设置)

### globalSettings.communicationPort
- **类型**: `number`
- **作用**: Eagle服务器通信端口
- **范围**: `1024-65535`
- **默认值**: `8080`
- **说明**: 所有面板使用同一个端口与Eagle通信
- **注意**: 修改后需要重启Eagle插件

### globalSettings.autoSaveSettings
- **类型**: `boolean`
- **作用**: 是否自动保存设置
- **默认值**: `true`
- **说明**: 
  - `true`: 修改配置后自动保存
  - `false`: 需要手动保存配置

### globalSettings.eagleServerUrl
- **类型**: `string` (URL)
- **作用**: Eagle服务器地址
- **默认值**: `"http://localhost:8080"`
- **说明**: Eagle插件的HTTP服务器地址

---

## 🎛️ 面板配置 (panels.{panelId})

每个面板ID下包含以下配置：

### name
- **类型**: `string`
- **作用**: 面板显示名称
- **示例**: `"默认配置"`, `"快速预览"`, `"音频项目"`
- **说明**: 用户可自定义，显示在面板标题或菜单中

### description
- **类型**: `string`
- **作用**: 面板描述
- **示例**: `"通用的默认配置，适合日常使用"`
- **说明**: 帮助用户理解该面板的用途

### lastUsed
- **类型**: `string` (ISO 8601日期时间)
- **作用**: 最后使用时间
- **说明**: 记录面板最后一次被使用的时间

---

## 📥 importSettings (导入设置)

### importSettings.mode
- **类型**: `string`
- **作用**: 导入模式
- **可选值**:
  - `"direct"`: 直接导入到AE项目
  - `"project_adjacent"`: 导入到项目文件旁的文件夹
  - `"custom_folder"`: 导入到自定义文件夹
- **默认值**: `"project_adjacent"`
- **使用场景**:
  - `direct`: 临时素材，不需要保存到磁盘
  - `project_adjacent`: 项目相关素材，便于管理
  - `custom_folder`: 固定素材库，多项目共享

### importSettings.projectAdjacentFolder
- **类型**: `string`
- **作用**: 项目旁文件夹名称
- **默认值**: `"Eagle_Assets"`
- **限制**: 1-50个字符，只能包含字母、数字、下划线、中文
- **说明**: 当 `mode="project_adjacent"` 时使用
- **示例**: `"Eagle_Assets"`, `"素材"`, `"Assets_2024"`

### importSettings.customFolderPath
- **类型**: `string`
- **作用**: 自定义文件夹路径
- **默认值**: `""`
- **说明**: 当 `mode="custom_folder"` 时使用
- **示例**: `"C:/Users/用户名/素材库"`, `"/Users/username/Assets"`

### importSettings.addToComposition
- **类型**: `boolean`
- **作用**: 是否添加到当前合成
- **默认值**: `true`
- **说明**:
  - `true`: 导入后自动添加到当前激活的合成
  - `false`: 仅导入到项目面板，不添加到合成

### importSettings.noImportSubMode
- **类型**: `string`
- **作用**: 不导入到合成时的子模式
- **可选值**:
  - `"normal"`: 普通导入
  - `"pre_comp"`: 创建预合成
- **默认值**: `"normal"`
- **说明**: 当 `addToComposition=false` 时的处理方式

---

## ⏱️ importSettings.timelineOptions (时间轴选项)

### timelineOptions.enabled
- **类型**: `boolean`
- **作用**: 是否启用时间轴放置
- **默认值**: `true`
- **说明**: 仅当 `addToComposition=true` 时生效

### timelineOptions.placement
- **类型**: `string`
- **作用**: 时间轴放置位置
- **可选值**:
  - `"current_time"`: 当前时间指示器位置
  - `"timeline_start"`: 时间轴起点(0帧)
- **默认值**: `"current_time"`
- **说明**: 控制素材在时间轴上的放置位置

---

## 📁 importSettings.fileManagement (文件管理)

### fileManagement.keepOriginalName
- **类型**: `boolean`
- **作用**: 保持原始文件名
- **默认值**: `true`
- **说明**:
  - `true`: 使用Eagle中的原始文件名
  - `false`: 可能会重命名文件

### fileManagement.addTimestamp
- **类型**: `boolean`
- **作用**: 添加时间戳到文件名
- **默认值**: `false`
- **说明**:
  - `true`: 文件名后添加时间戳，如 `image_20251024_123456.jpg`
  - `false`: 不添加时间戳

### fileManagement.createTagFolders
- **类型**: `boolean`
- **作用**: 根据Eagle标签创建子文件夹
- **默认值**: `false`
- **说明**:
  - `true`: 按标签分类创建文件夹
  - `false`: 所有文件放在同一文件夹

### fileManagement.deleteFromEagle
- **类型**: `boolean`
- **作用**: 导入后从Eagle删除原文件
- **默认值**: `false`
- **说明**:
  - `true`: 导入成功后从Eagle库中删除
  - `false`: 保留在Eagle库中
- **警告**: 启用此选项需谨慎，删除后无法恢复

---

## 🔊 importSettings.soundSettings (音效设置)

### soundSettings.enabled
- **类型**: `boolean`
- **作用**: 是否启用音效
- **默认值**: `true`
- **说明**: 控制操作成功/失败时的提示音

### soundSettings.volume
- **类型**: `number`
- **作用**: 音量大小
- **范围**: `0-100`
- **默认值**: `60`
- **说明**: 0=静音, 100=最大音量

---

## 📤 importSettings.exportSettings (导出设置)

### exportSettings.mode
- **类型**: `string`
- **作用**: 导出模式
- **可选值**:
  - `"desktop"`: 导出到桌面
  - `"project_adjacent"`: 导出到项目旁文件夹
  - `"custom_folder"`: 导出到自定义文件夹
- **默认值**: `"desktop"`
- **使用场景**:
  - `desktop`: 快速导出，临时文件
  - `project_adjacent`: 项目相关导出
  - `custom_folder`: 固定导出位置

### exportSettings.projectAdjacentFolder
- **类型**: `string`
- **作用**: 项目旁文件夹名称
- **默认值**: `"Eagle_Assets"`
- **说明**: 当 `mode="project_adjacent"` 时使用

### exportSettings.customExportPath
- **类型**: `string`
- **作用**: 自定义导出路径
- **默认值**: `""`
- **说明**: 当 `mode="custom_folder"` 时使用

### exportSettings.autoCopy
- **类型**: `boolean`
- **作用**: 自动复制到剪贴板
- **默认值**: `true`
- **说明**:
  - `true`: 导出后自动复制文件路径到剪贴板
  - `false`: 不自动复制

### exportSettings.burnAfterReading
- **类型**: `boolean`
- **作用**: 阅后即焚（导出后自动删除临时文件）
- **默认值**: `true`
- **说明**:
  - `true`: 复制到剪贴板后删除临时文件
  - `false`: 保留临时文件

### exportSettings.addTimestamp
- **类型**: `boolean`
- **作用**: 添加时间戳到导出文件名
- **默认值**: `false`
- **说明**: 避免文件名冲突

### exportSettings.createSubfolders
- **类型**: `boolean`
- **作用**: 创建子文件夹
- **默认值**: `false`
- **说明**:
  - `true`: 按日期或类型创建子文件夹
  - `false`: 所有文件放在同一文件夹

---

## 👤 userPreferences (用户偏好)

### userPreferences.favoriteFolder
- **类型**: `string`
- **作用**: 收藏的文件夹路径
- **默认值**: `""`
- **说明**: 用户可以收藏常用文件夹，快速访问
- **使用场景**: 经常使用同一个文件夹时，可以收藏以便快速选择

### userPreferences.favoriteExportFolder
- **类型**: `string`
- **作用**: 收藏的导出文件夹
- **默认值**: `""`
- **说明**: 快速访问常用导出位置
- **使用场景**: 经常导出到同一个位置时使用

### userPreferences.communicationPort
- **类型**: `number`
- **作用**: 通信端口（覆盖全局设置）
- **范围**: `1024-65535`
- **默认值**: `8080`
- **说明**: 如果设置，会覆盖 `globalSettings.communicationPort`
- **使用场景**: 当需要不同面板使用不同端口时（如避免冲突）

---

## 🎨 uiSettings (UI显示设置)

### uiSettings.showThemeButton
- **类型**: `boolean`
- **作用**: 显示主题切换按钮
- **默认值**: `true`
- **说明**: 控制标题栏是否显示主题切换按钮

### uiSettings.showLanguageButton
- **类型**: `boolean`
- **作用**: 显示语言切换按钮
- **默认值**: `true`
- **说明**: 控制标题栏是否显示语言切换按钮

### uiSettings.showLogButton
- **类型**: `boolean`
- **作用**: 显示日志按钮
- **默认值**: `true`
- **说明**: 控制标题栏是否显示日志按钮

### uiSettings.showProjectInfo
- **类型**: `boolean`
- **作用**: 显示项目信息面板
- **默认值**: `true`
- **说明**: 控制是否显示AE项目和Eagle库信息

### uiSettings.showLogPanel
- **类型**: `boolean`
- **作用**: 显示日志面板
- **默认值**: `true`
- **说明**: 控制是否显示日志输出面板

### uiSettings.showHeader
- **类型**: `boolean`
- **作用**: 显示标题栏
- **默认值**: `true`
- **说明**: 控制是否显示顶部标题栏

### uiSettings.fullscreenMode
- **类型**: `boolean`
- **作用**: 独显模式
- **默认值**: `false`
- **说明**:
  - `true`: 只显示核心功能按钮，隐藏其他UI
  - `false`: 显示完整界面
- **适用场景**: 小屏幕、快速操作、专注模式

### uiSettings.theme
- **类型**: `string`
- **作用**: 界面主题
- **可选值**:
  - `"dark"`: 深色主题
  - `"light"`: 浅色主题
- **默认值**: `"dark"`
- **说明**: 控制面板的明暗主题

### uiSettings.language
- **类型**: `string`
- **作用**: 界面语言
- **可选值**:
  - `"zh-CN"`: 简体中文
  - `"en-US"`: 英语
- **默认值**: `"zh-CN"`
- **说明**: 控制面板界面语言

---

---

## 📂 projectAdjacentSettings (项目旁文件夹设置)

### projectAdjacentSettings.folderName
- **类型**: `string`
- **作用**: 文件夹名称
- **默认值**: `"Eagle_Assets"`
- **说明**: 项目旁文件夹的名称

---

## 🗂️ customFolderSettings (自定义文件夹设置)

### customFolderSettings.folderPath
- **类型**: `string`
- **作用**: 文件夹路径
- **默认值**: `""`
- **说明**: 用户选择的自定义文件夹路径

### customFolderSettings.recentFolders
- **类型**: `array` (字符串数组)
- **作用**: 最近使用的文件夹列表
- **默认值**: `[]`
- **限制**: 最多保存10个
- **说明**: 记录用户最近使用的文件夹，方便快速选择

### customFolderSettings.directoryHandle
- **类型**: `object`
- **作用**: 文件系统访问句柄
- **默认值**: `{}`
- **说明**: File System Access API 的句柄对象，用于访问文件系统

---

## 📊 配置优先级

当同一设置在多个地方存在时，优先级如下：

1. **面板级别设置** (最高优先级)
   - 例如: `userPreferences.communicationPort`
   
2. **全局设置**
   - 例如: `globalSettings.communicationPort`
   
3. **默认值** (最低优先级)
   - 代码中定义的默认值

---

## 🔗 配置关联关系

### 导入模式相关
- `importSettings.mode = "project_adjacent"` 时：
  - 需要 `importSettings.projectAdjacentFolder`
  
- `importSettings.mode = "custom_folder"` 时：
  - 需要 `importSettings.customFolderPath`

### 合成相关
- `importSettings.addToComposition = true` 时：
  - `importSettings.timelineOptions` 生效
  
- `importSettings.addToComposition = false` 时：
  - `importSettings.noImportSubMode` 生效

### 导出模式相关
- `exportSettings.mode = "project_adjacent"` 时：
  - 需要 `exportSettings.projectAdjacentFolder`
  
- `exportSettings.mode = "custom_folder"` 时：
  - 需要 `exportSettings.customExportPath`

### UI相关
- `uiSettings.fullscreenMode = true` 时：
  - 其他UI设置可能被忽略
  - 只显示核心功能

### 主题和语言
- `uiSettings.theme`: 控制明暗主题
- `uiSettings.language`: 控制界面语言
- 这两个设置在 `uiSettings` 中统一管理

---

## 💡 使用建议

### 快速预览配置
```json
{
  "importSettings.mode": "project_adjacent",
  "importSettings.addToComposition": false,
  "uiSettings.fullscreenMode": true,
  "uiSettings.showProjectInfo": false,
  "uiSettings.showLogPanel": false
}
```

### 音频项目配置
```json
{
  "importSettings.mode": "project_adjacent",
  "importSettings.addToComposition": true,
  "importSettings.timelineOptions.placement": "current_time",
  "importSettings.soundSettings.volume": 80
}
```

### 批量导入配置
```json
{
  "importSettings.mode": "custom_folder",
  "importSettings.addToComposition": false,
  "importSettings.fileManagement.createTagFolders": true
}
```

---

**最后更新**: 2025-10-24  
**配置版本**: 2.0.0
