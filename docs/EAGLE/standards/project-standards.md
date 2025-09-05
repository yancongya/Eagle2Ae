# Eagle 插件项目规范

## 概述

本文档定义了 Eagle2Ae Eagle 插件的项目管理规范，包括项目结构、配置管理、版本控制、构建打包、测试和发布等方面的标准化要求。

## 项目结构

### 标准目录结构

```
Eagle2Ae-Eagle/
├── src/                      # 源代码目录
│   ├── index.js              # 插件入口文件
│   ├── plugin.js             # 主插件类
│   ├── services/             # 服务层
│   │   ├── websocket-server.js
│   │   ├── file-collector.js
│   │   ├── logger.js
│   │   └── index.js
│   ├── database/             # 数据库访问层
│   │   ├── eagle-database.js
│   │   ├── query-builder.js
│   │   └── index.js
│   ├── clipboard/            # 剪贴板模块
│   │   ├── clipboard-monitor.js
│   │   └── index.js
│   ├── utils/                # 工具函数
│   │   ├── file-utils.js
│   │   ├── path-utils.js
│   │   ├── validation.js
│   │   └── index.js
│   └── config/               # 配置管理
│       ├── default.js
│       ├── config-manager.js
│       └── index.js
├── tests/                    # 测试文件
│   ├── unit/                 # 单元测试
│   │   ├── services/
│   │   ├── database/
│   │   ├── utils/
│   │   └── fixtures/
│   ├── integration/          # 集成测试
│   │   ├── websocket/
│   │   ├── database/
│   │   └── fixtures/
│   ├── e2e/                  # 端到端测试
│   │   ├── scenarios/
│   │   └── fixtures/
│   └── helpers/              # 测试辅助工具
│       ├── test-server.js
│       ├── mock-eagle.js
│       └── test-utils.js
├── docs/                     # 项目文档
│   ├── api/
│   ├── development/
│   ├── standards/
│   └── README.md
├── scripts/                  # 构建和部署脚本
│   ├── build.js
│   ├── test.js
│   ├── package.js
│   ├── deploy.js
│   └── dev.js
├── config/                   # 配置文件
│   ├── development.json
│   ├── production.json
│   ├── test.json
│   └── default.json
├── logs/                     # 日志文件目录
│   ├── app.log
│   ├── error.log
│   └── debug.log
├── dist/                     # 构建输出目录
├── node_modules/             # 依赖包
├── .vscode/                  # VS Code 配置
│   ├── settings.json
│   ├── launch.json
│   └── tasks.json
├── package.json              # 项目配置
├── package-lock.json         # 依赖锁定
├── .eslintrc.json           # ESLint 配置
├── .prettierrc              # Prettier 配置
├── .gitignore               # Git 忽略文件
├── .env.example             # 环境变量示例
├── README.md                # 项目说明
├── CHANGELOG.md             # 变更日志
└── LICENSE                  # 许可证
```

### 文件命名约定

#### 源代码文件
- JavaScript 文件：使用 kebab-case，如 `websocket-server.js`
- 类文件：使用 PascalCase，如 `EagleDatabase.js`
- 工具函数：使用 kebab-case，如 `file-utils.js`
- 常量文件：使用 kebab-case，如 `error-codes.js`
- 索引文件：统一使用 `index.js`

#### 测试文件
- 单元测试：`*.test.js` 或 `*.spec.js`
- 集成测试：`*.integration.test.js`
- 端到端测试：`*.e2e.test.js`
- 测试数据：`*.fixture.js` 或 `*.mock.js`

#### 配置文件
- 环境配置：`{environment}.json`
- 默认配置：`default.json`
- 示例配置：`*.example.json`

#### 文档文件
- Markdown 文件：使用 kebab-case，如 `api-reference.md`
- README 文件：使用大写 `README.md`
- 变更日志：使用大写 `CHANGELOG.md`

## 配置管理

### package.json 配置

