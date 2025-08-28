// Eagle2Ae - ExtendScript主机脚本 v2.1
// 处理After Effects的具体操作
// 更新: 修复中文文件名显示和序列帧识别

// 简单的测试函数，用于验证ExtendScript连接
function testExtendScriptConnection() {
    try {
        var resultObj = {
            success: true,
            message: "ExtendScript连接正常",
            timestamp: new Date().toString(),
            aeVersion: app.version,
            scriptVersion: "v2.1.1 - 强制中文文件名解码"
        };
        return JSON.stringify(resultObj);
    } catch (error) {
        var errorObj = {
            success: false,
            error: error.toString()
        };
        return JSON.stringify(errorObj);
    }
}

// 获取项目信息
function getProjectInfo() {
    try {
        var result = {
            projectPath: null,
            projectName: null,
            activeComp: null,
            isReady: false
        };
        
        // 检查是否有打开的项目
        if (app.project && app.project.file) {
            result.projectPath = app.project.file.fsName;
            result.projectName = app.project.file.name.replace(/\.aep$/, '');
            result.isReady = true;
            
            // 获取当前激活的合成
            if (app.project.activeItem && app.project.activeItem instanceof CompItem) {
                result.activeComp = {
                    name: app.project.activeItem.name,
                    id: app.project.activeItem.id,
                    width: app.project.activeItem.width,
                    height: app.project.activeItem.height,
                    duration: app.project.activeItem.duration,
                    frameRate: app.project.activeItem.frameRate
                };
            } else {
                // 确保activeComp有默认值，避免undefined
                result.activeComp = {
                    name: null,
                    id: null,
                    width: null,
                    height: null,
                    duration: null,
                    frameRate: null
                };
            }
        }
        
        return JSON.stringify(result);
        
    } catch (error) {
        return JSON.stringify({
            error: error.toString(),
            projectPath: null,
            projectName: null,
            activeComp: null,
            isReady: false
        });
    }
}

// 导入文件到AE
function importFiles(data) {
    try {
        var result = {
            success: false,
            importedCount: 0,
            error: null,
            targetComp: data.targetComp
        };
        
        // 检查是否有项目和合成
        if (!app.project) {
            result.error = "没有打开的项目";
            return JSON.stringify(result);
        }
        
        var targetComp = null;
        
        // 查找目标合成
        if (data.targetComp) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem && item.name == data.targetComp) {
                    targetComp = item;
                    break;
                }
            }
        }
        
        // 如果没有找到指定合成，使用当前激活的合成
        if (!targetComp && app.project.activeItem instanceof CompItem) {
            targetComp = app.project.activeItem;
        }
        
        // 如果还是没有合成，创建一个新的
        if (!targetComp) {
            targetComp = app.project.items.addComp("导入的合成", 1920, 1080, 1, 10, 30);
            result.targetComp = targetComp.name;
        }
        
        var importedFiles = [];
        var failedFiles = [];
        
        // 开始导入文件
        app.beginUndoGroup("Eagle2Ae - 导入文件");
        
        try {
            for (var i = 0; i < data.files.length; i++) {
                var fileData = data.files[i];
                var file = new File(fileData.path);
                
                if (!file.exists) {
                    failedFiles.push({
                        file: fileData.name,
                        error: "文件不存在"
                    });
                    continue;
                }
                
                try {
                    // 导入文件
                    var importOptions = new ImportOptions(file);
                    
                    // 根据文件类型设置导入选项
                    if (fileData.type === 'image') {
                        importOptions.importAs = ImportAsType.FOOTAGE;
                        // 对于图片序列，可以设置为COMP
                        if (isImageSequence(fileData.name)) {
                            importOptions.sequence = true;
                        }
                    } else if (fileData.type === 'video' || fileData.type === 'audio') {
                        importOptions.importAs = ImportAsType.FOOTAGE;
                    }
                    
                    var footage = app.project.importFile(importOptions);
                    
                    if (footage) {
                        // 添加到合成中
                        if (data.importOptions && data.importOptions.createLayers) {
                            var layer = targetComp.layers.add(footage);
                            
                            // 移除了顺序排列逻辑，简化为基本的时间轴放置
                            
                            // 设置图层名称
                            layer.name = fileData.name;
                        }
                        
                        importedFiles.push({
                            file: fileData.name,
                            footageName: footage.name
                        });
                        
                        result.importedCount++;
                    } else {
                        failedFiles.push({
                            file: fileData.name,
                            error: "导入失败"
                        });
                    }
                    
                } catch (fileError) {
                    failedFiles.push({
                        file: fileData.name,
                        error: fileError.toString()
                    });
                }
            }
            
            result.success = result.importedCount > 0;
            result.importedFiles = importedFiles;
            result.failedFiles = failedFiles;
            
            if (failedFiles.length > 0) {
                result.error = "部分文件导入失败: " + failedFiles.length + " 个";
            }
            
        } finally {
            app.endUndoGroup();
        }
        
        return JSON.stringify(result);
        
    } catch (error) {
        app.endUndoGroup();
        return JSON.stringify({
            success: false,
            importedCount: 0,
            error: error.toString(),
            targetComp: data.targetComp
        });
    }
}

