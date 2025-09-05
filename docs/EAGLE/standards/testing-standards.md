# Eagle 插件测试规范

## 概述

本文档定义了 Eagle2Ae Eagle 插件的测试规范和最佳实践，确保代码质量、功能正确性和系统稳定性。

## 测试策略

### 测试金字塔

```
        /\     端到端测试 (10%)
       /  \    - 完整用户场景
      /____\   - 系统集成测试
     /      \  
    /        \ 集成测试 (20%)
   /          \ - 模块间交互
  /____________\ - API 集成测试
 /              \
/________________\ 单元测试 (70%)
                   - 函数级测试
                   - 类级测试
```

### 测试类型

#### 单元测试 (Unit Tests)
- **目标**: 测试单个函数、类或模块的功能
- **范围**: 独立的代码单元
- **工具**: Jest
- **覆盖率要求**: ≥ 90%

#### 集成测试 (Integration Tests)
- **目标**: 测试模块间的交互和数据流
- **范围**: 多个模块的协作
- **工具**: Jest + Supertest
- **覆盖率要求**: ≥ 80%

#### 端到端测试 (E2E Tests)
- **目标**: 测试完整的用户工作流
- **范围**: 整个系统的功能
- **工具**: Jest + 模拟 Eagle 环境
- **覆盖率要求**: ≥ 70%

## 测试框架

### Jest 配置

#### jest.config.js
```javascript
module.exports = {
    // 测试环境
    testEnvironment: 'node',
    
    // 测试文件匹配模式
    testMatch: [
        '**/tests/**/*.test.js',
        '**/tests/**/*.spec.js',
        '**/__tests__/**/*.js'
    ],
    
    // 覆盖率收集
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js',
        '!src/**/index.js',
        '!src/**/*.config.js'
    ],
    
    // 覆盖率目录
    coverageDirectory: 'coverage',
    
    // 覆盖率报告格式
    coverageReporters: [
        'text',
        'lcov',
        'html',
        'json-summary'
    ],
    
    // 覆盖率阈值
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 90,
            lines: 85,
            statements: 85
        }
    },
    
    // 设置文件
    setupFilesAfterEnv: [
        '<rootDir>/tests/helpers/setup.js'
    ],
    
    // 模块路径映射
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1'
    },
    
    // 测试超时
    testTimeout: 10000,
    
    // 并行测试
    maxWorkers: '50%',
    
    // 详细输出
    verbose: true
};
```

#### 测试设置文件 (tests/helpers/setup.js)
```javascript
/**
 * Jest 测试设置文件
 * 配置全局测试环境和工具
 */

const fs = require('fs-extra');
const path = require('path');

// 全局测试配置
global.TEST_CONFIG = {
    timeout: 5000,
    tempDir: path.join(__dirname, '../temp'),
    fixturesDir: path.join(__dirname, '../fixtures')
};

// 测试前设置
beforeAll(async () => {
    // 创建临时目录
    await fs.ensureDir(global.TEST_CONFIG.tempDir);
    
    // 设置环境变量
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error';
});

// 测试后清理
afterAll(async () => {
    // 清理临时文件
    await fs.remove(global.TEST_CONFIG.tempDir);
});

// 每个测试前的设置
beforeEach(() => {
    // 清理模拟函数
    jest.clearAllMocks();
});

// 自定义匹配器
expect.extend({
    toBeValidFilePath(received) {
        const pass = typeof received === 'string' && received.length > 0;
        return {
            message: () => `expected ${received} to be a valid file path`,
            pass
        };
    },
    
    toBeValidWebSocketMessage(received) {
        const pass = received && 
                    typeof received.type === 'string' &&
                    received.messageId &&
                    received.timestamp;
        return {
            message: () => `expected ${received} to be a valid WebSocket message`,
            pass
        };
    }
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

## 单元测试

### 工具函数测试

#### tests/unit/utils/file-utils.test.js
```javascript
/**
 * 文件工具函数单元测试
 */

const {
    getFileExtension,
    validateFilePath,
    getFileSize,
    isImageFile,
    normalizeFilePath
} = require('@/utils/file-utils');

const fs = require('fs-extra');
const path = require('path');

