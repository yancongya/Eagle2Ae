# 预设管理系统

## 概述

预设管理系统（Preset Management System）是 Eagle2Ae AE 扩展 v2.4.0 引入的核心功能模块，为每个面板实例提供独立的预设文件管理。该系统支持预设文件的创建、保存、加载、导出、导入和备份恢复等功能，确保多面板实例间配置的独立性和一致性。

## 核心特性

### 面板特定预设文件
- 每个面板实例拥有独立的预设文件（Eagle2Ae1.Presets, Eagle2Ae2.Presets, Eagle2Ae3.Presets）
- 预设文件包含导入设置、用户偏好、UI设置等完整配置
- 支持预设文件的版本管理和兼容性处理

### 智能文件管理
- 自动创建预设目录和文件
- 支持预设文件的导出和导入
- 提供预设文件的备份和恢复功能

### 实时同步机制
- 配置变更时自动保存到预设文件
- 支持预设文件的实时加载和应用
- 提供预设文件变更监听和通知

### 版本兼容性
- 支持预设文件格式的向前和向后兼容
- 提供预设文件迁移机制
- 自动处理旧版本预设文件的升级

## 技术实现

### 核心类结构

```javascript
/**
 * 预设管理系统
 * 负责管理每个面板实例的预设文件，支持导出导入和备份恢复
 */
class PresetManager {
    /**
     * 构造函数
     * @param {Object} aeExtension - AE扩展实例
     */
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.csInterface = aeExtension.csInterface;
        this.settingsManager = aeExtension.settingsManager;
        this.logManager = aeExtension.logManager;
        
        // 获取面板ID
        this.panelId = this.getPanelId();
        
        // 初始化状态
        this.presetsDirectory = null;
        this.presetsFileName = this.getPresetFileName();
        this.isSaving = false;
        this.saveQueue = [];
        
        // 绑定方法上下文
        this.loadPresetsFromDisk = this.loadPresetsFromDisk.bind(this);
        this.savePresetsSilently = this.savePresetsSilently.bind(this);
        this.exportPresetsToFile = this.exportPresetsToFile.bind(this);
        this.importPresetsFromFile = this.importPresetsFromFile.bind(this);
        this.backupPresets = this.backupPresets.bind(this);
        this.restorePresets = this.restorePresets.bind(this);
        
        this.log(`💾 预设管理系统已为面板 ${this.panelId} 初始化`, 'debug');
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

### 预设文件名生成实现

```javascript
/**
 * 获取当前面板的预设文件名
 * @returns {string} 'Eagle2Ae1.Presets', 'Eagle2Ae2.Presets', 或 'Eagle2Ae3.Presets'
 */
getPresetFileName() {
    const panelNumber = this.panelId.replace('panel', '');
    return `Eagle2Ae${panelNumber}.Presets`;
}

/**
 * 获取预设文件完整路径
 * @returns {string} 预设文件完整路径
 */
getPresetsFilePath() {
    const baseFolder = this.getPresetsBaseFolderPath();
    const fileName = this.getPresetFileName();

    if (baseFolder) {
        // 用户自定义目录
        return `${baseFolder}\\${fileName}`;
    } else {
        // 默认目录
        if (window.require) {
            const path = window.require('path');
            const os = window.require('os');
            const documentsPath = path.join(os.homedir(), 'Documents');
            return path.join(documentsPath, 'Eagle2Ae-Ae', 'presets', fileName);
        } else {
            // 降级方案
            return `我的文档\\Eagle2Ae-Ae\\presets\\${fileName}`;
        }
    }
}
```

### 预设目录管理实现

```javascript
/**
 * 获取预设目录基础路径
 * @returns {string|null} 预设目录路径或null
 */
getPresetsBaseFolderPath() {
    try {
        if (this.settingsManager && typeof this.settingsManager.getPreference === 'function') {
            const p = this.settingsManager.getPreference('presetsDirectory');
            if (p && typeof p === 'string' && p.trim() !== '') return p;
        }
    } catch (e) {
        this.log(`⚠️ 获取预设目录失败：${e.message}`, 'warning');
    }
    return null;
}

/**
 * 确保预设目录已准备就绪
 * @returns {Promise<void>}
 */
async ensurePresetsFolderReady() {
    // Demo 模式：虚拟文件系统不需要创建目录
    if (window.__DEMO_MODE_ACTIVE__) {
        this.log('📁 Demo 模式：使用虚拟文件系统', 'info');
        return;
    }

    try {
        const params = {};
        const base = this.getPresetsBaseFolderPath();
        if (base) {
            params.baseFolderFsPath = base;
        } else {
            params.targetSubFolder = 'Eagle2Ae-Ae\\presets';
        }
        const result = await this.executeExtendScript('ensurePresetsFolder', params);
        if (result && result.success) {
            this.log(`📁 预设目录就绪：${result.folderPath}`, 'info');
        } else {
            const msg = result && result.error ? result.error : '未知错误';
            this.log(`⚠️ 创建预设目录失败：${msg}`, 'warning');
        }
    } catch (e) {
        this.log(`⚠️ ${(window.i18n?.getText('logs.ensurePresetDirErrorPrefix') || 'Ensure preset directory error:')} ${e.message}`, 'warning');
    }
}
```

### 预设加载实现

```javascript
/**
 * 从磁盘加载预设
 * @returns {Promise<void>}
 */
