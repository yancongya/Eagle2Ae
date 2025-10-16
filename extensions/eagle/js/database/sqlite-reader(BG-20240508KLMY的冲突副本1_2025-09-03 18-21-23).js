// 动态加载依赖模块
let sqlite3, path, os, fs;

if (typeof require !== 'undefined') {
    // Node.js环境
    sqlite3 = require('sqlite3').verbose();
    path = require('path');
    os = require('os');
    fs = require('fs');
} else {
    // 浏览器环境 - 这些模块不可用，需要提供替代方案
    console.warn('在浏览器环境中运行，某些Node.js模块不可用');
}

/**
 * EcoPaste数据库读取器
 * 用于读取EcoPaste应用的SQLite数据库
 */
class EcoPasteDatabaseReader {
    constructor() {
        this.db = null;
        this.dbPath = this.getEcoPasteDatabasePath();
    }

    /**
     * 获取EcoPaste数据库文件路径
     * @returns {string} 数据库文件路径
     */
    getEcoPasteDatabasePath() {
        // EcoPaste数据库存储路径
        const appDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'com.ayangweb.EcoPaste');
        const dbPath = path.join(appDataPath, 'EcoPaste.db');
        
        console.log('EcoPaste数据库路径:', dbPath);
        
        // 检查文件是否存在（仅在Node.js环境中）
        if (fs && fs.existsSync) {
            if (!fs.existsSync(dbPath)) {
                console.warn('EcoPaste数据库文件不存在:', dbPath);
                console.log('请确保EcoPaste应用已安装并运行过');
            } else {
                console.log('EcoPaste数据库文件存在');
            }
        }
        
