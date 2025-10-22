# Git 提交规范

## 概述

Eagle2Ae 项目采用 **Conventional Commits** 规范来管理 Git 提交信息。统一的提交规范有助于：

- 自动生成更新日志 (Changelog)
- 语义化版本管理
- 提高代码审查效率
- 便于问题追踪和回滚
- 团队协作标准化

## 提交消息格式

### 基本格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 格式说明

- **Header**: `<type>(<scope>): <subject>` (必需)
- **Body**: 详细描述 (可选)
- **Footer**: 关联 Issue 或 Breaking Changes (可选)

### 示例

```
feat(ae): add file import dialog with progress indicator

- Add modal dialog for file import progress
- Implement real-time progress updates
- Add cancel functionality for long operations

Closes #123
```

## Type 类型定义

### 主要类型

#### `feat` - 新功能
新增功能特性

```bash
feat(ae): add batch file import functionality
feat(eagle): implement clipboard file path reading
feat(comm): add WebSocket auto-reconnection
```

#### `fix` - Bug 修复
修复现有功能的问题

```bash
fix(ae): resolve file path encoding issue on Windows
fix(eagle): fix WebSocket connection timeout
fix(comm): handle malformed JSON messages
```

#### `docs` - 文档更新
仅修改文档内容

```bash
docs(api): update WebSocket API documentation
docs(setup): add macOS installation guide
docs(readme): fix broken links in README
```

#### `style` - 代码格式
不影响代码逻辑的格式修改

```bash
style(ae): fix indentation in main.js
style(eagle): add missing semicolons
style(all): apply prettier formatting
```

#### `refactor` - 代码重构
既不是新增功能，也不是修复 Bug 的代码变更

```bash
refactor(ae): extract file validation logic to utility
refactor(eagle): simplify WebSocket message handling
refactor(comm): optimize message serialization
```

#### `perf` - 性能优化
提升性能的代码修改

```bash
perf(ae): optimize large file import performance
perf(eagle): reduce memory usage in file scanning
perf(comm): implement message compression
```

#### `test` - 测试相关
新增或修改测试代码

```bash
test(ae): add unit tests for file import module
test(eagle): add integration tests for WebSocket
test(comm): add error handling test cases
```

#### `chore` - 构建和工具
构建流程、辅助工具的变更

```bash
chore(deps): update dependencies to latest versions
chore(build): add webpack optimization config
chore(ci): setup GitHub Actions workflow
```

### 特殊类型

#### `revert` - 回滚提交
回滚之前的提交

```bash
revert: feat(ae): add experimental feature

This reverts commit 1234567.
Reason: Feature caused performance issues
```

#### `merge` - 合并提交
合并分支的提交 (通常由 Git 自动生成)

```bash
merge: branch 'feature/new-ui' into main
```

## Scope 范围定义

### 项目范围

#### `ae` - After Effects CEP 扩展
涉及 CEP 扩展相关的修改

```bash
feat(ae): add new import settings panel
fix(ae): resolve ExtendScript execution error
docs(ae): update CEP development guide
```

#### `eagle` - Eagle 插件
涉及 Eagle 插件相关的修改

```bash
feat(eagle): implement service mode interface
fix(eagle): resolve database connection issue
perf(eagle): optimize file metadata reading
```

#### `comm` - 通信协议
涉及两个插件间通信的修改

```bash
feat(comm): add new message type for status sync
fix(comm): handle WebSocket reconnection properly
docs(comm): update communication protocol spec
```

### 功能范围

#### `ui` - 用户界面
涉及用户界面的修改

```bash
feat(ui): add dark theme support
fix(ui): resolve layout issues on small screens
style(ui): update button styles
```

#### `api` - API 接口
涉及 API 接口的修改

```bash
feat(api): add new file metadata endpoint
fix(api): validate input parameters properly
docs(api): add API usage examples
```

#### `config` - 配置管理
涉及配置文件和设置的修改

```bash
feat(config): add user preference settings
fix(config): resolve config file parsing error
chore(config): update default configuration
```

#### `security` - 安全相关
涉及安全性的修改

```bash
feat(security): add input validation
fix(security): resolve path traversal vulnerability
docs(security): add security best practices
```

### 通用范围

#### `deps` - 依赖管理
涉及项目依赖的修改

```bash
chore(deps): update ws library to v8.18.3
fix(deps): resolve dependency conflict
chore(deps): remove unused dependencies
```

#### `build` - 构建系统
涉及构建和打包的修改

```bash
feat(build): add production build optimization
fix(build): resolve webpack configuration issue
chore(build): update build scripts
```

