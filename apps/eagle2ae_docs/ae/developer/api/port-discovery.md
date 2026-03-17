# 端口发现服务 API

## 概述

端口发现服务（PortDiscovery）是 Eagle2Ae AE 扩展的一个核心组件，负责从Eagle注册的临时文件中发现服务端口。该服务提供了自动端口发现、服务验证、连接测试等功能，确保AE扩展能够正确连接到Eagle插件。

## 核心特性

### 自动端口发现
- 从系统临时目录读取Eagle注册文件
- 自动解析服务端口信息
- 支持端口缓存机制

### 服务验证
- 验证服务信息的有效性
- 检查端口范围和时间戳
- 提供服务过期检测

### 连接测试
- 测试发现端口的连接性
- 支持超时控制
- 提供详细的连接状态信息

## 技术实现

### 核心类结构

```javascript
/**
 * 端口发现服务
 * 从Eagle注册的临时文件中发现服务端口
 */
class PortDiscovery {
    /**
     * 构造函数
     * @param {Function} logger - 日志函数
     */
    constructor(logger) {
        this.logger = logger || console.log;
        this.registryFile = null;
        this.cachedPort = null;
        this.cacheTime = null;
        this.cacheTimeout = 30000; // 30秒缓存
        
        // 初始化注册文件路径
        this.initRegistryPath();
    }
}
```

### 注册文件路径初始化

```javascript
/**
 * 初始化注册文件路径
 */
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
```

### 注册文件读取

```javascript
/**
 * 读取注册文件
 * @returns {Object|null} 服务信息或null
 */
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
```

### 服务信息验证

```javascript
/**
 * 验证服务信息
 * @param {Object} serviceInfo - 服务信息
 * @returns {Object} 验证结果
 */
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
```

### 端口连接测试

```javascript
/**
 * 测试端口连接
 * @param {number} port - 端口号
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<Object>} 测试结果
 */
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
```

## API参考

### 构造函数

```javascript
/**
 * 端口发现服务构造函数
 * @param {Function} logger - 日志函数
 */
constructor(logger)
```

### 核心方法

#### discoverPort()
发现Eagle服务端口

```javascript
/**
 * 发现Eagle服务端口
 * @returns {Promise<Object>} 发现结果
 */
async discoverPort()
```

#### getEaglePort()
获取Eagle端口（主要方法）

```javascript
/**
 * 获取Eagle端口（主要方法）
 * @returns {Promise<number>} Eagle端口号
 */
async getEaglePort()
```

#### clearCache()
清除缓存

```javascript
/**
 * 清除缓存
 */
clearCache()
```

#### getDiscoveryStatus()
获取发现状态

```javascript
/**
 * 获取发现状态
 * @returns {Promise<Object>} 发现状态信息
 */
async getDiscoveryStatus()
```

### 辅助方法

#### readRegistryFile()
读取注册文件

```javascript
/**
 * 读取注册文件
 * @returns {Object|null} 服务信息或null
 */
readRegistryFile()
```

#### validateServiceInfo()
验证服务信息

```javascript
/**
 * 验证服务信息
 * @param {Object} serviceInfo - 服务信息
 * @returns {Object} 验证结果
 */
validateServiceInfo(serviceInfo)
```

#### testPortConnection()
测试端口连接

```javascript
/**
 * 测试端口连接
 * @param {number} port - 端口号
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<Object>} 测试结果
 */
async testPortConnection(port, timeout = 3000)
```

## 使用示例

### 基本使用

```javascript
// 创建端口发现服务实例
const portDiscovery = new PortDiscovery(console.log);

// 发现Eagle服务端口
const port = await portDiscovery.getEaglePort();
console.log(`发现Eagle端口: ${port}`);

// 获取详细的发现状态
const status = await portDiscovery.getDiscoveryStatus();
console.log('端口发现状态:', status);
```

### 端口验证

```javascript
// 创建端口发现服务实例
const portDiscovery = new PortDiscovery(console.log);

// 执行端口发现
const discoveryResult = await portDiscovery.discoverPort();

if (discoveryResult.success) {
    console.log(`✅ 成功发现端口: ${discoveryResult.port}`);
    
    // 检查服务信息
    if (discoveryResult.serviceInfo) {
        console.log('服务信息:', discoveryResult.serviceInfo);
    }
} else {
    console.log(`❌ 端口发现失败: ${discoveryResult.reason}`);
    
    // 使用备选端口
    if (discoveryResult.fallbackPort) {
        console.log(`使用备选端口: ${discoveryResult.fallbackPort}`);
    }
}
```

