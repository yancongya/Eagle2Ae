# Eagle2Ae 通信协议规范

## 概述

本文档定义了 Eagle2Ae 系统中 Eagle 插件与 After Effects CEP 扩展之间的通信协议规范，确保两个组件能够可靠、高效地进行数据交换。

## 协议架构

### 通信方式

#### WebSocket 通信（主要）
- **用途**: 实时双向通信
- **端口**: 动态分配（默认 8080-8090 范围）
- **协议**: WebSocket over HTTP
- **数据格式**: JSON
- **连接模式**: 持久连接

#### HTTP REST API（辅助）
- **用途**: 状态查询和配置管理
- **端口**: 与 WebSocket 相同
- **协议**: HTTP/1.1
- **数据格式**: JSON
- **连接模式**: 请求-响应

### 网络拓扑

```
┌─────────────────────┐    WebSocket     ┌─────────────────────┐
│                     │ ◄──────────────► │                     │
│  After Effects      │                  │     Eagle           │
│  CEP Extension      │                  │     Plugin          │
│  (Eagle2Ae-Ae)      │                  │  (Eagle2Ae-Eagle)   │
│                     │                  │                     │
│  - UI Components    │    HTTP API      │  - WebSocket Server │
│  - WebSocket Client │ ◄──────────────► │  - Database Access  │
│  - File Manager     │                  │  - File Collector   │
│  - ExtendScript     │                  │  - Clipboard Monitor │
│                     │                  │  - Port Allocator   │
│  文件位置:          │                  │  文件位置:          │
│  js/services/       │                  │  js/websocket-*.js  │
│  jsx/file-import.jsx│                  │  js/clipboard/      │
└─────────────────────┘                  └─────────────────────┘
        │                                          │
        │                                          │
        ▼                                          ▼
┌─────────────────────┐                  ┌─────────────────────┐
│   After Effects     │                  │      Eagle          │
│   Application       │                  │   Application       │
└─────────────────────┘                  └─────────────────────┘
```

## 消息格式规范

### 基础消息结构

所有消息都必须遵循以下 JSON 结构：

```json
{
  "type": "message_type",
  "messageId": "unique_message_id",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    // 消息特定数据
  }
}
```

#### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `type` | string | 是 | 消息类型标识符 |
| `messageId` | string | 是 | 唯一消息标识符（UUID v4） |
| `timestamp` | number | 是 | Unix 时间戳（毫秒） |
| `version` | string | 是 | 协议版本号 |
| `data` | object | 是 | 消息载荷数据 |

### 响应消息结构

响应消息在基础结构上增加以下字段：

```json
{
  "type": "response_type",
  "messageId": "response_message_id",
  "requestId": "original_request_id",
  "timestamp": 1704441600000,
  "version": "1.0",
  "success": true,
  "data": {
    // 响应数据
  },
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  }
}
```

#### 响应字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `requestId` | string | 是 | 原始请求的 messageId |
| `success` | boolean | 是 | 操作是否成功 |
| `error` | object | 否 | 错误信息（仅在 success=false 时存在） |

## 消息类型定义

### 连接管理消息

#### 1. 连接建立 (connection_established)

**方向**: Eagle → AE

```json
{
  "type": "connection_established",
  "messageId": "conn_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "serverId": "eagle_server_001",
    "serverVersion": "1.0.0",
    "capabilities": [
      "file_transfer",
      "eagle_integration",
      "clipboard_monitor"
    ],
    "maxMessageSize": 10485760,
    "heartbeatInterval": 30000
  }
}
```

#### 2. 心跳检测 (heartbeat)

**方向**: 双向

```json
{
  "type": "heartbeat",
  "messageId": "hb_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "status": "alive",
    "uptime": 3600000,
    "memoryUsage": {
      "used": 52428800,
      "total": 134217728
    }
  }
}
```

#### 3. 连接断开 (connection_closing)

**方向**: 双向

```json
{
  "type": "connection_closing",
  "messageId": "close_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "reason": "user_requested",
    "message": "用户主动断开连接",
    "graceful": true
  }
}
```

