# 项目状态检测器

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了全新的项目状态检测器（ProjectStatusChecker），这是一个智能化的系统，用于实时检测和验证After Effects项目的各种状态。该检测器确保所有导入和导出操作都在安全和合适的环境中进行，大大提高了扩展的稳定性和可靠性。

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

## 使用指南

### 基本使用

#### 简单调用
```javascript
// 创建项目状态检测器实例
const projectStatusChecker = new ProjectStatusChecker();

// 执行完整状态检测
const result = await projectStatusChecker.validateProjectStatus({
    requireProject: true,
    requireActiveComposition: true,
    showWarning: true
});

if (result) {
    console.log('项目状态正常，可以执行操作');
    // 执行导入或其他操作
} else {
    console.log('项目状态不符合要求，操作被阻止');
}
```

#### 自定义检测选项
```javascript
// 执行自定义状态检测
const result = await projectStatusChecker.validateProjectStatus({
    // 必须已打开项目
    requireProject: true,
    
    // 必须有活动合成
    requireActiveComposition: true,
    
    // 显示警告对话框
    showWarning: true,
    
    // 自定义验证规则
    customRules: [
        {
            name: 'check_comp_layers',
            description: '检查合成图层数量',
            validator: async (projectInfo) => {
                if (projectInfo.activeComp && projectInfo.activeComp.numLayers > 100) {
                    return {
                        valid: false,
                        message: '合成图层数量过多，可能导致性能问题'
                    };
                }
                return { valid: true };
            }
        }
    ]
});
```

### 高级功能

#### 缓存控制
```javascript
// 手动清除缓存
projectStatusChecker.clearCache();

// 强制刷新检测结果
const freshResult = await projectStatusChecker.validateProjectStatus({
    requireProject: true,
    forceRefresh: true
});

// 获取缓存状态
const cacheInfo = projectStatusChecker.getCacheInfo();
console.log(`缓存项目数: ${cacheInfo.size}`);
console.log(`缓存命中率: ${cacheInfo.hitRate}%`);
```

#### 实时监控
```javascript
// 启动实时状态监控
projectStatusChecker.startMonitoring({
    interval: 5000, // 5秒检查一次
    onChange: (newStatus, oldStatus) => {
        console.log('项目状态发生变化:', newStatus);
        
        // 更新UI状态显示
        updateProjectStatusUI(newStatus);
    },
    onError: (error) => {
        console.error('状态监控出错:', error);
    }
});

// 停止监控
projectStatusChecker.stopMonitoring();
```

#### 批量状态检查
```javascript
// 执行多项状态检查
const batchResult = await projectStatusChecker.batchCheck([
    'environment',
    'ae_connection',
    'project_state',
    'composition_state',
    'eagle_connection'
]);

console.log('批量检查结果:', batchResult);

// 处理单项检查结果
if (batchResult.project_state.valid) {
    console.log('项目状态正常');
} else {
    console.log('项目状态异常:', batchResult.project_state.message);
}
```

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
                         (window.demoMode && window.demoMode.isDemoMode && window.demoMode.isDemoMode());

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

## 验证方法

### 验证项目状态

