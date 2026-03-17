# 多面板支持

## 概述

多面板支持（Multi-Panel Support）是 Eagle2Ae AE 扩展 v2.4.0 引入的革命性功能，允许用户同时打开多个扩展面板实例，每个面板都可以拥有独立的配置和预设文件。这一功能极大地提升了工作效率，特别适用于需要同时处理多个项目或不同导入任务的用户。

## 核心特性

### 多实例独立运行
- 支持同时打开多个扩展面板实例
- 每个面板实例拥有独立的配置文件
- 面板间配置互不干扰，可进行个性化设置

### 面板标识系统
- 每个面板实例拥有唯一的面板ID
- 自动识别面板来源，确保配置正确加载
- 支持面板间通信和状态同步

### 预设文件管理
- 每个面板实例对应独立的预设文件
- 支持预设文件的导出和导入
- 提供预设文件版本管理和备份功能

### 配置隔离
- 每个面板实例拥有独立的设置管理器
- 支持面板特定的localStorage存储
- 实现配置的完全隔离和个性化

## 技术实现

### 面板ID识别机制

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

### 独立配置存储

```javascript
/**
 * 面板特定的配置管理器
 * 确保每个面板实例拥有独立的配置存储空间
 */
class PanelSpecificSettingsManager {
    /**
     * 构造函数
     * @param {string} panelId - 面板ID
     */
    constructor(panelId) {
        this.panelId = panelId;
        this.settings = this.getDefaultSettings();
        this.preferences = this.getDefaultPreferences();
        
        // 绑定方法上下文
        this.getPanelStorageKey = this.getPanelStorageKey.bind(this);
        this.getPanelLocalStorage = this.getPanelLocalStorage.bind(this);
        this.setPanelLocalStorage = this.setPanelLocalStorage.bind(this);
        this.loadSettings = this.loadSettings.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
    }

    /**
     * 获取面板特定的localStorage键
     * @param {string} key - 原始键名
     * @returns {string} 带面板前缀的键名
     */
    getPanelStorageKey(key) {
        return `${this.panelId}_${key}`;
    }

    /**
     * 获取面板特定的localStorage值
     * @param {string} key - 键名
     * @returns {string|null} 值
     */
    getPanelLocalStorage(key) {
        return localStorage.getItem(this.getPanelStorageKey(key));
    }

    /**
     * 设置面板特定的localStorage值
     * @param {string} key - 键名
     * @param {string} value - 值
     */
    setPanelLocalStorage(key, value) {
        localStorage.setItem(this.getPanelStorageKey(key), value);
    }

    /**
     * 加载设置
     * @returns {Object} 设置对象
     */
    loadSettings() {
        try {
            const savedSettings = this.getPanelLocalStorage('aeSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                
                // 验证设置格式
                if (this.validateSettings(parsedSettings)) {
                    this.settings = { ...this.getDefaultSettings(), ...parsedSettings };
                    this.log(`⚙️ 面板 ${this.panelId} 设置已加载`, 'debug');
                } else {
                    this.log(`⚠️ 面板 ${this.panelId} 设置格式无效，使用默认设置`, 'warning');
                    this.settings = this.getDefaultSettings();
                }
            } else {
                this.log(`ℹ️ 面板 ${this.panelId} 未找到保存的设置，使用默认设置`, 'debug');
                this.settings = this.getDefaultSettings();
            }
            
            return this.settings;
        } catch (error) {
            this.log(`❌ 面板 ${this.panelId} 设置加载失败: ${error.message}`, 'error');
            this.settings = this.getDefaultSettings();
            return this.settings;
        }
    }

    /**
     * 保存设置
     * @param {Object} settings - 设置对象
     * @returns {Object} 保存结果
     */
    saveSettings(settings) {
        try {
            // 验证设置
            const validation = this.validateSettings(settings);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error
                };
            }

            // 保存到localStorage
            const settingsToSave = {
                ...this.getDefaultSettings(),
                ...settings,
                version: this.CURRENT_SETTINGS_VERSION,
                lastModified: new Date().toISOString(),
                panelId: this.panelId
            };

            this.setPanelLocalStorage('aeSettings', JSON.stringify(settingsToSave));
            this.settings = settingsToSave;

            this.log(`✅ 面板 ${this.panelId} 设置已保存`, 'debug');
            
            return {
                success: true,
                settings: settingsToSave
            };
        } catch (error) {
            this.log(`❌ 面板 ${this.panelId} 设置保存失败: ${error.message}`, 'error');
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 验证设置
     * @param {Object} settings - 设置对象
     * @returns {Object} 验证结果
     */
    validateSettings(settings) {
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

        return {
            valid: true
        };
    }

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
}
```

