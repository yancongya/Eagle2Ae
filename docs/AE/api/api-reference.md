# AE 扩展 API 参考手册

## 概述

本文档提供 Eagle2Ae After Effects CEP 扩展的完整 API 参考，包括前端 JavaScript API、ExtendScript API 和通信接口。

**版本**: v2.1.1  
**更新时间**: 2024年1月  
**兼容性**: After Effects CC 2018+

## 前端 JavaScript API

### 主应用类 (AEExtension)

#### 构造函数

```javascript
/**
 * AE扩展主类构造函数
 * 负责初始化所有核心组件和服务
 */
class AEExtension {
    constructor()
```

**属性**:
- `csInterface`: CSInterface实例，用于与ExtendScript通信
- `connectionState`: 当前连接状态 (ConnectionState枚举)
- `pollingManager`: HTTP轮询管理器实例
- `connectionMonitor`: 连接质量监控器实例
- `logManager`: 日志管理器实例
- `settingsManager`: 设置管理器实例
- `fileHandler`: 文件处理器实例
- `soundPlayer`: 音效播放器实例

#### asyncInit()
异步初始化方法

```javascript
/**
 * 异步初始化应用程序
 * 分离同步和异步初始化任务，避免阻塞构造函数
 * @returns {Promise<void>} 初始化完成的 Promise
 * @throws {Error} 初始化失败时抛出错误
 */
async asyncInit()
```

**示例**:
```javascript
const aeExtension = new AEExtension();
// 构造函数会自动调用 asyncInit()
```

#### getConnectionState()
获取连接状态

```javascript
/**
 * 获取当前连接状态
 * @returns {ConnectionState} 连接状态枚举值
 */
getConnectionState()
```

**ConnectionState 枚举**:
```javascript
const ConnectionState = {
    DISCONNECTED: 'disconnected', // 已断开
    CONNECTING: 'connecting',     // 连接中
    CONNECTED: 'connected',       // 已连接
    ERROR: 'error'                // 连接错误
};
```

**示例**:
```javascript
const state = aeExtension.getConnectionState();
if (state === ConnectionState.CONNECTED) {
    console.log('已连接到Eagle插件');
}
```

### 轮询管理器类 (PollingManager)

用于HTTP兼容模式下的定期消息轮询。

#### 构造函数

```javascript
/**
 * 轮询管理器构造函数
 * @param {Function} callback - 每次轮询时要执行的回调函数
 * @param {number} [interval=500] - 轮询的时间间隔（毫秒）
 */
constructor(callback, interval = 500)
```

#### start()
启动轮询

```javascript
/**
 * 启动轮询
 */
start()
```

#### stop()
停止轮询

```javascript
/**
 * 停止轮询
 */
stop()
```

#### isRunning()
检查轮询状态

```javascript
/**
 * 检查轮询是否正在运行
 * @returns {boolean} 轮询状态
 */
isRunning()
```

**示例**:
```javascript
const pollingManager = new PollingManager(() => {
    // 轮询回调函数
    console.log('执行轮询任务');
}, 1000);

pollingManager.start();
console.log('轮询状态:', pollingManager.isRunning()); // true
```

### 连接监控器类 (ConnectionMonitor)

用于监控与Eagle插件的连接质量。

#### 构造函数

```javascript
/**
 * 连接监控器构造函数
 */
constructor()
```

#### recordPing()
记录成功的ping请求

```javascript
/**
 * 记录一次成功的ping请求
 * @param {number} startTime - 请求开始的时间戳
 * @returns {number} 本次请求的延迟时间
 */
recordPing(startTime)
```

#### recordFailure()
记录失败的连接尝试

```javascript
/**
 * 记录一次失败的连接尝试
 */
recordFailure()
```

#### getAveragePing()
获取平均延迟

```javascript
/**
 * 计算平均ping延迟
 * @returns {number} 平均延迟时间（毫秒）
 */
getAveragePing()
```

#### getSuccessRate()
获取连接成功率

```javascript
/**
 * 计算连接成功率
 * @returns {number} 成功率百分比（0-100）
 */
getSuccessRate()
```

**示例**:
```javascript
const monitor = new ConnectionMonitor();
const startTime = Date.now();

// 模拟成功的ping
const pingTime = monitor.recordPing(startTime);
console.log('本次延迟:', pingTime, 'ms');
console.log('平均延迟:', monitor.getAveragePing(), 'ms');
console.log('成功率:', monitor.getSuccessRate(), '%');
```

