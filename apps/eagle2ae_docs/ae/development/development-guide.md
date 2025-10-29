# AE 扩展开发指南

## 概述

本指南提供 Eagle2Ae After Effects CEP 扩展的完整开发指导，包括环境搭建、开发流程、调试技巧和最佳实践。

**目标读者**: CEP 扩展开发者、After Effects 插件开发者  
**前置知识**: JavaScript、HTML/CSS、After Effects 基础  
**开发环境**: Windows 10+、macOS 10.14+

## 多面板支持架构

Eagle2Ae 扩展支持多面板架构，允许同时打开多个独立的面板实例。每个面板实例都有独立的状态管理、配置存储和通信通道，确保各面板之间的操作互不干扰。

## 多面板支持架构详解

### 1. 架构设计

Eagle2Ae 采用多面板支持架构，每个面板实例都是独立的运行环境：

```javascript
// 面板识别机制
class AEExtension {
    constructor() {
        // 识别当前面板 ID
        this.panelId = this.getPanelId(); // 'panel1', 'panel2', 或 'panel3'
        
        // 面板独立设置管理器
        this.settingsManager = new SettingsManager(this.panelId);
        
        // 面板独立状态检测器
        this.projectStatusChecker = new ProjectStatusChecker(this.csInterface, this.log.bind(this));
        
        // 面板独立文件处理器
        this.fileHandler = new FileHandler(this.settingsManager, this.csInterface, this.log.bind(this));
    }
}
```

### 2. 面板独立性实现

#### 独立设置存储
```javascript
// SettingsManager.js - 面板独立设置存储
class SettingsManager {
    constructor(panelId) {
        this.panelId = panelId;
        this.settings = this.loadSettings();
    }
    
    // 使用面板前缀隔离不同面板的设置
    getStorageKey(key) {
        return `${this.panelId}_${key}`;
    }
    
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem(this.getStorageKey('settings'));
            return savedSettings ? JSON.parse(savedSettings) : this.getDefaultSettings();
        } catch (error) {
            return this.getDefaultSettings();
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem(this.getStorageKey('settings'), JSON.stringify(this.settings));
        } catch (error) {
            console.error('保存设置失败', error);
        }
    }
}
```

#### 独立状态管理
```javascript
// ProjectStatusChecker.js - 面板独立状态检测
class ProjectStatusChecker {
    constructor(csInterface, logger, panelId) {
        this.csInterface = csInterface;
        this.logger = logger;
        this.panelId = panelId; // 每个面板有独立的状态缓存
        this.cache = new Map();
    }
    
    // 独立的缓存管理，避免面板间状态干扰
    cacheResult(key, result) {
        const cacheKey = `${this.panelId}_${key}`;
        this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
            expires: Date.now() + this.cacheTimeout
        });
    }
}
```

### 3. 面板间通信

虽然各面板独立运行，但在需要时可以通过 HTTP 轮询机制与 Eagle 插件进行协调：

```javascript
// main.js - 面板间通信支持
class AEExtension {
    constructor() {
        // 客户端ID用于Eagle插件识别不同面板实例
        this.clientId = `ae_client_${this.panelId}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    
    // 轮询获取消息时携带客户端ID
    async pollMessages() {
        const response = await fetch(`${this.eagleUrl}/messages?clientId=${this.clientId}`);
        // 处理面板特定的消息
    }
}
```

### 4. 预设文件管理

每个面板拥有独立的预设文件，确保配置隔离：

```javascript
// 预设文件名与面板ID对应
getPresetFileName() {
    const panelNumber = this.panelId.replace('panel', '');
    return `Eagle2Ae${panelNumber}.Presets`;
}
```

## 开发环境搭建

### 1. 必需软件

#### Adobe After Effects
- **版本要求**: CC 2018 或更高版本
- **推荐版本**: CC 2023 或 2024（最佳兼容性）
- **安装路径**: 记录安装路径，用于调试配置

#### Node.js 开发环境
```bash
# 安装 Node.js (推荐 LTS 版本)
node --version  # 应显示 v16.x.x 或更高

# 安装全局工具
npm install -g @adobe/cep-bundler
npm install -g cep-interface
```

#### 代码编辑器
推荐使用 **Visual Studio Code** 并安装以下扩展：
- CEP Extension Builder
- ExtendScript Debugger
- JavaScript (ES6) code snippets
- Bracket Pair Colorizer

### 2. CEP 开发环境配置

#### 启用调试模式
```bash
# Windows 注册表设置
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1

