# 主题切换功能

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了强大的主题切换功能，支持暗色和亮色两种主题模式，为用户提供了更加舒适的视觉体验。该功能具有即时生效、系统跟随、个性化配置等特点。

## 核心特性

### 双主题支持
- 支持暗色主题（Dark Theme）和亮色主题（Light Theme）
- 主题切换即时生效，无需重启应用
- 提供一致的视觉设计和用户体验

### 系统主题跟随
- 支持自动跟随操作系统主题设置
- Windows和macOS系统主题自动识别
- 实时响应系统主题变化

### 个性化配置
- 每个面板实例可设置独立的主题偏好
- 支持主题设置的导出和导入
- 自动保存用户主题选择

### 多面板支持
- 不同面板实例可设置不同主题
- 支持面板间主题配置隔离
- 提供统一的主题管理机制

## 使用指南

### 基本操作

#### 切换主题模式
1. 在扩展面板右上角找到主题切换按钮（🌙/☀️图标）
2. 点击按钮，主题将在暗色和亮色之间切换
3. 界面样式将即时更新为所选主题

#### 跟随系统主题
1. 进入 `高级设置` > `主题设置`
2. 选择 `跟随系统` 选项
3. 系统主题变化时，扩展将自动切换对应主题

#### 主题设置保存
- 主题偏好将自动保存到面板配置中
- 每个面板实例拥有独立的主题设置
- 支持通过预设文件导出/导入主题配置

### 高级功能

#### 面板特定主题设置
```javascript
// 为不同面板设置不同主题
// 面板1: 暗色主题
localStorage.setItem('panel1_aeTheme', 'dark');

// 面板2: 亮色主题
localStorage.setItem('panel2_aeTheme', 'light');
```

#### 批量主题设置
```javascript
// 为所有面板设置统一主题
const allPanels = ['panel1', 'panel2', 'panel3'];
allPanels.forEach(panelId => {
    localStorage.setItem(`${panelId}_aeTheme`, 'dark');
});
```

## 技术实现

### 主题切换机制

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
    --shadow-color: rgba(0, 0, 0, 0.3);
    --hover-color: rgba(255, 255, 255, 0.1);
    --active-color: rgba(255, 255, 255, 0.2);
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
    --shadow-color: rgba(0, 0, 0, 0.1);
    --hover-color: rgba(0, 0, 0, 0.05);
    --active-color: rgba(0, 0, 0, 0.1);
}

/* 基础样式 */
body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.panel {
    background-color: var(--panel-bg);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 8px var(--shadow-color);
    transition: all 0.3s ease;
}

/* 按钮样式 */
.btn {
    background-color: var(--panel-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    transition: all 0.2s ease;
}

.btn:hover {
    background-color: var(--hover-color);
    border-color: var(--primary-color);
}

.btn:active {
    background-color: var(--active-color);
}

/* 输入框样式 */
.input {
    background-color: var(--panel-bg);
    color: var(--text-color);
    border: 1px solid var(--border-color);
}

.input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}
```

### 主题配置管理

```javascript
/**
 * 主题配置管理器
 */
class ThemeManager {
    constructor(panelId) {
        this.panelId = panelId;
        this.init();
    }
    
