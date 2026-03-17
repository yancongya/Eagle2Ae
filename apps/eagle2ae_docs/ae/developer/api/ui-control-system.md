# UI 控制系统

## 概述

UI 控制系统（UI Control System）是 Eagle2Ae AE 扩展 v2.4.0 引入的重要功能模块，它提供了全面的界面自定义能力，包括主题切换、语言切换、组件显示控制、独显模式等。该系统让用户能够完全掌控扩展界面的外观和布局，创建个性化的操作环境。

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

### 性能优化
- 使用CSS变量和类切换优化性能
- 避免不必要的重绘和重排
- 实现高效的事件处理

## 技术实现

### 核心类结构

```javascript
/**
 * UI 控制系统
 * 负责管理扩展界面的外观、布局和交互
 */
class UIControlSystem {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            enabled: true,
            theme: 'dark', // 'dark' | 'light'
            language: 'zh-CN', // 'zh-CN' | 'en-US'
            autoFollowSystemTheme: false,
            ...options
        };

        // 初始化状态
        this.currentTheme = this.options.theme;
        this.currentLanguage = this.options.language;
        this.uiSettings = this.getDefaultUISettings();
        this.eventListeners = new Map();

        // 绑定方法上下文
        this.applyTheme = this.applyTheme.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
        this.applyLanguage = this.applyLanguage.bind(this);
        this.toggleLanguage = this.toggleLanguage.bind(this);
        this.updateUISettings = this.updateUISettings.bind(this);
        this.applyUISettings = this.applyUISettings.bind(this);

        this.log('🎨 UI 控制系统已初始化', 'debug');
    }
}
```

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
    
    this.currentTheme = theme;
    this.log(`🎨 主题已切换为: ${theme}`, 'debug');
}

/**
 * 切换主题
 */
toggleTheme() {
    const current = this.getPanelLocalStorage('aeTheme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
}

/**
 * 跟随系统主题
 */
followSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme)').matches) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        this.applyTheme(systemTheme);
    }
}
```

### 语言系统实现

```javascript
/**
 * 应用语言设置
 * @param {string} language - 'zh-CN' 或 'en-US'
 */
applyLanguage(language) {
    try {
        // 更新语言设置
        this.currentLanguage = language;
        
        // 保存到localStorage
        try {
            this.setPanelLocalStorage('language', language);
            this.setPanelLocalStorage('lang', language);
        } catch (e) {
            console.warn('无法保存语言设置:', e);
        }
        
        // 更新UI文本
        if (window.i18n && typeof window.i18n.updatePageTexts === 'function') {
            window.i18n.updatePageTexts();
        }
        
        // 更新语言切换按钮
        const langBtn = document.getElementById('language-toggle-btn');
        if (langBtn) {
            const iconSpan = langBtn.querySelector('.icon');
            const isEn = language === 'en-US';
            langBtn.setAttribute('aria-pressed', String(isEn));
            langBtn.title = isEn ? 'Switch to Chinese' : '切换为英文';
            if (iconSpan) iconSpan.textContent = isEn ? '🇨🇳' : '🌐';
        }
        
        this.log(`🌐 语言已切换为: ${language}`, 'debug');
        
    } catch (error) {
        this.log(`应用语言设置失败: ${error.message}`, 'error');
    }
}

/**
 * 切换语言
 */
toggleLanguage() {
    const currentLang = this.getCurrentLanguage();
    const nextLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    this.applyLanguage(nextLang);
}

/**
 * 获取当前语言设置
 * @returns {string} 语言代码
 */
getCurrentLanguage() {
    try {
        // 优先从面板特定设置获取
        const panelLang = this.getPanelLocalStorage('language');
        if (panelLang) return panelLang;
        
        // 回退到全局设置
        const globalLang = localStorage.getItem('language') || localStorage.getItem('lang');
        if (globalLang) return globalLang;
        
        // 默认返回中文
        return 'zh-CN';
    } catch (error) {
        return 'zh-CN';
    }
}
```

### UI 设置管理系统

```javascript
/**
 * 获取默认UI设置
 * @returns {Object} 默认UI设置
 */
getDefaultUISettings() {
    return {
        theme: true,        // 主题切换按钮
        language: true,     // 语言切换按钮
        log: true,          // 日志按钮
        projectInfo: true,  // 项目信息面板
        logPanel: true,     // 日志面板
        header: true,       // 标题栏
        fullscreen: false   // 独显模式（占满）
    };
}

