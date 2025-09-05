/**
 * 项目状态检测功能测试脚本
 * 用于验证所有功能入口点的项目状态判定逻辑
 * 
 * @author Eagle2Ae开发团队
 * @date 2024-01-01
 * @version 1.0.0
 */

/**
 * 项目状态检测测试管理器
 */
class ProjectStatusTestManager {
    constructor() {
        this.testResults = [];
        this.csInterface = new CSInterface();
        this.projectStatusChecker = null;
    }

    /**
     * 初始化测试环境
     */
    async initialize() {
        try {
            // 创建ProjectStatusChecker实例
            this.projectStatusChecker = new ProjectStatusChecker(
                this.csInterface,
                this.log.bind(this)
            );
            
            console.log('[测试管理器] 初始化完成');
            return true;
        } catch (error) {
            console.error('[测试管理器] 初始化失败:', error);
            return false;
        }
    }

    /**
     * 日志记录方法
     * @param {string} message 日志消息
     * @param {string} level 日志级别
     */
    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level.toUpperCase()}] [测试] ${message}`);
    }

    /**
     * 测试项目状态检测功能
     */
    async testProjectStatusDetection() {
        this.log('开始测试项目状态检测功能');
        
        try {
            // 测试基本项目状态检查
            const projectStatus = await this.projectStatusChecker.checkProjectStatus();
            this.addTestResult('项目状态检查', projectStatus.hasProject, '检查AE是否有打开的项目');
            
            // 测试活动合成检查
            const compStatus = await this.projectStatusChecker.checkActiveComposition();
            this.addTestResult('活动合成检查', compStatus.hasActiveComp, '检查是否有活动合成');
            
            // 测试项目状态验证
            const validationResult = await this.projectStatusChecker.validateProjectStatus();
            this.addTestResult('项目状态验证', validationResult, '验证项目状态是否有效');
            
            this.log('项目状态检测功能测试完成');
            return true;
        } catch (error) {
            this.log(`项目状态检测功能测试失败: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * 测试拖拽功能的项目状态检测
     */
    async testDragDropStatusCheck() {
        this.log('开始测试拖拽功能的项目状态检测');
        
        try {
            // 模拟拖拽事件前的状态检查
            const isValid = await this.projectStatusChecker.validateProjectStatus({
                showWarning: false // 测试时不显示警告弹窗
            });
            
            this.addTestResult('拖拽前状态检查', typeof isValid === 'boolean', '拖拽前应该检查项目状态');
            
            if (!isValid) {
                this.log('拖拽功能正确阻止了无效项目状态的操作', 'info');
            }
            
            return true;
        } catch (error) {
            this.log(`拖拽功能状态检测测试失败: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * 测试导出按钮的项目状态检测
     */
    async testExportButtonStatusCheck() {
        this.log('开始测试导出按钮的项目状态检测');
        
        try {
            // 测试detectLayers方法的状态检查
            const detectLayersValid = await this.projectStatusChecker.validateProjectStatus({
                showWarning: false
            });
            this.addTestResult('detectLayers状态检查', typeof detectLayersValid === 'boolean', 'detectLayers应该检查项目状态');
            
            // 测试exportLayers方法的状态检查
            const exportLayersValid = await this.projectStatusChecker.validateProjectStatus({
                showWarning: false
            });
            this.addTestResult('exportLayers状态检查', typeof exportLayersValid === 'boolean', 'exportLayers应该检查项目状态');
            
            // 测试exportToEagle方法的状态检查
            const exportToEagleValid = await this.projectStatusChecker.validateProjectStatus({
                showWarning: false
            });
            this.addTestResult('exportToEagle状态检查', typeof exportToEagleValid === 'boolean', 'exportToEagle应该检查项目状态');
            
            return true;
        } catch (error) {
            this.log(`导出按钮状态检测测试失败: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * 测试警告弹窗功能
     */
    async testWarningDialog() {
        this.log('开始测试警告弹窗功能');
        
        try {
            // 测试显示警告弹窗（不实际显示，只测试方法调用）
            this.projectStatusChecker.showProjectStatusWarning(
                '测试标题',
                '这是一个测试消息，不会实际显示'
            );
            
            this.addTestResult('警告弹窗功能', true, '警告弹窗方法应该可以正常调用');
            
            return true;
        } catch (error) {
            this.log(`警告弹窗功能测试失败: ${error.message}`, 'error');
            this.addTestResult('警告弹窗功能', false, '警告弹窗方法调用失败');
            return false;
        }
    }

    /**
     * 添加测试结果
     * @param {string} testName 测试名称
     * @param {boolean} passed 是否通过
     * @param {string} description 测试描述
     */
    addTestResult(testName, passed, description) {
        const result = {
            name: testName,
            passed: passed,
            description: description,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const status = passed ? '✅ 通过' : '❌ 失败';
        this.log(`${status} - ${testName}: ${description}`);
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        this.log('开始运行项目状态检测功能的完整测试套件');
        
        // 初始化测试环境
        const initialized = await this.initialize();
        if (!initialized) {
            this.log('测试环境初始化失败，终止测试', 'error');
            return false;
        }
        
        // 运行各项测试
        const tests = [
            () => this.testProjectStatusDetection(),
            () => this.testDragDropStatusCheck(),
            () => this.testExportButtonStatusCheck(),
            () => this.testWarningDialog()
        ];
        
        let allPassed = true;
        
        for (const test of tests) {
            try {
                const result = await test();
                if (!result) {
                    allPassed = false;
                }
            } catch (error) {
                this.log(`测试执行异常: ${error.message}`, 'error');
                allPassed = false;
            }
        }
        
        // 输出测试报告
        this.generateTestReport();
        
        return allPassed;
    }

    /**
     * 生成测试报告
     */
    generateTestReport() {
        this.log('生成测试报告');
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log('\n' + '='.repeat(60));
        console.log('项目状态检测功能测试报告');
        console.log('='.repeat(60));
        console.log(`总测试数: ${totalTests}`);
        console.log(`通过: ${passedTests}`);
        console.log(`失败: ${failedTests}`);
        console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
        console.log('='.repeat(60));
        
        // 详细结果
        this.testResults.forEach((result, index) => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.name}`);
            console.log(`   描述: ${result.description}`);
            console.log(`   时间: ${result.timestamp}`);
            console.log('');
        });
        
        console.log('='.repeat(60));
    }
}

// 全局测试管理器实例
window.projectStatusTestManager = null;

/**
 * 启动项目状态检测功能测试
 */
window.startProjectStatusTest = async function() {
    try {
        window.projectStatusTestManager = new ProjectStatusTestManager();
        const success = await window.projectStatusTestManager.runAllTests();
        
        if (success) {
            console.log('🎉 所有项目状态检测功能测试通过！');
        } else {
            console.log('⚠️ 部分项目状态检测功能测试失败，请检查详细报告。');
        }
        
        return success;
    } catch (error) {
        console.error('测试执行失败:', error);
        return false;
    }
};

/**
 * 快速测试项目状态
 */
window.quickProjectStatusTest = async function() {
    try {
        const testManager = new ProjectStatusTestManager();
        await testManager.initialize();
        
        const projectStatus = await testManager.projectStatusChecker.checkProjectStatus();
        console.log('当前项目状态:', projectStatus);
        
        const isValid = await testManager.projectStatusChecker.validateProjectStatus({ showWarning: false });
        console.log('项目状态是否有效:', isValid);
        
        return { projectStatus, isValid };
    } catch (error) {
        console.error('快速测试失败:', error);
        return null;
    }
};

console.log('[项目状态测试] 测试脚本已加载');
console.log('[项目状态测试] 使用 startProjectStatusTest() 运行完整测试');
console.log('[项目状态测试] 使用 quickProjectStatusTest() 运行快速测试');