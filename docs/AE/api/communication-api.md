# 通信 API 参考

## 概述

本文档详细描述了 Eagle2Ae CEP 扩展与 Eagle 插件之间的通信 API，包括 WebSocket 协议、HTTP 轮询接口和消息格式规范。

**版本**: v2.1.1  
**更新时间**: 2024年1月  
**支持协议**: WebSocket (主要), HTTP (备用)

## 通信架构

### 双协议支持

Eagle2Ae 支持两种通信模式：

1. **WebSocket 模式** (推荐)
   - 实时双向通信
   - 自动重连机制
   - 心跳检测
   - 低延迟

2. **HTTP 轮询模式** (备用)
   - 兼容性更好
   - 防火墙友好
   - 简单可靠
   - 适合网络受限环境

### 端口管理

- **默认端口**: 8080
- **端口范围**: 8080-8089
- **动态分配**: 支持自动端口发现
- **端口广播**: AE扩展主动广播端口信息

## WebSocket 通信 API

### 连接管理

#### 建立连接

**客户端发起连接**
```javascript
const client = new Eagle2AeWebSocketClient('ws://localhost:8080/ws', aeExtension);

// 连接事件监听
client.on('connected', () => {
    console.log('WebSocket连接建立成功');
});

client.on('disconnected', () => {
    console.log('WebSocket连接已断开');
});

client.on('error', (error) => {
    console.error('WebSocket连接错误:', error);
});

// 建立连接
await client.connect();
```

**连接握手协议**

1. **握手请求** (客户端 → 服务端)
```json
{
    "type": "handshake",
    "timestamp": 1704448200000,
    "data": {
        "clientId": "ae_client_1704448200000_abc123",
        "clientType": "ae_extension",
        "version": "2.1.1",
        "capabilities": [
            "file_transfer",
            "clipboard_import",
            "drag_drop",
            "batch_import"
        ],
        "clientInfo": {
            "aeVersion": "24.0.0",
            "osVersion": "Windows 10",
            "language": "zh-CN"
        }
    }
}
```

2. **握手响应** (服务端 → 客户端)
```json
{
    "type": "handshake_response",
    "timestamp": 1704448200100,
    "data": {
        "status": "accepted",
        "serverId": "eagle_server_1704448200100_xyz789",
        "serverVersion": "2.1.1",
        "supportedCapabilities": [
            "file_transfer",
            "clipboard_import",
            "drag_drop",
            "batch_import"
        ],
        "serverInfo": {
            "eagleVersion": "3.0.0",
            "pluginVersion": "2.1.1",
            "maxFileSize": 104857600,
            "maxBatchSize": 50
        }
    }
}
```

#### 心跳机制

**心跳请求** (双向)
```json
{
    "type": "heartbeat",
    "timestamp": 1704448230000,
    "data": {
        "status": "alive",
        "uptime": 1800000,
        "clientId": "ae_client_1704448200000_abc123"
    }
}
```

**心跳响应**
```json
{
    "type": "heartbeat_response",
    "timestamp": 1704448230050,
    "replyTo": "heartbeat_message_id",
    "data": {
        "status": "alive",
        "uptime": 1800050,
        "serverId": "eagle_server_1704448200100_xyz789"
    }
}
```

## HTTP 轮询通信 API

### 概述

HTTP轮询模式作为WebSocket的备用方案，提供更好的兼容性和稳定性。AE扩展通过定期发送HTTP请求来获取Eagle插件的消息。

### 轮询配置

```javascript
// 轮询管理器配置
const pollingManager = new PollingManager(() => {
    // 轮询回调函数
    this.pollMessages();
}, 500); // 500ms间隔
```

### 端点定义

#### 1. 消息轮询端点

**请求**:
```
GET /api/messages?clientId={clientId}&lastPollTime={timestamp}
Host: localhost:8080
```

**响应**:
```json
{
    "success": true,
    "messages": [
        {
            "id": "msg_001",
            "type": "file_transfer",
            "timestamp": 1704448200000,
            "data": {
                // 消息数据
            }
        }
    ],
    "serverTime": 1704448200100
}
```

#### 2. 端口信息广播端点

**请求**:
```
POST /ae-port-info
Host: localhost:{eagle_port}
Content-Type: application/json

{
    "aePort": 8080,
    "timestamp": 1704448200000,
    "source": "ae_extension"
}
```

**响应**:
```json
{
    "success": true,
    "message": "Port information received",
    "eaglePort": 8081
}
```

#### 3. 状态检查端点

**请求**:
```
GET /api/status
Host: localhost:8080
```