```javascript
/**
 * 验证项目状态是否满足要求
 * @param {Object} options - 验证选项
 * @returns {Promise<boolean>} 是否满足要求
 */
async validateProjectStatus(options = {}) {
    const {
        requireProject = false,
        requireActiveComposition = false,
        showWarning = false,
        customRules = [],
        forceRefresh = false
    } = options;

    try {
        // 执行状态检测
        const checks = [];
        
        if (requireProject) {
            checks.push('project_state');
        }
        
        if (requireActiveComposition) {
            checks.push('composition_state');
        }
        
        // 总是检查环境和AE连接
        checks.push('environment', 'ae_connection');
        
        const results = await this.batchCheck(checks, forceRefresh);
        
        // 检查基本要求
        if (requireProject && (!results.project_state || !results.project_state.valid)) {
            if (showWarning) {
                await this.showWarningDialog('项目未打开', '请先打开After Effects项目再执行此操作');
            }
            return false;
        }
        
        if (requireActiveComposition && (!results.composition_state || !results.composition_state.valid)) {
            if (showWarning) {
                await this.showWarningDialog('无活动合成', '请先选择或创建一个合成再执行此操作');
            }
            return false;
        }
        
        // 执行自定义验证规则
        if (customRules.length > 0) {
            for (const rule of customRules) {
                try {
                    const validationResult = await rule.validator(results);
                    if (!validationResult.valid) {
                        if (showWarning) {
                            await this.showWarningDialog(
                                rule.name || '验证失败', 
                                validationResult.message || '自定义验证规则失败'
                            );
                        }
                        return false;
                    }
                } catch (error) {
                    this.log(`自定义验证规则 "${rule.name}" 执行失败: ${error.message}`, 'error');
                }
            }
        }
        
        return true;
        
    } catch (error) {
        this.log(`项目状态验证失败: ${error.message}`, 'error');
        if (showWarning) {
            await this.showWarningDialog('状态验证失败', `无法验证项目状态: ${error.message}`);
        }
        return false;
    }
}
```

### 批量检查实现

```javascript
/**
 * 批量执行状态检查
 * @param {Array<string>} checkTypes - 要检查的类型列表
 * @param {boolean} forceRefresh - 是否强制刷新缓存
 * @returns {Promise<Object>} 检查结果
 */
async batchCheck(checkTypes, forceRefresh = false) {
    const results = {};
    
    // 定义检查方法映射
    const checkMethods = {
        'environment': () => Promise.resolve(this.checkEnvironment()),
        'ae_connection': () => this.checkAEConnection(),
        'project_state': () => this.checkProjectState(),
        'composition_state': () => this.checkCompositionState(),
        'eagle_connection': () => this.checkEagleConnection()
    };
    
    // 执行检查
    for (const checkType of checkTypes) {
        try {
            if (checkMethods[checkType]) {
                if (forceRefresh) {
                    this.invalidateCache(checkType);
                }
                
                const result = await checkMethods[checkType]();
                results[checkType] = {
                    valid: !result.error,
                    data: result,
                    message: result.error || '检查通过'
                };
            } else {
                results[checkType] = {
                    valid: false,
                    message: `未知的检查类型: ${checkType}`
                };
            }
        } catch (error) {
            results[checkType] = {
                valid: false,
                message: error.message
            };
        }
    }
    
    return results;
}
```

## 缓存机制

### 缓存实现

```javascript
/**
 * 缓存检测结果
 * @param {string} key - 缓存键
 * @param {Object} result - 检测结果
 */
cacheResult(key, result) {
    if (!key || !result) return;
    
    const cacheEntry = {
        data: result,
        timestamp: Date.now(),
        expiry: Date.now() + this.options.cacheTimeout
    };
    
    this.cache.set(key, cacheEntry);
    this.cacheMisses++;
    
    this.log(`缓存结果: ${key} (有效期: ${this.options.cacheTimeout}ms)`, 'debug');
}

/**
 * 获取缓存结果
 * @param {string} key - 缓存键
 * @returns {Object|null} 缓存的数据或null
 */
getCachedResult(key) {
    if (!this.cache.has(key)) {
        return null;
    }
    
    const cacheEntry = this.cache.get(key);
    
    // 检查是否过期
    if (Date.now() > cacheEntry.expiry) {
        this.cache.delete(key);
        return null;
    }
    
    this.cacheHits++;
    this.log(`缓存命中: ${key}`, 'debug');
    return cacheEntry.data;
}

/**
 * 清除缓存
 * @param {string} key - 可选的特定键，如果不提供则清除所有缓存
 */
clearCache(key = null) {
    if (key) {
        this.cache.delete(key);
        this.log(`清除缓存: ${key}`, 'debug');
    } else {
        const size = this.cache.size;
        this.cache.clear();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.log(`清除所有缓存 (${size} 个项目)`, 'debug');
    }
}

/**
 * 获取缓存信息
 * @returns {Object} 缓存统计信息
 */
getCacheInfo() {
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? Math.round((this.cacheHits / totalRequests) * 100) : 0;
    
    return {
        size: this.cache.size,
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate: hitRate,
        hitRatio: totalRequests > 0 ? (this.cacheHits / totalRequests).toFixed(2) : '0.00'
    };
}
```

