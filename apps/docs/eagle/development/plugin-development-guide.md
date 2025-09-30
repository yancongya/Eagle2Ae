# Eagle 插件开发指南

## 概述

本文档提供 Eagle2Ae Eagle 插件的完整开发指南，包括开发环境搭建、插件架构理解、核心功能实现和调试部署流程。

## 开发环境搭建

### 系统要求

#### 硬件要求
- **CPU**: Intel i5 或 AMD Ryzen 5 以上
- **内存**: 8GB RAM 以上（推荐 16GB）
- **存储**: 至少 10GB 可用空间
- **网络**: 稳定的互联网连接

#### 软件要求
- **操作系统**: 
  - Windows 10/11 (64-bit)
  - macOS 10.14+ 
  - Ubuntu 18.04+ 或其他 Linux 发行版
- **Eagle**: 版本 3.0 或更高
- **Node.js**: 版本 16.0 或更高
- **npm**: 版本 8.0 或更高（随 Node.js 安装）

### 开发工具安装

#### 1. 安装 Node.js 和 npm

**Windows**:
```bash
# 使用 Chocolatey
choco install nodejs

# 或下载安装包
# 访问 https://nodejs.org/ 下载 LTS 版本
```

**macOS**:
```bash
# 使用 Homebrew
brew install node

# 或使用 MacPorts
sudo port install nodejs18
```

**Linux (Ubuntu/Debian)**:
```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### 2. 安装开发工具

```bash
# 全局安装开发工具
npm install -g nodemon
npm install -g eslint
npm install -g prettier
npm install -g pm2
```

#### 3. 配置代码编辑器

**推荐使用 Visual Studio Code**:

```bash
# 安装 VS Code 扩展
code --install-extension ms-vscode.vscode-node-debug2
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
```

**VS Code 配置文件** (`.vscode/settings.json`):
```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "eslint.autoFixOnSave": true,
    "javascript.preferences.quoteStyle": "single",
    "typescript.preferences.quoteStyle": "single",
    "files.associations": {
        "*.js": "javascript"
    },
    "emmet.includeLanguages": {
        "javascript": "javascriptreact"
    }
}
```

### 项目初始化

#### 1. 创建项目目录

```bash
# 创建项目根目录
mkdir eagle2ae-eagle-plugin
cd eagle2ae-eagle-plugin

# 初始化 npm 项目
npm init -y
```

#### 2. 安装依赖包

```bash
# 核心依赖
npm install ws sqlite3 chokidar node-fetch

# 开发依赖
npm install --save-dev nodemon eslint prettier jest

# 可选依赖
npm install lodash moment uuid
```

#### 3. 创建项目结构

```bash
# 创建目录结构
mkdir -p src/{services,utils,database,clipboard,config}
mkdir -p tests/{unit,integration}
mkdir -p docs
mkdir -p logs

# 创建基础文件
touch src/index.js
touch src/plugin.js
touch .eslintrc.json
touch .prettierrc
touch .gitignore
touch README.md
```

**实际项目结构**:
```
Eagle2Ae-Eagle/
├── js/                       # JavaScript 核心逻辑
│   ├── plugin.js             # 主插件类
│   ├── websocket-server.js   # WebSocket 服务器
│   ├── websocket-protocol.js # 通信协议处理
│   ├── websocket-eagle-compatible.js # Eagle 兼容层
│   ├── clipboard-handler.js  # 剪贴板处理
│   ├── compatibility-layer.js # 兼容性层
│   ├── dynamic-port-allocator.js # 动态端口分配
│   ├── clipboard/            # 剪贴板模块
│   │   └── clipboard-monitor.js
│   ├── database/             # 数据库操作
│   │   ├── eagle-database.js
│   │   └── query-builder.js
│   └── utils/                # 工具函数
│       ├── file-utils.js
│       ├── path-utils.js
│       └── validation.js
├── manifest.json             # Eagle 插件配置
├── package.json              # Node.js 依赖管理
├── index.html                # 插件主界面
├── service.html              # 服务页面
├── logo.png                  # 插件图标
└── README.md                 # 项目说明
```

## 核心架构理解

### 插件架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    Eagle2Ae Eagle Plugin                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   WebSocket     │  │   File Info     │  │   Clipboard     │ │
│  │    Server       │  │   Collector     │  │    Monitor      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │     Eagle       │  │    Config       │  │     Logger      │ │
│  │   Database      │  │   Manager       │  │    Service      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                        Plugin Core                          │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件说明

#### 1. Plugin Core（插件核心）
- **职责**: 插件生命周期管理、组件协调
- **文件**: `src/plugin.js`
- **功能**: 初始化、启动、停止、状态管理

#### 2. WebSocket Server（WebSocket 服务器）
- **职责**: 与 AE 扩展通信
- **文件**: `src/services/websocket-server.js`
- **功能**: 消息处理、连接管理、广播

#### 3. Eagle Database（Eagle 数据库）
- **职责**: Eagle 库数据访问
- **文件**: `src/database/eagle-database.js`
- **功能**: 查询项目、文件夹、标签

#### 4. File Info Collector（文件信息收集器）
- **职责**: 收集文件详细信息
- **文件**: `src/services/file-collector.js`
- **功能**: 文件元数据、校验和、验证

#### 5. Clipboard Monitor（剪贴板监控）
- **职责**: 监控剪贴板变化
- **文件**: `src/clipboard/clipboard-monitor.js`
- **功能**: 剪贴板内容检测、事件触发

## 核心功能实现

### 1. 插件主类实现

#### 创建主插件类 (`src/plugin.js`)

```javascript
const WebSocketServer = require('./services/websocket-server');
const EagleDatabase = require('./database/eagle-database');
const FileCollector = require('./services/file-collector');
const ClipboardMonitor = require('./clipboard/clipboard-monitor');
const ConfigManager = require('./config/config-manager');
const Logger = require('./services/logger');
const EventEmitter = require('events');

