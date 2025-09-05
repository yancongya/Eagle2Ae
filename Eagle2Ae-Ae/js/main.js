// Eagle2Ae - After Effects CEP扩展
// 与Eagle插件进行手动控制的HTTP通信

// 导入项目状态检测器
// 注意：在HTML中通过script标签加载
// <script src="./js/services/ProjectStatusChecker.js"></script>

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

        // WebSocket客户端
        this.webSocketClient = null;
        this.useWebSocket = false; // 暂时禁用原生WebSocket
        this.fallbackToHttp = true; // 使用HTTP兼容模式

        // 端口发现服务（暂时禁用以提高启动性能）
        this.portDiscovery = null;
        this.enablePortDiscovery = false; // 禁用端口发现以避免启动延迟
        this.clientId = `ae_client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`; // 客户端ID

        // 轮询管理（HTTP兼容模式）
        this.pollingManager = new PollingManager(() => this.pollMessages(), 500);

        // 连接监控
        this.connectionMonitor = new ConnectionMonitor();

        // 临时禁用连接时的文件夹检查，以解决性能问题
        this.disableConnectionTimeChecks = true;

        this.currentProject = {
            path: null,
            name: null,
            activeComp: null
        };

        // 消息去重
        this.processedMessages = new Set();
        this.lastPollTime = 0;
        
        // 防重复导入机制
        this.lastImportSignature = null;
        this.lastImportTime = 0;

        // 日志管理
        this.logManager = new LogManager();
        this.currentLogView = 'ae'; // 'ae' 或 'eagle'
        this.eagleLogs = [];
        this.aeLogs = [];
        this.ignoreEagleLogsUntil = null; // 用于清理后忽略历史日志

        // 配置日志管理器
        this.setupLogManager();

        // 设置管理
        this.settingsManager = new SettingsManager();

        // 临时文件夹状态缓存
        this.tempFolderStatusCache = {
            data: null,
            timestamp: 0,
            cacheTime: 30000 // 30秒缓存
        };
        this.settingsPanel = null;
        this.quickSettingsInitialized = false;
        
        // 资源库大小更新定时器
        this.librarySizeTimer = null;

        // 文件处理器
        this.fileHandler = new FileHandler(this.settingsManager, this.csInterface, this.log.bind(this));

        // 项目状态检测器
        this.projectStatusChecker = new ProjectStatusChecker(this.csInterface, this.log.bind(this));

        // 音效播放器
        this.soundPlayer = new SoundPlayer();

        // 异步初始化
        this.asyncInit();
    }

    // 异步初始化方法
    async asyncInit() {
        // 先执行同步初始化
        this.init();

        // 然后执行异步的端口初始化
        await this.initializePort();

        // 启动端口广播服务
        this.startPortBroadcast();

        // 获取AE版本信息（仅在CEP环境下）
        if (!window.__DEMO_MODE_ACTIVE__) {
            this.getAEVersion();
        }

        // 启动定期更新阅后即焚tooltip
        this.startTooltipUpdateTimer();
    }

    // 初始化端口设置
    async initializePort() {
        // 检查是否启用端口发现
        if (this.enablePortDiscovery && this.portDiscovery) {
            await this.updateEagleUrlWithDiscovery();
        } else {
            // 直接使用配置端口，避免端口发现的延迟
            const preferences = this.settingsManager.getPreferences();
            this.updateEagleUrl(preferences.communicationPort);
            this.log('使用配置端口，跳过端口发现以提高启动性能', 'info');
        }
    }

    // 启动端口广播服务
    startPortBroadcast() {
        // 静默启动端口广播服务

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
                    // 在演示模式下静默处理
                    if (!window.__DEMO_MODE_ACTIVE__) {
                        this.log(`📡 已向Eagle扩展(端口${port})广播AE端口信息: ${currentAEPort}`, 'info');
                    }
                    // 找到一个Eagle扩展就够了，停止广播
                    break;
                }
            } catch (error) {
                // 静默处理，继续尝试下一个端口
            }
        }
    }

    /**
     * 异步函数：从剪贴板读取内容（使用 @crosscopy/clipboard 库）
     * @returns {Promise<string|null>} 返回剪贴板中的文本内容，如果出错则返回 null
     */
    async handleClipboardPaste(event) {
        try {
            // 防止在输入框中触发
            if (event.target && (
                event.target.tagName === 'INPUT' ||
                event.target.tagName === 'TEXTAREA' ||
                event.target.contentEditable === 'true'
            )) {
                return;
            }

            this.log('检测到剪贴板粘贴操作', 'debug');

            let clipboardData = null;

            // 尝试从事件获取剪贴板数据
            if (event.clipboardData) {
                clipboardData = event.clipboardData;
            } else {
                // 尝试使用现代剪贴板API
                try {
                    const clipboardItems = await navigator.clipboard.read();
                    if (clipboardItems && clipboardItems.length > 0) {
                        // 构造类似clipboardData的对象
                        clipboardData = {
                            files: [],
                            types: [],
                            getData: () => ''
                        };

                        // 首先尝试获取文本信息，可能包含文件名
                        let possibleFileName = null;
                        for (const item of clipboardItems) {
                            if (item.types.includes('text/plain')) {
                                try {
                                    const text = await item.getType('text/plain');
                                    const textContent = await text.text();
                                    // 检查文本是否像文件路径
                                    const filePathMatch = textContent.match(/([^\\\\/]+\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg))$/i);
                                    if (filePathMatch) {
                                        possibleFileName = filePathMatch[1];
                                    }
                                } catch (e) {
                                    // 忽略文本获取错误
                                }
                            }
                        }

                        for (const item of clipboardItems) {
                            for (const type of item.types) {
                                clipboardData.types.push(type);
                                if (type.startsWith('image/')) {
                                    const blob = await item.getType(type);
                                    const ext = type.split('/')[1] === 'jpeg' ? 'jpg' : type.split('/')[1];

                                    // 智能文件名选择
                                    let fileName;
                                    if (possibleFileName && this.isValidImageFileName(possibleFileName)) {
                                        // 使用检测到的原始文件名
                                        fileName = possibleFileName;
                                    } else {
                                        // 使用通用名称，将被标记为临时文件
                                        fileName = `clipboard_image.${ext}`;
                                    }

                                    const file = new File([blob], fileName, { type });
                                    clipboardData.files.push(file);
                                }
                            }
                        }
                    }
                } catch (clipboardError) {
                    this.log(`无法访问剪贴板API: ${clipboardError.message}`, 'debug');
                }
            }

            if (!clipboardData) {
                this.log('无法获取剪贴板数据', 'debug');
                return;
            }

            // 检测剪贴板内容
            const clipboardContent = await this.detectClipboardContent(clipboardData);

            if (clipboardContent && clipboardContent.files.length > 0) {
                this.log(`检测到剪贴板中有 ${clipboardContent.files.length} 个可导入文件`, 'info');

                // 预处理文件名称，在显示对话框时就显示最终名称
                const processedFiles = clipboardContent.files.map(file => {
                    if (file.isTemporary && !file.hasOriginalName) {
                        // 只有临时文件且没有原始名称时才重命名
                        const ext = this.getFileExtension(file.name);
                        const newName = this.generateTimestampFilename(ext);

                        return {
                            ...file,
                            displayName: newName, // 用于显示的名称
                            originalName: file.name, // 保存原始名称
                            name: newName, // 更新实际名称
                            isTemporary: true,
                            wasRenamed: true // 标记已重命名
                        };
                    } else if (file.hasOriginalName) {
                        // 有原始名称的文件，保持原名
                        return {
                            ...file,
                            displayName: file.name,
                            hasOriginalName: true
                        };
                    }
                    return {
                        ...file,
                        displayName: file.name
                    };
                });

                this.showClipboardConfirmDialog({ ...clipboardContent, files: processedFiles });
            } else {
                this.log('剪贴板中没有可导入的内容', 'debug');
            }

        } catch (error) {
            this.log(`处理剪贴板粘贴失败: ${error.message}`, 'error');
        }
    }

    // 检测剪贴板内容
    async detectClipboardContent(clipboardData) {
        try {
            const result = {
                files: [],
                hasImages: false,
                hasFilePaths: false
            };

            // 检查文件
            if (clipboardData.files && clipboardData.files.length > 0) {
                const files = Array.from(clipboardData.files);
                for (const file of files) {
                    if (this.isImportableFile(file)) {
                        const fileName = file.path || file.name;
                        // 改进的临时文件检测逻辑
                        const isTemp = this.isTemporaryFileEnhanced(fileName);

                        result.files.push({
                            name: file.name,
                            path: file.path || file.name,
                            size: file.size,
                            type: file.type,
                            lastModified: file.lastModified || Date.now(),
                            isClipboardImport: true,
                            isTemporary: isTemp,
                            hasOriginalName: !isTemp, // 如果不是临时文件，说明有原始名称
                            file: file, // 保存原始文件对象
                            confirmed: false // 标记为未确认，防止在用户确认前写入磁盘
                        });
                        result.hasImages = true;
                    }
                }
            }

            // 检查文本内容（可能包含文件路径）
            if (clipboardData.getData) {
                const textData = clipboardData.getData('text/plain') || '';
                if (textData.trim()) {
                    const filePaths = this.extractFilePathsFromText(textData);
                    if (filePaths.length > 0) {
                        result.hasFilePaths = true;
                        // 这里可以进一步处理文件路径，但需要文件系统访问权限
                        this.log(`检测到 ${filePaths.length} 个文件路径`, 'debug');
                    }
                }
            }

            return result.files.length > 0 ? result : null;

        } catch (error) {
            this.log(`检测剪贴板内容失败: ${error.message}`, 'error');
            return null;
        }
    }

    // 检查文件是否可导入
    isImportableFile(file) {
        if (!file || (!file.type && !file.name)) return false;

        // 通过MIME类型检测
        if (file.type) {
            const importableTypes = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp',
                'image/tiff', 'image/webp', 'image/svg+xml', 'image/x-targa',
                'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm',
                'video/x-msvideo', 'video/quicktime', 'video/x-ms-wmv',
                'audio/mp3', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg',
                'audio/mpeg', 'audio/x-wav', 'audio/x-aiff'
            ];
            
            if (importableTypes.some(type => file.type.startsWith(type.split('/')[0]))) {
                return true;
            }
        }

        // 通过文件扩展名检测（用于没有MIME类型的情况）
        if (file.name) {
            const ext = this.getFileExtension(file.name).toLowerCase();
            const supportedExts = [
                // 图片格式
                'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg',
                'tga', 'psd', 'ai', 'eps', 'pdf', 'exr', 'hdr', 'dpx', 'cin',
                // 视频格式
                'mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'mxf', 'r3d',
                'cinema', 'c4d', 'prores', 'dnxhd', 'h264', 'h265', 'hevc',
                // 音频格式
                'mp3', 'wav', 'aac', 'flac', 'm4a', 'aiff', 'ogg', 'wma',
                // 项目文件
                'aep', 'aet'
            ];
            
            return supportedExts.includes(ext);
        }

        return false;
    }

    // 获取文件类型分类
    getFileCategory(file) {
        const type = file.type || '';
        const name = file.name || '';
        const ext = this.getFileExtension(name).toLowerCase();

        // 图片格式
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg', 'tga', 'psd', 'ai', 'eps', 'pdf', 'exr', 'hdr', 'dpx', 'cin'];
        // 视频格式
        const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'mxf', 'r3d', 'cinema', 'c4d', 'prores', 'dnxhd', 'h264', 'h265', 'hevc'];
        // 音频格式
        const audioExts = ['mp3', 'wav', 'aac', 'flac', 'm4a', 'aiff', 'ogg', 'wma'];
        // 设计文件
        const designExts = ['psd', 'ai', 'eps', 'pdf', 'sketch', 'fig', 'xd'];
        // 项目文件
        const projectExts = ['aep', 'aet'];

        // 根据MIME类型判断
        if (type.startsWith('image/')) return 'image';
        if (type.startsWith('video/')) return 'video';
        if (type.startsWith('audio/')) return 'audio';

        // 根据扩展名判断
        if (imageExts.includes(ext)) return 'image';
        if (videoExts.includes(ext)) return 'video';
        if (audioExts.includes(ext)) return 'audio';
        if (designExts.includes(ext)) return 'design';
        if (projectExts.includes(ext)) return 'project';

        return 'unknown';
    }

    // 获取文件类型字符串
    getFileType(file) {
        const type = file.type || '';
        const name = file.name || '';
        const ext = this.getFileExtension(name).toLowerCase();

        // 根据MIME类型判断
        if (type.startsWith('image/')) {
            return type.split('/')[1] || ext || 'image';
        }
        if (type.startsWith('video/')) {
            return type.split('/')[1] || ext || 'video';
        }
        if (type.startsWith('audio/')) {
            return type.split('/')[1] || ext || 'audio';
        }

        // 根据扩展名返回具体类型
        if (ext) {
            return ext;
        }

        // 如果都没有，返回通用类型
        return type || 'unknown';
    }





    // 初始化扩展
    init() {
        // 静默初始化

        try {
            // 分步初始化，避免单个错误影响整个初始化过程
            try {
                this.setupUI();
                // UI设置完成
            } catch (uiError) {
                this.log(`UI设置失败: ${uiError.message}`, 'error');
                // UI设置失败不影响快速设置初始化
            }

            // 立即获取AE信息，不依赖连接状态
            try {
                this.getAEVersion();
                this.updateAEInfoOnStartup();
                this.log('AE信息已在启动时获取', 'info');
            } catch (aeError) {
                this.log(`获取AE信息失败: ${aeError.message}`, 'warning');
            }

            // 初始化端口发现服务（仅在启用时）
            if (this.enablePortDiscovery) {
                try {
                    this.portDiscovery = new PortDiscovery(this.log.bind(this));
                    this.log('端口发现服务已初始化', 'info');
                } catch (portError) {
                    this.log(`端口发现服务初始化失败: ${portError.message}`, 'error');
                }
            } else {
                this.log('端口发现服务已禁用，使用配置端口以提高启动性能', 'info');
            }

            // 强制初始化快速设置，不依赖setupUI的结果
            // 静默初始化快速设置
            this.quickSettingsInitialized = true; // 先设置为true

            try {
                this.setupQuickSettings(); // 尝试正常初始化
            } catch (quickError) {
                this.log(`快速设置正常初始化失败: ${quickError.message}`, 'warning');
                // 即使失败也继续，因为我们有自动修复机制
            }

            // 延迟自动修复机制
            setTimeout(() => {
                // 静默启动快速设置自动修复检查

                // 强制重新绑定事件监听器
                try {
                    this.rebindQuickSettingsEventListeners();
                    // 快速设置事件监听器已重新绑定
                } catch (bindError) {
                    this.log(`事件监听器绑定失败: ${bindError.message}`, 'error');
                }

                // 加载快速设置UI
                try {
                    this.loadQuickSettings();
                    // 快速设置UI已加载
                } catch (loadError) {
                    this.log(`快速设置UI加载失败: ${loadError.message}`, 'error');
                }

                // 确保初始化状态为true
                this.quickSettingsInitialized = true;
                // 快速设置初始化状态已锁定

            }, 2000); // 延迟2秒，确保DOM完全加载

            // 快速设置设置完成

            // 继续其他初始化
            try {
                this.startProjectMonitoring();
                this.updateConnectionUI();
                this.updateLogControls();
                this.initializeLatestLogDisplay();

                // 添加拖拽支持
                this.setupDragAndDrop();
                // 拖拽支持已启用

                // 添加剪贴板导入支持
                this.setupClipboardListener();
                // 剪贴板导入支持已启用

                // 测试ExtendScript环境并加载JSX脚本
                this.testBasicExtendScript();

                // 延迟检查临时文件夹状态（等待连接稳定后再检查，避免影响启动性能）
                setTimeout(() => {
                    this.checkAndCleanupTempFolderOnStartup();
                }, 15000); // 延长到15秒，确保连接完全稳定
            } catch (otherError) {
                this.log(`其他初始化失败: ${otherError.message}`, 'error');
            }

            // 初始化完成
        } catch (error) {
            this.log(`AE扩展初始化失败: ${error.message}`, 'error');
            console.error('AE扩展初始化详细错误:', error);

            // 即使初始化失败，也尝试修复快速设置
            setTimeout(() => {
                this.log('尝试紧急修复快速设置...', 'warning');
                this.quickSettingsInitialized = true;
                try {
                    this.rebindQuickSettingsEventListeners();
                    this.log('✅ 紧急修复完成', 'success');
                } catch (emergencyError) {
                    this.log(`紧急修复失败: ${emergencyError.message}`, 'error');
                }
            }, 3000);
        }
    }

    // 设置UI事件
    setupUI() {
        // 安全获取所有按钮元素
        const buttons = {
            testConnection: document.getElementById('test-connection-btn'),
            settings: document.getElementById('settings-btn'),
            clearLog: document.getElementById('clear-log-btn'),
            logSwitch: document.getElementById('log-switch-btn'),
            logPanelToggle: document.getElementById('log-panel-toggle'),
            detectLayers: document.getElementById('detect-layers-btn'),
            exportLayers: document.getElementById('export-layers-btn'),
            exportToEagle: document.getElementById('export-to-eagle-btn'),
            debugTest: document.getElementById('debug-test-btn'),

        };

        // 安全绑定事件监听器
        if (buttons.testConnection) {
            // 左键点击：连接/断开切换
            buttons.testConnection.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleConnectionToggle();
            });

            // 右键点击：刷新状态和测试JSX连接
            buttons.testConnection.addEventListener('contextmenu', async (e) => {
                e.preventDefault();
                this.log('🔄 手动刷新项目状态和测试JSX连接', 'info');

                // 首先测试JSX脚本连接
                try {
                    this.log('🧪 测试JSX脚本连接...', 'info');
                    const jsxOk = await this.testExtendScriptConnection();
                    if (!jsxOk) {
                        this.log('⚠️ JSX脚本连接失败，尝试重新加载...', 'warning');
                        this.loadJSXScript();
                        return;
                    }
                } catch (jsxError) {
                    this.log(`❌ JSX脚本测试失败: ${jsxError.message}`, 'error');
                    this.log('🔄 尝试重新测试ExtendScript环境...', 'info');
                    this.testBasicExtendScript();
                    return;
                }

                // 然后刷新项目状态
                try {
                    const projectInfo = await this.refreshProjectInfo();
                    if (projectInfo.activeComp && projectInfo.activeComp.name) {
                        this.logSuccess(`✅ 当前活动合成: ${projectInfo.activeComp.name}`);
                    } else {
                        this.logWarning('⚠️ 未检测到活动合成');
                    }
                } catch (error) {
                    this.logError(`刷新失败: ${error.message}`);
                }
            });
        } else {
            this.log('⚠️ 找不到测试连接按钮', 'warning');
        }

        // 调试设置、断开连接、刷新状态按钮已移除，功能整合到连接状态按钮中

        if (buttons.settings) {
            buttons.settings.addEventListener('click', () => {
                this.showSettingsPanel();
            });
        }

        if (buttons.detectLayers) {
            buttons.detectLayers.addEventListener('click', () => {
                this.detectLayers();
            });
        }

        if (buttons.exportLayers) {
            buttons.exportLayers.addEventListener('click', () => {
                this.exportLayers();
            });
        }

        if (buttons.exportToEagle) {
            buttons.exportToEagle.addEventListener('click', () => {
                this.exportToEagle();
            });
        }
        if (buttons.debugTest) {
            buttons.debugTest.addEventListener('click', () => {
                this.runDebugAndTest();
            });
        }

        // 剪贴板测试按钮已移除

        if (buttons.clearLog) {
            buttons.clearLog.addEventListener('click', () => {
                this.clearLog();
            });
        }

        // 获取其他UI元素
        const logTitle = document.getElementById('log-title');

        if (buttons.logSwitch) {
            buttons.logSwitch.addEventListener('click', () => {
                this.switchLogView();
            });
        }

        if (logTitle) {
            logTitle.addEventListener('click', () => {
                this.switchLogView();
            });
        }

        if (buttons.logPanelToggle) {
            buttons.logPanelToggle.addEventListener('click', () => {
                this.toggleLogPanel();
            });
        }

        // 设置面板事件（使用try-catch保护）
        try {
            this.setupSettingsPanel();
        } catch (error) {
            this.log(`设置面板初始化失败: ${error.message}`, 'error');
        }
    }

    // 处理连接切换（点击连接按钮）
    async handleConnectionToggle() {
        switch (this.connectionState) {
            case ConnectionState.DISCONNECTED:
            case ConnectionState.ERROR:
                // 未连接或错误状态时，尝试连接
                await this.testConnection();
                break;
            case ConnectionState.CONNECTED:
                // 已连接时，断开连接
                this.disconnect();
                break;
            case ConnectionState.CONNECTING:
                // 连接中时，取消连接
                this.disconnect();
                break;
        }
    }

    // 配置日志管理器
    setupLogManager() {
        // 设置静默模式的消息模式（减少重复日志）
        this.logManager.addSilentPattern('WebSocket消息已发送');
        this.logManager.addSilentPattern('HTTP消息已发送');
        this.logManager.addSilentPattern('已同步到高级设置面板');
        this.logManager.addSilentPattern('已同步到快速设置面板');
        this.logManager.addSilentPattern('设置说明:');
        this.logManager.addSilentPattern(/文件\d+:/); // 文件列表日志
        this.logManager.addSilentPattern(/选项 \d+ \(/); // 选项检查日志

        // 设置日志级别（可以根据需要调整）
        this.logManager.setLogLevel('info'); // 只显示info及以上级别
    }

    // 测试连接到Eagle（WebSocket优先）
    async testConnection() {
        if (this.connectionState === ConnectionState.CONNECTING) {
            this.log('连接正在进行中...', 'warning');
            return;
        }

        this.setConnectionState(ConnectionState.CONNECTING);
        this.log('正在测试连接到Eagle...', 'info');

        // 优先尝试WebSocket连接
        if (this.useWebSocket) {
            try {
                await this.connectWebSocket();
                return;
            } catch (error) {
                this.log(`WebSocket连接失败: ${error.message}`, 'warning');
                if (this.fallbackToHttp) {
                    this.log('回退到HTTP轮询模式...', 'info');
                    await this.connectHttp();
                } else {
                    throw error;
                }
            }
        } else {
            await this.connectHttp();
        }
    }

    // WebSocket连接
    async connectWebSocket() {
        const wsUrl = `ws://localhost:${this.currentPort}/ws`;

        if (!this.webSocketClient) {
            this.webSocketClient = new Eagle2AeWebSocketClient(wsUrl, this);
        }

        await this.webSocketClient.connect();

        // 连接成功
        this.setConnectionState(ConnectionState.CONNECTED);
        this.log(`✅ WebSocket连接成功！`, 'success');

        // 播放连接成功音效
        this.playConnectionSound('linked');

        // 发送AE状态
        this.sendAEStatus();
        
        // 立即获取Eagle基本信息（不包括资源库大小）
        this.updateEagleBasicInfo();
        
        // 延迟获取资源库大小
        this.scheduleLibrarySizeUpdate();
    }

    // HTTP连接（兼容模式）
    async connectHttp() {
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

            if (data.pong !== true || data.service !== 'Eagle2Ae') {
                throw new Error('无效的响应格式或服务标识不匹配');
            }

            // 记录连接质量
            const pingTime = this.connectionMonitor.recordPing(startTime);

            // 连接成功
            this.setConnectionState(ConnectionState.CONNECTED);
            this.log(`HTTP连接成功！延迟: ${pingTime}ms`, 'success');

            // 播放连接成功音效
            this.playConnectionSound('linked');

            // 启动轮询
            this.pollingManager.start();

            // 发送AE状态
            this.sendAEStatus();

            // 立即获取Eagle基本信息（不包括资源库大小）
            this.updateEagleBasicInfo();
            
            // 延迟获取资源库大小
            this.scheduleLibrarySizeUpdate();

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

        // 断开WebSocket连接
        if (this.webSocketClient) {
            this.webSocketClient.disconnect();
        }

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

    // WebSocket连接成功回调
    onWebSocketConnected() {
        this.log('WebSocket连接已建立', 'success');
        // 连接状态已在connectWebSocket中设置
    }

    // WebSocket连接断开回调
    onWebSocketDisconnected() {
        this.log('WebSocket连接已断开', 'warning');
        if (this.connectionState === ConnectionState.CONNECTED) {
            this.setConnectionState(ConnectionState.DISCONNECTED);
        }
    }

    // 处理Eagle状态更新（WebSocket）
    handleEagleStatus(status) {
        this.log('收到Eagle状态更新', 'debug');
        // 更新Eagle信息UI
        if (status && status.eagleStatus) {
            this.updateEagleUI(status.eagleStatus);
        }
    }

    // 处理配置变更（WebSocket）
    handleConfigChange(config) {
        this.log('收到配置变更通知', 'info');
        // 可以在这里处理配置变更
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

        // 清除所有状态类
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
        }

        switch (this.connectionState) {
            case ConnectionState.DISCONNECTED:
                if (statusIndicator) statusIndicator.classList.add('disconnected');
                if (statusMain) statusMain.textContent = '未连接';
                if (pingTime) pingTime.textContent = '--ms';

                if (testConnectionBtn) {
                    testConnectionBtn.disabled = false;
                    testConnectionBtn.title = '左键：连接到Eagle\n右键：刷新状态';
                }
                break;

            case ConnectionState.CONNECTING:
                if (statusIndicator) statusIndicator.classList.add('connecting');
                if (statusMain) statusMain.textContent = '连接中';
                if (pingTime) pingTime.textContent = '--ms';

                if (testConnectionBtn) {
                    testConnectionBtn.disabled = false;
                    testConnectionBtn.title = '左键：取消连接\n右键：刷新状态';
                }
                break;

            case ConnectionState.CONNECTED:
                if (statusIndicator) statusIndicator.classList.add('connected');
                if (statusMain) statusMain.textContent = '已连接';
                if (pingTime) {
                    const avgPing = this.connectionMonitor ? this.connectionMonitor.getAveragePing() : 0;
                    pingTime.textContent = avgPing > 0 ? `${avgPing}ms` : '--ms';
                }

                if (testConnectionBtn) {
                    testConnectionBtn.disabled = false;
                    testConnectionBtn.title = '左键：断开连接\n右键：刷新状态';
                }

                // 连接成功后更新阅后即焚tooltip（进一步延迟，避免影响连接性能）
                setTimeout(() => {
                    this.updateBurnAfterReadingTooltip();
                }, 60000); // 延迟60秒，确保连接完全稳定且Eagle预计算完成后再检查
                break;

            case ConnectionState.ERROR:
                if (statusIndicator) statusIndicator.classList.add('error');
                if (statusMain) statusMain.textContent = '连接失败';
                if (pingTime) pingTime.textContent = '--ms';

                if (testConnectionBtn) {
                    testConnectionBtn.disabled = false;
                    testConnectionBtn.title = '左键：重试连接\n右键：刷新状态';
                }
                break;
        }

        // 连接状态变化时更新阅后即焚tooltip（仅在非连接状态时立即更新，连接状态时已有延迟更新）
        if (this.connectionState !== ConnectionState.CONNECTED) {
            this.updateBurnAfterReadingTooltip();
        }
    }

    // 轮询获取消息
    async pollMessages() {
        if (this.connectionState !== ConnectionState.CONNECTED) {
            return;
        }

        try {
            // 添加客户端ID参数，支持Eagle兼容WebSocket
            const response = await fetch(`${this.eagleUrl}/messages?clientId=${this.clientId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // 检查是否支持WebSocket兼容模式
            if (data.websocketCompatible && !this.websocketCompatibleLogged) {
                this.log('✅ 检测到Eagle兼容WebSocket模式', 'success');
                this.websocketCompatibleLogged = true;
            }

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

            // 每2秒获取一次Eagle状态信息（提高更新频率以便更快显示计算结果）
            const now = Date.now();
            if (!this.lastEagleStatusUpdate || now - this.lastEagleStatusUpdate > 2000) {
                this.updateEagleStatusFromServer();
                this.lastEagleStatusUpdate = now;
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
            this.logManager.clear(); // 清理LogManager
            this.log('AE日志已清理', 'info');
        } else {
            // 清理Eagle日志
            this.eagleLogs = [];
            // 立即更新显示
            this.updateLogDisplay();
            // 通知Eagle端清理其日志队列
            this.requestEagleClearLogs();
            console.log('Eagle日志已清理');
            return; // 避免重复调用updateLogDisplay
        }

        this.updateLogDisplay();
    }

    // 便捷的日志方法
    logInfo(message, options = {}) {
        this.log(message, 'info', options);
    }

    logSuccess(message, options = {}) {
        this.log(message, 'success', options);
    }

    logWarning(message, options = {}) {
        this.log(message, 'warning', options);
    }

    logError(message, options = {}) {
        this.log(message, 'error', options);
    }

    logDebug(message, options = {}) {
        this.log(message, 'debug', options);
    }

    // 分组日志方法
    logGroup(groupName, messages, level = 'info', collapsed = true) {
        messages.forEach((message, index) => {
            this.log(message, level, {
                group: groupName,
                collapsed: collapsed,
                groupEnd: index === messages.length - 1
            });
        });
    }

    // 请求Eagle端清理日志队列
    async requestEagleClearLogs() {
        if (this.connectionState !== ConnectionState.CONNECTED) {
            return;
        }

        try {
            const response = await fetch(`${this.eagleUrl}/clear-logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('已通知Eagle端清理日志队列:', result.message);

                // 设置一个标记，短时间内忽略来自Eagle的历史日志
                this.ignoreEagleLogsUntil = Date.now() + 3000; // 3秒内忽略
            }
        } catch (error) {
            console.error('通知Eagle端清理日志失败:', error);
        }
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
            case 'eagle_import_result':
                // 处理Eagle导入结果
                this.handleEagleImportResult(message.data || message);
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
        const requestId = message.requestId || null;
        const timestamp = message.timestamp || Date.now();

        // 检测导入类型
        const isDragImport = message.isDragImport || message.source === 'drag_drop';
        const isClipboardImport = message.isClipboardImport || message.source === 'clipboard_import';
        const isSequenceImport = message.type === 'import_sequence';
        const isFolderImport = message.type === 'import_folder';
        
        // 处理序列帧导入
        if (isSequenceImport && message.sequence) {
            // 确定使用的设置：合并Eagle设置和本地最新设置
            let effectiveSettings;
            const localSettings = this.settingsManager.getSettings();

            if (messageSettings) {
                // 使用Eagle设置作为基础，但用本地设置覆盖关键选项
                effectiveSettings = {
                    ...messageSettings,
                    // 强制使用本地的时间轴设置（用户可能刚刚更改过）
                    timelineOptions: localSettings.timelineOptions,
                    addToComposition: localSettings.addToComposition
                };
                this.log(`使用Eagle设置: ${messageSettings.mode} 模式，时间轴: ${effectiveSettings.timelineOptions.placement}`, 'info');
            } else {
                effectiveSettings = localSettings;
                this.log(`使用本地设置: ${effectiveSettings.mode} 模式，时间轴: ${effectiveSettings.timelineOptions.placement}`, 'info');
            }
            
            return await this.handleSequenceImportToAE(message.sequence, effectiveSettings);
        }
        
        // 处理文件夹导入
        if (isFolderImport && message.folder) {
            return await this.handleFolderImportToAE(message.folder);
        }
        
        // 防重复导入机制（仅对Eagle导出请求生效，不影响拖拽和剪贴板导入）
        if (!isDragImport && !isClipboardImport && files.length > 0) {
            const fileSignature = this.generateFileSignature(files);
            
            // 检查是否为重复请求（10秒内相同文件列表）
            if (this.lastImportSignature === fileSignature && 
                (timestamp - this.lastImportTime) < 10000) {
                this.log('检测到重复导入请求，已忽略', 'warning');
                return { success: false, error: '重复请求已忽略', importedCount: 0 };
            }
            
            // 更新防重复记录
            this.lastImportSignature = fileSignature;
            this.lastImportTime = timestamp;
        }

        let importSource = 'Eagle导出';
        if (isDragImport) {
            importSource = '拖拽导入';
        } else if (isClipboardImport) {
            importSource = '剪贴板导入';
        }

        // 拖拽导入和剪贴板导入使用简化日志
        if (isDragImport || isClipboardImport) {
            const icon = isClipboardImport ? '📋' : '🎯';
            this.log(`${icon} ${importSource}: ${files.length} 个文件`, 'info');
        } else {
            this.log(`收到${importSource}请求: ${files.length} 个文件`, 'info');
        }

        if (files.length === 0) {
            this.log('没有文件需要导入', 'warning');
            return;
        }

        try {
            // 导入前刷新项目信息，确保导入到正确的合成
            this.log('🔄 导入前刷新项目状态...', 'info');

            let currentProjectInfo = null;
            try {
                await this.refreshProjectInfo();
                currentProjectInfo = await this.getProjectInfo();
            } catch (projectError) {
                this.log(`⚠️ 获取项目信息失败: ${projectError.message}`, 'warning');

                // 对于剪贴板导入，提供特殊的错误处理
                if (isClipboardImport) {
                    this.log('💡 剪贴板导入提示：', 'info');
                    this.log('1. 请确保After Effects已打开并有活动项目', 'info');
                    this.log('2. 请确保JSX脚本已正确加载', 'info');
                    this.log('3. 尝试重新加载扩展或重启After Effects', 'info');

                    // 尝试重新加载JSX脚本
                    this.log('🔄 尝试重新加载JSX脚本...', 'info');
                    this.loadJSXScript();

                    throw new Error('无法获取After Effects项目信息，请检查AE状态后重试');
                }

                // 对于其他导入类型，使用原有的错误处理
                throw projectError;
            }

            // 显示当前导入目标信息并进行安全检查
            if (currentProjectInfo.activeComp && currentProjectInfo.activeComp.name) {
                this.log(`📍 导入目标: ${currentProjectInfo.activeComp.name}`, 'info');
            } else {
                this.logWarning('⚠️ 未检测到活动合成，请确保已选择要导入的合成');

                // 获取当前设置以检查是否需要添加到合成
                const currentSettings = this.settingsManager.getSettings();
                
                // 检查是否需要添加到合成
                if (currentSettings.addToComposition) {
                    this.logWarning('💡 建议操作：');
                    this.logWarning('1. 在AE中选择或创建一个合成');
                    this.logWarning('2. 确保该合成处于活动状态');
                    this.logWarning('3. 然后重新尝试导入');

                    // 根据导入类型显示不同的提示文本
                    const dialogTitle = isDragImport ? '请选择合成' : '导入确认';
                    let dialogMessage;
                    
                    if (isDragImport) {
                        dialogMessage = '请选择合成后操作\n\n文件将被导入到选中的合成中。';
                    } else {
                        dialogMessage = '未检测到活动合成，是否仍要继续导入？\n\n注意：导入可能会失败或导入到错误的位置。';
                    }
                    
                    // 使用ExtendScript的Panel样式确认对话框
                    // 正确转义字符串中的特殊字符
                    const escapedTitle = dialogTitle.replace(/"/g, '\\"').replace(/\n/g, '\\n');
                    const escapedMessage = dialogMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n');
                    
                    if (isDragImport) {
                        // 拖拽导入时显示警告对话框，只有确定按钮
                        const warningScript = `showPanelWarningDialog("${escapedTitle}", "${escapedMessage}");`;
                        this.csInterface.evalScript(warningScript);
                        this.log('拖拽导入被阻止：未选择活动合成', 'warning');
                        return { success: false, error: '请选择合成后操作' };
                    } else {
                        // 非拖拽导入时显示确认对话框
                        const confirmScript = `showPanelConfirmDialog("${escapedTitle}", "${escapedMessage}", ["继续导入", "取消"]);`;
                        const dialogResult = this.csInterface.evalScript(confirmScript);
                        
                        // 解析对话框结果（0=继续导入，1=取消）
                        const shouldContinue = parseInt(dialogResult) === 0;
                        if (!shouldContinue) {
                            this.log('用户取消导入', 'info');
                            return { success: false, error: '用户取消导入：未选择活动合成' };
                        }
                    }
                } else if (isDragImport) {
                    // 拖拽导入时，如果不需要添加到合成，给出友好提示但继续执行
                    this.logWarning('💡 拖拽导入提示：');
                    this.logWarning('文件将被导入到项目中，如需添加到合成，请先选择合成后重新拖拽');
                }
            }

            // 确定使用的设置：合并Eagle设置和本地最新设置
            let effectiveSettings;
            const localSettings = this.settingsManager.getSettings();

            if (messageSettings) {
                // 使用Eagle设置作为基础，但用本地设置覆盖关键选项
                effectiveSettings = {
                    ...messageSettings,
                    // 强制使用本地的时间轴设置（用户可能刚刚更改过）
                    timelineOptions: localSettings.timelineOptions,
                    addToComposition: localSettings.addToComposition
                };
                this.log(`使用Eagle设置: ${messageSettings.mode} 模式，时间轴: ${effectiveSettings.timelineOptions.placement}`, 'info');
            } else {
                effectiveSettings = localSettings;
                this.log(`使用本地设置: ${effectiveSettings.mode} 模式，时间轴: ${effectiveSettings.timelineOptions.placement}`, 'info');
            }

            // 临时更新文件处理器的设置管理器
            const originalSettings = this.settingsManager.getSettings();
            if (messageSettings) {
                this.settingsManager.settings = messageSettings;
            }

            // 记录文件路径信息用于调试（拖拽导入和剪贴板导入时简化）
            if (!isDragImport && !isClipboardImport) {
                files.forEach((file, index) => {
                    this.log(`文件${index + 1}: ${file.name} -> ${file.path}`, 'info');
                });
            }

            // 为拖拽导入和剪贴板导入设置静默模式
            if (isDragImport || isClipboardImport) {
                this.fileHandler.setQuietMode(true);
            }

            // 使用文件处理器处理导入，传递有效设置
            // 对于拖拽导入，跳过合成检查（因为已在handleEagleDragImport中进行了项目状态检查）
            const skipCompositionCheck = isDragImport;
            const result = await this.fileHandler.handleImportRequest(files, currentProjectInfo, effectiveSettings, skipCompositionCheck);

            // 恢复正常模式
            if (isDragImport || isClipboardImport) {
                this.fileHandler.setQuietMode(false);
            }

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
                if (isDragImport) {
                    // 在演示模式下显示Eagle的虚拟反馈
                    if (window.__DEMO_MODE_ACTIVE__) {
                        this.logEagle(`📥 接收到导入请求: ${result.importedCount} 个文件`, 'info');
                        setTimeout(() => {
                            this.logEagle(`🖼️ 正在生成缩略图...`, 'info');
                            this.log(`🚀 开始导入 ${result.importedCount} 个文件...`, 'info');
                        }, 500);
                        setTimeout(() => {
                            this.logEagle(`🏷️ 智能标签分析完成`, 'info');
                            this.logEagle(`💾 文件已保存到 "AE导入" 文件夹`, 'success');
                            this.log(`📍 导入目标: 佛跳墙`, 'info');
                        }, 1000);
                        setTimeout(() => {
                            this.log(`🎉 导入完成！共 ${result.importedCount} 个文件已添加到合成`, 'success');
                        }, 1500);
                    }
                    this.log(`✅ 拖拽导入完成: ${result.importedCount} 个文件`, 'success');
                } else {
                    this.log(`成功导入 ${result.importedCount} 个文件`, 'success');
                }
                this.updateImportStatus(`已导入 ${result.importedCount} 个文件`);

                // 拖拽导入时不显示详细调试信息
                if (!isDragImport && !isClipboardImport && result.debug && result.debug.length > 0) {
                    this.logGroup('导入调试信息', result.debug, 'debug', true);
                }
            } else {
                if (isDragImport) {
                    this.log(`❌ 拖拽导入失败: ${result.error}`, 'error');
                } else if (isClipboardImport) {
                    this.log(`❌ 剪贴板导入失败: ${result.error}`, 'error');
                } else {
                    this.log(`导入失败: ${result.error}`, 'error');
                }
                this.updateImportStatus(`导入失败: ${result.error}`);

                // 拖拽导入和剪贴板导入时不显示详细调试信息
                if (!isDragImport && !isClipboardImport && result.debug && result.debug.length > 0) {
                    this.logGroup('导入错误详情', result.debug, 'debug', true);
                }
            }

            // 返回结果给调用者
            return result;

        } catch (error) {
            this.log(`导入过程出错: ${error.message}`, 'error');
            this.updateImportStatus(`导入出错: ${error.message}`);

            const errorResult = {
                success: false,
                error: error.message,
                importedCount: 0
            };

            this.sendToEagle({
                type: 'import_result',
                data: errorResult
            });

            // 返回错误结果给调用者
            return errorResult;
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

    // 测试ExtendScript连接
    async testExtendScriptConnection() {
        this.log('测试ExtendScript连接...', 'info');

        try {
            const result = await this.executeExtendScript('testExtendScriptConnection', {});

            if (result.success) {
                this.log(`ExtendScript连接成功: ${result.message}`, 'success');
                this.log(`AE版本: ${result.aeVersion}`, 'info');

                // 显示JSX脚本版本信息
                if (result.scriptVersion) {
                    this.log(`JSX脚本版本: ${result.scriptVersion}`, 'info');
                } else {
                    this.log('⚠️ 未检测到脚本版本信息，可能使用的是旧版本脚本', 'warning');
                }

                return true;
            } else {
                this.log(`ExtendScript连接失败: ${result.error}`, 'error');
                return false;
            }
        } catch (error) {
            this.log(`ExtendScript测试出错: ${error.message}`, 'error');
            return false;
        }
    }
    // 整合的调试和测试方法
    async runDebugAndTest() {
        this.log('🔧 开始Node.js环境调试与测试...', 'info');

        // 先运行CEP环境调试
        this.debugCEPEnvironment();

        // 等待一小段时间让CEP调试完成
        setTimeout(() => {
            // 然后运行Node.js连接测试
            this.testNodeJSConnection();
        }, 500);
    }

    // 测试Node.js连接
    async testNodeJSConnection() {
        this.log('🧪 开始Node.js连接测试...', 'info');

        // 首先进行详细的环境诊断
        this.performNodeJSDiagnostics();

        try {
            // 检查测试类是否可用
            if (typeof window.NodeJSTest === 'undefined') {
                this.log('❌ Node.js测试脚本未加载', 'error');
                return false;
            }

            // 创建测试实例并运行测试
            const tester = new window.NodeJSTest();
            const testResult = tester.runAllTests();

            // 输出测试日志到主日志系统
            testResult.logs.forEach(logEntry => {
                this.log(logEntry.message, logEntry.type);
            });

            if (testResult.success) {
                this.log('🎉 Node.js集成测试全部通过！', 'success');

                // 显示详细的成功信息
                this.log('📋 测试结果详情:', 'info');
                Object.entries(testResult.results).forEach(([testName, result]) => {
                    const status = result ? '✅' : '❌';
                    this.log(`  ${status} ${testName}`, result ? 'success' : 'error');
                });

                return true;
            } else {
                this.log('⚠️ Node.js集成测试部分失败', 'warning');
                this.performAdvancedDiagnostics();

                return false;
            }

        } catch (error) {
            this.log(`❌ Node.js测试执行失败: ${error.message}`, 'error');
            this.performAdvancedDiagnostics();

            return false;
        }
    }

    // 执行Node.js环境诊断
    performNodeJSDiagnostics() {
        this.log('🔍 执行Node.js环境诊断...', 'info');

        // 检查各种可能的Node.js入口点
        const checks = [
            { name: 'window.cep_node', value: typeof window.cep_node },
            { name: 'window.require', value: typeof window.require },
            { name: 'global require', value: typeof require },
            { name: 'window.process', value: typeof window.process },
            { name: 'global process', value: typeof process },
            { name: 'window.Buffer', value: typeof window.Buffer },
            { name: 'global Buffer', value: typeof Buffer },
            { name: '__NODE_JS_AVAILABLE__', value: window.__NODE_JS_AVAILABLE__ }
        ];

        checks.forEach(check => {
            this.log(`  ${check.name}: ${check.value}`, 'debug');
        });

        // 检查window对象中的CEP相关属性
        const cepKeys = Object.keys(window).filter(key =>
            key.toLowerCase().includes('cep') ||
            key.toLowerCase().includes('node') ||
            key.toLowerCase().includes('require')
        );

        if (cepKeys.length > 0) {
            this.log(`🔍 发现CEP相关属性: ${cepKeys.join(', ')}`, 'info');
        } else {
            this.log('⚠️ 未发现CEP相关属性', 'warning');
        }
    }

    // 执行高级诊断
    performAdvancedDiagnostics() {
        this.log('🔧 执行高级诊断...', 'info');

        // 检查CEP版本
        if (typeof CSInterface !== 'undefined') {
            try {
                const csInterface = new CSInterface();
                const hostEnv = csInterface.getHostEnvironment();
                this.log(`CEP版本: ${hostEnv.appVersion}`, 'info');
                this.log(`应用程序: ${hostEnv.appName}`, 'info');
            } catch (error) {
                this.log(`CEP信息获取失败: ${error.message}`, 'warning');
            }
        }

        // 提供详细的修复建议
        this.log('💡 详细修复建议:', 'info');
        this.log('1. 确认manifest.xml中CEFCommandLine配置正确', 'info');
        this.log('2. 检查After Effects版本是否支持Node.js集成', 'info');
        this.log('3. 尝试完全重启After Effects', 'info');
        this.log('4. 检查系统权限和防火墙设置', 'info');
        this.log('5. 确认CEP调试模式已启用', 'info');

        // 显示当前manifest.xml路径
        const extensionPath = this.csInterface.getSystemPath('extension');
        this.log(`扩展路径: ${extensionPath}`, 'info');
        this.log(`manifest.xml位置: ${extensionPath}/CSXS/manifest.xml`, 'info');
    }

    // CEP环境调试
    debugCEPEnvironment() {
        this.log('🔍 开始CEP环境调试...', 'info');

        try {
            // 检查调试器是否可用
            if (typeof window.CEPDebugger === 'undefined') {
                this.log('❌ CEP调试器未加载', 'error');
                return false;
            }

            // 创建调试器实例并运行完整诊断
            const cepDebugger = new window.CEPDebugger();
            const debugResult = cepDebugger.runFullDiagnostics();

            // 输出调试日志到主日志系统
            debugResult.logs.forEach(logEntry => {
                this.log(logEntry.message, logEntry.type);
            });

            if (debugResult.success) {
                this.log('🎉 CEP调试完成，Node.js环境可用！', 'success');
                return true;
            } else {
                this.log('⚠️ CEP调试完成，Node.js环境不可用', 'warning');
                this.log('💡 这可能表明After Effects 2023不支持Node.js集成', 'info');
                return false;
            }

        } catch (error) {
            this.log(`❌ CEP调试执行失败: ${error.message}`, 'error');
            return false;
        }
    }

    // 测试基本的ExtendScript环境
    testBasicExtendScript() {
        this.log('🧪 测试基本ExtendScript环境...', 'info');

        // 首先测试最简单的脚本
        this.csInterface.evalScript('app.version', (result) => {
            if (result && result !== 'EvalScript error.') {
                this.log(`✅ ExtendScript环境正常，AE版本: ${result}`, 'success');
                // 继续加载完整的JSX脚本
                this.loadJSXScript();
            } else {
                this.log(`❌ ExtendScript环境异常: ${result}`, 'error');
                this.log('💡 可能的解决方案:', 'info');
                this.log('1. 重启After Effects', 'info');
                this.log('2. 检查CEP调试模式是否启用', 'info');
                this.log('3. 检查扩展权限设置', 'info');
            }
        });
    }

    // 加载JSX脚本
    loadJSXScript() {
        try {
            // 获取脚本路径
            const scriptPath = this.csInterface.getSystemPath('extension') + '/jsx/hostscript.jsx';
            this.log(`📁 JSX脚本路径: ${scriptPath}`, 'debug');

            // 使用evalScript加载脚本文件
            this.csInterface.evalScript(`$.evalFile("${scriptPath}")`, (result) => {
                if (result === 'undefined' || result === '') {
                    this.log('✅ JSX脚本加载完成', 'success');
                    // 测试连接以验证脚本是否正常工作
                    setTimeout(() => {
                        this.testExtendScriptConnection();
                    }, 500);
                } else {
                    this.log(`⚠️ JSX脚本加载有输出: ${result}`, 'warning');

                    // 检查是否是语法错误
                    if (result.includes('SyntaxError') || result.includes('Error')) {
                        this.log('❌ JSX脚本可能有语法错误', 'error');
                        // 尝试加载简单测试脚本
                        this.loadSimpleTestScript();
                    } else {
                        // 即使有输出也尝试测试连接
                        setTimeout(() => {
                            this.testExtendScriptConnection();
                        }, 500);
                    }
                }
            });

        } catch (error) {
            this.log(`JSX脚本加载失败: ${error.message}`, 'error');
            // 尝试加载简单测试脚本
            this.loadSimpleTestScript();
        }
    }

    // 加载简单测试脚本
    loadSimpleTestScript() {
        try {
            const testScriptPath = this.csInterface.getSystemPath('extension') + '/jsx/test_simple.jsx';
            this.log(`🧪 尝试加载简单测试脚本: ${testScriptPath}`, 'info');

            this.csInterface.evalScript(`$.evalFile("${testScriptPath}")`, (result) => {
                if (result === 'undefined' || result === '') {
                    this.log('✅ 简单测试脚本加载成功', 'success');
                    // 测试基本功能
                    this.csInterface.evalScript('testBasicFunctions()', (testResult) => {
                        this.log(`🧪 基本功能测试结果: ${testResult}`, 'info');
                    });
                } else {
                    this.log(`❌ 简单测试脚本加载失败: ${result}`, 'error');
                }
            });
        } catch (error) {
            this.log(`简单测试脚本加载异常: ${error.message}`, 'error');
        }
    }

    // 强制重新加载JSX脚本
    async reloadJSXScript() {
        this.log('🔄 强制重新加载JSX脚本...', 'info');

        try {
            // 尝试加载脚本文件
            const scriptPath = this.csInterface.getSystemPath('extension') + '/jsx/hostscript.jsx';
            this.log(`脚本路径: ${scriptPath}`, 'info');

            // 使用evalScript加载脚本文件
            this.csInterface.evalScript(`$.evalFile("${scriptPath}")`, (result) => {
                if (result === 'undefined' || result === '') {
                    this.log('✅ JSX脚本重新加载完成', 'success');
                    // 重新测试连接以验证版本
                    setTimeout(() => {
                        this.testExtendScriptConnection();
                    }, 500);
                } else {
                    this.log(`JSX脚本加载结果: ${result}`, 'info');
                }
            });

        } catch (error) {
            this.log(`JSX脚本重新加载失败: ${error.message}`, 'error');
        }
    }

    // 显示最终导出结果
    showFinalExportResult(exportPath, exportedLayers) {
        try {
            // 只显示一次完成信息，避免重复
            this.log(`🎉 导出完成！共 ${exportedLayers.length} 个PNG文件已保存`, 'success');
            this.log(`📁 导出位置: ${exportPath}`, 'info');

            // 保存最后的导出信息，供复制按钮使用
            this.lastExportInfo = {
                exportPath: exportPath,
                exportedLayers: exportedLayers
            };

            this.log(`🔍 已保存导出信息: 路径=${exportPath}, 文件数=${exportedLayers.length}`, 'debug');



        } catch (error) {
            this.log(`❌ 显示导出结果失败: ${error.message}`, 'error');
        }
    }

    // 复制导出的文件到剪贴板
    async copyExportedFilesToClipboard() {
        if (!this.lastExportInfo || !this.lastExportInfo.exportedLayers) {
            this.log('❌ 没有可复制的导出文件', 'error');
            this.log(`🔍 调试信息: lastExportInfo=${!!this.lastExportInfo}, exportedLayers=${this.lastExportInfo ? !!this.lastExportInfo.exportedLayers : 'N/A'}`, 'debug');
            return;
        }

        try {

            this.log('📋 开始复制导出文件到剪贴板...', 'info');

            // 构建完整的文件路径列表
            const filePaths = this.lastExportInfo.exportedLayers.map(layer => {
                // 使用JSX脚本返回的实际文件名，如果没有则使用图层名称
                let fileName = layer.fileName || `${layer.layerName || 'unknown'}.png`;

                // 如果文件名包含URL编码，进行解码
                try {
                    if (fileName.includes('%')) {
                        fileName = decodeURIComponent(fileName);
                        this.log(`🔄 解码文件名: ${layer.fileName} -> ${fileName}`, 'info');
                    }
                } catch (decodeError) {
                    this.log(`⚠️ 文件名解码失败，使用原始名称: ${fileName}`, 'warning');
                }

                // 构建完整路径，确保使用正确的路径分隔符
                let fullPath = this.lastExportInfo.exportPath;
                if (!fullPath.endsWith('/') && !fullPath.endsWith('\\')) {
                    fullPath += '/';
                }
                fullPath += fileName;

                // 规范化路径格式
                fullPath = fullPath.replace(/\\/g, '/');

                return fullPath;
            });

            this.log(`📁 准备复制 ${filePaths.length} 个文件: ${filePaths.join(', ')}`, 'info');

            // 调试：验证文件是否存在（使用CEP文件系统API）
            filePaths.forEach((filePath, index) => {
                try {
                    // 在CEP环境中使用File对象检查文件
                    const file = new File(filePath);
                    const exists = file.exists;
                    this.log(`📁 文件 ${index + 1}: ${exists ? '✅存在' : '❌不存在'} - ${filePath}`, exists ? 'info' : 'warning');

                    if (!exists) {
                        // 尝试检查目录是否存在
                        const lastSlashIndex = filePath.lastIndexOf('/');
                        const dirPath = filePath.substring(0, lastSlashIndex);
                        const folder = new Folder(dirPath);
                        const dirExists = folder.exists;
                        this.log(`📂 目录${dirExists ? '存在' : '不存在'}: ${dirPath}`, dirExists ? 'info' : 'error');

                        if (dirExists) {
                            try {
                                const files = folder.getFiles('*.png');
                                const fileNames = files.map(f => f.name);
                                this.log(`📋 目录中的PNG文件: ${fileNames.join(', ')}`, 'info');
                            } catch (readError) {
                                this.log(`❌ 读取目录失败: ${readError.message}`, 'error');
                            }
                        }
                    }
                } catch (checkError) {
                    this.log(`❌ 检查文件失败: ${filePath} - ${checkError.message}`, 'error');
                }
            });

            // 调试：输出详细的请求数据
            const requestData = {
                type: 'copy_files',
                filePaths: filePaths,
                timestamp: Date.now()
            };
            this.log(`🔍 请求数据: ${JSON.stringify(requestData, null, 2)}`, 'info');

            // 发送复制请求到Eagle插件
            const response = await this.sendCopyRequest(filePaths);

            if (response.success) {
                this.log('✅ 文件已成功复制到剪贴板', 'success');

                // 播放成功音效
                try {
                    if (this.soundPlayer && typeof this.soundPlayer.playConnectionSuccess === 'function') {
                        this.soundPlayer.playConnectionSuccess();
                    }
                } catch (soundError) {
                    // 忽略音效播放错误
                }
            } else {
                throw new Error(response.error || '复制失败');
            }
        } catch (error) {
            this.log(`❌ 复制到剪贴板失败: ${error.message}`, 'error');

            // 播放错误音效
            try {
                if (this.soundPlayer && typeof this.soundPlayer.playConnectionError === 'function') {
                    this.soundPlayer.playConnectionError();
                }
            } catch (soundError) {
                // 忽略音效播放错误
            }
        }
    }

    // 发送复制请求到Eagle插件
    async sendCopyRequest(filePaths) {
        return new Promise(async (resolve, reject) => {
            // 创建超时处理
            const timeoutId = setTimeout(() => {
                reject(new Error('请求超时，请检查Eagle插件是否正在运行'));
            }, 10000); // 10秒超时

            try {
                const response = await fetch('http://localhost:8080/copy-to-clipboard', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: 'copy_files',
                        filePaths: filePaths,
                        timestamp: Date.now()
                    })
                });

                clearTimeout(timeoutId); // 清除超时

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                resolve(result);
            } catch (error) {
                clearTimeout(timeoutId); // 清除超时

                if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                    reject(new Error('无法连接到Eagle插件，请确保Eagle正在运行且插件已启用'));
                } else {
                    reject(error);
                }
            }
        });
    }

    // 显示最终结果UI
    showFinalResultUI(exportPath, exportedLayers) {
        try {
            // 创建最终结果容器
            const resultContainer = document.createElement('div');
            resultContainer.className = 'final-result';
            resultContainer.style.cssText = `
                margin: 15px 0;
                padding: 20px;
                background: linear-gradient(135deg, rgba(0, 200, 0, 0.2), rgba(0, 150, 255, 0.1));
                border: 2px solid rgba(0, 200, 0, 0.5);
                border-radius: 12px;
                color: #fff;
                font-size: 13px;
                line-height: 1.6;
                box-shadow: 0 8px 25px rgba(0, 200, 0, 0.3);
            `;

            resultContainer.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="font-size: 32px; margin-right: 12px;">🎉</div>
                    <div>
                        <div style="font-weight: bold; font-size: 18px; color: #00FF7F; margin-bottom: 4px;">
                            导出成功！
                        </div>
                        <div style="color: #ccc; font-size: 13px;">
                            ${exportedLayers.length} 个PNG文件已保存
                        </div>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-weight: bold; margin-bottom: 10px; color: #fff; font-size: 14px;">📋 文件已自动复制到剪切板！</div>
                    <div style="margin-bottom: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px; font-family: monospace; font-size: 11px; color: #90EE90; word-break: break-all;">
                        ${exportPath}
                    </div>
                    <div style="margin-bottom: 8px; color: #90EE90; font-size: 14px; font-weight: bold;">✅ 所有 ${exportedLayers.length} 个文件已复制到剪切板</div>
                    <div style="margin-bottom: 8px;">💡 现在可以在任何地方按 <kbd style="background: #333; padding: 3px 8px; border-radius: 4px; color: #fff; font-weight: bold;">Ctrl+V</kbd> 直接粘贴所有文件！</div>
                    <div style="color: #ccc; font-size: 11px;">如果自动复制失败，可以手动打开文件夹进行复制</div>
                </div>

                <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                    <button id="final-open-folder" style="padding: 12px 20px; background: #007acc; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,122,204,0.3);">📁 打开文件夹</button>
                    <button id="final-copy-path" style="padding: 12px 20px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; box-shadow: 0 2px 8px rgba(40,167,69,0.3);">📋 复制路径</button>
                    <button id="final-close" style="padding: 12px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s;">✖️ 关闭</button>
                </div>
            `;

            // 绑定事件
            resultContainer.querySelector('#final-open-folder').onclick = () => {
                this.openFolderReliable(exportPath);
            };

            resultContainer.querySelector('#final-copy-path').onclick = () => {
                this.copyPathToClipboard(exportPath);
            };

            resultContainer.querySelector('#final-close').onclick = () => {
                resultContainer.remove();
            };

            // 添加悬停效果
            const buttons = resultContainer.querySelectorAll('button');
            buttons.forEach(button => {
                button.onmouseover = () => {
                    button.style.transform = 'translateY(-2px)';
                    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                };
                button.onmouseout = () => {
                    button.style.transform = 'translateY(0)';
                };
            });

            // 添加到日志容器
            const logContainer = document.querySelector('#log-output');
            if (logContainer) {
                logContainer.appendChild(resultContainer);
                logContainer.scrollTop = logContainer.scrollHeight;
            }

            // 30秒后自动移除
            setTimeout(() => {
                if (resultContainer.parentNode) {
                    resultContainer.remove();
                }
            }, 30000);

        } catch (error) {
            this.log(`❌ 创建最终结果界面失败: ${error.message}`, 'error');
        }
    }

    // 可靠的打开文件夹方法（跨平台）
    openFolderReliable(exportPath) {
        this.log('📁 尝试可靠地打开文件夹...', 'info');
        this.log(`📁 路径: ${exportPath}`, 'info');

        if (window.cep && window.cep.process) {
            // 使用跨平台的打开方法
            this.log('🔄 使用跨平台方法打开...', 'info');

            try {
                // 检测平台并使用相应的方法
                const platform = this.detectPlatform();
                this.openFolderByPlatform(exportPath, platform);

                // 由于CEP的createProcess可能不会触发回调，我们延迟显示成功消息
                setTimeout(() => {
                    this.log('✅ 已尝试打开文件夹（如果没有打开，请手动复制路径）', 'success');
                }, 1000);

            } catch (error) {
                this.log(`❌ 打开文件夹失败: ${error.message}`, 'error');
                this.copyPathToClipboard(exportPath);
            }
        } else {
            this.log('❌ CEP process API不可用', 'error');
            this.copyPathToClipboard(exportPath);
        }
    }

    // 已移除旧的tryExplorer方法，现在使用跨平台的openFolderByPlatform方法

    // 使用C#程序复制文件到剪切板
    async copyFilesToClipboardDirect(exportPath, exportedLayers) {
        try {
            this.log('📋 正在复制文件到剪切板...', 'info');

            if (!window.cep || !window.cep.process) {
                this.log('❌ CEP process API不可用', 'error');
                return;
            }

            // 直接使用JSX PowerShell方案（最可靠）
            const result = await this.copyUsingJSXFallback(exportPath);

            if (result.success) {
                this.log(`✅ 已复制 ${exportedLayers.length} 个文件到剪切板`, 'success');
                this.log('💡 现在可以按 Ctrl+V 粘贴所有文件', 'info');
            } else {
                this.log(`❌ 所有复制方案都失败了: ${result.error}`, 'error');
                this.log('💡 请手动打开文件夹复制文件', 'warning');
            }

        } catch (error) {
            this.log(`❌ 复制过程出错: ${error.message}`, 'error');
        }
    }

    // 复制最后导出的文件到剪贴板
    async copyLastExportToClipboard() {
        if (!this.lastExportInfo) {
            this.log('❌ 没有可复制的导出文件', 'error');
            return;
        }

        this.log('📋 正在复制文件到剪切板...', 'info');

        // 直接使用JSX PowerShell方案（最可靠）
        const result = await this.copyUsingJSXFallback(this.lastExportInfo.exportPath);

        if (result.success) {
            this.log(`✅ 已成功复制 ${this.lastExportInfo.exportedLayers.length} 个文件到剪切板！`, 'success');
            this.log('💡 现在可以在任何地方使用 Ctrl+V 粘贴所有导出的图片', 'info');
        } else {
            this.log(`❌ 所有复制方案都失败了: ${result.error}`, 'error');
            this.log('💡 请手动打开文件夹复制文件', 'warning');
        }
    }

    // 使用PowerShell脚本复制文件到剪切板
    async copyUsingCSharpProgram(exportPath) {
        return new Promise((resolve) => {
            try {
                this.log('🔄 正在使用PowerShell脚本复制文件...', 'info');
                this.log(`📂 目标路径: ${exportPath}`, 'info');

                // 使用简化的PowerShell脚本，参考copy-pasta的成功模式
                const powershellScript = `
                    [Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms')
                    $files = New-Object System.Collections.Specialized.StringCollection
                    Get-ChildItem -Path "${exportPath.replace(/\\/g, '\\\\')}" -Filter "*.png" | ForEach-Object {
                        $files.Add($_.FullName)
                    }
                    if ($files.Count -gt 0) {
                        [System.Windows.Forms.Clipboard]::SetFileDropList($files)
                        Write-Host "SUCCESS: Copied $($files.Count) PNG files to clipboard"
                    } else {
                        Write-Host "ERROR: No PNG files found"
                    }
                `.replace(/\s+/g, ' ').trim();

                this.log(`🔧 PowerShell脚本: ${powershellScript}`, 'info');

                // 设置超时处理
                const timeout = setTimeout(() => {
                    this.log('⏰ PowerShell脚本执行超时', 'warning');
                    resolve({ success: false, error: 'Execution timeout (10 seconds)' });
                }, 10000);

                window.cep.process.createProcess(
                    'powershell.exe',
                    ['-ExecutionPolicy', 'Bypass', '-Command', powershellScript],
                    (execErr, execStdout, execStderr) => {
                        clearTimeout(timeout);

                        this.log(`📤 PowerShell输出: ${execStdout || '(无输出)'}`, 'info');
                        if (execStderr) {
                            this.log(`⚠️ 错误输出: ${execStderr}`, 'warning');
                        }

                        if (execErr) {
                            this.log(`❌ 执行错误: ${execErr.toString()}`, 'error');
                            resolve({ success: false, error: execErr.toString() });
                        } else if (execStdout && execStdout.includes('SUCCESS:')) {
                            this.log('✅ PowerShell脚本执行成功', 'success');
                            resolve({ success: true, message: execStdout });
                        } else {
                            this.log('❌ PowerShell脚本执行失败或无预期输出', 'error');
                            resolve({ success: false, error: execStdout || execStderr || 'No expected output' });
                        }
                    }
                );

            } catch (error) {
                this.log(`❌ 复制过程异常: ${error.message}`, 'error');
                resolve({ success: false, error: error.message });
            }
        });
    }

    // 使用JSX PowerShell方案复制文件
    async copyUsingJSXFallback(exportPath) {
        return new Promise((resolve) => {
            try {
                this.log('📋 尝试使用PowerShell复制文件...', 'info');

                // 构建PowerShell命令来复制文件夹中的所有PNG文件
                const psCommand = `
                    $files = Get-ChildItem -Path "${exportPath}" -Filter "*.png" | Select-Object -ExpandProperty FullName;
                    if ($files.Count -gt 0) {
                        Add-Type -AssemblyName System.Windows.Forms;
                        $fileCollection = New-Object System.Collections.Specialized.StringCollection;
                        foreach ($file in $files) { $fileCollection.Add($file) };
                        [System.Windows.Forms.Clipboard]::SetFileDropList($fileCollection);
                        Write-Output "Success: Copied $($files.Count) files to clipboard";
                    } else {
                        Write-Output "Error: No PNG files found";
                    }
                `.replace(/\n\s+/g, ' ').trim();

                // 使用ExtendScript执行PowerShell命令
                this.csInterface.evalScript(`
                    try {
                        var psCmd = 'powershell.exe -Command "& {${psCommand}}"';
                        var result = system.callSystem(psCmd);
                        JSON.stringify({success: true, result: result});
                    } catch (error) {
                        JSON.stringify({success: false, error: error.toString()});
                    }
                `, (result) => {
                    try {
                        const parsed = JSON.parse(result);
                        if (parsed.success) {
                            this.log('✅ 文件已复制到剪切板', 'success');
                            resolve({ success: true });
                        } else {
                            this.log(`❌ PowerShell复制失败: ${parsed.error}`, 'warning');
                            resolve({ success: false, error: parsed.error });
                        }
                    } catch (parseError) {
                        this.log(`❌ 解析复制结果失败: ${parseError.message}`, 'warning');
                        resolve({ success: false, error: parseError.message });
                    }
                });

            } catch (error) {
                this.log(`❌ 复制过程异常: ${error.message}`, 'error');
                resolve({ success: false, error: error.message });
            }
        });
    }

    // 显示导出完成信息和复制按钮
    showExportCompleteWithCopyButton(exportPath, exportedLayers) {
        try {
            // 创建导出完成容器
            const completeContainer = document.createElement('div');
            completeContainer.className = 'export-complete-with-copy';
            completeContainer.style.cssText = `
                margin: 15px 0;
                padding: 20px;
                background: linear-gradient(135deg, rgba(0, 200, 0, 0.2), rgba(0, 150, 255, 0.1));
                border: 2px solid rgba(0, 200, 0, 0.5);
                border-radius: 12px;
                color: #fff;
                font-size: 13px;
                line-height: 1.6;
                box-shadow: 0 8px 25px rgba(0, 200, 0, 0.3);
            `;

            completeContainer.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="font-size: 32px; margin-right: 12px;">🎉</div>
                    <div>
                        <div style="font-weight: bold; font-size: 18px; color: #00FF7F; margin-bottom: 4px;">
                            导出成功！
                        </div>
                        <div style="color: #ccc; font-size: 13px;">
                            ${exportedLayers.length} 个PNG文件已保存
                        </div>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-weight: bold; margin-bottom: 10px; color: #fff; font-size: 14px;">📁 导出位置：</div>
                    <div style="margin-bottom: 12px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px; font-family: monospace; font-size: 11px; color: #90EE90; word-break: break-all;">
                        ${exportPath}
                    </div>
                </div>

                <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                    <button id="open-folder-btn" style="padding: 12px 20px; background: #007acc; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,122,204,0.3);">📁 打开文件夹</button>
                    <button id="close-complete-btn" style="padding: 12px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s;">✖️ 关闭</button>
                </div>
            `;

            // 绑定事件
            completeContainer.querySelector('#open-folder-btn').onclick = () => {
                this.openExportFolder(exportPath);
            };

            completeContainer.querySelector('#close-complete-btn').onclick = () => {
                completeContainer.remove();
            };

            // 添加到日志容器
            const logContainer = document.querySelector('#log-output');
            if (logContainer) {
                logContainer.appendChild(completeContainer);
                logContainer.scrollTop = logContainer.scrollHeight;
            }

        } catch (error) {
            this.log(`❌ 显示导出完成信息失败: ${error.message}`, 'error');
        }
    }









    // 显示简单的成功消息
    showSimpleSuccessMessage(exportPath, fileCount) {
        try {
            // 创建简单的成功消息
            const successContainer = document.createElement('div');
            successContainer.className = 'simple-success';
            successContainer.style.cssText = `
                margin: 15px 0;
                padding: 16px;
                background: linear-gradient(135deg, rgba(0, 200, 0, 0.2), rgba(0, 150, 255, 0.1));
                border: 2px solid rgba(0, 200, 0, 0.5);
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
                text-align: center;
            `;

            successContainer.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 8px;">🎉</div>
                <div style="font-weight: bold; font-size: 16px; color: #00FF7F; margin-bottom: 8px;">
                    复制成功！
                </div>
                <div style="margin-bottom: 12px;">
                    ${fileCount} 个PNG文件已复制到剪切板
                </div>
                <div style="font-size: 12px; color: #90EE90;">
                    现在可以在任何地方按 Ctrl+V 粘贴
                </div>
                <button onclick="this.parentNode.remove()" style="margin-top: 12px; padding: 6px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">关闭</button>
            `;

            // 添加到日志容器
            const logContainer = document.querySelector('#log-output');
            if (logContainer) {
                logContainer.appendChild(successContainer);
                logContainer.scrollTop = logContainer.scrollHeight;
            }

            // 10秒后自动移除
            setTimeout(() => {
                if (successContainer.parentNode) {
                    successContainer.remove();
                }
            }, 10000);

        } catch (error) {
            this.log(`❌ 创建成功消息失败: ${error.message}`, 'error');
        }
    }



    // 显示Node.js成功消息
    showNodeJSSuccessMessage(exportPath, fileCount, tempDir) {
        try {
            // 创建成功消息容器
            const successContainer = document.createElement('div');
            successContainer.className = 'nodejs-success';
            successContainer.style.cssText = `
                margin: 15px 0;
                padding: 20px;
                background: linear-gradient(135deg, rgba(0, 200, 0, 0.2), rgba(0, 150, 255, 0.15));
                border: 2px solid rgba(0, 200, 0, 0.5);
                border-radius: 12px;
                color: #fff;
                font-size: 13px;
                line-height: 1.6;
                box-shadow: 0 8px 25px rgba(0, 200, 0, 0.3);
                position: relative;
                overflow: hidden;
            `;

            successContainer.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="font-size: 32px; margin-right: 12px; animation: pulse 2s infinite;">🚀</div>
                    <div>
                        <div style="font-weight: bold; font-size: 18px; color: #00FF7F; margin-bottom: 4px;">
                            Node.js 复制成功！
                        </div>
                        <div style="color: #ccc; font-size: 13px;">
                            ${fileCount} 个PNG文件已通过Node.js复制到剪切板
                        </div>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-weight: bold; margin-bottom: 10px; color: #fff; font-size: 14px;">🎯 技术详情：</div>
                    <div style="margin-bottom: 6px; font-size: 12px;">✅ 使用 Node.js fs.copyFileSync() 复制文件</div>
                    <div style="margin-bottom: 6px; font-size: 12px;">✅ 通过临时目录处理文件</div>
                    <div style="margin-bottom: 6px; font-size: 12px;">✅ PowerShell SetFileDropList() 复制到剪切板</div>
                    <div style="margin-bottom: 10px; font-size: 12px;">✅ 自动清理临时文件</div>
                    <div style="color: #00FF7F; font-size: 12px; font-weight: bold;">💡 现在可以在任何地方按 Ctrl+V 粘贴！</div>
                </div>

                <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                    <button id="test-paste-btn" style="padding: 12px 20px; background: #00FF7F; color: #000; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,255,127,0.4);">🧪 测试粘贴</button>
                    <button id="open-folder-btn" style="padding: 12px 20px; background: #007acc; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,122,204,0.3);">📁 打开原文件夹</button>
                    <button id="close-success" style="padding: 12px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s;">✖️ 关闭</button>
                </div>

                <style>
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                        100% { transform: scale(1); }
                    }
                </style>
            `;

            // 绑定事件
            successContainer.querySelector('#test-paste-btn').onclick = () => {
                this.log('🧪 请在任意位置（如桌面、文件夹）按 Ctrl+V 测试粘贴功能', 'info');
                this.log('💡 如果成功，您应该能看到所有导出的PNG文件', 'info');
            };

            successContainer.querySelector('#open-folder-btn').onclick = () => {
                this.openFolderSimple(exportPath);
            };

            successContainer.querySelector('#close-success').onclick = () => {
                successContainer.remove();
            };

            // 添加悬停效果
            const buttons = successContainer.querySelectorAll('button');
            buttons.forEach(button => {
                button.onmouseover = () => {
                    button.style.transform = 'translateY(-2px)';
                    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                };
                button.onmouseout = () => {
                    button.style.transform = 'translateY(0)';
                };
            });

            // 添加到日志容器
            const logContainer = document.querySelector('#log-output');
            if (logContainer) {
                logContainer.appendChild(successContainer);
                logContainer.scrollTop = logContainer.scrollHeight;
            }

            // 20秒后自动移除
            setTimeout(() => {
                if (successContainer.parentNode) {
                    successContainer.remove();
                }
            }, 20000);

        } catch (error) {
            this.log(`❌ 创建成功消息失败: ${error.message}`, 'error');
        }
    }

    // 显示导出完成信息（备选方案）
    showExportComplete(exportPath, fileCount) {
        try {
            this.log(`🎉 导出完成！共 ${fileCount} 个PNG文件`, 'success');

            // 显示完成信息和操作选项
            this.showExportCompleteUI(exportPath, fileCount);

        } catch (error) {
            this.log(`❌ 显示完成信息失败: ${error.message}`, 'error');
        }
    }

    // 显示导出完成的UI界面
    showExportCompleteUI(exportPath, fileCount) {
        try {
            // 创建完成信息容器
            const completeContainer = document.createElement('div');
            completeContainer.className = 'export-complete';
            completeContainer.style.cssText = `
                margin: 15px 0;
                padding: 20px;
                background: linear-gradient(135deg, rgba(0, 150, 0, 0.15), rgba(0, 100, 200, 0.1));
                border: 2px solid rgba(0, 150, 0, 0.4);
                border-radius: 12px;
                color: #fff;
                font-size: 13px;
                line-height: 1.6;
                box-shadow: 0 6px 20px rgba(0, 150, 0, 0.2);
                position: relative;
                overflow: hidden;
            `;

            completeContainer.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="font-size: 32px; margin-right: 12px; animation: bounce 2s infinite;">🎉</div>
                    <div>
                        <div style="font-weight: bold; font-size: 18px; color: #4CAF50; margin-bottom: 4px;">
                            导出成功！
                        </div>
                        <div style="color: #ccc; font-size: 13px;">
                            ${fileCount} 个PNG文件已保存到导出文件夹
                        </div>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="font-weight: bold; margin-bottom: 10px; color: #fff; font-size: 14px;">📋 复制文件到剪切板：</div>
                    <div style="margin-bottom: 8px; padding: 8px; background: rgba(0,0,0,0.2); border-radius: 4px; font-family: monospace; font-size: 11px; color: #90EE90;">
                        ${exportPath}
                    </div>
                    <div style="margin-bottom: 8px;">1️⃣ 点击下方"打开文件夹"按钮</div>
                    <div style="margin-bottom: 8px;">2️⃣ 在文件夹中按 <kbd style="background: #333; padding: 3px 8px; border-radius: 4px; color: #fff; font-weight: bold;">Ctrl+A</kbd> 全选文件</div>
                    <div style="margin-bottom: 8px;">3️⃣ 按 <kbd style="background: #333; padding: 3px 8px; border-radius: 4px; color: #fff; font-weight: bold;">Ctrl+C</kbd> 复制文件</div>
                    <div style="color: #90EE90; font-size: 12px;">💡 然后就可以在任何地方按 Ctrl+V 粘贴了！</div>
                </div>

                <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                    <button id="open-folder-btn" style="padding: 12px 20px; background: #007acc; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; box-shadow: 0 2px 8px rgba(0,122,204,0.3);">📁 打开文件夹</button>
                    <button id="copy-path-btn" style="padding: 12px 20px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; box-shadow: 0 2px 8px rgba(40,167,69,0.3);">📋 复制路径</button>
                    <button id="close-complete" style="padding: 12px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s;">✖️ 关闭</button>
                </div>

                <style>
                    @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                        40% { transform: translateY(-10px); }
                        60% { transform: translateY(-5px); }
                    }
                </style>
            `;

            // 绑定事件
            completeContainer.querySelector('#open-folder-btn').onclick = () => {
                this.openFolderSimple(exportPath);
            };

            completeContainer.querySelector('#copy-path-btn').onclick = () => {
                this.copyPathToClipboard(exportPath);
            };

            completeContainer.querySelector('#close-complete').onclick = () => {
                completeContainer.remove();
            };

            // 添加悬停效果
            const buttons = completeContainer.querySelectorAll('button');
            buttons.forEach(button => {
                button.onmouseover = () => {
                    button.style.transform = 'translateY(-2px)';
                    button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                };
                button.onmouseout = () => {
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = button.id === 'close-complete' ? 'none' : button.style.boxShadow;
                };
            });

            // 添加到日志容器
            const logContainer = document.querySelector('#log-output');
            if (logContainer) {
                logContainer.appendChild(completeContainer);
                logContainer.scrollTop = logContainer.scrollHeight;
            }

            // 30秒后自动移除
            setTimeout(() => {
                if (completeContainer.parentNode) {
                    completeContainer.remove();
                }
            }, 30000);

        } catch (error) {
            this.log(`❌ 创建完成界面失败: ${error.message}`, 'error');
        }
    }

    // 跨平台的打开文件夹方法
    openFolder(folderPath) {
        try {
            this.log('📁 正在打开文件夹...', 'info');
            this.log(`📁 路径: ${folderPath}`, 'info');

            if (!folderPath || folderPath === '未知' || folderPath === '获取失败') {
                this.log('❌ 无效的文件夹路径', 'error');
                return;
            }

            if (window.cep && window.cep.process) {
                // 检测操作系统平台
                const platform = this.detectPlatform();
                this.log(`🖥️ 检测到平台: ${platform}`, 'info');

                // 根据平台选择合适的打开方法
                this.openFolderByPlatform(folderPath, platform);
            } else {
                this.log('❌ CEP process API不可用', 'error');
                this.copyPathToClipboard(folderPath);
            }
        } catch (error) {
            this.log(`❌ 打开文件夹出错: ${error.message}`, 'error');
            this.copyPathToClipboard(folderPath);
        }
    }

    // 检测操作系统平台
    detectPlatform() {
        // 方法1: 使用navigator.platform
        if (navigator.platform) {
            const platform = navigator.platform.toLowerCase();
            if (platform.includes('win')) {
                return 'windows';
            } else if (platform.includes('mac')) {
                return 'mac';
            } else if (platform.includes('linux')) {
                return 'linux';
            }
        }

        // 方法2: 使用userAgent
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('windows')) {
            return 'windows';
        } else if (userAgent.includes('mac')) {
            return 'mac';
        } else if (userAgent.includes('linux')) {
            return 'linux';
        }

        // 默认返回windows（最常见的情况）
        return 'windows';
    }

    // 根据平台打开文件夹
    openFolderByPlatform(folderPath, platform) {
        switch (platform) {
            case 'windows':
                this.openFolderWindows(folderPath);
                break;
            case 'mac':
                this.openFolderMac(folderPath);
                break;
            case 'linux':
                this.openFolderLinux(folderPath);
                break;
            default:
                this.log(`⚠️ 未知平台: ${platform}，尝试Windows方法`, 'warning');
                this.openFolderWindows(folderPath);
                break;
        }
    }

    // 清空临时文件夹
    async cleanupTempFolder() {
        try {
            const response = await this.sendToEagle({
                action: 'cleanupTempFolder'
            });

            if (response.success) {
                // 清理缓存，因为文件夹状态已改变
                this.tempFolderStatusCache.data = null;
                this.tempFolderStatusCache.timestamp = 0;

                this.log('🗑️ 临时文件夹清理完成', 'success');
                // 清理完成后更新tooltip
                setTimeout(() => {
                    this.updateBurnAfterReadingTooltip();
                }, 500);
            } else {
                throw new Error(response.error || '清理失败');
            }
        } catch (error) {
            this.log(`❌ 清空临时文件夹失败: ${error.message}`, 'error');
            throw error;
        }
    }

    // 打开临时文件夹
    async openTempFolder() {
        try {
            const response = await this.sendToEagle({
                action: 'openTempFolder'
            });

            if (response.success) {
                this.log('📁 临时文件夹已打开', 'success');
            } else {
                throw new Error(response.error || '打开失败');
            }
        } catch (error) {
            this.log(`❌ 打开临时文件夹失败: ${error.message}`, 'error');
            throw error;
        }
    }

    // 检查临时文件夹状态（带缓存）
    async checkTempFolderStatus(forceRefresh = false) {
        try {
            const now = Date.now();

            // 如果有缓存且未过期，直接返回缓存数据
            if (!forceRefresh &&
                this.tempFolderStatusCache.data &&
                (now - this.tempFolderStatusCache.timestamp) < this.tempFolderStatusCache.cacheTime) {
                return this.tempFolderStatusCache.data;
            }

            const response = await this.sendToEagle({
                action: 'checkTempFolderSize'
            });

            if (response.success) {
                // 更新缓存
                this.tempFolderStatusCache.data = response.data;
                this.tempFolderStatusCache.timestamp = now;
                return response.data;
            } else {
                throw new Error(response.error || '检查失败');
            }
        } catch (error) {
            this.log(`❌ 检查临时文件夹状态失败: ${error.message}`, 'error');
            return { size: 0, count: 0, needsCleanup: false };
        }
    }

    // 启动时检查并清理临时文件夹
    async checkAndCleanupTempFolderOnStartup() {
        try {
            if (this.connectionState !== ConnectionState.CONNECTED) {
                // 在演示模式下静默处理
                if (!window.__DEMO_MODE_ACTIVE__) {
                    this.log('未连接到Eagle，跳过临时文件夹检查', 'debug');
                }
                return;
            }

            const status = await this.checkTempFolderStatus(true); // 强制刷新

            if (status.needsCleanup) {
                this.log(`🗑️ 检测到临时文件夹需要清理 - 大小: ${status.size.toFixed(2)}MB, 文件数: ${status.count}`, 'info');
                await this.cleanupTempFolder();
                this.log('🗑️ 启动时临时文件夹清理完成', 'success');
            } else if (status.count > 0) {
                this.log(`📁 临时文件夹状态 - 大小: ${status.size.toFixed(2)}MB, 文件数: ${status.count}`, 'debug');
            }

            // 更新tooltip显示（不需要强制刷新，因为上面已经刷新过了）
            this.updateBurnAfterReadingTooltip();
        } catch (error) {
            this.log(`启动时临时文件夹检查失败: ${error.message}`, 'warning');
        }
    }

    // 更新阅后即焚的tooltip显示
    async updateBurnAfterReadingTooltip() {
        try {
            // 临时禁用连接时的检查以解决性能问题
            if (this.disableConnectionTimeChecks && this.connectionState === ConnectionState.CONNECTED) {
                this.log('⚠️ 连接时的文件夹检查已禁用，跳过tooltip更新', 'debug');
                return;
            }

            const label = document.getElementById('burn-after-reading-label');
            if (!label) return;

            let tooltipText = '启用后图片导出到临时文件夹，导出后复制到剪切板。\n文件累计超过100MB或100个文件后自动清空。\n';

            if (this.connectionState === ConnectionState.CONNECTED) {
                try {
                    const status = await this.checkTempFolderStatus();
                    const sizeText = status.size > 0 ? `${status.size.toFixed(1)}MB` : '0MB';
                    const countText = `${status.count}个`;
                    tooltipText += `Alt+点击清空，Ctrl+点击打开临时文件夹（${sizeText}|${countText}）。`;
                } catch (error) {
                    tooltipText += 'Alt+点击清空，Ctrl+点击打开临时文件夹。';
                }
            } else {
                tooltipText += 'Alt+点击清空，Ctrl+点击打开临时文件夹。';
            }

            // 使用浏览器默认的title tooltip，尝试不同的换行方法
            label.setAttribute('title', tooltipText);
        } catch (error) {
            this.log(`更新阅后即焚tooltip失败: ${error.message}`, 'warning');
        }
    }

    // 启动定期更新tooltip的定时器
    startTooltipUpdateTimer() {
        // 减少更新频率，每5分钟更新一次tooltip，减少不必要的网络请求
        setInterval(() => {
            if (this.connectionState === ConnectionState.CONNECTED) {
                this.updateBurnAfterReadingTooltip();
            }
        }, 300000); // 5分钟间隔（300秒）

        // 初始更新（延迟更长时间，避免启动时的性能影响）
        setTimeout(() => {
            this.updateBurnAfterReadingTooltip();
        }, 20000); // 延迟20秒，确保所有初始化完成后再检查
    }

    // 简单的打开文件夹方法（保持向后兼容）
    openFolderSimple(exportPath) {
        this.openFolder(exportPath);
    }

    // Windows平台打开文件夹
    openFolderWindows(folderPath) {
        this.log('🪟 使用Windows方法打开文件夹...', 'info');

        const explorerPath = 'C:\\Windows\\explorer.exe';

        // 方法1: 直接打开文件夹
        window.cep.process.createProcess(
            explorerPath,
            folderPath,
            (err, stdout, stderr) => {
                if (err) {
                    this.log(`❌ Windows Explorer失败: ${err}`, 'error');
                    // 尝试方法2: 使用 /select 参数
                    this.tryWindowsSelect(folderPath);
                } else {
                    this.log('✅ 文件夹已通过Windows Explorer打开', 'success');
                }
            }
        );
    }

    // Mac平台打开文件夹
    openFolderMac(folderPath) {
        this.log('🍎 使用Mac方法打开文件夹...', 'info');

        // Mac使用 /usr/bin/open 命令
        window.cep.process.createProcess(
            '/usr/bin/open',
            folderPath,
            (err, stdout, stderr) => {
                if (err) {
                    this.log(`❌ Mac open失败: ${err}`, 'error');
                    // 尝试备选方案
                    this.tryMacFinder(folderPath);
                } else {
                    this.log('✅ 文件夹已通过Mac Finder打开', 'success');
                }
            }
        );
    }

    // Linux平台打开文件夹
    openFolderLinux(folderPath) {
        this.log('🐧 使用Linux方法打开文件夹...', 'info');

        // Linux尝试多种文件管理器
        const fileManagers = [
            'xdg-open',      // 通用的Linux打开命令
            'nautilus',      // GNOME文件管理器
            'dolphin',       // KDE文件管理器
            'thunar',        // XFCE文件管理器
            'pcmanfm'        // LXDE文件管理器
        ];

        this.tryLinuxFileManagers(folderPath, fileManagers, 0);
    }

    // 尝试Windows /select 参数
    tryWindowsSelect(folderPath) {
        this.log('🔄 尝试Windows /select 参数...', 'info');

        const explorerPath = 'C:\\Windows\\explorer.exe';
        const selectCommand = `/select,"${folderPath}"`;

        window.cep.process.createProcess(
            explorerPath,
            selectCommand,
            (err, stdout, stderr) => {
                if (err) {
                    this.log(`❌ Windows /select 方法也失败: ${err}`, 'error');
                    // 最后尝试CMD方法
                    this.tryWindowsCmd(folderPath);
                } else {
                    this.log('✅ 文件夹已通过Windows /select 打开', 'success');
                }
            }
        );
    }

    // Windows CMD备选方案
    tryWindowsCmd(folderPath) {
        try {
            const cmdCommand = `start "" "${folderPath}"`;
            this.log(`🔄 尝试Windows CMD命令: ${cmdCommand}`, 'info');

            window.cep.process.createProcess(
                'cmd.exe',
                `/c ${cmdCommand}`,
                (err, stdout, stderr) => {
                    if (err) {
                        this.log(`❌ Windows CMD也失败: ${err}`, 'error');
                        this.copyPathToClipboard(folderPath);
                    } else {
                        this.log('✅ 文件夹已通过Windows CMD打开', 'success');
                    }
                }
            );
        } catch (error) {
            this.log(`❌ Windows CMD命令失败: ${error.message}`, 'error');
            this.copyPathToClipboard(folderPath);
        }
    }

    // Mac Finder备选方案
    tryMacFinder(folderPath) {
        this.log('🔄 尝试Mac Finder备选方案...', 'info');

        // 尝试使用AppleScript
        const appleScript = `tell application "Finder" to open folder POSIX file "${folderPath}"`;

        window.cep.process.createProcess(
            '/usr/bin/osascript',
            `-e '${appleScript}'`,
            (err, stdout, stderr) => {
                if (err) {
                    this.log(`❌ Mac AppleScript也失败: ${err}`, 'error');
                    // 最后尝试终端命令
                    this.tryMacTerminal(folderPath);
                } else {
                    this.log('✅ 文件夹已通过Mac AppleScript打开', 'success');
                }
            }
        );
    }

    // Mac终端备选方案
    tryMacTerminal(folderPath) {
        this.log('🔄 尝试Mac终端命令...', 'info');

        window.cep.process.createProcess(
            '/bin/sh',
            `-c "open '${folderPath}'"`,
            (err, stdout, stderr) => {
                if (err) {
                    this.log(`❌ Mac终端命令也失败: ${err}`, 'error');
                    this.copyPathToClipboard(folderPath);
                } else {
                    this.log('✅ 文件夹已通过Mac终端打开', 'success');
                }
            }
        );
    }

    // Linux文件管理器尝试
    tryLinuxFileManagers(folderPath, fileManagers, index) {
        if (index >= fileManagers.length) {
            this.log('❌ 所有Linux文件管理器都失败了', 'error');
            this.copyPathToClipboard(folderPath);
            return;
        }

        const fileManager = fileManagers[index];
        this.log(`🔄 尝试Linux文件管理器: ${fileManager}`, 'info');

        window.cep.process.createProcess(
            fileManager,
            folderPath,
            (err, stdout, stderr) => {
                if (err) {
                    this.log(`❌ ${fileManager} 失败: ${err}`, 'info');
                    // 尝试下一个文件管理器
                    this.tryLinuxFileManagers(folderPath, fileManagers, index + 1);
                } else {
                    this.log(`✅ 文件夹已通过 ${fileManager} 打开`, 'success');
                }
            }
        );
    }

    // 复制文本到剪切板（通用函数）
    async copyToClipboard(text) {
        try {
            // 在CEP环境中，直接使用传统的复制方法更可靠
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);

            // 确保元素获得焦点
            textArea.focus();
            textArea.select();
            textArea.setSelectionRange(0, text.length);

            const result = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (!result) {
                // 如果传统方法失败，尝试现代API（但在CEP中可能不可用）
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                    return true;
                } else {
                    throw new Error('复制命令执行失败');
                }
            }
            return true;
        } catch (error) {
            throw new Error(`复制失败: ${error.message}`);
        }
    }

    // 复制路径到剪切板
    copyPathToClipboard(exportPath) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(exportPath).then(() => {
                    this.log('📋 文件夹路径已复制到剪切板', 'success');
                    this.log('💡 可以粘贴到文件管理器地址栏打开', 'info');
                }).catch(() => {
                    this.log(`📁 文件夹路径: ${exportPath}`, 'info');
                });
            } else {
                this.log(`📁 文件夹路径: ${exportPath}`, 'info');
            }
        } catch (error) {
            this.log(`📁 文件夹路径: ${exportPath}`, 'info');
        }
    }

    // 显示成功消息
    showSuccessMessage(exportPath, fileCount) {
        try {
            // 创建成功消息容器
            const successContainer = document.createElement('div');
            successContainer.className = 'clipboard-success';
            successContainer.style.cssText = `
                margin: 10px 0;
                padding: 15px;
                background: rgba(0, 150, 0, 0.15);
                border: 2px solid rgba(0, 150, 0, 0.4);
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
                line-height: 1.5;
                box-shadow: 0 4px 12px rgba(0, 150, 0, 0.2);
            `;

            successContainer.innerHTML = `
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="font-size: 24px; margin-right: 10px;">🎉</div>
                    <div>
                        <div style="font-weight: bold; font-size: 15px; color: #4CAF50; margin-bottom: 4px;">
                            复制成功！
                        </div>
                        <div style="color: #ccc; font-size: 12px;">
                            ${fileCount} 个PNG文件已复制到系统剪切板
                        </div>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <div style="font-weight: bold; margin-bottom: 8px; color: #fff;">📋 现在可以：</div>
                    <div style="margin-bottom: 6px;">• 在任何地方按 <kbd style="background: #333; padding: 2px 8px; border-radius: 4px; color: #fff; font-weight: bold;">Ctrl+V</kbd> 粘贴文件</div>
                    <div style="margin-bottom: 6px;">• 拖拽到其他应用程序或文件夹</div>
                    <div style="margin-bottom: 6px;">• 上传到网页、聊天软件或云存储</div>
                    <div style="color: #90EE90; font-size: 11px;">💡 文件已在剪切板中，可以立即使用</div>
                </div>

                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button id="open-folder-btn" style="padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight: 500; transition: background 0.2s;">📁 打开文件夹</button>
                    <button id="test-paste-btn" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight: 500; transition: background 0.2s;">🧪 测试粘贴</button>
                    <button id="close-success" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; font-weight: 500; transition: background 0.2s;">✖️ 关闭</button>
                </div>
            `;

            // 绑定事件
            successContainer.querySelector('#open-folder-btn').onclick = () => {
                this.openExportFolder(exportPath);
            };

            successContainer.querySelector('#test-paste-btn').onclick = () => {
                this.log('🧪 请在任意位置（如桌面、文件夹）按 Ctrl+V 测试粘贴功能', 'info');
                this.log('💡 如果成功，您应该能看到所有导出的PNG文件', 'info');
            };

            successContainer.querySelector('#close-success').onclick = () => {
                successContainer.remove();
            };

            // 添加悬停效果
            const buttons = successContainer.querySelectorAll('button');
            buttons.forEach(button => {
                const originalBg = button.style.background;
                button.onmouseover = () => {
                    if (button.id === 'open-folder-btn') button.style.background = '#005a9e';
                    else if (button.id === 'test-paste-btn') button.style.background = '#1e7e34';
                    else button.style.background = '#555';
                };
                button.onmouseout = () => {
                    button.style.background = originalBg;
                };
            });

            // 添加到日志容器
            const logContainer = document.querySelector('#log-output');
            if (logContainer) {
                logContainer.appendChild(successContainer);
                logContainer.scrollTop = logContainer.scrollHeight;
            }

            // 15秒后自动移除
            setTimeout(() => {
                if (successContainer.parentNode) {
                    successContainer.remove();
                }
            }, 15000);

        } catch (error) {
            this.log(`❌ 创建成功消息失败: ${error.message}`, 'error');
        }
    }

    // 显示简单的复制说明
    showSimpleCopyInstructions(exportPath, fileCount) {
        try {
            // 创建说明容器
            const instructionContainer = document.createElement('div');
            instructionContainer.className = 'simple-copy-instructions';
            instructionContainer.style.cssText = `
                margin: 10px 0;
                padding: 15px;
                background: rgba(0, 150, 0, 0.1);
                border: 1px solid rgba(0, 150, 0, 0.3);
                border-radius: 5px;
                color: #fff;
                font-size: 12px;
                line-height: 1.4;
            `;

            instructionContainer.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 10px; color: #4CAF50; font-size: 14px;">
                    🎉 导出成功！共 ${fileCount} 个PNG文件
                </div>
                <div style="margin-bottom: 12px; color: #fff; background: rgba(0,100,200,0.2); padding: 10px; border-radius: 4px;">
                    <div style="font-weight: bold; margin-bottom: 6px;">📋 快速复制方法：</div>
                    <div style="margin-bottom: 4px;">1️⃣ 在打开的文件夹中按 <kbd style="background: #333; padding: 2px 6px; border-radius: 3px; color: #fff;">Ctrl+A</kbd> 全选所有文件</div>
                    <div style="margin-bottom: 4px;">2️⃣ 按 <kbd style="background: #333; padding: 2px 6px; border-radius: 3px; color: #fff;">Ctrl+C</kbd> 复制文件</div>
                    <div>3️⃣ 在目标位置按 <kbd style="background: #333; padding: 2px 6px; border-radius: 3px; color: #fff;">Ctrl+V</kbd> 粘贴</div>
                </div>
                <div style="margin-bottom: 10px; color: #ccc; font-size: 11px;">
                    💡 复制后可以粘贴到任何支持文件的地方：文件夹、聊天软件、网页上传等
                </div>
                <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                    <button id="open-folder-again" style="padding: 8px 12px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500;">📁 重新打开文件夹</button>
                    <button id="copy-path" style="padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500;">📋 复制文件夹路径</button>
                    <button id="close-instructions" style="padding: 8px 12px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 500;">✖️ 关闭</button>
                </div>
            `;

            // 绑定事件
            instructionContainer.querySelector('#open-folder-again').onclick = () => {
                this.openExportFolder(exportPath);
            };

            instructionContainer.querySelector('#copy-path').onclick = () => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(exportPath).then(() => {
                        this.log('📋 文件夹路径已复制到粘贴板', 'success');
                    }).catch(() => {
                        this.log('❌ 复制路径失败', 'error');
                    });
                } else {
                    this.log(`📁 文件夹路径: ${exportPath}`, 'info');
                }
            };

            instructionContainer.querySelector('#close-instructions').onclick = () => {
                instructionContainer.remove();
            };

            // 添加到日志容器
            const logContainer = document.querySelector('#log-output');
            if (logContainer) {
                logContainer.appendChild(instructionContainer);
                logContainer.scrollTop = logContainer.scrollHeight;
            }

            // 20秒后自动移除
            setTimeout(() => {
                if (instructionContainer.parentNode) {
                    instructionContainer.remove();
                }
            }, 20000);

        } catch (error) {
            this.log(`❌ 创建操作说明失败: ${error.message}`, 'error');
        }
    }

    // 显示成功复制后的操作选项
    showSuccessActions(exportPath) {
        try {
            // 创建成功提示容器
            const successContainer = document.createElement('div');
            successContainer.className = 'copy-success';
            successContainer.style.cssText = `
                margin: 10px 0;
                padding: 15px;
                background: rgba(0, 150, 0, 0.1);
                border: 1px solid rgba(0, 150, 0, 0.3);
                border-radius: 5px;
                color: #fff;
                font-size: 12px;
                line-height: 1.4;
            `;

            successContainer.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px; color: #4CAF50;">
                    ✅ 复制成功！
                </div>
                <div style="margin-bottom: 10px; color: #ccc;">
                    所有导出的PNG文件已复制到系统剪贴板，现在可以：
                </div>
                <div style="margin-bottom: 6px;">
                    📋 在任何地方按 <kbd style="background: #333; padding: 2px 6px; border-radius: 3px;">Ctrl+V</kbd> 粘贴文件
                </div>
                <div style="margin-bottom: 6px;">
                    📁 拖拽到其他应用程序或文件夹
                </div>
                <div style="margin-bottom: 10px;">
                    🌐 上传到网页或云存储服务
                </div>
                <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <button id="open-folder-btn" style="padding: 6px 12px; background: #007acc; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">📁 打开文件夹</button>
                    <button id="close-success" style="padding: 6px 12px; background: #666; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">✖️ 关闭</button>
                </div>
            `;

            // 绑定事件
            successContainer.querySelector('#open-folder-btn').onclick = () => {
                this.openExportFolder(exportPath);
                successContainer.remove();
            };

            successContainer.querySelector('#close-success').onclick = () => {
                successContainer.remove();
            };

            // 添加到日志容器
            const logContainer = document.querySelector('#log-output');
            if (logContainer) {
                logContainer.appendChild(successContainer);
                logContainer.scrollTop = logContainer.scrollHeight;
            }

            // 10秒后自动移除
            setTimeout(() => {
                if (successContainer.parentNode) {
                    successContainer.remove();
                }
            }, 10000);

        } catch (error) {
            this.log(`❌ 创建成功提示失败: ${error.message}`, 'error');
        }
    }



    // 打开导出文件夹（跨平台）
    openExportFolder(exportPath) {
        try {
            this.log(`📁 尝试打开导出文件夹: ${exportPath}`, 'info');

            if (window.cep && window.cep.process) {
                // 使用跨平台的打开方法
                const platform = this.detectPlatform();
                this.log(`🖥️ 检测到平台: ${platform}`, 'info');

                this.openFolderByPlatform(exportPath, platform);
            } else {
                this.log('❌ CEP process API不可用', 'error');
                this.copyPathToClipboard(exportPath);
            }
        } catch (error) {
            this.log(`❌ 打开文件夹出错: ${error.message}`, 'error');
            this.copyPathToClipboard(exportPath);
        }
    }

    // 已移除旧的tryAlternativeOpenFolder方法，现在使用跨平台的方法

    // 显示路径作为最后的备选方案
    showPathAsFallback(exportPath) {
        this.log('💡 无法自动打开文件夹，请手动打开以下路径：', 'warning');
        this.log(`📁 ${exportPath}`, 'info');

        // 尝试复制路径到粘贴板
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(exportPath).then(() => {
                this.log('📋 文件夹路径已复制到粘贴板', 'success');
            }).catch(() => {
                this.log('❌ 复制路径失败', 'error');
            });
        }
    }

    // 显示打开导出文件夹的选项
    showExportFolderOption(exportPath) {
        try {
            // 创建一个临时按钮让用户打开文件夹
            const openFolderBtn = document.createElement('button');
            openFolderBtn.textContent = '📁 打开导出文件夹';
            openFolderBtn.className = 'btn btn-secondary btn-sm';
            openFolderBtn.style.margin = '5px';

            openFolderBtn.onclick = () => {
                // 使用跨平台的方法打开文件夹
                if (window.cep && window.cep.process) {
                    const platform = this.detectPlatform();
                    this.openFolderByPlatform(exportPath, platform);
                } else {
                    // 备选方案：复制路径到粘贴板
                    navigator.clipboard.writeText(exportPath).then(() => {
                        this.log('📋 导出路径已复制到粘贴板', 'info');
                    });
                }

                // 移除按钮
                openFolderBtn.remove();
            };

            // 将按钮添加到日志区域
            const logContainer = document.querySelector('.log-container');
            if (logContainer) {
                logContainer.appendChild(openFolderBtn);

                // 5秒后自动移除按钮
                setTimeout(() => {
                    if (openFolderBtn.parentNode) {
                        openFolderBtn.remove();
                    }
                }, 5000);
            }

        } catch (error) {
            this.log(`❌ 创建打开文件夹按钮失败: ${error.message}`, 'error');
        }
    }

    // 检测图层
    async detectLayers() {
        this.log('开始检测选中的图层...', 'info');

        // 检查项目状态
        const projectStatusValid = await this.projectStatusChecker.validateProjectStatus({
            requireProject: true,
            requireActiveComposition: true,
            showWarning: true
        });

        if (!projectStatusValid) {
            this.log('检测操作被阻止：项目状态不满足要求', 'warning');
            return;
        }

        // 首先测试ExtendScript连接
        const connectionOk = await this.testExtendScriptConnection();
        if (!connectionOk) {
            this.log('ExtendScript连接失败，请检查扩展配置', 'error');
            return;
        }

        try {
            const result = await this.executeExtendScript('detectSelectedLayers', {});

            if (result.success) {
                this.log(`检测完成: ${result.compName}`, 'success');

                // 输出检测日志（分组显示）
                if (result.logs && result.logs.length > 0) {
                    this.logGroup('检测详情', result.logs, 'debug', true);
                }

            } else {
                this.log(`检测失败: ${result.error || '未知错误'}`, 'error');
            }
        } catch (error) {
            this.log(`检测过程出错: ${error.message}`, 'error');
            this.log('建议：1. 检查是否选择了合成 2. 检查是否选中了图层', 'warning');
        }
    }

    // 导出到Eagle
    async exportToEagle() {
        this.log('开始导出图层到Eagle...', 'info');

        // 检查项目状态
        const projectStatusValid = await this.projectStatusChecker.validateProjectStatus({
            requireProject: true,
            requireActiveComposition: true,
            showWarning: true
        });

        if (!projectStatusValid) {
            this.log('导出到Eagle操作被阻止：项目状态不满足要求', 'warning');
            return;
        }

        // 验证前置条件
        const connectionOk = await this.testExtendScriptConnection();
        if (!connectionOk) {
            this.log('ExtendScript连接失败，请检查扩展配置', 'error');
            return;
        }

        // 独立的Eagle连接检测
        if (this.connectionState !== ConnectionState.CONNECTED) {
            this.log('未连接到Eagle，请先建立连接', 'error');
            // 调用JSX显示警告对话框
            try {
                await this.executeExtendScript('exportToEagleWithConnectionCheck', {
                    exportSettings: {},
                    connectionStatus: { connected: false }
                });
            } catch (error) {
                this.log('显示Eagle连接警告时出错: ' + error.message, 'error');
            }
            return;
        }

        try {
            // 获取用户的导出设置
            const exportSettings = this.getExportSettingsFromUI();
            this.log(`📋 使用导出设置: 模式=${exportSettings.mode}, 自动复制=${exportSettings.autoCopy}, 阅后即焚=${exportSettings.burnAfterReading}`, 'info');
            
            // 验证导出路径
            let exportPath = '';
            let needsProjectInfo = false;
            
            switch (exportSettings.mode) {
                case 'desktop':
                    exportPath = 'desktop'; // JSX脚本会处理桌面路径
                    this.log('📁 使用桌面导出模式', 'info');
                    break;
                    
                case 'project_adjacent':
                    needsProjectInfo = true;
                    const projectInfo = await this.getProjectInfo();
                    if (!projectInfo || !projectInfo.projectPath) {
                        this.log('❌ 无法获取AE项目路径，请确保项目已保存后再使用项目旁导出功能', 'error');
                        return;
                    }
                    const projectDir = projectInfo.projectPath.replace(/[^\\]*$/, '');
                    const folderName = exportSettings.projectAdjacentFolder || 'Eagle_Assets';
                    exportPath = projectDir + folderName;
                    this.log(`📁 使用项目旁导出: ${exportPath}`, 'info');
                    break;
                    
                case 'custom_folder':
                    exportPath = exportSettings.customExportPath;
                    if (!exportPath || exportPath.trim() === '') {
                        this.log('❌ 指定文件夹路径为空，请先在导出设置中选择目标文件夹', 'error');
                        return;
                    }
                    // 验证路径格式
                    if (exportPath.startsWith('[已选择]')) {
                        this.log('❌ 检测到无效的路径格式，请重新选择文件夹', 'error');
                        return;
                    }
                    this.log(`📁 使用指定文件夹导出: ${exportPath}`, 'info');
                    break;
                    
                default:
                    this.log('❌ 未知的导出模式，使用桌面导出作为回退', 'warning');
                    exportPath = 'desktop';
                    exportSettings.mode = 'desktop';
            }

            // 准备完整的导出设置
            const currentSettings = this.settingsManager.getSettings();
            let completeExportSettings = {
                exportSettings: {
                    mode: exportSettings.mode,
                    customExportPath: exportPath,
                    projectAdjacentFolder: exportSettings.projectAdjacentFolder,
                    autoCopy: exportSettings.autoCopy,
                    burnAfterReading: exportSettings.burnAfterReading,
                    addTimestamp: exportSettings.addTimestamp,
                    createSubfolders: exportSettings.createSubfolders
                },
                fileManagement: currentSettings.fileManagement,
                timelineOptions: currentSettings.timelineOptions
            };
            
            this.log(`🚀 开始导出图层到路径: ${exportPath}`, 'info');
            this.log(`⚙️ 导出选项: 时间戳前缀=${exportSettings.addTimestamp}, 合成名前缀=${exportSettings.createSubfolders}`, 'info');

            // 执行导出
            const result = await this.executeExtendScript('exportSelectedLayers', completeExportSettings);

            if (result.success) {
                this.log(`🎉 导出完成: ${result.totalExported} 个图层已导出`, 'success');
                this.log(`📁 导出路径: ${result.exportPath}`, 'info');

                // 播放成功音效
                try {
                    if (this.soundPlayer && typeof this.soundPlayer.playConnectionSuccess === 'function') {
                        this.soundPlayer.playConnectionSuccess();
                    }
                } catch (soundError) {
                    // 忽略音效播放错误
                }

                // 处理导出后的操作
                if (result.exportedLayers && result.exportedLayers.length > 0) {
                    // 验证文件路径有效性
                    const validFiles = [];
                    for (const layer of result.exportedLayers) {
                        if (layer.filePath && layer.filePath.trim() !== '') {
                            validFiles.push(layer);
                            this.log(`✅ 文件路径验证通过: ${layer.filePath}`, 'debug');
                        } else {
                            this.log(`❌ 文件路径无效: ${layer.layerName || '未知图层'}`, 'warning');
                        }
                    }
                    
                    if (validFiles.length === 0) {
                        this.log('❌ 没有有效的导出文件，无法导入到Eagle', 'error');
                        return;
                    }
                    
                    // 自动复制到剪贴板（如果启用）
                    if (exportSettings.autoCopy) {
                        this.log('📋 自动复制功能已启用，正在复制文件到剪贴板...', 'info');
                        try {
                            await this.copyExportedFilesToClipboard();
                            this.log('📋 文件已复制到剪贴板', 'success');
                        } catch (copyError) {
                            this.log(`📋 复制到剪贴板失败: ${copyError.message}`, 'warning');
                        }
                    }
                    
                    // 自动导入到Eagle
                    this.log('正在将导出的文件导入到Eagle...', 'info');
                    try {
                        // 发送importFiles消息到Eagle插件
                        const filesToImport = validFiles.map(layer => ({
                            path: layer.filePath,
                            name: layer.layerName || layer.name,
                            filePath: layer.filePath
                        }));
                        
                        this.log(`📤 准备导入 ${filesToImport.length} 个文件到Eagle:`, 'debug');
                        filesToImport.forEach((file, index) => {
                            this.log(`  ${index + 1}. ${file.name} -> ${file.path}`, 'debug');
                        });
                        
                        // 如果启用阅后即焚，标记文件需要在导入后删除
                        const importData = {
                            files: filesToImport
                        };
                        
                        if (exportSettings.burnAfterReading) {
                            importData.burnAfterReading = true;
                            importData.tempFiles = filesToImport.map(f => f.path);
                            this.log('🔥 阅后即焚模式已启用，文件将在导入Eagle后自动删除', 'info');
                        }
                        
                        await this.sendToEagle({
                            type: 'importFiles',
                            data: importData
                        });

                        this.log('📤 导入请求已发送到Eagle，等待处理结果...', 'info');
                        
                        // 注意：实际的导入结果会通过eagle_import_result消息异步返回
                        // 这里不需要等待同步响应
                        
                    } catch (importError) {
                        this.log(`发送Eagle导入请求失败: ${importError.message}`, 'warning');
                        this.log('💡 文件已导出，可手动拖拽到Eagle中', 'info');
                    }
                }

                // 输出导出日志
                if (result.logs && result.logs.length > 0) {
                    result.logs.forEach((logMessage, index) => {
                        this.log(logMessage, 'debug', {
                            group: '导出详情',
                            collapsed: true,
                            groupEnd: index === result.logs.length - 1
                        });
                    });
                }

            } else {
                this.log(`❌ 导出失败: ${result.error || '未知错误'}`, 'error');
                if (result.logs) {
                    result.logs.forEach(logMessage => {
                        this.log(logMessage, 'error');
                    });
                }
            }
        } catch (error) {
            this.log(`导出到Eagle过程出错: ${error.message}`, 'error');
            this.log('建议：1. 检查是否选择了合成 2. 检查是否选中了图层 3. 检查Eagle连接状态', 'warning');
        }
    }

    // 处理Eagle导入结果
    handleEagleImportResult(result) {
        try {
            if (result.success) {
                this.log(`✅ Eagle导入成功: ${result.importedCount} 个文件已导入`, 'success');
                
                if (result.failedCount > 0) {
                    this.log(`⚠️ ${result.failedCount} 个文件导入失败`, 'warning');
                }
                
                // 处理阅后即焚结果
                if (result.burnAfterReading && result.deletedTempFiles > 0) {
                    this.log(`🔥 阅后即焚完成: 已自动删除 ${result.deletedTempFiles} 个临时文件`, 'success');
                }
                
                // 播放成功音效
                try {
                    if (this.soundPlayer && typeof this.soundPlayer.playConnectionSuccess === 'function') {
                        this.soundPlayer.playConnectionSuccess();
                    }
                } catch (soundError) {
                    // 忽略音效播放错误
                }
                
            } else {
                this.log(`❌ Eagle导入失败: ${result.error || '未知错误'}`, 'error');
                this.log('💡 文件已导出，可手动拖拽到Eagle中', 'info');
            }
        } catch (error) {
            this.log(`处理Eagle导入结果时出错: ${error.message}`, 'error');
        }
    }

    // 获取项目信息
    async getProjectInfo() {
        try {
            const result = await this.executeExtendScript('getProjectInfo', {});
            if (result.success) {
                return result.projectInfo;
            } else {
                this.log(`获取项目信息失败: ${result.error}`, 'warning');
                return null;
            }
        } catch (error) {
            this.log(`获取项目信息出错: ${error.message}`, 'error');
            return null;
        }
    }

    // 导出图层
    async exportLayers() {
        this.log('开始导出选中的图层...', 'info');

        // 检查项目状态
        const projectStatusValid = await this.projectStatusChecker.validateProjectStatus({
            requireProject: true,
            requireActiveComposition: true,
            showWarning: true
        });

        if (!projectStatusValid) {
            this.log('导出操作被阻止：项目状态不满足要求', 'warning');
            return;
        }

        // 首先测试ExtendScript连接
        const connectionOk = await this.testExtendScriptConnection();
        if (!connectionOk) {
            this.log('ExtendScript连接失败，请检查扩展配置', 'error');
            return;
        }

        try {
            // 获取当前设置
            const currentSettings = this.settingsManager.getSettings();

            // 准备导出设置 - 使用新的导出设置
            let exportSettings = {
                exportSettings: currentSettings.exportSettings,
                fileManagement: currentSettings.fileManagement,
                timelineOptions: currentSettings.timelineOptions
            };

            // 检查是否启用阅后即焚模式
            if (currentSettings.exportSettings.burnAfterReading) {
                this.log('🔥 阅后即焚模式已启用，使用临时文件夹导出', 'info');

                try {
                    // 创建临时文件夹
                    const tempResponse = await this.sendToEagle({
                        action: 'createTempFolder'
                    });

                    if (tempResponse.success) {
                        // 修改导出设置使用临时文件夹
                        exportSettings.exportSettings = {
                            ...exportSettings.exportSettings,
                            mode: 'custom_folder',
                            customExportPath: tempResponse.data.path,
                            burnAfterReading: true // 标记为阅后即焚模式
                        };

                        this.log(`📁 临时文件夹已创建: ${tempResponse.data.path}`, 'info');
                    } else {
                        throw new Error(tempResponse.error || '创建临时文件夹失败');
                    }
                } catch (tempError) {
                    this.log(`❌ 临时文件夹创建失败: ${tempError.message}`, 'error');
                    this.log('回退到正常导出模式', 'warning');
                    // 继续使用正常导出模式
                }
            }

            this.log(`📋 使用导出设置: 模式=${exportSettings.exportSettings.mode}`, 'info');

            const result = await this.executeExtendScript('exportSelectedLayers', exportSettings);

            if (result.success) {
                this.log(`🎉 导出完成: ${result.totalExported} 个图层已导出`, 'success');
                this.log(`📁 导出路径: ${result.exportPath}`, 'info');

                // 输出导出日志（分组显示）
                if (result.logs && result.logs.length > 0) {
                    result.logs.forEach((logMessage, index) => {
                        this.log(logMessage, 'debug', {
                            group: '导出详情',
                            collapsed: true,
                            groupEnd: index === result.logs.length - 1
                        });
                    });
                }

                // 播放成功音效
                try {
                    if (this.soundPlayer && typeof this.soundPlayer.playConnectionSuccess === 'function') {
                        this.soundPlayer.playConnectionSuccess();
                    }
                } catch (soundError) {
                    // 忽略音效播放错误
                }

                // 先保存导出信息，供复制功能使用
                if (result.exportedLayers && result.exportedLayers.length > 0) {
                    this.showFinalExportResult(result.exportPath, result.exportedLayers);
                }

                // 检查是否启用自动复制或阅后即焚
                const exportSettings = this.getExportSettingsFromUI();

                if (exportSettings.burnAfterReading) {
                    // 阅后即焚模式：直接复制文件到剪切板
                    this.log('🔥 阅后即焚模式：正在复制文件到剪切板...', 'info');
                    try {
                        if (result.exportedLayers && result.exportedLayers.length > 0) {
                            await this.copyExportedFilesToClipboard();
                            this.log('📋 文件已复制到剪切板，临时文件将在后台管理', 'success');

                            // 检查临时文件夹是否需要清理
                            setTimeout(async () => {
                                try {
                                    const status = await this.checkTempFolderStatus(true); // 强制刷新
                                    if (status.needsCleanup) {
                                        this.log(`🗑️ 临时文件夹已达到清理条件 - 大小: ${status.size.toFixed(2)}MB, 文件数: ${status.count}`, 'info');
                                        await this.cleanupTempFolder();
                                        this.log('🗑️ 临时文件夹已自动清理', 'success');
                                    }
                                    // 更新tooltip显示最新状态（不需要强制刷新，因为上面已经刷新过了）
                                    this.updateBurnAfterReadingTooltip();
                                } catch (cleanupError) {
                                    this.log(`临时文件夹清理检查失败: ${cleanupError.message}`, 'warning');
                                }
                            }, 1000); // 延迟1秒检查，确保文件复制完成
                        }
                    } catch (copyError) {
                        this.log(`🔥 阅后即焚文件复制失败: ${copyError.message}`, 'error');
                        this.log('💡 可以手动打开临时文件夹复制文件', 'info');
                    }
                } else if (exportSettings.autoCopy && result.exportPath) {
                    // 正常的自动复制模式
                    try {
                        // 首先复制路径
                        await this.copyToClipboard(result.exportPath);
                        this.log('📋 导出路径已自动复制到剪切板', 'success');

                        // 然后尝试复制文件（如果有导出的文件）
                        if (result.exportedLayers && result.exportedLayers.length > 0) {
                            this.log('📋 正在尝试复制导出的文件到剪切板...', 'info');
                            try {
                                await this.copyExportedFilesToClipboard();
                            } catch (filesCopyError) {
                                this.log(`📋 文件复制失败: ${filesCopyError.message}`, 'warning');
                                this.log('💡 路径已复制，可手动打开文件夹复制文件', 'info');
                            }
                        }
                    } catch (copyError) {
                        this.log(`📋 自动复制失败: ${copyError.message}`, 'warning');
                    }
                }

            } else {
                this.log(`❌ 导出失败: ${result.error || '未知错误'}`, 'error');
                if (result.logs) {
                    result.logs.forEach(logMessage => {
                        this.log(logMessage, 'error');
                    });
                }
            }
        } catch (error) {
            this.log(`导出过程出错: ${error.message}`, 'error');
            this.log('建议：1. 检查是否选择了合成 2. 检查是否选中了图层 3. 检查导出路径权限', 'warning');
        }
    }

    // 发送消息到Eagle（WebSocket优先）
    async sendToEagle(message) {
        if (this.connectionState !== ConnectionState.CONNECTED) {
            this.log('无法发送消息：未连接到Eagle', 'warning');
            return;
        }

        // 检查是否是临时文件夹操作
        const tempFolderActions = ['cleanupTempFolder', 'openTempFolder', 'checkTempFolderSize', 'createTempFolder'];
        if (message.action && tempFolderActions.includes(message.action)) {
            // 使用专门的临时文件夹操作端点
            try {
                this.log(`发送临时文件夹操作请求: ${message.action}`, 'debug');
                this.log(`请求URL: ${this.eagleUrl}/temp-folder-action`, 'debug');
                this.log(`请求体: ${JSON.stringify(message)}`, 'debug');

                const response = await fetch(`${this.eagleUrl}/temp-folder-action`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message)
                });

                this.log(`响应状态: ${response.status}`, 'debug');

                if (!response.ok) {
                    const errorText = await response.text();
                    this.log(`响应错误内容: ${errorText}`, 'error');
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const result = await response.json();
                this.log(`临时文件夹操作响应: ${JSON.stringify(result)}`, 'debug');
                return result;
            } catch (error) {
                this.log(`临时文件夹操作失败: ${error.message}`, 'error');
                throw error;
            }
        }

        // 优先使用WebSocket发送
        if (this.webSocketClient && this.webSocketClient.isConnected()) {
            try {
                const messageType = this.getWebSocketMessageType(message.type);
                await this.webSocketClient.sendMessage(messageType, message.data || message);
                this.log(`WebSocket消息已发送: ${message.type}`, 'debug');
                return;
            } catch (error) {
                this.log(`WebSocket发送失败，回退到HTTP: ${error.message}`, 'warning');
            }
        }

        // 回退到HTTP发送（包含客户端ID）
        try {
            const messageWithClientId = {
                ...message,
                clientId: this.clientId
            };

            const response = await fetch(`${this.eagleUrl}/ae-message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageWithClientId)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || '发送失败');
            }

            this.log(`HTTP消息已发送: ${message.type}`, 'debug');
        } catch (error) {
            this.log(`发送消息失败: ${error.message}`, 'error');
        }
    }

    // 获取WebSocket消息类型映射
    getWebSocketMessageType(httpMessageType) {
        const typeMap = {
            'ae_status': 'status.ae',
            'import_result': 'file.import_complete',
            'import_progress': 'file.import_progress',
            'import_error': 'file.import_error'
        };

        return typeMap[httpMessageType] || httpMessageType;
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
    // 调用AE脚本
    async callAEScript(functionName, data) {
        return new Promise((resolve, reject) => {
            try {
                // 构造脚本调用
                const scriptCall = `${functionName}(${JSON.stringify(data)})`;
                
                this.csInterface.evalScript(scriptCall, (result) => {
                    try {
                        if (result === 'EvalScript error.') {
                            reject(new Error(`AE脚本执行失败: ${functionName}`));
                            return;
                        }
                        
                        // 尝试解析JSON结果
                        const parsedResult = JSON.parse(result);
                        resolve(parsedResult);
                    } catch (parseError) {
                        // 如果不是JSON，直接返回字符串结果
                        resolve({ success: true, result: result });
                    }
                });
            } catch (error) {
                reject(new Error(`调用AE脚本失败: ${error.message}`));
            }
        });
    }

    async getProjectInfo() {
        // 如果是演示模式，返回演示数据
        if (window.__DEMO_MODE_ACTIVE__ && window.__DEMO_DATA__) {
            const aeData = window.__DEMO_DATA__.ae.connected;
            return {
                projectPath: aeData.projectPath,
                projectName: aeData.projectName,
                activeComp: { name: aeData.activeComp },
                isReady: true
            };
        }

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

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0B';
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
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
    async refreshProjectInfo() {
        this.logDebug('刷新项目信息...', 'info');

        try {
            // 获取最新的项目信息
            const projectInfo = await this.getProjectInfo();

            // 更新当前项目信息
            this.currentProject = {
                path: projectInfo.projectPath,
                name: projectInfo.projectName,
                activeComp: projectInfo.activeComp,
                isReady: projectInfo.isReady
            };

            // 发送更新后的状态到Eagle
            await this.sendAEStatus();

            this.logDebug(`项目信息已刷新: ${projectInfo.projectName} - ${projectInfo.activeComp ? projectInfo.activeComp.name : 'No Active Comp'}`, 'debug');

            return projectInfo;
        } catch (error) {
            this.logError(`刷新项目信息失败: ${error.message}`);
            throw error;
        }
    }

    // 更新项目信息UI
    updateProjectUI(projectInfo) {
        // 更新项目名称并添加悬浮提示
        const projectNameElement = document.getElementById('project-name');
        const projectName = projectInfo.projectName || '未打开项目';
        projectNameElement.textContent = projectName;
        if (projectName && projectName !== '未打开项目') {
            projectNameElement.title = projectName; // 添加悬浮提示
        } else {
            projectNameElement.removeAttribute('title');
        }

        // 更新合成名称并添加悬浮提示
        const compNameElement = document.getElementById('comp-name');
        const compName = projectInfo.activeComp?.name || '无';
        compNameElement.textContent = compName;
        if (compName && compName !== '无') {
            compNameElement.title = compName; // 添加悬浮提示
        } else {
            compNameElement.removeAttribute('title');
        }

        // 更新项目路径
        const projectPathElement = document.getElementById('project-path');
        if (projectPathElement) {
            const projectPath = projectInfo.projectPath || '未知';
            projectPathElement.textContent = projectPath;
            // 只有在projectPath不是undefined且不是字符串"undefined"时才设置title
            if (projectPath && projectPath !== '未知' && projectPath !== 'undefined') {
                projectPathElement.title = projectPath; // 设置悬浮显示完整路径
            }

            // 如果有有效路径，添加双击事件监听器
            if (projectPath && projectPath !== '未知' && projectPath !== '未打开项目') {
                projectPathElement.classList.add('clickable');
                projectPathElement.onclick = () => {
                    // 获取项目文件所在的目录
                    const projectDir = projectPath.substring(0, projectPath.lastIndexOf('\\'));
                    this.openFolder(projectDir);
                };
            } else {
                projectPathElement.classList.remove('clickable');
                projectPathElement.onclick = null;
            }
        }

        const aeStatusElement = document.getElementById('ae-status');
        if (aeStatusElement) {
            aeStatusElement.textContent = projectInfo.isReady ? '准备就绪' : '未就绪';
        }
    }

    // 获取AE版本信息
    getAEVersion() {
        try {
            // 确保DOM元素存在
            const versionElement = document.getElementById('ae-version');
            if (!versionElement) {
                console.warn('ae-version元素不存在，延迟执行');
                // 延迟执行，等待DOM加载完成
                setTimeout(() => this.getAEVersion(), 100);
                return;
            }

            // 使用CEP环境API获取AE版本
            if (typeof CSInterface !== 'undefined') {
                const csInterface = new CSInterface();
                const hostEnvironment = csInterface.getHostEnvironment();

                if (hostEnvironment && hostEnvironment.appVersion) {
                    const version = hostEnvironment.appVersion;
                    // 获取更多详细信息
                    const appName = hostEnvironment.appName || 'After Effects';
                    const appId = hostEnvironment.appId || '';

                    // 组合显示版本信息
                    const fullVersion = `${version}`;
                    versionElement.textContent = fullVersion;
                    versionElement.title = `After Effects版本: ${fullVersion}`; // 添加悬浮提示
                    console.log(`AE版本获取成功: ${fullVersion}`);
                } else {
                    versionElement.textContent = '未知';
                    versionElement.removeAttribute('title');
                    console.warn('无法获取AE版本信息');
                }
            } else {
                versionElement.textContent = '未知';
                versionElement.removeAttribute('title');
                console.warn('CSInterface不可用');
            }
        } catch (error) {
            console.error('获取AE版本失败:', error);
            const versionElement = document.getElementById('ae-version');
            if (versionElement) {
                versionElement.textContent = '获取失败';
                versionElement.removeAttribute('title');
            }
        }
    }

    // 在启动时更新AE信息
    async updateAEInfoOnStartup() {
        try {
            // 获取并显示项目信息
            const projectInfo = await this.getProjectInfo();
            this.updateProjectUI(projectInfo);
            
            // 更新AE状态显示为已就绪
            const aeStatusElement = document.getElementById('ae-status');
            if (aeStatusElement) {
                aeStatusElement.textContent = '已就绪';
                aeStatusElement.className = 'status-ready';
            }
            
            this.log('AE项目信息已更新', 'info');
        } catch (error) {
            this.log(`更新AE信息失败: ${error.message}`, 'warning');
            
            // 设置默认状态
            const aeStatusElement = document.getElementById('ae-status');
            if (aeStatusElement) {
                aeStatusElement.textContent = '未知';
                aeStatusElement.className = 'status-unknown';
            }
        }
    }

    // 更新Eagle信息UI
    updateEagleUI(eagleStatus) {
        if (eagleStatus) {
            // 更新Eagle版本并添加悬浮提示
            const eagleVersionElement = document.getElementById('eagle-version');
            const eagleVersion = eagleStatus.version || '未知';
            eagleVersionElement.textContent = eagleVersion;
            if (eagleVersion && eagleVersion !== '未知') {
                eagleVersionElement.title = `Eagle版本: ${eagleVersion}`; // 添加悬浮提示
            } else {
                eagleVersionElement.removeAttribute('title');
            }

            // 更新Eagle路径并设置悬浮显示 - 显示安装路径
            const eaglePathElement = document.getElementById('eagle-path');
            const eaglePath = eagleStatus.execPath || '未知';
            eaglePathElement.textContent = eaglePath;
            // 只有在eaglePath不是undefined且不是字符串"undefined"时才设置title
            if (eaglePath && eaglePath !== '未知' && eaglePath !== 'undefined') {
                eaglePathElement.title = `Eagle安装路径: ${eaglePath}`; // 设置悬浮显示完整路径
            } else {
                eaglePathElement.removeAttribute('title');
            }

            // Eagle路径不设置点击事件
            eaglePathElement.classList.remove('clickable');
            eaglePathElement.onclick = null;

            // 更新资源库信息并设置点击事件
            const eagleLibraryElement = document.getElementById('eagle-library');
            const libraryPath = eagleStatus.libraryPath || '未知';
            const libraryName = eagleStatus.libraryName || '未知';

            // 格式化显示：资源库名称 | 大小
            let displayText = libraryName;
            if (eagleStatus.librarySize !== undefined && eagleStatus.librarySize !== null) {
                if (eagleStatus.librarySize === -1) {
                    // -1 表示正在计算中
                    displayText = `${libraryName} | 计算中...`;
                } else if (eagleStatus.librarySize > 0) {
                    const formattedSize = this.formatFileSize(eagleStatus.librarySize);
                    displayText = `${libraryName} | ${formattedSize}`;
                }
            }

            eagleLibraryElement.textContent = displayText;
            // 设置悬浮显示完整信息
            if (libraryPath && libraryPath !== '未知' && libraryPath !== 'undefined') {
                let tooltipText = `资源库路径: ${libraryPath}`;
                if (libraryName && libraryName !== '未知') {
                    tooltipText = `资源库: ${libraryName}\n路径: ${libraryPath}`;
                }
                if (eagleStatus.librarySize !== undefined && eagleStatus.librarySize !== null && eagleStatus.librarySize > 0) {
                    const formattedSize = this.formatFileSize(eagleStatus.librarySize);
                    tooltipText += `\n大小: ${formattedSize}`;
                }
                eagleLibraryElement.title = tooltipText;
            } else {
                eagleLibraryElement.removeAttribute('title');
            }

            // 资源库可以双击打开
            if (libraryPath && libraryPath !== '未知' && libraryPath !== '获取失败') {
                eagleLibraryElement.classList.add('clickable');
                eagleLibraryElement.onclick = () => this.openFolder(libraryPath);
            } else {
                eagleLibraryElement.classList.remove('clickable');
                eagleLibraryElement.onclick = null;
            }

            // 更新当前组并添加悬浮提示
            const eagleFolderElement = document.getElementById('eagle-folder');
            const folderPath = eagleStatus.folderPath || '未选择';
            eagleFolderElement.textContent = folderPath;
            if (folderPath && folderPath !== '未选择') {
                eagleFolderElement.title = `当前组: ${folderPath}`; // 添加悬浮提示
            } else {
                eagleFolderElement.removeAttribute('title');
            }
        } else {
            // 未连接状态下清除所有悬浮提示
            const eagleVersionElement = document.getElementById('eagle-version');
            eagleVersionElement.textContent = '未连接';
            eagleVersionElement.removeAttribute('title');

            const eaglePathElement = document.getElementById('eagle-path');
            eaglePathElement.textContent = '未连接';
            eaglePathElement.removeAttribute('title');
            eaglePathElement.classList.remove('clickable');
            eaglePathElement.onclick = null;

            const eagleLibraryElement = document.getElementById('eagle-library');
            eagleLibraryElement.textContent = '未连接';
            eagleLibraryElement.removeAttribute('title');
            eagleLibraryElement.classList.remove('clickable');
            eagleLibraryElement.onclick = null;

            const eagleFolderElement = document.getElementById('eagle-folder');
            eagleFolderElement.textContent = '未连接';
            eagleFolderElement.removeAttribute('title');
        }
    }

    // 从服务器获取Eagle状态信息
    // 获取Eagle基本信息（不包括资源库大小）
    async updateEagleBasicInfo() {
        // 如果是演示模式，使用演示数据
        if (window.__DEMO_MODE_ACTIVE__ && window.__DEMO_DATA__) {
            const eagleData = window.__DEMO_DATA__.eagle.connected;
            this.updateEagleUI({
                version: eagleData.version,
                execPath: eagleData.execPath,
                libraryPath: eagleData.libraryPath,
                libraryName: eagleData.libraryName,
                librarySize: -1 // 标记为计算中
            });
            return;
        }

        try {
            const response = await fetch(`${this.eagleUrl}/ae-status?basic=true`);
            if (response.ok) {
                const data = await response.json();
                if (data.eagleStatus) {
                    // 设置资源库大小为计算中状态
                    data.eagleStatus.librarySize = -1;
                    this.updateEagleUI(data.eagleStatus);
                    this.log('Eagle基本信息已获取', 'info');
                }
            }
        } catch (error) {
            this.log(`获取Eagle基本信息失败: ${error.message}`, 'warning');
        }
    }

    // 延迟获取资源库大小
    scheduleLibrarySizeUpdate() {
        // 清除之前的定时器
        if (this.librarySizeTimer) {
            clearTimeout(this.librarySizeTimer);
        }
        
        // 延迟3秒后获取资源库大小
        this.librarySizeTimer = setTimeout(async () => {
            try {
                await this.updateLibrarySize();
            } catch (error) {
                this.log(`获取资源库大小失败: ${error.message}`, 'warning');
            }
        }, 3000);
        
        this.log('已安排延迟获取资源库大小', 'info');
    }

    // 获取资源库大小
    async updateLibrarySize() {
        // 如果是演示模式，使用演示数据
        if (window.__DEMO_MODE_ACTIVE__ && window.__DEMO_DATA__) {
            const eagleData = window.__DEMO_DATA__.eagle.connected;
            this.updateEagleUI({
                version: eagleData.version,
                execPath: eagleData.execPath,
                libraryPath: eagleData.libraryPath,
                libraryName: eagleData.libraryName,
                librarySize: eagleData.librarySize || 0
            });
            return;
        }

        try {
            const response = await fetch(`${this.eagleUrl}/ae-status?librarySize=true`);
            if (response.ok) {
                const data = await response.json();
                if (data.eagleStatus) {
                    this.updateEagleUI(data.eagleStatus);
                    this.log('资源库大小已更新', 'info');
                }
            }
        } catch (error) {
            this.log(`获取资源库大小失败: ${error.message}`, 'warning');
        }
    }

    async updateEagleStatusFromServer() {
        // 如果是演示模式，使用演示数据
        if (window.__DEMO_MODE_ACTIVE__ && window.__DEMO_DATA__) {
            const eagleData = window.__DEMO_DATA__.eagle.connected;
            this.updateEagleUI({
                version: eagleData.version,
                execPath: eagleData.execPath,
                libraryPath: eagleData.libraryPath,
                libraryName: eagleData.libraryName,
                librarySize: eagleData.librarySize || 0
            });
            return;
        }

        try {
            const response = await fetch(`${this.eagleUrl}/ae-status`);
            if (response.ok) {
                const data = await response.json();
                if (data.eagleStatus) {
                    this.updateEagleUI(data.eagleStatus);
                }
            }
        } catch (error) {
            // 静默处理错误，避免日志过多
            console.log('获取Eagle状态失败:', error.message);
        }
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
        if (!Array.isArray(newLogs) || newLogs.length === 0) {
            return;
        }

        // 如果在忽略期内，跳过历史日志
        if (this.ignoreEagleLogsUntil && Date.now() < this.ignoreEagleLogsUntil) {
            console.log('忽略Eagle历史日志，等待清理完成...');
            return;
        }

        // 初始化重复日志计数器
        if (!this.logDuplicateTracker) {
            this.logDuplicateTracker = new Map();
        }

        const processedLogs = [];
        const now = Date.now();
        const duplicateWindow = 60000; // 60秒内的重复消息会被合并

        newLogs.forEach(log => {
            // 生成消息的唯一键（忽略时间戳，只看消息内容）
            const messageKey = this.generateLogKey(log.message);
            
            // 检查是否是重复消息
            if (this.logDuplicateTracker.has(messageKey)) {
                const existing = this.logDuplicateTracker.get(messageKey);
                
                // 如果在时间窗口内，增加计数
                if (now - existing.firstSeen < duplicateWindow) {
                    existing.count++;
                    existing.lastSeen = now;
                    existing.lastTimestamp = log.timestamp;
                    
                    // 更新现有日志的显示
                    this.updateDuplicateLogDisplay(existing);
                    return; // 不添加新的日志条目
                } else {
                    // 超出时间窗口，重置计数
                    existing.count = 1;
                    existing.firstSeen = now;
                    existing.lastSeen = now;
                    existing.lastTimestamp = log.timestamp;
                }
            } else {
                // 新消息，添加到跟踪器
                this.logDuplicateTracker.set(messageKey, {
                    count: 1,
                    firstSeen: now,
                    lastSeen: now,
                    originalLog: log,
                    lastTimestamp: log.timestamp,
                    logIndex: this.eagleLogs.length + processedLogs.length
                });
            }
            
            // 检查是否已存在相同ID的日志
            const logId = log.id || `${log.timestamp}_${log.message}`;
            const existingIds = new Set(this.eagleLogs.map(existingLog =>
                existingLog.id || `${existingLog.timestamp}_${existingLog.message}`
            ));
            
            if (!existingIds.has(logId)) {
                processedLogs.push(log);
            }
        });

        if (processedLogs.length === 0) {
            return; // 没有新日志，不需要更新
        }

        // 添加新日志
        processedLogs.forEach(logData => {
            this.eagleLogs.push(logData);
        });

        // 限制日志数量（保留最新50条，像AE日志一样）
        if (this.eagleLogs.length > 50) {
            this.eagleLogs = this.eagleLogs.slice(-50);
        }

        // 按时间戳排序
        this.eagleLogs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // 如果当前显示Eagle日志，实时更新显示
        if (this.currentLogView === 'eagle') {
            this.updateEagleLogDisplayRealtime(processedLogs);
        }
    }

    // 实时更新Eagle日志显示（类似AE日志的实时更新）
    updateEagleLogDisplayRealtime(newLogs) {
        const logOutput = document.getElementById('log-output');
        if (!logOutput) return;

        // 添加新日志条目到显示
        newLogs.forEach(logData => {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${logData.type} ${logData.source || 'eagle'}`;
            
            // 生成消息键用于重复检测
            const messageKey = this.generateLogKey(logData.message);
            const duplicateInfo = this.logDuplicateTracker?.get(messageKey);
            
            // 如果有重复计数，显示计数信息
            let displayMessage = logData.message;
            if (duplicateInfo && duplicateInfo.count > 1) {
                displayMessage += ` <span class="log-count">(×${duplicateInfo.count})</span>`;
            }
            
            logEntry.innerHTML = `<span class="log-time">${logData.time}</span>${displayMessage}`;
            logEntry.setAttribute('data-message-key', messageKey);
            logOutput.appendChild(logEntry);
        });

        // 限制DOM中的日志条数（保持与内存中一致）
        while (logOutput.children.length > 50) {
            logOutput.removeChild(logOutput.firstChild);
        }

        // 滚动到底部
        logOutput.scrollTop = logOutput.scrollHeight;
    }

    // 生成日志消息的唯一键（用于重复检测）
    generateLogKey(message) {
        // 移除时间戳和动态内容，只保留核心消息
        let key = message
            .replace(/\d{2}:\d{2}:\d{2}/g, '') // 移除时间戳
            .replace(/\d+ms/g, '') // 移除延迟时间
            .replace(/\d+个文件/g, 'N个文件') // 标准化文件数量
            .replace(/\d+\.\d+\s*(GB|MB|KB)/g, 'SIZE') // 标准化文件大小
            .replace(/\d+/g, 'NUM') // 标准化其他数字
            .trim();
        
        // 特殊处理剪切板内容
        if (key.includes('剪切板文本内容')) {
            return '剪切板文本内容';
        }
        
        return key;
    }

    // 更新重复日志的显示
    updateDuplicateLogDisplay(duplicateInfo) {
        if (this.currentLogView !== 'eagle') return;
        
        const logOutput = document.getElementById('log-output');
        if (!logOutput) return;
        
        // 查找对应的日志条目
        const messageKey = this.generateLogKey(duplicateInfo.originalLog.message);
        // 转义CSS选择器中的特殊字符
        const escapedKey = messageKey.replace(/["\\]/g, '\\$&');
        const logEntries = logOutput.querySelectorAll(`[data-message-key="${escapedKey}"]`);
        
        if (logEntries.length > 0) {
            // 更新最后一个匹配的日志条目
            const lastEntry = logEntries[logEntries.length - 1];
            const timeSpan = lastEntry.querySelector('.log-time');
            const timeText = timeSpan ? timeSpan.outerHTML : '';
            
            let displayMessage = duplicateInfo.originalLog.message;
            if (duplicateInfo.count > 1) {
                displayMessage += ` <span class="log-count">(×${duplicateInfo.count})</span>`;
            }
            
            lastEntry.innerHTML = timeText + displayMessage;
        } else {
            // 如果找不到对应的条目，可能是因为选择器问题，使用遍历方式查找
            const allEntries = logOutput.querySelectorAll('.log-entry.eagle');
            for (let i = allEntries.length - 1; i >= 0; i--) {
                const entry = allEntries[i];
                if (entry.getAttribute('data-message-key') === messageKey) {
                    const timeSpan = entry.querySelector('.log-time');
                    const timeText = timeSpan ? timeSpan.outerHTML : '';
                    
                    let displayMessage = duplicateInfo.originalLog.message;
                    if (duplicateInfo.count > 1) {
                        displayMessage += ` <span class="log-count">(×${duplicateInfo.count})</span>`;
                    }
                    
                    entry.innerHTML = timeText + displayMessage;
                    break;
                }
            }
        }
    }

    // Eagle专用日志方法
    logEagle(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        const logData = {
            message,
            type,
            time: timestamp,
            timestamp: new Date().toISOString(),
            source: 'eagle'
        };

        // 初始化重复日志计数器
        if (!this.logDuplicateTracker) {
            this.logDuplicateTracker = new Map();
        }

        const now = Date.now();
        const duplicateWindow = 60000; // 60秒内的重复消息会被合并
        const messageKey = this.generateLogKey(message);

        // 检查是否是重复消息
        if (this.logDuplicateTracker.has(messageKey)) {
            const existing = this.logDuplicateTracker.get(messageKey);
            
            // 如果在时间窗口内，增加计数
            if (now - existing.firstSeen < duplicateWindow) {
                existing.count++;
                existing.lastSeen = now;
                existing.lastTimestamp = logData.timestamp;
                
                // 更新现有日志的显示
                this.updateDuplicateLogDisplay(existing);
                return; // 不添加新的日志条目
            } else {
                // 超出时间窗口，重置计数并创建新条目
                existing.count = 1;
                existing.firstSeen = now;
                existing.lastSeen = now;
                existing.lastTimestamp = logData.timestamp;
                existing.originalLog = logData;
                // 继续执行下面的代码创建新条目
            }
        } else {
            // 新消息，添加到跟踪器
            this.logDuplicateTracker.set(messageKey, {
                count: 1,
                firstSeen: now,
                lastSeen: now,
                originalLog: logData,
                lastTimestamp: logData.timestamp,
                logIndex: this.eagleLogs.length
            });
        }

        // 添加到Eagle日志数组（只有新消息或超出时间窗口的消息）
        this.eagleLogs.push(logData);

        // 如果当前显示Eagle日志，实时更新显示
        if (this.currentLogView === 'eagle') {
            const logOutput = document.getElementById('log-output');
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${type} eagle`;
            
            logEntry.innerHTML = `<span class="log-time">${timestamp}</span>${message}`;
            logEntry.setAttribute('data-message-key', messageKey);
            logOutput.appendChild(logEntry);
            logOutput.scrollTop = logOutput.scrollHeight;
        }

        // 更新最新日志显示（只有在Eagle日志视图时）
        if (this.currentLogView === 'eagle') {
            this.updateLatestLogMessage(message, type);
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
            toggleBtn.title = '显示日志';
        } else {
            logSection.classList.add('visible');
            toggleBtn.title = '隐藏日志';
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
        // 等待DOM完全加载
        if (document.readyState !== 'complete') {
            setTimeout(() => this.setupSettingsPanel(), 100);
            return;
        }

        const settingsPanel = document.getElementById('settings-panel');
        const closeBtn = document.getElementById('settings-close-btn');
        const saveBtn = document.getElementById('save-settings-btn');
        const resetBtn = document.getElementById('reset-settings-btn');

        // 检查元素是否存在
        if (!closeBtn) {
            // 设置面板按钮未找到，可能DOM未完全加载
            return;
        }

        // 关闭按钮
        closeBtn.addEventListener('click', () => {
            this.hideSettingsPanel();
        });

        if (!saveBtn) {
            this.log('⚠️ 找不到设置面板保存按钮', 'warning');
        } else {
            // 保存按钮
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        if (!resetBtn) {
            this.log('⚠️ 找不到设置面板重置按钮', 'warning');
        } else {
            // 重置按钮
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // 导入模式切换
        const importModeRadios = document.querySelectorAll('input[name="import-mode"]');
        importModeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.log(`高级导入模式已更改为: ${radio.value}`, 'info');

                    // 显示相应的模态框
                    if (radio.value === 'project_adjacent') {
                        this.showProjectAdjacentModal();
                    } else if (radio.value === 'custom_folder') {
                        this.showCustomFolderModal();
                    }

                    this.updateSettingsUI();
                    // 实时同步到快速设置
                    if (this.quickSettingsInitialized) {
                        this.settingsManager.updateField('mode', radio.value, false);

                        // 同步到快速设置面板
                        const quickRadio = document.querySelector(`input[name="quick-import-mode"][value="${radio.value}"]`);
                        if (quickRadio) {
                            quickRadio.checked = true;
                            this.log(`已同步导入模式到快速设置面板: ${radio.value}`, 'info');
                        }
                    }
                }
            });
        });

        // 导出模式切换
        const exportModeRadios = document.querySelectorAll('input[name="export-mode"]');
        exportModeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.log(`导出模式已更改为: ${radio.value}`, 'info');

                    this.updateExportSettingsUI();

                    // 实时保存导出设置
                    const exportSettings = this.getExportSettingsFromUI();
                    this.settingsManager.saveExportSettings(exportSettings);
                }
            });
         });



        // 导出选项复选框
        const exportAutoCopy = document.getElementById('export-auto-copy');
        const exportBurnAfterReading = document.getElementById('export-burn-after-reading');
        const exportAddTimestamp = document.getElementById('export-add-timestamp');
        const exportCreateSubfolders = document.getElementById('export-create-subfolders');

        if (exportAutoCopy) {
            exportAutoCopy.addEventListener('change', () => {
                const exportSettings = this.getExportSettingsFromUI();
                this.settingsManager.saveExportSettings(exportSettings);
                this.log(`自动复制已${exportAutoCopy.checked ? '启用' : '禁用'}`, 'info');
            });
        }

        if (exportBurnAfterReading) {
            exportBurnAfterReading.addEventListener('change', () => {
                const exportSettings = this.getExportSettingsFromUI();
                this.settingsManager.saveExportSettings(exportSettings);
                this.log(`阅后即焚已${exportBurnAfterReading.checked ? '启用' : '禁用'}`, 'info');
            });

            // 添加特殊点击事件处理
            exportBurnAfterReading.addEventListener('click', async (event) => {
                if (event.altKey) {
                    // Alt+点击：清空临时文件夹
                    event.preventDefault();
                    try {
                        await this.cleanupTempFolder();
                        this.log('🗑️ 临时文件夹已清空', 'success');
                        // 清空后更新tooltip
                        setTimeout(() => {
                            this.updateBurnAfterReadingTooltip();
                        }, 500);
                    } catch (error) {
                        this.log(`❌ 清空临时文件夹失败: ${error.message}`, 'error');
                    }
                } else if (event.ctrlKey) {
                    // Ctrl+点击：打开临时文件夹
                    event.preventDefault();
                    try {
                        await this.openTempFolder();
                        this.log('📁 临时文件夹已打开', 'info');
                        // 打开后更新tooltip（可能有新文件）
                        setTimeout(() => {
                            this.updateBurnAfterReadingTooltip();
                        }, 1000);
                    } catch (error) {
                        this.log(`❌ 打开临时文件夹失败: ${error.message}`, 'error');
                    }
                }
            });
        }

        if (exportAddTimestamp) {
            exportAddTimestamp.addEventListener('change', () => {
                const exportSettings = this.getExportSettingsFromUI();
                this.settingsManager.saveExportSettings(exportSettings);
            });
        }

        if (exportCreateSubfolders) {
            exportCreateSubfolders.addEventListener('change', () => {
                const exportSettings = this.getExportSettingsFromUI();
                this.settingsManager.saveExportSettings(exportSettings);
            });
        }

        // 项目文件夹选择
        const projectFolderSelect = document.getElementById('project-folder-select');
        if (projectFolderSelect) {
            projectFolderSelect.addEventListener('change', () => {
                this.handleProjectFolderChange();
                // 实时同步到快速设置
                if (this.quickSettingsInitialized) {
                    this.settingsManager.updateField('projectAdjacentFolder', projectFolderSelect.value, false);
                }
            });
        }

        // 高级设置导入行为选项
        const advancedImportBehaviorRadios = document.querySelectorAll('input[name="advanced-import-behavior"]');
        advancedImportBehaviorRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.log(`高级设置导入行为已更改为: ${radio.value}`, 'info');
                    
                    // 根据导入行为更新设置
                    if (radio.value === 'no_import') {
                        // 不导入合成
                        this.settingsManager.updateField('addToComposition', false, false);
                    } else {
                        // 导入到合成，并设置时间轴位置
                        this.settingsManager.updateField('addToComposition', true, false);
                        this.settingsManager.updateField('timelineOptions.placement', radio.value, false);
                    }
                    
                    this.updateSettingsUI();
                    
                    // 同步到快速设置面板
                    if (this.quickSettingsInitialized) {
                        const quickRadio = document.querySelector(`input[name="import-behavior"][value="${radio.value}"]`);
                        if (quickRadio) {
                            quickRadio.checked = true;
                            this.log(`已同步到快速设置面板: ${radio.value}`, 'info');
                        }
                    }
                    
                    // 显示设置说明
                    const descriptions = {
                        'no_import': '素材将仅复制到项目文件夹，不导入到合成',
                        'current_time': '素材将导入到合成并放置在当前时间指针位置',
                        'timeline_start': '素材将导入到合成并移至时间轴开始处（0秒位置）'
                    };
                    this.log(`设置说明: ${descriptions[radio.value]}`, 'info');
                }
            });
        });

        // 合成导入选项
        const addToCompositionCheckbox = document.getElementById('add-to-composition');
        if (addToCompositionCheckbox) {
            addToCompositionCheckbox.addEventListener('change', () => {
                this.updateSettingsUI();
                // 实时同步到快速设置
                if (this.quickSettingsInitialized) {
                    this.settingsManager.updateField('addToComposition', addToCompositionCheckbox.checked, false);
                }
            });
        }

        // 时间轴放置选项
        const timelinePlacementRadios = document.querySelectorAll('input[name="timeline-placement"]');
        timelinePlacementRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.log(`高级设置时间轴已更改为: ${radio.value}`, 'info');

                    // 移除了sequence模态框逻辑

                    this.updateSettingsUI();
                    // 实时同步时间轴选项
                    if (this.quickSettingsInitialized) {
                        this.settingsManager.updateField('timelineOptions.placement', radio.value, false);

                        // 同步到快速设置面板
                        const quickRadio = document.querySelector(`input[name="import-behavior"][value="${radio.value}"]`);
                        if (quickRadio) {
                            quickRadio.checked = true;
                            this.log(`已同步到快速设置面板: ${radio.value}`, 'info');
                        }

                        // 显示设置说明
                        const descriptions = {
                            'current_time': '素材将放置在当前时间指针位置',
                            'timeline_start': '素材将移至时间轴开始处（0秒位置）'
                        };
                        this.log(`设置说明: ${descriptions[radio.value]}`, 'info');
                    }
                }
            });
        });

        // 文件管理选项
        const keepOriginalNameCheckbox = document.getElementById('keep-original-name');
        if (keepOriginalNameCheckbox) {
            keepOriginalNameCheckbox.addEventListener('change', () => {
                // 实时同步到快速设置
                if (this.quickSettingsInitialized) {
                    this.settingsManager.updateField('fileManagement.keepOriginalName', keepOriginalNameCheckbox.checked, false);
                }
            });
        }

        // 其他文件管理选项也添加实时同步
        const addTimestampCheckbox = document.getElementById('add-timestamp');
        if (addTimestampCheckbox) {
            addTimestampCheckbox.addEventListener('change', () => {
                if (this.quickSettingsInitialized) {
                    this.settingsManager.updateField('fileManagement.addTimestamp', addTimestampCheckbox.checked, false);
                }
            });
        }

        const createTagFoldersCheckbox = document.getElementById('create-tag-folders');
        if (createTagFoldersCheckbox) {
            createTagFoldersCheckbox.addEventListener('change', () => {
                if (this.quickSettingsInitialized) {
                    this.settingsManager.updateField('fileManagement.createTagFolders', createTagFoldersCheckbox.checked, false);
                }
            });
        }

        const deleteFromEagleCheckbox = document.getElementById('delete-from-eagle');
        if (deleteFromEagleCheckbox) {
            deleteFromEagleCheckbox.addEventListener('change', () => {
                if (this.quickSettingsInitialized) {
                    this.settingsManager.updateField('fileManagement.deleteFromEagle', deleteFromEagleCheckbox.checked, false);
                }
            });
        }

        // 通信端口设置
        const communicationPortInput = document.getElementById('communication-port');
        if (!communicationPortInput) {
            this.log('⚠️ 找不到通信端口输入框', 'warning');
        } else {
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
        }

        // 文件夹浏览按钮
        const browseFolderBtn = document.getElementById('browse-folder-btn');
        if (browseFolderBtn) {
            browseFolderBtn.addEventListener('click', () => {
                this.browseCustomFolder();
            });
        }

        // 最近文件夹选择
        const recentFoldersSelect = document.getElementById('recent-folders-select');
        if (recentFoldersSelect) {
            recentFoldersSelect.addEventListener('change', () => {
                const selectedPath = recentFoldersSelect.value;
                if (selectedPath) {
                    document.getElementById('custom-folder-path-input').value = selectedPath;
                    // 实时同步到快速设置
                    if (this.quickSettingsInitialized) {
                        this.settingsManager.updateField('customFolderPath', selectedPath, false);
                    }
                    this.log(`已选择最近使用的文件夹: ${selectedPath}`, 'success');
                }
            });
        }

        // 自定义文件夹路径输入框变化
        const customFolderPath = document.getElementById('custom-folder-path-input');
        if (customFolderPath) {
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
        }

        // 音效设置已移除，默认启用音效
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
        this.log(`正在加载高级设置到UI: 时间轴模式=${settings.timelineOptions.placement}`, 'info');

        // 导入模式
        const modeRadio = document.querySelector(`input[name="import-mode"][value="${settings.mode}"]`);
        if (modeRadio) {
            modeRadio.checked = true;
            // 同步到快速设置
            const quickModeRadio = document.querySelector(`input[name="quick-import-mode"][value="${settings.mode}"]`);
            if (quickModeRadio) {
                quickModeRadio.checked = true;
            }
        }

        // 项目文件夹（在模态框中）
        const projectFolderSelect = document.getElementById('project-folder-preset-select');
        if (projectFolderSelect) {
            projectFolderSelect.value = settings.projectAdjacentFolder;
        }

        // 自定义文件夹路径
        const customFolderPath = document.getElementById('custom-folder-path-input');
        if (customFolderPath) {
            customFolderPath.value = settings.customFolderPath;
        }

        // 更新最近文件夹下拉列表
        this.updateRecentFoldersDropdown();

        // 合成导入
        const addToComposition = document.getElementById('add-to-composition');
        if (addToComposition) {
            addToComposition.checked = settings.addToComposition;
        }

        // 高级设置导入行为选项
        let advancedImportBehaviorValue;
        if (!settings.addToComposition) {
            advancedImportBehaviorValue = 'no_import';
        } else {
            advancedImportBehaviorValue = settings.timelineOptions.placement;
        }
        
        const advancedImportBehaviorRadio = document.querySelector(`input[name="advanced-import-behavior"][value="${advancedImportBehaviorValue}"]`);
        if (advancedImportBehaviorRadio) {
            advancedImportBehaviorRadio.checked = true;
        }

        // 时间轴选项
        const timelinePlacementRadio = document.querySelector(`input[name="timeline-placement"][value="${settings.timelineOptions.placement}"]`);
        if (timelinePlacementRadio) {
            timelinePlacementRadio.checked = true;
        }
        
        // 同步到快速设置的导入行为选项
        if (settings.addToComposition) {
            // 如果启用了添加到合成，则根据时间轴位置设置对应选项
            const quickTimelineRadio = document.querySelector(`input[name="import-behavior"][value="${settings.timelineOptions.placement}"]`);
            if (quickTimelineRadio) {
                quickTimelineRadio.checked = true;
            }
        } else {
            // 如果禁用了添加到合成，则选择"不导入合成"
            const noImportRadio = document.querySelector('input[name="import-behavior"][value="no_import"]');
            if (noImportRadio) {
                noImportRadio.checked = true;
            }
        }

        // 序列间隔（在模态框中）
        const sequenceInterval = document.getElementById('interval-value');
        if (sequenceInterval) {
            sequenceInterval.value = settings.timelineOptions.sequenceInterval;
        }

        // 文件管理选项（可能不存在）
        const keepOriginalName = document.getElementById('keep-original-name');
        const addTimestamp = document.getElementById('add-timestamp');
        const createTagFolders = document.getElementById('create-tag-folders');
        const deleteFromEagle = document.getElementById('delete-from-eagle');

        if (keepOriginalName) keepOriginalName.checked = settings.fileManagement.keepOriginalName;
        if (addTimestamp) addTimestamp.checked = settings.fileManagement.addTimestamp;
        if (createTagFolders) createTagFolders.checked = settings.fileManagement.createTagFolders;
        if (deleteFromEagle) deleteFromEagle.checked = settings.fileManagement.deleteFromEagle;

        // 通信端口
        const preferences = this.settingsManager.getPreferences();
        const communicationPort = document.getElementById('communication-port');
        if (communicationPort) {
            communicationPort.value = preferences.communicationPort;
            this.updateEagleUrl(preferences.communicationPort);
        }

        // 音效设置（默认启用，设置音效播放器音量）
        this.soundPlayer.setVolume(settings.soundSettings.volume / 100);

        // 加载导出设置
        this.loadExportSettingsToUI();

        // 更新UI状态
        this.updateSettingsUI();

        this.log('高级设置已加载并同步到快速设置', 'success');
    }

    // 记录日志（优化版本）
    log(message, type = 'info', options = {}) {
        // 使用LogManager处理日志
        this.logManager.log(message, type, options);

        // 保持原有的日志数组（用于兼容性）
        const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        const fullTimestamp = new Date().toISOString();

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

        // 如果当前显示AE日志，更新显示（使用原有逻辑）
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
        if (projectFolderConfig) {
            projectFolderConfig.style.display = uiState.projectFolderVisible(settings) ? 'block' : 'none';
        }

        // 自定义文件夹配置显示/隐藏
        const customFolderConfig = document.getElementById('custom-folder-config');
        if (customFolderConfig) {
            const isCustomFolderVisible = uiState.customFolderVisible(settings);
            customFolderConfig.style.display = isCustomFolderVisible ? 'block' : 'none';
        }

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

        // 更新导出设置UI状态
        this.updateExportSettingsUI();
    }

    // 从UI获取设置
    getSettingsFromUI() {
        try {
            // 获取当前保存的设置作为基础
            const currentSettings = this.settingsManager.getSettings();
            
            const importMode = document.querySelector('input[name="import-mode"]:checked')?.value || currentSettings.mode;

            // 注意：这些元素可能在模态框中，不一定总是存在
            const projectFolderSelect = document.getElementById('project-folder-preset-select');
            const customFolderPath = document.getElementById('custom-folder-path-input');
            const addToComposition = document.getElementById('add-to-composition');
            const timelinePlacement = document.querySelector('input[name="timeline-placement"]:checked')?.value || currentSettings.timelineOptions.placement;
            const sequenceInterval = document.getElementById('interval-value');

            // 如果关键元素不存在，使用当前保存的设置值
            const addToCompValue = addToComposition ? addToComposition.checked : currentSettings.addToComposition;
            
            // 检查文件管理相关元素（可能不存在，使用当前设置或默认值）
            const keepOriginalName = document.getElementById('keep-original-name');
            const addTimestamp = document.getElementById('add-timestamp');
            const createTagFolders = document.getElementById('create-tag-folders');
            const deleteFromEagle = document.getElementById('delete-from-eagle');

            return {
                mode: importMode,
                projectAdjacentFolder: projectFolderSelect ? projectFolderSelect.value : currentSettings.projectAdjacentFolder,
                customFolderPath: customFolderPath ? customFolderPath.value : currentSettings.customFolderPath,
                addToComposition: addToCompValue,
                timelineOptions: {
                    enabled: addToCompValue,
                    placement: timelinePlacement,
                    sequenceInterval: sequenceInterval ? parseFloat(sequenceInterval.value) || 1.0 : currentSettings.timelineOptions.sequenceInterval
                },
                fileManagement: {
                    keepOriginalName: keepOriginalName ? keepOriginalName.checked : currentSettings.fileManagement.keepOriginalName,
                    addTimestamp: addTimestamp ? addTimestamp.checked : currentSettings.fileManagement.addTimestamp,
                    createTagFolders: createTagFolders ? createTagFolders.checked : currentSettings.fileManagement.createTagFolders,
                    deleteFromEagle: deleteFromEagle ? deleteFromEagle.checked : currentSettings.fileManagement.deleteFromEagle
                },
                exportSettings: this.getExportSettingsFromUI()
            };
        } catch (error) {
            this.log(`获取UI设置失败: ${error.message}`, 'error');
            // 返回当前保存的设置
            return this.settingsManager.getSettings();
        }
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

        // 首先尝试使用现代Web API
        if (this.tryModernWebFolderPicker()) {
            return;
        }

        // 回退到 ExtendScript 方法
        if (!this.tryExtendScriptFolderPicker()) {
            this.log('无法打开文件夹选择对话框，请确保在AE环境中运行此扩展', 'error');
        }
    }

    // 使用 ExtendScript 文件夹选择对话框
    tryExtendScriptFolderPicker() {
        try {
            const currentPath = document.getElementById('custom-folder-path-input').value || '';
            this.log('正在打开文件夹选择对话框...', 'info');

            // 调用 ExtendScript 的文件夹选择函数
            this.csInterface.evalScript(`selectFolder("${currentPath}", "选择目标文件夹")`, (result) => {
                try {
                    const parsedResult = JSON.parse(result);

                    if (parsedResult.success && parsedResult.path) {
                        this.handleSelectedFolder(parsedResult.path);
                        this.log(`已选择文件夹: ${parsedResult.path}`, 'success');
                    } else if (parsedResult.cancelled) {
                        this.log('用户取消了文件夹选择', 'info');
                        // 用户取消时不做任何操作，不回退到模态框
                    } else {
                        // 检查是否是用户取消操作
                        if (parsedResult.cancelled) {
                            this.log('用户取消了文件夹选择', 'info');
                            // 用户取消时不显示错误提示
                        } else {
                            this.log(`文件夹选择失败: ${parsedResult.error || '未知错误'}`, 'error');
                            // 只有在真正出错时才显示错误提示
                        }
                    }
                } catch (error) {
                    this.log(`解析文件夹选择结果失败: ${error.message}`, 'error');
                    // 解析错误时不再回退到其他方式，直接提示用户
                }
            });

            return true;
        } catch (error) {
            this.log(`ExtendScript文件夹选择出错: ${error.message}`, 'error');
            return false;
        }
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

        const currentPath = document.getElementById('custom-folder-path-input').value;

        // 调用ExtendScript来打开文件夹选择对话框
        this.csInterface.evalScript(`selectFolder("${currentPath}", "选择目标文件夹")`, (result) => {
            try {
                const parsedResult = JSON.parse(result);
                if (parsedResult.success && parsedResult.path) {
                    this.handleSelectedFolder(parsedResult.path);
                    this.log(`已选择文件夹: ${parsedResult.path}`, 'success');
                } else if (parsedResult.cancelled) {
                    this.log('用户取消了文件夹选择', 'info');
                    // 用户取消时不做任何操作，不回退到输入框
                } else {
                    this.log(`文件夹选择失败: ${parsedResult.error || '未知错误'}`, 'error');
                    // 不再回退到输入框，直接提示用户
                }
            } catch (error) {
                this.log(`解析文件夹选择结果失败: ${error.message}`, 'error');
                // 解析错误时不再回退到输入框方式，直接提示用户
            }
        });
    }

    // 降级到输入提示方式
    fallbackToInputPrompt(currentPath) {
        this.log('使用输入框方式选择文件夹...', 'info');
        const newPath = prompt('请输入文件夹路径:', currentPath);

        if (newPath && newPath.trim()) {
            const trimmedPath = newPath.trim();
            document.getElementById('custom-folder-path-input').value = trimmedPath;
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
        document.getElementById('custom-folder-path-input').value = folderPath;

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

    // 尝试使用现代Web API选择文件夹
    tryModernWebFolderPicker() {
        try {
            // 首先尝试使用 File System Access API
            if ('showDirectoryPicker' in window) {
                this.log('使用 File System Access API 选择文件夹...', 'info');

                window.showDirectoryPicker()
                    .then(directoryHandle => {
                        const folderName = directoryHandle.name;
                        this.handleSelectedFolder(`[已选择] ${folderName}`);
                        this.log(`已选择文件夹: ${folderName}`, 'success');

                        // 保存文件夹句柄以供后续使用
                        this.selectedDirectoryHandle = directoryHandle;
                    })
                    .catch(error => {
                        if (error.name === 'AbortError') {
                            this.log('用户取消了文件夹选择', 'info');
                        } else {
                            this.log(`File System Access API 失败: ${error.message}`, 'error');
                            // 回退到 webkitdirectory 方法
                            this.useWebkitDirectoryPicker();
                        }
                    });
                return true;
            }

            // 回退到 webkitdirectory
            if (this.supportsWebkitDirectory()) {
                this.log('使用 webkitdirectory API 选择文件夹...', 'info');
                this.useWebkitDirectoryPicker();
                return true;
            }

            return false;
        } catch (error) {
            this.log(`现代Web API文件夹选择出错: ${error.message}`, 'error');
            return false;
        }
    }

    // 使用系统文件夹选择器
    useModernFolderPicker() {
        this.log('启动文件夹选择器...', 'info');

        // 首先尝试现代Web API
        if (this.tryModernWebFolderPicker()) {
            // 成功使用现代API后关闭模态框
            this.hideFolderPickerModal();
            return;
        }

        // 回退到 ExtendScript 方式
        if (this.tryExtendScriptFolderPicker()) {
            // 成功使用 ExtendScript 选择器后关闭模态框
            this.hideFolderPickerModal();
            return;
        }

        // 如果都失败，显示错误提示
        this.log('无法打开文件夹选择对话框', 'error');
        this.hideFolderPickerModal();
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
        dropZone.addEventListener('drop', async (e) => {
            dropZone.classList.remove('drag-over');

            // 先检查项目状态
            const projectStatusValid = await this.projectStatusChecker.validateProjectStatus({
                requireProject: true,
                requireActiveComposition: false,
                showWarning: true
            });

            if (!projectStatusValid) {
                this.log('拖拽操作被阻止：未检测到打开的After Effects项目', 'warning');
                return;
            }

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

    // 在模态框中加载最近使用的文件夹（简化版 - 暂时不显示）
    loadRecentFoldersInModal() {
        // 简化版本，暂时不显示最近文件夹列表
        // 保留方法以避免调用错误
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
            this.log('开始保存设置...', 'info');
            const settings = this.getSettingsFromUI();

            // 记录当前设置状态
            this.log(`保存的时间轴设置: ${settings.timelineOptions.placement}`, 'info');

            // 如果选择指定文件夹模式但路径为空，给出友好提示
            if (settings.mode === 'custom_folder' && (!settings.customFolderPath || settings.customFolderPath.trim() === '')) {
                this.log('使用指定文件夹模式时，请先设置文件夹路径', 'warning');
                return;
            }

            // 保存导入设置
            const result = this.settingsManager.saveSettings(settings);
            if (!result.success) {
                this.log(`保存导入设置失败: ${result.error}`, 'error');
                return;
            }

            // 保存端口设置到用户偏好
            const communicationPort = document.getElementById('communication-port');
            if (!communicationPort) {
                this.log('找不到通信端口输入框', 'error');
                return;
            }

            const portValue = parseInt(communicationPort.value);
            if (isNaN(portValue) || portValue < 1024 || portValue > 65535) {
                this.log('端口值无效，必须在1024-65535之间', 'error');
                return;
            }

            const portResult = this.settingsManager.updatePreference('communicationPort', portValue);
            if (!portResult.success) {
                this.log(`保存端口设置失败: ${portResult.error}`, 'error');
                return;
            }

            this.log('所有设置保存成功', 'success');

            // 同步UI状态
            this.syncSettingsUI();

            // 更新端口URL（如果端口发生变化）
            if (portValue !== this.currentPort) {
                const oldPort = this.currentPort;
                this.log(`端口已更改: ${oldPort} -> ${portValue}`, 'info');
                // 异步处理端口更改，不阻塞保存操作
                this.handlePortChange(oldPort, portValue);
            }

            if (hidePanel) {
                this.hideSettingsPanel();
            }

            // 同步设置到Eagle插件
            this.syncSettingsToEagle(settings);

        } catch (error) {
            this.log(`保存设置出错: ${error.message}`, 'error');
            console.error('保存设置详细错误:', error);
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
                // 设置已同步到Eagle插件
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
        // 在演示模式下显示虚拟信息
        if (window.__DEMO_MODE_ACTIVE__) {
            this.startDemoLogs(port);
        } else {
            this.log(`🚀 AE扩展启动 - 端口: ${port}`, 'info');
        }
    }

    // 使用动态端口发现更新Eagle URL
    async updateEagleUrlWithDiscovery() {
        if (!this.portDiscovery) {
            this.log('端口发现服务未初始化，使用配置端口', 'warning');
            const preferences = this.settingsManager.getPreferences();
            this.updateEagleUrl(preferences.communicationPort);
            return;
        }

        try {
            this.log('🔍 开始动态端口发现...', 'info');
            const discoveredPort = await this.portDiscovery.getEaglePort();

            if (discoveredPort !== this.currentPort) {
                this.log(`🎯 发现新端口: ${this.currentPort} -> ${discoveredPort}`, 'info');
                this.updateEagleUrl(discoveredPort);

                // 更新设置中的端口（但不保存，避免覆盖用户配置）
                const communicationPortInput = document.getElementById('communication-port');
                if (communicationPortInput) {
                    communicationPortInput.value = discoveredPort;
                }
            } else {
                this.log(`端口未变化: ${discoveredPort}`, 'info');
            }

        } catch (error) {
            this.log(`动态端口发现失败: ${error.message}`, 'error');
            // 回退到配置端口
            const preferences = this.settingsManager.getPreferences();
            this.updateEagleUrl(preferences.communicationPort);
        }
    }

    // 启动演示模式虚拟日志
    startDemoLogs(port) {
        this.log(`🎭 演示模式已启用 - 虚拟端口: ${port}`, 'info');

        // 延迟显示虚拟日志，模拟真实的启动过程
        setTimeout(() => {
            this.log(`🔗 正在测试连接到Eagle...`, 'info');
        }, 1000);

        setTimeout(() => {
            this.log(`HTTP连接成功！延迟: 23ms`, 'success');
            this.log(`✅ WebSocket连接成功！`, 'success');
        }, 2000);

        setTimeout(() => {
            this.log(`🔄 导入前刷新项目状态...`, 'info');
            this.log(`📍 导入目标: 佛跳墙`, 'info');
        }, 3000);

        setTimeout(() => {
            this.log(`✅ ExtendScript连接成功: AE脚本环境已就绪`, 'success');
            this.log(`AE版本: 2024 (24.0.0)`, 'info');
        }, 4000);

        setTimeout(() => {
            this.log(`🚀 Eagle2Ae 演示环境准备完成`, 'success');
            this.log(`💡 提示: 拖拽图片到此处开始体验导入功能`, 'info');
        }, 5000);

        // 启动Eagle虚拟日志
        setTimeout(() => {
            this.startEagleDemoLogs();
        }, 6000);

        // 定期显示一些虚拟活动日志
        this.startDemoActivityLogs();
    }

    // 启动演示活动日志
    startDemoActivityLogs() {
        if (!window.__DEMO_MODE_ACTIVE__) return;

        const activities = [
            '🗑️ 临时文件夹清理完成',
            '🔄 导入前刷新项目状态...',
            '✅ JSX脚本重新加载完成',
            '📁 检测到新的项目文件',
            '🎯 合成状态检查完成',
            '💾 设置自动保存完成',
            '🔍 扫描可导入文件...',
            '⚡ 性能优化完成'
        ];

        let activityIndex = 0;
        const showActivity = () => {
            if (!window.__DEMO_MODE_ACTIVE__) return;

            const activity = activities[activityIndex % activities.length];
            this.log(activity, 'debug');
            activityIndex++;

            // 随机间隔 20-60 秒
            const nextInterval = 20000 + Math.random() * 40000;
            setTimeout(showActivity, nextInterval);
        };

        // 首次活动日志在 15 秒后开始
        setTimeout(showActivity, 15000);
    }

    // 启动Eagle虚拟日志
    startEagleDemoLogs() {
        if (!window.__DEMO_MODE_ACTIVE__) return;

        const eagleActivities = [
            '📁 扫描文件夹变化...',
            '🔍 发现 2 个新文件',
            '🖼️ 生成缩略图完成',
            '🏷️ 自动标签分析中...',
            '📋 已添加到 "最近导入" 文件夹',
            '💾 数据库同步完成',
            '🗑️ 清理临时缓存',
            '🔄 更新文件索引',
            '📊 统计信息已更新',
            '🎯 智能分类完成',
            '🔒 文件完整性检查',
            '⚡ 性能优化完成'
        ];

        let eagleIndex = 0;
        const showEagleActivity = () => {
            if (!window.__DEMO_MODE_ACTIVE__) return;

            const activity = eagleActivities[eagleIndex % eagleActivities.length];
            this.logEagle(activity, 'info');
            eagleIndex++;

            // 随机间隔 25-70 秒
            const nextInterval = 25000 + Math.random() * 45000;
            setTimeout(showEagleActivity, nextInterval);
        };

        // Eagle初始化日志
        this.logEagle('🚀 Eagle插件启动完成 - 版本 4.0.0', 'success');
        this.logEagle('📁 资源库 "仓鼠.library" 已加载', 'info');
        this.logEagle('📊 共 1,247 个文件，占用 2.3 GB', 'info');

        setTimeout(() => {
            this.logEagle('🎯 智能分类系统已启用', 'info');
            this.logEagle('👁️ 开始监听文件夹变化...', 'debug');
        }, 2000);

        // 首次Eagle活动日志在 12 秒后开始
        setTimeout(showEagleActivity, 12000);
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
                    if (data.service === 'Eagle2Ae') {
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
        this.log('2. Eagle2Ae 插件已启用', 'info');
        this.log('3. 尝试重启Eagle应用程序', 'info');
    }

    // 播放连接音效（默认启用）
    playConnectionSound(soundType) {
        try {
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
        // 静默设置快速设置事件监听器

        // 等待DOM完全加载
        if (document.readyState !== 'complete') {
            // DOM未完全加载，延迟设置
            setTimeout(() => this.setupQuickSettings(), 100);
            return;
        }

        // 获取快速设置控件
        const quickImportModeRadios = document.querySelectorAll('input[name="quick-import-mode"]');
        const importBehaviorRadios = document.querySelectorAll('input[name="import-behavior"]');

        // 静默检查快速设置元素

        // 如果没有找到元素，说明DOM结构有问题
        if (quickImportModeRadios.length === 0) {
            this.log('⚠️ 未找到快速导入模式选项，检查DOM结构', 'error');
            this.log('⚠️ 快速设置初始化失败，设置为未初始化状态', 'error');
            this.quickSettingsInitialized = false;
            return;
        }
        if (importBehaviorRadios.length === 0) {
            this.log('⚠️ 未找到导入行为选项，检查DOM结构', 'error');
            this.log('⚠️ 快速设置初始化失败，设置为未初始化状态', 'error');
            this.quickSettingsInitialized = false;
            return;
        }

        // 导入模式变化
        quickImportModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // 静默更新导入模式（不显示弹窗，具体设置在设置面板中进行）
                    this.updateModeButtonStyles();
                    this.updateQuickSetting('mode', e.target.value);
                    this.updateQuickSettingsVisibility();

                    // 同步到高级设置面板
                    const advancedRadio = document.querySelector(`input[name="import-mode"][value="${e.target.value}"]`);
                    if (advancedRadio) {
                        advancedRadio.checked = true;
                    }
                }
            });
        });

        // 导入行为变化 - 重新实现的纯radio按钮逻辑
        importBehaviorRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.log(`导入行为已更改为: ${e.target.value}`, 'info');
                    
                    // 更新图层操作按钮的视觉状态
                    this.updateLayerOperationButtonsVisual(e.target.value);
                    
                    // 根据选择的行为更新设置
                    if (e.target.value === 'no_import') {
                        // 选择"不导入合成"
                        this.updateQuickSetting('addToComposition', false);
                        
                        // 同步到高级设置面板
                        const advancedAddToComp = document.getElementById('add-to-composition');
                        if (advancedAddToComp) {
                            advancedAddToComp.checked = false;
                        }
                        
                        // 同步到高级设置导入行为单选按钮
                        const advancedImportBehaviorRadio = document.querySelector(`input[name="advanced-import-behavior"][value="no_import"]`);
                        if (advancedImportBehaviorRadio) {
                            advancedImportBehaviorRadio.checked = true;
                            this.log(`已同步到高级设置导入行为: no_import`, 'info');
                        }
                        
                        this.log('设置说明: 素材将仅导入到项目面板，不会添加到合成中', 'info');
                    } else {
                        // 选择时间轴相关选项
                        this.updateQuickSetting('addToComposition', true);
                        this.updateQuickSetting('timelineOptions.placement', e.target.value);
                        
                        // 同步到高级设置面板
                        const advancedAddToComp = document.getElementById('add-to-composition');
                        if (advancedAddToComp) {
                            advancedAddToComp.checked = true;
                        }
                        
                        const advancedRadio = document.querySelector(`input[name="timeline-placement"][value="${e.target.value}"]`);
                        if (advancedRadio) {
                            advancedRadio.checked = true;
                            this.log(`已同步到高级设置面板: ${e.target.value}`, 'info');
                        }
                        
                        // 同步到高级设置导入行为单选按钮
                        const advancedImportBehaviorRadio = document.querySelector(`input[name="advanced-import-behavior"][value="${e.target.value}"]`);
                        if (advancedImportBehaviorRadio) {
                            advancedImportBehaviorRadio.checked = true;
                            this.log(`已同步到高级设置导入行为: ${e.target.value}`, 'info');
                        }
                        
                        // 显示设置说明
                        const descriptions = {
                            'current_time': '素材将添加到合成并放置在当前时间指针位置',
                            'timeline_start': '素材将添加到合成并移至时间轴开始处（0秒位置）'
                        };
                        this.log(`设置说明: ${descriptions[e.target.value]}`, 'info');
                    }
                    
                    this.updateQuickSettingsVisibility();
                }
            });
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

        this.settingsManager.addFieldListener('addToComposition', (newValue) => {
            // 根据addToComposition的值来设置导入行为选项
            if (newValue) {
                // 如果启用了添加到合成，则根据timelineOptions.placement设置对应选项
                const placement = this.settingsManager.getField('timelineOptions.placement');
                const currentRadio = document.querySelector(`input[name="import-behavior"][value="${placement}"]`);
                if (currentRadio && !currentRadio.checked) {
                    currentRadio.checked = true;
                }
            } else {
                // 如果禁用了添加到合成，则选择"不导入合成"
                const noImportRadio = document.querySelector('input[name="import-behavior"][value="no_import"]');
                if (noImportRadio && !noImportRadio.checked) {
                    noImportRadio.checked = true;
                }
            }
            this.updateQuickSettingsVisibility();
        });

        this.settingsManager.addFieldListener('timelineOptions.placement', (newValue) => {
            // 只有在addToComposition为true时才更新导入行为选项
            const addToComp = this.settingsManager.getField('addToComposition');
            if (addToComp) {
                const currentRadio = document.querySelector(`input[name="import-behavior"][value="${newValue}"]`);
                if (currentRadio && !currentRadio.checked) {
                    currentRadio.checked = true;
                }
            }
        });

        // 先标记为已初始化，这样事件监听器中的updateQuickSetting才能正常工作
        this.quickSettingsInitialized = true;
        // 快速设置初始化完成

        // 监听自动保存事件
        this.settingsManager.addListener((type, data) => {
            if (type === 'autoSave') {
                // 同步设置到Eagle插件
                this.syncSettingsToEagle(data);
            } else if (type === 'autoSaveError') {
                this.log(`自动保存失败: ${data.message}`, 'error');
            }
        });

        // 静默初始化快速设置UI

        try {
            // 初始化快速设置UI
            this.loadQuickSettings();
            // 快速设置UI加载完成

            // 快速设置事件监听器设置完成

        } catch (error) {
            this.log(`❌ 快速设置UI加载失败: ${error.message}`, 'error');
            // 即使UI加载失败，也保持初始化状态为true，确保事件监听器能工作
        }

        // 确保快速设置始终标记为已初始化
        this.quickSettingsInitialized = true;
        // 快速设置初始化状态已锁定
    }

    // 更新快速设置
    updateQuickSetting(fieldPath, value) {
        // 静默更新快速设置

        if (!this.quickSettingsInitialized) {
            this.log('快速设置未初始化，跳过更新', 'warning');
            return;
        }

        const result = this.settingsManager.updateField(fieldPath, value, true, false); // 不进行完整验证
        if (!result.success) {
            this.log(`更新快速设置失败: ${result.error}`, 'error');
        } else {
            // 快速设置更新成功
            // 立即显示当前设置状态以确认更新
            setTimeout(() => {
                this.showCurrentSettings();
            }, 100);
        }
    }

    // 更新快速设置的可见性
    updateQuickSettingsVisibility() {
        // 新的导入行为单选按钮不需要特殊的可见性控制
        // 因为所有选项都是平等的单选按钮
        // 这个函数保留为空，以保持兼容性
    }

    // 更新图层操作按钮的视觉状态
    updateLayerOperationButtonsVisual(importBehavior) {
        const detectButton = document.querySelector('.layer-operation-button[onclick*="detectLayers"]');
        const exportButton = document.querySelector('.layer-operation-button[onclick*="exportLayers"]');
        
        if (detectButton && exportButton) {
            if (importBehavior === 'no_import') {
                // 当选择"不导入合成"时，添加dimmed类使按钮变灰
                detectButton.classList.add('dimmed');
                exportButton.classList.add('dimmed');
            } else {
                // 其他情况下移除dimmed类，恢复正常样式
                detectButton.classList.remove('dimmed');
                exportButton.classList.remove('dimmed');
            }
        }
    }

    // 加载快速设置
    loadQuickSettings() {
        try {
            const settings = this.settingsManager.getSettings();
            // 静默加载快速设置

            // 设置导入模式单选按钮
            const modeRadio = document.querySelector(`input[name="quick-import-mode"][value="${settings.mode}"]`);
            if (modeRadio) {
                modeRadio.checked = true;
                // 快速导入模式已设置
            } else {
                this.log(`找不到导入模式选项: ${settings.mode}`, 'warning');
            }

            // 设置导入行为选项
            if (settings.addToComposition) {
                // 如果启用了添加到合成，则根据时间轴位置设置对应选项
                const quickTimelineRadio = document.querySelector(`input[name="import-behavior"][value="${settings.timelineOptions.placement}"]`);
                if (quickTimelineRadio) {
                    quickTimelineRadio.checked = true;
                } else {
                    this.log(`找不到导入行为选项: ${settings.timelineOptions.placement}`, 'warning');
                }
            } else {
                // 如果禁用了添加到合成，则选择"不导入合成"
                const noImportRadio = document.querySelector('input[name="import-behavior"][value="no_import"]');
                if (noImportRadio) {
                    noImportRadio.checked = true;
                } else {
                    this.log('找不到"不导入合成"选项', 'warning');
                }
            }

            // 同步到高级设置面板
            this.syncQuickToAdvanced();

            // 更新可见性
            this.updateQuickSettingsVisibility();

            // 更新按钮样式
            this.updateModeButtonStyles();

            // 更新图层操作按钮的视觉状态
            const currentImportBehavior = settings.addToComposition ? settings.timelineOptions.placement : 'no_import';
            this.updateLayerOperationButtonsVisual(currentImportBehavior);

            // 快速设置加载完成

        } catch (error) {
            this.log(`加载快速设置失败: ${error.message}`, 'error');
            console.error('加载快速设置详细错误:', error);
        }
    }

    // 同步快速设置到高级设置
    syncQuickToAdvanced() {
        try {
            // 同步导入模式
            const quickImportMode = document.querySelector('input[name="quick-import-mode"]:checked');
            if (quickImportMode) {
                const advancedImportMode = document.querySelector(`input[name="import-mode"][value="${quickImportMode.value}"]`);
                if (advancedImportMode) {
                    advancedImportMode.checked = true;
                }
            }

            // 同步导入行为选项
            const quickImportBehavior = document.querySelector('input[name="import-behavior"]:checked');
            const advancedAddToComp = document.getElementById('add-to-composition');
            
            if (quickImportBehavior && advancedAddToComp) {
                if (quickImportBehavior.value === 'no_import') {
                    // 选择了"不导入合成"
                    advancedAddToComp.checked = false;
                } else {
                    // 选择了时间轴位置选项
                    advancedAddToComp.checked = true;
                    const advancedTimelinePlacement = document.querySelector(`input[name="timeline-placement"][value="${quickImportBehavior.value}"]`);
                    if (advancedTimelinePlacement) {
                        advancedTimelinePlacement.checked = true;
                    }
                }
            }

            // 快速设置已同步到高级设置

        } catch (error) {
            this.log(`同步设置失败: ${error.message}`, 'error');
        }
    }

    // 更新模式按钮样式
    updateModeButtonStyles() {
        const modeButtons = document.querySelectorAll('.mode-button, .import-behavior-button');
        modeButtons.forEach(button => {
            const radio = button.querySelector('input[type="radio"]');
            if (radio && radio.checked) {
                button.classList.add('checked');
            } else {
                button.classList.remove('checked');
            }
        });
    }

    // 显示当前设置状态
    showCurrentSettings() {
        const settings = this.settingsManager.getSettings();
        // 静默显示当前设置状态（仅用于内部调试）
        // 设置状态已更新，无需显示详细信息
    }

    // 调试设置功能
    debugSettings() {
        this.log('=== 设置调试信息 ===', 'info');

        // 首先检查JSX脚本版本
        this.testExtendScriptConnection().then(() => {
            // 显示当前设置
            this.showCurrentSettings();
            this.continueDebugSettings();
        });
    }

    // 继续调试设置的其余部分
    continueDebugSettings() {

        // 检查快速设置初始化状态
        this.log(`快速设置初始化状态: ${this.quickSettingsInitialized}`, 'info');

        // 检查导入行为选项的DOM状态（分组显示）
        const quickImportBehaviorRadios = document.querySelectorAll('input[name="import-behavior"]');
        const advancedTimelineRadios = document.querySelectorAll('input[name="timeline-placement"]');

        this.log(`快速导入行为选项: ${quickImportBehaviorRadios.length}个, 高级时间轴选项: ${advancedTimelineRadios.length}个`, 'info');

        quickImportBehaviorRadios.forEach((radio, index) => {
            this.log(`快速导入行为选项 ${index + 1}: value="${radio.value}", checked=${radio.checked}`, 'debug', {
                group: 'DOM状态检查',
                collapsed: true,
                groupEnd: index === quickImportBehaviorRadios.length - 1 && advancedTimelineRadios.length === 0
            });
        });

        advancedTimelineRadios.forEach((radio, index) => {
            this.log(`高级时间轴选项 ${index + 1}: value="${radio.value}", checked=${radio.checked}`, 'debug', {
                group: 'DOM状态检查',
                collapsed: true,
                groupEnd: index === advancedTimelineRadios.length - 1
            });
        });

        // 检查当前设置和UI是否一致
        const settings = this.settingsManager.getSettings();
        const quickCheckedRadio = document.querySelector('input[name="import-behavior"]:checked');
        const advancedCheckedRadio = document.querySelector('input[name="timeline-placement"]:checked');
        const quickCheckedValue = quickCheckedRadio ? quickCheckedRadio.value : 'none';
        const advancedCheckedValue = advancedCheckedRadio ? advancedCheckedRadio.value : 'none';
        
        // 根据设置确定期望的快速选项值
        const expectedQuickValue = settings.addToComposition ? settings.timelineOptions.placement : 'no_import';

        this.log(`期望的快速选项值: ${expectedQuickValue}`, 'info');
        this.log(`快速UI选中值: ${quickCheckedValue}`, 'info');
        this.log(`高级UI选中值: ${advancedCheckedValue}`, 'info');
        this.log(`快速设置和期望一致: ${expectedQuickValue === quickCheckedValue}`, 'info');
        this.log(`高级设置和存储一致: ${settings.timelineOptions.placement === advancedCheckedValue}`, 'info');
        this.log(`添加到合成设置: ${settings.addToComposition}`, 'info');

        // 检查设置同步状态
        if (expectedQuickValue !== quickCheckedValue || settings.timelineOptions.placement !== advancedCheckedValue) {
            this.log('⚠️ 检测到设置不同步，尝试修复...', 'warning');
            this.syncSettingsUI();
        } else {
            this.log('✅ 所有设置已同步', 'success');
        }

        this.log('=== 调试完成 ===', 'info');
        this.log('💡 如果JSX脚本版本不正确，请尝试以下方法:', 'info');
        this.log('1. 完全重启After Effects', 'info');
        this.log('2. 运行 aeExtension.reloadJSXScript() 重新加载脚本', 'info');
        this.log('3. 手动运行JSX脚本文件: 文件 > 脚本 > 运行脚本文件', 'info');
    }

    // 同步设置UI
    syncSettingsUI() {
        const settings = this.settingsManager.getSettings();
        const expectedQuickValue = settings.addToComposition ? settings.timelineOptions.placement : 'no_import';

        this.log(`正在同步UI到设置值: mode=${settings.mode}, addToComposition=${settings.addToComposition}, placement=${settings.timelineOptions.placement}`, 'info');

        // 同步快速导入模式设置
        const quickModeRadios = document.querySelectorAll('input[name="quick-import-mode"]');
        quickModeRadios.forEach(radio => {
            radio.checked = (radio.value === settings.mode);
        });

        // 同步快速导入行为设置
        const quickRadios = document.querySelectorAll('input[name="import-behavior"]');
        quickRadios.forEach(radio => {
            radio.checked = (radio.value === expectedQuickValue);
        });

        // 同步高级设置
        const advancedAddToComp = document.getElementById('add-to-composition');
        if (advancedAddToComp) {
            advancedAddToComp.checked = settings.addToComposition;
        }
        
        const advancedRadios = document.querySelectorAll('input[name="timeline-placement"]');
        advancedRadios.forEach(radio => {
            radio.checked = (radio.value === settings.timelineOptions.placement);
        });

        // 更新按钮样式以反映选中状态
        this.updateModeButtonStyles();

        this.log('UI同步完成', 'success');
    }

    // 加载导出设置到UI
    loadExportSettingsToUI() {
        const settings = this.settingsManager.getSettings();
        const exportSettings = settings.exportSettings;

        // 导出模式
        const exportModeRadio = document.querySelector(`input[name="export-mode"][value="${exportSettings.mode}"]`);
        if (exportModeRadio) {
            exportModeRadio.checked = true;
        }



        // 导出选项
        const exportAutoCopy = document.getElementById('export-auto-copy');
        const exportBurnAfterReading = document.getElementById('export-burn-after-reading');
        const exportAddTimestamp = document.getElementById('export-add-timestamp');
        const exportCreateSubfolders = document.getElementById('export-create-subfolders');

        if (exportAutoCopy) {
            exportAutoCopy.checked = exportSettings.autoCopy !== undefined ? exportSettings.autoCopy : true;
        }
        if (exportBurnAfterReading) {
            exportBurnAfterReading.checked = exportSettings.burnAfterReading !== undefined ? exportSettings.burnAfterReading : false;
        }
        if (exportAddTimestamp) {
            exportAddTimestamp.checked = exportSettings.addTimestamp;
        }
        if (exportCreateSubfolders) {
            exportCreateSubfolders.checked = exportSettings.createSubfolders;
        }

        // 更新导出设置UI状态
        this.updateExportSettingsUI();
    }

    // 从UI获取导出设置（现在直接读取导入模式的设置）
    getExportSettingsFromUI() {
        const exportMode = document.querySelector('input[name="export-mode"]:checked')?.value || 'desktop';
        const exportAutoCopy = document.getElementById('export-auto-copy');
        const exportBurnAfterReading = document.getElementById('export-burn-after-reading');
        const exportAddTimestamp = document.getElementById('export-add-timestamp');
        const exportCreateSubfolders = document.getElementById('export-create-subfolders');

        // 直接读取导入模式的设置
        const importSettings = this.settingsManager.getSettings();
        
        // 项目旁导出使用导入模式的项目旁复制设置
        let projectAdjacentFolder = importSettings.projectAdjacentFolder || 'Eagle_Assets';
        
        // 指定文件夹导出路径获取逻辑修复
        let customExportPath = '';
        
        // 优先从SettingsManager的customFolderPath读取
        if (importSettings.customFolderPath && importSettings.customFolderPath.trim() !== '') {
            customExportPath = importSettings.customFolderPath;
            this.log(`🔍 从SettingsManager读取到指定文件夹路径: "${customExportPath}"`, 'info');
        }
        // 如果SettingsManager中没有，尝试从全局变量customFolderSettings获取
        else if (typeof window.customFolderSettings !== 'undefined' && window.customFolderSettings.folderPath && window.customFolderSettings.folderPath.trim() !== '') {
            customExportPath = window.customFolderSettings.folderPath;
            this.log(`🔍 从全局变量customFolderSettings读取到指定文件夹路径: "${customExportPath}"`, 'info');
        }
        // 最后尝试从DOM输入框获取
        else {
            const pathInput = document.getElementById('custom-folder-path-input');
            if (pathInput && pathInput.value && pathInput.value.trim() !== '') {
                customExportPath = pathInput.value.trim();
                this.log(`🔍 从DOM输入框读取到指定文件夹路径: "${customExportPath}"`, 'info');
            } else {
                this.log(`⚠️ 未找到指定文件夹路径设置，将使用默认路径`, 'warning');
            }
        }
        
        if (!projectAdjacentFolder && typeof window.projectAdjacentSettings !== 'undefined') {
            projectAdjacentFolder = window.projectAdjacentSettings.folderName || 'Eagle_Assets';
        }

        const result = {
            mode: exportMode,
            projectAdjacentFolder: projectAdjacentFolder,
            customExportPath: customExportPath,
            autoCopy: exportAutoCopy ? exportAutoCopy.checked : true,
            burnAfterReading: exportBurnAfterReading ? exportBurnAfterReading.checked : false,
            addTimestamp: exportAddTimestamp ? exportAddTimestamp.checked : true,
            createSubfolders: exportCreateSubfolders ? exportCreateSubfolders.checked : false
        };

        // 详细调试日志
        this.log(`🔍 导出设置调试详情:`, 'info');
        this.log(`  - 导出模式: ${result.mode}`, 'info');
        this.log(`  - 项目旁文件夹: "${result.projectAdjacentFolder}"`, 'info');
        this.log(`  - 指定文件夹路径: "${result.customExportPath}"`, 'info');
        this.log(`  - SettingsManager.customFolderPath: "${importSettings.customFolderPath || '未设置'}"`, 'info');
        if (typeof window.customFolderSettings !== 'undefined') {
            this.log(`  - 全局customFolderSettings.folderPath: "${window.customFolderSettings.folderPath || '未设置'}"`, 'info');
        } else {
            this.log(`  - 全局customFolderSettings: 未定义`, 'info');
        }

        return result;
    }

    // 更新导出设置UI状态
    updateExportSettingsUI() {
        // 导出设置现在通过弹窗管理，这里只需要确保UI状态正确
        // 具体的显示/隐藏逻辑由弹窗处理
    }



    // 显示项目旁复制模态框
    showProjectAdjacentModal() {
        if (typeof window.showProjectAdjacentModal === 'function') {
            window.showProjectAdjacentModal();
        }
    }

    // 显示导出项目旁模态框


    // 显示自定义文件夹模态框
    showCustomFolderModal() {
        if (typeof window.showCustomFolderModal === 'function') {
            window.showCustomFolderModal();
        }
    }

    // 显示序列模态框
    // 移除了showSequenceModal方法，因为不再支持顺序排列

    // 测试快速设置事件监听器
    testQuickSettingsEventListeners() {
        this.log('🧪 测试快速设置事件监听器...', 'info');

        // 测试快速导入行为选项
        const quickImportBehaviorRadios = document.querySelectorAll('input[name="import-behavior"]');
        quickImportBehaviorRadios.forEach((radio, index) => {
            const hasEventListener = radio.onclick !== null || radio.onchange !== null;
            this.log(`快速导入行为选项 ${index + 1} (${radio.value}): 事件监听器${hasEventListener ? '已绑定' : '未绑定'}`, hasEventListener ? 'info' : 'warning');
        });

        // 测试快速导入模式选项
        const quickImportRadios = document.querySelectorAll('input[name="quick-import-mode"]');
        quickImportRadios.forEach((radio, index) => {
            const hasEventListener = radio.onclick !== null || radio.onchange !== null;
            this.log(`快速导入模式选项 ${index + 1} (${radio.value}): 事件监听器${hasEventListener ? '已绑定' : '未绑定'}`, hasEventListener ? 'info' : 'warning');
        });

        this.log('🧪 事件监听器测试完成', 'info');
    }

    // 强制重新初始化快速设置（用于调试）
    forceReinitQuickSettings() {
        this.log('🔧 强制重新初始化快速设置...', 'info');
        this.quickSettingsInitialized = false;
        this.setupQuickSettings();
    }

    // 手动测试快速设置变化（用于调试）
    testQuickSettingChange(type, value) {
        this.log(`🔧 手动测试快速设置变化: ${type} = ${value}`, 'info');
        this.log(`当前快速设置初始化状态: ${this.quickSettingsInitialized}`, 'info');

        if (type === 'import_behavior') {
            const radio = document.querySelector(`input[name="import-behavior"][value="${value}"]`);
            if (radio) {
                this.log(`找到导入行为选项元素: ${value}`, 'info');
                radio.checked = true;
                this.log(`已设置checked为true`, 'info');
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                this.log(`✅ 已触发快速导入行为选项变化: ${value}`, 'success');
            } else {
                this.log(`❌ 未找到快速导入行为选项: ${value}`, 'error');
            }
        } else if (type === 'mode') {
            const radio = document.querySelector(`input[name="quick-import-mode"][value="${value}"]`);
            if (radio) {
                this.log(`找到导入模式选项元素: ${value}`, 'info');
                radio.checked = true;
                this.log(`已设置checked为true`, 'info');
                radio.dispatchEvent(new Event('change', { bubbles: true }));
                this.log(`✅ 已触发快速导入模式变化: ${value}`, 'success');
            } else {
                this.log(`❌ 未找到快速导入模式选项: ${value}`, 'error');
            }
        }
    }

    // 测试所有快速设置选项
    testAllQuickSettings() {
        this.log('🧪 测试所有快速设置选项...', 'info');

        // 测试时间轴选项
        ['current_time', 'sequence', 'stack', 'timeline_start'].forEach(value => {
            setTimeout(() => {
                this.testQuickSettingChange('timeline', value);
            }, 500);
        });

        // 测试导入模式
        setTimeout(() => {
            ['direct', 'project_adjacent', 'custom_folder'].forEach(value => {
                setTimeout(() => {
                    this.testQuickSettingChange('mode', value);
                }, 500);
            });
        }, 3000);
    }

    // 诊断快速设置问题
    diagnoseQuickSettings() {
        this.log('🔍 诊断快速设置问题...', 'info');

        // 检查DOM元素
        const quickImportModeRadios = document.querySelectorAll('input[name="quick-import-mode"]');
        const quickImportBehaviorRadios = document.querySelectorAll('input[name="import-behavior"]');

        this.log(`快速导入模式选项数量: ${quickImportModeRadios.length}`, 'info');
        this.log(`快速导入行为选项数量: ${quickImportBehaviorRadios.length}`, 'info');

        // 检查每个导入模式选项
        quickImportModeRadios.forEach((radio, index) => {
            this.log(`导入模式选项 ${index + 1}: value="${radio.value}", checked=${radio.checked}, id="${radio.id}"`, 'info');

            // 检查事件监听器
            const hasChangeListener = radio.onchange !== null;
            const hasClickListener = radio.onclick !== null;
            this.log(`  事件监听器: change=${hasChangeListener}, click=${hasClickListener}`, 'info');
        });

        // 检查每个导入行为选项
        quickImportBehaviorRadios.forEach((radio, index) => {
            this.log(`导入行为选项 ${index + 1}: value="${radio.value}", checked=${radio.checked}, id="${radio.id}"`, 'info');

            // 检查事件监听器
            const hasChangeListener = radio.onchange !== null;
            const hasClickListener = radio.onclick !== null;
            this.log(`  事件监听器: change=${hasChangeListener}, click=${hasClickListener}`, 'info');
        });

        // 检查初始化状态
        this.log(`快速设置初始化状态: ${this.quickSettingsInitialized}`, 'info');

        this.log('🔍 诊断完成', 'info');
    }

    // 手动绑定事件监听器（用于修复）
    rebindQuickSettingsEventListeners() {
        // 静默重新绑定快速设置事件监听器

        // 重新绑定导入模式事件监听器
        const quickImportModeRadios = document.querySelectorAll('input[name="quick-import-mode"]');
        quickImportModeRadios.forEach((radio) => {
            // 重新绑定导入模式选项

            // 移除旧的监听器（如果存在）
            radio.onchange = null;

            // 添加新的监听器
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    // 静默更新导入模式（不显示弹窗，具体设置在设置面板中进行）
                    this.updateModeButtonStyles();
                    this.updateQuickSetting('mode', e.target.value);
                    this.updateQuickSettingsVisibility();

                    // 同步到高级设置面板
                    const advancedRadio = document.querySelector(`input[name="import-mode"][value="${e.target.value}"]`);
                    if (advancedRadio) {
                        advancedRadio.checked = true;
                    }
                }
            });
        });

        // 重新绑定导入行为事件监听器
        const quickImportBehaviorRadios = document.querySelectorAll('input[name="import-behavior"]');
        quickImportBehaviorRadios.forEach((radio) => {
            // 重新绑定导入行为选项

            // 移除旧的监听器（如果存在）
            radio.onchange = null;

            // 添加新的监听器
            radio.addEventListener('change', (e) => {
                this.log(`🎯 导入行为事件触发: ${e.target.value}, checked: ${e.target.checked}`, 'info');
                if (e.target.checked) {
                    this.log(`导入行为设置已更改为: ${e.target.value}`, 'info');

                    if (e.target.value === 'no_import') {
                        // 选择了"不导入合成"
                        this.updateQuickSetting('addToComposition', false);
                    } else {
                        // 选择了时间轴位置选项
                        this.updateQuickSetting('addToComposition', true);
                        this.updateQuickSetting('timelineOptions.placement', e.target.value);
                    }

                    // 同步到高级设置面板
                    this.syncQuickToAdvanced();

                    // 显示设置说明
                    const descriptions = {
                        'no_import': '素材将不会添加到合成中',
                        'current_time': '素材将放置在当前时间指针位置',
                        'timeline_start': '素材将移至时间轴开始处（0秒位置）'
                    };
                    this.log(`设置说明: ${descriptions[e.target.value]}`, 'info');
                }
            });
        });

        // 事件监听器重新绑定完成
    }

    // 一键修复所有快速设置问题
    fixAllQuickSettingsIssues() {
        this.log('🚀 开始一键修复所有快速设置问题...', 'info');

        try {
            // 1. 强制设置为已初始化
            this.quickSettingsInitialized = true;
            this.log('✅ 快速设置已强制设置为初始化完成', 'success');

            // 2. 重新绑定事件监听器
            this.rebindQuickSettingsEventListeners();

            // 3. 加载快速设置UI
            this.loadQuickSettings();

            // 4. 验证修复效果
            this.log('🧪 验证修复效果...', 'info');
            setTimeout(() => {
                this.diagnoseQuickSettings();

                // 5. 测试功能
                setTimeout(() => {
                    this.log('🧪 测试快速设置功能...', 'info');
                    this.testQuickSettingChange('mode', 'custom_folder');

                    setTimeout(() => {
                        this.testQuickSettingChange('timeline', 'timeline_start');
                    }, 1000);
                }, 1000);
            }, 500);

            this.log('🚀 一键修复完成！', 'success');

        } catch (error) {
            this.log(`❌ 一键修复失败: ${error.message}`, 'error');
            console.error('一键修复详细错误:', error);
        }
    }

    // ==================== 拖拽导入功能 ====================

    // 设置拖拽监听
    setupDragAndDrop() {
        try {
            // 防止默认拖拽行为
            document.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // 添加视觉反馈
                document.body.classList.add('drag-over');
            });

            document.addEventListener('dragenter', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            document.addEventListener('dragleave', (e) => {
                // 只有当拖拽完全离开窗口时才移除样式
                if (e.clientX === 0 && e.clientY === 0) {
                    document.body.classList.remove('drag-over');
                }
            });

            // 处理文件拖拽
            document.addEventListener('drop', this.handleFileDrop.bind(this));

            // 拖拽事件监听器已设置
        } catch (error) {
            this.log(`设置拖拽监听失败: ${error.message}`, 'error');
        }
    }

    // 处理文件拖拽
    async handleFileDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        // 移除视觉反馈
        document.body.classList.remove('drag-over');

        try {
            const files = Array.from(event.dataTransfer.files);
            const items = Array.from(event.dataTransfer.items);
            
            if (files.length === 0 && items.length === 0) {
                this.log('拖拽中没有检测到文件', 'warning');
                this.showDropMessage('未检测到文件', 'warning');
                return;
            }

            this.log(`检测到拖拽内容: ${files.length} 个文件, ${items.length} 个项目`, 'info');

            // 检查是否包含文件夹
            const hasDirectories = items.some(item => item.webkitGetAsEntry && item.webkitGetAsEntry()?.isDirectory);
            
            if (hasDirectories) {
                // 处理文件夹拖拽（可能包含序列帧）
                await this.handleDirectoryDrop(items, files);
            } else {
                // 处理普通文件拖拽
                await this.handleFilesDrop(files, event.dataTransfer);
            }
        } catch (error) {
            this.log(`处理拖拽失败: ${error.message}`, 'error');
            this.showDropMessage('拖拽处理失败', 'error');
        }
    }

    // 处理文件夹拖拽
    async handleDirectoryDrop(items, files) {
        this.log('检测到文件夹拖拽，开始处理...', 'info');
        
        const allFiles = [];
        
        // 递归读取文件夹内容
        for (const item of items) {
            const entry = item.webkitGetAsEntry();
            if (entry) {
                const entryFiles = await this.readDirectoryEntry(entry);
                allFiles.push(...entryFiles);
            }
        }
        
        // 添加直接拖拽的文件
        allFiles.push(...files);
        
        if (allFiles.length === 0) {
            this.showDropMessage('文件夹中没有找到可导入的文件', 'warning');
            return;
        }
        
        this.log(`文件夹中找到 ${allFiles.length} 个文件`, 'info');
        
        // 分析文件类型和序列帧
        const analysis = this.analyzeDroppedFiles(allFiles);
        
        // 显示导入选项对话框
        this.showFileImportDialog(allFiles, analysis);
    }
    
    // 递归读取文件夹内容
    async readDirectoryEntry(entry) {
        const files = [];
        
        if (entry.isFile) {
            return new Promise((resolve) => {
                entry.file((file) => {
                    // 添加路径信息
                    file.fullPath = entry.fullPath;
                    file.relativePath = entry.fullPath;
                    resolve([file]);
                }, () => resolve([]));
            });
        } else if (entry.isDirectory) {
            const reader = entry.createReader();
            
            // 修复：循环读取所有文件，因为readEntries可能不会一次性返回所有文件
            const allEntries = [];
            let entries;
            do {
                entries = await new Promise((resolve) => {
                    reader.readEntries(resolve, () => resolve([]));
                });
                allEntries.push(...entries);
                this.log(`读取目录 ${entry.fullPath}: 本次获取 ${entries.length} 个条目，累计 ${allEntries.length} 个`, 'debug');
            } while (entries.length > 0);
            
            this.log(`目录 ${entry.fullPath} 总共包含 ${allEntries.length} 个条目`, 'debug');
            
            for (const childEntry of allEntries) {
                const childFiles = await this.readDirectoryEntry(childEntry);
                files.push(...childFiles);
            }
        }
        
        return files;
    }
    
    // 分析拖拽的文件
    analyzeDroppedFiles(files) {
        this.log(`开始分析拖拽文件，总数: ${files.length}`, 'info');
        
        const analysis = {
            total: files.length,
            categories: {
                image: [],
                video: [],
                audio: [],
                design: [],
                project: [],
                unknown: []
            },
            sequences: [],
            folders: new Set()
        };
        
        // 按文件夹分组
        const folderGroups = {};
        const folderFullPaths = {}; // 存储文件夹的完整路径映射
        
        files.forEach(file => {
            const category = this.getFileCategory(file);
            analysis.categories[category].push(file);
            
            // 提取文件夹路径
            const path = file.fullPath || file.relativePath || file.webkitRelativePath || '';
            const folderPath = path.substring(0, path.lastIndexOf('/'));
            
            if (folderPath) {
                analysis.folders.add(folderPath);
                if (!folderGroups[folderPath]) {
                    folderGroups[folderPath] = [];
                }
                folderGroups[folderPath].push(file);
                
                // 尝试获取完整的文件夹路径
                if (file.originalFile && file.originalFile.path) {
                    // 从完整文件路径中提取文件夹路径
                    const fullFilePath = file.originalFile.path;
                    const fullFolderPath = fullFilePath.substring(0, fullFilePath.lastIndexOf('\\'));
                    if (fullFolderPath && !folderFullPaths[folderPath]) {
                        folderFullPaths[folderPath] = fullFolderPath;
                    }
                } else if (file.path && file.path.includes('\\')) {
                    // 直接从文件路径提取
                    const fullFolderPath = file.path.substring(0, file.path.lastIndexOf('\\'));
                    if (fullFolderPath && !folderFullPaths[folderPath]) {
                        folderFullPaths[folderPath] = fullFolderPath;
                    }
                }
            }
        });
        
        this.log(`文件分类统计: 图像${analysis.categories.image.length}, 视频${analysis.categories.video.length}, 音频${analysis.categories.audio.length}, 设计${analysis.categories.design.length}, 项目${analysis.categories.project.length}, 未知${analysis.categories.unknown.length}`, 'info');
        this.log(`检测到 ${analysis.folders.size} 个文件夹`, 'info');
        
        // 检测序列帧
        let totalSequenceFiles = 0;
        for (const [folderPath, folderFiles] of Object.entries(folderGroups)) {
            this.log(`检查文件夹: ${folderPath}, 文件数: ${folderFiles.length}`, 'debug');
            const sequence = this.detectImageSequence(folderFiles);
            if (sequence) {
                // 使用完整路径或回退到相对路径
                const fullFolderPath = folderFullPaths[folderPath] || folderPath;
                
                analysis.sequences.push({
                    folder: fullFolderPath, // 使用完整路径
                    files: sequence.files,
                    pattern: sequence.pattern,
                    start: sequence.start,
                    end: sequence.end,
                    step: sequence.step,
                    totalFiles: sequence.totalFiles
                });
                totalSequenceFiles += sequence.totalFiles;
                this.log(`✅ 文件夹 ${folderPath} 识别为序列帧: ${sequence.pattern}`, 'info');
            } else {
                this.log(`❌ 文件夹 ${folderPath} 未识别为序列帧`, 'debug');
            }
        }
        
        this.log(`序列帧检测完成: 发现 ${analysis.sequences.length} 个序列帧文件夹，共 ${totalSequenceFiles} 个序列帧文件`, 'info');
        
        return analysis;
    }
    
    // 检测图片序列帧
    detectImageSequence(files) {
        // 只检测图片文件
        const imageFiles = files.filter(file => this.getFileCategory(file) === 'image');
        
        this.log(`检测序列帧: 图像文件数 ${imageFiles.length}`, 'debug');
        
        if (imageFiles.length < 2) return null; // 至少需要2个文件才算序列帧
        
        // 按文件名排序
        imageFiles.sort((a, b) => a.name.localeCompare(b.name));
        
        // 尝试找到数字模式
        const patterns = [];
        
        for (const file of imageFiles) {
            const name = file.name;
            const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
            
            // 查找数字模式 - 支持多种数字格式，优先匹配最后一个数字序列
            const numberMatches = nameWithoutExt.match(/(.*?)(\d+)([^\d]*)$/); // 匹配最后一个数字序列
            if (numberMatches) {
                const [, prefix, number, suffix] = numberMatches;
                patterns.push({
                    prefix: prefix || '',
                    number: parseInt(number),
                    suffix: suffix || '',
                    numberLength: number.length,
                    originalNumber: number,
                    file
                });
                this.log(`文件 ${file.name} 匹配模式: 前缀="${prefix}", 数字=${number}, 后缀="${suffix}"`, 'debug');
            } else {
                this.log(`文件 ${file.name} 未匹配数字模式`, 'debug');
            }
        }
        
        this.log(`找到 ${patterns.length} 个符合数字模式的文件`, 'debug');
        
        if (patterns.length < 2) {
            this.log('数字模式文件数量不足，不构成序列', 'debug');
            return null;
        }
        
        // 找到最一致的模式
        const patternGroups = {};
        patterns.forEach(p => {
            const key = `${p.prefix}_${p.suffix}_${p.numberLength}`;
            if (!patternGroups[key]) {
                patternGroups[key] = [];
            }
            patternGroups[key].push(p);
        });
        
        this.log(`找到 ${Object.keys(patternGroups).length} 个不同的模式组`, 'debug');
        
        // 找到最大的组
        let bestGroup = null;
        let maxSize = 0;
        
        for (const [key, group] of Object.entries(patternGroups)) {
            this.log(`模式组 ${key}: ${group.length} 个文件`, 'debug');
            if (group.length > maxSize) {
                maxSize = group.length;
                bestGroup = group;
            }
        }
        
        // 对于大量文件，降低要求；对于少量文件，保持较高要求
        const minGroupSize = imageFiles.length >= 10 ? Math.max(2, Math.floor(imageFiles.length * 0.8)) : 2;
        if (!bestGroup || bestGroup.length < minGroupSize) {
            this.log(`没有找到足够大的模式组，需要至少${minGroupSize}个文件，实际最大组${bestGroup ? bestGroup.length : 0}个`, 'debug');
            return null;
        }
        
        this.log(`选择最佳模式组，包含 ${bestGroup.length} 个文件`, 'debug');
        
        // 排序并检查连续性
        bestGroup.sort((a, b) => a.number - b.number);
        
        const numbers = bestGroup.map(p => p.number);
        const start = numbers[0];
        const end = numbers[numbers.length - 1];
        
        // 检测步长
        let step = 1;
        if (numbers.length > 1) {
            const diffs = [];
            for (let i = 1; i < numbers.length; i++) {
                diffs.push(numbers[i] - numbers[i - 1]);
            }
            
            // 找到最常见的差值作为步长
            const diffCounts = {};
            diffs.forEach(diff => {
                diffCounts[diff] = (diffCounts[diff] || 0) + 1;
            });
            
            let maxCount = 0;
            for (const [diff, count] of Object.entries(diffCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    step = parseInt(diff);
                }
            }
        }
        
        // 构建模式字符串
        const firstPattern = bestGroup[0];
        const pattern = `${firstPattern.prefix}[${start}-${end}]${firstPattern.suffix}`;
        
        const result = {
            files: bestGroup.map(p => p.file),
            pattern,
            start,
            end,
            step,
            totalFiles: bestGroup.length,
            detectedRange: `${start}-${end}`,
            prefix: firstPattern.prefix,
            suffix: firstPattern.suffix,
            numberLength: firstPattern.numberLength
        };
        
        this.log(`✅ 检测到序列帧: ${pattern}, 范围: ${start}-${end}, 步长: ${step}, 文件数: ${bestGroup.length}`, 'info');
        
        return result;
    }
    
    // 处理普通文件拖拽
    async handleFilesDrop(files, dataTransfer) {
        // 检测是否为Eagle拖拽
        if (this.isEagleDrag(dataTransfer, files)) {
            await this.handleEagleDragImport(files);
        } else {
            // 优先检查项目状态 - 确保AE项目已打开
            const projectStatusValid = await this.projectStatusChecker.validateProjectStatus({
                requireProject: true,
                requireActiveComposition: false, // 拖拽时不强制要求合成，后续会检查
                showWarning: true
            });
            
            if (!projectStatusValid) {
                this.log('拖拽导入被阻止：项目状态不满足要求', 'warning');
                return;
            }
            
            // 分析文件类型
            const analysis = this.analyzeDroppedFiles(files);
            
            // 显示导入选项对话框
            this.showFileImportDialog(files, analysis);
        }
    }
    
    // 显示文件导入对话框
    showFileImportDialog(files, analysis) {
        // 移除现有对话框
        const existingDialog = document.querySelector('.eagle-confirm-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        // 检测是否包含序列帧文件夹
        const hasSequences = analysis.sequences && analysis.sequences.length > 0;
        const folderCount = analysis.folders ? analysis.folders.size : 0;
        
        // 生成检测统计信息
        let detectionInfo = '';
        if (hasSequences) {
            // 计算实际序列帧文件数量
            const totalSequenceFiles = analysis.sequences.reduce((sum, seq) => sum + seq.files.length, 0);
            detectionInfo = `检测到 ${analysis.sequences.length} 个序列帧文件夹，共 ${totalSequenceFiles} 个文件`;
        } else if (folderCount > 0) {
            detectionInfo = `检测到 ${folderCount} 个文件夹，共 ${files.length} 个文件`;
        } else {
            detectionInfo = `检测到 ${files.length} 个文件`;
        }
        
        // 确定要显示的文件列表
        let displayFiles = files;
        let totalDisplayFiles = files.length;
        
        if (hasSequences) {
            // 对于序列帧，显示序列帧中的文件
            displayFiles = [];
            analysis.sequences.forEach(seq => {
                displayFiles = displayFiles.concat(seq.files.slice(0, Math.max(1, Math.floor(5 / analysis.sequences.length))));
            });
            totalDisplayFiles = analysis.sequences.reduce((sum, seq) => sum + seq.files.length, 0);
        }
        
        // 生成文件信息HTML
        let fileInfoHtml = '';
        
        if (hasSequences) {
            // 序列帧显示为单行
            analysis.sequences.forEach(seq => {
                // 计算序列帧总大小
                const totalSize = seq.files.reduce((sum, file) => sum + (file.size || 0), 0);
                const sizeText = this.formatFileSize(totalSize);
                
                fileInfoHtml += `
                    <div class="file-item-simple">
                        <span class="file-icon">🎞️</span>
                        <span class="file-name">${seq.pattern}</span>
                        <span class="file-size">${sizeText}</span>
                        <span class="file-type">序列帧</span>
                    </div>
                `;
            });
        } else {
            // 普通文件显示
            fileInfoHtml = displayFiles.slice(0, 5).map(file => {
                const icon = this.getFileIcon(file);
                const size = this.formatFileSize(file.size);
                const type = this.getFileType(file);
                return `
                    <div class="file-item-simple">
                        <span class="file-icon">${icon}</span>
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${size}</span>
                        <span class="file-type">${type}</span>
                    </div>
                `;
            }).join('');
        }
        
        // 如果文件数量超过5个，显示省略提示（仅对非序列帧）
        const moreFilesHtml = (!hasSequences && totalDisplayFiles > 5) ? 
            `<div class="file-item-simple"><span class="file-name">... 还有 ${totalDisplayFiles - Math.min(5, displayFiles.length)} 个文件</span></div>` : '';
        
        // 获取当前设置并确定导入模式和行为
        const settings = this.settingsManager.getSettings();
        
        // 导入模式映射
        const importModeText = {
            'direct': '直接导入',
            'project_adjacent': '项目旁复制',
            'custom_folder': '自定义文件夹'
        }[settings.mode] || settings.mode;
        
        // 根据是否自动添加到合成来确定导入行为
        let importBehavior;
        if (settings.addToComposition) {
            // 如果自动添加到合成，显示时间轴放置位置
            const timelinePlacement = {
                'current_time': '当前时间',
                'timeline_start': '时间轴开始'
            }[settings.timelineOptions?.placement] || '当前时间';
            importBehavior = timelinePlacement;
        } else {
            // 如果不自动添加到合成，显示"不导入合成"
            importBehavior = '不导入合成';
        }
        
        let importMode = importModeText;
        
        // 检查是否是序列帧或文件夹，并根据情况调整导入行为显示
        // 只有当用户没有明确设置导入行为时，才显示特殊的序列帧/文件夹导入提示
        if (hasSequences && settings.mode === ImportModes.DIRECT) { // 假设直接导入模式下，序列帧导入是特殊行为
            importBehavior = '序列帧导入';
        } else if (folderCount > 0 && settings.mode === ImportModes.DIRECT) { // 假设直接导入模式下，文件夹导入是特殊行为
            importBehavior = '文件夹导入';
        }
        
        // 创建对话框
        const dialog = document.createElement('div');
        dialog.className = 'eagle-confirm-dialog';
        
        dialog.innerHTML = `
            <div class="eagle-confirm-content">
                <div class="eagle-confirm-header">
                    <h3>拖拽导入确认</h3>
                </div>
                <div class="eagle-confirm-body">
                    <p>${detectionInfo}</p>
                    <div class="file-list">
                        ${fileInfoHtml}
                        ${moreFilesHtml}
                    </div>
                    <div class="import-settings-dark">
                        <div class="setting-item"><span class="setting-label">导入模式:</span><span class="setting-value">${importMode}</span></div>
                        <div class="setting-item"><span class="setting-label">导入行为:</span><span class="setting-value">${importBehavior}</span></div>
                    </div>
                </div>
                <div class="eagle-confirm-actions-flex">
                    <button id="drag-confirm-yes" class="btn-outline-primary">确认导入</button>
                    <button id="drag-confirm-no" class="btn-outline-secondary">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 绑定事件
        document.getElementById('drag-confirm-yes').onclick = async () => {
            dialog.remove();
            // 根据检测结果选择导入方式
            if (hasSequences) {
                await this.handleImportAction(files, analysis, 'sequences');
            } else if (folderCount > 0) {
                await this.handleImportAction(files, analysis, 'folders');
            } else {
                await this.handleImportAction(files, analysis, 'all');
            }
        };
        
        document.getElementById('drag-confirm-no').onclick = () => {
            dialog.remove();
        };
        
        // 样式已统一使用剪贴板导入确认面板的样式
    }
    
    // 处理导入操作
    async handleImportAction(files, analysis, action) {
        let filesToImport = [];
        
        switch (action) {
            case 'all':
                filesToImport = files;
                break;
            case 'sequences':
                // 导入所有序列帧（以序列为单位）
                this.log(`检测到 ${analysis.sequences.length} 个序列帧文件夹`, 'info');
                await this.handleSequenceImport(analysis.sequences);
                return;
            case 'folders':
                // 导入文件夹（以文件夹为单位）
                this.log(`检测到 ${analysis.folders.size} 个文件夹`, 'info');
                await this.handleFolderImport(analysis, files);
                return;
            case 'images':
                filesToImport = analysis.categories.image;
                break;
            case 'videos':
                filesToImport = analysis.categories.video;
                break;
            default:
                filesToImport = files;
        }
        
        if (filesToImport.length === 0) {
            this.showDropMessage('没有文件需要导入', 'warning');
            return;
        }
        
        this.log(`开始导入 ${filesToImport.length} 个文件 (${action} 模式)`, 'info');
        
        // 普通文件导入
        await this.handleNonEagleDragImport(filesToImport);
    }
    
    // 处理序列帧导入
    async handleSequenceImport(sequences) {
        let successCount = 0;
        let totalSequences = sequences.length;
        
        for (const sequence of sequences) {
            try {
                this.log(`导入序列帧文件夹: ${sequence.folder} (${sequence.pattern})`, 'info');
                this.log(`序列帧范围: ${sequence.start}-${sequence.end}, 步长: ${sequence.step}, 文件数: ${sequence.files.length}`, 'info');
                
                // 构造序列帧导入消息
                const message = {
                    type: 'import_sequence',
                    sequence: {
                        files: sequence.files.map(file => ({
                            name: file.name,
                            path: file.fullPath || file.relativePath || file.name,
                            size: file.size,
                            type: file.type,
                            lastModified: file.lastModified
                        })),
                        pattern: sequence.pattern,
                        start: sequence.start,
                        end: sequence.end,
                        step: sequence.step,
                        folder: sequence.folder,
                        totalFiles: sequence.files.length
                    },
                    source: 'sequence_drag_drop',
                    timestamp: Date.now(),
                    isDragImport: true
                };
                
                // 调用序列帧导入处理
                const result = await this.handleImportFiles(message);
                if (result && result.success) {
                    successCount++;
                    this.log(`✅ 序列帧文件夹导入成功: ${sequence.folder}`, 'success');
                } else {
                    this.log(`❌ 序列帧文件夹导入失败: ${sequence.folder}`, 'error');
                }
                
            } catch (error) {
                this.log(`❌ 序列帧导入失败: ${sequence.folder} - ${error.message}`, 'error');
            }
        }
        
        if (successCount === totalSequences) {
            this.showDropMessage(`✅ 所有序列帧文件夹导入完成 (${successCount}/${totalSequences})`, 'success');
        } else {
            this.showDropMessage(`⚠️ 序列帧导入完成 (${successCount}/${totalSequences})`, 'warning');
        }
    }
    
    // 处理文件夹导入
    async handleFolderImport(analysis, allFiles) {
        const folderGroups = {};
        
        // 按文件夹分组文件
        allFiles.forEach(file => {
            const path = file.fullPath || file.relativePath || file.webkitRelativePath || '';
            const folderPath = path.substring(0, path.lastIndexOf('/'));
            if (folderPath) {
                if (!folderGroups[folderPath]) {
                    folderGroups[folderPath] = [];
                }
                folderGroups[folderPath].push(file);
            }
        });
        
        let successCount = 0;
        let totalFolders = Object.keys(folderGroups).length;
        
        // 逐个文件夹导入
        for (const [folderPath, folderFiles] of Object.entries(folderGroups)) {
            try {
                this.log(`导入文件夹: ${folderPath} (${folderFiles.length} 个文件)`, 'info');
                
                // 构造文件夹导入消息
                const message = {
                    type: 'import_folder',
                    folder: {
                        path: folderPath,
                        files: folderFiles.map(file => ({
                            name: file.name,
                            path: file.fullPath || file.relativePath || file.name,
                            size: file.size,
                            type: file.type,
                            lastModified: file.lastModified
                        })),
                        totalFiles: folderFiles.length
                    },
                    source: 'folder_drag_drop',
                    timestamp: Date.now(),
                    isDragImport: true
                };
                
                // 调用文件夹导入处理
                const result = await this.handleImportFiles(message);
                if (result && result.success) {
                    successCount++;
                    this.log(`✅ 文件夹导入成功: ${folderPath}`, 'success');
                } else {
                    this.log(`❌ 文件夹导入失败: ${folderPath}`, 'error');
                }
                
            } catch (error) {
            this.log(`❌ 文件夹导入失败: ${folderPath} - ${error.message}`, 'error');
        }
    }
    
    if (successCount === totalFolders) {
        this.showDropMessage(`✅ 所有文件夹导入完成 (${successCount}/${totalFolders})`, 'success');
    } else {
        this.showDropMessage(`⚠️ 文件夹导入完成 (${successCount}/${totalFolders})`, 'warning');
    }
}

// 处理序列帧导入到AE
async handleSequenceImportToAE(sequence, settings = null) {
    try {
        this.log(`🎞️ 开始导入序列帧: ${sequence.folder}`, 'info');
        this.log(`📊 序列帧信息: ${sequence.pattern}, 范围: ${sequence.start}-${sequence.end}, 文件数: ${sequence.totalFiles}`, 'info');
        
        // 获取项目信息
        await this.refreshProjectInfo();
        const projectInfo = await this.getProjectInfo();
        
        if (!projectInfo.activeComp) {
            throw new Error('没有活动合成，请先选择或创建一个合成');
        }
        
        // 使用传入的设置或默认设置
        const effectiveSettings = settings || this.settingsManager.getSettings();
        
        // 构造序列帧导入参数
        const sequenceData = {
            type: 'sequence',
            folder: sequence.folder,
            pattern: sequence.pattern,
            start: sequence.start,
            end: sequence.end,
            step: sequence.step || 1,
            files: sequence.files,
            totalFiles: sequence.totalFiles,
            // 添加导入设置
            settings: effectiveSettings
        };
        
        // 调用AE脚本导入序列帧
        const result = await this.callAEScript('importSequence', sequenceData);
        
        if (result && result.success) {
            this.log(`✅ 序列帧导入成功: ${sequence.folder}`, 'success');
            return { success: true, importedCount: 1, targetComp: projectInfo.activeComp ? projectInfo.activeComp.name : 'Unknown' };
        } else {
            throw new Error(result ? result.error : '序列帧导入失败');
        }
        
    } catch (error) {
        this.log(`❌ 序列帧导入失败: ${error.message}`, 'error');
        return { success: false, error: error.message, importedCount: 0 };
    }
}

// 处理文件夹导入到AE
async handleFolderImportToAE(folder) {
    try {
        this.log(`📁 开始导入文件夹: ${folder.path}`, 'info');
        this.log(`📊 文件夹信息: ${folder.totalFiles} 个文件`, 'info');
        
        // 获取项目信息
        await this.refreshProjectInfo();
        const projectInfo = await this.getProjectInfo();
        
        if (!projectInfo.activeComp) {
            throw new Error('没有活动合成，请先选择或创建一个合成');
        }
        
        // 构造文件夹导入参数
        const folderData = {
            type: 'folder',
            path: folder.path,
            files: folder.files,
            totalFiles: folder.totalFiles
        };
        
        // 调用AE脚本导入文件夹
        const result = await this.callAEScript('importFolder', folderData);
        
        if (result && result.success) {
            this.log(`✅ 文件夹导入成功: ${folder.path}`, 'success');
            return { success: true, importedCount: folder.totalFiles, targetComp: projectInfo.activeComp ? projectInfo.activeComp.name : 'Unknown' };
        } else {
            throw new Error(result ? result.error : '文件夹导入失败');
        }
        
    } catch (error) {
        this.log(`❌ 文件夹导入失败: ${error.message}`, 'error');
        return { success: false, error: error.message, importedCount: 0 };
    }
}
    
    // 识别Eagle拖拽
    isEagleDrag(dataTransfer, files) {
        try {
            // 方法1：检查文件路径特征（主要检测方法）
            const hasEaglePath = files.some(file => {
                const path = file.path || file.webkitRelativePath || '';
                const pathLower = path.toLowerCase();
                return pathLower.includes('eagle') ||
                       pathLower.includes('.eaglepack') ||
                       pathLower.includes('library.library') ||
                       (pathLower.includes('images') && pathLower.includes('library'));
            });

            // 方法2：检查自定义数据类型
            const hasEagleData = dataTransfer.types.some(type => {
                const typeLower = type.toLowerCase();
                return typeLower.includes('eagle') ||
                       typeLower.includes('x-eagle') ||
                       typeLower.includes('application/x-eagle');
            });

            // 方法3：检查拖拽来源信息
            const plainText = dataTransfer.getData('text/plain') || '';
            const plainTextLower = plainText.toLowerCase();
            const hasEagleMetadata = plainTextLower.includes('eagle') ||
                                   plainTextLower.includes('.eaglepack') ||
                                   plainTextLower.includes('library.library');

            const isEagle = hasEaglePath || hasEagleData || hasEagleMetadata;

            // 简化的日志输出
            if (isEagle) {
                this.log(`✅ 识别为Eagle拖拽 (${files.length}个文件)`, 'success');
            } else {
                this.log(`📁 检测到普通文件拖拽 (${files.length}个文件)`, 'info');
            }

            return isEagle;
        } catch (error) {
            this.log(`Eagle拖拽检测失败: ${error.message}`, 'error');
            return false;
        }
    }

    // 处理Eagle拖拽导入
    async handleEagleDragImport(files) {
        try {
            // 优先检查项目状态 - 确保AE项目已打开
            const projectStatusValid = await this.projectStatusChecker.validateProjectStatus({
                requireProject: true,
                requireActiveComposition: false, // 拖拽时不强制要求合成，后续会检查
                showWarning: true
            });
            
            if (!projectStatusValid) {
                this.log('拖拽导入被阻止：项目状态不满足要求', 'warning');
                return;
            }

            // 转换文件格式以匹配现有的导入接口
            const fileData = files.map(file => {
                // 尝试获取完整路径信息
                let fullPath = file.path || file.webkitRelativePath || file.name;
                
                // 如果是拖拽导入且有完整路径信息，尝试提取目录路径
                if (file.path && file.path.includes('\\')) {
                    // Windows路径格式，保持完整路径
                    fullPath = file.path;
                } else if (file.webkitRelativePath) {
                    // 相对路径，需要结合其他信息构建完整路径
                    fullPath = file.webkitRelativePath;
                }
                
                return {
                    name: file.name,
                    path: fullPath,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    isDragImport: true,
                    // 添加原始文件对象引用，用于后续路径解析
                    originalFile: file
                };
            });

            // 构造消息对象，模拟Eagle扩展发送的消息格式
            const message = {
                type: 'export',
                files: fileData,
                source: 'drag_drop',
                timestamp: Date.now(),
                isDragImport: true
            };

            // 调用现有的文件处理流程
            const result = await this.handleImportFiles(message);

            // 只有导入成功时才播放音效和显示提示
            if (result && result.success) {
                // 播放Eagle导入音效
                try {
                    if (this.soundPlayer && typeof this.soundPlayer.playEagleSound === 'function') {
                        this.soundPlayer.playEagleSound();
                    }
                } catch (soundError) {
                    // 忽略音效播放错误，不影响主要功能
                    console.warn('播放Eagle音效失败:', soundError);
                }

                // 显示简洁的成功提示
                this.showDropMessage(`导入成功`, 'success');
            }

        } catch (error) {
            this.log(`❌ Eagle拖拽导入失败: ${error.message}`, 'error');
            this.showDropMessage('❌ 导入失败', 'error');
        }
    }

    // 处理非Eagle文件拖拽导入
    async handleNonEagleDragImport(files) {
        try {
            // 移除开始导入提示，直接处理

            // 转换文件格式以匹配现有的导入接口
            const fileData = files.map(file => ({
                name: file.name,
                path: file.path || file.webkitRelativePath || file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                isDragImport: true,
                isNonEagleFile: true // 标记为非Eagle文件
            }));

            // 构造消息对象，模拟文件导入消息格式
            const message = {
                type: 'import',
                files: fileData,
                source: 'file_drag_drop',
                timestamp: Date.now(),
                isDragImport: true
            };

            // 调用现有的文件处理流程
            const result = await this.handleImportFiles(message);

            // 只有导入成功时才显示提示
            if (result && result.success) {
                // 显示简洁的成功提示
                this.showDropMessage(`导入成功`, 'success');
            }

        } catch (error) {
            this.log(`❌ 文件拖拽导入失败: ${error.message}`, 'error');
            this.showDropMessage('❌ 导入失败', 'error');
        }
    }

    // 显示拖拽提示
    showDragHint() {
        try {
            // 创建提示元素
            const hint = document.createElement('div');
            hint.className = 'drag-hint';
            hint.innerHTML = `
                <div class="drag-hint-content">
                    <span class="drag-hint-icon">📁</span>
                    <span class="drag-hint-text">请从Eagle拖拽文件到此处</span>
                </div>
            `;

            document.body.appendChild(hint);

            // 3秒后自动移除
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 3000);
        } catch (error) {
            this.log(`显示拖拽提示失败: ${error.message}`, 'error');
        }
    }

    // 显示拖拽导入开始提示
    showDragImportStarted(fileCount) {
        try {
            this.log(`🚀 开始导入 ${fileCount} 个文件...`, 'info');

            // 更新状态显示
            const statusElement = document.getElementById('import-status');
            if (statusElement) {
                statusElement.className = 'import-status processing';
                statusElement.textContent = `正在导入 ${fileCount} 个文件...`;
            }

            const latestLogElement = document.getElementById('latest-log-message');
            if (latestLogElement) {
                latestLogElement.textContent = `拖拽导入: ${fileCount} 个文件`;
            }
        } catch (error) {
            this.log(`显示导入开始提示失败: ${error.message}`, 'error');
        }
    }

    // 显示拖拽导入错误
    showDragImportError(errorMessage) {
        try {
            const statusElement = document.getElementById('import-status');
            if (statusElement) {
                statusElement.className = 'import-status error';
                statusElement.textContent = '拖拽导入失败';
            }

            const latestLogElement = document.getElementById('latest-log-message');
            if (latestLogElement) {
                latestLogElement.textContent = `拖拽导入错误: ${errorMessage}`;
            }
        } catch (error) {
            this.log(`显示导入错误提示失败: ${error.message}`, 'error');
        }
    }

    // 显示拖拽反馈消息
    showDropMessage(message, type = 'info') {
        try {
            // 创建临时消息元素
            const dropMessage = document.createElement('div');
            dropMessage.className = `drop-message drop-message-${type}`;
            dropMessage.innerHTML = `
                <div class="drop-message-content">
                    <span class="drop-message-icon">${this.getDropMessageIcon(type)}</span>
                    <span class="drop-message-text">${message}</span>
                </div>
            `;

            document.body.appendChild(dropMessage);

            // 动画显示
            setTimeout(() => {
                dropMessage.classList.add('drop-message-show');
            }, 10);

            // 根据类型设置不同的显示时间
            const duration = type === 'processing' ? 1000 : (type === 'success' ? 2000 : 3000);

            setTimeout(() => {
                dropMessage.classList.remove('drop-message-show');
                setTimeout(() => {
                    if (dropMessage.parentNode) {
                        dropMessage.parentNode.removeChild(dropMessage);
                    }
                }, 300);
            }, duration);

        } catch (error) {
            this.log(`显示拖拽消息失败: ${error.message}`, 'error');
        }
    }

    // 获取拖拽消息图标
    getDropMessageIcon(type) {
        const icons = {
            'info': '📋',
            'processing': '⚡',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️'
        };
        return icons[type] || '📋';
    }

    // 获取文件图标
    getFileIcon(file) {
        const category = this.getFileCategory(file);
        const icons = {
            'image': '🖼️',
            'video': '🎬',
            'audio': '🎵',
            'design': '🎨',
            'project': '📋',
            'sequence': '🎞️',
            'folder': '📁',
            'unknown': '📄'
        };
        return icons[category] || '📄';
    }

    // 显示非Eagle文件确认对话框
    showNonEagleConfirmDialog(files) {
        try {
            // 创建确认对话框
            const dialog = document.createElement('div');
            dialog.className = 'eagle-confirm-dialog';
            dialog.innerHTML = `
                <div class="eagle-confirm-content">
                    <div class="eagle-confirm-header">
                        <h3>导入文件确认</h3>
                    </div>
                    <div class="eagle-confirm-body">
                        <p>检测到 ${files.length} 个文件，是否要导入到After Effects？</p>
                        <p>文件将按照当前设置进行导入。</p>
                        <div class="file-list">
                            ${files.map(file => `<div class="file-item">${this.getFileIcon(file)} ${file.name}</div>`).join('')}
                        </div>
                    </div>
                    <div class="eagle-confirm-actions">
                        <button class="btn-cancel" id="file-confirm-no">取消</button>
                        <button class="btn-primary" id="file-confirm-yes">导入文件</button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            // 绑定事件
            document.getElementById('file-confirm-yes').onclick = async () => {
                dialog.remove();
                this.log('用户确认导入普通文件', 'info');
                await this.handleNonEagleDragImport(files);
            };

            document.getElementById('file-confirm-no').onclick = () => {
                dialog.remove();
                this.log('用户取消导入', 'info');
                this.showDropMessage('已取消导入', 'info');
            };

            // 15秒后自动关闭
            setTimeout(() => {
                if (dialog.parentNode) {
                    dialog.remove();
                    this.log('确认对话框超时关闭', 'info');
                }
            }, 15000);

        } catch (error) {
            this.log(`显示确认对话框失败: ${error.message}`, 'error');
        }
    }

    // 显示Eagle确认对话框
    showEagleConfirmDialog(files) {
        try {
            // 创建确认对话框
            const dialog = document.createElement('div');
            dialog.className = 'eagle-confirm-dialog';
            dialog.innerHTML = `
                <div class="eagle-confirm-content">
                    <div class="eagle-confirm-header">
                        <h3>确认拖拽来源</h3>
                    </div>
                    <div class="eagle-confirm-body">
                        <p>检测到 ${files.length} 个媒体文件，但无法自动确认是否来自Eagle。</p>
                        <p>这些文件是否来自Eagle应用程序？</p>
                        <div class="file-list">
                            ${files.map(file => `<div class="file-item">📄 ${file.name}</div>`).join('')}
                        </div>
                    </div>
                    <div class="eagle-confirm-actions">
                        <button class="btn-cancel" id="eagle-confirm-no">不是Eagle文件</button>
                        <button class="btn-primary" id="eagle-confirm-yes">是Eagle文件，导入</button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            // 绑定事件
            document.getElementById('eagle-confirm-yes').onclick = async () => {
                dialog.remove();
                this.log('用户确认为Eagle拖拽，开始导入', 'info');
                await this.handleEagleDragImport(files);
            };

            document.getElementById('eagle-confirm-no').onclick = () => {
                dialog.remove();
                this.log('用户确认非Eagle拖拽，已取消', 'info');
                this.showDragHint();
            };

            // 10秒后自动关闭
            setTimeout(() => {
                if (dialog.parentNode) {
                    dialog.remove();
                    this.log('确认对话框超时关闭', 'info');
                }
            }, 10000);

        } catch (error) {
            this.log(`显示确认对话框失败: ${error.message}`, 'error');
        }
    }

    // ==================== 剪贴板导入功能 ====================

    // 设置剪贴板监听
    setupClipboardListener() {
        try {
            // 监听键盘事件，检测Ctrl+V/Cmd+V
            document.addEventListener('keydown', (e) => {
                // 检测Ctrl+V (Windows) 或 Cmd+V (Mac)
                if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                    // 延迟一点执行，确保剪贴板内容已更新
                    setTimeout(() => {
                        this.handleClipboardPaste(e);
                    }, 50);
                }
            });

            // 也监听paste事件作为备用
            document.addEventListener('paste', (e) => {
                this.handleClipboardPaste(e);
            });

            this.log('剪贴板监听已设置', 'debug');
        } catch (error) {
            this.log(`设置剪贴板监听失败: ${error.message}`, 'error');
        }
    }

    // 处理剪贴板粘贴事件
    async handleClipboardPaste(event) {
        try {
            // 防止在输入框中触发
            if (event.target && (
                event.target.tagName === 'INPUT' ||
                event.target.tagName === 'TEXTAREA' ||
                event.target.contentEditable === 'true'
            )) {
                return;
            }

            this.log('检测到剪贴板粘贴操作', 'debug');

            let clipboardData = null;

            // 尝试从事件获取剪贴板数据
            if (event.clipboardData) {
                clipboardData = event.clipboardData;
            } else {
                // 尝试使用现代剪贴板API
                try {
                    const clipboardItems = await navigator.clipboard.read();
                    if (clipboardItems && clipboardItems.length > 0) {
                        // 构造类似clipboardData的对象
                        clipboardData = {
                            files: [],
                            types: [],
                            getData: () => ''
                        };

                        // 首先尝试获取文本信息，可能包含文件名
                        let possibleFileName = null;
                        for (const item of clipboardItems) {
                            if (item.types.includes('text/plain')) {
                                try {
                                    const text = await item.getType('text/plain');
                                    const textContent = await text.text();
                                    // 检查文本是否像文件路径
                                    const filePathMatch = textContent.match(/([^\\\\/]+\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg))$/i);
                                    if (filePathMatch) {
                                        possibleFileName = filePathMatch[1];
                                    }
                                } catch (e) {
                                    // 忽略文本获取错误
                                }
                            }
                        }

                        for (const item of clipboardItems) {
                            for (const type of item.types) {
                                clipboardData.types.push(type);
                                if (type.startsWith('image/')) {
                                    const blob = await item.getType(type);
                                    const ext = type.split('/')[1] === 'jpeg' ? 'jpg' : type.split('/')[1];

                                    // 智能文件名选择
                                    let fileName;
                                    if (possibleFileName && this.isValidImageFileName(possibleFileName)) {
                                        // 使用检测到的原始文件名
                                        fileName = possibleFileName;
                                    } else {
                                        // 使用通用名称，将被标记为临时文件
                                        fileName = `clipboard_image.${ext}`;
                                    }

                                    const file = new File([blob], fileName, { type });
                                    clipboardData.files.push(file);
                                }
                            }
                        }
                    }
                } catch (clipboardError) {
                    this.log(`无法访问剪贴板API: ${clipboardError.message}`, 'debug');
                }
            }

            if (!clipboardData) {
                this.log('无法获取剪贴板数据', 'debug');
                return;
            }

            // 检测剪贴板内容
            const clipboardContent = await this.detectClipboardContent(clipboardData);

            if (clipboardContent && clipboardContent.files.length > 0) {
                this.log(`检测到剪贴板中有 ${clipboardContent.files.length} 个可导入文件`, 'info');

                // 预处理文件名称，在显示对话框时就显示最终名称
                const processedFiles = clipboardContent.files.map(file => {
                    if (file.isTemporary && !file.hasOriginalName) {
                        // 只有临时文件且没有原始名称时才重命名
                        const ext = this.getFileExtension(file.name);
                        const newName = this.generateTimestampFilename(ext);



                        return {
                            ...file,
                            displayName: newName, // 用于显示的名称
                            originalName: file.name, // 保存原始名称
                            name: newName, // 更新实际名称
                            isTemporary: true,
                            wasRenamed: true // 标记已重命名
                        };
                    } else if (file.hasOriginalName) {
                        // 有原始名称的文件，保持原名

                        return {
                            ...file,
                            displayName: file.name,
                            hasOriginalName: true
                        };
                    }
                    return {
                        ...file,
                        displayName: file.name
                    };
                });

                this.showClipboardConfirmDialog({ ...clipboardContent, files: processedFiles });
            } else {
                this.log('剪贴板中没有可导入的内容', 'debug');
            }

        } catch (error) {
            this.log(`处理剪贴板粘贴失败: ${error.message}`, 'error');
        }
    }

    // 检测剪贴板内容
    async detectClipboardContent(clipboardData) {
        try {
            const result = {
                files: [],
                hasImages: false,
                hasFilePaths: false
            };

            // 检查文件
            if (clipboardData.files && clipboardData.files.length > 0) {
                const files = Array.from(clipboardData.files);
                for (const file of files) {
                    if (this.isImportableFile(file)) {
                        const fileName = file.path || file.name;
                        // 改进的临时文件检测逻辑
                        const isTemp = this.isTemporaryFileEnhanced(fileName);

                        result.files.push({
                            name: file.name,
                            path: file.path || file.name,
                            size: file.size,
                            type: file.type,
                            lastModified: file.lastModified || Date.now(),
                            isClipboardImport: true,
                            isTemporary: isTemp,
                            hasOriginalName: !isTemp, // 如果不是临时文件，说明有原始名称
                            file: file // 保存原始文件对象
                        });
                        result.hasImages = true;
                    }
                }
            }

            // 检查文本内容（可能包含文件路径）
            if (clipboardData.getData) {
                const textData = clipboardData.getData('text/plain') || '';
                if (textData.trim()) {
                    const filePaths = this.extractFilePathsFromText(textData);
                    if (filePaths.length > 0) {
                        result.hasFilePaths = true;
                        // 这里可以进一步处理文件路径，但需要文件系统访问权限
                        this.log(`检测到 ${filePaths.length} 个文件路径`, 'debug');
                    }
                }
            }

            return result.files.length > 0 ? result : null;

        } catch (error) {
            this.log(`检测剪贴板内容失败: ${error.message}`, 'error');
            return null;
        }
    }

    // 检查文件是否可导入
    isImportableFile(file) {
        if (!file || !file.type) return false;

        const importableTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp',
            'image/tiff', 'image/webp', 'image/svg+xml',
            'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm',
            'audio/mp3', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg'
        ];

        return importableTypes.some(type => file.type.startsWith(type.split('/')[0]));
    }

    // 检测是否为临时文件
    isTemporaryFile(filePath) {
        if (!filePath) return false;

        const tempKeywords = [
            'temp', 'tmp', 'temporary',
            'screenshot', 'screen shot', 'screen_shot', 'capture',
            'snip', 'clip', 'paste', 'clipboard',
            'appdata\\local\\temp', 'appdata/local/temp',
            '/tmp/', '/var/tmp/', '/private/tmp/',
            'c:\\windows\\temp', 'c:/windows/temp',
            '\\temp\\', '/temp/',
            'snipping tool', 'snipaste', 'lightshot'
        ];

        const pathLower = filePath.toLowerCase();
        return tempKeywords.some(keyword => pathLower.includes(keyword.toLowerCase()));
    }

    // 增强的临时文件检测（专门用于剪贴板导入）
    isTemporaryFileEnhanced(fileName) {
        if (!fileName) return false;

        // 1. 检查是否为通用的剪贴板文件名
        const genericNames = [
            /^clipboard_image\.(png|jpg|jpeg|gif|bmp|webp)$/i,
            /^image\.(png|jpg|jpeg|gif|bmp|webp)$/i,
            /^screenshot\.(png|jpg|jpeg|gif|bmp|webp)$/i,
            /^capture\.(png|jpg|jpeg|gif|bmp|webp)$/i,
            /^untitled\.(png|jpg|jpeg|gif|bmp|webp)$/i
        ];

        for (const pattern of genericNames) {
            if (pattern.test(fileName)) {
                return true;
            }
        }

        // 2. 使用原有的临时文件检测逻辑
        return this.isTemporaryFile(fileName);
    }

    // 从文本中提取文件路径
    extractFilePathsFromText(text) {
        const filePaths = [];
        const lines = text.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && (
                trimmed.match(/^[a-zA-Z]:\\/) || // Windows路径
                trimmed.startsWith('/') || // Unix路径
                trimmed.match(/\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg|mp4|mov|avi|mkv|webm|mp3|wav|aac|flac|ogg)$/i)
            )) {
                filePaths.push(trimmed);
            }
        }

        return filePaths;
    }

    // 生成时间戳文件名
    generateTimestampFilename(originalExt) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');

        return `screenshot_${year}${month}${day}_${hour}${minute}${second}${originalExt}`;
    }

    // 显示剪贴板确认对话框
    showClipboardConfirmDialog(clipboardContent) {
        try {
            const files = clipboardContent.files;
            const settings = this.settingsManager.getSettings();

            // 创建确认对话框
            const dialog = document.createElement('div');
            dialog.className = 'eagle-confirm-dialog';

            // 构建文件信息 - 简化为一行显示
            const fileInfoHtml = files.map((file, index) => {
                const sizeText = file.size ? this.formatFileSize(file.size) : '未知大小';
                const typeIcon = this.getFileIcon(file);
                const displayName = file.displayName || file.name;
                const fileType = file.type || '未知类型';

                return `
                    <div class="file-item-simple" data-file-index="${index}">
                        <span class="file-icon">${typeIcon}</span>
                        <span class="file-name" title="${displayName}">${displayName}</span>
                        <span class="file-size">${sizeText}</span>
                        <span class="file-type">${fileType}</span>
                    </div>
                `;
            }).join('');

            // 构建导入设置信息 - 简化显示
            const importModeText = {
                'direct': '直接导入',
                'project_adjacent': '项目旁复制',
                'custom_folder': '自定义文件夹'
            }[settings.mode] || settings.mode;

            // 获取当前设置
            const currentSettings = this.settingsManager.getSettings();
            
            // 根据是否自动添加到合成来确定导入行为
            let importBehavior;
            if (currentSettings.addToComposition) {
                // 如果自动添加到合成，显示时间轴放置位置
                const timelinePlacement = {
                    'current_time': '当前时间',
                    'timeline_start': '时间轴开始'
                }[currentSettings.timelineOptions?.placement] || '当前时间';
                importBehavior = timelinePlacement;
            } else {
                // 如果不自动添加到合成，显示"不导入合成"
                importBehavior = '不导入合成';
            }

            dialog.innerHTML = `
                <div class="eagle-confirm-content">
                    <div class="eagle-confirm-header">
                        <h3>剪贴板导入确认</h3>
                    </div>
                    <div class="eagle-confirm-body">
                        <p>检测到剪贴板中有 ${files.length} 个可导入文件</p>
                        <div class="file-list">
                            ${fileInfoHtml}
                        </div>
                        <div class="import-settings-dark">
                            <div class="setting-item"><span class="setting-label">导入模式:</span><span class="setting-value">${importModeText}</span></div>
                            <div class="setting-item"><span class="setting-label">导入行为:</span><span class="setting-value">${importBehavior}</span></div>
                        </div>
                    </div>
                    <div class="eagle-confirm-actions-flex">
                        <button class="btn-outline-primary" id="clipboard-confirm-yes">导入文件</button>
                        <button class="btn-outline-secondary" id="clipboard-confirm-no">取消</button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            // 绑定事件
            document.getElementById('clipboard-confirm-yes').onclick = async () => {
                dialog.remove();
                this.log('用户确认导入剪贴板内容', 'info');
                await this.handleClipboardImport(files);
            };

            document.getElementById('clipboard-confirm-no').onclick = () => {
                dialog.remove();
                this.log('用户取消剪贴板导入', 'info');
                this.showDropMessage('已取消导入', 'info');
            };

            // 点击对话框外部关闭
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.remove();
                    this.log('剪贴板确认对话框被关闭', 'info');
                }
            });

            // 15秒后自动关闭
            setTimeout(() => {
                if (dialog.parentNode) {
                    dialog.remove();
                    this.log('剪贴板确认对话框超时关闭', 'info');
                }
            }, 15000);

        } catch (error) {
            this.log(`显示剪贴板确认对话框失败: ${error.message}`, 'error');
        }
    }

    // 处理剪贴板导入
    async handleClipboardImport(files) {
        try {
            // 不显示处理提示，直接开始导入

            // 处理临时文件重命名并标记为已确认
            const processedFiles = files.map(file => {
                // 标记文件为已确认导入
                const confirmedFile = {
                    ...file,
                    confirmed: true
                };

                if (file.isTemporary && !file.customName && !file.wasRenamed) {
                    // 只有在用户没有自定义文件名且未重命名时才自动重命名
                    const ext = this.getFileExtension(file.name);
                    const newName = this.generateTimestampFilename(ext);

                    this.log(`临时文件重命名: ${file.name} -> ${newName}`, 'info');

                    return {
                        ...confirmedFile,
                        name: newName,
                        originalName: file.originalName || file.name,
                        isTemporary: true
                    };
                } else if (file.isTemporary && (file.customName || file.wasRenamed)) {
                    this.log(`保留文件名: ${file.name} (用户自定义: ${file.customName}, 已重命名: ${file.wasRenamed})`, 'info');
                }
                return confirmedFile;
            });

            // 构造消息对象，模拟文件导入消息格式
            const message = {
                type: 'import',
                files: processedFiles,
                source: 'clipboard_import',
                timestamp: Date.now(),
                isClipboardImport: true,
                // 优化：跳过一些不必要的检查
                skipValidation: true,
                fastMode: true
            };

            // 调用现有的文件处理流程
            const result = await this.handleImportFiles(message);



            // 显示结果 - 改进判断逻辑
            if (result && (result.success === true || result.importedCount > 0)) {
                this.showDropMessage(`✅ 剪贴板导入成功 (${result.importedCount || 1} 个文件)`, 'success');
            } else {
                this.showDropMessage(`❌ 剪贴板导入失败: ${result?.error || '未知错误'}`, 'error');
            }

        } catch (error) {
            this.log(`❌ 剪贴板导入失败: ${error.message}`, 'error');
            this.showDropMessage(`❌ 剪贴板导入失败: ${error.message}`, 'error');
        }
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // 获取文件扩展名
    getFileExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        return lastDot !== -1 ? filename.substring(lastDot) : '';
    }

    // 获取不含扩展名的文件名
    getFileNameWithoutExtension(filename) {
        const lastDot = filename.lastIndexOf('.');
        return lastDot !== -1 ? filename.substring(0, lastDot) : filename;
    }

    // 验证是否为有效的图片文件名
    isValidImageFileName(fileName) {
        if (!fileName || typeof fileName !== 'string') return false;

        // 检查是否有有效的图片扩展名
        const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg)$/i;
        if (!imageExtensions.test(fileName)) return false;

        // 检查文件名是否合理（不是临时文件名）
        const tempPatterns = [
            /^clipboard_image\./i,
            /^image\./i,
            /^screenshot\./i,
            /^capture\./i,
            /^untitled\./i,
            /^temp\./i,
            /^tmp\./i
        ];

        // 如果匹配任何临时文件模式，则认为不是有效的原始文件名
        for (const pattern of tempPatterns) {
            if (pattern.test(fileName)) {
                return false;
            }
        }

        // 检查文件名长度和字符
        if (fileName.length < 5 || fileName.length > 255) return false;

        // 检查是否包含非法字符
        const illegalChars = /[<>:"|?*\x00-\x1f]/;
        if (illegalChars.test(fileName)) return false;

        return true;
    }

    // 设置文件名编辑功能
    setupFileNameEditing(dialog, files) {
        const editableNames = dialog.querySelectorAll('.file-name.editable');

        editableNames.forEach((nameElement, index) => {
            // 双击编辑
            nameElement.addEventListener('dblclick', () => {
                this.startFileNameEdit(nameElement, files, index);
            });

            // 添加视觉提示
            nameElement.style.cursor = 'pointer';
            nameElement.title = '双击编辑文件名';
        });
    }

    // 开始编辑文件名
    startFileNameEdit(nameElement, files, fileIndex) {
        const originalText = nameElement.textContent;
        const file = files[fileIndex];

        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'file-name-input';
        input.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #3498db;
            color: #e0e0e0;
            padding: 2px 4px;
            font-size: 12px;
            font-family: inherit;
            border-radius: 2px;
            width: 100%;
            box-sizing: border-box;
        `;

        // 替换文本为输入框
        nameElement.style.display = 'none';
        nameElement.parentNode.insertBefore(input, nameElement);

        // 选中文本
        input.focus();
        input.select();

        // 完成编辑的函数
        const finishEdit = (save = true) => {
            if (save && input.value.trim() && input.value !== originalText) {
                const newName = input.value.trim();
                const ext = this.getFileExtension(file.name);
                const fullNewName = newName + ext;

                // 更新文件对象
                file.name = fullNewName;
                file.customName = true; // 标记为用户自定义名称

                // 更新显示
                nameElement.textContent = newName;

                this.log(`文件名已修改: ${originalText}${ext} -> ${fullNewName}`, 'info');
            }

            // 恢复显示
            input.remove();
            nameElement.style.display = '';
        };

        // 绑定事件
        input.addEventListener('blur', () => finishEdit(true));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEdit(true);
            } else if (e.key === 'Escape') {
                finishEdit(false);
            }
        });
    }

    // 生成文件签名（用于防重复导入）
    generateFileSignature(files) {
        if (!files || files.length === 0) return '';
        
        // 基于文件路径和大小生成签名
        const signature = files
            .map(file => `${file.path || file.name}:${file.size || 0}`)
            .sort() // 排序确保顺序一致
            .join('|');
        
        return this.simpleHash(signature);
    }

    // 简单哈希函数
    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        return Math.abs(hash).toString(36);
    }

}

// 初始化扩展
let aeExtension = null;

document.addEventListener('DOMContentLoaded', () => {
    aeExtension = new AEExtension();
    // 将应用实例暴露到全局作用域，供模态框函数使用
    window.eagleToAeApp = aeExtension;
});