/**
 * 更新UI设置
 * @param {Object} newSettings - 新的UI设置
 */
updateUISettings(newSettings) {
    this.uiSettings = { ...this.uiSettings, ...newSettings };
    
    // 保存到localStorage
    try {
        this.setPanelLocalStorage('uiSettings', JSON.stringify(this.uiSettings));
    } catch (error) {
        console.warn('无法保存UI设置:', error);
    }
    
    // 应用设置
    this.applyUISettings();
}

/**
 * 应用UI设置到主面板元素
 */
applyUISettings() {
    const settings = this.uiSettings;
    
    // 主题按钮
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.style.display = settings.theme ? '' : 'none';
    }

    // 语言按钮
    const langBtn = document.getElementById('language-toggle-btn');
    if (langBtn) {
        langBtn.style.display = settings.language ? '' : 'none';
    }

    // 日志按钮
    const logBtn = document.getElementById('log-panel-toggle');
    if (logBtn) {
        logBtn.style.display = settings.log ? '' : 'none';
    }

    // 项目信息面板
    const projectInfoPanel = document.getElementById('project-info-section');
    if (projectInfoPanel) {
        projectInfoPanel.style.display = settings.projectInfo ? '' : 'none';
    }

    // 日志面板
    const logPanel = document.getElementById('log-panel-section');
    if (logPanel) {
        logPanel.style.display = settings.logPanel ? '' : 'none';
    }
    
    const statusInfoSection = document.getElementById('status-info-section');
    if (statusInfoSection) {
        statusInfoSection.style.display = settings.logPanel ? '' : 'none';
    }

    // 标题栏
    const header = document.getElementById('main-header');
    if (header) {
        if (settings.header) {
            // 启用状态：显示标题栏
            header.classList.remove('collapsed');
            const headerHoverTrigger = document.getElementById('header-hover-trigger');
            if (headerHoverTrigger) {
                headerHoverTrigger.classList.remove('active');
            }
        } else {
            // 禁用状态：折叠标题栏
            header.classList.add('collapsed');
            const headerHoverTrigger = document.getElementById('header-hover-trigger');
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
    const contentContainer = document.querySelector('.content');
    if (contentContainer) {
        if (settings.fullscreen) {
            contentContainer.classList.add('fullscreen-mode');
        } else {
            contentContainer.classList.remove('fullscreen-mode');
        }
    }
}
```

### 响应式设计实现

```javascript
/**
 * 响应式UI设计实现
 */
class ResponsiveUIDesign {
    /**
     * 构造函数
     */
    constructor() {
        this.breakpoints = {
            xs: 360,   // 极小屏幕
            sm: 480,   // 小屏幕
            md: 768,   // 中等屏幕
            lg: 1024,  // 大屏幕
            xl: 1200   // 超大屏幕
        };
        
        this.init();
    }
    
    /**
     * 初始化响应式设计
     */
    init() {
        // 监听窗口大小变化
        window.addEventListener('resize', this.debounce(() => {
            this.handleResponsiveChange();
        }, 200));
        
        // 初始应用响应式设置
        this.handleResponsiveChange();
        
        this.log('📱 响应式UI设计已初始化', 'debug');
    }
    
    /**
     * 处理响应式变化
     */
    handleResponsiveChange() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // 根据屏幕尺寸应用不同的样式
        this.applyResponsiveStyles(screenWidth, screenHeight);
        
        // 更新按钮布局
        this.updateButtonLayout(screenWidth);
        
        // 调整内容区域
        this.adjustContentArea(screenWidth, screenHeight);
    }
    
    /**
     * 应用响应式样式
     * @param {number} width - 屏幕宽度
     * @param {number} height - 屏幕高度
     */
    applyResponsiveStyles(width, height) {
        const root = document.documentElement;
        
        // 移除所有响应式类
        Object.keys(this.breakpoints).forEach(bp => {
            root.classList.remove(`screen-${bp}`);
        });
        
        // 添加当前断点类
        if (width <= this.breakpoints.xs) {
            root.classList.add('screen-xs');
        } else if (width <= this.breakpoints.sm) {
            root.classList.add('screen-sm');
        } else if (width <= this.breakpoints.md) {
            root.classList.add('screen-md');
        } else if (width <= this.breakpoints.lg) {
            root.classList.add('screen-lg');
        } else {
            root.classList.add('screen-xl');
        }
        
        // 更新CSS变量
        root.style.setProperty('--screen-width', `${width}px`);
        root.style.setProperty('--screen-height', `${height}px`);
        
        this.log(`📱 屏幕尺寸: ${width}x${height}px`, 'debug');
    }
    
    /**
     * 更新按钮布局
     * @param {number} width - 屏幕宽度
     */
    updateButtonLayout(width) {
        const buttons = document.querySelectorAll('.icon-btn');
        
        if (width <= this.breakpoints.xs) {
            // 极小屏幕：只显示图标
            buttons.forEach(btn => {
                const textSpan = btn.querySelector('.text');
                if (textSpan) {
                    textSpan.style.display = 'none';
                }
                btn.style.minWidth = '28px';
                btn.style.padding = '4px 6px';
            });
        } else if (width <= this.breakpoints.sm) {
            // 小屏幕：显示简化文本
            buttons.forEach(btn => {
                const textSpan = btn.querySelector('.text');
                if (textSpan) {
                    textSpan.style.display = '';
                    // 简化文本内容
                    const originalText = textSpan.textContent;
                    const simplifiedText = this.simplifyButtonText(originalText);
                    textSpan.textContent = simplifiedText;
                }
                btn.style.minWidth = '32px';
                btn.style.padding = '5px 8px';
            });
        } else {
            // 正常屏幕：显示完整文本
            buttons.forEach(btn => {
                const textSpan = btn.querySelector('.text');
                if (textSpan) {
                    textSpan.style.display = '';
                    // 恢复原始文本
                    const originalText = btn.dataset.originalText || textSpan.textContent;
                    textSpan.textContent = originalText;
                }
                btn.style.minWidth = '';
                btn.style.padding = '';
            });
        }
    }
    
    /**
     * 简化按钮文本
     * @param {string} text - 原始文本
     * @returns {string} 简化后的文本
     */
    simplifyButtonText(text) {
        // 根据文本内容进行简化
        const simplifications = {
            '主题': '题',
            '语言': '语',
            '日志': '志',
            '设置': '设',
            '项目信息': '项目',
            '连接状态': '连接'
        };
        
        return simplifications[text] || text.substring(0, 2);
    }
    
    /**
     * 调整内容区域
     * @param {number} width - 屏幕宽度
     * @param {number} height - 屏幕高度
     */
    adjustContentArea(width, height) {
        const content = document.querySelector('.content');
        if (!content) return;
        
        // 根据屏幕尺寸调整内容区域样式
        if (width <= this.breakpoints.sm || height <= 480) {
            content.classList.add('compact-mode');
            this.log('📱 启用紧凑模式', 'debug');
        } else {
            content.classList.remove('compact-mode');
            this.log('📱 禁用紧凑模式', 'debug');
        }
        
        // 调整内容偏移
        if (window.adjustContentOffset) {
            window.adjustContentOffset();
        }
    }
    
    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
    debounce(func, wait) {
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
}
```

## API参考

### 构造函数

```javascript
/**
 * UI 控制系统构造函数
 * @param {Object} options - 配置选项
 * @param {boolean} options.enabled - 是否启用UI控制系统
 * @param {string} options.theme - 默认主题 ('dark' | 'light')
 * @param {string} options.language - 默认语言 ('zh-CN' | 'en-US')
 * @param {boolean} options.autoFollowSystemTheme - 是否自动跟随系统主题
 */
constructor(options = {})
```

### 核心方法

#### applyTheme()
应用主题设置

```javascript
/**
 * 应用主题设置
 * @param {string} theme - 主题模式 ('dark' | 'light')
 */
applyTheme(theme)
```

#### toggleTheme()
切换主题

```javascript
/**
 * 切换主题
 */
toggleTheme()
```

#### followSystemTheme()
跟随系统主题

```javascript
/**
 * 跟随系统主题
 */
followSystemTheme()
```

#### applyLanguage()
应用语言设置

```javascript
/**
 * 应用语言设置
 * @param {string} language - 语言代码 ('zh-CN' | 'en-US')
 */
applyLanguage(language)
```

#### toggleLanguage()
切换语言

```javascript
/**
 * 切换语言
 */
toggleLanguage()
```

#### getCurrentLanguage()
获取当前语言设置

```javascript
/**
 * 获取当前语言设置
 * @returns {string} 语言代码
 */
getCurrentLanguage()
```

#### updateUISettings()
更新UI设置

```javascript
/**
 * 更新UI设置
 * @param {Object} newSettings - 新的UI设置
 */
updateUISettings(newSettings)
```

#### applyUISettings()
应用UI设置到主面板元素

```javascript
/**
 * 应用UI设置到主面板元素
 */
applyUISettings()
```

#### getDefaultUISettings()
获取默认UI设置

```javascript
/**
 * 获取默认UI设置
 * @returns {Object} 默认UI设置
 */
getDefaultUISettings()
```

### 辅助方法

#### debounce()
防抖函数

```javascript
/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
debounce(func, wait)
```

#### simplifyButtonText()
简化按钮文本

```javascript
/**
 * 简化按钮文本
 * @param {string} text - 原始文本
 * @returns {string} 简化后的文本
 */
simplifyButtonText(text)
```

#### adjustContentArea()
调整内容区域

```javascript
/**
 * 调整内容区域
 * @param {number} width - 屏幕宽度
 * @param {number} height - 屏幕高度
 */
adjustContentArea(width, height)
```

#### updateButtonLayout()
更新按钮布局

```javascript
/**
 * 更新按钮布局
 * @param {number} width - 屏幕宽度
 */
updateButtonLayout(width)
```

#### applyResponsiveStyles()
应用响应式样式

```javascript
/**
 * 应用响应式样式
 * @param {number} width - 屏幕宽度
 * @param {number} height - 屏幕高度
 */
applyResponsiveStyles(width, height)
```

#### handleResponsiveChange()
处理响应式变化

```javascript
/**
 * 处理响应式变化
 */
handleResponsiveChange()
```

## 使用示例

### 基本使用

```javascript
// 创建UI控制系统实例
const uiControlSystem = new UIControlSystem({
    enabled: true,
    theme: 'dark',
    language: 'zh-CN',
    autoFollowSystemTheme: false
});

// 应用主题
uiControlSystem.applyTheme('light');

// 切换主题
uiControlSystem.toggleTheme();

// 应用语言
uiControlSystem.applyLanguage('en-US');

// 切换语言
uiControlSystem.toggleLanguage();

// 更新UI设置
uiControlSystem.updateUISettings({
    theme: true,
    language: true,
    log: false,
    projectInfo: true,
    logPanel: false,
    header: true,
    fullscreen: false
});

// 应用UI设置
uiControlSystem.applyUISettings();
```

### 高级使用

```javascript
// 响应式设计
const responsiveUIDesign = new ResponsiveUIDesign();

// 监听窗口大小变化
window.addEventListener('resize', responsiveUIDesign.debounce(() => {
    responsiveUIDesign.handleResponsiveChange();
}, 200));

// 手动触发响应式变化处理
responsiveUIDesign.handleResponsiveChange();

// 获取当前断点
const currentBreakpoint = responsiveUIDesign.getCurrentBreakpoint();
console.log(`当前断点: ${currentBreakpoint}`);

// 应用自定义断点
responsiveUIDesign.applyCustomBreakpoints({
    xs: 320,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280
});
```

### 主题切换

```javascript
// 手动切换主题
document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    uiControlSystem.toggleTheme();
});

