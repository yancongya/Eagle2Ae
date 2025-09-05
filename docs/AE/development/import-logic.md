# 导入逻辑技术文档

## 概述

本文档详细描述了Eagle2Ae CEP扩展中的文件导入逻辑，包括拖拽导入、合成检查机制和用户交互流程。

## 1. 导入系统架构

### 1.1 导入方式分类

Eagle2Ae支持两种主要的导入方式：

1. **拖拽导入**: 用户直接将文件拖拽到AE项目面板
2. **按钮导入**: 用户通过插件界面的导入按钮

### 1.2 系统组件

```
导入系统
├── 拖拽检测模块
│   ├── 拖拽事件监听
│   ├── 文件类型验证
│   └── 路径解析
├── 合成检查模块
│   ├── 活动合成检测
│   ├── 用户设置验证
│   └── 确认对话框
└── 文件处理模块
    ├── 文件导入
    ├── 合成创建
    └── 错误处理
```

## 2. 拖拽判定逻辑

### 2.1 拖拽检测机制

#### 2.1.1 事件监听设置

```javascript
// 在main.js中设置拖拽事件监听
function setupDragAndDrop() {
    // 监听拖拽进入事件
    document.addEventListener('dragenter', handleDragEnter, false);
    
    // 监听拖拽悬停事件
    document.addEventListener('dragover', handleDragOver, false);
    
    // 监听拖拽离开事件
    document.addEventListener('dragleave', handleDragLeave, false);
    
    // 监听文件放置事件
    document.addEventListener('drop', handleFileDrop, false);
}
```

#### 2.1.2 拖拽状态判定

```javascript
/**
 * 判断是否为有效的拖拽操作
 * @param {DragEvent} event 拖拽事件对象
 * @returns {boolean} 是否为有效拖拽
 */
function isValidDragOperation(event) {
    // 检查是否包含文件
    if (!event.dataTransfer || !event.dataTransfer.files) {
        return false;
    }
    
    // 检查文件数量
    if (event.dataTransfer.files.length === 0) {
        return false;
    }
    
    // 检查拖拽类型
    const types = event.dataTransfer.types;
    return types.includes('Files') || types.includes('application/x-moz-file');
}
```

#### 2.1.3 文件类型验证

```javascript
/**
 * 验证拖拽文件的类型
 * @param {FileList} files 文件列表
 * @returns {Object} 验证结果
 */
function validateDraggedFiles(files) {
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.psd', '.ai', '.svg'];
    const validFiles = [];
    const invalidFiles = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const extension = getFileExtension(file.name).toLowerCase();
        
        if (supportedExtensions.includes(extension)) {
            validFiles.push(file);
        } else {
            invalidFiles.push(file);
        }
    }
    
    return {
        valid: validFiles,
        invalid: invalidFiles,
        hasValidFiles: validFiles.length > 0,
        hasInvalidFiles: invalidFiles.length > 0
    };
}
```

### 2.2 拖拽事件处理流程

```javascript
/**
 * 处理文件拖拽放置事件
 * @param {DragEvent} event 拖拽事件
 */
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('[拖拽导入] 检测到文件放置事件');
    
    // 1. 验证拖拽操作
    if (!isValidDragOperation(event)) {
        console.warn('[拖拽导入] 无效的拖拽操作');
        return;
    }
    
    // 2. 获取文件列表
    const files = Array.from(event.dataTransfer.files);
    console.log(`[拖拽导入] 检测到 ${files.length} 个文件`);
    
    // 3. 验证文件类型
    const validation = validateDraggedFiles(files);
    
    if (!validation.hasValidFiles) {
        showErrorMessage('没有支持的文件类型');
        return;
    }
    
    if (validation.hasInvalidFiles) {
        console.warn(`[拖拽导入] 发现 ${validation.invalid.length} 个不支持的文件`);
    }
    
    // 4. 处理有效文件
    processDraggedFiles(validation.valid);
}
```