**响应**:
```json
{
    "success": true,
    "status": "running",
    "version": "2.1.1",
    "uptime": 1800000,
    "connections": 1
}
```

### 轮询流程

1. **启动轮询**: AE扩展启动时自动开始轮询
2. **消息获取**: 每500ms发送一次轮询请求
3. **消息处理**: 处理接收到的消息
4. **错误处理**: 连接失败时自动重试
5. **停止轮询**: 扩展关闭时停止轮询

```javascript
// 轮询实现示例
async pollMessages() {
    try {
        const response = await fetch(`${this.eagleUrl}/api/messages?clientId=${this.clientId}&lastPollTime=${this.lastPollTime}`);
        const data = await response.json();
        
        if (data.success && data.messages.length > 0) {
            for (const message of data.messages) {
                this.handleMessage(message);
            }
        }
        
        this.lastPollTime = data.serverTime;
    } catch (error) {
        console.error('轮询失败:', error);
    }
}
```

### 文件传输 API

#### 单文件传输

**文件传输请求**
```json
{
    "type": "file_transfer",
    "messageId": "ft_001_1704448200000",
    "timestamp": "2024-01-05T10:30:00.000Z",
    "data": {
        "files": [
            {
                "path": "/Users/username/Eagle/images/nature/sunset.jpg",
                "name": "sunset.jpg",
                "size": 2048576,
                "type": "image/jpeg",
                "checksum": "sha256:a1b2c3d4e5f6...",
                "metadata": {
                    "tags": ["nature", "sunset", "landscape"],
                    "rating": 5,
                    "annotation": "Beautiful sunset photo",
                    "dimensions": {
                        "width": 1920,
                        "height": 1080
                    },
                    "dateCreated": "2024-01-01T18:30:00.000Z",
                    "dateModified": "2024-01-02T09:15:00.000Z"
                }
            }
        ],
        "settings": {
            "importMode": "footage",
            "createComposition": false,
            "organizeFolders": true,
            "targetFolder": "Eagle Import",
            "replaceExisting": false,
            "preserveMetadata": true
        }
    }
}
```

**文件传输响应**
```json
{
    "type": "file_transfer_response",
    "messageId": "ftr_001_1704448200100",
    "replyTo": "ft_001_1704448200000",
    "timestamp": "2024-01-05T10:30:02.500Z",
    "data": {
        "status": "success",
        "imported": 1,
        "failed": 0,
        "duration": 2500,
        "details": {
            "successItems": [
                {
                    "originalPath": "/Users/username/Eagle/images/nature/sunset.jpg",
                    "projectItemId": 123,
                    "name": "sunset.jpg",
                    "folder": "Eagle Import",
                    "importedAs": "footage",
                    "duration": 0,
                    "dimensions": {
                        "width": 1920,
                        "height": 1080
                    }
                }
            ],
            "failedItems": []
        }
    }
}
```

#### 批量文件传输

**批量传输请求**
```json
{
    "type": "batch_file_transfer",
    "messageId": "bft_001_1704448200000",
    "timestamp": "2024-01-05T10:30:00.000Z",
    "data": {
        "batchId": "batch_001",
        "totalFiles": 25,
        "totalSize": 52428800,
        "files": [
            {
                "path": "/path/to/file1.jpg",
                "name": "file1.jpg",
                "size": 1024000,
                "type": "image/jpeg",
                "metadata": { /* ... */ }
            },
            {
                "path": "/path/to/file2.png",
                "name": "file2.png",
                "size": 2048000,
                "type": "image/png",
                "metadata": { /* ... */ }
            }
            // ... 更多文件
        ],
        "settings": {
            "importMode": "footage",
            "createComposition": true,
            "compositionSettings": {
                "name": "Eagle Batch Import",
                "width": 1920,
                "height": 1080,
                "frameRate": 30,
                "duration": 10,
                "arrangeMode": "stack"
            },
            "organizeFolders": true,
            "targetFolder": "Eagle Batch Import",
            "batchSize": 10
        }
    }
}
```

**批量传输进度更新**
```json
{
    "type": "batch_transfer_progress",
    "messageId": "btp_001_1704448201000",
    "replyTo": "bft_001_1704448200000",
    "timestamp": "2024-01-05T10:30:01.000Z",
    "data": {
        "batchId": "batch_001",
        "progress": {
            "completed": 10,
            "total": 25,
            "percentage": 40,
            "currentFile": "file11.jpg",
            "estimatedTimeRemaining": 15000
        },
        "status": "processing"
    }
}
```

