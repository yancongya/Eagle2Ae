// Eagle2Ae WebSocket客户端实现
// 用于AE扩展与Eagle插件的实时通信

class Eagle2AeWebSocketClient {
    constructor(url = 'ws://localhost:8080/ws', aeExtension = null) {
        this.url = url;
        this.aeExtension = aeExtension;
        this.ws = null;
        this.connectionState = 'disconnected';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000; // 2秒
        this.heartbeatInterval = 30000; // 30秒
        this.heartbeatTimer = null;
        this.lastPingTime = 0;
        
        // 消息处理
        this.messageHandlers = new Map();
        this.pendingRequests = new Map();
        this.requestTimeout = 10000; // 10秒请求超时
        
        // 统计信息
        this.stats = {
            messagesReceived: 0,
            messagesSent: 0,
            reconnections: 0,
            errors: 0
        };

        // 设置消息处理器
        this.setupMessageHandlers();
    }

    /**
     * 连接到WebSocket服务器
     */
    async connect() {
        if (this.connectionState === 'connecting' || this.connectionState === 'connected') {
            return;
        }

        try {
            this.connectionState = 'connecting';
            this.log('正在连接到Eagle WebSocket服务器...', 'info');

            this.ws = new WebSocket(this.url);
            
            // 设置事件监听器
            this.setupWebSocketEvents();

            // 等待连接建立
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('连接超时'));
                }, 5000);

                this.ws.onopen = () => {
                    clearTimeout(timeout);
                    resolve();
                };

                this.ws.onerror = (error) => {
                    clearTimeout(timeout);
                    reject(error);
                };
            });

        } catch (error) {
            this.connectionState = 'disconnected';
            this.log(`WebSocket连接失败: ${error.message}`, 'error');
            this.stats.errors++;
            throw error;
        }
    }

    /**
     * 断开WebSocket连接
     */
    disconnect() {
        this.connectionState = 'disconnecting';
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        
        this.connectionState = 'disconnected';
        this.log('已断开WebSocket连接', 'info');
    }

    /**
     * 设置WebSocket事件监听器
     */
    setupWebSocketEvents() {
        this.ws.onopen = () => {
            this.handleConnectionOpen();
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
            this.handleConnectionClose(event);
        };

        this.ws.onerror = (error) => {
            this.handleConnectionError(error);
        };
    }

    /**
     * 处理连接打开
     */
    handleConnectionOpen() {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.log('✅ WebSocket连接已建立', 'success');
        
        // 发送握手消息
        this.sendHandshake();
        
        // 启动心跳检测
        this.startHeartbeat();
        
        // 通知AE扩展连接成功
        if (this.aeExtension) {
            this.aeExtension.onWebSocketConnected();
        }
    }

    /**
     * 处理收到的消息
     */
    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            this.stats.messagesReceived++;
            
            this.log(`收到消息: ${message.type}`, 'debug');
            
            // 处理响应消息
            if (message.data && message.data.originalId && this.pendingRequests.has(message.data.originalId)) {
                const { resolve, reject, timeout } = this.pendingRequests.get(message.data.originalId);
                clearTimeout(timeout);
                this.pendingRequests.delete(message.data.originalId);
                
                if (message.data.success !== false) {
                    resolve(message);
                } else {
                    reject(new Error(message.data.error || 'Request failed'));
                }
                return;
            }
            
            // 处理不同类型的消息
            const handler = this.messageHandlers.get(message.type);
            if (handler) {
                handler(message);
            } else {
                this.log(`未知消息类型: ${message.type}`, 'warning');
            }

        } catch (error) {
            this.log(`处理消息时出错: ${error.message}`, 'error');
            this.stats.errors++;
        }
    }

    /**
     * 处理连接关闭
     */
    handleConnectionClose(event) {
        this.connectionState = 'disconnected';
        this.stopHeartbeat();
        
        this.log(`WebSocket连接已关闭 (代码: ${event.code}, 原因: ${event.reason})`, 'warning');
        
        // 通知AE扩展连接断开
        if (this.aeExtension) {
            this.aeExtension.onWebSocketDisconnected();
        }
        
        // 自动重连
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
        }
    }

    /**
     * 处理连接错误
     */
    handleConnectionError(error) {
        this.log(`WebSocket连接错误: ${error.message || 'Unknown error'}`, 'error');
        this.stats.errors++;
    }

    /**
     * 安排重连
     */
    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // 指数退避
        
        this.log(`${delay/1000}秒后尝试重连 (第${this.reconnectAttempts}次)...`, 'info');
        
        setTimeout(() => {
            if (this.connectionState === 'disconnected') {
                this.stats.reconnections++;
                this.connect().catch(() => {
                    // 重连失败，继续尝试
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.scheduleReconnect();
                    } else {
                        this.log('达到最大重连次数，停止重连', 'error');
                    }
                });
            }
        }, delay);
    }

    /**
     * 发送消息
     */
    sendMessage(type, data = {}, expectResponse = false) {
        return new Promise((resolve, reject) => {
            if (this.connectionState !== 'connected') {
                reject(new Error('WebSocket未连接'));
                return;
            }

            const message = {
                type,
                id: this.generateMessageId(),
                timestamp: Date.now(),
                data,
                source: 'ae',
                version: '1.0'
            };

            try {
                this.ws.send(JSON.stringify(message));
                this.stats.messagesSent++;
                
                if (expectResponse) {
                    // 等待响应
                    const timeout = setTimeout(() => {
                        this.pendingRequests.delete(message.id);
                        reject(new Error('请求超时'));
                    }, this.requestTimeout);
                    
                    this.pendingRequests.set(message.id, { resolve, reject, timeout });
                } else {
                    resolve(message);
                }

            } catch (error) {
                reject(error);
                this.stats.errors++;
            }
        });
    }

    /**
     * 发送握手消息
     */
    sendHandshake() {
        this.sendMessage('connection.handshake_ack', {
            clientType: 'ae_extension',
            version: '1.0',
            capabilities: ['file_import', 'status_sync', 'real_time_updates']
        });
    }

    /**
     * 发送AE状态
     */
    sendAEStatus(status) {
        this.sendMessage('status.ae', status);
    }

    /**
     * 发送文件导入结果
     */
    sendImportResult(result) {
        this.sendMessage('file.import_complete', result);
    }

    /**
     * 发送文件导入进度
     */
    sendImportProgress(progress) {
        this.sendMessage('file.import_progress', progress);
    }

    /**
     * 发送文件导入错误
     */
    sendImportError(error) {
        this.sendMessage('file.import_error', error);
    }

    /**
     * 设置消息处理器
     */
    setupMessageHandlers() {
        // 连接管理
        this.messageHandlers.set('connection.handshake', (message) => {
            this.log(`收到握手消息，服务器版本: ${message.data.serverVersion}`, 'info');
        });

        this.messageHandlers.set('connection.pong', (message) => {
            const pingTime = Date.now() - this.lastPingTime;
            this.log(`心跳响应: ${pingTime}ms`, 'debug');
        });

        // 文件操作
        this.messageHandlers.set('file.export_request', (message) => {
            if (this.aeExtension) {
                this.aeExtension.handleEagleMessage({
                    type: 'export',
                    ...message.data
                });
            }
        });

        // Eagle导入结果
        this.messageHandlers.set('eagle_import_result', (message) => {
            if (this.aeExtension) {
                this.aeExtension.handleEagleImportResult(message.data);
            }
        });

        // 状态同步
        this.messageHandlers.set('status.eagle', (message) => {
            if (this.aeExtension) {
                this.aeExtension.handleEagleStatus(message.data);
            }
        });

        // 配置变更
        this.messageHandlers.set('config.changed', (message) => {
            if (this.aeExtension) {
                this.aeExtension.handleConfigChange(message.data);
            }
        });
    }

    /**
     * 启动心跳检测
     */
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            if (this.connectionState === 'connected') {
                this.lastPingTime = Date.now();
                this.sendMessage('connection.ping', { timestamp: this.lastPingTime });
            }
        }, this.heartbeatInterval);
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
     * 生成消息ID
     */
    generateMessageId() {
        return `ae_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    /**
     * 记录日志
     */
    log(message, level = 'info') {
        if (this.aeExtension && this.aeExtension.log) {
            this.aeExtension.log(`[WebSocket] ${message}`, level);
        } else {
            console.log(`[WebSocket] ${message}`);
        }
    }

    /**
     * 获取连接状态
     */
    getStatus() {
        return {
            connectionState: this.connectionState,
            url: this.url,
            reconnectAttempts: this.reconnectAttempts,
            stats: this.stats
        };
    }

    /**
     * 检查是否已连接
     */
    isConnected() {
        return this.connectionState === 'connected';
    }
}
