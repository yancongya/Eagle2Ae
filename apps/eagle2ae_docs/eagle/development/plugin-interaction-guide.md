# Eagle 插件交互指南

## 概述

Eagle2Ae Eagle插件提供了直观的用户界面和流畅的交互体验。本指南详细说明用户操作流程、交互设计原则、状态管理和最佳实践。

## 用户操作流程

### 1. 插件启动流程

#### 自动启动
```
1. Eagle启动时自动加载插件
2. 插件初始化后台服务
3. 显示启动通知
4. 开始监控文件选择
```

#### 启动状态检查
- **初始化时间**: 最少5秒初始化期，防止意外触发
- **状态标志**: `isInitializing` 控制用户操作可用性
- **启动通知**: Eagle通知系统显示启动确认

#### 启动日志示例
```
[时间] 🚀 Eagle2Ae 后台服务启动中...
[时间] ✅ Eagle2Ae 服务已启动 (端口: 8080)
[时间] 🔓 初始化完成，用户操作已启用
```

### 2. 文件选择和导出流程

#### 标准操作流程
```
1. 在Eagle中选择要导出的文件
   ↓
2. 插件自动检测文件选择变化
   ↓
3. 更新UI中的文件列表显示
   ↓
4. 用户点击文件列表触发导出
   ↓
5. 插件发送文件到AE扩展
   ↓
6. 显示操作结果和日志
```

#### 文件选择检测
- **API调用**: `eagle.item.getSelected()`
- **更新频率**: 每秒检查一次
- **变化检测**: 比较文件列表差异
- **UI更新**: 实时更新文件计数和列表

#### 手动导出触发
```javascript
// 用户点击文件列表
function handleFileListClick() {
    handleManualExport();
}

// 导出处理流程
async function handleManualExport() {
    1. 检查Eagle API可用性
    2. 获取当前选中文件
    3. 验证文件数量和类型
    4. 调用后台服务处理
    5. 记录操作日志
    6. 显示结果反馈
}
```

### 3. 设置配置流程

#### 打开设置
```
1. 点击标题栏齿轮图标
   ↓
2. 显示设置对话框
   ↓
3. 加载当前设置值
   ↓
4. 用户修改设置项
   ↓
5. 点击保存或取消
```

#### 设置保存流程
```javascript
function saveSettings() {
    1. 收集表单数据
    2. 验证设置值有效性
    3. 保存到本地存储
    4. 更新插件配置
    5. 重启相关服务（如需要）
    6. 显示保存确认
    7. 关闭设置对话框
}
```

## 交互设计原则

### 1. 即时反馈原则

#### 视觉反馈
- **按钮悬停**: 背景色变化，提供即时视觉反馈
- **状态指示**: 连接状态用颜色区分（绿色/红色）
- **加载状态**: 操作进行时显示相应提示

#### 操作确认
- **设置保存**: 显示"设置已保存"日志
- **文件导出**: 显示导出进度和结果
- **错误处理**: 友好的错误提示信息

### 2. 一致性原则

#### UI一致性
- **颜色方案**: 统一的深色主题
- **字体规范**: 系统字体，合适的字号
- **间距布局**: 一致的内边距和外边距

#### 交互一致性
- **点击行为**: 相同类型元素的点击行为一致
- **键盘导航**: 支持Tab键导航
- **快捷操作**: 一致的快捷键和手势

### 3. 容错性原则

#### 错误预防
- **输入验证**: 端口号范围限制（1024-65535）
- **状态检查**: 操作前检查服务状态
- **重复操作**: 防止重复导出相同文件

#### 错误恢复
- **自动重试**: 网络错误时自动重试
- **优雅降级**: API不可用时显示友好提示
- **状态重置**: 错误后自动恢复到正常状态

## 状态管理

### 1. 应用状态

#### 初始化状态
```javascript
const appState = {
    isInitializing: true,        // 是否正在初始化
    initStartTime: Date.now(),   // 初始化开始时间
    minInitTime: 5000,           // 最小初始化时间
    isServiceMode: true,         // 是否为服务模式
    uiMode: false               // 是否有UI界面
};
```

#### 服务状态
```javascript
const serviceState = {
    httpServer: null,           // HTTP服务器实例
    webSocketServer: null,      // WebSocket服务器实例
    aeConnection: null,         // AE连接状态
    clipboardHandler: null,     // 剪切板处理器
    portAllocator: null        // 端口分配器
};
```

#### AE连接状态
```javascript
const aeStatus = {
    connected: false,           // 是否已连接
    projectPath: null,          // 项目路径
    activeComp: null,           // 活动合成
    isReady: false,            // 是否就绪
    lastMessageTime: null       // 最后消息时间
};
```

### 2. UI状态管理

