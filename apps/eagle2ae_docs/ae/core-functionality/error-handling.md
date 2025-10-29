# 错误处理

## 概述

错误处理是 Eagle2Ae AE 扩展 JavaScript 核心功能的重要组成部分，提供了统一的错误处理机制、错误恢复策略和详细的错误日志记录功能。该系统确保应用在出现异常情况时能够优雅地处理错误并提供有用的调试信息。

## 核心特性

### 错误处理
- **统一错误处理** - 集中的错误捕获和处理机制
- **错误分类管理** - 不同类型错误的分类和处理策略
- **错误恢复机制** - 自动恢复和降级处理
- **详细日志记录** - 完整的错误信息和堆栈跟踪

## 技术实现

### 统一错误处理

```javascript
/**
 * 统一错误处理器
 * 提供集中化的错误处理机制
 */
class ErrorHandler {
    /**
     * 构造函数
     */
    constructor() {
        // 配置参数
        this.config = {
            enableLogging: true,           // 启用日志记录
            enableReporting: false,        // 启用错误报告
            reportEndpoint: '/api/errors', // 错误报告端点
            maxErrorHistory: 100,          // 最大错误历史记录数
            enableRecovery: true,          // 启用错误恢复
            recoveryAttempts: 3            // 最大恢复尝试次数
        };
        
        // 错误历史
        this.errorHistory = [];
        
        // 错误统计
        this.errorStats = {
            totalErrors: 0,
            totalHandled: 0,
            totalReported: 0,
            byType: new Map(),
            bySeverity: new Map()
        };
        
        // 错误恢复策略
        this.recoveryStrategies = new Map();
        
        // 全局错误处理
        this.setupGlobalErrorHandling();
        
        console.log('🛡️ 错误处理器已初始化');
    }
    
    /**
     * 设置全局错误处理
     */
    setupGlobalErrorHandling() {
        try {
            // 捕获未处理的JavaScript错误
            window.addEventListener('error', (event) => {
                this.handleError({
                    type: 'javascript',
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error
                });
            });
            
            // 捕获未处理的Promise拒绝
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError({
                    type: 'promise',
                    message: event.reason?.message || String(event.reason),
                    reason: event.reason,
                    promise: event.promise
                });
                
                // 防止默认处理
                event.preventDefault();
            });
            
            console.log('✅ 全局错误处理已设置');
        } catch (error) {
            console.error(`设置全局错误处理失败: ${error.message}`);
        }
    }
    
    /**
     * 处理错误
     * @param {Object} errorInfo - 错误信息
     */
    async handleError(errorInfo) {
        try {
            // 增加错误计数
            this.errorStats.totalErrors++;
            
            // 标准化错误信息
            const standardizedError = this.standardizeError(errorInfo);
            
            // 记录错误日志
            if (this.config.enableLogging) {
                this.logError(standardizedError);
            }
            
            // 更新错误统计
            this.updateErrorStats(standardizedError);
            
            // 添加到错误历史
            this.addToErrorHistory(standardizedError);
            
            // 尝试错误恢复
            if (this.config.enableRecovery) {
                await this.attemptRecovery(standardizedError);
            }
            
            // 报告错误
            if (this.config.enableReporting) {
                await this.reportError(standardizedError);
            }
            
            // 触发错误事件
            this.emitErrorEvent(standardizedError);
            
            // 增加已处理计数
            this.errorStats.totalHandled++;
            
        } catch (handlerError) {
            console.error(`错误处理过程中发生错误: ${handlerError.message}`);
        }
    }
    
    /**
     * 标准化错误信息
     * @param {Object} errorInfo - 错误信息
     * @returns {Object} 标准化后的错误信息
     */
    standardizeError(errorInfo) {
        try {
            const timestamp = Date.now();
            const id = this.generateErrorId();
            
            // 提取错误详情
            const details = {
                stack: errorInfo.error?.stack || errorInfo.reason?.stack || '',
                message: errorInfo.message || errorInfo.reason?.message || String(errorInfo.reason),
                name: errorInfo.error?.name || errorInfo.reason?.name || 'UnknownError',
                filename: errorInfo.filename || '',
                lineno: errorInfo.lineno || 0,
                colno: errorInfo.colno || 0
            };
            
            // 确定错误严重性
            const severity = this.determineSeverity(errorInfo);
            
            // 确定错误类型
            const type = errorInfo.type || this.determineErrorType(errorInfo);
            
            return {
                id: id,
                timestamp: timestamp,
                type: type,
                severity: severity,
                details: details,
                original: errorInfo
            };
        } catch (error) {
            console.error(`标准化错误信息失败: ${error.message}`);
            return {
                id: this.generateErrorId(),
                timestamp: Date.now(),
                type: 'unknown',
                severity: 'medium',
                details: {
                    message: 'Error standardization failed',
                    stack: error.stack || ''
                },
                original: errorInfo
            };
        }
    }
    
    /**
     * 确定错误严重性
     * @param {Object} errorInfo - 错误信息
     * @returns {string} 严重性级别
     */
    determineSeverity(errorInfo) {
        try {
            // 根据错误类型确定严重性
            switch (errorInfo.type) {
                case 'network':
                    return 'high';
                case 'security':
                    return 'critical';
                case 'validation':
                    return 'low';
                case 'javascript':
                    // 根据错误消息关键词判断
                    if (errorInfo.message?.includes('undefined') || 
                        errorInfo.message?.includes('null')) {
                        return 'medium';
                    }
                    return 'high';
                default:
                    return 'medium';
            }
        } catch (error) {
            console.error(`确定错误严重性失败: ${error.message}`);
            return 'medium';
        }
    }
    
    /**
     * 确定错误类型
     * @param {Object} errorInfo - 错误信息
     * @returns {string} 错误类型
     */
    determineErrorType(errorInfo) {
        try {
            // 根据错误对象类型判断
            if (errorInfo.error instanceof TypeError) {
                return 'type';
            } else if (errorInfo.error instanceof ReferenceError) {
                return 'reference';
            } else if (errorInfo.error instanceof SyntaxError) {
                return 'syntax';
            } else if (errorInfo.reason instanceof Error) {
                return 'promise';
            } else if (typeof errorInfo.reason === 'string' && 
                      (errorInfo.reason.includes('Network') || 
                       errorInfo.reason.includes('fetch'))) {
                return 'network';
            }
            
            return 'unknown';
        } catch (error) {
            console.error(`确定错误类型失败: ${error.message}`);
            return 'unknown';
        }
    }
    
    /**
     * 记录错误日志
     * @param {Object} error - 错误对象
     */
    logError(error) {
        try {
            const { severity, type, details } = error;
            const message = `[${severity.toUpperCase()}] ${type}: ${details.message}`;
            
            // 根据严重性使用不同的日志级别
            switch (severity) {
                case 'critical':
                    console.error(`❌ ${message}`, error);
                    break;
                case 'high':
                    console.warn(`⚠️ ${message}`, error);
                    break;
                case 'medium':
                    console.warn(`⚠️ ${message}`);
                    break;
                case 'low':
                    console.info(`ℹ️ ${message}`);
                    break;
                default:
                    console.log(`📋 ${message}`);
            }
        } catch (error) {
            console.error(`记录错误日志失败: ${error.message}`);
        }
    }
    
    /**
     * 更新错误统计
     * @param {Object} error - 错误对象
     */
    updateErrorStats(error) {
        try {
            // 按类型统计
            const typeCount = this.errorStats.byType.get(error.type) || 0;
            this.errorStats.byType.set(error.type, typeCount + 1);
            
            // 按严重性统计
            const severityCount = this.errorStats.bySeverity.get(error.severity) || 0;
            this.errorStats.bySeverity.set(error.severity, severityCount + 1);
        } catch (error) {
            console.error(`更新错误统计失败: ${error.message}`);
        }
    }
    
    /**
     * 添加到错误历史
     * @param {Object} error - 错误对象
     */
    addToErrorHistory(error) {
        try {
            this.errorHistory.push(error);
            
            // 限制历史记录数量
            if (this.errorHistory.length > this.config.maxErrorHistory) {
                this.errorHistory.shift();
            }
        } catch (error) {
            console.error(`添加到错误历史失败: ${error.message}`);
        }
    }
    
    /**
     * 尝试错误恢复
     * @param {Object} error - 错误对象
     */
    async attemptRecovery(error) {
        try {
            const { type, severity } = error;
            
            // 检查是否有对应的恢复策略
            if (this.recoveryStrategies.has(type)) {
                const strategy = this.recoveryStrategies.get(type);
                await strategy(error);
                return;
            }
            
            // 根据严重性应用通用恢复策略
            switch (severity) {
                case 'critical':
                    this.handleCriticalError(error);
                    break;
                case 'high':
                    this.handleHighError(error);
                    break;
                case 'medium':
                    this.handleMediumError(error);
                    break;
                case 'low':
                    this.handleLowError(error);
                    break;
            }
        } catch (recoveryError) {
            console.error(`错误恢复失败: ${recoveryError.message}`);
        }
    }
    
    /**
     * 处理严重错误
     * @param {Object} error - 错误对象
     */
    handleCriticalError(error) {
        try {
            console.error('🚨 发生严重错误，应用可能无法正常运行');
            
            // 显示用户友好的错误消息
            this.showUserError('应用遇到严重错误，请刷新页面重试', 'critical');
            
            // 可以考虑记录到服务器或触发应用重启
        } catch (handlerError) {
            console.error(`处理严重错误失败: ${handlerError.message}`);
        }
    }
    
    /**
     * 处理高优先级错误
     * @param {Object} error - 错误对象
     */
    handleHighError(error) {
        try {
            console.warn('⚠️ 发生高优先级错误');
            
            // 显示警告消息
            this.showUserError('操作未能完成，请稍后重试', 'warning');
            
            // 可以尝试重新执行操作
        } catch (handlerError) {
            console.error(`处理高优先级错误失败: ${handlerError.message}`);
        }
    }
    
    /**
     * 处理中等优先级错误
     * @param {Object} error - 错误对象
     */
    handleMediumError(error) {
        try {
            console.warn('⚠️ 发生中等优先级错误');
            
            // 记录错误但不显示给用户
            // 或显示非侵入性提示
        } catch (handlerError) {
            console.error(`处理中等优先级错误失败: ${handlerError.message}`);
        }
    }
    
    /**
     * 处理低优先级错误
     * @param {Object} error - 错误对象
     */
    handleLowError(error) {
        try {
            console.info('ℹ️ 发生低优先级错误');
            
            // 仅记录日志
        } catch (handlerError) {
            console.error(`处理低优先级错误失败: ${handlerError.message}`);
        }
    }
    
    /**
     * 显示用户错误消息
     * @param {string} message - 错误消息
     * @param {string} type - 消息类型
     */
    showUserError(message, type = 'error') {
        try {
            // 这里可以实现具体的用户界面错误显示逻辑
            // 例如：显示toast消息、模态框等
            
            console.log(`[${type.toUpperCase()}] 用户消息: ${message}`);
            
            // 示例实现（在实际应用中需要根据UI框架调整）
            if (typeof window !== 'undefined' && window.showNotification) {
                window.showNotification(message, type);
            }
        } catch (error) {
            console.error(`显示用户错误消息失败: ${error.message}`);
        }
    }
    
    /**
     * 报告错误
     * @param {Object} error - 错误对象
     */
    async reportError(error) {
        try {
            // 发送错误报告到服务器
            const response = await fetch(this.config.reportEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: error,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now(),
                    url: window.location.href
                })
            });
            
            if (response.ok) {
                this.errorStats.totalReported++;
                console.log('✅ 错误报告已发送');
            } else {
                console.warn(`⚠️ 错误报告发送失败: ${response.status}`);
            }
        } catch (reportError) {
            console.error(`错误报告发送失败: ${reportError.message}`);
        }
    }
    
    /**
     * 触发错误事件
     * @param {Object} error - 错误对象
     */
    emitErrorEvent(error) {
        try {
            if (typeof CustomEvent !== 'undefined' && typeof document !== 'undefined') {
                const event = new CustomEvent('app:error', {
                    detail: error
                });
                document.dispatchEvent(event);
            }
        } catch (error) {
            console.error(`触发错误事件失败: ${error.message}`);
        }
    }
    
    /**
     * 注册恢复策略
     * @param {string} errorType - 错误类型
     * @param {Function} strategy - 恢复策略函数
     */
    registerRecoveryStrategy(errorType, strategy) {
        try {
            if (typeof strategy !== 'function') {
                throw new Error('恢复策略必须是函数');
            }
            
            this.recoveryStrategies.set(errorType, strategy);
            console.log(`✅ 注册恢复策略: ${errorType}`);
        } catch (error) {
            console.error(`注册恢复策略失败: ${error.message}`);
        }
    }
    
    /**
     * 生成错误ID
     * @returns {string} 错误ID
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 获取错误统计
     * @returns {Object} 错误统计信息
     */
    getErrorStats() {
        try {
            return {
                ...this.errorStats,
                historyCount: this.errorHistory.length
            };
        } catch (error) {
            console.error(`获取错误统计失败: ${error.message}`);
            return {};
        }
    }
    
    /**
     * 获取错误历史
     * @param {number} limit - 限制数量
     * @returns {Array} 错误历史数组
     */
    getErrorHistory(limit = 10) {
        try {
            return this.errorHistory.slice(-limit);
        } catch (error) {
            console.error(`获取错误历史失败: ${error.message}`);
            return [];
        }
    }
    
    /**
     * 清空错误历史
     */
    clearErrorHistory() {
        try {
            this.errorHistory = [];
            console.log('🗑️ 错误历史已清空');
        } catch (error) {
            console.error(`清空错误历史失败: ${error.message}`);
        }
    }
    
    /**
     * 重置错误统计
     */
    resetErrorStats() {
        try {
            this.errorStats = {
                totalErrors: 0,
                totalHandled: 0,
                totalReported: 0,
                byType: new Map(),
                bySeverity: new Map()
            };
            console.log('📊 错误统计已重置');
        } catch (error) {
            console.error(`重置错误统计失败: ${error.message}`);
        }
    }
    
    /**
     * 销毁错误处理器
     */
    destroy() {
        try {
            // 移除全局错误处理
            window.removeEventListener('error', this.handleError);
            window.removeEventListener('unhandledrejection', this.handleError);
            
            // 清空数据
            this.clearErrorHistory();
            this.resetErrorStats();
            this.recoveryStrategies.clear();
            
            console.log('🛡️ 错误处理器已销毁');
        } catch (error) {
            console.error(`销毁错误处理器失败: ${error.message}`);
        }
    }
}

// 导出错误处理器
const errorHandler = new ErrorHandler();
export default errorHandler;

// 便利的错误处理函数
export function initErrorHandler(config = {}) {
    Object.assign(errorHandler.config, config);
    return errorHandler;
}

export function handleError(errorInfo) {
    return errorHandler.handleError(errorInfo);
}

export function registerErrorRecovery(type, strategy) {
    return errorHandler.registerRecoveryStrategy(type, strategy);
}

export function getErrorStats() {
    return errorHandler.getErrorStats();
}

export function getErrorHistory(limit = 10) {
    return errorHandler.getErrorHistory(limit);
}

export function clearErrorHistory() {
    return errorHandler.clearErrorHistory();
}

export function resetErrorStats() {
    return errorHandler.resetErrorStats();
}

export function destroyErrorHandler() {
    return errorHandler.destroy();
}
```

