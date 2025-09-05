# Eagle2Ae AE插件 Demo功能详细指南

## 概述

Eagle2Ae AE插件的Demo功能是一个完整的演示模式系统，允许在没有安装After Effects或Eagle的环境中体验完整的操作流程。该功能采用模块化架构，包含网络拦截、API模拟、UI管理、彩蛋功能等多个组件。

## 功能特性

### 🎭 自动演示模式
- **触发条件**: 在非CEP环境（普通浏览器）中自动启用
- **功能**: 静态设置AE和Eagle信息，模拟所有交互，提供完整的演示体验
- **特性**: 立即显示演示数据，无需等待动态获取，完全拦截网络通信
- **用途**: 产品展示、功能预览、用户培训

### 🥚 彩蛋模式切换
- **触发条件**: 在CEP环境中连续点击顶部"Eagle2AE"标题5次
- **功能**: 手动切换演示模式和正常模式，启用完整网络拦截
- **用途**: 开发调试、功能演示

### 🛡️ 完全网络拦截
- **完全阻断通信**: 拦截所有与Eagle的网络通信（fetch、WebSocket、XMLHttpRequest）
- **静态数据展示**: 仅显示预设的演示数据，不会在演示数据和真实数据间切换
- **早期拦截**: 在页面加载早期就启用拦截，防止任何真实通信
- **智能识别**: 自动识别Eagle相关的API调用并拦截
- **静默运行**: 不显示任何演示模式相关的通知提示

## 文件结构

```
js/demo/
├── README.md                     # 演示功能说明文档
├── demo-config.json              # 演示数据配置文件
├── demo-mode.js                  # 主控制器（环境检测、模式切换、网络拦截管理）
├── demo-apis.js                  # API模拟器（模拟AE和Eagle交互、完整API端点支持）
├── demo-network-interceptor.js   # 网络拦截器（专业的网络通信拦截）
├── demo-ui.js                    # UI状态管理器（静态信息更新、通知管理）
├── demo-override.js              # 数据覆盖策略（强制显示演示数据、UI保护）
└── easter-egg.js                 # 彩蛋功能（点击检测、动画效果）
```

## 核心组件详解

### 1. DemoMode 主控制器 (demo-mode.js)

**职责**: 环境检测、模式切换和整体协调

**主要功能**:
- 检测CEP环境和Web环境
- 初始化各个子组件
- 管理演示模式状态
- 协调组件间的交互

**模式状态**:
- `NORMAL`: 正常CEP模式
- `DEMO`: 手动演示模式（彩蛋触发）
- `AUTO_DEMO`: 自动演示模式（非CEP环境）

**环境检测机制**:
```javascript
// 检测CEP环境的多重验证
const isCEP = !!(window.__adobe_cep__ || 
                (window.cep && window.cep.process) || 
                (typeof CSInterface !== 'undefined'));
```

### 2. DemoAPIs API模拟器 (demo-apis.js)

**职责**: 模拟所有与AE和Eagle的API交互

**主要API**:
- `testConnection()`: 模拟连接测试
- `getProjectInfo()`: 模拟获取AE项目信息
- `getEagleFiles()`: 模拟获取Eagle文件列表
- `importFiles()`: 模拟文件导入过程
- `pollMessages()`: 模拟消息轮询

**模拟特性**:
- 支持延迟模拟（可配置）
- 支持成功率控制
- 支持进度回调
- 支持错误模拟

### 3. DemoNetworkInterceptor 网络拦截器 (demo-network-interceptor.js)

**职责**: 拦截所有网络通信，确保数据隔离

**拦截范围**:
- ✅ **HTTP请求**: fetch()、XMLHttpRequest
- ✅ **WebSocket连接**: 所有WebSocket通信
- ✅ **Eagle API端点**: /ping、/messages、/ae-message等

**拦截机制**:
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

### 4. DemoUI UI状态管理器 (demo-ui.js)

**职责**: 管理演示模式下的UI状态和显示

**主要功能**:
- 缓存DOM元素引用
- 更新项目信息显示
- 管理连接状态显示
- 处理UI事件监听

**状态管理**:
- 根据连接状态显示不同的演示数据
- 支持连接和未连接两种状态的数据切换
- 自动添加悬浮提示和交互效果

### 5. DemoOverride 数据覆盖策略 (demo-override.js)

**职责**: 强制显示演示数据，防止被真实数据覆盖

**保护机制**:
- DOM变化监控（MutationObserver）
- 实时数据恢复
- 暂停机制（连接状态变化时）
- 元素标记系统

**覆盖策略**:
```javascript
// 持续监控DOM变化
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (isEagleElement(mutation.target)) {
      // 立即恢复演示数据
      restoreDemoData(mutation.target);
    }
  });
});
```

### 6. EasterEgg 彩蛋功能 (easter-egg.js)

**职责**: 在CEP环境中提供手动模式切换功能

