# AE 扩展测试规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的测试标准和最佳实践，确保代码质量、功能正确性和系统稳定性。

## 测试策略

### 测试金字塔

```
        E2E Tests (10%)
      ┌─────────────────┐
     │  端到端测试      │
    └─────────────────┘
   Integration Tests (20%)
  ┌─────────────────────┐
 │    集成测试         │
└─────────────────────┘
Unit Tests (70%)
┌─────────────────────────┐
│      单元测试           │
└─────────────────────────┘
```

### 测试类型

#### 1. 单元测试 (Unit Tests)
- **目标**: 测试独立的函数、类和模块
- **覆盖率**: 90% 以上
- **工具**: 自定义测试框架
- **运行环境**: Node.js / ExtendScript

#### 2. 集成测试 (Integration Tests)
- **目标**: 测试模块间的交互和数据流
- **覆盖率**: 80% 以上
- **工具**: 自定义测试框架
- **运行环境**: CEP 环境

#### 3. 端到端测试 (E2E Tests)
- **目标**: 测试完整的用户工作流
- **覆盖率**: 主要用户场景
- **工具**: 手动测试 + 自动化脚本
- **运行环境**: 真实的 After Effects 环境

## 测试框架

### JavaScript 测试框架

#### 基础测试框架 (js/tests/framework/test-framework.js)

