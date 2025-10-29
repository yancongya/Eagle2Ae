# 日志系统

## 概述

日志系统是 Eagle2Ae AE 扩展 JavaScript 核心功能的重要组成部分，提供了分级日志记录、结构化日志格式、日志轮转、远程日志传输等功能。该系统确保应用能够记录详细的运行信息，便于调试、监控和问题排查。

## 核心特性

### 日志系统
- **分级日志** - DEBUG, INFO, WARN, ERROR 四级日志
- **结构化日志** - JSON 格式的日志记录
- **日志轮转** - 防止日志文件过大
- **远程传输** - 支持将日志发送到远程服务器

## 技术实现

### 日志管理器

```javascript
/**
 * 日志管理器
 * 提供完整的日志记录功能
 */
class LogManager {
    /**
     * 构造函数
     */
    constructor() {
        // 配置
        this.config = {
            level: 'INFO',                 // 默认日志级别
            maxFileSize: 5 * 1024 * 1024,  // 最大文件大小 (5MB)
            maxFiles: 10,                  // 最大文件数量
            enableConsole: true,           // 启用控制台输出
            enableFile: false,             // 启用文件输出
            enableRemote: false,           // 启用远程传输
            remoteUrl: null,               // 远程日志服务器URL
            format: 'json',                // 日志格式 (json/simple)
            colors: true                   // 启用控制台颜色
        };
        
        // 日志级别映射
        this.levels = {
            'DEBUG': 0,
            'INFO': 1,
            'WARN': 2,
            'ERROR': 3
        };
        
        // 日志缓冲区
        this.buffer = [];
        
        // 日志文件信息
        this.logFiles = [];
        
        // 远程传输队列
        this.remoteQueue = [];
        
        // 性能统计
        this.stats = {
            totalLogs: 0,
            debugLogs: 0,
            infoLogs: 0,
            warnLogs: 0,
            errorLogs: 0,
            droppedLogs: 0
        };
        
        // 日志处理器
        this.handlers = [];
        
        // 格式化器
        this.formatters = {
            'json': this.formatJson.bind(this),
            'simple': this.formatSimple.bind(this),
            'detailed': this.formatDetailed.bind(this)
        };
        
        console.log('📝 日志管理器已初始化');
    }
    
    /**
     * 配置日志管理器
     * @param {Object} config - 配置选项
     */
    configure(config = {}) {
        try {
            this.config = { ...this.config, ...config };
            console.log('✅ 日志管理器配置已更新');
        } catch (error) {
            console.error(`❌ 日志管理器配置失败: ${error.message}`);
        }
    }
    
    /**
     * 添加日志处理器
     * @param {Function} handler - 处理器函数
     */
    addHandler(handler) {
        try {
            if (typeof handler !== 'function') {
                throw new Error('日志处理器必须是函数');
            }
            
            this.handlers.push(handler);
            console.log('🔧 添加日志处理器');
        } catch (error) {
            console.error(`添加日志处理器失败: ${error.message}`);
        }
    }
    
    /**
     * 移除日志处理器
     * @param {Function} handler - 处理器函数
     */
    removeHandler(handler) {
        try {
            const index = this.handlers.indexOf(handler);
            if (index !== -1) {
                this.handlers.splice(index, 1);
                console.log('🔧 移除日志处理器');
            }
        } catch (error) {
            console.error(`移除日志处理器失败: ${error.message}`);
        }
    }
    
    /**
     * 记录调试日志
     * @param {string} message - 日志消息
     * @param {Object} data - 附加数据
     */
    debug(message, data = {}) {
        this.log('DEBUG', message, data);
    }
    
    /**
     * 记录信息日志
     * @param {string} message - 日志消息
     * @param {Object} data - 附加数据
     */
    info(message, data = {}) {
        this.log('INFO', message, data);
    }
    
    /**
     * 记录警告日志
     * @param {string} message - 日志消息
     * @param {Object} data - 附加数据
     */
    warn(message, data = {}) {
        this.log('WARN', message, data);
    }
    
    /**
     * 记录错误日志
     * @param {string} message - 日志消息
     * @param {Object} data - 附加数据
     */
    error(message, data = {}) {
        this.log('ERROR', message, data);
    }
    
    /**
     * 记录日志
     * @param {string} level - 日志级别
     * @param {string} message - 日志消息
     * @param {Object} data - 附加数据
     */
    log(level, message, data = {}) {
        try {
            // 检查日志级别
            if (this.levels[level] < this.levels[this.config.level]) {
                return;
            }
            
            // 创建日志条目
            const logEntry = {
                timestamp: new Date().toISOString(),
                level: level,
                message: message,
                data: data,
                context: this.getContext()
            };
            
            // 更新统计
            this.updateStats(level);
            
            // 添加到缓冲区
            this.buffer.push(logEntry);
            
            // 处理日志
            this.processLog(logEntry);
            
        } catch (error) {
            console.error(`记录日志失败: ${error.message}`);
        }
    }
    
    /**
     * 处理日志
     * @param {Object} logEntry - 日志条目
     */
    processLog(logEntry) {
        try {
            // 执行自定义处理器
            for (const handler of this.handlers) {
                try {
                    handler(logEntry);
                } catch (handlerError) {
                    console.error(`日志处理器执行失败: ${handlerError.message}`);
                }
            }
            
            // 控制台输出
            if (this.config.enableConsole) {
                this.outputToConsole(logEntry);
            }
            
            // 文件输出
            if (this.config.enableFile) {
                this.outputToFile(logEntry);
            }
            
            // 远程传输
            if (this.config.enableRemote) {
                this.outputToRemote(logEntry);
            }
            
        } catch (error) {
            console.error(`处理日志失败: ${error.message}`);
        }
    }
    
    /**
     * 输出到控制台
     * @param {Object} logEntry - 日志条目
     */
    outputToConsole(logEntry) {
        try {
            const formattedMessage = this.formatLog(logEntry);
            
            // 根据级别使用不同的console方法
            switch (logEntry.level) {
                case 'DEBUG':
                    if (this.config.colors) {
                        console.debug(`%c${formattedMessage}`, 'color: #888;');
                    } else {
                        console.debug(formattedMessage);
                    }
                    break;
                    
                case 'INFO':
                    if (this.config.colors) {
                        console.info(`%c${formattedMessage}`, 'color: #000;');
                    } else {
                        console.info(formattedMessage);
                    }
                    break;
                    
                case 'WARN':
                    if (this.config.colors) {
                        console.warn(`%c${formattedMessage}`, 'color: #f90;');
                    } else {
                        console.warn(formattedMessage);
                    }
                    break;
                    
                case 'ERROR':
                    if (this.config.colors) {
                        console.error(`%c${formattedMessage}`, 'color: #f00;');
                    } else {
                        console.error(formattedMessage);
                    }
                    break;
                    
                default:
                    console.log(formattedMessage);
            }
            
        } catch (error) {
            console.error(`输出到控制台失败: ${error.message}`);
        }
    }
    
    /**
     * 输出到文件
     * @param {Object} logEntry - 日志条目
     */
    outputToFile(logEntry) {
        try {
            // 在浏览器环境中，我们使用LocalStorage模拟文件存储
            const logKey = 'logs_' + new Date().toISOString().split('T')[0];
            const existingLogs = localStorage.getItem(logKey) || '';
            
            const formattedLog = this.formatLog(logEntry) + '\n';
            const newLogs = existingLogs + formattedLog;
            
            // 检查大小限制
            if (newLogs.length > this.config.maxFileSize) {
                // 截断日志
                const lines = newLogs.split('\n');
                let truncatedLogs = '';
                for (let i = lines.length - 1; i >= 0; i--) {
                    if (truncatedLogs.length + lines[i].length + 1 > this.config.maxFileSize * 0.8) {
                        break;
                    }
                    truncatedLogs = lines[i] + '\n' + truncatedLogs;
                }
                localStorage.setItem(logKey, truncatedLogs);
            } else {
                localStorage.setItem(logKey, newLogs);
            }
            
        } catch (error) {
            console.error(`输出到文件失败: ${error.message}`);
            this.stats.droppedLogs++;
        }
    }
    
    /**
     * 输出到远程服务器
     * @param {Object} logEntry - 日志条目
     */
    outputToRemote(logEntry) {
        try {
            // 添加到远程队列
            this.remoteQueue.push(logEntry);
            
            // 批量发送
            if (this.remoteQueue.length >= 10) {
                this.sendRemoteLogs();
            } else {
                // 延迟发送
                setTimeout(() => {
                    if (this.remoteQueue.length > 0) {
                        this.sendRemoteLogs();
                    }
                }, 1000);
            }
            
        } catch (error) {
            console.error(`输出到远程服务器失败: ${error.message}`);
            this.stats.droppedLogs++;
        }
    }
    
    /**
     * 发送远程日志
     */
    async sendRemoteLogs() {
        try {
            if (!this.config.remoteUrl || this.remoteQueue.length === 0) {
                return;
            }
            
            // 取出要发送的日志
            const logsToSend = this.remoteQueue.splice(0, 50);
            
            // 发送到远程服务器
            await fetch(this.config.remoteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    logs: logsToSend,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            });
            
        } catch (error) {
            console.error(`发送远程日志失败: ${error.message}`);
            this.stats.droppedLogs += this.remoteQueue.length;
            this.remoteQueue = [];
        }
    }
    
    /**
     * 格式化日志
     * @param {Object} logEntry - 日志条目
     * @returns {string} 格式化后的日志
     */
    formatLog(logEntry) {
        try {
            const formatter = this.formatters[this.config.format] || this.formatters.json;
            return formatter(logEntry);
        } catch (error) {
            console.error(`格式化日志失败: ${error.message}`);
            return JSON.stringify(logEntry);
        }
    }
    
    /**
     * JSON格式化
     * @param {Object} logEntry - 日志条目
     * @returns {string} 格式化后的日志
     */
    formatJson(logEntry) {
        try {
            return JSON.stringify({
                timestamp: logEntry.timestamp,
                level: logEntry.level,
                message: logEntry.message,
                ...logEntry.data
            });
        } catch (error) {
            return `{"error":"格式化失败","message":"${error.message}"}`;
        }
    }
    
    /**
     * 简单格式化
     * @param {Object} logEntry - 日志条目
     * @returns {string} 格式化后的日志
     */
    formatSimple(logEntry) {
        try {
            return `[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message}`;
        } catch (error) {
            return `[${new Date().toISOString()}] ERROR: 格式化失败 - ${error.message}`;
        }
    }
    
    /**
     * 详细格式化
     * @param {Object} logEntry - 日志条目
     * @returns {string} 格式化后的日志
     */
    formatDetailed(logEntry) {
        try {
            const context = logEntry.context || {};
            const data = Object.keys(logEntry.data).length > 0 ? JSON.stringify(logEntry.data) : '';
            
            return `[${logEntry.timestamp}] ${logEntry.level}: ${logEntry.message} ` +
                   `(Context: ${JSON.stringify(context)}) ${data}`;
        } catch (error) {
            return `[${new Date().toISOString()}] ERROR: 详细格式化失败 - ${error.message}`;
        }
    }
    
    /**
     * 获取上下文信息
     * @returns {Object} 上下文信息
     */
    getContext() {
        try {
            return {
                url: window.location.href,
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            };
        } catch (error) {
            return { error: error.message };
        }
    }
    
    /**
     * 更新统计
     * @param {string} level - 日志级别
     */
    updateStats(level) {
        try {
            this.stats.totalLogs++;
            
            switch (level) {
                case 'DEBUG':
                    this.stats.debugLogs++;
                    break;
                case 'INFO':
                    this.stats.infoLogs++;
                    break;
                case 'WARN':
                    this.stats.warnLogs++;
                    break;
                case 'ERROR':
                    this.stats.errorLogs++;
                    break;
            }
        } catch (error) {
            console.error(`更新统计失败: ${error.message}`);
        }
    }
    
    /**
     * 获取日志统计
     * @returns {Object} 日志统计
     */
    getStats() {
        try {
            return { ...this.stats };
        } catch (error) {
            console.error(`获取日志统计失败: ${error.message}`);
            return {};
        }
    }
    
    /**
     * 清空统计
     */
    clearStats() {
        try {
            this.stats = {
                totalLogs: 0,
                debugLogs: 0,
                infoLogs: 0,
                warnLogs: 0,
                errorLogs: 0,
                droppedLogs: 0
            };
            console.log('📊 日志统计已清空');
        } catch (error) {
            console.error(`清空日志统计失败: ${error.message}`);
        }
    }
    
    /**
     * 获取缓冲区日志
     * @returns {Array} 缓冲区日志
     */
    getBuffer() {
        try {
            return [...this.buffer];
        } catch (error) {
            console.error(`获取缓冲区日志失败: ${error.message}`);
            return [];
        }
    }
    
    /**
     * 清空缓冲区
     */
    clearBuffer() {
        try {
            this.buffer = [];
            console.log('📝 日志缓冲区已清空');
        } catch (error) {
            console.error(`清空日志缓冲区失败: ${error.message}`);
        }
    }
    
    /**
     * 导出日志
     * @returns {string} 日志内容
     */
    exportLogs() {
        try {
            const logs = this.getBuffer();
            return JSON.stringify(logs, null, 2);
        } catch (error) {
            console.error(`导出日志失败: ${error.message}`);
            return '';
        }
    }
    
    /**
     * 销毁日志管理器
     */
    destroy() {
        try {
            // 发送剩余的远程日志
            if (this.remoteQueue.length > 0) {
                this.sendRemoteLogs();
            }
            
            // 清空缓冲区
            this.clearBuffer();
            
            // 清空统计
            this.clearStats();
            
            // 清空处理器
            this.handlers = [];
            
            console.log('🗑️ 日志管理器已销毁');
        } catch (error) {
            console.error(`销毁日志管理器失败: ${error.message}`);
        }
    }
}

// 导出日志管理器
const logManager = new LogManager();
export default logManager;

// 便利的日志函数
export function configureLogger(config = {}) {
    logManager.configure(config);
}

export function debug(message, data = {}) {
    logManager.debug(message, data);
}

export function info(message, data = {}) {
    logManager.info(message, data);
}

export function warn(message, data = {}) {
    logManager.warn(message, data);
}

export function error(message, data = {}) {
    logManager.error(message, data);
}

export function addLogHandler(handler) {
    logManager.addHandler(handler);
}

export function removeLogHandler(handler) {
    logManager.removeHandler(handler);
}

export function getLogStats() {
    return logManager.getStats();
}

export function clearLogStats() {
    logManager.clearStats();
}

export function getLogBuffer() {
    return logManager.getBuffer();
}

export function clearLogBuffer() {
    logManager.clearBuffer();
}

export function exportLogs() {
    return logManager.exportLogs();
}

export function destroyLogger() {
    logManager.destroy();
}

// 创建特定级别的日志函数
export const logger = {
    debug: (message, data) => debug(message, data),
    info: (message, data) => info(message, data),
    warn: (message, data) => warn(message, data),
    error: (message, data) => error(message, data),
    configure: (config) => configureLogger(config),
    stats: () => getLogStats(),
    export: () => exportLogs()
};
```