# macOS 终端设置
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

#### 配置扩展目录
```bash
# Windows 扩展目录
C:\Users\[用户名]\AppData\Roaming\Adobe\CEP\extensions\

# macOS 扩展目录
~/Library/Application Support/Adobe/CEP/extensions/
```

### 3. 项目结构设置

```
Eagle2Ae-Ae/
├── CSXS/                    # CEP 配置
│   └── manifest.xml         # 扩展清单文件
├── js/                      # JavaScript 源码
│   ├── constants/           # 常量定义
│   │   └── ImportSettings.js # 导入设置常量
│   ├── demo/                # 演示模式系统
│   │   ├── demo-apis.js     # API模拟器
│   │   ├── demo-config.json # 演示配置
│   │   ├── demo-mode.js     # 主控制器
│   │   ├── demo-network-interceptor.js # 网络拦截器
│   │   ├── demo-override.js # 数据覆盖策略
│   │   ├── demo-ui.js       # UI状态管理器
│   │   └── easter-egg.js    # 彩蛋功能
│   ├── i18n/                # 国际化支持
│   ├── services/            # 服务层
│   │   ├── FileHandler.js   # 文件处理服务
│   │   ├── PortDiscovery.js # 端口发现服务
│   │   ├── ProjectStatusChecker.js # 项目状态检测器
│   │   └── SettingsManager.js # 设置管理服务
│   ├── types/               # TypeScript类型定义
│   ├── ui/                  # UI组件
│   │   └── summary-dialog.js # 图层检测总结对话框
│   ├── utils/               # 工具函数
│   │   ├── ConfigManager.js # 配置管理器
│   │   ├── LogManager.js    # 日志管理器
│   │   └── SoundPlayer.js   # 声音播放器
│   ├── main.js              # 主应用逻辑
│   ├── polling-client.js    # HTTP轮询客户端
│   └── CSInterface.js       # CEP接口库
├── jsx/                     # ExtendScript 脚本
│   ├── hostscript.jsx       # 主 JSX 脚本
│   ├── dialog-warning.jsx   # 警告对话框脚本
│   ├── dialog-summary.jsx   # 总结对话框脚本
│   └── utils/               # JSX 工具函数
├── public/                  # 静态资源
│   ├── index.html           # 主界面文件
│   ├── logo.png             # 应用图标
│   ├── logo2.png            # 备用图标
│   └── sound/               # 音频文件
│       ├── eagle.wav
│       ├── linked.wav
│       ├── rnd_okay.wav
│       └── stop.wav
├── package.json             # 项目配置
└── README.md                # 项目说明
```

## 开发流程

### 1. 创建新功能的标准流程

#### 步骤 1: 需求分析
```javascript
/**
 * 功能需求分析模板
 * 
 * 功能名称: [功能名称]
 * 功能描述: [详细描述]
 * 用户场景: [使用场景]
 * 技术要求: [技术实现要求]
 * 性能要求: [性能指标]
 * 兼容性要求: [兼容性要求]
 */
```

#### 步骤 2: 架构设计
```javascript
// 1. 定义接口
interface NewFeatureInterface {
    initialize(): Promise<void>;
    execute(params: any): Promise<any>;
    cleanup(): void;
}

// 2. 设计数据流
// 用户操作 -> UI事件 -> 服务层 -> ExtendScript -> After Effects

// 3. 错误处理策略
// 定义错误类型、错误码、恢复机制
```

#### 步骤 3: 实现开发
```javascript
/**
 * 新功能实现模板
 */
class NewFeature {
    constructor() {
        this.logger = new Logger('NewFeature');
        this.initialized = false;
    }

    /**
     * 初始化功能
     */
    async initialize() {
        try {
            this.logger.info('初始化新功能');
            // 初始化逻辑
            this.initialized = true;
        } catch (error) {
            this.logger.error('初始化失败', error);
            throw error;
        }
    }

    /**
     * 执行功能
     */
    async execute(params) {
        if (!this.initialized) {
            throw new Error('功能未初始化');
        }

        try {
            this.logger.info('执行功能', params);
            // 功能实现逻辑
            return result;
        } catch (error) {
            this.logger.error('执行失败', error);
            throw error;
        }
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.logger.info('清理功能资源');
        this.initialized = false;
    }
}
```

### 2. 代码规范