**批量传输完成响应**
```json
{
    "type": "batch_transfer_response",
    "messageId": "btr_001_1704448205000",
    "replyTo": "bft_001_1704448200000",
    "timestamp": "2024-01-05T10:30:05.000Z",
    "data": {
        "batchId": "batch_001",
        "status": "completed",
        "imported": 23,
        "failed": 2,
        "duration": 5000,
        "summary": {
            "totalFiles": 25,
            "successRate": 92,
            "averageFileSize": 2097152,
            "totalDataTransferred": 48234496
        },
        "composition": {
            "created": true,
            "id": 456,
            "name": "Eagle Batch Import",
            "layerCount": 23
        },
        "details": {
            "successItems": [
                /* 成功导入的文件列表 */
            ],
            "failedItems": [
                {
                    "originalPath": "/path/to/corrupted.jpg",
                    "name": "corrupted.jpg",
                    "error": "FILE_CORRUPTED",
                    "message": "文件损坏，无法导入"
                },
                {
                    "originalPath": "/path/to/unsupported.xyz",
                    "name": "unsupported.xyz",
                    "error": "UNSUPPORTED_FORMAT",
                    "message": "不支持的文件格式"
                }
            ]
        }
    }
}
```

### 状态同步 API

#### 项目状态查询

**状态查询请求**
```json
{
    "type": "status_query",
    "messageId": "sq_001_1704448200000",
    "timestamp": "2024-01-05T10:30:00.000Z",
    "data": {
        "queryType": "project",
        "includeDetails": true
    }
}
```

**状态查询响应**
```json
{
    "type": "status_response",
    "messageId": "sr_001_1704448200100",
    "replyTo": "sq_001_1704448200000",
    "timestamp": "2024-01-05T10:30:00.100Z",
    "data": {
        "project": {
            "name": "My Project.aep",
            "path": "/Users/username/Projects/My Project.aep",
            "modified": false,
            "itemCount": 45,
            "compCount": 8,
            "footageCount": 32,
            "folderCount": 5,
            "activeItem": {
                "id": 123,
                "name": "Main Composition",
                "type": "CompItem"
            },
            "renderQueue": {
                "numItems": 2,
                "rendering": false
            }
        },
        "application": {
            "version": "24.0.0",
            "build": "24.0.0.52",
            "language": "zh-CN",
            "memoryUsage": 1073741824,
            "uptime": 3600000
        }
    }
}
```

#### 实时状态更新

**状态变更通知**
```json
{
    "type": "status_update",
    "messageId": "su_001_1704448200000",
    "timestamp": "2024-01-05T10:30:00.000Z",
    "data": {
        "changeType": "project_modified",
        "changes": {
            "project": {
                "modified": true,
                "itemCount": 46,
                "lastModified": "2024-01-05T10:30:00.000Z"
            }
        }
    }
}
```

### 错误处理 API

#### 错误消息格式

**标准错误响应**
```json
{
    "type": "error",
    "messageId": "err_001_1704448200000",
    "replyTo": "original_message_id",
    "timestamp": "2024-01-05T10:30:00.000Z",
    "data": {
        "code": "FILE_NOT_FOUND",
        "message": "指定的文件不存在",
        "details": {
            "filePath": "/path/to/missing/file.jpg",
            "operation": "file_transfer",
            "suggestion": "请检查文件路径是否正确"
        },
        "severity": "error",
        "recoverable": true,
        "retryAfter": 5000
    }
}
```

#### 错误代码定义

**连接相关错误**
- `CONNECTION_FAILED` - 连接失败
- `CONNECTION_TIMEOUT` - 连接超时
- `CONNECTION_REFUSED` - 连接被拒绝
- `PROTOCOL_VERSION_MISMATCH` - 协议版本不匹配

**文件相关错误**
- `FILE_NOT_FOUND` - 文件不存在
- `FILE_ACCESS_DENIED` - 文件访问被拒绝
- `FILE_CORRUPTED` - 文件损坏
- `UNSUPPORTED_FORMAT` - 不支持的文件格式
- `FILE_TOO_LARGE` - 文件过大

**项目相关错误**
- `PROJECT_NOT_OPEN` - 项目未打开
- `ITEM_NOT_FOUND` - 项目素材不存在
- `INVALID_COMPOSITION` - 无效的合成
- `IMPORT_FAILED` - 导入失败

**系统相关错误**
- `INSUFFICIENT_MEMORY` - 内存不足
- `DISK_SPACE_LOW` - 磁盘空间不足
- `PERMISSION_DENIED` - 权限被拒绝
- `OPERATION_CANCELLED` - 操作被取消

