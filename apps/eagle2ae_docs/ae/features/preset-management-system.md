# 预设管理系统

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了全新的预设管理系统（Preset Management System），该系统支持每个面板实例独立的预设文件管理，提供预设的导出、导入、备份和恢复功能。通过智能的预设管理，用户可以轻松地在不同设备或项目间共享配置。

## 核心特性

### 多面板预设隔离
- 每个面板实例拥有独立的预设文件
- 支持面板间配置隔离和共享
- 自动识别面板ID并关联对应预设

### 智能预设文件命名
- 自动生成面板特定的预设文件名
- 支持描述性的文件命名规范
- 避免预设文件名冲突

### 自动保存机制
- 配置变更时自动保存到预设文件
- 支持防抖保存，避免频繁写入
- 提供手动保存和强制保存选项

### 预设导出导入
- 支持预设文件的导出和导入
- 提供JSON格式的预设文件
- 支持批量预设管理

### 备份与恢复
- 自动创建预设文件备份
- 支持版本化备份管理
- 提供一键恢复功能

### 跨平台兼容
- 支持Windows和macOS系统
- 兼容不同AE版本的预设格式
- 提供降级兼容处理

## 使用指南

### 基本预设管理

#### 查看当前预设
```javascript
// 获取当前面板的预设文件名
const presetFileName = aeExtension.getPresetFileName();
console.log(`当前面板预设文件: ${presetFileName}`);

// 查看预设文件路径
const presetPath = aeExtension.getPresetsFilePath();
console.log(`预设文件路径: ${presetPath}`);
```

#### 手动保存预设
```javascript
// 手动触发预设保存
await aeExtension.savePresetsSilently();

// 保存预设并显示结果
const saveResult = await aeExtension.savePresetsSilently();
if (saveResult) {
    console.log('✅ 预设保存成功');
} else {
    console.log('❌ 预设保存失败');
}
```

#### 导出预设文件
```javascript
// 导出当前面板预设
await aeExtension.handleExportPresets();

// 或者直接调用导出方法
aeExtension.exportPresetToFile();
```

### 高级功能

#### 预设文件管理
```javascript
// 获取预设目录
const presetsDir = aeExtension.getPresetsBaseFolderPath();
console.log(`预设目录: ${presetsDir}`);

// 确保预设目录存在
await aeExtension.ensurePresetsFolderReady();

// 打开预设目录
await aeExtension.handleOpenPresetsFolder();
```

#### 自定义预设目录
```javascript
// 选择自定义预设目录
await aeExtension.handleChoosePresetsDirectory();

// 设置预设目录
aeExtension.settingsManager.updatePreference('presetsDirectory', '/custom/presets/path');
```

#### 批量预设操作
```javascript
// 批量导出所有面板预设
const allPanels = ['panel1', 'panel2', 'panel3'];
for (const panelId of allPanels) {
    const panelExtension = getPanelExtension(panelId);
    if (panelExtension) {
        await panelExtension.handleExportPresets();
    }
}
```

## 技术实现

### 预设文件命名机制

```javascript
/**
 * 获取面板特定的预设文件名
 * @returns {string} 预设文件名，如 'Eagle2Ae1.Presets', 'Eagle2Ae2.Presets'
 */
getPresetFileName() {
    // 从面板ID提取编号
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

### 预设保存实现

```javascript
/**
 * 静默保存预设到JSON（无弹窗与打开文件夹）
 * @returns {Promise<boolean>} 是否保存成功
 */
