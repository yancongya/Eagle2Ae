# 语言切换功能

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了强大的语言切换功能，支持中英文动态切换，为国际用户提供了更好的使用体验。该功能具有即时生效、个性化设置、配置保存等特点。

## 核心特性

### 动态语言切换
- 支持中英文实时切换，无需重启应用
- 界面文字即时更新，提供流畅的用户体验
- 保持界面布局和功能完整性

### 个性化设置
- 每个面板实例可设置独立的语言偏好
- 支持语言设置的导出和导入
- 自动保存用户语言选择

### 多面板支持
- 不同面板实例可设置不同语言
- 支持面板间语言配置隔离
- 提供统一的语言管理机制

## 使用指南

### 基本操作

#### 切换界面语言
1. 在扩展面板右上角找到语言切换按钮（🌐图标）
2. 点击按钮，语言将在中文和英文之间切换
3. 界面文字将即时更新为所选语言

#### 语言设置保存
- 语言偏好将自动保存到面板配置中
- 每个面板实例拥有独立的语言设置
- 支持通过预设文件导出/导入语言配置

### 高级功能

#### 面板特定语言设置
```javascript
// 为不同面板设置不同语言
// 面板1: 中文
localStorage.setItem('panel1_language', 'zh-CN');

// 面板2: 英文
localStorage.setItem('panel2_language', 'en-US');
```

#### 批量语言设置
```javascript
// 为所有面板设置统一语言
const allPanels = ['panel1', 'panel2', 'panel3'];
allPanels.forEach(panelId => {
    localStorage.setItem(`${panelId}_language`, 'zh-CN');
});
```

## 技术实现

### 语言切换机制

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

### 国际化系统

```javascript
/**
 * 国际化文本管理器
 */
class I18nManager {
    constructor() {
        this.currentLang = 'zh-CN';
        this.translations = {
            'zh-CN': {},
            'en-US': {}
        };
        this.loadTranslations();
    }
    
    /**
     * 加载翻译文本
     */
    async loadTranslations() {
        try {
            // 加载中文翻译
            const zhCNResponse = await fetch('/i18n/zh-CN.json');
            this.translations['zh-CN'] = await zhCNResponse.json();
            
            // 加载英文翻译
            const enUSResponse = await fetch('/i18n/en-US.json');
            this.translations['en-US'] = await enUSResponse.json();
            
            this.log('🌐 国际化文本加载完成', 'debug');
        } catch (error) {
            this.log(`🌐 国际化文本加载失败: ${error.message}`, 'error');
        }
    }
    
    /**
     * 获取文本翻译
     * @param {string} key - 文本键
     * @param {string} lang - 语言代码（可选）
     * @returns {string} 翻译文本
     */
    getText(key, lang = null) {
        const targetLang = lang || this.currentLang;
        const translation = this.translations[targetLang];
        
        if (translation && translation[key]) {
            return translation[key];
        }
        
        // 回退到默认语言
        if (targetLang !== 'zh-CN' && this.translations['zh-CN'][key]) {
            return this.translations['zh-CN'][key];
        }
        
        // 返回键名作为默认值
        return key;
    }
    
    /**
     * 更新页面文本
     */
    updatePageTexts() {
        // 更新所有带有data-i18n属性的元素
        const i18nElements = document.querySelectorAll('[data-i18n]');
        i18nElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.getText(key);
            element.textContent = text;
        });
        
        // 更新带有data-i18n-title属性的元素的title
        const i18nTitleElements = document.querySelectorAll('[data-i18n-title]');
        i18nTitleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const title = this.getText(key);
            element.title = title;
        });
        
        this.log('🌐 页面文本已更新', 'debug');
    }
}
```

### 语言配置管理

```javascript
/**
 * 语言配置管理器
 */
class LanguageManager {
    constructor(panelId) {
        this.panelId = panelId;
    }
    
    /**
     * 获取面板特定的语言设置键
     * @param {string} key - 原始键名
     * @returns {string} 面板特定的键名
     */
    getPanelLanguageKey(key) {
        return `${this.panelId}_${key}`;
    }
    
    /**
     * 获取面板特定的语言设置
     * @param {string} key - 键名
     * @returns {string|null} 设置值
     */
    getPanelLanguageSetting(key) {
        return localStorage.getItem(this.getPanelLanguageKey(key));
    }
    
    /**
     * 设置面板特定的语言设置
     * @param {string} key - 键名
     * @param {string} value - 设置值
     */
    setPanelLanguageSetting(key, value) {
        localStorage.setItem(this.getPanelLanguageKey(key), value);
    }
    
    /**
     * 导出语言配置
     * @returns {Object} 语言配置对象
     */
    exportLanguageConfig() {
        return {
            language: this.getPanelLanguageSetting('language'),
            lang: this.getPanelLanguageSetting('lang')
        };
    }
    
    /**
     * 导入语言配置
     * @param {Object} config - 语言配置对象
     */
    importLanguageConfig(config) {
        if (config.language) {
            this.setPanelLanguageSetting('language', config.language);
        }
        if (config.lang) {
            this.setPanelLanguageSetting('lang', config.lang);
        }
    }
}
```

## 最佳实践

### 使用建议