#### `ci` - 持续集成
涉及 CI/CD 的修改

```bash
feat(ci): add automated testing workflow
fix(ci): resolve deployment script error
chore(ci): update GitHub Actions configuration
```

## Subject 主题编写

### 编写规则

1. **使用祈使句**: 以动词原形开头
2. **首字母小写**: 不要大写第一个字母
3. **无句号**: 结尾不要加句号
4. **简洁明了**: 不超过 50 个字符
5. **描述做什么**: 而不是为什么做

### 好的示例

```bash
✅ add file validation before import
✅ fix WebSocket connection timeout issue
✅ update API documentation
✅ remove deprecated function calls
✅ optimize image loading performance
```

### 不好的示例

```bash
❌ Add file validation before import.  # 有句号
❌ Fixed bugs                          # 过于模糊
❌ Update                             # 缺少具体内容
❌ Added new feature for better UX    # 过于冗长
❌ Bug fix                            # 不够具体
```

## Body 正文编写

### 编写指南

1. **详细说明**: 解释修改的原因和方式
2. **分点列举**: 使用列表说明多个变更
3. **换行分隔**: 与 Header 之间空一行
4. **每行限制**: 每行不超过 72 个字符

### 示例

```
feat(ae): add batch file import with progress tracking

- Implement batch import functionality for multiple files
- Add progress bar with real-time status updates
- Include cancel operation for long-running imports
- Add error handling for individual file failures
- Update UI to show import statistics

This feature addresses user requests for handling
large numbers of files efficiently.
```

## Footer 脚注编写

### 关联 Issue

```bash
# 关闭单个 Issue
Closes #123

# 关闭多个 Issue
Closes #123, #456, #789

# 关联但不关闭
Refs #123
Related to #456
```

### Breaking Changes

```bash
BREAKING CHANGE: remove deprecated API endpoints

The following endpoints have been removed:
- GET /api/v1/files (use /api/v2/files instead)
- POST /api/v1/import (use /api/v2/import instead)

Migration guide: https://docs.example.com/migration
```

### 共同作者

```bash
Co-authored-by: 张三 <zhangsan@example.com>
Co-authored-by: 李四 <lisi@example.com>
```

## 完整示例

### 功能新增示例

```
feat(ae): add real-time file import progress tracking

Implement comprehensive progress tracking for file import operations:

- Add progress bar component with percentage display
- Implement real-time status updates via WebSocket
- Add cancel functionality for long-running operations
- Include detailed error reporting for failed imports
- Add import statistics (success/failure counts)
- Update UI to show current file being processed

The progress tracking improves user experience by providing
visual feedback during lengthy import operations and allows
users to cancel if needed.

Tested with batches of 100+ files across different formats.
Performance impact is minimal (<5% overhead).

Closes #234
Refs #189
```

### Bug 修复示例

```
fix(eagle): resolve WebSocket connection timeout on Windows

Fix connection timeout issues that occurred specifically on
Windows systems when establishing WebSocket connections.

Changes:
- Increase default connection timeout from 5s to 15s
- Add retry mechanism with exponential backoff
- Improve error handling for network-related failures
- Add platform-specific timeout configurations

Root cause: Windows firewall was causing delays in
connection establishment, leading to premature timeouts.

Tested on Windows 10 and Windows 11 with various
firewall configurations.

Fixes #456
```

### 重构示例

```
refactor(comm): extract message validation into separate module

Extract WebSocket message validation logic into a dedicated
validation module to improve code organization and reusability.

Changes:
- Create MessageValidator class with comprehensive validation
- Move validation logic from WebSocketServer to MessageValidator
- Add unit tests for validation functions
- Update error messages to be more descriptive
- Improve type checking for message properties

This refactoring makes the validation logic more testable
and reusable across different parts of the application.

No functional changes - all existing behavior is preserved.
```

## 工具和自动化

### Git Hooks

#### commit-msg Hook
创建 `.git/hooks/commit-msg` 文件来验证提交消息格式：

```bash
#!/bin/sh
# 验证提交消息格式

commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo "Format: <type>(<scope>): <subject>"
    echo "Example: feat(ae): add file import dialog"
    exit 1
fi
```

#### pre-commit Hook
创建 `.git/hooks/pre-commit` 文件来运行代码检查：

```bash
#!/bin/sh
# 运行代码检查

# 运行 ESLint
npm run lint
if [ $? -ne 0 ]; then
    echo "ESLint failed. Please fix the issues before committing."
    exit 1
fi

# 运行测试
npm run test
if [ $? -ne 0 ]; then
    echo "Tests failed. Please fix the issues before committing."
    exit 1
fi
```

