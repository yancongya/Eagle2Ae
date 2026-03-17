# 监控和分析

本文档详细介绍了Eagle2Ae AE扩展的监控和分析策略，帮助开发者了解扩展的性能表现并进行持续优化。

## 概述

监控和分析是确保Eagle2Ae扩展持续优化和稳定运行的关键。本指南涵盖性能监控、内存使用监控等分析技术。

## 性能监控

### 实施性能监控
通过性能监控了解各操作的执行时间，识别性能瓶颈：

```javascript
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.enabled = true; // 生产环境可设为false
    }
    
    startTimer(operation) {
        if (!this.enabled) return null;
        
        const startTime = performance.now();
        return {
            operation,
            startTime,
            end: () => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                this.recordMetric(operation, duration);
                return duration;
            }
        };
    }
    
    recordMetric(operation, duration) {
        if (!this.metrics.has(operation)) {
            this.metrics.set(operation, {
                count: 0,
                totalTime: 0,
                minTime: Infinity,
                maxTime: 0,
                avgTime: 0
            });
        }
        
        const metric = this.metrics.get(operation);
        metric.count++;
        metric.totalTime += duration;
        metric.minTime = Math.min(metric.minTime, duration);
        metric.maxTime = Math.max(metric.maxTime, duration);
        metric.avgTime = metric.totalTime / metric.count;
        
        // 记录性能异常
        if (duration > 1000) { // 超过1秒
            console.warn(`[PERF] 性能警告: ${operation} 耗时 ${duration.toFixed(2)}ms`);
        }
    }
    
    getReport() {
        const report = {};
        for (const [operation, metric] of this.metrics) {
            report[operation] = {
                调用次数: metric.count,
                总耗时: `${metric.totalTime.toFixed(2)}ms`,
                平均耗时: `${metric.avgTime.toFixed(2)}ms`,
                最小耗时: `${metric.minTime.toFixed(2)}ms`,
                最大耗时: `${metric.maxTime.toFixed(2)}ms`
            };
        }
        return report;
    }
}

// 使用示例
const perfMonitor = new PerformanceMonitor();

async function optimizedFileCheck(files) {
    const timer = perfMonitor.startTimer('项目文件检测');
    
    try {
        const result = await this.isProjectInternalFile(files);
        const duration = timer.end();
        
        console.log(`[PERF] 项目文件检测完成，耗时: ${duration.toFixed(2)}ms，文件数: ${files.length}`);
        return result;
    } catch (error) {
        timer.end();
        throw error;
    }
}
```

### 性能监控类
另一种性能监控实现方式：

```javascript
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startTimes = new Map();
    }
    
    startTimer(name) {
        this.startTimes.set(name, performance.now());
    }
    
    endTimer(name) {
        const startTime = this.startTimes.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.recordMetric(name, duration);
            this.startTimes.delete(name);
            return duration;
        }
    }
    
    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        
        const values = this.metrics.get(name);
        values.push(value);
        
        // 保持最近100个值
        if (values.length > 100) {
            values.shift();
        }
    }
    
    getAverageMetric(name) {
        const values = this.metrics.get(name);
        if (!values || values.length === 0) return 0;
        
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    
    generateReport() {
        const report = {};
        
        for (const [name, values] of this.metrics) {
            report[name] = {
                average: this.getAverageMetric(name),
                min: Math.min(...values),
                max: Math.max(...values),
                count: values.length
            };
        }
        
        return report;
    }
}
```

## 内存使用监控

### 实施内存监控
定期检查内存使用情况，避免内存泄漏：

```javascript
class MemoryMonitor {
    constructor() {
        this.checkInterval = 30000; // 30秒检查一次
        this.memoryThreshold = 100 * 1024 * 1024; // 100MB阈值
        this.startMonitoring();
    }
    
    startMonitoring() {
        setInterval(() => {
            if (performance.memory) {
                const used = performance.memory.usedJSHeapSize;
                const total = performance.memory.totalJSHeapSize;
                const limit = performance.memory.jsHeapSizeLimit;
                
                const usage = (used / limit) * 100;
                
                if (used > this.memoryThreshold) {
                    console.warn(`[MEMORY] 内存使用警告: ${(used / 1024 / 1024).toFixed(2)}MB (${usage.toFixed(1)}%)`);
                    
                    // 触发垃圾回收建议
                    this.suggestGarbageCollection();
                }
            }
        }, this.checkInterval);
    }
    
    suggestGarbageCollection() {
        // 清理缓存
        if (window.pathCache) {
            window.pathCache.clear();
        }
        
        // 清理事件监听器
        if (window.eventManager) {
            window.eventManager.cleanup();
        }
        
        console.log('[MEMORY] 已执行内存清理建议');
    }
}
```

### 内存监控类
另一种内存监控实现方式：

```javascript
class MemoryMonitor {
    constructor() {
        this.checkInterval = 30000; // 30秒检查一次
        this.startMonitoring();
    }
    
    startMonitoring() {
        setInterval(() => {
            this.checkMemoryUsage();
        }, this.checkInterval);
    }
    
    checkMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            const usage = {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
            };
            
            console.log('内存使用情况:', usage);
            
            // 内存使用率超过80%时警告
            if (usage.used / usage.limit > 0.8) {
                console.warn('内存使用率过高，建议清理资源');
                this.triggerCleanup();
            }
        }
    }
    
    triggerCleanup() {
        // 触发垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
        }
        
        // 清理缓存
        this.clearCaches();
    }
}
```

## 最佳实践总结

### 1. 监控分析
- 实施性能监控
- 定期检查内存使用
- 生成性能报告

通过遵循这些监控和分析策略，可以持续优化Eagle2Ae扩展的性能和稳定性。