// 跟随系统主题
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        if (uiControlSystem.options.autoFollowSystemTheme) {
            const systemTheme = e.matches ? 'dark' : 'light';
            uiControlSystem.applyTheme(systemTheme);
        }
    });
}

// 启用系统主题跟随
uiControlSystem.options.autoFollowSystemTheme = true;
uiControlSystem.followSystemTheme();
```

### 语言切换

```javascript
// 手动切换语言
document.getElementById('language-toggle-btn').addEventListener('click', () => {
    uiControlSystem.toggleLanguage();
});

// 监听语言变化
window.addEventListener('languagechange', (event) => {
    const newLanguage = event.detail.language;
    uiControlSystem.applyLanguage(newLanguage);
});

// 获取当前语言
const currentLanguage = uiControlSystem.getCurrentLanguage();
console.log(`当前语言: ${currentLanguage}`);

// 应用特定语言
uiControlSystem.applyLanguage('zh-CN');
```

### UI设置控制

```javascript
// 控制组件显示
uiControlSystem.updateUISettings({
    theme: false,        // 隐藏主题切换按钮
    language: false,     // 隐藏语言切换按钮
    log: true,          // 显示日志按钮
    projectInfo: false,  // 隐藏项目信息面板
    logPanel: true,     // 显示日志面板
    header: false,      // 隐藏标题栏
    fullscreen: true    // 启用独显模式
});

