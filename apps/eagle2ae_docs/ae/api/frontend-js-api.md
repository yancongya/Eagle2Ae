# 前端 JavaScript API

## 概述

Eagle2Ae AE 扩展提供了丰富的前端 JavaScript API，允许开发者与扩展的核心功能进行交互。这些 API 涵盖了连接管理、项目状态检测、配置管理、日志记录等多个方面。

## 主应用类 (AEExtension)

### 构造函数

```javascript
/**
 * AE扩展主类构造函数
 * 负责初始化所有核心组件和服务
 */
class AEExtension {
    /**
     * 构造函数
     * @param {Object} options - 初始化选项
     */
    constructor(options = {})
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
- `configManager`: 配置管理器实例 *(v2.4.0新增)*
- `portDiscovery`: 端口发现服务实例 *(v2.4.0新增)*

### 核心方法

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

#### testConnection()
测试与Eagle的连接

```javascript
/**
 * 测试与Eagle插件的连接
 * @returns {Promise<Object>} 连接测试结果
 */
async testConnection()
```

**返回值**
```javascript
{
    success: 'boolean',         // 是否成功
    connected: 'boolean',       // 是否已连接
    pingTime: 'number',         // 延迟时间（毫秒）
    error: 'string'             // 错误信息（如果失败）
}
```

#### disconnect()
断开与Eagle的连接

```javascript
/**
 * 断开与Eagle插件的连接
 */
disconnect()
```

#### sendToEagle()
向Eagle发送消息

```javascript
/**
 * 向Eagle插件发送消息
 * @param {Object} message - 要发送的消息
 * @returns {Promise<Object>} 发送结果
 */
async sendToEagle(message)
```

#### log()
记录日志

```javascript
/**
 * 记录日志
 * @param {string} message - 日志消息
 * @param {string} level - 日志级别 ('info', 'success', 'warning', 'error', 'debug')
 * @param {Object} options - 日志选项
 */
log(message, level = 'info', options = {})
```

#### getPanelId()
获取当前面板ID

```javascript
/**
 * 获取当前面板ID
 * @returns {string} 面板ID ('panel1', 'panel2', 'panel3')
 */
getPanelId()
```

#### getPresetFileName()
获取预设文件名

```javascript
/**
 * 获取当前面板的预设文件名
 * @returns {string} 预设文件名
 */
getPresetFileName()
```

### UI 控制方法

#### showSettingsPanel()
显示设置面板

```javascript
/**
 * 显示高级设置面板
 */
showSettingsPanel()
```

#### toggleLogPanel()
切换日志面板显示状态

```javascript
/**
 * 切换日志面板显示状态
 */
toggleLogPanel()
```

#### switchLogView()
切换日志视图

```javascript
/**
 * 切换日志视图（AE日志/Eagle日志）
 */
switchLogView()
```

#### clearLog()
清空日志

```javascript
/**
 * 清空当前日志视图
 */
clearLog()
```

#### updateConnectionUI()
更新连接状态UI

```javascript
/**
 * 更新连接状态相关的UI元素
 */
updateConnectionUI()
```

## 项目状态检测器类 (ProjectStatusChecker) *(v2.4.0新增)*

负责检测After Effects项目状态、Eagle连接状态等，确保操作的可行性和安全性。

### 构造函数

```javascript
/**
 * 项目状态检测器构造函数
 * 负责检测AE项目状态、Eagle连接状态等
 * @param {Object} options - 配置选项
 */
class ProjectStatusChecker {
    constructor(options = {})
```

**属性**:
- `cache`: Map实例，用于缓存检测结果
- `cacheTimeout`: 缓存超时时间（默认5000ms）
- `isChecking`: 是否正在检测中
- `lastCheckTime`: 上次检测时间戳
- `options`: 配置选项

### 核心方法

#### checkProjectStatus()
执行完整的项目状态检测

```javascript
/**
 * 执行完整的项目状态检测
 * @param {Object} options - 检测选项
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} 检测结果对象
 * @throws {Error} 检测失败时抛出错误
 */
async checkProjectStatus(options = {})
```

**返回值结构**
```javascript
{
    timestamp: 'number',        // 检测时间戳
    hasErrors: 'boolean',       // 是否有错误
    errors: 'Array<Object>',    // 错误列表
    warnings: 'Array<Object>',  // 警告列表
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
 * @param {Object} options - 检测选项
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} AE连接检测结果
 */
async checkAEConnection(options = {})
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
 * @param {Object} options - 检测选项
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} 项目状态检测结果
 */
async checkProjectState(options = {})
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
 * @param {Object} options - 检测选项
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} 合成状态检测结果
 */
async checkCompositionState(options = {})
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
 * @param {Object} options - 检测选项
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} Eagle连接检测结果
 */
async checkEagleConnection(options = {})
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

#### validateProjectStatus()
验证项目状态

```javascript
/**
 * 验证项目状态是否满足特定要求
 * @param {Object} requirements - 要求条件
 * @param {boolean} requirements.requireProject - 是否需要项目
 * @param {boolean} requirements.requireComposition - 是否需要合成
 * @param {boolean} requirements.showWarnings - 是否显示警告
 * @returns {Promise<boolean>} 是否满足要求
 */
async validateProjectStatus(requirements = {})
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

#### clearCache()
清除缓存

```javascript
/**
 * 清除所有缓存或特定缓存
 * @param {string} [key] - 特定缓存键，如果不提供则清除所有缓存
 */
clearCache(key)
```

## 配置管理器类 (ConfigManager) *(v2.4.0新增)*

负责管理扩展的所有配置设置和用户偏好。

### 构造函数

```javascript
/**
 * 配置管理器构造函数
 * @param {Object} options - 配置选项
 */
