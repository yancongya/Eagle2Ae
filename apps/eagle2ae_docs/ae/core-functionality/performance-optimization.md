# 性能优化

## 概述

性能优化是 Eagle2Ae AE 扩展 JavaScript 核心功能的重要组成部分，提供了多种优化技术，包括虚拟滚动、懒加载机制、内存泄漏防护和性能监控等功能。该系统确保应用在各种设备上都能提供流畅的用户体验。

## 核心特性

### 性能优化
- **虚拟滚动** - 大数据列表虚拟化渲染
- **懒加载机制** - 图片和组件的懒加载支持
- **内存泄漏防护** - 自动清理无用引用和事件监听器
- **性能监控** - 实时监控应用性能指标

## 技术实现

### 虚拟滚动

```javascript
/**
 * 虚拟滚动管理器
 * 实现大数据列表的高效渲染
 */
class VirtualScrollManager {
    /**
     * 构造函数
     */
    constructor() {
        // 配置参数
        this.config = {
            itemHeight: 40,        // 每项高度
            bufferSize: 5,         // 缓冲区大小
            containerHeight: 300,  // 容器高度
            throttleDelay: 16      // 节流延迟（ms）
        };
        
        // 状态数据
        this.state = {
            scrollTop: 0,
            containerHeight: 300,
            visibleStart: 0,
            visibleEnd: 0,
            totalItems: 0,
            items: []
        };
        
        // 性能优化
        this.throttleTimer = null;
        this.rafId = null;
        
        // 事件处理
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        console.log('🔄 虚拟滚动管理器已初始化');
    }
    
    /**
     * 初始化虚拟滚动
     * @param {HTMLElement} container - 容器元素
     * @param {Array} items - 数据项数组
     * @param {Object} config - 配置选项
     */
    init(container, items, config = {}) {
        try {
            // 合并配置
            this.config = { ...this.config, ...config };
            
            // 设置数据
            this.state.items = items || [];
            this.state.totalItems = this.state.items.length;
            this.state.containerHeight = this.config.containerHeight;
            
            // 获取容器引用
            this.container = container;
            
            // 计算可见范围
            this.calculateVisibleRange();
            
            // 绑定事件
            this.bindEvents();
            
            // 初始化容器样式
            this.initContainerStyles();
            
            console.log('✅ 虚拟滚动初始化完成');
            
        } catch (error) {
            console.error(`❌ 虚拟滚动初始化失败: ${error.message}`);
        }
    }
    
    /**
     * 初始化容器样式
     */
    initContainerStyles() {
        try {
            if (!this.container) return;
            
            // 设置容器样式
            this.container.style.overflowY = 'auto';
            this.container.style.height = this.config.containerHeight + 'px';
            this.container.style.position = 'relative';
            
            // 创建内容容器
            if (!this.contentContainer) {
                this.contentContainer = document.createElement('div');
                this.contentContainer.style.position = 'relative';
                this.container.appendChild(this.contentContainer);
            }
            
            // 设置内容容器高度
            const totalHeight = this.state.totalItems * this.config.itemHeight;
            this.contentContainer.style.height = totalHeight + 'px';
            
        } catch (error) {
            console.error(`初始化容器样式失败: ${error.message}`);
        }
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        try {
            if (!this.container) return;
            
            // 绑定滚动事件（节流）
            this.container.addEventListener('scroll', this.throttledScrollHandler());
            
            // 绑定窗口大小调整事件
            window.addEventListener('resize', this.handleResize);
            
        } catch (error) {
            console.error(`绑定事件失败: ${error.message}`);
        }
    }
    
    /**
     * 节流滚动处理函数
     * @returns {Function} 节流函数
     */
    throttledScrollHandler() {
        return () => {
            if (this.throttleTimer) {
                clearTimeout(this.throttleTimer);
            }
            
            this.throttleTimer = setTimeout(() => {
                this.handleScroll();
                this.throttleTimer = null;
            }, this.config.throttleDelay);
        };
    }
    
    /**
     * 处理滚动事件
     */
    handleScroll() {
        try {
            if (!this.container) return;
            
            // 使用 requestAnimationFrame 优化渲染
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
            }
            
            this.rafId = requestAnimationFrame(() => {
                this.state.scrollTop = this.container.scrollTop;
                this.calculateVisibleRange();
                this.renderVisibleItems();
                this.rafId = null;
            });
            
        } catch (error) {
            console.error(`处理滚动事件失败: ${error.message}`);
        }
    }
    
    /**
     * 处理窗口大小调整事件
     */
    handleResize() {
        try {
            if (!this.container) return;
            
            // 更新容器高度
            this.config.containerHeight = this.container.clientHeight;
            this.state.containerHeight = this.config.containerHeight;
            
            // 重新计算可见范围
            this.calculateVisibleRange();
            
            // 重新渲染
            this.renderVisibleItems();
            
        } catch (error) {
            console.error(`处理窗口大小调整事件失败: ${error.message}`);
        }
    }
    
    /**
     * 计算可见范围
     */
    calculateVisibleRange() {
        try {
            const { scrollTop, containerHeight } = this.state;
            const { itemHeight, bufferSize } = this.config;
            
            // 计算可见项的起始和结束索引
            const start = Math.floor(scrollTop / itemHeight);
            const visibleCount = Math.ceil(containerHeight / itemHeight);
            const end = start + visibleCount;
            
            // 添加缓冲区
            this.state.visibleStart = Math.max(0, start - bufferSize);
            this.state.visibleEnd = Math.min(this.state.totalItems, end + bufferSize);
            
        } catch (error) {
            console.error(`计算可见范围失败: ${error.message}`);
        }
    }
    
    /**
     * 渲染可见项
     */
    renderVisibleItems() {
        try {
            if (!this.container || !this.contentContainer) return;
            
            const { visibleStart, visibleEnd, items } = this.state;
            const { itemHeight } = this.config;
            
            // 清空现有内容
            this.contentContainer.innerHTML = '';
            
            // 设置内容容器的偏移
            const offsetY = visibleStart * itemHeight;
            this.contentContainer.style.transform = `translateY(${offsetY}px)`;
            
            // 渲染可见项
            for (let i = visibleStart; i < visibleEnd; i++) {
                if (i >= items.length) break;
                
                const itemElement = this.createItemElement(items[i], i);
                this.contentContainer.appendChild(itemElement);
            }
            
        } catch (error) {
            console.error(`渲染可见项失败: ${error.message}`);
        }
    }
    
    /**
     * 创建项元素
     * @param {*} item - 数据项
     * @param {number} index - 索引
     * @returns {HTMLElement} 项元素
     */
    createItemElement(item, index) {
        try {
            const element = document.createElement('div');
            element.style.height = this.config.itemHeight + 'px';
            element.style.display = 'flex';
            element.style.alignItems = 'center';
            element.style.padding = '0 16px';
            element.style.borderBottom = '1px solid #eee';
            element.style.boxSizing = 'border-box';
            
            // 设置内容（这里可以根据实际需求自定义）
            element.textContent = typeof item === 'object' ? JSON.stringify(item) : String(item);
            
            // 添加索引属性
            element.dataset.index = index;
            
            return element;
            
        } catch (error) {
            console.error(`创建项元素失败: ${error.message}`);
            const element = document.createElement('div');
            element.style.height = this.config.itemHeight + 'px';
            return element;
        }
    }
    
    /**
     * 更新数据
     * @param {Array} items - 新数据
     */
    updateItems(items) {
        try {
            this.state.items = items || [];
            this.state.totalItems = this.state.items.length;
            
            // 更新内容容器高度
            if (this.contentContainer) {
                const totalHeight = this.state.totalItems * this.config.itemHeight;
                this.contentContainer.style.height = totalHeight + 'px';
            }
            
            // 重新计算可见范围
            this.calculateVisibleRange();
            
            // 重新渲染
            this.renderVisibleItems();
            
        } catch (error) {
            console.error(`更新数据失败: ${error.message}`);
        }
    }
    
    /**
     * 跳转到指定位置
     * @param {number} index - 索引
     */
    scrollToIndex(index) {
        try {
            if (!this.container) return;
            
            const scrollTop = index * this.config.itemHeight;
            this.container.scrollTop = scrollTop;
            
        } catch (error) {
            console.error(`跳转到指定位置失败: ${error.message}`);
        }
    }
    
    /**
     * 获取可见项
     * @returns {Array} 可见项数组
     */
    getVisibleItems() {
        try {
            const { visibleStart, visibleEnd, items } = this.state;
            return items.slice(visibleStart, visibleEnd);
        } catch (error) {
            console.error(`获取可见项失败: ${error.message}`);
            return [];
        }
    }
    
    /**
     * 获取性能统计
     * @returns {Object} 性能统计信息
     */
    getStats() {
        try {
            const { totalItems, visibleStart, visibleEnd } = this.state;
            const visibleCount = visibleEnd - visibleStart;
            const renderRatio = totalItems > 0 ? (visibleCount / totalItems) : 0;
            
            return {
                totalItems: totalItems,
                visibleItems: visibleCount,
                renderRatio: renderRatio,
                memoryUsage: this.estimateMemoryUsage()
            };
        } catch (error) {
            console.error(`获取性能统计失败: ${error.message}`);
            return {
                totalItems: 0,
                visibleItems: 0,
                renderRatio: 0,
                memoryUsage: 0
            };
        }
    }
    
    /**
     * 估算内存使用
     * @returns {number} 内存使用量（字节）
     */
    estimateMemoryUsage() {
        try {
            const { visibleStart, visibleEnd } = this.state;
            const visibleCount = visibleEnd - visibleStart;
            
            // 估算每个DOM元素大约占用1KB内存
            return visibleCount * 1024;
        } catch (error) {
            console.error(`估算内存使用失败: ${error.message}`);
            return 0;
        }
    }
    
    /**
     * 销毁虚拟滚动
     */
    destroy() {
        try {
            // 清除定时器
            if (this.throttleTimer) {
                clearTimeout(this.throttleTimer);
                this.throttleTimer = null;
            }
            
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            
            // 解绑事件
            if (this.container) {
                this.container.removeEventListener('scroll', this.throttledScrollHandler());
                window.removeEventListener('resize', this.handleResize);
            }
            
            // 清空容器
            if (this.contentContainer) {
                this.contentContainer.innerHTML = '';
            }
            
            console.log('🧹 虚拟滚动已销毁');
            
        } catch (error) {
            console.error(`销毁虚拟滚动失败: ${error.message}`);
        }
    }
}

// 导出虚拟滚动管理器
const virtualScrollManager = new VirtualScrollManager();
export default virtualScrollManager;

// 便利的虚拟滚动函数
export function initVirtualScroll(container, items, config = {}) {
    virtualScrollManager.init(container, items, config);
    return virtualScrollManager;
}

export function updateVirtualScrollItems(items) {
    virtualScrollManager.updateItems(items);
}

export function scrollToVirtualIndex(index) {
    virtualScrollManager.scrollToIndex(index);
}

export function getVisibleVirtualItems() {
    return virtualScrollManager.getVisibleItems();
}

export function getVirtualScrollStats() {
    return virtualScrollManager.getStats();
}

export function destroyVirtualScroll() {
    virtualScrollManager.destroy();
}
```

