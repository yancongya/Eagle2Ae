# 事件系统

## 概述

事件系统是 Eagle2Ae AE 扩展 JavaScript 核心功能的重要组件，提供了统一的事件处理机制。该系统支持事件监听、事件触发、事件中间件、内存泄漏检测等特性。

## 核心特性

### 事件驱动架构
- **统一事件总线** - 中央化的事件管理系统
- **自定义事件** - 支持自定义事件类型和数据传递
- **事件过滤器** - 提供事件过滤和优先级管理
- **异步事件处理** - 支持异步事件处理和链式调用

### 技术实现

```javascript
/**
 * 事件发射器
 * 提供统一的事件处理机制
 */
class EventEmitter {
    /**
     * 构造函数
     */
    constructor() {
        // 事件监听器存储
        this.events = new Map();
        
        // 事件配置
        this.config = {
            maxListeners: 100, // 最大监听器数量
            warnOnMaxListeners: true, // 超过最大监听器时是否警告
            enableMemoryLeakDetection: true, // 启用内存泄漏检测
            memoryLeakCheckInterval: 30000 // 内存泄漏检查间隔（毫秒）
        };
        
        // 事件统计
        this.stats = {
            totalEvents: 0,
            totalEmitted: 0,
            totalListenersAdded: 0,
            totalListenersRemoved: 0,
            peakListeners: 0
        };
        
        // 内存泄漏检测
        this.memoryLeakTimer = null;
        
        // 事件队列（用于异步事件处理）
        this.eventQueue = [];
        this.isProcessingQueue = false;
        
        // 事件中间件
        this.middlewares = [];
        
        // 绑定方法上下文
        this.on = this.on.bind(this);
        this.once = this.once.bind(this);
        this.off = this.off.bind(this);
        this.emit = this.emit.bind(this);
        this.emitAsync = this.emitAsync.bind(this);
        this.removeAllListeners = this.removeAllListeners.bind(this);
        this.listenerCount = this.listenerCount.bind(this);
        this.setMaxListeners = this.setMaxListeners.bind(this);
        this.getMaxListeners = this.getMaxListeners.bind(this);
        this.eventNames = this.eventNames.bind(this);
        this.prependListener = this.prependListener.bind(this);
        this.prependOnceListener = this.prependOnceListener.bind(this);
        this.rawListeners = this.rawListeners.bind(this);
        this.eventNames = this.eventNames.bind(this);
        this.listeners = this.listeners.bind(this);
        
        // 初始化内存泄漏检测
        if (this.config.enableMemoryLeakDetection) {
            this.startMemoryLeakDetection();
        }
        
        console.log('📡 事件发射器已初始化');
    }
    
    /**
     * 添加事件监听器
     * @param {string|symbol} event - 事件名称
     * @param {Function} listener - 监听器函数
     * @param {Object} options - 监听器选项
     * @returns {EventEmitter} 当前实例
     */
    on(event, listener, options = {}) {
        try {
            if (!event) {
                throw new Error('事件名称不能为空');
            }
            
            if (typeof listener !== 'function') {
                throw new Error('监听器必须是函数');
            }
            
            // 检查事件是否存在
            if (!this.events.has(event)) {
                this.events.set(event, []);
            }
            
            const listeners = this.events.get(event);
            
            // 检查监听器数量
            if (listeners.length >= this.config.maxListeners) {
                if (this.config.warnOnMaxListeners) {
                    console.warn(`⚠️ 事件 ${String(event)} 的监听器数量已达到最大值 ${this.config.maxListeners}`);
                }
            }
            
            // 创建监听器包装器
            const wrappedListener = {
                fn: listener,
                options: options,
                id: this.generateListenerId(),
                createdAt: Date.now(),
                callCount: 0
            };
            
            listeners.push(wrappedListener);
            
            // 更新统计信息
            this.stats.totalListenersAdded++;
            this.stats.peakListeners = Math.max(this.stats.peakListeners, listeners.length);
            
            console.log(`👂 添加事件监听器: ${String(event)}`, {
                listenerId: wrappedListener.id,
                options: options
            });
            
            return this;
            
        } catch (error) {
            console.error(`❌ 添加事件监听器失败: ${error.message}`);
            return this;
        }
    }
    
    /**
     * 添加一次性事件监听器
     * @param {string|symbol} event - 事件名称
     * @param {Function} listener - 监听器函数
     * @param {Object} options - 监听器选项
     * @returns {EventEmitter} 当前实例
     */
    once(event, listener, options = {}) {
        try {
            if (!event) {
                throw new Error('事件名称不能为空');
            }
            
            if (typeof listener !== 'function') {
                throw new Error('监听器必须是函数');
            }
            
            // 创建一次性监听器包装器
            const onceWrapper = (...args) => {
                // 移除监听器自身
                this.off(event, onceWrapper);
                
                // 调用原始监听器
                return listener.apply(this, args);
            };
            
            // 设置一次性标记
            const onceOptions = {
                ...options,
                once: true
            };
            
            // 添加监听器
            return this.on(event, onceWrapper, onceOptions);
            
        } catch (error) {
            console.error(`❌ 添加一次性事件监听器失败: ${error.message}`);
            return this;
        }
    }
    
    /**
     * 移除事件监听器
     * @param {string|symbol} event - 事件名称
     * @param {Function} listener - 监听器函数
     * @returns {EventEmitter} 当前实例
     */
    off(event, listener) {
        try {
            if (!event) {
                console.warn('⚠️ 事件名称不能为空');
                return this;
            }
            
            if (!this.events.has(event)) {
                return this;
            }
            
            const listeners = this.events.get(event);
            let removedCount = 0;
            
            // 如果没有指定监听器，移除所有监听器
            if (typeof listener !== 'function') {
                removedCount = listeners.length;
                listeners.length = 0;
            } else {
                // 移除指定的监听器
                for (let i = listeners.length - 1; i >= 0; i--) {
                    if (listeners[i].fn === listener || 
                        (listeners[i].fn.original === listener) || 
                        (listeners[i].fn === listener.original)) {
                        
                        listeners.splice(i, 1);
                        removedCount++;
                        
                        // 更新统计信息
                        this.stats.totalListenersRemoved++;
                    }
                }
            }
            
            // 如果监听器数组为空，移除事件
            if (listeners.length === 0) {
                this.events.delete(event);
            }
            
            if (removedCount > 0) {
                console.log(`👋 移除事件监听器: ${String(event)} (${removedCount}个)`);
            }
            
            return this;
            
        } catch (error) {
            console.error(`❌ 移除事件监听器失败: ${error.message}`);
            return this;
        }
    }
    
    /**
     * 触发事件
     * @param {string|symbol} event - 事件名称
     * @param {...any} args - 事件参数
     * @returns {boolean} 是否有监听器被触发
     */
    emit(event, ...args) {
        try {
            if (!event) {
                throw new Error('事件名称不能为空');
            }
            
            // 更新统计信息
            this.stats.totalEmitted++;
            
            // 检查是否有监听器
            if (!this.events.has(event)) {
                return false;
            }
            
            const listeners = this.events.get(event);
            if (listeners.length === 0) {
                return false;
            }
            
            console.log(`📤 触发事件: ${String(event)}`, {
                listenerCount: listeners.length,
                args: args
            });
            
            // 应用中间件
            let processedArgs = args;
            for (const middleware of this.middlewares) {
                try {
                    processedArgs = middleware(event, processedArgs) || processedArgs;
                } catch (middlewareError) {
                    console.error(`中间件执行失败: ${middlewareError.message}`);
                }
            }
            
            // 同步触发监听器
            let listenerResults = [];
            let hasError = false;
            
            for (const listener of listeners) {
                try {
                    listener.callCount++;
                    
                    // 执行监听器
                    const result = listener.fn.apply(this, processedArgs);
                    listenerResults.push(result);
                    
                } catch (listenerError) {
                    hasError = true;
                    console.error(`监听器执行失败: ${String(event)} - ${listenerError.message}`, {
                        listenerId: listener.id,
                        stack: listenerError.stack
                    });
                    
                    // 如果启用了错误冒泡，抛出错误
                    if (listener.options.bubbleErrors) {
                        throw listenerError;
                    }
                }
            }
            
            // 如果是一次性监听器，移除它们
            const persistentListeners = listeners.filter(listener => !listener.options.once);
            if (persistentListeners.length !== listeners.length) {
                if (persistentListeners.length === 0) {
                    this.events.delete(event);
                } else {
                    this.events.set(event, persistentListeners);
                }
            }
            
            return !hasError;
            
        } catch (error) {
            console.error(`❌ 触发事件失败: ${String(event)} - ${error.message}`);
            return false;
        }
    }
    
    /**
     * 异步触发事件
     * @param {string|symbol} event - 事件名称
     * @param {...any} args - 事件参数
     * @returns {Promise<Array>} 监听器执行结果数组
     */
    async emitAsync(event, ...args) {
        try {
            if (!event) {
                throw new Error('事件名称不能为空');
            }
            
            // 更新统计信息
            this.stats.totalEmitted++;
            
            // 检查是否有监听器
            if (!this.events.has(event)) {
                return [];
            }
            
            const listeners = this.events.get(event);
            if (listeners.length === 0) {
                return [];
            }
            
            console.log(`📤 异步触发事件: ${String(event)}`, {
                listenerCount: listeners.length,
                args: args
            });
            
            // 应用中间件
            let processedArgs = args;
            for (const middleware of this.middlewares) {
                try {
                    processedArgs = await middleware(event, processedArgs) || processedArgs;
                } catch (middlewareError) {
                    console.error(`中间件执行失败: ${middlewareError.message}`);
                }
            }
            
            // 异步触发监听器
            const results = [];
            
            for (const listener of listeners) {
                try {
                    listener.callCount++;
                    
                    // 执行监听器（支持异步）
                    const result = await listener.fn.apply(this, processedArgs);
                    results.push(result);
                    
                } catch (listenerError) {
                    console.error(`异步监听器执行失败: ${String(event)} - ${listenerError.message}`, {
                        listenerId: listener.id,
                        stack: listenerError.stack
                    });
                    
                    // 继续执行其他监听器
                    results.push({
                        error: listenerError.message,
                        listenerId: listener.id
                    });
                }
            }
            
            // 如果是一次性监听器，移除它们
            const persistentListeners = listeners.filter(listener => !listener.options.once);
            if (persistentListeners.length !== listeners.length) {
                if (persistentListeners.length === 0) {
                    this.events.delete(event);
                } else {
                    this.events.set(event, persistentListeners);
                }
            }
            
            return results;
            
        } catch (error) {
            console.error(`❌ 异步触发事件失败: ${String(event)} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 移除所有事件监听器
     * @param {string|symbol} event - 事件名称（可选）
     * @returns {EventEmitter} 当前实例
     */
    removeAllListeners(event) {
        try {
            if (event) {
                // 移除指定事件的所有监听器
                if (this.events.has(event)) {
                    const listenerCount = this.events.get(event).length;
                    this.events.delete(event);
                    
                    console.log(`🗑️ 移除事件的所有监听器: ${String(event)} (${listenerCount}个)`);
                }
            } else {
                // 移除所有事件的所有监听器
                const totalListeners = Array.from(this.events.values()).reduce(
                    (sum, listeners) => sum + listeners.length, 0
                );
                
                this.events.clear();
                
                console.log(`🗑️ 移除所有事件的监听器 (${totalListeners}个)`);
            }
            
            return this;
            
        } catch (error) {
            console.error(`❌ 移除所有事件监听器失败: ${error.message}`);
            return this;
        }
    }
    
    /**
     * 获取事件监听器数量
     * @param {string|symbol} event - 事件名称
     * @returns {number} 监听器数量
     */
    listenerCount(event) {
        try {
            if (!event) {
                // 返回所有事件的监听器总数
                return Array.from(this.events.values()).reduce(
                    (sum, listeners) => sum + listeners.length, 0
                );
            }
            
            if (!this.events.has(event)) {
                return 0;
            }
            
            return this.events.get(event).length;
            
        } catch (error) {
            console.error(`获取事件监听器数量失败: ${error.message}`);
            return 0;
        }
    }
    
    /**
     * 设置最大监听器数量
     * @param {number} n - 最大监听器数量
     * @returns {EventEmitter} 当前实例
     */
    setMaxListeners(n) {
        try {
            if (typeof n !== 'number' || n < 0) {
                throw new Error('最大监听器数量必须是非负数');
            }
            
            this.config.maxListeners = n;
            
            console.log(`🔢 设置最大监听器数量: ${n}`);
            
            return this;
            
        } catch (error) {
            console.error(`设置最大监听器数量失败: ${error.message}`);
            return this;
        }
    }
    
    /**
     * 获取最大监听器数量
     * @returns {number} 最大监听器数量
     */
    getMaxListeners() {
        return this.config.maxListeners;
    }
    
    /**
     * 获取所有事件名称
     * @returns {Array} 事件名称数组
     */
    eventNames() {
        return Array.from(this.events.keys());
    }
    
    /**
     * 在前面添加事件监听器
     * @param {string|symbol} event - 事件名称
     * @param {Function} listener - 监听器函数
     * @param {Object} options - 监听器选项
     * @returns {EventEmitter} 当前实例
     */
    prependListener(event, listener, options = {}) {
        try {
            if (!event) {
                throw new Error('事件名称不能为空');
            }
            
            if (typeof listener !== 'function') {
                throw new Error('监听器必须是函数');
            }
            
            // 检查事件是否存在
            if (!this.events.has(event)) {
                this.events.set(event, []);
            }
            
            const listeners = this.events.get(event);
            
            // 检查监听器数量
            if (listeners.length >= this.config.maxListeners) {
                if (this.config.warnOnMaxListeners) {
                    console.warn(`⚠️ 事件 ${String(event)} 的监听器数量已达到最大值 ${this.config.maxListeners}`);
                }
            }
            
            // 创建监听器包装器
            const wrappedListener = {
                fn: listener,
                options: options,
                id: this.generateListenerId(),
                createdAt: Date.now(),
                callCount: 0
            };
            
            // 在数组前面添加监听器
            listeners.unshift(wrappedListener);
            
            // 更新统计信息
            this.stats.totalListenersAdded++;
            this.stats.peakListeners = Math.max(this.stats.peakListeners, listeners.length);
            
            console.log(`👂 在前面添加事件监听器: ${String(event)}`, {
                listenerId: wrappedListener.id,
                options: options
            });
            
            return this;
            
        } catch (error) {
            console.error(`❌ 在前面添加事件监听器失败: ${error.message}`);
            return this;
        }
    }
    
    /**
     * 在前面添加一次性事件监听器
     * @param {string|symbol} event - 事件名称
     * @param {Function} listener - 监听器函数
     * @param {Object} options - 监听器选项
     * @returns {EventEmitter} 当前实例
     */
    prependOnceListener(event, listener, options = {}) {
        try {
            if (!event) {
                throw new Error('事件名称不能为空');
            }
            
            if (typeof listener !== 'function') {
                throw new Error('监听器必须是函数');
            }
            
            // 创建一次性监听器包装器
            const onceWrapper = (...args) => {
                // 移除监听器自身
                this.off(event, onceWrapper);
                
                // 调用原始监听器
                return listener.apply(this, args);
            };
            
            // 设置一次性标记
            const onceOptions = {
                ...options,
                once: true
            };
            
            // 在前面添加监听器
            return this.prependListener(event, onceWrapper, onceOptions);
            
        } catch (error) {
            console.error(`❌ 在前面添加一次性事件监听器失败: ${error.message}`);
            return this;
        }
    }
    
    /**
     * 获取原始监听器函数
     * @param {string|symbol} event - 事件名称
     * @returns {Array} 原始监听器函数数组
     */
    rawListeners(event) {
        try {
            if (!event || !this.events.has(event)) {
                return [];
            }
            
            return this.events.get(event).map(listener => listener.fn);
            
        } catch (error) {
            console.error(`获取原始监听器函数失败: ${error.message}`);
            return [];
        }
    }
    
    /**
     * 获取监听器函数
     * @param {string|symbol} event - 事件名称
     * @returns {Array} 监听器函数数组
     */
    listeners(event) {
        try {
            if (!event || !this.events.has(event)) {
                return [];
            }
            
            return this.events.get(event).map(listener => listener.fn);
            
        } catch (error) {
            console.error(`获取监听器函数失败: ${error.message}`);
            return [];
        }
    }
    
    /**
     * 添加事件中间件
     * @param {Function} middleware - 中间件函数
     * @returns {Function} 移除中间件的函数
     */
    use(middleware) {
        try {
            if (typeof middleware !== 'function') {
                throw new Error('中间件必须是函数');
            }
            
            this.middlewares.push(middleware);
            
            console.log('🔧 添加事件中间件');
            
            // 返回移除中间件的函数
            return () => {
                const index = this.middlewares.indexOf(middleware);
                if (index !== -1) {
                    this.middlewares.splice(index, 1);
                    console.log('🔧 移除事件中间件');
                }
            };
            
        } catch (error) {
            console.error(`添加事件中间件失败: ${error.message}`);
            return () => {}; // 返回空函数以防调用错误
        }
    }
    
    /**
     * 生成监听器ID
     * @returns {string} 监听器ID
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 启动内存泄漏检测
     */
    startMemoryLeakDetection() {
        try {
            if (this.memoryLeakTimer) {
                return;
            }
            
            this.memoryLeakTimer = setInterval(() => {
                this.detectMemoryLeaks();
            }, this.config.memoryLeakCheckInterval);
            
            console.log('🔍 启动内存泄漏检测');
            
        } catch (error) {
            console.error(`启动内存泄漏检测失败: ${error.message}`);
        }
    }
    
    /**
     * 停止内存泄漏检测
     */
    stopMemoryLeakDetection() {
        try {
            if (this.memoryLeakTimer) {
                clearInterval(this.memoryLeakTimer);
                this.memoryLeakTimer = null;
                console.log('🔍 停止内存泄漏检测');
            }
            
        } catch (error) {
            console.error(`停止内存泄漏检测失败: ${error.message}`);
        }
    }
    
    /**
     * 检测内存泄漏
     */
    detectMemoryLeaks() {
        try {
            const totalListeners = this.listenerCount();
            
            // 检查监听器数量是否异常
            if (totalListeners > this.config.maxListeners * 2) {
                console.warn(`⚠️ 检测到可能的内存泄漏: 监听器数量 ${totalListeners} 超过预期值`);
                
                // 记录详细的监听器信息
                const eventDetails = Array.from(this.events.entries()).map(([event, listeners]) => ({
                    event: String(event),
                    listenerCount: listeners.length,
                    listeners: listeners.map(listener => ({
                        id: listener.id,
                        callCount: listener.callCount,
                        createdAt: listener.createdAt,
                        age: Date.now() - listener.createdAt
                    }))
                }));
                
                console.log('📋 事件监听器详情:', eventDetails);
            }
            
        } catch (error) {
            console.error(`内存泄漏检测失败: ${error.message}`);
        }
    }
    
    /**
     * 获取事件统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            ...this.stats,
            currentListeners: this.listenerCount(),
            eventCount: this.events.size,
            middlewareCount: this.middlewares.length
        };
    }
    
    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            totalEvents: 0,
            totalEmitted: 0,
            totalListenersAdded: 0,
            totalListenersRemoved: 0,
            peakListeners: 0
        };
        
        console.log('📊 重置事件统计信息');
    }
    
    /**
     * 清理事件发射器
     */
    cleanup() {
        try {
            console.log('🧹 清理事件发射器...');
            
            // 移除所有监听器
            this.removeAllListeners();
            
            // 停止内存泄漏检测
            this.stopMemoryLeakDetection();
            
            // 清空中间件
            this.middlewares = [];
            
            // 重置统计信息
            this.resetStats();
            
            // 清空事件队列
            this.eventQueue = [];
            this.isProcessingQueue = false;
            
            console.log('✅ 事件发射器清理完成');
            
        } catch (error) {
            console.error(`❌ 清理事件发射器失败: ${error.message}`);
        }
    }
}