describe('文件工具函数', () => {
    describe('getFileExtension', () => {
        test('应该正确提取文件扩展名', () => {
            expect(getFileExtension('image.jpg')).toBe('jpg');
            expect(getFileExtension('document.pdf')).toBe('pdf');
            expect(getFileExtension('archive.tar.gz')).toBe('gz');
            expect(getFileExtension('file.JPEG')).toBe('jpeg');
        });
        
        test('应该处理没有扩展名的文件', () => {
            expect(getFileExtension('filename')).toBe('');
            expect(getFileExtension('')).toBe('');
            expect(getFileExtension('.')).toBe('');
        });
        
        test('应该处理路径中的文件', () => {
            expect(getFileExtension('/path/to/file.png')).toBe('png');
            expect(getFileExtension('C:\\Users\\file.txt')).toBe('txt');
            expect(getFileExtension('./relative/path/file.mp4')).toBe('mp4');
        });
        
        test('应该处理特殊字符', () => {
            expect(getFileExtension('file name with spaces.jpg')).toBe('jpg');
            expect(getFileExtension('文件名.png')).toBe('png');
            expect(getFileExtension('file-with-dashes.pdf')).toBe('pdf');
        });
    });
    
    describe('validateFilePath', () => {
        let tempFile;
        
        beforeEach(async () => {
            tempFile = path.join(global.TEST_CONFIG.tempDir, 'test-file.txt');
            await fs.writeFile(tempFile, 'test content');
        });
        
        afterEach(async () => {
            if (await fs.pathExists(tempFile)) {
                await fs.remove(tempFile);
            }
        });
        
        test('应该验证存在的文件', async () => {
            const result = await validateFilePath(tempFile);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });
        
        test('应该拒绝不存在的文件', async () => {
            const result = await validateFilePath('/non/existent/file.txt');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('文件不存在');
        });
        
        test('应该拒绝空路径', async () => {
            const result = await validateFilePath('');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('路径不能为空');
        });
        
        test('应该拒绝 null 或 undefined', async () => {
            const nullResult = await validateFilePath(null);
            const undefinedResult = await validateFilePath(undefined);
            
            expect(nullResult.valid).toBe(false);
            expect(undefinedResult.valid).toBe(false);
        });
    });
    
    describe('getFileSize', () => {
        let tempFile;
        const testContent = 'Hello, World!';
        
        beforeEach(async () => {
            tempFile = path.join(global.TEST_CONFIG.tempDir, 'size-test.txt');
            await fs.writeFile(tempFile, testContent);
        });
        
        test('应该返回正确的文件大小', async () => {
            const size = await getFileSize(tempFile);
            expect(size).toBe(Buffer.byteLength(testContent, 'utf8'));
        });
        
        test('应该处理不存在的文件', async () => {
            await expect(getFileSize('/non/existent/file.txt'))
                .rejects.toThrow('文件不存在');
        });
    });
    
    describe('isImageFile', () => {
        test('应该识别图片文件', () => {
            expect(isImageFile('image.jpg')).toBe(true);
            expect(isImageFile('photo.jpeg')).toBe(true);
            expect(isImageFile('picture.png')).toBe(true);
            expect(isImageFile('icon.gif')).toBe(true);
            expect(isImageFile('vector.svg')).toBe(true);
            expect(isImageFile('bitmap.bmp')).toBe(true);
        });
        
        test('应该拒绝非图片文件', () => {
            expect(isImageFile('document.pdf')).toBe(false);
            expect(isImageFile('video.mp4')).toBe(false);
            expect(isImageFile('audio.mp3')).toBe(false);
            expect(isImageFile('text.txt')).toBe(false);
        });
        
        test('应该处理大小写', () => {
            expect(isImageFile('IMAGE.JPG')).toBe(true);
            expect(isImageFile('Photo.JPEG')).toBe(true);
            expect(isImageFile('Picture.PNG')).toBe(true);
        });
    });
    
    describe('normalizeFilePath', () => {
        test('应该标准化路径分隔符', () => {
            expect(normalizeFilePath('C:\\Users\\file.txt'))
                .toBe('C:/Users/file.txt');
            expect(normalizeFilePath('/home/user/file.txt'))
                .toBe('/home/user/file.txt');
        });
        
        test('应该处理相对路径', () => {
            expect(normalizeFilePath('./file.txt'))
                .toBe('./file.txt');
            expect(normalizeFilePath('../parent/file.txt'))
                .toBe('../parent/file.txt');
        });
        
        test('应该移除多余的分隔符', () => {
            expect(normalizeFilePath('/path//to///file.txt'))
                .toBe('/path/to/file.txt');
            expect(normalizeFilePath('C:\\\\Users\\\\file.txt'))
                .toBe('C:/Users/file.txt');
        });
    });
});
```

### 服务类测试

#### tests/unit/services/websocket-server.test.js
```javascript
/**
 * WebSocket 服务器单元测试
 */

const WebSocketServer = require('@/services/websocket-server');
const EventEmitter = require('events');

// 模拟 ws 模块
jest.mock('ws', () => {
    const mockWebSocket = {
        on: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1 // OPEN
    };
    
    const mockServer = {
        on: jest.fn(),
        close: jest.fn(),
        clients: new Set()
    };
    
    return {
        Server: jest.fn(() => mockServer),
        WebSocket: jest.fn(() => mockWebSocket)
    };
});

