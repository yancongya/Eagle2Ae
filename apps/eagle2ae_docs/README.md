# Eagle2Ae 文档中心

欢迎来到 Eagle2Ae 文档中心！这里是 Eagle2Ae 项目的综合文档站点，包含了关于 AE 扩展和 Eagle 插件的详细信息、使用指南和 API 参考。

## 📚 文档结构

### [AE 扩展文档](./ae/)
面向 After Effects 用户和开发者的完整文档，包含使用指南、API 参考和开发手册。

**核心内容**:
- [使用手册](./ae/使用手册/) - 面向最终用户的完整操作指南
- [API 参考](./ae/api/) - 面向开发者的完整API文档
- [开发手册](./ae/development/) - 面向开发者的开发指南
- [功能文档](./ae/features/) - 功能实现说明和最佳实践
- [面板功能](./ae/panel-functions/) - 面板功能模块详细说明
- [故障排除](./ae/troubleshooting/) - 常见问题和解决方案
- [性能优化](./ae/performance/) - 性能优化指南和最佳实践
- [架构文档](./ae/architecture/) - 系统架构设计说明
- [标准文档](./ae/standards/) - 项目开发标准和规范

### [Eagle 插件文档](./eagle/)
面向 Eagle 用户和开发者的完整文档，包含使用指南、API 参考和开发手册。

**核心内容**:
- [使用手册](./eagle/使用手册/) - 面向最终用户的完整操作指南
- [API 参考](./eagle/api/) - 面向开发者的完整API文档
- [开发手册](./eagle/development/) - 面向开发者的开发指南
- [架构文档](./eagle/architecture/) - 系统架构设计说明
- [标准文档](./eagle/standards/) - 项目开发标准和规范

### [通用指南](./shared/)
适用于所有组件的通用信息、规范和最佳实践。

**核心内容**:
- [提交规范](./shared/commit-conventions.md) - 代码提交规范和约定
- [通信协议](./shared/communication-protocol.md) - 组件间通信协议说明
- [开发指南](./shared/development-guidelines.md) - 通用开发指南和最佳实践
- [系统概览](./shared/system-overview.md) - 项目整体架构和组件关系

## 🚀 Eagle2Ae 核心功能

### After Effects 扩展功能
Eagle2Ae AE 扩展致力于提升 After Effects 与 Eagle 素材管理工具之间的工作流效率，提供以下核心功能：

#### 导入功能
- **拖拽导入增强**: 支持从桌面或文件夹直接拖拽文件到扩展面板
- **剪贴板导入优化**: 从剪贴板粘贴图片到扩展面板
- **Eagle 导入**: 从 Eagle 素材库拖拽素材到扩展面板
- **文件夹拖拽支持**: 直接拖拽整个文件夹到扩展面板
- **序列帧自动检测**: 能够识别图片序列并将其作为单个序列导入
- **项目内文件检测**: 防止重复导入已在项目中的文件

#### 导出功能
- **图层检测**: 检测当前AE项目中的图层
- **图层导出**: 将选中的图层导出为图片
- **导出到Eagle**: 将导出的图片自动归档到Eagle素材库
- **批量图层导出**: 支持一次性导出多个图层

#### 设置管理
- **多面板支持**: 支持同时打开多个扩展面板实例
- **UI 控制系统**: 支持主题切换、语言切换、组件显示控制
- **预设管理系统**: 每个面板独立的预设文件管理
- **设置管理系统**: 高级设置管理，支持字段监听和自动保存

#### 状态监控
- **项目状态检测器**: 全面的项目状态检测系统
- **连接监控器**: 实时监控AE和Eagle连接状态
- **性能监控**: 监控扩展性能和资源使用情况

### Eagle 插件功能
Eagle2Ae Eagle 插件负责与AE扩展建立和维护稳定的通信连接，提供以下核心功能：

#### 通信功能
- **WebSocket 服务器**: 提供实时双向通信能力
- **HTTP 服务器**: 提供RESTful API接口
- **端口发现**: 自动发现和匹配通信端口
- **连接监控**: 实时监控连接状态和质量

#### 数据管理
- **数据库管理**: 管理Eagle素材库和资源
- **函数映射**: 将Eagle API映射到插件内部函数
- **插件系统**: 模块化的插件架构设计

#### 插件功能
- **插件组件**: 提供可复用的插件组件
- **事件系统**: 统一的事件处理机制
- **错误处理**: 完善的错误处理和恢复机制

## 🎯 v2.4.0 版本重大更新

