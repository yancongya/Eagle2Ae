// 调试版本 v2.1.1 - 中文文件名修复版
// 逐步添加功能来定位语法问题

// 最基础的测试函数
function testExtendScriptConnection() {
    try {
        var now = new Date();
        var timestamp = now.getFullYear() + "-" +
                       padZero(now.getMonth() + 1) + "-" +
                       padZero(now.getDate()) + " " +
                       padZero(now.getHours()) + ":" +
                       padZero(now.getMinutes()) + ":" +
                       padZero(now.getSeconds());

        var resultObj = {
            success: true,
            message: "ExtendScript连接正常",
            aeVersion: app.version,
            scriptVersion: "v2.1.1 - 强制中文文件名解码 (DEBUG) - 加载时间: " + timestamp
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

// 辅助函数：格式化时间
function padZero(num) {
    return (num < 10) ? "0" + num : String(num);
}

// 详细分析单个图层
function analyzeLayerDetailed(layer, index) {
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
                        layerInfo.type = "纯色图层";
                        layerInfo.exportable = false;
                        layerInfo.reason = "纯色图层不支持导出";
                        layerInfo.sourceInfo = {
                            type: "Solid",
                            width: layer.source.width,
                            height: layer.source.height,
                            color: "RGB(" + Math.round(mainSource.color.r * 255) + "," +
                                   Math.round(mainSource.color.g * 255) + "," +
                                   Math.round(mainSource.color.b * 255) + ")"
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
                            duration: Math.round(layer.source.duration * 100) / 100,
                            isSequence: isSequence
                        };
                    } else {
                        layerInfo.exportable = false;
                        layerInfo.reason = "未知素材类型";
                    }
                } else if (layer.source instanceof CompItem) {
                    layerInfo.type = "预合成图层";
                    layerInfo.exportable = false;
                    layerInfo.reason = "预合成图层不支持导出";
                    layerInfo.sourceInfo = {
                        type: "Composition",
                        compName: layer.source.name,
                        width: layer.source.width,
                        height: layer.source.height,
                        duration: Math.round(layer.source.duration * 100) / 100
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
            layerInfo.type = "形状图层";
            layerInfo.exportable = true;
            layerInfo.reason = "形状图层，可以导出";
        } else if (layer instanceof TextLayer) {
            layerInfo.type = "文本图层";
            layerInfo.exportable = true;
            layerInfo.reason = "文本图层，可以导出";
            // 获取文本内容
            try {
                var textDocument = layer.property("Source Text").value;
                layerInfo.sourceInfo = {
                    type: "Text",
                    text: textDocument.text.substring(0, 20) + (textDocument.text.length > 20 ? "..." : ""),
                    fontSize: textDocument.fontSize
                };
            } catch (textError) {
                // 忽略文本获取错误
            }
        } else if (layer instanceof CameraLayer) {
            layerInfo.type = "摄像机图层";
            layerInfo.exportable = false;
            layerInfo.reason = "摄像机图层不支持导出";
        } else if (layer instanceof LightLayer) {
            layerInfo.type = "灯光图层";
            layerInfo.exportable = false;
            layerInfo.reason = "灯光图层不支持导出";
        } else {
            // 检查是否为调整图层
            if (layer.adjustmentLayer) {
                layerInfo.type = "调整图层";
                layerInfo.exportable = false;
                layerInfo.reason = "调整图层不支持导出";
            } else {
                layerInfo.exportable = false;
                layerInfo.reason = "未知图层类型";
            }
        }

        // 生成详细的日志消息
        var statusIcon = layerInfo.exportable ? "✅" : "❌";
        var detailText = "";

        if (layerInfo.sourceInfo) {
            if (layerInfo.sourceInfo.type == "File") {
                var fileName = layerInfo.sourceInfo.fileName || "未知文件";
                var dimensions = layerInfo.sourceInfo.width + "x" + layerInfo.sourceInfo.height;
                detailText = " [" + fileName + " " + dimensions + "]";

                // 如果是序列帧，添加标识
                if (layerInfo.sourceInfo.isSequence) {
                    detailText += " (序列帧)";
                }
            } else if (layerInfo.sourceInfo.type == "Solid") {
                detailText = " [" + layerInfo.sourceInfo.color + " " +
                           layerInfo.sourceInfo.width + "x" + layerInfo.sourceInfo.height + "]";
            } else if (layerInfo.sourceInfo.type == "Composition") {
                detailText = " [预合成: " + layerInfo.sourceInfo.compName + "]";
            } else if (layerInfo.sourceInfo.type == "Text") {
                detailText = " [\"" + layerInfo.sourceInfo.text + "\" " + layerInfo.sourceInfo.fontSize + "px]";
            }
        }

        layerInfo.logMessage = statusIcon + " " + index + ". " + layer.name +
                              " (" + layerInfo.type + ")" + detailText;

    } catch (error) {
        layerInfo.exportable = false;
        layerInfo.reason = "分析出错: " + error.toString();
        layerInfo.logMessage = "  ❌ " + index + ". " + layer.name + " - " + layerInfo.reason;
    }

    return layerInfo;
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
            }
        }

        return JSON.stringify(result);

    } catch (error) {
        var errorResult = {
            projectPath: null,
            projectName: null,
            activeComp: null,
            isReady: false,
            error: error.toString()
        };
        return JSON.stringify(errorResult);
    }
}

