# 项目状态检测器

## 概述

项目状态检测器（ProjectStatusChecker）是 Eagle2Ae AE 扩展 v2.4.0 引入的全新核心组件，负责全面检测 After Effects 项目状态、Eagle 连接状态等，确保所有操作都在安全和合适的环境中进行。该检测器提供了环境检测、AE连接检测、项目状态检测、合成状态检测和Eagle连接检测等一体化解决方案。

## 核心特性

### 全面的状态检测
- **环境检测**: 检测运行环境（CEP、Demo模式等）
- **AE连接检测**: 验证与After Effects的连接状态
- **项目状态检测**: 检查项目是否已打开、是否已保存等
- **合成状态检测**: 验证活动合成的存在和状态
- **Eagle连接检测**: 检查与Eagle插件的连接状态

### 智能缓存机制
- 自动缓存检测结果，避免重复检测
- 支持缓存超时和手动刷新
- 提供细粒度的缓存控制

### 实时状态监控
- 持续监控项目状态变化
- 自动检测状态异常并发出警报
- 提供状态变化事件通知

### 灵活的验证策略
- 支持不同的验证级别（严格、宽松、自定义）
- 可配置的验证规则
- 支持跳过特定检查项

## 技术实现

### 核心类结构

```javascript
/**
 * 项目状态检测器
 * 负责检测After Effects项目状态、Eagle连接状态等，确保操作的可行性和安全性
 */
class ProjectStatusChecker {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            cacheTimeout: 5000, // 缓存超时时间（毫秒）
            monitoringInterval: 3000, // 监控间隔（毫秒）
            enableLogging: true, // 启用日志
            ...options
        };
        
        // 初始化缓存
        this.cache = new Map();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        
        // 初始化监控状态
        this.isMonitoring = false;
        this.monitoringTimer = null;
        this.lastStatus = null;
        
        // 绑定方法上下文
        this.checkEnvironment = this.checkEnvironment.bind(this);
        this.checkAEConnection = this.checkAEConnection.bind(this);
        this.checkProjectState = this.checkProjectState.bind(this);
        this.checkCompositionState = this.checkCompositionState.bind(this);
        this.checkEagleConnection = this.checkEagleConnection.bind(this);
    }
}
```

### 环境检测实现

```javascript
/**
 * 检测运行环境
 * @returns {Object} 环境检测结果
 */
checkEnvironment() {
    const envInfo = {
        isCEP: false,
        isDemo: false,
        hasCSInterface: false,
        aeVersion: 'unknown',
        cepVersion: 'unknown',
        platform: 'unknown',
        userAgent: navigator.userAgent
    };

    try {
        // 检测是否为CEP环境
        envInfo.isCEP = typeof window !== 'undefined' && 
                       typeof window.cep !== 'undefined' && 
                       typeof window.cep.process !== 'undefined';

        // 检测是否为Demo模式
        envInfo.isDemo = window.__DEMO_MODE_ACTIVE__ === true || 
                         (window.demoMode && window.demoMode.state && window.demoMode.state.currentMode !== 'normal');

        // 检测CSInterface
        envInfo.hasCSInterface = typeof CSInterface !== 'undefined';

        // 获取AE版本信息
        if (envInfo.hasCSInterface) {
            try {
                const csInterface = new CSInterface();
                const hostEnv = csInterface.getHostEnvironment();
                if (hostEnv && hostEnv.appVersion) {
                    envInfo.aeVersion = hostEnv.appVersion;
                    envInfo.appName = hostEnv.appName || 'After Effects';
                }
                
                if (hostEnv && hostEnv.extensionVersion) {
                    envInfo.cepVersion = hostEnv.extensionVersion;
                }
            } catch (error) {
                // 忽略获取版本信息的错误
            }
        }

        // 获取平台信息
        envInfo.platform = navigator.platform || 'unknown';

        this.log(`环境检测完成: CEP=${envInfo.isCEP}, Demo=${envInfo.isDemo}`, 'debug');
    } catch (error) {
        this.log(`环境检测失败: ${error.message}`, 'error');
        envInfo.error = error.message;
    }

    return envInfo;
}
```

### AE连接检测实现

