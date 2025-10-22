# Eagle 插件调试指南

## 概述

本指南提供Eagle2Ae Eagle插件的调试方法、故障排除和性能优化技巧。帮助开发者快速定位问题并解决常见故障。

## 调试环境设置

### 1. 开发者工具启用

#### Eagle插件开发者工具
```json
// manifest.json 配置
{
    "devTools": true,
    "main": {
        "serviceMode": true,
        "showOnRun": true,
        "visible": true
    }
}
```

#### 访问开发者工具
1. 在Eagle中打开插件
2. 右键点击插件窗口
3. 选择"检查元素"或"开发者工具"
4. 或使用快捷键 `F12`

### 2. 调试模式配置

#### 启用详细日志
```javascript
// 在plugin.js中设置调试模式
const DEBUG_MODE = true;

function debugLog(message, data = null) {
    if (DEBUG_MODE) {
        console.log(`[DEBUG] ${message}`, data);
        if (window.uiAddLog) {
            window.uiAddLog(`[DEBUG] ${message}`, 'info');
        }
    }
}

// 使用示例
debugLog('文件选择更新', selectedFiles);
debugLog('WebSocket连接状态', connectionStatus);
```

#### 环境变量设置
```javascript
// 检测调试环境
const isDebugEnvironment = () => {
    return typeof eagle !== 'undefined' && 
           eagle.app && 
           eagle.app.version && 
           eagle.app.version.includes('dev');
};

if (isDebugEnvironment()) {
    console.log('检测到开发环境，启用调试功能');
    window.DEBUG_MODE = true;
}
```

## 常见问题诊断

### 1. 插件启动问题

#### 问题：插件无法启动
```javascript
// 诊断步骤
function diagnoseStartupIssues() {
    console.log('=== 插件启动诊断 ===');
    
    // 1. 检查Eagle API可用性
    console.log('Eagle API可用性:', typeof eagle !== 'undefined');
    if (typeof eagle !== 'undefined') {
        console.log('Eagle版本:', eagle.app?.version);
        console.log('Eagle路径:', eagle.app?.execPath);
    }
    
    // 2. 检查Node.js环境
    console.log('Node.js可用性:', typeof process !== 'undefined');
    if (typeof process !== 'undefined') {
        console.log('Node.js版本:', process.version);
        console.log('当前工作目录:', process.cwd());
    }
    
    // 3. 检查必要模块
    const requiredModules = ['http', 'fs', 'path', 'os'];
    requiredModules.forEach(module => {
        try {
            require(module);
            console.log(`✅ 模块 ${module} 可用`);
        } catch (error) {
            console.error(`❌ 模块 ${module} 不可用:`, error.message);
        }
    });
    
    // 4. 检查端口可用性
    checkPortAvailability([8080, 8081, 8082]);
}

// 端口检查函数
async function checkPortAvailability(ports) {
    for (const port of ports) {
        try {
            const isAvailable = await isPortAvailable(port);
            console.log(`端口 ${port}:`, isAvailable ? '可用' : '被占用');
        } catch (error) {
            console.error(`检查端口 ${port} 失败:`, error.message);
        }
    }
}
```

#### 解决方案
1. **Eagle API不可用**
   - 确认Eagle版本 ≥ 3.0
   - 重启Eagle应用
   - 检查插件权限设置

2. **Node.js模块缺失**
   - 检查Eagle插件环境
   - 确认manifest.json配置正确
   - 重新安装插件

3. **端口被占用**
   - 使用动态端口分配
   - 检查防火墙设置
   - 关闭占用端口的程序

### 2. 文件选择问题

