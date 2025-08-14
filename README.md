# Eagle2Ae

一个完整的Eagle到After Effects的文件传输解决方案，包含Eagle插件和AE CEP扩展。

## 🌟 项目概述

Eagle2Ae 是一个双组件系统，旨在简化从Eagle图片管理软件到After Effects的文件导入流程：

- **Eagle插件**：作为后台服务运行，自动检测文件选择并处理导出
- **AE CEP扩展**：在After Effects中提供用户界面和导入控制

## 📁 项目结构

```
Eagle2Ae/
├── Export to ae/          # Eagle插件目录
│   ├── manifest.json      # Eagle插件配置
│   ├── service.html       # 后台服务页面
│   ├── js/               # 插件JavaScript代码
│   └── ...               # 其他插件文件
├── Eagle2Ae/             # After Effects CEP扩展
│   ├── CSXS/             # CEP配置目录
│   ├── index.html        # 扩展主页面
│   ├── js/               # 扩展JavaScript代码
│   └── jsx/              # ExtendScript代码
├── doc/                  # 项目文档
│   ├── BACKGROUND_SERVICE.md  # 后台服务说明
│   └── ...               # 其他文档
└── README.md             # 项目说明（本文件）
```

## 🚀 快速开始

### 安装Eagle插件

1. 将 `Export to ae/` 文件夹复制到Eagle插件目录
2. 在Eagle中打开插件管理器
3. 启用"Export to AE"插件
4. 重启Eagle - 插件将自动作为后台服务运行

### 安装AE扩展

1. 将 `Eagle2Ae/` 文件夹复制到AE扩展目录：
   - Windows: `C:\Program Files\Common Files\Adobe\CEP\extensions\`
   - macOS: `/Library/Application Support/Adobe/CEP/extensions/`
2. 启动After Effects
3. 在菜单中找到 `窗口` → `扩展` → `Eagle2Ae`

## ✨ 核心特性

### Eagle插件特性
- 🔄 **完全后台运行**：Eagle启动时自动启动，无需用户干预
- 👻 **隐形服务**：运行时不显示任何窗口
- 📁 **智能文件检测**：自动监控文件选择变化
- 🛡️ **稳定可靠**：多重保护机制确保服务稳定

### AE扩展特性
- 🎯 **直观界面**：现代化的用户界面设计
- ⚙️ **灵活配置**：多种导入模式和选项
- 📊 **实时状态**：连接状态和导入进度监控
- 🔧 **高级设置**：文件管理和时间轴选项

## 🔧 工作原理

1. **Eagle插件**在后台监听文件选择事件
2. 当用户在Eagle中选择文件时，插件自动处理文件信息
3. **AE扩展**通过HTTP通信接收文件信息
4. 根据用户设置，文件被自动导入到AE项目中

## 📋 系统要求

- **Eagle**: 4.0+
- **After Effects**: 2020+
- **操作系统**: Windows 10+ / macOS 10.14+
- **Node.js**: Eagle内置版本

## 📚 文档

详细文档请查看 `doc/` 目录：

- [后台服务说明](doc/BACKGROUND_SERVICE.md) - Eagle插件后台服务的详细说明
- 更多文档正在整理中...

## 🛠️ 开发

### 项目架构

- **Eagle插件**: 基于Eagle Plugin API和Node.js
- **AE扩展**: 基于Adobe CEP框架和ExtendScript
- **通信协议**: HTTP REST API

### 技术栈

- JavaScript (ES6+)
- Node.js (Eagle环境)
- Adobe CEP
- Adobe ExtendScript
- HTML5/CSS3

## 🐛 故障排除

### 常见问题

1. **Eagle插件没有自动启动**
   - 检查插件是否正确安装并启用
   - 重启Eagle应用

2. **AE扩展无法连接**
   - 确认Eagle插件正在运行
   - 检查防火墙设置

3. **文件导入失败**
   - 确认AE项目已打开
   - 检查文件格式支持

更多故障排除信息请参考文档目录中的相关文档。

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 提交GitHub Issue
- 发送邮件反馈

---

**Eagle2Ae - 让文件传输变得简单高效！** 🎉
