# 性能测试规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的性能测试标准和最佳实践，确保系统在各种负载条件下的性能表现和稳定性。

## 性能测试原则

### 测试目标
- 识别系统性能瓶颈
- 验证系统在预期负载下的表现
- 确保系统满足性能需求和 SLA

### 测试类型
- **负载测试**: 验证系统在预期负载下的表现
- **压力测试**: 确定系统在超出正常负载条件下的极限
- **稳定性测试**: 验证系统在长时间运行下的稳定性
- **资源使用测试**: 监控系统资源的使用情况

### 测试指标
- **响应时间**: 系统处理请求所需的时间
- **吞吐量**: 单位时间内处理的请求数量
- **资源利用率**: CPU、内存、磁盘和网络的使用情况
- **错误率**: 在测试期间发生的错误比例

## 性能测试框架

### 测试工具
- 使用标准的性能测试工具如 Apache JMeter、Artillery 或自定义测试脚本
- 集成性能监控工具如 Prometheus、Grafana
- 使用日志分析工具如 ELK Stack

### 测试环境
```javascript
/**
 * 性能测试环境配置
 */
class PerformanceTestEnvironment {
    constructor() {
        this.config = {
            // 测试环境配置
            environment: {
                cpu: 'Intel i7-8700K',
                memory: '16GB DDR4',
                storage: '512GB SSD',
                os: 'Windows 10 Pro',
                aeVersion: '2024',
                extensionVersion: '2.4.0'
            },
            
            // 性能基准
            baselines: {
                importTimePerFile: 2000, // 每个文件导入时间 (ms)
                maxConcurrentImports: 5,  // 最大并发导入数
                memoryUsageLimit: 2048,   // 内存使用限制 (MB)
                cpuUsageLimit: 80         // CPU 使用限制 (%)
            },
            
            // 监控配置
            monitoring: {
                interval: 1000,           // 监控间隔 (ms)
                metrics: ['cpu', 'memory', 'disk', 'network']
            }
        };
    }
    
    /**
     * 初始化测试环境
     */
    async initialize() {
        // 设置性能监控
        this.performanceMonitor = new PerformanceMonitor();
        await this.performanceMonitor.start();
        
        // 配置测试数据
        this.testDataManager = new PerformanceTestDataManager();
        await this.testDataManager.initialize();
    }
    
    /**
     * 清理测试环境
     */
    async cleanup() {
        if (this.performanceMonitor) {
            await this.performanceMonitor.stop();
        }
        
        if (this.testDataManager) {
            await this.testDataManager.cleanup();
        }
    }
}
```