### 懒加载机制

```javascript
/**
 * 懒加载管理器
 * 实现图片和组件的懒加载
 */
class LazyLoadManager {
    /**
     * 构造函数
     */
    constructor() {
        // 配置参数
        this.config = {
            root: null,           // 根元素
            rootMargin: '50px',   // 根边距
            threshold: 0.1,       // 交叉比例阈值
            preloadRatio: 1.5     // 预加载比例
        };
        
        // 交叉观察器
        this.observer = null;
        
        // 已加载的元素
        this.loadedElements = new Set();
        
        // 性能统计
        this.stats = {
            totalObserved: 0,
            totalLoaded: 0,
            totalErrors: 0
        };
        
        console.log('🐌 懒加载管理器已初始化');
    }
    
    /**
     * 初始化懒加载
     * @param {Object} config - 配置选项
     */
    init(config = {}) {
        try {
            // 合并配置
            this.config = { ...this.config, ...config };
            
            // 检查浏览器支持
            if (!('IntersectionObserver' in window)) {
                console.warn('⚠️ 浏览器不支持 IntersectionObserver，使用降级方案');
                this.initFallback();
                return;
            }
            
            // 创建交叉观察器
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    root: this.config.root,
                    rootMargin: this.config.rootMargin,
                    threshold: this.config.threshold
                }
            );
            
            console.log('✅ 懒加载初始化完成');
            
        } catch (error) {
            console.error(`❌ 懒加载初始化失败: ${error.message}`);
        }
    }
    
    /**
     * 初始化降级方案
     */
    initFallback() {
        try {
            // 使用滚动事件监听的降级方案
            const handleScroll = () => {
                this.loadVisibleElements();
            };
            
            // 节流处理
            let throttleTimer = null;
            const throttledHandler = () => {
                if (throttleTimer) return;
                throttleTimer = setTimeout(() => {
                    handleScroll();
                    throttleTimer = null;
                }, 100);
            };
            
            // 绑定滚动事件
            window.addEventListener('scroll', throttledHandler);
            window.addEventListener('resize', throttledHandler);
            
            // 初始加载
            setTimeout(() => {
                this.loadVisibleElements();
            }, 100);
            
        } catch (error) {
            console.error(`初始化降级方案失败: ${error.message}`);
        }
    }
    
    /**
     * 处理交叉事件
     * @param {Array} entries - 交叉条目
     */
    handleIntersection(entries) {
        try {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadElement(entry.target);
                }
            });
        } catch (error) {
            console.error(`处理交叉事件失败: ${error.message}`);
        }
    }
    
    /**
     * 加载可见元素
     */
    loadVisibleElements() {
        try {
            // 查找所有懒加载元素
            const elements = document.querySelectorAll('[data-lazy-src]:not([data-lazy-loaded])');
            
            elements.forEach(element => {
                if (this.isElementVisible(element)) {
                    this.loadElement(element);
                }
            });
        } catch (error) {
            console.error(`加载可见元素失败: ${error.message}`);
        }
    }
    
    /**
     * 检查元素是否可见
     * @param {HTMLElement} element - 元素
     * @returns {boolean} 是否可见
     */
    isElementVisible(element) {
        try {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            return (
                rect.top >= -rect.height * this.config.preloadRatio &&
                rect.left >= -rect.width * this.config.preloadRatio &&
                rect.bottom <= windowHeight + rect.height * this.config.preloadRatio &&
                rect.right <= windowWidth + rect.width * this.config.preloadRatio
            );
        } catch (error) {
            console.error(`检查元素可见性失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 加载元素
     * @param {HTMLElement} element - 元素
     */
    loadElement(element) {
        try {
            // 检查是否已加载
            if (this.loadedElements.has(element) || element.hasAttribute('data-lazy-loaded')) {
                return;
            }
            
            // 标记为已加载
            this.loadedElements.add(element);
            element.setAttribute('data-lazy-loaded', 'true');
            
            // 获取源地址
            const src = element.getAttribute('data-lazy-src');
            if (!src) {
                console.warn('⚠️ 元素缺少 data-lazy-src 属性');
                return;
            }
            
            // 根据元素类型处理加载
            if (element.tagName === 'IMG') {
                this.loadImage(element, src);
            } else if (element.tagName === 'VIDEO') {
                this.loadVideo(element, src);
            } else {
                this.loadComponent(element, src);
            }
            
            // 更新统计
            this.stats.totalObserved++;
            
        } catch (error) {
            console.error(`加载元素失败: ${error.message}`);
        }
    }
    
    /**
     * 加载图片
     * @param {HTMLImageElement} img - 图片元素
     * @param {string} src - 源地址
     */
    loadImage(img, src) {
        try {
            // 创建临时图片对象
            const tempImg = new Image();
            
            // 加载成功回调
            tempImg.onload = () => {
                try {
                    // 设置实际源地址
                    img.src = src;
                    
                    // 添加加载成功类
                    img.classList.add('lazy-loaded');
                    img.classList.remove('lazy-loading');
                    
                    // 更新统计
                    this.stats.totalLoaded++;
                    
                    console.log(`✅ 图片加载成功: ${src}`);
                } catch (error) {
                    console.error(`图片加载完成处理失败: ${error.message}`);
                }
            };
            
            // 加载失败回调
            tempImg.onerror = (error) => {
                try {
                    // 添加加载失败类
                    img.classList.add('lazy-error');
                    img.classList.remove('lazy-loading');
                    
                    // 更新统计
                    this.stats.totalErrors++;
                    
                    console.error(`❌ 图片加载失败: ${src}`, error);
                } catch (error) {
                    console.error(`图片加载错误处理失败: ${error.message}`);
                }
            };
            
            // 添加加载中类
            img.classList.add('lazy-loading');
            
            // 开始加载
            tempImg.src = src;
            
        } catch (error) {
            console.error(`加载图片失败: ${error.message}`);
        }
    }
    
    /**
     * 加载视频
     * @param {HTMLVideoElement} video - 视频元素
     * @param {string} src - 源地址
     */
    loadVideo(video, src) {
        try {
            // 设置源地址
            const source = document.createElement('source');
            source.src = src;
            video.appendChild(source);
            
            // 加载视频
            video.load();
            
            // 添加加载成功类
            video.classList.add('lazy-loaded');
            
            // 更新统计
            this.stats.totalLoaded++;
            
            console.log(`✅ 视频加载成功: ${src}`);
            
        } catch (error) {
            console.error(`加载视频失败: ${error.message}`);
            
            // 添加加载失败类
            video.classList.add('lazy-error');
            
            // 更新统计
            this.stats.totalErrors++;
        }
    }
    
    /**
     * 加载组件
     * @param {HTMLElement} element - 元素
     * @param {string} src - 源地址
     */
    loadComponent(element, src) {
        try {
            // 使用 fetch 加载组件内容
            fetch(src)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(html => {
                    try {
                        // 设置组件内容
                        element.innerHTML = html;
                        
                        // 添加加载成功类
                        element.classList.add('lazy-loaded');
                        element.classList.remove('lazy-loading');
                        
                        // 更新统计
                        this.stats.totalLoaded++;
                        
                        console.log(`✅ 组件加载成功: ${src}`);
                    } catch (error) {
                        console.error(`组件内容设置失败: ${error.message}`);
                    }
                })
                .catch(error => {
                    try {
                        // 添加加载失败类
                        element.classList.add('lazy-error');
                        element.classList.remove('lazy-loading');
                        
                        // 更新统计
                        this.stats.totalErrors++;
                        
                        console.error(`❌ 组件加载失败: ${src}`, error);
                    } catch (error) {
                        console.error(`组件加载错误处理失败: ${error.message}`);
                    }
                });
            
            // 添加加载中类
            element.classList.add('lazy-loading');
            
        } catch (error) {
            console.error(`加载组件失败: ${error.message}`);
        }
    }
    
    /**
     * 观察元素
     * @param {HTMLElement} element - 元素
     */
    observe(element) {
        try {
            if (this.observer) {
                this.observer.observe(element);
            } else {
                console.warn('⚠️ 交叉观察器未初始化');
            }
        } catch (error) {
            console.error(`观察元素失败: ${error.message}`);
        }
    }
    
    /**
     * 停止观察元素
     * @param {HTMLElement} element - 元素
     */
    unobserve(element) {
        try {
            if (this.observer) {
                this.observer.unobserve(element);
            }
        } catch (error) {
            console.error(`停止观察元素失败: ${error.message}`);
        }
    }
    
    /**
     * 获取性能统计
     * @returns {Object} 性能统计信息
     */
    getStats() {
        return {
            ...this.stats,
            observedElements: this.loadedElements.size
        };
    }
    
    /**
     * 重置统计
     */
    resetStats() {
        this.stats = {
            totalObserved: 0,
            totalLoaded: 0,
            totalErrors: 0
        };
    }
    
    /**
     * 销毁懒加载管理器
     */
    destroy() {
        try {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            
            this.loadedElements.clear();
            this.resetStats();
            
            console.log('🧹 懒加载管理器已销毁');
            
        } catch (error) {
            console.error(`销毁懒加载管理器失败: ${error.message}`);
        }
    }
}

