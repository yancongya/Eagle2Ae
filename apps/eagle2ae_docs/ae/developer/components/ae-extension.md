# AE扩展主类

## 概述

AE扩展主类（AE Extension Main Class）是 Eagle2Ae AE 扩展 v2.4.0 的核心管理类，负责协调和管理扩展的所有组件。该类提供了扩展的初始化、生命周期管理、组件注册、事件处理等核心功能，是整个扩展系统的入口点和协调中心。

## 核心特性

### 组件生命周期管理
- **自动初始化** - 自动初始化所有核心组件
- **依赖管理** - 管理组件间的依赖关系
- **延迟加载** - 支持组件的按需加载
- **优雅关闭** - 提供组件清理和资源释放机制

### 事件驱动架构
- **统一事件系统** - 提供全局事件总线
- **组件间通信** - 支持组件间的松耦合通信
- **事件监听管理** - 统一管理事件监听器
- **事件过滤** - 支持事件的过滤和处理

### 扩展性支持
- **插件架构** - 支持功能插件的动态加载
- **模块化设计** - 支持功能模块的独立开发
- **API接口** - 提供标准化的外部接口
- **配置管理** - 支持灵活的配置选项

### 性能监控
- **性能指标** - 监控关键性能指标
- **内存管理** - 管理内存使用和垃圾回收
- **资源监控** - 监控系统资源使用情况
- **错误统计** - 统计和分析错误发生情况

## 技术实现

### 核心类结构

```javascript
/**
 * AE扩展主类
 * 负责管理整个扩展系统，协调各组件工作
 */
class AEExtension {
    /**
     * 构造函数
     */
    constructor() {
        // CEP接口
        this.csInterface = new CSInterface();
        
        // 核心组件实例
        this.components = {
            settingsManager: null,
            logManager: null,
            eagleConnectionManager: null,
            projectStatusChecker: null,
            importManager: null,
            exportManager: null,
            folderOpenerModule: null
        };
        
        // 状态管理
        this.status = {
            initialized: false,
            started: false,
            stopped: false,
            error: null,
            startTime: null
        };
        
        // 事件管理系统
        this.eventSystem = {
            listeners: new Map(),
            channels: new Set(),
            queue: [],
            maxQueueSize: 1000
        };
        
        // 性能监控
        this.performance = {
            metrics: new Map(),
            startTime: Date.now(),
            lastUpdate: Date.now()
        };
        
        // 扩展配置
        this.config = {
            enableDemoMode: false,
            demoModeOptions: {},
            performanceMonitoring: true,
            eventQueueSize: 1000,
            autoInitialize: true,
            autoStart: true
        };
        
        // 插件系统
        this.plugins = new Map();
        this.pluginRegistry = new Set();
        
        // 绑定方法上下文
        this.initialize = this.initialize.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.onAppReady = this.onAppReady.bind(this);
        this.onExtensionLoaded = this.onExtensionLoaded.bind(this);
        this.handleEvent = this.handleEvent.bind(this);
        this.registerComponent = this.registerComponent.bind(this);
        this.getComponent = this.getComponent.bind(this);
        
        this.log('🔌 AE扩展主类已初始化', 'debug');
    }
}
```

### 组件初始化

```javascript
/**
 * 初始化扩展
 * @returns {Promise<boolean>} 初始化结果
 */
async initialize() {
    try {
        this.log('🚀 开始初始化AE扩展...', 'info');
        
        // 设置初始状态
        this.status.startTime = Date.now();
        this.status.initialized = false;
        
        // 初始化CSInterface事件监听
        this.initializeCSInterface();
        
        // 检查运行环境
        if (!await this.checkEnvironment()) {
            throw new Error('扩展运行环境检查失败');
        }
        
        // 根据是否为Demo模式初始化组件
        if (this.config.enableDemoMode) {
            await this.initializeDemoMode();
        } else {
            await this.initializeNormalMode();
        }
        
        // 初始化核心组件
        await this.initializeCoreComponents();
        
        // 初始化事件系统
        await this.initializeEventSystem();
        
        // 初始化性能监控
        await this.initializePerformanceMonitoring();
        
        // 更新状态
        this.status.initialized = true;
        
        this.log('✅ AE扩展初始化完成', 'success');
        
        // 如果配置为自动启动，则启动扩展
        if (this.config.autoStart) {
            await this.start();
        }
        
        return true;
        
    } catch (error) {
        this.log(`❌ AE扩展初始化失败: ${error.message}`, 'error');
        
        // 更新错误状态
        this.status.error = error.message;
        this.status.initialized = false;
        
        return false;
    }
}

/**
 * 初始化CSInterface
 */
initializeCSInterface() {
    try {
        this.log('🔧 初始化CSInterface...', 'debug');
        
        // 注册应用就绪事件
        this.csInterface.addEventListener('com.adobe.csxs.events.ApplicationReady', this.onAppReady);
        
        // 注册扩展加载完成事件
        this.csInterface.addEventListener('com.adobe.csxs.events.ExtensionLoaded', this.onExtensionLoaded);
        
        // 注册其他必要的事件
        this.csInterface.addEventListener('com.adobe.csxs.events.InvokeCommand', this.handleInvokeCommand);
        
        // 设置调试模式
        if (this.config.enableDemoMode) {
            // 在Demo模式下，创建模拟的CSInterface
            this.initializeDemoCSInterface();
        }
        
        this.log('✅ CSInterface初始化完成', 'debug');
        
    } catch (error) {
        this.log(`❌ CSInterface初始化失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 初始化Demo模式
 */