// 应用设置
uiControlSystem.applyUISettings();

// 保存设置到localStorage
localStorage.setItem('uiSettings', JSON.stringify(uiControlSystem.uiSettings));

// 从localStorage加载设置
const savedSettings = localStorage.getItem('uiSettings');
if (savedSettings) {
    uiControlSystem.updateUISettings(JSON.parse(savedSettings));
    uiControlSystem.applyUISettings();
}
```

## 最佳实践

### 性能优化

1. **合理使用CSS变量**
   ```css
   /* 使用CSS变量减少重复定义 */
   :root {
       --bg-color: #383838;
       --panel-bg: #2a2a2a;
       --text-color: #e0e0e0;
       --border-color: #555;
   }
   
   :root.theme-light {
       --bg-color: #f5f5f7;
       --panel-bg: #ffffff;
       --text-color: #222;
       --border-color: #ddd;
   }
   
   .panel {
       background-color: var(--panel-bg);
       color: var(--text-color);
       border: 1px solid var(--border-color);
   }
   ```

2. **避免不必要的重绘**
   ```javascript
   // 使用transform代替改变布局属性
   .button {
       transition: transform 0.2s ease;
   }
   
   .button:hover {
       transform: translateY(-1px);
   }
   
   // 批量处理DOM操作
   const fragment = document.createDocumentFragment();
   elements.forEach(element => {
       fragment.appendChild(element);
   });
   container.appendChild(fragment);
   ```

3. **使用防抖处理**
   ```javascript
   // 对于高频事件使用防抖
   window.addEventListener('resize', debounce(() => {
       uiControlSystem.handleResponsiveChange();
   }, 200));
   ```

### 用户体验优化

1. **渐进式增强**
   ```javascript
   // 从移动优先开始
   .responsive-element {
       width: 100%;
       padding: 10px;
   }
   
   /* 平板端增强 */
   @media (min-width: 768px) {
       .responsive-element {
           width: 50%;
           padding: 15px;
       }
   }
   
   /* 桌面端增强 */
   @media (min-width: 1024px) {
       .responsive-element {
           width: 33.33%;
           padding: 20px;
       }
   }
   ```

2. **视觉反馈**
   ```css
   /* 添加悬停和激活效果 */
   .button {
       transition: all 0.2s ease;
   }
   
   .button:hover {
       background: rgba(255, 255, 255, 0.1);
       transform: translateY(-1px);
   }
   
   .button:active {
       background: rgba(255, 255, 255, 0.2);
       transform: translateY(0);
   }
   ```

3. **可访问性**
   ```html
   <!-- 添加适当的ARIA属性 -->
   <button id="theme-toggle-btn" 
           aria-pressed="false" 
           title="切换主题">
       <span class="icon">🌙</span>
       <span class="text">主题</span>
   </button>
   
   <!-- 确保足够的对比度 -->
   .button {
       color: #e0e0e0;
       background: #3a3a3a;
   }
   ```

### 内存管理

1. **及时清理事件监听器**
   ```javascript
   // 在组件销毁时清理事件监听器
   class UIComponent {
       constructor() {
           this.eventListeners = new Map();
           this.init();
       }
       
       init() {
           const handler = this.handleClick.bind(this);
           const button = document.getElementById('my-button');
           
           button.addEventListener('click', handler);
           this.eventListeners.set('click', { element: button, handler });
       }
       
       destroy() {
           // 清理事件监听器
           this.eventListeners.forEach((listener, eventType) => {
               listener.element.removeEventListener(eventType, listener.handler);
           });
           
           this.eventListeners.clear();
       }
   }
   ```

2. **避免内存泄漏**
   ```javascript
   // 使用WeakMap存储DOM元素引用
   const elementData = new WeakMap();
   
   function attachData(element, data) {
       elementData.set(element, data);
   }
   
   function getData(element) {
       return elementData.get(element);
   }
   
   // 当DOM元素被移除时，WeakMap会自动清理对应的引用
   ```

## 故障排除

### 常见问题

#### 主题切换失效
- **症状**：点击主题按钮无反应
- **解决**：
  1. 检查localStorage权限
  2. 验证CSS类切换逻辑
  3. 重启AE

#### 语言切换异常
- **症状**：语言切换后部分文本未更新
- **解决**：
  1. 手动调用i18n.updatePageTexts()方法
  2. 检查翻译文件是否正确加载
  3. 验证语言代码是否正确

#### 组件显示控制失效
- **症状**：设置组件显示/隐藏后无效果
- **解决**：
  1. 检查CSS选择器优先级
  2. 验证localStorage保存逻辑
  3. 强制刷新样式

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控UI设置变化
uiControlSystem.addEventListener('uisettingschange', (event) => {
    console.log('UI设置已变更:', event.detail);
});
```

