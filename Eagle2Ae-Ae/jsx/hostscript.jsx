// Eagle2Ae - ExtendScript主机脚本 v2.1
// 处理After Effects的具体操作
// 更新: 修复中文文件名显示和序列帧识别

// 引入对话框系统
#include "dialog-warning.jsx"
#include "dialog-summary.jsx"
// 引入文件夹打开工具（供CEP层调用 openFolderByFilePath 等）
#include "utils/folder-opener.js"

// Eagle连接状态检测函数
function checkEagleConnection() {
    try {
        var result = {
            success: false,
            connected: false,
            message: "",
            timestamp: new Date().toString()
        };
        
        // 这里需要通过CEP接口检查Eagle连接状态
        // 由于ExtendScript无法直接进行HTTP请求，
        // 我们返回一个标识，让CEP层处理连接检测
        result.success = true;
        result.message = "需要CEP层检查Eagle连接状态";
        
        return JSON.stringify(result);
    } catch (error) {
        var errorObj = {
            success: false,
            connected: false,
            error: error.toString(),
            message: "检查Eagle连接时发生错误"
        };
        return JSON.stringify(errorObj);
    }
}

// 导出到Eagle函数（带连接检测）
function exportToEagleWithConnectionCheck(exportSettings, connectionStatus) {
    try {
        var result = {
            success: false,
            message: "",
            needsConnectionCheck: false,
            canProceed: false
        };
        
        // 检查Eagle连接状态
        if (!connectionStatus || !connectionStatus.connected) {
            // Eagle未连接，显示警告对话框
            showPanelWarningDialog("Eagle连接检查", "请先连接Eagle");
            
            result.message = "Eagle未连接，操作已取消";
            result.needsConnectionCheck = true;
            result.canProceed = false;
            
            return JSON.stringify(result);
        }
        
        // Eagle已连接，可以继续导出
        result.success = true;
        result.message = "Eagle连接正常，可以继续导出";
        result.canProceed = true;
        
        // 调用原有的导出函数
        var exportResult = exportSelectedLayers(exportSettings);
        
        return exportResult;
        
    } catch (error) {
        var errorObj = {
            success: false,
            error: error.toString(),
            message: "导出到Eagle时发生错误",
            canProceed: false
        };
        return JSON.stringify(errorObj);
    }
}

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

// 处理文件路径中的Unicode字符
function sanitizeUnicodePath(filePath) {
    // 尝试不同的方法来处理Unicode字符问题
    try {
        // 方法1: 使用encodeURI
        var encodedPath = encodeURI(filePath);
        
        // 方法2: 如果encodeURI失败，尝试手动替换常见问题字符
        // 注意：这里我们不实际替换，只是记录可能的问题字符
        var problematicChars = /[^\x00-\x7F]/g; // 匹配非ASCII字符
        if (problematicChars.test(filePath)) {
            // 记录包含Unicode字符的路径，但不修改它
            return filePath; // 保持原路径，让AE自己处理
        }
        
        return filePath;
    } catch (e) {
        // 如果所有方法都失败，返回原始路径
        return filePath;
    }
}