## 3. 合成检查机制

### 3.1 活动合成检测

#### 3.1.1 检测逻辑

```javascript
/**
 * 检测当前是否有活动的合成
 * @returns {Object} 检测结果
 */
function detectActiveComposition() {
    const script = `
        (function() {
            try {
                var activeComp = app.project.activeItem;
                
                if (activeComp && activeComp instanceof CompItem) {
                    return {
                        hasActiveComp: true,
                        compName: activeComp.name,
                        compId: activeComp.id,
                        width: activeComp.width,
                        height: activeComp.height,
                        duration: activeComp.duration,
                        frameRate: activeComp.frameRate
                    };
                } else {
                    return {
                        hasActiveComp: false,
                        reason: activeComp ? 'Not a composition' : 'No active item'
                    };
                }
            } catch(error) {
                return {
                    hasActiveComp: false,
                    error: error.toString()
                };
            }
        })()
    `;
    
    return new Promise((resolve) => {
        csInterface.evalScript(script, (result) => {
            try {
                const data = JSON.parse(result);
                resolve(data);
            } catch(error) {
                console.error('[合成检测] 解析结果失败:', error);
                resolve({ hasActiveComp: false, error: 'Parse error' });
            }
        });
    });
}
```

#### 3.1.2 合成信息获取

```javascript
/**
 * 获取详细的合成信息
 * @param {number} compId 合成ID
 * @returns {Promise<Object>} 合成详细信息
 */
function getCompositionDetails(compId) {
    const script = `
        (function() {
            try {
                var comp = app.project.itemByID(${compId});
                
                if (comp && comp instanceof CompItem) {
                    return {
                        id: comp.id,
                        name: comp.name,
                        width: comp.width,
                        height: comp.height,
                        duration: comp.duration,
                        frameRate: comp.frameRate,
                        pixelAspect: comp.pixelAspect,
                        bgColor: [comp.bgColor[0], comp.bgColor[1], comp.bgColor[2]],
                        numLayers: comp.numLayers,
                        workAreaStart: comp.workAreaStart,
                        workAreaDuration: comp.workAreaDuration
                    };
                } else {
                    return { error: 'Composition not found' };
                }
            } catch(error) {
                return { error: error.toString() };
            }
        })()
    `;
    
    return new Promise((resolve) => {
        csInterface.evalScript(script, (result) => {
            try {
                const data = JSON.parse(result);
                resolve(data);
            } catch(error) {
                resolve({ error: 'Parse error' });
            }
        });
    });
}
```

### 3.2 用户设置检查

#### 3.2.1 设置读取

```javascript
/**
 * 读取用户的导入设置
 * @returns {Object} 用户设置对象
 */
function getCurrentSettings() {
    // 从本地存储或配置文件读取设置
    const defaultSettings = {
        addToComposition: true,        // 是否添加到合成
        createNewComposition: false,   // 是否创建新合成
        importAsSequence: false,       // 是否作为序列导入
        scaleFactor: 1.0,             // 缩放因子
        positionX: 0,                 // X位置
        positionY: 0,                 // Y位置
        blendMode: 'normal',          // 混合模式
        opacity: 100                  // 不透明度
    };
    
    try {
        const savedSettings = localStorage.getItem('eagle2ae_import_settings');
        if (savedSettings) {
            return Object.assign(defaultSettings, JSON.parse(savedSettings));
        }
    } catch(error) {
        console.warn('[设置读取] 读取保存的设置失败:', error);
    }
    
    return defaultSettings;
}
```

#### 3.2.2 设置验证

