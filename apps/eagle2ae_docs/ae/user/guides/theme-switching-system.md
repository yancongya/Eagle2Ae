# 主题切换系统

## 概述

主题切换系统（Theme Switching System）是 Eagle2Ae AE 扩展 v2.4.0 引入的全新功能模块，支持暗色和亮色两种主题模式的动态切换。该系统提供了即时生效的主题变更、系统主题自动跟随、个性化配置保存等功能，为用户带来更加舒适和个性化的视觉体验。

## 核心特性

### 动态主题切换
- 支持暗色和亮色主题的实时切换
- 主题变更即时生效，无需重启应用
- 提供平滑的过渡动画效果

### 系统主题跟随
- 支持自动跟随操作系统主题设置
- 实时响应系统主题变化
- 提供手动和自动切换选项

### 个性化配置
- 每个面板实例可设置独立的主题偏好
- 支持主题配置的导出和导入
- 自动保存用户主题选择

### 响应式设计
- 适配不同屏幕尺寸和分辨率
- 支持高DPI显示器优化
- 提供移动端优化主题

### 可扩展架构
- 支持自定义主题包
- 提供主题变量系统
- 支持主题插件化扩展

## 技术实现

### 核心类结构

```javascript
/**
 * 主题切换系统
 * 负责管理扩展界面的主题切换，支持暗色和亮色模式动态切换
 */
class ThemeSwitchingSystem {
    /**
     * 构造函数
     * @param {Object} aeExtension - AE扩展实例
     */
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.csInterface = aeExtension.csInterface;
        this.settingsManager = aeExtension.settingsManager;
        this.logManager = aeExtension.logManager;
        
        // 初始化状态
        this.currentTheme = 'dark';
        this.isFollowingSystem = false;
        this.changeListeners = [];
        
        // 绑定方法上下文
        this.init = this.init.bind(this);
        this.applyTheme = this.applyTheme.bind(this);
        this.toggleTheme = this.toggleTheme.bind(this);
        this.followSystemTheme = this.followSystemTheme.bind(this);
        this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
        
        this.log('🎨 主题切换系统已初始化', 'debug');
    }
}
```

### 初始化实现

```javascript
/**
 * 初始化主题切换系统
 */
init() {
    try {
        // 应用初始主题
        this.applyInitialTheme();
        
        // 绑定系统主题变化监听器
        this.bindSystemThemeListener();
        
        // 绑定UI事件
        this.bindUIEvents();
        
        this.log('🎨 主题切换系统初始化完成', 'debug');
        
    } catch (error) {
        this.log(`❌ 主题切换系统初始化失败: ${error.message}`, 'error');
    }
}

/**
 * 应用初始主题
 */
applyInitialTheme() {
    try {
        // 首先检查是否有面板特定的主题设置
        const panelTheme = this.getPanelThemeSetting();
        if (panelTheme) {
            this.applyTheme(panelTheme);
            this.log(`🎨 应用面板特定主题: ${panelTheme}`, 'debug');
            return;
        }
        
        // 检查是否有全局主题设置
        const globalTheme = localStorage.getItem('aeTheme') || localStorage.getItem('theme');
        if (globalTheme) {
            this.applyTheme(globalTheme);
            this.log(`🎨 应用全局主题: ${globalTheme}`, 'debug');
            return;
        }
        
        // 检查是否设置为跟随系统
        const followSystem = localStorage.getItem('themeFollowSystem') === 'true';
        if (followSystem) {
            this.followSystemTheme();
            this.log('🎨 应用系统主题跟随', 'debug');
            return;
        }
        
        // 默认使用暗色主题
        this.applyTheme('dark');
        this.log('🎨 应用默认暗色主题', 'debug');
        
    } catch (error) {
        this.log(`应用初始主题失败: ${error.message}`, 'error');
        // 降级到默认主题
        this.applyTheme('dark');
    }
}

/**
 * 绑定系统主题变化监听器
 */
bindSystemThemeListener() {
    try {
        // 检查是否支持系统主题检测
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme)').matches) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                this.handleSystemThemeChange(e.matches ? 'dark' : 'light');
            });
            
            this.log('🎨 系统主题变化监听器已绑定', 'debug');
        } else {
            this.log('⚠️ 系统不支持主题检测', 'warning');
        }
        
    } catch (error) {
        this.log(`绑定系统主题监听器失败: ${error.message}`, 'error');
    }
}

/**
 * 绑定UI事件
 */
bindUIEvents() {
    try {
        // 绑定主题切换按钮事件
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
            
            this.log('🎨 主题切换按钮事件已绑定', 'debug');
        } else {
            this.log('⚠️ 未找到主题切换按钮', 'warning');
        }
        
        // 绑定系统主题跟随开关事件
        const followSystemToggle = document.getElementById('follow-system-theme-toggle');
        if (followSystemToggle) {
            followSystemToggle.addEventListener('change', (e) => {
                const isFollowing = e.target.checked;
                this.setFollowSystemTheme(isFollowing);
            });
            
            this.log('🎨 系统主题跟随开关事件已绑定', 'debug');
        }
        
    } catch (error) {
        this.log(`绑定UI事件失败: ${error.message}`, 'error');
    }
}
```

