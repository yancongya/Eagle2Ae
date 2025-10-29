# Eagle连接管理器

## 概述

Eagle连接管理器（Eagle Connection Manager）是 Eagle2Ae AE 扩展 v2.4.0 的核心组件，负责管理与 Eagle 应用程序的连接状态，提供连接验证、状态监控、自动重连等功能。该组件确保扩展能够稳定地与 Eagle 进行通信，支持导入和导出操作。

## 核心特性

### 连接状态管理
- **连接检测** - 自动检测 Eagle 应用程序是否正在运行
- **连接验证** - 验证与 Eagle 的通信是否正常
- **状态监控** - 实时监控连接状态变化
- **断线重连** - 自动处理连接中断并尝试重连

### 通信协议支持
- **HTTP API** - 通过 HTTP 端点与 Eagle 通信
- **WebSocket** - 支持实时双向通信（如适用）
- **错误处理** - 完善的通信错误处理机制

### 智能缓存机制
- **连接信息缓存** - 缓存连接验证结果
- **状态变更事件** - 提供连接状态变更通知
- **性能优化** - 减少不必要的验证请求

### 用户体验优化
- **连接状态指示** - 提供直观的连接状态指示
- **错误提示** - 友好的连接错误提示
- **自动恢复** - 自动处理连接问题

## 技术实现

### 核心类结构

```javascript
/**
 * Eagle连接管理器
 * 负责管理与Eagle应用程序的连接状态，提供连接验证、状态监控、自动重连等功能
 */
class EagleConnectionManager {
    /**
     * 构造函数
     * @param {Object} aeExtension - AE扩展实例
     */
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.csInterface = aeExtension.csInterface;
        this.settingsManager = aeExtension.settingsManager;
        this.logManager = aeExtension.logManager;
        
        // 初始化状态
        this.connectionState = {
            connected: false,
            version: null,
            libraryPath: null,
            timestamp: null,
            error: null
        };
        
        // 连接配置
        this.connectionConfig = {
            host: 'localhost',
            port: 41595, // Eagle默认API端口
            timeout: 5000,
            retryAttempts: 3,
            retryDelay: 2000,
            cacheTimeout: 30000 // 30秒缓存
        };
        
        // 状态缓存
        this.connectionCache = new Map();
        this.cacheTimeout = 30000; // 30秒
        
        // 重连机制
        this.reconnectEnabled = true;
        this.reconnectInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        
        // 事件监听器
        this.connectListeners = [];
        this.disconnectListeners = [];
        this.errorListeners = [];
        
        // 绑定方法上下文
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.checkConnection = this.checkConnection.bind(this);
        this.validateConnection = this.validateConnection.bind(this);
        this.getConnectionInfo = this.getConnectionInfo.bind(this);
        this.handleConnectionChange = this.handleConnectionChange.bind(this);
        this.startReconnect = this.startReconnect.bind(this);
        this.stopReconnect = this.stopReconnect.bind(this);
        this.attemptReconnect = this.attemptReconnect.bind(this);
        
        this.log('🔗 Eagle连接管理器已初始化', 'debug');
    }
}
```

### 连接检测与验证

```javascript
/**
 * 检查Eagle连接状态
 * @returns {Promise<Object>} 连接检查结果
 */
async checkConnection() {
    try {
        this.log('🔍 检查Eagle连接状态...', 'debug');

        // 生成缓存键
        const cacheKey = 'connection_check';
        const now = Date.now();

        // 检查缓存
        if (this.connectionCache.has(cacheKey)) {
            const cached = this.connectionCache.get(cacheKey);
            if ((now - cached.timestamp) < this.cacheTimeout) {
                this.log('📋 使用缓存的连接检查结果', 'debug');
                return cached.data;
            } else {
                // 缓存过期，删除
                this.connectionCache.delete(cacheKey);
            }
        }

        // 检查是否为Demo模式
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：虚拟连接检查', 'debug');
            
            // Demo模式：返回虚拟连接状态
            if (window.demoEagle) {
                const demoStatus = window.demoEagle.getConnectionStatus();
                this.log(`✅ 虚拟连接检查完成: ${demoStatus.connected}`, 'debug');
                
                // 更新状态
                this.updateConnectionState({
                    connected: demoStatus.connected,
                    version: demoStatus.version,
                    libraryPath: demoStatus.libraryPath,
                    timestamp: now,
                    error: demoStatus.error || null
                });
                
                // 缓存结果
                this.connectionCache.set(cacheKey, {
                    data: {
                        connected: demoStatus.connected,
                        version: demoStatus.version,
                        libraryPath: demoStatus.libraryPath,
                        error: demoStatus.error || null
                    },
                    timestamp: now
                });
                
                return {
                    connected: demoStatus.connected,
                    version: demoStatus.version,
                    libraryPath: demoStatus.libraryPath,
                    error: demoStatus.error || null
                };
            } else {
                // 模拟连接状态
                const mockConnected = localStorage.getItem('demoEagleConnected') !== 'false';
                const mockVersion = localStorage.getItem('demoEagleVersion') || '2.3.0';
                const mockLibraryPath = localStorage.getItem('demoEagleLibraryPath') || 'C:/Eagle/Library';
                
                this.log(`✅ 虚拟连接检查完成: ${mockConnected}`, 'debug');
                
                // 更新状态
                this.updateConnectionState({
                    connected: mockConnected,
                    version: mockConnected ? mockVersion : null,
                    libraryPath: mockConnected ? mockLibraryPath : null,
                    timestamp: now,
                    error: mockConnected ? null : 'Eagle未连接'
                });
                
                // 缓存结果
                const result = {
                    connected: mockConnected,
                    version: mockConnected ? mockVersion : null,
                    libraryPath: mockConnected ? mockLibraryPath : null,
                    error: mockConnected ? null : 'Eagle未连接'
                };
                
                this.connectionCache.set(cacheKey, {
                    data: result,
                    timestamp: now
                });
                
                return result;
            }
        }

        // CEP模式：通过HTTP API检查连接
        const { host, port } = this.connectionConfig;
        const checkUrl = `http://${host}:${port}/api/info`;

        this.log(`🔗 发送连接检查请求到: ${checkUrl}`, 'debug');

        // 尝试连接
        const response = await fetch(checkUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Eagle2AE-Extension/2.4.0'
            },
            timeout: this.connectionConfig.timeout
        });

        if (response.ok) {
            const data = await response.json();
            
            this.log('✅ 连接检查成功', 'debug');
            
            // 更新状态
            this.updateConnectionState({
                connected: true,
                version: data.version || 'unknown',
                libraryPath: data.libraryPath || null,
                timestamp: now,
                error: null
            });
            
            // 缓存结果
            const result = {
                connected: true,
                version: data.version || 'unknown',
                libraryPath: data.libraryPath || null,
                error: null
            };
            
            this.connectionCache.set(cacheKey, {
                data: result,
                timestamp: now
            });
            
            // 触发连接事件
            this.handleConnectionChange(true, this.connectionState);
            
            return result;
        } else {
            const errorText = await response.text();
            const errorMsg = `HTTP ${response.status}: ${errorText}`;
            
            this.log(`❌ 连接检查失败: ${errorMsg}`, 'error');
            
            // 更新状态
            this.updateConnectionState({
                connected: false,
                version: null,
                libraryPath: null,
                timestamp: now,
                error: errorMsg
            });
            
            // 缓存失败结果
            const result = {
                connected: false,
                version: null,
                libraryPath: null,
                error: errorMsg
            };
            
            this.connectionCache.set(cacheKey, {
                data: result,
                timestamp: now
            });
            
            // 触发错误事件
            this.handleError(errorMsg);
            
            return result;
        }

    } catch (error) {
        this.log(`💥 连接检查异常: ${error.message}`, 'error');
        
        // 更新状态
        this.updateConnectionState({
            connected: false,
            version: null,
            libraryPath: null,
            timestamp: Date.now(),
            error: error.message
        });
        
        // 缓存失败结果
        const result = {
            connected: false,
            version: null,
            libraryPath: null,
            error: error.message
        };
        
        // 使用较短的缓存时间，以便快速重试
        this.connectionCache.set('connection_check', {
            data: result,
            timestamp: Date.now()
        });
        
        // 触发错误事件
        this.handleError(error.message);
        
        return result;
    }
}

/**
 * 验证Eagle连接
 * @returns {Promise<boolean>} 连接是否有效
 */
