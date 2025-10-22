# Eagle 插件编码规范

## 概述

本文档定义了 Eagle2Ae Eagle 插件的编码规范和最佳实践，确保代码质量、可维护性和团队协作效率。

## 文件组织规范

### 目录结构

```
Eagle2Ae-Eagle/
├── js/                       # JavaScript 核心逻辑
│   ├── plugin.js             # 主插件类
│   ├── websocket-server.js   # WebSocket 服务器
│   ├── websocket-protocol.js # 通信协议处理
│   ├── websocket-eagle-compatible.js # Eagle 兼容层
│   ├── clipboard-handler.js  # 剪贴板处理
│   ├── compatibility-layer.js # 兼容性层
│   ├── dynamic-port-allocator.js # 动态端口分配
│   ├── clipboard/            # 剪贴板模块
│   │   └── clipboard-monitor.js
│   ├── database/             # 数据库操作
│   │   ├── eagle-database.js
│   │   └── query-builder.js
│   └── utils/                # 工具函数
│       ├── file-utils.js
│       ├── path-utils.js
│       └── validation.js
├── manifest.json             # Eagle 插件配置
├── package.json              # Node.js 依赖管理
├── index.html                # 插件主界面
├── service.html              # 服务页面
├── logo.png                  # 插件图标
└── README.md                 # 项目说明
```

### 文件命名规范

#### JavaScript 文件
- 使用 kebab-case：`websocket-server.js`
- 类文件使用 PascalCase：`EagleDatabase.js`
- 工具函数使用 kebab-case：`file-utils.js`
- 常量文件使用 kebab-case：`error-codes.js`
- 测试文件使用 `.test.js` 或 `.spec.js` 后缀

#### 配置文件
- 使用标准名称：`package.json`, `config.json`
- 环境特定配置：`config.dev.json`, `config.prod.json`

## JavaScript 编码规范

### 基础语法规范

#### 缩进和空格
```javascript
// 使用 4 个空格缩进
function processFiles(files) {
    if (files && files.length > 0) {
        files.forEach(file => {
            console.log(`处理文件: ${file.name}`);
        });
    }
}

// 操作符前后添加空格
const result = a + b * c;
const isValid = (value !== null) && (value !== undefined);

// 对象和数组的格式
const config = {
    server: {
        port: 8080,
        host: 'localhost'
    },
    database: {
        path: '/path/to/eagle/library',
        autoConnect: true
    }
};

const supportedFormats = [
    'jpg', 'jpeg', 'png', 'gif',
    'mp4', 'mov', 'avi',
    'pdf', 'doc', 'txt'
];
```

#### 分号和引号
```javascript
// 必须使用分号
const message = 'Hello World';
const result = calculateSum(a, b);

// 字符串优先使用单引号
const singleQuote = 'This is preferred';
const doubleQuote = "Only when containing 'single quotes'";

// JSON 数据使用双引号
const jsonData = {
    "type": "eagle_query",
    "data": {
        "queryType": "selected_items"
    }
};
```

### 命名规范

#### 变量和函数命名
```javascript
// 变量使用 camelCase
const webSocketServer = new WebSocketServer();
const eagleDatabase = new EagleDatabase();
const fileCollector = new FileCollector();

// 常量使用 UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_PORT = 8080;
const SUPPORTED_IMAGE_FORMATS = ['jpg', 'png', 'gif'];

// 函数使用 camelCase，动词开头
function connectToDatabase() { /* ... */ }
function validateFileFormat(extension) { /* ... */ }
function collectFileInfo(filePath) { /* ... */ }

// 布尔值使用 is/has/can 前缀
const isConnected = server.connected;
const hasValidFiles = files.every(file => file.valid);
const canProcessFile = checkFilePermissions(filePath);

// 私有方法使用下划线前缀
class WebSocketServer {
    start() {
        this._initializeServer();
    }
    
    _initializeServer() {
        // 私有方法实现
    }
}
```

#### 类和构造函数命名
```javascript
// 类名使用 PascalCase
class WebSocketServer {
    constructor(options = {}) {
        this.port = options.port || 8080;
        this.host = options.host || 'localhost';
    }
}

class EagleDatabase {
    constructor(libraryPath) {
        this.libraryPath = libraryPath;
        this.connected = false;
    }
}

// 工厂函数使用 camelCase
function createWebSocketServer(options) {
    return new WebSocketServer(options);
}

function createEagleDatabase(libraryPath) {
    return new EagleDatabase(libraryPath);
}
```

### 注释规范

