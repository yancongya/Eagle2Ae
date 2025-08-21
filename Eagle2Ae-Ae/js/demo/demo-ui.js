// Eagle2Ae 演示模式 UI 状态管理
// 管理演示模式下的UI状态更新和用户交互

class DemoUI {
    constructor(config, demoAPIs) {
        this.config = config;
        this.demoAPIs = demoAPIs;
        this.demoData = config.demoData;
        
        // UI元素缓存
        this.elements = {};
        
        // 状态
        this.state = {
            isInitialized: false,
            currentMode: 'demo'
        };
        
        this.init();
    }
    
    init() {
        console.log('🎨 演示UI管理器初始化...');

        // 缓存DOM元素，但不设置事件监听器
        this.cacheElements();

        // 不在初始化时就设置UI，只有在演示模式激活时才设置
        console.log('🎨 演示UI管理器已准备就绪，等待激活');
    }

    // 缓存DOM元素引用
    cacheElements() {
        console.log('📋 开始缓存DOM元素...');

        this.elements = {
            testConnectionBtn: document.getElementById('test-connection-btn'),
            statusIndicator: document.getElementById('status-indicator'),
            statusMain: document.getElementById('status-main'),
            pingTime: document.getElementById('ping-time'),
            aeVersion: document.getElementById('ae-version'),
            projectPath: document.getElementById('project-path'),
            projectName: document.getElementById('project-name'),
            compName: document.getElementById('comp-name'),
            eagleVersion: document.getElementById('eagle-version'),
            eaglePath: document.getElementById('eagle-path'),
            eagleLibrary: document.getElementById('eagle-library'),
            eagleFolder: document.getElementById('eagle-folder'),
            // 添加缺少的元素引用
            libraryPath: document.getElementById('eagle-library'),
            selectedFolder: document.getElementById('eagle-folder')
        };

        // 检查关键元素是否存在
        console.log('🔍 连接按钮元素:', this.elements.testConnectionBtn ? '✅ 找到' : '❌ 未找到');
        console.log('🔍 状态指示器:', this.elements.statusIndicator ? '✅ 找到' : '❌ 未找到');
        console.log('🔍 状态文本:', this.elements.statusMain ? '✅ 找到' : '❌ 未找到');

        console.log('📋 DOM元素缓存完成');
    }

    setupUI() {
        console.log('🎨 设置演示模式UI...');

        // 重新缓存元素（确保获取最新的DOM状态）
        this.cacheElements();

        // 设置演示模式的UI状态
        this.setupEventListeners();
        this.showDemoModeIndicator();

        // 注意：不在这里调用 updateProjectInfo 和 updateConnectionStatus
        // 因为这些会在演示模式初始化时单独调用

        this.state.isInitialized = true;
        console.log('✅ 演示UI已激活');
    }
    
    updateProjectInfo() {
        // 根据连接状态更新项目信息
        const connectionState = this.demoAPIs.getConnectionState();

        if (connectionState.isConnected) {
            // 连接状态：显示演示数据
            this.updateAEInfoConnected();
            this.updateEagleInfoConnected();
        } else {
            // 未连接状态：显示获取中状态
            this.updateAEInfoDisconnected();
            this.updateEagleInfoDisconnected();
        }

        console.log('📁 项目信息已更新为演示数据');
    }

    updateAEInfoConnected() {
        // 使用全局演示数据而不是配置中的数据
        const globalAEData = window.__DEMO_DATA__?.ae?.connected;

        // 更新AE版本信息
        if (this.elements.aeVersion) {
            this.elements.aeVersion.textContent = globalAEData?.version || this.demoData.ae.version;
        }

        // 更新项目路径
        if (this.elements.projectPath) {
            const projectPath = globalAEData?.projectPath || this.demoData.ae.projectPath;
            this.elements.projectPath.textContent = projectPath;

            // 正确设置title
            if (projectPath && projectPath !== '未知' && projectPath !== 'undefined') {
                this.elements.projectPath.removeAttribute('title');
                this.elements.projectPath.setAttribute('title', projectPath);
                this.elements.projectPath.title = projectPath;
            }

            // 添加点击样式和事件
            this.elements.projectPath.classList.add('clickable');
            this.elements.projectPath.onclick = () => {
                console.log('🎭 演示模式：模拟打开项目文件夹');
                alert('演示模式：这里会打开项目文件夹\n' + projectPath);
            };
        }

        // 更新项目名称
        if (this.elements.projectName) {
            this.elements.projectName.textContent = globalAEData?.projectName || this.demoData.ae.projectName;
        }

        // 更新合成名称
        if (this.elements.compName) {
            this.elements.compName.textContent = globalAEData?.activeComp || this.demoData.ae.activeComp;
        }

        // console.log('🎬 AE信息已更新为连接状态');
    }

