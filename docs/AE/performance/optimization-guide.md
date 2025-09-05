# 性能优化指南

本文档提供Eagle2Ae AE扩展的性能优化建议和最佳实践，帮助提升扩展运行效率和用户体验。

## 概述

性能优化是确保Eagle2Ae扩展流畅运行的关键。本指南涵盖启动优化、内存管理、网络通信、文件处理等各个方面的优化策略。

## 启动性能优化

### 1. 延迟加载策略

**问题**: 扩展启动时加载所有组件导致启动缓慢

**解决方案**: 实施延迟加载

```javascript
// 延迟加载非关键组件
class AEExtension {
    constructor() {
        // 只初始化核心组件
        this.csInterface = new CSInterface();
        this.connectionState = ConnectionState.DISCONNECTED;
        
        // 延迟初始化其他组件
        this._logManager = null;
        this._settingsManager = null;
        this._fileHandler = null;
    }
    
    // 懒加载日志管理器
    get logManager() {
        if (!this._logManager) {
            this._logManager = new LogManager();
        }
        return this._logManager;
    }
    
    // 懒加载设置管理器
    get settingsManager() {
        if (!this._settingsManager) {
            this._settingsManager = new SettingsManager();
        }
        return this._settingsManager;
    }
}
```

### 2. 禁用非必要功能

**优化端口发现**:
```javascript
// 在生产环境中禁用端口发现
class AEExtension {
    constructor() {
        // 禁用端口发现以提高启动性能
        this.enablePortDiscovery = false;
        
        // 使用固定端口配置
        const preferences = this.settingsManager.getPreferences();
        this.updateEagleUrl(preferences.communicationPort);
    }
}
```

**优化连接检查**:
```javascript
// 禁用启动时的连接时间检查
this.disableConnectionTimeChecks = true;
```

### 3. 异步初始化

```javascript
// 将耗时操作移到异步初始化中
async asyncInit() {
    // 先执行同步初始化
    this.init();
    
    // 异步执行耗时操作
    await Promise.all([
        this.initializePort(),
        this.loadUserSettings(),
        this.setupEventListeners()
    ]);
    
    // 启动后台服务
    this.startBackgroundServices();
}
```

## 内存管理优化

### 1. 及时清理资源

**事件监听器清理**:
```javascript
class AEExtension {
    constructor() {
        this.eventListeners = new Map();
        
        // 注册清理函数
        window.addEventListener('beforeunload', this.cleanup.bind(this));
    }
    
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        
        // 记录监听器以便清理
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        this.eventListeners.get(element).push({ event, handler });
    }
    
    cleanup() {
        // 清理所有事件监听器
        for (const [element, listeners] of this.eventListeners) {
            for (const { event, handler } of listeners) {
                element.removeEventListener(event, handler);
            }
        }
        this.eventListeners.clear();
        
        // 清理定时器
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        // 断开WebSocket连接
        if (this.webSocketClient) {
            this.webSocketClient.disconnect();
        }
    }
}
```

### 2. 限制缓存大小

**日志缓存管理**:
```javascript
class LogManager {
    constructor() {
        this.logs = [];
        this.maxLogEntries = 1000; // 限制日志条数
        this.cleanupThreshold = 1200; // 清理阈值
    }
    
    addLog(message, type) {
        this.logs.push({ message, type, timestamp: Date.now() });
        
        // 定期清理日志
        if (this.logs.length > this.cleanupThreshold) {
            this.logs = this.logs.slice(-this.maxLogEntries);
        }
    }
}
```

**消息去重缓存**:
```javascript
class AEExtension {
    constructor() {
        this.processedMessages = new Set();
        this.maxCacheSize = 500;
    }
    
    handleMessage(message) {
        // 检查消息是否已处理
        if (this.processedMessages.has(message.id)) {
            return;
        }
        
        // 添加到已处理集合
        this.processedMessages.add(message.id);
        
        // 限制缓存大小
        if (this.processedMessages.size > this.maxCacheSize) {
            const oldestMessages = Array.from(this.processedMessages).slice(0, 100);
            oldestMessages.forEach(id => this.processedMessages.delete(id));
        }
        
        // 处理消息
        this.processMessage(message);
    }
}
```

### 3. 对象池模式

