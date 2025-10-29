# 配置管理规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的配置管理规范，确保项目配置的一致性、安全性和可维护性。

## 配置文件结构

### 标准配置目录

```
config/
├── development.json        # 开发环境配置
├── production.json         # 生产环境配置
├── test.json              # 测试环境配置
└── defaults.json          # 默认配置
```

### package.json 配置

```json
{
    "name": "eagle2ae-ae-extension",
    "version": "1.0.0",
    "description": "Eagle2Ae After Effects CEP Extension",
    "main": "js/main.js",
    "scripts": {
        "dev": "node scripts/dev.js",
        "build": "node scripts/build.js",
        "test": "node scripts/test.js",
        "test:unit": "node scripts/test.js --unit",
        "test:integration": "node scripts/test.js --integration",
        "lint": "eslint js/**/*.js jsx/**/*.jsx",
        "lint:fix": "eslint js/**/*.js jsx/**/*.jsx --fix",
        "format": "prettier --write js/**/*.js jsx/**/*.jsx public/**/*.{html,css}",
        "package": "node scripts/package.js",
        "deploy": "node scripts/deploy.js",
        "clean": "rimraf dist temp logs"
    },
    "keywords": [
        "adobe",
        "after-effects",
        "cep",
        "extension",
        "eagle",
        "workflow"
    ],
    "author": "Eagle2Ae Team",
    "license": "MIT",
    "engines": {
        "node": ">=14.0.0"
    },
    "devDependencies": {
        "eslint": "^8.0.0",
        "prettier": "^2.0.0",
        "rimraf": "^3.0.0",
        "archiver": "^5.0.0"
    },
    "cep": {
        "id": "com.eagle2ae.ae.extension",
        "version": "1.0.0",
        "hosts": [
            {
                "name": "AEFT",
                "version": "[18.0,99.9]"
            }
        ],
        "ui": {
            "type": "Panel",
            "menu": "Eagle2Ae",
            "geometry": {
                "size": {
                    "width": 350,
                    "height": 500
                },
                "min": {
                    "width": 300,
                    "height": 400
                },
                "max": {
                    "width": 800,
                    "height": 1200
                }
            }
        }
    }
}
```

### manifest.xml 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ExtensionManifest Version="7.0" ExtensionBundleId="com.eagle2ae.ae.extension" ExtensionBundleVersion="1.0.0" ExtensionBundleName="Eagle2Ae AE Extension">
    <ExtensionList>
        <Extension Id="com.eagle2ae.ae.extension" Version="1.0.0"/>
    </ExtensionList>
    
    <ExecutionEnvironment>
        <HostList>
            <Host Name="AEFT" Version="[18.0,99.9]"/>
        </HostList>
        <LocaleList>
            <Locale Code="All"/>
        </LocaleList>
        <RequiredRuntimeList>
            <RequiredRuntime Name="CSXS" Version="9.0"/>
        </RequiredRuntimeList>
    </ExecutionEnvironment>
    
    <DispatchInfoList>
        <Extension Id="com.eagle2ae.ae.extension">
            <DispatchInfo>
                <Resources>
                    <MainPath>./public/index.html</MainPath>
                    <ScriptPath>./jsx/hostscript.jsx</ScriptPath>
                    <CEFCommandLine>
                        <Parameter>--enable-nodejs</Parameter>
                        <Parameter>--mixed-context</Parameter>
                    </CEFCommandLine>
                </Resources>
                <Lifecycle>
                    <AutoVisible>true</AutoVisible>
                </Lifecycle>
                <UI>
                    <Type>Panel</Type>
                    <Menu>Eagle2Ae</Menu>
                    <Geometry>
                        <Size>
                            <Width>350</Width>
                            <Height>500</Height>
                        </Size>
                        <MinSize>
                            <Width>300</Width>
                            <Height>400</Height>
                        </MinSize>
                        <MaxSize>
                            <Width>800</Width>
                            <Height>1200</Height>
                        </MaxSize>
                    </Geometry>
                    <Icons>
                        <Icon Type="Normal">./public/images/icons/panel-icon.png</Icon>
                        <Icon Type="RollOver">./public/images/icons/panel-icon-hover.png</Icon>
                        <Icon Type="DarkNormal">./public/images/icons/panel-icon-dark.png</Icon>
                        <Icon Type="DarkRollOver">./public/images/icons/panel-icon-dark-hover.png</Icon>
                    </Icons>
                </UI>
            </DispatchInfo>
        </Extension>
    </DispatchInfoList>
