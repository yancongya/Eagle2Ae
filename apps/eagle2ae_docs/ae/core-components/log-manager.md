# 日志管理器

## 概述

日志管理器（Log Manager）是 Eagle2Ae AE 扩展 v2.4.0 的核心组件，负责管理和记录扩展运行过程中的所有日志信息。该组件提供了多级日志记录、日志过滤、日志持久化、性能监控等功能，支持实时日志查看和历史日志检索。

## 核心特性

### 多级日志系统
- **调试日志** - 详细的调试信息，用于开发和故障排除
- **信息日志** - 重要的操作信息和状态变化
- **警告日志** - 潜在问题和非关键错误
- **错误日志** - 严重错误和异常信息

### 智能日志过滤
- **级别过滤** - 根据日志级别过滤显示
- **模块过滤** - 按功能模块过滤日志
- **关键词过滤** - 根据关键词搜索日志
- **时间范围过滤** - 按时间范围检索日志

### 日志持久化
- **本地存储** - 日志自动保存到本地存储
- **文件导出** - 支持将日志导出为文件
- **容量管理** - 自动管理日志存储容量
- **压缩存储** - 可选的日志压缩功能

### 实时监控
- **性能监控** - 监控关键操作的性能指标
- **内存使用** - 跟踪内存使用情况
- **错误率统计** - 统计错误发生频率
- **操作计数** - 记录各种操作的发生次数

## 技术实现

### 核心类结构

```javascript
/**
 * 日志管理器
 * 负责管理和记录扩展的所有日志信息，支持多级日志、过滤、持久化等功能
 */
class LogManager {
    /**
     * 构造函数
     * @param {Object} aeExtension - AE扩展实例
     */
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.csInterface = aeExtension.csInterface;
        
        // 日志配置
        this.config = {
            maxLogEntries: 10000, // 最大日志条目数
            logLevel: 'info', // 默认日志级别
            enableConsoleOutput: true, // 是否输出到控制台
            enableStorage: true, // 是否保存到存储
            enablePerformance: true, // 是否开启性能监控
            logToFile: false, // 是否保存到文件
            fileLogLevel: 'error', // 文件日志级别
            retentionDays: 7, // 日志保留天数
            enableCompression: false // 是否启用压缩
        };
        
        // 日志级别定义
        this.logLevels = {
            'debug': 0,
            'info': 1,
            'success': 1.5,
            'warning': 2,
            'error': 3,
            'critical': 4
        };
        
        // 当前日志条目
        this.logEntries = [];
        
        // 性能监控数据
        this.performanceData = new Map();
        
        // 模块统计
        this.moduleStats = new Map();
        
        // 错误统计
        this.errorStats = {
            total: 0,
            byType: new Map(),
            byModule: new Map(),
            lastError: null,
            errorRate: 0
        };
        
        // 操作计数
        this.operationCounters = new Map();
        
        // 当前会话统计
        this.sessionStats = {
            startTime: Date.now(),
            logCount: 0,
            errorCount: 0,
            infoCount: 0,
            warningCount: 0,
            debugCount: 0,
            performanceCount: 0
        };
        
        // 日志观察者
        this.logObservers = [];
        
        // 绑定方法上下文
        this.log = this.log.bind(this);
        this.debug = this.debug.bind(this);
        this.info = this.info.bind(this);
        this.success = this.success.bind(this);
        this.warning = this.warning.bind(this);
        this.error = this.error.bind(this);
        this.critical = this.critical.bind(this);
        this.addLogObserver = this.addLogObserver.bind(this);
        this.removeLogObserver = this.removeLogObserver.bind(this);
        this.getLogEntries = this.getLogEntries.bind(this);
        this.clearLogs = this.clearLogs.bind(this);
        this.exportLogs = this.exportLogs.bind(this);
        this.importLogs = this.importLogs.bind(this);
        this.getPerformanceData = this.getPerformanceData.bind(this);
        this.startPerformanceTimer = this.startPerformanceTimer.bind(this);
        this.endPerformanceTimer = this.endPerformanceTimer.bind(this);
        this.getStats = this.getStats.bind(this);
        
        this.log(' Logging Manager initialized', 'debug');
    }
}
```

### 日志记录方法

```javascript
/**
 * 记录日志
 * @param {string} message - 日志消息
 * @param {string} level - 日志级别
 * @param {Object} options - 日志选项
 * @param {string} options.module - 模块名称
 * @param {string} options.category - 日志类别
 * @param {Object} options.data - 附加数据
 * @param {string} options.userId - 用户ID
 * @param {string} options.sessionId - 会话ID
 */
log(message, level = 'info', options = {}) {
    try {
        const logLevelValue = this.logLevels[level];
        const currentLogLevelValue = this.logLevels[this.config.logLevel];
        
        // 检查日志级别
        if (logLevelValue === undefined || logLevelValue < currentLogLevelValue) {
            return;
        }
        
        const timestamp = Date.now();
        const logEntry = {
            id: this.generateLogId(),
            timestamp: timestamp,
            level: level,
            message: message,
            module: options.module || 'general',
            category: options.category || 'default',
            data: options.data || null,
            userId: options.userId || this.getCurrentUserId(),
            sessionId: options.sessionId || this.getCurrentSessionId(),
            stack: options.includeStack ? this.getCallStack() : null
        };
        
        // 添加到日志条目
        this.logEntries.push(logEntry);
        
        // 限制日志条目数量
        if (this.logEntries.length > this.config.maxLogEntries) {
            this.logEntries = this.logEntries.slice(-this.config.maxLogEntries);
        }
        
        // 更新统计信息
        this.updateStats(logEntry);
        
        // 输出到控制台
        if (this.config.enableConsoleOutput) {
            this.outputToConsole(logEntry);
        }
        
        // 保存到存储
        if (this.config.enableStorage) {
            this.saveToStorage();
        }
        
        // 记录到文件（如果启用且级别符合要求）
        if (this.config.logToFile && logLevelValue >= this.logLevels[this.config.fileLogLevel]) {
            this.logToFile(logEntry);
        }
        
        // 通知观察者
        this.notifyLogObservers(logEntry);
        
        // 如果是错误日志，更新错误统计
        if (level === 'error' || level === 'critical') {
            this.updateErrorStats(logEntry);
        }
        
    } catch (error) {
        console.error('Failed to log message:', error.message);
    }
}

/**
 * 记录调试日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
debug(message, options = {}) {
    this.log(message, 'debug', options);
}

/**
 * 记录信息日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
info(message, options = {}) {
    this.log(message, 'info', options);
}

/**
 * 记录成功日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
success(message, options = {}) {
    this.log(message, 'success', options);
}

/**
 * 记录警告日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
warning(message, options = {}) {
    this.log(message, 'warning', options);
}

/**
 * 记录错误日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
error(message, options = {}) {
    this.log(message, 'error', options);
}

/**
 * 记录严重错误日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
critical(message, options = {}) {
    this.log(message, 'critical', options);
}

/**
 * 生成日志ID
 * @returns {string} 日志ID
 */
generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取当前用户ID
 * @returns {string} 用户ID
 */
getCurrentUserId() {
    try {
        return localStorage.getItem('userId') || 'anonymous';
    } catch (error) {
        return 'anonymous';
    }
}

/**
 * 获取当前会话ID
 * @returns {string} 会话ID
 */
getCurrentSessionId() {
    if (!this.sessionId) {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return this.sessionId;
}

/**
 * 获取调用堆栈
 * @param {number} skipFrames - 跳过的帧数
 * @returns {string} 调用堆栈
 */
getCallStack(skipFrames = 2) {
    try {
        const stack = new Error().stack;
        if (!stack) return null;
        
        const lines = stack.split('\n');
        // 跳过前几行（Error、getCallStack、log方法等）
        return lines.slice(skipFrames + 1).join('\n');
    } catch (error) {
        return null;
    }
}

/**
 * 更新统计信息
 * @param {Object} logEntry - 日志条目
 */
updateStats(logEntry) {
    // 更新会话统计
    this.sessionStats.logCount++;
    
    switch (logEntry.level) {
        case 'debug':
            this.sessionStats.debugCount++;
            break;
        case 'info':
            this.sessionStats.infoCount++;
            break;
        case 'success':
            this.sessionStats.infoCount++; // 归类为信息
            break;
        case 'warning':
            this.sessionStats.warningCount++;
            break;
        case 'error':
        case 'critical':
            this.sessionStats.errorCount++;
            break;
    }
    
    // 更新模块统计
    if (!this.moduleStats.has(logEntry.module)) {
        this.moduleStats.set(logEntry.module, {
            count: 0,
            byLevel: new Map()
        });
    }
    
    const moduleStat = this.moduleStats.get(logEntry.module);
    moduleStat.count++;
    
    const levelCount = moduleStat.byLevel.get(logEntry.level) || 0;
    moduleStat.byLevel.set(logEntry.level, levelCount + 1);
    
    // 更新操作计数
    if (logEntry.category) {
        const operationKey = `${logEntry.module}.${logEntry.category}`;
        const count = this.operationCounters.get(operationKey) || 0;
        this.operationCounters.set(operationKey, count + 1);
    }
}

/**
 * 输出到控制台
 * @param {Object} logEntry - 日志条目
 */
outputToConsole(logEntry) {
    const timestamp = new Date(logEntry.timestamp).toLocaleString();
    const prefix = `[${timestamp}] [${logEntry.level.toUpperCase()}] [${logEntry.module}]`;
    
    const consoleMethods = {
        'debug': console.debug,
        'info': console.info,
        'success': console.info,
        'warning': console.warn,
        'error': console.error,
        'critical': console.error
    };
    
    const consoleMethod = consoleMethods[logEntry.level] || console.log;
    
    if (logEntry.data) {
        consoleMethod(`${prefix} ${logEntry.message}`, logEntry.data);
    } else {
        consoleMethod(`${prefix} ${logEntry.message}`);
    }
    
    // 如果有堆栈信息，也输出
    if (logEntry.stack) {
        console.trace('Call stack:', logEntry.stack);
    }
}
```

