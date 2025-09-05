# WebSocket 服务器 API 参考

## 概述

本文档详细描述了 Eagle2Ae Eagle 插件中 WebSocket 服务器的实际 API 接口，基于 `Eagle2AeWebSocketServer` 类的实现。包括服务器启动、连接管理、消息处理和统计功能。

## 服务器核心 API

### Eagle2AeWebSocketServer 类

#### 构造函数

```javascript
/**
 * Eagle2Ae WebSocket 服务器构造函数
 * @param {number} port - 服务器端口（默认: 8080）
 * @param {Eagle2Ae} eagle2aeInstance - Eagle2Ae 主实例引用
 */
constructor(port = 8080, eagle2aeInstance = null) {
    this.port = port;
    this.eagle2ae = eagle2aeInstance;
    this.server = null;          // HTTP 服务器实例
    this.wss = null;             // WebSocket 服务器实例
    this.clients = new Map();    // 客户端连接映射
    this.isRunning = false;
    
    // 心跳检测配置
    this.heartbeatInterval = 30000; // 30秒
    this.heartbeatTimer = null;
    
    // 消息队列
    this.messageQueue = [];
    this.maxQueueSize = 1000;
    
    // 统计信息
    this.stats = {
        connectionsTotal: 0,
        messagesReceived: 0,
        messagesSent: 0,
        errors: 0
    };
}
```

**配置选项详解**:
```javascript
const server = new WebSocketServer({
    port: 8080,
    host: 'localhost',
    
    // CORS 配置
    cors: {
        origin: '*',
        credentials: true
    },
    
    // SSL 配置（可选）
    ssl: {
        enabled: false,
        cert: '/path/to/cert.pem',
        key: '/path/to/key.pem'
    },
    
    // 压缩配置
    compression: {
        enabled: true,
        threshold: 1024,  // 超过 1KB 的消息进行压缩
        level: 6          // 压缩级别 (1-9)
    },
    
    // 心跳配置
    heartbeat: {
        enabled: true,
        interval: 30000,  // 30 秒
        timeout: 10000    // 10 秒超时
    },
    
    // 连接限制
    limits: {
        maxConnections: 10,
        maxMessageSize: 1024 * 1024,  // 1MB
        rateLimit: {
            enabled: true,
            maxRequests: 100,
            windowMs: 60000  // 1 分钟
        }
    }
});
```

#### start()
启动 WebSocket 服务器

```javascript
/**
 * 启动 WebSocket 服务器
 * @returns {Promise<Object>} 启动结果
 * @throws {Error} 启动失败时抛出错误
 */
async start()
```

**返回值**:
```javascript
{
    success: true,
    port: 8080,
    host: 'localhost',
    url: 'ws://localhost:8080',
    ssl: false,
    startTime: '2024-01-05T10:30:00.000Z',
    pid: 12345
}
```

**示例**:
```javascript
try {
    const result = await server.start();
    console.log('WebSocket 服务器启动成功:', result.url);
} catch (error) {
    console.error('服务器启动失败:', error.message);
}
```

#### stop()
停止 WebSocket 服务器

```javascript
/**
 * 停止 WebSocket 服务器
 * @param {Object} options - 停止选项
 * @param {boolean} options.graceful - 是否优雅关闭
 * @param {number} options.timeout - 关闭超时时间
 * @returns {Promise<void>}
 */
async stop(options = {})
```

**示例**:
```javascript
// 优雅关闭服务器
await server.stop({
    graceful: true,
    timeout: 5000  // 5 秒超时
});
```

#### getStatus()
获取服务器状态

```javascript
/**
 * 获取服务器当前状态
 * @returns {Object} 服务器状态信息
 */
getStatus()
```

**返回值**:
```javascript
{
    running: true,
    port: 8080,
    host: 'localhost',
    uptime: 3600000,  // 运行时间（毫秒）
    connections: {
        active: 3,
        total: 15,
        peak: 8
    },
    traffic: {
        messagesReceived: 1247,
        messagesSent: 1156,
        bytesReceived: 2048576,
        bytesSent: 1835008
    },
    performance: {
        averageResponseTime: 45,  // 毫秒
        errorRate: 0.02,          // 2%
        memoryUsage: 52428800     // 字节
    },
    lastActivity: '2024-01-05T10:35:00.000Z'
}
```

## 连接管理 API

### 连接生命周期

#### onConnection()
处理新连接

