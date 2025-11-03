// WebSocket消息协议定义
// Eagle2Ae WebSocket通信协议 v1.0

/**
 * WebSocket消息基础结构
 * {
 *   type: string,        // 消息类型
 *   id: string,          // 消息ID（用于请求-响应匹配）
 *   timestamp: number,   // 时间戳
 *   data: object,        // 消息数据
 *   source: string       // 消息来源 ('eagle' | 'ae')
 * }
 */

// 消息类型常量
const MESSAGE_TYPES = {
    // 连接管理
    CONNECTION: {
        HANDSHAKE: 'connection.handshake',           // 握手
        HANDSHAKE_ACK: 'connection.handshake_ack',   // 握手确认
        PING: 'connection.ping',                     // 心跳检测
        PONG: 'connection.pong',                     // 心跳响应
        DISCONNECT: 'connection.disconnect',         // 断开连接
        ERROR: 'connection.error'                    // 连接错误
    },
    
    // 文件操作
    FILE: {
        EXPORT_REQUEST: 'file.export_request',       // 导出请求
        EXPORT_RESPONSE: 'file.export_response',     // 导出响应
        IMPORT_START: 'file.import_start',           // 开始导入
        IMPORT_PROGRESS: 'file.import_progress',     // 导入进度
        IMPORT_COMPLETE: 'file.import_complete',     // 导入完成
        IMPORT_ERROR: 'file.import_error'            // 导入错误
    },
    
    // 状态同步
    STATUS: {
        EAGLE_STATUS: 'status.eagle',                // Eagle状态
        AE_STATUS: 'status.ae',                      // AE状态
        SYNC_REQUEST: 'status.sync_request',         // 状态同步请求
        SYNC_RESPONSE: 'status.sync_response'        // 状态同步响应
    },
    
    // 配置管理
    CONFIG: {
        GET_CONFIG: 'config.get',                    // 获取配置
        SET_CONFIG: 'config.set',                    // 设置配置
        CONFIG_CHANGED: 'config.changed'             // 配置变更通知
    },
    
    // 日志系统
    LOG: {
        MESSAGE: 'log.message',                      // 日志消息
        CLEAR: 'log.clear'                          // 清空日志
    }
};

// 连接状态
const CONNECTION_STATES = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    RECONNECTING: 'reconnecting',
    ERROR: 'error'
};

// 消息优先级
const MESSAGE_PRIORITY = {
    LOW: 0,
    NORMAL: 1,
    HIGH: 2,
    CRITICAL: 3
};

/**
 * 创建标准消息格式
 * @param {string} type - 消息类型
 * @param {object} data - 消息数据
 * @param {string} source - 消息来源
 * @param {string} id - 消息ID（可选）
 * @returns {object} 格式化的消息对象
 */
function createMessage(type, data = {}, source = 'eagle', id = null) {
    return {
        type,
        id: id || generateMessageId(),
        timestamp: Date.now(),
        data,
        source,
        version: '1.0'
    };
}

/**
 * 生成消息ID
 * @returns {string} 唯一消息ID
 */
function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 验证消息格式
 * @param {object} message - 待验证的消息
 * @returns {boolean} 是否有效
 */
function validateMessage(message) {
    if (!message || typeof message !== 'object') {
        return false;
    }
    
    const required = ['type', 'id', 'timestamp', 'data', 'source'];
    return required.every(field => message.hasOwnProperty(field));
}

/**
 * 创建错误消息
 * @param {string} error - 错误信息
 * @param {string} code - 错误代码
 * @param {string} originalId - 原始消息ID
 * @returns {object} 错误消息
 */
function createErrorMessage(error, code = 'UNKNOWN_ERROR', originalId = null) {
    return createMessage(MESSAGE_TYPES.CONNECTION.ERROR, {
        error,
        code,
        originalId
    });
}

/**
 * 创建响应消息
 * @param {string} originalId - 原始请求消息ID
 * @param {object} data - 响应数据
 * @param {boolean} success - 是否成功
 * @returns {object} 响应消息
 */
function createResponse(originalId, data = {}, success = true) {
    return createMessage('response', {
        success,
        originalId,
        ...data
    });
}

// 导出协议定义
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = {
        MESSAGE_TYPES,
        CONNECTION_STATES,
        MESSAGE_PRIORITY,
        createMessage,
        generateMessageId,
        validateMessage,
        createErrorMessage,
        createResponse
    };
} else {
    // 浏览器环境
    window.WebSocketProtocol = {
        MESSAGE_TYPES,
        CONNECTION_STATES,
        MESSAGE_PRIORITY,
        createMessage,
        generateMessageId,
        validateMessage,
        createErrorMessage,
        createResponse
    };
}
