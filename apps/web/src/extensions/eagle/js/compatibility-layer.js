// Eagle2Ae 向后兼容性处理层
// 确保WebSocket升级后仍能与旧版本AE扩展兼容

class CompatibilityLayer {
    constructor(eagle2aeInstance) {
        this.eagle2ae = eagle2aeInstance;
        this.httpEndpoints = new Map();
        this.setupHttpEndpoints();
    }

    /**
     * 设置HTTP兼容端点
     */
    setupHttpEndpoints() {
        // 保持原有的HTTP端点以支持旧版本AE扩展
        this.httpEndpoints.set('/ping', this.handlePing.bind(this));
        this.httpEndpoints.set('/messages', this.handleMessages.bind(this));
        this.httpEndpoints.set('/ae-message', this.handleAEMessage.bind(this));
        this.httpEndpoints.set('/ae-status', this.handleAEStatus.bind(this));
        this.httpEndpoints.set('/ae-port-info', this.handleAEPortInfo.bind(this));
        this.httpEndpoints.set('/health', this.handleHealth.bind(this));
    }

    /**
     * 处理HTTP请求（兼容模式）
     */
    async handleHttpRequest(req, res) {
        const url = require('url');
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;

        // 设置CORS头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        // 查找对应的处理器
        const handler = this.httpEndpoints.get(pathname);
        if (handler) {
            try {
                await handler(req, res, parsedUrl);
            } catch (error) {
                this.sendError(res, error.message, 500);
            }
        } else {
            // 未找到端点，返回WebSocket升级提示
            this.sendWebSocketUpgradeHint(res);
        }
    }

    /**
     * 处理ping请求（健康检查）
     */
    async handlePing(req, res) {
        const response = {
            pong: true,
            timestamp: Date.now(),
            version: '2.0',
            mode: 'websocket_with_http_fallback',
            websocketAvailable: this.eagle2ae.webSocketServer ? this.eagle2ae.webSocketServer.isRunning : false
        };

        this.sendJSON(res, response);
    }

    /**
     * 处理消息轮询请求（兼容旧版本）
     */
    async handleMessages(req, res) {
        try {
            // 获取消息队列（兼容HTTP轮询）
            const messages = this.eagle2ae.getMessageQueue();
            
            // 添加升级提示
            const response = {
                messages,
                timestamp: Date.now(),
                upgradeHint: {
                    available: true,
                    websocketUrl: `ws://localhost:${this.eagle2ae.config.wsPort}/ws`,
                    benefits: ['实时通信', '更低延迟', '更好性能']
                }
            };

            this.sendJSON(res, response);
        } catch (error) {
            this.sendError(res, error.message);
        }
    }

    /**
     * 处理AE消息（兼容模式）
     */
    async handleAEMessage(req, res) {
        if (req.method !== 'POST') {
            this.sendError(res, 'Method not allowed', 405);
            return;
        }

        try {
            const body = await this.readRequestBody(req);
            const message = JSON.parse(body);

            // 处理消息
            this.eagle2ae.handleAEMessage(message);

            // 如果有WebSocket客户端连接，建议升级
            const hasWebSocketClients = this.eagle2ae.webSocketServer && 
                                       this.eagle2ae.webSocketServer.clients.size > 0;

            const response = {
                success: true,
                timestamp: Date.now(),
                upgradeRecommendation: hasWebSocketClients ? {
                    message: '检测到WebSocket连接可用，建议升级以获得更好性能',
                    websocketUrl: `ws://localhost:${this.eagle2ae.config.wsPort}/ws`
                } : null
            };

            this.sendJSON(res, response);
        } catch (error) {
            this.sendError(res, error.message);
        }
    }

    /**
     * 处理AE状态请求
     */
    async handleAEStatus(req, res) {
        const status = {
            connected: this.eagle2ae.aeStatus.connected,
            projectPath: this.eagle2ae.aeStatus.projectPath,
            activeComp: this.eagle2ae.aeStatus.activeComp,
            isReady: this.eagle2ae.aeStatus.isReady,
            timestamp: Date.now()
        };

        this.sendJSON(res, status);
    }

    /**
     * 处理AE端口信息
     */
    async handleAEPortInfo(req, res) {
        if (req.method !== 'POST') {
            this.sendError(res, 'Method not allowed', 405);
            return;
        }

        try {
            const body = await this.readRequestBody(req);
            const data = JSON.parse(body);

            // 处理端口信息
            await this.eagle2ae.handleAEPortInfo(data);

            this.sendJSON(res, { success: true });
        } catch (error) {
            this.sendError(res, error.message);
        }
    }

    /**
     * 处理健康检查
     */
    async handleHealth(req, res) {
        const health = {
            status: 'ok',
            timestamp: Date.now(),
            version: '2.0',
            services: {
                websocket: {
                    enabled: !!this.eagle2ae.webSocketServer,
                    running: this.eagle2ae.webSocketServer ? this.eagle2ae.webSocketServer.isRunning : false,
                    clients: this.eagle2ae.webSocketServer ? this.eagle2ae.webSocketServer.clients.size : 0
                },
                http: {
                    enabled: true,
                    running: !!this.eagle2ae.httpServer,
                    mode: 'compatibility'
                }
            },
            eagle: {
                selectedFiles: this.eagle2ae.selectedFiles.length,
                aeConnected: this.eagle2ae.aeStatus.connected
            }
        };

        this.sendJSON(res, health);
    }

    /**
     * 发送WebSocket升级提示
     */
    sendWebSocketUpgradeHint(res) {
        const hint = {
            error: 'Endpoint not found',
            upgrade: {
                available: true,
                websocketUrl: `ws://localhost:${this.eagle2ae.config.wsPort}/ws`,
                benefits: [
                    '实时双向通信',
                    '更低的网络延迟',
                    '更好的性能表现',
                    '自动重连机制',
                    '心跳检测'
                ],
                migration: {
                    guide: 'https://github.com/your-repo/migration-guide',
                    compatibility: '当前版本仍支持HTTP模式，但建议升级到WebSocket'
                }
            }
        };

        res.writeHead(426, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(hint, null, 2));
    }

    /**
     * 发送JSON响应
     */
    sendJSON(res, data, statusCode = 200) {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    /**
     * 发送错误响应
     */
    sendError(res, message, statusCode = 400) {
        const error = {
            error: message,
            timestamp: Date.now(),
            statusCode
        };

        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(error));
    }

    /**
     * 读取请求体
     */
    readRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                resolve(body);
            });
            req.on('error', reject);
        });
    }

    /**
     * 记录兼容性使用情况
     */
    logCompatibilityUsage(endpoint, userAgent = '') {
        this.eagle2ae.log(`[兼容模式] HTTP请求: ${endpoint} (${userAgent})`, 'info');
        
        // 可以在这里添加使用统计，帮助决定何时移除HTTP支持
        if (!this.usageStats) {
            this.usageStats = new Map();
        }
        
        const count = this.usageStats.get(endpoint) || 0;
        this.usageStats.set(endpoint, count + 1);
    }

    /**
     * 获取兼容性使用统计
     */
    getCompatibilityStats() {
        return {
            httpRequests: this.usageStats || new Map(),
            websocketConnections: this.eagle2ae.webSocketServer ? 
                                 this.eagle2ae.webSocketServer.stats : null
        };
    }
}

module.exports = CompatibilityLayer;
