# 高级设置面板

## 概述

高级设置面板（Advanced Settings Panel）是 Eagle2Ae AE 扩展 v2.4.0 中功能最全面的设置界面，提供了所有可用配置选项的集中管理。该面板支持面板特定设置、字段监听、自动保存、类型验证等功能，确保每个面板实例都能拥有独立且一致的配置体验。

## 核心特性

### 面板特定配置
- 每个面板实例拥有独立的设置存储空间
- 支持面板间配置隔离和共享
- 提供面板ID识别机制，确保配置正确加载

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

## 界面布局

### 导入设置区域
- **导入模式选择**：直接导入、项目旁复制、指定文件夹
- **项目旁文件夹设置**：自定义项目旁文件夹名称
- **指定文件夹路径设置**：选择自定义导出文件夹
- **导入行为设置**：不导入合成、当前时间、时间轴开始
- **时间轴选项设置**：启用时间轴选项、放置位置、序列间隔

### 导出设置区域
- **导出模式选择**：桌面导出、项目旁导出、指定文件夹导出
- **导出选项设置**：自动复制、阅后即焚、时间戳前缀、合成名前缀
- **指定文件夹路径设置**：选择导出自定义文件夹

### 通信设置区域
- **通信端口设置**：自定义通信端口（1024-65535）
- **端口同步功能**：智能端口同步和多端口尝试

### UI 设置区域
- **主题切换**：暗色/亮色主题切换
- **语言切换**：中英文动态切换
- **组件显示控制**：控制各UI组件显示/隐藏
- **独显模式**：专注模式开关

### 预设管理区域
- **预设文件导出**：导出当前配置为预设文件
- **预设文件导入**：从文件导入配置
- **预设文件管理**：打开预设目录、选择预设目录
- **预设文件备份**：备份和恢复预设文件

## 使用指南

### 基本操作

#### 打开高级设置面板
1. 在扩展主界面右上角点击齿轮图标（⚙️）
2. 或使用快捷键 `Ctrl+,` (Windows) / `Cmd+,` (macOS)
3. 高级设置面板将从右侧滑入显示

#### 导入设置配置
```javascript
// 导入模式设置
const importMode = settingsManager.getField('mode');
switch (importMode) {
    case 'direct':
        // 直接导入模式
        console.log('使用直接导入模式');
        break;
    case 'project_adjacent':
        // 项目旁复制模式
        console.log('使用项目旁复制模式');
        break;
    case 'custom_folder':
        // 指定文件夹模式
        console.log('使用指定文件夹模式');
        break;
}

// 导入行为设置
const addToComposition = settingsManager.getField('addToComposition');
if (addToComposition) {
    const timelinePlacement = settingsManager.getField('timelineOptions.placement');
    console.log(`导入行为: 添加到合成 (${timelinePlacement})`);
} else {
    console.log('导入行为: 不导入合成');
}
```

#### 导出设置配置
```javascript
// 导出模式设置
const exportMode = settingsManager.getField('exportSettings.mode');
switch (exportMode) {
    case 'desktop':
        // 桌面导出模式
        console.log('使用桌面导出模式');
        break;
    case 'project_adjacent':
        // 项目旁导出模式
        console.log('使用项目旁导出模式');
        break;
    case 'custom_folder':
        // 指定文件夹导出模式
        console.log('使用指定文件夹导出模式');
        break;
}

// 导出选项设置
const exportOptions = {
    autoCopy: settingsManager.getField('exportSettings.autoCopy'),
    burnAfterReading: settingsManager.getField('exportSettings.burnAfterReading'),
    addTimestamp: settingsManager.getField('exportSettings.addTimestamp'),
    createSubfolders: settingsManager.getField('exportSettings.createSubfolders')
};

console.log('导出选项:', exportOptions);
```

#### 通信设置配置
```javascript
// 通信端口设置
const communicationPort = settingsManager.getField('communicationPort');
console.log(`通信端口: ${communicationPort}`);

// 端口同步
const portSyncResult = await settingsManager.syncPortToEagle(oldPort, newPort);
if (portSyncResult.success) {
    console.log('端口同步成功');
} else {
    console.log('端口同步失败:', portSyncResult.error);
}
```

#### UI 设置配置
```javascript
// 主题设置
const theme = settingsManager.getField('theme');
document.documentElement.classList.toggle('theme-light', theme === 'light');

// 语言设置
const language = settingsManager.getField('language');
i18n.setLanguage(language);

// 组件显示控制
const uiSettings = settingsManager.getField('uiSettings');
applyUISettings(uiSettings);
```

### 高级功能

#### 字段监听
```javascript
// 添加字段监听器
const removeListener = settingsManager.addFieldListener('mode', (newValue, oldValue, fieldPath) => {
    console.log(`导入模式已从 ${oldValue} 变更为 ${newValue}`);
    
    // 根据新模式更新UI
    updateImportModeUI(newValue);
});

// 使用完成后移除监听器
// removeListener();

// 添加一次性监听器
settingsManager.addFieldListener('mode', (newValue, oldValue, fieldPath) => {
    console.log(`导入模式一次性变更: ${oldValue} -> ${newValue}`);
}, true); // 第三个参数设为true表示一次性监听
```

#### 自动保存
```javascript
// 防抖保存设置
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
```

#### 类型验证
```javascript
// 添加自定义验证器
settingsManager.addValidator('communicationPort', (value) => {
    if (typeof value !== 'number' || value < 1024 || value > 65535) {
        return {
            valid: false,
            error: '通信端口必须在1024-65535范围内'
        };
    }
    return { valid: true };
});

// 验证字段
const validation = settingsManager.validateField('communicationPort', 8080);
if (!validation.valid) {
    console.error('验证失败:', validation.error);
}
```

#### 版本兼容性
```javascript
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

## 技术实现

### 核心类结构

```javascript
/**
 * 高级设置面板
 * 提供完整的设置管理界面，支持面板特定配置和实时同步
 */
class AdvancedSettingsPanel {
    /**
     * 构造函数
     * @param {Object} aeExtension - AE扩展实例
     */
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.csInterface = aeExtension.csInterface;
        this.settingsManager = aeExtension.settingsManager;
        this.logManager = aeExtension.logManager;
        this.projectStatusChecker = aeExtension.projectStatusChecker;
        
        // 获取面板ID
        this.panelId = this.getPanelId();
        
        // 初始化状态
        this.isInitialized = false;
        this.isVisible = false;
        this.fieldListeners = new Map();
        
        // 绑定方法上下文
        this.init = this.init.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.loadSettingsToUI = this.loadSettingsToUI.bind(this);
        this.saveSettingsFromUI = this.saveSettingsFromUI.bind(this);
        this.updateSettingsUI = this.updateSettingsUI.bind(this);
        this.validateSettings = this.validateSettings.bind(this);
        
        this.log(`⚙️ 高级设置面板已为面板 ${this.panelId} 初始化`, 'debug');
    }
}
```

### 面板ID识别实现

```javascript
/**
 * 获取当前面板 ID
 * @returns {string} 'panel1', 'panel2', 或 'panel3'
 */
getPanelId() {
    try {
        if (this.csInterface && typeof this.csInterface.getExtensionID === 'function') {
            const extensionId = this.csInterface.getExtensionID();
            
            // 从 Extension ID 中提取面板编号
            if (extensionId.includes('panel1')) {
                return 'panel1';
            } else if (extensionId.includes('panel2')) {
                return 'panel2';
            } else if (extensionId.includes('panel3')) {
                return 'panel3';
            }
        }
        
        // Demo 模式：从 URL 参数获取
        if (window.location && window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            const panelParam = urlParams.get('panel');
            if (panelParam && ['panel1', 'panel2', 'panel3'].includes(panelParam)) {
                return panelParam;
            }
        }
        
        // 默认返回 panel1
        return 'panel1';
    } catch (error) {
        return 'panel1';
    }
}
```

### UI初始化实现

```javascript
/**
 * 初始化高级设置面板
 */