## HTTP REST API

### 基础信息

**基础 URL**: `http://localhost:8080/api/v1`

**认证**: 无需认证（本地通信）

**内容类型**: `application/json`

### 端点列表

#### 服务器状态

**GET /status**

获取服务器状态信息

**响应示例**:
```json
{
    "status": "running",
    "version": "1.0.0",
    "uptime": 3600000,
    "connections": {
        "active": 1,
        "total": 5
    },
    "eagle": {
        "version": "3.0.0",
        "running": true,
        "libraryPath": "/Users/username/Eagle"
    }
}
```

#### 文件信息

**GET /files/info**

获取选中文件的信息

**查询参数**:
- `paths` (string[]): 文件路径数组
- `includeMetadata` (boolean): 是否包含元数据

**响应示例**:
```json
{
    "files": [
        {
            "path": "/path/to/file.jpg",
            "name": "file.jpg",
            "size": 1024000,
            "type": "image/jpeg",
            "exists": true,
            "readable": true,
            "metadata": {
                "tags": ["nature"],
                "rating": 5,
                "dimensions": {
                    "width": 1920,
                    "height": 1080
                }
            }
        }
    ]
}
```

**POST /files/validate**

验证文件列表

**请求体**:
```json
{
    "files": [
        {
            "path": "/path/to/file1.jpg"
        },
        {
            "path": "/path/to/file2.png"
        }
    ]
}
```

**响应示例**:
```json
{
    "valid": [
        {
            "path": "/path/to/file1.jpg",
            "status": "valid"
        }
    ],
    "invalid": [
        {
            "path": "/path/to/file2.png",
            "status": "not_found",
            "error": "文件不存在"
        }
    ]
}
```

#### Eagle 集成

**GET /eagle/selection**

获取 Eagle 中当前选中的文件

**响应示例**:
```json
{
    "selection": [
        {
            "id": "eagle_item_001",
            "path": "/Users/username/Eagle/images/photo1.jpg",
            "name": "photo1.jpg",
            "tags": ["nature", "landscape"],
            "rating": 5,
            "folder": "Nature Photos"
        }
    ],
    "count": 1
}
```

**POST /eagle/export**

导出选中文件到 After Effects

**请求体**:
```json
{
    "items": [
        {
            "id": "eagle_item_001",
            "exportOptions": {
                "format": "original",
                "quality": "high"
            }
        }
    ],
    "settings": {
        "importMode": "footage",
        "createComposition": true
    }
}
```

## 客户端 SDK

### JavaScript SDK

#### WebSocket 客户端

```javascript
class Eagle2AeClient {
    constructor(options = {}) {
        this.url = options.url || 'ws://localhost:8080';
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
        this.heartbeatInterval = options.heartbeatInterval || 30000;
        
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.messageHandlers = new Map();
        this.pendingMessages = new Map();
        
        this.setupEventHandlers();
    }
    
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);
                
                this.ws.onopen = () => {
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();
                    this.emit('connected');
                    resolve();
                };
                
                this.ws.onmessage = (event) => {
                    this.handleMessage(JSON.parse(event.data));
                };
                
                this.ws.onclose = () => {
                    this.connected = false;
                    this.stopHeartbeat();
                    this.emit('disconnected');
                    this.attemptReconnect();
                };
                
                this.ws.onerror = (error) => {
                    this.emit('error', error);
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    send(type, data, options = {}) {
        const message = {
            type,
            messageId: this.generateMessageId(),
            timestamp: new Date().toISOString(),
            data
        };
        
        if (options.replyTo) {
            message.replyTo = options.replyTo;
        }
        
        if (this.connected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            
            // 如果需要响应，添加到待处理消息
            if (options.expectReply) {
                return new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        this.pendingMessages.delete(message.messageId);
                        reject(new Error('消息响应超时'));
                    }, options.timeout || 10000);
                    
                    this.pendingMessages.set(message.messageId, {
                        resolve,
                        reject,
                        timeout
                    });
                });
            }
        } else {
            throw new Error('WebSocket 连接未建立');
        }
        
        return message.messageId;
    }
    
    // 文件传输方法
    async transferFiles(files, settings = {}) {
        return this.send('file_transfer', {
            files,
            settings
        }, {
            expectReply: true,
            timeout: 30000
        });
    }
    
    // 批量文件传输方法
    async batchTransferFiles(files, settings = {}) {
        return this.send('batch_file_transfer', {
            batchId: this.generateBatchId(),
            totalFiles: files.length,
            totalSize: files.reduce((sum, file) => sum + file.size, 0),
            files,
            settings
        }, {
            expectReply: true,
            timeout: 60000
        });
    }
    
    // 状态查询方法
    async queryStatus(queryType = 'project') {
        return this.send('status_query', {
            queryType,
            includeDetails: true
        }, {
            expectReply: true,
            timeout: 5000
        });
    }
    
    // 事件监听
    on(event, callback) {
        if (!this.messageHandlers.has(event)) {
            this.messageHandlers.set(event, []);
        }
        this.messageHandlers.get(event).push(callback);
    }
    
    // 事件触发
    emit(event, data) {
        const handlers = this.messageHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }
    
    // 消息处理
    handleMessage(message) {
        // 处理响应消息
        if (message.replyTo && this.pendingMessages.has(message.replyTo)) {
            const pending = this.pendingMessages.get(message.replyTo);
            clearTimeout(pending.timeout);
            this.pendingMessages.delete(message.replyTo);
            
            if (message.type === 'error') {
                pending.reject(new Error(message.data.message));
            } else {
                pending.resolve(message.data);
            }
            return;
        }
        
        // 触发消息事件
        this.emit('message', message);
        this.emit(message.type, message.data);
    }
    
    // 工具方法
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateBatchId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
```