    updateAEInfoDisconnected() {
        // 使用演示数据覆盖中的未连接状态数据
        const disconnectedData = window.__DEMO_DATA__ ? window.__DEMO_DATA__.ae.disconnected : {
            version: "获取中...",
            projectPath: "未知",
            projectName: "未打开项目",
            activeComp: "无"
        };

        // 更新AE版本信息
        if (this.elements.aeVersion) {
            this.elements.aeVersion.textContent = disconnectedData.version;
        }

        // 更新项目路径
        if (this.elements.projectPath) {
            this.elements.projectPath.textContent = disconnectedData.projectPath;
            // 只有在有有效路径时才设置title
            if (disconnectedData.projectPath && disconnectedData.projectPath !== '未知' && disconnectedData.projectPath !== 'undefined') {
                this.elements.projectPath.removeAttribute('title');
                this.elements.projectPath.setAttribute('title', disconnectedData.projectPath);
                this.elements.projectPath.title = disconnectedData.projectPath;
            }
            this.elements.projectPath.classList.remove('clickable');
            this.elements.projectPath.onclick = null;
        }

        // 更新项目名称
        if (this.elements.projectName) {
            this.elements.projectName.textContent = disconnectedData.projectName;
        }

        // 更新合成名称
        if (this.elements.compName) {
            this.elements.compName.textContent = disconnectedData.activeComp;
        }

        // console.log('🎬 AE信息已更新为未连接状态');
    }

    updateEagleInfoConnected() {
        // 使用全局演示数据而不是配置中的数据
        const globalEagleData = window.__DEMO_DATA__?.eagle?.connected;

        // 更新Eagle版本信息
        if (this.elements.eagleVersion) {
            this.elements.eagleVersion.textContent = globalEagleData?.version || this.demoData.eagle.version;
        }

        // 更新Eagle路径 - 显示安装路径
        if (this.elements.eaglePath) {
            const execPath = globalEagleData?.execPath || '演示路径';
            this.elements.eaglePath.textContent = execPath;
            // 正确设置title
            if (execPath && execPath !== '演示路径' && execPath !== 'undefined') {
                this.elements.eaglePath.removeAttribute('title');
                this.elements.eaglePath.setAttribute('title', execPath);
                this.elements.eaglePath.title = execPath;
            }
            // Eagle路径不设置点击事件
            this.elements.eaglePath.classList.remove('clickable');
            this.elements.eaglePath.onclick = null;
        }

        // 更新资源库 - 可以点击打开
        if (this.elements.eagleLibrary) {
            const libraryName = globalEagleData?.libraryName || '演示资源库';
            const libraryPath = globalEagleData?.libraryPath || '演示路径';

            this.elements.eagleLibrary.textContent = libraryName;
            // 正确设置title
            if (libraryPath && libraryPath !== '演示路径' && libraryPath !== 'undefined') {
                this.elements.eagleLibrary.removeAttribute('title');
                this.elements.eagleLibrary.setAttribute('title', libraryPath);
                this.elements.eagleLibrary.title = libraryPath;
            }

            // 添加点击样式和事件
            this.elements.eagleLibrary.classList.add('clickable');
            this.elements.eagleLibrary.onclick = () => {
                console.log('🎭 演示模式：模拟打开Eagle资源库文件夹');
                alert('演示模式：这里会打开Eagle资源库文件夹\n' + libraryPath);
            };
        } else {
            console.warn('❌ eagleLibrary 元素不存在');
        }

        // 更新当前组
        if (this.elements.eagleFolder) {
            this.elements.eagleFolder.textContent = this.demoData.eagle.selectedFolder;
        }

        // console.log('🦅 Eagle信息已更新为连接状态');
    }

