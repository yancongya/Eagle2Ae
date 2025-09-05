# After Effects CEP 扩展开发指南

## 概述

Eagle2Ae-Ae 是一个 Adobe CEP (Common Extensibility Platform) 扩展，运行在 After Effects 内部，提供与 Eagle 插件的通信界面和文件导入控制功能。

## 技术架构

### 核心组件
- **前端界面**: HTML/CSS/JavaScript 用户界面
- **ExtendScript**: JSX 脚本处理 AE 内部操作
- **通信模块**: HTTP/WebSocket 与 Eagle 插件通信
- **文件处理**: 文件导入和项目管理

### 技术栈
- Adobe CEP SDK
- HTML5/CSS3/JavaScript ES6+
- ExtendScript (JSX)
- Adobe After Effects API

## 📚 文档目录

### 🏗️ 架构设计
- [CEP扩展架构设计](./architecture/cep-extension-architecture.md) - 整体架构和模块设计
- [通信协议设计](./architecture/communication-protocol.md) - 与Eagle插件的通信协议
- [UI组件设计](./architecture/ui-component-design.md) - 用户界面组件架构
- [安全考虑](./architecture/security-considerations.md) - 安全策略和最佳实践

### 🛠️ 开发指南
- [开发环境搭建](./development/setup-guide.md) - 开发环境配置和工具安装
- [UI交互指南](./development/ui-interaction-guide.md) - **核心功能** 用户界面交互流程和拖拽导入系统
  - 🎯 拖拽判定逻辑 (`isEagleDrag`)
  - 📁 文件处理流程 (`handleFileDrop`)
  - 🎬 序列帧检测和合成检查
  - 💬 导入确认弹窗系统
- [对话框系统](./development/dialog-system.md) - **新增** Panel样式对话框完整实现
  - 🔧 ExtendScript对话框 (`showPanelConfirmDialog`)
  - 🌐 CEP扩展端调用 (`showImportConfirmDialog`)
  - 🛡️ 字符串转义和错误处理
- [导入逻辑文档](./development/import-logic.md) - **新增** 文件导入系统核心逻辑
  - 📋 导入系统架构
  - 🔍 文件类型检测和序列帧识别
  - ⚙️ 配置管理和错误处理
- [Demo功能指南](./development/demo-guide.md) - 演示模式详细说明和使用指南

### 📖 API 参考
- [API参考手册](./api/api-reference.md) - 完整的API文档
- [UI 组件说明](./api/ui-components.md) - 插件面板UI组件详细说明
- [函数功能映射](./api/function-mapping.md) - UI组件与JavaScript函数的完整映射
- [JSX脚本API](./api/jsx-scripts.md) - ExtendScript API参考
- [通信API](./api/communication-api.md) - 通信接口文档

### 📋 开发规范
- [编码规范](./standards/coding-standards.md) - 代码风格和编程规范
- [UI设计指南](./standards/ui-guidelines.md) - 用户界面设计规范
- [测试策略](./standards/testing-strategy.md) - 测试方法和质量保证

## 🔗 快速导航

### 核心功能实现