/**
 * Eagle2Ae Eagle 插件主类
 */
class EaglePlugin extends EventEmitter {
    constructor(options = {}) {
        super();
        
        // 初始化配置
        this.config = new ConfigManager(options.configPath);
        
        // 初始化日志
        this.logger = new Logger({
            level: this.config.get('logging.level', 'info'),
            file: this.config.get('logging.file', true)
        });
        
        // 插件状态
        this.state = {
            initialized: false,
            running: false,
            startTime: null,
            version: '1.0.0'
        };
        
        // 初始化组件
        this.initializeComponents();
        
        // 绑定事件处理器
        this.bindEventHandlers();
    }
    
    /**
     * 初始化所有组件
     */
    initializeComponents() {
        try {
            // WebSocket 服务器
            this.webServer = new WebSocketServer({
                port: this.config.get('server.port', 8080),
                host: this.config.get('server.host', 'localhost')
            });
            
            // Eagle 数据库
            this.database = new EagleDatabase({
                libraryPath: this.config.get('eagle.libraryPath'),
                autoConnect: this.config.get('eagle.autoConnect', true)
            });
            
            // 文件信息收集器
            this.fileCollector = new FileCollector({
                includeMetadata: this.config.get('fileCollector.includeMetadata', true),
                includeChecksum: this.config.get('fileCollector.includeChecksum', false)
            });
            
            // 剪贴板监控器
            this.clipboardMonitor = new ClipboardMonitor({
                interval: this.config.get('clipboard.interval', 1000),
                autoStart: this.config.get('clipboard.autoStart', false)
            });
            
            this.logger.info('组件初始化完成');
            
        } catch (error) {
            this.logger.error('组件初始化失败', { error: error.message });
            throw error;
        }
    }
    
    /**
     * 绑定事件处理器
     */
    bindEventHandlers() {
        // WebSocket 服务器事件
        this.webServer.on('connection:new', (connection) => {
            this.logger.info('新客户端连接', { connectionId: connection.id });
            this.emit('connection:new', connection);
        });
        
        this.webServer.on('connection:closed', (connection) => {
            this.logger.info('客户端断开连接', { connectionId: connection.id });
            this.emit('connection:closed', connection);
        });
        
        // 数据库事件
        this.database.on('connected', () => {
            this.logger.info('Eagle 数据库连接成功');
            this.emit('database:connected');
        });
        
        this.database.on('selection:changed', (items) => {
            this.logger.debug('Eagle 选择变更', { count: items.length });
            this.handleSelectionChanged(items);
        });
        
        // 剪贴板事件
        this.clipboardMonitor.on('changed', (content) => {
            this.logger.debug('剪贴板内容变更', { type: content.type });
            this.handleClipboardChanged(content);
        });
        
        // 错误处理
        this.webServer.on('error', (error) => {
            this.logger.error('WebSocket 服务器错误', { error: error.message });
        });
        
        this.database.on('error', (error) => {
            this.logger.error('数据库错误', { error: error.message });
        });
    }
    
    /**
     * 初始化插件
     */
    async initialize() {
        try {
            this.logger.info('开始初始化插件');
            
            // 加载配置
            await this.config.load();
            
            // 连接数据库
            await this.database.connect();
            
            // 注册消息处理器
            this.registerMessageHandlers();
            
            this.state.initialized = true;
            this.logger.info('插件初始化完成');
            
            this.emit('initialized', {
                version: this.state.version,
                config: this.config.getAll()
            });
            
            return {
                success: true,
                version: this.state.version,
                components: {
                    webServer: this.webServer.getStatus(),
                    database: this.database.getStatus(),
                    fileCollector: true,
                    clipboardMonitor: this.clipboardMonitor.isRunning()
                }
            };
            
        } catch (error) {
            this.logger.error('插件初始化失败', { error: error.message });
            throw error;
        }
    }
    
