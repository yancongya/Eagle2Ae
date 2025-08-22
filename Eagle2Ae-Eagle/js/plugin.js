// Eagle2Ae - Eagle后台服务插件
// 在Eagle启动时自动运行，与After Effects进行实时通信

// 注意：Eagle插件环境不支持Node.js require()
// 暂时禁用WebSocket功能，使用HTTP兼容模式
// const Eagle2AeWebSocketServer = require('./websocket-server');
// const CompatibilityLayer = require('./compatibility-layer');
// const { MESSAGE_TYPES, createMessage } = require('./websocket-protocol');

// 动态端口分配器类定义（内联）
class DynamicPortAllocator {
    constructor() {
        this.portRange = [8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089];
        this.currentPort = null;
        this.registryFile = null;
        this.initRegistryPath();
    }

    initRegistryPath() {
        try {
            const os = require('os');
            const path = require('path');
            const tempDir = os.tmpdir();
            this.registryFile = path.join(tempDir, 'eagle2ae_port.txt');
            console.log(`端口注册文件路径: ${this.registryFile}`);
        } catch (error) {
            console.error('初始化注册文件路径失败:', error);
            this.registryFile = 'eagle2ae_port.txt';
        }
    }

    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();
            const timeout = setTimeout(() => {
                server.close();
                resolve(false);
            }, 1000);

            server.listen(port, '127.0.0.1', () => {
                clearTimeout(timeout);
                server.once('close', () => resolve(true));
                server.close();
            });

            server.on('error', () => {
                clearTimeout(timeout);
                resolve(false);
            });
        });
    }

    async findAvailablePort() {
        console.log('开始扫描可用端口...');
        for (const port of this.portRange) {
            console.log(`检查端口 ${port}...`);
            if (await this.isPortAvailable(port)) {
                console.log(`✅ 端口 ${port} 可用`);
                return port;
            } else {
                console.log(`❌ 端口 ${port} 被占用`);
            }
        }

        console.log('预定义端口都被占用，尝试随机端口...');
        for (let i = 0; i < 20; i++) {
            const randomPort = Math.floor(Math.random() * (65535 - 49152)) + 49152;
            if (await this.isPortAvailable(randomPort)) {
                console.log(`✅ 随机端口 ${randomPort} 可用`);
                return randomPort;
            }
        }

        throw new Error('无法找到可用端口');
    }

    registerService(port) {
        try {
            const fs = require('fs');
            const serviceInfo = {
                port: port,
                pid: process.pid,
                startTime: Date.now(),
                timestamp: new Date().toISOString(),
                service: 'Eagle2Ae',
                version: '2.1.0'
            };

            fs.writeFileSync(this.registryFile, JSON.stringify(serviceInfo, null, 2));
            console.log(`✅ 服务已注册: 端口 ${port}`);
            console.log(`📝 注册文件: ${this.registryFile}`);
            this.currentPort = port;
            return true;
        } catch (error) {
            console.error('注册服务失败:', error);
            return false;
        }
    }

    async allocatePort() {
        try {
            console.log('🚀 开始动态端口分配...');
            const port = await this.findAvailablePort();
            const registered = this.registerService(port);
            if (!registered) {
                throw new Error('服务注册失败');
            }
            console.log(`🎯 动态端口分配成功: ${port}`);
            return port;
        } catch (error) {
            console.error('❌ 动态端口分配失败:', error);
            throw error;
        }
    }

    cleanup() {
        try {
            const fs = require('fs');
            if (fs.existsSync(this.registryFile)) {
                fs.unlinkSync(this.registryFile);
                console.log('✅ 注册文件已清理');
            }
        } catch (error) {
            console.error('清理注册文件失败:', error);
        }
    }
}

class Eagle2Ae {
    constructor() {
        this.httpServer = null;
        this.webSocketServer = null; // 新增WebSocket服务器
        this.compatibilityLayer = null; // 兼容性处理层
        this.eagleWebSocket = null; // Eagle兼容WebSocket
        this.aeConnection = null;

        // 动态端口分配器
        this.portAllocator = null;

        this.aeStatus = {
            connected: false,
            projectPath: null,
            activeComp: null,
            isReady: false
        };

        // AE消息时间跟踪
        this.lastAEMessageTime = null;

        // Eagle状态信息
        this.eagleStatus = {
            version: null,
            execPath: null,
            libraryName: null,
            libraryPath: null,
            librarySize: 0,
            currentFolder: null,
            currentFolderName: null,
            folderPath: null,
            tempPath: null
        };

        // 大小计算状态管理
        this.librarySizeCalculation = {
            isCalculating: false,
            isCompleted: false,
            startTime: null,
            result: 0,
            error: null,
            lastModificationTime: null, // 记录上次检查的修改时间
            lastCalculationTime: null   // 记录上次计算的时间
        };

        // 资源库变化监控定时器
        this.libraryMonitorTimer = null;
        this.selectedFiles = [];
        this.messageQueue = [];
        this.eagleLogs = []; // 存储Eagle发送的日志
        this.config = {
            wsPort: 8080, // 默认端口，将被动态分配覆盖
            autoExport: false, // 默认关闭自动导出，需要用户主动点击
            targetDirectory: null,
            useWebSocket: false, // 暂时禁用WebSocket（Eagle环境限制）
            fallbackToHttp: true, // 允许HTTP兼容模式
            useDynamicPort: true // 启用动态端口分配
        };

        // 在构造函数中不执行异步操作，移到init方法中

        this.isServiceMode = true;
        this.uiMode = false;

        // 初始化状态控制
        this.isInitializing = true; // 标记正在初始化
        this.initStartTime = Date.now(); // 记录初始化开始时间
        this.minInitTime = 5000; // 最小初始化时间5秒，防止意外触发

        // 用户操作控制
        this.lastUserAction = 0;
        this.userActionCooldown = 2000; // 2秒冷却时间

        // 日志发送控制
        this.logQueue = [];
        this.sentLogIds = new Set(); // 记录已发送的日志ID
        this.maxLogQueue = 50; // 最多保留50条日志
        this.logSendInterval = null;

        // 导入设置（从AE扩展同步）
        this.importSettings = {
            mode: 'project_adjacent',
            projectAdjacentFolder: 'Eagle_Assets',
            customFolderPath: '',
            addToComposition: true,
            timelineOptions: {
                enabled: true,
                placement: 'current_time',
                sequenceInterval: 1.0
            },
            fileManagement: {
                keepOriginalName: true,
                addTimestamp: false,
                createTagFolders: false,
                deleteFromEagle: false
            }
        };

        // 立即隐藏窗口（在任何其他操作之前）
        this.immediateHideWindow();

        // 始终启动后台服务
        this.init();

        // 如果有DOM环境，也初始化UI
        if (typeof document !== 'undefined' && document.querySelector('#message')) {
            this.uiMode = true;
            this.initializeUI();
            this.startServiceStatusCheck();
        }
    }

    // 立即隐藏窗口（构造函数中调用）
    immediateHideWindow() {
        try {
            // 立即隐藏DOM元素
            if (document.documentElement) {
                document.documentElement.style.display = 'none';
                document.documentElement.style.visibility = 'hidden';
                document.documentElement.style.opacity = '0';
            }

            if (document.body) {
                document.body.style.display = 'none';
                document.body.style.visibility = 'hidden';
                document.body.style.opacity = '0';
            }

            // 立即尝试隐藏Eagle窗口
            if (typeof eagle !== 'undefined' && eagle.window) {
                if (eagle.window.hide) eagle.window.hide();
                if (eagle.window.setVisible) eagle.window.setVisible(false);
                if (eagle.window.setSize) eagle.window.setSize(0, 0);
                if (eagle.window.setPosition) eagle.window.setPosition(-99999, -99999);
            }

            eagle.log.debug('立即窗口隐藏已执行');
        } catch (error) {
            eagle.log.warn('立即窗口隐藏失败:', error);
        }
    }

    // 初始化后台服务
    async init() {
        try {
            // 启动信息简化，使用Eagle日志系统
            this.log('🚀 Eagle2Ae 后台服务启动中...', 'info');
            eagle.log.debug(`运行环境: Node.js ${process.version || 'unknown'}`);
            eagle.log.debug(`当前目录: ${process.cwd ? process.cwd() : 'unknown'}`);
            eagle.log.info(`服务模式: ${this.isServiceMode ? '后台服务' : 'UI模式'}`);

            // 立即隐藏窗口（仅在服务模式下）
            if (this.isServiceMode) {
                this.forceHideWindow();
            }

            // 首先加载端口配置（在启动HTTP服务器之前）
            this.loadPortConfig();

            // 如果是首次运行，保存默认端口配置
            this.ensurePortConfigExists();

            // 加载导入设置
            this.loadImportSettings();

            // 启动服务器（HTTP + Eagle兼容WebSocket）
            await this.startServer();

            // 启用Eagle兼容WebSocket
            this.initEagleWebSocket();

            // 设置文件选择监听
            this.setupEventListeners();

            // 添加启动标识，确认扩展已重新加载
            this.log(`🚀 Eagle扩展已启动 - 版本: 2.1 (精简版)`, 'success');

            // 启动AE状态检查
            this.startAEStatusCheck();

            // 启动AE端口检测和自动匹配
            this.startAEPortDetection();

            // 启动时开始预计算资源库大小
            this.startLibrarySizePreCalculation();

            // 启动资源库变化监控
            this.startLibraryChangeMonitoring();

            this.log(`✅ Eagle2Ae 服务已启动 (端口: ${this.config.wsPort})`, 'success');

            // 立即显示初始化完成通知
            if (typeof eagle !== 'undefined' && eagle.notification) {
                eagle.notification.show({
                    title: 'Eagle2Ae',
                    body: '后台服务已启动，可以开始导出文件到AE',
                    mute: false,
                    duration: 3000
                });
            }

            // 初始化完成，设置标志（仍然保持5秒延迟以防止意外触发）
            setTimeout(() => {
                this.isInitializing = false;
                this.log('🔓 初始化完成，用户操作已启用', 'info');
            }, this.minInitTime);

        } catch (error) {
            this.log(`服务启动失败: ${error.message}`, 'error');
            console.error('=== Eagle2Ae 初始化失败 ===');
            console.error('错误信息:', error.message);
            console.error('错误堆栈:', error.stack);
            console.error('配置信息:', this.config);

            // 尝试显示错误通知
            if (typeof eagle !== 'undefined' && eagle.notification) {
                eagle.notification.show({
                    title: 'Eagle2Ae 启动失败',
                    body: `错误: ${error.message}`,
                    mute: false,
                    duration: 10000
                });
            }

            // 即使初始化失败，也要解除初始化状态
            setTimeout(() => {
                this.isInitializing = false;
                console.log('初始化状态已解除（失败后）');
            }, this.minInitTime);
        }
    }

    // 初始化用户界面
    initializeUI() {
        const messageDiv = document.querySelector('#message');
        messageDiv.innerHTML = `
            <div class="export-ae-panel">
                <h2>Eagle2Ae - 服务状态</h2>
                <div class="service-info">
                    <p class="service-description">
                        🚀 后台服务已自动启动，无需手动操作。<br>
                        此面板仅用于查看状态和配置设置。
                    </p>
                </div>

                <div class="status-section">
                    <h3>服务状态</h3>
                    <div class="status-item">
                        <span class="status-label">后台服务:</span>
                        <span id="service-status" class="status-value">检查中...</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">HTTP服务器:</span>
                        <span id="server-status" class="status-value">检查中...</span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">After Effects:</span>
                        <span id="ae-status" class="status-value">未连接</span>
                    </div>
                </div>

                <div class="files-section">
                    <h3>当前选中文件</h3>
                    <div id="selected-files" class="files-list">
                        <p class="no-files">请在Eagle中选择文件</p>
                    </div>
                </div>

                <div class="actions-section">
                    <button id="refresh-btn" class="export-button">刷新状态</button>
                    <button id="settings-btn" class="settings-button">设置</button>
                </div>

                <div class="log-section">
                    <h3>服务日志</h3>
                    <div id="log-output" class="log-output">
                        <p class="log-info">后台服务日志将在这里显示...</p>
                    </div>
                </div>
            </div>
        `;

        this.setupUIEventListeners();
    }

    // 设置UI事件监听
    setupUIEventListeners() {
        const refreshBtn = document.getElementById('refresh-btn');
        const settingsBtn = document.getElementById('settings-btn');

        refreshBtn.addEventListener('click', () => this.refreshServiceStatus());
        settingsBtn.addEventListener('click', () => this.showSettings());
    }

