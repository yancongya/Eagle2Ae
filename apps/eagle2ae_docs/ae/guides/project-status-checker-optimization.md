# 项目状态检测器性能优化与故障排除指南

## 性能优化

### 结果缓存

状态检测器使用智能缓存机制提高性能：

```javascript
// 缓存配置
const checker = new ProjectStatusChecker();
checker.cacheTimeout = 5000; // 缓存5秒

// 手动缓存管理
checker.cacheResult('project_state', result);
const cached = checker.getCachedResult('project_state');

// 清除特定缓存
checker.clearCache('ae_connection');

// 清除所有缓存
checker.clearAllCache();
```

**缓存策略**:
- **环境检测**: 缓存 30 秒（环境变化较少）
- **AE 连接**: 缓存 5 秒（需要及时反映连接状态）
- **项目状态**: 缓存 3 秒（项目状态变化频繁）
- **Eagle 连接**: 缓存 10 秒（连接相对稳定）

### 批量检测优化

使用批量检测器处理并发请求：

```javascript
const batchChecker = new BatchStatusChecker();

// 多个组件同时请求状态检测
const result1 = batchChecker.requestStatusCheck();
const result2 = batchChecker.requestStatusCheck();
const result3 = batchChecker.requestStatusCheck();

// 实际只执行一次检测，所有请求共享结果
const [r1, r2, r3] = await Promise.all([result1, result2, result3]);

// 配置批量处理参数
batchChecker.setBatchDelay(100); // 100ms 内的请求合并处理
batchChecker.setMaxBatchSize(10); // 最大批处理大小
```

### 状态监控

启用持续状态监控：

```javascript
const statusMonitor = new StatusMonitor();

// 开始监控（每30秒检测一次）
statusMonitor.startMonitoring(30000);

// 监听状态变化
statusMonitor.on('statusChange', (result) => {
    if (result.hasErrors) {
        console.warn('检测到状态变化，存在错误');
        // 自动显示通知
        showStatusNotification(result);
    }
});

// 监听特定状态变化
statusMonitor.on('aeDisconnected', () => {
    console.error('AE 连接断开');
    showReconnectDialog();
});

statusMonitor.on('projectClosed', () => {
    console.warn('项目已关闭');
    updateUIState('no-project');
});

// 停止监控
statusMonitor.stopMonitoring();
```

**监控事件**:
- `statusChange`: 任何状态变化
- `aeConnected` / `aeDisconnected`: AE 连接状态变化
- `projectOpened` / `projectClosed`: 项目打开/关闭
- `compositionChanged`: 活动合成变化
- `eagleConnected` / `eagleDisconnected`: Eagle 连接状态变化

## 错误处理策略

### 错误分类

状态检测器将错误分为不同级别：

```javascript
// 错误级别定义
const ErrorLevels = {
    CRITICAL: 'critical',    // 严重错误，无法继续操作
    WARNING: 'warning',      // 警告，可能影响功能
    INFO: 'info'            // 信息提示，不影响操作
};

// 错误类型定义
const ErrorTypes = {
    CONNECTION: 'connection',     // 连接错误
    PROJECT: 'project',          // 项目错误
    PERMISSION: 'permission',    // 权限错误
    PERFORMANCE: 'performance',  // 性能问题
    COMPATIBILITY: 'compatibility' // 兼容性问题
};
```

### 自动恢复

实现智能的错误恢复机制：

```javascript
class AutoRecoveryManager {
    constructor(checker) {
        this.checker = checker;
        this.recoveryStrategies = new Map();
        this.setupRecoveryStrategies();
    }
    
    setupRecoveryStrategies() {
        // AE 连接恢复策略
        this.recoveryStrategies.set('ae_connection_failed', async () => {
            console.log('尝试恢复 AE 连接...');
            
            // 1. 等待 2 秒后重试
            await this.delay(2000);
            
            // 2. 重新检测连接
            const result = await this.checker.checkAEConnection();
            
            if (result.connected) {
                console.log('AE 连接已恢复');
                return { success: true, message: 'AE 连接已恢复' };
            }
            
            // 3. 尝试重启 ExtendScript 引擎
            await this.restartExtendScript();
            
            // 4. 再次检测
            const retryResult = await this.checker.checkAEConnection();
            
            return {
                success: retryResult.connected,
                message: retryResult.connected ? 'AE 连接已恢复' : '无法恢复 AE 连接'
            };
        });
        
        // Eagle 连接恢复策略
        this.recoveryStrategies.set('eagle_connection_failed', async () => {
            console.log('尝试恢复 Eagle 连接...');
            
            // 检查 Eagle 是否在运行
            const isRunning = await this.checkEagleProcess();
            
            if (!isRunning) {
                return {
                    success: false,
                    message: 'Eagle 应用未运行，请启动 Eagle',
                    action: 'start_eagle'
                };
            }
            
            // 尝试重新连接
            await this.delay(1000);
            const result = await this.checker.checkEagleConnection();
            
            return {
                success: result.connected,
                message: result.connected ? 'Eagle 连接已恢复' : '无法恢复 Eagle 连接'
            };
        });
    }
    
    async attemptRecovery(errorType) {
        const strategy = this.recoveryStrategies.get(errorType);
        
        if (strategy) {
            try {
                return await strategy();
            } catch (error) {
                console.error(`恢复策略执行失败 (${errorType}):`, error);
                return { success: false, message: '恢复失败' };
            }
        }
        
        return { success: false, message: '没有可用的恢复策略' };
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async restartExtendScript() {
        // 实现 ExtendScript 引擎重启逻辑
        console.log('重启 ExtendScript 引擎...');
    }
    
    async checkEagleProcess() {
        // 检查 Eagle 进程是否在运行
        return true; // 简化实现
    }
}
```