### 日志级别管理

```javascript
/**
 * 日志级别管理器
 * 管理不同模块的日志级别
 */
class LogLevelManager {
    /**
     * 构造函数
     */
    constructor() {
        // 默认日志级别
        this.defaultLevel = 'INFO';
        
        // 模块特定的日志级别
        this.moduleLevels = new Map();
        
        // 动态级别配置
        this.dynamicLevels = new Map();
        
        console.log('📊 日志级别管理器已初始化');
    }
    
    /**
     * 设置模块日志级别
     * @param {string} module - 模块名
     * @param {string} level - 日志级别
     */
    setModuleLevel(module, level) {
        try {
            if (!this.isValidLevel(level)) {
                throw new Error(`无效的日志级别: ${level}`);
            }
            
            this.moduleLevels.set(module, level);
            console.log(`🔧 设置模块日志级别: ${module} -> ${level}`);
        } catch (error) {
            console.error(`设置模块日志级别失败: ${error.message}`);
        }
    }
    
    /**
     * 获取模块日志级别
     * @param {string} module - 模块名
     * @returns {string} 日志级别
     */
    getModuleLevel(module) {
        try {
            return this.moduleLevels.get(module) || this.defaultLevel;
        } catch (error) {
            console.error(`获取模块日志级别失败: ${error.message}`);
            return this.defaultLevel;
        }
    }
    
    /**
     * 设置动态日志级别
     * @param {string} pattern - 模式
     * @param {string} level - 日志级别
     * @param {number} duration - 持续时间（毫秒）
     */
    setDynamicLevel(pattern, level, duration = 300000) { // 默认5分钟
        try {
            if (!this.isValidLevel(level)) {
                throw new Error(`无效的日志级别: ${level}`);
            }
            
            const entry = {
                level: level,
                expires: Date.now() + duration
            };
            
            this.dynamicLevels.set(pattern, entry);
            
            // 设置过期清理
            setTimeout(() => {
                this.dynamicLevels.delete(pattern);
                console.log(`⏰ 动态日志级别过期: ${pattern}`);
            }, duration);
            
            console.log(`🔧 设置动态日志级别: ${pattern} -> ${level} (${duration}ms)`);
        } catch (error) {
            console.error(`设置动态日志级别失败: ${error.message}`);
        }
    }
    
    /**
     * 获取动态日志级别
     * @param {string} module - 模块名
     * @returns {string|null} 日志级别
     */
    getDynamicLevel(module) {
        try {
            // 检查是否有匹配的动态级别
            for (const [pattern, entry] of this.dynamicLevels) {
                if (this.matchPattern(module, pattern)) {
                    // 检查是否过期
                    if (Date.now() > entry.expires) {
                        this.dynamicLevels.delete(pattern);
                        continue;
                    }
                    
                    return entry.level;
                }
            }
            
            return null;
        } catch (error) {
            console.error(`获取动态日志级别失败: ${error.message}`);
            return null;
        }
    }
    
    /**
     * 匹配模式
     * @param {string} module - 模块名
     * @param {string} pattern - 模式
     * @returns {boolean} 是否匹配
     */
    matchPattern(module, pattern) {
        try {
            // 支持通配符匹配
            if (pattern.includes('*')) {
                const regexPattern = pattern.replace(/\*/g, '.*');
                const regex = new RegExp(`^${regexPattern}$`);
                return regex.test(module);
            }
            
            return module === pattern;
        } catch (error) {
            console.error(`模式匹配失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 检查日志级别是否有效
     * @param {string} level - 日志级别
     * @returns {boolean} 是否有效
     */
    isValidLevel(level) {
        const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        return validLevels.includes(level.toUpperCase());
    }
    
    /**
     * 获取所有模块级别
     * @returns {Object} 模块级别映射
     */
    getAllModuleLevels() {
        try {
            const levels = {};
            for (const [module, level] of this.moduleLevels) {
                levels[module] = level;
            }
            return levels;
        } catch (error) {
            console.error(`获取所有模块级别失败: ${error.message}`);
            return {};
        }
    }
    
    /**
     * 清空模块级别
     */
    clearModuleLevels() {
        try {
            this.moduleLevels.clear();
            console.log('📊 模块日志级别已清空');
        } catch (error) {
            console.error(`清空模块日志级别失败: ${error.message}`);
        }
    }
    
    /**
     * 销毁日志级别管理器
     */
    destroy() {
        try {
            this.moduleLevels.clear();
            this.dynamicLevels.clear();
            console.log('🗑️ 日志级别管理器已销毁');
        } catch (error) {
            console.error(`销毁日志级别管理器失败: ${error.message}`);
        }
    }
}