    // 开始检查服务状态
    startServiceStatusCheck() {
        // 在UI模式下，直接显示后台服务已运行的状态
        // 因为后台服务和UI在同一个进程中
        this.updateServiceStatus({
            running: true,
            selectedFiles: this.selectedFiles.length,
            aeConnected: this.aeStatus.connected,
            serverPort: this.config.wsPort,
            uptime: 0
        });

        // 每5秒更新一次状态
        this.pollInterval = setInterval(() => {
            this.updateServiceStatus({
                running: true,
                selectedFiles: this.selectedFiles.length,
                aeConnected: this.aeStatus.connected,
                serverPort: this.config.wsPort,
                uptime: 0
            });
        }, 5000);
    }

    // 刷新服务状态（UI模式下直接从内存获取）
    async refreshServiceStatus() {
        this.updateServiceStatus({
            running: true,
            selectedFiles: this.selectedFiles.length,
            aeConnected: this.aeStatus.connected,
            serverPort: this.config.wsPort,
            uptime: 0
        });
    }

    // 更新服务状态显示
    updateServiceStatus(status) {
        this.serviceStatus = status;

        if (status.running) {
            this.updateStatus('service-status', '运行中', 'connected');
            this.updateStatus('server-status', `端口:${this.config.wsPort}`, 'connected');
            this.updateStatus('ae-status', status.aeConnected ? '已连接' : '未连接',
                status.aeConnected ? 'connected' : 'disconnected');

            // 更新选中文件数量
            if (status.selectedFiles > 0) {
                document.getElementById('selected-files').innerHTML = `
                    <div class="files-count">${status.selectedFiles} 个文件已选中</div>
                    <p class="service-note">文件将自动导入到AE（如果启用自动导出）</p>
                `;
            } else {
                document.getElementById('selected-files').innerHTML =
                    '<p class="no-files">请在Eagle中选择文件</p>';
            }

            this.log('服务状态已更新', 'success');
        } else {
            this.updateStatus('service-status', '未运行', 'error');
            this.updateStatus('server-status', '未启动', 'error');
            this.updateStatus('ae-status', '无法连接', 'error');
            this.log(`服务检查失败: ${status.error || '未知错误'}`, 'error');
        }
    }

    // 初始化Eagle兼容WebSocket
    initEagleWebSocket() {
        try {
            if (typeof EagleCompatibleWebSocket !== 'undefined') {
                this.eagleWebSocket = new EagleCompatibleWebSocket(this);
                this.eagleWebSocket.enable();
                this.log('✅ Eagle兼容WebSocket已启用', 'success');
            } else {
                this.log('⚠️ Eagle兼容WebSocket类未找到', 'warning');
            }
        } catch (error) {
            this.log(`Eagle兼容WebSocket初始化失败: ${error.message}`, 'error');
        }
    }

    // 启动服务器（WebSocket优先）
    async startServer() {
        if (this.config.useWebSocket) {
            try {
                await this.startWebSocketServer();
                return;
            } catch (error) {
                this.log(`WebSocket服务器启动失败: ${error.message}`, 'error');
                if (this.config.fallbackToHttp) {
                    this.log('回退到HTTP服务器模式...', 'warning');
                    await this.startHttpServer();
                } else {
                    throw error;
                }
            }
        } else {
            await this.startHttpServer();
        }
    }

    // 启动WebSocket服务器
    async startWebSocketServer() {
        try {
            // 创建兼容性层
            this.compatibilityLayer = new CompatibilityLayer(this);

            // 创建WebSocket服务器
            this.webSocketServer = new Eagle2AeWebSocketServer(this.config.wsPort, this);

            // 修改WebSocket服务器的HTTP处理，使用兼容性层
            const originalHandleHttpRequest = this.webSocketServer.handleHttpRequest;
            this.webSocketServer.handleHttpRequest = (req, res) => {
                this.compatibilityLayer.handleHttpRequest(req, res);
            };

            await this.webSocketServer.start();

            this.log(`✅ WebSocket服务器已启动 (端口: ${this.config.wsPort})`, 'success');
            this.log(`📡 HTTP兼容模式已启用，支持旧版本AE扩展`, 'info');
            return true;

        } catch (error) {
            this.log(`WebSocket服务器启动失败: ${error.message}`, 'error');
            throw error;
        }
    }