async validateConnection() {
    try {
        this.log('🔍 验证Eagle连接...', 'debug');

        // 执行连接检查
        const checkResult = await this.checkConnection();

        const isValid = checkResult.connected && !checkResult.error;

        if (isValid) {
            this.log('✅ Eagle连接验证通过', 'success');
        } else {
            this.log('❌ Eagle连接验证失败', 'warning');
        }

        return isValid;

    } catch (error) {
        this.log(`💥 连接验证异常: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 更新连接状态
 * @param {Object} newState - 新的连接状态
 */
updateConnectionState(newState) {
    try {
        const oldState = { ...this.connectionState };
        this.connectionState = { ...newState };

        this.log(`🔄 连接状态更新: ${oldState.connected} -> ${newState.connected}`, 'debug');

        // 如果状态发生变化，触发相应的事件
        if (oldState.connected !== newState.connected) {
            if (newState.connected) {
                // 连接建立
                this.handleConnectionChange(true, newState);
            } else {
                // 连接断开
                this.handleConnectionChange(false, newState);
            }
        }

    } catch (error) {
        this.log(`更新连接状态失败: ${error.message}`, 'error');
    }
}

/**
 * 获取连接信息
 * @returns {Object} 连接信息
 */
getConnectionInfo() {
    try {
        return {
            connected: this.connectionState.connected,
            version: this.connectionState.version,
            libraryPath: this.connectionState.libraryPath,
            timestamp: this.connectionState.timestamp,
            error: this.connectionState.error,
            lastCheck: this.connectionCache.get('connection_check')?.timestamp || null
        };

    } catch (error) {
        this.log(`获取连接信息失败: ${error.message}`, 'error');
        return this.connectionState;
    }
}
```

### 连接管理

```javascript
/**
 * 连接Eagle
 * @returns {Promise<Object>} 连接结果
 */
async connect() {
    try {
        this.log('🔗 开始连接Eagle...', 'debug');

        // 检查当前连接状态
        if (this.connectionState.connected) {
            this.log('✅ Eagle已连接，无需重复连接', 'debug');
            return {
                success: true,
                connected: true,
                message: 'Eagle已连接'
            };
        }

        // 执行连接验证
        const checkResult = await this.checkConnection();

        if (checkResult.connected) {
            this.log('✅ Eagle连接成功', 'success');

            // 启动重连监控
            if (this.reconnectEnabled) {
                this.startReconnect();
            }

            return {
                success: true,
                connected: true,
                version: checkResult.version,
                libraryPath: checkResult.libraryPath,
                message: 'Eagle连接成功'
            };
        } else {
            this.log(`❌ Eagle连接失败: ${checkResult.error}`, 'error');

            return {
                success: false,
                connected: false,
                error: checkResult.error,
                message: 'Eagle连接失败'
            };
        }

    } catch (error) {
        this.log(`💥 Eagle连接异常: ${error.message}`, 'error');

        return {
            success: false,
            connected: false,
            error: error.message,
            message: 'Eagle连接异常'
        };
    }
}

/**
 * 断开Eagle连接
 * @returns {Promise<Object>} 断开结果
 */
async disconnect() {
    try {
        this.log('🔗 断开Eagle连接...', 'debug');

        // 停止重连监控
        this.stopReconnect();

        // 更新连接状态
        this.updateConnectionState({
            connected: false,
            version: null,
            libraryPath: null,
            timestamp: Date.now(),
            error: null
        });

        this.log('✅ Eagle连接已断开', 'success');

        return {
            success: true,
            connected: false,
            message: 'Eagle连接已断开'
        };

    } catch (error) {
        this.log(`💥 断开Eagle连接异常: ${error.message}`, 'error');

        return {
            success: false,
            connected: false,
            error: error.message,
            message: '断开Eagle连接异常'
        };
    }
}

/**
 * 开始重连监控
 */
startReconnect() {
    try {
        if (this.reconnectInterval) {
            this.log('🔄 重连监控已在运行', 'debug');
            return;
        }

        this.log('🔄 启动Eagle连接重连监控', 'debug');

        this.reconnectInterval = setInterval(async () => {
            if (!this.connectionState.connected) {
                await this.attemptReconnect();
            }
        }, 5000); // 每5秒检查一次

    } catch (error) {
        this.log(`启动重连监控异常: ${error.message}`, 'error');
    }
}

/**
 * 停止重连监控
 */
stopReconnect() {
    try {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
            this.reconnectAttempts = 0;
            
            this.log('🔄 停止Eagle连接重连监控', 'debug');
        }

    } catch (error) {
        this.log(`停止重连监控异常: ${error.message}`, 'error');
    }
}

/**
 * 尝试重连
 */
async attemptReconnect() {
    try {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.log('🔄 重连尝试次数已达上限，停止重连', 'warning');
            this.stopReconnect();
            return;
        }

        this.log(`🔄 尝试重连Eagle (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`, 'debug');

        const result = await this.checkConnection();

        if (result.connected) {
            this.log('✅ 重连成功', 'success');
            this.reconnectAttempts = 0;
        } else {
            this.reconnectAttempts++;
            this.log(`❌ 重连失败: ${result.error}`, 'warning');
        }

    } catch (error) {
        this.reconnectAttempts++;
        this.log(`💥 重连异常: ${error.message}`, 'error');
    }
}
```

### 事件处理

```javascript
/**
 * 处理连接状态变更
 * @param {boolean} connected - 是否已连接
 * @param {Object} state - 连接状态
 */
handleConnectionChange(connected, state) {
    try {
        if (connected) {
            this.log('🔌 Eagle连接已建立', 'success');
            
            // 触发连接事件
            this.emit('connected', {
                version: state.version,
                libraryPath: state.libraryPath,
                timestamp: state.timestamp
            });
            
            // 通知连接监听器
            this.connectListeners.forEach(listener => {
                try {
                    listener({
                        connected: true,
                        version: state.version,
                        libraryPath: state.libraryPath,
                        timestamp: state.timestamp
                    });
                } catch (listenerError) {
                    this.log(`连接监听器执行失败: ${listenerError.message}`, 'error');
                }
            });
            
            // 清除连接错误缓存
            this.connectionCache.delete('connection_check');
            
        } else {
            this.log('🔌 Eagle连接已断开', 'warning');
            
            // 触发断开事件
            this.emit('disconnected', {
                error: state.error,
                timestamp: state.timestamp
            });
            
            // 通知断开监听器
            this.disconnectListeners.forEach(listener => {
                try {
                    listener({
                        connected: false,
                        error: state.error,
                        timestamp: state.timestamp
                    });
                } catch (listenerError) {
                    this.log(`断开监听器执行失败: ${listenerError.message}`, 'error');
                }
            });
        }

    } catch (error) {
        this.log(`处理连接状态变更失败: ${error.message}`, 'error');
    }
}

/**
 * 处理错误
 * @param {string} error - 错误信息
 */
handleError(error) {
    try {
        this.log(`❌ Eagle连接错误: ${error}`, 'error');
        
        // 触发错误事件
        this.emit('error', {
            error: error,
            timestamp: Date.now()
        });
        
        // 通知错误监听器
        this.errorListeners.forEach(listener => {
            try {
                listener({
                    error: error,
                    timestamp: Date.now()
                });
            } catch (listenerError) {
                this.log(`错误监听器执行失败: ${listenerError.message}`, 'error');
            }
        });

    } catch (error) {
        this.log(`处理错误失败: ${error.message}`, 'error');
    }
}

/**
 * 添加连接监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addConnectListener(listener) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }

        this.connectListeners.push(listener);

        this.log('👂 已添加Eagle连接监听器', 'debug');

        // 返回移除监听器的函数
        return () => {
            this.removeConnectListener(listener);
        };

    } catch (error) {
        this.log(`添加连接监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数以防调用错误
    }
}

/**
 * 移除连接监听器
 * @param {Function} listener - 监听器函数
 */
removeConnectListener(listener) {
    try {
        const index = this.connectListeners.indexOf(listener);
        if (index !== -1) {
            this.connectListeners.splice(index, 1);
            this.log('👂 已移除Eagle连接监听器', 'debug');
        }

    } catch (error) {
        this.log(`移除连接监听器失败: ${error.message}`, 'error');
    }
}

/**
 * 添加断开监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addDisconnectListener(listener) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }

        this.disconnectListeners.push(listener);

        this.log('👂 已添加Eagle断开监听器', 'debug');

        // 返回移除监听器的函数
        return () => {
            this.removeDisconnectListener(listener);
        };

    } catch (error) {
        this.log(`添加断开监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数以防调用错误
    }
}

/**
 * 移除断开监听器
 * @param {Function} listener - 监听器函数
 */
removeDisconnectListener(listener) {
    try {
        const index = this.disconnectListeners.indexOf(listener);
        if (index !== -1) {
            this.disconnectListeners.splice(index, 1);
            this.log('👂 已移除Eagle断开监听器', 'debug');
        }

    } catch (error) {
        this.log(`移除断开监听器失败: ${error.message}`, 'error');
    }
}

/**
 * 添加错误监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addErrorListener(listener) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }

        this.errorListeners.push(listener);

        this.log('👂 已添加Eagle错误监听器', 'debug');

        // 返回移除监听器的函数
        return () => {
            this.removeErrorListener(listener);
        };

    } catch (error) {
        this.log(`添加错误监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数以防调用错误
    }
}

/**
 * 移除错误监听器
 * @param {Function} listener - 监听器函数
 */
removeErrorListener(listener) {
    try {
        const index = this.errorListeners.indexOf(listener);
        if (index !== -1) {
            this.errorListeners.splice(index, 1);
            this.log('👂 已移除Eagle错误监听器', 'debug');
        }

    } catch (error) {
        this.log(`移除错误监听器失败: ${error.message}`, 'error');
    }
}
```

### UI更新和状态指示

```javascript
/**
 * 更新连接状态UI
 * @param {Object} status - 连接状态
 */
updateConnectionUI(status) {
    try {
        // 更新连接状态指示器
        const connectionIndicator = document.getElementById('eagle-connection-indicator');
        if (connectionIndicator) {
            if (status.connected) {
                connectionIndicator.className = 'status-indicator connected';
                connectionIndicator.title = `Eagle: 已连接 (v${status.version || 'Unknown'})`;
            } else {
                connectionIndicator.className = 'status-indicator disconnected';
                connectionIndicator.title = status.error ? `Eagle: 连接失败 - ${status.error}` : 'Eagle: 未连接';
            }
        }

        // 更新连接信息显示
        const connectionInfoDisplay = document.getElementById('eagle-connection-info');
        if (connectionInfoDisplay) {
            if (status.connected) {
                connectionInfoDisplay.innerHTML = `
                    <div class="connection-info">
                        <span class="connection-status">✅ 已连接</span>
                        <span class="connection-version">v${status.version || 'Unknown'}</span>
                        <span class="connection-path" title="${status.libraryPath || 'Unknown'}">${status.libraryPath ? this.truncatePath(status.libraryPath, 50) : 'Unknown'}</span>
                    </div>
                `;
            } else {
                connectionInfoDisplay.innerHTML = `
                    <div class="connection-info">
                        <span class="connection-status">❌ 未连接</span>
                        <span class="connection-error">${status.error || '未连接'}</span>
                    </div>
                `;
            }
        }

        // 更新连接操作按钮状态
        const connectButton = document.getElementById('connect-eagle-btn');
        const disconnectButton = document.getElementById('disconnect-eagle-btn');
        
        if (connectButton) {
            connectButton.disabled = status.connected;
            connectButton.style.opacity = status.connected ? '0.5' : '1';
        }
        
        if (disconnectButton) {
            disconnectButton.disabled = !status.connected;
            disconnectButton.style.opacity = status.connected ? '1' : '0.5';
        }

        this.log('🔄 连接状态UI已更新', 'debug');

    } catch (error) {
        this.log(`更新连接状态UI失败: ${error.message}`, 'error');
    }
}

/**
 * 截断路径显示
 * @param {string} path - 路径
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的路径
 */
truncatePath(path, maxLength) {
    try {
        if (!path || path.length <= maxLength) {
            return path;
        }

        const parts = path.split(/[\\/]/);
        if (parts.length <= 2) {
            return path.substring(0, maxLength - 3) + '...';
        }

        const fileName = parts[parts.length - 1];
        const firstPart = parts[0];
        const remaining = maxLength - firstPart.length - fileName.length - 6; // 6 for "...\\"

        if (remaining > 0) {
            return `${firstPart}\\...\\${fileName}`;
        } else {
            return `...\\${fileName}`;
        }

    } catch (error) {
        this.log(`截断路径失败: ${error.message}`, 'error');
        return path;
    }
}

/**
 * 显示连接错误
 * @param {string} title - 错误标题
 * @param {string} message - 错误消息
 */
showConnectionError(title, message) {
    try {
        this.log(`❌ 显示连接错误: ${title} - ${message}`, 'error');

        // 创建错误元素
        const errorDiv = document.createElement('div');
        errorDiv.className = 'connection-error';
        errorDiv.innerHTML = `
            <div class="error-header">
                <span class="error-icon">❌</span>
                <span class="error-title">${title}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="error-message">${message}</div>
            <div class="error-actions">
                <button onclick="window.eagleConnectionManager && window.eagleConnectionManager.connect()">重试连接</button>
                <button onclick="window.open('https://eagle.cool/', '_blank')">打开Eagle</button>
            </div>
        `;

        // 添加样式
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // 添加到页面
        document.body.appendChild(errorDiv);

    } catch (error) {
        this.log(`显示连接错误失败: ${error.message}`, 'error');
    }
}

/**
 * 显示连接成功
 * @param {string} message - 成功消息
 */
showConnectionSuccess(message) {
    try {
        this.log(`✅ 显示连接成功: ${message}`, 'success');

        // 创建成功元素
        const successDiv = document.createElement('div');
        successDiv.className = 'connection-success';
        successDiv.innerHTML = `
            <div class="success-header">
                <span class="success-icon">✅</span>
                <span class="success-title">连接成功</span>
                <button class="success-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="success-message">${message}</div>
        `;

        // 添加样式
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // 添加到页面
        document.body.appendChild(successDiv);

        // 5秒后自动移除
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);

    } catch (error) {
        this.log(`显示连接成功失败: ${error.message}`, 'error');
    }
}
```

## API参考

### 核心方法

#### EagleConnectionManager
Eagle连接管理器主类

```javascript
/**
 * Eagle连接管理器
 * 负责管理与Eagle应用程序的连接状态，提供连接验证、状态监控、自动重连等功能
 */
class EagleConnectionManager
```

#### constructor()
构造函数

```javascript
/**
 * 构造函数
 * @param {Object} aeExtension - AE扩展实例
 */
constructor(aeExtension)
```

#### checkConnection()
检查Eagle连接状态

```javascript
/**
 * 检查Eagle连接状态
 * @returns {Promise<Object>} 连接检查结果
 */
async checkConnection()
```

#### validateConnection()
验证Eagle连接

```javascript
/**
 * 验证Eagle连接
 * @returns {Promise<boolean>} 连接是否有效
 */
async validateConnection()
```

#### connect()
连接Eagle

```javascript
/**
 * 连接Eagle
 * @returns {Promise<Object>} 连接结果
 */
async connect()
```

#### disconnect()
断开Eagle连接

```javascript
/**
 * 断开Eagle连接
 * @returns {Promise<Object>} 断开结果
 */
async disconnect()
```

#### getConnectionInfo()
获取连接信息

```javascript
/**
 * 获取连接信息
 * @returns {Object} 连接信息
 */
getConnectionInfo()
```

#### updateConnectionUI()
更新连接状态UI

```javascript
/**
 * 更新连接状态UI
 * @param {Object} status - 连接状态
 */
updateConnectionUI(status)
```

#### showConnectionError()
显示连接错误

```javascript
/**
 * 显示连接错误
 * @param {string} title - 错误标题
 * @param {string} message - 错误消息
 */
showConnectionError(title, message)
```

#### showConnectionSuccess()
显示连接成功

```javascript
/**
 * 显示连接成功
 * @param {string} message - 成功消息
 */
showConnectionSuccess(message)
```

#### startReconnect()
开始重连监控

```javascript
/**
 * 开始重连监控
 */
startReconnect()
```

#### stopReconnect()
停止重连监控

```javascript
/**
 * 停止重连监控
 */
stopReconnect()
```

#### addConnectListener()
添加连接监听器

```javascript
/**
 * 添加连接监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addConnectListener(listener)
```

#### removeConnectListener()
移除连接监听器

```javascript
/**
 * 移除连接监听器
 * @param {Function} listener - 监听器函数
 */
removeConnectListener(listener)
```

#### addDisconnectListener()
添加断开监听器

```javascript
/**
 * 添加断开监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addDisconnectListener(listener)
```

#### removeDisconnectListener()
移除断开监听器

```javascript
/**
 * 移除断开监听器
 * @param {Function} listener - 监听器函数
 */
removeDisconnectListener(listener)
```

#### addErrorListener()
添加错误监听器

```javascript
/**
 * 添加错误监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addErrorListener(listener)
```

#### removeErrorListener()
移除错误监听器

```javascript
/**
 * 移除错误监听器
 * @param {Function} listener - 监听器函数
 */
removeErrorListener(listener)
```

### 连接状态对象

```javascript
/**
 * 连接状态对象
 * @typedef {Object} ConnectionState
 * @property {boolean} connected - 是否连接
 * @property {string|null} version - Eagle版本
 * @property {string|null} libraryPath - 库路径
 * @property {number|null} timestamp - 状态更新时间戳
 * @property {string|null} error - 错误信息
 */
```

## 使用示例

### 基本使用

#### 连接和验证Eagle
```javascript
// 创建Eagle连接管理器实例
const eagleConnectionManager = new EagleConnectionManager(aeExtension);

// 连接Eagle
const connectResult = await eagleConnectionManager.connect();
if (connectResult.success && connectResult.connected) {
    console.log('✅ Eagle连接成功');
    console.log('Eagle版本:', connectResult.version);
    console.log('库路径:', connectResult.libraryPath);
} else {
    console.log('❌ Eagle连接失败:', connectResult.error);
}

// 验证连接
const isValid = await eagleConnectionManager.validateConnection();
if (isValid) {
    console.log('✅ Eagle连接验证通过');
} else {
    console.log('❌ Eagle连接验证失败');
}

// 获取连接信息
const connectionInfo = eagleConnectionManager.getConnectionInfo();
console.log('当前连接信息:', connectionInfo);
```

#### 监听连接状态变更
```javascript
// 监听连接事件
const removeConnectListener = eagleConnectionManager.addConnectListener((event) => {
    console.log('🔌 Eagle已连接:', {
        version: event.version,
        libraryPath: event.libraryPath,
        timestamp: new Date(event.timestamp).toLocaleString()
    });
    
    // 连接成功后可以执行相关操作
    onEagleConnected(event);
});

// 监听断开事件
const removeDisconnectListener = eagleConnectionManager.addDisconnectListener((event) => {
    console.log('🔌 Eagle已断开:', {
        error: event.error,
        timestamp: new Date(event.timestamp).toLocaleString()
    });
    
    // 连接断开后可以执行相关操作
    onEagleDisconnected(event);
});

// 监听错误事件
const removeErrorListener = eagleConnectionManager.addErrorListener((event) => {
    console.log('❌ Eagle连接错误:', {
        error: event.error,
        timestamp: new Date(event.timestamp).toLocaleString()
    });
    
    // 错误处理
    handleEagleError(event.error);
});

// 使用完成后移除监听器
// removeConnectListener();
// removeDisconnectListener();
// removeErrorListener();
```

#### 更新UI显示
```javascript
// 定期更新连接状态UI
async function updateConnectionStatusUI() {
    const status = eagleConnectionManager.getConnectionInfo();
    eagleConnectionManager.updateConnectionUI(status);
}

// 每5秒更新一次UI
setInterval(updateConnectionStatusUI, 5000);

// 也可以在连接状态变更时更新
eagleConnectionManager.addConnectListener(() => {
    updateConnectionStatusUI();
});

eagleConnectionManager.addDisconnectListener(() => {
    updateConnectionStatusUI();
});
```

### 高级使用

#### 重连机制控制
```javascript
// 控制重连机制
class AdvancedEagleConnectionManager extends EagleConnectionManager {
    constructor(aeExtension) {
        super(aeExtension);
        
        // 自定义重连配置
        this.reconnectConfig = {
            enabled: true,
            interval: 5000, // 5秒检查一次
            maxAttempts: 20, // 最大重连次数
            backoffMultiplier: 1.5, // 退避倍数
            exponential: true // 指数退避
        };
    }
    
    /**
     * 开始重连监控（带退避策略）
     */
    startReconnect() {
        if (this.reconnectInterval) {
            return;
        }
        
        this.log('🔄 启动带退避策略的Eagle连接重连监控', 'debug');
        
        this.reconnectInterval = setInterval(async () => {
            if (!this.connectionState.connected) {
                await this.attemptReconnectWithBackoff();
            }
        }, this.reconnectConfig.interval);
    }
    
    /**
     * 带退避策略的重连尝试
     */
    async attemptReconnectWithBackoff() {
        try {
            if (this.reconnectAttempts >= this.reconnectConfig.maxAttempts) {
                this.log('🔄 重连尝试次数已达上限，停止重连', 'warning');
                this.stopReconnect();
                return;
            }
            
            // 计算延迟时间（带退避）
            let delay = this.reconnectConfig.interval;
            if (this.reconnectConfig.exponential) {
                delay = this.reconnectConfig.interval * 
                       Math.pow(this.reconnectConfig.backoffMultiplier, this.reconnectAttempts);
            }
            
            this.log(`🔄 尝试重连Eagle (${this.reconnectAttempts + 1}/${this.reconnectConfig.maxAttempts})，延迟${delay}ms`, 'debug');
            
            // 等待延迟时间
            await new Promise(resolve => setTimeout(resolve, delay));
            
            const result = await this.checkConnection();
            
            if (result.connected) {
                this.log('✅ 重连成功', 'success');
                this.reconnectAttempts = 0;
            } else {
                this.reconnectAttempts++;
                this.log(`❌ 重连失败: ${result.error}`, 'warning');
            }
            
        } catch (error) {
            this.reconnectAttempts++;
            this.log(`💥 重连异常: ${error.message}`, 'error');
        }
    }
    
    /**
     * 启用/禁用重连
     * @param {boolean} enabled - 是否启用
     */
    setReconnectEnabled(enabled) {
        this.reconnectConfig.enabled = enabled;
        
        if (enabled && !this.connectionState.connected) {
            this.startReconnect();
        } else if (!enabled) {
            this.stopReconnect();
        }
        
        this.log(`🔄 重连机制已${enabled ? '启用' : '禁用'}`, 'debug');
    }
}

// 使用高级连接管理器
const advancedConnectionManager = new AdvancedEagleConnectionManager(aeExtension);

// 可以根据需要启用或禁用重连
advancedConnectionManager.setReconnectEnabled(true);
```

#### 连接池管理
```javascript
// 创建连接池管理器
class EagleConnectionPool {
    constructor() {
        this.connections = new Map();
        this.maxConnections = 5;
        this.cleanupInterval = null;
    }
    
    /**
     * 获取连接实例
     * @param {string} connectionId - 连接ID
     * @param {Object} aeExtension - AE扩展实例
     * @returns {EagleConnectionManager} 连接管理器实例
     */
    getConnection(connectionId, aeExtension) {
        if (this.connections.has(connectionId)) {
            return this.connections.get(connectionId);
        }
        
        // 检查连接数限制
        if (this.connections.size >= this.maxConnections) {
            this.cleanupUnusedConnections();
        }
        
        // 创建新连接
        const connection = new EagleConnectionManager(aeExtension);
        connection.connectionId = connectionId;
        connection.createdAt = Date.now();
        connection.lastUsed = Date.now();
        
        this.connections.set(connectionId, connection);
        
        console.log(`🔗 创建新连接: ${connectionId} (${this.connections.size}/${this.maxConnections})`);
        
        return connection;
    }
    
    /**
     * 标记连接为已使用
     * @param {string} connectionId - 连接ID
     */
    touchConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            connection.lastUsed = Date.now();
        }
    }
    
    /**
     * 清理未使用的连接
     */
    cleanupUnusedConnections() {
        const now = Date.now();
        const timeout = 300000; // 5分钟无使用则清理
        
        for (const [id, connection] of this.connections) {
            if (now - connection.lastUsed > timeout) {
                this.removeConnection(id);
            }
        }
    }
    
    /**
     * 移除连接
     * @param {string} connectionId - 连接ID
     */
    removeConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            // 断开连接
            connection.disconnect();
            
            // 移除连接
            this.connections.delete(connectionId);
            
            console.log(`.unlink 移除连接: ${connectionId}`);
        }
    }
    
    /**
     * 获取连接统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            total: this.connections.size,
            connections: Array.from(this.connections.keys())
        };
    }
    
    /**
     * 开始定期清理
     */
    startCleanup() {
        if (this.cleanupInterval) {
            return;
        }
        
        this.cleanupInterval = setInterval(() => {
            this.cleanupUnusedConnections();
        }, 60000); // 每分钟清理一次
        
        console.log('🔄 开始定期清理连接');
    }
    
    /**
     * 停止定期清理
     */
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            console.log('🔄 停止定期清理连接');
        }
    }
}

