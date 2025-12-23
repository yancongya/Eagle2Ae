// AE扩展日志管理器
// 优化日志记录，减少重复和冗余信息

class LogManager {
    constructor() {
        this.logs = [];
        this.maxLogs = 100; // 最大日志条数
        this.recentMessages = new Map(); // 用于去重
        this.messageTimeout = 2000; // 2秒内的重复消息会被合并（从5秒减少到2秒）
        this.logLevels = {
            'debug': 0,
            'info': 1,
            'success': 2,
            'warning': 3,
            'error': 4
        };
        this.currentLogLevel = 1; // 默认显示info及以上级别
        this.silentPatterns = []; // 静默模式的消息模式
        this.groupedMessages = new Map(); // 分组消息
        this.lastLogTime = 0; // 最后一次日志时间
        this.minLogInterval = 50; // 最小日志间隔（毫秒），防止短时间内大量日志
    }

    /**
     * 读取日志语言模式
     * 可选值：'current' | 'zh-CN' | 'en-US' | 'both'
     */
    getLogLanguageMode() {
        try {
            return localStorage.getItem('logLanguageMode') || 'current';
        } catch (_) {
            return 'current';
        }
    }

    /**
     * 简单模板替换：将 {key} 用 params[key] 替换
     * @param {string} text
     * @param {Object} params
     */
    formatTemplate(text, params = {}) {
        if (!text || typeof text !== 'string') return text;
        return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (m, k) => {
            const v = params[k];
            return v === undefined || v === null ? m : String(v);
        });
    }

    /**
     * 组合i18n消息，支持双语模式
     * @param {string} key - i18n键，例如 'logs.testingConnectionToEagle'
     * @param {Object} params - 模板参数，例如 {total: 7}
     */
    composeI18nMessage(key, params = {}) {
        const mode = this.getLogLanguageMode();
        const zh = window.i18n?.getTextForLang(key, 'zh-CN') || window.i18n?.getText(key);
        const en = window.i18n?.getTextForLang(key, 'en-US');
        const zhMsg = zh ? this.formatTemplate(zh, params) : null;
        const enMsg = en ? this.formatTemplate(en, params) : null;

        switch (mode) {
            case 'both':
                if (zhMsg && enMsg) return `${zhMsg} / ${enMsg}`;
                return zhMsg || enMsg || key;
            case 'en-US':
                return enMsg || zhMsg || key;
            case 'zh-CN':
                return zhMsg || enMsg || key;
            case 'current':
            default:
                // 使用当前语言；如果未找到，回退到中文或英文
                const cur = window.i18n?.getText(key);
                const curMsg = cur ? this.formatTemplate(cur, params) : null;
                return curMsg || zhMsg || enMsg || key;
        }
    }

    /**
     * 记录i18n日志（支持双语）
     * @param {string} key - i18n键
     * @param {string} level - 日志级别
     * @param {Object} params - 模板参数
     * @param {Object} options - 其他选项
     */
    logI18n(key, level = 'info', params = {}, options = {}) {
        const message = this.composeI18nMessage(key, params);
        this.log(message, level, options);
    }

    /**
     * 设置日志级别
     * @param {string} level - debug, info, success, warning, error
     */
    setLogLevel(level) {
        if (this.logLevels.hasOwnProperty(level)) {
            this.currentLogLevel = this.logLevels[level];
        }
    }

    /**
     * 添加静默模式的消息模式
     * @param {string|RegExp} pattern - 要静默的消息模式
     */
    addSilentPattern(pattern) {
        this.silentPatterns.push(pattern);
    }

    /**
     * 检查消息是否应该被静默
     * @param {string} message - 消息内容
     * @returns {boolean}
     */
    shouldBeSilent(message) {
        return this.silentPatterns.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(message);
            }
            return message.includes(pattern);
        });
    }

    /**
     * 优化的日志记录方法
     * @param {string} message - 日志消息
     * @param {string} level - 日志级别
     * @param {Object} options - 选项
     */
    log(message, level = 'info', options = {}) {
        const now = Date.now();
        
        // 防止短时间内大量日志（节流）
        if (now - this.lastLogTime < this.minLogInterval && level === 'debug') {
            return;
        }
        this.lastLogTime = now;
        
        // 检查日志级别
        if (this.logLevels[level] < this.currentLogLevel) {
            return;
        }

        // 检查是否应该静默
        if (this.shouldBeSilent(message)) {
            return;
        }

        // 处理分组消息
        if (options.group) {
            return this.handleGroupedMessage(message, level, options);
        }

        // 处理重复消息
        const processedMessage = this.handleDuplicateMessage(message, level);
        if (!processedMessage) {
            return; // 消息被合并，不显示
        }

        // 创建日志条目
        const logEntry = {
            message: processedMessage,
            level,
            timestamp: now,
            count: options.count || 1
        };

        // 添加到日志列表
        this.addLogEntry(logEntry);

        // 显示日志
        this.displayLog(logEntry);
    }

    /**
     * 处理重复消息
     * @param {string} message - 消息内容
     * @param {string} level - 日志级别
     * @returns {string|null} - 处理后的消息或null（如果被合并）
     */
    handleDuplicateMessage(message, level) {
        const now = Date.now();
        const messageKey = `${level}:${message}`;

        // 检查是否是重复消息
        if (this.recentMessages.has(messageKey)) {
            const lastEntry = this.recentMessages.get(messageKey);
            
            // 如果在超时时间内，增加计数
            if (now - lastEntry.timestamp < this.messageTimeout) {
                lastEntry.count++;
                lastEntry.timestamp = now;
                
                // 更新最后一条日志的显示
                this.updateLastLogCount(lastEntry.count);
                return null; // 不创建新的日志条目
            }
        }

        // 记录新消息
        this.recentMessages.set(messageKey, {
            timestamp: now,
            count: 1
        });

        // 清理过期的重复消息记录
        this.cleanupRecentMessages(now);

        return message;
    }

    /**
     * 处理分组消息
     * @param {string} message - 消息内容
     * @param {string} level - 日志级别
     * @param {Object} options - 选项
     */
    handleGroupedMessage(message, level, options) {
        const groupKey = options.group;
        
        if (!this.groupedMessages.has(groupKey)) {
            this.groupedMessages.set(groupKey, {
                messages: [],
                level,
                timestamp: Date.now(),
                collapsed: options.collapsed !== false
            });
        }

        const group = this.groupedMessages.get(groupKey);
        group.messages.push(message);

        // 如果是组的结束，显示整个组
        if (options.groupEnd) {
            this.displayGroupedMessages(groupKey, group);
            this.groupedMessages.delete(groupKey);
        }
    }

    /**
     * 添加日志条目
     * @param {Object} logEntry - 日志条目
     */
    addLogEntry(logEntry) {
        this.logs.push(logEntry);

        // 限制日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    /**
     * 显示日志
     * @param {Object} logEntry - 日志条目
     */
    displayLog(logEntry) {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) {
            return;
        }

        const logElement = document.createElement('div');
        logElement.className = `log-entry log-${logEntry.level}`;
        logElement.title = logEntry.message; // Add title for native browser tooltip
        
        const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
        const countText = logEntry.count > 1 ? ` (×${logEntry.count})` : '';
        
        logElement.innerHTML = `
            <span class="log-time">[${timestamp}]</span>
            <span class="log-message">${logEntry.message}</span>
            <span class="log-count">${countText}</span>
        `;

        logContainer.appendChild(logElement);
        logContainer.scrollTop = logContainer.scrollHeight;

        // 存储引用以便更新计数
        logElement._logEntry = logEntry;
    }




    /**
     * 更新最后一条日志的计数
     * @param {number} count - 新的计数
     */
    updateLastLogCount(count) {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;

        const lastLogElement = logContainer.lastElementChild;
        if (lastLogElement && lastLogElement._logEntry) {
            const countSpan = lastLogElement.querySelector('.log-count');
            if (countSpan) {
                countSpan.textContent = count > 1 ? ` (×${count})` : '';
            }
            lastLogElement._logEntry.count = count;
        }
    }

    // 便捷方法：各级别的 i18n 日志
    infoI18n(key, params = {}, options = {}) { this.logI18n(key, 'info', params, options); }
    successI18n(key, params = {}, options = {}) { this.logI18n(key, 'success', params, options); }
    warningI18n(key, params = {}, options = {}) { this.logI18n(key, 'warning', params, options); }
    errorI18n(key, params = {}, options = {}) { this.logI18n(key, 'error', params, options); }
    debugI18n(key, params = {}, options = {}) { this.logI18n(key, 'debug', params, options); }

    /**
     * 显示分组消息
     * @param {string} groupKey - 组键
     * @param {Object} group - 组数据
     */
    displayGroupedMessages(groupKey, group) {
        const logContainer = document.getElementById('log-container');
        if (!logContainer) return;

        const groupElement = document.createElement('div');
        groupElement.className = `log-group log-${group.level}`;
        
        const timestamp = new Date(group.timestamp).toLocaleTimeString();
        const summary = `${groupKey} ${window.i18n.getText('logs.messageCount').replace('{count}', group.messages.length)}`;
        
        groupElement.innerHTML = `
            <div class="log-group-header" onclick="this.parentElement.classList.toggle('expanded')">
                <span class="log-time">[${timestamp}]</span>
                <span class="log-message">${summary}</span>
                <span class="log-toggle">▼</span>
            </div>
            <div class="log-group-content">
                ${group.messages.map(msg => `<div class="log-group-item">${msg}</div>`).join('')}
            </div>
        `;

        if (group.collapsed) {
            groupElement.classList.add('collapsed');
        } else {
            groupElement.classList.add('expanded');
        }

        logContainer.appendChild(groupElement);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    /**
     * 清理过期的重复消息记录
     * @param {number} now - 当前时间戳
     */
    cleanupRecentMessages(now) {
        for (const [key, entry] of this.recentMessages.entries()) {
            if (now - entry.timestamp > this.messageTimeout) {
                this.recentMessages.delete(key);
            }
        }
    }

    /**
     * 清空日志
     */
    clear() {
        this.logs = [];
        this.recentMessages.clear();
        this.groupedMessages.clear();
        
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
            logContainer.innerHTML = '';
        }
    }

    /**
     * 获取所有日志
     * @returns {Array} 日志数组
     */
    getLogs() {
        return [...this.logs];
    }

    /**
     * 导出日志
     * @returns {string} 日志文本
     */
    exportLogs() {
        return this.logs.map(entry => {
            const timestamp = new Date(entry.timestamp).toLocaleString();
            const countText = entry.count > 1 ? ` (×${entry.count})` : '';
            return `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${countText}`;
        }).join('\n');
    }

    /**
     * 简化的日志方法
     */
    info(message, options = {}) {
        this.log(message, 'info', options);
    }

    success(message, options = {}) {
        this.log(message, 'success', options);
    }

    warning(message, options = {}) {
        this.log(message, 'warning', options);
    }

    error(message, options = {}) {
        this.log(message, 'error', options);
    }

    debug(message, options = {}) {
        this.log(message, 'debug', options);
    }
}
