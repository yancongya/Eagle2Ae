# 数据持久化

## 概述

数据持久化是 Eagle2Ae AE 扩展 JavaScript 核心功能的重要组件，提供了多种数据存储方案，包括 LocalStorage 封装、IndexedDB 支持、数据加密和数据迁移等功能。该系统确保用户数据的安全存储和高效访问。

## 核心特性

### 数据持久化
- **LocalStorage封装** - 提供易用的本地存储接口
- **IndexedDB支持** - 大容量结构化数据存储
- **数据加密** - 支持敏感数据加密存储
- **数据迁移** - 自动处理数据格式版本迁移

## 技术实现

### LocalStorage 封装

```javascript
/**
 * 本地存储管理器
 * 提供增强的LocalStorage功能
 */
class LocalStorageManager {
    /**
     * 构造函数
     */
    constructor() {
        // 存储配置
        this.config = {
            prefix: 'eagle2ae_', // 存储键前缀
            encryption: false,   // 是否启用加密
            compression: false,  // 是否启用压缩
            ttl: null           // 默认过期时间（毫秒）
        };
        
        // 加密密钥（在实际应用中应该更安全地管理）
        this.encryptionKey = 'default_key';
        
        console.log('💾 本地存储管理器已初始化');
    }
    
    /**
     * 设置存储项
     * @param {string} key - 存储键
     * @param {*} value - 存储值
     * @param {Object} options - 存储选项
     * @returns {boolean} 是否设置成功
     */
    set(key, value, options = {}) {
        try {
            const storageKey = this.config.prefix + key;
            let storageValue = value;
            
            // 处理过期时间
            const ttl = options.ttl || this.config.ttl;
            const expires = ttl ? Date.now() + ttl : null;
            
            // 创建存储对象
            const data = {
                value: storageValue,
                expires: expires,
                timestamp: Date.now()
            };
            
            // 数据压缩
            if (this.config.compression || options.compression) {
                data.value = this.compress(data.value);
            }
            
            // 数据加密
            if (this.config.encryption || options.encryption) {
                data.value = this.encrypt(data.value);
            }
            
            // 序列化数据
            const serializedData = JSON.stringify(data);
            
            // 存储数据
            localStorage.setItem(storageKey, serializedData);
            
            console.log(`💾 设置存储项: ${key}`);
            return true;
            
        } catch (error) {
            console.error(`❌ 设置存储项失败: ${key} - ${error.message}`);
            return false;
        }
    }
    
    /**
     * 获取存储项
     * @param {string} key - 存储键
     * @param {*} defaultValue - 默认值
     * @returns {*} 存储值
     */
    get(key, defaultValue = null) {
        try {
            const storageKey = this.config.prefix + key;
            const serializedData = localStorage.getItem(storageKey);
            
            if (!serializedData) {
                return defaultValue;
            }
            
            // 反序列化数据
            const data = JSON.parse(serializedData);
            
            // 检查过期时间
            if (data.expires && Date.now() > data.expires) {
                this.remove(key);
                return defaultValue;
            }
            
            let value = data.value;
            
            // 数据解密
            if (this.config.encryption) {
                value = this.decrypt(value);
            }
            
            // 数据解压缩
            if (this.config.compression) {
                value = this.decompress(value);
            }
            
            console.log(`📥 获取存储项: ${key}`);
            return value;
            
        } catch (error) {
            console.error(`❌ 获取存储项失败: ${key} - ${error.message}`);
            return defaultValue;
        }
    }
    
    /**
     * 移除存储项
     * @param {string} key - 存储键
     * @returns {boolean} 是否移除成功
     */
    remove(key) {
        try {
            const storageKey = this.config.prefix + key;
            localStorage.removeItem(storageKey);
            
            console.log(`🗑️ 移除存储项: ${key}`);
            return true;
            
        } catch (error) {
            console.error(`❌ 移除存储项失败: ${key} - ${error.message}`);
            return false;
        }
    }
    
    /**
     * 清空所有存储项
     * @returns {boolean} 是否清空成功
     */
    clear() {
        try {
            // 只清空带有指定前缀的存储项
            const prefix = this.config.prefix;
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log(`🗑️ 清空存储项 (${keysToRemove.length}项)`);
            return true;
            
        } catch (error) {
            console.error(`❌ 清空存储项失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 检查存储项是否存在
     * @param {string} key - 存储键
     * @returns {boolean} 是否存在
     */
    has(key) {
        try {
            const storageKey = this.config.prefix + key;
            const serializedData = localStorage.getItem(storageKey);
            
            if (!serializedData) {
                return false;
            }
            
            // 检查过期时间
            const data = JSON.parse(serializedData);
            if (data.expires && Date.now() > data.expires) {
                this.remove(key);
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error(`检查存储项失败: ${key} - ${error.message}`);
            return false;
        }
    }
    
    /**
     * 获取存储项信息
     * @param {string} key - 存储键
     * @returns {Object} 存储项信息
     */
    getInfo(key) {
        try {
            const storageKey = this.config.prefix + key;
            const serializedData = localStorage.getItem(storageKey);
            
            if (!serializedData) {
                return null;
            }
            
            const data = JSON.parse(serializedData);
            
            return {
                key: key,
                size: serializedData.length,
                expires: data.expires,
                timestamp: data.timestamp,
                isExpired: data.expires ? Date.now() > data.expires : false
            };
            
        } catch (error) {
            console.error(`获取存储项信息失败: ${key} - ${error.message}`);
            return null;
        }
    }
    
    /**
     * 获取所有存储项的键
     * @returns {Array} 存储项键数组
     */
    keys() {
        try {
            const prefix = this.config.prefix;
            const keys = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(prefix)) {
                    keys.push(key.substring(prefix.length));
                }
            }
            
            return keys;
            
        } catch (error) {
            console.error(`获取存储项键失败: ${error.message}`);
            return [];
        }
    }
    
    /**
     * 获取存储使用统计
     * @returns {Object} 统计信息
     */
    getStats() {
        try {
            const prefix = this.config.prefix;
            let totalSize = 0;
            let itemCount = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(prefix)) {
                    const value = localStorage.getItem(key);
                    totalSize += key.length + value.length;
                    itemCount++;
                }
            }
            
            return {
                itemCount: itemCount,
                totalSize: totalSize,
                prefix: prefix,
                quota: this.getStorageQuota()
            };
            
        } catch (error) {
            console.error(`获取存储统计失败: ${error.message}`);
            return {
                itemCount: 0,
                totalSize: 0,
                prefix: this.config.prefix,
                quota: this.getStorageQuota()
            };
        }
    }
    
    /**
     * 获取存储配额信息
     * @returns {Object} 配额信息
     */
    getStorageQuota() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                // 现代浏览器支持
                return 'Modern API available';
            } else {
                // 传统方式估算
                const testKey = '__storage_test__';
                const testValue = 'x'.repeat(1024); // 1KB测试数据
                let usedSpace = 0;
                
                try {
                    localStorage.setItem(testKey, testValue);
                    usedSpace = 1024;
                    localStorage.removeItem(testKey);
                } catch (e) {
                    // 存储已满
                }
                
                return {
                    used: usedSpace,
                    total: 5 * 1024 * 1024, // 通常约为5MB
                    available: 5 * 1024 * 1024 - usedSpace
                };
            }
        } catch (error) {
            return {
                error: error.message
            };
        }
    }
    
    /**
     * 数据压缩
     * @param {*} data - 要压缩的数据
     * @returns {string} 压缩后的数据
     */
    compress(data) {
        try {
            // 简单的压缩实现（在实际应用中可能需要更复杂的算法）
            const jsonString = JSON.stringify(data);
            // 这里只是一个示例，实际应用中应该使用真正的压缩算法
            return jsonString;
        } catch (error) {
            console.error(`数据压缩失败: ${error.message}`);
            return data;
        }
    }
    
    /**
     * 数据解压缩
     * @param {string} data - 要解压缩的数据
     * @returns {*} 解压缩后的数据
     */
    decompress(data) {
        try {
            // 简单的解压缩实现
            return JSON.parse(data);
        } catch (error) {
            console.error(`数据解压缩失败: ${error.message}`);
            return data;
        }
    }
    
    /**
     * 数据加密
     * @param {*} data - 要加密的数据
     * @returns {string} 加密后的数据
     */
    encrypt(data) {
        try {
            // 简单的加密实现（在实际应用中应该使用更安全的加密算法）
            const jsonString = JSON.stringify(data);
            // 这里只是一个示例，实际应用中应该使用真正的加密算法
            return btoa(jsonString);
        } catch (error) {
            console.error(`数据加密失败: ${error.message}`);
            return data;
        }
    }
    
    /**
     * 数据解密
     * @param {string} data - 要解密的数据
     * @returns {*} 解密后的数据
     */
    decrypt(data) {
        try {
            // 简单的解密实现
            const decoded = atob(data);
            return JSON.parse(decoded);
        } catch (error) {
            console.error(`数据解密失败: ${error.message}`);
            return data;
        }
    }
    
    /**
     * 清理过期数据
     * @returns {number} 清理的项数
     */
    cleanupExpired() {
        try {
            const prefix = this.config.prefix;
            let cleanedCount = 0;
            
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key.startsWith(prefix)) {
                    const serializedData = localStorage.getItem(key);
                    if (serializedData) {
                        try {
                            const data = JSON.parse(serializedData);
                            if (data.expires && Date.now() > data.expires) {
                                localStorage.removeItem(key);
                                cleanedCount++;
                            }
                        } catch (parseError) {
                            // 数据格式错误，移除
                            localStorage.removeItem(key);
                            cleanedCount++;
                        }
                    }
                }
            }
            
            console.log(`🧹 清理过期数据: ${cleanedCount}项`);
            return cleanedCount;
            
        } catch (error) {
            console.error(`清理过期数据失败: ${error.message}`);
            return 0;
        }
    }
}