## 监控机制

### 实时监控实现

```javascript
/**
 * 启动实时状态监控
 * @param {Object} options - 监控选项
 */
startMonitoring(options = {}) {
    if (this.isMonitoring) {
        this.log('监控已在运行中', 'debug');
        return;
    }
    
    const {
        interval = this.options.monitoringInterval,
        onChange = null,
        onError = null
    } = options;
    
    this.isMonitoring = true;
    this.log(`启动实时状态监控 (间隔: ${interval}ms)`, 'debug');
    
    const monitorLoop = async () => {
        if (!this.isMonitoring) return;
        
        try {
            const currentStatus = await this.checkProjectStatus();
            
            // 检查状态是否发生变化
            if (this.hasStatusChanged(this.lastStatus, currentStatus)) {
                this.log('项目状态发生变化', 'debug');
                
                if (onChange) {
                    onChange(currentStatus, this.lastStatus);
                }
                
                // 触发事件
                this.dispatchEvent('statuschange', {
                    current: currentStatus,
                    previous: this.lastStatus
                });
            }
            
            this.lastStatus = currentStatus;
            
        } catch (error) {
            this.log(`状态监控出错: ${error.message}`, 'error');
            
            if (onError) {
                onError(error);
            }
            
            // 触发错误事件
            this.dispatchEvent('monitorerror', { error });
        }
        
        // 安排下一次检查
        if (this.isMonitoring) {
            this.monitoringTimer = setTimeout(monitorLoop, interval);
        }
    };
    
    // 启动监控循环
    monitorLoop();
}

/**
 * 停止实时监控
 */
stopMonitoring() {
    if (!this.isMonitoring) {
        this.log('监控未在运行', 'debug');
        return;
    }
    
    this.isMonitoring = false;
    
    if (this.monitoringTimer) {
        clearTimeout(this.monitoringTimer);
        this.monitoringTimer = null;
    }
    
    this.log('停止实时状态监控', 'debug');
}

/**
 * 检查状态是否发生变化
 * @param {Object} oldStatus - 旧状态
 * @param {Object} newStatus - 新状态
 * @returns {boolean} 是否发生变化
 */
hasStatusChanged(oldStatus, newStatus) {
    if (!oldStatus && newStatus) return true;
    if (oldStatus && !newStatus) return true;
    if (!oldStatus && !newStatus) return false;
    
    // 比较关键字段
    const criticalFields = [
        'hasProject', 'projectName', 'projectPath',
        'hasComposition', 'activeCompName',
        'eagleConnected', 'eagleVersion'
    ];
    
    for (const field of criticalFields) {
        const oldValue = this.getNestedValue(oldStatus, field);
        const newValue = this.getNestedValue(newStatus, field);
        
        if (oldValue !== newValue) {
            this.log(`状态变化: ${field} ${oldValue} -> ${newValue}`, 'debug');
            return true;
        }
    }
    
    return false;
}
```

## 最佳实践

### 使用建议

1. **合理使用缓存**
   ```javascript
   // 对于频繁调用的检查，利用缓存提高性能
   const status = await projectStatusChecker.validateProjectStatus({
       requireProject: true,
       requireActiveComposition: true
   });
   
   // 对于关键操作，强制刷新缓存确保准确性
   const freshStatus = await projectStatusChecker.validateProjectStatus({
       requireProject: true,
       requireActiveComposition: true,
       forceRefresh: true
   });
   ```

