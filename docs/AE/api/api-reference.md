# AE 扩展 API 参考手册

## 概述

本文档提供 Eagle2Ae After Effects CEP 扩展的完整 API 参考，包括前端 JavaScript API、ExtendScript API 和通信接口。

**版本**: v2.4.0  
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
- `projectStatusChecker`: 项目状态检测器实例 *(v2.4.0新增)*

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

**ConnectionState 枚举**
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

### 项目状态检测器类 (ProjectStatusChecker) *(v2.4.0新增)*

负责检测After Effects项目状态、Eagle连接状态等，确保操作的可行性和安全性。

#### 构造函数

```javascript
/**
 * 项目状态检测器构造函数
 * 负责检测AE项目状态、Eagle连接状态等
 */
class ProjectStatusChecker {
    constructor()
```

**属性**:
- `cache`: Map实例，用于缓存检测结果
- `cacheTimeout`: 缓存超时时间（默认5000ms）
- `isChecking`: 是否正在检测中
- `lastCheckTime`: 上次检测时间戳

#### checkProjectStatus()
执行完整的项目状态检测

```javascript
/**
 * 执行完整的项目状态检测
 * @returns {Promise<Object>} 检测结果对象
 * @throws {Error} 检测失败时抛出错误
 */
async checkProjectStatus()
```

**返回值结构**
```javascript
{
    timestamp: 'number',        // 检测时间戳
    hasErrors: 'boolean',       // 是否有错误
    errors: 'Array<Object>',    // 错误列表
    warnings: 'Array<Object>', // 警告列表
    info: {                     // 详细信息
        environment: 'Object',  // 环境信息
        aeConnection: 'Object', // AE连接状态
        project: 'Object',      // 项目状态
        composition: 'Object',  // 合成状态
        eagle: 'Object'         // Eagle连接状态
    },
    recommendations: 'Array<Object>' // 操作建议
}
```

**示例**:
```javascript
const checker = new ProjectStatusChecker();
const result = await checker.checkProjectStatus();

if (result.hasErrors) {
    console.error('检测到错误:', result.errors);
    // 显示错误对话框
    await showStatusErrorDialog(result);
} else {
    console.log('状态检查通过，可以继续操作');
}
```

#### checkEnvironment()
检测运行环境

```javascript
/**
 * 检测运行环境
 * @returns {Object} 环境检测结果
 */
checkEnvironment()
```

**返回值**
```javascript
{
    isCEP: 'boolean',           // 是否为CEP环境
    isDemo: 'boolean',          // 是否为演示模式
    hasCSInterface: 'boolean',  // 是否有CSInterface
    aeVersion: 'string',        // AE版本号
    cepVersion: 'string'        // CEP版本号
}
```

#### checkAEConnection()
检测After Effects连接状态

```javascript
/**
 * 检测After Effects连接状态
 * @returns {Promise<Object>} AE连接检测结果
 */
async checkAEConnection()
```

**返回值**
```javascript
{
    connected: 'boolean',       // 是否已连接
    responsive: 'boolean',      // 是否响应
    version: 'string',          // AE版本
    error: 'string',            // 错误信息
    responseTime: 'number'      // 响应时间（毫秒）
}
```

#### checkProjectState()
检测AE项目状态

```javascript
/**
 * 检测AE项目状态
 * @returns {Promise<Object>} 项目状态检测结果
 */
async checkProjectState()
```

**返回值**
```javascript
{
    hasProject: 'boolean',      // 是否有项目
    projectName: 'string',      // 项目名称
    projectPath: 'string',      // 项目路径
    isSaved: 'boolean',         // 是否已保存
    itemCount: 'number',        // 项目素材数量
    error: 'string'             // 错误信息
}
```

#### checkCompositionState()
检测合成状态

```javascript
/**
 * 检测合成状态
 * @returns {Promise<Object>} 合成状态检测结果
 */
async checkCompositionState()
```

**返回值**
```javascript
{
    hasComposition: 'boolean',  // 是否有活动合成
    activeComp: 'Object',       // 活动合成信息
    compCount: 'number',        // 合成总数
    layerCount: 'number',       // 图层数量
    error: 'string'             // 错误信息
}
```

#### checkEagleConnection()
检测Eagle应用连接状态

```javascript
/**
 * 检测Eagle应用连接状态
 * @returns {Promise<Object>} Eagle连接检测结果
 */
async checkEagleConnection()
```

**返回值**
```javascript
{
    connected: 'boolean',       // 是否已连接
    version: 'string',          // Eagle版本
    apiEndpoint: 'string',      // API端点
    responseTime: 'number',     // 响应时间
    error: 'string'             // 错误信息
}
```

#### executeScript()
执行ExtendScript脚本

```javascript
/**
 * 执行ExtendScript脚本
 * @param {string} script - 要执行的脚本代码
 * @param {number} [timeout=3000] - 超时时间（毫秒）
 * @returns {Promise<string>} 脚本执行结果
 */
executeScript(script, timeout = 3000)
```

#### cacheResult()
缓存检测结果