// 导出日志级别管理器
const logLevelManager = new LogLevelManager();
export { logLevelManager };

// 便利的日志级别管理函数
export function setModuleLogLevel(module, level) {
    logLevelManager.setModuleLevel(module, level);
}

export function getModuleLogLevel(module) {
    return logLevelManager.getModuleLevel(module);
}

export function setDynamicLogLevel(pattern, level, duration) {
    logLevelManager.setDynamicLevel(pattern, level, duration);
}

export function getAllModuleLogLevels() {
    return logLevelManager.getAllModuleLevels();
}

export function clearModuleLogLevels() {
    logLevelManager.clearModuleLevels();
}

export function destroyLogLevelManager() {
    logLevelManager.destroy();
}
```

### 结构化日志

```javascript
/**
 * 结构化日志记录器
 * 提供结构化的日志记录功能
 */
class StructuredLogger {
    /**
     * 构造函数
     */
    constructor() {
        // 日志字段
        this.fields = {
            timestamp: true,
            level: true,
            message: true,
            module: true,
            context: true,
            data: true,
            traceId: true,
            spanId: true
        };
        
        // 日志元数据
        this.metadata = {};
        
        // 跟踪ID生成器
        this.traceIdGenerator = this.generateTraceId.bind(this);
        
        console.log('📋 结构化日志记录器已初始化');
    }
    