#### 文件头注释
```javascript
/**
 * WebSocket 服务器模块
 * 负责与 After Effects CEP 扩展的通信
 * 
 * @author Eagle2Ae 开发团队
 * @date 2024-01-05
 * @version 1.0.0
 * @since 1.0.0
 */
```

#### 函数注释
```javascript
/**
 * 启动 WebSocket 服务器
 * @param {Object} options - 服务器配置选项
 * @param {number} options.port - 服务器端口
 * @param {string} options.host - 服务器主机地址
 * @param {boolean} options.autoStart - 是否自动启动
 * @returns {Promise<Object>} 启动结果
 * @throws {Error} 启动失败时抛出错误
 * @example
 * const server = new WebSocketServer();
 * const result = await server.start({
 *     port: 8080,
 *     host: 'localhost',
 *     autoStart: true
 * });
 */
async function startServer(options = {}) {
    // 实现代码...
}
```

#### 类注释
```javascript
/**
 * Eagle 数据库访问类
 * 负责与 Eagle 库的数据交互
 * 
 * @class EagleDatabase
 * @example
 * const database = new EagleDatabase('/path/to/eagle/library');
 * await database.connect();
 * const items = await database.getSelectedItems();
 */
class EagleDatabase {
    /**
     * 构造函数
     * @param {string} libraryPath - Eagle 库路径
     * @param {Object} options - 配置选项
     */
    constructor(libraryPath, options = {}) {
        this.libraryPath = libraryPath;
        this.options = options;
    }
    
    /**
     * 连接到 Eagle 数据库
     * @returns {Promise<Object>} 连接结果
     * @throws {DatabaseError} 连接失败时抛出错误
     */
    async connect() {
        // 实现代码...
    }
}
```

#### 行内注释
```javascript
function processFileSelection(files) {
    // 过滤支持的文件格式
    const validFiles = files.filter(file => {
        const extension = getFileExtension(file.path);
        return SUPPORTED_FORMATS.includes(extension.toLowerCase());
    });
    
    // 如果没有有效文件，提前返回
    if (validFiles.length === 0) {
        return {
            success: false,
            error: '没有找到支持的文件格式'
        };
    }
    
    // 收集文件详细信息
    return collectBatchFileInfo(validFiles);
}
```

### 错误处理规范

#### 异步错误处理
```javascript
// 使用 try-catch 处理异步操作
async function connectToEagleDatabase(libraryPath) {
    try {
        // 验证库路径
        const isValid = await validateLibraryPath(libraryPath);
        if (!isValid) {
            throw new DatabaseError(
                `无效的 Eagle 库路径: ${libraryPath}`,
                'INVALID_LIBRARY_PATH'
            );
        }
        
        // 建立数据库连接
        const connection = await establishConnection(libraryPath);
        
        // 记录成功日志
        logger.info('Eagle 数据库连接成功', {
            libraryPath,
            connectionId: connection.id
        });
        
        return connection;
        
    } catch (error) {
        // 记录错误日志
        logger.error('Eagle 数据库连接失败', {
            libraryPath,
            error: error.message,
            stack: error.stack
        });
        
        // 重新抛出错误，让上层处理
        throw new DatabaseError(
            `数据库连接失败: ${error.message}`,
            'CONNECTION_FAILED',
            { libraryPath, originalError: error }
        );
    }
}
```

#### 错误分类和处理
```javascript
// 定义错误类型
class PluginError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'PluginError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

class DatabaseError extends PluginError {
    constructor(message, code, details = {}) {
        super(message, code, details);
        this.name = 'DatabaseError';
    }
}

class FileError extends PluginError {
    constructor(message, code, filePath) {
        super(message, code, { filePath });
        this.name = 'FileError';
    }
}

// 使用自定义错误
function validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new FileError(
            '文件不存在',
            'FILE_NOT_FOUND',
            filePath
        );
    }
    
    const extension = getFileExtension(filePath);
    if (!SUPPORTED_FORMATS.includes(extension)) {
        throw new FileError(
            '不支持的文件格式',
            'UNSUPPORTED_FORMAT',
            filePath
        );
    }
}
```

#### 用户友好的错误提示
```javascript
// 错误消息映射
const ERROR_MESSAGES = {
    'FILE_NOT_FOUND': '文件不存在，请检查文件路径是否正确',
    'UNSUPPORTED_FORMAT': '不支持的文件格式，请选择支持的文件类型',
    'DATABASE_CONNECTION_FAILED': '无法连接到 Eagle 数据库，请确保 Eagle 正在运行',
    'WEBSOCKET_CONNECTION_FAILED': 'WebSocket 连接失败，请检查网络连接',
    'INSUFFICIENT_MEMORY': '内存不足，请关闭其他应用程序后重试'
};

// 显示用户友好的错误信息
function handleError(error) {
    const userMessage = ERROR_MESSAGES[error.code] || error.message;
    
    // 记录详细错误信息
    logger.error('操作失败', {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack
    });
    
    // 返回用户友好的错误响应
    return {
        type: 'error',
        data: {
            code: error.code,
            message: userMessage,
            timestamp: new Date().toISOString()
        }
    };
}
```