```json
{
  "name": "eagle2ae-eagle-plugin",
  "version": "1.0.0",
  "description": "Eagle2Ae Eagle 插件 - 与 After Effects CEP 扩展通信",
  "main": "src/index.js",
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  },
  "scripts": {
    "start": "node src/index.js",
    "dev": "node scripts/dev.js",
    "build": "node scripts/build.js",
    "test": "node scripts/test.js",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "test:coverage": "jest --coverage",
    "lint": "eslint src tests scripts",
    "lint:fix": "eslint src tests scripts --fix",
    "format": "prettier --write src tests scripts",
    "package": "node scripts/package.js",
    "deploy": "node scripts/deploy.js",
    "clean": "rimraf dist logs/*.log",
    "docs": "jsdoc src -d docs/api",
    "precommit": "npm run lint && npm run test:unit",
    "prepush": "npm run test"
  },
  "keywords": [
    "eagle",
    "after-effects",
    "plugin",
    "automation",
    "file-management"
  ],
  "author": "Eagle2Ae 开发团队",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/eagle2ae-eagle-plugin.git"
  },
  "bugs": {
    "url": "https://github.com/your-org/eagle2ae-eagle-plugin/issues"
  },
  "homepage": "https://github.com/your-org/eagle2ae-eagle-plugin#readme",
  "dependencies": {
    "ws": "^8.14.2",
    "sqlite3": "^5.1.6",
    "clipboardy": "^3.0.0",
    "chokidar": "^3.5.3",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "winston": "^3.11.0",
    "joi": "^17.11.0",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "nodemon": "^3.0.2",
    "rimraf": "^5.0.5",
    "jsdoc": "^4.0.2",
    "supertest": "^6.3.3",
    "@types/node": "^20.10.0"
  },
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/index.js",
      "!src/**/index.js"
    ],
    "coverageDirectory": "coverage",
    "coverageReporters": ["text", "lcov", "html"],
    "testMatch": [
      "**/tests/**/*.test.js",
      "**/tests/**/*.spec.js"
    ],
    "setupFilesAfterEnv": ["<rootDir>/tests/helpers/setup.js"]
  },
  "eslintConfig": {
    "extends": ["eslint:recommended"],
    "env": {
      "node": true,
      "es2021": true,
      "jest": true
    },
    "parserOptions": {
      "ecmaVersion": 2021,
      "sourceType": "module"
    }
  }
}
```

### manifest.json 配置

```json
{
  "name": "Eagle2Ae",
  "version": "1.0.0",
  "description": "Eagle2Ae 插件 - 与 After Effects 的桥梁",
  "author": "Eagle2Ae 开发团队",
  "website": "https://github.com/your-org/eagle2ae",
  "category": "productivity",
  "keywords": ["after-effects", "automation", "workflow"],
  "main": "src/index.js",
  "logo": "assets/logo.png",
  "minEagleVersion": "3.0.0",
  "permissions": [
    "clipboard",
    "filesystem",
    "network"
  ],
  "settings": {
    "websocket": {
      "port": 8080,
      "autoStart": true
    },
    "logging": {
      "level": "info",
      "maxFiles": 5,
      "maxSize": "10MB"
    },
    "performance": {
      "maxConcurrentConnections": 10,
      "messageQueueSize": 1000
    }
  }
}
```

### 环境配置文件

#### config/default.json
```json
{
  "server": {
    "port": 8080,
    "host": "localhost",
    "timeout": 30000
  },
  "database": {
    "eagleLibraryPath": "",
    "connectionTimeout": 5000,
    "queryTimeout": 10000
  },
  "logging": {
    "level": "info",
    "file": {
      "enabled": true,
      "path": "logs/app.log",
      "maxSize": "10MB",
      "maxFiles": 5
    },
    "console": {
      "enabled": true,
      "colorize": true
    }
  },
  "websocket": {
    "heartbeatInterval": 30000,
    "maxConnections": 10,
    "messageQueueSize": 1000,
    "compression": true
  },
  "clipboard": {
    "monitorInterval": 1000,
    "enabled": true
  },
  "performance": {
    "memoryThreshold": 0.8,
    "cpuThreshold": 0.9,
    "monitorInterval": 60000
  }
}
```

