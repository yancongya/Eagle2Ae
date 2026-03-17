# 配置管理系统 API

## 概述

配置管理系统（ConfigManager）是 Eagle2Ae AE 扩展 v2.4.0 引入的核心组件，负责管理扩展的所有配置设置、用户偏好和UI状态。该系统提供了面板特定的配置管理、字段监听、自动保存、类型验证等高级功能，确保每个面板实例都能拥有独立且一致的配置体验。

## 核心特性

### 面板特定配置管理
- 每个面板实例拥有独立的配置存储空间
- 支持面板间配置隔离和共享
- 提供面板ID识别和配置关联

### 字段监听机制
- 支持对特定配置字段的变更监听
- 提供细粒度的变更通知
- 支持一次性监听和持续监听

### 自动保存功能
- 配置变更时自动保存到本地存储
- 支持防抖保存，避免频繁写入
- 提供手动保存和强制保存选项

### 类型安全验证
- 支持配置值的类型验证
- 提供默认值回退机制
- 支持自定义验证规则

## 技术实现

### 核心类结构

```javascript
/**
 * 配置管理器
 * 负责管理AE扩展的所有配置，支持面板特定配置和实时同步
 */
class ConfigManager {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            panelId: null,
            enableLogging: true,
            autoSave: true,
            saveDebounce: 500,
            ...options
        };
        
        // 初始化状态
        this.config = this.getDefaultConfig();
        this.validators = new Map();
        this.fieldListeners = new Map();
        this.changeListeners = [];
        
        // 绑定方法上下文
        this.get = this.get.bind(this);
        this.set = this.set.bind(this);
        this.save = this.save.bind(this);
        this.load = this.load.bind(this);
        this.reset = this.reset.bind(this);
    }
}
```

### 默认配置

```javascript
/**
 * 获取默认配置
 * @returns {Object} 默认配置对象
 */
getDefaultConfig() {
    return {
        // 连接设置
        connection: {
            websocket: {
                port: 8080,
                timeout: 5000,
                retryCount: 3,
                retryDelay: 1000
            },
            eagle: {
                apiUrl: 'http://localhost:41595',
                timeout: 10000,
                checkInterval: 30000
            }
        },
        
        // 文件导入设置
        import: {
            maxFileSize: 100 * 1024 * 1024, // 100MB
            supportedFormats: ['.jpg', '.png', '.gif', '.mp4', '.mov'],
            defaultImportMode: 'footage',
            createComposition: true,
            organizeItems: true
        },
        
        // 状态检测设置
        status: {
            cacheTimeout: 5000,
            checkInterval: 30000,
            enableMonitoring: true,
            batchDelay: 100
        },
        
        // 用户界面设置
        ui: {
            language: 'zh-CN',
            theme: 'auto',
            showNotifications: true,
            confirmDialogs: true
        },
        
        // 日志设置
        logging: {
            level: 'info',
            maxFileSize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
            enableConsole: true
        }
    };
}
```

### 配置获取实现

```javascript
/**
 * 获取配置值
 * @param {string} key - 配置键，支持点分隔的路径
 * @param {any} [defaultValue] - 默认值
 * @returns {any} 配置值
 */
get(key, defaultValue = undefined) {
    try {
        // 支持嵌套字段路径，如 'connection.websocket.port'
        const pathParts = key.split('.');
        let currentValue = this.config;
        
        for (const part of pathParts) {
            if (currentValue && typeof currentValue === 'object' && currentValue.hasOwnProperty(part)) {
                currentValue = currentValue[part];
            } else {
                // 字段不存在，返回默认值
                return defaultValue;
            }
        }
        
        return currentValue;
    } catch (error) {
        if (this.options.enableLogging) {
            console.warn(`[ConfigManager] 获取配置 ${key} 失败:`, error);
        }
        return defaultValue;
    }
}
```

### 配置设置实现