    /**
     * 启动插件
     */
    async start() {
        try {
            if (!this.state.initialized) {
                await this.initialize();
            }
            
            this.logger.info('启动插件服务');
            
            // 启动 WebSocket 服务器
            await this.webServer.start();
            
            // 启动剪贴板监控（如果配置启用）
            if (this.config.get('clipboard.enabled', true)) {
                await this.clipboardMonitor.start();
            }
            
            this.state.running = true;
            this.state.startTime = new Date();
            
            this.logger.info('插件启动完成', {
                port: this.webServer.port,
                startTime: this.state.startTime
            });
            
            this.emit('started', {
                port: this.webServer.port,
                startTime: this.state.startTime
            });
            
        } catch (error) {
            this.logger.error('插件启动失败', { error: error.message });
            throw error;
        }
    }
    
    /**
     * 停止插件
     */
    async stop() {
        try {
            this.logger.info('停止插件服务');
            
            // 停止剪贴板监控
            if (this.clipboardMonitor.isRunning()) {
                await this.clipboardMonitor.stop();
            }
            
            // 停止 WebSocket 服务器
            if (this.webServer.isRunning()) {
                await this.webServer.stop();
            }
            
            // 断开数据库连接
            if (this.database.isConnected()) {
                await this.database.disconnect();
            }
            
            this.state.running = false;
            
            this.logger.info('插件停止完成');
            this.emit('stopped');
            
        } catch (error) {
            this.logger.error('插件停止失败', { error: error.message });
            throw error;
        }
    }
    
    /**
     * 获取插件状态
     */
    getStatus() {
        return {
            ...this.state,
            uptime: this.state.startTime ? 
                Date.now() - this.state.startTime.getTime() : 0,
            components: {
                webServer: this.webServer.getStatus(),
                database: this.database.getStatus(),
                clipboardMonitor: {
                    running: this.clipboardMonitor.isRunning(),
                    lastCheck: this.clipboardMonitor.getLastCheck()
                }
            }
        };
    }
    
    /**
     * 注册消息处理器
     */
    registerMessageHandlers() {
        // 文件传输处理
        this.webServer.registerMessageHandler('file_transfer', 
            this.handleFileTransfer.bind(this));
        
        // Eagle 查询处理
        this.webServer.registerMessageHandler('eagle_query', 
            this.handleEagleQuery.bind(this));
        
        // 状态查询处理
        this.webServer.registerMessageHandler('status_query', 
            this.handleStatusQuery.bind(this));
        
        // 文件信息请求处理
        this.webServer.registerMessageHandler('file_info_request', 
            this.handleFileInfoRequest.bind(this));
    }
    
    /**
     * 处理文件传输请求
     */
    async handleFileTransfer(message, connection) {
        try {
            const { files, settings } = message.data;
            
            this.logger.info('处理文件传输请求', {
                fileCount: files.length,
                connectionId: connection.id
            });
            
            // 验证文件
            const validationResults = await Promise.all(
                files.map(file => this.fileCollector.validateFile(file.path))
            );
            
            const validFiles = files.filter((file, index) => 
                validationResults[index].valid
            );
            
            // 收集文件信息
            const fileInfos = await this.fileCollector.collectBatchFileInfo(
                validFiles.map(file => file.path),
                {
                    includeMetadata: settings.includeMetadata !== false,
                    parallel: true
                }
            );
            
            return {
                type: 'file_transfer_response',
                data: {
                    status: 'success',
                    processed: validFiles.length,
                    failed: files.length - validFiles.length,
                    files: fileInfos
                }
            };
            
        } catch (error) {
            this.logger.error('文件传输处理失败', {
                error: error.message,
                connectionId: connection.id
            });
            
            return {
                type: 'error',
                data: {
                    code: 'FILE_TRANSFER_FAILED',
                    message: '文件传输处理失败',
                    details: error.message
                }
            };
        }
    }
    
    /**
     * 处理 Eagle 查询请求
     */
    async handleEagleQuery(message, connection) {
        try {
            const { queryType, criteria } = message.data;
            
            let result;
            
            switch (queryType) {
                case 'selected_items':
                    result = await this.database.getSelectedItems(criteria);
                    break;
                    
                case 'search':
                    result = await this.database.searchItems(criteria.searchCriteria, criteria.options);
                    break;
                    
                case 'folders':
                    result = await this.database.getFolders(criteria);
                    break;
                    
                case 'tags':
                    result = await this.database.getTags(criteria);
                    break;
                    
                case 'library_info':
                    result = await this.database.getLibraryInfo();
                    break;
                    
                default:
                    throw new Error(`不支持的查询类型: ${queryType}`);
            }
            
            return {
                type: 'eagle_query_response',
                data: {
                    queryType,
                    result,
                    timestamp: new Date().toISOString()
                }
            };
            
        } catch (error) {
            this.logger.error('Eagle 查询失败', {
                error: error.message,
                queryType: message.data.queryType
            });
            
            return {
                type: 'error',
                data: {
                    code: 'EAGLE_QUERY_FAILED',
                    message: 'Eagle 查询失败',
                    details: error.message
                }
            };
        }
    }
    
    /**
     * 处理状态查询请求
     */
    async handleStatusQuery(message, connection) {
        try {
            const status = this.getStatus();
            
            return {
                type: 'status_response',
                data: status
            };
            
        } catch (error) {
            return {
                type: 'error',
                data: {
                    code: 'STATUS_QUERY_FAILED',
                    message: '状态查询失败',
                    details: error.message
                }
            };
        }
    }
    