### 日志过滤和检索

```javascript
/**
 * 获取日志条目
 * @param {Object} filter - 过滤条件
 * @param {string} filter.level - 日志级别
 * @param {string} filter.module - 模块名称
 * @param {string} filter.category - 日志类别
 * @param {string} filter.keyword - 关键词
 * @param {number} filter.fromTime - 开始时间戳
 * @param {number} filter.toTime - 结束时间戳
 * @param {number} filter.limit - 限制数量
 * @param {string} filter.order - 排序方向 ('asc' 或 'desc')
 * @returns {Array} 过滤后的日志条目
 */
getLogEntries(filter = {}) {
    let filteredLogs = [...this.logEntries];
    
    // 按级别过滤
    if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }
    
    // 按模块过滤
    if (filter.module) {
        filteredLogs = filteredLogs.filter(log => log.module === filter.module);
    }
    
    // 按类别过滤
    if (filter.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filter.category);
    }
    
    // 按关键词过滤
    if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
            log.message.toLowerCase().includes(keyword) ||
            (log.data && JSON.stringify(log.data).toLowerCase().includes(keyword))
        );
    }
    
    // 按时间范围过滤
    if (filter.fromTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.fromTime);
    }
    
    if (filter.toTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.toTime);
    }
    
    // 排序
    const order = filter.order || 'desc';
    filteredLogs.sort((a, b) => {
        return order === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });
    
    // 限制数量
    if (filter.limit) {
        filteredLogs = filteredLogs.slice(0, filter.limit);
    }
    
    return filteredLogs;
}

/**
 * 搜索日志
 * @param {string} query - 搜索查询
 * @param {Object} options - 搜索选项
 * @returns {Array} 搜索结果
 */
searchLogs(query, options = {}) {
    if (!query || typeof query !== 'string') {
        return [];
    }
    
    const queryLower = query.toLowerCase();
    const searchFields = options.fields || ['message', 'data', 'module', 'category'];
    
    return this.logEntries.filter(logEntry => {
        for (const field of searchFields) {
            let value = logEntry[field];
            
            if (value === null || value === undefined) {
                continue;
            }
            
            if (field === 'data') {
                value = JSON.stringify(value);
            }
            
            if (typeof value === 'string' && value.toLowerCase().includes(queryLower)) {
                return true;
            }
        }
        return false;
    });
}

/**
 * 获取最近的日志
 * @param {number} count - 日志数量
 * @param {string} level - 日志级别
 * @returns {Array} 最近的日志条目
 */
getRecentLogs(count = 100, level = null) {
    let logs = [...this.logEntries];
    
    if (level) {
        logs = logs.filter(log => log.level === level);
    }
    
    return logs.slice(-count).reverse();
}

/**
 * 获取错误日志
 * @param {number} count - 日志数量
 * @returns {Array} 错误日志条目
 */
getRecentErrors(count = 50) {
    return this.getLogEntries({
        level: 'error',
        limit: count,
        order: 'desc'
    });
}
```

### 日志存储和持久化

```javascript
/**
 * 保存到存储
 */
saveToStorage() {
    try {
        // 在DEMO模式下保存到localStorage
        if (window.__DEMO_MODE_ACTIVE__) {
            const storageData = {
                logs: this.logEntries.slice(-this.config.maxLogEntries), // 只保存最新的日志
                stats: this.sessionStats,
                timestamp: Date.now()
            };
            
            localStorage.setItem('eagle2ae_log_data', JSON.stringify(storageData));
            return true;
        }
        
        // 在CEP模式下，可以选择保存到文件
        // 这里使用临时的localStorage模拟
        const storageData = {
            logs: this.logEntries.slice(-this.config.maxLogEntries),
            stats: this.sessionStats,
            timestamp: Date.now()
        };
        
        localStorage.setItem('eagle2ae_log_data', JSON.stringify(storageData));
        return true;
        
    } catch (error) {
        this.error(`Failed to save logs to storage: ${error.message}`);
        return false;
    }
}

/**
 * 从存储加载
 */
loadFromStorage() {
    try {
        let storageDataStr;
        
        // 在DEMO模式下从localStorage加载
        if (window.__DEMO_MODE_ACTIVE__) {
            storageDataStr = localStorage.getItem('eagle2ae_log_data');
        } else {
            // CEP模式下从相应位置加载
            storageDataStr = localStorage.getItem('eagle2ae_log_data');
        }
        
        if (storageDataStr) {
            const storageData = JSON.parse(storageDataStr);
            
            // 恢复日志
            this.logEntries = storageData.logs || [];
            
            // 恢复统计信息
            this.sessionStats = storageData.stats || {
                startTime: Date.now(),
                logCount: 0,
                errorCount: 0,
                infoCount: 0,
                warningCount: 0,
                debugCount: 0,
                performanceCount: 0
            };
            
            this.info(`Loaded ${this.logEntries.length} logs from storage`, { module: 'logManager' });
        }
        
    } catch (error) {
        this.error(`Failed to load logs from storage: ${error.message}`);
    }
}

/**
 * 清空日志
 */
clearLogs() {
    this.logEntries = [];
    this.moduleStats.clear();
    this.operationCounters.clear();
    this.performanceData.clear();
    
    // 重置会话统计（保留开始时间）
    this.sessionStats = {
        startTime: this.sessionStats.startTime,
        logCount: 0,
        errorCount: 0,
        infoCount: 0,
        warningCount: 0,
        debugCount: 0,
        performanceCount: 0
    };
    
    // 清空存储
    if (window.__DEMO_MODE_ACTIVE__) {
        localStorage.removeItem('eagle2ae_log_data');
    }
    
    this.info('Logs cleared', { module: 'logManager' });
}

/**
 * 导出日志
 * @param {string} filename - 文件名
 * @returns {Object} 导出结果
 */
exportLogs(filename = 'eagle2ae_logs.json') {
    try {
        const exportData = {
            metadata: {
                exportTime: Date.now(),
                exportTimestamp: new Date().toISOString(),
                totalLogs: this.logEntries.length,
                sessionStats: this.sessionStats,
                moduleStats: Object.fromEntries(this.moduleStats),
                operationCounters: Object.fromEntries(this.operationCounters),
                errorStats: this.errorStats
            },
            logs: this.logEntries
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        // 创建下载链接
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', filename);
        exportLink.click();
        
        this.info(`Logs exported to: ${filename}`, { 
            module: 'logManager',
            filename: filename,
            logCount: this.logEntries.length
        });
        
        return {
            success: true,
            filename: filename,
            logCount: this.logEntries.length,
            size: dataStr.length
        };
        
    } catch (error) {
        this.error(`Failed to export logs: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 导入日志
 * @param {File} file - 日志文件
 * @returns {Promise<Object>} 导入结果
 */
async importLogs(file) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const dataStr = event.target.result;
                    const importData = JSON.parse(dataStr);
                    
                    if (!importData.logs) {
                        resolve({
                            success: false,
                            error: 'Invalid log file format'
                        });
                        return;
                    }
                    
                    // 导入日志
                    this.logEntries.push(...importData.logs);
                    
                    // 限制日志数量
                    if (this.logEntries.length > this.config.maxLogEntries) {
                        this.logEntries = this.logEntries.slice(-this.config.maxLogEntries);
                    }
                    
                    // 如果有元数据，恢复统计信息
                    if (importData.metadata) {
                        this.sessionStats = importData.metadata.sessionStats || this.sessionStats;
                    }
                    
                    this.info(`Logs imported from: ${file.name}`, { 
                        module: 'logManager',
                        filename: file.name,
                        logCount: importData.logs.length
                    });
                    
                    resolve({
                        success: true,
                        logCount: importData.logs.length,
                        filename: file.name
                    });
                    
                } catch (parseError) {
                    resolve({
                        success: false,
                        error: `Failed to parse log file: ${parseError.message}`
                    });
                }
            };
            
            reader.onerror = () => {
                resolve({
                    success: false,
                    error: 'Failed to read log file'
                });
            };
            
            reader.readAsText(file);
            
        } catch (error) {
            resolve({
                success: false,
                error: error.message
            });
        }
    });
}

/**
 * 记录到文件（模拟实现）
 * @param {Object} logEntry - 日志条目
 */