describe('WebSocketServer', () => {
    let server;
    let mockWsServer;
    
    beforeEach(() => {
        server = new WebSocketServer({
            port: 8080,
            host: 'localhost'
        });
        
        // 获取模拟的 WebSocket 服务器
        const WS = require('ws');
        mockWsServer = new WS.Server();
    });
    
    afterEach(async () => {
        if (server) {
            await server.stop();
        }
        jest.clearAllMocks();
    });
    
    describe('构造函数', () => {
        test('应该使用默认配置', () => {
            const defaultServer = new WebSocketServer();
            expect(defaultServer.options.port).toBe(8080);
            expect(defaultServer.options.host).toBe('localhost');
        });
        
        test('应该使用自定义配置', () => {
            const customServer = new WebSocketServer({
                port: 9090,
                host: '127.0.0.1',
                heartbeatInterval: 60000
            });
            
            expect(customServer.options.port).toBe(9090);
            expect(customServer.options.host).toBe('127.0.0.1');
            expect(customServer.options.heartbeatInterval).toBe(60000);
        });
    });
    
    describe('start', () => {
        test('应该成功启动服务器', async () => {
            const startPromise = server.start();
            
            // 模拟服务器启动成功
            const listenCallback = mockWsServer.on.mock.calls
                .find(call => call[0] === 'listening')[1];
            listenCallback();
            
            const result = await startPromise;
            
            expect(result.success).toBe(true);
            expect(server.isRunning()).toBe(true);
        });
        
        test('应该处理启动错误', async () => {
            const startPromise = server.start();
            
            // 模拟服务器启动错误
            const errorCallback = mockWsServer.on.mock.calls
                .find(call => call[0] === 'error')[1];
            errorCallback(new Error('端口被占用'));
            
            await expect(startPromise).rejects.toThrow('端口被占用');
            expect(server.isRunning()).toBe(false);
        });
        
        test('应该防止重复启动', async () => {
            // 第一次启动
            const firstStart = server.start();
            const listenCallback = mockWsServer.on.mock.calls
                .find(call => call[0] === 'listening')[1];
            listenCallback();
            await firstStart;
            
            // 第二次启动应该抛出错误
            await expect(server.start()).rejects.toThrow('服务器已在运行');
        });
    });
    
    describe('stop', () => {
        beforeEach(async () => {
            const startPromise = server.start();
            const listenCallback = mockWsServer.on.mock.calls
                .find(call => call[0] === 'listening')[1];
            listenCallback();
            await startPromise;
        });
        
        test('应该成功停止服务器', async () => {
            const stopPromise = server.stop();
            
            // 模拟服务器关闭
            const closeCallback = mockWsServer.close.mock.calls[0][0];
            closeCallback();
            
            await stopPromise;
            
            expect(server.isRunning()).toBe(false);
        });
        
        test('应该清理所有连接', async () => {
            // 添加模拟连接
            const mockConnection = { id: 'test-1', close: jest.fn() };
            server.connections.set('test-1', mockConnection);
            
            const stopPromise = server.stop();
            const closeCallback = mockWsServer.close.mock.calls[0][0];
            closeCallback();
            
            await stopPromise;
            
            expect(mockConnection.close).toHaveBeenCalled();
            expect(server.connections.size).toBe(0);
        });
    });
    
    describe('消息处理', () => {
        test('应该注册消息处理器', () => {
            const handler = jest.fn();
            server.registerMessageHandler('test_message', handler);
            
            expect(server.messageHandlers.has('test_message')).toBe(true);
            expect(server.messageHandlers.get('test_message')).toBe(handler);
        });
        
        test('应该注销消息处理器', () => {
            const handler = jest.fn();
            server.registerMessageHandler('test_message', handler);
            server.unregisterMessageHandler('test_message');
            
            expect(server.messageHandlers.has('test_message')).toBe(false);
        });
        
        test('应该处理未知消息类型', async () => {
            const mockConnection = {
                id: 'test-1',
                send: jest.fn()
            };
            
            const message = {
                type: 'unknown_message',
                messageId: 'msg-001',
                data: {}
            };
            
            await server.handleMessage(mockConnection, message);
            
            expect(mockConnection.send).toHaveBeenCalledWith(
                expect.stringContaining('unknown_message_type')
            );
        });
    });
    
    describe('广播功能', () => {
        test('应该向所有连接广播消息', () => {
            const mockConnection1 = { id: 'test-1', send: jest.fn() };
            const mockConnection2 = { id: 'test-2', send: jest.fn() };
            
            server.connections.set('test-1', mockConnection1);
            server.connections.set('test-2', mockConnection2);
            
            const message = { type: 'broadcast', data: 'test' };
            server.broadcast(message);
            
            expect(mockConnection1.send).toHaveBeenCalledWith(
                JSON.stringify(message)
            );
            expect(mockConnection2.send).toHaveBeenCalledWith(
                JSON.stringify(message)
            );
        });
        
        test('应该跳过断开的连接', () => {
            const mockConnection1 = { 
                id: 'test-1', 
                send: jest.fn(),
                readyState: 1 // OPEN
            };
            const mockConnection2 = { 
                id: 'test-2', 
                send: jest.fn(),
                readyState: 3 // CLOSED
            };
            
            server.connections.set('test-1', mockConnection1);
            server.connections.set('test-2', mockConnection2);
            
            const message = { type: 'broadcast', data: 'test' };
            server.broadcast(message);
            
            expect(mockConnection1.send).toHaveBeenCalled();
            expect(mockConnection2.send).not.toHaveBeenCalled();
        });
    });
});
```

## 集成测试

### WebSocket 通信集成测试

#### tests/integration/websocket-communication.test.js
```javascript
/**
 * WebSocket 通信集成测试
 */

const WebSocketServer = require('@/services/websocket-server');
const WebSocket = require('ws');
const { promisify } = require('util');

describe('WebSocket 通信集成测试', () => {
    let server;
    let client;
    const testPort = 8081;
    
    beforeAll(async () => {
        server = new WebSocketServer({ port: testPort });
        await server.start();
    });
    
    afterAll(async () => {
        if (server) {
            await server.stop();
        }
    });
    
    afterEach(() => {
        if (client && client.readyState === WebSocket.OPEN) {
            client.close();
        }
    });
    
    test('应该建立 WebSocket 连接', (done) => {
        client = new WebSocket(`ws://localhost:${testPort}`);
        
        client.on('open', () => {
            expect(client.readyState).toBe(WebSocket.OPEN);
            expect(server.getConnections().length).toBe(1);
            done();
        });
        
        client.on('error', done);
    });
    
    test('应该处理状态查询消息', (done) => {
        client = new WebSocket(`ws://localhost:${testPort}`);
        
        client.on('open', () => {
            const message = {
                type: 'status_query',
                messageId: 'test_001',
                timestamp: Date.now(),
                data: {}
            };
            
            client.send(JSON.stringify(message));
        });
        
        client.on('message', (data) => {
            const response = JSON.parse(data);
            
            expect(response).toBeValidWebSocketMessage();
            expect(response.type).toBe('status_response');
            expect(response.messageId).toBe('test_001');
            expect(response.data.status).toBe('running');
            
            done();
        });
        
        client.on('error', done);
    });
    
    test('应该处理文件信息查询', (done) => {
        client = new WebSocket(`ws://localhost:${testPort}`);
        
        client.on('open', () => {
            const message = {
                type: 'file_info_query',
                messageId: 'test_002',
                timestamp: Date.now(),
                data: {
                    filePath: '/path/to/test/file.jpg'
                }
            };
            
            client.send(JSON.stringify(message));
        });
        
        client.on('message', (data) => {
            const response = JSON.parse(data);
            
            expect(response.type).toBe('file_info_response');
            expect(response.messageId).toBe('test_002');
            expect(response.data).toHaveProperty('fileInfo');
            
            done();
        });
        
        client.on('error', done);
    });
    
    test('应该处理心跳消息', (done) => {
        client = new WebSocket(`ws://localhost:${testPort}`);
        
        client.on('open', () => {
            const message = {
                type: 'heartbeat',
                messageId: 'heartbeat_001',
                timestamp: Date.now(),
                data: {}
            };
            
            client.send(JSON.stringify(message));
        });
        
        client.on('message', (data) => {
            const response = JSON.parse(data);
            
            expect(response.type).toBe('heartbeat_response');
            expect(response.messageId).toBe('heartbeat_001');
            
            done();
        });
        
        client.on('error', done);
    });
    
    test('应该处理多个并发连接', async () => {
        const clients = [];
        const connectionPromises = [];
        
        // 创建多个客户端连接
        for (let i = 0; i < 5; i++) {
            const client = new WebSocket(`ws://localhost:${testPort}`);
            clients.push(client);
            
            const connectionPromise = new Promise((resolve, reject) => {
                client.on('open', resolve);
                client.on('error', reject);
            });
            
            connectionPromises.push(connectionPromise);
        }
        
        // 等待所有连接建立
        await Promise.all(connectionPromises);
        
        // 验证连接数
        expect(server.getConnections().length).toBe(5);
        
        // 关闭所有连接
        clients.forEach(client => client.close());
        
        // 等待连接关闭
        await new Promise(resolve => setTimeout(resolve, 100));
        
        expect(server.getConnections().length).toBe(0);
    });
    
    test('应该处理连接断开', (done) => {
        client = new WebSocket(`ws://localhost:${testPort}`);
        
        client.on('open', () => {
            expect(server.getConnections().length).toBe(1);
            client.close();
        });
        
        client.on('close', () => {
            // 等待服务器处理断开事件
            setTimeout(() => {
                expect(server.getConnections().length).toBe(0);
                done();
            }, 100);
        });
        
        client.on('error', done);
    });
});
```

### Eagle 数据库集成测试

#### tests/integration/eagle-database.test.js
```javascript
/**
 * Eagle 数据库集成测试
 */