async savePresetsSilently() {
    try {
        const fileName = this.getPresetFileName();
        console.log(`[${this.panelId}] 💾 准备保存预设到文件: ${fileName}`);
        
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

### 预设加载实现

```javascript
/**
 * 从JSON自动读取预设并应用到UI
 * @returns {Promise<void>}
 */
async loadPresetsFromDisk() {
    try {
        const fileName = this.getPresetFileName();
        console.log(`[${this.panelId}] 🔎 尝试加载预设文件: ${fileName}`);
        this.log(`🔎 ${window.i18n?.getText('logs.tryingToLoadLocalPresets') || 'Trying to load local presets...'}`, 'info');

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
                    console.log(`[${this.panelId}] 📝 预设文件不存在，正在创建: ${fileNameToCreate}`);
                    this.log(`📝 正在创建默认预设文件: ${fileNameToCreate}`, 'info');
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
                console.log(`[${this.panelId}] 📝 预设文件不存在，正在创建: ${fileNameToCreate}`);
                this.log(`📝 正在创建默认预设文件: ${fileNameToCreate}`, 'info');
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
        this.log(`⚠️ ${(window.i18n?.getText('logs.loadLocalPresetsFailedPrefix') || 'Failed to load local presets:')} ${error.message}`, 'warning');
    }
}
```

### 自动预设同步

```javascript
/**
 * 设置自动预设同步（监听变更并防抖保存）
 */
setupAutoPresetSync() {
    // 防抖计时器
    this._presetSaveTimer = null;
    const triggerSave = () => {
        if (this._presetSaveTimer) clearTimeout(this._presetSaveTimer);
        this._presetSaveTimer = setTimeout(() => {
            this.savePresetsSilently();
        }, 600); // 600ms 防抖延迟
    };

    // 监听设置、导出设置、偏好与自动保存事件
    this.settingsManager.addListener((type) => {
        if (['settings', 'exportSettings', 'preferences', 'autoSave'].includes(type)) {
            triggerSave();
        }
    });
}
```

### 预设目录管理

```javascript
/**
 * 获取当前预设目录（用户自定义的绝对路径），如果未设置则返回null
 * @returns {string|null}
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
 * 确保预设目录存在（启动时调用）
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

## 预设文件格式

### JSON结构示例

```json
{
  "importSettings": {
    "mode": "project_adjacent",
    "projectAdjacentFolder": "Eagle_Assets",
    "customFolderPath": "",
    "addToComposition": true,
    "timelineOptions": {
      "enabled": true,
      "placement": "current_time",
      "sequenceInterval": 1.0
    },
    "fileManagement": {
      "keepOriginalName": true,
      "addTimestamp": false,
      "createTagFolders": false,
      "deleteFromEagle": false
    },
    "exportSettings": {
      "mode": "project_adjacent",
      "autoCopy": true,
      "burnAfterReading": false,
      "addTimestamp": false,
      "createSubfolders": false,
      "projectAdjacentFolder": "Eagle_Assets"
    }
  },
  "userPreferences": {
    "communicationPort": 8080,
    "theme": "dark",
    "language": "zh-CN",
    "presetsDirectory": null
  },
  "uiSettings": {
    "theme": true,
    "language": true,
    "log": true,
    "projectInfo": true,
    "logPanel": true,
    "header": true,
    "fullscreen": false
  },
  "exportedAt": "2025-09-15T10:30:45.123Z",
  "language": "zh-CN"
}
```

## 最佳实践

### 使用建议

1. **定期备份预设**
   ```javascript
   // 建议定期导出预设文件作为备份
   setInterval(() => {
       aeExtension.handleExportPresets();
   }, 86400000); // 每24小时自动备份一次
   ```

2. **跨设备同步**
   ```javascript
   // 将预设文件保存到云同步目录
   aeExtension.settingsManager.updatePreference('presetsDirectory', 'C:\\Users\\Username\\OneDrive\\Eagle2Ae\\Presets');
   ```

3. **团队协作**
   ```javascript
   // 为团队创建标准化预设
   const teamPreset = {
       importSettings: {
           mode: 'project_adjacent',
           projectAdjacentFolder: 'Team_Assets',
           // 统一的团队设置
       },
       userPreferences: {
           theme: 'dark',
           language: 'zh-CN'
       }
   };
   
   // 导出团队标准预设供其他成员使用
   aeExtension.exportPresetToFile(teamPreset, 'TeamStandard.Presets');
   ```

### 性能优化

1. **防抖保存**
   ```javascript
   // 使用防抖避免频繁保存
   const debouncedSave = debounce(() => {
       aeExtension.savePresetsSilently();
   }, 1000); // 1秒防抖
   
   // 在设置变更时调用
   settingsManager.addListener(() => {
       debouncedSave();
   });
   ```

2. **增量保存**
   ```javascript
   // 只保存变更的部分而不是整个预设
   function saveChangedSettings(changedSettings) {
       const currentPresets = aeExtension.getCurrentPresets();
       const updatedPresets = {
           ...currentPresets,
           importSettings: {
               ...currentPresets.importSettings,
               ...changedSettings
           }
       };
       
       aeExtension.savePresets(updatedPresets);
   }
   ```

### 错误处理

1. **保存失败处理**
   ```javascript
   // 处理预设保存失败的情况
   async function handlePresetSave() {
       const saveResult = await aeExtension.savePresetsSilently();
       
       if (!saveResult) {
           // 保存失败时的降级处理
           console.warn('预设保存失败，使用内存中的设置');
           
           // 可以选择：
           // 1. 提示用户手动保存
           // 2. 临时保存到localStorage
           // 3. 继续使用当前设置而不中断流程
       }
   }
   ```

2. **加载失败处理**
   ```javascript
   // 处理预设加载失败的情况
   async function handlePresetLoad() {
       try {
           await aeExtension.loadPresetsFromDisk();
       } catch (error) {
           console.error('预设加载失败:', error);
           
           // 降级到默认设置
           aeExtension.settingsManager.resetSettings();
           aeExtension.loadSettingsToUI();
           
           // 提示用户
           aeExtension.showNotification('预设加载失败，已恢复到默认设置', 'warning');
       }
   }
   ```

## 故障排除

### 常见问题

1. **预设文件丢失**
   - 症状：设置重置为默认值
   - 解决：检查预设目录权限，恢复备份文件

2. **预设保存失败**
   - 症状：设置变更未保存
   - 解决：检查磁盘空间，验证目录权限

3. **跨面板配置冲突**
   - 症状：不同面板间配置相互影响
   - 解决：检查面板ID识别是否正确

### 调试技巧

1. **启用详细日志**
   ```javascript
   // 在控制台中启用预设管理日志
   localStorage.setItem('debugLogLevel', '0');
   ```

2. **监控预设变更**
   ```javascript
   // 监听预设保存事件
   aeExtension.settingsManager.addListener((eventType, data) => {
       if (eventType === 'autoSave') {
           console.log('预设自动保存:', data);
       }
   });
   ```

3. **检查预设文件**
   ```javascript
   // 手动检查预设文件内容
   async function inspectPresets() {
       const fileName = aeExtension.getPresetFileName();
       const presetPath = aeExtension.getPresetsFilePath();
       
       console.log('预设文件名:', fileName);
       console.log('预设文件路径:', presetPath);
       
       // 读取并解析预设文件
       const fileContent = await readFile(presetPath);
       const presetData = JSON.parse(fileContent);
       
       console.log('预设内容:', presetData);
   }
   ```

## 扩展性

### 自定义预设格式

```javascript
// 扩展预设管理系统以支持自定义格式
class CustomPresetManager extends PresetManager {
    constructor() {
        super();
        this.customFormatHandlers = new Map();
    }
    
    // 注册自定义格式处理器
    registerFormatHandler(format, handler) {
        this.customFormatHandlers.set(format, handler);
    }
    
    // 导出自定义格式
    async exportCustomFormat(format, data) {
        const handler = this.customFormatHandlers.get(format);
        if (handler) {
            return await handler.export(data);
        }
        throw new Error(`不支持的格式: ${format}`);
    }
    
    // 导入自定义格式
    async importCustomFormat(format, fileContent) {
        const handler = this.customFormatHandlers.get(format);
        if (handler) {
            return await handler.import(fileContent);
        }
        throw new Error(`不支持的格式: ${format}`);
    }
}
```

### 预设版本管理

```javascript
// 实现预设版本管理
class PresetVersionManager {
    constructor() {
        this.versionHistory = [];
    }
    
    // 创建预设版本
    createVersion(presetData, versionName) {
        const version = {
            id: Date.now().toString(36),
            name: versionName || `版本 ${this.versionHistory.length + 1}`,
            data: presetData,
            timestamp: new Date().toISOString(),
            panelId: aeExtension.panelId
        };
        
        this.versionHistory.push(version);
        
        // 限制版本历史数量
        if (this.versionHistory.length > 10) {
            this.versionHistory.shift();
        }
        
        return version;
    }
    
    // 恢复到指定版本
    async restoreVersion(versionId) {
        const version = this.versionHistory.find(v => v.id === versionId);
        if (version) {
            await aeExtension.settingsManager.saveSettings(version.data.importSettings);
            await aeExtension.settingsManager.savePreferences(version.data.userPreferences);
            aeExtension.loadSettingsToUI();
            return true;
        }
        return false;
    }
}
```