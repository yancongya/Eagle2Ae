# Eagle 插件函数功能映射

## 概述

本文档详细说明Eagle2Ae Eagle插件中UI事件与JavaScript函数的对应关系，包括数据流向、状态更新和API调用的完整映射。

## UI事件映射

### 1. 标题栏交互

#### 设置按钮点击
```javascript
// UI元素
<button id="title-settings-button" class="title-settings-btn">

// 事件绑定
document.getElementById('title-settings-button').addEventListener('click', showSettings);

// 函数映射
showSettings() {
    document.getElementById('settings-overlay').style.display = 'flex';
}

// 数据流向
用户点击 → showSettings() → 显示设置对话框
```

### 2. 文件列表交互

#### 文件列表点击
```javascript
// UI元素
<div id="files-list" onclick="handleFileListClick()">

// 函数映射
handleFileListClick() {
    handleManualExport();
}

// 核心导出函数
async function handleManualExport() {
    try {
        // 1. 检查Eagle API可用性
        if (typeof eagle === 'undefined') {
            addLog('Eagle API不可用（可能在浏览器环境中运行）', 'warning');
            return;
        }
        
        // 2. 获取选中文件
        const selectedItems = await eagle.item.getSelected();
        
        // 3. 验证文件数量
        if (selectedItems && selectedItems.length > 0) {
            addLog(`开始发送 ${selectedItems.length} 个文件到AE...`, 'info');
            
            // 4. 调用后台服务
            if (typeof eagle2ae !== 'undefined' && eagle2ae) {
                await eagle2ae.handleSelectedFiles(selectedItems);
                addLog('文件发送完成', 'info');
            } else {
                addLog('服务未就绪，请稍后重试', 'warning');
            }
        } else {
            addLog('没有选中的文件', 'warning');
        }
    } catch (error) {
        console.error('文件发送失败:', error);
        addLog(`发送失败: ${error.message}`, 'error');
    }
}

// 数据流向
用户点击文件列表 → handleFileListClick() → handleManualExport() 
→ eagle.item.getSelected() → eagle2ae.handleSelectedFiles() → 日志更新
```

### 3. 设置对话框交互

#### 保存设置按钮
```javascript
// UI元素
<button id="save-settings">保存设置</button>

// 事件绑定
document.getElementById('save-settings').addEventListener('click', saveSettings);

// 函数映射
function saveSettings() {
    try {
        // 1. 收集表单数据
        const settings = {
            showNotifications: document.getElementById('show-notifications').checked,
            serverPort: parseInt(document.getElementById('server-port').value),
            clipboardInterval: parseInt(document.getElementById('clipboard-interval').value)
        };

        // 2. 保存到本地存储
        localStorage.setItem('eagle2ae-settings', JSON.stringify(settings));
        addLog('设置已保存', 'info');
        hideSettings();

        // 3. 更新插件配置
        if (typeof eagle2ae !== 'undefined' && eagle2ae) {
            eagle2ae.updateSettings(settings);

            // 4. 应用剪切板设置
            if (eagle2ae.clipboardHandler && settings.clipboardInterval) {
                eagle2ae.clipboardHandler.setCheckInterval(settings.clipboardInterval);
            }
        }
    } catch (error) {
        console.error('保存设置失败:', error);
        addLog('保存设置失败', 'error');
    }
}

// 数据流向
用户点击保存 → saveSettings() → 收集表单数据 → localStorage.setItem() 
→ eagle2ae.updateSettings() → 服务配置更新
```

#### 取消设置按钮
```javascript
// UI元素
<button id="cancel-settings">取消</button>

// 事件绑定
document.getElementById('cancel-settings').addEventListener('click', hideSettings);

// 函数映射
function hideSettings() {
    document.getElementById('settings-overlay').style.display = 'none';
}

// 数据流向
用户点击取消 → hideSettings() → 隐藏设置对话框
```

#### 遮罩层点击
```javascript
// 事件绑定
document.getElementById('settings-overlay').addEventListener('click', function(e) {
    if (e.target === this) {
        hideSettings();
    }
});

// 数据流向
用户点击遮罩 → 事件冒泡检查 → hideSettings() → 隐藏设置对话框
```

## 自动更新函数映射

### 1. UI定时更新

