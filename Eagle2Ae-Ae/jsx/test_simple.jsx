// 简单的ExtendScript测试脚本
// 用于验证ExtendScript环境是否正常工作

function simpleTest() {
    try {
        return "ExtendScript环境正常";
    } catch (error) {
        return "错误: " + error.toString();
    }
}

function getAEVersion() {
    try {
        return app.version;
    } catch (error) {
        return "无法获取AE版本: " + error.toString();
    }
}

function testBasicFunctions() {
    try {
        var result = {
            success: true,
            aeVersion: app.version,
            hasProject: (app.project !== null),
            projectFile: null,
            timestamp: new Date().toString()
        };
        
        if (app.project && app.project.file) {
            result.projectFile = app.project.file.fsName;
        }
        
        return JSON.stringify(result);
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}
