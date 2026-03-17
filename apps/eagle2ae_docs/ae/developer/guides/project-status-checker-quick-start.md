# 项目状态检测器快速入门指南

## 概述

项目状态检测器 (ProjectStatusChecker) 是 Eagle2Ae 的核心功能之一，用于在执行关键操作前检测系统状态，确保操作的可行性和安全性。

## 快速开始

### 基本使用

```javascript
// 创建状态检测器实例
const checker = new ProjectStatusChecker();

// 执行完整状态检测
const result = await checker.checkProjectStatus();

// 检查结果
if (result.hasErrors) {
    console.error('检测到错误:', result.errors);
    // 显示智能错误对话框
    const userChoice = await showStatusErrorDialog(result);
    
    // 根据用户选择处理
    switch (userChoice) {
        case '重试':
            return await checker.checkProjectStatus();
        case '忽略':
            console.warn('用户选择忽略错误，继续操作');
            break;
        case '取消':
            return null;
    }
} else {
    console.log('状态检查通过，可以继续操作');
    // 显示状态总结（可选）
    await showStatusSummaryDialog(result);
}
```

### 集成到文件导入流程

```javascript
// 在文件导入前进行状态检测
async function importFileWithStatusCheck(filePath) {
    const checker = new ProjectStatusChecker();
    
    // 1. 执行状态检测
    const statusResult = await checker.checkProjectStatus();
    
    if (statusResult.hasErrors) {
        // 显示错误对话框并获取用户选择
        const userChoice = await showStatusErrorDialog(statusResult);
        
        if (userChoice === '取消') {
            return { success: false, reason: '用户取消操作' };
        }
        
        if (userChoice === '重试') {
            // 递归重试
            return await importFileWithStatusCheck(filePath);
        }
        
        // 用户选择忽略，记录警告但继续操作
        console.warn('用户选择忽略状态错误，继续导入文件');
    }
    
    // 2. 根据检测结果优化导入参数
    const importOptions = optimizeImportOptions(statusResult);
    
    // 3. 执行文件导入
    return await performFileImport(filePath, importOptions);
}

// 根据状态检测结果优化导入选项
function optimizeImportOptions(statusResult) {
    const options = {
        batchSize: 10,
        useProxy: false,
        enablePreview: true
    };
    
    // 根据系统性能调整批处理大小
    if (statusResult.info.performance?.memoryUsage > 0.8) {
        options.batchSize = 5; // 内存使用率高时减少批处理大小
        options.useProxy = true; // 启用代理以减少内存占用
    }
    
    // 根据项目复杂度调整预览设置
    if (statusResult.info.project?.itemCount > 100) {
        options.enablePreview = false; // 项目复杂时禁用预览
    }
    
    return options;
}
```

## 常见使用场景

### 1. 文件导入前的状态检查
在执行文件导入操作前，使用项目状态检测器确保AE项目已打开且连接正常。

### 2. 图层操作前的状态检查
在执行图层检测或导出操作前，检查活动合成是否存在。

### 3. 系统健康检查
定期检查系统状态，确保扩展正常运行。

## 最佳实践

### 关键操作前检测

在执行重要操作前始终进行状态检测：

```javascript
// 文件导入前检测
async function importFiles(files) {
    const checker = new ProjectStatusChecker();
    const status = await checker.checkProjectStatus();
    
    if (!status.info.project?.hasProject) {
        const userChoice = await showDialog('需要打开项目', '请先打开或创建一个项目');
        if (userChoice === 'create') {
            await createNewProject();
        } else if (userChoice === 'open') {
            await openProjectDialog();
        } else {
            return;
        }
    }
    
    // 继续导入流程...
}
```

### 合理使用缓存

根据操作频率合理配置缓存：

```javascript
// 高频操作使用较长缓存
const uiChecker = new ProjectStatusChecker();
uiChecker.cacheTimeout = 10000; // UI 更新可以使用 10 秒缓存

// 关键操作使用较短缓存
const importChecker = new ProjectStatusChecker();
importChecker.cacheTimeout = 2000; // 导入操作使用 2 秒缓存

// 实时操作不使用缓存
const realtimeChecker = new ProjectStatusChecker();
realtimeChecker.cacheTimeout = 0; // 实时检测不使用缓存
```