### 多面板支持
- 支持同时打开多个扩展面板实例
- 每个面板拥有独立的预设文件
- 面板间配置互不干扰，可进行个性化设置

### UI 控制系统
- **主题切换**: 支持暗色和亮色模式
- **语言切换**: 支持中英文动态切换
- **组件显示控制**: 可控制主面板各组件的显示/隐藏
- **独显模式**: 提供沉浸式的操作体验

### 拖拽导入增强
- **文件夹拖拽支持**: 直接拖拽整个文件夹到扩展面板
- **序列帧自动检测**: 能够识别图片序列并将其作为单个序列导入
- **项目内文件检测**: 防止重复导入已在项目中的文件
- **增强的视觉反馈**: 提供实时状态提示

### 剪贴板导入优化
- **剪贴板图片自动检测**: 自动识别剪贴板中的图片内容
- **临时文件智能重命名**: 避免使用通用名称如"clipboard_image.png"
- **优化的确认对话框**: 提供更好的用户体验

### 项目状态检测器
- **环境检测**: 检测运行环境和AE版本
- **AE连接检测**: 验证与After Effects的连接状态
- **项目状态检测**: 检查项目是否已打开和保存
- **合成状态检测**: 验证活动合成的存在和状态
- **Eagle连接检测**: 检查与Eagle插件的连接状态

### 虚拟对话框系统
- **演示模式支持**: 为演示模式提供虚拟的对话框体验
- **智能用户行为模拟**: 根据上下文模拟用户选择
- **自定义模板**: 支持自定义对话框模板

### 预设管理系统
- **面板特定预设**: 每个面板实例拥有独立的预设文件
- **预设文件管理**: 支持预设文件的导出和导入
- **自动保存**: 配置变更时自动保存到预设文件

### 设置管理系统
- **字段监听**: 支持对特定设置字段的变更监听
- **自动保存**: 配置变更时自动保存
- **类型验证**: 支持设置值的类型验证
- **版本兼容性**: 支持设置格式的向前和向后兼容

## 🛠️ 技术架构