    /**
     * 创建结构化日志记录器实例
     * @param {string} module - 模块名
     * @param {Object} metadata - 元数据
     * @returns {Object} 日志记录器实例
     */
    createLogger(module, metadata = {}) {
        return new StructuredLoggerInstance(module, { ...this.metadata, ...metadata }, this);
    }
    
    /**
     * 设置日志字段
     * @param {Object} fields - 字段配置
     */
    setFields(fields) {
        this.fields = { ...this.fields, ...fields };
    }
    
    /**
     * 设置元数据
     * @param {Object} metadata - 元数据
     */
    setMetadata(metadata) {
        this.metadata = { ...this.metadata, ...metadata };
    }
    
    /**
     * 生成跟踪ID
     * @returns {string} 跟踪ID
     */
    generateTraceId() {
        return 'trace_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 生成跨度ID
     * @returns {string} 跨度ID
     */
    generateSpanId() {
        return 'span_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * 销毁结构化日志记录器
     */
    destroy() {
        console.log('🗑️ 结构化日志记录器已销毁');
    }
}

/**
 * 结构化日志记录器实例
 */
class StructuredLoggerInstance {
    /**
     * 构造函数
     * @param {string} module - 模块名
     * @param {Object} metadata - 元数据
     * @param {StructuredLogger} parent - 父记录器
     */
    constructor(module, metadata = {}, parent) {
        this.module = module;
        this.metadata = metadata;
        this.parent = parent;
        this.traceId = parent.traceIdGenerator();
    }
    
    /**
     * 记录调试日志
     * @param {string} message - 消息
     * @param {Object} data - 数据
     */
    debug(message, data = {}) {
        this.log('DEBUG', message, data);
    }
    
    /**
     * 记录信息日志
     * @param {string} message - 消息
     * @param {Object} data - 数据
     */
    info(message, data = {}) {
        this.log('INFO', message, data);
    }
    
    /**
     * 记录警告日志
     * @param {string} message - 消息
     * @param {Object} data - 数据
     */
    warn(message, data = {}) {
        this.log('WARN', message, data);
    }
    
    /**
     * 记录错误日志
     * @param {string} message - 消息
     * @param {Object} data - 数据
     */
    error(message, data = {}) {
        this.log('ERROR', message, data);
    }
    
    /**
     * 记录日志
     * @param {string} level - 级别
     * @param {string} message - 消息
     * @param {Object} data - 数据
     */
    log(level, message, data = {}) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                level: level,
                message: message,
                module: this.module,
                traceId: this.traceId,
                spanId: this.parent.generateSpanId(),
                metadata: this.metadata,
                data: data
            };
            
            // 使用全局日志管理器记录
            logManager.log(level, message, logEntry);
            
        } catch (error) {
            console.error(`记录结构化日志失败: ${error.message}`);
        }
    }
    
    /**
     * 创建子记录器
     * @param {string} subModule - 子模块名
     * @param {Object} metadata - 元数据
     * @returns {StructuredLoggerInstance} 子记录器
     */
    createSubLogger(subModule, metadata = {}) {
        const fullModule = `${this.module}.${subModule}`;
        const combinedMetadata = { ...this.metadata, ...metadata };
        return new StructuredLoggerInstance(fullModule, combinedMetadata, this.parent);
    }
}

