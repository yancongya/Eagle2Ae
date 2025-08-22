// Eagle兼容的WebSocket实现
// 基于Eagle现有HTTP服务器，不依赖Node.js模块

class EagleCompatibleWebSocket {
    constructor(eagle2aeInstance) {
        this.eagle2ae = eagle2aeInstance;
        this.clients = new Map(); // 存储客户端连接
        this.messageQueue = []; // 消息队列
        this.isEnabled = false;
        
        // 模拟WebSocket的消息类型
        this.MESSAGE_TYPES = {
            CONNECTION: {
                HANDSHAKE: 'connection.handshake',
                HANDSHAKE_ACK: 'connection.handshake_ack',
                PING: 'connection.ping',
                PONG: 'connection.pong'
            },
            FILE: {
                EXPORT_REQUEST: 'file.export_request',
                IMPORT_COMPLETE: 'file.import_complete',
                IMPORT_PROGRESS: 'file.import_progress',
                IMPORT_ERROR: 'file.import_error'
            },
            STATUS: {
                EAGLE_STATUS: 'status.eagle',
                AE_STATUS: 'status.ae'
            }
        };
    }

    /**
     * 启用WebSocket模拟功能
     */
    enable() {
        this.isEnabled = true;
        this.eagle2ae.log('🔄 Eagle兼容WebSocket模式已启用', 'info');
        
        // 启动心跳检测
        this.startHeartbeat();
        
        return true;
    }

    /**
     * 禁用WebSocket功能
     */
    disable() {
        this.isEnabled = false;
        this.stopHeartbeat();
        this.clients.clear();
        this.eagle2ae.log('WebSocket模式已禁用', 'info');
    }

    /**
     * 注册客户端（通过HTTP轮询）
     */
    registerClient(clientId, clientInfo = {}) {
        if (!this.isEnabled) return false;

        const client = {
            id: clientId,
            lastSeen: Date.now(),
            info: clientInfo,
            messageQueue: []
        };

        this.clients.set(clientId, client);
        this.eagle2ae.log(`客户端已注册: ${clientId}`, 'info');

        // 发送欢迎消息
        this.sendToClient(clientId, this.MESSAGE_TYPES.CONNECTION.HANDSHAKE, {
            serverVersion: '2.0-eagle-compatible',
            supportedFeatures: ['file_export', 'status_sync', 'message_queue']
        });

        return true;
    }

    /**
     * 注销客户端
     */
    unregisterClient(clientId) {
        if (this.clients.has(clientId)) {
            this.clients.delete(clientId);
            this.eagle2ae.log(`客户端已注销: ${clientId}`, 'info');
        }
    }

    /**
     * 更新客户端活跃状态
     */
    updateClientActivity(clientId) {
        if (this.clients.has(clientId)) {
            this.clients.get(clientId).lastSeen = Date.now();
        }
    }

    /**
     * 发送消息到指定客户端
     */
    sendToClient(clientId, type, data = {}) {
        if (!this.isEnabled || !this.clients.has(clientId)) {
            return false;
        }

        const message = this.createMessage(type, data);
        const client = this.clients.get(clientId);
        client.messageQueue.push(message);

        // 限制客户端消息队列长度
        if (client.messageQueue.length > 50) {
            client.messageQueue = client.messageQueue.slice(-25);
        }

        return true;
    }

    /**
     * 广播消息到所有客户端
     */
    broadcast(type, data = {}) {
        if (!this.isEnabled) return 0;

        let sentCount = 0;
        this.clients.forEach((client, clientId) => {
            if (this.sendToClient(clientId, type, data)) {
                sentCount++;
            }
        });

        if (sentCount > 0) {
            this.eagle2ae.log(`广播消息: ${type} (${sentCount}个客户端)`, 'debug');
        }

        return sentCount;
    }

    /**
     * 获取客户端消息
     */
    getClientMessages(clientId) {
        if (!this.isEnabled || !this.clients.has(clientId)) {
            return [];
        }

        const client = this.clients.get(clientId);
        const messages = [...client.messageQueue];
        client.messageQueue = []; // 清空队列

        // 更新活跃状态
        this.updateClientActivity(clientId);

        return messages;
    }