// 获取详细的项目状态信息
function getDetailedProjectInfo() {
    try {
        var result = {
            hasProject: false,
            projectFile: null,
            projectName: null,
            totalItems: 0,
            compositions: [],
            activeComp: null
        };

        // 检查项目状态
        if (app.project) {
            result.hasProject = true;
            result.totalItems = app.project.numItems;

            if (app.project.file) {
                result.projectFile = app.project.file.fsName;
                result.projectName = app.project.file.name;
            } else {
                result.projectName = "未保存的项目";
            }

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
                        numLayers: item.numLayers
                    };

                    result.compositions.push(compInfo);

                    // 检查是否为当前激活的合成
                    if (app.project.activeItem && app.project.activeItem.id == item.id) {
                        result.activeComp = compInfo;
                    }
                }
            }
        }

        return JSON.stringify(result);

    } catch (error) {
        var errorResult = {
            hasProject: false,
            error: error.toString()
        };
        return JSON.stringify(errorResult);
    }
}

// 简化的文件导入函数
function importFiles(data) {
    try {
        var result = {
            success: false,
            importedCount: 0,
            error: null,
            targetComp: data.targetComp
        };

        // 检查是否有项目
        if (!app.project) {
            result.error = "没有打开的项目";
            return JSON.stringify(result);
        }

        // 检查文件数据
        if (!data || !data.files || data.files.length === 0) {
            result.error = "没有文件需要导入";
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

        // 如果没有找到目标合成，使用当前激活的合成
        if (!targetComp && app.project.activeItem instanceof CompItem) {
            targetComp = app.project.activeItem;
        }

        // 开始导入文件
        app.beginUndoGroup("Eagle导入文件");

        try {
            for (var j = 0; j < data.files.length; j++) {
                var fileData = data.files[j];

                // 创建File对象
                var fileObj = new File(fileData.path);

                if (fileObj.exists) {
                    // 导入文件 - 使用正确的ImportOptions构造方法
                    var importOptions = new ImportOptions(fileObj);

                    // 根据文件类型设置导入选项
                    if (fileData.type == 'image') {
                        importOptions.importAs = ImportAsType.FOOTAGE;
                    } else if (fileData.type == 'video' || fileData.type == 'audio') {
                        importOptions.importAs = ImportAsType.FOOTAGE;
                    }

                    var importedItem = app.project.importFile(importOptions);

                    // 如果有目标合成，添加到合成中
                    if (targetComp && importedItem) {
                        var newLayer = targetComp.layers.add(importedItem);

                        // 根据设置决定图层放置位置
                        if (data.settings && data.settings.timelineOptions && data.settings.timelineOptions.enabled) {
                            switch (data.settings.timelineOptions.placement) {
                                case 'timeline_start':
                                    newLayer.startTime = 0;
                                    break;
                                case 'current_time':
                                default:
                                    newLayer.startTime = targetComp.time;
                                    break;
                            }
                        } else {
                            newLayer.startTime = targetComp.time;
                        }
                    }

                    result.importedCount++;
                }
            }

            result.success = true;

        } catch (importError) {
            result.error = "导入过程出错: " + importError.toString();
        } finally {
            app.endUndoGroup();
        }

        return JSON.stringify(result);

    } catch (error) {
        var errorResult = {
            success: false,
            importedCount: 0,
            error: error.toString()
        };
        return JSON.stringify(errorResult);
    }
}

// 带设置的导入函数（完整版）
function importFilesWithSettings(data) {
    var debugLog = [];

    try {
        debugLog.push("ExtendScript: importFilesWithSettings 开始");
        debugLog.push("ExtendScript: 接收到的数据: " + JSON.stringify(data));

        // 详细记录设置信息
        if (data.settings) {
            debugLog.push("ExtendScript: 设置详情:");
            debugLog.push("  - addToComposition: " + data.settings.addToComposition);
            if (data.settings.timelineOptions) {
                debugLog.push("  - timelineOptions.enabled: " + data.settings.timelineOptions.enabled);
                debugLog.push("  - timelineOptions.placement: " + data.settings.timelineOptions.placement);
                debugLog.push("  - timelineOptions.sequenceInterval: " + data.settings.timelineOptions.sequenceInterval);
            }
        }

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

        var project = app.project;
        if (!project) {
            result.error = "没有打开的项目";
            debugLog.push("ExtendScript: 没有打开的项目");
            return JSON.stringify(result);
        }

        // 开始导入文件
        app.beginUndoGroup("Import from Eagle with Settings");

        var importedCount = 0;

        try {
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
                        if (file.name && file.name != footageItem.name) {
                            footageItem.name = file.name;
                            debugLog.push("ExtendScript: 重命名为: " + file.name);
                        }

                        // 添加到合成中
                        if (data.settings && data.settings.addToComposition) {
                            debugLog.push("ExtendScript: 用户设置要求添加到合成");

                            var comp = null;

                            // 首先尝试使用当前激活的合成
                            if (project.activeItem && project.activeItem instanceof CompItem) {
                                comp = project.activeItem;
                                debugLog.push("ExtendScript: 使用当前激活的合成: " + comp.name);
                            } else {
                                // 如果没有激活的合成，查找项目中的第一个合成
                                debugLog.push("ExtendScript: 没有激活的合成，查找项目中的合成...");
                                for (var k = 1; k <= project.numItems; k++) {
                                    var item = project.item(k);
                                    if (item instanceof CompItem) {
                                        comp = item;
                                        debugLog.push("ExtendScript: 找到合成: " + comp.name);
                                        // 激活这个合成
                                        comp.openInViewer();
                                        debugLog.push("ExtendScript: 已激活合成: " + comp.name);
                                        break;
                                    }
                                }
                            }

                            if (comp) {
                                var layer = comp.layers.add(footageItem);
                                debugLog.push("ExtendScript: 成功添加到合成，层名: " + layer.name);

                                // 根据时间轴设置放置层
                                if (data.settings && data.settings.timelineOptions && data.settings.timelineOptions.enabled) {
                                    debugLog.push("ExtendScript: 应用时间轴设置，placement: " + data.settings.timelineOptions.placement);
                                    switch (data.settings.timelineOptions.placement) {
                                        case 'current_time':
                                            layer.startTime = comp.time;
                                            debugLog.push("ExtendScript: 放置在当前时间: " + comp.time);
                                            break;
                                        case 'sequence':
                                            var interval = data.settings.timelineOptions.sequenceInterval || 1.0;
                                            layer.startTime = comp.time + (i * interval);
                                            debugLog.push("ExtendScript: 按顺序放置，时间: " + layer.startTime);
                                            break;
                                        case 'stack':
                                            layer.startTime = comp.time;
                                            debugLog.push("ExtendScript: 叠加放置，时间: " + comp.time);
                                            break;
                                        case 'timeline_start':
                                            layer.startTime = 0;
                                            debugLog.push("ExtendScript: 放置在时间轴开始: 0");
                                            break;
                                        default:
                                            layer.startTime = comp.time;
                                            debugLog.push("ExtendScript: 未知的placement设置，使用当前时间: " + comp.time);
                                            break;
                                    }
                                } else {
                                    // 默认放置在当前时间
                                    layer.startTime = comp.time;
                                    debugLog.push("ExtendScript: 时间轴选项未启用，使用当前时间: " + comp.time);
                                }

                                debugLog.push("ExtendScript: 已添加到合成: " + comp.name);
                            } else {
                                debugLog.push("ExtendScript: 警告: 没有找到可用的合成，文件仅导入到项目");
                            }
                        } else {
                            debugLog.push("ExtendScript: 用户设置不要求添加到合成，仅导入到项目");
                        }
                    } else {
                        debugLog.push("ExtendScript: 文件导入失败");
                    }

                } catch (fileError) {
                    debugLog.push("ExtendScript: 处理文件时出错: " + fileError.toString());
                }
            }

            result.success = true;
            result.importedCount = importedCount;
            debugLog.push("ExtendScript: 导入完成，成功导入 " + importedCount + " 个文件");

        } catch (importError) {
            result.error = "导入过程出错: " + importError.toString();
            debugLog.push("ExtendScript: 导入过程出错: " + importError.toString());
        } finally {
            app.endUndoGroup();
        }

        return JSON.stringify(result);

    } catch (error) {
        var errorResult = {
            success: false,
            importedCount: 0,
            error: error.toString(),
            debug: debugLog.concat(["ExtendScript: 函数执行出错: " + error.toString()])
        };
        return JSON.stringify(errorResult);
    }
}