// 使用连接池
const connectionPool = new EagleConnectionPool();
connectionPool.startCleanup();

// 获取连接
const connection1 = connectionPool.getConnection('main', aeExtension);
const connection2 = connectionPool.getConnection('backup', aeExtension);

// 使用连接
const isValid1 = await connection1.validateConnection();
const isValid2 = await connection2.validateConnection();

console.log('连接状态:', {
    main: isValid1,
    backup: isValid2
});
```

#### 状态监控和报告
```javascript
// 创建连接状态监控器
class EagleConnectionMonitor {
    constructor(connectionManager) {
        this.connectionManager = connectionManager;
        this.statusHistory = [];
        this.maxHistorySize = 100;
        this.monitorInterval = null;
        this.reportInterval = null;
    }
    
    /**
     * 开始监控连接状态
     */
    startMonitoring() {
        if (this.monitorInterval) {
            console.log('📊 连接监控已在运行');
            return;
        }
        
        this.monitorInterval = setInterval(async () => {
            try {
                const status = this.connectionManager.getConnectionInfo();
                
                // 添加到历史记录
                this.addToHistory(status);
                
                // 检查状态变化
                this.checkStatusChanges(status);
                
            } catch (error) {
                console.error('监控连接状态失败:', error);
            }
        }, 10000); // 每10秒检查一次
        
        console.log('📊 开始监控Eagle连接状态');
    }
    
