## 事件系统 *(v2.4.0新增)*

### EventEmitter 类

提供事件发布订阅机制。

#### 构造函数

```javascript
/**
 * 事件发射器构造函数
 */
class EventEmitter {
    constructor()
}
```

#### on()
注册事件监听器

```javascript
/**
 * 注册事件监听器
 * @param {string} event - 事件名称
 * @param {Function} listener - 监听器函数
 */
on(event, listener)
```

#### off()
移除事件监听器

```javascript
/**
 * 移除事件监听器
 * @param {string} event - 事件名称
 * @param {Function} listener - 监听器函数
 */
off(event, listener)
```

#### emit()
触发事件

```javascript
/**
 * 触发事件
 * @param {string} event - 事件名称
 * @param {...any} args - 事件参数
 */
emit(event, ...args)
```

#### once()
注册一次性事件监听器

```javascript
/**
 * 注册一次性事件监听器
 * @param {string} event - 事件名称
 * @param {Function} listener - 监听器函数
 */
once(event, listener)
```

### 系统事件

#### 连接事件

```javascript
// WebSocket连接建立
app.on('websocket:connected', (connection) => {
    console.log('WebSocket连接已建立');
});

// WebSocket连接断开
app.on('websocket:disconnected', (reason) => {
    console.log('WebSocket连接已断开:', reason);
});

// Eagle连接状态变化
app.on('eagle:connection_changed', (connected) => {
    console.log('Eagle连接状态:', connected ? '已连接' : '已断开');
});
```

#### 文件操作事件

```javascript
// 文件导入开始
app.on('file:import_start', (files) => {
    console.log('开始导入文件:', files.length);
});

// 文件导入完成
app.on('file:import_complete', (result) => {
    console.log('文件导入完成:', result);
});

// 文件导入失败
app.on('file:import_error', (error) => {
    console.error('文件导入失败:', error);
});
```

#### 状态检测事件

```javascript
// 状态检测开始
app.on('status:check_start', () => {
    console.log('开始状态检测');
});

// 状态检测完成
app.on('status:check_complete', (result) => {
    console.log('状态检测完成:', result);
});

// 状态变化
app.on('status:changed', (changes) => {
    console.log('状态发生变化:', changes);
});
```