// 导出结构化日志记录器
const structuredLogger = new StructuredLogger();
export { structuredLogger };

// 便利的结构化日志函数
export function createStructuredLogger(module, metadata = {}) {
    return structuredLogger.createLogger(module, metadata);
}

export function setStructuredLogFields(fields) {
    structuredLogger.setFields(fields);
}

export function setStructuredLogMetadata(metadata) {
    structuredLogger.setMetadata(metadata);
}

export function destroyStructuredLogger() {
    structuredLogger.destroy();
}
```

## 使用示例

### 基本日志记录

```javascript
// 1. 基本使用
import { logger, debug, info, warn, error } from './logging-system.js';

// 配置日志管理器
logger.configure({
    level: 'DEBUG',
    enableConsole: true,
    enableRemote: true,
    remoteUrl: '/api/logs'
});

// 记录不同级别的日志
debug('调试信息', { userId: 123, action: 'login' });
info('用户登录成功', { userId: 123, username: 'john_doe' });
warn('用户密码即将过期', { userId: 123, daysLeft: 3 });
error('数据库连接失败', { 
    error: 'Connection timeout', 
    host: 'db.example.com' 
});
```

### 模块化日志记录

```javascript
// 1. 模块特定日志级别
import { setModuleLogLevel, createStructuredLogger } from './logging-system.js';

