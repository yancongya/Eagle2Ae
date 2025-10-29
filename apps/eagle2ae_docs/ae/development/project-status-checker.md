# Eagle2Ae 项目状态检测器

## 1. 系统概述

项目状态检测器是Eagle2Ae的核心组件之一，负责在执行关键操作前检测After Effects项目和Eagle应用的状态，确保操作的可行性和安全性。在多面板支持架构下，每个面板实例都有独立的状态检测器实例，确保各面板状态检测的独立性和准确性。每个面板实例通过唯一的面板ID进行状态检测，避免面板间的干扰。

### 1.1 多面板架构优势

- **独立性**: 每个面板实例拥有独立的状态检测器，互不干扰
- **准确性**: 针对每个面板的特定状态进行检测，提高准确性
- **性能**: 各面板状态检测并行处理，提升整体性能
- **隔离性**: 面板间状态缓存和日志相互隔离，避免数据污染
- **通信独立性**: 每个面板实例通过独立的HTTP轮询通道与Eagle插件通信，确保消息路由的准确性

### 1.2 主要功能

- **项目状态检测**: 检测AE项目是否打开、合成是否存在
- **连接状态检测**: 检测AE和Eagle的连接状态
- **环境兼容性检测**: 检测CEP环境和Demo模式
- **智能错误处理**: 提供详细的错误信息和解决建议
- **性能优化**: 缓存检测结果，避免重复检测

### 1.2 架构设计

```
项目状态检测器（多面板架构）
├── 面板管理器
│   ├── 面板实例创建
│   ├── 面板资源管理
│   └── 面板生命周期控制
├── 核心检测引擎
│   ├── AE项目检测
│   ├── Eagle连接检测
│   └── 环境状态检测
├── 缓存管理系统
│   ├── 结果缓存（面板隔离）
│   ├── 过期管理
│   └── 内存优化
├── 错误处理系统
│   ├── 错误分类
│   ├── 错误映射
│   └── 恢复策略
└── 集成接口
    ├── 对话框集成
    ├── 日志集成（面板隔离）
    └── 事件通知
```

## 2. 核心检测引擎

### 2.1 项目状态检测器类

```javascript
/**
 * 项目状态检测器
 * 负责检测AE项目状态、Eagle连接状态等
 * 在多面板架构下，每个面板实例拥有独立的检测器实例
 */
class ProjectStatusChecker {
    constructor(csInterface, logger, panelId) {
        this.csInterface = csInterface;
        this.logger = logger;
        this.panelId = panelId; // 面板ID (panel1, panel2, panel3)
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
 * 在多面板架构下，环境检测包含面板ID信息
 */
checkEnvironment() {
    const env = {
        isCEP: false,
        isDemo: false,
        hasCSInterface: false,
        aeVersion: null,
        cepVersion: null,
        panelId: this.panelId // 添加面板ID信息
    };
    
    // 检测CEP环境
    if (typeof CSInterface !== 'undefined' && window.cep) {
        env.isCEP = true;
        env.hasCSInterface = true;
        
        try {
            // 获取AE版本信息
            const hostInfo = this.csInterface.getHostEnvironment();
            env.aeVersion = hostInfo.appVersion;
            env.cepVersion = hostInfo.cepVersion;
        } catch (error) {
            this.logger.warn(`[${this.panelId}][环境检测] 获取主机信息失败:`, error);
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
 * 在多面板架构下，每个面板实例独立检测AE连接状态
 */
async checkAEConnection() {
    const status = {
        connected: false,
        responsive: false,
        version: null,
        error: null,
        responseTime: null,
        panelId: this.panelId // 添加面板ID信息
    };
    
    // Demo模式直接返回模拟状态
    if (this.checkEnvironment().isDemo) {
        return {
            connected: true,
            responsive: true,
            version: 'Demo Mode',
            error: null,
            responseTime: 0,
            panelId: this.panelId
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
        this.logger.error(`[${this.panelId}][AE连接检测] 连接失败:`, error);
    }
    
    return status;
}

/**
 * 执行ExtendScript脚本
 * 在多面板架构下，使用面板特定的CSInterface实例
 */
executeScript(script, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('脚本执行超时'));
        }, timeout);
        
        try {
            this.csInterface.evalScript(script, (result) => {
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
 * 在多面板架构下，每个面板实例独立检测项目状态
 */
async checkProjectState() {
    const status = {
        hasProject: false,
        projectName: null,
        projectPath: null,
        isSaved: false,
        itemCount: 0,
        error: null,
        panelId: this.panelId // 添加面板ID信息
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
        this.logger.error(`[${this.panelId}][项目状态检测] 检测失败:`, error);
    }
    
    return status;
}
```

### 2.5 合成状态检测

```javascript
/**
 * 检测合成状态
 * 在多面板架构下，每个面板实例独立检测合成状态
 */
async checkCompositionState() {
    const status = {
        hasComposition: false,
        activeComp: null,
        compCount: 0,
        layerCount: 0,
        duration: 0,
        frameRate: 0,
        error: null,
        panelId: this.panelId // 添加面板ID信息
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
        this.logger.error(`[${this.panelId}][合成状态检测] 检测失败:`, error);
    }
    
    return status;
}
```

