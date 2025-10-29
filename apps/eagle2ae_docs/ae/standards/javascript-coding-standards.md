# JavaScript 编码规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的 JavaScript 编码规范和最佳实践，确保代码质量、可维护性和团队协作效率。

## 基础语法规范

### 缩进和空格

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
        url: 'ws://localhost:8080',
        timeout: 5000
    },
    import: {
        mode: 'footage',
        createComposition: true
    }
};

const supportedFormats = [
    'jpg', 'jpeg', 'png', 'tiff',
    'mp4', 'mov', 'avi',
    'wav', 'mp3', 'aiff'
];
```

### 分号和引号

```javascript
// 必须使用分号
const message = 'Hello World';
const result = calculateSum(a, b);

// 字符串优先使用单引号
const singleQuote = 'This is preferred';
const doubleQuote = "Only when containing 'single quotes'";

// JSON 数据使用双引号
const jsonData = {
    "type": "file_transfer",
    "data": {
        "files": []
    }
};
```

## 命名规范

### 变量和函数命名

```javascript
// 变量使用 camelCase
const websocketClient = new WebSocketClient();
const fileImportManager = new FileImportManager();
const currentProjectInfo = getProjectInfo();

// 常量使用 UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_TIMEOUT = 5000;
const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'tiff'];

// 函数使用 camelCase，动词开头
function connectToServer() { /* ... */ }
function validateFileFormat(extension) { /* ... */ }
function createCompositionFromFiles(files) { /* ... */ }

// 布尔值使用 is/has/can 前缀
const isConnected = client.connected;
const hasValidFiles = files.every(file => file.valid);
const canImportFile = checkFilePermissions(filePath);

// 私有方法使用下划线前缀
class WebSocketClient {
    connect() {
        this._initializeConnection();
    }
    
    _initializeConnection() {
        // 私有方法实现
    }
}
```

### 类和构造函数命名

```javascript
// 类名使用 PascalCase
class WebSocketClient {
    constructor(url, options = {}) {
        this.url = url;
        this.options = options;
    }
}

class FileImportManager {
    constructor(aeInterface) {
        this.aeInterface = aeInterface;
    }
}

// 工厂函数使用 camelCase
function createWebSocketClient(url, options) {
    return new WebSocketClient(url, options);
}
```

## 注释规范

### 文件头注释

```javascript
/**
 * WebSocket 客户端管理器
 * 负责与 Eagle 插件的 WebSocket 通信
 * 
 * @author Eagle2Ae 开发团队
 * @date 2024-01-05
 * @version 1.0.0
 * @since 1.0.0
 */
```

### 函数注释

```javascript
/**
 * 建立 WebSocket 连接
 * @param {string} url - WebSocket 服务器地址
 * @param {Object} options - 连接选项
 * @param {number} options.timeout - 连接超时时间（毫秒）
 * @param {number} options.retryCount - 重试次数
 * @param {boolean} options.autoReconnect - 是否自动重连
 * @returns {Promise<WebSocket>} WebSocket 连接实例
 * @throws {Error} 连接失败时抛出错误
 * @example
 * const client = await connectWebSocket('ws://localhost:8080', {
 *     timeout: 5000,
 *     retryCount: 3,
 *     autoReconnect: true
 * });
 */
async function connectWebSocket(url, options = {}) {
    // 实现代码...
}
```

### 类注释

```javascript
/**
 * 文件导入管理器
 * 负责处理文件导入到 After Effects 的所有操作
 * 
 * @class FileImportManager
 * @example
 * const manager = new FileImportManager(csInterface);
 * const result = await manager.importFiles(files, settings);
 */
class FileImportManager {
    /**
     * 构造函数
     * @param {Object} csInterface - CEP CSInterface 实例
     */
    constructor(csInterface) {
        this.csInterface = csInterface;
    }
    
