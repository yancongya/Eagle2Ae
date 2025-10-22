# “连接状态”按钮功能说明

## 概述

“连接状态”按钮是“项目信息”面板中的一个核心交互组件。它不仅用于实时显示与Eagle插件的连接状态，还允许用户手动触发连接测试。

- **ID**: `test-connection-btn`
- **位置**: 项目信息面板左侧

## 交互逻辑

当用户点击此按钮时，会触发 `main.js` 中的 `testConnection()` 函数。该函数会尝试通过WebSocket向Eagle插件发送一个 `ping` 请求，并等待 `pong` 响应，以计算延迟并确认连接状态。

```javascript
// main.js
testConnection() {
    this.log('正在测试与Eagle的连接...');
    // ... WebSocket ping/pong 逻辑 ...
}
```

## 状态详解

按钮的UI会根据连接结果动态变化，主要包含以下四种状态：

### 1. 未连接 (Not Connected)
- **指示器颜色**: 灰色 (`#status-indicator.grey`)
- **状态文本**: "未连接"
- **触发条件**:
  - 插件初始化时的默认状态。
  - WebSocket连接已断开或从未成功建立。

### 2. 连接中 (Connecting)
- **指示器颜色**: 黄色 (`#status-indicator.yellow`)
- **状态文本**: "连接中"
- **触发条件**:
  - 正在尝试建立WebSocket连接。
  - 已发送 `ping` 请求，正在等待 `pong` 响应。

### 3. 已连接 (Connected)
- **指示器颜色**: 绿色 (`#status-indicator.green`)
- **状态文本**: "已连接"
- **延迟显示**: 右侧的 `#ping-time` 元素会显示 `ping` 和 `pong` 之间的延迟（例如 `12ms`）。
- **触发条件**:
  - 成功收到 `pong` 响应，确认连接有效。

### 4. 连接失败 (Failed)
- **指示器颜色**: 红色 (`#status-indicator.red`)
- **状态文本**: "连接失败"
- **触发条件**:
  - WebSocket连接尝试失败。
  - 发送 `ping` 请求后超时未收到 `pong` 响应。

---

**相关文档**:
- [UI组件说明](../api/ui-components.md)
- [通信协议设计](../../architecture/communication-protocol.md)