logToFile(logEntry) {
    try {
        // 在实际实现中，这里会将日志写入文件
        // 为了演示，我们将其保存到localStorage的一个单独项中
        
        let fileLogs = JSON.parse(localStorage.getItem('eagle2ae_file_logs') || '[]');
        
        fileLogs.push(logEntry);
        
        // 限制文件日志数量
        if (fileLogs.length > this.config.maxLogEntries) {
            fileLogs = fileLogs.slice(-this.config.maxLogEntries);
        }
        
        localStorage.setItem('eagle2ae_file_logs', JSON.stringify(fileLogs));
        
    } catch (error) {
        // 避免因为文件日志记录失败影响主要功能
        console.warn('Failed to log to file:', error.message);
    }
}
```

### 性能监控

```javascript
/**
 * 开始性能计时器
 * @param {string} operation - 操作名称
 * @param {Object} options - 选项
 * @returns {string} 计时器ID
 */
startPerformanceTimer(operation, options = {}) {
    const timerId = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const timerData = {
        id: timerId,
        operation: operation,
        startTime: performance.now(),
        startTimestamp: Date.now(),
        module: options.module || 'general',
        context: options.context || {},
        memoryBefore: null,
        operationType: options.operationType || 'general'
    };
    
    // 记录内存使用（如果可用）
    if (performance.memory) {
        timerData.memoryBefore = {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
        };
    }
    
    this.performanceData.set(timerId, timerData);
    
    // 在DEBUG模式下记录开始信息
    if (this.config.logLevel === 'debug') {
        this.debug(`Performance timer started: ${operation}`, {
            module: 'performance',
            timerId: timerId,
            ...options
        });
    }
    
    return timerId;
}

/**
 * 结束性能计时器
 * @param {string} timerId - 计时器ID
 * @param {Object} result - 操作结果
 * @returns {Object} 性能数据
 */
endPerformanceTimer(timerId, result = null) {
    const timerData = this.performanceData.get(timerId);
    
    if (!timerData) {
        this.warning(`Performance timer not found: ${timerId}`, { module: 'performance' });
        return null;
    }
    
    const endTime = performance.now();
    const duration = endTime - timerData.startTime;
    
    const performanceData = {
        ...timerData,
        endTime: Date.now(),
        duration: duration,
        memoryAfter: null,
        result: result
    };
    
    // 记录内存使用（如果可用）
    if (performance.memory) {
        performanceData.memoryAfter = {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
        };
        
        // 计算内存变化
        if (timerData.memoryBefore) {
            performanceData.memoryChange = {
                used: performanceData.memoryAfter.used - timerData.memoryBefore.used,
                total: performanceData.memoryAfter.total - timerData.memoryBefore.total
            };
        }
    }
    
    // 更新会话统计
    this.sessionStats.performanceCount++;
    
    // 记录性能日志
    this.info(`Performance: ${timerData.operation} completed in ${duration.toFixed(2)}ms`, {
        module: 'performance',
        operation: timerData.operation,
        duration: duration,
        memoryChange: performanceData.memoryChange
    });
    
    // 在DEBUG模式下记录详细信息
    if (this.config.logLevel === 'debug') {
        this.debug(`Performance details:`, {
            module: 'performance',
            ...performanceData
        });
    }
    
    // 从性能数据中移除计时器
    this.performanceData.delete(timerId);
    
    // 如果性能时间过长，记录警告
    if (duration > 1000) { // 超过1秒
        this.warning(`Slow operation detected: ${timerData.operation} took ${duration.toFixed(2)}ms`, {
            module: 'performance',
            duration: duration,
            operation: timerData.operation
        });
    }
    
    return performanceData;
}

/**
 * 获取性能数据
 * @param {Object} filter - 过滤条件
 * @returns {Array} 性能数据
 */
getPerformanceData(filter = {}) {
    let data = Array.from(this.performanceData.values());
    
    if (filter.operation) {
        data = data.filter(item => item.operation === filter.operation);
    }
    
    if (filter.module) {
        data = data.filter(item => item.module === filter.module);
    }
    
    if (filter.minDuration) {
        data = data.filter(item => item.duration >= filter.minDuration);
    }
    
    return data;
}

/**
 * 记录性能指标
 * @param {string} metric - 指标名称
 * @param {number} value - 指标值
 * @param {Object} options - 选项
 */
recordPerformanceMetric(metric, value, options = {}) {
    this.info(`Performance Metric: ${metric} = ${value}`, {
        module: 'performance',
        metric: metric,
        value: value,
        ...options
    });
    
    // 也可以保存到专门的性能数据结构中
    const metricKey = `${options.module || 'general'}.${metric}`;
    if (!this.performanceMetrics) {
        this.performanceMetrics = new Map();
    }
    
    if (!this.performanceMetrics.has(metricKey)) {
        this.performanceMetrics.set(metricKey, []);
    }
    
    const metricHistory = this.performanceMetrics.get(metricKey);
    metricHistory.push({
        value: value,
        timestamp: Date.now(),
        ...options
    });
    
    // 限制历史记录数量
    if (metricHistory.length > 1000) {
        metricHistory.shift();
    }
}
```

### 错误统计和监控

```javascript
/**
 * 更新错误统计
 * @param {Object} logEntry - 错误日志条目
 */
updateErrorStats(logEntry) {
    this.errorStats.total++;
    
    // 按错误类型统计
    const errorType = logEntry.message.substring(0, 50); // 使用消息的前50个字符作为类型标识
    const typeCount = this.errorStats.byType.get(errorType) || 0;
    this.errorStats.byType.set(errorType, typeCount + 1);
    
    // 按模块统计
    const moduleCount = this.errorStats.byModule.get(logEntry.module) || 0;
    this.errorStats.byModule.set(logEntry.module, moduleCount + 1);
    
    // 更新最后错误时间
    this.errorStats.lastError = logEntry;
    
    // 计算错误率（基于会话时间）
    const sessionDuration = (Date.now() - this.sessionStats.startTime) / 1000; // 秒
    if (sessionDuration > 0) {
        this.errorStats.errorRate = this.errorStats.total / sessionDuration * 60; // 每分钟错误数
    }
}

/**
 * 获取错误统计
 * @returns {Object} 错误统计
 */
getErrorStats() {
    return {
        ...this.errorStats,
        errorRate: this.errorStats.errorRate,
        errorPercentage: this.sessionStats.logCount > 0 ? 
            (this.sessionStats.errorCount / this.sessionStats.logCount * 100).toFixed(2) : 0
    };
}

/**
 * 获取统计信息
 * @returns {Object} 统计信息
 */
getStats() {
    const now = Date.now();
    const sessionDuration = (now - this.sessionStats.startTime) / 1000; // 秒
    
    return {
        session: {
            ...this.sessionStats,
            duration: sessionDuration,
            logsPerSecond: sessionDuration > 0 ? (this.sessionStats.logCount / sessionDuration).toFixed(2) : 0,
            errorsPerSecond: sessionDuration > 0 ? (this.sessionStats.errorCount / sessionDuration).toFixed(2) : 0
        },
        modules: Object.fromEntries(this.moduleStats),
        operations: Object.fromEntries(this.operationCounters),
        errors: this.getErrorStats(),
        performance: {
            activeTimers: this.performanceData.size,
            totalMonitored: this.sessionStats.performanceCount
        },
        system: {
            totalMemory: this.getMemoryUsage(),
            userAgent: navigator.userAgent
        }
    };
}

/**
 * 获取内存使用情况
 * @returns {Object} 内存使用信息
 */
getMemoryUsage() {
    if (performance.memory) {
        return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            usedMB: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
            totalMB: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
            limitMB: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
        };
    }
    return null;
}
```

### 日志观察者系统

```javascript
/**
 * 添加日志观察者
 * @param {Function} observer - 观察者函数
 * @returns {Function} 移除观察者的函数
 */
addLogObserver(observer) {
    if (typeof observer !== 'function') {
        throw new Error('Observer must be a function');
    }
    
    this.logObservers.push(observer);
    
    this.info('Log observer added', { module: 'logManager', observerCount: this.logObservers.length });
    
    // 返回移除观察者的函数
    return () => {
        this.removeLogObserver(observer);
    };
}

/**
 * 移除日志观察者
 * @param {Function} observer - 观察者函数
 */
removeLogObserver(observer) {
    const index = this.logObservers.indexOf(observer);
    if (index !== -1) {
        this.logObservers.splice(index, 1);
        
        this.info('Log observer removed', { module: 'logManager', observerCount: this.logObservers.length });
    }
}

/**
 * 通知日志观察者
 * @param {Object} logEntry - 日志条目
 */
notifyLogObservers(logEntry) {
    // 异步通知观察者，避免阻塞日志记录
    setTimeout(() => {
        for (const observer of this.logObservers) {
            try {
                observer(logEntry);
            } catch (observerError) {
                this.error(`Log observer error: ${observerError.message}`, {
                    module: 'logManager',
                    observer: observer.toString().substring(0, 100)
                });
            }
        }
    }, 0);
}

/**
 * 创建过滤观察者
 * @param {Function} filter - 过滤函数
 * @param {Function} observer - 观察者函数
 * @returns {Function} 移除观察者的函数
 */
addFilteredObserver(filter, observer) {
    if (typeof filter !== 'function' || typeof observer !== 'function') {
        throw new Error('Filter and observer must be functions');
    }
    
    const filteredObserver = (logEntry) => {
        if (filter(logEntry)) {
            observer(logEntry);
        }
    };
    
    return this.addLogObserver(filteredObserver);
}

/**
 * 添加级别过滤观察者
 * @param {string} level - 日志级别
 * @param {Function} observer - 观察者函数
 * @returns {Function} 移除观察者的函数
 */