```javascript
/**
 * 注册新连接处理器
 * @param {Function} handler - 连接处理函数
 */
onConnection(handler)
```

**示例**:
```javascript
server.onConnection(async (connection) => {
    console.log('新连接建立:', connection.id);
    
    // 设置连接属性
    connection.clientType = 'unknown';
    connection.version = null;
    connection.authenticated = false;
    
    // 发送欢迎消息
    await connection.send('welcome', {
        serverId: server.id,
        serverVersion: '1.0.0',
        timestamp: new Date().toISOString()
    });
    
    // 设置连接超时
    connection.setTimeout(60000); // 60 秒
});
```

#### getConnections()
获取所有连接

```javascript
/**
 * 获取所有活动连接
 * @param {Object} filter - 过滤条件
 * @returns {Array<Connection>} 连接数组
 */
getConnections(filter = {})
```

**过滤选项**:
```javascript
// 获取所有连接
const allConnections = server.getConnections();

// 获取特定类型的连接
const aeConnections = server.getConnections({
    clientType: 'ae_extension'
});

// 获取已认证的连接
const authenticatedConnections = server.getConnections({
    authenticated: true
});

// 获取活跃连接（最近 5 分钟有活动）
const activeConnections = server.getConnections({
    lastActivity: {
        since: Date.now() - 5 * 60 * 1000
    }
});
```

#### getConnection()
获取特定连接

```javascript
/**
 * 根据 ID 获取连接
 * @param {string} connectionId - 连接 ID
 * @returns {Connection|null} 连接对象或 null
 */
getConnection(connectionId)
```

#### closeConnection()
关闭特定连接

```javascript
/**
 * 关闭特定连接
 * @param {string} connectionId - 连接 ID
 * @param {Object} options - 关闭选项
 * @param {string} options.reason - 关闭原因
 * @param {number} options.code - 关闭代码
 * @returns {boolean} 是否成功关闭
 */
closeConnection(connectionId, options = {})
```

**示例**:
```javascript
// 关闭连接并提供原因
server.closeConnection('conn_123', {
    reason: '客户端版本过低',
    code: 1008  // Policy Violation
});
```

### Connection 对象 API

#### 连接属性

```javascript
class Connection {
    constructor(ws, server) {
        this.id = generateConnectionId();
        this.ws = ws;
        this.server = server;
        this.clientType = null;
        this.version = null;
        this.authenticated = false;
        this.connectedAt = new Date();
        this.lastActivity = new Date();
        this.messageCount = 0;
        this.metadata = {};
    }
}
```

#### send()
发送消息到连接

```javascript
/**
 * 发送消息到此连接
 * @param {string} type - 消息类型
 * @param {Object} data - 消息数据
 * @param {Object} options - 发送选项
 * @returns {Promise<boolean>} 是否发送成功
 */
async send(type, data, options = {})
```

**发送选项**:
```javascript
// 基础发送
await connection.send('file_info', {
    files: fileList
});

// 带选项的发送
await connection.send('large_data', data, {
    compress: true,      // 强制压缩
    priority: 'high',    // 高优先级
    timeout: 10000,      // 10 秒超时
    retry: 3            // 重试 3 次
});
```

#### ping()
发送 ping 消息

```javascript
/**
 * 发送 ping 消息测试连接
 * @param {Object} data - ping 数据
 * @returns {Promise<number>} 响应时间（毫秒）
 */
async ping(data = {})
```

#### close()
关闭连接

```javascript
/**
 * 关闭此连接
 * @param {Object} options - 关闭选项
 */
close(options = {})
```

#### isAlive()
检查连接是否活跃

```javascript
/**
 * 检查连接是否仍然活跃
 * @returns {boolean} 是否活跃
 */
isAlive()
```

## 消息处理 API

### 消息处理器注册

#### registerMessageHandler()
注册消息处理器

```javascript
/**
 * 注册消息类型处理器
 * @param {string} messageType - 消息类型
 * @param {Function} handler - 处理函数
 * @param {Object} options - 处理器选项
 */
registerMessageHandler(messageType, handler, options = {})
```

**处理器选项**:
```javascript
server.registerMessageHandler('file_transfer', async (message, connection) => {
    // 处理逻辑
    return response;
}, {
    requireAuth: true,        // 需要认证
    rateLimit: {
        maxRequests: 10,
        windowMs: 60000
    },
    timeout: 30000,          // 30 秒超时
    priority: 'high',        // 高优先级
    validation: {
        schema: fileTransferSchema
    }
});
```