// 为特定模块设置日志级别
setModuleLogLevel('auth', 'DEBUG');
setModuleLogLevel('database', 'WARN');

// 创建模块化日志记录器
const authLogger = createStructuredLogger('auth', {
    version: '1.0.0',
    environment: 'production'
});

const dbLogger = createStructuredLogger('database', {
    version: '1.0.0',
    environment: 'production'
});

// 使用模块化日志记录器
authLogger.info('用户认证', { username: 'john_doe' });
dbLogger.error('查询失败', { query: 'SELECT * FROM users', error: 'Timeout' });
```

### 结构化日志

```javascript
// 1. 结构化日志记录
import { createStructuredLogger } from './logging-system.js';

// 创建结构化日志记录器
const apiLogger = createStructuredLogger('api', {
    service: 'user-service',
    version: '2.1.0'
});

// 记录结构化日志
apiLogger.info('API请求处理', {
    method: 'GET',
    path: '/api/users/123',
    statusCode: 200,
    duration: 45,
    userId: 123
});

// 创建子记录器
const userApiLogger = apiLogger.createSubLogger('users');
userApiLogger.debug('用户数据获取', {
    userId: 123,
    fields: ['name', 'email'],
    cacheHit: true
});
```

### 动态日志级别

```javascript
// 1. 动态调整日志级别
import { setDynamicLogLevel, logger } from './logging-system.js';

