# Eagle2Ae 开发规范

## 概述

本文档定义了 Eagle2Ae 项目的统一开发规范，适用于 Eagle 插件和 After Effects CEP 扩展的开发，确保代码质量、一致性和可维护性。

## 项目架构原则

### 双插件架构

Eagle2Ae 采用双插件架构，两个插件独立开发、独立部署，通过标准化的通信协议进行交互：

```
┌─────────────────────────────────────────────────────────────────┐
│                    Eagle2Ae 系统架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐         ┌─────────────────────┐        │
│  │   Eagle Plugin      │◄───────►│  AE CEP Extension   │        │
│  │                     │         │                     │        │
│  │ - WebSocket Server  │         │ - WebSocket Client  │        │
│  │ - Database Access   │         │ - UI Components     │        │
│  │ - File Collector    │         │ - ExtendScript      │        │
│  │ - Clipboard Monitor │         │ - File Manager      │        │
│  └─────────────────────┘         └─────────────────────┘        │
│           │                               │                     │
│           ▼                               ▼                     │
│  ┌─────────────────────┐         ┌─────────────────────┐        │
│  │   Eagle App         │         │  After Effects      │        │
│  └─────────────────────┘         └─────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 核心设计原则

#### 1. 关注点分离 (Separation of Concerns)
- **Eagle 插件**: 专注于 Eagle 数据访问、文件信息收集、剪贴板监控
- **AE CEP 扩展**: 专注于用户界面、After Effects 集成、文件导入
- **通信层**: 标准化的消息协议，确保两端解耦

#### 2. 单一职责原则 (Single Responsibility Principle)
- 每个模块只负责一个特定的功能领域
- 类和函数保持单一职责，便于测试和维护
- 避免创建过于复杂的"万能"类

#### 3. 依赖倒置原则 (Dependency Inversion Principle)
- 高层模块不依赖低层模块，都依赖抽象
- 使用接口和抽象类定义契约
- 便于单元测试和模块替换

#### 4. 开闭原则 (Open/Closed Principle)
- 对扩展开放，对修改关闭
- 通过插件机制和配置文件支持功能扩展
- 新功能通过添加新模块实现，而不是修改现有代码

## 代码组织规范

### 目录结构标准

#### Eagle 插件目录结构
```
Eagle2Ae-Eagle/
├── index.html                # 插件主界面
├── service.html              # 服务页面
├── manifest.json             # Eagle 插件配置文件
├── package.json              # Node.js 依赖管理
├── package-lock.json         # 依赖锁定文件
├── logo.png                  # 插件图标
├── js/                       # JavaScript 核心逻辑
│   ├── plugin.js             # 主插件类
│   ├── websocket-server.js   # WebSocket 服务器
│   ├── websocket-protocol.js # WebSocket 协议处理
│   ├── websocket-eagle-compatible.js # Eagle 兼容层
│   ├── clipboard-handler.js  # 剪贴板处理
│   ├── compatibility-layer.js # 兼容性层
│   ├── dynamic-port-allocator.js # 动态端口分配
│   ├── clipboard/            # 剪贴板模块
│   ├── database/             # 数据库访问层
│   │   ├── README.md
│   │   └── sqlite-reader.js  # SQLite 读取器
│   └── utils/                # 工具函数
```

#### AE CEP 扩展目录结构
```
Eagle2Ae-Ae/
├── index.html                # 主界面文件
├── README.md                 # 扩展说明文档
├── package-lock.json         # 依赖锁定文件
├── enable_cep_debug_mode.reg # CEP 调试模式注册表文件
├── enable_cep_debug_enhanced.reg # 增强调试模式注册表文件
├── CSXS/                     # CEP 配置
│   └── manifest.xml          # CEP 扩展配置文件
├── js/                       # JavaScript 代码
│   ├── main.js               # 主入口文件
│   ├── websocket-client.js   # WebSocket 客户端
│   ├── CSInterface.js        # CEP 接口库
│   ├── services/             # 服务层
│   │   ├── FileHandler.js    # 文件处理服务
│   │   ├── PortDiscovery.js  # 端口发现服务
│   │   └── SettingsManager.js # 设置管理服务
│   ├── utils/                # 工具函数
│   │   ├── LogManager.js     # 日志管理器
│   │   └── SoundPlayer.js    # 声音播放器
│   ├── constants/            # 常量定义
│   │   └── ImportSettings.js # 导入设置常量
│   └── demo/                 # 演示和测试代码
│       ├── README.md
│       ├── demo-apis.js
│       ├── demo-config.json
│       ├── demo-mode.js
│       ├── demo-network-interceptor.js
│       ├── demo-override.js
│       ├── demo-ui.js
│       └── easter-egg.js
├── jsx/                      # ExtendScript 文件
│   ├── hostscript.jsx        # 主机脚本
│   └── dialog-warning.jsx    # 警告对话框脚本
└── public/                   # 静态资源
    ├── logo.png              # 应用图标
    ├── logo2.png             # 备用图标
    └── sound/                # 音频文件
        ├── eagle.wav
        ├── linked.wav
        ├── rnd_okay.wav
        └── stop.wav
