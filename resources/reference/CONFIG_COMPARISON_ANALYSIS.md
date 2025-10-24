# Eagle2Ae 配置系统对比分析

## 📊 当前实现 vs 预设文件对比

### 当前实现（代码中）

**存储方式**: localStorage (单面板)
- `eagle2ae_importSettings` - 导入设置
- `eagle2ae_userPreferences` - 用户偏好
- `eagle2ae_recentFolders` - 最近文件夹

**数据结构**:
```javascript
// importSettings (存储在 localStorage)
{
  mode: 'project_adjacent',
  projectAdjacentFolder: 'Eagle_Assets',
  customFolderPath: '',
  addToComposition: true,
  noImportSubMode: 'normal',
  timelineOptions: {
    enabled: true,
    placement: 'current_time'
  },
  fileManagement: {
    keepOriginalName: true,
    addTimestamp: false,
    createTagFolders: false,
    deleteFromEagle: false
  },
  soundSettings: {
    enabled: true,
    volume: 60
  },
  exportSettings: {
    mode: 'desktop',
    projectAdjacentFolder: 'Eagle_Assets',
    customExportPath: '',
    autoCopy: true,
    addTimestamp: false,
    createSubfolders: false
  }
}

// userPreferences (存储在 localStorage)
{
  lastUsedMode: 'project_adjacent',        // ❌ 需要移除
  favoriteFolder: '',
  autoSaveSettings: true,                  // ❌ 需要移除
  showWelcomeWizard: true,                 // ❌ 需要移除
  theme: 'ae_native',                      // ❌ 需要移除 ae_native
  communicationPort: 8080,
  lastUsedExportMode: 'desktop',           // ❌ 需要移除
  favoriteExportFolder: ''
}

// recentFolders (存储在 localStorage)
['path1', 'path2', ...]
```

---

### 预设文件（新设计）

**存储方式**: JSON文件 (多面板)
- `resources/reference/Eagle2Ae-Presets.json`

**数据结构**:
```javascript
{
  version: '2.0.0',
  metadata: { ... },
  globalSettings: {
    communicationPort: 8080,
    autoSaveSettings: true,
    eagleServerUrl: 'http://localhost:8080'
  },
  panels: {
    'com.yanrouya.eagle2ae.panel1': {
      name: '默认配置',
      description: '...',
      lastUsed: '2025-10-24T...',
      importSettings: { ... },
      userPreferences: {
        favoriteFolder: '',
        favoriteExportFolder: '',
        communicationPort: 8080
      },
      uiSettings: {
        showThemeButton: true,
        showLanguageButton: true,
        showLogButton: true,
        showProjectInfo: false,
        showLogPanel: false,
        showHeader: true,
        fullscreenMode: false,
        theme: 'dark',
        language: 'zh-CN'
      },
      projectAdjacentSettings: { ... },
      customFolderSettings: {
        folderPath: '',
        recentFolders: [],
        directoryHandle: {}
      }
    }
  }
}
```

---

## 🔍 主要差异分析

### 1. 存储方式差异

| 项目 | 当前实现 | 预设文件 | 影响 |
|------|---------|---------|------|
| **存储位置** | localStorage | JSON文件 | 需要实现文件读写 |
| **面板支持** | 单面板 | 多面板 | 需要面板ID识别 |
| **全局设置** | 无 | 有 | 需要添加全局设置层 |
| **元数据** | 无 | 有 | 需要添加版本和时间戳 |

### 2. 数据结构差异

#### ❌ 需要移除的字段

| 字段 | 位置 | 原因 |
|------|------|------|
| `userPreferences.lastUsedMode` | userPreferences | 应该按预设启用，不需要记录 |
| `userPreferences.lastUsedExportMode` | userPreferences | 同上 |
| `userPreferences.showWelcomeWizard` | userPreferences | 当前没有此功能 |
| `userPreferences.autoSaveSettings` | userPreferences | 默认自动保存，不需要开关 |
| `userPreferences.theme` | userPreferences | 移到 uiSettings.theme |

#### ✅ 需要添加的字段