### 状态查询消息

#### 4. 状态查询 (status_query)

**方向**: AE → Eagle

```json
{
  "type": "status_query",
  "messageId": "status_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "queryType": "full", // "full" | "basic" | "performance"
    "includeMetrics": true
  }
}
```

#### 5. 状态响应 (status_response)

**方向**: Eagle → AE

```json
{
  "type": "status_response",
  "messageId": "status_resp_001",
  "requestId": "status_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "success": true,
  "data": {
    "status": "running",
    "eagleConnected": true,
    "eagleLibraryPath": "/path/to/eagle/library",
    "activeConnections": 1,
    "uptime": 7200000,
    "performance": {
      "cpuUsage": 15.5,
      "memoryUsage": 67.2,
      "messageQueueSize": 0
    },
    "capabilities": [
      "file_transfer",
      "eagle_integration",
      "clipboard_monitor"
    ]
  }
}
```

### Eagle 数据查询消息

#### 6. 获取选中项目 (eagle_selected_items)

**方向**: AE → Eagle

```json
{
  "type": "eagle_selected_items",
  "messageId": "selected_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "includeMetadata": true,
    "includeThumbnails": false,
    "maxItems": 100
  }
}
```

#### 7. 选中项目响应 (eagle_selected_items_response)

**方向**: Eagle → AE

```json
{
  "type": "eagle_selected_items_response",
  "messageId": "selected_resp_001",
  "requestId": "selected_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_001",
        "name": "sample_image",
        "ext": "jpg",
        "size": 2048576,
        "width": 1920,
        "height": 1080,
        "filePath": "/path/to/sample_image.jpg",
        "tags": ["design", "photo"],
        "folderId": "folder_001",
        "created": 1704441600000,
        "modified": 1704441600000,
        "metadata": {
          "camera": "Canon EOS R5",
          "iso": 100,
          "aperture": "f/2.8"
        }
      }
    ],
    "totalCount": 1,
    "hasMore": false
  }
}
```

#### 8. 搜索项目 (eagle_search_items)

**方向**: AE → Eagle

```json
{
  "type": "eagle_search_items",
  "messageId": "search_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "query": {
      "keyword": "design",
      "tags": ["ui", "web"],
      "ext": ["jpg", "png"],
      "folderId": "folder_001",
      "dateRange": {
        "start": 1704441600000,
        "end": 1704528000000
      },
      "sizeRange": {
        "min": 1024,
        "max": 10485760
      }
    },
    "options": {
      "limit": 50,
      "offset": 0,
      "sortBy": "created",
      "sortOrder": "desc",
      "includeMetadata": true
    }
  }
}
```

### 文件操作消息

#### 9. 文件信息查询 (file_info_query)

**方向**: AE → Eagle

```json
{
  "type": "file_info_query",
  "messageId": "fileinfo_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "filePath": "/path/to/file.jpg",
    "includeMetadata": true,
    "includeThumbnail": false,
    "thumbnailSize": 256
  }
}
```

#### 10. 批量文件信息查询 (file_info_batch)

**方向**: AE → Eagle

```json
{
  "type": "file_info_batch",
  "messageId": "batch_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "filePaths": [
      "/path/to/file1.jpg",
      "/path/to/file2.png",
      "/path/to/video.mp4"
    ],
    "options": {
      "includeMetadata": true,
      "includeThumbnails": false,
      "maxConcurrent": 5,
      "timeout": 30000
    }
  }
}
```

#### 11. 文件信息响应 (file_info_response)

**方向**: Eagle → AE

```json
{
  "type": "file_info_response",
  "messageId": "fileinfo_resp_001",
  "requestId": "fileinfo_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "success": true,
  "data": {
    "fileInfo": {
      "name": "sample_image",
      "extension": "jpg",
      "size": 2048576,
      "path": "/path/to/file.jpg",
      "mimeType": "image/jpeg",
      "dimensions": {
        "width": 1920,
        "height": 1080
      },
      "created": 1704441600000,
      "modified": 1704441600000,
      "metadata": {
        "exif": {
          "camera": "Canon EOS R5",
          "lens": "RF 24-70mm F2.8 L IS USM",
          "iso": 100,
          "aperture": "f/2.8",
          "shutterSpeed": "1/125",
          "focalLength": "50mm"
        },
        "colorProfile": "sRGB",
        "hasAlpha": false
      },
      "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    }
  }
}
```

