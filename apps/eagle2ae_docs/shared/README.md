# 通用指南

欢迎来到 Eagle2Ae 项目的通用指南中心！这里包含了适用于所有组件的通用信息、规范和最佳实践。

## 📚 文档结构概览

### [提交规范](./commit-conventions.md)
项目代码提交的规范和约定，确保代码历史清晰和可追溯。

**核心内容**:
- 提交类型定义（feat、fix、docs、style、refactor、test、chore等）
- 提交消息格式规范
- 分支命名约定
- 版本发布流程

### [通信协议](./communication-protocol.md)
项目各组件间通信协议的详细说明，包括WebSocket和HTTP通信规范。

**核心内容**:
- 消息格式定义
- 通信端点说明
- 错误处理机制
- 安全认证机制
- 数据传输规范

### [开发指南](./development-guidelines.md)
通用开发指南和最佳实践，适用于所有组件的开发工作。

**核心内容**:
- 开发环境搭建
- 代码规范和风格指南
- 测试策略和质量保证
- 性能优化建议
- 安全性考虑
- 文档编写规范

### [系统概览](./system-overview.md)
项目整体系统架构和组件关系的概览，帮助理解项目结构。

**核心内容**:
- 系统架构图
- 组件关系说明
- 数据流向分析
- 技术栈介绍
- 部署架构说明

## 🚀 项目概述

### 系统架构
Eagle2Ae 项目采用模块化微服务架构，主要包含以下核心组件：

1. **AE 扩展** - After Effects CEP 扩展，负责与AE交互
2. **Eagle 插件** - Eagle 应用插件，负责与Eagle交互
3. **通信中间件** - 负责组件间通信和数据传输
4. **配置管理器** - 统一的配置管理和同步
5. **日志系统** - 集中的日志记录和分析
6. **UI 组件库** - 共享的UI组件和样式库

### 技术栈
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, WebSocket, HTTP/HTTPS
- **AE 扩展**: CEP (Common Extensibility Platform), ExtendScript
- **Eagle 插件**: Electron, Node.js
- **构建工具**: VitePress, Webpack, Babel
- **测试框架**: Jest, Mocha, Chai
- **文档系统**: VitePress, Markdown

### 数据流向
```
用户操作 → AE 扩展 → 通信中间件 → Eagle 插件 → Eagle 应用
                  ↗
Eagle 应用 → Eagle 插件 → 通信中间件 → AE 扩展 → After Effects
```

## 📖 使用指南

### 提交规范使用
1. **遵循提交类型**
   ```bash
   # 新功能
   git commit -m "feat: 添加多面板支持功能"
   
   # 修复bug
   git commit -m "fix: 修复面板配置冲突问题"
   
   # 文档更新
   git commit -m "docs: 更新使用手册文档"
   
   # 代码样式调整
   git commit -m "style: 调整按钮样式和布局"
   
   # 代码重构
   git commit -m "refactor: 重构设置管理器"
   
   # 测试相关
   git commit -m "test: 添加多面板支持测试用例"
   
   # 构建相关
   git commit -m "chore: 更新依赖包版本"
   ```

2. **使用提交范围**
   ```bash
   # 指定具体模块
   git commit -m "feat(ae-extension): 添加多面板支持"
   git commit -m "fix(eagle-plugin): 修复WebSocket连接问题"
   git commit -m "docs(api): 更新API参考文档"
   ```

3. **添加提交描述**
   ```bash
   # 多行提交消息
   git commit -m "feat: 添加多面板支持" -m "实现了一个扩展支持多个面板实例同时打开的功能" -m "每个面板拥有独立的预设文件，支持个性化配置"
   ```

### 通信协议使用
1. **WebSocket 通信**
   ```javascript
   // 连接到WebSocket服务器
   const ws = new WebSocket('ws://localhost:8080/ws');
   
   // 发送消息
   ws.send(JSON.stringify({
       type: 'import_request',
       data: {
           files: ['file1.png', 'file2.jpg'],
           settings: { mode: 'direct' }
       }
   }));
   
   // 接收消息
   ws.onmessage = (event) => {
       const message = JSON.parse(event.data);
       switch (message.type) {
           case 'import_result':
               handleImportResult(message.data);
               break;
           case 'status_update':
               handleStatusUpdate(message.data);
               break;
           default:
               console.log('未知消息类型:', message.type);
       }
   };
   ```