#### unregisterMessageHandler()
注销消息处理器

```javascript
/**
 * 注销消息处理器
 * @param {string} messageType - 消息类型
 * @returns {boolean} 是否成功注销
 */
unregisterMessageHandler(messageType)
```

### 内置消息处理器

#### 连接管理消息

**connection_request** - 连接请求处理
```javascript
server.registerMessageHandler('connection_request', async (message, connection) => {
    const { clientType, version, capabilities } = message.data;
    
    // 验证客户端版本
    if (!isVersionSupported(version)) {
        return {
            type: 'connection_response',
            data: {
                status: 'rejected',
                reason: 'unsupported_version',
                minVersion: '1.0.0'
            }
        };
    }
    
    // 设置连接属性
    connection.clientType = clientType;
    connection.version = version;
    connection.capabilities = capabilities;
    connection.authenticated = true;
    
    return {
        type: 'connection_response',
        data: {
            status: 'accepted',
            serverId: server.id,
            serverVersion: '1.0.0',
            supportedCapabilities: server.capabilities,
            connectionId: connection.id
        }
    };
});
```

**heartbeat** - 心跳处理
```javascript
server.registerMessageHandler('heartbeat', async (message, connection) => {
    connection.lastActivity = new Date();
    
    return {
        type: 'heartbeat_response',
        data: {
            timestamp: new Date().toISOString(),
            serverTime: Date.now()
        }
    };
});
```

#### 文件操作消息

**file_info_request** - 文件信息请求
```javascript
server.registerMessageHandler('file_info_request', async (message, connection) => {
    const { filePaths, options } = message.data;
    
    try {
        const fileInfos = await Promise.all(
            filePaths.map(async (filePath) => {
                return await fileCollector.collectFileInfo(filePath, options);
            })
        );
        
        return {
            type: 'file_info_response',
            data: {
                files: fileInfos,
                requestId: message.messageId
            }
        };
        
    } catch (error) {
        return {
            type: 'error',
            data: {
                code: 'FILE_INFO_FAILED',
                message: error.message,
                requestId: message.messageId
            }
        };
    }
});
```

**file_validation** - 文件验证
```javascript
server.registerMessageHandler('file_validation', async (message, connection) => {
    const { files } = message.data;
    
    const validationResults = await Promise.all(
        files.map(async (file) => {
            const result = await fileValidator.validate(file.path);
            return {
                path: file.path,
                valid: result.valid,
                issues: result.issues
            };
        })
    );
    
    return {
        type: 'file_validation_response',
        data: {
            results: validationResults,
            summary: {
                total: files.length,
                valid: validationResults.filter(r => r.valid).length,
                invalid: validationResults.filter(r => !r.valid).length
            }
        }
    };
});
```

#### Eagle 数据查询消息

**eagle_selection** - 获取 Eagle 选择
```javascript
server.registerMessageHandler('eagle_selection', async (message, connection) => {
    try {
        const selectedItems = await eagleDatabase.getSelectedItems();
        
        // 收集选中项目的详细信息
        const detailedItems = await Promise.all(
            selectedItems.map(async (item) => {
                const fileInfo = await fileCollector.collectFileInfo(item.path);
                return {
                    ...item,
                    fileInfo
                };
            })
        );
        
        return {
            type: 'eagle_selection_response',
            data: {
                items: detailedItems,
                count: detailedItems.length,
                timestamp: new Date().toISOString()
            }
        };
        
    } catch (error) {
        return {
            type: 'error',
            data: {
                code: 'EAGLE_SELECTION_FAILED',
                message: '获取 Eagle 选择失败',
                details: error.message
            }
        };
    }
});
```

**eagle_search** - Eagle 搜索
```javascript
server.registerMessageHandler('eagle_search', async (message, connection) => {
    const { criteria, options } = message.data;
    
    try {
        const searchResults = await eagleDatabase.searchItems(criteria);
        
        // 可选：收集文件详细信息
        let detailedResults = searchResults;
        if (options.includeFileInfo) {
            detailedResults = await Promise.all(
                searchResults.map(async (item) => {
                    const fileInfo = await fileCollector.collectFileInfo(item.path);
                    return { ...item, fileInfo };
                })
            );
        }
        
        return {
            type: 'eagle_search_response',
            data: {
                results: detailedResults,
                count: detailedResults.length,
                criteria,
                timestamp: new Date().toISOString()
            }
        };
        
    } catch (error) {
        return {
            type: 'error',
            data: {
                code: 'EAGLE_SEARCH_FAILED',
                message: 'Eagle 搜索失败',
                details: error.message
            }
        };
    }
});
```