### 性能优化规范

#### 异步操作优化
```javascript
// 使用 Promise.all 并行处理
async function validateMultipleFiles(filePaths) {
    const validationPromises = filePaths.map(async (filePath) => {
        try {
            const isValid = await validateFile(filePath);
            return { filePath, valid: isValid };
        } catch (error) {
            return { filePath, valid: false, error: error.message };
        }
    });
    
    return Promise.all(validationPromises);
}

// 批量处理大量数据
async function batchProcessFiles(files, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(file => processFile(file))
        );
        results.push(...batchResults);
        
        // 在批次之间添加短暂延迟，避免阻塞事件循环
        if (i + batchSize < files.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    
    return results;
}

// 使用限制并发数
const pLimit = require('p-limit');
const limit = pLimit(5);

async function collectFileInfoConcurrently(filePaths) {
    const promises = filePaths.map(filePath => 
        limit(() => collectFileInfo(filePath))
    );
    
    return Promise.all(promises);
}
```

#### 内存管理
```javascript
// 及时清理资源
class WebSocketServer {
    constructor(options) {
        this.connections = new Map();
        this.messageHandlers = new Map();
        this.heartbeatTimers = new Map();
    }
    
    addConnection(connection) {
        this.connections.set(connection.id, connection);
        
        // 设置连接清理
        connection.on('close', () => {
            this.removeConnection(connection.id);
        });
    }
    
    removeConnection(connectionId) {
        // 清理连接
        this.connections.delete(connectionId);
        
        // 清理心跳定时器
        const timer = this.heartbeatTimers.get(connectionId);
        if (timer) {
            clearInterval(timer);
            this.heartbeatTimers.delete(connectionId);
        }
    }
    
    shutdown() {
        // 清理所有资源
        this.connections.clear();
        this.messageHandlers.clear();
        
        // 清理所有定时器
        this.heartbeatTimers.forEach(timer => clearInterval(timer));
        this.heartbeatTimers.clear();
    }
}

// 使用 WeakMap 避免内存泄漏
const fileInfoCache = new WeakMap();

function cacheFileInfo(file, info) {
    fileInfoCache.set(file, info);
}

function getCachedFileInfo(file) {
    return fileInfoCache.get(file);
}
```

#### 缓存策略
```javascript
// LRU 缓存实现
const LRU = require('lru-cache');

class FileInfoCache {
    constructor(options = {}) {
        this.cache = new LRU({
            max: options.maxSize || 1000,
            ttl: options.ttl || 1000 * 60 * 5, // 5 分钟
            updateAgeOnGet: true
        });
    }
    
    get(filePath) {
        return this.cache.get(filePath);
    }
    
    set(filePath, fileInfo) {
        this.cache.set(filePath, fileInfo);
    }
    
    clear() {
        this.cache.clear();
    }
    
    getStats() {
        return {
            size: this.cache.size,
            max: this.cache.max,
            ttl: this.cache.ttl
        };
    }
}

// 使用缓存
const fileInfoCache = new FileInfoCache({
    maxSize: 1000,
    ttl: 1000 * 60 * 5
});

async function getCachedFileInfo(filePath) {
    let fileInfo = fileInfoCache.get(filePath);
    
    if (!fileInfo) {
        fileInfo = await collectFileInfo(filePath);
        fileInfoCache.set(filePath, fileInfo);
    }
    
    return fileInfo;
}
```

## 代码质量保证

### 代码审查清单

#### 功能性检查
- [ ] 代码实现了所需的功能
- [ ] 边界条件得到正确处理
- [ ] 错误情况得到适当处理
- [ ] 返回值类型和格式正确
- [ ] 异步操作正确使用 Promise/async-await

#### 代码质量检查
- [ ] 函数长度合理（< 50 行）
- [ ] 函数职责单一
- [ ] 变量命名清晰有意义
- [ ] 注释充分且准确
- [ ] 没有重复代码
- [ ] 遵循项目编码规范

#### 性能检查
- [ ] 没有不必要的循环或递归
- [ ] 异步操作使用合适的并发策略
- [ ] 内存使用合理，及时清理资源
- [ ] 没有阻塞事件循环的长时间操作
- [ ] 合理使用缓存机制