```javascript
/**
 * 设置配置值
 * @param {string} key - 配置键
 * @param {any} value - 配置值
 * @param {boolean} save - 是否保存到存储
 * @returns {Object} 设置结果
 */
set(key, value, save = true) {
    try {
        // 验证配置值
        const validationResult = this.validateField(key, value);
        if (!validationResult.valid) {
            return {
                success: false,
                error: validationResult.error
            };
        }
        
        // 获取当前字段值
        const oldValue = this.get(key);
        
        // 更新字段值
        const pathParts = key.split('.');
        let currentObj = this.config;
        
        // 遍历到倒数第二个路径部分
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!currentObj[part] || typeof currentObj[part] !== 'object') {
                currentObj[part] = {};
            }
            currentObj = currentObj[part];
        }
        
        // 更新最后一个字段
        const lastPart = pathParts[pathParts.length - 1];
        currentObj[lastPart] = value;
        
        if (this.options.enableLogging) {
            console.log(`[ConfigManager] 配置 ${key} 已更新:`, oldValue, '->', value);
        }
        
        // 触发字段变更事件
        this.emitFieldChange(key, value, oldValue);
        
        // 自动保存
        if (save && this.options.autoSave) {
            this.debouncedSave();
        }
        
        return {
            success: true,
            oldValue: oldValue,
            newValue: value
        };
        
    } catch (error) {
        if (this.options.enableLogging) {
            console.error(`[ConfigManager] 设置配置 ${key} 失败:`, error);
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}
```

## API参考

### 构造函数

```javascript
/**
 * 配置管理器构造函数
 * @param {Object} options - 配置选项
 * @param {string} options.panelId - 面板ID
 * @param {boolean} options.enableLogging - 是否启用日志
 * @param {boolean} options.autoSave - 是否自动保存
 * @param {number} options.saveDebounce - 保存防抖时间（毫秒）
 */
constructor(options = {})
```

### 核心方法

#### get()
获取配置值

```javascript
/**
 * 获取配置值
 * @param {string} key - 配置键，支持点分隔的路径
 * @param {any} [defaultValue] - 默认值
 * @returns {any} 配置值
 */
get(key, defaultValue = undefined)
```

#### set()
设置配置值

```javascript
/**
 * 设置配置值
 * @param {string} key - 配置键
 * @param {any} value - 配置值
 * @param {boolean} save - 是否保存到存储
 * @returns {Object} 设置结果
 */
set(key, value, save = true)
```

#### save()
保存配置到文件

```javascript
/**
 * 保存配置到文件
 * @param {Object} config - 要保存的配置（可选）
 * @returns {Promise<Object>} 保存结果
 */
async save(config = null)
```

#### load()
从文件加载配置

```javascript
/**
 * 从文件加载配置
 * @returns {Promise<Object>} 加载结果
 */
async load()
```

#### reset()
重置配置为默认值

```javascript
/**
 * 重置配置为默认值
 * @param {string} [key] - 要重置的配置键，不指定则重置所有
 * @returns {Object} 重置结果
 */
reset(key = null)
```

### 监听器方法

#### addFieldListener()
添加字段监听器

```javascript
/**
 * 添加字段监听器
 * @param {string} fieldPath - 字段路径
 * @param {Function} listener - 监听器函数
 * @param {boolean} once - 是否只监听一次
 * @returns {Function} 移除监听器的函数
 */
addFieldListener(fieldPath, listener, once = false)
```

#### removeFieldListener()
移除字段监听器

```javascript
/**
 * 移除字段监听器
 * @param {string} fieldPath - 字段路径
 * @param {Function} listener - 监听器函数
 */
removeFieldListener(fieldPath, listener)
```

#### addListener()
添加通用监听器

```javascript
/**
 * 添加通用监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addListener(listener)
```

#### removeListener()
移除通用监听器

```javascript
/**
 * 移除通用监听器
 * @param {Function} listener - 监听器函数
 */
removeListener(listener)
```

### 验证方法

#### validateField()
验证特定字段

```javascript
/**
 * 验证特定字段
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 字段值
 * @returns {Object} 验证结果
 */
validateField(fieldPath, value)
```

#### addValidator()
添加自定义验证器

```javascript
/**
 * 添加自定义验证器
 * @param {string} fieldPath - 字段路径
 * @param {Function} validator - 验证函数
 */
addValidator(fieldPath, validator)
```

#### removeValidator()
移除自定义验证器

```javascript
/**
 * 移除自定义验证器
 * @param {string} fieldPath - 字段路径
 */
removeValidator(fieldPath)
```

## 使用示例

### 基本使用

