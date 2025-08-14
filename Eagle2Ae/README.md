# Eagle2Ae - After Effects CEP扩展

Eagle2Ae的After Effects扩展部分，提供与Eagle插件的通信界面和文件导入控制。

## 📋 扩展概述

Eagle2Ae AE扩展是一个Adobe CEP（Common Extensibility Platform）面板扩展，运行在After Effects内部，提供：

- 🔗 与Eagle插件的HTTP通信
- 📊 实时连接状态监控
- 🎯 项目和合成信息显示
- ⚙️ 导入设置配置
- 📝 详细的操作日志

## 🚀 安装指南

### 手动安装（推荐）

#### 第一步：启用CEP调试模式

**Windows用户：**
1. 双击 `enable_cep_debug_mode.reg` 文件
2. 在弹出的对话框中点击"是"
3. 注册表设置将自动启用所有AE版本的CEP调试模式

**macOS用户：**
打开终端，运行以下命令：
```bash
defaults write com.adobe.CSXS.6 PlayerDebugMode 1
defaults write com.adobe.CSXS.7 PlayerDebugMode 1
defaults write com.adobe.CSXS.8 PlayerDebugMode 1
defaults write com.adobe.CSXS.9 PlayerDebugMode 1
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
defaults write com.adobe.CSXS.12 PlayerDebugMode 1
```

#### 第二步：清理旧版本（如果存在）

**删除以下目录中的旧扩展文件夹（如果存在）：**

