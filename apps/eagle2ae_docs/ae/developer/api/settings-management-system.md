# 设置管理系统

## 概述

设置管理系统（Settings Management System）是 Eagle2Ae AE 扩展 v2.4.0 的核心组件之一，负责管理扩展的所有配置设置、用户偏好和UI状态。该系统提供了面板特定的设置管理、字段监听、自动保存、类型验证等高级功能，确保每个面板实例都能拥有独立且一致的配置体验。

## 核心特性

### 面板特定设置管理
- 每个面板实例拥有独立的设置存储空间
- 支持面板间设置隔离和共享
- 提供面板ID识别和配置关联

### 字段监听机制
- 支持对特定设置字段的变更监听
- 提供细粒度的变更通知
- 支持一次性监听和持续监听

### 自动保存功能
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
                        error: '通信端口必须在1024-65535范围内'
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

## API参考

### 核心方法

#### SettingsManager
设置管理器主类

```javascript
/**
 * 设置管理器
 * 负责管理AE扩展的所有设置，支持面板特定配置和实时同步
 */
class SettingsManager
```

#### 构造函数
```javascript
/**
 * 构造函数
 * @param {string} panelId - 面板ID，用于面板特定设置隔离
 */
constructor(panelId)
```

#### getSettings()
获取当前设置

```javascript
/**
 * 获取当前设置
 * @returns {Object} 当前设置对象
 */
getSettings()
```

#### getPreferences()
获取当前用户偏好

```javascript
/**
 * 获取当前用户偏好
 * @returns {Object} 当前用户偏好对象
 */
getPreferences()
```

#### getField()
获取设置字段值

```javascript
/**
 * 获取设置字段值
 * @param {string} fieldPath - 字段路径，支持点号分隔的嵌套字段
 * @returns {*} 字段值
 */
getField(fieldPath)
```

#### updateField()
更新设置字段

```javascript
/**
 * 更新设置字段
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 新值
 * @param {boolean} save - 是否保存到存储
 * @param {boolean} validate - 是否验证字段
 * @returns {Object} 更新结果
 */
updateField(fieldPath, value, save = true, validate = true)
```

#### updateFields()
批量更新多个字段

```javascript
/**
 * 批量更新多个字段
 * @param {Object} updates - 更新对象，键为字段路径，值为新值
 * @param {boolean} save - 是否保存到存储
 * @returns {Object} 更新结果
 */
updateFields(updates, save = true)
```

#### saveSettings()
保存设置到本地存储

```javascript
/**
 * 保存设置到本地存储
 * @param {Object} settings - 要保存的设置
 * @param {boolean} silent - 是否静默保存（不触发事件）
 * @returns {Object} 保存结果
 */
saveSettings(settings, silent = false)
```

#### loadSettings()
从本地存储加载设置

```javascript
/**
 * 从本地存储加载设置
 * @returns {Object|null} 设置对象或null
 */
loadSettings()
```

#### savePreferences()
保存用户偏好到本地存储

```javascript
/**
 * 保存用户偏好到本地存储
 * @param {Object} preferences - 要保存的用户偏好
 * @param {boolean} silent - 是否静默保存（不触发事件）
 * @returns {Object} 保存结果
 */
savePreferences(preferences, silent = false)
```

#### loadPreferences()
从本地存储加载用户偏好

```javascript
/**
 * 从本地存储加载用户偏好
 * @returns {Object|null} 用户偏好对象或null
 */
loadPreferences()
```

### 监听器方法

#### addFieldListener()
添加字段监听器

```javascript
/**
 * 添加字段监听器
 * @param {string} fieldPath - 字段路径
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

### 验证方法

#### validateSettings()
验证设置

```javascript
/**
 * 验证设置
 * @param {Object} settings - 要验证的设置
 * @returns {Object} 验证结果
 */
validateSettings(settings)
```

#### validateField()
验证特定字段

```javascript
/**
 * 验证特定字段
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 字段值
 * @returns {Object} 验证结果
 */