// 导出懒加载管理器
const lazyLoadManager = new LazyLoadManager();
export { lazyLoadManager };

// 便利的懒加载函数
export function initLazyLoad(config = {}) {
    lazyLoadManager.init(config);
    return lazyLoadManager;
}

export function observeLazyElement(element) {
    lazyLoadManager.observe(element);
}

export function unobserveLazyElement(element) {
    lazyLoadManager.unobserve(element);
}

export function getLazyLoadStats() {
    return lazyLoadManager.getStats();
}

export function resetLazyLoadStats() {
    lazyLoadManager.resetStats();
}

export function destroyLazyLoad() {
    lazyLoadManager.destroy();
}
```

### 内存泄漏防护

```javascript
/**
 * 内存泄漏防护管理器
 * 自动清理无用引用和事件监听器
 */
class MemoryLeakProtectionManager {
    /**
     * 构造函数
     */
    constructor() {
        // 配置参数
        this.config = {
            checkInterval: 30000,        // 检查间隔（ms）
            maxEventListeners: 1000,     // 最大事件监听器数量
            maxTimers: 100,              // 最大定时器数量
            enableAutoCleanup: true      // 启用自动清理
        };
        
        // 跟踪的数据
        this.trackedData = {
            eventListeners: new Map(),   // 事件监听器
            timers: new Set(),           // 定时器
            intervals: new Set(),        // 间隔器
            observers: new Set(),        // 观察器
            references: new WeakMap()    // 弱引用
        };
        
        // 检查定时器
        this.checkTimer = null;
        
        // 性能统计
        this.stats = {
            totalCleanups: 0,
            totalLeaksPrevented: 0,
            lastCheckTime: 0
        };
        
        console.log('🛡️ 内存泄漏防护管理器已初始化');
    }
    