    updateEagleInfoDisconnected() {
        // 使用演示数据覆盖中的未连接状态数据
        // 使用全局演示数据
        const globalEagleData = window.__DEMO_DATA__?.eagle?.disconnected;
        const disconnectedData = window.__DEMO_DATA__ ? window.__DEMO_DATA__.eagle.disconnected : {
            version: globalEagleData?.version || "获取中...",
            execPath: globalEagleData?.execPath || "获取中...",
            libraryPath: globalEagleData?.libraryPath || "获取中...",
            selectedFolder: globalEagleData?.selectedFolder || "获取中..."
        };

        // 更新Eagle版本信息
        if (this.elements.eagleVersion) {
            this.elements.eagleVersion.textContent = disconnectedData.version;
        }

        // 更新Eagle路径
        if (this.elements.eaglePath) {
            this.elements.eaglePath.textContent = disconnectedData.execPath;
            // 只有在有有效路径时才设置title
            if (disconnectedData.execPath && disconnectedData.execPath !== '获取中...' && disconnectedData.execPath !== 'undefined') {
                this.elements.eaglePath.removeAttribute('title');
                this.elements.eaglePath.setAttribute('title', disconnectedData.execPath);
                this.elements.eaglePath.title = disconnectedData.execPath;
            }
            this.elements.eaglePath.classList.remove('clickable');
            this.elements.eaglePath.onclick = null;
        }

        // 更新资源库
        if (this.elements.eagleLibrary) {
            this.elements.eagleLibrary.textContent = '获取中...';
            // 只有在有有效路径时才设置title
            if (disconnectedData.libraryPath && disconnectedData.libraryPath !== '获取中...' && disconnectedData.libraryPath !== 'undefined') {
                this.elements.eagleLibrary.removeAttribute('title');
                this.elements.eagleLibrary.setAttribute('title', disconnectedData.libraryPath);
                this.elements.eagleLibrary.title = disconnectedData.libraryPath;
            }
            this.elements.eagleLibrary.classList.remove('clickable');
            this.elements.eagleLibrary.onclick = null;
        }

        // 更新当前组
        if (this.elements.eagleFolder) {
            this.elements.eagleFolder.textContent = disconnectedData.selectedFolder;
        }

        // console.log('🦅 Eagle信息已更新为未连接状态');
    }
    

    
    setupEventListeners() {
        // 只在演示模式激活时才设置事件监听器
        // 这个方法现在只在 setupUI() 中被调用，而 setupUI() 只在演示模式激活时调用

        // 测试连接按钮 - 使用更简单的方法
        if (this.elements.testConnectionBtn) {
            console.log('🔗 设置演示模式连接按钮事件监听器...');
            console.log('🔍 按钮元素:', this.elements.testConnectionBtn);
            console.log('🔍 按钮ID:', this.elements.testConnectionBtn.id);

            // 备份原始的事件监听器（如果存在）
            this.backupOriginalEventListeners();

            // 直接添加演示模式的事件监听器，不替换元素
            // 使用 capture 模式确保我们的监听器先执行
            const demoClickHandler = (e) => {
                console.log('🖱️ 演示模式连接按钮被点击');
                e.preventDefault();
                e.stopPropagation();
                this.handleTestConnection(e);
            };

            const demoContextHandler = (e) => {
                console.log('🖱️ 演示模式连接按钮右键点击');
                e.preventDefault();
                e.stopPropagation();
                this.handleTestConnection(e);
            };

            // 添加事件监听器，使用 capture 模式
            this.elements.testConnectionBtn.addEventListener('click', demoClickHandler, true);
            this.elements.testConnectionBtn.addEventListener('contextmenu', demoContextHandler, true);

            // 保存处理器引用以便后续清理
            this.demoEventHandlers = {
                click: demoClickHandler,
                contextmenu: demoContextHandler
            };

            console.log('✅ 演示模式连接按钮事件监听器已设置（capture模式）');
        } else {
            console.warn('⚠️ 连接按钮元素未找到，无法设置事件监听器');
        }

        // 监听演示导入进度
        window.addEventListener('demoImportProgress', (e) => {
            this.updateImportProgress(e.detail.progress);
        });

        console.log('👂 演示模式事件监听器已设置');
    }

