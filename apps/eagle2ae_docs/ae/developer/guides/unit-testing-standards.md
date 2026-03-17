# 单元测试规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的单元测试标准和最佳实践，确保代码质量和功能正确性。

## 单元测试原则

### 测试独立性
- 每个测试应该独立运行，不依赖其他测试的结果
- 测试之间不应共享状态
- 每个测试应该能够单独运行

### 测试单一职责
- 每个测试只验证一个功能点
- 避免在单个测试中验证多个不相关的功能
- 测试名称应清晰描述被测试的功能

### 测试可重复性
- 测试结果应一致且可预测
- 避免依赖外部环境或随机数据
- 使用固定的测试数据和预期结果

## 测试框架规范

### JavaScript 单元测试框架

#### 基础测试结构
```javascript
/**
 * 测试框架基础结构
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
}
```

#### 断言库规范
```javascript
/**
 * 断言函数库
 */
function expect(actual) {
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
```

## 测试编写规范

### 测试命名规范
- 使用描述性的测试名称，清晰表达测试意图
- 采用 "应该..." 的格式描述预期行为
- 避免使用模糊的名称如 "test1", "test2"

```javascript
// 好的命名示例
it('应该正确提取文件扩展名', () => {
    // 测试实现
});

it('应该处理不存在的文件路径', () => {
    // 测试实现
});

it('应该验证有效的文件格式', () => {
    // 测试实现
});

// 避免的命名示例
it('测试1', () => {
    // 不清晰的测试意图
});

it('getFileExtension', () => {
    // 没有描述预期行为
});
```

### 测试结构规范
- 使用 AAA 模式：Arrange（准备）、Act（执行）、Assert（断言）
- 保持测试函数简洁，避免复杂的逻辑
- 每个测试只关注一个特定的功能点

```javascript
describe('PathUtils.getFileExtension', () => {
    it('应该正确提取文件扩展名', () => {
        // Arrange - 准备测试数据
        const filePath = '/path/to/image.jpg';
        const expectedExtension = 'jpg';
        
        // Act - 执行被测试的函数
        const actualExtension = PathUtils.getFileExtension(filePath);
        
        // Assert - 验证结果
        expect(actualExtension).toBe(expectedExtension);
    });
});
```

### 测试数据管理
- 使用有意义的测试数据
- 为不同的测试场景准备不同的数据
- 避免在测试中硬编码复杂的数据结构

```javascript
// 好的测试数据管理
describe('文件验证测试', () => {
    const validImageFile = {
        path: '/test/image.jpg',
        name: 'image.jpg',
        size: 1024000,
        type: 'image/jpeg'
    };
    
    const invalidFile = {
        path: '/test/invalid.xyz',
        name: 'invalid.xyz',
        size: 0,
        type: 'unknown'
    };
    
    it('应该接受有效的图片文件', () => {
        const result = validateFile(validImageFile);
        expect(result.valid).toBeTruthy();
    });
    
    it('应该拒绝无效的文件格式', () => {
        const result = validateFile(invalidFile);
        expect(result.valid).toBeFalsy();
    });
});
```

## 测试覆盖率要求

### 核心功能覆盖率
- **核心业务逻辑**: 95% 以上
- **工具函数**: 90% 以上
- **错误处理**: 85% 以上
- **边界条件**: 80% 以上

### 覆盖率统计方法
- 使用代码覆盖率工具统计行覆盖率、函数覆盖率和分支覆盖率
- 定期检查覆盖率报告，确保覆盖率不下降
- 对于新功能开发，要求达到相应的覆盖率标准

## 测试类型规范

### 纯函数测试
- 测试不依赖外部状态的纯函数
- 验证输入输出的正确性
- 覆盖所有可能的输入组合

```javascript
describe('数学计算函数测试', () => {
    it('应该正确计算两个数的和', () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
        expect(add(0, 0)).toBe(0);
    });
    
    it('应该处理大数计算', () => {
        expect(add(Number.MAX_SAFE_INTEGER, 1)).toBe(Number.MAX_SAFE_INTEGER + 1);
    });
});
```

### 异步函数测试
- 测试异步操作的正确性
- 验证 Promise 的 resolve 和 reject 状态
- 处理异步操作的超时情况

