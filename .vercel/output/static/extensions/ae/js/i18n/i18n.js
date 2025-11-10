class I18n {
  constructor() {
    // 统一站点与扩展的语言存储键，优先使用扩展键，其次站点键
    const storedLang = localStorage.getItem('language') || localStorage.getItem('lang');
    this.currentLang = storedLang || this.getBrowserLanguage() || 'zh-CN';
    // 将语言写回两个键，确保站点/扩展一致
    try {
      localStorage.setItem('language', this.currentLang);
      localStorage.setItem('lang', this.currentLang);
    } catch (_) {}

    this.translations = {};
    // 预加载多语言字典以支持双语日志组合
    this.allTranslations = {};
    this.ready = this.loadTranslations();
    this.initLanguageToggle();
  }

  getBrowserLanguage() {
    // 检测浏览器语言
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && (browserLang.startsWith('en') || browserLang === 'en-US')) {
      return 'en-US';
    } else if (browserLang && (browserLang.startsWith('zh') || browserLang === 'zh-CN')) {
      return 'zh-CN';
    }
    return null; // 如果不是支持的语言，返回null
  }

  async loadJson(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error('HTTP error ' + response.status);
      const data = await response.json();
      return data;
    } catch (error) {
      // CEP环境下使用本地文件读取作为回退
      try {
        if (window.cep && window.cep.fs && typeof CSInterface !== 'undefined') {
          const cs = new CSInterface();
          const extDir = cs.getSystemPath(SystemPath.EXTENSION);
          const normalized = (extDir.replace(/\\/g, '/') + '/' + path).replace(/\/+/g, '/');
          const res = window.cep.fs.readFile(normalized);
          if (res && res.err === 0 && res.data) {
            return JSON.parse(res.data);
          }
        }
      } catch (e2) {
        console.error('CEP file read failed:', e2);
      }
      // 纯浏览器 file:// 环境下，尝试从内联 <script type="application/json"> 获取
      try {
        const fileName = path.split('/').pop().replace('.json', '');
        const inline = document.getElementById('i18n-' + fileName);
        if (inline && inline.textContent) {
          return JSON.parse(inline.textContent);
        }
      } catch (e3) {
        console.error('Inline JSON fallback failed:', e3);
      }
      throw error;
    }
  }

  async loadTranslations() {
    console.log('[i18n] loadTranslations 开始，语言:', this.currentLang);
    try {
      // 加载当前语言的翻译（支持HTTP与CEP本地文件）
      this.translations = await this.loadJson(`js/i18n/${this.currentLang}.json`);
      // 缓存到多语言字典
      this.allTranslations[this.currentLang] = this.translations;
      console.log('[i18n] 翻译加载成功，keys:', Object.keys(this.translations));
      this.updatePageTexts();
      // 切换后补充动态内容刷新，确保占位文案即时本地化
      try {
        if (typeof updateDynamicContent === 'function') {
          updateDynamicContent(this.currentLang);
        }
      } catch (e) {
        console.warn('Dynamic content update failed:', e);
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
      // 如果加载失败，尝试加载中文默认语言
      if (this.currentLang !== 'zh-CN') {
        try {
          this.translations = await this.loadJson('js/i18n/zh-CN.json');
          this.currentLang = 'zh-CN';
          try {
            localStorage.setItem('language', 'zh-CN');
            localStorage.setItem('lang', 'zh-CN');
          } catch (_) {}
          // 缓存到多语言字典
          this.allTranslations['zh-CN'] = this.translations;
          this.updatePageTexts();
          this.updateLanguageButton();
          // 回退后同样刷新动态内容
          try {
            if (typeof updateDynamicContent === 'function') {
              updateDynamicContent(this.currentLang);
            }
          } catch (e) {
            console.warn('Dynamic content update failed:', e);
          }
        } catch (fallbackErr) {
          console.error('Failed to load fallback zh-CN translations:', fallbackErr);
        }
      }
    }

    // 额外预加载另一种语言以支持双语显示（不阻塞主流程）
    try {
      const otherLang = this.currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
      if (!this.allTranslations[otherLang]) {
        this.loadJson(`js/i18n/${otherLang}.json`).then(data => {
          this.allTranslations[otherLang] = data;
          console.log('[i18n] 已预加载另一语言字典:', otherLang);
        }).catch(err => console.warn('[i18n] 预加载另一语言失败:', otherLang, err));
      }
    } catch (e) {
      console.warn('[i18n] 预加载另一语言异常:', e);
    }
  }

  async switchLanguage(lang) {
    if (lang !== this.currentLang) {
      try {
        // 加载新语言的翻译（支持HTTP与CEP本地文件）
        this.translations = await this.loadJson(`js/i18n/${lang}.json`);
        this.currentLang = lang;
        // 缓存到多语言字典
        this.allTranslations[lang] = this.translations;
        
        // 保存语言设置到本地存储（同步两套键）
        try {
          localStorage.setItem('language', lang);
          localStorage.setItem('lang', lang);
        } catch (_) {}
        
        // 更新页面文本
        this.updatePageTexts();
        
        // 更新语言切换按钮
        this.updateLanguageButton();
        
        // 语言切换后刷新动态内容（占位/状态文案）
        try {
          if (typeof updateDynamicContent === 'function') {
            updateDynamicContent(this.currentLang);
          }
        } catch (e) {
          console.warn('Dynamic content update failed:', e);
        }
      } catch (error) {
        console.error('Failed to load translations for language:', lang, error);
      }
    }
  }

  updatePageTexts() {
    try {
      if (window.__DEBUG_I18N__ || localStorage.getItem('debug_i18n') === '1') {
        console.debug('[i18n] updatePageTexts 被调用，当前语言:', this.currentLang, 'translations 已加载:', !!this.translations.common);
      }
    } catch (_) {}
    // 暂时禁用可能被演示模式监控的元素更新，避免副作用
    // 只更新非连接状态相关的元素
    
    // 更新所有带有data-i18n属性的元素，但跳过连接相关的元素
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      // 排除连接状态相关元素以防止触发演示模式或连接行为
      if (
        element.id === 'status-main' || 
        element.id === 'status-indicator' || 
        element.id === 'ping-time' ||
        element.id === 'ae-version' ||
        element.id === 'project-path' || 
        element.id === 'project-name' || 
        element.id === 'comp-name' ||
        element.id === 'eagle-version' || 
        element.id === 'eagle-path' || 
        element.id === 'eagle-library' || 
        element.id === 'eagle-folder' ||
        element.closest('#test-connection-btn') ||
        element.parentElement?.id === 'test-connection-btn' ||
        element.closest('.connection-status-btn') ||
        element.classList.contains('connection-status-btn')
      ) {
        // 跳过这些元素以避免触发连接行为
        return;
      }
      
      const key = element.getAttribute('data-i18n');
      const text = this.getText(key);
      if (text) {
        if (element.id === 'communicationPortSettingsTitle') {
            console.log(`[i18n.updatePageTexts] 尝试翻译通信端口设置标题: 键: ${key}, 翻译文本: ${text}`);
        }
        console.log(`[i18n.updatePageTexts] 找到 data-i18n 元素: ${element.tagName}#${element.id || element.className}，键: ${key}，翻译文本: ${text}`);
        element.textContent = text;
        // 调试：记录 UI 设置按钮的更新（仅在 debug 开启时输出）
        try {
          if ((window.__DEBUG_I18N__ || localStorage.getItem('debug_i18n') === '1') && element.id && element.id.startsWith('ui-toggle-')) {
            console.debug('[i18n] 更新 UI 按钮:', element.id, '键:', key, '文本:', text);
          }
        } catch (_) {}
      }
    });

    // 更新所有带有data-i18n-title属性的元素的title，但跳过连接按钮
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      // 排除连接按钮以防止触发连接行为
      if (
        element.id === 'test-connection-btn' || 
        element.closest('#test-connection-btn') ||
        element.classList.contains('connection-status-btn')
      ) {
        // 跳过连接按钮title更新以避免触发连接行为
        return;
      }
      
      const key = element.getAttribute('data-i18n-title');
      const title = this.getText(key);
      if (title) {
        element.title = title;
        // 调试：记录 UI 设置按钮的 title 更新（仅在 debug 开启时输出）
        try {
          if ((window.__DEBUG_I18N__ || localStorage.getItem('debug_i18n') === '1') && element.id && element.id.startsWith('ui-toggle-')) {
            console.debug('[i18n] 更新 UI 按钮 title:', element.id, '键:', key, 'title:', title);
          }
        } catch (_) {}
      }
    });

    // 更新所有带有data-i18n-placeholder属性的元素的placeholder
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const placeholder = this.getText(key);
      if (placeholder) {
        element.placeholder = placeholder;
      }
    });

    // 更新所有带有data-i18n-alt属性的元素的alt
    const altElements = document.querySelectorAll('[data-i18n-alt]');
    altElements.forEach(element => {
      const key = element.getAttribute('data-i18n-alt');
      const alt = this.getText(key);
      if (alt) {
        element.alt = alt;
      }
    });
  }

  getText(key) {
    try {
      // 支持嵌套键，例如 'common.projectInfo'
      const keys = key.split('.');
      let value = this.translations;
      for (const k of keys) {
        value = value[k];
        if (value === undefined) {
          return null;
        }
      }
      return value;
    } catch (error) {
      console.warn(`Translation key not found: ${key}`, error);
      return null;
    }
  }

  // 获取指定语言的翻译文本（用于双语日志组合）
  getTextForLang(key, lang) {
    try {
      const dict = (this.allTranslations && this.allTranslations[lang]) || (lang === this.currentLang ? this.translations : null);
      if (!dict) return null;
      const keys = key.split('.');
      let value = dict;
      for (const k of keys) {
        value = value[k];
        if (value === undefined) {
          return null;
        }
      }
      return value;
    } catch (error) {
      return null;
    }
  }

  initLanguageToggle() {
    const toggleBtn = document.getElementById('language-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const newLang = this.currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
        this.switchLanguage(newLang);
      });
      
      // 初始化语言切换按钮显示状态
      this.updateLanguageButton();
    }
  }

  updateLanguageButton() {
    const toggleBtn = document.getElementById('language-toggle-btn');
    if (toggleBtn) {
      if (this.currentLang === 'zh-CN') {
        toggleBtn.innerHTML = '<span class="icon">🇺🇸</span>';
        toggleBtn.title = this.getText('common.switchLanguage') + ' (EN)';
      } else {
        toggleBtn.innerHTML = '<span class="icon">🇨🇳</span>';
        toggleBtn.title = this.getText('common.switchLanguage') + ' (中文)';
      }
    }
  }
}