### AE 集成消息

#### 12. 发送到 AE (send_to_ae)

**方向**: AE → Eagle

```json
{
  "type": "send_to_ae",
  "messageId": "sendae_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "files": [
      {
        "path": "/path/to/file1.jpg",
        "name": "Background Image",
        "importAs": "footage" // "footage" | "composition" | "sequence"
      },
      {
        "path": "/path/to/file2.png",
        "name": "Logo",
        "importAs": "footage"
      }
    ],
    "options": {
      "createComposition": true,
      "compositionName": "Eagle Import",
      "compositionSettings": {
        "width": 1920,
        "height": 1080,
        "frameRate": 29.97,
        "duration": 10
      },
      "organizeFolders": true,
      "folderName": "Eagle Assets",
      "importLocation": "project_root", // "project_root" | "selected_folder"
      "replaceExisting": false
    }
  }
}
```

#### 13. AE 导入响应 (ae_import_response)

**方向**: Eagle → AE

```json
{
  "type": "ae_import_response",
  "messageId": "import_resp_001",
  "requestId": "sendae_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "success": true,
  "data": {
    "importedItems": [
      {
        "originalPath": "/path/to/file1.jpg",
        "aeItemId": "ae_item_001",
        "name": "Background Image",
        "type": "footage",
        "duration": 10,
        "inPoint": 0,
        "outPoint": 10
      }
    ],
    "composition": {
      "id": "ae_comp_001",
      "name": "Eagle Import",
      "width": 1920,
      "height": 1080,
      "duration": 10
    },
    "folder": {
      "id": "ae_folder_001",
      "name": "Eagle Assets"
    },
    "importedCount": 2,
    "failedCount": 0,
    "processingTime": 1500
  }
}
```

### 剪贴板监控消息

#### 14. 剪贴板变更通知 (clipboard_changed)

**方向**: Eagle → AE

```json
{
  "type": "clipboard_changed",
  "messageId": "clipboard_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "contentType": "file_paths", // "text" | "file_paths" | "image" | "unknown"
    "content": [
      "/path/to/copied/file1.jpg",
      "/path/to/copied/file2.png"
    ],
    "metadata": {
      "source": "eagle",
      "itemCount": 2,
      "totalSize": 4096000
    }
  }
}
```

### 错误消息

#### 15. 错误响应 (error)

**方向**: 双向

```json
{
  "type": "error",
  "messageId": "error_001",
  "requestId": "original_request_id",
  "timestamp": 1704441600000,
  "version": "1.0",
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "指定的文件不存在",
    "details": {
      "filePath": "/path/to/missing/file.jpg",
      "operation": "file_info_query",
      "timestamp": 1704441600000
    },
    "recoverable": false,
    "suggestions": [
      "检查文件路径是否正确",
      "确认文件是否存在",
      "检查文件访问权限"
    ]
  }
}
```

## 错误代码定义

### 连接错误 (1000-1099)

| 代码 | 名称 | 描述 | 可恢复 |
|------|------|------|--------|
| 1001 | CONNECTION_FAILED | 连接建立失败 | 是 |
| 1002 | CONNECTION_TIMEOUT | 连接超时 | 是 |
| 1003 | CONNECTION_LOST | 连接丢失 | 是 |
| 1004 | AUTHENTICATION_FAILED | 认证失败 | 否 |
| 1005 | PROTOCOL_VERSION_MISMATCH | 协议版本不匹配 | 否 |

### 消息错误 (1100-1199)