#### JavaScript 编码规范
```javascript
/**
 * 函数命名: 使用驼峰命名法
 * 类命名: 使用帕斯卡命名法
 * 常量命名: 使用大写字母和下划线
 * 私有方法: 使用下划线前缀
 */

// 推荐的代码结构
class ExampleService {
    constructor(dependencies) {
        this._validateDependencies(dependencies);
        this.logger = dependencies.logger;
        this.config = dependencies.config;
    }

    /**
     * 公共方法：详细的 JSDoc 注释
     * @param {Object} params - 参数对象
     * @param {string} params.name - 名称
     * @param {number} params.timeout - 超时时间
     * @returns {Promise<Object>} 执行结果
     */
    async executeOperation(params) {
        // 参数验证
        this._validateParams(params);
        
        // 执行前日志
        this.logger.info('开始执行操作', params);
        
        try {
            // 主要逻辑
            const result = await this._performOperation(params);
            
            // 成功日志
            this.logger.info('操作执行成功', result);
            return result;
        } catch (error) {
            // 错误处理
            this.logger.error('操作执行失败', error);
            throw this._wrapError(error);
        }
    }

    /**
     * 私有方法：内部实现
     */
    _validateParams(params) {
        if (!params || typeof params !== 'object') {
            throw new Error('参数必须是对象');
        }
        // 更多验证逻辑...
    }

    _performOperation(params) {
        // 具体实现...
    }

    _wrapError(error) {
        // 错误包装逻辑...
        return new CustomError(error.message, error);
    }
}
```

#### ExtendScript 编码规范
```javascript
/**
 * ExtendScript 特殊注意事项
 * 1. 不支持 ES6+ 语法
 * 2. 不支持 Promise、async/await
 * 3. 使用 try-catch 进行错误处理
 * 4. 返回 JSON 字符串与前端通信
 */

function performAEOperation(params) {
    try {
        // 参数解析
        var parsedParams = JSON.parse(params);
        
        // 验证 After Effects 环境
        if (!app.project) {
            return JSON.stringify({
                success: false,
                error: 'NO_PROJECT_OPEN',
                message: '没有打开的项目'
            });
        }

        // 执行操作
        var result = executeMainLogic(parsedParams);
        
        // 返回成功结果
        return JSON.stringify({
            success: true,
            data: result
        });
        
    } catch (error) {
        // 错误处理
        return JSON.stringify({
            success: false,
            error: 'EXECUTION_ERROR',
            message: error.toString(),
            stack: error.line ? 'Line: ' + error.line : undefined
        });
    }
}

function executeMainLogic(params) {
    // 具体的 AE 操作逻辑
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        throw new Error('没有活动的合成');
    }
    
    // 执行操作...
    return {
        compName: comp.name,
        layerCount: comp.numLayers
    };
}
```

### 3. 核心服务开发

#### 文件处理服务 (FileHandler.js)
```javascript
/**
 * 文件处理服务
 * 负责处理文件导入、复制、路径管理等操作
 */
class FileHandler {
    constructor(settingsManager, logger) {
        this.settingsManager = settingsManager;
        this.logger = logger;
    }

    /**
     * 处理文件导入请求
     * @param {Object} message - 导入消息
     * @returns {Promise<Object>} 处理结果
     */
    async handleImportRequest(message) {
        try {
            this.logger.info('开始处理文件导入请求', message);
            
            // 获取当前设置
            const settings = this.settingsManager.getSettings();
            
            // 根据导入模式处理文件
            const result = await this.processFilesByMode(message.files, settings);
            
            // 调用ExtendScript导入文件
            const importResult = await this.importFilesToAE(result.files, settings);
            
            this.logger.info('文件导入完成', importResult);
            return importResult;
        } catch (error) {
            this.logger.error('文件导入失败', error);
            throw error;
        }
    }

    /**
     * 根据导入模式处理文件
     * @param {Array} files - 文件列表
     * @param {Object} settings - 导入设置
     * @returns {Promise<Object>} 处理结果
     */
    async processFilesByMode(files, settings) {
        switch (settings.mode) {
            case 'direct':
                return this.processDirectMode(files);
            case 'project_adjacent':
                return this.processProjectAdjacentMode(files, settings);
            case 'custom_folder':
                return this.processCustomFolderMode(files, settings);
            default:
                throw new Error(`未知的导入模式: ${settings.mode}`);
        }
    }
}
```