```javascript
/**
 * 验证导入设置的有效性
 * @param {Object} settings 设置对象
 * @returns {Object} 验证结果
 */
function validateImportSettings(settings) {
    const errors = [];
    const warnings = [];
    
    // 验证缩放因子
    if (typeof settings.scaleFactor !== 'number' || settings.scaleFactor <= 0) {
        errors.push('缩放因子必须是大于0的数字');
    }
    
    // 验证不透明度
    if (typeof settings.opacity !== 'number' || settings.opacity < 0 || settings.opacity > 100) {
        errors.push('不透明度必须是0-100之间的数字');
    }
    
    // 验证位置
    if (typeof settings.positionX !== 'number' || typeof settings.positionY !== 'number') {
        warnings.push('位置坐标应该是数字类型');
    }
    
    // 验证混合模式
    const validBlendModes = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'];
    if (!validBlendModes.includes(settings.blendMode)) {
        warnings.push(`不支持的混合模式: ${settings.blendMode}`);
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
}
```

### 3.3 合成检查决策逻辑

```javascript
/**
 * 执行合成检查并决定后续操作
 * @param {Array} files 要导入的文件列表
 * @returns {Promise<Object>} 检查结果和操作决策
 */
async function performCompositionCheck(files) {
    console.log('[合成检查] 开始检查合成状态');
    
    // 1. 获取当前设置
    const currentSettings = getCurrentSettings();
    console.log('[合成检查] 当前设置:', currentSettings);
    
    // 2. 验证设置
    const settingsValidation = validateImportSettings(currentSettings);
    if (!settingsValidation.isValid) {
        console.error('[合成检查] 设置验证失败:', settingsValidation.errors);
        return {
            success: false,
            error: '导入设置无效: ' + settingsValidation.errors.join(', ')
        };
    }
    
    // 3. 检查是否需要添加到合成
    if (!currentSettings.addToComposition) {
        console.log('[合成检查] 用户设置为不添加到合成，直接导入');
        return {
            success: true,
            action: 'import_only',
            settings: currentSettings
        };
    }
    
    // 4. 检测活动合成
    const compDetection = await detectActiveComposition();
    console.log('[合成检查] 合成检测结果:', compDetection);
    
    // 5. 根据检测结果决定操作
    if (compDetection.hasActiveComp) {
        console.log('[合成检查] 检测到活动合成，直接添加到合成');
        return {
            success: true,
            action: 'add_to_composition',
            composition: compDetection,
            settings: currentSettings
        };
    } else {
        console.log('[合成检查] 未检测到活动合成，需要用户确认');
        return {
            success: true,
            action: 'require_confirmation',
            reason: compDetection.reason || compDetection.error || '未知原因',
            settings: currentSettings
        };
    }
}
```

## 4. 弹窗出现逻辑

### 4.1 弹窗触发条件

弹窗在以下情况下会出现：

1. **用户设置要求添加到合成** (`addToComposition: true`)
2. **当前没有活动的合成** (`hasActiveComp: false`)
3. **拖拽导入操作** (区别于按钮导入)

### 4.2 弹窗决策流程

```javascript
/**
 * 决定是否需要显示确认弹窗
 * @param {Object} checkResult 合成检查结果
 * @param {string} importType 导入类型 ('drag' | 'button')
 * @returns {boolean} 是否需要显示弹窗
 */
function shouldShowConfirmDialog(checkResult, importType) {
    // 只有拖拽导入才可能显示弹窗
    if (importType !== 'drag') {
        return false;
    }
    
    // 检查结果失败时不显示弹窗
    if (!checkResult.success) {
        return false;
    }
    
    // 只有需要确认的情况才显示弹窗
    return checkResult.action === 'require_confirmation';
}
```

### 4.3 弹窗内容生成

```javascript
/**
 * 生成确认对话框的内容
 * @param {Object} checkResult 合成检查结果
 * @param {Array} files 文件列表
 * @returns {Object} 对话框配置
 */
function generateConfirmDialogContent(checkResult, files) {
    const fileCount = files.length;
    const fileText = fileCount === 1 ? '1个文件' : `${fileCount}个文件`;
    
    const title = '导入确认';
    
    let message = `检测到您正在导入${fileText}，但当前没有活动的合成。\n\n`;
    
    // 添加原因说明
    if (checkResult.reason) {
        message += `原因: ${checkResult.reason}\n\n`;
    }
    
    message += '您可以选择：\n';
    message += '• 继续导入 - 文件将被导入到项目中\n';
    message += '• 取消 - 停止导入操作';
    
    const buttons = ['继续导入', '取消'];
    
    return {
        title: title,
        message: message,
        buttons: buttons
    };
}
```

