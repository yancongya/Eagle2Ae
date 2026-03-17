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
        console.debug('✅ 演示UI已激活');
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
                console.debug('🎭 演示模式：模拟打开项目文件夹');
                alert('演示模式：这里会打开项目文件夹\n' + projectPath);
            };
        }

        // 更新项目名称并添加悬浮提示
        if (this.elements.projectName) {
            const projectName = globalAEData?.projectName || this.demoData.ae.projectName;
            this.elements.projectName.textContent = projectName;
            if (projectName && !['未打开项目', 'No project open'].includes(projectName)) {
                this.elements.projectName.title = projectName;
            } else {
                this.elements.projectName.removeAttribute('title');
            }
        }

        // 更新合成名称并添加悬浮提示
        if (this.elements.compName) {
            const compName = globalAEData?.activeComp || this.demoData.ae.activeComp;
            this.elements.compName.textContent = compName;
            if (compName && !['无', 'None'].includes(compName)) {
                this.elements.compName.title = compName;
            } else {
                this.elements.compName.removeAttribute('title');
            }
        }

        // console.log('🎬 AE信息已更新为连接状态');
    }

    updateAEInfoDisconnected() {
        // 使用演示数据覆盖中的未连接状态数据
        const disconnectedData = window.__DEMO_DATA__ ? window.__DEMO_DATA__.ae.disconnected : {
            version: (window.i18n?.getText('common.unknown') || 'Unknown'),
            projectPath: (window.i18n?.getText('common.unknown') || 'Unknown'),
            projectName: (window.i18n?.getText('common.noProjectOpen') || 'No project open'),
            activeComp: (window.i18n?.getText('common.none') || 'None')
        };

        // 更新AE版本信息
        if (this.elements.aeVersion) {
            this.elements.aeVersion.textContent = disconnectedData.version;
        }

        // 更新项目路径
        if (this.elements.projectPath) {
            this.elements.projectPath.textContent = disconnectedData.projectPath;
            // 只有在有有效路径时才设置title
            if (disconnectedData.projectPath && !['未知', 'Unknown', 'undefined'].includes(disconnectedData.projectPath)) {
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

        // 更新Eagle版本信息并添加悬浮提示
        if (this.elements.eagleVersion) {
            const eagleVersion = globalEagleData?.version || this.demoData.eagle.version;
            this.elements.eagleVersion.textContent = eagleVersion;
            if (eagleVersion && !['获取中...', 'Waiting for import request...', 'Waiting'].includes(eagleVersion)) {
                const prefix = (window.i18n?.getText('tooltips.eagleVersionPrefix') || 'Eagle Version:');
                this.elements.eagleVersion.title = `${prefix} ${eagleVersion}`;
            } else {
                this.elements.eagleVersion.removeAttribute('title');
            }
        }

        // 更新Eagle路径 - 显示安装路径
        if (this.elements.eaglePath) {
            const execPath = globalEagleData?.execPath || (window.i18n?.getText('common.demoPath') || 'Demo Path');
            this.elements.eaglePath.textContent = execPath;
            // 设置悬浮显示完整信息
            if (execPath && !['演示路径', 'Demo Path', 'undefined'].includes(execPath)) {
                const prefix = (window.i18n?.getText('tooltips.eagleExecPathPrefix') || 'Eagle Exec Path:');
                const tooltipText = `${prefix} ${execPath}`;
                this.elements.eaglePath.removeAttribute('title');
                this.elements.eaglePath.setAttribute('title', tooltipText);
                this.elements.eaglePath.title = tooltipText;
            } else {
                this.elements.eaglePath.removeAttribute('title');
            }
            // Eagle路径不设置点击事件
            this.elements.eaglePath.classList.remove('clickable');
            this.elements.eaglePath.onclick = null;
        }

        // 更新资源库 - 可以点击打开
        if (this.elements.eagleLibrary) {
            const libraryName = globalEagleData?.libraryName || (window.i18n?.getText('common.demoLibrary') || 'Demo Library');
            const libraryPath = globalEagleData?.libraryPath || (window.i18n?.getText('common.demoPath') || 'Demo Path');
            const librarySize = globalEagleData?.librarySize || 0;

            // 格式化显示：资源库名称 | 大小
            let displayText = libraryName;
            if (librarySize > 0) {
                const formattedSize = this.formatFileSize(librarySize);
                displayText = `${libraryName} | ${formattedSize}`;
            }

            this.elements.eagleLibrary.textContent = displayText;
            // 设置悬浮显示完整信息
            if (libraryPath && !['演示路径', 'Demo Path', 'undefined'].includes(libraryPath)) {
                const namePrefix = (window.i18n?.getText('tooltips.libraryNamePrefix') || 'Library:');
                const pathPrefix = (window.i18n?.getText('tooltips.libraryPathPrefix') || 'Path:');
                const sizePrefix = (window.i18n?.getText('tooltips.sizePrefix') || 'Size:');
                let tooltipText = `${pathPrefix} ${libraryPath}`;
                if (libraryName && !['演示资源库', 'Demo Library'].includes(libraryName)) {
                    tooltipText = `${namePrefix} ${libraryName}\n${pathPrefix} ${libraryPath}`;
                }
                if (librarySize > 0) {
                    const formattedSize = this.formatFileSize(librarySize);
                    tooltipText += `\n${sizePrefix} ${formattedSize}`;
                }
                this.elements.eagleLibrary.removeAttribute('title');
                this.elements.eagleLibrary.setAttribute('title', tooltipText);
                this.elements.eagleLibrary.title = tooltipText;
            } else {
                this.elements.eagleLibrary.removeAttribute('title');
            }

            // 添加点击样式和事件
            this.elements.eagleLibrary.classList.add('clickable');
            this.elements.eagleLibrary.onclick = () => {
                console.debug('🎭 演示模式：模拟打开Eagle资源库文件夹');
                alert('演示模式：这里会打开Eagle资源库文件夹\n' + libraryPath);
            };
        } else {
            console.warn('❌ eagleLibrary 元素不存在');
        }

        // 更新当前组并添加悬浮提示
        if (this.elements.eagleFolder) {
            const selectedFolder = globalEagleData?.selectedFolder || this.demoData.eagle.selectedFolder;
            this.elements.eagleFolder.textContent = selectedFolder;
            if (selectedFolder && !['获取中...', 'Waiting for import request...', 'Waiting'].includes(selectedFolder)) {
                const prefix = (window.i18n?.getText('tooltips.currentGroupPrefix') || 'Current Group:');
                this.elements.eagleFolder.title = `${prefix} ${selectedFolder}`;
            } else {
                this.elements.eagleFolder.removeAttribute('title');
            }
        }

        // console.log('🦅 Eagle信息已更新为连接状态');
    }

    updateEagleInfoDisconnected() {
        // 使用演示数据覆盖中的未连接状态数据
        // 使用全局演示数据
        const globalEagleData = window.__DEMO_DATA__?.eagle?.disconnected;
        const disconnectedData = window.__DEMO_DATA__ ? window.__DEMO_DATA__.eagle.disconnected : {
            version: globalEagleData?.version || (window.i18n?.getText('common.waitingForImport') || 'Waiting for import request...'),
            execPath: globalEagleData?.execPath || (window.i18n?.getText('common.waitingForImport') || 'Waiting for import request...'),
            libraryPath: globalEagleData?.libraryPath || (window.i18n?.getText('common.waitingForImport') || 'Waiting for import request...'),
            selectedFolder: globalEagleData?.selectedFolder || (window.i18n?.getText('common.waitingForImport') || 'Waiting for import request...')
        };

        // 更新Eagle版本信息
        if (this.elements.eagleVersion) {
            this.elements.eagleVersion.textContent = disconnectedData.version;
            this.elements.eagleVersion.removeAttribute('title'); // 未连接状态移除悬浮提示
        }

        // 更新Eagle路径
        if (this.elements.eaglePath) {
            this.elements.eaglePath.textContent = disconnectedData.execPath;
            this.elements.eaglePath.removeAttribute('title'); // 未连接状态移除悬浮提示
            this.elements.eaglePath.classList.remove('clickable');
            this.elements.eaglePath.onclick = null;
        }

        // 更新资源库
        if (this.elements.eagleLibrary) {
            this.elements.eagleLibrary.textContent = (window.i18n?.getText('common.waitingForImport') || 'Waiting for import request...');
            this.elements.eagleLibrary.removeAttribute('title'); // 未连接状态移除悬浮提示
            this.elements.eagleLibrary.classList.remove('clickable');
            this.elements.eagleLibrary.onclick = null;
        }

        // 更新当前组
        if (this.elements.eagleFolder) {
            this.elements.eagleFolder.textContent = disconnectedData.selectedFolder;
            this.elements.eagleFolder.removeAttribute('title'); // 未连接状态移除悬浮提示
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

            console.debug('✅ 演示模式连接按钮事件监听器已设置（capture模式）');
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
                    console.debug('✅ 演示断开连接完成');
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
                    // 在演示模式下显示虚拟连接日志
        if (window.aeExtension && typeof window.aeExtension.log === 'function') {
            const tTesting = (window.i18n?.getText('logs.testingConnectionToEagle')) || 'Testing connection to Eagle...';
            window.aeExtension.log(`🔗 ${tTesting}`, 'info');

            // Eagle-side connection logs
            if (typeof window.aeExtension.logEagle === 'function') {
                setTimeout(() => {
                    const tRecv = (window.i18n?.getText('logs.eagleReceivedConnectionRequest')) || 'Received connection request';
                    const tVerify = (window.i18n?.getText('logs.eagleVerifyApiPermission')) || 'Verifying API permissions...';
                    window.aeExtension.logEagle(`📡 ${tRecv}`, 'info');
                    window.aeExtension.logEagle(`🔐 ${tVerify}`, 'debug');
                }, 300);

                setTimeout(() => {
                    const tVerified = (window.i18n?.getText('logs.eagleApiPermissionVerified')) || 'API permissions verified';
                    const tSelectedPrefix = (window.i18n?.getText('logs.eagleSelectedFolderPrefix')) || 'Current selected folder';
                    const tLibStatus = (window.i18n?.getText('logs.eagleLibraryStatus')) || 'Library status';
                    const tItemsSuffix = (window.i18n?.getText('logs.itemsAvailableSuffix')) || 'items available';
                    const folderName = (window.demoMode?.config?.demoData?.eagle?.selectedFolder) || (window.DemoI18nHelper?.getDemoText('eagle.libraryName')) || 'Hamster Party';
                    const totalItems = (window.demoMode?.config?.demoData?.eagle?.totalItems) || 1247;
                    const formattedItems = Number(totalItems).toLocaleString();
                    window.aeExtension.logEagle(`✅ ${tVerified}`, 'success');
                    window.aeExtension.logEagle(`📁 ${tSelectedPrefix}: "${folderName}"`, 'info');
                    window.aeExtension.logEagle(`📊 ${tLibStatus}: ${formattedItems} ${tItemsSuffix}`, 'info');
                }, 800);

                setTimeout(() => {
                    const tReady = (window.i18n?.getText('logs.eaglePluginReady')) || 'Eagle plugin ready, awaiting import';
                    window.aeExtension.logEagle(`🚀 ${tReady}`, 'success');
                }, 1200);
            }

            setTimeout(() => {
                const tHttp = (window.i18n?.getText('logs.httpConnected')) || 'HTTP connection successful!';
                const tLatency = (window.i18n?.getText('logs.latency')) || 'Latency';
                const tWs = (window.i18n?.getText('logs.websocketConnected')) || 'WebSocket connected!';
                const tSystemReady = (window.i18n?.getText('logs.systemReady')) || 'System ready — drag to import';
                window.aeExtension.log(`${tHttp} ${tLatency}: 18ms`, 'success');
                window.aeExtension.log(`✅ ${tWs}`, 'success');
                window.aeExtension.log(`🎯 ${tSystemReady}`, 'success');
            }, 1400);
        }
        console.debug('✅ 演示连接完成');
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
            const t = (k, fb) => (window.i18n?.getText(k) || fb);
            this.elements.statusMain.textContent = t('common.connecting', 'Connecting...');
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
            const t = (k, fb) => (window.i18n?.getText(k) || fb);
            this.elements.statusMain.textContent = t('common.connectedDemo', 'Connected (Demo)');
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
            console.debug('✅ 连接状态UI已更新，包括AE和Eagle信息');
        }, 100);
    }
    
    showDisconnectingState() {
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = 'status-indicator connecting';
        }

        if (this.elements.statusMain) {
            const t = (k, fb) => (window.i18n?.getText(k) || fb);
            this.elements.statusMain.textContent = t('common.disconnecting', 'Disconnecting...');
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
            const t = (k, fb) => (window.i18n?.getText(k) || fb);
            this.elements.statusMain.textContent = t('common.disconnectedDemo', 'Disconnected (Demo)');
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
        const tooltip = '当前为演示模式\n左键：切换面板\nCtrl+Shift：禁用面板';
        indicator.setAttribute('title', tooltip);
        indicator.title = tooltip;
        indicator.setAttribute('aria-label', tooltip);
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

        // 点击指示器：
        // - Ctrl+Shift 点击：请求宿主暂停当前面板（变为未加载状态）
        // - 普通点击：请求宿主切换该 iframe 的面板到下一个（1→2→3）
        try {
            indicator.addEventListener('click', (ev) => {
                try {
                    if (!window.parent) return;
                    if (ev && ev.ctrlKey && ev.shiftKey) {
                        // 传递点击坐标，宿主据此执行圆形遮罩入场动画
                        const x = typeof ev.clientX === 'number' ? ev.clientX : 0;
                        const y = typeof ev.clientY === 'number' ? ev.clientY : 0;
                        window.parent.postMessage({ type: 'PAUSE_PANEL_REQUEST', clientX: x, clientY: y }, '*');
                        return;
                    }
                    window.parent.postMessage({ type: 'SWITCH_PANEL_REQUEST', cycle: 'next' }, '*');
                } catch (___) {}
            });
        } catch (___) {}

        // 在指示器创建后，尝试更新悬浮提示内容为当前面板与预设名称
        try {
            if (window.aeExtension && typeof window.aeExtension.updateDemoIndicatorTooltip === 'function') {
                // 稍作延迟，确保宿主页面的 PANEL_INFO 已同步到扩展
                setTimeout(() => {
                    try { window.aeExtension.updateDemoIndicatorTooltip(); } catch (__) {}
                }, 150);
            }
        } catch (__) {}

        console.debug('🎭 演示模式指示器已显示');
    }
    
    hideDemoModeIndicator() {
        const indicator = document.getElementById('demo-mode-indicator');
        if (indicator) {
            indicator.remove();
            console.debug('🎭 演示模式指示器已隐藏');
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
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0B';
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
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

// 全局调试函数
window.fixTitles = function() {
    console.log('🔧 开始修复悬浮提示...');

    const globalAEData = window.__DEMO_DATA__?.ae?.connected;
    const globalEagleData = window.__DEMO_DATA__?.eagle?.connected;

    // 修复AE项目路径
    const projectPathElement = document.querySelector('#project-path');
    if (projectPathElement && globalAEData?.execPath) {
        projectPathElement.removeAttribute('title');
        projectPathElement.setAttribute('title', globalAEData.execPath);
        projectPathElement.title = globalAEData.execPath;
        console.debug('✅ AE项目路径悬浮提示已修复');
    }

    // 修复Eagle路径
    const eaglePathElement = document.querySelector('#eagle-path');
    if (eaglePathElement && globalEagleData?.execPath) {
        eaglePathElement.removeAttribute('title');
        eaglePathElement.setAttribute('title', globalEagleData.execPath);
        eaglePathElement.title = globalEagleData.execPath;
        console.debug('✅ Eagle路径悬浮提示已修复');
    }

    // 强制重排
    document.body.style.transform = 'translateZ(0)';
    document.body.offsetHeight;
    document.body.style.transform = '';

    console.log('🎉 悬浮提示修复完成！');
};

window.showDemoStats = function() {
    console.log('📊 演示模式统计信息:');
    console.log('- 当前模式:', window.__DEMO_MODE_ACTIVE__ ? '演示模式' : '正常模式');
    console.log('- 网络拦截:', window.demoMode?.networkInterceptor ? '已启用' : '未启用');
    console.log('- 数据覆盖:', window.demoMode?.dataOverride ? '已启用' : '未启用');
    console.log('- UI管理器:', window.demoMode?.ui ? '已启用' : '未启用');

    if (window.demoMode?.networkInterceptor) {
        const stats = window.demoMode.networkInterceptor.getInterceptionStats();
        console.log('- 拦截统计:', stats);
    }
};

window.getDemoMode = function() {
    return {
        active: window.__DEMO_MODE_ACTIVE__,
        mode: window.demoMode?.currentMode,
        components: {
            networkInterceptor: !!window.demoMode?.networkInterceptor,
            dataOverride: !!window.demoMode?.dataOverride,
            ui: !!window.demoMode?.ui,
            apis: !!window.demoMode?.apis
        }
    };
};