```javascript
/**
 * 检测After Effects连接状态
 * @returns {Promise<Object>} AE连接检测结果
 */
async checkAEConnection() {
    const cacheKey = 'ae_connection';
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
        this.log('使用缓存的AE连接检测结果', 'debug');
        return cached;
    }

    const connectionInfo = {
        connected: false,
        responsive: false,
        version: 'unknown',
        error: null,
        responseTime: 0
    };

    try {
        const startTime = Date.now();

        // 检查CSInterface是否存在
        if (typeof CSInterface === 'undefined') {
            connectionInfo.error = 'CSInterface未定义';
            this.cacheResult(cacheKey, connectionInfo);
            return connectionInfo;
        }

        // 尝试获取AE版本信息来验证连接
        const csInterface = new CSInterface();
        const hostEnv = csInterface.getHostEnvironment();
        
        if (hostEnv && hostEnv.appVersion) {
            connectionInfo.connected = true;
            connectionInfo.version = hostEnv.appVersion;
            
            // 进一步测试响应性
            try {
                // 执行一个简单的ExtendScript来测试响应性
                const testResult = await new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error('ExtendScript执行超时'));
                    }, 3000);
                    
                    csInterface.evalScript('app.version', (result) => {
                        clearTimeout(timeoutId);
                        if (result && result !== 'EvalScript error.') {
                            resolve(result);
                        } else {
                            reject(new Error('ExtendScript执行失败'));
                        }
                    });
                });
                
                connectionInfo.responsive = true;
                connectionInfo.responseTime = Date.now() - startTime;
                this.log(`AE连接检测成功: 版本=${connectionInfo.version}, 响应时间=${connectionInfo.responseTime}ms`, 'debug');
            } catch (error) {
                connectionInfo.error = `响应性测试失败: ${error.message}`;
                this.log(connectionInfo.error, 'warning');
            }
        } else {
            connectionInfo.error = '无法获取AE环境信息';
        }

    } catch (error) {
        connectionInfo.error = `AE连接检测失败: ${error.message}`;
        this.log(connectionInfo.error, 'error');
    }

    this.cacheResult(cacheKey, connectionInfo);
    return connectionInfo;
}
```

### 项目状态检测实现

```javascript
/**
 * 检测AE项目状态
 * @returns {Promise<Object>} 项目状态检测结果
 */
async checkProjectState() {
    const cacheKey = 'project_state';
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
        this.log('使用缓存的项目状态检测结果', 'debug');
        return cached;
    }

    const projectInfo = {
        hasProject: false,
        projectName: null,
        projectPath: null,
        isSaved: false,
        itemCount: 0,
        error: null
    };

    try {
        // 检查是否有项目打开
        const projectResult = await this.executeExtendScript('getProjectInfo', {});
        
        if (projectResult && projectResult.success && projectResult.projectInfo) {
            const info = projectResult.projectInfo;
            
            projectInfo.hasProject = true;
            projectInfo.projectName = info.projectName || '未命名项目';
            projectInfo.projectPath = info.projectPath || null;
            projectInfo.isSaved = info.isSaved !== undefined ? info.isSaved : true;
            projectInfo.itemCount = info.itemCount || 0;
            
            this.log(`项目状态: ${projectInfo.projectName} (${projectInfo.itemCount} 个项目素材)`, 'debug');
        } else {
            projectInfo.error = '未打开任何项目';
            this.log('项目状态: 未打开任何项目', 'debug');
        }

    } catch (error) {
        projectInfo.error = `项目状态检测失败: ${error.message}`;
        this.log(projectInfo.error, 'error');
    }

    this.cacheResult(cacheKey, projectInfo);
    return projectInfo;
}
```

### 合成状态检测实现