    /**
     * 处理客户端消息
     */
    handleClientMessage(clientId, message) {
        if (!this.isEnabled) return;

        this.updateClientActivity(clientId);

        // 添加消息处理日志
        this.eagle2ae.log(`🔍 Eagle WebSocket处理消息: ${message.type} (客户端: ${clientId})`, 'info');

        // 处理不同类型的消息
        switch (message.type) {
            case this.MESSAGE_TYPES.CONNECTION.HANDSHAKE_ACK:
                this.handleHandshakeAck(clientId, message);
                break;

            case this.MESSAGE_TYPES.CONNECTION.PING:
                this.handlePing(clientId, message);
                break;

            case this.MESSAGE_TYPES.STATUS.AE_STATUS:
            case 'ae_status': // 兼容AE发送的原始消息类型
                this.handleAEStatus(clientId, message);
                break;

            case this.MESSAGE_TYPES.FILE.IMPORT_COMPLETE:
            case this.MESSAGE_TYPES.FILE.IMPORT_ERROR:
            case this.MESSAGE_TYPES.FILE.IMPORT_PROGRESS:
                this.handleFileMessage(clientId, message);
                break;

            default:
                this.eagle2ae.log(`未知消息类型: ${message.type}`, 'warning');
        }
    }

    /**
     * 处理握手确认
     */
    handleHandshakeAck(clientId, message) {
        this.eagle2ae.log(`客户端握手完成: ${clientId}`, 'success');
        
        // 发送当前Eagle状态
        this.sendToClient(clientId, this.MESSAGE_TYPES.STATUS.EAGLE_STATUS, {
            selectedFiles: this.eagle2ae.selectedFiles || [],
            config: this.eagle2ae.config || {},
            isReady: true
        });
    }

    /**
     * 处理心跳检测
     */
    handlePing(clientId, message) {
        this.sendToClient(clientId, this.MESSAGE_TYPES.CONNECTION.PONG, {
            timestamp: Date.now(),
            originalId: message.id
        });
    }

    /**
     * 处理AE状态更新
     */
    handleAEStatus(clientId, message) {
        this.eagle2ae.log(`📊 处理AE状态更新 (客户端: ${clientId})`, 'info');

        if (this.eagle2ae && this.eagle2ae.updateAEStatus) {
            this.eagle2ae.log(`🔄 调用主插件的updateAEStatus方法`, 'debug');
            this.eagle2ae.updateAEStatus(message.data);
        } else {
            this.eagle2ae.log(`❌ 主插件或updateAEStatus方法不可用`, 'error');
        }
    }

    /**
     * 处理文件相关消息
     */
    handleFileMessage(clientId, message) {
        if (this.eagle2ae && this.eagle2ae.handleAEMessage) {
            this.eagle2ae.handleAEMessage(message);
        }
    }

    /**
     * 创建标准消息格式
     */
    createMessage(type, data = {}) {
        return {
            type,
            id: this.generateMessageId(),
            timestamp: Date.now(),
            data,
            source: 'eagle',
            version: '2.0-eagle-compatible'
        };
    }

    /**
     * 生成消息ID
     */
    generateMessageId() {
        return `eagle_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    /**
     * 启动心跳检测
     */
    startHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }

        this.heartbeatTimer = setInterval(() => {
            this.checkClientHealth();
        }, 60000); // 每分钟检查一次
    }

    /**
     * 停止心跳检测
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    /**
     * 检查客户端健康状态
     */
    checkClientHealth() {
        const now = Date.now();
        const timeout = 5 * 60 * 1000; // 5分钟超时

        this.clients.forEach((client, clientId) => {
            if (now - client.lastSeen > timeout) {
                this.eagle2ae.log(`客户端超时，自动注销: ${clientId}`, 'warning');
                this.unregisterClient(clientId);
            }
        });
    }

    /**
     * 获取状态信息
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            clientCount: this.clients.size,
            messageQueueSize: this.messageQueue.length,
            clients: Array.from(this.clients.keys())
        };
    }

    /**
     * 检查是否有活跃客户端
     */
    hasActiveClients() {
        return this.isEnabled && this.clients.size > 0;
    }
}

// 导出类（Eagle环境兼容）
if (typeof window !== 'undefined') {
    window.EagleCompatibleWebSocket = EagleCompatibleWebSocket;
} else if (typeof global !== 'undefined') {
    global.EagleCompatibleWebSocket = EagleCompatibleWebSocket;
}