    /**
     * 停止监控连接状态
     */
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            console.log('📊 停止监控Eagle连接状态');
        }
    }
    
    /**
     * 开始定期报告
     */
    startReporting() {
        if (this.reportInterval) {
            console.log('📊 状态报告已在运行');
            return;
        }
        
        this.reportInterval = setInterval(() => {
            this.generateStatusReport();
        }, 300000); // 每5分钟报告一次
        
        console.log('📊 开始定期生成状态报告');
    }
    
    /**
     * 停止定期报告
     */
    stopReporting() {
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
            this.reportInterval = null;
            console.log('📊 停止定期生成状态报告');
        }
    }
    
    /**
     * 添加状态到历史记录
     * @param {Object} status - 连接状态
     */
    addToHistory(status) {
        // 添加时间戳
        const historyItem = {
            ...status,
            timestamp: Date.now()
        };
        
        this.statusHistory.push(historyItem);
        
        // 限制历史记录大小
        if (this.statusHistory.length > this.maxHistorySize) {
            this.statusHistory = this.statusHistory.slice(-this.maxHistorySize);
        }
    }
    
    /**
     * 检查状态变化
     * @param {Object} currentStatus - 当前状态
     */
    checkStatusChanges(currentStatus) {
        if (this.statusHistory.length < 2) {
            return;
        }
        
        const previousStatus = this.statusHistory[this.statusHistory.length - 2];
        
        // 检查连接状态变化
        if (previousStatus.connected !== currentStatus.connected) {
            console.log(`🔌 Eagle连接状态变化: ${previousStatus.connected ? '已连接' : '已断开'}`);
            
            if (currentStatus.connected) {
                console.log(`✅ Eagle已重连，版本: ${currentStatus.version}`);
            } else {
                console.log(`❌ Eagle连接断开，原因: ${currentStatus.error}`);
            }
        }
        
        // 检查版本变化
        if (previousStatus.version !== currentStatus.version) {
            console.log(`🆕 Eagle版本变化: ${previousStatus.version} -> ${currentStatus.version}`);
        }
        
        // 检查库路径变化
        if (previousStatus.libraryPath !== currentStatus.libraryPath) {
            console.log(`📂 Eagle库路径变化: ${previousStatus.libraryPath} -> ${currentStatus.libraryPath}`);
        }
    }
    
    /**
     * 生成状态报告
     */
    generateStatusReport() {
        console.log('📋 Eagle连接状态报告:');
        
        const currentStatus = this.connectionManager.getConnectionInfo();
        console.log('当前状态:', {
            连接: currentStatus.connected ? '已连接' : '已断开',
            版本: currentStatus.version || '未知',
            库路径: currentStatus.libraryPath || '未知',
            错误: currentStatus.error || '无',
            最后检查: currentStatus.timestamp ? new Date(currentStatus.timestamp).toLocaleString() : '未知'
        });
        
        if (this.statusHistory.length > 0) {
            const latest = this.statusHistory[this.statusHistory.length - 1];
            const oldest = this.statusHistory[0];
            
            console.log('历史统计:', {
                总记录数: this.statusHistory.length,
                连接时长: this.calculateConnectedDuration(),
                最近连接: new Date(latest.timestamp).toLocaleString(),
                最早记录: new Date(oldest.timestamp).toLocaleString()
            });
        }
    }
    
    /**
     * 计算连接时长
     * @returns {number} 连接时长（毫秒）
     */
    calculateConnectedDuration() {
        let connectedTime = 0;
        
        for (let i = 1; i < this.statusHistory.length; i++) {
            const prev = this.statusHistory[i - 1];
            const curr = this.statusHistory[i];
            
            if (prev.connected) {
                connectedTime += curr.timestamp - prev.timestamp;
            }
        }
        
        // 如果当前连接，加上到现在的时长
        const currentStatus = this.connectionManager.getConnectionInfo();
        if (currentStatus.connected && this.statusHistory.length > 0) {
            const lastStatus = this.statusHistory[this.statusHistory.length - 1];
            connectedTime += Date.now() - lastStatus.timestamp;
        }
        
        return connectedTime;
    }
    
    /**
     * 获取状态历史
     * @returns {Array} 状态历史
     */
    getStatusHistory() {
        return [...this.statusHistory];
    }
    
    /**
     * 导出状态历史
     * @returns {string} JSON格式的历史数据
     */
    exportHistory() {
        return JSON.stringify({
            timestamp: Date.now(),
            connectionId: this.connectionManager.connectionId || 'default',
            history: this.statusHistory
        }, null, 2);
    }
}