    /**
     * 处理文件信息请求
     */
    async handleFileInfoRequest(message, connection) {
        try {
            const { filePaths, options } = message.data;
            
            const fileInfos = await this.fileCollector.collectBatchFileInfo(
                filePaths, 
                options
            );
            
            return {
                type: 'file_info_response',
                data: {
                    files: fileInfos,
                    requestId: message.messageId
                }
            };
            
        } catch (error) {
            return {
                type: 'error',
                data: {
                    code: 'FILE_INFO_FAILED',
                    message: '文件信息获取失败',
                    details: error.message
                }
            };
        }
    }
    
    /**
     * 处理 Eagle 选择变更
     */
    async handleSelectionChanged(items) {
        try {
            // 收集选中项目的详细信息
            const detailedItems = await Promise.all(
                items.map(async (item) => {
                    const fileInfo = await this.fileCollector.collectFileInfo(item.path);
                    return {
                        ...item,
                        fileInfo
                    };
                })
            );
            
            // 广播到所有连接的客户端
            this.webServer.broadcast('eagle_selection_changed', {
                items: detailedItems,
                count: detailedItems.length,
                timestamp: new Date().toISOString()
            });
            
            this.emit('selection:changed', detailedItems);
            
        } catch (error) {
            this.logger.error('处理选择变更失败', { error: error.message });
        }
    }
    
    /**
     * 处理剪贴板变更
     */
    async handleClipboardChanged(content) {
        try {
            // 如果是文件类型，广播到客户端
            if (content.type === 'files') {
                this.webServer.broadcast('clipboard_files_changed', {
                    files: content.content,
                    timestamp: content.timestamp
                });
            }
            
            this.emit('clipboard:changed', content);
            
        } catch (error) {
            this.logger.error('处理剪贴板变更失败', { error: error.message });
        }
    }
}

module.exports = EaglePlugin;
```

### 2. 入口文件实现

#### 创建入口文件 (`src/index.js`)

```javascript
const EaglePlugin = require('./plugin');
const path = require('path');
const fs = require('fs');

/**
 * 插件入口点
 */
class PluginBootstrap {
    constructor() {
        this.plugin = null;
        this.configPath = this.findConfigPath();
    }
    
    /**
     * 查找配置文件路径
     */
    findConfigPath() {
        const possiblePaths = [
            path.join(process.cwd(), 'config.json'),
            path.join(process.cwd(), 'eagle2ae.config.json'),
            path.join(require.os().homedir(), '.eagle2ae', 'config.json')
        ];
        
        for (const configPath of possiblePaths) {
            if (fs.existsSync(configPath)) {
                return configPath;
            }
        }
        
        return null;
    }
    
    /**
     * 启动插件
     */
    async start() {
        try {
            console.log('Eagle2Ae Eagle Plugin 启动中...');
            
            // 创建插件实例
            this.plugin = new EaglePlugin({
                configPath: this.configPath
            });
            
            // 监听插件事件
            this.plugin.on('initialized', (info) => {
                console.log('插件初始化完成:', info.version);
            });
            
            this.plugin.on('started', (info) => {
                console.log(`插件启动成功，监听端口: ${info.port}`);
                console.log('WebSocket URL: ws://localhost:' + info.port);
            });
            
            this.plugin.on('connection:new', (connection) => {
                console.log('新客户端连接:', connection.clientType || 'unknown');
            });
            
            this.plugin.on('error', (error) => {
                console.error('插件错误:', error);
            });
            
            // 启动插件
            await this.plugin.start();
            
            // 设置优雅关闭
            this.setupGracefulShutdown();
            
        } catch (error) {
            console.error('插件启动失败:', error.message);
            process.exit(1);
        }
    }
    
    /**
     * 设置优雅关闭
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\n收到 ${signal} 信号，正在关闭插件...`);
            
            try {
                if (this.plugin) {
                    await this.plugin.stop();
                }
                console.log('插件已安全关闭');
                process.exit(0);
            } catch (error) {
                console.error('关闭插件时出错:', error.message);
                process.exit(1);
            }
        };
        
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        
        // Windows 支持
        if (process.platform === 'win32') {
            const rl = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            rl.on('SIGINT', () => {
                process.emit('SIGINT');
            });
        }
    }
}

// 如果直接运行此文件，启动插件
if (require.main === module) {
    const bootstrap = new PluginBootstrap();
    bootstrap.start().catch(error => {
        console.error('启动失败:', error);
        process.exit(1);
    });
}

module.exports = PluginBootstrap;
```

### 3. 配置管理实现

#### 创建配置管理器 (`src/config/config-manager.js`)

```javascript
const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');

/**
 * 配置管理器
 */
class ConfigManager extends EventEmitter {
    constructor(configPath) {
        super();
        
        this.configPath = configPath;
        this.config = {};
        this.defaults = require('./default');
        this.watchers = new Map();
    }
    
