# AE 扩展开发环境搭建指南

## 概述

本指南将帮助您搭建 Eagle2Ae After Effects CEP 扩展的开发环境，包括必要的软件安装、开发工具配置和调试环境设置。

## 快速开始

如果您已经安装了 After Effects 和 Chrome 浏览器，可以按照以下步骤快速开始：

1. **启用 CEP 调试模式**：双击项目中的 `enable_cep_debug_mode.reg` 文件（Windows）
2. **安装扩展**：将 `Eagle2Ae-Ae` 文件夹复制到 CEP 扩展目录
3. **启动 After Effects**：在菜单中选择 `窗口` → `扩展` → `Eagle2Ae`
4. **开始调试**：在 Chrome 中访问 `http://localhost:8092` 进行调试

详细步骤请参考下面的完整指南。

## 系统要求

### 硬件要求
- **内存**: 最少 8GB RAM，推荐 16GB 或更多
- **存储**: 至少 10GB 可用空间
- **处理器**: Intel i5 或 AMD 同等级别以上

### 软件要求
- **操作系统**: Windows 10+ 或 macOS 10.14+
- **Adobe After Effects**: CC 2018 或更高版本
- **Git**: 版本控制工具 (可选，用于版本管理)
- **Chrome 浏览器**: 用于调试 CEP 扩展

## 必需软件安装

### 1. Adobe After Effects

#### 安装步骤
1. 从 Adobe Creative Cloud 下载并安装 After Effects
2. 确保版本为 CC 2018 或更高
3. 启动 AE 确认安装成功

#### 版本兼容性
| AE 版本 | CEP 版本 | 支持状态 |
|---------|----------|----------|
| CC 2018 | CEP 8    | ✅ 支持  |
| CC 2019 | CEP 9    | ✅ 支持  |
| CC 2020 | CEP 10   | ✅ 支持  |
| CC 2021 | CEP 11   | ✅ 支持  |
| CC 2022 | CEP 12   | ✅ 支持  |
| 2023    | CEP 12   | ✅ 支持  |
| 2024    | CEP 12   | ✅ 支持  |

### 2. Git 版本控制 (可选)

#### Windows 安装
```bash
# 下载 Git for Windows
# 访问 https://git-scm.com/download/win

# 验证安装
git --version
```

#### macOS 安装
```bash
# 使用 Homebrew 安装
brew install git

# 或使用 Xcode Command Line Tools
xcode-select --install

# 验证安装
git --version
```

## CEP 开发环境配置

### 1. 启用 CEP 调试模式

CEP 扩展默认情况下无法在生产环境中调试，需要启用调试模式。

#### Windows 配置

**方法一：使用注册表文件 (推荐)**
```reg
# 创建 enable_cep_debug.reg 文件
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Adobe\CSXS.8]
"PlayerDebugMode"="1"

[HKEY_CURRENT_USER\Software\Adobe\CSXS.9]
"PlayerDebugMode"="1"

[HKEY_CURRENT_USER\Software\Adobe\CSXS.10]
"PlayerDebugMode"="1"

[HKEY_CURRENT_USER\Software\Adobe\CSXS.11]
"PlayerDebugMode"="1"

[HKEY_CURRENT_USER\Software\Adobe\CSXS.12]
"PlayerDebugMode"="1"
```

**方法二：命令行配置**
```batch
# 以管理员身份运行命令提示符
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.8" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.12" /v PlayerDebugMode /t REG_SZ /d 1 /f
```

#### macOS 配置

```bash
# 在终端中执行以下命令
defaults write com.adobe.CSXS.8 PlayerDebugMode 1
defaults write com.adobe.CSXS.9 PlayerDebugMode 1
defaults write com.adobe.CSXS.10 PlayerDebugMode 1
defaults write com.adobe.CSXS.11 PlayerDebugMode 1
defaults write com.adobe.CSXS.12 PlayerDebugMode 1
```

### 2. 配置扩展安装路径

CEP 扩展需要安装到特定目录才能被 After Effects 识别。

#### Windows 路径
```
# 用户级安装 (推荐)
%APPDATA%\Adobe\CEP\extensions\com.eagle.eagle2ae\

# 系统级安装
C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.eagle.eagle2ae\
```

#### macOS 路径
```
# 用户级安装 (推荐)
~/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae/

# 系统级安装
/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae/
```

### 3. 创建开发符号链接

为了方便开发，建议创建符号链接指向开发目录。