// 使用连接状态监控器
const monitor = new EagleConnectionMonitor(eagleConnectionManager);
monitor.startMonitoring();
monitor.startReporting();

// 也可以手动导出历史数据
// const historyData = monitor.exportHistory();
// console.log('导出的状态历史:', historyData);
```

## 最佳实践

### 使用建议

#### 连接验证模式
```javascript
// 创建连接验证助手
class EagleConnectionHelper {
    constructor(connectionManager) {
        this.manager = connectionManager;
    }
    
    /**
     * 等待Eagle连接就绪
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {Promise<boolean>} 是否连接成功
     */
    async waitForConnection(timeout = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const isValid = await this.manager.validateConnection();
            if (isValid) {
                return true;
            }
            
            // 等待1秒后重试
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        return false;
    }
    
    /**
     * 确保连接有效后再执行操作
     * @param {Function} operation - 要执行的操作
     * @param {number} retries - 重试次数
     * @returns {Promise<any>} 操作结果
     */
    async executeWithConnection(operation, retries = 3) {
        for (let i = 0; i < retries; i++) {
            const isValid = await this.manager.validateConnection();
            
            if (isValid) {
                try {
                    return await operation();
                } catch (error) {
                    console.error('操作执行失败:', error);
                    if (i === retries - 1) {
                        throw error; // 最后一次重试失败，抛出错误
                    }
                }
            }
            
            // 等待后重试
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        throw new Error('在重试次数内无法建立有效连接');
    }
    
    /**
     * 检查是否可以执行导入操作
     * @returns {Promise<boolean>} 可否执行
     */
    async canPerformImport() {
        return await this.manager.validateConnection();
    }
    
    /**
     * 检查是否可以执行导出操作
     * @returns {Promise<boolean>} 可否执行
     */
    async canPerformExport() {
        return await this.manager.validateConnection();
    }
}

// 使用连接验证助手
const connectionHelper = new EagleConnectionHelper(eagleConnectionManager);

// 等待连接就绪
const isConnected = await connectionHelper.waitForConnection();
if (isConnected) {
    console.log('✅ Eagle连接就绪，可以执行操作');
    
    // 使用连接执行操作
    await connectionHelper.executeWithConnection(async () => {
        // 执行需要Eagle连接的操作
        console.log('执行需要Eagle连接的操作...');
    });
} else {
    console.log('❌ 无法在超时时间内连接Eagle');
}
```

#### 内存管理
```javascript
// 实现连接管理器的内存清理
function cleanupEagleConnectionManager(connectionManager) {
    try {
        // 停止重连监控
        connectionManager.stopReconnect();
        
        // 清理连接缓存
        connectionManager.connectionCache.clear();
        
        // 清理监听器
        connectionManager.connectListeners = [];
        connectionManager.disconnectListeners = [];
        connectionManager.errorListeners = [];
        
        // 清理通用事件监听器
        connectionManager.eventListeners = [];
        
        // 清理字段监听器
        if (connectionManager.fieldListeners) {
            connectionManager.fieldListeners.clear();
        }
        
        // 清理验证器
        if (connectionManager.validators) {
            connectionManager.validators.clear();
        }
        
        // 清理迁移规则
        if (connectionManager.migrations) {
            connectionManager.migrations.clear();
        }
        
        connectionManager.log('🧹 Eagle连接管理器资源已清理', 'debug');
        
    } catch (error) {
        connectionManager.log(`清理Eagle连接管理器资源失败: ${error.message}`, 'error');
    }
}

// 在适当的时候调用清理函数
window.addEventListener('beforeunload', () => {
    cleanupEagleConnectionManager(eagleConnectionManager);
});

// 也可以在组件销毁时清理
// componentWillUnmount() {
//     cleanupEagleConnectionManager(this.connectionManager);
// }
```

#### 错误处理和恢复
```javascript
// 实现更健壮的错误处理
class RobustEagleConnectionManager extends EagleConnectionManager {
    constructor(aeExtension) {
        super(aeExtension);
        
        // 错误计数器
        this.errorCounters = {
            connectionErrors: 0,
            consecutiveErrors: 0,
            lastErrorTime: 0
        };
        
        // 错误阈值
        this.errorThresholds = {
            maxConsecutiveErrors: 5,
            errorResetInterval: 300000 // 5分钟重置错误计数
        };
    }
    
    /**
     * 处理连接错误
     * @param {string} error - 错误信息
     */
    handleError(error) {
        // 更新错误计数器
        this.errorCounters.connectionErrors++;
        this.errorCounters.consecutiveErrors++;
        this.errorCounters.lastErrorTime = Date.now();
        
        // 检查是否达到错误阈值
        if (this.errorCounters.consecutiveErrors >= this.errorThresholds.maxConsecutiveErrors) {
            this.log('🚨 连续错误次数过多，暂停重连', 'error');
            
            // 暂停重连
            this.stopReconnect();
            
            // 显示错误提示
            this.showConnectionError('连接错误过多', 
                `连续连接失败 ${this.errorCounters.consecutiveErrors} 次，请检查Eagle是否正常运行`);
        }
        
        // 调用父类的错误处理
        super.handleError(error);
    }
    
    /**
     * 重置错误计数器
     */
    resetErrorCounters() {
        this.errorCounters.consecutiveErrors = 0;
    }
    
    /**
     * 检查是否需要重置错误计数器
     */
    checkErrorReset() {
        const now = Date.now();
        if (now - this.errorCounters.lastErrorTime > this.errorThresholds.errorResetInterval) {
            this.resetErrorCounters();
        }
    }
    
    /**
     * 重写连接检查方法，添加错误处理
     * @returns {Promise<Object>} 连接检查结果
     */
    async checkConnection() {
        // 检查是否需要重置错误计数
        this.checkErrorReset();
        
        const result = await super.checkConnection();
        
        // 如果连接成功，重置连续错误计数
        if (result.connected) {
            this.resetErrorCounters();
        }
        
        return result;
    }
    
    /**
     * 获取错误统计信息
     * @returns {Object} 错误统计
     */
    getErrorStats() {
        return { ...this.errorCounters };
    }
    