validateField(fieldPath, value)
```

#### addValidator()
添加自定义验证器

```javascript
/**
 * 添加自定义验证器
 * @param {string} fieldPath - 字段路径
 * @param {Function} validator - 验证函数
 */
addValidator(fieldPath, validator)
```

#### removeValidator()
移除自定义验证器

```javascript
/**
 * 移除自定义验证器
 * @param {string} fieldPath - 字段路径
 */
removeValidator(fieldPath)
```

### 迁移方法

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

#### addMigration()
添加迁移规则

```javascript
/**
 * 添加迁移规则
 * @param {number} version - 目标版本号
 * @param {Function} migration - 迁移函数
 */
addMigration(version, migration)
```

### 辅助方法

#### getPanelStorageKey()
获取面板特定的localStorage键

```javascript
/**
 * 获取面板特定的localStorage键
 * @param {string} key - 原始键名
 * @returns {string} 带面板前缀的键名
 */
getPanelStorageKey(key)
```

#### getPanelLocalStorage()
获取面板特定的localStorage值

```javascript
/**
 * 获取面板特定的localStorage值
 * @param {string} key - 键名
 * @returns {string|null} 值
 */
getPanelLocalStorage(key)
```

#### setPanelLocalStorage()
设置面板特定的localStorage值

```javascript
/**
 * 设置面板特定的localStorage值
 * @param {string} key - 键名
 * @param {string} value - 值
 */
setPanelLocalStorage(key, value)
```

#### getDefaultSettings()
获取默认设置

```javascript
/**
 * 获取默认设置
 * @returns {Object} 默认设置对象
 */
getDefaultSettings()
```

#### getDefaultPreferences()
获取默认用户偏好

```javascript
/**
 * 获取默认用户偏好
 * @returns {Object} 默认用户偏好对象
 */
getDefaultPreferences()
```

#### initializeSettings()
初始化设置

```javascript
/**
 * 初始化设置
 * 从本地存储加载设置，如果不存在则使用默认设置
 */
initializeSettings()
```

#### emit()
触发事件

```javascript
/**
 * 触发事件
 * @param {string} eventType - 事件类型
 * @param {*} data - 事件数据
 */
emit(eventType, data)
```

#### emitFieldChange()
触发字段变更事件

```javascript
/**
 * 触发字段变更事件
 * @param {string} fieldPath - 字段路径
 * @param {*} newValue - 新值
 * @param {*} oldValue - 旧值
 */
emitFieldChange(fieldPath, newValue, oldValue)
```

#### getFieldFromObject()
从对象中获取字段值

```javascript
/**
 * 从对象中获取字段值
 * @param {Object} obj - 对象
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
 * @param {Object} obj - 对象
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 值
 * @returns {boolean} 是否设置成功
 */
setFieldToObject(obj, fieldPath, value)
```

#### mergeSettings()
合并设置对象

```javascript
/**
 * 合并设置对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
mergeSettings(target, source)
```

#### deepClone()
深拷贝对象

```javascript
/**
 * 深拷贝对象
 * @param {Object} obj - 要拷贝的对象
 * @returns {Object} 拷贝后的对象
 */
deepClone(obj)
```

#### isEqual()
比较两个对象是否相等

```javascript
/**
 * 比较两个对象是否相等
 * @param {Object} obj1 - 对象1
 * @param {Object} obj2 - 对象2
 * @returns {boolean} 是否相等
 */
isEqual(obj1, obj2)
```

## 使用示例

### 基本使用

```javascript
// 创建设置管理器实例
const settingsManager = new SettingsManager('panel1');

// 获取当前设置
const currentSettings = settingsManager.getSettings();
console.log('当前设置:', currentSettings);

// 获取特定字段值
const importMode = settingsManager.getField('mode');
console.log('导入模式:', importMode);

// 更新单个字段
const updateResult = settingsManager.updateField('mode', 'direct');
if (updateResult.success) {
    console.log('字段更新成功');
} else {
    console.error('字段更新失败:', updateResult.error);
}