| 代码 | 名称 | 描述 | 可恢复 |
|------|------|------|--------|
| 1101 | INVALID_MESSAGE_FORMAT | 消息格式无效 | 否 |
| 1102 | UNKNOWN_MESSAGE_TYPE | 未知消息类型 | 否 |
| 1103 | MESSAGE_TOO_LARGE | 消息过大 | 否 |
| 1104 | MISSING_REQUIRED_FIELD | 缺少必需字段 | 否 |
| 1105 | INVALID_FIELD_VALUE | 字段值无效 | 否 |

### 文件错误 (1200-1299)

| 代码 | 名称 | 描述 | 可恢复 |
|------|------|------|--------|
| 1201 | FILE_NOT_FOUND | 文件不存在 | 否 |
| 1202 | FILE_ACCESS_DENIED | 文件访问被拒绝 | 否 |
| 1203 | FILE_TOO_LARGE | 文件过大 | 否 |
| 1204 | UNSUPPORTED_FILE_FORMAT | 不支持的文件格式 | 否 |
| 1205 | FILE_CORRUPTED | 文件损坏 | 否 |

### Eagle 集成错误 (1300-1399)

| 代码 | 名称 | 描述 | 可恢复 |
|------|------|------|--------|
| 1301 | EAGLE_NOT_RUNNING | Eagle 未运行 | 是 |
| 1302 | EAGLE_LIBRARY_NOT_FOUND | Eagle 库未找到 | 否 |
| 1303 | EAGLE_DATABASE_ERROR | Eagle 数据库错误 | 是 |
| 1304 | EAGLE_PERMISSION_DENIED | Eagle 权限被拒绝 | 否 |
| 1305 | EAGLE_LIBRARY_LOCKED | Eagle 库被锁定 | 是 |

### AE 集成错误 (1400-1499)

| 代码 | 名称 | 描述 | 可恢复 |
|------|------|------|--------|
| 1401 | AE_NOT_RUNNING | After Effects 未运行 | 是 |
| 1402 | AE_SCRIPT_ERROR | AE 脚本执行错误 | 是 |
| 1403 | AE_IMPORT_FAILED | AE 导入失败 | 是 |
| 1404 | AE_PROJECT_NOT_OPEN | AE 项目未打开 | 否 |
| 1405 | AE_INSUFFICIENT_MEMORY | AE 内存不足 | 是 |

### 系统错误 (1500-1599)

| 代码 | 名称 | 描述 | 可恢复 |
|------|------|------|--------|
| 1501 | INSUFFICIENT_MEMORY | 内存不足 | 是 |
| 1502 | DISK_SPACE_FULL | 磁盘空间不足 | 否 |
| 1503 | OPERATION_TIMEOUT | 操作超时 | 是 |
| 1504 | INTERNAL_ERROR | 内部错误 | 是 |
| 1505 | SERVICE_UNAVAILABLE | 服务不可用 | 是 |

## 协议版本控制

### 版本号格式

使用语义化版本控制：`MAJOR.MINOR.PATCH`

- **MAJOR**: 不兼容的协议变更
- **MINOR**: 向下兼容的功能新增
- **PATCH**: 向下兼容的问题修正

### 版本兼容性

#### 版本协商

连接建立时，双方交换支持的协议版本：

```json
{
  "type": "version_negotiation",
  "messageId": "version_001",
  "timestamp": 1704441600000,
  "data": {
    "supportedVersions": ["1.0", "1.1", "2.0"],
    "preferredVersion": "2.0",
    "minVersion": "1.0",
    "features": {
      "1.0": ["basic_file_transfer", "eagle_integration"],
      "1.1": ["batch_operations", "clipboard_monitor"],
      "2.0": ["streaming_transfer", "advanced_metadata"]
    }
  }
}
```

#### 向下兼容策略

1. **字段兼容**: 新版本可以添加可选字段，但不能删除或修改现有字段
2. **消息兼容**: 新版本可以添加新消息类型，但不能修改现有消息的语义
3. **错误兼容**: 新版本可以添加新错误代码，但不能修改现有错误代码的含义

## 性能优化

### 消息压缩

对于大于 1KB 的消息，使用 gzip 压缩：

```json
{
  "type": "compressed_message",
  "messageId": "comp_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "compression": {
    "algorithm": "gzip",
    "originalSize": 10240,
    "compressedSize": 2048
  },
  "data": "H4sIAAAAAAAAA..."
}
```