addLevelObserver(level, observer) {
    return this.addFilteredObserver(
        (logEntry) => logEntry.level === level,
        observer
    );
}

/**
 * 添加模块过滤观察者
 * @param {string} module - 模块名称
 * @param {Function} observer - 观察者函数
 * @returns {Function} 移除观察者的函数
 */
addModuleObserver(module, observer) {
    return this.addFilteredObserver(
        (logEntry) => logEntry.module === module,
        observer
    );
}
```

## API参考

### 核心方法

#### LogManager
日志管理器主类

```javascript
/**
 * 日志管理器
 * 负责管理和记录扩展的所有日志信息，支持多级日志、过滤、持久化等功能
 */
class LogManager
```

#### constructor()
构造函数

```javascript
/**
 * 构造函数
 * @param {Object} aeExtension - AE扩展实例
 */
constructor(aeExtension)
```

#### log()
记录日志

```javascript
/**
 * 记录日志
 * @param {string} message - 日志消息
 * @param {string} level - 日志级别
 * @param {Object} options - 日志选项
 * @param {string} options.module - 模块名称
 * @param {string} options.category - 日志类别
 * @param {Object} options.data - 附加数据
 * @param {string} options.userId - 用户ID
 * @param {string} options.sessionId - 会话ID
 */
log(message, level = 'info', options = {})
```

#### debug()
记录调试日志

```javascript
/**
 * 记录调试日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
debug(message, options = {})
```

#### info()
记录信息日志

```javascript
/**
 * 记录信息日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
info(message, options = {})
```

#### success()
记录成功日志

```javascript
/**
 * 记录成功日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
success(message, options = {})
```

#### warning()
记录警告日志

```javascript
/**
 * 记录警告日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
warning(message, options = {})
```

#### error()
记录错误日志

```javascript
/**
 * 记录错误日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
error(message, options = {})
```

#### critical()
记录严重错误日志

```javascript
/**
 * 记录严重错误日志
 * @param {string} message - 日志消息
 * @param {Object} options - 日志选项
 */
critical(message, options = {})
```

#### getLogEntries()
获取日志条目

```javascript
/**
 * 获取日志条目
 * @param {Object} filter - 过滤条件
 * @param {string} filter.level - 日志级别
 * @param {string} filter.module - 模块名称
 * @param {string} filter.category - 日志类别
 * @param {string} filter.keyword - 关键词
 * @param {number} filter.fromTime - 开始时间戳
 * @param {number} filter.toTime - 结束时间戳
 * @param {number} filter.limit - 限制数量
 * @param {string} filter.order - 排序方向 ('asc' 或 'desc')
 * @returns {Array} 过滤后的日志条目
 */
getLogEntries(filter = {})
```

#### searchLogs()
搜索日志

```javascript
/**
 * 搜索日志
 * @param {string} query - 搜索查询
 * @param {Object} options - 搜索选项
 * @returns {Array} 搜索结果
 */
searchLogs(query, options = {})
```

#### getRecentLogs()
获取最近的日志

```javascript
/**
 * 获取最近的日志
 * @param {number} count - 日志数量
 * @param {string} level - 日志级别
 * @returns {Array} 最近的日志条目
 */
getRecentLogs(count = 100, level = null)
```

#### getRecentErrors()
获取错误日志

```javascript
/**
 * 获取错误日志
 * @param {number} count - 日志数量
 * @returns {Array} 错误日志条目
 */
getRecentErrors(count = 50)
```

#### saveToStorage()
保存到存储

```javascript
/**
 * 保存到存储
 */
saveToStorage()
```

#### loadFromStorage()
从存储加载

```javascript
/**
 * 从存储加载
 */
loadFromStorage()
```

#### clearLogs()
清空日志

```javascript
/**
 * 清空日志
 */
clearLogs()
```

#### exportLogs()
导出日志

```javascript
/**
 * 导出日志
 * @param {string} filename - 文件名
 * @returns {Object} 导出结果
 */
exportLogs(filename = 'eagle2ae_logs.json')
```

#### importLogs()
导入日志

```javascript
/**
 * 导入日志
 * @param {File} file - 日志文件
 * @returns {Promise<Object>} 导入结果
 */
async importLogs(file)
```

#### startPerformanceTimer()
开始性能计时器

```javascript
/**
 * 开始性能计时器
 * @param {string} operation - 操作名称
 * @param {Object} options - 选项
 * @returns {string} 计时器ID
 */
startPerformanceTimer(operation, options = {})
```

#### endPerformanceTimer()
结束性能计时器

```javascript
/**
 * 结束性能计时器
 * @param {string} timerId - 计时器ID
 * @param {Object} result - 操作结果
 * @returns {Object} 性能数据
 */
endPerformanceTimer(timerId, result = null)
```

#### getPerformanceData()
获取性能数据

```javascript
/**
 * 获取性能数据
 * @param {Object} filter - 过滤条件
 * @returns {Array} 性能数据
 */
getPerformanceData(filter = {})
```

#### recordPerformanceMetric()
记录性能指标

```javascript
/**
 * 记录性能指标
 * @param {string} metric - 指标名称
 * @param {number} value - 指标值
 * @param {Object} options - 选项
 */
recordPerformanceMetric(metric, value, options = {})
```

#### getErrorStats()
获取错误统计

```javascript
/**
 * 获取错误统计
 * @returns {Object} 错误统计
 */
getErrorStats()
```

#### getStats()
获取统计信息

```javascript
/**
 * 获取统计信息
 * @returns {Object} 统计信息
 */
getStats()
```

#### getMemoryUsage()
获取内存使用情况

```javascript
/**
 * 获取内存使用情况
 * @returns {Object} 内存使用信息
 */
getMemoryUsage()
```

#### addLogObserver()
添加日志观察者

```javascript
/**
 * 添加日志观察者
 * @param {Function} observer - 观察者函数
 * @returns {Function} 移除观察者的函数
 */
addLogObserver(observer)
```

#### removeLogObserver()
移除日志观察者

```javascript
/**
 * 移除日志观察者
 * @param {Function} observer - 观察者函数
 */
removeLogObserver(observer)
```

#### addFilteredObserver()
添加过滤观察者

```javascript
/**
 * 创建过滤观察者
 * @param {Function} filter - 过滤函数
 * @param {Function} observer - 观察者函数
 * @returns {Function} 移除观察者的函数
 */
addFilteredObserver(filter, observer)
```

#### addLevelObserver()
添加级别过滤观察者

```javascript
/**
 * 添加级别过滤观察者
 * @param {string} level - 日志级别
 * @param {Function} observer - 观察者函数
 * @returns {Function} 移除观察者的函数
 */
addLevelObserver(level, observer)
```

#### addModuleObserver()
添加模块过滤观察者

```javascript
/**
 * 添加模块过滤观察者
 * @param {string} module - 模块名称
 * @param {Function} observer - 观察者函数
 * @returns {Function} 移除观察者的函数
 */
addModuleObserver(module, observer)
```

### 日志级别

```javascript
/**
 * 日志级别定义
 * @typedef {Object} LogLevels
 * @property {number} debug - 0
 * @property {number} info - 1
 * @property {number} success - 1.5
 * @property {number} warning - 2
 * @property {number} error - 3
 * @property {number} critical - 4
 */
```

### 日志条目结构

```javascript
/**
 * 日志条目结构
 * @typedef {Object} LogEntry
 * @property {string} id - 日志ID
 * @property {number} timestamp - 时间戳
 * @property {string} level - 日志级别
 * @property {string} message - 日志消息
 * @property {string} module - 模块名称
 * @property {string} category - 日志类别
 * @property {Object|null} data - 附加数据
 * @property {string} userId - 用户ID
 * @property {string} sessionId - 会话ID
 * @property {string|null} stack - 调用堆栈
 */
```

## 使用示例

### 基本使用

#### 记录不同级别的日志
```javascript
// 创建日志管理器实例
const logManager = new LogManager(aeExtension);

// 记录不同级别的日志
logManager.info('Extension initialized');
logManager.debug('Debug information for development');
logManager.success('Operation completed successfully');
logManager.warning('This is a warning message');
logManager.error('An error occurred');
logManager.critical('Critical system error');

// 带有附加数据的日志
logManager.info('User action performed', {
    module: 'ui',
    category: 'ButtonClick',
    data: {
        buttonId: 'import-btn',
        userId: 'user123',
        timestamp: Date.now()
    }
});

// 记录性能相关的日志
const timerId = logManager.startPerformanceTimer('fileImport', {
    module: 'import',
    context: {
        fileName: 'example.png',
        fileSize: 1024
    }
});

// 模拟一些操作
await new Promise(resolve => setTimeout(resolve, 100));

const performanceData = logManager.endPerformanceTimer(timerId, {
    success: true,
    importedItems: 5
});

console.log('Performance data:', performanceData);
```

#### 日志过滤和检索
```javascript
// 获取特定模块的日志
const importLogs = logManager.getLogEntries({ module: 'import' });
console.log('Import logs:', importLogs);

// 获取错误日志
const errorLogs = logManager.getLogEntries({ level: 'error' });
console.log('Error logs:', errorLogs);

// 按关键词搜索
const searchResults = logManager.searchLogs('connection');
console.log('Search results:', searchResults);

