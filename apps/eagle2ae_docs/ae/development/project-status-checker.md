# Eagle2Ae 项目状态检测器

## 1. 系统概述

项目状态检测器是Eagle2Ae的核心组件之一，负责在执行关键操作前检测After Effects项目和Eagle应用的状态，确保操作的可行性和安全性。

### 1.1 主要功能

- **项目状态检测**: 检测AE项目是否打开、合成是否存在
- **连接状态检测**: 检测AE和Eagle的连接状态
- **环境兼容性检测**: 检测CEP环境和Demo模式
- **智能错误处理**: 提供详细的错误信息和解决建议
- **性能优化**: 缓存检测结果，避免重复检测

### 1.2 架构设计

```
项目状态检测器
├── 核心检测引擎
│   ├── AE项目检测
│   ├── Eagle连接检测
│   └── 环境状态检测
├── 缓存管理系统
│   ├── 结果缓存
│   ├── 过期管理
│   └── 内存优化
├── 错误处理系统
│   ├── 错误分类
│   ├── 错误映射
│   └── 恢复策略
└── 集成接口
    ├── 对话框集成
    ├── 日志集成
    └── 事件通知
```

## 2. 核心检测引擎

### 2.1 项目状态检测器类

```javascript
/**
 * 项目状态检测器
 * 负责检测AE项目状态、Eagle连接状态等
 */
class ProjectStatusChecker {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5000; // 5秒缓存
        this.isChecking = false;
        this.lastCheckTime = 0;
    }
    
    /**
     * 执行完整的项目状态检测
     * @returns {Promise<Object>} 检测结果对象
     */
    async checkProjectStatus() {
        // 防止并发检测
        if (this.isChecking) {
            return this.waitForCurrentCheck();
        }
        
        this.isChecking = true;
        
        try {
            const result = await this.performStatusCheck();
            this.cacheResult('full_status', result);
            return result;
        } finally {
            this.isChecking = false;
            this.lastCheckTime = Date.now();
        }
    }
    
    /**
     * 执行状态检测的核心逻辑
     */
    async performStatusCheck() {
        const result = {
            timestamp: Date.now(),
            hasErrors: false,
            errors: [],
            warnings: [],
            info: {},
            recommendations: []
        };
        
        // 1. 检测运行环境
        const envStatus = this.checkEnvironment();
        result.info.environment = envStatus;
        
        // 2. 检测AE连接状态
        const aeStatus = await this.checkAEConnection();
        result.info.aeConnection = aeStatus;
        
        if (!aeStatus.connected) {
            result.hasErrors = true;
            result.errors.push({
                type: 'CONNECTION_ERROR',
                message: 'After Effects连接失败',
                details: aeStatus.error,
                severity: 'high'
            });
            return result; // AE未连接时不继续检测
        }
        
        // 3. 检测项目状态
        const projectStatus = await this.checkProjectState();
        result.info.project = projectStatus;
        
        if (!projectStatus.hasProject) {
            result.hasErrors = true;
            result.errors.push({
                type: 'NO_PROJECT',
                message: '未检测到打开的项目',
                details: '请先打开一个After Effects项目',
                severity: 'medium'
            });
        }
        
        // 4. 检测合成状态
        const compStatus = await this.checkCompositionState();
        result.info.composition = compStatus;
        
        if (!compStatus.hasComposition) {
            result.hasErrors = true;
            result.errors.push({
                type: 'NO_COMPOSITION',
                message: '未检测到活动合成',
                details: '请先创建或选择一个合成',
                severity: 'medium'
            });
        }
        
        // 5. 检测Eagle连接状态
        const eagleStatus = await this.checkEagleConnection();
        result.info.eagle = eagleStatus;
        
        if (!eagleStatus.connected) {
            result.warnings.push({
                type: 'EAGLE_OFFLINE',
                message: 'Eagle应用未连接',
                details: '某些功能可能无法使用',
                severity: 'low'
            });
        }
        
        // 6. 生成建议
        this.generateRecommendations(result);
        
        return result;
    }
}
```