```javascript
// 文件对象池
class FileObjectPool {
    constructor() {
        this.pool = [];
        this.maxSize = 50;
    }
    
    acquire() {
        if (this.pool.length > 0) {
            return this.pool.pop();
        }
        return this.createNew();
    }
    
    release(obj) {
        if (this.pool.length < this.maxSize) {
            this.reset(obj);
            this.pool.push(obj);
        }
    }
    
    createNew() {
        return {
            path: null,
            name: null,
            size: 0,
            type: null,
            processed: false
        };
    }
    
    reset(obj) {
        obj.path = null;
        obj.name = null;
        obj.size = 0;
        obj.type = null;
        obj.processed = false;
    }
}
```

## 网络通信优化

### 1. 连接池管理

```javascript
class ConnectionPool {
    constructor() {
        this.connections = new Map();
        this.maxConnections = 5;
        this.connectionTimeout = 10000;
    }
    
    async getConnection(url) {
        if (this.connections.has(url)) {
            const conn = this.connections.get(url);
            if (conn.isAlive()) {
                return conn;
            }
        }
        
        // 创建新连接
        const connection = await this.createConnection(url);
        this.connections.set(url, connection);
        return connection;
    }
    
    async createConnection(url) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(url);
            const timeout = setTimeout(() => {
                reject(new Error('连接超时'));
            }, this.connectionTimeout);
            
            ws.onopen = () => {
                clearTimeout(timeout);
                resolve(ws);
            };
            
            ws.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };
        });
    }
}
```

### 2. 请求批处理

```javascript
class BatchRequestManager {
    constructor() {
        this.pendingRequests = [];
        this.batchSize = 10;
        this.batchTimeout = 100; // 100ms
        this.batchTimer = null;
    }
    
    addRequest(request) {
        this.pendingRequests.push(request);
        
        if (this.pendingRequests.length >= this.batchSize) {
            this.processBatch();
        } else if (!this.batchTimer) {
            this.batchTimer = setTimeout(() => {
                this.processBatch();
            }, this.batchTimeout);
        }
    }
    
    processBatch() {
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = null;
        }
        
        if (this.pendingRequests.length === 0) {
            return;
        }
        
        const batch = this.pendingRequests.splice(0, this.batchSize);
        this.sendBatchRequest(batch);
    }
    
    async sendBatchRequest(requests) {
        try {
            const response = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            });
            
            const results = await response.json();
            this.handleBatchResponse(requests, results);
        } catch (error) {
            this.handleBatchError(requests, error);
        }
    }
}
```

### 3. 智能重连策略

```javascript
class SmartReconnectManager {
    constructor() {
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.baseDelay = 1000;
        this.maxDelay = 30000;
        this.backoffFactor = 2;
    }
    
    calculateDelay() {
        // 指数退避算法
        const delay = Math.min(
            this.baseDelay * Math.pow(this.backoffFactor, this.reconnectAttempts),
            this.maxDelay
        );
        
        // 添加随机抖动
        const jitter = delay * 0.1 * Math.random();
        return delay + jitter;
    }
    
    async reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            throw new Error('超过最大重连次数');
        }
        
        const delay = this.calculateDelay();
        await this.sleep(delay);
        
        try {
            await this.connect();
            this.reconnectAttempts = 0; // 重置计数器
        } catch (error) {
            this.reconnectAttempts++;
            throw error;
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

## 文件处理优化

### 1. 分批处理大量文件

```javascript
class OptimizedFileHandler {
    constructor() {
        this.batchSize = 10;
        this.processingDelay = 50; // 批次间延迟
    }
    
    async handleLargeFileSet(files) {
        const results = [];
        
        for (let i = 0; i < files.length; i += this.batchSize) {
            const batch = files.slice(i, i + this.batchSize);
            
            try {
                const batchResults = await this.processBatch(batch);
                results.push(...batchResults);
                
                // 批次间短暂延迟，避免阻塞UI
                if (i + this.batchSize < files.length) {
                    await this.sleep(this.processingDelay);
                }
                
                // 更新进度
                this.updateProgress(i + batch.length, files.length);
            } catch (error) {
                console.error(`批次 ${i}-${i + batch.length} 处理失败:`, error);
            }
        }
        
        return results;
    }
    
    async processBatch(files) {
        // 并行处理批次内的文件
        const promises = files.map(file => this.processFile(file));
        return Promise.all(promises);
    }
}
```

### 2. 文件类型预检查

```javascript
class FileTypeChecker {
    constructor() {
        this.supportedExtensions = new Set([
            '.jpg', '.jpeg', '.png', '.tiff', '.psd',
            '.mp4', '.mov', '.avi', '.mkv',
            '.wav', '.mp3', '.aiff'
        ]);
        
        this.imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.tiff', '.psd']);
        this.videoExtensions = new Set(['.mp4', '.mov', '.avi', '.mkv']);
        this.audioExtensions = new Set(['.wav', '.mp3', '.aiff']);
    }
    
