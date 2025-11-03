/**
/**
 * 图层检测总结弹窗系统（简化版本）
 * 用于显示图层检测完成后的详细统计信息
 * 
 * 简化变更日志（v2.1.0）：
 * ✅ 移除了导出图层和打开文件夹功能按钮
 * ✅ 恢复为模态弹窗形式（Window('dialog')）
 * ✅ 保持基本的图层信息显示和悬浮提示功能
 * ✅ 文件夹打开功能独立保存到 folder-opener.js
 * ✅ 移除了大量不再需要的导出相关代码
 * 
 * @author 烟囱鸭
 * @date 2025-01-12
 * @version 2.1.0 - 简化版本
 */

// AE原生弹窗系统扩展名变量
var EXTENSION_NAME = '@Eagle2Ae';

/**
 * 全局配置对象
 * 包含弹窗的基本配置和样式设置
 */
var summaryDialogConfig = {
    // 弹窗基本配置
    dialog: {
        title: '@Eagle2Ae',  // 扩展名作为弹窗标题
        width: 500,
        height: 400,
        resizable: false
    },
    
    // 按钮配置
    buttons: {
        ok: '确定',
        close: '关闭'
    },
    
    // 样式配置
    styles: {
        titleHeight: 30,
        buttonHeight: 25,
        spacing: 10,
        groupSpacing: 15
    },
    
    // 图标配置（使用文本符号确保兼容性）
    icons: {
        materials: '[素材]',
        nonExportable: '[不可导出]',
        summary: '[总结]',
        design: '[设计]',
        video: '[视频]',
        image: '[图片]',
        audio: '[音频]',
        vector: '[矢量]',
        solid: '[纯色]',
        precomp: '[预合成]',
        text: '[文本]',
        shape: '[形状]',
        adjustment: '[调整]'
    }
};

/**
 * 显示图层检测总结弹窗（模态）
 * 简化版本：移除了导出和文件夹操作功能
 * @param {Array} detectionResults - 原始检测结果数组
 * @returns {boolean} 用户是否点击了确定按钮
 */
function showDetectionSummaryDialog(detectionResults) {
    try {
        // 参数验证
        if (!detectionResults || !Array.isArray(detectionResults)) {
            throw new Error('检测结果数据无效');
        }
        
        // 创建主对话框（模态）
        var dialog = new Window('dialog', summaryDialogConfig.dialog.title);
        dialog.orientation = 'column';
        dialog.alignChildren = 'fill';
        dialog.spacing = 5;
        dialog.margins = 8;
        
        // 设置对话框尺寸（紧凑版）
        dialog.preferredSize.width = 380;
        dialog.preferredSize.height = 280;
        
        // 生成三行总结信息
        var summaryLines = generateSummaryLines(detectionResults);
        
        // 添加三行总结
        var summaryPanel = dialog.add('panel');
        summaryPanel.orientation = 'column';
        summaryPanel.alignChildren = 'left';
        summaryPanel.spacing = 2;
        summaryPanel.margins = 6;
        
        for (var i = 0; i < summaryLines.length; i++) {
            var line = summaryPanel.add('statictext', undefined, summaryLines[i]);
            line.preferredSize.width = 360;
        }
        
        // 添加分隔线
        var separator = dialog.add('panel');
        separator.preferredSize.height = 1;
        
        // 添加滚动面板显示详细图层列表
        var scrollGroup = dialog.add('group');
        scrollGroup.orientation = 'column';
        scrollGroup.alignChildren = 'fill';
        scrollGroup.spacing = 3;
        
        var scrollPanel = scrollGroup.add('panel', undefined, '图层详情');
        scrollPanel.orientation = 'column';
        scrollPanel.alignChildren = 'fill';
        scrollPanel.spacing = 1;
        scrollPanel.margins = 6;
        scrollPanel.preferredSize.height = 120;
        
        // 添加图层列表
        addLayerDetailsList(scrollPanel, detectionResults);
        
        // 添加按钮组
        var buttonGroup = dialog.add('group');
        buttonGroup.orientation = 'row';
        buttonGroup.alignment = 'center';
        buttonGroup.spacing = 8;
        
        var okButton = buttonGroup.add('button', undefined, summaryDialogConfig.buttons.ok);
        var closeButton = buttonGroup.add('button', undefined, summaryDialogConfig.buttons.close);
        
        // 设置按钮尺寸（紧凑版）
        okButton.preferredSize.width = 70;
        okButton.preferredSize.height = 22;
        closeButton.preferredSize.width = 70;
        closeButton.preferredSize.height = 22;
        
        // 按钮事件处理
        var userChoice = false;
        
        okButton.onClick = function() {
            userChoice = true;
            dialog.close();
        };
        
        closeButton.onClick = function() {
            userChoice = false;
            dialog.close();
        };
        
        // 显示模态对话框
        dialog.show();
        
        return userChoice;
        
    } catch (error) {
        // 错误处理
        alert('显示检测总结弹窗时发生错误：' + error.message);
        return false;
    }
}

