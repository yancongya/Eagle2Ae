# AE 扩展 - 开发手册

欢迎查阅 Eagle2Ae AE 扩展的开发手册。本手册面向开发者，提供关于扩展架构、开发流程、API 使用和最佳实践的详细指导。

## 🚀 最新更新 (v2.5.0)

### 拖拽悬浮选择导入行为功能
- **功能概述**：拖拽文件时，通过将鼠标悬浮到不同的导入行为按钮来动态切换导入方式
- **技术实现**：实时鼠标位置检测、智能按钮切换、无缝视觉反馈
- **开发文档**：详见 [拖拽导入增强功能指南](./enhanced-drag-and-drop-guide.md)
- **核心优势**：减少操作步骤、提升导入效率、优化用户体验
- **兼容性**：与现有功能完全兼容，不影响其他操作方式

## 📚 开发手册目录

### 核心开发指南
- **[概述](./)** - 开发手册概览和入门指南
- **[Demo 指南](./demo-guide.md)** - 演示模式开发指南
- **[开发指南](./development-guide.md)** - 标准开发流程和规范
- **[对话框系统](./dialog-system.md)** - 对话框系统开发说明
- **[导入逻辑](./import-logic.md)** - 导入逻辑实现细节
- **[项目状态检测器](./project-status-checker.md)** - 项目状态检测器开发指南
- **[设置指南](./setup-guide.md)** - 设置系统开发说明
- **[UI 交互指南](./ui-interaction-guide.md)** - UI 交互实现细节
- **[拖拽导入增强功能](./enhanced-drag-and-drop-guide.md)** - 拖拽导入功能开发指南，包含v2.5.0新增的拖拽悬浮选择导入行为技术实现

### API 参考
- **[概述](../api-reference/)** - API 参考概览
- **[前端 JS API](../api-reference/frontend-js-api.md)** - 前端 JavaScript API 详细说明
- **[智能对话框系统](../api-reference/dialog-system.md)** - 对话框系统完整 API 参考
- **[虚拟弹窗系统](../api-reference/virtual-dialog-system.md)** - 演示模式下的虚拟弹窗实现
- **[状态监控器](../api-reference/status-monitor.md)** - 状态监控器的 API 说明
- **[批量状态检测器](../api-reference/batch-status-checker.md)** - 批量状态检测的实现细节
- **[轮询管理器](../api-reference/polling-manager.md)** - 轮询机制的管理 API
- **[连接监控器](../api-reference/connection-monitor.md)** - 连接状态监控的详细说明
- **[错误处理系统](../api-reference/error-handling.md)** - 错误处理机制的 API 参考
- **[事件系统](../api-reference/event-system.md)** - 事件处理系统的完整说明
- **[配置管理系统](../api-reference/config-management.md)** - 配置管理的实现细节
- **[日志系统增强](../api-reference/logging-enhancements.md)** - 日志系统的增强功能说明
- **[性能监控](../api-reference/performance-monitoring.md)** - 性能监控的 API 参考

## 🚀 开发环境搭建

### 系统要求
- **After Effects**: `CC 2018` 或更高版本
- **Node.js**: `v16.x` 或更高版本
- **代码编辑器**: 推荐使用 Visual Studio Code
- **浏览器**: Chrome 86+ 或 Firefox 87+ （用于调试）

### 开发工具
1. **Adobe CEP 开发工具**
   - CEP Extension Builder
   - ExtendScript Debugger
   - CEP Panel Developer Tools

2. **Node.js 工具**
   - `@adobe/cep-bundler` - CEP 扩展打包工具
   - `cep-interface` - CEP 接口工具
   - `vitepress` - 文档生成工具

3. **VS Code 扩展**
   - JavaScript (ES6) code snippets
   - Bracket Pair Colorizer
   - ESLint
   - Prettier

### 环境配置

#### 启用 CEP 调试模式
```bash
# Windows
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1

# macOS
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
```

