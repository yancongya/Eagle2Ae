# 设置管理系统

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了全新的设置管理系统（Settings Management System），该系统提供了面板特定的设置管理、实时同步、字段监听、自动保存等功能。通过先进的架构设计，设置管理系统确保每个面板实例都能拥有独立且一致的配置体验。

## 核心特性

### 面板特定设置
- 每个面板实例拥有独立的设置存储空间
- 支持面板间设置隔离和共享
- 自动识别面板ID并关联对应设置

### 实时同步机制
- 设置变更时实时同步到UI
- 支持双向数据绑定
- 提供防抖更新优化性能

### 字段监听功能
- 支持对特定设置字段的变更监听
- 提供细粒度的变更通知
- 支持一次性监听和持续监听

### 自动保存机制
- 配置变更时自动保存到本地存储
- 支持防抖保存，避免频繁写入
- 提供手动保存和强制保存选项

### 类型安全验证
- 支持设置值的类型验证
- 提供默认值回退机制
- 支持自定义验证规则

### 版本兼容性
- 支持设置格式的向前和向后兼容
- 提供设置迁移机制
- 自动处理旧版本设置格式

## 使用指南

### 基本设置操作

#### 获取设置
```javascript
// 获取所有设置
const allSettings = settingsManager.getSettings();

// 获取特定设置字段
const importMode = settingsManager.getField('mode');
const addToComposition = settingsManager.getField('addToComposition');

// 获取嵌套字段
const timelinePlacement = settingsManager.getField('timelineOptions.placement');
```

#### 更新设置
```javascript
// 更新单个字段
settingsManager.updateField('mode', 'custom_folder');

// 更新嵌套字段
settingsManager.updateField('timelineOptions.placement', 'timeline_start');

// 批量更新多个字段
settingsManager.updateFields({
    'mode': 'project_adjacent',
    'projectAdjacentFolder': 'MyAssets',
    'addToComposition': true
});
```

#### 保存设置
```javascript
// 保存所有设置
const saveResult = settingsManager.saveSettings(allSettings);

// 保存特定设置
const fieldSaveResult = settingsManager.saveField('mode', 'direct');

// 静默保存（不触发自动保存事件）
settingsManager.saveSettings(allSettings, true);
```

### 高级功能

#### 字段监听
```javascript
// 监听特定字段变更
settingsManager.addFieldListener('mode', (newValue, oldValue) => {
    console.log(`导入模式已更改为: ${newValue}`);
    
    // 根据新模式更新UI
    updateImportModeUI(newValue);
});

// 监听嵌套字段变更
settingsManager.addFieldListener('timelineOptions.placement', (newValue, oldValue) => {
    console.log(`时间轴放置位置已更改为: ${newValue}`);
    
    // 更新时间轴选项UI
    updateTimePlacementUI(newValue);
});

// 移除字段监听器
const removeListener = settingsManager.addFieldListener('mode', handler);
// 使用返回的函数移除监听器
removeListener();
```

#### 设置验证
```javascript
// 添加自定义验证规则
settingsManager.addValidator('customFolderPath', (value) => {
    if (!value || value.trim() === '') {
        return { valid: false, error: '自定义文件夹路径不能为空' };
    }
    
    if (!fs.existsSync(value)) {
        return { valid: true, warning: '指定的文件夹路径不存在，将自动创建' };
    }
    
    return { valid: true };
});

// 验证特定字段
const validation = settingsManager.validateField('customFolderPath', '/path/to/folder');
if (!validation.valid) {
    console.error(`验证失败: ${validation.error}`);
}
```

#### 设置迁移
```javascript
// 定义设置迁移规则
settingsManager.addMigration(1, (oldSettings) => {
    // 从版本1迁移到版本2
    const newSettings = { ...oldSettings };
    
    // 迁移旧字段名
    if (oldSettings.hasOwnProperty('importMode')) {
        newSettings.mode = oldSettings.importMode;
        delete newSettings.importMode;
    }
    
    // 设置默认值
    if (!newSettings.timelineOptions) {
        newSettings.timelineOptions = {
            enabled: true,
            placement: 'current_time',
            sequenceInterval: 1.0
        };
    }
    
    return newSettings;
});

// 应用迁移
const migratedSettings = settingsManager.applyMigrations(oldSettings);
```

