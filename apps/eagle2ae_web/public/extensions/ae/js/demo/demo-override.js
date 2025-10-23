// Eagle2Ae 演示模式 - 数据覆盖策略
// 允许真实通信，但强制显示演示数据

(function() {
    'use strict';
    
    console.log('🎭 演示模式数据覆盖策略已加载，等待激活...');

    // 不立即激活，等待演示模式真正启用时才激活
    window.__DEMO_MODE_ACTIVE__ = false;
    
    // 获取国际化演示数据
    function getLocalizedDemoData() {
        // 获取当前语言，确保正确检测
        const currentLang = window.i18n?.currentLang || localStorage.getItem('language') || localStorage.getItem('lang') || 'zh-CN';
        console.log('🌐 当前语言:', currentLang);
        const isEn = ((currentLang || '') + '').toLowerCase().includes('en');
        
        // 安全的翻译函数，带回退机制
        const t = (k, fb) => {
            const text = window.i18n?.getText(k);
            if (text) {
                console.log(`🔤 翻译 ${k}: ${text}`);
                return text;
            }
            console.log(`⚠️ 翻译键 ${k} 未找到，使用回退: ${fb}`);
            return fb;
        };
        
        return {
            ae: {
                connected: {
                    version: "2024 (24.0.0)",
                    projectPath: "D:\\Work\\What did you eat today\\Anyway I ate.aep",
                    projectName: t('demo.projectName.connected', isEn ? 'Cooking' : '正在做饭'),
                    activeComp: t('demo.compName.connected', isEn ? 'Jumps Over the Wall' : '佛跳墙')
                },
                disconnected: {
                    version: t('common.waitingForImport', isEn ? 'Waiting for import request...' : '获取中...'),
                    projectPath: t('common.unknown', isEn ? 'Unknown' : '未知'),
                    projectName: t('common.noProjectOpen', isEn ? 'No project open' : '未打开项目'),
                    activeComp: t('common.none', isEn ? 'None' : '无')
                }
            },
            eagle: {
                connected: {
                    version: "4.0.0 build 1 pid 41536",
                    execPath: "C:\\Program Files\\Eagle\\Eagle.exe",
                    libraryPath: "D:\\Hamster.library",
                    libraryName: "Hamster.library",
                    librarySize: 3221225472,
                    selectedFolder: t('demo.folderName.connected', isEn ? 'Hamster Party' : '仓鼠党')
                },
                disconnected: {
                    version: t('common.waitingForImport', isEn ? 'Waiting for import request...' : '获取中...'),
                    execPath: t('common.waitingForImport', isEn ? 'Waiting for import request...' : '获取中...'),
                    libraryPath: t('common.waitingForImport', isEn ? 'Waiting for import request...' : '获取中...'),
                    librarySize: 0,
                    selectedFolder: t('common.waitingForImport', isEn ? 'Waiting for import request...' : '获取中...')
                }
            },
            connection: {
                status: "connected",
                pingTime: 12
            }
        };
    }

    // 设置演示数据（动态获取国际化数据）
    window.__DEMO_DATA__ = getLocalizedDemoData();

    // 更新演示数据的函数
    window.__updateDemoData__ = function() {
        const currentLang = window.i18n?.currentLang || localStorage.getItem('language') || localStorage.getItem('lang') || 'zh-CN';
        console.log('🔄 更新演示数据，当前语言:', currentLang);
        
        // 重新生成本地化的演示数据
        const newDemoData = getLocalizedDemoData();
        window.__DEMO_DATA__ = newDemoData;
        
        console.log('📊 新的演示数据:', newDemoData);
        console.log('🌐 演示数据已更新为当前语言');
        
        // 立即应用新的演示数据
        if (window.__DEMO_MODE_ACTIVE__) {
            console.log('🎭 演示模式激活，应用新的本地化数据');
            window.__setDemoInfo__(true, true);
        }
    };

    // 监听语言切换事件
    function setupLanguageListener() {
        let lastLanguage = window.i18n?.currentLang || localStorage.getItem('language') || localStorage.getItem('lang') || 'zh-CN';
        console.log('🎯 初始语言:', lastLanguage);
        
        // 监听 localStorage 变化（主要的语言切换方式）
        window.addEventListener('storage', function(e) {
            if (e.key === 'language' || e.key === 'lang') {
                console.log('📦 localStorage 语言变化:', e.oldValue, '->', e.newValue);
                setTimeout(() => {
                    window.__updateDemoData__();
                }, 100); // 短暂延迟确保 i18n 已更新
            }
        });
        
        // 监听同窗口内的 localStorage 变化
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            const oldValue = localStorage.getItem(key);
            originalSetItem.call(this, key, value);
            if ((key === 'language' || key === 'lang') && oldValue !== value) {
                console.log('🔄 本窗口语言变化:', oldValue, '->', value);
                setTimeout(() => {
                    window.__updateDemoData__();
                }, 100);
            }
        };
        
        // 监听 i18n 语言切换事件
        if (window.i18n && typeof window.i18n.on === 'function') {
            window.i18n.on('languageChanged', function(newLang) {
                console.log('🌐 i18n 语言变化事件:', newLang);
                setTimeout(() => {
                    window.__updateDemoData__();
                }, 50);
            });
        }
        
        // 备用方案：定期检查语言变化
        setInterval(() => {
            const currentLang = window.i18n?.currentLang || localStorage.getItem('language') || localStorage.getItem('lang') || 'zh-CN';
            if (currentLang !== lastLanguage) {
                console.log('⏰ 轮询检测到语言变化:', lastLanguage, '->', currentLang);
                lastLanguage = currentLang;
                window.__updateDemoData__();
            }
        }, 500); // 减少轮询频率
    }

    // 初始化语言监听器
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupLanguageListener);
    } else {
        setupLanguageListener();
    }
    
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

        // i18n 助手
        const t = (k, fb) => (window.i18n?.getText(k) || fb);
        const normalizePlaceholder = (id, val) => {
            if (val == null) return '';
            const v = String(val);
            switch (id) {
                case 'ae-version':
                    return ['获取中...', 'Waiting for import request...', 'Waiting'].includes(v) ? t('common.waitingForImport', 'Waiting for import request...') : v;
                case 'project-path':
                    return ['未知', 'Unknown', 'undefined', ''].includes(v) ? t('common.unknown', 'Unknown') : v;
                case 'project-name':
                    return ['未打开项目', 'No project open', 'undefined', ''].includes(v) ? t('common.noProjectOpen', 'No project open') : v;
                case 'comp-name':
                    return ['无', 'None', 'undefined', ''].includes(v) ? t('common.none', 'None') : v;
                case 'eagle-version':
                case 'eagle-path':
                case 'eagle-library':
                case 'eagle-folder':
                    return ['获取中...', 'Waiting for import request...', 'Waiting'].includes(v) ? t('common.waitingForImport', 'Waiting for import request...') : v;
                default:
                    return v;
            }
        };

        // 所有元素（根据连接状态选择数据）
        const elements = [
            { id: 'ae-version', value: aeData.version },
            { id: 'project-path', value: aeData.projectPath, title: aeData.projectPath },
            { id: 'project-name', value: aeData.projectName },
            { id: 'comp-name', value: aeData.activeComp },
            { id: 'eagle-version', value: eagleData.version },
            { id: 'eagle-path', value: eagleData.execPath, title: eagleData.execPath },
            { id: 'eagle-library', value: eagleData.libraryPath, title: eagleData.libraryPath },
            { id: 'eagle-folder', value: eagleData.selectedFolder }
        ];

        elements.forEach(({ id, value, title }) => {
            const element = document.getElementById(id);
            const normalizedValue = normalizePlaceholder(id, value);
            if (element && (force || element.textContent !== normalizedValue)) {
                element.textContent = normalizedValue;

                // 正确设置title属性
                if (title && !['获取中...', '未知', 'Unknown', 'undefined'].includes(title)) {
                    // 先清除可能存在的错误title
                    element.removeAttribute('title');
                    // 重新设置正确的title
                    element.setAttribute('title', title);
                    element.title = title;
                }

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
                const t2 = (k, fb) => (window.i18n?.getText(k) || fb);
                statusMain.textContent = t2('common.connectedDemo', 'Connected (Demo)');
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
            // console.log(`🎭 演示数据设置完成，更新了 ${changedCount} 个元素 (连接状态: ${connectionState})`);
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
                        const expectedValueRaw = getExpectedValue(target.id);
                        const expectedValue = normalizePlaceholder(target.id, expectedValueRaw);
                        if (target.textContent !== expectedValue) {
                            console.log(`🎭 检测到 ${target.id} 被修改为: "${target.textContent}", 期望值: "${expectedValue}"`);
                            console.log(`🔍 数据源检查 - aeData:`, aeData);
                            console.log(`🔍 数据源检查 - eagleData:`, eagleData);
                            console.log(`🔍 连接状态:`, connectionState);

                            // 立即恢复演示数据，不等待延迟
                            target.textContent = expectedValue;
                            target.setAttribute('data-demo-mode', 'true');

                            // 如果是路径相关的元素，设置正确的title
                            if (target.id === 'project-path' && aeData.projectPath) {
                                target.removeAttribute('title');
                                target.setAttribute('title', aeData.projectPath);
                                target.title = aeData.projectPath;
                                console.log(`🔧 设置 project-path title: ${aeData.projectPath}`);
                            } else if (target.id === 'eagle-path' && eagleData.execPath) {
                                target.removeAttribute('title');
                                target.setAttribute('title', eagleData.execPath);
                                target.title = eagleData.execPath;
                                console.log(`🔧 设置 eagle-path title: ${eagleData.execPath}`);
                            } else if (target.id === 'eagle-library' && eagleData.libraryPath) {
                                target.removeAttribute('title');
                                target.setAttribute('title', eagleData.libraryPath);
                                target.title = eagleData.libraryPath;
                                console.log(`🔧 设置 eagle-library title: ${eagleData.libraryPath}`);
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

        const t3 = (k, fb) => (window.i18n?.getText(k) || fb);

        const valueMap = {
            'ae-version': aeData.version,
            'project-path': aeData.projectPath,
            'project-name': aeData.projectName,
            'comp-name': aeData.activeComp,
            'eagle-version': eagleData.version,
            'eagle-path': eagleData.execPath,
            'eagle-library': eagleData.libraryName || eagleData.libraryPath,
            'eagle-folder': eagleData.selectedFolder,
            'status-main': t3('common.connectedDemo', 'Connected (Demo)'),
            'ping-time': `${data.connection.pingTime}ms`
        };
        return valueMap[elementId] || '';
    }
    
    // 覆盖关键方法，确保显示演示数据但保持功能
    function overrideKeyMethods() {
        console.log('🎭 覆盖关键方法...');

        // 等待AEExtension加载
        const checkAEExtension = () => {
            console.log('🔍 检查AEExtension是否已加载...', {
                AEExtension: !!window.AEExtension,
                prototype: !!(window.AEExtension && window.AEExtension.prototype),
                executeExtendScript: !!(window.AEExtension && window.AEExtension.prototype && window.AEExtension.prototype.executeExtendScript)
            });
            
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
                        if (window.__DEMO_MODE_ACTIVE__) {
                            console.log('🎭 拦截getAEVersion调用，返回演示数据');
                            // 延迟返回演示数据，模拟真实调用
                            setTimeout(() => {
                                const aeVersionElement = document.getElementById('ae-version');
                                if (aeVersionElement) {
                                    aeVersionElement.textContent = window.__DEMO_DATA__.ae.connected.version;
                                    aeVersionElement.setAttribute('data-demo-mode', 'true');
                                }
                            }, 100);
                            return;
                        }

                        // 非演示模式下正常执行
                        return originalGetAEVersion.call(this);
                    };
                }
                
                // 覆盖executeExtendScript方法，拦截图层检测等JSX调用
                if (proto.executeExtendScript) {
                    const originalExecuteExtendScript = proto.executeExtendScript;
                    proto.executeExtendScript = async function(scriptName, params) {
                        if (window.__DEMO_MODE_ACTIVE__) {
                            console.log(`🎭 拦截executeExtendScript调用: ${scriptName}`);
                            
                            // 拦截ExtendScript连接测试调用
                            if (scriptName === 'testExtendScriptConnection') {
                                console.log('🔗 模拟ExtendScript连接测试...');
                                // 模拟连接测试成功
                                return {
                                    success: true,
                                    message: window.i18n?.getText('logs.extendScriptConnectedReady') || 'ExtendScript connected: AE script environment ready',
                                    aeVersion: window.__DEMO_DATA__.ae.version,
                                    scriptVersion: '演示版本 v1.0.0'
                                };
                            }
                            
                            // 拦截图层检测调用
                            if (scriptName === 'detectSelectedLayers') {
                                console.log('🔍 模拟图层检测调用...');
                                
                                // 获取demo APIs实例
                                const demoAPIs = window.demoMode?.demoAPIs;
                                if (demoAPIs && typeof demoAPIs.detectSelectedLayers === 'function') {
                                    return await demoAPIs.detectSelectedLayers();
                                } else {
                                    // 如果没有demo APIs，返回基本的虚拟数据
                                    return {
                                        success: true,
                                        compName: '佛跳墙',
                                        selectedLayers: [],
                                        totalSelected: 0,
                                        exportableCount: 0,
                                        nonExportableCount: 0,
                                        logs: [`🎭 ${window.i18n?.getText('logs.demoNoLayerSelected') || 'Demo Mode: No layer selected'}`]
                                    };
                                }
                            }
                            
                            // 拦截显示图层检测总结弹窗
                            if (scriptName === 'showLayerDetectionSummary') {
                                console.log('📋 模拟显示图层检测总结弹窗...');
                                // 模拟弹窗显示成功
                                return {
                                    success: true,
                                    userChoice: true,
                                    message: window.i18n?.getText('logs.demoLayerDetectionSummaryShown') || 'Demo Mode: Layer detection summary dialog shown'
                                };
                            }
                            
                            // 其他ExtendScript调用的默认处理
                            console.log(`🎭 模拟ExtendScript调用: ${scriptName}`);
                            return {
                                success: true,
                                message: `${window.i18n?.getText('logs.demoModeResponsePrefix') || 'Demo Mode response'}: ${scriptName}`
                            };
                        }

                        // 非演示模式下正常执行
                        return originalExecuteExtendScript.call(this, scriptName, params);
                    };
                }

                console.log('✅ AEExtension方法覆盖完成');
                console.log('🔍 executeExtendScript方法已覆盖:', !!proto.executeExtendScript);
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
                statusMain.textContent = (window.i18n?.getText('common.disconnectedDemo') || 'Disconnected (Demo)');
                pingTime.textContent = '--ms';
                statusIndicator.className = 'status-indicator disconnected';
                break;
            case 1: // CONNECTING
                statusMain.textContent = (window.i18n?.getText('common.connectingDemo') || 'Connecting (Demo)');
                pingTime.textContent = '--ms';
                statusIndicator.className = 'status-indicator connecting';
                break;
            case 2: // CONNECTED
                statusMain.textContent = (window.i18n?.getText('common.connectedDemo') || 'Connected (Demo)');
                pingTime.textContent = `${window.__DEMO_DATA__.connection.pingTime}ms`;
                statusIndicator.className = 'status-indicator connected';
                break;
            case 3: // ERROR
                statusMain.textContent = (window.i18n?.getText('common.connectionErrorDemo') || 'Connection failed (Demo)');
                pingTime.textContent = '--ms';
                statusIndicator.className = 'status-indicator error';
                break;
            default:
                statusMain.textContent = (window.i18n?.getText('common.connectedDemo') || 'Connected (Demo)');
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
                                    // console.log(`🛡️ 阻止 ${this.id} 被修改为: "${value}", 保持演示数据: "${expectedValue}"`);
                                    originalTextContentDescriptor.set.call(this, expectedValue);
                                    this.setAttribute('data-demo-mode', 'true');
                                    return;
                                }
                            }
                            originalTextContentDescriptor.set.call(this, value);
                        },
                        configurable: true
                    });

                    // console.log(`🛡️ ${elementId} 元素已受保护`);
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

    // 提供激活和停用接口
    window.__DEMO_OVERRIDE__ = {
        activate: function() {
            console.log('🎭 激活演示模式数据覆盖策略...');
            window.__DEMO_MODE_ACTIVE__ = true;
            overrideKeyMethods();
            initializeDemoData();
            protectDemoElements();
            console.log('✅ 演示模式数据覆盖策略已激活');
        },

        deactivate: function() {
            console.log('🔧 停用演示模式数据覆盖策略...');
            window.__DEMO_MODE_ACTIVE__ = false;
            // 这里可以添加恢复原始方法的逻辑
            console.log('✅ 演示模式数据覆盖策略已停用');
        },

        isActive: function() {
            return window.__DEMO_MODE_ACTIVE__;
        }
    };

    console.log('✅ 演示模式数据覆盖策略已准备就绪，等待激活');
})();
