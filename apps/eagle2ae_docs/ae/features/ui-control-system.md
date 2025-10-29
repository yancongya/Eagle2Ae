# UI 控制系统

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了强大的UI控制系统，允许用户完全自定义界面布局和组件显示。该系统支持主题切换、语言切换、组件显示控制等功能，为用户提供个性化的操作体验。

## 核心特性

### 主题切换
- 支持暗色和亮色两种主题模式
- 主题切换即时生效，无需重启应用
- 支持系统主题自动跟随（Windows/macOS）

### 语言切换
- 支持中英文动态切换
- 切换后界面文字即时更新
- 保存语言偏好设置

### 组件显示控制
- 可控制主面板各组件的显示/隐藏
- 支持独显模式（专注模式）
- 自定义面板布局配置

### 响应式设计
- 适配不同屏幕尺寸
- 支持窗口大小调整
- 优化移动端显示效果

## 使用指南

### 主题切换

#### 手动切换主题
1. 点击面板右上角的"主题切换"按钮（☀️/🌙图标）
2. 点击后主题将在暗色和亮色之间切换
3. 主题设置将自动保存并在下次启动时应用

#### 跟随系统主题
1. 在高级设置中找到"主题设置"选项
2. 选择"跟随系统"选项
3. 系统主题变化时，扩展将自动切换对应主题

### 语言切换

#### 切换界面语言
1. 点击面板右上角的"语言切换"按钮（🌐图标）
2. 点击后语言将在中文和英文之间切换
3. 界面文字将即时更新为所选语言

#### 语言设置保存
- 语言偏好将自动保存到面板配置中
- 每个面板实例可设置不同的语言偏好
- 支持在预设文件中导出/导入语言设置

### 组件显示控制

#### 控制组件显示
1. 进入 `高级设置` > `UI 设置`
2. 可控制以下组件的显示：
   - 主题切换按钮
   - 语言切换按钮
   - 日志按钮
   - 项目信息面板
   - 日志面板
   - 标题栏
   - 独显模式（占满）

#### 独显模式（专注模式）
1. 在UI设置中启用"占满"选项
2. 启用后，导入模式面板将占据整个窗口
3. 提供沉浸式的操作体验
4. 适合需要专注操作的场景

#### 自定义布局
1. 通过UI设置面板，可以自定义各组件的显示状态
2. 配置将自动保存并在下次启动时应用
3. 支持在预设文件中导出/导入布局配置

## 技术实现

### 主题系统实现

```javascript
/**
 * 应用主题设置
 * @param {string} theme - 'dark' 或 'light'
 */
applyTheme(theme) {
    const root = document.documentElement;
    const btn = document.getElementById('theme-toggle-btn');
    const iconSpan = btn ? btn.querySelector('.icon') : null;
    const isLight = theme === 'light';

    // 切换CSS类
    root.classList.toggle('theme-light', isLight);
    
    // 保存到localStorage
    try { 
        this.setPanelLocalStorage('aeTheme', isLight ? 'light' : 'dark'); 
    } catch (_) { }

    // 更新按钮状态
    if (btn) {
        btn.setAttribute('aria-pressed', String(isLight));
        btn.title = isLight ? '切换为暗色模式' : '切换为亮色模式';
        if (iconSpan) iconSpan.textContent = isLight ? '☀️' : '🌙';
    }
}

/**
 * 切换主题
 */
toggleTheme() {
    const current = this.getPanelLocalStorage('aeTheme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
}
```

### 语言系统实现

```javascript
/**
 * 切换语言
 */
toggleLanguage() {
    const currentLang = this.getCurrentLanguage();
    const nextLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    
    // 更新语言设置
    this.updateLanguage(nextLang);
    
    // 保存设置
    try {
        this.setPanelLocalStorage('language', nextLang);
        this.setPanelLocalStorage('lang', nextLang);
    } catch (e) {
        console.warn('无法保存语言设置:', e);
    }
    
    // 更新UI文本
    if (this.i18n && typeof this.i18n.updatePageTexts === 'function') {
        this.i18n.updatePageTexts();
    }
}
```

### UI组件控制实现