#### 扩展安装路径
- **Windows**: `C:\Users\[用户名]\AppData\Roaming\Adobe\CEP\extensions\`
- **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/`

## 🛠️ 项目结构

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

## 🎯 核心开发概念

### 扩展架构
Eagle2Ae AE 扩展采用模块化架构设计，主要包括以下几个核心组件：

1. **主应用类 (AEExtension)**
   - 扩展的核心控制器
   - 负责初始化所有子系统
   - 管理扩展的生命周期
   - 包含 v2.5.0 新增的拖拽悬浮选择导入行为功能

2. **服务层 (Services)**
   - 提供特定功能的服务实现
   - 包括文件处理器、端口发现、项目状态检测器、设置管理器等
   - 负责处理拖拽事件和文件导入逻辑

3. **工具层 (Utils)**
   - 通用工具函数集合
   - 包括日志管理器、配置管理器、声音播放器等
   - 提供拖拽悬浮选择功能的工具支持

4. **常量层 (Constants)**
   - 项目级常量定义
   - 包括导入设置常量、四种导入行为选项等
   - 定义拖拽相关的配置参数

5. **UI组件层 (UI)**
   - 用户界面组件实现
   - 包括图层检测总结对话框、导入行为按钮组等
   - 支持拖拽悬浮交互和实时视觉反馈

6. **演示模式层 (Demo)**
   - 演示模式系统实现
   - 包括API模拟器、网络拦截器、UI管理器等
   - 支持拖拽悬浮选择功能的演示

7. **ExtendScript 层 (JSX)**
   - After Effects 脚本实现
   - 与 AE 进程直接交互
   - 提供底层功能支持
   - 处理实际的文件导入操作

### v2.5.0 核心功能增强

**拖拽悬浮选择导入行为**：
- **实时鼠标位置检测**：在拖拽过程中实时检测鼠标位置
- **智能按钮切换**：自动切换导入行为按钮的选中状态
- **无缝视觉反馈**：使用现有高亮样式提供清晰反馈
- **兼容性设计**：与点击按钮选择方式完全兼容
- **性能优化**：高效的DOM操作，不影响拖拽性能

**技术实现要点**：
- 使用 `getBoundingClientRect()` 获取按钮位置
- 事件驱动的状态管理
- 防抖处理避免频繁状态更新
- 错误处理确保功能稳定性

### 通信机制

#### 前端与 ExtendScript 通信
```javascript
// 执行 ExtendScript 脚本
csInterface.evalScript('alert("Hello from ExtendScript!");', (result) => {
    console.log('ExtendScript 执行结果:', result);
});

// 执行带参数的 ExtendScript 脚本
const script = `myFunction("${param1}", ${param2});`;
csInterface.evalScript(script, (result) => {
    // 处理结果
});
```

#### HTTP 轮询通信
```javascript
// 创建 HTTP 轮询客户端
class PollingClient {
    constructor(url, clientId) {
        this.url = url;
        this.clientId = clientId;
        this.interval = 1000; // 1秒轮询间隔
        this.isActive = false;
    }

    // 启动轮询
    start() {
        this.isActive = true;
        this.poll();
    }

    // 停止轮询
    stop() {
        this.isActive = false;
    }

    // 轮询方法
    async poll() {
        if (!this.isActive) return;

        try {
            const response = await fetch(
                `${this.url}/messages?clientId=${this.clientId}`
            );
            
            if (response.ok) {
                const messages = await response.json();
                this.handleMessages(messages);
            }
        } catch (error) {
            console.error('轮询错误:', error);
        } finally {
            // 继续下一次轮询
            setTimeout(() => this.poll(), this.interval);
        }
    }

    // 处理消息
    handleMessages(messages) {
        messages.forEach(message => {
            // 处理消息
            console.log('收到消息:', message);
        });
    }
}

// 使用示例
const pollingClient = new PollingClient('http://localhost:8080', 'client123');
pollingClient.start();
```