```javascript
// 创建配置管理器实例
const config = new ConfigManager({
    panelId: 'panel1',
    enableLogging: true,
    autoSave: true
});

// 获取配置
const port = config.get('connection.websocket.port', 8080);
const language = config.get('ui.language', 'zh-CN');

// 设置配置
const setResult = config.set('ui.theme', 'dark');
if (setResult.success) {
    console.log('配置设置成功');
} else {
    console.error('配置设置失败:', setResult.error);
}

// 保存配置
const saveResult = await config.save();
if (saveResult.success) {
    console.log('配置保存成功');
} else {
    console.error('配置保存失败:', saveResult.error);
}
```

### 字段监听

```javascript
// 添加字段监听器
const removeListener = config.addFieldListener('ui.theme', (newValue, oldValue, fieldPath) => {
    console.log(`字段 ${fieldPath} 已从 ${oldValue} 变更为 ${newValue}`);
    
    // 根据新主题更新UI
    updateTheme(newValue);
});

// 使用完成后移除监听器
// removeListener();

// 添加一次性监听器
config.addFieldListener('ui.language', (newValue, oldValue, fieldPath) => {
    console.log(`字段 ${fieldPath} 一次性变更: ${oldValue} -> ${newValue}`);
}, true); // 第三个参数设为true表示一次性监听
```

### 配置验证

```javascript
// 添加自定义验证器
config.addValidator('connection.websocket.port', (value) => {
    if (typeof value !== 'number' || value < 1024 || value > 65535) {
        return { valid: false, error: '端口号必须在1024-65535范围内' };
    }
    return { valid: true };
});

// 验证字段
const validation = config.validateField('connection.websocket.port', 8080);
if (!validation.valid) {
    console.error(`验证失败: ${validation.error}`);
}
```

## 最佳实践

### 性能优化

1. **合理使用缓存**
   ```javascript
   // 对于频繁读取的配置项，可以缓存结果
   let cachedPort = null;
   
   function getPort() {
       if (cachedPort === null) {
           cachedPort = config.get('connection.websocket.port', 8080);
       }
       return cachedPort;
   }
   
   // 在配置变更时清除缓存
   config.addFieldListener('connection.websocket.port', () => {
       cachedPort = null; // 清除缓存
   });
   ```

2. **防抖保存**
   ```javascript
   // 使用防抖避免频繁保存
   let saveTimeout = null;
   
   function debouncedSave() {
       if (saveTimeout) {
           clearTimeout(saveTimeout);
       }
       
       saveTimeout = setTimeout(async () => {
           const result = await config.save();
           if (!result.success) {
               console.error('配置保存失败:', result.error);
           }
       }, 500); // 500ms 防抖延迟
   }
   ```

### 错误处理

1. **统一错误处理**
   ```javascript
   // 为配置操作提供统一的错误处理
   async function updateConfig(key, value) {
       try {
           const result = config.set(key, value);
           if (!result.success) {
               throw new Error(result.error);
           }
           
           const saveResult = await config.save();
           if (!saveResult.success) {
               throw new Error(saveResult.error);
           }
           
           return true;
       } catch (error) {
           console.error('配置更新失败:', error.message);
           return false;
       }
   }
   ```

2. **降级处理**
   ```javascript
   // 当配置保存失败时提供降级方案
   const saveResult = await config.save();
   if (!saveResult.success) {
       console.warn('配置保存失败，使用内存配置:', saveResult.error);
       // 继续使用内存中的配置
   }
   ```

## 故障排除

### 常见问题

#### 配置未保存
- **症状**：修改配置后刷新页面发现配置未保存
- **解决**：
  1. 检查localStorage权限
  2. 验证配置验证是否通过
  3. 查看控制台错误日志

#### 字段监听器未触发
- **症状**：字段变更但监听器未执行
- **解决**：
  1. 检查字段路径是否正确
  2. 验证监听器是否正确添加
  3. 确认字段更新时是否触发了保存

### 调试技巧

#### 启用详细日志
```javascript
// 创建带详细日志的配置管理器
const config = new ConfigManager({
    enableLogging: true
});

// 监控配置变更
config.addListener((eventType, data) => {
    console.log(`[ConfigManager] 配置事件: ${eventType}`, data);
});
```

#### 性能分析
```javascript
// 记录配置操作性能
async function analyzeConfigPerformance() {
    const startTime = performance.now();
    const result = await config.save();
    const endTime = performance.now();
    
    console.log(`配置保存耗时: ${endTime - startTime}ms`);
    console.log('保存结果:', result);
}
```