### 测试执行框架
```javascript
/**
 * 性能测试执行器
 */
class PerformanceTestRunner {
    constructor() {
        this.results = [];
        this.metrics = [];
    }
    
    /**
     * 执行性能测试
     */
    async runTest(testConfig) {
        console.log(`开始执行性能测试: ${testConfig.name}`);
        
        const startTime = Date.now();
        const metricsCollector = new MetricsCollector();
        
        try {
            // 启动监控
            metricsCollector.start();
            
            // 执行测试场景
            const result = await this.executeTestScenario(testConfig);
            
            // 停止监控
            const metrics = metricsCollector.stop();
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 记录测试结果
            this.recordTestResult({
                ...testConfig,
                result,
                metrics,
                duration,
                timestamp: new Date().toISOString()
            });
            
            return { result, metrics, duration };
            
        } catch (error) {
            console.error(`性能测试执行失败: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 记录测试结果
     */
    recordTestResult(testResult) {
        this.results.push(testResult);
        
        // 实时输出关键指标
        console.log(`测试结果 - ${testResult.name}:`);
        console.log(`  执行时间: ${testResult.duration}ms`);
        console.log(`  平均响应时间: ${testResult.metrics.avgResponseTime}ms`);
        console.log(`  吞吐量: ${testResult.metrics.throughput} req/s`);
        console.log(`  CPU 使用率: ${testResult.metrics.cpuUsage}%`);
        console.log(`  内存使用: ${testResult.metrics.memoryUsage}MB`);
    }
}
```

## 核心性能测试场景

### 文件导入性能测试
```javascript
describe('文件导入性能测试', () => {
    let extension;
    let performanceRunner;
    let testDataManager;
    
    beforeAll(async () => {
        performanceRunner = new PerformanceTestRunner();
        testDataManager = new PerformanceTestDataManager();
        await testDataManager.initialize();
    });
    
    beforeEach(() => {
        extension = new Eagle2AeExtension();
    });
    
    /**
     * 单文件导入性能测试
     */
    itAsync('小文件导入性能测试', async () => {
        const testConfig = {
            name: '小文件导入性能测试',
            description: '测试小文件（<1MB）的导入性能',
            iterations: 100,
            concurrent: 1,
            fileSpec: {
                type: 'image',
                size: '<1MB'
            }
        };
        
        const testFiles = testDataManager.createTestFiles(100, { maxSize: 1024 * 1024 });
        
        const result = await performanceRunner.runTest({
            ...testConfig,
            testFunction: async () => {
                const importResults = [];
                for (const file of testFiles) {
                    const startTime = performance.now();
                    const importResult = await extension.importFile(file);
                    const endTime = performance.now();
                    
                    importResults.push({
                        ...importResult,
                        duration: endTime - startTime
                    });
                }
                return importResults;
            }
        });
        
        // 验证性能指标
        const avgDuration = result.result.reduce((sum, r) => sum + r.duration, 0) / result.result.length;
        expect(avgDuration).toBeLessThan(2000); // 平均导入时间应小于 2 秒
        
        // 验证资源使用
        expect(result.metrics.cpuUsage).toBeLessThan(80);
        expect(result.metrics.memoryUsage).toBeLessThan(2048);
    });
    
    /**
     * 大文件导入性能测试
     */
    itAsync('大文件导入性能测试', async () => {
        const testConfig = {
            name: '大文件导入性能测试',
            description: '测试大文件（>10MB）的导入性能',
            iterations: 10,
            concurrent: 1,
            fileSpec: {
                type: 'video',
                size: '>10MB'
            }
        };
        
        const testFiles = testDataManager.createTestFiles(10, { minSize: 10 * 1024 * 1024 });
        
        const result = await performanceRunner.runTest({
            ...testConfig,
            testFunction: async () => {
                const importResults = [];
                for (const file of testFiles) {
                    const startTime = performance.now();
                    const importResult = await extension.importFile(file);
                    const endTime = performance.now();
                    
                    importResults.push({
                        ...importResult,
                        duration: endTime - startTime
                    });
                }
                return importResults;
            }
        });
        
        // 验证性能指标
        const avgDuration = result.result.reduce((sum, r) => sum + r.duration, 0) / result.result.length;
        expect(avgDuration).toBeLessThan(10000); // 平均导入时间应小于 10 秒
        
        // 验证内存使用
        expect(result.metrics.peakMemoryUsage).toBeLessThan(4096); // 峰值内存应小于 4GB
    });
    
    /**
     * 批量导入性能测试
     */
    itAsync('批量导入性能测试', async () => {
        const testConfig = {
            name: '批量导入性能测试',
            description: '测试批量文件导入的性能',
            iterations: 5,
            concurrent: 1,
            batchSize: 50
        };
        
        const result = await performanceRunner.runTest({
            ...testConfig,
            testFunction: async () => {
                const batchResults = [];
                for (let i = 0; i < 5; i++) {
                    const batchFiles = testDataManager.createTestFiles(50);
                    const startTime = performance.now();
                    const batchResult = await extension.importFiles(batchFiles);
                    const endTime = performance.now();
                    
                    batchResults.push({
                        ...batchResult,
                        duration: endTime - startTime,
                        batchSize: batchFiles.length
                    });
                }
                return batchResults;
            }
        });
        
        // 验证批量处理性能
        const avgBatchTime = result.result.reduce((sum, r) => sum + r.duration, 0) / result.result.length;
        const avgPerFileTime = avgBatchTime / 50; // 平均每个文件的时间
        
        expect(avgPerFileTime).toBeLessThan(1500); // 批量导入时每个文件应小于 1.5 秒
        
        // 验证吞吐量
        expect(result.metrics.throughput).toBeGreaterThan(0.5); // 吞吐量应大于 0.5 文件/秒
    });
});
```

### 并发性能测试
```javascript
describe('并发性能测试', () => {
    let extension;
    let performanceRunner;
    let testDataManager;
    
    /**
     * 并发文件导入测试
     */
    itAsync('并发导入性能测试', async () => {
        const testConfig = {
            name: '并发导入性能测试',
            description: '测试多个并发导入操作的性能',
            concurrent: 5, // 5 个并发导入
            iterations: 20
        };
        
        const testFiles = testDataManager.createTestFiles(100);
        
        const result = await performanceRunner.runTest({
            ...testConfig,
            testFunction: async () => {
                // 创建并发导入任务
                const importPromises = [];
                const batchSize = Math.ceil(testFiles.length / 5);
                
                for (let i = 0; i < 5; i++) {
                    const batch = testFiles.slice(i * batchSize, (i + 1) * batchSize);
                    importPromises.push(extension.importFiles(batch));
                }
                
                // 并发执行导入
                const startTime = performance.now();
                const results = await Promise.all(importPromises);
                const endTime = performance.now();
                
                return {
                    results,
                    duration: endTime - startTime,
                    totalFiles: testFiles.length
                };
            }
        });
        
        // 验证并发性能
        expect(result.result.duration).toBeLessThan(30000); // 总时间应小于 30 秒
        
        // 验证并发处理能力
        const totalImported = result.result.results.reduce((sum, r) => sum + r.imported, 0);
        expect(totalImported).toBe(result.result.totalFiles);
        
        // 验证资源使用
        expect(result.metrics.peakCpuUsage).toBeLessThan(90);
        expect(result.metrics.peakMemoryUsage).toBeLessThan(3072);
    });
    
    /**
     * WebSocket 通信并发测试
     */
    itAsync('WebSocket 并发通信测试', async () => {
        const testConfig = {
            name: 'WebSocket 并发通信测试',
            description: '测试多个并发 WebSocket 连接的性能',
            concurrent: 10, // 10 个并发连接
            iterations: 100
        };
        
        const result = await performanceRunner.runTest({
            ...testConfig,
            testFunction: async () => {
                // 创建多个 WebSocket 客户端
                const clients = [];
                const messagePromises = [];
                
                // 建立并发连接
                for (let i = 0; i < 10; i++) {
                    const client = new WebSocketClient(`ws://localhost:808${i}`);
                    await client.connect();
                    clients.push(client);
                }
                
                // 发送并发消息
                const startTime = performance.now();
                for (let i = 0; i < 10; i++) {
                    for (let j = 0; j < 10; j++) {
                        const messagePromise = clients[i].sendMessage('test_message', {
                            id: j,
                            data: `test_data_${j}`
                        });
                        messagePromises.push(messagePromise);
                    }
                }
                
                // 等待所有消息响应
                await Promise.all(messagePromises);
                const endTime = performance.now();
                
                // 关闭连接
                for (const client of clients) {
                    await client.disconnect();
                }
                
                return {
                    duration: endTime - startTime,
                    totalMessages: 100,
                    clients: clients.length
                };
            }
        });
        
        // 验证通信性能
        const avgResponseTime = result.result.duration / result.result.totalMessages;
        expect(avgResponseTime).toBeLessThan(100); // 平均响应时间应小于 100ms
        
        // 验证并发连接处理
        expect(result.metrics.websocketConnections).toBe(result.result.clients);
    });
});
```

## 性能基准和指标

### 性能基准定义
```javascript
/**
 * 性能基准配置
 */
