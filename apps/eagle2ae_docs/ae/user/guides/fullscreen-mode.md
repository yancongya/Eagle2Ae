# 独显模式（专注模式）

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了全新的独显模式（Fullscreen Mode），也称为专注模式（Focus Mode）。该模式允许用户最大化显示特定功能区域，隐藏非必要元素，提供沉浸式的操作体验。独显模式特别适用于需要专注操作的场景，如演示、教学或在小屏幕设备上使用。

## 核心特性

### 全屏显示
- 最大化显示导入模式面板
- 隐藏标题栏和其他非必要元素
- 提供沉浸式的操作体验

### 智能布局
- 自动调整元素间距和尺寸
- 优化按钮和控件的显示效果
- 保持功能完整性的同时简化界面

### 快速切换
- 支持一键开启/关闭独显模式
- 状态自动保存，下次启动时恢复
- 支持快捷键快速切换

### 多场景适配
- 适用于演示场景
- 适用于教学场景
- 适用于小屏幕设备
- 适用于专注操作场景

## 使用指南

### 启用独显模式

#### 方法一：通过UI设置
1. 进入 `高级设置` > `UI 设置`
2. 找到 "占满" 选项
3. 启用该选项，界面将立即切换到独显模式

#### 方法二：通过按钮切换
1. 在面板右上角找到独显模式切换按钮（⛶图标）
2. 点击按钮，界面将在正常模式和独显模式之间切换
3. 按钮状态会实时更新以反映当前模式

#### 方法三：通过快捷键
1. 使用快捷键 `Ctrl+Shift+F` (Windows) 或 `Cmd+Shift+F` (macOS)
2. 界面将在正常模式和独显模式之间切换

### 独显模式下的界面布局

#### 导入模式面板最大化
在独显模式下，导入模式面板将占据整个窗口区域：
- 隐藏标题栏和非必要元素
- 最大化显示导入模式选择按钮
- 优化按钮尺寸和间距以适应全屏显示
- 保持所有功能选项的可访问性

#### 按钮布局优化
```css
/* 独显模式下的按钮布局 */
.content.fullscreen-mode #import-mode-section {
    display: flex !important;
    flex-direction: column;
    justify-content: space-evenly;
    gap: clamp(8px, 2vh, 20px);
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: clamp(12px, 3vh, 32px);
    overflow: auto;
    box-sizing: border-box;
    /* 保留外框样式 */
    background: #2a2a2a;
    border: 1px solid #555;
    border-radius: 6px;
}

/* 独显模式下的按钮组样式 */
.content.fullscreen-mode #import-mode-section .import-mode-selection,
.content.fullscreen-mode #import-mode-section .import-behavior,
.content.fullscreen-mode #import-mode-section .layer-operations {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    min-height: 32px;
}

.content.fullscreen-mode #import-mode-section .mode-buttons,
.content.fullscreen-mode #import-mode-section .import-behavior-buttons,
.content.fullscreen-mode #import-mode-section .layer-operation-buttons {
    display: flex;
    gap: 12px;
    width: 100%;
    height: 100%;
    min-height: 32px;
}

.content.fullscreen-mode #import-mode-section .mode-button,
.content.fullscreen-mode #import-mode-section .import-behavior-button,
.content.fullscreen-mode #import-mode-section .layer-operation-button {
    flex: 1;
    height: 100%;
    min-height: 32px;
    font-size: clamp(10px, 1.5vh, 14px);
    padding: clamp(6px, 1.5vh, 12px) clamp(8px, 2vh, 16px);
}
```

### 独显模式下的操作

#### 导入模式选择
在独显模式下，导入模式选择按钮将最大化显示：
- 直接导入按钮：占据上部区域
- 项目旁复制按钮：占据中部区域
- 指定文件夹按钮：占据下部区域
- 每个按钮都有充足的点击区域，便于操作