// 导入文件到AE项目（增强版，支持设置）
function importFilesWithSettings(data) {
    var debugLog = [];

    try {
        debugLog.push("ExtendScript: importFilesWithSettings 开始");
        debugLog.push("ExtendScript: 接收到的数据: " + JSON.stringify(data));

        var result = {
            success: false,
            importedCount: 0,
            error: null,
            debug: debugLog,
            targetComp: null
        };

        if (!data || !data.files || data.files.length === 0) {
            result.error = "没有文件需要导入";
            debugLog.push("ExtendScript: 没有文件需要导入");
            return JSON.stringify(result);
        }

        debugLog.push("ExtendScript: 文件数量: " + data.files.length);
        debugLog.push("ExtendScript: 设置详情: " + JSON.stringify(data.settings));

        app.beginUndoGroup("Import from Eagle with Settings");

        var importedCount = 0;
        var project = app.project;
        var settings = data.settings || {};
        var projectInfo = data.projectInfo || {};

        // 详细的设置调试
        debugLog.push("ExtendScript: addToComposition = " + settings.addToComposition);
        debugLog.push("ExtendScript: timelineOptions = " + JSON.stringify(settings.timelineOptions));

        try {
            debugLog.push("ExtendScript: 项目: " + (project && project.file ? project.file.name : "未保存项目"));
            debugLog.push("ExtendScript: 活动项: " + (project && project.activeItem ? project.activeItem.name : "无"));
        } catch (debugError) {
            debugLog.push("ExtendScript: 获取项目信息时出错: " + debugError.toString());
        }

        // 创建文件夹结构（如果需要）
        var importFolder = null;
        try {
            if (settings.fileManagement && settings.fileManagement.createTagFolders) {
                importFolder = project.items.addFolder("Eagle Import - " + new Date().toLocaleString());
                debugLog.push("ExtendScript: 创建了导入文件夹");
            }
        } catch (folderError) {
            debugLog.push("ExtendScript: 创建文件夹时出错: " + folderError.toString());
        }

        for (var i = 0; i < data.files.length; i++) {
            var file = data.files[i];
            debugLog.push("ExtendScript: 处理文件 " + (i + 1) + ": " + file.name);
            debugLog.push("ExtendScript: 文件路径: " + file.importPath);

            try {
                // 检查文件是否存在
                var fileObj = new File(file.importPath);
                debugLog.push("ExtendScript: 文件存在检查: " + fileObj.exists);

                if (!fileObj.exists) {
                    debugLog.push("ExtendScript: 文件不存在，跳过: " + file.importPath);
                    continue;
                }

                // 导入文件
                debugLog.push("ExtendScript: 开始导入文件...");
                var importOptions = new ImportOptions(fileObj);
                var footageItem = project.importFile(importOptions);

                if (footageItem) {
                    importedCount++;
                    debugLog.push("ExtendScript: 文件导入成功: " + footageItem.name);

                    // 重命名项目项（如果需要）
                    if (file.name && file.name !== footageItem.name) {
                        footageItem.name = file.name;
                        debugLog.push("ExtendScript: 重命名为: " + file.name);
                    }

                    // 移动到文件夹（如果创建了文件夹）
                    if (importFolder) {
                        footageItem.parentFolder = importFolder;
                        debugLog.push("ExtendScript: 移动到导入文件夹");
                    }

                    // 添加到合成（如果设置了）
                    debugLog.push("ExtendScript: 检查合成添加条件 - addToComposition: " + settings.addToComposition);
                    debugLog.push("ExtendScript: project.activeItem: " + (project.activeItem ? project.activeItem.name : "无"));
                    debugLog.push("ExtendScript: activeItem类型: " + (project.activeItem ? project.activeItem.typeName : "无"));

                    if (settings.addToComposition && project.activeItem && project.activeItem instanceof CompItem) {
                        var comp = project.activeItem;
                        debugLog.push("ExtendScript: 开始添加到合成: " + comp.name);

                        try {
                            var layer = comp.layers.add(footageItem);
                            debugLog.push("ExtendScript: 成功添加到合成，层名: " + layer.name);

                            // 根据时间轴设置放置层（简化版）
                            if (settings.timelineOptions && settings.timelineOptions.enabled) {
                                debugLog.push("ExtendScript: 应用时间轴设置，placement: " + settings.timelineOptions.placement);
                                switch (settings.timelineOptions.placement) {
                                    case 'current_time':
                                        layer.startTime = comp.time;
                                        debugLog.push("ExtendScript: 放置在当前时间: " + comp.time);
                                        break;
                                    case 'timeline_start':
                                        layer.startTime = 0;
                                        debugLog.push("ExtendScript: 放置在时间轴开始: 0");
                                        break;
                                    default:
                                        debugLog.push("ExtendScript: 未知的placement设置: " + settings.timelineOptions.placement);
                                        break;
                                }
                            } else {
                                debugLog.push("ExtendScript: 时间轴选项未启用或不存在");
                            }
                        } catch (layerError) {
                            debugLog.push("ExtendScript: 添加到合成时出错: " + layerError.toString());
                        }
                    } else {
                        debugLog.push("ExtendScript: 未添加到合成 - addToComposition: " + settings.addToComposition +
                                    ", activeItem: " + (project.activeItem ? project.activeItem.name : "无") +
                                    ", 是否为CompItem: " + (project.activeItem instanceof CompItem));
                    }
                } else {
                    debugLog.push("ExtendScript: 文件导入失败，footageItem为null");
                }
            } catch (fileError) {
                debugLog.push("ExtendScript: 文件处理错误: " + fileError.toString());
                continue;
            }
        }

        app.endUndoGroup();

        result.success = true;
        result.importedCount = importedCount;
        result.debug = debugLog;
        
        // 设置目标合成名称
        if (settings.addToComposition && project.activeItem && project.activeItem instanceof CompItem) {
            result.targetComp = project.activeItem.name;
        } else {
            result.targetComp = "未知合成";
        }

        debugLog.push("ExtendScript: 导入完成，成功导入: " + importedCount + " 个文件");
        return JSON.stringify(result);

    } catch (error) {
        app.endUndoGroup();
        debugLog.push("ExtendScript: 全局错误: " + error.toString());
        return JSON.stringify({
            success: false,
            importedCount: 0,
            error: error.toString(),
            debug: debugLog
        });
    }
}

// 确保目录存在
function ensureDirectoryExists(dirPath) {
    try {
        // 解码和规范化路径
        var normalizedPath = decodeURIComponent(dirPath).replace(/\//g, File.fs === "Windows" ? "\\" : "/");
        var folder = new Folder(normalizedPath);

        if (!folder.exists) {
            var created = folder.create();
            return JSON.stringify({
                success: created,
                error: created ? null : "无法创建目录: " + normalizedPath,
                path: normalizedPath
            });
        }

        return JSON.stringify({
            success: true,
            error: null,
            path: normalizedPath,
            existed: true
        });
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            path: dirPath
        });
    }
}

// 复制文件
function copyFile(sourcePath, targetPath) {
    try {
        // 解码和规范化路径
        var normalizedSourcePath = decodeURIComponent(sourcePath).replace(/\//g, File.fs === "Windows" ? "\\" : "/");
        var normalizedTargetPath = decodeURIComponent(targetPath).replace(/\//g, File.fs === "Windows" ? "\\" : "/");

        var sourceFile = new File(normalizedSourcePath);
        var targetFile = new File(normalizedTargetPath);

        // 调试信息
        var debugInfo = "源路径: " + normalizedSourcePath + " | 目标路径: " + normalizedTargetPath + " | 源文件存在: " + sourceFile.exists;

        if (!sourceFile.exists) {
            return JSON.stringify({
                success: false,
                error: "源文件不存在: " + normalizedSourcePath,
                debug: debugInfo
            });
        }

        // 确保目标目录存在
        var targetFolder = targetFile.parent;
        if (!targetFolder.exists) {
            var created = targetFolder.create();
            if (!created) {
                return JSON.stringify({
                    success: false,
                    error: "无法创建目标目录: " + targetFolder.fsName,
                    debug: debugInfo
                });
            }
        }

        var copied = sourceFile.copy(targetFile);

        return JSON.stringify({
            success: copied,
            error: copied ? null : "文件复制失败",
            debug: debugInfo,
            sourceExists: sourceFile.exists,
            targetCreated: targetFile.exists
        });
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            sourcePath: sourcePath,
            targetPath: targetPath
        });
    }
}

// 检查是否为图片序列
function isImageSequence(filename) {
    // 简单的图片序列检测逻辑
    var sequencePattern = /\d{2,}\.(?:jpg|jpeg|png|tiff|tga|exr)$/i;
    return sequencePattern.test(filename);
}