```

### 文件命名规范

#### JavaScript/JSX 文件
- **类文件**: 使用 PascalCase，如 `WebSocketServer.js`
- **模块文件**: 使用 kebab-case，如 `websocket-client.js`
- **工具函数**: 使用 kebab-case，如 `file-utils.js`
- **常量文件**: 使用 kebab-case，如 `error-codes.js`
- **测试文件**: 使用 `.test.js` 或 `.spec.js` 后缀
- **JSX 文件**: 使用 kebab-case，如 `hostscript.jsx`

#### 配置和文档文件
- **配置文件**: 使用标准名称，如 `package.json`, `manifest.xml`
- **文档文件**: 使用 kebab-case，如 `api-reference.md`
- **环境配置**: 使用环境名称，如 `config.dev.json`

## 编码规范

### JavaScript 编码规范

#### 基础语法
```javascript
// 使用 4 个空格缩进
function processFiles(files) {
    if (files && files.length > 0) {
        files.forEach(file => {
            console.log(`处理文件: ${file.name}`);
        });
    }
}

// 使用分号结束语句
const message = 'Hello World';
const result = calculateSum(a, b);

// 字符串优先使用单引号
const singleQuote = 'This is preferred';
const doubleQuote = "Only when containing 'single quotes'";

// 对象和数组的格式化
const config = {
    server: {
        port: 8080,
        host: 'localhost'
    },
    features: [
        'file_transfer',
        'eagle_integration',
        'clipboard_monitor'
    ]
};
```

#### 命名规范
```javascript
// 变量和函数使用 camelCase
const webSocketClient = new WebSocketClient();
const fileManager = new FileManager();

function connectToServer() { /* ... */ }
function validateFileFormat(extension) { /* ... */ }

// 常量使用 UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const DEFAULT_TIMEOUT = 30000;
const SUPPORTED_FORMATS = ['jpg', 'png', 'gif'];

// 类名使用 PascalCase
class WebSocketClient {
    constructor(options = {}) {
        this.options = options;
    }
}

// 私有方法使用下划线前缀
class FileManager {
    processFile(file) {
        return this._validateFile(file);
    }
    
    _validateFile(file) {
        // 私有方法实现
    }
}

// 布尔值使用 is/has/can 前缀
const isConnected = client.connected;
const hasValidFiles = files.every(file => file.valid);
const canProcessFile = checkPermissions(file);
```

#### 注释规范
```javascript
/**
 * 文件头注释
 * WebSocket 客户端管理器
 * 负责与 Eagle 插件的通信
 * 
 * @author Eagle2Ae 开发团队
 * @date 2024-01-05
 * @version 1.0.0
 */