#### 导入行为设置
导入行为设置按钮也将最大化显示：
- 不导入合成按钮：占据上部区域
- 当前时间按钮：占据中部区域
- 时间轴开始按钮：占据下部区域
- 提供清晰的视觉反馈和状态指示

#### 图层操作按钮
图层操作按钮同样最大化显示：
- 检测图层按钮：占据上部区域
- 导出图层按钮：占据中部区域
- 导出到Eagle按钮：占据下部区域
- 支持一键快速执行图层操作

## 技术实现

### 独显模式切换机制

```javascript
/**
 * 独显模式管理器
 * 负责管理独显模式的启用、禁用和状态保存
 */
class FullscreenModeManager {
    /**
     * 构造函数
     */
    constructor() {
        this.isEnabled = false;
        this.init();
    }
    
    /**
     * 初始化独显模式管理器
     */
    init() {
        // 绑定独显模式切换事件
        const fullscreenToggle = document.getElementById('fullscreen-toggle');
        if (fullscreenToggle) {
            fullscreenToggle.addEventListener('click', () => {
                this.toggleFullscreenMode();
            });
        }
        
        // 绑定键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+F 或 Cmd+Shift+F 切换独显模式
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                this.toggleFullscreenMode();
            }
        });
        
        // 检查初始状态
        const savedState = this.getPanelLocalStorage('fullscreenMode');
        if (savedState === 'true') {
            this.enableFullscreenMode();
        }
        
        this.log('🖥️ 独显模式管理器已初始化', 'debug');
    }
    
    /**
     * 切换独显模式
     */
    toggleFullscreenMode() {
        if (this.isEnabled) {
            this.disableFullscreenMode();
        } else {
            this.enableFullscreenMode();
        }
    }
    
    /**
     * 启用独显模式
     */
    enableFullscreenMode() {
        const contentContainer = document.querySelector('.content');
        if (contentContainer) {
            contentContainer.classList.add('fullscreen-mode');
            this.isEnabled = true;
            
            // 保存状态
            this.setPanelLocalStorage('fullscreenMode', 'true');
            
            // 更新按钮状态
            this.updateFullscreenToggleButton();
            
            this.log('🖥️ 已启用独显模式（专注模式）', 'info');
        }
    }
    
    /**
     * 禁用独显模式
     */
    disableFullscreenMode() {
        const contentContainer = document.querySelector('.content');
        if (contentContainer) {
            contentContainer.classList.remove('fullscreen-mode');
            this.isEnabled = false;
            
            // 保存状态
            this.setPanelLocalStorage('fullscreenMode', 'false');
            
            // 更新按钮状态
            this.updateFullscreenToggleButton();
            
            this.log('🖥️ 已禁用独显模式（专注模式）', 'info');
        }
    }
    
    /**
     * 更新独显模式切换按钮状态
     */
    updateFullscreenToggleButton() {
        const toggleBtn = document.getElementById('fullscreen-toggle');
        if (toggleBtn) {
            const iconSpan = toggleBtn.querySelector('.icon');
            const isFullscreen = this.isEnabled;
            
            toggleBtn.setAttribute('aria-pressed', String(isFullscreen));
            toggleBtn.title = isFullscreen ? '退出独显模式' : '进入独显模式';
            
            if (iconSpan) {
                iconSpan.textContent = isFullscreen ? '⛶' : '⛶';
            }
        }
    }
    
    /**
     * 获取面板特定的localStorage值
     * @param {string} key - 键名
     * @returns {string|null} 值
     */
    getPanelLocalStorage(key) {
        return localStorage.getItem(this.getPanelStorageKey(key));
    }
    
    /**
     * 设置面板特定的localStorage值
     * @param {string} key - 键名
     * @param {string} value - 值
     */
    setPanelLocalStorage(key, value) {
        localStorage.setItem(this.getPanelStorageKey(key), value);
    }
    
    /**
     * 获取面板特定的localStorage键
     * @param {string} key - 原始键名
     * @returns {string} 带面板前缀的键名
     */
    getPanelStorageKey(key) {
        return `${this.panelId}_${key}`;
    }
}
```

