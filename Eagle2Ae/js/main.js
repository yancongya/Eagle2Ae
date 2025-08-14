// Export to AE - After Effects CEP扩展
// 与Eagle插件进行手动控制的HTTP通信

// 连接状态枚举
const ConnectionState = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    ERROR: 'error'
};

// 轮询管理器
class PollingManager {
    constructor(callback, interval = 500) {
        this.callback = callback;
        this.interval = interval;
        this.isActive = false;
        this.pollInterval = null;
    }

    start() {
        if (!this.isActive) {
            this.isActive = true;
            this.pollInterval = setInterval(this.callback, this.interval);
            console.log('轮询已启动');
        }
    }

    stop() {
        if (this.isActive) {
            this.isActive = false;
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            console.log('轮询已停止');
        }
    }

    isRunning() {
        return this.isActive;
    }
}

// 连接质量监控器
class ConnectionMonitor {
    constructor() {
        this.pingTimes = [];
        this.successCount = 0;
        this.totalAttempts = 0;
    }

    recordPing(startTime) {
        const pingTime = Date.now() - startTime;
        this.pingTimes.push(pingTime);
        if (this.pingTimes.length > 10) {
            this.pingTimes.shift();
        }
        this.totalAttempts++;
        this.successCount++;
        return pingTime;
    }

    recordFailure() {
        this.totalAttempts++;
    }

    getAveragePing() {
        return this.pingTimes.length > 0
            ? Math.round(this.pingTimes.reduce((a, b) => a + b) / this.pingTimes.length)
            : 0;
    }

    getSuccessRate() {
        return this.totalAttempts > 0
            ? Math.round((this.successCount / this.totalAttempts) * 100)
            : 0;
    }

    reset() {
        this.pingTimes = [];
        this.successCount = 0;
        this.totalAttempts = 0;
    }
}

class AEExtension {
    constructor() {
        this.csInterface = new CSInterface();
        this.connectionState = ConnectionState.DISCONNECTED;
        this.eagleUrl = 'http://localhost:8080';
        this.currentPort = 8080;
        this.isHandlingPortChange = false;

        // 轮询管理
        this.pollingManager = new PollingManager(() => this.pollMessages(), 500);

        // 连接监控
        this.connectionMonitor = new ConnectionMonitor();

        this.currentProject = {
            path: null,
            name: null,
            activeComp: null
        };

        // 消息去重
        this.processedMessages = new Set();
        this.lastPollTime = 0;

        // 日志管理
        this.currentLogView = 'ae'; // 'ae' 或 'eagle'
        this.eagleLogs = [];
        this.aeLogs = [];

        // 设置管理
        this.settingsManager = new SettingsManager();
        this.settingsPanel = null;
        this.quickSettingsInitialized = false;

        // 文件处理器
        this.fileHandler = new FileHandler(this.settingsManager, this.csInterface, this.log.bind(this));

        // 音效播放器
        this.soundPlayer = new SoundPlayer();

        // 初始化端口设置
        this.initializePort();

        // 启动端口广播服务
        this.startPortBroadcast();

        this.init();
    }

    // 初始化端口设置
    initializePort() {
        const preferences = this.settingsManager.getPreferences();
        this.updateEagleUrl(preferences.communicationPort);
    }

    // 启动端口广播服务
    startPortBroadcast() {
        this.log('启动端口广播服务，帮助Eagle扩展自动发现AE端口...', 'info');

        // 每5秒广播一次端口信息
        this.portBroadcastInterval = setInterval(() => {
            this.broadcastPortInfo();
        }, 5000);

        // 立即广播一次
        setTimeout(() => {
            this.broadcastPortInfo();
        }, 1000);
    }

    // 广播端口信息给Eagle扩展
    async broadcastPortInfo() {
        const commonPorts = [8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089];
        const currentAEPort = this.currentPort;

        for (const port of commonPorts) {
            if (port === currentAEPort) {
                continue; // 跳过自己的端口
            }

            try {
                // 向可能的Eagle端口发送端口信息
                const response = await fetch(`http://localhost:${port}/ae-port-info`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        aePort: currentAEPort,
                        timestamp: Date.now(),
                        source: 'ae_extension'
                    }),
                    signal: AbortSignal.timeout(1000) // 1秒超时
                });