    // 启动HTTP服务器（兼容模式）
    async startHttpServer() {
        try {
            console.log('=== 开始启动HTTP服务器 ===');

            // 初始化动态端口分配器
            if (!this.portAllocator) {
                // 在Eagle环境中直接实例化类
                this.portAllocator = new DynamicPortAllocator();
            }

            // 使用动态端口分配
            let actualPort;
            if (this.config.useDynamicPort) {
                console.log('使用动态端口分配...');
                actualPort = await this.portAllocator.allocatePort();
                this.config.wsPort = actualPort; // 更新配置中的端口
            } else {
                console.log(`使用固定端口: ${this.config.wsPort}`);
                actualPort = this.config.wsPort;
            }

            const http = require('http');
            const url = require('url');

            console.log('创建HTTP服务器实例...');
            this.httpServer = http.createServer(async (req, res) => {
                // 设置CORS头
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                if (req.method === 'OPTIONS') {
                    res.writeHead(200);
                    res.end();
                    return;
                }

                const parsedUrl = url.parse(req.url, true);

                if (req.method === 'POST' && parsedUrl.pathname === '/ae-message') {
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        try {
                            const message = JSON.parse(body);
                            const clientId = message.clientId || 'default_client';

                            // 添加消息接收日志
                            this.log(`📨 收到AE消息: ${message.type}`, 'info');

                            // 如果启用了Eagle WebSocket，通过它处理消息
                            if (this.eagleWebSocket && this.eagleWebSocket.isEnabled) {
                                this.log(`🔄 通过Eagle WebSocket处理消息`, 'debug');
                                this.eagleWebSocket.handleClientMessage(clientId, message);
                            } else {
                                // 回退到传统处理方式
                                this.log(`🔄 通过传统方式处理消息`, 'debug');
                                this.handleAEMessage(message);
                            }

                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({
                                success: true,
                                websocketCompatible: !!this.eagleWebSocket
                            }));
                        } catch (error) {
                            this.log(`消息解析错误: ${error.message}`, 'error');
                            res.writeHead(400, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({error: error.message}));
                        }
                    });
                } else if (req.method === 'GET' && parsedUrl.pathname === '/ae-status') {
                    // AE扩展获取状态
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({
                        connected: true,
                        selectedFiles: this.selectedFiles,
                        config: this.config,
                        serviceMode: true,
                        eagleStatus: this.eagleStatus  // 添加Eagle状态信息
                    }));
                } else if (req.method === 'GET' && parsedUrl.pathname === '/messages') {
                    // AE扩展获取消息队列（支持WebSocket兼容模式）
                    const clientId = parsedUrl.query.clientId || 'default_client';

                    // 注册客户端到Eagle WebSocket
                    if (this.eagleWebSocket && !this.eagleWebSocket.clients.has(clientId)) {
                        this.eagleWebSocket.registerClient(clientId, {
                            userAgent: req.headers['user-agent'],
                            ip: req.connection.remoteAddress
                        });
                    }

                    // 获取消息（WebSocket优先，HTTP兼容）
                    let messages = [];
                    if (this.eagleWebSocket && this.eagleWebSocket.hasActiveClients()) {
                        messages = this.eagleWebSocket.getClientMessages(clientId);
                    } else {
                        // 回退到传统消息队列
                        messages = this.getMessageQueue();
                    }

                    // 只返回最新的50条Eagle日志，避免历史日志堆积
                    const recentEagleLogs = this.eagleLogs.slice(-50);
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({
                        messages: messages,
                        eagleLogs: recentEagleLogs,
                        websocketCompatible: !!this.eagleWebSocket,
                        clientId: clientId
                    }));
                } else if (req.method === 'GET' && parsedUrl.pathname === '/service-status') {
                    // 服务状态查询
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({
                        running: true,
                        selectedFiles: this.selectedFiles.length,
                        aeConnected: this.aeStatus.connected,
                        serverPort: this.config.wsPort,
                        uptime: process.uptime ? process.uptime() : 0
                    }));
                } else if (req.method === 'POST' && parsedUrl.pathname === '/export-files') {
                    // 处理文件导出请求
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        try {
                            const data = JSON.parse(body);
                            this.handleFileExport(data);
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({
                                success: true,
                                message: `已接收 ${data.files.length} 个文件的导出请求`
                            }));
                        } catch (error) {
                            this.log(`文件导出请求处理错误: ${error.message}`, 'error');
                            res.writeHead(400, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({error: error.message}));
                        }
                    });
                } else if (req.method === 'POST' && parsedUrl.pathname === '/eagle-logs') {
                    // 接收Eagle日志
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        try {
                            const data = JSON.parse(body);
                            this.handleEagleLogs(data.logs);
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({
                                success: true,
                                received: data.logs.length
                            }));
                        } catch (error) {
                            this.log(`Eagle日志接收错误: ${error.message}`, 'error');
                            res.writeHead(400, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({error: error.message}));
                        }
                    });
                } else if (req.method === 'POST' && parsedUrl.pathname === '/settings-sync') {
                    // 接收AE扩展的设置同步
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        try {
                            const data = JSON.parse(body);
                            this.handleSettingsSync(data);
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({
                                success: true,
                                message: '设置同步成功'
                            }));
                        } catch (error) {
                            this.log(`设置同步错误: ${error.message}`, 'error');
                            res.writeHead(400, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({error: error.message}));
                        }
                    });
                } else if (req.method === 'POST' && parsedUrl.pathname === '/ae-port-info') {
                    // 接收AE扩展的端口信息
                    let body = '';
                    req.on('data', chunk => {
                        body += chunk.toString();
                    });
                    req.on('end', () => {
                        try {
                            const data = JSON.parse(body);
                            this.handleAEPortInfo(data);
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({
                                success: true,
                                message: 'AE端口信息已接收'
                            }));
                        } catch (error) {
                            this.log(`AE端口信息处理错误: ${error.message}`, 'error');
                            res.writeHead(400, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({error: error.message}));
                        }
                    });
                } else if (req.method === 'POST' && parsedUrl.pathname === '/clear-logs') {
                    // 清理日志队列
                    this.clearLogQueue();
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({
                        success: true,
                        message: '日志队列已清理'
                    }));
                } else if (req.method === 'GET' && parsedUrl.pathname === '/ping') {
                    // 心跳检测
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({
                        pong: true,
                        timestamp: Date.now(),
                        service: 'Eagle2Ae',
                        version: '1.0.1'
                    }));
                } else if (req.method === 'POST' && parsedUrl.pathname === '/copy-to-clipboard') {
                    // 处理复制到剪贴板的请求
                    this.handleCopyToClipboard(req, res);
                } else if (req.method === 'POST' && parsedUrl.pathname === '/temp-folder-action') {
                    // 处理临时文件夹操作请求
                    this.handleTempFolderAction(req, res);
                } else if (req.method === 'POST' && parsedUrl.pathname === '/check-library-changes') {
                    // 处理检查资源库变化请求
                    this.handleCheckLibraryChanges(req, res);
                } else if (req.method === 'POST' && parsedUrl.pathname === '/reset-ae-connection') {
                    // 处理重置AE连接状态请求
                    this.handleResetAEConnection(req, res);
                } else if (req.method === 'GET' && parsedUrl.pathname === '/debug-eagle-status') {
                    // 调试：获取详细的Eagle状态信息
                    const debugInfo = {
                        eagleStatus: this.eagleStatus,
                        tempFolderPath: this.getTempFolderPath(),
                        timestamp: new Date().toISOString(),
                        eagleObjectType: typeof eagle,
                        eagleLibraryType: typeof eagle?.library,
                        eagleLibraryMethods: eagle?.library ? Object.getOwnPropertyNames(eagle.library) : [],
                        eagleLibraryProperties: {},
                        nodeJsInfo: {
                            platform: process.platform,
                            arch: process.arch,
                            version: process.version,
                            cwd: process.cwd(),
                            env: {
                                TEMP: process.env.TEMP,
                                TMP: process.env.TMP,
                                USERPROFILE: process.env.USERPROFILE,
                                HOME: process.env.HOME
                            }
                        }
                    };

                    // 尝试获取eagle.library的所有属性值
                    if (eagle?.library) {
                        try {
                            debugInfo.eagleLibraryProperties = {
                                name: eagle.library.name,
                                path: eagle.library.path,
                                id: eagle.library.id,
                                toString: eagle.library.toString ? eagle.library.toString() : 'N/A'
                            };

                            // 检查是否有info方法
                            if (typeof eagle.library.info === 'function') {
                                debugInfo.eagleLibraryInfoMethodExists = true;
                                // 注意：这里不能使用await，因为不在async函数中
                                // 在实际使用时需要通过其他方式调用
                            } else {
                                debugInfo.eagleLibraryInfoMethodExists = false;
                            }
                        } catch (propError) {
                            debugInfo.eagleLibraryPropertiesError = propError.message;
                        }
                    }

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(debugInfo, null, 2));
                } else if (req.method === 'GET' && parsedUrl.pathname === '/test-library-size') {
                    // 专门测试资源库大小计算
                    try {
                        const testResult = {
                            timestamp: new Date().toISOString(),
                            libraryPath: this.eagleStatus.libraryPath,
                            pathExists: false,
                            pathIsDirectory: false,
                            calculatedSize: 0,
                            error: null,
                            steps: []
                        };

                        const fs = require('fs');
                        const path = require('path');

                        testResult.steps.push(`开始测试路径: "${this.eagleStatus.libraryPath}"`);

                        if (this.eagleStatus.libraryPath && this.eagleStatus.libraryPath !== '未知') {
                            // 检查路径是否存在
                            testResult.pathExists = fs.existsSync(this.eagleStatus.libraryPath);
                            testResult.steps.push(`路径存在检查: ${testResult.pathExists}`);

                            if (testResult.pathExists) {
                                // 检查是否为目录
                                const stats = fs.statSync(this.eagleStatus.libraryPath);
                                testResult.pathIsDirectory = stats.isDirectory();
                                testResult.steps.push(`是否为目录: ${testResult.pathIsDirectory}`);

                                if (testResult.pathIsDirectory) {
                                    // 尝试计算大小
                                    testResult.steps.push('开始计算大小...');
                                    try {
                                        testResult.calculatedSize = await this.calculateLibrarySize(this.eagleStatus.libraryPath);
                                        testResult.steps.push(`计算完成: ${testResult.calculatedSize} bytes`);
                                    } catch (calcError) {
                                        testResult.error = calcError.message;
                                        testResult.steps.push(`计算失败: ${calcError.message}`);
                                    }
                                }
                            }
                        } else {
                            testResult.error = '资源库路径无效';
                            testResult.steps.push('资源库路径无效，跳过测试');
                        }

                        res.writeHead(200, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify(testResult, null, 2));
                    } catch (testError) {
                        res.writeHead(500, {'Content-Type': 'application/json'});
                        res.end(JSON.stringify({
                            error: testError.message,
                            stack: testError.stack,
                            timestamp: new Date().toISOString()
                        }, null, 2));
                    }
                } else {
                    res.writeHead(404);
                    res.end('Not Found');
                }
            });

            console.log(`开始监听端口 ${actualPort}...`);
            this.httpServer.listen(actualPort, 'localhost', () => {
                console.log(`✅ HTTP服务器启动成功，端口: ${actualPort}`);
                eagle.log.info(`HTTP服务器启动成功，端口: ${actualPort}`);
                this.aeStatus.connected = true;

                // 显示启动成功通知
                if (typeof eagle !== 'undefined' && eagle.notification) {
                    eagle.notification.show({
                        title: 'Eagle2Ae HTTP服务器',
                        body: `已在端口 ${actualPort} 启动${this.config.useDynamicPort ? ' (动态分配)' : ''}`,
                        mute: false,
                        duration: 3000
                    });
                }
            });

            this.httpServer.on('error', (error) => {
                console.error(`❌ HTTP服务器错误:`, error);
                if (error.code === 'EADDRINUSE') {
                    console.error(`❌ 端口 ${this.config.wsPort} 被占用！`);
                    this.log(`❌ 端口 ${this.config.wsPort} 被占用，无法启动服务器`, 'error');

                    // 显示端口占用错误通知
                    if (typeof eagle !== 'undefined' && eagle.notification) {
                        eagle.notification.show({
                            title: 'Eagle2Ae 端口被占用',
                            body: `端口 ${this.config.wsPort} 被其他程序占用，请关闭占用程序或更改端口`,
                            mute: false,
                            duration: 15000
                        });
                    }

                    // 不再自动递增端口，而是给出明确的错误信息
                    console.error('请执行以下操作之一：');
                    console.error('1. 关闭占用端口的程序');
                    console.error('2. 在AE扩展中更改通信端口');
                    console.error('3. 重启Eagle应用程序');

                } else {
                    console.error(`HTTP服务器严重错误: ${error.message}`);
                    this.log(`HTTP服务器错误: ${error.message}`, 'error');

                    // 显示错误通知
                    if (typeof eagle !== 'undefined' && eagle.notification) {
                        eagle.notification.show({
                            title: 'Eagle2Ae 服务器错误',
                            body: `HTTP服务器启动失败: ${error.message}`,
                            mute: false,
                            duration: 10000
                        });
                    }
                }
            });

        } catch (error) {
            this.log(`启动HTTP服务器失败: ${error.message}`, 'error');
        }
    }

    // 获取Eagle信息
    async updateEagleStatus() {
        try {
            eagle.log.debug('开始获取Eagle状态信息...');

            // 获取Eagle版本信息 - 组合版本、构建号和进程ID
            try {
                const version = eagle.app.version || '未知';
                const build = eagle.app.build || '未知';
                const pid = eagle.app.pid || '未知';
                this.eagleStatus.version = `${version} build ${build} pid ${pid}`;
                eagle.log.debug(`Eagle版本信息: ${this.eagleStatus.version}`);
            } catch (versionError) {
                eagle.log.warn(`获取Eagle版本失败: ${versionError.message}`);
                this.eagleStatus.version = '获取失败';
            }

            // 获取Eagle安装路径（保留用于其他用途）
            try {
                this.eagleStatus.execPath = eagle.app.execPath;
                eagle.log.debug(`Eagle安装路径: ${this.eagleStatus.execPath}`);
            } catch (pathError) {
                eagle.log.warn(`获取Eagle安装路径失败: ${pathError.message}`);
                this.eagleStatus.execPath = '获取失败';
            }

            // 获取当前资源库信息
            try {
                eagle.log.debug('开始获取资源库信息...');
                eagle.log.debug(`eagle对象类型: ${typeof eagle}`);
                eagle.log.debug(`eagle.library类型: ${typeof eagle.library}`);

                // 详细调试Eagle API可用性
                if (typeof eagle.library !== 'undefined' && eagle.library) {
                    eagle.log.debug('eagle.library对象存在，检查可用属性...');
                    eagle.log.debug(`eagle.library.name: ${eagle.library.name}`);
                    eagle.log.debug(`eagle.library.path: ${eagle.library.path}`);

                    // 检查所有可用属性
                    const libraryProps = Object.getOwnPropertyNames(eagle.library);
                    eagle.log.debug(`eagle.library可用属性: ${libraryProps.join(', ')}`);
                } else {
                    eagle.log.warn('eagle.library对象不存在或未定义');
                }

                // 尝试多种方法获取资源库信息
                let libraryName = '未知';
                let libraryPath = '未知';

                // 方法1: 直接访问属性
                if (typeof eagle.library !== 'undefined' && eagle.library) {
                    eagle.log.debug(`library对象存在，尝试获取属性...`);
                    let rawName = eagle.library.name || '未知';
                    libraryPath = eagle.library.path || '未知';

                    eagle.log.debug(`获取到的原始数据 - name: "${rawName}", path: "${libraryPath}"`);

                    // 确保显示完整的.library扩展名
                    if (rawName !== '未知' && !rawName.endsWith('.library')) {
                        libraryName = rawName + '.library';
                    } else {
                        libraryName = rawName;
                    }

                    eagle.log.debug(`直接访问 - 原始name: ${rawName}, 处理后name: ${libraryName}, path: ${libraryPath}`);
                }

                // 方法2: 如果直接访问失败，尝试使用info()方法
                if (libraryName === '未知' && typeof eagle.library.info === 'function') {
                    eagle.log.debug('尝试使用library.info()方法...');
                    try {
                        const libraryInfo = await eagle.library.info();
                        eagle.log.debug(`library.info()返回结果: ${JSON.stringify(libraryInfo)}`);

                        if (libraryInfo) {
                            let rawName = libraryInfo.name || '未知';
                            libraryPath = libraryInfo.path || '未知';

                            eagle.log.debug(`解析前 - rawName: "${rawName}", libraryPath: "${libraryPath}"`);

                            // 确保显示完整的.library扩展名
                            if (rawName !== '未知' && !rawName.endsWith('.library')) {
                                libraryName = rawName + '.library';
                            } else {
                                libraryName = rawName;
                            }

                            eagle.log.debug(`info()方法 - 原始name: ${rawName}, 处理后name: ${libraryName}, path: ${libraryPath}`);
                        } else {
                            eagle.log.warn('library.info()返回null或undefined');
                        }
                    } catch (infoError) {
                        eagle.log.warn(`library.info()调用失败: ${infoError.message}`);
                    }
                }

                this.eagleStatus.libraryName = libraryName;
                this.eagleStatus.libraryPath = libraryPath;

                // 检查是否有预计算的结果
                if (this.librarySizeCalculation.isCompleted &&
                    this.librarySizeCalculation.result > 0) {
                    // 使用预计算的结果
                    this.eagleStatus.librarySize = this.librarySizeCalculation.result;
                    eagle.log.info(`✅ 使用预计算的资源库大小: ${this.formatSize(this.librarySizeCalculation.result)}`);
                } else {
                    // 无论是否在计算中，都先返回基本信息，大小设为计算中状态
                    this.eagleStatus.librarySize = -1; // -1 表示正在计算中

                    if (this.librarySizeCalculation.isCalculating) {
                        eagle.log.info('📊 资源库大小正在预计算中，先返回基本信息...');
                    } else {
                        eagle.log.info('📊 开始异步计算资源库大小，先返回基本信息...');
                        this.calculateLibrarySizeAsync(libraryPath);
                    }
                }

                eagle.log.info(`资源库信息获取完成 - 名称: ${libraryName}, 路径: ${libraryPath}`);

            } catch (libraryError) {
                eagle.log.error(`获取资源库信息失败: ${libraryError.message}`);
                eagle.log.error(`错误堆栈: ${libraryError.stack}`);
                this.eagleStatus.libraryName = '获取失败';
                this.eagleStatus.libraryPath = '获取失败';
                this.eagleStatus.librarySize = 0;
            }

            // 获取当前激活的文件夹
            try {
                const selectedFolders = await eagle.folder.getSelected();
                eagle.log.debug(`获取到选中文件夹: ${selectedFolders ? selectedFolders.length : 0} 个`);

                if (selectedFolders && selectedFolders.length > 0) {
                    const folder = selectedFolders[0];
                    this.eagleStatus.currentFolder = folder.id;
                    this.eagleStatus.currentFolderName = folder.name;

                    // 构建文件夹层级路径
                    this.eagleStatus.folderPath = await this.buildFolderPath(folder);
                    eagle.log.debug(`当前选中组: ${this.eagleStatus.folderPath}`);
                } else {
                    // 如果没有选中文件夹，尝试获取最近使用的文件夹
                    try {
                        const recentFolders = await eagle.folder.getRecents();
                        eagle.log.debug(`获取到最近文件夹: ${recentFolders ? recentFolders.length : 0} 个`);

                        if (recentFolders && recentFolders.length > 0) {
                            const folder = recentFolders[0];
                            this.eagleStatus.currentFolder = folder.id;
                            this.eagleStatus.currentFolderName = folder.name;

                            // 构建文件夹层级路径
                            this.eagleStatus.folderPath = await this.buildFolderPath(folder);
                            eagle.log.debug(`使用最近组: ${this.eagleStatus.folderPath}`);
                        } else {
                            this.eagleStatus.currentFolder = null;
                            this.eagleStatus.currentFolderName = '未选择';
                            this.eagleStatus.folderPath = '未选择';
                            eagle.log.debug('没有找到任何文件夹组');
                        }
                    } catch (recentError) {
                        eagle.log.warn(`获取最近文件夹失败: ${recentError.message}`);
                        this.eagleStatus.currentFolder = null;
                        this.eagleStatus.currentFolderName = '获取失败';
                        this.eagleStatus.folderPath = '获取失败';
                    }
                }
            } catch (folderError) {
                eagle.log.warn(`获取文件夹信息失败: ${folderError.message}`);
                this.eagleStatus.currentFolder = null;
                this.eagleStatus.currentFolderName = '获取失败';
                this.eagleStatus.folderPath = '获取失败';
            }

            // 获取临时文件夹路径
            try {
                eagle.log.debug('开始获取临时文件夹路径...');

                // 首先尝试使用Node.js的os模块（更可靠）
                const os = require('os');
                this.eagleStatus.tempPath = os.tmpdir();
                eagle.log.info(`使用Node.js API获取临时文件夹路径: ${this.eagleStatus.tempPath}`);

                // 验证路径是否有效
                if (!this.eagleStatus.tempPath || this.eagleStatus.tempPath === '') {
                    throw new Error('获取到的临时文件夹路径为空');
                }

                // 验证路径是否存在
                const fs = require('fs');
                if (!fs.existsSync(this.eagleStatus.tempPath)) {
                    throw new Error(`临时文件夹路径不存在: ${this.eagleStatus.tempPath}`);
                }

                eagle.log.info(`临时文件夹路径验证成功: ${this.eagleStatus.tempPath}`);

            } catch (tempError) {
                eagle.log.error(`获取临时文件夹路径失败: ${tempError.message}`);

                // 尝试使用硬编码的备用路径
                try {
                    const path = require('path');
                    const fallbackPaths = [
                        process.env.TEMP,
                        process.env.TMP,
                        '/tmp',
                        'C:\\Windows\\Temp'
                    ].filter(p => p); // 过滤掉undefined的值

                    for (const fallbackPath of fallbackPaths) {
                        const fs = require('fs');
                        if (fs.existsSync(fallbackPath)) {
                            this.eagleStatus.tempPath = fallbackPath;
                            eagle.log.info(`使用备用临时文件夹路径: ${this.eagleStatus.tempPath}`);
                            break;
                        }
                    }

                    if (!this.eagleStatus.tempPath || this.eagleStatus.tempPath === '未知') {
                        throw new Error('所有备用路径都不可用');
                    }

                } catch (backupError) {
                    eagle.log.error(`所有临时文件夹路径获取方案都失败: ${backupError.message}`);
                    this.eagleStatus.tempPath = '未知';
                }
            }

            eagle.log.info(`Eagle状态更新完成 - 版本: ${this.eagleStatus.version}, 资源库: ${this.eagleStatus.libraryName}, 当前组: ${this.eagleStatus.folderPath}`);

        } catch (error) {
            eagle.log.error(`获取Eagle状态失败: ${error.message}`);
            eagle.log.error(error.stack || error);
            // 设置默认值
            this.eagleStatus.version = '未知';
            this.eagleStatus.execPath = '未知';
            this.eagleStatus.libraryName = '未知';
            this.eagleStatus.libraryPath = '未知';
            this.eagleStatus.librarySize = 0;
            this.eagleStatus.currentFolder = null;
            this.eagleStatus.currentFolderName = '未知';
            this.eagleStatus.folderPath = '未知';
            this.eagleStatus.tempPath = '未知';
        }
    }

    // 构建文件夹层级路径
    async buildFolderPath(folder) {
        try {
            // 只返回当前文件夹名称，不包含资源库名称和父文件夹路径
            const folderName = folder.name || '未知';

            eagle.log.debug(`构建文件夹路径完成: ${folderName}`);
            return folderName;

        } catch (error) {
            eagle.log.warn(`构建文件夹路径失败: ${error.message}`);
            return folder.name || '未知';
        }
    }

    // 获取Eagle2AE临时文件夹路径
    getTempFolderPath() {
        try {
            eagle.log.debug(`检查临时文件夹路径状态: ${this.eagleStatus.tempPath}`);

            if (this.eagleStatus.tempPath && this.eagleStatus.tempPath !== '未知' && this.eagleStatus.tempPath !== '') {
                const path = require('path');
                const tempFolderPath = path.join(this.eagleStatus.tempPath, 'Eagle2AE-tmp');
                eagle.log.debug(`生成的临时文件夹路径: ${tempFolderPath}`);
                return tempFolderPath;
            }

            eagle.log.warn(`临时文件夹路径无效: ${this.eagleStatus.tempPath}`);
            return null;
        } catch (error) {
            eagle.log.error(`获取临时文件夹路径失败: ${error.message}`);
            return null;
        }
    }

    // 创建临时文件夹
    async createTempFolder() {
        try {
            const tempFolderPath = this.getTempFolderPath();
            if (!tempFolderPath) {
                throw new Error('无法获取临时文件夹路径');
            }

            const fs = require('fs');
            if (!fs.existsSync(tempFolderPath)) {
                fs.mkdirSync(tempFolderPath, { recursive: true });
                eagle.log.info(`创建临时文件夹: ${tempFolderPath}`);
            }

            return tempFolderPath;
        } catch (error) {
            eagle.log.error(`创建临时文件夹失败: ${error.message}`);
            throw error;
        }
    }

    // 检查临时文件夹大小和文件数量
    async checkTempFolderSize() {
        try {
            const tempFolderPath = this.getTempFolderPath();
            if (!tempFolderPath) {
                return { size: 0, count: 0, needsCleanup: false };
            }

            const fs = require('fs');
            const path = require('path');

            if (!fs.existsSync(tempFolderPath)) {
                return { size: 0, count: 0, needsCleanup: false };
            }

            let totalSize = 0;
            let fileCount = 0;

            const files = fs.readdirSync(tempFolderPath);
            for (const file of files) {
                const filePath = path.join(tempFolderPath, file);
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    totalSize += stats.size;
                    fileCount++;
                }
            }

            const sizeInMB = totalSize / (1024 * 1024);
            const needsCleanup = sizeInMB > 100 || fileCount > 100;

            eagle.log.debug(`临时文件夹状态 - 大小: ${sizeInMB.toFixed(2)}MB, 文件数: ${fileCount}, 需要清理: ${needsCleanup}`);

            return { size: sizeInMB, count: fileCount, needsCleanup };
        } catch (error) {
            eagle.log.error(`检查临时文件夹大小失败: ${error.message}`);
            return { size: 0, count: 0, needsCleanup: false };
        }
    }

    // 启动时预计算资源库大小
    startLibrarySizePreCalculation() {
        eagle.log.info('🚀 启动资源库大小预计算...');

        // 延迟2秒开始计算，更早开始预计算
        setTimeout(async () => {
            try {
                // 先获取基本的Eagle信息
                await this.updateEagleStatus();

                // 如果有有效的资源库路径，开始预计算
                if (this.eagleStatus.libraryPath &&
                    this.eagleStatus.libraryPath !== '未知' &&
                    this.eagleStatus.libraryPath !== '获取失败') {

                    this.librarySizeCalculation.isCalculating = true;
                    this.librarySizeCalculation.startTime = Date.now();

                    eagle.log.info(`📊 开始预计算资源库大小: "${this.eagleStatus.libraryPath}"`);

                    try {
                        const librarySize = await this.calculateLibrarySize(this.eagleStatus.libraryPath);

                        // 保存计算结果
                        this.librarySizeCalculation.result = librarySize;
                        this.librarySizeCalculation.isCompleted = true;
                        this.librarySizeCalculation.isCalculating = false;
                        this.librarySizeCalculation.lastCalculationTime = Date.now();

                        // 记录当前的修改时间
                        try {
                            this.librarySizeCalculation.lastModificationTime = eagle.library.modificationTime;
                            eagle.log.info(`📝 记录资源库修改时间: ${this.librarySizeCalculation.lastModificationTime}`);
                        } catch (modTimeError) {
                            eagle.log.warn(`获取资源库修改时间失败: ${modTimeError.message}`);
                        }

                        // 更新Eagle状态
                        this.eagleStatus.librarySize = librarySize;

                        const duration = Date.now() - this.librarySizeCalculation.startTime;
                        eagle.log.info(`✅ 资源库大小预计算完成: ${this.formatSize(librarySize)} (耗时: ${duration}ms)`);

                        // 显示预计算完成通知
                        this.showLibrarySizeCalculationNotification(librarySize, duration);

                    } catch (calcError) {
                        this.librarySizeCalculation.error = calcError.message;
                        this.librarySizeCalculation.isCalculating = false;
                        eagle.log.error(`❌ 资源库大小预计算失败: ${calcError.message}`);
                    }
                } else {
                    eagle.log.warn('⚠️ 无有效资源库路径，跳过预计算');
                }
            } catch (error) {
                eagle.log.error(`预计算启动失败: ${error.message}`);
            }
        }, 5000); // 延迟5秒
    }

    // 启动资源库变化监控
    startLibraryChangeMonitoring() {
        eagle.log.info('🔍 启动资源库变化监控...');

        // 每30分钟检查一次资源库是否有变化
        this.libraryMonitorTimer = setInterval(async () => {
            try {
                await this.checkLibraryChanges();
            } catch (error) {
                eagle.log.error(`资源库变化检查失败: ${error.message}`);
            }
        }, 30 * 60 * 1000); // 30分钟 = 30 * 60 * 1000毫秒

        eagle.log.info('✅ 资源库变化监控已启动 (每30分钟检查一次)');
    }

    // 检查资源库是否有变化
    async checkLibraryChanges() {
        try {
            // 获取当前的修改时间
            const currentModificationTime = eagle.library.modificationTime;

            if (!currentModificationTime) {
                eagle.log.warn('⚠️ 无法获取资源库修改时间，跳过变化检查');
                return;
            }

            eagle.log.debug(`🔍 检查资源库变化: 当前=${currentModificationTime}, 上次=${this.librarySizeCalculation.lastModificationTime}`);

            // 如果没有记录的修改时间，或者修改时间发生了变化
            if (!this.librarySizeCalculation.lastModificationTime ||
                currentModificationTime !== this.librarySizeCalculation.lastModificationTime) {

                eagle.log.info(`📝 检测到资源库变化! 修改时间: ${this.librarySizeCalculation.lastModificationTime} → ${currentModificationTime}`);

                // 重新计算资源库大小
                await this.recalculateLibrarySize();

            } else {
                eagle.log.debug('✅ 资源库无变化，跳过重新计算');
            }

        } catch (error) {
            eagle.log.error(`检查资源库变化失败: ${error.message}`);
        }
    }

    // 重新计算资源库大小
    async recalculateLibrarySize() {
        try {
            eagle.log.info('🔄 开始重新计算资源库大小...');

            // 标记为正在计算
            this.librarySizeCalculation.isCalculating = true;
            this.librarySizeCalculation.isCompleted = false;
            this.librarySizeCalculation.startTime = Date.now();

            // 获取资源库路径
            const libraryPath = this.eagleStatus.libraryPath;

            if (!libraryPath || libraryPath === '未知' || libraryPath === '获取失败') {
                eagle.log.warn('⚠️ 无有效资源库路径，无法重新计算大小');
                return;
            }

            // 计算新的大小
            const newLibrarySize = await this.calculateLibrarySize(libraryPath);
            const oldSize = this.librarySizeCalculation.result;

            // 更新结果
            this.librarySizeCalculation.result = newLibrarySize;
            this.librarySizeCalculation.isCompleted = true;
            this.librarySizeCalculation.isCalculating = false;
            this.librarySizeCalculation.lastCalculationTime = Date.now();
            this.librarySizeCalculation.lastModificationTime = eagle.library.modificationTime;

            // 更新Eagle状态
            this.eagleStatus.librarySize = newLibrarySize;

            const duration = Date.now() - this.librarySizeCalculation.startTime;
            const sizeDiff = newLibrarySize - oldSize;
            const diffText = sizeDiff > 0 ? `+${this.formatSize(sizeDiff)}` : this.formatSize(Math.abs(sizeDiff));

            eagle.log.info(`✅ 资源库大小重新计算完成:`);
            eagle.log.info(`   旧大小: ${this.formatSize(oldSize)}`);
            eagle.log.info(`   新大小: ${this.formatSize(newLibrarySize)}`);
            eagle.log.info(`   变化: ${diffText}`);
            eagle.log.info(`   耗时: ${duration}ms`);

            // 显示资源库变化通知
            this.showLibraryChangeNotification(oldSize, newLibrarySize, duration);

        } catch (error) {
            this.librarySizeCalculation.error = error.message;
            this.librarySizeCalculation.isCalculating = false;
            eagle.log.error(`❌ 重新计算资源库大小失败: ${error.message}`);
        }
    }

    // 停止资源库变化监控
    stopLibraryChangeMonitoring() {
        if (this.libraryMonitorTimer) {
            clearInterval(this.libraryMonitorTimer);
            this.libraryMonitorTimer = null;
            eagle.log.info('🛑 资源库变化监控已停止');
        }
    }

    // 异步计算资源库大小（不阻塞其他信息显示）
    async calculateLibrarySizeAsync(libraryPath) {
        try {
            eagle.log.info(`开始异步计算资源库大小，路径: "${libraryPath}"`);

            if (libraryPath && libraryPath !== '未知' && libraryPath !== '获取失败') {
                // 使用setTimeout让其他信息先显示
                setTimeout(async () => {
                    try {
                        const librarySize = await this.calculateLibrarySize(libraryPath);
                        this.eagleStatus.librarySize = librarySize;
                        eagle.log.info(`资源库大小计算完成: ${librarySize} bytes (${this.formatSize(librarySize)})`);
                    } catch (sizeError) {
                        eagle.log.error(`异步计算资源库大小失败: ${sizeError.message}`);
                        this.eagleStatus.librarySize = 0;
                    }
                }, 100); // 延迟100ms，让其他信息先显示
            } else {
                eagle.log.warn(`资源库路径无效，跳过大小计算: "${libraryPath}"`);
                this.eagleStatus.librarySize = 0;
            }
        } catch (error) {
            eagle.log.error(`异步计算资源库大小失败: ${error.message}`);
            this.eagleStatus.librarySize = 0;
        }
    }

    // 计算资源库大小
    async calculateLibrarySize(libraryPath) {
        try {
            if (!libraryPath || libraryPath === '未知' || libraryPath === '获取失败') {
                eagle.log.warn(`资源库路径无效，跳过大小计算: "${libraryPath}"`);
                return 0;
            }

            const fs = require('fs');
            const path = require('path');

            eagle.log.info(`准备计算资源库大小，路径: "${libraryPath}"`);

            // 验证路径是否存在
            if (!fs.existsSync(libraryPath)) {
                eagle.log.error(`资源库路径不存在: "${libraryPath}"`);

                // 尝试列出父目录内容以帮助调试
                try {
                    const parentDir = path.dirname(libraryPath);
                    if (fs.existsSync(parentDir)) {
                        const parentContents = fs.readdirSync(parentDir);
                        eagle.log.debug(`父目录 "${parentDir}" 内容: ${parentContents.join(', ')}`);
                    }
                } catch (debugError) {
                    eagle.log.debug(`无法读取父目录: ${debugError.message}`);
                }

                return 0;
            }

            // 检查是否为目录
            const pathStats = fs.statSync(libraryPath);
            if (!pathStats.isDirectory()) {
                eagle.log.error(`路径不是目录: "${libraryPath}"`);
                return 0;
            }

            eagle.log.info(`开始递归计算目录大小: "${libraryPath}"`);
            const startTime = Date.now();

            // 递归计算目录大小
            const calculateDirectorySize = (dirPath, depth = 0) => {
                let totalSize = 0;
                let fileCount = 0;
                let dirCount = 0;

                try {
                    const items = fs.readdirSync(dirPath);

                    for (const item of items) {
                        const itemPath = path.join(dirPath, item);
                        try {
                            const stats = fs.statSync(itemPath);

                            if (stats.isFile()) {
                                totalSize += stats.size;
                                fileCount++;

                                // 每1000个文件记录一次进度
                                if (fileCount % 1000 === 0) {
                                    eagle.log.debug(`已处理 ${fileCount} 个文件，当前大小: ${this.formatSize(totalSize)}`);
                                }
                            } else if (stats.isDirectory()) {
                                dirCount++;
                                totalSize += calculateDirectorySize(itemPath, depth + 1);
                            }
                        } catch (itemError) {
                            // 跳过无法访问的文件/文件夹，但记录详细信息
                            eagle.log.debug(`跳过无法访问的项目: "${itemPath}" - ${itemError.message}`);
                        }
                    }

                    // 在根目录级别记录统计信息
                    if (depth === 0) {
                        eagle.log.info(`目录统计 - 文件数: ${fileCount}, 子目录数: ${dirCount}`);
                    }

                } catch (dirError) {
                    eagle.log.warn(`无法读取目录: "${dirPath}" - ${dirError.message}`);
                }
                return totalSize;
            };

            const totalSize = calculateDirectorySize(libraryPath);
            const endTime = Date.now();
            const duration = endTime - startTime;

            eagle.log.info(`资源库大小计算完成: ${totalSize} bytes (${this.formatSize(totalSize)}), 耗时: ${duration}ms`);

            return totalSize;
        } catch (error) {
            eagle.log.error(`计算资源库大小失败: ${error.message}`);
            eagle.log.error(`错误堆栈: ${error.stack}`);
            return 0;
        }
    }

    // 格式化文件大小
    formatSize(bytes) {
        if (bytes === 0) return '0B';
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
    }

    // 清空临时文件夹
    async cleanupTempFolder() {
        try {
            const tempFolderPath = this.getTempFolderPath();
            if (!tempFolderPath) {
                eagle.log.warn('无法获取临时文件夹路径，跳过清理');
                return;
            }

            const fs = require('fs');
            const path = require('path');

            if (!fs.existsSync(tempFolderPath)) {
                eagle.log.info('临时文件夹不存在，无需清理');
                return;
            }

            const files = fs.readdirSync(tempFolderPath);
            let deletedCount = 0;

            for (const file of files) {
                const filePath = path.join(tempFolderPath, file);
                try {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                } catch (deleteError) {
                    eagle.log.warn(`删除临时文件失败: ${filePath} - ${deleteError.message}`);
                }
            }

            eagle.log.info(`临时文件夹清理完成，删除了 ${deletedCount} 个文件`);
        } catch (error) {
            eagle.log.error(`清空临时文件夹失败: ${error.message}`);
            throw error;
        }
    }

    // 打开临时文件夹
    async openTempFolder() {
        try {
            eagle.log.info('开始打开临时文件夹操作');
            eagle.log.debug(`当前Eagle状态 - tempPath: ${this.eagleStatus.tempPath}`);

            const tempFolderPath = this.getTempFolderPath();
            eagle.log.debug(`获取到的临时文件夹路径: ${tempFolderPath}`);

            if (!tempFolderPath) {
                const errorMsg = `无法获取临时文件夹路径 - eagleStatus.tempPath: ${this.eagleStatus.tempPath}`;
                eagle.log.error(errorMsg);
                throw new Error(errorMsg);
            }

            // 确保文件夹存在
            eagle.log.debug('创建临时文件夹...');
            await this.createTempFolder();

            // 检查Eagle shell API是否可用
            if (!eagle.shell || typeof eagle.shell.openPath !== 'function') {
                throw new Error('Eagle shell API不可用');
            }

            // 打开文件夹
            eagle.log.debug(`使用Eagle shell打开文件夹: ${tempFolderPath}`);
            eagle.shell.openPath(tempFolderPath);
            eagle.log.info(`临时文件夹已打开: ${tempFolderPath}`);
        } catch (error) {
            eagle.log.error(`打开临时文件夹失败: ${error.message}`);
            eagle.log.error(`错误堆栈: ${error.stack}`);
            throw error;
        }
    }

    // 处理重置AE连接状态请求
    async handleResetAEConnection(req, res) {
        try {
            this.log('🔄 收到重置AE连接状态请求', 'info');

            // 重置AE连接状态
            this.aeStatus.connected = false;
            this.lastAEMessageTime = null;

            this.log('✅ AE连接状态已重置', 'info');

            const response = {
                success: true,
                message: 'AE连接状态已重置，下次连接将显示通知'
            };

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(response));

        } catch (error) {
            this.log(`处理重置AE连接状态请求失败: ${error.message}`, 'error');
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
    }

    // 处理检查资源库变化请求
    async handleCheckLibraryChanges(req, res) {
        try {
            eagle.log.info('🔍 收到手动检查资源库变化请求');

            // 执行检查
            await this.checkLibraryChanges();

            // 返回当前状态
            const response = {
                success: true,
                data: {
                    lastModificationTime: this.librarySizeCalculation.lastModificationTime,
                    lastCalculationTime: this.librarySizeCalculation.lastCalculationTime,
                    currentSize: this.librarySizeCalculation.result,
                    formattedSize: this.formatSize(this.librarySizeCalculation.result),
                    isCalculating: this.librarySizeCalculation.isCalculating,
                    isCompleted: this.librarySizeCalculation.isCompleted
                }
            };

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(response));

        } catch (error) {
            eagle.log.error(`处理检查资源库变化请求失败: ${error.message}`);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
        }
    }

    // 处理临时文件夹操作请求
    async handleTempFolderAction(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                eagle.log.debug(`收到临时文件夹操作请求: ${body}`);

                const data = JSON.parse(body);
                const action = data.action;

                eagle.log.info(`执行临时文件夹操作: ${action}`);

                let result = { success: false };

                switch (action) {
                    case 'cleanupTempFolder':
                        await this.cleanupTempFolder();
                        result = { success: true, message: '临时文件夹已清空' };
                        break;

                    case 'openTempFolder':
                        await this.openTempFolder();
                        result = { success: true, message: '临时文件夹已打开' };
                        break;

                    case 'checkTempFolderSize':
                        const status = await this.checkTempFolderSize();
                        result = { success: true, data: status };
                        break;

                    case 'createTempFolder':
                        const tempPath = await this.createTempFolder();
                        result = { success: true, data: { path: tempPath } };
                        break;

                    default:
                        eagle.log.error(`未知的临时文件夹操作: ${action}`);
                        result = { success: false, error: `未知操作: ${action}` };
                }

                eagle.log.debug(`临时文件夹操作结果: ${JSON.stringify(result)}`);

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(result));

            } catch (error) {
                eagle.log.error(`临时文件夹操作处理失败: ${error.message}`);
                eagle.log.error(`错误堆栈: ${error.stack}`);

                const errorResponse = {
                    success: false,
                    error: error.message,
                    details: error.stack
                };

                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(errorResponse));
            }
        });
    }

    // 设置Eagle事件监听
    setupEventListeners() {
        // 监听文件选择变化（仅用于状态更新，不自动导出）
        setInterval(async () => {
            try {
                const selectedItems = await eagle.item.getSelected();
                if (JSON.stringify(selectedItems) !== JSON.stringify(this.selectedFiles)) {
                    this.selectedFiles = selectedItems;
                    // 文件选择变化使用debug级别，避免日志被占满
                    eagle.log.debug(`文件选择已更新: ${selectedItems.length} 个文件`);

                    // 只更新状态，不自动导出
                    // 用户需要主动点击插件才会导出
                }

                // 同时更新Eagle状态信息
                await this.updateEagleStatus();
            } catch (error) {
                // 静默处理，避免频繁错误日志
            }
        }, 1000);

        // 初始化时立即获取一次Eagle状态
        eagle.log.info('Eagle2AE插件初始化，开始获取Eagle状态信息');
        this.updateEagleStatus();
    }

    // 处理来自AE的消息
    handleAEMessage(message) {
        switch (message.type) {
            case 'ae_status':
                this.updateAEStatus(message.data);
                break;
            case 'import_result':
                this.handleImportResult(message.data);
                break;
            case 'error':
                this.log(`AE错误: ${message.data.message}`, 'error');
                break;
            default:
                this.log(`未知消息类型: ${message.type}`, 'warning');
        }
    }

    // 更新AE状态
    updateAEStatus(status) {
        const wasConnected = this.aeStatus.connected;

        // 添加详细的状态更新日志
        this.log(`🎯 更新AE状态 - 之前连接状态: ${wasConnected}`, 'info');
        this.log(`📋 AE状态数据: 项目=${status.projectName || '未知'}, 合成=${status.activeComp?.name || '无'}, 版本=${status.version || '未知'}`, 'info');

        // 检查是否是真正的新连接（基于项目变化或长时间未连接）
        const isNewConnection = !wasConnected ||
                               this.aeStatus.projectName !== status.projectName ||
                               !this.lastAEMessageTime ||
                               (Date.now() - this.lastAEMessageTime) > 60000; // 超过1分钟未收到消息

        this.aeStatus = { ...this.aeStatus, ...status, connected: true };
        this.lastAEMessageTime = Date.now();

        // 如果是新连接，显示通知
        if (isNewConnection) {
            this.log(`🎉 检测到新连接，准备显示通知 (原因: ${!wasConnected ? '首次连接' : this.aeStatus.projectName !== status.projectName ? '项目变化' : '长时间未连接'})`, 'info');
            this.showAEConnectionNotification(status);
        } else {
            this.log(`🔄 AE状态更新 (已连接状态)`, 'debug');
        }
    }

    // 显示AE连接成功通知
    showAEConnectionNotification(status) {
        try {
            if (typeof eagle !== 'undefined' && eagle.notification) {
                // 构建通知内容
                const projectName = status.projectName || '未知项目';
                const compName = status.activeComp?.name || '无合成';
                const aeVersion = status.version || '未知版本';

                eagle.notification.show({
                    title: '🎉 After Effects 已连接',
                    description: `项目: ${projectName}\n合成: ${compName}\n版本: ${aeVersion}`,
                    type: 'success',
                    duration: 8000 // 显示8秒
                });

                eagle.log.info(`✅ 显示AE连接成功通知: ${projectName} - ${compName}`);
            } else {
                eagle.log.warn('⚠️ Eagle通知API不可用，跳过连接通知');
            }
        } catch (error) {
            eagle.log.error(`显示AE连接通知失败: ${error.message}`);
        }
    }

    // 显示资源库大小计算完成通知
    showLibrarySizeCalculationNotification(librarySize, duration) {
        try {
            if (typeof eagle !== 'undefined' && eagle.notification) {
                const formattedSize = this.formatSize(librarySize);
                const durationText = duration > 1000 ? `${(duration/1000).toFixed(1)}秒` : `${duration}毫秒`;

                eagle.notification.show({
                    title: '📊 资源库大小计算完成',
                    description: `大小: ${formattedSize}\n耗时: ${durationText}\n已准备好与AE连接`,
                    type: 'info',
                    duration: 6000 // 显示6秒
                });

                eagle.log.info(`✅ 显示资源库大小计算完成通知: ${formattedSize}`);
            } else {
                eagle.log.warn('⚠️ Eagle通知API不可用，跳过计算完成通知');
            }
        } catch (error) {
            eagle.log.error(`显示资源库大小计算通知失败: ${error.message}`);
        }
    }

    // 显示资源库变化通知
    showLibraryChangeNotification(oldSize, newSize, duration) {
        try {
            if (typeof eagle !== 'undefined' && eagle.notification) {
                const oldFormattedSize = this.formatSize(oldSize);
                const newFormattedSize = this.formatSize(newSize);
                const sizeDiff = newSize - oldSize;
                const diffText = sizeDiff > 0 ? `+${this.formatSize(sizeDiff)}` : this.formatSize(Math.abs(sizeDiff));
                const durationText = duration > 1000 ? `${(duration/1000).toFixed(1)}秒` : `${duration}毫秒`;

                eagle.notification.show({
                    title: '🔄 资源库大小已更新',
                    description: `${oldFormattedSize} → ${newFormattedSize}\n变化: ${diffText}\n耗时: ${durationText}`,
                    type: 'info',
                    duration: 7000 // 显示7秒
                });

                eagle.log.info(`✅ 显示资源库变化通知: ${diffText}`);
            } else {
                eagle.log.warn('⚠️ Eagle通知API不可用，跳过变化通知');
            }
        } catch (error) {
            eagle.log.error(`显示资源库变化通知失败: ${error.message}`);
        }
    }

    // 处理导入结果
    handleImportResult(result) {
        if (result.success) {
            this.log(`成功导入 ${result.importedCount} 个文件到合成 "${result.targetComp}"`);
        } else {
            this.log(`导入失败: ${result.error}`, 'error');
        }
    }

    // 导出选中文件到AE
    async exportSelectedFiles() {
        if (this.selectedFiles.length === 0) {
            this.log('无法导出：未选择文件', 'warning');
            return;
        }

        try {
            this.log(`开始导出 ${this.selectedFiles.length} 个文件...`);

            // 准备文件信息
            const files = this.selectedFiles.map(file => ({
                path: file.filePath,
                name: file.name,
                type: this.getFileType(file.ext),
                ext: file.ext
            }));

            // 发送导入指令到AE
            const message = {
                type: 'import_files',
                data: {
                    files: files,
                    targetComp: this.aeStatus.activeComp?.name,
                    importOptions: {
                        createLayers: true,
                        arrangeInSequence: false
                    }
                }
            };

            this.sendToAE(message);
            this.log('导入指令已发送到AE');

        } catch (error) {
            this.log(`导出失败: ${error.message}`, 'error');
        }
    }

    // 发送消息到AE（Eagle WebSocket优先，HTTP兼容）
    sendToAE(message) {
        // 优先使用Eagle兼容WebSocket
        if (this.eagleWebSocket && this.eagleWebSocket.isEnabled) {
            const messageType = this.getWebSocketMessageType(message.type);
            const sentCount = this.eagleWebSocket.broadcast(messageType, message);

            if (sentCount > 0) {
                this.log(`Eagle WebSocket消息已发送: ${message.type} (${sentCount}个客户端)`, 'debug');
                return;
            }
        }

        // 回退到HTTP消息队列模式
        if (!this.messageQueue) {
            this.messageQueue = [];
        }
        this.messageQueue.push({
            ...message,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });

        // 限制队列长度
        if (this.messageQueue.length > 100) {
            this.messageQueue = this.messageQueue.slice(-50);
        }

        this.log(`消息已加入队列: ${message.type}`);
    }

    // 获取消息队列（兼容HTTP轮询）
    getMessageQueue() {
        const messages = [...this.messageQueue];
        this.messageQueue = []; // 清空队列
        return messages;
    }

    // 获取WebSocket消息类型映射
    getWebSocketMessageType(httpMessageType) {
        const typeMap = {
            'export': MESSAGE_TYPES.FILE.EXPORT_REQUEST,
            'import_files': MESSAGE_TYPES.FILE.EXPORT_REQUEST,
            'ae_status': MESSAGE_TYPES.STATUS.AE_STATUS,
            'config_update': MESSAGE_TYPES.CONFIG.CONFIG_CHANGED
        };

        return typeMap[httpMessageType] || httpMessageType;
    }

    // 获取消息队列
    getMessageQueue() {
        const messages = this.messageQueue || [];
        this.messageQueue = []; // 清空队列
        return messages;
    }

    // 获取文件类型
    getFileType(ext) {
        const imageExts = ['jpg', 'jpeg', 'png', 'tiff', 'tga', 'bmp', 'gif'];
        const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv'];
        const audioExts = ['mp3', 'wav', 'aac', 'flac', 'm4a'];

        ext = ext.toLowerCase();

        if (imageExts.includes(ext)) return 'image';
        if (videoExts.includes(ext)) return 'video';
        if (audioExts.includes(ext)) return 'audio';
        return 'other';
    }

    // UI模式下不需要这些方法，它们在service.js中实现

    // 更新状态显示
    updateStatus(elementId, text, statusClass = '') {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
            element.className = `status-value ${statusClass}`;
        }
    }

    // 记录日志
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const fullTimestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [Eagle2Ae] ${message}`;

        // 控制台日志（服务模式和UI模式都有）
        switch (type) {
            case 'error':
                console.error(logMessage);
                break;
            case 'warning':
                console.warn(logMessage);
                break;
            case 'success':
                console.log(`✅ ${logMessage}`);
                break;
            default:
                console.log(logMessage);
        }

        // UI日志（仅在UI模式下）
        if (this.uiMode && typeof document !== 'undefined') {
            const logOutput = document.getElementById('log-output');
            if (logOutput) {
                const logEntry = document.createElement('div');
                logEntry.className = `log-entry log-${type}`;
                logEntry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;

                logOutput.appendChild(logEntry);
                logOutput.scrollTop = logOutput.scrollHeight;

                // 限制日志条数
                while (logOutput.children.length > 50) {
                    logOutput.removeChild(logOutput.firstChild);
                }
            }
        }

        // 添加到日志队列，发送到AE扩展
        this.addToLogQueue({
            id: this.generateLogId(),
            timestamp: fullTimestamp,
            time: timestamp,
            message: message,
            type: type,
            source: 'eagle'
        });
    }

    // 添加日志到队列
    addToLogQueue(logEntry) {
        this.logQueue.push(logEntry);

        // 限制队列长度
        if (this.logQueue.length > this.maxLogQueue) {
            this.logQueue = this.logQueue.slice(-this.maxLogQueue);
        }

        // 启动日志发送（如果还没启动）
        this.startLogSending();
    }

    // 启动日志发送
    startLogSending() {
        if (this.logSendInterval) {
            return; // 已经在发送中
        }

        this.logSendInterval = setInterval(() => {
            this.sendLogsToAE();
        }, 2000); // 每2秒发送一次日志
    }

    // 发送日志到AE扩展
    async sendLogsToAE() {
        if (this.logQueue.length === 0) {
            return;
        }

        // 只发送未发送过的日志
        const unsent = this.logQueue.filter(log => !this.sentLogIds.has(log.id));
        if (unsent.length === 0) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:${this.config.wsPort}/eagle-logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    logs: unsent, // 只发送未发送的日志
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                // 发送成功，记录已发送的日志ID
                unsent.forEach(log => this.sentLogIds.add(log.id));

                // 清理已发送的日志（保留最近的一些日志用于重发）
                this.cleanupSentLogs();
            }
        } catch (error) {
            // 发送失败，保留日志队列，下次再试
            eagle.log.debug('发送日志到AE失败:', error.message);
        }
    }

    // 清理已发送的日志
    cleanupSentLogs() {
        // 保留最近20条日志，其余的可以清理
        if (this.logQueue.length > 20) {
            const toRemove = this.logQueue.slice(0, this.logQueue.length - 20);
            toRemove.forEach(log => this.sentLogIds.delete(log.id));
            this.logQueue = this.logQueue.slice(-20);
        }

        // 限制sentLogIds的大小，避免内存泄漏
        if (this.sentLogIds.size > 100) {
            const idsArray = Array.from(this.sentLogIds);
            const toKeep = idsArray.slice(-50);
            this.sentLogIds = new Set(toKeep);
        }
    }

    // 显示设置对话框
    showSettings() {
        const settingsHtml = `
            <div class="settings-dialog">
                <h3>插件设置</h3>
                <div class="setting-item">
                    <label>HTTP服务器端口:</label>
                    <input type="number" id="ws-port" value="${this.config.wsPort}" min="1024" max="65535">
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="auto-export" ${this.config.autoExport ? 'checked' : ''}>
                        自动导出选中文件
                    </label>
                </div>
                <div class="setting-item">
                    <label>目标目录:</label>
                    <input type="text" id="target-dir" value="${this.config.targetDirectory || ''}" placeholder="留空使用AE项目目录">
                    <button id="browse-dir">浏览</button>
                </div>
                <div class="setting-actions">
                    <button id="save-settings">保存</button>
                    <button id="cancel-settings">取消</button>
                </div>
            </div>
        `;

        // 创建设置对话框
        const overlay = document.createElement('div');
        overlay.className = 'settings-overlay';
        overlay.innerHTML = settingsHtml;
        document.body.appendChild(overlay);

        // 设置事件监听
        overlay.querySelector('#save-settings').addEventListener('click', () => {
            this.saveSettings(overlay);
        });

        overlay.querySelector('#cancel-settings').addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        overlay.querySelector('#browse-dir').addEventListener('click', () => {
            this.browseDirectory();
        });
    }

    // 保存设置
    saveSettings(overlay) {
        const wsPort = parseInt(overlay.querySelector('#ws-port').value);
        const autoExport = overlay.querySelector('#auto-export').checked;
        const targetDir = overlay.querySelector('#target-dir').value;

        // 验证端口
        if (wsPort < 1024 || wsPort > 65535) {
            alert('端口号必须在1024-65535之间');
            return;
        }

        // 更新配置
        const oldPort = this.config.wsPort;
        this.config.wsPort = wsPort;
        this.config.autoExport = autoExport;
        this.config.targetDirectory = targetDir || null;

        // 如果端口改变，重启HTTP服务器
        if (oldPort !== wsPort) {
            this.log('端口已更改，重启HTTP服务器...');
            if (this.httpServer) {
                this.httpServer.close();
            }
            setTimeout(() => {
                this.startHttpServer();
            }, 1000);
        }

        this.log('设置已保存');
        document.body.removeChild(overlay);
    }

    // 浏览目录
    browseDirectory() {
        try {
            const { dialog } = require('electron').remote;
            const result = dialog.showOpenDialogSync({
                properties: ['openDirectory'],
                title: '选择目标目录'
            });

            if (result && result.length > 0) {
                document.querySelector('#target-dir').value = result[0];
            }
        } catch (error) {
            this.log(`浏览目录失败: ${error.message}`, 'error');
        }
    }

    // 检查AE进程状态
    async checkAEProcess() {
        try {
            const { exec } = require('child_process');
            const os = require('os');

            return new Promise((resolve) => {
                let command;
                if (os.platform() === 'win32') {
                    command = 'tasklist /FI "IMAGENAME eq AfterFX.exe" /FO CSV /NH';
                } else if (os.platform() === 'darwin') {
                    command = 'ps aux | grep "After Effects" | grep -v grep';
                } else {
                    resolve(false);
                    return;
                }

                exec(command, (error, stdout) => {
                    if (error) {
                        resolve(false);
                        return;
                    }

                    const isRunning = stdout.trim().length > 0;
                    resolve(isRunning);
                });
            });
        } catch (error) {
            this.log(`检查AE进程失败: ${error.message}`, 'error');
            return false;
        }
    }

    // 定期检查AE状态
    startAEStatusCheck() {
        setInterval(async () => {
            const isRunning = await this.checkAEProcess();

            if (isRunning) {
                if (!this.aeStatus.connected) {
                    this.log('检测到AE正在运行，等待连接...');
                    if (this.uiMode) {
                        this.updateStatus('ae-status', 'AE运行中，等待连接', 'warning');
                    }
                }
            } else {
                if (this.aeStatus.connected) {
                    this.log('AE已关闭');
                    this.aeStatus.connected = false;
                }
                if (this.uiMode) {
                    this.updateStatus('ae-status', 'AE未运行', 'disconnected');
                }
                if (this.aeConnection) {
                    this.aeConnection = null;
                }
            }
        }, 5000); // 每5秒检查一次
    }

    // 处理选中的文件（服务模式下的核心功能）
    async handleSelectedFiles(selectedItems) {
        try {
            this.selectedFiles = selectedItems.map(item => ({
                id: item.id,
                name: item.name,
                path: item.filePath,
                ext: item.ext,
                size: item.size,
                tags: item.tags || []
            }));

            this.log(`已选择 ${this.selectedFiles.length} 个文件`);

            // 检查AE连接状态
            if (!this.aeStatus.connected) {
                this.log('AE未连接，尝试建立连接...', 'warning');
                // 这里可以尝试重新连接AE
                return;
            }

            // 发送文件到AE
            await this.sendFilesToAE();

        } catch (error) {
            this.log(`处理选中文件失败: ${error.message}`, 'error');
        }
    }

    // 发送文件到AE
    async sendFilesToAE() {
        if (this.selectedFiles.length === 0) {
            this.log('没有选中的文件', 'warning');
            return;
        }

        try {
            this.log(`开始发送 ${this.selectedFiles.length} 个文件到AE...`);

            // 直接调用文件导出处理
            this.handleFileExport({
                files: this.selectedFiles,
                timestamp: Date.now()
            });

        } catch (error) {
            this.log(`发送文件到AE失败: ${error.message}`, 'error');
        }
    }

    // 处理文件导出（核心导出逻辑）
    handleFileExport(data) {
        try {
            this.log(`开始处理 ${data.files.length} 个文件的导出...`);
            this.log(`当前导入模式: ${this.importSettings.mode}`, 'info');

            // 更新选中文件列表
            this.selectedFiles = data.files;

            // 准备导出消息
            const exportData = {
                files: data.files.map(file => ({
                    name: file.name,
                    path: file.path,
                    ext: file.ext,
                    size: file.size,
                    tags: file.tags || [],
                    width: file.width,
                    height: file.height,
                    annotation: file.annotation || ''
                })),
                settings: this.importSettings, // 包含导入设置
                timestamp: data.timestamp,
                projectInfo: this.aeStatus.projectPath ? {
                    path: this.aeStatus.projectPath,
                    comp: this.aeStatus.activeComp
                } : null
            };

            // 优先使用WebSocket实时发送
            if (this.webSocketServer && this.webSocketServer.isRunning) {
                const sentCount = this.webSocketServer.broadcast(MESSAGE_TYPES.FILE.EXPORT_REQUEST, exportData);

                if (sentCount > 0) {
                    this.log(`✅ 文件导出请求已通过WebSocket发送到 ${sentCount} 个AE客户端`, 'success');
                    return;
                }
            }

            // 回退到HTTP消息队列模式
            const exportMessage = {
                type: 'export',
                ...exportData
            };

            this.messageQueue.push(exportMessage);

            // 限制消息队列长度
            if (this.messageQueue.length > 10) {
                this.messageQueue = this.messageQueue.slice(-10);
            }

            this.log(`文件导出请求已加入HTTP队列，等待AE扩展轮询...`, 'success');
            this.log(`队列中有 ${this.messageQueue.length} 个待处理消息`);

        } catch (error) {
            this.log(`处理文件导出失败: ${error.message}`, 'error');
        }
    }

    // 处理Eagle发送的日志
    handleEagleLogs(logs) {
        if (!Array.isArray(logs)) {
            return;
        }

        // 添加到Eagle日志数组
        this.eagleLogs.push(...logs);

        // 限制日志数量（保留最近200条）
        if (this.eagleLogs.length > 200) {
            this.eagleLogs = this.eagleLogs.slice(-200);
        }

        // 按时间戳排序
        this.eagleLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    // 生成唯一的日志ID
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 清理日志队列
    clearLogQueue() {
        const clearedLogQueueCount = this.logQueue.length;
        const clearedEagleLogsCount = this.eagleLogs.length;

        // 清理所有日志相关数据
        this.logQueue = [];
        this.eagleLogs = []; // 同时清理Eagle日志历史
        this.sentLogIds.clear();

        // 强制清理后添加一条确认日志
        this.log(`🧹 Eagle日志已完全清理 - 队列: ${clearedLogQueueCount} 条, 历史: ${clearedEagleLogsCount} 条`, 'success');
        this.log(`✅ 日志系统已优化，现在只显示重要操作`, 'info');
    }

    // 处理设置同步
    handleSettingsSync(data) {
        if (data.type === 'settings_update' && data.settings) {
            this.importSettings = { ...this.importSettings, ...data.settings };
            // 设置更新不记录到日志，避免日志被占满
            // 只在控制台输出用于调试
            console.log(`导入设置已更新: ${data.settings.mode} 模式`);

            // 保存设置到本地存储
            this.saveImportSettings();
        }

        // 处理端口配置同步
        if (data.preferences && data.preferences.communicationPort) {
            const newPort = data.preferences.communicationPort;
            if (newPort !== this.config.wsPort && newPort >= 1024 && newPort <= 65535) {
                this.log(`接收到端口配置更新: ${this.config.wsPort} -> ${newPort}`, 'info');

                const oldPort = this.config.wsPort;
                this.config.wsPort = newPort;

                // 保存新端口配置
                this.savePortConfig();

                // 重启服务器
                this.restartServer(oldPort, newPort);
            }
        }
    }

    // 保存导入设置
    saveImportSettings() {
        try {
            localStorage.setItem('eagle2ae_importSettings', JSON.stringify(this.importSettings));
        } catch (error) {
            this.log(`保存导入设置失败: ${error.message}`, 'warning');
        }
    }

    // 强制隐藏窗口
    forceHideWindow() {
        console.log('强制隐藏窗口...');

        // 立即隐藏DOM
        if (document.body) {
            document.body.style.display = 'none';
            document.body.style.visibility = 'hidden';
            document.body.style.opacity = '0';
            document.body.style.position = 'absolute';
            document.body.style.left = '-9999px';
            document.body.style.top = '-9999px';
            document.body.style.width = '1px';
            document.body.style.height = '1px';
        }

        // 隐藏HTML元素
        if (document.documentElement) {
            document.documentElement.style.display = 'none';
            document.documentElement.style.visibility = 'hidden';
        }

        // 尝试Eagle API隐藏窗口
        const hideAttempts = [
            () => {
                if (typeof eagle !== 'undefined' && eagle.window) {
                    if (eagle.window.hide) eagle.window.hide();
                    if (eagle.window.minimize) eagle.window.minimize();
                    if (eagle.window.setVisible) eagle.window.setVisible(false);
                    if (eagle.window.setAlwaysOnTop) eagle.window.setAlwaysOnTop(false);
                    if (eagle.window.setSkipTaskbar) eagle.window.setSkipTaskbar(true);
                }
            },
            () => {
                // 尝试通过window对象隐藏
                if (window.hide) window.hide();
                if (window.minimize) window.minimize();
            },
            () => {
                // 尝试移动窗口到屏幕外
                if (window.moveTo) window.moveTo(-9999, -9999);
                if (window.resizeTo) window.resizeTo(1, 1);
            }
        ];

        hideAttempts.forEach((attempt, index) => {
            try {
                attempt();
                // 窗口隐藏操作不记录到日志，避免日志被占满
                console.log(`窗口隐藏尝试 ${index + 1} 执行`);
            } catch (error) {
                // 只有失败时才记录到日志
                this.log(`窗口隐藏尝试 ${index + 1} 失败: ${error.message}`, 'warning');
            }
        });

        // 立即多次尝试隐藏
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.forceHideWindowDelayed();
            }, i * 10); // 每10ms尝试一次，共100ms内尝试10次
        }

        // 定期检查并隐藏 - 避免重复创建定时器
        if (!this.hideInterval) {
            this.hideInterval = setInterval(() => {
                this.ensureWindowHidden();
            }, 1000); // 减少到1秒检查一次
        }
    }

    // 延迟隐藏窗口
    forceHideWindowDelayed() {
        try {
            if (typeof eagle !== 'undefined' && eagle.window) {
                if (eagle.window.hide) eagle.window.hide();
                if (eagle.window.setVisible) eagle.window.setVisible(false);
            }
            // 延迟窗口隐藏成功不记录到日志，避免日志被占满
            console.log('延迟窗口隐藏执行完成');
        } catch (error) {
            // 只有失败时才记录到日志
            this.log(`延迟窗口隐藏失败: ${error.message}`, 'warning');
        }
    }

    // 确保窗口保持隐藏
    ensureWindowHidden() {
        try {
            if (document.body && document.body.style.display !== 'none') {
                document.body.style.display = 'none';
                document.body.style.visibility = 'hidden';
                this.log('重新隐藏窗口DOM', 'info');
            }

            if (typeof eagle !== 'undefined' && eagle.window) {
                if (eagle.window.setVisible) eagle.window.setVisible(false);
            }
        } catch (error) {
            // 静默处理错误，避免日志过多
        }
    }

    // 加载导入设置
    loadImportSettings() {
        try {
            const stored = localStorage.getItem('eagle2ae_importSettings');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.importSettings = { ...this.importSettings, ...parsed };
                console.log('已加载导入设置');
            }
        } catch (error) {
            this.log(`加载导入设置失败: ${error.message}`, 'warning');
        }
    }

    // 加载端口配置
    loadPortConfig() {
        try {
            console.log('正在加载端口配置...');

            // 强制使用8080端口，忽略之前保存的配置
            const defaultPort = 8080;
            if (this.config.wsPort !== defaultPort) {
                console.log(`强制重置端口: ${this.config.wsPort} -> ${defaultPort}`);
                this.config.wsPort = defaultPort;
                this.log(`🔧 端口已重置为默认值: ${defaultPort}`, 'info');
            }

            // 清除可能导致端口变化的旧配置
            try {
                localStorage.removeItem('eagle2ae_portConfig');
                console.log('已清除旧的端口配置');
            } catch (e) {
                console.log('清除旧配置失败:', e.message);
            }

            console.log(`Eagle扩展将在端口 ${this.config.wsPort} 上启动`);
            this.log(`📋 使用固定端口: ${this.config.wsPort}`, 'info');
        } catch (error) {
            this.log(`❌ 加载端口配置失败: ${error.message}，使用默认端口 ${this.config.wsPort}`, 'warning');
        }
    }

    // 保存端口配置
    savePortConfig() {
        try {
            // 强制保存8080端口
            const defaultPort = 8080;
            const portConfig = {
                communicationPort: defaultPort,
                timestamp: Date.now()
            };
            localStorage.setItem('eagle2ae_portConfig', JSON.stringify(portConfig));
            this.log(`端口配置已保存: ${defaultPort}`, 'info');

            // 确保当前配置也是8080
            if (this.config.wsPort !== defaultPort) {
                this.config.wsPort = defaultPort;
                console.log(`端口配置已同步为: ${defaultPort}`);
            }
        } catch (error) {
            this.log(`保存端口配置失败: ${error.message}`, 'warning');
        }
    }

    // 确保端口配置存在（首次运行时创建默认配置）
    ensurePortConfigExists() {
        try {
            const stored = localStorage.getItem('eagle2ae_portConfig');
            if (!stored) {
                this.log('首次运行，创建默认端口配置...', 'info');
                this.savePortConfig();
            }
        } catch (error) {
            this.log(`检查端口配置失败: ${error.message}`, 'warning');
        }
    }

    // 启动AE端口检测和自动匹配
    startAEPortDetection() {
        console.log('启动AE端口检测服务...');

        // 每10秒检测一次AE扩展
        this.aeDetectionInterval = setInterval(() => {
            this.detectAndMatchAEPort();
        }, 10000);

        // 立即执行一次检测
        setTimeout(() => {
            this.detectAndMatchAEPort();
        }, 2000);
    }

    // 检测AE扩展端口并自动匹配
    async detectAndMatchAEPort() {
        try {
            // 检测常用端口上的AE扩展
            const commonPorts = [8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089];
            const currentEaglePort = this.config.wsPort;

            for (const port of commonPorts) {
                if (port === currentEaglePort) {
                    continue; // 跳过自己的端口
                }

                try {
                    // 尝试检测AE扩展的特征请求
                    const response = await fetch(`http://localhost:${port}/ae-status`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        signal: AbortSignal.timeout(1000) // 1秒超时
                    });

                    if (response.ok) {
                        // 这可能是AE扩展在尝试连接
                        this.log(`🔍 检测到可能的AE扩展活动在端口 ${port}`, 'info');

                        // 检查是否需要切换端口
                        if (port !== currentEaglePort) {
                            this.log(`💡 发现AE扩展期望的端口: ${port}，当前Eagle端口: ${currentEaglePort}`, 'info');
                            await this.switchToMatchAEPort(port);
                            return;
                        }
                    }
                } catch (error) {
                    // 静默处理，继续检测下一个端口
                }
            }

        } catch (error) {
            // 静默处理检测错误
        }
    }

    // 切换Eagle端口以匹配AE扩展
    async switchToMatchAEPort(targetPort) {
        try {
            this.log(`🔄 自动切换Eagle端口: ${this.config.wsPort} -> ${targetPort}`, 'info');

            const oldPort = this.config.wsPort;
            this.config.wsPort = targetPort;

            // 保存新端口配置
            this.savePortConfig();

            // 重启服务器到新端口
            await this.restartServer(oldPort, targetPort);

            this.log(`✅ Eagle扩展已自动切换到端口 ${targetPort} 以匹配AE扩展`, 'success');

        } catch (error) {
            this.log(`❌ 自动端口切换失败: ${error.message}`, 'error');
        }
    }

    // 处理AE扩展发送的端口信息
    async handleAEPortInfo(data) {
        if (data.source === 'ae_extension' && data.aePort) {
            const aePort = data.aePort;
            const currentEaglePort = this.config.wsPort;

            this.log(`📡 接收到AE扩展端口信息: ${aePort}`, 'info');

            if (aePort !== currentEaglePort) {
                this.log(`🔄 AE扩展期望端口 ${aePort}，当前Eagle端口 ${currentEaglePort}`, 'info');
                this.log(`💡 自动切换Eagle端口以匹配AE扩展...`, 'info');

                // 自动切换到AE扩展的端口
                await this.switchToMatchAEPort(aePort);
            } else {
                this.log(`✅ Eagle端口 ${currentEaglePort} 已与AE扩展匹配`, 'success');
            }
        }
    }

    // 重启服务器（WebSocket优先）
    async restartServer(oldPort, newPort) {
        try {
            this.log(`正在重启服务器: ${oldPort} -> ${newPort}`, 'info');

            // 关闭现有WebSocket服务器
            if (this.webSocketServer) {
                await this.webSocketServer.stop();
                this.webSocketServer = null;
            }

            // 关闭现有HTTP服务器
            if (this.httpServer) {
                this.httpServer.close(() => {
                    this.log(`已关闭端口 ${oldPort} 上的HTTP服务器`, 'info');
                });
                this.httpServer = null;
            }

            // 等待一秒后启动新服务器
            setTimeout(async () => {
                await this.startServer();
                this.log(`服务器已在端口 ${newPort} 上重新启动`, 'success');
            }, 1000);

        } catch (error) {
            this.log(`重启服务器失败: ${error.message}`, 'error');
        }
    }

    // 重启HTTP服务器（兼容方法）
    async restartHttpServer(oldPort, newPort) {
        return this.restartServer(oldPort, newPort);
    }

    // 处理复制到剪贴板的请求
    async handleCopyToClipboard(req, res) {
        this.log('📋 收到复制到剪贴板的HTTP请求', 'info');

        try {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    this.log(`📋 解析请求数据: ${body}`, 'info');
                    const data = JSON.parse(body);

                    if (data.type === 'copy_files' && data.filePaths && Array.isArray(data.filePaths)) {
                        this.log(`📋 收到复制请求，文件数量: ${data.filePaths.length}`, 'info');
                        this.log(`📋 文件列表: ${data.filePaths.join(', ')}`, 'info');

                        // 验证文件路径
                        const validPaths = [];
                        const fs = require('fs');
                        const path = require('path');

                        for (let filePath of data.filePaths) {
                            try {
                                // 处理URL编码的路径
                                if (filePath.includes('%')) {
                                    try {
                                        filePath = decodeURIComponent(filePath);
                                        this.log(`🔄 解码文件路径: ${filePath}`, 'info');
                                    } catch (decodeError) {
                                        this.log(`⚠️ 路径解码失败: ${filePath}`, 'warning');
                                    }
                                }

                                // 规范化路径格式
                                filePath = path.normalize(filePath);

                                // 检查文件是否存在
                                if (fs.existsSync(filePath)) {
                                    validPaths.push(filePath);
                                    this.log(`✅ 文件存在: ${filePath}`, 'info');
                                } else {
                                    this.log(`⚠️ 文件不存在: ${filePath}`, 'warning');

                                    // 尝试查找可能的文件名变体
                                    const dir = path.dirname(filePath);
                                    const basename = path.basename(filePath, path.extname(filePath));
                                    const ext = path.extname(filePath);

                                    if (fs.existsSync(dir)) {
                                        const files = fs.readdirSync(dir);
                                        const possibleFile = files.find(f =>
                                            f.toLowerCase().includes(basename.toLowerCase()) &&
                                            f.endsWith(ext)
                                        );

                                        if (possibleFile) {
                                            const alternativePath = path.join(dir, possibleFile);
                                            validPaths.push(alternativePath);
                                            this.log(`🔍 找到替代文件: ${alternativePath}`, 'info');
                                        }
                                    }
                                }
                            } catch (error) {
                                this.log(`❌ 检查文件失败: ${filePath} - ${error.message}`, 'error');
                            }
                        }

                        if (validPaths.length === 0) {
                            throw new Error('没有找到有效的文件');
                        }

                        // 使用Eagle的clipboard API复制文件
                        try {
                            await eagle.clipboard.copyFiles(validPaths);

                            this.log(`🎉 成功复制 ${validPaths.length} 个文件到剪贴板`, 'success');

                            // 显示系统通知
                            if (typeof eagle !== 'undefined' && eagle.notification) {
                                eagle.notification.show({
                                    title: 'Eagle2Ae',
                                    body: `已复制 ${validPaths.length} 个文件到剪贴板`,
                                    mute: false,
                                    duration: 3000
                                });
                            }

                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                success: true,
                                message: `成功复制 ${validPaths.length} 个文件到剪贴板`,
                                copiedCount: validPaths.length,
                                totalCount: data.filePaths.length
                            }));
                        } catch (clipboardError) {
                            throw new Error(`剪贴板操作失败: ${clipboardError.message}`);
                        }
                    } else {
                        throw new Error('无效的复制请求格式');
                    }
                } catch (parseError) {
                    this.log(`复制请求解析失败: ${parseError.message}`, 'error');
                    this.log(`请求数据: ${body}`, 'error');
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: `请求解析失败: ${parseError.message}`,
                        details: `请求数据: ${body.substring(0, 200)}...`
                    }));
                }
            });
        } catch (error) {
            this.log(`处理复制请求失败: ${error.message}`, 'error');
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: `服务器错误: ${error.message}`
            }));
        }
    }
}

