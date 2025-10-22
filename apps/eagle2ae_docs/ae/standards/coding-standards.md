# AE 扩展编码规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的编码规范和最佳实践，确保代码质量、可维护性和团队协作效率。

## 文件组织规范

### 目录结构

```
Eagle2Ae-Ae/
├── CSXS/
│   └── manifest.xml          # CEP 扩展清单文件
├── js/
│   ├── main.js              # 主入口文件
│   ├── services/            # 服务层
│   │   ├── websocket-client.js
│   │   ├── file-manager.js
│   │   └── config-manager.js
│   ├── utils/               # 工具函数
│   │   ├── path-utils.js
│   │   ├── validation.js
│   │   └── logger.js
│   ├── constants/           # 常量定义
│   │   ├── message-types.js
│   │   ├── error-codes.js
│   │   └── config-defaults.js
│   └── ui/                  # UI 组件
│       ├── components/
│       └── dialogs/
├── jsx/                     # ExtendScript 脚本
│   ├── hostscript.jsx       # 主机脚本
│   ├── utils/               # JSX 工具函数
│   └── modules/             # JSX 模块
├── public/                  # 静态资源
│   ├── index.html
│   ├── css/
│   ├── images/
│   └── fonts/
└── package.json             # 项目配置
```

### 文件命名规范

#### JavaScript 文件
- 使用 kebab-case：`websocket-client.js`
- 类文件使用 PascalCase：`WebSocketClient.js`
- 工具函数使用 kebab-case：`path-utils.js`
- 常量文件使用 kebab-case：`error-codes.js`

#### JSX 文件
- 使用 kebab-case：`hostscript.jsx`
- 模块文件使用 kebab-case：`file-import.jsx`
- 工具文件使用 kebab-case：`jsx-utils.jsx`

#### HTML/CSS 文件
- 使用 kebab-case：`main-panel.html`
- 样式文件使用 kebab-case：`main-styles.css`

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
    "type": "file_transfer",
    "data": {
        "files": []
    }
};
```

### 命名规范

#### 变量和函数命名
```javascript
// 变量使用 camelCase
const websocketClient = new WebSocketClient();
const fileImportManager = new FileImportManager();
const currentProjectInfo = getProjectInfo();

// 常量使用 UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const DEFAULT_TIMEOUT = 5000;
const SUPPORTED_IMAGE_FORMATS = ['jpg', 'png', 'tiff'];

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

#### 类和构造函数命名
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

### 注释规范

#### 文件头注释
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

#### 函数注释
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

#### 类注释
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

#### 行内注释
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

### 错误处理规范

#### 异步错误处理
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

#### 错误分类和处理
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

#### 用户友好的错误提示
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
        
        // 在批次之间添加短暂延迟，避免阻塞 UI
        if (i + batchSize < files.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    
    return results;
}
```

#### 内存管理
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

## JSX 编码规范

### 基础语法规范

#### 函数定义
```javascript
/**
 * 导入文件到 After Effects 项目
 * @param {string} filePath - 文件绝对路径
 * @param {Object} options - 导入选项
 * @returns {Object} 导入结果
 */