### WebSocket 客户端类 (Eagle2AeWebSocketClient)

#### 构造函数

```javascript
/**
 * WebSocket 客户端构造函数
 * @param {string} [url='ws://localhost:8080/ws'] - WebSocket 服务器地址
 * @param {AEExtension} [aeExtension=null] - AE扩展实例引用
 */
constructor(url = 'ws://localhost:8080/ws', aeExtension = null)
```

**属性**:
- `url`: WebSocket服务器地址
- `aeExtension`: AE扩展实例引用
- `connectionState`: 连接状态
- `reconnectAttempts`: 重连尝试次数
- `maxReconnectAttempts`: 最大重连次数 (默认5次)
- `reconnectDelay`: 重连延迟 (默认2秒)
- `heartbeatInterval`: 心跳间隔 (默认30秒)
- `stats`: 统计信息对象

**示例**:
```javascript
const client = new Eagle2AeWebSocketClient('ws://localhost:8080/ws', aeExtension);
```

#### connect()
建立 WebSocket 连接

```javascript
/**
 * 建立 WebSocket 连接
 * @returns {Promise<void>} 连接建立的 Promise
 * @throws {Error} 连接失败时抛出错误
 */
async connect()
```

#### send()
发送消息

```javascript
/**
 * 发送消息到服务器
 * @param {string} type - 消息类型
 * @param {Object} data - 消息数据
 * @param {Object} options - 发送选项
 * @returns {string} 消息 ID
 */
send(type, data, options = {})
```

**示例**:
```javascript
const messageId = client.send('file_transfer', {
    files: ['/path/to/file.jpg'],
    settings: {
        importMode: 'footage',
        createComposition: true
    }
});
```

#### on()
注册事件监听器

```javascript
/**
 * 注册事件监听器
 * @param {string} event - 事件名称
 * @param {Function} callback - 回调函数
 */
on(event, callback)
```

**事件类型**:
- `connected` - 连接建立
- `disconnected` - 连接断开
- `message` - 接收到消息
- `error` - 发生错误

**示例**:
```javascript
client.on('connected', () => {
    console.log('WebSocket 连接已建立');
});

client.on('message', (message) => {
    console.log('收到消息:', message);
});

client.on('error', (error) => {
    console.error('WebSocket 错误:', error);
});
```

### 文件处理器类 (FileHandler)

负责处理文件导入的核心逻辑，支持多种导入模式和文件类型。

#### 构造函数

```javascript
/**
 * 文件处理器构造函数
 * @param {SettingsManager} settingsManager - 设置管理器实例
 * @param {CSInterface} csInterface - CEP接口实例
 * @param {Function} logger - 日志记录函数
 */
constructor(settingsManager, csInterface, logger)
```

#### handleImportRequest()
处理文件导入请求

```javascript
/**
 * 处理文件导入请求
 * @param {Array<Object>} files - 文件信息数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} [customSettings=null] - 自定义设置
 * @returns {Promise<Object>} 导入结果
 */
async handleImportRequest(files, projectInfo, customSettings = null)
```

#### checkCompositionStatus()
检查合成状态

```javascript
/**
 * 检查当前合成状态
 * @returns {Promise<Object>} 合成检查结果
 */
async checkCompositionStatus()
```

#### setQuietMode()
设置静默模式

```javascript
/**
 * 设置静默模式（用于拖拽导入）
 * @param {boolean} quiet - 是否启用静默模式
 */
setQuietMode(quiet)
```

**导入模式常量**:
```javascript
const ImportModes = {
    DIRECT: 'direct',                    // 直接导入
    PROJECT_ADJACENT: 'project_adjacent', // 项目旁复制
    CUSTOM_FOLDER: 'custom_folder'       // 自定义文件夹
};
```