### 4.4 弹窗显示和处理

```javascript
/**
 * 显示确认对话框并处理用户选择
 * @param {Object} dialogContent 对话框内容
 * @returns {Promise<Object>} 用户选择结果
 */
async function showConfirmationDialog(dialogContent) {
    console.log('[确认对话框] 准备显示对话框');
    
    try {
        // 转义特殊字符
        const escapedTitle = dialogContent.title.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        const escapedMessage = dialogContent.message.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        
        // 构造ExtendScript调用
        const confirmScript = `showPanelConfirmDialog("${escapedTitle}", "${escapedMessage}", ["${dialogContent.buttons[0]}", "${dialogContent.buttons[1]}"])`;
        
        console.log('[确认对话框] 执行ExtendScript:', confirmScript);
        
        // 执行对话框显示
        const result = await new Promise((resolve) => {
            csInterface.evalScript(confirmScript, (scriptResult) => {
                const buttonIndex = parseInt(scriptResult);
                resolve({
                    buttonIndex: buttonIndex,
                    confirmed: buttonIndex === 0,
                    buttonText: dialogContent.buttons[buttonIndex]
                });
            });
        });
        
        console.log('[确认对话框] 用户选择结果:', result);
        return result;
        
    } catch (error) {
        console.error('[确认对话框] 显示对话框失败:', error);
        
        // 降级处理：使用原生confirm
        const fallbackResult = confirm(dialogContent.title + '\n\n' + dialogContent.message);
        return {
            buttonIndex: fallbackResult ? 0 : 1,
            confirmed: fallbackResult,
            buttonText: dialogContent.buttons[fallbackResult ? 0 : 1],
            fallback: true
        };
    }
}
```

## 5. 完整的拖拽导入流程

### 5.1 主流程函数

```javascript
/**
 * 处理拖拽文件的完整流程
 * @param {Array} files 拖拽的文件列表
 */
async function processDraggedFiles(files) {
    console.log(`[拖拽导入] 开始处理 ${files.length} 个文件`);
    
    try {
        // 1. 执行合成检查
        const checkResult = await performCompositionCheck(files);
        
        if (!checkResult.success) {
            console.error('[拖拽导入] 合成检查失败:', checkResult.error);
            showErrorMessage(checkResult.error);
            return { success: false, error: checkResult.error };
        }
        
        // 2. 决定是否需要显示确认对话框
        const needConfirmation = shouldShowConfirmDialog(checkResult, 'drag');
        
        if (needConfirmation) {
            console.log('[拖拽导入] 需要用户确认，显示对话框');
            
            // 生成对话框内容
            const dialogContent = generateConfirmDialogContent(checkResult, files);
            
            // 显示确认对话框
            const userChoice = await showConfirmationDialog(dialogContent);
            
            if (!userChoice.confirmed) {
                console.log('[拖拽导入] 用户取消导入');
                return { success: false, cancelled: true };
            }
            
            console.log('[拖拽导入] 用户确认继续导入');
        }
        
        // 3. 执行文件导入
        const importResult = await executeFileImport(files, checkResult);
        
        if (importResult.success) {
            console.log('[拖拽导入] 文件导入成功');
            showSuccessMessage(`成功导入 ${files.length} 个文件`);
        } else {
            console.error('[拖拽导入] 文件导入失败:', importResult.error);
            showErrorMessage('导入失败: ' + importResult.error);
        }
        
        return importResult;
        
    } catch (error) {
        console.error('[拖拽导入] 处理过程中发生错误:', error);
        showErrorMessage('导入过程中发生错误: ' + error.message);
        return { success: false, error: error.message };
    }
}
```