    /**
     * 初始化主题管理器
     */
    init() {
        // 绑定系统主题变化事件
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                this.handleSystemThemeChange(e.matches ? 'dark' : 'light');
            });
        }
        
        // 应用初始主题
        this.applyInitialTheme();
    }
    
    /**
     * 应用初始主题
     */
    applyInitialTheme() {
        // 检查是否有面板特定的主题设置
        const panelTheme = this.getPanelThemeSetting();
        if (panelTheme) {
            this.applyTheme(panelTheme);
            return;
        }
        
        // 检查是否有全局主题设置
        const globalTheme = localStorage.getItem('aeTheme');
        if (globalTheme) {
            this.applyTheme(globalTheme);
            return;
        }
        
        // 检查是否设置为跟随系统
        const followSystem = localStorage.getItem('themeFollowSystem') === 'true';
        if (followSystem) {
            this.followSystemTheme();
            return;
        }
        
        // 默认使用暗色主题
        this.applyTheme('dark');
    }
    
    /**
     * 获取面板特定的主题设置
     * @returns {string|null} 主题设置
     */
    getPanelThemeSetting() {
        return localStorage.getItem(this.getPanelThemeKey('aeTheme'));
    }
    
    /**
     * 获取面板特定的主题设置键
     * @param {string} key - 原始键名
     * @returns {string} 面板特定的键名
     */
    getPanelThemeKey(key) {
        return `${this.panelId}_${key}`;
    }
    
    /**
     * 应用主题
     * @param {string} theme - 'dark' 或 'light'
     */
    applyTheme(theme) {
        const root = document.documentElement;
        const isLight = theme === 'light';
        
        // 切换CSS类
        root.classList.toggle('theme-light', isLight);
        
        // 保存到localStorage
        try {
            this.setPanelLocalStorage('aeTheme', theme);
            localStorage.setItem('themeFollowSystem', 'false');
        } catch (e) {
            console.warn('无法保存主题设置:', e);
        }
        
        // 更新UI
        this.updateThemeUI(theme);
    }
    
    /**
     * 更新主题UI
     * @param {string} theme - 'dark' 或 'light'
     */
    updateThemeUI(theme) {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            const iconSpan = themeBtn.querySelector('.icon');
            const isLight = theme === 'light';
            
            themeBtn.setAttribute('aria-pressed', String(isLight));
            themeBtn.title = isLight ? '切换为暗色模式' : '切换为亮色模式';
            if (iconSpan) iconSpan.textContent = isLight ? '☀️' : '🌙';
        }
    }
    
    /**
     * 跟随系统主题
     */
    followSystemTheme() {
        if (window.matchMedia) {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = systemPrefersDark ? 'dark' : 'light';
            this.applyTheme(systemTheme);
            
            // 标记为跟随系统
            try {
                localStorage.setItem('themeFollowSystem', 'true');
            } catch (e) {
                console.warn('无法保存跟随系统设置:', e);
            }
        }
    }
    
    /**
     * 处理系统主题变化
     * @param {string} systemTheme - 系统主题
     */
    handleSystemThemeChange(systemTheme) {
        // 只有在设置为跟随系统时才自动切换
        const followSystem = localStorage.getItem('themeFollowSystem') === 'true';
        if (followSystem) {
            this.applyTheme(systemTheme);
        }
    }
}
```

### 主题导出导入

```javascript
/**
 * 主题导出导入功能
 */
class ThemeExportImport {
    /**
     * 导出主题配置
     * @param {string} panelId - 面板ID
     * @returns {Object} 主题配置对象
     */
    static exportThemeConfig(panelId) {
        const themeKey = `${panelId}_aeTheme`;
        const followSystemKey = `${panelId}_themeFollowSystem`;
        
        return {
            aeTheme: localStorage.getItem(themeKey),
            themeFollowSystem: localStorage.getItem(followSystemKey),
            exportedAt: new Date().toISOString(),
            panelId: panelId
        };
    }
    
    /**
     * 导入主题配置
     * @param {Object} config - 主题配置对象
     */
    static importThemeConfig(config) {
        if (!config || !config.panelId) {
            throw new Error('无效的主题配置');
        }
        
        const themeKey = `${config.panelId}_aeTheme`;
        const followSystemKey = `${config.panelId}_themeFollowSystem`;
        
        if (config.aeTheme) {
            localStorage.setItem(themeKey, config.aeTheme);
        }
        
        if (config.themeFollowSystem !== undefined) {
            localStorage.setItem(followSystemKey, config.themeFollowSystem);
        }
    }
}
```

## 样式系统

### 响应式主题设计

```css
/* 响应式主题适配 */
@media (max-width: 768px) {
    :root {
        /* 移动端优化的暗色主题 */
        --bg-color: #2a2a2a;
        --panel-bg: #1e1e1e;
        --text-color: #f0f0f0;
    }
    
    :root.theme-light {
        /* 移动端优化的亮色主题 */
        --bg-color: #f0f0f2;
        --panel-bg: #ffffff;
        --text-color: #111;
    }
}

@media (max-width: 480px) {
    :root {
        /* 小屏设备优化 */
        --bg-color: #252525;
        --panel-bg: #1a1a1a;
    }
    
    :root.theme-light {
        /* 小屏设备优化 */
        --bg-color: #e8e8ea;
        --panel-bg: #fafafa;
    }
}

