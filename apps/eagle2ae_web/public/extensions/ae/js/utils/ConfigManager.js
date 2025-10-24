/**
 * 配置管理器 - 阶段4
 * 负责配置文件的加载、保存、迁移和管理
 */

class ConfigManager {
    constructor(aeExtension) {
        this.ae = aeExtension;
        this.fullConfig = null;
        this.currentPanelConfig = null;
        // 🔥 使用面板特定的配置文件路径
        const presetFileName = this.ae.getPresetFileName();
        this.configFilePath = `Eagle2Ae-Ae/presets/${presetFileName}`;
        this.saveTimeout = null;
        console.log(`[ConfigManager] 配置文件路径: ${this.configFilePath}`);
    }

    // ========== 配置文件操作 ==========
    
    /**
     * 加载配置文件
     */
    async loadConfigFile() {
        try {
            console.log('[ConfigManager] 开始加载配置文件...');
            
            // 方法1: 使用虚拟文件系统 (Demo模式)
            if (window.demoFileSystem && typeof window.demoFileSystem.readFile === 'function') {
                const result = window.demoFileSystem.readFile(this.configFilePath);
                if (result && result.success && result.content) {
                    this.fullConfig = JSON.parse(result.content);
                    console.log('[ConfigManager] 虚拟文件系统加载成功');
                    return this.fullConfig;
                }
            }
            
            // 方法2: 使用 Node.js fs (CEP环境)
            if (window.require) {
                try {
                    const fs = window.require('fs');
                    const path = window.require('path');
                    
                    const extensionRoot = this.getExtensionRoot();
                    const configPath = path.join(extensionRoot, this.configFilePath);
                    
                    if (fs.existsSync(configPath)) {
                        const configData = fs.readFileSync(configPath, 'utf8');
                        this.fullConfig = JSON.parse(configData);
                        console.log('[ConfigManager] Node.js fs 加载成功');
                        return this.fullConfig;
                    }
                } catch (fsError) {
                    console.warn('[ConfigManager] Node.js fs 加载失败:', fsError);
                }
            }
            
            // 方法3: 使用 fetch (后备方案)
            try {
                const response = await fetch(this.configFilePath);
                if (response.ok) {
                    this.fullConfig = await response.json();
                    console.log('[ConfigManager] fetch 加载成功');
                    return this.fullConfig;
                }
            } catch (fetchError) {
                console.warn('[ConfigManager] fetch 加载失败:', fetchError);
            }
            
            // 如果都失败，使用默认配置
            console.warn('[ConfigManager] 所有加载方法都失败，使用默认配置');
            this.fullConfig = this.getDefaultConfig();
            return this.fullConfig;
            
        } catch (error) {
            console.error('[ConfigManager] 配置文件加载失败:', error);
            this.fullConfig = this.getDefaultConfig();
            return this.fullConfig;
        }
    }

