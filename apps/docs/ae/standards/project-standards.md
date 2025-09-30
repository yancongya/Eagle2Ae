# AE 扩展项目规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的项目管理规范，包括项目结构、配置管理、版本控制、构建流程和发布标准。

## 项目结构规范

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

### 文件命名约定

#### JavaScript 文件
- **模块文件**: kebab-case，如 `websocket-client.js`
- **类文件**: PascalCase，如 `WebSocketClient.js`
- **工具文件**: kebab-case，如 `path-utils.js`
- **常量文件**: kebab-case，如 `error-codes.js`
- **测试文件**: `*.test.js` 或 `*.spec.js`

#### JSX 文件
- **主脚本**: `hostscript.jsx`
- **模块文件**: kebab-case，如 `file-import.jsx`
- **工具文件**: kebab-case，如 `jsx-utils.jsx`
- **测试文件**: `*.test.jsx`

#### 静态资源
- **HTML 文件**: kebab-case，如 `main-panel.html`
- **CSS 文件**: kebab-case，如 `main-styles.css`
- **图片文件**: kebab-case，如 `app-icon.png`

## 配置管理规范

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
    },
    "cep": {
        "id": "com.eagle2ae.ae.extension",
        "version": "1.0.0",
        "hosts": [
            {
                "name": "AEFT",
                "version": "[18.0,99.9]"
            }
        ],
        "ui": {
            "type": "Panel",
            "menu": "Eagle2Ae",
            "geometry": {
                "size": {
                    "width": 350,
                    "height": 500
                },
                "min": {
                    "width": 300,
                    "height": 400
                },
                "max": {
                    "width": 800,
                    "height": 1200
                }
            }
        }
    }
}
```

### manifest.xml 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest Version="7.0" ExtensionBundleId="com.eagle2ae.ae.extension" ExtensionBundleVersion="1.0.0" ExtensionBundleName="Eagle2Ae AE Extension">
    <ExtensionList>
        <Extension Id="com.eagle2ae.ae.extension" Version="1.0.0"/>
    </ExtensionList>
    
    <ExecutionEnvironment>
        <HostList>
            <Host Name="AEFT" Version="[18.0,99.9]"/>
        </HostList>
        <LocaleList>
            <Locale Code="All"/>
        </LocaleList>
        <RequiredRuntimeList>
            <RequiredRuntime Name="CSXS" Version="9.0"/>
        </RequiredRuntimeList>
    </ExecutionEnvironment>
    
    <DispatchInfoList>
        <Extension Id="com.eagle2ae.ae.extension">
            <DispatchInfo>
                <Resources>
                    <MainPath>./public/index.html</MainPath>
                    <ScriptPath>./jsx/hostscript.jsx</ScriptPath>
                    <CEFCommandLine>
                        <Parameter>--enable-nodejs</Parameter>
                        <Parameter>--mixed-context</Parameter>
                    </CEFCommandLine>
                </Resources>
                <Lifecycle>
                    <AutoVisible>true</AutoVisible>
                </Lifecycle>
                <UI>
                    <Type>Panel</Type>
                    <Menu>Eagle2Ae</Menu>
                    <Geometry>
                        <Size>
                            <Width>350</Width>
                            <Height>500</Height>
                        </Size>
                        <MinSize>
                            <Width>300</Width>
                            <Height>400</Height>
                        </MinSize>
                        <MaxSize>
                            <Width>800</Width>
                            <Height>1200</Height>
                        </MaxSize>
                    </Geometry>
                    <Icons>
                        <Icon Type="Normal">./public/images/icons/panel-icon.png</Icon>
                        <Icon Type="RollOver">./public/images/icons/panel-icon-hover.png</Icon>
                        <Icon Type="DarkNormal">./public/images/icons/panel-icon-dark.png</Icon>
                        <Icon Type="DarkRollOver">./public/images/icons/panel-icon-dark-hover.png</Icon>
                    </Icons>
                </UI>
            </DispatchInfo>
        </Extension>
    </DispatchInfoList>
</ExtensionManifest>
```

### 环境配置文件

#### config/development.json
```json
{
    "server": {
        "url": "ws://localhost:8080",
        "timeout": 5000,
        "retryInterval": 3000,
        "maxRetries": 5
    },
    "logging": {
        "level": "debug",
        "console": true,
        "file": true,
        "maxFileSize": "10MB",
        "maxFiles": 5
    },
    "import": {
        "batchSize": 5,
        "timeout": 30000,
        "createComposition": true,
        "organizeFolders": true
    },
    "ui": {
        "theme": "auto",
        "showDebugInfo": true,
        "enableHotReload": true
    }
}
```