## 技术实现

### 核心类结构

```javascript
/**
 * 设置管理器
 * 负责管理AE扩展的所有设置，支持面板特定配置和实时同步
 */
class SettingsManager {
    /**
     * 构造函数
     * @param {string} panelId - 面板ID，用于面板特定设置隔离
     */
    constructor(panelId) {
        this.panelId = panelId;
        this.settings = this.getDefaultSettings();
        this.preferences = this.getDefaultPreferences();
        this.validators = new Map();
        this.fieldListeners = new Map();
        this.migrations = new Map();
        this.changeListeners = [];
        
        // 初始化设置
        this.initializeSettings();
        
        this.log(`⚙️ 设置管理器已为面板 ${panelId} 初始化`, 'debug');
    }
}
```

### 默认设置配置

```javascript
/**
 * 获取默认设置
 * @returns {Object} 默认设置对象
 */
getDefaultSettings() {
    return {
        // 导入模式设置
        mode: 'project_adjacent', // 'direct' | 'project_adjacent' | 'custom_folder'
        projectAdjacentFolder: 'Eagle_Assets',
        customFolderPath: '',
        addToComposition: true,
        
        // 时间轴选项
        timelineOptions: {
            enabled: true,
            placement: 'current_time', // 'current_time' | 'timeline_start'
            sequenceInterval: 1.0
        },
        
        // 文件管理选项
        fileManagement: {
            keepOriginalName: true,
            addTimestamp: false,
            createTagFolders: false,
            deleteFromEagle: false
        },
        
        // 导出设置
        exportSettings: {
            mode: 'project_adjacent',
            autoCopy: true,
            burnAfterReading: false,
            addTimestamp: false,
            createSubfolders: false,
            projectAdjacentFolder: 'Eagle_Assets'
        },
        
        // 高级选项
        advancedOptions: {
            enableLogging: true,
            maxLogEntries: 1000,
            autoSaveInterval: 5000,
            enableAnimations: true
        },
        
        // UI设置
        uiSettings: {
            showQuickSettings: true,
            showAdvancedSettings: false,
            showLogPanel: true,
            theme: 'dark'
        }
    };
}

/**
 * 获取默认用户偏好
 * @returns {Object} 默认用户偏好对象
 */
getDefaultPreferences() {
    return {
        communicationPort: 8080,
        theme: 'dark',
        language: 'zh-CN',
        lastUsedFolder: '',
        recentFolders: [],
        enableSoundEffects: true,
        autoCheckUpdates: true,
        updateChannel: 'stable'
    };
}
```

### 设置初始化

```javascript
/**
 * 初始化设置
 * 从本地存储加载设置，如果不存在则使用默认设置
 */
initializeSettings() {
    try {
        // 加载设置
        const savedSettings = this.loadSettings();
        if (savedSettings) {
            // 应用迁移规则
            const migratedSettings = this.applyMigrations(savedSettings);
            
            // 验证设置
            const validationResult = this.validateSettings(migratedSettings);
            if (validationResult.valid) {
                this.settings = { ...this.getDefaultSettings(), ...migratedSettings };
                this.log('✅ 设置已从本地存储加载', 'debug');
            } else {
                this.log(`⚠️ 设置验证失败: ${validationResult.error}，使用默认设置`, 'warning');
                this.settings = this.getDefaultSettings();
            }
        } else {
            this.settings = this.getDefaultSettings();
            this.log('ℹ️ 未找到保存的设置，使用默认设置', 'debug');
        }
        
        // 加载用户偏好
        const savedPreferences = this.loadPreferences();
        if (savedPreferences) {
            this.preferences = { ...this.getDefaultPreferences(), ...savedPreferences };
            this.log('✅ 用户偏好已从本地存储加载', 'debug');
        } else {
            this.preferences = this.getDefaultPreferences();
            this.log('ℹ️ 未找到保存的用户偏好，使用默认偏好', 'debug');
        }
        
        // 触发初始化完成事件
        this.emit('initialized', {
            settings: this.settings,
            preferences: this.preferences
        });
        
    } catch (error) {
        this.log(`❌ 设置初始化失败: ${error.message}，使用默认设置`, 'error');
        this.settings = this.getDefaultSettings();
        this.preferences = this.getDefaultPreferences();
    }
}
```