#### HTTP 客户端

```javascript
class Eagle2AeHttpClient {
    constructor(baseUrl = 'http://localhost:8080/api/v1') {
        this.baseUrl = baseUrl;
    }
    
    async request(method, endpoint, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`请求失败: ${error.message}`);
        }
    }
    
    // 获取服务器状态
    async getStatus() {
        return this.request('GET', '/status');
    }
    
    // 获取文件信息
    async getFileInfo(paths, includeMetadata = true) {
        const params = new URLSearchParams({
            paths: JSON.stringify(paths),
            includeMetadata: includeMetadata.toString()
        });
        return this.request('GET', `/files/info?${params}`);
    }
    
    // 验证文件
    async validateFiles(files) {
        return this.request('POST', '/files/validate', { files });
    }
    
    // 获取 Eagle 选择
    async getEagleSelection() {
        return this.request('GET', '/eagle/selection');
    }
    
    // 导出到 AE
    async exportToAE(items, settings) {
        return this.request('POST', '/eagle/export', { items, settings });
    }
}
```

## 使用示例

### 基础连接和文件传输

```javascript
// 创建客户端
const client = new Eagle2AeClient({
    url: 'ws://localhost:8080',
    reconnectInterval: 3000,
    maxReconnectAttempts: 5
});

// 监听事件
client.on('connected', () => {
    console.log('已连接到 Eagle 插件');
});

client.on('file_transfer_response', (data) => {
    console.log('文件传输完成:', data);
});

client.on('batch_transfer_progress', (data) => {
    console.log(`批量传输进度: ${data.progress.percentage}%`);
});

// 建立连接
try {
    await client.connect();
    
    // 传输单个文件
    const result = await client.transferFiles([
        {
            path: '/path/to/image.jpg',
            name: 'image.jpg',
            size: 1024000,
            type: 'image/jpeg'
        }
    ], {
        importMode: 'footage',
        organizeFolders: true,
        targetFolder: 'Eagle Import'
    });
    
    console.log('传输结果:', result);
    
} catch (error) {
    console.error('连接或传输失败:', error);
}
```

### 批量文件处理

```javascript
// 批量传输多个文件
const files = [
    { path: '/path/to/file1.jpg', name: 'file1.jpg', size: 1024000, type: 'image/jpeg' },
    { path: '/path/to/file2.png', name: 'file2.png', size: 2048000, type: 'image/png' },
    { path: '/path/to/file3.mp4', name: 'file3.mp4', size: 10485760, type: 'video/mp4' }
];

const settings = {
    importMode: 'footage',
    createComposition: true,
    compositionSettings: {
        name: 'Batch Import Comp',
        width: 1920,
        height: 1080,
        frameRate: 30,
        duration: 10,
        arrangeMode: 'stack'
    },
    organizeFolders: true,
    targetFolder: 'Eagle Batch Import'
};

try {
    const result = await client.batchTransferFiles(files, settings);
    console.log(`批量传输完成: ${result.imported}/${result.imported + result.failed}`);
} catch (error) {
    console.error('批量传输失败:', error);
}
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始通信 API 文档 | 开发团队 |

---

**相关文档**:
- [API 参考手册](./api-reference.md)
- [JSX 脚本 API](./jsx-scripts.md)
- [通信协议设计](../architecture/communication-protocol.md)