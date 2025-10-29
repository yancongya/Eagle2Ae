# AE 扩展文档概览

欢迎来到 Eagle2Ae AE 扩展文档中心。这里包含了关于 AE 扩展的详细信息、使用指南和 API 参考。

## 📚 文档结构

### [使用手册](./使用手册/)
完整详尽的用户指南，包含从快速入门到高级功能的所有操作说明。

- **[快速入门指南](./使用手册/1-quick-start-guide.md)** - 5分钟内完成插件安装和基本配置
- **[界面概览与核心设置](./使用手册/2-interface-overview-settings.md)** - 详细了解插件界面和核心设置
- **[处理导入的各类素材](./使用手册/3-handling-imported-assets.md)** - 深入了解不同素材的处理方式
- **[提取归档](./使用手册/4-extract-archive-assets-from-ae.md)** - 学习如何从AE中提取素材并归档到Eagle
- **[高级设置与预设管理](./使用手册/5-advanced-settings-preset-management.md)** - 掌握所有高级设置和预设管理
- **[常见问题与解答](./使用手册/6-faq.md)** - 解决使用中遇到的常见问题
- **[多面板支持](./使用手册/7-multi-panel-support.md)** - 支持同时打开多个扩展面板实例
- **[UI 控制系统](./使用手册/8-ui-control-system.md)** - 主题切换、语言切换、组件显示控制
- **[拖拽导入增强功能](./使用手册/9-enhanced-drag-and-drop.md)** - 文件夹拖拽、序列帧检测、项目内文件检测
- **[剪贴板导入优化](./使用手册/10-optimized-clipboard-import.md)** - 智能剪贴板图片检测和导入
- **[项目状态检测器](./使用手册/11-project-status-checker.md)** - 全面的项目状态检测和验证
- **[虚拟对话框系统](./使用手册/12-virtual-dialog-system.md)** - 演示模式下的虚拟对话框体验

### [API 参考](./api/)
面向开发者的完整API文档，包含所有公开接口的详细说明。

- **[前端 JS API](./api/frontend-js-api.md)** - 前端JavaScript API详细说明
- **[智能对话框系统](./api/dialog-system.md)** - 对话框系统的完整API参考
- **[虚拟弹窗系统](./api/virtual-dialog-system.md)** - 演示模式下的虚拟弹窗实现
- **[状态监控器](./api/status-monitor.md)** - 状态监控器的API说明
- **[批量状态检测器](./api/batch-status-checker.md)** - 批量状态检测的实现细节
- **[轮询管理器](./api/polling-manager.md)** - 轮询机制的管理API
- **[连接监控器](./api/connection-monitor.md)** - 连接状态监控的详细说明
- **[错误处理系统](./api/error-handling.md)** - 错误处理机制的API参考
- **[事件系统](./api/event-system.md)** - 事件处理系统的完整说明
- **[配置管理系统](./api/config-management.md)** - 配置管理的实现细节
- **[日志系统增强](./api/logging-enhancements.md)** - 日志系统的增强功能说明
- **[性能监控](./api/performance-monitoring.md)** - 性能监控的API参考

### [架构文档](./architecture/)
系统架构设计文档，包含整体架构和关键技术实现。

- **[CEP 扩展架构](./architecture/cep-extension-architecture.md)** - CEP扩展的整体架构设计
- **[通信协议](./architecture/communication-protocol.md)** - 扩展间通信协议的详细说明

### [开发手册](./development/)
面向开发者的完整开发指南，包含开发流程和最佳实践。

- **[Demo 指南](./development/demo-guide.md)** - 演示模式的使用指南
- **[开发指南](./development/development-guide.md)** - 开发者的完整指南
- **[对话框系统](./development/dialog-system.md)** - 对话框系统的开发说明
- **[导入逻辑](./development/import-logic.md)** - 导入逻辑的实现细节
- **[项目状态检测器](./development/project-status-checker.md)** - 项目状态检测的开发指南
- **[设置指南](./development/setup-guide.md)** - 设置系统的开发说明
- **[UI 交互指南](./development/ui-interaction-guide.md)** - UI交互的实现细节

### [核心组件](./core-components/)
核心组件是AE扩展的基础构建块，包含关键功能模块的实现。