#### 问题：无法获取选中文件
```javascript
// 诊断函数
async function diagnoseFileSelection() {
    console.log('=== 文件选择诊断 ===');
    
    try {
        // 1. 检查Eagle API
        if (typeof eagle === 'undefined') {
            console.error('❌ Eagle API不可用');
            return;
        }
        
        // 2. 检查item API
        if (!eagle.item) {
            console.error('❌ eagle.item API不可用');
            return;
        }
        
        // 3. 尝试获取选中文件
        console.log('🔍 尝试获取选中文件...');
        const selectedItems = await eagle.item.getSelected();
        
        console.log('选中文件数量:', selectedItems?.length || 0);
        if (selectedItems && selectedItems.length > 0) {
            console.log('文件详情:', selectedItems.map(item => ({
                name: item.name,
                path: item.path,
                ext: item.ext,
                size: item.size
            })));
        }
        
        // 4. 检查文件权限
        if (selectedItems && selectedItems.length > 0) {
            for (const item of selectedItems.slice(0, 3)) { // 只检查前3个
                await checkFileAccess(item.path);
            }
        }
        
    } catch (error) {
        console.error('文件选择诊断失败:', error);
    }
}

// 文件访问检查
async function checkFileAccess(filePath) {
    try {
        const fs = require('fs');
        const stats = await fs.promises.stat(filePath);
        console.log(`✅ 文件可访问: ${filePath} (${stats.size} bytes)`);
    } catch (error) {
        console.error(`❌ 文件访问失败: ${filePath}`, error.message);
    }
}
```

#### 解决方案
1. **API调用失败**
   - 检查Eagle版本兼容性
   - 确认在Eagle环境中运行
   - 检查API调用时机

2. **文件路径问题**
   - 验证文件路径格式
   - 检查文件是否存在
   - 确认文件访问权限

3. **异步调用问题**
   - 使用正确的async/await语法
   - 添加适当的错误处理
   - 检查Promise链

### 3. WebSocket连接问题

#### 问题：无法连接到AE扩展
```javascript
// WebSocket连接诊断
function diagnoseWebSocketConnection() {
    console.log('=== WebSocket连接诊断 ===');
    
    // 1. 检查服务器状态
    if (eagle2ae && eagle2ae.httpServer) {
        console.log('HTTP服务器状态:', eagle2ae.httpServer.listening ? '运行中' : '已停止');
        if (eagle2ae.httpServer.listening) {
            const address = eagle2ae.httpServer.address();
            console.log('服务器地址:', address);
        }
    } else {
        console.error('❌ HTTP服务器未初始化');
    }
    
    // 2. 检查WebSocket服务器
    if (eagle2ae && eagle2ae.webSocketServer) {
        console.log('WebSocket服务器状态:', eagle2ae.webSocketServer.readyState);
    } else {
        console.error('❌ WebSocket服务器未初始化');
    }
    
    // 3. 检查端口注册
    checkPortRegistry();
    
    // 4. 测试连接
    testWebSocketConnection();
}

// 端口注册检查
function checkPortRegistry() {
    try {
        const fs = require('fs');
        const os = require('os');
        const path = require('path');
        
        const registryFile = path.join(os.tmpdir(), 'eagle2ae_port.txt');
        
        if (fs.existsSync(registryFile)) {
            const content = fs.readFileSync(registryFile, 'utf8');
            const serviceInfo = JSON.parse(content);
            console.log('端口注册信息:', serviceInfo);
        } else {
            console.warn('⚠️ 端口注册文件不存在');
        }
    } catch (error) {
        console.error('检查端口注册失败:', error.message);
    }
}

// 测试WebSocket连接
function testWebSocketConnection() {
    const testPort = eagle2ae?.config?.wsPort || 8080;
    const testUrl = `ws://localhost:${testPort}/ws`;
    
    console.log(`🔗 测试WebSocket连接: ${testUrl}`);
    
    try {
        const WebSocket = require('ws');
        const ws = new WebSocket(testUrl);
        
        ws.on('open', () => {
            console.log('✅ WebSocket连接测试成功');
            ws.close();
        });
        
        ws.on('error', (error) => {
            console.error('❌ WebSocket连接测试失败:', error.message);
        });
        
        // 5秒超时
        setTimeout(() => {
            if (ws.readyState === WebSocket.CONNECTING) {
                console.error('❌ WebSocket连接超时');
                ws.terminate();
            }
        }, 5000);
        
    } catch (error) {
        console.error('WebSocket测试初始化失败:', error.message);
    }
}
```

#### 解决方案
1. **服务器启动失败**
   - 检查端口是否被占用
   - 确认防火墙设置
   - 重启插件服务

2. **连接被拒绝**
   - 验证端口号正确性
   - 检查AE扩展是否运行
   - 确认网络连接

3. **消息传输失败**
   - 检查消息格式
   - 验证协议版本
   - 查看网络日志

### 4. 剪切板监控问题

#### 问题：剪切板监控不工作
```javascript
// 剪切板诊断
function diagnoseClipboardMonitoring() {
    console.log('=== 剪切板监控诊断 ===');
    
    // 1. 检查剪切板处理器
    if (eagle2ae && eagle2ae.clipboardHandler) {
        console.log('剪切板处理器状态:', {
            isMonitoring: eagle2ae.clipboardHandler.isMonitoring,
            checkInterval: eagle2ae.clipboardHandler.checkInterval,
            lastContent: eagle2ae.clipboardHandler.lastClipboardContent
        });
    } else {
        console.error('❌ 剪切板处理器未初始化');
        return;
    }
    
    // 2. 测试剪切板API
    testClipboardAPI();
    
    // 3. 检查支持的文件类型
    console.log('支持的文件类型:', eagle2ae.clipboardHandler.supportedFileTypes);
}