```javascript
/**
 * 检测合成状态
 * @returns {Promise<Object>} 合成状态检测结果
 */
async checkCompositionState() {
    const cacheKey = 'composition_state';
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
        this.log('使用缓存的合成状态检测结果', 'debug');
        return cached;
    }

    const compInfo = {
        hasComposition: false,
        activeComp: null,
        compCount: 0,
        layerCount: 0,
        error: null
    };

    try {
        // 检查活动合成
        const compResult = await this.executeExtendScript('getActiveCompositionInfo', {});
        
        if (compResult && compResult.success && compResult.compositionInfo) {
            const info = compResult.compositionInfo;
            
            compInfo.hasComposition = true;
            compInfo.activeComp = {
                name: info.name || '未命名合成',
                width: info.width || 1920,
                height: info.height || 1080,
                duration: info.duration || 0,
                frameRate: info.frameRate || 24,
                numLayers: info.numLayers || 0
            };
            compInfo.compCount = info.compCount || 1;
            compInfo.layerCount = info.numLayers || 0;
            
            this.log(`合成状态: ${compInfo.activeComp.name} (${compInfo.layerCount} 个图层)`, 'debug');
        } else {
            compInfo.error = '没有活动的合成';
            this.log('合成状态: 没有活动的合成', 'debug');
        }

    } catch (error) {
        compInfo.error = `合成状态检测失败: ${error.message}`;
        this.log(compInfo.error, 'error');
    }

    this.cacheResult(cacheKey, compInfo);
    return compInfo;
}
```

### Eagle连接检测实现

```javascript
/**
 * 检测Eagle应用连接状态
 * @returns {Promise<Object>} Eagle连接检测结果
 */
async checkEagleConnection() {
    const cacheKey = 'eagle_connection';
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
        this.log('使用缓存的Eagle连接检测结果', 'debug');
        return cached;
    }

    const eagleInfo = {
        connected: false,
        version: null,
        apiEndpoint: null,
        responseTime: 0,
        error: null
    };

    try {
        const startTime = Date.now();
        
        // 尝试连接到Eagle插件
        const response = await fetch('http://localhost:8080/ping', {
            method: 'GET',
            timeout: 3000
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.service === 'Eagle2Ae') {
                eagleInfo.connected = true;
                eagleInfo.version = data.version || 'unknown';
                eagleInfo.apiEndpoint = 'http://localhost:8080';
                eagleInfo.responseTime = Date.now() - startTime;
                
                this.log(`Eagle连接检测成功: 版本=${eagleInfo.version}, 响应时间=${eagleInfo.responseTime}ms`, 'debug');
            } else {
                eagleInfo.error = '连接点不匹配';
            }
        } else {
            eagleInfo.error = `HTTP ${response.status}: ${response.statusText}`;
        }

    } catch (error) {
        eagleInfo.error = `Eagle连接检测失败: ${error.message}`;
        this.log(eagleInfo.error, 'debug'); // 在Demo模式下使用debug级别
    }

    this.cacheResult(cacheKey, eagleInfo);
    return eagleInfo;
}
```

## API参考

### 构造函数

```javascript
/**
 * 项目状态检测器构造函数
 * @param {Object} options - 配置选项
 * @param {number} options.cacheTimeout - 缓存超时时间（毫秒）
 * @param {number} options.monitoringInterval - 监控间隔（毫秒）
 * @param {boolean} options.enableLogging - 是否启用日志
 */
constructor(options = {})
```

### 核心方法

#### checkProjectStatus()
执行完整的项目状态检测

```javascript
/**
 * 执行完整的项目状态检测
 * @param {Object} options - 检测选项
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存
 * @param {boolean} options.includeDetails - 是否包含详细信息
 * @returns {Promise<Object>} 检测结果
 */
async checkProjectStatus(options = {})
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

#### validateProjectStatus()
验证项目状态是否满足要求

```javascript
/**
 * 验证项目状态是否满足要求
 * @param {Object} options - 验证选项
 * @param {boolean} options.requireProject - 是否需要项目已打开
 * @param {boolean} options.requireActiveComposition - 是否需要活动合成
 * @param {boolean} options.showWarning - 是否显示警告对话框
 * @param {Array<Object>} options.customRules - 自定义验证规则
 * @param {boolean} options.forceRefresh - 是否强制刷新缓存
 * @returns {Promise<boolean>} 是否满足要求
 */
async validateProjectStatus(options = {})
```

#### batchCheck()
批量执行状态检查

```javascript
/**
 * 批量执行状态检查
 * @param {Array<string>} checkTypes - 要检查的类型列表
 * @param {boolean} forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} 检查结果
 */
async batchCheck(checkTypes, forceRefresh = false)
```

#### startMonitoring()
启动实时状态监控

```javascript
/**
 * 启动实时状态监控
 * @param {Object} options - 监控选项
 * @param {number} options.interval - 监控间隔（毫秒）
 * @param {Function} options.onChange - 状态变化回调函数
 * @param {Function} options.onError - 错误回调函数
 */