### 主题应用实现

```javascript
/**
 * 应用主题设置
 * @param {string} theme - 'dark' 或 'light'
 */
applyTheme(theme) {
    try {
        const root = document.documentElement;
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        const iconSpan = themeToggleBtn ? themeToggleBtn.querySelector('.icon') : null;
        const isLight = theme === 'light';

        // 切换CSS类
        root.classList.toggle('theme-light', isLight);
        
        // 保存到localStorage
        try { 
            this.setPanelLocalStorage('aeTheme', isLight ? 'light' : 'dark'); 
        } catch (_) { }

        // 更新按钮状态
        if (themeToggleBtn) {
            themeToggleBtn.setAttribute('aria-pressed', String(isLight));
            themeToggleBtn.title = isLight ? '切换为暗色模式' : '切换为亮色模式';
            if (iconSpan) iconSpan.textContent = isLight ? '☀️' : '🌙';
        }
        
        // 更新当前主题
        this.currentTheme = theme;
        
        // 触发主题变更事件
        this.emitThemeChange(theme);
        
        this.log(`🎨 主题已切换为: ${theme}`, 'debug');

    } catch (error) {
        this.log(`应用主题失败: ${error.message}`, 'error');
    }
}

/**
 * 切换主题
 */
toggleTheme() {
    try {
        const current = this.getPanelLocalStorage('aeTheme') || 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        
        this.log(`🔄 切换主题: ${current} -> ${next}`, 'info');
        
        this.applyTheme(next);
        
        // 保存设置
        try {
            this.setPanelLocalStorage('aeTheme', next);
            localStorage.setItem('themeFollowSystem', 'false');
        } catch (e) {
            this.log(`⚠️ 无法保存主题设置: ${e.message}`, 'warning');
        }
        
        // 更新UI
        this.updateThemeUI(next);
        
    } catch (error) {
        this.log(`❌ 切换主题失败: ${error.message}`, 'error');
    }
}

/**
 * 跟随系统主题
 */
followSystemTheme() {
    try {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme)').matches) {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = systemPrefersDark ? 'dark' : 'light';
            
            this.log(`🔄 跟随系统主题: ${systemTheme}`, 'info');
            
            this.applyTheme(systemTheme);
            
            // 保存设置
            try {
                localStorage.setItem('themeFollowSystem', 'true');
            } catch (e) {
                this.log(`⚠️ 无法保存系统主题跟随设置: ${e.message}`, 'warning');
            }
            
            // 更新UI
            this.updateThemeUI(systemTheme);
            
        } else {
            this.log('⚠️ 系统不支持主题检测，使用默认主题', 'warning');
            this.applyTheme('dark');
        }
        
    } catch (error) {
        this.log(`跟随系统主题失败: ${error.message}`, 'error');
        // 降级到默认主题
        this.applyTheme('dark');
    }
}

/**
 * 处理系统主题变化
 * @param {string} systemTheme - 系统主题
 */
handleSystemThemeChange(systemTheme) {
    try {
        // 检查是否设置为跟随系统
        const followSystem = localStorage.getItem('themeFollowSystem') === 'true';
        
        if (followSystem) {
            this.log(`🔄 系统主题变化: ${systemTheme}`, 'info');
            this.applyTheme(systemTheme);
        } else {
            this.log(`⚠️ 系统主题变化但未启用跟随: ${systemTheme}`, 'debug');
        }
        
    } catch (error) {
        this.log(`处理系统主题变化失败: ${error.message}`, 'error');
    }
}

/**
 * 更新主题UI
 * @param {string} theme - 主题
 */
updateThemeUI(theme) {
    try {
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            const iconSpan = themeToggleBtn.querySelector('.icon');
            const isLight = theme === 'light';
            
            themeToggleBtn.setAttribute('aria-pressed', String(isLight));
            themeToggleBtn.title = isLight ? '切换为暗色模式' : '切换为亮色模式';
            if (iconSpan) iconSpan.textContent = isLight ? '☀️' : '🌙';
        }
        
        // 更新系统主题跟随开关状态
        const followSystemToggle = document.getElementById('follow-system-theme-toggle');
        if (followSystemToggle) {
            followSystemToggle.checked = localStorage.getItem('themeFollowSystem') === 'true';
        }
        
        this.log(`🎨 主题UI已更新: ${theme}`, 'debug');
        
    } catch (error) {
        this.log(`更新主题UI失败: ${error.message}`, 'error');
    }
}
```