// 临时提高特定模块的日志级别
setDynamicLogLevel('auth.*', 'DEBUG', 300000); // 5分钟

// 临时提高所有日志级别用于调试
setDynamicLogLevel('*', 'DEBUG', 60000); // 1分钟

// 在调试期间记录详细日志
logger.debug('详细调试信息', {
    state: { user: { id: 123, name: 'John' } },
    action: 'update_profile',
    changes: { email: 'new@example.com' }
});
```

### 日志处理器

```javascript
// 1. 自定义日志处理器
import { addLogHandler, removeLogHandler } from './logging-system.js';

// 添加自定义日志处理器
const customHandler = (logEntry) => {
    // 发送到第三方日志服务
    if (logEntry.level === 'ERROR') {
        // 发送错误到错误跟踪服务
        sendToErrorTracker(logEntry);
    }
    
    // 记录性能指标
    if (logEntry.data && logEntry.data.duration) {
        recordPerformanceMetric(logEntry);
    }
};

addLogHandler(customHandler);

// 在适当时候移除处理器
// removeLogHandler(customHandler);
```

## 最佳实践

### 日志记录原则

1. **有意义的日志** - 记录有助于调试和监控的信息
2. **适当的级别** - 根据重要性选择合适的日志级别
3. **结构化数据** - 使用结构化数据便于分析
4. **避免敏感信息** - 不要在日志中记录密码等敏感信息

### 性能优化

1. **异步记录** - 避免日志记录阻塞主流程
2. **批量发送** - 批量发送远程日志减少网络请求
3. **缓冲机制** - 使用缓冲区减少I/O操作
4. **级别控制** - 在生产环境中适当提高日志级别

### 监控和分析

1. **日志聚合** - 将日志集中存储便于分析
2. **实时监控** - 实时监控关键日志指标
3. **告警机制** - 对重要错误设置告警
4. **趋势分析** - 分析日志趋势发现潜在问题