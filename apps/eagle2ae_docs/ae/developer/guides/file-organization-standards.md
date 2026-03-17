# 文件组织规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的文件组织规范，确保项目结构清晰、易于维护和团队协作。

## 目录结构

### 标准目录结构

```
Eagle2Ae-Ae/
├── .vscode/                 # VS Code 配置
│   ├── settings.json
│   ├── launch.json
│   └── extensions.json
├── CSXS/                    # CEP 扩展配置
│   └── manifest.xml
├── js/                      # JavaScript 源码
│   ├── main.js             # 主入口文件
│   ├── services/           # 服务层
│   │   ├── websocket-client.js
│   │   ├── file-manager.js
│   │   ├── config-manager.js
│   │   └── logger.js
│   ├── utils/              # 工具函数
│   │   ├── path-utils.js
│   │   ├── validation.js
│   │   ├── file-utils.js
│   │   └── ui-utils.js
│   ├── constants/          # 常量定义
│   │   ├── message-types.js
│   │   ├── error-codes.js
│   │   ├── config-defaults.js
│   │   └── file-formats.js
│   ├── ui/                 # UI 组件
│   │   ├── components/
│   │   │   ├── file-list.js
│   │   │   ├── progress-bar.js
│   │   │   └── status-indicator.js
│   │   └── dialogs/
│   │       ├── settings-dialog.js
│   │       ├── error-dialog.js
│   │       └── about-dialog.js
│   └── tests/              # 测试文件
│       ├── unit/
│       ├── integration/
│       └── fixtures/
├── jsx/                    # ExtendScript 脚本
│   ├── hostscript.jsx      # 主机脚本
│   ├── utils/              # JSX 工具函数
│   │   ├── jsx-utils.jsx
│   │   ├── file-utils.jsx
│   │   └── project-utils.jsx
│   ├── modules/            # JSX 模块
│   │   ├── file-import.jsx
│   │   ├── composition-manager.jsx
│   │   └── project-organizer.jsx
│   └── tests/              # JSX 测试
│       └── test-runner.jsx
├── public/                 # 静态资源
│   ├── index.html          # 主页面
│   ├── css/                # 样式文件
│   │   ├── main.css
│   │   ├── components.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   ├── images/             # 图片资源
│   │   ├── icons/
│   │   ├── logos/
│   │   └── ui/
│   └── fonts/              # 字体文件
├── config/                 # 配置文件
│   ├── development.json
│   ├── production.json
│   └── test.json
├── scripts/                # 构建脚本
│   ├── build.js
│   ├── test.js
│   ├── package.js
│   └── deploy.js
├── docs/                   # 项目文档
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── API.md
│   └── TROUBLESHOOTING.md
├── .gitignore              # Git 忽略文件
├── .eslintrc.json          # ESLint 配置
├── .prettierrc             # Prettier 配置
├── package.json            # 项目配置
├── package-lock.json       # 依赖锁定
└── README.md               # 项目说明
```

## 文件命名约定

### JavaScript 文件

```javascript
// 模块文件使用 kebab-case
websocket-client.js
file-manager.js
config-manager.js

// 类文件使用 PascalCase
WebSocketClient.js
FileManager.js
ConfigManager.js

// 工具文件使用 kebab-case
path-utils.js
validation.js
file-utils.js

// 常量文件使用 kebab-case
message-types.js
error-codes.js
config-defaults.js

// 测试文件使用 *.test.js 或 *.spec.js
websocket-client.test.js
file-manager.spec.js
```

### JSX 文件

```javascript
// 主脚本使用 kebab-case
hostscript.jsx

// 模块文件使用 kebab-case
file-import.jsx
composition-manager.jsx
project-organizer.jsx

// 工具文件使用 kebab-case
jsx-utils.jsx
file-utils.jsx
project-utils.jsx

// 测试文件使用 *.test.jsx
file-import.test.jsx
composition-manager.test.jsx
```

### 静态资源文件

```javascript
// HTML 文件使用 kebab-case
main-panel.html
settings-dialog.html
error-dialog.html

// CSS 文件使用 kebab-case
main-styles.css
components.css
dark-theme.css

// 图片文件使用 kebab-case
app-icon.png
panel-background.jpg
button-hover.svg

// 字体文件使用 kebab-case
roboto-regular.woff
roboto-bold.woff2
icon-font.ttf
```

## 文件内容组织

### JavaScript 文件结构

```javascript
// 1. 文件头注释
/**
 * WebSocket 客户端管理器
 * 负责与 Eagle 插件的 WebSocket 通信
 * 
 * @author Eagle2Ae 开发团队
 * @date 2024-01-05
 * @version 1.0.0
 */

// 2. 导入语句
const EventEmitter = require('events');
const Logger = require('../utils/logger');

// 3. 常量定义
const DEFAULT_TIMEOUT = 5000;
const MAX_RETRIES = 3;

// 4. 类定义
class WebSocketClient extends EventEmitter {
    constructor(url, options = {}) {
        super();
        this.url = url;
        this.options = options;
    }
    
    // 方法定义...
}

// 5. 导出语句
module.exports = WebSocketClient;

// 6. 辅助函数（如果需要）
function helperFunction() {
    // 实现...
}
```