#### 文件选择状态
```javascript
const fileState = {
    selectedFiles: [],          // 当前选中文件
    lastSelection: null,        // 上次选择
    isUpdating: false          // 是否正在更新
};
```

#### 设置状态
```javascript
const settingsState = {
    isVisible: false,           // 设置对话框是否可见
    isDirty: false,            // 设置是否有未保存更改
    currentSettings: {},        // 当前设置值
    defaultSettings: {}         // 默认设置值
};
```

### 3. 状态同步机制

#### UI与服务同步
```javascript
// 定期同步状态
setInterval(() => {
    updateServiceStatus();      // 更新服务状态
    updateSelectedFiles();      // 更新文件选择
    updateUptime();            // 更新运行时间
}, 1000);
```

#### 设置同步
```javascript
// 加载设置
function loadSettings() {
    const saved = localStorage.getItem('eagle2ae-settings');
    const settings = JSON.parse(saved || '{}');
    applySettingsToUI(settings);
}

// 保存设置
function saveSettings() {
    const settings = collectSettingsFromUI();
    localStorage.setItem('eagle2ae-settings', JSON.stringify(settings));
    applySettingsToService(settings);
}
```

## 事件处理机制

### 1. DOM事件处理

#### 事件绑定
```javascript
function bindEvents() {
    // 设置按钮
    document.getElementById('title-settings-button')
        .addEventListener('click', showSettings);
    
    // 文件列表点击
    document.getElementById('files-list')
        .addEventListener('click', handleFileListClick);
    
    // 设置对话框
    document.getElementById('save-settings')
        .addEventListener('click', saveSettings);
    
    document.getElementById('cancel-settings')
        .addEventListener('click', hideSettings);
}
```

#### 事件委托
```javascript
// 使用事件委托处理动态内容
document.getElementById('files-list').addEventListener('click', (e) => {
    if (e.target.closest('.file-item')) {
        handleFileItemClick(e.target.closest('.file-item'));
    }
});
```

### 2. 自定义事件

#### 服务事件
```javascript
// 发送自定义事件
function emitServiceEvent(type, data) {
    const event = new CustomEvent('eagle2ae:' + type, {
        detail: data
    });
    document.dispatchEvent(event);
}

// 监听服务事件
document.addEventListener('eagle2ae:status-change', (e) => {
    updateUIStatus(e.detail);
});
```

#### 文件事件
```javascript
// 文件选择变化事件
document.addEventListener('eagle2ae:files-changed', (e) => {
    updateFilesList(e.detail.files);
    updateFilesCount(e.detail.count);
});
```

### 3. 错误事件处理

#### 全局错误处理
```javascript
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
    addLog(`发生错误: ${e.error.message}`, 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
    addLog(`异步错误: ${e.reason}`, 'error');
});
```

#### 服务错误处理
```javascript
function handleServiceError(error, context) {
    console.error(`服务错误 [${context}]:`, error);
    
    // 记录错误日志
    addLog(`${context}失败: ${error.message}`, 'error');
    
    // 更新UI状态
    updateConnectionStatus('error');
    
    // 尝试恢复
    if (context === 'connection') {
        setTimeout(() => {
            attemptReconnection();
        }, 5000);
    }
}
```

## 用户体验优化

### 1. 性能优化

#### 防抖和节流
```javascript
// 文件选择更新防抖
const debouncedUpdateFiles = debounce(updateSelectedFiles, 300);

// 日志输出节流
const throttledAddLog = throttle(addLog, 100);

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
```

#### 虚拟滚动
```javascript
// 大量文件时使用虚拟滚动
function renderFilesList(files) {
    const container = document.getElementById('files-list');
    const visibleCount = Math.ceil(container.clientHeight / 40); // 每项40px
    const startIndex = Math.floor(container.scrollTop / 40);
    const endIndex = Math.min(startIndex + visibleCount, files.length);
    
    // 只渲染可见部分
    const visibleFiles = files.slice(startIndex, endIndex);
    renderVisibleFiles(visibleFiles, startIndex);
}
```

### 2. 可访问性

#### 键盘导航
```javascript
// 支持键盘导航
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsVisible) {
        hideSettings();
    }
    
    if (e.key === 'Enter' && e.target.classList.contains('file-item')) {
        handleFileItemClick(e.target);
    }
});
```

#### ARIA标签
```html
<!-- 为屏幕阅读器添加ARIA标签 -->
<button id="title-settings-button" 
        aria-label="打开设置"
        aria-expanded="false">
    <span class="gear-icon" aria-hidden="true"></span>
</button>

<div id="files-list" 
     role="listbox" 
     aria-label="选中的文件列表">
    <!-- 文件项 -->
</div>
```

### 3. 响应式设计