### 2.2 环境检测

```javascript
/**
 * 检测运行环境
 */
checkEnvironment() {
    const env = {
        isCEP: false,
        isDemo: false,
        hasCSInterface: false,
        aeVersion: null,
        cepVersion: null
    };
    
    // 检测CEP环境
    if (typeof CSInterface !== 'undefined' && window.cep) {
        env.isCEP = true;
        env.hasCSInterface = true;
        
        try {
            // 获取AE版本信息
            const hostInfo = csInterface.getHostEnvironment();
            env.aeVersion = hostInfo.appVersion;
            env.cepVersion = hostInfo.cepVersion;
        } catch (error) {
            console.warn('[环境检测] 获取主机信息失败:', error);
        }
    } else {
        env.isDemo = true;
    }
    
    return env;
}
```

### 2.3 AE连接检测

```javascript
/**
 * 检测After Effects连接状态
 */
async checkAEConnection() {
    const status = {
        connected: false,
        responsive: false,
        version: null,
        error: null,
        responseTime: null
    };
    
    // Demo模式直接返回模拟状态
    if (this.checkEnvironment().isDemo) {
        return {
            connected: true,
            responsive: true,
            version: 'Demo Mode',
            error: null,
            responseTime: 0
        };
    }
    
    try {
        const startTime = Date.now();
        
        // 执行简单的ExtendScript测试
        const testResult = await this.executeScript('app.version');
        
        status.responseTime = Date.now() - startTime;
        
        if (testResult && !testResult.includes('EvalScript error')) {
            status.connected = true;
            status.responsive = true;
            status.version = testResult.replace(/"/g, '');
        } else {
            status.error = 'ExtendScript执行失败';
        }
        
    } catch (error) {
        status.error = error.message;
    }
    
    return status;
}

/**
 * 执行ExtendScript脚本
 */
executeScript(script, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('脚本执行超时'));
        }, timeout);
        
        try {
            csInterface.evalScript(script, (result) => {
                clearTimeout(timer);
                resolve(result);
            });
        } catch (error) {
            clearTimeout(timer);
            reject(error);
        }
    });
}
```

### 2.4 项目状态检测

```javascript
/**
 * 检测AE项目状态
 */
async checkProjectState() {
    const status = {
        hasProject: false,
        projectName: null,
        projectPath: null,
        isSaved: false,
        itemCount: 0,
        error: null
    };
    
    try {
        // 检测项目是否存在
        const projectInfo = await this.executeScript(`
            try {
                var project = app.project;
                if (project) {
                    JSON.stringify({
                        hasProject: true,
                        projectName: project.file ? project.file.name : "未保存的项目",
                        projectPath: project.file ? project.file.fsName : null,
                        isSaved: project.file !== null,
                        itemCount: project.items.length
                    });
                } else {
                    JSON.stringify({hasProject: false});
                }
            } catch (error) {
                JSON.stringify({hasProject: false, error: error.message});
            }
        `);
        
        const parsed = JSON.parse(projectInfo);
        Object.assign(status, parsed);
        
    } catch (error) {
        status.error = error.message;
    }
    
    return status;
}
```

### 2.5 合成状态检测

```javascript
/**
 * 检测合成状态
 */
async checkCompositionState() {
    const status = {
        hasComposition: false,
        activeComp: null,
        compCount: 0,
        layerCount: 0,
        duration: 0,
        frameRate: 0,
        error: null
    };
    
    try {
        const compInfo = await this.executeScript(`
            try {
                var project = app.project;
                var activeComp = project.activeItem;
                var compCount = 0;
                
                // 统计合成数量
                for (var i = 1; i <= project.items.length; i++) {
                    if (project.items[i] instanceof CompItem) {
                        compCount++;
                    }
                }
                
                if (activeComp && activeComp instanceof CompItem) {
                    JSON.stringify({
                        hasComposition: true,
                        activeComp: {
                            name: activeComp.name,
                            width: activeComp.width,
                            height: activeComp.height,
                            duration: activeComp.duration,
                            frameRate: activeComp.frameRate
                        },
                        compCount: compCount,
                        layerCount: activeComp.layers.length
                    });
                } else {
                    JSON.stringify({
                        hasComposition: false,
                        compCount: compCount
                    });
                }
            } catch (error) {
                JSON.stringify({hasComposition: false, error: error.message});
            }
        `);
        
        const parsed = JSON.parse(compInfo);
        Object.assign(status, parsed);
        
    } catch (error) {
        status.error = error.message;
    }
    
    return status;
}
```