// 批量更新多个字段
const batchResult = settingsManager.updateFields({
    'mode': 'project_adjacent',
    'projectAdjacentFolder': 'MyAssets',
    'addToComposition': true
});
if (batchResult.success) {
    console.log('批量更新成功');
} else {
    console.error('批量更新失败:', batchResult.error);
}

// 保存设置
const saveResult = settingsManager.saveSettings(currentSettings);
if (saveResult.success) {
    console.log('设置保存成功');
} else {
    console.error('设置保存失败:', saveResult.error);
}
```

### 高级使用

```javascript
// 添加字段监听器
const removeListener = settingsManager.addFieldListener('mode', (newValue, oldValue, fieldPath) => {
    console.log(`字段 ${fieldPath} 已从 ${oldValue} 变更为 ${newValue}`);
    
    // 根据新模式更新UI
    updateImportModeUI(newValue);
});

// 使用完成后移除监听器
// removeListener();

// 添加一次性监听器
settingsManager.addFieldListener('mode', (newValue, oldValue, fieldPath) => {
    console.log(`字段 ${fieldPath} 一次性变更: ${oldValue} -> ${newValue}`);
}, true); // 第三个参数设为true表示一次性监听

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

// 验证字段
const validation = settingsManager.validateField('projectAdjacentFolder', 'My Assets');
if (!validation.valid) {
    console.error(`验证失败: ${validation.error}`);
}