async initializeDemoMode() {
    try {
        this.log('🎭 初始化Demo模式...', 'debug');
        
        // 创建模拟的全局对象
        window.demoEagle = {
            getConnectionStatus: () => ({
                connected: true,
                version: '2.3.0',
                libraryPath: 'C:/Demo/Eagle/Library',
                error: null
            }),
            addItemToLibrary: (item) => ({
                success: true,
                itemId: `demo_${Date.now()}`,
                message: 'Item added successfully in demo mode'
            })
        };
        
        window.demoProject = {
            getProjectStatus: () => ({
                exists: true,
                projectPath: 'C:/Demo/Project.aep',
                projectName: 'Demo Project.aep'
            }),
            getProjectInfo: () => ({
                projectPath: 'C:/Demo/Project.aep',
                projectName: 'Demo Project.aep',
                projectSaved: true,
                projectModified: false
            }),
            getActiveCompStatus: () => ({
                exists: true,
                compName: 'Demo Composition',
                compWidth: 1920,
                compHeight: 1080,
                compDuration: 10.0
            }),
            getActiveCompInfo: () => ({
                compName: 'Demo Composition',
                compWidth: 1920,
                compHeight: 1080,
                compDuration: 10.0,
                compFps: 29.97
            })
        };
        
        window.demoFileSystem = {
            showFolderPicker: (options) => ({
                success: true,
                folderPath: 'C:/Demo/Selected/Folder'
            }),
            openFolder: (folderPath) => ({
                success: true,
                folderPath: folderPath
            }),
            checkFolderPermissions: (folderPath) => ({
                success: true,
                permissions: {
                    readable: true,
                    writable: true,
                    executable: true
                }
            })
        };
        
        // 设置Demo模式标志
        window.__DEMO_MODE_ACTIVE__ = true;
        
        this.log('✅ Demo模式初始化完成', 'debug');
        
    } catch (error) {
        this.log(`❌ Demo模式初始化失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 初始化正常模式
 */
async initializeNormalMode() {
    try {
        this.log('🔧 初始化正常模式...', 'debug');
        
        // 验证CSInterface可用性
        const hostSpecs = this.csInterface.getHostEnvironment();
        if (!hostSpecs) {
            throw new Error('无法获取主机环境信息');
        }
        
        this.log(`🎯 主机环境: ${hostSpecs.appName} ${hostSpecs.appVersion}`, 'debug');
        
        // 检查AE版本兼容性
        if (!this.checkAECompatibility(hostSpecs.appVersion)) {
            throw new Error(`AE版本 ${hostSpecs.appVersion} 不兼容`);
        }
        
        this.log('✅ 正常模式初始化完成', 'debug');
        
    } catch (error) {
        this.log(`❌ 正常模式初始化失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 初始化核心组件
 */
async initializeCoreComponents() {
    try {
        this.log('⚙️ 初始化核心组件...', 'debug');
        
        // 初始化日志管理器
        this.components.logManager = new LogManager(this);
        this.log = this.components.logManager.log.bind(this.components.logManager);
        
        // 初始化设置管理器
        this.components.settingsManager = new SettingsManager(this);
        await this.components.settingsManager.loadSettings();
        
        // 初始化Eagle连接管理器
        this.components.eagleConnectionManager = new EagleConnectionManager(this);
        
        // 初始化项目状态检查器
        this.components.projectStatusChecker = new ProjectStatusChecker(this);
        
        // 初始化导入管理器
        this.components.importManager = new ImportManager(this);
        
        // 初始化导出管理器
        this.components.exportManager = new ExportManager(this);
        
        // 初始化文件夹打开模块
        this.components.folderOpenerModule = new FolderOpenerModule(this);
        
        // 记录组件初始化完成
        for (const [name, component] of Object.entries(this.components)) {
            if (component) {
                this.log(`✅ ${name} 初始化完成`, 'debug');
            }
        }
        
        this.log('✅ 核心组件初始化完成', 'success');
        
    } catch (error) {
        this.log(`❌ 核心组件初始化失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 初始化事件系统
 */
async initializeEventSystem() {
    try {
        this.log('📡 初始化事件系统...', 'debug');
        
        // 初始化事件通道
        this.eventSystem.channels.add('system');
        this.eventSystem.channels.add('ui');
        this.eventSystem.channels.add('data');
        this.eventSystem.channels.add('import');
        this.eventSystem.channels.add('export');
        
        // 注册系统事件监听器
        this.addEventListener('system', 'error', this.handleSystemError);
        this.addEventListener('system', 'warning', this.handleSystemWarning);
        this.addEventListener('data', 'settingsChanged', this.handleSettingsChange);
        
        this.log('✅ 事件系统初始化完成', 'debug');
        
    } catch (error) {
        this.log(`❌ 事件系统初始化失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 初始化性能监控
 */
async initializePerformanceMonitoring() {
    try {
        this.log('📊 初始化性能监控...', 'debug');
        
        // 设置性能监控间隔
        this.performance.updateInterval = setInterval(() => {
            this.updatePerformanceMetrics();
        }, 5000); // 每5秒更新一次
        
        // 初始化性能指标
        this.performance.metrics.set('initTime', Date.now() - this.performance.startTime);
        
        this.log('✅ 性能监控初始化完成', 'debug');
        
    } catch (error) {
        this.log(`❌ 性能监控初始化失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 检查运行环境
 * @returns {Promise<boolean>} 环境是否兼容
 */
async checkEnvironment() {
    try {
        this.log('🔍 检查运行环境...', 'debug');
        
        // 检查浏览器环境
        if (typeof window === 'undefined') {
            throw new Error('扩展必须在浏览器环境中运行');
        }
        
        // 检查CSInterface
        if (!this.csInterface) {
            throw new Error('CSInterface未初始化');
        }
        
        // 检查必要API
        const requiredApis = [
            'fetch',
            'Promise',
            'JSON',
            'localStorage',
            'console'
        ];
        
        for (const api of requiredApis) {
            if (!(api in window)) {
                throw new Error(`缺少必要API: ${api}`);
            }
        }
        
        this.log('✅ 运行环境检查通过', 'debug');
        return true;
        
    } catch (error) {
        this.log(`❌ 运行环境检查失败: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 检查AE兼容性
 * @param {string} version - AE版本
 * @returns {boolean} 是否兼容
 */
checkAECompatibility(version) {
    try {
        // 解析版本号
        const versionParts = version.split('.');
        const majorVersion = parseInt(versionParts[0]);
        
        // 根据扩展要求设置兼容性检查
        if (isNaN(majorVersion)) {
            return false;
        }
        
        // 假设扩展支持AE CC 2019及更高版本
        // 可以根据实际需求调整
        return majorVersion >= 16; // AE CC 2019是版本16
        
    } catch (error) {
        this.log(`检查AE兼容性失败: ${error.message}`, 'error');
        return false;
    }
}
```

### 事件处理系统

```javascript
/**
 * 处理应用就绪事件
 * @param {Object} event - 事件对象
 */
onAppReady(event) {
    try {
        this.log('🎯 应用就绪事件触发', 'info');
        
        // 发布应用就绪事件
        this.emitEvent('system', 'appReady', {
            timestamp: Date.now(),
            event: event
        });
        
    } catch (error) {
        this.log(`处理应用就绪事件失败: ${error.message}`, 'error');
    }
}

/**
 * 处理扩展加载完成事件
 * @param {Object} event - 事件对象
 */
onExtensionLoaded(event) {
    try {
        this.log('📦 扩展加载完成事件触发', 'info');
        
        // 发布扩展加载完成事件
        this.emitEvent('system', 'extensionLoaded', {
            timestamp: Date.now(),
            event: event
        });
        
    } catch (error) {
        this.log(`处理扩展加载完成事件失败: ${error.message}`, 'error');
    }
}

/**
 * 处理命令调用事件
 * @param {Object} event - 事件对象
 */
handleInvokeCommand(event) {
    try {
        this.log(`📥 命令调用: ${event.data ? event.data.get('command') : 'unknown'}`, 'debug');
        
        // 根据命令类型处理
        const command = event.data ? event.data.get('command') : null;
        
        switch (command) {
            case 'refresh':
                this.handleRefreshCommand(event);
                break;
            case 'settings':
                this.handleSettingsCommand(event);
                break;
            case 'help':
                this.handleHelpCommand(event);
                break;
            default:
                this.log(`未知命令: ${command}`, 'warning');
        }
        
    } catch (error) {
        this.log(`处理命令调用事件失败: ${error.message}`, 'error');
    }
}

/**
 * 处理刷新命令
 * @param {Object} event - 事件对象
 */
handleRefreshCommand(event) {
    try {
        this.log('🔄 处理刷新命令', 'debug');
        
        // 刷新组件状态
        if (this.components.projectStatusChecker) {
            this.components.projectStatusChecker.updateProjectStatus();
        }
        
        if (this.components.eagleConnectionManager) {
            this.components.eagleConnectionManager.checkConnection();
        }
        
        // 发布刷新完成事件
        this.emitEvent('system', 'refreshComplete', {
            timestamp: Date.now(),
            command: 'refresh'
        });
        
    } catch (error) {
        this.log(`处理刷新命令失败: ${error.message}`, 'error');
    }
}

/**
 * 处理设置命令
 * @param {Object} event - 事件对象
 */
handleSettingsCommand(event) {
    try {
        this.log('⚙️ 处理设置命令', 'debug');
        
        // 显示设置面板或执行设置相关操作
        if (this.components.settingsManager) {
            // 这里可以实现打开设置面板的逻辑
            this.emitEvent('ui', 'showSettings', {
                timestamp: Date.now(),
                command: 'settings'
            });
        }
        
    } catch (error) {
        this.log(`处理设置命令失败: ${error.message}`, 'error');
    }
}

/**
 * 处理帮助命令
 * @param {Object} event - 事件对象
 */
handleHelpCommand(event) {
    try {
        this.log('❓ 处理帮助命令', 'debug');
        
        // 显示帮助信息
        this.emitEvent('ui', 'showHelp', {
            timestamp: Date.now(),
            command: 'help',
            helpContent: this.getHelpContent()
        });
        
    } catch (error) {
        this.log(`处理帮助命令失败: ${error.message}`, 'error');
    }
}

/**
 * 获取帮助内容
 * @returns {Object} 帮助内容
 */
getHelpContent() {
    return {
        title: 'Eagle2AE 扩展帮助',
        version: '2.4.0',
        features: [
            '从Eagle导入素材到AE',
            '从AE导出素材到Eagle',
            'AE项目文件夹打开',
            'Eagle资源库文件夹打开',
            '自定义文件夹打开',
            '多种导入模式'
        ],
        commands: {
            'refresh': '刷新扩展状态',
            'settings': '打开设置面板',
            'help': '显示帮助信息'
        },
        support: 'https://eagle.cool/support'
    };
}

/**
 * 发布事件
 * @param {string} channel - 事件通道
 * @param {string} type - 事件类型
 * @param {Object} data - 事件数据
 * @returns {boolean} 是否发布成功
 */
emitEvent(channel, type, data = {}) {
    try {
        const event = {
            id: this.generateEventId(),
            channel: channel,
            type: type,
            data: data,
            timestamp: Date.now(),
            source: 'AEExtension'
        };
        
        // 添加到事件队列
        this.eventSystem.queue.push(event);
        
        // 限制队列大小
        if (this.eventSystem.queue.length > this.eventSystem.maxQueueSize) {
            this.eventSystem.queue.shift(); // 移除最早的时间
        }
        
        // 通知监听器
        const eventTypeKey = `${channel}:${type}`;
        if (this.eventSystem.listeners.has(eventTypeKey)) {
            const listeners = this.eventSystem.listeners.get(eventTypeKey);
            for (const listener of listeners) {
                try {
                    listener(event);
                } catch (listenerError) {
                    this.log(`事件监听器执行失败: ${listenerError.message}`, 'error');
                }
            }
        }
        
        // 通知通配符监听器
        const wildcardListeners = this.eventSystem.listeners.get('*');
        if (wildcardListeners) {
            for (const listener of wildcardListeners) {
                try {
                    listener(event);
                } catch (listenerError) {
                    this.log(`通配符监听器执行失败: ${listenerError.message}`, 'error');
                }
            }
        }
        
        // 记录事件日志
        this.log(`📤 事件发布: ${eventTypeKey}`, 'debug', { event: event });
        
        return true;
        
    } catch (error) {
        this.log(`发布事件失败: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 添加事件监听器
 * @param {string} channel - 事件通道
 * @param {string} type - 事件类型
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addEventListener(channel, type, listener) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }
        
        const eventTypeKey = `${channel}:${type}`;
        
        if (!this.eventSystem.listeners.has(eventTypeKey)) {
            this.eventSystem.listeners.set(eventTypeKey, new Set());
        }
        
        const listeners = this.eventSystem.listeners.get(eventTypeKey);
        listeners.add(listener);
        
        this.log(`👂 添加事件监听器: ${eventTypeKey}`, 'debug');
        
        // 返回移除监听器的函数
        return () => {
            this.removeEventListener(channel, type, listener);
        };
        
    } catch (error) {
        this.log(`添加事件监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数
    }
}

/**
 * 移除事件监听器
 * @param {string} channel - 事件通道
 * @param {string} type - 事件类型
 * @param {Function} listener - 监听器函数
 */
removeEventListener(channel, type, listener) {
    try {
        const eventTypeKey = `${channel}:${type}`;
        
        if (this.eventSystem.listeners.has(eventTypeKey)) {
            const listeners = this.eventSystem.listeners.get(eventTypeKey);
            listeners.delete(listener);
            
            // 如果监听器集合为空，删除键
            if (listeners.size === 0) {
                this.eventSystem.listeners.delete(eventTypeKey);
            }
            
            this.log(`👂 移除事件监听器: ${eventTypeKey}`, 'debug');
        }
        
    } catch (error) {
        this.log(`移除事件监听器失败: ${error.message}`, 'error');
    }
}

/**
 * 添加通配符事件监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addWildcardListener(listener) {
    return this.addEventListener('*', '*', listener);
}

/**
 * 生成事件ID
 * @returns {string} 事件ID
 */
generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

### 组件管理

```javascript
/**
 * 注册组件
 * @param {string} name - 组件名称
 * @param {Object} component - 组件实例
 * @returns {boolean} 是否注册成功
 */
registerComponent(name, component) {
    try {
        if (!name || typeof name !== 'string') {
            throw new Error('组件名称必须是字符串');
        }
        
        if (!component) {
            throw new Error('组件实例不能为空');
        }
        
        this.components[name] = component;
        
        this.log(`⚙️ 组件注册成功: ${name}`, 'debug');
        
        // 如果组件有初始化方法，调用它
        if (typeof component.initialize === 'function') {
            component.initialize();
        }
        
        // 发布组件注册事件
        this.emitEvent('system', 'componentRegistered', {
            name: name,
            component: component
        });
        
        return true;
        
    } catch (error) {
        this.log(`注册组件失败: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 获取组件
 * @param {string} name - 组件名称
 * @returns {Object|null} 组件实例
 */
getComponent(name) {
    try {
        if (!name || typeof name !== 'string') {
            throw new Error('组件名称必须是字符串');
        }
        
        const component = this.components[name];
        
        if (!component) {
            this.log(`⚠️ 组件不存在: ${name}`, 'warning');
            return null;
        }
        
        this.log(`🔍 获取组件: ${name}`, 'debug');
        return component;
        
    } catch (error) {
        this.log(`获取组件失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 检查组件是否已注册
 * @param {string} name - 组件名称
 * @returns {boolean} 是否已注册
 */
hasComponent(name) {
    return this.components.hasOwnProperty(name) && this.components[name] !== null;
}

/**
 * 移除组件
 * @param {string} name - 组件名称
 * @returns {boolean} 是否移除成功
 */
removeComponent(name) {
    try {
        if (!name || typeof name !== 'string') {
            throw new Error('组件名称必须是字符串');
        }
        
        if (!this.components.hasOwnProperty(name)) {
            return false;
        }
        
        // 如果组件有清理方法，调用它
        const component = this.components[name];
        if (component && typeof component.cleanup === 'function') {
            component.cleanup();
        }
        
        this.components[name] = null;
        delete this.components[name];
        
        this.log(`⚙️ 组件移除成功: ${name}`, 'debug');
        
        // 发布组件移除事件
        this.emitEvent('system', 'componentRemoved', {
            name: name
        });
        
        return true;
        
    } catch (error) {
        this.log(`移除组件失败: ${error.message}`, 'error');
        return false;
    }
}
```

### 扩展生命周期管理

```javascript
/**
 * 启动扩展
 * @returns {Promise<boolean>} 启动结果
 */
async start() {
    try {
        this.log('🎬 开始启动AE扩展...', 'info');
        
        if (!this.status.initialized) {
            this.log('❌ 扩展未初始化，无法启动', 'error');
            return false;
        }
        
        if (this.status.started) {
            this.log('⚠️ 扩展已在运行中', 'warning');
            return true;
        }
        
        // 更新状态
        this.status.started = true;
        
        // 启动各组件
        await this.startComponents();
        
        // 启动插件系统
        await this.startPlugins();
        
        // 发布启动完成事件
        this.emitEvent('system', 'startupComplete', {
            timestamp: Date.now(),
            startupTime: Date.now() - this.status.startTime
        });
        
        this.log('✅ AE扩展启动完成', 'success');
        return true;
        
    } catch (error) {
        this.log(`❌ AE扩展启动失败: ${error.message}`, 'error');
        
        // 更新错误状态
        this.status.error = error.message;
        this.status.started = false;
        
        return false;
    }
}

/**
 * 启动组件
 */
async startComponents() {
    try {
        this.log('⚙️ 启动核心组件...', 'debug');
        
        // 依次启动各组件
        const componentsToStart = [
            'logManager',
            'settingsManager',
            'eagleConnectionManager',
            'projectStatusChecker',
            'importManager',
            'exportManager',
            'folderOpenerModule'
        ];
        
        for (const componentName of componentsToStart) {
            const component = this.components[componentName];
            if (component && typeof component.start === 'function') {
                try {
                    await component.start();
                    this.log(`✅ ${componentName} 启动完成`, 'debug');
                } catch (startError) {
                    this.log(`⚠️ ${componentName} 启动失败: ${startError.message}`, 'warning');
                    // 继续启动其他组件
                }
            }
        }
        
        this.log('✅ 核心组件启动完成', 'debug');
        
    } catch (error) {
        this.log(`启动组件失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 启动插件
 */
async startPlugins() {
    try {
        this.log('🔌 启动插件...', 'debug');
        
        for (const [pluginId, plugin] of this.plugins) {
            try {
                if (typeof plugin.start === 'function') {
                    await plugin.start();
                    this.log(`✅ 插件启动完成: ${pluginId}`, 'debug');
                }
            } catch (pluginError) {
                this.log(`⚠️ 插件启动失败: ${pluginId} - ${pluginError.message}`, 'warning');
            }
        }
        
        this.log('✅ 插件启动完成', 'debug');
        
    } catch (error) {
        this.log(`启动插件失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 停止扩展
 * @returns {Promise<boolean>} 停止结果
 */
async stop() {
    try {
        this.log('🛑 开始停止AE扩展...', 'info');
        
        if (!this.status.started) {
            this.log('⚠️ 扩展未启动', 'warning');
            return true;
        }
        
        // 发布停止开始事件
        this.emitEvent('system', 'shutdownStart', {
            timestamp: Date.now()
        });
        
        // 停止插件
        await this.stopPlugins();
        
        // 停止组件
        await this.stopComponents();
        
        // 停止事件系统
        await this.stopEventSystem();
        
        // 停止性能监控
        await this.stopPerformanceMonitoring();
        
        // 清理CSInterface事件监听
        this.cleanupCSInterface();
        
        // 更新状态
        this.status.started = false;
        this.status.stopped = true;
        
        // 发布停止完成事件
        this.emitEvent('system', 'shutdownComplete', {
            timestamp: Date.now(),
            shutdownTime: Date.now() - this.status.startTime
        });
        
        this.log('✅ AE扩展停止完成', 'success');
        return true;
        
    } catch (error) {
        this.log(`❌ AE扩展停止失败: ${error.message}`, 'error');
        
        // 更新错误状态
        this.status.error = error.message;
        return false;
    }
}

/**
 * 停止插件
 */
async stopPlugins() {
    try {
        this.log('🔌 停止插件...', 'debug');
        
        for (const [pluginId, plugin] of this.plugins) {
            try {
                if (typeof plugin.stop === 'function') {
                    await plugin.stop();
                    this.log(`✅ 插件停止完成: ${pluginId}`, 'debug');
                }
            } catch (pluginError) {
                this.log(`⚠️ 插件停止失败: ${pluginId} - ${pluginError.message}`, 'warning');
            }
        }
        
        // 清空插件注册表
        this.pluginRegistry.clear();
        
        this.log('✅ 插件停止完成', 'debug');
        
    } catch (error) {
        this.log(`停止插件失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 停止组件
 */
async stopComponents() {
    try {
        this.log('⚙️ 停止核心组件...', 'debug');
        
        // 按相反顺序停止组件（依赖倒置）
        const componentsToStop = [
            'folderOpenerModule',
            'exportManager',
            'importManager',
            'projectStatusChecker',
            'eagleConnectionManager',
            'settingsManager',
            'logManager'
        ];
        
        for (const componentName of componentsToStop) {
            const component = this.components[componentName];
            if (component && typeof component.stop === 'function') {
                try {
                    await component.stop();
                    this.log(`✅ ${componentName} 停止完成`, 'debug');
                } catch (stopError) {
                    this.log(`⚠️ ${componentName} 停止失败: ${stopError.message}`, 'warning');
                }
            }
        }
        
        this.log('✅ 核心组件停止完成', 'debug');
        
    } catch (error) {
        this.log(`停止组件失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 停止事件系统
 */
async stopEventSystem() {
    try {
        this.log('📡 停止事件系统...', 'debug');
        
        // 清空事件监听器
        this.eventSystem.listeners.clear();
        
        // 清空事件队列
        this.eventSystem.queue = [];
        
        // 清空事件通道
        this.eventSystem.channels.clear();
        
        this.log('✅ 事件系统停止完成', 'debug');
        
    } catch (error) {
        this.log(`停止事件系统失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 停止性能监控
 */
async stopPerformanceMonitoring() {
    try {
        this.log('📊 停止性能监控...', 'debug');
        
        // 清除性能监控定时器
        if (this.performance.updateInterval) {
            clearInterval(this.performance.updateInterval);
            this.performance.updateInterval = null;
        }
        
        // 清空性能指标
        this.performance.metrics.clear();
        
        this.log('✅ 性能监控停止完成', 'debug');
        
    } catch (error) {
        this.log(`停止性能监控失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 清理CSInterface
 */
cleanupCSInterface() {
    try {
        this.log('🔧 清理CSInterface...', 'debug');
        
        // 移除事件监听器
        this.csInterface.removeEventListener('com.adobe.csxs.events.ApplicationReady', this.onAppReady);
        this.csInterface.removeEventListener('com.adobe.csxs.events.ExtensionLoaded', this.onExtensionLoaded);
        this.csInterface.removeEventListener('com.adobe.csxs.events.InvokeCommand', this.handleInvokeCommand);
        
        this.log('✅ CSInterface清理完成', 'debug');
        
    } catch (error) {
        this.log(`清理CSInterface失败: ${error.message}`, 'error');
    }
}
```

### 性能监控

```javascript
/**
 * 更新性能指标
 */
updatePerformanceMetrics() {
    try {
        const now = Date.now();
        const elapsed = now - this.performance.lastUpdate;
        
        // 更新基本指标
        this.performance.metrics.set('uptime', now - this.performance.startTime);
        this.performance.metrics.set('lastUpdate', now);
        this.performance.metrics.set('updateInterval', elapsed);
        
        // 内存使用情况（如果可用）
        if (performance.memory) {
            this.performance.metrics.set('memoryUsed', performance.memory.usedJSHeapSize);
            this.performance.metrics.set('memoryTotal', performance.memory.totalJSHeapSize);
            this.performance.metrics.set('memoryLimit', performance.memory.jsHeapSizeLimit);
        }
        
        // 事件队列大小
        this.performance.metrics.set('eventQueueSize', this.eventSystem.queue.length);
        
        // 组件状态
        const componentStatus = {};
        for (const [name, component] of Object.entries(this.components)) {
            componentStatus[name] = component !== null;
        }
        this.performance.metrics.set('components', componentStatus);
        
        // 插件状态
        this.performance.metrics.set('pluginCount', this.plugins.size);
        
        this.performance.lastUpdate = now;
        
        // 检查是否需要记录性能日志
        if (this.config.performanceMonitoring) {
            this.logPerformanceMetrics();
        }
        
    } catch (error) {
        this.log(`更新性能指标失败: ${error.message}`, 'error');
    }
}

/**
 * 记录性能指标日志
 */
logPerformanceMetrics() {
    try {
        const memoryUsed = this.performance.metrics.get('memoryUsed');
        const memoryLimit = this.performance.metrics.get('memoryLimit');
        
        if (memoryUsed && memoryLimit) {
            const memoryPercentage = (memoryUsed / memoryLimit * 100).toFixed(2);
            
            if (memoryPercentage > 80) {
                this.log(`⚠️ 内存使用率过高: ${memoryPercentage}%`, 'warning', {
                    used: memoryUsed,
                    limit: memoryLimit
                });
            }
        }
        
        // 记录其他重要指标
        const uptime = this.performance.metrics.get('uptime');
        const eventQueueSize = this.performance.metrics.get('eventQueueSize');
        
        if (eventQueueSize > this.eventSystem.maxQueueSize * 0.8) {
            this.log(`⚠️ 事件队列接近满载: ${eventQueueSize}/${this.eventSystem.maxQueueSize}`, 'warning');
        }
        
    } catch (error) {
        this.log(`记录性能指标日志失败: ${error.message}`, 'error');
    }
}

/**
 * 获取性能报告
 * @returns {Object} 性能报告
 */
getPerformanceReport() {
    const report = {
        timestamp: Date.now(),
        uptime: this.performance.metrics.get('uptime'),
        memory: {
            used: this.performance.metrics.get('memoryUsed'),
            total: this.performance.metrics.get('memoryTotal'),
            limit: this.performance.metrics.get('memoryLimit')
        },
        eventQueue: {
            size: this.eventSystem.queue.length,
            maxSize: this.eventSystem.maxQueueSize
        },
        components: Object.keys(this.components).filter(name => this.components[name] !== null),
        plugins: Array.from(this.plugins.keys()),
        metrics: Object.fromEntries(this.performance.metrics)
    };
    
    return report;
}

/**
 * 获取系统状态
 * @returns {Object} 系统状态
 */
getSystemStatus() {
    return {
        status: {
            initialized: this.status.initialized,
            started: this.status.started,
            stopped: this.status.stopped,
            error: this.status.error
        },
        components: this.getComponentStatus(),
        performance: this.getPerformanceReport(),
        events: {
            queueSize: this.eventSystem.queue.length,
            channels: Array.from(this.eventSystem.channels)
        }
    };
}

/**
 * 获取组件状态
 * @returns {Object} 组件状态
 */
getComponentStatus() {
    const status = {};
    
    for (const [name, component] of Object.entries(this.components)) {
        status[name] = {
            registered: component !== null,
            ready: component && typeof component.ready === 'function' ? component.ready() : true
        };
    }
    
    return status;
}
```

### 插件系统

```javascript
/**
 * 注册插件
 * @param {string} pluginId - 插件ID
 * @param {Object} plugin - 插件对象
 * @returns {boolean} 是否注册成功
 */
registerPlugin(pluginId, plugin) {
    try {
        if (!pluginId || typeof pluginId !== 'string') {
            throw new Error('插件ID必须是字符串');
        }
        
        if (!plugin || typeof plugin !== 'object') {
            throw new Error('插件必须是对象');
        }
        
        if (this.plugins.has(pluginId)) {
            throw new Error(`插件已存在: ${pluginId}`);
        }
        
        // 验证插件接口
        if (!this.validatePluginInterface(plugin)) {
            throw new Error(`插件接口验证失败: ${pluginId}`);
        }
        
        this.plugins.set(pluginId, plugin);
        this.pluginRegistry.add(pluginId);
        
        this.log(`🔌 插件注册成功: ${pluginId}`, 'debug');
        
        // 如果扩展已启动且插件有start方法，立即启动插件
        if (this.status.started && typeof plugin.start === 'function') {
            plugin.start();
        }
        
        // 发布插件注册事件
        this.emitEvent('system', 'pluginRegistered', {
            pluginId: pluginId,
            plugin: plugin
        });
        
        return true;
        
    } catch (error) {
        this.log(`注册插件失败: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 验证插件接口
 * @param {Object} plugin - 插件对象
 * @returns {boolean} 是否验证通过
 */
validatePluginInterface(plugin) {
    try {
        // 检查必需的方法
        const requiredMethods = ['initialize', 'start', 'stop'];
        
        for (const method of requiredMethods) {
            if (typeof plugin[method] !== 'function') {
                this.log(`插件缺少必需方法: ${method}`, 'error');
                return false;
            }
        }
        
        // 检查可选方法
        const optionalMethods = ['onExtensionReady', 'onSettingsChange', 'onProjectChange'];
        
        for (const method of optionalMethods) {
            if (plugin[method] && typeof plugin[method] !== 'function') {
                this.log(`插件可选方法类型错误: ${method}`, 'warning');
            }
        }
        
        return true;
        
    } catch (error) {
        this.log(`验证插件接口失败: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 移除插件
 * @param {string} pluginId - 插件ID
 * @returns {boolean} 是否移除成功
 */
removePlugin(pluginId) {
    try {
        if (!pluginId || typeof pluginId !== 'string') {
            throw new Error('插件ID必须是字符串');
        }
        
        if (!this.plugins.has(pluginId)) {
            return false;
        }
        
        const plugin = this.plugins.get(pluginId);
        
        // 如果插件正在运行，先停止它
        if (this.status.started && typeof plugin.stop === 'function') {
            plugin.stop();
        }
        
        this.plugins.delete(pluginId);
        this.pluginRegistry.delete(pluginId);
        
        this.log(`🔌 插件移除成功: ${pluginId}`, 'debug');
        
        // 发布插件移除事件
        this.emitEvent('system', 'pluginRemoved', {
            pluginId: pluginId
        });
        
        return true;
        
    } catch (error) {
        this.log(`移除插件失败: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 获取插件
 * @param {string} pluginId - 插件ID
 * @returns {Object|null} 插件对象
 */
getPlugin(pluginId) {
    try {
        if (!pluginId || typeof pluginId !== 'string') {
            throw new Error('插件ID必须是字符串');
        }
        
        return this.plugins.get(pluginId) || null;
        
    } catch (error) {
        this.log(`获取插件失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 获取所有插件ID
 * @returns {Array} 插件ID数组
 */
getPluginIds() {
    return Array.from(this.plugins.keys());
}
```

## API参考

### 核心方法

#### AEExtension
AE扩展主类

```javascript
/**
 * AE扩展主类
 * 负责管理整个扩展系统，协调各组件工作
 */
class AEExtension
```

#### constructor()
构造函数

```javascript
/**
 * 构造函数
 */
constructor()
```

#### initialize()
初始化扩展

```javascript
/**
 * 初始化扩展
 * @returns {Promise<boolean>} 初始化结果
 */
async initialize()
```

#### start()
启动扩展

```javascript
/**
 * 启动扩展
 * @returns {Promise<boolean>} 启动结果
 */
async start()
```

#### stop()
停止扩展

```javascript
/**
 * 停止扩展
 * @returns {Promise<boolean>} 停止结果
 */
async stop()
```

#### emitEvent()
发布事件

```javascript
/**
 * 发布事件
 * @param {string} channel - 事件通道
 * @param {string} type - 事件类型
 * @param {Object} data - 事件数据
 * @returns {boolean} 是否发布成功
 */
emitEvent(channel, type, data = {})
```

#### addEventListener()
添加事件监听器

```javascript
/**
 * 添加事件监听器
 * @param {string} channel - 事件通道
 * @param {string} type - 事件类型
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addEventListener(channel, type, listener)
```

#### removeEventListener()
移除事件监听器

```javascript
/**
 * 移除事件监听器
 * @param {string} channel - 事件通道
 * @param {string} type - 事件类型
 * @param {Function} listener - 监听器函数
 */
removeEventListener(channel, type, listener)
```

#### addWildcardListener()
添加通配符事件监听器

```javascript
/**
 * 添加通配符事件监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addWildcardListener(listener)
```

#### registerComponent()
注册组件

```javascript
/**
 * 注册组件
 * @param {string} name - 组件名称
 * @param {Object} component - 组件实例
 * @returns {boolean} 是否注册成功
 */
registerComponent(name, component)
```

#### getComponent()
获取组件

```javascript
/**
 * 获取组件
 * @param {string} name - 组件名称
 * @returns {Object|null} 组件实例
 */
getComponent(name)
```

#### hasComponent()
检查组件是否已注册

```javascript
/**
 * 检查组件是否已注册
 * @param {string} name - 组件名称
 * @returns {boolean} 是否已注册
 */
hasComponent(name)
```

#### removeComponent()
移除组件

```javascript
/**
 * 移除组件
 * @param {string} name - 组件名称
 * @returns {boolean} 是否移除成功
 */
removeComponent(name)
```

#### registerPlugin()
注册插件

```javascript
/**
 * 注册插件
 * @param {string} pluginId - 插件ID
 * @param {Object} plugin - 插件对象
 * @returns {boolean} 是否注册成功
 */
registerPlugin(pluginId, plugin)
```

#### removePlugin()
移除插件

```javascript
/**
 * 移除插件
 * @param {string} pluginId - 插件ID
 * @returns {boolean} 是否移除成功
 */
removePlugin(pluginId)
```

#### getPlugin()
获取插件

```javascript
/**
 * 获取插件
 * @param {string} pluginId - 插件ID
 * @returns {Object|null} 插件对象
 */
getPlugin(pluginId)
```

#### getPerformanceReport()
获取性能报告

```javascript
/**
 * 获取性能报告
 * @returns {Object} 性能报告
 */
getPerformanceReport()
```

#### getSystemStatus()
获取系统状态

```javascript
/**
 * 获取系统状态
 * @returns {Object} 系统状态
 */
getSystemStatus()
```

### 组件接口

```javascript
/**
 * 标准组件接口
 * @typedef {Object} ComponentInterface
 * @property {Function} initialize - 初始化方法
 * @property {Function} start - 启动方法
 * @property {Function} stop - 停止方法
 * @property {Function} cleanup - 清理方法
 * @property {Function} ready - 就绪状态检查方法
 */
```

### 插件接口

```javascript
/**
 * 标准插件接口
 * @typedef {Object} PluginInterface
 * @property {Function} initialize - 初始化方法
 * @property {Function} start - 启动方法
 * @property {Function} stop - 停止方法
 * @property {Function} [onExtensionReady] - 扩展就绪时调用
 * @property {Function} [onSettingsChange] - 设置变更时调用
 * @property {Function} [onProjectChange] - 项目变更时调用
 */
```

## 使用示例

### 基本使用

#### 扩展初始化和启动
```javascript
// 创建扩展实例
const aeExtension = new AEExtension();

// 配置扩展（可选）
aeExtension.config.enableDemoMode = true; // 开启Demo模式
aeExtension.config.performanceMonitoring = true; // 启用性能监控

// 初始化扩展
const initResult = await aeExtension.initialize();
if (initResult) {
    console.log('✅ 扩展初始化成功');
} else {
    console.error('❌ 扩展初始化失败');
}

// 启动扩展（如果autoStart为false）
const startResult = await aeExtension.start();
if (startResult) {
    console.log('✅ 扩展启动成功');
} else {
    console.error('❌ 扩展启动失败');
}

// 获取系统状态
const status = aeExtension.getSystemStatus();
console.log('系统状态:', status);
```

#### 组件管理
```javascript
// 获取组件
const logManager = aeExtension.getComponent('logManager');
const settingsManager = aeExtension.getComponent('settingsManager');

// 使用组件
logManager.info('Extension is running');
const currentSettings = settingsManager.getSettings();

// 检查组件状态
console.log('Log manager ready:', aeExtension.hasComponent('logManager'));
console.log('Settings manager ready:', aeExtension.hasComponent('settingsManager'));

// 注册自定义组件
class CustomComponent {
    constructor() {
        this.name = 'CustomComponent';
        this.initialized = false;
    }
    
    async initialize() {
        console.log('Custom component initializing...');
        this.initialized = true;
    }
    
    async start() {
        console.log('Custom component starting...');
    }
    
    async stop() {
        console.log('Custom component stopping...');
    }
    
    cleanup() {
        console.log('Custom component cleaning up...');
        this.initialized = false;
    }
    
    ready() {
        return this.initialized;
    }
}

// 注册自定义组件
const customComponent = new CustomComponent();
const registerResult = aeExtension.registerComponent('customComponent', customComponent);
if (registerResult) {
    console.log('✅ 自定义组件注册成功');
    
    // 获取并使用自定义组件
    const retrievedComponent = aeExtension.getComponent('customComponent');
    console.log('Retrieved component:', retrievedComponent.name);
}
```

#### 事件处理
```javascript
// 监听系统事件
const removeSystemListener = aeExtension.addEventListener('system', 'appReady', (event) => {
    console.log('📱 应用就绪:', event.data);
    
    // 可以在这里执行应用就绪后的初始化逻辑
    onAppReady(event.data);
});

// 监听数据事件
const removeDataListener = aeExtension.addEventListener('data', 'settingsChanged', (event) => {
    console.log('⚙️ 设置变更:', event.data);
    
    // 处理设置变更
    handleSettingsChange(event.data);
});

// 监听UI事件
const removeUIListener = aeExtension.addEventListener('ui', 'userAction', (event) => {
    console.log('👤 用户操作:', event.data);
    
    // 处理用户操作
    handleUserAction(event.data);
});

// 监听通配符事件（监听所有事件）
const removeWildcardListener = aeExtension.addWildcardListener((event) => {
    console.log('📡 收到事件:', event.channel, event.type, event.data);
});

// 发布自定义事件
aeExtension.emitEvent('ui', 'showNotification', {
    message: 'Hello from extension!',
    type: 'info',
    duration: 3000
});

// 发布数据事件
aeExtension.emitEvent('data', 'importComplete', {
    importedFiles: ['file1.png', 'file2.jpg'],
    importTime: 2500,
    success: true
});

// 使用完成后移除监听器
// removeSystemListener();
// removeDataListener();
// removeUIListener();
// removeWildcardListener();
```

### 高级使用

#### 插件开发
```javascript
// 创建插件类
class SamplePlugin {
    constructor() {
        this.id = 'sample-plugin';
        this.name = 'Sample Plugin';
        this.version = '1.0.0';
        this.initialized = false;
    }
    
    async initialize() {
        console.log('🔌 插件初始化:', this.name);
        
        // 插件初始化逻辑
        this.initialized = true;
        
        // 注册插件特定的事件监听器
        this.setupEventListeners();
        
        return true;
    }
    
    async start() {
        console.log('🔌 插件启动:', this.name);
        
        // 插件启动逻辑
        this.setupUI();
        this.startBackgroundTasks();
        
        return true;
    }
    
    async stop() {
        console.log('🔌 插件停止:', this.name);
        
        // 插件停止逻辑
        this.cleanupUI();
        this.stopBackgroundTasks();
        
        return true;
    }
    
    setupEventListeners() {
        // 设置插件特定的事件监听
        console.log('🔌 设置插件事件监听');
    }
    
    setupUI() {
        // 设置插件UI
        console.log('🔌 设置插件UI');
    }
    
    startBackgroundTasks() {
        // 启动后台任务
        console.log('🔌 启动后台任务');
    }
    
    cleanupUI() {
        // 清理插件UI
        console.log('🔌 清理插件UI');
    }
    
    stopBackgroundTasks() {
        // 停止后台任务
        console.log('🔌 停止后台任务');
    }
    
    onExtensionReady() {
        console.log('🔌 插件：扩展就绪');
    }
    
    onSettingsChange(settings) {
        console.log('🔌 插件：设置变更', settings);
    }
    
    onProjectChange(project) {
        console.log('🔌 插件：项目变更', project);
    }
}

// 使用插件
const aeExtension = new AEExtension();

// 创建插件实例
const samplePlugin = new SamplePlugin();

// 注册插件
const registerPluginResult = aeExtension.registerPlugin(samplePlugin.id, samplePlugin);
if (registerPluginResult) {
    console.log('✅ 插件注册成功');
}

// 获取插件
const retrievedPlugin = aeExtension.getPlugin(samplePlugin.id);
console.log('获取的插件:', retrievedPlugin);

// 获取所有插件ID
const pluginIds = aeExtension.getPluginIds();
console.log('所有插件ID:', pluginIds);

// 启动扩展（会自动启动已注册的插件）
await aeExtension.start();
```

#### 性能监控和优化
```javascript
// 创建性能监控助手
class PerformanceMonitor {
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.monitorInterval = null;
        this.metricsHistory = [];
        this.maxHistory = 100;
    }
    
    /**
     * 开始性能监控
     */
    startMonitoring() {
        if (this.monitorInterval) {
            console.log('📊 性能监控已在运行');
            return;
        }
        
        this.monitorInterval = setInterval(() => {
            this.collectMetrics();
        }, 5000); // 每5秒收集一次
        
        console.log('📊 开始性能监控');
    }
    
    /**
     * 停止性能监控
     */
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            console.log('📊 停止性能监控');
        }
    }
    
    /**
     * 收集性能指标
     */
    collectMetrics() {
        const report = this.aeExtension.getPerformanceReport();
        
        // 添加到历史记录
        this.metricsHistory.push({
            timestamp: report.timestamp,
            metrics: report
        });
        
        // 限制历史记录大小
        if (this.metricsHistory.length > this.maxHistory) {
            this.metricsHistory.shift();
        }
        
        // 检查性能指标
        this.checkPerformanceMetrics(report);
        
        console.log('📊 性能指标:', {
            uptime: report.uptime,
            memoryUsed: report.memory.used,
            eventQueueSize: report.eventQueue.size
        });
    }
    
    /**
     * 检查性能指标
     */
    checkPerformanceMetrics(report) {
        // 检查内存使用
        if (report.memory.used && report.memory.limit) {
            const memoryUsage = report.memory.used / report.memory.limit * 100;
            if (memoryUsage > 80) {
                console.warn(`⚠️ 内存使用率过高: ${memoryUsage.toFixed(2)}%`);
                
                // 可以在这里执行内存优化操作
                this.performMemoryOptimization();
            }
        }
        
        // 检查事件队列
        if (report.eventQueue.size > report.eventQueue.maxSize * 0.8) {
            console.warn(`⚠️ 事件队列使用率过高: ${report.eventQueue.size}/${report.eventQueue.maxSize}`);
            
            // 清理旧事件
            this.cleanupOldEvents();
        }
    }
    
    /**
     * 执行内存优化
     */
    performMemoryOptimization() {
        console.log('🧹 执行内存优化...');
        
        // 清理不必要的缓存和临时数据
        // 由于JavaScript的垃圾回收机制，这里主要是建议性的操作
        
        // 强制垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
            console.log('🧹 手动垃圾回收完成');
        }
    }
    
    /**
     * 清理旧事件
     */
    cleanupOldEvents() {
        // 在实际实现中，可以清理事件队列中的旧事件
        console.log('🧹 清理旧事件...');
    }
    
    /**
     * 获取性能趋势
     */
    getPerformanceTrend() {
        if (this.metricsHistory.length === 0) {
            return null;
        }
        
        const latest = this.metricsHistory[this.metricsHistory.length - 1];
        const earliest = this.metricsHistory[0];
        
        return {
            duration: latest.timestamp - earliest.timestamp,
            memoryChange: latest.metrics.memory.used - earliest.metrics.memory.used,
            avgMemoryUsage: this.metricsHistory.reduce((sum, item) => sum + item.metrics.memory.used, 0) / this.metricsHistory.length
        };
    }
    
    /**
     * 生成性能报告
     */
    generatePerformanceReport() {
        const trend = this.getPerformanceTrend();
        const latest = this.metricsHistory[this.metricsHistory.length - 1];
        
        return {
            timestamp: Date.now(),
            trend: trend,
            currentMetrics: latest.metrics,
            historySize: this.metricsHistory.length
        };
    }
}

// 使用性能监控
const aeExtension = new AEExtension();
await aeExtension.initialize();
await aeExtension.start();

const performanceMonitor = new PerformanceMonitor(aeExtension);
performanceMonitor.startMonitoring();

// 定期输出性能报告
setInterval(() => {
    const report = performanceMonitor.generatePerformanceReport();
    console.log('📈 性能报告:', report);
}, 30000); // 每30秒输出一次
```

#### 高级事件处理
```javascript
// 创建事件处理器
class AdvancedEventHandler {
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.handlers = new Map();
        this.middleware = [];
        this.setupDefaultHandlers();
    }
    
    /**
     * 设置默认处理器
     */
    setupDefaultHandlers() {
        // 系统事件处理器
        this.addHandler('system', 'error', this.handleSystemError.bind(this));
        this.addHandler('system', 'warning', this.handleSystemWarning.bind(this));
        this.addHandler('system', 'info', this.handleSystemInfo.bind(this));
        
        // 数据事件处理器
        this.addHandler('data', 'settingsChanged', this.handleSettingsChanged.bind(this));
        this.addHandler('data', 'importComplete', this.handleImportComplete.bind(this));
        this.addHandler('data', 'exportComplete', this.handleExportComplete.bind(this));
        
        // UI事件处理器
        this.addHandler('ui', 'userAction', this.handleUserAction.bind(this));
        this.addHandler('ui', 'showNotification', this.handleShowNotification.bind(this));
    }
    
    /**
     * 添加事件处理器
     */
    addHandler(channel, eventType, handler) {
        const key = `${channel}:${eventType}`;
        
        if (!this.handlers.has(key)) {
            this.handlers.set(key, []);
        }
        
        this.handlers.get(key).push(handler);
        
        // 同时注册到扩展的事件系统
        return this.aeExtension.addEventListener(channel, eventType, (event) => {
            this.processEvent(event, handler);
        });
    }
    
    /**
     * 添加中间件
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    
    /**
     * 处理系统错误
     */
    handleSystemError(event) {
        console.error('❌ 系统错误:', event.data);
        
        // 错误处理逻辑
        this.logError(event.data);
        this.reportError(event.data);
    }
    
    /**
     * 处理系统警告
     */
    handleSystemWarning(event) {
        console.warn('⚠️ 系统警告:', event.data);
        
        // 警告处理逻辑
        this.logWarning(event.data);
    }
    
    /**
     * 处理系统信息
     */
    handleSystemInfo(event) {
        console.info('ℹ️ 系统信息:', event.data);
        
        // 信息处理逻辑
        this.logInfo(event.data);
    }
    
    /**
     * 处理设置变更
     */
    handleSettingsChanged(event) {
        console.log('⚙️ 设置变更:', event.data);
        
        // 设置变更处理逻辑
        this.updateSettings(event.data);
    }
    
    /**
     * 处理导入完成
     */
    handleImportComplete(event) {
        console.log('📥 导入完成:', event.data);
        
        // 导入完成处理逻辑
        this.importComplete(event.data);
    }
    
    /**
     * 处理导出完成
     */
    handleExportComplete(event) {
        console.log('📤 导出完成:', event.data);
        
        // 导出完成处理逻辑
        this.exportComplete(event.data);
    }
    
    /**
     * 处理用户操作
     */
    handleUserAction(event) {
        console.log('👤 用户操作:', event.data);
        
        // 用户操作处理逻辑
        this.processUserAction(event.data);
    }
    
    /**
     * 处理显示通知
     */
    handleShowNotification(event) {
        console.log('🔔 显示通知:', event.data);
        
        // 显示通知逻辑
        this.showNotification(event.data);
    }
    
    /**
     * 处理事件（应用中间件）
     */
    async processEvent(event, handler) {
        try {
            // 应用中间件
            let processedEvent = { ...event };
            
            for (const middleware of this.middleware) {
                processedEvent = await middleware(processedEvent);
                if (!processedEvent) {
                    // 中间件决定不继续处理
                    return;
                }
            }
            
            // 执行处理器
            await handler(processedEvent);
            
        } catch (error) {
            console.error('处理事件时发生错误:', error);
        }
    }
    
    /**
     * 记录错误
     */
    logError(errorData) {
        if (this.aeExtension.components.logManager) {
            this.aeExtension.components.logManager.error('系统错误', { error: errorData });
        }
    }
    
    /**
     * 记录警告
     */
    logWarning(warningData) {
        if (this.aeExtension.components.logManager) {
            this.aeExtension.components.logManager.warning('系统警告', { warning: warningData });
        }
    }
    
    /**
     * 记录信息
     */
    logInfo(infoData) {
        if (this.aeExtension.components.logManager) {
            this.aeExtension.components.logManager.info('系统信息', { info: infoData });
        }
    }
    
    /**
     * 更新设置
     */
    updateSettings(settings) {
        if (this.aeExtension.components.settingsManager) {
            // 可以在这里处理设置更新逻辑
            console.log('设置已更新:', settings);
        }
    }
    
    /**
     * 导入完成处理
     */
    importComplete(importData) {
        // 导入完成后的处理逻辑
        if (importData.success) {
            console.log('导入成功完成');
        } else {
            console.log('导入失败:', importData.error);
        }
    }
    
    /**
     * 导出完成处理
     */
    exportComplete(exportData) {
        // 导出完成后的处理逻辑
        if (exportData.success) {
            console.log('导出成功完成');
        } else {
            console.log('导出失败:', exportData.error);
        }
    }
    
    /**
     * 处理用户操作
     */
    processUserAction(actionData) {
        // 用户操作处理逻辑
        console.log('处理用户操作:', actionData);
    }
    
    /**
     * 显示通知
     */
    showNotification(notificationData) {
        // 显示通知的逻辑
        console.log('显示通知:', notificationData);
        
        // 这里可以实现实际的通知显示逻辑
        if (window.Notification && Notification.permission === 'granted') {
            new Notification(notificationData.message || '通知', {
                body: notificationData.body || '',
                icon: notificationData.icon || ''
            });
        }
    }
    
    /**
     * 报告错误
     */
    reportError(errorData) {
        // 错误报告逻辑
        console.log('报告错误:', errorData);
    }
}

// 使用高级事件处理器
const aeExtension = new AEExtension();
await aeExtension.initialize();
await aeExtension.start();

const eventHandler = new AdvancedEventHandler(aeExtension);

// 添加自定义中间件
eventHandler.addMiddleware(async (event) => {
    // 记录事件处理时间
    event.processedAt = Date.now();
    return event;
});

// 添加自定义处理器
eventHandler.addHandler('custom', 'myEvent', (event) => {
    console.log('处理自定义事件:', event);
});

// 发布测试事件
aeExtension.emitEvent('system', 'error', { message: 'Test error', code: 500 });
aeExtension.emitEvent('data', 'settingsChanged', { changedSettings: ['theme', 'language'] });