</ExtensionManifest>
```

## 环境配置文件

### 开发环境配置 (config/development.json)

```json
{
    "server": {
        "url": "ws://localhost:8080",
        "timeout": 5000,
        "retryInterval": 3000,
        "maxRetries": 5
    },
    "logging": {
        "level": "debug",
        "console": true,
        "file": true,
        "maxFileSize": "10MB",
        "maxFiles": 5
    },
    "import": {
        "batchSize": 5,
        "timeout": 30000,
        "createComposition": true,
        "organizeFolders": true
    },
    "ui": {
        "theme": "auto",
        "showDebugInfo": true,
        "enableHotReload": true
    }
}
```

### 生产环境配置 (config/production.json)

```json
{
    "server": {
        "url": "ws://localhost:8080",
        "timeout": 10000,
        "retryInterval": 5000,
        "maxRetries": 3
    },
    "logging": {
        "level": "info",
        "console": false,
        "file": true,
        "maxFileSize": "5MB",
        "maxFiles": 3
    },
    "import": {
        "batchSize": 10,
        "timeout": 60000,
        "createComposition": false,
        "organizeFolders": true
    },
    "ui": {
        "theme": "auto",
        "showDebugInfo": false,
        "enableHotReload": false
    }
}
```

### 测试环境配置 (config/test.json)

```json
{
    "server": {
        "url": "ws://localhost:8080",
        "timeout": 3000,
        "retryInterval": 1000,
        "maxRetries": 2
    },
    "logging": {
        "level": "debug",
        "console": true,
        "file": false
    },
    "import": {
        "batchSize": 3,
        "timeout": 10000,
        "createComposition": false,
        "organizeFolders": false
    },
    "ui": {
        "theme": "light",
        "showDebugInfo": true
    }
}
```

## 配置管理类

### JavaScript 配置管理器 (js/services/config-manager.js)

```javascript
/**
 * 配置管理器
 * 负责加载和管理不同环境的配置
 */
class ConfigManager {
    constructor() {
        this.config = {};
        this.environment = this.detectEnvironment();
    }
    
    /**
     * 检测运行环境
     * @returns {string} 环境名称 ('development', 'production', 'test')
     */
    detectEnvironment() {
        // 优先使用环境变量
        if (process.env.NODE_ENV) {
            return process.env.NODE_ENV;
        }
        
        // 根据全局变量判断
        if (typeof window !== 'undefined' && window.__TEST__) {
            return 'test';
        }
        
        // 默认为开发环境
        return 'development';
    }
    
    /**
     * 加载配置
     * @returns {Promise<Object>} 配置对象
     */
    async loadConfig() {
        try {
            // 加载默认配置
            const defaultConfig = await this.loadDefaultConfig();
            
            // 加载环境特定配置
            const envConfig = await this.loadEnvironmentConfig();
            
            // 合并配置
            this.config = this.mergeConfigs(defaultConfig, envConfig);
            
            return this.config;
        } catch (error) {
            console.error('配置加载失败:', error);
            throw error;
        }
    }
    
    /**
     * 加载默认配置
     * @returns {Promise<Object>} 默认配置
     */
    async loadDefaultConfig() {
        try {
            const response = await fetch('./config/defaults.json');
            return await response.json();
        } catch (error) {
            console.warn('默认配置加载失败，使用空配置:', error);
            return {};
        }
    }
    
    /**
     * 加载环境特定配置
     * @returns {Promise<Object>} 环境配置
     */
    async loadEnvironmentConfig() {
        try {
            const response = await fetch(`./config/${this.environment}.json`);
            return await response.json();
        } catch (error) {
            console.warn(`环境配置 ${this.environment} 加载失败，使用空配置:`, error);
            return {};
        }
    }
    
    /**
     * 合并配置
     * @param {Object} defaultConfig - 默认配置
     * @param {Object} envConfig - 环境配置
     * @returns {Object} 合并后的配置
     */
    mergeConfigs(defaultConfig, envConfig) {
        // 深度合并配置
        return this.deepMerge({}, defaultConfig, envConfig);
    }
    