async loadPresetsFromDisk() {
    try {
        const fileName = this.getPresetFileName();
        this.log(`🔍 尝试加载预设文件: ${fileName}`, 'info');
        this.log(window.i18n?.getText('logs.tryingToLoadLocalPresets') || 'Trying to load local presets...', 'info');

        let parsed = null;

        // Demo 模式：从虚拟文件系统加载
        if (window.__DEMO_MODE_ACTIVE__) {
            try {
                let content = null;

                // 尝试从虚拟文件系统读取
                if (window.demoFileSystem) {
                    // 使用面板特定的文件名
                    const demoFileName = `Eagle2Ae-Ae/presets/${this.getPresetFileName()}`;
                    const result = window.demoFileSystem.readFile(demoFileName);
                    if (result.success) {
                        content = result.content;
                        this.log(`✅ 从虚拟文件系统加载预设 (${result.size} bytes)`, 'info');
                    }
                }

                // 降级：从 localStorage 读取
                if (!content) {
                    content = localStorage.getItem('eagle2ae_preset_json');
                    if (content) {
                        this.log('✅ 从浏览器存储加载预设 (Demo 模式)', 'info');
                    }
                }

                if (content) {
                    parsed = JSON.parse(content);
                } else {
                    this.log('ℹ️ Demo 模式：未找到保存的预设', 'info');

                    // 如果预设文件不存在，创建默认预设文件
                    const fileNameToCreate = this.getPresetFileName();
                    this.log(`📝 预设文件不存在，正在创建: ${fileNameToCreate}`, 'info');
                    const saveResult = await this.savePresetsSilently();
                    
                    if (saveResult) {
                        this.log(`✅ 默认预设文件已创建: ${this.getPresetFileName()}`, 'success');
                        // 应用默认配置到界面
                        try {
                            const quickSettingsContainer = document.querySelector('.quick-settings-container');
                            if (quickSettingsContainer) {
                                this.updateSettingsUI();
                                this.loadQuickSettings();
                            } else {
                                this.log('⚠️ DOM 未就绪，跳过 UI 更新', 'warning');
                            }
                        } catch (uiError) {
                            this.log(`⚠️ UI 更新失败: ${uiError.message}`, 'warning');
                        }
                    } else {
                        this.log(`⚠️ 创建默认预设文件失败`, 'warning');
                    }
                    return;
                }
            } catch (e) {
                this.log(`⚠️ Demo 模式加载预设失败: ${e.message}`, 'warning');
                return;
            }
        } else {
            // CEP 模式：从文件系统加载
            // 使用面板特定的文件名
            const params = { fileName: this.getPresetFileName() };
            const baseFolder = this.getPresetsBaseFolderPath();
            if (baseFolder) {
                params.baseFolderFsPath = baseFolder;
            } else {
                params.targetSubFolder = 'Eagle2Ae-Ae\\presets';
            }
            const result = await this.executeExtendScript('readImportSettingsFromJSON', params);

            if (!result || !result.success) {
                const msg = result && result.error ? result.error : '未找到预设文件';
                this.log(`ℹ️ 本地预设不可用：${msg}`, 'info');

                // 如果预设文件不存在，创建默认预设文件
                const fileNameToCreate = this.getPresetFileName();
                this.log(`📝 预设文件不存在，正在创建: ${fileNameToCreate}`, 'info');
                const saveResult = await this.savePresetsSilently();
                
                if (saveResult) {
                    this.log(`✅ 默认预设文件已创建: ${this.getPresetFileName()}`, 'success');
                    // 应用默认配置到界面
                    try {
                        const quickSettingsContainer = document.querySelector('.quick-settings-container');
                        if (quickSettingsContainer) {
                            this.updateSettingsUI();
                            this.loadQuickSettings();
                        } else {
                            this.log('⚠️ DOM 未就绪，跳过 UI 更新', 'warning');
                        }
                    } catch (uiError) {
                        this.log(`⚠️ UI 更新失败: ${uiError.message}`, 'warning');
                    }
                } else {
                    this.log(`⚠️ 创建默认预设文件失败`, 'warning');
                }
                return;
            }

            // 解析 JSON
            parsed = typeof result.jsonData === 'string' ? JSON.parse(result.jsonData) : result.jsonData;
        }

        // 应用配置到设置管理器
        if (parsed && parsed.importSettings) {
            this.settingsManager.saveSettings(parsed.importSettings);
        }

        // 应用用户偏好
        if (parsed && parsed.userPreferences) {
            this.settingsManager.savePreferences(parsed.userPreferences);
        }

        // 应用 UI 面板组设置
        if (parsed && parsed.uiSettings) {
            try {
                this.setPanelLocalStorage('uiSettings', JSON.stringify(parsed.uiSettings));
                this.log('✅ 已恢复 UI 面板组设置', 'info');
            } catch (e) {
                console.warn('无法保存 uiSettings:', e);
            }
        }

        // 应用语言设置
        if (parsed && parsed.language) {
            try {
                localStorage.setItem('language', parsed.language);
                localStorage.setItem('lang', parsed.language);
                // 如果 i18n 系统已加载，切换语言
                if (window.i18n && typeof window.i18n.setLanguage === 'function') {
                    window.i18n.setLanguage(parsed.language);
                }
                this.log(`✅ 已恢复语言设置: ${parsed.language}`, 'info');
            } catch (e) {
                console.warn('无法应用语言设置:', e);
            }
        }

        // 应用主题设置
        if (parsed && parsed.userPreferences && parsed.userPreferences.theme) {
            try {
                this.setPanelLocalStorage('aeTheme', parsed.userPreferences.theme);
                // 如果主题切换函数存在，应用主题
                if (typeof this.applyTheme === 'function') {
                    this.applyTheme(parsed.userPreferences.theme);
                }
                this.log(`✅ 已恢复主题设置: ${parsed.userPreferences.theme}`, 'info');
            } catch (e) {
                console.warn('无法应用主题设置:', e);
            }
        }

        // 应用项目旁设置
        if (parsed && parsed.projectAdjacentSettings) {
            try {
                localStorage.setItem('ae_extension_project_adjacent_settings', JSON.stringify(parsed.projectAdjacentSettings));
                this.log('✅ 已恢复项目旁复制设置', 'info');
            } catch (e) {
                console.warn('无法保存项目旁设置:', e);
            }
        }

        // 应用自定义文件夹设置
        if (parsed && parsed.customFolderSettings) {
            try {
                localStorage.setItem('ae_extension_custom_folder_settings', JSON.stringify(parsed.customFolderSettings));
                this.log('✅ 已恢复自定义文件夹设置', 'info');
            } catch (e) {
                console.warn('无法保存自定义文件夹设置:', e);
            }
        }

        // 应用到UI
        try {
            // 检查关键 DOM 元素是否存在
            const quickSettingsContainer = document.querySelector('.quick-settings-container');
            if (quickSettingsContainer) {
                this.updateSettingsUI();
                this.loadQuickSettings();
                this.log('✅ 已加载并应用本地预设（包含 UI 设置、语言、主题等）', 'success');
            } else {
                this.log('⚠️ DOM 未就绪，跳过 UI 更新（配置已加载到内存）', 'warning');
            }
        } catch (uiError) {
            this.log(`⚠️ UI 更新失败: ${uiError.message}`, 'warning');
        }

    } catch (error) {
        this.log(`${window.i18n?.getText('logs.loadLocalPresetsFailedPrefix') || 'Failed to load local presets:'} ${error.message}`, 'warning');
    }
}
```

### 预设保存实现

```javascript
/**
 * 静默保存预设到JSON（无弹窗与打开文件夹）
 * @returns {Promise<boolean>} 是否保存成功
 */