### 提交模板

创建 `.gitmessage` 文件作为提交消息模板：

```
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>

# Type 类型:
#   feat:     新功能
#   fix:      Bug 修复
#   docs:     文档更新
#   style:    代码格式
#   refactor: 代码重构
#   perf:     性能优化
#   test:     测试相关
#   chore:    构建和工具
#
# Scope 范围:
#   ae:       After Effects CEP 扩展
#   eagle:    Eagle 插件
#   comm:     通信协议
#   ui:       用户界面
#   api:      API 接口
#   config:   配置管理
#   deps:     依赖管理
#   build:    构建系统
#   ci:       持续集成
#
# Subject 主题:
#   - 使用祈使句，首字母小写
#   - 不超过 50 个字符
#   - 结尾不加句号
#
# Body 正文:
#   - 详细说明修改内容
#   - 每行不超过 72 个字符
#   - 可以包含多个段落
#
# Footer 脚注:
#   - 关联 Issue: Closes #123
#   - Breaking Changes: BREAKING CHANGE: ...
#   - 共同作者: Co-authored-by: Name <email>
```

配置 Git 使用模板：

```bash
git config commit.template .gitmessage
```

### 自动化工具

#### Commitizen
安装和配置 Commitizen 来辅助编写提交消息：

```bash
# 安装 Commitizen
npm install -g commitizen
npm install -g cz-conventional-changelog

# 配置项目
echo '{"path": "cz-conventional-changelog"}' > ~/.czrc

# 使用 Commitizen 提交
git cz
```

#### Conventional Changelog
自动生成更新日志：

```bash
# 安装工具
npm install -g conventional-changelog-cli

# 生成 CHANGELOG.md
conventional-changelog -p angular -i CHANGELOG.md -s
```

## 分支管理规范

### 分支命名

```bash
# 功能分支
feature/ae-import-dialog
feature/eagle-service-mode
feature/websocket-compression

# 修复分支
fix/ae-path-encoding
fix/eagle-connection-timeout
fix/comm-message-validation

# 发布分支
release/v1.2.0
release/v1.2.1

# 热修复分支
hotfix/critical-security-fix
hotfix/data-loss-prevention
```

### 合并策略

#### Feature 分支合并
```bash
# 使用 squash merge 保持历史清洁
git checkout main
git merge --squash feature/ae-import-dialog
git commit -m "feat(ae): add file import dialog with progress tracking"
```

#### Release 分支合并
```bash
# 使用 merge commit 保留分支历史
git checkout main
git merge --no-ff release/v1.2.0
git tag v1.2.0
```

## 最佳实践

### 提交频率

1. **小而频繁**: 每个提交只包含一个逻辑变更
2. **功能完整**: 每个提交都应该是可工作的状态
3. **及时提交**: 完成一个小功能就提交，不要积累太多变更

### 提交内容

1. **原子性**: 每个提交只做一件事
2. **相关性**: 相关的变更放在同一个提交中
3. **完整性**: 包含所有必要的文件变更
4. **测试**: 确保提交不会破坏现有功能

### 消息质量

1. **清晰性**: 消息要清楚地说明做了什么
2. **准确性**: 消息要准确反映实际的变更
3. **一致性**: 遵循统一的格式和风格
4. **有用性**: 为未来的维护者提供有用信息

### 代码审查

1. **提交前检查**: 确保代码质量和测试通过
2. **消息审查**: 检查提交消息是否符合规范
3. **变更范围**: 确认变更范围与消息描述一致
4. **文档更新**: 必要时更新相关文档

## 常见问题

### Q: 如何处理多个相关的小修改？
A: 如果修改逻辑相关且很小，可以合并到一个提交中。如果修改较大或逻辑不同，应该分别提交。

### Q: 忘记添加文件到提交中怎么办？
A: 使用 `git commit --amend` 来修改最后一次提交，但只能在未推送到远程仓库之前使用。

### Q: 提交消息写错了怎么办？
A: 使用 `git commit --amend -m "new message"` 来修改最后一次提交的消息。

### Q: 需要回滚某个提交怎么办？
A: 使用 `git revert <commit-hash>` 来创建一个新的回滚提交，而不是直接删除历史。

### Q: 如何处理 Breaking Changes？
A: 在提交消息的 Footer 中明确标注 `BREAKING CHANGE:`，并详细说明影响和迁移方法。

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始提交规范文档 | 开发团队 |

---

**相关文档**:
- [开发工作流程](./development-workflow.md)
- [代码审查指南](../AE/standards/coding-standards.md)
- [版本管理策略](../shared/system-overview.md)