// 获取支持的文件类型
function getSupportedFileTypes() {
    return JSON.stringify({
        image: ['jpg', 'jpeg', 'png', 'tiff', 'tga', 'bmp', 'gif', 'psd', 'ai', 'eps', 'pdf', 'exr', 'hdr'],
        video: ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'mxf', 'r3d', 'cinema'],
        audio: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'aiff'],
        project: ['aep', 'aet']
    });
}

// 创建新合成
function createComposition(name, width, height, duration, frameRate) {
    try {
        if (!app.project) {
            return JSON.stringify({
                success: false,
                error: "没有打开的项目"
            });
        }
        
        var comp = app.project.items.addComp(
            name || "新合成",
            width || 1920,
            height || 1080,
            1, // pixelAspect
            duration || 10,
            frameRate || 30
        );
        
        return JSON.stringify({
            success: true,
            comp: {
                name: comp.name,
                id: comp.id,
                width: comp.width,
                height: comp.height,
                duration: comp.duration,
                frameRate: comp.frameRate
            }
        });
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// 获取所有合成列表
function getCompositions() {
    try {
        var compositions = [];
        
        if (app.project) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem) {
                    compositions.push({
                        name: item.name,
                        id: item.id,
                        width: item.width,
                        height: item.height,
                        duration: item.duration,
                        frameRate: item.frameRate,
                        numLayers: item.numLayers
                    });
                }
            }
        }
        
        return JSON.stringify({
            success: true,
            compositions: compositions
        });
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            compositions: []
        });
    }
}