2. **错误处理**
   ```javascript
   try {
       const isValid = await projectStatusChecker.validateProjectStatus({
           requireProject: true,
           showWarning: true
       });
       
       if (isValid) {
           // 执行安全操作
           await performSafeOperation();
       }
   } catch (error) {
       // 处理检查失败的情况
       console.error('状态检查失败:', error);
       // 可以选择降级到无检查模式或提示用户
   }
   ```

3. **性能优化**
   ```javascript
   // 批量检查多个状态，减少重复调用
   const results = await projectStatusChecker.batchCheck([
       'project_state',
       'composition_state',
       'eagle_connection'
   ]);
   
   // 根据检查结果决定操作流程
   if (results.project_state.valid && results.composition_state.valid) {
       // 执行需要项目和合成的操作
       await performProjectOperation();
   }
   ```

### 配置优化

1. **缓存时间设置**
   ```javascript
   // 对于快速变化的状态，缩短缓存时间
   const fastChecker = new ProjectStatusChecker({
       cacheTimeout: 1000 // 1秒
   });
   
   // 对于缓慢变化的状态，延长缓存时间
   const slowChecker = new ProjectStatusChecker({
       cacheTimeout: 10000 // 10秒
   });
   ```

2. **监控间隔设置**
   ```javascript
   // 高频监控用于实时性要求高的场景
   projectStatusChecker.startMonitoring({
       interval: 1000, // 1秒
       onChange: handleHighFrequencyChange
   });
   
   // 低频监控用于一般状态监控
   projectStatusChecker.startMonitoring({
       interval: 5000, // 5秒
       onChange: handleLowFrequencyChange
   });
   ```

## 故障排除

### 常见问题

1. **检测结果不准确**
   - 症状：状态检测结果与实际不符
   - 解决：强制刷新缓存，检查AE连接状态

2. **缓存未生效**
   - 症状：相同检测重复执行，性能下降
   - 解决：检查缓存键是否正确，调整缓存超时时间

3. **监控停止工作**
   - 症状：实时监控突然停止更新
   - 解决：重启监控，检查错误处理逻辑

### 调试技巧

1. **启用详细日志**
   ```javascript
   const checker = new ProjectStatusChecker({
       enableLogging: true
   });
   
   // 或者在控制台中设置
   localStorage.setItem('debugLogLevel', '0');
   ```

2. **监控缓存命中率**
   ```javascript
   // 定期检查缓存效率
   setInterval(() => {
       const cacheInfo = projectStatusChecker.getCacheInfo();
       console.log('缓存统计:', cacheInfo);
   }, 30000); // 每30秒输出一次
   ```

3. **性能分析**
   ```javascript
   // 记录检测时间
   const startTime = performance.now();
   const result = await projectStatusChecker.validateProjectStatus(options);
   const endTime = performance.now();
   
   console.log(`状态检测耗时: ${endTime - startTime}ms`);
   ```

## 扩展性

### 自定义验证规则

```javascript
// 添加自定义验证规则
const customValidation = await projectStatusChecker.validateProjectStatus({
    requireProject: true,
    customRules: [
        {
            name: 'check_layer_limit',
            description: '检查图层数量限制',
            validator: async (projectInfo) => {
                // 自定义验证逻辑
                if (projectInfo.composition_state && 
                    projectInfo.composition_state.data &&
                    projectInfo.composition_state.data.layerCount > 1000) {
                    return {
                        valid: false,
                        message: '图层数量过多，建议优化项目结构'
                    };
                }
                return { valid: true };
            }
        }
    ]
});
```

### 事件监听

```javascript
// 监听状态变化事件
projectStatusChecker.addEventListener('statuschange', (event) => {
    const { current, previous } = event.detail;
    console.log('状态变化:', { current, previous });
    
    // 更新UI状态显示
    updateStatusDisplay(current);
});

// 监听监控错误事件
projectStatusChecker.addEventListener('monitorerror', (event) => {
    const { error } = event.detail;
    console.error('监控错误:', error);
    
    // 处理监控错误
    handleMonitoringError(error);
});
```