// 按时间范围过滤
const fromTime = Date.now() - 3600000; // 1小时前
const recentLogs = logManager.getLogEntries({ fromTime: fromTime });
console.log('Recent logs:', recentLogs);

// 获取最近的10条日志
const recentLogsLimited = logManager.getRecentLogs(10);
console.log('Recent logs (limited):', recentLogsLimited);

// 获取最近的错误
const recentErrors = logManager.getRecentErrors(5);
console.log('Recent errors:', recentErrors);
```

#### 监听日志变更
```javascript
// 添加通用日志观察者
const removeObserver = logManager.addLogObserver((logEntry) => {
    console.log(`New log: [${logEntry.level}] ${logEntry.message}`);
    
    // 可以根据日志类型执行不同操作
    if (logEntry.level === 'error') {
        showNotification('Error occurred', logEntry.message, 'error');
    }
});

// 添加级别过滤观察者
const removeErrorObserver = logManager.addLevelObserver('error', (logEntry) => {
    console.error('Error log:', logEntry);
    
    // 错误特定的处理逻辑
    reportErrorToServer(logEntry);
});

// 添加模块过滤观察者
const removeImportObserver = logManager.addModuleObserver('import', (logEntry) => {
    console.log('Import module log:', logEntry);
    
    // 更新导入模块相关的UI
    updateImportStatusUI(logEntry);
});

// 使用完成后移除观察者
// removeObserver();
// removeErrorObserver();
// removeImportObserver();
```

### 高级使用

#### 性能监控
```javascript
// 创建性能监控助手类
class PerformanceMonitor {
    constructor(logManager) {
        this.logManager = logManager;
        this.activeOperations = new Map();
    }
    
    /**
     * 开始监控操作性能
     * @param {string} operation - 操作名称
     * @param {Object} context - 上下文信息
     * @returns {string} 操作ID
     */
    start(operation, context = {}) {
        const operationId = this.logManager.startPerformanceTimer(operation, {
            module: 'performance',
            context: context
        });
        
        this.activeOperations.set(operationId, {
            operation: operation,
            startTime: Date.now(),
            context: context
        });
        
        return operationId;
    }
    
    /**
     * 结束监控操作性能
     * @param {string} operationId - 操作ID
     * @param {Object} result - 操作结果
     */
    end(operationId, result = null) {
        const operationData = this.activeOperations.get(operationId);
        if (!operationData) {
            this.logManager.warning(`Performance timer not found: ${operationId}`, {
                module: 'performance'
            });
            return;
        }
        
        const performanceData = this.logManager.endPerformanceTimer(operationId, result);
        
        // 记录性能摘要
        if (performanceData && performanceData.duration > 100) { // 超过100ms
            this.logManager.warning(`Slow operation: ${operationData.operation} took ${performanceData.duration.toFixed(2)}ms`, {
                module: 'performance',
                operation: operationData.operation,
                duration: performanceData.duration,
                context: operationData.context
            });
        }
        
        this.activeOperations.delete(operationId);
    }
    
    /**
     * 监控异步操作
     * @param {string} operation - 操作名称
     * @param {Function} asyncOperation - 异步操作函数
     * @param {Object} context - 上下文信息
     * @returns {Promise} 操作结果
     */
    async monitorAsync(operation, asyncOperation, context = {}) {
        const operationId = this.start(operation, context);
        try {
            const result = await asyncOperation();
            this.end(operationId, { success: true, result: result });
            return result;
        } catch (error) {
            this.end(operationId, { success: false, error: error.message });
            throw error;
        }
    }
    
    /**
     * 获取性能摘要
     * @returns {Object} 性能摘要
     */
    getSummary() {
        const performanceData = this.logManager.getPerformanceData();
        const totalOperations = performanceData.length;
        const totalDuration = performanceData.reduce((sum, data) => sum + (data.duration || 0), 0);
        const avgDuration = totalOperations > 0 ? totalDuration / totalOperations : 0;
        const slowOperations = performanceData.filter(data => data.duration > 1000).length; // 超过1秒
        
        return {
            totalOperations,
            totalDuration,
            avgDuration: avgDuration.toFixed(2),
            slowOperations,
            activeTimers: this.activeOperations.size
        };
    }
}

// 使用性能监控器
const perfMonitor = new PerformanceMonitor(logManager);

// 监控同步操作
const syncOpId = perfMonitor.start('syncOperation', { type: 'calculation' });
// 执行一些计算
const result = performComplexCalculation();
perfMonitor.end(syncOpId, { result: result });

// 监控异步操作
try {
    const asyncResult = await perfMonitor.monitorAsync('fileImport', async () => {
        return await importFile('example.png');
    }, { fileName: 'example.png' });
    console.log('Async operation completed:', asyncResult);
} catch (error) {
    console.error('Async operation failed:', error);
}

// 获取性能摘要
const perfSummary = perfMonitor.getSummary();
console.log('Performance summary:', perfSummary);
```

#### 日志分析和报告
```javascript
// 创建日志分析器
class LogAnalyzer {
    constructor(logManager) {
        this.logManager = logManager;
    }
    
    /**
     * 生成日志报告
     * @returns {Object} 日志报告
     */
    generateReport() {
        const allLogs = this.logManager.getLogEntries();
        const stats = this.logManager.getStats();
        
        const report = {
            summary: {
                totalLogs: allLogs.length,
                duration: stats.session.duration,
                logsPerSecond: stats.session.logsPerSecond,
                errorRate: stats.session.errorsPerSecond
            },
            levelDistribution: this.getLevelDistribution(allLogs),
            moduleDistribution: this.getModuleDistribution(allLogs),
            errorAnalysis: this.getErrorAnalysis(),
            performanceAnalysis: this.getPerformanceAnalysis(),
            topOperations: this.getTopOperations(10),
            recentErrors: this.logManager.getRecentErrors(10)
        };
        
        return report;
    }
    
    /**
     * 获取级别分布
     * @param {Array} logs - 日志数组
     * @returns {Object} 级别分布
     */
    getLevelDistribution(logs) {
        const distribution = {};
        const levelCounts = new Map();
        
        for (const log of logs) {
            const count = levelCounts.get(log.level) || 0;
            levelCounts.set(log.level, count + 1);
        }
        
        for (const [level, count] of levelCounts) {
            distribution[level] = {
                count: count,
                percentage: ((count / logs.length) * 100).toFixed(2)
            };
        }
        
        return distribution;
    }
    
    /**
     * 获取模块分布
     * @param {Array} logs - 日志数组
     * @returns {Object} 模块分布
     */
    getModuleDistribution(logs) {
        const distribution = {};
        const moduleCounts = new Map();
        
        for (const log of logs) {
            const count = moduleCounts.get(log.module) || 0;
            moduleCounts.set(log.module, count + 1);
        }
        
        for (const [module, count] of moduleCounts) {
            distribution[module] = {
                count: count,
                percentage: ((count / logs.length) * 100).toFixed(2)
            };
        }
        
        return distribution;
    }
    
    /**
     * 获取错误分析
     * @returns {Object} 错误分析
     */
    getErrorAnalysis() {
        const errorStats = this.logManager.getErrorStats();
        
        return {
            totalErrors: errorStats.total,
            errorRate: errorStats.errorRate,
            errorPercentage: errorStats.errorPercentage,
            topErrorTypes: this.getTopErrorTypes(5),
            errorTrend: this.getErrorTrend()
        };
    }
    
    /**
     * 获取性能分析
     * @returns {Object} 性能分析
     */
    getPerformanceAnalysis() {
        const performanceData = this.logManager.getPerformanceData();
        
        if (performanceData.length === 0) {
            return {
                averageDuration: 0,
                slowestOperation: null,
                fastestOperation: null,
                totalDuration: 0
            };
        }
        
        const totalDuration = performanceData.reduce((sum, data) => sum + (data.duration || 0), 0);
        const avgDuration = totalDuration / performanceData.length;
        
        const sortedByDuration = [...performanceData].sort((a, b) => (b.duration || 0) - (a.duration || 0));
        
        return {
            averageDuration: avgDuration.toFixed(2),
            slowestOperation: sortedByDuration[0],
            fastestOperation: sortedByDuration[sortedByDuration.length - 1],
            totalDuration: totalDuration.toFixed(2),
            operationCount: performanceData.length
        };
    }
    
    /**
     * 获取顶级操作
     * @param {number} limit - 限制数量
     * @returns {Array} 顶级操作
     */
    getTopOperations(limit = 10) {
        const operationCounters = this.logManager.operationCounters;
        const operations = Array.from(operationCounters.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([operation, count]) => ({ operation, count }));
        
        return operations;
    }
    
    /**
     * 获取顶级错误类型
     * @param {number} limit - 限制数量
     * @returns {Array} 顶级错误类型
     */
    getTopErrorTypes(limit = 5) {
        const errorTypes = Array.from(this.logManager.errorStats.byType.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([type, count]) => ({ type, count }));
        
        return errorTypes;
    }
    
    /**
     * 获取错误趋势
     * @returns {Object} 错误趋势
     */
    getErrorTrend() {
        // 分析最近的错误频率
        const recentLogs = this.logManager.getLogEntries({
            fromTime: Date.now() - 300000 // 最近5分钟
        });
        
        const recentErrors = recentLogs.filter(log => log.level === 'error' || log.level === 'critical');
        const errorRatePerMinute = recentErrors.length / 5; // 5分钟
        
        return {
            recentErrorCount: recentErrors.length,
            errorRatePerMinute: errorRatePerMinute.toFixed(2)
        };
    }
    
