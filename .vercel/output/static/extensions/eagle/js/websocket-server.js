// Eagle2Ae WebSocket服务器实现
const WebSocket = require('ws');
const http = require('http');
const { MESSAGE_TYPES, createMessage, validateMessage, createErrorMessage, createResponse } = require('./websocket-protocol');

class Eagle2AeWebSocketServer {
    constructor(port = 8080, eagle2aeInstance = null) {
        this.port = port;
        this.eagle2ae = eagle2aeInstance;
        this.server = null;
        this.wss = null;
        this.clients = new Map(); // 存储客户端连接信息
        this.isRunning = false;
        
        // 心跳检测配置
        this.heartbeatInterval = 30000; // 30秒
        this.heartbeatTimer = null;
        
        // 消息队列
        this.messageQueue = [];
        this.maxQueueSize = 1000;
        
        // 统计信息
        this.stats = {
            connectionsTotal: 0,
            messagesReceived: 0,
            messagesSent: 0,
            errors: 0
        };
    }

    /**
     * 启动WebSocket服务器
     */
    async start() {
        try {
            // 创建HTTP服务器（用于健康检查和兼容性）
            this.server = http.createServer((req, res) => {
                this.handleHttpRequest(req, res);
            });

            // 创建WebSocket服务器
            this.wss = new WebSocket.Server({ 
                server: this.server,
                path: '/ws',
                perMessageDeflate: false
            });

            // 设置WebSocket事件监听
            this.setupWebSocketEvents();

            // 启动服务器
            await new Promise((resolve, reject) => {
                this.server.listen(this.port, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            this.isRunning = true;
            this.startHeartbeat();
            
            this.log(`🚀 WebSocket服务器已启动 (端口: ${this.port})`, 'success');
            return true;

        } catch (error) {
            this.log(`WebSocket服务器启动失败: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * 停止WebSocket服务器
     */
    async stop() {
        try {
            this.isRunning = false;
            this.stopHeartbeat();

            // 关闭所有客户端连接
            this.clients.forEach((clientInfo, ws) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.close(1000, 'Server shutting down');
                }
            });
            this.clients.clear();

            // 关闭WebSocket服务器
            if (this.wss) {
                this.wss.close();
            }

            // 关闭HTTP服务器
            if (this.server) {
                await new Promise((resolve) => {
                    this.server.close(resolve);
                });
            }

            this.log('WebSocket服务器已停止', 'info');

        } catch (error) {
            this.log(`停止WebSocket服务器时出错: ${error.message}`, 'error');
        }
    }

    /**
     * 设置WebSocket事件监听
     */
    setupWebSocketEvents() {
        this.wss.on('connection', (ws, req) => {
            this.handleNewConnection(ws, req);
        });

        this.wss.on('error', (error) => {
            this.log(`WebSocket服务器错误: ${error.message}`, 'error');
            this.stats.errors++;
        });
    }

    /**
     * 处理新的WebSocket连接
     */
    handleNewConnection(ws, req) {
        const clientId = this.generateClientId();
        const clientInfo = {
            id: clientId,
            ip: req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            connectedAt: Date.now(),
            lastPing: Date.now(),
            isAlive: true
        };

        this.clients.set(ws, clientInfo);
        this.stats.connectionsTotal++;

        this.log(`新客户端连接: ${clientId} (${clientInfo.ip})`, 'info');

        // 发送握手消息
        this.sendMessage(ws, MESSAGE_TYPES.CONNECTION.HANDSHAKE, {
            clientId,
            serverVersion: '1.0',
            supportedFeatures: ['file_export', 'status_sync', 'real_time_updates']
        });

        // 设置消息监听
        ws.on('message', (data) => {
            this.handleMessage(ws, data);
        });

        // 设置连接关闭监听
        ws.on('close', (code, reason) => {
            this.handleConnectionClose(ws, code, reason);
        });

        // 设置错误监听
        ws.on('error', (error) => {
            this.handleConnectionError(ws, error);
        });

        // 设置pong响应监听（心跳检测）
        ws.on('pong', () => {
            if (this.clients.has(ws)) {
                this.clients.get(ws).isAlive = true;
                this.clients.get(ws).lastPing = Date.now();
            }
        });
    }

    /**
     * 处理收到的消息
     */
    handleMessage(ws, data) {
        try {
            const message = JSON.parse(data.toString());
            
            if (!validateMessage(message)) {
                this.sendError(ws, 'Invalid message format', 'INVALID_FORMAT');
                return;
            }

            this.stats.messagesReceived++;
            this.log(`收到消息: ${message.type} (来自: ${this.clients.get(ws)?.id})`, 'debug');

            // 处理不同类型的消息
            switch (message.type) {
                case MESSAGE_TYPES.CONNECTION.HANDSHAKE_ACK:
                    this.handleHandshakeAck(ws, message);
                    break;
                    
                case MESSAGE_TYPES.CONNECTION.PING:
                    this.handlePing(ws, message);
                    break;
                    
                case MESSAGE_TYPES.STATUS.AE_STATUS:
                    this.handleAEStatus(ws, message);
                    break;
                    
                case MESSAGE_TYPES.FILE.IMPORT_COMPLETE:
                case MESSAGE_TYPES.FILE.IMPORT_ERROR:
                case MESSAGE_TYPES.FILE.IMPORT_PROGRESS:
                    this.handleFileMessage(ws, message);
                    break;
                    
                default:
                    this.log(`未知消息类型: ${message.type}`, 'warning');
                    this.sendError(ws, `Unknown message type: ${message.type}`, 'UNKNOWN_TYPE', message.id);
            }

        } catch (error) {
            this.log(`处理消息时出错: ${error.message}`, 'error');
            this.sendError(ws, 'Message processing error', 'PROCESSING_ERROR');
            this.stats.errors++;
        }
    }

    /**
     * 处理握手确认
     */
    handleHandshakeAck(ws, message) {
        const clientInfo = this.clients.get(ws);
        if (clientInfo) {
            clientInfo.handshakeComplete = true;
            this.log(`客户端握手完成: ${clientInfo.id}`, 'success');
            
            // 发送当前Eagle状态
            this.sendEagleStatus(ws);
        }
    }

    /**
     * 处理心跳检测
     */
    handlePing(ws, message) {
        this.sendMessage(ws, MESSAGE_TYPES.CONNECTION.PONG, {
            timestamp: Date.now(),
            originalId: message.id
        });
    }

    /**
     * 处理AE状态更新
     */
    handleAEStatus(ws, message) {
        if (this.eagle2ae) {
            this.eagle2ae.updateAEStatus(message.data);
        }
    }

    /**
     * 处理文件相关消息
     */
    handleFileMessage(ws, message) {
        if (this.eagle2ae) {
            this.eagle2ae.handleAEMessage(message);
        }
    }

    /**
     * 发送消息到指定客户端
     */
    sendMessage(ws, type, data = {}, id = null) {
        if (ws.readyState !== WebSocket.OPEN) {
            return false;
        }

        try {
            const message = createMessage(type, data, 'eagle', id);
            ws.send(JSON.stringify(message));
            this.stats.messagesSent++;
            return true;
        } catch (error) {
            this.log(`发送消息失败: ${error.message}`, 'error');
            this.stats.errors++;
            return false;
        }
    }

    /**
     * 广播消息到所有连接的客户端
     */
    broadcast(type, data = {}) {
        let sentCount = 0;
        this.clients.forEach((clientInfo, ws) => {
            if (ws.readyState === WebSocket.OPEN && clientInfo.handshakeComplete) {
                if (this.sendMessage(ws, type, data)) {
                    sentCount++;
                }
            }
        });
        return sentCount;
    }

    /**
     * 发送错误消息
     */
    sendError(ws, error, code = 'UNKNOWN_ERROR', originalId = null) {
        const errorMessage = createErrorMessage(error, code, originalId);
        this.sendMessage(ws, MESSAGE_TYPES.CONNECTION.ERROR, errorMessage.data, errorMessage.id);
    }

    /**
     * 发送Eagle状态
     */
    sendEagleStatus(ws) {
        if (this.eagle2ae) {
            const status = {
                selectedFiles: this.eagle2ae.selectedFiles || [],
                config: this.eagle2ae.config || {},
                isReady: true
            };
            this.sendMessage(ws, MESSAGE_TYPES.STATUS.EAGLE_STATUS, status);
        }
    }

    /**
     * 处理HTTP请求（兼容性和健康检查）
     */
    handleHttpRequest(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'ok',
                type: 'websocket',
                clients: this.clients.size,
                stats: this.stats
            }));
            return;
        }

        // 其他HTTP请求返回WebSocket升级提示
        res.writeHead(426, { 'Content-Type': 'text/plain' });
        res.end('Please upgrade to WebSocket connection');
    }

    /**
     * 启动心跳检测
     */
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            this.clients.forEach((clientInfo, ws) => {
                if (!clientInfo.isAlive) {
                    // 客户端未响应，断开连接
                    ws.terminate();
                    return;
                }
                
                clientInfo.isAlive = false;
                ws.ping();
            });
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
     * 处理连接关闭
     */
    handleConnectionClose(ws, code, reason) {
        const clientInfo = this.clients.get(ws);
        if (clientInfo) {
            this.log(`客户端断开连接: ${clientInfo.id} (代码: ${code})`, 'info');
            this.clients.delete(ws);
        }
    }

    /**
     * 处理连接错误
     */
    handleConnectionError(ws, error) {
        const clientInfo = this.clients.get(ws);
        this.log(`客户端连接错误: ${clientInfo?.id || 'unknown'} - ${error.message}`, 'error');
        this.stats.errors++;
    }

    /**
     * 生成客户端ID
     */
    generateClientId() {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    /**
     * 记录日志
     */
    log(message, level = 'info') {
        if (this.eagle2ae && this.eagle2ae.log) {
            this.eagle2ae.log(`[WebSocket] ${message}`, level);
        } else {
            console.log(`[WebSocket] ${message}`);
        }
    }

    /**
     * 获取服务器状态
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            port: this.port,
            clientCount: this.clients.size,
            stats: this.stats
        };
    }
}

module.exports = Eagle2AeWebSocketServer;