/**
 * 生成三行总结信息
 * @param {Array} detectionResults - 检测结果数组
 * @returns {Array} 三行总结文本数组
 */
function generateSummaryLines(detectionResults) {
    var stats = calculateLayerStatistics(detectionResults);
    
    var lines = [];
    
    // 第一行：可导出图层（使用▶符号装饰）
    var exportableLine = '▶ 可导出: ';
    var exportableParts = [];
    if (stats.otherLayers.text > 0) exportableParts.push('文本:' + stats.otherLayers.text);
    if (stats.otherLayers.shape > 0) exportableParts.push('形状:' + stats.otherLayers.shape);
    
    exportableLine += exportableParts.length > 0 ? exportableParts.join(', ') : '无';
    lines.push(exportableLine);
    
    // 第二行：不可导出（使用✖符号装饰）
    var nonExportableLine = '✖ 不可导出: ';
    var nonExportableParts = [];
    // 素材文件（全部不可导出）
    if (stats.materials.designs > 0) nonExportableParts.push('设计:' + stats.materials.designs);
    if (stats.materials.videos > 0) nonExportableParts.push('视频:' + stats.materials.videos);
    if (stats.materials.images > 0) nonExportableParts.push('图片:' + stats.materials.images);
    if (stats.materials.audios > 0) nonExportableParts.push('音频:' + stats.materials.audios);
    if (stats.materials.vectors > 0) nonExportableParts.push('矢量:' + stats.materials.vectors);
    // 其他不可导出图层
    if (stats.otherLayers.solid > 0) nonExportableParts.push('纯色:' + stats.otherLayers.solid);
    if (stats.otherLayers.precomp > 0) nonExportableParts.push('预合成:' + stats.otherLayers.precomp);
    if (stats.otherLayers.adjustment > 0) nonExportableParts.push('调整:' + stats.otherLayers.adjustment);
    
    nonExportableLine += nonExportableParts.length > 0 ? nonExportableParts.join(', ') : '无';
    lines.push(nonExportableLine);
    
    // 第三行：总结（使用●符号装饰）
    var summaryLine = '● 总结: 共检测 ' + stats.overall.totalLayers + ' 个图层，' + 
                     stats.overall.exportableLayers + ' 个可导出，' + 
                     stats.overall.nonExportableLayers + ' 个不可导出';
    lines.push(summaryLine);
    
    return lines;
}

/**
 * 添加图层详情列表
 * @param {Panel} parent - 父容器
 * @param {Array} detectionResults - 检测结果数组
 */
function addLayerDetailsList(parent, detectionResults) {
    // 创建滚动组
    var scrollGroup = parent.add('group');
    scrollGroup.orientation = 'column';
    scrollGroup.alignChildren = 'fill';
    scrollGroup.spacing = 1;
    
    // 按可导出状态分组显示
    var exportableLayers = [];
    var nonExportableLayers = [];
    
    for (var i = 0; i < detectionResults.length; i++) {
        var layer = detectionResults[i];
        if (layer.canExport) {
            exportableLayers.push(layer);
        } else {
            nonExportableLayers.push(layer);
        }
    }
    
    // 显示可导出图层（直接显示，不添加标题）
    if (exportableLayers.length > 0) {
        for (var j = 0; j < exportableLayers.length; j++) {
            addLayerRowWithButtons(scrollGroup, exportableLayers[j], true);
        }
    }
    
    // 显示不可导出图层（直接显示，不添加标题）
    if (nonExportableLayers.length > 0) {
        for (var k = 0; k < nonExportableLayers.length; k++) {
            addLayerRowWithButtons(scrollGroup, nonExportableLayers[k], false);
        }
    }
}

/**
 * 计算图层统计信息
 * @param {Array} detectionResults - 检测结果数组
 * @returns {Object} 统计信息对象
 */