### 预设文件管理

```javascript
/**
 * 面板特定的预设文件管理器
 * 每个面板实例拥有独立的预设文件
 */
class PanelSpecificPresetManager {
    /**
     * 构造函数
     * @param {string} panelId - 面板ID
     */
    constructor(panelId) {
        this.panelId = panelId;
        this.presetsDirectory = this.getDefaultPresetsDirectory();
        
        // 绑定方法上下文
        this.getPresetFileName = this.getPresetFileName.bind(this);
        this.getPresetsFilePath = this.getPresetsFilePath.bind(this);
        this.loadPresetsFromDisk = this.loadPresetsFromDisk.bind(this);
        this.savePresetsSilently = this.savePresetsSilently.bind(this);
    }

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

    /**
     * 获取预设目录
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
     * 获取默认预设目录
     * @returns {string} 默认预设目录路径
     */
    getDefaultPresetsDirectory() {
        if (window.require) {
            const path = window.require('path');
            const os = window.require('os');
            const documentsPath = path.join(os.homedir(), 'Documents');
            return path.join(documentsPath, 'Eagle2Ae-Ae', 'presets');
        } else {
            // 降级方案
            return '我的文档\\Eagle2Ae-Ae\\presets';
        }
    }

    /**
     * 从磁盘加载预设
     * @returns {Promise<void>}
     */
    async loadPresetsFromDisk() {
        try {
            const fileName = this.getPresetFileName();
            this.log(`🔍 尝试加载预设文件: ${fileName}`, 'info');

            let parsed = null;

            // Demo 模式：从虚拟文件系统加载
            if (window.__DEMO_MODE_ACTIVE__) {
                try {
                    let content = null;

                    // 尝试从虚拟文件系统读取
                    if (window.demoFileSystem) {
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

            this.log('✅ 已加载并应用本地预设', 'success');

        } catch (error) {
            this.log(`⚠️ 加载本地预设失败: ${error.message}`, 'warning');
        }
    }

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
                        const demoFileName = `Eagle2Ae-Ae/presets/${this.getPresetFileName()}`;
                        const result = window.demoFileSystem.writeFile(
                            demoFileName,
                            jsonContent
                        );

                        if (result.success) {
                            this.log(`✅ 预设已保存到虚拟文件系统 (${result.size} bytes)`, 'info');
                            return true;
                        } else {
                            throw new Error(result.error);
                        }
                    } else {
                        // 降级：保存到 localStorage
                        localStorage.setItem('eagle2ae_preset_json', jsonContent);
                        this.log('✅ 预设已保存到浏览器存储 (Demo 模式)', 'info');
                        return true;
                    }
                } catch (e) {
                    this.log(`⚠️ Demo 模式保存预设失败: ${e.message}`, 'warning');
                    return false;
                }
            }

            // CEP 模式：保存到文件系统
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
                this.log('✅ 预设已自动保存到文档目录', 'info');
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
}
```

### 面板间通信