#### 启动更新循环
```javascript
// 函数映射
function startUIUpdates() {
    uiUpdateInterval = setInterval(updateUI, 1000);
    updateUI(); // 立即更新一次
}

// 核心更新函数
async function updateUI() {
    await updateSelectedFiles();    // 更新文件列表
    updateServiceStatus();          // 更新服务状态
    updateUptime();                 // 更新运行时间
}

// 数据流向
定时器触发 → updateUI() → 并行执行三个更新函数 → UI状态同步
```

### 2. 文件选择更新

#### 文件列表同步
```javascript
// 函数映射
async function updateSelectedFiles() {
    try {
        // 1. 检查Eagle API可用性
        if (typeof eagle === 'undefined') {
            console.log('Eagle API不可用（可能在浏览器环境中运行）');
            return;
        }
        
        // 2. 获取选中文件
        const selectedItems = await eagle.item.getSelected();
        const filesCount = document.getElementById('files-count');
        const filesList = document.getElementById('files-list');

        // 3. 更新文件计数
        if (selectedItems && selectedItems.length > 0) {
            filesCount.textContent = `已选择 ${selectedItems.length} 个文件`;

            // 4. 更新文件列表显示
            filesList.innerHTML = '';
            selectedItems.slice(0, 10).forEach(item => {
                const fileItem = createFileItemElement(item);
                filesList.appendChild(fileItem);
            });

            // 5. 处理超出显示限制的文件
            if (selectedItems.length > 10) {
                const moreItem = createMoreItemElement(selectedItems.length - 10);
                filesList.appendChild(moreItem);
            }
        } else {
            // 6. 无文件时的显示
            filesCount.textContent = '未选择文件';
            filesList.innerHTML = '<div class="no-files">请在Eagle中选择要导出的文件</div>';
        }
    } catch (error) {
        console.error('更新选中文件失败:', error);
    }
}

// 辅助函数
function createFileItemElement(item) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';

    const fileName = document.createElement('span');
    fileName.className = 'file-name';
    fileName.textContent = item.name || '未知文件';

    const fileType = document.createElement('span');
    fileType.className = 'file-type';
    fileType.textContent = (item.ext || '').toUpperCase();

    fileItem.appendChild(fileName);
    fileItem.appendChild(fileType);
    return fileItem;
}

// 数据流向
定时器 → updateSelectedFiles() → eagle.item.getSelected() 
→ DOM元素创建 → UI更新
```

### 3. 服务状态更新

#### 状态同步函数
```javascript
// 函数映射
function updateServiceStatus() {
    // 1. 更新AE连接端口
    updateAEPort();
    
    // 2. 更新连接状态
    updateConnectionStatus();
}

// 端口更新
function updateAEPort() {
    const portElement = document.getElementById('ae-port');
    
    if (eagle2ae && eagle2ae.config && eagle2ae.config.wsPort) {
        portElement.textContent = eagle2ae.config.wsPort;
    } else {
        // 从设置中获取端口信息作为备选
        const settings = JSON.parse(localStorage.getItem('eagle2ae-settings') || '{}');
        portElement.textContent = settings.serverPort || '8080';
    }
}

// 连接状态更新
function updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    
    if (eagle2ae && eagle2ae.httpServer && eagle2ae.httpServer.listening) {
        statusElement.textContent = '已连接';
        statusElement.className = 'status-value connected';
    } else if (eagle2ae && eagle2ae.aeStatus && eagle2ae.aeStatus.connected) {
        statusElement.textContent = '已连接';
        statusElement.className = 'status-value connected';
    } else {
        statusElement.textContent = '未连接';
        statusElement.className = 'status-value disconnected';
    }
}

// 数据流向
定时器 → updateServiceStatus() → 检查服务状态 → 更新DOM元素样式和文本
```

### 4. 运行时间更新

#### 时间计算函数
```javascript
// 函数映射
function updateUptime() {
    const now = Date.now();
    const uptime = now - startTime;
    
    // 时间格式化
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    
    const uptimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('uptime').textContent = uptimeString;
}

// 数据流向
定时器 → updateUptime() → 时间计算 → 格式化 → DOM更新
```

## 日志系统映射

### 1. 日志添加函数