// 导出本地存储管理器
const localStorageManager = new LocalStorageManager();
export default localStorageManager;

// 便利的存储函数
export function setStorage(key, value, options = {}) {
    return localStorageManager.set(key, value, options);
}

export function getStorage(key, defaultValue = null) {
    return localStorageManager.get(key, defaultValue);
}

export function removeStorage(key) {
    return localStorageManager.remove(key);
}

export function clearStorage() {
    return localStorageManager.clear();
}

export function hasStorage(key) {
    return localStorageManager.has(key);
}

export function getStorageInfo(key) {
    return localStorageManager.getInfo(key);
}

export function getStorageKeys() {
    return localStorageManager.keys();
}

export function getStorageStats() {
    return localStorageManager.getStats();
}

export function cleanupExpiredStorage() {
    return localStorageManager.cleanupExpired();
}
```

### IndexedDB 支持

```javascript
/**
 * IndexedDB 管理器
 * 提供结构化数据存储功能
 */
class IndexedDBManager {
    /**
     * 构造函数
     */
    constructor() {
        // 数据库配置
        this.config = {
            name: 'Eagle2AeDB',
            version: 1,
            stores: [
                {
                    name: 'settings',
                    keyPath: 'id',
                    indexes: [
                        { name: 'key', keyPath: 'key', unique: true }
                    ]
                },
                {
                    name: 'cache',
                    keyPath: 'id',
                    indexes: [
                        { name: 'key', keyPath: 'key', unique: true },
                        { name: 'expires', keyPath: 'expires' }
                    ]
                },
                {
                    name: 'logs',
                    keyPath: 'id',
                    indexes: [
                        { name: 'timestamp', keyPath: 'timestamp' },
                        { name: 'level', keyPath: 'level' }
                    ]
                }
            ]
        };
        
        // 数据库实例
        this.db = null;
        
        // 是否初始化完成
        this.initialized = false;
        
        console.log('🗄️ IndexedDB 管理器已初始化');
    }
    
