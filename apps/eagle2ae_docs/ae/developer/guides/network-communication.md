# 网络通信

## 概述

网络通信是 Eagle2Ae AE 扩展 JavaScript 核心功能的重要组件，提供了统一的 HTTP 请求客户端和 WebSocket 支持。该系统支持请求拦截、响应拦截、缓存、重试、速率限制等特性。

## 核心特性

### 网络通信
- **HTTP客户端** - 封装的HTTP请求客户端
- **WebSocket支持** - 实时双工通信支持
- **请求拦截器** - 支持请求和响应拦截处理
- **错误重试机制** - 自动重试失败的网络请求

### 技术实现

```javascript
/**
 * HTTP客户端
 * 提供统一的网络请求接口
 */
class HttpClient {
    /**
     * 构造函数
     */
    constructor() {
        // 请求配置
        this.config = {
            baseURL: '',
            timeout: 10000, // 10秒超时
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin',
            cache: 'default',
            redirect: 'follow',
            referrerPolicy: 'no-referrer-when-downgrade',
            integrity: '',
            keepalive: false,
            signal: null
        };
        
        // 请求拦截器
        this.requestInterceptors = [];
        
        // 响应拦截器
        this.responseInterceptors = [];
        
        // 请求统计
        this.stats = {
            totalRequests: 0,
            totalSuccess: 0,
            totalErrors: 0,
            totalTimeouts: 0,
            averageResponseTime: 0,
            requestQueue: new Map()
        };
        
        // 重试配置
        this.retryConfig = {
            maxRetries: 3,
            retryDelay: 1000, // 1秒
            retryOn: [500, 502, 503, 504], // 重试的HTTP状态码
            exponentialBackoff: true // 指数退避
        };
        
        // 缓存配置
        this.cacheConfig = {
            enabled: false,
            ttl: 300000, // 5分钟
            maxSize: 100,
            cache: new Map()
        };
        
        // 速率限制
        this.rateLimitConfig = {
            enabled: false,
            maxRequests: 60, // 每分钟最大请求数
            windowMs: 60000, // 窗口时间（毫秒）
            requests: []
        };
        
        // 绑定方法上下文
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
        this.put = this.put.bind(this);
        this.delete = this.delete.bind(this);
        this.patch = this.patch.bind(this);
        this.request = this.request.bind(this);
        this.interceptRequest = this.interceptRequest.bind(this);
        this.interceptResponse = this.interceptResponse.bind(this);
        this.addRequestInterceptor = this.addRequestInterceptor.bind(this);
        this.addResponseInterceptor = this.addResponseInterceptor.bind(this);
        this.removeRequestInterceptor = this.removeRequestInterceptor.bind(this);
        this.removeResponseInterceptor = this.removeResponseInterceptor.bind(this);
        this.setBaseURL = this.setBaseURL.bind(this);
        this.setTimeout = this.setTimeout.bind(this);
        this.setDefaultHeaders = this.setDefaultHeaders.bind(this);
        this.getStats = this.getStats.bind(this);
        this.clearCache = this.clearCache.bind(this);
        this.enableCache = this.enableCache.bind(this);
        this.disableCache = this.disableCache.bind(this);
        this.enableRateLimit = this.enableRateLimit.bind(this);
        this.disableRateLimit = this.disableRateLimit.bind(this);
        this.setRetryConfig = this.setRetryConfig.bind(this);
        
        console.log('🌐 HTTP客户端已初始化');
    }
    
    /**
     * GET请求
     * @param {string} url - 请求URL
     * @param {Object} config - 请求配置
     * @returns {Promise<Object>} 响应数据
     */
    async get(url, config = {}) {
        return await this.request({
            method: 'GET',
            url: url,
            ...config
        });
    }
    
    /**
     * POST请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @param {Object} config - 请求配置
     * @returns {Promise<Object>} 响应数据
     */
    async post(url, data, config = {}) {
        return await this.request({
            method: 'POST',
            url: url,
            data: data,
            ...config
        });
    }
    
    /**
     * PUT请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @param {Object} config - 请求配置
     * @returns {Promise<Object>} 响应数据
     */
    async put(url, data, config = {}) {
        return await this.request({
            method: 'PUT',
            url: url,
            data: data,
            ...config
        });
    }
    
    /**
     * DELETE请求
     * @param {string} url - 请求URL
     * @param {Object} config - 请求配置
     * @returns {Promise<Object>} 响应数据
     */
    async delete(url, config = {}) {
        return await this.request({
            method: 'DELETE',
            url: url,
            ...config
        });
    }
    
    /**
     * PATCH请求
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @param {Object} config - 请求配置
     * @returns {Promise<Object>} 响应数据
     */
    async patch(url, data, config = {}) {
        return await this.request({
            method: 'PATCH',
            url: url,
            data: data,
            ...config
        });
    }
    
    /**
     * 通用请求方法
     * @param {Object} config - 请求配置
     * @returns {Promise<Object>} 响应数据
     */
    async request(config) {
        try {
            // 合并配置
            const requestConfig = {
                ...this.config,
                ...config,
                headers: {
                    ...this.config.headers,
                    ...config.headers
                }
            };
            
            // 处理URL
            requestConfig.url = this.buildURL(requestConfig.baseURL, requestConfig.url);
            
            // 检查速率限制
            if (this.rateLimitConfig.enabled) {
                const canProceed = await this.checkRateLimit();
                if (!canProceed) {
                    throw new Error('请求频率超过限制');
                }
            }
            
            // 检查缓存
            if (this.cacheConfig.enabled && requestConfig.method === 'GET') {
                const cachedResponse = this.getFromCache(requestConfig.url);
                if (cachedResponse) {
                    console.log(`📋 使用缓存响应: ${requestConfig.url}`);
                    return cachedResponse;
                }
            }
            
            // 生成请求ID
            const requestId = this.generateRequestId();
            
            // 记录请求开始时间
            const startTime = Date.now();
            
            // 添加到统计和队列
            this.stats.totalRequests++;
            this.stats.requestQueue.set(requestId, {
                config: requestConfig,
                startTime: startTime,
                status: 'pending'
            });
            
            console.log(`📤 发送请求: ${requestConfig.method} ${requestConfig.url}`);
            
            // 应用请求拦截器
            let interceptedConfig = { ...requestConfig };
            for (const interceptor of this.requestInterceptors) {
                try {
                    interceptedConfig = await interceptor(interceptedConfig) || interceptedConfig;
                } catch (interceptorError) {
                    console.error(`请求拦截器执行失败: ${interceptorError.message}`);
                }
            }
            
            // 执行请求
            const response = await this.executeRequest(interceptedConfig, requestId);
            
            // 记录请求完成时间
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 更新统计信息
            this.stats.totalSuccess++;
            this.updateAverageResponseTime(duration);
            
            // 更新请求队列状态
            if (this.stats.requestQueue.has(requestId)) {
                const requestInfo = this.stats.requestQueue.get(requestId);
                requestInfo.endTime = endTime;
                requestInfo.duration = duration;
                requestInfo.status = 'success';
            }
            
            // 应用响应拦截器
            let interceptedResponse = response;
            for (const interceptor of this.responseInterceptors) {
                try {
                    interceptedResponse = await interceptor(interceptedResponse) || interceptedResponse;
                } catch (interceptorError) {
                    console.error(`响应拦截器执行失败: ${interceptorError.message}`);
                }
            }
            
            // 缓存GET请求响应
            if (this.cacheConfig.enabled && requestConfig.method === 'GET') {
                this.cacheResponse(requestConfig.url, interceptedResponse);
            }
            
            console.log(`✅ 请求完成: ${requestConfig.method} ${requestConfig.url} (${duration}ms)`);
            
            return interceptedResponse;
            
        } catch (error) {
            this.stats.totalErrors++;
            
            console.error(`❌ 请求失败: ${error.message}`);
            
            // 更新请求队列状态
            // 注意：这里没有requestId，所以无法更新具体请求的状态
            
            throw error;
        }
    }
    
    /**
     * 执行HTTP请求
     * @param {Object} config - 请求配置
     * @param {string} requestId - 请求ID
     * @returns {Promise<Object>} 响应数据
     */
    async executeRequest(config, requestId) {
        try {
            // 创建AbortController用于超时控制
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, config.timeout || this.config.timeout);
            
            // 合并信号
            const signal = controller.signal;
            
            // 构建fetch选项
            const fetchOptions = {
                method: config.method,
                headers: config.headers,
                credentials: config.credentials,
                cache: config.cache,
                redirect: config.redirect,
                referrerPolicy: config.referrerPolicy,
                integrity: config.integrity,
                keepalive: config.keepalive,
                signal: signal
            };
            
            // 处理请求体
            if (config.data) {
                if (config.headers['Content-Type'] === 'application/json') {
                    fetchOptions.body = JSON.stringify(config.data);
                } else {
                    fetchOptions.body = config.data;
                }
            }
            
            // 执行请求
            const response = await fetch(config.url, fetchOptions);
            
            // 清除超时定时器
            clearTimeout(timeoutId);
            
            // 检查是否需要重试
            if (this.shouldRetry(response, config)) {
                return await this.retryRequest(config, requestId);
            }
            
            // 检查响应状态
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }
            
            // 解析响应数据
            let responseData;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }
            
            return {
                data: responseData,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                config: config
            };
            
        } catch (error) {
            // 检查是否超时
            if (error.name === 'AbortError') {
                this.stats.totalTimeouts++;
                throw new Error(`请求超时: ${config.timeout || this.config.timeout}ms`);
            }
            
            throw error;
        }
    }
    
    /**
     * 检查是否需要重试
     * @param {Response} response - 响应对象
     * @param {Object} config - 请求配置
     * @returns {boolean} 是否需要重试
     */
    shouldRetry(response, config) {
        try {
            // 检查重试配置
            if (!this.retryConfig.maxRetries || this.retryConfig.maxRetries <= 0) {
                return false;
            }
            
            // 检查状态码是否在重试列表中
            return this.retryConfig.retryOn.includes(response.status);
            
        } catch (error) {
            console.error(`检查重试条件失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 重试请求
     * @param {Object} config - 请求配置
     * @param {string} requestId - 请求ID
     * @param {number} retryCount - 重试次数
     * @returns {Promise<Object>} 响应数据
     */
    async retryRequest(config, requestId, retryCount = 0) {
        try {
            if (retryCount >= this.retryConfig.maxRetries) {
                throw new Error(`达到最大重试次数: ${this.retryConfig.maxRetries}`);
            }
            
            // 计算延迟时间
            let delay = this.retryConfig.retryDelay;
            if (this.retryConfig.exponentialBackoff) {
                delay = delay * Math.pow(2, retryCount);
            }
            
            console.log(`🔄 重试请求 (${retryCount + 1}/${this.retryConfig.maxRetries}): ${config.method} ${config.url} (延迟${delay}ms)`);
            
            // 等待延迟
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // 重新执行请求
            return await this.executeRequest(config, requestId);
            
        } catch (error) {
            console.error(`重试请求失败: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 构建完整URL
     * @param {string} baseURL - 基础URL
     * @param {string} url - 相对URL
     * @returns {string} 完整URL
     */
    buildURL(baseURL, url) {
        try {
            // 如果URL已经是完整URL，直接返回
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            
            // 如果没有baseURL，返回相对URL
            if (!baseURL) {
                return url;
            }
            
            // 合并baseURL和URL
            let fullURL = baseURL;
            
            // 确保baseURL以斜杠结尾
            if (!fullURL.endsWith('/')) {
                fullURL += '/';
            }
            
            // 移除URL开头的斜杠
            if (url.startsWith('/')) {
                url = url.substring(1);
            }
            
            return fullURL + url;
            
        } catch (error) {
            console.error(`构建URL失败: ${error.message}`);
            return url;
        }
    }
    
    /**
     * 检查速率限制
     * @returns {Promise<boolean>} 是否可以继续请求
     */
    async checkRateLimit() {
        try {
            if (!this.rateLimitConfig.enabled) {
                return true;
            }
            
            const now = Date.now();
            const windowStart = now - this.rateLimitConfig.windowMs;
            
            // 清理过期的请求记录
            this.rateLimitConfig.requests = this.rateLimitConfig.requests.filter(
                timestamp => timestamp > windowStart
            );
            
            // 检查是否超过限制
            if (this.rateLimitConfig.requests.length >= this.rateLimitConfig.maxRequests) {
                console.warn(`⚠️ 请求频率超过限制: ${this.rateLimitConfig.requests.length}/${this.rateLimitConfig.maxRequests}`);
                return false;
            }
            
            // 记录当前请求
            this.rateLimitConfig.requests.push(now);
            
            return true;
            
        } catch (error) {
            console.error(`检查速率限制失败: ${error.message}`);
            return true; // 默认允许请求继续
        }
    }
    
    /**
     * 缓存响应
     * @param {string} url - 请求URL
     * @param {Object} response - 响应数据
     */
    cacheResponse(url, response) {
        try {
            if (!this.cacheConfig.enabled) {
                return;
            }
            
            // 检查缓存大小
            if (this.cacheConfig.cache.size >= this.cacheConfig.maxSize) {
                // 移除最早的缓存项
                const firstKey = this.cacheConfig.cache.keys().next().value;
                if (firstKey) {
                    this.cacheConfig.cache.delete(firstKey);
                }
            }
            
            // 添加到缓存
            this.cacheConfig.cache.set(url, {
                data: response,
                timestamp: Date.now(),
                expires: Date.now() + this.cacheConfig.ttl
            });
            
            console.log(`キャッシング 响应: ${url}`);
            
        } catch (error) {
            console.error(`缓存响应失败: ${error.message}`);
        }
    }
    
    /**
     * 从缓存获取响应
     * @param {string} url - 请求URL
     * @returns {Object|null} 缓存的响应数据
     */
    getFromCache(url) {
        try {
            if (!this.cacheConfig.enabled || !this.cacheConfig.cache.has(url)) {
                return null;
            }
            
            const cached = this.cacheConfig.cache.get(url);
            
            // 检查是否过期
            if (Date.now() > cached.expires) {
                this.cacheConfig.cache.delete(url);
                return null;
            }
            
            return cached.data;
            
        } catch (error) {
            console.error(`从缓存获取响应失败: ${error.message}`);
            return null;
        }
    }
    
    /**
     * 清空缓存
     */
    clearCache() {
        try {
            if (this.cacheConfig.cache) {
                const cacheSize = this.cacheConfig.cache.size;
                this.cacheConfig.cache.clear();
                console.log(`🗑️ 清空缓存 (${cacheSize}项)`);
            }
            
        } catch (error) {
            console.error(`清空缓存失败: ${error.message}`);
        }
    }
    
    /**
     * 启用缓存
     * @param {Object} config - 缓存配置
     */
    enableCache(config = {}) {
        try {
            this.cacheConfig.enabled = true;
            this.cacheConfig.ttl = config.ttl || this.cacheConfig.ttl;
            this.cacheConfig.maxSize = config.maxSize || this.cacheConfig.maxSize;
            
            console.log('📊 启用响应缓存');
            
        } catch (error) {
            console.error(`启用缓存失败: ${error.message}`);
        }
    }
    
    /**
     * 禁用缓存
     */
    disableCache() {
        try {
            this.cacheConfig.enabled = false;
            this.clearCache();
            
            console.log('📊 禁用响应缓存');
            
        } catch (error) {
            console.error(`禁用缓存失败: ${error.message}`);
        }
    }
    
    /**
     * 启用速率限制
     * @param {Object} config - 速率限制配置
     */
    enableRateLimit(config = {}) {
        try {
            this.rateLimitConfig.enabled = true;
            this.rateLimitConfig.maxRequests = config.maxRequests || this.rateLimitConfig.maxRequests;
            this.rateLimitConfig.windowMs = config.windowMs || this.rateLimitConfig.windowMs;
            
            console.log('📊 启用请求速率限制');
            
        } catch (error) {
            console.error(`启用速率限制失败: ${error.message}`);
        }
    }
    
    /**
     * 禁用速率限制
     */
    disableRateLimit() {
        try {
            this.rateLimitConfig.enabled = false;
            this.rateLimitConfig.requests = [];
            
            console.log('📊 禁用请求速率限制');
            
        } catch (error) {
            console.error(`禁用速率限制失败: ${error.message}`);
        }
    }
    
    /**
     * 设置重试配置
     * @param {Object} config - 重试配置
     */
    setRetryConfig(config = {}) {
        try {
            this.retryConfig = {
                ...this.retryConfig,
                ...config
            };
            
            console.log('📊 更新重试配置', this.retryConfig);
            
        } catch (error) {
            console.error(`设置重试配置失败: ${error.message}`);
        }
    }
    
    /**
     * 添加请求拦截器
     * @param {Function} interceptor - 拦截器函数
     * @returns {Function} 移除拦截器的函数
     */
    addRequestInterceptor(interceptor) {
        try {
            if (typeof interceptor !== 'function') {
                throw new Error('拦截器必须是函数');
            }
            
            this.requestInterceptors.push(interceptor);
            
            console.log('🔧 添加请求拦截器');
            
            // 返回移除拦截器的函数
            return () => {
                this.removeRequestInterceptor(interceptor);
            };
            
        } catch (error) {
            console.error(`添加请求拦截器失败: ${error.message}`);
            return () => {}; // 返回空函数以防调用错误
        }
    }
    
    /**
     * 移除请求拦截器
     * @param {Function} interceptor - 拦截器函数
     */
    removeRequestInterceptor(interceptor) {
        try {
            const index = this.requestInterceptors.indexOf(interceptor);
            if (index !== -1) {
                this.requestInterceptors.splice(index, 1);
                console.log('🔧 移除请求拦截器');
            }
            
        } catch (error) {
            console.error(`移除请求拦截器失败: ${error.message}`);
        }
    }
    
    /**
     * 添加响应拦截器
     * @param {Function} interceptor - 拦截器函数
     * @returns {Function} 移除拦截器的函数
     */
    addResponseInterceptor(interceptor) {
        try {
            if (typeof interceptor !== 'function') {
                throw new Error('拦截器必须是函数');
            }
            
            this.responseInterceptors.push(interceptor);
            
            console.log('🔧 添加响应拦截器');
            
            // 返回移除拦截器的函数
            return () => {
                this.removeResponseInterceptor(interceptor);
            };
            
        } catch (error) {
            console.error(`添加响应拦截器失败: ${error.message}`);
            return () => {}; // 返回空函数以防调用错误
        }
    }
    
    /**
     * 移除响应拦截器
     * @param {Function} interceptor - 拦截器函数
     */
    removeResponseInterceptor(interceptor) {
        try {
            const index = this.responseInterceptors.indexOf(interceptor);
            if (index !== -1) {
                this.responseInterceptors.splice(index, 1);
                console.log('🔧 移除响应拦截器');
            }
            
        } catch (error) {
            console.error(`移除响应拦截器失败: ${error.message}`);
        }
    }
    
    /**
     * 设置基础URL
     * @param {string} baseURL - 基础URL
     */
    setBaseURL(baseURL) {
        try {
            this.config.baseURL = baseURL;
            console.log(`🌐 设置基础URL: ${baseURL}`);
            
        } catch (error) {
            console.error(`设置基础URL失败: ${error.message}`);
        }
    }
    
    /**
     * 设置超时时间
     * @param {number} timeout - 超时时间（毫秒）
     */
    setTimeout(timeout) {
        try {
            this.config.timeout = timeout;
            console.log(`⏰ 设置超时时间: ${timeout}ms`);
            
        } catch (error) {
            console.error(`设置超时时间失败: ${error.message}`);
        }
    }
    
    /**
     * 设置默认请求头
     * @param {Object} headers - 请求头
     */
    setDefaultHeaders(headers) {
        try {
            this.config.headers = {
                ...this.config.headers,
                ...headers
            };
            
            console.log('📋 设置默认请求头', headers);
            
        } catch (error) {
            console.error(`设置默认请求头失败: ${error.message}`);
        }
    }
    
    /**
     * 生成请求ID
     * @returns {string} 请求ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 更新平均响应时间
     * @param {number} duration - 响应时间
     */
    updateAverageResponseTime(duration) {
        try {
            const totalRequests = this.stats.totalSuccess + this.stats.totalErrors;
            if (totalRequests > 0) {
                this.stats.averageResponseTime = (
                    (this.stats.averageResponseTime * (totalRequests - 1)) + duration
                ) / totalRequests;
            } else {
                this.stats.averageResponseTime = duration;
            }
            
        } catch (error) {
            console.error(`更新平均响应时间失败: ${error.message}`);
        }
    }
    
    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            ...this.stats,
            averageResponseTime: Math.round(this.stats.averageResponseTime),
            pendingRequests: this.stats.requestQueue.size,
            cacheSize: this.cacheConfig.cache ? this.cacheConfig.cache.size : 0,
            rateLimitQueueSize: this.rateLimitConfig.requests ? this.rateLimitConfig.requests.length : 0
        };
    }
    
    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            totalRequests: 0,
            totalSuccess: 0,
            totalErrors: 0,
            totalTimeouts: 0,
            averageResponseTime: 0,
            requestQueue: new Map()
        };
        
        console.log('📊 重置网络统计信息');
    }
    
    /**
     * 清理HTTP客户端
     */
    cleanup() {
        try {
            console.log('🧹 清理HTTP客户端...');
            
            // 清空拦截器
            this.requestInterceptors = [];
            this.responseInterceptors = [];
            
            // 清空缓存
            this.clearCache();
            
            // 重置统计信息
            this.resetStats();
            
            // 清空请求队列
            this.stats.requestQueue.clear();
            
            // 清空速率限制队列
            this.rateLimitConfig.requests = [];
            
            console.log('✅ HTTP客户端清理完成');
            
        } catch (error) {
            console.error(`❌ 清理HTTP客户端失败: ${error.message}`);
        }
    }
}

// 导出HTTP客户端
const httpClient = new HttpClient();
export default httpClient;

// 便利的HTTP请求函数
export async function get(url, config = {}) {
    return await httpClient.get(url, config);
}

export async function post(url, data, config = {}) {
    return await httpClient.post(url, data, config);
}

export async function put(url, data, config = {}) {
    return await httpClient.put(url, data, config);
}

export async function del(url, config = {}) {
    return await httpClient.delete(url, config);
}

export async function patch(url, data, config = {}) {
    return await httpClient.patch(url, data, config);
}

export async function request(config) {
    return await httpClient.request(config);
}

export function addRequestInterceptor(interceptor) {
    return httpClient.addRequestInterceptor(interceptor);
}

export function addResponseInterceptor(interceptor) {
    return httpClient.addResponseInterceptor(interceptor);
}

export function setBaseURL(baseURL) {
    return httpClient.setBaseURL(baseURL);
}

export function setTimeout(timeout) {
    return httpClient.setTimeout(timeout);
}

export function setDefaultHeaders(headers) {
    return httpClient.setDefaultHeaders(headers);
}

export function getStats() {
    return httpClient.getStats();
}

export function resetStats() {
    return httpClient.resetStats();
}

export function clearCache() {
    return httpClient.clearCache();
}

export function enableCache(config = {}) {
    return httpClient.enableCache(config);
}

export function disableCache() {
    return httpClient.disableCache();
}

export function enableRateLimit(config = {}) {
    return httpClient.enableRateLimit(config);
}

export function disableRateLimit() {
    return httpClient.disableRateLimit();
}

export function setRetryConfig(config = {}) {
    return httpClient.setRetryConfig(config);
}

// 全局HTTP客户端（兼容性接口）
if (typeof window !== 'undefined') {
    window.httpGet = get;
    window.httpPost = post;
    window.httpPut = put;
    window.httpDelete = del;
    window.httpPatch = patch;
    window.httpRequest = request;
    window.getHttpClientStats = getStats;
}
```

## 使用示例

### 基本使用

```javascript
// 1. 基本HTTP请求
import { get, post, put, del } from './network-communication.js';

// GET请求
const userData = await get('/api/users/123');

// POST请求
const newUser = await post('/api/users', {
    name: '张三',
    email: 'zhangsan@example.com'
});

// PUT请求
const updatedUser = await put('/api/users/123', {
    name: '张三丰',
    email: 'zhangsanfeng@example.com'
});

// DELETE请求
await del('/api/users/123');
```

### 高级使用

```javascript
// 1. 请求配置
import { request } from './network-communication.js';

const response = await request({
    method: 'POST',
    url: '/api/upload',
    data: formData,
    headers: {
        'Content-Type': 'multipart/form-data'
    },
    timeout: 30000
});

// 2. 请求拦截器
import { addRequestInterceptor } from './network-communication.js';

// 添加认证拦截器
addRequestInterceptor((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 3. 响应拦截器
import { addResponseInterceptor } from './network-communication.js';

// 添加响应处理拦截器
addResponseInterceptor((response) => {
    if (response.status === 401) {
        // 处理未授权情况
        window.location.href = '/login';
    }
    return response;
});
```

### 缓存和重试

```javascript
// 1. 启用缓存
import { enableCache, get } from './network-communication.js';

// 启用缓存（5分钟过期）
enableCache({ ttl: 300000 });

// 首次请求会发送网络请求
const data1 = await get('/api/data');

// 后续请求在5分钟内会使用缓存
const data2 = await get('/api/data');

// 2. 配置重试
import { setRetryConfig } from './network-communication.js';

// 设置重试配置
setRetryConfig({
    maxRetries: 5,
    retryDelay: 2000,
    retryOn: [500, 502, 503, 504],
    exponentialBackoff: true
});
```

## 最佳实践

### 网络请求设计原则

1. **统一接口** - 使用统一的网络请求接口
2. **错误处理** - 统一处理网络请求错误
3. **超时控制** - 合理设置请求超时时间
4. **数据验证** - 验证响应数据的有效性

### 性能优化

1. **合理缓存** - 对于不经常变化的数据使用缓存
2. **请求合并** - 合并多个小请求为一个大请求
3. **懒加载** - 只在需要时发送网络请求
4. **预加载** - 提前加载可能需要的数据

### 安全考虑

1. **认证授权** - 正确处理认证和授权
2. **数据加密** - 敏感数据使用HTTPS传输
3. **输入验证** - 验证所有请求参数
4. **错误信息** - 避免泄露敏感信息到错误信息中

### 调试技巧

1. **启用详细日志** - 在开发环境中启用网络请求日志
2. **监控性能** - 监控网络请求的性能指标
3. **错误追踪** - 使用错误追踪工具定位网络问题
4. **缓存调试** - 调试缓存命中和失效情况