/* 高对比度主题支持 */
@media (prefers-contrast: high) {
    :root {
        --border-color: #666;
        --shadow-color: rgba(0, 0, 0, 0.5);
    }
    
    :root.theme-light {
        --border-color: #999;
        --shadow-color: rgba(0, 0, 0, 0.3);
    }
}

/* 减少动画偏好支持 */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

### 主题变量层次结构

```css
/* 基础颜色变量 */
:root {
    /* 主色调 */
    --primary-50: #e3f2fd;
    --primary-100: #bbdefb;
    --primary-200: #90caf9;
    --primary-300: #64b5f6;
    --primary-400: #42a5f5;
    --primary-500: #2196f3;
    --primary-600: #1e88e5;
    --primary-700: #1976d2;
    --primary-800: #1565c0;
    --primary-900: #0d47a1;
    
    /* 成功色 */
    --success-50: #e8f5e9;
    --success-100: #c8e6c9;
    --success-200: #a5d6a7;
    --success-300: #81c784;
    --success-400: #66bb6a;
    --success-500: #4caf50;
    --success-600: #43a047;
    --success-700: #388e3c;
    --success-800: #2e7d32;
    --success-900: #1b5e20;
    
    /* 警告色 */
    --warning-50: #fff8e1;
    --warning-100: #ffecb3;
    --warning-200: #ffe082;
    --warning-300: #ffd54f;
    --warning-400: #ffca28;
    --warning-500: #ffc107;
    --warning-600: #ffb300;
    --warning-700: #ffa000;
    --warning-800: #ff8f00;
    --warning-900: #ff6f00;
    
    /* 错误色 */
    --error-50: #ffebee;
    --error-100: #ffcdd2;
    --error-200: #ef9a9a;
    --error-300: #e57373;
    --error-400: #ef5350;
    --error-500: #f44336;
    --error-600: #e53935;
    --error-700: #d32f2f;
    --error-800: #c62828;
    --error-900: #b71c1c;
    
    /* 中性色 */
    --gray-50: #fafafa;
    --gray-100: #f5f5f5;
    --gray-200: #eeeeee;
    --gray-300: #e0e0e0;
    --gray-400: #bdbdbd;
    --gray-500: #9e9e9e;
    --gray-600: #757575;
    --gray-700: #616161;
    --gray-800: #424242;
    --gray-900: #212121;
}

/* 亮色主题变量 */
:root.theme-light {
    /* 主色调 */
    --primary-50: #e3f2fd;
    --primary-100: #bbdefb;
    --primary-200: #90caf9;
    --primary-300: #64b5f6;
    --primary-400: #42a5f5;
    --primary-500: #2196f3;
    --primary-600: #1e88e5;
    --primary-700: #1976d2;
    --primary-800: #1565c0;
    --primary-900: #0d47a1;
    
    /* 成功色 */
    --success-50: #e8f5e9;
    --success-100: #c8e6c9;
    --success-200: #a5d6a7;
    --success-300: #81c784;
    --success-400: #66bb6a;
    --success-500: #4caf50;
    --success-600: #43a047;
    --success-700: #388e3c;
    --success-800: #2e7d32;
    --success-900: #1b5e20;
    
    /* 警告色 */
    --warning-50: #fff8e1;
    --warning-100: #ffecb3;
    --warning-200: #ffe082;
    --warning-300: #ffd54f;
    --warning-400: #ffca28;
    --warning-500: #ffc107;
    --warning-600: #ffb300;
    --warning-700: #ffa000;
    --warning-800: #ff8f00;
    --warning-900: #ff6f00;
    
    /* 错误色 */
    --error-50: #ffebee;
    --error-100: #ffcdd2;
    --error-200: #ef9a9a;
    --error-300: #e57373;
    --error-400: #ef5350;
    --error-500: #f44336;
    --error-600: #e53935;
    --error-700: #d32f2f;
    --error-800: #c62828;
    --error-900: #b71c1c;
    
    /* 中性色 */
    --gray-50: #fafafa;
    --gray-100: #f5f5f5;
    --gray-200: #eeeeee;
    --gray-300: #e0e0e0;
    --gray-400: #bdbdbd;
    --gray-500: #9e9e9e;
    --gray-600: #757575;
    --gray-700: #616161;
    --gray-800: #424242;
    --gray-900: #212121;
}
```

## 最佳实践

### 使用建议

