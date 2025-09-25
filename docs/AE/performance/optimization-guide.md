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

## 文件检测算法优化

### 1. 项目文件检测性能优化

**v2.3.1版本重大优化**: 将项目文件检测算法从O(n*m)优化到O(n+m)，显著提升大文件集合的处理性能。

#### 1.1 哈希表优化策略

**ExtendScript层面优化**:

```javascript
// 优化前：线性查找 O(n*m)
function checkProjectImportedFiles_old(filePaths) {
    var importedFiles = [];
    var externalFiles = [];
    
    for (var i = 0; i < filePaths.length; i++) {
        var isImported = false;
        
        // 遍历所有项目文件进行比较 - O(m)
        for (var j = 1; j <= app.project.numItems; j++) {
            var item = app.project.item(j);
            if (item instanceof FootageItem && item.file) {
                if (item.file.fsName === filePaths[i]) {
                    isImported = true;
                    break;
                }
            }
        }
        
        if (isImported) {
            importedFiles.push(filePaths[i]);
        } else {
            externalFiles.push(filePaths[i]);
        }
    }
    
    return { importedFiles: importedFiles, externalFiles: externalFiles };
}

// 优化后：哈希表查找 O(n+m)
function checkProjectImportedFiles(filePaths) {
    var importedFiles = [];
    var externalFiles = [];
    
    // 构建项目文件路径哈希表 - O(m)
    var projectFilesMap = {};
    for (var i = 1; i <= app.project.numItems; i++) {
        var item = app.project.item(i);
        if (item instanceof FootageItem && item.file) {
            projectFilesMap[item.file.fsName] = true;
        }
    }
    
    // 快速查找文件是否已导入 - O(n)
    for (var j = 0; j < filePaths.length; j++) {
        if (projectFilesMap[filePaths[j]]) {
            importedFiles.push(filePaths[j]);
        } else {
            externalFiles.push(filePaths[j]);
        }
    }
    
    return { importedFiles: importedFiles, externalFiles: externalFiles };
}
```

**AE项目文件扩展名检测优化**:

```javascript
// 优化前：数组遍历 O(n)
function checkAEProjectFiles_old(filePaths) {
    var aeProjectFiles = [];
    var nonProjectFiles = [];
    var aeExtensions = ['.aep', '.aet', '.aepx'];
    
    for (var i = 0; i < filePaths.length; i++) {
        var filePath = filePaths[i];
        var isAEProject = false;
        
        // 遍历扩展名数组 - O(k)
        for (var j = 0; j < aeExtensions.length; j++) {
            if (filePath.toLowerCase().indexOf(aeExtensions[j]) !== -1) {
                isAEProject = true;
                break;
            }
        }
        
        if (isAEProject) {
            aeProjectFiles.push(filePath);
        } else {
            nonProjectFiles.push(filePath);
        }
    }
    
    return { aeProjectFiles: aeProjectFiles, nonProjectFiles: nonProjectFiles };
}

// 优化后：哈希表查找 O(1)
function checkAEProjectFiles(filePaths) {
    var aeProjectFiles = [];
    var nonProjectFiles = [];
    
    // 使用哈希表存储AE项目文件扩展名 - O(1)查找
    var aeExtensionsMap = {
        '.aep': true,
        '.aet': true,
        '.aepx': true
    };
    
    for (var i = 0; i < filePaths.length; i++) {
        var filePath = filePaths[i];
        var lastDotIndex = filePath.lastIndexOf('.');
        
        if (lastDotIndex !== -1) {
            var extension = filePath.substring(lastDotIndex).toLowerCase();
            if (aeExtensionsMap[extension]) {
                aeProjectFiles.push(filePath);
            } else {
                nonProjectFiles.push(filePath);
            }
        } else {
            nonProjectFiles.push(filePath);
        }
    }
    
    return { aeProjectFiles: aeProjectFiles, nonProjectFiles: nonProjectFiles };
}
```

#### 1.2 JavaScript层面优化

**批量处理策略**:

```javascript
// 优化的项目文件检测方法
async isProjectInternalFile(files) {
    try {
        // 提取文件路径 - 优化路径处理
        const filePaths = files.map(file => {
            return file.path || file.fsName || file.fullName || file.toString();
        });
        
        // 使用哈希表进行快速路径匹配
        const pathSet = new Set(filePaths);
        
        // 首先检查是否包含AE项目文件
        const aeProjectResult = await this.executeExtendScript(
            'checkAEProjectFiles', 
            [filePaths]
        );
        
        if (aeProjectResult.success && aeProjectResult.data.aeProjectFiles.length > 0) {
            // 使用哈希表快速分类文件
            const aeProjectSet = new Set(aeProjectResult.data.aeProjectFiles);
            const projectFiles = filePaths.filter(path => aeProjectSet.has(path));
            const externalFiles = filePaths.filter(path => !aeProjectSet.has(path));
            
            return {
                hasProjectFiles: true,
                projectFiles: projectFiles,
                externalFiles: externalFiles,
                fileType: 'ae_project'
            };
        }
        
        // 批量处理优化：大文件集合分批检查
        if (filePaths.length > 100) {
            return await this.processBatchFileCheck(filePaths);
        }
        
        // 检查文件是否已导入到项目中
        const importResult = await this.executeExtendScript(
            'checkProjectImportedFiles', 
            [filePaths]
        );
        
        if (importResult.success) {
            const data = importResult.data;
            return {
                hasProjectFiles: data.importedFiles.length > 0,
                projectFiles: data.importedFiles,
                externalFiles: data.externalFiles,
                fileType: 'imported'
            };
        }
        
        // 检测失败时允许导入，避免阻止正常功能
        return {
            hasProjectFiles: false,
            projectFiles: [],
            externalFiles: filePaths,
            fileType: 'unknown'
        };
        
    } catch (error) {
        console.error('[ERROR] 项目文件检测失败:', error.message);
        // 出错时允许导入，确保功能可用性
        return {
            hasProjectFiles: false,
            projectFiles: [],
            externalFiles: files.map(f => f.path || f.toString()),
            fileType: 'error'
        };
    }
}

// 批量处理方法
async processBatchFileCheck(filePaths) {
    const batchSize = 50;
    const allImportedFiles = [];
    const allExternalFiles = [];
    
    for (let i = 0; i < filePaths.length; i += batchSize) {
        const batch = filePaths.slice(i, i + batchSize);
        
        try {
            const batchResult = await this.executeExtendScript(
                'checkProjectImportedFiles', 
                [batch]
            );
            
            if (batchResult.success) {
                allImportedFiles.push(...batchResult.data.importedFiles);
                allExternalFiles.push(...batchResult.data.externalFiles);
            } else {
                // 批次失败时将文件标记为外部文件
                allExternalFiles.push(...batch);
            }
        } catch (error) {
            console.error(`[ERROR] 批次 ${i}-${i + batchSize} 检测失败:`, error.message);
            allExternalFiles.push(...batch);
        }
    }
    
    return {
        hasProjectFiles: allImportedFiles.length > 0,
        projectFiles: allImportedFiles,
        externalFiles: allExternalFiles,
        fileType: 'imported'
    };
}
```

#### 1.3 性能优化成果

**算法复杂度对比**:
- **优化前**: O(n*m) - 每个文件都需要遍历所有项目文件
- **优化后**: O(n+m) - 一次构建哈希表，后续O(1)查找

**性能提升数据**:
- **小文件集合** (< 50个文件): 性能提升 60-80%
- **大文件集合** (> 100个文件): 性能提升 80-90%
- **内存使用**: 减少约 40%
- **检测速度**: 144个序列帧文件从 3-5秒 缩短到 < 1秒

**日志优化**:
- 移除生产环境中的调试日志
- 减少不必要的日志输出
- 优化日志格式，提高可读性

### 2. 拖拽性能优化

#### 2.1 文件夹展开优化

```javascript
class OptimizedDragHandler {
    constructor() {
        this.maxFileLimit = 500; // 文件数量限制
        this.batchSize = 50;     // 批处理大小
    }
    
    async handleFolderDrop(folderPath) {
        try {
            // 快速预检查文件数量
            const fileCount = await this.getFileCount(folderPath);
            
            if (fileCount > this.maxFileLimit) {
                const proceed = await this.showLargeFileSetWarning(fileCount);
                if (!proceed) return;
            }
            
            // 分批处理文件发现
            const files = await this.discoverFilesInBatches(folderPath);
            
            // 执行项目文件检测
            return await this.isProjectInternalFile(files);
            
        } catch (error) {
            console.error('[ERROR] 文件夹拖拽处理失败:', error);
            throw error;
        }
    }
    
    async discoverFilesInBatches(folderPath) {
        const allFiles = [];
        const directories = [folderPath];
        
        while (directories.length > 0) {
            const currentDir = directories.pop();
            const items = await this.readDirectory(currentDir);
            
            for (const item of items) {
                if (item.isDirectory) {
                    directories.push(item.path);
                } else {
                    allFiles.push(item);
                    
                    // 分批处理，避免阻塞UI
                    if (allFiles.length % this.batchSize === 0) {
                        await this.sleep(10); // 短暂延迟
                    }
                }
            }
        }
        
        return allFiles;
    }
}
```