```javascript
/**
 * 缓存检测结果
 * @param {string} key - 缓存键
 * @param {Object} result - 检测结果
 */
cacheResult(key, result)
```

#### getCachedResult()
获取缓存结果

```javascript
/**
 * 获取缓存结果
 * @param {string} key - 缓存键
 * @returns {Object|null} 缓存的结果或null
 */
getCachedResult(key)
```

### 智能对话框系统 *(v2.4.0新增)*

#### showSmartDialog()
显示智能对话框

```javascript
/**
 * 显示智能对话框，根据环境自动选择最佳实现
 * @param {string} type - 对话框类型 ('info'|'warning'|'error'|'confirm')
 * @param {string} title - 对话框标题
 * @param {string} message - 对话框消息
 * @param {Array<string>} buttons - 按钮文本数组
 * @param {Object} [options={}] - 额外选项
 * @returns {Promise<string>} 用户选择的按钮文本
 */
async function showSmartDialog(type, title, message, buttons, options = {})
```

**参数说明**:
- `type`: 对话框类型，影响图标和样式
- `title`: 对话框标题
- `message`: 对话框消息内容
- `buttons`: 按钮文本数组，如 ['确定', '取消']
- `options`: 额外选项
  - `defaultButton`: 默认按钮索引
  - `cancelButton`: 取消按钮索引
  - `modal`: 是否为模态对话框

**示例**:
```javascript
// 显示确认对话框
const result = await showSmartDialog(
    'confirm',
    '确认导入',
    '是否要导入这些文件？',
    ['确定', '取消']
);

if (result === '确定') {
    // 用户确认，继续操作
    await importFiles();
}
```

#### showStatusErrorDialog()
显示状态错误对话框

```javascript
/**
 * 显示状态错误对话框
 * @param {Object} statusResult - 状态检测结果
 * @returns {Promise<string>} 用户选择
 */
async function showStatusErrorDialog(statusResult)
```

#### showStatusSummaryDialog()
显示状态总结对话框

```javascript
/**
 * 显示状态总结对话框
 * @param {Object} statusResult - 状态检测结果
 * @returns {Promise<string>} 用户选择
 */
async function showStatusSummaryDialog(statusResult)
```

### 虚拟弹窗系统 *(v2.4.0新增)*

用于演示模式下的虚拟弹窗显示。

#### VirtualDialogEngine
虚拟弹窗引擎

```javascript
/**
 * 虚拟弹窗引擎类
 * 在演示模式下提供虚拟的弹窗体验
 */
class VirtualDialogEngine {
    constructor()
```

#### showVirtualDialog()
显示虚拟弹窗

```javascript
/**
 * 显示虚拟弹窗
 * @param {string} type - 弹窗类型
 * @param {string} title - 弹窗标题
 * @param {string} message - 弹窗消息
 * @param {Array<string>} buttons - 按钮列表
 * @returns {Promise<string>} 模拟的用户选择
 */
async showVirtualDialog(type, title, message, buttons)
```

#### simulateUserChoice()
模拟用户选择

```javascript
/**
 * 模拟用户选择
 * @param {Array<string>} buttons - 可选按钮
 * @param {Object} preferences - 选择偏好
 * @returns {string} 模拟的选择结果
 */
simulateUserChoice(buttons, preferences = {})
```

### 状态监控器类 (StatusMonitor) *(v2.4.0新增)*

#### 构造函数

```javascript
/**
 * 状态监控器构造函数
 * 负责定期监控项目状态变化
 */
class StatusMonitor {
    constructor()
```

#### startMonitoring()
开始状态监控

```javascript
/**
 * 开始状态监控
 * @param {number} [interval=30000] - 监控间隔（毫秒）
 */
startMonitoring(interval = 30000)
```

#### stopMonitoring()
停止状态监控

```javascript
/**
 * 停止状态监控
 */
stopMonitoring()
```

#### handleStatusChange()
处理状态变化

```javascript
/**
 * 处理状态变化
 * @param {Object} result - 状态检测结果
 */
handleStatusChange(result)
```

### 批量状态检测器 (BatchStatusChecker) *(v2.4.0新增)*

用于优化多个并发状态检测请求。

#### 构造函数

```javascript
/**
 * 批量状态检测器构造函数
 * 将多个检测请求合并为一次检测，提高性能
 */
class BatchStatusChecker {
    constructor()
```

#### requestStatusCheck()
请求状态检查

```javascript
/**
 * 请求状态检查
 * @returns {Promise<Object>} 状态检测结果
 */
requestStatusCheck()
```

#### processBatch()
处理批量请求

```javascript
/**
 * 处理批量请求
 * @private
 */
async processBatch()
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
 * @returns {number} 成功率百分比 (0-100)
 */
getSuccessRate()
```

**示例**:
```javascript
const monitor = new ConnectionMonitor();

// 记录ping请求
const startTime = Date.now();

// 模拟成功的ping
const pingTime = monitor.recordPing(startTime);
console.log('本次延迟:', pingTime, 'ms');
console.log('平均延迟:', monitor.getAveragePing(), 'ms');
console.log('成功率:', monitor.getSuccessRate(), '%');
```

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