const PERFORMANCE_BASELINES = {
    // 文件导入基准
    fileImport: {
        smallFile: {
            size: '<1MB',
            targetTime: 2000,    // 2 秒
            targetSuccessRate: 99.5
        },
        mediumFile: {
            size: '1-10MB',
            targetTime: 5000,    // 5 秒
            targetSuccessRate: 99.0
        },
        largeFile: {
            size: '>10MB',
            targetTime: 10000,   // 10 秒
            targetSuccessRate: 98.0
        }
    },
    
    // 批量处理基准
    batchProcessing: {
        smallBatch: {
            size: 10,
            targetTime: 15000,   // 15 秒
            targetMemory: 512    // 512MB
        },
        mediumBatch: {
            size: 50,
            targetTime: 45000,   // 45 秒
            targetMemory: 1024   // 1GB
        },
        largeBatch: {
            size: 100,
            targetTime: 90000,   // 90 秒
            targetMemory: 2048   // 2GB
        }
    },
    
    // 资源使用基准
    resourceUsage: {
        cpu: {
            average: 60,         // 平均 CPU 使用率 < 60%
            peak: 85             // 峰值 CPU 使用率 < 85%
        },
        memory: {
            average: 1024,       // 平均内存使用 < 1GB
            peak: 2048           // 峰值内存使用 < 2GB
        },
        disk: {
            io: 100              // 磁盘 I/O < 100MB/s
        }
    }
};
```

### 性能监控指标
```javascript
/**
 * 性能监控指标收集器
 */