const EagleDatabase = require('@/database/eagle-database');
const fs = require('fs-extra');
const path = require('path');

describe('Eagle 数据库集成测试', () => {
    let database;
    let mockLibraryPath;
    
    beforeAll(async () => {
        // 创建模拟的 Eagle 库
        mockLibraryPath = path.join(global.TEST_CONFIG.tempDir, 'mock-eagle-library');
        await createMockEagleLibrary(mockLibraryPath);
    });
    
    beforeEach(() => {
        database = new EagleDatabase(mockLibraryPath);
    });
    
    afterEach(async () => {
        if (database && database.isConnected()) {
            await database.disconnect();
        }
    });
    
    afterAll(async () => {
        await fs.remove(mockLibraryPath);
    });
    
    describe('连接管理', () => {
        test('应该成功连接到 Eagle 库', async () => {
            const result = await database.connect();
            
            expect(result.success).toBe(true);
            expect(database.isConnected()).toBe(true);
        });
        
        test('应该处理无效的库路径', async () => {
            const invalidDatabase = new EagleDatabase('/invalid/path');
            
            await expect(invalidDatabase.connect())
                .rejects.toThrow('Eagle 库路径无效');
        });
        
        test('应该成功断开连接', async () => {
            await database.connect();
            await database.disconnect();
            
            expect(database.isConnected()).toBe(false);
        });
    });
    
    describe('项目查询', () => {
        beforeEach(async () => {
            await database.connect();
        });
        
        test('应该获取所有项目', async () => {
            const items = await database.getAllItems();
            
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
            
            // 验证项目结构
            items.forEach(item => {
                expect(item).toHaveProperty('id');
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('ext');
                expect(item).toHaveProperty('size');
                expect(item).toHaveProperty('filePath');
            });
        });
        
        test('应该根据 ID 获取项目', async () => {
            const allItems = await database.getAllItems();
            const firstItem = allItems[0];
            
            const item = await database.getItemById(firstItem.id);
            
            expect(item).toBeDefined();
            expect(item.id).toBe(firstItem.id);
            expect(item.name).toBe(firstItem.name);
        });
        
        test('应该处理不存在的项目 ID', async () => {
            const item = await database.getItemById('non-existent-id');
            expect(item).toBeNull();
        });
        
        test('应该搜索项目', async () => {
            const searchResults = await database.searchItems({
                keyword: 'test',
                ext: 'jpg'
            });
            
            expect(Array.isArray(searchResults)).toBe(true);
            
            // 验证搜索结果
            searchResults.forEach(item => {
                expect(
                    item.name.toLowerCase().includes('test') ||
                    item.ext.toLowerCase() === 'jpg'
                ).toBe(true);
            });
        });
    });
    
    describe('文件夹管理', () => {
        beforeEach(async () => {
            await database.connect();
        });
        
        test('应该获取所有文件夹', async () => {
            const folders = await database.getAllFolders();
            
            expect(Array.isArray(folders)).toBe(true);
            
            folders.forEach(folder => {
                expect(folder).toHaveProperty('id');
                expect(folder).toHaveProperty('name');
                expect(folder).toHaveProperty('children');
            });
        });
        
        test('应该获取文件夹中的项目', async () => {
            const folders = await database.getAllFolders();
            if (folders.length > 0) {
                const folderId = folders[0].id;
                const items = await database.getFolderItems(folderId);
                
                expect(Array.isArray(items)).toBe(true);
            }
        });
    });
    
    describe('标签管理', () => {
        beforeEach(async () => {
            await database.connect();
        });
        
        test('应该获取所有标签', async () => {
            const tags = await database.getAllTags();
            
            expect(Array.isArray(tags)).toBe(true);
            
            tags.forEach(tag => {
                expect(tag).toHaveProperty('id');
                expect(tag).toHaveProperty('name');
                expect(tag).toHaveProperty('color');
            });
        });
        
        test('应该根据标签获取项目', async () => {
            const tags = await database.getAllTags();
            if (tags.length > 0) {
                const tagId = tags[0].id;
                const items = await database.getItemsByTag(tagId);
                
                expect(Array.isArray(items)).toBe(true);
            }
        });
    });
});

/**
 * 创建模拟的 Eagle 库
 */
async function createMockEagleLibrary(libraryPath) {
    await fs.ensureDir(libraryPath);
    
    // 创建库信息文件
    const libraryInfo = {
        version: '3.0',
        name: 'Mock Eagle Library',
        created: Date.now()
    };
    
    await fs.writeJson(
        path.join(libraryPath, 'metadata.json'),
        libraryInfo
    );
    
    // 创建模拟数据库文件
    const mockData = {
        items: [
            {
                id: 'item-001',
                name: 'test-image-1',
                ext: 'jpg',
                size: 1024000,
                filePath: '/mock/path/test-image-1.jpg',
                tags: ['tag-001'],
                folderId: 'folder-001'
            },
            {
                id: 'item-002',
                name: 'test-image-2',
                ext: 'png',
                size: 2048000,
                filePath: '/mock/path/test-image-2.png',
                tags: ['tag-002'],
                folderId: 'folder-001'
            }
        ],
        folders: [
            {
                id: 'folder-001',
                name: 'Test Folder',
                children: []
            }
        ],
        tags: [
            {
                id: 'tag-001',
                name: 'Test Tag 1',
                color: '#FF0000'
            },
            {
                id: 'tag-002',
                name: 'Test Tag 2',
                color: '#00FF00'
            }
        ]
    };
    
    await fs.writeJson(
        path.join(libraryPath, 'data.json'),
        mockData
    );
}
```

## 端到端测试

### 完整工作流测试

#### tests/e2e/file-import-workflow.test.js
```javascript
/**
 * 文件导入工作流端到端测试
 */