    preCheckFiles(files) {
        const validFiles = [];
        const invalidFiles = [];
        
        for (const file of files) {
            const ext = this.getFileExtension(file.name).toLowerCase();
            
            if (this.supportedExtensions.has(ext)) {
                file.type = this.getFileType(ext);
                validFiles.push(file);
            } else {
                invalidFiles.push({
                    file: file.name,
                    reason: `不支持的文件格式: ${ext}`
                });
            }
        }
        
        return { validFiles, invalidFiles };
    }
    
    getFileType(extension) {
        if (this.imageExtensions.has(extension)) return 'image';
        if (this.videoExtensions.has(extension)) return 'video';
        if (this.audioExtensions.has(extension)) return 'audio';
        return 'unknown';
    }
}
```

### 3. 路径缓存优化

```javascript
class PathCache {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 200;
        this.accessCount = new Map();
    }
    
    normalizePath(path) {
        if (this.cache.has(path)) {
            // 更新访问计数
            this.accessCount.set(path, (this.accessCount.get(path) || 0) + 1);
            return this.cache.get(path);
        }
        
        // 执行路径规范化
        const normalized = path.replace(/\\/g, '/').replace(/\/+/g, '/');
        
        // 添加到缓存
        this.addToCache(path, normalized);
        return normalized;
    }
    
    addToCache(original, normalized) {
        // 如果缓存已满，清理最少使用的条目
        if (this.cache.size >= this.maxCacheSize) {
            this.evictLeastUsed();
        }
        
        this.cache.set(original, normalized);
        this.accessCount.set(original, 1);
    }
    
    evictLeastUsed() {
        let leastUsedKey = null;
        let minCount = Infinity;
        
        for (const [key, count] of this.accessCount) {
            if (count < minCount) {
                minCount = count;
                leastUsedKey = key;
            }
        }
        
        if (leastUsedKey) {
            this.cache.delete(leastUsedKey);
            this.accessCount.delete(leastUsedKey);
        }
    }
}
```

## UI性能优化

### 1. 虚拟滚动

```javascript
class VirtualScrollList {
    constructor(container, itemHeight, renderItem) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;
        this.visibleItems = [];
        this.scrollTop = 0;
        
        this.setupScrollListener();
    }
    
    setData(data) {
        this.data = data;
        this.updateVisibleItems();
    }
    
    updateVisibleItems() {
        const containerHeight = this.container.clientHeight;
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / this.itemHeight) + 1,
            this.data.length
        );
        
        // 只渲染可见项目
        this.visibleItems = this.data.slice(startIndex, endIndex);
        this.render(startIndex);
    }
    
    render(startIndex) {
        const fragment = document.createDocumentFragment();
        
        this.visibleItems.forEach((item, index) => {
            const element = this.renderItem(item, startIndex + index);
            element.style.position = 'absolute';
            element.style.top = `${(startIndex + index) * this.itemHeight}px`;
            fragment.appendChild(element);
        });
        
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
        
        // 设置容器高度
        this.container.style.height = `${this.data.length * this.itemHeight}px`;
    }
}
```

### 2. 防抖和节流

```javascript
// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 使用示例
class AEExtension {
    constructor() {
        // 防抖搜索
        this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
        
        // 节流滚动
        this.throttledScroll = throttle(this.handleScroll.bind(this), 16);
    }
}
```

## 监控和分析

### 1. 性能监控

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

### 2. 内存使用监控

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

### 1. 启动优化
- 使用延迟加载减少启动时间
- 禁用非必要的启动检查
- 异步执行耗时操作

### 2. 内存管理
- 及时清理事件监听器和定时器
- 限制缓存大小
- 使用对象池减少GC压力

### 3. 网络优化
- 实施连接池管理
- 使用请求批处理
- 智能重连策略

### 4. 文件处理
- 分批处理大量文件
- 预检查文件类型
- 缓存路径规范化结果

### 5. UI优化
- 使用虚拟滚动处理大列表
- 应用防抖和节流技术
- 避免频繁的DOM操作

### 6. 监控分析
- 实施性能监控
- 定期检查内存使用
- 生成性能报告

通过遵循这些优化策略，可以显著提升Eagle2Ae扩展的性能和用户体验。建议根据实际使用场景选择合适的优化方案，并定期监控性能指标以持续改进。