// 导出事件发射器
const eventEmitter = new EventEmitter();
export default eventEmitter;

// 便利的事件处理函数
export function on(event, listener, options = {}) {
    return eventEmitter.on(event, listener, options);
}

export function once(event, listener, options = {}) {
    return eventEmitter.once(event, listener, options);
}

export function off(event, listener) {
    return eventEmitter.off(event, listener);
}

export function emit(event, ...args) {
    return eventEmitter.emit(event, ...args);
}

export async function emitAsync(event, ...args) {
    return await eventEmitter.emitAsync(event, ...args);
}

export function removeAllListeners(event) {
    return eventEmitter.removeAllListeners(event);
}

export function listenerCount(event) {
    return eventEmitter.listenerCount(event);
}

export function setMaxListeners(n) {
    return eventEmitter.setMaxListeners(n);
}

export function getMaxListeners() {
    return eventEmitter.getMaxListeners();
}

export function eventNames() {
    return eventEmitter.eventNames();
}

export function use(middleware) {
    return eventEmitter.use(middleware);
}

export function getStats() {
    return eventEmitter.getStats();
}

export function resetStats() {
    return eventEmitter.resetStats();
}

// 全局事件处理接口（兼容性）
if (typeof window !== 'undefined') {
    window.addEventListener = on;
    window.removeEventListener = off;
    window.dispatchEvent = emit;
    window.emitEvent = emit;
    window.emitEventAsync = emitAsync;
}
```

## 使用示例

### 基本使用

```javascript
// 1. 事件监听和触发
import { on, emit, off } from './event-system.js';

