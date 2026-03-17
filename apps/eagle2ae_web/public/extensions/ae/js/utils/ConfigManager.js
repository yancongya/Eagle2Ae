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
        this.configFilePath = presetFileName; // 修复：直接使用文件名，因为它与index.html在同一目录
        this.saveTimeout = null;
        console.log(`[ConfigManager] 配置文件路径: ${this.configFilePath}`);
    }

    // ========== 配置文件操作 ==========
    
    /**
     * 加载配置文件
     */
    async loadConfigFile() {
        try {
            this.ae.log(`[ConfigManager] 正在加载预设文件: ${this.configFilePath}`, 'info');
            
            // 方法1: 使用虚拟文件系统 (Demo模式)
            if (window.demoFileSystem && typeof window.demoFileSystem.readFile === 'function') {
                const result = window.demoFileSystem.readFile(this.configFilePath);
                if (result && result.success && result.content) {
                    this.fullConfig = JSON.parse(result.content);
                    console.debug('[ConfigManager] 虚拟文件系统加载成功');
                    return this.fullConfig;
                }
                // 在演示模式下，如果虚拟文件不存在，则直接跳到末尾创建默认配置的逻辑
                // 避免尝试 fs 和 fetch，从而防止在控制台中出现不必要的警告
                console.log(`[ConfigManager] 演示模式下预设 '${this.configFilePath}' 不存在，将创建默认预设。`);
                this.fullConfig = this.getDefaultConfig();
                return this.fullConfig;
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
                        console.debug('[ConfigManager] Node.js fs 加载成功');
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
                    console.debug('[ConfigManager] fetch 加载成功');
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
                        console.debug('[ConfigManager] 读取到最新配置，准备合并');
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
                        console.debug('[ConfigManager] 读取到最新配置，准备合并');
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
                        console.debug('[ConfigManager] 从 localStorage 读取到最新配置，准备合并');
                    }
                } catch (readError) {
                    console.warn('[ConfigManager] 从 localStorage 读取失败:', readError);
                }
            }
            
            // 🔥 合并配置：只更新当前面板的部分
            let finalConfig;
            
            console.debug('[ConfigManager] 🔍 合并前状态:', {
                hasLatestConfig: !!latestConfig,
                latestPanels: latestConfig?.panels ? Object.keys(latestConfig.panels) : [],
                configToSavePanels: configToSave?.panels ? Object.keys(configToSave.panels) : [],
                currentPanelId: this.ae.panelId
            });
            
            if (latestConfig) {
                // 使用最新配置作为基础
                finalConfig = latestConfig;
                
                // 只更新当前面板的配置
                if (!finalConfig.panels) {
                    finalConfig.panels = {};
                }
                
                // 从 configToSave 中提取当前面板的配置
                if (configToSave.panels && configToSave.panels[this.ae.panelId]) {
                    finalConfig.panels[this.ae.panelId] = configToSave.panels[this.ae.panelId];
                    console.log(`[ConfigManager] ✅ 已合并配置，只更新面板: ${this.ae.panelId}`);
                    console.log(`[ConfigManager] 📊 合并后的面板列表:`, Object.keys(finalConfig.panels));
                } else {
                    console.warn(`[ConfigManager] ⚠️ configToSave 中没有找到面板 ${this.ae.panelId} 的配置`);
                    console.warn(`[ConfigManager] configToSave 结构:`, {
                        hasPanels: !!configToSave.panels,
                        panels: configToSave.panels ? Object.keys(configToSave.panels) : 'undefined'
                    });
                }
            } else {
                // 如果没有读取到最新配置，直接使用 configToSave
                finalConfig = configToSave;
                console.debug('[ConfigManager] 没有最新配置，直接使用当前配置');
            }
            
            // 更新元数据
            finalConfig.metadata = finalConfig.metadata || {};
            finalConfig.metadata.lastModified = new Date().toISOString();
            finalConfig.metadata.modifiedBy = this.ae.panelId;
            
            const configJSON = JSON.stringify(finalConfig, null, 2);
            console.debug('[ConfigManager] 开始保存配置文件...');
            
            // 保存到虚拟文件系统 (Demo模式)
            if (window.demoFileSystem && typeof window.demoFileSystem.writeFile === 'function') {
                const writeResult = window.demoFileSystem.writeFile(this.configFilePath, configJSON);
                if (writeResult && writeResult.success) {
                    console.debug('[ConfigManager] 虚拟文件系统保存成功');
                    
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
                    console.debug('[ConfigManager] Node.js fs 保存成功');
                    
                    // 🔥 更新本地的 fullConfig，保持同步
                    this.fullConfig = finalConfig;
                    
                    return { success: true };
                } catch (fsError) {
                    console.warn('[ConfigManager] Node.js fs 保存失败:', fsError);
                }
            }
            
            // 保存到 localStorage (后备方案)
            localStorage.setItem('eagle2ae_fullConfig', configJSON);
            console.debug('[ConfigManager] localStorage 保存成功');
            
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
                console.debug('[ConfigManager] 面板配置不存在，创建默认配置');
                panelConfig = this.getDefaultPanelConfig();
                this.fullConfig.panels[this.ae.currentPanelId] = panelConfig;
            }
            
            // 更新最后使用时间
            panelConfig.lastUsed = new Date().toISOString();
            
            this.currentPanelConfig = panelConfig;
            console.debug('[ConfigManager] 面板配置加载成功');
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
            
            console.debug('[ConfigManager] 配置收集完成');
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
            
            console.debug('[ConfigManager] 应用配置到 settingsManager');
            
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
            
            console.debug('[ConfigManager] 配置应用完成');
            
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
                this.ae.log('[ConfigManager] 已标记为迁移过，跳过检查。');
                return false;
            }

            // 检查旧格式的配置文件
            if (this.fullConfig && !this.fullConfig.panels) {
                this.ae.log('[ConfigManager] 检测到旧格式的配置文件，需要迁移。');
                return true;
            }

            // 检查 localStorage 中是否有非空的旧配置
            const oldSettings = localStorage.getItem('eagle2ae_importSettings');
            const oldPreferences = localStorage.getItem('eagle2ae_userPreferences');

            if (oldSettings || oldPreferences) {
                this.ae.log('[ConfigManager] 检测到 localStorage 中存在旧配置，需要迁移。');
                return true;
            }

            this.ae.log('[ConfigManager] 未检测到需要迁移的配置。');
            return false;

        } catch (error) {
            console.error('[ConfigManager] 检查迁移状态时出错:', error);
            return false;
        }
    }

    /**
     * 迁移旧配置
     */
    async migrateOldConfig() {
        try {
            this.ae.log('[ConfigManager] 开始尝试迁移旧配置...');
            
            let oldSettings = null;
            let oldPreferences = null;
            let oldRecentFolders = [];
            let oldUISettings = null;
            let source = 'unknown';

            // 优先从旧格式的配置文件迁移
            if (this.fullConfig && !this.fullConfig.panels) {
                this.ae.log('[ConfigManager] 正在从旧格式配置文件中读取数据...');
                source = 'configFile';
                oldSettings = this.fullConfig.importSettings || null;
                oldPreferences = this.fullConfig.userPreferences || null;
                oldUISettings = this.fullConfig.uiSettings || null;
            } else {
                // 否则，从 localStorage 迁移
                this.ae.log('[ConfigManager] 正在从 localStorage 中读取数据...');
                source = 'localStorage';
                try {
                    const oldSettingsStr = localStorage.getItem('eagle2ae_importSettings');
                    if (oldSettingsStr) oldSettings = JSON.parse(oldSettingsStr);

                    const oldPreferencesStr = localStorage.getItem('eagle2ae_userPreferences');
                    if (oldPreferencesStr) oldPreferences = JSON.parse(oldPreferencesStr);

                    const oldRecentFoldersStr = localStorage.getItem('eagle2ae_recentFolders');
                    if (oldRecentFoldersStr) oldRecentFolders = JSON.parse(oldRecentFoldersStr);
                } catch (parseError) {
                    this.ae.log(`[ConfigManager] ⚠️ 解析 localStorage 中的旧配置失败: ${parseError.message}`, 'warning');
                    // 如果解析失败，不要继续，因为数据是损坏的
                    return { success: false, error: '解析旧配置失败' };
                }
            }

            // 如果没有任何可迁移的数据，则认为迁移失败
            if (!oldSettings && !oldPreferences) {
                this.ae.log('[ConfigManager] ⚠️ 未找到任何有效的旧配置数据进行迁移。');
                return { success: false, error: '没有有效的旧配置' };
            }

            this.ae.log('[ConfigManager] 成功读取旧配置，开始转换格式...');
            const panel1Config = this.convertOldConfigToPanelConfig(oldSettings, oldPreferences, oldRecentFolders, oldUISettings);

            const newConfig = this.getDefaultConfig();
            newConfig.panels = {
                'panel1': panel1Config,
                'panel2': this.getDefaultPanelConfig(),
                'panel3': this.getDefaultPanelConfig()
            };
            
            newConfig.metadata.migratedFrom = source;
            newConfig.metadata.migrationDate = new Date().toISOString();

            this.fullConfig = newConfig;
            const saveResult = await this.saveConfigFile();

            if (saveResult.success) {
                localStorage.setItem('eagle2ae_migrated', 'true');
                // 清理旧的 localStorage 数据
                localStorage.removeItem('eagle2ae_importSettings');
                localStorage.removeItem('eagle2ae_userPreferences');
                localStorage.removeItem('eagle2ae_recentFolders');
                this.ae.log('[ConfigManager] ✅ 配置迁移成功并已保存。');
                return { success: true };
            } else {
                this.ae.log(`[ConfigManager] ❌ 保存迁移后的配置失败: ${saveResult.error}`, 'error');
                return { success: false, error: '保存迁移配置失败' };
            }

        } catch (error) {
            console.error('[ConfigManager] ❌ 迁移过程中发生严重错误:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 转换旧配置格式到新面板配置
     */
    convertOldConfigToPanelConfig(oldSettings, oldPreferences, oldRecentFolders, oldUISettings = null) {
        try {
            console.debug('[ConfigManager] 转换配置格式...');
            
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
            
            console.debug('[ConfigManager] 配置格式转换完成');
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
        // 统一主题值：ae_native -> light, 其他 -> dark
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
    getDefaultPanelConfig(panelId) {
        // 使用 AEExtension 实例的 getPanelDisplayName 方法获取正确的面板显示名称
        const panelName = this.ae.getPanelDisplayName(panelId);
        
        return {
            name: panelName, // 使用正确的显示名称
            description: `${panelName}的配置`, // 描述也使用正确的名称
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
                mode: 'project_adjacent',
                projectAdjacentFolder: 'Eagle_Assets',
                customExportPath: '',
                autoCopy: true,
                addTimestamp: false,
                createSubfolders: false,
                burnAfterReading: false
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
            lastUsedMode: 'project_adjacent',
            favoriteFolder: '',
            autoSaveSettings: true,
            showWelcomeWizard: true,
            theme: 'dark',
            communicationPort: 8080,
            lastUsedExportMode: 'project_adjacent',
            favoriteExportFolder: '',
            language: 'zh-CN'
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
            console.debug('[ConfigManager] 设置自动保存监听');
            
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
                this.ae.log('[ConfigManager] 正在执行自动保存...', 'info');
                const result = await this.savePanelConfig();
                if (result.success) {
                    this.ae.log('[ConfigManager] 预设已自动保存到文件。', 'success');
                } else {
                    this.ae.log(`[ConfigManager] 自动保存失败: ${result.error}`, 'error');
                }
            }, 500);  // 500ms 防抖
        } catch (error) {
            this.ae.log(`[ConfigManager] 防抖保存机制异常: ${error.message}`, 'error');
        }
    }

    // ========== 配置初始化流程 ==========
    
    /**
     * 异步配置初始化
     */
    async init() {
        this.ae.log('[ConfigManager] 开始配置初始化流程...', 'info');
        try {
            // 1. 加载配置文件
            await this.loadConfigFile();
            this.ae.log('[ConfigManager] 预设文件加载完成。', 'success');

            let needsDefaultConfig = false;

            // 2. 检查并执行迁移
            if (this.checkIfNeedsMigration()) {
                const migrationResult = await this.migrateOldConfig();
                if (!migrationResult.success) {
                    this.ae.log(`[ConfigManager] ⚠️ 配置迁移失败: ${migrationResult.error}`, 'warning');
                    needsDefaultConfig = true;
                }
            }

            // 3. 验证配置是否为新格式
            if (!this.fullConfig || !this.fullConfig.panels) {
                this.ae.log('[ConfigManager] ⚠️ 当前配置不是有效的新格式，需要创建默认配置。', 'warning');
                needsDefaultConfig = true;
            }

            // 4. 如果需要，创建并保存默认配置
            if (needsDefaultConfig) {
                this.ae.log('[ConfigManager] 创建默认的新格式配置...', 'info');
                this.fullConfig = this.getDefaultConfig();
                // 为所有面板创建默认配置
                const panelIds = ['panel1', 'panel2', 'panel3'];
                panelIds.forEach(id => {
                    this.fullConfig.panels[id] = this.getDefaultPanelConfig(id);
                });
                
                // 自定义面板名称
                this.fullConfig.panels['panel1'].name = 'Eagle2Ae 1@烟肉鸭';
                this.fullConfig.panels['panel2'].name = 'Eagle2Ae 2@烟肉鸭';
                this.fullConfig.panels['panel3'].name = 'Eagle2Ae 3@烟肉鸭';
                
                await this.saveConfigFile();
                this.ae.log('[ConfigManager] ✅ 默认配置已创建并保存。', 'success');
            }

            // 5. 加载当前面板配置
            this.loadPanelConfig();
            this.ae.log('[ConfigManager] 当前面板配置已加载。', 'info');

            // 6. 应用配置到 settingsManager
            this.applyPanelConfigToSettingsManager();
            this.ae.log('[ConfigManager] 配置已应用到当前会话。', 'info');

            // 7. 设置自动保存
            this.setupAutoSave();
            this.ae.log('[ConfigManager] 自动保存机制已启动。', 'success');

            this.ae.log('[ConfigManager] 🎉 配置初始化流程完成。', 'success');

        } catch (error) {
            console.error('[ConfigManager] ❌ 配置初始化过程中发生严重错误:', error);
            this.ae.log(`[ConfigManager] ❌ 配置初始化失败: ${error.message}`, 'error');
            await this.fallbackToDefault();
        }
    }

    /**
     * 降级到默认配置
     */
    async fallbackToDefault() {
        this.ae.log('[ConfigManager] 启用降级方案，强制使用默认配置...', 'warning');
        try {
            this.fullConfig = this.getDefaultConfig();
            const panelIds = ['panel1', 'panel2', 'panel3'];
            panelIds.forEach(id => {
                this.fullConfig.panels[id] = this.getDefaultPanelConfig(id);
            });
            this.fullConfig.panels['panel1'].name = 'Eagle2Ae 1@烟肉鸭';
            this.fullConfig.panels['panel2'].name = 'Eagle2Ae 2@烟肉鸭';
            this.fullConfig.panels['panel3'].name = 'Eagle2Ae 3@烟肉鸭';

            // 确保当前面板有配置
            if (!this.fullConfig.panels[this.ae.currentPanelId]) {
                 this.fullConfig.panels[this.ae.currentPanelId] = this.getDefaultPanelConfig();
            }
            this.currentPanelConfig = this.fullConfig.panels[this.ae.currentPanelId];

            this.applyPanelConfigToSettingsManager();
            await this.saveConfigFile();
            this.ae.log('[ConfigManager] ✅ 降级方案完成，已生成并保存默认配置。', 'success');
        } catch (fallbackError) {
            console.error('[ConfigManager] ❌ 降级方案执行失败:', fallbackError);
            this.ae.log(`[ConfigManager] ❌ 降级方案也失败了: ${fallbackError.message}`, 'error');
        }
    }
}