const EaglePlugin = require('@/plugin');
const WebSocket = require('ws');
const fs = require('fs-extra');
const path = require('path');

describe('文件导入工作流 E2E 测试', () => {
    let plugin;
    let client;
    let testFiles;
    
    beforeAll(async () => {
        // 创建测试文件
        testFiles = await createTestFiles();
        
        // 启动插件
        plugin = new EaglePlugin({
            port: 8082,
            eagleLibraryPath: path.join(global.TEST_CONFIG.tempDir, 'test-library')
        });
        
        await plugin.start();
    });
    
    afterAll(async () => {
        if (client) {
            client.close();
        }
        
        if (plugin) {
            await plugin.stop();
        }
        
        // 清理测试文件
        await cleanupTestFiles(testFiles);
    });
    
    test('完整的文件导入工作流', async () => {
        // 1. 建立 WebSocket 连接
        client = new WebSocket('ws://localhost:8082');
        
        await new Promise((resolve, reject) => {
            client.on('open', resolve);
            client.on('error', reject);
        });
        
        // 2. 查询插件状态
        const statusResponse = await sendMessage(client, {
            type: 'status_query',
            messageId: 'status_001',
            data: {}
        });
        
        expect(statusResponse.data.status).toBe('running');
        expect(statusResponse.data.eagleConnected).toBe(true);
        
        // 3. 获取选中的文件
        const selectedFilesResponse = await sendMessage(client, {
            type: 'eagle_selected_items',
            messageId: 'selected_001',
            data: {}
        });
        
        expect(selectedFilesResponse.data.items).toBeDefined();
        expect(Array.isArray(selectedFilesResponse.data.items)).toBe(true);
        
        // 4. 收集文件信息
        const fileInfoResponse = await sendMessage(client, {
            type: 'file_info_batch',
            messageId: 'fileinfo_001',
            data: {
                filePaths: testFiles.map(f => f.path)
            }
        });
        
        expect(fileInfoResponse.data.fileInfos).toBeDefined();
        expect(fileInfoResponse.data.fileInfos.length).toBe(testFiles.length);
        
        // 验证文件信息
        fileInfoResponse.data.fileInfos.forEach((fileInfo, index) => {
            expect(fileInfo.name).toBe(testFiles[index].name);
            expect(fileInfo.extension).toBe(testFiles[index].extension);
            expect(fileInfo.size).toBeGreaterThan(0);
        });
        
        // 5. 发送文件到 AE
        const sendToAeResponse = await sendMessage(client, {
            type: 'send_to_ae',
            messageId: 'sendae_001',
            data: {
                files: fileInfoResponse.data.fileInfos,
                importOptions: {
                    createComposition: true,
                    organizeFolders: true
                }
            }
        });
        
        expect(sendToAeResponse.data.success).toBe(true);
        expect(sendToAeResponse.data.importedCount).toBe(testFiles.length);
    }, 30000);
    
    test('处理文件导入错误', async () => {
        client = new WebSocket('ws://localhost:8082');
        
        await new Promise((resolve, reject) => {
            client.on('open', resolve);
            client.on('error', reject);
        });
        
        // 发送无效文件路径
        const errorResponse = await sendMessage(client, {
            type: 'file_info_batch',
            messageId: 'error_001',
            data: {
                filePaths: ['/invalid/path/file.jpg']
            }
        });
        
        expect(errorResponse.type).toBe('error');
        expect(errorResponse.data.code).toBe('FILE_NOT_FOUND');
    });
    
    test('处理大量文件的批量导入', async () => {
        client = new WebSocket('ws://localhost:8082');
        
        await new Promise((resolve, reject) => {
            client.on('open', resolve);
            client.on('error', reject);
        });
        
        // 创建大量测试文件
        const largeFileSet = await createLargeTestFileSet(50);
        
        try {
            const batchResponse = await sendMessage(client, {
                type: 'file_info_batch',
                messageId: 'batch_001',
                data: {
                    filePaths: largeFileSet.map(f => f.path)
                }
            }, 60000); // 增加超时时间
            
            expect(batchResponse.data.fileInfos.length).toBe(50);
            expect(batchResponse.data.processingTime).toBeLessThan(30000);
            
        } finally {
            // 清理大量测试文件
            await cleanupTestFiles(largeFileSet);
        }
    }, 90000);
});

/**
 * 发送消息并等待响应
 */
function sendMessage(client, message, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('消息响应超时'));
        }, timeout);
        
        const messageHandler = (data) => {
            const response = JSON.parse(data);
            if (response.messageId === message.messageId) {
                clearTimeout(timer);
                client.removeListener('message', messageHandler);
                resolve(response);
            }
        };
        
        client.on('message', messageHandler);
        client.send(JSON.stringify({
            ...message,
            timestamp: Date.now()
        }));
    });
}

/**
 * 创建测试文件
 */
async function createTestFiles() {
    const testDir = path.join(global.TEST_CONFIG.tempDir, 'test-files');
    await fs.ensureDir(testDir);
    
    const files = [
        { name: 'test-image-1.jpg', content: 'fake-jpg-content' },
        { name: 'test-image-2.png', content: 'fake-png-content' },
        { name: 'test-video.mp4', content: 'fake-mp4-content' }
    ];
    
    const createdFiles = [];
    
    for (const file of files) {
        const filePath = path.join(testDir, file.name);
        await fs.writeFile(filePath, file.content);
        
        createdFiles.push({
            name: file.name,
            path: filePath,
            extension: path.extname(file.name).slice(1)
        });
    }
    
    return createdFiles;
}