#### Windows 创建符号链接
```batch
# 以管理员身份运行命令提示符
# 删除现有目录 (如果存在)
rmdir "%APPDATA%\Adobe\CEP\extensions\com.eagle.eagle2ae" /s /q

# 创建符号链接
mklink /D "%APPDATA%\Adobe\CEP\extensions\com.eagle.eagle2ae" "C:\path\to\your\Eagle2Ae-Ae"
```

#### macOS 创建符号链接
```bash
# 删除现有目录 (如果存在)
rm -rf "~/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae"

# 创建符号链接
ln -s "/path/to/your/Eagle2Ae-Ae" "~/Library/Application Support/Adobe/CEP/extensions/com.eagle.eagle2ae"
```

## 开发工具配置

### 1. Visual Studio Code 配置

#### 推荐扩展
```json
{
    "recommendations": [
        "ms-vscode.vscode-json",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-eslint",
        "formulahendry.auto-rename-tag",
        "christian-kohler.path-intellisense",
        "ms-vscode.vscode-typescript-next"
    ]
}
```

#### 工作区配置
```json
{
    "folders": [
        {
            "name": "Eagle2Ae-Ae",
            "path": "./Eagle2Ae-Ae"
        },
        {
            "name": "Eagle2Ae-Eagle",
            "path": "./Eagle2Ae-Eagle"
        }
    ],
    "settings": {
        "editor.tabSize": 4,
        "editor.insertSpaces": true,
        "files.encoding": "utf8",
        "files.eol": "\n",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.fixAll.eslint": true
        }
    }
}
```

### 2. Chrome DevTools 调试配置

#### 启用远程调试
1. 启动 After Effects
2. 打开 Eagle2Ae 扩展
3. 在 Chrome 浏览器中访问：`http://localhost:8092`
4. 选择对应的扩展进行调试

#### 调试端口配置
不同 CEP 版本使用不同的调试端口：

| CEP 版本 | 调试端口 |
|----------|----------|
| CEP 8    | 8092     |
| CEP 9    | 8093     |
| CEP 10   | 8094     |
| CEP 11   | 8095     |
| CEP 12   | 8096     |

### 3. ExtendScript 调试配置

#### 使用 ExtendScript Toolkit (可选)
```javascript
// 在 JSX 文件中添加调试代码
$.writeln("Debug message: " + JSON.stringify(data));

// 启用调试器
if (typeof $ !== 'undefined') {
    $.level = 1; // 启用调试级别
}
```

#### 使用 Visual Studio Code 调试
```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug CEP Extension",
            "type": "chrome",
            "request": "attach",
            "port": 8092,
            "webRoot": "${workspaceFolder}/Eagle2Ae-Ae"
        }
    ]
}
```

## 项目初始化

### 1. 获取项目

```bash
# 克隆项目仓库 (如果使用 Git)
git clone <repository-url>
cd eagle2ae

# 或直接下载项目文件包
# 解压到本地开发目录
```

### 2. 项目结构验证

确认项目结构正确：
```
Eagle2Ae-Ae/
├── index.html                # 主界面文件
├── README.md                 # 扩展说明文档
├── package-lock.json         # 依赖锁定文件
├── enable_cep_debug_mode.reg # CEP 调试模式注册表文件
├── enable_cep_debug_enhanced.reg # 增强调试模式注册表文件
├── CSXS/
│   └── manifest.xml          # CEP 扩展配置文件
├── js/
│   ├── constants/           # 常量定义
│   │   └── ImportSettings.js # 导入设置常量
│   ├── demo/                # 演示模式系统
│   │   ├── demo-apis.js     # API模拟器
│   │   ├── demo-config.json # 演示配置
│   │   ├── demo-mode.js     # 主控制器
│   │   ├── demo-network-interceptor.js # 网络拦截器
│   │   ├── demo-override.js # 数据覆盖策略
│   │   ├── demo-ui.js       # UI状态管理器
│   │   └── easter-egg.js    # 彩蛋功能
│   ├── i18n/                # 国际化支持
│   ├── services/            # 服务层
│   │   ├── FileHandler.js   # 文件处理服务
│   │   ├── PortDiscovery.js # 端口发现服务
│   │   ├── ProjectStatusChecker.js # 项目状态检测器
│   │   └── SettingsManager.js # 设置管理服务
│   ├── types/               # TypeScript类型定义
│   ├── ui/                  # UI组件
│   │   └── summary-dialog.js # 图层检测总结对话框
│   ├── utils/               # 工具函数
│   │   ├── ConfigManager.js # 配置管理器
│   │   ├── LogManager.js    # 日志管理器
│   │   └── SoundPlayer.js   # 声音播放器
│   ├── main.js              # 主应用逻辑
│   ├── polling-client.js    # HTTP轮询客户端
│   └── CSInterface.js       # CEP接口库
├── jsx/
│   ├── hostscript.jsx       # 主 JSX 脚本
│   ├── dialog-warning.jsx   # 警告对话框脚本
│   ├── dialog-summary.jsx   # 总结对话框脚本
│   └── utils/               # JSX 工具函数
└── public/
    ├── logo.png             # 应用图标
    ├── logo2.png            # 备用图标
    └── sound/               # 音频文件
        ├── eagle.wav
        ├── linked.wav
        ├── rnd_okay.wav
        └── stop.wav
```