// 添加事件监听器
const listener = (data) => {
    console.log('接收到事件数据:', data);
};

on('user:login', listener);

// 触发事件
emit('user:login', { userId: 123, username: '张三' });

// 移除事件监听器
off('user:login', listener);
```

### 高级使用

```javascript
// 1. 一次性事件监听
import { once } from './event-system.js';

once('app:init', () => {
    console.log('应用初始化完成');
});

// 2. 异步事件处理
import { emitAsync } from './event-system.js';

async function handleAsyncEvent() {
    const results = await emitAsync('data:process', { data: [1, 2, 3] });
    console.log('处理结果:', results);
}

// 3. 事件中间件
import { use } from './event-system.js';

// 添加日志中间件
use((event, args) => {
    console.log(`事件日志: ${event}`, args);
    return args;
});

// 添加验证中间件
use((event, args) => {
    if (event === 'user:login' && !args[0].userId) {
        throw new Error('用户ID不能为空');
    }
    return args;
});
```

### 事件统计和监控

```javascript
// 1. 获取事件统计信息
import { getStats } from './event-system.js';

const stats = getStats();
console.log('事件统计:', stats);

// 2. 监控事件性能
import { on } from './event-system.js';

on('performance:measure', (data) => {
    if (data.duration > 1000) {
        console.warn(`性能警告: ${data.event} 耗时 ${data.duration}ms`);
    }
});
```

## 最佳实践

### 事件设计原则

1. **命名规范** - 使用清晰的事件命名规范（如：模块:动作）
2. **数据结构** - 传递统一的数据结构给事件监听器
3. **错误处理** - 在事件监听器中正确处理错误
4. **内存管理** - 及时移除不需要的事件监听器

### 性能优化

1. **事件去重** - 避免重复添加相同的事件监听器
2. **批量处理** - 对于高频事件使用防抖或节流
3. **异步处理** - 耗时的事件处理使用异步方式
4. **中间件优化** - 合理使用事件中间件避免性能损耗

### 调试技巧

1. **启用详细日志** - 在开发环境中启用事件日志
2. **监控事件频率** - 监控事件触发频率避免性能问题
3. **内存泄漏检测** - 定期检查事件监听器的内存使用
4. **事件追踪** - 使用事件统计信息追踪事件流向