```javascript
/**
 * 面板间通信管理器
 * 支持多个面板实例间的通信和状态同步
 */
class PanelCommunicationManager {
    /**
     * 构造函数
     * @param {string} panelId - 面板ID
     */
    constructor(panelId) {
        this.panelId = panelId;
        this.peers = new Map();
        this.messageQueue = [];
        
        // 绑定方法上下文
        this.discoverPeers = this.discoverPeers.bind(this);
        this.sendMessageToPeer = this.sendMessageToPeer.bind(this);
        this.broadcastMessage = this.broadcastMessage.bind(this);
        this.handlePeerMessage = this.handlePeerMessage.bind(this);
        
        // 初始化通信
        this.initCommunication();
    }

    /**
     * 初始化通信
     */
    initCommunication() {
        // 监听来自其他面板的消息
        window.addEventListener('message', this.handlePeerMessage);
        
        // 启动同伴发现
        this.discoverPeers();
        
        // 定期同步状态
        setInterval(() => {
            this.syncPanelState();
        }, 5000);
    }

    /**
     * 发现同伴面板
     */
    async discoverPeers() {
        try {
            // 在CEP环境中，通过扩展ID发现同伴
            if (typeof CSInterface !== 'undefined') {
                const csInterface = new CSInterface();
                const extensions = csInterface.getExtensions();
                
                if (extensions && Array.isArray(extensions)) {
                    extensions.forEach(extension => {
                        if (extension.id && extension.id.includes('Eagle2Ae') && 
                            extension.id !== csInterface.getExtensionID()) {
                            this.addPeer(extension.id, extension);
                        }
                    });
                }
            }
            
            this.log(`🔍 发现 ${this.peers.size} 个同伴面板`, 'debug');
        } catch (error) {
            this.log(`❌ 同伴发现失败: ${error.message}`, 'error');
        }
    }

    /**
     * 添加同伴面板
     * @param {string} peerId - 同伴ID
     * @param {Object} peerInfo - 同伴信息
     */
    addPeer(peerId, peerInfo) {
        this.peers.set(peerId, {
            id: peerId,
            info: peerInfo,
            lastSeen: Date.now(),
            status: 'online'
        });
        
        this.log(`👥 添加同伴面板: ${peerId}`, 'debug');
    }

    /**
     * 发送消息给特定同伴
     * @param {string} peerId - 同伴ID
     * @param {Object} message - 消息内容
     */
    sendMessageToPeer(peerId, message) {
        try {
            if (!this.peers.has(peerId)) {
                this.log(`❌ 未找到同伴面板: ${peerId}`, 'warning');
                return;
            }

            const peer = this.peers.get(peerId);
            
            // 在CEP环境中，使用扩展间通信
            if (typeof CSInterface !== 'undefined') {
                const csInterface = new CSInterface();
                csInterface.dispatchEvent(new CSEvent('com.eagle2ae.peer.message', 'APPLICATION', peerId, {
                    from: this.panelId,
                    ...message
                }));
            }
            
            // 在Web环境中，使用postMessage
            if (window.postMessage) {
                window.postMessage({
                    type: 'peer_message',
                    from: this.panelId,
                    to: peerId,
                    ...message
                }, '*');
            }
            
            this.log(`📤 发送消息给同伴 ${peerId}: ${message.type}`, 'debug');
        } catch (error) {
            this.log(`❌ 发送消息给同伴失败: ${error.message}`, 'error');
        }
    }

    /**
     * 广播消息给所有同伴
     * @param {Object} message - 消息内容
     */
    broadcastMessage(message) {
        this.peers.forEach((peer, peerId) => {
            this.sendMessageToPeer(peerId, message);
        });
    }

    /**
     * 处理同伴消息
     * @param {MessageEvent} event - 消息事件
     */
    handlePeerMessage(event) {
        try {
            const { data } = event;
            
            if (!data || typeof data !== 'object') return;
            
            // 检查是否为同伴消息
            if (data.type === 'peer_message' && data.to === this.panelId) {
                this.log(`📥 收到来自同伴 ${data.from} 的消息: ${data.type}`, 'debug');
                
                // 处理特定类型的消息
                switch (data.messageType) {
                    case 'settings_change':
                        this.handleSettingsChangeFromPeer(data);
                        break;
                        
                    case 'preset_update':
                        this.handlePresetUpdateFromPeer(data);
                        break;
                        
                    case 'ui_state_sync':
                        this.handleUIStateSyncFromPeer(data);
                        break;
                        
                    default:
                        this.log(`未知的同伴消息类型: ${data.messageType}`, 'warning');
                }
            }
        } catch (error) {
            this.log(`处理同伴消息失败: ${error.message}`, 'error');
        }
    }

    /**
     * 处理来自同伴的设置变更
     * @param {Object} message - 消息内容
     */
    handleSettingsChangeFromPeer(message) {
        try {
            const { settings, field, value } = message.data;
            
            this.log(`🔄 收到同伴设置变更: ${field} = ${value}`, 'debug');
            
            // 更新本地设置（但不保存到文件）
            if (field && value !== undefined) {
                this.settingsManager.updateField(field, value, false); // 不保存到文件
            } else if (settings) {
                this.settingsManager.saveSettings(settings, false); // 不保存到文件
            }
            
            // 同步UI状态
            this.updateSettingsUI();
            
        } catch (error) {
            this.log(`处理同伴设置变更失败: ${error.message}`, 'error');
        }
    }

    /**
     * 处理来自同伴的预设更新
     * @param {Object} message - 消息内容
     */
    handlePresetUpdateFromPeer(message) {
        try {
            const { presetName, presetData } = message.data;
            
            this.log(`🔄 收到同伴预设更新: ${presetName}`, 'debug');
            
            // 更新本地预设（但不保存到文件）
            if (presetName && presetData) {
                this.presetManager.updatePreset(presetName, presetData, false); // 不保存到文件
            }
            
        } catch (error) {
            this.log(`处理同伴预设更新失败: ${error.message}`, 'error');
        }
    }

    /**
     * 处理来自同伴的UI状态同步
     * @param {Object} message - 消息内容
     */
    handleUIStateSyncFromPeer(message) {
        try {
            const { uiState } = message.data;
            
            this.log(`🔄 收到同伴UI状态同步`, 'debug');
            
            // 同步UI状态
            if (uiState) {
                this.applyUISettings(uiState);
            }
            
        } catch (error) {
            this.log(`处理同伴UI状态同步失败: ${error.message}`, 'error');
        }
    }

    /**
     * 同步面板状态
     */
    async syncPanelState() {
        try {
            // 获取当前面板状态
            const currentState = {
                settings: this.settingsManager.getSettings(),
                uiState: this.getUISettingsFromLocalStorage(),
                presetName: this.presetManager.getCurrentPresetName()
            };

            // 广播状态给所有同伴
            this.broadcastMessage({
                messageType: 'panel_state_sync',
                data: {
                    panelId: this.panelId,
                    timestamp: Date.now(),
                    state: currentState
                }
            });

            this.log(`🔄 面板状态同步完成`, 'debug');
        } catch (error) {
            this.log(`面板状态同步失败: ${error.message}`, 'error');
        }
    }
}
```

