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
 *
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
