# 多面板配置系统设计文档

## 1. 概述

本设计文档描述了 Eagle2Ae 扩展的多面板配置系统架构，包括配置结构、存储机制、同步策略和 API 设计。

### 1.1 设计目标

- 支持多个独立面板的配置管理
- 统一 CEP 扩展和 Web Demo 模式的配置存储
- 保持向后兼容性
- 提供高性能的配置读写
- 实现配置的实时同步

### 1.2 设计原则

- **单一职责**：每个模块只负责一个功能
- **开闭原则**：对扩展开放，对修改关闭
- **依赖倒置**：依赖抽象而非具体实现
- **接口隔离**：提供最小化的接口
- **DRY 原则**：避免代码重复

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (面板)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Main     │  │ Import   │  │ Quick    │              │
│  │ Panel    │  │ Panel    │  │ Panel    │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
└───────┼─────────────┼─────────────┼─────────────────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
┌─────────────────────▼─────────────────────────────────┐
│              SettingsManager (核心)                    │
│  ┌──────────────────────────────────────────────┐    │
│  │  - getCurrentPanelId()                       │    │
│  │  - getPanelConfig(panelId)                   │    │
│  │  - updatePanelConfig(panelId, config)        │    │
│  │  - getGlobalConfig()                         │    │
│  │  - updateGlobalConfig(config)                │    │
│  │  - migrateOldConfig()                        │    │
│  └──────────────────────────────────────────────┘    │
└───────────────────┬───────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼─────────┐
│ CEPStorage     │    │ DemoStorage      │
│ Adapter        │    │ Adapter          │
│                │    │                  │
│ - localStorage │    │ - localStorage   │
│ - FileSystem   │    │ - Download/Upload│
└────────────────┘    └──────────────────┘
```

### 2.2 模块划分

#### 2.2.1 SettingsManager（核心管理器）
- 职责：配置的加载、保存、验证、同步
- 依赖：StorageAdapter、ConfigValidator、EventBus

#### 2.2.2 StorageAdapter（存储适配器）
- 职责：抽象不同环境的存储实现
- 实现：CEPStorageAdapter、DemoStorageAdapter

#### 2.2.3 ConfigValidator（配置验证器）
- 职责：验证配置的有效性和完整性
- 功能：类型检查、范围检查、必填项检查

#### 2.2.4 ConfigMigrator（配置迁移器）
- 职责：处理配置版本升级和迁移
- 功能：版本检测、数据转换、备份恢复

#### 2.2.5 EventBus（事件总线）
- 职责：配置变更的事件广播和监听
- 实现：CEP 事件（扩展模式）、Storage 事件（Demo 模式）

## 3. 数据模型设计

### 3.1 配置结构定义


```typescript
interface ConfigStructure {
  version: string;           // 配置版本号，如 "2.0"
  global: GlobalConfig;      // 全局配置
  panels: PanelConfigs;      // 各面板配置
  shared: SharedConfig;      // 共享配置
  metadata: Metadata;        // 元数据
}

interface GlobalConfig {
  language: string;          // 语言设置
  theme: string;             // 主题设置
  eagleServerUrl: string;    // Eagle 服务器地址
  communicationPort: number; // 通信端口
  soundSettings: {           // 音效设置
    enabled: boolean;
    volume: number;
  };
}

interface PanelConfigs {
  main: PanelConfig;         // 主面板配置
  import: PanelConfig;       // 导入面板配置
  quick: PanelConfig;        // 快速工具面板配置
}

interface PanelConfig {
  importSettings: ImportSettings;  // 导入设置
  exportSettings: ExportSettings;  // 导出设置
  uiSettings: UISettings;          // UI 面板组设置
  customSettings?: any;            // 自定义设置（扩展用）
}

interface UISettings {
  theme: boolean;            // 显示主题按钮
  language: boolean;         // 显示语言按钮
  log: boolean;              // 显示日志按钮
  projectInfo: boolean;      // 显示项目信息面板
  logPanel: boolean;         // 显示日志面板
  header: boolean;           // 显示标题栏
  fullscreen: boolean;       // 独显模式
}

interface SharedConfig {
  recentFolders: string[];   // 最近使用的文件夹
  favoriteSettings: any[];   // 收藏的设置
}

interface Metadata {
  lastModified: string;      // 最后修改时间（ISO 8601）
  lastActivePanel: string;   // 最后活跃的面板 ID
  configSource: string;      // 配置来源（user/imported/default）
}
```

### 3.2 配置作用域定义

```typescript
enum ConfigScope {
  GLOBAL = 'global',         // 全局作用域，所有面板共享
  PANEL = 'panel',           // 面板作用域，各面板独立
  SHARED = 'shared'          // 共享作用域，跨面板共享数据
}