## API参考

### 核心类

#### MultiPanelSupport
多面板支持主类，负责管理多个面板实例

```javascript
/**
 * 多面板支持主类
 * 负责管理多个面板实例的创建、配置和通信
 */
class MultiPanelSupport {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            maxPanels: 3, // 最大面板数量
            enableCommunication: true, // 启用面板间通信
            syncSettings: true, // 同步设置
            ...options
        };

        this.panels = new Map();
        this.activePanelId = null;
        
        // 绑定方法上下文
        this.createPanel = this.createPanel.bind(this);
        this.activatePanel = this.activatePanel.bind(this);
        this.closePanel = this.closePanel.bind(this);
        this.syncPanelSettings = this.syncPanelSettings.bind(this);
    }
}
```

#### PanelInstance
面板实例类，代表单个扩展面板

```javascript
/**
 * 面板实例类
 * 代表单个扩展面板实例
 */
class PanelInstance {
    /**
     * 构造函数
     * @param {string} panelId - 面板ID
     * @param {Object} config - 面板配置
     */
    constructor(panelId, config = {}) {
        this.panelId = panelId;
        this.config = {
            title: `Eagle2Ae 面板 ${panelId.replace('panel', '')}`,
            width: 400,
            height: 600,
            position: { x: 100, y: 100 },
            ...config
        };

        this.settingsManager = new PanelSpecificSettingsManager(panelId);
        this.presetManager = new PanelSpecificPresetManager(panelId);
        this.communicationManager = new PanelCommunicationManager(panelId);
        
        this.initialized = false;
        this.active = false;
        
        // 绑定方法上下文
        this.initialize = this.initialize.bind(this);
        this.activate = this.activate.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.destroy = this.destroy.bind(this);
    }
}
```

### 方法参考

#### getPanelId()
获取当前面板ID

```javascript
/**
 * 获取当前面板 ID
 * @returns {string} 'panel1', 'panel2', 或 'panel3'
 */
getPanelId()
```

#### createPanel()
创建新的面板实例

```javascript
/**
 * 创建新的面板实例
 * @param {string} panelId - 面板ID
 * @param {Object} config - 面板配置
 * @returns {PanelInstance} 面板实例
 */
createPanel(panelId, config = {})
```

#### activatePanel()
激活面板实例

```javascript
/**
 * 激活面板实例
 * @param {string} panelId - 面板ID
 */
activatePanel(panelId)
```

#### closePanel()
关闭面板实例

```javascript
/**
 * 关闭面板实例
 * @param {string} panelId - 面板ID
 */
closePanel(panelId)
```

#### syncPanelSettings()
同步面板设置

```javascript
/**
 * 同步面板设置
 * @param {string} sourcePanelId - 源面板ID
 * @param {string} targetPanelId - 目标面板ID
 * @param {Object} options - 同步选项
 */
syncPanelSettings(sourcePanelId, targetPanelId, options = {})
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

## 使用示例

### 基本使用

```javascript
// 获取当前面板ID
const panelId = aeExtension.getPanelId();
console.log(`当前面板ID: ${panelId}`);

