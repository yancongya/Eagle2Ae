# AE 扩展 - 架构文档

欢迎查阅 Eagle2Ae AE 扩展的架构文档。本部分详细描述了扩展的整体架构设计、核心组件、通信机制和关键技术实现。

## 🏗️ 架构概述

Eagle2Ae AE 扩展采用模块化架构设计，基于 Adobe CEP (Common Extensibility Platform) 框架开发，实现了前端界面与 ExtendScript 后端的分离，以及与 Eagle 插件的高效通信。扩展支持多面板实例，每个面板可以独立配置和运行。

## 📚 架构文档目录

### 核心架构
- **[CEP 扩展架构设计](./cep-extension-architecture.md)** - 扩展的整体架构设计和核心组件说明
- **[通信协议设计](./communication-protocol.md)** - 与 Eagle 插件的通信协议详细说明

### 组件设计
- **[UI 组件设计](./ui-components.md)** - UI 组件的设计规范和实现细节
- **[对话框系统设计](./dialog-system-design.md)** - 对话框系统的设计原理和实现
- **[错误处理设计](./error-handling-design.md)** - 错误处理机制的设计方案
- **[日志系统设计](./logging-system-design.md)** - 日志系统的设计和实现
- **[配置管理设计](./config-management-design.md)** - 配置管理的设计方案

### 技术实现
- **[多面板支持实现](./multi-panel-implementation.md)** - 多面板实例的支持和实现细节
- **[预设管理实现](./preset-management-implementation.md)** - 预设管理功能的实现方案
- **[性能优化策略](./performance-optimization.md)** - 性能优化的策略和方法
- **[安全考虑](./security-considerations.md)** - 安全方面的设计和实现

## 🎯 核心组件

### 主应用类 (AEExtension)
扩展的核心类，负责管理所有功能模块和服务。

#### 核心属性
- `csInterface`: CSInterface实例，用于与ExtendScript通信
- `connectionState`: 当前连接状态 (ConnectionState枚举)
- `pollingManager`: HTTP轮询管理器实例
- `connectionMonitor`: 连接质量监控器实例
- `logManager`: 日志管理器实例
- `settingsManager`: 设置管理器实例 (支持多面板独立配置)
- `fileHandler`: 文件处理器实例
- `soundPlayer`: 音效播放器实例
- `projectStatusChecker`: 项目状态检测器实例

### 通信模块
负责与 Eagle 插件的通信，采用 HTTP 轮询机制确保兼容性和稳定性。

#### 核心组件
- `PollingManager`: HTTP轮询管理器
- `ConnectionMonitor`: 连接质量监控器
- `MessageHandler`: 消息处理器

### 文件处理模块
负责处理从 Eagle 插件接收到的文件导入请求。

#### 核心功能
- 多种导入模式支持 (直接导入、项目旁复制、自定义文件夹)
- 合成状态检查
- 防重复导入机制
- 静默模式支持

### 设置管理模块
管理用户配置和偏好设置，支持多面板独立配置。

#### 核心功能
- 用户偏好设置的持久化
- 多实例配置管理
- 字段监听和自动保存
- 预设文件管理

## 🛠️ 技术架构

### 通信机制
扩展使用 HTTP 轮询机制与 Eagle 插件通信：

1. **HTTP 轮询** - 主要通信方式，500ms 轮询间隔
2. **ExtendScript 调用** - 与 After Effects 脚本的直接通信
3. **事件系统** - 内部模块间的消息传递

### 多面板支持
扩展支持最多 3 个独立面板实例：

1. **独立配置** - 每个面板有独立的设置和配置
2. **独立通信** - 每个面板有唯一的客户端 ID
3. **资源共享** - 共享部分核心服务和资源

### 状态管理
- **连接状态** - 管理与 Eagle 插件的连接状态
- **项目状态** - 监控 AE 项目的变化
- **UI 状态** - 管理界面元素的显示状态
- **设置状态** - 管理用户配置和偏好

## 📖 架构演进

### 版本更新记录

| 版本 | 更新内容 | 日期 |
|------|----------|------|
| 2.1.1 | 多面板支持、预设管理、项目状态检测 | 2025-10-28 |
| 1.0 | 初始架构设计 | 2024-01-05 |

---
**请使用左侧导航栏浏览各个架构文档，获取详细信息。**