// 确保目录存在
function ensureDirectoryExists(dirPath) {
    try {
        // 解码和规范化路径
        var normalizedPath = decodeURIComponent(dirPath).replace(/\//g, File.fs == "Windows" ? "\\" : "/");
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
            error: "创建目录时出错: " + error.toString(),
            path: dirPath
        });
    }
}

// 复制文件
function copyFile(sourcePath, targetPath) {
    try {
        // 解码和规范化路径
        var normalizedSourcePath = decodeURIComponent(sourcePath).replace(/\//g, File.fs == "Windows" ? "\\" : "/");
        var normalizedTargetPath = decodeURIComponent(targetPath).replace(/\//g, File.fs == "Windows" ? "\\" : "/");

        var sourceFile = new File(normalizedSourcePath);
        var targetFile = new File(normalizedTargetPath);

        if (!sourceFile.exists) {
            return JSON.stringify({
                success: false,
                error: "源文件不存在: " + normalizedSourcePath
            });
        }

        // 确保目标目录存在
        var targetFolder = targetFile.parent;
        if (!targetFolder.exists) {
            targetFolder.create();
        }

        var copied = sourceFile.copy(targetFile);

        return JSON.stringify({
            success: copied,
            error: copied ? null : "文件复制失败",
            sourcePath: normalizedSourcePath,
            targetPath: normalizedTargetPath
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: "复制文件时出错: " + error.toString(),
            sourcePath: sourcePath,
            targetPath: targetPath
        });
    }
}

// 验证文件夹路径
function validateFolderPath(folderPath) {
    try {
        if (!folderPath || folderPath == "") {
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
            path: folder.fsName,
            error: null
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            exists: false,
            error: "验证路径时出错: " + error.toString(),
            path: folderPath
        });
    }
}

// 打开指定合成
function openComposition(compName) {
    try {
        if (!app.project) {
            return JSON.stringify({
                success: false,
                error: "没有打开的项目"
            });
        }

        // 查找合成
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name == compName) {
                item.openInViewer();
                return JSON.stringify({
                    success: true,
                    compName: compName,
                    compId: item.id
                });
            }
        }

        return JSON.stringify({
            success: false,
            error: "找不到合成: " + compName
        });

    } catch (error) {
        return JSON.stringify({
            success: false,
            error: "打开合成时出错: " + error.toString()
        });
    }
}

