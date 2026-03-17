# 集成测试规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的集成测试标准和最佳实践，确保模块间交互的正确性和系统整体功能的稳定性。

## 集成测试原则

### 测试范围
- 验证模块间的接口和数据流
- 测试组件集成后的功能正确性
- 确保系统各部分协同工作

### 测试粒度
- 介于单元测试和端到端测试之间
- 关注模块间的交互而非内部实现
- 验证数据在组件间的正确传递

### 测试环境
- 尽可能接近生产环境
- 使用真实的依赖组件和服务
- 避免过度模拟外部系统

## 测试框架规范

### 集成测试结构
```javascript
/**
 * 集成测试框架扩展
 */
class IntegrationTestFramework extends TestFramework {
    constructor() {
        super();
        this.testEnvironment = null;
    }
    
    /**
     * 设置测试环境
     */
    async setup() {
        // 初始化测试数据库
        // 启动依赖服务
        // 配置测试环境变量
        this.testEnvironment = new TestEnvironment();
        await this.testEnvironment.initialize();
    }
    
    /**
     * 清理测试环境
     */
    async teardown() {
        if (this.testEnvironment) {
            await this.testEnvironment.cleanup();
        }
    }
}
```

### 测试生命周期管理
```javascript
/**
 * 测试生命周期管理
 */
class TestLifecycle {
    constructor() {
        this.setupHooks = [];
        this.teardownHooks = [];
    }
    
    /**
     * 添加测试前准备钩子
     */
    beforeSetup(hook) {
        this.setupHooks.push(hook);
    }
    
    /**
     * 添加测试后清理钩子
     */
    afterTeardown(hook) {
        this.teardownHooks.push(hook);
    }
    
    /**
     * 执行所有准备钩子
     */
    async executeSetup() {
        for (const hook of this.setupHooks) {
            await hook();
        }
    }
    
    /**
     * 执行所有清理钩子
     */
    async executeTeardown() {
        // 逆序执行清理钩子
        for (let i = this.teardownHooks.length - 1; i >= 0; i--) {
            await this.teardownHooks[i]();
        }
    }
}
```

## 测试场景规范

### WebSocket 通信集成测试
```javascript
describe('WebSocket 通信集成测试', () => {
    let client;
    let mockServer;
    let testLifecycle;
    
    beforeAll(async () => {
        testLifecycle = new TestLifecycle();
        
        // 设置测试环境
        testLifecycle.beforeSetup(async () => {
            mockServer = new MockWebSocketServer(8080);
            await mockServer.start();
        });
        
        // 清理测试环境
        testLifecycle.afterTeardown(async () => {
            if (mockServer) {
                await mockServer.stop();
            }
        });
        
        await testLifecycle.executeSetup();
    });
    
    afterAll(async () => {
        await testLifecycle.executeTeardown();
    });
    
    beforeEach(async () => {
        client = new WebSocketClient('ws://localhost:8080');
    });
    
    afterEach(async () => {
        if (client) {
            await client.disconnect();
        }
    });
    
    itAsync('应该成功建立 WebSocket 连接', async () => {
        await client.connect();
        expect(client.connected).toBeTruthy();
        expect(mockServer.getConnectionCount()).toBe(1);
    });
    
    itAsync('应该正确处理文件传输消息', async () => {
        await client.connect();
        
        const testFile = {
            path: '/test/image.jpg',
            name: 'image.jpg',
            size: 1024000
        };
        
        mockServer.setFileTransferResponse({
            status: 'success',
            imported: 1
        });
        
        const result = await client.transferFiles([testFile]);
        expect(result.status).toBe('success');
        expect(result.imported).toBe(1);
    });
});
```

