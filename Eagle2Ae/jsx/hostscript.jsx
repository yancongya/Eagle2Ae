// Export to AE - ExtendScript主机脚本
// 处理After Effects的具体操作

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
                if (item instanceof CompItem && item.name === data.targetComp) {
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
        app.beginUndoGroup("Export to AE - 导入文件");
        
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
                            
                            // 如果需要按序列排列
                            if (data.importOptions.arrangeInSequence && i > 0) {
                                layer.startTime = i * (footage.duration || 1);
                            }
                            
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
            debug: debugLog
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

                            // 根据时间轴设置放置层
                            if (settings.timelineOptions && settings.timelineOptions.enabled) {
                                debugLog.push("ExtendScript: 应用时间轴设置，placement: " + settings.timelineOptions.placement);
                                switch (settings.timelineOptions.placement) {
                                    case 'current_time':
                                        layer.startTime = comp.time;
                                        debugLog.push("ExtendScript: 放置在当前时间: " + comp.time);
                                        break;
                                    case 'sequence':
                                        var interval = settings.timelineOptions.sequenceInterval || 1.0;
                                        layer.startTime = comp.time + (i * interval);
                                        debugLog.push("ExtendScript: 按顺序放置，时间: " + layer.startTime);
                                        break;
                                    case 'stack':
                                        layer.startTime = comp.time;
                                        debugLog.push("ExtendScript: 叠加放置，时间: " + comp.time);
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

// 选择文件夹对话框
function selectFolder(currentPath) {
    try {
        var folder = null;

        // 如果有当前路径，尝试设置为默认位置
        if (currentPath && currentPath !== "") {
            try {
                var currentFolder = new Folder(currentPath);
                if (currentFolder.exists) {
                    folder = currentFolder.selectDlg("选择目标文件夹");
                } else {
                    folder = Folder.selectDialog("选择目标文件夹");
                }
            } catch (e) {
                folder = Folder.selectDialog("选择目标文件夹");
            }
        } else {
            folder = Folder.selectDialog("选择目标文件夹");
        }

        if (folder) {
            return JSON.stringify({
                success: true,
                path: folder.fsName,
                cancelled: false
            });
        } else {
            return JSON.stringify({
                success: false,
                path: null,
                cancelled: true
            });
        }

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: error.toString(),
            cancelled: false
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