1. **个性化配置**
   ```javascript
   // 为不同用途的面板设置不同语言
   // 设计工作面板使用中文
   localStorage.setItem('panel1_language', 'zh-CN');
   
   // 国际协作面板使用英文
   localStorage.setItem('panel2_language', 'en-US');
   ```

2. **团队协作**
   ```javascript
   // 创建团队标准语言配置
   const teamLanguageConfig = {
       language: 'zh-CN',
       lang: 'zh-CN'
   };
   
   // 导出团队标准配置供其他成员使用
   exportToFile(teamLanguageConfig, 'TeamStandardLanguage.Config');
   ```

3. **多语言项目管理**
   ```javascript
   // 为不同语言的项目创建专门的面板
   function createLanguageSpecificPanel(projectLanguage) {
       const panel = createNewPanel();
       panel.setLanguage(projectLanguage);
       return panel;
   }
   
   // 中文项目面板
   const chinesePanel = createLanguageSpecificPanel('zh-CN');
   
   // 英文项目面板
   const englishPanel = createLanguageSpecificPanel('en-US');
   ```

### 性能优化

1. **翻译文本缓存**
   ```javascript
   // 缓存常用的翻译文本
   class CachedI18nManager extends I18nManager {
       constructor() {
           super();
           this.translationCache = new Map();
       }
       
       getText(key, lang = null) {
           const cacheKey = `${key}_${lang || this.currentLang}`;
           
           if (this.translationCache.has(cacheKey)) {
               return this.translationCache.get(cacheKey);
           }
           
           const text = super.getText(key, lang);
           this.translationCache.set(cacheKey, text);
           return text;
       }
   }
   ```

2. **延迟加载**
   ```javascript
   // 延迟加载非关键翻译文本
   async function loadNonCriticalTranslations() {
       // 在空闲时间加载额外的翻译文本
       if ('requestIdleCallback' in window) {
           requestIdleCallback(() => {
               i18nManager.loadAdditionalTranslations();
           });
       }
   }
   ```

## 故障排除

### 常见问题

1. **语言切换后部分文本未更新**
   - 症状：点击语言切换按钮后，部分界面元素仍显示旧语言
   - 解决：检查元素是否正确添加了data-i18n属性，手动调用i18n.updatePageTexts()

2. **语言设置未保存**
   - 症状：重启后语言设置重置为默认值
   - 解决：检查localStorage权限，验证设置保存逻辑

3. **翻译文本缺失**
   - 症状：某些界面元素显示键名而非翻译文本
   - 解决：检查翻译文件是否包含对应键，验证键名拼写

### 调试技巧

1. **启用语言调试**
   ```javascript
   // 在控制台中启用语言调试日志
   localStorage.setItem('debugLogLevel', '0');
   ```

2. **监控语言变更**
   ```javascript
   // 监听语言变更事件
   const languageObserver = new MutationObserver((mutations) => {
       mutations.forEach((mutation) => {
           if (mutation.type === 'attributes' && 
               mutation.attributeName === 'lang') {
               console.log('语言已变更:', document.documentElement.lang);
           }
       });
   });
   
   languageObserver.observe(document.documentElement, {
       attributes: true,
       attributeFilter: ['lang']
   });
   ```

3. **检查翻译文件**
   ```javascript
   // 检查翻译文件加载状态
   function inspectTranslations() {
       console.log('当前语言:', i18nManager.currentLang);
       console.log('中文翻译条目数:', Object.keys(i18nManager.translations['zh-CN']).length);
       console.log('英文翻译条目数:', Object.keys(i18nManager.translations['en-US']).length);
   }
   ```

## 扩展性

### 自定义语言包

```javascript
// 添加自定义语言包支持
class CustomLanguagePackManager {
    constructor() {
        this.customPacks = new Map();
    }
    
    /**
     * 注册自定义语言包
     * @param {string} langCode - 语言代码
     * @param {Object} translations - 翻译文本
     */
    registerLanguagePack(langCode, translations) {
        this.customPacks.set(langCode, translations);
        this.log(`注册自定义语言包: ${langCode}`, 'debug');
    }
    
    /**
     * 获取文本翻译（支持自定义语言包）
     * @param {string} key - 文本键
     * @param {string} lang - 语言代码
     * @returns {string} 翻译文本
     */
    getText(key, lang = null) {
        const targetLang = lang || this.currentLang;
        
        // 检查自定义语言包
        if (this.customPacks.has(targetLang)) {
            const customTranslations = this.customPacks.get(targetLang);
            if (customTranslations[key]) {
                return customTranslations[key];
            }
        }
        
        // 回退到内置翻译
        return super.getText(key, targetLang);
    }
}
```

### 语言包热更新

```javascript
// 实现语言包热更新功能
class HotUpdateLanguageManager extends I18nManager {
    /**
     * 热更新语言包
     * @param {string} langCode - 语言代码
     * @param {Object} newTranslations - 新的翻译文本
     */
    hotUpdateLanguagePack(langCode, newTranslations) {
        // 更新内存中的翻译文本
        this.translations[langCode] = {
            ...this.translations[langCode],
            ...newTranslations
        };
        
        // 如果是当前语言，更新界面
        if (this.currentLang === langCode) {
            this.updatePageTexts();
        }
        
        this.log(`热更新语言包: ${langCode}`, 'info');
    }
}
```