startMonitoring(options = {})
```

#### stopMonitoring()
停止实时监控

```javascript
/**
 * 停止实时监控
 */
stopMonitoring()
```

### 缓存管理方法

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
 * @returns {Object|null} 缓存的数据或null
 */
getCachedResult(key)
```

#### clearCache()
清除缓存

```javascript
/**
 * 清除缓存
 * @param {string} key - 可选的特定键，如果不提供则清除所有缓存
 */
clearCache(key = null)
```

#### getCacheInfo()
获取缓存信息

```javascript
/**
 * 获取缓存信息
 * @returns {Object} 缓存统计信息
 */
getCacheInfo()
```

## 使用示例

### 基本使用

```javascript
// 创建项目状态检测器实例
const projectStatusChecker = new ProjectStatusChecker({
    cacheTimeout: 5000,
    monitoringInterval: 3000,
    enableLogging: true
});

// 执行完整状态检测
const projectStatus = await projectStatusChecker.checkProjectStatus();

if (projectStatus.hasProject) {
    console.log(`✅ 项目已打开: ${projectStatus.projectName}`);
} else {
    console.log('❌ 未打开任何项目');
}
```

### 验证项目状态

```javascript
// 验证项目状态是否满足要求
const isValid = await projectStatusChecker.validateProjectStatus({
    requireProject: true,
    requireActiveComposition: true,
    showWarning: true
});

if (isValid) {
    console.log('项目状态满足要求，可以执行操作');
    // 执行操作...
} else {
    console.log('项目状态不满足要求，操作被阻止');
}
```

### 实时监控

```javascript
// 启动实时状态监控
projectStatusChecker.startMonitoring({
    interval: 5000,
    onChange: (newStatus, oldStatus) => {
        console.log('状态变化:', newStatus);
        // 更新UI状态显示
        updateProjectStatusUI(newStatus);
    },
    onError: (error) => {
        console.error('状态监控出错:', error);
    }
});

// 在适当时候停止监控
// projectStatusChecker.stopMonitoring();
```

### 批量检查

```javascript
// 批量执行多个状态检查
const results = await projectStatusChecker.batchCheck([
    'environment',
    'ae_connection',
    'project_state',
    'composition_state',
    'eagle_connection'
]);

console.log('批量检查结果:', results);

// 处理单项检查结果
if (results.project_state.valid) {
    console.log('项目状态正常');
} else {
    console.log('项目状态异常:', results.project_state.message);
}
```

## 最佳实践

### 性能优化

1. **合理使用缓存**
   ```javascript
   // 对于频繁调用的检查，利用缓存提高性能
   const status = await projectStatusChecker.checkProjectState();
   
   // 对于关键操作，强制刷新缓存确保准确性
   const freshStatus = await projectStatusChecker.checkProjectState({
       forceRefresh: true
   });
   ```

2. **批量检查优化**
   ```javascript
   // 对于多个相关检查，使用批量检查减少网络请求
   const results = await projectStatusChecker.batchCheck([
       'project_state',
       'composition_state'
   ]);
   ```

3. **防抖处理**
   ```javascript
   // 对于高频检查，使用防抖避免性能问题
   let checkTimeout;
   function debouncedCheck() {
       if (checkTimeout) clearTimeout(checkTimeout);
       checkTimeout = setTimeout(async () => {
           await projectStatusChecker.checkProjectStatus();
       }, 300);
   }
   ```

### 错误处理

1. **统一错误处理**
   ```javascript
   try {
       const result = await projectStatusChecker.checkProjectStatus();
       if (!result.success) {
           throw new Error(result.error || '状态检测失败');
       }
   } catch (error) {
       console.error('状态检测失败:', error.message);
       // 显示用户友好的错误信息
       showErrorMessage('状态检测失败', error.message);
   }
   ```

2. **降级处理**
   ```javascript
   // 当检测失败时提供降级方案
   const result = await projectStatusChecker.checkProjectStatus().catch(error => {
       console.warn('状态检测失败，使用默认值:', error.message);
       return {
           hasProject: true,
           projectName: '默认项目',
           hasComposition: true,
           activeComp: { name: '默认合成' }
       };
   });
   ```

