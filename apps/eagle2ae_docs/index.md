---
layout: home

hero:
  name: Eagle2Ae 文档中心
  text: 连接 Eagle 与 After Effects 的桥梁
  tagline: 深入了解 AE 扩展、Eagle 插件的开发、使用与通信协议
  image: /logo.png
  alt: Eagle2Ae Logo
  actions:
    - theme: brand
      text: AE 扩展文档
      link: /ae/
    - theme: alt
      text: Eagle 插件文档
      link: /eagle/

features:
  - icon: 📚
    title: AE 使用手册
    details: 专为用户设计，详细指导 AE 扩展的安装、配置与各项功能操作。
    link: /ae/使用手册/
    linkText: 查看手册
  - icon: 🦅
    title: Eagle 使用手册
    details: 专为用户设计，详细指导 Eagle 插件的安装、配置与各项功能操作。
    link: /eagle/使用手册/
    linkText: 查看手册
  - icon: 💻
    title: AE 开发手册
    details: 针对开发者，深入解析 AE 扩展的架构、API 和开发实践。
    link: /ae/development/
    linkText: 开始开发
  - icon: ⚙️
    title: Eagle 开发手册
    details: 针对开发者，深入解析 Eagle 插件的架构、API 和开发实践。
    link: /eagle/development/
    linkText: 开始开发
  - icon: 🌐
    title: 通用指南
    details: 包含项目通用规范、通信协议、系统概览等，适用于所有参与者。
    link: /shared/
    linkText: 了解更多
---

## 🚀 Eagle2Ae 核心功能

Eagle2Ae 致力于提升 After Effects 与 Eagle 素材管理工具之间的工作流效率，提供以下核心功能：

### **After Effects 扩展功能**
- **素材无缝导入**: 支持从 Eagle 快速导入图片、视频、PSD 等多种格式素材到 After Effects 项目。
- **项目状态智能检测**: 自动检测 AE 项目、合成和图层状态，确保操作的准确性和安全性。
- **图层批量导出**: 能够将 AE 中的图层或预合成批量导出为图片或视频，并可选择自动归档至 Eagle。
- **智能对话框系统**: 提供用户友好的交互界面，简化复杂操作。

### **Eagle 插件功能**
- **AE 扩展连接管理**: 负责与 AE 扩展建立和维护稳定的 WebSocket 或 HTTP 连接。
- **素材数据传输**: 接收来自 AE 扩展的素材导入请求，并处理文件传输。
- **状态同步**: 实时同步 Eagle 应用的连接状态和素材库信息。
- **日志与错误处理**: 记录插件运行日志，提供错误反馈机制。

## 💡 如何使用本文档

- 使用左侧的侧边栏进行导航，快速找到您感兴趣的章节。
- 使用顶部的导航栏在主要模块之间切换。
- 如果您是开发者，请重点关注各扩展的 API 参考和开发指南。

---

**版本**: v2.4.0  
**更新时间**: 2025年9月  
**兼容性**: After Effects CC 2018+

<DataPanel />