// 剪切板API测试
async function testClipboardAPI() {
    try {
        if (typeof eagle !== 'undefined' && eagle.clipboard) {
            console.log('✅ Eagle剪切板API可用');
            
            // 测试读取文本
            try {
                const text = await eagle.clipboard.readText();
                console.log('剪切板文本内容长度:', text?.length || 0);
                if (text && text.length < 200) {
                    console.log('剪切板文本内容:', text);
                }
            } catch (error) {
                console.error('读取剪切板文本失败:', error.message);
            }
            
            // 测试格式检查
            const formats = ['Files', 'public.file-url', 'text/uri-list'];
            for (const format of formats) {
                try {
                    const hasFormat = eagle.clipboard.has(format);
                    console.log(`格式 ${format}:`, hasFormat ? '存在' : '不存在');
                } catch (error) {
                    console.error(`检查格式 ${format} 失败:`, error.message);
                }
            }
        } else {
            console.error('❌ Eagle剪切板API不可用');
        }
    } catch (error) {
        console.error('剪切板API测试失败:', error);
    }
}
```

#### 解决方案
1. **API不可用**
   - 确认Eagle版本支持剪切板API
   - 检查插件权限设置
   - 重启Eagle应用

2. **监控不触发**
   - 检查监控间隔设置
   - 验证文件类型支持
   - 确认剪切板内容格式

3. **文件路径解析失败**
   - 检查路径格式
   - 验证文件存在性
   - 确认文件访问权限

## 性能调试

### 1. 性能监控

#### 性能指标收集
```javascript
// 性能监控类
class PerformanceProfiler {
    constructor() {
        this.metrics = new Map();
        this.startTimes = new Map();
    }
    
    // 开始计时
    start(name) {
        this.startTimes.set(name, performance.now());
    }
    