```javascript
describe('异步文件操作测试', () => {
    itAsync('应该成功读取存在的文件', async () => {
        const filePath = '/test/existing-file.txt';
        const content = await readFile(filePath);
        expect(content).toBeTruthy();
    });
    
    itAsync('应该处理文件不存在的错误', async () => {
        const filePath = '/test/non-existent-file.txt';
        try {
            await readFile(filePath);
            expect(false).toBeTruthy(); // 不应该到达这里
        } catch (error) {
            expect(error.code).toBe('ENOENT');
        }
    });
});
```

### 错误处理测试
- 验证错误情况下的正确处理
- 确保错误信息清晰且有用
- 测试错误恢复机制

```javascript
describe('错误处理测试', () => {
    it('应该抛出适当的错误信息', () => {
        expect(() => {
            validateRequiredParameter(null, 'filePath');
        }).toThrow('参数 filePath 不能为空');
    });
    
    it('应该处理网络错误', () => {
        const networkError = new NetworkError('连接超时', 'TIMEOUT');
        expect(networkError.code).toBe('TIMEOUT');
        expect(networkError.message).toBe('连接超时');
    });
});
```

## 测试最佳实践

### 使用测试夹具
- 创建可重用的测试数据和环境
- 确保测试环境的一致性
- 简化测试代码的编写

```javascript
// 测试夹具示例
class TestFixture {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp');
    }
    
    createTestFile(name, content) {
        const filePath = path.join(this.tempDir, name);
        fs.writeFileSync(filePath, content);
        return filePath;
    }
    
    cleanup() {
        if (fs.existsSync(this.tempDir)) {
            fs.rmSync(this.tempDir, { recursive: true });
        }
    }
}

// 在测试中使用夹具
describe('文件操作测试', () => {
    let fixture;
    
    beforeEach(() => {
        fixture = new TestFixture();
    });
    
    afterEach(() => {
        fixture.cleanup();
    });
    
    it('应该能够读取创建的测试文件', () => {
        const filePath = fixture.createTestFile('test.txt', 'Hello World');
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toBe('Hello World');
    });
});
```

### 模拟和存根
- 使用模拟对象替代外部依赖
- 验证函数调用的正确性
- 控制测试环境的行为

```javascript
// 模拟函数示例
function mock(originalFunction) {
    const calls = [];
    let returnValue = undefined;
    
    const mockFunction = function(...args) {
        calls.push({ args, timestamp: Date.now() });
        return returnValue;
    };
    
    mockFunction.mockReturnValue = (value) => {
        returnValue = value;
        return mockFunction;
    };
    
    mockFunction.getCalls = () => calls;
    mockFunction.getCallCount = () => calls.length;
    
    return mockFunction;
}

// 使用模拟函数
describe('服务调用测试', () => {
    it('应该正确调用文件服务', () => {
        const mockFileService = {
            saveFile: mock().mockReturnValue({ success: true })
        };
        
        const result = processAndSaveFile(mockFileService, 'test.txt', 'content');
        
        expect(mockFileService.saveFile.getCallCount()).toBe(1);
        expect(result.success).toBeTruthy();
    });
});
```

### 性能测试
- 验证关键功能的性能要求
- 监控性能回归
- 设置合理的性能基准

```javascript
describe('性能测试', () => {
    it('文件验证应该在 10ms 内完成', () => {
        const largeFileList = generateTestFiles(1000);
        
        const startTime = performance.now();
        const results = validateFiles(largeFileList);
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(10); // 10ms
        expect(results.length).toBe(1000);
    });
});
```

## 测试维护规范

### 测试代码审查
- 测试代码应与生产代码一样进行审查
- 确保测试的可读性和可维护性
- 验证测试覆盖率和质量

### 测试更新
- 当生产代码变更时，相应更新测试代码
- 删除过时或不再相关的测试
- 添加新的测试以覆盖新功能

### 测试文档
- 为复杂的测试用例添加注释
- 记录测试的假设和限制
- 维护测试指南和最佳实践文档

## 相关文档

- [测试规范](./testing-standards.md) - 完整的测试规范文档
- [集成测试规范](./integration-testing-standards.md) - 集成测试标准
- [端到端测试规范](./e2e-testing-standards.md) - 端到端测试标准
- [编码规范](./coding-standards.md) - 编码标准和最佳实践

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始单元测试规范文档 | 开发团队 |