class ConfigManager {
    constructor(options = {})
```

### 核心方法

#### get()
获取配置值

```javascript
/**
 * 获取配置值
 * @param {string} key - 配置键，支持点分隔的路径
 * @param {any} [defaultValue] - 默认值
 * @returns {any} 配置值
 */
get(key, defaultValue = undefined)
```

#### set()
设置配置值

```javascript
/**
 * 设置配置值
 * @param {string} key - 配置键
 * @param {any} value - 配置值
 * @param {boolean} save - 是否保存到存储
 * @returns {Object} 设置结果
 */
set(key, value, save = true)
```

#### save()
保存配置到文件

```javascript
/**
 * 保存配置到文件
 * @param {Object} config - 要保存的配置（可选）
 * @returns {Promise<Object>} 保存结果
 */
async save(config = null)
```

#### load()
从文件加载配置

```javascript
/**
 * 从文件加载配置
 * @returns {Promise<Object>} 加载结果
 */
async load()
```

#### reset()
重置配置为默认值

```javascript
/**
 * 重置配置为默认值
 * @param {string} [key] - 要重置的配置键，不指定则重置所有
 * @returns {Object} 重置结果
 */
reset(key = null)
```

## 端口发现服务类 (PortDiscovery) *(v2.4.0新增)*

负责从Eagle注册的临时文件中发现服务端口。

### 构造函数

```javascript
/**
 * 端口发现服务构造函数
 * @param {Function} logger - 日志函数
 */
class PortDiscovery {
    constructor(logger)
```

### 核心方法

#### discoverPort()
发现Eagle服务端口

```javascript
/**
 * 发现Eagle服务端口
 * @returns {Promise<Object>} 发现结果
 */
async discoverPort()
```

#### getEaglePort()
获取Eagle端口（主要方法）

```javascript
/**
 * 获取Eagle端口（主要方法）
 * @returns {Promise<number>} Eagle端口号
 */
async getEaglePort()
```

#### clearCache()
清除缓存

```javascript
/**
 * 清除缓存
 */
clearCache()
```

#### getDiscoveryStatus()
获取发现状态

```javascript
/**
 * 获取发现状态
 * @returns {Promise<Object>} 发现状态信息
 */
async getDiscoveryStatus()
```

## 使用示例

### 连接管理

```javascript
// 创建AE扩展实例
const aeExtension = new AEExtension();

// 测试连接
const connectionResult = await aeExtension.testConnection();
if (connectionResult.success) {
    console.log(`连接成功，延迟: ${connectionResult.pingTime}ms`);
} else {
    console.error('连接失败:', connectionResult.error);
}

// 断开连接
aeExtension.disconnect();
```

### 项目状态检测

```javascript
// 创建项目状态检测器
const projectStatusChecker = new ProjectStatusChecker();

// 检查项目状态
const projectStatus = await projectStatusChecker.checkProjectStatus();
console.log('项目状态:', projectStatus);

// 验证项目状态要求
const isValid = await projectStatusChecker.validateProjectStatus({
    requireProject: true,
    requireComposition: true,
    showWarnings: true
});

if (isValid) {
    console.log('项目状态满足要求');
} else {
    console.log('项目状态不满足要求');
}
```

### 配置管理

```javascript
// 创建配置管理器
const configManager = new ConfigManager();

// 获取配置
const port = configManager.get('connection.websocket.port', 8080);
const theme = configManager.get('ui.theme', 'dark');

// 设置配置
const setResult = configManager.set('ui.theme', 'light');
if (setResult.success) {
    console.log('配置设置成功');
}

// 保存配置
const saveResult = await configManager.save();
if (saveResult.success) {
    console.log('配置保存成功');
}
```

### 端口发现

```javascript
// 创建端口发现服务
const portDiscovery = new PortDiscovery(console.log);

// 发现Eagle端口
const port = await portDiscovery.getEaglePort();
console.log(`发现Eagle端口: ${port}`);

// 获取详细状态
const status = await portDiscovery.getDiscoveryStatus();
console.log('端口发现状态:', status);
```

## 最佳实践

### 错误处理

```javascript
// 为所有异步操作提供统一的错误处理
async function safeExecute(asyncFunction, errorMessage) {
    try {
        return await asyncFunction();
    } catch (error) {
        console.error(errorMessage, error);
        // 可以显示用户友好的错误消息
        aeExtension.log(`${errorMessage}: ${error.message}`, 'error');
        return null;
    }
}

// 使用示例
const result = await safeExecute(
    () => aeExtension.testConnection(),
    '连接测试失败'
);
```

### 性能优化

```javascript
// 合理使用缓存避免重复操作
let cachedProjectStatus = null;
let lastCacheTime = 0;
const CACHE_TIMEOUT = 5000; // 5秒缓存

async function getProjectStatus(forceRefresh = false) {
    const now = Date.now();
    
    // 检查缓存是否有效
    if (!forceRefresh && cachedProjectStatus && (now - lastCacheTime) < CACHE_TIMEOUT) {
        return cachedProjectStatus;
    }
    
    // 重新获取状态
    cachedProjectStatus = await projectStatusChecker.checkProjectStatus();
    lastCacheTime = now;
    
    return cachedProjectStatus;
}
```

### 内存管理

```javascript
// 在适当时候清理资源
function cleanupExtension(aeExtension) {
    // 停止轮询
    if (aeExtension.pollingManager) {
        aeExtension.pollingManager.stop();
    }
    
    // 停止监控
    if (aeExtension.projectStatusChecker) {
        // 清理项目状态检测器资源
    }
    
    // 清理其他资源
    aeExtension.csInterface = null;
    aeExtension.logManager = null;
    aeExtension.settingsManager = null;
}
```