### 面板特定主题实现

```javascript
/**
 * 获取面板特定的主题设置
 * @returns {string|null} 主题设置
 */
getPanelThemeSetting() {
    try {
        return this.getPanelLocalStorage('aeTheme');
    } catch (error) {
        this.log(`获取面板主题设置失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 获取面板特定的localStorage键
 * @param {string} key - 原始键名
 * @returns {string} 带面板前缀的键名
 */
getPanelStorageKey(key) {
    try {
        // 使用面板ID作为前缀
        const panelId = this.getPanelId();
        return `${panelId}_${key}`;
    } catch (error) {
        return key;
    }
}

/**
 * 获取面板特定的localStorage值
 * @param {string} key - 键名
 * @returns {string|null} 值
 */
getPanelLocalStorage(key) {
    try {
        const panelKey = this.getPanelStorageKey(key);
        return localStorage.getItem(panelKey);
    } catch (error) {
        return null;
    }
}

/**
 * 设置面板特定的localStorage值
 * @param {string} key - 键名
 * @param {string} value - 值
 */
setPanelLocalStorage(key, value) {
    try {
        const panelKey = this.getPanelStorageKey(key);
        localStorage.setItem(panelKey, value);
    } catch (error) {
        throw error;
    }
}

/**
 * 获取当前面板 ID
 * @returns {string} 'panel1', 'panel2', 或 'panel3'
 */
getPanelId() {
    try {
        if (this.csInterface && typeof this.csInterface.getExtensionID === 'function') {
            const extensionId = this.csInterface.getExtensionID();
            
            // 从 Extension ID 中提取面板编号
            if (extensionId.includes('panel1')) {
                return 'panel1';
            } else if (extensionId.includes('panel2')) {
                return 'panel2';
            } else if (extensionId.includes('panel3')) {
                return 'panel3';
            }
        }
        
        // Demo 模式：从 URL 参数获取
        if (window.location && window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            const panelParam = urlParams.get('panel');
            if (panelParam && ['panel1', 'panel2', 'panel3'].includes(panelParam)) {
                return panelParam;
            }
        }
        
        // 默认返回 panel1
        return 'panel1';
    } catch (error) {
        return 'panel1';
    }
}
```

### 主题变量系统

```javascript
/**
 * 主题变量系统
 * 管理主题相关的CSS变量和样式
 */
class ThemeVariableSystem {
    constructor() {
        this.init();
    }
    
    /**
     * 初始化主题变量系统
     */
    init() {
        // 定义主题变量
        this.themeVariables = {
            'dark': {
                '--bg-color': '#383838',
                '--panel-bg': '#2a2a2a',
                '--text-color': '#e0e0e0',
                '--border-color': '#555',
                '--primary-color': '#3498db',
                '--success-color': '#27ae60',
                '--warning-color': '#f39c12',
                '--error-color': '#e74c3c',
                '--shadow-color': 'rgba(0, 0, 0, 0.3)',
                '--hover-color': 'rgba(255, 255, 255, 0.1)',
                '--active-color': 'rgba(255, 255, 255, 0.2)'
            },
            'light': {
                '--bg-color': '#f5f5f7',
                '--panel-bg': '#ffffff',
                '--text-color': '#222',
                '--border-color': '#ddd',
                '--primary-color': '#3498db',
                '--success-color': '#27ae60',
                '--warning-color': '#f39c12',
                '--error-color': '#e74c3c',
                '--shadow-color': 'rgba(0, 0, 0, 0.1)',
                '--hover-color': 'rgba(0, 0, 0, 0.05)',
                '--active-color': 'rgba(0, 0, 0, 0.1)'
            }
        };
        
        this.log('🎨 主题变量系统已初始化', 'debug');
    }
    
    /**
     * 应用主题变量
     * @param {string} theme - 主题名称
     */
    applyThemeVariables(theme) {
        try {
            const root = document.documentElement;
            const variables = this.themeVariables[theme] || this.themeVariables.dark;
            
            // 应用CSS变量
            Object.entries(variables).forEach(([varName, varValue]) => {
                root.style.setProperty(varName, varValue);
            });
            
            this.log(`🎨 已应用主题变量: ${theme}`, 'debug');
            
        } catch (error) {
            this.log(`应用主题变量失败: ${error.message}`, 'error');
        }
    }
    