### CEP 扩展集成测试
```javascript
describe('CEP 扩展集成测试', () => {
    let csInterface;
    let extension;
    let testFiles;
    
    beforeAll(() => {
        // 模拟 CSInterface
        csInterface = {
            evalScript: jest.fn(),
            addEventListener: jest.fn(),
            getSystemPath: jest.fn().mockReturnValue('/test/path')
        };
        
        global.CSInterface = jest.fn().mockReturnValue(csInterface);
    });
    
    beforeEach(() => {
        extension = new Eagle2AeExtension();
        testFiles = [
            { path: '/test/image1.jpg', name: 'image1.jpg' },
            { path: '/test/image2.png', name: 'image2.png' }
        ];
    });
    
    itAsync('应该正确初始化扩展', async () => {
        csInterface.evalScript.mockResolvedValue(JSON.stringify({
            success: true,
            version: '24.0.0'
        }));
        
        await extension.initialize();
        
        expect(extension.initialized).toBeTruthy();
        expect(extension.aeVersion).toBe('24.0.0');
    });
    
    itAsync('应该正确处理文件导入流程', async () => {
        // 模拟初始化
        csInterface.evalScript.mockResolvedValueOnce(JSON.stringify({
            success: true,
            version: '24.0.0'
        }));
        
        await extension.initialize();
        
        // 模拟文件导入
        csInterface.evalScript.mockResolvedValueOnce(JSON.stringify({
            success: true,
            imported: 2,
            failed: 0
        }));
        
        const result = await extension.importFiles(testFiles, {
            importMode: 'footage',
            organizeFolders: true
        });
        
        expect(result.success).toBeTruthy();
        expect(result.imported).toBe(2);
        expect(csInterface.evalScript).toHaveBeenCalledTimes(2);
    });
});
```

## 测试数据管理

### 集成测试数据策略
- 使用专门的测试数据库或数据存储
- 准备具有代表性的测试数据集
- 确保测试数据的隔离性和可重复性

```javascript
/**
 * 集成测试数据管理器
 */
class IntegrationTestDataManager {
    constructor() {
        this.testDatabase = null;
        this.testFiles = [];
    }
    
    /**
     * 初始化测试数据
     */
    async initialize() {
        // 创建测试数据库连接
        this.testDatabase = new TestDatabase();
        await this.testDatabase.connect();
        
        // 准备测试数据
        await this.prepareTestData();
    }
    
    /**
     * 准备测试数据
     */
    async prepareTestData() {
        // 创建测试用户
        await this.createTestUsers();
        
        // 创建测试项目
        await this.createTestProjects();
        
        // 创建测试文件
        await this.createTestFiles();
    }
    
    /**
     * 清理测试数据
     */
    async cleanup() {
        if (this.testDatabase) {
            await this.testDatabase.disconnect();
        }
        
        // 清理测试文件
        await this.cleanupTestFiles();
    }
}
```

### 测试环境配置
```javascript
/**
 * 测试环境配置
 */
class TestEnvironment {
    constructor() {
        this.config = {
            database: {
                host: 'localhost',
                port: 5432,
                database: 'eagle2ae_test',
                username: 'test_user',
                password: 'test_password'
            },
            server: {
                port: 8081,
                host: 'localhost'
            },
            fileStorage: {
                path: '/tmp/eagle2ae_test'
            }
        };
    }
    
    /**
     * 初始化测试环境
     */
    async initialize() {
        // 设置环境变量
        process.env.TEST_MODE = 'true';
        process.env.DATABASE_URL = this.getDatabaseUrl();
        
        // 创建必要的目录
        await this.createDirectories();
        
        // 启动测试服务
        await this.startTestServices();
    }
    
    /**
     * 清理测试环境
     */
    async cleanup() {
        // 停止测试服务
        await this.stopTestServices();
        
        // 清理临时文件
        await this.cleanupDirectories();
        
        // 重置环境变量
        delete process.env.TEST_MODE;
        delete process.env.DATABASE_URL;
    }
    
    getDatabaseUrl() {
        const db = this.config.database;
        return `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;
    }
}
```

## 测试覆盖要求

### 核心集成场景
- **WebSocket 通信**: 90% 以上
- **文件导入导出**: 85% 以上
- **CEP 扩展交互**: 80% 以上
- **数据持久化**: 75% 以上

### 关键业务流程
- 用户完整的文件导入流程
- 项目状态检查和验证
- 配置管理和同步
- 错误处理和恢复

## 测试最佳实践

### 测试隔离
- 确保每个测试用例的独立性
- 使用事务回滚或数据清理机制
- 避免测试间的副作用

```javascript
describe('用户管理集成测试', () => {
    let testDataManager;
    
    beforeEach(async () => {
        testDataManager = new IntegrationTestDataManager();
        await testDataManager.initialize();
    });
    
    afterEach(async () => {
        await testDataManager.cleanup();
    });
    
    it('应该正确创建新用户', async () => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        };
        
        const user = await createUser(userData);
        
        // 验证用户创建成功
        expect(user.id).toBeTruthy();
        expect(user.username).toBe(userData.username);
        expect(user.email).toBe(userData.email);
        
        // 验证数据库中存在该用户
        const dbUser = await findUserById(user.id);
        expect(dbUser).toBeTruthy();
        expect(dbUser.username).toBe(userData.username);
    });
    
    it('应该防止重复用户名', async () => {
        const userData1 = {
            username: 'duplicateuser',
            email: 'test1@example.com',
            password: 'password123'
        };
        
        const userData2 = {
            username: 'duplicateuser',
            email: 'test2@example.com',
            password: 'password456'
        };
        
        // 创建第一个用户
        await createUser(userData1);
        
        // 尝试创建重复用户名的用户
        try {
            await createUser(userData2);
            expect(false).toBeTruthy(); // 不应该到达这里
        } catch (error) {
            expect(error.message).toContain('用户名已存在');
        }
    });
});
```

### 测试数据管理
- 使用工厂模式创建测试数据
- 准备多样化的测试数据集
- 确保测试数据的可重现性

```javascript
/**
 * 测试数据工厂
 */