// 全局实例
let eagle2ae = null;

// Eagle插件事件处理
eagle.onPluginCreate((plugin) => {
    eagle.log.info('Eagle2Ae 插件初始化（服务模式）');
    eagle.log.debug('插件信息:', plugin);

    // 创建主实例（自动检测UI/服务模式）
    eagle2ae = new Eagle2Ae();

    // 启动信息简化
    eagle.log.info(eagle2ae.uiMode ? 'Eagle2Ae UI 面板已启动' : 'Eagle2Ae 后台服务已启动');
});

eagle.onPluginRun(async () => {
    const triggerTime = Date.now();
    console.log('Eagle2Ae 插件运行 - 触发时间:', new Date(triggerTime).toLocaleTimeString());

    if (eagle2ae) {
        // 记录触发详情用于调试
        const timeSinceInit = triggerTime - eagle2ae.initStartTime;
        console.log(`插件运行触发详情: 初始化=${eagle2ae.isInitializing}, 距离启动=${Math.round(timeSinceInit/1000)}s, UI模式=${eagle2ae.uiMode}`);
        // 在服务模式下，检查是否为用户主动操作
        if (!eagle2ae.uiMode) {
            const currentTime = Date.now();

            // 检查是否正在初始化（防止启动时意外触发）
            if (eagle2ae.isInitializing) {
                const timeSinceInit = currentTime - eagle2ae.initStartTime;
                eagle2ae.log(`插件正在初始化中，已忽略操作 (${Math.round(timeSinceInit/1000)}s/${Math.round(eagle2ae.minInitTime/1000)}s)`, 'warning');
                return;
            }

            // 检查是否在冷却时间内（防止重复触发）
            if (currentTime - eagle2ae.lastUserAction < eagle2ae.userActionCooldown) {
                eagle2ae.log('操作过于频繁，已忽略', 'warning');
                return;
            }

            // 记录用户操作时间
            eagle2ae.lastUserAction = currentTime;

            eagle2ae.log('检测到用户点击插件，准备导出...');

            // 立即隐藏任何可能显示的UI
            setTimeout(() => {
                try {
                    if (typeof eagle !== 'undefined' && eagle.window) {
                        if (eagle.window.hide) eagle.window.hide();
                        if (eagle.window.close) eagle.window.close();
                    }
                } catch (error) {
                    console.log('隐藏窗口失败:', error);
                }
            }, 50);

            // 获取当前选中的文件
            const selectedItems = await eagle.item.getSelected();
            if (selectedItems && selectedItems.length > 0) {
                eagle2ae.log(`发现 ${selectedItems.length} 个选中文件，确认导出...`);

                // 显示确认通知，给用户一个明确的提示
                if (typeof eagle !== 'undefined' && eagle.notification) {
                    eagle.notification.show({
                        title: 'Eagle2Ae - 用户操作确认',
                        body: `正在导出 ${selectedItems.length} 个文件到After Effects...`,
                        mute: false,
                        duration: 4000
                    });
                }

                // 立即执行导出操作
                eagle2ae.log('开始执行导出操作...');
                await eagle2ae.handleSelectedFiles(selectedItems);

            } else {
                eagle2ae.log('未发现选中文件，请先在Eagle中选择要导出的文件', 'warning');

                // 显示系统通知
                if (typeof eagle !== 'undefined' && eagle.notification) {
                    eagle.notification.show({
                        title: 'Eagle2Ae',
                        body: '请先选择要导出的文件',
                        mute: false,
                        duration: 3000
                    });
                }
            }
        } else {
            eagle2ae.log('UI面板已显示');
            eagle2ae.refreshServiceStatus();
        }
    }
});