async init() {
    if (this.isInitialized) {
        this.log('⚙️ 高级设置面板已初始化', 'debug');
        return;
    }

    try {
        // 等待DOM完全加载
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // 初始化UI元素
        this.initUIElements();

        // 绑定事件监听器
        this.bindEventListeners();

        // 加载设置到UI
        this.loadSettingsToUI();

        // 设置自动保存
        this.setupAutoSave();

        // 标记为已初始化
        this.isInitialized = true;

        this.log('⚙️ 高级设置面板初始化完成', 'debug');

    } catch (error) {
        this.log(`⚙️ 高级设置面板初始化失败: ${error.message}`, 'error');
    }
}

/**
 * 初始化UI元素
 */
initUIElements() {
    // 获取所有设置相关的UI元素
    this.uiElements = {
        // 导入设置
        importMode: document.querySelectorAll('input[name="import-mode"]'),
        projectAdjacentFolder: document.getElementById('project-adjacent-folder'),
        customFolderPath: document.getElementById('custom-folder-path'),
        addToComposition: document.getElementById('add-to-composition'),
        timelineOptions: {
            enabled: document.getElementById('timeline-options-enabled'),
            placement: document.querySelectorAll('input[name="timeline-placement"]'),
            sequenceInterval: document.getElementById('sequence-interval')
        },

        // 导出设置
        exportMode: document.querySelectorAll('input[name="export-mode"]'),
        exportOptions: {
            autoCopy: document.getElementById('export-auto-copy'),
            burnAfterReading: document.getElementById('export-burn-after-reading'),
            addTimestamp: document.getElementById('export-add-timestamp'),
            createSubfolders: document.getElementById('export-create-subfolders')
        },
        exportCustomFolderPath: document.getElementById('export-custom-folder-path'),

        // 通信设置
        communicationPort: document.getElementById('communication-port'),

        // UI 设置
        theme: document.getElementById('theme-toggle'),
        language: document.getElementById('language-toggle'),
        uiComponents: {
            theme: document.getElementById('ui-theme'),
            language: document.getElementById('ui-language'),
            log: document.getElementById('ui-log'),
            projectInfo: document.getElementById('ui-project-info'),
            logPanel: document.getElementById('ui-log-panel'),
            header: document.getElementById('ui-header'),
            fullscreen: document.getElementById('ui-fullscreen')
        },

        // 预设管理
        exportPresets: document.getElementById('export-presets-btn'),
        importPresets: document.getElementById('import-presets-btn'),
        openPresetsFolder: document.getElementById('open-presets-folder-btn'),
        choosePresetsFolder: document.getElementById('choose-presets-folder-btn'),

        // 操作按钮
        saveSettings: document.getElementById('save-settings-btn'),
        resetSettings: document.getElementById('reset-settings-btn'),
        closePanel: document.getElementById('close-settings-panel')
    };

    this.log('⚙️ UI元素初始化完成', 'debug');
}
```

### 事件绑定实现

```javascript
/**
 * 绑定事件监听器
 */
bindEventListeners() {
    // 导入模式变化
    this.uiElements.importMode.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                this.handleImportModeChange(radio.value);
            }
        });
    });

    // 项目旁文件夹变化
    if (this.uiElements.projectAdjacentFolder) {
        this.uiElements.projectAdjacentFolder.addEventListener('input', this.debounce(() => {
            this.handleProjectAdjacentFolderChange();
        }, 300));
    }

    // 指定文件夹路径变化
    if (this.uiElements.customFolderPath) {
        this.uiElements.customFolderPath.addEventListener('input', this.debounce(() => {
            this.handleCustomFolderPathChange();
        }, 300));
    }

    // 导入合成选项变化
    if (this.uiElements.addToComposition) {
        this.uiElements.addToComposition.addEventListener('change', () => {
            this.handleAddToCompositionChange();
        });
    }

    // 时间轴选项变化
    if (this.uiElements.timelineOptions.enabled) {
        this.uiElements.timelineOptions.enabled.addEventListener('change', () => {
            this.handleTimelineOptionsChange();
        });
    }

    this.uiElements.timelineOptions.placement.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                this.handleTimelinePlacementChange(radio.value);
            }
        });
    });

    if (this.uiElements.timelineOptions.sequenceInterval) {
        this.uiElements.timelineOptions.sequenceInterval.addEventListener('input', this.debounce(() => {
            this.handleSequenceIntervalChange();
        }, 300));
    }

    // 导出模式变化
    this.uiElements.exportMode.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                this.handleExportModeChange(radio.value);
            }
        });
    });

    // 导出选项变化
    const exportOptionElements = Object.values(this.uiElements.exportOptions);
    exportOptionElements.forEach(element => {
        if (element) {
            element.addEventListener('change', () => {
                this.handleExportOptionsChange();
            });
        }
    });

    // 导出指定文件夹路径变化
    if (this.uiElements.exportCustomFolderPath) {
        this.uiElements.exportCustomFolderPath.addEventListener('input', this.debounce(() => {
            this.handleExportCustomFolderPathChange();
        }, 300));
    }

    // 通信端口变化
    if (this.uiElements.communicationPort) {
        this.uiElements.communicationPort.addEventListener('input', this.debounce(() => {
            this.handleCommunicationPortChange();
        }, 500));
    }

    // 主题切换
    if (this.uiElements.theme) {
        this.uiElements.theme.addEventListener('click', () => {
            this.handleThemeToggle();
        });
    }

    // 语言切换
    if (this.uiElements.language) {
        this.uiElements.language.addEventListener('click', () => {
            this.handleLanguageToggle();
        });
    }

    // UI组件显示控制
    Object.values(this.uiElements.uiComponents).forEach(element => {
        if (element) {
            element.addEventListener('change', () => {
                this.handleUIComponentChange();
            });
        }
    });

    // 预设管理按钮
    if (this.uiElements.exportPresets) {
        this.uiElements.exportPresets.addEventListener('click', () => {
            this.handleExportPresets();
        });
    }

    if (this.uiElements.importPresets) {
        this.uiElements.importPresets.addEventListener('click', () => {
            this.handleImportPresets();
        });
    }

    if (this.uiElements.openPresetsFolder) {
        this.uiElements.openPresetsFolder.addEventListener('click', () => {
            this.handleOpenPresetsFolder();
        });
    }

    if (this.uiElements.choosePresetsFolder) {
        this.uiElements.choosePresetsFolder.addEventListener('click', () => {
            this.handleChoosePresetsFolder();
        });
    }

    // 操作按钮
    if (this.uiElements.saveSettings) {
        this.uiElements.saveSettings.addEventListener('click', () => {
            this.handleSaveSettings();
        });
    }

    if (this.uiElements.resetSettings) {
        this.uiElements.resetSettings.addEventListener('click', () => {
            this.handleResetSettings();
        });
    }

    if (this.uiElements.closePanel) {
        this.uiElements.closePanel.addEventListener('click', () => {
            this.hide();
        });
    }

    // 键盘事件
    document.addEventListener('keydown', (e) => {
        // ESC键关闭面板
        if (e.key === 'Escape' && this.isVisible) {
            this.hide();
        }

        // Ctrl+S 保存设置
        if ((e.ctrlKey || e.metaKey) && e.key === 's' && this.isVisible) {
            e.preventDefault();
            this.handleSaveSettings();
        }
    });

    this.log('⚙️ 事件监听器绑定完成', 'debug');
}
```

### 设置加载实现

```javascript
/**
 * 加载设置到UI
 */