### 3. 多面板支持配置

Eagle2Ae 支持多面板实例，允许用户同时打开多个面板进行不同的操作。

#### 多面板架构说明
- **面板独立性**: 每个面板实例拥有独立的设置和状态管理器
- **资源共享**: 多个面板共享同一个 ExtendScript 环境
- **通信机制**: 面板间通过 HTTP 轮询与 Eagle 插件通信，支持多实例并发

#### 面板识别机制
```javascript
// 在 main.js 中自动识别当前面板 ID
getPanelId() {
    // 从 Extension ID 中提取面板编号
    if (this.csInterface && typeof this.csInterface.getExtensionID === 'function') {
        const extensionId = this.csInterface.getExtensionID();
        if (extensionId.includes('panel1')) {
            return 'panel1';
        } else if (extensionId.includes('panel2')) {
            return 'panel2';
        } else if (extensionId.includes('panel3')) {
            return 'panel3';
        }
    }
    return 'panel1'; // 默认返回 panel1
}
```

#### 多面板设置管理
```javascript
// 使用面板前缀隔离不同面板的设置
getPanelStorageKey(key) {
    return `${this.panelId}_${key}`;
}

getPanelLocalStorage(key) {
    return localStorage.getItem(this.getPanelStorageKey(key));
}

setPanelLocalStorage(key, value) {
    localStorage.setItem(this.getPanelStorageKey(key), value);
}
```

#### 多面板预设管理
- 每个面板拥有独立的预设文件：`Eagle2Ae1.Presets`、`Eagle2Ae2.Presets`、`Eagle2Ae3.Presets`
- 预设文件与面板 ID 一一对应，确保各面板设置的独立性

### 3. 配置文件检查

#### manifest.xml 配置
```xml
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest Version="7.0" ExtensionBundleId="com.eagle.eagle2ae">
    <ExtensionList>
        <Extension Id="com.eagle.eagle2ae" Version="1.0.0" />
    </ExtensionList>
    <ExecutionEnvironment>
        <HostList>
            <Host Name="AEFT" Version="[15.0,99.9]" />
        </HostList>
        <LocaleList>
            <Locale Code="All" />
        </LocaleList>
        <RequiredRuntimeList>
            <RequiredRuntime Name="CSXS" Version="8.0" />
        </RequiredRuntimeList>
    </ExecutionEnvironment>
    <DispatchInfoList>
        <Extension Id="com.eagle.eagle2ae">
            <DispatchInfo>
                <Resources>
                    <MainPath>./index.html</MainPath>
                    <ScriptPath>./jsx/hostscript.jsx</ScriptPath>
                </Resources>
                <Lifecycle>
                    <AutoVisible>true</AutoVisible>
                </Lifecycle>
                <UI>
                    <Type>Panel</Type>
                    <Menu>Eagle2Ae</Menu>
                    <Geometry>
                        <Size>
                            <Width>400</Width>
                            <Height>600</Height>
                        </Size>
                    </Geometry>
                </UI>
            </DispatchInfo>
        </Extension>
    </DispatchInfoList>
</ExtensionManifest>
```

## 开发工作流

### 1. 日常开发流程

```bash
# 1. 启动开发环境
# 确保 After Effects 已关闭

# 2. 更新代码
git pull origin main

# 3. 启动 After Effects
# 打开 After Effects
# 在菜单中选择 窗口 > 扩展 > Eagle2Ae

# 4. 开始开发
# 修改代码后刷新扩展面板 (F5 或重新打开)
```

### 2. 调试工作流