// 设置当前激活的合成
function setActiveComposition(compName) {
    try {
        if (!app.project) {
            return JSON.stringify({
                success: false,
                error: "没有打开的项目"
            });
        }

        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name === compName) {
                item.openInViewer();
                return JSON.stringify({
                    success: true,
                    activeComp: item.name
                });
            }
        }

        return JSON.stringify({
            success: false,
            error: "未找到指定的合成: " + compName
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// 监听项目变化事件
function setupProjectWatcher() {
    try {
        // 注册项目变化回调
        if (app.project) {
            // 这里可以添加项目变化监听逻辑
            // ExtendScript的事件系统有限，主要通过定期检查实现
        }

        return JSON.stringify({
            success: true,
            message: "项目监听器已设置"
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// 获取详细的项目状态
function getDetailedProjectStatus() {
    try {
        var result = {
            hasProject: false,
            projectInfo: null,
            compositions: [],
            activeComp: null,
            recentFiles: [],
            appInfo: {
                version: app.version,
                buildNumber: app.buildNumber,
                language: app.isoLanguage
            }
        };

        // 检查项目
        if (app.project && app.project.file) {
            result.hasProject = true;
            result.projectInfo = {
                path: app.project.file.fsName,
                name: app.project.file.name,
                saved: !app.project.dirty,
                numItems: app.project.numItems,
                displayStartTime: app.project.displayStartTime,
                workAreaStart: app.project.workAreaStart,
                workAreaDuration: app.project.workAreaDuration
            };

            // 获取所有合成
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem) {
                    var compInfo = {
                        name: item.name,
                        id: item.id,
                        width: item.width,
                        height: item.height,
                        duration: item.duration,
                        frameRate: item.frameRate,
                        numLayers: item.numLayers,
                        workAreaStart: item.workAreaStart,
                        workAreaDuration: item.workAreaDuration
                    };

                    result.compositions.push(compInfo);

                    // 检查是否为当前激活的合成
                    if (app.project.activeItem && app.project.activeItem.id === item.id) {
                        result.activeComp = compInfo;
                    }
                }
            }
        }

        return JSON.stringify(result);

    } catch (error) {
        return JSON.stringify({
            hasProject: false,
            error: error.toString()
        });
    }
}

// 图层检测函数（完整版本）
function detectSelectedLayers() {
    try {
        var result = {
            success: false,
            compName: null,
            selectedLayers: [],
            totalSelected: 0,
            exportableCount: 0,
            nonExportableCount: 0,
            logs: []
        };

        // 检查是否有激活的合成
        if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
            result.logs.push("❌ 没有激活的合成，请先选择一个合成");
            return JSON.stringify(result);
        }

        var comp = app.project.activeItem;
        result.compName = comp.name;
        result.logs.push("📋 合成名称: " + comp.name);

        // 获取选中的图层
        var selectedLayers = comp.selectedLayers;
        result.totalSelected = selectedLayers.length;

        if (selectedLayers.length === 0) {
            result.logs.push("⚠️ 没有选中任何图层，请先选择要检测的图层");
            return JSON.stringify(result);
        }

        result.logs.push("🔍 检测到 " + selectedLayers.length + " 个选中图层:");

        // 分析每个选中的图层
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var layerInfo = analyzeLayer(layer, i + 1);
            result.selectedLayers.push(layerInfo);

            if (layerInfo.exportable) {
                result.exportableCount++;
            } else {
                result.nonExportableCount++;
            }

            result.logs.push(layerInfo.logMessage);
        }

        result.logs.push("📊 检测结果: " + result.exportableCount + " 个可导出，" + result.nonExportableCount + " 个不可导出");
        result.success = true;

        return JSON.stringify(result);

    } catch (error) {
        var errorResult = {
            success: false,
            error: error.toString(),
            logs: ["❌ 检测过程出错: " + error.toString()]
        };
        return JSON.stringify(errorResult);
    }
}

// 分析单个图层
function analyzeLayer(layer, index) {
    var layerInfo = {
        index: index,
        name: layer.name,
        type: "Unknown",
        exportable: false,
        reason: "",
        logMessage: "",
        sourceInfo: null
    };

    try {
        // 检测图层类型
        if (layer instanceof AVLayer) {
            layerInfo.type = "AVLayer";

            // 检查源素材类型
            if (layer.source) {
                if (layer.source instanceof FootageItem) {
                    var mainSource = layer.source.mainSource;
                    if (mainSource instanceof SolidSource) {
                        layerInfo.type = "SolidLayer";
                        layerInfo.exportable = false;
                        layerInfo.reason = "纯色图层不支持导出";
                        layerInfo.sourceInfo = {
                            type: "Solid",
                            color: [mainSource.color.r, mainSource.color.g, mainSource.color.b],
                            width: layer.source.width,
                            height: layer.source.height
                        };
                    } else if (mainSource instanceof FileSource) {
                        layerInfo.type = "FootageLayer";

                        // 获取文件信息
                        var filePath = mainSource.file ? mainSource.file.fsName : "未知文件";
                        var fileName = mainSource.file ? mainSource.file.name : "未知文件";

                        // 解码中文文件名 - 强制解码 v2.1.1
                        var originalFileName = fileName;

                        // 直接手动解码常见中文字符（最可靠的方法）
                        fileName = fileName
                            .replace(/%E8%B6%8A/g, '越')
                            .replace(/%E5%8D%97/g, '南')
                            .replace(/%E5%9B%BD/g, '国')
                            .replace(/%E5%BA%86/g, '庆')
                            .replace(/%E8%8A%82/g, '节')
                            .replace(/%E5%8A%A8/g, '动')
                            .replace(/%E6%80%81/g, '态')
                            .replace(/%E5%A4%B4/g, '头')
                            .replace(/%E5%83%8F/g, '像')
                            .replace(/%E6%A1%86/g, '框')
                            .replace(/%EF%BC%88/g, '（')
                            .replace(/%EF%BC%89/g, '）')
                            .replace(/%E8%BE%93/g, '输')
                            .replace(/%E5%87%BA/g, '出')
                            .replace(/%E5%89%AF/g, '副')
                            .replace(/%E6%9C%AC/g, '本')
                            .replace(/%E4%B8%AD/g, '中')
                            .replace(/%E6%96%87/g, '文')
                            .replace(/%E5%9B%BE/g, '图')
                            .replace(/%E7%89%87/g, '片');

                        // 如果还有%编码，尝试标准解码
                        if (fileName.indexOf('%') !== -1) {
                            try {
                                fileName = decodeURIComponent(fileName);
                            } catch (e) {
                                // 解码失败，使用手动替换的结果
                            }
                        }

                        // 检测是否为序列帧
                        var isSequence = false;

                        // 检查文件名模式 - 常见的序列帧命名模式
                        var sequencePatterns = [
                            /_\d{5,}\./,           // _00000.png
                            /_\d{4,}\./,           // _0000.png
                            /\d{5,}\./,            // 00000.png
                            /\d{4,}\./,            // 0000.png
                            /_\d{4,}_/,            // _0000_
                            /\[\d+\]/,             // [0000]
                            /_frame_?\d+/i,        // _frame0000
                            /_seq_?\d+/i           // _seq0000
                        ];

                        for (var p = 0; p < sequencePatterns.length; p++) {
                            if (fileName.match(sequencePatterns[p])) {
                                isSequence = true;
                                break;
                            }
                        }

                        // 检查持续时间 - 如果持续时间大于1帧且不是视频格式，可能是序列帧
                        var videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv'];
                        var isVideoFile = false;
                        for (var v = 0; v < videoExtensions.length; v++) {
                            if (fileName.toLowerCase().indexOf(videoExtensions[v]) !== -1) {
                                isVideoFile = true;
                                break;
                            }
                        }

                        if (!isVideoFile && layer.source.duration > 1/24) {
                            isSequence = true;
                        }

                        if (isSequence) {
                            layerInfo.exportable = false;
                            layerInfo.reason = "序列帧暂不支持导出";
                            layerInfo.type = "SequenceLayer";
                        } else {
                            layerInfo.exportable = true;
                            layerInfo.reason = "图片素材，可以导出";
                        }

                        layerInfo.sourceInfo = {
                            type: "File",
                            file: filePath,
                            fileName: fileName,
                            width: layer.source.width,
                            height: layer.source.height,
                            duration: layer.source.duration,
                            isSequence: isSequence
                        };
                    } else {
                        layerInfo.exportable = false;
                        layerInfo.reason = "未知素材类型";
                    }
                } else if (layer.source instanceof CompItem) {
                    layerInfo.type = "PrecompLayer";
                    layerInfo.exportable = false;
                    layerInfo.reason = "预合成图层不支持导出";
                    layerInfo.sourceInfo = {
                        type: "Composition",
                        compName: layer.source.name,
                        width: layer.source.width,
                        height: layer.source.height,
                        duration: layer.source.duration
                    };
                } else {
                    layerInfo.exportable = false;
                    layerInfo.reason = "未知源类型";
                }
            } else {
                layerInfo.exportable = false;
                layerInfo.reason = "没有源素材";
            }
        } else if (layer instanceof ShapeLayer) {
            layerInfo.type = "ShapeLayer";
            layerInfo.exportable = true;
            layerInfo.reason = "形状图层，可以导出";
        } else if (layer instanceof TextLayer) {
            layerInfo.type = "TextLayer";
            layerInfo.exportable = true;
            layerInfo.reason = "文本图层，可以导出";
        } else if (layer instanceof CameraLayer) {
            layerInfo.type = "CameraLayer";
            layerInfo.exportable = false;
            layerInfo.reason = "摄像机图层不支持导出";
        } else if (layer instanceof LightLayer) {
            layerInfo.type = "LightLayer";
            layerInfo.exportable = false;
            layerInfo.reason = "灯光图层不支持导出";
        } else {
            // 检查是否为调整图层
            if (layer.adjustmentLayer) {
                layerInfo.type = "AdjustmentLayer";
                layerInfo.exportable = false;
                layerInfo.reason = "调整图层不支持导出";
            } else {
                layerInfo.exportable = false;
                layerInfo.reason = "未知图层类型";
            }
        }

        // 生成日志消息
        var statusIcon = layerInfo.exportable ? "✅" : "❌";
        var sourceText = "";
        if (layerInfo.sourceInfo) {
            if (layerInfo.sourceInfo.type === "File") {
                var fileName = layerInfo.sourceInfo.fileName || "未知文件";
                var dimensions = layerInfo.sourceInfo.width + "x" + layerInfo.sourceInfo.height;
                sourceText = " [" + fileName + " " + dimensions + "]";

                // 如果是序列帧，添加标识
                if (layerInfo.sourceInfo.isSequence) {
                    sourceText += " (序列帧)";
                }
            } else if (layerInfo.sourceInfo.type === "Solid") {
                sourceText = " [纯色:" + layerInfo.sourceInfo.width + "x" + layerInfo.sourceInfo.height + "]";
            } else if (layerInfo.sourceInfo.type === "Composition") {
                sourceText = " [预合成:" + layerInfo.sourceInfo.compName + "]";
            }
        }

        layerInfo.logMessage = statusIcon + " " + index + ". " + layer.name +
                              " (" + layerInfo.type + ")" + sourceText;

    } catch (error) {
        layerInfo.exportable = false;
        layerInfo.reason = "分析出错: " + error.toString();
        layerInfo.logMessage = "  ❌ " + index + ". " + layer.name + " - " + layerInfo.reason;
    }

    return layerInfo;
}

// 图层导出函数（完整版本）
function exportSelectedLayers(exportSettings) {
    try {
        var result = {
            success: false,
            compName: null,
            exportedLayers: [],
            exportPath: null,
            totalExported: 0,
            skippedCount: 0,
            logs: []
        };

        // 检查是否有激活的合成
        if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
            result.logs.push("❌ 没有激活的合成，请先选择一个合成");
            return JSON.stringify(result);
        }

        var comp = app.project.activeItem;
        result.compName = comp.name;
        result.logs.push("📋 开始导出合成: " + comp.name);

        // 获取选中的图层
        var selectedLayers = comp.selectedLayers;

        if (selectedLayers.length === 0) {
            result.logs.push("⚠️ 没有选中任何图层，请先选择要导出的图层");
            return JSON.stringify(result);
        }

        // 创建导出文件夹
        var exportFolder = createExportFolder(exportSettings);
        if (!exportFolder) {
            result.logs.push("❌ 无法创建导出文件夹");
            return JSON.stringify(result);
        }

        result.exportPath = exportFolder.fsName;
        result.logs.push("📁 导出路径: " + result.exportPath);

        // 分析并导出每个图层
        var exportableLayersInfo = [];
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var layerInfo = analyzeLayer(layer, i + 1);

            if (layerInfo.exportable) {
                exportableLayersInfo.push({
                    layer: layer,
                    info: layerInfo
                });
            } else {
                result.skippedCount++;
                result.logs.push("⏭️ 跳过: " + layer.name + " - " + layerInfo.reason);
            }
        }

        if (exportableLayersInfo.length === 0) {
            result.logs.push("❌ 没有可导出的图层");
            return JSON.stringify(result);
        }

        result.logs.push("🚀 开始导出 " + exportableLayersInfo.length + " 个图层...");

        // 导出每个可导出的图层
        for (var j = 0; j < exportableLayersInfo.length; j++) {
            var layerData = exportableLayersInfo[j];
            var exportResult = exportSingleLayer(layerData.layer, layerData.info, comp, exportFolder);

            if (exportResult.success) {
                result.exportedLayers.push(exportResult);
                result.totalExported++;
                result.logs.push("✅ 已导出: " + layerData.layer.name + " -> " + exportResult.fileName);
            } else {
                result.logs.push("❌ 导出失败: " + layerData.layer.name + " - " + exportResult.error);
            }
        }

        // 尝试复制所有文件到剪切板（使用优化的方法）
        if (result.exportedLayers.length > 0) {
            try {
                // 构建所有文件路径
                var filePaths = [];
                for (var k = 0; k < result.exportedLayers.length; k++) {
                    var filePath = exportFolder.fsName + "/" + result.exportedLayers[k].fileName;
                    var file = new File(filePath);
                    if (file.exists) {
                        filePaths.push(filePath.replace(/\\/g, "\\\\"));
                    }
                }

                if (filePaths.length > 0) {
                    // 使用C#程序复制文件到剪切板 - 使用正确的CEP扩展路径
                    var cepExtensionsPath = "C:\\Program Files (x86)\\Common Files\\Adobe\\CEP\\extensions\\Eagle2Ae";
                    var exePath = cepExtensionsPath + "\\CopyFilesToClipboard.exe";
                    var clipboardCmd = '"' + exePath + '" "' + exportPath + '"';

                    system.callSystem(clipboardCmd);
                    result.logs.push("📋 已将所有 " + filePaths.length + " 个文件复制到剪切板");
                    result.logs.push("💡 现在可以在任何地方按 Ctrl+V 粘贴所有文件");
                } else {
                    result.logs.push("⚠️ 没有找到可复制的文件");
                }
            } catch (clipError) {
                result.logs.push("⚠️ 无法复制到剪切板: " + clipError.toString());
            }
        }

        result.logs.push("🎉 导出完成! 共导出 " + result.totalExported + " 个图层，跳过 " + result.skippedCount + " 个");
        result.success = true;

        return JSON.stringify(result);

    } catch (error) {
        var errorResult = {
            success: false,
            error: error.toString(),
            logs: ["❌ 导出过程出错: " + error.toString()]
        };
        return JSON.stringify(errorResult);
    }
}