```javascript
/**
 * UI 设置状态（默认全部启用）
 */
const uiSettings = {
    theme: true,
    language: true,
    log: true,
    projectInfo: true,
    logPanel: true,
    header: true,
    fullscreen: false
};

/**
 * 应用 UI 设置到主面板元素
 */
function applyUISettings() {
    // 主题按钮
    if (mainPanelElements.theme) {
        mainPanelElements.theme.style.display = uiSettings.theme ? '' : 'none';
    }

    // 语言按钮
    if (mainPanelElements.language) {
        mainPanelElements.language.style.display = uiSettings.language ? '' : 'none';
    }

    // 日志按钮
    if (mainPanelElements.log) {
        mainPanelElements.log.style.display = uiSettings.log ? '' : 'none';
    }

    // 项目信息面板
    if (mainPanelElements.projectInfo) {
        mainPanelElements.projectInfo.style.display = uiSettings.projectInfo ? '' : 'none';
    }

    // 日志面板
    if (mainPanelElements.logPanel) {
        mainPanelElements.logPanel.style.display = uiSettings.logPanel ? '' : 'none';
    }
    
    if (statusInfoSection) {
        statusInfoSection.style.display = uiSettings.logPanel ? '' : 'none';
    }

    // 标题栏
    if (mainPanelElements.header) {
        if (uiSettings.header) {
            // 启用状态：显示标题栏
            mainPanelElements.header.classList.remove('collapsed');
            if (headerHoverTrigger) {
                headerHoverTrigger.classList.remove('active');
            }
        } else {
            // 禁用状态：折叠标题栏
            mainPanelElements.header.classList.add('collapsed');
            if (headerHoverTrigger) {
                headerHoverTrigger.classList.add('active');
            }
        }
        // 调整内容区域的间距
        if (window.adjustContentOffset) {
            setTimeout(() => window.adjustContentOffset(), 50);
        }
    }

    // 独显模式（占满）
    if (contentContainer) {
        if (uiSettings.fullscreen) {
            contentContainer.classList.add('fullscreen-mode');
        } else {
            contentContainer.classList.remove('fullscreen-mode');
        }
    }
}
```

## 样式系统

### CSS主题变量

```css
/* 暗色主题变量 */
:root {
    --bg-color: #383838;
    --panel-bg: #2a2a2a;
    --text-color: #e0e0e0;
    --border-color: #555;
    --primary-color: #3498db;
    --success-color: #27ae60;
    --warning-color: #f39c12;
    --error-color: #e74c3c;
}

/* 亮色主题变量 */
:root.theme-light {
    --bg-color: #f5f5f7;
    --panel-bg: #ffffff;
    --text-color: #222;
    --border-color: #ddd;
    --primary-color: #3498db;
    --success-color: #27ae60;
    --warning-color: #f39c12;
    --error-color: #e74c3c;
}
```

### 响应式设计

```css
/* 响应式断点 */
@media (max-width: 768px) {
    .header {
        gap: 8px;
        padding: 12px;
    }
    
    .title {
        gap: 8px;
        font-size: 15px;
    }
    
    .title-logo {
        width: clamp(20px, 5vw, 32px);
        height: clamp(20px, 5vw, 32px);
    }
}

@media (max-width: 480px) {
    .header {
        gap: 6px;
        padding: 10px;
    }
    
    .title {
        gap: 6px;
        font-size: 14px;
    }
    
    .title-logo {
        width: 24px;
        height: 24px;
    }
}

/* 极限尺寸适配 */
@media (max-width: 360px) {
    .header {
        gap: 4px;
        padding: 8px;
    }
    
    .title-text {
        display: none;
    }
    
    .title-logo {
        width: 22px;
        height: 22px;
    }
}
```

## 最佳实践

### 主题设计建议

1. **色彩对比度**
   - 确保文本与背景有足够的对比度
   - 遵循WCAG 2.0 AA级标准
   - 考虑色盲用户的使用体验

2. **一致性原则**
   - 保持主题切换前后UI元素的一致性
   - 确保所有组件都能正确应用主题样式
   - 避免主题切换导致的布局错乱

### 语言本地化建议

1. **文本长度适配**
   - 考虑不同语言的文本长度差异
   - 为长文本预留足够的显示空间
   - 使用弹性布局适应不同语言

2. **文化适配**
   - 考虑不同文化的使用习惯
   - 遵循当地的时间、日期、数字格式
   - 注意图标和颜色的文化含义

### UI组件控制建议

1. **用户体验优先**
   - 不要隐藏用户常用的功能组件
   - 提供清晰的组件显示/隐藏指引
   - 保存用户的组件显示偏好

2. **性能优化**
   - 隐藏组件时彻底移除DOM元素
   - 避免隐藏组件的后台计算消耗
   - 合理使用CSS display和visibility属性

## 故障排除

### 常见问题

1. **主题切换失效**
   - 症状：点击主题按钮无反应
   - 解决：检查localStorage权限，重启AE

2. **语言切换异常**
   - 症状：语言切换后部分文本未更新
   - 解决：手动调用i18n.updatePageTexts()方法

3. **组件显示控制失效**
   - 症状：设置组件显示/隐藏后无效果
   - 解决：检查CSS选择器优先级，强制刷新样式

### 性能优化

1. **减少重绘**
   - 使用CSS transform代替改变布局属性
   - 批量处理DOM操作
   - 使用requestAnimationFrame优化动画

2. **内存管理**
   - 及时清理事件监听器
   - 避免内存泄漏
   - 定期进行垃圾回收