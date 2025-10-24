# Eagle2Ae 预设保存覆盖分析

## 当前预设保存的内容

根据 `main.js` 的 `savePresetsSilently()` 函数，当前保存到预设 JSON 的内容：

```javascript
const exportPayload = {
    importSettings: settings,           // 从 SettingsManager 获取
    userPreferences: preferences,       // 从 SettingsManager 获取
    exportedAt: new Date().toISOString()
};
```

### 1. importSettings（来自 SettingsManager.getSettings()）

包含以下内容（来自 `ImportSettings.js` 的 `DEFAULT_IMPORT_SETTINGS`）：

✅ **已保存的配置：**
- `mode` - 导入模式
- `projectAdjacentFolder` - 项目旁文件夹名称
- `customFolderPath` - 自定义文件夹路径
- `addToComposition` - 是否添加到合成
- `noImportSubMode` - 不导入子模式
- `timelineOptions` - 时间轴选项
  - `enabled` - 是否启用
  - `placement` - 放置位置
- `fileManagement` - 文件管理设置
  - `keepOriginalName` - 保持原始文件名
  - `addTimestamp` - 添加时间戳
  - `createTagFolders` - 创建标签文件夹
  - `deleteFromEagle` - 从 Eagle 删除
- `soundSettings` - 音效设置
  - `enabled` - 是否启用
  - `volume` - 音量
- `exportSettings` - 导出设置
  - `mode` - 导出模式
  - `projectAdjacentFolder` - 项目旁文件夹
  - `customExportPath` - 自定义导出路径
  - `autoCopy` - 自动复制
  - `addTimestamp` - 添加时间戳
  - `createSubfolders` - 创建子文件夹

### 2. userPreferences（来自 SettingsManager.getPreferences()）

包含以下内容（来自 `ImportSettings.js` 的 `DEFAULT_USER_PREFERENCES`）：

✅ **已保存的配置：**
- `lastUsedMode` - 最后使用的模式
- `favoriteFolder` - 收藏的文件夹
- `autoSaveSettings` - 自动保存设置
- `showWelcomeWizard` - 显示欢迎向导
- `theme` - 主题
- `communicationPort` - 通信端口
- `lastUsedExportMode` - 最后使用的导出模式
- `favoriteExportFolder` - 收藏的导出文件夹

## 遗漏的配置项

### ❌ 1. UI 面板组设置（uiSettings）

**位置：** `index.html` 中的 UI 设置功能（第 5752 行开始）

**内容：**
```javascript
const uiSettings = {
    theme: true,        // 显示主题按钮
    language: true,     // 显示语言按钮
    log: true,          // 显示日志按钮
    projectInfo: true,  // 显示项目信息面板
    logPanel: true,     // 显示日志面板
    header: true,       // 显示标题栏
    fullscreen: false   // 独显模式
};
```

**当前存储方式：** 独立保存到 `localStorage.setItem('uiSettings', ...)`

**问题：** 未集成到预设 JSON 中，导致：
- 导出预设时不包含 UI 设置
- 导入预设时无法恢复 UI 设置
- 跨设备同步时 UI 设置丢失

### ❌ 2. 语言设置（language）

**位置：** `index.html` 中的语言切换功能（第 5586 行）

**内容：**
```javascript
localStorage.setItem('language', newLang);
localStorage.setItem('lang', newLang);
```

**当前存储方式：** 独立保存到 localStorage

**问题：** 
- 虽然 `userPreferences` 中没有 `language` 字段
- 语言设置未保存到预设 JSON
- 应该作为全局配置保存

### ❌ 3. 主题设置（aeTheme）

**位置：** `index.html` 中的主题切换功能（第 5652 行）

**内容：**
```javascript
localStorage.setItem('aeTheme', newTheme);
```

**当前存储方式：** 独立保存到 localStorage

**问题：**
- `userPreferences.theme` 存在但可能未同步
- localStorage 中的 `aeTheme` 和预设中的 `theme` 可能不一致

### ❌ 4. 项目旁复制设置（projectAdjacentSettings）

**位置：** `index.html` 中的项目旁设置（第 4260 行）

**内容：**
```javascript
localStorage.setItem('ae_extension_project_adjacent_settings', JSON.stringify(projectAdjacentSettings));
```