loadSettingsToUI() {
    try {
        const settings = this.settingsManager.getSettings();
        const preferences = this.settingsManager.getPreferences();

        this.log('⚙️ 开始加载设置到UI...', 'debug');

        // 加载导入设置
        this.loadImportSettings(settings);

        // 加载导出设置
        this.loadExportSettings(settings);

        // 加载通信设置
        this.loadCommunicationSettings(preferences);

        // 加载UI设置
        this.loadUISettings(settings);

        // 加载预设管理设置
        this.loadPresetManagementSettings();

        this.log('⚙️ 设置已加载到UI', 'debug');

    } catch (error) {
        this.log(`⚙️ 加载设置到UI失败: ${error.message}`, 'error');
    }
}

/**
 * 加载导入设置
 * @param {Object} settings - 设置对象
 */
loadImportSettings(settings) {
    // 导入模式
    const modeRadios = this.uiElements.importMode;
    modeRadios.forEach(radio => {
        radio.checked = radio.value === settings.mode;
    });

    // 项目旁文件夹
    if (this.uiElements.projectAdjacentFolder) {
        this.uiElements.projectAdjacentFolder.value = settings.projectAdjacentFolder || 'Eagle_Assets';
    }

    // 指定文件夹路径
    if (this.uiElements.customFolderPath) {
        this.uiElements.customFolderPath.value = settings.customFolderPath || '';
    }

    // 导入合成选项
    if (this.uiElements.addToComposition) {
        this.uiElements.addToComposition.checked = settings.addToComposition !== false;
    }

    // 时间轴选项
    if (this.uiElements.timelineOptions.enabled) {
        this.uiElements.timelineOptions.enabled.checked = settings.timelineOptions?.enabled !== false;
    }

    const timelinePlacementRadios = this.uiElements.timelineOptions.placement;
    timelinePlacementRadios.forEach(radio => {
        radio.checked = radio.value === (settings.timelineOptions?.placement || 'current_time');
    });

    if (this.uiElements.timelineOptions.sequenceInterval) {
        this.uiElements.timelineOptions.sequenceInterval.value = settings.timelineOptions?.sequenceInterval || 1.0;
    }

    this.log('📥 导入设置已加载', 'debug');
}

/**
 * 加载导出设置
 * @param {Object} settings - 设置对象
 */
loadExportSettings(settings) {
    // 导出模式
    const exportModeRadios = this.uiElements.exportMode;
    exportModeRadios.forEach(radio => {
        radio.checked = radio.value === (settings.exportSettings?.mode || 'project_adjacent');
    });

    // 导出选项
    if (this.uiElements.exportOptions.autoCopy) {
        this.uiElements.exportOptions.autoCopy.checked = settings.exportSettings?.autoCopy !== false;
    }

    if (this.uiElements.exportOptions.burnAfterReading) {
        this.uiElements.exportOptions.burnAfterReading.checked = settings.exportSettings?.burnAfterReading === true;
    }

    if (this.uiElements.exportOptions.addTimestamp) {
        this.uiElements.exportOptions.addTimestamp.checked = settings.exportSettings?.addTimestamp === true;
    }

    if (this.uiElements.exportOptions.createSubfolders) {
        this.uiElements.exportOptions.createSubfolders.checked = settings.exportSettings?.createSubfolders === true;
    }

    // 导出指定文件夹路径
    if (this.uiElements.exportCustomFolderPath) {
        this.uiElements.exportCustomFolderPath.value = settings.exportSettings?.customExportPath || '';
    }

    this.log('📤 导出设置已加载', 'debug');
}

/**
 * 加载通信设置
 * @param {Object} preferences - 用户偏好对象
 */
loadCommunicationSettings(preferences) {
    // 通信端口
    if (this.uiElements.communicationPort) {
        this.uiElements.communicationPort.value = preferences.communicationPort || 8080;
    }

    this.log('📡 通信设置已加载', 'debug');
}

/**
 * 加载UI设置
 * @param {Object} settings - 设置对象
 */
loadUISettings(settings) {
    // 主题
    if (this.uiElements.theme) {
        const currentTheme = this.getPanelLocalStorage('aeTheme') || 'dark';
        this.uiElements.theme.setAttribute('aria-pressed', currentTheme === 'light');
        this.uiElements.theme.title = currentTheme === 'light' ? '切换为暗色模式' : '切换为亮色模式';
    }

    // 语言
    if (this.uiElements.language) {
        const currentLang = this.getPanelLocalStorage('language') || 'zh-CN';
        this.uiElements.language.setAttribute('aria-pressed', currentLang === 'en-US');
        this.uiElements.language.title = currentLang === 'en-US' ? '切换为中文' : '切换为英文';
    }

    // UI组件显示控制
    const uiSettings = settings.uiSettings || this.getDefaultUISettings();
    
    if (this.uiElements.uiComponents.theme) {
        this.uiElements.uiComponents.theme.checked = uiSettings.theme !== false;
    }

    if (this.uiElements.uiComponents.language) {
        this.uiElements.uiComponents.language.checked = uiSettings.language !== false;
    }

    if (this.uiElements.uiComponents.log) {
        this.uiElements.uiComponents.log.checked = uiSettings.log !== false;
    }

    if (this.uiElements.uiComponents.projectInfo) {
        this.uiElements.uiComponents.projectInfo.checked = uiSettings.projectInfo !== false;
    }

    if (this.uiElements.uiComponents.logPanel) {
        this.uiElements.uiComponents.logPanel.checked = uiSettings.logPanel !== false;
    }

    if (this.uiElements.uiComponents.header) {
        this.uiElements.uiComponents.header.checked = uiSettings.header !== false;
    }

    if (this.uiElements.uiComponents.fullscreen) {
        this.uiElements.uiComponents.fullscreen.checked = uiSettings.fullscreen === true;
    }

    this.log('🎨 UI设置已加载', 'debug');
}

/**
 * 加载预设管理设置
 */
loadPresetManagementSettings() {
    // 更新预设文件按钮提示
    this.updatePresetFileButtonsTooltip();

    this.log('💾 预设管理设置已加载', 'debug');
}
```

### 设置保存实现

```javascript
/**
 * 从UI保存设置
 * @param {boolean} showMessage - 是否显示保存消息
 * @returns {Object} 保存结果
 */
