# 项目结构规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的项目结构规范，确保项目组织清晰、易于维护和团队协作。

## 标准目录结构

### 核心目录结构

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

## 目录详细说明

### .vscode/ 目录

包含 VS Code 编辑器的配置文件：

```json
// .vscode/settings.json
{
    "editor.tabSize": 4,
    "editor.insertSpaces": true,
    "files.encoding": "utf8",
    "files.eol": "\n",
    "search.exclude": {
        "**/node_modules": true,
        "**/dist": true,
        "**/temp": true
    }
}
```

### CSXS/ 目录

包含 CEP 扩展的核心配置文件：

```xml
<!-- CSXS/manifest.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest Version="7.0" ExtensionBundleId="com.eagle2ae.ae.extension" ExtensionBundleVersion="1.0.0">
    <!-- 扩展清单配置 -->
</ExtensionManifest>
```

### js/ 目录

包含所有的 JavaScript 源码文件：

#### js/main.js
主入口文件，负责初始化扩展和协调各个模块。

#### js/services/ 目录
服务层，包含核心业务逻辑和服务：

- `websocket-client.js` - WebSocket 通信服务
- `file-manager.js` - 文件管理服务
- `config-manager.js` - 配置管理服务
- `logger.js` - 日志服务

#### js/utils/ 目录
工具函数，提供通用的辅助功能：

- `path-utils.js` - 路径处理工具
- `validation.js` - 数据验证工具
- `file-utils.js` - 文件操作工具
- `ui-utils.js` - UI 相关工具

#### js/constants/ 目录
常量定义，包含项目中使用的各种常量：

- `message-types.js` - 消息类型常量
- `error-codes.js` - 错误代码常量
- `config-defaults.js` - 配置默认值常量
- `file-formats.js` - 文件格式常量

#### js/ui/ 目录
UI 组件，包含用户界面相关的组件：

- `components/` - 可复用的 UI 组件
- `dialogs/` - 对话框组件

#### js/tests/ 目录
测试文件，包含各种类型的测试：

- `unit/` - 单元测试
- `integration/` - 集成测试
- `fixtures/` - 测试数据和夹具

### jsx/ 目录

包含所有的 ExtendScript 脚本文件：

#### jsx/hostscript.jsx
主机脚本，负责与 After Effects 的交互。

#### jsx/utils/ 目录
JSX 工具函数：

- `jsx-utils.jsx` - 通用 JSX 工具
- `file-utils.jsx` - 文件操作工具
- `project-utils.jsx` - 项目操作工具

#### jsx/modules/ 目录
JSX 模块，包含具体的业务功能：

- `file-import.jsx` - 文件导入模块
- `composition-manager.jsx` - 合成管理模块
- `project-organizer.jsx` - 项目组织模块

#### jsx/tests/ 目录
JSX 测试文件：

- `test-runner.jsx` - JSX 测试运行器

### public/ 目录

包含静态资源文件：

#### public/index.html
主页面文件，CEP 扩展的入口 HTML 文件。

#### public/css/ 目录
CSS 样式文件：

- `main.css` - 主样式文件
- `components.css` - 组件样式文件
- `themes/` - 主题样式文件

#### public/images/ 目录
图片资源：

- `icons/` - 图标文件
- `logos/` - Logo 文件
- `ui/` - UI 元素图片

#### public/fonts/ 目录
字体文件。

### config/ 目录

包含不同环境的配置文件：

- `development.json` - 开发环境配置
- `production.json` - 生产环境配置
- `test.json` - 测试环境配置

### scripts/ 目录

包含构建和部署脚本：

- `build.js` - 构建脚本
- `test.js` - 测试脚本
- `package.js` - 打包脚本
- `deploy.js` - 部署脚本

### docs/ 目录

包含项目文档：

- `README.md` - 项目说明
- `CHANGELOG.md` - 更新日志
- `API.md` - API 文档
- `TROUBLESHOOTING.md` - 故障排除指南

## 文件命名规范

### 目录命名

- 使用小写字母
- 使用连字符分隔单词（kebab-case）
- 避免使用特殊字符和空格

```bash
# 正确的目录命名
js/
jsx/
public/
config/
scripts/
docs/

# 错误的目录命名
JS/           # 大写字母
JavaScript/   # 驼峰命名
js_files/     # 下划线分隔
```

### 文件命名

根据不同类型的文件采用不同的命名规范：

#### JavaScript 文件
- 使用 kebab-case 命名
- 测试文件使用 `.test.js` 或 `.spec.js` 后缀

```bash
# 正确的命名
websocket-client.js
file-manager.js
websocket-client.test.js

# 错误的命名
WebSocketClient.js    # PascalCase
fileManager.js        # camelCase
websocket_client.js   # snake_case
```

#### JSX 文件
- 使用 kebab-case 命名
- 测试文件使用 `.test.jsx` 后缀

```bash
# 正确的命名
hostscript.jsx
file-import.jsx
file-import.test.jsx

# 错误的命名
HostScript.jsx        # PascalCase
fileImport.jsx        # camelCase
file_import.jsx       # snake_case
```

#### 配置文件
- 使用 kebab-case 命名
- 使用适当的文件扩展名

```bash
# 正确的命名
development.json
production.json
.eslintrc.json
.prettierrc

# 错误的命名
Development.json      # PascalCase
production.JSON       # 大写扩展名
.eslint.json          # 不一致的命名
```

## 目录权限和安全

### 敏感文件保护

```gitignore
# .gitignore 应该包含以下内容
node_modules/
dist/
temp/
logs/
.env
*.log
*.tmp
.DS_Store
Thumbs.db
```

### 配置文件安全

```json
// 避免在配置文件中存储敏感信息
{
    "server": {
        "url": "ws://localhost:8080",
        "timeout": 5000
    },
    // 不要在配置文件中存储密码或 API 密钥
    "api": {
        "key": "USE_ENVIRONMENT_VARIABLES_INSTEAD"
    }
}
```

## 项目初始化脚本

### package.json 配置

```json
{
    "name": "eagle2ae-ae-extension",
    "version": "1.0.0",
    "description": "Eagle2Ae After Effects CEP Extension",
    "main": "js/main.js",
    "scripts": {
        "dev": "node scripts/dev.js",
        "build": "node scripts/build.js",
        "test": "node scripts/test.js",
        "test:unit": "node scripts/test.js --unit",
        "test:integration": "node scripts/test.js --integration",
        "lint": "eslint js/**/*.js jsx/**/*.jsx",
        "lint:fix": "eslint js/**/*.js jsx/**/*.jsx --fix",
        "format": "prettier --write js/**/*.js jsx/**/*.jsx public/**/*.{html,css}",
        "package": "node scripts/package.js",
        "deploy": "node scripts/deploy.js",
        "clean": "rimraf dist temp logs"
    },
    "keywords": [
        "adobe",
        "after-effects",
        "cep",
        "extension",
        "eagle",
        "workflow"
    ],
    "author": "Eagle2Ae Team",
    "license": "MIT",
    "engines": {
        "node": ">=14.0.0"
    },
    "devDependencies": {
        "eslint": "^8.0.0",
        "prettier": "^2.0.0",
        "rimraf": "^3.0.0",
        "archiver": "^5.0.0"
    }
}
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始项目结构规范文档 | 开发团队 |

---

**相关文档**:
- [文件组织规范](./file-organization-standards.md)
- [配置管理规范](./configuration-management-standards.md)
- [版本控制规范](./version-control-standards.md)