# Eagle2Ae 项目开发规范

## Rule 01: 项目结构规范

### 1.1 双插件架构
Eagle2Ae 采用双插件架构，所有文件和目录的创建都必须遵循此结构：

- **`Eagle2Ae-Ae/`**: **After Effects CEP扩展**
    - **`js/`**: JavaScript 核心逻辑
        - **`services/`**: 服务层，处理通信和业务逻辑
        - **`utils/`**: 工具函数和辅助类
        - **`constants/`**: 常量定义
    - **`jsx/`**: ExtendScript 脚本文件
    - **`CSXS/`**: CEP扩展配置
    - **`public/`**: 静态资源文件

- **`Eagle2Ae-Eagle/`**: **Eagle插件**
    - **`js/`**: JavaScript 核心逻辑
        - **`clipboard/`**: 剪贴板操作相关
        - **`database/`**: 数据库操作相关
        - **`utils/`**: 工具函数和辅助类
    - **`manifest.json`**: Eagle插件配置文件
    - **`package.json`**: Node.js依赖管理

- **`docs/`**: 项目文档区
    - **`AE/`**: CEP扩展相关文档
    - **`EAGLE/`**: Eagle插件相关文档
    - **`shared/`**: 共享文档

- **`doc/`**: 历史文档（保持现有结构）

### 1.2 文件命名规范
- JavaScript文件使用 kebab-case：`websocket-client.js`
- JSX文件使用 kebab-case：`dialog-warning.jsx`
- 配置文件使用标准名称：`manifest.json`, `package.json`
- 文档文件使用 kebab-case：`api-reference.md`

## Rule 02: 编码原则

### 2.1 关注点分离
- **CEP扩展 vs Eagle插件**: 两个插件的代码必须完全独立，不能直接引用对方的代码
- **前端 vs 后端**: CEP扩展的UI逻辑（HTML/CSS/JS）与ExtendScript逻辑（JSX）分离
- **通信 vs 业务**: 通信协议处理与具体业务逻辑分离

### 2.2 代码复用策略
- **工具函数复用**: 相似的工具函数可以在两个插件间复制并适配
- **协议标准化**: 通信协议必须标准化，确保两端兼容
- **配置统一**: 相同的配置项在两个插件中保持一致

### 2.3 类型安全
- **JSDoc注释**: 所有JavaScript函数必须包含JSDoc类型注释
- **参数验证**: 关键函数必须进行参数类型和有效性验证
- **错误处理**: 所有异步操作必须包含错误处理机制

### 2.4 平台特定代码
- **CEP API**: Adobe CEP相关代码只能出现在 `Eagle2Ae-Ae/` 中
- **Eagle API**: Eagle插件API只能出现在 `Eagle2Ae-Eagle/` 中
- **Node.js模块**: Node.js特定模块只能在Eagle插件中使用

## Rule 03: 通信协议规范

### 3.1 WebSocket通信
- **端口管理**: 使用动态端口分配，避免端口冲突
- **消息格式**: 统一使用JSON格式，包含type、data、timestamp字段
- **错误处理**: 连接断开时自动重连，最大重试次数为5次
- **心跳机制**: 每30秒发送一次心跳包

### 3.2 HTTP通信
- **RESTful设计**: 遵循RESTful API设计原则
- **状态码**: 正确使用HTTP状态码表示操作结果
- **超时设置**: 请求超时时间设置为10秒
- **重试机制**: 失败请求自动重试，最大重试次数为3次

### 3.3 数据传输
- **文件路径**: 使用绝对路径，确保跨平台兼容性
- **编码格式**: 统一使用UTF-8编码
- **数据压缩**: 大数据传输时使用gzip压缩

## Rule 04: 日志和调试规范

### 4.1 日志级别
- **ERROR**: 系统错误，影响功能正常运行
- **WARN**: 警告信息，可能影响性能或用户体验
- **INFO**: 重要操作信息，如连接建立、文件传输
- **DEBUG**: 调试信息，仅在开发模式下输出

### 4.2 日志格式
```javascript
// 标准日志格式
[TIMESTAMP] [LEVEL] [COMPONENT] MESSAGE
// 示例
[2024-01-01 12:00:00] [INFO] [WebSocket] Connection established
```

### 4.3 调试工具
- **CEP扩展**: 使用Chrome DevTools进行调试
- **Eagle插件**: 使用console.log和文件日志
- **通信调试**: 记录所有消息的发送和接收

## Rule 05: 提交和文档规范

### 5.1 Git提交规范
遵循 **Conventional Commits** 规范：

**格式**: `<type>(<scope>): <subject>`

- **`<type>`**: 提交类型
    - `feat`: 新增功能
    - `fix`: 修复Bug
    - `docs`: 文档更新
    - `style`: 代码格式修改
    - `refactor`: 代码重构
    - `perf`: 性能优化
    - `test`: 测试相关
    - `chore`: 构建工具、依赖更新

- **`<scope>`**: 影响范围
    - `ae`: CEP扩展相关
    - `eagle`: Eagle插件相关
    - `comm`: 通信协议相关
    - `docs`: 文档相关
    - `config`: 配置相关

**示例**:
- `feat(ae): add file import dialog`
- `fix(eagle): resolve websocket connection issue`
- `docs(api): update communication protocol`

### 5.2 文档更新规范
- **代码变更**: 任何影响API或用户界面的变更都必须更新相应文档
- **架构变更**: 重大架构变更必须在 `docs/architecture/` 中记录
- **配置变更**: 配置项变更必须更新安装和配置文档

## Rule 06: 测试和质量保证

### 6.1 测试策略
- **单元测试**: 核心工具函数必须包含单元测试
- **集成测试**: 通信协议必须进行端到端测试
- **手动测试**: 每次发布前进行完整的手动测试流程

### 6.2 代码质量
- **代码审查**: 所有代码变更必须经过代码审查
- **性能监控**: 关键操作必须包含性能监控
- **内存管理**: 避免内存泄漏，及时清理资源

### 6.3 兼容性要求
- **After Effects**: 支持CC 2018及以上版本
- **Eagle**: 支持3.0及以上版本
- **操作系统**: 支持Windows 10+和macOS 10.14+

## Rule 07: 安全规范

### 7.1 数据安全
- **文件访问**: 仅访问用户明确授权的文件
- **网络通信**: 使用本地通信，避免外部网络请求
- **权限控制**: 最小权限原则，仅申请必要的系统权限

### 7.2 错误处理
- **敏感信息**: 错误信息中不包含敏感的系统信息
- **异常捕获**: 所有可能的异常都必须被捕获和处理
- **用户反馈**: 向用户提供友好的错误提示信息