// 初始化国际化 - 立即执行，不等待DOMContentLoaded
// 这样可以确保在直接打开HTML时也能正常工作
(function initI18n() {
  // 如果DOM还没准备好，等待它
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.i18n = new I18n();
      setupI18nEventHandlers();
    });
  } else {
    // DOM已经准备好，立即初始化
    window.i18n = new I18n();
    setupI18nEventHandlers();
  }
})();

function setupI18nEventHandlers() {
  // 检查是否在iframe中，如果是则尝试从父窗口获取语言设置
  if (window.parent && window !== window.parent) {
    // 向父窗口发送消息，报告当前语言设置
    window.parent.postMessage({
      type: 'AE_EXTENSION_LOADED',
      language: window.i18n.currentLang
    }, '*');
    
    // 监听来自父窗口的语言更新消息
    window.addEventListener('message', function(event) {
      // 确保消息来源是可信的父窗口
      if (event.source !== window.parent && event.source !== window.opener) {
        return;
      }
      
      // 处理语言更新消息
      if (event.data && event.data.type === 'LANGUAGE_UPDATE') {
        const newLang = event.data.language;
        if (newLang && window.i18n && newLang !== window.i18n.currentLang) {
          // 在更新语言前先保存连接状态相关元素的原始状态，避免副作用
          const connectionBtn = document.getElementById('test-connection-btn');
          const statusMain = document.getElementById('status-main');
          const statusIndicator = document.getElementById('status-indicator');
          
          // 保存当前连接状态相关的信息
          const originalBtnClass = connectionBtn ? connectionBtn.className : '';
          const originalBtnTitle = connectionBtn ? connectionBtn.title : '';
          const originalStatusText = statusMain ? statusMain.textContent : '';
          const originalIndicatorClass = statusIndicator ? statusIndicator.className : '';
          
          window.i18n.switchLanguage(newLang);
          
          // 刷新动态内容以应用新语言到占位/状态文本
          try {
            if (typeof updateDynamicContent === 'function') {
              updateDynamicContent(window.i18n.currentLang);
            }
          } catch (e) {
            console.warn('Dynamic content update failed:', e);
          }
          
          // 恢复连接状态相关的UI元素，以避免触发连接行为
          // 只更新语言相关的文本，保持连接状态不变
          if (connectionBtn) {
            // 保留按钮的连接状态类，只更新title
            const hasConnectedClass = connectionBtn.classList.contains('connected');
            connectionBtn.className = originalBtnClass;
            if (hasConnectedClass) {
              connectionBtn.classList.add('connected');
            }
            // 但重新设置title为新语言的title
            const titleKey = hasConnectedClass ? 'titles.connectionButtonConnected' : 'titles.connectionButtonDisconnected';
            const fallbackTitle = hasConnectedClass ? '左键：断开连接\n右键：刷新状态' : '左键：连接到Eagle\n右键：刷新状态';
            const localizedTitle = window.i18n.getText(titleKey) || window.i18n.getText('common.testConnection') || fallbackTitle;
            connectionBtn.title = localizedTitle;
          }
          
          // 恢复状态指示器的类
          if (statusIndicator) {
            statusIndicator.className = originalIndicatorClass;
          }
        }
      }
    });
  }
}