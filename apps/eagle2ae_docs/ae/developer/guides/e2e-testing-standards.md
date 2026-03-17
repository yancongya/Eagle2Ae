# 端到端测试规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的端到端测试标准和最佳实践，确保完整的用户工作流和系统功能的正确性。

## 端到端测试原则

### 测试目标
- 验证完整的用户场景和工作流
- 模拟真实用户的操作行为
- 确保系统端到端的功能正确性

### 测试范围
- 覆盖主要的用户使用场景
- 验证系统与外部系统的集成
- 测试异常情况和错误处理

### 测试环境
- 尽可能接近真实的生产环境
- 包含所有必要的依赖系统
- 使用真实的用户数据（脱敏后）

## 测试框架规范

### E2E 测试结构
```javascript
/**
 * 端到端测试框架
 */
class E2ETestFramework {
    constructor() {
        this.testEnvironment = null;
        this.testData = null;
    }
    
    /**
     * 初始化测试环境
     */
    async setup() {
        this.testEnvironment = new E2ETestEnvironment();
        await this.testEnvironment.initialize();
        
        this.testData = new E2ETestDataManager();
        await this.testData.initialize();
    }
    
    /**
     * 清理测试环境
     */
    async teardown() {
        if (this.testData) {
            await this.testData.cleanup();
        }
        
        if (this.testEnvironment) {
            await this.testEnvironment.cleanup();
        }
    }
}
```

### 测试场景管理
```javascript
/**
 * 测试场景管理器
 */
class TestScenarioManager {
    constructor() {
        this.scenarios = new Map();
    }
    
    /**
     * 定义测试场景
     */
    defineScenario(name, steps) {
        this.scenarios.set(name, {
            name,
            steps,
            description: steps.description || name
        });
    }
    
    /**
     * 执行测试场景
     */
    async executeScenario(name, testData) {
        const scenario = this.scenarios.get(name);
        if (!scenario) {
            throw new Error(`测试场景未找到: ${name}`);
        }
        
        console.log(`执行测试场景: ${scenario.description}`);
        
        for (const step of scenario.steps) {
            try {
                await step.action(testData);
                console.log(`✓ ${step.description}`);
            } catch (error) {
                console.log(`✗ ${step.description}`);
                console.log(`  错误: ${error.message}`);
                throw error;
            }
        }
    }
}
```

## 核心测试场景

### 完整文件导入流程
```javascript
describe('完整文件导入流程 E2E 测试', () => {
    let extension;
    let testData;
    let scenarioManager;
    
    beforeAll(async () => {
        scenarioManager = new TestScenarioManager();
        
        // 定义导入流程场景
        scenarioManager.defineScenario('fileImportWorkflow', {
            description: '用户完整的文件导入工作流',
            steps: [
                {
                    description: '用户启动扩展',
                    action: async (data) => {
                        data.extension = new Eagle2AeExtension();
                        await data.extension.initialize();
                    }
                },
                {
                    description: '用户选择文件',
                    action: async (data) => {
                        data.selectedFiles = await data.extension.selectFiles(data.testFiles);
                        expect(data.selectedFiles.length).toBe(data.testFiles.length);
                    }
                },
                {
                    description: '用户配置导入设置',
                    action: async (data) => {
                        data.importSettings = {
                            importMode: 'footage',
                            createComposition: true,
                            organizeFolders: true,
                            targetFolder: 'E2E Test Import'
                        };
                    }
                },
                {
                    description: '用户执行导入',
                    action: async (data) => {
                        data.importResult = await data.extension.importFiles(
                            data.selectedFiles, 
                            data.importSettings
                        );
                    }
                },
                {
                    description: '验证导入结果',
                    action: async (data) => {
                        expect(data.importResult.success).toBeTruthy();
                        expect(data.importResult.imported).toBe(data.testFiles.length);
                        
                        // 验证 AE 项目状态
                        const projectInfo = await data.extension.getProjectInfo();
                        expect(projectInfo.itemCount).toBeGreaterThan(data.testFiles.length);
                    }
                }
            ]
        });
    });
    
    beforeEach(async () => {
        testData = {
            testFiles: [
                TestDataFactory.createImageFile({ name: 'test1.jpg' }),
                TestDataFactory.createImageFile({ name: 'test2.png' }),
                TestDataFactory.createVideoFile({ name: 'test1.mp4' })
            ]
        };
    });
    
    itAsync('应该成功完成完整的文件导入流程', async () => {
        await scenarioManager.executeScenario('fileImportWorkflow', testData);
    });
});
```

