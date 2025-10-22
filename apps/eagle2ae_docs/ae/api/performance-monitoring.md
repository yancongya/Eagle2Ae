## 性能监控 *(v2.4.0新增)*

### PerformanceMonitor 类

性能监控器，用于跟踪关键操作的性能指标。

#### 构造函数

```javascript
/**
 * 性能监控器构造函数
 */
class PerformanceMonitor {
    constructor()
}
```

#### startTimer()
开始计时

```javascript
/**
 * 开始计时
 * @param {string} name - 计时器名称
 */
startTimer(name)
```

#### endTimer()
结束计时

```javascript
/**
 * 结束计时
 * @param {string} name - 计时器名称
 * @returns {number} 耗时（毫秒）
 */
endTimer(name)
```

#### recordMetric()
记录性能指标

```javascript
/**
 * 记录性能指标
 * @param {string} name - 指标名称
 * @param {number} value - 指标值
 * @param {string} [unit='ms'] - 单位
 */
recordMetric(name, value, unit = 'ms')
```

#### getReport()
获取性能报告

```javascript
/**
 * 获取性能报告
 * @returns {Object} 性能报告
 */
getReport()
```

**使用示例**:
```javascript
const perfMonitor = new PerformanceMonitor();

// 监控文件导入性能
perfMonitor.startTimer('file_import');
await importFiles();
const duration = perfMonitor.endTimer('file_import');

// 记录内存使用
perfMonitor.recordMetric('memory_usage', process.memoryUsage().heapUsed, 'bytes');

// 获取报告
const report = perfMonitor.getReport();
console.log('性能报告:', report);
```
