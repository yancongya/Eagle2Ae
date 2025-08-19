# Eagle2Ae

一个完整的Eagle到After Effects的文件传输解决方案，包含Eagle插件和AE CEP扩展。

## 🌟 项目概述

Eagle2Ae 是一个双组件系统，旨在简化从Eagle图片管理软件到After Effects的文件导入流程：

- **Eagle插件**：作为后台服务运行，自动检测文件选择并处理导出
- **AE CEP扩展**：在After Effects中提供用户界面和导入控制

## 📁 项目结构

```
Eagle2Ae/
├── Eagle2Ae-Eagle/       # Eagle插件目录
│   ├── manifest.json     # Eagle插件配置
│   ├── service.html      # 后台服务页面
│   ├── index.html        # 插件UI页面
│   ├── js/               # 插件JavaScript代码
│   │   └── plugin.js     # 主插件逻辑
│   └── logo.png          # 插件图标
├── Eagle2Ae-Ae/          # After Effects CEP扩展
│   ├── CSXS/             # CEP配置目录
│   │   └── manifest.xml  # CEP扩展配置
│   ├── index.html        # 扩展主页面
│   ├── js/               # 扩展JavaScript代码
│   │   ├── main.js       # 主扩展逻辑
│   │   ├── constants/    # 常量定义
│   │   └── services/     # 服务模块
│   ├── jsx/              # ExtendScript代码
│   │   └── hostscript.jsx # AE主机脚本
│   └── README.md         # AE扩展说明
├── doc/                  # 项目文档
│   ├── BACKGROUND_SERVICE.md  # 后台服务说明
│   ├── QUICK_SETTINGS_GUIDE.md # 快速设置指南
│   └── ...               # 其他文档
└── README.md             # 项目说明（本文件）
```

## 🚀 快速开始

### 安装Eagle插件

1. 将 `Eagle2Ae-Eagle/` 文件夹复制到Eagle插件目录
2. 在Eagle中打开插件管理器
3. 启用"Eagle2Ae"插件
4. 重启Eagle - 插件将自动作为后台服务运行

### 安装AE扩展

1. 将 `Eagle2Ae-Ae/` 文件夹复制到AE扩展目录并重命名为 `com.eagle.eagle2ae`：
   - Windows: `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.eagle.eagle2ae\`
   - macOS: `/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae/`
2. 启用CEP调试模式（首次安装需要）
3. 启动After Effects
4. 在菜单中找到 `窗口` → `扩展` → `Eagle2Ae@烟囱鸭`

详细安装说明请参考 `Eagle2Ae-Ae/README.md`

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

1. **Eagle插件启动**：Eagle启动时自动加载插件，作为后台服务运行
2. **文件选择监听**：插件监听Eagle中的文件选择事件
3. **用户触发导出**：用户在Eagle中选择文件后点击插件图标
4. **HTTP通信**：Eagle插件通过HTTP API将文件信息发送给AE扩展
5. **智能导入**：AE扩展根据用户设置自动导入文件到当前项目
6. **状态反馈**：整个过程提供实时状态反馈和日志记录

## 📋 系统要求

- **Eagle**: 4.0+ (支持插件系统)
- **After Effects**: CC 2015+ (支持CEP扩展)
- **操作系统**:
  - Windows 10+
  - macOS 10.14+ (Mojave)
- **其他**:
  - Node.js (Eagle内置)
  - CEP调试模式已启用

## 📚 文档

详细文档请查看相关目录：

- [AE扩展说明](Eagle2Ae-Ae/README.md) - After Effects扩展的详细安装和使用指南
- [后台服务说明](doc/BACKGROUND_SERVICE.md) - Eagle插件后台服务的详细说明
- [快速设置指南](doc/QUICK_SETTINGS_GUIDE.md) - AE扩展快速设置功能说明

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
   - 检查插件是否正确安装到Eagle插件目录
   - 在Eagle插件管理器中确认插件已启用
   - 重启Eagle应用程序
   - 检查Eagle版本是否支持插件系统（4.0+）

2. **AE扩展无法连接Eagle插件**
   - 确认Eagle中的Eagle2Ae插件正在运行（后台服务）
   - 检查8080端口是否被其他程序占用
   - 确认防火墙允许本地HTTP通信
   - 尝试在AE扩展中点击"测试连接"按钮

3. **AE扩展无法显示**
   - 确认CEP调试模式已正确启用
   - 检查扩展是否安装到正确目录并重命名为`com.eagle.eagle2ae`
   - 确认AE版本支持CEP扩展（CC 2015+）
   - 重启After Effects

4. **文件导入失败**
   - 确认AE中有打开的项目
   - 检查文件路径是否存在且可访问
   - 确认文件格式被AE支持
   - 查看AE扩展面板中的详细错误日志

### 获取更多帮助

- 详细安装说明：[AE扩展README](Eagle2Ae-Ae/README.md)
- 后台服务说明：[后台服务文档](doc/BACKGROUND_SERVICE.md)
- 快速设置指南：[设置指南](doc/QUICK_SETTINGS_GUIDE.md)

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
