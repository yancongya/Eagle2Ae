// Eagle2Ae 演示模式 - 网络拦截器
// 专门用于拦截和模拟所有网络通信

class DemoNetworkInterceptor {
    constructor(demoAPIs) {
        this.demoAPIs = demoAPIs;
        this.isActive = false;
        this.originalAPIs = {};
        this.interceptedRequests = [];
        this.interceptedConnections = [];
        
        console.log('🛡️ 演示模式网络拦截器已创建');
    }
    
    // 启用网络拦截
    activate() {
        if (this.isActive) {
            console.log('⚠️ 网络拦截器已经激活');
            return;
        }
        
        console.log('🛡️ 启用网络拦截器...');
        
        // 备份原始API
        this.backupOriginalAPIs();
        
        // 拦截所有网络API
        this.interceptFetch();
        this.interceptWebSocket();
        this.interceptXMLHttpRequest();
        
        this.isActive = true;
        console.debug('✅ 网络拦截器已激活 - 所有网络通信将被拦截');
    }
    
    // 禁用网络拦截
    deactivate() {
        if (!this.isActive) {
            console.log('⚠️ 网络拦截器未激活');
            return;
        }
        
        console.log('🛡️ 禁用网络拦截器...');
        
        // 恢复原始API
        this.restoreOriginalAPIs();
        
        this.isActive = false;
        console.debug('✅ 网络拦截器已禁用 - 网络通信已恢复正常');
    }
    
    // 备份原始网络API
    backupOriginalAPIs() {
        this.originalAPIs = {
            fetch: window.fetch,
            WebSocket: window.WebSocket,
            XMLHttpRequest: window.XMLHttpRequest
        };
        
        console.log('💾 原始网络API已备份');
    }
    
    // 恢复原始网络API
    restoreOriginalAPIs() {
        if (this.originalAPIs.fetch) {
            window.fetch = this.originalAPIs.fetch;
        }
        
        if (this.originalAPIs.WebSocket) {
            window.WebSocket = this.originalAPIs.WebSocket;
        }
        
        if (this.originalAPIs.XMLHttpRequest) {
            window.XMLHttpRequest = this.originalAPIs.XMLHttpRequest;
        }
        
        this.originalAPIs = {};
        console.log('🔄 原始网络API已恢复');
    }
    
    // 拦截fetch请求
    interceptFetch() {
        const self = this;
        const originalFetch = this.originalAPIs.fetch;
        
        window.fetch = async function(url, options = {}) {
            const requestInfo = {
                url: url,
                method: options.method || 'GET',
                timestamp: Date.now(),
                intercepted: false
            };
            
            // 检查是否需要拦截
            if (self.shouldInterceptRequest(url)) {
                requestInfo.intercepted = true;
                self.interceptedRequests.push(requestInfo);
                
                // console.log(`🛡️ 拦截fetch请求: ${requestInfo.method} ${url}`);
                
                // 返回模拟响应
                return await self.demoAPIs.handleEagleAPICall(url, options);
            }
            
            // 不需要拦截的请求使用原始fetch
            // self.interceptedRequests.push(requestInfo); // 不记录非拦截请求
            return originalFetch(url, options);
        };
        
        console.log('🛡️ fetch API已被拦截');
    }
    
    // 拦截WebSocket连接
    interceptWebSocket() {
        const self = this;
        const originalWebSocket = this.originalAPIs.WebSocket;
        
        window.WebSocket = function(url, protocols) {
            const connectionInfo = {
                url: url,
                timestamp: Date.now(),
                intercepted: false
            };
            
            // 检查是否需要拦截
            if (self.shouldInterceptWebSocket(url)) {
                connectionInfo.intercepted = true;
                self.interceptedConnections.push(connectionInfo);
                
                console.log(`🛡️ 拦截WebSocket连接: ${url}`);
                
                // 返回模拟WebSocket
                return self.createMockWebSocket(url);
            }
            
            // 不需要拦截的连接使用原始WebSocket
            self.interceptedConnections.push(connectionInfo);
            return new originalWebSocket(url, protocols);
        };
        
        console.log('🛡️ WebSocket API已被拦截');
    }
    