### 独显模式CSS样式

```css
/* 独显模式样式 */
.content.fullscreen-mode {
    gap: 0;
    padding: 12px;
    height: 100vh;
    box-sizing: border-box;
}

.content.fullscreen-mode .section {
    display: none;
}

.content.fullscreen-mode #import-mode-section {
    display: flex !important;
    flex-direction: column;
    justify-content: space-evenly;
    gap: clamp(8px, 2vh, 20px);
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: clamp(12px, 3vh, 32px);
    overflow: auto;
    box-sizing: border-box;
    /* 保留外框样式 */
    background: #2a2a2a;
    border: 1px solid #555;
    border-radius: 6px;
}

.content.fullscreen-mode #import-mode-section .section-title {
    display: none;
}

/* 独显模式下的按钮组样式 */
.content.fullscreen-mode #import-mode-section .import-mode-selection,
.content.fullscreen-mode #import-mode-section .import-behavior,
.content.fullscreen-mode #import-mode-section .layer-operations {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    min-height: 32px;
}

.content.fullscreen-mode #import-mode-section .mode-buttons,
.content.fullscreen-mode #import-mode-section .import-behavior-buttons,
.content.fullscreen-mode #import-mode-section .layer-operation-buttons {
    display: flex;
    gap: 12px;
    width: 100%;
    height: 100%;
    min-height: 32px;
}

.content.fullscreen-mode #import-mode-section .mode-button,
.content.fullscreen-mode #import-mode-section .import-behavior-button,
.content.fullscreen-mode #import-mode-section .layer-operation-button {
    flex: 1;
    height: 100%;
    min-height: 32px;
    font-size: clamp(10px, 1.5vh, 14px);
    padding: clamp(6px, 1.5vh, 12px) clamp(8px, 2vh, 16px);
}

/* 极小屏幕优化 */
@media (max-height: 500px) {
    .content.fullscreen-mode #import-mode-section {
        gap: 6px;
        padding: 8px;
    }

    .content.fullscreen-mode #import-mode-section .import-mode-selection,
    .content.fullscreen-mode #import-mode-section .import-behavior,
    .content.fullscreen-mode #import-mode-section .layer-operations {
        min-height: 24px;
    }

    .content.fullscreen-mode #import-mode-section .mode-buttons,
    .content.fullscreen-mode #import-mode-section .import-behavior-buttons,
    .content.fullscreen-mode #import-mode-section .layer-operation-buttons {
        gap: 6px;
        min-height: 24px;
    }

    .content.fullscreen-mode #import-mode-section .mode-button,
    .content.fullscreen-mode #import-mode-section .import-behavior-button,
    .content.fullscreen-mode #import-mode-section .layer-operation-button {
        min-height: 24px;
        font-size: 10px;
        padding: 4px 6px;
    }
}

@media (max-height: 350px) {
    .content.fullscreen-mode #import-mode-section {
        gap: 4px;
        padding: 6px;
    }

    .content.fullscreen-mode #import-mode-section .import-mode-selection,
    .content.fullscreen-mode #import-mode-section .import-behavior,
    .content.fullscreen-mode #import-mode-section .layer-operations {
        min-height: 20px;
    }

    .content.fullscreen-mode #import-mode-section .mode-buttons,
    .content.fullscreen-mode #import-mode-section .import-behavior-buttons,
    .content.fullscreen-mode #import-mode-section .layer-operation-buttons {
        gap: 4px;
        min-height: 20px;
    }

    .content.fullscreen-mode #import-mode-section .mode-button,
    .content.fullscreen-mode #import-mode-section .import-behavior-button,
    .content.fullscreen-mode #import-mode-section .layer-operation-button {
        min-height: 20px;
        font-size: 9px;
        padding: 3px 4px;
    }
}
```