### 设置加载与保存

```javascript
/**
 * 从本地存储加载设置
 * @returns {Object|null} 设置对象或null
 */
loadSettings() {
    try {
        const settingsKey = this.getPanelStorageKey('aeSettings');
        const savedSettings = localStorage.getItem(settingsKey);
        
        if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            
            // 检查设置版本
            if (parsedSettings.version) {
                this.log(`🔍 检测到版本 ${parsedSettings.version} 的设置`, 'debug');
            }
            
            return parsedSettings;
        }
        
        return null;
    } catch (error) {
        this.log(`⚠️ 加载设置失败: ${error.message}`, 'warning');
        return null;
    }
}

/**
 * 保存设置到本地存储
 * @param {Object} settings - 要保存的设置
 * @param {boolean} silent - 是否静默保存（不触发事件）
 * @returns {Object} 保存结果
 */
saveSettings(settings, silent = false) {
    try {
        // 验证设置
        const validationResult = this.validateSettings(settings);
        if (!validationResult.valid) {
            return {
                success: false,
                error: validationResult.error
            };
        }
        
        // 添加版本信息和时间戳
        const settingsToSave = {
            ...settings,
            version: this.CURRENT_SETTINGS_VERSION,
            lastModified: new Date().toISOString(),
            panelId: this.panelId
        };
        
        // 保存到本地存储
        const settingsKey = this.getPanelStorageKey('aeSettings');
        localStorage.setItem(settingsKey, JSON.stringify(settingsToSave));
        
        // 更新内存中的设置
        this.settings = settingsToSave;
        
        this.log(`✅ 设置已保存到本地存储 (${settingsKey})`, 'debug');
        
        // 触发保存事件
        if (!silent) {
            this.emit('saved', settingsToSave);
            this.emit('autoSave', settingsToSave);
        }
        
        return {
            success: true,
            settings: settingsToSave
        };
        
    } catch (error) {
        this.log(`❌ 保存设置失败: ${error.message}`, 'error');
        
        return {
            success: false,
            error: error.message
        };
    }
}
```

### 字段操作实现

