// Eagle2Ae - 动态端口分配器
// 自动寻找可用端口并注册服务信息

class DynamicPortAllocator {
    constructor() {
        // 端口范围配置
        this.portRange = [8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089];
        this.currentPort = null;
        this.registryFile = null;
        
        // 初始化注册文件路径
        this.initRegistryPath();
    }
    
    // 初始化注册文件路径
    initRegistryPath() {
        try {
            const os = require('os');
            const path = require('path');
            
            // 使用系统临时目录
            const tempDir = os.tmpdir();
            this.registryFile = path.join(tempDir, 'eagle2ae_port.txt');
            
            console.log(`端口注册文件路径: ${this.registryFile}`);
        } catch (error) {
            console.error('初始化注册文件路径失败:', error);
            // 使用备用路径
            this.registryFile = 'eagle2ae_port.txt';
        }
    }
    
    // 检查端口是否可用
    async isPortAvailable(port) {
        return new Promise((resolve) => {
            const net = require('net');
            const server = net.createServer();
            
            // 设置超时
            const timeout = setTimeout(() => {
                server.close();
                resolve(false);
            }, 1000);
            
            server.listen(port, '127.0.0.1', () => {
                clearTimeout(timeout);
                server.once('close', () => resolve(true));
                server.close();
            });
            
            server.on('error', () => {
                clearTimeout(timeout);
                resolve(false);
            });
        });
    }
    
    // 寻找可用端口
    async findAvailablePort() {
        console.log('开始扫描可用端口...');
        
        // 首先尝试预定义的端口范围
        for (const port of this.portRange) {
            console.log(`检查端口 ${port}...`);
            
            if (await this.isPortAvailable(port)) {
                console.log(`✅ 端口 ${port} 可用`);
                return port;
            } else {
                console.log(`❌ 端口 ${port} 被占用`);
            }
        }
        
        // 如果预定义端口都被占用，尝试随机端口
        console.log('预定义端口都被占用，尝试随机端口...');
        
        for (let i = 0; i < 20; i++) {
            // 使用动态端口范围 49152-65535
            const randomPort = Math.floor(Math.random() * (65535 - 49152)) + 49152;
            
            if (await this.isPortAvailable(randomPort)) {
                console.log(`✅ 随机端口 ${randomPort} 可用`);
                return randomPort;
            }
        }
        
        throw new Error('无法找到可用端口');
    }
    
    // 注册服务端口信息
    registerService(port) {
        try {
            const fs = require('fs');
            
            // 创建服务信息
            const serviceInfo = {
                port: port,
                pid: process.pid,
                startTime: Date.now(),
                timestamp: new Date().toISOString(),
                service: 'Eagle2Ae',
                version: '2.1.0'
            };
            
            // 写入端口信息到文件
            fs.writeFileSync(this.registryFile, JSON.stringify(serviceInfo, null, 2));
            
            console.log(`✅ 服务已注册: 端口 ${port}`);
            console.log(`📝 注册文件: ${this.registryFile}`);
            
            this.currentPort = port;
            return true;
            
        } catch (error) {
            console.error('注册服务失败:', error);
            return false;
        }
    }
    
    // 清理注册信息
    cleanup() {
        try {
            const fs = require('fs');
            
            if (fs.existsSync(this.registryFile)) {
                fs.unlinkSync(this.registryFile);
                console.log('✅ 注册文件已清理');
            }
        } catch (error) {
            console.error('清理注册文件失败:', error);
        }
    }
    
    // 获取当前注册的端口
    getCurrentPort() {
        return this.currentPort;
    }
    
    // 获取注册文件路径
    getRegistryFile() {
        return this.registryFile;
    }
    
    // 验证注册文件
    validateRegistry() {
        try {
            const fs = require('fs');
            
            if (!fs.existsSync(this.registryFile)) {
                return { valid: false, reason: '注册文件不存在' };
            }
            
            const content = fs.readFileSync(this.registryFile, 'utf8');
            const serviceInfo = JSON.parse(content);
            
            // 检查必要字段
            if (!serviceInfo.port || !serviceInfo.pid || !serviceInfo.startTime) {
                return { valid: false, reason: '注册文件格式不正确' };
            }
            
            // 检查时间戳（超过1小时认为过期）
            const now = Date.now();
            const age = now - serviceInfo.startTime;
            const maxAge = 60 * 60 * 1000; // 1小时
            
            if (age > maxAge) {
                return { valid: false, reason: '注册信息已过期' };
            }
            
            return { 
                valid: true, 
                serviceInfo: serviceInfo,
                age: Math.floor(age / 1000) // 秒
            };
            
        } catch (error) {
            return { valid: false, reason: `验证失败: ${error.message}` };
        }
    }
    
    // 分配端口（主要方法）
    async allocatePort() {
        try {
            console.log('🚀 开始动态端口分配...');
            
            // 1. 寻找可用端口
            const port = await this.findAvailablePort();
            
            // 2. 注册服务信息
            const registered = this.registerService(port);
            
            if (!registered) {
                throw new Error('服务注册失败');
            }
            
            console.log(`🎯 动态端口分配成功: ${port}`);
            return port;
            
        } catch (error) {
            console.error('❌ 动态端口分配失败:', error);
            throw error;
        }
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicPortAllocator;
} else {
    window.DynamicPortAllocator = DynamicPortAllocator;
}