/**
 * 建立 WebSocket 连接
 * @param {string} url - WebSocket 服务器地址
 * @param {Object} options - 连接选项
 * @param {number} options.timeout - 连接超时时间（毫秒）
 * @param {number} options.retryCount - 重试次数
 * @returns {Promise<WebSocket>} WebSocket 连接实例
 * @throws {Error} 连接失败时抛出错误
 * @example
 * const client = new WebSocketClient();
 * const connection = await client.connect('ws://localhost:8080', {
 *     timeout: 5000,
 *     retryCount: 3
 * });
 */
async function connect(url, options = {}) {
    // 验证 URL 格式
    if (!isValidWebSocketUrl(url)) {
        throw new Error('无效的 WebSocket URL');
    }
    
    // 尝试建立连接
    const connection = await establishConnection(url, options);
    
    // 设置连接事件监听
    this._setupConnectionListeners(connection);
    
    return connection;
}
```

### JSX 编码规范

#### ExtendScript 特定规范
```javascript
/**
 * After Effects ExtendScript 文件导入模块
 * 负责将文件导入到 AE 项目中
 * 
 * @author Eagle2Ae 开发团队
 * @date 2024-01-05
 */

// 使用严格的错误检查
function importFileToProject(filePath, options) {
    // 参数验证
    if (!filePath || typeof filePath !== 'string') {
        throw new Error('文件路径参数无效');
    }
    
    // 检查文件是否存在
    var file = new File(filePath);
    if (!file.exists) {
        throw new Error('文件不存在: ' + filePath);
    }
    
    try {
        // 导入文件到项目
        var importOptions = {
            file: file,
            importAs: options.importAs || ImportAsType.FOOTAGE,
            sequence: options.sequence || false
        };
        
        var footageItem = app.project.importFile(importOptions);
        
        // 设置项目项属性
        if (options.name) {
            footageItem.name = options.name;
        }
        
        return {
            success: true,
            item: {
                id: footageItem.id,
                name: footageItem.name,
                duration: footageItem.duration,
                width: footageItem.width,
                height: footageItem.height
            }
        };
        
    } catch (error) {
        return {
            success: false,
            error: {
                message: error.message,
                filePath: filePath
            }
        };
    }
}

// 工具函数使用清晰的命名
function validateProjectState() {
    if (!app.project) {
        throw new Error('没有打开的项目');
    }
    
    if (app.project.file === null) {
        throw new Error('项目尚未保存');
    }
    
    return true;
}

// 错误处理要详细和用户友好
function createCompositionFromItems(items, compSettings) {
    try {
        validateProjectState();
        
        // 创建合成
        var comp = app.project.items.addComp(
            compSettings.name || 'Eagle Import',
            compSettings.width || 1920,
            compSettings.height || 1080,
            compSettings.pixelAspect || 1,
            compSettings.duration || 10,
            compSettings.frameRate || 29.97
        );
        
        // 添加项目到合成
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var layer = comp.layers.add(item);
            
            // 设置图层属性
            if (item.layerSettings) {
                applyLayerSettings(layer, item.layerSettings);
            }
        }
        
        return {
            success: true,
            composition: {
                id: comp.id,
                name: comp.name,
                duration: comp.duration,
                layerCount: comp.numLayers
            }
        };
        
    } catch (error) {
        return {
            success: false,
            error: {
                message: error.message,
                operation: 'createComposition'
            }
        };
    }
}
```

## 错误处理规范

### 错误分类和处理

#### 1. 自定义错误类
```javascript
// 基础错误类
class Eagle2AeError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'Eagle2AeError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
    
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

// 特定错误类
class ConnectionError extends Eagle2AeError {
    constructor(message, details = {}) {
        super(message, 'CONNECTION_ERROR', details);
        this.name = 'ConnectionError';
    }
}