#### 项目状态检测器 (ProjectStatusChecker.js)
```javascript
/**
 * 项目状态检测器
 * 负责检测AE项目状态、Eagle连接状态等
 */
class ProjectStatusChecker {
    constructor(logger) {
        this.logger = logger;
        this.cache = new Map();
        this.cacheTimeout = 5000; // 5秒缓存
    }

    /**
     * 执行完整的项目状态检测
     * @returns {Promise<Object>} 检测结果对象
     */
    async checkProjectStatus() {
        try {
            this.logger.info('开始项目状态检测');
            
            const result = {
                timestamp: Date.now(),
                hasErrors: false,
                errors: [],
                warnings: [],
                info: {}
            };
            
            // 检测AE连接状态
            const aeStatus = await this.checkAEConnection();
            result.info.aeConnection = aeStatus;
            
            if (!aeStatus.connected) {
                result.hasErrors = true;
                result.errors.push({
                    type: 'CONNECTION_ERROR',
                    message: 'After Effects连接失败'
                });
                return result;
            }
            
            // 检测项目状态
            const projectStatus = await this.checkProjectState();
            result.info.project = projectStatus;
            
            if (!projectStatus.hasProject) {
                result.hasErrors = true;
                result.errors.push({
                    type: 'NO_PROJECT',
                    message: '未检测到打开的项目'
                });
            }
            
            this.logger.info('项目状态检测完成', result);
            return result;
        } catch (error) {
            this.logger.error('项目状态检测失败', error);
            throw error;
        }
    }
}
```

#### 设置管理器 (SettingsManager.js)
```javascript
/**
 * 设置管理器
 * 负责管理所有用户设置和配置
 */
class SettingsManager {
    constructor(logger) {
        this.logger = logger;
        this.settings = this.loadSettings();
    }

    /**
     * 获取当前设置
     * @returns {Object} 当前设置
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 更新设置字段
     * @param {string} key - 设置键
     * @param {any} value - 设置值
     * @param {boolean} save - 是否保存到存储
     */
    updateField(key, value, save = true) {
        this.settings[key] = value;
        
        if (save) {
            this.saveSettings();
        }
        
        this.logger.info(`设置更新: ${key} = ${value}`);
    }

    /**
     * 加载设置
     * @returns {Object} 设置对象
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('eagle2ae-settings');
            if (savedSettings) {
                return JSON.parse(savedSettings);
            }
        } catch (error) {
            this.logger.error('加载设置失败', error);
        }
        
        // 返回默认设置
        return this.getDefaultSettings();
    }

    /**
     * 保存设置
     */
    saveSettings() {
        try {
            localStorage.setItem('eagle2ae-settings', JSON.stringify(this.settings));
            this.logger.info('设置已保存');
        } catch (error) {
            this.logger.error('保存设置失败', error);
        }
    }

    /**
     * 获取默认设置
     * @returns {Object} 默认设置
     */
    getDefaultSettings() {
        return {
            mode: 'project_adjacent',
            projectAdjacentFolder: 'Eagle_Assets',
            customFolderPath: '',
            addToComposition: false,
            timelineOptions: {
                placement: 'current_time'
            }
        };
    }
}
```

## 调试技巧

### 1. CEP 扩展调试

#### Chrome DevTools 调试
```javascript
// 1. 启用调试模式后，在 Chrome 中访问：
// http://localhost:8092/

// 2. 在代码中添加调试断点
function debugExample() {
    debugger; // 这里会触发断点
    
    console.log('调试信息');
    console.table(data); // 表格形式显示数据
    console.group('分组日志');
    console.log('子项 1');
    console.log('子项 2');
    console.groupEnd();
}

// 3. 使用 console.trace() 查看调用栈
function traceExample() {
    console.trace('调用栈追踪');
}
```