        return dbPath;
    }

    /**
     * 连接数据库
     * @returns {Promise<void>}
     */
    connect() {
        return new Promise((resolve, reject) => {
            console.log('尝试连接EcoPaste数据库:', this.dbPath);
            
            // 检查运行环境
            if (!sqlite3) {
                const error = new Error('SQLite3模块不可用，请在Node.js环境中运行');
                console.error('数据库连接失败:', error.message);
                reject(error);
                return;
            }
            
            // 检查文件是否存在
            if (!fs.existsSync(this.dbPath)) {
                const error = new Error(`数据库文件不存在: ${this.dbPath}`);
                console.error('数据库连接失败:', error.message);
                reject(error);
                return;
            }
            
            // 检查文件权限
            try {
                fs.accessSync(this.dbPath, fs.constants.R_OK);
                console.log('数据库文件权限检查通过');
            } catch (permError) {
                const error = new Error(`数据库文件无读取权限: ${permError.message}`);
                console.error('数据库权限检查失败:', error.message);
                reject(error);
                return;
            }
            
            this.db = new sqlite3.Database(this.dbPath, sqlite3.OPEN_READONLY, (err) => {
                if (err) {
                    console.error('连接EcoPaste数据库失败:', err.message);
                    console.error('错误详情:', err);
                    reject(err);
                } else {
                    console.log('成功连接到EcoPaste数据库');
                    // 验证数据库表结构
                    this.verifyDatabaseStructure()
                        .then(() => {
                            console.log('数据库结构验证通过');
                            resolve();
                        })
                        .catch((verifyError) => {
                            console.error('数据库结构验证失败:', verifyError.message);
                            reject(verifyError);
                        });
                }
            });
        });
    }

    /**
     * 验证数据库表结构
     * @returns {Promise<void>}
     */
    verifyDatabaseStructure() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未连接'));
                return;
            }
            
            // 检查history表是否存在
            const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name='history'";
            
            this.db.get(sql, (err, row) => {
                if (err) {
                    reject(new Error(`数据库结构检查失败: ${err.message}`));
                } else if (!row) {
                    reject(new Error('数据库中不存在history表'));
                } else {
                    console.log('找到history表');
                    // 进一步检查表结构
                    this.checkTableColumns()
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }
    
    /**
     * 检查表列结构
     * @returns {Promise<void>}
     */
    checkTableColumns() {
        return new Promise((resolve, reject) => {
            const sql = "PRAGMA table_info(history)";
            
            this.db.all(sql, (err, columns) => {
                if (err) {
                    reject(new Error(`表结构检查失败: ${err.message}`));
                } else {
                    console.log('history表结构:', columns.map(col => col.name).join(', '));
                    
                    // 检查必要的列是否存在
                    const requiredColumns = ['id', 'type', 'value', 'createTime'];
                    const existingColumns = columns.map(col => col.name);
                    
                    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
                    
                    if (missingColumns.length > 0) {
                        reject(new Error(`缺少必要的列: ${missingColumns.join(', ')}`));
                    } else {
                        console.log('表结构验证通过');
                        resolve();
                    }
                }
            });
        });
    }

    /**
     * 关闭数据库连接
     * @returns {Promise<void>}
     */
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('关闭数据库连接失败:', err.message);
                        reject(err);
                    } else {
                        console.log('数据库连接已关闭');
                        this.db = null;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * 获取所有剪贴板历史记录
     * @param {number} limit 限制返回数量，默认100
     * @returns {Promise<Array>} 历史记录数组
     */
    getAllHistory(limit = 100) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未连接'));
                return;
            }

            console.log(`查询所有历史记录，限制数量: ${limit}`);
            
            const sql = `
                SELECT id, type, [group], value, search, count, width, height, 
                       favorite, createTime, note, subtype
                FROM history 
                ORDER BY createTime DESC 
                LIMIT ?
            `;

            this.db.all(sql, [limit], (err, rows) => {
                if (err) {
                    console.error('查询历史记录失败:', err.message);
                    reject(err);
                } else {
                    console.log(`成功查询到 ${rows.length} 条历史记录`);
                    if (rows.length > 0) {
                        console.log('最新记录示例:', {
                            id: rows[0].id,
                            type: rows[0].type,
                            createTime: rows[0].createTime,
                            contentPreview: (rows[0].value || '').substring(0, 50)
                        });
                    }
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 根据类型获取剪贴板历史记录
     * @param {string} type 类型 (text, image, files等)
     * @param {number} limit 限制返回数量
     * @returns {Promise<Array>} 历史记录数组
     */
    getHistoryByType(type, limit = 50) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未连接'));
                return;
            }

            const sql = `
                SELECT id, type, [group], value, search, count, width, height, 
                       favorite, createTime, note, subtype
                FROM history 
                WHERE type = ?
                ORDER BY createTime DESC 
                LIMIT ?
            `;

            this.db.all(sql, [type, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 搜索剪贴板历史记录
     * @param {string} searchText 搜索文本
     * @param {number} limit 限制返回数量
     * @returns {Promise<Array>} 历史记录数组
     */
    searchHistory(searchText, limit = 50) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未连接'));
                return;
            }

            const sql = `
                SELECT id, type, [group], value, search, count, width, height, 
                       favorite, createTime, note, subtype
                FROM history 
                WHERE search LIKE ? OR note LIKE ?
                ORDER BY createTime DESC 
                LIMIT ?
            `;

            const searchPattern = `%${searchText}%`;
            this.db.all(sql, [searchPattern, searchPattern, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 获取收藏的剪贴板记录
     * @param {number} limit 限制返回数量
     * @returns {Promise<Array>} 历史记录数组
     */
    getFavoriteHistory(limit = 50) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('数据库未连接'));
                return;
            }

            const sql = `
                SELECT id, type, [group], value, search, count, width, height, 
                       favorite, createTime, note, subtype
                FROM history 
                WHERE favorite = 1
                ORDER BY createTime DESC 
                LIMIT ?
            `;

            this.db.all(sql, [limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 测试数据库连接和读取功能
     * @returns {Promise<Object>} 测试结果
     */
    async testConnection() {
        try {
            await this.connect();
            const history = await this.getAllHistory(5);
            await this.close();
            
            return {
                success: true,
                message: '数据库连接测试成功',
                recordCount: history.length,
                sampleData: history
            };
        } catch (error) {
            return {
                success: false,
                message: '数据库连接测试失败',
                error: error.message
            };
        }
    }
}

// 支持不同的模块系统
if (typeof module !== 'undefined' && module.exports) {
    // Node.js/CommonJS 环境
    module.exports = EcoPasteDatabaseReader;
} else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.EcoPasteDatabaseReader = EcoPasteDatabaseReader;
}