### 缓存管理

```javascript
// 创建端口发现服务实例
const portDiscovery = new PortDiscovery(console.log);

// 获取端口（可能使用缓存）
const port1 = await portDiscovery.getEaglePort();

// 清除缓存
portDiscovery.clearCache();

// 再次获取端口（强制重新发现）
const port2 = await portDiscovery.getEaglePort();

console.log(`端口1: ${port1}, 端口2: ${port2}`);
```

### 状态监控

```javascript
// 创建端口发现服务实例
const portDiscovery = new PortDiscovery(console.log);

// 定期检查端口发现状态
setInterval(async () => {
    try {
        const status = await portDiscovery.getDiscoveryStatus();
        console.log('端口发现状态更新:', {
            discovered: status.discovered,
            port: status.port,
            source: status.source,
            cached: status.cached
        });
        
        // 根据状态更新UI
        updatePortStatusUI(status);
    } catch (error) {
        console.error('获取端口发现状态失败:', error);
    }
}, 30000); // 每30秒检查一次
```

## 最佳实践

### 性能优化

1. **合理使用缓存**
   ```javascript
   // 利用缓存避免重复的端口发现
   const portDiscovery = new PortDiscovery();
   
   // 第一次调用可能执行实际发现
   const port1 = await portDiscovery.getEaglePort();
   
   // 短时间内再次调用将使用缓存
   const port2 = await portDiscovery.getEaglePort();
   
   console.log(`端口1: ${port1}, 端口2: ${port2} (来自缓存)`);
   ```

2. **设置合适的超时时间**
   ```javascript
   // 为不同的网络环境设置合适的超时时间
   const portDiscovery = new PortDiscovery();
   
   // 在局域网环境中使用较短超时
   const result = await portDiscovery.testPortConnection(8080, 2000);
   
   // 在可能较慢的网络中使用较长超时
   const result2 = await portDiscovery.testPortConnection(8080, 5000);
   ```

3. **批量状态检查**
   ```javascript
   // 批量获取端口发现状态以减少重复调用
   async function getPortDiscoveryInfo(portDiscovery) {
       const [port, status] = await Promise.all([
           portDiscovery.getEaglePort(),
           portDiscovery.getDiscoveryStatus()
       ]);
       
       return { port, status };
   }
   ```

### 错误处理

1. **统一错误处理**
   ```javascript
   // 为端口发现提供统一的错误处理
   async function discoverEaglePort(portDiscovery) {
       try {
           const port = await portDiscovery.getEaglePort();
           if (!port) {
               throw new Error('无法发现有效的Eagle端口');
           }
           return port;
       } catch (error) {
           console.error('端口发现失败:', error.message);
           
           // 提供默认端口作为降级方案
           return 8080;
       }
   }
   ```

2. **降级处理**
   ```javascript
   // 当端口发现失败时提供降级方案
   const portDiscovery = new PortDiscovery();
   const discoveryResult = await portDiscovery.discoverPort();
   
   let eaglePort;
   if (discoveryResult.success) {
       eaglePort = discoveryResult.port;
   } else {
       // 降级到常用端口
       eaglePort = discoveryResult.fallbackPort || 8080;
       console.warn(`端口发现失败，使用默认端口: ${eaglePort}`);
   }
   ```

### 内存管理

1. **及时清理资源**
   ```javascript
   // 在应用关闭时清理端口发现服务
   window.addEventListener('beforeunload', () => {
       if (portDiscovery) {
           // 清除定时器和其他资源
           portDiscovery.clearCache();
       }
   });
   ```

2. **避免内存泄漏**
   ```javascript
   // 在组件销毁时清理引用
   function cleanupPortDiscovery(portDiscovery) {
       if (portDiscovery) {
           // 清除缓存
           portDiscovery.clearCache();
           
           // 清除引用
           portDiscovery.logger = null;
       }
   }
   ```

## 故障排除

### 常见问题

#### 端口发现失败
- **症状**：无法发现Eagle服务端口
- **解决**：
  1. 检查Eagle插件是否正在运行
  2. 验证注册文件是否存在
  3. 确认端口是否被防火墙阻止
  4. 检查端口是否被其他程序占用

