// Eagle2Ae 演示模式主控制器
// 环境检测、模式切换和彩蛋功能的核心控制器

// 全局日志控制
window.DEMO_DEBUG = false; // 设置为 false 来简化日志输出

// 简化的日志函数
function demoLog(message, force = false) {
    if (window.DEMO_DEBUG || force) {
        console.log(message);
    }
}

class DemoMode {
    constructor() {
        this.config = null;
        this.demoAPIs = null;
        this.demoUI = null;
        this.easterEgg = null;
        this.networkInterceptor = null; // 网络拦截器

        // 模式状态
        this.modes = {
            NORMAL: 'normal',        // 正常CEP模式
            DEMO: 'demo',           // 演示模式
            AUTO_DEMO: 'auto_demo'  // 自动演示模式（非CEP环境）
        };

        this.state = {
            currentMode: this.modes.NORMAL,
            isCEPEnvironment: false,
            isInitialized: false,
            originalAPIs: {} // 保存原始API引用
        };

        this.init();
    }
    
    async init() {
        // console.log('🎭 演示模式控制器初始化...');
        
        try {
            // 检测环境
            this.detectEnvironment();
            
            // 加载配置
            await this.loadConfig();
            
            // 初始化组件
            this.initializeComponents();
            
            // 根据环境决定模式
            this.determineInitialMode();
            
            this.state.isInitialized = true;
            console.log(`✅ 演示模式控制器初始化完成 - 当前模式: ${this.state.currentMode}`);
            
        } catch (error) {
            console.error('❌ 演示模式初始化失败:', error);
        }
    }
    
    detectEnvironment() {
        // 更严格的CEP环境检测
        let isCEP = false;

        // 检查Adobe CEP特有的全局对象
        if (window.__adobe_cep__) {
            isCEP = true;
            console.log('🔍 检测到 window.__adobe_cep__');
        } else if (window.cep && window.cep.process) {
            isCEP = true;
            console.log('🔍 检测到 window.cep.process');
        } else if (typeof CSInterface !== 'undefined') {
            // 进一步验证CSInterface是否真正可用
            try {
                const cs = new CSInterface();
                // 尝试获取CEP特有的信息
                const hostEnv = cs.getHostEnvironment();
                if (hostEnv && hostEnv.appName) {
                    isCEP = true;
                    console.log('🔍 CSInterface可用，检测到宿主应用:', hostEnv.appName);
                } else {
                    console.log('🔍 CSInterface存在但getHostEnvironment()返回空，判定为Web环境');
                }
            } catch (e) {
                // CSInterface存在但不可用，说明不在CEP环境中
                console.log('🔍 CSInterface存在但调用失败，判定为Web环境:', e.message);
                isCEP = false;
            }
        } else {
            console.log('🔍 未检测到任何CEP环境标识');
        }

        this.state.isCEPEnvironment = isCEP;
        console.log(`🔍 最终环境检测结果: ${this.state.isCEPEnvironment ? 'CEP环境' : 'Web环境'}`);
    }
    
    async loadConfig() {
        // 在Web环境下直接使用默认配置，避免CORS错误
        if (this.isWebEnvironment()) {
            this.config = this.getDefaultConfig();
            return;
        }

        try {
            // 获取配置文件路径
            const configPath = this.getConfigPath();
            console.log('📋 尝试加载配置文件:', configPath);

            // 加载配置
            const response = await fetch(configPath);
            if (!response.ok) {
                throw new Error(`配置文件加载失败: ${response.status} ${response.statusText}`);
            }

            this.config = await response.json();
            console.log('📋 演示配置已加载');

        } catch (error) {
            // 使用默认配置
            this.config = this.getDefaultConfig();
        }
    }
    
    isWebEnvironment() {
        // 检查是否为Web环境
        return !this.state.isCEPEnvironment || window.location.protocol === 'file:';
    }

    getConfigPath() {
        // 根据环境确定配置文件路径
        if (this.state.isCEPEnvironment && typeof CSInterface !== 'undefined') {
            try {
                const csInterface = new CSInterface();
                const extensionRoot = csInterface.getSystemPath('extension');
                const configPath = `${extensionRoot}/js/demo/demo-config.json`;
                console.log('📋 CEP环境配置路径:', configPath);
                return configPath;
            } catch (error) {
                console.warn('⚠️ CEP环境配置路径获取失败，使用默认路径:', error.message);
                return './js/demo/demo-config.json';
            }
        } else {
            const configPath = './js/demo/demo-config.json';
            console.log('📋 Web环境配置路径:', configPath);
            return configPath;
        }
    }
    
