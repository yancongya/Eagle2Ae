# 多面板配置文件方案对比分析

## 方案对比

### 方案 A: 三个独立的 JSON 文件

```
Eagle2Ae-Ae/presets/
├── Eagle2Ae-Presets-Panel1.json
├── Eagle2Ae-Presets-Panel2.json
└── Eagle2Ae-Presets-Panel3.json
```

每个文件结构：
```json
{
  "importSettings": { ... },
  "uiSettings": { ... },
  "language": "zh-CN",
  "aeTheme": "dark",
  "exportedAt": "2025-10-24T03:33:57.232Z"
}
```

#### 优点
✅ **结构简单** - 每个文件独立，易于理解
✅ **读写独立** - 修改一个面板不影响其他文件
✅ **文件小** - 每个文件只包含一个面板的配置
✅ **易于备份** - 可以单独备份某个面板的配置
✅ **易于分享** - 可以只分享某个面板的配置给他人

#### 缺点
❌ **文件管理复杂** - 需要管理 3 个文件
❌ **全局设置重复** - 如端口号等全局设置在每个文件中重复
❌ **同步困难** - 全局设置修改需要同步到 3 个文件
❌ **迁移麻烦** - 旧配置迁移需要创建 3 个文件
❌ **Demo 模式复杂** - 虚拟文件系统需要管理 3 个文件

---

### 方案 B: 一个 JSON 文件包含三个面板

```
Eagle2Ae-Ae/presets/
└── Eagle2Ae-Presets.json
```

文件结构：
```json
{
  "version": "1.0.0",
  "panels": {
    "com.yanrouya.eagle2ae.panel1": {
      "importSettings": { ... },
      "uiSettings": { ... },
      "language": "zh-CN",
      "aeTheme": "dark"
    },
    "com.yanrouya.eagle2ae.panel2": {
      "importSettings": { ... },
      "uiSettings": { ... },
      "language": "en-US",
      "aeTheme": "light"
    },
    "com.yanrouya.eagle2ae.panel3": {
      "importSettings": { ... },
      "uiSettings": { ... },
      "language": "zh-CN",
      "aeTheme": "dark"
    }
  },
  "globalSettings": {
    "communicationPort": 8080,
    "autoSaveSettings": true
  },
  "exportedAt": "2025-10-24T03:33:57.232Z"
}
```

#### 优点
✅ **统一管理** - 只需要管理一个文件
✅ **全局设置统一** - 端口号等全局设置只存一份
✅ **易于迁移** - 旧配置迁移只需修改一个文件
✅ **Demo 模式简单** - 虚拟文件系统只需管理一个文件
✅ **原子操作** - 读写配置是原子操作，不会出现部分更新
✅ **易于扩展** - 添加新面板只需添加一个分支
✅ **配置切换快** - 所有配置在内存中，切换无需读文件

#### 缺点
❌ **文件较大** - 包含 3 个面板的配置
❌ **读写冲突风险** - 多个面板同时写入可能冲突（需要加锁）
❌ **部分损坏影响全部** - 文件损坏会影响所有面板

---

## 深度分析

### 1. 并发写入问题

#### 方案 A (独立文件)
- 3 个面板同时打开，各自修改自己的文件
- **无冲突** - 每个面板操作不同的文件
- 但全局设置修改会有问题

#### 方案 B (单一文件)
- 3 个面板同时打开，都要修改同一个文件
- **有冲突风险** - 需要实现文件锁机制
- 解决方案：
  1. 读取完整配置
  2. 只修改自己的分支
  3. 写回时检查版本号
  4. 如果版本号变化，重新读取并合并

### 2. 配置切换功能

#### 方案 A (独立文件)
```javascript
// 切换到 Panel 2 的配置
const config = readFile('Eagle2Ae-Presets-Panel2.json');
applyConfig(config);
```
- 需要读取另一个文件
- 磁盘 I/O 操作

#### 方案 B (单一文件)
```javascript
// 切换到 Panel 2 的配置
const allConfig = this.cachedConfig; // 已在内存中
const config = allConfig.panels['com.yanrouya.eagle2ae.panel2'];
applyConfig(config);
```
- 配置已在内存中
- 无需磁盘 I/O
- **切换速度快**

### 3. 全局设置管理

#### 方案 A (独立文件)
```json
// Panel1.json
{
  "communicationPort": 8080,
  "importSettings": { ... }
}

// Panel2.json
{
  "communicationPort": 8080,  // 重复
  "importSettings": { ... }
}
```
- 全局设置在每个文件中重复
- 修改端口号需要修改 3 个文件
- 容易出现不一致

#### 方案 B (单一文件)
```json
{
  "globalSettings": {
    "communicationPort": 8080  // 只存一份
  },
  "panels": { ... }
}
```
- 全局设置只存一份
- 修改一次即可
- 保证一致性

### 4. 配置迁移

#### 方案 A (独立文件)
```javascript
// 需要创建 3 个文件
const oldConfig = readOldConfig();
writeFile('Panel1.json', oldConfig);
writeFile('Panel2.json', cloneConfig(oldConfig));
writeFile('Panel3.json', cloneConfig(oldConfig));
```

#### 方案 B (单一文件)
```javascript
// 只需修改一个文件
const oldConfig = readOldConfig();
const newConfig = {
  panels: {
    'panel1': oldConfig,
    'panel2': cloneConfig(oldConfig),
    'panel3': cloneConfig(oldConfig)
  }
};
writeFile('Presets.json', newConfig);
```