| 字段 | 位置 | 说明 |
|------|------|------|
| `version` | 顶层 | 配置版本号 |
| `metadata` | 顶层 | 元数据（创建时间、修改时间等） |
| `globalSettings` | 顶层 | 全局设置 |
| `panels` | 顶层 | 面板配置容器 |
| `name` | 面板 | 面板名称 |
| `description` | 面板 | 面板描述 |
| `lastUsed` | 面板 | 最后使用时间 |
| `uiSettings` | 面板 | UI显示设置（新增） |
| `uiSettings.theme` | uiSettings | 主题设置（从userPreferences移入） |
| `uiSettings.language` | uiSettings | 语言设置（新增） |
| `uiSettings.showThemeButton` | uiSettings | 显示主题按钮 |
| `uiSettings.showLanguageButton` | uiSettings | 显示语言按钮 |
| `uiSettings.showLogButton` | uiSettings | 显示日志按钮 |
| `uiSettings.showProjectInfo` | uiSettings | 显示项目信息 |
| `uiSettings.showLogPanel` | uiSettings | 显示日志面板 |
| `uiSettings.showHeader` | uiSettings | 显示标题栏 |
| `uiSettings.fullscreenMode` | uiSettings | 独显模式 |
| `projectAdjacentSettings` | 面板 | 项目旁设置（新增） |
| `customFolderSettings` | 面板 | 自定义文件夹设置（新增） |
| `customFolderSettings.recentFolders` | customFolderSettings | 最近文件夹（从顶层移入） |

#### 🔄 需要调整的字段

| 字段 | 当前位置 | 新位置 | 说明 |
|------|---------|--------|------|
| `theme` | userPreferences | uiSettings.theme | 统一UI设置 |
| `recentFolders` | 独立存储 | customFolderSettings.recentFolders | 归入面板配置 |
| `exportSettings.burnAfterReading` | 不存在 | exportSettings.burnAfterReading | 新增阅后即焚功能 |

---

## 📋 迁移计划

### 阶段1: 更新常量定义

**文件**: `js/constants/ImportSettings.js`

需要修改:
```javascript
// ❌ 移除
const DEFAULT_USER_PREFERENCES = {
  lastUsedMode: ImportModes.PROJECT_ADJACENT,  // 移除
  autoSaveSettings: true,                      // 移除
  showWelcomeWizard: true,                     // 移除
  theme: 'ae_native',                          // 移除 ae_native
  lastUsedExportMode: ExportModes.DESKTOP,     // 移除
  // ... 保留其他
}

// ✅ 修改为
const DEFAULT_USER_PREFERENCES = {
  favoriteFolder: '',
  favoriteExportFolder: '',
  communicationPort: 8080
}

// ✅ 新增
const DEFAULT_UI_SETTINGS = {
  showThemeButton: true,
  showLanguageButton: true,
  showLogButton: true,
  showProjectInfo: true,
  showLogPanel: true,
  showHeader: true,
  fullscreenMode: false,
  theme: 'dark',  // 只有 dark 和 light
  language: 'zh-CN'
}

const DEFAULT_GLOBAL_SETTINGS = {
  communicationPort: 8080,
  autoSaveSettings: true,
  eagleServerUrl: 'http://localhost:8080'
}

// ✅ 新增导出设置字段
const DEFAULT_EXPORT_SETTINGS = {
  mode: ExportModes.DESKTOP,
  projectAdjacentFolder: 'Eagle_Assets',
  customExportPath: '',
  autoCopy: true,
  burnAfterReading: true,  // 新增
  addTimestamp: false,
  createSubfolders: false
}
```

### 阶段2: 更新 SettingsManager

**文件**: `js/services/SettingsManager.js`

需要修改:
1. 添加 `uiSettings` 的加载和保存
2. 移除 `lastUsedMode`, `lastUsedExportMode`, `showWelcomeWizard`, `autoSaveSettings`
3. 将 `theme` 从 `userPreferences` 移到 `uiSettings`
4. 添加 `language` 到 `uiSettings`
5. 添加 `recentFolders` 到面板配置中

```javascript
class SettingsManager {
  constructor() {
    // ... 现有代码
    this.uiSettings = null;  // ✅ 新增
  }

  init() {
    this.loadSettings();
    this.loadPreferences();
    this.loadUISettings();      // ✅ 新增
    this.loadRecentFolders();
  }

  // ✅ 新增方法
  loadUISettings() {
    try {
      const stored = localStorage.getItem('eagle2ae_uiSettings');
      if (stored) {
        this.uiSettings = JSON.parse(stored);
      } else {
        this.uiSettings = { ...DEFAULT_UI_SETTINGS };
      }
    } catch (error) {
      this.uiSettings = { ...DEFAULT_UI_SETTINGS };
    }
  }

  // ✅ 新增方法
  saveUISettings(newUISettings) {
    try {
      this.uiSettings = { ...this.uiSettings, ...newUISettings };
      localStorage.setItem('eagle2ae_uiSettings', JSON.stringify(this.uiSettings));
      this.notifyListeners('uiSettings', this.uiSettings);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ✅ 新增方法
  getUISettings() {
    return { ...this.uiSettings };
  }
}
```