    // 结束计时
    end(name) {
        const startTime = this.startTimes.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            this.recordMetric(name, duration);
            this.startTimes.delete(name);
            return duration;
        }
    }
    
    // 记录指标
    recordMetric(name, value) {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name).push({
            value,
            timestamp: Date.now()
        });
        
        // 保持最近100条记录
        const records = this.metrics.get(name);
        if (records.length > 100) {
            records.shift();
        }
    }
    
    // 获取统计信息
    getStats(name) {
        const records = this.metrics.get(name) || [];
        if (records.length === 0) return null;
        
        const values = records.map(r => r.value);
        return {
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            recent: values.slice(-10) // 最近10次
        };
    }
    
    // 生成报告
    generateReport() {
        console.log('=== 性能报告 ===');
        for (const [name, _] of this.metrics) {
            const stats = this.getStats(name);
            if (stats) {
                console.log(`${name}:`, {
                    '调用次数': stats.count,
                    '平均耗时': `${stats.avg.toFixed(2)}ms`,
                    '最小耗时': `${stats.min.toFixed(2)}ms`,
                    '最大耗时': `${stats.max.toFixed(2)}ms`,
                    '最近耗时': stats.recent.map(v => `${v.toFixed(2)}ms`).join(', ')
                });
            }
        }
    }
}

// 全局性能监控器
const profiler = new PerformanceProfiler();