### 2.6 Eagle连接检测

```javascript
/**
 * 检测Eagle应用连接状态
 */
async checkEagleConnection() {
    const status = {
        connected: false,
        version: null,
        apiEndpoint: null,
        responseTime: null,
        error: null
    };
    
    try {
        const startTime = Date.now();
        
        // 尝试连接Eagle API
        const response = await this.testEagleAPI();
        
        status.responseTime = Date.now() - startTime;
        
        if (response.success) {
            status.connected = true;
            status.version = response.version;
            status.apiEndpoint = response.endpoint;
        } else {
            status.error = response.error;
        }
        
    } catch (error) {
        status.error = error.message;
    }
    
    return status;
}

/**
 * 测试Eagle API连接
 */
async testEagleAPI() {
    // 这里应该实现实际的Eagle API测试逻辑
    // 目前返回模拟结果
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: Math.random() > 0.3, // 70%成功率模拟
                version: '3.0.0',
                endpoint: 'http://localhost:41595',
                error: Math.random() > 0.3 ? null : 'Eagle应用未运行'
            });
        }, 100);
    });
}
```

## 3. 缓存管理系统

### 3.1 结果缓存

```javascript
/**
 * 缓存检测结果
 */
cacheResult(key, result) {
    this.cache.set(key, {
        data: result,
        timestamp: Date.now(),
        expires: Date.now() + this.cacheTimeout
    });
    
    // 清理过期缓存
    this.cleanupExpiredCache();
}

/**
 * 获取缓存结果
 */
getCachedResult(key) {
    const cached = this.cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }
    
    // 缓存过期，删除
    this.cache.delete(key);
    return null;
}

/**
 * 清理过期缓存
 */
cleanupExpiredCache() {
    const now = Date.now();
    
    for (const [key, cached] of this.cache.entries()) {
        if (cached.expires <= now) {
            this.cache.delete(key);
        }
    }
}
```

### 3.2 智能缓存策略

```javascript
/**
 * 智能缓存策略
 * 根据检测类型和结果动态调整缓存时间
 */
getOptimalCacheTimeout(checkType, result) {
    const baseTimes = {
        'environment': 60000,    // 环境检测：1分钟
        'ae_connection': 10000,  // AE连接：10秒
        'project_state': 5000,   // 项目状态：5秒
        'composition': 3000,     // 合成状态：3秒
        'eagle_connection': 15000 // Eagle连接：15秒
    };
    
    let timeout = baseTimes[checkType] || 5000;
    
    // 如果检测失败，缩短缓存时间以便快速重试
    if (result.hasErrors) {
        timeout = Math.min(timeout, 2000);
    }
    
    // 如果检测成功且稳定，可以适当延长缓存时间
    if (!result.hasErrors && !result.warnings.length) {
        timeout = Math.min(timeout * 1.5, 30000);
    }
    
    return timeout;
}
```

## 4. 错误处理系统

### 4.1 错误分类和映射