class FileError extends Eagle2AeError {
    constructor(message, filePath, details = {}) {
        super(message, 'FILE_ERROR', { filePath, ...details });
        this.name = 'FileError';
    }
}

class ValidationError extends Eagle2AeError {
    constructor(message, field, value, details = {}) {
        super(message, 'VALIDATION_ERROR', { field, value, ...details });
        this.name = 'ValidationError';
    }
}
```

#### 2. 错误处理策略
```javascript
// 异步操作错误处理
async function processFileWithRetry(filePath, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await processFile(filePath);
            
            // 记录成功日志
            logger.info('文件处理成功', {
                filePath,
                attempt,
                processingTime: result.processingTime
            });
            
            return result;
            
        } catch (error) {
            lastError = error;
            
            // 记录重试日志
            logger.warn('文件处理失败，准备重试', {
                filePath,
                attempt,
                maxRetries,
                error: error.message
            });
            
            // 如果不是最后一次尝试，等待后重试
            if (attempt < maxRetries) {
                await new Promise(resolve => 
                    setTimeout(resolve, 1000 * attempt)
                );
            }
        }
    }
    
    // 所有重试都失败，抛出最后的错误
    throw new FileError(
        `文件处理失败，已重试 ${maxRetries} 次`,
        filePath,
        { originalError: lastError }
    );
}

// 用户友好的错误处理
function handleUserError(error) {
    const errorMessages = {
        'CONNECTION_ERROR': '无法连接到 Eagle 插件，请确保 Eagle 正在运行',
        'FILE_NOT_FOUND': '文件不存在，请检查文件路径是否正确',
        'UNSUPPORTED_FORMAT': '不支持的文件格式，请选择支持的文件类型',
        'INSUFFICIENT_MEMORY': '内存不足，请关闭其他应用程序后重试',
        'PERMISSION_DENIED': '权限不足，请检查文件访问权限'
    };
    
    const userMessage = errorMessages[error.code] || error.message;
    
    // 显示用户友好的错误信息
    showErrorDialog({
        title: '操作失败',
        message: userMessage,
        details: error.details,
        actions: [
            { label: '重试', action: 'retry' },
            { label: '取消', action: 'cancel' }
        ]
    });
    
    // 记录详细错误信息用于调试
    logger.error('用户操作失败', {
        error: error.toJSON(),
        userAgent: navigator.userAgent,
        timestamp: Date.now()
    });
}
```

### 日志记录规范

#### 日志级别和格式
```javascript
class Logger {
    constructor(options = {}) {
        this.options = {
            level: options.level || 'info',
            format: options.format || 'json',
            outputs: options.outputs || ['console'],
            maxFileSize: options.maxFileSize || 10 * 1024 * 1024,
            maxFiles: options.maxFiles || 5,
            ...options
        };
        
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }
    
    log(level, message, metadata = {}) {
        if (this.levels[level] > this.levels[this.options.level]) {
            return;
        }
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            metadata,
            component: this.getComponentName(),
            pid: process.pid,
            memory: process.memoryUsage().heapUsed
        };
        
        this.outputs.forEach(output => {
            this.writeToOutput(output, logEntry);
        });
    }
    
    error(message, metadata = {}) {
        this.log('error', message, metadata);
    }
    
    warn(message, metadata = {}) {
        this.log('warn', message, metadata);
    }
    
    info(message, metadata = {}) {
        this.log('info', message, metadata);
    }
    
    debug(message, metadata = {}) {
        this.log('debug', message, metadata);
    }
}

// 使用示例
const logger = new Logger({
    level: 'debug',
    outputs: ['console', 'file'],
    filePath: 'logs/eagle2ae.log'
});

// 记录不同级别的日志
logger.info('WebSocket 连接建立', {
    clientId: 'client_001',
    serverPort: 8080
});

logger.warn('文件格式可能不受支持', {
    filePath: '/path/to/file.xyz',
    detectedFormat: 'xyz'
});