2. **HTTP 通信**
   ```javascript
   // 发送HTTP请求
   fetch('http://localhost:8080/import', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({
           files: ['file1.png', 'file2.jpg'],
           settings: { mode: 'direct' }
       })
   })
   .then(response => response.json())
   .then(data => handleImportResult(data))
   .catch(error => handleError(error));
   ```

### 开发指南使用
1. **环境搭建**
   ```bash
   # 安装依赖
   npm install
   
   # 启动开发服务器
   npm run dev
   
   # 构建生产版本
   npm run build
   
   # 运行测试
   npm test
   ```

2. **代码规范**
   ```javascript
   // 使用ESLint检查代码
   npm run lint
   
   // 自动修复代码格式
   npm run lint:fix
   
   // 检查类型
   npm run type-check
   ```

3. **测试策略**
   ```bash
   # 运行单元测试
   npm run test:unit
   
   # 运行集成测试
   npm run test:integration
   
   # 运行端到端测试
   npm run test:e2e
   
   # 生成测试覆盖率报告
   npm run test:coverage
   ```

### 系统概览使用
1. **理解架构**
   - 查看系统架构图了解各组件关系
   - 阅读组件关系说明理解数据流向
   - 参考技术栈介绍选择合适的开发工具

2. **部署架构**
   - 了解各组件的部署要求
   - 配置通信中间件确保组件间正常通信
   - 设置配置管理器实现统一配置管理

## 🛠️ 最佳实践

### 代码质量
1. **编码规范**
   - 遵循项目编码标准
   - 使用ESLint进行代码检查
   - 实施代码审查流程
   - 编写清晰的注释和文档

2. **测试策略**
   - 实施TDD（测试驱动开发）
   - 编写单元测试覆盖核心逻辑
   - 实施集成测试验证组件交互
   - 运行端到端测试验证完整流程

3. **性能优化**
   - 合理使用缓存机制
   - 优化网络通信减少延迟
   - 实施防抖和节流处理
   - 监控内存使用避免泄漏

### 安全性
1. **输入验证**
   - 验证所有用户输入
   - 实施白名单和黑名单机制
   - 使用安全的序列化和反序列化
   - 防止注入攻击

2. **通信安全**
   - 使用HTTPS加密通信
   - 实施身份验证和授权机制
   - 验证消息来源和完整性
   - 处理认证失败情况

3. **数据保护**
   - 加密敏感数据
   - 实施访问控制
   - 定期备份重要数据
   - 清理过期数据

### 可维护性
1. **模块化设计**
   - 保持代码模块化
   - 实施单一职责原则
   - 使用依赖注入降低耦合
   - 提供清晰的接口定义

2. **文档编写**
   - 编写清晰的API文档
   - 提供使用示例和最佳实践
   - 更新变更日志记录重要变更
   - 维护FAQ解答常见问题

3. **版本管理**
   - 遵循语义化版本控制
   - 实施Git工作流
   - 使用标签标记重要版本
   - 提供升级指南和支持

## 📈 项目指标

### 代码质量指标
- **代码覆盖率**: ≥ 80%
- **ESLint 通过率**: 100%
- **类型检查通过率**: 100%
- **测试通过率**: 100%

### 性能指标
- **响应时间**: ≤ 100ms
- **内存使用**: ≤ 100MB
- **CPU 使用率**: ≤ 5%
- **网络延迟**: ≤ 50ms

### 用户体验指标
- **启动时间**: ≤ 3秒
- **导入成功率**: ≥ 99%
- **用户满意度**: ≥ 4.5/5.0
- **错误恢复时间**: ≤ 5秒

## 📚 相关文档

- **[AE 扩展文档](../ae/)** - After Effects 扩展的详细文档
- **[Eagle 插件文档](../eagle/)** - Eagle 插件的详细文档
- **[API 参考](../ae/api/)** - 详细的API文档
- **[开发手册](../ae/development/)** - 开发者指南

---
**请使用左侧导航栏浏览各个文档章节，获取详细信息。**