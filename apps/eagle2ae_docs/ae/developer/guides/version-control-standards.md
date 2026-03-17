# 版本控制规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的版本控制规范，确保代码版本管理的一致性、可追溯性和团队协作效率。

## Git 工作流

### 分支策略

采用 Git Flow 工作流，包含以下主要分支类型：

#### 主要分支

1. **main** - 主分支
   - 包含稳定的生产代码
   - 仅接受来自 release 分支的合并
   - 每次合并都会打标签并发布新版本

2. **develop** - 开发分支
   - 包含最新的开发代码
   - 作为所有功能开发的基础分支
   - 从 main 分支创建

#### 支持分支

3. **feature/*** - 功能分支
   - 用于开发新功能
   - 从 develop 分支创建
   - 完成后合并回 develop 分支

4. **release/*** - 发布分支
   - 用于准备发布新版本
   - 从 develop 分支创建
   - 完成后合并到 main 和 develop 分支

5. **hotfix/*** - 热修复分支
   - 用于紧急修复生产环境问题
   - 从 main 分支创建
   - 完成后合并到 main 和 develop 分支

### 分支命名规范

```bash
# 功能分支
feature/user-authentication
feature/batch-file-import
feature/ui-improvements
feature/websocket-communication

# 发布分支
release/v1.0.0
release/v1.1.0
release/v2.0.0

# 热修复分支
hotfix/critical-bug-fix
hotfix/security-patch
hotfix/memory-leak-fix

# 修复分支
bugfix/connection-timeout
bugfix/file-validation-error
bugfix/ui-display-issue
```

## 提交规范

### 提交信息格式

采用 Conventional Commits 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 提交类型 (type)

- **feat**: 新功能
- **fix**: 修复 bug
- **docs**: 文档更新
- **style**: 代码格式调整（不影响代码运行）
- **refactor**: 代码重构（既不修复 bug 也不添加功能）
- **perf**: 性能优化
- **test**: 测试相关
- **build**: 构建系统或外部依赖变更
- **ci**: CI 配置文件和脚本
- **chore**: 其他不修改 src 或 test 文件的变更
- **revert**: 撤销之前的提交

#### 范围 (scope)

可选，用于说明 commit 影响的范围：

- **js**: JavaScript 代码
- **jsx**: ExtendScript 代码
- **ui**: 用户界面
- **config**: 配置文件
- **build**: 构建系统
- **test**: 测试相关
- **docs**: 文档

#### 示例提交信息

```bash
# 新功能
feat(js): 添加 WebSocket 连接状态监控功能

# 修复 bug
fix(websocket): 修复连接超时后无法重连的问题

# 文档更新
docs(readme): 更新安装说明和使用示例

# 代码重构
refactor(file-manager): 优化文件导入逻辑

# 性能优化
perf(import): 提高大文件导入性能

# 测试相关
test(websocket): 添加连接超时测试用例

# 构建系统
build(package): 更新依赖版本和构建配置

# CI 配置
ci(github): 添加自动化测试工作流

# 其他变更
chore(version): 更新版本号到 1.1.0

# 撤销提交
revert: feat: 添加实验性功能

# 带范围的提交
feat(ui): 添加设置对话框
fix(config): 修复生产环境配置加载问题
```

### 提交信息验证

使用 commitlint 验证提交信息格式：

```javascript
// commitlint.config.js
module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',
                'fix',
                'docs',
                'style',
                'refactor',
                'perf',
                'test',
                'build',
                'ci',
                'chore',
                'revert'
            ]
        ],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],
        'scope-case': [2, 'always', 'lower-case'],
        'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'header-max-length': [2, 'always', 72]
    }
};
```

## 分支管理

### 分支创建和合并流程

#### 创建功能分支

```bash
# 从 develop 分支创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature-name

# 推送新分支到远程仓库
git push origin feature/new-feature-name
```

#### 功能开发完成合并

```bash
# 确保功能分支是最新的
git checkout feature/new-feature-name
git rebase develop

# 合并到 develop 分支
git checkout develop
git merge --no-ff feature/new-feature-name

# 删除功能分支
git branch -d feature/new-feature-name
git push origin --delete feature/new-feature-name
```

#### 创建发布分支

```bash
# 从 develop 分支创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.1.0

# 推送发布分支到远程仓库
git push origin release/v1.1.0
```

#### 发布分支合并

```bash
# 合并到 main 分支
git checkout main
git merge --no-ff release/v1.1.0

# 打标签
git tag -a v1.1.0 -m "Release version 1.1.0"

# 推送标签
git push origin v1.1.0

# 合并到 develop 分支
git checkout develop
git merge --no-ff release/v1.1.0

# 删除发布分支
git branch -d release/v1.1.0
git push origin --delete release/v1.1.0
```

#### 热修复流程

```bash
# 从 main 分支创建热修复分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 修复完成后合并
git checkout main
git merge --no-ff hotfix/critical-bug
git tag -a v1.0.1 -m "Hotfix version 1.0.1"
git push origin v1.0.1

# 合并到 develop 分支
git checkout develop
git merge --no-ff hotfix/critical-bug

# 删除热修复分支
git branch -d hotfix/critical-bug
git push origin --delete hotfix/critical-bug
```

## .gitignore 配置

### 标准 .gitignore 文件

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

# 编辑器备份文件
*~
.*.swp
.*.swo

# 系统文件
desktop.ini
Thumbs.db
```

## 标签管理

### 语义化版本控制

遵循 [语义化版本控制](https://semver.org/lang/zh-CN/) (SemVer) 规范：

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能性新增
- **修订号**: 向下兼容的问题修正

#### 版本号格式

```
主版本号.次版本号.修订号
```

#### 版本号示例

```bash
# 首个稳定版本
v1.0.0

# 新增功能
v1.1.0
v1.2.0

# 修复 bug
v1.0.1
v1.0.2

# 重大更新（不兼容）
v2.0.0

# 预发布版本
v1.0.0-alpha.1
v1.0.0-beta.1
v1.0.0-rc.1
```

### 标签创建

```bash
# 创建轻量标签
git tag v1.0.0

# 创建附注标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送单个标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags
```

## 合并策略

### 合并方式选择

#### --no-ff 合并

保持分支历史的完整性：

```bash
git merge --no-ff feature/new-feature
```

#### Squash 合并

将多个提交压缩为一个提交：

```bash
git merge --squash feature/new-feature
git commit -m "feat: 添加新功能"
```

#### Rebase 合并

保持线性历史：

```bash
git rebase develop
git checkout develop
git merge feature/new-feature
```

### 合并策略建议

1. **功能分支合并到 develop**: 使用 `--no-ff` 保持历史完整性
2. **发布分支合并到 main**: 使用 `--no-ff` 并打标签
3. **热修复分支**: 使用 `--no-ff` 并同时合并到 main 和 develop
4. **小的修复分支**: 可以考虑使用 squash 合并

## 代码审查

### Pull Request 流程

1. **创建 Pull Request**
   - 从功能分支向 develop 分支发起 PR
   - 填写详细的描述信息
   - 关联相关的 issue

2. **代码审查**
   - 至少需要一个团队成员审查
   - 审查通过后才能合并
   - 审查重点关注代码质量、功能正确性、性能影响

3. **自动化检查**
   - 运行所有测试
   - 代码风格检查
   - 安全扫描

4. **合并**
   - 审查通过且自动化检查通过后才能合并
   - 使用适当的合并策略

### 审查清单

#### 功能性检查
- [ ] 代码实现了所需的功能
- [ ] 边界条件得到正确处理
- [ ] 错误情况得到适当处理
- [ ] 返回值类型和格式正确

#### 代码质量检查
- [ ] 函数长度合理（< 50 行）
- [ ] 函数职责单一
- [ ] 变量命名清晰有意义
- [ ] 注释充分且准确
- [ ] 没有重复代码

#### 性能检查
- [ ] 没有不必要的循环或递归
- [ ] 异步操作使用合适的并发策略
- [ ] 内存使用合理，及时清理资源
- [ ] 没有阻塞 UI 的长时间操作

#### 安全检查
- [ ] 输入验证充分
- [ ] 没有硬编码的敏感信息
- [ ] 文件路径处理安全
- [ ] 错误信息不泄露敏感数据

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始版本控制规范文档 | 开发团队 |

---

**相关文档**:
- [配置管理规范](./configuration-management-standards.md)
- [构建打包规范](./build-packaging-standards.md)
- [测试规范](./testing-standards.md)