```javascript
/**
 * 获取设置字段值
 * @param {string} fieldPath - 字段路径，支持点号分隔的嵌套字段
 * @returns {*} 字段值
 */
getField(fieldPath) {
    try {
        // 支持嵌套字段路径，如 'timelineOptions.placement'
        const pathParts = fieldPath.split('.');
        let currentValue = this.settings;
        
        for (const part of pathParts) {
            if (currentValue && typeof currentValue === 'object' && currentValue.hasOwnProperty(part)) {
                currentValue = currentValue[part];
            } else {
                // 字段不存在，返回undefined
                return undefined;
            }
        }
        
        return currentValue;
    } catch (error) {
        this.log(`获取字段 ${fieldPath} 失败: ${error.message}`, 'error');
        return undefined;
    }
}

/**
 * 更新设置字段
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 新值
 * @param {boolean} save - 是否保存到存储
 * @param {boolean} validate - 是否验证字段
 * @returns {Object} 更新结果
 */
updateField(fieldPath, value, save = true, validate = true) {
    try {
        // 验证字段值
        if (validate) {
            const validationResult = this.validateField(fieldPath, value);
            if (!validationResult.valid) {
                return {
                    success: false,
                    error: validationResult.error
                };
            }
        }
        
        // 获取当前字段值
        const oldValue = this.getField(fieldPath);
        
        // 更新字段值
        const pathParts = fieldPath.split('.');
        let currentObj = this.settings;
        
        // 遍历到倒数第二个路径部分
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!currentObj[part] || typeof currentObj[part] !== 'object') {
                currentObj[part] = {};
            }
            currentObj = currentObj[part];
        }
        
        // 更新最后一个字段
        const lastPart = pathParts[pathParts.length - 1];
        currentObj[lastPart] = value;
        
        this.log(`⚙️ 字段 ${fieldPath} 已更新: ${oldValue} -> ${value}`, 'debug');
        
        // 触发字段变更事件
        this.emitFieldChange(fieldPath, value, oldValue);
        
        // 保存设置
        if (save) {
            const saveResult = this.saveSettings(this.settings, true);
            if (!saveResult.success) {
                return saveResult;
            }
        }
        
        return {
            success: true,
            oldValue: oldValue,
            newValue: value
        };
        
    } catch (error) {
        this.log(`更新字段 ${fieldPath} 失败: ${error.message}`, 'error');
        
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 批量更新多个字段
 * @param {Object} updates - 更新对象，键为字段路径，值为新值
 * @param {boolean} save - 是否保存到存储
 * @returns {Object} 更新结果
 */
updateFields(updates, save = true) {
    try {
        const results = {};
        let hasErrors = false;
        
        // 收集所有变更
        const changes = [];
        
        for (const [fieldPath, value] of Object.entries(updates)) {
            const result = this.updateField(fieldPath, value, false, true);
            results[fieldPath] = result;
            
            if (result.success) {
                changes.push({ fieldPath, oldValue: result.oldValue, newValue: value });
            } else {
                hasErrors = true;
            }
        }
        
        // 如果有错误，回滚成功的变更
        if (hasErrors) {
            // 回滚已成功的变更
            for (const change of changes) {
                this.updateField(change.fieldPath, change.oldValue, false, false);
            }
            
            return {
                success: false,
                results: results,
                error: '部分字段更新失败，已回滚成功变更'
            };
        }
        
        // 保存所有变更
        if (save) {
            const saveResult = this.saveSettings(this.settings, true);
            if (!saveResult.success) {
                return {
                    success: false,
                    results: results,
                    error: saveResult.error
                };
            }
        }
        
        // 触发批量更新完成事件
        this.emit('batchUpdate', updates);
        
        return {
            success: true,
            results: results
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

### 字段监听实现

```javascript
/**
 * 添加字段监听器
 * @param {string} fieldPath - 字段路径
 * @param {Function} listener - 监听器函数
 * @param {boolean} once - 是否只监听一次
 * @returns {Function} 移除监听器的函数
 */
addFieldListener(fieldPath, listener, once = false) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }
        
        // 创建监听器包装器
        const wrappedListener = (newValue, oldValue, fieldPath) => {
            try {
                listener(newValue, oldValue, fieldPath);
                
                // 如果是一次性监听器，执行后自动移除
                if (once) {
                    this.removeFieldListener(fieldPath, wrappedListener);
                }
            } catch (error) {
                this.log(`字段监听器执行失败: ${error.message}`, 'error');
            }
        };
        
        // 存储监听器
        if (!this.fieldListeners.has(fieldPath)) {
            this.fieldListeners.set(fieldPath, []);
        }
        
        this.fieldListeners.get(fieldPath).push(wrappedListener);
        
        this.log(`👂 已添加字段 ${fieldPath} 的监听器`, 'debug');
        
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
        if (this.fieldListeners.has(fieldPath)) {
            const listeners = this.fieldListeners.get(fieldPath);
            const index = listeners.indexOf(listener);
            
            if (index !== -1) {
                listeners.splice(index, 1);
                this.log(`👂 已移除字段 ${fieldPath} 的监听器`, 'debug');
            }
        }
    } catch (error) {
        this.log(`移除字段监听器失败: ${error.message}`, 'error');
    }
}

/**
 * 触发字段变更事件
 * @param {string} fieldPath - 字段路径
 * @param {*} newValue - 新值
 * @param {*} oldValue - 旧值
 */
emitFieldChange(fieldPath, newValue, oldValue) {
    try {
        // 触发字段特定的监听器
        if (this.fieldListeners.has(fieldPath)) {
            const listeners = this.fieldListeners.get(fieldPath);
            // 创建监听器副本以避免在执行过程中修改数组
            const listenersCopy = [...listeners];
            
            for (const listener of listenersCopy) {
                try {
                    listener(newValue, oldValue, fieldPath);
                } catch (error) {
                    this.log(`字段监听器执行异常: ${error.message}`, 'error');
                }
            }
        }
        
        // 触发通用变更事件
        this.emit('fieldChange', {
            field: fieldPath,
            newValue: newValue,
            oldValue: oldValue
        });
        
    } catch (error) {
        this.log(`触发字段变更事件失败: ${error.message}`, 'error');
    }
}
```

### 设置验证实现

```javascript
/**
 * 验证设置
 * @param {Object} settings - 要验证的设置
 * @returns {Object} 验证结果
 */