    /**
     * 深度合并对象
     * @param {Object} target - 目标对象
     * @param {...Object} sources - 源对象
     * @returns {Object} 合并后的对象
     */
    deepMerge(target, ...sources) {
        if (!sources.length) return target;
        
        const source = sources.shift();
        
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        
        return this.deepMerge(target, ...sources);
    }
    
    /**
     * 检查是否为对象
     * @param {*} item - 要检查的项
     * @returns {boolean} 是否为对象
     */
    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }
    
    /**
     * 获取配置值
     * @param {string} key - 配置键，支持点号分隔的嵌套键
     * @param {*} defaultValue - 默认值
     * @returns {*} 配置值
     */
    get(key, defaultValue = null) {
        if (!key) return this.config;
        
        // 支持点号分隔的嵌套键
        const keys = key.split('.');
        let value = this.config;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value !== undefined ? value : defaultValue;
    }
    
    /**
     * 设置配置值
     * @param {string} key - 配置键
     * @param {*} value - 配置值
     */
    set(key, value) {
        if (!key) return;
        
        // 支持点号分隔的嵌套键
        const keys = key.split('.');
        let target = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in target)) {
                target[k] = {};
            }
            target = target[k];
        }
        
        target[keys[keys.length - 1]] = value;
    }
    
    /**
     * 获取当前环境
     * @returns {string} 当前环境
     */
    getEnvironment() {
        return this.environment;
    }
    
    /**
     * 获取完整的配置对象
     * @returns {Object} 配置对象
     */
    getAll() {
        return this.config;
    }
}

// 导出单例实例
module.exports = new ConfigManager();
```

## 配置安全

### 敏感信息处理

```javascript
/**
 * 安全配置管理器
 * 处理敏感配置信息
 */
class SecureConfigManager extends ConfigManager {
    constructor() {
        super();
        this.sensitiveKeys = [
            'password',
            'secret',
            'key',
            'token',
            'apiKey'
        ];
    }
    
    /**
     * 过滤敏感信息
     * @param {Object} config - 配置对象
     * @returns {Object} 过滤后的配置对象
     */
    filterSensitiveInfo(config) {
        const filtered = JSON.parse(JSON.stringify(config));
        
        const filterObject = (obj) => {
            if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    if (this.sensitiveKeys.some(sensitiveKey => 
                        key.toLowerCase().includes(sensitiveKey.toLowerCase())
                    )) {
                        obj[key] = '[REDACTED]';
                    } else if (typeof obj[key] === 'object') {
                        filterObject(obj[key]);
                    }
                }
            }
        };
        
        filterObject(filtered);
        return filtered;
    }
    
    /**
     * 从环境变量加载敏感配置
     * @param {string} key - 环境变量键
     * @param {*} defaultValue - 默认值
     * @returns {*} 配置值
     */
    getFromEnv(key, defaultValue = null) {
        return process.env[key] || defaultValue;
    }
    
    /**
     * 安全地设置配置
     * @param {string} key - 配置键
     * @param {*} value - 配置值
     * @param {boolean} isSensitive - 是否为敏感信息
     */
    setSecure(key, value, isSensitive = false) {
        if (isSensitive) {
            // 敏感信息存储到环境变量或安全存储中
            process.env[key] = value;
        } else {
            this.set(key, value);
        }
    }
}

// 导出安全配置管理器
module.exports.SecureConfigManager = SecureConfigManager;
```

## 配置验证

### 配置验证器

```javascript
/**
 * 配置验证器
 * 验证配置的有效性
 */
class ConfigValidator {
    constructor() {
        this.validators = new Map();
        this.setupValidators();
    }
    