### 2.6 Eagle连接检测

```javascript
/**
 * 检测Eagle应用连接状态
 * 在多面板架构下，每个面板实例独立检测Eagle连接状态
 */
async checkEagleConnection() {
    const status = {
        connected: false,
        version: null,
        apiEndpoint: null,
        responseTime: null,
        error: null,
        panelId: this.panelId // 添加面板ID信息
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
        this.logger.error(`[${this.panelId}][Eagle连接检测] 连接失败:`, error);
    }
    
    return status;
}

/**
 * 测试Eagle API连接
 * 在多面板架构下，每个面板实例独立测试Eagle API
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
 * 在多面板架构下，缓存键包含面板ID以确保各面板缓存独立
 */
cacheResult(key, result) {
    // 为多面板架构添加面板ID前缀
    const cacheKey = this.panelId ? `${this.panelId}_${key}` : key;
    
    this.cache.set(cacheKey, {
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
    // 为多面板架构添加面板ID前缀
    const cacheKey = this.panelId ? `${this.panelId}_${key}` : key;
    
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expires > Date.now()) {
        return cached.data;
    }
    
    // 缓存过期，删除
    this.cache.delete(cacheKey);
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
 * 在多面板架构下，每个面板实例独立管理缓存策略
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
    
    // 在多面板架构下，可以基于面板ID进一步优化缓存策略
    if (this.panelId) {
        // 为不同面板类型调整缓存时间
        switch (this.panelId) {
            case 'panel1':
                timeout *= 1.0; // 主面板使用默认缓存时间
                break;
            case 'panel2':
                timeout *= 0.8; // 辅助面板使用较短缓存时间
                break;
            case 'panel3':
                timeout *= 1.2; // 特殊面板使用较长缓存时间
                break;
        }
    }
    
    return timeout;
}
```

## 4. 错误处理系统

### 4.1 错误分类和映射

```javascript
/**
 * 错误类型定义
 * 在多面板架构下，错误信息包含面板ID以便定位问题
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
 * 在多面板架构下，恢复策略可以针对不同面板进行优化
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
 * 在多面板架构下，建议生成器可以针对不同面板提供定制化建议
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
                priority: error.severity === 'high' ? 1 : 2,
                panelId: this.panelId // 添加面板ID信息
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
                priority: 3,
                panelId: this.panelId // 添加面板ID信息
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
            priority: 4,
            panelId: this.panelId // 添加面板ID信息
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
 * 在多面板架构下，对话框集成可以显示面板ID信息
 */
async function showStatusErrorDialog(statusResult) {
    const primaryError = statusResult.errors[0];
    
    if (!primaryError) return;
    
    const dialogConfig = ERROR_DIALOG_MAP[primaryError.type];
    
    if (dialogConfig) {
        // 在标题中添加面板ID信息
        const title = statusResult.panelId ? 
            `${dialogConfig.title} [${statusResult.panelId}]` : 
            dialogConfig.title;
            
        return await showSmartDialog(
            dialogConfig.type,
            title,
            dialogConfig.message,
            dialogConfig.buttons
        );
    }
}

/**
 * 显示状态总结对话框
 * 在多面板架构下，对话框显示面板ID信息
 */
async function showStatusSummaryDialog(statusResult) {
    const summary = generateStatusSummary(statusResult);
    
    // 在标题中添加面板ID信息
    const title = statusResult.panelId ? 
        `项目状态检查 [${statusResult.panelId}]` : 
        '项目状态检查';
    
    return await showSmartDialog(
        'info',
        title,
        summary,
        ['确定']
    );
}

/**
 * 生成状态总结
 * 在多面板架构下，状态总结包含面板ID信息
 */
function generateStatusSummary(statusResult) {
    const lines = [];
    
    lines.push(`检查时间: ${new Date(statusResult.timestamp).toLocaleTimeString()}`);
    
    // 添加面板ID信息
    if (statusResult.panelId) {
        lines.push(`面板ID: ${statusResult.panelId}`);
    }
    
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
 * 在多面板架构下，日志包含面板ID信息
 */
class StatusLogger {
    constructor(panelId) {
        this.panelId = panelId; // 面板ID (panel1, panel2, panel3)
        this.logs = [];
        this.maxLogs = 100;
    }
    
    /**
     * 记录检测结果
     */
    logStatusCheck(result) {
        const logEntry = {
            timestamp: result.timestamp,
            panelId: this.panelId, // 添加面板ID
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
        const panelInfo = logEntry.panelId ? `[${logEntry.panelId}] ` : '';
        
        console.log(`[${timestamp}] ${panelInfo}${status} 项目状态检查 - AE:${logEntry.aeConnected ? '✓' : '✗'} Eagle:${logEntry.eagleConnected ? '✓' : '✗'} 项目:${logEntry.projectOpen ? '✓' : '✗'} 合成:${logEntry.compositionActive ? '✓' : '✗'}`);
        
        if (logEntry.hasErrors) {
            console.warn(`[${timestamp}] ${panelInfo}发现 ${logEntry.errorCount} 个错误，${logEntry.warningCount} 个警告`);
        }
    }
    
    /**
     * 获取状态统计
     */
    getStatusStats() {
        if (this.logs.length === 0) return null;
        
        const recent = this.logs.slice(-10); // 最近10次检查
        
        return {
            panelId: this.panelId, // 添加面板ID
            totalChecks: this.logs.length,
            recentChecks: recent.length,
            successRate: recent.filter(log => !log.hasErrors).length / recent.length,
            aeConnectionRate: recent.filter(log => log.aeConnected).length / recent.length,
            eagleConnectionRate: recent.filter(log => log.eagleConnected).length / recent.length,
            lastCheck: this.logs[this.logs.length - 1]
        };
    }
}

// 每个面板实例拥有独立的日志记录器
// const statusLogger = new StatusLogger(panelId);
```

