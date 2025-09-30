## 错误处理系统 *(v2.4.0增强)*

### ErrorHandler 类

统一的错误处理器，提供标准化的错误处理机制。

#### 构造函数

```javascript
/**
 * 错误处理器构造函数
 */
class ErrorHandler {
    constructor()
}
```

#### handleError()
处理错误

```javascript
/**
 * 处理错误
 * @param {Error|string} error - 错误对象或错误消息
 * @param {string} [context=''] - 错误上下文
 * @param {Object} [options={}] - 处理选项
 * @returns {Object} 处理结果
 */
handleError(error, context = '', options = {})
```

**参数说明**:
- `error`: 错误对象或错误消息
- `context`: 错误发生的上下文，如 'file_import', 'websocket_connection'
- `options`: 处理选项
  - `showDialog`: 是否显示错误对话框
  - `logLevel`: 日志级别 ('error', 'warn', 'info')
  - `recoverable`: 是否可恢复
  - `userMessage`: 用户友好的错误消息

**示例**:
```javascript
const errorHandler = new ErrorHandler();

try {
    await importFiles();
} catch (error) {
    const result = errorHandler.handleError(error, 'file_import', {
        showDialog: true,
        userMessage: '文件导入失败，请检查文件格式'
    });
    
    if (result.recoverable) {
        // 尝试恢复操作
        await result.recover();
    }
}
```

### 错误类型定义
状态检测错误

```javascript
/**
 * 状态检测错误类
 */
class StatusError extends Error {
    constructor(message, code, severity = 'error', recoverable = false)
}
```

**属性**:
- `code`: 错误代码
- `severity`: 错误严重程度 ('critical', 'error', 'warning', 'info')
- `recoverable`: 是否可恢复
- `suggestions`: 解决建议数组

#### ConnectionError
连接错误

```javascript
/**
 * 连接错误类
 */
class ConnectionError extends Error {
    constructor(message, target, timeout = false)
}
```

**属性**:
- `target`: 连接目标 ('ae', 'eagle', 'websocket')
- `timeout`: 是否为超时错误
- `retryable`: 是否可重试

#### ImportError
导入错误

```javascript
/**
 * 导入错误类
 */
class ImportError extends Error {
    constructor(message, files, reason)
}
```

**属性**:
- `files`: 导致错误的文件列表
- `reason`: 错误原因 ('format', 'permission', 'size', 'path')
- `partialSuccess`: 是否部分成功

### 错误代码常量

```javascript
/**
 * 错误代码常量
 */
const ErrorCodes = {
    // 连接错误
    AE_NOT_CONNECTED: 'AE_NOT_CONNECTED',
    EAGLE_NOT_CONNECTED: 'EAGLE_NOT_CONNECTED',
    WEBSOCKET_FAILED: 'WEBSOCKET_FAILED',
    
    // 项目错误
    NO_PROJECT_OPEN: 'NO_PROJECT_OPEN',
    PROJECT_NOT_SAVED: 'PROJECT_NOT_SAVED',
    NO_ACTIVE_COMPOSITION: 'NO_ACTIVE_COMPOSITION',
    
    // 文件错误
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
    FILE_ACCESS_DENIED: 'FILE_ACCESS_DENIED',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    
    // 系统错误
    INSUFFICIENT_MEMORY: 'INSUFFICIENT_MEMORY',
    OPERATION_TIMEOUT: 'OPERATION_TIMEOUT',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};
```