#### 日志系统调试
```javascript
/**
 * 增强的日志系统 (LogManager.js)
 */
class LogManager {
    constructor(prefix = '') {
        this.prefix = prefix;
        this.logLevel = this._getLogLevel();
    }

    debug(message, data = null) {
        if (this.logLevel <= 0) {
            this._log('DEBUG', message, data);
        }
    }

    info(message, data = null) {
        if (this.logLevel <= 1) {
            this._log('INFO', message, data);
        }
    }

    warn(message, data = null) {
        if (this.logLevel <= 2) {
            this._log('WARN', message, data);
        }
    }

    error(message, data = null) {
        if (this.logLevel <= 3) {
            this._log('ERROR', message, data);
        }
    }

    _log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${this.prefix ? `[${this.prefix}] ` : ''}${message}`;
        
        // 根据日志级别使用不同颜色
        let style = '';
        switch (level) {
            case 'DEBUG': style = 'color: #888'; break;
            case 'INFO': style = 'color: #007acc'; break;
            case 'WARN': style = 'color: #ff8c00'; break;
            case 'ERROR': style = 'color: #ff0000'; break;
        }
        
        if (data) {
            console.group(`%c${logMessage}`, style);
            console.log(data);
            console.groupEnd();
        } else {
            console.log(`%c${logMessage}`, style);
        }
    }

    _getLogLevel() {
        // 从配置获取日志级别
        try {
            const settings = JSON.parse(localStorage.getItem('eagle2ae-settings') || '{}');
            return settings.logLevel !== undefined ? settings.logLevel : 1;
        } catch (error) {
            return 1; // 默认INFO级别
        }
    }
}
```

### 2. ExtendScript 调试

#### ExtendScript Toolkit 调试
```javascript
/**
 * ExtendScript 调试技巧
 */

// 1. 使用 $.writeln() 输出调试信息
function debugExtendScript() {
    $.writeln('调试信息: ' + new Date());
    
    // 2. 使用 try-catch 捕获错误
    try {
        // 可能出错的代码
        var result = riskyOperation();
        $.writeln('操作成功: ' + result);
    } catch (error) {
        $.writeln('错误: ' + error.toString());
        $.writeln('行号: ' + error.line);
    }
}

// 3. 创建调试对话框
function showDebugDialog(message, data) {
    var dialog = new Window('dialog', '调试信息');
    dialog.orientation = 'column';
    dialog.alignChildren = 'left';
    
    dialog.add('statictext', undefined, '消息: ' + message);
    
    if (data) {
        var dataText = dialog.add('edittext', undefined, JSON.stringify(data, null, 2), {multiline: true});
        dataText.preferredSize.width = 400;
        dataText.preferredSize.height = 200;
    }
    
    var buttonGroup = dialog.add('group');
    buttonGroup.add('button', undefined, '确定');
    
    dialog.show();
}

// 4. 性能测试
function performanceTest(func, iterations) {
    var startTime = new Date().getTime();
    
    for (var i = 0; i < iterations; i++) {
        func();
    }
    
    var endTime = new Date().getTime();
    var duration = endTime - startTime;
    
    $.writeln('性能测试结果: ' + duration + 'ms (' + iterations + ' 次迭代)');
    return duration;
}
```

### 3. 演示模式调试

#### 演示模式日志
```javascript
/**
 * 演示模式调试 (demo-mode.js)
 */
class DemoMode {
    constructor() {
        this.logger = new LogManager('DemoMode');
        this.isDemoMode = this._detectDemoMode();
    }

    _detectDemoMode() {
        // 检测是否在CEP环境中
        const isCEP = !!(window.__adobe_cep__ || 
                        (window.cep && window.cep.process) || 
                        (typeof CSInterface !== 'undefined'));
        
        // 在非CEP环境中自动启用演示模式
        if (!isCEP) {
            this.logger.info('检测到非CEP环境，自动启用演示模式');
            return true;
        }
        
        // 检查是否手动启用了演示模式
        const demoMode = localStorage.getItem('eagle2ae-demo-mode');
        if (demoMode === 'true') {
            this.logger.info('检测到手动启用的演示模式');
            return true;
        }
        
        return false;
    }

    // 其他演示模式功能...
}
```

## 性能优化

### 1. 前端性能优化

#### 代码分割和懒加载
```javascript
/**
 * 模块懒加载实现 (ModuleLoader.js)
 */
class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
    }

    async loadModule(moduleName) {
        // 如果已经加载，直接返回
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        // 如果正在加载，返回加载 Promise
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        // 开始加载模块
        const loadingPromise = this._loadModuleScript(moduleName);
        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            const module = await loadingPromise;
            this.loadedModules.set(moduleName, module);
            this.loadingPromises.delete(moduleName);
            return module;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw error;
        }
    }

    async _loadModuleScript(moduleName) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `./js/modules/${moduleName}.js`;
            
            script.onload = () => {
                // 假设模块导出到全局变量
                const module = window[moduleName];
                if (module) {
                    resolve(module);
                } else {
                    reject(new Error(`模块 ${moduleName} 未正确导出`));
                }
            };
            
            script.onerror = () => {
                reject(new Error(`加载模块 ${moduleName} 失败`));
            };
            
            document.head.appendChild(script);
        });
    }
}

