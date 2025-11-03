// 控制台日志去重工具
// 用于减少浏览器控制台中的重复日志

class ConsoleDeduplicator {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.timeout = options.timeout || 1000; // 1秒内的重复日志会被合并
        this.suppressFilter = options.suppressFilter || null; // 可选的日志抑制过滤器
        this.recentLogs = new Map();
        this.originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            debug: console.debug
        };

        if (this.enabled) {
            this.install();
        }
    }

    install() {
        const self = this;

        ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            console[method] = function (...args) {
                // 先检查抑制过滤器
                if (self.suppressFilter && self.suppressFilter(method, args)) {
                    return;
                }
                // 再检查去重
                if (self.shouldLog(method, args)) {
                    self.originalConsole[method].apply(console, args);
                }
            };
        });
    }

    shouldLog(method, args) {
        const now = Date.now();
        // 优化：使用哈希而不是字符串拼接，避免长字符串
        const key = this.generateKey(method, args);

        if (this.recentLogs.has(key)) {
            const lastTime = this.recentLogs.get(key);
            if (now - lastTime < this.timeout) {
                return false; // 跳过重复日志
            }
        }

        this.recentLogs.set(key, now);

        // 优化：只在必要时清理，减少频率
        if (this.recentLogs.size > 100) {
            this.cleanup(now);
        }

        return true;
    }

    generateKey(method, args) {
        // 对于长参数，使用截断 + 哈希的方式
        const argsStr = args.map(arg => 
            typeof arg === 'string' && arg.length > 50 
                ? arg.substring(0, 50) + '...' 
                : String(arg)
        ).join('|');
        
        return `${method}:${argsStr}`;
    }

    cleanup(now) {
        for (const [key, time] of this.recentLogs.entries()) {
            if (now - time > this.timeout * 2) {
                this.recentLogs.delete(key);
            }
        }
    }

    uninstall() {
        ['log', 'warn', 'error', 'info', 'debug'].forEach(method => {
            console[method] = this.originalConsole[method];
        });
        this.recentLogs.clear();
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.install();
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.uninstall();
        }
    }
}

// 配置常量
const LOG_CONFIG = {
    THIRD_PARTY_KEYWORDS: ['SpeedyPlay', 'TimeHooker', 'Time Hooker', 'Less has finished'],
    DEMO_INIT_KEYWORDS: ['演示模式', 'Demo', '虚拟文件系统', '网络拦截器', 'UI管理器'],
    TIMEOUT: 500,
    MAIN_PANEL: 'panel1'
};

// 工具函数
const getPanelId = () => {
    try {
        return new URLSearchParams(window.location.search).get('panel') || 'unknown';
    } catch (e) {
        return 'unknown';
    }
};

const createSuppressFilter = (panelId) => (method, args) => {
    const text = args.join(' ');

    // 全局抑制第三方扩展日志
    if (LOG_CONFIG.THIRD_PARTY_KEYWORDS.some(keyword => text.includes(keyword))) {
        return true;
    }

    // 只抑制非主面板的演示初始化日志
    if (method === 'log' && panelId !== LOG_CONFIG.MAIN_PANEL) {
        return LOG_CONFIG.DEMO_INIT_KEYWORDS.some(keyword => text.includes(keyword));
    }

    return false;
};

// 自动启用
if (typeof window !== 'undefined') {
    const panelId = getPanelId();

    window.consoleDeduplicator = new ConsoleDeduplicator({
        enabled: true,
        timeout: LOG_CONFIG.TIMEOUT,
        suppressFilter: createSuppressFilter(panelId)
    });
}