// 导入文件到AE项目（增强版，支持设置）
function importFilesWithSettings(data) {
    var debugLog = [];

    try {
        debugLog.push("ExtendScript: importFilesWithSettings 开始");
        debugLog.push("ExtendScript: 接收到的数据: " + JSON.stringify(data));
        debugLog.push("ExtendScript: 数据对象结构检查 - data: " + (data ? "存在" : "不存在") + 
                      ", files: " + (data && data.files ? "存在" : "不存在") + 
                      ", settings: " + (data && data.settings ? "存在" : "不存在"));

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

        var project = app.project;
        var settings = data.settings || {};
        
        // 在开始导入前检查合成状态（JavaScript端已经检查过，这里只是双重保险）
        if (settings.addToComposition) {
            if (!project.activeItem || !(project.activeItem instanceof CompItem)) {
                debugLog.push("ExtendScript: 没有活动合成，停止导入过程");
                
                result.error = "没有活动合成，请先选择合成";
                result.success = false;
                result.debugLog = debugLog;
                return JSON.stringify(result);
            }
        }

        debugLog.push("ExtendScript: 文件数量: " + data.files.length);
        debugLog.push("ExtendScript: 设置详情: " + JSON.stringify(data.settings));

        app.beginUndoGroup("Import from Eagle with Settings");

        var importedCount = 0;
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

        debugLog.push("ExtendScript: 开始处理文件循环，总文件数: " + data.files.length);
        for (var i = 0; i < data.files.length; i++) {
            var file = data.files[i];
            debugLog.push("ExtendScript: 处理文件 " + (i + 1) + ": " + file.name);
            debugLog.push("ExtendScript: 文件路径: " + file.importPath);
            debugLog.push("ExtendScript: 文件对象详情 - name: " + file.name + ", importPath: " + file.importPath + ", processed: " + file.processed);

            try {
                // 检查文件是否存在
                var fileObj = new File(file.importPath);
                debugLog.push("ExtendScript: 文件存在检查: " + fileObj.exists);

                if (!fileObj.exists) {
                    debugLog.push("ExtendScript: 文件不存在，跳过: " + file.importPath);
                    continue;
                }

                // 在导入前先检查项目中是否已存在同名素材
                var footageItem = null;
                try {
                    debugLog.push("ExtendScript: 检查项目中是否已存在同名素材: " + file.name);
                    for (var itemIndex = 1; itemIndex <= project.numItems; itemIndex++) {
                        var item = project.item(itemIndex);
                        if (item instanceof FootageItem && item.name === file.name) {
                            footageItem = item;
                            debugLog.push("ExtendScript: 在项目中找到同名素材: " + item.name);
                            break;
                        }
                    }
                } catch (searchError) {
                    debugLog.push("ExtendScript: 搜索项目素材时出错: " + searchError.toString());
                }

                // 如果项目中没有同名素材，则尝试导入
                if (!footageItem) {
                    debugLog.push("ExtendScript: 开始导入文件...");
                    debugLog.push("ExtendScript: 文件对象路径: " + fileObj.fsName);
                    debugLog.push("ExtendScript: 文件对象存在性: " + fileObj.exists);
                    
                    try {
                        var importOptions = new ImportOptions(fileObj);
                        debugLog.push("ExtendScript: 创建导入选项成功");
                        
                        // 尝试不同的导入方法
                        try {
                            footageItem = project.importFile(importOptions);
                            debugLog.push("ExtendScript: 文件导入完成，footageItem: " + (footageItem ? "成功" : "失败"));
                        } catch (importError) {
                            debugLog.push("ExtendScript: 第一次导入尝试失败: " + importError.toString());
                            
                            // 尝试设置不同的导入选项
                            try {
                                importOptions.importAs = ImportAsType.FOOTAGE;
                                footageItem = project.importFile(importOptions);
                                debugLog.push("ExtendScript: 第二次导入尝试成功");
                            } catch (secondImportError) {
                                debugLog.push("ExtendScript: 第二次导入尝试也失败: " + secondImportError.toString());
                                debugLog.push("ExtendScript: 尽管导入失败，但仍将继续尝试处理已存在的素材");
                            }
                        }
                    } catch (importError) {
                        debugLog.push("ExtendScript: 文件导入异常: " + importError.toString());
                        debugLog.push("ExtendScript: 错误类型: " + importError.name);
                        debugLog.push("ExtendScript: 错误堆栈: " + importError.stack);
                        debugLog.push("ExtendScript: 尽管出现异常，但仍将继续处理");
                    }
                } else {
                    debugLog.push("ExtendScript: 使用项目中已存在的素材，跳过导入步骤");
                }

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
                    debugLog.push("ExtendScript: activeItem是否为CompItem: " + (project.activeItem instanceof CompItem));

                    if (settings.addToComposition) {
                        // 使用当前活动合成（已在函数开始时验证过）
                        var comp = project.activeItem;
                        debugLog.push("ExtendScript: 使用当前活动合成: " + comp.name);
                        debugLog.push("ExtendScript: 合成对象有效性检查: " + (comp && comp instanceof CompItem));
                        debugLog.push("ExtendScript: 合成图层数量: " + (comp ? comp.numLayers : "N/A"));
                        
                        // 添加到合成
                        if (comp) {
                            debugLog.push("ExtendScript: 开始添加到合成: " + comp.name);
                            debugLog.push("ExtendScript: 素材对象有效性检查: " + (footageItem && footageItem.name));
                            
                            try {
                                var layer = comp.layers.add(footageItem);
                                debugLog.push("ExtendScript: 成功添加到合成，层名: " + layer.name);
                                debugLog.push("ExtendScript: 新图层索引: " + layer.index);

                                // 根据时间轴设置放置层（简化版）
                                if (settings.timelineOptions && settings.timelineOptions.placement) {
                                    debugLog.push("ExtendScript: 应用时间轴设置，placement: " + settings.timelineOptions.placement);
                                    debugLog.push("ExtendScript: 合成当前时间: " + comp.time);
                                    debugLog.push("ExtendScript: 合成持续时间: " + comp.duration);
                                    switch (settings.timelineOptions.placement) {
                                        case 'current_time':
                                            var currentTime = comp.time;
                                            layer.startTime = currentTime;
                                            debugLog.push("ExtendScript: 放置在当前时间: " + currentTime);
                                            break;
                                        case 'timeline_start':
                                            layer.startTime = 0;
                                            debugLog.push("ExtendScript: 放置在时间轴开始: 0");
                                            break;
                                        default:
                                            debugLog.push("ExtendScript: 未知的placement设置: " + settings.timelineOptions.placement);
                                            break;
                                    }
                                    debugLog.push("ExtendScript: 图层起始时间设置后: " + layer.startTime);
                                } else {
                                    debugLog.push("ExtendScript: 时间轴选项不存在或placement未设置");
                                }
                            } catch (layerError) {
                                debugLog.push("ExtendScript: 添加到合成时出错: " + layerError.toString());
                                debugLog.push("ExtendScript: 错误堆栈: " + layerError.stack);
                            }
                        } else {
                            debugLog.push("ExtendScript: 合成对象为空，无法添加图层");
                        }
                    } else {
                        debugLog.push("ExtendScript: 未添加到合成 - addToComposition设置为false");
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
        debugLog.push("ExtendScript: 最终结果 - success: " + result.success + ", importedCount: " + result.importedCount);
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

// 递归复制文件夹
function copyFolder(sourceFolderPath, targetFolderPath) {
    try {
        // 解码和规范化路径
        var normalizedSourcePath = decodeURIComponent(sourceFolderPath).replace(/\//g, File.fs === "Windows" ? "\\" : "/");
        var normalizedTargetPath = decodeURIComponent(targetFolderPath).replace(/\//g, File.fs === "Windows" ? "\\" : "/");
        
        var sourceFolder = new Folder(normalizedSourcePath);
        var targetFolder = new Folder(normalizedTargetPath);
        
        if (!sourceFolder.exists) {
            return JSON.stringify({
                success: false,
                error: "源文件夹不存在: " + normalizedSourcePath
            });
        }
        
        // 创建目标文件夹
        if (!targetFolder.exists) {
            var created = targetFolder.create();
            if (!created) {
                return JSON.stringify({
                    success: false,
                    error: "无法创建目标文件夹: " + normalizedTargetPath
                });
            }
        }
        
        var copiedFiles = 0;
        var failedFiles = [];
        
        // 获取源文件夹中的所有文件和子文件夹
        var contents = sourceFolder.getFiles();
        
        for (var i = 0; i < contents.length; i++) {
            var item = contents[i];
            var itemName = item.name;
            var targetItemPath = normalizedTargetPath + (File.fs === "Windows" ? "\\" : "/") + itemName;
            
            if (item instanceof File) {
                // 复制文件
                var copyResult = copyFile(item.fsName, targetItemPath);
                var copyResultObj = JSON.parse(copyResult);
                
                if (copyResultObj.success) {
                    copiedFiles++;
                } else {
                    failedFiles.push({
                        file: itemName,
                        error: copyResultObj.error
                    });
                }
            } else if (item instanceof Folder) {
                // 递归复制子文件夹
                var subFolderResult = copyFolder(item.fsName, targetItemPath);
                var subFolderResultObj = JSON.parse(subFolderResult);
                
                if (subFolderResultObj.success) {
                    copiedFiles += subFolderResultObj.copiedFiles || 0;
                    if (subFolderResultObj.failedFiles && subFolderResultObj.failedFiles.length > 0) {
                        failedFiles = failedFiles.concat(subFolderResultObj.failedFiles);
                    }
                } else {
                    failedFiles.push({
                        file: itemName + " (文件夹)",
                        error: subFolderResultObj.error
                    });
                }
            }
        }
        
        return JSON.stringify({
            success: failedFiles.length === 0,
            copiedFiles: copiedFiles,
            failedFiles: failedFiles,
            error: failedFiles.length > 0 ? "部分文件复制失败" : null
        });
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            sourcePath: sourceFolderPath,
            targetPath: targetFolderPath
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
        // 新增素材分类系统 - 按类型细分
        materials: {
            design: ['psd', 'ai', 'sketch', 'xd', 'fig'], // 设计源文件
            image: ['jpg', 'jpeg', 'png', 'tiff', 'tga', 'bmp'], // 纯图片格式
            video: ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'mxf', 'r3d', 'cinema', 'm4v', '3gp', 'asf', 'dv', 'f4v', 'm2ts', 'mts', 'ogv', 'rm', 'rmvb', 'vob'],
            audio: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'aiff', 'ogg', 'wma'],
            animation: ['gif', 'webp'], // 动图素材
            vector: ['eps', 'svg'], // 矢量图形素材（AI移到design分类）
            raw: ['exr', 'hdr', 'dpx', 'cin'], // 原始格式素材
            document: ['pdf'] // 文档素材
        },
        // 保持向后兼容性 - 原有分类格式
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

/**
 * 处理合成选择对话框的CEP接口函数
 * @param {Object} config 对话框配置
 * @return {string} JSON格式的对话框结果
 */
function handleCompositionDialog(config) {
    try {
        var dialogConfig = config || {};
        var title = dialogConfig.title || "选择合成";
        var message = dialogConfig.message || "请选择一个合成：";
        
        var result = showCompositionSelectDialog(title, message);
        
        return JSON.stringify({
            success: true,
            dialogResult: result,
            timestamp: new Date().toString()
        });
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            dialogResult: null
        });
    }
}

/**
 * 获取最后一次对话框的结果（CEP接口）
 * @return {string} JSON格式的对话框结果
 */
function getLastDialogResultForCEP() {
    try {
        var result = getLastDialogResult();
        
        return JSON.stringify({
            success: true,
            dialogResult: result,
            timestamp: new Date().toString()
        });
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            dialogResult: null
        });
    }
}

/**
 * 显示自定义对话框（CEP接口）
 * @param {Object} config 对话框配置
 * @return {string} JSON格式的对话框结果
 */
function showCustomDialog(config) {
    try {
        var result = showDialog(config);
        
        return JSON.stringify({
            success: true,
            dialogResult: result,
            timestamp: new Date().toString()
        });
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            dialogResult: null
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

/**
 * 生成素材统计信息
 * @param {Array} selectedLayers - 检测到的图层信息数组
 * @returns {Object} 素材统计对象
 */
function generateMaterialStatistics(selectedLayers) {
    var stats = {
        // 素材类型统计
        design: 0,
        image: 0,
        video: 0,
        audio: 0,
        animation: 0,
        vector: 0,
        raw: 0,
        document: 0,
        sequence: 0,
        // 其他图层类型统计
        shape: 0,
        text: 0,
        solid: 0,
        precomp: 0,
        other: 0,
        // 总计
        totalMaterials: 0,
        totalLayers: selectedLayers.length,
        exportableCount: 0,
        // 新增分类统计
        designFiles: 0,
        materialFiles: 0,
        pathSummary: {} // 路径汇总
    };
    
    for (var i = 0; i < selectedLayers.length; i++) {
        var layer = selectedLayers[i];
        
        if (layer.exportable) {
            stats.exportableCount++;
        }
        
        // 统计素材类型
        if (layer.sourceInfo && layer.sourceInfo.materialType) {
            var materialType = layer.sourceInfo.materialType;
            if (stats.hasOwnProperty(materialType)) {
                stats[materialType]++;
                stats.totalMaterials++;
            } else {
                stats.other++;
            }
            
            // 分类统计
            if (layer.sourceInfo.categoryType === 'design') {
                stats.designFiles++;
            } else {
                stats.materialFiles++;
            }
            
            // 路径汇总（去重）
            if (layer.sourceInfo.originalPath) {
                var pathKey = layer.sourceInfo.originalPath;
                if (!stats.pathSummary[pathKey]) {
                    stats.pathSummary[pathKey] = {
                        path: pathKey,
                        fileName: layer.sourceInfo.fileName,
                        categoryType: layer.sourceInfo.categoryType,
                        materialType: materialType,
                        layers: []
                    };
                }
                stats.pathSummary[pathKey].layers.push(layer.name);
            }
        } else {
            // 根据图层类型统计
            switch (layer.type) {
                case 'ShapeLayer':
                    stats.shape++;
                    break;
                case 'TextLayer':
                    stats.text++;
                    break;
                case 'SolidLayer':
                    stats.solid++;
                    break;
                case 'PrecompLayer':
                    stats.precomp++;
                    break;
                case 'SequenceLayer':
                    stats.sequence++;
                    stats.totalMaterials++;
                    break;
                default:
                    stats.other++;
            }
        }
    }
    
    return stats;
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

        // 生成素材统计信息
        var materialStats = generateMaterialStatistics(result.selectedLayers);
        result.materialStats = materialStats;
        
        result.logs.push("📊 检测结果: " + result.exportableCount + " 个可导出，" + result.nonExportableCount + " 个不可导出");
        
        // 添加分类统计到日志
        if (materialStats.totalMaterials > 0) {
            result.logs.push("📦 素材统计: 共 " + materialStats.totalMaterials + " 个素材文件");
            result.logs.push("🎨 设计文件: " + materialStats.designFiles + " 个，📦 素材文件: " + materialStats.materialFiles + " 个");
            
            var statsDetails = [];
            if (materialStats.design > 0) statsDetails.push("设计:" + materialStats.design);
            if (materialStats.image > 0) statsDetails.push("图片:" + materialStats.image);
            if (materialStats.video > 0) statsDetails.push("视频:" + materialStats.video);
            if (materialStats.audio > 0) statsDetails.push("音频:" + materialStats.audio);
            if (materialStats.animation > 0) statsDetails.push("动图:" + materialStats.animation);
            if (materialStats.vector > 0) statsDetails.push("矢量:" + materialStats.vector);
            if (materialStats.raw > 0) statsDetails.push("原始:" + materialStats.raw);
            if (materialStats.document > 0) statsDetails.push("文档:" + materialStats.document);
            if (materialStats.sequence > 0) statsDetails.push("序列:" + materialStats.sequence);
            
            if (statsDetails.length > 0) {
                result.logs.push("📋 类型分布: " + statsDetails.join(", "));
            }
            
            // 添加路径汇总信息
            var pathCount = Object.keys(materialStats.pathSummary).length;
            if (pathCount > 0) {
                result.logs.push("📁 路径汇总: 共 " + pathCount + " 个不同路径");
            }
        }
        
        result.success = true;
        
        // 添加路径汇总导出功能
        result.pathSummaryAvailable = Object.keys(materialStats.pathSummary).length > 0;
        if (result.pathSummaryAvailable) {
            result.pathSummaryReport = generatePathSummaryReport(materialStats.pathSummary);
        }

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

                        // 获取文件扩展名用于素材类型识别
                        var fileExt = fileName.toLowerCase().split('.').pop() || '';
                        
                        // 定义素材类型分类 - 新增素材分类系统
                        var materialTypes = {
                            design: ['psd', 'ai', 'sketch', 'xd', 'fig'], // 设计源文件
                            image: ['jpg', 'jpeg', 'png', 'tiff', 'tga', 'bmp'], // 纯图片格式
                            video: ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'mxf', 'r3d', 'cinema', 'm4v', '3gp', 'asf', 'dv', 'f4v', 'm2ts', 'mts', 'ogv', 'rm', 'rmvb', 'vob'],
                            audio: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'aiff', 'ogg', 'wma'],
                            animation: ['gif', 'webp'], // 动图单独分类
                            vector: ['eps', 'svg'], // 矢量图形（AI移到design分类）
                            raw: ['exr', 'hdr', 'dpx', 'cin'], // 原始格式
                            document: ['pdf'] // 文档类型
                        };
                        
                        // 确定素材类型
                        var materialType = 'unknown';
                        var materialCategory = 'unknown';
                        
                        // 按优先级检查素材类型（设计文件优先级最高）
                        if (materialTypes.design.indexOf(fileExt) !== -1) {
                            materialType = 'design';
                            materialCategory = '设计文件';
                        } else if (materialTypes.animation.indexOf(fileExt) !== -1) {
                            materialType = 'animation';
                            materialCategory = '动图素材';
                        } else if (materialTypes.vector.indexOf(fileExt) !== -1) {
                            materialType = 'vector';
                            materialCategory = '矢量素材';
                        } else if (materialTypes.raw.indexOf(fileExt) !== -1) {
                            materialType = 'raw';
                            materialCategory = '原始格式素材';
                        } else if (materialTypes.video.indexOf(fileExt) !== -1) {
                            materialType = 'video';
                            materialCategory = '视频素材';
                        } else if (materialTypes.audio.indexOf(fileExt) !== -1) {
                            materialType = 'audio';
                            materialCategory = '音频素材';
                        } else if (materialTypes.image.indexOf(fileExt) !== -1) {
                            materialType = 'image';
                            materialCategory = '图片素材';
                        } else if (materialTypes.document.indexOf(fileExt) !== -1) {
                            materialType = 'document';
                            materialCategory = '文档素材';
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
                        var isVideoFile = (materialType === 'video');
                        if (!isVideoFile && layer.source.duration > 1/24) {
                            isSequence = true;
                        }

                        // 设置图层类型和导出状态
                        if (isSequence) {
                            layerInfo.exportable = false;
                            layerInfo.reason = "序列帧暂不支持导出";
                            layerInfo.type = "SequenceLayer";
                            materialType = 'sequence';
                            materialCategory = '序列帧素材';
                        } else {
                            // 统一标记为素材图层
                            layerInfo.type = "MaterialLayer";
                            
                            // 根据新的分类体系，区分设计文件和普通素材
                            if (materialType === 'design') {
                                // 设计文件可以导出
                                layerInfo.exportable = true;
                                layerInfo.reason = "设计文件，可以导出";
                            } else {
                                // 其他素材文件不可导出
                                layerInfo.exportable = false;
                                switch (materialType) {
                                    case 'video':
                                        layerInfo.reason = materialCategory + "，将导出第一帧";
                                        break;
                                    case 'audio':
                                        layerInfo.reason = materialCategory + "，素材文件不支持导出";
                                        break;
                                    case 'image':
                                    case 'animation':
                                    case 'vector':
                                    case 'raw':
                                    case 'document':
                                        layerInfo.reason = materialCategory + "，素材文件不支持导出";
                                        break;
                                    default:
                                        layerInfo.reason = "未知格式素材，不支持导出";
                                        materialCategory = '未知素材';
                                }
                            }
                        }

                        // 扩展sourceInfo，增加素材分类信息和原始路径
                        layerInfo.sourceInfo = {
                            type: "File",
                            file: filePath,
                            fileName: fileName,
                            originalPath: filePath, // 原始文件路径
                            width: layer.source.width,
                            height: layer.source.height,
                            duration: layer.source.duration,
                            isSequence: isSequence,
                            isVideo: isVideoFile,
                            // 新增素材分类信息
                            materialType: materialType,
                            materialCategory: materialCategory,
                            fileExtension: fileExt,
                            // 新增分类标识：区分素材和设计文件
                            categoryType: materialType === 'design' ? 'design' : 'material',
                            categoryDisplayName: materialType === 'design' ? '设计文件' : '素材文件'
                        };
                    } else {
                        layerInfo.exportable = false;
                        layerInfo.reason = "未知素材类型";
                    }
                } else if (layer.source instanceof CompItem) {
                    layerInfo.type = "PrecompLayer";
                    layerInfo.exportable = true;
                    layerInfo.reason = "预合成图层，可导出当前时间帧";
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
        
        // 检查图层是否有蒙版，对于某些类型的图层允许有蒙版
        try {
            if (layer.mask && layer.mask.numProperties > 0) {
                var maskCount = layer.mask.numProperties;
                
                // 对于素材图层（有源文件的图层），允许有蒙版导出
                // 因为蒙版通常不会严重影响素材的导出效果
                if (layerInfo.sourceInfo && layerInfo.sourceInfo.type === "File") {
                    // 素材图层有蒙版时仍然可以导出，但添加警告信息
                    layerInfo.type = layerInfo.type + "WithMask";
                    layerInfo.reason = layerInfo.reason + " (包含 " + maskCount + " 个蒙版，将尝试导出)";
                } else {
                    // 其他类型图层有蒙版时标记为不可导出
                    layerInfo.exportable = false;
                    layerInfo.reason = "包含蒙版的图层不支持导出 (蒙版数量: " + maskCount + ")";
                    layerInfo.type = layerInfo.type + "WithMask";
                }
            }
        } catch (maskError) {
            // 忽略蒙版检查错误，继续处理
        }

        // 生成日志消息
        var statusIcon = layerInfo.exportable ? "✅" : "❌";
        var sourceText = "";
        if (layerInfo.sourceInfo) {
            if (layerInfo.sourceInfo.type === "File") {
                var fileName = layerInfo.sourceInfo.fileName || "未知文件";
                var dimensions = layerInfo.sourceInfo.width + "x" + layerInfo.sourceInfo.height;
                var categoryIcon = layerInfo.sourceInfo.categoryType === 'design' ? '🎨' : '📦';
                sourceText = " [" + categoryIcon + fileName + " " + dimensions + "]";

                // 如果是序列帧，添加标识
                if (layerInfo.sourceInfo.isSequence) {
                    sourceText += " (序列帧)";
                }
                
                // 添加路径信息（用于悬浮提示）
                layerInfo.tooltipInfo = {
                    categoryType: layerInfo.sourceInfo.categoryType,
                    categoryDisplayName: layerInfo.sourceInfo.categoryDisplayName,
                    originalPath: layerInfo.sourceInfo.originalPath,
                    materialType: layerInfo.sourceInfo.materialType,
                    materialCategory: layerInfo.sourceInfo.materialCategory
                };
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
        var errorMsg = error && error.message ? error.message : "图层分析时发生未知错误";
        layerInfo.reason = "分析出错: " + errorMsg;
        layerInfo.logMessage = "  ❌ " + index + ". " + layer.name + " - " + layerInfo.reason;
    }

    return layerInfo;
}

// 图层导出函数（完整版本）
function exportSelectedLayers(exportSettings) {
    // 保存当前状态
    var originalActiveItem = null;
    var originalSelectedLayers = [];
    
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
        
        // 保存当前状态
        originalActiveItem = comp;
        try {
            // 保存当前选中的图层
            var selectedLayers = comp.selectedLayers;
            for (var s = 0; s < selectedLayers.length; s++) {
                originalSelectedLayers.push(selectedLayers[s]);
            }
            result.logs.push("💾 已保存当前合成和图层选择状态");
        } catch (saveError) {
            var errorMsg = saveError && saveError.message ? saveError.message : "保存状态时发生未知错误";
            result.logs.push("⚠️ 保存状态时出现警告: " + errorMsg);
        }
        
        result.compName = comp.name;
        result.logs.push("📋 开始导出: " + comp.name);

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
        
        // 调试信息：记录路径选择详情
        if (exportSettings && exportSettings.exportSettings) {
            var settings = exportSettings.exportSettings;
            result.logs.push("🔍 路径选择详情:");
            result.logs.push("  - 导出模式: " + (settings.mode || '未设置'));
            result.logs.push("  - 自定义路径: " + (settings.customExportPath || '未设置'));
            result.logs.push("  - 项目旁文件夹: " + (settings.projectAdjacentFolder || '未设置'));
            result.logs.push("  - 时间戳: " + (settings.addTimestamp ? '是' : '否'));
            result.logs.push("  - 子文件夹: " + (settings.createSubfolders ? '是' : '否'));
        }

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
            if (exportSettings && exportSettings.exportType === 'composition_frame' && (layerData.layer.source instanceof CompItem)) {
                result.logs.push("🧭 合成源：按当前时间帧导出");
            }
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
                    // 注释掉C#程序调用，避免乱码错误 - CopyFilesToClipboard.exe不存在
                    // var cepExtensionsPath = "C:\\Program Files (x86)\\Common Files\\Adobe\\CEP\\extensions\\Eagle2Ae";
                    // var exePath = cepExtensionsPath + "\\CopyFilesToClipboard.exe";
                    // var clipboardCmd = '"' + exePath + '" "' + result.exportPath + '"';
                    // system.callSystem(clipboardCmd);
                    
                    result.logs.push("📋 导出完成，文件路径: " + result.exportPath);
                    result.logs.push("💡 可通过扩展面板的复制功能将文件复制到剪切板");
                } else {
                    result.logs.push("⚠️ 没有找到可复制的文件");
                }
            } catch (clipError) {
                // 避免toString()可能产生的乱码，使用更安全的错误处理
                var errorMsg = clipError && clipError.message ? clipError.message : "未知错误";
                result.logs.push("⚠️ 无法复制到剪切板: " + errorMsg);
            }
        }

        result.logs.push("🎉 导出完成! 共导出 " + result.totalExported + " 个图层，跳过 " + result.skippedCount + " 个");
        result.success = true;

        // 恢复原始状态
        try {
            if (originalActiveItem) {
                // 恢复活动合成
                originalActiveItem.openInViewer();
                
                // 恢复图层选择
                if (originalSelectedLayers.length > 0) {
                    // 先取消所有选择
                    var currentLayers = originalActiveItem.selectedLayers;
                    for (var c = 0; c < currentLayers.length; c++) {
                        currentLayers[c].selected = false;
                    }
                    
                    // 重新选择原来的图层
                    for (var r = 0; r < originalSelectedLayers.length; r++) {
                        try {
                            originalSelectedLayers[r].selected = true;
                        } catch (layerError) {
                            // 图层可能已被删除，忽略错误
                        }
                    }
                }
                result.logs.push("🔄 已恢复到原始合成和图层选择状态");
            }
        } catch (restoreError) {
            var errorMsg = restoreError && restoreError.message ? restoreError.message : "恢复状态时发生未知错误";
            result.logs.push("⚠️ 恢复状态时出现警告: " + errorMsg);
        }

        return JSON.stringify(result);

    } catch (error) {
        // 即使出现错误也要尝试恢复状态
        try {
            if (originalActiveItem) {
                originalActiveItem.openInViewer();
                if (originalSelectedLayers.length > 0) {
                    var currentLayers = originalActiveItem.selectedLayers;
                    for (var c = 0; c < currentLayers.length; c++) {
                        currentLayers[c].selected = false;
                    }
                    for (var r = 0; r < originalSelectedLayers.length; r++) {
                        try {
                            originalSelectedLayers[r].selected = true;
                        } catch (layerError) {
                            // 忽略图层选择错误
                        }
                    }
                }
            }
        } catch (restoreError) {
            // 忽略恢复错误
        }
        
        // 避免toString()可能产生的乱码，使用更安全的错误处理
        var errorMsg = error && error.message ? error.message : "导出过程发生未知错误";
        var errorResult = {
            success: false,
            error: errorMsg,
            logs: ["❌ 导出过程出错: " + errorMsg, "🔄 已尝试恢复原始状态"]
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

/**
 * 新增函数：生成路径汇总清单
 * @param {Object} pathSummary - 路径汇总对象
 * @returns {String} 格式化的路径清单
 */
function generatePathSummaryReport(pathSummary) {
    var report = "\n=== 路径汇总清单 ===\n";
    var designPaths = [];
    var materialPaths = [];
    
    // 分类整理路径
    for (var path in pathSummary) {
        var pathInfo = pathSummary[path];
        if (pathInfo.categoryType === 'design') {
            designPaths.push(pathInfo);
        } else {
            materialPaths.push(pathInfo);
        }
    }
    
    // 设计文件路径
    if (designPaths.length > 0) {
        report += "\n【设计文件】(" + designPaths.length + "个路径):\n";
        for (var i = 0; i < designPaths.length; i++) {
            var info = designPaths[i];
            report += "🎨 " + info.fileName + "\n";
            report += "   路径: " + info.path + "\n";
            report += "   使用图层: " + info.layers.join(", ") + "\n\n";
        }
    }
    
    // 素材文件路径
    if (materialPaths.length > 0) {
        report += "\n【素材文件】(" + materialPaths.length + "个路径):\n";
        for (var j = 0; j < materialPaths.length; j++) {
            var info = materialPaths[j];
            var typeIcon = getTypeIcon(info.materialType);
            report += typeIcon + " " + info.fileName + "\n";
            report += "   路径: " + info.path + "\n";
            report += "   使用图层: " + info.layers.join(", ") + "\n\n";
        }
    }
    
    return report;
}

/**
 * 获取素材类型图标
 * @param {String} materialType - 素材类型
 * @returns {String} 对应图标
 */
function getTypeIcon(materialType) {
    var icons = {
        'image': '🖼️',
        'video': '🎬',
        'audio': '🎵',
        'animation': '🎞️',
        'vector': '📐',
        'raw': '🔬',
        'document': '📄',
        'sequence': '🎯'
    };
    return icons[materialType] || '📦';
}

/**
 * 新增函数：导出路径汇总到文件
 * @param {Object} pathSummary - 路径汇总对象
 * @returns {Object} 导出结果
 */
function exportPathSummary(pathSummary) {
    try {
        var result = {
            success: false,
            filePath: null,
            message: ""
        };
        
        // 生成报告内容
        var reportContent = generatePathSummaryReport(pathSummary);
        
        // 获取项目路径作为导出位置
        var projectPath = app.project.file ? app.project.file.parent.fsName : null;
        if (!projectPath) {
            result.message = "请先保存项目后再导出路径清单";
            return result;
        }
        
        // 生成文件名
        var timestamp = new Date();
        var fileName = "Eagle2Ae_路径汇总_" + 
                      timestamp.getFullYear() + 
                      String(timestamp.getMonth() + 1).padStart(2, '0') + 
                      String(timestamp.getDate()).padStart(2, '0') + "_" +
                      String(timestamp.getHours()).padStart(2, '0') + 
                      String(timestamp.getMinutes()).padStart(2, '0') + ".txt";
        
        var outputFile = new File(projectPath + "/" + fileName);
        
        // 写入文件
        outputFile.open("w");
        outputFile.encoding = "UTF-8";
        outputFile.write(reportContent);
        outputFile.close();
        
        result.success = true;
        result.filePath = outputFile.fsName;
        result.message = "路径汇总已导出到: " + fileName;
        
        return result;
        
    } catch (error) {
        return {
            success: false,
            filePath: null,
            message: "导出失败: " + error.toString()
        };
    }
}

/**
 * 显示图层检测总结弹窗（主机脚本接口）
 * @param {Object} params - 参数对象
 * @param {Array} params.detectionResults - 检测结果数组
 * @param {Object} params.summaryData - 总结数据（向后兼容）
 * @returns {string} JSON格式的结果
 */
function showLayerDetectionSummary(params) {
    try {
        var result = {
            success: false,
            userChoice: false,
            error: null
        };
        
        // 参数验证
        if (!params) {
            result.error = "缺少参数";
            return JSON.stringify(result);
        }
        
        // 兼容新旧参数格式
        var detectionResults;
        if (params.detectionResults) {
            // 新格式：直接传递检测结果数组
            detectionResults = params.detectionResults;
        } else if (params.summaryData) {
            // 旧格式：传递总结数据，需要转换
            detectionResults = convertSummaryDataToResults(params.summaryData);
        } else {
            result.error = "缺少检测结果数据";
            return JSON.stringify(result);
        }
        
        // 调用dialog-summary.jsx中的新弹窗函数
        var userChoice = showDetectionSummaryDialog(detectionResults);
        
        result.success = true;
        result.userChoice = userChoice;
        
        return JSON.stringify(result);
        
    } catch (error) {
        var errorResult = {
            success: false,
            userChoice: false,
            error: error.toString()
        };
        return JSON.stringify(errorResult);
    }
}

/**
 * 将旧格式的总结数据转换为检测结果数组（向后兼容）
 * @param {Object} summaryData - 旧格式的总结数据
 * @returns {Array} 检测结果数组
 */
function convertSummaryDataToResults(summaryData) {
    var results = [];
    
    // 这是一个简化的转换，实际使用中应该传递完整的检测结果
    // 这里只是为了保持向后兼容性
    if (summaryData.overall) {
        for (var i = 0; i < summaryData.overall.totalLayers; i++) {
            results.push({
                name: '图层 ' + (i + 1),
                canExport: i < summaryData.overall.exportableLayers,
                layerType: 'unknown',
                materialType: null
            });
        }
    }
    
    return results;
}

// 导入序列帧
function importSequence(data) {
    var debugLog = [];
    
    try {
        debugLog.push("ExtendScript: importSequence 开始");
        debugLog.push("ExtendScript: 接收到的数据: " + JSON.stringify(data));
        
        var result = {
            success: false,
            importedCount: 0,
            error: null,
            debug: debugLog,
            targetComp: null
        };
        
        // 检查是否有项目
        if (!app.project) {
            result.error = "没有打开的项目";
            debugLog.push("ExtendScript: 没有打开的项目");
            return JSON.stringify(result);
        }
        
        var project = app.project;
        var settings = data.settings || {};
        
        debugLog.push("ExtendScript: 设置详情: " + JSON.stringify(settings));
        debugLog.push("ExtendScript: 导入模式: " + settings.mode);
        debugLog.push("ExtendScript: addToComposition = " + settings.addToComposition);
        debugLog.push("ExtendScript: timelineOptions = " + JSON.stringify(settings.timelineOptions));
        
        var targetComp = null;
        
        // 根据导入行为设置决定目标合成
        if (settings.addToComposition) {
            if (project.activeItem instanceof CompItem) {
                targetComp = project.activeItem;
                debugLog.push("ExtendScript: 使用活动合成: " + targetComp.name);
            } else {
                result.error = "没有活动合成，请先选择或创建一个合成";
                debugLog.push("ExtendScript: 没有活动合成");
                return JSON.stringify(result);
            }
        } else {
            debugLog.push("ExtendScript: 设置为不添加到合成，仅导入到项目");
        }
        
        app.beginUndoGroup("Eagle2Ae - 导入序列帧");
        
        try {
            // 创建导入文件夹（根据设置）
            var importFolder = null;
            if (settings.fileManagement && settings.fileManagement.createTagFolders) {
                importFolder = project.items.addFolder("序列帧 - " + data.folder + " - " + new Date().toLocaleString());
                debugLog.push("ExtendScript: 创建了导入文件夹");
            }
            
            // 根据导入模式处理序列帧文件
            var processedSequencePath = null;
            var sequenceFolderName = data.folder.split('/').pop().split('\\').pop();
            
            debugLog.push("ExtendScript: 开始根据导入模式处理序列帧");
            debugLog.push("ExtendScript: 原始文件夹: " + data.folder);
            
            switch (settings.mode) {
                case 'direct':
                    debugLog.push("ExtendScript: 使用直接导入模式");
                    processedSequencePath = data.folder;
                    break;
                    
                case 'project_adjacent':
                    debugLog.push("ExtendScript: 使用项目旁复制模式");
                    if (!project.file) {
                        result.error = "项目未保存，无法使用项目旁复制模式";
                        debugLog.push("ExtendScript: 项目未保存");
                        return JSON.stringify(result);
                    }
                    
                    var projectDir = project.file.parent.fsName;
                    var targetFolder = settings.projectAdjacentFolder || 'Eagle_Assets';
                    var targetDir = projectDir + '\\' + targetFolder + '\\' + sequenceFolderName;
                    
                    debugLog.push("ExtendScript: 目标目录: " + targetDir);
                    
                    // 使用递归复制整个序列帧文件夹
                    var sourceFolderPath = data.folder; // 原始序列帧文件夹路径
                    debugLog.push("ExtendScript: 开始复制序列帧文件夹: " + sourceFolderPath + " -> " + targetDir);
                    
                    var copyFolderResult = copyFolder(sourceFolderPath, targetDir);
                    var copyFolderResultObj = JSON.parse(copyFolderResult);
                    
                    debugLog.push("ExtendScript: 文件夹复制结果: " + copyFolderResult);
                    
                    if (!copyFolderResultObj.success) {
                        result.error = "序列帧文件夹复制失败: " + copyFolderResultObj.error;
                        debugLog.push("ExtendScript: 序列帧文件夹复制失败，终止导入");
                        return JSON.stringify(result);
                    } else {
                        debugLog.push("ExtendScript: 成功复制了 " + copyFolderResultObj.copiedFiles + " 个序列帧文件");
                        if (copyFolderResultObj.failedFiles && copyFolderResultObj.failedFiles.length > 0) {
                            debugLog.push("ExtendScript: 部分文件复制失败: " + copyFolderResultObj.failedFiles.length + " 个");
                        }
                    }
                    
                    processedSequencePath = targetDir;
                    break;
                    
                case 'custom_folder':
                    debugLog.push("ExtendScript: 使用指定文件夹模式");
                    if (!settings.customFolderPath) {
                        result.error = "未设置自定义文件夹路径";
                        debugLog.push("ExtendScript: 未设置自定义文件夹路径");
                        return JSON.stringify(result);
                    }
                    
                    var customTargetDir = settings.customFolderPath + '\\' + sequenceFolderName;
                    debugLog.push("ExtendScript: 自定义目标目录: " + customTargetDir);
                    
                    // 使用递归复制整个序列帧文件夹到自定义目录
                    var sourceFolderPath2 = data.folder; // 原始序列帧文件夹路径
                    debugLog.push("ExtendScript: 开始复制序列帧文件夹到自定义目录: " + sourceFolderPath2 + " -> " + customTargetDir);
                    
                    var copyFolderResult2 = copyFolder(sourceFolderPath2, customTargetDir);
                    var copyFolderResultObj2 = JSON.parse(copyFolderResult2);
                    
                    debugLog.push("ExtendScript: 自定义文件夹复制结果: " + copyFolderResult2);
                    
                    if (!copyFolderResultObj2.success) {
                        result.error = "序列帧文件夹复制失败: " + copyFolderResultObj2.error;
                        debugLog.push("ExtendScript: 序列帧文件夹复制失败，终止导入");
                        return JSON.stringify(result);
                    } else {
                        debugLog.push("ExtendScript: 成功复制了 " + copyFolderResultObj2.copiedFiles + " 个序列帧文件到自定义文件夹");
                        if (copyFolderResultObj2.failedFiles && copyFolderResultObj2.failedFiles.length > 0) {
                            debugLog.push("ExtendScript: 部分文件复制失败: " + copyFolderResultObj2.failedFiles.length + " 个");
                        }
                    }
                    
                    processedSequencePath = customTargetDir;
                    break;
                    
                default:
                    debugLog.push("ExtendScript: 未知的导入模式，使用直接导入");
                    processedSequencePath = data.folder;
                    break;
            }
            
            debugLog.push("ExtendScript: 处理后的序列帧路径: " + processedSequencePath);
            
            // 构造序列帧的第一个文件路径
            if (data.pattern && data.start !== undefined && processedSequencePath) {
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
                // 根据导入模式，使用处理后的路径构造第一个文件路径
                var firstFile = null;
                var firstFilePath = '';
                
                // 对于直接导入模式，优先使用传递的文件路径
                if (settings.mode === 'direct' && data.files && data.files.length > 0) {
                    firstFilePath = data.files[0].path;
                    firstFile = new File(firstFilePath);
                    debugLog.push("ExtendScript: 直接导入模式，使用原始文件路径: " + firstFilePath);
                } else {
                    // 对于复制模式，使用处理后的路径和实际的第一个文件名构造文件路径
                    var actualFirstFileName = '';
                    if (data.files && data.files.length > 0) {
                        // 使用实际的第一个文件名，而不是构造的文件名
                        actualFirstFileName = data.files[0].name || data.files[0].path.split('/').pop().split('\\').pop();
                    } else {
                        // 如果没有文件列表，使用构造的文件名
                        actualFirstFileName = firstFileName;
                    }
                    
                    firstFilePath = processedSequencePath + '\\' + actualFirstFileName;
                    firstFile = new File(firstFilePath);
                    debugLog.push("ExtendScript: 复制模式，构造文件路径: " + firstFilePath + " (使用文件名: " + actualFirstFileName + ")");
                    
                    // 如果Windows路径分隔符不存在，尝试Unix路径分隔符
                    if (!firstFile.exists) {
                        firstFilePath = processedSequencePath + '/' + actualFirstFileName;
                        firstFile = new File(firstFilePath);
                        debugLog.push("ExtendScript: 尝试Unix路径分隔符: " + firstFilePath);
                    }
                }
                
                debugLog.push("ExtendScript: 第一个文件路径: " + firstFilePath);
                debugLog.push("ExtendScript: 文件是否存在: " + firstFile.exists);
                
                if (firstFile.exists) {
                    var importOptions = new ImportOptions(firstFile);
                    importOptions.importAs = ImportAsType.FOOTAGE;
                    importOptions.sequence = true; // 作为序列帧导入
                    
                    var footage = app.project.importFile(importOptions);
                    
                    if (footage) {
                        debugLog.push("ExtendScript: 序列帧导入成功: " + footage.name);
                        
                        // 重命名序列帧为文件夹名称
                        footage.name = sequenceFolderName;
                        debugLog.push("ExtendScript: 序列帧重命名为: " + footage.name);
                        
                        // 设置到导入文件夹
                        if (importFolder) {
                            footage.parentFolder = importFolder;
                            debugLog.push("ExtendScript: 移动到导入文件夹");
                        }
                        
                        // 根据设置决定是否添加到合成
                        if (settings.addToComposition && targetComp) {
                            debugLog.push("ExtendScript: 开始添加到合成: " + targetComp.name);
                            
                            var layer = targetComp.layers.add(footage);
                            layer.name = "序列帧 - " + sequenceFolderName;
                            debugLog.push("ExtendScript: 成功添加到合成，层名: " + layer.name);
                            
                            // 根据时间轴设置放置层
                            if (settings.timelineOptions && settings.timelineOptions.placement) {
                                debugLog.push("ExtendScript: 应用时间轴设置，placement: " + settings.timelineOptions.placement);
                                switch (settings.timelineOptions.placement) {
                                    case 'current_time':
                                        layer.startTime = targetComp.time;
                                        debugLog.push("ExtendScript: 放置在当前时间: " + targetComp.time);
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
                                debugLog.push("ExtendScript: 时间轴选项不存在或placement未设置");
                            }
                        } else {
                            debugLog.push("ExtendScript: 未添加到合成 - addToComposition: " + settings.addToComposition);
                        }
                        
                        result.success = true;
                        result.importedCount = 1;
                        result.targetComp = targetComp ? targetComp.name : null;
                    } else {
                        result.error = "序列帧导入失败";
                        debugLog.push("ExtendScript: 序列帧导入失败，footage为null");
                    }
                } else {
                    result.error = "序列帧文件不存在: " + firstFilePath;
                }
            } else if (data.files && data.files.length > 0) {
                // 备用方案：根据导入模式处理文件
                debugLog.push("ExtendScript: 使用备用方案，根据导入模式处理文件");
                
                var backupFirstFile = null;
                var backupFirstFilePath = '';
                
                if (settings.mode === 'direct') {
                    // 直接导入模式，使用原始文件路径
                    backupFirstFilePath = data.files[0].path;
                    backupFirstFile = new File(backupFirstFilePath);
                    debugLog.push("ExtendScript: 备用方案 - 直接导入模式，使用原始路径: " + backupFirstFilePath);
                } else {
                    // 复制模式，使用处理后的路径
                    var backupFileName = data.files[0].name || data.files[0].path.split('/').pop().split('\\').pop();
                    backupFirstFilePath = processedSequencePath + '\\' + backupFileName;
                    backupFirstFile = new File(backupFirstFilePath);
                    debugLog.push("ExtendScript: 备用方案 - 复制模式，构造路径: " + backupFirstFilePath + " (使用文件名: " + backupFileName + ")");
                    
                    // 如果Windows路径分隔符不存在，尝试Unix路径分隔符
                    if (!backupFirstFile.exists) {
                        backupFirstFilePath = processedSequencePath + '/' + backupFileName;
                        backupFirstFile = new File(backupFirstFilePath);
                        debugLog.push("ExtendScript: 备用方案 - 尝试Unix路径分隔符: " + backupFirstFilePath);
                    }
                }
                
                debugLog.push("ExtendScript: 备用方案文件路径: " + backupFirstFilePath);
                debugLog.push("ExtendScript: 备用方案文件是否存在: " + backupFirstFile.exists);
                
                if (backupFirstFile.exists) {
                    var importOptions = new ImportOptions(backupFirstFile);
                    importOptions.importAs = ImportAsType.FOOTAGE;
                    importOptions.sequence = true; // 作为序列帧导入
                    
                    var footage = app.project.importFile(importOptions);
                    
                    if (footage) {
                        debugLog.push("ExtendScript: 备用方案序列帧导入成功: " + footage.name);
                        
                        // 重命名序列帧为文件夹名称
                        footage.name = sequenceFolderName;
                        debugLog.push("ExtendScript: 序列帧重命名为: " + footage.name);
                        
                        // 设置到导入文件夹
                        if (importFolder) {
                            footage.parentFolder = importFolder;
                            debugLog.push("ExtendScript: 移动到导入文件夹");
                        }
                        
                        // 根据设置决定是否添加到合成
                        if (settings.addToComposition && targetComp) {
                            debugLog.push("ExtendScript: 开始添加到合成: " + targetComp.name);
                            
                            var layer = targetComp.layers.add(footage);
                            // 使用已计算的文件夹名称
                            var folderName = sequenceFolderName;
                            layer.name = "序列帧 - " + folderName;
                            debugLog.push("ExtendScript: 成功添加到合成，层名: " + layer.name);
                            
                            // 根据时间轴设置放置层
                            if (settings.timelineOptions && settings.timelineOptions.placement) {
                                debugLog.push("ExtendScript: 应用时间轴设置，placement: " + settings.timelineOptions.placement);
                                switch (settings.timelineOptions.placement) {
                                    case 'current_time':
                                        layer.startTime = targetComp.time;
                                        debugLog.push("ExtendScript: 放置在当前时间: " + targetComp.time);
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
                                debugLog.push("ExtendScript: 时间轴选项不存在或placement未设置");
                            }
                        } else {
                            debugLog.push("ExtendScript: 未添加到合成 - addToComposition: " + settings.addToComposition);
                        }
                        
                        result.success = true;
                        result.importedCount = 1;
                        result.targetComp = targetComp ? targetComp.name : null;
                    } else {
                        result.error = "序列帧导入失败";
                        debugLog.push("ExtendScript: 备用方案序列帧导入失败，footage为null");
                    }
                } else {
                    result.error = "序列帧文件不存在: " + backupFirstFilePath;
                }
            } else {
                result.error = "没有序列帧文件或模式信息";
            }
            
        } finally {
            app.endUndoGroup();
        }
        
        debugLog.push("ExtendScript: 序列帧导入完成，成功导入: " + result.importedCount + " 个序列帧");
        result.debug = debugLog;
        return JSON.stringify(result);
        
    } catch (error) {
        app.endUndoGroup();
        debugLog.push("ExtendScript: 全局错误: " + error.toString());
        return JSON.stringify({
            success: false,
            error: error.toString(),
            importedCount: 0,
            debug: debugLog
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
        var addTimestamp = settings ? settings.addTimestamp : false; // 默认不添加时间戳
        var addCompPrefix = settings ? settings.createSubfolders : false; // 重命名为更准确的变量名
        
        // 调试日志：记录导出设置
        if (settings) {
            // 这里可以添加调试信息，但ExtendScript的console.log可能不可用
            // 所以我们将信息添加到返回的日志中
        }

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
                // 桌面导出 - 优先使用自定义路径，如果没有则使用桌面
                var customPath = settings && settings.customExportPath && settings.customExportPath.trim() !== '' ?
                    settings.customExportPath : Folder.desktop.fsName;
                var folderName = folderPrefix + 'AE_Export';
                exportFolder = new Folder(customPath + "/" + folderName);
                // 调试信息：记录路径选择
                if (settings && settings.customExportPath && settings.customExportPath.trim() !== '') {
                    // 将在调用处记录这个信息
                }
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
            var newLayer = tempComp.layers.add(layer.source, 0);
            tempComp.layers.add(layer.source, 1);
            tempComp.layers[2].remove();
            
            // 如果是视频文件，确保导出第一帧
            if (layerInfo.sourceInfo && layerInfo.sourceInfo.isVideo) {
                // 设置图层时间为0，确保显示第一帧
                newLayer.startTime = 0;
                newLayer.inPoint = 0;
                newLayer.outPoint = 1/24; // 设置为一帧的持续时间
                // 设置合成时间为0，确保渲染第一帧
                tempComp.time = 0;
            } else if (layer.source instanceof CompItem) {
                // 如果源是合成，则使用原始合成当前时间进行导出当前时间帧
                try {
                    var currentTime = originalComp && originalComp.time ? originalComp.time : 0;
                    tempComp.time = currentTime;
                } catch (timeErr) {
                    // 回退到0帧
                    tempComp.time = 0;
                }
            }
        } else {
            // 如果没有源素材，尝试复制图层
            var copiedLayer = layer.copyToComp(tempComp);
            
            // 如果是视频文件，确保导出第一帧
            if (layerInfo.sourceInfo && layerInfo.sourceInfo.isVideo && copiedLayer) {
                copiedLayer.startTime = 0;
                copiedLayer.inPoint = 0;
                copiedLayer.outPoint = 1/24;
                tempComp.time = 0;
            }
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
        var outputFilePath = exportFolder.fsName + "/" + fileName;
        var outputFile = new File(outputFilePath);
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
            var sequenceFilePath = outputFile.fsName + "00000";
            var sequenceFile = new File(sequenceFilePath);
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

/**
 * 打开文件所在文件夹（旧版本，使用app.system方法）
 * @param {Object} params - 参数对象
 * @param {string} params.folderPath - 文件夹路径
 * @returns {string} JSON格式的结果
 */
function openFileFolder(params) {
    try {
        var folderPath = params.folderPath;
        
        if (!folderPath) {
            return JSON.stringify({
                success: false,
                error: '文件夹路径不能为空'
            });
        }
        
        // 验证文件夹是否存在
        var folder = new Folder(folderPath);
        if (!folder.exists) {
            return JSON.stringify({
                success: false,
                error: '文件夹不存在: ' + folderPath
            });
        }
        
        // 构造系统命令
        var openCommand = '';
        var osName = $.os.toLowerCase();
        
        if (osName.indexOf('windows') !== -1) {
            // Windows系统
            openCommand = 'explorer "' + folderPath + '"';
        } else if (osName.indexOf('mac') !== -1) {
            // Mac系统
            openCommand = 'open "' + folderPath + '"';
        } else {
            // Linux系统
            openCommand = 'xdg-open "' + folderPath + '"';
        }
        
        if (openCommand) {
            try {
                // 使用app.system执行系统命令
                var result = app.system(openCommand);
                
                if (result === 0) {
                    return JSON.stringify({
                        success: true,
                        message: '文件夹已打开: ' + folderPath
                    });
                } else {
                    throw new Error('系统命令执行失败，返回码: ' + result);
                }
            } catch (sysError) {
                // 如果系统命令失败，尝试其他方法
                try {
                    // 尝试使用File对象的execute方法
                    if (osName.indexOf('windows') !== -1) {
                        var explorerFile = new File('C:\\Windows\\explorer.exe');
                        if (explorerFile.exists) {
                            explorerFile.execute(folderPath);
                            return JSON.stringify({
                                success: true,
                                message: '文件夹已打开: ' + folderPath
                            });
                        }
                    }
                    
                    // 如果都失败了，返回错误
                    throw new Error('无法执行打开文件夹命令');
                    
                } catch (altError) {
                    return JSON.stringify({
                        success: false,
                        error: '无法打开文件夹: ' + altError.toString(),
                        folderPath: folderPath
                    });
                }
            }
        } else {
            return JSON.stringify({
                success: false,
                error: '不支持的操作系统: ' + osName,
                folderPath: folderPath
            });
        }
        
    } catch (error) {
        return JSON.stringify({
            success: false,
            error: '打开文件夹时发生错误: ' + error.toString()
        });
    }
}

/**
 * 通过CEP API打开文件所在文件夹（新版本，更可靠）
 * @param {Object} params - 参数对象
 * @param {string} params.folderPath - 文件夹路径
 * @returns {string} JSON格式的结果
 */
function openFolderViaCEP(params) {
    try {
        var folderPath = params.folderPath;
        
        // 调试日志：记录输入参数
        $.writeln('[DEBUG] openFolderViaCEP 调用，参数: ' + JSON.stringify(params));
        
        if (!folderPath) {
            $.writeln('[ERROR] 文件夹路径为空');
            return JSON.stringify({
                success: false,
                error: '文件夹路径不能为空'
            });
        }
        
        $.writeln('[DEBUG] 检查文件夹是否存在: ' + folderPath);
        
        // 验证文件夹是否存在
        var folder = new Folder(folderPath);
        if (!folder.exists) {
            $.writeln('[ERROR] 文件夹不存在: ' + folderPath);
            return JSON.stringify({
                success: false,
                error: '文件夹不存在: ' + folderPath
            });
        }
        
        $.writeln('[DEBUG] 文件夹存在，准备通过CEP调用JavaScript端');
        
        // 通过CSInterface调用JavaScript端的openFolder函数
        try {
            // 检查CSInterface是否可用
            if (typeof CSInterface === 'undefined') {
                $.writeln('[ERROR] CSInterface未定义');
                return JSON.stringify({
                    success: false,
                    error: 'CSInterface不可用',
                    folderPath: folderPath
                });
            }
            
            $.writeln('[DEBUG] CSInterface可用，创建实例');
            var csInterface = new CSInterface();
            
            // 构造JavaScript代码，调用main.js中的openFolder函数
            var escapedPath = folderPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            var jsCode = 'try {' +
                         '    console.log("[DEBUG] 检查 window.aeExtension:", typeof window.aeExtension);' +
                         '    if (window.aeExtension) {' +
                         '        console.log("[DEBUG] aeExtension.openFolder 类型:", typeof window.aeExtension.openFolder);' +
                         '    }' +
                         '    if (window.aeExtension && typeof window.aeExtension.openFolder === "function") {' +
                         '        console.log("[DEBUG] 调用 aeExtension.openFolder，路径: ' + escapedPath + '");' +
                         '        window.aeExtension.openFolder("' + escapedPath + '");' +
                         '        "success";' +
                         '    } else {' +
                         '        console.log("[ERROR] window.aeExtension.openFolder 不可用");' +
                         '        console.log("[DEBUG] window.aeExtension:", window.aeExtension);' +
                         '        "function_not_available";' +
                         '    }' +
                         '} catch (e) {' +
                         '    console.error("[ERROR] JavaScript执行出错:", e);' +
                         '    "javascript_error: " + e.message;' +
                         '}';
            
            $.writeln('[DEBUG] 准备执行JavaScript代码');
            
            // 使用CSInterface执行JavaScript代码
            var result = csInterface.evalScript(jsCode);
            
            $.writeln('[DEBUG] JavaScript执行结果: ' + result);
            
            if (result === 'success') {
                $.writeln('[SUCCESS] 文件夹打开成功');
                return JSON.stringify({
                    success: true,
                    message: '文件夹已通过CEP打开: ' + folderPath
                });
            } else if (result === 'function_not_available') {
                $.writeln('[ERROR] JavaScript端openFolder函数不可用');
                return JSON.stringify({
                    success: false,
                    error: 'JavaScript端openFolder函数不可用',
                    folderPath: folderPath,
                    debug: 'window.aeExtension.openFolder 函数未找到'
                });
            } else if (result && result.indexOf('javascript_error:') === 0) {
                $.writeln('[ERROR] JavaScript执行出错: ' + result);
                return JSON.stringify({
                    success: false,
                    error: result,
                    folderPath: folderPath
                });
            } else {
                $.writeln('[ERROR] 未知的JavaScript执行结果: ' + result);
                return JSON.stringify({
                    success: false,
                    error: '未知的执行结果: ' + result,
                    folderPath: folderPath
                });
            }
        } catch (cepError) {
            $.writeln('[ERROR] CEP调用异常: ' + cepError.toString());
            return JSON.stringify({
                success: false,
                error: 'CEP调用失败: ' + cepError.toString(),
                folderPath: folderPath
            });
        }
        
    } catch (error) {
        $.writeln('[ERROR] openFolderViaCEP 总体异常: ' + error.toString());
        return JSON.stringify({
            success: false,
            error: '打开文件夹时发生错误: ' + error.toString()
        });
    }
}