    /**
     * 获取主题变量
     * @param {string} theme - 主题名称
     * @returns {Object} 主题变量对象
     */
    getThemeVariables(theme) {
        return this.themeVariables[theme] || this.themeVariables.dark;
    }
    
    /**
     * 添加自定义主题
     * @param {string} themeName - 主题名称
     * @param {Object} variables - 主题变量
     */
    addCustomTheme(themeName, variables) {
        this.themeVariables[themeName] = variables;
        this.log(`🎨 已添加自定义主题: ${themeName}`, 'debug');
    }
    
    /**
     * 移除自定义主题
     * @param {string} themeName - 主题名称
     */
    removeCustomTheme(themeName) {
        if (this.themeVariables.hasOwnProperty(themeName) && 
            !['dark', 'light'].includes(themeName)) {
            delete this.themeVariables[themeName];
            this.log(`🎨 已移除自定义主题: ${themeName}`, 'debug');
        }
    }
}

// 创建主题变量系统实例
const themeVariableSystem = new ThemeVariableSystem();
```

### CSS主题实现

```css
/* 主题切换系统CSS */

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
    
    /* 特殊颜色 */
    --highlight-color: #9966cc;
    --accent-color: #4a90e2;
    --muted-color: #999;
    --disabled-color: #666;
    
    /* 渐变色 */
    --gradient-start: #3a3a3a;
    --gradient-end: #2a2a2a;
    
    /* 图标颜色 */
    --icon-color: #cccccc;
    --icon-hover-color: #ffffff;
    
    /* 按钮颜色 */
    --button-bg: #3a3a3a;
    --button-border: #555;
    --button-text: #e0e0e0;
    --button-hover-bg: #4a4a4a;
    --button-hover-border: #666;
    --button-active-bg: #2a2a2a;
    --button-active-border: #444;
    
    /* 输入框颜色 */
    --input-bg: #1e1e1e;
    --input-border: #555;
    --input-focus-border: #007acc;
    --input-text: #e0e0e0;
    --input-placeholder: #999;
    
    /* 日志颜色 */
    --log-info-color: #3498db;
    --log-success-color: #27ae60;
    --log-warning-color: #f39c12;
    --log-error-color: #e74c3c;
    --log-debug-color: #9e9e9e;
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
    
    /* 特殊颜色 */
    --highlight-color: #9966cc;
    --accent-color: #4a90e2;
    --muted-color: #666;
    --disabled-color: #ccc;
    
    /* 渐变色 */
    --gradient-start: #ffffff;
    --gradient-end: #f5f5f7;
    
    /* 图标颜色 */
    --icon-color: #666666;
    --icon-hover-color: #333333;
    
    /* 按钮颜色 */
    --button-bg: #f1f1f3;
    --button-border: #ccc;
    --button-text: #222;
    --button-hover-bg: #e6e6e9;
    --button-hover-border: #bbb;
    --button-active-bg: #ddd;
    --button-active-border: #aaa;
    
    /* 输入框颜色 */
    --input-bg: #ffffff;
    --input-border: #cfd8dc;
    --input-focus-border: #007acc;
    --input-text: #222;
    --input-placeholder: #999;
    
    /* 日志颜色 */
    --log-info-color: #3498db;
    --log-success-color: #27ae60;
    --log-warning-color: #f39c12;
    --log-error-color: #e74c3c;
    --log-debug-color: #666666;
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
    background-color: var(--button-bg);
    color: var(--button-text);
    border: 1px solid var(--button-border);
    transition: all 0.2s ease;
}

.btn:hover {
    background-color: var(--button-hover-bg);
    border-color: var(--button-hover-border);
}

.btn:active {
    background-color: var(--button-active-bg);
    border-color: var(--button-active-border);
}

/* 输入框样式 */
.input {
    background-color: var(--input-bg);
    color: var(--input-text);
    border: 1px solid var(--input-border);
}