## 广播和组播 API

### broadcast()
广播消息到所有连接

```javascript
/**
 * 广播消息到所有连接的客户端
 * @param {string} type - 消息类型
 * @param {Object} data - 消息数据
 * @param {Object} options - 广播选项
 * @returns {Object} 广播结果
 */
broadcast(type, data, options = {})
```

**广播选项**:
```javascript
// 基础广播
server.broadcast('eagle_selection_changed', {
    items: selectedItems,
    timestamp: new Date().toISOString()
});

// 条件广播
server.broadcast('file_update', fileData, {
    filter: (connection) => {
        return connection.clientType === 'ae_extension' && 
               connection.authenticated;
    },
    exclude: ['conn_123'],  // 排除特定连接
    priority: 'high'
});
```

**返回值**:
```javascript
{
    sent: 3,           // 成功发送数量
    failed: 1,         // 失败数量
    total: 4,          // 总连接数
    duration: 45,      // 发送耗时（毫秒）
    errors: [          // 错误详情
        {
            connectionId: 'conn_456',
            error: 'Connection closed'
        }
    ]
}
```

### multicast()
组播消息到特定连接组

```javascript
/**
 * 发送消息到特定连接组
 * @param {Array<string>} connectionIds - 连接 ID 数组
 * @param {string} type - 消息类型
 * @param {Object} data - 消息数据
 * @returns {Object} 发送结果
 */
multicast(connectionIds, type, data)
```

**示例**:
```javascript
// 发送到特定连接组
const aeConnections = server.getConnections({
    clientType: 'ae_extension'
}).map(conn => conn.id);

server.multicast(aeConnections, 'batch_update', {
    updates: batchData
});
```

### sendToGroup()
发送消息到连接组

```javascript
/**
 * 发送消息到连接组
 * @param {string} groupName - 组名
 * @param {string} type - 消息类型
 * @param {Object} data - 消息数据
 * @returns {Object} 发送结果
 */
sendToGroup(groupName, type, data)
```

**组管理**:
```javascript
// 创建连接组
server.createGroup('ae_clients');
server.createGroup('authenticated_users');

// 添加连接到组
server.addToGroup('ae_clients', connection.id);
server.addToGroup('authenticated_users', connection.id);

// 发送到组
server.sendToGroup('ae_clients', 'ae_specific_update', data);

// 移除连接从组
server.removeFromGroup('ae_clients', connection.id);
```

## 事件系统 API

### 服务器事件

#### 生命周期事件

```javascript
// 服务器启动
server.on('started', (info) => {
    console.log('服务器启动:', info);
});

// 服务器停止
server.on('stopped', (info) => {
    console.log('服务器停止:', info);
});

// 服务器错误
server.on('error', (error) => {
    console.error('服务器错误:', error);
});
```

#### 连接事件

```javascript
// 新连接
server.on('connection:new', (connection) => {
    console.log('新连接:', connection.id);
});

// 连接关闭
server.on('connection:closed', (connection, reason) => {
    console.log('连接关闭:', connection.id, reason);
});

// 连接错误
server.on('connection:error', (connection, error) => {
    console.error('连接错误:', connection.id, error);
});

// 连接认证
server.on('connection:authenticated', (connection) => {
    console.log('连接已认证:', connection.id);
});
```

#### 消息事件

```javascript
// 消息接收
server.on('message:received', (message, connection) => {
    console.log('收到消息:', message.type, 'from', connection.id);
});

// 消息发送
server.on('message:sent', (message, connection) => {
    console.log('发送消息:', message.type, 'to', connection.id);
});

// 消息处理错误
server.on('message:error', (error, message, connection) => {
    console.error('消息处理错误:', error, message.type);
});
```

#### 性能事件

```javascript
// 高负载警告
server.on('performance:high_load', (metrics) => {
    console.warn('服务器高负载:', metrics);
});

// 内存使用警告
server.on('performance:memory_warning', (usage) => {
    console.warn('内存使用过高:', usage);
});

// 连接数限制
server.on('performance:connection_limit', (count) => {
    console.warn('连接数接近限制:', count);
});
```

### 自定义事件

#### emit()
触发自定义事件

