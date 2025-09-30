// KBar 语言设置
(function() {
    // 设置默认语言为中文
    window.KBarDefaultLanguage = 'zh_CN';
    
    // 加载语言后的回调函数
    window.KBarLanguageLoaded = function() {
        console.log('KBar 中文语言包已加载');
        
        // 自动应用中文
        if (typeof window.translateUi === 'function') {
            window.translateUi();
        }
    };
    
    // 添加对CEP扩展区域设置的支持
    if (typeof window.cep !== 'undefined' && window.cep.util && window.cep.util.getCurrentLanguage) {
        // 如果系统语言为中文，自动使用中文
        var systemLanguage = window.cep.util.getCurrentLanguage();
        if (systemLanguage.indexOf('zh') === 0) {
            window.KBarDefaultLanguage = 'zh_CN';
        }
    }
})(); 