**当前存储方式：** 独立保存到 localStorage

**问题：** 未集成到预设 JSON 中

### ❌ 5. 自定义文件夹设置（customFolderSettings）

**位置：** `index.html` 中的自定义文件夹设置（第 4280 行）

**内容：**
```javascript
localStorage.setItem('ae_extension_custom_folder_settings', JSON.stringify(customFolderSettings));
```

**当前存储方式：** 独立保存到 localStorage

**问题：** 未集成到预设 JSON 中

### ❌ 6. 预设目录路径（presetsDirectory）

**位置：** `main.js` 中的预设目录设置

**内容：** 用户自定义的预设目录路径

**当前存储方式：** 保存在 `userPreferences.presetsDirectory`

**问题：** 可能已保存，需要确认

### ❌ 7. 导出设置中的 burnAfterReading

**位置：** 导出功能中的"阅后即焚"选项

**内容：** `exportSettings.burnAfterReading`

**当前状态：** 需要确认是否已包含在 `exportSettings` 中

## 建议的修复方案

### 方案 1：扩展现有预设结构（快速修复）

在 `savePresetsSilently()` 中添加遗漏的配置：

```javascript
const exportPayload = {
    importSettings: settings,
    userPreferences: preferences,
    
    // 新增：UI 面板组设置
    uiSettings: this.getUISettings(),
    
    // 新增：语言设置
    language: localStorage.getItem('language') || 'zh-CN',
    
    // 新增：主题设置
    aeTheme: localStorage.getItem('aeTheme') || 'dark',
    
    // 新增：项目旁设置
    projectAdjacentSettings: this.getProjectAdjacentSettings(),
    
    // 新增：自定义文件夹设置
    customFolderSettings: this.getCustomFolderSettings(),
    
    exportedAt: new Date().toISOString()
};
```

### 方案 2：采用新的配置结构（推荐，符合 SPEC）

按照多面板配置系统的设计，重构为：

```javascript
const exportPayload = {
    version: '2.0',
    global: {
        language: localStorage.getItem('language') || 'zh-CN',
        theme: localStorage.getItem('aeTheme') || 'dark',
        eagleServerUrl: 'http://localhost:8080',
        communicationPort: preferences.communicationPort || 8080,
        soundSettings: settings.soundSettings
    },
    panels: {
        main: {
            importSettings: settings,
            exportSettings: settings.exportSettings,
            uiSettings: this.getUISettings(),
            customSettings: {
                projectAdjacentSettings: this.getProjectAdjacentSettings(),
                customFolderSettings: this.getCustomFolderSettings()
            }
        }
    },
    shared: {
        recentFolders: [],
        favoriteSettings: []
    },
    metadata: {
        lastModified: new Date().toISOString(),
        lastActivePanel: 'main',
        configSource: 'user',
        version: '2.0'
    }
};
```

## 需要实现的辅助函数

### 1. getUISettings()
从 localStorage 或 DOM 状态读取 UI 设置

### 2. getProjectAdjacentSettings()
从 localStorage 读取项目旁设置

### 3. getCustomFolderSettings()
从 localStorage 读取自定义文件夹设置

### 4. applyUISettings(uiSettings)
应用 UI 设置到界面

### 5. applyProjectAdjacentSettings(settings)
应用项目旁设置

### 6. applyCustomFolderSettings(settings)
应用自定义文件夹设置

## 优先级建议

### 高优先级（立即修复）
1. ✅ UI 面板组设置（uiSettings）- 用户最常调整
2. ✅ 语言设置（language）- 全局配置
3. ✅ 主题设置（aeTheme）- 全局配置

### 中优先级（近期修复）
4. ⚠️ 项目旁复制设置（projectAdjacentSettings）
5. ⚠️ 自定义文件夹设置（customFolderSettings）

### 低优先级（可选）
6. ℹ️ 预设目录路径（presetsDirectory）- 可能已保存
7. ℹ️ burnAfterReading - 需要确认是否已包含

## 总结

**当前问题：**
- 至少有 5 个重要配置项未保存到预设 JSON
- 配置分散在 localStorage 和预设 JSON 中
- 导出/导入预设时会丢失部分用户设置

**建议：**
- 短期：快速修复，将遗漏的配置添加到现有预设结构
- 长期：按照 SPEC 重构为多面板配置系统