// 辅助函数：清理文件名（改进版本支持中文）
function sanitizeFileName(name) {
    if (!name) return "Untitled";

    var result = "";

    // 先处理中文字符和其他Unicode字符
    for (var i = 0; i < name.length; i++) {
        var currentChar = name.charAt(i);
        var code = name.charCodeAt(i);

        // 保留中文字符、英文字母、数字、下划线、连字符、空格、圆括号
        if ((code >= 0x4e00 && code <= 0x9fff) ||  // 中文字符
            (currentChar >= 'a' && currentChar <= 'z') ||         // 小写字母
            (currentChar >= 'A' && currentChar <= 'Z') ||         // 大写字母
            (currentChar >= '0' && currentChar <= '9') ||         // 数字
            currentChar == '_' || currentChar == '-' ||           // 下划线和连字符
            currentChar == ' ' ||                          // 空格
            currentChar == '(' || currentChar == ')') {           // 圆括号
            result += currentChar;
        } else {
            // 其他字符替换为下划线
            result += "_";
        }
    }

    // 清理连续的下划线和空格
    result = result.replace(/[_\s]+/g, '_');

    // 移除开头和结尾的下划线
    result = result.replace(/^_+|_+$/g, '');

    // 如果结果为空，使用默认名称
    if (result.length === 0) {
        result = "Untitled";
    }

    return result;
}

// 导入序列帧
function importSequence(data) {
    try {
        var result = {
            success: false,
            importedCount: 0,
            error: null
        };
        
        // 检查是否有项目
        if (!app.project) {
            result.error = "没有打开的项目";
            return JSON.stringify(result);
        }
        
        var targetComp = null;
        
        // 使用当前激活的合成
        if (app.project.activeItem instanceof CompItem) {
            targetComp = app.project.activeItem;
        } else {
            // 创建新合成
            targetComp = app.project.items.addComp("序列帧合成 - " + data.folder, 1920, 1080, 1, 10, 30);
        }
        
        app.beginUndoGroup("Eagle2Ae - 导入序列帧");
        
        try {
            // 创建导入文件夹
            var importFolder = app.project.items.addFolder("序列帧 - " + data.folder + " - " + new Date().toLocaleString());
            
            // 构造序列帧的第一个文件路径
            if (data.pattern && data.start !== undefined && data.folder) {
                // 从pattern中提取前缀和后缀
                var patternParts = data.pattern.split('[');
                var prefix = patternParts[0] || '';
                var suffix = '';
                if (patternParts.length > 1) {
                    var rangePart = patternParts[1].split(']');
                    if (rangePart.length > 1) {
                        suffix = rangePart[1] || '';
                    }
                }
                
                // 直接使用序列中的第一个文件名，而不是根据start构造
                var firstFileName = '';
                if (data.files && data.files.length > 0) {
                    firstFileName = data.files[0].name || data.files[0].path.split('/').pop().split('\\').pop();
                } else {
                    // 备用方案：根据start构造文件名
                    var paddedNumber = String(data.start);
                    // 根据模式确定数字位数（假设至少5位）
                    var numberLength = 5;
                    if (data.pattern) {
                        var numberMatch = data.pattern.match(/\[(\d+)-(\d+)\]/);
                        if (numberMatch) {
                            numberLength = Math.max(numberMatch[1].length, numberMatch[2].length);
                        }
                    }
                    while (paddedNumber.length < numberLength) {
                        paddedNumber = '0' + paddedNumber;
                    }
                    firstFileName = prefix + paddedNumber + suffix;
                }
                // 首先尝试使用传递的文件路径
                var firstFile = null;
                var firstFilePath = '';
                
                if (data.files && data.files.length > 0) {
                    // 优先使用传递的第一个文件路径
                    firstFilePath = data.files[0].path;
                    firstFile = new File(firstFilePath);
                }
                
                // 如果传递的路径不存在，尝试构造路径
                if (!firstFile || !firstFile.exists) {
                    firstFilePath = data.folder + '/' + firstFileName;
                    firstFile = new File(firstFilePath);
                    
                    // 尝试Windows路径分隔符
                    if (!firstFile.exists) {
                        firstFilePath = data.folder + '\\' + firstFileName;
                        firstFile = new File(firstFilePath);
                    }
                }
                
                if (firstFile.exists) {
                    var importOptions = new ImportOptions(firstFile);
                    importOptions.importAs = ImportAsType.FOOTAGE;
                    importOptions.sequence = true; // 作为序列帧导入
                    
                    var footage = app.project.importFile(importOptions);
                    
                    if (footage) {
                        // 设置到导入文件夹
                        footage.parentFolder = importFolder;
                        
                        // 添加到合成
                        var layer = targetComp.layers.add(footage);
                        layer.name = "序列帧 - " + data.folder.split('/').pop().split('\\').pop();
                        
                        result.success = true;
                        result.importedCount = 1;
                        result.targetComp = targetComp.name;
                    } else {
                        result.error = "序列帧导入失败";
                    }
                } else {
                    result.error = "序列帧文件不存在: " + firstFilePath;
                }
            } else if (data.files && data.files.length > 0) {
                // 备用方案：使用传递的第一个文件
                var firstFile = new File(data.files[0].path);
                
                if (firstFile.exists) {
                    var importOptions = new ImportOptions(firstFile);
                    importOptions.importAs = ImportAsType.FOOTAGE;
                    importOptions.sequence = true; // 作为序列帧导入
                    
                    var footage = app.project.importFile(importOptions);
                    
                    if (footage) {
                        // 设置到导入文件夹
                        footage.parentFolder = importFolder;
                        
                        // 添加到合成
                        var layer = targetComp.layers.add(footage);
                        layer.name = "序列帧 - " + data.folder;
                        
                        result.success = true;
                        result.importedCount = 1;
                        result.targetComp = targetComp.name;
                    } else {
                        result.error = "序列帧导入失败";
                    }
                } else {
                    result.error = "序列帧文件不存在: " + data.files[0].path;
                }
            } else {
                result.error = "没有序列帧文件或模式信息";
            }
            
        } finally {
            app.endUndoGroup();
        }
        
        return JSON.stringify(result);
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            importedCount: 0
        });
    }
}