### 响应式适配

```css
/* 独显模式下的响应式适配 */
.content.fullscreen-mode {
    /* 在不同屏幕尺寸下的适配 */
}

/* 大屏幕适配 */
@media (min-width: 1200px) and (min-height: 800px) {
    .content.fullscreen-mode {
        padding: 24px;
    }
    
    .content.fullscreen-mode #import-mode-section {
        gap: 32px;
        padding: 48px;
    }
    
    .content.fullscreen-mode #import-mode-section .mode-button,
    .content.fullscreen-mode #import-mode-section .import-behavior-button,
    .content.fullscreen-mode #import-mode-section .layer-operation-button {
        font-size: 16px;
        padding: 16px 24px;
        min-height: 48px;
    }
}

/* 中等屏幕适配 */
@media (min-width: 768px) and (max-width: 1199px) and (min-height: 600px) and (max-height: 799px) {
    .content.fullscreen-mode {
        padding: 18px;
    }
    
    .content.fullscreen-mode #import-mode-section {
        gap: 24px;
        padding: 36px;
    }
    
    .content.fullscreen-mode #import-mode-section .mode-button,
    .content.fullscreen-mode #import-mode-section .import-behavior-button,
    .content.fullscreen-mode #import-mode-section .layer-operation-button {
        font-size: 14px;
        padding: 12px 18px;
        min-height: 40px;
    }
}

/* 小屏幕适配 */
@media (max-width: 767px) and (min-height: 400px) and (max-height: 599px) {
    .content.fullscreen-mode {
        padding: 12px;
    }
    
    .content.fullscreen-mode #import-mode-section {
        gap: 16px;
        padding: 24px;
    }
    
    .content.fullscreen-mode #import-mode-section .mode-button,
    .content.fullscreen-mode #import-mode-section .import-behavior-button,
    .content.fullscreen-mode #import-mode-section .layer-operation-button {
        font-size: 12px;
        padding: 8px 12px;
        min-height: 32px;
    }
}

/* 超小屏幕适配 */
@media (max-width: 480px) and (max-height: 399px) {
    .content.fullscreen-mode {
        padding: 8px;
    }
    
    .content.fullscreen-mode #import-mode-section {
        gap: 12px;
        padding: 16px;
    }
    
    .content.fullscreen-mode #import-mode-section .mode-button,
    .content.fullscreen-mode #import-mode-section .import-behavior-button,
    .content.fullscreen-mode #import-mode-section .layer-operation-button {
        font-size: 10px;
        padding: 6px 8px;
        min-height: 28px;
    }
}
```

## 最佳实践

### 使用建议

#### 演示场景
```javascript
// 在演示模式下自动启用独显模式
function autoEnableFullscreenInDemoMode() {
    if (window.__DEMO_MODE_ACTIVE__) {
        // 延迟启用，确保DOM完全加载
        setTimeout(() => {
            const fullscreenManager = new FullscreenModeManager();
            fullscreenManager.enableFullscreenMode();
            
            // 在演示模式下显示提示
            this.log('🎭 演示模式：已自动启用独显模式（专注模式）', 'info');
            this.log('💡 点击右上角的 ⛶ 按钮可切换正常模式', 'info');
        }, 1000);
    }
}
```

#### 教学场景
```javascript
// 在教学模式下提供独显模式引导
function showFullscreenModeTutorial() {
    // 检查是否首次使用独显模式
    const hasUsedFullscreen = localStorage.getItem('hasUsedFullscreenMode');
    
    if (!hasUsedFullscreen) {
        // 显示独显模式使用教程
        this.showTutorialDialog({
            title: '独显模式（专注模式）',
            content: `
                <p>独显模式可以帮助您获得更好的操作体验：</p>
                <ul>
                    <li>最大化显示导入模式面板</li>
                    <li>隐藏非必要元素，减少干扰</li>
                    <li>提供沉浸式的操作环境</li>
                </ul>
                <p>使用方法：</p>
                <ol>
                    <li>点击右上角的 ⛶ 按钮启用独显模式</li>
                    <li>再次点击按钮退出独显模式</li>
                    <li>也可以使用快捷键 Ctrl+Shift+F 切换</li>
                </ol>
            `,
            buttons: ['知道了']
        });
        
        // 标记已显示教程
        localStorage.setItem('hasUsedFullscreenMode', 'true');
    }
}
```