// 添加迁移规则
settingsManager.addMigration(2, (oldSettings) => {
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

### 事件监听

```javascript
// 监听设置保存事件
settingsManager.addListener((eventType, data) => {
    if (eventType === 'saved') {
        console.log('设置已保存:', data);
    } else if (eventType === 'autoSave') {
        console.log('设置已自动保存:', data);
    } else if (eventType === 'fieldChange') {
        console.log('字段变更:', data);
    } else if (eventType === 'batchUpdate') {
        console.log('批量更新:', data);
    }
});

// 监听初始化完成事件
settingsManager.addListener((eventType, data) => {
    if (eventType === 'initialized') {
        console.log('设置管理器初始化完成:', data);
        
        // 初始化UI
        initializeSettingsUI(data.settings, data.preferences);
    }
});
```

## 最佳实践

### 设置管理建议

#### 字段命名规范
```javascript
// 使用驼峰命名法
const validFieldNames = [
    'mode',                    // 导入模式
    'projectAdjacentFolder',   // 项目旁文件夹
    'customFolderPath',        // 自定义文件夹路径
    'addToComposition',        // 添加到合成
    'timelineOptions',         // 时间轴选项
    'fileManagement',          // 文件管理
    'exportSettings',          // 导出设置
    'advancedOptions',         // 高级选项
    'uiSettings'              // UI设置
];

// 使用点号分隔嵌套字段
const nestedFields = [
    'timelineOptions.placement',      // 时间轴放置位置
    'timelineOptions.sequenceInterval', // 序列帧间隔
    'fileManagement.keepOriginalName', // 保持原始名称
    'fileManagement.addTimestamp',    // 添加时间戳
    'exportSettings.mode',           // 导出模式
    'exportSettings.autoCopy'        // 自动复制
];
```

#### 设置验证最佳实践
```javascript
// 为每个字段添加验证器
const validators = {
    mode: (value) => {
        const validModes = ['direct', 'project_adjacent', 'custom_folder'];
        if (!validModes.includes(value)) {
            return {
                valid: false,
                error: `导入模式必须是以下值之一: ${validModes.join(', ')}`
            };
        }
        return { valid: true };
    },
    
    projectAdjacentFolder: (value) => {
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
    },
    
    customFolderPath: (value) => {
        if (value && typeof value === 'string') {
            // 检查路径格式
            if (value.includes('<') || value.includes('>') || value.includes('|') || 
                value.includes('?') || value.includes('*')) {
                return { valid: false, error: '文件夹路径包含无效字符' };
            }
        }
        return { valid: true };
    },
    
    communicationPort: (value) => {
        if (typeof value !== 'number' || value < 1024 || value > 65535) {
            return { valid: false, error: '通信端口必须在1024-65535范围内' };
        }
        return { valid: true };
    }
};

// 注册验证器
Object.entries(validators).forEach(([fieldPath, validator]) => {
    settingsManager.addValidator(fieldPath, validator);
});
```

#### 设置保存最佳实践
```javascript
// 使用防抖避免频繁保存
let saveTimeout = null;

function debouncedSaveSettings(settings) {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    
    saveTimeout = setTimeout(() => {
        settingsManager.saveSettings(settings);
    }, 500); // 500ms 防抖延迟
}

// 在字段变更时使用防抖保存
settingsManager.addFieldListener('mode', (newValue, oldValue) => {
    debouncedSaveSettings(settingsManager.getSettings());
});

// 手动保存设置时提供用户反馈
async function saveSettingsWithFeedback(settings) {
    try {
        const result = await settingsManager.saveSettings(settings);
        
        if (result.success) {
            showNotification('✅ 设置已保存', 'success');
        } else {
            showNotification(`❌ 保存设置失败: ${result.error}`, 'error');
        }
        
        return result;
    } catch (error) {
        showNotification(`❌ 保存设置异常: ${error.message}`, 'error');
        throw error;
    }
}
```

### 性能优化

#### 缓存机制
```javascript
// 实现设置缓存
class CachedSettingsManager extends SettingsManager {
    constructor(panelId) {
        super(panelId);
        this.settingsCache = new Map();
        this.cacheTimeouts = new Map();
    }
    
    /**
     * 获取缓存的设置字段值
     * @param {string} fieldPath - 字段路径
     * @param {number} timeout - 缓存超时时间（毫秒）
     * @returns {*} 字段值
     */
    getCachedField(fieldPath, timeout = 5000) {
        const cacheKey = fieldPath;
        const cached = this.settingsCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < timeout) {
            return cached.value;
        }
        
        // 缓存过期或不存在，重新获取并缓存
        const value = this.getField(fieldPath);
        this.settingsCache.set(cacheKey, {
            value: value,
            timestamp: Date.now()
        });
        
        // 设置缓存清理定时器
        if (this.cacheTimeouts.has(cacheKey)) {
            clearTimeout(this.cacheTimeouts.get(cacheKey));
        }
        
        const timeoutId = setTimeout(() => {
            this.settingsCache.delete(cacheKey);
        }, timeout);
        
        this.cacheTimeouts.set(cacheKey, timeoutId);
        
        return value;
    }
    
    /**
     * 清除字段缓存
     * @param {string} fieldPath - 字段路径
     */
    clearFieldCache(fieldPath) {
        const cacheKey = fieldPath;
        this.settingsCache.delete(cacheKey);
        
        if (this.cacheTimeouts.has(cacheKey)) {
            clearTimeout(this.cacheTimeouts.get(cacheKey));
            this.cacheTimeouts.delete(cacheKey);
        }
    }
    
    /**
     * 清除所有缓存
     */
    clearAllCache() {
        this.settingsCache.clear();
        
        this.cacheTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.cacheTimeouts.clear();
    }
}
```

#### 批量操作优化
```javascript
// 批量更新设置以提高性能
async function batchUpdateSettings(updates) {
    try {
        // 首先验证所有更新
        const validationResults = {};
        let hasValidationErrors = false;
        
        for (const [fieldPath, value] of Object.entries(updates)) {
            const validationResult = settingsManager.validateField(fieldPath, value);
            validationResults[fieldPath] = validationResult;
            
            if (!validationResult.valid) {
                hasValidationErrors = true;
            }
        }
        
        if (hasValidationErrors) {
            // 如果有任何验证错误，返回详细的错误信息
            return {
                success: false,
                error: '设置验证失败',
                validationResults: validationResults
            };
        }
        
        // 执行批量更新
        const updateResult = await settingsManager.updateFields(updates, true);
        
        if (updateResult.success) {
            // 批量保存设置
            const saveResult = await settingsManager.saveSettings(
                settingsManager.getSettings(), 
                true // 静默保存，不触发额外事件
            );
            
            if (saveResult.success) {
                return {
                    success: true,
                    message: `已成功更新 ${Object.keys(updates).length} 个设置字段`
                };
            } else {
                return {
                    success: false,
                    error: saveResult.error
                };
            }
        } else {
            return updateResult;
        }
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 使用示例
const batchUpdates = {
    'mode': 'project_adjacent',
    'projectAdjacentFolder': 'Updated_Assets',
    'addToComposition': true,
    'timelineOptions.placement': 'current_time'
};

const result = await batchUpdateSettings(batchUpdates);
if (result.success) {
    console.log(result.message);
} else {
    console.error('批量更新失败:', result.error);
}
```

### 内存管理

#### 及时清理事件监听器
```javascript
// 确保在组件销毁时清理事件监听器
class SettingsManagerWithCleanup extends SettingsManager {
    constructor(panelId) {
        super(panelId);
        this.eventListeners = new Set();
    }
    
    /**
     * 添加字段监听器（带自动清理）
     * @param {string} fieldPath - 字段路径
     * @param {Function} listener - 监听器函数
     * @param {boolean} once - 是否只监听一次
     * @returns {Function} 移除监听器的函数
     */
    addFieldListener(fieldPath, listener, once = false) {
        const removeFn = super.addFieldListener(fieldPath, listener, once);
        
        // 保存监听器引用以便清理
        const listenerRef = { fieldPath, listener, removeFn };
        this.eventListeners.add(listenerRef);
        
        return removeFn;
    }
    
    /**
     * 清理所有事件监听器
     */
    cleanup() {
        // 移除所有字段监听器
        this.eventListeners.forEach(listenerRef => {
            try {
                listenerRef.removeFn();
            } catch (error) {
                console.warn('清理字段监听器失败:', error);
            }
        });
        
        this.eventListeners.clear();
        
        // 清理通用监听器
        this.changeListeners = [];
        
        // 清理字段特定监听器
        this.fieldListeners.clear();
        
        this.log('⚙️ 设置管理器事件监听器已清理', 'debug');
    }
}
```

#### 避免内存泄漏
```javascript
// 在适当的时候清理设置管理器
window.addEventListener('beforeunload', () => {
    if (window.settingsManager && typeof window.settingsManager.cleanup === 'function') {
        window.settingsManager.cleanup();
    }
});

// 在React组件中使用useEffect清理
useEffect(() => {
    const settingsManager = new SettingsManager('panel1');
    window.settingsManager = settingsManager;
    
    // 组件卸载时清理
    return () => {
        if (settingsManager && typeof settingsManager.cleanup === 'function') {
            settingsManager.cleanup();
        }
    };
}, []);

// 在Vue组件中使用beforeDestroy清理
export default {
    beforeDestroy() {
        if (this.settingsManager && typeof this.settingsManager.cleanup === 'function') {
            this.settingsManager.cleanup();
        }
    }
};
```

## 故障排除

### 常见问题

#### 设置未保存
- **症状**：修改设置后刷新页面发现设置未保存
- **解决**：
  1. 检查localStorage权限
  2. 验证设置验证是否通过
  3. 查看控制台错误日志

#### 字段监听器未触发
- **症状**：字段变更但监听器未执行
- **解决**：
  1. 检查字段路径是否正确
  2. 验证监听器是否正确添加
  3. 确认字段更新时是否触发了保存

#### 设置迁移失败
- **症状**：旧版本设置无法正确加载
- **解决**：
  1. 检查迁移规则是否正确实现
  2. 验证设置版本号是否正确
  3. 查看迁移过程中的错误日志

#### 面板特定设置冲突
- **症状**：多个面板间设置相互影响
- **解决**：
  1. 检查面板ID识别是否正确
  2. 验证localStorage键是否正确生成
  3. 确认配置加载逻辑是否正确

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控设置变更
settingsManager.addListener((eventType, data) => {
    console.log(`⚙️ 设置事件: ${eventType}`, data);
});

// 监控字段变更
settingsManager.addFieldListener('mode', (newValue, oldValue, fieldPath) => {
    console.log(`⚙️ 字段变更: ${fieldPath} ${oldValue} -> ${newValue}`);
});
```

#### 检查设置状态
```javascript
// 检查当前设置状态
function inspectSettings() {
    console.log('当前设置:', settingsManager.getSettings());
    console.log('用户偏好:', settingsManager.getPreferences());
    console.log('字段监听器数量:', settingsManager.fieldListeners.size);
    console.log('通用监听器数量:', settingsManager.changeListeners.length);
}

// 定期监控设置状态
setInterval(inspectSettings, 30000); // 每30秒监控一次
```

#### 性能分析
```javascript
// 记录设置操作性能
const startTime = performance.now();
const result = settingsManager.updateField('mode', 'direct');
const endTime = performance.now();

console.log(`⚙️ 设置更新耗时: ${endTime - startTime}ms`);

// 分析设置保存性能
async function analyzeSavePerformance() {
    const startTime = performance.now();
    const settings = settingsManager.getSettings();
    const saveResult = await settingsManager.saveSettings(settings);
    const endTime = performance.now();
    
    console.log(`⚙️ 设置保存耗时: ${endTime - startTime}ms`);
    console.log('保存结果:', saveResult);
}
```

## 扩展性

### 自定义验证器

```javascript
// 添加自定义验证器
settingsManager.addValidator('customFolderPath', (value) => {
    if (!value || typeof value !== 'string') {
        return { valid: false, error: '自定义文件夹路径必须是字符串' };
    }
    
    // 检查文件夹路径有效性
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(value)) {
        return { valid: false, error: '文件夹路径包含无效字符' };
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
        this.settingsManager.addMigration(3, (settings) => {
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

### 事件系统扩展

```javascript
// 扩展事件系统
class ExtendedEventManager extends SettingsManager {
    constructor(panelId) {
        super(panelId);
        this.customEvents = new Map();
    }
    
    /**
     * 添加自定义事件监听器
     * @param {string} eventType - 事件类型
     * @param {Function} listener - 监听器函数
     * @param {Object} options - 选项
     */
    addCustomEventListener(eventType, listener, options = {}) {
        if (!this.customEvents.has(eventType)) {
            this.customEvents.set(eventType, new Set());
        }
        
        const eventListeners = this.customEvents.get(eventType);
        eventListeners.add({
            listener: listener,
            options: options,
            id: this.generateUniqueId()
        });
        
        this.log(`👂 已添加自定义事件监听器: ${eventType}`, 'debug');
    }
    
    /**
     * 触发自定义事件
     * @param {string} eventType - 事件类型
     * @param {*} data - 事件数据
     */
    emitCustomEvent(eventType, data) {
        if (this.customEvents.has(eventType)) {
            const eventListeners = this.customEvents.get(eventType);
            
            eventListeners.forEach(eventListener => {
                try {
                    eventListener.listener(data, eventType);
                } catch (error) {
                    this.log(`自定义事件监听器执行失败: ${error.message}`, 'error');
                }
            });
        }
        
        this.log(`🔊 已触发自定义事件: ${eventType}`, 'debug');
    }
    
    /**
     * 移除自定义事件监听器
     * @param {string} eventType - 事件类型
     * @param {Function} listener - 监听器函数
     */
    removeCustomEventListener(eventType, listener) {
        if (this.customEvents.has(eventType)) {
            const eventListeners = this.customEvents.get(eventType);
            
            for (const eventListener of eventListeners) {
                if (eventListener.listener === listener) {
                    eventListeners.delete(eventListener);
                    this.log(`👂 已移除自定义事件监听器: ${eventType}`, 'debug');
                    break;
                }
            }
        }
    }
    
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
}

// 使用扩展事件管理器
const extendedEventManager = new ExtendedEventManager('panel1');

// 添加自定义事件监听器
extendedEventManager.addCustomEventListener('settings.importModeChanged', (data) => {
    console.log('导入模式已变更:', data);
});

// 触发自定义事件
extendedEventManager.emitCustomEvent('settings.importModeChanged', {
    oldValue: 'direct',
    newValue: 'project_adjacent'
});
```