# 多语言支持系统

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了全新的多语言支持系统（Multi-Language Support System），支持中英文动态切换，为国际用户提供更好的使用体验。该系统采用现代化的国际化架构，支持语言包热加载、动态文本更新、上下文感知翻译等高级功能。

## 核心特性

### 动态语言切换
- 支持运行时动态切换界面语言
- 无需重启应用即可应用语言变更
- 提供一键切换按钮，操作简便

### 语言包管理
- 支持JSON格式的语言包文件
- 提供语言包热加载机制
- 支持语言包的版本管理和兼容性处理

### 上下文感知翻译
- 根据界面上下文提供精准翻译
- 支持变量插值和复数形式
- 提供默认回退机制

### 自动文本更新
- 文本变更时自动更新界面元素
- 支持批量文本更新
- 提供更新进度反馈

### 国际化API
- 完整的JavaScript API用于语言管理
- 支持自定义翻译函数
- 提供翻译缓存机制

## 技术实现

### 核心类结构

```javascript
/**
 * 国际化管理器
 * 负责管理扩展的多语言支持，支持中英文动态切换和上下文感知翻译
 */
class I18nManager {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            defaultLanguage: 'zh-CN',
            supportedLanguages: ['zh-CN', 'en-US'],
            fallbackLanguage: 'zh-CN',
            enableLogging: true,
            cacheTimeout: 30000, // 30秒缓存超时
            ...options
        };

        // 初始化状态
        this.currentLang = this.options.defaultLanguage;
        this.translations = new Map();
        this.translationCache = new Map();
        this.cacheHits = 0;
        this.cacheMisses = 0;
        this.changeListeners = [];
        
        // 绑定方法上下文
        this.setLanguage = this.setLanguage.bind(this);
        this.getText = this.getText.bind(this);
        this.updatePageTexts = this.updatePageTexts.bind(this);
        this.loadLanguagePack = this.loadLanguagePack.bind(this);
        this.translateElement = this.translateElement.bind(this);
        
        this.log('🌐 国际化管理器已初始化', 'debug');
    }
}
```

### 语言切换实现

```javascript
/**
 * 设置语言
 * @param {string} lang - 语言代码 ('zh-CN' | 'en-US')
 * @param {boolean} updateUI - 是否更新UI
 * @returns {Promise<boolean>} 是否设置成功
 */
async setLanguage(lang, updateUI = true) {
    try {
        // 验证语言代码
        if (!this.options.supportedLanguages.includes(lang)) {
            throw new Error(`不支持的语言: ${lang}`);
        }

        // 保存旧语言
        const oldLang = this.currentLang;

        // 更新当前语言
        this.currentLang = lang;

        // 保存到localStorage
        try {
            localStorage.setItem('language', lang);
            localStorage.setItem('lang', lang);
        } catch (storageError) {
            this.log(`⚠️ 无法保存语言设置到localStorage: ${storageError.message}`, 'warning');
        }

        this.log(`🌐 语言已切换: ${oldLang} -> ${lang}`, 'info');

        // 加载对应的语言包
        const loadResult = await this.loadLanguagePack(lang);
        if (!loadResult.success) {
            throw new Error(`加载语言包失败: ${loadResult.error}`);
        }

        // 更新UI文本
        if (updateUI) {
            await this.updatePageTexts();
        }

        // 触发语言变更事件
        this.emitLanguageChange(oldLang, lang);

        return true;

    } catch (error) {
        this.log(`❌ 设置语言失败: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 切换语言
 * @returns {Promise<boolean>} 是否切换成功
 */