#### 安全检查
- [ ] 输入验证充分
- [ ] 没有硬编码的敏感信息
- [ ] 文件路径处理安全
- [ ] 错误信息不泄露敏感数据
- [ ] 网络通信安全

### 测试规范

#### 单元测试
```javascript
// 测试工具函数
const { validateFilePath, getFileExtension } = require('../src/utils/file-utils');

describe('文件工具函数', () => {
    describe('getFileExtension', () => {
        test('应该正确提取文件扩展名', () => {
            expect(getFileExtension('image.jpg')).toBe('jpg');
            expect(getFileExtension('document.pdf')).toBe('pdf');
            expect(getFileExtension('archive.tar.gz')).toBe('gz');
        });
        
        test('应该处理没有扩展名的文件', () => {
            expect(getFileExtension('filename')).toBe('');
            expect(getFileExtension('')).toBe('');
        });
        
        test('应该处理路径中的文件', () => {
            expect(getFileExtension('/path/to/file.png')).toBe('png');
            expect(getFileExtension('C:\\Users\\file.txt')).toBe('txt');
        });
    });
    
    describe('validateFilePath', () => {
        test('应该验证有效路径', async () => {
            const result = await validateFilePath('/valid/path/file.txt');
            expect(result.valid).toBe(true);
        });
        
        test('应该拒绝无效路径', async () => {
            const result = await validateFilePath('');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('路径不能为空');
        });
    });
});
```

#### 集成测试
```javascript
// 测试 WebSocket 服务器
const WebSocketServer = require('../src/services/websocket-server');
const WebSocket = require('ws');

describe('WebSocket 服务器集成测试', () => {
    let server;
    let client;
    
    beforeEach(async () => {
        server = new WebSocketServer({ port: 8081 });
        await server.start();
    });
    
    afterEach(async () => {
        if (client) {
            client.close();
        }
        if (server) {
            await server.stop();
        }
    });
    
    test('应该接受客户端连接', (done) => {
        client = new WebSocket('ws://localhost:8081');
        
        client.on('open', () => {
            expect(server.getConnections().length).toBe(1);
            done();
        });
        
        client.on('error', done);
    });
    
    test('应该处理消息', (done) => {
        client = new WebSocket('ws://localhost:8081');
        
        client.on('open', () => {
            client.send(JSON.stringify({
                type: 'status_query',
                messageId: 'test_001',
                data: {}
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

### 性能监控

#### 执行时间监控
```javascript
// 性能监控装饰器
function measurePerformance(target, propertyName, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
        const startTime = Date.now();
        
        try {
            const result = await originalMethod.apply(this, args);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 记录性能数据
            this.logger?.info('方法执行完成', {
                method: propertyName,
                duration,
                args: args.length
            });
            
            // 如果执行时间过长，发出警告
            if (duration > 5000) {
                this.logger?.warn('方法执行时间过长', {
                    method: propertyName,
                    duration
                });
            }
            
            return result;
            
        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            this.logger?.error('方法执行失败', {
                method: propertyName,
                duration,
                error: error.message
            });
            
            throw error;
        }
    };
    
    return descriptor;
}

// 使用示例
class EagleDatabase {
    @measurePerformance
    async searchItems(criteria) {
        // 搜索实现
    }
    
    @measurePerformance
    async getSelectedItems() {
        // 获取选中项目实现
    }
}
```

#### 内存使用监控
```javascript
// 内存监控
class MemoryMonitor {
    constructor(options = {}) {
        this.interval = options.interval || 60000; // 1 分钟
        this.threshold = options.threshold || 0.8; // 80%
        this.timer = null;
    }
    
    start() {
        this.timer = setInterval(() => {
            const memUsage = process.memoryUsage();
            const totalMem = require('os').totalmem();
            const usagePercent = memUsage.heapUsed / totalMem;
            
            if (usagePercent > this.threshold) {
                console.warn('内存使用率过高', {
                    usagePercent: (usagePercent * 100).toFixed(2) + '%',
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
                });
            }
        }, this.interval);
    }
    
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

// 使用内存监控
const memoryMonitor = new MemoryMonitor({
    interval: 30000,  // 30 秒
    threshold: 0.8    // 80%
});

memoryMonitor.start();
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始 Eagle 插件编码规范文档 | 开发团队 |

---

**相关文档**:
- [项目规范](./project-standards.md)
- [测试规范](./testing-standards.md)
- [插件开发指南](../development/plugin-development-guide.md)