```javascript
/**
 * 简单的测试框架
 * 用于 CEP 扩展的 JavaScript 代码测试
 */
class TestFramework {
    constructor() {
        this.tests = [];
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
    }
    
    /**
     * 定义测试套件
     * @param {string} description - 测试套件描述
     * @param {Function} testSuite - 测试套件函数
     */
    describe(description, testSuite) {
        console.log(`\n测试套件: ${description}`);
        console.log('='.repeat(50));
        
        try {
            testSuite();
        } catch (error) {
            this.results.errors.push({
                suite: description,
                error: error.message
            });
        }
    }
    
    /**
     * 定义单个测试
     * @param {string} description - 测试描述
     * @param {Function} testFunction - 测试函数
     */
    it(description, testFunction) {
        this.results.total++;
        
        try {
            testFunction();
            this.results.passed++;
            console.log(`✓ ${description}`);
        } catch (error) {
            this.results.failed++;
            this.results.errors.push({
                test: description,
                error: error.message,
                stack: error.stack
            });
            console.log(`✗ ${description}`);
            console.log(`  错误: ${error.message}`);
        }
    }
    
    /**
     * 断言函数
     */
    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`期望 ${expected}，实际 ${actual}`);
                }
            },
            
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`);
                }
            },
            
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`期望真值，实际 ${actual}`);
                }
            },
            
            toBeFalsy: () => {
                if (actual) {
                    throw new Error(`期望假值，实际 ${actual}`);
                }
            },
            
            toThrow: () => {
                if (typeof actual !== 'function') {
                    throw new Error('期望函数会抛出错误');
                }
                
                let threw = false;
                try {
                    actual();
                } catch (error) {
                    threw = true;
                }
                
                if (!threw) {
                    throw new Error('期望函数抛出错误，但没有抛出');
                }
            },
            
            toContain: (expected) => {
                if (Array.isArray(actual)) {
                    if (!actual.includes(expected)) {
                        throw new Error(`期望数组包含 ${expected}`);
                    }
                } else if (typeof actual === 'string') {
                    if (actual.indexOf(expected) === -1) {
                        throw new Error(`期望字符串包含 ${expected}`);
                    }
                } else {
                    throw new Error('toContain 只支持数组和字符串');
                }
            }
        };
    }
    
    /**
     * 异步测试支持
     * @param {string} description - 测试描述
     * @param {Function} testFunction - 异步测试函数
     */
    async itAsync(description, testFunction) {
        this.results.total++;
        
        try {
            await testFunction();
            this.results.passed++;
            console.log(`✓ ${description}`);
        } catch (error) {
            this.results.failed++;
            this.results.errors.push({
                test: description,
                error: error.message,
                stack: error.stack
            });
            console.log(`✗ ${description}`);
            console.log(`  错误: ${error.message}`);
        }
    }
    
    /**
     * 模拟函数
     * @param {Function} originalFunction - 原始函数
     * @returns {Object} 模拟函数对象
     */
    mock(originalFunction) {
        const calls = [];
        let returnValue = undefined;
        let throwError = null;
        
        const mockFunction = function(...args) {
            calls.push(args);
            
            if (throwError) {
                throw throwError;
            }
            
            return returnValue;
        };
        
        mockFunction.mockReturnValue = (value) => {
            returnValue = value;
            return mockFunction;
        };
        
        mockFunction.mockThrow = (error) => {
            throwError = error;
            return mockFunction;
        };
        
        mockFunction.getCalls = () => calls;
        mockFunction.getCallCount = () => calls.length;
        mockFunction.wasCalledWith = (...args) => {
            return calls.some(call => 
                JSON.stringify(call) === JSON.stringify(args)
            );
        };
        
        return mockFunction;
    }
    
    /**
     * 运行所有测试并输出结果
     */
    run() {
        console.log('\n测试结果:');
        console.log('='.repeat(50));
        console.log(`总计: ${this.results.total}`);
        console.log(`通过: ${this.results.passed}`);
        console.log(`失败: ${this.results.failed}`);
        
        if (this.results.errors.length > 0) {
            console.log('\n错误详情:');
            this.results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.test || error.suite}`);
                console.log(`   ${error.error}`);
            });
        }
        
        const successRate = this.results.total > 0 ? 
            (this.results.passed / this.results.total * 100).toFixed(2) : 0;
        console.log(`\n成功率: ${successRate}%`);
        
        return this.results;
    }
}

// 全局测试实例
const testFramework = new TestFramework();

// 导出全局函数
window.describe = testFramework.describe.bind(testFramework);
window.it = testFramework.it.bind(testFramework);
window.itAsync = testFramework.itAsync.bind(testFramework);
window.expect = testFramework.expect.bind(testFramework);
window.mock = testFramework.mock.bind(testFramework);
window.runTests = testFramework.run.bind(testFramework);
```

### JSX 测试框架

#### JSX 测试框架 (jsx/tests/framework/jsx-test-framework.jsx)

```javascript
/**
 * JSX 测试框架
 * 用于 ExtendScript 代码测试
 */
function JSXTestFramework() {
    var tests = [];
    var results = {
        total: 0,
        passed: 0,
        failed: 0,
        errors: []
    };
    
    /**
     * 定义测试套件
     */
    function describe(description, testSuite) {
        $.writeln('\n测试套件: ' + description);
        $.writeln('==================================================');
        
        try {
            testSuite();
        } catch (error) {
            results.errors.push({
                suite: description,
                error: error.toString()
            });
        }
    }
    
    /**
     * 定义单个测试
     */
    function it(description, testFunction) {
        results.total++;
        
        try {
            testFunction();
            results.passed++;
            $.writeln('✓ ' + description);
        } catch (error) {
            results.failed++;
            results.errors.push({
                test: description,
                error: error.toString()
            });
            $.writeln('✗ ' + description);
            $.writeln('  错误: ' + error.toString());
        }
    }
    
    /**
     * 断言函数
     */
    function expect(actual) {
        return {
            toBe: function(expected) {
                if (actual !== expected) {
                    throw new Error('期望 ' + expected + '，实际 ' + actual);
                }
            },
            
            toEqual: function(expected) {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error('期望 ' + JSON.stringify(expected) + '，实际 ' + JSON.stringify(actual));
                }
            },
            
            toBeTruthy: function() {
                if (!actual) {
                    throw new Error('期望真值，实际 ' + actual);
                }
            },
            
            toBeFalsy: function() {
                if (actual) {
                    throw new Error('期望假值，实际 ' + actual);
                }
            },
            
            toThrow: function() {
                if (typeof actual !== 'function') {
                    throw new Error('期望函数会抛出错误');
                }
                
                var threw = false;
                try {
                    actual();
                } catch (error) {
                    threw = true;
                }
                
                if (!threw) {
                    throw new Error('期望函数抛出错误，但没有抛出');
                }
            }
        };
    }
    
    /**
     * 运行测试并输出结果
     */
    function run() {
        $.writeln('\n测试结果:');
        $.writeln('==================================================');
        $.writeln('总计: ' + results.total);
        $.writeln('通过: ' + results.passed);
        $.writeln('失败: ' + results.failed);
        
        if (results.errors.length > 0) {
            $.writeln('\n错误详情:');
            for (var i = 0; i < results.errors.length; i++) {
                var error = results.errors[i];
                $.writeln((i + 1) + '. ' + (error.test || error.suite));
                $.writeln('   ' + error.error);
            }
        }
        
        var successRate = results.total > 0 ? 
            (results.passed / results.total * 100).toFixed(2) : 0;
        $.writeln('\n成功率: ' + successRate + '%');
        
        return results;
    }
    
    // 返回公共接口
    return {
        describe: describe,
        it: it,
        expect: expect,
        run: run
    };
}

// 创建全局测试实例
var jsxTest = JSXTestFramework();
var describe = jsxTest.describe;
var it = jsxTest.it;
var expect = jsxTest.expect;
var runTests = jsxTest.run;
```

## 单元测试规范

### JavaScript 单元测试示例

#### 工具函数测试 (js/tests/unit/utils/path-utils.test.js)

```javascript
// 引入测试框架
// 假设已经加载了 test-framework.js

// 引入被测试的模块
const PathUtils = require('../../../utils/path-utils');

describe('PathUtils 工具函数测试', () => {
    
    describe('getFileExtension', () => {
        it('应该正确提取文件扩展名', () => {
            expect(PathUtils.getFileExtension('image.jpg')).toBe('jpg');
            expect(PathUtils.getFileExtension('document.pdf')).toBe('pdf');
            expect(PathUtils.getFileExtension('archive.tar.gz')).toBe('gz');
        });
        
        it('应该处理没有扩展名的文件', () => {
            expect(PathUtils.getFileExtension('filename')).toBe('');
            expect(PathUtils.getFileExtension('')).toBe('');
        });
        
        it('应该处理路径中的文件', () => {
            expect(PathUtils.getFileExtension('/path/to/file.png')).toBe('png');
            expect(PathUtils.getFileExtension('C:\\Users\\file.txt')).toBe('txt');
        });
        
        it('应该处理特殊字符', () => {
            expect(PathUtils.getFileExtension('file.name.with.dots.jpg')).toBe('jpg');
            expect(PathUtils.getFileExtension('file-with-dashes.png')).toBe('png');
        });
    });
    
    describe('normalizePath', () => {
        it('应该标准化路径分隔符', () => {
            expect(PathUtils.normalizePath('C:\\Users\\file.txt'))
                .toBe('C:/Users/file.txt');
            expect(PathUtils.normalizePath('/Users/file.txt'))
                .toBe('/Users/file.txt');
        });
        
        it('应该处理相对路径', () => {
            expect(PathUtils.normalizePath('./file.txt'))
                .toBe('./file.txt');
            expect(PathUtils.normalizePath('../file.txt'))
                .toBe('../file.txt');
        });
        
        it('应该处理空路径', () => {
            expect(PathUtils.normalizePath('')).toBe('');
            expect(PathUtils.normalizePath(null)).toBe('');
            expect(PathUtils.normalizePath(undefined)).toBe('');
        });
    });
    
    describe('isValidPath', () => {
        it('应该验证有效路径', () => {
            expect(PathUtils.isValidPath('/valid/path/file.txt')).toBeTruthy();
            expect(PathUtils.isValidPath('C:\\valid\\path\\file.txt')).toBeTruthy();
        });
        
        it('应该拒绝无效路径', () => {
            expect(PathUtils.isValidPath('')).toBeFalsy();
            expect(PathUtils.isValidPath(null)).toBeFalsy();
            expect(PathUtils.isValidPath('invalid<>path')).toBeFalsy();
        });
    });
});
```

#### WebSocket 客户端测试 (js/tests/unit/services/websocket-client.test.js)

```javascript
const WebSocketClient = require('../../../services/websocket-client');

describe('WebSocketClient 测试', () => {
    let client;
    let mockWebSocket;
    
    // 测试前准备
    beforeEach(() => {
        // 模拟 WebSocket
        mockWebSocket = {
            send: mock(),
            close: mock(),
            addEventListener: mock(),
            removeEventListener: mock(),
            readyState: 1 // OPEN
        };
        
        // 模拟全局 WebSocket 构造函数
        global.WebSocket = mock().mockReturnValue(mockWebSocket);
        
        client = new WebSocketClient('ws://localhost:8080');
    });
    
    describe('构造函数', () => {
        it('应该正确初始化客户端', () => {
            expect(client.url).toBe('ws://localhost:8080');
            expect(client.connected).toBeFalsy();
            expect(client.reconnectAttempts).toBe(0);
        });
        
        it('应该使用默认选项', () => {
            expect(client.reconnectInterval).toBe(3000);
            expect(client.maxReconnectAttempts).toBe(5);
        });
        
        it('应该接受自定义选项', () => {
            const customClient = new WebSocketClient('ws://test', {
                reconnectInterval: 5000,
                maxReconnectAttempts: 10
            });
            
            expect(customClient.reconnectInterval).toBe(5000);
            expect(customClient.maxReconnectAttempts).toBe(10);
        });
    });
    
    describe('connect', () => {
        it('应该创建 WebSocket 连接', async () => {
            const connectPromise = client.connect();
            
            // 模拟连接成功
            mockWebSocket.onopen();
            
            await connectPromise;
            
            expect(global.WebSocket).wasCalledWith('ws://localhost:8080');
            expect(client.connected).toBeTruthy();
        });
        
        it('应该处理连接错误', async () => {
            const connectPromise = client.connect();
            
            // 模拟连接错误
            const error = new Error('连接失败');
            mockWebSocket.onerror(error);
            
            try {
                await connectPromise;
                expect(false).toBeTruthy(); // 不应该到达这里
            } catch (err) {
                expect(err).toBe(error);
                expect(client.connected).toBeFalsy();
            }
        });
    });
    
    describe('send', () => {
        beforeEach(async () => {
            // 建立连接
            const connectPromise = client.connect();
            mockWebSocket.onopen();
            await connectPromise;
        });
        
        it('应该发送消息', () => {
            const messageId = client.send('test_message', { data: 'test' });
            
            expect(mockWebSocket.send).getCallCount().toBe(1);
            expect(messageId).toBeTruthy();
            
            const sentMessage = JSON.parse(mockWebSocket.send.getCalls()[0][0]);
            expect(sentMessage.type).toBe('test_message');
            expect(sentMessage.data).toEqual({ data: 'test' });
        });
        
        it('应该在未连接时抛出错误', () => {
            client.connected = false;
            
            expect(() => {
                client.send('test_message', {});
            }).toThrow();
        });
    });
    
    describe('事件处理', () => {
        it('应该注册事件监听器', () => {
            const callback = mock();
            client.on('test_event', callback);
            
            client.emit('test_event', { data: 'test' });
            
            expect(callback).wasCalledWith({ data: 'test' });
        });
        
        it('应该处理多个监听器', () => {
            const callback1 = mock();
            const callback2 = mock();
            
            client.on('test_event', callback1);
            client.on('test_event', callback2);
            
            client.emit('test_event', { data: 'test' });
            
            expect(callback1).getCallCount().toBe(1);
            expect(callback2).getCallCount().toBe(1);
        });
    });
});
```

### JSX 单元测试示例

#### 文件导入测试 (jsx/tests/unit/file-import.test.jsx)

```javascript
// 引入 JSX 测试框架
// 假设已经加载了 jsx-test-framework.jsx

// 引入被测试的模块
#include "../../modules/file-import.jsx"

describe('文件导入模块测试', function() {
    
    describe('importFileToProject', function() {
        it('应该成功导入有效文件', function() {
            // 创建测试项目
            var testProject = app.project;
            var initialItemCount = testProject.items.length;
            
            // 模拟文件路径（需要实际存在的测试文件）
            var testFilePath = '/path/to/test/image.jpg';
            
            // 执行导入
            var result = importFileToProject(testFilePath, {
                importAs: 'footage'
            });
            
            // 验证结果
            expect(result.success).toBeTruthy();
            expect(result.item).toBeTruthy();
            expect(result.item.name).toBe('image.jpg');
            expect(testProject.items.length).toBe(initialItemCount + 1);
        });
        
        it('应该处理不存在的文件', function() {
            var nonExistentPath = '/path/to/nonexistent/file.jpg';
            
            var result = importFileToProject(nonExistentPath);
            
            expect(result.success).toBeFalsy();
            expect(result.error).toContain('文件不存在');
        });
        
        it('应该处理无效的文件格式', function() {
            var invalidFilePath = '/path/to/file.invalid';
            
            var result = importFileToProject(invalidFilePath);
            
            expect(result.success).toBeFalsy();
            expect(result.error).toContain('不支持的文件格式');
        });
    });
    
    describe('validateFilePath', function() {
        it('应该验证有效的文件路径', function() {
            var validPath = '/Users/test/image.jpg';
            
            var result = validateFilePath(validPath);
            
            expect(result.valid).toBeTruthy();
            expect(result.fileInfo).toBeTruthy();
        });
        
        it('应该拒绝空路径', function() {
            var result = validateFilePath('');
            
            expect(result.valid).toBeFalsy();
            expect(result.error).toContain('文件路径不能为空');
        });
        
        it('应该拒绝 null 路径', function() {
            var result = validateFilePath(null);
            
            expect(result.valid).toBeFalsy();
            expect(result.error).toContain('文件路径不能为空');
        });
    });
    
    describe('getOrCreateFolder', function() {
        it('应该创建新文件夹', function() {
            var folderName = 'Test Folder ' + new Date().getTime();
            var initialFolderCount = app.project.rootFolder.items.length;
            
            var folder = getOrCreateFolder(folderName);
            
            expect(folder).toBeTruthy();
            expect(folder.name).toBe(folderName);
            expect(app.project.rootFolder.items.length).toBe(initialFolderCount + 1);
        });
        
        it('应该返回现有文件夹', function() {
            var folderName = 'Existing Folder';
            
            // 创建文件夹
            var folder1 = getOrCreateFolder(folderName);
            var folderCount = app.project.rootFolder.items.length;
            
            // 再次获取同名文件夹
            var folder2 = getOrCreateFolder(folderName);
            
            expect(folder1.id).toBe(folder2.id);
            expect(app.project.rootFolder.items.length).toBe(folderCount);
        });
    });
});
```

## 集成测试规范

### WebSocket 通信集成测试

#### 通信流程测试 (js/tests/integration/websocket-communication.test.js)

```javascript
describe('WebSocket 通信集成测试', () => {
    let client;
    let mockServer;
    
    beforeEach(async () => {
        // 启动模拟服务器
        mockServer = new MockWebSocketServer(8080);
        await mockServer.start();
        
        // 创建客户端
        client = new WebSocketClient('ws://localhost:8080');
    });
    
    afterEach(async () => {
        if (client) {
            await client.disconnect();
        }
        if (mockServer) {
            await mockServer.stop();
        }
    });
    
    describe('连接建立流程', () => {
        itAsync('应该成功建立连接', async () => {
            await client.connect();
            
            expect(client.connected).toBeTruthy();
            expect(mockServer.getConnectionCount()).toBe(1);
        });
        
        itAsync('应该发送连接请求消息', async () => {
            await client.connect();
            
            const messages = mockServer.getReceivedMessages();
            expect(messages.length).toBe(1);
            expect(messages[0].type).toBe('connection_request');
        });
        
        itAsync('应该处理连接响应', async () => {
            mockServer.setConnectionResponse({
                status: 'accepted',
                serverVersion: '1.0.0'
            });
            
            await client.connect();
            
            expect(client.serverInfo).toBeTruthy();
            expect(client.serverInfo.version).toBe('1.0.0');
        });
    });
    
    describe('文件传输流程', () => {
        beforeEach(async () => {
            await client.connect();
        });
        
        itAsync('应该成功传输单个文件', async () => {
            const fileInfo = {
                path: '/test/image.jpg',
                name: 'image.jpg',
                size: 1024000,
                type: 'image/jpeg'
            };
            
            mockServer.setFileTransferResponse({
                status: 'success',
                imported: 1,
                failed: 0
            });
            
            const result = await client.transferFiles([fileInfo]);
            
            expect(result.status).toBe('success');
            expect(result.imported).toBe(1);
        });
        
        itAsync('应该处理传输错误', async () => {
            const fileInfo = {
                path: '/test/nonexistent.jpg',
                name: 'nonexistent.jpg',
                size: 1024000,
                type: 'image/jpeg'
            };
            
            mockServer.setFileTransferResponse({
                status: 'error',
                error: 'FILE_NOT_FOUND',
                message: '文件不存在'
            });
            
            try {
                await client.transferFiles([fileInfo]);
                expect(false).toBeTruthy(); // 不应该到达这里
            } catch (error) {
                expect(error.message).toContain('文件不存在');
            }
        });
    });
    
    describe('心跳机制', () => {
        beforeEach(async () => {
            await client.connect();
        });
        
        itAsync('应该定期发送心跳', async () => {
            // 等待心跳间隔
            await new Promise(resolve => setTimeout(resolve, 35000));
            
            const messages = mockServer.getReceivedMessages();
            const heartbeats = messages.filter(msg => msg.type === 'heartbeat');
            
            expect(heartbeats.length).toBeGreaterThan(0);
        });
        
        itAsync('应该处理心跳响应', async () => {
            // 发送心跳
            client.sendHeartbeat();
            
            // 模拟服务器响应
            mockServer.sendMessage({
                type: 'heartbeat_response',
                data: { status: 'alive' }
            });
            
            // 验证客户端状态
            expect(client.lastHeartbeatResponse).toBeTruthy();
        });
    });
});
```

### CEP 扩展集成测试

#### 扩展生命周期测试 (js/tests/integration/extension-lifecycle.test.js)

```javascript
describe('CEP 扩展生命周期测试', () => {
    let csInterface;
    let extension;
    
    beforeEach(() => {
        // 模拟 CSInterface
        csInterface = {
            evalScript: mock(),
            addEventListener: mock(),
            removeEventListener: mock(),
            getSystemPath: mock().mockReturnValue('/test/path'),
            getOSInformation: mock().mockReturnValue('Windows')
        };
        
        global.CSInterface = mock().mockReturnValue(csInterface);
        
        extension = new Eagle2AeExtension();
    });
    
    describe('扩展初始化', () => {
        itAsync('应该成功初始化扩展', async () => {
            csInterface.evalScript.mockReturnValue(JSON.stringify({
                success: true,
                version: '24.0.0'
            }));
            
            await extension.initialize();
            
            expect(extension.initialized).toBeTruthy();
            expect(extension.aeVersion).toBe('24.0.0');
        });
        
        itAsync('应该处理初始化错误', async () => {
            csInterface.evalScript.mockReturnValue(JSON.stringify({
                success: false,
                error: '初始化失败'
            }));
            
            try {
                await extension.initialize();
                expect(false).toBeTruthy();
            } catch (error) {
                expect(error.message).toContain('初始化失败');
            }
        });
    });
    
    describe('文件导入集成', () => {
        beforeEach(async () => {
            await extension.initialize();
        });
        
        itAsync('应该集成文件导入流程', async () => {
            const files = [
                {
                    path: '/test/image.jpg',
                    name: 'image.jpg',
                    size: 1024000,
                    type: 'image/jpeg'
                }
            ];
            
            const settings = {
                importMode: 'footage',
                organizeFolders: true
            };
            
            // 模拟 JSX 脚本响应
            csInterface.evalScript.mockReturnValue(JSON.stringify({
                success: true,
                imported: 1,
                failed: 0,
                details: {
                    successItems: [
                        {
                            originalPath: '/test/image.jpg',
                            projectItemId: 123,
                            name: 'image.jpg'
                        }
                    ]
                }
            }));
            
            const result = await extension.importFiles(files, settings);
            
            expect(result.success).toBeTruthy();
            expect(result.imported).toBe(1);
            expect(csInterface.evalScript).wasCalledWith(
                expect.stringContaining('importMultipleFiles')
            );
        });
    });
});
```

## 端到端测试规范

### 用户工作流测试

#### 完整导入流程测试 (js/tests/e2e/complete-import-workflow.test.js)

```javascript
describe('完整文件导入工作流', () => {
    let extension;
    let testFiles;
    
    beforeEach(async () => {
        // 准备测试环境
        extension = new Eagle2AeExtension();
        await extension.initialize();
        
        // 准备测试文件
        testFiles = [
            createTestFile('image1.jpg', 'image/jpeg'),
            createTestFile('image2.png', 'image/png'),
            createTestFile('video1.mp4', 'video/mp4')
        ];
    });
    
    afterEach(async () => {
        // 清理测试文件
        cleanupTestFiles(testFiles);
        
        // 清理 AE 项目
        await extension.clearProject();
    });
    
    itAsync('用户应该能够完成完整的导入流程', async () => {
        // 1. 用户选择文件
        const selectedFiles = await extension.selectFiles(testFiles);
        expect(selectedFiles.length).toBe(3);
        
        // 2. 用户配置导入设置
        const importSettings = {
            importMode: 'footage',
            createComposition: true,
            organizeFolders: true,
            targetFolder: 'E2E Test Import'
        };
        
        // 3. 执行导入
        const importResult = await extension.importFiles(selectedFiles, importSettings);
        
        // 4. 验证导入结果
        expect(importResult.success).toBeTruthy();
        expect(importResult.imported).toBe(3);
        expect(importResult.failed).toBe(0);
        
        // 5. 验证 AE 项目状态
        const projectInfo = await extension.getProjectInfo();
        expect(projectInfo.itemCount).toBeGreaterThan(3);
        
        // 6. 验证文件夹组织
        const targetFolder = await extension.findFolder('E2E Test Import');
        expect(targetFolder).toBeTruthy();
        expect(targetFolder.itemCount).toBe(3);
        
        // 7. 验证合成创建
        if (importSettings.createComposition) {
            const composition = await extension.findComposition('E2E Test Import');
            expect(composition).toBeTruthy();
            expect(composition.layerCount).toBe(3);
        }
    });
    
    itAsync('用户应该能够处理部分导入失败的情况', async () => {
        // 添加一个无效文件
        const filesWithInvalid = [
            ...testFiles,
            {
                path: '/nonexistent/file.jpg',
                name: 'nonexistent.jpg',
                size: 0,
                type: 'image/jpeg'
            }
        ];
        
        const importResult = await extension.importFiles(filesWithInvalid, {
            importMode: 'footage',
            organizeFolders: true
        });
        
        // 验证部分成功的结果
        expect(importResult.success).toBeFalsy(); // 整体失败
        expect(importResult.imported).toBe(3);    // 但有成功的项目
        expect(importResult.failed).toBe(1);      // 有失败的项目
        expect(importResult.details.failedItems.length).toBe(1);
        
        // 验证错误信息
        const failedItem = importResult.details.failedItems[0];
        expect(failedItem.error).toContain('FILE_NOT_FOUND');
    });
    
    itAsync('用户应该能够取消正在进行的导入', async () => {
        // 开始导入大量文件
        const largeFileList = createLargeTestFileList(100);
        
        const importPromise = extension.importFiles(largeFileList, {
            importMode: 'footage'
        });
        
        // 等待一段时间后取消
        setTimeout(() => {
            extension.cancelImport();
        }, 1000);
        
        try {
            await importPromise;
            expect(false).toBeTruthy(); // 不应该成功完成
        } catch (error) {
            expect(error.message).toContain('操作被取消');
        }
        
        // 验证部分导入的状态
        const projectInfo = await extension.getProjectInfo();
        expect(projectInfo.itemCount).toBeLessThan(100);
    });
});
```

## 性能测试规范

### 性能基准测试

#### 导入性能测试 (js/tests/performance/import-performance.test.js)

```javascript
describe('文件导入性能测试', () => {
    let extension;
    let performanceMonitor;
    
    beforeEach(async () => {
        extension = new Eagle2AeExtension();
        await extension.initialize();
        
        performanceMonitor = new PerformanceMonitor();
    });
    
    describe('单文件导入性能', () => {
        itAsync('小文件导入应该在 2 秒内完成', async () => {
            const smallFile = createTestFile('small.jpg', 'image/jpeg', 100 * 1024); // 100KB
            
            const startTime = performance.now();
            await extension.importFiles([smallFile]);
            const endTime = performance.now();
            
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(2000); // 2 秒
        });
        
        itAsync('大文件导入应该在 10 秒内完成', async () => {
            const largeFile = createTestFile('large.mp4', 'video/mp4', 50 * 1024 * 1024); // 50MB
            
            const startTime = performance.now();
            await extension.importFiles([largeFile]);
            const endTime = performance.now();
            
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(10000); // 10 秒
        });
    });
    
    describe('批量导入性能', () => {
        itAsync('10 个文件批量导入应该在 30 秒内完成', async () => {
            const files = [];
            for (let i = 0; i < 10; i++) {
                files.push(createTestFile(`file${i}.jpg`, 'image/jpeg', 1024 * 1024)); // 1MB each
            }
            
            const startTime = performance.now();
            await extension.importFiles(files);
            const endTime = performance.now();
            
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(30000); // 30 秒
        });
        
        itAsync('批量导入的平均单文件时间应该优于单独导入', async () => {
            const testFiles = [];
            for (let i = 0; i < 5; i++) {
                testFiles.push(createTestFile(`batch${i}.jpg`, 'image/jpeg', 1024 * 1024));
            }
            
            // 测试单独导入
            const singleImportTimes = [];
            for (const file of testFiles) {
                const startTime = performance.now();
                await extension.importFiles([file]);
                const endTime = performance.now();
                singleImportTimes.push(endTime - startTime);
            }
            
            const avgSingleTime = singleImportTimes.reduce((a, b) => a + b) / singleImportTimes.length;
            
            // 测试批量导入
            const batchStartTime = performance.now();
            await extension.importFiles(testFiles);
            const batchEndTime = performance.now();
            
            const avgBatchTime = (batchEndTime - batchStartTime) / testFiles.length;
            
            // 批量导入应该更快
            expect(avgBatchTime).toBeLessThan(avgSingleTime * 0.8); // 至少快 20%
        });
    });
    
    describe('内存使用测试', () => {
        itAsync('导入过程中内存使用应该保持稳定', async () => {
            const files = [];
            for (let i = 0; i < 20; i++) {
                files.push(createTestFile(`memory${i}.jpg`, 'image/jpeg', 2 * 1024 * 1024)); // 2MB each
            }
            
            const initialMemory = performanceMonitor.getMemoryUsage();
            
            await extension.importFiles(files);
            
            const finalMemory = performanceMonitor.getMemoryUsage();
            const memoryIncrease = finalMemory - initialMemory;
            
            // 内存增长不应该超过文件总大小的 2 倍
            const totalFileSize = files.reduce((sum, file) => sum + file.size, 0);
            expect(memoryIncrease).toBeLessThan(totalFileSize * 2);
        });
    });
});
```

## 测试数据管理

### 测试夹具 (js/tests/fixtures/test-data.js)

```javascript
/**
 * 测试数据和夹具管理
 */
class TestDataManager {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp');
        this.fixturesDir = path.join(__dirname, '../fixtures');
    }
    
    /**
     * 创建测试文件
     */
    createTestFile(name, type, size = 1024) {
        const filePath = path.join(this.tempDir, name);
        
        // 确保目录存在
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
        
        // 创建文件内容
        const buffer = Buffer.alloc(size, 0);
        fs.writeFileSync(filePath, buffer);
        
        return {
            path: filePath,
            name: name,
            size: size,
            type: type,
            exists: true
        };
    }
    
    /**
     * 创建测试图片文件
     */
    createTestImage(name, width = 100, height = 100) {
        // 这里可以使用图片生成库创建真实的图片文件
        // 为了简化，我们创建一个模拟的图片文件
        return this.createTestFile(name, 'image/jpeg', width * height * 3);
    }
    
    /**
     * 创建测试视频文件
     */
    createTestVideo(name, duration = 10) {
        // 模拟视频文件大小（假设每秒 1MB）
        const size = duration * 1024 * 1024;
        return this.createTestFile(name, 'video/mp4', size);
    }
    
    /**
     * 获取预定义的测试文件
     */
    getFixtureFile(name) {
        const filePath = path.join(this.fixturesDir, name);
        
        if (!fs.existsSync(filePath)) {
            throw new Error(`测试夹具文件不存在: ${name}`);
        }
        
        const stats = fs.statSync(filePath);
        const extension = path.extname(name).toLowerCase();
        
        let type = 'application/octet-stream';
        if (['.jpg', '.jpeg'].includes(extension)) {
            type = 'image/jpeg';
        } else if (extension === '.png') {
            type = 'image/png';
        } else if (extension === '.mp4') {
            type = 'video/mp4';
        }
        
        return {
            path: filePath,
            name: name,
            size: stats.size,
            type: type,
            exists: true
        };
    }
    
    /**
     * 清理临时文件
     */
    cleanup() {
        if (fs.existsSync(this.tempDir)) {
            fs.rmSync(this.tempDir, { recursive: true });
        }
    }
    
    /**
     * 创建大量测试文件
     */
    createLargeTestFileList(count, sizeRange = [1024, 1024 * 1024]) {
        const files = [];
        
        for (let i = 0; i < count; i++) {
            const size = Math.floor(
                Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0]
            );
            
            const extensions = ['jpg', 'png', 'mp4', 'mov'];
            const extension = extensions[Math.floor(Math.random() * extensions.length)];
            
            files.push(this.createTestFile(`large_test_${i}.${extension}`, 
                extension.startsWith('mp') ? 'video/mp4' : 'image/jpeg', 
                size
            ));
        }
        
        return files;
    }
}

// 导出单例实例
module.exports = new TestDataManager();
```

## 测试报告和覆盖率

### 测试报告生成

#### 报告生成器 (scripts/generate-test-report.js)

```javascript
const fs = require('fs');
const path = require('path');

/**
 * 测试报告生成器
 */
class TestReportGenerator {
    constructor() {
        this.reportDir = path.resolve(__dirname, '../test-reports');
    }
    
    /**
     * 生成 HTML 测试报告
     */
    generateHTMLReport(testResults) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Eagle2Ae AE Extension 测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .test-suite { margin: 20px 0; }
        .test-case { margin: 10px 0; padding: 10px; border-left: 3px solid #ddd; }
        .test-case.passed { border-left-color: green; }
        .test-case.failed { border-left-color: red; }
        .error-details { background: #ffe6e6; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Eagle2Ae AE Extension 测试报告</h1>
    
    <div class="summary">
        <h2>测试摘要</h2>
        <p>总计: ${testResults.total}</p>
        <p class="passed">通过: ${testResults.passed}</p>
        <p class="failed">失败: ${testResults.failed}</p>
        <p>成功率: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%</p>
        <p>执行时间: ${testResults.duration}ms</p>
    </div>
    
    <div class="test-suites">
        ${this.generateTestSuitesHTML(testResults.suites)}
    </div>
    
    <div class="coverage">
        <h2>代码覆盖率</h2>
        ${this.generateCoverageHTML(testResults.coverage)}
    </div>
</body>
</html>
        `;
        
        const reportPath = path.join(this.reportDir, 'test-report.html');
        this.ensureReportDir();
        fs.writeFileSync(reportPath, html);
        
        console.log(`测试报告已生成: ${reportPath}`);
    }
    
    /**
     * 生成 JSON 测试报告
     */
    generateJSONReport(testResults) {
        const reportPath = path.join(this.reportDir, 'test-report.json');
        this.ensureReportDir();
        
        fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
        console.log(`JSON 报告已生成: ${reportPath}`);
    }
    
    /**
     * 生成覆盖率报告
     */
    generateCoverageReport(coverageData) {
        const reportPath = path.join(this.reportDir, 'coverage-report.html');
        
        // 生成覆盖率 HTML 报告
        const html = this.generateCoverageHTML(coverageData);
        
        this.ensureReportDir();
        fs.writeFileSync(reportPath, html);
        
        console.log(`覆盖率报告已生成: ${reportPath}`);
    }
    
    ensureReportDir() {
        if (!fs.existsSync(this.reportDir)) {
            fs.mkdirSync(this.reportDir, { recursive: true });
        }
    }
    
    generateTestSuitesHTML(suites) {
        return suites.map(suite => `
            <div class="test-suite">
                <h3>${suite.name}</h3>
                ${suite.tests.map(test => `
                    <div class="test-case ${test.status}">
                        <strong>${test.name}</strong>
                        <span class="${test.status}">${test.status}</span>
                        ${test.error ? `<div class="error-details">${test.error}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `).join('');
    }
    
    generateCoverageHTML(coverage) {
        if (!coverage) {
            return '<p>暂无覆盖率数据</p>';
        }
        
        return `
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <th>文件</th>
                    <th>行覆盖率</th>
                    <th>函数覆盖率</th>
                    <th>分支覆盖率</th>
                </tr>
                ${Object.keys(coverage.files).map(file => {
                    const fileCoverage = coverage.files[file];
                    return `
                        <tr>
                            <td>${file}</td>
                            <td>${fileCoverage.lines.percentage}%</td>
                            <td>${fileCoverage.functions.percentage}%</td>
                            <td>${fileCoverage.branches.percentage}%</td>
                        </tr>
                    `;
                }).join('')}
            </table>
        `;
    }
}

module.exports = TestReportGenerator;
```

## 持续集成测试

### GitHub Actions 配置 (.github/workflows/test.yml)

```yaml
name: 测试

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: 设置 Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: 安装依赖
      run: npm ci
    
    - name: 运行代码检查
      run: npm run lint
    
    - name: 运行单元测试
      run: npm run test:unit
    
    - name: 运行集成测试
      run: npm run test:integration
    
    - name: 生成测试报告
      run: npm run test:report
    
    - name: 上传测试报告
      uses: actions/upload-artifact@v3
      with:
        name: test-reports
        path: test-reports/
    
    - name: 检查测试覆盖率
      run: |
        if [ $(cat test-reports/coverage-summary.json | jq '.total.lines.percentage') -lt 80 ]; then
          echo "测试覆盖率低于 80%"
          exit 1
        fi
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始测试规范文档 | 开发团队 |

---

**相关文档**:
- [编码规范](./coding-standards.md)
- [项目规范](./project-standards.md)
- [开发指南](../development/cep-development-guide.md)