    /**
     * 导入文件到 After Effects
     * @param {Array<Object>} files - 文件信息数组
     * @param {Object} settings - 导入设置
     * @returns {Promise<Object>} 导入结果
     */
    async importFiles(files, settings) {
        // 实现代码...
    }
}
```

### 行内注释

```javascript
function processFileImport(files, settings) {
    // 验证文件列表
    if (!files || files.length === 0) {
        throw new Error('文件列表不能为空');
    }
    
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
    
    // 开始批量导入处理
    return batchImportFiles(validFiles, settings);
}
```

## 错误处理规范

### 异步错误处理

```javascript
// 使用 try-catch 处理异步操作
async function importFileToAE(filePath, options) {
    try {
        // 验证文件路径
        const isValid = await validateFilePath(filePath);
        if (!isValid) {
            throw new Error(`无效的文件路径: ${filePath}`);
        }
        
        // 执行导入操作
        const result = await executeImport(filePath, options);
        
        // 记录成功日志
        logger.info('文件导入成功', {
            filePath,
            itemId: result.itemId,
            duration: result.duration
        });
        
        return result;
        
    } catch (error) {
        // 记录错误日志
        logger.error('文件导入失败', {
            filePath,
            error: error.message,
            stack: error.stack
        });
        
        // 重新抛出错误，让上层处理
        throw new Error(`文件导入失败: ${error.message}`);
    }
}
```

### 错误分类和处理

```javascript
// 定义错误类型
class FileImportError extends Error {
    constructor(message, code, filePath) {
        super(message);
        this.name = 'FileImportError';
        this.code = code;
        this.filePath = filePath;
    }
}

class ConnectionError extends Error {
    constructor(message, url) {
        super(message);
        this.name = 'ConnectionError';
        this.url = url;
    }
}

// 使用自定义错误
function validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new FileImportError(
            '文件不存在',
            'FILE_NOT_FOUND',
            filePath
        );
    }
    
    const extension = getFileExtension(filePath);
    if (!SUPPORTED_FORMATS.includes(extension)) {
        throw new FileImportError(
            '不支持的文件格式',
            'UNSUPPORTED_FORMAT',
            filePath
        );
    }
}
```

### 用户友好的错误提示

```javascript
// 错误消息映射
const ERROR_MESSAGES = {
    'FILE_NOT_FOUND': '文件不存在，请检查文件路径是否正确',
    'UNSUPPORTED_FORMAT': '不支持的文件格式，请选择支持的图片或视频文件',
    'CONNECTION_FAILED': '无法连接到 Eagle 插件，请确保 Eagle 正在运行',
    'IMPORT_FAILED': '文件导入失败，请重试或检查 After Effects 状态',
    'INSUFFICIENT_MEMORY': '内存不足，请关闭其他应用程序后重试'
};

// 显示用户友好的错误信息
function showUserError(error) {
    const userMessage = ERROR_MESSAGES[error.code] || error.message;
    
    // 显示错误对话框
    showErrorDialog({
        title: '操作失败',
        message: userMessage,
        details: error.code ? `错误代码: ${error.code}` : null,
        buttons: ['确定', '重试']
    });
}
```

## 性能优化规范

### 异步操作优化

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
        
        // 在批次之间添加短暂延迟，避免阻塞 UI
        if (i + batchSize < files.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    
    return results;
}
```

### 内存管理

```javascript
// 及时清理资源
class WebSocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.messageHandlers = new Map();
        this.heartbeatTimer = null;
    }
    
    connect() {
        // 连接逻辑...
    }
    
    disconnect() {
        // 清理定时器
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        
        // 清理事件监听器
        this.messageHandlers.clear();
        
        // 关闭 WebSocket 连接
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// 使用 WeakMap 避免内存泄漏
const fileCache = new WeakMap();

function cacheFileInfo(file, info) {
    fileCache.set(file, info);
}

function getCachedFileInfo(file) {
    return fileCache.get(file);
}
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始 JavaScript 编码规范文档 | 开发团队 |

---

**相关文档**:
- [JSX 编码规范](./jsx-coding-standards.md)
- [文件组织规范](./file-organization-standards.md)
- [项目规范](./project-standards.md)