    /**
     * 初始化内存泄漏防护
     * @param {Object} config - 配置选项
     */
    init(config = {}) {
        try {
            // 合并配置
            this.config = { ...this.config, ...config };
            
            // 启动定期检查
            if (this.config.enableAutoCleanup) {
                this.startPeriodicCheck();
            }
            
            console.log('✅ 内存泄漏防护初始化完成');
            
        } catch (error) {
            console.error(`❌ 内存泄漏防护初始化失败: ${error.message}`);
        }
    }
    
    /**
     * 启动定期检查
     */
    startPeriodicCheck() {
        try {
            if (this.checkTimer) {
                clearInterval(this.checkTimer);
            }
            
            this.checkTimer = setInterval(() => {
                this.performCheck();
            }, this.config.checkInterval);
            
        } catch (error) {
            console.error(`启动定期检查失败: ${error.message}`);
        }
    }
    
    /**
     * 执行检查
     */
    performCheck() {
        try {
            console.log('🔍 执行内存泄漏检查');
            
            // 检查事件监听器
            this.checkEventListeners();
            
            // 检查定时器
            this.checkTimers();
            
            // 检查观察器
            this.checkObservers();
            
            // 更新统计
            this.stats.lastCheckTime = Date.now();
            
        } catch (error) {
            console.error(`执行检查失败: ${error.message}`);
        }
    }
    
    /**
     * 检查事件监听器
     */
    checkEventListeners() {
        try {
            let cleanedCount = 0;
            
            // 检查每个元素的事件监听器
            for (const [element, listeners] of this.trackedData.eventListeners) {
                // 检查元素是否仍然存在
                if (element && typeof element === 'object') {
                    // 检查元素是否在DOM中
                    if (element instanceof HTMLElement && !document.contains(element)) {
                        // 移除所有事件监听器
                        for (const { type, listener, options } of listeners) {
                            try {
                                element.removeEventListener(type, listener, options);
                                cleanedCount++;
                            } catch (error) {
                                console.error(`移除事件监听器失败: ${error.message}`);
                            }
                        }
                        
                        // 从跟踪列表中移除
                        this.trackedData.eventListeners.delete(element);
                    }
                } else {
                    // 元素已不存在，清理监听器
                    this.trackedData.eventListeners.delete(element);
                }
            }
            
            if (cleanedCount > 0) {
                console.log(`🧹 清理了 ${cleanedCount} 个事件监听器`);
                this.stats.totalLeaksPrevented += cleanedCount;
            }
            
        } catch (error) {
            console.error(`检查事件监听器失败: ${error.message}`);
        }
    }
    
    /**
     * 检查定时器
     */
    checkTimers() {
        try {
            // 注意：JavaScript没有直接的方法检查定时器是否泄漏
            // 这里只是一个示例实现
            console.log('⏰ 定时器检查（模拟）');
            
        } catch (error) {
            console.error(`检查定时器失败: ${error.message}`);
        }
    }
    
    /**
     * 检查观察器
     */
    checkObservers() {
        try {
            let cleanedCount = 0;
            
            // 检查每个观察器
            for (const observer of this.trackedData.observers) {
                // 这里可以添加特定的观察器检查逻辑
                // 例如：检查 ResizeObserver, MutationObserver 等
                if (observer && typeof observer.disconnect === 'function') {
                    // 检查观察器是否应该断开连接
                    // 这里只是一个示例，实际应用中需要根据具体需求判断
                }
            }
            
            if (cleanedCount > 0) {
                console.log(`🧹 清理了 ${cleanedCount} 个观察器`);
                this.stats.totalLeaksPrevented += cleanedCount;
            }
            
        } catch (error) {
            console.error(`检查观察器失败: ${error.message}`);
        }
    }
    