                if (response.ok) {
                    this.log(`📡 已向Eagle扩展(端口${port})广播AE端口信息: ${currentAEPort}`, 'info');
                    // 找到一个Eagle扩展就够了，停止广播
                    break;
                }
            } catch (error) {
                // 静默处理，继续尝试下一个端口
            }
        }
    }

    // 初始化扩展
    init() {
        this.log('AE扩展初始化中...', 'info');
        this.setupUI();
        this.startProjectMonitoring();
        this.updateConnectionUI();
        this.updateLogControls(); // 初始化日志控制
        this.initializeLatestLogDisplay(); // 初始化最新日志显示
        this.log('AE扩展初始化完成', 'success');
    }

    // 设置UI事件
    setupUI() {
        const testConnectionBtn = document.getElementById('test-connection-btn');
        const disconnectBtn = document.getElementById('disconnect-btn');
        const refreshBtn = document.getElementById('refresh-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const clearLogBtn = document.getElementById('clear-log-btn');
        const logSwitchBtn = document.getElementById('log-switch-btn');
        const logTitle = document.getElementById('log-title');
        const logPanelToggle = document.getElementById('log-panel-toggle');

        testConnectionBtn.addEventListener('click', () => {
            this.testConnection();
        });

        disconnectBtn.addEventListener('click', () => {
            this.disconnect();
        });

        refreshBtn.addEventListener('click', () => {
            this.refreshProjectInfo();
        });

        settingsBtn.addEventListener('click', () => {
            this.showSettingsPanel();
        });

        clearLogBtn.addEventListener('click', () => {
            this.clearLog();
        });

        // 日志切换按钮
        logSwitchBtn.addEventListener('click', () => {
            this.switchLogView();
        });

        // 点击日志标题也可以切换
        logTitle.addEventListener('click', () => {
            this.switchLogView();
        });

        // 日志面板切换按钮
        logPanelToggle.addEventListener('click', () => {
            this.toggleLogPanel();
        });

        // 设置面板事件
        this.setupSettingsPanel();

        // 快速设置事件
        this.setupQuickSettings();
    }

    // 测试连接到Eagle
    async testConnection() {
        if (this.connectionState === ConnectionState.CONNECTING) {
            this.log('连接正在进行中...', 'warning');
            return;
        }

        this.setConnectionState(ConnectionState.CONNECTING);
        this.log('正在测试连接到Eagle...', 'info');

        const startTime = Date.now();

        try {
            const response = await fetch(`${this.eagleUrl}/ping`, {
                method: 'GET',
                timeout: 5000
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.pong !== true) {
                throw new Error('无效的响应格式');
            }

            // 记录连接质量
            const pingTime = this.connectionMonitor.recordPing(startTime);

            // 连接成功
            this.setConnectionState(ConnectionState.CONNECTED);
            this.log(`连接成功！延迟: ${pingTime}ms`, 'success');

            // 播放连接成功音效
            this.playConnectionSound('linked');

            // 启动轮询
            this.pollingManager.start();

            // 发送AE状态
            this.sendAEStatus();

        } catch (error) {
            this.connectionMonitor.recordFailure();
            this.setConnectionState(ConnectionState.ERROR);
            this.log(`连接失败: ${error.message}`, 'error');

            // 如果连接失败，尝试检测Eagle扩展在哪个端口运行
            this.detectEaglePort();

            // 3秒后重置为断开状态
            setTimeout(() => {
                if (this.connectionState === ConnectionState.ERROR) {
                    this.setConnectionState(ConnectionState.DISCONNECTED);
                }
            }, 3000);
        }
    }

    // 断开连接
    disconnect() {
        if (this.connectionState === ConnectionState.DISCONNECTED) {
            this.log('已经处于断开状态', 'info');
            return;
        }

        this.log('正在断开连接...', 'info');

        // 停止轮询
        this.pollingManager.stop();

        // 重置连接监控
        this.connectionMonitor.reset();

        // 清理消息队列
        this.processedMessages.clear();

        // 设置状态
        this.setConnectionState(ConnectionState.DISCONNECTED);

        this.log('已断开连接', 'success');

        // 播放断开连接音效
        this.playConnectionSound('stop');
    }

    // 设置连接状态
    setConnectionState(newState) {
        const oldState = this.connectionState;
        this.connectionState = newState;

        if (oldState !== newState) {
            this.log(`状态变更: ${oldState} -> ${newState}`, 'info');
            this.updateConnectionUI();
        }
    }

    // 更新连接UI
    updateConnectionUI() {
        const statusIndicator = document.getElementById('status-indicator');
        const statusMain = document.getElementById('status-main');
        const pingTime = document.getElementById('ping-time');

        const testConnectionBtn = document.getElementById('test-connection-btn');
        const disconnectBtn = document.getElementById('disconnect-btn');
        const refreshBtn = document.getElementById('refresh-btn');

        // 清除所有状态类
        statusIndicator.className = 'status-indicator';

        switch (this.connectionState) {
            case ConnectionState.DISCONNECTED:
                statusIndicator.classList.add('disconnected');
                statusMain.textContent = '未连接';
                pingTime.textContent = '--ms';

                testConnectionBtn.disabled = false;
                testConnectionBtn.className = 'btn btn-primary';
                testConnectionBtn.querySelector('.btn-text').textContent = '测试连接';

                disconnectBtn.disabled = true;
                refreshBtn.disabled = true;
                break;

            case ConnectionState.CONNECTING:
                statusIndicator.classList.add('connecting');
                statusMain.textContent = '连接中';
                pingTime.textContent = '...ms';

                testConnectionBtn.disabled = true;
                testConnectionBtn.className = 'btn btn-primary';
                testConnectionBtn.querySelector('.btn-text').textContent = '连接中...';

                disconnectBtn.disabled = false;
                disconnectBtn.querySelector('.btn-text').textContent = '取消连接';
                refreshBtn.disabled = true;
                break;

            case ConnectionState.CONNECTED:
                statusIndicator.classList.add('connected');
                statusMain.textContent = '已连接';
                pingTime.textContent = `${this.connectionMonitor.getAveragePing()}ms`;

                testConnectionBtn.disabled = true;
                testConnectionBtn.className = 'btn btn-success';
                testConnectionBtn.querySelector('.btn-text').textContent = '已连接';

                disconnectBtn.disabled = false;
                disconnectBtn.querySelector('.btn-text').textContent = '断开连接';
                refreshBtn.disabled = false;
                break;

            case ConnectionState.ERROR:
                statusIndicator.classList.add('error');
                statusMain.textContent = '连接错误';
                pingTime.textContent = '--ms';

                testConnectionBtn.disabled = false;
                testConnectionBtn.className = 'btn btn-primary';
                testConnectionBtn.querySelector('.btn-text').textContent = '重试连接';

                disconnectBtn.disabled = true;
                refreshBtn.disabled = true;
                break;
        }
    }

    // 轮询获取消息
    async pollMessages() {
        if (this.connectionState !== ConnectionState.CONNECTED) {
            return;
        }

        try {
            const response = await fetch(`${this.eagleUrl}/messages`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // 处理消息
            if (data.messages && data.messages.length > 0) {
                let newMessages = 0;

                data.messages.forEach(message => {
                    // 使用时间戳和类型创建唯一ID
                    const messageId = `${message.type}_${message.timestamp}`;

                    if (!this.processedMessages.has(messageId)) {
                        this.processedMessages.add(messageId);
                        this.handleEagleMessage(message);
                        newMessages++;
                    }
                });

                if (newMessages > 0) {
                    this.log(`处理了 ${newMessages} 条新消息`, 'info');
                }

                // 清理旧的消息ID（保留最近50个）
                if (this.processedMessages.size > 100) {
                    const messageIds = Array.from(this.processedMessages);
                    const toKeep = messageIds.slice(-50);
                    this.processedMessages = new Set(toKeep);
                }
            }

            // 处理Eagle日志
            if (data.eagleLogs && data.eagleLogs.length > 0) {
                this.updateEagleLogs(data.eagleLogs);
            }

            this.lastPollTime = Date.now();

            // 更新连接质量显示
            this.updateConnectionQuality();

        } catch (error) {
            this.log(`轮询消息失败: ${error.message}`, 'warning');
            this.connectionMonitor.recordFailure();

            // 连接出错，设置错误状态
            this.setConnectionState(ConnectionState.ERROR);
            this.pollingManager.stop();

            // 3秒后重置为断开状态
            setTimeout(() => {
                if (this.connectionState === ConnectionState.ERROR) {
                    this.setConnectionState(ConnectionState.DISCONNECTED);
                }
            }, 3000);
        }
    }

    // 更新连接质量显示
    updateConnectionQuality() {
        const pingTimeElement = document.getElementById('ping-time');
        if (pingTimeElement && this.connectionState === ConnectionState.CONNECTED) {
            const avgPing = this.connectionMonitor.getAveragePing();
            pingTimeElement.textContent = avgPing > 0 ? `${avgPing}ms` : '--ms';
        }
    }

    // 清理日志
    clearLog() {
        if (this.currentLogView === 'ae') {
            this.aeLogs = [];
            this.log('AE日志已清理', 'info');
        } else {
            this.eagleLogs = [];
            this.log('Eagle日志已清理', 'info');
        }

        this.updateLogDisplay();
    }

    // 处理来自Eagle的消息
    handleEagleMessage(message) {
        this.log(`收到消息: ${message.type}`, 'info');

        switch (message.type) {
            case 'export':
                // Eagle发送的导出消息，包含设置信息
                if (message.settings) {
                    // 临时应用Eagle发送的设置（不保存到本地）
                    this.log(`应用Eagle设置: ${message.settings.mode} 模式`, 'info');
                }
                this.handleImportFiles(message);
                break;
            case 'import_files':
                // 兼容旧版本
                this.handleImportFiles(message.data);
                break;
            default:
                this.log(`未知消息类型: ${message.type}`, 'warning');
        }
    }

    // 处理文件导入请求
    async handleImportFiles(message) {
        // 兼容不同的消息格式
        const files = message.files || (message.data && message.data.files) || [];
        const projectInfo = message.projectInfo || null;
        const messageSettings = message.settings || null;

        this.log(`收到导入请求: ${files.length} 个文件`, 'info');

        if (files.length === 0) {
            this.log('没有文件需要导入', 'warning');
            return;
        }

        try {
            // 获取当前项目信息
            const currentProjectInfo = await this.getProjectInfo();

            // 确定使用的设置：优先使用消息中的设置，否则使用本地设置
            let effectiveSettings;
            if (messageSettings) {
                effectiveSettings = messageSettings;
                this.log(`使用Eagle传递的设置: ${effectiveSettings.mode} 模式`, 'info');
            } else {
                effectiveSettings = this.settingsManager.getSettings();
                this.log(`使用本地设置: ${effectiveSettings.mode} 模式`, 'info');
            }

            // 临时更新文件处理器的设置管理器
            const originalSettings = this.settingsManager.getSettings();
            if (messageSettings) {
                this.settingsManager.settings = messageSettings;
            }

            // 记录文件路径信息用于调试
            files.forEach((file, index) => {
                this.log(`文件${index + 1}: ${file.name} -> ${file.path}`, 'info');
            });

            // 使用文件处理器处理导入
            const result = await this.fileHandler.handleImportRequest(files, currentProjectInfo);

            // 恢复原始设置
            if (messageSettings) {
                this.settingsManager.settings = originalSettings;
            }

            // 发送导入结果回Eagle
            this.sendToEagle({
                type: 'import_result',
                data: result
            });

            if (result.success) {
                this.log(`成功导入 ${result.importedCount} 个文件`, 'success');
                this.updateImportStatus(`已导入 ${result.importedCount} 个文件`);

                // 显示调试信息
                if (result.debug && result.debug.length > 0) {
                    result.debug.forEach(debugMsg => {
                        this.log(debugMsg, 'info');
                    });
                }
            } else {
                this.log(`导入失败: ${result.error}`, 'error');
                this.updateImportStatus(`导入失败: ${result.error}`);

                // 显示调试信息
                if (result.debug && result.debug.length > 0) {
                    result.debug.forEach(debugMsg => {
                        this.log(debugMsg, 'warning');
                    });
                }
            }

        } catch (error) {
            this.log(`导入过程出错: ${error.message}`, 'error');
            this.updateImportStatus(`导入出错: ${error.message}`);

            this.sendToEagle({
                type: 'import_result',
                data: {
                    success: false,
                    error: error.message,
                    importedCount: 0
                }
            });
        }
    }

    // 执行ExtendScript
    executeExtendScript(functionName, params) {
        return new Promise((resolve, reject) => {
            const script = `${functionName}(${JSON.stringify(params)})`;
            
            this.csInterface.evalScript(script, (result) => {
                try {
                    const parsedResult = JSON.parse(result);
                    resolve(parsedResult);
                } catch (error) {
                    reject(new Error(`ExtendScript执行错误: ${result}`));
                }
            });
        });
    }

    // 发送消息到Eagle
    async sendToEagle(message) {
        if (this.connectionState !== ConnectionState.CONNECTED) {
            this.log('无法发送消息：未连接到Eagle', 'warning');
            return;
        }

        try {
            const response = await fetch(`${this.eagleUrl}/ae-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || '发送失败');
            }
        } catch (error) {
            this.log(`发送消息失败: ${error.message}`, 'error');
        }
    }

    // 发送AE状态到Eagle
    async sendAEStatus() {
        try {
            const projectInfo = await this.getProjectInfo();
            
            this.sendToEagle({
                type: 'ae_status',
                data: {
                    projectPath: projectInfo.projectPath,
                    projectName: projectInfo.projectName,
                    activeComp: projectInfo.activeComp,
                    isReady: projectInfo.isReady,
                    version: this.csInterface.hostEnvironment.appVersion
                }
            });
            
            // 更新UI
            this.updateProjectUI(projectInfo);
            
        } catch (error) {
            this.log(`获取AE状态失败: ${error.message}`, 'error');
        }
    }

    // 获取项目信息
    async getProjectInfo() {
        return new Promise((resolve, reject) => {
            this.csInterface.evalScript('getProjectInfo()', (result) => {
                try {
                    const info = JSON.parse(result);

                    // 解码URL编码的中文字符
                    if (info.projectName) {
                        info.projectName = this.decodeProjectName(info.projectName);
                    }
                    if (info.projectPath) {
                        info.projectPath = this.decodeProjectPath(info.projectPath);
                    }
                    if (info.activeComp && info.activeComp.name) {
                        info.activeComp.name = this.decodeProjectName(info.activeComp.name);
                    }

                    resolve(info);
                } catch (error) {
                    reject(new Error(`获取项目信息失败: ${result}`));
                }
            });
        });
    }

    // 解码项目名称中的URL编码
    decodeProjectName(name) {
        try {
            // 尝试解码URL编码的字符
            return decodeURIComponent(name);
        } catch (error) {
            // 如果解码失败，返回原始名称
            return name;
        }
    }

    // 解码项目路径中的URL编码
    decodeProjectPath(path) {
        try {
            // 对于Windows路径，只解码文件名部分
            if (path.includes('\\')) {
                const parts = path.split('\\');
                const decodedParts = parts.map(part => {
                    try {
                        return decodeURIComponent(part);
                    } catch (e) {
                        return part;
                    }
                });
                return decodedParts.join('\\');
            } else {
                // 对于其他路径，直接解码
                return decodeURIComponent(path);
            }
        } catch (error) {
            // 如果解码失败，返回原始路径
            return path;
        }
    }

    // 开始项目监控
    startProjectMonitoring() {
        // 每3秒检查一次项目状态变化
        setInterval(() => {
            if (this.eagleConnected) {
                this.sendAEStatus();
            }
        }, 3000);
    }

    // 刷新项目信息
    refreshProjectInfo() {
        this.log('刷新项目信息...', 'info');
        this.sendAEStatus();
    }

    // 更新项目信息UI
    updateProjectUI(projectInfo) {
        document.getElementById('project-name').textContent = projectInfo.projectName || '未打开项目';
        document.getElementById('comp-name').textContent = projectInfo.activeComp?.name || '无';
        document.getElementById('ae-status').textContent = projectInfo.isReady ? '准备就绪' : '未就绪';
    }

    // 更新导入状态显示
    updateImportStatus(message) {
        const statusElement = document.getElementById('import-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = 'status-message';

            // 3秒后清除状态
            setTimeout(() => {
                if (statusElement.textContent === message) {
                    statusElement.textContent = '等待导入请求...';
                    statusElement.className = 'status-message idle';
                }
            }, 3000);
        }
    }

    // 切换日志视图
    switchLogView() {
        this.currentLogView = this.currentLogView === 'ae' ? 'eagle' : 'ae';
        this.updateLogDisplay();
        this.updateLogControls();
    }

    // 更新Eagle日志
    updateEagleLogs(newLogs) {
        // 合并新日志，避免重复
        const existingTimestamps = new Set(this.eagleLogs.map(log => log.timestamp));
        const uniqueNewLogs = newLogs.filter(log => !existingTimestamps.has(log.timestamp));

        this.eagleLogs.push(...uniqueNewLogs);

        // 限制日志数量
        if (this.eagleLogs.length > 200) {
            this.eagleLogs = this.eagleLogs.slice(-200);
        }

        // 按时间戳排序
        this.eagleLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // 如果当前显示Eagle日志，更新显示
        if (this.currentLogView === 'eagle') {
            this.updateLogDisplay();
        }
    }

    // 更新日志显示
    updateLogDisplay() {
        const logOutput = document.getElementById('log-output');
        logOutput.innerHTML = '';

        const logsToShow = this.currentLogView === 'ae' ? this.aeLogs : this.eagleLogs;

        logsToShow.forEach(logData => {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${logData.type} ${logData.source || 'ae'}`;
            logEntry.innerHTML = `<span class="log-time">${logData.time}</span>${logData.message}`;
            logOutput.appendChild(logEntry);
        });

        logOutput.scrollTop = logOutput.scrollHeight;
    }

    // 切换日志面板显示/隐藏
    toggleLogPanel() {
        const logSection = document.querySelector('.section.log');
        const toggleBtn = document.getElementById('log-panel-toggle');

        if (logSection.classList.contains('visible')) {
            logSection.classList.remove('visible');
            toggleBtn.textContent = '显示日志';
        } else {
            logSection.classList.add('visible');
            toggleBtn.textContent = '隐藏日志';
        }
    }

    // 更新日志控制按钮
    updateLogControls() {
        const logTitle = document.getElementById('log-title');
        const logSwitchBtn = document.getElementById('log-switch-btn');

        if (this.currentLogView === 'ae') {
            logTitle.textContent = '日志 (AE扩展)';
            logSwitchBtn.textContent = '切换到Eagle日志';
            logSwitchBtn.className = 'btn-small btn-secondary';
        } else {
            logTitle.textContent = '日志 (Eagle插件)';
            logSwitchBtn.textContent = '切换到AE日志';
            logSwitchBtn.className = 'btn-small btn-primary';
        }
    }

    // 设置面板管理
    setupSettingsPanel() {
        const settingsPanel = document.getElementById('settings-panel');
        const closeBtn = document.getElementById('settings-close-btn');
        const saveBtn = document.getElementById('save-settings-btn');
        const resetBtn = document.getElementById('reset-settings-btn');

        // 关闭按钮
        closeBtn.addEventListener('click', () => {
            this.hideSettingsPanel();
        });

        // 保存按钮
        saveBtn.addEventListener('click', () => {
            this.saveSettings();
        });

        // 重置按钮
        resetBtn.addEventListener('click', () => {
            this.resetSettings();
        });

        // 导入模式切换
        const importModeRadios = document.querySelectorAll('input[name="import-mode"]');
        importModeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateSettingsUI();
                // 实时同步到快速设置
                if (this.quickSettingsInitialized) {
                    this.settingsManager.updateField('mode', radio.value, false);
                }
            });
        });

        // 项目文件夹选择
        const projectFolderSelect = document.getElementById('project-folder-select');
        projectFolderSelect.addEventListener('change', () => {
            this.handleProjectFolderChange();
            // 实时同步到快速设置
            if (this.quickSettingsInitialized) {
                this.settingsManager.updateField('projectAdjacentFolder', projectFolderSelect.value, false);
            }
        });

        // 合成导入选项
        const addToCompositionCheckbox = document.getElementById('add-to-composition');
        addToCompositionCheckbox.addEventListener('change', () => {
            this.updateSettingsUI();
            // 实时同步到快速设置
            if (this.quickSettingsInitialized) {
                this.settingsManager.updateField('addToComposition', addToCompositionCheckbox.checked, false);
            }
        });

        // 时间轴放置选项
        const timelinePlacementRadios = document.querySelectorAll('input[name="timeline-placement"]');
        timelinePlacementRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateSettingsUI();
                // 实时同步时间轴选项
                if (this.quickSettingsInitialized && radio.checked) {
                    this.settingsManager.updateField('timelineOptions.placement', radio.value, false);
                }
            });
        });

        // 文件管理选项
        const keepOriginalNameCheckbox = document.getElementById('keep-original-name');
        keepOriginalNameCheckbox.addEventListener('change', () => {
            // 实时同步到快速设置
            if (this.quickSettingsInitialized) {
                this.settingsManager.updateField('fileManagement.keepOriginalName', keepOriginalNameCheckbox.checked, false);
            }
        });

        // 其他文件管理选项也添加实时同步
        const addTimestampCheckbox = document.getElementById('add-timestamp');
        addTimestampCheckbox.addEventListener('change', () => {
            if (this.quickSettingsInitialized) {
                this.settingsManager.updateField('fileManagement.addTimestamp', addTimestampCheckbox.checked, false);
            }
        });

        const createTagFoldersCheckbox = document.getElementById('create-tag-folders');
        createTagFoldersCheckbox.addEventListener('change', () => {
            if (this.quickSettingsInitialized) {
                this.settingsManager.updateField('fileManagement.createTagFolders', createTagFoldersCheckbox.checked, false);
            }
        });

        const deleteFromEagleCheckbox = document.getElementById('delete-from-eagle');
        deleteFromEagleCheckbox.addEventListener('change', () => {
            if (this.quickSettingsInitialized) {
                this.settingsManager.updateField('fileManagement.deleteFromEagle', deleteFromEagleCheckbox.checked, false);
            }
        });

        // 通信端口设置
        const communicationPortInput = document.getElementById('communication-port');
        communicationPortInput.addEventListener('change', (event) => {
            const port = parseInt(communicationPortInput.value);
            if (port >= 1024 && port <= 65535) {
                const oldPort = this.currentPort;
                this.settingsManager.updatePreference('communicationPort', port);

                // 异步处理端口同步，但不阻塞事件处理
                this.handlePortChange(oldPort, port);
            } else {
                this.log('端口号必须在1024-65535范围内', 'error');
                communicationPortInput.value = this.currentPort;
            }
        });

        // 文件夹浏览按钮
        const browseFolderBtn = document.getElementById('browse-folder-btn');
        browseFolderBtn.addEventListener('click', () => {
            this.browseCustomFolder();
        });

        // 最近文件夹选择
        const recentFoldersSelect = document.getElementById('recent-folders-select');
        recentFoldersSelect.addEventListener('change', () => {
            const selectedPath = recentFoldersSelect.value;
            if (selectedPath) {
                document.getElementById('custom-folder-path').value = selectedPath;
                // 实时同步到快速设置
                if (this.quickSettingsInitialized) {
                    this.settingsManager.updateField('customFolderPath', selectedPath, false);
                }
                this.log(`已选择最近使用的文件夹: ${selectedPath}`, 'success');
            }
        });

        // 自定义文件夹路径输入框变化
        const customFolderPath = document.getElementById('custom-folder-path');
        customFolderPath.addEventListener('change', () => {
            const path = customFolderPath.value.trim();
            if (path) {
                this.settingsManager.addRecentFolder(path);
                this.updateRecentFoldersDropdown();
                // 实时同步到快速设置
                if (this.quickSettingsInitialized) {
                    this.settingsManager.updateField('customFolderPath', path, false);
                }
            }
        });

        // 音效设置
        const enableSoundCheckbox = document.getElementById('enable-sound-effects');
        const soundVolumeSlider = document.getElementById('sound-volume');
        const volumeDisplay = document.getElementById('volume-display');
        const testSoundBtn = document.getElementById('test-sound-btn');

        // 音效开关
        enableSoundCheckbox.addEventListener('change', () => {
            if (this.quickSettingsInitialized) {
                this.settingsManager.updateField('soundSettings.enabled', enableSoundCheckbox.checked, false);
            }
        });

        // 音量调节
        soundVolumeSlider.addEventListener('input', () => {
            const volume = parseInt(soundVolumeSlider.value);
            volumeDisplay.textContent = `${volume}%`;

            // 更新音效播放器音量
            this.soundPlayer.setVolume(volume / 100);

            if (this.quickSettingsInitialized) {
                this.settingsManager.updateField('soundSettings.volume', volume, false);
            }
        });

        // 测试音效按钮
        testSoundBtn.addEventListener('click', () => {
            this.soundPlayer.testSounds();
        });
    }

    // 显示设置面板
    showSettingsPanel() {
        const settingsPanel = document.getElementById('settings-panel');
        settingsPanel.style.display = 'flex';
        this.loadSettingsToUI();
        this.log('打开导入设置面板', 'info');
    }

    // 隐藏设置面板
    hideSettingsPanel() {
        const settingsPanel = document.getElementById('settings-panel');
        settingsPanel.style.display = 'none';
        this.log('关闭导入设置面板', 'info');
    }

    // 加载设置到UI
    loadSettingsToUI() {
        const settings = this.settingsManager.getSettings();

        // 导入模式
        const modeRadio = document.querySelector(`input[name="import-mode"][value="${settings.mode}"]`);
        if (modeRadio) modeRadio.checked = true;

        // 项目文件夹
        const projectFolderSelect = document.getElementById('project-folder-select');
        projectFolderSelect.value = settings.projectAdjacentFolder;

        // 自定义文件夹路径
        const customFolderPath = document.getElementById('custom-folder-path');
        customFolderPath.value = settings.customFolderPath;

        // 更新最近文件夹下拉列表
        this.updateRecentFoldersDropdown();

        // 合成导入
        const addToComposition = document.getElementById('add-to-composition');
        addToComposition.checked = settings.addToComposition;

        // 时间轴选项
        const timelinePlacementRadio = document.querySelector(`input[name="timeline-placement"][value="${settings.timelineOptions.placement}"]`);
        if (timelinePlacementRadio) timelinePlacementRadio.checked = true;

        // 序列间隔
        const sequenceInterval = document.getElementById('sequence-interval');
        sequenceInterval.value = settings.timelineOptions.sequenceInterval;

        // 文件管理选项
        document.getElementById('keep-original-name').checked = settings.fileManagement.keepOriginalName;
        document.getElementById('add-timestamp').checked = settings.fileManagement.addTimestamp;
        document.getElementById('create-tag-folders').checked = settings.fileManagement.createTagFolders;
        document.getElementById('delete-from-eagle').checked = settings.fileManagement.deleteFromEagle;

        // 通信端口
        const preferences = this.settingsManager.getPreferences();
        const communicationPort = document.getElementById('communication-port');
        communicationPort.value = preferences.communicationPort;
        this.updateEagleUrl(preferences.communicationPort);

        // 音效设置
        const enableSoundCheckbox = document.getElementById('enable-sound-effects');
        const soundVolumeSlider = document.getElementById('sound-volume');
        const volumeDisplay = document.getElementById('volume-display');

        enableSoundCheckbox.checked = settings.soundSettings.enabled;
        soundVolumeSlider.value = settings.soundSettings.volume;
        volumeDisplay.textContent = `${settings.soundSettings.volume}%`;

        // 设置音效播放器音量
        this.soundPlayer.setVolume(settings.soundSettings.volume / 100);

        // 更新UI状态
        this.updateSettingsUI();
    }

    // 记录日志
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const fullTimestamp = new Date().toISOString();

        // 添加到AE日志数组
        const logData = {
            timestamp: fullTimestamp,
            time: timestamp,
            message: message,
            type: type,
            source: 'ae'
        };

        this.aeLogs.push(logData);

        // 限制日志条数
        if (this.aeLogs.length > 200) {
            this.aeLogs = this.aeLogs.slice(-200);
        }

        // 更新最新日志显示
        this.updateLatestLogMessage(message, type);

        // 如果当前显示AE日志，更新显示
        if (this.currentLogView === 'ae') {
            const logOutput = document.getElementById('log-output');
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${type} ae`;
            logEntry.innerHTML = `<span class="log-time">${timestamp}</span>${message}`;

            logOutput.appendChild(logEntry);
            logOutput.scrollTop = logOutput.scrollHeight;

            // 限制DOM中的日志条数
            while (logOutput.children.length > 100) {
                logOutput.removeChild(logOutput.firstChild);
            }
        }

        console.log(`[AE Extension] ${message}`);
    }

    // 初始化最新日志显示
    initializeLatestLogDisplay() {
        const latestLogElement = document.getElementById('latest-log-message');
        if (latestLogElement) {
            latestLogElement.textContent = '等待导入请求...';
        }

        const statusElement = document.getElementById('import-status');
        if (statusElement) {
            statusElement.className = 'import-status idle';
        }
    }

    // 更新最新日志消息显示
    updateLatestLogMessage(message, type) {
        const latestLogElement = document.getElementById('latest-log-message');
        if (latestLogElement) {
            latestLogElement.textContent = message;

            // 更新状态样式
            const statusElement = document.getElementById('import-status');
            if (statusElement) {
                statusElement.className = `import-status ${type}`;
            }
        }
    }

    // 更新设置UI状态
    updateSettingsUI() {
        const settings = this.getSettingsFromUI();
        const uiState = this.settingsManager.UI_STATE_RULES;

        // 项目文件夹配置显示/隐藏
        const projectFolderConfig = document.getElementById('project-folder-config');
        projectFolderConfig.style.display = uiState.projectFolderVisible(settings) ? 'block' : 'none';

        // 自定义文件夹配置显示/隐藏
        const customFolderConfig = document.getElementById('custom-folder-config');
        const isCustomFolderVisible = uiState.customFolderVisible(settings);
        customFolderConfig.style.display = isCustomFolderVisible ? 'block' : 'none';

        // 如果自定义文件夹配置可见，更新最近文件夹下拉列表
        if (isCustomFolderVisible) {
            this.updateRecentFoldersDropdown();
        }

        // 时间轴选项启用/禁用
        const timelineOptions = document.getElementById('timeline-options');
        const timelineInputs = timelineOptions.querySelectorAll('input, select');
        const timelineEnabled = uiState.timelineOptionsEnabled(settings);

        timelineOptions.style.opacity = timelineEnabled ? '1' : '0.5';
        timelineInputs.forEach(input => {
            input.disabled = !timelineEnabled;
        });

        // 序列配置显示/隐藏
        const sequenceConfig = document.getElementById('sequence-config');
        sequenceConfig.style.display = uiState.sequenceIntervalVisible(settings) ? 'block' : 'none';
    }

    // 从UI获取设置
    getSettingsFromUI() {
        const importMode = document.querySelector('input[name="import-mode"]:checked')?.value || 'project_adjacent';
        const projectFolderSelect = document.getElementById('project-folder-select');
        const customFolderPath = document.getElementById('custom-folder-path');
        const addToComposition = document.getElementById('add-to-composition');
        const timelinePlacement = document.querySelector('input[name="timeline-placement"]:checked')?.value || 'current_time';
        const sequenceInterval = document.getElementById('sequence-interval');

        return {
            mode: importMode,
            projectAdjacentFolder: projectFolderSelect.value,
            customFolderPath: customFolderPath.value,
            addToComposition: addToComposition.checked,
            timelineOptions: {
                enabled: addToComposition.checked,
                placement: timelinePlacement,
                sequenceInterval: parseFloat(sequenceInterval.value)
            },
            fileManagement: {
                keepOriginalName: document.getElementById('keep-original-name').checked,
                addTimestamp: document.getElementById('add-timestamp').checked,
                createTagFolders: document.getElementById('create-tag-folders').checked,
                deleteFromEagle: document.getElementById('delete-from-eagle').checked
            }
        };
    }

    // 处理项目文件夹选择变化
    handleProjectFolderChange() {
        const select = document.getElementById('project-folder-select');
        const customInput = document.getElementById('custom-folder-name');

        if (select.value === 'custom') {
            customInput.style.display = 'block';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
        }
    }

    // 浏览自定义文件夹
    browseCustomFolder() {
        this.log('打开文件夹选择对话框...', 'info');

        // 显示自定义的文件夹选择模态框
        this.showFolderPickerModal();
    }

    // 尝试使用现代的文件夹选择器
    tryModernFolderPicker() {
        // 检查是否支持File System Access API
        if ('showDirectoryPicker' in window) {
            this.useFileSystemAccessAPI();
            return true;
        }

        // 检查是否支持webkitdirectory
        if (this.supportsWebkitDirectory()) {
            this.useWebkitDirectoryPicker();
            return true;
        }

        return false;
    }

    // 使用File System Access API (Chrome 86+)
    async useFileSystemAccessAPI() {
        try {
            this.log('使用File System Access API选择文件夹...', 'info');

            const directoryHandle = await window.showDirectoryPicker({
                mode: 'read'
            });

            if (directoryHandle) {
                // 获取文件夹路径（注意：这个API返回的是句柄，不是完整路径）
                const folderName = directoryHandle.name;

                // 尝试获取完整路径
                let fullPath = folderName;
                try {
                    // 在某些情况下可以获取到更多路径信息
                    if (directoryHandle.kind === 'directory') {
                        fullPath = await this.getDirectoryPath(directoryHandle);
                    }
                } catch (e) {
                    // 如果无法获取完整路径，使用文件夹名
                    fullPath = `[Selected] ${folderName}`;
                }

                this.handleSelectedFolder(fullPath);
                this.log(`已选择文件夹: ${fullPath}`, 'success');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                this.log('用户取消了文件夹选择', 'info');
            } else {
                this.log(`File System Access API失败: ${error.message}`, 'error');
                this.useWebkitDirectoryPicker();
            }
        }
    }

    // 使用webkitdirectory属性
    useWebkitDirectoryPicker() {
        this.log('使用HTML5 Directory Picker选择文件夹...', 'info');

        // 创建隐藏的文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;
        input.style.display = 'none';

        input.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files.length > 0) {
                // 从第一个文件的路径中提取文件夹路径
                const firstFile = files[0];
                const fullPath = firstFile.webkitRelativePath;
                const folderPath = this.extractFolderPath(fullPath);

                this.handleSelectedFolder(folderPath);
                this.log(`已选择文件夹: ${folderPath}`, 'success');
            } else {
                this.log('用户取消了文件夹选择', 'info');
            }

            // 清理临时元素
            document.body.removeChild(input);
        });

        // 添加到DOM并触发点击
        document.body.appendChild(input);
        input.click();
    }

    // 使用CEP ExtendScript方式（降级方案）
    useCEPFolderPicker() {
        this.log('使用CEP ExtendScript选择文件夹...', 'info');

        const currentPath = document.getElementById('custom-folder-path').value;

        // 调用ExtendScript来打开文件夹选择对话框
        this.csInterface.evalScript(`selectFolder("${currentPath}")`, (result) => {
            try {
                const parsedResult = JSON.parse(result);
                if (parsedResult.success && parsedResult.path) {
                    this.handleSelectedFolder(parsedResult.path);
                    this.log(`已选择文件夹: ${parsedResult.path}`, 'success');
                } else if (parsedResult.cancelled) {
                    this.log('用户取消了文件夹选择', 'info');
                } else {
                    this.log(`文件夹选择失败: ${parsedResult.error || '未知错误'}`, 'error');
                }
            } catch (error) {
                this.log(`解析文件夹选择结果失败: ${error.message}`, 'error');
                // 最终降级到输入框方式
                this.fallbackToInputPrompt(currentPath);
            }
        });
    }

    // 降级到输入提示方式
    fallbackToInputPrompt(currentPath) {
        this.log('使用输入框方式选择文件夹...', 'info');
        const newPath = prompt('请输入文件夹路径:', currentPath);

        if (newPath && newPath.trim()) {
            const trimmedPath = newPath.trim();
            document.getElementById('custom-folder-path').value = trimmedPath;
            this.settingsManager.addRecentFolder(trimmedPath);
            this.updateRecentFoldersDropdown();

            if (this.quickSettingsInitialized) {
                this.settingsManager.updateField('customFolderPath', trimmedPath, false);
            }

            this.log(`已设置文件夹路径: ${trimmedPath}`, 'success');
        }
    }

    // 检查是否支持webkitdirectory
    supportsWebkitDirectory() {
        const input = document.createElement('input');
        return 'webkitdirectory' in input;
    }

    // 从文件路径中提取文件夹路径
    extractFolderPath(filePath) {
        // webkitRelativePath 格式类似: "folder/subfolder/file.txt"
        const pathParts = filePath.split('/');
        if (pathParts.length > 1) {
            // 移除文件名，保留文件夹路径
            pathParts.pop();
            return pathParts.join('/');
        }
        return filePath;
    }

    // 尝试获取目录的完整路径（File System Access API）
    async getDirectoryPath(directoryHandle) {
        try {
            // 这是一个实验性功能，可能不是所有浏览器都支持
            if (directoryHandle.getDirectoryPath) {
                return await directoryHandle.getDirectoryPath();
            }

            // 降级方案：使用目录名
            return `[Selected Directory] ${directoryHandle.name}`;
        } catch (error) {
            return `[Selected Directory] ${directoryHandle.name}`;
        }
    }

    // 处理选择的文件夹（统一处理方法）
    handleSelectedFolder(folderPath) {
        if (!folderPath) {
            this.log('无效的文件夹路径', 'error');
            return;
        }

        // 更新输入框
        document.getElementById('custom-folder-path').value = folderPath;

        // 添加到最近使用的文件夹
        this.settingsManager.addRecentFolder(folderPath);

        // 更新最近文件夹下拉列表
        this.updateRecentFoldersDropdown();

        // 实时保存设置
        if (this.quickSettingsInitialized) {
            this.settingsManager.updateField('customFolderPath', folderPath, false);
        }
    }

    // 显示文件夹选择模态框
    showFolderPickerModal() {
        const modal = document.getElementById('folder-picker-modal');
        if (!modal) {
            this.log('文件夹选择模态框未找到', 'error');
            return;
        }

        // 重置模态框状态
        this.resetFolderPickerModal();

        // 显示模态框
        modal.style.display = 'flex';

        // 设置事件监听器
        this.setupFolderPickerEvents();

        // 加载最近使用的文件夹
        this.loadRecentFoldersInModal();

        this.log('文件夹选择模态框已打开', 'info');
    }

    // 重置文件夹选择模态框状态
    resetFolderPickerModal() {
        // 清空手动输入框
        const manualInput = document.getElementById('manual-folder-input');
        if (manualInput) {
            manualInput.value = '';
        }

        // 禁用确认按钮
        const confirmBtn = document.getElementById('folder-picker-confirm');
        if (confirmBtn) {
            confirmBtn.disabled = true;
        }

        // 清除选中状态
        const recentItems = document.querySelectorAll('.recent-folder-item');
        recentItems.forEach(item => item.classList.remove('selected'));

        // 重置拖拽区域状态
        const dropZone = document.getElementById('folder-drop-zone');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
    }

    // 设置文件夹选择模态框事件监听器
    setupFolderPickerEvents() {
        // 关闭按钮
        const closeBtn = document.getElementById('folder-picker-close');
        const cancelBtn = document.getElementById('folder-picker-cancel');
        const confirmBtn = document.getElementById('folder-picker-confirm');

        // 移除旧的事件监听器（避免重复绑定）
        const newCloseBtn = closeBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newConfirmBtn = confirmBtn.cloneNode(true);

        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        // 绑定新的事件监听器
        newCloseBtn.addEventListener('click', () => this.hideFolderPickerModal());
        newCancelBtn.addEventListener('click', () => this.hideFolderPickerModal());
        newConfirmBtn.addEventListener('click', () => this.confirmFolderSelection());

        // 拖拽区域
        this.setupDragDropEvents();

        // 手动输入
        this.setupManualInputEvents();

        // 点击模态框外部关闭
        const modal = document.getElementById('folder-picker-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideFolderPickerModal();
            }
        });
    }

    // 隐藏文件夹选择模态框
    hideFolderPickerModal() {
        const modal = document.getElementById('folder-picker-modal');
        if (modal) {
            modal.style.display = 'none';
            this.log('文件夹选择模态框已关闭', 'info');
        }
    }

    // 使用现代文件夹选择器
    useModernFolderPicker() {
        this.log('启动现代文件夹选择器...', 'info');

        // 优先尝试现代的文件夹选择方式
        if (this.tryModernFolderPicker()) {
            // 成功使用现代选择器后关闭模态框
            this.hideFolderPickerModal();
            return;
        }

        // 降级到CEP ExtendScript方式
        this.useCEPFolderPicker();
    }

    // 确认文件夹选择
    confirmFolderSelection() {
        const manualInput = document.getElementById('manual-folder-input');

        let selectedPath = '';

        if (manualInput && manualInput.value.trim()) {
            selectedPath = manualInput.value.trim();
        }

        if (selectedPath) {
            this.handleSelectedFolder(selectedPath);
            this.hideFolderPickerModal();
            this.log(`已确认选择文件夹: ${selectedPath}`, 'success');
        } else {
            this.log('请先选择一个文件夹', 'warning');
        }
    }

    // 设置拖拽事件
    setupDragDropEvents() {
        const dropZone = document.getElementById('folder-drop-zone');
        if (!dropZone) return;

        // 防止默认行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // 拖拽进入
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        // 拖拽离开
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        // 拖拽释放
        dropZone.addEventListener('drop', (e) => {
            dropZone.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                // 从第一个文件获取文件夹路径
                const firstFile = files[0];
                let folderPath = '';

                if (firstFile.webkitRelativePath) {
                    folderPath = this.extractFolderPath(firstFile.webkitRelativePath);
                } else {
                    // 尝试从文件路径获取目录
                    folderPath = firstFile.path ? firstFile.path.replace(/[^\\\/]*$/, '') : '';
                }

                if (folderPath) {
                    document.getElementById('manual-folder-input').value = folderPath;
                    this.enableConfirmButton();
                    this.log(`通过拖拽获取文件夹路径: ${folderPath}`, 'success');
                } else {
                    this.log('无法从拖拽的文件中获取文件夹路径', 'warning');
                }
            }
        });

        // 点击拖拽区域触发现代文件夹选择器
        dropZone.addEventListener('click', () => {
            this.useModernFolderPicker();
        });
    }

    // 设置手动输入事件
    setupManualInputEvents() {
        const manualInput = document.getElementById('manual-folder-input');
        const validateBtn = document.getElementById('validate-path-btn');

        if (!manualInput || !validateBtn) return;

        // 输入变化时启用/禁用确认按钮
        manualInput.addEventListener('input', () => {
            const hasValue = manualInput.value.trim().length > 0;
            this.toggleConfirmButton(hasValue);

            // 清除最近文件夹的选中状态
            const recentItems = document.querySelectorAll('.recent-folder-item');
            recentItems.forEach(item => item.classList.remove('selected'));
        });

        // 验证路径按钮
        validateBtn.addEventListener('click', () => {
            const path = manualInput.value.trim();
            if (path) {
                this.validateFolderPath(path);
            }
        });

        // 回车键确认
        manualInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.confirmFolderSelection();
            }
        });
    }

    // 在模态框中加载最近使用的文件夹
    loadRecentFoldersInModal() {
        const recentFoldersSection = document.getElementById('folder-picker-recent');
        const recentFoldersList = document.getElementById('recent-folders-list');

        if (!recentFoldersSection || !recentFoldersList) return;

        const recentFolders = this.settingsManager.getRecentFolders();

        // 清空现有列表
        recentFoldersList.innerHTML = '';

        if (recentFolders.length > 0) {
            recentFolders.forEach(folder => {
                const item = document.createElement('div');
                item.className = 'recent-folder-item';
                item.textContent = this.truncatePath(folder, 60);
                item.title = folder;
                item.dataset.path = folder;

                item.addEventListener('click', () => {
                    // 清除其他选中状态
                    document.querySelectorAll('.recent-folder-item').forEach(i =>
                        i.classList.remove('selected'));

                    // 选中当前项
                    item.classList.add('selected');

                    // 清空手动输入框
                    const manualInput = document.getElementById('manual-folder-input');
                    if (manualInput) manualInput.value = '';

                    // 启用确认按钮
                    this.enableConfirmButton();
                });

                recentFoldersList.appendChild(item);
            });

            recentFoldersSection.style.display = 'block';
        } else {
            recentFoldersSection.style.display = 'none';
        }
    }

    // 启用确认按钮
    enableConfirmButton() {
        const confirmBtn = document.getElementById('folder-picker-confirm');
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
    }

    // 切换确认按钮状态
    toggleConfirmButton(enabled) {
        const confirmBtn = document.getElementById('folder-picker-confirm');
        if (confirmBtn) {
            confirmBtn.disabled = !enabled;
        }
    }

    // 验证文件夹路径
    validateFolderPath(path) {
        this.log(`验证文件夹路径: ${path}`, 'info');

        // 调用ExtendScript验证路径
        this.csInterface.evalScript(`validateFolderPath("${path}")`, (result) => {
            try {
                const parsedResult = JSON.parse(result);
                if (parsedResult.success && parsedResult.exists) {
                    this.log(`路径验证成功: ${path}`, 'success');
                    this.enableConfirmButton();
                } else {
                    this.log(`路径不存在或无效: ${path}`, 'warning');
                    // 仍然允许用户使用这个路径，但给出警告
                    this.enableConfirmButton();
                }
            } catch (error) {
                this.log(`路径验证失败: ${error.message}`, 'error');
                // 降级：假设路径有效
                this.enableConfirmButton();
            }
        });
    }

    // 更新最近文件夹下拉列表
    updateRecentFoldersDropdown() {
        const recentFoldersSelect = document.getElementById('recent-folders-select');
        const recentFoldersSection = document.getElementById('recent-folders-section');

        if (!recentFoldersSelect || !recentFoldersSection) {
            return;
        }

        const recentFolders = this.settingsManager.getRecentFolders();

        // 清空现有选项
        recentFoldersSelect.innerHTML = '<option value="">选择最近使用的文件夹...</option>';

        if (recentFolders.length > 0) {
            // 添加最近使用的文件夹选项
            recentFolders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder;
                option.textContent = this.truncatePath(folder, 50); // 截断长路径
                option.title = folder; // 完整路径作为提示
                recentFoldersSelect.appendChild(option);
            });

            // 显示最近文件夹区域
            recentFoldersSection.style.display = 'block';
        } else {
            // 隐藏最近文件夹区域
            recentFoldersSection.style.display = 'none';
        }
    }

    // 截断路径显示
    truncatePath(path, maxLength) {
        if (path.length <= maxLength) {
            return path;
        }

        const parts = path.split(/[\\\/]/);
        if (parts.length <= 2) {
            return path.substring(0, maxLength - 3) + '...';
        }

        const fileName = parts[parts.length - 1];
        const firstPart = parts[0];
        const remaining = maxLength - firstPart.length - fileName.length - 6; // 6 for "...\" or ".../"

        if (remaining > 0) {
            return `${firstPart}\\...\\${fileName}`;
        } else {
            return `...\\${fileName}`;
        }
    }

    // 保存设置
    saveSettings(hidePanel = true) {
        try {
            const settings = this.getSettingsFromUI();

            // 如果选择指定文件夹模式但路径为空，给出友好提示
            if (settings.mode === 'custom_folder' && (!settings.customFolderPath || settings.customFolderPath.trim() === '')) {
                this.log('使用指定文件夹模式时，请先设置文件夹路径', 'warning');
                return;
            }

            const result = this.settingsManager.saveSettings(settings);

            // 保存端口设置到用户偏好
            const communicationPort = document.getElementById('communication-port');
            const portValue = parseInt(communicationPort.value);
            const portResult = this.settingsManager.updatePreference('communicationPort', portValue);

            if (result.success && portResult.success) {
                this.log('导入设置已保存', 'success');

                // 更新端口URL（如果端口发生变化）
                if (portValue !== this.currentPort) {
                    const oldPort = this.currentPort;

                    // 异步处理端口更改，不阻塞保存操作
                    this.handlePortChange(oldPort, portValue);
                }

                if (hidePanel) {
                    this.hideSettingsPanel();
                }

                // 同步设置到Eagle插件
                this.syncSettingsToEagle(settings);
            } else {
                this.log(`保存设置失败: ${result.error || portResult.error}`, 'error');
            }
        } catch (error) {
            this.log(`保存设置出错: ${error.message}`, 'error');
        }
    }

    // 重置设置
    resetSettings() {
        if (confirm('确定要重置所有设置到默认值吗？')) {
            const result = this.settingsManager.resetSettings();

            if (result.success) {
                this.loadSettingsToUI();
                this.log('设置已重置为默认值', 'success');
            } else {
                this.log(`重置设置失败: ${result.error}`, 'error');
            }
        }
    }

    // 同步设置到Eagle插件
    async syncSettingsToEagle(settings) {
        try {
            const response = await fetch(`${this.eagleUrl}/settings-sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'settings_update',
                    settings: settings,
                    preferences: {
                        communicationPort: this.settingsManager.getPreferences().communicationPort
                    },
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                this.log('设置已同步到Eagle插件', 'success');
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            this.log(`同步设置到Eagle失败: ${error.message}`, 'warning');
        }
    }

    // 智能端口同步 - 多端口尝试
    async syncPortToEagle(oldPort, newPort) {
        const portSyncData = {
            type: 'port_update',
            preferences: {
                communicationPort: newPort
            },
            timestamp: Date.now()
        };

        // 尝试多个可能的端口
        const portsToTry = [oldPort, 8080, 8081, 8082, 8083];
        const uniquePorts = [...new Set(portsToTry)]; // 去重

        this.log(`🔄 正在尝试向Eagle扩展发送端口配置更新...`, 'info');

        for (const port of uniquePorts) {
            try {
                this.log(`尝试端口 ${port}...`, 'info');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch(`http://localhost:${port}/settings-sync`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(portSyncData),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    this.log(`✅ 端口更新请求已发送到Eagle插件 (端口 ${port})`, 'success');
                    this.log('Eagle插件将自动重启到新端口，请稍等3秒后测试连接', 'info');
                    return true;
                }
            } catch (error) {
                // 继续尝试下一个端口
            }
        }

        // 所有端口都失败，提示用户重启Eagle
        this.log('⚠️ 无法自动更新Eagle插件端口配置', 'warning');
        this.log('💡 请重启Eagle应用程序以应用新的端口设置', 'info');
        return false;
    }

    // 更新Eagle URL
    updateEagleUrl(port) {
        this.currentPort = port;
        this.eagleUrl = `http://localhost:${port}`;
        this.log(`通信端口已更新为: ${port}`, 'info');
    }

    // 处理端口更改（异步方法）
    async handlePortChange(oldPort, newPort) {
        // 防止重复调用
        if (this.isHandlingPortChange) {
            this.log('端口更改正在处理中，跳过重复调用', 'info');
            return;
        }

        this.isHandlingPortChange = true;

        try {
            // 更新本地端口配置
            this.updateEagleUrl(newPort);

            // 如果当前已连接，断开连接
            if (this.connectionState === ConnectionState.CONNECTED) {
                this.disconnect();
            }

            // 先尝试智能端口同步
            const syncSuccess = await this.syncPortToEagle(oldPort, newPort);

            if (syncSuccess) {
                this.log(`端口已从 ${oldPort} 更改为 ${newPort}，Eagle插件正在重启...`, 'info');
            } else {
                this.log(`端口已从 ${oldPort} 更改为 ${newPort}，请重启Eagle应用程序`, 'warning');
            }

        } catch (error) {
            this.log(`处理端口更改时出错: ${error.message}`, 'error');
        } finally {
            // 延迟重置标志，避免快速连续调用
            setTimeout(() => {
                this.isHandlingPortChange = false;
            }, 2000);
        }
    }

    // 检测Eagle扩展运行端口
    async detectEaglePort() {
        this.log('🔍 正在检测Eagle扩展运行端口...', 'info');

        const commonPorts = [8080, 8081, 8082, 8083, 8084, 8085];
        const currentPort = this.currentPort;

        // 将当前端口放在第一位，其他端口按顺序检测
        const portsToCheck = [currentPort, ...commonPorts.filter(p => p !== currentPort)];

        for (const port of portsToCheck) {
            try {
                this.log(`检测端口 ${port}...`, 'info');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000); // 2秒超时

                const response = await fetch(`http://localhost:${port}/ping`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const data = await response.json();
                    if (data.service === 'Export to AE') {
                        this.log(`✅ 发现Eagle扩展运行在端口 ${port}`, 'success');

                        if (port !== currentPort) {
                            this.log(`💡 自动匹配Eagle扩展端口: ${currentPort} -> ${port}`, 'info');

                            // 自动更新AE扩展端口配置以匹配Eagle扩展
                            this.settingsManager.updatePreference('communicationPort', port);
                            this.updateEagleUrl(port);

                            this.log(`✅ 端口配置已自动更新，请点击"测试连接"`, 'success');
                        }
                        return;
                    }
                }
            } catch (error) {
                // 静默处理，继续检测下一个端口
            }
        }

        this.log('❌ 未检测到Eagle扩展在常用端口运行', 'warning');
        this.log('📋 请确认：', 'info');
        this.log('1. Eagle应用程序已启动', 'info');
        this.log('2. Export to AE 插件已启用', 'info');
        this.log('3. 尝试重启Eagle应用程序', 'info');
    }

    // 播放连接音效（检查用户设置）
    playConnectionSound(soundType) {
        try {
            const settings = this.settingsManager.getSettings();

            // 检查音效是否启用
            if (!settings.soundSettings || !settings.soundSettings.enabled) {
                return;
            }

            // 播放对应音效
            if (soundType === 'linked') {
                this.soundPlayer.playLinkedSound();
            } else if (soundType === 'stop') {
                this.soundPlayer.playStopSound();
            }

        } catch (error) {
            console.warn('播放连接音效失败:', error);
        }
    }

    // 快速设置管理
    setupQuickSettings() {
        // 获取快速设置控件
        const quickImportModeRadios = document.querySelectorAll('input[name="quick-import-mode"]');
        const quickAddToComp = document.getElementById('quick-add-to-comp');
        const behaviorDetails = document.getElementById('behavior-details');
        const timelinePlacementSelect = document.getElementById('timeline-placement-select');

        // 导入模式变化
        quickImportModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // 更新按钮样式
                    this.updateModeButtonStyles();
                    this.updateQuickSetting('mode', e.target.value);
                    this.updateQuickSettingsVisibility();
                }
            });
        });

        // 添加到合成变化
        quickAddToComp.addEventListener('change', (e) => {
            this.updateQuickSetting('addToComposition', e.target.checked);
            this.updateQuickSettingsVisibility();
        });

        // 时间轴放置模式变化
        timelinePlacementSelect.addEventListener('change', (e) => {
            this.updateQuickSetting('timelineOptions.placement', e.target.value);
        });

        // 监听设置管理器的字段变化，实现双向绑定
        this.settingsManager.addFieldListener('mode', (newValue) => {
            const currentRadio = document.querySelector(`input[name="quick-import-mode"][value="${newValue}"]`);
            if (currentRadio && !currentRadio.checked) {
                currentRadio.checked = true;
                this.updateModeButtonStyles();
                this.updateQuickSettingsVisibility();
            }
        });

        this.settingsManager.addFieldListener('timelineOptions.placement', (newValue) => {
            if (timelinePlacementSelect.value !== newValue) {
                timelinePlacementSelect.value = newValue;
            }
        });

        this.settingsManager.addFieldListener('addToComposition', (newValue) => {
            if (quickAddToComp.checked !== newValue) {
                quickAddToComp.checked = newValue;
                this.updateQuickSettingsVisibility();
            }
        });

        // 监听自动保存事件
        this.settingsManager.addListener((type, data) => {
            if (type === 'autoSave') {
                // 同步设置到Eagle插件
                this.syncSettingsToEagle(data);
            } else if (type === 'autoSaveError') {
                this.log(`自动保存失败: ${data.message}`, 'error');
            }
        });

        // 初始化快速设置UI
        this.loadQuickSettings();
        this.quickSettingsInitialized = true;
    }

    // 更新快速设置
    updateQuickSetting(fieldPath, value) {
        if (!this.quickSettingsInitialized) return;

        const result = this.settingsManager.updateField(fieldPath, value, true, false); // 不进行完整验证
        if (!result.success) {
            this.log(`更新快速设置失败: ${result.error}`, 'error');
        }
    }

    // 更新快速设置的可见性
    updateQuickSettingsVisibility() {
        const addToCompCheckbox = document.getElementById('quick-add-to-comp');
        const behaviorDetails = document.getElementById('behavior-details');

        // 根据添加到合成选项显示/隐藏时间轴选择器
        if (addToCompCheckbox.checked) {
            behaviorDetails.classList.add('visible');
        } else {
            behaviorDetails.classList.remove('visible');
        }
    }

    // 加载快速设置
    loadQuickSettings() {
        const settings = this.settingsManager.getSettings();

        // 设置导入模式单选按钮
        const modeRadio = document.querySelector(`input[name="quick-import-mode"][value="${settings.mode}"]`);
        if (modeRadio) modeRadio.checked = true;

        // 设置添加到合成复选框
        document.getElementById('quick-add-to-comp').checked = settings.addToComposition;

        // 设置时间轴放置模式
        document.getElementById('timeline-placement-select').value = settings.timelineOptions.placement;

        // 更新可见性
        this.updateQuickSettingsVisibility();

        // 更新按钮样式
        this.updateModeButtonStyles();
    }

    // 更新模式按钮样式
    updateModeButtonStyles() {
        const modeButtons = document.querySelectorAll('.mode-button');
        modeButtons.forEach(button => {
            const radio = button.querySelector('input[type="radio"]');
            if (radio && radio.checked) {
                button.classList.add('checked');
            } else {
                button.classList.remove('checked');
            }
        });
    }
}

// 初始化扩展
let aeExtension = null;

document.addEventListener('DOMContentLoaded', () => {
    aeExtension = new AEExtension();
});