```bash
# 1. 启用调试模式
# 确保已按照上述步骤启用 CEP 调试模式

# 2. 打开 Chrome 调试器
# 在 Chrome 中访问 http://localhost:8092
# 选择对应的扩展进行调试

# 3. 设置断点和调试
# 在 Chrome DevTools 中设置断点
# 在扩展中触发相应操作

# 4. ExtendScript 调试
# 使用 ExtendScript Toolkit 或 VS Code 调试 JSX 脚本
# 在 JSX 中添加 $.writeln() 输出调试信息
```

### 3. 测试工作流

```bash
# 1. 功能测试
# 测试所有主要功能
# 验证与 Eagle 插件的通信

# 2. 兼容性测试
# 测试不同 AE 版本的兼容性
# 测试不同操作系统的兼容性

# 3. 性能测试
# 测试大文件导入性能
# 测试长时间运行稳定性

# 4. 演示模式测试
# 测试 Web 环境下的演示模式
# 测试 CEP 环境下的彩蛋功能
```

### 4. 演示模式开发

#### Web环境演示开发
- 直接在浏览器中打开 `index.html` 文件进行开发
- 使用 `demo-mode.js` 中的模拟数据进行测试
- 无需安装 After Effects 即可测试 UI 和交互

#### CEP环境演示开发（彩蛋功能）
- 在 After Effects 中打开扩展进行测试
- 连续快速点击顶部"Eagle2AE"标题5次启用演示模式
- 测试完整的演示功能和交互流程

> 📖 **详细说明**: 查看 [Demo功能指南](./demo-guide.md) 了解演示模式的完整功能和配置方法

## 常见问题解决

### 1. 扩展无法加载

**问题**: After Effects 中看不到扩展

**解决方案**:
```bash
# 1. 检查 CEP 调试模式是否启用
# Windows: 检查注册表设置
# macOS: 检查 defaults 设置

# 2. 检查扩展安装路径
# 确认文件在正确的 CEP extensions 目录

# 3. 检查 manifest.xml 配置
# 验证 ExtensionBundleId 和路径配置

# 4. 重启 After Effects
# 完全关闭 AE 后重新启动
```

### 2. 调试器无法连接

**问题**: Chrome DevTools 无法连接到扩展

**解决方案**:
```bash
# 1. 检查调试端口
# 确认使用正确的端口号 (8092-8096)

# 2. 检查防火墙设置
# 确保本地端口未被阻止

# 3. 重启调试服务
# 关闭 AE，重新启动后再次尝试
```

### 3. ExtendScript 错误

**问题**: JSX 脚本执行出错

**解决方案**:
```javascript
// 1. 添加错误处理
try {
    // 你的 JSX 代码
} catch (error) {
    alert("Error: " + error.toString());
}

// 2. 使用调试输出
$.writeln("Debug: " + JSON.stringify(data));

// 3. 检查 AE API 兼容性
// 确认使用的 API 在目标 AE 版本中可用
```

## 性能优化建议

### 1. 开发环境优化

```javascript
// 1. 使用开发模式标志
const isDevelopment = true; // 生产环境设为 false

if (isDevelopment) {
    // 开发模式下的额外日志和调试信息
    console.log('Development mode enabled');
}

// 2. 优化资源加载
// 开发时使用未压缩的资源
// 生产时使用压缩的资源
```

### 2. 调试性能优化

```javascript
// 1. 条件性调试输出
function debugLog(message) {
    if (isDevelopment) {
        console.log('[DEBUG]', message);
    }
}

// 2. 性能监控
function measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    debugLog(`${name} took ${end - start} milliseconds`);
    return result;
}
```

## 扩展打包和分发

### 1. 准备发布版本

```bash
# 1. 清理开发文件
# 移除 demo/ 目录和调试相关文件
# 移除开发时的临时文件

# 2. 更新版本信息
# 更新 manifest.xml 中的版本号
# 更新 README.md 中的版本信息

# 3. 验证扩展功能
# 在干净的 AE 环境中测试所有功能
```

### 2. 创建安装包

```bash
# 1. 复制扩展文件
# 将 Eagle2Ae-Ae 目录复制到发布目录
# 确保包含所有必要文件

# 2. 创建安装脚本
# 为 Windows 和 macOS 创建自动安装脚本
# 包含 CEP 调试模式启用脚本

# 3. 创建用户安装指南
# 编写详细的安装和使用说明
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始开发环境搭建指南 | 开发团队 |

---

**下一步**: 阅读 [CEP开发指南](./cep-development-guide.md) 了解具体的开发技巧和最佳实践。