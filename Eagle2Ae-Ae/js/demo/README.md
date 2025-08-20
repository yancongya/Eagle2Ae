# Eagle2Ae 演示模式

这是 Eagle2Ae 扩展的演示模式功能，允许在没有安装 After Effects 或 Eagle 的环境中体验完整的操作流程。

## 🆕 v2.0 新功能

### 完全网络拦截
- **完全阻断通信**: 拦截所有与Eagle的网络通信（fetch、WebSocket、XMLHttpRequest）
- **静态数据展示**: 仅显示预设的演示数据，不会在演示数据和真实数据间切换
- **早期拦截**: 在页面加载早期就启用拦截，防止任何真实通信
- **智能识别**: 自动识别Eagle相关的API调用并拦截
- **静默运行**: 不显示任何演示模式相关的通知提示

## 功能特性

### 🎭 自动演示模式
- **触发条件**: 在非CEP环境（普通浏览器）中自动启用
- **功能**: 静态设置AE和Eagle信息，模拟所有交互，提供完整的演示体验
- **特性**: 立即显示演示数据，无需等待动态获取，完全拦截网络通信
- **用途**: 产品展示、功能预览、用户培训

### 🥚 彩蛋模式切换
- **触发条件**: 在CEP环境中连续点击"项目信息"标题5次
- **功能**: 手动切换演示模式和正常模式，启用完整网络拦截
- **用途**: 开发调试、功能演示

## 文件结构

```
js/demo/
├── demo-config.json           # 演示数据配置文件
├── demo-mode.js              # 主控制器（环境检测、模式切换、网络拦截管理）
├── demo-apis.js              # API模拟器（模拟AE和Eagle交互、完整API端点支持）
├── demo-network-interceptor.js # 网络拦截器（专业的网络通信拦截）
├── demo-ui.js                # UI状态管理器（静态信息更新、通知管理）
├── demo-override.js          # 数据覆盖策略（强制显示演示数据、UI保护）
├── easter-egg.js             # 彩蛋功能（点击检测、动画效果）
└── README.md                # 本文档
```

## 使用方法

### 1. 自动演示模式
1. 在普通浏览器中打开 `index.html`
2. 演示模式会自动启用，网络拦截立即生效
3. AE和Eagle信息立即显示为演示数据
4. 所有网络通信被拦截，返回模拟响应
5. UI数据受到保护，不会被真实数据覆盖
6. 无任何通知提示，静默运行

### 2. 彩蛋模式切换（CEP环境）
1. 在After Effects中打开扩展
2. 连续快速点击"项目信息"标题5次
3. 看到彩虹动画效果后，演示模式启用
4. 网络拦截自动激活，UI数据受到保护
5. 再次连续点击5次可切换回正常模式

## 配置说明

### demo-config.json 配置项

```json
{
  "easterEgg": {
    "enabled": true,           // 是否启用彩蛋功能
    "clickThreshold": 5,       // 触发点击次数
    "timeWindow": 3000         // 时间窗口（毫秒）
  },
  "demoData": {
    "ae": {                    // AE模拟数据
      "version": "2024 (24.0.0)",
      "projectName": "演示项目",
      // ...
    },
    "eagle": {                 // Eagle模拟数据
      "version": "4.0+",
      "path": "/Applications/Eagle.app",
      "libraryPath": "/Users/Demo/Eagle Library",
      "selectedFolder": "AE素材"
      // ...
    },
    "ui": {
      "notifications": {
        "showToasts": false    // 禁用通知显示
      }
    },
    "operations": {            // 操作模拟设置
      "importDelay": 1500,     // 导入延迟（毫秒）
      "successRate": 0.95      // 成功率
    }
  }
}
```

## 技术实现

### 网络拦截机制
演示模式采用完全的网络拦截策略，确保数据隔离：