/**
 * 创建大量测试文件
 */
async function createLargeTestFileSet(count) {
    const testDir = path.join(global.TEST_CONFIG.tempDir, 'large-test-files');
    await fs.ensureDir(testDir);
    
    const files = [];
    
    for (let i = 0; i < count; i++) {
        const fileName = `test-file-${i.toString().padStart(3, '0')}.jpg`;
        const filePath = path.join(testDir, fileName);
        
        await fs.writeFile(filePath, `fake-content-${i}`);
        
        files.push({
            name: fileName,
            path: filePath,
            extension: 'jpg'
        });
    }
    
    return files;
}

/**
 * 清理测试文件
 */
async function cleanupTestFiles(files) {
    for (const file of files) {
        if (await fs.pathExists(file.path)) {
            await fs.remove(file.path);
        }
    }
}
```

## 性能测试

### 性能基准测试

#### tests/performance/websocket-performance.test.js
```javascript
/**
 * WebSocket 性能测试
 */

const WebSocketServer = require('@/services/websocket-server');
const WebSocket = require('ws');

describe('WebSocket 性能测试', () => {
    let server;
    const testPort = 8083;
    
    beforeAll(async () => {
        server = new WebSocketServer({ port: testPort });
        await server.start();
    });
    
    afterAll(async () => {
        if (server) {
            await server.stop();
        }
    });
    
    test('并发连接性能测试', async () => {
        const connectionCount = 100;
        const clients = [];
        const startTime = Date.now();
        
        // 创建并发连接
        const connectionPromises = [];
        for (let i = 0; i < connectionCount; i++) {
            const client = new WebSocket(`ws://localhost:${testPort}`);
            clients.push(client);
            
            const promise = new Promise((resolve, reject) => {
                client.on('open', resolve);
                client.on('error', reject);
            });
            
            connectionPromises.push(promise);
        }
        
        await Promise.all(connectionPromises);
        const connectionTime = Date.now() - startTime;
        
        // 验证性能指标
        expect(connectionTime).toBeLessThan(5000); // 5秒内完成
        expect(server.getConnections().length).toBe(connectionCount);
        
        // 清理连接
        clients.forEach(client => client.close());
        
        console.log(`并发连接测试: ${connectionCount} 个连接在 ${connectionTime}ms 内建立`);
    }, 30000);
    
    test('消息吞吐量测试', async () => {
        const client = new WebSocket(`ws://localhost:${testPort}`);
        
        await new Promise((resolve, reject) => {
            client.on('open', resolve);
            client.on('error', reject);
        });
        
        const messageCount = 1000;
        const messages = [];
        const startTime = Date.now();
        
        // 发送大量消息
        for (let i = 0; i < messageCount; i++) {
            const message = {
                type: 'performance_test',
                messageId: `perf_${i}`,
                timestamp: Date.now(),
                data: { index: i }
            };
            
            client.send(JSON.stringify(message));
        }
        
        // 等待所有响应
        let receivedCount = 0;
        const responsePromise = new Promise((resolve) => {
            client.on('message', () => {
                receivedCount++;
                if (receivedCount === messageCount) {
                    resolve();
                }
            });
        });
        
        await responsePromise;
        const totalTime = Date.now() - startTime;
        const throughput = messageCount / (totalTime / 1000);
        
        // 验证性能指标
        expect(throughput).toBeGreaterThan(100); // 每秒至少100条消息
        expect(totalTime).toBeLessThan(10000); // 10秒内完成
        
        client.close();
        
        console.log(`消息吞吐量测试: ${messageCount} 条消息，耗时 ${totalTime}ms，吞吐量 ${throughput.toFixed(2)} msg/s`);
    }, 30000);
    
    test('内存使用测试', async () => {
        const initialMemory = process.memoryUsage();
        const clients = [];
        
        // 创建大量连接
        for (let i = 0; i < 50; i++) {
            const client = new WebSocket(`ws://localhost:${testPort}`);
            clients.push(client);
            
            await new Promise((resolve, reject) => {
                client.on('open', resolve);
                client.on('error', reject);
            });
        }
        
        // 发送大量消息
        for (const client of clients) {
            for (let i = 0; i < 100; i++) {
                client.send(JSON.stringify({
                    type: 'memory_test',
                    messageId: `mem_${i}`,
                    data: { payload: 'x'.repeat(1000) } // 1KB payload
                }));
            }
        }
        
        // 等待处理完成
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const peakMemory = process.memoryUsage();
        const memoryIncrease = peakMemory.heapUsed - initialMemory.heapUsed;
        
        // 清理连接
        clients.forEach(client => client.close());
        
        // 等待垃圾回收
        global.gc && global.gc();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const finalMemory = process.memoryUsage();
        const memoryLeak = finalMemory.heapUsed - initialMemory.heapUsed;
        
        // 验证内存使用
        expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // 100MB
        expect(memoryLeak).toBeLessThan(10 * 1024 * 1024); // 10MB 内存泄漏阈值
        
        console.log(`内存使用测试: 峰值增加 ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB，最终泄漏 ${(memoryLeak / 1024 / 1024).toFixed(2)}MB`);
    }, 30000);
});
```

## 测试数据管理

### 测试数据管理器

#### tests/helpers/test-data-manager.js
```javascript
/**
 * 测试数据管理器
 * 负责创建、管理和清理测试数据
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TestDataManager {
    constructor(baseDir = global.TEST_CONFIG?.tempDir) {
        this.baseDir = baseDir || path.join(__dirname, '../temp');
        this.createdFiles = new Set();
        this.createdDirs = new Set();
    }
    
    /**
     * 创建临时文件
     */
    async createTempFile(fileName, content = '', subDir = '') {
        const dir = subDir ? path.join(this.baseDir, subDir) : this.baseDir;
        await fs.ensureDir(dir);
        
        const filePath = path.join(dir, fileName);
        await fs.writeFile(filePath, content);
        
        this.createdFiles.add(filePath);
        return filePath;
    }
    
    /**
     * 创建临时目录
     */
    async createTempDir(dirName = uuidv4()) {
        const dirPath = path.join(this.baseDir, dirName);
        await fs.ensureDir(dirPath);
        
        this.createdDirs.add(dirPath);
        return dirPath;
    }
    
    /**
     * 创建测试图片文件
     */
    async createTestImage(fileName = 'test-image.jpg', size = 1024) {
        const content = Buffer.alloc(size, 0xFF); // 创建假的图片数据
        return this.createTempFile(fileName, content);
    }
    
    /**
     * 创建测试视频文件
     */
    async createTestVideo(fileName = 'test-video.mp4', size = 10240) {
        const content = Buffer.alloc(size, 0x00); // 创建假的视频数据
        return this.createTempFile(fileName, content);
    }
    
    /**
     * 创建 Eagle 库结构
     */
    async createMockEagleLibrary(libraryName = 'test-library') {
        const libraryDir = await this.createTempDir(libraryName);
        
        // 创建库元数据
        const metadata = {
            version: '3.0',
            name: libraryName,
            created: Date.now(),
            modified: Date.now()
        };
        
        await fs.writeJson(path.join(libraryDir, 'metadata.json'), metadata);
        
        // 创建数据库文件
        const dbData = {
            items: await this.generateMockItems(10),
            folders: await this.generateMockFolders(3),
            tags: await this.generateMockTags(5)
        };
        
        await fs.writeJson(path.join(libraryDir, 'data.json'), dbData);
        
        return {
            path: libraryDir,
            metadata,
            data: dbData
        };
    }
    
    /**
     * 生成模拟项目数据
     */
    async generateMockItems(count = 10) {
        const items = [];
        const extensions = ['jpg', 'png', 'gif', 'mp4', 'mov', 'pdf'];
        
        for (let i = 0; i < count; i++) {
            const ext = extensions[i % extensions.length];
            const item = {
                id: `item-${i.toString().padStart(3, '0')}`,
                name: `test-file-${i}`,
                ext,
                size: Math.floor(Math.random() * 10000000) + 1000,
                width: ext.includes('jpg|png|gif') ? 1920 : undefined,
                height: ext.includes('jpg|png|gif') ? 1080 : undefined,
                duration: ext.includes('mp4|mov') ? 30000 : undefined,
                filePath: `/mock/path/test-file-${i}.${ext}`,
                tags: [`tag-${Math.floor(Math.random() * 5)}`],
                folderId: `folder-${Math.floor(Math.random() * 3)}`,
                created: Date.now() - Math.floor(Math.random() * 86400000),
                modified: Date.now() - Math.floor(Math.random() * 3600000)
            };
            
            items.push(item);
        }
        
        return items;
    }
    
    /**
     * 生成模拟文件夹数据
     */
    async generateMockFolders(count = 3) {
        const folders = [];
        
        for (let i = 0; i < count; i++) {
            const folder = {
                id: `folder-${i}`,
                name: `Test Folder ${i + 1}`,
                description: `Description for folder ${i + 1}`,
                children: [],
                created: Date.now() - Math.floor(Math.random() * 86400000),
                modified: Date.now() - Math.floor(Math.random() * 3600000)
            };
            
            folders.push(folder);
        }
        
        return folders;
    }
    
    /**
     * 生成模拟标签数据
     */
    async generateMockTags(count = 5) {
        const tags = [];
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
        
        for (let i = 0; i < count; i++) {
            const tag = {
                id: `tag-${i}`,
                name: `Test Tag ${i + 1}`,
                color: colors[i % colors.length],
                created: Date.now() - Math.floor(Math.random() * 86400000)
            };
            
            tags.push(tag);
        }
        
        return tags;
    }
    
    /**
     * 创建 WebSocket 测试消息
     */
    createTestMessage(type, data = {}, messageId = uuidv4()) {
        return {
            type,
            messageId,
            timestamp: Date.now(),
            data
        };
    }
    
    /**
     * 创建批量测试文件
     */
    async createBatchTestFiles(count = 10, fileType = 'image') {
        const files = [];
        
        for (let i = 0; i < count; i++) {
            let fileName, content;
            
            switch (fileType) {
                case 'image':
                    fileName = `batch-image-${i}.jpg`;
                    content = Buffer.alloc(1024, 0xFF);
                    break;
                case 'video':
                    fileName = `batch-video-${i}.mp4`;
                    content = Buffer.alloc(10240, 0x00);
                    break;
                case 'document':
                    fileName = `batch-doc-${i}.pdf`;
                    content = `Mock PDF content ${i}`;
                    break;
                default:
                    fileName = `batch-file-${i}.txt`;
                    content = `Test content ${i}`;
            }
            
            const filePath = await this.createTempFile(fileName, content, 'batch-files');
            files.push({
                name: fileName,
                path: filePath,
                type: fileType,
                size: Buffer.byteLength(content)
            });
        }
        
        return files;
    }
    
    /**
     * 清理所有创建的文件和目录
     */
    async cleanup() {
        // 清理文件
        for (const filePath of this.createdFiles) {
            try {
                if (await fs.pathExists(filePath)) {
                    await fs.remove(filePath);
                }
            } catch (error) {
                console.warn(`清理文件失败: ${filePath}`, error.message);
            }
        }
        
        // 清理目录
        for (const dirPath of this.createdDirs) {
            try {
                if (await fs.pathExists(dirPath)) {
                    await fs.remove(dirPath);
                }
            } catch (error) {
                console.warn(`清理目录失败: ${dirPath}`, error.message);
            }
        }
        
        // 清空记录
        this.createdFiles.clear();
        this.createdDirs.clear();
    }
    
    /**
     * 获取创建的文件列表
     */
    getCreatedFiles() {
        return Array.from(this.createdFiles);
    }
    
    /**
     * 获取创建的目录列表
     */
    getCreatedDirs() {
        return Array.from(this.createdDirs);
    }
}