// 简化的图层检测函数
function detectSelectedLayers() {
    try {
        // 检查基本条件
        if (!app.project.activeItem) {
            var errorResult = {
                success: false,
                error: "没有激活的项目项"
            };
            return JSON.stringify(errorResult);
        }
        
        if (!(app.project.activeItem instanceof CompItem)) {
            var errorResult = {
                success: false,
                error: "当前激活项不是合成"
            };
            return JSON.stringify(errorResult);
        }

        var comp = app.project.activeItem;
        var selectedLayers = comp.selectedLayers;
        
        if (selectedLayers.length === 0) {
            var errorResult = {
                success: false,
                error: "没有选中任何图层"
            };
            return JSON.stringify(errorResult);
        }

        // 构建结果对象
        var successResult = {
            success: true,
            compName: comp.name,
            totalSelected: selectedLayers.length,
            logs: []
        };
        
        successResult.logs.push("合成名称: " + comp.name);
        successResult.logs.push("选中图层数: " + selectedLayers.length);
        
        // 详细分析每个图层
        var exportableCount = 0;
        var nonExportableCount = 0;

        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var layerInfo = analyzeLayerDetailed(layer, i + 1);

            if (layerInfo.exportable) {
                exportableCount++;
            } else {
                nonExportableCount++;
            }

            successResult.logs.push(layerInfo.logMessage);
        }

        // 添加统计信息
        successResult.logs.push("");
        successResult.logs.push("📊 检测统计:");
        successResult.logs.push("  ✅ 可导出图层: " + exportableCount + " 个");
        successResult.logs.push("  ❌ 不可导出图层: " + nonExportableCount + " 个");

        if (exportableCount > 0) {
            successResult.logs.push("");
            successResult.logs.push("💡 提示: 可导出的图层将被渲染为PNG文件");
        }
        
        return JSON.stringify(successResult);

    } catch (error) {
        var errorResult = {
            success: false,
            error: error.toString()
        };
        return JSON.stringify(errorResult);
    }
}

