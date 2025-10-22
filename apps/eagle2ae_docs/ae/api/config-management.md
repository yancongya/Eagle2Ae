## 配置管理系统 *(v2.4.0新增)*

### ConfigManager 类

统一的配置管理器。

#### 构造函数

```javascript
/**
 * 配置管理器构造函数
 */
class ConfigManager {
    constructor()
}
```

#### get()
获取配置值

```javascript
/**
 * 获取配置值
 * @param {string} key - 配置键，支持点分隔的路径
 * @param {any} [defaultValue] - 默认值
 * @returns {any} 配置值
 */
get(key, defaultValue)
```

#### set()
设置配置值

```javascript
/**
 * 设置配置值
 * @param {string} key - 配置键
 * @param {any} value - 配置值
 */
set(key, value)
```

#### save()
保存配置到文件

```javascript
/**
 * 保存配置到文件
 * @returns {Promise<void>}
 */
async save()
```

#### load()
从文件加载配置

```javascript
/**
 * 从文件加载配置
 * @returns {Promise<void>}
 */
async load()
```

#### reset()
重置配置为默认值

```javascript
/**
 * 重置配置为默认值
 * @param {string} [key] - 要重置的配置键，不指定则重置所有
 */
reset(key)
```

### 配置项定义

```javascript
/**
 * 默认配置
 */
const DefaultConfig = {
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
```

**使用示例**:
```javascript
const config = new ConfigManager();

// 获取配置
const port = config.get('connection.websocket.port', 8080);
const language = config.get('ui.language', 'zh-CN');

// 设置配置
config.set('ui.theme', 'dark');
config.set('import.maxFileSize', 200 * 1024 * 1024);

// 保存配置
await config.save();
```
