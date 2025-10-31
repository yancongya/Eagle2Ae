// Eagle2Ae - AE端端口发现服务
// 从Eagle注册的临时文件中发现服务端口

class PortDiscovery {
    constructor(logger) {
        this.logger = logger || console.log;
        this.registryFile = null;
        this.cachedPort = null;
        this.cacheTime = null;
        this.cacheTimeout = 30000; // 30秒缓存
        
        // 初始化注册文件路径
        this.initRegistryPath();
    }
    
    // 初始化注册文件路径
    initRegistryPath() {
        try {
            // 检查是否在CEP环境中且Folder API可用
            if (typeof Folder !== 'undefined' && Folder.temp) {
                const tempFolder = Folder.temp;
                if (tempFolder && tempFolder.fsName) {
                    this.registryFile = tempFolder.fsName + '/eagle2ae_port.txt';
                    this.log(`端口注册文件路径: ${this.registryFile}`, 'info');
                    return;
                }
            }

            // 如果Folder API不可用，使用备用方案
            throw new Error('Folder API不可用或无法获取临时目录');

        } catch (error) {
            this.log(`初始化注册文件路径失败: ${error.message}`, 'error');
            // 使用备用路径（相对路径）
            this.registryFile = 'eagle2ae_port.txt';
            this.log(`使用备用注册文件路径: ${this.registryFile}`, 'warning');
        }
    }
    
    // 日志方法
    log(message, level = 'info') {
        if (this.logger) {
            this.logger(`[PortDiscovery] ${message}`, level);
        }
    }
    
    // 读取注册文件
    readRegistryFile() {
        try {
            // 检查File API是否可用
            if (typeof File === 'undefined') {
                this.log('File API不可用，跳过注册文件读取', 'warning');
                return null;
            }

            // 跳过CEP环境中的File API，避免构造函数兼容性问题
            // 直接返回null，让系统使用默认的端口发现机制
            this.log('跳过注册文件读取，使用默认端口发现机制', 'info');
            return null;

        } catch (error) {
            this.log(`读取注册文件失败: ${error.message}`, 'error');
            return null;
        }
    }
    
    // 验证服务信息
    validateServiceInfo(serviceInfo) {
        if (!serviceInfo) {
            return { valid: false, reason: '服务信息为空' };
        }
        
        // 检查必要字段
        if (!serviceInfo.port || !serviceInfo.pid || !serviceInfo.startTime) {
            return { valid: false, reason: '服务信息格式不正确' };
        }
        
        // 检查端口范围
        const port = parseInt(serviceInfo.port);
        if (isNaN(port) || port < 1024 || port > 65535) {
            return { valid: false, reason: `端口号无效: ${serviceInfo.port}` };
        }
        
        // 检查时间戳（超过1小时认为过期）
        const now = Date.now();
        const age = now - serviceInfo.startTime;
        const maxAge = 60 * 60 * 1000; // 1小时
        
        if (age > maxAge) {
            return { valid: false, reason: '服务信息已过期' };
        }
        
        return { 
            valid: true, 
            port: port,
            age: Math.floor(age / 1000) // 秒
        };
    }
    
    // 测试端口连接
    async testPortConnection(port, timeout = 3000) {
        return new Promise((resolve) => {
            const testUrl = `http://localhost:${port}/ping`;
            
            // 创建超时处理
            const timeoutId = setTimeout(() => {
                resolve({ success: false, reason: '连接超时' });
            }, timeout);
            
            try {
                // 使用fetch API测试连接
                fetch(testUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    clearTimeout(timeoutId);
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error(`HTTP ${response.status}`);
                    }
                })
                .then(data => {
                    if (data && data.service === 'Eagle2Ae') {
                        resolve({ success: true, data: data });
                    } else {
                        resolve({ success: false, reason: '服务标识不匹配' });
                    }
                })
                .catch(error => {
                    resolve({ success: false, reason: error.message });
                });
                
            } catch (error) {
                clearTimeout(timeoutId);
                resolve({ success: false, reason: error.message });
            }
        });
    }
    
    // 发现Eagle服务端口
    async discoverPort() {
        try {
            this.log('开始发现Eagle服务端口...', 'info');
            
            // 检查缓存
            if (this.cachedPort && this.cacheTime && 
                (Date.now() - this.cacheTime) < this.cacheTimeout) {
                this.log(`使用缓存端口: ${this.cachedPort}`, 'info');
                return {
                    success: true,
                    port: this.cachedPort,
                    source: 'cache'
                };
            }
            
            // 1. 从注册文件读取服务信息
            const serviceInfo = this.readRegistryFile();
            if (!serviceInfo) {
                return {
                    success: false,
                    reason: '无法读取服务注册信息',
                    fallbackPort: 8080
                };
            }
            
            // 2. 验证服务信息
            const validation = this.validateServiceInfo(serviceInfo);
            if (!validation.valid) {
                this.log(`服务信息验证失败: ${validation.reason}`, 'warning');
                return {
                    success: false,
                    reason: validation.reason,
                    fallbackPort: 8080
                };
            }
            
            const port = validation.port;
            this.log(`发现端口: ${port} (服务运行时间: ${validation.age}秒)`, 'info');
            
            // 3. 测试端口连接
            this.log(`测试端口 ${port} 连接...`, 'info');
            const testResult = await this.testPortConnection(port);
            
            if (testResult.success) {
                this.log(`✅ 端口 ${port} 连接成功`, 'success');
                
                // 更新缓存
                this.cachedPort = port;
                this.cacheTime = Date.now();
                
                return {
                    success: true,
                    port: port,
                    source: 'discovery',
                    serviceInfo: testResult.data
                };
            } else {
                this.log(`❌ 端口 ${port} 连接失败: ${testResult.reason}`, 'error');
                return {
                    success: false,
                    reason: `端口连接失败: ${testResult.reason}`,
                    fallbackPort: port // 仍然返回发现的端口作为备选
                };
            }
            
        } catch (error) {
            this.log(`端口发现失败: ${error.message}`, 'error');
            return {
                success: false,
                reason: error.message,
                fallbackPort: 8080
            };
        }
    }
    
    // 获取端口（主要方法）
    async getEaglePort() {
        const result = await this.discoverPort();
        
        if (result.success) {
            this.log(`🎯 成功发现Eagle服务端口: ${result.port}`, 'success');
            return result.port;
        } else {
            this.log(`⚠️ 端口发现失败，使用备选端口: ${result.fallbackPort}`, 'warning');
            this.log(`失败原因: ${result.reason}`, 'warning');
            return result.fallbackPort;
        }
    }
    
    // 清除缓存
    clearCache() {
        this.cachedPort = null;
        this.cacheTime = null;
        this.log('端口缓存已清除', 'info');
    }
    
    // 获取发现状态
    async getDiscoveryStatus() {
        const result = await this.discoverPort();
        return {
            discovered: result.success,
            port: result.success ? result.port : result.fallbackPort,
            source: result.source || 'fallback',
            reason: result.reason,
            cached: result.source === 'cache',
            serviceInfo: result.serviceInfo
        };
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PortDiscovery;
} else {
    window.PortDiscovery = PortDiscovery;
}