**Windows：**
- `%APPDATA%\Adobe\CEP\extensions\com.eagle.exporttoae\` （旧版本）
- `%APPDATA%\Adobe\CEP\extensions\com.eagle.eagle2ae\` （当前版本）
- `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.eagle.exporttoae\`
- `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.eagle.eagle2ae\`

**macOS：**
- `~/Library/Application Support/Adobe/CEP/extensions/com.eagle.exporttoae/`
- `~/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae/`
- `/Library/Application Support/Adobe/CEP/extensions/com.eagle.exporttoae/`
- `/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae/`

#### 第三步：安装新版本

**选择安装位置（推荐用户级安装）：**

**Windows用户级安装（推荐）：**
1. 按 `Win + R`，输入 `%APPDATA%\Adobe\CEP\extensions`，回车
2. 如果 `extensions` 文件夹不存在，请创建它
3. 将整个 `Eagle2Ae` 文件夹复制到此目录
4. 重命名为 `com.eagle.eagle2ae`
5. 最终路径应为：`%APPDATA%\Adobe\CEP\extensions\com.eagle.eagle2ae\`

**Windows系统级安装：**
1. 导航到 `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\`
2. 如果 `extensions` 文件夹不存在，请创建它（需要管理员权限）
3. 将整个 `Eagle2Ae` 文件夹复制到此目录
4. 重命名为 `com.eagle.eagle2ae`

**macOS用户级安装（推荐）：**
1. 在Finder中按 `Cmd + Shift + G`
2. 输入 `~/Library/Application Support/Adobe/CEP/extensions`
3. 如果 `extensions` 文件夹不存在，请创建它
4. 将整个 `Eagle2Ae` 文件夹复制到此目录
5. 重命名为 `com.eagle.eagle2ae`

**macOS系统级安装：**
1. 导航到 `/Library/Application Support/Adobe/CEP/extensions/`
2. 将整个 `Eagle2Ae` 文件夹复制到此目录（可能需要管理员权限）
3. 重命名为 `com.eagle.eagle2ae`

#### 第四步：验证安装

1. **重启After Effects**
2. 在AE中选择 `窗口` → `扩展` → `Eagle2Ae`
3. 如果扩展出现，安装成功！

### 自动安装（macOS）

如果您使用macOS，仍可以使用自动安装脚本：

#### macOS用户：
1. 打开终端，导航到Eagle2Ae目录
2. 运行以下命令：
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
3. 选择安装位置：
   - **选项1（推荐）**：用户级安装 - `~/Library/Application Support/Adobe/CEP/extensions/`
   - **选项2**：系统级安装 - `/Library/Application Support/Adobe/CEP/extensions/`
4. 按照提示完成安装

### 卸载扩展

#### 手动卸载：

**删除以下目录中的扩展文件夹：**

**Windows：**
- `%APPDATA%\Adobe\CEP\extensions\com.eagle.eagle2ae\` (用户级)
- `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.eagle.eagle2ae\` (系统级)

**macOS：**
- `~/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae/` (用户级)
- `/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae/` (系统级)

**步骤：**
1. 关闭After Effects
2. 删除上述路径中的 `com.eagle.eagle2ae` 文件夹
3. 重启After Effects

#### 自动卸载（macOS）：
如果您使用macOS，仍可以使用自动卸载脚本：
```bash
chmod +x uninstall.sh
./uninstall.sh
```

### 手动安装

如果自动安装失败，可以手动安装：

#### 1. 清理旧版本
**重要：先删除所有旧版本！**
- 删除 `com.eagle.exporttoae` 文件夹（旧版本）
- 删除 `com.eagle.eagle2ae` 文件夹（如果存在）

#### 2. 复制扩展文件
将整个 `Eagle2Ae` 文件夹复制到以下位置之一：

**Windows (用户级 - 推荐):**
```
%APPDATA%\Adobe\CEP\extensions\com.eagle.eagle2ae\
```

**Windows (系统级):**
```
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.eagle.eagle2ae\
```

**macOS (用户级 - 推荐):**
```
~/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae/
```

**macOS (系统级):**
```
/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae/
```

#### 2. 启用CEP调试模式

**Windows (推荐使用注册表文件):**
1. 双击 `enable_cep_debug_mode.reg` 文件
2. 在弹出的对话框中点击"是"
3. 支持After Effects CC 2015-2024及更高版本

**Windows (手动命令 - 需要管理员权限):**
```batch
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.6" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.7" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.8" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.12" /v PlayerDebugMode /t REG_SZ /d 1 /f
```

**macOS:**
```bash
defaults write com.adobe.CSXS.6 PlayerDebugMode 1
defaults write com.adobe.CSXS.7 PlayerDebugMode 1
defaults write com.adobe.CSXS.8 PlayerDebugMode 1
defaults write com.adobe.CSXS.9 PlayerDebugMode 1
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
defaults write com.adobe.CSXS.12 PlayerDebugMode 1
```

## 🔧 使用方法

### 1. 启动扩展
1. 重启After Effects
2. 在AE菜单中选择：`窗口` → `扩展` → `Eagle2Ae`
3. 扩展面板将在AE界面中打开

### 2. 连接Eagle插件
1. 确保Eagle中的"Export to AE"插件正在运行
2. 在扩展面板中点击 **"测试连接"** 按钮
3. 连接成功后状态指示器变为绿色

### 3. 开始使用
- 在Eagle中选择文件，扩展会自动接收导入请求
- 查看项目信息和连接状态
- 通过设置按钮配置导入选项

## 📁 文件结构

```
Eagle2Ae/
├── CSXS/
│   └── manifest.xml              # CEP扩展配置文件
├── js/
│   ├── CSInterface.js            # Adobe CEP接口库
│   └── main.js                  # 扩展主逻辑
├── jsx/
│   └── hostscript.jsx           # ExtendScript主机脚本
├── index.html                   # 扩展界面
├── install.sh                   # macOS安装脚本
├── uninstall.sh                 # macOS卸载脚本
├── enable_cep_debug_mode.reg    # Windows CEP调试模式注册表文件
└── README.md                   # 本文件
```

## ⚙️ 扩展功能

### 连接管理
- **测试连接**: 检查与Eagle插件的通信
- **断开连接**: 停止与Eagle插件的通信
- **自动重连**: 连接断开时自动尝试重连

### 项目监控
- **项目信息**: 显示当前AE项目名称和路径
- **合成状态**: 显示当前激活的合成信息
- **实时更新**: 项目变化时自动更新显示

### 导入设置
- **导入模式**: 直接导入、项目旁复制、指定文件夹
- **时间轴选项**: 当前时间、顺序排列、叠加模式
- **文件管理**: 命名规则、标签文件夹等

### 日志系统
- **实时日志**: 显示所有操作和错误信息
- **日志切换**: 可查看AE扩展和Eagle插件的日志
- **日志清理**: 一键清理历史日志

### CEP调试模式文件
- **enable_cep_debug_mode.reg**: Windows注册表文件
  - 支持After Effects CC 2015-2024及更高版本
  - 一键启用所有版本的CEP调试模式
  - 包含CSXS.6到CSXS.12的完整支持
  - 同时启用PlayerDebugMode和LogLevel

## 🔍 故障排除

### 扩展不显示
1. **检查AE版本**: 确保使用After Effects CC 2015或更高版本
2. **重启AE**: 安装后必须重启After Effects
3. **检查CEP调试模式**: 确保已启用调试模式
   - Windows: 双击 `enable_cep_debug_mode.reg` 文件
   - macOS: 运行终端命令启用调试模式
4. **验证安装路径**: 确保扩展文件夹名称为 `com.eagle.eagle2ae`
5. **检查文件完整性**: 确保所有文件都已正确复制
6. **清理旧版本**: 手动删除所有旧版本文件夹后重新安装
7. **尝试不同安装位置**: 如果用户级安装失败，尝试系统级安装（或反之）
8. **权限问题**:
   - Windows: 确保有权限访问CEP扩展目录
   - macOS: 可能需要授予AE完全磁盘访问权限

### 连接失败
1. **Eagle插件状态**: 确认Eagle中的"Export to AE"插件正在运行
2. **端口占用**: 检查8080端口是否被其他程序占用
3. **防火墙设置**: 确保防火墙允许本地HTTP通信
4. **网络问题**: 检查本地网络连接

### 导入失败
1. **项目状态**: 确保AE中有打开的项目
2. **文件路径**: 检查文件是否存在且可访问
3. **文件格式**: 确认文件格式被AE支持
4. **权限问题**: 检查文件读取权限

### 安装问题
1. **旧版本冲突**: 使用卸载脚本完全清理旧版本
2. **路径问题**: 尝试用户级和系统级安装位置
3. **权限问题**: 确保有足够权限写入目标目录
4. **AE版本**: 确认AE版本支持CEP扩展（CC 2015+）
5. **调试模式**: 检查CEP调试模式是否正确启用
6. **文件完整性**: 验证扩展文件是否正确复制

## 📋 系统要求

- **After Effects**: CC 2015 或更高版本
- **操作系统**:
  - Windows 10 或更高版本
  - macOS 10.14 或更高版本
- **CEP版本**: 6.0 或更高版本

## 🔄 版本信息

- **当前版本**: 1.0.1
- **CEP版本**: 7.0
- **扩展ID**: com.eagle.eagle2ae
- **兼容性**: CSXS 6-12 (AE CC 2015-2024+)
- **支持的AE版本**:
  - After Effects CC 2015 (CSXS.6)
  - After Effects CC 2017 (CSXS.7)
  - After Effects CC 2018 (CSXS.8)
  - After Effects CC 2019 (CSXS.9)
  - After Effects CC 2020-2021 (CSXS.10)
  - After Effects CC 2022-2023 (CSXS.11)
  - After Effects CC 2024+ (CSXS.12)

## 📞 技术支持

如遇到问题：

1. **查看日志**: 扩展面板中的详细日志信息
2. **检查安装**: 确认所有安装步骤正确完成
3. **重启软件**: 尝试重启Eagle和After Effects
4. **重新安装**: 删除扩展后重新运行安装脚本

## 📄 许可证

MIT License - 详见项目根目录LICENSE文件

---

**Eagle2Ae AE扩展 - 让文件导入变得简单高效！** 🎉
