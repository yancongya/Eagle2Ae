/**
 * Eagle2Ae 配置生成器
 * 用于生成符合新规范的配置文件
 */

class ConfigGenerator {
    constructor() {
        // 获取常量
        const constants = window.ImportSettingsConstants || require('../constants/ImportSettings.js');
        this.ImportModes = constants.ImportModes;
        this.ExportModes = constants.ExportModes;
        this.DEFAULT_IMPORT_SETTINGS = constants.DEFAULT_IMPORT_SETTINGS;
        this.DEFAULT_USER_PREFERENCES = constants.DEFAULT_USER_PREFERENCES;
        this.DEFAULT_UI_SETTINGS = constants.DEFAULT_UI_SETTINGS;
    }

    /**
     * 生成默认配置文件
     * @returns {Object} 完整的配置对象
     */
    generateDefaultConfig() {
        return {
            version: '2.0.0',
            metadata: {
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                modifiedBy: 'com.yanrouya.eagle2ae.panel1',
                migratedFrom: null,
                migrationDate: null
            },
            globalSettings: {
                communicationPort: 8080,
                autoSaveSettings: true,
                eagleServerUrl: 'http://localhost:8080'
            },
            panels: {
                'com.yanrouya.eagle2ae.panel1': this.generatePanelConfig('默认配置', '通用的默认配置，适合日常使用', {
                    importSettings: {
                        mode: this.ImportModes.PROJECT_ADJACENT,
                        addToComposition: true
                    },
                    uiSettings: {
                        fullscreenMode: false
                    }
                }),
                'com.yanrouya.eagle2ae.panel2': this.generatePanelConfig('快速预览', '快速预览模式，独显界面，适合快速操作', {
                    importSettings: {
                        mode: this.ImportModes.PROJECT_ADJACENT,
                        addToComposition: false
                    },
                    uiSettings: {
                        showThemeButton: true,
                        showLanguageButton: false,
                        showLogButton: false,
                        showProjectInfo: false,
                        showLogPanel: false,
                        fullscreenMode: true,
                        language: 'zh-CN'
                    }
                }),
                'com.yanrouya.eagle2ae.panel3': this.generatePanelConfig('音频项目', '专为音频项目优化的配置', {
                    importSettings: {
                        mode: this.ImportModes.PROJECT_ADJACENT,
                        addToComposition: true,
                        timelineOptions: {
                            enabled: true,
                            placement: 'current_time'
                        }
                    },
                    userPreferences: {
                        communicationPort: 8081
                    },
                    uiSettings: {
                        showThemeButton: false,
                        language: 'en-US'
                    }
                })
            }
        };
    }

    /**
     * 生成单个面板配置
     * @param {string} name - 面板名称
     * @param {string} description - 面板描述
     * @param {Object} overrides - 覆盖的配置
     * @returns {Object} 面板配置对象
     */
    generatePanelConfig(name, description, overrides = {}) {
        const baseConfig = {
            name: name,
            description: description,
            lastUsed: new Date().toISOString(),
            importSettings: { ...this.DEFAULT_IMPORT_SETTINGS },
            userPreferences: { ...this.DEFAULT_USER_PREFERENCES },
            uiSettings: { ...this.DEFAULT_UI_SETTINGS },
            projectAdjacentSettings: {
                folderName: 'Eagle_Assets'
            },
            customFolderSettings: {
                folderPath: '',
                recentFolders: [],
                directoryHandle: {}
            }
        };

        // 深度合并覆盖配置
        return this.deepMerge(baseConfig, overrides);
    }

    /**
     * 从旧配置迁移到新配置
     * @param {Object} oldConfig - 旧配置对象
     * @returns {Object} 新配置对象
     */
    migrateFromOldConfig(oldConfig) {
        const newConfig = this.generateDefaultConfig();

        // 更新元数据
        newConfig.metadata.migratedFrom = oldConfig.version || '1.0.0';
        newConfig.metadata.migrationDate = new Date().toISOString();

        // 如果旧配置有全局设置，迁移它
        if (oldConfig.globalSettings) {
            newConfig.globalSettings = {
                ...newConfig.globalSettings,
                ...oldConfig.globalSettings
            };
            // 确保有 eagleServerUrl
            if (!newConfig.globalSettings.eagleServerUrl) {
                newConfig.globalSettings.eagleServerUrl = 'http://localhost:8080';
            }
        }

        // 迁移面板配置
        if (oldConfig.panels) {
            for (const [panelId, panelConfig] of Object.entries(oldConfig.panels)) {
                newConfig.panels[panelId] = this.migratePanelConfig(panelConfig);
            }
        }

        return newConfig;
    }