#### 检查CSS变量
```javascript
// 检查当前主题的CSS变量
function inspectThemeVariables() {
    const computedStyle = getComputedStyle(document.documentElement);
    console.log('背景色:', computedStyle.getPropertyValue('--bg-color'));
    console.log('面板背景色:', computedStyle.getPropertyValue('--panel-bg'));
    console.log('文字颜色:', computedStyle.getPropertyValue('--text-color'));
    console.log('边框颜色:', computedStyle.getPropertyValue('--border-color'));
}
```

#### 性能分析
```javascript
// 记录主题切换性能
const startTime = performance.now();
uiControlSystem.applyTheme('light');
const endTime = performance.now();
console.log(`主题切换耗时: ${endTime - startTime}ms`);
```

## 扩展性

### 自定义主题

```javascript
// 添加自定义主题支持
class CustomThemeManager extends UIControlSystem {
    constructor(options = {}) {
        super(options);
        this.customThemes = new Map();
    }
    
    /**
     * 注册自定义主题
     * @param {string} themeName - 主题名称
     * @param {Object} themeVars - 主题变量
     */
    registerCustomTheme(themeName, themeVars) {
        this.customThemes.set(themeName, themeVars);
        this.log(`注册自定义主题: ${themeName}`, 'debug');
    }
    
    /**
     * 应用自定义主题
     * @param {string} themeName - 主题名称
     */
    applyCustomTheme(themeName) {
        if (!this.customThemes.has(themeName)) {
            throw new Error(`未找到自定义主题: ${themeName}`);
        }
        
        const themeVars = this.customThemes.get(themeName);
        const root = document.documentElement;
        
        // 应用自定义主题变量
        Object.entries(themeVars).forEach(([varName, varValue]) => {
            root.style.setProperty(`--${varName}`, varValue);
        });
        
        // 保存主题名称
        try {
            localStorage.setItem('customTheme', themeName);
        } catch (e) {
            console.warn('无法保存自定义主题设置:', e);
        }
    }
}

// 使用示例
const themeManager = new CustomThemeManager();

// 注册自定义主题
themeManager.registerCustomTheme('ocean', {
    'bg-color': '#001f3f',
    'panel-bg': '#001122',
    'text-color': '#7fdbff',
    'border-color': '#0074d9'
});

// 应用自定义主题
themeManager.applyCustomTheme('ocean');
```

