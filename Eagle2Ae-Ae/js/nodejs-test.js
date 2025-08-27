// Node.js 测试脚本
// 用于验证Node.js环境和基本功能

class NodeJSTest {
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

    // 测试Node.js环境
    testEnvironment() {
        this.log('开始测试Node.js环境...', 'info');

        try {
            // 检查新版CEP的Node.js访问方式
            if (typeof __adobe_cep__ !== 'undefined' && __adobe_cep__.require) {
                this.log('✅ __adobe_cep__对象可用 (新版CEP)', 'success');
                if (__adobe_cep__.process) {
                    this.log(`✅ Node.js版本: ${__adobe_cep__.process.version}`, 'success');
                    this.log(`✅ 平台: ${__adobe_cep__.process.platform}`, 'success');
                    this.log(`✅ 架构: ${__adobe_cep__.process.arch}`, 'success');
                }
                return true;
            }

            // 检查传统的cep_node对象
            if (typeof cep_node !== 'undefined') {
                this.log('✅ cep_node对象可用', 'success');
                if (cep_node.require) {
                    this.log('✅ cep_node.require可用', 'success');
                }
                if (cep_node.process) {
                    this.log(`✅ Node.js版本: ${cep_node.process.version}`, 'success');
                    this.log(`✅ 平台: ${cep_node.process.platform}`, 'success');
                    this.log(`✅ 架构: ${cep_node.process.arch}`, 'success');
                }
                return true;
            }

            // 检查CEP对象
            if (typeof cep !== 'undefined' && cep.require) {
                this.log('✅ cep对象的require可用', 'success');
                return true;
            }

            // 检查window上的Node.js对象
            if (typeof window !== 'undefined' && window.process) {
                this.log(`✅ Node.js版本: ${window.process.version}`, 'success');
                this.log(`✅ 平台: ${window.process.platform}`, 'success');
                this.log(`✅ 架构: ${window.process.arch}`, 'success');
                return true;
            }

            // 检查全局require
            if (typeof require !== 'undefined') {
                this.log('✅ 全局require可用', 'success');
                return true;
            }

            this.log('❌ Node.js环境不可用', 'error');
            this.log('🔍 详细诊断信息:', 'info');
            this.log(`- __adobe_cep__: ${typeof __adobe_cep__}`, 'info');
            this.log(`- cep_node: ${typeof cep_node}`, 'info');
            this.log(`- cep: ${typeof cep}`, 'info');
            this.log(`- window.require: ${typeof window.require}`, 'info');
            this.log(`- global require: ${typeof require}`, 'info');
            this.log(`- window.process: ${typeof window.process}`, 'info');

            return false;
        } catch (error) {
            this.log(`❌ 环境测试失败: ${error.message}`, 'error');
            return false;
        }
    }

    // 测试核心模块
    testCoreModules() {
        this.log('测试核心模块...', 'info');

        const modules = ['fs', 'path', 'os', 'util'];
        let success = true;

        // 确定使用哪个require函数 (基于CEP官方文档)
        let requireFunc = null;
        let usesCEPAPI = false;

        if (typeof cep_node !== 'undefined' && cep_node.require) {
            requireFunc = cep_node.require;
            this.log('使用cep_node.require (CEP 8+官方方式)', 'info');
        } else if (typeof window.require !== 'undefined') {
            requireFunc = window.require;
            this.log('使用window.require', 'info');
        } else if (typeof require !== 'undefined') {
            requireFunc = require;
            this.log('使用全局require', 'info');
        } else if (typeof cep !== 'undefined' && cep.process) {
            // CEP可能不提供require，但提供其他API
            this.log('使用CEP原生API (无require，但有process)', 'info');
            usesCEPAPI = true;
        } else {
            this.log('❌ 没有可用的require函数或CEP API', 'error');
            return false;
        }

        if (usesCEPAPI) {
            // 使用CEP原生API测试
            this.log('✅ 使用CEP原生API进行测试', 'success');
            if (cep.process) {
                this.log('✅ cep.process: 可用', 'success');
            }
            if (cep.fs) {
                this.log('✅ cep.fs: 可用', 'success');
            }
            if (cep.encoding) {
                this.log('✅ cep.encoding: 可用', 'success');
            }
            if (cep.util) {
                this.log('✅ cep.util: 可用', 'success');
            }
            return true;
        }

        modules.forEach(moduleName => {
            try {
                const module = requireFunc(moduleName);
                if (module) {
                    this.log(`✅ ${moduleName}模块: 可用`, 'success');
                } else {
                    this.log(`❌ ${moduleName}模块: 不可用`, 'error');
                    success = false;
                }
            } catch (error) {
                this.log(`❌ ${moduleName}模块加载失败: ${error.message}`, 'error');
                success = false;
            }
        });

        return success;
    }