// 配置字段的作用域映射
const CONFIG_SCOPE_MAP = {
  'language': ConfigScope.GLOBAL,
  'theme': ConfigScope.GLOBAL,
  'eagleServerUrl': ConfigScope.GLOBAL,
  'communicationPort': ConfigScope.GLOBAL,
  'soundSettings': ConfigScope.GLOBAL,
  'importSettings': ConfigScope.PANEL,
  'exportSettings': ConfigScope.PANEL,
  'uiSettings': ConfigScope.PANEL,
  'recentFolders': ConfigScope.SHARED,
  'favoriteSettings': ConfigScope.SHARED
};
```

## 4. 核心组件设计

### 4.1 SettingsManager 类设计

```typescript
class SettingsManager {
  private config: ConfigStructure;
  private storageAdapter: StorageAdapter;
  private validator: ConfigValidator;
  private migrator: ConfigMigrator;
  private eventBus: EventBus;
  private cache: Map<string, any>;
  
  // 初始化
  constructor(storageAdapter: StorageAdapter);
  async init(): Promise<void>;
  
  // 面板 ID 管理
  getCurrentPanelId(): string;
  setCurrentPanelId(panelId: string): void;
  
  // 全局配置
  getGlobalConfig(): GlobalConfig;
  updateGlobalConfig(updates: Partial<GlobalConfig>): Promise<boolean>;
  
  // 面板配置
  getPanelConfig(panelId: string): PanelConfig;
  updatePanelConfig(panelId: string, updates: Partial<PanelConfig>): Promise<boolean>;
  getCurrentPanelConfig(): PanelConfig;
  updateCurrentPanelConfig(updates: Partial<PanelConfig>): Promise<boolean>;
  
  // 共享配置
  getSharedConfig(): SharedConfig;
  updateSharedConfig(updates: Partial<SharedConfig>): Promise<boolean>;
  
  // 字段级操作
  getField(path: string, panelId?: string): any;
  updateField(path: string, value: any, panelId?: string): Promise<boolean>;
  
  // 配置管理
  exportConfig(options?: ExportOptions): Promise<string>;
  importConfig(configJson: string, options?: ImportOptions): Promise<boolean>;
  resetConfig(scope?: ConfigScope): Promise<boolean>;
  
  // 配置迁移
  migrateOldConfig(): Promise<boolean>;
  
  // 事件监听
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
}
```

### 4.2 StorageAdapter 接口设计

```typescript
interface StorageAdapter {
  // 基础操作
  load(): Promise<ConfigStructure>;
  save(config: ConfigStructure): Promise<boolean>;
  
  // 导入导出
  export(config: ConfigStructure, filename?: string): Promise<string>;
  import(): Promise<ConfigStructure>;
  
  // 环境检测
  isAvailable(): boolean;
  getStorageType(): 'cep' | 'demo';
}

// CEP 存储适配器
class CEPStorageAdapter implements StorageAdapter {
  private readonly STORAGE_KEY = 'eagle2ae_config';
  
  async load(): Promise<ConfigStructure> {
    // 1. 尝试从 localStorage 加载
    // 2. 如果不存在，尝试从文件系统加载
    // 3. 如果都不存在，返回默认配置
  }
  
  async save(config: ConfigStructure): Promise<boolean> {
    // 1. 保存到 localStorage
    // 2. 可选：保存到文件系统（用户文档目录）
  }
  
  async export(config: ConfigStructure, filename?: string): Promise<string> {
    // 使用 CEP 文件系统 API 保存文件
  }
  
  async import(): Promise<ConfigStructure> {
    // 使用 CEP 文件选择对话框导入
  }
}

// Demo 存储适配器
class DemoStorageAdapter implements StorageAdapter {
  private readonly STORAGE_KEY = 'eagle2ae_demo_config';
  
  async load(): Promise<ConfigStructure> {
    // 从 localStorage 加载
  }
  
  async save(config: ConfigStructure): Promise<boolean> {
    // 保存到 localStorage
  }
  
  async export(config: ConfigStructure, filename?: string): Promise<string> {
    // 生成 JSON 文件并触发浏览器下载
  }
  
  async import(): Promise<ConfigStructure> {
    // 创建文件输入元素，让用户选择文件
  }
}
```

### 4.3 ConfigValidator 类设计

```typescript
class ConfigValidator {
  // 验证完整配置
  validate(config: ConfigStructure): ValidationResult;
  
  // 验证全局配置
  validateGlobalConfig(config: GlobalConfig): ValidationResult;
  
  // 验证面板配置
  validatePanelConfig(config: PanelConfig): ValidationResult;
  