.input:focus {
    border-color: var(--input-focus-border);
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.input::placeholder {
    color: var(--input-placeholder);
}

/* 日志样式 */
.log-entry.info {
    color: var(--log-info-color);
}

.log-entry.success {
    color: var(--log-success-color);
}

.log-entry.warning {
    color: var(--log-warning-color);
}

.log-entry.error {
    color: var(--log-error-color);
}

.log-entry.debug {
    color: var(--log-debug-color);
}

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

## 使用指南

### 基本使用

#### 主题切换
```javascript
// 创建主题切换系统实例
const themeSwitchingSystem = new ThemeSwitchingSystem(aeExtension);

// 初始化主题切换系统
themeSwitchingSystem.init();

// 手动切换主题
themeSwitchingSystem.toggleTheme();

// 应用特定主题
themeSwitchingSystem.applyTheme('light'); // 或 'dark'

// 跟随系统主题
themeSwitchingSystem.followSystemTheme();
```

#### 获取当前主题
```javascript
// 获取当前主题设置
const currentTheme = themeSwitchingSystem.currentTheme;
console.log(`当前主题: ${currentTheme}`); // 输出: 'dark' 或 'light'

// 检查是否跟随系统主题
const isFollowingSystem = themeSwitchingSystem.isFollowingSystem;
console.log(`是否跟随系统主题: ${isFollowingSystem}`);
```

#### 主题变更监听
```javascript
// 添加主题变更监听器
const removeListener = themeSwitchingSystem.addFieldListener('theme', (newTheme, oldTheme) => {
    console.log(`主题已从 ${oldTheme} 变更为 ${newTheme}`);
    
    // 根据新主题更新UI
    updateUITheme(newTheme);
});

// 使用完成后移除监听器
// removeListener();

// 添加一次性主题变更监听器
themeSwitchingSystem.addFieldListener('theme', (newTheme, oldTheme) => {
    console.log(`一次性主题变更: ${oldTheme} -> ${newTheme}`);
}, true); // 第三个参数设为true表示一次性监听
```

### 高级使用

#### 自定义主题
```javascript
// 添加自定义主题
themeSwitchingSystem.themeVariableSystem.addCustomTheme('ocean', {
    '--bg-color': '#001f3f',
    '--panel-bg': '#001122',
    '--text-color': '#7fdbff',
    '--border-color': '#0074d9',
    '--primary-color': '#0074d9',
    '--success-color': '#2ecc40',
    '--warning-color': '#ffdc00',
    '--error-color': '#ff4136'
});

// 应用自定义主题
themeSwitchingSystem.applyTheme('ocean');
```

#### 主题配置管理
```javascript
// 保存主题配置到预设文件
async function saveThemePresets() {
    const themeSettings = {
        currentTheme: themeSwitchingSystem.currentTheme,
        isFollowingSystem: themeSwitchingSystem.isFollowingSystem,
        customThemes: themeSwitchingSystem.themeVariableSystem.themeVariables
    };
    
    // 保存到面板特定的预设文件
    const saveResult = await themeSwitchingSystem.settingsManager.saveSettings({
        theme: themeSettings
    });
    
    if (saveResult.success) {
        console.log('✅ 主题配置已保存到预设文件');
    } else {
        console.error('❌ 保存主题配置失败:', saveResult.error);
    }
}

// 从预设文件加载主题配置
async function loadThemePresets() {
    const savedSettings = themeSwitchingSystem.settingsManager.getSettings();
    
    if (savedSettings && savedSettings.theme) {
        const themeSettings = savedSettings.theme;
        
        // 应用保存的主题设置
        if (themeSettings.currentTheme) {
            themeSwitchingSystem.applyTheme(themeSettings.currentTheme);
        }
        
        if (themeSettings.isFollowingSystem) {
            themeSwitchingSystem.setFollowSystemTheme(true);
        }
        
        // 应用自定义主题
        if (themeSettings.customThemes) {
            Object.entries(themeSettings.customThemes).forEach(([themeName, variables]) => {
                if (!['dark', 'light'].includes(themeName)) {
                    themeSwitchingSystem.themeVariableSystem.addCustomTheme(themeName, variables);
                }
            });
        }
        
        console.log('✅ 主题配置已从预设文件加载');
    }
}
```

#### 系统主题跟随
```javascript
// 启用系统主题跟随
themeSwitchingSystem.setFollowSystemTheme(true);

// 禁用系统主题跟随
themeSwitchingSystem.setFollowSystemTheme(false);

// 检查系统主题跟随状态
const isFollowing = themeSwitchingSystem.getFollowSystemTheme();
console.log(`系统主题跟随状态: ${isFollowing}`);
```

## API参考

### 核心方法

#### ThemeSwitchingSystem
主题切换系统主类

```javascript
/**
 * 主题切换系统
 * 负责管理扩展界面的主题切换，支持暗色和亮色模式动态切换
 */
class ThemeSwitchingSystem
```

#### constructor()
构造函数

```javascript
/**
 * 构造函数
 * @param {Object} aeExtension - AE扩展实例
 */
constructor(aeExtension)
```

#### init()
初始化主题切换系统

```javascript
/**
 * 初始化主题切换系统
 */
init()
```

#### applyTheme()
应用主题设置

```javascript
/**
 * 应用主题设置
 * @param {string} theme - 'dark' 或 'light'
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

#### handleSystemThemeChange()
处理系统主题变化

```javascript
/**
 * 处理系统主题变化
 * @param {string} systemTheme - 系统主题
 */
handleSystemThemeChange(systemTheme)
```

#### updateThemeUI()
更新主题UI

```javascript
/**
 * 更新主题UI
 * @param {string} theme - 主题
 */
updateThemeUI(theme)
```

#### setFollowSystemTheme()
设置系统主题跟随

```javascript
/**
 * 设置系统主题跟随
 * @param {boolean} follow - 是否跟随系统主题
 */
setFollowSystemTheme(follow)
```

#### getFollowSystemTheme()
获取系统主题跟随状态

```javascript
/**
 * 获取系统主题跟随状态
 * @returns {boolean} 是否跟随系统主题
 */
getFollowSystemTheme()
```

### 面板特定方法

#### getPanelThemeSetting()
获取面板特定的主题设置

```javascript
/**
 * 获取面板特定的主题设置
 * @returns {string|null} 主题设置
 */
getPanelThemeSetting()
```

#### getPanelStorageKey()
获取面板特定的localStorage键

```javascript
/**
 * 获取面板特定的localStorage键
 * @param {string} key - 原始键名
 * @returns {string} 带面板前缀的键名
 */
getPanelStorageKey(key)
```

#### getPanelLocalStorage()
获取面板特定的localStorage值

```javascript
/**
 * 获取面板特定的localStorage值
 * @param {string} key - 键名
 * @returns {string|null} 值
 */
getPanelLocalStorage(key)
```

#### setPanelLocalStorage()
设置面板特定的localStorage值

```javascript
/**
 * 设置面板特定的localStorage值
 * @param {string} key - 键名
 * @param {string} value - 值
 */
setPanelLocalStorage(key, value)
```

#### getPanelId()
获取当前面板ID

```javascript
/**
 * 获取当前面板 ID
 * @returns {string} 'panel1', 'panel2', 或 'panel3'
 */
getPanelId()
```

### 主题变量系统方法

#### ThemeVariableSystem
主题变量系统类

```javascript
/**
 * 主题变量系统
 * 管理主题相关的CSS变量和样式
 */
class ThemeVariableSystem
```

#### applyThemeVariables()
应用主题变量

```javascript
/**
 * 应用主题变量
 * @param {string} theme - 主题名称
 */
applyThemeVariables(theme)
```

#### getThemeVariables()
获取主题变量

```javascript
/**
 * 获取主题变量
 * @param {string} theme - 主题名称
 * @returns {Object} 主题变量对象
 */
getThemeVariables(theme)
```

#### addCustomTheme()
添加自定义主题

```javascript
/**
 * 添加自定义主题
 * @param {string} themeName - 主题名称
 * @param {Object} variables - 主题变量
 */
addCustomTheme(themeName, variables)
```

#### removeCustomTheme()
移除自定义主题

```javascript
/**
 * 移除自定义主题
 * @param {string} themeName - 主题名称
 */
removeCustomTheme(themeName)
```

### 事件方法

#### addFieldListener()
添加字段监听器

```javascript
/**
 * 添加字段监听器
 * @param {string} fieldPath - 字段路径
 * @param {Function} listener - 监听器函数
 * @param {boolean} once - 是否只监听一次
 * @returns {Function} 移除监听器的函数
 */
addFieldListener(fieldPath, listener, once = false)
```

#### removeFieldListener()
移除字段监听器

```javascript
/**
 * 移除字段监听器
 * @param {string} fieldPath - 字段路径
 * @param {Function} listener - 监听器函数
 */
removeFieldListener(fieldPath, listener)
```

#### emitThemeChange()
触发主题变更事件

```javascript
/**
 * 触发主题变更事件
 * @param {string} newTheme - 新主题
 */
emitThemeChange(newTheme)
```

## 最佳实践

### 使用建议

#### 主题设计建议
```css
/* 使用CSS变量确保主题一致性 */
.button {
    background-color: var(--button-bg);
    color: var(--button-text);
    border: 1px solid var(--button-border);
    transition: all 0.2s ease;
}

.button:hover {
    background-color: var(--button-hover-bg);
    border-color: var(--button-hover-border);
}

.button:active {
    background-color: var(--button-active-bg);
    border-color: var(--button-active-border);
}

/* 使用calc()和clamp()实现响应式设计 */
.header {
    padding: clamp(8px, 2vw, 16px);
    gap: clamp(4px, 1vw, 12px);
}

.title {
    font-size: clamp(14px, 2.5vw, 18px);
    gap: clamp(6px, 1.5vw, 12px);
}

/* 使用currentColor保持图标颜色一致性 */
.icon {
    color: currentColor;
    fill: currentColor;
}
```

#### 主题切换优化
```javascript
// 使用防抖避免频繁主题切换
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 防抖处理主题切换
const debouncedThemeToggle = debounce(() => {
    themeSwitchingSystem.toggleTheme();
}, 300);

// 绑定防抖切换事件
document.getElementById('theme-toggle-btn').addEventListener('click', debouncedThemeToggle);
```

#### 性能优化
```javascript
// 批量处理CSS变量更新
function batchUpdateThemeVariables(theme, variables) {
    const root = document.documentElement;
    
    // 批量设置CSS变量
    Object.entries(variables).forEach(([varName, varValue]) => {
        root.style.setProperty(varName, varValue);
    });
    
    // 触发一次重排而不是多次
    requestAnimationFrame(() => {
        // 强制重新计算样式
        getComputedStyle(root).getPropertyValue('--bg-color');
    });
}

// 使用requestAnimationFrame优化动画
function animateThemeTransition() {
    requestAnimationFrame(() => {
        // 执行主题过渡动画
        document.documentElement.classList.add('theme-transitioning');
        
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 300);
    });
}
```

### 故障排除

#### 常见问题

1. **主题切换无反应**
   - **症状**：点击主题按钮后界面无变化
   - **解决**：
     1. 检查localStorage权限
     2. 验证CSS变量是否正确应用
     3. 查看控制台错误日志

2. **系统主题跟随失效**
   - **症状**：设置跟随系统后主题未自动切换
   - **解决**：
     1. 检查系统主题检测支持
     2. 验证媒体查询监听器是否正确绑定
     3. 重启AE和扩展面板

3. **自定义主题未生效**
   - **症状**：添加自定义主题后无法切换到该主题
   - **解决**：
     1. 检查主题变量格式是否正确
     2. 验证主题名称是否唯一
     3. 查看控制台是否有错误信息

#### 调试技巧

```javascript
// 启用详细主题日志
localStorage.setItem('debugLogLevel', '0');