// 导入文件夹
function importFolder(data) {
    try {
        var result = {
            success: false,
            importedCount: 0,
            error: null
        };
        
        // 检查是否有项目
        if (!app.project) {
            result.error = "没有打开的项目";
            return JSON.stringify(result);
        }
        
        var targetComp = null;
        
        // 使用当前激活的合成
        if (app.project.activeItem instanceof CompItem) {
            targetComp = app.project.activeItem;
        } else {
            // 创建新合成
            targetComp = app.project.items.addComp("文件夹合成 - " + data.path, 1920, 1080, 1, 10, 30);
        }
        
        app.beginUndoGroup("Eagle2Ae - 导入文件夹");
        
        try {
            // 创建导入文件夹
            var importFolder = app.project.items.addFolder("文件夹 - " + data.path + " - " + new Date().toLocaleString());
            
            var importedCount = 0;
            var failedFiles = [];
            
            // 逐个导入文件
            for (var i = 0; i < data.files.length; i++) {
                var fileData = data.files[i];
                var file = new File(fileData.path);
                
                if (!file.exists) {
                    failedFiles.push(fileData.name);
                    continue;
                }
                
                try {
                    var importOptions = new ImportOptions(file);
                    importOptions.importAs = ImportAsType.FOOTAGE;
                    
                    var footage = app.project.importFile(importOptions);
                    
                    if (footage) {
                        // 设置到导入文件夹
                        footage.parentFolder = importFolder;
                        
                        // 添加到合成
                        var layer = targetComp.layers.add(footage);
                        layer.name = fileData.name;
                        
                        // 按顺序排列图层
                        if (i > 0) {
                            layer.startTime = i * 0.5; // 每个文件间隔0.5秒
                        }
                        
                        importedCount++;
                    } else {
                        failedFiles.push(fileData.name);
                    }
                    
                } catch (fileError) {
                    failedFiles.push(fileData.name);
                }
            }
            
            result.success = importedCount > 0;
            result.importedCount = importedCount;
            result.targetComp = targetComp.name;
            
            if (failedFiles.length > 0) {
                result.error = "部分文件导入失败: " + failedFiles.join(", ");
            }
            
        } finally {
            app.endUndoGroup();
        }
        
        return JSON.stringify(result);
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            importedCount: 0
        });
    }
}

// 辅助函数：格式化时间字符串（ExtendScript兼容）
function padZero(num) {
    return (num < 10) ? "0" + num : String(num);
}

// 文件夹选择函数
function selectFolder(initialPath, title) {
    try {
        var dialogTitle = title || "选择文件夹";
        var selectedFolder = null;

        // 直接使用ExtendScript的Folder.selectDialog，但改进错误处理
        if (initialPath && initialPath !== '') {
            var initialFolder = new Folder(initialPath);
            if (initialFolder.exists) {
                selectedFolder = initialFolder.selectDlg(dialogTitle);
            } else {
                selectedFolder = Folder.selectDialog(dialogTitle);
            }
        } else {
            selectedFolder = Folder.selectDialog(dialogTitle);
        }

        if (selectedFolder && selectedFolder.exists) {
            return JSON.stringify({
                success: true,
                path: selectedFolder.fsName,
                cancelled: false
            });
        } else {
            // 用户取消选择或选择了无效路径
            return JSON.stringify({
                success: false,
                path: null,
                cancelled: true
            });
        }
    } catch (error) {
        return JSON.stringify({
            success: false,
            path: null,
            cancelled: true,
            error: error.toString()
        });
    }
}