### 阶段3: 创建多面板配置管理器

**新文件**: `js/services/MultiPanelConfigManager.js`

功能:
1. 读取和保存 JSON 配置文件
2. 管理多个面板的配置
3. 支持全局设置
4. 配置迁移（从 localStorage 到 JSON 文件）
5. 面板ID识别

```javascript
class MultiPanelConfigManager {
  constructor() {
    this.configFilePath = 'resources/reference/Eagle2Ae-Presets.json';
    this.currentPanelId = this.getCurrentPanelId();
    this.config = null;
  }

  async init() {
    await this.loadConfig();
    await this.migrateFromLocalStorage();  // 迁移旧配置
  }

  getCurrentPanelId() {
    // 从 CEP 获取当前面板ID
    const csInterface = new CSInterface();
    return csInterface.getExtensionID();
  }

  async loadConfig() {
    // 从文件加载配置
  }

  async saveConfig() {
    // 保存配置到文件
  }

  async migrateFromLocalStorage() {
    // 从 localStorage 迁移到 JSON 文件
    const oldSettings = localStorage.getItem('eagle2ae_importSettings');
    const oldPreferences = localStorage.getItem('eagle2ae_userPreferences');
    
    if (oldSettings || oldPreferences) {
      // 迁移逻辑
      console.log('检测到旧配置，开始迁移...');
      // ... 迁移代码
    }
  }
}
```

### 阶段4: 更新主程序

**文件**: `js/main.js`

需要修改:
1. 使用新的配置管理器
2. 根据 `uiSettings` 控制UI显示
3. 支持主题和语言切换

```javascript
// ❌ 旧代码
const settingsManager = new SettingsManager();

// ✅ 新代码
const configManager = new MultiPanelConfigManager();
await configManager.init();

// 根据 uiSettings 控制UI
const uiSettings = configManager.getUISettings();
if (!uiSettings.showProjectInfo) {
  document.getElementById('project-info').style.display = 'none';
}
if (uiSettings.fullscreenMode) {
  enableFullscreenMode();
}

// 应用主题
applyTheme(uiSettings.theme);

// 应用语言
applyLanguage(uiSettings.language);
```

---

## 🎯 优化建议

### 1. 配置文件结构优化

#### 建议1: 简化嵌套层级
当前 `exportSettings` 嵌套在 `importSettings` 中，建议提升到面板顶层：

```javascript
// ❌ 当前
{
  importSettings: {
    exportSettings: { ... }
  }
}

// ✅ 建议
{
  importSettings: { ... },
  exportSettings: { ... }
}
```

**理由**: 导入和导出是两个独立的功能，不应该嵌套

#### 建议2: 合并相关设置
`projectAdjacentSettings` 和 `customFolderSettings` 可以合并：

```javascript
// ❌ 当前
{
  projectAdjacentSettings: {
    folderName: 'Eagle_Assets'
  },
  customFolderSettings: {
    folderPath: '',
    recentFolders: []
  }
}

// ✅ 建议
{
  folderSettings: {
    projectAdjacentName: 'Eagle_Assets',
    customPath: '',
    recentFolders: []
  }
}
```

### 2. 字段命名优化

#### 建议1: UI设置字段名简化

```javascript
// ❌ 当前
{
  showThemeButton: true,
  showLanguageButton: true,
  showLogButton: true
}

// ✅ 建议
{
  buttons: {
    theme: true,
    language: true,
    log: true
  },
  panels: {
    projectInfo: false,
    log: false
  },
  header: true,
  fullscreen: false,
  theme: 'dark',
  language: 'zh-CN'
}
```

#### 建议2: 布尔值字段统一命名

```javascript
// ❌ 混合命名
{
  addToComposition: true,      // 动词开头
  keepOriginalName: true,      // 动词开头
  enabled: true,               // 形容词
  fullscreenMode: false        // 名词
}

// ✅ 统一命名
{
  addToComposition: true,      // 统一用动词
  keepOriginalName: true,
  enableTimeline: true,
  enableFullscreen: false
}
```

### 3. 默认值优化

#### 建议1: 合理的默认值