// 监控主题变更事件
themeSwitchingSystem.addFieldListener('theme', (newTheme, oldTheme) => {
    console.log(`🎨 主题变更: ${oldTheme} -> ${newTheme}`);
});

// 检查CSS变量
function inspectThemeVariables() {
    const computedStyle = getComputedStyle(document.documentElement);
    console.log('主题变量检查:', {
        bgColor: computedStyle.getPropertyValue('--bg-color'),
        panelBg: computedStyle.getPropertyValue('--panel-bg'),
        textColor: computedStyle.getPropertyValue('--text-color'),
        borderColor: computedStyle.getPropertyValue('--border-color')
    });
}

// 监控性能
const startTime = performance.now();
themeSwitchingSystem.applyTheme('light');
const endTime = performance.now();
console.log(`主题切换耗时: ${endTime - startTime}ms`);
```

## 扩展性

### 自定义扩展

#### 扩展主题切换系统
```javascript
// 创建自定义主题切换类
class CustomThemeSwitchingSystem extends ThemeSwitchingSystem {
    constructor(aeExtension) {
        super(aeExtension);
        this.customThemes = new Map();
        this.themeTransitions = new Map();
    }
    
    /**
     * 注册自定义主题
     * @param {string} themeName - 主题名称
     * @param {Object} themeVars - 主题变量
     * @param {Object} transition - 过渡效果
     */
    registerCustomTheme(themeName, themeVars, transition = null) {
        this.customThemes.set(themeName, themeVars);
        if (transition) {
            this.themeTransitions.set(themeName, transition);
        }
        this.log(`🎨 已注册自定义主题: ${themeName}`, 'debug');
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
        
        // 应用过渡效果
        if (this.themeTransitions.has(themeName)) {
            const transition = this.themeTransitions.get(themeName);
            this.applyThemeTransition(transition);
        }
        
        // 保存主题名称
        try {
            this.setPanelLocalStorage('customTheme', themeName);
        } catch (e) {
            console.warn('无法保存自定义主题设置:', e);
        }
        
        this.currentTheme = themeName;
        this.emitThemeChange(themeName);
        
        this.log(`🎨 自定义主题已应用: ${themeName}`, 'success');
    }
    