class MetricsCollector {
    constructor() {
        this.metrics = {
            timestamps: [],
            cpuUsage: [],
            memoryUsage: [],
            responseTimes: [],
            throughput: [],
            errorRates: []
        };
        this.isCollecting = false;
        this.collectionInterval = null;
    }
    
    /**
     * 开始收集指标
     */
    start(interval = 1000) {
        if (this.isCollecting) return;
        
        this.isCollecting = true;
        this.collectionInterval = setInterval(() => {
            this.collectMetrics();
        }, interval);
    }
    
    /**
     * 收集性能指标
     */
    collectMetrics() {
        const timestamp = Date.now();
        this.metrics.timestamps.push(timestamp);
        
        // 收集 CPU 使用率
        const cpuUsage = this.getCpuUsage();
        this.metrics.cpuUsage.push(cpuUsage);
        
        // 收集内存使用
        const memoryUsage = this.getMemoryUsage();
        this.metrics.memoryUsage.push(memoryUsage);
        
        console.log(`性能指标 [${new Date(timestamp).toISOString()}]: CPU=${cpuUsage}%, 内存=${memoryUsage}MB`);
    }
    
    /**
     * 停止收集指标
     */
    stop() {
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }
        
        this.isCollecting = false;
        return this.calculateMetrics();
    }
    
    /**
     * 计算汇总指标
     */
    calculateMetrics() {
        return {
            avgCpuUsage: this.average(this.metrics.cpuUsage),
            peakCpuUsage: Math.max(...this.metrics.cpuUsage),
            avgMemoryUsage: this.average(this.metrics.memoryUsage),
            peakMemoryUsage: Math.max(...this.metrics.memoryUsage),
            totalDuration: this.metrics.timestamps.length > 0 ? 
                this.metrics.timestamps[this.metrics.timestamps.length - 1] - this.metrics.timestamps[0] : 0
        };
    }
    
    /**
     * 获取 CPU 使用率
     */
    getCpuUsage() {
        // 模拟 CPU 使用率收集
        // 在实际实现中，这可能需要使用系统监控工具
        return Math.random() * 80; // 0-80% 的随机值
    }
    
    /**
     * 获取内存使用
     */
    getMemoryUsage() {
        // 模拟内存使用收集
        return Math.random() * 2048; // 0-2048MB 的随机值
    }
    
    /**
     * 计算平均值
     */
    average(values) {
        if (values.length === 0) return 0;
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }
}
```

## 性能优化建议

### 代码优化
- **异步处理**: 使用异步操作避免阻塞 UI 线程
- **批处理**: 合并多个小操作为批量操作
- **缓存机制**: 缓存频繁访问的数据和计算结果
- **内存管理**: 及时释放不再使用的资源

```javascript
/**
 * 性能优化工具类
 */
class PerformanceOptimizer {
    /**
     * 批量处理优化
     */
    static async batchProcess(items, processor, batchSize = 10) {
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map(item => processor(item))
            );
            results.push(...batchResults);
            
            // 在批次之间添加短暂延迟，避免阻塞 UI
            if (i + batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        return results;
    }
    
    /**
     * 内存优化 - 及时清理资源
     */
    static cleanupResources(resources) {
        if (Array.isArray(resources)) {
            resources.forEach(resource => {
                if (resource && typeof resource.cleanup === 'function') {
                    resource.cleanup();
                }
            });
        } else if (resources && typeof resources.cleanup === 'function') {
            resources.cleanup();
        }
    }
    