logger.error('数据库连接失败', {
    error: error.message,
    connectionString: 'sqlite:///path/to/eagle.db',
    retryCount: 3
});
```

## 性能优化规范

### 异步操作优化

#### 并发控制
```javascript
// 使用 Promise.all 进行并行处理
async function processMultipleFiles(filePaths) {
    const results = await Promise.all(
        filePaths.map(async (filePath) => {
            try {
                return await processFile(filePath);
            } catch (error) {
                return { error: error.message, filePath };
            }
        })
    );
    
    return results;
}

// 限制并发数量
const pLimit = require('p-limit');
const limit = pLimit(5); // 最多同时处理 5 个文件

async function processFilesWithLimit(filePaths) {
    const promises = filePaths.map(filePath => 
        limit(() => processFile(filePath))
    );
    
    return Promise.all(promises);
}

// 批量处理大量数据
async function processBatchFiles(files, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(file => processFile(file))
        );
        
        results.push(...batchResults);
        
        // 在批次之间添加短暂延迟，避免阻塞
        if (i + batchSize < files.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    
    return results;
}
```

#### 内存管理
```javascript
// 使用 WeakMap 避免内存泄漏
const fileInfoCache = new WeakMap();

function cacheFileInfo(file, info) {
    fileInfoCache.set(file, info);
}

function getCachedFileInfo(file) {
    return fileInfoCache.get(file);
}

// 及时清理资源
class ResourceManager {
    constructor() {
        this.resources = new Set();
        this.timers = new Set();
        this.listeners = new Map();
    }
    
    addResource(resource) {
        this.resources.add(resource);
        return resource;
    }
    
    addTimer(timer) {
        this.timers.add(timer);
        return timer;
    }
    
    addListener(target, event, listener) {
        target.addEventListener(event, listener);
        
        if (!this.listeners.has(target)) {
            this.listeners.set(target, []);
        }
        this.listeners.get(target).push({ event, listener });
    }
    
    cleanup() {
        // 清理资源
        this.resources.forEach(resource => {
            if (resource.close) resource.close();
            if (resource.destroy) resource.destroy();
        });
        
        // 清理定时器
        this.timers.forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        
        // 清理事件监听器
        this.listeners.forEach((listeners, target) => {
            listeners.forEach(({ event, listener }) => {
                target.removeEventListener(event, listener);
            });
        });
        
        // 清空集合
        this.resources.clear();
        this.timers.clear();
        this.listeners.clear();
    }
}
```

### 缓存策略

#### LRU 缓存实现
```javascript
class LRUCache {
    constructor(maxSize = 1000, ttl = 5 * 60 * 1000) {
        this.maxSize = maxSize;
        this.ttl = ttl;
        this.cache = new Map();
        this.timers = new Map();
    }
    
    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }
        
        const item = this.cache.get(key);
        
        // 检查是否过期
        if (Date.now() > item.expiry) {
            this.delete(key);
            return undefined;
        }
        
        // 更新访问时间（LRU）
        this.cache.delete(key);
        this.cache.set(key, item);
        
        return item.value;
    }
    
    set(key, value) {
        // 删除旧值
        if (this.cache.has(key)) {
            this.delete(key);
        }
        
        // 检查缓存大小
        if (this.cache.size >= this.maxSize) {
            // 删除最旧的项
            const firstKey = this.cache.keys().next().value;
            this.delete(firstKey);
        }
        
        // 添加新项
        const item = {
            value,
            expiry: Date.now() + this.ttl
        };
        
        this.cache.set(key, item);
        
        // 设置过期定时器
        const timer = setTimeout(() => {
            this.delete(key);
        }, this.ttl);
        
        this.timers.set(key, timer);
    }
    
    delete(key) {
        this.cache.delete(key);
        
        const timer = this.timers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(key);
        }
    }
    
    clear() {
        this.cache.clear();
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
    }
    
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
        };
    }
}

