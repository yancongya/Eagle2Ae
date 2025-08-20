// Eagle2Ae 演示模式 - 数据覆盖策略
// 允许真实通信，但强制显示演示数据

(function() {
    'use strict';
    
    console.log('🎭 演示模式数据覆盖策略启动...');
    
    // 创建全局标记
    window.__DEMO_MODE_ACTIVE__ = true;
    
    // 设置演示数据
    window.__DEMO_DATA__ = {
        ae: {
            connected: {
                version: "2024 (24.0.0)",
                projectPath: "/Users/Demo/Projects/演示项目.aep",
                projectName: "Eagle2Ae 演示项目",
                activeComp: "主合成 - 演示场景"
            },
            disconnected: {
                version: "获取中...",
                projectPath: "未知",
                projectName: "未打开项目",
                activeComp: "无"
            }
        },
        eagle: {
            connected: {
                version: "4.0+",
                path: "/Applications/Eagle.app",
                libraryPath: "/Users/Demo/Eagle Library",
                selectedFolder: "AE素材"
            },
            disconnected: {
                version: "获取中...",
                path: "获取中...",
                libraryPath: "获取中...",
                selectedFolder: "获取中..."
            }
        },
        connection: {
            status: "connected",
            pingTime: 12
        }
    };
    
    // 获取当前连接状态
    function getCurrentConnectionState() {
        const statusIndicator = document.getElementById('status-indicator');
        if (!statusIndicator) return 'disconnected';

        if (statusIndicator.classList.contains('connected')) return 'connected';
        if (statusIndicator.classList.contains('connecting')) return 'connecting';
        if (statusIndicator.classList.contains('error')) return 'error';
        return 'disconnected';
    }

    // 强制演示数据设置函数
    window.__setDemoInfo__ = function(force = false, respectConnectionState = true) {
        if (!window.__DEMO_DATA__) return 0;

        const data = window.__DEMO_DATA__;
        let changedCount = 0;

        // 获取当前连接状态来决定显示哪些数据
        const connectionState = getCurrentConnectionState();
        const isConnected = connectionState === 'connected';
        const aeData = isConnected ? data.ae.connected : data.ae.disconnected;
        const eagleData = isConnected ? data.eagle.connected : data.eagle.disconnected;

        // 所有元素（根据连接状态选择数据）
        const elements = [
            { id: 'ae-version', value: aeData.version },
            { id: 'project-path', value: aeData.projectPath, title: aeData.projectPath },
            { id: 'project-name', value: aeData.projectName },
            { id: 'comp-name', value: aeData.activeComp },
            { id: 'eagle-version', value: eagleData.version },
            { id: 'eagle-path', value: eagleData.path, title: eagleData.path },
            { id: 'eagle-library', value: eagleData.libraryPath, title: eagleData.libraryPath },
            { id: 'eagle-folder', value: eagleData.selectedFolder }
        ];

        elements.forEach(({ id, value, title }) => {
            const element = document.getElementById(id);
            if (element && (force || element.textContent !== value)) {
                element.textContent = value;
                if (title && title !== '获取中...' && title !== '未知') element.title = title;
                changedCount++;

                // 标记元素为演示模式
                element.setAttribute('data-demo-mode', 'true');
            }
        });

        // 连接状态相关的元素（根据respectConnectionState参数决定是否设置）
        if (!respectConnectionState) {
            const statusMain = document.getElementById('status-main');
            const pingTime = document.getElementById('ping-time');
            const statusIndicator = document.getElementById('status-indicator');

            if (statusMain && (force || !statusMain.textContent.includes('演示'))) {
                statusMain.textContent = '已连接 (演示)';
                statusMain.setAttribute('data-demo-mode', 'true');
                changedCount++;
            }

            if (pingTime && (force || pingTime.textContent !== `${data.connection.pingTime}ms`)) {
                pingTime.textContent = `${data.connection.pingTime}ms`;
                pingTime.setAttribute('data-demo-mode', 'true');
                changedCount++;
            }

            if (statusIndicator && (force || !statusIndicator.classList.contains('connected'))) {
                statusIndicator.className = 'status-indicator connected';
                statusIndicator.setAttribute('data-demo-mode', 'true');
                changedCount++;
            }
        }

        if (changedCount > 0) {
            console.log(`🎭 演示数据设置完成，更新了 ${changedCount} 个元素 (连接状态: ${connectionState})`);
        }

        return changedCount;
    };
    
    // 持续监控和覆盖
    window.__startDemoMonitoring__ = function() {
        console.log('🎭 启动演示数据持续覆盖...');

        // 添加暂停机制，在连接状态变化时暂停覆盖
        let isPaused = false;
        let pauseTimeout = null;

        window.__pauseDemoOverride__ = function(duration = 2000) {
            isPaused = true;
            if (pauseTimeout) clearTimeout(pauseTimeout);
            pauseTimeout = setTimeout(() => {
                isPaused = false;
                console.log('🎭 演示数据覆盖已恢复');
            }, duration);
            console.log(`🎭 演示数据覆盖已暂停 ${duration}ms`);
        };

        // 使用MutationObserver监控DOM变化，更强的保护机制
        let updateTimeout = null;
        const observer = new MutationObserver((mutations) => {
            if (isPaused) return; // 如果暂停，跳过处理
            let needsUpdate = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const target = mutation.target;

                    // 跳过已标记为演示模式的元素的变化（避免循环更新）
                    if (target.getAttribute && target.getAttribute('data-demo-mode') === 'true') {
                        return;
                    }

                    // 检查是否是我们关心的元素（特别关注Eagle相关元素）
                    if (target.id && [
                        'ae-version', 'project-path', 'project-name', 'comp-name',
                        'eagle-version', 'eagle-path', 'eagle-library', 'eagle-folder'
                    ].includes(target.id)) {

                        // 检查是否不是演示数据
                        const expectedValue = getExpectedValue(target.id);
                        if (target.textContent !== expectedValue) {
                            console.log(`🎭 检测到 ${target.id} 被修改为: "${target.textContent}", 立即恢复演示数据`);

                            // 立即恢复演示数据，不等待延迟
                            target.textContent = expectedValue;
                            target.setAttribute('data-demo-mode', 'true');

                            // 如果是路径相关的元素，也设置title
                            if (['project-path', 'eagle-path', 'eagle-library'].includes(target.id)) {
                                target.title = expectedValue;
                            }

                            needsUpdate = true;
                        }
                    }
                }
            });

            if (needsUpdate) {
                // 清除之前的超时，避免重复更新
                if (updateTimeout) {
                    clearTimeout(updateTimeout);
                }

                // 短延迟后再次确保数据正确
                updateTimeout = setTimeout(() => {
                    window.__setDemoInfo__(true, true); // respectConnectionState = true
                    updateTimeout = null;
                }, 200); // 减少延迟时间，更快响应
            }
        });
        
        // 开始观察整个文档
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        // 定时强制刷新（但保持连接状态），降低频率避免闪烁
        setInterval(() => {
            if (!isPaused) {
                window.__setDemoInfo__(false, true); // force=false, respectConnectionState=true
            }
        }, 10000); // 增加到10秒，进一步减少闪烁
        
        console.log('✅ 演示数据持续覆盖已启动');
    };
    
    // 获取期望的演示值
    function getExpectedValue(elementId) {
        const data = window.__DEMO_DATA__;
        const connectionState = getCurrentConnectionState();
        const isConnected = connectionState === 'connected';
        const aeData = isConnected ? data.ae.connected : data.ae.disconnected;
        const eagleData = isConnected ? data.eagle.connected : data.eagle.disconnected;

        const valueMap = {
            'ae-version': aeData.version,
            'project-path': aeData.projectPath,
            'project-name': aeData.projectName,
            'comp-name': aeData.activeComp,
            'eagle-version': eagleData.version,
            'eagle-path': eagleData.path,
            'eagle-library': eagleData.libraryPath,
            'eagle-folder': eagleData.selectedFolder,
            'status-main': '已连接 (演示)',
            'ping-time': `${data.connection.pingTime}ms`
        };
        return valueMap[elementId] || '';
    }
    
    // 覆盖关键方法，确保显示演示数据但保持功能
    function overrideKeyMethods() {
        console.log('🎭 覆盖关键方法...');

        // 等待AEExtension加载
        const checkAEExtension = () => {
            if (window.AEExtension && window.AEExtension.prototype) {
                const proto = window.AEExtension.prototype;

                // 覆盖updateProjectUI方法
                if (proto.updateProjectUI) {
                    const originalUpdateProjectUI = proto.updateProjectUI;
                    proto.updateProjectUI = function(projectInfo) {
                        console.log('🎭 拦截updateProjectUI，阻止真实数据覆盖');

                        // 在演示模式下完全阻止更新
                        if (window.__DEMO_MODE_ACTIVE__) {
                            console.log('🎭 演示模式激活，阻止项目UI更新');
                            return;
                        }

                        // 非演示模式下正常执行
                        return originalUpdateProjectUI.call(this, projectInfo);
                    };
                }

                // 覆盖updateEagleUI方法 - 这是关键的拦截点
                if (proto.updateEagleUI) {
                    const originalUpdateEagleUI = proto.updateEagleUI;
                    proto.updateEagleUI = function(eagleStatus) {
                        console.log('🎭 拦截updateEagleUI，阻止真实数据覆盖');

                        // 在演示模式下完全阻止更新
                        if (window.__DEMO_MODE_ACTIVE__) {
                            console.log('🎭 演示模式激活，阻止Eagle UI更新');
                            return;
                        }

                        // 非演示模式下正常执行
                        return originalUpdateEagleUI.call(this, eagleStatus);
                    };
                }

                // 覆盖updateEagleStatusFromServer方法
                if (proto.updateEagleStatusFromServer) {
                    const originalUpdateEagleStatusFromServer = proto.updateEagleStatusFromServer;
                    proto.updateEagleStatusFromServer = async function() {
                        console.log('🎭 拦截updateEagleStatusFromServer');

                        // 在演示模式下完全阻止更新
                        if (window.__DEMO_MODE_ACTIVE__) {
                            console.log('🎭 演示模式激活，阻止Eagle状态获取');
                            return;
                        }

                        // 非演示模式下正常执行
                        return await originalUpdateEagleStatusFromServer.call(this);
                    };
                }

                // 覆盖updateConnectionUI方法，但保持连接状态逻辑
                if (proto.updateConnectionUI) {
                    const originalUpdateConnectionUI = proto.updateConnectionUI;
                    proto.updateConnectionUI = function() {
                        console.log('🎭 拦截updateConnectionUI，保持连接逻辑但使用演示数据');

                        // 暂停演示数据覆盖，避免冲突
                        if (window.__pauseDemoOverride__) {
                            window.__pauseDemoOverride__(3000); // 暂停3秒
                        }

                        // 调用原始方法（保持连接状态逻辑）
                        const result = originalUpdateConnectionUI.call(this);

                        // 延迟应用演示数据，确保连接状态更新完成
                        setTimeout(() => {
                            window.__setDemoInfo__(true, true); // 强制更新演示数据
                        }, 3500); // 在暂停结束后应用

                        return result;
                    };
                }

                // 覆盖getAEVersion方法
                if (proto.getAEVersion) {
                    const originalGetAEVersion = proto.getAEVersion;
                    proto.getAEVersion = function() {
                        console.log('🎭 拦截getAEVersion，使用演示数据');

                        // 在演示模式下阻止真实版本获取
                        if (window.__DEMO_MODE_ACTIVE__) {
                            console.log('🎭 演示模式激活，使用演示AE版本');
                            setTimeout(() => {
                                const versionElement = document.getElementById('ae-version');
                                if (versionElement) {
                                    versionElement.textContent = window.__DEMO_DATA__.ae.connected.version;
                                }
                            }, 100);
                            return;
                        }

                        // 非演示模式下正常执行
                        return originalGetAEVersion.call(this);
                    };
                }

                console.log('✅ AEExtension方法覆盖完成');
            } else {
                // 如果AEExtension还没加载，继续等待
                setTimeout(checkAEExtension, 500);
            }
        };

        // 开始检查
        checkAEExtension();
    }

    // 根据真实连接状态更新演示连接状态
    function updateDemoConnectionStatus(connectionState) {
        const statusMain = document.getElementById('status-main');
        const pingTime = document.getElementById('ping-time');
        const statusIndicator = document.getElementById('status-indicator');

        if (!statusMain || !pingTime || !statusIndicator) return;

        // 根据真实连接状态设置演示状态
        switch (connectionState) {
            case 0: // DISCONNECTED
                statusMain.textContent = '未连接 (演示)';
                pingTime.textContent = '--ms';
                statusIndicator.className = 'status-indicator disconnected';
                break;
            case 1: // CONNECTING
                statusMain.textContent = '连接中 (演示)';
                pingTime.textContent = '--ms';
                statusIndicator.className = 'status-indicator connecting';
                break;
            case 2: // CONNECTED
                statusMain.textContent = '已连接 (演示)';
                pingTime.textContent = `${window.__DEMO_DATA__.connection.pingTime}ms`;
                statusIndicator.className = 'status-indicator connected';
                break;
            case 3: // ERROR
                statusMain.textContent = '连接失败 (演示)';
                pingTime.textContent = '--ms';
                statusIndicator.className = 'status-indicator error';
                break;
            default:
                statusMain.textContent = '已连接 (演示)';
                pingTime.textContent = `${window.__DEMO_DATA__.connection.pingTime}ms`;
                statusIndicator.className = 'status-indicator connected';
        }

        // 标记为演示模式
        statusMain.setAttribute('data-demo-mode', 'true');
        pingTime.setAttribute('data-demo-mode', 'true');
        statusIndicator.setAttribute('data-demo-mode', 'true');

        console.log(`🎭 演示连接状态已更新: ${statusMain.textContent}`);

        // 连接状态变化时，也更新Eagle相关数据
        setTimeout(() => {
            window.__setDemoInfo__(true, true); // 强制更新所有数据，但保持连接状态
        }, 100);
    }
    
    // 初始化演示数据设置
    function initializeDemoData() {
        console.log('🎭 初始化演示数据设置...');
        
        const trySetDemoInfo = () => {
            if (window.__setDemoInfo__) {
                // 初始设置时保持连接状态
                const changed = window.__setDemoInfo__(true, true); // force=true, respectConnectionState=true
                if (changed > 0) {
                    console.log('✅ 初始演示数据设置成功');
                } else {
                    console.log('⚠️ 演示数据设置未找到元素，将继续尝试...');
                }
            }
        };
        
        // 多次尝试设置
        let attempts = 0;
        const maxAttempts = 10;
        
        const attemptSet = () => {
            attempts++;
            console.log(`🎭 第${attempts}次尝试设置演示数据`);
            
            trySetDemoInfo();
            
            // 检查是否成功（根据当前连接状态检查）
            const aeVersion = document.getElementById('ae-version');
            const connectionState = getCurrentConnectionState();
            const isConnected = connectionState === 'connected';
            const expectedVersion = isConnected ? window.__DEMO_DATA__.ae.connected.version : window.__DEMO_DATA__.ae.disconnected.version;
            const isSet = aeVersion && aeVersion.textContent === expectedVersion;
            
            if (!isSet && attempts < maxAttempts) {
                setTimeout(attemptSet, 1000);
            } else if (isSet) {
                console.log('✅ 演示数据设置成功');
                // 启动持续监控
                setTimeout(() => {
                    window.__startDemoMonitoring__();
                }, 1000);
            } else {
                console.log('⚠️ 演示数据设置达到最大尝试次数');
                // 仍然启动监控
                setTimeout(() => {
                    window.__startDemoMonitoring__();
                }, 1000);
            }
        };
        
        // 等待DOM准备好
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(attemptSet, 500);
            });
        } else {
            setTimeout(attemptSet, 500);
        }
    }
    
    // 保护关键DOM元素，防止被直接修改
    function protectDemoElements() {
        console.log('🛡️ 启动DOM元素保护...');

        const protectedElements = [
            'eagle-version', 'eagle-path', 'eagle-library', 'eagle-folder',
            'ae-version', 'project-path', 'project-name', 'comp-name'
        ];

        // 等待元素加载
        const setupProtection = () => {
            protectedElements.forEach(elementId => {
                const element = document.getElementById(elementId);
                if (element && window.__DEMO_MODE_ACTIVE__) {
                    // 保存原始的textContent setter
                    const originalTextContentDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');

                    // 创建受保护的setter
                    Object.defineProperty(element, 'textContent', {
                        get: originalTextContentDescriptor.get,
                        set: function(value) {
                            if (window.__DEMO_MODE_ACTIVE__) {
                                const expectedValue = getExpectedValue(this.id);
                                if (value !== expectedValue) {
                                    console.log(`🛡️ 阻止 ${this.id} 被修改为: "${value}", 保持演示数据: "${expectedValue}"`);
                                    originalTextContentDescriptor.set.call(this, expectedValue);
                                    this.setAttribute('data-demo-mode', 'true');
                                    return;
                                }
                            }
                            originalTextContentDescriptor.set.call(this, value);
                        },
                        configurable: true
                    });

                    console.log(`🛡️ ${elementId} 元素已受保护`);
                }
            });
        };

        // 延迟设置保护，确保元素已加载
        setTimeout(setupProtection, 1000);

        // 定期检查并重新设置保护
        setInterval(() => {
            if (window.__DEMO_MODE_ACTIVE__) {
                setupProtection();
            }
        }, 5000);
    }

    // 启动所有功能
    overrideKeyMethods();
    initializeDemoData();
    protectDemoElements();

    console.log('✅ 演示模式数据覆盖策略启动完成');
})();