### 5.2 文件导入执行

```javascript
/**
 * 执行实际的文件导入操作
 * @param {Array} files 文件列表
 * @param {Object} checkResult 合成检查结果
 * @returns {Promise<Object>} 导入结果
 */
async function executeFileImport(files, checkResult) {
    console.log('[文件导入] 开始执行文件导入');
    
    const importedFiles = [];
    const failedFiles = [];
    
    for (const file of files) {
        try {
            console.log(`[文件导入] 正在导入文件: ${file.name}`);
            
            // 构造导入脚本
            const importScript = generateImportScript(file, checkResult);
            
            // 执行导入
            const result = await executeImportScript(importScript);
            
            if (result.success) {
                importedFiles.push({
                    file: file,
                    result: result
                });
                console.log(`[文件导入] 文件导入成功: ${file.name}`);
            } else {
                failedFiles.push({
                    file: file,
                    error: result.error
                });
                console.error(`[文件导入] 文件导入失败: ${file.name}`, result.error);
            }
            
        } catch (error) {
            failedFiles.push({
                file: file,
                error: error.message
            });
            console.error(`[文件导入] 文件导入异常: ${file.name}`, error);
        }
    }
    
    // 返回导入结果
    return {
        success: failedFiles.length === 0,
        imported: importedFiles,
        failed: failedFiles,
        totalFiles: files.length,
        successCount: importedFiles.length,
        failureCount: failedFiles.length
    };
}
```

### 5.3 导入脚本生成

```javascript
/**
 * 生成文件导入的ExtendScript脚本
 * @param {File} file 要导入的文件
 * @param {Object} checkResult 合成检查结果
 * @returns {string} ExtendScript脚本
 */
function generateImportScript(file, checkResult) {
    const filePath = file.path || file.webkitRelativePath || file.name;
    const settings = checkResult.settings;
    
    let script = `
        (function() {
            try {
                // 导入文件到项目
                var importFile = new ImportOptions(File("${filePath.replace(/\\/g, '\\\\')}"));
                var footageItem = app.project.importFile(importFile);
                
                if (!footageItem) {
                    return { success: false, error: "文件导入失败" };
                }
                
                var result = {
                    success: true,
                    itemId: footageItem.id,
                    itemName: footageItem.name,
                    itemType: footageItem.typeName
                };
    `;
    
    // 如果需要添加到合成
    if (checkResult.action === 'add_to_composition' && checkResult.composition) {
        script += `
                // 添加到活动合成
                var activeComp = app.project.activeItem;
                if (activeComp && activeComp instanceof CompItem) {
                    var layer = activeComp.layers.add(footageItem);
                    
                    // 应用设置
                    if (${settings.scaleFactor} !== 1.0) {
                        layer.transform.scale.setValue([${settings.scaleFactor * 100}, ${settings.scaleFactor * 100}]);
                    }
                    
                    if (${settings.positionX} !== 0 || ${settings.positionY} !== 0) {
                        layer.transform.position.setValue([${settings.positionX}, ${settings.positionY}]);
                    }
                    
                    if (${settings.opacity} !== 100) {
                        layer.transform.opacity.setValue(${settings.opacity});
                    }
                    
                    result.layerId = layer.index;
                    result.addedToComposition = true;
                }
        `;
    }
    
    script += `
                return result;
                
            } catch(error) {
                return {
                    success: false,
                    error: error.toString()
                };
            }
        })()
    `;
    
    return script;
}
```

## 6. 错误处理和日志记录

### 6.1 错误分类

```javascript
// 错误类型定义
const ImportErrorTypes = {
    VALIDATION_ERROR: 'validation_error',      // 验证错误
    FILE_ACCESS_ERROR: 'file_access_error',    // 文件访问错误
    COMPOSITION_ERROR: 'composition_error',    // 合成相关错误
    SCRIPT_ERROR: 'script_error',              // 脚本执行错误
    USER_CANCELLED: 'user_cancelled',          // 用户取消
    UNKNOWN_ERROR: 'unknown_error'             // 未知错误
};
```

