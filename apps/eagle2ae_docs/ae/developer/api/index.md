# AE 扩展 - API 参考

欢迎查阅 Eagle2Ae AE 扩展的 API 参考文档。本部分提供了扩展中所有公开接口的详细说明，包括前端 JavaScript API、ExtendScript API 和通信接口。

## 📚 API 文档目录

### 前端 JavaScript API
- **[前端 JS API](./frontend-js-api.md)** - 前端JavaScript API详细说明
- **[智能对话框系统](./dialog-system.md)** - 对话框系统的完整API参考
- **[虚拟弹窗系统](./virtual-dialog-system.md)** - 演示模式下的虚拟弹窗实现
- **[状态监控器](./status-monitor.md)** - 状态监控器的API说明
- **[批量状态检测器](./batch-status-checker.md)** - 批量状态检测的实现细节
- **[轮询管理器](./polling-manager.md)** - 轮询机制的管理API
- **[连接监控器](./connection-monitor.md)** - 连接状态监控的详细说明
- **[错误处理系统](./error-handling.md)** - 错误处理机制的API参考
- **[事件系统](./event-system.md)** - 事件处理系统的完整说明
- **[配置管理系统](./config-management.md)** - 配置管理的实现细节
- **[日志系统增强](./logging-enhancements.md)** - 日志系统的增强功能说明
- **[性能监控](./performance-monitoring.md)** - 性能监控的API参考
- **[音效播放器](./sound-player.md)** - 音效播放器的API说明
- **[端口发现服务](./port-discovery.md)** - 端口发现服务的API参考

### ExtendScript API
- **[ExtendScript 脚本](./jsx-scripts.md)** - ExtendScript 脚本的API说明
- **[函数映射](./function-mapping.md)** - 函数映射的实现细节
- **[通信API](./communication-api.md)** - 与前端通信的API接口

### UI 组件
- UI 组件的API说明请参考 [开发指南 - CSS样式](../development/)

## 🚀 核心 API 概览

### 主应用类 (AEExtension)
扩展的核心类，负责管理所有功能模块和服务。

#### 构造函数
```javascript
/**
 * AE扩展主类构造函数
 * 负责初始化所有核心组件和服务
 */
class AEExtension {
    constructor()
```

#### 核心属性
- `csInterface`: CSInterface实例，用于与ExtendScript通信
- `connectionState`: 当前连接状态 (ConnectionState枚举)
- `pollingManager`: HTTP轮询管理器实例
- `connectionMonitor`: 连接质量监控器实例
- `logManager`: 日志管理器实例
- `settingsManager`: 设置管理器实例
- `fileHandler`: 文件处理器实例
- `soundPlayer`: 音效播放器实例
- `projectStatusChecker`: 项目状态检测器实例 (v2.4.0新增)

### 项目状态检测器 (ProjectStatusChecker) v2.4.0新增
负责检测After Effects项目状态、Eagle连接状态等，确保操作的可行性和安全性。

#### 核心方法
- `checkEnvironment()`: 检测运行环境
- `checkAEConnection()`: 检测AE连接状态
- `checkProjectState()`: 检测项目状态
- `checkCompositionState()`: 检测合成状态
- `checkEagleConnection()`: 检测Eagle连接状态
- `validateProjectStatus()`: 验证项目状态是否满足要求
- `batchCheck()`: 批量执行状态检查

### 虚拟对话框系统 (VirtualDialogSystem) v2.4.0新增
为演示模式提供虚拟的对话框体验，模拟真实的用户交互。

#### 核心方法
- `showDialog()`: 显示虚拟对话框
- `closeDialog()`: 关闭虚拟对话框
- `registerTemplate()`: 注册自定义对话框模板
- `simulateUserChoice()`: 模拟用户选择

### 预设管理系统 (PresetManager) v2.4.0新增
管理每个面板实例的预设文件，支持导出导入和备份恢复。

#### 核心方法
- `savePresets()`: 保存预设到文件
- `loadPresets()`: 从文件加载预设
- `exportPresets()`: 导出预设文件
- `importPresets()`: 导入预设文件
- `backupPresets()`: 备份预设文件
- `restorePresets()`: 恢复预设文件

### 设置管理系统 (SettingsManager) v2.4.0新增
管理面板特定的设置，支持字段监听和自动保存。

#### 核心方法
- `getSettings()`: 获取当前设置
- `updateField()`: 更新特定字段
- `saveSettings()`: 保存设置
- `loadSettings()`: 加载设置
- `addFieldListener()`: 添加字段监听器
- `removeFieldListener()`: 移除字段监听器

