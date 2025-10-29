# UI 控制系统使用指南

## 概述

UI 控制系统是 Eagle2Ae v2.4.0 引入的重要功能，支持主题切换、语言切换、组件显示控制等个性化功能，为用户提供更加灵活和舒适的使用体验。

## 主要功能

### 1. 主题切换

支持暗色和亮色两种主题模式的动态切换：

```javascript
// 主题切换实现
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

// 语言切换实现
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

### 2. 语言切换

支持中英文动态切换，满足不同用户的语言偏好。

### 3. 组件显示控制

可控制主面板各组件的显示/隐藏，实现界面的个性化定制。

### 4. 独显模式

提供沉浸式的专注操作体验。

## 使用指南

### 主题切换使用

1. 点击右上角的主题切换按钮（☀️/🌙）
2. 选择暗色或亮色主题
3. 设置会自动保存，下次打开时生效

### 语言切换使用

1. 点击语言切换按钮（🌐）
2. 在中英文之间切换
3. 界面文本会实时更新

### 组件显示控制

1. 进入高级设置面板
2. 找到"界面组件"设置区域
3. 勾选或取消勾选需要显示/隐藏的组件
4. 设置会自动保存

### 独显模式使用

1. 点击独显模式按钮
2. 界面会进入全屏专注模式
3. 再次点击退出独显模式

## 自定义配置

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
                '--active-color': 'rgba(255, 255, 255, 0.2)
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
                '--active-color': 'rgba(0, 0, 0, 0.1)
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
}
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
```

## 最佳实践

### 1. 主题选择建议

- **暗色主题**: 适合长时间使用，减少眼部疲劳
- **亮色主题**: 适合光线充足的环境，提供更好的对比度

### 2. 语言设置建议

- 根据操作系统语言自动切换
- 保持一致性，避免频繁切换

### 3. 组件显示建议

- 根据使用频率调整组件显示
- 隐藏不常用的组件以节省界面空间

## 故障排除

### 主题切换失效

如果主题切换无反应：
1. 检查localStorage权限
2. 验证CSS变量是否正确应用
3. 查看控制台错误日志

### 语言切换异常

如果语言切换后部分文本未更新：
1. 手动调用i18n.updatePageTexts()方法
2. 检查语言包文件是否完整
3. 重启面板实例

### 组件显示问题

如果组件显示控制不生效：
1. 检查设置是否正确保存
2. 验证CSS样式是否正确应用
3. 刷新面板界面