### 6.2 错误处理函数

```javascript
/**
 * 统一的错误处理函数
 * @param {Error} error 错误对象
 * @param {string} context 错误上下文
 * @param {Object} additionalInfo 附加信息
 */
function handleImportError(error, context, additionalInfo = {}) {
    const errorInfo = {
        type: classifyError(error),
        message: error.message,
        context: context,
        timestamp: new Date().toISOString(),
        ...additionalInfo
    };
    
    // 记录错误日志
    console.error(`[导入错误] ${context}:`, errorInfo);
    
    // 发送错误报告（如果启用）
    if (window.errorReporter) {
        window.errorReporter.report(errorInfo);
    }
    
    // 显示用户友好的错误消息
    const userMessage = generateUserFriendlyErrorMessage(errorInfo);
    showErrorMessage(userMessage);
}
```

### 6.3 性能监控

```javascript
/**
 * 性能监控装饰器
 * @param {string} operationName 操作名称
 * @param {Function} operation 要监控的操作
 * @returns {Function} 包装后的函数
 */
function withPerformanceMonitoring(operationName, operation) {
    return async function(...args) {
        const startTime = performance.now();
        
        try {
            const result = await operation.apply(this, args);
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.log(`[性能监控] ${operationName} 执行时间: ${duration.toFixed(2)}ms`);
            
            // 记录性能数据
            if (window.performanceTracker) {
                window.performanceTracker.record(operationName, duration);
            }
            
            return result;
            
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.error(`[性能监控] ${operationName} 执行失败，耗时: ${duration.toFixed(2)}ms`, error);
            throw error;
        }
    };
}

// 使用示例
const monitoredProcessDraggedFiles = withPerformanceMonitoring('拖拽文件处理', processDraggedFiles);
```

## 7. 配置和自定义

### 7.1 导入配置选项

```javascript
// 导入配置的完整定义
const ImportConfig = {
    // 基本设置
    addToComposition: true,           // 是否添加到合成
    createNewComposition: false,      // 是否创建新合成
    importAsSequence: false,          // 是否作为序列导入
    
    // 变换设置
    scaleFactor: 1.0,                // 缩放因子
    positionX: 0,                    // X位置
    positionY: 0,                    // Y位置
    rotation: 0,                     // 旋转角度
    
    // 外观设置
    opacity: 100,                    // 不透明度 (0-100)
    blendMode: 'normal',             // 混合模式
    
    // 行为设置
    showConfirmDialog: true,         // 是否显示确认对话框
    autoCreateComposition: false,    // 自动创建合成
    preserveAspectRatio: true,       // 保持宽高比
    
    // 高级设置
    importOptions: {
        sequence: false,             // 序列导入
        forceAlphabetical: false,    // 强制字母顺序
        importAs: 'footage'          // 导入类型: 'footage', 'composition', 'project'
    }
};
```

### 7.2 配置管理

```javascript
/**
 * 配置管理器
 */
class ImportConfigManager {
    constructor() {
        this.config = this.loadConfig();
    }
    
    /**
     * 加载配置
     */
    loadConfig() {
        try {
            const saved = localStorage.getItem('eagle2ae_import_config');
            if (saved) {
                return Object.assign({}, ImportConfig, JSON.parse(saved));
            }
        } catch (error) {
            console.warn('[配置管理] 加载配置失败:', error);
        }
        return Object.assign({}, ImportConfig);
    }
    
    /**
     * 保存配置
     */
    saveConfig() {
        try {
            localStorage.setItem('eagle2ae_import_config', JSON.stringify(this.config));
            console.log('[配置管理] 配置已保存');
        } catch (error) {
            console.error('[配置管理] 保存配置失败:', error);
        }
    }
    
    /**
     * 获取配置值
     */
    get(key) {
        return this.config[key];
    }
    
    /**
     * 设置配置值
     */
    set(key, value) {
        this.config[key] = value;
        this.saveConfig();
    }
    
    /**
     * 重置为默认配置
     */
    reset() {
        this.config = Object.assign({}, ImportConfig);
        this.saveConfig();
    }
}

// 全局配置管理器实例
const configManager = new ImportConfigManager();
```