#### 核心日志函数
```javascript
// 函数映射
function addLog(message, type = 'info') {
    const logOutput = document.getElementById('log-output');
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString();

    // 1. 日志去重检查
    const timeDiff = lastLogTime ? currentTime - lastLogTime : Infinity;
    if (lastLogMessage === message && timeDiff < 5000) {
        updateDuplicateCount();
        return;
    }

    // 2. 重置重复计数
    resetDuplicateTracking(message, currentTime);

    // 3. 创建日志条目
    const logEntry = createLogEntry(timeString, message, type);

    // 4. 清除占位符
    clearLogPlaceholder(logOutput);

    // 5. 添加到DOM
    logOutput.appendChild(logEntry);

    // 6. 限制日志数量
    limitLogEntries(logOutput);

    // 7. 自动滚动
    autoScrollToBottom(logOutput);
}

// 辅助函数
function createLogEntry(timeString, message, type) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.innerHTML = `<span class="log-time">[${timeString}]</span>${message}`;
    return logEntry;
}

function limitLogEntries(logOutput) {
    const entries = logOutput.querySelectorAll('.log-entry');
    if (entries.length > 50) {
        entries[0].remove();
    }
}

function autoScrollToBottom(logOutput) {
    logOutput.scrollTop = logOutput.scrollHeight;
}

// 数据流向
系统事件 → addLog() → 去重检查 → DOM创建 → 限制数量 → 自动滚动
```

### 2. 日志去重机制

#### 重复检测函数
```javascript
// 全局变量
let lastLogMessage = null;
let lastLogTime = null;
let duplicateCount = 0;

// 函数映射
function updateDuplicateCount() {
    duplicateCount++;
    const lastEntry = logOutput.lastElementChild;
    
    if (lastEntry && lastEntry.classList.contains('log-entry')) {
        const countSpan = lastEntry.querySelector('.duplicate-count');
        if (countSpan) {
            countSpan.textContent = ` (×${duplicateCount + 1})`;
        } else {
            const newCountSpan = createDuplicateCountSpan(duplicateCount + 1);
            lastEntry.appendChild(newCountSpan);
        }
    }
}

function createDuplicateCountSpan(count) {
    const span = document.createElement('span');
    span.className = 'duplicate-count';
    span.style.color = '#888';
    span.textContent = ` (×${count})`;
    return span;
}

// 数据流向
重复日志 → updateDuplicateCount() → 查找最后条目 → 更新计数显示
```

## 设置管理映射

### 1. 设置加载函数

#### 初始化设置
```javascript
// 函数映射
function loadSettings() {
    try {
        // 1. 从本地存储读取
        const settings = JSON.parse(localStorage.getItem('eagle2ae-settings') || '{}');

        // 2. 应用到UI控件
        if (typeof settings.showNotifications === 'boolean') {
            document.getElementById('show-notifications').checked = settings.showNotifications;
        }
        if (settings.serverPort) {
            document.getElementById('server-port').value = settings.serverPort;
        }
        if (settings.clipboardInterval) {
            document.getElementById('clipboard-interval').value = settings.clipboardInterval;
        }
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

// 数据流向
页面初始化 → loadSettings() → localStorage.getItem() → 更新表单控件值
```

### 2. 设置验证函数

#### 输入验证
```javascript
// 函数映射
function validateSettings(settings) {
    const errors = [];
    
    // 端口号验证
    if (settings.serverPort < 1024 || settings.serverPort > 65535) {
        errors.push('端口号必须在1024-65535范围内');
    }
    
    // 剪切板间隔验证
    if (settings.clipboardInterval < 500 || settings.clipboardInterval > 10000) {
        errors.push('剪切板检查间隔必须在500-10000毫秒范围内');
    }
    
    return errors;
}

// 数据流向
saveSettings() → validateSettings() → 返回错误列表 → 显示验证结果
```

## 后台服务映射

### 1. 服务初始化