    // 拦截XMLHttpRequest
    interceptXMLHttpRequest() {
        const self = this;
        const originalXMLHttpRequest = this.originalAPIs.XMLHttpRequest;
        
        window.XMLHttpRequest = function() {
            const xhr = new originalXMLHttpRequest();
            const originalOpen = xhr.open;
            const originalSend = xhr.send;
            
            xhr.open = function(method, url, async, user, password) {
                this._method = method;
                this._url = url;
                
                if (self.shouldInterceptRequest(url)) {
                    console.log(`🛡️ 拦截XMLHttpRequest: ${method} ${url}`);
                    this._intercepted = true;
                    return; // 不调用原始open
                }
                
                return originalOpen.call(this, method, url, async, user, password);
            };
            
            xhr.send = function(data) {
                if (this._intercepted) {
                    console.log(`🛡️ 模拟XMLHttpRequest响应: ${this._method} ${this._url}`);
                    
                    // 模拟异步响应
                    setTimeout(() => {
                        this.readyState = 4;
                        this.status = 200;
                        this.responseText = JSON.stringify({
                            success: true,
                            message: '演示模式XMLHttpRequest响应'
                        });
                        
                        if (this.onreadystatechange) {
                            this.onreadystatechange();
                        }
                    }, 100);
                    
                    return;
                }
                
                return originalSend.call(this, data);
            };
            
            return xhr;
        };
        
        console.log('🛡️ XMLHttpRequest API已被拦截');
    }
    
    // 检查是否应该拦截请求
    shouldInterceptRequest(url) {
        if (typeof url !== 'string') return false;
        
        // 不拦截本地JSON文件请求（用于国际化）
        if (url.endsWith('.json') && (url.includes('/i18n/') || url.includes('\\i18n\\'))) {
            return false;
        }
        
        // 拦截所有Eagle相关的请求
        const eaglePatterns = [
            'localhost:8080',
            '127.0.0.1:8080',
            /localhost:\d+/,
            '/ping',
            '/messages',
            '/ae-message',
            '/ae-status',
            '/settings-sync',
            '/copy-to-clipboard',
            '/clear-logs',
            '/ae-port-info'
        ];
        
        return eaglePatterns.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(url);
            }
            return url.includes(pattern);
        });
    }
    
    // 检查是否应该拦截WebSocket连接
    shouldInterceptWebSocket(url) {
        if (typeof url !== 'string') return false;
        
        return url.includes('localhost:8080') || 
               url.includes('127.0.0.1:8080') ||
               url.match(/ws:\/\/localhost:\d+/);
    }
    
    // 创建模拟WebSocket
    createMockWebSocket(url) {
        const mockWS = {
            url: url,
            readyState: 0, // CONNECTING
            onopen: null,
            onclose: null,
            onmessage: null,
            onerror: null,
            
            send: function(data) {
                console.log('🛡️ 模拟WebSocket发送:', data);
                
                // 模拟响应
                setTimeout(() => {
                    if (this.onmessage) {
                        const response = {
                            type: 'message',
                            data: JSON.stringify({
                                success: true,
                                message: '演示模式WebSocket响应',
                                timestamp: Date.now()
                            })
                        };
                        this.onmessage(response);
                    }
                }, 100);
            },
            
            close: function(code, reason) {
                console.log('🛡️ 模拟WebSocket关闭:', code, reason);
                this.readyState = 3; // CLOSED
                if (this.onclose) {
                    this.onclose({
                        type: 'close',
                        code: code || 1000,
                        reason: reason || '演示模式关闭'
                    });
                }
            }
        };
        
        // 模拟连接建立
        setTimeout(() => {
            mockWS.readyState = 1; // OPEN
            if (mockWS.onopen) {
                mockWS.onopen({ type: 'open' });
            }
            console.log('🛡️ 模拟WebSocket连接已建立');
        }, 500);
        
        return mockWS;
    }
    
    // 获取拦截统计信息
    getInterceptionStats() {
        return {
            isActive: this.isActive,
            interceptedRequests: this.interceptedRequests.length,
            interceptedConnections: this.interceptedConnections.length,
            requests: this.interceptedRequests,
            connections: this.interceptedConnections
        };
    }
    
    // 清除拦截记录
    clearInterceptionLogs() {
        this.interceptedRequests = [];
        this.interceptedConnections = [];
        console.log('🛡️ 拦截记录已清除');
    }
}

// 导出类
window.DemoNetworkInterceptor = DemoNetworkInterceptor;