### 主题动画效果

```css
/* 添加主题切换动画 */
:root {
    --transition-duration: 0.3s;
    --transition-timing: ease;
}

* {
    transition: background-color var(--transition-duration) var(--transition-timing),
                color var(--transition-duration) var(--transition-timing),
                border-color var(--transition-duration) var(--transition-timing);
}

/* 为特定元素定制动画 */
.button {
    transition: background-color 0.2s ease,
                border-color 0.2s ease,
                transform 0.1s ease;
}

.button:hover {
    transform: translateY(-1px);
}

.button:active {
    transform: translateY(0);
}
```

### 响应式断点扩展

```javascript
// 扩展响应式断点
class ExtendedResponsiveDesign extends ResponsiveUIDesign {
    constructor() {
        super();
        this.breakpoints = {
            ...this.breakpoints,
            xxl: 1440,  // 超宽屏
            xxxl: 1920  // 4K屏
        };
    }
    
    /**
     * 获取自定义断点
     * @param {Object} customBreakpoints - 自定义断点
     */
    applyCustomBreakpoints(customBreakpoints) {
        this.breakpoints = { ...this.breakpoints, ...customBreakpoints };
        this.handleResponsiveChange();
    }
    
    /**
     * 获取当前断点
     * @returns {string} 当前断点名称
     */
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        
        const breakpoints = Object.entries(this.breakpoints)
            .sort((a, b) => a[1] - b[1]); // 按数值排序
            
        for (const [name, value] of breakpoints) {
            if (width <= value) {
                return name;
            }
        }
        
        // 如果屏幕宽度大于所有断点，返回最大断点
        return breakpoints[breakpoints.length - 1][0];
    }
}
```

通过以上的UI控制系统API文档，开发者可以全面了解如何使用和扩展Eagle2Ae AE扩展的UI控制功能，实现个性化的用户界面体验。