## 事件系统 *(v2.4.0新增)*

### EventEmitter 类

提供事件发布订阅机制。

#### 构造函数

```javascript
/**
 * 事件发射器构造函数
 */
class EventEmitter {
    constructor()
}
```

#### on()
注册事件监听器

```javascript
/**
 * 注册事件监听器
 * @param {string} event - 事件名称
 * @param {Function} listener - 监听器函数
 */
on(event, listener)
```

#### off()
移除事件监听器

```javascript
/**
 * 移除事件监听器
 * @param {string} event - 事件名称
 * @param {Function} listener - 监听器函数
 */
off(event, listener)
```

#### emit()
触发事件

```javascript
/**
 * 触发事件
 * @param {string} event - 事件名称
 * @param {...any} args - 事件参数
 */
emit(event, ...args)
```

#### once()
注册一次性事件监听器

```javascript
/**
 * 注册一次性事件监听器
 * @param {string} event - 事件名称
 * @param {Function} listener - 监听器函数
 */
once(event, listener)
```

### 系统事件

#### 连接事件

```javascript
// WebSocket连接建立
app.on('websocket:connected', (connection) => {
    console.log('WebSocket连接已建立');
});

// WebSocket连接断开
app.on('websocket:disconnected', (reason) => {
    console.log('WebSocket连接已断开:', reason);
});

// Eagle连接状态变化
app.on('eagle:connection_changed', (connected) => {
    console.log('Eagle连接状态:', connected ? '已连接' : '已断开');
});
```

#### 文件操作事件

```javascript
// 文件导入开始
app.on('file:import_start', (files) => {
    console.log('开始导入文件:', files.length);
});

// 文件导入完成
app.on('file:import_complete', (result) => {
    console.log('文件导入完成:', result);
});

// 文件导入失败
app.on('file:import_error', (error) => {
    console.error('文件导入失败:', error);
});
```

#### 状态检测事件

```javascript
// 状态检测开始
app.on('status:check_start', () => {
    console.log('开始状态检测');
});

// 状态检测完成
app.on('status:check_complete', (result) => {
    console.log('状态检测完成:', result);
});

// 状态变化
app.on('status:changed', (changes) => {
    console.log('状态发生变化:', changes);
});
```

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

## 日志系统增强 *(v2.4.0增强)*

### LogManager 类增强

#### setLevel()
设置日志级别

```javascript
/**
 * 设置日志级别
 * @param {string} level - 日志级别 ('debug', 'info', 'warn', 'error')
 */
setLevel(level)
```

#### createLogger()
创建子日志器

```javascript
/**
 * 创建子日志器
 * @param {string} name - 日志器名称
 * @returns {Logger} 子日志器实例
 */
createLogger(name)
```

#### enableFileLogging()
启用文件日志

```javascript
/**
 * 启用文件日志
 * @param {string} filePath - 日志文件路径
 * @param {Object} [options={}] - 选项
 */
enableFileLogging(filePath, options = {})
```

### 结构化日志

```javascript
// 使用结构化日志记录
logger.info('文件导入完成', {
    files: fileList.length,
    duration: Date.now() - startTime,
    success: true,
    composition: compName
});

// 记录性能指标
logger.perf('status_check', {
    duration: 1250,
    cacheHit: false,
    errors: 0
});

// 记录用户操作
logger.user('button_click', {
    button: 'import_files',
    context: 'main_panel',
    timestamp: Date.now()
});
```

## 性能监控 *(v2.4.0新增)*

### PerformanceMonitor 类

性能监控器，用于跟踪关键操作的性能指标。

#### 构造函数

```javascript
/**
 * 性能监控器构造函数
 */
class PerformanceMonitor {
    constructor()
}
```

#### startTimer()
开始计时

```javascript
/**
 * 开始计时
 * @param {string} name - 计时器名称
 */
startTimer(name)
```

#### endTimer()
结束计时

```javascript
/**
 * 结束计时
 * @param {string} name - 计时器名称
 * @returns {number} 耗时（毫秒）
 */
endTimer(name)
```

#### recordMetric()
记录性能指标

```javascript
/**
 * 记录性能指标
 * @param {string} name - 指标名称
 * @param {number} value - 指标值
 * @param {string} [unit='ms'] - 单位
 */
recordMetric(name, value, unit = 'ms')
```

#### getReport()
获取性能报告

```javascript
/**
 * 获取性能报告
 * @returns {Object} 性能报告
 */
getReport()
```

**使用示例**:
```javascript
const perfMonitor = new PerformanceMonitor();

// 监控文件导入性能
perfMonitor.startTimer('file_import');
await importFiles();
const duration = perfMonitor.endTimer('file_import');

// 记录内存使用
perfMonitor.recordMetric('memory_usage', process.memoryUsage().heapUsed, 'bytes');

// 获取报告
const report = perfMonitor.getReport();
console.log('性能报告:', report);
```