### 批量操作

支持批量处理以减少网络往返：

```json
{
  "type": "batch_operation",
  "messageId": "batch_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "operations": [
      {
        "type": "file_info_query",
        "data": { "filePath": "/path/to/file1.jpg" }
      },
      {
        "type": "file_info_query",
        "data": { "filePath": "/path/to/file2.png" }
      }
    ],
    "options": {
      "maxConcurrent": 5,
      "stopOnError": false
    }
  }
}
```

### 流式传输

对于大文件或大量数据，支持流式传输：

```json
{
  "type": "stream_start",
  "messageId": "stream_001",
  "timestamp": 1704441600000,
  "version": "1.0",
  "data": {
    "streamId": "stream_001",
    "contentType": "file_list",
    "totalSize": 1048576,
    "chunkSize": 8192,
    "totalChunks": 128,
    "metadata": {
      "fileCount": 1000,
      "compression": "gzip"
    }
  }
}
```

## 安全考虑

### 访问控制

1. **本地连接限制**: 仅允许本地连接（127.0.0.1）
2. **端口绑定**: 绑定到随机可用端口，避免端口冲突
3. **连接验证**: 使用简单的令牌验证机制

### 数据验证

1. **输入验证**: 所有输入数据必须经过验证
2. **路径验证**: 文件路径必须在允许的目录范围内
3. **大小限制**: 限制消息和文件的最大大小

### 错误处理

1. **敏感信息**: 错误消息不包含敏感的系统信息
2. **日志记录**: 记录安全相关事件
3. **速率限制**: 防止消息洪水攻击

## 实现指南

### 客户端实现 (AE CEP)

```javascript
class Eagle2AeClient {
    constructor(options = {}) {
        this.options = {
            host: 'localhost',
            portRange: [8080, 8090],
            reconnectInterval: 5000,
            maxReconnectAttempts: 10,
            messageTimeout: 30000,
            ...options
        };
        
        this.ws = null;
        this.connected = false;
        this.messageHandlers = new Map();
        this.pendingRequests = new Map();
    }
    
    async connect() {
        for (let port = this.options.portRange[0]; port <= this.options.portRange[1]; port++) {
            try {
                await this.connectToPort(port);
                return;
            } catch (error) {
                console.log(`端口 ${port} 连接失败，尝试下一个端口`);
            }
        }
        throw new Error('无法连接到 Eagle 插件');
    }
    
    async sendMessage(type, data, timeout = this.options.messageTimeout) {
        const messageId = this.generateMessageId();
        const message = {
            type,
            messageId,
            timestamp: Date.now(),
            version: '1.0',
            data
        };
        
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pendingRequests.delete(messageId);
                reject(new Error('消息响应超时'));
            }, timeout);
            
            this.pendingRequests.set(messageId, {
                resolve,
                reject,
                timer
            });
            
            this.ws.send(JSON.stringify(message));
        });
    }
    
    registerMessageHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }
    
    handleMessage(message) {
        // 处理响应消息
        if (message.requestId && this.pendingRequests.has(message.requestId)) {
            const request = this.pendingRequests.get(message.requestId);
            clearTimeout(request.timer);
            this.pendingRequests.delete(message.requestId);
            
            if (message.success) {
                request.resolve(message.data);
            } else {
                request.reject(new Error(message.error.message));
            }
            return;
        }
        
        // 处理主动消息
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
            handler(message.data);
        }
    }
}
```

### 服务器实现 (Eagle Plugin)