saveSettingsFromUI(showMessage = true) {
    try {
        this.log('⚙️ 开始从UI保存设置...', 'debug');

        // 收集导入设置
        const importSettings = this.collectImportSettings();

        // 收集导出设置
        const exportSettings = this.collectExportSettings();

        // 收集通信设置
        const communicationSettings = this.collectCommunicationSettings();

        // 收集UI设置
        const uiSettings = this.collectUISettings();

        // 合并所有设置
        const allSettings = {
            ...importSettings,
            exportSettings: exportSettings,
            uiSettings: uiSettings
        };

        // 保存设置到管理器
        const saveResult = this.settingsManager.saveSettings(allSettings);

        if (saveResult.success) {
            // 保存通信设置到偏好
            this.settingsManager.savePreference('communicationPort', communicationSettings.communicationPort);

            if (showMessage) {
                this.log('✅ 设置已保存', 'success');
                this.showNotification('✅ 设置已保存', 'success');
            }

            // 触发设置保存事件
            this.emit('settingsSaved', allSettings);

            return {
                success: true,
                settings: allSettings
            };
        } else {
            const errorMsg = saveResult.error || '保存设置失败';
            this.log(`❌ 保存设置失败: ${errorMsg}`, 'error');
            
            if (showMessage) {
                this.showNotification(`❌ 保存设置失败: ${errorMsg}`, 'error');
            }

            return {
                success: false,
                error: errorMsg
            };
        }

    } catch (error) {
        this.log(`❌ 从UI保存设置异常: ${error.message}`, 'error');
        
        if (showMessage) {
            this.showNotification(`❌ 保存设置异常: ${error.message}`, 'error');
        }

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 收集导入设置
 * @returns {Object} 导入设置对象
 */
collectImportSettings() {
    const settings = {};

    // 导入模式
    const modeRadio = document.querySelector('input[name="import-mode"]:checked');
    settings.mode = modeRadio ? modeRadio.value : 'project_adjacent';

    // 项目旁文件夹
    if (this.uiElements.projectAdjacentFolder) {
        settings.projectAdjacentFolder = this.uiElements.projectAdjacentFolder.value || 'Eagle_Assets';
    }

    // 指定文件夹路径
    if (this.uiElements.customFolderPath) {
        settings.customFolderPath = this.uiElements.customFolderPath.value || '';
    }

    // 导入合成选项
    if (this.uiElements.addToComposition) {
        settings.addToComposition = this.uiElements.addToComposition.checked;
    }

    // 时间轴选项
    settings.timelineOptions = {
        enabled: this.uiElements.timelineOptions.enabled ? 
                 this.uiElements.timelineOptions.enabled.checked : true,
        placement: 'current_time',
        sequenceInterval: 1.0
    };

    const timelinePlacementRadio = document.querySelector('input[name="timeline-placement"]:checked');
    if (timelinePlacementRadio) {
        settings.timelineOptions.placement = timelinePlacementRadio.value;
    }

    if (this.uiElements.timelineOptions.sequenceInterval) {
        settings.timelineOptions.sequenceInterval = 
            parseFloat(this.uiElements.timelineOptions.sequenceInterval.value) || 1.0;
    }

    return settings;
}

/**
 * 收集导出设置
 * @returns {Object} 导出设置对象
 */
collectExportSettings() {
    const settings = {};

    // 导出模式
    const exportModeRadio = document.querySelector('input[name="export-mode"]:checked');
    settings.mode = exportModeRadio ? exportModeRadio.value : 'project_adjacent';

    // 导出选项
    settings.autoCopy = this.uiElements.exportOptions.autoCopy ? 
                       this.uiElements.exportOptions.autoCopy.checked : true;
    settings.burnAfterReading = this.uiElements.exportOptions.burnAfterReading ? 
                              this.uiElements.exportOptions.burnAfterReading.checked : false;
    settings.addTimestamp = this.uiElements.exportOptions.addTimestamp ? 
                          this.uiElements.exportOptions.addTimestamp.checked : false;
    settings.createSubfolders = this.uiElements.exportOptions.createSubfolders ? 
                              this.uiElements.exportOptions.createSubfolders.checked : false;

    // 导出指定文件夹路径
    if (this.uiElements.exportCustomFolderPath) {
        settings.customExportPath = this.uiElements.exportCustomFolderPath.value || '';
    }

    // 项目旁文件夹
    settings.projectAdjacentFolder = 'Eagle_Assets'; // 默认值

    return settings;
}

/**
 * 收集通信设置
 * @returns {Object} 通信设置对象
 */
collectCommunicationSettings() {
    const settings = {};

    // 通信端口
    if (this.uiElements.communicationPort) {
        settings.communicationPort = parseInt(this.uiElements.communicationPort.value) || 8080;
    } else {
        settings.communicationPort = 8080;
    }

    return settings;
}

/**
 * 收集UI设置
 * @returns {Object} UI设置对象
 */
collectUISettings() {
    const settings = {};

    // UI组件显示控制
    settings.theme = this.uiElements.uiComponents.theme ? 
                    this.uiElements.uiComponents.theme.checked : true;
    settings.language = this.uiElements.uiComponents.language ? 
                       this.uiElements.uiComponents.language.checked : true;
    settings.log = this.uiElements.uiComponents.log ? 
                  this.uiElements.uiComponents.log.checked : true;
    settings.projectInfo = this.uiElements.uiComponents.projectInfo ? 
                          this.uiElements.uiComponents.projectInfo.checked : true;
    settings.logPanel = this.uiElements.uiComponents.logPanel ? 
                       this.uiElements.uiComponents.logPanel.checked : true;
    settings.header = this.uiElements.uiComponents.header ? 
                     this.uiElements.uiComponents.header.checked : true;
    settings.fullscreen = this.uiElements.uiComponents.fullscreen ? 
                         this.uiElements.uiComponents.fullscreen.checked : false;

    return settings;
}
```

### 自动保存实现

```javascript
/**
 * 设置自动保存
 */
setupAutoSave() {
    // 防抖保存设置
    this.autoSave = this.debounce(() => {
        this.log('💾 触发自动保存设置', 'debug');
        this.saveSettingsFromUI(false); // 静默保存，不显示消息
    }, 1000); // 1秒防抖延迟

    // 为关键设置字段添加自动保存监听器
    const autoSaveFields = [
        'input[name="import-mode"]',
        'input[name="export-mode"]',
        'input[name="timeline-placement"]',
        '#project-adjacent-folder',
        '#custom-folder-path',
        '#export-custom-folder-path',
        '#add-to-composition',
        '#timeline-options-enabled',
        '#sequence-interval',
        '#export-auto-copy',
        '#export-burn-after-reading',
        '#export-add-timestamp',
        '#export-create-subfolders',
        '#communication-port',
        '#ui-theme',
        '#ui-language',
        '#ui-log',
        '#ui-project-info',
        '#ui-log-panel',
        '#ui-header',
        '#ui-fullscreen'
    ];

    autoSaveFields.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // 监听不同类型的事件
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.addEventListener('change', this.autoSave);
            } else {
                element.addEventListener('input', this.autoSave);
            }
        });
    });

    this.log('⚙️ 自动保存已设置', 'debug');
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
    const errors = [];

    try {
        // 验证导入设置
        const importValidation = this.validateImportSettings(settings);
        if (!importValidation.valid) {
            errors.push(...importValidation.errors);
        }

        // 验证导出设置
        const exportValidation = this.validateExportSettings(settings.exportSettings);
        if (!exportValidation.valid) {
            errors.push(...exportValidation.errors);
        }

        // 验证通信设置
        const communicationValidation = this.validateCommunicationSettings(
            this.settingsManager.getPreference('communicationPort')
        );
        if (!communicationValidation.valid) {
            errors.push(...communicationValidation.errors);
        }

        // 验证UI设置
        const uiValidation = this.validateUISettings(settings.uiSettings);
        if (!uiValidation.valid) {
            errors.push(...uiValidation.errors);
        }

        if (errors.length > 0) {
            return {
                valid: false,
                errors: errors
            };
        }

        return {
            valid: true
        };

    } catch (error) {
        return {
            valid: false,
            errors: [`设置验证异常: ${error.message}`]
        };
    }
}

/**
 * 验证导入设置
 * @param {Object} settings - 导入设置
 * @returns {Object} 验证结果
 */