// 使用示例
const moduleLoader = new ModuleLoader();

async function loadFeatureOnDemand(featureName) {
    try {
        const feature = await moduleLoader.loadModule(featureName);
        return new feature();
    } catch (error) {
        console.error('功能加载失败', error);
        throw error;
    }
}
```

#### 缓存机制优化
```javascript
/**
 * 缓存管理器 (CacheManager.js)
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.timers = new Map();
    }

    /**
     * 设置缓存项
     * @param {string} key - 缓存键
     * @param {any} value - 缓存值
     * @param {number} ttl - 过期时间（毫秒）
     */
    set(key, value, ttl = 300000) { // 默认5分钟
        // 清除已存在的定时器
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }
        
        // 设置缓存值
        this.cache.set(key, {
            value: value,
            timestamp: Date.now()
        });
        
        // 设置过期定时器
        const timer = setTimeout(() => {
            this.cache.delete(key);
            this.timers.delete(key);
        }, ttl);
        
        this.timers.set(key, timer);
    }

    /**
     * 获取缓存项
     * @param {string} key - 缓存键
     * @returns {any} 缓存值或undefined
     */
    get(key) {
        const item = this.cache.get(key);
        if (item) {
            return item.value;
        }
        return undefined;
    }

    /**
     * 检查缓存项是否存在
     * @param {string} key - 缓存键
     * @returns {boolean} 是否存在
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * 删除缓存项
     * @param {string} key - 缓存键
     */
    delete(key) {
        this.cache.delete(key);
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
    }

    /**
     * 清空所有缓存
     */
    clear() {
        this.cache.clear();
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers.clear();
    }
}
```

### 2. ExtendScript 性能优化

#### 批量操作优化
```javascript
/**
 * ExtendScript 批量操作优化 (hostscript.jsx)
 */
function optimizedBatchImport(filePaths) {
    var startTime = new Date().getTime();
    
    // 1. 禁用撤销功能以提高性能
    app.beginUndoGroup('批量导入文件');
    
    try {
        // 2. 批量创建导入项
        var importedItems = [];
        var importOptions = new ImportOptions();
        importOptions.canImportAs = ImportAsType.FOOTAGE;
        
        for (var i = 0; i < filePaths.length; i++) {
            var file = new File(filePaths[i]);
            if (file.exists) {
                var item = app.project.importFile(importOptions, file);
                importedItems.push(item);
            }
        }
        
        // 3. 批量组织到文件夹
        if (importedItems.length > 0) {
            var folder = app.project.items.addFolder('Eagle Import ' + new Date().getTime());
            for (var j = 0; j < importedItems.length; j++) {
                importedItems[j].parentFolder = folder;
            }
        }
        
        var endTime = new Date().getTime();
        $.writeln('批量导入完成，耗时: ' + (endTime - startTime) + 'ms');
        
        return {
            success: true,
            imported: importedItems.length,
            duration: endTime - startTime
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.toString()
        };
    } finally {
        // 4. 恢复撤销功能
        app.endUndoGroup();
    }
}

#### 文件路径优化
```javascript
/**
 * 文件路径处理优化 (path-utils.js)
 */
class PathUtils {
    /**
     * 规范化文件路径
     * @param {string} path - 原始路径
     * @returns {string} 规范化后的路径
     */
    static normalizePath(path) {
        if (!path) return '';
        
        // 统一路径分隔符
        let normalized = path.replace(/\\/g, '/');
        
        // 移除多余的路径分隔符
        normalized = normalized.replace(/\/+/g, '/');
        
        // 处理相对路径
        normalized = normalized.replace(/\/\.\//g, '/');
        
        // 移除末尾的路径分隔符
        if (normalized.length > 1 && normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
        
        return normalized;
    }

    /**
     * 获取文件扩展名
     * @param {string} filename - 文件名
     * @returns {string} 扩展名（小写）
     */
    static getFileExtension(filename) {
        if (!filename) return '';
        
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) return '';
        
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    /**
     * 获取文件名（不包含路径）
     * @param {string} path - 完整路径
     * @returns {string} 文件名
     */
    static getFileName(path) {
        if (!path) return '';
        
        const normalized = this.normalizePath(path);
        const parts = normalized.split('/');
        return parts[parts.length - 1];
    }
}
```