### JSX 文件结构

```javascript
// 1. 文件头注释
/**
 * 文件导入模块
 * 负责处理 After Effects 中的文件导入操作
 * 
 * @author Eagle2Ae 开发团队
 * @date 2024-01-05
 * @version 1.0.0
 */

// 2. 包含其他 JSX 文件（如果需要）
#include "jsx-utils.jsx"
#include "file-utils.jsx"

// 3. 常量定义
var SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'tiff', 'mp4', 'mov'];
var DEFAULT_IMPORT_OPTIONS = {
    importAs: 'footage',
    createProxy: false
};

// 4. 函数定义
function importFileToProject(filePath, options) {
    // 实现...
}

function validateFilePath(filePath) {
    // 实现...
}

// 5. 主函数（如果需要）
function main() {
    // 主要逻辑...
}

// 6. 执行主函数（如果需要）
main();
```

### HTML 文件结构

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Eagle2Ae AE Extension</title>
    
    <!-- CSS 样式 -->
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/components.css">
    
    <!-- 图标 -->
    <link rel="icon" href="images/icons/app-icon.png">
</head>
<body>
    <!-- 主要内容 -->
    <div id="app">
        <!-- UI 组件 -->
    </div>
    
    <!-- JavaScript 脚本 -->
    <script src="js/main.js"></script>
</body>
</html>
```

## 模块化组织

### 服务层组织

```
js/services/
├── websocket-client.js     # WebSocket 通信服务
├── file-manager.js         # 文件管理服务
├── config-manager.js       # 配置管理服务
├── logger.js               # 日志服务
└── event-bus.js            # 事件总线服务
```

### 工具函数组织

```
js/utils/
├── path-utils.js           # 路径处理工具
├── validation.js           # 数据验证工具
├── file-utils.js           # 文件操作工具
├── ui-utils.js             # UI 相关工具
├── date-utils.js           # 日期处理工具
└── string-utils.js         # 字符串处理工具
```

### 常量组织

```
js/constants/
├── message-types.js        # 消息类型常量
├── error-codes.js          # 错误代码常量
├── config-defaults.js      # 配置默认值常量
├── file-formats.js         # 文件格式常量
└── ui-states.js            # UI 状态常量
```

### UI 组件组织

```
js/ui/
├── components/
│   ├── file-list.js        # 文件列表组件
│   ├── progress-bar.js     # 进度条组件
│   ├── status-indicator.js # 状态指示器组件
│   └── button-group.js     # 按钮组组件
└── dialogs/
    ├── settings-dialog.js  # 设置对话框
    ├── error-dialog.js     # 错误对话框
    └── about-dialog.js     # 关于对话框
```

## 测试文件组织

### JavaScript 测试组织

```
js/tests/
├── unit/                   # 单元测试
│   ├── services/
│   ├── utils/
│   └── constants/
├── integration/            # 集成测试
│   ├── websocket.test.js
│   ├── file-import.test.js
│   └── config.test.js
├── e2e/                    # 端到端测试
│   ├── import-workflow.test.js
│   └── ui-interaction.test.js
└── fixtures/               # 测试数据
    ├── test-files/
    ├── mock-data.js
    └── test-config.json
```

### JSX 测试组织

```
jsx/tests/
├── unit/                   # 单元测试
│   ├── modules/
│   └── utils/
├── integration/            # 集成测试
│   ├── file-import.test.jsx
│   └── project-management.test.jsx
└── framework/              # 测试框架
    └── jsx-test-framework.jsx
```

## 配置文件组织

### 环境配置

```json
// config/development.json
{
    "server": {
        "url": "ws://localhost:8080",
        "timeout": 5000
    },
    "logging": {
        "level": "debug",
        "console": true
    }
}

// config/production.json
{
    "server": {
        "url": "ws://localhost:8080",
        "timeout": 10000
    },
    "logging": {
        "level": "info",
        "console": false
    }
}
```

### 构建脚本组织

```
scripts/
├── build.js                # 构建脚本
├── test.js                 # 测试脚本
├── package.js              # 打包脚本
├── deploy.js               # 部署脚本
├── clean.js                # 清理脚本
└── utils/                  # 脚本工具
    ├── file-utils.js
    └── path-utils.js
```

## 文档组织

### 项目文档组织

```
docs/
├── README.md               # 项目说明
├── CHANGELOG.md            # 更新日志
├── API.md                  # API 文档
├── TROUBLESHOOTING.md      # 故障排除
├── architecture/           # 架构文档
│   ├── overview.md
│   └── components.md
├── development/            # 开发文档
│   ├── setup.md
│   ├── coding-standards.md
│   └── testing.md
└── user-guide/             # 用户指南
    ├── installation.md
    ├── usage.md
    └── faq.md
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始文件组织规范文档 | 开发团队 |

---

**相关文档**:
- [JavaScript 编码规范](./javascript-coding-standards.md)
- [JSX 编码规范](./jsx-coding-standards.md)
- [项目结构规范](./project-structure-standards.md)