    // 测试文件系统权限
    testFileSystemPermissions() {
        this.log('测试文件系统权限...', 'info');

        try {
            // 优先使用CEP原生API
            if (typeof cep !== 'undefined' && cep.fs) {
                this.log('使用CEP原生文件系统API', 'info');

                // 测试CEP文件系统API
                try {
                    // CEP提供的文件系统API
                    this.log('✅ cep.fs API可用', 'success');

                    // 测试获取系统路径
                    if (typeof CSInterface !== 'undefined') {
                        const csInterface = new CSInterface();
                        const systemPath = csInterface.getSystemPath('userData');
                        this.log(`用户数据目录: ${systemPath}`, 'info');
                    }

                    return true;
                } catch (cepError) {
                    this.log(`CEP文件系统API测试失败: ${cepError.message}`, 'warning');
                }
            }

            // 回退到Node.js API
            let requireFunc = null;
            if (typeof cep_node !== 'undefined' && cep_node.require) {
                requireFunc = cep_node.require;
                this.log('使用cep_node.require', 'info');
            } else if (typeof window.require !== 'undefined') {
                requireFunc = window.require;
                this.log('使用window.require', 'info');
            } else if (typeof require !== 'undefined') {
                requireFunc = require;
                this.log('使用全局require', 'info');
            } else {
                this.log('❌ 没有可用的文件系统API', 'error');
                return false;
            }

            const fs = requireFunc('fs');
            const path = requireFunc('path');
            const os = requireFunc('os');

            // 测试临时目录访问
            const tempDir = os.tmpdir();
            this.log(`临时目录: ${tempDir}`, 'info');

            // 测试目录读取
            const stats = fs.statSync(tempDir);
            if (stats.isDirectory()) {
                this.log('✅ 目录读取权限: 正常', 'success');
            }

            // 测试路径操作
            const testPath = path.join(tempDir, 'nodejs-test.tmp');
            this.log(`测试路径: ${testPath}`, 'info');

            return true;
        } catch (error) {
            this.log(`❌ 文件系统权限测试失败: ${error.message}`, 'error');
            return false;
        }
    }

    // 运行所有测试
    runAllTests() {
        this.log('=== Node.js 连接测试开始 ===', 'info');
        
        const tests = [
            { name: '环境检测', fn: () => this.testEnvironment() },
            { name: '核心模块', fn: () => this.testCoreModules() },
            { name: '文件系统权限', fn: () => this.testFileSystemPermissions() }
        ];

        let allPassed = true;
        const results = {};

        tests.forEach(test => {
            this.log(`\n--- 测试: ${test.name} ---`, 'info');
            const result = test.fn();
            results[test.name] = result;
            if (!result) {
                allPassed = false;
            }
        });

        this.log('\n=== 测试结果汇总 ===', 'info');
        Object.entries(results).forEach(([name, result]) => {
            const status = result ? '✅ 通过' : '❌ 失败';
            this.log(`${name}: ${status}`, result ? 'success' : 'error');
        });

        if (allPassed) {
            this.log('\n🎉 所有测试通过！Node.js集成正常工作', 'success');
        } else {
            this.log('\n⚠️ 部分测试失败，请检查配置', 'warning');
        }

        return {
            success: allPassed,
            results: results,
            logs: this.results
        };
    }
}

// 导出测试类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NodeJSTest;
} else {
    window.NodeJSTest = NodeJSTest;
}