- **[AE扩展](./core-components/ae-extension.md)** - AE扩展的主入口和核心实现
- **[Eagle连接管理器](./core-components/eagle-connection-manager.md)** - 管理与Eagle插件的连接
- **[导出管理器](./core-components/export-manager.md)** - 处理导出到Eagle的功能
- **[导入管理器](./core-components/import-manager.md)** - 处理从Eagle导入的功能
- **[日志管理器](./core-components/log-manager.md)** - 日志记录和管理功能
- **[项目状态检测器](./core-components/project-status-checker.md)** - 项目状态检测功能
- **[设置管理器](./core-components/settings-manager.md)** - 配置和设置管理功能

### [核心功能](./core-functionality/)
核心功能涵盖了AE扩展的基础功能实现，包括数据持久化、错误处理、事件系统等。

- **[数据持久化](./core-functionality/data-persistence.md)** - 数据存储和持久化机制
- **[错误处理](./core-functionality/error-handling.md)** - 错误处理和异常管理
- **[事件系统](./core-functionality/event-system.md)** - 事件发布和订阅机制
- **[日志系统](./core-functionality/logging-system.md)** - 日志记录和管理
- **[模块系统](./core-functionality/module-system.md)** - 模块化架构设计
- **[网络通信](./core-functionality/network-communication.md)** - 网络通信实现
- **[性能优化](./core-functionality/performance-optimization.md)** - 性能优化策略
- **[状态管理](./core-functionality/state-management.md)** - 应用状态管理

### [功能文档](./features/)
详细的功能说明文档，涵盖扩展的所有特性和功能实现。

- **[拖拽导入增强](./features/enhanced-drag-and-drop.md)** - 增强的拖拽导入功能
- **[文件处理系统](./features/file-processing-system.md)** - 文件处理和管理
- **[文件夹打开模块](./features/folder-opener-module.md)** - 文件夹打开功能
- **[多面板支持](./features/multi-panel-support.md)** - 多面板实例支持
- **[预设管理系统](./features/preset-management-system.md)** - 预设管理和配置
- **[项目状态检测器](./features/project-status-checker.md)** - 项目状态检测功能
- **[UI控制系统](./features/ui-control-system.md)** - UI控制和自定义
- **[虚拟对话框系统](./features/virtual-dialog-system.md)** - 虚拟对话框实现

### [指南](./guides/)
操作指南和使用教程，帮助用户更好地使用扩展功能。

- **[拖拽导入增强指南](./guides/enhanced-drag-and-drop-guide.md)** - 拖拽导入功能使用指南
- **[多面板快速入门](./guides/multi-panel-quick-start.md)** - 多面板功能快速入门
- **[预设管理指南](./guides/preset-management-guide.md)** - 预设管理使用指南
- **[项目状态检测器指南](./guides/project-status-checker-detailed.md)** - 项目状态检测器详细指南

### [面板功能](./panel-functions/)
面板各项功能的详细说明和使用指南。

- **[高级设置面板](./panel-functions/advanced-settings-panel.md)** - 高级设置面板功能
- **[连接状态](./panel-functions/connection-status.md)** - 连接状态显示和管理
- **[检测图层](./panel-functions/detect-layers.md)** - 图层检测功能
- **[导出到Eagle](./panel-functions/export-to-eagle.md)** - 导出功能使用说明
- **[导入行为设置](./panel-functions/import-behavior-settings.md)** - 导入行为配置
- **[导入模式设置](./panel-functions/import-mode-settings.md)** - 导入模式配置

### [性能优化](./performance/)
性能优化相关的文档和最佳实践。

- **[最佳实践](./performance/best-practices.md)** - 性能优化最佳实践
- **[文件处理优化](./performance/file-processing-optimization.md)** - 文件处理性能优化
- **[内存优化](./performance/memory-optimization.md)** - 内存使用优化
- **[UI优化](./performance/ui-optimization.md)** - 用户界面性能优化

### [标准文档](./standards/)
项目开发标准和规范，包含编码、测试和项目管理标准。

- **[编码标准](./standards/coding-standards.md)** - 项目编码规范和最佳实践
- **[项目标准](./standards/project-standards.md)** - 项目管理和开发标准
- **[测试标准](./standards/testing-standards.md)** - 测试策略和质量保证标准

### [故障排除](./troubleshooting/)
常见问题和解决方案，帮助用户解决使用过程中遇到的问题。

- **[常见问题](./troubleshooting/common-issues.md)** - 常见问题和解决方案
- **[面板单选切换异常](./troubleshooting/面板单选切换异常-排查总结.md)** - 面板单选切换问题排查