#### 注册文件读取失败
- **症状**：控制台显示注册文件读取错误
- **解决**：
  1. 检查临时目录权限
  2. 验证注册文件格式
  3. 确认File API可用性
  4. 检查文件路径是否正确

#### 连接测试超时
- **症状**：端口连接测试超时
- **解决**：
  1. 检查网络连接状态
  2. 验证Eagle服务是否响应
  3. 调整超时设置
  4. 检查防火墙设置

### 调试技巧

#### 启用详细日志
```javascript
// 创建带详细日志的端口发现服务
const portDiscovery = new PortDiscovery((message, level) => {
    console.log(`[PortDiscovery][${level}] ${message}`);
});

// 执行端口发现并查看详细日志
const result = await portDiscovery.discoverPort();
```

#### 性能分析
```javascript
// 记录端口发现性能
async function analyzePortDiscoveryPerformance(portDiscovery) {
    const startTime = performance.now();
    const result = await portDiscovery.discoverPort();
    const endTime = performance.now();
    
    console.log(`端口发现耗时: ${endTime - startTime}ms`);
    console.log('发现结果:', result);
    
    return result;
}
```

#### 内存使用监控
```javascript
// 监控端口发现服务内存使用
function logPortDiscoveryMemoryUsage(portDiscovery) {
    console.log('端口发现服务状态:', {
        hasCachedPort: !!portDiscovery.cachedPort,
        cacheTime: portDiscovery.cacheTime,
        registryFile: portDiscovery.registryFile
    });
}
```

## 扩展性

### 自定义验证规则

```javascript
// 扩展端口发现服务以支持自定义验证
class CustomPortDiscovery extends PortDiscovery {
    constructor(logger) {
        super(logger);
        this.customValidators = [];
    }
    
    /**
     * 添加自定义验证器
     * @param {Function} validator - 验证函数
     */
    addCustomValidator(validator) {
        this.customValidators.push(validator);
    }
    
    /**
     * 重写验证方法以支持自定义验证
     */
    async validateServiceInfo(serviceInfo) {
        // 执行标准验证
        const standardResult = super.validateServiceInfo(serviceInfo);
        if (!standardResult.valid) {
            return standardResult;
        }
        
        // 执行自定义验证
        for (const validator of this.customValidators) {
            try {
                const customResult = await validator(serviceInfo);
                if (!customResult.valid) {
                    return customResult;
                }
            } catch (error) {
                this.log(`自定义验证器执行失败: ${error.message}`, 'error');
            }
        }
        
        return standardResult;
    }
}

// 使用自定义端口发现服务
const customPortDiscovery = new CustomPortDiscovery(console.log);

// 添加自定义验证规则
customPortDiscovery.addCustomValidator(async (serviceInfo) => {
    // 检查特定的端口范围
    if (serviceInfo.port < 8000 || serviceInfo.port > 9000) {
        return { valid: false, reason: '端口不在允许范围内' };
    }
    return { valid: true };
});

// 执行端口发现
const port = await customPortDiscovery.getEaglePort();
```

### 事件系统

```javascript
// 为端口发现服务添加事件系统
class EventedPortDiscovery extends PortDiscovery {
    constructor(logger) {
        super(logger);
        this.eventListeners = {};
    }
    
    /**
     * 添加事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {Object} data - 事件数据
     */
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('事件回调执行失败:', error);
                }
            });
        }
    }
    
    /**
     * 重写发现方法以触发事件
     */
    async discoverPort() {
        this.emit('discovery:start', { timestamp: Date.now() });
        
        try {
            const result = await super.discoverPort();
            
            if (result.success) {
                this.emit('discovery:success', { port: result.port, result });
            } else {
                this.emit('discovery:failure', { reason: result.reason, result });
            }
            
            return result;
        } catch (error) {
            this.emit('discovery:error', { error });
            throw error;
        }
    }
}

// 使用带事件的端口发现服务
const eventedPortDiscovery = new EventedPortDiscovery(console.log);

// 监听端口发现事件
eventedPortDiscovery.on('discovery:start', (data) => {
    console.log('开始端口发现:', data.timestamp);
});

eventedPortDiscovery.on('discovery:success', (data) => {
    console.log('端口发现成功:', data.port);
});

eventedPortDiscovery.on('discovery:failure', (data) => {
    console.log('端口发现失败:', data.reason);
});

// 执行端口发现将触发相应事件
const port = await eventedPortDiscovery.getEaglePort();