// 使用面板特定的设置管理器
const settings = aeExtension.settingsManager.getSettings();
console.log(`面板 ${panelId} 设置:`, settings);

// 使用面板特定的预设管理器
const presetFileName = aeExtension.presetManager.getPresetFileName();
console.log(`面板 ${panelId} 预设文件名: ${presetFileName}`);
```

### 高级使用

```javascript
// 面板间通信示例
// 发送设置变更消息给其他面板
aeExtension.communicationManager.broadcastMessage({
    messageType: 'settings_change',
    data: {
        field: 'mode',
        value: 'project_adjacent'
    }
});

// 监听设置变更消息
aeExtension.settingsManager.addListener((field, value) => {
    // 当设置变更时，同步到其他面板
    if (aeExtension.communicationManager) {
        aeExtension.communicationManager.broadcastMessage({
            messageType: 'settings_change',
            data: {
                field: field,
                value: value
            }
        });
    }
});

// 同步预设文件
async function syncPresetsBetweenPanels(sourcePanelId, targetPanelId) {
    try {
        // 读取源面板预设
        const sourcePresetManager = new PanelSpecificPresetManager(sourcePanelId);
        const sourcePresets = await sourcePresetManager.loadPresetsFromDisk();
        
        // 保存到目标面板
        const targetPresetManager = new PanelSpecificPresetManager(targetPanelId);
        const result = await targetPresetManager.savePresetsSilently();
        
        if (result.success) {
            console.log(`✅ 预设已从面板 ${sourcePanelId} 同步到面板 ${targetPanelId}`);
        } else {
            console.log(`❌ 预设同步失败: ${result.error}`);
        }
    } catch (error) {
        console.log(`❌ 预设同步异常: ${error.message}`);
    }
}
```

### 批量操作

```javascript
// 批量创建多个面板实例
async function createMultiplePanels() {
    const panelIds = ['panel1', 'panel2', 'panel3'];
    const panels = [];
    
    for (const panelId of panelIds) {
        try {
            const panel = await aeExtension.multiPanelSupport.createPanel(panelId, {
                title: `Eagle2Ae 面板 ${panelId.replace('panel', '')}`,
                width: 400,
                height: 600
            });
            
            panels.push(panel);
            console.log(`✅ 面板 ${panelId} 创建成功`);
        } catch (error) {
            console.log(`❌ 面板 ${panelId} 创建失败: ${error.message}`);
        }
    }
    
    return panels;
}