    /**
     * 添加事件监听器跟踪
     * @param {EventTarget} target - 目标对象
     * @param {string} type - 事件类型
     * @param {Function} listener - 监听器函数
     * @param {Object} options - 选项
     */
    trackEventListener(target, type, listener, options = {}) {
        try {
            // 确保存在跟踪列表
            if (!this.trackedData.eventListeners.has(target)) {
                this.trackedData.eventListeners.set(target, []);
            }
            
            // 添加到跟踪列表
            const listeners = this.trackedData.eventListeners.get(target);
            listeners.push({ type, listener, options });
            
            // 检查是否超过最大数量
            if (listeners.length > this.config.maxEventListeners) {
                console.warn(`⚠️ 事件监听器数量超过限制: ${listeners.length}`);
            }
            
        } catch (error) {
            console.error(`添加事件监听器跟踪失败: ${error.message}`);
        }
    }
    
    /**
     * 移除事件监听器跟踪
     * @param {EventTarget} target - 目标对象
     * @param {string} type - 事件类型
     * @param {Function} listener - 监听器函数
     */
    untrackEventListener(target, type, listener) {
        try {
            if (!this.trackedData.eventListeners.has(target)) {
                return;
            }
            
            const listeners = this.trackedData.eventListeners.get(target);
            const index = listeners.findIndex(item => 
                item.type === type && item.listener === listener
            );
            
            if (index !== -1) {
                listeners.splice(index, 1);
                
                // 如果没有监听器了，移除跟踪
                if (listeners.length === 0) {
                    this.trackedData.eventListeners.delete(target);
                }
            }
            
        } catch (error) {
            console.error(`移除事件监听器跟踪失败: ${error.message}`);
        }
    }
    
    /**
     * 跟踪定时器
     * @param {number} timerId - 定时器ID
     * @param {string} type - 定时器类型 ('timeout' | 'interval')
     */
    trackTimer(timerId, type = 'timeout') {
        try {
            if (type === 'timeout') {
                this.trackedData.timers.add(timerId);
            } else if (type === 'interval') {
                this.trackedData.intervals.add(timerId);
            }
            
            // 检查是否超过最大数量
            const totalCount = this.trackedData.timers.size + this.trackedData.intervals.size;
            if (totalCount > this.config.maxTimers) {
                console.warn(`⚠️ 定时器数量超过限制: ${totalCount}`);
            }
            
        } catch (error) {
            console.error(`跟踪定时器失败: ${error.message}`);
        }
    }
    
    /**
     * 清理定时器
     * @param {number} timerId - 定时器ID
     * @param {string} type - 定时器类型 ('timeout' | 'interval')
     */
    cleanupTimer(timerId, type = 'timeout') {
        try {
            if (type === 'timeout') {
                clearTimeout(timerId);
                this.trackedData.timers.delete(timerId);
            } else if (type === 'interval') {
                clearInterval(timerId);
                this.trackedData.intervals.delete(timerId);
            }
            
        } catch (error) {
            console.error(`清理定时器失败: ${error.message}`);
        }
    }
    
    /**
     * 跟踪观察器
     * @param {Object} observer - 观察器对象
     */
    trackObserver(observer) {
        try {
            this.trackedData.observers.add(observer);
        } catch (error) {
            console.error(`跟踪观察器失败: ${error.message}`);
        }
    }
    
    /**
     * 清理观察器
     * @param {Object} observer - 观察器对象
     */
    cleanupObserver(observer) {
        try {
            if (observer && typeof observer.disconnect === 'function') {
                observer.disconnect();
            }
            
            this.trackedData.observers.delete(observer);
        } catch (error) {
            console.error(`清理观察器失败: ${error.message}`);
        }
    }
    
    /**
     * 跟踪引用
     * @param {Object} obj - 对象
     * @param {string} key - 键
     * @param {*} value - 值
     */
    trackReference(obj, key, value) {
        try {
            if (!this.trackedData.references.has(obj)) {
                this.trackedData.references.set(obj, new Map());
            }
            
            const objRefs = this.trackedData.references.get(obj);
            objRefs.set(key, value);
        } catch (error) {
            console.error(`跟踪引用失败: ${error.message}`);
        }
    }
    
    /**
     * 清理引用
     * @param {Object} obj - 对象
     * @param {string} key - 键
     */
    cleanupReference(obj, key) {
        try {
            if (this.trackedData.references.has(obj)) {
                const objRefs = this.trackedData.references.get(obj);
                objRefs.delete(key);
                
                // 如果没有引用了，移除对象
                if (objRefs.size === 0) {
                    this.trackedData.references.delete(obj);
                }
            }
        } catch (error) {
            console.error(`清理引用失败: ${error.message}`);
        }
    }
    
    /**
     * 执行垃圾回收
     */
    performCleanup() {
        try {
            console.log('🧹 执行垃圾回收');
            
            let cleanupCount = 0;
            
            // 清理事件监听器
            for (const [element, listeners] of this.trackedData.eventListeners) {
                for (const { type, listener, options } of listeners) {
                    try {
                        element.removeEventListener(type, listener, options);
                        cleanupCount++;
                    } catch (error) {
                        console.error(`移除事件监听器失败: ${error.message}`);
                    }
                }
            }
            
            // 清理定时器
            for (const timerId of this.trackedData.timers) {
                clearTimeout(timerId);
                cleanupCount++;
            }
            
            for (const intervalId of this.trackedData.intervals) {
                clearInterval(intervalId);
                cleanupCount++;
            }
            
            // 清理观察器
            for (const observer of this.trackedData.observers) {
                if (observer && typeof observer.disconnect === 'function') {
                    observer.disconnect();
                    cleanupCount++;
                }
            }
            
            // 清空所有跟踪数据
            this.trackedData.eventListeners.clear();
            this.trackedData.timers.clear();
            this.trackedData.intervals.clear();
            this.trackedData.observers.clear();
            this.trackedData.references = new WeakMap();
            
            // 更新统计
            this.stats.totalCleanups++;
            this.stats.totalLeaksPrevented += cleanupCount;
            
            console.log(`✅ 垃圾回收完成，清理了 ${cleanupCount} 个项目`);
            
        } catch (error) {
            console.error(`执行垃圾回收失败: ${error.message}`);
        }
    }
    
    /**
     * 获取性能统计
     * @returns {Object} 性能统计信息
     */
    getStats() {
        return {
            ...this.stats,
            trackedEventListeners: this.trackedData.eventListeners.size,
            trackedTimers: this.trackedData.timers.size,
            trackedIntervals: this.trackedData.intervals.size,
            trackedObservers: this.trackedData.observers.size
        };
    }
    
    /**
     * 重置统计
     */
    resetStats() {
        this.stats = {
            totalCleanups: 0,
            totalLeaksPrevented: 0,
            lastCheckTime: 0
        };
    }
    