    getDefaultConfig() {
        // 获取当前语言设置，优先使用window.i18n.currentLang，否则从localStorage获取，最后回退到zh-CN
        const currentLang = window.i18n?.currentLang || localStorage.getItem('language') || localStorage.getItem('lang') || 'zh-CN';
        const isEn = ((currentLang || '') + '').toLowerCase().includes('en');
        
        // 根据当前语言设置默认演示数据
        const demoData = currentLang === 'en-US' ? {
            ae: { 
                version: '2024 (24.0.0)', 
                projectName: 'Demo Project',
                projectPath: 'D:\\Work\\HaveYouEatenToday\\AnywayIEat.aep',
                activeComp: 'Jumps Over the Wall',
                compDuration: '00:00:30:00',
                frameRate: 30,
                resolution: '1920x1080'
            },
            eagle: { 
                version: '4.0.0 build 1 pid 41536',
                libraryPath: 'D:\\Hamster.library',
                totalItems: 1247,
                selectedFolder: 'Hamster Party'
            }
        } : {
            ae: { 
                version: '2024 (24.0.0)', 
                projectName: '演示项目',
                projectPath: 'D:\\工作\\今天你吃饭了嘛\\反正我吃了.aep',
                activeComp: '佛跳墙',
                compDuration: '00:00:30:00',
                frameRate: 30,
                resolution: '1920x1080'
            },
            eagle: { 
                version: '4.0.0 build 1 pid 41536',
                libraryPath: 'D:\\仓鼠.library',
                totalItems: 1247,
                selectedFolder: '仓鼠党'
            }
        };
        
        return {
            meta: { version: '1.0.0' },
            easterEgg: { enabled: true, clickThreshold: 5, timeWindow: 3000 },
            demoData: {
                ...demoData,
                connection: { status: 'connected', pingTime: 15 },
                files: [],
                operations: { importDelay: 1500, connectionDelay: 800, successRate: 0.95 },

                connection: { status: 'connected', pingTime: 15 },
                files: [],
                operations: { importDelay: 1500, connectionDelay: 800, successRate: 0.95 },
                layerDetection: {
                    compName: currentLang === 'en-US' ? 'Jumps Over the Wall' : '佛跳墙',
                    selectedLayers: [
                        {
                            index: 1,
                            name: currentLang === 'en-US' ? 'Background.jpg' : '背景图片.jpg',
                            type: 'MaterialLayer',
                            exportable: false,
                            reason: currentLang === 'en-US' ? 'Image material, material files do not support export' : '图片素材，素材文件不支持导出',
                            sourceInfo: {
                                type: 'File',
                                fileName: currentLang === 'en-US' ? 'Background.jpg' : '背景图片.jpg',
                                originalPath: currentLang === 'en-US' ? 'D:\\Materials\\Images\\Background.jpg' : 'D:\\素材\\图片\\背景图片.jpg',
                                materialType: 'image',
                                materialCategory: currentLang === 'en-US' ? 'Image Material' : '图片素材',
                                categoryType: 'material',
                                categoryDisplayName: currentLang === 'en-US' ? 'Material File' : '素材文件',
                                fileExtension: 'jpg',
                                width: 1920,
                                height: 1080,
                                duration: null,
                                hasAlpha: false
                            },
                            tooltipInfo: {
                                categoryType: 'material',
                                categoryDisplayName: currentLang === 'en-US' ? 'Material File' : '素材文件',
                                originalPath: currentLang === 'en-US' ? 'D:\\Materials\\Images\\Background.jpg' : 'D:\\素材\\图片\\背景图片.jpg',
                                materialType: 'image',
                                materialCategory: currentLang === 'en-US' ? 'Image Material' : '图片素材',
                                fileSize: '2.1MB',
                                fileDate: '2024-01-15 14:30:22',
                                dimensions: '1920x1080',
                                hasActionButtons: true,
                                actionButtonType: 'open-folder'
                            }
                        },
                        {
                            index: 2,
                            name: currentLang === 'en-US' ? 'Logo.psd' : 'Logo设计.psd',
                            type: 'MaterialLayer',
                            exportable: true,
                            reason: currentLang === 'en-US' ? 'Design file, can be exported' : '设计文件，可以导出',
                            sourceInfo: {
                                type: 'File',
                                fileName: currentLang === 'en-US' ? 'Logo.psd' : 'Logo设计.psd',
                                originalPath: currentLang === 'en-US' ? 'D:\\Materials\\Design\\Logo.psd' : 'D:\\素材\\设计\\Logo设计.psd',
                                materialType: 'design',
                                materialCategory: currentLang === 'en-US' ? 'Design File' : '设计文件',
                                categoryType: 'design',
                                categoryDisplayName: currentLang === 'en-US' ? 'Design File' : '设计文件',
                                fileExtension: 'psd',
                                width: 512,
                                height: 512,
                                duration: null,
                                hasAlpha: true
                            },
                            tooltipInfo: {
                                categoryType: 'design',
                                categoryDisplayName: currentLang === 'en-US' ? 'Design File' : '设计文件',
                                originalPath: currentLang === 'en-US' ? 'D:\\Materials\\Design\\Logo.psd' : 'D:\\素材\\设计\\Logo设计.psd',
                                materialType: 'design',
                                materialCategory: currentLang === 'en-US' ? 'Design File' : '设计文件',
                                fileSize: '15.8MB',
                                fileDate: '2024-01-20 09:15:33',
                                dimensions: '512x512',
                                hasActionButtons: true,
                                actionButtonType: 'export'
                            }
                        },
                        {
                            index: 3,
                            name: currentLang === 'en-US' ? 'Animation.mp4' : '动画视频.mp4',
                            type: 'MaterialLayer',
                            exportable: false,
                            reason: currentLang === 'en-US' ? 'Video material, will export first frame' : '视频素材，将导出第一帧',
                            sourceInfo: {
                                type: 'File',
                                fileName: currentLang === 'en-US' ? 'Animation.mp4' : '动画视频.mp4',
                                originalPath: currentLang === 'en-US' ? 'D:\\Materials\\Video\\Animation.mp4' : 'D:\\素材\\视频\\动画视频.mp4',
                                materialType: 'video',
                                materialCategory: currentLang === 'en-US' ? 'Video Material' : '视频素材',
                                categoryType: 'material',
                                categoryDisplayName: currentLang === 'en-US' ? 'Material File' : '素材文件',
                                fileExtension: 'mp4',
                                width: 1920,
                                height: 1080,
                                duration: '00:00:15:00',
                                hasAlpha: false
                            },
                            tooltipInfo: {
                                categoryType: 'material',
                                categoryDisplayName: currentLang === 'en-US' ? 'Material File' : '素材文件',
                                originalPath: currentLang === 'en-US' ? 'D:\\Materials\\Video\\Animation.mp4' : 'D:\\素材\\视频\\动画视频.mp4',
                                materialType: 'video',
                                materialCategory: currentLang === 'en-US' ? 'Video Material' : '视频素材',
                                fileSize: '15.2MB',
                                fileDate: '2024-12-15 14:30:25',
                                dimensions: '1920x1080',
                                duration: '00:00:15:00'
                            }
                        },
                        {
                            index: 4,
                            name: currentLang === 'en-US' ? 'Icon.ai' : '图标设计.ai',
                            type: 'MaterialLayer',
                            exportable: true,
                            reason: currentLang === 'en-US' ? 'Design file, can be exported' : '设计文件，可以导出',
                            sourceInfo: {
                                type: 'File',
                                fileName: currentLang === 'en-US' ? 'Icon.ai' : '图标设计.ai',
                                originalPath: currentLang === 'en-US' ? 'D:\\Materials\\Design\\Icon.ai' : 'D:\\素材\\设计\\图标设计.ai',
                                materialType: 'design',
                                materialCategory: currentLang === 'en-US' ? 'Design File' : '设计文件',
                                categoryType: 'design',
                                categoryDisplayName: currentLang === 'en-US' ? 'Design File' : '设计文件',
                                fileExtension: 'ai',
                                width: 256,
                                height: 256,
                                duration: null,
                                hasAlpha: true
                            },
                            tooltipInfo: {
                                categoryType: 'design',
                                categoryDisplayName: currentLang === 'en-US' ? 'Design File' : '设计文件',
                                originalPath: currentLang === 'en-US' ? 'D:\\Materials\\Design\\Icon.ai' : 'D:\\素材\\设计\\图标设计.ai',
                                materialType: 'design',
                                materialCategory: currentLang === 'en-US' ? 'Design File' : '设计文件',
                                fileSize: '8.7MB',
                                fileDate: '2024-01-22 11:20:45',
                                dimensions: '256x256',
                                hasActionButtons: true,
                                actionButtonType: 'export'
                            }
                        },
                        {
                            index: 5,
                            name: currentLang === 'en-US' ? 'Solid Background' : '纯色背景',
                            type: 'SolidLayer',
                            exportable: false,
                            reason: currentLang === 'en-US' ? 'Solid layer does not support export' : '纯色图层不支持导出',
                            sourceInfo: {
                                type: 'Solid',
                                color: [255, 128, 0],
                                width: 1920,
                                height: 1080
                            }
                        },
                        {
                            index: 6,
                            name: currentLang === 'en-US' ? 'Title Text' : '标题文字',
                            type: 'TextLayer',
                            exportable: true,
                            reason: currentLang === 'en-US' ? 'Text layer, can be exported' : '文本图层，可以导出',
                            sourceInfo: {
                                type: 'Text',
                                text: currentLang === 'en-US' ? 'Jumps Over the Wall Tutorial' : '佛跳墙制作教程',
                                fontSize: 48,
                                fontFamily: currentLang === 'en-US' ? 'Arial' : '微软雅黑'
                            }
                        },
                        {
                            index: 7,
                            name: currentLang === 'en-US' ? 'Precomp-Effects' : '预合成-特效',
                            type: 'PrecompLayer',
                            exportable: false,
                            reason: currentLang === 'en-US' ? 'Precomp layer does not support export' : '预合成图层不支持导出',
                            sourceInfo: {
                                type: 'Composition',
                                compName: currentLang === 'en-US' ? 'Effects Composition' : '特效合成',
                                width: 1920,
                                height: 1080,
                                duration: '00:00:10:00'
                            }
                        }
                    ],
                    materialStats: {
                        totalMaterials: 4,
                        design: 2,
                        image: 1,
                        video: 1,
                        audio: 0,
                        animation: 0,
                        vector: 0,
                        raw: 0,
                        document: 0,
                        sequence: 0,
                        shape: 0,
                        text: 1,
                        solid: 1,
                        precomp: 1,
                        other: 0,
                        totalLayers: 7,
                        exportableCount: 3,
                        designFiles: 2,
                        materialFiles: 2,
                        pathSummary: {
                            [currentLang === 'en-US' ? 'D:\\Materials\\Images\\Background.jpg' : 'D:\\素材\\图片\\背景图片.jpg']: {
                                path: currentLang === 'en-US' ? 'D:\\Materials\\Images\\Background.jpg' : 'D:\\素材\\图片\\背景图片.jpg',
                                fileName: currentLang === 'en-US' ? 'Background.jpg' : '背景图片.jpg',
                                categoryType: 'material',
                                materialType: 'image',
                                layers: [currentLang === 'en-US' ? 'Background.jpg' : '背景图片.jpg']
                            },
                            [currentLang === 'en-US' ? 'D:\\Materials\\Design\\Logo.psd' : 'D:\\素材\\设计\\Logo设计.psd']: {
                                path: currentLang === 'en-US' ? 'D:\\Materials\\Design\\Logo.psd' : 'D:\\素材\\设计\\Logo设计.psd',
                                fileName: currentLang === 'en-US' ? 'Logo.psd' : 'Logo设计.psd',
                                categoryType: 'design',
                                materialType: 'design',
                                layers: [currentLang === 'en-US' ? 'Logo.psd' : 'Logo设计.psd']
                            },
                            [currentLang === 'en-US' ? 'D:\\Materials\\Video\\Animation.mp4' : 'D:\\素材\\视频\\动画视频.mp4']: {
                                path: currentLang === 'en-US' ? 'D:\\Materials\\Video\\Animation.mp4' : 'D:\\素材\\视频\\动画视频.mp4',
                                fileName: currentLang === 'en-US' ? 'Animation.mp4' : '动画视频.mp4',
                                categoryType: 'material',
                                materialType: 'video',
                                layers: [currentLang === 'en-US' ? 'Animation.mp4' : '动画视频.mp4']
                            },
                            [currentLang === 'en-US' ? 'D:\\Materials\\Design\\Icon.ai' : 'D:\\素材\\设计\\图标设计.ai']: {
                                path: currentLang === 'en-US' ? 'D:\\Materials\\Design\\Icon.ai' : 'D:\\素材\\设计\\图标设计.ai',
                                fileName: currentLang === 'en-US' ? 'Icon.ai' : '图标设计.ai',
                                categoryType: 'design',
                                materialType: 'design',
                                layers: [currentLang === 'en-US' ? 'Icon.ai' : '图标设计.ai']
                            }
                        }
                    },
                    pathSummaryAvailable: true,
                    pathSummaryReport: currentLang === 'en-US' ? 
                        '\n=== Design Files === (2 Material Files)\n' :
                        '\n=== 路径汇总清单 ===\n\n【设计文件】(2个路径):\n🎨 Logo设计.psd\n   路径: D:\\素材\\设计\\Logo设计.psd\n   使用图层: Logo设计.psd\n\n🎨 图标设计.ai\n   路径: D:\\素材\\设计\\图标设计.ai\n   使用图层: 图标设计.ai\n\n\n【素材文件】(2个路径):\n🖼️ 背景图片.jpg\n   路径: D:\\素材\\图片\\背景图片.jpg\n   使用图层: 背景图片.jpg\n\n🎬 动画视频.mp4\n   路径: D:\\素材\\视频\\动画视频.mp4\n   使用图层: 动画视频.mp4\n\n'
                },
                ui: {
                    messages: { 
                        connected: currentLang === 'en-US' ? '✅ Connected to demo environment' : '✅ 已连接到演示环境',
                        disconnected: currentLang === 'en-US' ? '❌ Disconnected from demo environment' : '❌ 已断开演示环境连接'
                    },
                    notifications: { showToasts: false, duration: 3000 }
                }
            }
        };
    }
    
