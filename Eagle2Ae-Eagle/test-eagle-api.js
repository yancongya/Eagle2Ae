// Eagle API 测试脚本
// 用于测试Eagle API调用是否正常工作

async function testEagleAPI() {
    try {
        eagle.log.info('开始测试Eagle API...');
        
        // 测试基本属性
        eagle.log.info('=== 测试基本属性 ===');
        eagle.log.info(`Eagle版本: ${eagle.app.version}`);
        eagle.log.info(`Eagle构建号: ${eagle.app.build}`);
        eagle.log.info(`Eagle语言: ${eagle.app.locale}`);
        eagle.log.info(`Eagle架构: ${eagle.app.arch}`);
        eagle.log.info(`Eagle平台: ${eagle.app.platform}`);
        eagle.log.info(`Eagle路径: ${eagle.app.execPath}`);
        eagle.log.info(`是否Windows: ${eagle.app.isWindows}`);
        eagle.log.info(`是否Mac: ${eagle.app.isMac}`);
        
        // 测试文件夹API
        eagle.log.info('=== 测试文件夹API ===');
        
        try {
            const selectedFolders = await eagle.folder.getSelected();
            eagle.log.info(`选中的文件夹数量: ${selectedFolders ? selectedFolders.length : 0}`);
            if (selectedFolders && selectedFolders.length > 0) {
                selectedFolders.forEach((folder, index) => {
                    eagle.log.info(`选中文件夹 ${index + 1}: ${folder.name} (ID: ${folder.id})`);
                });
            }
        } catch (error) {
            eagle.log.error(`获取选中文件夹失败: ${error.message}`);
        }
        
        try {
            const recentFolders = await eagle.folder.getRecents();
            eagle.log.info(`最近文件夹数量: ${recentFolders ? recentFolders.length : 0}`);
            if (recentFolders && recentFolders.length > 0) {
                recentFolders.slice(0, 3).forEach((folder, index) => {
                    eagle.log.info(`最近文件夹 ${index + 1}: ${folder.name} (ID: ${folder.id})`);
                });
            }
        } catch (error) {
            eagle.log.error(`获取最近文件夹失败: ${error.message}`);
        }
        
        // 测试项目API
        eagle.log.info('=== 测试项目API ===');
        
        try {
            const selectedItems = await eagle.item.getSelected();
            eagle.log.info(`选中的项目数量: ${selectedItems ? selectedItems.length : 0}`);
        } catch (error) {
            eagle.log.error(`获取选中项目失败: ${error.message}`);
        }
        
        eagle.log.info('Eagle API测试完成');
        
    } catch (error) {
        eagle.log.error(`Eagle API测试失败: ${error.message}`);
        eagle.log.error(error.stack || error);
    }
}

// 运行测试
testEagleAPI();