    /**
     * 销毁内存泄漏防护管理器
     */
    destroy() {
        try {
            // 停止定期检查
            if (this.checkTimer) {
                clearInterval(this.checkTimer);
                this.checkTimer = null;
            }
            
            // 执行最终清理
            this.performCleanup();
            
            console.log('🛡️ 内存泄漏防护管理器已销毁');
            
        } catch (error) {
            console.error(`销毁内存泄漏防护管理器失败: ${error.message}`);
        }
    }
}

// 导出内存泄漏防护管理器
const memoryLeakProtectionManager = new MemoryLeakProtectionManager();
export { memoryLeakProtectionManager };

// 便利的内存泄漏防护函数
export function initMemoryLeakProtection(config = {}) {
    memoryLeakProtectionManager.init(config);
    return memoryLeakProtectionManager;
}

export function trackEventListener(target, type, listener, options = {}) {
    memoryLeakProtectionManager.trackEventListener(target, type, listener, options);
}

export function untrackEventListener(target, type, listener) {
    memoryLeakProtectionManager.untrackEventListener(target, type, listener);
}

export function trackTimer(timerId, type = 'timeout') {
    memoryLeakProtectionManager.trackTimer(timerId, type);
}

export function cleanupTimer(timerId, type = 'timeout') {
    memoryLeakProtectionManager.cleanupTimer(timerId, type);
}

export function trackObserver(observer) {
    memoryLeakProtectionManager.trackObserver(observer);
}

export function cleanupObserver(observer) {
    memoryLeakProtectionManager.cleanupObserver(observer);
}

export function performMemoryCleanup() {
    memoryLeakProtectionManager.performCleanup();
}

export function getMemoryLeakStats() {
    return memoryLeakProtectionManager.getStats();
}

export function resetMemoryLeakStats() {
    memoryLeakProtectionManager.resetStats();
}

export function destroyMemoryLeakProtection() {
    memoryLeakProtectionManager.destroy();
}
```

### 性能监控

```javascript
/**
 * 性能监控管理器
 * 实时监控应用性能指标
 */
class PerformanceMonitor {
    /**
     * 构造函数
     */
    constructor() {
        // 配置参数
        this.config = {
            sampleInterval: 1000,        // 采样间隔（ms）
            maxSamples: 300,             // 最大样本数
            enableLogging: true,         // 启用日志
            logThreshold: 16             // 日志阈值（ms）
        };
        
        // 性能数据
        this.data = {
            fps: [],                     // 帧率数据
            memory: [],                  // 内存使用数据
            cpu: [],                     // CPU使用数据
            network: [],                 // 网络性能数据
            custom: new Map()            // 自定义性能数据
        };
        
        // 监控状态
        this.state = {
            isMonitoring: false,
            startTime: 0,
            frameCount: 0,
            lastFrameTime: 0
        };
        
        // 监控定时器
        this.monitorTimer = null;
        this.rafId = null;
        
        // 性能观察器
        this.performanceObserver = null;
        
        console.log('📊 性能监控管理器已初始化');
    }
    
    /**
     * 初始化性能监控
     * @param {Object} config - 配置选项
     */
    init(config = {}) {
        try {
            // 合并配置
            this.config = { ...this.config, ...config };
            
            console.log('✅ 性能监控初始化完成');
            
        } catch (error) {
            console.error(`❌ 性能监控初始化失败: ${error.message}`);
        }
    }
    
    /**
     * 开始监控
     */
    start() {
        try {
            if (this.state.isMonitoring) {
                console.warn('⚠️ 性能监控已在运行');
                return;
            }
            
            this.state.isMonitoring = true;
            this.state.startTime = performance.now();
            this.state.frameCount = 0;
            this.state.lastFrameTime = performance.now();
            
            // 启动帧率监控
            this.startFPSCollection();
            
            // 启动内存监控
            this.startMemoryCollection();
            
            // 启动网络监控
            this.startNetworkCollection();
            
            console.log('✅ 性能监控已启动');
            
        } catch (error) {
            console.error(`❌ 启动性能监控失败: ${error.message}`);
        }
    }
    
    /**
     * 停止监控
     */
    stop() {
        try {
            if (!this.state.isMonitoring) {
                console.warn('⚠️ 性能监控未运行');
                return;
            }
            
            this.state.isMonitoring = false;
            
            // 停止定时器
            if (this.monitorTimer) {
                clearInterval(this.monitorTimer);
                this.monitorTimer = null;
            }
            
            if (this.rafId) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            
            // 断开性能观察器
            if (this.performanceObserver) {
                this.performanceObserver.disconnect();
                this.performanceObserver = null;
            }
            
            console.log('⏹️ 性能监控已停止');
            
        } catch (error) {
            console.error(`停止性能监控失败: ${error.message}`);
        }
    }
    
    /**
     * 启动帧率收集
     */
    startFPSCollection() {
        try {
            const collectFPS = () => {
                if (!this.state.isMonitoring) return;
                
                const now = performance.now();
                const delta = now - this.state.lastFrameTime;
                const fps = Math.round(1000 / delta);
                
                // 记录FPS数据
                this.recordFPS(fps, now);
                
                // 检查是否需要记录日志
                if (this.config.enableLogging && delta > this.config.logThreshold) {
                    console.warn(`⚠️ 帧率下降: ${fps} FPS (耗时: ${delta.toFixed(2)}ms)`);
                }
                
                this.state.lastFrameTime = now;
                this.state.frameCount++;
                
                // 继续下一帧
                this.rafId = requestAnimationFrame(collectFPS);
            };
            
            // 启动帧率收集
            this.rafId = requestAnimationFrame(collectFPS);
            
        } catch (error) {
            console.error(`启动帧率收集失败: ${error.message}`);
        }
    }
    
    /**
     * 启动内存收集
     */
    startMemoryCollection() {
        try {
            // 检查浏览器支持
            if (!('memory' in performance)) {
                console.warn('⚠️ 浏览器不支持内存监控');
                return;
            }
            
            this.monitorTimer = setInterval(() => {
                if (!this.state.isMonitoring) return;
                
                try {
                    // 获取内存信息
                    const memoryInfo = performance.memory || {
                        usedJSHeapSize: 0,
                        totalJSHeapSize: 0,
                        jsHeapSizeLimit: 0
                    };
                    
                    // 记录内存数据
                    this.recordMemory({
                        used: memoryInfo.usedJSHeapSize,
                        total: memoryInfo.totalJSHeapSize,
                        limit: memoryInfo.jsHeapSizeLimit,
                        timestamp: performance.now()
                    });
                } catch (error) {
                    console.error(`收集内存信息失败: ${error.message}`);
                }
            }, this.config.sampleInterval);
            
        } catch (error) {
            console.error(`启动内存收集失败: ${error.message}`);
        }
    }
    