**参数说明**:
```javascript
// files 数组元素结构
{
    path: 'string',           // 文件绝对路径
    name: 'string',           // 文件名
    size: 'number',           // 文件大小
    type: 'string',           // 文件类型
    tags: 'Array<string>',    // 文件标签
    isTemporary: 'boolean',   // 是否为临时文件
    isClipboardImport: 'boolean' // 是否来自剪贴板
}

// projectInfo 对象结构
{
    projectPath: 'string',    // 项目文件路径
    projectName: 'string',    // 项目名称
    activeComp: 'Object'      // 活动合成信息
}

// settings 对象结构
{
    mode: 'string',                    // 导入模式 (ImportModes)
    addToComposition: 'boolean',       // 是否添加到合成
    projectAdjacentFolder: 'string',   // 项目旁文件夹名称
    customFolderPath: 'string',        // 自定义文件夹路径
    fileNameProcessing: 'Object'       // 文件名处理选项
}
```

**返回值**:
```javascript
{
    success: 'boolean',       // 是否成功
    importedCount: 'number',  // 成功导入数量
    processedFiles: 'Array',  // 处理后的文件列表
    targetComp: 'string',     // 目标合成名称
    error: 'string'           // 错误信息（如果失败）
}
```

**示例**:
```javascript
const fileHandler = new FileHandler(settingsManager, csInterface, logger);

const files = [
    {
        path: '/Users/username/Pictures/image1.jpg',
        name: 'image1.jpg',
        size: 1024000,
        type: 'image/jpeg'
    }
];

const settings = {
    importMode: 'footage',
    createComposition: true,
    organizeFolders: true,
    targetFolder: 'Eagle Import'
};

try {
    const result = await FileManager.importFiles(files, settings);
    console.log(`成功导入 ${result.imported} 个文件`);
} catch (error) {
    console.error('导入失败:', error);
}
```

### 配置管理器类 (ConfigManager)

#### get()
获取配置值

```javascript
/**
 * 获取配置值
 * @param {string} key - 配置键名 (支持点号分隔的嵌套键)
 * @param {*} defaultValue - 默认值
 * @returns {*} 配置值
 */
get(key, defaultValue = null)
```

#### set()
设置配置值

```javascript
/**
 * 设置配置值
 * @param {string} key - 配置键名
 * @param {*} value - 配置值
 * @returns {Promise<boolean>} 设置是否成功
 */
async set(key, value)
```

**示例**:
```javascript
// 获取配置
const serverUrl = ConfigManager.get('server.url', 'ws://localhost:8080');
const importMode = ConfigManager.get('import.mode', 'footage');

// 设置配置
await ConfigManager.set('server.url', 'ws://localhost:8081');
await ConfigManager.set('import.createComposition', true);
```

### 日志管理器类 (LogManager)

#### log()
记录日志

```javascript
/**
 * 记录日志
 * @param {string} level - 日志级别 ('debug'|'info'|'warn'|'error')
 * @param {string} message - 日志消息
 * @param {Object} context - 上下文信息
 */
log(level, message, context = {})
```

#### debug(), info(), warn(), error()
便捷日志方法

```javascript
/**
 * 记录调试日志
 * @param {string} message - 日志消息
 * @param {Object} context - 上下文信息
 */
debug(message, context = {})
info(message, context = {})
warn(message, context = {})
error(message, context = {})
```

**示例**:
```javascript
LogManager.info('WebSocket 连接建立', { url: 'ws://localhost:8080' });
LogManager.warn('文件导入部分失败', { failed: 2, total: 10 });
LogManager.error('连接失败', { error: error.message });
```

## ExtendScript API

### 主机脚本接口 (hostscript.jsx)

#### importFileToProject()
导入文件到项目

```javascript
/**
 * 导入文件到 After Effects 项目
 * @param {string} filePath - 文件路径
 * @param {Object} options - 导入选项
 * @returns {Object} 导入结果
 */
function importFileToProject(filePath, options)
```

**参数说明**:
```javascript
// options 对象结构
{
    importAs: 'footage|composition',    // 导入类型
    sequence: 'boolean',               // 是否作为序列
    forceAlphabetical: 'boolean',      // 强制字母排序
    folder: 'string'                   // 目标文件夹名称
}
```

**返回值**:
```javascript
{
    success: 'boolean',     // 是否成功
    item: 'object',         // 导入的项目对象
    error: 'string'         // 错误信息 (如果失败)
}
```

**示例**:
```javascript
var result = importFileToProject('/path/to/image.jpg', {
    importAs: 'footage',
    folder: 'Eagle Import'
});

if (result.success) {
    alert('文件导入成功: ' + result.item.name);
} else {
    alert('导入失败: ' + result.error);
}
```