validateImportSettings(settings) {
    const errors = [];

    // 验证导入模式
    const validModes = ['direct', 'project_adjacent', 'custom_folder'];
    if (!validModes.includes(settings.mode)) {
        errors.push(`无效的导入模式: ${settings.mode}`);
    }

    // 验证项目旁文件夹名称
    if (settings.mode === 'project_adjacent') {
        const folderName = settings.projectAdjacentFolder;
        if (!folderName || folderName.trim() === '') {
            errors.push('项目旁文件夹名称不能为空');
        } else if (!this.isValidFolderName(folderName)) {
            errors.push('项目旁文件夹名称包含无效字符');
        }
    }

    // 验证指定文件夹路径
    if (settings.mode === 'custom_folder') {
        const folderPath = settings.customFolderPath;
        if (!folderPath || folderPath.trim() === '') {
            errors.push('指定文件夹路径不能为空');
        } else if (folderPath.startsWith('[已选择]')) {
            errors.push('指定文件夹路径格式无效');
        }
    }

    // 验证时间轴选项
    if (settings.timelineOptions) {
        const validPlacements = ['current_time', 'timeline_start'];
        if (settings.timelineOptions.placement && 
            !validPlacements.includes(settings.timelineOptions.placement)) {
            errors.push(`无效的时间轴放置位置: ${settings.timelineOptions.placement}`);
        }

        const sequenceInterval = parseFloat(settings.timelineOptions.sequenceInterval);
        if (isNaN(sequenceInterval) || sequenceInterval <= 0) {
            errors.push('序列间隔必须是大于0的数字');
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * 验证导出设置
 * @param {Object} exportSettings - 导出设置
 * @returns {Object} 验证结果
 */
validateExportSettings(exportSettings) {
    const errors = [];

    // 验证导出模式
    const validModes = ['desktop', 'project_adjacent', 'custom_folder'];
    if (!validModes.includes(exportSettings.mode)) {
        errors.push(`无效的导出模式: ${exportSettings.mode}`);
    }

    // 验证导出指定文件夹路径
    if (exportSettings.mode === 'custom_folder') {
        const folderPath = exportSettings.customExportPath;
        if (!folderPath || folderPath.trim() === '') {
            errors.push('导出指定文件夹路径不能为空');
        } else if (folderPath.startsWith('[已选择]')) {
            errors.push('导出指定文件夹路径格式无效');
        }
    }

    // 验证通信端口
    const communicationPort = this.settingsManager.getPreference('communicationPort');
    if (typeof communicationPort !== 'number' || communicationPort < 1024 || communicationPort > 65535) {
        errors.push('通信端口必须在1024-65535范围内');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * 验证通信设置
 * @param {number} port - 通信端口
 * @returns {Object} 验证结果
 */
validateCommunicationSettings(port) {
    const errors = [];

    if (typeof port !== 'number' || port < 1024 || port > 65535) {
        errors.push('通信端口必须在1024-65535范围内');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * 验证UI设置
 * @param {Object} uiSettings - UI设置
 * @returns {Object} 验证结果
 */
validateUISettings(uiSettings) {
    const errors = [];

    // UI设置验证相对宽松，主要是检查字段存在性
    if (!uiSettings || typeof uiSettings !== 'object') {
        errors.push('UI设置必须是对象');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * 检查文件夹名称是否有效
 * @param {string} folderName - 文件夹名称
 * @returns {boolean} 是否有效
 */
isValidFolderName(folderName) {
    if (!folderName || typeof folderName !== 'string') return false;

    // 检查是否包含无效字符
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(folderName)) return false;

    // 检查名称长度
    if (folderName.length > 255) return false;

    // 检查是否为保留名称
    const reservedNames = [
        'CON', 'PRN', 'AUX', 'NUL',
        'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
        'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];

    const upperName = folderName.toUpperCase();
    if (reservedNames.includes(upperName)) return false;

    return true;
}
```

### 事件处理实现

```javascript
/**
 * 处理导入模式变更
 * @param {string} newMode - 新的导入模式
 */
handleImportModeChange(newMode) {
    this.log(`📥 导入模式已更改为: ${newMode}`, 'info');

    // 更新设置管理器
    const updateResult = this.settingsManager.updateField('mode', newMode, false);

    if (updateResult.success) {
        // 根据新模式更新UI状态
        this.updateImportModeUI(newMode);

        // 触发自动保存
        this.autoSave();

        // 显示模式变更提示
        const modeDescriptions = {
            'direct': '直接从源目录导入到AE项目，不复制文件',
            'project_adjacent': '将文件复制到AE项目文件旁边后导入',
            'custom_folder': '将文件复制到指定文件夹后导入'
        };

        this.log(`💡 ${modeDescriptions[newMode] || '导入模式已更新'}`, 'info');
    } else {
        this.log(`❌ 更新导入模式失败: ${updateResult.error}`, 'error');
    }
}

/**
 * 处理项目旁文件夹变更
 */
handleProjectAdjacentFolderChange() {
    const folderName = this.uiElements.projectAdjacentFolder.value;
    this.log(`📁 项目旁文件夹已更改为: ${folderName}`, 'info');

    // 更新设置管理器
    const updateResult = this.settingsManager.updateField('projectAdjacentFolder', folderName, false);

    if (updateResult.success) {
        // 验证文件夹名称
        if (folderName && folderName.trim() !== '') {
            if (!this.isValidFolderName(folderName)) {
                this.log('⚠️ 文件夹名称包含无效字符', 'warning');
                this.showNotification('⚠️ 文件夹名称包含无效字符', 'warning');
            } else {
                this.log(`✅ 项目旁文件夹名称验证通过`, 'success');
            }
        }

        // 触发自动保存
        this.autoSave();
    } else {
        this.log(`❌ 更新项目旁文件夹失败: ${updateResult.error}`, 'error');
    }
}

/**
 * 处理指定文件夹路径变更
 */
handleCustomFolderPathChange() {
    const folderPath = this.uiElements.customFolderPath.value;
    this.log(`📁 指定文件夹路径已更改为: ${folderPath}`, 'info');

    // 更新设置管理器
    const updateResult = this.settingsManager.updateField('customFolderPath', folderPath, false);

    if (updateResult.success) {
        // 验证文件夹路径
        if (folderPath && folderPath.trim() !== '') {
            if (folderPath.startsWith('[已选择]')) {
                this.log('⚠️ 文件夹路径格式无效', 'warning');
                this.showNotification('⚠️ 文件夹路径格式无效', 'warning');
            } else {
                this.log(`✅ 指定文件夹路径验证通过`, 'success');
            }
        }

        // 触发自动保存
        this.autoSave();
    } else {
        this.log(`❌ 更新指定文件夹路径失败: ${updateResult.error}`, 'error');
    }
}

/**
 * 处理导入合成选项变更
 */
handleAddToCompositionChange() {
    const isChecked = this.uiElements.addToComposition.checked;
    this.log(`🔄 导入合成选项已更改为: ${isChecked ? '启用' : '禁用'}`, 'info');

    // 更新设置管理器
    const updateResult = this.settingsManager.updateField('addToComposition', isChecked, false);

    if (updateResult.success) {
        // 根据选项状态更新时间轴选项UI
        this.updateTimelineOptionsUI(isChecked);

        // 触发自动保存
        this.autoSave();
    } else {
        this.log(`❌ 更新导入合成选项失败: ${updateResult.error}`, 'error');
    }
}

/**
 * 处理时间轴选项变更
 */
handleTimelineOptionsChange() {
    const isEnabled = this.uiElements.timelineOptions.enabled.checked;
    this.log(`🕒 时间轴选项已更改为: ${isEnabled ? '启用' : '禁用'}`, 'info');

    // 更新设置管理器
    const updateResult = this.settingsManager.updateField('timelineOptions.enabled', isEnabled, false);

    if (updateResult.success) {
        // 根据启用状态更新时间轴选项UI
        this.updateTimelineOptionsUI(isEnabled);

        // 触发自动保存
        this.autoSave();
    } else {
        this.log(`❌ 更新时间轴选项失败: ${updateResult.error}`, 'error');
    }
}

/**
 * 处理时间轴放置位置变更
 * @param {string} newPlacement - 新的放置位置
 */
handleTimelinePlacementChange(newPlacement) {
    this.log(`🕒 时间轴放置位置已更改为: ${newPlacement}`, 'info');

    // 更新设置管理器
    const updateResult = this.settingsManager.updateField('timelineOptions.placement', newPlacement, false);

    if (updateResult.success) {
        // 触发自动保存
        this.autoSave();

        // 显示放置位置说明
        const placementDescriptions = {
            'current_time': '将素材放置在当前时间指针位置',
            'timeline_start': '将素材移至时间轴开始处（0秒位置）'
        };

        this.log(`💡 ${placementDescriptions[newPlacement] || '时间轴放置位置已更新'}`, 'info');
    } else {
        this.log(`❌ 更新时间轴放置位置失败: ${updateResult.error}`, 'error');
    }
}

/**
 * 处理序列间隔变更
 */
handleSequenceIntervalChange() {
    const intervalValue = parseFloat(this.uiElements.timelineOptions.sequenceInterval.value) || 1.0;
    this.log(`🕒 序列间隔已更改为: ${intervalValue}`, 'info');

    // 更新设置管理器
    const updateResult = this.settingsManager.updateField('timelineOptions.sequenceInterval', intervalValue, false);

    if (updateResult.success) {
        // 验证序列间隔值
        if (intervalValue <= 0) {
            this.log('⚠️ 序列间隔必须大于0', 'warning');
            this.showNotification('⚠️ 序列间隔必须大于0', 'warning');
        } else {
            this.log(`✅ 序列间隔验证通过`, 'success');
        }

        // 触发自动保存
        this.autoSave();
    } else {
        this.log(`❌ 更新序列间隔失败: ${updateResult.error}`, 'error');
    }
}
```

### 导出设置事件处理

```javascript
/**
 * 处理导出模式变更
 * @param {string} newMode - 新的导出模式
 */
handleExportModeChange(newMode) {
    this.log(`📤 导出模式已更改为: ${newMode}`, 'info');

    // 更新设置管理器
    const updateResult = this.settingsManager.updateField('exportSettings.mode', newMode, false);

    if (updateResult.success) {
        // 根据新模式更新UI状态
        this.updateExportModeUI(newMode);

        // 触发自动保存
        this.autoSave();

        // 显示模式变更提示
        const modeDescriptions = {
            'desktop': '直接导出到桌面',
            'project_adjacent': '导出到AE项目文件旁边的文件夹',
            'custom_folder': '导出到指定文件夹'
        };

        this.log(`💡 ${modeDescriptions[newMode] || '导出模式已更新'}`, 'info');
    } else {
        this.log(`❌ 更新导出模式失败: ${updateResult.error}`, 'error');
    }
}

/**
 * 处理导出选项变更
 */
handleExportOptionsChange() {
    this.log('📤 导出选项已更新', 'info');

    // 收集当前导出选项
    const exportOptions = this.collectExportSettings();

    // 更新设置管理器
    const updateResult = this.settingsManager.updateFields({
        'exportSettings.autoCopy': exportOptions.autoCopy,
        'exportSettings.burnAfterReading': exportOptions.burnAfterReading,
        'exportSettings.addTimestamp': exportOptions.addTimestamp,
        'exportSettings.createSubfolders': exportOptions.createSubfolders
    }, false);

    if (updateResult.success) {
        // 触发自动保存
        this.autoSave();

        // 显示导出选项说明
        const optionDescriptions = [];
        if (exportOptions.autoCopy) {
            optionDescriptions.push('自动复制: 导出完成后自动复制导出路径和文件到剪切板');
        }
        if (exportOptions.burnAfterReading) {
            optionDescriptions.push('阅后即焚: 启用后图片导出到临时文件夹，导出后复制到剪切板');
        }
        if (exportOptions.addTimestamp) {
            optionDescriptions.push('时间戳前缀: 在导出文件夹名称前添加时间戳');
        }
        if (exportOptions.createSubfolders) {
            optionDescriptions.push('合成名前缀: 在导出文件夹名称前添加当前合成名称');
        }

        if (optionDescriptions.length > 0) {
            this.log(`💡 ${optionDescriptions.join(', ')}`, 'info');
        }
    } else {
        this.log(`❌ 更新导出选项失败: ${updateResult.error}`, 'error');
    }
}

/**
 * 处理导出指定文件夹路径变更
 */
handleExportCustomFolderPathChange() {
    const folderPath = this.uiElements.exportCustomFolderPath.value;
    this.log(`📤 导出指定文件夹路径已更改为: ${folderPath}`, 'info');

    // 更新设置管理器
    const updateResult = this.settingsManager.updateField('exportSettings.customExportPath', folderPath, false);

    if (updateResult.success) {
        // 验证文件夹路径
        if (folderPath && folderPath.trim() !== '') {
            if (folderPath.startsWith('[已选择]')) {
                this.log('⚠️ 导出文件夹路径格式无效', 'warning');
                this.showNotification('⚠️ 导出文件夹路径格式无效', 'warning');
            } else {
                this.log(`✅ 导出指定文件夹路径验证通过`, 'success');
            }
        }

        // 触发自动保存
        this.autoSave();
    } else {
        this.log(`❌ 更新导出指定文件夹路径失败: ${updateResult.error}`, 'error');
    }
}
```

### 通信设置事件处理

```javascript
/**
 * 处理通信端口变更
 */
handleCommunicationPortChange() {
    const portValue = parseInt(this.uiElements.communicationPort.value) || 8080;
    this.log(`📡 通信端口已更改为: ${portValue}`, 'info');

    // 验证端口值
    if (portValue < 1024 || portValue > 65535) {
        this.log('⚠️ 端口必须在1024-65535范围内', 'warning');
        this.showNotification('⚠️ 端口必须在1024-65535范围内', 'warning');
        return;
    }

    // 获取旧端口值
    const oldPort = this.settingsManager.getPreference('communicationPort') || 8080;

    // 更新设置管理器
    const updateResult = this.settingsManager.updatePreference('communicationPort', portValue);

    if (updateResult.success) {
        // 异步处理端口变更，不阻塞UI
        this.handlePortChangeAsync(oldPort, portValue);

        // 触发自动保存
        this.autoSave();

        this.log(`✅ 通信端口已更新为 ${portValue}`, 'success');
    } else {
        this.log(`❌ 更新通信端口失败: ${updateResult.error}`, 'error');
        this.showNotification(`❌ 更新通信端口失败: ${updateResult.error}`, 'error');
    }
}

/**
 * 异步处理端口变更
 * @param {number} oldPort - 旧端口
 * @param {number} newPort - 新端口
 */
async handlePortChangeAsync(oldPort, newPort) {
    try {
        this.log(`🔄 正在处理端口变更: ${oldPort} -> ${newPort}`, 'info');

        // 更新Eagle URL
        this.updateEagleUrl(newPort);

        // 尝试连接到新的端口
        const connectionResult = await this.testConnection();

        if (connectionResult && connectionResult.success) {
            this.log(`✅ 已成功连接到新端口: ${newPort}`, 'success');
            
            // 如果连接成功，保存新端口到预设
            await this.savePresetsSilently();
            
            this.log(`💾 新端口设置已保存到预设文件`, 'success');
        } else {
            this.log(`⚠️ 无法连接到新端口: ${newPort}`, 'warning');
            
            // 如果连接失败，尝试智能端口同步
            const syncResult = await this.syncPortToEagle(oldPort, newPort);
            
            if (syncResult) {
                this.log(`✅ 端口同步成功，请等待Eagle插件重启`, 'success');
            } else {
                this.log(`⚠️ 端口同步失败，请手动重启Eagle插件`, 'warning');
                this.showNotification('⚠️ 端口同步失败，请手动重启Eagle插件', 'warning');
            }
        }

    } catch (error) {
        this.log(`处理端口变更异常: ${error.message}`, 'error');
        this.showNotification(`处理端口变更异常: ${error.message}`, 'error');
    }
}
```

### UI设置事件处理

```javascript
/**
 * 处理主题切换
 */
handleThemeToggle() {
    try {
        const currentTheme = this.getPanelLocalStorage('aeTheme') || 'dark';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.log(`🎨 主题已切换为: ${nextTheme}`, 'info');
        
        // 应用主题
        this.applyTheme(nextTheme);
        
        // 保存主题设置
        this.setPanelLocalStorage('aeTheme', nextTheme);
        
        // 触发自动保存
        this.autoSave();
        
        // 更新按钮状态
        if (this.uiElements.theme) {
            this.uiElements.theme.setAttribute('aria-pressed', nextTheme === 'light');
            this.uiElements.theme.title = nextTheme === 'light' ? '切换为暗色模式' : '切换为亮色模式';
        }
        
    } catch (error) {
        this.log(`切换主题失败: ${error.message}`, 'error');
    }
}

/**
 * 处理语言切换
 */
handleLanguageToggle() {
    try {
        const currentLang = this.getPanelLocalStorage('language') || 'zh-CN';
        const nextLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
        
        this.log(`🌐 语言已切换为: ${nextLang}`, 'info');
        
        // 应用语言
        this.applyLanguage(nextLang);
        
        // 保存语言设置
        this.setPanelLocalStorage('language', nextLang);
        this.setPanelLocalStorage('lang', nextLang);
        
        // 触发自动保存
        this.autoSave();
        
        // 更新按钮状态
        if (this.uiElements.language) {
            this.uiElements.language.setAttribute('aria-pressed', nextLang === 'en-US');
            this.uiElements.language.title = nextLang === 'en-US' ? '切换为中文' : '切换为英文';
        }
        
        // 更新页面文本
        if (window.i18n && typeof window.i18n.updatePageTexts === 'function') {
            window.i18n.updatePageTexts();
        }
        
    } catch (error) {
        this.log(`切换语言失败: ${error.message}`, 'error');
    }
}

/**
 * 处理UI组件显示变更
 */
handleUIComponentChange() {
    this.log('🎨 UI组件显示设置已更新', 'info');

    // 收集当前UI设置
    const uiSettings = this.collectUISettings();

    // 更新设置管理器
    const updateResult = this.settingsManager.updateField('uiSettings', uiSettings, false);

    if (updateResult.success) {
        // 应用UI设置到主面板
        this.applyUISettingsToMainPanel(uiSettings);

        // 触发自动保存
        this.autoSave();

        this.log('✅ UI组件显示设置已应用到主面板', 'success');
    } else {
        this.log(`❌ 更新UI组件显示设置失败: ${updateResult.error}`, 'error');
    }
}
```

### 预设管理事件处理

```javascript
/**
 * 处理导出预设文件
 */
async handleExportPresets() {
    try {
        this.log('💾 准备导出预设文件...', 'info');

        // 收集所有设置
        const settings = this.settingsManager.getSettings();
        const preferences = this.settingsManager.getPreferences();

        // 构造导出数据
        const exportData = {
            version: '2.4.0',
            exportedAt: new Date().toISOString(),
            panelId: this.panelId,
            importSettings: settings,
            userPreferences: preferences,
            uiSettings: this.getUISettingsFromLocalStorage(),
            language: localStorage.getItem('language') || 'zh-CN'
        };

        // 生成预设文件名
        const presetFileName = this.getPresetFileName();

        // 导出预设文件
        const exportResult = await this.exportPresetToFile(exportData, presetFileName);

        if (exportResult && exportResult.success) {
            this.log(`✅ 预设文件已导出: ${exportResult.filePath}`, 'success');
            this.showNotification('✅ 预设文件已导出', 'success');
        } else {
            const errorMsg = exportResult && exportResult.error ? exportResult.error : '未知错误';
            this.log(`❌ 导出预设文件失败: ${errorMsg}`, 'error');
            this.showNotification(`❌ 导出预设文件失败: ${errorMsg}`, 'error');
        }

    } catch (error) {
        this.log(`导出预设文件异常: ${error.message}`, 'error');
        this.showNotification(`导出预设文件异常: ${error.message}`, 'error');
    }
}

/**
 * 处理导入预设文件
 */
async handleImportPresets() {
    try {
        this.log('📥 准备导入预设文件...', 'info');

        // 选择预设文件
        const importResult = await this.importPresetFromFile();

        if (importResult && importResult.success && importResult.presetData) {
            const presetData = importResult.presetData;

            // 验证预设数据
            const validation = this.validatePresetData(presetData);
            if (!validation.valid) {
                this.log(`❌ 预设文件验证失败: ${validation.error}`, 'error');
                this.showNotification(`❌ 预设文件验证失败: ${validation.error}`, 'error');
                return;
            }

            // 应用预设数据
            const applyResult = await this.applyImportedPreset(presetData);

            if (applyResult && applyResult.success) {
                this.log('✅ 预设文件已导入并应用', 'success');
                this.showNotification('✅ 预设文件已导入并应用', 'success');

                // 刷新UI
                this.loadSettingsToUI();
                this.updateSettingsUI();
            } else {
                const errorMsg = applyResult && applyResult.error ? applyResult.error : '未知错误';
                this.log(`❌ 应用预设文件失败: ${errorMsg}`, 'error');
                this.showNotification(`❌ 应用预设文件失败: ${errorMsg}`, 'error');
            }

        } else if (importResult && !importResult.success) {
            const errorMsg = importResult.error || '用户取消了文件选择';
            this.log(`❌ 导入预设文件失败: ${errorMsg}`, 'warning');
            // 用户取消时不显示错误提示
            if (errorMsg !== '用户取消了文件选择') {
                this.showNotification(`❌ 导入预设文件失败: ${errorMsg}`, 'error');
            }
        }

    } catch (error) {
        this.log(`导入预设文件异常: ${error.message}`, 'error');
        this.showNotification(`导入预设文件异常: ${error.message}`, 'error');
    }
}

/**
 * 处理打开预设目录
 */
async handleOpenPresetsFolder() {
    try {
        this.log('📂 准备打开预设目录...', 'info');

        // 获取预设目录路径
        const presetsDir = this.getPresetsBaseFolderPath();

        if (presetsDir) {
            // 使用系统默认程序打开文件夹
            if (window.cep && window.cep.util) {
                window.cep.util.openURLInDefaultBrowser(`file:///${presetsDir.replace(/\\/g, '/')}`);
                this.log(`✅ 已打开预设目录: ${presetsDir}`, 'success');
            } else {
                this.log('⚠️ CEP工具不可用，无法打开文件夹', 'warning');
                this.showNotification('⚠️ 无法打开预设目录', 'warning');
            }
        } else {
            this.log('❌ 未设置预设目录', 'error');
            this.showNotification('❌ 未设置预设目录', 'error');
        }

    } catch (error) {
        this.log(`打开预设目录失败: ${error.message}`, 'error');
        this.showNotification(`打开预设目录失败: ${error.message}`, 'error');
    }
}

/**
 * 处理选择预设目录
 */
async handleChoosePresetsFolder() {
    try {
        this.log('📁 准备选择预设目录...', 'info');

        // 使用文件夹选择器选择目录
        const folderResult = await this.showFolderPicker();

        if (folderResult && folderResult.success && folderResult.folderPath) {
            const folderPath = folderResult.folderPath;

            // 验证文件夹路径
            if (!folderPath || folderPath.trim() === '') {
                this.log('❌ 选择了无效的文件夹路径', 'error');
                this.showNotification('❌ 选择了无效的文件夹路径', 'error');
                return;
            }

            // 保存预设目录设置
            const saveResult = this.settingsManager.updatePreference('presetsDirectory', folderPath);

            if (saveResult && saveResult.success) {
                this.log(`✅ 预设目录已设置为: ${folderPath}`, 'success');
                this.showNotification('✅ 预设目录已设置', 'success');

                // 更新预设文件按钮提示
                this.updatePresetFileButtonsTooltip();
            } else {
                const errorMsg = saveResult && saveResult.error ? saveResult.error : '未知错误';
                this.log(`❌ 保存预设目录设置失败: ${errorMsg}`, 'error');
                this.showNotification(`❌ 保存预设目录设置失败: ${errorMsg}`, 'error');
            }

        } else if (folderResult && !folderResult.success) {
            const errorMsg = folderResult.error || '用户取消了文件夹选择';
            this.log(`❌ 选择预设目录失败: ${errorMsg}`, 'warning');
            // 用户取消时不显示错误提示
            if (errorMsg !== '用户取消了文件夹选择') {
                this.showNotification(`❌ 选择预设目录失败: ${errorMsg}`, 'error');
            }
        }

    } catch (error) {
        this.log(`选择预设目录异常: ${error.message}`, 'error');
        this.showNotification(`选择预设目录异常: ${error.message}`, 'error');
    }
}
```

### 操作按钮事件处理

```javascript
/**
 * 处理保存设置
 */
handleSaveSettings() {
    this.log('💾 手动保存设置...', 'info');

    // 从UI保存设置
    const saveResult = this.saveSettingsFromUI(true);

    if (saveResult.success) {
        this.log('✅ 设置已手动保存', 'success');
        this.showNotification('✅ 设置已手动保存', 'success');
    } else {
        const errorMsg = saveResult.error || '未知错误';
        this.log(`❌ 手动保存设置失败: ${errorMsg}`, 'error');
        this.showNotification(`❌ 手动保存设置失败: ${errorMsg}`, 'error');
    }
}

/**
 * 处理重置设置
 */
handleResetSettings() {
    try {
        this.log('🔄 准备重置设置...', 'info');

        // 显示确认对话框
        const confirmReset = confirm('确定要重置所有设置到默认值吗？\n这将清除所有自定义配置。');
        
        if (!confirmReset) {
            this.log('用户取消了重置操作', 'info');
            return;
        }

        // 重置设置管理器
        const resetResult = this.settingsManager.resetSettings();

        if (resetResult.success) {
            this.log('✅ 设置已重置为默认值', 'success');
            this.showNotification('✅ 设置已重置为默认值', 'success');

            // 重新加载设置到UI
            this.loadSettingsToUI();
            this.updateSettingsUI();
        } else {
            const errorMsg = resetResult.error || '未知错误';
            this.log(`❌ 重置设置失败: ${errorMsg}`, 'error');
            this.showNotification(`❌ 重置设置失败: ${errorMsg}`, 'error');
        }

    } catch (error) {
        this.log(`重置设置异常: ${error.message}`, 'error');
        this.showNotification(`重置设置异常: ${error.message}`, 'error');
    }
}

/**
 * 显示设置面板
 */
show() {
    try {
        const settingsPanel = document.getElementById('settings-panel');
        if (!settingsPanel) {
            this.log('❌ 未找到设置面板元素', 'error');
            return;
        }

        // 显示面板
        settingsPanel.style.display = 'flex';
        this.isVisible = true;

        // 加载设置到UI
        this.loadSettingsToUI();

        // 触发显示事件
        this.emit('shown', { panelId: this.panelId });

        this.log('⚙️ 高级设置面板已显示', 'debug');

    } catch (error) {
        this.log(`显示设置面板失败: ${error.message}`, 'error');
    }
}

/**
 * 隐藏设置面板
 */
hide() {
    try {
        const settingsPanel = document.getElementById('settings-panel');
        if (!settingsPanel) {
            this.log('❌ 未找到设置面板元素', 'error');
            return;
        }

        // 隐藏面板
        settingsPanel.style.display = 'none';
        this.isVisible = false;

        // 触发隐藏事件
        this.emit('hidden', { panelId: this.panelId });

        this.log('⚙️ 高级设置面板已隐藏', 'debug');

    } catch (error) {
        this.log(`隐藏设置面板失败: ${error.message}`, 'error');
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
 * 负责管理AE扩展的所有设置，支持面板特定配置和实时同步
 */
class SettingsManager
```

#### constructor()
构造函数

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

#### savePreference()
保存用户偏好到本地存储

```javascript
/**
 * 保存用户偏好到本地存储
 * @param {string} key - 偏好键
 * @param {*} value - 偏好值
 * @param {boolean} silent - 是否静默保存（不触发事件）
 * @returns {Object} 保存结果
 */
savePreference(key, value, silent = false)
```

#### getPreference()
获取用户偏好值

```javascript
/**
 * 获取用户偏好值
 * @param {string} key - 偏好键
 * @returns {*} 偏好值
 */
getPreference(key)
```

#### resetSettings()
重置设置为默认值

```javascript
/**
 * 重置设置为默认值
 * @returns {Object} 重置结果
 */
resetSettings()
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

console.log(`⏱️ 设置更新耗时: ${endTime - startTime}ms`);

// 分析设置保存性能
async function analyzeSavePerformance() {
    const startTime = performance.now();
    const settings = settingsManager.getSettings();
    const saveResult = await settingsManager.saveSettings(settings);
    const endTime = performance.now();
    
    console.log(`⏱️ 设置保存耗时: ${endTime - startTime}ms`);
    console.log('保存结果:', saveResult);
}
```

## 扩展性

### 自定义扩展

#### 扩展设置管理器
```javascript
// 创建自定义设置管理器类
class CustomSettingsManager extends SettingsManager {
    constructor(panelId) {
        super(panelId);
        this.customFeatures = new Map();
    }
    
    /**
     * 注册自定义功能
     * @param {string} name - 功能名称
     * @param {Function} feature - 功能实现
     */
    registerCustomFeature(name, feature) {
        this.customFeatures.set(name, feature);
    }
    
    /**
     * 执行自定义功能
     * @param {string} name - 功能名称
     * @param {...any} args - 参数
     * @returns {any} 功能执行结果
     */
    executeCustomFeature(name, ...args) {
        const feature = this.customFeatures.get(name);
        if (feature && typeof feature === 'function') {
            return feature(...args);
        }
        throw new Error(`未知的自定义功能: ${name}`);
    }
}
```

#### 插件化架构
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