function calculateLayerStatistics(detectionResults) {
    var stats = {
        overall: { totalLayers: 0, exportableLayers: 0, nonExportableLayers: 0 },
        materials: { designs: 0, videos: 0, images: 0, audios: 0, vectors: 0 },
        otherLayers: { solid: 0, precomp: 0, text: 0, shape: 0, adjustment: 0 }
    };
    
    for (var i = 0; i < detectionResults.length; i++) {
        var layer = detectionResults[i];
        stats.overall.totalLayers++;
        
        if (layer.canExport) {
            stats.overall.exportableLayers++;
            
            // 只有AE内部创建的图层才可导出
            if (layer.layerType) {
                switch (layer.layerType) {
                    case 'text':
                        stats.otherLayers.text++;
                        break;
                    case 'shape':
                        stats.otherLayers.shape++;
                        break;
                }
            }
        } else {
            stats.overall.nonExportableLayers++;
            
            // 统计素材类型（全部不可导出）
            if (layer.materialType) {
                switch (layer.materialType) {
                    case 'design':
                        stats.materials.designs++;
                        break;
                    case 'video':
                        stats.materials.videos++;
                        break;
                    case 'image':
                        stats.materials.images++;
                        break;
                    case 'audio':
                        stats.materials.audios++;
                        break;
                    case 'vector':
                        stats.materials.vectors++;
                        break;
                }
            }
            
            // 统计其他不可导出图层类型
            if (layer.layerType) {
                switch (layer.layerType) {
                    case 'solid':
                        stats.otherLayers.solid++;
                        break;
                    case 'precomp':
                        stats.otherLayers.precomp++;
                        break;
                    case 'adjustment':
                        stats.otherLayers.adjustment++;
                        break;
                }
            }
        }
    }
    
    return stats;
}

// 注意：getCurrentTimeString函数已移除，因为新版本使用符号装饰替代时间戳

/**
 * 格式化图层文本显示
 * @param {Object} layer - 图层对象
 * @param {boolean} canExport - 是否可导出
 * @returns {string} 格式化的图层文本
 */
function formatLayerText(layer, canExport) {
    var prefix = canExport ? '[√]' : '[×]';
    var category = getLayerCategory(layer);
    var fileName = layer.name || '未命名图层';
    
    // 添加文件扩展名（如果有的话）
    if (layer.source && layer.source.file && layer.source.file.name) {
        var sourceName = layer.source.file.name;
        var extension = sourceName.substring(sourceName.lastIndexOf('.'));
        if (extension && extension.length > 1) {
            fileName += extension;
        }
    }
    
    return prefix + '【' + category + '】' + fileName;
}

/**
 * 获取图层分类名称
 * @param {Object} layer - 图层对象
 * @returns {string} 分类名称
 */
function getLayerCategory(layer) {
    if (layer.materialType) {
        switch (layer.materialType) {
            case 'design': return '设计';
            case 'video': return '视频';
            case 'image': return '图片';
            case 'audio': return '音频';
            case 'vector': return '矢量';
            default: return '素材';
        }
    }
    
    if (layer.layerType) {
        switch (layer.layerType) {
            case 'solid': return '纯色';
            case 'precomp': return '合成';
            case 'text': return '文本';
            case 'shape': return '形状';
            case 'adjustment': return '调整';
            case 'camera': return '摄像机';
            case 'light': return '灯光';
            case 'null': return '空对象';
            default: return '其他';
        }
    }
    
    return '未知';
}

// 全局变量用于悬浮提示
var tooltipPanel = null;
var tooltipTimer = null;

/**
 * 添加图层行（简化版本，无按钮功能）
 * @param {Group} parent - 父容器
 * @param {Object} layer - 图层对象
 * @param {boolean} canExport - 是否可导出
 */
function addLayerRowWithButtons(parent, layer, canExport) {
    // 创建图层行容器
    var layerRow = parent.add('group');
    layerRow.orientation = 'row';
    layerRow.alignChildren = 'left';
    layerRow.spacing = 3;
    layerRow.preferredSize.width = 340;
    
    // 图层文本部分（占满整行，无按钮）
    var layerText = formatLayerText(layer, canExport);
    var layerLabel = layerRow.add('statictext', undefined, layerText);
    layerLabel.preferredSize.width = 330; // 紧凑版宽度
    
    // 添加悬浮提示功能
    addLayerTooltip(layerLabel, layer, canExport);
    
    // 移除所有按钮功能，简化界面
    // 原导出和文件夹按钮功能已移除
    // 文件夹打开功能已保存到独立的 folder-opener.js 文件中
}

// 以下函数已移除：
// - isDesignFile (已移除)
// - isMaterialFile (已移除) 
// - addExportButton (已移除)
// - addOpenFolderButton (已移除)
// - addExtensionButton (已移除)
// 
// 这些功能已被简化，导出和文件夹操作功能已独立保存到其他文件
// 文件夹打开功能保存在：folder-opener.js