**触发机制**:
- 连续点击顶部"Eagle2AE"标题5次
- 3秒时间窗口内完成
- 仅在CEP环境中启用

**视觉效果**:
- 点击反馈动画
- 模式切换通知
- 彩虹渐变效果

## 配置说明

### demo-config.json 配置文件

```json
{
  "meta": {
    "version": "1.0.0",
    "description": "Eagle2Ae 演示模式配置"
  },
  "easterEgg": {
    "enabled": true,           // 是否启用彩蛋功能
    "clickThreshold": 5,       // 触发点击次数
    "timeWindow": 3000         // 时间窗口（毫秒）
  },
  "demoData": {
    "ae": {                    // AE模拟数据
      "version": "2024 (24.0.0)",
      "projectName": "正在做饭",
      "projectPath": "D:\\工作\\今天你吃饭了嘛\\反正我吃了.aep",
      "activeComp": "佛跳墙"
    },
    "eagle": {                 // Eagle模拟数据
      "version": "4.0.0 build 1 pid 41536",
      "execPath": "C:\\Program Files\\Eagle\\Eagle.exe",
      "libraryPath": "D:\\仓鼠.library",
      "selectedFolder": "仓鼠党"
    },
    "operations": {            // 操作模拟设置
      "importDelay": 1500,     // 导入延迟（毫秒）
      "successRate": 0.95,     // 成功率
      "simulateErrors": false  // 是否模拟错误
    },
    "ui": {
      "notifications": {
        "showToasts": false    // 禁用通知显示
      }
    }
  }
}
```

### 演示数据结构

**AE项目信息**:
- `version`: After Effects版本
- `projectName`: 项目名称
- `projectPath`: 项目文件路径
- `activeComp`: 当前活动合成
- `compDuration`: 合成时长
- `frameRate`: 帧率
- `resolution`: 分辨率

**Eagle信息**:
- `version`: Eagle版本信息
- `execPath`: Eagle可执行文件路径
- `libraryPath`: 素材库路径
- `libraryName`: 素材库名称
- `selectedFolder`: 当前选中文件夹
- `totalItems`: 素材总数

**文件列表**:
- `id`: 文件唯一标识
- `name`: 文件名称
- `path`: 文件路径
- `size`: 文件大小
- `type`: 文件类型（image/video/audio/vector）
- `tags`: 标签数组
- `dimensions`: 尺寸信息

## 使用方法

### 1. 自动演示模式（Web环境）

1. 在普通浏览器中打开 `index.html`
2. 演示模式会自动启用，网络拦截立即生效
3. AE和Eagle信息立即显示为演示数据
4. 所有网络通信被拦截，返回模拟响应
5. UI数据受到保护，不会被真实数据覆盖
6. 无任何通知提示，静默运行

**特点**:
- 完全离线运行
- 无需安装任何软件
- 适合产品演示和培训

### 2. 彩蛋模式切换（CEP环境）

1. 在After Effects中打开扩展
2. 连续快速点击顶部"Eagle2AE"标题5次
3. 看到彩虹动画效果后，演示模式启用
4. 网络拦截自动激活，UI数据受到保护
5. 再次连续点击5次可切换回正常模式

**特点**:
- 可在真实环境中演示
- 支持模式实时切换
- 适合开发调试和功能展示

## 技术实现细节

### 环境检测

```javascript
// 多重CEP环境检测
function detectCEPEnvironment() {
    return !!(
        window.__adobe_cep__ ||                    // Adobe CEP标识
        (window.cep && window.cep.process) ||      // CEP进程对象
        (typeof CSInterface !== 'undefined')       // CSInterface可用性
    );
}
```

### 网络拦截实现

```javascript
// 保存原始API引用
const originalAPIs = {
    fetch: window.fetch,
    WebSocket: window.WebSocket,
    XMLHttpRequest: window.XMLHttpRequest
};

// 拦截fetch请求
window.fetch = async function(url, options = {}) {
    if (shouldInterceptRequest(url)) {
        return await mockAPIResponse(url, options);
    }
    return originalAPIs.fetch(url, options);
};
```

### UI保护机制

```javascript
// DOM监控和数据保护
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        const target = mutation.target;
        if (isProtectedElement(target)) {
            // 立即恢复演示数据
            restoreDemoData(target);
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
});
```

### 状态管理

```javascript
// 演示模式状态管理
class DemoModeState {
    constructor() {
        this.modes = {
            NORMAL: 'normal',
            DEMO: 'demo', 
            AUTO_DEMO: 'auto_demo'
        };
        this.currentMode = this.modes.NORMAL;
        this.isInitialized = false;
    }
    
    switchMode(newMode) {
        const oldMode = this.currentMode;
        this.currentMode = newMode;
        this.onModeChange(oldMode, newMode);
    }
}
```

## 开发和调试

### 调试命令