#### config/production.json
```json
{
    "server": {
        "url": "ws://localhost:8080",
        "timeout": 10000,
        "retryInterval": 5000,
        "maxRetries": 3
    },
    "logging": {
        "level": "info",
        "console": false,
        "file": true,
        "maxFileSize": "5MB",
        "maxFiles": 3
    },
    "import": {
        "batchSize": 10,
        "timeout": 60000,
        "createComposition": false,
        "organizeFolders": true
    },
    "ui": {
        "theme": "auto",
        "showDebugInfo": false,
        "enableHotReload": false
    }
}
```

## 版本控制规范

### Git 工作流

#### 分支策略
- **main**: 主分支，包含稳定的生产代码
- **develop**: 开发分支，包含最新的开发代码
- **feature/***: 功能分支，用于开发新功能
- **bugfix/***: 修复分支，用于修复 bug
- **release/***: 发布分支，用于准备发布
- **hotfix/***: 热修复分支，用于紧急修复

#### 分支命名规范
```bash
# 功能分支
feature/websocket-communication
feature/batch-file-import
feature/ui-improvements

# 修复分支
bugfix/connection-timeout
bugfix/file-validation-error

# 发布分支
release/v1.0.0
release/v1.1.0

# 热修复分支
hotfix/critical-memory-leak
hotfix/security-patch
```

### .gitignore 配置

```gitignore
# 依赖目录
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 构建输出
dist/
build/
temp/

# 日志文件
logs/
*.log

# 运行时文件
*.pid
*.seed
*.pid.lock

# 覆盖率报告
coverage/
.nyc_output/

# 环境变量
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE 配置
.vscode/settings.json
.idea/
*.swp
*.swo
*~

# 操作系统文件
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Adobe 相关
*.aep.bak
*.aet.bak

# 测试文件
test-results/
*.test.log

# 打包文件
*.zxp
*.zip
*.tar.gz

# 临时文件
*.tmp
*.temp
```

## 构建和打包规范

### 构建脚本 (scripts/build.js)

```javascript
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * 构建 CEP 扩展
 */
class ExtensionBuilder {
    constructor() {
        this.sourceDir = path.resolve(__dirname, '..');
        this.buildDir = path.resolve(__dirname, '../dist');
        this.tempDir = path.resolve(__dirname, '../temp');
    }
    
    async build() {
        console.log('开始构建 CEP 扩展...');
        
        try {
            // 1. 清理构建目录
            await this.cleanBuildDir();
            
            // 2. 创建构建目录
            await this.createBuildDir();
            
            // 3. 复制源文件
            await this.copySourceFiles();
            
            // 4. 处理配置文件
            await this.processConfigFiles();
            
            // 5. 优化资源文件
            await this.optimizeAssets();
            
            // 6. 验证构建结果
            await this.validateBuild();
            
            console.log('构建完成！');
            
        } catch (error) {
            console.error('构建失败:', error);
            process.exit(1);
        }
    }
    
    async cleanBuildDir() {
        if (fs.existsSync(this.buildDir)) {
            fs.rmSync(this.buildDir, { recursive: true });
        }
        if (fs.existsSync(this.tempDir)) {
            fs.rmSync(this.tempDir, { recursive: true });
        }
    }
    
    async createBuildDir() {
        fs.mkdirSync(this.buildDir, { recursive: true });
        fs.mkdirSync(this.tempDir, { recursive: true });
    }
    
    async copySourceFiles() {
        const filesToCopy = [
            'CSXS/',
            'js/',
            'jsx/',
            'public/',
            'package.json'
        ];
        
        for (const file of filesToCopy) {
            const sourcePath = path.join(this.sourceDir, file);
            const targetPath = path.join(this.buildDir, file);
            
            if (fs.existsSync(sourcePath)) {
                this.copyRecursive(sourcePath, targetPath);
            }
        }
    }
    
    async processConfigFiles() {
        // 处理 manifest.xml
        const manifestPath = path.join(this.buildDir, 'CSXS/manifest.xml');
        let manifestContent = fs.readFileSync(manifestPath, 'utf8');
        
        // 替换版本号
        const packageJson = JSON.parse(
            fs.readFileSync(path.join(this.sourceDir, 'package.json'), 'utf8')
        );
        
        manifestContent = manifestContent.replace(
            /ExtensionBundleVersion="[^"]*"/g,
            `ExtensionBundleVersion="${packageJson.version}"`
        );
        