```javascript
/**
 * 错误类型定义
 */
const ERROR_TYPES = {
    // 连接错误
    CONNECTION_ERROR: {
        code: 'E001',
        severity: 'high',
        category: 'connection',
        recoverable: true
    },
    
    // 项目错误
    NO_PROJECT: {
        code: 'E002',
        severity: 'medium',
        category: 'project',
        recoverable: true
    },
    
    NO_COMPOSITION: {
        code: 'E003',
        severity: 'medium',
        category: 'composition',
        recoverable: true
    },
    
    // Eagle错误
    EAGLE_OFFLINE: {
        code: 'W001',
        severity: 'low',
        category: 'eagle',
        recoverable: true
    },
    
    // 系统错误
    SYSTEM_ERROR: {
        code: 'E999',
        severity: 'critical',
        category: 'system',
        recoverable: false
    }
};

/**
 * 错误恢复策略
 */
const RECOVERY_STRATEGIES = {
    CONNECTION_ERROR: [
        '检查After Effects是否正在运行',
        '重启After Effects应用',
        '检查CEP扩展是否正确安装',
        '重启计算机'
    ],
    
    NO_PROJECT: [
        '打开一个现有的AE项目文件',
        '创建一个新的项目',
        '检查项目文件是否损坏'
    ],
    
    NO_COMPOSITION: [
        '创建一个新的合成',
        '选择现有的合成',
        '检查项目中是否有合成'
    ],
    
    EAGLE_OFFLINE: [
        '启动Eagle应用',
        '检查Eagle是否正确安装',
        '重启Eagle应用'
    ]
};
```

### 4.2 建议生成器

```javascript
/**
 * 生成操作建议
 */
generateRecommendations(result) {
    const recommendations = [];
    
    // 根据错误类型生成建议
    result.errors.forEach(error => {
        const strategies = RECOVERY_STRATEGIES[error.type];
        if (strategies) {
            recommendations.push({
                type: 'error_recovery',
                title: `解决${error.message}`,
                actions: strategies,
                priority: error.severity === 'high' ? 1 : 2
            });
        }
    });
    
    // 根据警告生成建议
    result.warnings.forEach(warning => {
        const strategies = RECOVERY_STRATEGIES[warning.type];
        if (strategies) {
            recommendations.push({
                type: 'warning_resolution',
                title: `改善${warning.message}`,
                actions: strategies,
                priority: 3
            });
        }
    });
    
    // 性能优化建议
    if (result.info.aeConnection && result.info.aeConnection.responseTime > 1000) {
        recommendations.push({
            type: 'performance',
            title: '优化AE响应速度',
            actions: [
                '关闭不必要的AE面板',
                '清理AE缓存',
                '减少项目复杂度',
                '增加系统内存'
            ],
            priority: 4
        });
    }
    
    // 按优先级排序
    recommendations.sort((a, b) => a.priority - b.priority);
    
    result.recommendations = recommendations;
}
```

## 5. 集成接口

### 5.1 对话框集成

```javascript
/**
 * 与对话框系统集成
 */
async function showStatusErrorDialog(statusResult) {
    const primaryError = statusResult.errors[0];
    
    if (!primaryError) return;
    
    const dialogConfig = ERROR_DIALOG_MAP[primaryError.type];
    
    if (dialogConfig) {
        return await showSmartDialog(
            dialogConfig.type,
            dialogConfig.title,
            dialogConfig.message,
            dialogConfig.buttons
        );
    }
}

/**
 * 显示状态总结对话框
 */
async function showStatusSummaryDialog(statusResult) {
    const summary = generateStatusSummary(statusResult);
    
    return await showSmartDialog(
        'info',
        '项目状态检查',
        summary,
        ['确定']
    );
}

/**
 * 生成状态总结
 */
function generateStatusSummary(statusResult) {
    const lines = [];
    
    lines.push(`检查时间: ${new Date(statusResult.timestamp).toLocaleTimeString()}`);
    
    if (statusResult.info.environment) {
        const env = statusResult.info.environment;
        lines.push(`运行环境: ${env.isCEP ? 'CEP' : 'Demo'}`);
        if (env.aeVersion) {
            lines.push(`AE版本: ${env.aeVersion}`);
        }
    }
    
    if (statusResult.info.project) {
        const proj = statusResult.info.project;
        lines.push(`项目状态: ${proj.hasProject ? '已打开' : '未打开'}`);
        if (proj.projectName) {
            lines.push(`项目名称: ${proj.projectName}`);
        }
    }
    
    if (statusResult.info.composition) {
        const comp = statusResult.info.composition;
        lines.push(`合成状态: ${comp.hasComposition ? '已选择' : '未选择'}`);
        if (comp.activeComp) {
            lines.push(`活动合成: ${comp.activeComp.name}`);
        }
    }
    
    if (statusResult.errors.length > 0) {
        lines.push('');
        lines.push('发现问题:');
        statusResult.errors.forEach(error => {
            lines.push(`• ${error.message}`);
        });
    }
    
    return lines.join('\n');
}
```