## 6. 使用示例

### 6.1 基本使用

```javascript
// 创建检测器实例（多面板架构下需要传递面板ID）
const checker = new ProjectStatusChecker(csInterface, logger, panelId);

// 执行检测
async function performStatusCheck(checker) {
    try {
        const result = await checker.checkProjectStatus();
        
        // 记录日志（包含面板ID信息）
        statusLogger.logStatusCheck(result);
        
        if (result.hasErrors) {
            // 显示错误对话框（包含面板ID信息）
            await showStatusErrorDialog(result);
            return false;
        }
        
        // 检测通过，可以继续操作
        return true;
        
    } catch (error) {
        console.error(`[${checker.panelId}][状态检测] 检测失败:`, error);
        return false;
    }
}
```

### 6.2 集成到操作流程

```javascript
/**
 * 文件导入前的状态检查（多面板架构下每个面板独立检查）
 */
async function importFilesWithStatusCheck(files, panelId) {
    // 1. 创建面板特定的状态检测器
    const checker = new ProjectStatusChecker(csInterface, logger, panelId);
    
    // 2. 执行状态检查
    const statusOK = await performStatusCheck(checker);
    if (!statusOK) {
        return; // 状态检查失败，终止操作
    }
    
    // 3. 继续执行导入操作
    await importFiles(files);
}

/**
 * 图层检测前的状态检查（多面板架构下每个面板独立检查）
 */
async function detectLayersWithStatusCheck(panelId) {
    // 创建面板特定的状态检测器
    const checker = new ProjectStatusChecker(csInterface, logger, panelId);
    const result = await checker.checkProjectStatus();
    
    // 检查是否有合成
    if (!result.info.composition?.hasComposition) {
        await showSmartDialog(
            'warning',
            `合成检查 [${panelId}]`,
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
 * 在多面板架构下，每个面板实例拥有独立的监控器
 */
class StatusMonitor {
    constructor(panelId, csInterface, logger) {
        this.panelId = panelId; // 面板ID (panel1, panel2, panel3)
        this.csInterface = csInterface;
        this.logger = logger;
        this.checker = new ProjectStatusChecker(csInterface, logger, panelId);
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
                this.logger.error(`[状态监控][${this.panelId}] 监控检查失败:`, error);
            }
        }, interval);
        
        this.logger.info(`[状态监控][${this.panelId}] 开始监控，间隔:`, interval + 'ms');
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
        this.logger.info(`[状态监控][${this.panelId}] 停止监控`);
    }
    
    /**
     * 处理状态变化
     */
    handleStatusChange(result) {
        // 这里可以实现状态变化的通知逻辑
        // 例如：AE连接断开时显示通知
        if (!result.info.aeConnection?.connected) {
            this.logger.warn(`[状态监控][${this.panelId}] AE连接已断开`);
        }
    }
}

// 每个面板实例拥有独立的状态监控器
// const statusMonitor = new StatusMonitor(panelId, csInterface, logger);
```

## 7. 性能优化

### 7.1 并发控制

```javascript
/**
 * 并发检测控制
 * 在多面板架构下，每个面板实例独立控制并发检测
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
 * 在多面板架构下，每个面板实例拥有独立的批量检测器
 */
class BatchStatusChecker {
    constructor(panelId, csInterface, logger) {
        this.panelId = panelId; // 面板ID (panel1, panel2, panel3)
        this.csInterface = csInterface;
        this.logger = logger;
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
            // 创建面板特定的状态检测器
            const checker = new ProjectStatusChecker(this.csInterface, this.logger, this.panelId);
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

// 每个面板实例拥有独立的批量检测器
// const batchChecker = new BatchStatusChecker(panelId, csInterface, logger);
```

---

**最后更新**: 2024-01-16  
**维护者**: Eagle2Ae开发团队  
**版本**: 1.0.0  
**更新内容**: 初始版本，包含完整的项目状态检测功能