    initializeComponents() {
        // 初始化API模拟器
        this.demoAPIs = new DemoAPIs(this.config);

        // 初始化网络拦截器
        if (typeof DemoNetworkInterceptor !== 'undefined') {
            this.networkInterceptor = new DemoNetworkInterceptor(this.demoAPIs);
        } else {
            console.warn('⚠️ DemoNetworkInterceptor未找到，将使用内置拦截功能');
        }

        // 初始化UI管理器
        this.demoUI = new DemoUI(this.config, this.demoAPIs);

        // 初始化彩蛋功能（仅在CEP环境中）
        if (this.state.isCEPEnvironment && this.config.easterEgg.enabled) {
            // 延迟初始化彩蛋功能，确保DOM完全加载
            if (document.readyState === 'complete') {
                this.easterEgg = new EasterEgg(this);
            } else {
                window.addEventListener('load', () => {
                    this.easterEgg = new EasterEgg(this);
                    console.log('🥚 彩蛋功能延迟初始化完成');
                });
            }
        }

        console.log('🧩 演示模式组件已初始化');
    }
    
    determineInitialMode() {
        console.log('🎯 开始确定初始模式...');
        console.log('🎯 当前环境检测结果:', this.state.isCEPEnvironment ? 'CEP环境' : 'Web环境');

        if (!this.state.isCEPEnvironment) {
            // 非CEP环境自动启用演示模式
            console.log('🎭 Web环境检测到，准备自动启用演示模式...');
            this.enableDemoMode(this.modes.AUTO_DEMO);
        } else {
            // CEP环境保持正常模式，等待彩蛋触发
            this.state.currentMode = this.modes.NORMAL;
            console.log('🔧 CEP环境 - 正常模式已激活');

            // 在CEP环境中也预加载演示数据，以便彩蛋切换时快速响应
            this.preloadDemoData();
        }
    }

    preloadDemoData() {
        // 预加载演示数据，但不显示
        console.log('📋 预加载演示数据...');
        // 这里可以预处理一些数据，但不修改UI
    }
    