// 使用示例
function monitoredUpdateFiles() {
    profiler.start('updateSelectedFiles');
    updateSelectedFiles().finally(() => {
        const duration = profiler.end('updateSelectedFiles');
        if (duration > 100) {
            console.warn(`⚠️ 文件更新耗时过长: ${duration.toFixed(2)}ms`);
        }
    });
}
```

#### 内存使用监控
```javascript
// 内存监控
function monitorMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
        const usage = process.memoryUsage();
        console.log('内存使用情况:', {
            'RSS': `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
            '堆总量': `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            '堆使用': `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            '外部': `${(usage.external / 1024 / 1024).toFixed(2)} MB`
        });
    }
}

// 定期监控内存
setInterval(monitorMemoryUsage, 30000); // 每30秒检查一次
```

### 2. 性能优化

#### 防抖和节流
```javascript
// 防抖函数
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
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

// 应用到文件更新
const debouncedUpdateFiles = debounce(updateSelectedFiles, 300);
const throttledAddLog = throttle(addLog, 100);
```

#### 批量操作优化
```javascript
// 批量DOM更新
class BatchDOMUpdater {
    constructor() {
        this.updates = [];
        this.scheduled = false;
    }
    
    // 添加更新任务
    addUpdate(element, property, value) {
        this.updates.push({ element, property, value });
        this.scheduleUpdate();
    }
    
    // 调度更新
    scheduleUpdate() {
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => {
                this.flushUpdates();
            });
        }
    }
    
    // 执行批量更新
    flushUpdates() {
        for (const update of this.updates) {
            update.element[update.property] = update.value;
        }
        this.updates = [];
        this.scheduled = false;
    }
}

const domUpdater = new BatchDOMUpdater();

// 使用示例
function updateFilesList(files) {
    const container = document.getElementById('files-list');
    
    // 批量更新而不是逐个更新
    domUpdater.addUpdate(container, 'innerHTML', '');
    
    files.forEach(file => {
        const element = createFileElement(file);
        domUpdater.addUpdate(container, 'appendChild', element);
    });
}
```

## 日志调试

### 1. 结构化日志

#### 日志级别管理
```javascript
// 日志级别定义
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4
};

// 当前日志级别
let currentLogLevel = LOG_LEVELS.INFO;

// 结构化日志函数
function structuredLog(level, category, message, data = null) {
    if (level > currentLogLevel) return;
    
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level: Object.keys(LOG_LEVELS)[level],
        category,
        message,
        data
    };
    
    // 控制台输出
    const logMethod = level === LOG_LEVELS.ERROR ? 'error' : 
                     level === LOG_LEVELS.WARN ? 'warn' : 'log';
    console[logMethod](`[${logEntry.level}] [${category}] ${message}`, data);
    
    // UI日志输出
    if (window.uiAddLog) {
        const uiType = level === LOG_LEVELS.ERROR ? 'error' : 
                      level === LOG_LEVELS.WARN ? 'warning' : 'info';
        window.uiAddLog(`[${category}] ${message}`, uiType);
    }
    
    // 保存到日志缓存
    saveToLogCache(logEntry);
}

// 便捷日志函数
const logger = {
    error: (category, message, data) => structuredLog(LOG_LEVELS.ERROR, category, message, data),
    warn: (category, message, data) => structuredLog(LOG_LEVELS.WARN, category, message, data),
    info: (category, message, data) => structuredLog(LOG_LEVELS.INFO, category, message, data),
    debug: (category, message, data) => structuredLog(LOG_LEVELS.DEBUG, category, message, data),
    trace: (category, message, data) => structuredLog(LOG_LEVELS.TRACE, category, message, data)
};

// 使用示例
logger.info('FileManager', '开始更新文件列表', { count: files.length });
logger.error('WebSocket', '连接失败', { port: 8080, error: error.message });
logger.debug('ClipboardHandler', '检测到剪切板变化', { files: clipboardFiles });
```

#### 日志缓存和导出
```javascript
// 日志缓存
const logCache = {
    entries: [],
    maxSize: 1000,
    
    add(entry) {
        this.entries.push(entry);
        if (this.entries.length > this.maxSize) {
            this.entries.shift();
        }
    },
    
    // 导出日志
    export(filter = null) {
        let entries = this.entries;
        
        if (filter) {
            entries = entries.filter(filter);
        }
        
        return entries.map(entry => 
            `${entry.timestamp} [${entry.level}] [${entry.category}] ${entry.message}` +
            (entry.data ? ` ${JSON.stringify(entry.data)}` : '')
        ).join('\n');
    },
    
    // 保存到文件
    saveToFile(filename = null) {
        try {
            const fs = require('fs');
            const path = require('path');
            const os = require('os');
            
            const defaultFilename = `eagle2ae-debug-${Date.now()}.log`;
            const filepath = path.join(os.tmpdir(), filename || defaultFilename);
            
            const logContent = this.export();
            fs.writeFileSync(filepath, logContent, 'utf8');
            
            console.log(`日志已保存到: ${filepath}`);
            return filepath;
        } catch (error) {
            console.error('保存日志文件失败:', error);
        }
    }
};

function saveToLogCache(entry) {
    logCache.add(entry);
}
```

### 2. 调试工具函数

#### 状态快照
```javascript
// 状态快照工具
function captureStateSnapshot() {
    const snapshot = {
        timestamp: new Date().toISOString(),
        eagle2ae: eagle2ae ? {
            config: eagle2ae.config,
            aeStatus: eagle2ae.aeStatus,
            eagleStatus: eagle2ae.eagleStatus,
            isInitializing: eagle2ae.isInitializing,
            selectedFiles: eagle2ae.selectedFiles?.length || 0
        } : null,
        ui: {
            filesCount: document.getElementById('files-count')?.textContent,
            connectionStatus: document.getElementById('connection-status')?.textContent,
            aePort: document.getElementById('ae-port')?.textContent,
            uptime: document.getElementById('uptime')?.textContent
        },
        environment: {
            eagleAvailable: typeof eagle !== 'undefined',
            nodeAvailable: typeof process !== 'undefined',
            userAgent: navigator.userAgent
        }
    };
    
    console.log('状态快照:', snapshot);
    return snapshot;
}

// 定期状态快照
function startStateMonitoring(interval = 60000) {
    setInterval(() => {
        const snapshot = captureStateSnapshot();
        logger.debug('StateMonitor', '状态快照', snapshot);
    }, interval);
}
```

#### 网络请求监控
```javascript
// 网络请求监控
class NetworkMonitor {
    constructor() {
        this.requests = [];
        this.setupInterception();
    }
    
    setupInterception() {
        // 拦截fetch请求
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const request = {
                url: args[0],
                options: args[1],
                startTime,
                timestamp: Date.now()
            };
            
            try {
                const response = await originalFetch(...args);
                request.duration = performance.now() - startTime;
                request.status = response.status;
                request.success = response.ok;
                
                this.logRequest(request);
                return response;
            } catch (error) {
                request.duration = performance.now() - startTime;
                request.error = error.message;
                request.success = false;
                
                this.logRequest(request);
                throw error;
            }
        };
    }
    
    logRequest(request) {
        this.requests.push(request);
        
        // 保持最近100个请求
        if (this.requests.length > 100) {
            this.requests.shift();
        }
        
        logger.debug('NetworkMonitor', '网络请求', {
            url: request.url,
            duration: `${request.duration.toFixed(2)}ms`,
            status: request.status,
            success: request.success
        });
    }
    
    getStats() {
        const successful = this.requests.filter(r => r.success);
        const failed = this.requests.filter(r => !r.success);
        
        return {
            total: this.requests.length,
            successful: successful.length,
            failed: failed.length,
            avgDuration: successful.length > 0 ? 
                successful.reduce((sum, r) => sum + r.duration, 0) / successful.length : 0
        };
    }
}

const networkMonitor = new NetworkMonitor();
```

## 故障排除清单

### 1. 启动问题检查清单
- [ ] Eagle版本 ≥ 3.0
- [ ] 插件manifest.json配置正确
- [ ] Node.js环境可用
- [ ] 必要模块可以加载
- [ ] 端口未被占用
- [ ] 防火墙允许连接
- [ ] 插件权限设置正确

### 2. 连接问题检查清单
- [ ] WebSocket服务器启动成功
- [ ] 端口注册文件存在
- [ ] AE扩展正在运行
- [ ] 网络连接正常
- [ ] 消息格式正确
- [ ] 协议版本匹配

### 3. 文件操作检查清单
- [ ] Eagle API可用
- [ ] 文件选择API正常
- [ ] 文件路径有效
- [ ] 文件访问权限正确
- [ ] 支持的文件类型
- [ ] 文件大小合理

### 4. 性能问题检查清单
- [ ] 内存使用正常
- [ ] CPU使用率合理
- [ ] 网络延迟可接受
- [ ] 日志输出不过量
- [ ] 定时器设置合理
- [ ] DOM操作优化

## 调试命令

### 1. 控制台调试命令
```javascript
// 在浏览器控制台中使用的调试命令

// 获取插件状态
window.debugGetStatus = () => {
    return captureStateSnapshot();
};

// 强制更新文件列表
window.debugUpdateFiles = () => {
    updateSelectedFiles();
};

// 测试WebSocket连接
window.debugTestConnection = () => {
    diagnoseWebSocketConnection();
};

// 导出日志
window.debugExportLogs = () => {
    return logCache.saveToFile();
};

// 性能报告
window.debugPerformance = () => {
    profiler.generateReport();
    return networkMonitor.getStats();
};

// 清理缓存
window.debugClearCache = () => {
    logCache.entries = [];
    profiler.metrics.clear();
    console.log('缓存已清理');
};

// 设置日志级别
window.debugSetLogLevel = (level) => {
    currentLogLevel = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
    console.log(`日志级别已设置为: ${level}`);
};
```

### 2. 快速诊断命令
```javascript
// 一键诊断
window.debugQuickDiagnose = () => {
    console.log('=== 快速诊断开始 ===');
    
    diagnoseStartupIssues();
    diagnoseFileSelection();
    diagnoseWebSocketConnection();
    diagnoseClipboardMonitoring();
    
    console.log('=== 快速诊断完成 ===');
    
    // 生成诊断报告
    const report = {
        timestamp: new Date().toISOString(),
        status: captureStateSnapshot(),
        performance: profiler.getStats('updateSelectedFiles'),
        network: networkMonitor.getStats(),
        logs: logCache.entries.slice(-20) // 最近20条日志
    };
    
    console.log('诊断报告:', report);
    return report;
};
```

---

## 相关文档

- [插件组件详细说明](../api/plugin-components.md)
- [插件交互指南](plugin-interaction-guide.md)
- [函数功能映射](../api/function-mapping.md)
- [配置管理](configuration.md)
- [WebSocket API](../api/websocket-api.md)