### 项目状态检查流程
```javascript
describe('项目状态检查 E2E 测试', () => {
    let extension;
    let testData;
    
    beforeEach(async () => {
        extension = new Eagle2AeExtension();
        await extension.initialize();
        
        testData = {
            testFiles: TestDataFactory.createFileList(5)
        };
    });
    
    itAsync('应该正确检查项目状态并提供反馈', async () => {
        // 1. 检查初始项目状态
        const initialStatus = await extension.checkProjectStatus();
        expect(initialStatus.valid).toBeTruthy();
        
        // 2. 导入一些文件
        await extension.importFiles(testData.testFiles, {
            importMode: 'footage'
        });
        
        // 3. 再次检查项目状态
        const updatedStatus = await extension.checkProjectStatus();
        expect(updatedStatus.valid).toBeTruthy();
        expect(updatedStatus.itemCount).toBeGreaterThan(initialStatus.itemCount);
        
        // 4. 验证状态报告的准确性
        expect(updatedStatus.lastImportTime).toBeTruthy();
        expect(updatedStatus.memoryUsage).toBeGreaterThan(0);
    });
    
    itAsync('应该正确处理项目状态异常', async () => {
        // 模拟项目状态异常
        await extension.simulateProjectError('INSUFFICIENT_MEMORY');
        
        // 检查项目状态
        const status = await extension.checkProjectStatus();
        expect(status.valid).toBeFalsy();
        expect(status.issues.length).toBeGreaterThan(0);
        expect(status.issues[0].code).toBe('INSUFFICIENT_MEMORY');
    });
});
```

## 测试数据管理

### 真实场景数据
- 使用脱敏后的真实用户数据
- 准备多样化的文件类型和大小
- 模拟不同的用户操作习惯

```javascript
/**
 * E2E 测试数据管理器
 */
class E2ETestDataManager {
    constructor() {
        this.testFiles = [];
        this.testProjects = [];
    }
    
    /**
     * 初始化测试数据
     */
    async initialize() {
        // 准备真实的测试文件
        await this.prepareRealisticTestFiles();
        
        // 准备测试项目场景
        await this.prepareTestProjects();
    }
    
    /**
     * 准备真实的测试文件
     */
    async prepareRealisticTestFiles() {
        // 不同类型的文件
        this.testFiles = [
            // 图片文件
            { path: '/test/photos/vacation.jpg', type: 'image/jpeg', size: 2048000 },
            { path: '/test/photos/family.png', type: 'image/png', size: 3072000 },
            { path: '/test/photos/nature.tiff', type: 'image/tiff', size: 5120000 },
            
            // 视频文件
            { path: '/test/videos/clip1.mp4', type: 'video/mp4', size: 51200000 },
            { path: '/test/videos/clip2.mov', type: 'video/quicktime', size: 76800000 },
            
            // 音频文件
            { path: '/test/audio/sound1.wav', type: 'audio/wav', size: 10240000 },
            { path: '/test/audio/sound2.mp3', type: 'audio/mp3', size: 5120000 }
        ];
        
        // 创建实际的测试文件
        for (const file of this.testFiles) {
            await this.createActualTestFile(file);
        }
    }
    
    /**
     * 创建实际的测试文件
     */
    async createActualTestFile(fileInfo) {
        // 根据文件类型创建相应的内容
        if (fileInfo.type.startsWith('image/')) {
            await this.createTestImage(fileInfo.path, fileInfo.size);
        } else if (fileInfo.type.startsWith('video/')) {
            await this.createTestVideo(fileInfo.path, fileInfo.size);
        } else if (fileInfo.type.startsWith('audio/')) {
            await this.createTestAudio(fileInfo.path, fileInfo.size);
        }
    }
}
```

