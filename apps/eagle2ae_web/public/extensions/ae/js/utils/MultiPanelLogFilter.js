// 多面板日志过滤器
// 用于减少多个 iframe 同时加载时的重复日志

class MultiPanelLogFilter {
    constructor() {
        this.panelId = this.detectPanelId();
        this.isMainPanel = this.panelId === 'panel1';
        this.suppressedPatterns = [
            // 演示模式相关
            /🎭.*演示模式/,
            /Demo.*initialized/,
            /虚拟文件系统/,
            /网络拦截器/,
            /UI管理器/,
            /演示UI/,
            /Demo UI/,
            /数据覆盖策略/,
            /Data override/,
            
            // 重复的初始化日志
            /CSInterface存在但调用失败/,
            /环境检测结果/,
            /Environment detection/,
            /备份原始API/,
            /Backup original API/,
            /替换API/,
            /Replace API/,
            
            // 音效相关（每个面板都会输出）
            /音效文件已预加载/,
            /Sound file preloaded/,
            /音效播放器初始化/,
            /Sound player initialized/,
            
            // UI设置相关
            /UI Settings.*脚本加载/,
            /UI Settings.*script loaded/,
            /等待 DOMContentLoaded/,
            /Waiting for DOMContentLoaded/,
            
            // 第三方浏览器扩展日志
            /SpeedyPlay/,
            /TimeHooker/,
            /Time Hooker/,
            /Less has finished/,
        ];
        
        // 全局抑制的模式（所有面板都不显示）
        this.globalSuppressedPatterns = [
            /SpeedyPlay Info: waiting/,
            /TimeHooker.*loading/,
            /Less has finished and no sheets were loaded/,
        ];
        
        this.install();
    }
    
    detectPanelId() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('panel') || 'panel1';
        } catch (e) {
            return 'panel1';
        }
    }
    
    shouldSuppressLog(message) {
        const messageStr = String(message);
        
        // 全局抑制的日志（所有面板都不显示）
        if (this.globalSuppressedPatterns.some(pattern => pattern.test(messageStr))) {
            return true;
        }
        
        // 主面板（panel1）显示其他所有日志
        if (this.isMainPanel) {
            return false;
        }
        
        // 其他面板抑制匹配的日志
        return this.suppressedPatterns.some(pattern => pattern.test(messageStr));
    }
    
    install() {
        const self = this;
        const originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug
        };
        
        // 只过滤 log 和 info，保留 warn 和 error
        ['log', 'info'].forEach(method => {
            console[method] = function(...args) {
                const message = args.join(' ');
                if (!self.shouldSuppressLog(message)) {
                    // 为非主面板添加面板标识前缀
                    if (!self.isMainPanel && args.length > 0) {
                        args[0] = `[${self.panelId}] ${args[0]}`;
                    }
                    originalConsole[method].apply(console, args);
                }
            };
        });
        
        // warn 和 error 始终显示，但添加面板标识
        ['warn', 'error'].forEach(method => {
            console[method] = function(...args) {
                if (!self.isMainPanel && args.length > 0) {
                    args[0] = `[${self.panelId}] ${args[0]}`;
                }
                originalConsole[method].apply(console, args);
            };
        });
    }
}

// 在 ConsoleDeduplicator 之前安装
if (typeof window !== 'undefined') {
    window.multiPanelLogFilter = new MultiPanelLogFilter();
}