#### Eagle2Ae类初始化
```javascript
// 类构造函数映射
class Eagle2Ae {
    constructor() {
        // 1. 初始化状态
        this.initializeState();
        
        // 2. 检测运行环境
        this.detectEnvironment();
        
        // 3. 启动服务
        this.init();
        
        // 4. 初始化UI（如果有）
        if (this.uiMode) {
            this.initializeUI();
            this.startServiceStatusCheck();
        }
    }
    
    // 状态初始化
    initializeState() {
        this.httpServer = null;
        this.webSocketServer = null;
        this.aeConnection = null;
        this.clipboardHandler = null;
        this.portAllocator = null;
        // ... 其他状态
    }
    
    // 环境检测
    detectEnvironment() {
        if (typeof document !== 'undefined' && document.querySelector('#message')) {
            this.uiMode = true;
            this.log('检测到UI环境，启用窗口模式');
        } else {
            this.log('纯服务模式，无UI界面');
        }
    }
}

// 数据流向
new Eagle2Ae() → constructor() → 状态初始化 → 环境检测 → 服务启动
```

### 2. 服务启动流程

#### 异步初始化
```javascript
// 函数映射
async function init() {
    try {
        // 1. 启动日志
        this.log('🚀 Eagle2Ae 后台服务启动中...', 'info');
        
        // 2. 环境信息记录
        this.logEnvironmentInfo();
        
        // 3. 窗口管理
        this.manageWindow();
        
        // 4. 配置加载
        this.loadConfiguration();
        
        // 5. 服务器启动
        await this.startServer();
        
        // 6. 功能模块初始化
        this.initializeModules();
        
        // 7. 事件监听设置
        this.setupEventListeners();
        
        // 8. 状态检查启动
        this.startStatusChecks();
        
        // 9. 完成通知
        this.notifyStartupComplete();
        
    } catch (error) {
        this.handleStartupError(error);
    }
}

// 数据流向
init() → 配置加载 → 服务器启动 → 模块初始化 → 事件监听 → 状态检查
```

### 3. 文件处理映射

#### 文件选择处理
```javascript
// 函数映射
async function handleSelectedFiles(selectedItems) {
    try {
        // 1. 文件验证
        const validFiles = this.validateFiles(selectedItems);
        
        // 2. 重复检查
        if (this.isDuplicateExport(validFiles)) {
            this.log('检测到重复导出，跳过操作', 'warning');
            return;
        }
        
        // 3. 文件处理
        const processedFiles = await this.processFiles(validFiles);
        
        // 4. 发送到AE
        await this.sendToAE(processedFiles);
        
        // 5. 更新状态
        this.updateExportHistory(validFiles);
        
        this.log(`成功处理 ${validFiles.length} 个文件`, 'success');
        
    } catch (error) {
        this.log(`文件处理失败: ${error.message}`, 'error');
    }
}

// 数据流向
handleSelectedFiles() → 文件验证 → 重复检查 → 文件处理 → 发送AE → 状态更新
```

## WebSocket通信映射

### 1. 连接管理

#### WebSocket服务器启动
```javascript
// 函数映射
async function startWebSocketServer() {
    try {
        // 1. 创建HTTP服务器
        this.httpServer = http.createServer(this.handleHttpRequest.bind(this));
        
        // 2. 创建WebSocket服务器
        this.wss = new WebSocket.Server({ 
            server: this.httpServer,
            path: '/ws'
        });
        
        // 3. 设置事件监听
        this.setupWebSocketEvents();
        
        // 4. 启动监听
        await this.startListening();
        
        this.log(`WebSocket服务器已启动 (端口: ${this.config.wsPort})`, 'success');
        
    } catch (error) {
        this.log(`WebSocket服务器启动失败: ${error.message}`, 'error');
        throw error;
    }
}

// 数据流向
startWebSocketServer() → 创建服务器 → 设置事件 → 开始监听 → 记录状态
```

### 2. 消息处理

#### 消息路由
```javascript
// 函数映射
function handleMessage(ws, data) {
    try {
        // 1. 解析消息
        const message = JSON.parse(data.toString());
        
        // 2. 验证格式
        if (!validateMessage(message)) {
            this.sendError(ws, 'Invalid message format', 'INVALID_FORMAT');
            return;
        }
        
        // 3. 更新统计
        this.stats.messagesReceived++;
        
        // 4. 消息路由
        switch (message.type) {
            case MESSAGE_TYPES.CONNECTION.HANDSHAKE_ACK:
                this.handleHandshakeAck(ws, message);
                break;
            case MESSAGE_TYPES.STATUS.AE_STATUS:
                this.handleAEStatus(ws, message);
                break;
            case MESSAGE_TYPES.FILE.EXPORT_REQUEST:
                this.handleExportRequest(ws, message);
                break;
            default:
                this.handleUnknownMessage(ws, message);
        }
        
    } catch (error) {
        this.log(`消息处理失败: ${error.message}`, 'error');
        this.sendError(ws, 'Message processing failed', 'PROCESSING_ERROR');
    }
}

// 数据流向
WebSocket消息 → handleMessage() → 解析验证 → 类型路由 → 具体处理函数
```

