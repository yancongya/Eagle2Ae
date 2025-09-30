// KBar 翻译注入脚本
(function() {
    // 翻译UI的主函数
    window.translateUi = function() {
        if (!window.KBarTranslations) {
            console.warn('KBar翻译数据未找到，无法应用翻译');
            return;
        }
        
        // 开始翻译DOM元素
        translateText(document.body);
        
        // 翻译文档标题
        if (document.title && window.KBarTranslations[document.title]) {
            document.title = window.KBarTranslations[document.title];
        }
    };
    
    // 等待 DOM 加载完成
    document.addEventListener('DOMContentLoaded', function() {
        // 确定要加载的语言
        var langToLoad = 'zh_CN';
        
        // 如果有设置默认语言，则使用该语言
        if (window.KBarDefaultLanguage) {
            langToLoad = window.KBarDefaultLanguage;
        }
        
        // 注入中文翻译文件
        var script = document.createElement('script');
        script.src = 'js/' + langToLoad + '.js';
        document.head.appendChild(script);

        // 等待翻译文件加载完成
        script.onload = function() {
            // 应用翻译
            window.translateUi();
            
            // 调用语言加载完成的回调
            if (typeof window.KBarLanguageLoaded === 'function') {
                window.KBarLanguageLoaded();
            }
            
            // 监听动态内容变化
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(translateText);
                });
            });

            // 配置观察器
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        };
        
        // 处理加载失败的情况
        script.onerror = function() {
            console.warn('无法加载' + langToLoad + '语言文件');
        };
    });
    
    // 翻译函数
    function translateText(element) {
        // 不处理null或undefined
        if (!element) return;
            
        // 翻译文本节点
        if (element.nodeType === 3 && element.nodeValue && element.nodeValue.trim()) {
            let text = element.nodeValue.trim();
            if (window.KBarTranslations && window.KBarTranslations[text]) {
                element.nodeValue = window.KBarTranslations[text];
            }
        }
        
        // 翻译元素属性
        if (element.nodeType === 1) {
            // 翻译通用属性
            const attrsToTranslate = ['title', 'placeholder', 'value', 'alt', 'aria-label'];
            
            attrsToTranslate.forEach(attr => {
                if (element[attr] && window.KBarTranslations && window.KBarTranslations[element[attr]]) {
                    element[attr] = window.KBarTranslations[element[attr]];
                }
            });
            
            // 处理特殊的loc-key属性
            if (element.hasAttribute('loc-key')) {
                const locKey = element.getAttribute('loc-key');
                const transValue = window.KBarTranslations && window.KBarTranslations[locKey];
                if (transValue) {
                    element.textContent = transValue;
                }
            }
        }
        
        // 递归翻译子元素
        if (element.childNodes && element.childNodes.length) {
            Array.from(element.childNodes).forEach(translateText);
        }
    }
})(); 