/**
 * 为图层元素添加悬浮提示功能
 * @param {StaticText} element - 图层显示元素
 * @param {Object} layer - 图层对象
 * @param {boolean} canExport - 是否可导出
 */
function addLayerTooltip(element, layer, canExport) {
    try {
        // 添加调试日志
        var debugInfo = {
            layerName: layer.name,
            layerType: layer.type,
            hasTooltipInfo: !!(layer.tooltipInfo),
            hasSourceInfo: !!(layer.sourceInfo),
            tooltipInfoPath: layer.tooltipInfo ? layer.tooltipInfo.originalPath : 'null',
            sourceInfoPath: layer.sourceInfo ? layer.sourceInfo.originalPath : 'null'
        };
        
        // 在CEP环境中输出调试信息到控制台
        if (typeof console !== 'undefined' && console.log) {
            console.log('[JSX悬浮提示调试] 图层: ' + layer.name + ', 调试信息: ' + JSON.stringify(debugInfo));
        }
        
        // 生成悬浮提示文本
        var tooltipText = generateLayerTooltipText(layer, canExport);
        
        // 添加更多调试信息
        if (typeof console !== 'undefined' && console.log) {
            console.log('[JSX悬浮提示调试] 生成的提示文本: ' + tooltipText);
        }
        
        // 使用helpTip属性（ExtendScript原生支持）
        element.helpTip = tooltipText;
        
        // 添加点击事件显示详细信息（作为悬浮提示的补充）
        element.onClick = function() {
            showLayerDetailDialog(layer, canExport);
        };
        
        // 改变鼠标样式，提示可点击
        element.graphics = element.graphics || {};
        
    } catch (error) {
        // 输出错误信息
        if (typeof console !== 'undefined' && console.error) {
            console.error('[JSX悬浮提示错误] ' + (error.message || error));
        }
    }
}

/**
 * 显示图层详细信息对话框
 * @param {Object} layer - 图层对象
 * @param {boolean} canExport - 是否可导出
 */
function showLayerDetailDialog(layer, canExport) {
    try {
        var detailText = generateLayerTooltipText(layer, canExport);
        
        // 创建详细信息对话框（非模态）
        var detailDialog = new Window('window', '图层详细信息');
        detailDialog.orientation = 'column';
        detailDialog.alignChildren = 'fill';
        detailDialog.spacing = 10;
        detailDialog.margins = 16;
        
        // 设置窗口属性
        detailDialog.resizable = false;
        detailDialog.onClose = function() {
            return true;
        };
        
        // 添加详细信息文本
        var infoGroup = detailDialog.add('group');
        infoGroup.orientation = 'column';
        infoGroup.alignChildren = 'left';
        
        var lines = detailText.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].trim()) {
                var line = infoGroup.add('statictext', undefined, lines[i]);
                line.preferredSize.width = 400;
            }
        }
        
        // 添加关闭按钮
        var buttonGroup = detailDialog.add('group');
        buttonGroup.alignment = 'center';
        var closeBtn = buttonGroup.add('button', undefined, '关闭');
        closeBtn.preferredSize.width = 80;
        
        closeBtn.onClick = function() {
            detailDialog.close();
        };
        
        // 显示对话框
        detailDialog.show();
        
    } catch (error) {
        // 降级到简单alert
        alert('图层信息：\n' + generateLayerTooltipText(layer, canExport));
    }
}

/**
 * 生成图层悬浮提示文本
 * @param {Object} layer - 图层对象
 * @param {boolean} canExport - 是否可导出
 * @returns {string} 悬浮提示文本
 */