#### 自适应布局
```css
/* 响应式网格布局 */
.status-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

/* 移动端适配 */
@media (max-width: 600px) {
    .export-ae-panel {
        padding: 8px;
    }
    
    .settings-dialog {
        min-width: 90vw;
        margin: 20px;
    }
}
```

#### 动态高度
```javascript
// 根据窗口大小调整日志区域高度
function adjustLogHeight() {
    const logOutput = document.getElementById('log-output');
    const windowHeight = window.innerHeight;
    const otherElementsHeight = 420; // 其他元素的固定高度
    const newHeight = Math.max(200, windowHeight - otherElementsHeight);
    logOutput.style.height = `${newHeight}px`;
}

window.addEventListener('resize', adjustLogHeight);
```

## 最佳实践

### 1. 代码组织

#### 模块化结构
```javascript
// UI管理模块
const UIManager = {
    init() { /* 初始化UI */ },
    updateStatus() { /* 更新状态 */ },
    showSettings() { /* 显示设置 */ },
    hideSettings() { /* 隐藏设置 */ }
};

// 文件管理模块
const FileManager = {
    getSelected() { /* 获取选中文件 */ },
    updateList() { /* 更新文件列表 */ },
    exportFiles() { /* 导出文件 */ }
};

// 设置管理模块
const SettingsManager = {
    load() { /* 加载设置 */ },
    save() { /* 保存设置 */ },
    validate() { /* 验证设置 */ }
};
```

#### 事件驱动架构
```javascript
// 中央事件总线
const EventBus = {
    events: {},
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    },
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    },
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
};
```

### 2. 错误处理

#### 统一错误处理
```javascript
class ErrorHandler {
    static handle(error, context = 'unknown') {
        console.error(`[${context}] 错误:`, error);
        
        // 记录到日志
        if (window.uiAddLog) {
            window.uiAddLog(`${context}错误: ${error.message}`, 'error');
        }
        
        // 发送错误事件
        EventBus.emit('error', { error, context });
        
        // 用户通知
        if (error.userMessage) {
            this.showUserError(error.userMessage);
        }
    }
    
    static showUserError(message) {
        // 显示用户友好的错误信息
        if (typeof eagle !== 'undefined' && eagle.notification) {
            eagle.notification.show({
                title: 'Eagle2Ae 错误',
                body: message,
                mute: false,
                duration: 5000
            });
        }
    }
}
```

#### 异步错误处理
```javascript
// 包装异步函数
function asyncWrapper(fn) {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            ErrorHandler.handle(error, fn.name);
            throw error;
        }
    };
}

// 使用示例
const safeUpdateFiles = asyncWrapper(updateSelectedFiles);
const safeExportFiles = asyncWrapper(handleManualExport);
```

### 3. 性能监控

#### 性能指标收集
```javascript
class PerformanceMonitor {
    static timers = new Map();
    
    static start(name) {
        this.timers.set(name, performance.now());
    }
    
    static end(name) {
        const startTime = this.timers.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            console.log(`[性能] ${name}: ${duration.toFixed(2)}ms`);
            this.timers.delete(name);
            return duration;
        }
    }
    
    static measure(name, fn) {
        this.start(name);
        const result = fn();
        this.end(name);
        return result;
    }
}

// 使用示例
PerformanceMonitor.start('file-update');
await updateSelectedFiles();
PerformanceMonitor.end('file-update');
```

### 4. 测试策略

#### 单元测试
```javascript
// 测试工具函数
function testFilePathValidation() {
    const validPaths = [
        'C:\\Users\\test\\image.jpg',
        '/Users/test/image.png',
        '\\\\server\\share\\file.mp4'
    ];
    
    const invalidPaths = [
        'not-a-path',
        'relative/path.jpg',
        ''
    ];
    
    validPaths.forEach(path => {
        console.assert(isValidFilePath(path), `应该是有效路径: ${path}`);
    });
    
    invalidPaths.forEach(path => {
        console.assert(!isValidFilePath(path), `应该是无效路径: ${path}`);
    });
}
```

#### 集成测试
```javascript
// 测试完整的导出流程
async function testExportFlow() {
    try {
        // 1. 模拟文件选择
        const mockFiles = [{
            name: 'test.jpg',
            path: 'C:\\test\\test.jpg',
            ext: 'jpg'
        }];
        
        // 2. 更新UI
        updateFilesList(mockFiles);
        
        // 3. 触发导出
        await handleManualExport();
        
        // 4. 验证结果
        console.log('导出流程测试通过');
    } catch (error) {
        console.error('导出流程测试失败:', error);
    }
}
```

---

## 相关文档

- [插件组件详细说明](../api/plugin-components.md)
- [函数功能映射](../api/function-mapping.md)
- [调试指南](debugging-guide.md)
- [配置管理](configuration.md)
- [WebSocket API](../api/websocket-api.md)