1. **个性化主题配置**
   ```javascript
   // 为不同用途的面板设置不同主题
   // 设计工作面板使用暗色主题（减少眼部疲劳）
   localStorage.setItem('panel1_aeTheme', 'dark');
   
   // 客户演示面板使用亮色主题（更适合投影）
   localStorage.setItem('panel2_aeTheme', 'light');
   ```

2. **团队主题标准化**
   ```javascript
   // 创建团队标准主题配置
   const teamThemeConfig = {
       aeTheme: 'dark',
       themeFollowSystem: 'false'
   };
   
   // 导出团队标准配置供其他成员使用
   exportToFile(teamThemeConfig, 'TeamStandardTheme.Config');
   ```

3. **多环境适配**
   ```javascript
   // 根据工作环境设置不同主题
   function setEnvironmentTheme() {
       // 检查是否为演示环境
       if (window.location.hostname === 'demo.eagle2ae.com') {
           // 演示环境使用亮色主题
           themeManager.applyTheme('light');
       } else {
           // 生产环境使用暗色主题
           themeManager.applyTheme('dark');
       }
   }
   ```

### 性能优化

1. **CSS变量优化**
   ```css
   /* 使用CSS变量减少重复定义 */
   .button {
       background-color: var(--panel-bg);
       color: var(--text-color);
       border: 1px solid var(--border-color);
       transition: background-color 0.2s ease, border-color 0.2s ease;
   }
   
   .button:hover {
       background-color: var(--hover-color);
       border-color: var(--primary-color);
   }
   
   /* 避免在主题切换时重排 */
   .container {
       background-color: var(--bg-color);
       /* 使用transform而不是改变布局属性 */
       transition: background-color 0.3s ease;
   }
   ```

2. **主题状态缓存**
   ```javascript
   // 缓存主题状态避免重复计算
   class CachedThemeManager extends ThemeManager {
       constructor(panelId) {
           super(panelId);
           this.themeCache = new Map();
       }
       
       applyTheme(theme) {
           const cacheKey = `theme_${theme}`;
           
           // 检查缓存
           if (this.themeCache.has(cacheKey)) {
               const cachedStyles = this.themeCache.get(cacheKey);
               this.applyCachedStyles(cachedStyles);
               return;
           }
           
           // 应用主题并缓存
           super.applyTheme(theme);
           
           // 缓存当前主题样式
           const currentStyles = this.getCurrentThemeStyles();
           this.themeCache.set(cacheKey, currentStyles);
       }
   }
   ```

## 故障排除

### 常见问题

1. **主题切换后样式未完全更新**
   - 症状：点击主题按钮后部分元素仍显示旧主题样式
   - 解决：检查CSS选择器优先级，确保主题类正确应用

2. **系统主题跟随失效**
   - 症状：设置跟随系统后主题未自动切换
   - 解决：检查系统主题监听器是否正确绑定，验证媒体查询支持

3. **主题设置未保存**
   - 症状：重启后主题设置重置为默认值
   - 解决：检查localStorage权限，验证设置保存逻辑

### 调试技巧

1. **启用主题调试**
   ```javascript
   // 在控制台中启用主题调试日志
   localStorage.setItem('debugLogLevel', '0');
   ```

2. **监控主题变更**
   ```javascript
   // 监听主题变更事件
   const themeObserver = new MutationObserver((mutations) => {
       mutations.forEach((mutation) => {
           if (mutation.type === 'attributes' && 
               mutation.attributeName === 'class') {
               const hasLightTheme = document.documentElement.classList.contains('theme-light');
               console.log('主题已变更:', hasLightTheme ? '亮色' : '暗色');
           }
       });
   });
   
   themeObserver.observe(document.documentElement, {
       attributes: true,
       attributeFilter: ['class']
   });
   ```

3. **检查CSS变量**
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

## 扩展性

### 自定义主题包

```javascript
// 添加自定义主题包支持
class CustomThemeProvider {
    constructor() {
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
const themeProvider = new CustomThemeProvider();

// 注册自定义主题
themeProvider.registerCustomTheme('ocean', {
    'bg-color': '#001f3f',
    'panel-bg': '#001122',
    'text-color': '#7fdbff',
    'border-color': '#0074d9',
    'primary-color': '#0074d9',
    'success-color': '#2ecc40',
    'warning-color': '#ffdc00',
    'error-color': '#ff4136'
});

// 应用自定义主题
themeProvider.applyCustomTheme('ocean');
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