在浏览器控制台中使用以下命令进行调试：

```javascript
// 查看演示模式状态
getDemoMode()

// 显示网络拦截统计
showDemoStats()

// 获取详细拦截信息
window.demoMode.networkInterceptor.getInterceptionStats()

// 手动设置演示数据
window.__setDemoInfo__(true)

// 暂停数据覆盖
window.__pauseDemoOverride__(5000)
```

### 日志控制

```javascript
// 启用详细日志
window.DEMO_DEBUG = true;

// 禁用日志（默认）
window.DEMO_DEBUG = false;
```

### 添加新的模拟数据

1. **编辑配置文件**:
   ```json
   // 在 demo-config.json 中添加新数据
   "demoData": {
     "newFeature": {
       "property1": "value1",
       "property2": "value2"
     }
   }
   ```

2. **实现模拟API**:
   ```javascript
   // 在 demo-apis.js 中添加新方法
   async getNewFeatureData() {
       await this.delay(200);
       return {
           success: true,
           data: this.demoData.newFeature
       };
   }
   ```

3. **添加网络拦截**:
   ```javascript
   // 在 demo-network-interceptor.js 中添加URL模式
   shouldInterceptRequest(url) {
       const patterns = [
           '/api/new-feature',
           // 其他模式...
       ];
       return patterns.some(pattern => url.includes(pattern));
   }
   ```

### 扩展UI功能

1. **添加UI更新方法**:
   ```javascript
   // 在 demo-ui.js 中添加新的UI更新方法
   updateNewFeatureUI() {
       const element = document.getElementById('new-feature-info');
       if (element) {
           element.textContent = this.demoData.newFeature.property1;
       }
   }
   ```

2. **添加数据保护**:
   ```javascript
   // 在 demo-override.js 中添加保护机制
   const protectedElements = [
       'new-feature-info',
       // 其他元素...
   ];
   ```

## 性能优化

### 懒加载策略

```javascript
// 组件懒加载
class DemoMode {
    async loadComponent(componentName) {
        if (!this.components[componentName]) {
            const module = await import(`./demo-${componentName}.js`);
            this.components[componentName] = new module.default(this.config);
        }
        return this.components[componentName];
    }
}
```

### 内存管理

```javascript
// 清理资源
cleanup() {
    // 移除事件监听器
    if (this.observer) {
        this.observer.disconnect();
    }
    
    // 恢复原始API
    this.restoreOriginalAPIs();
    
    // 清理定时器
    if (this.updateTimer) {
        clearInterval(this.updateTimer);
    }
}
```

## 注意事项

### 1. 数据隔离
- 演示模式下完全阻断与Eagle的真实通信
- 所有数据都来自配置文件，不会泄露真实信息
- 网络拦截确保数据安全

### 2. 性能影响
- 演示模式对性能影响极小
- 网络拦截仅在演示模式下激活
- 使用懒加载减少初始化开销

### 3. 兼容性
- 支持所有现代浏览器
- 兼容CEP和Web环境
- 向后兼容，可随时禁用

### 4. 安全性
- 不会修改原有代码逻辑
- 演示数据不包含敏感信息
- 支持完全禁用功能

### 5. 维护性
- 模块化设计，易于维护
- 配置文件集中管理
- 详细的日志和调试支持

## 故障排除

### 常见问题

1. **彩蛋功能无法触发**
   - 确认在CEP环境中运行
   - 检查标题元素是否正确绑定
   - 确认点击间隔在3秒内

2. **演示数据不显示**
   - 检查配置文件是否正确加载
   - 确认DOM元素ID是否匹配
   - 查看控制台错误信息

3. **网络拦截失效**
   - 确认拦截器已激活
   - 检查URL模式匹配
   - 验证原始API备份

### 调试步骤

1. **启用调试日志**:
   ```javascript
   window.DEMO_DEBUG = true;
   ```

2. **检查组件状态**:
   ```javascript
   console.log(window.demoMode.state);
   ```

3. **验证配置加载**:
   ```javascript
   console.log(window.demoMode.config);
   ```

4. **测试网络拦截**:
   ```javascript
   fetch('/api/ping').then(console.log);
   ```

## 最佳实践

### 1. 开发建议
- 使用配置文件管理演示数据
- 保持模块间的松耦合
- 添加充分的错误处理
- 使用语义化的命名

### 2. 测试建议
- 在多种环境中测试
- 验证网络拦截效果
- 测试模式切换功能
- 检查内存泄漏

### 3. 部署建议
- 生产环境可选择禁用
- 配置合适的演示数据
- 优化加载性能
- 提供用户文档

---

**总结**: Eagle2Ae的Demo功能提供了一个完整的演示环境，通过网络拦截、数据模拟、UI保护等多重机制，确保用户可以在任何环境中体验完整的功能流程。该系统设计精巧，性能优异，是产品演示和用户培训的理想解决方案。