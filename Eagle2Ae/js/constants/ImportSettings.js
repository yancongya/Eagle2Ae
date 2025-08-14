// Export to AE - 导入设置常量和默认配置

// 导入模式枚举
const ImportModes = {
    DIRECT: 'direct',
    PROJECT_ADJACENT: 'project_adjacent',
    CUSTOM_FOLDER: 'custom_folder'
};

// 时间轴放置选项
const TimelinePlacement = {
    CURRENT_TIME: 'current_time',
    SEQUENCE: 'sequence',
    STACK: 'stack'
};

// 存储键值
const STORAGE_KEYS = {
    IMPORT_SETTINGS: 'exportToAE_importSettings',
    USER_PREFERENCES: 'exportToAE_userPreferences',
    RECENT_FOLDERS: 'exportToAE_recentFolders'
};

// 默认设置
const DEFAULT_IMPORT_SETTINGS = {
    // 导入模式设置
    mode: ImportModes.PROJECT_ADJACENT,
    projectAdjacentFolder: 'Eagle_Assets',
    customFolderPath: '',
    
    // 导入行为设置
    addToComposition: true,
    timelineOptions: {
        enabled: true,
        placement: TimelinePlacement.CURRENT_TIME,
        sequenceInterval: 1.0
    },
    
    // 文件管理设置
    fileManagement: {
        keepOriginalName: true,
        addTimestamp: false,
        createTagFolders: false,
        deleteFromEagle: false
    },
    soundSettings: {
        enabled: true,
        volume: 60
    }
};

// 默认用户偏好
const DEFAULT_USER_PREFERENCES = {
    lastUsedMode: ImportModes.PROJECT_ADJACENT,
    favoriteFolder: '',
    autoSaveSettings: true,
    showWelcomeWizard: true,
    theme: 'ae_native',
    communicationPort: 8080
};

// 项目旁文件夹选项
const PROJECT_FOLDER_OPTIONS = [
    { value: 'Eagle_Assets', label: 'Eagle_Assets' },
    { value: 'Eagle_Import', label: 'Eagle_Import' },
    { value: 'Source_Files', label: 'Source_Files' },
    { value: 'Assets', label: 'Assets' },
    { value: 'Import', label: 'Import' },
    { value: 'custom', label: '自定义...' }
];

// 设置验证规则
const VALIDATION_RULES = {
    mode: {
        required: true,
        values: Object.values(ImportModes)
    },
    projectAdjacentFolder: {
        required: (settings) => settings.mode === ImportModes.PROJECT_ADJACENT,
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/
    },
    customFolderPath: {
        required: (settings) => settings.mode === ImportModes.CUSTOM_FOLDER,
        minLength: 1
    },
    sequenceInterval: {
        min: 0.1,
        max: 60.0
    },
    communicationPort: {
        min: 1024,
        max: 65535,
        type: 'number'
    }
};

// UI状态规则
const UI_STATE_RULES = {
    timelineOptionsEnabled: (settings) => settings.addToComposition,
    projectFolderVisible: (settings) => settings.mode === ImportModes.PROJECT_ADJACENT,
    customFolderVisible: (settings) => settings.mode === ImportModes.CUSTOM_FOLDER,
    sequenceIntervalVisible: (settings) => 
        settings.addToComposition && 
        settings.timelineOptions.enabled && 
        settings.timelineOptions.placement === TimelinePlacement.SEQUENCE
};

// 导出所有常量
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        ImportModes,
        TimelinePlacement,
        STORAGE_KEYS,
        DEFAULT_IMPORT_SETTINGS,
        DEFAULT_USER_PREFERENCES,
        PROJECT_FOLDER_OPTIONS,
        VALIDATION_RULES,
        UI_STATE_RULES
    };
} else {
    // 浏览器环境
    window.ImportSettingsConstants = {
        ImportModes,
        TimelinePlacement,
        STORAGE_KEYS,
        DEFAULT_IMPORT_SETTINGS,
        DEFAULT_USER_PREFERENCES,
        PROJECT_FOLDER_OPTIONS,
        VALIDATION_RULES,
        UI_STATE_RULES
    };
}