    /**
     * 初始化数据库
     * @returns {Promise<boolean>} 是否初始化成功
     */
    async init() {
        try {
            if (this.initialized && this.db) {
                return true;
            }
            
            // 检查浏览器支持
            if (!window.indexedDB) {
                throw new Error('浏览器不支持 IndexedDB');
            }
            
            // 打开数据库
            const request = indexedDB.open(this.config.name, this.config.version);
            
            // 数据库升级事件
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建对象存储
                this.config.stores.forEach(storeConfig => {
                    if (!db.objectStoreNames.contains(storeConfig.name)) {
                        const store = db.createObjectStore(storeConfig.name, {
                            keyPath: storeConfig.keyPath
                        });
                        
                        // 创建索引
                        if (storeConfig.indexes) {
                            storeConfig.indexes.forEach(indexConfig => {
                                store.createIndex(indexConfig.name, indexConfig.keyPath, {
                                    unique: indexConfig.unique || false
                                });
                            });
                        }
                    }
                });
            };
            
            // 数据库打开成功
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.initialized = true;
                console.log('✅ IndexedDB 初始化完成');
            };
            
            // 数据库打开失败
            request.onerror = (event) => {
                throw new Error(`IndexedDB 初始化失败: ${event.target.error}`);
            };
            
            // 等待数据库打开完成
            await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.initialized = true;
                    console.log('✅ IndexedDB 初始化完成');
                    resolve();
                };
                
                request.onerror = (event) => {
                    reject(new Error(`IndexedDB 初始化失败: ${event.target.error}`));
                };
            });
            
            return true;
            
        } catch (error) {
            console.error(`❌ IndexedDB 初始化失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 获取对象存储
     * @param {string} storeName - 存储名称
     * @param {IDBTransactionMode} mode - 事务模式
     * @returns {IDBObjectStore} 对象存储
     */
    getObjectStore(storeName, mode = 'readonly') {
        try {
            if (!this.initialized || !this.db) {
                throw new Error('数据库未初始化');
            }
            
            if (!this.db.objectStoreNames.contains(storeName)) {
                throw new Error(`存储 "${storeName}" 不存在`);
            }
            
            const transaction = this.db.transaction([storeName], mode);
            return transaction.objectStore(storeName);
            
        } catch (error) {
            console.error(`获取对象存储失败: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 添加数据
     * @param {string} storeName - 存储名称
     * @param {Object} data - 数据
     * @returns {Promise<any>} 添加的键
     */
    async add(storeName, data) {
        try {
            await this.init();
            
            const store = this.getObjectStore(storeName, 'readwrite');
            const request = store.add(data);
            
            return await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    console.log(`✅ 数据添加成功: ${storeName}`);
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`数据添加失败: ${event.target.error}`));
                };
            });
            
        } catch (error) {
            console.error(`❌ 数据添加失败: ${storeName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 获取数据
     * @param {string} storeName - 存储名称
     * @param {any} key - 键
     * @returns {Promise<Object>} 数据
     */
    async get(storeName, key) {
        try {
            await this.init();
            
            const store = this.getObjectStore(storeName, 'readonly');
            const request = store.get(key);
            
            return await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    console.log(`📥 数据获取成功: ${storeName}`);
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`数据获取失败: ${event.target.error}`));
                };
            });
            
        } catch (error) {
            console.error(`❌ 数据获取失败: ${storeName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 更新数据
     * @param {string} storeName - 存储名称
     * @param {Object} data - 数据
     * @returns {Promise<any>} 更新的键
     */
    async put(storeName, data) {
        try {
            await this.init();
            
            const store = this.getObjectStore(storeName, 'readwrite');
            const request = store.put(data);
            
            return await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    console.log(`✅ 数据更新成功: ${storeName}`);
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`数据更新失败: ${event.target.error}`));
                };
            });
            
        } catch (error) {
            console.error(`❌ 数据更新失败: ${storeName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 删除数据
     * @param {string} storeName - 存储名称
     * @param {any} key - 键
     * @returns {Promise<boolean>} 是否删除成功
     */
    async delete(storeName, key) {
        try {
            await this.init();
            
            const store = this.getObjectStore(storeName, 'readwrite');
            const request = store.delete(key);
            
            return await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    console.log(`🗑️ 数据删除成功: ${storeName}`);
                    resolve(true);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`数据删除失败: ${event.target.error}`));
                };
            });
            
        } catch (error) {
            console.error(`❌ 数据删除失败: ${storeName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 清空存储
     * @param {string} storeName - 存储名称
     * @returns {Promise<boolean>} 是否清空成功
     */
    async clear(storeName) {
        try {
            await this.init();
            
            const store = this.getObjectStore(storeName, 'readwrite');
            const request = store.clear();
            
            return await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    console.log(`🗑️ 存储清空成功: ${storeName}`);
                    resolve(true);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`存储清空失败: ${event.target.error}`));
                };
            });
            
        } catch (error) {
            console.error(`❌ 存储清空失败: ${storeName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 获取所有数据
     * @param {string} storeName - 存储名称
     * @returns {Promise<Array>} 数据数组
     */
    async getAll(storeName) {
        try {
            await this.init();
            
            const store = this.getObjectStore(storeName, 'readonly');
            const request = store.getAll();
            
            return await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    console.log(`📥 所有数据获取成功: ${storeName}`);
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`所有数据获取失败: ${event.target.error}`));
                };
            });
            
        } catch (error) {
            console.error(`❌ 所有数据获取失败: ${storeName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 通过索引获取数据
     * @param {string} storeName - 存储名称
     * @param {string} indexName - 索引名称
     * @param {any} key - 键
     * @returns {Promise<Array>} 数据数组
     */
    async getByIndex(storeName, indexName, key) {
        try {
            await this.init();
            
            const store = this.getObjectStore(storeName, 'readonly');
            const index = store.index(indexName);
            const request = index.getAll(key);
            
            return await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    console.log(`📥 索引数据获取成功: ${storeName}.${indexName}`);
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`索引数据获取失败: ${event.target.error}`));
                };
            });
            
        } catch (error) {
            console.error(`❌ 索引数据获取失败: ${storeName}.${indexName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 获取存储统计信息
     * @param {string} storeName - 存储名称
     * @returns {Promise<Object>} 统计信息
     */
    async getStats(storeName) {
        try {
            await this.init();
            
            const store = this.getObjectStore(storeName, 'readonly');
            const request = store.count();
            
            const count = await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`统计信息获取失败: ${event.target.error}`));
                };
            });
            
            return {
                storeName: storeName,
                count: count
            };
            
        } catch (error) {
            console.error(`❌ 统计信息获取失败: ${storeName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 关闭数据库
     */
    close() {
        try {
            if (this.db) {
                this.db.close();
                this.db = null;
                this.initialized = false;
                console.log('🔒 数据库已关闭');
            }
        } catch (error) {
            console.error(`关闭数据库失败: ${error.message}`);
        }
    }
    
    /**
     * 删除数据库
     * @returns {Promise<boolean>} 是否删除成功
     */
    async deleteDatabase() {
        try {
            this.close();
            
            const request = indexedDB.deleteDatabase(this.config.name);
            
            return await new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    console.log('🗑️ 数据库删除成功');
                    resolve(true);
                };
                
                request.onerror = (event) => {
                    reject(new Error(`数据库删除失败: ${event.target.error}`));
                };
                
                request.onblocked = (event) => {
                    reject(new Error('数据库删除被阻止'));
                };
            });
            
        } catch (error) {
            console.error(`❌ 数据库删除失败: ${error.message}`);
            throw error;
        }
    }
}

