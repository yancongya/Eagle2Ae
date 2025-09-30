### 批量状态检测器 (BatchStatusChecker) *(v2.4.0新增)*

用于优化多个并发状态检测请求。

#### 构造函数

```javascript
/**
 * 批量状态检测器构造函数
 * 将多个检测请求合并为一次检测，提高性能
 */
class BatchStatusChecker {
    constructor()
```

#### requestStatusCheck()
请求状态检查

```javascript
/**
 * 请求状态检查
 * @returns {Promise<Object>} 状态检测结果
 */
requestStatusCheck()
```

#### processBatch()
处理批量请求

```javascript
/**
 * 处理批量请求
 * @private
 */
async processBatch()
```