class TestDataFactory {
    static createUser(overrides = {}) {
        const defaults = {
            username: `user_${Date.now()}`,
            email: `user_${Date.now()}@example.com`,
            password: 'password123',
            createdAt: new Date()
        };
        
        return { ...defaults, ...overrides };
    }
    
    static createProject(overrides = {}) {
        const defaults = {
            name: `Project_${Date.now()}`,
            description: 'Test project',
            ownerId: 1,
            createdAt: new Date()
        };
        
        return { ...defaults, ...overrides };
    }
    
    static createFile(overrides = {}) {
        const defaults = {
            name: `file_${Date.now()}.jpg`,
            path: `/test/files/file_${Date.now()}.jpg`,
            size: 1024000,
            type: 'image/jpeg',
            projectId: 1
        };
        
        return { ...defaults, ...overrides };
    }
}
```

### 异步测试处理
- 正确处理异步操作
- 设置合理的超时时间
- 验证异步操作的最终状态

```javascript
describe('异步操作集成测试', () => {
    itAsync('应该正确处理长时间运行的任务', async () => {
        // 设置较长的超时时间
        jest.setTimeout(30000);
        
        const largeFileList = TestDataFactory.createLargeFileList(1000);
        
        // 开始批量导入
        const importPromise = batchImportFiles(largeFileList);
        
        // 验证导入过程中状态正确
        setTimeout(() => {
            const progress = getImportProgress();
            expect(progress.status).toBe('running');
            expect(progress.processed).toBeGreaterThan(0);
        }, 5000);
        
        // 等待导入完成
        const result = await importPromise;
        
        // 验证最终结果
        expect(result.status).toBe('completed');
        expect(result.successCount).toBe(1000);
        expect(result.failureCount).toBe(0);
    });
    
    itAsync('应该正确处理并发操作', async () => {
        const promises = [];
        
        // 同时启动多个导入任务
        for (let i = 0; i < 5; i++) {
            const fileList = TestDataFactory.createFileList(10);
            promises.push(importFiles(fileList));
        }
        
        // 等待所有任务完成
        const results = await Promise.all(promises);
        
        // 验证所有任务都成功完成
        results.forEach(result => {
            expect(result.success).toBeTruthy();
        });
    });
});
```

## 测试维护规范

### 测试环境管理
- 定期更新测试环境配置
- 确保测试环境与生产环境的一致性
- 文档化测试环境的搭建和维护流程

### 测试稳定性
- 监控测试的稳定性指标
- 识别和修复不稳定的测试
- 设置测试失败的告警机制

### 测试性能
- 监控测试执行时间
- 优化慢速测试
- 并行化可并行的测试用例

## 相关文档

- [测试规范](./testing-standards.md) - 完整的测试规范文档
- [单元测试规范](./unit-testing-standards.md) - 单元测试标准
- [端到端测试规范](./e2e-testing-standards.md) - 端到端测试标准
- [编码规范](./coding-standards.md) - 编码标准和最佳实践

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始集成测试规范文档 | 开发团队 |