    /**
     * 保存配置文件（支持多面板并发保存）
     */
    async saveConfigFile(config = null) {
        try {
            const configToSave = config || this.fullConfig;
            if (!configToSave) {
                return { success: false, error: '没有配置数据可保存' };
            }
            
            // 🔥 关键修复：在保存前，先重新加载最新的配置文件
            // 这样可以避免多个面板互相覆盖配置
            let latestConfig = null;
            
            // 方法1: 使用虚拟文件系统 (Demo模式)
            if (window.demoFileSystem && typeof window.demoFileSystem.readFile === 'function') {
                try {
                    const result = window.demoFileSystem.readFile(this.configFilePath);
                    if (result && result.success && result.content) {
                        latestConfig = JSON.parse(result.content);
                        console.log('[ConfigManager] 读取到最新配置，准备合并');
                    }
                } catch (readError) {
                    console.warn('[ConfigManager] 读取最新配置失败，使用当前配置:', readError);
                }
            }
            
            // 方法2: 使用 Node.js fs (CEP环境)
            if (!latestConfig && window.require) {
                try {
                    const fs = window.require('fs');
                    const path = window.require('path');
                    
                    const extensionRoot = this.getExtensionRoot();
                    const configPath = path.join(extensionRoot, this.configFilePath);
                    
                    if (fs.existsSync(configPath)) {
                        const existingData = fs.readFileSync(configPath, 'utf8');
                        latestConfig = JSON.parse(existingData);
                        console.log('[ConfigManager] 读取到最新配置，准备合并');
                    }
                } catch (readError) {
                    console.warn('[ConfigManager] 读取最新配置失败，使用当前配置:', readError);
                }
            }
            
            // 方法3: 从 localStorage 读取 (后备方案)
            if (!latestConfig) {
                try {
                    const existingData = localStorage.getItem('eagle2ae_fullConfig');
                    if (existingData) {
                        latestConfig = JSON.parse(existingData);
                        console.log('[ConfigManager] 从 localStorage 读取到最新配置，准备合并');
                    }
                } catch (readError) {
                    console.warn('[ConfigManager] 从 localStorage 读取失败:', readError);
                }
            }
            
            // 🔥 合并配置：只更新当前面板的部分
            let finalConfig;
            
            console.log('[ConfigManager] 🔍 合并前状态:', {
                hasLatestConfig: !!latestConfig,
                latestPanels: latestConfig?.panels ? Object.keys(latestConfig.panels) : [],
                configToSavePanels: configToSave?.panels ? Object.keys(configToSave.panels) : [],
                currentPanelId: this.ae.currentPanelId
            });
            
            if (latestConfig) {
                // 使用最新配置作为基础
                finalConfig = latestConfig;
                
                // 只更新当前面板的配置
                if (!finalConfig.panels) {
                    finalConfig.panels = {};
                }
                
                // 从 configToSave 中提取当前面板的配置
                if (configToSave.panels && configToSave.panels[this.ae.currentPanelId]) {
                    finalConfig.panels[this.ae.currentPanelId] = configToSave.panels[this.ae.currentPanelId];
                    console.log(`[ConfigManager] ✅ 已合并配置，只更新面板: ${this.ae.currentPanelId}`);
                    console.log(`[ConfigManager] 📊 合并后的面板列表:`, Object.keys(finalConfig.panels));
                } else {
                    console.warn(`[ConfigManager] ⚠️ configToSave 中没有找到面板 ${this.ae.currentPanelId} 的配置`);
                    console.warn(`[ConfigManager] configToSave 结构:`, {
                        hasPanels: !!configToSave.panels,
                        panels: configToSave.panels ? Object.keys(configToSave.panels) : 'undefined'
                    });
                }
            } else {
                // 如果没有读取到最新配置，直接使用 configToSave
                finalConfig = configToSave;
                console.log('[ConfigManager] 没有最新配置，直接使用当前配置');
            }
            
            // 更新元数据
            finalConfig.metadata = finalConfig.metadata || {};
            finalConfig.metadata.lastModified = new Date().toISOString();
            finalConfig.metadata.modifiedBy = this.ae.currentPanelId;
            
            const configJSON = JSON.stringify(finalConfig, null, 2);
            console.log('[ConfigManager] 开始保存配置文件...');
            
            // 保存到虚拟文件系统 (Demo模式)
            if (window.demoFileSystem && typeof window.demoFileSystem.writeFile === 'function') {
                const writeResult = window.demoFileSystem.writeFile(this.configFilePath, configJSON);
                if (writeResult && writeResult.success) {
                    console.log('[ConfigManager] 虚拟文件系统保存成功');
                    
                    // 🔥 更新本地的 fullConfig，保持同步
                    this.fullConfig = finalConfig;
                    
                    return { success: true };
                } else {
                    console.error('[ConfigManager] 虚拟文件系统保存失败:', writeResult.error);
                }
            }
            
            // 保存到 Node.js fs (CEP环境)
            if (window.require) {
                try {
                    const fs = window.require('fs');
                    const path = window.require('path');
                    
                    const extensionRoot = this.getExtensionRoot();
                    const configPath = path.join(extensionRoot, this.configFilePath);
                    
                    fs.writeFileSync(configPath, configJSON, 'utf8');
                    console.log('[ConfigManager] Node.js fs 保存成功');
                    
                    // 🔥 更新本地的 fullConfig，保持同步
                    this.fullConfig = finalConfig;
                    
                    return { success: true };
                } catch (fsError) {
                    console.warn('[ConfigManager] Node.js fs 保存失败:', fsError);
                }
            }
            
            // 保存到 localStorage (后备方案)
            localStorage.setItem('eagle2ae_fullConfig', configJSON);
            console.log('[ConfigManager] localStorage 保存成功');
            
            // 🔥 更新本地的 fullConfig，保持同步
            this.fullConfig = finalConfig;
            
            return { success: true };
            
        } catch (error) {
            console.error('[ConfigManager] 配置文件保存失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 获取扩展根目录
     */
    getExtensionRoot() {
        try {
            if (this.ae.csInterface && typeof this.ae.csInterface.getSystemPath === 'function') {
                return this.ae.csInterface.getSystemPath('extension');
            }
            if (typeof process !== 'undefined' && process.cwd) {
                return process.cwd();
            }
            return '';
        } catch (error) {
            console.warn('[ConfigManager] 获取扩展根目录失败:', error);
            return '';
        }
    }

    // ========== 面板配置操作 ==========
    
    /**
     * 加载当前面板配置
     */
    loadPanelConfig() {
        try {
            console.log(`[ConfigManager] 加载面板配置: ${this.ae.currentPanelId}`);
            
            if (!this.fullConfig || !this.fullConfig.panels) {
                console.warn('[ConfigManager] 完整配置不存在，创建默认配置');
                this.currentPanelConfig = this.getDefaultPanelConfig();
                return this.currentPanelConfig;
            }
            
            let panelConfig = this.fullConfig.panels[this.ae.currentPanelId];
            
            if (!panelConfig) {
                console.log('[ConfigManager] 面板配置不存在，创建默认配置');
                panelConfig = this.getDefaultPanelConfig();
                this.fullConfig.panels[this.ae.currentPanelId] = panelConfig;
            }
            
            // 更新最后使用时间
            panelConfig.lastUsed = new Date().toISOString();
            
            this.currentPanelConfig = panelConfig;
            console.log('[ConfigManager] 面板配置加载成功');
            return panelConfig;
            
        } catch (error) {
            console.error('[ConfigManager] 加载面板配置失败:', error);
            this.currentPanelConfig = this.getDefaultPanelConfig();
            return this.currentPanelConfig;
        }
    }

    /**
     * 保存当前面板配置
     */
    async savePanelConfig() {
        try {
            console.log(`[ConfigManager] 📝 开始保存面板配置: ${this.ae.currentPanelId}`);
            
            // 收集当前配置
            const panelConfig = this.collectPanelConfig();
            console.log(`[ConfigManager] ✅ 已收集面板配置:`, panelConfig);
            
            // 更新完整配置中的面板部分
            if (!this.fullConfig.panels) {
                this.fullConfig.panels = {};
            }
            this.fullConfig.panels[this.ae.currentPanelId] = panelConfig;
            
            console.log(`[ConfigManager] 📦 准备保存的完整配置:`, {
                version: this.fullConfig.version,
                panelIds: Object.keys(this.fullConfig.panels),
                currentPanel: this.ae.currentPanelId
            });
            
            // 保存配置文件
            const result = await this.saveConfigFile();
            
            if (result.success) {
                console.log(`[ConfigManager] ✅ 面板配置保存成功: ${this.ae.currentPanelId}`);
            } else {
                console.error(`[ConfigManager] ❌ 面板配置保存失败: ${this.ae.currentPanelId}`, result.error);
            }
            
            return result;
            
        } catch (error) {
            console.error('[ConfigManager] ❌ 保存面板配置失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 收集当前面板配置
     */
    collectPanelConfig() {
        try {
            const settingsManager = this.ae.settingsManager;
            
            const panelConfig = {
                name: this.ae.panelDisplayName,
                description: `${this.ae.panelDisplayName}的配置`,
                lastUsed: new Date().toISOString(),
                importSettings: settingsManager.getSettings(),
                userPreferences: settingsManager.getPreferences(),
                projectAdjacentSettings: {
                    folderName: 'Eagle_Assets'
                },
                customFolderSettings: {
                    folderPath: '',
                    recentFolders: settingsManager.recentFolders || [],
                    directoryHandle: {}
                }
            };
            
            // 如果 settingsManager 有 uiSettings，也收集它
            if (typeof settingsManager.getUISettings === 'function') {
                panelConfig.uiSettings = settingsManager.getUISettings();
            } else {
                panelConfig.uiSettings = this.getDefaultUISettings();
            }
            
            console.log('[ConfigManager] 配置收集完成');
            return panelConfig;
            
        } catch (error) {
            console.error('[ConfigManager] 收集配置失败:', error);
            return this.getDefaultPanelConfig();
        }
    }

    /**
     * 应用面板配置到 settingsManager
     */
    applyPanelConfigToSettingsManager() {
        try {
            if (!this.currentPanelConfig) {
                console.warn('[ConfigManager] 没有面板配置可应用');
                return;
            }
            
            console.log('[ConfigManager] 应用配置到 settingsManager');
            
            const settingsManager = this.ae.settingsManager;
            
            // 应用导入设置
            if (this.currentPanelConfig.importSettings) {
                settingsManager.settings = { ...this.currentPanelConfig.importSettings };
            }
            
            // 应用用户偏好
            if (this.currentPanelConfig.userPreferences) {
                settingsManager.preferences = { ...this.currentPanelConfig.userPreferences };
            }
            
            // 应用最近文件夹
            if (this.currentPanelConfig.customFolderSettings && 
                this.currentPanelConfig.customFolderSettings.recentFolders) {
                settingsManager.recentFolders = [...this.currentPanelConfig.customFolderSettings.recentFolders];
            }
            
            console.log('[ConfigManager] 配置应用完成');
            
        } catch (error) {
            console.error('[ConfigManager] 应用配置失败:', error);
        }
    }

    // ========== 配置迁移 ==========
    
    /**
     * 检查是否需要迁移
     */
    checkIfNeedsMigration() {
        try {
            // 如果已经迁移过，不再迁移
            if (localStorage.getItem('eagle2ae_migrated') === 'true') {
                console.log('[ConfigManager] 已迁移过，跳过迁移');
                return false;
            }
            
            // 🔥 关键修复：检查配置文件格式
            // 如果配置文件存在但没有 panels 字段，说明是旧格式，需要迁移
            if (this.fullConfig && !this.fullConfig.panels) {
                console.log('[ConfigManager] 检测到旧格式配置文件，需要迁移');
                return true;
            }
            
            // 如果配置文件已存在且有 panels 字段，但当前面板配置不存在，也需要迁移
            if (this.fullConfig && 
                this.fullConfig.panels && 
                !this.fullConfig.panels[this.ae.currentPanelId]) {
                console.log('[ConfigManager] 面板配置不存在，需要迁移');
                return true;
            }
            
            // 如果配置文件已存在且有当前面板配置，不需要迁移
            if (this.fullConfig && 
                this.fullConfig.panels && 
                this.fullConfig.panels[this.ae.currentPanelId]) {
                console.log('[ConfigManager] 面板配置已存在，跳过迁移');
                return false;
            }
            
            // 检查 localStorage 中是否有旧配置
            const hasOldSettings = localStorage.getItem('eagle2ae_importSettings') || 
                                 localStorage.getItem('eagle2ae_userPreferences');
            
            if (hasOldSettings) {
                console.log('[ConfigManager] 检测到 localStorage 中的旧配置，需要迁移');
                return true;
            }
            
            console.log('[ConfigManager] 没有需要迁移的配置');
            return false;
            
        } catch (error) {
            console.error('[ConfigManager] 检查迁移失败:', error);
            return false;
        }
    }

    /**
     * 迁移旧配置
     */
    async migrateOldConfig() {
        try {
            console.log('[ConfigManager] 开始迁移旧配置...');
            
            let oldSettings = null;
            let oldPreferences = null;
            let oldRecentFolders = [];
            let oldUISettings = null;
            
            // 🔥 优先从配置文件中读取旧配置（如果是旧格式）
            if (this.fullConfig && !this.fullConfig.panels) {
                console.log('[ConfigManager] 从旧格式配置文件中读取配置');
                oldSettings = this.fullConfig.importSettings || null;
                oldPreferences = this.fullConfig.userPreferences || null;
                oldUISettings = this.fullConfig.uiSettings || null;
                // 旧配置文件中可能没有 recentFolders
            }
            
            // 如果配置文件中没有，再从 localStorage 读取
            if (!oldSettings || !oldPreferences) {
                console.log('[ConfigManager] 从 localStorage 读取旧配置');
                const oldSettingsStr = localStorage.getItem('eagle2ae_importSettings');
                const oldPreferencesStr = localStorage.getItem('eagle2ae_userPreferences');
                const oldRecentFoldersStr = localStorage.getItem('eagle2ae_recentFolders');
                
                try {
                    if (oldSettingsStr) oldSettings = JSON.parse(oldSettingsStr);
                    if (oldPreferencesStr) oldPreferences = JSON.parse(oldPreferencesStr);
                    if (oldRecentFoldersStr) oldRecentFolders = JSON.parse(oldRecentFoldersStr);
                } catch (parseError) {
                    console.warn('[ConfigManager] 解析 localStorage 旧配置失败:', parseError);
                }
            }
            
            if (!oldSettings && !oldPreferences) {
                console.log('[ConfigManager] 没有有效的旧配置');
                return { success: false, error: '没有有效的旧配置' };
            }
            
            // 转换为新格式
            const panel1Config = this.convertOldConfigToPanelConfig(oldSettings, oldPreferences, oldRecentFolders, oldUISettings);
            
            // 🔥 创建新格式的配置
            const newConfig = this.getDefaultConfig();
            newConfig.panels = {
                'com.yanrouya.eagle2ae.panel1': panel1Config,
                'com.yanrouya.eagle2ae.panel2': this.getDefaultPanelConfig(), // panel2 使用默认配置
                'com.yanrouya.eagle2ae.panel3': this.getDefaultPanelConfig()  // panel3 使用默认配置
            };
            
            // 更新面板名称
            newConfig.panels['com.yanrouya.eagle2ae.panel2'].name = '快速预览';
            newConfig.panels['com.yanrouya.eagle2ae.panel2'].description = '快速预览的配置';
            newConfig.panels['com.yanrouya.eagle2ae.panel3'].name = '音频项目';
            newConfig.panels['com.yanrouya.eagle2ae.panel3'].description = '音频项目的配置';
            
            // 更新元数据
            newConfig.metadata.migratedFrom = this.fullConfig && !this.fullConfig.panels ? 'configFile' : 'localStorage';
            newConfig.metadata.migrationDate = new Date().toISOString();
            
            // 替换旧配置
            this.fullConfig = newConfig;
            
            // 保存配置文件
            const saveResult = await this.saveConfigFile();
            
            if (saveResult.success) {
                // 标记已迁移
                localStorage.setItem('eagle2ae_migrated', 'true');
                console.log('[ConfigManager] ✅ 配置迁移完成');
                return { success: true };
            } else {
                console.error('[ConfigManager] 保存迁移配置失败:', saveResult.error);
                return { success: false, error: saveResult.error };
            }
            
        } catch (error) {
            console.error('[ConfigManager] 迁移配置失败:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 转换旧配置格式到新面板配置
     */
    convertOldConfigToPanelConfig(oldSettings, oldPreferences, oldRecentFolders, oldUISettings = null) {
        try {
            console.log('[ConfigManager] 转换配置格式...');
            
            const panelConfig = this.getDefaultPanelConfig();
            
            // 迁移导入设置
            if (oldSettings) {
                panelConfig.importSettings = {
                    ...panelConfig.importSettings,
                    ...oldSettings
                };
            }
            
            // 迁移用户偏好（移除废弃字段）
            if (oldPreferences) {
                panelConfig.userPreferences = {
                    favoriteFolder: oldPreferences.favoriteFolder || '',
                    favoriteExportFolder: oldPreferences.favoriteExportFolder || '',
                    communicationPort: oldPreferences.communicationPort || 8080
                };
                
                // 迁移主题到 uiSettings
                if (oldPreferences.theme) {
                    panelConfig.uiSettings.theme = this.migrateTheme(oldPreferences.theme);
                }
            }
            
            // 🔥 迁移 UI 设置（如果存在）
            if (oldUISettings) {
                panelConfig.uiSettings = {
                    ...panelConfig.uiSettings,
                    ...oldUISettings
                };
            }
            
            // 迁移最近文件夹
            if (oldRecentFolders && Array.isArray(oldRecentFolders)) {
                panelConfig.customFolderSettings.recentFolders = oldRecentFolders.slice(0, 10);
            }
            
            // 设置迁移标记
            panelConfig.name = '默认配置 (已迁移)';
            panelConfig.description = '从旧版本迁移的配置';
            
            console.log('[ConfigManager] 配置格式转换完成');
            return panelConfig;
            
        } catch (error) {
            console.error('[ConfigManager] 转换配置格式失败:', error);
            return this.getDefaultPanelConfig();
        }
    }

    /**
     * 迁移主题值
     */
    migrateTheme(oldTheme) {
        if (oldTheme === 'ae_native' || oldTheme === 'light') {
            return 'light';
        }
        return 'dark';
    }

    // ========== 默认配置生成 ==========
    
    /**
     * 获取默认完整配置
     */
    getDefaultConfig() {
        return {
            version: '2.0.0',
            metadata: {
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                modifiedBy: this.ae.currentPanelId,
                migratedFrom: null,
                migrationDate: null
            },
            globalSettings: {
                communicationPort: 8080,
                autoSaveSettings: true,
                eagleServerUrl: 'http://localhost:8080'
            },
            panels: {}
        };
    }

    /**
     * 获取默认面板配置
     */
    getDefaultPanelConfig() {
        const panelNames = {
            'com.yanrouya.eagle2ae.panel1': '默认配置',
            'com.yanrouya.eagle2ae.panel2': '快速预览',
            'com.yanrouya.eagle2ae.panel3': '音频项目'
        };
        
        const panelName = panelNames[this.ae.currentPanelId] || '未知面板';
        
        return {
            name: panelName,
            description: `${panelName}的配置`,
            lastUsed: new Date().toISOString(),
            importSettings: this.getDefaultImportSettings(),
            userPreferences: this.getDefaultUserPreferences(),
            uiSettings: this.getDefaultUISettings(),
            projectAdjacentSettings: {
                folderName: 'Eagle_Assets'
            },
            customFolderSettings: {
                folderPath: '',
                recentFolders: [],
                directoryHandle: {}
            }
        };
    }

    /**
     * 获取默认导入设置
     */
    getDefaultImportSettings() {
        // 使用 ImportSettings 常量中的默认值
        const constants = window.ImportSettingsConstants;
        if (constants && constants.DEFAULT_IMPORT_SETTINGS) {
            return { ...constants.DEFAULT_IMPORT_SETTINGS };
        }
        
        // 后备默认值
        return {
            mode: 'project_adjacent',
            projectAdjacentFolder: 'Eagle_Assets',
            customFolderPath: '',
            addToComposition: true,
            noImportSubMode: 'normal',
            timelineOptions: {
                enabled: true,
                placement: 'current_time'
            },
            fileManagement: {
                keepOriginalName: true,
                addTimestamp: false,
                createTagFolders: false,
                deleteFromEagle: false
            },
            soundSettings: {
                enabled: true,
                volume: 60
            },
            exportSettings: {
                mode: 'desktop',
                projectAdjacentFolder: 'Eagle_Assets',
                customExportPath: '',
                autoCopy: true,
                burnAfterReading: true,
                addTimestamp: false,
                createSubfolders: false
            }
        };
    }

    /**
     * 获取默认用户偏好
     */
    getDefaultUserPreferences() {
        const constants = window.ImportSettingsConstants;
        if (constants && constants.DEFAULT_USER_PREFERENCES) {
            return { ...constants.DEFAULT_USER_PREFERENCES };
        }
        
        return {
            favoriteFolder: '',
            favoriteExportFolder: '',
            communicationPort: 8080
        };
    }

    /**
     * 获取默认UI设置
     */
    getDefaultUISettings() {
        const constants = window.ImportSettingsConstants;
        if (constants && constants.DEFAULT_UI_SETTINGS) {
            return { ...constants.DEFAULT_UI_SETTINGS };
        }
        
        return {
            showThemeButton: true,
            showLanguageButton: true,
            showLogButton: true,
            showProjectInfo: true,
            showLogPanel: true,
            showHeader: true,
            fullscreenMode: false,
            theme: 'dark',
            language: 'zh-CN'
        };
    }

    // ========== 自动保存 ==========
    
    /**
     * 设置自动保存
     */
    setupAutoSave() {
        try {
            console.log('[ConfigManager] 设置自动保存监听');
            
            // 监听 settingsManager 的变化
            const settingsManager = this.ae.settingsManager;
            if (settingsManager && typeof settingsManager.addListener === 'function') {
                settingsManager.addListener((type, data) => {
                    console.log(`[ConfigManager] 检测到配置变化: ${type}`);
                    this.debouncedSave();
                });
            }
            
        } catch (error) {
            console.error('[ConfigManager] 设置自动保存失败:', error);
        }
    }

    /**
     * 防抖保存
     */
    debouncedSave() {
        try {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(async () => {
                console.log('[ConfigManager] 执行自动保存');
                const result = await this.savePanelConfig();
                if (result.success) {
                    console.log('[ConfigManager] 自动保存成功');
                } else {
                    console.error('[ConfigManager] 自动保存失败:', result.error);
                }
            }, 500);  // 500ms 防抖
        } catch (error) {
            console.error('[ConfigManager] 防抖保存失败:', error);
        }
    }

    // ========== 配置初始化流程 ==========
    
    /**
     * 异步配置初始化
     */
    async init() {
        try {
            console.log('[ConfigManager] 开始配置初始化流程...');
            
            // 🔥 0. 首次运行检查：如果从未初始化过，清除所有旧数据
            const isFirstRun = !localStorage.getItem('eagle2ae_config_initialized');
            if (isFirstRun) {
                console.log('[ConfigManager] 检测到首次运行，清除旧数据...');
                localStorage.removeItem('eagle2ae_migrated');
                localStorage.removeItem('eagle2ae_importSettings');
                localStorage.removeItem('eagle2ae_userPreferences');
                localStorage.removeItem('eagle2ae_recentFolders');
                localStorage.setItem('eagle2ae_config_initialized', 'true');
                console.log('[ConfigManager] ✅ 旧数据已清除');
            }
            
            // 1. 加载配置文件
            await this.loadConfigFile();
            console.log('[ConfigManager] ✅ 配置文件加载完成');
            
            // 2. 检查并执行迁移
            if (this.checkIfNeedsMigration()) {
                console.log('[ConfigManager] 执行配置迁移...');
                const migrationResult = await this.migrateOldConfig();
                if (migrationResult.success) {
                    // 🔥 迁移成功后，fullConfig 已经是新格式了，不需要重新加载
                    console.log('[ConfigManager] ✅ 配置迁移完成');
                } else {
                    console.warn('[ConfigManager] ⚠️ 配置迁移失败:', migrationResult.error);
                    // 迁移失败，创建默认的新格式配置
                    console.log('[ConfigManager] 创建默认的新格式配置...');
                    this.fullConfig = this.getDefaultConfig();
                    // 为所有三个面板创建默认配置
                    this.fullConfig.panels['com.yanrouya.eagle2ae.panel1'] = this.getDefaultPanelConfig();
                    this.fullConfig.panels['com.yanrouya.eagle2ae.panel2'] = this.getDefaultPanelConfig();
                    this.fullConfig.panels['com.yanrouya.eagle2ae.panel3'] = this.getDefaultPanelConfig();
                    // 更新面板名称
                    this.fullConfig.panels['com.yanrouya.eagle2ae.panel1'].name = '默认配置';
                    this.fullConfig.panels['com.yanrouya.eagle2ae.panel2'].name = '快速预览';
                    this.fullConfig.panels['com.yanrouya.eagle2ae.panel3'].name = '音频项目';
                    // 保存新配置
                    await this.saveConfigFile();
                    console.log('[ConfigManager] ✅ 默认配置已创建并保存');
                }
            }
            
            // 🔥 3. 确保配置文件是新格式
            if (!this.fullConfig.panels) {
                console.warn('[ConfigManager] ⚠️ 配置文件不是新格式，强制转换...');
                const oldConfig = this.fullConfig;
                this.fullConfig = this.getDefaultConfig();
                // 将旧配置转换为 panel1 的配置
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel1'] = this.convertOldConfigToPanelConfig(
                    oldConfig.importSettings,
                    oldConfig.userPreferences,
                    [],
                    oldConfig.uiSettings
                );
                // 为 panel2 和 panel3 创建默认配置
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel2'] = this.getDefaultPanelConfig();
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel3'] = this.getDefaultPanelConfig();
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel2'].name = '快速预览';
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel3'].name = '音频项目';
                // 保存新格式配置
                await this.saveConfigFile();
                localStorage.setItem('eagle2ae_migrated', 'true');
                console.log('[ConfigManager] ✅ 配置已转换为新格式并保存');
            }
            
            // 4. 加载当前面板配置
            this.loadPanelConfig();
            console.log('[ConfigManager] ✅ 面板配置加载完成');
            
            // 5. 应用配置到 settingsManager
            this.applyPanelConfigToSettingsManager();
            console.log('[ConfigManager] ✅ 配置应用到 settingsManager 完成');
            
            // 6. 设置自动保存监听
            this.setupAutoSave();
            console.log('[ConfigManager] ✅ 自动保存设置完成');
            
            console.log('[ConfigManager] 🎉 配置初始化流程完成');
            
        } catch (error) {
            console.error('[ConfigManager] ❌ 配置初始化失败:', error);
            
            // 降级方案：使用默认配置
            try {
                console.log('[ConfigManager] 使用降级方案...');
                this.fullConfig = this.getDefaultConfig();
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel1'] = this.getDefaultPanelConfig();
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel2'] = this.getDefaultPanelConfig();
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel3'] = this.getDefaultPanelConfig();
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel1'].name = '默认配置';
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel2'].name = '快速预览';
                this.fullConfig.panels['com.yanrouya.eagle2ae.panel3'].name = '音频项目';
                this.currentPanelConfig = this.fullConfig.panels[this.ae.currentPanelId];
                this.applyPanelConfigToSettingsManager();
                // 尝试保存
                await this.saveConfigFile();
                console.log('[ConfigManager] ✅ 降级方案完成');
            } catch (fallbackError) {
                console.error('[ConfigManager] ❌ 降级方案也失败:', fallbackError);
            }
        }
    }
}