    /**
     * 加载配置
     */
    async load() {
        try {
            // 加载默认配置
            this.config = { ...this.defaults };
            
            // 如果有配置文件，加载并合并
            if (this.configPath && await this.fileExists(this.configPath)) {
                const fileConfig = await this.loadFromFile(this.configPath);
                this.config = this.mergeConfig(this.config, fileConfig);
            }
            
            this.emit('loaded', this.config);
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * 保存配置
     */
    async save(configPath = this.configPath) {
        try {
            if (!configPath) {
                throw new Error('没有指定配置文件路径');
            }
            
            // 确保目录存在
            await this.ensureDirectory(path.dirname(configPath));
            
            // 写入配置文件
            await fs.writeFile(
                configPath, 
                JSON.stringify(this.config, null, 2), 
                'utf8'
            );
            
            this.emit('saved', configPath);
            
        } catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    
    /**
     * 获取配置值
     */
    get(key, defaultValue = null) {
        const keys = key.split('.');
        let value = this.config;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }
    
    /**
     * 设置配置值
     */
    set(key, value) {
        const keys = key.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in current) || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }
        
        const lastKey = keys[keys.length - 1];
        const oldValue = current[lastKey];
        current[lastKey] = value;
        
        this.emit('changed', key, value, oldValue);
    }
    
    /**
     * 获取所有配置
     */
    getAll() {
        return { ...this.config };
    }
    
    /**
     * 监听配置变更
     */
    watch(key, callback) {
        if (!this.watchers.has(key)) {
            this.watchers.set(key, []);
        }
        
        this.watchers.get(key).push(callback);
        
        // 返回取消监听的函数
        return () => {
            const callbacks = this.watchers.get(key);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }
    
    /**
     * 从文件加载配置
     */
    async loadFromFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`加载配置文件失败: ${error.message}`);
        }
    }
    