    // 备份原始事件监听器
    backupOriginalEventListeners() {
        // 这里可以备份原始的事件监听器，以便在退出演示模式时恢复
        // 目前暂时不实现，因为主要通过页面刷新来退出演示模式
    }

    // 恢复原始事件监听器
    restoreOriginalEventListeners() {
        // 恢复原始的连接按钮事件监听器
        if (this.elements.testConnectionBtn && window.eagle2ae) {
            // 重新绑定原始的事件监听器
            this.elements.testConnectionBtn.replaceWith(this.elements.testConnectionBtn.cloneNode(true));
            this.elements.testConnectionBtn = document.getElementById('test-connection-btn');

            // 让主应用重新绑定事件
            if (window.eagle2ae.setupUI) {
                window.eagle2ae.setupUI();
            }
        }

        console.log('🔄 原始事件监听器已恢复');
    }
    
    async handleTestConnection(event) {
        console.log('🔗 handleTestConnection 被调用');
        event.preventDefault();

        // 获取当前连接状态
        const currentState = this.demoAPIs.getConnectionState();
        console.log('📊 当前连接状态:', currentState);

        if (currentState.isConnected) {
            // 当前已连接，执行断开操作
            console.log('🔗 演示断开连接开始...');

            // 显示断开中状态
            this.showDisconnectingState();

            try {
                const result = await this.demoAPIs.disconnect();
                console.log('🔗 断开连接结果:', result);

                if (result.success) {
                    this.showDisconnectedState();
                    // 断开连接后，更新项目信息为未连接状态
                    setTimeout(() => {
                        this.updateProjectInfo();
                    }, 200);
                    console.log('✅ 演示断开连接完成');
                }
            } catch (error) {
                console.error('❌ 断开连接失败:', error);
                this.showNotification(`断开连接失败: ${error.message}`, 'error');
            }
        } else {
            // 当前未连接，执行连接操作
            console.log('🔗 演示连接测试开始...');

            // 显示连接中状态
            this.showConnectingState();

            // 添加一些延迟来模拟真实的连接过程
            await new Promise(resolve => setTimeout(resolve, 800));

            try {
                // 调用演示API
                const result = await this.demoAPIs.testConnection();
                console.log('🔗 连接测试结果:', result);

                if (result.success) {
                    this.showConnectedState(result);
                    // 不显示连接成功通知，静默连接
                    // this.showNotification(result.message, 'success');

                    // 连接成功后，确保项目信息是演示数据
                    setTimeout(() => {
                        this.updateProjectInfo();
                    }, 200);
                    console.log('✅ 演示连接完成');
                } else {
                    throw new Error(result.message || '连接失败');
                }
            } catch (error) {
                console.error('❌ 连接失败:', error);
                this.showDisconnectedState();
                this.showNotification(`连接失败: ${error.message}`, 'error');
            }
        }
    }
    
    showConnectingState() {
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = 'status-indicator connecting';
        }
        
        if (this.elements.statusMain) {
            this.elements.statusMain.textContent = '连接中...';
        }
        