async savePresetsSilently() {
    try {
        const fileName = this.getPresetFileName();
        this.log(`💾 准备保存预设到文件: ${fileName}`, 'info');
        
        const settings = this.settingsManager.getSettings();
        const preferences = this.settingsManager.getPreferences();

        // 收集所有配置
        const exportPayload = {
            importSettings: settings,
            userPreferences: preferences,
            uiSettings: this.getUISettingsFromLocalStorage(),
            exportedAt: new Date().toISOString()
        };

        // Demo 模式：保存到虚拟文件系统
        if (window.__DEMO_MODE_ACTIVE__) {
            try {
                const jsonContent = JSON.stringify(exportPayload, null, 2);

                // 保存到虚拟文件系统
                if (window.demoFileSystem) {
                    // 使用面板特定的文件名
                    const demoFileName = `Eagle2Ae-Ae/presets/${this.getPresetFileName()}`;
                    const result = window.demoFileSystem.writeFile(
                        demoFileName,
                        jsonContent
                    );

                    if (result.success) {
                        this.log(`💾 预设已保存到虚拟文件系统 (${result.size} bytes)`, 'info');
                        return true;
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    // 降级：保存到 localStorage
                    localStorage.setItem('eagle2ae_preset_json', jsonContent);
                    this.log('💾 预设已保存到浏览器存储 (Demo 模式)', 'info');
                    return true;
                }
            } catch (e) {
                this.log(`⚠️ Demo 模式保存预设失败: ${e.message}`, 'warning');
                return false;
            }
        }

        // CEP 模式：保存到文件系统
        // 使用面板特定的文件名
        const params = {
            fileName: this.getPresetFileName(),
            overwrite: true,
            jsonData: JSON.stringify(exportPayload, null, 2)
        };
        const baseFolder = this.getPresetsBaseFolderPath();
        if (baseFolder) {
            params.baseFolderFsPath = baseFolder;
        } else {
            params.targetSubFolder = 'Eagle2Ae-Ae\\presets';
        }

        const result = await this.executeExtendScript('exportImportSettingsToJSON', params);
        if (result && result.success) {
            this.log('💾 预设已自动保存到文档目录', 'info');
            return true;
        } else {
            const msg = result && result.error ? result.error : '未知错误';
            this.log(`⚠️ 自动保存预设失败: ${msg}`, 'warning');
            return false;
        }
    } catch (error) {
        this.log(`⚠️ 自动保存预设异常: ${error.message}`, 'warning');
        return false;
    }
}
```

### 预设导出实现

```javascript
/**
 * 导出预设到文件
 * @param {string} fileName - 文件名
 * @returns {Promise<boolean>} 是否导出成功
 */
async exportPresetsToFile(fileName = null) {
    try {
        const exportFileName = fileName || this.getPresetFileName();
        this.log(`📤 准备导出预设到文件: ${exportFileName}`, 'info');

        // 获取当前设置
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

        // Demo 模式：使用虚拟文件系统导出
        if (window.__DEMO_MODE_ACTIVE__) {
            try {
                const jsonContent = JSON.stringify(exportData, null, 2);

                if (window.demoFileSystem) {
                    // 使用虚拟下载功能
                    const demoFileName = `Eagle2Ae-Ae/presets/${exportFileName}`;
                    const result = window.demoFileSystem.downloadFile(
                        demoFileName,
                        exportFileName,
                        jsonContent
                    );

                    if (result.success) {
                        this.log(`📤 预设已导出到虚拟文件系统: ${exportFileName}`, 'success');
                        return true;
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    // 降级：使用浏览器下载
                    const blob = new Blob([jsonContent], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = exportFileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    URL.revokeObjectURL(url);
                    
                    this.log(`📤 预设已通过浏览器下载: ${exportFileName}`, 'success');
                    return true;
                }
            } catch (e) {
                this.log(`⚠️ Demo 模式导出预设失败: ${e.message}`, 'warning');
                return false;
            }
        }

        // CEP 模式：使用ExtendScript导出
        const params = {
            fileName: exportFileName,
            overwrite: true,
            jsonData: JSON.stringify(exportData, null, 2)
        };

        const baseFolder = this.getPresetsBaseFolderPath();
        if (baseFolder) {
            params.baseFolderFsPath = baseFolder;
        } else {
            params.targetSubFolder = 'Eagle2Ae-Ae\\presets';
        }

        const result = await this.executeExtendScript('exportImportSettingsToJSON', params);
        if (result && result.success) {
            this.log(`📤 预设已导出到文件: ${result.savedPath}`, 'success');
            
            // 显示成功提示
            this.showDropMessage(`✅ 预设已导出: ${exportFileName}`, 'success');
            
            return true;
        } else {
            const errorMsg = result && result.error ? result.error : '未知错误';
            this.log(`⚠️ 导出预设失败: ${errorMsg}`, 'error');
            
            // 显示错误提示
            this.showDropMessage(`❌ 预设导出失败: ${errorMsg}`, 'error');
            
            return false;
        }

    } catch (error) {
        this.log(`❌ 导出预设异常: ${error.message}`, 'error');
        this.showDropMessage(`❌ 导出预设异常: ${error.message}`, 'error');
        return false;
    }
}
```

### 预设导入实现

```javascript
/**
 * 从文件导入预设
 * @param {string} filePath - 文件路径
 * @returns {Promise<boolean>} 是否导入成功
 */
async importPresetsFromFile(filePath = null) {
    try {
        this.log('📥 准备从文件导入预设', 'info');

        let importFilePath = filePath;

        // 如果没有提供文件路径，让用户选择文件
        if (!importFilePath) {
            if (window.__DEMO_MODE_ACTIVE__) {
                // Demo 模式：使用虚拟文件选择
                if (window.demoFileSystem) {
                    const result = window.demoFileSystem.showOpenDialog({
                        title: '选择预设文件',
                        filters: [{ name: 'JSON Files', extensions: ['json'] }],
                        properties: ['openFile']
                    });

                    if (result.success && result.filePaths && result.filePaths.length > 0) {
                        importFilePath = result.filePaths[0];
                    } else {
                        this.log('用户取消了文件选择', 'info');
                        return false;
                    }
                } else {
                    // 降级：使用简单的输入框
                    importFilePath = prompt('请输入预设文件路径:');
                    if (!importFilePath) {
                        this.log('用户取消了文件输入', 'info');
                        return false;
                    }
                }
            } else {
                // CEP 模式：使用文件选择对话框
                const result = await this.executeExtendScript('showOpenPresetsFileDialog', {});
                
                if (result && result.success && result.filePath) {
                    importFilePath = result.filePath;
                } else {
                    const errorMsg = result && result.error ? result.error : '用户取消了文件选择';
                    this.log(`❌ 文件选择失败: ${errorMsg}`, 'warning');
                    return false;
                }
            }
        }

        if (!importFilePath) {
            this.log('❌ 未提供有效的预设文件路径', 'error');
            return false;
        }

        this.log(`📥 正在导入预设文件: ${importFilePath}`, 'info');

        let fileContent = null;

        // 读取文件内容
        if (window.__DEMO_MODE_ACTIVE__) {
            // Demo 模式：从虚拟文件系统读取
            if (window.demoFileSystem) {
                const result = window.demoFileSystem.readFile(importFilePath);
                
                if (result.success) {
                    fileContent = result.content;
                    this.log(`📥 从虚拟文件系统读取预设 (${result.size} bytes)`, 'info');
                } else {
                    throw new Error(result.error);
                }
            } else {
                // 降级：从 localStorage 读取
                fileContent = localStorage.getItem('eagle2ae_import_preset_json');
                if (fileContent) {
                    this.log('📥 从浏览器存储读取预设 (Demo 模式)', 'info');
                } else {
                    throw new Error('未找到预设文件内容');
                }
            }
        } else {
            // CEP 模式：从文件系统读取
            const params = { filePath: importFilePath };
            const result = await this.executeExtendScript('readImportSettingsFromFile', params);
            
            if (result && result.success && result.fileContent) {
                fileContent = result.fileContent;
                this.log(`📥 从文件系统读取预设 (${result.fileSize} bytes)`, 'info');
            } else {
                const errorMsg = result && result.error ? result.error : '读取文件失败';
                throw new Error(errorMsg);
            }
        }

        if (!fileContent) {
            throw new Error('无法读取预设文件内容');
        }

        // 解析JSON内容
        let parsedData;
        try {
            parsedData = JSON.parse(fileContent);
        } catch (parseError) {
            throw new Error(`JSON解析失败: ${parseError.message}`);
        }

        // 验证预设数据
        if (!this.validatePresetData(parsedData)) {
            throw new Error('预设文件格式无效');
        }

        // 应用导入的预设
        const applyResult = await this.applyImportedPresets(parsedData);

        if (applyResult.success) {
            this.log('✅ 预设导入成功', 'success');
            this.showDropMessage('✅ 预设导入成功', 'success');
            
            // 刷新UI
            this.updateSettingsUI();
            this.loadQuickSettings();
            
            return true;
        } else {
            throw new Error(applyResult.error || '应用预设失败');
        }

    } catch (error) {
        this.log(`❌ 导入预设失败: ${error.message}`, 'error');
        this.showDropMessage(`❌ 导入预设失败: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 验证预设数据
 * @param {Object} data - 预设数据
 * @returns {boolean} 是否有效
 */
validatePresetData(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }

    // 检查必需字段
    const requiredFields = ['importSettings', 'userPreferences'];
    for (const field of requiredFields) {
        if (!data.hasOwnProperty(field)) {
            this.log(`❌ 预设数据缺少必需字段: ${field}`, 'error');
            return false;
        }
    }

    // 验证导入设置
    if (data.importSettings && typeof data.importSettings !== 'object') {
        this.log('❌ 导入设置格式无效', 'error');
        return false;
    }

    // 验证用户偏好
    if (data.userPreferences && typeof data.userPreferences !== 'object') {
        this.log('❌ 用户偏好格式无效', 'error');
        return false;
    }

    return true;
}

/**
 * 应用导入的预设
 * @param {Object} presetData - 预设数据
 * @returns {Object} 应用结果
 */
async applyImportedPresets(presetData) {
    try {
        const { importSettings, userPreferences, uiSettings, language } = presetData;

        // 应用导入设置
        if (importSettings) {
            const settingsResult = this.settingsManager.saveSettings(importSettings);
            if (!settingsResult.success) {
                throw new Error(`应用导入设置失败: ${settingsResult.error}`);
            }
            this.log('✅ 导入设置已应用', 'success');
        }

        // 应用用户偏好
        if (userPreferences) {
            const prefsResult = this.settingsManager.savePreferences(userPreferences);
            if (!prefsResult.success) {
                throw new Error(`应用用户偏好失败: ${prefsResult.error}`);
            }
            this.log('✅ 用户偏好已应用', 'success');
        }

        // 应用UI设置
        if (uiSettings) {
            try {
                this.setPanelLocalStorage('uiSettings', JSON.stringify(uiSettings));
                this.log('✅ UI设置已应用', 'success');
            } catch (e) {
                this.log(`⚠️ 应用UI设置失败: ${e.message}`, 'warning');
            }
        }

        // 应用语言设置
        if (language) {
            try {
                localStorage.setItem('language', language);
                localStorage.setItem('lang', language);
                
                // 如果i18n系统可用，更新语言
                if (window.i18n && typeof window.i18n.setLanguage === 'function') {
                    window.i18n.setLanguage(language);
                }
                
                this.log(`✅ 语言设置已应用: ${language}`, 'success');
            } catch (e) {
                this.log(`⚠️ 应用语言设置失败: ${e.message}`, 'warning');
            }
        }

        return { success: true };

    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

### 预设备份实现

```javascript
/**
 * 备份预设文件
 * @param {string} backupName - 备份名称
 * @returns {Promise<boolean>} 是否备份成功
 */
async backupPresets(backupName = null) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_');
        const backupFileName = backupName || `Eagle2Ae-${this.panelId}-backup-${timestamp}.json`;
        
        this.log(`🔒 准备备份预设到文件: ${backupFileName}`, 'info');

        // 获取当前设置
        const settings = this.settingsManager.getSettings();
        const preferences = this.settingsManager.getPreferences();

        // 构造备份数据
        const backupData = {
            version: '2.4.0',
            backedUpAt: new Date().toISOString(),
            panelId: this.panelId,
            importSettings: settings,
            userPreferences: preferences,
            uiSettings: this.getUISettingsFromLocalStorage(),
            language: localStorage.getItem('language') || 'zh-CN',
            backupType: 'manual'
        };

        // Demo 模式：保存到虚拟文件系统
        if (window.__DEMO_MODE_ACTIVE__) {
            try {
                const jsonContent = JSON.stringify(backupData, null, 2);

                if (window.demoFileSystem) {
                    // 保存到备份目录
                    const backupDir = 'Eagle2Ae-Ae/backups';
                    const backupPath = `${backupDir}/${backupFileName}`;
                    
                    const result = window.demoFileSystem.writeFile(backupPath, jsonContent);
                    
                    if (result.success) {
                        this.log(`🔒 预设已备份到虚拟文件系统: ${backupFileName}`, 'success');
                        return true;
                    } else {
                        throw new Error(result.error);
                    }
                } else {
                    // 降级：保存到 localStorage
                    const backupKey = `eagle2ae_backup_${timestamp}`;
                    localStorage.setItem(backupKey, jsonContent);
                    this.log(`🔒 预设已备份到浏览器存储: ${backupKey}`, 'success');
                    return true;
                }
            } catch (e) {
                this.log(`⚠️ Demo 模式备份预设失败: ${e.message}`, 'warning');
                return false;
            }
        }

        // CEP 模式：保存到备份目录
        const params = {
            fileName: backupFileName,
            overwrite: true,
            jsonData: JSON.stringify(backupData, null, 2)
        };

        // 使用备份目录
        params.targetSubFolder = 'Eagle2Ae-Ae\\backups';

        const result = await this.executeExtendScript('exportImportSettingsToJSON', params);
        if (result && result.success) {
            this.log(`🔒 预设已备份到文件: ${result.savedPath}`, 'success');
            this.showDropMessage(`✅ 预设已备份: ${backupFileName}`, 'success');
            return true;
        } else {
            const errorMsg = result && result.error ? result.error : '未知错误';
            this.log(`⚠️ 备份预设失败: ${errorMsg}`, 'error');
            this.showDropMessage(`❌ 预设备份失败: ${errorMsg}`, 'error');
            return false;
        }

    } catch (error) {
        this.log(`❌ 备份预设异常: ${error.message}`, 'error');
        this.showDropMessage(`❌ 备份预设异常: ${error.message}`, 'error');
        return false;
    }
}
```

### 预设恢复实现

```javascript
/**
 * 恢复预设文件
 * @param {string} backupFilePath - 备份文件路径
 * @returns {Promise<boolean>} 是否恢复成功
 */
async restorePresets(backupFilePath = null) {
    try {
        this.log('🔓 准备从备份恢复预设', 'info');

        let restoreFilePath = backupFilePath;

        // 如果没有提供备份文件路径，让用户选择
        if (!restoreFilePath) {
            if (window.__DEMO_MODE_ACTIVE__) {
                // Demo 模式：使用虚拟文件选择
                if (window.demoFileSystem) {
                    const result = window.demoFileSystem.showOpenDialog({
                        title: '选择备份文件',
                        filters: [{ name: 'JSON Files', extensions: ['json'] }],
                        properties: ['openFile']
                    });

                    if (result.success && result.filePaths && result.filePaths.length > 0) {
                        restoreFilePath = result.filePaths[0];
                    } else {
                        this.log('用户取消了备份文件选择', 'info');
                        return false;
                    }
                } else {
                    // 降级：使用简单的输入框
                    restoreFilePath = prompt('请输入备份文件路径:');
                    if (!restoreFilePath) {
                        this.log('用户取消了备份文件输入', 'info');
                        return false;
                    }
                }
            } else {
                // CEP 模式：使用文件选择对话框
                const result = await this.executeExtendScript('showOpenBackupFileDialog', {});
                
                if (result && result.success && result.filePath) {
                    restoreFilePath = result.filePath;
                } else {
                    const errorMsg = result && result.error ? result.error : '用户取消了备份文件选择';
                    this.log(`❌ 备份文件选择失败: ${errorMsg}`, 'warning');
                    return false;
                }
            }
        }

        if (!restoreFilePath) {
            this.log('❌ 未提供有效的备份文件路径', 'error');
            return false;
        }

        this.log(`🔓 正在从备份文件恢复预设: ${restoreFilePath}`, 'info');

        let fileContent = null;

        // 读取备份文件内容
        if (window.__DEMO_MODE_ACTIVE__) {
            // Demo 模式：从虚拟文件系统读取
            if (window.demoFileSystem) {
                const result = window.demoFileSystem.readFile(restoreFilePath);
                
                if (result.success) {
                    fileContent = result.content;
                    this.log(`🔓 从虚拟文件系统读取备份 (${result.size} bytes)`, 'info');
                } else {
                    throw new Error(result.error);
                }
            } else {
                // 降级：从 localStorage 读取
                const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('eagle2ae_backup_'));
                if (backupKeys.length > 0) {
                    fileContent = localStorage.getItem(backupKeys[0]);
                    if (fileContent) {
                        this.log('🔓 从浏览器存储读取备份 (Demo 模式)', 'info');
                    } else {
                        throw new Error('未找到备份文件内容');
                    }
                } else {
                    throw new Error('未找到任何备份');
                }
            }
        } else {
            // CEP 模式：从文件系统读取
            const params = { filePath: restoreFilePath };
            const result = await this.executeExtendScript('readImportSettingsFromFile', params);
            
            if (result && result.success && result.fileContent) {
                fileContent = result.fileContent;
                this.log(`🔓 从文件系统读取备份 (${result.fileSize} bytes)`, 'info');
            } else {
                const errorMsg = result && result.error ? result.error : '读取备份文件失败';
                throw new Error(errorMsg);
            }
        }

        if (!fileContent) {
            throw new Error('无法读取备份文件内容');
        }

        // 解析JSON内容
        let parsedData;
        try {
            parsedData = JSON.parse(fileContent);
        } catch (parseError) {
            throw new Error(`JSON解析失败: ${parseError.message}`);
        }

        // 验证备份数据
        if (!this.validateBackupData(parsedData)) {
            throw new Error('备份文件格式无效');
        }

        // 确认恢复操作
        const confirmRestore = confirm(`确定要从备份 "${restoreFilePath}" 恢复预设吗？\n这将覆盖当前的所有设置。`);
        if (!confirmRestore) {
            this.log('用户取消了预设恢复操作', 'info');
            return false;
        }

        // 应用恢复的预设
        const applyResult = await this.applyRestoredPresets(parsedData);

        if (applyResult.success) {
            this.log('✅ 预设恢复成功', 'success');
            this.showDropMessage('✅ 预设恢复成功', 'success');
            
            // 刷新UI
            this.updateSettingsUI();
            this.loadQuickSettings();
            
            // 重新加载预设以确保一致性
            await this.loadPresetsFromDisk();
            
            return true;
        } else {
            throw new Error(applyResult.error || '应用恢复的预设失败');
        }

    } catch (error) {
        this.log(`❌ 恢复预设失败: ${error.message}`, 'error');
        this.showDropMessage(`❌ 恢复预设失败: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 验证备份数据
 * @param {Object} data - 备份数据
 * @returns {boolean} 是否有效
 */
validateBackupData(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }

    // 检查必需字段
    const requiredFields = ['importSettings', 'userPreferences', 'backedUpAt'];
    for (const field of requiredFields) {
        if (!data.hasOwnProperty(field)) {
            this.log(`❌ 备份数据缺少必需字段: ${field}`, 'error');
            return false;
        }
    }

    // 验证备份时间戳
    if (data.backedUpAt && isNaN(Date.parse(data.backedUpAt))) {
        this.log('❌ 备份时间戳格式无效', 'error');
        return false;
    }

    // 验证导入设置
    if (data.importSettings && typeof data.importSettings !== 'object') {
        this.log('❌ 导入设置格式无效', 'error');
        return false;
    }

    // 验证用户偏好
    if (data.userPreferences && typeof data.userPreferences !== 'object') {
        this.log('❌ 用户偏好格式无效', 'error');
        return false;
    }

    return true;
}

/**
 * 应用恢复的预设
 * @param {Object} backupData - 备份数据
 * @returns {Object} 应用结果
 */
async applyRestoredPresets(backupData) {
    try {
        const { importSettings, userPreferences, uiSettings, language } = backupData;

        // 应用导入设置
        if (importSettings) {
            const settingsResult = this.settingsManager.saveSettings(importSettings);
            if (!settingsResult.success) {
                throw new Error(`应用导入设置失败: ${settingsResult.error}`);
            }
            this.log('✅ 导入设置已恢复', 'success');
        }

        // 应用用户偏好
        if (userPreferences) {
            const prefsResult = this.settingsManager.savePreferences(userPreferences);
            if (!prefsResult.success) {
                throw new Error(`应用用户偏好失败: ${prefsResult.error}`);
            }
            this.log('✅ 用户偏好已恢复', 'success');
        }

        // 应用UI设置
        if (uiSettings) {
            try {
                this.setPanelLocalStorage('uiSettings', JSON.stringify(uiSettings));
                this.log('✅ UI设置已恢复', 'success');
            } catch (e) {
                this.log(`⚠️ 恢复UI设置失败: ${e.message}`, 'warning');
            }
        }

        // 应用语言设置
        if (language) {
            try {
                localStorage.setItem('language', language);
                localStorage.setItem('lang', language);
                
                // 如果i18n系统可用，更新语言
                if (window.i18n && typeof window.i18n.setLanguage === 'function') {
                    window.i18n.setLanguage(language);
                }
                
                this.log(`✅ 语言设置已恢复: ${language}`, 'success');
            } catch (e) {
                this.log(`⚠️ 恢复语言设置失败: ${e.message}`, 'warning');
            }
        }

        return { success: true };

    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

## API参考

### 核心方法

#### PresetManager
预设管理器主类

```javascript
/**
 * 预设管理器
 * 负责管理每个面板实例的预设文件，支持导出导入和备份恢复
 */
class PresetManager
```

#### 构造函数
```javascript
/**
 * 构造函数
 * @param {Object} aeExtension - AE扩展实例
 */
constructor(aeExtension)
```

#### getPanelId()
获取当前面板ID

```javascript
/**
 * 获取当前面板 ID
 * @returns {string} 'panel1', 'panel2', 或 'panel3'
 */
getPanelId()
```

#### getPresetFileName()
获取当前面板的预设文件名

```javascript
/**
 * 获取当前面板的预设文件名
 * @returns {string} 'Eagle2Ae1.Presets', 'Eagle2Ae2.Presets', 或 'Eagle2Ae3.Presets'
 */
getPresetFileName()
```

#### getPresetsFilePath()
获取预设文件完整路径

```javascript
/**
 * 获取预设文件完整路径
 * @returns {string} 预设文件完整路径
 */
getPresetsFilePath()
```

#### getPresetsBaseFolderPath()
获取预设目录基础路径

```javascript
/**
 * 获取预设目录基础路径
 * @returns {string|null} 预设目录路径或null
 */
getPresetsBaseFolderPath()
```

#### ensurePresetsFolderReady()
确保预设目录已准备就绪

```javascript
/**
 * 确保预设目录已准备就绪
 * @returns {Promise<void>}
 */
async ensurePresetsFolderReady()
```

#### loadPresetsFromDisk()
从磁盘加载预设

```javascript
/**
 * 从磁盘加载预设
 * @returns {Promise<void>}
 */
async loadPresetsFromDisk()
```

#### savePresetsSilently()
静默保存预设到JSON

```javascript
/**
 * 静默保存预设到JSON（无弹窗与打开文件夹）
 * @returns {Promise<boolean>} 是否保存成功
 */
async savePresetsSilently()
```

#### exportPresetsToFile()
导出预设到文件

```javascript
/**
 * 导出预设到文件
 * @param {string} fileName - 文件名
 * @returns {Promise<boolean>} 是否导出成功
 */
async exportPresetsToFile(fileName = null)
```

#### importPresetsFromFile()
从文件导入预设

```javascript
/**
 * 从文件导入预设
 * @param {string} filePath - 文件路径
 * @returns {Promise<boolean>} 是否导入成功
 */
async importPresetsFromFile(filePath = null)
```

#### backupPresets()
备份预设文件

```javascript
/**
 * 备份预设文件
 * @param {string} backupName - 备份名称
 * @returns {Promise<boolean>} 是否备份成功
 */
async backupPresets(backupName = null)
```

#### restorePresets()
恢复预设文件

```javascript
/**
 * 恢复预设文件
 * @param {string} backupFilePath - 备份文件路径
 * @returns {Promise<boolean>} 是否恢复成功
 */
async restorePresets(backupFilePath = null)
```

### 辅助方法

#### validatePresetData()
验证预设数据

```javascript
/**
 * 验证预设数据
 * @param {Object} data - 预设数据
 * @returns {boolean} 是否有效
 */
validatePresetData(data)
```

#### applyImportedPresets()
应用导入的预设

```javascript
/**
 * 应用导入的预设
 * @param {Object} presetData - 预设数据
 * @returns {Object} 应用结果
 */
async applyImportedPresets(presetData)
```

#### validateBackupData()
验证备份数据

```javascript
/**
 * 验证备份数据
 * @param {Object} data - 备份数据
 * @returns {boolean} 是否有效
 */
validateBackupData(data)
```

#### applyRestoredPresets()
应用恢复的预设

```javascript
/**
 * 应用恢复的预设
 * @param {Object} backupData - 备份数据
 * @returns {Object} 应用结果
 */
async applyRestoredPresets(backupData)
```

## 使用示例

### 基本使用

```javascript
// 创建预设管理器实例
const presetManager = new PresetManager(aeExtension);

// 加载预设
await presetManager.loadPresetsFromDisk();

// 保存预设
const saveResult = await presetManager.savePresetsSilently();
if (saveResult) {
    console.log('预设保存成功');
}

// 导出预设
await presetManager.exportPresetsToFile('my-preset.json');

// 导入预设
await presetManager.importPresetsFromFile('imported-preset.json');

// 备份预设
await presetManager.backupPresets('backup-20250930.json');

// 恢复预设
await presetManager.restorePresets('backup-20250930.json');
```

### 高级使用

```javascript
// 自定义预设目录
presetManager.settingsManager.updatePreference('presetsDirectory', '/custom/presets/path');

// 批量操作预设
async function batchPresetOperations() {
    try {
        // 1. 备份当前预设
        await presetManager.backupPresets();
        
        // 2. 修改设置
        presetManager.settingsManager.updateField('mode', 'project_adjacent');
        presetManager.settingsManager.updateField('addToComposition', true);
        
        // 3. 保存修改后的预设
        await presetManager.savePresetsSilently();
        
        // 4. 导出预设文件
        await presetManager.exportPresetsToFile('modified-preset.json');
        
        console.log('批量预设操作完成');
    } catch (error) {
        console.error('批量预设操作失败:', error);
    }
}

// 监听预设变更
presetManager.settingsManager.addListener((type, data) => {
    if (type === 'settings' || type === 'preferences') {
        // 设置变更时自动保存预设
        presetManager.savePresetsSilently();
    }
});
```

## 最佳实践

### 预设管理建议

#### 定期备份
```javascript
// 定期自动备份预设
setInterval(async () => {
    try {
        const timestamp = new Date().toISOString().split('T')[0];
        await presetManager.backupPresets(`auto-backup-${timestamp}.json`);
        console.log(`自动备份完成: ${timestamp}`);
    } catch (error) {
        console.error('自动备份失败:', error);
    }
}, 86400000); // 每24小时备份一次
```

#### 版本控制
```javascript
// 为不同项目创建专门的预设文件
function createProjectPreset(projectName) {
    const presetName = `${projectName}-preset.json`;
    return presetManager.exportPresetsToFile(presetName);
}

// 恢复项目预设
function restoreProjectPreset(projectName) {
    const presetName = `${projectName}-preset.json`;
    return presetManager.importPresetsFromFile(presetName);
}
```

#### 团队协作
```javascript
// 导出团队标准预设
async function exportTeamPreset() {
    const teamSettings = {
        mode: 'project_adjacent',
        addToComposition: true,
        timelineOptions: {
            placement: 'current_time'
        }
    };
    
    // 应用团队设置
    presetManager.settingsManager.saveSettings(teamSettings);
    
    // 导出团队预设文件
    await presetManager.exportPresetsToFile('team-standard-preset.json');
    
    console.log('团队标准预设已导出');
}

// 导入团队标准预设
async function importTeamPreset() {
    await presetManager.importPresetsFromFile('team-standard-preset.json');
    console.log('团队标准预设已导入');
    
    // 刷新UI以应用新设置
    presetManager.updateSettingsUI();
    presetManager.loadQuickSettings();
}
```

### 性能优化

#### 防抖保存
```javascript
// 使用防抖避免频繁保存预设
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const debouncedSavePresets = debounce(() => {
    presetManager.savePresetsSilently();
}, 1000); // 1秒防抖延迟

// 在设置变更时调用防抖保存
presetManager.settingsManager.addListener(() => {
    debouncedSavePresets();
});
```

#### 缓存机制
```javascript
// 实现预设缓存机制
class CachedPresetManager extends PresetManager {
    constructor(aeExtension) {
        super(aeExtension);
        this.presetCache = new Map();
        this.cacheTimeout = 30000; // 30秒缓存超时
    }
    
    async loadPresetsFromDisk() {
        const cacheKey = `preset_${this.panelId}`;
        const cached = this.presetCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            // 使用缓存的预设
            this.log('使用缓存的预设', 'debug');
            return cached.data;
        }
        
        // 加载新预设并缓存
        const presets = await super.loadPresetsFromDisk();
        this.presetCache.set(cacheKey, {
            data: presets,
            timestamp: Date.now()
        });
        
        return presets;
    }
    
    clearCache() {
        this.presetCache.clear();
        this.log('预设缓存已清除', 'debug');
    }
}
```

#### 批量操作
```javascript
// 批量处理多个面板的预设
async function batchProcessPanelPresets(panelIds, operation) {
    const results = [];
    
    for (const panelId of panelIds) {
        try {
            const panelPresetManager = new PresetManager(aeExtension);
            panelPresetManager.panelId = panelId;
            
            const result = await operation(panelPresetManager);
            results.push({ panelId, success: true, result });
        } catch (error) {
            results.push({ panelId, success: false, error: error.message });
        }
    }
    
    return results;
}

// 使用示例：批量备份所有面板预设
const panelIds = ['panel1', 'panel2', 'panel3'];
const backupResults = await batchProcessPanelPresets(panelIds, async (presetManager) => {
    return await presetManager.backupPresets();
});

console.log('批量备份结果:', backupResults);
```

## 故障排除

### 常见问题

#### 预设文件丢失
- **症状**：面板配置重置为默认值
- **解决**：
  1. 检查预设文件存储路径
  2. 验证文件权限
  3. 恢复备份预设文件

#### 预设导入失败
- **症状**：导入预设文件时报错或无反应
- **解决**：
  1. 检查预设文件格式是否正确
  2. 验证JSON语法是否有效
  3. 确认预设文件版本兼容性

#### 预设保存失败
- **症状**：修改设置后预设未保存或保存报错
- **解决**：
  1. 检查localStorage权限
  2. 验证文件系统写入权限
  3. 检查磁盘空间是否充足

#### 备份恢复失败
- **症状**：从备份文件恢复预设时报错或配置未应用
- **解决**：
  1. 验证备份文件完整性
  2. 检查备份文件版本兼容性
  3. 手动应用关键设置

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控预设操作
presetManager.addEventListener('presetOperation', (event) => {
    console.log('预设操作:', event.detail);
});
```

#### 检查预设文件
```javascript
// 检查预设文件是否存在
function checkPresetFileExists() {
    const presetFileName = presetManager.getPresetFileName();
    const presetFilePath = presetManager.getPresetsFilePath();
    
    console.log('预设文件名:', presetFileName);
    console.log('预设文件路径:', presetFilePath);
    
    // 在CEP环境中检查文件是否存在
    if (window.cep && window.cep.fs) {
        const fileResult = window.cep.fs.readFile(presetFilePath);
        if (fileResult.err === 0) {
            console.log('预设文件存在，大小:', fileResult.data.length, '字节');
        } else {
            console.log('预设文件不存在');
        }
    }
}
```

#### 性能监控
```javascript
// 监控预设操作性能
async function monitorPresetPerformance(operation, ...args) {
    const startTime = performance.now();
    
    try {
        const result = await operation(...args);
        const endTime = performance.now();
        
        console.log(`${operation.name} 操作耗时: ${endTime - startTime}ms`);
        return result;
    } catch (error) {
        const endTime = performance.now();
        console.log(`${operation.name} 操作失败，耗时: ${endTime - startTime}ms`);
        throw error;
    }
}

// 使用示例
const saveResult = await monitorPresetPerformance(
    presetManager.savePresetsSilently.bind(presetManager)
);
```

## 扩展性

### 自定义扩展

#### 扩展预设管理器
```javascript
// 创建自定义预设管理器
class CustomPresetManager extends PresetManager {
    constructor(aeExtension) {
        super(aeExtension);
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

// 注册自定义功能
const customPresetManager = new CustomPresetManager(aeExtension);
customPresetManager.registerCustomFeature('cloudSync', async (presets) => {
    // 实现云端同步功能
    console.log('同步预设到云端:', presets);
    return { success: true };
});
```

#### 插件化架构
```javascript
// 创建预设插件
class PresetPlugin {
    constructor(presetManager) {
        this.presetManager = presetManager;
        this.init();
    }
    
    init() {
        // 添加插件特定的方法
        this.presetManager.cloudSync = this.cloudSync.bind(this);
        this.presetManager.versionControl = this.versionControl.bind(this);
        
        // 监听预设变更事件
        this.presetManager.settingsManager.addListener((type, data) => {
            if (type === 'autoSave') {
                // 自动同步到云端
                this.handleAutoSync(data);
            }
        });
    }
    
    /**
     * 云端同步
     * @param {Object} presets - 预设数据
     */
    async cloudSync(presets) {
        try {
            // 实现云端同步逻辑
            const response = await fetch('/api/presets/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(presets)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.presetManager.log('✅ 预设已同步到云端', 'success');
                return result;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.presetManager.log(`❌ 云端同步失败: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 版本控制
     * @param {Object} presets - 预设数据
     */
    async versionControl(presets) {
        try {
            // 实现版本控制逻辑
            const version = presets.version || '1.0.0';
            const timestamp = new Date().toISOString();
            
            const versionedPresets = {
                ...presets,
                version: version,
                timestamp: timestamp,
                history: presets.history || []
            };
            
            // 添加到历史记录
            versionedPresets.history.push({
                version: version,
                timestamp: timestamp,
                changes: this.detectChanges(presets)
            });
            
            this.presetManager.log(`📦 预设版本已更新: ${version}`, 'info');
            return versionedPresets;
        } catch (error) {
            this.presetManager.log(`❌ 版本控制失败: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 检测变更
     * @param {Object} presets - 预设数据
     * @returns {Array} 变更列表
     */
    detectChanges(presets) {
        // 实现变更检测逻辑
        return ['设置已更新'];
    }
    
    /**
     * 处理自动同步
     * @param {Object} data - 自动保存数据
     */
    async handleAutoSync(data) {
        try {
            // 检查是否启用云端同步
            const cloudSyncEnabled = this.presetManager.settingsManager.getPreference('cloudSyncEnabled');
            if (!cloudSyncEnabled) return;
            
            // 执行云端同步
            await this.cloudSync(data);
        } catch (error) {
            this.presetManager.log(`自动同步失败: ${error.message}`, 'warning');
        }
    }
}

// 应用插件
const plugin = new PresetPlugin(presetManager);