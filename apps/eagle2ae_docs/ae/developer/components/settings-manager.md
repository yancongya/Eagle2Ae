# 设置管理器

## 概述

设置管理器（Settings Manager）是 Eagle2Ae AE 扩展 v2.4.0 的核心组件，负责管理扩展的所有配置设置。该组件提供了设置的存储、加载、验证、迁移等功能，支持复杂的嵌套设置结构和实时变更监听。

## 核心特性

### 多层配置管理
- **默认设置** - 预定义的默认配置值
- **用户设置** - 用户自定义的配置
- **面板特定设置** - 每个面板实例独立的配置
- **临时设置** - 运行时的临时配置

### 智能设置验证
- **字段验证器** - 为特定字段定义验证规则
- **类型检查** - 自动检查设置值的数据类型
- **范围验证** - 验证数值型设置的范围
- **自定义验证** - 支持自定义验证逻辑

### 自动迁移系统
- **版本迁移** - 自动迁移旧版本设置到新版本
- **结构转换** - 转换设置结构以适应新功能
- **兼容性保证** - 确保升级后的兼容性
- **回滚支持** - 支持设置回滚到旧版本

### 实时变更监听
- **字段监听** - 监听特定字段的变更
- **批量监听** - 监听多个字段的批量变更
- **深度监听** - 监听嵌套对象的深层变更
- **事件驱动** - 基于事件的变更通知机制

## 技术实现

### 核心类结构

```javascript
/**
 * 设置管理器
 * 负责管理AE扩展的所有配置设置，支持存储、加载、验证、迁移等功能
 */
class SettingsManager {
    /**
     * 构造函数
     * @param {Object} aeExtension - AE扩展实例
     */
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.csInterface = aeExtension.csInterface;
        this.logManager = aeExtension.logManager;
        this.settingsStorage = new Map(); // 临时设置存储
        this.fieldListeners = new Map(); // 字段监听器
        this.changeListeners = []; // 通用变更监听器
        this.validators = new Map(); // 验证器
        this.migrations = new Map(); // 迁移规则
        this.settingsVersion = 2; // 当前设置版本
        
        // 默认设置
        this.defaultSettings = {
            version: this.settingsVersion,
            import: {
                mode: 'project_adjacent',
                addToComposition: true,
                timelineOptions: {
                    enabled: true,
                    placement: 'current_time',
                    sequenceInterval: 1.0
                },
                projectAdjacentFolder: 'Eagle_Assets',
                customFolderPath: ''
            },
            export: {
                format: 'png',
                quality: 100,
                includeMetadata: true
            },
            connection: {
                host: 'localhost',
                port: 41595,
                autoConnect: true,
                connectTimeout: 5000
            },
            ui: {
                theme: 'default',
                language: 'zh-CN',
                showNotifications: true,
                autoUpdate: true
            }
        };
        
        // 当前设置
        this.currentSettings = { ...this.defaultSettings };
        
        // 已加载状态
        this.loaded = false;
        
        // 绑定方法上下文
        this.loadSettings = this.loadSettings.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.getSettings = this.getSettings.bind(this);
        this.getField = this.getField.bind(this);
        this.updateField = this.updateField.bind(this);
        this.updateFields = this.updateFields.bind(this);
        this.resetSettings = this.resetSettings.bind(this);
        this.addFieldListener = this.addFieldListener.bind(this);
        this.removeFieldListener = this.removeFieldListener.bind(this);
        this.addListener = this.addListener.bind(this);
        this.removeListener = this.removeListener.bind(this);
        this.validateSettings = this.validateSettings.bind(this);
        this.validateField = this.validateField.bind(this);
        this.addValidator = this.addValidator.bind(this);
        this.removeValidator = this.removeValidator.bind(this);
        this.addMigration = this.addMigration.bind(this);
        this.applyMigrations = this.applyMigrations.bind(this);
        
        this.log('⚙️ 设置管理器已初始化', 'debug');
    }
}
```

### 设置获取和更新

```javascript
/**
 * 获取所有设置
 * @returns {Object} 设置对象
 */
getSettings() {
    try {
        return { ...this.currentSettings };
    } catch (error) {
        this.log(`获取设置失败: ${error.message}`, 'error');
        return this.defaultSettings;
    }
}

/**
 * 获取特定字段值
 * @param {string} fieldPath - 字段路径（支持点号分隔）
 * @returns {*} 字段值
 */
getField(fieldPath) {
    try {
        if (!fieldPath || typeof fieldPath !== 'string') {
            this.log('无效的字段路径', 'error');
            return undefined;
        }
        
        // 使用点号分隔路径
        const pathParts = fieldPath.split('.');
        let value = this.currentSettings;
        
        for (const part of pathParts) {
            if (value === null || value === undefined) {
                return undefined;
            }
            value = value[part];
        }
        
        return value;
        
    } catch (error) {
        this.log(`获取字段${fieldPath}失败: ${error.message}`, 'error');
        return undefined;
    }
}

/**
 * 从对象中获取字段值
 * @param {Object} obj - 源对象
 * @param {string} fieldPath - 字段路径
 * @returns {*} 字段值
 */
getFieldFromObject(obj, fieldPath) {
    if (!obj || !fieldPath || typeof fieldPath !== 'string') {
        return undefined;
    }
    
    const pathParts = fieldPath.split('.');
    let value = obj;
    
    for (const part of pathParts) {
        if (value === null || value === undefined) {
            return undefined;
        }
        value = value[part];
    }
    
    return value;
}

/**
 * 将字段值设置到对象中
 * @param {Object} obj - 目标对象
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 字段值
 * @returns {boolean} 是否设置成功
 */
setFieldToObject(obj, fieldPath, value) {
    if (!obj || !fieldPath || typeof fieldPath !== 'string') {
        return false;
    }
    
    const pathParts = fieldPath.split('.');
    const lastPart = pathParts.pop();
    let current = obj;
    
    // 导航到目标位置
    for (const part of pathParts) {
        if (current[part] === undefined || current[part] === null) {
            current[part] = {};
        }
        current = current[part];
    }
    
    // 设置值
    current[lastPart] = value;
    return true;
}

/**
 * 更新单个字段
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 新值
 * @param {boolean} save - 是否保存到存储
 * @returns {Object} 更新结果
 */
updateField(fieldPath, value, save = true) {
    try {
        if (!fieldPath || typeof fieldPath !== 'string') {
            return {
                success: false,
                error: '字段路径必须是字符串'
            };
        }
        
        // 验证字段值
        const validation = this.validateField(fieldPath, value);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }
        
        // 获取旧值
        const oldValue = this.getField(fieldPath);
        
        // 创建新设置对象
        const newSettings = { ...this.currentSettings };
        this.setFieldToObject(newSettings, fieldPath, value);
        
        // 更新当前设置
        this.currentSettings = newSettings;
        
        this.log(`🔄 字段${fieldPath}已更新: ${oldValue} -> ${value}`, 'debug');
        
        // 触发字段变更事件
        this.emitFieldChange(fieldPath, value, oldValue);
        
        // 保存设置
        if (save) {
            const saveResult = this.saveSettings(this.currentSettings, true);
            if (!saveResult.success) {
                return saveResult;
            }
        }
        
        return {
            success: true,
            oldValue: oldValue,
            newValue: value,
            fieldPath: fieldPath
        };
        
    } catch (error) {
        this.log(`更新字段${fieldPath}失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 批量更新字段
 * @param {Object} fieldUpdates - 字段更新对象 { fieldPath: newValue }
 * @param {boolean} save - 是否保存到存储
 * @returns {Object} 更新结果
 */
