// Eagle2Ae - 配置类型定义和结构
// 版本: 2.0
// 用途: 定义多面板配置系统的数据结构和类型

/**
 * 配置作用域枚举
 * @enum {string}
 */
const ConfigScope = {
    GLOBAL: 'global',   // 全局作用域，所有面板共享
    PANEL: 'panel',     // 面板作用域，各面板独立
    SHARED: 'shared'    // 共享作用域，跨面板共享数据
};

/**
 * 面板 ID 枚举
 * @enum {string}
 */
const PanelId = {
    MAIN: 'main',       // 主面板
    IMPORT: 'import',   // 导入面板
    QUICK: 'quick'      // 快速工具面板
};

/**
 * 配置版本
 * @const {string}
 */
const CONFIG_VERSION = '2.0';

/**
 * 配置字段的作用域映射
 * 定义每个配置字段属于哪个作用域
 */
const CONFIG_SCOPE_MAP = {
    // 全局配置字段
    'language': ConfigScope.GLOBAL,
    'theme': ConfigScope.GLOBAL,
    'eagleServerUrl': ConfigScope.GLOBAL,
    'communicationPort': ConfigScope.GLOBAL,
    'soundSettings': ConfigScope.GLOBAL,
    
    // 面板独立配置字段
    'importSettings': ConfigScope.PANEL,
    'exportSettings': ConfigScope.PANEL,
    'uiSettings': ConfigScope.PANEL,
    'customSettings': ConfigScope.PANEL,
    
    // 共享配置字段
    'recentFolders': ConfigScope.SHARED,
    'favoriteSettings': ConfigScope.SHARED
};

/**
 * 默认全局配置
 * @typedef {Object} GlobalConfig
 * @property {string} language - 语言设置 (zh-CN, en-US)
 * @property {string} theme - 主题设置 (dark, light, ae_native)
 * @property {string} eagleServerUrl - Eagle 服务器地址
 * @property {number} communicationPort - 通信端口
 * @property {Object} soundSettings - 音效设置
 * @property {boolean} soundSettings.enabled - 是否启用音效
 * @property {number} soundSettings.volume - 音量 (0-100)
 */
const DEFAULT_GLOBAL_CONFIG = {
    language: 'zh-CN',
    theme: 'dark',
    eagleServerUrl: 'http://localhost:8080',
    communicationPort: 8080,
    soundSettings: {
        enabled: true,
        volume: 60
    }
};

/**
 * 默认 UI 设置
 * @typedef {Object} UISettings
 * @property {boolean} theme - 显示主题按钮
 * @property {boolean} language - 显示语言按钮
 * @property {boolean} log - 显示日志按钮
 * @property {boolean} projectInfo - 显示项目信息面板
 * @property {boolean} logPanel - 显示日志面板
 * @property {boolean} header - 显示标题栏
 * @property {boolean} fullscreen - 独显模式
 */
const DEFAULT_UI_SETTINGS = {
    theme: true,
    language: true,
    log: true,
    projectInfo: true,
    logPanel: true,
    header: true,
    fullscreen: false
};

/**
 * 默认面板配置
 * @typedef {Object} PanelConfig
 * @property {Object} importSettings - 导入设置
 * @property {Object} exportSettings - 导出设置
 * @property {UISettings} uiSettings - UI 面板组设置
 * @property {Object} customSettings - 自定义设置（扩展用）
 */
