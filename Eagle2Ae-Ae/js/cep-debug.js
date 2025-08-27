// CEP环境调试脚本
// 用于诊断After Effects 2023中的Node.js支持情况

class CEPDebugger {
    constructor() {
        this.results = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp,
            message,
            type
        };
        this.results.push(logEntry);
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    }

    // 全面检查CEP环境
    checkCEPEnvironment() {
        this.log('=== CEP环境全面检查 ===', 'info');
        
        // 检查CEP版本信息
        if (typeof CSInterface !== 'undefined') {
            try {
                const csInterface = new CSInterface();
                const hostEnv = csInterface.getHostEnvironment();
                this.log(`CEP版本: ${hostEnv.appVersion}`, 'info');
                this.log(`应用程序: ${hostEnv.appName}`, 'info');
                this.log(`应用程序版本: ${hostEnv.appVersion}`, 'info');
            } catch (error) {
                this.log(`CEP信息获取失败: ${error.message}`, 'error');
            }
        }

        // 检查所有可能的Node.js入口点
        const nodeEntryPoints = [
            'cep_node',
            '__adobe_cep__',
            'cep',
            'require',
            'process',
            'Buffer',
            'global',
            '__dirname',
            '__filename'
        ];

        this.log('\n--- Node.js入口点检查 ---', 'info');
        nodeEntryPoints.forEach(entry => {
            const globalValue = eval(`typeof ${entry}`);
            const windowValue = eval(`typeof window.${entry}`);
            
            this.log(`${entry}:`, 'info');
            this.log(`  - 全局: ${globalValue}`, 'info');
            this.log(`  - window: ${windowValue}`, 'info');
            
            // 如果存在，尝试获取更多信息
            if (globalValue !== 'undefined') {
                try {
                    const obj = eval(entry);
                    if (obj && typeof obj === 'object') {
                        const keys = Object.keys(obj).slice(0, 5); // 只显示前5个键
                        this.log(`  - 属性: [${keys.join(', ')}${keys.length >= 5 ? '...' : ''}]`, 'info');
                    }
                } catch (e) {
                    this.log(`  - 访问失败: ${e.message}`, 'warning');
                }
            }
        });

        // 检查window对象中的所有CEP相关属性
        this.log('\n--- Window对象CEP属性 ---', 'info');
        const windowKeys = Object.keys(window);
        const cepKeys = windowKeys.filter(key => 
            key.toLowerCase().includes('cep') || 
            key.toLowerCase().includes('node') ||
            key.toLowerCase().includes('adobe')
        );
        
        cepKeys.forEach(key => {
            try {
                const value = window[key];
                const type = typeof value;
                this.log(`window.${key}: ${type}`, 'info');
                
                if (type === 'object' && value) {
                    const objKeys = Object.keys(value).slice(0, 3);
                    this.log(`  - 属性: [${objKeys.join(', ')}${objKeys.length >= 3 ? '...' : ''}]`, 'info');
                }
            } catch (e) {
                this.log(`window.${key}: 访问失败`, 'warning');
            }
        });

        return {
            success: cepKeys.length > 0,
            results: this.results
        };
    }

    // 尝试各种Node.js初始化方法
    attemptNodeJSInitialization() {
        this.log('\n=== Node.js初始化尝试 ===', 'info');
        
        const initMethods = [
            {
                name: '__adobe_cep__方法',
                test: () => typeof __adobe_cep__ !== 'undefined' && __adobe_cep__.require,
                init: () => {
                    window.require = __adobe_cep__.require;
                    window.process = __adobe_cep__.process;
                    return window.require('os');
                }
            },
            {
                name: 'cep_node方法',
                test: () => typeof cep_node !== 'undefined' && cep_node.require,
                init: () => {
                    window.require = cep_node.require;
                    window.process = cep_node.process;
                    return window.require('os');
                }
            },
            {
                name: 'cep对象方法',
                test: () => typeof cep !== 'undefined' && cep.process,
                init: () => {
                    // CEP提供的是process对象，不是require函数
                    window.process = cep.process;
                    // 尝试通过cep.fs访问文件系统
                    if (cep.fs) {
                        window.cepfs = cep.fs;
                        this.log('✅ cep.fs可用', 'success');
                    }
                    // 返回一个模拟的os对象
                    return {
                        platform: () => window.process ? window.process.platform : 'unknown',
                        arch: () => window.process ? window.process.arch : 'unknown'
                    };
                }
            },
            {
                name: '全局require方法',
                test: () => typeof require !== 'undefined',
                init: () => {
                    window.require = require;
                    return require('os');
                }
            }
        ];

        let successfulMethod = null;

        for (const method of initMethods) {
            this.log(`\n尝试: ${method.name}`, 'info');
            
            if (method.test()) {
                this.log(`✅ ${method.name}: 入口点可用`, 'success');
                
                try {
                    const os = method.init();
                    if (os) {
                        this.log(`✅ ${method.name}: 初始化成功`, 'success');
                        this.log(`平台: ${os.platform()}`, 'info');
                        this.log(`架构: ${os.arch()}`, 'info');
                        successfulMethod = method.name;
                        break;
                    }
                } catch (error) {
                    this.log(`❌ ${method.name}: 初始化失败 - ${error.message}`, 'error');
                }
            } else {
                this.log(`❌ ${method.name}: 入口点不可用`, 'error');
            }
        }

        if (successfulMethod) {
            this.log(`\n🎉 Node.js初始化成功！使用方法: ${successfulMethod}`, 'success');
            return true;
        } else {
            this.log('\n❌ 所有Node.js初始化方法都失败', 'error');
            return false;
        }
    }

    // 运行完整诊断
    runFullDiagnostics() {
        this.log('开始CEP环境完整诊断...', 'info');
        
        const envCheck = this.checkCEPEnvironment();
        const nodeInit = this.attemptNodeJSInitialization();
        
        this.log('\n=== 诊断结果汇总 ===', 'info');
        this.log(`CEP环境检查: ${envCheck.success ? '✅ 通过' : '❌ 失败'}`, envCheck.success ? 'success' : 'error');
        this.log(`Node.js初始化: ${nodeInit ? '✅ 成功' : '❌ 失败'}`, nodeInit ? 'success' : 'error');
        
        if (!nodeInit) {
            this.log('\n💡 可能的解决方案:', 'info');
            this.log('1. After Effects 2023可能不支持Node.js集成', 'info');
            this.log('2. 需要启用CEP调试模式', 'info');
            this.log('3. 需要更新manifest.xml配置', 'info');
            this.log('4. 可能需要降级到支持Node.js的AE版本', 'info');
        }

        return {
            success: nodeInit,
            logs: this.results
        };
    }
}

// 导出调试器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CEPDebugger;
} else {
    window.CEPDebugger = CEPDebugger;
}