function importFileToProject(filePath, options) {
    // 设置默认选项
    options = options || {};
    
    try {
        // 验证文件存在性
        var file = new File(filePath);
        if (!file.exists) {
            return {
                success: false,
                error: '文件不存在: ' + filePath
            };
        }
        
        // 执行导入操作
        var importOptions = new ImportOptions(file);
        var importedItem = app.project.importFile(importOptions);
        
        return {
            success: true,
            item: {
                id: importedItem.id,
                name: importedItem.name,
                typeName: importedItem.typeName
            }
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

#### 变量声明
```javascript
// 使用 var 声明变量（JSX 不支持 let/const）
function processMultipleFiles(fileList) {
    var results = [];
    var successCount = 0;
    var failureCount = 0;
    
    // 循环处理文件
    for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];
        var result = importFileToProject(file.path, file.options);
        
        if (result.success) {
            successCount++;
        } else {
            failureCount++;
        }
        
        results.push(result);
    }
    
    return {
        results: results,
        summary: {
            total: fileList.length,
            success: successCount,
            failure: failureCount
        }
    };
}
```

#### 错误处理
```javascript
// JSX 错误处理模式
function safeExecuteOperation(operation, operationName) {
    try {
        var result = operation();
        
        // 记录成功日志
        $.writeln('[INFO] ' + operationName + ' 执行成功');
        
        return {
            success: true,
            data: result
        };
        
    } catch (error) {
        // 记录错误日志
        $.writeln('[ERROR] ' + operationName + ' 执行失败: ' + error.toString());
        
        return {
            success: false,
            error: error.toString(),
            errorLine: error.line || 'unknown'
        };
    }
}

// 使用示例
function createComposition(name, width, height) {
    return safeExecuteOperation(function() {
        return app.project.items.addComp(name, width, height, 1, 10, 30);
    }, '创建合成');
}
```

### JSX 最佳实践

#### 撤销组管理
```javascript
// 正确使用撤销组
function batchImportFiles(fileList) {
    // 开始撤销组
    app.beginUndoGroup('Eagle2Ae 批量导入');
    
    try {
        var results = [];
        
        for (var i = 0; i < fileList.length; i++) {
            var result = importFileToProject(fileList[i].path);
            results.push(result);
        }
        
        // 成功完成，结束撤销组
        app.endUndoGroup();
        
        return {
            success: true,
            results: results
        };
        
    } catch (error) {
        // 发生错误，结束撤销组
        app.endUndoGroup();
        
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

#### 项目状态检查
```javascript
// 检查项目状态
function validateProjectState() {
    var issues = [];
    
    // 检查项目是否打开
    if (!app.project) {
        issues.push('没有打开的项目');
    }
    
    // 检查项目是否已保存
    if (app.project && !app.project.file) {
        issues.push('项目尚未保存');
    }
    
    // 检查内存使用情况
    if (app.memoryInUse > 0.8 * system.totalPhysicalMemory) {
        issues.push('内存使用率过高');
    }
    
    return {
        valid: issues.length === 0,
        issues: issues
    };
}

// 在执行操作前检查状态
function safeImportFiles(fileList) {
    var validation = validateProjectState();
    
    if (!validation.valid) {
        return {
            success: false,
            error: '项目状态检查失败: ' + validation.issues.join(', ')
        };
    }
    
    return batchImportFiles(fileList);
}
```

## 代码质量保证

### 代码审查清单

#### 功能性检查
- [ ] 代码实现了所需的功能
- [ ] 边界条件得到正确处理
- [ ] 错误情况得到适当处理
- [ ] 返回值类型和格式正确

#### 代码质量检查
- [ ] 函数长度合理（< 50 行）
- [ ] 函数职责单一
- [ ] 变量命名清晰有意义
- [ ] 注释充分且准确
- [ ] 没有重复代码

#### 性能检查
- [ ] 没有不必要的循环或递归
- [ ] 异步操作使用合适的并发策略
- [ ] 内存使用合理，及时清理资源
- [ ] 没有阻塞 UI 的长时间操作

#### 安全检查
- [ ] 输入验证充分
- [ ] 没有硬编码的敏感信息
- [ ] 文件路径处理安全
- [ ] 错误信息不泄露敏感数据

### 测试规范

#### 单元测试
```javascript
// 测试工具函数
function testPathUtils() {
    var tests = [
        {
            input: '/Users/test/image.jpg',
            expected: 'jpg',
            description: '获取文件扩展名'
        },
        {
            input: '/Users/test/file.name.with.dots.png',
            expected: 'png',
            description: '处理包含多个点的文件名'
        }
    ];
    
    tests.forEach(function(test) {
        var result = getFileExtension(test.input);
        if (result !== test.expected) {
            throw new Error(
                test.description + ' 失败: 期望 ' + test.expected + 
                ', 实际 ' + result
            );
        }
    });
    
    console.log('路径工具函数测试通过');
}
```

#### 集成测试
```javascript
// 测试文件导入流程
function testFileImportFlow() {
    var testFile = '/path/to/test/image.jpg';
    
    // 1. 测试文件验证
    var validation = validateFilePath(testFile);
    if (!validation.valid) {
        throw new Error('文件验证失败: ' + validation.error);
    }
    
    // 2. 测试文件导入
    var importResult = importFileToProject(testFile, {
        importAs: 'footage',
        folder: 'Test Import'
    });
    
    if (!importResult.success) {
        throw new Error('文件导入失败: ' + importResult.error);
    }
    
    // 3. 验证导入结果
    var item = app.project.itemByID(importResult.item.id);
    if (!item) {
        throw new Error('导入的项目不存在');
    }
    
    console.log('文件导入流程测试通过');
}
```

### 性能监控

#### 执行时间监控
```javascript
// 性能监控装饰器
function measurePerformance(func, operationName) {
    return function() {
        var startTime = new Date().getTime();
        
        try {
            var result = func.apply(this, arguments);
            
            var endTime = new Date().getTime();
            var duration = endTime - startTime;
            
            // 记录性能数据
            logger.info('性能监控', {
                operation: operationName,
                duration: duration,
                status: 'success'
            });
            
            // 如果执行时间过长，发出警告
            if (duration > 5000) {
                logger.warn('操作执行时间过长', {
                    operation: operationName,
                    duration: duration
                });
            }
            
            return result;
            
        } catch (error) {
            var endTime = new Date().getTime();
            var duration = endTime - startTime;
            
            logger.error('操作执行失败', {
                operation: operationName,
                duration: duration,
                error: error.message
            });
            
            throw error;
        }
    };
}

// 使用示例
var monitoredImportFiles = measurePerformance(
    importMultipleFiles,
    '批量文件导入'
);
```

#### 内存使用监控
```javascript
// 内存使用监控
function monitorMemoryUsage(operationName) {
    var beforeMemory = app.memoryInUse;
    
    return function(result) {
        var afterMemory = app.memoryInUse;
        var memoryDelta = afterMemory - beforeMemory;
        
        logger.info('内存使用监控', {
            operation: operationName,
            beforeMemory: beforeMemory,
            afterMemory: afterMemory,
            memoryDelta: memoryDelta,
            memoryUsagePercent: (afterMemory / system.totalPhysicalMemory * 100).toFixed(2)
        });
        
        // 如果内存增长过多，发出警告
        if (memoryDelta > 100 * 1024 * 1024) { // 100MB
            logger.warn('内存使用增长过多', {
                operation: operationName,
                memoryDelta: memoryDelta
            });
        }
        
        return result;
    };
}
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始编码规范文档 | 开发团队 |

---

**相关文档**:
- [项目规范](./project-standards.md)
- [测试规范](./testing-standards.md)
- [CEP 开发指南](../development/cep-development-guide.md)