    /**
     * 手动重置连接
     */
    async resetConnection() {
        this.log('🔄 手动重置连接', 'debug');
        
        // 断开当前连接
        await this.disconnect();
        
        // 重置错误计数器
        this.resetErrorCounters();
        
        // 重新连接
        const result = await this.connect();
        
        return result;
    }
}

// 使用健壮的连接管理器
const robustConnectionManager = new RobustEagleConnectionManager(aeExtension);

// 定期检查错误统计
setInterval(() => {
    const errorStats = robustConnectionManager.getErrorStats();
    console.log('连接错误统计:', errorStats);
    
    // 如果错误计数过高，可以考虑手动重置
    if (errorStats.consecutiveErrors > 3) {
        console.log('错误次数过多，建议重置连接');
    }
}, 60000); // 每分钟检查一次
```

### 性能优化

#### 连接状态缓存优化
```javascript
// 实现智能连接状态缓存
class SmartConnectionCache {
    constructor(timeout = 30000) { // 默认30秒缓存
        this.cache = new Map();
        this.timeout = timeout;
        this.timers = new Map();
    }
    
    /**
     * 设置缓存值
     * @param {string} key - 缓存键
     * @param {any} value - 缓存值
     */
    set(key, value) {
        // 清除旧的定时器
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }
        
        // 设置新值
        this.cache.set(key, {
            value: value,
            timestamp: Date.now()
        });
        
        // 设置过期定时器
        const timer = setTimeout(() => {
            this.delete(key);
        }, this.timeout);
        
        this.timers.set(key, timer);
    }
    
    /**
     * 获取缓存值
     * @param {string} key - 缓存键
     * @returns {any} 缓存值或undefined
     */
    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }
        
        const cached = this.cache.get(key);
        const age = Date.now() - cached.timestamp;
        
        if (age > this.timeout) {
            this.delete(key);
            return undefined;
        }
        
        return cached.value;
    }
    
    /**
     * 检查缓存是否存在且未过期
     * @param {string} key - 缓存键
     * @returns {boolean} 是否存在且未过期
     */
    has(key) {
        return this.get(key) !== undefined;
    }
    
    /**
     * 删除缓存值
     * @param {string} key - 缓存键
     */
    delete(key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
        
        this.cache.delete(key);
    }
    
    /**
     * 清空所有缓存
     */
    clear() {
        // 清除所有定时器
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        
        this.timers.clear();
        this.cache.clear();
    }
    
    /**
     * 获取缓存统计信息
     * @returns {Object} 缓存统计
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            timers: this.timers.size
        };
    }
}

// 在RobustEagleConnectionManager中使用智能缓存
class CachedEagleConnectionManager extends RobustEagleConnectionManager {
    constructor(aeExtension) {
        super(aeExtension);
        
        // 使用智能缓存
        this.connectionCache = new SmartConnectionCache(45000); // 45秒缓存
        this.cacheTimeout = 45000;
    }
    
    /**
     * 更新连接状态（使用智能缓存）
     * @param {Object} newState - 新的连接状态
     */
    updateConnectionState(newState) {
        const oldState = { ...this.connectionState };
        this.connectionState = { ...newState };
        
        this.log(`🔄 连接状态更新: ${oldState.connected} -> ${newState.connected}`, 'debug');
        
        // 如果状态发生变化，触发相应的事件
        if (oldState.connected !== newState.connected) {
            if (newState.connected) {
                // 连接建立
                this.handleConnectionChange(true, newState);
            } else {
                // 连接断开
                this.handleConnectionChange(false, newState);
            }
        }
        
        // 清除连接检查缓存
        this.connectionCache.delete('connection_check');
    }
    
    /**
     * 检查Eagle连接状态（使用智能缓存）
     * @returns {Promise<Object>} 连接检查结果
     */
    async checkConnection() {
        try {
            const cacheKey = 'connection_check';
            
            // 检查智能缓存
            const cached = this.connectionCache.get(cacheKey);
            if (cached) {
                this.log('📋 使用智能缓存的连接检查结果', 'debug');
                return cached;
            }
            
            this.log('🔍 检查Eagle连接状态...', 'debug');
            
            // 检查是否为Demo模式
            if (window.__DEMO_MODE_ACTIVE__) {
                // ... Demo模式逻辑保持不变
            }
            
            // CEP模式：通过HTTP API检查连接
            const { host, port } = this.connectionConfig;
            const checkUrl = `http://${host}:${port}/api/info`;
            
            this.log(`🔗 发送连接检查请求到: ${checkUrl}`, 'debug');
            
            const response = await fetch(checkUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Eagle2AE-Extension/2.4.0'
                },
                timeout: this.connectionConfig.timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                
                this.log('✅ 连接检查成功', 'debug');
                
                // 更新状态
                this.updateConnectionState({
                    connected: true,
                    version: data.version || 'unknown',
                    libraryPath: data.libraryPath || null,
                    timestamp: Date.now(),
                    error: null
                });
                
                // 设置智能缓存
                const result = {
                    connected: true,
                    version: data.version || 'unknown',
                    libraryPath: data.libraryPath || null,
                    error: null
                };
                
                this.connectionCache.set(cacheKey, result);
                
                // 触发连接事件
                this.handleConnectionChange(true, this.connectionState);
                
                return result;
            } else {
                const errorText = await response.text();
                const errorMsg = `HTTP ${response.status}: ${errorText}`;
                
                this.log(`❌ 连接检查失败: ${errorMsg}`, 'error');
                
                // 更新状态
                this.updateConnectionState({
                    connected: false,
                    version: null,
                    libraryPath: null,
                    timestamp: Date.now(),
                    error: errorMsg
                });
                
                // 设置智能缓存（失败结果，但使用较短的缓存时间）
                const result = {
                    connected: false,
                    version: null,
                    libraryPath: null,
                    error: errorMsg
                };
                
                this.connectionCache.set(cacheKey, result);
                
                // 触发错误事件
                this.handleError(errorMsg);
                
                return result;
            }
            
        } catch (error) {
            this.log(`💥 连接检查异常: ${error.message}`, 'error');
            
            // 更新状态
            this.updateConnectionState({
                connected: false,
                version: null,
                libraryPath: null,
                timestamp: Date.now(),
                error: error.message
            });
            
            // 设置智能缓存（失败结果，但使用较短的缓存时间）
            const result = {
                connected: false,
                version: null,
                libraryPath: null,
                error: error.message
            };
            
            // 使用较短的缓存时间，以便快速重试
            this.connectionCache.delete(cacheKey); // 先删除
            setTimeout(() => {
                this.connectionCache.set(cacheKey, result);
            }, 5000); // 5秒后设置失败缓存
            
            // 触发错误事件
            this.handleError(error.message);
            
            return result;
        }
    }
}
```

## 故障排除

### 常见问题

#### 连接失败
- **症状**：`validateConnection` 返回 false 或连接检查失败
- **解决**：
  1. 检查 Eagle 是否正在运行
  2. 验证 Eagle API 端口（默认 41595）是否可用
  3. 检查防火墙设置
  4. 确认 Eagle 版本是否支持 API

#### 连接不稳定
- **症状**：连接状态频繁变化，时断时连
- **解决**：
  1. 检查网络连接稳定性
  2. 验证 Eagle 设置中的 API 访问权限
  3. 调整重连参数（增加重连间隔）
  4. 检查系统资源使用情况

#### 缓存问题
- **症状**：状态信息不更新或显示过期信息
- **解决**：
  1. 清除连接缓存：`connectionManager.connectionCache.clear()`
  2. 强制连接检查：`await connectionManager.checkConnection()`
  3. 验证缓存超时设置

#### 事件监听器泄露
- **症状**：内存使用持续增长，事件监听器数量不断累积
- **解决**：
  1. 确保在不需要时移除监听器
  2. 使用返回的移除函数：`const remove = addListener(...); remove();`
  3. 检查监听器清理逻辑

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控连接状态变更
eagleConnectionManager.addConnectListener((event) => {
    console.log('🔌 Eagle已连接:', event);
});

eagleConnectionManager.addDisconnectListener((event) => {
    console.log('🔌 Eagle已断开:', event);
});

eagleConnectionManager.addErrorListener((event) => {
    console.log('❌ Eagle连接错误:', event);
});
```

#### 连接诊断
```javascript
// 连接诊断工具
async function diagnoseConnection(connectionManager) {
    console.log('🔍 开始连接诊断...');
    
    // 1. 检查基本连接
    console.log('1. 检查基本连接...');
    const checkResult = await connectionManager.checkConnection();
    console.log('   连接检查结果:', checkResult);
    
    // 2. 验证连接
    console.log('2. 验证连接...');
    const valid = await connectionManager.validateConnection();
    console.log('   连接验证结果:', valid);
    
    // 3. 获取连接信息
    console.log('3. 获取连接信息...');
    const info = connectionManager.getConnectionInfo();
    console.log('   连接信息:', info);
    
    // 4. 检查API端点
    console.log('4. 检查API端点可访问性...');
    try {
        const { host, port } = connectionManager.connectionConfig;
        const testUrl = `http://${host}:${port}/api/info`;
        
        const response = await fetch(testUrl, { 
            method: 'GET',
            timeout: 5000
        });
        
        console.log('   API端点访问:', response.ok ? '成功' : `失败 (HTTP ${response.status})`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('   API返回数据:', data);
        }
    } catch (error) {
        console.log('   API端点访问失败:', error.message);
    }
    
    // 5. 检查缓存状态
    console.log('5. 检查缓存状态...');
    if (connectionManager.connectionCache) {
        const stats = typeof connectionManager.connectionCache.getStats === 'function' 
            ? connectionManager.connectionCache.getStats() 
            : { size: connectionManager.connectionCache.size };
        console.log('   缓存统计:', stats);
    }
    
    // 6. 检查监听器
    console.log('6. 检查事件监听器...');
    console.log('   连接监听器:', connectionManager.connectListeners.length);
    console.log('   断开监听器:', connectionManager.disconnectListeners.length);
    console.log('   错误监听器:', connectionManager.errorListeners.length);
    
    console.log('✅ 连接诊断完成');
}