// 使用缓存
const fileInfoCache = new LRUCache(1000, 5 * 60 * 1000);

async function getCachedFileInfo(filePath) {
    let fileInfo = fileInfoCache.get(filePath);
    
    if (!fileInfo) {
        fileInfo = await collectFileInfo(filePath);
        fileInfoCache.set(filePath, fileInfo);
    }
    
    return fileInfo;
}
```

## 测试规范

### 测试策略

#### 测试金字塔
- **单元测试 (70%)**: 测试单个函数和类
- **集成测试 (20%)**: 测试模块间交互
- **端到端测试 (10%)**: 测试完整用户场景

#### 测试覆盖率要求
- 代码覆盖率 ≥ 80%
- 分支覆盖率 ≥ 70%
- 函数覆盖率 ≥ 90%

### 测试实现示例

#### 单元测试
```javascript
// 测试工具函数
const { validateFilePath, getFileExtension } = require('../src/utils/file-utils');

describe('文件工具函数', () => {
    describe('getFileExtension', () => {
        test('应该正确提取文件扩展名', () => {
            expect(getFileExtension('image.jpg')).toBe('jpg');
            expect(getFileExtension('document.pdf')).toBe('pdf');
        });
        
        test('应该处理没有扩展名的文件', () => {
            expect(getFileExtension('filename')).toBe('');
        });
    });
    
    describe('validateFilePath', () => {
        test('应该验证有效路径', async () => {
            const result = await validateFilePath('/valid/path');
            expect(result.valid).toBe(true);
        });
        
        test('应该拒绝无效路径', async () => {
            const result = await validateFilePath('');
            expect(result.valid).toBe(false);
        });
    });
});
```

#### 集成测试
```javascript
// 测试 WebSocket 通信
const WebSocketServer = require('../src/services/websocket-server');
const WebSocket = require('ws');

describe('WebSocket 通信集成测试', () => {
    let server;
    let client;
    
    beforeEach(async () => {
        server = new WebSocketServer({ port: 8081 });
        await server.start();
    });
    
    afterEach(async () => {
        if (client) client.close();
        if (server) await server.stop();
    });
    
    test('应该建立连接并处理消息', (done) => {
        client = new WebSocket('ws://localhost:8081');
        
        client.on('open', () => {
            client.send(JSON.stringify({
                type: 'status_query',
                messageId: 'test_001'
            }));
        });
        
        client.on('message', (data) => {
            const message = JSON.parse(data);
            expect(message.type).toBe('status_response');
            done();
        });
    });
});
```

## 安全规范

### 输入验证

```javascript
// 文件路径验证
function validateFilePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
        throw new ValidationError('文件路径必须是非空字符串', 'filePath', filePath);
    }
    
    // 防止路径遍历攻击
    if (filePath.includes('..') || filePath.includes('~')) {
        throw new ValidationError('文件路径包含非法字符', 'filePath', filePath);
    }
    
    // 检查路径长度
    if (filePath.length > 260) {
        throw new ValidationError('文件路径过长', 'filePath', filePath);
    }
    
    return true;
}

// 消息验证
function validateMessage(message) {
    const schema = {
        type: { required: true, type: 'string', maxLength: 50 },
        messageId: { required: true, type: 'string', pattern: /^[a-zA-Z0-9_-]+$/ },
        timestamp: { required: true, type: 'number', min: 0 },
        data: { required: true, type: 'object' }
    };
    
    return validateSchema(message, schema);
}

// 文件大小验证
function validateFileSize(filePath, maxSize = 100 * 1024 * 1024) {
    const stats = fs.statSync(filePath);
    
    if (stats.size > maxSize) {
        throw new ValidationError(
            `文件大小超过限制 ${maxSize} 字节`,
            'fileSize',
            stats.size
        );
    }
    
    return true;
}
```

### 权限控制

```javascript
// 文件访问权限检查
function checkFileAccess(filePath, mode = fs.constants.R_OK) {
    try {
        fs.accessSync(filePath, mode);
        return true;
    } catch (error) {
        throw new FileError(
            '文件访问权限不足',
            filePath,
            { requiredMode: mode }
        );
    }
}

