# 模块系统

## 概述

模块系统是 Eagle2Ae AE 扩展 JavaScript 核心功能的基础组件，提供了完整的 ES6 模块兼容性封装和支持。该系统支持动态模块加载、依赖管理、命名空间隔离等功能。

## 核心特性

### 模块化架构
- **ES6模块系统** - 使用标准的ES6模块导入导出
- **动态模块加载** - 支持按需加载和懒加载
- **依赖管理** - 自动处理模块依赖关系
- **命名空间隔离** - 防止全局作用域污染

### 技术实现

```javascript
/**
 * 模块系统
 * 提供ES6模块的兼容性封装和支持
 */
class ModuleSystem {
    /**
     * 构造函数
     */
    constructor() {
        // 模块缓存
        this.modules = new Map();
        
        // 模块加载队列
        this.loadQueue = new Map();
        
        // 模块依赖图
        this.dependencyGraph = new Map();
        
        // 模块加载配置
        this.config = {
            baseUrl: './modules/',
            moduleSuffix: '.js',
            timeout: 10000, // 10秒超时
            maxRetries: 3,
            retryDelay: 1000
        };
        
        // 事件系统
        this.events = new EventEmitter();
        
        // 绑定方法上下文
        this.loadModule = this.loadModule.bind(this);
        this.defineModule = this.defineModule.bind(this);
        this.requireModule = this.requireModule.bind(this);
        this.unloadModule = this.unloadModule.bind(this);
        
        console.log('🔧 模块系统已初始化');
    }
    
    /**
     * 定义模块
     * @param {string} moduleName - 模块名称
     * @param {Array} dependencies - 依赖模块列表
     * @param {Function} factory - 模块工厂函数
     * @returns {Promise<Object>} 模块实例
     */
    async defineModule(moduleName, dependencies = [], factory) {
        try {
            console.log(`🔧 定义模块: ${moduleName}`);
            
            // 检查模块是否已存在
            if (this.modules.has(moduleName)) {
                console.warn(`⚠️ 模块已存在: ${moduleName}，将被覆盖`);
            }
            
            // 保存依赖关系
            this.dependencyGraph.set(moduleName, dependencies);
            
            // 加载依赖模块
            const resolvedDependencies = await this.loadDependencies(dependencies);
            
            // 执行工厂函数创建模块
            let moduleInstance;
            if (typeof factory === 'function') {
                moduleInstance = await factory(...resolvedDependencies);
            } else {
                moduleInstance = factory;
            }
            
            // 缓存模块
            this.modules.set(moduleName, {
                instance: moduleInstance,
                dependencies: dependencies,
                loadedAt: Date.now(),
                exports: {}
            });
            
            // 触发模块加载事件
            this.events.emit('module:loaded', {
                moduleName: moduleName,
                dependencies: dependencies,
                timestamp: Date.now()
            });
            
            console.log(`✅ 模块定义完成: ${moduleName}`);
            
            return moduleInstance;
            
        } catch (error) {
            console.error(`❌ 定义模块失败: ${moduleName} - ${error.message}`);
            
            // 触发模块加载错误事件
            this.events.emit('module:error', {
                moduleName: moduleName,
                error: error.message,
                timestamp: Date.now()
            });
            
            throw error;
        }
    }
    
    /**
     * 加载依赖模块
     * @param {Array} dependencies - 依赖模块列表
     * @returns {Promise<Array>} 已解析的依赖模块数组
     */
    async loadDependencies(dependencies) {
        try {
            if (!dependencies || dependencies.length === 0) {
                return [];
            }
            
            const resolvedModules = [];
            
            // 并行加载依赖模块
            const loadPromises = dependencies.map(async (dep) => {
                try {
                    const module = await this.loadModule(dep);
                    return module;
                } catch (loadError) {
                    throw new Error(`加载依赖模块失败: ${dep} - ${loadError.message}`);
                }
            });
            
            const modules = await Promise.all(loadPromises);
            resolvedModules.push(...modules);
            
            return resolvedModules;
            
        } catch (error) {
            console.error(`❌ 加载依赖模块失败: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 加载模块
     * @param {string} moduleName - 模块名称
     * @param {Object} options - 加载选项
     * @returns {Promise<Object>} 模块实例
     */
    async loadModule(moduleName, options = {}) {
        try {
            console.log(`📥 加载模块: ${moduleName}`);
            
            // 检查模块是否已在缓存中
            if (this.modules.has(moduleName)) {
                const cachedModule = this.modules.get(moduleName);
                
                // 检查模块是否过期（如果有缓存策略）
                if (!options.forceReload && this.isModuleFresh(cachedModule)) {
                    console.log(`📋 使用缓存模块: ${moduleName}`);
                    return cachedModule.instance;
                }
            }
            
            // 检查是否已在加载队列中
            if (this.loadQueue.has(moduleName)) {
                console.log(`⏳ 模块已在加载队列中: ${moduleName}`);
                return this.loadQueue.get(moduleName);
            }
            
            // 创建加载Promise
            const loadPromise = this.doLoadModule(moduleName, options);
            this.loadQueue.set(moduleName, loadPromise);
            
            try {
                const module = await loadPromise;
                return module;
            } finally {
                // 从加载队列中移除
                this.loadQueue.delete(moduleName);
            }
            
        } catch (error) {
            console.error(`❌ 加载模块失败: ${moduleName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 实际加载模块逻辑
     * @param {string} moduleName - 模块名称
     * @param {Object} options - 加载选项
     * @returns {Promise<Object>} 模块实例
     */
    async doLoadModule(moduleName, options = {}) {
        try {
            // 构建模块URL
            const moduleUrl = this.buildModuleUrl(moduleName);
            
            // 检查是否为内部模块
            if (this.isInternalModule(moduleName)) {
                return await this.loadInternalModule(moduleName);
            }
            
            // 加载外部模块
            const moduleCode = await this.fetchModuleCode(moduleUrl, options);
            const moduleInstance = await this.evaluateModule(moduleCode, moduleName);
            
            // 缓存模块
            this.modules.set(moduleName, {
                instance: moduleInstance,
                url: moduleUrl,
                loadedAt: Date.now(),
                version: options.version || '1.0.0'
            });
            
            console.log(`✅ 模块加载完成: ${moduleName}`);
            
            return moduleInstance;
            
        } catch (error) {
            console.error(`❌ 模块加载失败: ${moduleName} - ${error.message}`);
            
            // 触发错误事件
            this.events.emit('module:error', {
                moduleName: moduleName,
                error: error.message,
                timestamp: Date.now()
            });
            
            throw error;
        }
    }
    
    /**
     * 构建模块URL
     * @param {string} moduleName - 模块名称
     * @returns {string} 模块URL
     */
    buildModuleUrl(moduleName) {
        // 处理相对路径和绝对路径
        if (moduleName.startsWith('/') || moduleName.startsWith('./') || moduleName.startsWith('../')) {
            return moduleName;
        }
        
        // 处理CDN路径
        if (moduleName.startsWith('https://') || moduleName.startsWith('http://')) {
            return moduleName;
        }
        
        // 处理默认模块路径
        return `${this.config.baseUrl}${moduleName}${this.config.moduleSuffix}`;
    }
    
    /**
     * 检查是否为内部模块
     * @param {string} moduleName - 模块名称
     * @returns {boolean} 是否为内部模块
     */
    isInternalModule(moduleName) {
        const internalModules = [
            'core', 'utils', 'events', 'network', 'storage',
            'ui/components', 'ui/styles', 'config', 'logger'
        ];
        
        return internalModules.some(internal => moduleName.startsWith(internal));
    }
    
    /**
     * 加载内部模块
     * @param {string} moduleName - 模块名称
     * @returns {Object} 模块实例
     */
    async loadInternalModule(moduleName) {
        try {
            // 根据模块名称返回对应的内部模块
            switch (moduleName) {
                case 'core':
                    return await import('./core/core.js');
                    
                case 'utils':
                    return await import('./utils/utils.js');
                    
                case 'events':
                    return await import('./events/events.js');
                    
                case 'network':
                    return await import('./network/network.js');
                    
                case 'storage':
                    return await import('./storage/storage.js');
                    
                case 'ui/components':
                    return await import('./ui/components/components.js');
                    
                case 'ui/styles':
                    return await import('./ui/styles/styles.js');
                    
                case 'config':
                    return await import('./config/config.js');
                    
                case 'logger':
                    return await import('./logger/logger.js');
                    
                default:
                    throw new Error(`未知的内部模块: ${moduleName}`);
            }
            
        } catch (error) {
            console.error(`加载内部模块失败: ${moduleName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 获取模块代码
     * @param {string} url - 模块URL
     * @param {Object} options - 选项
     * @returns {Promise<string>} 模块代码
     */
    async fetchModuleCode(url, options = {}) {
        try {
            const fetchOptions = {
                method: 'GET',
                headers: {
                    'Accept': 'application/javascript',
                    'Cache-Control': options.cacheControl || 'no-cache'
                },
                timeout: options.timeout || this.config.timeout
            };
            
            // 添加认证头（如果需要）
            if (options.authToken) {
                fetchOptions.headers['Authorization'] = `Bearer ${options.authToken}`;
            }
            
            const response = await fetch(url, fetchOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const moduleCode = await response.text();
            
            // 验证模块代码（简单的语法检查）
            if (!this.isValidModuleCode(moduleCode)) {
                throw new Error('无效的模块代码');
            }
            
            return moduleCode;
            
        } catch (error) {
            console.error(`获取模块代码失败: ${url} - ${error.message}`);
            
            // 如果启用了重试，尝试重试
            if (options.retryCount < this.config.maxRetries) {
                console.log(`🔄 重试加载模块: ${url} (${options.retryCount + 1}/${this.config.maxRetries})`);
                
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                
                return await this.fetchModuleCode(url, {
                    ...options,
                    retryCount: (options.retryCount || 0) + 1
                });
            }
            
            throw error;
        }
    }
    
    /**
     * 验证模块代码
     * @param {string} code - 模块代码
     * @returns {boolean} 是否有效
     */
    isValidModuleCode(code) {
        try {
            // 简单的语法检查
            if (!code || typeof code !== 'string') {
                return false;
            }
            
            // 检查基本的JavaScript语法特征
            const hasExport = code.includes('export') || code.includes('module.exports');
            const hasImport = code.includes('import') || code.includes('require');
            
            // 至少应该包含导入或导出语句
            return hasExport || hasImport;
            
        } catch (error) {
            console.error(`验证模块代码失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 评估模块代码
     * @param {string} code - 模块代码
     * @param {string} moduleName - 模块名称
     * @returns {Object} 模块实例
     */
    async evaluateModule(code, moduleName) {
        try {
            // 在安全的沙箱环境中执行模块代码
            // 注意：在实际生产环境中，应该使用更严格的沙箱机制
            
            // 创建模块上下文
            const moduleContext = {
                exports: {},
                module: {
                    exports: {}
                },
                require: this.requireModule.bind(this),
                __dirname: this.getModuleDir(moduleName),
                __filename: moduleName
            };
            
            // 执行模块代码（注意：这是简化的实现，在生产环境中需要更安全的方式）
            const moduleFunction = new Function(
                'exports', 'module', 'require', '__dirname', '__filename',
                `"use strict";\n${code}`
            );
            
            moduleFunction(
                moduleContext.exports,
                moduleContext.module,
                moduleContext.require,
                moduleContext.__dirname,
                moduleContext.__filename
            );
            
            // 返回模块导出内容
            return moduleContext.module.exports || moduleContext.exports;
            
        } catch (error) {
            console.error(`评估模块代码失败: ${moduleName} - ${error.message}`);
            throw new Error(`模块代码执行失败: ${error.message}`);
        }
    }
    
    /**
     * 获取模块目录
     * @param {string} moduleName - 模块名称
     * @returns {string} 模块目录
     */
    getModuleDir(moduleName) {
        const lastSlashIndex = moduleName.lastIndexOf('/');
        if (lastSlashIndex !== -1) {
            return moduleName.substring(0, lastSlashIndex);
        }
        return '.';
    }
    
    /**
     * 请求模块
     * @param {string} moduleName - 模块名称
     * @returns {Object} 模块实例
     */
    requireModule(moduleName) {
        try {
            // 检查模块是否已加载
            if (this.modules.has(moduleName)) {
                return this.modules.get(moduleName).instance;
            }
            
            // 检查是否为Node.js内置模块
            if (this.isNodeBuiltin(moduleName)) {
                return this.getNodeBuiltin(moduleName);
            }
            
            // 加载模块
            const modulePromise = this.loadModule(moduleName);
            
            // 注意：在实际实现中，这里应该是同步的
            // 但由于我们使用了异步加载，这里返回一个Promise包装
            return modulePromise;
            
        } catch (error) {
            console.error(`请求模块失败: ${moduleName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 检查是否为Node.js内置模块
     * @param {string} moduleName - 模块名称
     * @returns {boolean} 是否为内置模块
     */
    isNodeBuiltin(moduleName) {
        const builtinModules = [
            'fs', 'path', 'util', 'events', 'stream', 'buffer',
            'crypto', 'zlib', 'os', 'process', 'console', 'url'
        ];
        
        return builtinModules.includes(moduleName);
    }
    
    /**
     * 获取Node.js内置模块
     * @param {string} moduleName - 模块名称
     * @returns {Object} 内置模块
     */
    getNodeBuiltin(moduleName) {
        // 在浏览器环境中，这些模块需要polyfill或者模拟实现
        switch (moduleName) {
            case 'path':
                return this.getPathPolyfill();
                
            case 'util':
                return this.getUtilPolyfill();
                
            case 'events':
                return this.getEventsPolyfill();
                
            default:
                console.warn(`⚠️ 不支持的Node.js内置模块: ${moduleName}`);
                return {};
        }
    }
    
    /**
     * 获取路径模块polyfill
     * @returns {Object} 路径模块
     */
    getPathPolyfill() {
        return {
            join: (...paths) => paths.join('/').replace(/\/+/g, '/'),
            resolve: (from, to) => {
                const resolved = new URL(to, new URL(from, document.baseURI)).href;
                return resolved;
            },
            dirname: (path) => {
                const lastSlashIndex = path.lastIndexOf('/');
                return lastSlashIndex === -1 ? '.' : path.substring(0, lastSlashIndex);
            },
            basename: (path) => {
                const lastSlashIndex = path.lastIndexOf('/');
                return lastSlashIndex === -1 ? path : path.substring(lastSlashIndex + 1);
            },
            extname: (path) => {
                const lastDotIndex = path.lastIndexOf('.');
                return lastDotIndex === -1 ? '' : path.substring(lastDotIndex);
            }
        };
    }
    
    /**
     * 获取工具模块polyfill
     * @returns {Object} 工具模块
     */
    getUtilPolyfill() {
        return {
            inherits: (ctor, superCtor) => {
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            },
            
            format: (format, ...args) => {
                let i = 0;
                return format.replace(/%s|%d|%j/g, (match) => {
                    const arg = args[i++];
                    switch (match) {
                        case '%s': return String(arg);
                        case '%d': return Number(arg);
                        case '%j': return JSON.stringify(arg);
                        default: return match;
                    }
                });
            },
            
            inspect: (obj) => {
                return JSON.stringify(obj, null, 2);
            }
        };
    }
    
    /**
     * 获取事件模块polyfill
     * @returns {Object} 事件模块
     */
    getEventsPolyfill() {
        return {
            EventEmitter: class EventEmitter {
                constructor() {
                    this.events = {};
                }
                
                on(event, listener) {
                    if (!this.events[event]) {
                        this.events[event] = [];
                    }
                    this.events[event].push(listener);
                    return this;
                }
                
                emit(event, ...args) {
                    if (this.events[event]) {
                        this.events[event].forEach(listener => {
                            listener.apply(this, args);
                        });
                    }
                    return this;
                }
                
                removeListener(event, listener) {
                    if (this.events[event]) {
                        const index = this.events[event].indexOf(listener);
                        if (index !== -1) {
                            this.events[event].splice(index, 1);
                        }
                    }
                    return this;
                }
                
                once(event, listener) {
                    const onceWrapper = (...args) => {
                        this.removeListener(event, onceWrapper);
                        listener.apply(this, args);
                    };
                    return this.on(event, onceWrapper);
                }
            }
        };
    }
    
    /**
     * 检查模块是否新鲜（未过期）
     * @param {Object} module - 模块对象
     * @returns {boolean} 是否新鲜
     */
    isModuleFresh(module) {
        try {
            // 检查模块加载时间（例如：超过1小时认为过期）
            const maxAge = 60 * 60 * 1000; // 1小时
            const now = Date.now();
            
            return (now - module.loadedAt) < maxAge;
            
        } catch (error) {
            console.error(`检查模块新鲜度失败: ${error.message}`);
            return true; // 默认认为新鲜
        }
    }
    
    /**
     * 卸载模块
     * @param {string} moduleName - 模块名称
     * @returns {boolean} 是否卸载成功
     */
    unloadModule(moduleName) {
        try {
            if (!this.modules.has(moduleName)) {
                console.warn(`⚠️ 模块不存在: ${moduleName}`);
                return false;
            }
            
            // 获取模块实例
            const module = this.modules.get(moduleName);
            
            // 执行模块清理逻辑（如果模块提供了cleanup方法）
            if (module.instance && typeof module.instance.cleanup === 'function') {
                try {
                    module.instance.cleanup();
                } catch (cleanupError) {
                    console.error(`模块清理失败: ${moduleName} - ${cleanupError.message}`);
                }
            }
            
            // 从缓存中移除模块
            this.modules.delete(moduleName);
            
            // 从依赖图中移除
            this.dependencyGraph.delete(moduleName);
            
            console.log(`🗑️ 模块已卸载: ${moduleName}`);
            
            // 触发模块卸载事件
            this.events.emit('module:unloaded', {
                moduleName: moduleName,
                timestamp: Date.now()
            });
            
            return true;
            
        } catch (error) {
            console.error(`❌ 卸载模块失败: ${moduleName} - ${error.message}`);
            return false;
        }
    }
    
    /**
     * 获取所有已加载的模块
     * @returns {Array} 模块列表
     */
    getLoadedModules() {
        return Array.from(this.modules.keys()).map(moduleName => ({
            name: moduleName,
            ...this.modules.get(moduleName)
        }));
    }
    
    /**
     * 清理模块系统
     */
    cleanup() {
        try {
            console.log('🧹 清理模块系统...');
            
            // 卸载所有模块
            for (const moduleName of Array.from(this.modules.keys())) {
                this.unloadModule(moduleName);
            }
            
            // 清空加载队列
            this.loadQueue.clear();
            
            // 清空依赖图
            this.dependencyGraph.clear();
            
            // 清理事件监听器
            this.events.removeAllListeners();
            
            console.log('✅ 模块系统清理完成');
            
        } catch (error) {
            console.error(`❌ 清理模块系统失败: ${error.message}`);
        }
    }
}

// 导出模块系统
const moduleSystem = new ModuleSystem();
export default moduleSystem;

// 便利的模块加载函数
export async function load(moduleName, options = {}) {
    return await moduleSystem.loadModule(moduleName, options);
}

export async function define(moduleName, dependencies, factory) {
    return await moduleSystem.defineModule(moduleName, dependencies, factory);
}

export function unload(moduleName) {
    return moduleSystem.unloadModule(moduleName);
}

export function getModules() {
    return moduleSystem.getLoadedModules();
}

// 全局模块加载器（兼容AMD/CommonJS）
if (typeof window !== 'undefined') {
    window.define = define;
    window.require = moduleSystem.requireModule.bind(moduleSystem);
    window.loadModule = load;
    window.unloadModule = unload;
    window.getModules = getModules;
}
```

## 使用示例

### 基本使用

```javascript
// 1. 加载模块
import { loadModule, defineModule } from './module-system.js';

// 2. 定义模块
const myModule = await defineModule('myModule', ['dependency1', 'dependency2'], 
    async (dep1, dep2) => {
        return {
            init: () => console.log('模块已初始化'),
            getData: () => '模块数据'
        };
    }
);

// 3. 使用模块
myModule.init();
console.log(myModule.getData());
```

### 高级使用

```javascript
// 1. 动态加载模块
const dynamicModule = await loadModule('dynamicModule', {
    forceReload: true,
    timeout: 5000
});

// 2. 模块依赖管理
const moduleWithDeps = await defineModule('moduleWithDeps', 
    ['utils', 'logger', 'config'], 
    async (utils, logger, config) => {
        // 模块实现
        return {
            process: (data) => {
                logger.info('处理数据:', data);
                return utils.processData(data, config.settings);
            }
        };
    }
);

// 3. 模块卸载
unloadModule('temporaryModule');
```

## 最佳实践

### 模块设计原则

1. **单一职责** - 每个模块只负责一个特定功能
2. **明确依赖** - 清晰声明模块依赖关系
3. **接口封装** - 通过导出接口隐藏内部实现
4. **错误处理** - 模块内部处理可能的错误

### 性能优化

1. **合理缓存** - 利用模块缓存避免重复加载
2. **按需加载** - 只在需要时加载模块
3. **依赖优化** - 减少不必要的依赖
4. **代码分割** - 将大模块拆分为小模块

### 调试技巧

1. **启用详细日志** - 在开发环境中启用模块加载日志
2. **监控加载性能** - 使用性能监控工具分析模块加载时间
3. **依赖分析** - 定期分析模块依赖关系图
4. **内存泄漏检测** - 监控模块卸载后的内存使用情况