    /**
     * 合并配置
     */
    mergeConfig(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && 
                    source[key] !== null && 
                    !Array.isArray(source[key])) {
                    result[key] = this.mergeConfig(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }
    
    /**
     * 检查文件是否存在
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * 确保目录存在
     */
    async ensureDirectory(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }
}

module.exports = ConfigManager;
```

#### 创建默认配置 (`src/config/default.js`)

```javascript
/**
 * 默认配置
 */
module.exports = {
    // 服务器配置
    server: {
        port: 8080,
        host: 'localhost',
        cors: {
            origin: '*',
            credentials: true
        },
        compression: {
            enabled: true,
            threshold: 1024
        },
        heartbeat: {
            enabled: true,
            interval: 30000,
            timeout: 10000
        },
        limits: {
            maxConnections: 10,
            maxMessageSize: 1024 * 1024,
            rateLimit: {
                enabled: true,
                maxRequests: 100,
                windowMs: 60000
            }
        }
    },
    
    // Eagle 配置
    eagle: {
        libraryPath: null,  // 自动检测
        autoConnect: true,
        watchChanges: true,
        cache: {
            enabled: true,
            ttl: 300000,
            maxSize: 1000
        }
    },
    
    // 文件收集器配置
    fileCollector: {
        includeMetadata: true,
        includeChecksum: false,
        parallel: true,
        maxConcurrency: 5,
        timeout: 30000,
        supportedFormats: [
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff',
            'mp4', 'mov', 'avi', 'wmv', 'flv',
            'mp3', 'wav', 'aiff', 'flac',
            'pdf', 'doc', 'docx', 'txt'
        ]
    },
    
    // 剪贴板监控配置
    clipboard: {
        enabled: true,
        autoStart: false,
        interval: 1000,
        watchFiles: true,
        watchText: false,
        watchImages: true
    },
    
    // 日志配置
    logging: {
        level: 'info',
        console: true,
        file: true,
        maxFileSize: 10 * 1024 * 1024,  // 10MB
        maxFiles: 5,
        datePattern: 'YYYY-MM-DD',
        filename: 'eagle2ae-plugin-%DATE%.log'
    },
    
    // 性能配置
    performance: {
        monitoring: {
            enabled: true,
            interval: 60000,
            metrics: ['memory', 'cpu', 'connections']
        },
        optimization: {
            autoGC: true,
            gcInterval: 300000,
            memoryThreshold: 0.8
        }
    },
    
    // 安全配置
    security: {
        authentication: {
            enabled: false,
            tokenExpiry: 3600000  // 1 小时
        },
        encryption: {
            enabled: false,
            algorithm: 'aes-256-gcm'
        },
        rateLimit: {
            enabled: true,
            maxRequests: 100,
            windowMs: 60000
        }
    }
};
```

## 调试和测试

### 开发模式运行

#### 1. 创建开发脚本

**package.json 脚本配置**:
```json
{
    "scripts": {
        "start": "node src/index.js",
        "dev": "nodemon src/index.js",
        "test": "jest",
        "test:watch": "jest --watch",
        "lint": "eslint src/**/*.js",
        "lint:fix": "eslint src/**/*.js --fix",
        "format": "prettier --write src/**/*.js"
    }
}
```

#### 2. 开发环境配置

**创建开发配置文件** (`config.dev.json`):
```json
{
    "server": {
        "port": 8080,
        "host": "localhost"
    },
    "eagle": {
        "libraryPath": "/Users/username/Eagle",
        "autoConnect": true
    },
    "logging": {
        "level": "debug",
        "console": true,
        "file": true
    },
    "clipboard": {
        "enabled": true,
        "autoStart": true,
        "interval": 500
    }
}
```

#### 3. 启动开发服务器

```bash
# 开发模式启动（自动重启）
npm run dev

# 或者普通启动
npm start

# 指定配置文件
CONFIG_PATH=./config.dev.json npm run dev
```

### 调试技巧

#### 1. VS Code 调试配置

**创建调试配置** (`.vscode/launch.json`):
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "启动插件",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/src/index.js",
            "env": {
                "NODE_ENV": "development",
                "CONFIG_PATH": "${workspaceFolder}/config.dev.json"
            },
            "console": "integratedTerminal",
            "restart": true,
            "runtimeArgs": ["--nolazy"],
            "skipFiles": ["<node_internals>/**"]
        },
        {
            "name": "调试测试",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/node_modules/.bin/jest",
            "args": ["--runInBand"],
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "disableOptimisticBPs": true
        }
    ]
}
```

#### 2. 日志调试

```javascript
// 在代码中添加调试日志
this.logger.debug('处理消息', {
    type: message.type,
    data: message.data,
    connectionId: connection.id
});

// 性能监控
const startTime = Date.now();
// ... 执行操作
const duration = Date.now() - startTime;
this.logger.info('操作完成', { operation: 'file_collection', duration });
```

#### 3. WebSocket 调试

**使用 WebSocket 测试工具**:
```javascript
// 创建测试客户端 (test-client.js)
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('连接建立');
    
    // 发送连接请求
    ws.send(JSON.stringify({
        type: 'connection_request',
        messageId: 'test_001',
        timestamp: new Date().toISOString(),
        data: {
            clientType: 'test_client',
            version: '1.0.0',
            capabilities: ['file_transfer']
        }
    }));
});

ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('收到消息:', message);
});

ws.on('error', (error) => {
    console.error('WebSocket 错误:', error);
});
```

### 单元测试

#### 1. 测试框架配置

**Jest 配置** (`jest.config.js`):
```javascript
module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    verbose: true
};
```

#### 2. 测试示例

**插件核心测试** (`tests/unit/plugin.test.js`):
```javascript
const EaglePlugin = require('../../src/plugin');
const path = require('path');

describe('EaglePlugin', () => {
    let plugin;
    
    beforeEach(() => {
        plugin = new EaglePlugin({
            configPath: path.join(__dirname, '../fixtures/test-config.json')
        });
    });
    
    afterEach(async () => {
        if (plugin && plugin.state.running) {
            await plugin.stop();
        }
    });
    
    describe('初始化', () => {
        test('应该成功初始化插件', async () => {
            const result = await plugin.initialize();
            
            expect(result.success).toBe(true);
            expect(result.version).toBeDefined();
            expect(plugin.state.initialized).toBe(true);
        });
        
        test('应该正确加载配置', async () => {
            await plugin.initialize();
            
            const port = plugin.config.get('server.port');
            expect(port).toBe(8080);
        });
    });
    
    describe('生命周期', () => {
        test('应该成功启动和停止插件', async () => {
            await plugin.start();
            expect(plugin.state.running).toBe(true);
            
            await plugin.stop();
            expect(plugin.state.running).toBe(false);
        });
    });
    
    describe('消息处理', () => {
        beforeEach(async () => {
            await plugin.start();
        });
        
        test('应该处理状态查询', async () => {
            const message = {
                type: 'status_query',
                messageId: 'test_001',
                data: {}
            };
            
            const connection = { id: 'test_conn' };
            const response = await plugin.handleStatusQuery(message, connection);
            
            expect(response.type).toBe('status_response');
            expect(response.data).toBeDefined();
        });
    });
});
```

## 部署和分发

### 生产环境配置

#### 1. 生产配置文件

**创建生产配置** (`config.prod.json`):
```json
{
    "server": {
        "port": 8080,
        "host": "0.0.0.0",
        "limits": {
            "maxConnections": 50,
            "rateLimit": {
                "enabled": true,
                "maxRequests": 200,
                "windowMs": 60000
            }
        }
    },
    "logging": {
        "level": "info",
        "console": false,
        "file": true,
        "maxFileSize": 50000000,
        "maxFiles": 10
    },
    "performance": {
        "monitoring": {
            "enabled": true,
            "interval": 300000
        },
        "optimization": {
            "autoGC": true,
            "gcInterval": 600000
        }
    }
}
```

#### 2. 进程管理

**PM2 配置** (`ecosystem.config.js`):
```javascript
module.exports = {
    apps: [{
        name: 'eagle2ae-plugin',
        script: 'src/index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            CONFIG_PATH: './config.prod.json'
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true
    }]
};
```

**启动生产服务**:
```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs eagle2ae-plugin

# 重启服务
pm2 restart eagle2ae-plugin

# 停止服务
pm2 stop eagle2ae-plugin
```

### 打包和分发

#### 1. 构建脚本

**创建构建脚本** (`scripts/build.js`):
```javascript
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * 构建插件包
 */
class PluginBuilder {
    constructor() {
        this.sourceDir = path.resolve(__dirname, '..');
        this.buildDir = path.resolve(__dirname, '../dist');
    }
    
    async build() {
        console.log('开始构建插件包...');
        
        try {
            // 1. 清理构建目录
            await this.cleanBuildDir();
            
            // 2. 创建构建目录
            await this.createBuildDir();
            
            // 3. 复制源文件
            await this.copySourceFiles();
            
            // 4. 安装生产依赖
            await this.installProductionDeps();
            
            // 5. 创建启动脚本
            await this.createStartupScripts();
            
            // 6. 创建配置模板
            await this.createConfigTemplates();
            
            // 7. 创建安装包
            await this.createPackage();
            
            console.log('构建完成！');
            
        } catch (error) {
            console.error('构建失败:', error);
            process.exit(1);
        }
    }
    
    async cleanBuildDir() {
        if (fs.existsSync(this.buildDir)) {
            fs.rmSync(this.buildDir, { recursive: true });
        }
    }
    
    async createBuildDir() {
        fs.mkdirSync(this.buildDir, { recursive: true });
    }
    
    async copySourceFiles() {
        const filesToCopy = [
            'src/',
            'package.json',
            'README.md',
            'LICENSE'
        ];
        
        for (const file of filesToCopy) {
            const sourcePath = path.join(this.sourceDir, file);
            const targetPath = path.join(this.buildDir, file);
            
            if (fs.existsSync(sourcePath)) {
                this.copyRecursive(sourcePath, targetPath);
            }
        }
    }
    
    async createPackage() {
        const packagePath = path.join(this.sourceDir, 'eagle2ae-plugin.zip');
        const output = fs.createWriteStream(packagePath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        return new Promise((resolve, reject) => {
            output.on('close', () => {
                console.log(`安装包创建完成: ${packagePath}`);
                console.log(`文件大小: ${archive.pointer()} bytes`);
                resolve();
            });
            
            archive.on('error', reject);
            archive.pipe(output);
            archive.directory(this.buildDir, false);
            archive.finalize();
        });
    }
    
    copyRecursive(source, target) {
        if (fs.statSync(source).isDirectory()) {
            fs.mkdirSync(target, { recursive: true });
            const files = fs.readdirSync(source);
            
            for (const file of files) {
                this.copyRecursive(
                    path.join(source, file),
                    path.join(target, file)
                );
            }
        } else {
            fs.copyFileSync(source, target);
        }
    }
}

// 执行构建
if (require.main === module) {
    const builder = new PluginBuilder();
    builder.build();
}

module.exports = PluginBuilder;
```

#### 2. 安装脚本

**创建安装脚本** (`install.js`):
```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 插件安装器
 */
class PluginInstaller {
    constructor() {
        this.installDir = this.getInstallDirectory();
    }
    
    getInstallDirectory() {
        const platform = process.platform;
        const homeDir = require('os').homedir();
        
        switch (platform) {
            case 'win32':
                return path.join(homeDir, 'AppData', 'Local', 'Eagle2Ae');
            case 'darwin':
                return path.join(homeDir, 'Library', 'Application Support', 'Eagle2Ae');
            default:
                return path.join(homeDir, '.eagle2ae');
        }
    }
    
    async install() {
        try {
            console.log('开始安装 Eagle2Ae 插件...');
            
            // 1. 创建安装目录
            await this.createInstallDirectory();
            
            // 2. 复制文件
            await this.copyFiles();
            
            // 3. 安装依赖
            await this.installDependencies();
            
            // 4. 创建配置文件
            await this.createConfigFile();
            
            // 5. 创建启动脚本
            await this.createStartupScript();
            
            // 6. 注册服务（可选）
            await this.registerService();
            
            console.log('安装完成！');
            console.log(`安装目录: ${this.installDir}`);
            
        } catch (error) {
            console.error('安装失败:', error);
            process.exit(1);
        }
    }
    
    async createInstallDirectory() {
        if (!fs.existsSync(this.installDir)) {
            fs.mkdirSync(this.installDir, { recursive: true });
        }
    }
    
    async copyFiles() {
        const sourceDir = __dirname;
        const files = fs.readdirSync(sourceDir);
        
        for (const file of files) {
            if (file !== 'install.js') {
                const sourcePath = path.join(sourceDir, file);
                const targetPath = path.join(this.installDir, file);
                
                if (fs.statSync(sourcePath).isDirectory()) {
                    this.copyDirectory(sourcePath, targetPath);
                } else {
                    fs.copyFileSync(sourcePath, targetPath);
                }
            }
        }
    }
    
    async installDependencies() {
        console.log('安装依赖包...');
        
        process.chdir(this.installDir);
        execSync('npm install --production', { stdio: 'inherit' });
    }
    
    async createConfigFile() {
        const configPath = path.join(this.installDir, 'config.json');
        
        if (!fs.existsSync(configPath)) {
            const defaultConfig = {
                server: {
                    port: 8080,
                    host: 'localhost'
                },
                eagle: {
                    libraryPath: null,
                    autoConnect: true
                },
                logging: {
                    level: 'info',
                    file: true
                }
            };
            
            fs.writeFileSync(
                configPath, 
                JSON.stringify(defaultConfig, null, 2)
            );
        }
    }
    
    copyDirectory(source, target) {
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
        }
        
        const files = fs.readdirSync(source);
        
        for (const file of files) {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);
            
            if (fs.statSync(sourcePath).isDirectory()) {
                this.copyDirectory(sourcePath, targetPath);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    }
}

// 执行安装
if (require.main === module) {
    const installer = new PluginInstaller();
    installer.install();
}

module.exports = PluginInstaller;
```

## 故障排除

### 常见问题

#### 1. 端口占用问题

**问题**: WebSocket 服务器启动失败，提示端口被占用

**解决方案**:
```bash
# 查看端口占用
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # macOS/Linux

# 杀死占用进程
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # macOS/Linux

# 或者修改配置文件中的端口
```

#### 2. Eagle 库连接失败

**问题**: 无法连接到 Eagle 数据库

**解决方案**:
```javascript
// 检查 Eagle 库路径
const eagleLibPath = '/Users/username/Eagle';
if (!fs.existsSync(eagleLibPath)) {
    console.error('Eagle 库路径不存在:', eagleLibPath);
}

// 检查数据库文件
const dbPath = path.join(eagleLibPath, 'metadata.db');
if (!fs.existsSync(dbPath)) {
    console.error('Eagle 数据库文件不存在:', dbPath);
}

// 检查 Eagle 是否正在运行
const isEagleRunning = await checkEagleProcess();
if (!isEagleRunning) {
    console.warn('Eagle 应用程序未运行');
}
```

#### 3. 内存泄漏问题

**问题**: 插件运行一段时间后内存使用过高

**解决方案**:
```javascript
// 定期清理缓存
setInterval(() => {
    if (this.database.cache) {
        this.database.cache.clear();
    }
    
    // 强制垃圾回收（仅开发环境）
    if (global.gc && process.env.NODE_ENV === 'development') {
        global.gc();
    }
}, 300000); // 5 分钟

// 监控内存使用
setInterval(() => {
    const memUsage = process.memoryUsage();
    const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    
    if (usedMB > 500) { // 超过 500MB
        this.logger.warn('内存使用过高', { usedMB });
    }
}, 60000); // 1 分钟
```

#### 4. WebSocket 连接断开

**问题**: 客户端频繁断开连接

**解决方案**:
```javascript
// 增加心跳检测
class WebSocketServer {
    setupHeartbeat(connection) {
        const heartbeatInterval = setInterval(() => {
            if (connection.isAlive === false) {
                connection.terminate();
                return;
            }
            
            connection.isAlive = false;
            connection.ping();
        }, 30000);
        
        connection.on('pong', () => {
            connection.isAlive = true;
        });
        
        connection.on('close', () => {
            clearInterval(heartbeatInterval);
        });
    }
}

// 自动重连机制（客户端）
class WebSocketClient {
    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.on('close', () => {
            if (this.shouldReconnect) {
                setTimeout(() => {
                    this.connect();
                }, this.reconnectInterval);
            }
        });
    }
}
```

### 性能优化建议

#### 1. 数据库查询优化

```javascript
// 使用索引
await database.createIndex({
    name: 'tags_index',
    fields: ['tags'],
    type: 'btree'
});

// 批量查询
const batchResults = await database.batchQuery([
    { type: 'getItemById', params: ['item1'] },
    { type: 'getItemById', params: ['item2'] }
]);

// 分页查询
const results = await database.searchItems(criteria, {
    page: 1,
    limit: 50
});
```

#### 2. 缓存策略

```javascript
// LRU 缓存
const LRU = require('lru-cache');
const cache = new LRU({
    max: 1000,
    ttl: 1000 * 60 * 5 // 5 分钟
});

// 缓存文件信息
const getCachedFileInfo = async (filePath) => {
    const cacheKey = `file:${filePath}`;
    let fileInfo = cache.get(cacheKey);
    
    if (!fileInfo) {
        fileInfo = await collectFileInfo(filePath);
        cache.set(cacheKey, fileInfo);
    }
    
    return fileInfo;
};
```

#### 3. 并发控制

```javascript
// 限制并发数
const pLimit = require('p-limit');
const limit = pLimit(5);

const fileInfoPromises = filePaths.map(filePath => 
    limit(() => collectFileInfo(filePath))
);

const fileInfos = await Promise.all(fileInfoPromises);
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始 Eagle 插件开发指南 | 开发团队 |

---

**相关文档**:
- [Eagle 插件 API](../api/plugin-api.md)
- [WebSocket 服务器 API](../api/websocket-server.md)
- [数据库访问 API](../api/database-api.md)
- [Eagle 插件架构](../architecture/eagle-plugin-architecture.md)