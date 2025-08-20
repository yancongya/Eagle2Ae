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
            eagleFolder: document.getElementById('eagle-folder')
        };

        console.log('📋 DOM元素已缓存');
    }

    setupUI() {
        console.log('🎨 设置演示模式UI...');

        // 重新缓存元素（确保获取最新的DOM状态）
        this.cacheElements();

        // 设置演示模式的UI状态
        this.updateProjectInfo();
        this.updateConnectionStatus();
        this.setupEventListeners();
        this.showDemoModeIndicator();

        this.state.isInitialized = true;
        console.log('✅ 演示UI已激活');
    }
    
    updateProjectInfo() {
        // 静态更新AE信息
        this.updateAEInfo();

        // 静态更新Eagle信息
        this.updateEagleInfo();

        console.log('📁 项目信息已更新为演示数据');
    }

    updateAEInfo() {
        // 更新AE版本信息
        if (this.elements.aeVersion) {
            this.elements.aeVersion.textContent = this.demoData.ae.version;
        }

        // 更新项目路径
        if (this.elements.projectPath) {
            this.elements.projectPath.textContent = this.demoData.ae.projectPath;
            this.elements.projectPath.title = this.demoData.ae.projectPath;
        }

        // 更新项目名称
        if (this.elements.projectName) {
            this.elements.projectName.textContent = this.demoData.ae.projectName;
        }

        // 更新合成名称
        if (this.elements.compName) {
            this.elements.compName.textContent = this.demoData.ae.activeComp;
        }

        console.log('🎬 AE信息已静态更新');
    }

    updateEagleInfo() {
        // 更新Eagle版本信息
        if (this.elements.eagleVersion) {
            this.elements.eagleVersion.textContent = this.demoData.eagle.version;
        }

        // 更新Eagle路径
        if (this.elements.eaglePath) {
            this.elements.eaglePath.textContent = this.demoData.eagle.path || '演示路径';
            this.elements.eaglePath.title = this.demoData.eagle.path || '演示路径';
        }

        // 更新资源库
        if (this.elements.eagleLibrary) {
            this.elements.eagleLibrary.textContent = this.demoData.eagle.libraryPath;
            this.elements.eagleLibrary.title = this.demoData.eagle.libraryPath;
        }

        // 更新当前组
        if (this.elements.eagleFolder) {
            this.elements.eagleFolder.textContent = this.demoData.eagle.selectedFolder;
        }

        console.log('🦅 Eagle信息已静态更新');
    }
    
    updateConnectionStatus() {
        const connectionData = this.demoData.connection;
        
        // 更新连接状态指示器
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = 'status-indicator connected';
        }
        
        // 更新状态文本
        if (this.elements.statusMain) {
            this.elements.statusMain.textContent = '已连接 (演示)';
        }
        
        // 更新ping时间
        if (this.elements.pingTime) {
            this.elements.pingTime.textContent = `${connectionData.pingTime}ms`;
        }
        
        // 更新连接按钮状态
        if (this.elements.testConnectionBtn) {
            this.elements.testConnectionBtn.classList.add('connected');
        }
        
        console.log('🔗 连接状态已更新为演示模式');
    }
    
    setupEventListeners() {
        // 只在演示模式激活时才设置事件监听器
        // 这个方法现在只在 setupUI() 中被调用，而 setupUI() 只在演示模式激活时调用

        // 测试连接按钮 - 完全接管点击事件
        if (this.elements.testConnectionBtn) {
            // 备份原始的事件监听器（如果存在）
            this.backupOriginalEventListeners();

            // 移除原有的事件监听器
            this.elements.testConnectionBtn.replaceWith(this.elements.testConnectionBtn.cloneNode(true));
            // 重新获取元素引用
            this.elements.testConnectionBtn = document.getElementById('test-connection-btn');

            // 添加演示模式的事件监听器
            this.elements.testConnectionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleTestConnection(e);
            });

            // 阻止右键菜单
            this.elements.testConnectionBtn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleTestConnection(e);
            });
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
        event.preventDefault();

        console.log('🔗 演示连接测试开始...');

        // 显示连接中状态
        this.showConnectingState();

        // 添加一些延迟来模拟真实的连接过程
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            // 调用演示API
            const result = await this.demoAPIs.testConnection();

            if (result.success) {
                this.showConnectedState(result);
                // 不显示连接成功通知，静默连接
                // this.showNotification(result.message, 'success');

                // 连接成功后，确保项目信息是演示数据
                setTimeout(() => {
                    this.updateProjectInfo();
                }, 200);
            } else {
                throw new Error(result.message || '连接失败');
            }
        } catch (error) {
            this.showDisconnectedState();
            this.showNotification(`连接失败: ${error.message}`, 'error');
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
    }
    
    showDisconnectedState() {
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = 'status-indicator disconnected';
        }
        
        if (this.elements.statusMain) {
            this.elements.statusMain.textContent = '未连接';
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