### [UI组件](./ui-components/)
用户界面组件的设计和实现文档。

## 🚀 新功能概览 (v2.4.0)

### 多面板支持
支持同时打开多个扩展面板实例，每个面板拥有独立的配置文件和预设文件。这使得用户能够：
- 同时处理多个项目
- 为不同任务设置不同的导入/导出配置
- 实现真正的并行工作流

### UI 控制系统
全新的UI控制系统带来了前所未有的个性化体验：
- **主题切换** - 支持暗色和亮色两种主题模式
- **语言切换** - 支持中英文动态切换
- **组件显示控制** - 可控制主面板各组件的显示/隐藏
- **独显模式** - 提供沉浸式的操作体验

### 拖拽导入增强
拖拽导入功能得到了全面增强：
- **文件夹拖拽支持** - 直接拖拽整个文件夹到扩展面板
- **序列帧自动检测** - 智能识别图片序列并将其作为单个序列导入
- **项目内文件检测** - 防止重复导入已在项目中的文件
- **增强的视觉反馈** - 提供实时状态提示和进度显示

### 剪贴板导入优化
剪贴板导入变得更加智能和便捷：
- **剪贴板图片自动检测** - 自动识别剪贴板中的图片内容
- **临时文件智能重命名** - 避免使用通用名称如"clipboard_image.png"
- **优化的确认对话框** - 提供更好的用户体验

### 项目状态检测器
全面的项目状态检测系统确保操作的安全性和准确性：
- **环境检测** - 检测运行环境和AE版本
- **AE连接检测** - 验证与After Effects的连接状态
- **项目状态检测** - 检查项目是否已打开和保存
- **合成状态检测** - 验证活动合成的存在和状态
- **Eagle连接检测** - 检查与Eagle插件的连接状态

### 虚拟对话框系统
为演示模式提供真实的用户交互体验：
- **真实感模拟** - 提供与真实对话框一致的视觉效果和交互体验
- **智能用户行为模拟** - 基于上下文智能模拟用户选择
- **无缝集成** - 与现有对话框调用代码完全兼容

### 预设管理系统
每个面板实例拥有独立的预设文件：
- **面板特定配置** - 每个面板实例拥有独立的预设文件
- **预设文件导出/导入** - 支持预设文件的导出和导入
- **备份和恢复** - 提供预设文件的备份和恢复功能

### 设置管理系统
高级设置管理功能：
- **字段监听** - 支持对特定设置字段的变更监听
- **自动保存** - 配置变更时自动保存到本地存储
- **类型验证** - 支持设置值的类型验证
- **版本兼容性** - 支持设置格式的向前和向后兼容

## 💡 使用建议

### 新用户入门
1. 首先阅读[快速入门指南](./使用手册/1-quick-start-guide.md)，完成插件安装和基本配置
2. 浏览[界面概览与核心设置](./使用手册/2-interface-overview-settings.md)，熟悉插件界面布局
3. 尝试[处理导入的各类素材](./使用手册/3-handling-imported-assets.md)，掌握不同素材的导入方法
4. 学习[提取归档](./使用手册/4-extract-archive-assets-from-ae.md)，了解如何将AE素材导出到Eagle

### 高级用户进阶
1. 探索[高级设置与预设管理](./使用手册/5-advanced-settings-preset-management.md)，定制个性化工作流
2. 学习[多面板支持](./使用手册/7-multi-panel-support.md)，实现并行工作流
3. 掌握[UI 控制系统](./使用手册/8-ui-control-system.md)，个性化界面显示
4. 使用[拖拽导入增强功能](./使用手册/9-enhanced-drag-and-drop.md)和[剪贴板导入优化](./使用手册/10-optimized-clipboard-import.md)提高工作效率

### 开发者参考
1. 查阅[API 参考](./api/)了解所有公开接口
2. 阅读[架构文档](./architecture/)理解系统设计
3. 参考[开发手册](./development/)掌握开发流程
4. 遵循[标准文档](./standards/)确保代码质量

## 🛠️ 技术支持

如遇到技术问题，请参考以下资源：

1. **[常见问题与解答](./使用手册/6-faq.md)** - 解决大部分常见问题
2. **GitHub Issues** - 提交问题和建议
3. **官方技术支持** - 通过官方渠道获取专业支持

## 📄 更新日志

查看[更新日志](./CHANGELOG.md)了解所有版本的变更历史。

---

**请使用左侧的导航栏浏览各个章节，获取详细信息。**