#### config/development.json
```json
{
  "logging": {
    "level": "debug",
    "console": {
      "enabled": true,
      "colorize": true
    }
  },
  "websocket": {
    "heartbeatInterval": 10000
  },
  "performance": {
    "monitorInterval": 30000
  }
}
```

#### config/production.json
```json
{
  "logging": {
    "level": "warn",
    "console": {
      "enabled": false
    }
  },
  "websocket": {
    "heartbeatInterval": 60000
  },
  "performance": {
    "memoryThreshold": 0.7,
    "cpuThreshold": 0.8
  }
}
```

#### .env.example
```bash
# 环境变量示例文件
# 复制为 .env 并填入实际值

# 应用环境
NODE_ENV=development

# 服务器配置
SERVER_PORT=8080
SERVER_HOST=localhost

# Eagle 库路径
EAGLE_LIBRARY_PATH=/path/to/eagle/library

# 日志配置
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# WebSocket 配置
WS_HEARTBEAT_INTERVAL=30000
WS_MAX_CONNECTIONS=10

# 性能监控
MEMORY_THRESHOLD=0.8
CPU_THRESHOLD=0.9

# 开发模式设置
DEBUG_MODE=false
VERBOSE_LOGGING=false
```

## 版本控制

### Git 工作流

#### 分支策略
- **main**: 主分支，包含稳定的生产代码
- **develop**: 开发分支，包含最新的开发代码
- **feature/***: 功能分支，用于开发新功能
- **bugfix/***: 修复分支，用于修复 bug
- **release/***: 发布分支，用于准备新版本发布
- **hotfix/***: 热修复分支，用于紧急修复生产问题

#### 分支命名规范
```bash
# 功能分支
feature/websocket-server
feature/file-collector
feature/eagle-database-integration

# 修复分支
bugfix/websocket-connection-issue
bugfix/memory-leak-fix

# 发布分支
release/v1.0.0
release/v1.1.0

# 热修复分支
hotfix/critical-security-fix
hotfix/database-connection-fix
```

#### 提交消息规范
遵循 Conventional Commits 规范：

```bash
# 格式
<type>(<scope>): <subject>

[optional body]

[optional footer]

# 类型
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式修改
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建工具、依赖更新

# 示例
feat(websocket): add heartbeat mechanism
fix(database): resolve connection timeout issue
docs(api): update websocket server documentation
refactor(utils): extract common file operations
test(integration): add websocket connection tests
```

### .gitignore 配置

```gitignore
# 依赖
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock

# 构建输出
dist/
build/
coverage/

# 日志文件
logs/
*.log

# 环境变量
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 临时文件
*.tmp
*.temp
.cache/

# 操作系统
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/settings.json
.idea/
*.swp
*.swo
*~

# 测试
.nyc_output

# 运行时
pids
*.pid
*.seed
*.pid.lock

# 调试
.vscode/launch.json

# Eagle 特定
eagle-library-cache/
*.eagle-backup

# 插件特定
plugin-data/
user-settings.json
```

## 构建和打包规范

### 构建脚本 (scripts/build.js)

```javascript
/**
 * 构建脚本
 * 负责编译、优化和打包插件代码
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class BuildManager {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
        this.srcDir = path.join(this.rootDir, 'src');
        this.distDir = path.join(this.rootDir, 'dist');
        this.configDir = path.join(this.rootDir, 'config');
    }
    
    async build() {
        console.log('开始构建 Eagle 插件...');
        
        try {
            // 清理输出目录
            await this.clean();
            
            // 创建输出目录
            await fs.ensureDir(this.distDir);
            
            // 复制源代码
            await this.copySource();
            
            // 复制配置文件
            await this.copyConfig();
            
            // 复制资源文件
            await this.copyAssets();
            
            // 生成 manifest
            await this.generateManifest();
            
            // 运行代码检查
            await this.runLint();
            
            // 运行测试
            await this.runTests();
            
            console.log('构建完成！');
            
        } catch (error) {
            console.error('构建失败:', error.message);
            process.exit(1);
        }
    }
    
    async clean() {
        console.log('清理输出目录...');
        await fs.remove(this.distDir);
    }
    
    async copySource() {
        console.log('复制源代码...');
        await fs.copy(this.srcDir, path.join(this.distDir, 'src'));
    }
    
    async copyConfig() {
        console.log('复制配置文件...');
        
        // 复制生产配置
        const prodConfig = path.join(this.configDir, 'production.json');
        const defaultConfig = path.join(this.configDir, 'default.json');
        
        await fs.copy(defaultConfig, path.join(this.distDir, 'config', 'default.json'));
        
        if (await fs.pathExists(prodConfig)) {
            await fs.copy(prodConfig, path.join(this.distDir, 'config', 'production.json'));
        }
    }
    
    async copyAssets() {
        console.log('复制资源文件...');
        
        const assetsDir = path.join(this.rootDir, 'assets');
        if (await fs.pathExists(assetsDir)) {
            await fs.copy(assetsDir, path.join(this.distDir, 'assets'));
        }
        
        // 复制 package.json
        const packageJson = await fs.readJson(path.join(this.rootDir, 'package.json'));
        
        // 移除开发依赖
        delete packageJson.devDependencies;
        delete packageJson.scripts.dev;
        delete packageJson.scripts.test;
        
        await fs.writeJson(
            path.join(this.distDir, 'package.json'),
            packageJson,
            { spaces: 2 }
        );
    }
    
    async generateManifest() {
        console.log('生成插件清单...');
        
        const packageJson = await fs.readJson(path.join(this.rootDir, 'package.json'));
        const manifest = {
            name: 'Eagle2Ae',
            version: packageJson.version,
            description: packageJson.description,
            author: packageJson.author,
            main: 'src/index.js',
            minEagleVersion: '3.0.0',
            buildTime: new Date().toISOString(),
            buildNumber: process.env.BUILD_NUMBER || '1'
        };
        
        await fs.writeJson(
            path.join(this.distDir, 'manifest.json'),
            manifest,
            { spaces: 2 }
        );
    }
    
    async runLint() {
        console.log('运行代码检查...');
        try {
            execSync('npm run lint', { stdio: 'inherit', cwd: this.rootDir });
        } catch (error) {
            throw new Error('代码检查失败');
        }
    }
    
    async runTests() {
        console.log('运行测试...');
        try {
            execSync('npm run test:unit', { stdio: 'inherit', cwd: this.rootDir });
        } catch (error) {
            throw new Error('测试失败');
        }
    }
}

// 执行构建
if (require.main === module) {
    const builder = new BuildManager();
    builder.build();
}

module.exports = BuildManager;
```

### 打包脚本 (scripts/package.js)

```javascript
/**
 * 打包脚本
 * 将构建后的插件打包为可分发的格式
 */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const BuildManager = require('./build');

