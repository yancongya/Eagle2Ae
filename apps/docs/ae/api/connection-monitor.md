### 连接监控器类 (ConnectionMonitor)

用于监控与Eagle插件的连接质量。

#### 构造函数

```javascript
/**
 * 连接监控器构造函数
 */
constructor()
```

#### recordPing()
记录成功的ping请求

```javascript
/**
 * 记录一次成功的ping请求
 * @param {number} startTime - 请求开始的时间戳
 * @returns {number} 本次请求的延迟时间
 */
recordPing(startTime)
```

#### recordFailure()
记录失败的连接尝试

```javascript
/**
 * 记录一次失败的连接尝试
 */
recordFailure()
```

#### getAveragePing()
获取平均延迟

```javascript
/**
 * 计算平均ping延迟
 * @returns {number} 平均延迟时间（毫秒）
 */
getAveragePing()
```

#### getSuccessRate()
获取连接成功率

```javascript
/**
 * 计算连接成功率
 * @returns {number} 成功率百分比 (0-100)
 */
getSuccessRate()
```

**示例**:
```javascript
const monitor = new ConnectionMonitor();

// 记录ping请求
const startTime = Date.now();

// 模拟成功的ping
const pingTime = monitor.recordPing(startTime);
console.log('本次延迟:', pingTime, 'ms');
console.log('平均延迟:', monitor.getAveragePing(), 'ms');
console.log('成功率:', monitor.getSuccessRate(), '%');
```