    // 彩蛋触发的模式切换
    toggleMode() {
        if (!this.state.isCEPEnvironment) {
            console.log('⚠️ 模式切换仅在CEP环境中可用');
            return;
        }
        
        if (this.state.currentMode === this.modes.NORMAL) {
            this.enableDemoMode(this.modes.DEMO);
        } else {
            this.disableDemoMode();
        }
    }
    
    enableDemoMode(modeType = this.modes.DEMO) {
        console.log(`🎭 开始启用演示模式: ${modeType}`);

        // 激活数据覆盖策略
        if (window.__DEMO_OVERRIDE__) {
            console.log('📊 激活数据覆盖策略...');
            window.__DEMO_OVERRIDE__.activate();
        } else {
            console.warn('⚠️ 数据覆盖策略未找到');
        }

        // 保存原始API引用
        console.log('💾 备份原始API引用...');
        this.backupOriginalAPIs();

        // 替换API调用（包括网络拦截）
        console.log('🔄 替换API调用...');
        this.replaceAPIs();

        // 启用网络拦截器
        if (this.networkInterceptor) {
            console.log('🛡️ 启用网络拦截器...');
            this.networkInterceptor.activate();
        } else {
            console.warn('⚠️ 网络拦截器未找到');
        }

        // 更新UI状态
        if (this.demoUI) {
            console.log('🎨 更新UI状态...');
            this.demoUI.setupUI();

            // 延迟设置初始状态，确保UI完全初始化
            setTimeout(() => {
                console.log('📋 设置初始未连接状态...');
                this.demoUI.showDisconnectedState();
                this.demoUI.updateProjectInfo();
            }, 100);
        } else {
            console.warn('⚠️ DemoUI未找到');
        }

        // 更新模式状态
        this.state.currentMode = modeType;

        // 不显示模式切换通知，静默启用
        // const message = modeType === this.modes.AUTO_DEMO ?
        //     '🎭 自动演示模式已启用 - 网络通信已完全拦截' :
        //     this.config.demoData.ui.messages.modeSwitch || '🎭 演示模式已启用 - 网络通信已完全拦截';
        // this.showModeNotification(message);

        console.log('✅ 演示模式已启用');
    }
    
    disableDemoMode() {
        console.log('🔧 禁用演示模式，恢复正常模式');

        // 停用数据覆盖策略
        if (window.__DEMO_OVERRIDE__) {
            window.__DEMO_OVERRIDE__.deactivate();
        }

        // 禁用网络拦截器
        if (this.networkInterceptor) {
            this.networkInterceptor.deactivate();
        }

        // 恢复原始API
        this.restoreOriginalAPIs();

        // 清理演示UI并恢复原始事件监听器
        if (this.demoUI) {
            this.demoUI.restoreOriginalEventListeners();
            this.demoUI.cleanup();
        }

        // 恢复原始项目信息显示
        this.restoreOriginalProjectInfo();

        // 更新模式状态
        this.state.currentMode = this.modes.NORMAL;

        // 不显示模式切换通知，静默恢复
        // const message = this.config.demoData.ui.messages.modeRestore || '🔧 正常模式已恢复 - 网络通信已恢复';
        // this.showModeNotification(message);

        // 重新初始化正常模式
        this.reinitializeNormalMode();

        console.log('✅ 正常模式已恢复 - 网络通信已恢复正常');
    }

    restoreOriginalProjectInfo() {
        console.log('🔄 恢复原始项目信息显示...');

        const t = (k, fb) => (window.i18n?.getText(k) || fb);

        // 恢复AE信息为默认状态
        const aeVersion = document.getElementById('ae-version');
        if (aeVersion) {
            aeVersion.textContent = t('common.waitingForImport', 'Waiting for import request...');
        }

        const projectPath = document.getElementById('project-path');
        if (projectPath) {
            projectPath.textContent = t('common.unknown', 'Unknown');
            projectPath.title = '';
        }

        const projectName = document.getElementById('project-name');
        if (projectName) {
            projectName.textContent = t('common.noProjectOpen', 'No project open');
        }

        const compName = document.getElementById('comp-name');
        if (compName) {
            compName.textContent = t('common.none', 'None');
        }

        // 恢复Eagle信息为默认状态
        const eagleVersion = document.getElementById('eagle-version');
        if (eagleVersion) {
            eagleVersion.textContent = t('common.waitingForImport', 'Waiting for import request...');
        }

        const eaglePath = document.getElementById('eagle-path');
        if (eaglePath) {
            eaglePath.textContent = t('common.waitingForImport', 'Waiting for import request...');
            eaglePath.title = '';
        }

        const eagleLibrary = document.getElementById('eagle-library');
        if (eagleLibrary) {
            eagleLibrary.textContent = t('common.waitingForImport', 'Waiting for import request...');
            eagleLibrary.title = '';
        }

        const eagleFolder = document.getElementById('eagle-folder');
        if (eagleFolder) {
            eagleFolder.textContent = t('common.waitingForImport', 'Waiting for import request...');
        }

        // 恢复连接状态为默认状态
        const statusIndicator = document.getElementById('status-indicator');
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
        }

        const statusMain = document.getElementById('status-main');
        if (statusMain) {
            statusMain.textContent = t('common.notConnected', 'Disconnected');
        }

        const pingTime = document.getElementById('ping-time');
        if (pingTime) {
            pingTime.textContent = '--ms';
        }

        const testConnectionBtn = document.getElementById('test-connection-btn');
        if (testConnectionBtn) {
            testConnectionBtn.classList.remove('connected');
        }