    /**
     * 迁移单个面板配置
     * @param {Object} oldPanelConfig - 旧面板配置
     * @returns {Object} 新面板配置
     */
    migratePanelConfig(oldPanelConfig) {
        const newPanelConfig = this.generatePanelConfig(
            oldPanelConfig.name || '未命名面板',
            oldPanelConfig.description || '',
            {}
        );

        // 迁移导入设置
        if (oldPanelConfig.importSettings) {
            newPanelConfig.importSettings = {
                ...newPanelConfig.importSettings,
                ...oldPanelConfig.importSettings
            };
            
            // 确保 exportSettings 有 burnAfterReading
            if (newPanelConfig.importSettings.exportSettings) {
                if (!('burnAfterReading' in newPanelConfig.importSettings.exportSettings)) {
                    newPanelConfig.importSettings.exportSettings.burnAfterReading = true;
                }
            }
        }

        // 迁移用户偏好（移除废弃字段）
        if (oldPanelConfig.userPreferences) {
            const oldPrefs = oldPanelConfig.userPreferences;
            newPanelConfig.userPreferences = {
                favoriteFolder: oldPrefs.favoriteFolder || '',
                favoriteExportFolder: oldPrefs.favoriteExportFolder || '',
                communicationPort: oldPrefs.communicationPort || 8080
            };
        }

        // 迁移UI设置
        if (oldPanelConfig.uiSettings) {
            const oldUI = oldPanelConfig.uiSettings;
            newPanelConfig.uiSettings = {
                showThemeButton: oldUI.theme !== undefined ? oldUI.theme : true,
                showLanguageButton: oldUI.language !== undefined ? oldUI.language : true,
                showLogButton: oldUI.log !== undefined ? oldUI.log : true,
                showProjectInfo: oldUI.projectInfo !== undefined ? oldUI.projectInfo : true,
                showLogPanel: oldUI.logPanel !== undefined ? oldUI.logPanel : true,
                showHeader: oldUI.header !== undefined ? oldUI.header : true,
                fullscreenMode: oldUI.fullscreen !== undefined ? oldUI.fullscreen : false,
                theme: this.migrateTheme(oldPanelConfig.userPreferences?.theme || oldPanelConfig.aeTheme || 'dark'),
                language: oldPanelConfig.language || 'zh-CN'
            };
        }

        // 迁移其他设置
        if (oldPanelConfig.projectAdjacentSettings) {
            newPanelConfig.projectAdjacentSettings = oldPanelConfig.projectAdjacentSettings;
        }

        if (oldPanelConfig.customFolderSettings) {
            newPanelConfig.customFolderSettings = oldPanelConfig.customFolderSettings;
        }

        // 保留最后使用时间
        if (oldPanelConfig.lastUsed) {
            newPanelConfig.lastUsed = oldPanelConfig.lastUsed;
        }

        return newPanelConfig;
    }

    /**
     * 迁移主题值
     * @param {string} oldTheme - 旧主题值
     * @returns {string} 新主题值
     */
    migrateTheme(oldTheme) {
        if (oldTheme === 'ae_native' || oldTheme === 'light') {
            return 'light';
        }
        return 'dark';
    }