### 错误分类管理

```javascript
/**
 * 错误分类管理器
 * 对不同类型错误进行分类和管理
 */
class ErrorCategoryManager {
    /**
     * 构造函数
     */
    constructor() {
        // 错误分类配置
        this.categories = {
            network: {
                name: '网络错误',
                description: '与网络请求相关的错误',
                patterns: [
                    /network/i,
                    /fetch/i,
                    /timeout/i,
                    /connection/i
                ],
                severity: 'high',
                recoveryStrategy: 'retry'
            },
            validation: {
                name: '验证错误',
                description: '数据验证相关的错误',
                patterns: [
                    /validation/i,
                    /invalid/i,
                    /required/i,
                    /format/i
                ],
                severity: 'low',
                recoveryStrategy: 'user-input'
            },
            authentication: {
                name: '认证错误',
                description: '用户认证相关的错误',
                patterns: [
                    /auth/i,
                    /login/i,
                    /token/i,
                    /unauthorized/i
                ],
                severity: 'high',
                recoveryStrategy: 're-authenticate'
            },
            permission: {
                name: '权限错误',
                description: '权限不足相关的错误',
                patterns: [
                    /permission/i,
                    /access/i,
                    /forbidden/i,
                    /denied/i
                ],
                severity: 'high',
                recoveryStrategy: 'redirect'
            },
            resource: {
                name: '资源错误',
                description: '资源加载或访问相关的错误',
                patterns: [
                    /resource/i,
                    /not found/i,
                    /404/i,
                    /missing/i
                ],
                severity: 'medium',
                recoveryStrategy: 'fallback'
            },
            system: {
                name: '系统错误',
                description: '系统级错误',
                patterns: [
                    /system/i,
                    /internal/i,
                    /server/i,
                    /500/i
                ],
                severity: 'critical',
                recoveryStrategy: 'retry-or-fallback'
            }
        };
        
        // 自定义错误分类
        this.customCategories = new Map();
        
        console.log('🗂️ 错误分类管理器已初始化');
    }
    
    /**
     * 分类错误
     * @param {Object} error - 错误对象
     * @returns {Object} 分类结果
     */
    categorizeError(error) {
        try {
            const message = error.message || error.reason?.message || String(error.reason);
            const stack = error.stack || error.reason?.stack || '';
            
            // 合并消息和堆栈用于匹配
            const fullText = `${message} ${stack}`.toLowerCase();
            
            // 检查预定义分类
            for (const [categoryKey, category] of Object.entries(this.categories)) {
                // 检查消息模式
                for (const pattern of category.patterns) {
                    if (pattern.test(fullText)) {
                        return {
                            category: categoryKey,
                            name: category.name,
                            description: category.description,
                            severity: category.severity,
                            recoveryStrategy: category.recoveryStrategy
                        };
                    }
                }
            }
            
            // 检查自定义分类
            for (const [categoryKey, category] of this.customCategories) {
                // 检查消息模式
                for (const pattern of category.patterns) {
                    if (pattern.test(fullText)) {
                        return {
                            category: categoryKey,
                            name: category.name,
                            description: category.description,
                            severity: category.severity,
                            recoveryStrategy: category.recoveryStrategy
                        };
                    }
                }
            }
            
            // 未知分类
            return {
                category: 'unknown',
                name: '未知错误',
                description: '无法分类的错误',
                severity: 'medium',
                recoveryStrategy: 'generic'
            };
        } catch (error) {
            console.error(`错误分类失败: ${error.message}`);
            return {
                category: 'unknown',
                name: '未知错误',
                description: '错误分类过程失败',
                severity: 'medium',
                recoveryStrategy: 'generic'
            };
        }
    }
    
    /**
     * 添加自定义分类
     * @param {string} key - 分类键
     * @param {Object} category - 分类配置
     */
    addCustomCategory(key, category) {
        try {
            // 验证配置
            if (!category.name || !Array.isArray(category.patterns)) {
                throw new Error('分类配置无效');
            }
            
            // 转换模式为正则表达式
            const patterns = category.patterns.map(pattern => 
                typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern
            );
            
            this.customCategories.set(key, {
                ...category,
                patterns: patterns
            });
            
            console.log(`✅ 添加自定义错误分类: ${key}`);
        } catch (error) {
            console.error(`添加自定义分类失败: ${error.message}`);
        }
    }
    
    /**
     * 移除自定义分类
     * @param {string} key - 分类键
     */
    removeCustomCategory(key) {
        try {
            const result = this.customCategories.delete(key);
            if (result) {
                console.log(`🗑️ 移除自定义错误分类: ${key}`);
            } else {
                console.warn(`⚠️ 自定义错误分类不存在: ${key}`);
            }
        } catch (error) {
            console.error(`移除自定义分类失败: ${error.message}`);
        }
    }
    
    /**
     * 获取所有分类
     * @returns {Object} 所有分类
     */
    getAllCategories() {
        try {
            const allCategories = { ...this.categories };
            
            for (const [key, category] of this.customCategories) {
                allCategories[key] = category;
            }
            
            return allCategories;
        } catch (error) {
            console.error(`获取所有分类失败: ${error.message}`);
            return {};
        }
    }
    
    /**
     * 根据分类获取处理策略
     * @param {string} category - 分类
     * @returns {string} 处理策略
     */
    getRecoveryStrategy(category) {
        try {
            // 检查预定义分类
            if (this.categories[category]) {
                return this.categories[category].recoveryStrategy;
            }
            
            // 检查自定义分类
            if (this.customCategories.has(category)) {
                return this.customCategories.get(category).recoveryStrategy;
            }
            
            // 默认策略
            return 'generic';
        } catch (error) {
            console.error(`获取恢复策略失败: ${error.message}`);
            return 'generic';
        }
    }
    
    /**
     * 销毁错误分类管理器
     */
    destroy() {
        try {
            this.customCategories.clear();
            console.log('🗂️ 错误分类管理器已销毁');
        } catch (error) {
            console.error(`销毁错误分类管理器失败: ${error.message}`);
        }
    }
}

// 导出错误分类管理器
const errorCategoryManager = new ErrorCategoryManager();
export { errorCategoryManager };

// 便利的错误分类函数
export function categorizeError(error) {
    return errorCategoryManager.categorizeError(error);
}

export function addCustomErrorCategory(key, category) {
    return errorCategoryManager.addCustomCategory(key, category);
}

export function removeCustomErrorCategory(key) {
    return errorCategoryManager.removeCustomCategory(key);
}

export function getAllErrorCategories() {
    return errorCategoryManager.getAllCategories();
}

export function getErrorRecoveryStrategy(category) {
    return errorCategoryManager.getRecoveryStrategy(category);
}

export function destroyErrorCategoryManager() {
    return errorCategoryManager.destroy();
}
```