// 运行诊断
diagnoseConnection(eagleConnectionManager);
```

#### 性能分析
```javascript
// 连接性能分析
async function analyzeConnectionPerformance(connectionManager) {
    const iterations = 10;
    const times = [];
    
    console.log(`⏱️ 开始连接性能分析 (${iterations} 次测试)...`);
    
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const result = await connectionManager.checkConnection();
        const endTime = performance.now();
        
        times.push(endTime - startTime);
        
        console.log(`   测试 ${i + 1}: ${(endTime - startTime).toFixed(2)}ms - ${result.connected ? '成功' : '失败'}`);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log('📊 连接性能分析结果:');
    console.log(`   平均时间: ${avgTime.toFixed(2)}ms`);
    console.log(`   最短时间: ${minTime.toFixed(2)}ms`);
    console.log(`   最长时间: ${maxTime.toFixed(2)}ms`);
    console.log(`   测试次数: ${iterations}`);
    
    // 内存使用分析
    if (performance.memory) {
        console.log('🧠 内存使用:');
        console.log(`   已使用: ${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`);
        console.log(`   总计: ${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`);
        console.log(`   限制: ${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`);
    }
    
    return {
        averageTime: avgTime,
        minTime: minTime,
        maxTime: maxTime,
        times: times
    };
}

// 运行性能分析
const perfResults = await analyzeConnectionPerformance(eagleConnectionManager);
console.log('性能分析结果:', perfResults);
```

## 扩展性

### 自定义扩展

#### 扩展连接管理功能
```javascript
// 创建增强的连接管理器
class EnhancedEagleConnectionManager extends EagleConnectionManager {
    constructor(aeExtension) {
        super(aeExtension);
        
        // 添加额外的连接配置
        this.enhancedConfig = {
            proxySupport: false,
            proxyUrl: null,
            sslVerification: true,
            requestTimeout: 10000,
            maxRedirects: 5,
            userAgent: 'Eagle2AE-Extension/2.4.0'
        };
    }
    
    /**
     * 带代理支持的连接检查
     * @returns {Promise<Object>} 连接检查结果
     */
    async checkConnection() {
        try {
            this.log('🔍 检查Eagle连接状态（增强版）...', 'debug');
            
            // 生成缓存键
            const cacheKey = 'enhanced_connection_check';
            const now = Date.now();
            
            // 检查缓存
            if (this.connectionCache.has(cacheKey)) {
                const cached = this.connectionCache.get(cacheKey);
                if ((now - cached.timestamp) < this.cacheTimeout) {
                    this.log('📋 使用缓存的连接检查结果', 'debug');
                    return cached.data;
                } else {
                    this.connectionCache.delete(cacheKey);
                }
            }
            
            // 检查是否为Demo模式
            if (window.__DEMO_MODE_ACTIVE__) {
                return await super.checkConnection();
            }
            
            // 构建请求配置
            const { host, port } = this.connectionConfig;
            const url = `http://${host}:${port}/api/info`;
            
            // 添加代理配置（如果启用）
            const requestConfig = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': this.enhancedConfig.userAgent
                },
                timeout: this.enhancedConfig.requestTimeout
            };
            
            // 如果有代理配置，使用代理请求
            if (this.enhancedConfig.proxySupport && this.enhancedConfig.proxyUrl) {
                // 通过代理发送请求
                const proxyRequest = {
                    url: url,
                    config: requestConfig
                };
                
                const response = await this.sendThroughProxy(proxyRequest);
                return await this.handleEnhancedResponse(response, now);
            } else {
                // 直接发送请求
                const response = await fetch(url, requestConfig);
                return await this.handleEnhancedResponse(response, now);
            }
            
        } catch (error) {
            this.log(`💥 增强连接检查异常: ${error.message}`, 'error');
            
            // 更新状态
            this.updateConnectionState({
                connected: false,
                version: null,
                libraryPath: null,
                timestamp: Date.now(),
                error: error.message
            });
            
            const result = {
                connected: false,
                version: null,
                libraryPath: null,
                error: error.message
            };
            
            this.connectionCache.set('enhanced_connection_check', {
                data: result,
                timestamp: Date.now()
            });
            
            this.handleError(error.message);
            return result;
        }
    }
    
    /**
     * 通过代理发送请求
     * @param {Object} request - 请求对象
     * @returns {Promise<Response>} 响应对象
     */
    async sendThroughProxy(request) {
        try {
            const proxyResponse = await fetch(this.enhancedConfig.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });
            
            if (!proxyResponse.ok) {
                throw new Error(`代理请求失败: ${proxyResponse.status} ${proxyResponse.statusText}`);
            }
            
            return proxyResponse;
            
        } catch (error) {
            this.log(`💥 代理请求失败: ${error.message}`, 'error');
            throw error;
        }
    }
    
    /**
     * 处理增强的响应
     * @param {Response} response - 响应对象
     * @param {number} timestamp - 时间戳
     * @returns {Object} 处理结果
     */
    async handleEnhancedResponse(response, timestamp) {
        if (response.ok) {
            const data = await response.json();
            
            this.log('✅ 连接检查成功', 'debug');
            
            // 更新状态
            this.updateConnectionState({
                connected: true,
                version: data.version || 'unknown',
                libraryPath: data.libraryPath || null,
                timestamp: timestamp,
                error: null
            });
            
            // 缓存结果
            const result = {
                connected: true,
                version: data.version || 'unknown',
                libraryPath: data.libraryPath || null,
                error: null
            };
            
            this.connectionCache.set('enhanced_connection_check', {
                data: result,
                timestamp: timestamp
            });
            
            this.handleConnectionChange(true, this.connectionState);
            return result;
        } else {
            const errorText = await response.text();
            const errorMsg = `HTTP ${response.status}: ${errorText}`;
            
            this.log(`❌ 连接检查失败: ${errorMsg}`, 'error');
            
            // 更新状态
            this.updateConnectionState({
                connected: false,
                version: null,
                libraryPath: null,
                timestamp: timestamp,
                error: errorMsg
            });
            
            // 缓存失败结果
            const result = {
                connected: false,
                version: null,
                libraryPath: null,
                error: errorMsg
            };
            
            this.connectionCache.set('enhanced_connection_check', {
                data: result,
                timestamp: timestamp
            });
            
            this.handleError(errorMsg);
            return result;
        }
    }
    
    /**
     * 获取扩展的连接信息
     * @returns {Object} 扩展的连接信息
     */
    getExtendedConnectionInfo() {
        return {
            ...this.getConnectionInfo(),
            enhancedConfig: this.enhancedConfig,
            cacheStats: this.connectionCache.getStats ? this.connectionCache.getStats() : null
        };
    }
    
    /**
     * 设置代理配置
     * @param {string} proxyUrl - 代理URL
     * @param {boolean} enabled - 是否启用
     */
    setProxyConfig(proxyUrl, enabled = true) {
        this.enhancedConfig.proxyUrl = proxyUrl;
        this.enhancedConfig.proxySupport = enabled;
        
        this.log(`🔌 代理配置已更新: ${enabled ? '启用' : '禁用'} - ${proxyUrl || '无'}`, 'debug');
    }
    
    /**
     * 测试连接性能
     * @returns {Object} 性能测试结果
     */
    async testConnectionPerformance() {
        const tests = [
            { name: 'connection_time', url: `/api/info`, method: 'GET' },
            { name: 'library_check', url: `/api/library/info`, method: 'GET' },
            { name: 'ping', url: `/api/ping`, method: 'GET' }
        ];
        
        const results = {};
        
        for (const test of tests) {
            const startTime = performance.now();
            try {
                const response = await fetch(`http://${this.connectionConfig.host}:${this.connectionConfig.port}${test.url}`, {
                    method: test.method,
                    headers: { 'User-Agent': this.enhancedConfig.userAgent }
                });
                
                const endTime = performance.now();
                results[test.name] = {
                    success: response.ok,
                    time: endTime - startTime,
                    status: response.status
                };
            } catch (error) {
                const endTime = performance.now();
                results[test.name] = {
                    success: false,
                    time: endTime - startTime,
                    error: error.message
                };
            }
        }
        
        return results;
    }
}

// 使用增强连接管理器
const enhancedConnectionManager = new EnhancedEagleConnectionManager(aeExtension);

// 设置代理配置（如果需要）
// enhancedConnectionManager.setProxyConfig('http://proxy.example.com:8080', true);

// 获取扩展信息
const extendedInfo = enhancedConnectionManager.getExtendedConnectionInfo();
console.log('扩展连接信息:', extendedInfo);