    /**
     * 深度合并对象
     * @param {Object} target - 目标对象
     * @param {Object} source - 源对象
     * @returns {Object} 合并后的对象
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }

        return result;
    }

    /**
     * 验证配置文件
     * @param {Object} config - 配置对象
     * @returns {Object} 验证结果 {valid: boolean, errors: string[]}
     */
    validateConfig(config) {
        const errors = [];

        // 检查版本
        if (!config.version || config.version !== '2.0.0') {
            errors.push('配置版本不正确，应该是 2.0.0');
        }

        // 检查元数据
        if (!config.metadata) {
            errors.push('缺少 metadata');
        }

        // 检查全局设置
        if (!config.globalSettings) {
            errors.push('缺少 globalSettings');
        } else {
            if (!config.globalSettings.eagleServerUrl) {
                errors.push('globalSettings 缺少 eagleServerUrl');
            }
        }

        // 检查面板配置
        if (!config.panels || typeof config.panels !== 'object') {
            errors.push('缺少 panels 或格式不正确');
        } else {
            for (const [panelId, panelConfig] of Object.entries(config.panels)) {
                const panelErrors = this.validatePanelConfig(panelId, panelConfig);
                errors.push(...panelErrors);
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 验证面板配置
     * @param {string} panelId - 面板ID
     * @param {Object} panelConfig - 面板配置
     * @returns {string[]} 错误列表
     */
    validatePanelConfig(panelId, panelConfig) {
        const errors = [];
        const prefix = `面板 ${panelId}:`;

        // 检查必需字段
        if (!panelConfig.name) {
            errors.push(`${prefix} 缺少 name`);
        }

        if (!panelConfig.importSettings) {
            errors.push(`${prefix} 缺少 importSettings`);
        }

        if (!panelConfig.userPreferences) {
            errors.push(`${prefix} 缺少 userPreferences`);
        } else {
            // 检查是否有废弃字段
            const deprecatedFields = ['lastUsedMode', 'lastUsedExportMode', 'showWelcomeWizard', 'autoSaveSettings', 'theme'];
            for (const field of deprecatedFields) {
                if (field in panelConfig.userPreferences) {
                    errors.push(`${prefix} userPreferences 包含废弃字段 ${field}`);
                }
            }
        }

        if (!panelConfig.uiSettings) {
            errors.push(`${prefix} 缺少 uiSettings`);
        } else {
            // 检查UI设置字段名
            const oldFieldNames = ['theme', 'language', 'log', 'projectInfo', 'logPanel', 'header', 'fullscreen'];
            const newFieldNames = ['showThemeButton', 'showLanguageButton', 'showLogButton', 'showProjectInfo', 'showLogPanel', 'showHeader', 'fullscreenMode'];
            
            for (let i = 0; i < oldFieldNames.length; i++) {
                if (oldFieldNames[i] in panelConfig.uiSettings && typeof panelConfig.uiSettings[oldFieldNames[i]] === 'boolean') {
                    errors.push(`${prefix} uiSettings 使用了旧字段名 ${oldFieldNames[i]}，应该是 ${newFieldNames[i]}`);
                }
            }

            // 检查是否有 theme 和 language 字段
            if (!('theme' in panelConfig.uiSettings)) {
                errors.push(`${prefix} uiSettings 缺少 theme 字段`);
            }
            if (!('language' in panelConfig.uiSettings)) {
                errors.push(`${prefix} uiSettings 缺少 language 字段`);
            }
        }

        // 检查是否有顶层的 language 和 aeTheme 字段（应该移除）
        if ('language' in panelConfig && panelConfig.language !== undefined) {
            errors.push(`${prefix} 顶层不应该有 language 字段，应该在 uiSettings.language`);
        }
        if ('aeTheme' in panelConfig) {
            errors.push(`${prefix} 顶层不应该有 aeTheme 字段，应该使用 uiSettings.theme`);
        }

        return errors;
    }

    /**
     * 生成配置文件的JSON字符串
     * @param {Object} config - 配置对象
     * @param {boolean} pretty - 是否格式化
     * @returns {string} JSON字符串
     */
    toJSON(config, pretty = true) {
        if (pretty) {
            return JSON.stringify(config, null, 2);
        }
        return JSON.stringify(config);
    }

    /**
     * 从JSON字符串加载配置
     * @param {string} jsonString - JSON字符串
     * @returns {Object} 配置对象
     */
    fromJSON(jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('JSON解析失败:', error);
            throw new Error('配置文件格式错误');
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigGenerator;
} else {
    window.ConfigGenerator = ConfigGenerator;
}