## 8. 测试和调试

### 8.1 测试用例

```javascript
/**
 * 拖拽导入测试套件
 */
const DragImportTests = {
    /**
     * 测试基本拖拽功能
     */
    async testBasicDragImport() {
        console.log('[测试] 开始基本拖拽导入测试');
        
        // 模拟文件对象
        const mockFiles = [
            { name: 'test.jpg', type: 'image/jpeg', size: 1024000 },
            { name: 'test.png', type: 'image/png', size: 512000 }
        ];
        
        try {
            const result = await processDraggedFiles(mockFiles);
            console.log('[测试] 基本拖拽导入测试结果:', result);
            return result.success;
        } catch (error) {
            console.error('[测试] 基本拖拽导入测试失败:', error);
            return false;
        }
    },
    
    /**
     * 测试合成检查逻辑
     */
    async testCompositionCheck() {
        console.log('[测试] 开始合成检查测试');
        
        try {
            const result = await performCompositionCheck([]);
            console.log('[测试] 合成检查测试结果:', result);
            return result.success;
        } catch (error) {
            console.error('[测试] 合成检查测试失败:', error);
            return false;
        }
    },
    
    /**
     * 运行所有测试
     */
    async runAllTests() {
        const tests = [
            this.testBasicDragImport,
            this.testCompositionCheck
        ];
        
        const results = [];
        
        for (const test of tests) {
            const result = await test();
            results.push(result);
        }
        
        const passedCount = results.filter(r => r).length;
        const totalCount = results.length;
        
        console.log(`[测试] 测试完成: ${passedCount}/${totalCount} 通过`);
        
        return {
            passed: passedCount,
            total: totalCount,
            success: passedCount === totalCount
        };
    }
};
```

### 8.2 调试工具

```javascript
/**
 * 调试工具集
 */
const DebugTools = {
    /**
     * 启用详细日志
     */
    enableVerboseLogging() {
        window.EAGLE2AE_DEBUG = true;
        console.log('[调试] 详细日志已启用');
    },
    
    /**
     * 禁用详细日志
     */
    disableVerboseLogging() {
        window.EAGLE2AE_DEBUG = false;
        console.log('[调试] 详细日志已禁用');
    },
    
    /**
     * 模拟拖拽事件
     */
    simulateDragEvent(files) {
        const mockEvent = {
            preventDefault: () => {},
            stopPropagation: () => {},
            dataTransfer: {
                files: files,
                types: ['Files']
            }
        };
        
        handleFileDrop(mockEvent);
    },
    
    /**
     * 获取系统状态
     */
    getSystemStatus() {
        return {
            config: configManager.config,
            debugMode: window.EAGLE2AE_DEBUG || false,
            csInterface: !!window.CSInterface,
            activeComposition: 'unknown' // 需要异步检查
        };
    }
};
```

## 9. 相关文件和依赖

### 9.1 核心文件

- `Eagle2Ae-Ae/js/main.js`: 主要的导入逻辑实现
- `Eagle2Ae-Ae/jsx/dialog-warning.jsx`: 对话框系统实现
- `Eagle2Ae-Ae/js/CSInterface.js`: Adobe CEP通信接口
- `Eagle2Ae-Ae/js/utils/file-utils.js`: 文件处理工具函数

### 9.2 依赖关系图

```
main.js
├── CSInterface (Adobe CEP)
├── dialog-warning.jsx
├── file-utils.js
└── config-manager.js
    └── localStorage (浏览器API)
```

---

**最后更新**: 2024年1月
**维护者**: Eagle2Ae开发团队
**版本**: v1.0