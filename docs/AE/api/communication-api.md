# 通信 API 参考

## 1. 概述

本文档详细描述了 Eagle2Ae CEP 扩展与 Eagle 插件之间通信所使用的API。当前版本**以HTTP轮询为核心通信方式**，以确保最佳的兼容性和稳定性。

- **主要协议**: HTTP 轮询
- **备用协议**: WebSocket (代码已实现但默认禁用)
- **默认端口**: `8080`

## 2. HTTP 轮询 API (当前启用)

AE插件作为客户端，通过向Eagle插件（作为服务端）发送一系列HTTP请求来完成通信。

### 2.1 核心端点 (Endpoint)

以下是 `main.js` 中实际调用的核心端点列表：

#### `GET /ping`
- **功能**: 测试与Eagle插件的连通性。
- **调用时机**: 用户点击“连接”按钮时，由 `connectHttp()` 函数调用。
- **成功响应**: `{"pong":true, "service":"Eagle2Ae"}`

#### `GET /messages`
- **功能**: 从Eagle插件拉取待处理的消息队列和日志。
- **调用时机**: 连接成功后，由 `PollingManager` 每500ms调用 `pollMessages()` 函数发起此请求。
- **URL参数**: `?clientId={id}` - 用于向服务端标识客户端身份。
- **成功响应**: `{"messages":[...], "eagleLogs":[...]}`

#### `POST /message`
- **功能**: AE插件主动向Eagle插件发送指令或数据。
- **调用时机**: 当需要从AE向Eagle发送数据时，如“导出到Eagle”功能，由 `sendToEagle()` 函数调用。
- **请求体**: 包含消息类型和数据的JSON对象，例如：
  ```json
  {
    "type": "import_files",
    "data": {
      "files": [...],
      "source": "ae_export"
    }
  }
  ```

#### `GET /info`
- **功能**: 获取Eagle应用和当前资源库的基本信息。
- **调用时机**: 连接成功后由 `updateEagleBasicInfo()` 函数调用。
- **成功响应**: 包含 `version`, `executablePath`, `library` 等字段的JSON对象。

#### `GET /status`
- **功能**: 获取Eagle状态，与 `/info` 类似，用于轮询更新。
- **调用时机**: 在 `pollMessages()` 中被周期性调用。

#### `POST /clear-logs`
- **功能**: 通知Eagle插件清空其日志缓存。
- **调用时机**: 当用户在AE插件中选择清空“Eagle插件日志”时，由 `requestEagleClearLogs()` 函数调用。

#### `POST /ae-port-info`
- **功能**: AE插件向Eagle插件“广播”自己的端口号，用于辅助建立连接。
- **调用时机**: 插件启动后由 `startPortBroadcast()` 函数周期性调用。

### 2.2 轮询实现示例

```javascript
// main.js 中的简化实现
async pollMessages() {
    try {
        // 注意：实际端点不含 /api 前缀
        const response = await fetch(`${this.eagleUrl}/messages?clientId=${this.clientId}`);
        const data = await response.json();
        
        // 处理消息数组
        if (data.messages && data.messages.length > 0) {
            this.handleEagleMessage(message);
        }

        // 处理日志数组
        if (data.eagleLogs && data.eagleLogs.length > 0) {
            this.updateEagleLogs(data.eagleLogs);
        }

    } catch (error) {
        // ...错误处理
    }
}
```

## 3. 附录：已实现但默认禁用的功能

以下功能在代码库中存在完整实现，但在当前配置下默认关闭，以HTTP轮询作为替代。

### 3.1 WebSocket 通信

- **实现文件**: `js/websocket-client.js`
- **描述**: `Eagle2AeWebSocketClient` 类实现了一套完整的实时通信方案，包括自动重连和心跳检测。
- **当前状态**: 在 `main.js` 中通过 `this.useWebSocket = false;` 禁用。

### 3.2 端口自动发现

- **实现文件**: `js/services/PortDiscovery.js`
- **描述**: `PortDiscovery` 类能够通过读取系统临时目录下的 `eagle2ae_port.txt` 文件来自动发现Eagle插件的服务端口。
- **当前状态**: 在 `main.js` 中通过 `this.enablePortDiscovery = false;` 禁用。

---

**相关文档**:
- [通信协议设计](../architecture/communication-protocol.md)
- [API 参考手册](./api-reference.md)