module.exports = TestDataManager;
```

## 测试报告和覆盖率

### 测试报告生成器

#### tests/helpers/test-report-generator.js
```javascript
/**
 * 测试报告生成器
 * 生成详细的测试报告和覆盖率分析
 */

const fs = require('fs-extra');
const path = require('path');

class TestReportGenerator {
    constructor(outputDir = 'test-reports') {
        this.outputDir = outputDir;
        this.testResults = [];
        this.coverageData = null;
    }
    
    /**
     * 添加测试结果
     */
    addTestResult(result) {
        this.testResults.push({
            ...result,
            timestamp: Date.now()
        });
    }
    
    /**
     * 设置覆盖率数据
     */
    setCoverageData(coverage) {
        this.coverageData = coverage;
    }
    
    /**
     * 生成 HTML 报告
     */
    async generateHtmlReport() {
        await fs.ensureDir(this.outputDir);
        
        const htmlContent = this.generateHtmlContent();
        const reportPath = path.join(this.outputDir, 'test-report.html');
        
        await fs.writeFile(reportPath, htmlContent);
        return reportPath;
    }
    
    /**
     * 生成 JSON 报告
     */
    async generateJsonReport() {
        await fs.ensureDir(this.outputDir);
        
        const report = {
            summary: this.generateSummary(),
            testResults: this.testResults,
            coverage: this.coverageData,
            generatedAt: new Date().toISOString()
        };
        
        const reportPath = path.join(this.outputDir, 'test-report.json');
        await fs.writeJson(reportPath, report, { spaces: 2 });
        
        return reportPath;
    }
    