## 最佳实践

### 关键操作前检测

在执行重要操作前始终进行状态检测：

```javascript
// 文件导入前检测
async function importFiles(files) {
    const checker = new ProjectStatusChecker();
    const status = await checker.checkProjectStatus();
    
    if (!status.info.project?.hasProject) {
        const userChoice = await showDialog('需要打开项目', '请先打开或创建一个项目');
        if (userChoice === 'create') {
            await createNewProject();
        } else if (userChoice === 'open') {
            await openProjectDialog();
        } else {
            return;
        }
    }
    
    // 继续导入流程...
}

// 渲染前检测
async function startRender() {
    const checker = new ProjectStatusChecker();
    const status = await checker.checkProjectStatus();
    
    if (status.warnings.some(w => w.type === 'performance')) {
        const proceed = await showPerformanceWarningDialog(status);
        if (!proceed) return;
    }
    
    // 继续渲染流程...
}
```

### 合理使用缓存

根据操作频率合理配置缓存：

```javascript
// 高频操作使用较长缓存
const uiChecker = new ProjectStatusChecker();
uiChecker.cacheTimeout = 10000; // UI 更新可以使用 10 秒缓存

// 关键操作使用较短缓存
const importChecker = new ProjectStatusChecker();
importChecker.cacheTimeout = 2000; // 导入操作使用 2 秒缓存

// 实时操作不使用缓存
const realtimeChecker = new ProjectStatusChecker();
realtimeChecker.cacheTimeout = 0; // 实时检测不使用缓存
```

### 优雅的错误提示

提供用户友好的错误信息：

```javascript
function formatErrorMessage(error) {
    const messages = {
        'ae_not_running': {
            title: 'After Effects 未运行',
            message: '请启动 After Effects 后重试',
            actions: ['启动 AE', '重试', '取消']
        },
        'project_not_open': {
            title: '未打开项目',
            message: '请先打开一个项目或创建新项目',
            actions: ['打开项目', '新建项目', '取消']
        },
        'eagle_not_running': {
            title: 'Eagle 未运行',
            message: '请启动 Eagle 应用后重试',
            actions: ['启动 Eagle', '重试', '取消']
        }
    };
    
    return messages[error.code] || {
        title: '未知错误',
        message: error.message,
        actions: ['重试', '取消']
    };
}
```

### 性能监控

监控检测器性能并优化：

```javascript
class StatusCheckerProfiler {
    constructor() {
        this.metrics = new Map();
    }
    
    startTimer(operation) {
        this.metrics.set(operation, Date.now());
    }
    
    endTimer(operation) {
        const startTime = this.metrics.get(operation);
        if (startTime) {
            const duration = Date.now() - startTime;
            console.log(`[性能] ${operation} 耗时: ${duration}ms`);
            
            // 记录性能警告
            if (duration > 5000) {
                console.warn(`[性能警告] ${operation} 耗时过长: ${duration}ms`);
            }
            
            this.metrics.delete(operation);
            return duration;
        }
        return 0;
    }
}

// 使用示例
const profiler = new StatusCheckerProfiler();

async function profiledStatusCheck() {
    profiler.startTimer('full_status_check');
    
    const checker = new ProjectStatusChecker();
    const result = await checker.checkProjectStatus();
    
    profiler.endTimer('full_status_check');
    
    return result;
}
```

## 演示模式支持

在演示模式下，状态检测器提供模拟功能：

```javascript
class DemoStatusChecker extends ProjectStatusChecker {
    constructor() {
        super();
        this.demoMode = true;
        this.demoScenarios = new Map();
        this.setupDemoScenarios();
    }
    
    setupDemoScenarios() {
        // 正常状态场景
        this.demoScenarios.set('normal', {
            hasErrors: false,
            info: {
                environment: { isCEP: false, isDemo: true },
                aeConnection: { connected: true, responseTime: 120 },
                project: { hasProject: true, projectName: '演示项目.aep' },
                composition: { hasActiveComp: true, name: '主合成' },
                eagle: { connected: true, version: '3.0.2' }
            }
        });
        
        // 错误状态场景
        this.demoScenarios.set('ae_disconnected', {
            hasErrors: true,
            errors: [{
                type: 'connection',
                level: 'critical',
                message: 'After Effects 连接断开'
            }]
        });
    }
    
    async checkProjectStatus() {
        // 在演示模式下返回预设场景
        const scenario = this.getCurrentScenario();
        return this.demoScenarios.get(scenario) || this.demoScenarios.get('normal');
    }
    
    getCurrentScenario() {
        // 根据演示需要返回不同场景
        return 'normal';
    }
}
```

## 故障排除

### 常见问题

**Q: 状态检测总是失败**
A: 检查以下项目：
1. After Effects 是否正在运行
2. CEP 扩展是否正确安装
3. 防火墙是否阻止了通信
4. AE 脚本执行权限是否开启

**Q: 检测速度很慢**
A: 优化建议：
1. 调整缓存超时时间
2. 使用批量检测器
3. 启用状态监控减少主动检测
4. 检查网络连接质量

**Q: Eagle 连接检测失败**
A: 解决步骤：
1. 确认 Eagle 应用正在运行
2. 检查 Eagle API 设置
3. 验证网络连接
4. 重启 Eagle 应用

### 调试技巧

启用详细日志：

```javascript
// 启用调试模式
const checker = new ProjectStatusChecker();
checker.enableDebugMode(true);

// 设置日志级别
checker.setLogLevel('debug');

// 监听调试事件
checker.on('debug', (message) => {
    console.log(`[调试] ${message}`);
});
```

使用性能分析：

```javascript
// 启用性能分析
checker.enableProfiling(true);

// 获取性能报告
const report = checker.getPerformanceReport();
console.log('性能报告:', report);
```