// 创建导出文件夹
function createExportFolder(exportSettings) {
    try {
        var exportFolder;
        var timestamp = new Date();
        var timeStr = timestamp.getFullYear() +
                     padZero(timestamp.getMonth() + 1) +
                     padZero(timestamp.getDate()) + "_" +
                     padZero(timestamp.getHours()) +
                     padZero(timestamp.getMinutes()) +
                     padZero(timestamp.getSeconds());

        // 获取导出设置，如果没有传入则使用默认设置
        var settings = exportSettings && exportSettings.exportSettings ? exportSettings.exportSettings : null;
        var mode = settings ? settings.mode : 'project_adjacent';
        var addTimestamp = settings ? settings.addTimestamp : true;
        var addCompPrefix = settings ? settings.createSubfolders : false; // 重命名为更准确的变量名

        // 构建文件夹名称前缀
        var folderPrefix = '';

        // 添加时间戳前缀
        if (addTimestamp) {
            folderPrefix += timeStr + '_';
        }

        // 添加合成名前缀
        if (addCompPrefix && app.project.activeItem) {
            var compName = app.project.activeItem.name.replace(/[<>:"\/\\|?*]/g, '_');
            folderPrefix += compName + '_';
        }

        switch (mode) {
            case 'project_adjacent':
                // 导出到项目文件相邻的文件夹
                if (app.project.file) {
                    var projectFolder = app.project.file.parent;
                    var baseFolderName = settings && settings.projectAdjacentFolder ?
                        settings.projectAdjacentFolder : 'Export';
                    var folderName = folderPrefix + baseFolderName;
                    exportFolder = new Folder(projectFolder.fsName + "/" + folderName);
                } else {
                    // 如果项目未保存，回退到桌面
                    var folderName = folderPrefix + 'AE_Export';
                    exportFolder = new Folder(Folder.desktop.fsName + "/" + folderName);
                }
                break;

            case 'custom_folder':
                // 自定义文件夹 - 直接使用用户指定的路径，不创建子文件夹
                var customPath = settings && settings.customExportPath && settings.customExportPath.trim() !== '' ?
                    settings.customExportPath : Folder.desktop.fsName;

                // 对于自定义文件夹，如果有前缀，创建带前缀的子文件夹；否则直接使用指定路径
                if (folderPrefix && folderPrefix.trim() !== '') {
                    // 如果有时间戳或合成名前缀，创建子文件夹
                    var folderName = folderPrefix.replace(/_$/, ''); // 移除末尾的下划线
                    exportFolder = new Folder(customPath + "/" + folderName);
                } else {
                    // 没有前缀时，直接使用用户指定的路径
                    exportFolder = new Folder(customPath);
                }

                // 如果使用了默认桌面路径，添加提示信息
                if (!settings || !settings.customExportPath || settings.customExportPath.trim() === '') {
                    // 不抛出错误，而是记录警告信息
                    // 这样用户可以看到文件导出到了桌面，并知道需要设置自定义路径
                }
                break;

            case 'desktop':
                // 桌面导出
                var folderName = folderPrefix + 'AE_Export';
                exportFolder = new Folder(Folder.desktop.fsName + "/" + folderName);
                break;

            default:
                // 默认使用项目相邻模式
                var folderName = folderPrefix + 'temp_layer_export';
                if (app.project.file) {
                    exportFolder = new Folder(app.project.file.parent.fsName + "/" + folderName);
                } else {
                    exportFolder = new Folder(Folder.desktop.fsName + "/" + folderName);
                }
        }

        // 创建文件夹
        if (!exportFolder.exists) {
            if (!exportFolder.create()) {
                return null;
            }
        }

        return exportFolder;
    } catch (error) {
        return null;
    }
}

// 渲染队列状态管理函数（参考SVGA扩展实现）
function storeRenderQueue() {
    var checkeds = [];
    for (var p = 1; p <= app.project.renderQueue.numItems; p++) {
        if (app.project.renderQueue.item(p).status == RQItemStatus.RENDERING) {
            checkeds.push("rendering");
            break;
        }
        else if (app.project.renderQueue.item(p).status == RQItemStatus.QUEUED) {
            checkeds.push(p);
            app.project.renderQueue.item(p).render = false;
        }
    }
    return checkeds;
}

function restoreRenderQueue(checkedItems) {
    if (!checkedItems || checkedItems.length === 0) return;

    for (var q = 0; q < checkedItems.length; q++) {
        if (checkedItems[q] !== "rendering") {
            try {
                app.project.renderQueue.item(checkedItems[q]).render = true;
            } catch (e) {
                // 忽略恢复错误，可能项目已被删除
            }
        }
    }
}

// 导出单个图层
function exportSingleLayer(layer, layerInfo, originalComp, exportFolder) {
    var tempComp = null;
    var renderQueueItem = null;
    var renderQueueBackup = null;

    try {
        // 获取图层源素材尺寸（参考SVGA扩展实现）
        var layerWidth = originalComp.width;
        var layerHeight = originalComp.height;

        // 如果图层有源素材，使用源素材尺寸
        if (layer.source && layerInfo.sourceInfo) {
            layerWidth = Math.max(4, layerInfo.sourceInfo.width || originalComp.width);
            layerHeight = Math.max(4, layerInfo.sourceInfo.height || originalComp.height);
        }

        // 保存当前渲染队列状态
        renderQueueBackup = storeRenderQueue();

        // 保存当前渲染队列状态
        renderQueueBackup = storeRenderQueue();

        // 创建临时合成（完全按照SVGA扩展的方式）
        var compName = "temp_" + sanitizeFileName(layer.name);
        tempComp = app.project.items.addComp(compName, Math.max(4, layerWidth), Math.max(4, layerHeight), 1, 1, 1);

        // 按照SVGA扩展的方式添加源素材
        if (layer.source) {
            tempComp.layers.add(layer.source, 0);
            tempComp.layers.add(layer.source, 1);
            tempComp.layers[2].remove();
        } else {
            // 如果没有源素材，尝试复制图层
            layer.copyToComp(tempComp);
        }

        // 按照SVGA扩展的方式添加到渲染队列
        renderQueueItem = app.project.renderQueue.items.add(tempComp);
        renderQueueItem.render = true;

        // 按照SVGA扩展的方式设置PNG模板
        var outputModule = renderQueueItem.outputModule(1);
        var templateTemp = outputModule.templates;
        var setPNG = templateTemp[templateTemp.length - 1];
        outputModule.applyTemplate(setPNG);

        // 设置输出文件路径
        var fileName = sanitizeFileName(layer.name) + ".png";
        var outputFile = new File(exportFolder.fsName + "/" + fileName);
        outputModule.file = outputFile;

        // 按照SVGA扩展的方式执行渲染
        try {
            app.project.renderQueue.render();

            // 清理渲染队列项
            renderQueueItem.remove();

            // 恢复渲染队列状态
            if (renderQueueBackup) {
                restoreRenderQueue(renderQueueBackup);
            }

            // 清理临时合成
            tempComp.remove();

            // 按照SVGA扩展的方式处理文件重命名
            var sequenceFile = new File(outputFile.fsName + "00000");
            if (sequenceFile.exists) {
                sequenceFile.rename(fileName);
            }

            // 验证输出文件
            var validation = validateOutputFile(outputFile.fsName, layer.name);

            if (!validation.valid) {
                return {
                    success: false,
                    error: "输出验证失败: " + validation.error,
                    layerName: layer.name,
                    fileSize: validation.fileSize
                };
            }

            return {
                success: true,
                fileName: fileName,
                filePath: outputFile.fsName,
                fileSize: validation.fileSize,
                layerName: layer.name,
                layerWidth: layerWidth,
                layerHeight: layerHeight,
                validation: validation.message
            };

        } catch (renderError) {
            // 清理渲染队列项
            if (renderQueueItem) {
                try { renderQueueItem.remove(); } catch (e) {}
            }

            // 恢复渲染队列状态
            if (renderQueueBackup) {
                restoreRenderQueue(renderQueueBackup);
            }

            // 清理临时合成
            if (tempComp) tempComp.remove();

            return {
                success: false,
                error: "渲染失败: " + renderError.toString(),
                layerName: layer.name
            };
        }

    } catch (error) {
        // 完善的资源清理
        if (renderQueueItem) {
            try { renderQueueItem.remove(); } catch (e) {}
        }

        if (renderQueueBackup) {
            try { restoreRenderQueue(renderQueueBackup); } catch (e) {}
        }

        if (tempComp) {
            try { tempComp.remove(); } catch (e) {}
        }

        return {
            success: false,
            error: error.toString(),
            layerName: layer.name
        };
    }
}

// 验证输出文件
function validateOutputFile(filePath, layerName) {
    try {
        var file = new File(filePath);

        if (!file.exists) {
            return {
                valid: false,
                error: "文件不存在: " + filePath,
                fileSize: 0
            };
        }

        var fileSize = Math.round(file.length / 1024); // KB

        // 检查文件大小（PNG文件至少应该有几KB）
        if (fileSize < 1) {
            return {
                valid: false,
                error: "文件大小异常 (< 1KB)，可能导出失败",
                fileSize: fileSize
            };
        }

        // 检查文件扩展名
        var fileName = file.name.toLowerCase();
        if (!fileName.match(/\.png$/)) {
            return {
                valid: false,
                error: "文件格式错误，不是PNG格式",
                fileSize: fileSize
            };
        }

        return {
            valid: true,
            fileSize: fileSize,
            message: "文件验证成功"
        };

    } catch (error) {
        return {
            valid: false,
            error: "文件验证过程出错: " + error.toString(),
            fileSize: 0
        };
    }
}

// 获取当前选中的图层信息
function getSelectedLayers() {
    try {
        var result = {
            success: false,
            layers: [],
            compName: null
        };

        if (app.project.activeItem && app.project.activeItem instanceof CompItem) {
            var comp = app.project.activeItem;
            result.compName = comp.name;
            result.success = true;

            // 获取选中的图层
            for (var i = 1; i <= comp.numLayers; i++) {
                var layer = comp.layer(i);
                if (layer.selected) {
                    var layerInfo = {
                        name: layer.name,
                        index: layer.index,
                        startTime: layer.startTime,
                        inPoint: layer.inPoint,
                        outPoint: layer.outPoint,
                        enabled: layer.enabled,
                        locked: layer.locked,
                        shy: layer.shy,
                        solo: layer.solo
                    };

                    // 添加源信息（如果是素材图层）
                    if (layer.source) {
                        layerInfo.source = {
                            name: layer.source.name,
                            width: layer.source.width,
                            height: layer.source.height,
                            duration: layer.source.duration,
                            hasVideo: layer.source.hasVideo,
                            hasAudio: layer.source.hasAudio
                        };
                    }

                    result.layers.push(layerInfo);
                }
            }
        }

        return JSON.stringify(result);

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            layers: []
        });
    }
}