    /**
     * 设置验证器
     */
    setupValidators() {
        // 服务器配置验证
        this.validators.set('server', (config) => {
            const errors = [];
            
            if (!config.url) {
                errors.push('服务器URL不能为空');
            }
            
            if (typeof config.timeout !== 'number' || config.timeout <= 0) {
                errors.push('超时时间必须是正数');
            }
            
            if (typeof config.retryInterval !== 'number' || config.retryInterval <= 0) {
                errors.push('重试间隔必须是正数');
            }
            
            if (typeof config.maxRetries !== 'number' || config.maxRetries < 0) {
                errors.push('最大重试次数不能为负数');
            }
            
            return errors;
        });
        
        // 日志配置验证
        this.validators.set('logging', (config) => {
            const errors = [];
            const validLevels = ['debug', 'info', 'warn', 'error'];
            
            if (config.level && !validLevels.includes(config.level)) {
                errors.push(`日志级别必须是以下值之一: ${validLevels.join(', ')}`);
            }
            
            if (config.maxFileSize) {
                const sizeRegex = /^(\d+)(MB|KB|GB)$/;
                if (!sizeRegex.test(config.maxFileSize)) {
                    errors.push('最大文件大小格式不正确，应为数字+单位(MB/KB/GB)');
                }
            }
            
            return errors;
        });
        
        // 导入配置验证
        this.validators.set('import', (config) => {
            const errors = [];
            
            if (typeof config.batchSize !== 'number' || config.batchSize <= 0) {
                errors.push('批处理大小必须是正数');
            }
            
            if (typeof config.timeout !== 'number' || config.timeout <= 0) {
                errors.push('导入超时时间必须是正数');
            }
            
            if (typeof config.createComposition !== 'boolean') {
                errors.push('createComposition 必须是布尔值');
            }
            
            if (typeof config.organizeFolders !== 'boolean') {
                errors.push('organizeFolders 必须是布尔值');
            }
            
            return errors;
        });
    }
    
    /**
     * 验证配置
     * @param {Object} config - 配置对象
     * @returns {Object} 验证结果
     */
    validate(config) {
        const errors = [];
        
        for (const [section, validator] of this.validators) {
            if (config[section]) {
                const sectionErrors = validator(config[section]);
                errors.push(...sectionErrors.map(error => 
                    `配置节 ${section}: ${error}`
                ));
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * 添加自定义验证器
     * @param {string} section - 配置节名称
     * @param {Function} validator - 验证函数
     */
    addValidator(section, validator) {
        this.validators.set(section, validator);
    }
}

// 导出配置验证器
module.exports.ConfigValidator = ConfigValidator;
```

## 配置使用示例

### 在主应用中使用配置

```javascript
// js/main.js
const configManager = require('./services/config-manager');
const { ConfigValidator } = require('./services/config-manager');

class Eagle2AeExtension {
    constructor() {
        this.config = null;
        this.validator = new ConfigValidator();
    }
    
    async initialize() {
        try {
            // 加载配置
            this.config = await configManager.loadConfig();
            
            // 验证配置
            const validation = this.validator.validate(this.config);
            if (!validation.valid) {
                console.error('配置验证失败:', validation.errors);
                throw new Error('配置验证失败: ' + validation.errors.join(', '));
            }
            
            console.log('配置加载成功:', this.config);
            
            // 使用配置初始化其他组件
            this.initializeComponents();
            
        } catch (error) {
            console.error('扩展初始化失败:', error);
            throw error;
        }
    }
    
    initializeComponents() {
        // 使用配置初始化 WebSocket 客户端
        const serverConfig = configManager.get('server');
        this.websocketClient = new WebSocketClient(serverConfig.url, {
            timeout: serverConfig.timeout,
            retryInterval: serverConfig.retryInterval,
            maxRetries: serverConfig.maxRetries
        });
        
        // 使用配置初始化日志服务
        const loggingConfig = configManager.get('logging');
        this.logger = new Logger({
            level: loggingConfig.level,
            console: loggingConfig.console,
            file: loggingConfig.file
        });
        
        // 使用配置初始化文件管理器
        const importConfig = configManager.get('import');
        this.fileManager = new FileManager({
            batchSize: importConfig.batchSize,
            timeout: importConfig.timeout
        });
    }
    
    // 获取配置值的便捷方法
    getConfig(key, defaultValue = null) {
        return configManager.get(key, defaultValue);
    }
    
    // 更新配置值
    setConfig(key, value) {
        configManager.set(key, value);
    }
}

// 导出扩展实例
module.exports = new Eagle2AeExtension();
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始配置管理规范文档 | 开发团队 |

---

**相关文档**:
- [项目结构规范](./project-structure-standards.md)
- [版本控制规范](./version-control-standards.md)
- [构建打包规范](./build-packaging-standards.md)