```javascript
class Eagle2AeServer {
    constructor(options = {}) {
        this.options = {
            port: 8080,
            host: 'localhost',
            heartbeatInterval: 30000,
            maxConnections: 10,
            messageQueueSize: 1000,
            ...options
        };
        
        this.wss = null;
        this.connections = new Map();
        this.messageHandlers = new Map();
        this.setupDefaultHandlers();
    }
    
    async start() {
        const WebSocket = require('ws');
        
        this.wss = new WebSocket.Server({
            port: this.options.port,
            host: this.options.host
        });
        
        this.wss.on('connection', (ws) => {
            this.handleConnection(ws);
        });
        
        console.log(`Eagle2Ae 服务器启动在 ${this.options.host}:${this.options.port}`);
    }
    
    handleConnection(ws) {
        const connectionId = this.generateConnectionId();
        const connection = {
            id: connectionId,
            ws,
            connected: true,
            lastHeartbeat: Date.now()
        };
        
        this.connections.set(connectionId, connection);
        
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                this.handleMessage(connection, message);
            } catch (error) {
                this.sendError(connection, 'INVALID_MESSAGE_FORMAT', '消息格式无效');
            }
        });
        
        ws.on('close', () => {
            this.connections.delete(connectionId);
        });
        
        // 发送连接建立消息
        this.sendMessage(connection, 'connection_established', {
            serverId: 'eagle_server_001',
            serverVersion: '1.0.0',
            capabilities: ['file_transfer', 'eagle_integration', 'clipboard_monitor']
        });
    }
    
    async handleMessage(connection, message) {
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
            try {
                const result = await handler(message.data, connection);
                this.sendResponse(connection, message, true, result);
            } catch (error) {
                this.sendResponse(connection, message, false, null, {
                    code: 'HANDLER_ERROR',
                    message: error.message
                });
            }
        } else {
            this.sendError(connection, 'UNKNOWN_MESSAGE_TYPE', `未知消息类型: ${message.type}`);
        }
    }
    
    registerMessageHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }
    
    sendMessage(connection, type, data) {
        const message = {
            type,
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            version: '1.0',
            data
        };
        
        connection.ws.send(JSON.stringify(message));
    }
    
    sendResponse(connection, originalMessage, success, data, error = null) {
        const response = {
            type: originalMessage.type + '_response',
            messageId: this.generateMessageId(),
            requestId: originalMessage.messageId,
            timestamp: Date.now(),
            version: '1.0',
            success,
            data,
            error
        };
        
        connection.ws.send(JSON.stringify(response));
    }
}
```

## 测试和调试

### 消息日志

所有消息都应该被记录以便调试：

```javascript
class MessageLogger {
    constructor(options = {}) {
        this.options = {
            logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
            logToFile: true,
            logToConsole: true,
            maxLogSize: 10 * 1024 * 1024, // 10MB
            ...options
        };
    }
    
    logMessage(direction, message, connection = null) {
        const logEntry = {
            timestamp: Date.now(),
            direction, // 'sent' | 'received'
            messageType: message.type,
            messageId: message.messageId,
            connectionId: connection?.id,
            size: JSON.stringify(message).length,
            success: message.success,
            error: message.error?.code
        };
        
        if (this.options.logToConsole) {
            console.log(`[${direction.toUpperCase()}] ${message.type} (${message.messageId})`);
        }
        
        if (this.options.logToFile) {
            this.writeToFile(logEntry);
        }
    }
}
```

### 性能监控

```javascript
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            messagesSent: 0,
            messagesReceived: 0,
            bytesTransferred: 0,
            averageResponseTime: 0,
            errorCount: 0,
            connectionCount: 0
        };
        
        this.responseTimes = [];
    }
    
    recordMessage(direction, size, responseTime = null) {
        if (direction === 'sent') {
            this.metrics.messagesSent++;
        } else {
            this.metrics.messagesReceived++;
        }
        
        this.metrics.bytesTransferred += size;
        
        if (responseTime !== null) {
            this.responseTimes.push(responseTime);
            this.updateAverageResponseTime();
        }
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            uptime: Date.now() - this.startTime,
            memoryUsage: process.memoryUsage()
        };
    }
}
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始通信协议规范文档 | 开发团队 |

---

**相关文档**:
- [Eagle 插件 API 参考](../EAGLE/api/plugin-api.md)
- [AE CEP 扩展 API 参考](../AE/api/api-reference.md)
- [WebSocket 服务器 API](../EAGLE/api/websocket-server.md)
- [通信 API 参考](../AE/api/communication-api.md)