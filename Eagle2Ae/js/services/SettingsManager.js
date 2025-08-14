// Export to AE - 设置管理器

class SettingsManager {
    constructor() {
        this.settings = null;
        this.preferences = null;
        this.recentFolders = [];
        this.listeners = [];
        this.fieldListeners = new Map(); // 字段级别的监听器
        this.autoSaveTimeout = null; // 自动保存定时器
        this.isUpdating = false; // 防止循环更新标志

        // 获取常量（兼容不同环境）
        const constants = window.ImportSettingsConstants || require('../constants/ImportSettings.js');
        this.ImportModes = constants.ImportModes;
        this.STORAGE_KEYS = constants.STORAGE_KEYS;
        this.DEFAULT_IMPORT_SETTINGS = constants.DEFAULT_IMPORT_SETTINGS;
        this.DEFAULT_USER_PREFERENCES = constants.DEFAULT_USER_PREFERENCES;
        this.VALIDATION_RULES = constants.VALIDATION_RULES;
        this.UI_STATE_RULES = constants.UI_STATE_RULES;

        this.init();
    }

    // 初始化设置管理器
    init() {
        this.loadSettings();
        this.loadPreferences();
        this.loadRecentFolders();
    }

    // 加载导入设置
    loadSettings() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.IMPORT_SETTINGS);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.settings = this.mergeWithDefaults(parsed, this.DEFAULT_IMPORT_SETTINGS);
            } else {
                this.settings = { ...this.DEFAULT_IMPORT_SETTINGS };
            }
            
            // 验证设置有效性
            this.validateSettings(this.settings);
            
        } catch (error) {
            console.warn('加载设置失败，使用默认设置:', error);
            this.settings = { ...this.DEFAULT_IMPORT_SETTINGS };
        }
    }

    // 加载用户偏好
    loadPreferences() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.preferences = this.mergeWithDefaults(parsed, this.DEFAULT_USER_PREFERENCES);
            } else {
                this.preferences = { ...this.DEFAULT_USER_PREFERENCES };
            }
        } catch (error) {
            console.warn('加载用户偏好失败，使用默认设置:', error);
            this.preferences = { ...this.DEFAULT_USER_PREFERENCES };
        }
    }

    // 加载最近使用的文件夹
    loadRecentFolders() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.RECENT_FOLDERS);
            if (stored) {
                this.recentFolders = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('加载最近文件夹失败:', error);
            this.recentFolders = [];
        }
    }

    // 保存导入设置
    saveSettings(newSettings) {
        try {
            // 验证设置
            this.validateSettings(newSettings);
            
            // 更新设置
            this.settings = { ...newSettings };
            
            // 保存到localStorage
            localStorage.setItem(
                this.STORAGE_KEYS.IMPORT_SETTINGS, 
                JSON.stringify(this.settings)
            );
            
            // 触发变更事件
            this.notifyListeners('settings', this.settings);
            
            return { success: true };
            
        } catch (error) {
            console.error('保存设置失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 保存用户偏好
    savePreferences(newPreferences) {
        try {
            this.preferences = { ...this.preferences, ...newPreferences };
            localStorage.setItem(
                this.STORAGE_KEYS.USER_PREFERENCES, 
                JSON.stringify(this.preferences)
            );
            
            this.notifyListeners('preferences', this.preferences);
            return { success: true };
            
        } catch (error) {
            console.error('保存用户偏好失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 添加最近使用的文件夹
    addRecentFolder(folderPath) {
        if (!folderPath || this.recentFolders.includes(folderPath)) {
            return;
        }
        
        this.recentFolders.unshift(folderPath);
        
        // 限制数量
        if (this.recentFolders.length > 10) {
            this.recentFolders = this.recentFolders.slice(0, 10);
        }
        
        try {
            localStorage.setItem(
                this.STORAGE_KEYS.RECENT_FOLDERS, 
                JSON.stringify(this.recentFolders)
            );
        } catch (error) {
            console.warn('保存最近文件夹失败:', error);
        }
    }

    // 重置设置
    resetSettings() {
        this.settings = { ...this.DEFAULT_IMPORT_SETTINGS };
        this.preferences = { ...this.DEFAULT_USER_PREFERENCES };
        
        try {
            localStorage.removeItem(this.STORAGE_KEYS.IMPORT_SETTINGS);
            localStorage.removeItem(this.STORAGE_KEYS.USER_PREFERENCES);
            
            this.notifyListeners('reset', { settings: this.settings, preferences: this.preferences });
            return { success: true };
            
        } catch (error) {
            console.error('重置设置失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 验证设置
    validateSettings(settings) {
        const errors = [];
        
        for (const [key, rule] of Object.entries(this.VALIDATION_RULES)) {
            const value = this.getNestedValue(settings, key);
            
            // 检查必填项
            if (rule.required) {
                const isRequired = typeof rule.required === 'function'
                    ? rule.required(settings)
                    : rule.required;

                if (isRequired && (value === undefined || value === null || value === '')) {
                    errors.push(`${key} 是必填项`);
                    continue;
                }
            }

            // 如果值为空且不是必填项，跳过后续验证
            if (value === undefined || value === null || value === '') {
                continue;
            }
            
            // 检查值范围
            if (rule.values && !rule.values.includes(value)) {
                errors.push(`${key} 的值无效`);
            }
            
            // 检查字符串长度
            if (typeof value === 'string') {
                if (rule.minLength && value.length < rule.minLength) {
                    errors.push(`${key} 长度不能少于 ${rule.minLength} 个字符`);
                }
                if (rule.maxLength && value.length > rule.maxLength) {
                    errors.push(`${key} 长度不能超过 ${rule.maxLength} 个字符`);
                }
                if (rule.pattern && !rule.pattern.test(value)) {
                    errors.push(`${key} 格式无效`);
                }
            }
            
            // 检查数值范围
            if (typeof value === 'number') {
                if (rule.min !== undefined && value < rule.min) {
                    errors.push(`${key} 不能小于 ${rule.min}`);
                }
                if (rule.max !== undefined && value > rule.max) {
                    errors.push(`${key} 不能大于 ${rule.max}`);
                }
            }
        }
        
        if (errors.length > 0) {
            throw new Error(`设置验证失败: ${errors.join(', ')}`);
        }
    }

    // 获取嵌套对象的值
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    // 合并默认设置
    mergeWithDefaults(source, defaults) {
        const result = { ...defaults };
        
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = this.mergeWithDefaults(source[key], defaults[key] || {});
                } else {
                    result[key] = source[key];
                }
            }
        }
        
        return result;
    }

    // 获取UI状态
    getUIState() {
        const state = {};
        
        for (const [key, rule] of Object.entries(this.UI_STATE_RULES)) {
            state[key] = rule(this.settings);
        }
        
        return state;
    }

    // 添加变更监听器
    addListener(callback) {
        this.listeners.push(callback);
    }

    // 移除变更监听器
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // 通知监听器
    notifyListeners(type, data) {
        if (this.isUpdating) return; // 防止循环更新

        this.listeners.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('设置监听器错误:', error);
            }
        });
    }

    // 字段路径解析工具方法
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    // 添加字段级别的监听器
    addFieldListener(fieldPath, callback) {
        if (!this.fieldListeners.has(fieldPath)) {
            this.fieldListeners.set(fieldPath, []);
        }
        this.fieldListeners.get(fieldPath).push(callback);
    }

    // 移除字段级别的监听器
    removeFieldListener(fieldPath, callback) {
        if (this.fieldListeners.has(fieldPath)) {
            const listeners = this.fieldListeners.get(fieldPath);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
                if (listeners.length === 0) {
                    this.fieldListeners.delete(fieldPath);
                }
            }
        }
    }

    // 通知字段监听器
    notifyFieldListeners(fieldPath, newValue, oldValue) {
        if (this.isUpdating) return; // 防止循环更新

        if (this.fieldListeners.has(fieldPath)) {
            this.fieldListeners.get(fieldPath).forEach(callback => {
                try {
                    callback(newValue, oldValue, fieldPath);
                } catch (error) {
                    console.error(`字段监听器错误 (${fieldPath}):`, error);
                }
            });
        }
    }

    // 获取当前设置
    getSettings() {
        return { ...this.settings };
    }

    // 获取当前偏好
    getPreferences() {
        return { ...this.preferences };
    }

    // 获取最近文件夹
    getRecentFolders() {
        return [...this.recentFolders];
    }

    // 更新用户偏好
    updatePreference(key, value) {
        try {
            this.preferences[key] = value;

            // 保存到localStorage
            localStorage.setItem(
                this.STORAGE_KEYS.USER_PREFERENCES,
                JSON.stringify(this.preferences)
            );

            // 触发变更事件
            this.notifyListeners('preferences', this.preferences);

            return { success: true };

        } catch (error) {
            console.error('更新用户偏好失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 获取单个字段值
    getField(fieldPath) {
        return this.getNestedValue(this.settings, fieldPath);
    }

    // 更新单个字段
    updateField(fieldPath, value, autoSave = true, fullValidation = true) {
        if (this.isUpdating) return { success: false, error: '正在更新中' };

        try {
            const oldValue = this.getNestedValue(this.settings, fieldPath);
            if (oldValue === value) return { success: true }; // 值未变化

            // 创建设置副本进行更新
            const newSettings = JSON.parse(JSON.stringify(this.settings));
            this.setNestedValue(newSettings, fieldPath, value);

            // 根据参数决定是否进行完整验证
            if (fullValidation) {
                this.validateSettings(newSettings);
            }

            // 更新设置
            this.isUpdating = true;
            this.settings = newSettings;

            // 保存到localStorage
            localStorage.setItem(
                this.STORAGE_KEYS.IMPORT_SETTINGS,
                JSON.stringify(this.settings)
            );

            // 通知字段监听器
            this.notifyFieldListeners(fieldPath, value, oldValue);

            // 通知全局监听器
            this.notifyListeners('settings', this.settings);

            this.isUpdating = false;

            // 触发自动保存
            if (autoSave) {
                this.triggerAutoSave();
            }

            return { success: true };

        } catch (error) {
            this.isUpdating = false;
            console.error('更新字段失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 防抖自动保存
    triggerAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(() => {
            this.performAutoSave();
        }, 500); // 500ms 延迟
    }

    // 执行自动保存
    performAutoSave() {
        try {
            // 这里可以添加额外的保存逻辑，比如同步到Eagle插件
            console.log('自动保存设置完成');

            // 触发自动保存事件，让主应用处理Eagle同步
            this.notifyListeners('autoSave', this.settings);

        } catch (error) {
            console.error('自动保存失败:', error);
            // 触发自动保存错误事件
            this.notifyListeners('autoSaveError', error);
        }
    }

    // 批量更新字段
    updateFields(fieldUpdates, autoSave = true) {
        if (this.isUpdating) return { success: false, error: '正在更新中' };

        try {
            const newSettings = JSON.parse(JSON.stringify(this.settings));
            const changes = [];

            // 应用所有更新
            for (const [fieldPath, value] of Object.entries(fieldUpdates)) {
                const oldValue = this.getNestedValue(newSettings, fieldPath);
                if (oldValue !== value) {
                    this.setNestedValue(newSettings, fieldPath, value);
                    changes.push({ fieldPath, newValue: value, oldValue });
                }
            }

            if (changes.length === 0) return { success: true }; // 无变化

            // 验证更新后的设置
            this.validateSettings(newSettings);

            // 更新设置
            this.isUpdating = true;
            this.settings = newSettings;

            // 保存到localStorage
            localStorage.setItem(
                this.STORAGE_KEYS.IMPORT_SETTINGS,
                JSON.stringify(this.settings)
            );

            // 通知所有变化的字段监听器
            changes.forEach(({ fieldPath, newValue, oldValue }) => {
                this.notifyFieldListeners(fieldPath, newValue, oldValue);
            });

            // 通知全局监听器
            this.notifyListeners('settings', this.settings);

            this.isUpdating = false;

            // 触发自动保存
            if (autoSave) {
                this.triggerAutoSave();
            }

            return { success: true, changes: changes.length };

        } catch (error) {
            this.isUpdating = false;
            console.error('批量更新字段失败:', error);
            return { success: false, error: error.message };
        }
    }
}

// 导出设置管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
} else {
    window.SettingsManager = SettingsManager;
}