// 导出 IndexedDB 管理器
const indexedDBManager = new IndexedDBManager();
export { indexedDBManager };

// 便利的 IndexedDB 函数
export async function initDB() {
    return await indexedDBManager.init();
}

export async function addData(storeName, data) {
    return await indexedDBManager.add(storeName, data);
}

export async function getData(storeName, key) {
    return await indexedDBManager.get(storeName, key);
}

export async function updateData(storeName, data) {
    return await indexedDBManager.put(storeName, data);
}

export async function deleteData(storeName, key) {
    return await indexedDBManager.delete(storeName, key);
}

export async function clearStore(storeName) {
    return await indexedDBManager.clear(storeName);
}

export async function getAllData(storeName) {
    return await indexedDBManager.getAll(storeName);
}

export async function getDataByIndex(storeName, indexName, key) {
    return await indexedDBManager.getByIndex(storeName, indexName, key);
}

export async function getDBStats(storeName) {
    return await indexedDBManager.getStats(storeName);
}

export function closeDB() {
    return indexedDBManager.close();
}

export async function deleteDB() {
    return await indexedDBManager.deleteDatabase();
}
```

## 使用示例

### 基本使用

```javascript
// 1. LocalStorage 使用
import { setStorage, getStorage, removeStorage } from './data-persistence.js';