// 完整的导出函数
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

        // 检查基本条件
        if (!app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
            result.error = "没有激活的合成";
            result.logs.push("❌ 没有激活的合成，请先选择一个合成");
            return JSON.stringify(result);
        }

        var comp = app.project.activeItem;
        result.compName = comp.name;
        result.logs.push("📋 开始导出合成: " + comp.name);

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            result.error = "没有选中任何图层";
            result.logs.push("⚠️ 没有选中任何图层，请先选择要导出的图层");
            return JSON.stringify(result);
        }

        // 解析导出设置
        var settings = exportSettings || {};
        result.logs.push("⚙️ 导出设置: " + JSON.stringify(settings));

        // 创建导出文件夹
        var exportFolder = createExportFolder(exportSettings);
        if (!exportFolder) {
            result.error = "无法创建导出文件夹";
            result.logs.push("❌ 无法创建导出文件夹");
            return JSON.stringify(result);
        }

        result.exportPath = exportFolder.fsName;
        result.logs.push("📁 导出路径: " + result.exportPath);

        // 分析并导出每个图层
        var exportableLayersInfo = [];
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var layerInfo = analyzeLayerDetailed(layer, i + 1);

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
            result.error = "没有可导出的图层";
            result.logs.push("❌ 没有可导出的图层");
            return JSON.stringify(result);
        }

        result.logs.push("🚀 开始导出 " + exportableLayersInfo.length + " 个图层...");

        // 创建标签文件夹（如果需要）
        var finalExportFolder = createTagFolders(exportFolder, settings);
        if (finalExportFolder !== exportFolder) {
            result.logs.push("📁 创建分类文件夹: " + finalExportFolder.fsName);
        }

        // 添加进度信息到结果
        result.progress = {
            total: exportableLayersInfo.length,
            current: 0,
            percentage: 0,
            currentLayer: null,
            startTime: new Date().getTime()
        };

        // 导出每个可导出的图层
        for (var j = 0; j < exportableLayersInfo.length; j++) {
            var layerData = exportableLayersInfo[j];

            // 更新进度信息
            result.progress.current = j + 1;
            result.progress.percentage = Math.round((j + 1) / exportableLayersInfo.length * 100);
            result.progress.currentLayer = layerData.layer.name;

            // 显示详细进度（包含图层尺寸信息）
            var layerSizeInfo = "";
            if (layerData.info.sourceInfo && layerData.info.sourceInfo.width && layerData.info.sourceInfo.height) {
                layerSizeInfo = " [" + layerData.info.sourceInfo.width + "×" + layerData.info.sourceInfo.height + "]";
            }

            var progressText = "🔄 正在导出 (" + result.progress.current + "/" + result.progress.total +
                             ", " + result.progress.percentage + "%): " + layerData.layer.name + layerSizeInfo;
            result.logs.push(progressText);

            // 估算剩余时间
            if (j > 0) {
                var elapsed = new Date().getTime() - result.progress.startTime;
                var avgTimePerLayer = elapsed / j;
                var remainingLayers = exportableLayersInfo.length - j;
                var estimatedRemaining = Math.round(avgTimePerLayer * remainingLayers / 1000);

                if (estimatedRemaining > 0) {
                    result.logs.push("⏱️ 预计剩余时间: " + estimatedRemaining + " 秒");
                }
            }

            var exportResult = exportSingleLayer(layerData.layer, layerData.info, comp, finalExportFolder, settings);

            if (exportResult.success) {
                result.exportedLayers.push(exportResult);
                result.totalExported++;

                // 改进的成功日志，包含尺寸和验证信息
                var successLog = "✅ 已导出: " + layerData.layer.name + " -> " + exportResult.fileName;
                if (exportResult.layerWidth && exportResult.layerHeight) {
                    successLog += " [" + exportResult.layerWidth + "×" + exportResult.layerHeight + "]";
                }
                if (exportResult.validation) {
                    successLog += " (" + exportResult.validation + ")";
                }
                result.logs.push(successLog);

                // 显示文件大小（使用验证结果中的文件大小）
                if (exportResult.fileSize && exportResult.fileSize > 0) {
                    var sizeText = "📊 文件大小: " + exportResult.fileSize + " KB";
                    if (exportResult.fileSize > 1024) {
                        var sizeMB = Math.round(exportResult.fileSize / 1024 * 100) / 100;
                        sizeText += " (" + sizeMB + " MB)";
                    }
                    result.logs.push(sizeText);
                }
            } else {
                var errorLog = "❌ 导出失败: " + layerData.layer.name + " - " + exportResult.error;
                if (exportResult.fileSize !== undefined) {
                    errorLog += " (文件大小: " + exportResult.fileSize + " KB)";
                }
                result.logs.push(errorLog);
            }

            // 添加分隔线（除了最后一个）
            if (j < exportableLayersInfo.length - 1) {
                result.logs.push("─────────────────────────");
            }
        }

        // 计算总耗时
        var totalTime = Math.round((new Date().getTime() - result.progress.startTime) / 1000);
        result.progress.totalTime = totalTime;

        result.success = true;

        // 计算总文件大小
        var totalFileSize = 0;
        for (var k = 0; k < result.exportedLayers.length; k++) {
            if (result.exportedLayers[k].fileSize) {
                totalFileSize += result.exportedLayers[k].fileSize;
            }
        }

        // 添加详细的完成统计
        result.logs.push("═══════════════════════════");
        result.logs.push("🎉 导出完成! 统计信息:");
        result.logs.push("✅ 成功导出: " + result.totalExported + " 个图层");
        if (result.skippedCount > 0) {
            result.logs.push("⏭️ 跳过图层: " + result.skippedCount + " 个");
        }
        result.logs.push("⏱️ 总耗时: " + result.progress.totalTime + " 秒");
        if (result.totalExported > 0) {
            var avgTime = Math.round(result.progress.totalTime / result.totalExported * 10) / 10;
            result.logs.push("📊 平均每层: " + avgTime + " 秒");
        }
        if (totalFileSize > 0) {
            var totalSizeText = "💾 总文件大小: " + totalFileSize + " KB";
            if (totalFileSize > 1024) {
                var totalSizeMB = Math.round(totalFileSize / 1024 * 100) / 100;
                totalSizeText += " (" + totalSizeMB + " MB)";
            }
            result.logs.push(totalSizeText);
        }
        result.logs.push("📁 导出位置: " + result.exportPath);
        result.logs.push("═══════════════════════════");

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

        // 尝试读取文件头验证PNG格式
        file.open('r');
        file.encoding = 'BINARY';
        var header = file.read(8);
        file.close();

        // PNG文件头标识：89 50 4E 47 0D 0A 1A 0A
        var pngHeader = String.fromCharCode(0x89) + 'PNG' + String.fromCharCode(0x0D, 0x0A, 0x1A, 0x0A);
        if (header !== pngHeader) {
            return {
                valid: false,
                error: "文件头验证失败，不是有效的PNG文件",
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

// 获取当前时间戳
function getCurrentTimestamp() {
    var now = new Date();
    return now.getFullYear() +
           padZero(now.getMonth() + 1) +
           padZero(now.getDate()) + "_" +
           padZero(now.getHours()) +
           padZero(now.getMinutes()) +
           padZero(now.getSeconds());
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
function exportSingleLayer(layer, layerInfo, originalComp, exportFolder, settings) {
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

        // 生成文件名并处理文件冲突
        var fileName = generateFileName(layer.name, settings);
        var outputFile = handleFileConflict(exportFolder, fileName, settings);
        outputModule.file = outputFile;

        // 检查是否跳过文件（文件冲突处理返回null）
        if (!outputFile) {
            // 清理资源
            if (tempComp) tempComp.remove();
            if (renderQueueBackup) restoreRenderQueue(renderQueueBackup);

            return {
                success: false,
                error: "文件已存在，根据设置跳过导出",
                layerName: layer.name,
                skipped: true
            };
        }

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
                sequenceFile.rename(outputFile.name);
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
                fileName: outputFile.name,
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

// 生成文件名
function generateFileName(layerName, settings) {
    var fileName = "";
    var fileManagement = settings && settings.fileManagement ? settings.fileManagement : {};

    // 基础文件名处理
    if (fileManagement.keepOriginalName !== false) {
        // 默认保持原名，但需要清理特殊字符
        fileName = sanitizeFileName(layerName);
    } else {
        // 使用简化名称
        fileName = "Layer_" + getCurrentTimestamp();
    }

    // 添加时间戳
    if (fileManagement.addTimestamp) {
        fileName += "_" + getCurrentTimestamp();
    }

    // 添加合成名前缀（如果设置了）
    if (fileManagement.addCompPrefix && app.project.activeItem) {
        var compName = sanitizeFileName(app.project.activeItem.name);
        fileName = compName + "_" + fileName;
    }

    return fileName + ".png";
}



// 创建标签文件夹（如果需要）
function createTagFolders(exportFolder, settings) {
    if (!settings || !settings.fileManagement || !settings.fileManagement.createTagFolders) {
        return exportFolder;
    }

    try {
        // 这里可以根据图层的标签或其他属性创建子文件夹
        // 暂时创建一个通用的分类文件夹
        var categoryFolder = new Folder(exportFolder.fsName + "/Exported_Layers");

        if (!categoryFolder.exists) {
            categoryFolder.create();
        }

        return categoryFolder;

    } catch (error) {
        // 如果创建失败，返回原文件夹
        return exportFolder;
    }
}

// 配置输出模块
function configureOutputModule(outputModule, settings) {
    try {
        // 设置PNG格式
        try {
            // 首先尝试使用PNG模板
            outputModule.applyTemplate("PNG Sequence");
        } catch (templateError) {
            // 如果模板不存在，手动设置PNG格式
            try {
                outputModule.format = "PNG Sequence";
            } catch (formatError) {
                // 使用默认格式，继续配置其他设置
            }
        }

        // 配置输出设置
        var renderSettings = settings && settings.renderSettings ? settings.renderSettings : {};

        // 设置质量（如果支持）
        try {
            if (renderSettings.quality) {
                // PNG通常不支持质量设置，但我们可以设置其他相关参数
                outputModule.quality = renderSettings.quality;
            }
        } catch (qualityError) {
            // 忽略质量设置错误
        }

        // 设置颜色深度
        try {
            if (renderSettings.colorDepth) {
                outputModule.colorDepth = renderSettings.colorDepth;
            } else {
                // 默认使用32位（支持透明度）
                outputModule.colorDepth = 32;
            }
        } catch (depthError) {
            // 忽略颜色深度设置错误
        }

        // 设置透明度处理
        try {
            // PNG默认支持透明度，确保启用
            if (outputModule.includeAlpha !== undefined) {
                outputModule.includeAlpha = true;
            }
        } catch (alphaError) {
            // 忽略透明度设置错误
        }

        // 设置输出尺寸
        try {
            if (renderSettings.scale && renderSettings.scale !== 100) {
                // 设置缩放比例
                outputModule.resize = true;
                outputModule.resizeQuality = ResizeQuality.HIGH;
                outputModule.width = Math.round(outputModule.width * renderSettings.scale / 100);
                outputModule.height = Math.round(outputModule.height * renderSettings.scale / 100);
            }
        } catch (resizeError) {
            // 忽略尺寸设置错误
        }

        // 设置输出通道
        try {
            // 确保输出RGB+Alpha通道
            outputModule.channels = OutputChannels.RGB_ALPHA;
        } catch (channelsError) {
            // 忽略通道设置错误
        }

        // 设置色彩管理
        try {
            if (renderSettings.colorManagement !== false) {
                // 启用色彩管理（如果支持）
                outputModule.colorManagement = true;
            }
        } catch (colorMgmtError) {
            // 忽略色彩管理设置错误
        }

    } catch (error) {
        // 如果配置失败，使用默认设置
        // 至少确保格式正确
        try {
            outputModule.format = "PNG Sequence";
        } catch (fallbackError) {
            // 最后的回退，使用系统默认
        }
    }
}

// 获取默认渲染设置
function getDefaultRenderSettings() {
    return {
        quality: 100,           // 最高质量
        colorDepth: 32,         // 32位颜色深度（支持透明度）
        scale: 100,             // 100%缩放
        colorManagement: true,  // 启用色彩管理
        includeAlpha: true      // 包含透明度通道
    };
}

// 处理文件冲突
function handleFileConflict(exportFolder, fileName, settings) {
    try {
        var baseFileName = fileName.replace(/\.png$/i, '');
        var extension = '.png';
        var finalFileName = fileName;
        var outputFile = new File(exportFolder.fsName + "/" + finalFileName);

        // 检查文件是否已存在
        var counter = 1;
        while (outputFile.exists) {
            // 根据设置决定如何处理冲突
            var conflictHandling = settings && settings.fileManagement && settings.fileManagement.conflictHandling
                                 ? settings.fileManagement.conflictHandling : 'rename';

            switch (conflictHandling) {
                case 'overwrite':
                    // 覆盖现有文件
                    break;

                case 'skip':
                    // 跳过，返回null表示跳过
                    return null;

                case 'rename':
                default:
                    // 重命名文件（默认行为）
                    finalFileName = baseFileName + "_" + counter + extension;
                    outputFile = new File(exportFolder.fsName + "/" + finalFileName);
                    counter++;

                    // 防止无限循环
                    if (counter > 1000) {
                        throw new Error("文件冲突处理失败：尝试次数过多");
                    }
                    break;
            }

            if (conflictHandling === 'overwrite') {
                break;
            }
        }

        return outputFile;

    } catch (error) {
        // 如果处理失败，使用带时间戳的文件名
        var timestampFileName = baseFileName + "_" + getCurrentTimestamp() + extension;
        return new File(exportFolder.fsName + "/" + timestampFileName);
    }
}

// 验证导出权限
function validateExportPermissions(exportFolder) {
    try {
        // 检查文件夹是否存在
        if (!exportFolder.exists) {
            return {
                success: false,
                error: "导出文件夹不存在: " + exportFolder.fsName
            };
        }

        // 尝试创建测试文件来验证写入权限
        var testFile = new File(exportFolder.fsName + "/test_permissions_" + getCurrentTimestamp() + ".tmp");

        try {
            testFile.open("w");
            testFile.write("test");
            testFile.close();

            // 删除测试文件
            testFile.remove();

            return {
                success: true,
                error: null
            };

        } catch (writeError) {
            return {
                success: false,
                error: "没有写入权限: " + exportFolder.fsName + " - " + writeError.toString()
            };
        }

    } catch (error) {
        return {
            success: false,
            error: "权限验证失败: " + error.toString()
        };
    }
}

// 安全的渲染执行
function safeRenderExecution(renderQueueItem, layerName) {
    try {
        // 检查渲染队列状态
        if (!renderQueueItem) {
            throw new Error("渲染队列项为空");
        }

        // 检查输出模块
        if (!renderQueueItem.outputModule(1)) {
            throw new Error("输出模块配置失败");
        }

        // 检查输出文件路径
        var outputFile = renderQueueItem.outputModule(1).file;
        if (!outputFile) {
            throw new Error("输出文件路径未设置");
        }

        // 验证输出文件夹权限
        var permissionCheck = validateExportPermissions(outputFile.parent);
        if (!permissionCheck.success) {
            throw new Error(permissionCheck.error);
        }

        // 执行渲染
        app.project.renderQueue.render();

        // 验证输出文件是否成功创建
        if (!outputFile.exists) {
            throw new Error("渲染完成但输出文件不存在");
        }

        // 检查文件大小
        if (outputFile.length === 0) {
            throw new Error("输出文件为空");
        }

        return {
            success: true,
            error: null,
            filePath: outputFile.fsName,
            fileSize: outputFile.length
        };

    } catch (error) {
        return {
            success: false,
            error: "渲染执行失败: " + error.toString(),
            filePath: null,
            fileSize: 0
        };
    }
}
