### 轮询管理器类 (PollingManager)

用于HTTP兼容模式下的定期消息轮询。

#### 构造函数

```javascript
/**
 * 轮询管理器构造函数
 * @param {Function} callback - 每次轮询时要执行的回调函数
 * @param {number} [interval=500] - 轮询的时间间隔（毫秒）
 */
constructor(callback, interval = 500)
```

#### start()
启动轮询

```javascript
/**
 * 启动轮询
 */
start()
```

#### stop()
停止轮询

```javascript
/**
 * 停止轮询
 */
stop()
```

#### isRunning()
检查轮询状态

```javascript
/**
 * 检查轮询是否正在运行
 * @returns {boolean} 轮询状态
 */
isRunning()
```

**示例**:
```javascript
const pollingManager = new PollingManager(() => {
    // 轮询回调函数
    console.log('执行轮询任务');
}, 1000);

pollingManager.start();
console.log('轮询状态:', pollingManager.isRunning()); // true
```