validateSettings(settings) {
    try {
        if (!settings || typeof settings !== 'object') {
            return {
                valid: false,
                error: '设置必须是对象'
            };
        }
        
        // 验证必需字段
        const requiredFields = ['mode', 'addToComposition'];
        for (const field of requiredFields) {
            if (!settings.hasOwnProperty(field)) {
                return {
                    valid: false,
                    error: `缺少必需字段: ${field}`
                };
            }
        }
        
        // 验证导入模式
        const validModes = ['direct', 'project_adjacent', 'custom_folder'];
        if (!validModes.includes(settings.mode)) {
            return {
                valid: false,
                error: `无效的导入模式: ${settings.mode}`
            };
        }
        
        // 验证时间轴选项
        if (settings.timelineOptions) {
            const validPlacements = ['current_time', 'timeline_start'];
            if (settings.timelineOptions.placement && 
                !validPlacements.includes(settings.timelineOptions.placement)) {
                return {
                    valid: false,
                    error: `无效的时间轴放置位置: ${settings.timelineOptions.placement}`
                };
            }
        }
        
        // 验证自定义字段
        for (const [fieldPath, validator] of this.validators.entries()) {
            const fieldValue = this.getFieldFromObject(settings, fieldPath);
            if (fieldValue !== undefined) {
                const validationResult = validator(fieldValue);
                if (!validationResult.valid) {
                    return {
                        valid: false,
                        error: `字段 ${fieldPath} 验证失败: ${validationResult.error}`
                    };
                }
            }
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `设置验证异常: ${error.message}`
        };
    }
}

/**
 * 验证特定字段
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 字段值
 * @returns {Object} 验证结果
 */
validateField(fieldPath, value) {
    try {
        // 检查是否有自定义验证器
        if (this.validators.has(fieldPath)) {
            const validator = this.validators.get(fieldPath);
            return validator(value);
        }
        
        // 使用内置验证规则
        switch (fieldPath) {
            case 'mode':
                const validModes = ['direct', 'project_adjacent', 'custom_folder'];
                if (!validModes.includes(value)) {
                    return {
                        valid: false,
                        error: `导入模式必须是以下值之一: ${validModes.join(', ')}`
                    };
                }
                break;
                
            case 'timelineOptions.placement':
                const validPlacements = ['current_time', 'timeline_start'];
                if (!validPlacements.includes(value)) {
                    return {
                        valid: false,
                        error: `时间轴放置位置必须是以下值之一: ${validPlacements.join(', ')}`
                    };
                }
                break;
                
            case 'communicationPort':
                if (typeof value !== 'number' || value < 1024 || value > 65535) {
                    return {
                        valid: false,
                        error: '通信端口必须是1024-65535之间的数字'
                    };
                }
                break;
                
            case 'customFolderPath':
                if (value && typeof value === 'string') {
                    // 检查路径格式
                    if (value.includes('<') || value.includes('>') || value.includes('|') || 
                        value.includes('?') || value.includes('*')) {
                        return {
                            valid: false,
                            error: '文件夹路径包含无效字符'
                        };
                    }
                }
                break;
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `字段验证异常: ${error.message}`
        };
    }
}
```

### 设置迁移实现

```javascript
/**
 * 应用设置迁移
 * @param {Object} settings - 要迁移的设置
 * @returns {Object} 迁移后的设置
 */