#### HTTP 轮询
```javascript
// 定期轮询获取状态
setInterval(async () => {
    try {
        const response = await fetch('http://localhost:8080/status');
        const status = await response.json();
        // 更新状态显示
    } catch (error) {
        console.error('轮询失败:', error);
    }
}, 1000);
```

## 📖 开发流程

### 1. 功能开发标准流程

#### 需求分析
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

#### 架构设计
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

#### 实现开发
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

## 🧪 测试策略

### 单元测试
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

### 集成测试
```javascript
/**
 * 集成测试示例
 */
async function integrationTest() {
    try {
        // 1. 测试环境初始化
        console.log('🧪 开始集成测试...');
        
        // 2. 测试连接建立
        const connectionResult = await testConnection();
        if (!connectionResult.success) {
            throw new Error('连接建立失败');
        }
        
        // 3. 测试基本功能
        const basicFunctionResult = await testBasicFunctions();
        if (!basicFunctionResult.success) {
            throw new Error('基本功能测试失败');
        }
        
        // 4. 测试高级功能
        const advancedFunctionResult = await testAdvancedFunctions();
        if (!advancedFunctionResult.success) {
            throw new Error('高级功能测试失败');
        }
        
        // 5. 测试性能
        const performanceResult = await testPerformance();
        if (!performanceResult.success) {
            throw new Error('性能测试失败');
        }
        
        console.log('✅ 所有集成测试通过！');
        return { success: true };
        
    } catch (error) {
        console.error('❌ 集成测试失败:', error.message);
        return { success: false, error: error.message };
    }
}
```

## 🚀 部署和发布

### 构建流程
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

## 🎯 最佳实践

### 代码质量
- 使用 TypeScript 或 JSDoc 进行类型注释
- 实施代码审查流程
- 使用 ESLint 进行代码规范检查
- 编写全面的单元测试

### 性能优化
- 实施懒加载和代码分割
- 优化网络通信（批处理、压缩）
- 合理使用缓存机制
- 监控内存使用情况

### 错误处理
- 实施统一的错误处理策略
- 提供用户友好的错误信息
- 记录详细的错误日志
- 实现错误恢复机制

### 用户体验
- 提供清晰的操作反馈
- 实现进度指示器
- 支持操作撤销
- 优化界面响应速度

### 维护性
- 保持代码模块化
- 编写清晰的文档
- 使用版本控制
- 定期重构和优化

## 🐛 故障排除

### 常见问题

#### 扩展无法加载
- **症状**：在AE的"窗口 > 扩展"菜单里找不到 Eagle2Ae 插件
- **解决**：
  1. 检查调试模式是否已正确启用
  2. 验证文件夹路径是否正确
  3. 确认文件夹名称是否正确
  4. 完全关闭并重新启动 After Effects

#### 连接失败
- **症状**：插件显示"连接失败"或一直"连接中"
- **解决**：
  1. 确保 Eagle 客户端正在运行
  2. 检查端口号设置是否正确
  3. 检查防火墙或安全软件设置

#### 导入失败
- **症状**：素材导入后在AE里是红色的（文件丢失）
- **解决**：
  1. 检查是否使用了"直接导入"模式
  2. 建议使用"项目旁复制"模式确保项目稳定

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');
```

#### 监控性能
```javascript
// 使用性能监控API
const startTime = performance.now();
// 执行操作
const endTime = performance.now();
console.log(`操作耗时: ${endTime - startTime}ms`);
```

#### 内存分析
```javascript
// 监控内存使用
console.log('内存使用情况:', {
    used: performance.memory.usedJSHeapSize,
    total: performance.memory.totalJSHeapSize,
    limit: performance.memory.jsHeapSizeLimit
});
```

## 📚 相关文档

- **[API 参考](../api-reference/)** - 详细的API文档
- **[架构文档](../architecture/)** - 系统架构设计
- **[用户指南](../user-guide/)** - 用户操作指南

---
**请使用左侧导航栏浏览各个开发文档，获取详细信息。**