#### createCompositionFromItems()
从项目素材创建合成

```javascript
/**
 * 从项目素材创建合成
 * @param {Array} items - 项目素材数组
 * @param {Object} compSettings - 合成设置
 * @returns {Object} 创建结果
 */
function createCompositionFromItems(items, compSettings)
```

**参数说明**:
```javascript
// compSettings 对象结构
{
    name: 'string',         // 合成名称
    width: 'number',        // 宽度
    height: 'number',       // 高度
    duration: 'number',     // 持续时间 (秒)
    frameRate: 'number'     // 帧率
}
```

#### organizeProjectItems()
组织项目素材

```javascript
/**
 * 组织项目素材到文件夹
 * @param {Array} items - 项目素材数组
 * @param {string} folderName - 文件夹名称
 * @returns {Object} 组织结果
 */
function organizeProjectItems(items, folderName)
```

#### getProjectInfo()
获取项目信息

```javascript
/**
 * 获取当前项目信息
 * @returns {Object} 项目信息
 */
function getProjectInfo()
```

**返回值**:
```javascript
{
    name: 'string',         // 项目名称
    path: 'string',         // 项目路径
    itemCount: 'number',    // 素材数量
    compCount: 'number',    // 合成数量
    modified: 'boolean'     // 是否已修改
}
```

### CSInterface 桥接

#### evalScript()
执行 ExtendScript 代码

```javascript
/**
 * 执行 ExtendScript 代码
 * @param {string} script - 要执行的脚本代码
 * @param {Function} callback - 回调函数
 */
csInterface.evalScript(script, callback)
```

**示例**:
```javascript
// 异步执行 ExtendScript
function executeHostScript(functionName, params) {
    return new Promise((resolve, reject) => {
        const script = `${functionName}(${JSON.stringify(params)})`;
        
        csInterface.evalScript(script, (result) => {
            try {
                const parsed = JSON.parse(result);
                if (parsed.success) {
                    resolve(parsed);
                } else {
                    reject(new Error(parsed.error));
                }
            } catch (error) {
                reject(error);
            }
        });
    });
}

// 使用示例
try {
    const result = await executeHostScript('importFileToProject', {
        filePath: '/path/to/file.jpg',
        options: { importAs: 'footage' }
    });
    console.log('导入成功:', result);
} catch (error) {
    console.error('导入失败:', error);
}
```

## 通信协议 API

### 消息类型

#### 连接管理消息

**connection_request** - 连接请求
```javascript
{
    type: 'connection_request',
    data: {
        clientType: 'ae_extension',
        version: '1.0.0',
        capabilities: ['file_transfer', 'status_sync']
    }
}
```

**connection_response** - 连接响应
```javascript
{
    type: 'connection_response',
    data: {
        status: 'accepted',
        serverVersion: '1.0.0',
        supportedCapabilities: ['file_transfer', 'status_sync']
    }
}
```

#### 文件传输消息

**file_transfer** - 文件传输请求
```javascript
{
    type: 'file_transfer',
    data: {
        files: [
            {
                path: '/path/to/file.jpg',
                name: 'file.jpg',
                size: 1024000,
                type: 'image/jpeg',
                metadata: {
                    tags: ['nature', 'landscape'],
                    rating: 5
                }
            }
        ],
        settings: {
            importMode: 'footage',
            createComposition: true,
            organizeFolders: true
        }
    }
}
```

**file_transfer_response** - 文件传输响应
```javascript
{
    type: 'file_transfer_response',
    replyTo: 'original_message_id',
    data: {
        status: 'success',
        imported: 1,
        failed: 0,
        details: {
            successItems: [
                {
                    originalPath: '/path/to/file.jpg',
                    projectItemId: 123,
                    name: 'file.jpg',
                    folder: 'Eagle Import'
                }
            ],
            failedItems: []
        }
    }
}
```

#### 状态同步消息

**status_query** - 状态查询
```javascript
{
    type: 'status_query',
    data: {
        queryType: 'project'
    }
}
```

**status_response** - 状态响应
```javascript
{
    type: 'status_response',
    data: {
        project: {
            name: 'My Project',
            itemCount: 25,
            activeComposition: 'Main Comp'
        }
    }
}
```