async toggleLanguage() {
    try {
        const currentLang = this.getCurrentLanguage();
        const nextLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';

        this.log(`🔄 切换语言: ${currentLang} -> ${nextLang}`, 'info');

        // 设置新语言
        const result = await this.setLanguage(nextLang, true);

        if (result) {
            // 更新按钮状态
            this.updateLanguageToggleButton(nextLang);

            // 保存设置
            try {
                localStorage.setItem('language', nextLang);
                localStorage.setItem('lang', nextLang);
            } catch (storageError) {
                this.log(`⚠️ 无法保存语言设置: ${storageError.message}`, 'warning');
            }

            this.log(`✅ 语言已切换为: ${nextLang}`, 'success');
        } else {
            this.log(`❌ 语言切换失败`, 'error');
        }

        return result;

    } catch (error) {
        this.log(`❌ 切换语言异常: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 更新语言切换按钮状态
 * @param {string} lang - 当前语言
 */
updateLanguageToggleButton(lang) {
    const langBtn = document.getElementById('language-toggle-btn');
    if (!langBtn) return;

    const iconSpan = langBtn.querySelector('.icon');
    const isEn = lang === 'en-US';

    // 更新按钮属性
    langBtn.setAttribute('aria-pressed', String(isEn));
    langBtn.title = isEn ? 'Switch to Chinese' : '切换为中文';

    // 更新图标
    if (iconSpan) {
        iconSpan.textContent = isEn ? '🇨🇳' : '🌐';
    }

    this.log(`🔄 语言切换按钮状态已更新: ${lang}`, 'debug');
}
```

### 语言包加载实现

```javascript
/**
 * 加载语言包
 * @param {string} lang - 语言代码
 * @returns {Promise<Object>} 加载结果
 */
async loadLanguagePack(lang) {
    try {
        this.log(`📥 开始加载语言包: ${lang}`, 'debug');

        // 检查缓存
        const cached = this.getCachedTranslation(lang);
        if (cached) {
            this.translations.set(lang, cached);
            this.log(`キャッシング 从缓存加载语言包: ${lang}`, 'debug');
            this.cacheHits++;
            return { success: true, translations: cached };
        }

        this.cacheMisses++;

        // 构造语言包URL
        const langPackUrl = `./i18n/${lang}.json`;

        // 加载语言包
        const response = await fetch(langPackUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const translations = await response.json();

        // 验证语言包结构
        if (!this.validateLanguagePack(translations)) {
            throw new Error('语言包格式无效');
        }

        // 缓存语言包
        this.cacheTranslation(lang, translations);

        // 保存到内存
        this.translations.set(lang, translations);

        this.log(`✅ 语言包加载成功: ${lang} (${Object.keys(translations).length} 个翻译条目)`, 'success');

        return { success: true, translations: translations };

    } catch (error) {
        this.log(`❌ 加载语言包失败: ${error.message}`, 'error');

        // 尝试加载回退语言包
        if (lang !== this.options.fallbackLanguage) {
            this.log(`🔄 尝试加载回退语言包: ${this.options.fallbackLanguage}`, 'debug');
            return await this.loadLanguagePack(this.options.fallbackLanguage);
        }

        return { success: false, error: error.message };
    }
}

/**
 * 验证语言包结构
 * @param {Object} translations - 翻译对象
 * @returns {boolean} 是否有效
 */
validateLanguagePack(translations) {
    if (!translations || typeof translations !== 'object') {
        return false;
    }

    // 检查必需的翻译条目
    const requiredKeys = [
        'common.projectInfo',
        'common.connectionStatus',
        'common.notConnected',
        'common.version',
        'common.path',
        'common.project',
        'common.composition',
        'common.eagle',
        'common.library',
        'common.currentGroup',
        'common.importModeBehavior',
        'common.directImport',
        'common.projectAdjacentCopy',
        'common.customFolder',
        'common.doNotImportToComp',
        'common.createPrecomp',
        'common.currentTime',
        'common.timelineStart',
        'common.detectLayers',
        'common.exportLayers',
        'common.exportToEagle',
        'common.statusInfo',
        'common.waitingForImport',
        'common.log',
        'common.clearLog',
        'common.switchLog',
        'common.settings',
        'common.themeToggle',
        'common.showHideLog',
        'common.testConnection',
        'common.chooseTargetFolder',
        'common.dragFolderHere',
        'common.orClickSelect',
        'common.manualPathInput',
        'common.inputFolderPath',
        'common.customFolderName',
        'common.validate',
        'common.cancel',
        'common.confirm',
        'common.advancedSettings',
        'common.importMode',
        'common.importBehavior',
        'common.exportPathSettings',
        'common.desktopExport',
        'common.projectAdjacentExport',
        'common.automaticCopy',
        'common.burnAfterReading',
        'common.timestampPrefix',
        'common.compositionNamePrefix',
        'common.communicationSettings',
        'common.communicationPortSettings',
        'common.communicationPort',
        'common.portRange',
        'common.uiSettings',
        'common.theme',
        'common.language',
        'common.log',
        'common.logPanel',
        'common.presetManagement',
        'common.resetToDefault',
        'common.openPresetDirectory',
        'common.customPresetDirectory',
        'common.projectAdjacentSettings',
        'common.customFolderSettings',
        'common.selectFolder',
        'common.recentlyUsedFolders',
        'common.deleteRecord',
        'common.userCancelled',
        'common.invalidFolderPath',
        'common.folderNameInvalidChars',
        'common.pleaseEnterFolderName',
        'common.invalidPortRange',
        'common.settingsSaved',
        'common.connectionTest',
        'common.connectionTestSuccess',
        'common.connectionTestFailed',
        'common.language',
        'common.switchLanguage',
        'common.unknown',
        'common.none',
        'common.noProjectOpen',
        'common.connectedDemo',
        'common.disconnectedDemo',
        'common.connectingDemo',
        'common.connectionErrorDemo',
        'common.connecting',
        'common.disconnecting',
        'common.connected'
    ];

    for (const key of requiredKeys) {
        if (!translations.hasOwnProperty(key)) {
            this.log(`⚠️ 缺少必需的翻译条目: ${key}`, 'warning');
            return false;
        }
    }

    return true;
}
```

### 文本翻译实现

```javascript
/**
 * 获取翻译文本
 * @param {string} key - 翻译键
 * @param {Object} variables - 变量替换对象
 * @returns {string} 翻译文本
 */
getText(key, variables = {}) {
    try {
        // 获取当前语言的翻译
        const currentTranslations = this.translations.get(this.currentLang) || {};
        let translation = currentTranslations[key];

        // 如果没有找到翻译，尝试回退语言
        if (!translation && this.currentLang !== this.options.fallbackLanguage) {
            const fallbackTranslations = this.translations.get(this.options.fallbackLanguage) || {};
            translation = fallbackTranslations[key];
        }

        // 如果仍然没有找到翻译，返回键名作为默认值
        if (!translation) {
            this.log(`⚠️ 未找到翻译: ${key}`, 'debug');
            return key;
        }

        // 处理变量替换
        if (variables && typeof variables === 'object') {
            translation = this.interpolateVariables(translation, variables);
        }

        return translation;

    } catch (error) {
        this.log(`获取翻译失败: ${error.message}`, 'error');
        return key; // 返回键名作为回退
    }
}

/**
 * 变量插值
 * @param {string} text - 原始文本
 * @param {Object} variables - 变量对象
 * @returns {string} 插值后的文本
 */
interpolateVariables(text, variables) {
    try {
        let interpolatedText = text;

        // 使用正则表达式替换变量
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            interpolatedText = interpolatedText.replace(regex, value);
        }

        return interpolatedText;

    } catch (error) {
        this.log(`变量插值失败: ${error.message}`, 'error');
        return text;
    }
}

/**
 * 更新页面文本
 * @param {boolean} forceUpdate - 是否强制更新
 * @returns {Promise<void>}
 */
async updatePageTexts(forceUpdate = false) {
    try {
        this.log('🔄 开始更新页面文本...', 'debug');

        // 获取所有需要翻译的元素
        const translatableElements = document.querySelectorAll('[data-i18n], [data-i18n-title], [data-i18n-placeholder]');

        this.log(`🔍 找到 ${translatableElements.length} 个可翻译元素`, 'debug');

        // 批量更新文本
        const batchSize = 50;
        for (let i = 0; i < translatableElements.length; i += batchSize) {
            const batch = Array.from(translatableElements).slice(i, i + batchSize);
            
            batch.forEach(element => {
                this.translateElement(element, forceUpdate);
            });

            // 避免阻塞UI线程
            if (i + batchSize < translatableElements.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        this.log('✅ 页面文本更新完成', 'success');

        // 触发更新完成事件
        this.emit('textUpdated', {
            language: this.currentLang,
            elementCount: translatableElements.length
        });

    } catch (error) {
        this.log(`❌ 更新页面文本失败: ${error.message}`, 'error');
    }
}

/**
 * 翻译单个元素
 * @param {HTMLElement} element - 要翻译的元素
 * @param {boolean} forceUpdate - 是否强制更新
 */
translateElement(element, forceUpdate = false) {
    try {
        // 检查元素是否需要更新
        const lastLang = element.dataset.lastLang || '';
        if (!forceUpdate && lastLang === this.currentLang) {
            return; // 已经是当前语言，无需更新
        }

        // 翻译文本内容
        const i18nKey = element.dataset.i18n;
        if (i18nKey) {
            const translation = this.getText(i18nKey);
            if (translation !== i18nKey || forceUpdate) {
                element.textContent = translation;
            }
        }

        // 翻译标题属性
        const i18nTitleKey = element.dataset.i18nTitle;
        if (i18nTitleKey) {
            const titleTranslation = this.getText(i18nTitleKey);
            if (titleTranslation !== i18nTitleKey || forceUpdate) {
                element.title = titleTranslation;
            }
        }

        // 翻译占位符属性
        const i18nPlaceholderKey = element.dataset.i18nPlaceholder;
        if (i18nPlaceholderKey) {
            const placeholderTranslation = this.getText(i18nPlaceholderKey);
            if (placeholderTranslation !== i18nPlaceholderKey || forceUpdate) {
                element.placeholder = placeholderTranslation;
            }
        }

        // 记录最后更新的语言
        element.dataset.lastLang = this.currentLang;

    } catch (error) {
        this.log(`翻译元素失败: ${error.message}`, 'error');
    }
}
```

### 语言包缓存实现

```javascript
/**
 * 缓存翻译结果
 * @param {string} lang - 语言代码
 * @param {Object} translations - 翻译对象
 */
cacheTranslation(lang, translations) {
    try {
        const cacheKey = `i18n_${lang}`;
        const cacheEntry = {
            data: translations,
            timestamp: Date.now(),
            expiry: Date.now() + this.options.cacheTimeout
        };

        this.translationCache.set(cacheKey, cacheEntry);
        this.log(`キャッシング 已缓存语言包: ${lang}`, 'debug');

    } catch (error) {
        this.log(`缓存语言包失败: ${error.message}`, 'error');
    }
}

/**
 * 获取缓存的翻译结果
 * @param {string} lang - 语言代码
 * @returns {Object|null} 缓存的翻译对象或null
 */
getCachedTranslation(lang) {
    try {
        const cacheKey = `i18n_${lang}`;

        if (this.translationCache.has(cacheKey)) {
            const cacheEntry = this.translationCache.get(cacheKey);

            // 检查是否过期
            if (Date.now() > cacheEntry.expiry) {
                this.translationCache.delete(cacheKey);
                this.log(`キャッシング 语言包缓存已过期: ${lang}`, 'debug');
                return null;
            }

            this.log(`キャッシング 从缓存获取语言包: ${lang}`, 'debug');
            return cacheEntry.data;

        } else {
            this.log(`キャッシング 未找到语言包缓存: ${lang}`, 'debug');
            return null;
        }

    } catch (error) {
        this.log(`获取缓存翻译失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 清除语言包缓存
 * @param {string} lang - 可选的语言代码，如果不提供则清除所有缓存
 */
clearTranslationCache(lang = null) {
    try {
        if (lang) {
            const cacheKey = `i18n_${lang}`;
            this.translationCache.delete(cacheKey);
            this.log(`キャッシング 已清除语言包缓存: ${lang}`, 'debug');
        } else {
            const cacheSize = this.translationCache.size;
            this.translationCache.clear();
            this.cacheHits = 0;
            this.cacheMisses = 0;
            this.log(`キャッシング 已清除所有语言包缓存 (${cacheSize} 个项目)`, 'debug');
        }

    } catch (error) {
        this.log(`清除语言包缓存失败: ${error.message}`, 'error');
    }
}

/**
 * 获取缓存信息
 * @returns {Object} 缓存统计信息
 */
getCacheInfo() {
    try {
        const totalRequests = this.cacheHits + this.cacheMisses;
        const hitRate = totalRequests > 0 ? Math.round((this.cacheHits / totalRequests) * 100) : 0;

        return {
            size: this.translationCache.size,
            hits: this.cacheHits,
            misses: this.cacheMisses,
            hitRate: hitRate,
            hitRatio: totalRequests > 0 ? (this.cacheHits / totalRequests).toFixed(2) : '0.00'
        };

    } catch (error) {
        this.log(`获取缓存信息失败: ${error.message}`, 'error');
        return {
            size: 0,
            hits: 0,
            misses: 0,
            hitRate: 0,
            hitRatio: '0.00'
        };
    }
}
```

### 事件系统实现

```javascript
/**
 * 触发语言变更事件
 * @param {string} oldLang - 旧语言
 * @param {string} newLang - 新语言
 */
emitLanguageChange(oldLang, newLang) {
    try {
        // 触发自定义事件
        const event = new CustomEvent('languagechange', {
            detail: {
                oldLanguage: oldLang,
                newLanguage: newLang,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);

        // 触发通用变更事件
        this.emit('languageChange', {
            oldLanguage: oldLang,
            newLanguage: newLang
        });

        this.log(`🔊 语言变更事件已触发: ${oldLang} -> ${newLang}`, 'debug');

    } catch (error) {
        this.log(`触发语言变更事件失败: ${error.message}`, 'error');
    }
}

/**
 * 添加语言变更监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addLanguageChangeListener(listener) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }

        // 添加到变更监听器列表
        this.changeListeners.push(listener);

        this.log('👂 已添加语言变更监听器', 'debug');

        // 返回移除监听器的函数
        return () => {
            const index = this.changeListeners.indexOf(listener);
            if (index !== -1) {
                this.changeListeners.splice(index, 1);
                this.log('👂 已移除语言变更监听器', 'debug');
            }
        };

    } catch (error) {
        this.log(`添加语言变更监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数以防调用错误
    }
}

/**
 * 移除语言变更监听器
 * @param {Function} listener - 监听器函数
 */
removeLanguageChangeListener(listener) {
    try {
        const index = this.changeListeners.indexOf(listener);
        if (index !== -1) {
            this.changeListeners.splice(index, 1);
            this.log('👂 已移除语言变更监听器', 'debug');
        }

    } catch (error) {
        this.log(`移除语言变更监听器失败: ${error.message}`, 'error');
    }
}
```

## 语言包格式

### JSON结构

```json
{
  "common": {
    "projectInfo": "项目信息",
    "connectionStatus": "连接状态",
    "notConnected": "未连接",
    "version": "版本",
    "path": "路径",
    "project": "项目",
    "composition": "合成",
    "eagle": "Eagle",
    "library": "资源库",
    "currentGroup": "当前组",
    "importModeBehavior": "导入模式&行为",
    "directImport": "直接导入",
    "projectAdjacentCopy": "项目旁复制",
    "customFolder": "指定文件夹",
    "doNotImportToComp": "不导入合成",
    "createPrecomp": "创建预合成",
    "currentTime": "当前时间",
    "timelineStart": "时间轴开始",
    "detectLayers": "检测图层",
    "exportLayers": "导出图层",
    "exportToEagle": "导出到Eagle",
    "statusInfo": "状态信息",
    "waitingForImport": "等待导入请求...",
    "log": "日志",
    "clearLog": "清理日志",
    "switchLog": "切换到Eagle日志",
    "settings": "高级设置",
    "themeToggle": "切换明暗模式",
    "showHideLog": "显示/隐藏日志",
    "testConnection": "点击测试连接",
    "chooseTargetFolder": "选择目标文件夹",
    "dragFolderHere": "将文件夹拖拽到这里",
    "orClickSelect": "或点击选择文件夹",
    "manualPathInput": "或手动输入路径：",
    "inputFolderPath": "输入文件夹路径...",
    "customFolderName": "或输入自定义文件夹名",
    "validate": "验证",
    "cancel": "取消",
    "confirm": "确认",
    "advancedSettings": "高级设置",
    "importMode": "导入模式",
    "importBehavior": "导入行为",
    "exportPathSettings": "导出路径设置",
    "desktopExport": "桌面导出",
    "projectAdjacentExport": "项目旁导出",
    "automaticCopy": "自动复制",
    "burnAfterReading": "阅后即焚",
    "timestampPrefix": "时间戳前缀",
    "compositionNamePrefix": "合成名前缀",
    "communicationSettings": "通信设置",
    "communicationPortSettings": "通信端口设置",
    "communicationPort": "通信端口",
    "portRange": "端口范围: 1024-65535，修改后需重新连接",
    "uiSettings": "UI 设置",
    "theme": "主题",
    "language": "语言",
    "log": "日志",
    "logPanel": "日志面板",
    "presetManagement": "预设管理",
    "resetToDefault": "重置默认",
    "openPresetDirectory": "打开预设目录",
    "customPresetDirectory": "自定义预设目录",
    "projectAdjacentSettings": "项目旁复制设置",
    "customFolderSettings": "指定文件夹设置",
    "selectFolder": "选择目标文件夹路径",
    "recentlyUsedFolders": "最近使用的文件夹",
    "deleteRecord": "删除此记录",
    "userCancelled": "用户取消了文件夹选择",
    "invalidFolderPath": "请选择文件夹路径",
    "folderNameInvalidChars": "文件夹名称只能包含字母、数字、下划线、中划线和中文字符",
    "pleaseEnterFolderName": "请输入自定义文件夹名称",
    "invalidPortRange": "端口必须在1024-65535范围内",
    "settingsSaved": "设置已保存",
    "connectionTest": "连接测试",
    "connectionTestSuccess": "连接测试成功！",
    "connectionTestFailed": "连接测试失败：",
    "language": "语言",
    "switchLanguage": "切换语言",
    "unknown": "未知",
    "none": "无",
    "noProjectOpen": "未打开项目",
    "connectedDemo": "已连接 (演示)",
    "disconnectedDemo": "未连接 (演示)",
    "connectingDemo": "连接中 (演示)",
    "connectionErrorDemo": "连接失败 (演示)",
    "connecting": "连接中...",
    "disconnecting": "断开连接中...",
    "connected": "已连接"
  },
  "tooltips": {
    "directImport": "从源目录直接导入到AE项目，不复制文件",
    "projectAdjacentCopy": "复制文件到AE项目文件旁边后导入",
    "customFolder": "复制文件到指定文件夹后导入",
    "currentTime": "将素材放置在当前时间指针位置",
    "timelineStart": "将素材移至时间轴开始处（0秒位置）",
    "detectLayers": "检测当前合成中的图层",
    "exportLayers": "导出选中的图层",
    "exportToEagle": "将AE图层数据导出到Eagle资源库",
    "desktopExport": "直接导出到桌面",
    "projectAdjacentExport": "导出到AE项目文件旁边的文件夹（与导入模式设置一致）",
    "customFolderExport": "导出到指定文件夹（与导入模式设置一致）",
    "automaticCopy": "导出完成后自动复制导出路径和文件到剪切板，可直接粘贴使用",
    "burnAfterReading": "启用后图片导出到临时文件夹，导出后复制到剪切板。\n文件累计超过100MB或100个文件后自动清空。\nAlt+点击清空，Ctrl+点击打开临时文件夹。",
    "timestampPrefix": "在导出文件夹名称前添加时间戳，如：20240101_120000_Export",
    "compositionNamePrefix": "在导出文件夹名称前添加当前合成名称，如：MyComp_Export",
    "resetToDefault": "重置为默认并写入预设JSON",
    "openPresetDirectory": "打开当前预设目录",
    "customPresetDirectory": "自定义预设目录",
    "uiToggleTheme": "点击切换主题按钮的显示/隐藏",
    "uiToggleLanguage": "点击切换语言按钮的显示/隐藏",
    "uiToggleLog": "点击切换日志按钮的显示/隐藏",
    "uiToggleProjectInfo": "点击切换项目信息面板的显示/隐藏",
    "uiToggleLogPanel": "点击切换日志面板的显示/隐藏"
  }
}
```

## 使用指南

### 基本使用

#### 语言切换
```javascript
// 创建国际化管理器实例
const i18nManager = new I18nManager({
    defaultLanguage: 'zh-CN',
    supportedLanguages: ['zh-CN', 'en-US'],
    fallbackLanguage: 'zh-CN'
});

// 切换语言
await i18nManager.setLanguage('en-US');

// 切换语言（自动更新UI）
await i18nManager.toggleLanguage();

// 获取翻译文本
const translatedText = i18nManager.getText('common.projectInfo');
console.log(translatedText); // 输出: "Project Information" (英文) 或 "项目信息" (中文)
```

#### 动态文本更新
```javascript
// 更新页面文本
await i18nManager.updatePageTexts();

// 强制更新页面文本
await i18nManager.updatePageTexts(true);

// 翻译特定元素
const element = document.querySelector('[data-i18n="common.projectInfo"]');
i18nManager.translateElement(element);
```

#### 事件监听
```javascript
// 添加语言变更监听器
const removeListener = i18nManager.addLanguageChangeListener((oldLang, newLang) => {
    console.log(`语言已从 ${oldLang} 变更为 ${newLang}`);
    
    // 根据新语言更新UI
    updateUIForLanguage(newLang);
});

// 使用完成后移除监听器
// removeListener();

// 监听语言变更事件
document.addEventListener('languagechange', (event) => {
    const { oldLanguage, newLanguage } = event.detail;
    console.log(`语言变更事件: ${oldLanguage} -> ${newLanguage}`);
    
    // 处理语言变更
    handleLanguageChange(oldLanguage, newLanguage);
});
```

### 高级使用

#### 变量插值
```javascript
// 使用变量插值
const message = i18nManager.getText('common.connectionTestFailed', {
    error: '连接超时'
});
console.log(message); // 输出: "Connection test failed: 连接超时"
```

#### 自定义翻译函数
```javascript
// 添加自定义翻译函数
i18nManager.addCustomTranslator('plurals', (key, count) => {
    // 处理复数形式
    const pluralForms = {
        'file': ['文件', '文件'], // 中文没有复数形式
        'files': ['file', 'files'] // 英文有复数形式
    };
    
    const forms = pluralForms[key] || [key, key];
    return count === 1 ? forms[0] : forms[1];
});

// 使用自定义翻译函数
const pluralText = i18nManager.translate('plurals', 'files', 5);
console.log(pluralText); // 输出: "files"
```

#### 语言包热加载
```javascript
// 热加载语言包
async function hotReloadLanguagePack(lang) {
    try {
        // 清除缓存
        i18nManager.clearTranslationCache(lang);
        
        // 重新加载语言包
        const loadResult = await i18nManager.loadLanguagePack(lang);
        
        if (loadResult.success) {
            // 更新UI
            await i18nManager.updatePageTexts(true);
            
            console.log(`✅ 语言包 ${lang} 热加载成功`);
        } else {
            console.error(`❌ 语言包 ${lang} 热加载失败: ${loadResult.error}`);
        }
        
    } catch (error) {
        console.error(`热加载语言包异常: ${error.message}`);
    }
}
```

## 最佳实践

### 语言包开发建议

#### 结构化组织
```json
{
  "common": {
    "navigation": {
      "home": "首页",
      "about": "关于",
      "contact": "联系"
    },
    "actions": {
      "save": "保存",
      "delete": "删除",
      "cancel": "取消",
      "confirm": "确认"
    },
    "status": {
      "loading": "加载中...",
      "success": "成功",
      "error": "错误",
      "warning": "警告"
    }
  },
  "pages": {
    "home": {
      "title": "主页",
      "welcome": "欢迎使用Eagle2Ae",
      "description": "连接Eagle与After Effects的强大工具"
    },
    "settings": {
      "title": "设置",
      "general": "通用设置",
      "advanced": "高级设置",
      "import": "导入设置",
      "export": "导出设置"
    }
  },
  "components": {
    "dialog": {
      "confirm": {
        "title": "确认操作",
        "message": "您确定要执行此操作吗？",
        "buttons": {
          "confirm": "确认",
          "cancel": "取消"
        }
      },
      "alert": {
        "title": "提示",
        "buttons": {
          "ok": "确定"
        }
      }
    }
  }
}
```

#### 一致性原则
```javascript
// 保持术语一致性
const consistentTerms = {
    'zh-CN': {
        'import': '导入',
        'export': '导出',
        'settings': '设置',
        'preferences': '偏好',
        'configuration': '配置',
        'options': '选项'
    },
    'en-US': {
        'import': 'Import',
        'export': 'Export',
        'settings': 'Settings',
        'preferences': 'Preferences',
        'configuration': 'Configuration',
        'options': 'Options'
    }
};
```

#### 上下文感知
```javascript
// 根据上下文提供不同的翻译
const contextAwareTranslations = {
    'save': {
        'file': '保存文件',
        'project': '保存项目',
        'preset': '保存预设',
        'default': '保存'
    },
    'delete': {
        'file': '删除文件',
        'project': '删除项目',
        'preset': '删除预设',
        'default': '删除'
    }
};

// 在代码中使用上下文感知翻译
function getTranslatedText(key, context = 'default') {
    const translations = contextAwareTranslations[key];
    return translations ? translations[context] || translations.default : key;
}
```

### 性能优化

#### 缓存策略
```javascript
// 实现LRU缓存
class LRUCache {
    constructor(maxSize = 100) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }
    
    get(key) {
        if (this.cache.has(key)) {
            const value = this.cache.get(key);
            // 更新访问顺序
            this.cache.delete(key);
            this.cache.set(key, value);
            return value;
        }
        return undefined;
    }
    
    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // 移除最少使用的项
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, value);
    }
}

// 使用LRU缓存优化翻译性能
const translationCache = new LRUCache(200);

function getCachedTranslation(key, lang) {
    const cacheKey = `${lang}_${key}`;
    return translationCache.get(cacheKey);
}

function setCachedTranslation(key, lang, value) {
    const cacheKey = `${lang}_${key}`;
    translationCache.set(cacheKey, value);
}
```

#### 批量更新
```javascript
// 批量更新文本以提高性能
async function batchUpdateTexts(elements, translations) {
    const batchSize = 50;
    
    for (let i = 0; i < elements.length; i += batchSize) {
        const batch = elements.slice(i, i + batchSize);
        
        batch.forEach(element => {
            const key = element.dataset.i18n;
            if (key && translations[key]) {
                element.textContent = translations[key];
            }
        });
        
        // 避免阻塞UI线程
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}
```

#### 防抖处理
```javascript
// 使用防抖避免频繁的语言切换
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

// 防抖处理语言切换
const debouncedLanguageChange = debounce((lang) => {
    i18nManager.setLanguage(lang);
}, 300);
```

## 故障排除

### 常见问题

#### 翻译文本未更新
- **症状**：切换语言后部分文本未更新
- **解决**：
  1. 检查元素是否正确添加了data-i18n属性
  2. 验证语言包中是否包含对应键的翻译
  3. 手动调用i18n.updatePageTexts()方法

#### 语言包加载失败
- **症状**：无法加载语言包，显示默认文本
- **解决**：
  1. 检查语言包文件路径是否正确
  2. 验证JSON格式是否有效
  3. 确认网络连接是否正常

#### 语言切换按钮无反应
- **症状**：点击语言切换按钮后无任何反应
- **解决**：
  1. 检查按钮事件监听器是否正确绑定
  2. 验证localStorage权限
  3. 重启AE和扩展面板

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控语言变更事件
document.addEventListener('languagechange', (event) => {
    console.log('语言变更事件:', event.detail);
});

// 监控翻译过程
i18nManager.addListener((eventType, data) => {
    if (eventType === 'textUpdated') {
        console.log('文本更新完成:', data);
    } else if (eventType === 'languageChange') {
        console.log('语言变更:', data);
    }
});
```

#### 检查缓存状态
```javascript
// 检查翻译缓存状态
function inspectTranslationCache() {
    const cacheInfo = i18nManager.getCacheInfo();
    console.log('翻译缓存信息:', cacheInfo);
    
    // 检查缓存命中率
    if (cacheInfo.hitRate < 50) {
        console.warn('缓存命中率较低，请检查翻译调用模式');
    }
}
```

#### 性能监控
```javascript
// 监控翻译性能
const performanceMarkers = [];

function markTranslationStep(step) {
    performance.mark(`translation-${step}`);
    performanceMarkers.push(step);
}

function measureTranslationPerformance() {
    for (let i = 1; i < performanceMarkers.length; i++) {
        const start = `translation-${performanceMarkers[i-1]}`;
        const end = `translation-${performanceMarkers[i]}`;
        performance.measure(`translation-${performanceMarkers[i-1]}-to-${performanceMarkers[i]}`, start, end);
    }
    
    const measures = performance.getEntriesByType('measure');
    measures.forEach(measure => {
        console.log(`⏱️ ${measure.name}: ${measure.duration}ms`);
    });
}
```

## 扩展性

### 自定义扩展

#### 扩展国际化管理器
```javascript
// 创建自定义国际化管理器
class CustomI18nManager extends I18nManager {
    constructor(options = {}) {
        super(options);
        this.customTranslators = new Map();
        this.translationHooks = new Map();
    }
    
    /**
     * 添加自定义翻译器
     * @param {string} name - 翻译器名称
     * @param {Function} translator - 翻译器函数
     */
    addCustomTranslator(name, translator) {
        this.customTranslators.set(name, translator);
    }
    
    /**
     * 执行自定义翻译器
     * @param {string} name - 翻译器名称
     * @param {...any} args - 参数
     * @returns {any} 翻译结果
     */
    executeCustomTranslator(name, ...args) {
        const translator = this.customTranslators.get(name);
        if (translator && typeof translator === 'function') {
            return translator(...args);
        }
        throw new Error(`未知的自定义翻译器: ${name}`);
    }
    
    /**
     * 添加翻译钩子
     * @param {string} hookPoint - 钩子点
     * @param {Function} hook - 钩子函数
     */
    addTranslationHook(hookPoint, hook) {
        if (!this.translationHooks.has(hookPoint)) {
            this.translationHooks.set(hookPoint, []);
        }
        
        this.translationHooks.get(hookPoint).push(hook);
    }
    
    /**
     * 执行翻译钩子
     * @param {string} hookPoint - 钩子点
     * @param {...any} args - 参数
     */
    executeTranslationHooks(hookPoint, ...args) {
        if (this.translationHooks.has(hookPoint)) {
            const hooks = this.translationHooks.get(hookPoint);
            hooks.forEach(hook => {
                try {
                    hook(...args);
                } catch (error) {
                    this.log(`翻译钩子执行失败: ${error.message}`, 'error');
                }
            });
        }
    }
}

// 使用自定义国际化管理器
const customI18nManager = new CustomI18nManager({
    defaultLanguage: 'zh-CN',
    supportedLanguages: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
    fallbackLanguage: 'zh-CN'
});

// 添加自定义翻译器
customI18nManager.addCustomTranslator('plurals', (count, singular, plural) => {
    return count === 1 ? singular : plural;
});

// 添加翻译钩子
customI18nManager.addTranslationHook('beforeTranslate', (key, lang) => {
    console.log(`准备翻译: ${key} (${lang})`);
});

customI18nManager.addTranslationHook('afterTranslate', (key, lang, result) => {
    console.log(`翻译完成: ${key} (${lang}) -> ${result}`);
});
```

#### 插件化架构
```javascript
// 创建国际化插件
class I18nPlugin {
    constructor(i18nManager) {
        this.i18nManager = i18nManager;
        this.init();
    }
    
    init() {
        // 注册插件特定的语言包
        this.registerPluginLanguagePacks();
        
        // 添加插件特定的翻译器
        this.addPluginTranslators();
        
        // 绑定插件事件
        this.bindPluginEvents();
    }
    
    /**
     * 注册插件特定的语言包
     */
    registerPluginLanguagePacks() {
        const pluginLanguagePacks = {
            'zh-CN': {
                'plugin.name': '插件名称',
                'plugin.description': '插件描述',
                'plugin.version': '插件版本'
            },
            'en-US': {
                'plugin.name': 'Plugin Name',
                'plugin.description': 'Plugin Description',
                'plugin.version': 'Plugin Version'
            }
        };
        
        Object.entries(pluginLanguagePacks).forEach(([lang, translations]) => {
            // 合并到现有语言包
            const existingTranslations = this.i18nManager.translations.get(lang) || {};
            const mergedTranslations = { ...existingTranslations, ...translations };
            this.i18nManager.translations.set(lang, mergedTranslations);
        });
    }
    
    /**
     * 添加插件特定的翻译器
     */
    addPluginTranslators() {
        // 添加日期格式化翻译器
        this.i18nManager.addCustomTranslator('dateFormat', (date, format, lang) => {
            const options = {
                'zh-CN': {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                },
                'en-US': {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }
            };
            
            return new Intl.DateTimeFormat(lang, options[lang]).format(date);
        });
        
        // 添加数字格式化翻译器
        this.i18nManager.addCustomTranslator('numberFormat', (number, lang) => {
            return new Intl.NumberFormat(lang).format(number);
        });
    }
    
    /**
     * 绑定插件事件
     */
    bindPluginEvents() {
        // 监听语言变更事件
        this.i18nManager.addLanguageChangeListener((oldLang, newLang) => {
            this.handleLanguageChange(oldLang, newLang);
        });
        
        // 监听文本更新事件
        this.i18nManager.addListener((eventType, data) => {
            if (eventType === 'textUpdated') {
                this.handleTextUpdated(data);
            }
        });
    }
    
    /**
     * 处理语言变更
     * @param {string} oldLang - 旧语言
     * @param {string} newLang - 新语言
     */
    handleLanguageChange(oldLang, newLang) {
        console.log(`插件: 语言已从 ${oldLang} 变更为 ${newLang}`);
        
        // 执行插件特定的逻辑
        this.updatePluginUI(newLang);
    }
    
    /**
     * 处理文本更新
     * @param {Object} data - 更新数据
     */
    handleTextUpdated(data) {
        console.log(`插件: 文本已更新，语言: ${data.language}，元素数: ${data.elementCount}`);
        
        // 执行插件特定的逻辑
        this.refreshPluginTexts(data);
    }
    
    /**
     * 更新插件UI
     * @param {string} lang - 语言代码
     */
    updatePluginUI(lang) {
        // 更新插件UI元素
        const pluginElements = document.querySelectorAll('[data-plugin-i18n]');
        pluginElements.forEach(element => {
            const key = element.dataset.pluginI18n;
            const translation = this.i18nManager.getText(key);
            element.textContent = translation;
        });
    }
    
    /**
     * 刷新插件文本
     * @param {Object} data - 更新数据
     */
    refreshPluginTexts(data) {
        // 刷新插件特定的文本元素
        const pluginTextElements = document.querySelectorAll('.plugin-text');
        pluginTextElements.forEach(element => {
            // 执行插件特定的文本刷新逻辑
            this.refreshPluginTextElement(element, data);
        });
    }
    
    /**
     * 刷新插件文本元素
     * @param {HTMLElement} element - 文本元素
     * @param {Object} data - 更新数据
     */
    refreshPluginTextElement(element, data) {
        // 执行元素特定的刷新逻辑
        const elementType = element.dataset.type || 'default';
        
        switch (elementType) {
            case 'date':
                // 刷新日期显示
                const currentDate = new Date();
                element.textContent = this.i18nManager.executeCustomTranslator(
                    'dateFormat', 
                    currentDate, 
                    'full', 
                    data.language
                );
                break;
                
            case 'number':
                // 刷新数字显示
                const currentNumber = parseFloat(element.textContent) || 0;
                element.textContent = this.i18nManager.executeCustomTranslator(
                    'numberFormat', 
                    currentNumber, 
                    data.language
                );
                break;
                
            default:
                // 默认刷新逻辑
                break;
        }
    }
}

// 应用插件
const plugin = new I18nPlugin(i18nManager);