updateFields(fieldUpdates, save = true) {
    try {
        if (!fieldUpdates || typeof fieldUpdates !== 'object') {
            return {
                success: false,
                error: '字段更新对象必须是对象类型'
            };
        }
        
        // 验证所有字段
        const validationErrors = [];
        for (const [fieldPath, value] of Object.entries(fieldUpdates)) {
            const validation = this.validateField(fieldPath, value);
            if (!validation.valid) {
                validationErrors.push({
                    fieldPath: fieldPath,
                    error: validation.error
                });
            }
        }
        
        if (validationErrors.length > 0) {
            return {
                success: false,
                error: '字段验证失败',
                validationErrors: validationErrors
            };
        }
        
        // 获取旧值
        const oldValues = {};
        for (const fieldPath of Object.keys(fieldUpdates)) {
            oldValues[fieldPath] = this.getField(fieldPath);
        }
        
        // 创建新设置对象
        const newSettings = { ...this.currentSettings };
        for (const [fieldPath, value] of Object.entries(fieldUpdates)) {
            this.setFieldToObject(newSettings, fieldPath, value);
        }
        
        // 更新当前设置
        this.currentSettings = newSettings;
        
        this.log(`🔄 批量字段更新完成: ${Object.keys(fieldUpdates).length}个字段`, 'debug');
        
        // 触发字段变更事件
        for (const [fieldPath, newValue] of Object.entries(fieldUpdates)) {
            const oldValue = oldValues[fieldPath];
            this.emitFieldChange(fieldPath, newValue, oldValue);
        }
        
        // 保存设置
        if (save) {
            const saveResult = this.saveSettings(this.currentSettings, true);
            if (!saveResult.success) {
                return saveResult;
            }
        }
        
        return {
            success: true,
            oldValues: oldValues,
            newValues: fieldUpdates,
            updatedCount: Object.keys(fieldUpdates).length
        };
        
    } catch (error) {
        this.log(`批量更新字段失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}
```

### 设置验证系统

```javascript
/**
 * 添加字段验证器
 * @param {string} fieldPath - 字段路径
 * @param {Function} validator - 验证函数，返回 {valid: boolean, error: string}
 */
addValidator(fieldPath, validator) {
    try {
        if (!fieldPath || typeof fieldPath !== 'string') {
            throw new Error('字段路径必须是字符串');
        }
        
        if (typeof validator !== 'function') {
            throw new Error('验证器必须是函数');
        }
        
        // 为字段路径添加验证器
        if (!this.validators.has(fieldPath)) {
            this.validators.set(fieldPath, []);
        }
        
        const validators = this.validators.get(fieldPath);
        validators.push(validator);
        
        this.log(`✅ 为字段${fieldPath}添加验证器`, 'debug');
        
    } catch (error) {
        this.log(`添加验证器失败: ${error.message}`, 'error');
    }
}

/**
 * 移除字段验证器
 * @param {string} fieldPath - 字段路径
 * @param {Function} validator - 验证函数
 */
removeValidator(fieldPath, validator) {
    try {
        if (!this.validators.has(fieldPath)) {
            return;
        }
        
        const validators = this.validators.get(fieldPath);
        const index = validators.indexOf(validator);
        
        if (index !== -1) {
            validators.splice(index, 1);
            
            // 如果验证器数组为空，删除字段
            if (validators.length === 0) {
                this.validators.delete(fieldPath);
            }
            
            this.log(`✅ 从字段${fieldPath}移除验证器`, 'debug');
        }
        
    } catch (error) {
        this.log(`移除验证器失败: ${error.message}`, 'error');
    }
}

/**
 * 验证单个字段
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 字段值
 * @returns {Object} 验证结果 {valid: boolean, error: string}
 */
validateField(fieldPath, value) {
    try {
        // 检查是否有针对该字段的验证器
        if (this.validators.has(fieldPath)) {
            const fieldValidators = this.validators.get(fieldPath);
            
            for (const validator of fieldValidators) {
                const result = validator(value);
                
                if (result && !result.valid) {
                    return result;
                }
            }
        }
        
        // 检查字段路径是否存在
        const pathParts = fieldPath.split('.');
        let current = this.defaultSettings;
        
        for (const part of pathParts) {
            if (current === undefined || current === null) {
                return {
                    valid: false,
                    error: `字段路径不存在: ${fieldPath}`
                };
            }
            current = current[part];
        }
        
        // 默认验证规则
        switch (fieldPath) {
            case 'import.mode':
                if (value !== 'direct' && value !== 'project_adjacent' && value !== 'custom_folder') {
                    return {
                        valid: false,
                        error: '导入模式必须是 direct、project_adjacent 或 custom_folder 之一'
                    };
                }
                break;
                
            case 'import.timelineOptions.placement':
                if (value !== 'current_time' && value !== 'timeline_start') {
                    return {
                        valid: false,
                        error: '时间轴放置位置必须是 current_time 或 timeline_start 之一'
                    };
                }
                break;
                
            case 'import.timelineOptions.sequenceInterval':
                if (typeof value !== 'number' || value <= 0) {
                    return {
                        valid: false,
                        error: '序列帧间隔必须是大于0的数字'
                    };
                }
                break;
                
            case 'export.quality':
                if (typeof value !== 'number' || value < 0 || value > 100) {
                    return {
                        valid: false,
                        error: '质量必须是0-100之间的数字'
                    };
                }
                break;
                
            case 'connection.port':
                if (typeof value !== 'number' || value < 1 || value > 65535) {
                    return {
                        valid: false,
                        error: '端口号必须是1-65535之间的数字'
                    };
                }
                break;
                
            default:
                // 检查类型匹配
                const defaultValue = this.getFieldFromObject(this.defaultSettings, fieldPath);
                if (defaultValue !== undefined) {
                    const expectedType = typeof defaultValue;
                    const actualType = typeof value;
                    
                    if (expectedType !== 'object' && expectedType !== actualType) {
                        return {
                            valid: false,
                            error: `字段类型不匹配，期望 ${expectedType}，实际 ${actualType}`
                        };
                    }
                }
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        this.log(`验证字段${fieldPath}异常: ${error.message}`, 'error');
        return {
            valid: false,
            error: `验证异常: ${error.message}`
        };
    }
}

/**
 * 验证整个设置对象
 * @param {Object} settings - 要验证的设置
 * @returns {Object} 验证结果 {valid: boolean, errors: Array}
 */
validateSettings(settings) {
    try {
        if (!settings || typeof settings !== 'object') {
            return {
                valid: false,
                errors: ['设置必须是对象类型']
            };
        }
        
        const errors = [];
        
        // 验证所有字段
        const allFields = this.getAllFields(settings);
        
        for (const fieldPath of allFields) {
            const value = this.getFieldFromObject(settings, fieldPath);
            const validation = this.validateField(fieldPath, value);
            
            if (!validation.valid) {
                errors.push({
                    field: fieldPath,
                    error: validation.error
                });
            }
        }
        
        // 检查必要字段
        const requiredFields = [
            'version',
            'import.mode',
            'import.addToComposition'
        ];
        
        for (const requiredField of requiredFields) {
            if (this.getFieldFromObject(settings, requiredField) === undefined) {
                errors.push({
                    field: requiredField,
                    error: `缺少必要字段: ${requiredField}`
                });
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
        
    } catch (error) {
        this.log(`验证设置异常: ${error.message}`, 'error');
        return {
            valid: false,
            errors: [`验证异常: ${error.message}`]
        };
    }
}

/**
 * 获取所有字段路径
 * @param {Object} obj - 源对象
 * @param {string} prefix - 前缀
 * @returns {Array} 字段路径数组
 */
getAllFields(obj, prefix = '') {
    const fields = [];
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            fields.push(fullKey);
            
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                fields.push(...this.getAllFields(obj[key], fullKey));
            }
        }
    }
    
    return fields;
}
```

### 设置迁移系统

```javascript
/**
 * 添加设置迁移规则
 * @param {number} version - 目标版本号
 * @param {Function} migration - 迁移函数
 */
addMigration(version, migration) {
    try {
        if (typeof version !== 'number' || version <= 0) {
            throw new Error('版本号必须是正数');
        }
        
        if (typeof migration !== 'function') {
            throw new Error('迁移函数必须是函数');
        }
        
        this.migrations.set(version, migration);
        this.log(`✅ 添加版本${version}的迁移规则`, 'debug');
        
    } catch (error) {
        this.log(`添加迁移规则失败: ${error.message}`, 'error');
    }
}

/**
 * 应用设置迁移
 * @param {Object} settings - 要迁移的设置
 * @returns {Object} 迁移后的设置
 */
applyMigrations(settings) {
    try {
        if (!settings || typeof settings !== 'object') {
            this.log('无效的设置对象，跳过迁移', 'warning');
            return this.defaultSettings;
        }
        
        // 获取当前设置版本
        const currentVersion = settings.version || 0;
        
        if (currentVersion >= this.settingsVersion) {
            this.log(`当前设置版本${currentVersion}已为最新版本${this.settingsVersion}，无需迁移`, 'debug');
            return settings;
        }
        
        this.log(`开始设置迁移 ${currentVersion} -> ${this.settingsVersion}`, 'info');
        
        let migratedSettings = { ...settings };
        
        // 按版本顺序应用迁移规则
        for (let version = currentVersion + 1; version <= this.settingsVersion; version++) {
            if (this.migrations.has(version)) {
                const migration = this.migrations.get(version);
                
                this.log(`应用版本${version}迁移规则`, 'debug');
                
                try {
                    migratedSettings = migration(migratedSettings);
                    migratedSettings.version = version;
                    
                    this.log(`✅ 版本${version}迁移完成`, 'debug');
                } catch (migrationError) {
                    this.log(`❌ 版本${version}迁移失败: ${migrationError.message}`, 'error');
                    return settings; // 迁移失败，返回原始设置
                }
            } else {
                // 没有迁移规则，设置版本号
                migratedSettings.version = version;
            }
        }
        
        this.log(`设置迁移完成，最终版本: ${migratedSettings.version}`, 'success');
        return migratedSettings;
        
    } catch (error) {
        this.log(`应用设置迁移异常: ${error.message}`, 'error');
        return settings; // 异常时返回原始设置
    }
}

/**
 * 默认迁移规则
 */
initDefaultMigrations() {
    // 版本1到版本2的迁移
    this.addMigration(2, (oldSettings) => {
        const newSettings = { ...oldSettings };
        
        // 确保有新的设置结构
        if (!newSettings.import) {
            newSettings.import = this.defaultSettings.import;
        }
        
        if (!newSettings.export) {
            newSettings.export = this.defaultSettings.export;
        }
        
        if (!newSettings.connection) {
            newSettings.connection = this.defaultSettings.connection;
        }
        
        if (!newSettings.ui) {
            newSettings.ui = this.defaultSettings.ui;
        }
        
        // 迁移旧字段
        if (oldSettings.hasOwnProperty('autoConnect')) {
            newSettings.connection.autoConnect = oldSettings.autoConnect;
            delete newSettings.autoConnect;
        }
        
        if (oldSettings.hasOwnProperty('theme')) {
            newSettings.ui.theme = oldSettings.theme;
            delete newSettings.theme;
        }
        
        return newSettings;
    });
    
    this.log('✅ 默认迁移规则已初始化', 'debug');
}
```

### 事件监听系统

```javascript
/**
 * 触发字段变更事件
 * @param {string} fieldPath - 字段路径
 * @param {*} newValue - 新值
 * @param {*} oldValue - 旧值
 */
emitFieldChange(fieldPath, newValue, oldValue) {
    try {
        this.log(`🔄 字段${fieldPath}变更: ${oldValue} -> ${newValue}`, 'debug');
        
        // 触发字段特定监听器
        if (this.fieldListeners.has(fieldPath)) {
            const listeners = this.fieldListeners.get(fieldPath);
            listeners.forEach(listener => {
                try {
                    listener(newValue, oldValue, fieldPath);
                } catch (listenerError) {
                    this.log(`字段监听器执行失败: ${listenerError.message}`, 'error');
                }
            });
        }
        
        // 触发通配符监听器
        const wildcardListeners = this.fieldListeners.get('*');
        if (wildcardListeners) {
            wildcardListeners.forEach(listener => {
                try {
                    listener(newValue, oldValue, fieldPath);
                } catch (listenerError) {
                    this.log(`通配符字段监听器执行失败: ${listenerError.message}`, 'error');
                }
            });
        }
        
        // 触发通用变更事件
        this.emit('fieldChange', {
            fieldPath: fieldPath,
            newValue: newValue,
            oldValue: oldValue,
            timestamp: Date.now()
        });
        
    } catch (error) {
        this.log(`触发字段变更事件失败: ${error.message}`, 'error');
    }
}

/**
 * 添加字段监听器
 * @param {string} fieldPath - 字段路径，使用*可监听所有字段
 * @param {Function} listener - 监听器函数
 * @param {boolean} once - 是否只监听一次
 * @returns {Function} 移除监听器的函数
 */
addFieldListener(fieldPath, listener, once = false) {
    try {
        if (!fieldPath || typeof fieldPath !== 'string') {
            throw new Error('字段路径必须是字符串');
        }
        
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }
        
        // 为字段路径添加监听器
        if (!this.fieldListeners.has(fieldPath)) {
            this.fieldListeners.set(fieldPath, []);
        }
        
        const listeners = this.fieldListeners.get(fieldPath);
        const wrappedListener = once ? 
            (...args) => {
                listener(...args);
                this.removeFieldListener(fieldPath, wrappedListener);
            } : 
            listener;
        
        listeners.push(wrappedListener);
        
        this.log(`✅ 为字段${fieldPath}添加监听器`, 'debug');
        
        // 返回移除监听器的函数
        return () => {
            this.removeFieldListener(fieldPath, wrappedListener);
        };
        
    } catch (error) {
        this.log(`添加字段监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数以防调用错误
    }
}

/**
 * 移除字段监听器
 * @param {string} fieldPath - 字段路径
 * @param {Function} listener - 监听器函数
 */
removeFieldListener(fieldPath, listener) {
    try {
        if (!this.fieldListeners.has(fieldPath)) {
            return;
        }
        
        const listeners = this.fieldListeners.get(fieldPath);
        const index = listeners.indexOf(listener);
        
        if (index !== -1) {
            listeners.splice(index, 1);
            
            // 如果监听器数组为空，删除字段
            if (listeners.length === 0) {
                this.fieldListeners.delete(fieldPath);
            }
            
            this.log(`✅ 从字段${fieldPath}移除监听器`, 'debug');
        }
        
    } catch (error) {
        this.log(`移除字段监听器失败: ${error.message}`, 'error');
    }
}

/**
 * 添加通用监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addListener(listener) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }
        
        this.changeListeners.push(listener);
        
        this.log('✅ 添加通用设置变更监听器', 'debug');
        
        // 返回移除监听器的函数
        return () => {
            this.removeListener(listener);
        };
        
    } catch (error) {
        this.log(`添加通用监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数以防调用错误
    }
}

/**
 * 移除通用监听器
 * @param {Function} listener - 监听器函数
 */
removeListener(listener) {
    try {
        const index = this.changeListeners.indexOf(listener);
        if (index !== -1) {
            this.changeListeners.splice(index, 1);
            this.log('✅ 移除通用设置变更监听器', 'debug');
        }
        
    } catch (error) {
        this.log(`移除通用监听器失败: ${error.message}`, 'error');
    }
}
```

### 设置存储操作

```javascript
/**
 * 保存设置
 * @param {Object} settings - 要保存的设置
 * @param {boolean} silent - 是否静默保存
 * @returns {Object} 保存结果
 */
saveSettings(settings, silent = false) {
    try {
        if (!settings || typeof settings !== 'object') {
            return {
                success: false,
                error: '设置必须是对象类型'
            };
        }
        
        // 验证设置
        const validation = this.validateSettings(settings);
        if (!validation.valid) {
            return {
                success: false,
                error: '设置验证失败',
                validationErrors: validation.errors
            };
        }
        
        // 在DEMO模式下，保存到localStorage
        if (window.__DEMO_MODE_ACTIVE__) {
            try {
                localStorage.setItem('eagle2ae_settings', JSON.stringify(settings));
                
                if (!silent) {
                    this.log('💾 设置已保存到localStorage（DEMO模式）', 'debug');
                }
                
                // 触发保存事件
                this.emit('saved', settings);
                
                return {
                    success: true
                };
            } catch (storageError) {
                return {
                    success: false,
                    error: `localStorage保存失败: ${storageError.message}`
                };
            }
        }
        
        // 在CEP模式下，保存到AE扩展存储
        try {
            const settingsString = JSON.stringify(settings);
            
            // 使用CSInterface保存设置
            const result = window.cep.fs.writeFile(
                this.getSettingsFilePath(),
                settingsString,
                window.cep.encoding.UTF8
            );
            
            if (result.err === window.cep.fs.NO_ERROR) {
                if (!silent) {
                    this.log('💾 设置已保存到AE扩展存储', 'debug');
                }
                
                // 触发保存事件
                this.emit('saved', settings);
                
                return {
                    success: true
                };
            } else {
                return {
                    success: false,
                    error: `AE扩展存储保存失败: ${result.err}`
                };
            }
        } catch (cepError) {
            return {
                success: false,
                error: `CEP保存失败: ${cepError.message}`
            };
        }
        
    } catch (error) {
        this.log(`保存设置异常: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 加载设置
 * @returns {Object} 加载的设置或null
 */
loadSettings() {
    try {
        // 在DEMO模式下，从localStorage加载
        if (window.__DEMO_MODE_ACTIVE__) {
            try {
                const settingsString = localStorage.getItem('eagle2ae_settings');
                
                if (settingsString) {
                    let settings = JSON.parse(settingsString);
                    
                    // 应用迁移
                    settings = this.applyMigrations(settings);
                    
                    // 验证设置
                    const validation = this.validateSettings(settings);
                    if (validation.valid) {
                        this.currentSettings = settings;
                        this.loaded = true;
                        
                        this.log('📥 设置已从localStorage加载（DEMO模式）', 'debug');
                        return settings;
                    } else {
                        this.log(`⚠️ 加载的设置验证失败，使用默认设置: ${JSON.stringify(validation.errors)}`, 'warning');
                    }
                } else {
                    this.log('⚠️ 未找到保存的设置，使用默认设置', 'warning');
                }
            } catch (parseError) {
                this.log(`⚠️ 解析保存的设置失败: ${parseError.message}，使用默认设置`, 'warning');
            }
        }
        
        // 在CEP模式下，从AE扩展存储加载
        if (!window.__DEMO_MODE_ACTIVE__) {
            try {
                const result = window.cep.fs.readFile(
                    this.getSettingsFilePath(),
                    window.cep.encoding.UTF8
                );
                
                if (result.err === window.cep.fs.NO_ERROR && result.data) {
                    let settings = JSON.parse(result.data);
                    
                    // 应用迁移
                    settings = this.applyMigrations(settings);
                    
                    // 验证设置
                    const validation = this.validateSettings(settings);
                    if (validation.valid) {
                        this.currentSettings = settings;
                        this.loaded = true;
                        
                        this.log('📥 设置已从AE扩展存储加载', 'debug');
                        return settings;
                    } else {
                        this.log(`⚠️ 加载的设置验证失败，使用默认设置: ${JSON.stringify(validation.errors)}`, 'warning');
                    }
                } else {
                    this.log('⚠️ 未找到保存的设置，使用默认设置', 'warning');
                }
            } catch (cepError) {
                this.log(`⚠️ 从AE扩展存储加载设置失败: ${cepError.message}，使用默认设置`, 'warning');
            }
        }
        
        // 如果加载失败或验证失败，使用默认设置
        this.currentSettings = { ...this.defaultSettings };
        this.loaded = true;
        
        this.log('⚙️ 已使用默认设置', 'info');
        return null;
        
    } catch (error) {
        this.log(`加载设置异常: ${error.message}，使用默认设置`, 'error');
        
        // 异常时使用默认设置
        this.currentSettings = { ...this.defaultSettings };
        this.loaded = true;
        
        return null;
    }
}

/**
 * 重置设置
 * @returns {Object} 重置结果
 */
resetSettings() {
    try {
        this.log('🔄 重置设置到默认值', 'info');
        
        // 重置为默认设置
        this.currentSettings = { ...this.defaultSettings };
        
        // 保存默认设置
        const saveResult = this.saveSettings(this.currentSettings, true);
        
        if (saveResult.success) {
            this.log('✅ 设置已重置并保存', 'success');
            
            // 触发重置事件
            this.emit('reset', this.currentSettings);
            
            return {
                success: true,
                settings: this.currentSettings
            };
        } else {
            return saveResult;
        }
        
    } catch (error) {
        this.log(`重置设置异常: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 获取设置文件路径
 * @returns {string} 设置文件路径
 */
getSettingsFilePath() {
    try {
        const extensionPath = this.csInterface.getSystemPath(window.SystemPath.EXTENSION);
        const settingsPath = `${extensionPath}/settings.json`;
        return settingsPath;
    } catch (error) {
        // 备用路径
        return './settings.json';
    }
}
```

## API参考

### 核心方法

#### SettingsManager
设置管理器主类

```javascript
/**
 * 设置管理器
 * 负责管理AE扩展的所有配置设置，支持存储、加载、验证、迁移等功能
 */
class SettingsManager
```

#### constructor()
构造函数

```javascript
/**
 * 构造函数
 * @param {Object} aeExtension - AE扩展实例
 */
constructor(aeExtension)
```

#### getSettings()
获取所有设置

```javascript
/**
 * 获取所有设置
 * @returns {Object} 设置对象
 */
getSettings()
```

#### getField()
获取特定字段值

```javascript
/**
 * 获取特定字段值
 * @param {string} fieldPath - 字段路径（支持点号分隔）
 * @returns {*} 字段值
 */
getField(fieldPath)
```

#### updateField()
更新单个字段

```javascript
/**
 * 更新单个字段
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 新值
 * @param {boolean} save - 是否保存到存储
 * @returns {Object} 更新结果
 */
updateField(fieldPath, value, save = true)
```

#### updateFields()
批量更新字段

```javascript
/**
 * 批量更新字段
 * @param {Object} fieldUpdates - 字段更新对象 { fieldPath: newValue }
 * @param {boolean} save - 是否保存到存储
 * @returns {Object} 更新结果
 */
updateFields(fieldUpdates, save = true)
```

#### validateField()
验证单个字段

```javascript
/**
 * 验证单个字段
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 字段值
 * @returns {Object} 验证结果 {valid: boolean, error: string}
 */
validateField(fieldPath, value)
```

#### validateSettings()
验证整个设置对象

```javascript
/**
 * 验证整个设置对象
 * @param {Object} settings - 要验证的设置
 * @returns {Object} 验证结果 {valid: boolean, errors: Array}
 */
validateSettings(settings)
```

#### addValidator()
添加字段验证器

```javascript
/**
 * 添加字段验证器
 * @param {string} fieldPath - 字段路径
 * @param {Function} validator - 验证函数，返回 {valid: boolean, error: string}
 */
addValidator(fieldPath, validator)
```

#### removeValidator()
移除字段验证器

```javascript
/**
 * 移除字段验证器
 * @param {string} fieldPath - 字段路径
 * @param {Function} validator - 验证函数
 */
removeValidator(fieldPath, validator)
```

#### addMigration()
添加设置迁移规则

```javascript
/**
 * 添加设置迁移规则
 * @param {number} version - 目标版本号
 * @param {Function} migration - 迁移函数
 */
addMigration(version, migration)
```

#### applyMigrations()
应用设置迁移

```javascript
/**
 * 应用设置迁移
 * @param {Object} settings - 要迁移的设置
 * @returns {Object} 迁移后的设置
 */
applyMigrations(settings)
```

#### addFieldListener()
添加字段监听器

```javascript
/**
 * 添加字段监听器
 * @param {string} fieldPath - 字段路径，使用*可监听所有字段
 * @param {Function} listener - 监听器函数
 * @param {boolean} once - 是否只监听一次
 * @returns {Function} 移除监听器的函数
 */
addFieldListener(fieldPath, listener, once = false)
```

#### removeFieldListener()
移除字段监听器

```javascript
/**
 * 移除字段监听器
 * @param {string} fieldPath - 字段路径
 * @param {Function} listener - 监听器函数
 */
removeFieldListener(fieldPath, listener)
```

#### addListener()
添加通用监听器

```javascript
/**
 * 添加通用监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addListener(listener)
```

#### removeListener()
移除通用监听器

```javascript
/**
 * 移除通用监听器
 * @param {Function} listener - 监听器函数
 */
removeListener(listener)
```

#### saveSettings()
保存设置

```javascript
/**
 * 保存设置
 * @param {Object} settings - 要保存的设置
 * @param {boolean} silent - 是否静默保存
 * @returns {Object} 保存结果
 */
saveSettings(settings, silent = false)
```

#### loadSettings()
加载设置

```javascript
/**
 * 加载设置
 * @returns {Object} 加载的设置或null
 */
loadSettings()
```

#### resetSettings()
重置设置

```javascript
/**
 * 重置设置
 * @returns {Object} 重置结果
 */
resetSettings()
```

### 辅助方法

#### getFieldFromObject()
从对象中获取字段值

```javascript
/**
 * 从对象中获取字段值
 * @param {Object} obj - 源对象
 * @param {string} fieldPath - 字段路径
 * @returns {*} 字段值
 */
getFieldFromObject(obj, fieldPath)
```

#### setFieldToObject()
将字段值设置到对象中

```javascript
/**
 * 将字段值设置到对象中
 * @param {Object} obj - 目标对象
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 字段值
 * @returns {boolean} 是否设置成功
 */
setFieldToObject(obj, fieldPath, value)
```

#### getAllFields()
获取所有字段路径

```javascript
/**
 * 获取所有字段路径
 * @param {Object} obj - 源对象
 * @param {string} prefix - 前缀
 * @returns {Array} 字段路径数组
 */
getAllFields(obj, prefix = '')
```

#### getSettingsFilePath()
获取设置文件路径

```javascript
/**
 * 获取设置文件路径
 * @returns {string} 设置文件路径
 */
getSettingsFilePath()
```

## 使用示例

### 基本使用

#### 加载和保存设置
```javascript
// 创建设置管理器实例
const settingsManager = new SettingsManager(aeExtension);

// 加载设置
const loadedSettings = settingsManager.loadSettings();
if (loadedSettings) {
    console.log('✅ 设置加载成功:', loadedSettings);
} else {
    console.log('⚠️ 使用默认设置');
}

// 获取当前设置
const currentSettings = settingsManager.getSettings();
console.log('当前设置:', currentSettings);

// 获取特定字段值
const importMode = settingsManager.getField('import.mode');
console.log('当前导入模式:', importMode);

const sequenceInterval = settingsManager.getField('import.timelineOptions.sequenceInterval');
console.log('序列帧间隔:', sequenceInterval);

// 更新单个字段
const updateResult = settingsManager.updateField('import.mode', 'custom_folder');
if (updateResult.success) {
    console.log('✅ 导入模式已更新');
} else {
    console.error('❌ 更新失败:', updateResult.error);
}

// 批量更新字段
const batchUpdateResult = settingsManager.updateFields({
    'import.mode': 'project_adjacent',
    'import.addToComposition': true,
    'import.timelineOptions.placement': 'current_time'
});

if (batchUpdateResult.success) {
    console.log(`✅ 批量更新完成，更新了${batchUpdateResult.updatedCount}个字段`);
} else {
    console.error('❌ 批量更新失败:', batchUpdateResult.error);
}

// 保存设置
const saveResult = settingsManager.saveSettings(settingsManager.getSettings());
if (saveResult.success) {
    console.log('✅ 设置保存成功');
} else {
    console.error('❌ 设置保存失败:', saveResult.error);
}
```

#### 设置验证
```javascript
// 添加自定义验证器
settingsManager.addValidator('import.customFolderPath', (value) => {
    if (typeof value !== 'string') {
        return {
            valid: false,
            error: '自定义文件夹路径必须是字符串'
        };
    }
    
    if (value.includes('<>') || value.includes('..')) {
        return {
            valid: false,
            error: '路径包含非法字符'
        };
    }
    
    return {
        valid: true
    };
});

// 验证单个字段
const validation = settingsManager.validateField('import.mode', 'project_adjacent');
if (validation.valid) {
    console.log('✅ 字段验证通过');
} else {
    console.error('❌ 字段验证失败:', validation.error);
}

// 验证整个设置对象
const settings = settingsManager.getSettings();
const settingsValidation = settingsManager.validateSettings(settings);
if (settingsValidation.valid) {
    console.log('✅ 设置对象验证通过');
} else {
    console.error('❌ 设置对象验证失败:', settingsValidation.errors);
}
```

#### 监听设置变更
```javascript
// 监听特定字段变更
const removeModeListener = settingsManager.addFieldListener('import.mode', (newValue, oldValue, fieldPath) => {
    console.log(`🔄 导入模式变更: ${oldValue} -> ${newValue}`);
    
    // 根据新模式执行相应操作
    handleImportModeChange(newValue);
});

// 监听时间轴放置位置变更
const removePlacementListener = settingsManager.addFieldListener('import.timelineOptions.placement', (newValue, oldValue, fieldPath) => {
    console.log(`🔄 时间轴放置位置变更: ${oldValue} -> ${newValue}`);
    
    // 更新相关UI或逻辑
    updateTimelinePlacement(newValue);
});

// 监听所有字段变更
const removeWildcardListener = settingsManager.addFieldListener('*', (newValue, oldValue, fieldPath) => {
    console.log(`🔄 任意字段变更: ${fieldPath} ${oldValue} -> ${newValue}`);
    
    // 通用处理逻辑
    handleAnyFieldChange(fieldPath, newValue, oldValue);
});

// 监听通用设置变更事件
const removeChangeListener = settingsManager.addListener((eventType, data) => {
    switch (eventType) {
        case 'saved':
            console.log('⚙️ 设置已保存:', data);
            break;
            
        case 'reset':
            console.log('⚙️ 设置已重置:', data);
            break;
            
        case 'fieldChange':
            console.log('🔄 字段已变更:', data);
            break;
    }
});

// 使用完成后移除监听器
// removeModeListener();
// removePlacementListener();
// removeWildcardListener();
// removeChangeListener();
```

### 高级使用

#### 设置迁移
```javascript
// 定义版本迁移规则
function migrateToVersion2(oldSettings) {
    const newSettings = { ...oldSettings };
    
    // 迁移旧字段结构到新结构
    if (!newSettings.import) {
        newSettings.import = {
            mode: oldSettings.importMode || 'project_adjacent',
            addToComposition: oldSettings.addToComp !== false, // 默认true
            timelineOptions: {
                enabled: oldSettings.addToComp !== false,
                placement: oldSettings.timelinePlacement || 'current_time',
                sequenceInterval: oldSettings.sequenceInterval || 1.0
            },
            projectAdjacentFolder: oldSettings.projectAdjacentFolder || 'Eagle_Assets',
            customFolderPath: oldSettings.customFolderPath || ''
        };
    }
    
    if (!newSettings.export) {
        newSettings.export = {
            format: oldSettings.exportFormat || 'png',
            quality: oldSettings.exportQuality || 100,
            includeMetadata: oldSettings.includeMetadata !== false
        };
    }
    
    // 清理旧字段
    delete newSettings.importMode;
    delete newSettings.addToComp;
    delete newSettings.timelinePlacement;
    delete newSettings.sequenceInterval;
    delete newSettings.projectAdjacentFolder;
    delete newSettings.customFolderPath;
    delete newSettings.exportFormat;
    delete newSettings.exportQuality;
    delete newSettings.includeMetadata;
    
    return newSettings;
}

// 添加迁移规则
settingsManager.addMigration(2, migrateToVersion2);

// 应用迁移
const oldSettings = {
    version: 1,
    importMode: 'direct',
    addToComp: true,
    timelinePlacement: 'timeline_start',
    sequenceInterval: 0.5
};

const migratedSettings = settingsManager.applyMigrations(oldSettings);
console.log('迁移后的设置:', migratedSettings);
```

#### 设置备份和恢复
```javascript
// 创建设置备份管理器
class SettingsBackupManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.maxBackups = 10;
    }
    
    /**
     * 创建设置备份
     * @returns {string} 备份ID
     */
    createBackup() {
        const timestamp = Date.now();
        const backupId = `backup_${timestamp}`;
        const settings = this.settingsManager.getSettings();
        
        // 在DEMO模式下保存到localStorage
        if (window.__DEMO_MODE_ACTIVE__) {
            const backups = JSON.parse(localStorage.getItem('eagle2ae_settings_backups') || '[]');
            backups.unshift({
                id: backupId,
                settings: settings,
                timestamp: timestamp,
                version: settings.version
            });
            
            // 限制备份数量
            if (backups.length > this.maxBackups) {
                backups.length = this.maxBackups;
            }
            
            localStorage.setItem('eagle2ae_settings_backups', JSON.stringify(backups));
            console.log(`✅ 备份已创建: ${backupId}`);
        }
        
        return backupId;
    }
    
    /**
     * 获取备份列表
     * @returns {Array} 备份列表
     */
    getBackups() {
        if (window.__DEMO_MODE_ACTIVE__) {
            const backups = JSON.parse(localStorage.getItem('eagle2ae_settings_backups') || '[]');
            return backups;
        }
        return [];
    }
    
    /**
     * 恢复设置备份
     * @param {string} backupId - 备份ID
     * @returns {Object} 恢复结果
     */
    restoreBackup(backupId) {
        if (window.__DEMO_MODE_ACTIVE__) {
            const backups = JSON.parse(localStorage.getItem('eagle2ae_settings_backups') || '[]');
            const backup = backups.find(b => b.id === backupId);
            
            if (!backup) {
                return {
                    success: false,
                    error: '备份不存在'
                };
            }
            
            // 应用备份的设置
            try {
                // 应用可能的迁移
                const migratedSettings = this.settingsManager.applyMigrations(backup.settings);
                
                // 验证迁移后的设置
                const validation = this.settingsManager.validateSettings(migratedSettings);
                if (!validation.valid) {
                    return {
                        success: false,
                        error: '备份设置验证失败',
                        validationErrors: validation.errors
                    };
                }
                
                // 更新当前设置
                this.settingsManager.currentSettings = migratedSettings;
                
                // 保存设置
                const saveResult = this.settingsManager.saveSettings(migratedSettings);
                
                if (saveResult.success) {
                    console.log(`✅ 备份已恢复: ${backupId}`);
                    return {
                        success: true,
                        restoredSettings: migratedSettings
                    };
                } else {
                    return saveResult;
                }
            } catch (error) {
                return {
                    success: false,
                    error: `恢复备份失败: ${error.message}`
                };
            }
        }
        
        return {
            success: false,
            error: '仅在DEMO模式下支持备份功能'
        };
    }
    
    /**
     * 删除备份
     * @param {string} backupId - 备份ID
     * @returns {boolean} 是否删除成功
     */
    deleteBackup(backupId) {
        if (window.__DEMO_MODE_ACTIVE__) {
            const backups = JSON.parse(localStorage.getItem('eagle2ae_settings_backups') || '[]');
            const filteredBackups = backups.filter(b => b.id !== backupId);
            
            localStorage.setItem('eagle2ae_settings_backups', JSON.stringify(filteredBackups));
            console.log(`✅ 备份已删除: ${backupId}`);
            return true;
        }
        return false;
    }
    
    /**
     * 清空所有备份
     */
    clearAllBackups() {
        if (window.__DEMO_MODE_ACTIVE__) {
            localStorage.removeItem('eagle2ae_settings_backups');
            console.log('✅ 所有备份已清空');
        }
    }
}

// 使用设置备份管理器
const backupManager = new SettingsBackupManager(settingsManager);

// 创建备份
const backupId = backupManager.createBackup();
console.log('备份ID:', backupId);

// 获取备份列表
const backups = backupManager.getBackups();
console.log('备份列表:', backups);

// 恢复备份
if (backups.length > 0) {
    const restoreResult = backupManager.restoreBackup(backups[0].id);
    if (restoreResult.success) {
        console.log('✅ 备份恢复成功');
    } else {
        console.error('❌ 备份恢复失败:', restoreResult.error);
    }
}
```

#### 设置同步
```javascript
// 创建设置同步器
class SettingsSyncManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.syncInProgress = false;
        this.syncInterval = null;
    }
    
    /**
     * 开始自动同步
     * @param {number} interval - 同步间隔（毫秒）
     */
    startAutoSync(interval = 30000) { // 默认30秒
        if (this.syncInterval) {
            console.log('🔄 自动同步已在运行');
            return;
        }
        
        this.syncInterval = setInterval(() => {
            this.syncSettings();
        }, interval);
        
        console.log(`🔄 自动同步已启动，间隔${interval}ms`);
    }
    
    /**
     * 停止自动同步
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('🔄 自动同步已停止');
        }
    }
    
    /**
     * 同步设置到云端
     */
    async syncSettings() {
        if (this.syncInProgress) {
            console.log('🔄 同步已在进行中');
            return;
        }
        
        this.syncInProgress = true;
        
        try {
            const settings = this.settingsManager.getSettings();
            
            // 检查是否需要同步
            if (!this.shouldSync(settings)) {
                console.log('🔄 无需同步');
                return;
            }
            
            console.log('🔄 开始同步设置到云端...');
            
            // 发送同步请求
            const response = await fetch('/api/settings/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    settings: settings,
                    timestamp: Date.now(),
                    userId: this.getUserId(),
                    deviceId: this.getDeviceId()
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ 设置同步成功:', result);
                
                // 更新同步状态
                this.updateSyncStatus(true, Date.now());
            } else {
                console.error(`❌ 设置同步失败: ${response.status} ${response.statusText}`);
                
                // 更新同步状态
                this.updateSyncStatus(false, Date.now(), response.statusText);
            }
        } catch (error) {
            console.error('❌ 设置同步异常:', error.message);
            
            // 更新同步状态
            this.updateSyncStatus(false, Date.now(), error.message);
        } finally {
            this.syncInProgress = false;
        }
    }
    
    /**
     * 从云端同步设置
     */
    async pullSettings() {
        try {
            console.log('🔄 从云端拉取设置...');
            
            // 发送拉取请求
            const response = await fetch('/api/settings/pull', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });
            
            if (response.ok) {
                const { settings, timestamp } = await response.json();
                
                // 验证云端设置
                const validation = this.settingsManager.validateSettings(settings);
                if (!validation.valid) {
                    console.error('❌ 云端设置验证失败:', validation.errors);
                    return;
                }
                
                // 应用可能的迁移
                const migratedSettings = this.settingsManager.applyMigrations(settings);
                
                // 更新本地设置
                this.settingsManager.currentSettings = migratedSettings;
                
                // 保存设置
                const saveResult = this.settingsManager.saveSettings(migratedSettings);
                
                if (saveResult.success) {
                    console.log('✅ 云端设置拉取成功');
                    
                    // 更新同步状态
                    this.updateSyncStatus(true, timestamp, 'pulled from cloud');
                } else {
                    console.error('❌ 云端设置保存失败:', saveResult.error);
                }
            } else {
                console.error(`❌ 云端设置拉取失败: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ 云端设置拉取异常:', error.message);
        }
    }
    
    /**
     * 检查是否需要同步
     * @param {Object} settings - 当前设置
     * @returns {boolean} 是否需要同步
     */
    shouldSync(settings) {
        // 这里可以实现更复杂的同步逻辑
        // 例如：检查是否有重要设置变更、距离上次同步的时间等
        return true;
    }
    
    /**
     * 更新同步状态
     * @param {boolean} success - 是否成功
     * @param {number} timestamp - 时间戳
     * @param {string} message - 消息
     */
    updateSyncStatus(success, timestamp, message = '') {
        const syncStatus = {
            success: success,
            timestamp: timestamp,
            message: message,
            lastSync: timestamp
        };
        
        if (window.__DEMO_MODE_ACTIVE__) {
            localStorage.setItem('eagle2ae_sync_status', JSON.stringify(syncStatus));
        }
        
        console.log(`🔄 同步状态: ${success ? '成功' : '失败'} - ${message || (success ? '同步完成' : '同步失败')}`);
    }
    
    /**
     * 获取同步状态
     * @returns {Object} 同步状态
     */
    getSyncStatus() {
        if (window.__DEMO_MODE_ACTIVE__) {
            const status = localStorage.getItem('eagle2ae_sync_status');
            return status ? JSON.parse(status) : { success: false, timestamp: 0, message: '从未同步' };
        }
        return { success: false, timestamp: 0, message: '非DEMO模式' };
    }
    
    /**
     * 获取认证令牌
     * @returns {string} 认证令牌
     */
    getAuthToken() {
        return localStorage.getItem('auth_token') || '';
    }
    
    /**
     * 获取用户ID
     * @returns {string} 用户ID
     */
    getUserId() {
        return localStorage.getItem('user_id') || 'anonymous';
    }
    
    /**
     * 获取设备ID
     * @returns {string} 设备ID
     */
    getDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }
}

// 使用设置同步器
const syncManager = new SettingsSyncManager(settingsManager);

// 开始自动同步
syncManager.startAutoSync(60000); // 1分钟同步一次

// 手动同步
// await syncManager.syncSettings();

// 手动拉取
// await syncManager.pullSettings();

// 检查同步状态
const syncStatus = syncManager.getSyncStatus();
console.log('同步状态:', syncStatus);

// 停止自动同步
// syncManager.stopAutoSync();
```

## 最佳实践

### 使用建议

#### 设置结构设计
```javascript
// 定义良好的设置结构
const wellDesignedSettings = {
    version: 2,
    import: {
        // 导入相关设置
        mode: 'project_adjacent', // direct, project_adjacent, custom_folder
        addToComposition: true,
        timelineOptions: {
            enabled: true,
            placement: 'current_time', // current_time, timeline_start
            sequenceInterval: 1.0
        },
        projectAdjacentFolder: 'Eagle_Assets',
        customFolderPath: '',
        autoImportOnConnect: false
    },
    export: {
        // 导出相关设置
        format: 'png', // png, jpg, tiff, psd
        quality: 100,
        includeMetadata: true,
        autoExportOnSave: false,
        exportPath: ''
    },
    connection: {
        // 连接相关设置
        host: 'localhost',
        port: 41595,
        autoConnect: true,
        connectTimeout: 5000,
        retryAttempts: 3,
        retryDelay: 2000
    },
    ui: {
        // UI相关设置
        theme: 'default', // default, dark, light
        language: 'zh-CN', // zh-CN, en-US, ja-JP
        showNotifications: true,
        autoUpdate: true,
        windowOpacity: 100,
        fontSize: 14
    },
    advanced: {
        // 高级设置
        debugMode: false,
        logLevel: 'info', // debug, info, warning, error
        cacheSize: 1024, // MB
        maxConcurrentDownloads: 5,
        userAgent: 'Eagle2AE-Extension/2.4.0'
    }
};

// 使用示例
const settingsManager = new SettingsManager(aeExtension);

// 为重要设置添加强类型验证
settingsManager.addValidator('import.mode', (value) => {
    const validModes = ['direct', 'project_adjacent', 'custom_folder'];
    if (!validModes.includes(value)) {
        return {
            valid: false,
            error: `导入模式必须是以下值之一: ${validModes.join(', ')}`
        };
    }
    return { valid: true };
});

settingsManager.addValidator('export.quality', (value) => {
    if (typeof value !== 'number' || value < 0 || value > 100) {
        return {
            valid: false,
            error: '导出质量必须是0-100之间的数字'
        };
    }
    return { valid: true };
});
```

#### 验证器模式
```javascript
// 创建验证器工厂
class ValidatorFactory {
    static createRangeValidator(min, max, errorMessage) {
        return (value) => {
            if (typeof value !== 'number' || value < min || value > max) {
                return {
                    valid: false,
                    error: errorMessage || `值必须在 ${min}-${max} 范围内`
                };
            }
            return { valid: true };
        };
    }
    
    static createStringValidator(minLength, maxLength, allowedChars, errorMessage) {
        return (value) => {
            if (typeof value !== 'string') {
                return {
                    valid: false,
                    error: errorMessage || '值必须是字符串'
                };
            }
            
            if (minLength && value.length < minLength) {
                return {
                    valid: false,
                    error: errorMessage || `字符串长度不能少于 ${minLength} 个字符`
                };
            }
            
            if (maxLength && value.length > maxLength) {
                return {
                    valid: false,
                    error: errorMessage || `字符串长度不能超过 ${maxLength} 个字符`
                };
            }
            
            if (allowedChars && !new RegExp(`^[${allowedChars}]*$`).test(value)) {
                return {
                    valid: false,
                    error: errorMessage || `字符串包含不允许的字符`
                };
            }
            
            return { valid: true };
        };
    }
    
    static createEnumValidator(validValues, errorMessage) {
        return (value) => {
            if (!validValues.includes(value)) {
                return {
                    valid: false,
                    error: errorMessage || `值必须是以下之一: ${validValues.join(', ')}`
                };
            }
            return { valid: true };
        };
    }
}

// 使用验证器工厂
const qualityValidator = ValidatorFactory.createRangeValidator(0, 100, '质量必须是0-100之间的数字');
const pathValidator = ValidatorFactory.createStringValidator(1, 500, 'a-zA-Z0-9_\\-/\\.', '路径格式无效');
const modeValidator = ValidatorFactory.createEnumValidator(['direct', 'project_adjacent', 'custom_folder'], '无效的导入模式');

settingsManager.addValidator('export.quality', qualityValidator);
settingsManager.addValidator('import.customFolderPath', pathValidator);
settingsManager.addValidator('import.mode', modeValidator);
```

#### 监听器模式
```javascript
// 创建设置监听器管理器
class SettingsListenerManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.listeners = new Map();
    }
    
    /**
     * 添加分组监听器
     * @param {string} group - 监听器组名
     * @param {Array} fieldPaths - 字段路径数组
     * @param {Function} handler - 处理函数
     */
    addGroupListener(group, fieldPaths, handler) {
        if (!this.listeners.has(group)) {
            this.listeners.set(group, []);
        }
        
        const groupListeners = this.listeners.get(group);
        const listenerHandles = [];
        
        for (const fieldPath of fieldPaths) {
            const handle = this.settingsManager.addFieldListener(fieldPath, (newValue, oldValue, fieldPath) => {
                handler(newValue, oldValue, fieldPath);
            });
            listenerHandles.push(handle);
        }
        
        groupListeners.push({
            fieldPaths: fieldPaths,
            handler: handler,
            handles: listenerHandles
        });
        
        console.log(`✅ 添加组监听器: ${group}`);
    }
    
    /**
     * 移除分组监听器
     * @param {string} group - 监听器组名
     */
    removeGroupListener(group) {
        if (this.listeners.has(group)) {
            const groupListeners = this.listeners.get(group);
            
            for (const listener of groupListeners) {
                for (const handle of listener.handles) {
                    handle(); // 调用移除函数
                }
            }
            
            this.listeners.delete(group);
            console.log(`✅ 移除组监听器: ${group}`);
        }
    }
    
    /**
     * 添加UI更新监听器
     */
    addUIUpdateListeners() {
        // 导入设置变化时更新UI
        this.addGroupListener('uiImport', [
            'import.mode',
            'import.addToComposition',
            'import.timelineOptions.placement',
            'import.timelineOptions.sequenceInterval'
        ], () => {
            this.updateImportUI();
        });
        
        // 导出设置变化时更新UI
        this.addGroupListener('uiExport', [
            'export.format',
            'export.quality',
            'export.includeMetadata'
        ], () => {
            this.updateExportUI();
        });
        
        // UI设置变化时更新UI主题
        this.addGroupListener('uiTheme', [
            'ui.theme',
            'ui.fontSize'
        ], () => {
            this.updateUITheme();
        });
    }
    
    updateImportUI() {
        // 更新导入相关的UI
        console.log('🔄 更新导入UI');
    }
    
    updateExportUI() {
        // 更新导出相关的UI
        console.log('🔄 更新导出UI');
    }
    
    updateUITheme() {
        // 更新UI主题
        console.log('🔄 更新UI主题');
    }
}

// 使用设置监听器管理器
const listenerManager = new SettingsListenerManager(settingsManager);
listenerManager.addUIUpdateListeners();
```

### 性能优化

#### 深度监听优化
```javascript
// 创建优化的深度监听器
class OptimizedDeepListener {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.debounceTimers = new Map();
        this.batchChanges = new Map();
        this.batchTimeout = 100; // 100ms批处理延迟
    }
    
    /**
     * 添加深度变化监听器（带防抖）
     * @param {string} fieldPath - 字段路径
     * @param {Function} callback - 回调函数
     * @param {number} debounceDelay - 防抖延迟
     */
    addDeepListener(fieldPath, callback, debounceDelay = 200) {
        const debouncedCallback = this.debounce((newValue, oldValue, fieldPath) => {
            callback(newValue, oldValue, fieldPath);
        }, debounceDelay);
        
        return this.settingsManager.addFieldListener(fieldPath, debouncedCallback);
    }
    
    /**
     * 添加批处理监听器
     * @param {string} fieldPath - 字段路径
     * @param {Function} callback - 回调函数
     */
    addBatchListener(fieldPath, callback) {
        const batchCallback = (newValue, oldValue, fieldPath) => {
            // 添加到批处理队列
            if (!this.batchChanges.has(fieldPath)) {
                this.batchChanges.set(fieldPath, {
                    newValue: newValue,
                    oldValue: oldValue,
                    timestamp: Date.now()
                });
                
                // 设置批处理超时
                if (!this.batchProcessTimer) {
                    this.batchProcessTimer = setTimeout(() => {
                        this.processBatchChanges();
                    }, this.batchTimeout);
                }
            }
        };
        
        return this.settingsManager.addFieldListener(fieldPath, batchCallback);
    }
    
    /**
     * 处理批量变化
     */
    processBatchChanges() {
        if (this.batchChanges.size === 0) return;
        
        const changes = new Map(this.batchChanges);
        this.batchChanges.clear();
        this.batchProcessTimer = null;
        
        // 执行批量处理回调
        this.onBatchChanges(changes);
    }
    
    /**
     * 批量变化处理回调
     * @param {Map} changes - 变化映射
     */
    onBatchChanges(changes) {
        console.log(`🔄 批量处理 ${changes.size} 个设置变化`);
        
        for (const [fieldPath, change] of changes) {
            console.log(`   ${fieldPath}: ${change.oldValue} -> ${change.newValue}`);
        }
    }
    
    /**
     * 防抖函数
     */
    debounce(func, wait) {
        return (...args) => {
            const key = args[0]; // 使用第一个参数作为去抖键
            if (this.debounceTimers.has(key)) {
                clearTimeout(this.debounceTimers.get(key));
            }
            
            const timeoutId = setTimeout(() => {
                func.apply(this, args);
                this.debounceTimers.delete(key);
            }, wait);
            
            this.debounceTimers.set(key, timeoutId);
        };
    }
    
    /**
     * 清理资源
     */
    cleanup() {
        // 清理所有定时器
        for (const timeoutId of this.debounceTimers.values()) {
            clearTimeout(timeoutId);
        }
        this.debounceTimers.clear();
        
        // 清理批处理定时器
        if (this.batchProcessTimer) {
            clearTimeout(this.batchProcessTimer);
            this.batchProcessTimer = null;
        }
        
        // 清空批处理队列
        this.batchChanges.clear();
        
        console.log('🧹 深度监听器资源已清理');
    }
}

// 使用优化的深度监听器
const optimizedListener = new OptimizedDeepListener(settingsManager);

// 添加防抖监听器
const removeDebounceListener = optimizedListener.addDeepListener(
    'import.timelineOptions.sequenceInterval', 
    (newValue, oldValue, fieldPath) => {
        console.log(`防抖更新: ${fieldPath} ${oldValue} -> ${newValue}`);
        // 执行可能耗时的操作
        updateSequencePreview(newValue);
    },
    500 // 500ms防抖
);

// 添加批处理监听器
const removeBatchListener = optimizedListener.addBatchListener(
    'import.mode',
    (newValue, oldValue, fieldPath) => {
        console.log(`批处理: ${fieldPath} ${oldValue} -> ${newValue}`);
    }
);

// 在组件销毁时清理
// optimizedListener.cleanup();
```

#### 内存管理
```javascript
// 实现设置管理器的内存清理
function cleanupSettingsManager(settingsManager) {
    try {
        // 清理字段监听器
        settingsManager.fieldListeners.clear();
        
        // 清理通用监听器
        settingsManager.changeListeners = [];
        
        // 清理验证器
        settingsManager.validators.clear();
        
        // 清理迁移规则
        settingsManager.migrations.clear();
        
        // 清理设置存储
        settingsManager.settingsStorage.clear();
        
        // 清理事件监听器（如果有的话）
        if (settingsManager.eventListeners) {
            settingsManager.eventListeners = [];
        }
        
        settingsManager.log('🧹 设置管理器资源已清理', 'debug');
        
    } catch (error) {
        settingsManager.log(`清理设置管理器资源失败: ${error.message}`, 'error');
    }
}

// 创建内存监控器
class SettingsMemoryMonitor {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.monitorInterval = null;
        this.threshold = 50 * 1024 * 1024; // 50MB阈值
    }
    
    startMonitoring() {
        if (this.monitorInterval) {
            console.log('📊 设置内存监控已在运行');
            return;
        }
        
        this.monitorInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, 30000); // 每30秒检查一次
        
        console.log('📊 开始设置内存监控');
    }
    
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            console.log('📊 停止设置内存监控');
        }
    }
    
    checkMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            const usage = memory.usedJSHeapSize;
            const total = memory.totalJSHeapSize;
            const limit = memory.jsHeapSizeLimit;
            
            console.log(`📊 内存使用: ${(usage / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB`);
            
            if (usage > this.threshold) {
                console.warn(`⚠️ 内存使用超过阈值: ${(usage / 1024 / 1024).toFixed(2)}MB`);
                
                // 执行内存清理
                this.performCleanup();
            }
        }
    }
    
    performCleanup() {
        console.log('🧹 执行内存清理...');
        
        // 清理设置管理器
        cleanupSettingsManager(this.settingsManager);
        
        // 强制垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
            console.log('🧹 手动垃圾回收完成');
        }
    }
}

// 使用内存监控器
const memoryMonitor = new SettingsMemoryMonitor(settingsManager);
memoryMonitor.startMonitoring();

// 在页面卸载时清理
window.addEventListener('beforeunload', () => {
    memoryMonitor.stopMonitoring();
    cleanupSettingsManager(settingsManager);
});
```

## 故障排除

### 常见问题

#### 设置保存失败
- **症状**：调用`saveSettings`返回错误或设置未持久化
- **解决**：
  1. 检查DEMO模式/CEP模式环境
  2. 验证存储路径权限
  3. 确认设置格式正确
  4. 检查验证规则

#### 设置加载异常
- **症状**：加载的设置为null或包含错误数据
- **解决**：
  1. 检查保存的设置文件格式
  2. 验证迁移规则是否正确
  3. 确认默认设置结构
  4. 查看控制台错误日志

#### 验证器失效
- **症状**：验证器不执行或验证结果不正确
- **解决**：
  1. 检查验证器函数格式
  2. 验证字段路径是否正确
  3. 确认验证器已正确添加
  4. 检查验证器返回格式

#### 监听器泄露
- **症状**：内存使用持续增长，监听器数量不断累积
- **解决**：
  1. 确保在不需要时移除监听器
  2. 使用返回的移除函数
  3. 检查监听器清理逻辑

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控所有设置变更
settingsManager.addListener((eventType, data) => {
    switch (eventType) {
        case 'fieldChange':
            console.log('🔄 字段变更:', data);
            break;
            
        case 'saved':
            console.log('💾 设置保存:', data.version || 'unknown');
            break;
            
        case 'reset':
            console.log('🔄 设置重置:', data.version || 'unknown');
            break;
    }
});

// 监控验证过程
settingsManager.validateSettings = new Proxy(settingsManager.validateSettings, {
    apply: function(target, thisArg, argumentsList) {
        console.log('🔍 验证设置:', argumentsList[0]);
        const result = target.apply(thisArg, argumentsList);
        console.log('✅ 验证结果:', result);
        return result;
    }
});
```

#### 设置诊断工具
```javascript
// 创建设置诊断工具
class SettingsDiagnostic {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
    }
    
    /**
     * 运行完整诊断
     */
    async runDiagnostic() {
        console.log('🔍 开始设置诊断...');
        
        // 1. 检查设置结构
        console.log('1. 检查设置结构...');
        this.checkSettingsStructure();
        
        // 2. 验证所有字段
        console.log('2. 验证所有字段...');
        await this.validateAllFields();
        
        // 3. 检查监听器
        console.log('3. 检查监听器...');
        this.checkListeners();
        
        // 4. 检查验证器
        console.log('4. 检查验证器...');
        this.checkValidators();
        
        // 5. 检查存储
        console.log('5. 检查存储...');
        await this.checkStorage();
        
        console.log('✅ 设置诊断完成');
    }
    
    /**
     * 检查设置结构
     */
    checkSettingsStructure() {
        const settings = this.settingsManager.getSettings();
        const expectedFields = [
            'version',
            'import.mode',
            'import.addToComposition',
            'export.format',
            'connection.host',
            'ui.theme'
        ];
        
        for (const field of expectedFields) {
            const value = this.settingsManager.getFieldFromObject(settings, field);
            console.log(`   ${field}: ${value !== undefined ? '✅' : '❌'} ${value}`);
        }
    }
    
    /**
     * 验证所有字段
     */
    async validateAllFields() {
        const settings = this.settingsManager.getSettings();
        const allFields = this.settingsManager.getAllFields(settings);
        
        let validCount = 0;
        let invalidCount = 0;
        
        for (const field of allFields) {
            const value = this.settingsManager.getFieldFromObject(settings, field);
            const validation = this.settingsManager.validateField(field, value);
            
            if (validation.valid) {
                validCount++;
                console.log(`   ✅ ${field}: ${JSON.stringify(value)}`);
            } else {
                invalidCount++;
                console.log(`   ❌ ${field}: ${JSON.stringify(value)} - ${validation.error}`);
            }
        }
        
        console.log(`   总计: ${validCount} 有效, ${invalidCount} 无效`);
    }
    
    /**
     * 检查监听器
     */
    checkListeners() {
        console.log(`   字段监听器: ${this.settingsManager.fieldListeners.size} 个字段`);
        console.log(`   通用监听器: ${this.settingsManager.changeListeners.length} 个`);
        
        for (const [fieldPath, listeners] of this.settingsManager.fieldListeners) {
            console.log(`     ${fieldPath}: ${listeners.length} 个监听器`);
        }
    }
    
    /**
     * 检查验证器
     */
    checkValidators() {
        console.log(`   验证器: ${this.settingsManager.validators.size} 个字段`);
        
        for (const [fieldPath, validators] of this.settingsManager.validators) {
            console.log(`     ${fieldPath}: ${validators.length} 个验证器`);
        }
    }
    
    /**
     * 检查存储
     */
    async checkStorage() {
        const loaded = this.settingsManager.loadSettings();
        const saved = this.settingsManager.saveSettings(this.settingsManager.getSettings());
        
        console.log(`   加载: ${loaded ? '✅' : '❌'}`);
        console.log(`   保存: ${saved.success ? '✅' : '❌' + (saved.error ? ` (${saved.error})` : '')}`);
        
        // 检查存储文件
        if (window.__DEMO_MODE_ACTIVE__) {
            const settingsStr = localStorage.getItem('eagle2ae_settings');
            console.log(`   localStorage: ${settingsStr ? settingsStr.length : 0} 字符`);
        }
    }
}

// 运行诊断
const diagnostic = new SettingsDiagnostic(settingsManager);
await diagnostic.runDiagnostic();
```

## 扩展性

### 自定义扩展

#### 扩展设置管理器
```javascript
// 创建自定义设置管理器
class CustomSettingsManager extends SettingsManager {
    constructor(aeExtension) {
        super(aeExtension);
        
        // 添加自定义属性
        this.customSettings = new Map();
        this.syncManager = null;
        this.backupManager = null;
        this.encryptionEnabled = false;
        this.encryptionKey = null;
        
        // 初始化扩展功能
        this.initCustomFeatures();
    }
    
    initCustomFeatures() {
        // 初始化同步管理器
        this.syncManager = new SettingsSyncManager(this);
        
        // 初始化备份管理器
        this.backupManager = new SettingsBackupManager(this);
        
        // 添加自定义验证规则
        this.addCustomValidators();
        
        // 添加自定义迁移规则
        this.addCustomMigrations();
    }
    
    addCustomValidators() {
        // 添加加密路径验证器
        this.addValidator('advanced.encryptionKey', (value) => {
            if (this.encryptionEnabled && (!value || value.length < 8)) {
                return {
                    valid: false,
                    error: '加密密钥长度不能少于8个字符'
                };
            }
            return { valid: true };
        });
        
        // 添加自定义文件路径验证器
        this.addValidator('advanced.customPaths', (value) => {
            if (Array.isArray(value)) {
                for (const path of value) {
                    if (typeof path !== 'string' || path.length === 0) {
                        return {
                            valid: false,
                            error: '自定义路径必须是非空字符串数组'
                        };
                    }
                }
                return { valid: true };
            }
            return {
                valid: false,
                error: '自定义路径必须是数组'
            };
        });
    }
    
    addCustomMigrations() {
        // 添加自定义迁移规则
        this.addMigration(3, (oldSettings) => {
            const newSettings = { ...oldSettings };
            
            // 添加新的高级设置
            if (!newSettings.advanced) {
                newSettings.advanced = {
                    customPaths: [],
                    encryptionEnabled: false,
                    encryptionKey: '',
                    performanceMode: 'standard'
                };
            }
            
            return newSettings;
        });
    }
    
    /**
     * 加密设置数据
     * @param {string} data - 要加密的数据
     * @returns {string} 加密后的数据
     */
    encryptData(data) {
        if (!this.encryptionEnabled || !this.encryptionKey) {
            return data;
        }
        
        // 简单的加密实现（实际应用中应使用更强的加密）
        try {
            const encoded = btoa(encodeURIComponent(data));
            return encoded.split('').reverse().join(''); // 简单反转
        } catch (error) {
            console.error('加密失败:', error.message);
            return data;
        }
    }
    
    /**
     * 解密设置数据
     * @param {string} encryptedData - 加密的数据
     * @returns {string} 解密后的数据
     */
    decryptData(encryptedData) {
        if (!this.encryptionEnabled || !this.encryptionKey) {
            return encryptedData;
        }
        
        // 简单的解密实现
        try {
            const reversed = encryptedData.split('').reverse().join('');
            return decodeURIComponent(atob(reversed));
        } catch (error) {
            console.error('解密失败:', error.message);
            return encryptedData;
        }
    }
    
    /**
     * 启用/禁用加密
     * @param {boolean} enabled - 是否启用
     * @param {string} key - 加密密钥
     */
    setEncryption(enabled, key = null) {
        this.encryptionEnabled = enabled;
        if (key) {
            this.encryptionKey = key;
        }
        
        this.log(`🔒 加密已${enabled ? '启用' : '禁用'}`, 'debug');
    }
    
    /**
     * 保存加密设置
     * @param {Object} settings - 要保存的设置
     * @param {boolean} silent - 是否静默保存
     * @returns {Object} 保存结果
     */
    saveSettings(settings, silent = false) {
        if (this.encryptionEnabled) {
            // 加密设置数据
            const encryptedSettings = this.encryptData(JSON.stringify(settings));
            const saveResult = super.saveSettings({ encryptedData: encryptedSettings }, silent);
            return saveResult;
        }
        
        return super.saveSettings(settings, silent);
    }
    
    /**
     * 加载加密设置
     * @returns {Object} 加载的设置
     */
    loadSettings() {
        const loadedData = super.loadSettings();
        
        if (this.encryptionEnabled && loadedData && loadedData.encryptedData) {
            // 解密设置数据
            const decryptedData = this.decryptData(loadedData.encryptedData);
            try {
                const settings = JSON.parse(decryptedData);
                this.currentSettings = settings;
                this.loaded = true;
                return settings;
            } catch (error) {
                this.log(`解密设置失败: ${error.message}，使用默认设置`, 'error');
                this.currentSettings = { ...this.defaultSettings };
                this.loaded = true;
                return null;
            }
        }
        
        return loadedData;
    }
    
    /**
     * 导出设置到文件
     * @param {string} filename - 文件名
     * @returns {Object} 导出结果
     */
    exportSettings(filename = 'eagle2ae_settings.json') {
        try {
            const settings = this.getSettings();
            const dataStr = JSON.stringify(settings, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            // 创建下载链接
            const exportLink = document.createElement('a');
            exportLink.setAttribute('href', dataUri);
            exportLink.setAttribute('download', filename);
            exportLink.click();
            
            this.log(`✅ 设置已导出到: ${filename}`, 'debug');
            
            return {
                success: true,
                filename: filename,
                size: dataStr.length
            };
        } catch (error) {
            this.log(`导出设置失败: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 从文件导入设置
     * @param {File} file - 要导入的文件
     * @returns {Object} 导入结果
     */
    async importSettings(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    try {
                        const dataStr = event.target.result;
                        const settings = JSON.parse(dataStr);
                        
                        // 验证导入的设置
                        const validation = this.validateSettings(settings);
                        if (!validation.valid) {
                            resolve({
                                success: false,
                                error: '导入的设置验证失败',
                                validationErrors: validation.errors
                            });
                            return;
                        }
                        
                        // 应用导入的设置
                        this.currentSettings = settings;
                        
                        // 保存设置
                        const saveResult = this.saveSettings(settings, true);
                        if (saveResult.success) {
                            this.log('✅ 设置导入成功', 'debug');
                            resolve({
                                success: true,
                                settings: settings
                            });
                        } else {
                            resolve(saveResult);
                        }
                    } catch (parseError) {
                        resolve({
                            success: false,
                            error: `解析设置文件失败: ${parseError.message}`
                        });
                    }
                };
                
                reader.onerror = () => {
                    resolve({
                        success: false,
                        error: '读取设置文件失败'
                    });
                };
                
                reader.readAsText(file);
            } catch (error) {
                resolve({
                    success: false,
                    error: error.message
                });
            }
        });
    }
}

// 使用自定义设置管理器
const customSettingsManager = new CustomSettingsManager(aeExtension);

// 启用加密
// customSettingsManager.setEncryption(true, 'my-secret-key');

// 导出设置
// const exportResult = customSettingsManager.exportSettings('my_settings.json');
// console.log('导出结果:', exportResult);

// 在HTML中添加文件输入以导入设置
// <input type="file" id="settings-import" accept=".json" />
// document.getElementById('settings-import').addEventListener('change', async (event) => {
//     const file = event.target.files[0];
//     if (file) {
//         const importResult = await customSettingsManager.importSettings(file);
//         console.log('导入结果:', importResult);
//     }
// });
```

#### 插件化架构
```javascript
// 创建设置插件系统
class SettingsPluginManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.plugins = new Map();
        this.pluginSettings = new Map();
    }
    
    /**
     * 注册插件
     * @param {string} pluginId - 插件ID
     * @param {Object} plugin - 插件对象
     */
    registerPlugin(pluginId, plugin) {
        this.plugins.set(pluginId, plugin);
        
        // 初始化插件设置
        if (plugin.getDefaultSettings) {
            const defaultSettings = plugin.getDefaultSettings();
            this.pluginSettings.set(pluginId, defaultSettings);
            
            // 合并到主设置
            this.mergePluginSettings(pluginId, defaultSettings);
        }
        
        // 绑定插件事件
        if (plugin.onSettingsChange) {
            this.settingsManager.addFieldListener(`${pluginId}.*`, (newValue, oldValue, fieldPath) => {
                plugin.onSettingsChange(newValue, oldValue, fieldPath);
            });
        }
        
        console.log(`🔌 插件已注册: ${pluginId}`);
    }
    
    /**
     * 合并插件设置
     * @param {string} pluginId - 插件ID
     * @param {Object} settings - 插件设置
     */
    mergePluginSettings(pluginId, settings) {
        const currentSettings = this.settingsManager.getSettings();
        this.settingsManager.setFieldToObject(currentSettings, pluginId, settings);
        this.settingsManager.currentSettings = currentSettings;
    }
    
    /**
     * 获取插件设置
     * @param {string} pluginId - 插件ID
     * @returns {Object} 插件设置
     */
    getPluginSettings(pluginId) {
        return this.settingsManager.getField(pluginId) || this.pluginSettings.get(pluginId) || {};
    }
    
    /**
     * 更新插件设置
     * @param {string} pluginId - 插件ID
     * @param {Object} settings - 新的插件设置
     * @returns {Object} 更新结果
     */
    updatePluginSettings(pluginId, settings) {
        return this.settingsManager.updateField(pluginId, settings);
    }
    
    /**
     * 创建插件设置验证器
     * @param {string} pluginId - 插件ID
     * @param {Object} validationRules - 验证规则
     */
    addPluginValidator(pluginId, validationRules) {
        for (const [fieldPath, validator] of Object.entries(validationRules)) {
            const fullFieldPath = `${pluginId}.${fieldPath}`;
            this.settingsManager.addValidator(fullFieldPath, validator);
        }
    }
    
    /**
     * 获取所有插件
     * @returns {Array} 插件列表
     */
    getPlugins() {
        return Array.from(this.plugins.keys());
    }
}

// 示例插件
const examplePlugin = {
    id: 'example_plugin',
    name: 'Example Plugin',
    version: '1.0.0',
    
    getDefaultSettings() {
        return {
            enabled: true,
            options: {
                feature1: true,
                feature2: false,
                value: 42
            }
        };
    },
    
    onSettingsChange(newValue, oldValue, fieldPath) {
        console.log(`Plugin setting changed: ${fieldPath} ${oldValue} -> ${newValue}`);
        
        // 插件特定的设置变更处理
        if (fieldPath === 'example_plugin.enabled') {
            if (newValue) {
                this.enableFeature();
            } else {
                this.disableFeature();
            }
        }
    },
    
    enableFeature() {
        console.log('Plugin feature enabled');
    },
    
    disableFeature() {
        console.log('Plugin feature disabled');
    }
};

// 使用插件管理器
const pluginManager = new SettingsPluginManager(settingsManager);

// 注册插件
pluginManager.registerPlugin(examplePlugin.id, examplePlugin);

// 获取插件设置
const pluginSettings = pluginManager.getPluginSettings('example_plugin');
console.log('插件设置:', pluginSettings);

// 更新插件设置
const updateResult = pluginManager.updatePluginSettings('example_plugin', {
    enabled: false,
    options: {
        feature1: false,
        feature2: true,
        value: 100
    }
});
console.log('插件设置更新结果:', updateResult);