        console.log('✅ 原始项目信息显示已恢复');
    }
    
    backupOriginalAPIs() {
        // 备份可能被替换的全局对象和方法
        if (window.AEExtension) {
            this.state.originalAPIs.AEExtension = window.AEExtension;
        }

        if (window.CSInterface) {
            this.state.originalAPIs.CSInterface = window.CSInterface;
        }

        // 备份网络API方法
        this.state.originalAPIs.fetch = window.fetch;
        this.state.originalAPIs.WebSocket = window.WebSocket;
        this.state.originalAPIs.XMLHttpRequest = window.XMLHttpRequest;

        console.log('💾 原始API已备份（包括网络API）');
    }
    
    replaceAPIs() {
        // 创建模拟的CSInterface
        if (this.demoAPIs && typeof this.demoAPIs.createMockCSInterface === 'function' && !this.state.isCEPEnvironment) {
            const demoAPIs = this.demoAPIs; // 保存引用
            window.CSInterface = function() {
                try {
                    return demoAPIs.createMockCSInterface();
                } catch (error) {
                    // 静默处理错误，返回一个基本的mock对象
                    return {
                        getHostEnvironment: () => null,
                        evalScript: () => {}
                    };
                }
            };
        }

        // 拦截AEExtension的方法调用
        this.interceptAEExtensionMethods();

        // 拦截特定的API调用
        this.interceptAPICallsIfNeeded();

        console.log('🔄 API已替换为演示版本');
    }

    interceptAEExtensionMethods() {
        // 如果AEExtension存在，拦截其关键方法
        if (window.AEExtension) {
            const aeExtension = window.AEExtension;

            // 备份原始方法
            if (!this.state.originalAPIs.AEExtension) {
                this.state.originalAPIs.AEExtension = {
                    getAEVersion: aeExtension.getAEVersion?.bind(aeExtension),
                    testConnection: aeExtension.testConnection?.bind(aeExtension),
                    updateConnectionUI: aeExtension.updateConnectionUI?.bind(aeExtension),
                    refreshProjectInfo: aeExtension.refreshProjectInfo?.bind(aeExtension),
                    updateEagleUI: aeExtension.updateEagleUI?.bind(aeExtension),
                    updateEagleStatusFromServer: aeExtension.updateEagleStatusFromServer?.bind(aeExtension),
                    updateProjectUI: aeExtension.updateProjectUI?.bind(aeExtension),
                    pollMessages: aeExtension.pollMessages?.bind(aeExtension)
                };
            }

            // 替换为演示版本
            if (aeExtension.getAEVersion) {
                aeExtension.getAEVersion = () => {
                    console.log('🎭 拦截getAEVersion调用');
                    // 不执行真实的版本获取，保持演示数据
                };
            }

            if (aeExtension.testConnection) {
                aeExtension.testConnection = async () => {
                    console.log('🎭 拦截testConnection调用');
                    return await this.demoAPIs.testConnection();
                };
            }

            if (aeExtension.updateConnectionUI) {
                aeExtension.updateConnectionUI = () => {
                    console.log('🎭 拦截updateConnectionUI调用');
                    // 保持演示模式的UI状态，不执行真实更新
                };
            }

            if (aeExtension.refreshProjectInfo) {
                aeExtension.refreshProjectInfo = async () => {
                    console.log('🎭 拦截refreshProjectInfo调用');
                    return await this.demoAPIs.getProjectInfo();
                };
            }

            // 关键：拦截updateEagleUI方法，防止Eagle信息被覆盖
            if (aeExtension.updateEagleUI) {
                aeExtension.updateEagleUI = (eagleStatus) => {
                    console.log('🎭 拦截updateEagleUI调用，保持演示数据');
                    // 完全阻止Eagle UI更新，保持演示数据
                };
            }

            // 关键：拦截updateEagleStatusFromServer方法
            if (aeExtension.updateEagleStatusFromServer) {
                aeExtension.updateEagleStatusFromServer = async () => {
                    console.log('🎭 拦截updateEagleStatusFromServer调用');
                    // 不执行真实的状态获取，避免覆盖演示数据
                };
            }

            // 拦截updateProjectUI方法
            if (aeExtension.updateProjectUI) {
                aeExtension.updateProjectUI = (projectInfo) => {
                    console.log('🎭 拦截updateProjectUI调用，保持演示数据');
                    // 不执行真实的项目UI更新
                };
            }

            // 拦截pollMessages方法，防止轮询触发状态更新
            if (aeExtension.pollMessages) {
                aeExtension.pollMessages = async () => {
                    console.log('🎭 拦截pollMessages调用');
                    return await this.demoAPIs.pollMessages();
                };
            }

            console.log('🎭 AEExtension方法已完全拦截');
        }
    }
    
    restoreOriginalAPIs() {
        console.log('🔄 开始恢复原始API...');

        // 恢复AEExtension的原始方法
        if (this.state.originalAPIs.AEExtension && window.AEExtension) {
            const aeExtension = window.AEExtension;
            const originalMethods = this.state.originalAPIs.AEExtension;

            if (originalMethods.getAEVersion) {
                aeExtension.getAEVersion = originalMethods.getAEVersion;
            }
            if (originalMethods.testConnection) {
                aeExtension.testConnection = originalMethods.testConnection;
            }
            if (originalMethods.updateConnectionUI) {
                aeExtension.updateConnectionUI = originalMethods.updateConnectionUI;
            }
            if (originalMethods.refreshProjectInfo) {
                aeExtension.refreshProjectInfo = originalMethods.refreshProjectInfo;
            }
            if (originalMethods.updateEagleUI) {
                aeExtension.updateEagleUI = originalMethods.updateEagleUI;
            }
            if (originalMethods.updateEagleStatusFromServer) {
                aeExtension.updateEagleStatusFromServer = originalMethods.updateEagleStatusFromServer;
            }
            if (originalMethods.updateProjectUI) {
                aeExtension.updateProjectUI = originalMethods.updateProjectUI;
            }
            if (originalMethods.pollMessages) {
                aeExtension.pollMessages = originalMethods.pollMessages;
            }

            console.log('🔄 AEExtension所有原始方法已恢复');
        }

        // 恢复网络API
        if (this.state.originalAPIs.fetch) {
            window.fetch = this.state.originalAPIs.fetch;
            console.log('🔄 fetch API已恢复');
        }

        if (this.state.originalAPIs.WebSocket) {
            window.WebSocket = this.state.originalAPIs.WebSocket;
            console.log('🔄 WebSocket API已恢复');
        }

        if (this.state.originalAPIs.XMLHttpRequest) {
            window.XMLHttpRequest = this.state.originalAPIs.XMLHttpRequest;
            console.log('🔄 XMLHttpRequest API已恢复');
        }

        // 恢复其他原始API
        Object.keys(this.state.originalAPIs).forEach(key => {
            if (!['AEExtension', 'fetch', 'WebSocket', 'XMLHttpRequest'].includes(key) && this.state.originalAPIs[key]) {
                window[key] = this.state.originalAPIs[key];
            }
        });

        // 清空备份
        this.state.originalAPIs = {};

        console.log('✅ 所有原始API已恢复');
    }
    
    interceptAPICallsIfNeeded() {
        // 完整拦截所有网络API调用
        if (this.state.currentMode !== this.modes.NORMAL) {
            console.log('🎭 启用完整网络拦截模式');

            // 拦截fetch请求
            this.interceptFetch();

            // 拦截WebSocket连接
            this.interceptWebSocket();

            // 拦截XMLHttpRequest（如果需要）
            this.interceptXMLHttpRequest();

            console.log('✅ 网络API拦截已启用');
        }
    }

    // 拦截fetch请求
    interceptFetch() {
        const originalFetch = this.state.originalAPIs.fetch;

        window.fetch = async (url, options = {}) => {
            // 检查是否是Eagle相关的API调用
            if (this.isEagleAPICall(url)) {
                console.log(`🎭 拦截fetch请求: ${url}`);
                return await this.demoAPIs.handleEagleAPICall(url, options);
            }

            // 检查是否是其他需要拦截的请求
            if (this.shouldInterceptRequest(url)) {
                console.log(`🎭 拦截其他请求: ${url}`);
                return this.createGenericMockResponse();
            }

            // 其他请求使用原始fetch（如配置文件等）
            return originalFetch(url, options);
        };
    }

    // 拦截WebSocket连接
    interceptWebSocket() {
        const originalWebSocket = this.state.originalAPIs.WebSocket;

        window.WebSocket = this.demoAPIs.createMockWebSocket();

        console.log('🎭 WebSocket已被拦截');
    }

    // 拦截XMLHttpRequest
    interceptXMLHttpRequest() {
        const originalXMLHttpRequest = this.state.originalAPIs.XMLHttpRequest;

        window.XMLHttpRequest = function() {
            console.log('🎭 拦截XMLHttpRequest创建');

            const mockXHR = {
                open: function(method, url) {
                    console.log(`🎭 模拟XHR open: ${method} ${url}`);
                    this.method = method;
                    this.url = url;
                },
                send: function(data) {
                    console.log(`🎭 模拟XHR send:`, data);
                    setTimeout(() => {
                        if (this.onreadystatechange) {
                            this.readyState = 4;
                            this.status = 200;
                            this.responseText = JSON.stringify({ success: true, message: '演示模式XHR响应' });
                            this.onreadystatechange();
                        }
                    }, 100);
                },
                setRequestHeader: function(header, value) {
                    console.log(`🎭 模拟XHR设置头: ${header}: ${value}`);
                },
                readyState: 0,
                status: 0,
                responseText: '',
                onreadystatechange: null
            };

            return mockXHR;
        };

        console.log('🎭 XMLHttpRequest已被拦截');
    }

    // 检查是否是Eagle API调用
    isEagleAPICall(url) {
        if (typeof url !== 'string') return false;

        // 检查是否包含localhost:8080或其他Eagle相关的URL模式
        return url.includes('localhost:8080') ||
               url.includes('127.0.0.1:8080') ||
               url.match(/localhost:\d+/) ||
               url.includes('/ping') ||
               url.includes('/messages') ||
               url.includes('/ae-message') ||
               url.includes('/ae-status') ||
               url.includes('/settings-sync') ||
               url.includes('/copy-to-clipboard') ||
               url.includes('/clear-logs') ||
               url.includes('/ae-port-info');
    }

    // 检查是否需要拦截其他请求
    shouldInterceptRequest(url) {
        if (typeof url !== 'string') return false;

        // 不拦截配置文件和资源文件
        if (url.includes('.json') || url.includes('.js') || url.includes('.css') || url.includes('.html')) {
            return false;
        }

        // 不拦截相对路径的本地文件
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('ws://') && !url.startsWith('wss://')) {
            return false;
        }

        return false; // 目前只拦截Eagle API
    }

    // 创建通用的模拟响应
    createGenericMockResponse() {
        return new Response(JSON.stringify({
            success: true,
            message: '演示模式通用响应'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // 这个方法已经被移动到demo-apis.js中的handleEagleAPICall方法
    // 保留这个方法以防有其他地方调用
    async handleEagleAPICall(url, options) {
        return await this.demoAPIs.handleEagleAPICall(url, options);
    }
    
    reinitializeNormalMode() {
        // 重新初始化正常模式的功能
        console.log('🔄 重新初始化正常模式...');

        setTimeout(() => {
            // 重新获取AE版本信息
            if (window.AEExtension && typeof window.AEExtension.getAEVersion === 'function') {
                window.AEExtension.getAEVersion();
            }

            // 重新更新连接UI
            if (window.AEExtension && typeof window.AEExtension.updateConnectionUI === 'function') {
                window.AEExtension.updateConnectionUI();
            }

            // 重新启动项目监控
            if (window.AEExtension && typeof window.AEExtension.startProjectMonitoring === 'function') {
                window.AEExtension.startProjectMonitoring();
            }

            console.log('✅ 正常模式重新初始化完成');
        }, 500);
    }
    
    setStaticProjectInfo() {
        console.log('📋 设置静态项目信息...');

        let retryCount = 0;
        const maxRetries = 5;

        // 等待DOM元素可用
        const setInfo = () => {
            console.log(`📋 尝试设置静态信息 (第${retryCount + 1}次)...`);

            // 检查关键元素是否存在
            const keyElements = [
                'ae-version', 'project-path', 'project-name', 'comp-name',
                'eagle-version', 'eagle-path', 'eagle-library', 'eagle-folder'
            ];

            const missingElements = keyElements.filter(id => !document.getElementById(id));

            if (missingElements.length > 0 && retryCount < maxRetries) {
                console.warn(`⚠️ 缺少元素: ${missingElements.join(', ')}, 将在1秒后重试...`);
                retryCount++;
                setTimeout(setInfo, 1000);
                return;
            }

            if (missingElements.length > 0) {
                console.error(`❌ 经过${maxRetries}次重试，仍有元素缺失: ${missingElements.join(', ')}`);
            }

            // 设置AE信息
            this.setAEInfo();

            // 设置Eagle信息
            this.setEagleInfo();

            // 设置连接状态
            this.setConnectionStatus();
        };

        // 如果DOM还没准备好，延迟执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(setInfo, 500); // 延迟500ms确保元素可用
            });
        } else {
            // DOM已准备好，延迟执行确保元素可用
            setTimeout(setInfo, 500); // 延迟500ms确保元素可用
        }
    }

    setAEInfo() {
        const aeData = this.config.demoData.ae;
        console.log('🎬 设置AE信息:', aeData);

        // AE版本
        const aeVersion = document.getElementById('ae-version');
        if (aeVersion) {
            aeVersion.textContent = aeData.version;
            const aeVerPrefix = window.i18n?.getText('tooltips.aeVersionPrefix') || 'After Effects Version:';
            aeVersion.title = `${aeVerPrefix} ${aeData.version}`;
            console.log('✅ AE版本已设置:', aeData.version);
        } else {
            console.warn('❌ 未找到ae-version元素');
        }

        // 项目路径
        const projectPath = document.getElementById('project-path');
        if (projectPath) {
            projectPath.textContent = aeData.projectPath;
            projectPath.title = aeData.projectPath;
            // 添加点击样式和事件
            projectPath.classList.add('clickable');
            projectPath.onclick = () => {
                console.log('🎭 演示模式：模拟打开项目文件夹');
                alert('演示模式：这里会打开项目文件夹\n' + aeData.projectPath);
            };
            console.log('✅ 项目路径已设置:', aeData.projectPath);
        } else {
            console.warn('❌ 未找到project-path元素');
        }

        // 项目名称
        const projectName = document.getElementById('project-name');
        if (projectName) {
            projectName.textContent = aeData.projectName;
            projectName.title = aeData.projectName; // 添加悬浮提示
            console.log('✅ 项目名称已设置:', aeData.projectName);
        } else {
            console.warn('❌ 未找到project-name元素');
        }

        // 合成名称
        const compName = document.getElementById('comp-name');
        if (compName) {
            compName.textContent = aeData.activeComp;
            compName.title = aeData.activeComp; // 添加悬浮提示
            console.log('✅ 合成名称已设置:', aeData.activeComp);
        } else {
            console.warn('❌ 未找到comp-name元素');
        }

        console.log('🎬 AE信息已静态设置');
    }

    setEagleInfo() {
        const eagleData = this.config.demoData.eagle;
        console.log('🦅 设置Eagle信息:', eagleData);

        // Eagle版本
        const eagleVersion = document.getElementById('eagle-version');
        if (eagleVersion) {
            eagleVersion.textContent = eagleData.version;
            eagleVersion.title = `Eagle版本: ${eagleData.version}`; // 添加悬浮提示
            console.log('✅ Eagle版本已设置:', eagleData.version);
        } else {
            console.warn('❌ 未找到eagle-version元素');
        }

        // Eagle路径 - 显示安装路径
        const eaglePath = document.getElementById('eagle-path');
        if (eaglePath) {
            const execPath = eagleData.execPath || '演示路径';
            eaglePath.textContent = execPath;
            const pathPrefix = window.i18n?.getText('tooltips.libraryPathPrefix') || 'Path:';
            eaglePath.title = `${pathPrefix} ${execPath}`;
            // Eagle路径不设置点击事件
            eaglePath.classList.remove('clickable');
            eaglePath.onclick = null;
            console.log('✅ Eagle路径已设置:', eagleData.execPath);
        } else {
            console.warn('❌ 未找到eagle-path元素');
        }

        // 资源库 - 可以点击打开
        const eagleLibrary = document.getElementById('eagle-library');
        if (eagleLibrary) {
            const libraryName = eagleData.libraryName || '演示资源库';
            const libraryPath = eagleData.libraryPath || '演示路径';
            eagleLibrary.textContent = libraryName;
            // 优化悬浮提示，显示更多信息
            let tooltipText = `资源库: ${libraryName}\n路径: ${libraryPath}`;
            if (eagleData.librarySize) {
                tooltipText += `\n大小: ${eagleData.librarySize}`;
            }
            eagleLibrary.title = tooltipText;
            // 添加点击样式和事件
            eagleLibrary.classList.add('clickable');
            eagleLibrary.onclick = () => {
                console.log('🎭 演示模式：模拟打开Eagle资源库文件夹');
                alert('演示模式：这里会打开Eagle资源库文件夹\n' + libraryPath);
            };
            console.log('✅ Eagle资源库已设置:', libraryName);
        } else {
            console.warn('❌ 未找到eagle-library元素');
        }



        // 当前组
        const eagleFolder = document.getElementById('eagle-folder');
        if (eagleFolder) {
            const selectedFolder = eagleData.selectedFolder;
            eagleFolder.textContent = selectedFolder;
            eagleFolder.title = `当前组: ${selectedFolder}`; // 添加悬浮提示
            console.log('✅ Eagle当前组已设置:', selectedFolder);
        } else {
            console.warn('❌ 未找到eagle-folder元素');
        }

        console.log('🦅 Eagle信息已静态设置');
    }

    setConnectionStatus() {
        const connectionData = this.config.demoData.connection;

        // 连接状态指示器
        const statusIndicator = document.getElementById('status-indicator');
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator connected';
        }

        // 状态文本
        const statusMain = document.getElementById('status-main');
        if (statusMain) {
            const t = (k, fb) => (window.i18n?.getText(k) || fb);
            statusMain.textContent = t('common.connectedDemo', 'Connected (Demo)');
        }

        // ping时间
        const pingTime = document.getElementById('ping-time');
        if (pingTime) {
            pingTime.textContent = `${connectionData.pingTime}ms`;
        }

        // 连接按钮状态
        const testConnectionBtn = document.getElementById('test-connection-btn');
        if (testConnectionBtn) {
            testConnectionBtn.classList.add('connected');
        }

        console.log('🔗 连接状态已静态设置');
    }

    showModeNotification(message) {
        if (this.demoUI) {
            this.demoUI.showNotification(message, 'info');
        } else {
            console.log(message);
        }
    }
    
    // 获取当前模式状态
    getCurrentMode() {
        return this.state.currentMode;
    }
    
    // 检查是否为演示模式
    isDemoMode() {
        return this.state.currentMode === this.modes.DEMO || 
               this.state.currentMode === this.modes.AUTO_DEMO;
    }
    
    // 检查是否为CEP环境
    isCEPEnvironment() {
        return this.state.isCEPEnvironment;
    }

    // 获取网络拦截统计信息（调试用）
    getNetworkInterceptionStats() {
        if (this.networkInterceptor) {
            return this.networkInterceptor.getInterceptionStats();
        }
        return { isActive: false, message: '网络拦截器未初始化' };
    }

    // 显示拦截统计信息（调试用）
    showInterceptionStats() {
        const stats = this.getNetworkInterceptionStats();
        console.log('🛡️ 网络拦截统计信息:', stats);

        if (stats.isActive) {
            console.log(`✅ 网络拦截器已激活`);
            console.log(`📊 已拦截请求: ${stats.interceptedRequests} 个`);
            console.log(`🔌 已拦截连接: ${stats.interceptedConnections} 个`);

            if (stats.requests && stats.requests.length > 0) {
                console.log('📋 拦截的请求列表:');
                stats.requests.forEach((req, index) => {
                    const status = req.intercepted ? '🛡️ 已拦截' : '✅ 已放行';
                    console.log(`  ${index + 1}. ${status} ${req.method} ${req.url}`);
                });
            }

            if (stats.connections && stats.connections.length > 0) {
                console.log('🔌 拦截的连接列表:');
                stats.connections.forEach((conn, index) => {
                    const status = conn.intercepted ? '🛡️ 已拦截' : '✅ 已放行';
                    console.log(`  ${index + 1}. ${status} ${conn.url}`);
                });
            }
        } else {
            console.log('❌ 网络拦截器未激活');
        }

        return stats;
    }
}

