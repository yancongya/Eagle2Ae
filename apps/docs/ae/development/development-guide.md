# AE 扩展开发指南

## 概述

本指南提供 Eagle2Ae After Effects CEP 扩展的完整开发指导，包括环境搭建、开发流程、调试技巧和最佳实践。

**目标读者**: CEP 扩展开发者、After Effects 插件开发者  
**前置知识**: JavaScript、HTML/CSS、After Effects 基础  
**开发环境**: Windows 10+、macOS 10.14+

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
│   ├── services/            # 服务层
│   │   ├── websocket-client.js
│   │   ├── status-checker.js
│   │   └── file-handler.js
│   ├── utils/               # 工具函数
│   │   ├── logger.js
│   │   ├── config-manager.js
│   │   └── path-utils.js
│   ├── constants/           # 常量定义
│   │   ├── error-codes.js
│   │   └── connection-states.js
│   └── main.js              # 主入口文件
├── jsx/                     # ExtendScript 脚本
│   ├── hostscript.jsx       # 主机脚本
│   ├── utils/               # JSX 工具函数
│   └── dialogs/             # 对话框脚本
├── public/                  # 静态资源
│   ├── index.html           # 主界面
│   ├── css/                 # 样式文件
│   ├── images/              # 图片资源
│   └── fonts/               # 字体文件
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

### 3. 通信机制开发

#### WebSocket 通信实现
```javascript
/**
 * WebSocket 客户端实现
 */
class WebSocketClient {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            reconnectInterval: 3000,
            maxReconnectAttempts: 5,
            heartbeatInterval: 30000,
            ...options
        };
        
        this.ws = null;
        this.reconnectAttempts = 0;
        this.heartbeatTimer = null;
        this.messageQueue = [];
        this.eventHandlers = new Map();
    }

    /**
     * 建立连接
     */
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);
                
                this.ws.onopen = () => {
                    console.log('WebSocket 连接已建立');
                    this.reconnectAttempts = 0;
                    this._startHeartbeat();
                    this._processMessageQueue();
                    resolve();
                };
                
                this.ws.onmessage = (event) => {
                    this._handleMessage(event.data);
                };
                
                this.ws.onclose = (event) => {
                    console.log('WebSocket 连接已关闭', event.code);
                    this._stopHeartbeat();
                    this._attemptReconnect();
                };
                
                this.ws.onerror = (error) => {
                    console.error('WebSocket 错误', error);
                    reject(error);
                };
                
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 发送消息
     */
    send(type, data) {
        const message = {
            id: this._generateMessageId(),
            type: type,
            data: data,
            timestamp: Date.now()
        };

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            // 连接未建立时，将消息加入队列
            this.messageQueue.push(message);
        }

        return message.id;
    }

    /**
     * 注册事件处理器
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    /**
     * 处理接收到的消息
     */
    _handleMessage(data) {
        try {
            const message = JSON.parse(data);
            
            // 触发对应的事件处理器
            if (this.eventHandlers.has(message.type)) {
                this.eventHandlers.get(message.type).forEach(handler => {
                    try {
                        handler(message.data, message);
                    } catch (error) {
                        console.error('事件处理器执行错误', error);
                    }
                });
            }
            
        } catch (error) {
            console.error('消息解析错误', error);
        }
    }

    /**
     * 心跳机制
     */
    _startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.send('heartbeat', { timestamp: Date.now() });
            }
        }, this.options.heartbeatInterval);
    }

    _stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * 重连机制
     */
    _attemptReconnect() {
        if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`尝试重连 (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('重连失败', error);
                });
            }, this.options.reconnectInterval);
        } else {
            console.error('达到最大重连次数，停止重连');
        }
    }

    /**
     * 处理消息队列
     */
    _processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.ws.send(JSON.stringify(message));
        }
    }

    _generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
 * 增强的日志系统
 */
class DebugLogger {
    constructor(moduleName) {
        this.moduleName = moduleName;
        this.logLevel = this._getLogLevel();
    }

    debug(message, data = null) {
        if (this.logLevel <= 0) {
            this._log('DEBUG', message, data, 'color: #888');
        }
    }

    info(message, data = null) {
        if (this.logLevel <= 1) {
            this._log('INFO', message, data, 'color: #007acc');
        }
    }

    warn(message, data = null) {
        if (this.logLevel <= 2) {
            this._log('WARN', message, data, 'color: #ff8c00');
        }
    }

    error(message, data = null) {
        if (this.logLevel <= 3) {
            this._log('ERROR', message, data, 'color: #ff0000');
        }
    }

    _log(level, message, data, style) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}] [${this.moduleName}]`;
        
        if (data) {
            console.group(`%c${prefix} ${message}`, style);
            console.log(data);
            console.groupEnd();
        } else {
            console.log(`%c${prefix} ${message}`, style);
        }
    }

    _getLogLevel() {
        // 从配置或环境变量获取日志级别
        return parseInt(localStorage.getItem('debugLogLevel') || '1');
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

## 性能优化

### 1. 前端性能优化

#### 代码分割和懒加载
```javascript
/**
 * 模块懒加载实现
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

### 2. ExtendScript 性能优化

#### 批量操作优化
```javascript
/**
 * ExtendScript 批量操作优化
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

testFramework.test('WebSocket 客户端初始化', () => {
    const client = new WebSocketClient('ws://localhost:8080');
    testFramework.assert(client.url === 'ws://localhost:8080', 'URL 设置错误');
    testFramework.assert(client.reconnectAttempts === 0, '重连次数初始值错误');
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