<File before failed
```markdown
# AE 扩展 API 参考手册

## 概述

本文档提供 Eagle2Ae After Effects CEP 扩展的完整 API 参考，包括前端 JavaScript API、ExtendScript API 和通信接口。

**版本**: v2.4.0  
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
- `projectStatusChecker`: 项目状态检测器实例 *(v2.4.0新增)*

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

### 项目状态检测器类 (ProjectStatusChecker) *(v2.4.0新增)*

负责检测After Effects项目状态、Eagle连接状态等，确保操作的可行性和安全性。

#### 构造函数

```javascript
/**
 * 项目状态检测器构造函数
 * 负责检测AE项目状态、Eagle连接状态等
 */
class ProjectStatusChecker {
    constructor()
```

**属性**:
- `cache`: Map实例，用于缓存检测结果
- `cacheTimeout`: 缓存超时时间（默认5000ms）
- `isChecking`: 是否正在检测中
- `lastCheckTime`: 上次检测时间戳

#### checkProjectStatus()
执行完整的项目状态检测

```javascript
/**
 * 执行完整的项目状态检测
 * @returns {Promise<Object>} 检测结果对象
 * @throws {Error} 检测失败时抛出错误
 */
async checkProjectStatus()
```

**返回值结构**:
```javascript
{
    timestamp: 'number',        // 检测时间戳
    hasErrors: 'boolean',       // 是否有错误
    errors: 'Array<Object>',    // 错误列表
    warnings: 'Array<Object>', // 警告列表
    info: {                     // 详细信息
        environment: 'Object',  // 环境信息
        aeConnection: 'Object', // AE连接状态
        project: 'Object',      // 项目状态
        composition: 'Object',  // 合成状态
        eagle: 'Object'         // Eagle连接状态
    },
    recommendations: 'Array<Object>' // 操作建议
}
```

**示例**:
```javascript
const checker = new ProjectStatusChecker();
const result = await checker.checkProjectStatus();

if (result.hasErrors) {
    console.error('检测到错误:', result.errors);
    // 显示错误对话框
    await showStatusErrorDialog(result);
} else {
    console.log('状态检查通过，可以继续操作');
}
```

#### checkEnvironment()
检测运行环境

```javascript
/**
 * 检测运行环境
 * @returns {Object} 环境检测结果
 */
checkEnvironment()
```

**返回值**:
```javascript
{
    isCEP: 'boolean',           // 是否为CEP环境
    isDemo: 'boolean',          // 是否为演示模式
    hasCSInterface: 'boolean',  // 是否有CSInterface
    aeVersion: 'string',        // AE版本号
    cepVersion: 'string'        // CEP版本号
}
```

#### checkAEConnection()
检测After Effects连接状态

```javascript
/**
 * 检测After Effects连接状态
 * @returns {Promise<Object>} AE连接检测结果
 */
async checkAEConnection()
```

**返回值**:
```javascript
{
    connected: 'boolean',       // 是否已连接
    responsive: 'boolean',      // 是否响应
    version: 'string',          // AE版本
    error: 'string',            // 错误信息
    responseTime: 'number'      // 响应时间（毫秒）
}
```

#### checkProjectState()
检测AE项目状态

```javascript
/**
 * 检测AE项目状态
 * @returns {Promise<Object>} 项目状态检测结果
 */
async checkProjectState()
```

**返回值**:
```javascript
{
    hasProject: 'boolean',      // 是否有项目
    projectName: 'string',      // 项目名称
    projectPath: 'string',      // 项目路径
    isSaved: 'boolean',         // 是否已保存
    itemCount: 'number',        // 项目素材数量
    error: 'string'             // 错误信息
}
```

#### checkCompositionState()
检测合成状态

```javascript
/**
 * 检测合成状态
 * @returns {Promise<Object>} 合成状态检测结果
 */
async checkCompositionState()
```

**返回值**:
```javascript
{
    hasComposition: 'boolean',  // 是否有活动合成
    activeComp: 'Object',       // 活动合成信息
    compCount: 'number',        // 合成总数
    layerCount: 'number',       // 图层数量
    error: 'string'             // 错误信息
}
```

#### checkEagleConnection()
检测Eagle应用连接状态

```javascript
/**
 * 检测Eagle应用连接状态
 * @returns {Promise<Object>} Eagle连接检测结果
 */
async checkEagleConnection()
```

**返回值**:
```javascript
{
    connected: 'boolean',       // 是否已连接
    version: 'string',          // Eagle版本
    apiEndpoint: 'string',      // API端点
    responseTime: 'number',     // 响应时间
    error: 'string'             // 错误信息
}
```

#### executeScript()
执行ExtendScript脚本

```javascript
/**
 * 执行ExtendScript脚本
 * @param {string} script - 要执行的脚本代码
 * @param {number} [timeout=3000] - 超时时间（毫秒）
 * @returns {Promise<string>} 脚本执行结果
 */
executeScript(script, timeout = 3000)
```

#### cacheResult()
缓存检测结果

```javascript
/**
 * 缓存检测结果
 * @param {string} key - 缓存键
 * @param {Object} result - 检测结果
 */
cacheResult(key, result)
```

#### getCachedResult()
获取缓存结果

```javascript
/**
 * 获取缓存结果
 * @param {string} key - 缓存键
 * @returns {Object|null} 缓存的结果或null
 */
getCachedResult(key)
```

### 智能对话框系统 *(v2.4.0新增)*

#### showSmartDialog()
显示智能对话框

```javascript
/**
 * 显示智能对话框，根据环境自动选择最佳实现
 * @param {string} type - 对话框类型 ('info'|'warning'|'error'|'confirm')
 * @param {string} title - 对话框标题
 * @param {string} message - 对话框消息
 * @param {Array<string>} buttons - 按钮文本数组
 * @param {Object} [options={}] - 额外选项
 * @returns {Promise<string>} 用户选择的按钮文本
 */
async function showSmartDialog(type, title, message, buttons, options = {})
```

**参数说明**:
- `type`: 对话框类型，影响图标和样式
- `title`: 对话框标题
- `message`: 对话框消息内容
- `buttons`: 按钮文本数组，如 ['确定', '取消']
- `options`: 额外选项
  - `defaultButton`: 默认按钮索引
  - `cancelButton`: 取消按钮索引
  - `modal`: 是否为模态对话框

**示例**:
```javascript
// 显示确认对话框
const result = await showSmartDialog(
    'confirm',
    '确认导入',
    '是否要导入这些文件？',
    ['确定', '取消']
);

if (result === '确定') {
    // 用户确认，继续操作
    await importFiles();
}
```

#### showStatusErrorDialog()
显示状态错误对话框

```javascript
/**
 * 显示状态错误对话框
 * @param {Object} statusResult - 状态检测结果
 * @returns {Promise<string>} 用户选择
 */
async function showStatusErrorDialog(statusResult)
```

#### showStatusSummaryDialog()
显示状态总结对话框

```javascript
/**
 * 显示状态总结对话框
 * @param {Object} statusResult - 状态检测结果
 * @returns {Promise<string>} 用户选择
 */
async function showStatusSummaryDialog(statusResult)
```

### 虚拟弹窗系统 *(v2.4.0新增)*

用于演示模式下的虚拟弹窗显示。

#### VirtualDialogEngine
虚拟弹窗引擎

```javascript
/**
 * 虚拟弹窗引擎类
 * 在演示模式下提供虚拟的弹窗体验
 */
class VirtualDialogEngine {
    constructor()
```

#### showVirtualDialog()
显示虚拟弹窗

```javascript
/**
 * 显示虚拟弹窗
 * @param {string} type - 弹窗类型
 * @param {string} title - 弹窗标题
 * @param {string} message - 弹窗消息
 * @param {Array<string>} buttons - 按钮列表
 * @returns {Promise<string>} 模拟的用户选择
 */
async showVirtualDialog(type, title, message, buttons)
```

#### simulateUserChoice()
模拟用户选择

```javascript
/**
 * 模拟用户选择
 * @param {Array<string>} buttons - 可选按钮
 * @param {Object} preferences - 选择偏好
 * @returns {string} 模拟的选择结果
 */
simulateUserChoice(buttons, preferences = {})
```

### 状态监控器类 (StatusMonitor) *(v2.4.0新增)*

#### 构造函数

```javascript
/**
 * 状态监控器构造函数
 * 负责定期监控项目状态变化
 */
class StatusMonitor {
    constructor()
```

#### startMonitoring()
开始状态监控

```javascript
/**
 * 开始状态监控
 * @param {number} [interval=30000] - 监控间隔（毫秒）
 */
startMonitoring(interval = 30000)
```

#### stopMonitoring()
停止状态监控

```javascript
/**
 * 停止状态监控
 */
stopMonitoring()
```

#### handleStatusChange()
处理状态变化

```javascript
/**
 * 处理状态变化
 * @param {Object} result - 状态检测结果
 */
handleStatusChange(result)
```

### 批量状态检测器 (BatchStatusChecker) *(v2.4.0新增)*

用于优化多个并发状态检测请求。

#### 构造函数

```javascript
/**
 * 批量状态检测器构造函数
 * 将多个检测请求合并为一次检测，提高性能
 */
class BatchStatusChecker {
    constructor()
```

#### requestStatusCheck()
请求状态检查

```javascript
/**
 * 请求状态检查
 * @returns {Promise<Object>} 状态检测结果
 */
requestStatusCheck()
```

#### processBatch()
处理批量请求

```javascript
/**
 * 处理批量请求
 * @private
 */
async processBatch()
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
 * @returns {number} 成功率百分比 (0-100)
 */
getSuccessRate()
```

**示例**:
```javascript
const monitor = new ConnectionMonitor();

// 记录ping请求
const startTime = Date.now();

// 模拟成功的ping
const pingTime = monitor.recordPing(startTime);
console.log('本次延迟:', pingTime, 'ms');
console.log('平均延迟:', monitor.getAveragePing(), 'ms');
console.log('成功率:', monitor.getSuccessRate(), '%');
```

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

## 事件系统 *(v2.4.0新增)*

### EventEmitter 类

提供事件发布订阅机制。

#### 构造函数

```javascript
/**
 * 事件发射器构造函数
 */
class EventEmitter {
    constructor()
}
```

#### on()
注册事件监听器

```javascript
/**
 * 注册事件监听器
 * @param {string} event - 事件名称
 * @param {Function} listener - 监听器函数
 */
on(event, listener)
```

#### off()
移除事件监听器

```javascript
/**
 * 移除事件监听器
 * @param {string} event - 事件名称
 * @param {Function} listener - 监听器函数
 */
off(event, listener)
```

#### emit()
触发事件

```javascript
/**
 * 触发事件
 * @param {string} event - 事件名称
 * @param {...any} args - 事件参数
 */
emit(event, ...args)
```

#### once()
注册一次性事件监听器

```javascript
/**
 * 注册一次性事件监听器
 * @param {string} event - 事件名称
 * @param {Function} listener - 监听器函数
 */
once(event, listener)
```

### 系统事件

#### 连接事件

```javascript
// WebSocket连接建立
app.on('websocket:connected', (connection) => {
    console.log('WebSocket连接已建立');
});

// WebSocket连接断开
app.on('websocket:disconnected', (reason) => {
    console.log('WebSocket连接已断开:', reason);
});

// Eagle连接状态变化
app.on('eagle:connection_changed', (connected) => {
    console.log('Eagle连接状态:', connected ? '已连接' : '已断开');
});
```

#### 文件操作事件

```javascript
// 文件导入开始
app.on('file:import_start', (files) => {
    console.log('开始导入文件:', files.length);
});

// 文件导入完成
app.on('file:import_complete', (result) => {
    console.log('文件导入完成:', result);
});

// 文件导入失败
app.on('file:import_error', (error) => {
    console.error('文件导入失败:', error);
});
```

#### 状态检测事件

```javascript
// 状态检测开始
app.on('status:check_start', () => {
    console.log('开始状态检测');
});

// 状态检测完成
app.on('status:check_complete', (result) => {
    console.log('状态检测完成:', result);
});

// 状态变化
app.on('status:changed', (changes) => {
    console.log('状态发生变化:', changes);
});
```

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

## 日志系统增强 *(v2.4.0增强)*

### LogManager 类增强

#### setLevel()
设置日志级别

```javascript
/**
 * 设置日志级别
 * @param {string} level - 日志级别 ('debug', 'info', 'warn', 'error')
 */
setLevel(level)
```

#### createLogger()
创建子日志器

```javascript
/**
 * 创建子日志器
 * @param {string} name - 日志器名称
 * @returns {Logger} 子日志器实例
 */
createLogger(name)
```

#### enableFileLogging()
启用文件日志

```javascript
/**
 * 启用文件日志
 * @param {string} filePath - 日志文件路径
 * @param {Object} [options={}] - 选项
 */
enableFileLogging(filePath, options = {})
```

### 结构化日志

```javascript
// 使用结构化日志记录
logger.info('文件导入完成', {
    files: fileList.length,
    duration: Date.now() - startTime,
    success: true,
    composition: compName
});

// 记录性能指标
logger.perf('status_check', {
    duration: 1250,
    cacheHit: false,
    errors: 0
});

// 记录用户操作
logger.user('button_click', {
    button: 'import_files',
    context: 'main_panel',
    timestamp: Date.now()
});
```

## 性能监控 *(v2.4.0新增)*

### PerformanceMonitor 类

性能监控器，用于跟踪关键操作的性能指标。

#### 构造函数

```javascript
/**
 * 性能监控器构造函数
 */
class PerformanceMonitor {
    constructor()
}
```

#### startTimer()
开始计时

```javascript
/**
 * 开始计时
 * @param {string} name - 计时器名称
 */
startTimer(name)
```

#### endTimer()
结束计时

```javascript
/**
 * 结束计时
 * @param {string} name - 计时器名称
 * @returns {number} 耗时（毫秒）
 */
endTimer(name)
```

#### recordMetric()
记录性能指标

```javascript
/**
 * 记录性能指标
 * @param {string} name - 指标名称
 * @param {number} value - 指标值
 * @param {string} [unit='ms'] - 单位
 */
recordMetric(name, value, unit = 'ms')
```

#### getReport()
获取性能报告

```javascript
/**
 * 获取性能报告
 * @returns {Object} 性能报告
 */
getReport()
```

**使用示例**:
```javascript
const perfMonitor = new PerformanceMonitor();

// 监控文件导入性能
perfMonitor.startTimer('file_import');
await importFiles();
const duration = perfMonitor.endTimer('file_import');

// 记录内存使用
perfMonitor.recordMetric('memory_usage', process.memoryUsage().heapUsed, 'bytes');

// 获取报告
const report = perfMonitor.getReport();
console.log('性能报告:', report);
```

<File before failed
```markdown
# AE 扩展 API 参考手册

## 概述

本文档提供 Eagle2Ae After Effects CEP 扩展的完整 API 参考，包括前端 JavaScript API、ExtendScript API 和通信接口。

**版本**: v2.4.0  
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
- `projectStatusChecker`: 项目状态检测器实例 *(v2.4.0新增)*

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

**ConnectionState 枚举**
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

### 项目状态检测器类 (ProjectStatusChecker) *(v2.4.0新增)*

负责检测After Effects项目状态、Eagle连接状态等，确保操作的可行性和安全性。

#### 构造函数

```javascript
/**
 * 项目状态检测器构造函数
 * 负责检测AE项目状态、Eagle连接状态等
 */
class ProjectStatusChecker {
    constructor()
```

**属性**:
- `cache`: Map实例，用于缓存检测结果
- `cacheTimeout`: 缓存超时时间（默认5000ms）
- `isChecking`: 是否正在检测中
- `lastCheckTime`: 上次检测时间戳

#### checkProjectStatus()
执行完整的项目状态检测

```javascript
/**
 * 执行完整的项目状态检测
 * @returns {Promise<Object>} 检测结果对象
 * @throws {Error} 检测失败时抛出错误
 */
async checkProjectStatus()
```

**返回值结构**
```javascript
{
    timestamp: 'number',        // 检测时间戳
    hasErrors: 'boolean',       // 是否有错误
    errors: 'Array<Object>',    // 错误列表
    warnings: 'Array<Object>', // 警告列表
    info: {                     // 详细信息
        environment: 'Object',  // 环境信息
        aeConnection: 'Object', // AE连接状态
        project: 'Object',      // 项目状态
        composition: 'Object',  // 合成状态
        eagle: 'Object'         // Eagle连接状态
    },
    recommendations: 'Array<Object>' // 操作建议
}
```

**示例**:
```javascript
const checker = new ProjectStatusChecker();
const result = await checker.checkProjectStatus();

if (result.hasErrors) {
    console.error('检测到错误:', result.errors);
    // 显示错误对话框
    await showStatusErrorDialog(result);
} else {
    console.log('状态检查通过，可以继续操作');
}
```

#### checkEnvironment()
检测运行环境

```javascript
/**
 * 检测运行环境
 * @returns {Object} 环境检测结果
 */
checkEnvironment()
```

**返回值**:
```javascript
{
    isCEP: 'boolean',           // 是否为CEP环境
    isDemo: 'boolean',          // 是否为演示模式
    hasCSInterface: 'boolean',  // 是否有CSInterface
    aeVersion: 'string',        // AE版本号
    cepVersion: 'string'        // CEP版本号
}
```

#### checkAEConnection()
检测After Effects连接状态

```javascript
/**
 * 检测After Effects连接状态
 * @returns {Promise<Object>} AE连接检测结果
 */
async checkAEConnection()
```

**返回值**:
```javascript
{
    connected: 'boolean',       // 是否已连接
    responsive: 'boolean',      // 是否响应
    version: 'string',          // AE版本
    error: 'string',            // 错误信息
    responseTime: 'number'      // 响应时间（毫秒）
}
```

#### checkProjectState()
检测AE项目状态

```javascript
/**
 * 检测AE项目状态
 * @returns {Promise<Object>} 项目状态检测结果
 */
async checkProjectState()
```

**返回值**:
```javascript
{
    hasProject: 'boolean',      // 是否有项目
    projectName: 'string',      // 项目名称
    projectPath: 'string',      // 项目路径
    isSaved: 'boolean',         // 是否已保存
    itemCount: 'number',        // 项目素材数量
    error: 'string'             // 错误信息
}
```

#### checkCompositionState()
检测合成状态

```javascript
/**
 * 检测合成状态
 * @returns {Promise<Object>} 合成状态检测结果
 */
async checkCompositionState()
```

**返回值**:
```javascript
{
    hasComposition: 'boolean',  // 是否有活动合成
    activeComp: 'Object',       // 活动合成信息
    compCount: 'number',        // 合成总数
    layerCount: 'number',       // 图层数量
    error: 'string'             // 错误信息
}
```

#### checkEagleConnection()
检测Eagle应用连接状态

```javascript
/**
 * 检测Eagle应用连接状态
 * @returns {Promise<Object>} Eagle连接检测结果
 */
async checkEagleConnection()
```

**返回值**:
```javascript
{
    connected: 'boolean',       // 是否已连接
    version: 'string',          // Eagle版本
    apiEndpoint: 'string',      // API端点
    responseTime: 'number',     // 响应时间
    error: 'string'             // 错误信息
}
```

#### executeScript()
执行ExtendScript脚本

```javascript
/**
 * 执行ExtendScript脚本
 * @param {string} script - 要执行的脚本代码
 * @param {number} [timeout=3000] - 超时时间（毫秒）
 * @returns {Promise<string>} 脚本执行结果
 */
executeScript(script, timeout = 3000)
```

#### cacheResult()
缓存检测结果

```javascript
/**
 * 缓存检测结果
 * @param {string} key - 缓存键
 * @param {Object} result - 检测结果
 */
cacheResult(key, result)
```

#### getCachedResult()
获取缓存结果

```javascript
/**
 * 获取缓存结果
 * @param {string} key - 缓存键
 * @returns {Object|null} 缓存的结果或null
 */
getCachedResult(key)
```

### 智能对话框系统 *(v2.4.0新增)*

#### showSmartDialog()
显示智能对话框

```javascript
/**
 * 显示智能对话框，根据环境自动选择最佳实现
 * @param {string} type - 对话框类型 ('info'|'warning'|'error'|'confirm')
 * @param {string} title - 对话框标题
 * @param {string} message - 对话框消息
 * @param {Array<string>} buttons - 按钮文本数组
 * @param {Object} [options={}] - 额外选项
 * @returns {Promise<string>} 用户选择的按钮文本
 */
async function showSmartDialog(type, title, message, buttons, options = {})
```

**参数说明**:
- `type`: 对话框类型，影响图标和样式
- `title`: 对话框标题
- `message`: 对话框消息内容
- `buttons`: 按钮文本数组，如 ['确定', '取消']
- `options`: 额外选项
  - `defaultButton`: 默认按钮索引
  - `cancelButton`: 取消按钮索引
  - `modal`: 是否为模态对话框

**示例**:
```javascript
// 显示确认对话框
const result = await showSmartDialog(
    'confirm',
    '确认导入',
    '是否要导入这些文件？',
    ['确定', '取消']
);

if (result === '确定') {
    // 用户确认，继续操作
    await importFiles();
}
```

#### showStatusErrorDialog()
显示状态错误对话框

```javascript
/**
 * 显示状态错误对话框
 * @param {Object} statusResult - 状态检测结果
 * @returns {Promise<string>} 用户选择
 */
async function showStatusErrorDialog(statusResult)
```

#### showStatusSummaryDialog()
显示状态总结对话框

```javascript
/**
 * 显示状态总结对话框
 * @param {Object} statusResult - 状态检测结果
 * @returns {Promise<string>} 用户选择
 */
async function showStatusSummaryDialog(statusResult)
```

### 虚拟弹窗系统 *(v2.4.0新增)*

用于演示模式下的虚拟弹窗显示。

#### VirtualDialogEngine
虚拟弹窗引擎

```javascript
/**
 * 虚拟弹窗引擎类
 * 在演示模式下提供虚拟的弹窗体验
 */
class VirtualDialogEngine {
    constructor()
```

#### showVirtualDialog()
显示虚拟弹窗

```javascript
/**
 * 显示虚拟弹窗
 * @param {string} type - 弹窗类型
 * @param {string} title - 弹窗标题
 * @param {string} message - 弹窗消息
 * @param {Array<string>} buttons - 按钮列表
 * @returns {Promise<string>} 模拟的用户选择
 */
async showVirtualDialog(type, title, message, buttons)
```

#### simulateUserChoice()
模拟用户选择

```javascript
/**
 * 模拟用户选择
 * @param {Array<string>} buttons - 可选按钮
 * @param {Object} preferences - 选择偏好
 * @returns {string} 模拟的选择结果
 */
simulateUserChoice(buttons, preferences = {})
```

### 状态监控器类 (StatusMonitor) *(v2.4.0新增)*

#### 构造函数

```javascript
/**
 * 状态监控器构造函数
 * 负责定期监控项目状态变化
 */
class StatusMonitor {
    constructor()
```

#### startMonitoring()
开始状态监控

```javascript
/**
 * 开始状态监控
 * @param {number} [interval=30000] - 监控间隔（毫秒）
 */
startMonitoring(interval = 30000)
```

#### stopMonitoring()
停止状态监控

```javascript
/**
 * 停止状态监控
 */
stopMonitoring()
```

#### handleStatusChange()
处理状态变化

```javascript
/**
 * 处理状态变化
 * @param {Object} result - 状态检测结果
 */
handleStatusChange(result)
```

### 批量状态检测器 (BatchStatusChecker) *(v2.4.0新增)*

用于优化多个并发状态检测请求。

#### 构造函数

```javascript
/**
 * 批量状态检测器构造函数
 * 将多个检测请求合并为一次检测，提高性能
 */
class BatchStatusChecker {
    constructor()
```

#### requestStatusCheck()
请求状态检查

```javascript
/**
 * 请求状态检查
 * @returns {Promise<Object>} 状态检测结果
 */
requestStatusCheck()
```

#### processBatch()
处理批量请求

```javascript
/**
 * 处理批量请求
 * @private
 */
async processBatch()
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
 * @returns {number} 成功率百分比 (0-100)
 */
getSuccessRate()
```

**示例**:
```javascript
const monitor = new ConnectionMonitor();

// 记录ping请求
const startTime = Date.now();

// 模拟成功的ping
const pingTime = monitor.recordPing(startTime);
console.log('本次延迟:', pingTime, 'ms');
console.log('平均延迟:', monitor.getAveragePing(), 'ms');
console.log('成功率:', monitor.getSuccessRate(), '%');
```

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

## 事件系统 *(v2.4.0新增)*

### EventEmitter 类

提供事件发布订阅机制。

#### 构造函数

```javascript