  // 验证字段
  validateField(path: string, value: any): ValidationResult;
  
  // 验证规则定义
  private rules: Map<string, ValidationRule>;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

### 4.4 ConfigMigrator 类设计

```typescript
class ConfigMigrator {
  // 检测配置版本
  detectVersion(config: any): string;
  
  // 是否需要迁移
  needsMigration(config: any): boolean;
  
  // 执行迁移
  migrate(oldConfig: any): ConfigStructure;
  
  // 版本特定的迁移函数
  private migrateV1ToV2(config: any): ConfigStructure;
  
  // 备份旧配置
  private backup(config: any): void;
}
```

### 4.5 EventBus 类设计

```typescript
class EventBus {
  // 发布事件
  emit(event: string, data: any): void;
  
  // 订阅事件
  on(event: string, callback: Function): void;
  
  // 取消订阅
  off(event: string, callback: Function): void;
  
  // CEP 模式：使用 CSInterface 事件
  private emitCEPEvent(event: string, data: any): void;
  private listenCEPEvent(event: string, callback: Function): void;
  
  // Demo 模式：使用 Storage 事件
  private emitStorageEvent(event: string, data: any): void;
  private listenStorageEvent(callback: Function): void;
}

// 事件类型定义
enum ConfigEvent {
  GLOBAL_CONFIG_UPDATED = 'globalConfigUpdated',
  PANEL_CONFIG_UPDATED = 'panelConfigUpdated',
  SHARED_CONFIG_UPDATED = 'sharedConfigUpdated',
  CONFIG_IMPORTED = 'configImported',
  CONFIG_RESET = 'configReset'
}
```

## 5. 配置同步机制

### 5.1 同步策略

```
┌─────────────┐
│ 用户操作    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ 更新配置（本地）    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ 保存到存储          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ 广播事件            │
│ - CEP: CSEvent      │
│ - Demo: Storage事件 │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ 其他面板监听        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ 重新加载配置        │
└─────────────────────┘
```

### 5.2 防抖机制

```typescript
class DebounceManager {
  private timers: Map<string, number> = new Map();
  private readonly DEBOUNCE_DELAY = 300; // 300ms
  
  debounce(key: string, callback: Function): void {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(key);
    }, this.DEBOUNCE_DELAY);
    
    this.timers.set(key, timer);
  }
}
```

## 6. 配置迁移流程

### 6.1 迁移检测

```typescript
function detectAndMigrate(rawConfig: any): ConfigStructure {
  // 1. 检测版本
  const version = rawConfig.version || '1.0';
  
  // 2. 判断是否需要迁移
  if (version === '2.0') {
    return rawConfig as ConfigStructure;
  }
  
  // 3. 备份旧配置
  backupConfig(rawConfig);
  
  // 4. 执行迁移
  const migratedConfig = migrateV1ToV2(rawConfig);
  
  // 5. 验证迁移结果
  const validation = validator.validate(migratedConfig);
  if (!validation.valid) {
    throw new Error('配置迁移失败');
  }
  
  // 6. 保存新配置
  return migratedConfig;
}
```

### 6.2 V1 到 V2 迁移逻辑

```typescript
function migrateV1ToV2(v1Config: any): ConfigStructure {
  return {
    version: '2.0',
    global: {
      language: v1Config.userPreferences?.language || 'zh-CN',
      theme: v1Config.userPreferences?.theme || 'dark',
      eagleServerUrl: 'http://localhost:8080',
      communicationPort: v1Config.userPreferences?.communicationPort || 8080,
      soundSettings: v1Config.importSettings?.soundSettings || {
        enabled: true,
        volume: 60
      }
    },
    panels: {
      main: {
        importSettings: v1Config.importSettings || {},
        exportSettings: v1Config.exportSettings || {},
        uiSettings: extractUISettings(v1Config),
        customSettings: {}
      },
      import: {
        importSettings: v1Config.importSettings || {},
        exportSettings: {},
        uiSettings: getDefaultUISettings(),
        customSettings: {}
      },
      quick: {
        importSettings: {},
        exportSettings: {},
        uiSettings: getDefaultUISettings(),
        customSettings: {}
      }
    },
    shared: {
      recentFolders: [],
      favoriteSettings: []
    },
    metadata: {
      lastModified: new Date().toISOString(),
      lastActivePanel: 'main',
      configSource: 'migrated'
    }
  };
}

function extractUISettings(v1Config: any): UISettings {
  // 尝试从 localStorage 读取旧的 uiSettings
  try {
    const saved = localStorage.getItem('uiSettings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('无法读取旧的 uiSettings');
  }
  
  return getDefaultUISettings();
}
```

## 7. 面板 ID 识别策略

### 7.1 识别优先级

```typescript
function getCurrentPanelId(): string {
  // 优先级 1: 从 CEP Extension ID 解析
  if (typeof csInterface !== 'undefined') {
    try {
      const extensionId = csInterface.getExtensionId();
      if (extensionId.includes('import')) return 'import';
      if (extensionId.includes('quick')) return 'quick';
      if (extensionId.includes('main')) return 'main';
    } catch (e) {
      console.warn('无法获取 Extension ID:', e);
    }
  }
  
  // 优先级 2: 从 URL 参数获取
  const urlParams = new URLSearchParams(window.location.search);
  const panelParam = urlParams.get('panel');
  if (panelParam && ['main', 'import', 'quick'].includes(panelParam)) {
    return panelParam;
  }
  
  // 优先级 3: 从 localStorage 获取上次使用的面板
  try {
    const lastPanel = localStorage.getItem('lastActivePanel');
    if (lastPanel && ['main', 'import', 'quick'].includes(lastPanel)) {
      return lastPanel;
    }
  } catch (e) {
    console.warn('无法读取 lastActivePanel:', e);
  }
  
  // 优先级 4: 默认为 main
  return 'main';
}
```

## 8. 性能优化

### 8.1 配置缓存

```typescript
class ConfigCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 5000; // 5秒缓存
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  set(key: string, value: any): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  invalidate(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

interface CacheEntry {
  value: any;
  timestamp: number;
}
```

### 8.2 批量更新

```typescript
class BatchUpdateManager {
  private pendingUpdates: Map<string, any> = new Map();
  private updateTimer: number | null = null;
  private readonly BATCH_DELAY = 500; // 500ms
  
  scheduleUpdate(path: string, value: any): void {
    this.pendingUpdates.set(path, value);
    
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
    
    this.updateTimer = setTimeout(() => {
      this.flushUpdates();
    }, this.BATCH_DELAY);
  }
  
  private flushUpdates(): void {
    if (this.pendingUpdates.size === 0) return;
    
    const updates = Object.fromEntries(this.pendingUpdates);
    settingsManager.updateFields(updates);
    
    this.pendingUpdates.clear();
    this.updateTimer = null;
  }
}
```

## 9. 错误处理

### 9.1 错误类型定义

```typescript
enum ConfigErrorCode {
  LOAD_FAILED = 'LOAD_FAILED',
  SAVE_FAILED = 'SAVE_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  SYNC_FAILED = 'SYNC_FAILED',
  IMPORT_FAILED = 'IMPORT_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED'
}

class ConfigError extends Error {
  constructor(
    public code: ConfigErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}
```

### 9.2 错误恢复策略

```typescript
class ErrorRecoveryManager {
  async handleError(error: ConfigError): Promise<void> {
    console.error(`配置错误 [${error.code}]:`, error.message);
    
    switch (error.code) {
      case ConfigErrorCode.LOAD_FAILED:
        // 尝试从备份恢复
        await this.restoreFromBackup();
        break;
        
      case ConfigErrorCode.SAVE_FAILED:
        // 重试保存
        await this.retrySave();
        break;
        
      case ConfigErrorCode.VALIDATION_FAILED:
        // 使用默认配置
        await this.useDefaultConfig();
        break;
        
      case ConfigErrorCode.MIGRATION_FAILED:
        // 回退到旧配置
        await this.rollbackMigration();
        break;
        
      default:
        // 记录错误日志
        this.logError(error);
    }
  }
}
```

## 10. 测试策略

### 10.1 单元测试

- SettingsManager 各方法的功能测试
- StorageAdapter 的读写测试
- ConfigValidator 的验证规则测试
- ConfigMigrator 的迁移逻辑测试

### 10.2 集成测试

- 多面板配置独立性测试
- 配置同步机制测试
- 配置导入导出测试
- 版本迁移测试

### 10.3 性能测试

- 配置加载性能（< 100ms）
- 配置保存性能（< 50ms）
- 配置同步延迟（< 200ms）
- 缓存命中率测试

## 11. 部署和迁移计划

### 11.1 渐进式部署

1. **阶段 1**：实现新的配置结构和 SettingsManager
2. **阶段 2**：实现存储适配器和迁移逻辑
3. **阶段 3**：集成到现有代码，保持向后兼容
4. **阶段 4**：全面测试和优化
5. **阶段 5**：发布更新，监控用户反馈

### 11.2 回滚策略

- 保留旧配置备份
- 提供配置降级功能
- 监控错误率，必要时回滚

## 12. 文档和维护

### 12.1 开发文档

- API 文档
- 配置结构说明
- 迁移指南
- 故障排查指南

### 12.2 用户文档

- 配置导入导出教程
- 多面板使用指南
- 常见问题解答