        fs.writeFileSync(manifestPath, manifestContent);
    }
    
    async optimizeAssets() {
        // 压缩 CSS 文件
        // 优化图片文件
        // 移除开发相关文件
        const devFiles = [
            'js/tests/',
            'jsx/tests/',
            '.eslintrc.json',
            '.prettierrc'
        ];
        
        for (const file of devFiles) {
            const filePath = path.join(this.buildDir, file);
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath, { recursive: true });
            }
        }
    }
    
    async validateBuild() {
        // 验证必需文件存在
        const requiredFiles = [
            'CSXS/manifest.xml',
            'public/index.html',
            'js/main.js',
            'jsx/hostscript.jsx'
        ];
        
        for (const file of requiredFiles) {
            const filePath = path.join(this.buildDir, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`必需文件不存在: ${file}`);
            }
        }
        
        console.log('构建验证通过');
    }
    
    copyRecursive(source, target) {
        if (fs.statSync(source).isDirectory()) {
            fs.mkdirSync(target, { recursive: true });
            const files = fs.readdirSync(source);
            
            for (const file of files) {
                this.copyRecursive(
                    path.join(source, file),
                    path.join(target, file)
                );
            }
        } else {
            fs.copyFileSync(source, target);
        }
    }
}

// 执行构建
if (require.main === module) {
    const builder = new ExtensionBuilder();
    builder.build();
}

module.exports = ExtensionBuilder;
```

### 打包脚本 (scripts/package.js)

```javascript
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const ExtensionBuilder = require('./build');

/**
 * 打包 CEP 扩展为 ZXP 文件
 */
class ExtensionPackager {
    constructor() {
        this.buildDir = path.resolve(__dirname, '../dist');
        this.packageDir = path.resolve(__dirname, '../packages');
    }
    
    async package() {
        console.log('开始打包 CEP 扩展...');
        
        try {
            // 1. 先构建项目
            const builder = new ExtensionBuilder();
            await builder.build();
            
            // 2. 创建打包目录
            if (!fs.existsSync(this.packageDir)) {
                fs.mkdirSync(this.packageDir, { recursive: true });
            }
            
            // 3. 读取版本信息
            const packageJson = JSON.parse(
                fs.readFileSync(path.join(this.buildDir, 'package.json'), 'utf8')
            );
            
            // 4. 创建 ZXP 包
            const packageName = `Eagle2Ae-AE-v${packageJson.version}.zxp`;
            const packagePath = path.join(this.packageDir, packageName);
            
            await this.createZXP(this.buildDir, packagePath);
            
            console.log(`打包完成: ${packageName}`);
            console.log(`文件位置: ${packagePath}`);
            
        } catch (error) {
            console.error('打包失败:', error);
            process.exit(1);
        }
    }
    
    async createZXP(sourceDir, outputPath) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', {
                zlib: { level: 9 } // 最高压缩级别
            });
            
            output.on('close', () => {
                console.log(`ZXP 文件大小: ${archive.pointer()} bytes`);
                resolve();
            });
            
            archive.on('error', (err) => {
                reject(err);
            });
            
            archive.pipe(output);
            archive.directory(sourceDir, false);
            archive.finalize();
        });
    }
}

// 执行打包
if (require.main === module) {
    const packager = new ExtensionPackager();
    packager.package();
}