        if (this.elements.pingTime) {
            this.elements.pingTime.textContent = '--ms';
        }
    }
    
    showConnectedState(result) {
        // 暂停DOM保护机制，避免冲突
        if (window.__pauseDemoOverride__) {
            window.__pauseDemoOverride__(3000); // 暂停3秒
            console.log('🛡️ 已暂停DOM保护机制，避免UI更新冲突');
        }

        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = 'status-indicator connected';
        }

        if (this.elements.statusMain) {
            this.elements.statusMain.textContent = '已连接 (演示)';
        }

        if (this.elements.pingTime) {
            this.elements.pingTime.textContent = `${result.pingTime}ms`;
        }

        if (this.elements.testConnectionBtn) {
            this.elements.testConnectionBtn.classList.add('connected');
        }

        // 延迟更新AE和Eagle信息，确保状态指示器先更新
        setTimeout(() => {
            this.updateAEInfoConnected();
            this.updateEagleInfoConnected();
            console.log('✅ 连接状态UI已更新，包括AE和Eagle信息');
        }, 100);
    }
    
    showDisconnectingState() {
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = 'status-indicator connecting';
        }

        if (this.elements.statusMain) {
            this.elements.statusMain.textContent = '断开连接中...';
        }

        if (this.elements.pingTime) {
            this.elements.pingTime.textContent = '--ms';
        }
    }

    showDisconnectedState() {
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = 'status-indicator disconnected';
        }

        if (this.elements.statusMain) {
            this.elements.statusMain.textContent = '未连接 (演示)';
        }

        if (this.elements.pingTime) {
            this.elements.pingTime.textContent = '--ms';
        }

        if (this.elements.testConnectionBtn) {
            this.elements.testConnectionBtn.classList.remove('connected');
        }
    }
    
    updateImportProgress(progress) {
        // 可以在这里更新导入进度条
        console.log(`📥 导入进度: ${progress}%`);
        
        // 如果有进度条元素，更新它
        const progressBar = document.querySelector('.import-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }
    
    showDemoModeIndicator() {
        // 创建演示模式指示器
        if (document.getElementById('demo-mode-indicator')) return;

        const indicator = document.createElement('button');
        indicator.id = 'demo-mode-indicator';
        indicator.className = 'icon-btn demo-mode-indicator';
        indicator.title = '当前为演示模式';
        indicator.innerHTML = `<span class="icon">🎭</span>`;

        // 找到header-actions容器，添加到日志按钮旁边
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            // 插入到第一个按钮之前
            headerActions.insertBefore(indicator, headerActions.firstChild);
        } else {
            // 如果找不到header-actions，添加到body
            document.body.appendChild(indicator);
        }

        // 添加样式
        this.injectDemoIndicatorStyles();

        console.log('🎭 演示模式指示器已显示');
    }
    
    hideDemoModeIndicator() {
        const indicator = document.getElementById('demo-mode-indicator');
        if (indicator) {
            indicator.remove();
            console.log('🎭 演示模式指示器已隐藏');
        }
    }
    
    showNotification(message, type = 'info') {
        // 在演示模式下不显示通知
        if (!this.demoData.ui.notifications.showToasts) return;

        // 额外检查：如果是连接相关的消息，也不显示
        if (message && (message.includes('连接') || message.includes('演示环境'))) {
            return;
        }

        const notification = document.createElement('div');
        notification.className = `demo-notification demo-notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => notification.classList.add('show'), 10);

        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, this.demoData.ui.notifications.duration);
    }
    
    injectDemoIndicatorStyles() {
        if (document.getElementById('demo-ui-styles')) return;

        const style = document.createElement('style');
        style.id = 'demo-ui-styles';
        style.textContent = `
            .demo-mode-indicator {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: 1px solid rgba(255,255,255,0.2);
                animation: demoIndicatorPulse 3s ease-in-out infinite;
            }

            .demo-mode-indicator .icon {
                animation: demoIconRotate 4s linear infinite;
            }

            .demo-mode-indicator:hover {
                background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
                transform: translateY(-1px);
            }

            @keyframes demoIndicatorPulse {
                0%, 100% { opacity: 0.9; }
                50% { opacity: 1; }
            }

            @keyframes demoIconRotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .demo-notification {
                position: fixed;
                top: 50px;
                right: 10px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-size: 14px;
                z-index: 9998;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
            }

            .demo-notification.show {
                opacity: 1;
                transform: translateX(0);
            }

            .demo-notification-success {
                background: linear-gradient(135deg, #4CAF50, #45a049);
            }

            .demo-notification-error {
                background: linear-gradient(135deg, #f44336, #d32f2f);
            }

            .demo-notification-info {
                background: linear-gradient(135deg, #2196F3, #1976D2);
            }
        `;

        document.head.appendChild(style);
    }
    
    // 清理演示UI
    cleanup() {
        this.hideDemoModeIndicator();
        
        // 移除样式
        const styles = document.getElementById('demo-ui-styles');
        if (styles) {
            styles.remove();
        }
        
        console.log('🧹 演示UI已清理');
    }
}

// 导出类
window.DemoUI = DemoUI;