## 剪切板监控映射

### 1. 监控启动

#### 剪切板处理器
```javascript
// 函数映射
class ClipboardHandler {
    startMonitoring() {
        if (this.isMonitoring) {
            this.log('剪切板监控已在运行中');
            return;
        }

        this.isMonitoring = true;
        this.log('开始监控剪切板变化...');

        // 定期检查剪切板内容
        this.monitorInterval = setInterval(async () => {
            await this.checkClipboard();
        }, this.checkInterval);

        // 立即检查一次
        this.checkClipboard();
    }
}

// 数据流向
startMonitoring() → 设置定时器 → 定期执行checkClipboard() → 处理剪切板变化
```

### 2. 内容检测

#### 剪切板内容分析
```javascript
// 函数映射
async function checkClipboard() {
    try {
        // 1. 获取剪切板文件
        const filePaths = await this.getClipboardFiles();
        
        // 2. 检查内容变化
        const currentContent = JSON.stringify(filePaths.sort());
        if (currentContent === this.lastClipboardContent) {
            return; // 内容没有变化
        }
        
        // 3. 更新缓存
        this.lastClipboardContent = currentContent;
        
        // 4. 过滤支持的文件
        const supportedFiles = this.filterSupportedFiles(filePaths);
        
        // 5. 处理文件
        if (supportedFiles.length > 0) {
            await this.handleClipboardFiles(supportedFiles);
        }
        
    } catch (error) {
        this.log(`检查剪切板失败: ${error.message}`, 'error');
    }
}

// 数据流向
定时器 → checkClipboard() → 获取内容 → 变化检测 → 文件过滤 → 处理文件
```

## 错误处理映射

### 1. 全局错误处理

#### 错误捕获
```javascript
// 函数映射
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
    addLog(`发生错误: ${e.error.message}`, 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
    addLog(`异步错误: ${e.reason}`, 'error');
});

// 数据流向
全局错误 → 事件监听器 → 错误记录 → 日志显示
```

### 2. 服务错误处理

#### 错误恢复机制
```javascript
// 函数映射
function handleServiceError(error, context) {
    // 1. 错误记录
    console.error(`服务错误 [${context}]:`, error);
    
    // 2. 用户通知
    addLog(`${context}失败: ${error.message}`, 'error');
    
    // 3. 状态更新
    updateConnectionStatus('error');
    
    // 4. 自动恢复
    if (context === 'connection') {
        setTimeout(() => {
            attemptReconnection();
        }, 5000);
    }
}

// 数据流向
服务错误 → handleServiceError() → 记录通知 → 状态更新 → 自动恢复
```

## 性能监控映射

### 1. 性能指标收集

#### 性能监控器
```javascript
// 函数映射
class PerformanceMonitor {
    static measure(name, fn) {
        const startTime = performance.now();
        const result = fn();
        const duration = performance.now() - startTime;
        
        console.log(`[性能] ${name}: ${duration.toFixed(2)}ms`);
        
        // 记录到性能日志
        if (duration > 100) { // 超过100ms的操作
            addLog(`性能警告: ${name} 耗时 ${duration.toFixed(2)}ms`, 'warning');
        }
        
        return result;
    }
}

// 使用示例
PerformanceMonitor.measure('文件列表更新', () => {
    updateSelectedFiles();
});

// 数据流向
函数调用 → PerformanceMonitor.measure() → 时间测量 → 性能记录 → 警告检查
```

---

## 相关文档

- [插件组件详细说明](plugin-components.md)
- [插件交互指南](../development/plugin-interaction-guide.md)
- [调试指南](../development/debugging-guide.md)
- [WebSocket API](websocket-api.md)
- [配置管理](../development/configuration.md)