### 错误恢复机制

```javascript
/**
 * 错误恢复管理器
 * 提供自动恢复和降级处理机制
 */
class ErrorRecoveryManager {
    /**
     * 构造函数
     */
    constructor() {
        // 恢复策略
        this.strategies = {
            retry: this.retryStrategy.bind(this),
            fallback: this.fallbackStrategy.bind(this),
            're-authenticate': this.reAuthenticateStrategy.bind(this),
            'user-input': this.userInputStrategy.bind(this),
            redirect: this.redirectStrategy.bind(this),
            'retry-or-fallback': this.retryOrFallbackStrategy.bind(this),
            generic: this.genericStrategy.bind(this)
        };
        
        // 恢复配置
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            exponentialBackoff: true,
            fallbackTimeout: 5000
        };
        
        // 恢复历史
        this.recoveryHistory = [];
        
        // 恢复统计
        this.recoveryStats = {
            totalAttempts: 0,
            totalSuccess: 0,
            totalFailures: 0,
            byStrategy: new Map()
        };
        
        console.log('🔧 错误恢复管理器已初始化');
    }
    
    /**
     * 执行恢复策略
     * @param {Object} error - 错误对象
     * @param {string} strategy - 策略名称
     * @param {Object} context - 上下文信息
     * @returns {Object} 恢复结果
     */
    async executeRecovery(error, strategy, context = {}) {
        try {
            // 增加尝试计数
            this.recoveryStats.totalAttempts++;
            
            // 获取策略函数
            const strategyFn = this.strategies[strategy];
            if (!strategyFn) {
                throw new Error(`未知的恢复策略: ${strategy}`);
            }
            
            // 更新策略统计
            const strategyCount = this.recoveryStats.byStrategy.get(strategy) || 0;
            this.recoveryStats.byStrategy.set(strategy, strategyCount + 1);
            
            console.log(`🔧 执行恢复策略: ${strategy}`);
            
            // 执行恢复策略
            const result = await strategyFn(error, context);
            
            // 记录恢复历史
            this.recordRecoveryAttempt({
                strategy: strategy,
                error: error,
                context: context,
                result: result,
                timestamp: Date.now()
            });
            
            // 更新成功统计
            if (result.success) {
                this.recoveryStats.totalSuccess++;
                console.log(`✅ 恢复成功: ${strategy}`);
            } else {
                this.recoveryStats.totalFailures++;
                console.warn(`⚠️ 恢复失败: ${strategy}`);
            }
            
            return result;
        } catch (recoveryError) {
            console.error(`执行恢复策略失败: ${recoveryError.message}`);
            
            // 记录失败历史
            this.recordRecoveryAttempt({
                strategy: strategy,
                error: error,
                context: context,
                result: { success: false, error: recoveryError.message },
                timestamp: Date.now()
            });
            
            this.recoveryStats.totalFailures++;
            
            return {
                success: false,
                error: recoveryError.message
            };
        }
    }
    
    /**
     * 重试策略
     * @param {Object} error - 错误对象
     * @param {Object} context - 上下文信息
     * @returns {Object} 恢复结果
     */
    async retryStrategy(error, context) {
        try {
            const { operation, maxRetries = this.config.maxRetries } = context;
            
            if (!operation || typeof operation !== 'function') {
                return {
                    success: false,
                    error: '无效的操作函数'
                };
            }
            
            // 尝试重试
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`🔄 重试尝试 ${attempt}/${maxRetries}`);
                    
                    // 计算延迟时间
                    let delay = this.config.retryDelay;
                    if (this.config.exponentialBackoff) {
                        delay = delay * Math.pow(2, attempt - 1);
                    }
                    
                    // 延迟重试
                    if (delay > 0) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                    
                    // 执行操作
                    const result = await operation();
                    
                    return {
                        success: true,
                        result: result,
                        attempts: attempt
                    };
                } catch (retryError) {
                    console.warn(`⚠️ 重试失败 (${attempt}/${maxRetries}): ${retryError.message}`);
                    
                    // 最后一次尝试失败
                    if (attempt === maxRetries) {
                        return {
                            success: false,
                            error: retryError.message,
                            attempts: attempt
                        };
                    }
                }
            }
        } catch (error) {
            console.error(`重试策略执行失败: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 降级策略
     * @param {Object} error - 错误对象
     * @param {Object} context - 上下文信息
     * @returns {Object} 恢复结果
     */
    async fallbackStrategy(error, context) {
        try {
            const { fallbackOperation, timeout = this.config.fallbackTimeout } = context;
            
            if (!fallbackOperation || typeof fallbackOperation !== 'function') {
                return {
                    success: false,
                    error: '无效的降级操作函数'
                };
            }
            
            console.log('🔄 执行降级策略');
            
            // 带超时的降级操作
            const fallbackPromise = fallbackOperation();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('降级操作超时')), timeout);
            });
            
            try {
                const result = await Promise.race([fallbackPromise, timeoutPromise]);
                
                return {
                    success: true,
                    result: result
                };
            } catch (fallbackError) {
                return {
                    success: false,
                    error: fallbackError.message
                };
            }
        } catch (error) {
            console.error(`降级策略执行失败: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 重新认证策略
     * @param {Object} error - 错误对象
     * @param {Object} context - 上下文信息
     * @returns {Object} 恢复结果
     */
    async reAuthenticateStrategy(error, context) {
        try {
            console.log('🔄 执行重新认证策略');
            
            // 这里应该实现具体的重新认证逻辑
            // 例如：刷新令牌、重新登录等
            
            // 模拟重新认证过程
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 检查认证状态
            const isAuthenticated = this.checkAuthenticationStatus();
            
            if (isAuthenticated) {
                return {
                    success: true,
                    message: '重新认证成功'
                };
            } else {
                return {
                    success: false,
                    error: '重新认证失败'
                };
            }
        } catch (error) {
            console.error(`重新认证策略执行失败: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 检查认证状态
     * @returns {boolean} 是否已认证
     */
    checkAuthenticationStatus() {
        try {
            // 这里应该实现具体的认证状态检查逻辑
            // 例如：检查令牌有效性、用户信息等
            
            // 模拟检查结果
            return Math.random() > 0.3; // 70% 概率认证成功
        } catch (error) {
            console.error(`检查认证状态失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 用户输入策略
     * @param {Object} error - 错误对象
     * @param {Object} context - 上下文信息
     * @returns {Object} 恢复结果
     */
    async userInputStrategy(error, context) {
        try {
            console.log('🔄 执行用户输入策略');
            
            // 这里应该实现具体的用户输入处理逻辑
            // 例如：显示错误信息、请求用户重新输入等
            
            // 模拟用户输入处理
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return {
                success: true,
                message: '用户输入处理完成'
            };
        } catch (error) {
            console.error(`用户输入策略执行失败: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 重定向策略
     * @param {Object} error - 错误对象
     * @param {Object} context - 上下文信息
     * @returns {Object} 恢复结果
     */
    async redirectStrategy(error, context) {
        try {
            const { redirectUrl } = context;
            
            if (!redirectUrl) {
                return {
                    success: false,
                    error: '缺少重定向URL'
                };
            }
            
            console.log(`🔄 执行重定向策略: ${redirectUrl}`);
            
            // 执行重定向
            if (typeof window !== 'undefined') {
                window.location.href = redirectUrl;
            }
            
            return {
                success: true,
                message: `已重定向到: ${redirectUrl}`
            };
        } catch (error) {
            console.error(`重定向策略执行失败: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 重试或降级策略
     * @param {Object} error - 错误对象
     * @param {Object} context - 上下文信息
     * @returns {Object} 恢复结果
     */
    async retryOrFallbackStrategy(error, context) {
        try {
            console.log('🔄 执行重试或降级策略');
            
            // 首先尝试重试
            const retryResult = await this.retryStrategy(error, context);
            
            if (retryResult.success) {
                return retryResult;
            }
            
            // 重试失败，尝试降级
            const fallbackResult = await this.fallbackStrategy(error, context);
            
            return fallbackResult;
        } catch (error) {
            console.error(`重试或降级策略执行失败: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 通用策略
     * @param {Object} error - 错误对象
     * @param {Object} context - 上下文信息
     * @returns {Object} 恢复结果
     */
    async genericStrategy(error, context) {
        try {
            console.log('🔄 执行通用恢复策略');
            
            // 这里可以实现通用的恢复逻辑
            // 例如：记录日志、通知用户、尝试基本恢复等
            
            // 模拟通用恢复过程
            await new Promise(resolve => setTimeout(resolve, 300));
            
            return {
                success: true,
                message: '通用恢复完成'
            };
        } catch (error) {
            console.error(`通用策略执行失败: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 记录恢复尝试
     * @param {Object} attempt - 恢复尝试记录
     */
    recordRecoveryAttempt(attempt) {
        try {
            this.recoveryHistory.push(attempt);
            
            // 限制历史记录数量
            if (this.recoveryHistory.length > 100) {
                this.recoveryHistory.shift();
            }
        } catch (error) {
            console.error(`记录恢复尝试失败: ${error.message}`);
        }
    }
    
    /**
     * 获取恢复统计
     * @returns {Object} 恢复统计信息
     */
    getRecoveryStats() {
        try {
            return {
                ...this.recoveryStats,
                historyCount: this.recoveryHistory.length
            };
        } catch (error) {
            console.error(`获取恢复统计失败: ${error.message}`);
            return {};
        }
    }
    
    /**
     * 获取恢复历史
     * @param {number} limit - 限制数量
     * @returns {Array} 恢复历史数组
     */
    getRecoveryHistory(limit = 10) {
        try {
            return this.recoveryHistory.slice(-limit);
        } catch (error) {
            console.error(`获取恢复历史失败: ${error.message}`);
            return [];
        }
    }
    
    /**
     * 清空恢复历史
     */
    clearRecoveryHistory() {
        try {
            this.recoveryHistory = [];
            console.log('🗑️ 恢复历史已清空');
        } catch (error) {
            console.error(`清空恢复历史失败: ${error.message}`);
        }
    }
    
    /**
     * 重置恢复统计
     */
    resetRecoveryStats() {
        try {
            this.recoveryStats = {
                totalAttempts: 0,
                totalSuccess: 0,
                totalFailures: 0,
                byStrategy: new Map()
            };
            console.log('📊 恢复统计已重置');
        } catch (error) {
            console.error(`重置恢复统计失败: ${error.message}`);
        }
    }
    
    /**
     * 销毁错误恢复管理器
     */
    destroy() {
        try {
            this.clearRecoveryHistory();
            this.resetRecoveryStats();
            console.log('🔧 错误恢复管理器已销毁');
        } catch (error) {
            console.error(`销毁错误恢复管理器失败: ${error.message}`);
        }
    }
}

// 导出错误恢复管理器
const errorRecoveryManager = new ErrorRecoveryManager();
export { errorRecoveryManager };

// 便利的错误恢复函数
export function executeErrorRecovery(error, strategy, context = {}) {
    return errorRecoveryManager.executeRecovery(error, strategy, context);
}

export function getRecoveryStats() {
    return errorRecoveryManager.getRecoveryStats();
}

export function getRecoveryHistory(limit = 10) {
    return errorRecoveryManager.getRecoveryHistory(limit);
}

export function clearRecoveryHistory() {
    return errorRecoveryManager.clearRecoveryHistory();
}

export function resetRecoveryStats() {
    return errorRecoveryManager.resetRecoveryStats();
}

export function destroyErrorRecoveryManager() {
    return errorRecoveryManager.destroy();
}
```

### 详细日志记录

```javascript
/**
 * 详细日志记录器
 * 提供完整的错误信息和堆栈跟踪
 */
class DetailedLogger {
    /**
     * 构造函数
     */
    constructor() {
        // 日志配置
        this.config = {
            enableConsole: true,
            enableFile: false,
            enableServer: false,
            serverEndpoint: '/api/logs',
            maxLogSize: 1000,
            logLevel: 'info',
            includeStackTrace: true,
            includeContext: true
        };
        
        // 日志级别映射
        this.logLevels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
        
        // 日志存储
        this.logs = [];
        
        // 日志统计
        this.logStats = {
            totalLogs: 0,
            byLevel: {
                error: 0,
                warn: 0,
                info: 0,
                debug: 0
            },
            byCategory: new Map()
        };
        
        console.log('📝 详细日志记录器已初始化');
    }
    
    /**
     * 记录错误日志
     * @param {Object} error - 错误对象
     * @param {Object} context - 上下文信息
     */
    logError(error, context = {}) {
        try {
            const logEntry = this.createLogEntry('error', error.message, {
                error: error,
                context: context,
                stack: error.stack || ''
            });
            
            this.writeLog(logEntry);
        } catch (logError) {
            console.error(`记录错误日志失败: ${logError.message}`);
        }
    }
    
    /**
     * 记录警告日志
     * @param {string} message - 日志消息
     * @param {Object} context - 上下文信息
     */
    logWarning(message, context = {}) {
        try {
            const logEntry = this.createLogEntry('warn', message, context);
            this.writeLog(logEntry);
        } catch (logError) {
            console.error(`记录警告日志失败: ${logError.message}`);
        }
    }
    
    /**
     * 记录信息日志
     * @param {string} message - 日志消息
     * @param {Object} context - 上下文信息
     */
    logInfo(message, context = {}) {
        try {
            const logEntry = this.createLogEntry('info', message, context);
            this.writeLog(logEntry);
        } catch (logError) {
            console.error(`记录信息日志失败: ${logError.message}`);
        }
    }
    
    /**
     * 记录调试日志
     * @param {string} message - 日志消息
     * @param {Object} context - 上下文信息
     */
    logDebug(message, context = {}) {
        try {
            const logEntry = this.createLogEntry('debug', message, context);
            this.writeLog(logEntry);
        } catch (logError) {
            console.error(`记录调试日志失败: ${logError.message}`);
        }
    }
    
    /**
     * 创建日志条目
     * @param {string} level - 日志级别
     * @param {string} message - 日志消息
     * @param {Object} data - 日志数据
     * @returns {Object} 日志条目
     */
    createLogEntry(level, message, data = {}) {
        try {
            const timestamp = new Date().toISOString();
            const id = this.generateLogId();
            
            // 收集环境信息
            const environment = this.collectEnvironmentInfo();
            
            // 收集上下文信息
            const context = this.config.includeContext ? this.collectContextInfo() : {};
            
            return {
                id: id,
                timestamp: timestamp,
                level: level,
                message: message,
                data: data,
                environment: environment,
                context: context
            };
        } catch (error) {
            console.error(`创建日志条目失败: ${error.message}`);
            return {
                id: this.generateLogId(),
                timestamp: new Date().toISOString(),
                level: 'error',
                message: '创建日志条目失败',
                data: { error: error.message }
            };
        }
    }
    
    /**
     * 写入日志
     * @param {Object} logEntry - 日志条目
     */
    writeLog(logEntry) {
        try {
            // 增加日志计数
            this.logStats.totalLogs++;
            this.logStats.byLevel[logEntry.level]++;
            
            // 添加到日志存储
            this.logs.push(logEntry);
            
            // 限制日志存储大小
            if (this.logs.length > this.config.maxLogSize) {
                this.logs.shift();
            }
            
            // 控制台输出
            if (this.config.enableConsole) {
                this.outputToConsole(logEntry);
            }
            
            // 文件输出
            if (this.config.enableFile) {
                this.outputToFile(logEntry);
            }
            
            // 服务器输出
            if (this.config.enableServer) {
                this.outputToServer(logEntry);
            }
        } catch (error) {
            console.error(`写入日志失败: ${error.message}`);
        }
    }
    
    /**
     * 输出到控制台
     * @param {Object} logEntry - 日志条目
     */
    outputToConsole(logEntry) {
        try {
            // 检查日志级别
            if (this.logLevels[logEntry.level] > this.logLevels[this.config.logLevel]) {
                return;
            }
            
            const { timestamp, level, message } = logEntry;
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            
            switch (level) {
                case 'error':
                    console.error(`${prefix} ${message}`, logEntry);
                    break;
                case 'warn':
                    console.warn(`${prefix} ${message}`, logEntry);
                    break;
                case 'info':
                    console.info(`${prefix} ${message}`, logEntry);
                    break;
                case 'debug':
                    console.debug(`${prefix} ${message}`, logEntry);
                    break;
                default:
                    console.log(`${prefix} ${message}`, logEntry);
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
            // 这里应该实现具体的文件输出逻辑
            // 在浏览器环境中可能需要使用其他方式存储
            
            console.log('📝 日志已记录到文件（模拟）');
        } catch (error) {
            console.error(`输出到文件失败: ${error.message}`);
        }
    }
    
    /**
     * 输出到服务器
     * @param {Object} logEntry - 日志条目
     */
    async outputToServer(logEntry) {
        try {
            // 发送日志到服务器
            const response = await fetch(this.config.serverEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logEntry)
            });
            
            if (!response.ok) {
                console.warn(`⚠️ 日志发送到服务器失败: ${response.status}`);
            }
        } catch (error) {
            console.error(`输出到服务器失败: ${error.message}`);
        }
    }
    
    /**
     * 收集环境信息
     * @returns {Object} 环境信息
     */
    collectEnvironmentInfo() {
        try {
            return {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                online: navigator.onLine,
                url: window.location.href,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error(`收集环境信息失败: ${error.message}`);
            return {};
        }
    }
    
    /**
     * 收集上下文信息
     * @returns {Object} 上下文信息
     */
    collectContextInfo() {
        try {
            return {
                performance: {
                    memory: performance.memory || {},
                    navigation: performance.navigation || {}
                },
                screen: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth
                },
                window: {
                    innerWidth: window.innerWidth,
                    innerHeight: window.innerHeight
                }
            };
        } catch (error) {
            console.error(`收集上下文信息失败: ${error.message}`);
            return {};
        }
    }
    
    /**
     * 生成日志ID
     * @returns {string} 日志ID
     */
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 获取日志统计
     * @returns {Object} 日志统计信息
     */
    getLogStats() {
        try {
            return {
                ...this.logStats,
                currentLogs: this.logs.length
            };
        } catch (error) {
            console.error(`获取日志统计失败: ${error.message}`);
            return {};
        }
    }
    
    /**
     * 获取日志
     * @param {string} level - 日志级别
     * @param {number} limit - 限制数量
     * @returns {Array} 日志数组
     */
    getLogs(level = null, limit = 50) {
        try {
            let filteredLogs = this.logs;
            
            // 按级别过滤
            if (level) {
                filteredLogs = filteredLogs.filter(log => log.level === level);
            }
            
            // 限制数量
            return filteredLogs.slice(-limit);
        } catch (error) {
            console.error(`获取日志失败: ${error.message}`);
            return [];
        }
    }
    
    /**
     * 清空日志
     */
    clearLogs() {
        try {
            this.logs = [];
            console.log('🗑️ 日志已清空');
        } catch (error) {
            console.error(`清空日志失败: ${error.message}`);
        }
    }
    
    /**
     * 重置日志统计
     */
    resetLogStats() {
        try {
            this.logStats = {
                totalLogs: 0,
                byLevel: {
                    error: 0,
                    warn: 0,
                    info: 0,
                    debug: 0
                },
                byCategory: new Map()
            };
            console.log('📊 日志统计已重置');
        } catch (error) {
            console.error(`重置日志统计失败: ${error.message}`);
        }
    }
    
    /**
     * 销毁详细日志记录器
     */
    destroy() {
        try {
            this.clearLogs();
            this.resetLogStats();
            console.log('📝 详细日志记录器已销毁');
        } catch (error) {
            console.error(`销毁详细日志记录器失败: ${error.message}`);
        }
    }
}

// 导出详细日志记录器
const detailedLogger = new DetailedLogger();
export { detailedLogger };

// 便利的详细日志函数
export function initDetailedLogger(config = {}) {
    Object.assign(detailedLogger.config, config);
    return detailedLogger;
}

export function logDetailedError(error, context = {}) {
    detailedLogger.logError(error, context);
}

export function logDetailedWarning(message, context = {}) {
    detailedLogger.logWarning(message, context);
}

export function logDetailedInfo(message, context = {}) {
    detailedLogger.logInfo(message, context);
}

export function logDetailedDebug(message, context = {}) {
    detailedLogger.logDebug(message, context);
}

export function getLogStats() {
    return detailedLogger.getLogStats();
}

export function getLogs(level = null, limit = 50) {
    return detailedLogger.getLogs(level, limit);
}

export function clearLogs() {
    return detailedLogger.clearLogs();
}

export function resetLogStats() {
    return detailedLogger.resetLogStats();
}

export function destroyDetailedLogger() {
    return detailedLogger.destroy();
}
```

## 使用示例

### 统一错误处理

```javascript
// 1. 基本错误处理
import { handleError, registerErrorRecovery } from './error-handling.js';

// 注册自定义恢复策略
registerErrorRecovery('custom', async (error) => {
    console.log('执行自定义恢复策略');
    // 实现自定义恢复逻辑
    return true;
});

// 处理异步操作错误
async function fetchData() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        handleError({
            type: 'network',
            message: error.message,
            error: error
        });
        throw error;
    }
}
```

### 错误分类管理

```javascript
// 1. 错误分类
import { categorizeError, addCustomErrorCategory } from './error-handling.js';

// 添加自定义错误分类
addCustomErrorCategory('database', {
    name: '数据库错误',
    description: '与数据库操作相关的错误',
    patterns: ['database', 'sql', 'query'],
    severity: 'high',
    recoveryStrategy: 'retry'
});

// 分类错误
const error = new Error('Database connection failed');
const category = categorizeError(error);
console.log('错误分类:', category);
```

### 错误恢复机制

```javascript
// 1. 执行恢复策略
import { executeErrorRecovery } from './error-handling.js';

// 定义操作
const operation = async () => {
    // 模拟可能失败的操作
    if (Math.random() > 0.7) {
        throw new Error('操作失败');
    }
    return '操作成功';
};

// 定义降级操作
const fallbackOperation = async () => {
    return '使用降级结果';
};

// 执行恢复
executeErrorRecovery(
    new Error('网络错误'),
    'retry-or-fallback',
    {
        operation: operation,
        fallbackOperation: fallbackOperation,
        maxRetries: 3
    }
).then(result => {
    console.log('恢复结果:', result);
});
```

### 详细日志记录

```javascript
// 1. 记录详细日志
import { 
    logDetailedError, 
    logDetailedWarning, 
    logDetailedInfo,
    getLogs
} from './error-handling.js';

// 记录错误日志
try {
    throw new Error('示例错误');
} catch (error) {
    logDetailedError(error, {
        component: 'ExampleComponent',
        action: 'buttonClick'
    });
}

// 记录警告日志
logDetailedWarning('这是一个警告', {
    component: 'ExampleComponent',
    action: 'dataValidation'
});

// 记录信息日志
logDetailedInfo('用户执行了某个操作', {
    userId: '12345',
    action: 'fileUpload'
});

// 获取日志
const recentLogs = getLogs(null, 10);
console.log('最近日志:', recentLogs);
```

## 最佳实践

### 错误处理原则

1. **尽早捕获** - 在错误发生的地方尽早捕获
2. **详细记录** - 记录足够的信息用于调试
3. **优雅降级** - 提供合理的降级方案
4. **用户友好** - 向用户显示友好的错误信息

### 恢复策略

1. **重试机制** - 对于临时性错误实施重试
2. **降级处理** - 提供基本功能的降级版本
3. **缓存回退** - 使用缓存数据作为回退方案
4. **用户干预** - 在必要时请求用户输入

### 日志管理

1. **分级记录** - 根据重要性分级记录日志
2. **上下文信息** - 记录足够的上下文信息
3. **性能考虑** - 避免日志记录影响性能
4. **安全注意** - 避免记录敏感信息