module.exports = ExtensionPackager;
```

## 测试规范

### 测试策略

#### 测试层次
1. **单元测试**: 测试独立的函数和类
2. **集成测试**: 测试模块间的交互
3. **端到端测试**: 测试完整的用户工作流
4. **性能测试**: 测试性能和内存使用

#### 测试覆盖率要求
- **核心功能**: 90% 以上
- **工具函数**: 85% 以上
- **UI 组件**: 70% 以上
- **整体项目**: 80% 以上

### 测试脚本 (scripts/test.js)

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 测试运行器
 */
class TestRunner {
    constructor() {
        this.testDir = path.resolve(__dirname, '../js/tests');
        this.jsxTestDir = path.resolve(__dirname, '../jsx/tests');
    }
    
    async runTests(options = {}) {
        console.log('开始运行测试...');
        
        try {
            let testResults = {
                total: 0,
                passed: 0,
                failed: 0,
                errors: []
            };
            
            // 运行 JavaScript 测试
            if (!options.jsx) {
                const jsResults = await this.runJavaScriptTests(options);
                this.mergeResults(testResults, jsResults);
            }
            
            // 运行 JSX 测试
            if (!options.js) {
                const jsxResults = await this.runJSXTests(options);
                this.mergeResults(testResults, jsxResults);
            }
            
            // 输出测试结果
            this.printResults(testResults);
            
            // 如果有失败的测试，退出码为 1
            if (testResults.failed > 0) {
                process.exit(1);
            }
            
        } catch (error) {
            console.error('测试运行失败:', error);
            process.exit(1);
        }
    }
    
    async runJavaScriptTests(options) {
        console.log('运行 JavaScript 测试...');
        
        const testFiles = this.findTestFiles(this.testDir, options);
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
        
        for (const testFile of testFiles) {
            try {
                const testModule = require(testFile);
                const testResult = await this.runTestModule(testModule, testFile);
                
                results.total += testResult.total;
                results.passed += testResult.passed;
                results.failed += testResult.failed;
                results.errors.push(...testResult.errors);
                
            } catch (error) {
                results.total += 1;
                results.failed += 1;
                results.errors.push({
                    file: testFile,
                    error: error.message
                });
            }
        }
        
        return results;
    }
    
    async runJSXTests(options) {
        console.log('运行 JSX 测试...');
        
        // JSX 测试需要在 After Effects 环境中运行
        // 这里可以使用 ExtendScript Toolkit 或其他工具
        
        return {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
    }
    
    findTestFiles(dir, options) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }
        
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                files.push(...this.findTestFiles(fullPath, options));
            } else if (entry.name.endsWith('.test.js') || entry.name.endsWith('.spec.js')) {
                // 根据选项过滤测试文件
                if (options.unit && !fullPath.includes('/unit/')) continue;
                if (options.integration && !fullPath.includes('/integration/')) continue;
                
                files.push(fullPath);
            }
        }
        
        return files;
    }
    
    async runTestModule(testModule, testFile) {
        const results = {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        };
        
        // 假设测试模块导出测试函数
        if (typeof testModule.runTests === 'function') {
            try {
                const moduleResults = await testModule.runTests();
                return moduleResults;
            } catch (error) {
                results.total = 1;
                results.failed = 1;
                results.errors.push({
                    file: testFile,
                    error: error.message
                });
            }
        }
        
        return results;
    }
    
    mergeResults(target, source) {
        target.total += source.total;
        target.passed += source.passed;
        target.failed += source.failed;
        target.errors.push(...source.errors);
    }
    
    printResults(results) {
        console.log('\n测试结果:');
        console.log(`总计: ${results.total}`);
        console.log(`通过: ${results.passed}`);
        console.log(`失败: ${results.failed}`);
        
        if (results.errors.length > 0) {
            console.log('\n错误详情:');
            results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.file}: ${error.error}`);
            });
        }
        
        const successRate = results.total > 0 ? 
            (results.passed / results.total * 100).toFixed(2) : 0;
        console.log(`\n成功率: ${successRate}%`);
    }
}

// 解析命令行参数
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    
    for (const arg of args) {
        switch (arg) {
            case '--unit':
                options.unit = true;
                break;
            case '--integration':
                options.integration = true;
                break;
            case '--js':
                options.js = true;
                break;
            case '--jsx':
                options.jsx = true;
                break;
        }
    }
    
    return options;
}

// 执行测试
if (require.main === module) {
    const options = parseArgs();
    const runner = new TestRunner();
    runner.runTests(options);
}

module.exports = TestRunner;
```

## 发布规范

### 版本号规范

遵循 [语义化版本控制](https://semver.org/lang/zh-CN/) (SemVer):

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

#### 版本号示例
- `1.0.0` - 首个稳定版本
- `1.1.0` - 新增功能
- `1.1.1` - 修复 bug
- `2.0.0` - 重大更新，可能不兼容

### 发布检查清单

#### 代码质量检查
- [ ] 所有测试通过
- [ ] 代码覆盖率达标
- [ ] ESLint 检查通过
- [ ] 代码格式化完成
- [ ] 没有 TODO 或 FIXME 注释

#### 功能验证
- [ ] 核心功能正常工作
- [ ] 错误处理正确
- [ ] 性能满足要求
- [ ] 兼容性测试通过
- [ ] 用户界面正常显示

#### 文档更新
- [ ] README.md 更新
- [ ] CHANGELOG.md 更新
- [ ] API 文档更新
- [ ] 用户手册更新

#### 打包和分发
- [ ] 构建成功
- [ ] ZXP 包创建成功
- [ ] 安装测试通过
- [ ] 版本号正确

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

## [1.1.0] - 2024-01-15

### 新增
- 批量文件导入功能
- 自动文件夹组织
- 进度显示界面

### 变更
- 改进 WebSocket 连接稳定性
- 优化文件验证逻辑

### 修复
- 修复大文件导入超时问题
- 修复界面在高 DPI 显示器上的显示问题

## [1.0.0] - 2024-01-05

### 新增
- 初始版本发布
- WebSocket 通信功能
- 基础文件导入功能
- 用户界面
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始项目规范文档 | 开发团队 |

---

**相关文档**:
- [编码规范](./coding-standards.md)
- [测试规范](./testing-standards.md)
- [部署指南](../development/deployment-guide.md)