    /**
     * 启动网络收集
     */
    startNetworkCollection() {
        try {
            // 检查浏览器支持
            if (!('PerformanceObserver' in window)) {
                console.warn('⚠️ 浏览器不支持 PerformanceObserver');
                return;
            }
            
            // 创建性能观察器
            this.performanceObserver = new PerformanceObserver((list) => {
                try {
                    list.getEntries().forEach(entry => {
                        if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
                            this.recordNetworkEntry(entry);
                        }
                    });
                } catch (error) {
                    console.error(`处理性能条目失败: ${error.message}`);
                }
            });
            
            // 开始观察
            this.performanceObserver.observe({
                entryTypes: ['navigation', 'resource']
            });
            
        } catch (error) {
            console.error(`启动网络收集失败: ${error.message}`);
        }
    }
    
    /**
     * 记录FPS数据
     * @param {number} fps - 帧率
     * @param {number} timestamp - 时间戳
     */
    recordFPS(fps, timestamp) {
        try {
            this.data.fps.push({
                value: fps,
                timestamp: timestamp
            });
            
            // 限制数据长度
            if (this.data.fps.length > this.config.maxSamples) {
                this.data.fps.shift();
            }
        } catch (error) {
            console.error(`记录FPS数据失败: ${error.message}`);
        }
    }
    
    /**
     * 记录内存数据
     * @param {Object} memoryData - 内存数据
     */
    recordMemory(memoryData) {
        try {
            this.data.memory.push(memoryData);
            
            // 限制数据长度
            if (this.data.memory.length > this.config.maxSamples) {
                this.data.memory.shift();
            }
        } catch (error) {
            console.error(`记录内存数据失败: ${error.message}`);
        }
    }
    
    /**
     * 记录网络条目
     * @param {PerformanceEntry} entry - 性能条目
     */
    recordNetworkEntry(entry) {
        try {
            this.data.network.push({
                name: entry.name,
                entryType: entry.entryType,
                startTime: entry.startTime,
                duration: entry.duration,
                transferSize: entry.transferSize || 0,
                encodedBodySize: entry.encodedBodySize || 0,
                decodedBodySize: entry.decodedBodySize || 0
            });
            
            // 限制数据长度
            if (this.data.network.length > this.config.maxSamples) {
                this.data.network.shift();
            }
        } catch (error) {
            console.error(`记录网络条目失败: ${error.message}`);
        }
    }
    
    /**
     * 记录自定义性能数据
     * @param {string} name - 数据名称
     * @param {*} value - 数据值
     * @param {Object} metadata - 元数据
     */
    recordCustom(name, value, metadata = {}) {
        try {
            if (!this.data.custom.has(name)) {
                this.data.custom.set(name, []);
            }
            
            const customData = this.data.custom.get(name);
            customData.push({
                value: value,
                metadata: metadata,
                timestamp: performance.now()
            });
            
            // 限制数据长度
            if (customData.length > this.config.maxSamples) {
                customData.shift();
            }
        } catch (error) {
            console.error(`记录自定义性能数据失败: ${error.message}`);
        }
    }
    
    /**
     * 获取FPS统计
     * @returns {Object} FPS统计信息
     */
    getFPSStats() {
        try {
            if (this.data.fps.length === 0) {
                return {
                    current: 0,
                    average: 0,
                    min: 0,
                    max: 0,
                    samples: 0
                };
            }
            
            const fpsValues = this.data.fps.map(item => item.value);
            const current = fpsValues[fpsValues.length - 1];
            const average = fpsValues.reduce((sum, val) => sum + val, 0) / fpsValues.length;
            const min = Math.min(...fpsValues);
            const max = Math.max(...fpsValues);
            
            return {
                current: current,
                average: Math.round(average),
                min: min,
                max: max,
                samples: fpsValues.length
            };
        } catch (error) {
            console.error(`获取FPS统计失败: ${error.message}`);
            return {
                current: 0,
                average: 0,
                min: 0,
                max: 0,
                samples: 0
            };
        }
    }
    
    /**
     * 获取内存统计
     * @returns {Object} 内存统计信息
     */
    getMemoryStats() {
        try {
            if (this.data.memory.length === 0) {
                return {
                    current: { used: 0, total: 0, limit: 0 },
                    average: { used: 0, total: 0, limit: 0 },
                    samples: 0
                };
            }
            
            const lastMemory = this.data.memory[this.data.memory.length - 1];
            const current = {
                used: Math.round(lastMemory.used / 1024 / 1024), // MB
                total: Math.round(lastMemory.total / 1024 / 1024), // MB
                limit: Math.round(lastMemory.limit / 1024 / 1024)  // MB
            };
            
            // 计算平均值
            const sum = this.data.memory.reduce((acc, item) => {
                acc.used += item.used;
                acc.total += item.total;
                acc.limit += item.limit;
                return acc;
            }, { used: 0, total: 0, limit: 0 });
            
            const average = {
                used: Math.round(sum.used / this.data.memory.length / 1024 / 1024), // MB
                total: Math.round(sum.total / this.data.memory.length / 1024 / 1024), // MB
                limit: Math.round(sum.limit / this.data.memory.length / 1024 / 1024)  // MB
            };
            
            return {
                current: current,
                average: average,
                samples: this.data.memory.length
            };
        } catch (error) {
            console.error(`获取内存统计失败: ${error.message}`);
            return {
                current: { used: 0, total: 0, limit: 0 },
                average: { used: 0, total: 0, limit: 0 },
                samples: 0
            };
        }
    }
    
    /**
     * 获取网络统计
     * @returns {Object} 网络统计信息
     */
    getNetworkStats() {
        try {
            if (this.data.network.length === 0) {
                return {
                    totalRequests: 0,
                    totalTransferSize: 0,
                    averageDuration: 0,
                    slowestRequest: null
                };
            }
            
            const totalRequests = this.data.network.length;
            const totalTransferSize = this.data.network.reduce((sum, item) => sum + item.transferSize, 0);
            const averageDuration = this.data.network.reduce((sum, item) => sum + item.duration, 0) / totalRequests;
            
            // 找到最慢的请求
            const slowestRequest = this.data.network.reduce((slowest, item) => {
                return item.duration > (slowest ? slowest.duration : 0) ? item : slowest;
            }, null);
            
            return {
                totalRequests: totalRequests,
                totalTransferSize: Math.round(totalTransferSize / 1024), // KB
                averageDuration: Math.round(averageDuration), // ms
                slowestRequest: slowestRequest
            };
        } catch (error) {
            console.error(`获取网络统计失败: ${error.message}`);
            return {
                totalRequests: 0,
                totalTransferSize: 0,
                averageDuration: 0,
                slowestRequest: null
            };
        }
    }
    
    /**
     * 获取自定义统计
     * @param {string} name - 数据名称
     * @returns {Object} 自定义统计信息
     */
    getCustomStats(name) {
        try {
            if (!this.data.custom.has(name)) {
                return {
                    values: [],
                    average: 0,
                    min: 0,
                    max: 0,
                    samples: 0
                };
            }
            
            const values = this.data.custom.get(name).map(item => item.value);
            if (values.length === 0) {
                return {
                    values: [],
                    average: 0,
                    min: 0,
                    max: 0,
                    samples: 0
                };
            }
            
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            
            return {
                values: values,
                average: average,
                min: min,
                max: max,
                samples: values.length
            };
        } catch (error) {
            console.error(`获取自定义统计失败: ${error.message}`);
            return {
                values: [],
                average: 0,
                min: 0,
                max: 0,
                samples: 0
            };
        }
    }
    
    /**
     * 获取所有统计信息
     * @returns {Object} 所有统计信息
     */
    getAllStats() {
        return {
            fps: this.getFPSStats(),
            memory: this.getMemoryStats(),
            network: this.getNetworkStats(),
            custom: Array.from(this.data.custom.keys()).reduce((acc, name) => {
                acc[name] = this.getCustomStats(name);
                return acc;
            }, {}),
            monitoring: this.state.isMonitoring,
            uptime: this.state.isMonitoring ? 
                Math.round((performance.now() - this.state.startTime) / 1000) : 0 // 秒
        };
    }
    
    /**
     * 重置数据
     */
    reset() {
        try {
            this.data.fps = [];
            this.data.memory = [];
            this.data.cpu = [];
            this.data.network = [];
            this.data.custom.clear();
            
            this.state.frameCount = 0;
            this.state.lastFrameTime = 0;
            
            console.log('📊 性能数据已重置');
        } catch (error) {
            console.error(`重置性能数据失败: ${error.message}`);
        }
    }
    
    /**
     * 导出数据
     * @returns {Object} 性能数据
     */
    exportData() {
        try {
            return {
                ...this.data,
                stats: this.getAllStats(),
                config: this.config,
                state: this.state
            };
        } catch (error) {
            console.error(`导出性能数据失败: ${error.message}`);
            return {};
        }
    }
    
    /**
     * 销毁性能监控管理器
     */
    destroy() {
        try {
            // 停止监控
            this.stop();
            
            // 重置数据
            this.reset();
            
            console.log('📊 性能监控管理器已销毁');
        } catch (error) {
            console.error(`销毁性能监控管理器失败: ${error.message}`);
        }
    }
}