#### 小屏幕设备
```javascript
// 在小屏幕设备上自动启用独显模式
function autoEnableFullscreenOnSmallScreens() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 在小屏幕设备上自动启用独显模式
    if (screenWidth <= 768 || screenHeight <= 600) {
        // 延迟启用，确保DOM完全加载
        setTimeout(() => {
            const fullscreenManager = new FullscreenModeManager();
            if (!fullscreenManager.isEnabled) {
                fullscreenManager.enableFullscreenMode();
                this.log('📱 检测到小屏幕设备，已自动启用独显模式', 'info');
            }
        }, 500);
    }
}
```

### 性能优化

#### 避免重绘
```css
/* 使用transform而不是改变布局属性来减少重绘 */
.content.fullscreen-mode #import-mode-section .mode-button,
.content.fullscreen-mode #import-mode-section .import-behavior-button,
.content.fullscreen-mode #import-mode-section .layer-operation-button {
    /* 使用transform进行动画 */
    transition: transform 0.2s ease, background-color 0.2s ease;
}

.content.fullscreen-mode #import-mode-section .mode-button:hover,
.content.fullscreen-mode #import-mode-section .import-behavior-button:hover,
.content.fullscreen-mode #import-mode-section .layer-operation-button:hover {
    transform: translateY(-2px);
}

.content.fullscreen-mode #import-mode-section .mode-button:active,
.content.fullscreen-mode #import-mode-section .import-behavior-button:active,
.content.fullscreen-mode #import-mode-section .layer-operation-button:active {
    transform: translateY(0);
}
```

#### 内存管理
```javascript
// 及时清理事件监听器
class FullscreenModeManager {
    /**
     * 清理资源
     */
    cleanup() {
        // 移除事件监听器
        if (this.fullscreenToggle) {
            this.fullscreenToggle.removeEventListener('click', this.toggleFullscreenMode);
        }
        
        // 清理键盘监听器
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // 清理定时器
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        
        this.log('🖥️ 独显模式管理器资源已清理', 'debug');
    }
    
    /**
     * 处理键盘事件
     */
    handleKeyDown = (e) => {
        // Ctrl+Shift+F 或 Cmd+Shift+F 切换独显模式
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            this.toggleFullscreenMode();
        }
    }
}
```

## 故障排除

### 常见问题

#### 独显模式无法启用
- **症状**：点击独显模式按钮无反应
- **解决**：
  1. 检查按钮事件监听器是否正确绑定
  2. 验证CSS类是否正确应用
  3. 检查localStorage权限

#### 界面布局错乱
- **症状**：启用独显模式后界面元素重叠或显示异常
- **解决**：
  1. 检查CSS选择器优先级
  2. 验证`fullscreen-mode`类是否正确应用
  3. 检查响应式断点设置

#### 快捷键无效
- **症状**：使用快捷键无法切换独显模式
- **解决**：
  1. 检查键盘事件监听器是否正确绑定
  2. 验证快捷键组合设置
  3. 检查是否有其他应用占用了相同快捷键

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用独显模式调试日志
localStorage.setItem('debugLogLevel', '0');

// 监控独显模式状态变化
const fullscreenObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'class') {
            const hasFullscreenClass = mutation.target.classList.contains('fullscreen-mode');
            console.log('独显模式状态变化:', hasFullscreenClass ? '启用' : '禁用');
        }
    });
});