### 系统组件
```
                    ┌─────────────────────┐
                    │   用户界面 (UI)     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   业务逻辑层        │
                    │  (JavaScript/HTML)  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   通信层 (WebSocket)│
                    │     和 (HTTP)       │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  AE 扩展 (CEP)  │  │ Eagle 插件 (Electron)│ │   配置管理器    │
│ (ExtendScript)  │  │  (Node.js)      │  │ (localStorage)  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

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

## 📖 学习路径

### 新手入门
1. **AE 扩展用户**
   - 阅读 [AE 扩展快速入门指南](./ae/使用手册/1-quick-start-guide.md)
   - 学习 [AE 扩展界面概览与核心设置](./ae/使用手册/2-interface-overview-settings.md)
   - 尝试 [AE 扩展处理导入的各类素材](./ae/使用手册/3-handling-imported-assets.md)

2. **Eagle 插件用户**
   - 阅读 [Eagle 插件快速入门指南](./eagle/使用手册/1-quick-start-guide.md)
   - 学习 [Eagle 插件界面概览与核心设置](./eagle/使用手册/2-interface-overview-settings.md)
   - 了解 [Eagle 插件常见问题与解答](./eagle/使用手册/3-faq.md)

### 进阶学习
1. **AE 扩展进阶**
   - 探索 [AE 扩展高级设置与预设管理](./ae/使用手册/5-advanced-settings-preset-management.md)
   - 学习 [AE 扩展多面板支持](./ae/使用手册/7-multi-panel-support.md)
   - 掌握 [AE 扩展UI 控制系统](./ae/使用手册/8-ui-control-system.md)

2. **Eagle 插件进阶**
   - 深入了解 [Eagle 插件API 参考](./eagle/api/)
   - 学习 [Eagle 插件开发手册](./eagle/development/)
   - 掌握 [Eagle 插件架构](./eagle/architecture/)

### 开发者指南
1. **AE 扩展开发**
   - 阅读 [AE 扩展API 参考](./ae/api/)
   - 学习 [AE 扩展开发手册](./ae/development/)
   - 理解 [AE 扩展架构](./ae/architecture/)

2. **Eagle 插件开发**
   - 阅读 [Eagle 插件API 参考](./eagle/api/)
   - 学习 [Eagle 插件开发手册](./eagle/development/)
   - 理解 [Eagle 插件架构](./eagle/architecture/)

3. **通用开发**
   - 遵循 [通用提交规范](./shared/commit-conventions.md)
   - 理解 [通用通信协议](./shared/communication-protocol.md)
   - 遵守 [通用开发指南](./shared/development-guidelines.md)

## 🎯 最佳实践

### 使用建议
1. **高效工作流**
   - 合理使用多面板支持并行为不同项目工作
   - 利用UI控制系统自定义界面布局
   - 结合拖拽导入和剪贴板导入提高工作效率

2. **配置管理**
   - 定期备份预设文件以防丢失
   - 为不同项目创建专门的预设模板
   - 使用有意义的预设文件名便于识别

3. **项目组织**
   - 保持良好的文件夹结构便于素材管理
   - 合理使用标签和分类功能
   - 定期清理不需要的临时文件

### 开发建议
1. **代码质量**
   - 遵循项目编码标准确保代码一致性
   - 编写全面的单元测试保证代码质量
   - 实施代码审查流程提高代码质量

2. **性能优化**
   - 合理使用缓存机制避免重复计算
   - 优化文件处理流程提高导入速度
   - 实施防抖处理避免频繁操作

3. **错误处理**
   - 实施统一的错误处理策略
   - 提供用户友好的错误信息
   - 记录详细的错误日志便于调试

## 🐛 故障排除

### 常见问题
1. **连接问题**
   - 检查AE扩展和Eagle插件是否都已正确安装
   - 验证通信端口设置是否正确
   - 检查防火墙和安全软件设置

2. **导入失败**
   - 检查文件路径和权限
   - 验证AE项目状态
   - 确认素材格式支持

3. **性能问题**
   - 检查系统资源使用情况
   - 优化文件处理流程
   - 合理使用缓存机制

### 调试技巧
1. **启用详细日志**
   ```javascript
   // 在控制台中启用详细日志
   localStorage.setItem('debugLogLevel', '0');
   ```

2. **监控性能**
   ```javascript
   // 使用性能监控API
   performance.mark('operation-start');
   
   // 执行操作...
   
   performance.mark('operation-end');
   performance.measure('operation-duration', 'operation-start', 'operation-end');
   
   const measure = performance.getEntriesByName('operation-duration')[0];
   console.log(`操作耗时: ${measure.duration}ms`);
   ```

3. **检查连接状态**
   ```javascript
   // 检查WebSocket连接
   if (ws && ws.readyState === WebSocket.OPEN) {
       console.log('WebSocket连接正常');
   } else {
       console.log('WebSocket连接异常');
   }
   
   // 检查HTTP连接
   fetch('http://localhost:8080/ping')
       .then(response => {
           if (response.ok) {
               console.log('HTTP连接正常');
           } else {
               console.log('HTTP连接异常');
           }
       })
       .catch(error => {
           console.log('HTTP连接失败:', error);
       });
   ```

## 📈 性能指标

### 系统性能
- **启动时间**: ≤ 3秒
- **导入速度**: ≤ 100ms/文件
- **导出速度**: ≤ 200ms/图层
- **连接延迟**: ≤ 50ms
- **内存使用**: ≤ 100MB
- **CPU使用率**: ≤ 5%

### 用户体验
- **响应时间**: ≤ 100ms
- **导入成功率**: ≥ 99%
- **导出成功率**: ≥ 99%
- **用户满意度**: ≥ 4.5/5.0
- **错误恢复时间**: ≤ 5秒

## 📚 相关资源

### 在线文档
- **官方网站**: [eagle2ae.com](https://eagle2ae.com)
- **GitHub 仓库**: [github.com/eagle2ae/eagle2ae](https://github.com/eagle2ae/eagle2ae)
- **在线文档**: [docs.eagle2ae.com](https://docs.eagle2ae.com)

### 社区支持
- **GitHub Issues**: 提交问题和建议
- **用户论坛**: 交流使用经验和技巧
- **官方QQ群**: 789456123
- **官方微信群**: 扫描官网二维码加入

### 技术支持
- **邮箱**: support@eagle2ae.com
- **电话**: 400-123-4567
- **在线客服**: 工作日 9:00-18:00

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为 Eagle2Ae 项目做出贡献的开发者和用户！

特别感谢：
- Adobe After Effects 团队提供的 CEP 扩展平台
- Eagle 团队提供的插件开发支持
- 所有参与测试和提供反馈的用户
- 开源社区提供的各种工具和库

---

**© 2025 Eagle2Ae** - 连接 Eagle 与 After Effects 的桥梁

[开始使用 AE 扩展](./ae/使用手册/1-quick-start-guide.md) • [开始使用 Eagle 插件](./eagle/使用手册/1-quick-start-guide.md) • [查看更新日志](./ae/CHANGELOG.md)