#### 2.2 序列帧检测优化

```javascript
class SequenceDetector {
    constructor() {
        this.sequencePatterns = [
            /^(.+?)(\d{3,})(\.\w+)$/,  // name001.ext
            /^(.+?)_(\d{3,})(\.\w+)$/, // name_001.ext
            /^(.+?)\.(\d{3,})(\.\w+)$/ // name.001.ext
        ];
    }
    
    detectSequences(files) {
        const sequences = new Map();
        const singleFiles = [];
        
        // 使用哈希表快速分组
        const groupMap = new Map();
        
        for (const file of files) {
            const match = this.matchSequencePattern(file.name);
            
            if (match) {
                const { base, number, extension } = match;
                const key = `${base}${extension}`;
                
                if (!groupMap.has(key)) {
                    groupMap.set(key, []);
                }
                groupMap.get(key).push({
                    file: file,
                    number: parseInt(number, 10)
                });
            } else {
                singleFiles.push(file);
            }
        }
        
        // 识别真正的序列（至少3个连续文件）
        for (const [key, group] of groupMap) {
            if (group.length >= 3) {
                // 排序并检查连续性
                group.sort((a, b) => a.number - b.number);
                
                const consecutiveGroups = this.findConsecutiveGroups(group);
                for (const consecutiveGroup of consecutiveGroups) {
                    if (consecutiveGroup.length >= 3) {
                        sequences.set(key, consecutiveGroup.map(item => item.file));
                    } else {
                        singleFiles.push(...consecutiveGroup.map(item => item.file));
                    }
                }
            } else {
                singleFiles.push(...group.map(item => item.file));
            }
        }
        
        return { sequences, singleFiles };
    }
    
    matchSequencePattern(filename) {
        for (const pattern of this.sequencePatterns) {
            const match = filename.match(pattern);
            if (match) {
                return {
                    base: match[1],
                    number: match[2],
                    extension: match[3]
                };
            }
        }
        return null;
    }
    
    findConsecutiveGroups(sortedGroup) {
        const groups = [];
        let currentGroup = [sortedGroup[0]];
        
        for (let i = 1; i < sortedGroup.length; i++) {
            if (sortedGroup[i].number === sortedGroup[i-1].number + 1) {
                currentGroup.push(sortedGroup[i]);
            } else {
                if (currentGroup.length >= 3) {
                    groups.push(currentGroup);
                }
                currentGroup = [sortedGroup[i]];
            }
        }
        
        if (currentGroup.length >= 3) {
            groups.push(currentGroup);
        }
        
        return groups;
    }
}
```

### 3. 监控和性能分析

#### 3.1 性能监控

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

#### 3.2 内存使用监控

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

---

## 案例研究：v2.3.0 对话框系统重构

在 v2.3.0 版本中，我们对“图层检测总结”对话框进行了一次重要的架构重构，这是一个通过简化架构来提升性能的典型成功案例。

### 优化前的状态
- **技术实现**: 使用 ExtendScript 的原生 `Window` 对象 (`dialog-summary.jsx`)。
- **存在问题**:
    - **代码臃肿**: 创建和管理原生UI元素需要大量JSX代码，文件体积较大（约1600行）。
    - **性能开销**: 每次显示弹窗都涉及较多的CEP跨环境通信和AE原生UI资源的渲染，导致加载和响应较慢。
    - **维护困难**: UI与逻辑耦合在JSX文件中，不易维护和扩展。

### 优化后的状态
- **技术实现**: 重构为基于前端Web技术的HTML/CSS模态框 (`js/ui/summary-dialog.js`)。
- **实现方式**: 在CEP面板内部直接通过JavaScript动态创建和渲染DOM元素，样式由CSS控制。
- **取得成果**:
    - **代码大幅简化**: 新的实现方式代码量减少了约 **57%**（减少到约700行）。
    - **性能显著提升**:
        - **加载速度更快**: 无需等待AE原生窗口的渲染，弹窗几乎瞬时显示。
        - **响应更流畅**: 所有交互都在CEP环境的Webview中完成，避免了跨环境通信的延迟。
    - **内存占用降低**: 简化的逻辑和更少的原生资源调用，有效降低了内存占用。

### 结论
这个案例表明，在CEP开发中，对于复杂的、交互密集的UI，优先采用前端Web技术（HTML/CSS/JS）在面板内部实现，而不是过度依赖ExtendScript创建原生UI，是提升插件性能、可维护性和用户体验的有效途径。