### 内存管理

1. **及时清理资源**
   ```javascript
   // 在组件销毁时清理监控
   componentWillUnmount() {
       if (this.projectStatusChecker) {
           this.projectStatusChecker.stopMonitoring();
           this.projectStatusChecker.clearCache();
       }
   }
   ```

2. **限制缓存大小**
   ```javascript
   // 定期清理过期缓存
   setInterval(() => {
       const cacheInfo = projectStatusChecker.getCacheInfo();
       if (cacheInfo.size > 100) {
           projectStatusChecker.clearCache();
       }
   }, 300000); // 每5分钟检查一次
   ```

## 故障排除

### 常见问题

#### 状态检测失败
- **症状**：状态检测返回错误或超时
- **解决**：
  1. 检查ExtendScript连接是否正常
  2. 确认AE项目是否已打开
  3. 验证Eagle插件是否正在运行

#### 缓存未生效
- **症状**：相同检测重复执行，性能下降
- **解决**：
  1. 检查缓存键是否正确
  2. 验证缓存超时设置
  3. 手动清除缓存后重试

#### 监控停止工作
- **症状**：实时监控突然停止更新
- **解决**：
  1. 检查监控定时器是否正常运行
  2. 验证错误处理逻辑
  3. 重启监控

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控缓存命中率
setInterval(() => {
    const cacheInfo = projectStatusChecker.getCacheInfo();
    console.log('缓存统计:', cacheInfo);
}, 30000); // 每30秒输出一次
```

#### 性能分析
```javascript
// 记录检测时间
const startTime = performance.now();
const result = await projectStatusChecker.checkProjectStatus();
const endTime = performance.now();

console.log(`项目状态检测耗时: ${endTime - startTime}ms`);
```

#### 内存使用监控
```javascript
// 监控内存使用情况
function logMemoryUsage() {
    if (performance.memory) {
        console.log('内存使用情况:', {
            used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
            total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`,
            limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        });
    }
}

// 定期监控内存使用
setInterval(logMemoryUsage, 30000); // 每30秒监控一次
```

## 扩展性

### 自定义验证规则

```javascript
// 添加自定义验证规则
const customValidation = await projectStatusChecker.validateProjectStatus({
    requireProject: true,
    customRules: [
        {
            name: 'check_layer_count',
            description: '检查图层数量限制',
            validator: async (results) => {
                if (results.composition_state && results.composition_state.data) {
                    const layerCount = results.composition_state.data.layerCount || 0;
                    if (layerCount > 1000) {
                        return {
                            valid: false,
                            message: '图层数量过多，可能导致性能问题'
                        };
                    }
                }
                return { valid: true };
            }
        }
    ]
});
```

### 事件系统

```javascript
// 监听状态变化事件
projectStatusChecker.addEventListener('statuschange', (event) => {
    const { current, previous } = event.detail;
    console.log('项目状态发生变化:', { current, previous });
    
    // 更新UI状态显示
    updateProjectStatusUI(current);
});

// 监听监控错误事件
projectStatusChecker.addEventListener('monitorerror', (event) => {
    const { error } = event.detail;
    console.error('监控错误:', error);
    
    // 处理监控错误
    handleMonitoringError(error);
});
```

### 插件化架构

```javascript
// 创建自定义状态检测器插件
class CustomStatusCheckerPlugin {
    constructor(projectStatusChecker) {
        this.checker = projectStatusChecker;
        this.init();
    }
    
    init() {
        // 注册自定义检查方法
        this.checker.registerCustomCheck('custom_check', this.customCheck.bind(this));
        
        // 添加自定义验证规则
        this.checker.addValidationRule('custom_validation', this.customValidation.bind(this));
    }
    
    async customCheck() {
        // 自定义检查逻辑
        return {
            success: true,
            data: {
                customValue: 'example'
            }
        };
    }
    
    async customValidation(results) {
        // 自定义验证逻辑
        if (results.custom_check && results.custom_check.data.customValue === 'example') {
            return {
                valid: true
            };
        }
        return {
            valid: false,
            message: '自定义验证失败'
        };
    }
}

// 注册插件
const plugin = new CustomStatusCheckerPlugin(projectStatusChecker);
```