// 设置数据
setStorage('user.preferences', {
    theme: 'dark',
    language: 'zh-CN'
});

// 获取数据
const preferences = getStorage('user.preferences', {
    theme: 'light',
    language: 'en-US'
});

// 移除数据
removeStorage('user.preferences');
```

### 高级使用

```javascript
// 1. 带过期时间的存储
import { setStorage, getStorage } from './data-persistence.js';

// 设置1小时后过期的数据
setStorage('session.token', 'abc123', {
    ttl: 60 * 60 * 1000 // 1小时
});

// 获取数据（如果过期会自动删除并返回默认值）
const token = getStorage('session.token', null);

// 2. IndexedDB 使用
import { initDB, addData, getData, getAllData } from './data-persistence.js';

// 初始化数据库
await initDB();

// 添加数据
await addData('settings', {
    id: 'theme',
    key: 'theme',
    value: 'dark',
    timestamp: Date.now()
});

// 获取数据
const themeSetting = await getData('settings', 'theme');

// 获取所有数据
const allSettings = await getAllData('settings');
```

### 数据加密

```javascript
// 1. 启用加密存储
import { setStorage, getStorage } from './data-persistence.js';

// 设置加密数据
setStorage('user.credentials', {
    username: 'user123',
    password: 'pass456'
}, {
    encryption: true
});

// 获取加密数据（自动解密）
const credentials = getStorage('user.credentials');
```

## 最佳实践

### 存储设计原则

1. **数据分类** - 合理分类不同类型的数据
2. **存储选择** - 根据数据特点选择合适的存储方案
3. **容量管理** - 监控存储使用情况，避免超出限制
4. **安全存储** - 敏感数据使用加密存储

### 性能优化

1. **批量操作** - 合并多个存储操作为批量操作
2. **数据压缩** - 对大体积数据使用压缩存储
3. **缓存策略** - 合理使用内存缓存减少存储访问
4. **过期清理** - 定期清理过期数据释放存储空间

### 调试技巧

1. **启用详细日志** - 在开发环境中启用存储操作日志
2. **监控存储使用** - 监控存储使用量和访问频率
3. **数据一致性** - 确保存储数据的一致性和完整性
4. **错误处理** - 统一处理存储操作异常