// 测试连接性能
const perfTest = await enhancedConnectionManager.testConnectionPerformance();
console.log('连接性能测试:', perfTest);
```

#### 插件化架构
```javascript
// 创建Eagle连接管理插件
class EagleConnectionPlugin {
    constructor(connectionManager) {
        this.connectionManager = connectionManager;
        this.pluginData = new Map();
        this.init();
    }
    
    init() {
        // 注册插件特定的事件监听器
        this.connectionManager.addConnectListener((event) => {
            this.onConnected(event);
        });
        
        this.connectionManager.addDisconnectListener((event) => {
            this.onDisconnected(event);
        });
        
        this.connectionManager.addErrorListener((event) => {
            this.onError(event);
        });
        
        // 添加插件特定的连接验证规则
        this.connectionManager.addValidator('plugin.customCheck', (status) => {
            // 自定义验证逻辑
            return { valid: true };
        });
        
        // 添加插件特定的连接处理器
        this.bindPluginHandlers();
    }
    
    /**
     * 绑定插件处理器
     */
    bindPluginHandlers() {
        // 监听连接事件
        document.addEventListener('eagleConnected', (event) => {
            this.handleConnected(event);
        });
        
        // 监听断开事件
        document.addEventListener('eagleDisconnected', (event) => {
            this.handleDisconnected(event);
        });
        
        // 监听错误事件
        document.addEventListener('eagleConnectionError', (event) => {
            this.handleErrorEvent(event);
        });
    }
    
    /**
     * 连接事件处理
     * @param {Object} event - 事件数据
     */
    onConnected(event) {
        console.log('🔌 Eagle连接插件: 已连接');
        
        // 插件特定的连接处理逻辑
        this.updatePluginState('connected', event);
        this.syncPluginData(event);
        this.notifyConnectionChange('connected', event);
    }
    
    /**
     * 断开事件处理
     * @param {Object} event - 事件数据
     */
    onDisconnected(event) {
        console.log('🔌 Eagle连接插件: 已断开');
        
        // 插件特定的断开处理逻辑
        this.updatePluginState('disconnected', event);
        this.handleDisconnection(event);
        this.notifyConnectionChange('disconnected', event);
    }
    
    /**
     * 错误事件处理
     * @param {Object} event - 事件数据
     */
    onError(event) {
        console.log('❌ Eagle连接插件: 连接错误');
        
        // 插件特定的错误处理逻辑
        this.updatePluginState('error', event);
        this.handleConnectionError(event);
        this.notifyConnectionChange('error', event);
    }
    
    /**
     * 更新插件状态
     * @param {string} status - 状态类型
     * @param {Object} event - 事件数据
     */
    updatePluginState(status, event) {
        this.pluginData.set('status', status);
        this.pluginData.set('lastEvent', event);
        this.pluginData.set('lastUpdate', Date.now());
        
        console.log(`🔌 Eagle连接插件: 状态更新为 ${status}`);
    }
    
    /**
     * 同步插件数据
     * @param {Object} event - 事件数据
     */
    async syncPluginData(event) {
        if (event.connected) {
            try {
                // 同步插件特定的数据到Eagle或云端
                const syncResult = await this.syncDataToRemote(event);
                if (syncResult.success) {
                    console.log('云端数据同步成功');
                } else {
                    console.error('云端数据同步失败:', syncResult.error);
                }
            } catch (error) {
                console.error('数据同步异常:', error.message);
            }
        }
    }
    
    /**
     * 同步数据到远程
     * @param {Object} event - 事件数据
     * @returns {Promise<Object>} 同步结果
     */
    async syncDataToRemote(event) {
        try {
            const syncData = {
                connection: {
                    version: event.version,
                    libraryPath: event.libraryPath,
                    timestamp: event.timestamp
                },
                plugin: {
                    version: '1.0.0',
                    userId: this.getUserId(),
                    deviceId: this.getDeviceId(),
                    lastSync: this.pluginData.get('lastSync') || null
                }
            };
            
            // 发送同步请求
            const response = await fetch('/api/connection/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(syncData)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.pluginData.set('lastSync', Date.now());
                return { success: true, data: result };
            } else {
                return { success: false, error: `HTTP ${response.status}` };
            }
            
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 处理断开连接
     * @param {Object} event - 事件数据
     */
    handleDisconnection(event) {
        // 断开连接时的插件特定处理
        console.log('🔌 Eagle连接插件: 处理断开连接');
        
        // 例如：暂停同步操作、保存本地状态等
        this.pauseSyncOperations();
        this.saveLocalState();
    }
    
    /**
     * 处理连接错误
     * @param {Object} event - 事件数据
     */
    handleConnectionError(event) {
        // 连接错误时的插件特定处理
        console.log('❌ Eagle连接插件: 处理连接错误:', event.error);
        
        // 例如：记录错误日志、发送错误报告等
        this.logError(event.error);
        this.sendErrorReport(event.error);
    }
    
    /**
     * 通知连接状态变更
     * @param {string} status - 状态
     * @param {Object} event - 事件数据
     */
    notifyConnectionChange(status, event) {
        // 触发插件特定的连接状态变更通知
        const pluginEvent = new CustomEvent('eagleConnectionPluginChange', {
            detail: {
                status: status,
                event: event,
                timestamp: Date.now(),
                pluginId: this.getPluginId()
            }
        });
        
        document.dispatchEvent(pluginEvent);
        
        console.log(`🔌 Eagle连接插件: 通知状态变更 ${status}`);
    }
    
    /**
     * 暂停同步操作
     */
    pauseSyncOperations() {
        // 暂停插件的同步操作
        console.log('🔌 Eagle连接插件: 暂停同步操作');
        
        this.pluginData.set('syncPaused', true);
    }
    
    /**
     * 保存本地状态
     */
    saveLocalState() {
        // 保存插件的本地状态
        try {
            const state = {
                pluginData: Object.fromEntries(this.pluginData),
                timestamp: Date.now()
            };
            
            localStorage.setItem('eagleConnectionPluginState', JSON.stringify(state));
            console.log('🔌 Eagle连接插件: 本地状态已保存');
        } catch (error) {
            console.error('保存本地状态失败:', error.message);
        }
    }
    
    /**
     * 恢复本地状态
     */
    restoreLocalState() {
        try {
            const stateStr = localStorage.getItem('eagleConnectionPluginState');
            if (stateStr) {
                const state = JSON.parse(stateStr);
                
                // 恢复插件数据
                Object.entries(state.pluginData).forEach(([key, value]) => {
                    this.pluginData.set(key, value);
                });
                
                console.log('🔌 Eagle连接插件: 本地状态已恢复');
            }
        } catch (error) {
            console.error('恢复本地状态失败:', error.message);
        }
    }
    
    /**
     * 记录错误
     * @param {string} error - 错误信息
     */
    logError(error) {
        console.error('🔌 Eagle连接插件错误:', error);
        
        // 可以添加更详细的错误记录逻辑
        const errorLog = {
            error: error,
            timestamp: Date.now(),
            connectionState: this.connectionManager.getConnectionInfo()
        };
        
        // 保存到本地错误日志
        this.saveErrorLog(errorLog);
    }
    
    /**
     * 保存错误日志
     * @param {Object} errorLog - 错误日志对象
     */
    saveErrorLog(errorLog) {
        try {
            let logs = JSON.parse(localStorage.getItem('eagleConnectionPluginErrors') || '[]');
            logs.push(errorLog);
            
            // 只保留最近100个错误日志
            if (logs.length > 100) {
                logs = logs.slice(-100);
            }
            
            localStorage.setItem('eagleConnectionPluginErrors', JSON.stringify(logs));
        } catch (error) {
            console.error('保存错误日志失败:', error.message);
        }
    }
    
    /**
     * 发送错误报告
     * @param {string} error - 错误信息
     */
    async sendErrorReport(error) {
        try {
            const report = {
                error: error,
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                pluginVersion: '1.0.0',
                connectionState: this.connectionManager.getConnectionInfo(),
                pluginData: Object.fromEntries(this.pluginData)
            };
            
            // 发送错误报告到服务端
            await fetch('/api/error-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(report)
            });
            
            console.log('错误报告已发送');
        } catch (reportError) {
            console.error('发送错误报告失败:', reportError.message);
        }
    }
    
    /**
     * 获取用户ID
     * @returns {string} 用户ID
     */
    getUserId() {
        try {
            return localStorage.getItem('userId') || 'anonymous';
        } catch (error) {
            return 'anonymous';
        }
    }
    
    /**
     * 获取设备ID
     * @returns {string} 设备ID
     */
    getDeviceId() {
        try {
            return localStorage.getItem('deviceId') || this.generateDeviceId();
        } catch (error) {
            return this.generateDeviceId();
        }
    }
    
    /**
     * 生成设备ID
     * @returns {string} 设备ID
     */
    generateDeviceId() {
        try {
            const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('deviceId', deviceId);
            return deviceId;
        } catch (error) {
            return `device_${Date.now()}`;
        }
    }
    
    /**
     * 获取插件ID
     * @returns {string} 插件ID
     */
    getPluginId() {
        return 'eagle-connection-plugin';
    }
}

// 应用插件
const plugin = new EagleConnectionPlugin(eagleConnectionManager);