### 错误处理

#### 错误消息格式
```javascript
{
    type: 'error',
    data: {
        code: 'FILE_NOT_FOUND',
        message: '文件不存在',
        details: {
            filePath: '/path/to/missing/file.jpg'
        },
        severity: 'error',
        recoverable: false
    }
}
```

#### 常见错误代码
- `CONNECTION_FAILED` - 连接失败
- `INVALID_MESSAGE_FORMAT` - 消息格式无效
- `FILE_NOT_FOUND` - 文件不存在
- `IMPORT_FAILED` - 导入失败
- `PERMISSION_DENIED` - 权限被拒绝
- `INSUFFICIENT_MEMORY` - 内存不足

## 工具函数

### 路径处理

#### normalizePath()
标准化文件路径

```javascript
/**
 * 标准化文件路径
 * @param {string} path - 原始路径
 * @returns {string} 标准化后的路径
 */
function normalizePath(path)
```

#### isValidPath()
验证路径有效性

```javascript
/**
 * 验证路径是否有效
 * @param {string} path - 文件路径
 * @returns {boolean} 是否有效
 */
function isValidPath(path)
```

### 文件类型检测

#### getFileType()
获取文件类型

```javascript
/**
 * 根据文件扩展名获取文件类型
 * @param {string} extension - 文件扩展名
 * @returns {string} 文件类型 ('image'|'video'|'audio'|'other')
 */
function getFileType(extension)
```

#### isSupportedFormat()
检查是否为支持的格式

```javascript
/**
 * 检查文件格式是否被 After Effects 支持
 * @param {string} extension - 文件扩展名
 * @returns {boolean} 是否支持
 */
function isSupportedFormat(extension)
```

### 数据验证

#### validateMessage()
验证消息格式

```javascript
/**
 * 验证 WebSocket 消息格式
 * @param {Object} message - 消息对象
 * @returns {boolean} 是否有效
 * @throws {Error} 验证失败时抛出错误
 */
function validateMessage(message)
```

#### validateFileInfo()
验证文件信息

```javascript
/**
 * 验证文件信息对象
 * @param {Object} fileInfo - 文件信息
 * @returns {boolean} 是否有效
 */
function validateFileInfo(fileInfo)
```

## 事件系统

### 事件类型

#### 应用事件
- `app:initialized` - 应用初始化完成
- `app:destroyed` - 应用销毁
- `app:error` - 应用错误

#### 连接事件
- `connection:connecting` - 正在连接
- `connection:connected` - 连接建立
- `connection:disconnected` - 连接断开
- `connection:error` - 连接错误

#### 文件事件
- `file:import:start` - 开始导入文件
- `file:import:progress` - 导入进度更新
- `file:import:complete` - 导入完成
- `file:import:error` - 导入错误

### 事件监听

```javascript
// 监听应用事件
App.on('initialized', () => {
    console.log('应用初始化完成');
});

// 监听连接事件
WebSocketClient.on('connected', () => {
    console.log('WebSocket 连接建立');
});

// 监听文件导入事件
FileManager.on('import:progress', (progress) => {
    console.log(`导入进度: ${progress.completed}/${progress.total}`);
});
```

## 配置选项

### 应用配置

```javascript
{
    // 服务器配置
    server: {
        url: 'ws://localhost:8080',
        reconnectInterval: 3000,
        maxReconnectAttempts: 5,
        heartbeatInterval: 30000
    },
    
    // 导入配置
    import: {
        mode: 'footage',           // 'footage' | 'composition'
        createComposition: true,
        organizeFolders: true,
        targetFolder: 'Eagle Import',
        batchSize: 10
    },
    
    // UI 配置
    ui: {
        theme: 'auto',            // 'light' | 'dark' | 'auto'
        language: 'zh-CN',
        showNotifications: true,
        showProgress: true
    },
    
    // 日志配置
    logging: {
        level: 'info',            // 'debug' | 'info' | 'warn' | 'error'
        maxLogSize: 10 * 1024 * 1024,  // 10MB
        maxLogFiles: 5
    }
}
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始 API 参考文档 | 开发团队 |

---

**相关文档**:
- [JSX 脚本 API](./jsx-scripts.md)
- [通信 API](./communication-api.md)
- [CEP 开发指南](../development/cep-development-guide.md)