    /**
     * 生成测试摘要
     */
    generateSummary() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.status === 'passed').length;
        const failed = this.testResults.filter(r => r.status === 'failed').length;
        const skipped = this.testResults.filter(r => r.status === 'skipped').length;
        
        return {
            total,
            passed,
            failed,
            skipped,
            passRate: total > 0 ? (passed / total * 100).toFixed(2) : 0,
            duration: this.calculateTotalDuration()
        };
    }
    
    /**
     * 计算总执行时间
     */
    calculateTotalDuration() {
        return this.testResults.reduce((total, result) => {
            return total + (result.duration || 0);
        }, 0);
    }
    
    /**
     * 生成 HTML 内容
     */
    generateHtmlContent() {
        const summary = this.generateSummary();
        
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eagle 插件测试报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .test-results { margin-top: 30px; }
        .test-item { background: white; margin: 10px 0; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .test-item.failed { border-left: 4px solid #dc3545; }
        .test-item.passed { border-left: 4px solid #28a745; }
        .test-item.skipped { border-left: 4px solid #ffc107; }
        .coverage { margin-top: 30px; }
        .coverage-bar { background: #e9ecef; height: 20px; border-radius: 10px; overflow: hidden; }
        .coverage-fill { height: 100%; background: #28a745; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Eagle 插件测试报告</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>总测试数</h3>
            <div class="value">${summary.total}</div>
        </div>
        <div class="metric">
            <h3>通过</h3>
            <div class="value passed">${summary.passed}</div>
        </div>
        <div class="metric">
            <h3>失败</h3>
            <div class="value failed">${summary.failed}</div>
        </div>
        <div class="metric">
            <h3>跳过</h3>
            <div class="value skipped">${summary.skipped}</div>
        </div>
        <div class="metric">
            <h3>通过率</h3>
            <div class="value">${summary.passRate}%</div>
        </div>
        <div class="metric">
            <h3>执行时间</h3>
            <div class="value">${(summary.duration / 1000).toFixed(2)}s</div>
        </div>
    </div>
    
    ${this.coverageData ? this.generateCoverageHtml() : ''}
    
    <div class="test-results">
        <h2>测试结果详情</h2>
        ${this.testResults.map(result => this.generateTestItemHtml(result)).join('')}
    </div>
</body>
</html>
        `;
    }
    
    /**
     * 生成覆盖率 HTML
     */
    generateCoverageHtml() {
        if (!this.coverageData || !this.coverageData.total) {
            return '';
        }
        
        const { total } = this.coverageData;
        
        return `
    <div class="coverage">
        <h2>代码覆盖率</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div class="metric">
                <h3>行覆盖率</h3>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${total.lines.pct}%"></div>
                </div>
                <div class="value">${total.lines.pct}%</div>
            </div>
            <div class="metric">
                <h3>函数覆盖率</h3>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${total.functions.pct}%"></div>
                </div>
                <div class="value">${total.functions.pct}%</div>
            </div>
            <div class="metric">
                <h3>分支覆盖率</h3>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${total.branches.pct}%"></div>
                </div>
                <div class="value">${total.branches.pct}%</div>
            </div>
            <div class="metric">
                <h3>语句覆盖率</h3>
                <div class="coverage-bar">
                    <div class="coverage-fill" style="width: ${total.statements.pct}%"></div>
                </div>
                <div class="value">${total.statements.pct}%</div>
            </div>
        </div>
    </div>
        `;
    }
    
    /**
     * 生成测试项 HTML
     */
    generateTestItemHtml(result) {
        return `
        <div class="test-item ${result.status}">
            <h3>${result.name}</h3>
            <p><strong>状态:</strong> ${result.status}</p>
            <p><strong>执行时间:</strong> ${result.duration || 0}ms</p>
            ${result.error ? `<p><strong>错误:</strong> <code>${result.error}</code></p>` : ''}
            ${result.description ? `<p><strong>描述:</strong> ${result.description}</p>` : ''}
        </div>
        `;
    }
}

module.exports = TestReportGenerator;
```

## 持续集成测试

### GitHub Actions 配置

#### .github/workflows/test.yml
```yaml
name: Eagle 插件测试

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
    
    steps:
    - name: 检出代码
      uses: actions/checkout@v3
    
    - name: 设置 Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: 安装依赖
      run: npm ci
    
    - name: 运行代码检查
      run: npm run lint
    
    - name: 运行单元测试
      run: npm run test:unit
    
    - name: 运行集成测试
      run: npm run test:integration
    
    - name: 生成覆盖率报告
      run: npm run test:coverage
    
    - name: 上传覆盖率到 Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: 上传测试报告
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-reports-${{ matrix.node-version }}
        path: |
          coverage/
          test-reports/
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始 Eagle 插件测试规范文档 | 开发团队 |

---

**相关文档**:
- [编码规范](./coding-standards.md)
- [项目规范](./project-standards.md)
- [插件开发指南](../development/plugin-development-guide.md)