// 批量同步设置
async function syncSettingsAcrossPanels(sourcePanelId, settingFields) {
    try {
        // 获取源面板设置
        const sourceSettingsManager = new PanelSpecificSettingsManager(sourcePanelId);
        const sourceSettings = sourceSettingsManager.getSettings();
        
        // 获取所有面板ID
        const allPanelIds = ['panel1', 'panel2', 'panel3'];
        
        // 同步到其他面板
        for (const targetPanelId of allPanelIds) {
            if (targetPanelId === sourcePanelId) continue;
            
            try {
                const targetSettingsManager = new PanelSpecificSettingsManager(targetPanelId);
                
                // 只同步指定字段
                for (const field of settingFields) {
                    if (sourceSettings.hasOwnProperty(field)) {
                        targetSettingsManager.updateField(field, sourceSettings[field], true);
                    }
                }
                
                console.log(`✅ 设置已从面板 ${sourcePanelId} 同步到面板 ${targetPanelId}`);
            } catch (error) {
                console.log(`❌ 面板 ${targetPanelId} 设置同步失败: ${error.message}`);
            }
        }
    } catch (error) {
        console.log(`❌ 批量设置同步失败: ${error.message}`);
    }
}
```

## 最佳实践

### 配置管理

1. **独立配置存储**
   ```javascript
   // 每个面板使用独立的配置存储
   const panelId = aeExtension.getPanelId();
   const settingsManager = new PanelSpecificSettingsManager(panelId);
   
   // 保存设置时使用面板特定的键
   settingsManager.saveSettings(currentSettings);
   ```

2. **预设文件管理**
   ```javascript
   // 每个面板使用独立的预设文件
   const presetManager = new PanelSpecificPresetManager(panelId);
   
   // 导出预设时使用面板特定的文件名
   const presetFileName = presetManager.getPresetFileName();
   console.log(`导出预设文件: ${presetFileName}`);
   ```

### 性能优化

1. **缓存机制**
   ```javascript
   // 使用缓存避免重复检测
   class PanelCache {
       constructor(panelId) {
           this.panelId = panelId;
           this.cache = new Map();
       }
       
       get(key) {
           return this.cache.get(`${this.panelId}_${key}`);
       }
       
       set(key, value) {
           this.cache.set(`${this.panelId}_${key}`, value);
       }
   }
   ```

2. **防抖处理**
   ```javascript
   // 对于频繁操作使用防抖
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
   
   // 应用到面板状态更新
   const updatePanelStateDebounced = debounce(updatePanelState, 300);
   ```

### 错误处理

1. **优雅降级**
   ```javascript
   // 当面板特定功能失败时提供降级方案
   try {
       const panelSpecificResult = await panelSpecificOperation();
   } catch (error) {
       console.warn(`面板特定操作失败，使用通用方案: ${error.message}`);
       const fallbackResult = await fallbackOperation();
   }
   ```

2. **错误恢复**
   ```javascript
   // 实现错误恢复机制
   async function recoverFromPanelError(panelId, error) {
       try {
           // 尝试重新初始化面板
           const panel = aeExtension.multiPanelSupport.getPanel(panelId);
           if (panel) {
               await panel.initialize();
               console.log(`面板 ${panelId} 已恢复`);
           }
       } catch (recoverError) {
           console.error(`面板 ${panelId} 恢复失败: ${recoverError.message}`);
       }
   }
   ```

## 故障排除

### 常见问题

#### 面板配置混乱
- **症状**：不同面板间配置相互影响
- **解决**：检查面板ID是否正确识别，重新启动面板

#### 预设文件丢失
- **症状**：面板配置重置为默认值
- **解决**：检查预设文件存储路径，恢复备份文件

#### 面板无法打开
- **症状**：无法创建新的面板实例
- **解决**：重启AE，检查CEP扩展状态

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控面板创建过程
window.addEventListener('panelCreated', (event) => {
    console.log('面板已创建:', event.detail);
});

// 监控面板激活过程
window.addEventListener('panelActivated', (event) => {
    console.log('面板已激活:', event.detail);
});
```

#### 性能分析
```javascript
// 记录面板操作耗时
const startTime = performance.now();
await panelOperation();
const endTime = performance.now();
console.log(`面板操作耗时: ${endTime - startTime}ms`);
```

#### 内存监控
```javascript
// 监控内存使用情况
function logMemoryUsage() {
    if (performance.memory) {
        console.log('内存使用情况:', {
            used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
            total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`,
            limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        });
    }
}

// 定期监控内存使用
setInterval(logMemoryUsage, 30000); // 每30秒监控一次
```

## 扩展性

### 自定义面板类型

```javascript
// 创建自定义面板类型
class CustomPanelType extends PanelInstance {
    constructor(panelId, config = {}) {
        super(panelId, {
            title: '自定义面板',
            icon: '🎨',
            ...config
        });
        
        this.customFeatures = new Map();
    }
    
    // 添加自定义功能
    addCustomFeature(name, feature) {
        this.customFeatures.set(name, feature);
    }
    
    // 执行自定义功能
    executeCustomFeature(name, ...args) {
        const feature = this.customFeatures.get(name);
        if (feature && typeof feature === 'function') {
            return feature(...args);
        }
        throw new Error(`未知的自定义功能: ${name}`);
    }
}

// 注册自定义面板类型
aeExtension.multiPanelSupport.registerPanelType('custom', CustomPanelType);
```

### 插件化架构

```javascript
// 创建面板插件
class PanelPlugin {
    constructor(panelInstance) {
        this.panel = panelInstance;
        this.init();
    }
    
    init() {
        // 注册自定义事件
        this.panel.addEventListener('panelActivated', this.handleActivation.bind(this));
        
        // 添加自定义方法
        this.panel.customMethod = this.customMethod.bind(this);
    }
    
    handleActivation(event) {
        console.log(`面板 ${event.detail.panelId} 已激活`);
        // 执行插件特定的激活逻辑
        this.onPanelActivated(event.detail);
    }
    
    customMethod() {
        console.log('执行自定义方法');
    }
    
    onPanelActivated(panelInfo) {
        // 插件特定的激活逻辑
        console.log('插件处理面板激活事件');
    }
}

// 应用插件到面板实例
const plugin = new PanelPlugin(panelInstance);
```