---

## 推荐方案：方案 B（单一文件）+ 优化

### 最佳实践设计

```json
{
  "version": "1.0.0",
  "metadata": {
    "createdAt": "2025-10-24T03:33:57.232Z",
    "lastModified": "2025-10-24T05:20:15.123Z",
    "modifiedBy": "com.yanrouya.eagle2ae.panel2"
  },
  "globalSettings": {
    "communicationPort": 8080,
    "autoSaveSettings": true,
    "defaultLanguage": "zh-CN",
    "defaultTheme": "dark"
  },
  "panels": {
    "com.yanrouya.eagle2ae.panel1": {
      "name": "默认配置",
      "description": "用于日常工作的默认配置",
      "importSettings": { ... },
      "uiSettings": { ... },
      "language": "zh-CN",
      "aeTheme": "dark",
      "lastUsed": "2025-10-24T05:20:15.123Z"
    },
    "com.yanrouya.eagle2ae.panel2": {
      "name": "项目配置",
      "description": "用于特定项目的配置",
      "importSettings": { ... },
      "uiSettings": { ... },
      "language": "en-US",
      "aeTheme": "light",
      "lastUsed": "2025-10-23T14:30:00.000Z"
    },
    "com.yanrouya.eagle2ae.panel3": {
      "name": "快速预览",
      "description": "用于快速预览的精简配置",
      "importSettings": { ... },
      "uiSettings": { ... },
      "language": "zh-CN",
      "aeTheme": "dark",
      "lastUsed": "2025-10-22T10:15:30.000Z"
    }
  }
}
```

### 优化措施

#### 1. 文件锁机制
```javascript
class ConfigManager {
  constructor() {
    this.lockFile = 'Eagle2Ae-Presets.lock';
    this.maxRetries = 3;
  }
  
  async saveConfig(panelId, config) {
    // 尝试获取锁
    for (let i = 0; i < this.maxRetries; i++) {
      if (await this.acquireLock()) {
        try {
          // 读取最新配置
          const allConfig = await this.readConfig();
          
          // 更新当前面板的配置
          allConfig.panels[panelId] = config;
          allConfig.metadata.lastModified = new Date().toISOString();
          allConfig.metadata.modifiedBy = panelId;
          
          // 写回文件
          await this.writeConfig(allConfig);
          
          return true;
        } finally {
          await this.releaseLock();
        }
      }
      // 等待后重试
      await this.sleep(100);
    }
    throw new Error('无法获取配置文件锁');
  }
}
```

#### 2. 配置缓存
```javascript
class ConfigCache {
  constructor() {
    this.cache = null;
    this.cacheTime = null;
    this.cacheDuration = 5000; // 5秒缓存
  }
  
  async getConfig() {
    const now = Date.now();
    if (this.cache && (now - this.cacheTime) < this.cacheDuration) {
      return this.cache;
    }
    
    // 重新读取
    this.cache = await this.readConfigFromDisk();
    this.cacheTime = now;
    return this.cache;
  }
  
  invalidateCache() {
    this.cache = null;
  }
}
```

#### 3. 配置验证
```javascript
function validateConfig(config) {
  // 检查版本
  if (!config.version) {
    throw new Error('配置文件缺少版本号');
  }
  
  // 检查必需的面板
  const requiredPanels = [
    'com.yanrouya.eagle2ae.panel1',
    'com.yanrouya.eagle2ae.panel2',
    'com.yanrouya.eagle2ae.panel3'
  ];
  
  for (const panelId of requiredPanels) {
    if (!config.panels[panelId]) {
      // 创建默认配置
      config.panels[panelId] = createDefaultConfig();
    }
  }
  
  return config;
}
```

#### 4. 备份机制
```javascript
async function saveConfigWithBackup(config) {
  // 先备份旧配置
  const backupPath = 'Eagle2Ae-Presets.backup.json';
  if (await fileExists('Eagle2Ae-Presets.json')) {
    await copyFile('Eagle2Ae-Presets.json', backupPath);
  }
  
  try {
    // 保存新配置
    await writeFile('Eagle2Ae-Presets.json', JSON.stringify(config, null, 2));
  } catch (error) {
    // 保存失败，恢复备份
    if (await fileExists(backupPath)) {
      await copyFile(backupPath, 'Eagle2Ae-Presets.json');
    }
    throw error;
  }
}
```

---

## 最终推荐

### 选择方案 B（单一文件）

**理由**：
1. ✅ 更符合现代配置管理的最佳实践
2. ✅ 全局设置统一管理，避免不一致
3. ✅ 配置切换功能实现简单高效
4. ✅ Demo 模式实现简单
5. ✅ 易于维护和扩展
6. ✅ 文件锁和缓存机制可以解决并发问题

**实施要点**：
1. 实现文件锁机制防止并发写入冲突
2. 使用配置缓存减少磁盘 I/O
3. 添加配置验证确保数据完整性
4. 实现自动备份机制防止数据丢失
5. 添加元数据跟踪配置修改历史

**风险控制**：
- 定期自动备份配置文件
- 配置损坏时自动恢复备份
- 提供配置导出/导入功能
- 记录配置修改日志

这个方案在功能性、可维护性和用户体验之间取得了最佳平衡。