    /**
     * 导出分析报告
     * @param {string} filename - 文件名
     * @returns {Object} 导出结果
     */
    exportReport(filename = 'log_analysis_report.json') {
        const report = this.generateReport();
        const reportData = {
            timestamp: new Date().toISOString(),
            version: '2.4.0',
            report: report
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', filename);
        exportLink.click();
        
        return {
            success: true,
            filename: filename,
            report: report
        };
    }
}

// 使用日志分析器
const logAnalyzer = new LogAnalyzer(logManager);

// 生成并导出报告
const report = logAnalyzer.generateReport();
console.log('Log report:', report);

// 导出报告
// const exportResult = logAnalyzer.exportReport('extension_log_report.json');
// console.log('Report export result:', exportResult);
```

#### 日志实时监控面板
```javascript
// 创建日志监控面板
class LogMonitorPanel {
    constructor(logManager, elementId) {
        this.logManager = logManager;
        this.elementId = elementId;
        this.container = document.getElementById(elementId);
        this.isMonitoring = false;
        this.currentFilter = {};
        
        if (!this.container) {
            throw new Error(`Container element with id '${elementId}' not found`);
        }
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.setupEventListeners();
        this.updateStatsDisplay();
    }
    
    createUI() {
        this.container.innerHTML = `
            <div class="log-monitor-panel">
                <div class="log-controls">
                    <div class="control-group">
                        <label>日志级别:</label>
                        <select id="log-level-filter">
                            <option value="">全部</option>
                            <option value="debug">调试</option>
                            <option value="info">信息</option>
                            <option value="success">成功</option>
                            <option value="warning">警告</option>
                            <option value="error">错误</option>
                            <option value="critical">严重</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>模块:</label>
                        <select id="log-module-filter">
                            <option value="">全部</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>关键词:</label>
                        <input type="text" id="log-keyword-filter" placeholder="搜索关键词...">
                    </div>
                    
                    <div class="control-group">
                        <button id="clear-logs-btn">清空日志</button>
                        <button id="export-logs-btn">导出日志</button>
                        <button id="toggle-monitoring-btn">开始监控</button>
                    </div>
                </div>
                
                <div class="log-stats">
                    <div class="stat-item">
                        <span class="stat-label">总日志:</span>
                        <span class="stat-value" id="total-logs">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">错误:</span>
                        <span class="stat-value error-count" id="error-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">警告:</span>
                        <span class="stat-value warning-count" id="warning-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">信息:</span>
                        <span class="stat-value info-count" id="info-count">0</span>
                    </div>
                </div>
                
                <div class="log-entries-container">
                    <div id="log-entries" class="log-entries"></div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // 级别过滤
        document.getElementById('log-level-filter').addEventListener('change', (e) => {
            this.currentFilter.level = e.target.value || undefined;
            this.updateLogDisplay();
        });
        
        // 模块过滤
        document.getElementById('log-module-filter').addEventListener('change', (e) => {
            this.currentFilter.module = e.target.value || undefined;
            this.updateLogDisplay();
        });
        
        // 关键词过滤
        document.getElementById('log-keyword-filter').addEventListener('input', (e) => {
            this.currentFilter.keyword = e.target.value || undefined;
            this.updateLogDisplay();
        });
        
        // 清空日志
        document.getElementById('clear-logs-btn').addEventListener('click', () => {
            if (confirm('确定要清空所有日志吗？')) {
                this.logManager.clearLogs();
                this.updateLogDisplay();
                this.updateStatsDisplay();
            }
        });
        
        // 导出日志
        document.getElementById('export-logs-btn').addEventListener('click', () => {
            this.logManager.exportLogs();
        });
        
        // 开始/停止监控
        document.getElementById('toggle-monitoring-btn').addEventListener('click', () => {
            this.toggleMonitoring();
        });
        
        // 动态更新模块列表
        this.updateModuleList();
    }
    
    updateModuleList() {
        const moduleFilter = document.getElementById('log-module-filter');
        const modules = new Set();
        
        // 从当前日志中获取模块列表
        const allLogs = this.logManager.getLogEntries();
        allLogs.forEach(log => modules.add(log.module));
        
        // 清空现有选项
        moduleFilter.innerHTML = '<option value="">全部</option>';
        
        // 添加模块选项
        for (const module of Array.from(modules).sort()) {
            const option = document.createElement('option');
            option.value = module;
            option.textContent = module;
            moduleFilter.appendChild(option);
        }
    }
    
    updateStatsDisplay() {
        const stats = this.logManager.getStats();
        
        document.getElementById('total-logs').textContent = stats.session.logCount;
        document.getElementById('error-count').textContent = stats.session.errorCount;
        document.getElementById('warning-count').textContent = stats.session.warningCount;
        document.getElementById('info-count').textContent = stats.session.infoCount;
    }
    
    updateLogDisplay() {
        const logs = this.logManager.getLogEntries({
            ...this.currentFilter,
            limit: 1000, // 限制显示数量
            order: 'desc'
        });
        
        const logEntriesDiv = document.getElementById('log-entries');
        logEntriesDiv.innerHTML = logs.map(log => this.formatLogEntry(log)).join('');
        
        // 滚动到底部
        logEntriesDiv.scrollTop = logEntriesDiv.scrollHeight;
    }
    
    formatLogEntry(log) {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const levelClass = `log-level-${log.level}`;
        const levelIcon = this.getLevelIcon(log.level);
        
        return `
            <div class="log-entry ${levelClass}">
                <div class="log-header">
                    <span class="log-timestamp">${timestamp}</span>
                    <span class="log-level">${levelIcon} ${log.level.toUpperCase()}</span>
                    <span class="log-module">${log.module}</span>
                </div>
                <div class="log-message">${this.escapeHtml(log.message)}</div>
                ${log.data ? `<div class="log-data"><pre>${JSON.stringify(log.data, null, 2)}</pre></div>` : ''}
            </div>
        `;
    }
    
    getLevelIcon(level) {
        const icons = {
            'debug': '🔍',
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'critical': '🚨'
        };
        return icons[level] || '📝';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    toggleMonitoring() {
        const button = document.getElementById('toggle-monitoring-btn');
        
        if (this.isMonitoring) {
            // 停止监控
            if (this.logObserver) {
                this.logObserver();
                this.logObserver = null;
            }
            button.textContent = '开始监控';
            this.isMonitoring = false;
        } else {
            // 开始监控
            this.logObserver = this.logManager.addLogObserver(() => {
                // 防抖更新显示
                if (this.updateTimeout) {
                    clearTimeout(this.updateTimeout);
                }
                this.updateTimeout = setTimeout(() => {
                    this.updateLogDisplay();
                    this.updateModuleList();
                    this.updateStatsDisplay();
                }, 100);
            });
            button.textContent = '停止监控';
            this.isMonitoring = true;
            
            // 初始更新
            this.updateLogDisplay();
        }
    }
    
    // 销毁面板
    destroy() {
        if (this.logObserver) {
            this.logObserver();
            this.logObserver = null;
        }
        
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        this.container.innerHTML = '';
    }
}

// 使用日志监控面板
// const logMonitor = new LogMonitorPanel(logManager, 'log-monitor-container');
// logMonitor.toggleMonitoring(); // 开始实时监控
```

## 最佳实践

### 使用建议

#### 日志级别选择
```javascript
// 建议的日志级别使用模式
class LogBestPractices {
    constructor(logManager) {
        this.logManager = logManager;
    }
    
    // 调试信息 - 用于开发和故障排除
    logDebug() {
        this.logManager.debug('Entering function with params', {
            module: 'business-logic',
            category: 'function-entry',
            data: { param1: 'value1', param2: 'value2' }
        });
    }
    
    // 重要业务操作 - 记录关键业务流程
    logBusinessOperation() {
        this.logManager.info('User performed import operation', {
            module: 'import',
            category: 'user-action',
            data: { userId: 'user123', itemCount: 10, importType: 'eagle' }
        });
    }
    
    // 操作成功 - 记录成功完成的操作
    logSuccess() {
        this.logManager.success('File imported successfully', {
            module: 'import',
            category: 'operation-success',
            data: { fileName: 'example.png', size: '2.5MB', duration: 1500 }
        });
    }
    
    // 潜在问题 - 记录需要注意但不影响功能的问题
    logWarning() {
        this.logManager.warning('Deprecated API method called', {
            module: 'api',
            category: 'deprecation',
            data: { method: 'getOldData', replacement: 'getNewData' }
        });
    }
    
    // 错误信息 - 记录错误但程序可继续运行
    logError() {
        this.logManager.error('Failed to connect to Eagle', {
            module: 'connection',
            category: 'connection-error',
            data: { host: 'localhost', port: 41595, retryCount: 3 }
        });
    }
    
    // 严重错误 - 记录导致程序异常的错误
    logCritical() {
        this.logManager.critical('System memory exhausted', {
            module: 'system',
            category: 'resource-exhaustion',
            data: { memoryUsed: '8GB', memoryLimit: '8GB', stack: this.getStackTrace() }
        });
    }
    
    getStackTrace() {
        return new Error().stack;
    }
}

// 使用最佳实践
const practices = new LogBestPractices(logManager);
practices.logDebug();
practices.logBusinessOperation();
practices.logSuccess();
practices.logWarning();
practices.logError();
practices.logCritical();
```

#### 性能优化的日志记录
```javascript
// 创建高效的日志记录器
class EfficientLogger {
    constructor(logManager) {
        this.logManager = logManager;
        this.buffers = new Map(); // 日志缓冲区
        this.flushTimers = new Map(); // 刷新定时器
        this.batchSize = 10; // 批量处理大小
        this.flushInterval = 1000; // 刷新间隔（ms）
    }
    
    /**
     * 缓存日志并批量处理
     * @param {string} module - 模块名
     * @param {string} message - 日志消息
     * @param {string} level - 日志级别
     * @param {Object} data - 日志数据
     */
    logWithBuffer(module, message, level = 'info', data = null) {
        // 创建缓冲区
        if (!this.buffers.has(module)) {
            this.buffers.set(module, []);
        }
        
        const buffer = this.buffers.get(module);
        buffer.push({
            timestamp: Date.now(),
            level: level,
            message: message,
            data: data
        });
        
        // 如果缓冲区达到批量大小，立即刷新
        if (buffer.length >= this.batchSize) {
            this.flushBuffer(module);
        } else {
            // 设置定时器定期刷新
            if (!this.flushTimers.has(module)) {
                this.flushTimers.set(module, setTimeout(() => {
                    this.flushBuffer(module);
                }, this.flushInterval));
            }
        }
    }
    
    /**
     * 刷新缓冲区
     * @param {string} module - 模块名
     */
    flushBuffer(module) {
        const buffer = this.buffers.get(module);
        if (!buffer || buffer.length === 0) {
            return;
        }
        
        // 记录缓冲区中的所有日志
        for (const logEntry of buffer) {
            this.logManager.log(logEntry.message, logEntry.level, {
                module: module,
                data: logEntry.data,
                category: 'batched'
            });
        }
        
        // 清空缓冲区
        buffer.length = 0;
        
        // 清除定时器
        if (this.flushTimers.has(module)) {
            clearTimeout(this.flushTimers.get(module));
            this.flushTimers.delete(module);
        }
    }
    
    /**
     * 立即刷新所有缓冲区
     */
    flushAll() {
        for (const module of this.buffers.keys()) {
            this.flushBuffer(module);
        }
    }
    
    /**
     * 销毁缓冲区
     */
    destroy() {
        // 刷新所有缓冲区
        this.flushAll();
        
        // 清除所有定时器
        for (const timer of this.flushTimers.values()) {
            clearTimeout(timer);
        }
        this.flushTimers.clear();
        
        this.buffers.clear();
    }
}

// 使用高效日志记录器
const efficientLogger = new EfficientLogger(logManager);

// 高频日志记录
for (let i = 0; i < 100; i++) {
    efficientLogger.logWithBuffer('import', `Processing item ${i}`, 'debug', { index: i });
}

// 在适当时机刷新
setTimeout(() => {
    efficientLogger.flushAll();
}, 2000);
```

### 内存管理

#### 日志内存监控
```javascript
// 创建日志内存管理器
class LogMemoryManager {
    constructor(logManager) {
        this.logManager = logManager;
        this.memoryMonitorInterval = null;
        this.memoryThreshold = 50 * 1024 * 1024; // 50MB
        this.logCleanupThreshold = 5000; // 当日志数量超过此值时开始清理
    }
    
    startMonitoring() {
        if (this.memoryMonitorInterval) {
            return;
        }
        
        this.memoryMonitorInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, 5000); // 每5秒检查一次
        
        console.log('📊 日志内存监控已启动');
    }
    
    stopMonitoring() {
        if (this.memoryMonitorInterval) {
            clearInterval(this.memoryMonitorInterval);
            this.memoryMonitorInterval = null;
            console.log('📊 日志内存监控已停止');
        }
    }
    
    checkMemoryUsage() {
        // 检查内存使用
        if (performance.memory) {
            const memory = performance.memory;
            const usage = memory.usedJSHeapSize;
            const total = memory.totalJSHeapSize;
            
            if (usage > this.memoryThreshold) {
                console.warn(`⚠️ 内存使用过高: ${(usage / 1024 / 1024).toFixed(2)}MB`);
                this.performMemoryCleanup();
            }
            
            console.log(`📊 内存使用: ${(usage / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB`);
        }
        
        // 检查日志数量
        if (this.logManager.logEntries.length > this.logCleanupThreshold) {
            console.warn(`⚠️ 日志数量过多: ${this.logManager.logEntries.length}`);
            this.cleanupOldLogs();
        }
    }
    
    performMemoryCleanup() {
        console.log('🧹 执行内存清理...');
        
        // 清理一些临时数据结构
        if (this.logManager.performanceData) {
            // 只保留最近的性能数据
            const recentPerformanceData = new Map();
            const now = Date.now();
            const maxAge = 300000; // 5分钟
            
            for (const [key, value] of this.logManager.performanceData) {
                if (now - value.startTimestamp < maxAge) {
                    recentPerformanceData.set(key, value);
                }
            }
            
            this.logManager.performanceData = recentPerformanceData;
        }
        
        // 强制垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
            console.log('🧹 手动垃圾回收完成');
        }
    }
    
    cleanupOldLogs() {
        console.log('🧹 清理旧日志...');
        
        // 保留最近的日志
        const keepCount = Math.floor(this.logCleanupThreshold * 0.8); // 保留80%
        const oldCount = this.logManager.logEntries.length - keepCount;
        
        if (oldCount > 0) {
            this.logManager.logEntries = this.logManager.logEntries.slice(-keepCount);
            console.log(`🧹 已清理 ${oldCount} 条旧日志，保留 ${keepCount} 条`);
        }
    }
}

// 使用日志内存管理器
const logMemoryManager = new LogMemoryManager(logManager);
logMemoryManager.startMonitoring();

// 在页面卸载时清理
window.addEventListener('beforeunload', () => {
    logMemoryManager.stopMonitoring();
    logMemoryManager.destroy();
});
```

## 故障排除

### 常见问题

#### 日志记录失败
- **症状**：调用log方法无输出或报错
- **解决**：
  1. 检查日志级别配置
  2. 验证日志管理器是否正确初始化
  3. 确认存储权限（localStorage等）
  4. 检查控制台错误

#### 内存溢出
- **症状**：长时间运行后内存使用过高
- **解决**：
  1. 调整`maxLogEntries`配置
  2. 实现日志滚动删除策略
  3. 使用日志缓冲减少频繁写入
  4. 定期清理性能数据

#### 性能下降
- **症状**：记录日志影响应用性能
- **解决**：
  1. 使用异步日志记录
  2. 实施日志采样策略
  3. 减少调试日志级别
  4. 优化日志观察者

#### 存储失败
- **症状**：日志无法保存到存储
- **解决**：
  1. 检查存储空间限制
  2. 验证存储权限
  3. 实现存储失败降级策略
  4. 检查数据序列化问题

### 调试技巧

#### 启用详细日志
```javascript
// 启用所有级别的日志
logManager.config.logLevel = 'debug';
logManager.config.enableConsoleOutput = true;

// 记录调用堆栈
logManager.debug('This log includes stack trace', { includeStack: true });

// 监控日志性能
const logTimer = logManager.startPerformanceTimer('logOperation', { 
    module: 'debug' 
});
// 执行操作
logManager.info('Operation completed');
logManager.endPerformanceTimer(logTimer);
```

#### 日志健康检查
```javascript
// 创建日志健康检查器
class LogHealthChecker {
    constructor(logManager) {
        this.logManager = logManager;
    }
    
    runHealthCheck() {
        console.log('🔍 开始日志系统健康检查...');
        
        // 1. 检查配置
        console.log('1. 配置检查:');
        console.log('   - 日志级别:', this.logManager.config.logLevel);
        console.log('   - 最大日志数:', this.logManager.config.maxLogEntries);
        console.log('   - 控制台输出:', this.logManager.config.enableConsoleOutput);
        console.log('   - 存储启用:', this.logManager.config.enableStorage);
        
        // 2. 检查日志状态
        console.log('2. 日志状态检查:');
        console.log('   - 当前日志数:', this.logManager.logEntries.length);
        console.log('   - 会话统计:', this.logManager.sessionStats);
        
        // 3. 检查性能数据
        console.log('3. 性能数据检查:');
        console.log('   - 活跃性能计时器:', this.logManager.performanceData.size);
        
        // 4. 检查观察者
        console.log('4. 观察者检查:');
        console.log('   - 观察者数量:', this.logManager.logObservers.length);
        
        // 5. 检查错误统计
        console.log('5. 错误统计检查:');
        console.log('   - 总错误数:', this.logManager.errorStats.total);
        console.log('   - 错误率:', this.logManager.errorStats.errorRate);
        
        // 6. 测试日志记录
        console.log('6. 日志记录测试:');
        this.logManager.debug('Health check test message');
        console.log('   - 测试消息已记录');
        
        console.log('✅ 日志系统健康检查完成');
    }
}

// 运行健康检查
const healthChecker = new LogHealthChecker(logManager);
healthChecker.runHealthCheck();
```

## 扩展性

### 自定义扩展

#### 扩展日志管理器
```javascript
// 创建自定义日志管理器
class CustomLogManager extends LogManager {
    constructor(aeExtension) {
        super(aeExtension);
        
        // 添加自定义属性
        this.remoteLogger = null;
        this.logEncryption = false;
        this.encryptionKey = null;
        this.logAnonymization = true;
        this.customFormatters = new Map();
        
        // 初始化扩展功能
        this.initCustomFeatures();
    }
    
    initCustomFeatures() {
        // 初始化远程日志记录
        this.initRemoteLogging();
        
        // 添加自定义格式化器
        this.addCustomFormatters();
    }
    
    initRemoteLogging() {
        // 模拟远程日志记录初始化
        // 实际实现中这里会连接到远程日志服务
        console.log('🌐 远程日志记录已初始化');
    }
    
    addCustomFormatters() {
        // 添加JSON格式化器
        this.customFormatters.set('json', (logEntry) => {
            return JSON.stringify(logEntry, null, 2);
        });
        
        // 添加CSV格式化器
        this.customFormatters.set('csv', (logEntry) => {
            return [
                logEntry.timestamp,
                logEntry.level,
                logEntry.module,
                logEntry.message.replace(/,/g, ''),
                JSON.stringify(logEntry.data || {}).replace(/,/g, '')
            ].join(',');
        });
    }
    
    /**
     * 启用远程日志记录
     * @param {string} serverUrl - 服务器URL
     * @param {Object} options - 选项
     */
    enableRemoteLogging(serverUrl, options = {}) {
        this.remoteLogger = {
            serverUrl: serverUrl,
            options: options,
            enabled: true
        };
        
        // 添加远程日志观察者
        this.addLevelObserver('error', (logEntry) => {
            this.sendLogToRemote(logEntry);
        });
        
        this.info('Remote logging enabled', { module: 'logManager', serverUrl: serverUrl });
    }
    
    /**
     * 发送日志到远程服务器
     * @param {Object} logEntry - 日志条目
     */
    async sendLogToRemote(logEntry) {
        if (!this.remoteLogger || !this.remoteLogger.enabled) {
            return;
        }
        
        try {
            // 准备发送的数据
            let sendData = { ...logEntry };
            
            // 匿名化处理
            if (this.logAnonymization) {
                sendData = this.anonymizeLogEntry(sendData);
            }
            
            // 加密处理
            if (this.logEncryption && this.encryptionKey) {
                sendData = this.encryptLogEntry(sendData);
            }
            
            // 发送请求
            const response = await fetch(this.remoteLogger.serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    log: sendData,
                    timestamp: Date.now(),
                    extensionVersion: '2.4.0'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.debug('Log sent to remote server', { module: 'logManager', logId: logEntry.id });
        } catch (error) {
            this.warning(`Failed to send log to remote: ${error.message}`, { 
                module: 'logManager', 
                logId: logEntry.id 
            });
        }
    }
    
    /**
     * 匿名化日志条目
     * @param {Object} logEntry - 日志条目
     * @returns {Object} 匿名化后的日志条目
     */
    anonymizeLogEntry(logEntry) {
        const anonymized = { ...logEntry };
        
        // 移除或修改敏感信息
        if (anonymized.data && anonymized.data.userId) {
            anonymized.data.userId = this.hashUserId(anonymized.data.userId);
        }
        
        if (anonymized.userId) {
            anonymized.userId = this.hashUserId(anonymized.userId);
        }
        
        return anonymized;
    }
    
    /**
     * 加密日志条目
     * @param {Object} logEntry - 日志条目
     * @returns {Object} 加密后的日志条目
     */
    encryptLogEntry(logEntry) {
        // 简单加密示例（实际应用中应使用更强的加密）
        try {
            const encrypted = { ...logEntry };
            encrypted.message = btoa(encodeURIComponent(logEntry.message));
            if (encrypted.data) {
                encrypted.data = btoa(encodeURIComponent(JSON.stringify(logEntry.data)));
            }
            return encrypted;
        } catch (error) {
            this.error(`Log encryption failed: ${error.message}`);
            return logEntry; // 返回原始日志
        }
    }
    
    /**
     * 哈希用户ID
     * @param {string} userId - 用户ID
     * @returns {string} 哈希后的用户ID
     */
    hashUserId(userId) {
        // 简单哈希示例（实际应用中应使用安全哈希算法）
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return `hash_${hash}`;
    }
    
    /**
     * 获取认证令牌
     * @returns {string} 认证令牌
     */
    getAuthToken() {
        return localStorage.getItem('log_auth_token') || '';
    }
    
    /**
     * 格式化日志
     * @param {string} format - 格式类型
     * @param {Object} logEntry - 日志条目
     * @returns {string} 格式化后的日志
     */
    formatLog(format, logEntry) {
        if (this.customFormatters.has(format)) {
            return this.customFormatters.get(format)(logEntry);
        }
        
        // 默认格式化
        return `[${new Date(logEntry.timestamp).toISOString()}] [${logEntry.level}] [${logEntry.module}] ${logEntry.message}`;
    }
    
    /**
     * 导出格式化日志
     * @param {string} format - 格式类型
     * @param {string} filename - 文件名
     */
    exportFormattedLogs(format, filename = `logs.${format}`) {
        const logs = this.getLogEntries();
        const formattedLogs = logs.map(log => this.formatLog(format, log)).join('\n');
        
        const dataUri = `data:text/${format};charset=utf-8,` + encodeURIComponent(formattedLogs);
        
        const exportLink = document.createElement('a');
        exportLink.setAttribute('href', dataUri);
        exportLink.setAttribute('download', filename);
        exportLink.click();
        
        this.info(`Formatted logs exported: ${filename}`, { 
            module: 'logManager', 
            format: format,
            logCount: logs.length 
        });
    }
}

// 使用自定义日志管理器
const customLogManager = new CustomLogManager(aeExtension);

// 启用远程日志记录
// customLogManager.enableRemoteLogging('https://api.example.com/logs');

// 导出CSV格式日志
// customLogManager.exportFormattedLogs('csv', 'logs.csv');

// 导出JSON格式日志
// customLogManager.exportFormattedLogs('json', 'logs.json');
```

#### 插件化架构
```javascript
// 创建日志插件系统
class LogPluginManager {
    constructor(logManager) {
        this.logManager = logManager;
        this.plugins = new Map();
        this.pluginHooks = new Map();
    }
    
    /**
     * 注册日志插件
     * @param {string} pluginId - 插件ID
     * @param {Object} plugin - 插件对象
     */
    registerPlugin(pluginId, plugin) {
        this.plugins.set(pluginId, plugin);
        
        // 绑定插件钩子
        if (plugin.onLogEntry) {
            this.pluginHooks.set(pluginId, this.logManager.addLogObserver((logEntry) => {
                plugin.onLogEntry(logEntry);
            }));
        }
        
        if (plugin.onLogLevel) {
            this.logManager.addLogObserver((logEntry) => {
                if (plugin.shouldHandle(logEntry)) {
                    plugin.onLogLevel(logEntry);
                }
            });
        }
        
        this.logManager.info(`Plugin registered: ${pluginId}`, { 
            module: 'pluginManager',
            pluginId: pluginId
        });
    }
    
    /**
     * 移除日志插件
     * @param {string} pluginId - 插件ID
     */
    removePlugin(pluginId) {
        if (this.plugins.has(pluginId)) {
            // 移除插件观察者
            if (this.pluginHooks.has(pluginId)) {
                const removeObserver = this.pluginHooks.get(pluginId);
                removeObserver();
                this.pluginHooks.delete(pluginId);
            }
            
            this.plugins.delete(pluginId);
            
            this.logManager.info(`Plugin removed: ${pluginId}`, { 
                module: 'pluginManager',
                pluginId: pluginId
            });
        }
    }
}

// 示例插件：错误报告插件
const errorReportingPlugin = {
    id: 'error-reporter',
    name: 'Error Reporting Plugin',
    
    shouldHandle(logEntry) {
        return logEntry.level === 'error' || logEntry.level === 'critical';
    },
    
    onLogEntry(logEntry) {
        console.log(`🚨 Error reported: ${logEntry.message}`);
        
        // 这里可以实现错误报告逻辑
        // 比如发送到错误跟踪服务
        this.reportError(logEntry);
    },
    
    reportError(logEntry) {
        // 模拟错误报告
        console.log(`Sending error report: ${logEntry.message}`);
    }
};

// 示例插件：性能监控插件
const performancePlugin = {
    id: 'performance-monitor',
    name: 'Performance Monitoring Plugin',
    
    shouldHandle(logEntry) {
        return logEntry.module === 'performance';
    },
    
    onLogEntry(logEntry) {
        console.log(`📊 Performance log: ${logEntry.message}`);
        
        // 这里可以实现性能分析逻辑
        this.analyzePerformance(logEntry);
    },
    
    analyzePerformance(logEntry) {
        // 模拟性能分析
        if (logEntry.data && logEntry.data.duration > 1000) {
            console.warn(`⚠️ Slow operation detected: ${logEntry.message}`);
        }
    }
};

// 使用插件管理器
const pluginManager = new LogPluginManager(logManager);
pluginManager.registerPlugin('error-reporter', errorReportingPlugin);
pluginManager.registerPlugin('performance-monitor', performancePlugin);

// 测试插件功能
logManager.error('This error will be reported by the plugin');
logManager.info('Performance: Operation took 1500ms', { 
    module: 'performance', 
    data: { duration: 1500 } 
});