fullscreenObserver.observe(document.querySelector('.content'), {
    attributes: true,
    attributeFilter: ['class']
});
```

#### 检查样式应用
```javascript
// 检查独显模式样式是否正确应用
function inspectFullscreenStyles() {
    const contentElement = document.querySelector('.content');
    const importModeSection = document.querySelector('#import-mode-section');
    
    console.log('内容容器类名:', contentElement.className);
    console.log('导入模式区段样式:', window.getComputedStyle(importModeSection));
    
    // 检查是否应用了独显模式样式
    const isFullscreen = contentElement.classList.contains('fullscreen-mode');
    console.log('独显模式状态:', isFullscreen);
    
    if (isFullscreen) {
        // 检查具体样式属性
        const computedStyle = window.getComputedStyle(importModeSection);
        console.log('显示属性:', computedStyle.display);
        console.log('Flex方向:', computedStyle.flexDirection);
        console.log('间隙:', computedStyle.gap);
        console.log('内边距:', computedStyle.padding);
    }
}
```

#### 性能监控
```javascript
// 监控独显模式切换性能
function monitorFullscreenPerformance() {
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.name === 'fullscreen-toggle') {
                console.log('独显模式切换性能:', {
                    duration: entry.duration,
                    startTime: entry.startTime
                });
            }
        });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    // 标记性能测量点
    performance.mark('fullscreen-toggle-start');
    
    // 执行独显模式切换
    // ...
    
    performance.mark('fullscreen-toggle-end');
    performance.measure('fullscreen-toggle', 'fullscreen-toggle-start', 'fullscreen-toggle-end');
}
```

## 扩展性

### 自定义独显模式

```javascript
// 扩展独显模式功能
class CustomFullscreenModeManager extends FullscreenModeManager {
    /**
     * 自定义独显模式配置
     */
    constructor(options = {}) {
        super();
        this.customOptions = {
            customLayout: 'grid', // 'grid' | 'list' | 'carousel'
            showBackground: true,
            backgroundOpacity: 0.8,
            animationDuration: 300,
            ...options
        };
    }
    
    /**
     * 启用自定义独显模式
     */
    enableCustomFullscreenMode() {
        super.enableFullscreenMode();
        
        // 应用自定义配置
        this.applyCustomLayout();
        this.applyCustomBackground();
        this.applyCustomAnimation();
    }
    
    /**
     * 应用自定义布局
     */
    applyCustomLayout() {
        const importModeSection = document.querySelector('#import-mode-section');
        if (importModeSection) {
            importModeSection.classList.add(`layout-${this.customOptions.customLayout}`);
        }
    }
    
    /**
     * 应用自定义背景
     */
    applyCustomBackground() {
        if (this.customOptions.showBackground) {
            const overlay = document.querySelector('.virtual-dialog-overlay');
            if (overlay) {
                overlay.style.backgroundColor = `rgba(0, 0, 0, ${this.customOptions.backgroundOpacity})`;
            }
        }
    }
    
    /**
     * 应用自定义动画
     */
    applyCustomAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes customDialogAppear {
                from {
                    opacity: 0;
                    transform: scale(0.9) rotateX(-10deg);
                }
                to {
                    opacity: 1;
                    transform: scale(1) rotateX(0);
                }
            }
            