```javascript
// 拦截fetch请求
window.fetch = async (url, options) => {
  if (isEagleAPI(url)) {
    return mockResponse(url, options);
  }
  return originalFetch(url, options);
};

// 拦截WebSocket连接
window.WebSocket = function(url) {
  if (isEagleWebSocket(url)) {
    return createMockWebSocket(url);
  }
  return new OriginalWebSocket(url);
};
```

### 拦截范围
- ✅ **HTTP请求**: fetch()、XMLHttpRequest
- ✅ **WebSocket连接**: 所有WebSocket通信
- ✅ **Eagle API端点**: /ping、/messages、/ae-message等
- ✅ **方法调用**: updateEagleUI()、updateEagleStatusFromServer()等

### UI保护机制
```javascript
// DOM监控和保护
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (isEagleElement(mutation.target)) {
      // 立即恢复演示数据
      restoreDemoData(mutation.target);
    }
  });
});
```

### 环境检测
```javascript
// 检测CEP环境
const isCEP = !!(
    window.__adobe_cep__ ||
    (window.cep && window.cep.process) ||
    (typeof CSInterface !== 'undefined')
);
```

### 状态管理
- `NORMAL`: 正常CEP模式
- `DEMO`: 手动演示模式（彩蛋触发）
- `AUTO_DEMO`: 自动演示模式（非CEP环境）

## 调试命令

在浏览器控制台中使用以下命令进行调试：

```javascript
// 查看演示模式状态
getDemoMode()

// 显示网络拦截统计
showDemoStats()

// 获取详细拦截信息
window.demoMode.networkInterceptor.getInterceptionStats()
```

## 开发指南

### 添加新的模拟数据
1. 编辑 `demo-config.json`
2. 在相应的数据节点添加新字段
3. 在 `demo-apis.js` 中实现对应的模拟方法
4. 在 `demo-network-interceptor.js` 中添加新的API端点支持

### 扩展网络拦截
1. 在 `demo-network-interceptor.js` 中添加新的URL模式
2. 在 `demo-apis.js` 中实现对应的模拟响应
3. 测试拦截是否正常工作

### 自定义动画效果
1. 编辑 `easter-egg.js` 中的CSS样式
2. 修改 `showClickFeedback()` 方法
3. 调整动画时长和效果

### 扩展UI功能
1. 在 `demo-ui.js` 中添加新的UI更新方法
2. 在 `setupUI()` 中调用新方法
3. 确保与原有UI保持一致
4. 在 `demo-override.js` 中添加相应的保护机制

## 注意事项

1. **完全隔离**: 演示模式下完全阻断与Eagle的真实通信
2. **静默运行**: 不显示任何演示模式相关的通知提示
3. **数据保护**: 多层机制保护演示数据不被覆盖
4. **最小侵入性**: 演示模式不会修改原有代码逻辑
5. **向后兼容**: 可以随时禁用演示模式功能
6. **性能优化**: 演示资源采用懒加载方式
7. **错误处理**: 包含完整的错误处理和降级机制

## 故障排除

### 网络请求未被拦截
- 使用 `showDemoStats()` 查看拦截统计
- 检查控制台是否有拦截日志
- 确认演示模式已正确激活

### 演示数据被覆盖
- 检查 `demo-override.js` 是否正确加载
- 查看控制台的UI保护日志
- 确认网络拦截器正常工作

### 彩蛋功能不工作
- 确认在CEP环境中运行
- 检查"项目信息"标题元素是否存在
- 查看控制台是否有错误信息

### 演示数据不显示
- 检查 `demo-config.json` 文件是否正确加载
- 确认网络请求没有被阻止
- 查看控制台的初始化日志

### 模式切换失败
- 确认所有演示脚本都已正确加载
- 检查是否有JavaScript错误
- 尝试刷新页面重新初始化

## 版本历史

- **v2.0.0**: 新增完全网络拦截功能，UI保护机制，静默运行
- **v1.0.0**: 初始版本，包含基础演示模式和彩蛋功能