    /**
     * 应用主题过渡效果
     * @param {Object} transition - 过渡效果配置
     */
    applyThemeTransition(transition) {
        const root = document.documentElement;
        const style = document.createElement('style');
        style.textContent = `
            @keyframes customThemeTransition {
                from { opacity: 0.8; transform: scale(0.98); }
                to { opacity: 1; transform: scale(1); }
            }
            
            .theme-transition {
                animation: customThemeTransition ${transition.duration || '0.3s'} ${transition.easing || 'ease'};
            }
        `;
        document.head.appendChild(style);
        
        root.classList.add('theme-transition');
        setTimeout(() => {
            root.classList.remove('theme-transition');
            document.head.removeChild(style);
        }, 300);
    }
}

// 使用自定义主题切换系统
const customThemeSystem = new CustomThemeSwitchingSystem(aeExtension);

// 注册海洋主题
customThemeSystem.registerCustomTheme('ocean', {
    'bg-color': '#001f3f',
    'panel-bg': '#001122',
    'text-color': '#7fdbff',
    'border-color': '#0074d9',
    'primary-color': '#0074d9',
    'success-color': '#2ecc40',
    'warning-color': '#ffdc00',
    'error-color': '#ff4136'
}, {
    duration: '0.5s',
    easing: 'ease-in-out'
});