            .content.fullscreen-mode {
                animation: customDialogAppear ${this.customOptions.animationDuration}ms ease-out;
            }
        `;
        document.head.appendChild(style);
    }
}
```

### 独显模式模板

```javascript
// 独显模式模板系统
class FullscreenModeTemplateManager {
    constructor() {
        this.templates = new Map();
        this.registerDefaultTemplates();
    }
    
    /**
     * 注册默认模板
     */
    registerDefaultTemplates() {
        // 网格布局模板
        this.registerTemplate('grid', `
            <div class="fullscreen-grid-layout">
                <div class="grid-item" data-action="import-direct">
                    <div class="grid-icon">📥</div>
                    <div class="grid-label">直接导入</div>
                </div>
                <div class="grid-item" data-action="import-project-adjacent">
                    <div class="grid-icon">📁</div>
                    <div class="grid-label">项目旁复制</div>
                </div>
                <div class="grid-item" data-action="import-custom-folder">
                    <div class="grid-icon">📂</div>
                    <div class="grid-label">指定文件夹</div>
                </div>
            </div>
        `);
        
        // 列表布局模板
        this.registerTemplate('list', `
            <div class="fullscreen-list-layout">
                <div class="list-item" data-action="import-direct">
                    <div class="list-icon">📥</div>
                    <div class="list-content">
                        <div class="list-title">直接导入</div>
                        <div class="list-description">从源目录直接导入到AE项目，不复制文件</div>
                    </div>
                </div>
                <div class="list-item" data-action="import-project-adjacent">
                    <div class="list-icon">📁</div>
                    <div class="list-content">
                        <div class="list-title">项目旁复制</div>
                        <div class="list-description">复制文件到AE项目文件旁边后导入</div>
                    </div>
                </div>
                <div class="list-item" data-action="import-custom-folder">
                    <div class="list-icon">📂</div>
                    <div class="list-content">
                        <div class="list-title">指定文件夹</div>
                        <div class="list-description">复制文件到指定文件夹后导入</div>
                    </div>
                </div>
            </div>
        `);
    }
    
    /**
     * 注册自定义模板
     * @param {string} name - 模板名称
     * @param {string} template - 模板HTML
     */
    registerTemplate(name, template) {
        this.templates.set(name, template);
        this.log(`📱 已注册独显模式模板: ${name}`, 'debug');
    }
    
    /**
     * 应用模板
     * @param {string} templateName - 模板名称
     */
    applyTemplate(templateName) {
        const template = this.templates.get(templateName);
        if (!template) {
            this.log(`📱 未找到独显模式模板: ${templateName}`, 'warning');
            return;
        }
        
        const importModeSection = document.querySelector('#import-mode-section');
        if (importModeSection) {
            importModeSection.innerHTML = template;
            importModeSection.classList.add(`template-${templateName}`);
            
            // 绑定模板事件
            this.bindTemplateEvents(templateName);
            
            this.log(`📱 已应用独显模式模板: ${templateName}`, 'info');
        }
    }
    
    /**
     * 绑定模板事件
     * @param {string} templateName - 模板名称
     */
    bindTemplateEvents(templateName) {
        const importModeSection = document.querySelector('#import-mode-section');
        if (!importModeSection) return;
        
        // 根据模板类型绑定不同的事件
        switch (templateName) {
            case 'grid':
                this.bindGridEvents(importModeSection);
                break;
            case 'list':
                this.bindListEvents(importModeSection);
                break;
            default:
                // 默认事件绑定
                this.bindDefaultEvents(importModeSection);
        }
    }
    
    /**
     * 绑定网格事件
     * @param {HTMLElement} container - 容器元素
     */
    bindGridEvents(container) {
        const gridItems = container.querySelectorAll('.grid-item');
        gridItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.dataset.action;
                this.handleGridItemClick(action, e);
            });
        });
    }
    
    /**
     * 处理网格项点击
     * @param {string} action - 动作类型
     * @param {Event} event - 点击事件
     */
    handleGridItemClick(action, event) {
        event.preventDefault();
        event.stopPropagation();
        
        switch (action) {
            case 'import-direct':
                this.handleImportModeChange('direct');
                break;
            case 'import-project-adjacent':
                this.handleImportModeChange('project_adjacent');
                break;
            case 'import-custom-folder':
                this.handleImportModeChange('custom_folder');
                break;
            default:
                this.log(`📱 未知动作: ${action}`, 'warning');
        }
    }
}
```