```javascript
// 当前默认值
{
  addToComposition: true,           // ✅ 合理
  timelineOptions: {
    enabled: true,                  // ✅ 合理
    placement: 'current_time'       // ✅ 合理
  },
  fileManagement: {
    keepOriginalName: true,         // ✅ 合理
    addTimestamp: false,            // ✅ 合理
    createTagFolders: false,        // ✅ 合理
    deleteFromEagle: false          // ✅ 合理（安全）
  },
  exportSettings: {
    autoCopy: true,                 // ✅ 合理
    burnAfterReading: true,         // ⚠️ 建议改为 false（更安全）
    addTimestamp: false,            // ✅ 合理
    createSubfolders: false         // ✅ 合理
  }
}
```

### 4. 验证规则优化

#### 建议1: 添加更多验证规则

```javascript
const VALIDATION_RULES = {
  // ✅ 现有规则
  mode: {
    required: true,
    values: ['direct', 'project_adjacent', 'custom_folder']
  },
  
  // ✅ 建议添加
  'soundSettings.volume': {
    required: true,
    min: 0,
    max: 100,
    type: 'number'
  },
  'uiSettings.theme': {
    required: true,
    values: ['dark', 'light']
  },
  'uiSettings.language': {
    required: true,
    values: ['zh-CN', 'en-US']
  },
  'exportSettings.mode': {
    required: true,
    values: ['desktop', 'project_adjacent', 'custom_folder']
  }
}
```

---

## 📝 实施步骤

### 第1步: 更新常量定义 (1-2小时)
- [ ] 修改 `ImportSettings.js`
- [ ] 移除不需要的字段
- [ ] 添加新的默认值
- [ ] 更新验证规则

### 第2步: 更新 SettingsManager (2-3小时)
- [ ] 添加 `uiSettings` 支持
- [ ] 移除废弃字段的处理
- [ ] 添加新字段的处理
- [ ] 更新保存和加载逻辑

### 第3步: 创建 MultiPanelConfigManager (4-6小时)
- [ ] 实现文件读写
- [ ] 实现面板ID识别
- [ ] 实现配置迁移
- [ ] 实现全局设置管理

### 第4步: 更新主程序 (3-4小时)
- [ ] 集成新的配置管理器
- [ ] 实现UI控制逻辑
- [ ] 实现主题切换
- [ ] 实现语言切换

### 第5步: 测试和调试 (2-3小时)
- [ ] 测试配置读取
- [ ] 测试配置保存
- [ ] 测试配置迁移
- [ ] 测试多面板支持

### 第6步: 文档更新 (1-2小时)
- [ ] 更新使用文档
- [ ] 更新API文档
- [ ] 添加迁移指南

**总计**: 13-20小时

---

## 🚨 风险和注意事项

### 风险1: 配置迁移失败
**影响**: 用户配置丢失
**缓解措施**:
- 迁移前备份 localStorage
- 提供手动迁移工具
- 保留旧配置作为后备

### 风险2: 多面板ID识别错误
**影响**: 配置混乱
**缓解措施**:
- 充分测试面板ID获取
- 添加面板ID验证
- 提供面板ID调试工具

### 风险3: 文件读写权限问题
**影响**: 配置无法保存
**缓解措施**:
- 同时使用 localStorage 作为后备
- 添加权限检查
- 提供错误提示

### 风险4: 向后兼容性
**影响**: 旧版本无法使用
**缓解措施**:
- 保留旧的 SettingsManager
- 提供兼容模式
- 渐进式迁移

---

## ✅ 推荐方案

### 方案A: 渐进式迁移（推荐）

**阶段1**: 先更新单面板配置
1. 更新常量定义（移除废弃字段）
2. 添加 `uiSettings` 支持
3. 保持 localStorage 存储
4. 测试和验证

**阶段2**: 再实现多面板支持
1. 创建 `MultiPanelConfigManager`
2. 实现 JSON 文件读写
3. 实现配置迁移
4. 测试和验证

**优点**:
- 风险低，可以分步验证
- 出问题容易回滚
- 用户影响小

**缺点**:
- 时间较长
- 需要维护两套代码

### 方案B: 一次性迁移

直接实现完整的多面板配置系统

**优点**:
- 一步到位
- 代码更清晰

**缺点**:
- 风险高
- 测试工作量大
- 出问题影响大

---

**建议**: 采用方案A（渐进式迁移），先解决单面板配置的问题，再考虑多面板支持。

---

**最后更新**: 2025-10-24  
**分析版本**: 1.0