### 5.2 日志集成

```javascript
/**
 * 日志记录器
 */
class StatusLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
    }
    
    /**
     * 记录检测结果
     */
    logStatusCheck(result) {
        const logEntry = {
            timestamp: result.timestamp,
            hasErrors: result.hasErrors,
            errorCount: result.errors.length,
            warningCount: result.warnings.length,
            environment: result.info.environment?.isCEP ? 'CEP' : 'Demo',
            aeConnected: result.info.aeConnection?.connected || false,
            eagleConnected: result.info.eagle?.connected || false,
            projectOpen: result.info.project?.hasProject || false,
            compositionActive: result.info.composition?.hasComposition || false
        };
        
        this.logs.push(logEntry);
        
        // 保持日志数量限制
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // 输出到控制台
        this.outputToConsole(logEntry);
    }
    
    /**
     * 输出到控制台
     */
    outputToConsole(logEntry) {
        const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
        const status = logEntry.hasErrors ? '❌' : '✅';
        
        console.log(`[${timestamp}] ${status} 项目状态检查 - AE:${logEntry.aeConnected ? '✓' : '✗'} Eagle:${logEntry.eagleConnected ? '✓' : '✗'} 项目:${logEntry.projectOpen ? '✓' : '✗'} 合成:${logEntry.compositionActive ? '✓' : '✗'}`);
        
        if (logEntry.hasErrors) {
            console.warn(`[${timestamp}] 发现 ${logEntry.errorCount} 个错误，${logEntry.warningCount} 个警告`);
        }
    }
    
    /**
     * 获取状态统计
     */
    getStatusStats() {
        if (this.logs.length === 0) return null;
        
        const recent = this.logs.slice(-10); // 最近10次检查
        
        return {
            totalChecks: this.logs.length,
            recentChecks: recent.length,
            successRate: recent.filter(log => !log.hasErrors).length / recent.length,
            aeConnectionRate: recent.filter(log => log.aeConnected).length / recent.length,
            eagleConnectionRate: recent.filter(log => log.eagleConnected).length / recent.length,
            lastCheck: this.logs[this.logs.length - 1]
        };
    }
}

// 全局日志记录器实例
const statusLogger = new StatusLogger();
```

## 6. 使用示例

### 6.1 基本使用

```javascript
// 创建检测器实例
const checker = new ProjectStatusChecker();

// 执行检测
async function performStatusCheck() {
    try {
        const result = await checker.checkProjectStatus();
        
        // 记录日志
        statusLogger.logStatusCheck(result);
        
        if (result.hasErrors) {
            // 显示错误对话框
            await showStatusErrorDialog(result);
            return false;
        }
        
        // 检测通过，可以继续操作
        return true;
        
    } catch (error) {
        console.error('[状态检测] 检测失败:', error);
        return false;
    }
}
```

### 6.2 集成到操作流程

```javascript
/**
 * 文件导入前的状态检查
 */
async function importFilesWithStatusCheck(files) {
    // 1. 执行状态检查
    const statusOK = await performStatusCheck();
    if (!statusOK) {
        return; // 状态检查失败，终止操作
    }
    
    // 2. 继续执行导入操作
    await importFiles(files);
}

/**
 * 图层检测前的状态检查
 */
async function detectLayersWithStatusCheck() {
    const checker = new ProjectStatusChecker();
    const result = await checker.checkProjectStatus();
    
    // 检查是否有合成
    if (!result.info.composition?.hasComposition) {
        await showSmartDialog(
            'warning',
            '合成检查',
            '请先创建一个合成后重试',
            ['确定']
        );
        return;
    }
    
    // 继续执行图层检测
    await detectLayers();
}
```