function generateLayerTooltipText(layer, canExport) {
    var tooltipLines = [];
    
    // 基本信息
    var category = getLayerCategory(layer);
    if (canExport) {
        if (layer.materialType === 'design') {
            tooltipLines.push('设计文件 - 可导出');
        } else {
            tooltipLines.push(category + ' - 可导出');
        }
    } else {
        tooltipLines.push(category + ' - 不可导出');
    }
    
    // 优先添加路径信息（素材图层必须显示路径）
    var pathAdded = false;
    
    // 检查tooltipInfo中的路径信息（Demo模式数据）
    if (layer.tooltipInfo && layer.tooltipInfo.originalPath) {
        tooltipLines.push('路径: ' + layer.tooltipInfo.originalPath);
        pathAdded = true;
        
        // 添加Demo模式的文件信息
        if (layer.tooltipInfo.fileSize) {
            tooltipLines.push('大小: ' + layer.tooltipInfo.fileSize);
        }
        if (layer.tooltipInfo.fileDate) {
            tooltipLines.push('修改时间: ' + layer.tooltipInfo.fileDate);
        }
        if (layer.tooltipInfo.dimensions) {
            tooltipLines.push('尺寸: ' + layer.tooltipInfo.dimensions);
        }
        if (layer.tooltipInfo.duration) {
            tooltipLines.push('时长: ' + layer.tooltipInfo.duration);
        }
    }
    
    // 检查sourceInfo中的路径信息
    if (!pathAdded && layer.sourceInfo && layer.sourceInfo.originalPath) {
        tooltipLines.push('路径: ' + layer.sourceInfo.originalPath);
        pathAdded = true;
        
        // 添加sourceInfo中的文件信息
        if (layer.sourceInfo.fileName) {
            tooltipLines.push('文件名: ' + layer.sourceInfo.fileName);
        }
        if (layer.sourceInfo.width && layer.sourceInfo.height) {
            tooltipLines.push('尺寸: ' + layer.sourceInfo.width + 'x' + layer.sourceInfo.height);
        }
        if (layer.sourceInfo.duration) {
            tooltipLines.push('时长: ' + layer.sourceInfo.duration);
        }
    }
    
    // 检查source.file中的路径信息
    if (!pathAdded && layer.source && layer.source.file) {
        var filePath = layer.source.file.fsName || layer.source.file.fullName;
        if (filePath) {
            tooltipLines.push('路径: ' + filePath);
            pathAdded = true;
        }
    }
    
    // 检查originalPath属性
    if (!pathAdded && layer.originalPath) {
        tooltipLines.push('路径: ' + layer.originalPath);
        pathAdded = true;
    }
    
    // 添加真实文件信息（非Demo模式）
    if (!layer.tooltipInfo && layer.source && layer.source.file) {
        var fileSize = getFileSize(layer.source.file);
        if (fileSize) {
            tooltipLines.push('大小: ' + fileSize);
        }
        
        var fileDate = getFileDate(layer.source.file);
        if (fileDate) {
            tooltipLines.push('修改时间: ' + fileDate);
        }
    }
    
    // 添加图层特定信息
    if (layer.layerType === 'text' && layer.textContent) {
        tooltipLines.push('文本内容: ' + layer.textContent.substring(0, 50) + (layer.textContent.length > 50 ? '...' : ''));
    }
    
    // 对于不可导出的图层，添加原因说明
    // 注意：移除pathAdded条件，确保总是显示导出原因
    if (!canExport && layer.reason) {
        // 如果没有找到路径信息，优先显示原因而不是路径
        if (!pathAdded) {
            // 对于素材图层，如果没有路径信息，显示"路径信息不可用"
            if (layer.type === 'MaterialLayer' || layer.type === 'VideoLayer' || layer.type === 'ImageLayer') {
                tooltipLines.push('路径: 路径信息不可用');
            }
        }
        tooltipLines.push('导出说明: ' + layer.reason);
    }
    
    return tooltipLines.join('\n');
}

// ==================== 导出功能相关辅助函数 ====================
// 以下导出相关功能已移除，简化代码：
// - padZero
// - sanitizeFileName  
// - createExportFolder
// - storeRenderQueue
// - restoreRenderQueue
// - validateOutputFile
// - analyzeLayerForExport
// - exportSingleLayerCore
// - exportSingleLayer
// 
// 这些功能在简化版本中不再需要

// ==================== 文件夹操作功能 ====================
// 文件夹打开功能已移动到独立文件：
// f:\\\u63d2件脚本开发\\eagle-extention\\exprot to ae\\Eagle2Ae-Ae\\jsx\\utils\\folder-opener.js
// 
// 如需使用文件夹打开功能，请引入该文件并调用：
// - openLayerFolder(layer)
// - openFolderByFilePath(filePath)
// - decodeStr(str)
// - openFolderWithJSX(folderPath)

/**
 * 格式化检测结果数据为总结数据（保持向后兼容）
 * @param {Array} detectionResults - 原始检测结果数组
 * @returns {Object} 格式化后的总结数据
 */
function formatDetectionSummary(detectionResults) {
    // 新版本直接返回检测结果，由弹窗内部处理
    // 保持此函数用于向后兼容
    return detectionResults || [];
}



// 导出主要函数供外部调用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showDetectionSummaryDialog: showDetectionSummaryDialog,
        formatDetectionSummary: formatDetectionSummary
    };
}