## 测试策略

### 1. 单元测试

#### JavaScript 单元测试
```javascript
/**
 * 简单的测试框架
 */
class SimpleTestFramework {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    /**
     * 定义测试用例
     */
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * 运行所有测试
     */
    async runAll() {
        console.log('开始运行测试...');
        
        for (const test of this.tests) {
            try {
                await test.testFunction();
                this.results.push({ name: test.name, status: 'PASS' });
                console.log(`✓ ${test.name}`);
            } catch (error) {
                this.results.push({ 
                    name: test.name, 
                    status: 'FAIL', 
                    error: error.message 
                });
                console.error(`✗ ${test.name}: ${error.message}`);
            }
        }
        
        this._printSummary();
    }

    /**
     * 断言函数
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || '断言失败');
        }
    }

    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `期望 ${expected}，实际 ${actual}`);
        }
    }

    assertThrows(func, message) {
        try {
            func();
            throw new Error(message || '期望抛出异常，但没有');
        } catch (error) {
            // 预期的异常
        }
    }

    _printSummary() {
        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        
        console.log(`\n测试完成: ${passed} 通过, ${failed} 失败`);
        
        if (failed > 0) {
            console.log('\n失败的测试:');
            this.results
                .filter(r => r.status === 'FAIL')
                .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
        }
    }
}

// 测试示例
const testFramework = new SimpleTestFramework();

testFramework.test('HTTP 轮询客户端初始化', () => {
    const client = new PollingClient('http://localhost:8080', 'client123');
    testFramework.assert(client.url === 'http://localhost:8080', 'URL 设置错误');
    testFramework.assert(client.interval === 1000, '轮询间隔设置错误');
});

// 运行测试
testFramework.runAll();
```

## 部署和发布

### 1. 构建流程

#### 自动化构建脚本
```javascript
/**
 * 构建脚本 (build.js)
 */
const fs = require('fs');
const path = require('path');

class BuildTool {
    constructor() {
        this.buildDir = './build';
        this.sourceDir = './src';
    }

    /**
     * 执行完整构建
     */
    async build() {
        console.log('开始构建 Eagle2Ae CEP 扩展...');
        
        try {
            // 1. 清理构建目录
            await this.clean();
            
            // 2. 复制源文件
            await this.copySource();
            
            // 3. 处理配置文件
            await this.processConfig();
            
            // 4. 压缩资源
            await this.compressAssets();
            
            console.log('构建完成!');
            
        } catch (error) {
            console.error('构建失败:', error);
            process.exit(1);
        }
    }

    async clean() {
        console.log('清理构建目录...');
        if (fs.existsSync(this.buildDir)) {
            fs.rmSync(this.buildDir, { recursive: true });
        }
        fs.mkdirSync(this.buildDir, { recursive: true });
    }

    async copySource() {
        console.log('复制源文件...');
        this.copyRecursive(this.sourceDir, this.buildDir);
    }

    copyRecursive(src, dest) {
        const stats = fs.statSync(src);
        
        if (stats.isDirectory()) {
            fs.mkdirSync(dest, { recursive: true });
            const files = fs.readdirSync(src);
            
            files.forEach(file => {
                this.copyRecursive(
                    path.join(src, file),
                    path.join(dest, file)
                );
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    }
}
```

## 最佳实践总结

### 1. 代码质量
- 使用 TypeScript 或 JSDoc 进行类型注释
- 实施代码审查流程
- 使用 ESLint 进行代码规范检查
- 编写全面的单元测试

### 2. 性能优化
- 实施懒加载和代码分割
- 优化网络通信（批处理、压缩）
- 合理使用缓存机制
- 监控内存使用情况

### 3. 错误处理
- 实施统一的错误处理策略
- 提供用户友好的错误信息
- 记录详细的错误日志
- 实现错误恢复机制

### 4. 用户体验
- 提供清晰的操作反馈
- 实现进度指示器
- 支持操作撤销
- 优化界面响应速度

### 5. 维护性
- 保持代码模块化
- 编写清晰的文档
- 使用版本控制
- 定期重构和优化

---

**相关文档**:
- [API 参考手册](../api/api-reference.md)
- [JSX 脚本开发](./jsx-development.md)
- [调试指南](./debugging-guide.md)