// 目录访问限制
function validateDirectoryAccess(filePath, allowedDirectories) {
    const resolvedPath = path.resolve(filePath);
    
    const isAllowed = allowedDirectories.some(allowedDir => {
        const resolvedAllowedDir = path.resolve(allowedDir);
        return resolvedPath.startsWith(resolvedAllowedDir);
    });
    
    if (!isAllowed) {
        throw new ValidationError(
            '文件路径不在允许的目录范围内',
            'filePath',
            filePath
        );
    }
    
    return true;
}
```

## 配置管理规范

### 配置文件结构

```javascript
// config/default.js
module.exports = {
    server: {
        port: 8080,
        host: 'localhost',
        timeout: 30000
    },
    
    logging: {
        level: 'info',
        outputs: ['console', 'file'],
        file: {
            path: 'logs/eagle2ae.log',
            maxSize: '10MB',
            maxFiles: 5
        }
    },
    
    performance: {
        maxConcurrentOperations: 5,
        cacheSize: 1000,
        cacheTTL: 300000
    },
    
    security: {
        allowedDirectories: [
            process.env.HOME || process.env.USERPROFILE,
            '/tmp'
        ],
        maxFileSize: 100 * 1024 * 1024,
        maxMessageSize: 1024 * 1024
    }
};

// config/development.js
module.exports = {
    logging: {
        level: 'debug'
    },
    
    performance: {
        maxConcurrentOperations: 10
    }
};

// config/production.js
module.exports = {
    logging: {
        level: 'warn',
        outputs: ['file']
    },
    
    performance: {
        maxConcurrentOperations: 3
    }
};
```

### 配置管理器

```javascript
class ConfigManager {
    constructor(environment = process.env.NODE_ENV || 'development') {
        this.environment = environment;
        this.config = this.loadConfig();
    }
    
    loadConfig() {
        const defaultConfig = require('./config/default');
        
        try {
            const envConfig = require(`./config/${this.environment}`);
            return this.mergeConfig(defaultConfig, envConfig);
        } catch (error) {
            console.warn(`环境配置文件不存在: ${this.environment}`);
            return defaultConfig;
        }
    }
    
    mergeConfig(defaultConfig, envConfig) {
        return {
            ...defaultConfig,
            ...envConfig,
            // 深度合并嵌套对象
            server: { ...defaultConfig.server, ...envConfig.server },
            logging: { ...defaultConfig.logging, ...envConfig.logging },
            performance: { ...defaultConfig.performance, ...envConfig.performance },
            security: { ...defaultConfig.security, ...envConfig.security }
        };
    }
    
    get(key, defaultValue = undefined) {
        const keys = key.split('.');
        let value = this.config;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }
    
    set(key, value) {
        const keys = key.split('.');
        let target = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in target) || typeof target[k] !== 'object') {
                target[k] = {};
            }
            target = target[k];
        }
        
        target[keys[keys.length - 1]] = value;
    }
    
    getAll() {
        return { ...this.config };
    }
}

// 使用示例
const config = new ConfigManager();

const serverPort = config.get('server.port', 8080);
const logLevel = config.get('logging.level', 'info');
const maxFileSize = config.get('security.maxFileSize', 100 * 1024 * 1024);
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始开发规范文档 | 开发团队 |

---

**相关文档**:
- [通信协议规范](./communication-protocol.md)
- [Eagle 插件编码规范](../EAGLE/standards/coding-standards.md)
- [AE CEP 扩展编码规范](../AE/standards/coding-standards.md)
- [项目规范](../EAGLE/standards/project-standards.md)