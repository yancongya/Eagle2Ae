# Eagle2Ae 开发者文档

## 项目概述

Eagle2Ae 是一个双端插件系统，实现了 Eagle 图片管理软件与 Adobe After Effects 之间的无缝文件传输功能。本文档库为开发者提供完整的技术指导和API参考。

### 系统架构

- **Eagle2Ae-Eagle**: Eagle 插件端，负责文件选择和数据传输
- **Eagle2Ae-Ae**: After Effects CEP 扩展端，负责接收文件并导入到 AE 项目

### 技术栈

- **Eagle插件**: JavaScript, WebSocket, Node.js模块 (@crosscopy/clipboard, fs-extra, ws)
- **CEP扩展**: HTML/CSS/JavaScript, ExtendScript (JSX), Adobe CEP SDK
- **通信协议**: WebSocket (主要), HTTP (备用)
- **开发工具**: Chrome DevTools, Visual Studio Code

## 📚 文档导航

### 🎯 After Effects CEP 扩展文档

**架构设计**
- [CEP扩展架构设计](./AE/architecture/cep-extension-architecture.md)
- [通信协议设计](./AE/architecture/communication-protocol.md)
- [UI组件设计](./AE/architecture/ui-component-design.md)
- [安全考虑](./AE/architecture/security-considerations.md)

**开发指南**
- [CEP扩展开发指南](./AE/development/cep-development-guide.md)
- [调试指南](./AE/development/debugging-guide.md)
- [构建和打包](./AE/development/build-and-package.md)
- [故障排除](./AE/development/troubleshooting.md)

**API参考**
- [API参考手册](./AE/api/api-reference.md)
- [JSX脚本API](./AE/api/jsx-scripts.md)
- [通信API](./AE/api/communication-api.md)

**开发规范**
- [编码规范](./AE/standards/coding-standards.md)
- [UI设计指南](./AE/standards/ui-guidelines.md)
- [测试策略](./AE/standards/testing-strategy.md)

### 🦅 Eagle 插件文档

**架构设计**
- [Eagle插件架构](./EAGLE/architecture/eagle-plugin-architecture.md)
- [WebSocket通信](./EAGLE/architecture/websocket-communication.md)
- [剪贴板集成](./EAGLE/architecture/clipboard-integration.md)
- [服务模式设计](./EAGLE/architecture/service-mode-design.md)

**开发指南**
- [Eagle插件开发指南](./EAGLE/development/plugin-development-guide.md)
- [调试指南](./EAGLE/development/debugging-guide.md)
- [故障排除](./EAGLE/development/troubleshooting.md)

**API参考**
- [插件API参考](./EAGLE/api/plugin-api.md)
- [WebSocket API](./EAGLE/api/websocket-api.md)
- [剪贴板API](./EAGLE/api/clipboard-api.md)

**开发规范**
- [编码规范](./EAGLE/standards/coding-standards.md)
- [项目规范](./EAGLE/standards/project-standards.md)
- [测试规范](./EAGLE/standards/testing-standards.md)

### 🔗 共享文档

**系统级文档**
- [系统概览](./shared/system-overview.md)
- [通信协议](./shared/communication-protocol.md)
- [开发指南](./shared/development-guidelines.md)
- [提交规范](./shared/commit-conventions.md)

## 🚀 快速开始

### 新开发者入门

1. **环境准备**
   - 阅读 [AE扩展开发指南](./AE/development/cep-development-guide.md)
   - 阅读 [Eagle插件开发指南](./EAGLE/development/plugin-development-guide.md)

2. **了解架构**
   - 阅读 [系统概览](./shared/system-overview.md)
   - 阅读 [通信协议](./shared/communication-protocol.md)

3. **开发实践**
   - 阅读 [开发指南](./shared/development-guidelines.md)
   - 阅读相应的编码规范文档

### 常用资源

- **调试工具**: [AE调试指南](./AE/development/debugging-guide.md) | [Eagle调试指南](./EAGLE/development/debugging-guide.md)
- **API参考**: [AE API](./AE/api/api-reference.md) | [Eagle API](./EAGLE/api/plugin-api.md)
- **故障排除**: [AE故障排除](./AE/development/troubleshooting.md) | [Eagle故障排除](./EAGLE/development/troubleshooting.md)

## 📋 开发规范

### 代码规范
- 遵循项目 [编码规范](./AE/standards/coding-standards.md)
- 使用统一的 [提交规范](./shared/commit-conventions.md)
- 编写详细的中文注释

### 文档规范
- 所有文档使用中文编写
- 遵循统一的文档结构模板
- 及时更新文档与代码同步

### 🔧 开发指南
- [AE扩展开发](./AE/development/) - CEP扩展开发指南
- [Eagle插件开发](./EAGLE/development/) - Eagle插件开发指南
- [Demo演示功能](./AE/development/demo-guide.md) - 演示模式详细说明和使用指南
- [通信协议](./shared/communication-protocol.md) - 双插件通信规范
- [开发规范](./shared/development-guidelines.md) - 代码规范和最佳实践

## 🔧 技术支持

### 问题反馈
- 查看相应的故障排除文档
- 检查API参考文档
- 查看开发指南中的常见问题

### 贡献指南
- 阅读 [开发工作流](./shared/development-workflow.md)
- 遵循 [提交规范](./shared/commit-conventions.md)
- 更新相关文档

## 📝 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始文档框架创建 | 开发团队 |

---

**注意**: 本文档库专注于开发者技术文档，如需用户使用指南，请参考各插件项目中的README文件。