// 全局初始化
async function initializeDemoMode() {
    demoLog('🎭 开始初始化演示模式...');

    // 避免重复初始化
    if (window.demoMode) {
        console.log('⚠️ 演示模式已经初始化，跳过重复初始化');
        return;
    }

    try {
        window.demoMode = new DemoMode();
        // 等待初始化完成
        await new Promise(resolve => {
            const checkInit = () => {
                if (window.demoMode.state.isInitialized) {
                    console.log('✅ 演示模式初始化完成');
                    resolve();
                } else {
                    setTimeout(checkInit, 50);
                }
            };
            checkInit();
        });
    } catch (error) {
        console.error('❌ 演示模式初始化失败:', error);
    }
}

// 尽早初始化演示模式，在main.js之前
(function() {
    // 立即检查环境并初始化 - 使用简化但更严格的检测
    let isCEP = false;

    if (window.__adobe_cep__) {
        isCEP = true;
    } else if (window.cep && window.cep.process) {
        isCEP = true;
    } else if (typeof CSInterface !== 'undefined') {
        // 尝试更严格的检测
        try {
            const cs = new CSInterface();
            const hostEnv = cs.getHostEnvironment();
            if (hostEnv && hostEnv.appName) {
                isCEP = true;
            }
        } catch (e) {
            // CSInterface存在但不可用，判定为Web环境
            isCEP = false;
        }
    }

    // console.log('🔍 早期环境检测结果:', isCEP ? 'CEP环境' : 'Web环境');

    if (!isCEP) {
        // 非CEP环境，立即初始化演示模式并启用网络拦截
        // console.log('🎭 检测到非CEP环境，立即初始化演示模式并启用网络拦截');

        // 立即进行基础的网络拦截，防止任何早期的网络请求
        const originalFetch = window.fetch;
        const originalWebSocket = window.WebSocket;

        // 临时拦截，直到完整的演示模式初始化完成
        window.fetch = async function(url, options) {
            if (typeof url === 'string' && (url.includes('localhost:8080') || url.includes('127.0.0.1:8080'))) {
                console.log('🎭 早期拦截Eagle API请求:', url);
                return new Response(JSON.stringify({
                    success: true,
                    message: '演示模式早期拦截响应',
                    demo: true
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            return originalFetch(url, options);
        };

        window.WebSocket = function(url) {
            if (url.includes('localhost:8080') || url.includes('127.0.0.1:8080')) {
                console.log('🎭 早期拦截WebSocket连接:', url);
                // 返回一个基础的模拟WebSocket
                return {
                    readyState: 1,
                    send: () => console.log('🎭 早期模拟WebSocket发送'),
                    close: () => console.log('🎭 早期模拟WebSocket关闭'),
                    onopen: null,
                    onclose: null,
                    onmessage: null,
                    onerror: null
                };
            }
            return new originalWebSocket(url);
        };

        // 立即初始化完整的演示模式
        initializeDemoMode().catch(error => {
            console.error('❌ 演示模式异步初始化失败:', error);
        });
    } else {
        // CEP环境，正常初始化流程
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                initializeDemoMode().catch(error => {
                    console.error('❌ CEP环境演示模式初始化失败:', error);
                });
            });
        } else {
            setTimeout(() => {
                initializeDemoMode().catch(error => {
                    console.error('❌ CEP环境延迟演示模式初始化失败:', error);
                });
            }, 50); // 更早的初始化
        }
    }
})();

// 备用初始化（确保一定会执行）
window.addEventListener('load', () => {
    if (!window.demoMode) {
        console.log('🔄 备用初始化演示模式...');
        initializeDemoMode().catch(error => {
            console.error('❌ 备用演示模式初始化失败:', error);
        });
    }
});

// 导出类
window.DemoMode = DemoMode;

// 全局调试函数
window.showDemoStats = function() {
    if (window.demoMode) {
        return window.demoMode.showInterceptionStats();
    } else {
        console.log('❌ 演示模式未初始化');
        return null;
    }
};

window.getDemoMode = function() {
    if (window.demoMode) {
        return {
            currentMode: window.demoMode.getCurrentMode(),
            isDemoMode: window.demoMode.isDemoMode(),
            isCEPEnvironment: window.demoMode.isCEPEnvironment(),
            networkStats: window.demoMode.getNetworkInterceptionStats(),
            easterEggEnabled: !!window.demoMode.easterEgg
        };
    } else {
        console.log('❌ 演示模式未初始化');
        return null;
    }
};

// 测试彩蛋功能
window.testEasterEgg = function() {
    console.log('🧪 测试彩蛋功能...');

    if (!window.demoMode) {
        console.log('❌ 演示模式未初始化');
        return;
    }

    console.log('🔍 CEP环境:', window.demoMode.isCEPEnvironment());
    console.log('🔍 彩蛋对象:', !!window.demoMode.easterEgg);

    if (window.demoMode.easterEgg) {
        console.log('🔍 彩蛋配置:', window.demoMode.easterEgg.config);
        console.log('🔍 彩蛋状态:', window.demoMode.easterEgg.state);

        // 查找Eagle2AE标题
        const titleElement = document.querySelector('.header .title');
        console.log('🔍 找到的Eagle2AE标题元素:', !!titleElement);
        if (titleElement) {
            console.log(`  文本内容: "${titleElement.textContent.trim()}"`);
        }

        // 模拟点击测试
        if (window.demoMode.easterEgg.state.titleElement) {
            console.log('🖱️ 模拟点击测试...');
            window.demoMode.easterEgg.handleTitleClick({ preventDefault: () => {} });
        } else {
            console.log('❌ 标题元素未绑定');
        }
    } else {
        console.log('❌ 彩蛋功能未初始化');
    }
};

// 诊断连接按钮问题
window.debugConnection = function() {
    console.log('🔧 诊断连接按钮问题...');

    // 检查演示模式状态
    if (window.demoMode) {
        console.log('✅ 演示模式已初始化');
        console.log('🔍 当前模式:', window.demoMode.state.currentMode);
        console.log('🔍 CEP环境:', window.demoMode.state.isCEPEnvironment);

        if (window.demoMode.demoUI) {
            console.log('✅ DemoUI已初始化');
            console.log('🔍 DemoUI状态:', window.demoMode.demoUI.state);
            console.log('🔍 DemoUI是否已设置:', window.demoMode.demoUI.state.isInitialized);
        } else {
            console.log('❌ DemoUI未初始化');
        }
    } else {
        console.log('❌ 演示模式未初始化');
    }

    // 检查连接按钮元素
    const button = document.getElementById('test-connection-btn');
    if (button) {
        console.log('✅ 连接按钮元素存在');
        console.log('🔍 按钮disabled:', button.disabled);
        console.log('🔍 按钮title:', button.title);

        // 检查事件监听器（如果可能）
        if (typeof getEventListeners !== 'undefined') {
            const listeners = getEventListeners(button);
            console.log('🔍 事件监听器:', Object.keys(listeners));
        }
    } else {
        console.log('❌ 连接按钮元素不存在');
    }

    // 检查主应用状态
    if (window.eagle2ae) {
        console.log('✅ 主应用已初始化');
        console.log('🔍 连接状态:', window.eagle2ae.connectionState);
    } else {
        console.log('❌ 主应用未初始化');
    }

    return {
        demoMode: !!window.demoMode,
        currentMode: window.demoMode?.state?.currentMode,
        demoUIInitialized: window.demoMode?.demoUI?.state?.isInitialized,
        buttonExists: !!button,
        mainAppExists: !!window.eagle2ae,
        dataOverrideActive: window.__DEMO_OVERRIDE__?.isActive() || false,
        globalDemoFlag: window.__DEMO_MODE_ACTIVE__ || false
    };
};

// 测试网络拦截的函数
window.testNetworkInterception = async function() {
    console.log('🧪 测试网络拦截功能...');

    try {
        // 测试fetch请求
        console.log('🧪 测试fetch请求到Eagle API...');
        const response = await fetch('http://localhost:8080/ping');
        const data = await response.json();
        console.log('📥 fetch响应:', data);

        // 测试WebSocket连接
        console.log('🧪 测试WebSocket连接...');
        const ws = new WebSocket('ws://localhost:8080/ws');
        ws.onopen = () => {
            console.log('🔌 WebSocket连接已建立');
            ws.send(JSON.stringify({ type: 'test', message: '测试消息' }));
        };
        ws.onmessage = (event) => {
            console.log('📨 WebSocket消息:', event.data);
            ws.close();
        };
        ws.onclose = () => {
            console.log('🔌 WebSocket连接已关闭');
        };

        // 显示拦截统计
        setTimeout(() => {
            window.showDemoStats();
        }, 2000);

    } catch (error) {
        console.error('❌ 网络拦截测试失败:', error);
    }
};