### 测试场景数据
```javascript
/**
 * 测试场景数据工厂
 */
class E2ETestScenarioFactory {
    static createBasicImportScenario() {
        return {
            name: 'basicImport',
            description: '基本文件导入场景',
            files: [
                TestDataFactory.createImageFile({ name: 'basic.jpg' })
            ],
            settings: {
                importMode: 'footage',
                createComposition: false
            }
        };
    }
    
    static createAdvancedImportScenario() {
        return {
            name: 'advancedImport',
            description: '高级文件导入场景',
            files: [
                TestDataFactory.createImageFile({ name: 'image1.jpg' }),
                TestDataFactory.createImageFile({ name: 'image2.png' }),
                TestDataFactory.createVideoFile({ name: 'video1.mp4' })
            ],
            settings: {
                importMode: 'footage',
                createComposition: true,
                organizeFolders: true,
                targetFolder: 'Advanced Import'
            }
        };
    }
    
    static createBatchImportScenario() {
        return {
            name: 'batchImport',
            description: '批量文件导入场景',
            files: TestDataFactory.createLargeFileList(50),
            settings: {
                importMode: 'footage',
                batchSize: 10
            }
        };
    }
}
```

## 测试执行规范

### 测试执行环境
- 使用真实的 After Effects 环境
- 配置标准的测试硬件环境
- 确保测试环境的稳定性和一致性

### 测试执行流程
```javascript
/**
 * E2E 测试执行器
 */
class E2ETestRunner {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            duration: 0
        };
    }
    
    /**
     * 执行测试套件
     */
    async runTestSuite(testSuite) {
        console.log(`开始执行测试套件: ${testSuite.name}`);
        const startTime = Date.now();
        
        try {
            // 执行测试套件中的所有测试
            for (const test of testSuite.tests) {
                await this.runTest(test);
            }
            
            const endTime = Date.now();
            this.results.duration = endTime - startTime;
            
            this.printResults();
        } catch (error) {
            console.error('测试套件执行失败:', error);
            throw error;
        }
    }
    
    /**
     * 执行单个测试
     */
    async runTest(test) {
        this.results.total++;
        
        try {
            await test();
            this.results.passed++;
            console.log(`✓ ${test.name}`);
        } catch (error) {
            this.results.failed++;
            console.log(`✗ ${test.name}`);
            console.log(`  错误: ${error.message}`);
        }
    }
    
    /**
     * 输出测试结果
     */
    printResults() {
        console.log('\nE2E 测试结果:');
        console.log('='.repeat(50));
        console.log(`总计: ${this.results.total}`);
        console.log(`通过: ${this.results.passed}`);
        console.log(`失败: ${this.results.failed}`);
        console.log(`执行时间: ${this.results.duration}ms`);
        
        const successRate = this.results.total > 0 ? 
            (this.results.passed / this.results.total * 100).toFixed(2) : 0;
        console.log(`成功率: ${successRate}%`);
    }
}
```

## 测试覆盖要求

### 核心用户场景
- **文件导入流程**: 100% 覆盖
- **项目管理操作**: 95% 以上
- **设置配置流程**: 90% 以上
- **错误处理场景**: 85% 以上

### 关键业务流程
1. 用户从启动扩展到完成文件导入的完整流程
2. 项目状态检查和问题修复流程
3. 配置管理和预设应用流程
4. 批量文件处理和进度监控流程

## 测试最佳实践

### 测试稳定性
- 确保测试环境的稳定性和一致性
- 处理外部依赖的不确定性
- 实现测试失败的自动重试机制

