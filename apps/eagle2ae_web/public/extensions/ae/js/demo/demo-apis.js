// Eagle2Ae 演示模式 API 模拟器
// 模拟所有与AE和Eagle交互的API调用

class DemoAPIs {
    constructor(config) {
        this.config = config;
        this.demoData = config.demoData;
        this.operations = config.demoData.operations;
        
        // 模拟状态
        this.state = {
            isConnected: false,
            currentProject: null,
            importProgress: 0,
            lastPingTime: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('🎭 演示API模拟器已初始化');

        // 模拟连接状态 - 默认为未连接，让用户可以体验连接过程
        this.state.isConnected = false;
        this.state.lastPingTime = this.demoData.connection.pingTime;
    }
    
    // 模拟连接测试
    async testConnection() {
        console.log('🔗 模拟连接测试...');

        // 模拟连接延迟
        await this.delay(this.operations.connectionDelay);

        // 模拟成功率
        if (Math.random() > this.operations.successRate && this.operations.simulateErrors) {
            throw new Error('演示连接失败（模拟错误）');
        }

        this.state.isConnected = true;
        this.state.lastPingTime = this.generateRandomPing();

        return {
            success: true,
            status: 'connected',
            pingTime: this.state.lastPingTime,
            message: '', // 不返回消息，避免显示通知
            service: 'Eagle2Ae-Demo',
            version: this.demoData.eagle.version
        };
    }

    // 模拟断开连接
    async disconnect() {
        console.log('🔗 模拟断开连接...');

        // 模拟断开延迟
        await this.delay(300);

        this.state.isConnected = false;
        this.state.lastPingTime = 0;

        return {
            success: true,
            status: 'disconnected',
            message: '已断开连接 (演示)'
        };
    }

    // 获取当前连接状态
    getConnectionState() {
        return {
            isConnected: this.state.isConnected,
            status: this.state.isConnected ? 'connected' : 'disconnected',
            pingTime: this.state.lastPingTime
        };
    }
    
    // 模拟获取AE项目信息
    async getProjectInfo() {
        console.log('📁 模拟获取AE项目信息...');
        
        await this.delay(200);
        
        return {
            success: true,
            project: {
                name: this.demoData.ae.projectName,
                path: this.demoData.ae.projectPath,
                activeComp: this.demoData.ae.activeComp,
                duration: this.demoData.ae.compDuration,
                frameRate: this.demoData.ae.frameRate,
                resolution: this.demoData.ae.resolution
            },
            ae: {
                version: this.demoData.ae.version
            }
        };
    }
    
    // 模拟获取Eagle文件列表
    async getEagleFiles() {
        console.log('🦅 模拟获取Eagle文件列表...');
        
        await this.delay(300);
        
        return {
            success: true,
            files: this.demoData.files,
            library: {
                path: this.demoData.eagle.libraryPath,
                totalItems: this.demoData.eagle.totalItems,
                selectedFolder: this.demoData.eagle.selectedFolder
            }
        };
    }
    
    // 模拟文件导入
    async importFiles(files) {
        console.log('📥 模拟文件导入...', files);
        
        // 重置进度
        this.state.importProgress = 0;
        
        // 模拟导入过程
        for (let i = 0; i <= 100; i += 10) {
            this.state.importProgress = i;
            
            // 触发进度更新事件
            this.dispatchProgressEvent(i);
            
            await this.delay(this.operations.importDelay / 10);
        }
        
        // 模拟成功率
        if (Math.random() > this.operations.successRate && this.operations.simulateErrors) {
            throw new Error('演示导入失败（模拟错误）');
        }
        
        return {
            success: true,
            importedFiles: files.map(file => ({
                ...file,
                imported: true,
                importTime: new Date().toISOString(),
                layerName: `${file.name}_layer`
            })),
            message: this.demoData.ui.messages.imported,
            totalFiles: files.length,
            successCount: files.length,
            failCount: 0
        };
    }
    
    // 模拟获取连接状态
    async getConnectionStatus() {
        return {
            connected: this.state.isConnected,
            pingTime: this.state.lastPingTime,
            lastConnected: this.demoData.connection.lastConnected,
            autoReconnect: this.demoData.connection.autoReconnect
        };
    }
    
    // 模拟Eagle消息轮询
    async pollMessages() {
        // 模拟空消息响应
        return {
            messages: [],
            timestamp: Date.now(),
            clientId: 'demo_client',
            websocketCompatible: true
        };
    }
    
    // 模拟发送消息到Eagle
    async sendMessage(type, data) {
        console.log(`📤 模拟发送消息: ${type}`, data);
        
        await this.delay(100);
        
        return {
            success: true,
            messageId: this.generateMessageId(),
            timestamp: Date.now(),
            response: `演示响应: ${type}`
        };
    }
    
    // 模拟图层检测
    async detectSelectedLayers() {
        console.log('🔍 模拟图层检测...');
        
        // 模拟检测延迟
        await this.delay(800);
        
        // 获取虚拟图层数据
        const layerData = this.demoData.layerDetection;
        if (!layerData || !layerData.selectedLayers) {
            console.error('❌ 虚拟图层数据未找到');
            return {
                success: false,
                error: '虚拟图层数据未找到',
                compName: '演示合成',
                selectedLayers: [],
                totalSelected: 0,
                exportableCount: 0,
                nonExportableCount: 0,
                logs: ['❌ 虚拟图层数据未找到']
            };
        }
        
        const selectedLayers = layerData.selectedLayers;
        
        // 计算统计信息
        const totalSelected = selectedLayers.length;
        const exportableCount = selectedLayers.filter(layer => layer.exportable).length;
        const nonExportableCount = totalSelected - exportableCount;
        
        // 生成日志信息
        const logs = [
            `📋 合成名称: ${layerData.compName}`,
            `🔍 检测到 ${totalSelected} 个选中图层:`
        ];
        
        // 为每个图层生成日志消息
        selectedLayers.forEach((layer, index) => {
            let logMessage = `${index + 1}. [${this.getLayerTypeIcon(layer.type)}] ${layer.name}`;
            
            if (layer.exportable) {
                if (layer.sourceInfo && layer.sourceInfo.materialType) {
                    const materialIcon = this.getMaterialTypeIcon(layer.sourceInfo.materialType);
                    logMessage += ` ${materialIcon}${this.getMaterialTypeName(layer.sourceInfo.materialType)}素材`;
                }
                logMessage += ' ✅可导出';
            } else {
                logMessage += ` ❌不可导出 (${layer.reason})`;
            }
            
            logs.push(logMessage);
        });
        
        // 添加统计信息到日志
        logs.push(`📊 检测结果: ${exportableCount} 个可导出，${nonExportableCount} 个不可导出`);
        
        // 添加素材统计
        if (layerData.materialStats.totalMaterials > 0) {
            logs.push(`📦 素材统计: 共 ${layerData.materialStats.totalMaterials} 个素材文件`);
            
            const statsDetails = [];
            if (layerData.materialStats.design > 0) statsDetails.push(`设计:${layerData.materialStats.design}`);
            if (layerData.materialStats.image > 0) statsDetails.push(`图片:${layerData.materialStats.image}`);
            if (layerData.materialStats.video > 0) statsDetails.push(`视频:${layerData.materialStats.video}`);
            if (layerData.materialStats.audio > 0) statsDetails.push(`音频:${layerData.materialStats.audio}`);
            if (layerData.materialStats.animation > 0) statsDetails.push(`动图:${layerData.materialStats.animation}`);
            if (layerData.materialStats.vector > 0) statsDetails.push(`矢量:${layerData.materialStats.vector}`);
            if (layerData.materialStats.raw > 0) statsDetails.push(`原始:${layerData.materialStats.raw}`);
            if (layerData.materialStats.document > 0) statsDetails.push(`文档:${layerData.materialStats.document}`);
            if (layerData.materialStats.sequence > 0) statsDetails.push(`序列:${layerData.materialStats.sequence}`);
            
            if (statsDetails.length > 0) {
                logs.push(`📋 类型分布: ${statsDetails.join(', ')}`);
            }
        }
        
        // 返回检测结果
        return {
            success: true,
            compName: layerData.compName,
            selectedLayers: selectedLayers,
            totalSelected: totalSelected,
            exportableCount: exportableCount,
            nonExportableCount: nonExportableCount,
            materialStats: layerData.materialStats,
            logs: logs
        };
    }
    
    // 获取图层类型图标
    getLayerTypeIcon(layerType) {
        const icons = {
            'AVLayer': '📦',
            'SolidLayer': '🟦',
            'TextLayer': '📝',
            'ShapeLayer': '🔷',
            'PrecompLayer': '📁',
            'CameraLayer': '📷',
            'LightLayer': '💡',
            'AdjustmentLayer': '⚙️',
            'SequenceLayer': '🎯'
        };
        return icons[layerType] || '❓';
    }
    
    // 获取素材类型图标
    getMaterialTypeIcon(materialType) {
        const icons = {
            'design': '🎨',
            'image': '🖼️',
            'video': '🎬',
            'audio': '🎵',
            'animation': '🎞️',
            'vector': '📐',
            'raw': '🔬',
            'document': '📄',
            'sequence': '🎯'
        };
        return icons[materialType] || '❓';
    }
    
    // 获取素材类型名称
    getMaterialTypeName(materialType) {
        const names = {
            'design': '设计',
            'image': '图片',
            'video': '视频',
            'audio': '音频',
            'animation': '动图',
            'vector': '矢量',
            'raw': '原始',
            'document': '文档',
            'sequence': '序列'
        };
        return names[materialType] || '未知';
    }
    
    // 模拟获取AE版本信息
    getAEVersion() {
        return this.demoData.ae.version;
    }
    
    // 模拟获取主机环境信息
    getHostEnvironment() {
        return {
            appName: 'After Effects',
            appVersion: this.demoData.ae.version,
            appId: 'AEFT',
            isAppOnline: true,
            appSkinInfo: {
                panelBackgroundColor: {
                    color: {
                        red: 50,
                        green: 50,
                        blue: 50,
                        alpha: 255
                    }
                }
            }
        };
    }
    
    // 工具方法
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    generateRandomPing() {
        return Math.floor(Math.random() * 20) + 8; // 8-28ms
    }
    
    generateMessageId() {
        return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    dispatchProgressEvent(progress) {
        const event = new CustomEvent('demoImportProgress', {
            detail: { progress }
        });
        window.dispatchEvent(event);
    }
    
    // 模拟CSInterface方法
    createMockCSInterface() {
        return {
            getHostEnvironment: () => this.getHostEnvironment(),
            evalScript: (script, callback) => {
                // 模拟脚本执行
                setTimeout(() => {
                    if (callback) {
                        const msg = (window.i18n?.currentLang === 'en-US') ? 'Demo script execution result' : '演示脚本执行结果';
        callback(msg);
                    }
                }, 100);
            },
            addEventListener: (type, listener) => {
                // 模拟事件监听
                console.log(`🎭 模拟添加事件监听器: ${type}`);
            },
            removeEventListener: (type, listener) => {
                // 模拟移除事件监听
                console.log(`🎭 模拟移除事件监听器: ${type}`);
            }
        };
    }
    
    // 模拟WebSocket客户端
    createMockWebSocketClient() {
        return {
            connect: async () => {
                console.log('🔌 模拟WebSocket连接');
                await this.delay(500);
                return true;
            },
            disconnect: () => {
                console.log('🔌 模拟WebSocket断开');
            },
            sendMessage: async (type, data) => {
                return await this.sendMessage(type, data);
            },
            connectionState: 'connected'
        };
    }
    
    // 模拟文件系统操作
    createMockFileSystem() {
        return {
            exists: (path) => {
                // 模拟文件存在检查
                return this.demoData.files.some(file => file.path === path);
            },
            copy: async (source, destination) => {
                console.log(`📁 模拟文件复制: ${source} -> ${destination}`);
                await this.delay(1000);
                return { success: true };
            },
            openFolder: (path) => {
                console.log(`📂 模拟打开文件夹: ${path}`);
                return true;
            }
        };
    }

    // 模拟Eagle API端点响应
    async handleEagleAPICall(url, options = {}) {
        // console.log(`🎭 拦截Eagle API调用: ${url}`);

        const method = options.method || 'GET';

        // 解析URL路径
        const urlObj = new URL(url, 'http://localhost:8080');
        const path = urlObj.pathname;
        const searchParams = urlObj.searchParams;

        // 模拟延迟
        await this.delay(100);

        // 根据API端点返回相应的模拟响应
        switch (path) {
            case '/ping':
                return this.createMockResponse(await this.testConnection());

            case '/messages':
                return this.createMockResponse(await this.pollMessages());

            case '/ae-message':
                if (method === 'POST') {
                    const data = options.body ? JSON.parse(options.body) : {};
                    return this.createMockResponse(await this.sendMessage(data.type, data));
                }
                break;

            case '/ae-status':
                return this.createMockResponse({
                    success: true,
                    eagleStatus: {
                        version: this.demoData.eagle.version,
                        path: this.demoData.eagle.path,
                        libraryPath: this.demoData.eagle.libraryPath,
                        selectedFolder: this.demoData.eagle.selectedFolder,
                        totalItems: this.demoData.eagle.totalItems
                    }
                });

            case '/settings-sync':
                if (method === 'POST') {
                    return this.createMockResponse({
                        success: true,
                        message: '设置已同步到演示环境'
                    });
                }
                break;

            case '/copy-to-clipboard':
                if (method === 'POST') {
                    return this.createMockResponse({
                        success: true,
                        message: '已复制到剪贴板（演示模式）'
                    });
                }
                break;

            case '/clear-logs':
                if (method === 'POST') {
                    return this.createMockResponse({
                        success: true,
                        message: '日志已清除（演示模式）'
                    });
                }
                break;

            case '/ae-port-info':
                if (method === 'POST') {
                    return this.createMockResponse({
                        success: true,
                        message: '端口信息已接收（演示模式）'
                    });
                }
                break;

            case '/detect-layers':
                if (method === 'POST') {
                    const detectionResult = await this.detectSelectedLayers();
                    return this.createMockResponse(detectionResult);
                }
                break;

            default:
                // 默认成功响应
                return this.createMockResponse({
                    success: true,
                    message: `演示模式响应: ${path}`
                });
        }

        // 如果没有匹配的端点，返回默认响应
        return this.createMockResponse({
            success: true,
            message: '演示模式默认响应'
        });
    }

    // 创建模拟的Response对象
    createMockResponse(data, status = 200) {
        const responseBody = JSON.stringify(data);

        return new Response(responseBody, {
            status: status,
            statusText: status === 200 ? 'OK' : 'Error',
            headers: {
                'Content-Type': 'application/json',
                'X-Demo-Mode': 'true'
            }
        });
    }

    // 模拟WebSocket类
    createMockWebSocket(url) {
        return class MockWebSocket {
            constructor(wsUrl) {
                this.url = wsUrl;
                this.readyState = 0; // CONNECTING
                this.onopen = null;
                this.onclose = null;
                this.onmessage = null;
                this.onerror = null;

                console.log(`🎭 创建模拟WebSocket连接: ${wsUrl}`);

                // 模拟连接过程
                setTimeout(() => {
                    this.readyState = 1; // OPEN
                    if (this.onopen) {
                        this.onopen({ type: 'open' });
                    }
                    console.log('🎭 模拟WebSocket连接已建立');
                }, 500);
            }

            send(data) {
                console.log('🎭 模拟WebSocket发送消息:', data);

                // 模拟响应
                setTimeout(() => {
                    if (this.onmessage) {
                        const response = {
                            type: 'message',
                            data: JSON.stringify({
                                success: true,
                                message: '演示模式WebSocket响应',
                                timestamp: Date.now()
                            })
                        };
                        this.onmessage(response);
                    }
                }, 100);
            }

            close() {
                console.log('🎭 模拟WebSocket连接关闭');
                this.readyState = 3; // CLOSED
                if (this.onclose) {
                    this.onclose({ type: 'close', code: 1000, reason: '演示模式关闭' });
                }
            }
        };
    }
}

// 导出类
window.DemoAPIs = DemoAPIs;