eagle.onPluginShow(() => {
    eagle.log.debug('Eagle2Ae 插件显示');

    // 在服务模式下，立即强制隐藏窗口
    if (eagle2ae && !eagle2ae.uiMode) {
        eagle2ae.log('服务模式：检测到窗口显示，立即强制隐藏');

        // 立即隐藏，不等待
        eagle2ae.forceHideWindow();

        // 多次尝试隐藏
        [50, 100, 200, 500, 1000].forEach(delay => {
            setTimeout(() => {
                eagle2ae.forceHideWindowDelayed();
            }, delay);
        });

    } else if (eagle2ae && eagle2ae.uiMode) {
        eagle2ae.log('UI面板已显示');
        eagle2ae.refreshServiceStatus();
    }
});

eagle.onPluginHide(() => {
    eagle.log.debug('Eagle2Ae 插件隐藏');
    if (eagle2ae && eagle2ae.uiMode) {
        eagle2ae.log('UI面板已隐藏');
    }
});

eagle.onPluginBeforeExit((event) => {
    eagle.log.info('Eagle2Ae 插件退出');
    if (eagle2ae) {
        eagle2ae.log('插件正在退出...');

        // 停止资源库变化监控
        eagle2ae.stopLibraryChangeMonitoring();

        // 清理HTTP服务器
        if (eagle2ae.httpServer) {
            eagle2ae.httpServer.close();
        }

        // 清理轮询定时器
        if (eagle2ae.pollInterval) {
            clearInterval(eagle2ae.pollInterval);
        }

        // 清理端口注册文件
        if (eagle2ae.portAllocator) {
            eagle2ae.portAllocator.cleanup();
        }
    }
});