class PackageManager {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
        this.distDir = path.join(this.rootDir, 'dist');
        this.packageDir = path.join(this.rootDir, 'packages');
    }
    
    async package() {
        console.log('开始打包 Eagle 插件...');
        
        try {
            // 先执行构建
            const builder = new BuildManager();
            await builder.build();
            
            // 创建打包目录
            await fs.ensureDir(this.packageDir);
            
            // 读取版本信息
            const packageJson = await fs.readJson(path.join(this.rootDir, 'package.json'));
            const version = packageJson.version;
            
            // 创建 ZIP 包
            await this.createZipPackage(version);
            
            // 创建安装包
            await this.createInstaller(version);
            
            console.log('打包完成！');
            
        } catch (error) {
            console.error('打包失败:', error.message);
            process.exit(1);
        }
    }
    
    async createZipPackage(version) {
        console.log('创建 ZIP 包...');
        
        const zipPath = path.join(this.packageDir, `eagle2ae-eagle-plugin-v${version}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        return new Promise((resolve, reject) => {
            output.on('close', () => {
                console.log(`ZIP 包已创建: ${zipPath} (${archive.pointer()} bytes)`);
                resolve();
            });
            
            archive.on('error', reject);
            archive.pipe(output);
            
            // 添加构建文件
            archive.directory(this.distDir, 'eagle2ae-eagle-plugin');
            
            // 添加安装说明
            archive.file(path.join(this.rootDir, 'README.md'), { name: 'README.md' });
            archive.file(path.join(this.rootDir, 'LICENSE'), { name: 'LICENSE' });
            
            archive.finalize();
        });
    }
    
    async createInstaller(version) {
        console.log('创建安装脚本...');
        
        const installerScript = `#!/bin/bash
# Eagle2Ae Eagle 插件安装脚本
# 版本: ${version}

echo "正在安装 Eagle2Ae Eagle 插件 v${version}..."

# 检查 Eagle 是否安装
if ! command -v eagle &> /dev/null; then
    echo "错误: 未找到 Eagle 应用程序"
    echo "请先安装 Eagle: https://eagle.cool"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org"
    exit 1
fi

# 获取 Eagle 插件目录
EAGLE_PLUGINS_DIR="$HOME/.eagle/plugins"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    EAGLE_PLUGINS_DIR="$APPDATA/Eagle/plugins"
fi

# 创建插件目录
mkdir -p "$EAGLE_PLUGINS_DIR/eagle2ae"

# 复制插件文件
cp -r eagle2ae-eagle-plugin/* "$EAGLE_PLUGINS_DIR/eagle2ae/"

# 安装依赖
cd "$EAGLE_PLUGINS_DIR/eagle2ae"
npm install --production

echo "安装完成！"
echo "请重启 Eagle 以加载插件。"
`;
        
        const installerPath = path.join(this.packageDir, `install-eagle2ae-v${version}.sh`);
        await fs.writeFile(installerPath, installerScript);
        await fs.chmod(installerPath, '755');
        
        console.log(`安装脚本已创建: ${installerPath}`);
    }
}

// 执行打包
if (require.main === module) {
    const packager = new PackageManager();
    packager.package();
}

module.exports = PackageManager;
```

## 测试规范

### 测试策略

#### 测试金字塔
- **单元测试 (70%)**: 测试单个函数和类的功能
- **集成测试 (20%)**: 测试模块间的交互
- **端到端测试 (10%)**: 测试完整的用户场景

#### 测试覆盖率要求
- 代码覆盖率 ≥ 80%
- 分支覆盖率 ≥ 70%
- 函数覆盖率 ≥ 90%
- 行覆盖率 ≥ 85%

### 测试脚本 (scripts/test.js)

```javascript
/**
 * 测试脚本
 * 运行各种类型的测试并生成报告
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class TestManager {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
        this.coverageDir = path.join(this.rootDir, 'coverage');
    }
    
    async runAllTests() {
        console.log('开始运行所有测试...');
        
        try {
            // 清理覆盖率目录
            await fs.remove(this.coverageDir);
            
            // 运行单元测试
            await this.runUnitTests();
            
            // 运行集成测试
            await this.runIntegrationTests();
            
            // 运行端到端测试
            await this.runE2ETests();
            
            // 生成覆盖率报告
            await this.generateCoverageReport();
            
            console.log('所有测试完成！');
            
        } catch (error) {
            console.error('测试失败:', error.message);
            process.exit(1);
        }
    }
    
    async runUnitTests() {
        console.log('运行单元测试...');
        execSync('npm run test:unit', { stdio: 'inherit', cwd: this.rootDir });
    }
    
    async runIntegrationTests() {
        console.log('运行集成测试...');
        execSync('npm run test:integration', { stdio: 'inherit', cwd: this.rootDir });
    }
    
    async runE2ETests() {
        console.log('运行端到端测试...');
        execSync('npm run test:e2e', { stdio: 'inherit', cwd: this.rootDir });
    }
    
    async generateCoverageReport() {
        console.log('生成覆盖率报告...');
        execSync('npm run test:coverage', { stdio: 'inherit', cwd: this.rootDir });
        
        // 检查覆盖率阈值
        const coverageFile = path.join(this.coverageDir, 'coverage-summary.json');
        if (await fs.pathExists(coverageFile)) {
            const coverage = await fs.readJson(coverageFile);
            const total = coverage.total;
            
            console.log('覆盖率统计:');
            console.log(`  行覆盖率: ${total.lines.pct}%`);
            console.log(`  函数覆盖率: ${total.functions.pct}%`);
            console.log(`  分支覆盖率: ${total.branches.pct}%`);
            console.log(`  语句覆盖率: ${total.statements.pct}%`);
            
            // 检查阈值
            if (total.lines.pct < 85) {
                throw new Error(`行覆盖率 ${total.lines.pct}% 低于要求的 85%`);
            }
            if (total.functions.pct < 90) {
                throw new Error(`函数覆盖率 ${total.functions.pct}% 低于要求的 90%`);
            }
        }
    }
}

// 执行测试
if (require.main === module) {
    const testManager = new TestManager();
    testManager.runAllTests();
}

module.exports = TestManager;
```

## 发布规范

### 版本号规范

遵循语义化版本控制 (Semantic Versioning)：

- **主版本号 (MAJOR)**: 不兼容的 API 修改
- **次版本号 (MINOR)**: 向下兼容的功能性新增
- **修订号 (PATCH)**: 向下兼容的问题修正

#### 版本号示例
- `1.0.0`: 首个稳定版本
- `1.1.0`: 新增功能
- `1.1.1`: 修复 bug
- `2.0.0`: 重大更新，可能不兼容

#### 预发布版本
- `1.0.0-alpha.1`: Alpha 版本
- `1.0.0-beta.1`: Beta 版本
- `1.0.0-rc.1`: Release Candidate 版本

### 发布检查清单

#### 代码质量检查
- [ ] 所有测试通过
- [ ] 代码覆盖率达标
- [ ] ESLint 检查通过
- [ ] 代码格式化完成
- [ ] 没有 TODO 或 FIXME 注释

#### 功能检查
- [ ] 新功能完整实现
- [ ] 向下兼容性验证
- [ ] 性能测试通过
- [ ] 安全检查完成
- [ ] 用户界面测试

#### 文档检查
- [ ] API 文档更新
- [ ] 用户手册更新
- [ ] CHANGELOG 更新
- [ ] README 更新
- [ ] 版本号更新

#### 构建和打包
- [ ] 构建脚本运行成功
- [ ] 打包文件完整
- [ ] 安装脚本测试
- [ ] 多平台兼容性测试

### CHANGELOG.md 格式

```markdown
# 更新日志

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本控制](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 新功能描述

### 变更
- 现有功能的变更

### 修复
- Bug 修复

## [1.0.0] - 2024-01-05

### 新增
- WebSocket 服务器实现
- Eagle 数据库集成
- 文件信息收集器
- 剪贴板监控功能
- 配置管理系统
- 日志记录系统
- 完整的测试套件
- 构建和打包脚本

### 变更
- 无

### 修复
- 无

### 安全
- 实现输入验证
- 添加错误处理机制

## [0.1.0] - 2024-01-01

### 新增
- 项目初始化
- 基础项目结构
- 开发环境配置
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始 Eagle 插件项目规范文档 | 开发团队 |

---

**相关文档**:
- [编码规范](./coding-standards.md)
- [测试规范](./testing-standards.md)
- [插件开发指南](../development/plugin-development-guide.md)