// 导出性能监控管理器
const performanceMonitor = new PerformanceMonitor();
export { performanceMonitor };

// 便利的性能监控函数
export function initPerformanceMonitor(config = {}) {
    performanceMonitor.init(config);
    return performanceMonitor;
}

export function startPerformanceMonitor() {
    performanceMonitor.start();
}

export function stopPerformanceMonitor() {
    performanceMonitor.stop();
}

export function recordCustomPerformance(name, value, metadata = {}) {
    performanceMonitor.recordCustom(name, value, metadata);
}

export function getPerformanceStats() {
    return performanceMonitor.getAllStats();
}

export function getFPSStats() {
    return performanceMonitor.getFPSStats();
}

export function getMemoryStats() {
    return performanceMonitor.getMemoryStats();
}

export function getNetworkStats() {
    return performanceMonitor.getNetworkStats();
}

export function resetPerformanceData() {
    performanceMonitor.reset();
}

export function exportPerformanceData() {
    return performanceMonitor.exportData();
}

export function destroyPerformanceMonitor() {
    performanceMonitor.destroy();
}
```

## 使用示例

### 虚拟滚动使用

```javascript
// 1. 基本虚拟滚动
import { initVirtualScroll } from './performance-optimization.js';

// 准备大量数据
const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

// 初始化虚拟滚动
const container = document.getElementById('virtual-list');
initVirtualScroll(container, items, {
    itemHeight: 50,
    containerHeight: 400
});
```

### 懒加载使用

```javascript
// 1. 图片懒加载
import { initLazyLoad, observeLazyElement } from './performance-optimization.js';

// 初始化懒加载
initLazyLoad({
    rootMargin: '100px',
    threshold: 0.1
});

// 观察图片元素
const images = document.querySelectorAll('img[data-lazy-src]');
images.forEach(img => {
    observeLazyElement(img);
});
```

### 内存泄漏防护使用

```javascript
// 1. 事件监听器防护
import { trackEventListener, untrackEventListener } from './performance-optimization.js';

// 添加受保护的事件监听器
const button = document.getElementById('my-button');
const handleClick = () => {
    console.log('按钮被点击');
};

// 跟踪事件监听器
button.addEventListener('click', handleClick);
trackEventListener(button, 'click', handleClick);

// 在适当时候移除监听器
// untrackEventListener(button, 'click', handleClick);
// button.removeEventListener('click', handleClick);
```

### 性能监控使用

```javascript
// 1. 性能监控
import { 
    initPerformanceMonitor, 
    startPerformanceMonitor, 
    getPerformanceStats,
    recordCustomPerformance
} from './performance-optimization.js';

// 初始化并启动性能监控
initPerformanceMonitor();
startPerformanceMonitor();

// 记录自定义性能指标
recordCustomPerformance('api-response-time', 120, {
    endpoint: '/api/users',
    method: 'GET'
});

// 获取性能统计
const stats = getPerformanceStats();
console.log('性能统计:', stats);
```

## 最佳实践

### 性能优化原则

1. **按需加载** - 只加载当前需要的资源
2. **缓存策略** - 合理使用缓存减少重复计算
3. **内存管理** - 及时释放不需要的资源
4. **异步处理** - 耗时操作使用异步避免阻塞

### 监控和调试

1. **性能基准** - 建立性能基准用于对比
2. **实时监控** - 实时监控关键性能指标
3. **错误追踪** - 追踪性能相关错误
4. **数据可视化** - 使用图表展示性能数据

### 优化技巧

1. **减少DOM操作** - 批量DOM操作减少重排重绘
2. **事件委托** - 使用事件委托减少监听器数量
3. **防抖节流** - 对高频事件使用防抖节流
4. **资源预加载** - 预加载可能需要的资源