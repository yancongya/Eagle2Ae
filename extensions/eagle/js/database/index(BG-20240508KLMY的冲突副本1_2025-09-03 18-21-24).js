const databaseManager = require('./database-manager');

/**
 * 数据库API接口
 * 提供给Eagle插件其他模块使用的数据库操作接口
 */
class DatabaseAPI {
    constructor() {
        this.manager = databaseManager;
        this.initialized = false;
    }

    /**
     * 初始化数据库
     * @returns {Promise<Object>} 初始化结果
     */
    async init() {
        try {
            const success = await this.manager.initialize();
            this.initialized = success;
            
            if (success) {
                const stats = await this.manager.getStatistics();
                return {
                    success: true,
                    message: 'EcoPaste数据库连接成功',
                    statistics: stats
                };
            } else {
                return {
                    success: false,
                    message: 'EcoPaste数据库连接失败',
                    error: '无法连接到数据库文件'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'EcoPaste数据库初始化失败',
                error: error.message
            };
        }
    }

    /**
     * 关闭数据库连接
     */
    async close() {
        await this.manager.close();
        this.initialized = false;
    }

    /**
     * 检查数据库是否可用
     * @returns {boolean} 数据库状态
     */
    isReady() {
        return this.initialized && this.manager.isReady();
    }

    /**
     * 获取剪贴板历史记录
     * @param {Object} params 查询参数
     * @returns {Promise<Object>} 查询结果
     */
    async getHistory(params = {}) {
        if (!this.isReady()) {
            return {
                success: false,
                message: '数据库未初始化',
                data: []
            };
        }

        try {
            const data = await this.manager.getClipboardHistory(params);
            return {
                success: true,
                message: `获取到 ${data.length} 条记录`,
                data: data,
                count: data.length
            };
        } catch (error) {
            return {
                success: false,
                message: '获取历史记录失败',
                error: error.message,
                data: []
            };
        }
    }

    /**
     * 获取最近的剪贴板项目
     * @param {number} count 数量
     * @returns {Promise<Object>} 查询结果
     */
    async getRecent(count = 10) {
        return await this.getHistory({ limit: count });
    }

    /**
     * 按类型获取剪贴板项目
     * @param {string} type 类型
     * @param {number} count 数量
     * @returns {Promise<Object>} 查询结果
     */
    async getByType(type, count = 20) {
        return await this.getHistory({ type, limit: count });
    }

    /**
     * 搜索剪贴板项目
     * @param {string} query 搜索查询
     * @param {number} count 数量
     * @returns {Promise<Object>} 查询结果
     */
    async search(query, count = 30) {
        return await this.getHistory({ search: query, limit: count });
    }

    /**
     * 获取收藏的剪贴板项目
     * @param {number} count 数量
     * @returns {Promise<Object>} 查询结果
     */
    async getFavorites(count = 50) {
        return await this.getHistory({ favoriteOnly: true, limit: count });
    }

    /**
     * 获取统计信息
     * @returns {Promise<Object>} 统计信息
     */
    async getStats() {
        if (!this.isReady()) {
            return {
                success: false,
                message: '数据库未初始化',
                data: null
            };
        }

        try {
            const stats = await this.manager.getStatistics();
            return {
                success: true,
                message: '获取统计信息成功',
                data: stats
            };
        } catch (error) {
            return {
                success: false,
                message: '获取统计信息失败',
                error: error.message,
                data: null
            };
        }
    }

    /**
     * 获取数据库状态信息
     * @returns {Object} 状态信息
     */
    getStatus() {
        return {
            initialized: this.initialized,
            ready: this.isReady(),
            dbPath: this.manager.ecoReader.dbPath
        };
    }
}

// 创建API实例
const databaseAPI = new DatabaseAPI();

// 导出API实例和类
module.exports = {
    DatabaseAPI,
    api: databaseAPI,
    // 便捷方法
    init: () => databaseAPI.init(),
    close: () => databaseAPI.close(),
    isReady: () => databaseAPI.isReady(),
    getRecent: (count) => databaseAPI.getRecent(count),
    getByType: (type, count) => databaseAPI.getByType(type, count),
    search: (query, count) => databaseAPI.search(query, count),
    getFavorites: (count) => databaseAPI.getFavorites(count),
    getStats: () => databaseAPI.getStats(),
    getStatus: () => databaseAPI.getStatus()
};