### 6.3 定期状态监控

```javascript
/**
 * 状态监控器
 */
class StatusMonitor {
    constructor() {
        this.checker = new ProjectStatusChecker();
        this.monitorInterval = null;
        this.isMonitoring = false;
    }
    
    /**
     * 开始监控
     */
    startMonitoring(interval = 30000) { // 默认30秒
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitorInterval = setInterval(async () => {
            try {
                const result = await this.checker.checkProjectStatus();
                statusLogger.logStatusCheck(result);
                
                // 如果状态发生重大变化，通知用户
                this.handleStatusChange(result);
                
            } catch (error) {
                console.error('[状态监控] 监控检查失败:', error);
            }
        }, interval);
        
        console.log('[状态监控] 开始监控，间隔:', interval + 'ms');
    }
    
    /**
     * 停止监控
     */
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        this.isMonitoring = false;
        console.log('[状态监控] 停止监控');
    }
    
    /**
     * 处理状态变化
     */
    handleStatusChange(result) {
        // 这里可以实现状态变化的通知逻辑
        // 例如：AE连接断开时显示通知
        if (!result.info.aeConnection?.connected) {
            console.warn('[状态监控] AE连接已断开');
        }
    }
}

// 全局状态监控器
const statusMonitor = new StatusMonitor();
```

## 7. 性能优化

### 7.1 并发控制

```javascript
/**
 * 并发检测控制
 */
async function waitForCurrentCheck() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (!this.isChecking) {
                clearInterval(checkInterval);
                // 返回最近的缓存结果
                const cached = this.getCachedResult('full_status');
                resolve(cached || { hasErrors: true, errors: [{ type: 'SYSTEM_ERROR', message: '检测超时' }] });
            }
        }, 100);
        
        // 超时保护
        setTimeout(() => {
            clearInterval(checkInterval);
            resolve({ hasErrors: true, errors: [{ type: 'SYSTEM_ERROR', message: '检测超时' }] });
        }, 10000);
    });
}
```

### 7.2 批量检测优化

```javascript
/**
 * 批量检测优化
 * 将多个检测请求合并为一次检测
 */
class BatchStatusChecker {
    constructor() {
        this.pendingChecks = [];
        this.batchTimeout = null;
        this.batchDelay = 100; // 100ms内的请求合并
    }
    
    /**
     * 请求状态检查
     */
    requestStatusCheck() {
        return new Promise((resolve) => {
            this.pendingChecks.push(resolve);
            
            // 设置批量处理延迟
            if (this.batchTimeout) {
                clearTimeout(this.batchTimeout);
            }
            
            this.batchTimeout = setTimeout(() => {
                this.processBatch();
            }, this.batchDelay);
        });
    }
    
    /**
     * 处理批量请求
     */
    async processBatch() {
        const checks = this.pendingChecks.splice(0);
        
        if (checks.length === 0) return;
        
        try {
            const checker = new ProjectStatusChecker();
            const result = await checker.checkProjectStatus();
            
            // 将结果返回给所有等待的请求
            checks.forEach(resolve => resolve(result));
            
        } catch (error) {
            const errorResult = {
                hasErrors: true,
                errors: [{ type: 'SYSTEM_ERROR', message: error.message }]
            };
            
            checks.forEach(resolve => resolve(errorResult));
        }
    }
}

// 全局批量检测器
const batchChecker = new BatchStatusChecker();
```

---

**最后更新**: 2024-01-16  
**维护者**: Eagle2Ae开发团队  
**版本**: 1.0.0  
**更新内容**: 初始版本，包含完整的项目状态检测功能