// 验证文件夹路径是否存在
function validateFolderPath(folderPath) {
    try {
        if (!folderPath || folderPath === "") {
            return JSON.stringify({
                success: false,
                exists: false,
                error: "路径为空"
            });
        }

        var folder = new Folder(folderPath);
        var exists = folder.exists;

        return JSON.stringify({
            success: true,
            exists: exists,
            path: folderPath,
            absolutePath: folder.absoluteURI
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            exists: false,
            error: error.toString()
        });
    }
}

// 创建文件夹结构来组织导入的文件
function createImportFolder(folderName) {
    try {
        if (!app.project) {
            return JSON.stringify({
                success: false,
                error: "没有打开的项目"
            });
        }

        // 检查文件夹是否已存在
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof FolderItem && item.name === folderName) {
                return JSON.stringify({
                    success: true,
                    folder: {
                        name: item.name,
                        id: item.id,
                        numItems: item.numItems
                    },
                    existed: true
                });
            }
        }

        // 创建新文件夹
        var folder = app.project.items.addFolder(folderName);

        return JSON.stringify({
            success: true,
            folder: {
                name: folder.name,
                id: folder.id,
                numItems: folder.numItems
            },
            existed: false
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString()
        });
    }
}

// 写入Base64数据到文件
function writeBase64ToFile(base64Data, targetPath) {
    try {
        // 创建文件对象
        var file = new File(targetPath);

        // 设置编码为二进制
        file.encoding = "BINARY";

        // 打开文件用于写入
        if (!file.open("w")) {
            return JSON.stringify({
                success: false,
                error: "无法打开文件进行写入: " + targetPath
            });
        }

        // 解码Base64数据
        var binaryData = decodeBase64(base64Data);

        // 写入二进制数据
        file.write(binaryData);

        // 关闭文件
        file.close();

        return JSON.stringify({
            success: true,
            path: targetPath
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: "写入文件失败: " + error.toString()
        });
    }
}

// 优化的Base64解码函数
function decodeBase64(base64) {
    // 使用ExtendScript内置的解码方法（如果可用）
    try {
        // 尝试使用更快的方法
        return decodeBase64Fast(base64);
    } catch (error) {
        // 回退到原始方法
        return decodeBase64Fallback(base64);
    }
}

// 快速Base64解码（使用查找表）
function decodeBase64Fast(base64) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var lookup = {};

    // 创建查找表
    for (var i = 0; i < chars.length; i++) {
        lookup[chars.charAt(i)] = i;
    }

    var result = "";
    var i = 0;

    // 移除非Base64字符
    base64 = base64.replace(/[^A-Za-z0-9+\/]/g, "");

    // 分块处理以提高性能
    var chunkSize = 1024;
    for (var start = 0; start < base64.length; start += chunkSize) {
        var chunk = base64.substring(start, Math.min(start + chunkSize, base64.length));
        result += decodeBase64Chunk(chunk, lookup);
    }

    return result;
}

// 解码单个块
function decodeBase64Chunk(chunk, lookup) {
    var result = "";
    var i = 0;

    while (i < chunk.length) {
        var encoded1 = lookup[chunk.charAt(i++)] || 0;
        var encoded2 = lookup[chunk.charAt(i++)] || 0;
        var encoded3 = lookup[chunk.charAt(i++)] || 0;
        var encoded4 = lookup[chunk.charAt(i++)] || 0;

        var bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;

        result += String.fromCharCode((bitmap >> 16) & 255);

        if (i - 2 < chunk.length) {
            result += String.fromCharCode((bitmap >> 8) & 255);
        }
        if (i - 1 < chunk.length) {
            result += String.fromCharCode(bitmap & 255);
        }
    }

    return result;
}

// 回退的Base64解码方法
function decodeBase64Fallback(base64) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var result = "";
    var i = 0;

    base64 = base64.replace(/[^A-Za-z0-9+\/]/g, "");

    while (i < base64.length) {
        var encoded1 = chars.indexOf(base64.charAt(i++));
        var encoded2 = chars.indexOf(base64.charAt(i++));
        var encoded3 = chars.indexOf(base64.charAt(i++));
        var encoded4 = chars.indexOf(base64.charAt(i++));

        var bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;

        result += String.fromCharCode((bitmap >> 16) & 255);

        if (encoded3 !== 64) {
            result += String.fromCharCode((bitmap >> 8) & 255);
        }
        if (encoded4 !== 64) {
            result += String.fromCharCode(bitmap & 255);
        }
    }

    return result;
}