// 应用海洋主题
customThemeSystem.applyCustomTheme('ocean');
```

#### 主题插件化架构
```javascript
// 创建主题插件
class ThemePlugin {
    constructor(themeSwitchingSystem) {
        this.themeSystem = themeSwitchingSystem;
        this.init();
    }
    
    init() {
        // 注册插件特定的主题
        this.registerPluginThemes();
        
        // 添加主题过渡效果
        this.addThemeTransitions();
        
        // 绑定插件事件
        this.bindPluginEvents();
    }
    
    /**
     * 注册插件特定的主题
     */
    registerPluginThemes() {
        // 注册专业主题
        this.themeSystem.registerCustomTheme('professional', {
            'bg-color': '#2c3e50',
            'panel-bg': '#34495e',
            'text-color': '#ecf0f1',
            'border-color': '#7f8c8d',
            'primary-color': '#3498db',
            'success-color': '#27ae60',
            'warning-color': '#f39c12',
            'error-color': '#e74c3c'
        });
        
        // 注册创意主题
        this.themeSystem.registerCustomTheme('creative', {
            'bg-color': '#8e44ad',
            'panel-bg': '#9b59b6',
            'text-color': '#ffffff',
            'border-color': '#d35400',
            'primary-color': '#f1c40f',
            'success-color': '#2ecc71',
            'warning-color': '#e67e22',
            'error-color': '#e74c3c'
        });
        
        this.themeSystem.log('🎨 插件主题已注册', 'debug');
    }
    
    /**
     * 添加主题过渡效果
     */
    addThemeTransitions() {
        // 为专业主题添加过渡效果
        this.themeSystem.themeTransitions.set('professional', {
            enter: 'slideInLeft',
            leave: 'slideOutRight',
            duration: '0.4s'
        });
        
        // 为创意主题添加过渡效果
        this.themeSystem.themeTransitions.set('creative', {
            enter: 'fadeInUp',
            leave: 'fadeOutDown',
            duration: '0.6s'
        });
        
        this.themeSystem.log('🎨 主题过渡效果已添加', 'debug');
    }
    
    /**
     * 绑定插件事件
     */
    bindPluginEvents() {
        // 监听主题变更事件
        this.themeSystem.addFieldListener('theme', (newTheme, oldTheme) => {
            this.handleThemeChange(newTheme, oldTheme);
        });
        
        this.themeSystem.log('🎨 插件事件监听器已绑定', 'debug');
    }
    
    /**
     * 处理主题变更
     * @param {string} newTheme - 新主题
     * @param {string} oldTheme - 旧主题
     */
    handleThemeChange(newTheme, oldTheme) {
        this.themeSystem.log(`🎨 插件: 主题变更 ${oldTheme} -> ${newTheme}`, 'debug');
        
        // 执行插件特定的逻辑
        this.updatePluginUI(newTheme);
    }
    
    /**
     * 更新插件UI
     * @param {string} theme - 主题名称
     */
    updatePluginUI(theme) {
        // 根据主题更新插件UI元素
        const pluginElements = document.querySelectorAll('[data-plugin-theme]');
        pluginElements.forEach(element => {
            const themeClass = element.dataset.pluginTheme;
            element.classList.toggle(themeClass, theme === 'professional' || theme === 'creative');
        });
        
        this.themeSystem.log('🎨 插件UI已更新', 'debug');
    }
}

// 应用主题插件
const themePlugin = new ThemePlugin(themeSwitchingSystem);