applyMigrations(settings) {
    try {
        if (!settings || typeof settings !== 'object') {
            return settings;
        }
        
        // 获取设置版本
        const currentVersion = settings.version || 0;
        const targetVersion = this.CURRENT_SETTINGS_VERSION;
        
        // 如果已经是最新版本，直接返回
        if (currentVersion >= targetVersion) {
            return settings;
        }
        
        this.log(`🔄 开始设置迁移: 版本 ${currentVersion} -> ${targetVersion}`, 'info');
        
        // 按顺序应用迁移规则
        let migratedSettings = { ...settings };
        
        for (let version = currentVersion + 1; version <= targetVersion; version++) {
            if (this.migrations.has(version)) {
                const migration = this.migrations.get(version);
                try {
                    migratedSettings = migration(migratedSettings);
                    this.log(`✅ 已应用版本 ${version} 的迁移规则`, 'debug');
                } catch (error) {
                    this.log(`❌ 版本 ${version} 迁移失败: ${error.message}`, 'error');
                    // 继续应用后续版本的迁移规则
                }
            }
        }
        
        // 更新版本号
        migratedSettings.version = targetVersion;
        
        this.log(`✅ 设置迁移完成: 版本 ${currentVersion} -> ${targetVersion}`, 'info');
        
        return migratedSettings;
        
    } catch (error) {
        this.log(`❌ 设置迁移异常: ${error.message}`, 'error');
        return settings; // 返回原始设置以避免丢失数据
    }
}

/**
 * 添加迁移规则
 * @param {number} version - 目标版本号
 * @param {Function} migration - 迁移函数
 */
addMigration(version, migration) {
    if (typeof version !== 'number' || version <= 0) {
        throw new Error('版本号必须是正整数');
    }
    
    if (typeof migration !== 'function') {
        throw new Error('迁移规则必须是函数');
    }
    
    this.migrations.set(version, migration);
    this.log(`➕ 已添加版本 ${version} 的迁移规则`, 'debug');
}
```

## 事件系统

### 事件监听与触发

```javascript
/**
 * 添加事件监听器
 * @param {string} eventType - 事件类型
 * @param {Function} listener - 监听器函数
 */
addListener(eventType, listener) {
    if (typeof listener !== 'function') {
        throw new Error('监听器必须是函数');
    }
    
    if (!this.changeListeners[eventType]) {
        this.changeListeners[eventType] = [];
    }
    
    this.changeListeners[eventType].push(listener);
    this.log(`👂 已添加 ${eventType} 事件监听器`, 'debug');
}

/**
 * 移除事件监听器
 * @param {string} eventType - 事件类型
 * @param {Function} listener - 监听器函数
 */
removeListener(eventType, listener) {
    if (this.changeListeners[eventType]) {
        const index = this.changeListeners[eventType].indexOf(listener);
        if (index !== -1) {
            this.changeListeners[eventType].splice(index, 1);
            this.log(`👂 已移除 ${eventType} 事件监听器`, 'debug');
        }
    }
}

/**
 * 触发事件
 * @param {string} eventType - 事件类型
 * @param {*} data - 事件数据
 */