```javascript
/**
 * 触发自定义事件
 * @param {string} eventName - 事件名称
 * @param {...any} args - 事件参数
 */
emit(eventName, ...args)
```

**示例**:
```javascript
// 触发自定义事件
server.emit('eagle:library_changed', {
    oldPath: '/old/path',
    newPath: '/new/path',
    timestamp: new Date().toISOString()
});

// 监听自定义事件
server.on('eagle:library_changed', (data) => {
    // 通知所有客户端库路径变更
    server.broadcast('eagle_library_changed', data);
});
```

## 中间件系统

### 中间件注册

#### use()
注册中间件

```javascript
/**
 * 注册中间件
 * @param {Function} middleware - 中间件函数
 * @param {Object} options - 中间件选项
 */
use(middleware, options = {})
```

**中间件类型**:

#### 连接中间件
```javascript
// 连接认证中间件
server.use(async (connection, next) => {
    // 检查 IP 白名单
    if (!isAllowedIP(connection.remoteAddress)) {
        connection.close({ reason: 'IP not allowed' });
        return;
    }
    
    await next();
}, { type: 'connection' });
```

#### 消息中间件
```javascript
// 消息验证中间件
server.use(async (message, connection, next) => {
    // 验证消息格式
    if (!validateMessageFormat(message)) {
        await connection.send('error', {
            code: 'INVALID_MESSAGE_FORMAT',
            message: '消息格式无效'
        });
        return;
    }
    
    // 记录消息
    logger.debug('处理消息', {
        type: message.type,
        from: connection.id
    });
    
    await next();
}, { type: 'message' });
```

#### 错误处理中间件
```javascript
// 全局错误处理
server.use(async (error, context, next) => {
    logger.error('服务器错误', {
        error: error.message,
        stack: error.stack,
        context: context.type
    });
    
    // 发送错误响应
    if (context.connection) {
        await context.connection.send('error', {
            code: 'INTERNAL_ERROR',
            message: '服务器内部错误'
        });
    }
    
    await next();
}, { type: 'error' });
```

### 内置中间件

#### 速率限制中间件
```javascript
const rateLimitMiddleware = createRateLimitMiddleware({
    maxRequests: 100,
    windowMs: 60000,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});

server.use(rateLimitMiddleware, { type: 'message' });
```

#### 压缩中间件
```javascript
const compressionMiddleware = createCompressionMiddleware({
    threshold: 1024,
    level: 6,
    filter: (message) => {
        return message.type !== 'heartbeat';
    }
});

server.use(compressionMiddleware, { type: 'message' });
```

#### 日志中间件
```javascript
const loggingMiddleware = createLoggingMiddleware({
    level: 'info',
    includePayload: false,
    filter: (message) => {
        return !['heartbeat', 'ping'].includes(message.type);
    }
});

server.use(loggingMiddleware, { type: 'message' });
```

## 安全和认证

### 认证系统

#### 基于令牌的认证
```javascript
server.registerMessageHandler('authenticate', async (message, connection) => {
    const { token, clientInfo } = message.data;
    
    try {
        // 验证令牌
        const payload = await verifyToken(token);
        
        // 设置连接认证状态
        connection.authenticated = true;
        connection.userId = payload.userId;
        connection.permissions = payload.permissions;
        
        return {
            type: 'authenticate_response',
            data: {
                status: 'success',
                userId: payload.userId,
                permissions: payload.permissions
            }
        };
        
    } catch (error) {
        return {
            type: 'authenticate_response',
            data: {
                status: 'failed',
                reason: 'invalid_token'
            }
        };
    }
});
```

#### 权限检查中间件
```javascript
const authMiddleware = async (message, connection, next) => {
    // 检查是否需要认证
    const protectedTypes = ['file_transfer', 'eagle_search', 'system_command'];
    
    if (protectedTypes.includes(message.type)) {
        if (!connection.authenticated) {
            await connection.send('error', {
                code: 'AUTHENTICATION_REQUIRED',
                message: '此操作需要认证'
            });
            return;
        }
        
        // 检查权限
        if (!hasPermission(connection.permissions, message.type)) {
            await connection.send('error', {
                code: 'PERMISSION_DENIED',
                message: '权限不足'
            });
            return;
        }
    }
    
    await next();
};

server.use(authMiddleware, { type: 'message' });
```

### 安全配置