| 功能模块 | 主要文档 | 关键实现 |
|---------|---------|----------|
| **拖拽导入** | [UI交互指南](development/ui-interaction-guide.md#5-文件拖拽处理) | `isEagleDrag()`, `handleFileDrop()` |
| **对话框系统** | [对话框系统](development/dialog-system.md) | `showPanelConfirmDialog()`, `showImportConfirmDialog()` |
| **通信协议** | [通信协议设计](architecture/communication-protocol.md) | WebSocket消息类型定义 |
| **文件导入** | [导入逻辑文档](development/import-logic.md) | 导入流程和错误处理 |

### 开发流程

1. **环境搭建** → [setup-guide.md](development/setup-guide.md)
2. **架构理解** → [communication-protocol.md](architecture/communication-protocol.md)
3. **功能开发** → [ui-interaction-guide.md](development/ui-interaction-guide.md)
4. **对话框集成** → [dialog-system.md](development/dialog-system.md)
5. **测试验证** → [demo-guide.md](development/demo-guide.md)

### 故障排除

| 问题类型 | 参考文档 | 相关章节 |
|---------|---------|----------|
| 拖拽识别失败 | [UI交互指南](development/ui-interaction-guide.md) | 5.1 Eagle拖拽识别机制 |
| 对话框显示异常 | [对话框系统](development/dialog-system.md) | 4. 错误处理和降级策略 |
| 通信连接问题 | [通信协议设计](architecture/communication-protocol.md) | 错误处理流程 |
| 文件导入失败 | [导入逻辑文档](development/import-logic.md) | 6. 错误处理和日志记录 |

## 📋 文档更新记录

### 最新更新 (2024-01-15)

- ✅ **整合拖拽导入文档** - 将重复的拖拽逻辑文档整合到UI交互指南中
- ✅ **优化对话框系统文档** - 添加最新的 `showPanelConfirmDialog` 实现
- ✅ **更新通信协议** - 补充拖拽导入和对话框确认的消息类型
- ✅ **完善字符串转义处理** - 详细说明ExtendScript调用的字符串转义机制
- ✅ **添加合成检查逻辑** - 补充拖拽导入时的合成状态检查机制

## 🚀 快速开始

### 新手入门
1. **环境准备**
   ```bash
   # 安装 Adobe CEP 调试工具
   # 配置 After Effects 开发环境
   ```

2. **项目结构了解**
   ```
   Eagle2Ae-Ae/
   ├── CSXS/                    # CEP 扩展配置
   │   └── manifest.xml         # 扩展清单文件
   ├── js/                      # JavaScript 核心逻辑
   │   ├── main.js              # 主应用逻辑
   │   ├── websocket-client.js  # WebSocket 客户端
   │   ├── services/            # 服务模块
   │   │   ├── FileHandler.js   # 文件处理服务
   │   │   ├── PortDiscovery.js # 端口发现服务
   │   │   └── SettingsManager.js # 设置管理
   │   ├── utils/               # 工具函数
   │   ├── constants/           # 常量定义
   │   └── demo/                # 演示代码
   ├── jsx/                     # ExtendScript 脚本
   │   ├── hostscript.jsx       # 主机脚本
   │   └── dialog-warning.jsx   # 对话框脚本
   ├── public/                  # 静态资源
   │   ├── logo.png             # 应用图标
   │   ├── logo2.png            # 备用图标
   │   └── sound/               # 音频文件
   ├── enable_cep_debug_mode.reg # CEP调试注册表文件
   ├── enable_cep_debug_enhanced.reg # 增强调试模式
   └── index.html               # 主界面
   ```

3. **开发流程**
   - 阅读 [开发环境搭建](./development/setup-guide.md)
   - 了解 [CEP开发指南](./development/cep-development-guide.md)
   - 参考 [API文档](./api/api-reference.md)

### 核心功能
- **文件接收**: 接收来自 Eagle 插件的文件信息
- **项目导入**: 将文件导入到 After Effects 项目
- **状态监控**: 实时显示连接和操作状态
- **设置管理**: 导入参数和偏好设置

## 🔧 开发工具

### 必需工具
- Adobe After Effects CC 2018+
- Adobe CEP SDK
- Chrome DevTools (调试)
- Visual Studio Code (推荐)

### 调试工具
- CEP HTML Engine 调试
- ExtendScript Toolkit (可选)
- 网络监控工具

## 📝 开发注意事项

### CEP 特殊要求
- 必须启用 CEP 调试模式
- 遵循 Adobe CEP 安全策略
- 正确配置 manifest.xml
- 处理跨域通信限制

### 性能优化
- 最小化 DOM 操作
- 合理使用 ExtendScript
- 优化文件传输效率
- 内存管理和资源清理

### 兼容性
- 支持 After Effects CC 2018+
- 跨平台兼容 (Windows/macOS)
- 不同 AE 版本的 API 差异

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
- 检查 [开发指南](./development/cep-development-guide.md)

### 获取帮助
- 查看项目 Issues
- 参考 Adobe CEP 官方文档
- 社区论坛和讨论

## 📝 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始文档创建 | 开发团队 |

---

**下一步**: 选择相应的文档章节开始深入学习 CEP 扩展开发