```javascript
/**
 * 稳定的 E2E 测试基类
 */
class StableE2ETest {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 5000; // 5 秒
    }
    
    /**
     * 带重试机制的测试执行
     */
    async executeWithRetry(testFunction, testName) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`执行测试 (${attempt}/${this.maxRetries}): ${testName}`);
                await testFunction();
                return; // 成功执行，直接返回
            } catch (error) {
                lastError = error;
                console.log(`测试失败 (${attempt}/${this.maxRetries}): ${error.message}`);
                
                if (attempt < this.maxRetries) {
                    console.log(`等待 ${this.retryDelay}ms 后重试...`);
                    await this.delay(this.retryDelay);
                }
            }
        }
        
        // 所有重试都失败，抛出最后一个错误
        throw new Error(`测试失败（已重试 ${this.maxRetries} 次）: ${lastError.message}`);
    }
    
    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

### 测试数据清理
- 确保测试后的环境清理
- 避免测试数据的累积
- 恢复测试环境到初始状态

```javascript
describe('测试数据清理', () => {
    let testDataManager;
    
    beforeEach(async () => {
        testDataManager = new E2ETestDataManager();
        await testDataManager.initialize();
    });
    
    afterEach(async () => {
        // 确保测试数据被清理
        await testDataManager.cleanup();
        
        // 额外的清理步骤
        await cleanupTestProjects();
        await resetExtensionState();
    });
    
    itAsync('应该在测试后清理所有创建的资源', async () => {
        // 执行测试操作
        const testFiles = testDataManager.getTestFiles();
        await extension.importFiles(testFiles, {
            importMode: 'footage'
        });
        
        // 验证导入成功
        const projectInfo = await extension.getProjectInfo();
        expect(projectInfo.itemCount).toBeGreaterThan(0);
        
        // 清理会在 afterEach 中自动执行
    });
});
```

### 测试报告和监控
- 生成详细的测试报告
- 监控测试执行的性能指标
- 设置测试失败的告警机制

```javascript
/**
 * E2E 测试报告生成器
 */
class E2ETestReporter {
    constructor() {
        this.reportData = {
            startTime: null,
            endTime: null,
            scenarios: [],
            performance: []
        };
    }
    
    /**
     * 记录测试场景结果
     */
    recordScenarioResult(scenarioName, result, duration) {
        this.reportData.scenarios.push({
            name: scenarioName,
            result: result,
            duration: duration,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * 记录性能指标
     */
    recordPerformanceMetric(metricName, value) {
        this.reportData.performance.push({
            name: metricName,
            value: value,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * 生成测试报告
     */
    generateReport() {
        const report = {
            ...this.reportData,
            summary: this.generateSummary(),
            recommendations: this.generateRecommendations()
        };
        
        // 保存报告到文件
        const reportPath = path.join(__dirname, '../reports/e2e-test-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        return report;
    }
    
    generateSummary() {
        const totalScenarios = this.reportData.scenarios.length;
        const passedScenarios = this.reportData.scenarios.filter(s => s.result === 'passed').length;
        
        return {
            totalScenarios,
            passedScenarios,
            failedScenarios: totalScenarios - passedScenarios,
            successRate: totalScenarios > 0 ? (passedScenarios / totalScenarios * 100).toFixed(2) : 0,
            totalDuration: this.reportData.scenarios.reduce((sum, s) => sum + s.duration, 0)
        };
    }
    
    generateRecommendations() {
        const recommendations = [];
        
        // 基于性能数据生成建议
        const slowScenarios = this.reportData.scenarios
            .filter(s => s.duration > 30000) // 超过 30 秒的场景
            .map(s => s.name);
            
        if (slowScenarios.length > 0) {
            recommendations.push({
                type: 'performance',
                message: `以下场景执行时间较长: ${slowScenarios.join(', ')}，建议优化性能`
            });
        }
        
        return recommendations;
    }
}
```

## 测试维护规范

### 测试更新策略
- 当用户场景变更时，相应更新 E2E 测试
- 定期审查和优化测试用例
- 删除过时或不再相关的测试场景

### 测试文档化
- 为复杂的测试场景添加详细注释
- 记录测试的前置条件和预期结果
- 维护测试场景的使用指南

### 测试团队协作
- 建立测试用例的代码审查机制
- 定期分享测试最佳实践
- 维护测试知识库和常见问题解答

## 相关文档

- [测试规范](./testing-standards.md) - 完整的测试规范文档
- [单元测试规范](./unit-testing-standards.md) - 单元测试标准
- [集成测试规范](./integration-testing-standards.md) - 集成测试标准
- [编码规范](./coding-standards.md) - 编码标准和最佳实践

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始端到端测试规范文档 | 开发团队 |