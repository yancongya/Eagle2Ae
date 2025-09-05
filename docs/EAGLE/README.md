# Eagle 插件开发指南

## 概述

Eagle2Ae-Eagle 是一个运行在 Eagle 图片管理软件中的插件，采用服务模式运行，提供文件选择、数据传输和与 After Effects CEP 扩展的通信功能。

## 技术架构

### 核心组件
- **插件主体**: 基于 Eagle 插件 API 的主要逻辑
- **WebSocket 服务器**: 提供与 AE 扩展的实时通信
- **剪贴板集成**: 处理文件路径和数据的剪贴板操作
- **数据库接口**: 读取 Eagle 数据库获取文件信息
- **管理界面**: 用户交互和状态监控界面

### 技术栈
- Eagle Plugin API
- Node.js 运行时
- WebSocket (ws 库)
- 剪贴板操作 (@crosscopy/clipboard)
- 文件系统操作 (fs-extra)
- SQLite 数据库读取

## 📚 文档目录

### 🏗️ 架构设计
- [Eagle插件架构](./architecture/eagle-plugin-architecture.md) - 整体架构和模块设计
- [WebSocket通信](./architecture/websocket-communication.md) - 通信协议和服务器设计
- [剪贴板集成](./architecture/clipboard-integration.md) - 剪贴板操作和数据处理
- [服务模式设计](./architecture/service-mode-design.md) - 后台服务和管理界面设计

### 🛠️ 开发指南
- [开发环境搭建](./development/setup-guide.md) - 开发环境配置和工具安装
- [Eagle插件开发指南](./development/plugin-development-guide.md) - Eagle 插件开发详细指南
- [插件交互指南](./development/plugin-interaction-guide.md) - 用户操作流程和交互设计
- [调试指南](./development/debugging-guide.md) - 调试工具、故障排除和性能优化
- [故障排除](./development/troubleshooting.md) - 常见问题和解决方案

### 📖 API 参考
- [插件组件详细说明](./api/plugin-components.md) - UI组件、功能按钮和面板详解
- [函数功能映射](./api/function-mapping.md) - UI事件与JavaScript函数的对应关系
- [插件API参考](./api/plugin-api.md) - Eagle2Ae主类和核心API
- [WebSocket服务器API](./api/websocket-server.md) - WebSocket通信接口和服务器管理
- [数据库访问API](./api/database-api.md) - Eagle API集成和数据访问接口

### 📋 开发规范
- [编码规范](./standards/coding-standards.md) - 代码风格和编程规范
- [WebSocket协议规范](./standards/websocket-protocols.md) - 通信协议规范
- [测试策略](./standards/testing-strategy.md) - 测试方法和质量保证

## 🚀 快速开始

### 新手入门
1. **环境准备**
   ```bash
   # 安装 Node.js 和 npm
   # 安装 Eagle 3.0+
   # 配置开发环境
   ```

2. **项目结构了解**
   ```
   Eagle2Ae-Eagle/
   ├── manifest.json              # Eagle 插件配置
   ├── package.json               # Node.js 依赖管理
   ├── js/                        # JavaScript 核心逻辑
   │   ├── plugin.js              # 插件主入口
   │   ├── websocket-server.js    # WebSocket 服务器
   │   ├── websocket-protocol.js  # WebSocket 协议处理
   │   ├── websocket-eagle-compatible.js # Eagle兼容层
   │   ├── clipboard-handler.js   # 剪贴板处理器
   │   ├── compatibility-layer.js  # 兼容性层
   │   ├── dynamic-port-allocator.js # 动态端口分配
   │   ├── clipboard/             # 剪贴板操作模块
   │   ├── database/              # 数据库操作模块
   │   └── utils/                 # 工具函数
   ├── index.html                 # 管理界面
   ├── service.html               # 服务模式界面
   └── logo.png                   # 插件图标
   ```

3. **开发流程**
   - 阅读 [开发环境搭建](./development/setup-guide.md)
   - 了解 [Eagle插件开发指南](./development/eagle-plugin-guide.md)
   - 参考 [API文档](./api/api-reference.md)