#### SSL/TLS 配置
```javascript
const server = new WebSocketServer({
    port: 8443,
    ssl: {
        enabled: true,
        cert: fs.readFileSync('/path/to/cert.pem'),
        key: fs.readFileSync('/path/to/key.pem'),
        ca: fs.readFileSync('/path/to/ca.pem'),
        requestCert: false,
        rejectUnauthorized: false
    }
});
```

#### CORS 配置
```javascript
const server = new WebSocketServer({
    cors: {
        origin: ['http://localhost:3000', 'https://app.example.com'],
        credentials: true,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization', 'Content-Type']
    }
});
```

## 性能监控和优化

### 性能监控

#### getMetrics()
获取性能指标

```javascript
/**
 * 获取服务器性能指标
 * @returns {Object} 性能指标
 */
getMetrics()
```

**返回值**:
```javascript
{
    connections: {
        active: 5,
        total: 127,
        peak: 23,
        averageLifetime: 1800000  // 毫秒
    },
    messages: {
        received: 15247,
        sent: 14156,
        errors: 23,
        averageSize: 2048,
        throughput: 156.7  // 消息/秒
    },
    performance: {
        averageResponseTime: 45,
        p95ResponseTime: 120,
        p99ResponseTime: 250,
        errorRate: 0.015,
        uptime: 7200000
    },
    memory: {
        used: 67108864,
        available: 8589934592,
        usage: 0.78  // 百分比
    },
    network: {
        bytesReceived: 104857600,
        bytesSent: 94371840,
        bandwidth: 1048576  // 字节/秒
    }
}
```

#### 性能警报
```javascript
// 监控性能指标
setInterval(() => {
    const metrics = server.getMetrics();
    
    // 检查响应时间
    if (metrics.performance.averageResponseTime > 1000) {
        server.emit('performance:slow_response', metrics);
    }
    
    // 检查错误率
    if (metrics.performance.errorRate > 0.05) {
        server.emit('performance:high_error_rate', metrics);
    }
    
    // 检查内存使用
    if (metrics.memory.usage > 0.9) {
        server.emit('performance:memory_warning', metrics.memory);
    }
}, 30000); // 每 30 秒检查一次
```

### 性能优化

#### 连接池管理
```javascript
// 配置连接池
const server = new WebSocketServer({
    connectionPool: {
        maxConnections: 100,
        idleTimeout: 300000,      // 5 分钟空闲超时
        cleanupInterval: 60000,   // 1 分钟清理间隔
        maxLifetime: 3600000     // 1 小时最大生命周期
    }
});
```

#### 消息队列
```javascript
// 配置消息队列
const server = new WebSocketServer({
    messageQueue: {
        enabled: true,
        maxSize: 1000,
        priority: true,
        persistence: false
    }
});
```

#### 缓存配置
```javascript
// 配置响应缓存
const server = new WebSocketServer({
    cache: {
        enabled: true,
        ttl: 300000,        // 5 分钟 TTL
        maxSize: 100,       // 最大缓存条目
        strategy: 'lru'     // LRU 策略
    }
});
```

## 调试和故障排除

### 调试模式

#### 启用调试
```javascript
const server = new WebSocketServer({
    debug: {
        enabled: true,
        level: 'verbose',
        logConnections: true,
        logMessages: true,
        logPerformance: true
    }
});
```

#### 调试信息
```javascript
// 获取调试信息
const debugInfo = server.getDebugInfo();
console.log('调试信息:', debugInfo);

// 导出调试数据
const debugData = server.exportDebugData();
fs.writeFileSync('debug-export.json', JSON.stringify(debugData, null, 2));
```

### 故障排除工具

#### 连接诊断
```javascript
// 诊断特定连接
const diagnosis = server.diagnoseConnection('conn_123');
console.log('连接诊断:', diagnosis);

// 诊断所有连接
const allDiagnosis = server.diagnoseAllConnections();
console.log('所有连接诊断:', allDiagnosis);
```

#### 健康检查
```javascript
// 执行健康检查
const healthCheck = await server.healthCheck();
console.log('健康检查结果:', healthCheck);

// 自动健康检查
server.enableAutoHealthCheck({
    interval: 60000,  // 1 分钟
    timeout: 5000,    // 5 秒超时
    onFailure: (result) => {
        console.error('健康检查失败:', result);
    }
});
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始 WebSocket 服务器 API 文档 | 开发团队 |

---

**相关文档**:
- [Eagle 插件 API](./plugin-api.md)
- [数据库访问 API](./database-api.md)
- [Eagle 插件架构](../architecture/eagle-plugin-architecture.md)