emit(eventType, data) {
    if (this.changeListeners[eventType]) {
        // 创建监听器副本以避免在执行过程中修改数组
        const listeners = [...this.changeListeners[eventType]];
        
        for (const listener of listeners) {
            try {
                listener(eventType, data);
            } catch (error) {
                this.log(`事件监听器执行异常: ${error.message}`, 'error');
            }
        }
    }
}
```

## 最佳实践

### 使用建议

1. **合理使用字段监听**
   ```javascript
   // 对于频繁变更的字段，使用防抖处理
   const debouncedListener = debounce((newValue) => {
       updateUI(newValue);
   }, 300);
   
   settingsManager.addFieldListener('mode', debouncedListener);
   ```

2. **批量操作优化**
   ```javascript
   // 批量更新多个相关字段
   settingsManager.updateFields({
       'mode': 'custom_folder',
       'customFolderPath': '/path/to/folder',
       'addToComposition': true
   });
   ```

3. **错误处理**
   ```javascript
   // 始终检查操作结果
   const result = settingsManager.updateField('mode', 'invalid_mode');
   if (!result.success) {
       console.error(`设置更新失败: ${result.error}`);
       // 处理错误情况
   }
   ```

### 性能优化

1. **防抖保存**
   ```javascript
   // 使用防抖避免频繁保存
   const debouncedSave = debounce(() => {
       settingsManager.saveSettings(settingsManager.getSettings());
   }, 1000);
   
   settingsManager.addListener('fieldChange', debouncedSave);
   ```

2. **缓存常用字段**
   ```javascript
   // 缓存频繁访问的字段值
   class CachedSettingsManager extends SettingsManager {
       constructor(panelId) {
           super(panelId);
           this.cachedValues = new Map();
       }
       
       getField(fieldPath) {
           if (this.cachedValues.has(fieldPath)) {
               return this.cachedValues.get(fieldPath);
           }
           
           const value = super.getField(fieldPath);
           this.cachedValues.set(fieldPath, value);
           return value;
       }
       
       updateField(fieldPath, value, save = true, validate = true) {
           // 清除缓存
           this.cachedValues.delete(fieldPath);
           
           const result = super.updateField(fieldPath, value, save, validate);
           
           // 更新缓存
           if (result.success) {
               this.cachedValues.set(fieldPath, value);
           }
           
           return result;
       }
   }
   ```

### 安全性考虑

1. **输入验证**
   ```javascript
   // 始终验证用户输入
   settingsManager.addValidator('customFolderPath', (value) => {
       if (!value || typeof value !== 'string') {
           return { valid: false, error: '文件夹路径必须是字符串' };
       }
       
       // 检查路径安全性
       if (value.includes('..')) {
           return { valid: false, error: '文件夹路径不能包含上级目录引用' };
       }
       
       return { valid: true };
   });
   ```

2. **敏感信息处理**
   ```javascript
   // 避免在日志中记录敏感信息
   settingsManager.addFieldListener('communicationPort', (newValue) => {
       console.log(`通信端口已更新为: ${'*'.repeat(newValue.toString().length)}`);
   });
   ```

## 故障排除

### 常见问题

1. **设置未保存**
   - 症状：重启后设置丢失
   - 解决：检查localStorage权限，验证保存路径

2. **字段监听器未触发**
   - 症状：字段变更但监听器未执行
   - 解决：检查字段路径是否正确，验证监听器是否正确添加

3. **设置迁移失败**
   - 症状：旧版本设置无法正确加载
   - 解决：检查迁移规则，验证设置版本号

### 调试技巧

1. **启用详细日志**
   ```javascript
   // 在控制台中启用设置管理日志
   localStorage.setItem('debugLogLevel', '0');
   ```

2. **监控设置变更**
   ```javascript
   // 监听所有设置变更
   settingsManager.addListener('fieldChange', (eventType, data) => {
       console.log('设置变更:', data);
   });
   ```

3. **检查设置状态**
   ```javascript
   // 检查当前设置状态
   function inspectSettings() {
       console.log('当前设置:', settingsManager.getSettings());
       console.log('用户偏好:', settingsManager.getPreferences());
       console.log('字段监听器数量:', settingsManager.fieldListeners.size);
   }
   ```

## 扩展性

### 自定义验证器

```javascript
// 添加自定义验证器
settingsManager.addValidator('projectAdjacentFolder', (value) => {
    if (!value || typeof value !== 'string') {
        return { valid: false, error: '项目旁文件夹名称必须是字符串' };
    }
    
    // 检查文件夹名称有效性
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(value)) {
        return { valid: false, error: '文件夹名称包含无效字符' };
    }
    
    if (value.length > 255) {
        return { valid: false, error: '文件夹名称过长' };
    }
    
    return { valid: true };
});
```

### 插件化架构

```javascript
// 创建设置插件
class SettingsPlugin {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.init();
    }
    
    init() {
        // 添加插件特定的验证规则
        this.settingsManager.addValidator('plugin.customOption', (value) => {
            // 自定义验证逻辑
            return { valid: true };
        });
        
        // 添加插件特定的迁移规则
        this.settingsManager.addMigration(2, (settings) => {
            // 迁移逻辑
            return settings;
        });
    }
    
    // 插件特定的方法
    getPluginSettings() {
        return {
            customOption: this.settingsManager.getField('plugin.customOption'),
            pluginEnabled: this.settingsManager.getField('plugin.enabled')
        };
    }
}

// 注册插件
const plugin = new SettingsPlugin(settingsManager);
```