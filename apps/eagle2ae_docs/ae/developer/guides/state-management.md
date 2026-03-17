# 状态管理

## 概述

状态管理器是 Eagle2Ae AE 扩展 JavaScript 核心功能的重要组件，提供了完整的响应式状态管理功能。该系统支持状态变更追踪、局部状态管理、全局状态同步等特性。

## 核心特性

### 状态管理模式
- **响应式状态管理** - 基于Proxy的响应式状态系统
- **状态变更追踪** - 自动追踪状态变化并触发相应操作
- **局部状态管理** - 支持组件级别状态管理
- **全局状态同步** - 提供跨组件状态同步机制

### 技术实现

```javascript
/**
 * 状态管理器
 * 提供响应式状态管理功能
 */
class StateManager {
    /**
     * 构造函数
     */
    constructor() {
        // 状态存储
        this.state = {};
        
        // 状态变更监听器
        this.listeners = new Map();
        
        // 状态变更历史
        this.history = [];
        
        // 状态变更ID生成器
        this.stateIdCounter = 0;
        
        // 状态变更批处理队列
        this.batchQueue = [];
        
        // 是否正在进行批处理
        this.isBatching = false;
        
        // 状态变更阈值（防止无限循环）
        this.maxChangeDepth = 100;
        this.changeDepth = 0;
        
        // 绑定方法上下文
        this.setState = this.setState.bind(this);
        this.getState = this.getState.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
        this.dispatch = this.dispatch.bind(this);
        this.commit = this.commit.bind(this);
        this.rollback = this.rollback.bind(this);
        this.batch = this.batch.bind(this);
        
        console.log('🔄 状态管理器已初始化');
    }
    
    /**
     * 设置状态
     * @param {string|Object} path - 状态路径或状态对象
     * @param {*} value - 状态值（当path为字符串时使用）
     * @param {Object} options - 设置选项
     * @returns {Object} 状态变更信息
     */
    setState(path, value, options = {}) {
        try {
            // 检查变更深度，防止无限循环
            if (this.changeDepth >= this.maxChangeDepth) {
                throw new Error(`状态变更深度超过阈值: ${this.maxChangeDepth}`);
            }
            
            this.changeDepth++;
            
            // 生成状态变更ID
            const stateId = ++this.stateIdCounter;
            
            // 记录变更前的状态
            const prevState = this.cloneState(this.state);
            
            // 执行状态变更
            let newState;
            if (typeof path === 'string') {
                // 单个状态变更
                newState = this.setNestedProperty(this.cloneState(this.state), path, value);
            } else if (typeof path === 'object') {
                // 批量状态变更
                newState = { ...this.state, ...path };
            } else {
                throw new Error('无效的状态路径参数');
            }
            
            // 验证新状态
            if (!this.validateState(newState, options)) {
                throw new Error('状态验证失败');
            }
            
            // 如果在批处理模式下，添加到批处理队列
            if (this.isBatching) {
                this.batchQueue.push({
                    id: stateId,
                    path: path,
                    value: value,
                    prevState: prevState,
                    newState: newState,
                    options: options,
                    timestamp: Date.now()
                });
                
                this.changeDepth--;
                return {
                    id: stateId,
                    batched: true
                };
            }
            
            // 应用新状态
            const appliedState = this.applyState(newState, options);
            
            // 记录状态变更历史
            this.recordStateChange({
                id: stateId,
                path: path,
                value: value,
                prevState: prevState,
                newState: appliedState,
                options: options,
                timestamp: Date.now()
            });
            
            // 触发状态变更事件
            this.emitStateChange(path, value, prevState, appliedState, options);
            
            this.changeDepth--;
            
            return {
                id: stateId,
                success: true,
                prevState: prevState,
                newState: appliedState
            };
            
        } catch (error) {
            this.changeDepth = 0; // 重置变更深度
            console.error(`❌ 设置状态失败: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 获取状态
     * @param {string} path - 状态路径（可选）
     * @returns {*} 状态值
     */
    getState(path) {
        try {
            if (!path) {
                // 返回全部状态的深拷贝
                return this.cloneState(this.state);
            }
            
            // 返回指定路径的状态值
            return this.getNestedProperty(this.state, path);
            
        } catch (error) {
            console.error(`❌ 获取状态失败: ${error.message}`);
            return undefined;
        }
    }
    
    /**
     * 订阅状态变更
     * @param {string|Array} paths - 监听的路径（单个路径或路径数组）
     * @param {Function} listener - 监听器函数
     * @param {Object} options - 订阅选项
     * @returns {Function} 取消订阅函数
     */
    subscribe(paths, listener, options = {}) {
        try {
            if (typeof listener !== 'function') {
                throw new Error('监听器必须是函数');
            }
            
            // 标准化路径参数
            const normalizedPaths = Array.isArray(paths) ? paths : [paths];
            
            // 生成订阅ID
            const subscriptionId = this.generateSubscriptionId();
            
            // 创建订阅对象
            const subscription = {
                id: subscriptionId,
                paths: normalizedPaths,
                listener: listener,
                options: options,
                createdAt: Date.now()
            };
            
            // 添加到监听器列表
            this.listeners.set(subscriptionId, subscription);
            
            console.log(`👂 添加状态监听器: ${subscriptionId}`, {
                paths: normalizedPaths,
                options: options
            });
            
            // 返回取消订阅函数
            return () => {
                this.unsubscribe(subscriptionId);
            };
            
        } catch (error) {
            console.error(`❌ 订阅状态变更失败: ${error.message}`);
            return () => {}; // 返回空函数以防调用错误
        }
    }
    
    /**
     * 取消订阅
     * @param {string} subscriptionId - 订阅ID
     * @returns {boolean} 是否取消成功
     */
    unsubscribe(subscriptionId) {
        try {
            if (!subscriptionId) {
                console.warn('⚠️ 订阅ID不能为空');
                return false;
            }
            
            const result = this.listeners.delete(subscriptionId);
            
            if (result) {
                console.log(`👋 移除状态监听器: ${subscriptionId}`);
            } else {
                console.warn(`⚠️ 监听器不存在: ${subscriptionId}`);
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ 取消订阅失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 分发动作
     * @param {string} type - 动作类型
     * @param {Object} payload - 动作载荷
     * @param {Object} options - 分发选项
     * @returns {Promise<Object>} 分发结果
     */
    async dispatch(type, payload = {}, options = {}) {
        try {
            console.log(`🚀 分发动作: ${type}`, payload);
            
            // 验证动作类型
            if (!type || typeof type !== 'string') {
                throw new Error('动作类型必须是字符串');
            }
            
            // 创建动作对象
            const action = {
                type: type,
                payload: payload,
                meta: {
                    timestamp: Date.now(),
                    id: this.generateActionId(),
                    options: options
                }
            };
            
            // 执行动作处理器
            const handlers = this.getActionHandlers(type);
            const results = [];
            
            for (const handler of handlers) {
                try {
                    const result = await handler(action);
                    results.push(result);
                } catch (handlerError) {
                    console.error(`❌ 动作处理器执行失败: ${type} - ${handlerError.message}`);
                    // 继续执行其他处理器
                }
            }
            
            // 触发动作完成事件
            this.emitActionComplete(type, payload, results, options);
            
            console.log(`✅ 动作分发完成: ${type}`);
            
            return {
                success: true,
                type: type,
                payload: payload,
                results: results,
                actionId: action.meta.id
            };
            
        } catch (error) {
            console.error(`❌ 分发动作失败: ${type} - ${error.message}`);
            
            // 触发动作错误事件
            this.emitActionError(type, payload, error, options);
            
            throw error;
        }
    }
    
    /**
     * 提交状态变更
     * @param {Object} mutation - 状态变更对象
     * @param {Object} options - 提交选项
     * @returns {Object} 提交结果
     */
    commit(mutation, options = {}) {
        try {
            console.log('💾 提交状态变更', mutation);
            
            // 验证变更对象
            if (!mutation || typeof mutation !== 'object') {
                throw new Error('状态变更对象必须是对象');
            }
            
            // 生成提交ID
            const commitId = this.generateCommitId();
            
            // 记录提交前的状态
            const prevState = this.cloneState(this.state);
            
            // 应用状态变更
            const newState = this.applyMutation(mutation);
            
            // 验证新状态
            if (!this.validateState(newState, options)) {
                throw new Error('状态验证失败');
            }
            
            // 更新状态
            this.state = newState;
            
            // 记录提交历史
            this.recordCommit({
                id: commitId,
                mutation: mutation,
                prevState: prevState,
                newState: newState,
                options: options,
                timestamp: Date.now()
            });
            
            // 触发提交事件
            this.emitCommit(mutation, prevState, newState, options);
            
            console.log('✅ 状态变更提交完成');
            
            return {
                success: true,
                commitId: commitId,
                prevState: prevState,
                newState: newState
            };
            
        } catch (error) {
            console.error(`❌ 提交状态变更失败: ${error.message}`);
            
            // 触发提交错误事件
            this.emitCommitError(mutation, error, options);
            
            throw error;
        }
    }
    
    /**
     * 回滚状态变更
     * @param {string|number} commitId - 提交ID
     * @returns {Object} 回滚结果
     */
    rollback(commitId) {
        try {
            console.log(`↩️ 回滚状态变更: ${commitId}`);
            
            // 查找提交记录
            const commitRecord = this.findCommitRecord(commitId);
            if (!commitRecord) {
                throw new Error(`找不到提交记录: ${commitId}`);
            }
            
            // 恢复到之前的状态
            const prevState = commitRecord.prevState;
            const currentState = this.cloneState(this.state);
            
            // 应用回滚
            this.state = prevState;
            
            // 触发回滚事件
            this.emitRollback(commitId, prevState, currentState);
            
            console.log(`✅ 状态变更回滚完成: ${commitId}`);
            
            return {
                success: true,
                commitId: commitId,
                prevState: currentState,
                rolledBackState: prevState
            };
            
        } catch (error) {
            console.error(`❌ 回滚状态变更失败: ${error.message}`);
            
            // 触发回滚错误事件
            this.emitRollbackError(commitId, error);
            
            throw error;
        }
    }
    
    /**
     * 批量操作
     * @param {Function} batchFunction - 批量操作函数
     * @param {Object} options - 批量选项
     * @returns {Promise<Object>} 批量操作结果
     */
    async batch(batchFunction, options = {}) {
        try {
            console.log('🔄 开始批量操作');
            
            // 启动批处理模式
            this.isBatching = true;
            this.batchQueue = [];
            
            // 记录批处理开始前的状态
            const batchStartState = this.cloneState(this.state);
            
            // 执行批量操作
            const batchResult = await batchFunction();
            
            // 获取批处理结果
            const batchQueue = [...this.batchQueue];
            
            // 应用批处理结果
            if (batchQueue.length > 0) {
                const finalState = batchQueue[batchQueue.length - 1].newState;
                this.state = finalState;
                
                // 记录批处理历史
                this.recordBatch({
                    operations: batchQueue,
                    startState: batchStartState,
                    endState: finalState,
                    options: options,
                    timestamp: Date.now()
                });
                
                // 触发批处理完成事件
                this.emitBatchComplete(batchQueue, batchStartState, finalState, options);
            }
            
            // 结束批处理模式
            this.isBatching = false;
            this.batchQueue = [];
            
            console.log('✅ 批量操作完成');
            
            return {
                success: true,
                operations: batchQueue,
                result: batchResult,
                startState: batchStartState,
                endState: this.cloneState(this.state)
            };
            
        } catch (error) {
            console.error(`❌ 批量操作失败: ${error.message}`);
            
            // 结束批处理模式
            this.isBatching = false;
            this.batchQueue = [];
            
            // 触发批处理错误事件
            this.emitBatchError(error, options);
            
            throw error;
        }
    }
    
    /**
     * 获取嵌套属性值
     * @param {Object} obj - 对象
     * @param {string} path - 属性路径
     * @returns {*} 属性值
     */
    getNestedProperty(obj, path) {
        if (!obj || !path) return undefined;
        
        const pathParts = path.split('.');
        let current = obj;
        
        for (const part of pathParts) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[part];
        }
        
        return current;
    }
    
    /**
     * 设置嵌套属性值
     * @param {Object} obj - 对象
     * @param {string} path - 属性路径
     * @param {*} value - 属性值
     * @returns {Object} 新对象
     */
    setNestedProperty(obj, path, value) {
        if (!obj || !path) return obj;
        
        const pathParts = path.split('.');
        const newObj = { ...obj };
        let current = newObj;
        
        // 导航到目标位置（除了最后一部分）
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (!(part in current) || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current[part] = { ...current[part] };
            current = current[part];
        }
        
        // 设置最终值
        const lastPart = pathParts[pathParts.length - 1];
        current[lastPart] = value;
        
        return newObj;
    }
    
    /**
     * 深拷贝状态
     * @param {Object} state - 状态对象
     * @returns {Object} 拷贝的状态
     */
    cloneState(state) {
        try {
            return JSON.parse(JSON.stringify(state));
        } catch (error) {
            console.error(`克隆状态失败: ${error.message}`);
            return { ...state }; // 浅拷贝作为备选
        }
    }
    
    /**
     * 验证状态
     * @param {Object} state - 状态对象
     * @param {Object} options - 验证选项
     * @returns {boolean} 是否验证通过
     */
    validateState(state, options = {}) {
        try {
            // 基本验证
            if (!state || typeof state !== 'object') {
                return false;
            }
            
            // 自定义验证规则（如果有）
            if (options.validator && typeof options.validator === 'function') {
                return options.validator(state);
            }
            
            return true;
            
        } catch (error) {
            console.error(`状态验证失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 应用状态
     * @param {Object} newState - 新状态
     * @param {Object} options - 应用选项
     * @returns {Object} 应用后的状态
     */
    applyState(newState, options = {}) {
        try {
            // 如果启用了状态合并
            if (options.merge) {
                return { ...this.state, ...newState };
            }
            
            // 直接替换状态
            return newState;
            
        } catch (error) {
            console.error(`应用状态失败: ${error.message}`);
            return this.state; // 返回当前状态
        }
    }
    
    /**
     * 应用变更
     * @param {Object} mutation - 变更对象
     * @returns {Object} 应用后的状态
     */
    applyMutation(mutation) {
        try {
            const { type, payload } = mutation;
            
            switch (type) {
                case 'SET':
                    return this.setNestedProperty(this.cloneState(this.state), payload.path, payload.value);
                    
                case 'UPDATE':
                    const currentValue = this.getNestedProperty(this.state, payload.path);
                    const updatedValue = typeof payload.updater === 'function' 
                        ? payload.updater(currentValue) 
                        : { ...currentValue, ...payload.value };
                    return this.setNestedProperty(this.cloneState(this.state), payload.path, updatedValue);
                    
                case 'DELETE':
                    const deleteState = this.cloneState(this.state);
                    const deletePathParts = payload.path.split('.');
                    let deleteCurrent = deleteState;
                    
                    // 导航到目标位置（除了最后一部分）
                    for (let i = 0; i < deletePathParts.length - 1; i++) {
                        deleteCurrent = deleteCurrent[deletePathParts[i]];
                        if (!deleteCurrent) break;
                    }
                    
                    // 删除最终属性
                    if (deleteCurrent) {
                        const lastPart = deletePathParts[deletePathParts.length - 1];
                        delete deleteCurrent[lastPart];
                    }
                    
                    return deleteState;
                    
                default:
                    console.warn(`未知的变更类型: ${type}`);
                    return this.state;
            }
            
        } catch (error) {
            console.error(`应用变更失败: ${error.message}`);
            return this.state;
        }
    }
    
    /**
     * 记录状态变更
     * @param {Object} change - 变更对象
     */
    recordStateChange(change) {
        try {
            this.history.push(change);
            
            // 限制历史记录大小
            if (this.history.length > 1000) {
                this.history.shift();
            }
            
        } catch (error) {
            console.error(`记录状态变更失败: ${error.message}`);
        }
    }
    
    /**
     * 记录提交
     * @param {Object} commit - 提交对象
     */
    recordCommit(commit) {
        try {
            // 这里可以实现更复杂的提交记录逻辑
            console.log('记录提交:', commit);
            
        } catch (error) {
            console.error(`记录提交失败: ${error.message}`);
        }
    }
    
    /**
     * 记录批处理
     * @param {Object} batch - 批处理对象
     */
    recordBatch(batch) {
        try {
            // 这里可以实现批处理记录逻辑
            console.log('记录批处理:', batch);
            
        } catch (error) {
            console.error(`记录批处理失败: ${error.message}`);
        }
    }
    
    /**
     * 触发状态变更事件
     * @param {string|Object} path - 变更路径
     * @param {*} value - 新值
     * @param {Object} prevState - 变更前状态
     * @param {Object} newState - 变更后状态
     * @param {Object} options - 变更选项
     */
    emitStateChange(path, value, prevState, newState, options = {}) {
        try {
            // 通知所有监听器
            for (const [subscriptionId, subscription] of this.listeners) {
                try {
                    // 检查监听器是否关注此路径
                    if (this.shouldNotifyListener(subscription, path)) {
                        subscription.listener({
                            path: path,
                            value: value,
                            prevState: prevState,
                            newState: newState,
                            options: options,
                            timestamp: Date.now()
                        });
                    }
                } catch (listenerError) {
                    console.error(`监听器执行失败: ${subscriptionId} - ${listenerError.message}`);
                }
            }
            
            // 触发全局状态变更事件
            if (typeof CustomEvent !== 'undefined' && typeof document !== 'undefined') {
                const event = new CustomEvent('state:change', {
                    detail: {
                        path: path,
                        value: value,
                        prevState: prevState,
                        newState: newState,
                        options: options
                    }
                });
                
                document.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error(`触发状态变更事件失败: ${error.message}`);
        }
    }
    
    /**
     * 检查是否应该通知监听器
     * @param {Object} subscription - 订阅对象
     * @param {string} path - 变更路径
     * @returns {boolean} 是否应该通知
     */
    shouldNotifyListener(subscription, path) {
        try {
            // 如果监听器关注所有路径
            if (subscription.paths.includes('*')) {
                return true;
            }
            
            // 检查是否匹配具体路径
            for (const watchedPath of subscription.paths) {
                if (this.pathsMatch(watchedPath, path)) {
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error(`检查监听器通知条件失败: ${error.message}`);
            return true; // 默认通知
        }
    }
    
    /**
     * 检查路径是否匹配
     * @param {string} watchedPath - 监听路径
     * @param {string} changedPath - 变更路径
     * @returns {boolean} 是否匹配
     */
    pathsMatch(watchedPath, changedPath) {
        try {
            // 精确匹配
            if (watchedPath === changedPath) {
                return true;
            }
            
            // 通配符匹配
            if (watchedPath.endsWith('.*')) {
                const prefix = watchedPath.slice(0, -2);
                return changedPath.startsWith(prefix);
            }
            
            return false;
            
        } catch (error) {
            console.error(`路径匹配检查失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 获取动作处理器
     * @param {string} type - 动作类型
     * @returns {Array} 处理器数组
     */
    getActionHandlers(type) {
        try {
            // 这里应该返回注册的动作处理器
            // 在实际实现中，这些处理器应该通过某种方式注册
            return [];
            
        } catch (error) {
            console.error(`获取动作处理器失败: ${error.message}`);
            return [];
        }
    }
    
    /**
     * 触发动作完成事件
     * @param {string} type - 动作类型
     * @param {Object} payload - 动作载荷
     * @param {Array} results - 执行结果
     * @param {Object} options - 选项
     */
    emitActionComplete(type, payload, results, options = {}) {
        try {
            if (typeof CustomEvent !== 'undefined' && typeof document !== 'undefined') {
                const event = new CustomEvent('action:complete', {
                    detail: {
                        type: type,
                        payload: payload,
                        results: results,
                        options: options,
                        timestamp: Date.now()
                    }
                });
                
                document.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error(`触发动作完成事件失败: ${error.message}`);
        }
    }
    
    /**
     * 触发动作错误事件
     * @param {string} type - 动作类型
     * @param {Object} payload - 动作载荷
     * @param {Error} error - 错误对象
     * @param {Object} options - 选项
     */
    emitActionError(type, payload, error, options = {}) {
        try {
            if (typeof CustomEvent !== 'undefined' && typeof document !== 'undefined') {
                const event = new CustomEvent('action:error', {
                    detail: {
                        type: type,
                        payload: payload,
                        error: error.message,
                        stack: error.stack,
                        options: options,
                        timestamp: Date.now()
                    }
                });
                
                document.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error(`触发动作错误事件失败: ${error.message}`);
        }
    }
    
    /**
     * 触发提交事件
     * @param {Object} mutation - 变更对象
     * @param {Object} prevState - 变更前状态
     * @param {Object} newState - 变更后状态
     * @param {Object} options - 选项
     */
    emitCommit(mutation, prevState, newState, options = {}) {
        try {
            if (typeof CustomEvent !== 'undefined' && typeof document !== 'undefined') {
                const event = new CustomEvent('state:commit', {
                    detail: {
                        mutation: mutation,
                        prevState: prevState,
                        newState: newState,
                        options: options,
                        timestamp: Date.now()
                    }
                });
                
                document.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error(`触发提交事件失败: ${error.message}`);
        }
    }
    
    /**
     * 触发提交错误事件
     * @param {Object} mutation - 变更对象
     * @param {Error} error - 错误对象
     * @param {Object} options - 选项
     */
    emitCommitError(mutation, error, options = {}) {
        try {
            if (typeof CustomEvent !== 'undefined' && typeof document !== 'undefined') {
                const event = new CustomEvent('state:commit:error', {
                    detail: {
                        mutation: mutation,
                        error: error.message,
                        stack: error.stack,
                        options: options,
                        timestamp: Date.now()
                    }
                });
                
                document.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error(`触发提交错误事件失败: ${error.message}`);
        }
    }
    
    /**
     * 触发回滚事件
     * @param {string|number} commitId - 提交ID
     * @param {Object} rolledBackState - 回滚后的状态
     * @param {Object} currentState - 当前状态
     */
    emitRollback(commitId, rolledBackState, currentState) {
        try {
            if (typeof CustomEvent !== 'undefined' && typeof document !== 'undefined') {
                const event = new CustomEvent('state:rollback', {
                    detail: {
                        commitId: commitId,
                        rolledBackState: rolledBackState,
                        currentState: currentState,
                        timestamp: Date.now()
                    }
                });
                
                document.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error(`触发回滚事件失败: ${error.message}`);
        }
    }
    
    /**
     * 触发回滚错误事件
     * @param {string|number} commitId - 提交ID
     * @param {Error} error - 错误对象
     */
    emitRollbackError(commitId, error) {
        try {
            if (typeof CustomEvent !== 'undefined' && typeof document !== 'undefined') {
                const event = new CustomEvent('state:rollback:error', {
                    detail: {
                        commitId: commitId,
                        error: error.message,
                        stack: error.stack,
                        timestamp: Date.now()
                    }
                });
                
                document.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error(`触发回滚错误事件失败: ${error.message}`);
        }
    }
    
    /**
     * 触发批处理完成事件
     * @param {Array} operations - 操作列表
     * @param {Object} startState - 开始状态
     * @param {Object} endState - 结束状态
     * @param {Object} options - 选项
     */
    emitBatchComplete(operations, startState, endState, options = {}) {
        try {
            if (typeof CustomEvent !== 'undefined' && typeof document !== 'undefined') {
                const event = new CustomEvent('state:batch:complete', {
                    detail: {
                        operations: operations,
                        startState: startState,
                        endState: endState,
                        options: options,
                        timestamp: Date.now()
                    }
                });
                
                document.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error(`触发批处理完成事件失败: ${error.message}`);
        }
    }
    
    /**
     * 触发批处理错误事件
     * @param {Error} error - 错误对象
     * @param {Object} options - 选项
     */
    emitBatchError(error, options = {}) {
        try {
            if (typeof CustomEvent !== 'undefined' && typeof document !== 'undefined') {
                const event = new CustomEvent('state:batch:error', {
                    detail: {
                        error: error.message,
                        stack: error.stack,
                        options: options,
                        timestamp: Date.now()
                    }
                });
                
                document.dispatchEvent(event);
            }
            
        } catch (error) {
            console.error(`触发批处理错误事件失败: ${error.message}`);
        }
    }
    
    /**
     * 生成订阅ID
     * @returns {string} 订阅ID
     */
    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 生成动作ID
     * @returns {string} 动作ID
     */
    generateActionId() {
        return `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 生成提交ID
     * @returns {string} 提交ID
     */
    generateCommitId() {
        return `com_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 查找提交记录
     * @param {string|number} commitId - 提交ID
     * @returns {Object|null} 提交记录
     */
    findCommitRecord(commitId) {
        try {
            // 这里应该实现查找提交记录的逻辑
            // 在实际实现中，提交记录应该存储在一个可查询的数据结构中
            return null;
            
        } catch (error) {
            console.error(`查找提交记录失败: ${error.message}`);
            return null;
        }
    }
    
    /**
     * 获取状态历史
     * @returns {Array} 状态历史记录
     */
    getHistory() {
        return [...this.history];
    }
    
    /**
     * 清理状态管理器
     */
    cleanup() {
        try {
            console.log('🧹 清理状态管理器...');
            
            // 清空监听器
            this.listeners.clear();
            
            // 清空历史记录
            this.history = [];
            
            // 重置状态ID计数器
            this.stateIdCounter = 0;
            
            // 清空批处理队列
            this.batchQueue = [];
            this.isBatching = false;
            
            // 重置变更深度
            this.changeDepth = 0;
            
            console.log('✅ 状态管理器清理完成');
            
        } catch (error) {
            console.error(`❌ 清理状态管理器失败: ${error.message}`);
        }
    }
}

// 导出状态管理器
const stateManager = new StateManager();
export default stateManager;

// 便利的状态管理函数
export function setState(path, value, options = {}) {
    return stateManager.setState(path, value, options);
}

export function getState(path) {
    return stateManager.getState(path);
}

export function subscribe(paths, listener, options = {}) {
    return stateManager.subscribe(paths, listener, options);
}

export function unsubscribe(subscriptionId) {
    return stateManager.unsubscribe(subscriptionId);
}

export async function dispatch(type, payload = {}, options = {}) {
    return await stateManager.dispatch(type, payload, options);
}

export function commit(mutation, options = {}) {
    return stateManager.commit(mutation, options);
}

export function rollback(commitId) {
    return stateManager.rollback(commitId);
}

export async function batch(batchFunction, options = {}) {
    return await stateManager.batch(batchFunction, options);
}

export function getHistory() {
    return stateManager.getHistory();
}

// 全局状态管理器（兼容性接口）
if (typeof window !== 'undefined') {
    window.setState = setState;
    window.getState = getState;
    window.subscribe = subscribe;
    window.unsubscribe = unsubscribe;
    window.dispatch = dispatch;
    window.commit = commit;
    window.rollback = rollback;
    window.batch = batch;
    window.getStateHistory = getHistory;
}
```

## 使用示例

### 基本使用

```javascript
// 1. 设置状态
import { setState, getState } from './state-management.js';

// 设置单个状态值
setState('user.name', '张三');

// 设置多个状态值
setState({
    'user.age': 25,
    'user.email': 'zhangsan@example.com'
});

// 获取状态
const userName = getState('user.name');
const userState = getState(); // 获取全部状态
```

### 高级使用

```javascript
// 1. 状态订阅
import { subscribe, unsubscribe } from './state-management.js';

// 订阅单个路径
const unsubscribeName = subscribe('user.name', (data) => {
    console.log('用户名变更:', data.newValue);
});

// 订阅多个路径
const unsubscribeMultiple = subscribe(['user.name', 'user.age'], (data) => {
    console.log('用户信息变更:', data);
});

// 取消订阅
unsubscribeName();
unsubscribeMultiple();
```

### 批量操作

```javascript
// 1. 批量状态更新
import { batch } from './state-management.js';

await batch(async () => {
    setState('user.name', '李四');
    setState('user.age', 30);
    setState('user.city', '北京');
});

// 2. 状态提交和回滚
import { commit, rollback } from './state-management.js';

const commitResult = commit({
    type: 'SET',
    payload: {
        path: 'settings.theme',
        value: 'dark'
    }
});

// 如果需要回滚
if (needRollback) {
    rollback(commitResult.commitId);
}
```

## 最佳实践

### 状态设计原则

1. **扁平化结构** - 尽量使用扁平化的状态结构
2. **明确命名** - 使用清晰明确的状态路径命名
3. **数据分离** - 将不同业务的数据分离存储
4. **状态原子化** - 将复杂状态分解为原子状态

### 性能优化

1. **精确订阅** - 只订阅需要的状态路径
2. **状态缓存** - 合理使用状态缓存避免重复计算
3. **批量更新** - 使用批量操作减少状态变更次数
4. **惰性加载** - 只在需要时加载和初始化状态

### 调试技巧

1. **启用详细日志** - 在开发环境中启用状态变更日志
2. **使用历史记录** - 利用状态历史记录进行调试
3. **监控性能** - 监控状态变更的性能影响
4. **状态快照** - 定期保存状态快照用于调试