## 🛠️ 技术实现

### 通信机制
扩展使用多种通信机制确保前后端协调工作：

1. **HTTP 轮询** - 主要通信方式，通过定期轮询获取状态更新
2. **ExtendScript 调用** - 与 After Effects 脚本的直接通信
3. **事件系统** - 内部模块间的消息传递

### 状态管理
- **连接状态** - 管理与 Eagle 插件的连接状态
- **项目状态** - 监控 AE 项目的变化
- **UI 状态** - 管理界面元素的显示状态
- **设置状态** - 管理用户配置和偏好

### 错误处理
- **统一错误处理** - 集中的错误捕获和处理机制
- **日志记录** - 详细的错误日志记录
- **用户提示** - 友好的错误提示和解决方案
- **恢复机制** - 自动恢复和降级处理

## 📖 使用指南

### API 调用示例

#### 检查项目状态
```javascript
// 创建项目状态检测器实例
const projectStatusChecker = new ProjectStatusChecker();

// 执行项目状态检查
const projectStatus = await projectStatusChecker.checkProjectState();

if (projectStatus.hasProject) {
    console.log(`✅ 项目已打开: ${projectStatus.projectName}`);
} else {
    console.log('❌ 未打开任何项目');
}
```

#### 显示虚拟对话框
```javascript
// 创建虚拟对话框系统实例
const virtualDialogSystem = new VirtualDialogSystem();

// 显示确认对话框
const userChoice = await virtualDialogSystem.showDialog({
    type: 'confirm',
    title: '确认操作',
    message: '您确定要执行此操作吗？',
    buttons: ['确定', '取消']
});

if (userChoice === '确定') {
    console.log('用户确认了操作');
}
```

#### 管理预设文件
```javascript
// 创建预设管理器实例
const presetManager = new PresetManager();

// 保存当前设置到预设文件
const saveResult = await presetManager.savePresets(currentSettings);

if (saveResult.success) {
    console.log('✅ 预设已保存');
} else {
    console.log(`❌ 保存预设失败: ${saveResult.error}`);
}
```

#### 更新设置字段
```javascript
// 创建设置管理器实例
const settingsManager = new SettingsManager();

// 更新特定字段
const updateResult = settingsManager.updateField('importMode', 'project_adjacent');

if (updateResult.success) {
    console.log('✅ 设置已更新');
} else {
    console.log(`❌ 更新设置失败: ${updateResult.error}`);
}
```

## 🎯 最佳实践

### API 使用建议

1. **合理使用缓存** - 对于频繁调用的API，利用缓存机制提高性能
2. **错误处理** - 始终处理API调用可能出现的错误
3. **异步操作** - 使用async/await处理异步API调用
4. **状态检查** - 在执行关键操作前检查相关状态

### 性能优化

1. **批量操作** - 对于多个相关操作，使用批量处理减少通信开销
2. **防抖处理** - 对于高频操作，使用防抖机制避免性能问题
3. **内存管理** - 及时清理不再需要的监听器和定时器
4. **资源释放** - 在适当时候释放占用的资源

### 安全考虑

1. **输入验证** - 验证所有输入参数的有效性
2. **权限检查** - 在执行敏感操作前检查权限
3. **错误日志** - 记录详细的错误信息便于调试
4. **降级处理** - 在API调用失败时提供降级方案

## 🐛 故障排除

### 常见问题

1. **API 调用无响应**
   - 检查网络连接状态
   - 验证API端点是否正确
   - 查看控制台错误日志

2. **状态检测不准确**
   - 确认AE项目状态
   - 检查Eagle连接状态
   - 验证设置配置

3. **虚拟对话框显示异常**
   - 检查DOM元素是否存在
   - 验证CSS样式是否正确应用
   - 确认事件监听器是否绑定

### 调试技巧

1. **启用详细日志**
   ```javascript
   // 在控制台中设置日志级别
   localStorage.setItem('debugLogLevel', '0');
   ```

2. **监控API调用**
   ```javascript
   // 使用性能监控API
   const startTime = performance.now();
   const result = await apiCall();
   const endTime = performance.now();
   console.log(`API调用耗时: ${endTime - startTime}ms`);
   ```

3. **检查缓存状态**
   ```javascript
   // 查看缓存信息
   const cacheInfo = presetManager.getCacheInfo();
   console.log('缓存统计:', cacheInfo);
   ```

---
**请使用左侧导航栏浏览各个API文档，获取详细信息。**