    /**
     * 缓存管理
     */
    static createCache(maxSize = 100) {
        const cache = new Map();
        const timestamps = new Map();
        
        return {
            get: (key) => {
                if (cache.has(key)) {
                    timestamps.set(key, Date.now());
                    return cache.get(key);
                }
                return undefined;
            },
            
            set: (key, value) => {
                // 如果缓存已满，删除最旧的项
                if (cache.size >= maxSize) {
                    let oldestKey = null;
                    let oldestTime = Infinity;
                    
                    for (const [k, time] of timestamps) {
                        if (time < oldestTime) {
                            oldestTime = time;
                            oldestKey = k;
                        }
                    }
                    
                    if (oldestKey) {
                        cache.delete(oldestKey);
                        timestamps.delete(oldestKey);
                    }
                }
                
                cache.set(key, value);
                timestamps.set(key, Date.now());
            },
            
            clear: () => {
                cache.clear();
                timestamps.clear();
            }
        };
    }
}
```

### 资源优化
- **图片优化**: 压缩和适当尺寸的图片资源
- **代码分割**: 按需加载功能模块
- **网络优化**: 减少网络请求和数据传输
- **存储优化**: 优化数据存储和检索

## 性能测试报告

### 报告格式
```javascript
/**
 * 性能测试报告生成器
 */
class PerformanceTestReporter {
    constructor() {
        this.reportData = {
            testRun: {
                startTime: null,
                endTime: null,
                duration: 0
            },
            testCases: [],
            metrics: {},
            recommendations: []
        };
    }
    
    /**
     * 生成完整的性能测试报告
     */
    generateReport(testResults) {
        this.reportData.testRun.startTime = new Date().toISOString();
        
        // 分析测试结果
        this.analyzeTestResults(testResults);
        
        // 生成建议
        this.generateRecommendations();
        
        this.reportData.testRun.endTime = new Date().toISOString();
        this.reportData.testRun.duration = 
            new Date(this.reportData.testRun.endTime).getTime() - 
            new Date(this.reportData.testRun.startTime).getTime();
        
        return this.formatReport();
    }
    
    /**
     * 分析测试结果
     */
    analyzeTestResults(testResults) {
        testResults.forEach(result => {
            this.reportData.testCases.push({
                name: result.name,
                status: result.success ? 'passed' : 'failed',
                duration: result.duration,
                metrics: result.metrics,
                baseline: this.compareWithBaseline(result)
            });
        });
        
        // 计算总体指标
        this.reportData.metrics = this.calculateOverallMetrics();
    }
    
    /**
     * 与基线对比
     */
    compareWithBaseline(result) {
        const baseline = this.getBaselineForTest(result.name);
        if (!baseline) return null;
        
        return {
            meetsBaseline: result.metrics.avgResponseTime <= baseline.targetTime,
            performanceRatio: result.metrics.avgResponseTime / baseline.targetTime,
            recommendations: this.generateBaselineRecommendations(result, baseline)
        };
    }
    
    /**
     * 生成报告
     */
    formatReport() {
        return {
            summary: this.generateSummary(),
            detailedResults: this.reportData.testCases,
            metrics: this.reportData.metrics,
            recommendations: this.reportData.recommendations
        };
    }
    
    generateSummary() {
        const totalTests = this.reportData.testCases.length;
        const passedTests = this.reportData.testCases.filter(tc => tc.status === 'passed').length;
        
        return {
            totalTests,
            passedTests,
            failedTests: totalTests - passedTests,
            successRate: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0,
            totalDuration: this.reportData.testRun.duration
        };
    }
}
```

## 性能测试维护

### 定期测试
- 建立定期性能测试机制
- 在发布前执行完整的性能测试
- 监控性能趋势和回归

### 测试环境维护
- 确保测试环境的稳定性和一致性
- 定期更新测试工具和框架
- 文档化测试环境的配置和维护

### 持续改进
- 基于测试结果持续优化性能
- 跟踪性能改进的效果
- 分享性能优化的最佳实践

## 相关文档

- [测试规范](./testing-standards.md) - 完整的测试规范文档
- [单元测试规范](./unit-testing-standards.md) - 单元测试标准
- [集成测试规范](./integration-testing-standards.md) - 集成测试标准
- [端到端测试规范](./e2e-testing-standards.md) - 端到端测试标准

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始性能测试规范文档 | 开发团队 |