### 核心功能
- **文件选择**: 从 Eagle 中选择和获取文件信息
- **数据传输**: 通过 WebSocket 向 AE 扩展发送文件数据
- **状态监控**: 实时显示连接状态和传输进度
- **剪贴板操作**: 处理文件路径的剪贴板读写
- **后台服务**: 以服务模式在后台持续运行

## 🔧 开发工具

### 必需工具
- Eagle 3.0 或更高版本
- Node.js 14.x 或更高版本
- Visual Studio Code (推荐)
- Chrome DevTools (调试)

### 开发依赖
```json
{
  "dependencies": {
    "@crosscopy/clipboard": "^0.2.8",
    "fs-extra": "^11.3.1",
    "ws": "^8.18.3"
  }
}
```

## 📝 开发注意事项

### Eagle 插件特殊要求
- 必须遵循 Eagle 插件 API 规范
- 支持服务模式 (serviceMode: true)
- 正确配置 manifest.json
- 处理 Eagle 数据库访问权限

### 性能优化
- 异步处理文件操作
- 优化 WebSocket 消息传输
- 合理使用内存和 CPU 资源
- 及时清理临时数据

### 兼容性
- 支持 Eagle 3.0 及以上版本
- 跨平台兼容 (Windows/macOS)
- 不同 Eagle 版本的 API 差异处理

## 🤝 贡献指南

### 开发流程
1. Fork 项目仓库
2. 创建功能分支
3. 遵循编码规范
4. 编写测试用例
5. 提交 Pull Request

### 代码规范
- 使用 4 空格缩进
- 详细的中文注释
- JSDoc 函数文档
- 统一的错误处理

## 📞 技术支持

### 常见问题
- 查看 [故障排除](./development/troubleshooting.md)
- 参考 [API文档](./api/api-reference.md)
- 检查 [开发指南](./development/eagle-plugin-guide.md)

### 获取帮助
- 查看项目 Issues
- 参考 Eagle 插件官方文档
- 社区论坛和讨论

## 🔄 插件生命周期

### 启动流程
1. **插件加载**: Eagle 启动时加载插件
2. **服务初始化**: 初始化 WebSocket 服务器
3. **端口分配**: 动态分配可用端口
4. **状态监控**: 开始监控连接状态
5. **准备就绪**: 等待 AE 扩展连接

### 运行状态
- **待机状态**: 等待用户操作
- **文件选择**: 用户选择要导出的文件
- **数据传输**: 向 AE 扩展发送文件信息
- **状态反馈**: 接收并显示操作结果

### 关闭流程
1. **连接断开**: 断开与 AE 扩展的连接
2. **服务停止**: 停止 WebSocket 服务器
3. **资源清理**: 清理临时文件和内存
4. **插件卸载**: Eagle 关闭时卸载插件

## 🔐 安全考虑

### 数据安全
- **本地通信**: 仅使用本地网络通信
- **文件访问**: 只读取用户明确选择的文件
- **权限控制**: 最小权限原则
- **数据清理**: 及时清理敏感数据

### 网络安全
- **端口绑定**: 仅绑定本地回环地址
- **连接验证**: 验证连接来源
- **消息验证**: 验证消息格式和内容
- **错误处理**: 安全的错误信息处理

## 📊 性能监控

### 关键指标
- **内存使用**: 监控内存占用情况
- **CPU 使用**: 监控 CPU 使用率
- **网络延迟**: 监控通信延迟
- **文件处理速度**: 监控文件操作性能

### 优化策略
- **异步操作**: 使用异步 I/O 操作
- **批量处理**: 批量处理多个文件
- **缓存机制**: 合理使用缓存
- **资源池**: 复用网络连接和资源

## 🧪 测试策略

### 单元测试
- 核心功能模块测试
- 工具函数测试
- 错误处理测试

### 集成测试
- WebSocket 通信测试
- 文件操作测试
- 数据库访问测试

### 端到端测试
- 完整工作流测试
- 性能压力测试
- 兼容性测试

## 📝 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始文档创建 | 开发团队 |

---

**下一步**: 选择相应的文档章节开始深入学习 Eagle 插件开发。