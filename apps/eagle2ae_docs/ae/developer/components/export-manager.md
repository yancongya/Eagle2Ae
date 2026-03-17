# 导出管理器

## 概述

导出管理器（Export Manager）是 Eagle2Ae AE 扩展 v2.4.0 的核心组件，负责处理从 After Effects 项目到 Eagle 素材库的素材导出流程。该组件支持多种导出格式，提供智能命名规则、进度跟踪、错误处理等功能，确保素材导出过程的稳定性和可靠性。

## 核心特性

### 多种导出格式
- **PNG序列** - 高质量PNG图像序列导出
- **JPEG序列** - 高效JPEG图像序列导出
- **视频格式** - 支持MP4、MOV等视频格式
- **PSD格式** - Photoshop文档格式导出

### 智能命名规则
- **自动编号** - 自动生成连续编号的文件名
- **时间戳命名** - 使用时间戳进行文件命名
- **自定义模板** - 支持自定义命名模板
- **冲突处理** - 自动处理文件名冲突

### 进度跟踪和监控
- **导出进度** - 实时显示导出进度和状态
- **性能监控** - 监控导出过程的性能指标
- **错误统计** - 统计导出过程中的错误
- **日志记录** - 详细记录导出过程

### 错误处理和恢复
- **重试机制** - 自动重试失败的导出操作
- **错误隔离** - 隔离和处理单个文件导出错误
- **回滚支持** - 支持导出失败时的清理操作
- **详细错误信息** - 提供详细的错误描述和解决方案

## 技术实现

### 核心类结构

```javascript
/**
 * 导出管理器
 * 负责处理从After Effects项目到Eagle素材库的素材导出流程
 */
class ExportManager {
    /**
     * 构造函数
     * @param {Object} aeExtension - AE扩展实例
     */
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.csInterface = aeExtension.csInterface;
        this.settingsManager = aeExtension.settingsManager;
        this.logManager = aeExtension.logManager;
        this.eagleConnectionManager = aeExtension.eagleConnectionManager;
        this.projectStatusChecker = aeExtension.projectStatusChecker;
        
        // 导出配置
        this.config = {
            maxConcurrentExports: 3, // 最大并发导出数
            retryAttempts: 3, // 重试次数
            retryDelay: 2000, // 重试延迟（毫秒）
            chunkSize: 5, // 分批处理大小
            timeout: 60000, // 操作超时时间
            enableProgressTracking: true, // 启用进度跟踪
            enableLogging: true, // 启用日志记录
            enableValidation: true, // 启用验证
            tempPath: null // 临时文件路径
        };
        
        // 当前导出状态
        this.currentExport = {
            active: false,
            progress: 0,
            total: 0,
            completed: 0,
            failed: 0,
            currentFile: null,
            startTime: null,
            estimatedTime: null
        };
        
        // 导出队列
        this.exportQueue = [];
        this.activeExports = new Set();
        
        // 性能监控
        this.performanceMetrics = {
            totalExportTime: 0,
            averageExportTime: 0,
            exportRate: 0,
            memoryUsage: new Map()
        };
        
        // 统计数据
        this.stats = {
            totalExports: 0,
            successfulExports: 0,
            failedExports: 0,
            byType: new Map(),
            byDestination: new Map(),
            startTime: Date.now()
        };
        
        // 回调函数
        this.callbacks = {
            onProgress: null,
            onComplete: null,
            onError: null,
            onCancel: null
        };
        
        // 支持的导出格式
        this.supportedFormats = {
            'png': { extension: '.png', quality: 100, type: 'image' },
            'jpg': { extension: '.jpg', quality: 90, type: 'image' },
            'jpeg': { extension: '.jpeg', quality: 90, type: 'image' },
            'tga': { extension: '.tga', quality: 100, type: 'image' },
            'tiff': { extension: '.tiff', quality: 100, type: 'image' },
            'mov': { extension: '.mov', quality: 100, type: 'video' },
            'mp4': { extension: '.mp4', quality: 90, type: 'video' },
            'psd': { extension: '.psd', quality: 100, type: 'image' }
        };
        
        // 命名模板
        this.namingTemplates = {
            'timestamp': '{name}_{timestamp}',
            'numbered': '{name}_{number}',
            'custom': '{prefix}_{name}_{suffix}'
        };
        
        // 绑定方法上下文
        this.exportFiles = this.exportFiles.bind(this);
        this.exportFile = this.exportFile.bind(this);
        this.exportToEagle = this.exportToEagle.bind(this);
        this.exportToFolder = this.exportToFolder.bind(this);
        this.validateExport = this.validateExport.bind(this);
        this.processExportQueue = this.processExportQueue.bind(this);
        this.handleExportError = this.handleExportError.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.cancelExport = this.cancelExport.bind(this);
        
        this.log('📤 导出管理器已初始化', 'debug');
    }
}
```

### 导出模式实现

```javascript
/**
 * 导出文件到目标位置
 * @param {Array} items - 要导出的项目列表
 * @param {Object} options - 导出选项
 * @returns {Object} 导出结果
 */
async exportFiles(items, options = {}) {
    try {
        this.log('📤 开始导出文件...', 'info', { 
            itemCount: items.length, 
            options: options 
        });
        
        // 验证导出条件
        const validation = this.validateExportConditions(options);
        if (!validation.valid) {
            this.log(`❌ 导出条件验证失败: ${validation.error}`, 'error');
            return {
                success: false,
                error: validation.error,
                exportedCount: 0,
                failedCount: items.length
            };
        }
        
        // 初始化导出状态
        this.currentExport = {
            active: true,
            progress: 0,
            total: items.length,
            completed: 0,
            failed: 0,
            currentFile: null,
            startTime: Date.now(),
            estimatedTime: this.estimateExportTime(items.length)
        };
        
        // 分批处理项目
        const chunks = this.chunkArray(items, this.config.chunkSize);
        let results = {
            success: true,
            exportedFiles: [],
            failedFiles: [],
            totalProcessed: 0,
            totalErrors: 0
        };
        
        for (const chunk of chunks) {
            const chunkResult = await this.processExportChunk(chunk, options);
            
            results.exportedFiles.push(...chunkResult.exportedFiles);
            results.failedFiles.push(...chunkResult.failedFiles);
            results.totalProcessed += chunkResult.totalProcessed;
            results.totalErrors += chunkResult.totalErrors;
            
            // 更新总体状态
            this.currentExport.completed = results.exportedFiles.length;
            this.currentExport.failed = results.failedFiles.length;
            
            if (results.totalErrors > 0 && options.stopOnError) {
                this.log(`❌ 遇到错误且设置为停止，终止导出`, 'error');
                break;
            }
        }
        
        // 更新统计
        this.stats.totalExports += results.totalProcessed;
        this.stats.successfulExports += results.exportedFiles.length;
        this.stats.failedExports += results.failedFiles.length;
        
        // 更新导出状态
        this.currentExport.active = false;
        
        const success = results.totalErrors === 0;
        
        this.log(`📤 导出完成: ${success ? '成功' : '部分失败'}`, 'info', {
            total: items.length,
            successful: results.exportedFiles.length,
            failed: results.failedFiles.length
        });
        
        // 调用完成回调
        if (this.callbacks.onComplete) {
            this.callbacks.onComplete(results);
        }
        
        return {
            success: success,
            exportedFiles: results.exportedFiles,
            failedFiles: results.failedFiles,
            totalProcessed: results.totalProcessed,
            totalErrors: results.totalErrors,
            exportTime: Date.now() - this.currentExport.startTime
        };
        
    } catch (error) {
        this.log(`💥 导出过程异常: ${error.message}`, 'error');
        this.currentExport.active = false;
        
        if (this.callbacks.onError) {
            this.callbacks.onError(error);
        }
        
        return {
            success: false,
            error: error.message,
            exportedCount: 0,
            failedCount: items.length
        };
    }
}

/**
 * 处理导出块
 * @param {Array} chunk - 项目块
 * @param {Object} options - 导出选项
 * @returns {Object} 块处理结果
 */
async processExportChunk(chunk, options) {
    const results = {
        exportedFiles: [],
        failedFiles: [],
        totalProcessed: 0,
        totalErrors: 0
    };
    
    // 并发处理块中的项目
    const promises = chunk.map(async (item) => {
        if (!this.currentExport.active) {
            return { success: false, item: item, error: '导出已取消' };
        }
        
        try {
            const result = await this.exportFile(item, options);
            
            if (result.success) {
                results.exportedFiles.push(result.file);
            } else {
                results.failedFiles.push({ 
                    item: item, 
                    error: result.error 
                });
                results.totalErrors++;
            }
            
            results.totalProcessed++;
            
            // 更新进度
            this.updateProgress();
            
        } catch (error) {
            results.failedFiles.push({ 
                item: item, 
                error: error.message 
            });
            results.totalErrors++;
            results.totalProcessed++;
        }
    });
    
    await Promise.all(promises);
    
    return results;
}

/**
 * 导出单个项目
 * @param {Object} item - 要导出的项目
 * @param {Object} options - 导出选项
 * @returns {Object} 导出结果
 */
async exportFile(item, options) {
    try {
        this.currentExport.currentFile = item;
        
        this.log(`📤 开始导出项目: ${item.name}`, 'debug', { 
            item: item, 
            path: item.path 
        });
        
        // 验证单个项目
        const itemValidation = this.validateItemForExport(item);
        if (!itemValidation.valid) {
            throw new Error(itemValidation.error);
        }
        
        // 根据导出模式处理
        let exportResult;
        
        if (options.destination === 'eagle') {
            exportResult = await this.exportToEagle(item, options);
        } else if (options.destination === 'folder') {
            exportResult = await this.exportToFolder(item, options);
        } else {
            // 默认导出到Eagle
            exportResult = await this.exportToEagle(item, options);
        }
        
        if (exportResult.success) {
            this.log(`✅ 项目导出成功: ${item.name}`, 'success', { item: item });
            
            return {
                success: true,
                item: item,
                exportedFile: exportResult.exportedFile,
                destination: options.destination
            };
        } else {
            throw new Error(exportResult.error || '未知错误');
        }
        
    } catch (error) {
        this.log(`❌ 项目导出失败: ${item.name} - ${error.message}`, 'error', { 
            item: item, 
            error: error.message 
        });
        
        return {
            success: false,
            item: item,
            error: error.message
        };
    }
}
```

### 导出到Eagle实现

```javascript
/**
 * 导出到Eagle素材库
 * @param {Object} item - 项目对象
 * @param {Object} options - 选项
 * @returns {Object} 导出结果
 */
async exportToEagle(item, options = {}) {
    try {
        this.log('🔄 导出到Eagle素材库', 'debug');
        
        // 验证Eagle连接
        const eagleConnected = await this.eagleConnectionManager.validateConnection();
        if (!eagleConnected) {
            throw new Error('Eagle连接不可用');
        }
        
        // 获取Eagle信息
        const eagleInfo = await this.eagleConnectionManager.getConnectionInfo();
        const eagleLibraryPath = eagleInfo.libraryPath;
        
        if (!eagleLibraryPath) {
            throw new Error('无法获取Eagle库路径');
        }
        
        // 准备导出路径
        const exportPath = this.joinPath(eagleLibraryPath, this.generateExportPath(item, options));
        
        // 导出项目到本地临时位置
        const tempExportPath = await this.exportItemToTemp(item, options);
        if (!tempExportPath) {
            throw new Error('项目导出到临时位置失败');
        }
        
        // 将文件复制到Eagle库
        const copyResult = await this.copyFile(tempExportPath, exportPath);
        if (!copyResult.success) {
            throw new Error(`复制到Eagle库失败: ${copyResult.error}`);
        }
        
        // 在DEMO模式下模拟添加到Eagle
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：模拟添加到Eagle', 'debug');
            
            // 模拟Eagle API调用
            if (window.demoEagle) {
                const addResult = window.demoEagle.addItemToLibrary({
                    path: exportPath,
                    name: item.name,
                    metadata: {
                        source: 'After Effects',
                        originalItem: item
                    }
                });
                
                if (addResult.success) {
                    this.log('✅ Demo模式：项目已添加到Eagle库', 'success');
                    
                    return {
                        success: true,
                        exportedFile: {
                            ...item,
                            path: exportPath,
                            eagleId: addResult.itemId,
                            exportMode: 'eagle'
                        }
                    };
                } else {
                    throw new Error(`Demo模式添加失败: ${addResult.error}`);
                }
            } else {
                this.log('✅ Demo模式：文件已导出到Eagle库路径', 'success');
                
                return {
                    success: true,
                    exportedFile: {
                        ...item,
                        path: exportPath,
                        exportMode: 'eagle'
                    }
                };
            }
        }
        
        // CEP模式：使用Eagle API添加项目
        // 注意：这里需要根据实际的Eagle API进行调整
        const eagleApiUrl = `http://localhost:41595/api/item/add`;
        
        const formData = new FormData();
        const file = await this.getFileFromPath(exportPath);
        formData.append('file', file, this.extractFileName(exportPath));
        formData.append('folderId', options.folderId || 'root');
        
        const response = await fetch(eagleApiUrl, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            
            this.log('✅ 项目已添加到Eagle库', 'success');
            
            return {
                success: true,
                exportedFile: {
                    ...item,
                    path: exportPath,
                    eagleId: result.id,
                    exportMode: 'eagle'
                }
            };
        } else {
            const errorText = await response.text();
            throw new Error(`Eagle API错误: ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        this.log(`❌ 导出到Eagle失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 生成导出路径
 * @param {Object} item - 项目对象
 * @param {Object} options - 选项
 * @returns {string} 导出路径
 */
generateExportPath(item, options = {}) {
    try {
        // 根据项目类型创建子文件夹
        const itemType = this.getItemType(item);
        const typeFolder = itemType.charAt(0).toUpperCase() + itemType.slice(1); // 首字母大写
        
        // 生成文件名
        const fileName = this.generateExportFileName(item, options);
        
        // 构建完整路径
        const pathParts = [
            typeFolder,
            fileName
        ].filter(part => part);
        
        return pathParts.join('/');
        
    } catch (error) {
        this.log(`生成导出路径失败: ${error.message}`, 'error');
        // 返回默认路径
        return `Exported/${item.name}`;
    }
}

/**
 * 生成导出文件名
 * @param {Object} item - 项目对象
 * @param {Object} options - 选项
 * @returns {string} 文件名
 */
generateExportFileName(item, options = {}) {
    try {
        const format = options.format || this.settingsManager.getField('export.format') || 'png';
        const extension = this.supportedFormats[format]?.extension || '.png';
        
        // 获取格式配置
        const formatConfig = this.supportedFormats[format];
        
        // 根据命名规则生成文件名
        let fileName;
        if (options.namingRule) {
            fileName = this.applyNamingRule(item.name, options.namingRule, formatConfig);
        } else {
            const namingTemplate = this.settingsManager.getField('export.namingTemplate') || 'timestamp';
            fileName = this.applyNamingRule(item.name, namingTemplate, formatConfig);
        }
        
        // 确保文件扩展名正确
        if (!fileName.toLowerCase().endsWith(extension.toLowerCase())) {
            fileName += extension;
        }
        
        // 清理文件名中的非法字符
        fileName = this.sanitizeFileName(fileName);
        
        return fileName;
        
    } catch (error) {
        this.log(`生成导出文件名失败: ${error.message}`, 'error');
        // 返回默认文件名
        return `exported_${item.name}`;
    }
}

/**
 * 应用命名规则
 * @param {string} originalName - 原始名称
 * @param {string} namingRule - 命名规则
 * @param {Object} formatConfig - 格式配置
 * @returns {string} 应用规则后的名称
 */
applyNamingRule(originalName, namingRule, formatConfig) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '');
        const counter = Date.now(); // 使用时间戳作为计数器
        
        // 验证命名规则并应用
        let fileName = namingRule;
        
        // 替换占位符
        fileName = fileName.replace(/{name}/g, originalName);
        fileName = fileName.replace(/{timestamp}/g, timestamp);
        fileName = fileName.replace(/{number}/g, counter.toString());
        fileName = fileName.replace(/{prefix}/g, formatConfig.prefix || '');
        fileName = fileName.replace(/{suffix}/g, formatConfig.suffix || '');
        
        return fileName;
        
    } catch (error) {
        this.log(`应用命名规则失败: ${error.message}`, 'error');
        // 返回原始名称
        return originalName;
    }
}

/**
 * 清理文件名中的非法字符
 * @param {string} fileName - 原始文件名
 * @returns {string} 清理后的文件名
 */
sanitizeFileName(fileName) {
    try {
        // 替换非法字符
        let sanitized = fileName.replace(/[<>:"/\\|?*]/g, '_');
        
        // 移除控制字符
        sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');
        
        // 限制长度
        if (sanitized.length > 255) {
            const ext = this.getFileExtension(sanitized);
            const name = this.removeFileExtension(sanitized);
            sanitized = name.substring(0, 255 - ext.length) + ext;
        }
        
        return sanitized;
        
    } catch (error) {
        this.log(`清理文件名失败: ${error.message}`, 'error');
        return fileName;
    }
}
```

### 导出到文件夹实现

```javascript
/**
 * 导出到指定文件夹
 * @param {Object} item - 项目对象
 * @param {Object} options - 选项
 * @returns {Object} 导出结果
 */
async exportToFolder(item, options = {}) {
    try {
        this.log('🔄 导出到指定文件夹', 'debug');
        
        // 确定目标文件夹
        let targetFolder = options.targetFolder;
        if (!targetFolder) {
            // 如果没有指定文件夹，让用户选择
            const browseResult = await this.browseFolder();
            if (!browseResult.success) {
                throw new Error('未选择导出文件夹');
            }
            targetFolder = browseResult.folderPath;
        }
        
        // 准备导出路径
        const fileName = this.generateExportFileName(item, options);
        const exportPath = this.joinPath(targetFolder, fileName);
        
        // 如果文件已存在，处理重命名
        let finalExportPath = exportPath;
        if (await this.checkFileExists(exportPath)) {
            finalExportPath = await this.resolveFileNameConflict(exportPath);
        }
        
        // 导出项目
        const tempExportPath = await this.exportItemToTemp(item, options);
        if (!tempExportPath) {
            throw new Error('项目导出到临时位置失败');
        }
        
        // 将临时文件复制到目标位置
        const copyResult = await this.copyFile(tempExportPath, finalExportPath);
        if (!copyResult.success) {
            throw new Error(`文件复制失败: ${copyResult.error}`);
        }
        
        // 清理临时文件
        setTimeout(() => {
            this.cleanupTempFiles([{ path: tempExportPath }]);
        }, 5000); // 5秒后清理
        
        this.log('✅ 项目导出到文件夹成功', 'success');
        
        return {
            success: true,
            exportedFile: {
                ...item,
                path: finalExportPath,
                exportMode: 'folder'
            }
        };
        
    } catch (error) {
        this.log(`❌ 导出到文件夹失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 将项目导出到临时位置
 * @param {Object} item - 项目对象
 * @param {Object} options - 选项
 * @returns {string|null} 临时导出路径
 */
async exportItemToTemp(item, options = {}) {
    try {
        // 根据项目类型确定导出方式
        if (item.type === 'composition') {
            return await this.exportCompositionToTemp(item, options);
        } else if (item.type === 'footage') {
            return await this.exportFootageToTemp(item, options);
        } else {
            // 默认导出方式
            return await this.exportItemByRenderQueue(item, options);
        }
        
    } catch (error) {
        this.log(`导出项目到临时位置失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 导出合成到临时位置
 * @param {Object} compItem - 合成项目
 * @param {Object} options - 选项
 * @returns {string|null} 临时路径
 */
async exportCompositionToTemp(compItem, options = {}) {
    try {
        if (window.__DEMO_MODE_ACTIVE__) {
            // Demo模式：模拟导出
            this.log('🎭 Demo模式：模拟合成导出', 'debug');
            const format = options.format || 'png';
            const extension = this.supportedFormats[format]?.extension || '.png';
            const tempFileName = `temp_${compItem.name}_${Date.now()}${extension}`;
            const tempPath = this.joinPath('C:/Temp', tempFileName);
            
            this.log(`📄 Demo模式临时文件: ${tempPath}`, 'debug');
            return tempPath;
        }
        
        // CEP模式：使用ExtendScript导出合成
        const format = options.format || this.settingsManager.getField('export.format') || 'png';
        const quality = options.quality || this.settingsManager.getField('export.quality') || 100;
        const tempFileName = `temp_${compItem.name}_${Date.now()}`;
        
        // 构建导出脚本
        let script = `
            try {
                var project = app.project;
                var comp = project.item(${compItem.id});
                
                if (!(comp instanceof CompItem)) {
                    throw "不是有效的合成";
                }
                
                // 创建渲染队列项
                var rq = app.project.renderQueue;
                if (rq.numItems === 0) {
                    rq.items.add(comp);
                }
                
                var item = rq.items[rq.numItems];
                item.timeSpanBegin = 0;
                item.timeSpanDuration = comp.duration;
                
                // 设置输出模块
                var outputModule = item.outputModule(1);
                
                // 根据格式设置输出设置
                switch ("${format}") {
                    case "png":
                        outputModule.applyTemplate("PNG Sequence");
                        break;
                    case "jpg":
                    case "jpeg":
                        outputModule.applyTemplate("JPEG");
                        break;
                    case "mov":
                        outputModule.applyTemplate("H.264");
                        break;
                    case "mp4":
                        outputModule.applyTemplate("H.264");
                        break;
                    default:
                        outputModule.applyTemplate("PNG Sequence");
                }
                
                // 设置输出路径
                var tempPath = new File("${this.getTempPath()}/${tempFileName}");
                outputModule.file = tempPath;
                
                // 设置质量
                if (${quality} < 100) {
                    outputModule.setSetting("Video Output", "Quality", ${quality});
                }
                
                // 开始渲染
                rq.render();
                
                "${this.joinPath(this.getTempPath(), tempFileName + this.supportedFormats[format].extension)}"
                
            } catch (e) {
                throw e;
            }
        `;
        
        const result = await this.aeExtension.executeExtendScript(script);
        
        if (typeof result === 'string' && result.includes(this.getTempPath())) {
            this.log(`📄 合成导出到临时位置成功: ${result}`, 'debug');
            return result;
        } else {
            throw new Error(result || '合成导出失败');
        }
        
    } catch (error) {
        this.log(`导出合成到临时位置失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 导出素材到临时位置
 * @param {Object} footageItem - 素材项目
 * @param {Object} options - 选项
 * @returns {string|null} 临时路径
 */
async exportFootageToTemp(footageItem, options = {}) {
    try {
        if (window.__DEMO_MODE_ACTIVE__) {
            // Demo模式：模拟素材导出
            this.log('🎭 Demo模式：模拟素材导出', 'debug');
            const tempPath = this.joinPath('C:/Temp', footageItem.name);
            this.log(`📄 Demo模式临时文件: ${tempPath}`, 'debug');
            return tempPath;
        }
        
        // CEP模式：复制原始素材文件
        const originalFootagePath = footageItem.file.fsName;
        const tempPath = this.joinPath(this.getTempPath(), footageItem.name);
        
        // 复制文件到临时位置
        const copyResult = await this.copyFile(originalFootagePath, tempPath);
        
        if (copyResult.success) {
            this.log(`📄 素材导出到临时位置成功: ${tempPath}`, 'debug');
            return tempPath;
        } else {
            throw new Error(copyResult.error);
        }
        
    } catch (error) {
        this.log(`导出素材到临时位置失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 通过渲染队列导出项目
 * @param {Object} item - 项目
 * @param {Object} options - 选项
 * @returns {string|null} 临时路径
 */
async exportItemByRenderQueue(item, options = {}) {
    try {
        if (window.__DEMO_MODE_ACTIVE__) {
            // Demo模式：模拟渲染队列导出
            this.log('🎭 Demo模式：模拟渲染队列导出', 'debug');
            const format = options.format || 'png';
            const tempFileName = `temp_${item.name}_${Date.now()}${this.supportedFormats[format].extension}`;
            const tempPath = this.joinPath('C:/Temp', tempFileName);
            this.log(`📄 Demo模式临时文件: ${tempPath}`, 'debug');
            return tempPath;
        }
        
        // CEP模式：使用渲染队列
        const script = `
            try {
                var project = app.project;
                var item = project.item(${item.id});
                
                // 创建渲染队列项
                var rq = app.project.renderQueue;
                var rqItem = rq.items.add(item);
                
                // 配置输出设置
                var om = rqItem.outputModule(1);
                om.applyTemplate("PNG Sequence");
                om.file = new File("${this.joinPath(this.getTempPath(), item.name)}");
                
                // 开始渲染
                rq.render();
                
                "${this.joinPath(this.getTempPath(), item.name + '.png')}";
                
            } catch (e) {
                throw e;
            }
        `;
        
        const result = await this.aeExtension.executeExtendScript(script);
        
        if (typeof result === 'string' && result.includes(this.getTempPath())) {
            this.log(`📄 项目导出到临时位置成功: ${result}`, 'debug');
            return result;
        } else {
            throw new Error(result || '项目导出失败');
        }
        
    } catch (error) {
        this.log(`通过渲染队列导出项目失败: ${error.message}`, 'error');
        return null;
    }
}
```

### 路径和文件操作

```javascript
/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {Promise<boolean>} 文件是否存在
 */
async checkFileExists(filePath) {
    try {
        if (window.__DEMO_MODE_ACTIVE__) {
            // Demo模式：模拟文件存在检查
            return true;
        }
        
        // CEP模式：使用ExtendScript检查文件
        const script = `
            var file = new File("${this.normalizePath(filePath)}");
            file.exists;
        `;
        
        const result = await this.aeExtension.executeExtendScript(script);
        return result === true;
        
    } catch (error) {
        this.log(`检查文件存在失败: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 复制文件
 * @param {string} sourcePath - 源路径
 * @param {string} targetPath - 目标路径
 * @returns {Promise<Object>} 复制结果
 */
async copyFile(sourcePath, targetPath) {
    try {
        if (window.__DEMO_MODE_ACTIVE__) {
            // Demo模式：模拟文件复制
            this.log(`🎭 Demo模式：模拟复制文件 ${sourcePath} -> ${targetPath}`, 'debug');
            return { success: true };
        }
        
        // CEP模式：使用ExtendScript复制文件
        const script = `
            try {
                var sourceFile = new File("${this.normalizePath(sourcePath)}");
                var targetFile = new File("${this.normalizePath(targetPath)}");
                
                if (!sourceFile.exists) {
                    throw "源文件不存在";
                }
                
                var result = sourceFile.copy(targetFile);
                { success: result, targetPath: targetFile.fsName }
            } catch (e) {
                { success: false, error: e.message }
            }
        `;
        
        const result = await this.aeExtension.executeExtendScript(script);
        
        if (result.success) {
            this.log(`📄 文件复制成功: ${sourcePath} -> ${targetPath}`, 'debug');
            return result;
        } else {
            throw new Error(result.error || '文件复制失败');
        }
        
    } catch (error) {
        this.log(`文件复制失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 解决文件名冲突
 * @param {string} targetPath - 目标路径
 * @returns {Promise<string>} 解决冲突后的路径
 */
async resolveFileNameConflict(targetPath) {
    try {
        let counter = 1;
        const basePath = this.removeFileExtension(targetPath);
        const extension = this.getFileExtension(targetPath);
        
        let newPath = targetPath;
        
        while (await this.checkFileExists(newPath)) {
            const fileName = `${basePath} (${counter})${extension}`;
            newPath = fileName;
            counter++;
            
            // 防止无限循环
            if (counter > 1000) {
                throw new Error('文件名冲突解决失败：达到最大重试次数');
            }
        }
        
        this.log(`🔄 文件名冲突已解决: ${targetPath} -> ${newPath}`, 'debug');
        return newPath;
        
    } catch (error) {
        this.log(`解决文件名冲突失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 浏览文件夹
 * @returns {Promise<Object>} 浏览结果
 */
async browseFolder() {
    try {
        if (window.__DEMO_MODE_ACTIVE__) {
            // Demo模式：模拟文件夹选择
            if (window.demoFileSystem) {
                const result = window.demoFileSystem.showFolderPicker({
                    title: '选择导出文件夹',
                    mode: 'selectFolder'
                });
                
                return {
                    success: result.success,
                    folderPath: result.folderPath || null
                };
            } else {
                // 降级到输入框
                const folderPath = prompt('请输入导出文件夹路径:');
                if (folderPath && folderPath.trim()) {
                    return {
                        success: true,
                        folderPath: folderPath.trim()
                    };
                } else {
                    return {
                        success: false,
                        error: '用户取消了文件夹选择'
                    };
                }
            }
        }
        
        // CEP模式：使用ExtendScript浏览文件夹
        const script = `
            try {
                var folder = Folder.selectDialog("选择导出文件夹");
                if (folder) {
                    { success: true, folderPath: folder.fsName }
                } else {
                    { success: false, error: "用户取消了选择" }
                }
            } catch (e) {
                { success: false, error: e.message }
            }
        `;
        
        const result = await this.aeExtension.executeExtendScript(script);
        return result;
        
    } catch (error) {
        this.log(`浏览文件夹失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 创建文件夹
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Object>} 创建结果
 */
async createFolder(folderPath) {
    try {
        if (window.__DEMO_MODE_ACTIVE__) {
            // Demo模式：模拟创建文件夹
            this.log(`🎭 Demo模式：模拟创建文件夹: ${folderPath}`, 'debug');
            return { success: true };
        }
        
        // CEP模式：使用ExtendScript创建文件夹
        const script = `
            try {
                var folder = new Folder("${this.normalizePath(folderPath)}");
                if (!folder.exists) {
                    folder.create();
                }
                { success: true }
            } catch (e) {
                { success: false, error: e.message }
            }
        `;
        
        const result = await this.aeExtension.executeExtendScript(script);
        
        if (result.success) {
            this.log(`📁 文件夹创建成功: ${folderPath}`, 'debug');
            return result;
        } else {
            throw new Error(result.error || '创建文件夹失败');
        }
        
    } catch (error) {
        this.log(`创建文件夹失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 获取项目类型
 * @param {Object} item - 项目对象
 * @returns {string} 项目类型
 */
getItemType(item) {
    try {
        if (item.typeName && item.typeName.toLowerCase().includes('comp')) {
            return 'composition';
        } else if (item.typeName && item.typeName.toLowerCase().includes('footage')) {
            return 'footage';
        } else if (item.typeName) {
            return item.typeName.toLowerCase();
        } else {
            return 'other';
        }
    } catch (error) {
        this.log(`获取项目类型失败: ${error.message}`, 'error');
        return 'other';
    }
}

/**
 * 提取文件夹路径
 * @param {string} filePath - 文件路径
 * @returns {string} 文件夹路径
 */
extractFolderPath(filePath) {
    try {
        if (!filePath) return '';
        
        // 规范化路径分隔符
        let path = filePath.replace(/\\/g, '/');
        
        // 移除文件名部分
        const lastSlashIndex = path.lastIndexOf('/');
        if (lastSlashIndex !== -1) {
            return path.substring(0, lastSlashIndex);
        }
        
        return '';
    } catch (error) {
        this.log(`提取文件夹路径失败: ${error.message}`, 'error');
        return '';
    }
}

/**
 * 提取文件名
 * @param {string} filePath - 文件路径
 * @returns {string} 文件名
 */
extractFileName(filePath) {
    try {
        if (!filePath) return '';
        
        // 规范化路径分隔符
        const path = filePath.replace(/\\/g, '/');
        
        // 获取最后一个分隔符后的内容
        const lastSlashIndex = path.lastIndexOf('/');
        if (lastSlashIndex !== -1) {
            return path.substring(lastSlashIndex + 1);
        }
        
        return path;
    } catch (error) {
        this.log(`提取文件名失败: ${error.message}`, 'error');
        return '';
    }
}

/**
 * 获取文件扩展名
 * @param {string} filePath - 文件路径
 * @returns {string} 扩展名
 */
getFileExtension(filePath) {
    try {
        if (!filePath) return '';
        
        const lastDotIndex = filePath.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            return filePath.substring(lastDotIndex);
        }
        
        return '';
    } catch (error) {
        this.log(`获取文件扩展名失败: ${error.message}`, 'error');
        return '';
    }
}

/**
 * 移除文件扩展名
 * @param {string} filePath - 文件路径
 * @returns {string} 移除扩展名后的路径
 */
removeFileExtension(filePath) {
    try {
        if (!filePath) return filePath;
        
        const lastDotIndex = filePath.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            return filePath.substring(0, lastDotIndex);
        }
        
        return filePath;
    } catch (error) {
        this.log(`移除文件扩展名失败: ${error.message}`, 'error');
        return filePath;
    }
}

/**
 * 连接路径
 * @param {...string} paths - 路径片段
 * @returns {string} 连接后的路径
 */
joinPath(...paths) {
    try {
        if (paths.length === 0) return '';
        
        // 移除空路径片段
        const validPaths = paths.filter(p => p && typeof p === 'string');
        
        if (validPaths.length === 0) return '';
        
        // 规范化路径分隔符
        let normalizedPath = validPaths[0].replace(/\\/g, '/');
        
        for (let i = 1; i < validPaths.length; i++) {
            let pathSegment = validPaths[i].replace(/\\/g, '/');
            
            // 移除开头的分隔符
            if (pathSegment.startsWith('/')) {
                pathSegment = pathSegment.substring(1);
            }
            
            // 添加分隔符
            if (!normalizedPath.endsWith('/')) {
                normalizedPath += '/';
            }
            
            normalizedPath += pathSegment;
        }
        
        return normalizedPath;
    } catch (error) {
        this.log(`连接路径失败: ${error.message}`, 'error');
        return paths.join('/');
    }
}

/**
 * 规范化路径
 * @param {string} path - 路径
 * @returns {string} 规范化后的路径
 */
normalizePath(path) {
    try {
        if (!path) return path;
        
        // 规范化路径分隔符
        let normalized = path.replace(/\\/g, '/');
        
        // 解决相对路径
        if (normalized.includes('..')) {
            const parts = normalized.split('/');
            const resolvedParts = [];
            
            for (const part of parts) {
                if (part === '..') {
                    resolvedParts.pop();
                } else if (part !== '.') {
                    resolvedParts.push(part);
                }
            }
            
            normalized = resolvedParts.join('/');
        }
        
        return normalized;
    } catch (error) {
        this.log(`规范化路径失败: ${error.message}`, 'error');
        return path;
    }
}

/**
 * 获取临时路径
 * @returns {string} 临时路径
 */
getTempPath() {
    try {
        if (this.config.tempPath) {
            return this.config.tempPath;
        }
        
        if (window.__DEMO_MODE_ACTIVE__) {
            return 'C:/Temp';
        }
        
        // CEP模式：获取系统临时路径
        try {
            const tempPath = this.csInterface.getSystemPath(window.SystemPath.TEMP);
            return tempPath;
        } catch (error) {
            // 备用临时路径
            return 'C:/Temp';
        }
    } catch (error) {
        this.log(`获取临时路径失败: ${error.message}`, 'error');
        return 'C:/Temp';
    }
}

/**
 * 从路径获取文件对象
 * @param {string} filePath - 文件路径
 * @returns {Promise<File>} 文件对象
 */
async getFileFromPath(filePath) {
    try {
        // 在浏览器环境中，无法直接从路径创建File对象
        // 这里返回一个模拟的File对象，实际应用中可能需要其他方式
        return new File([], this.extractFileName(filePath), { type: 'application/octet-stream' });
    } catch (error) {
        this.log(`从路径获取文件失败: ${error.message}`, 'error');
        throw error;
    }
}
```

### 验证和进度管理

```javascript
/**
 * 验证导出条件
 * @param {Object} options - 导出选项
 * @returns {Object} 验证结果
 */
validateExportConditions(options = {}) {
    try {
        // 检查AE项目状态
        const projectValid = this.projectStatusChecker.validateProjectStatus({
            requireProject: true,
            requireActiveComposition: false, // 导出不一定需要活动合成
            showWarning: true
        });
        
        if (!projectValid) {
            return {
                valid: false,
                error: 'AE项目状态不满足导出条件'
            };
        }
        
        // 检查Eagle连接（如果导出到Eagle）
        if (options.destination === 'eagle') {
            const eagleConnected = this.eagleConnectionManager.validateConnection();
            if (!eagleConnected) {
                return {
                    valid: false,
                    error: 'Eagle连接不可用'
                };
            }
        }
        
        // 检查导出格式设置
        const exportFormat = options.format || this.settingsManager.getField('export.format');
        if (!this.supportedFormats[exportFormat]) {
            return {
                valid: false,
                error: `不支持的导出格式: ${exportFormat}`
            };
        }
        
        // 检查目标文件夹（如果导出到文件夹）
        if (options.destination === 'folder' && !options.targetFolder) {
            return {
                valid: false,
                error: '导出到文件夹时必须指定目标文件夹'
            };
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        this.log(`验证导出条件失败: ${error.message}`, 'error');
        return {
            valid: false,
            error: error.message
        };
    }
}

/**
 * 验证单个项目
 * @param {Object} item - 项目对象
 * @returns {Object} 验证结果
 */
validateItemForExport(item) {
    try {
        if (!item) {
            return {
                valid: false,
                error: '项目对象不能为空'
            };
        }
        
        if (!item.name) {
            return {
                valid: false,
                error: '项目名称不能为空'
            };
        }
        
        if (!item.id) {
            return {
                valid: false,
                error: '项目ID不能为空'
            };
        }
        
        // 检查项目类型是否支持导出
        const itemType = this.getItemType(item);
        if (!['composition', 'footage', 'other'].includes(itemType)) {
            return {
                valid: false,
                error: `不支持的项目类型: ${itemType}`
            };
        }
        
        // 检查项目是否存在（在AE项目中）
        // 这里可以添加更详细的验证逻辑
        
        return {
            valid: true
        };
        
    } catch (error) {
        this.log(`验证项目失败: ${error.message}`, 'error');
        return {
            valid: false,
            error: error.message
        };
    }
}

/**
 * 更新导出进度
 */
updateProgress() {
    try {
        const total = this.currentExport.total;
        const completed = this.currentExport.completed + this.currentExport.failed;
        const progress = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
        
        this.currentExport.progress = progress;
        
        // 计算剩余时间
        if (this.currentExport.startTime && completed > 0) {
            const elapsed = Date.now() - this.currentExport.startTime;
            const rate = completed / (elapsed / 1000); // items per second
            const remaining = total - completed;
            const remainingTime = remaining / rate; // seconds
            
            this.currentExport.estimatedTime = remainingTime;
        }
        
        this.log(`📈 导出进度: ${progress.toFixed(1)}% (${completed}/${total})`, 'debug');
        
        // 调用进度回调
        if (this.callbacks.onProgress) {
            this.callbacks.onProgress({
                progress: progress,
                completed: completed,
                total: total,
                currentFile: this.currentExport.currentFile,
                estimatedTime: this.currentExport.estimatedTime
            });
        }
        
    } catch (error) {
        this.log(`更新进度失败: ${error.message}`, 'error');
    }
}

/**
 * 估算导出时间
 * @param {number} itemCount - 项目数量
 * @returns {number} 估算时间（秒）
 */
estimateExportTime(itemCount) {
    // 基于经验估算，可以结合历史数据进行更准确的估算
    const avgTimePerItem = 10; // 平均每项目10秒（这会根据项目复杂度而变化）
    return itemCount * avgTimePerItem;
}

/**
 * 分块数组
 * @param {Array} array - 原数组
 * @param {number} chunkSize - 块大小
 * @returns {Array} 分块后的数组
 */
chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

/**
 * 取消导出
 */
cancelExport() {
    try {
        this.log('🚫 取消导出操作', 'warning');
        
        this.currentExport.active = false;
        
        // 调用取消回调
        if (this.callbacks.onCancel) {
            this.callbacks.onCancel();
        }
        
    } catch (error) {
        this.log(`取消导出失败: ${error.message}`, 'error');
    }
}
```

### 错误处理和恢复

```javascript
/**
 * 处理导出错误
 * @param {Object} item - 出错的项目
 * @param {Error} error - 错误对象
 * @param {number} retryCount - 重试次数
 * @returns {Object} 处理结果
 */
async handleExportError(item, error, retryCount = 0) {
    try {
        this.log(`⚠️ 处理导出错误 (尝试 ${retryCount + 1}/${this.config.retryAttempts}): ${error.message}`, 'warning', {
            item: item.name,
            error: error.message,
            retryCount: retryCount
        });
        
        // 如果重试次数未达到上限，尝试重试
        if (retryCount < this.config.retryAttempts) {
            // 等待重试延迟
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (retryCount + 1)));
            
            // 递增重试次数
            retryCount++;
            
            // 重新尝试导出
            const result = await this.exportFile(item, { retryCount: retryCount });
            
            if (result.success) {
                this.log(`✅ 重试成功: ${item.name}`, 'success');
                return result;
            } else {
                // 重试失败，继续处理错误
                return await this.handleExportError(item, new Error(result.error), retryCount);
            }
        } else {
            // 重试次数达到上限，记录错误
            this.log(`❌ 导出失败，已达到最大重试次数: ${item.name}`, 'error', {
                item: item.name,
                error: error.message
            });
            
            return {
                success: false,
                item: item,
                error: error.message,
                retryCount: retryCount
            };
        }
        
    } catch (handlingError) {
        this.log(`处理导出错误时发生异常: ${handlingError.message}`, 'error');
        
        return {
            success: false,
            item: item,
            error: handlingError.message,
            retryCount: retryCount
        };
    }
}

/**
 * 清理导出过程中产生的临时文件
 * @param {Array} tempFiles - 临时文件列表
 */
async cleanupTempFiles(tempFiles) {
    try {
        if (!tempFiles || tempFiles.length === 0) {
            return;
        }
        
        this.log(`🧹 清理 ${tempFiles.length} 个临时文件`, 'debug');
        
        for (const tempFile of tempFiles) {
            try {
                if (await this.checkFileExists(tempFile.path)) {
                    if (window.__DEMO_MODE_ACTIVE__) {
                        // Demo模式：模拟删除
                        this.log(`🎭 Demo模式：模拟删除临时文件: ${tempFile.path}`, 'debug');
                    } else {
                        // CEP模式：使用ExtendScript删除文件
                        const script = `
                            try {
                                var file = new File("${this.normalizePath(tempFile.path)}");
                                if (file.exists) {
                                    file.remove();
                                }
                                true;
                            } catch (e) {
                                false;
                            }
                        `;
                        
                        await this.aeExtension.executeExtendScript(script);
                    }
                    
                    this.log(`🗑️ 临时文件已删除: ${tempFile.path}`, 'debug');
                }
            } catch (deleteError) {
                this.log(`删除临时文件失败: ${tempFile.path} - ${deleteError.message}`, 'warning');
            }
        }
        
    } catch (error) {
        this.log(`清理临时文件时发生异常: ${error.message}`, 'error');
    }
}

/**
 * 回滚导出操作（当导出失败时清理已导出的文件）
 * @param {Array} exportedFiles - 已导出的文件列表
 */
async rollbackExport(exportedFiles) {
    try {
        if (!exportedFiles || exportedFiles.length === 0) {
            return;
        }
        
        this.log(`🔄 回滚导出操作，清理 ${exportedFiles.length} 个已导出的文件`, 'warning');
        
        // 在DEMO模式下模拟回滚
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：模拟回滚操作', 'debug');
            return;
        }
        
        // 实际的回滚操作
        // 这里会根据导出位置删除相应的文件
        for (const exportedFile of exportedFiles) {
            try {
                if (await this.checkFileExists(exportedFile.path)) {
                    const deleteResult = await this.deleteFile(exportedFile.path);
                    if (deleteResult.success) {
                        this.log(`🗑️ 已回滚导出的文件: ${exportedFile.path}`, 'debug');
                    } else {
                        this.log(`删除已导出文件失败: ${exportedFile.path} - ${deleteResult.error}`, 'warning');
                    }
                }
            } catch (rollbackError) {
                this.log(`回滚导出失败: ${exportedFile.path} - ${rollbackError.message}`, 'warning');
            }
        }
        
    } catch (error) {
        this.log(`回滚导出操作时发生异常: ${error.message}`, 'error');
    }
}

/**
 * 删除文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 删除结果
 */
async deleteFile(filePath) {
    try {
        if (window.__DEMO_MODE_ACTIVE__) {
            // Demo模式：模拟删除
            this.log(`🎭 Demo模式：模拟删除文件: ${filePath}`, 'debug');
            return { success: true };
        }
        
        // CEP模式：使用ExtendScript删除文件
        const script = `
            try {
                var file = new File("${this.normalizePath(filePath)}");
                if (file.exists) {
                    file.remove();
                }
                { success: true }
            } catch (e) {
                { success: false, error: e.message }
            }
        `;
        
        const result = await this.aeExtension.executeExtendScript(script);
        
        if (result.success) {
            return { success: true };
        } else {
            throw new Error(result.error || '删除文件失败');
        }
        
    } catch (error) {
        this.log(`删除文件失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}
```

## API参考

### 核心方法

#### ExportManager
导出管理器主类

```javascript
/**
 * 导出管理器
 * 负责处理从After Effects项目到Eagle素材库的素材导出流程
 */
class ExportManager
```

#### constructor()
构造函数

```javascript
/**
 * 构造函数
 * @param {Object} aeExtension - AE扩展实例
 */
constructor(aeExtension)
```

#### exportFiles()
导出文件到目标位置

```javascript
/**
 * 导出文件到目标位置
 * @param {Array} items - 要导出的项目列表
 * @param {Object} options - 导出选项
 * @returns {Object} 导出结果
 */
async exportFiles(items, options = {})
```

#### exportFile()
导出单个项目

```javascript
/**
 * 导出单个项目
 * @param {Object} item - 要导出的项目
 * @param {Object} options - 导出选项
 * @returns {Object} 导出结果
 */
async exportFile(item, options)
```

#### exportToEagle()
导出到Eagle素材库

```javascript
/**
 * 导出到Eagle素材库
 * @param {Object} item - 项目对象
 * @param {Object} options - 选项
 * @returns {Object} 导出结果
 */
async exportToEagle(item, options = {})
```

#### exportToFolder()
导出到指定文件夹

```javascript
/**
 * 导出到指定文件夹
 * @param {Object} item - 项目对象
 * @param {Object} options - 选项
 * @returns {Object} 导出结果
 */
async exportToFolder(item, options = {})
```

#### checkFileExists()
检查文件是否存在

```javascript
/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {Promise<boolean>} 文件是否存在
 */
async checkFileExists(filePath)
```

#### copyFile()
复制文件

```javascript
/**
 * 复制文件
 * @param {string} sourcePath - 源路径
 * @param {string} targetPath - 目标路径
 * @returns {Promise<Object>} 复制结果
 */
async copyFile(sourcePath, targetPath)
```

#### resolveFileNameConflict()
解决文件名冲突

```javascript
/**
 * 解决文件名冲突
 * @param {string} targetPath - 目标路径
 * @returns {Promise<string>} 解决冲突后的路径
 */
async resolveFileNameConflict(targetPath)
```

#### browseFolder()
浏览文件夹

```javascript
/**
 * 浏览文件夹
 * @returns {Promise<Object>} 浏览结果
 */
async browseFolder()
```

#### createFolder()
创建文件夹

```javascript
/**
 * 创建文件夹
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Object>} 创建结果
 */
async createFolder(folderPath)
```

#### getItemType()
获取项目类型

```javascript
/**
 * 获取项目类型
 * @param {Object} item - 项目对象
 * @returns {string} 项目类型
 */
getItemType(item)
```

#### extractFolderPath()
提取文件夹路径

```javascript
/**
 * 提取文件夹路径
 * @param {string} filePath - 文件路径
 * @returns {string} 文件夹路径
 */
extractFolderPath(filePath)
```

#### extractFileName()
提取文件名

```javascript
/**
 * 提取文件名
 * @param {string} filePath - 文件路径
 * @returns {string} 文件名
 */
extractFileName(filePath)
```

#### getFileExtension()
获取文件扩展名

```javascript
/**
 * 获取文件扩展名
 * @param {string} filePath - 文件路径
 * @returns {string} 扩展名
 */
getFileExtension(filePath)
```

#### removeFileExtension()
移除文件扩展名

```javascript
/**
 * 移除文件扩展名
 * @param {string} filePath - 文件路径
 * @returns {string} 移除扩展名后的路径
 */
removeFileExtension(filePath)
```

#### joinPath()
连接路径

```javascript
/**
 * 连接路径
 * @param {...string} paths - 路径片段
 * @returns {string} 连接后的路径
 */
joinPath(...paths)
```

#### normalizePath()
规范化路径

```javascript
/**
 * 规范化路径
 * @param {string} path - 路径
 * @returns {string} 规范化后的路径
 */
normalizePath(path)
```

#### getTempPath()
获取临时路径

```javascript
/**
 * 获取临时路径
 * @returns {string} 临时路径
 */
getTempPath()
```

#### validateExportConditions()
验证导出条件

```javascript
/**
 * 验证导出条件
 * @param {Object} options - 导出选项
 * @returns {Object} 验证结果
 */
validateExportConditions(options = {})
```

#### validateItemForExport()
验证单个项目

```javascript
/**
 * 验证单个项目
 * @param {Object} item - 项目对象
 * @returns {Object} 验证结果
 */
validateItemForExport(item)
```

#### updateProgress()
更新导出进度

```javascript
/**
 * 更新导出进度
 */
updateProgress()
```

#### cancelExport()
取消导出

```javascript
/**
 * 取消导出
 */
cancelExport()
```

#### handleExportError()
处理导出错误

```javascript
/**
 * 处理导出错误
 * @param {Object} item - 出错的项目
 * @param {Error} error - 错误对象
 * @param {number} retryCount - 重试次数
 * @returns {Object} 处理结果
 */
async handleExportError(item, error, retryCount = 0)
```

#### cleanupTempFiles()
清理临时文件

```javascript
/**
 * 清理导出过程中产生的临时文件
 * @param {Array} tempFiles - 临时文件列表
 */
async cleanupTempFiles(tempFiles)
```

#### rollbackExport()
回滚导出操作

```javascript
/**
 * 回滚导出操作（当导出失败时清理已导出的文件）
 * @param {Array} exportedFiles - 已导出的文件列表
 */
async rollbackExport(exportedFiles)
```

### 导出选项

```javascript
/**
 * 导出选项
 * @typedef {Object} ExportOptions
 * @property {string} destination - 导出目标 ('eagle', 'folder')
 * @property {string} format - 导出格式 ('png', 'jpg', 'jpeg', 'tga', 'tiff', 'mov', 'mp4', 'psd')
 * @property {number} quality - 质量 (0-100)
 * @property {string} targetFolder - 目标文件夹路径 (destination为'folder'时使用)
 * @property {string} namingRule - 命名规则
 * @property {boolean} includeMetadata - 是否包含元数据
 * @property {boolean} addToEagleLibrary - 是否添加到Eagle库
 * @property {string} eagleFolderId - Eagle文件夹ID
 * @property {boolean} stopOnError - 遇到错误时是否停止导出
 * @property {boolean} forceOverwrite - 是否强制覆盖同名文件
 */
```

### 导出结果

```javascript
/**
 * 导出结果
 * @typedef {Object} ExportResult
 * @property {boolean} success - 是否成功
 * @property {Array} exportedFiles - 成功导出的文件列表
 * @property {Array} failedFiles - 导出失败的文件列表
 * @property {number} totalProcessed - 总处理数量
 * @property {number} totalErrors - 总错误数量
 * @property {number} exportTime - 导出耗时（毫秒）
 * @property {string} error - 错误信息（失败时）
 */
```

## 使用示例

### 基本使用

#### 导出单个项目
```javascript
// 创建导出管理器实例
const exportManager = new ExportManager(aeExtension);

// 准备项目对象
const itemToExport = {
    name: 'MyComposition',
    id: 1,
    type: 'composition',
    typeName: 'Composition'
};

// 执行导出到Eagle（使用默认设置）
const result = await exportManager.exportFiles([itemToExport], {
    destination: 'eagle',
    format: 'png',
    quality: 100
});

if (result.success) {
    console.log(`✅ 成功导出 ${result.exportedFiles.length} 个项目`);
    console.log('导出的文件:', result.exportedFiles);
} else {
    console.log(`❌ 导出失败，错误数量: ${result.totalErrors}`);
    console.log('失败的文件:', result.failedFiles);
}
```

#### 导出多个项目
```javascript
// 准备多个项目
const itemsToExport = [
    {
        name: 'LogoAnimation',
        id: 1,
        type: 'composition',
        typeName: 'Composition'
    },
    {
        name: 'BackgroundImage',
        id: 2,
        type: 'footage',
        typeName: 'Footage'
    },
    {
        name: 'TitleSequence',
        id: 3,
        type: 'composition',
        typeName: 'Composition'
    }
];

// 执行批量导出到指定文件夹
const result = await exportManager.exportFiles(itemsToExport, {
    destination: 'folder',
    targetFolder: 'D:/Exported_Assets',
    format: 'jpg',
    quality: 90,
    namingRule: '{name}_{timestamp}'
});

console.log('批量导出结果:', result);
```

#### 监听导出进度
```javascript
// 设置进度回调
exportManager.callbacks.onProgress = (progressData) => {
    console.log(`导出进度: ${progressData.progress.toFixed(1)}%`);
    console.log(`已处理: ${progressData.completed}/${progressData.total}`);
    console.log(`当前项目: ${progressData.currentFile?.name || 'N/A'}`);
    
    // 更新UI进度条
    updateProgressBar(progressData.progress);
};

// 设置完成回调
exportManager.callbacks.onComplete = (result) => {
    console.log('导出完成:', result);
    showExportSummary(result);
};

// 设置错误回调
exportManager.callbacks.onError = (error) => {
    console.error('导出过程中发生错误:', error);
    showErrorNotification(error.message);
};

// 执行导出
await exportManager.exportFiles(itemsToExport);
```

### 高级使用

#### 自定义导出格式
```javascript
// 添加自定义格式支持
exportManager.supportedFormats['webp'] = {
    extension: '.webp',
    quality: 90,
    type: 'image'
};

// 使用自定义格式导出
const webpExportResult = await exportManager.exportFiles(itemsToExport, {
    destination: 'folder',
    targetFolder: 'D:/WebP_Assets',
    format: 'webp',
    quality: 85
});

console.log('WebP格式导出结果:', webpExportResult);

// 使用自定义命名规则
const customNamingResult = await exportManager.exportFiles(itemsToExport, {
    destination: 'eagle',
    format: 'png',
    namingRule: 'PROJECT_{name}_{timestamp}',
    quality: 100
});

console.log('自定义命名规则导出结果:', customNamingResult);
```

#### 错误处理和重试
```javascript
// 创建带错误处理的导出函数
async function robustExport(items) {
    try {
        const result = await exportManager.exportFiles(items, {
            stopOnError: false, // 遇到错误不停止，继续处理其他项目
            retryAttempts: 2,   // 设置重试次数
            forceOverwrite: true // 强制覆盖同名文件
        });
        
        if (!result.success) {
            console.log(`⚠️ 部分项目导出失败 (${result.totalErrors}/${result.totalProcessed})`);
            
            // 处理失败的项目
            for (const failedItem of result.failedFiles) {
                console.error(`❌ ${failedItem.item.name}: ${failedItem.error}`);
                
                // 根据错误类型采取相应措施
                if (failedItem.error.includes('权限')) {
                    console.log('💡 建议检查文件夹权限');
                } else if (failedItem.error.includes('磁盘')) {
                    console.log('💡 建议检查磁盘空间');
                } else if (failedItem.error.includes('Eagle')) {
                    console.log('💡 建议检查Eagle连接状态');
                }
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('导出过程异常:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 使用带错误处理的导出
const robustResult = await robustExport(itemsToExport);
```

#### 性能优化的批量导出
```javascript
// 创建高性能导出助手
class HighPerformanceExporter {
    constructor(exportManager) {
        this.exportManager = exportManager;
        this.batchSize = 3; // 批处理大小（导出比较耗时，使用较小的批量）
        this.concurrentExports = 2; // 并发导出数
    }
    
    /**
     * 批量导出大量项目
     * @param {Array} items - 项目列表
     * @returns {Object} 导出结果
     */
    async exportLargeBatch(items) {
        console.log(`🔄 开始批量导出 ${items.length} 个项目...`);
        
        // 按项目类型分组，优化导出顺序
        const groupedItems = this.groupItemsByType(items);
        
        const results = {
            success: true,
            exportedFiles: [],
            failedFiles: [],
            totalProcessed: 0,
            totalErrors: 0
        };
        
        // 按组处理项目
        for (const [itemType, itemGroup] of Object.entries(groupedItems)) {
            console.log(`📁 处理 ${itemType} 类型项目: ${itemGroup.length} 个`);
            
            // 分批处理
            const batches = this.chunkArray(itemGroup, this.batchSize);
            
            for (const batch of batches) {
                const batchResult = await this.exportManager.exportFiles(batch, {
                    destination: 'folder',
                    targetFolder: this.generateBatchFolder(itemType),
                    format: 'png',
                    quality: 100
                });
                
                results.exportedFiles.push(...batchResult.exportedFiles);
                results.failedFiles.push(...batchResult.failedFiles);
                results.totalProcessed += batchResult.totalProcessed;
                results.totalErrors += batchResult.totalErrors;
                
                if (batchResult.totalErrors > 0) {
                    results.success = false;
                }
                
                // 批次间暂停，避免系统负载过高
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        console.log(`✅ 批量导出完成: ${results.totalProcessed} 个项目，${results.totalErrors} 个失败`);
        return results;
    }
    
    /**
     * 按项目类型分组
     * @param {Array} items - 项目列表
     * @returns {Object} 分组结果
     */
    groupItemsByType(items) {
        const grouped = {};
        
        for (const item of items) {
            const itemType = this.exportManager.getItemType(item);
            
            if (!grouped[itemType]) {
                grouped[itemType] = [];
            }
            
            grouped[itemType].push(item);
        }
        
        return grouped;
    }
    
    /**
     * 生成批次文件夹
     * @param {string} itemType - 项目类型
     * @returns {string} 文件夹路径
     */
    generateBatchFolder(itemType) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '');
        return `D:/Exported_${itemType}_${timestamp}`;
    }
    
    /**
     * 分块数组
     * @param {Array} array - 原数组
     * @param {number} chunkSize - 块大小
     * @returns {Array} 分块后的数组
     */
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}

// 使用高性能导出
const highPerformanceExporter = new HighPerformanceExporter(exportManager);
const largeItemList = generateLargeItemList(); // 假设有大量项目

const largeExportResult = await highPerformanceExporter.exportLargeBatch(largeItemList);
console.log('大量项目导出结果:', largeExportResult);
```

#### 导出状态监控
```javascript
// 创建导出状态监控器
class ExportStatusMonitor {
    constructor(exportManager) {
        this.exportManager = exportManager;
        this.monitorInterval = null;
        this.statusHistory = [];
        this.maxHistory = 100;
    }
    
    /**
     * 开始监控导出状态
     */
    startMonitoring() {
        if (this.monitorInterval) {
            console.log('📊 导出监控已在运行');
            return;
        }
        
        this.monitorInterval = setInterval(() => {
            this.checkExportStatus();
        }, 2000); // 每2秒检查一次（导出通常比较耗时）
        
        console.log('📊 开始监控导出状态');
    }
    
    /**
     * 停止监控导出状态
     */
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            console.log('📊 停止监控导出状态');
        }
    }
    
    /**
     * 检查导出状态
     */
    checkExportStatus() {
        if (this.exportManager.currentExport.active) {
            const status = {
                ...this.exportManager.currentExport,
                timestamp: Date.now(),
                active: true
            };
            
            this.statusHistory.push(status);
            
            // 限制历史记录大小
            if (this.statusHistory.length > this.maxHistory) {
                this.statusHistory = this.statusHistory.slice(-this.maxHistory);
            }
            
            // 计算导出速度
            this.calculateExportSpeed(status);
            
            // 输出监控信息
            this.logStatus(status);
        }
    }
    
    /**
     * 计算导出速度
     * @param {Object} status - 当前状态
     */
    calculateExportSpeed(status) {
        if (this.statusHistory.length > 1) {
            const previousStatus = this.statusHistory[this.statusHistory.length - 2];
            const timeDiff = (status.timestamp - previousStatus.timestamp) / 1000; // 秒
            const itemDiff = (status.completed + status.failed) - (previousStatus.completed + previousStatus.failed);
            
            if (timeDiff > 0) {
                const speed = itemDiff / timeDiff;
                status.exportSpeed = speed;
            }
        }
    }
    
    /**
     * 输出状态信息
     * @param {Object} status - 状态对象
     */
    logStatus(status) {
        const progress = status.progress.toFixed(1);
        const speed = status.exportSpeed ? status.exportSpeed.toFixed(2) : '0.00';
        const eta = status.estimatedTime ? (status.estimatedTime).toFixed(0) : 'unknown';
        
        console.log(`📊 进度: ${progress}% | 速度: ${speed} items/s | 预计剩余: ${eta}s`);
    }
    
    /**
     * 获取导出统计
     * @returns {Object} 统计信息
     */
    getStats() {
        if (this.statusHistory.length === 0) {
            return null;
        }
        
        const latest = this.statusHistory[this.statusHistory.length - 1];
        const first = this.statusHistory[0];
        
        return {
            currentStatus: latest,
            totalDuration: (latest.timestamp - first.timestamp) / 1000,
            itemsPerSecond: latest.completed / ((latest.timestamp - first.timestamp) / 1000)
        };
    }
    
    /**
     * 导出监控数据
     * @returns {string} JSON格式的监控数据
     */
    exportData() {
        return JSON.stringify({
            timestamp: Date.now(),
            history: this.statusHistory,
            stats: this.getStats()
        }, null, 2);
    }
}

// 使用导出状态监控器
const monitor = new ExportStatusMonitor(exportManager);
monitor.startMonitoring();

// 执行导出
await exportManager.exportFiles(itemsToExport);

// 停止监控
monitor.stopMonitoring();

// 获取统计信息
const stats = monitor.getStats();
console.log('导出统计:', stats);
```

## 最佳实践

### 使用建议

#### 导出前准备
```javascript
// 创建导出准备助手
class ExportPreparationHelper {
    constructor(exportManager) {
        this.exportManager = exportManager;
    }
    
    /**
     * 准备导出操作
     * @param {Array} items - 项目列表
     * @returns {Object} 准备结果
     */
    async prepareExport(items) {
        console.log('🔍 准备导出操作...');
        
        // 1. 验证导出条件
        const conditionsValid = await this.validateExportConditions();
        if (!conditionsValid) {
            return {
                success: false,
                error: '导出条件验证失败'
            };
        }
        
        // 2. 验证所有项目
        const validationResults = await this.validateAllItems(items);
        if (!validationResults.allValid) {
            return {
                success: false,
                error: '部分项目验证失败',
                validationResults: validationResults
            };
        }
        
        // 3. 检查磁盘空间
        const hasEnoughSpace = await this.checkDiskSpace(items);
        if (!hasEnoughSpace) {
            return {
                success: false,
                error: '磁盘空间不足'
            };
        }
        
        // 4. 获取导出设置
        const exportSettings = await this.getExportSettings();
        
        console.log('✅ 导出准备完成');
        
        return {
            success: true,
            validItems: validationResults.validItems,
            invalidItems: validationResults.invalidItems,
            exportSettings: exportSettings
        };
    }
    
    /**
     * 验证导出条件
     * @returns {boolean} 条件是否有效
     */
    async validateExportConditions() {
        try {
            // 检查项目是否存在
            const projectValid = await this.exportManager.projectStatusChecker.validateProjectStatus({
                requireProject: true,
                requireActiveComposition: false,
                showWarning: false
            });
            
            if (!projectValid) {
                console.error('❌ AE项目状态无效');
                return false;
            }
            
            // 检查Eagle连接（如果导出到Eagle）
            const exportToEagle = this.exportManager.settingsManager.getField('export.destination') === 'eagle';
            if (exportToEagle) {
                const eagleConnected = await this.exportManager.eagleConnectionManager.validateConnection();
                if (!eagleConnected) {
                    console.error('❌ Eagle连接无效');
                    return false;
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('验证导出条件失败:', error.message);
            return false;
        }
    }
    
    /**
     * 验证所有项目
     * @param {Array} items - 项目列表
     * @returns {Object} 验证结果
     */
    async validateAllItems(items) {
        const validItems = [];
        const invalidItems = [];
        
        for (const item of items) {
            const validation = this.exportManager.validateItemForExport(item);
            
            if (validation.valid) {
                validItems.push(item);
            } else {
                invalidItems.push({
                    item: item,
                    error: validation.error
                });
            }
        }
        
        return {
            allValid: invalidItems.length === 0,
            validItems: validItems,
            invalidItems: invalidItems
        };
    }
    
    /**
     * 检查磁盘空间
     * @param {Array} items - 项目列表
     * @returns {boolean} 空间是否充足
     */
    async checkDiskSpace(items) {
        try {
            // 预估导出文件大小（这是一个简化版本）
            const estimatedSize = items.length * 10 * 1024 * 1024; // 假设每个项目导出后约10MB
            
            // 检查目标位置的可用空间
            console.log(`📊 预估需要空间: ${(estimatedSize / (1024 * 1024)).toFixed(2)} MB`);
            
            // 这里可以实现真实的磁盘空间检查
            return true; // 简化返回true
            
        } catch (error) {
            console.error('检查磁盘空间失败:', error.message);
            return false;
        }
    }
    
    /**
     * 获取导出设置
     * @returns {Object} 导出设置
     */
    async getExportSettings() {
        return {
            destination: this.exportManager.settingsManager.getField('export.destination'),
            format: this.exportManager.settingsManager.getField('export.format'),
            quality: this.exportManager.settingsManager.getField('export.quality'),
            namingRule: this.exportManager.settingsManager.getField('export.namingTemplate'),
            includeMetadata: this.exportManager.settingsManager.getField('export.includeMetadata')
        };
    }
}

// 使用导出准备助手
const preparationHelper = new ExportPreparationHelper(exportManager);

const preparationResult = await preparationHelper.prepareExport(itemsToExport);
if (preparationResult.success) {
    console.log('✅ 导出准备成功，开始导出项目');
    
    // 使用验证后的项目列表进行导出
    const exportResult = await exportManager.exportFiles(preparationResult.validItems);
    console.log('导出结果:', exportResult);
} else {
    console.log('❌ 导出准备失败:', preparationResult.error);
    
    if (preparationResult.validationResults) {
        console.log('无效项目:', preparationResult.validationResults.invalidItems);
    }
}
```

#### 内存管理
```javascript
// 创建导出内存管理器
class ExportMemoryManager {
    constructor(exportManager) {
        this.exportManager = exportManager;
        this.monitorInterval = null;
        this.gcThreshold = 100 * 1024 * 1024; // 100MB
    }
    
    /**
     * 开始内存监控
     */
    startMonitoring() {
        if (this.monitorInterval) {
            return;
        }
        
        this.monitorInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, 10000); // 每10秒检查一次（导出操作较慢，不需要频繁检查）
        
        console.log('📊 开始内存监控');
    }
    
    /**
     * 停止内存监控
     */
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            console.log('📊 停止内存监控');
        }
    }
    
    /**
     * 检查内存使用
     */
    checkMemoryUsage() {
        if (performance.memory) {
            const memory = performance.memory;
            const usage = memory.usedJSHeapSize;
            const total = memory.totalJSHeapSize;
            const limit = memory.jsHeapSizeLimit;
            
            console.log(`📊 内存使用: ${(usage / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB`);
            
            if (usage > this.gcThreshold) {
                console.warn(`⚠️ 内存使用过高: ${(usage / 1024 / 1024).toFixed(2)}MB`);
                
                // 执行内存清理
                this.performCleanup();
            }
        }
    }
    
    /**
     * 执行清理操作
     */
    performCleanup() {
        console.log('🧹 执行内存清理...');
        
        // 清理不必要的临时数据
        if (this.exportManager.activeExports && this.exportManager.activeExports.size === 0) {
            // 清理导出队列中的完成项
            this.exportManager.exportQueue = this.exportManager.exportQueue.filter(
                item => item.status !== 'complete' && item.status !== 'error'
            );
        }
        
        // 强制垃圾回收（如果可用）
        if (window.gc) {
            window.gc();
            console.log('🧹 手动垃圾回收完成');
        }
    }
}

// 使用内存管理器
const memoryManager = new ExportMemoryManager(exportManager);
memoryManager.startMonitoring();
```

### 性能优化

#### 批量处理优化
```javascript
// 创建批量处理优化器
class BatchExportOptimizer {
    constructor(exportManager) {
        this.exportManager = exportManager;
        this.batchSize = 5; // 导出操作比较耗时，使用较小的批量
        this.concurrentBatches = 2; // 并发批次
    }
    
    /**
     * 优化批量导出
     * @param {Array} items - 项目列表
     * @param {Object} options - 导出选项
     * @returns {Object} 优化的导出结果
     */
    async optimizeBatchExport(items, options = {}) {
        console.log(`🔄 优化批量导出 ${items.length} 个项目...`);
        
        // 1. 按项目类型分组
        const groupedItems = this.groupItemsByType(items);
        
        // 2. 按复杂度排序（简单的先处理，提供快速反馈）
        for (const group of Object.values(groupedItems)) {
            group.sort((a, b) => this.estimateExportComplexity(a) - this.estimateExportComplexity(b));
        }
        
        // 3. 执行优化的批量导出
        const results = await this.executeOptimizedExport(groupedItems, options);
        
        return results;
    }
    
    /**
     * 按项目类型分组
     * @param {Array} items - 项目列表
     * @returns {Object} 分组结果
     */
    groupItemsByType(items) {
        const grouped = {
            compositions: [],
            footage: [],
            folders: [],
            other: []
        };
        
        for (const item of items) {
            const itemType = this.exportManager.getItemType(item);
            
            switch (itemType) {
                case 'composition':
                    grouped.compositions.push(item);
                    break;
                case 'footage':
                    grouped.footage.push(item);
                    break;
                case 'folder':
                    grouped.folders.push(item);
                    break;
                default:
                    grouped.other.push(item);
            }
        }
        
        return grouped;
    }
    
    /**
     * 估算导出复杂度（越小越简单）
     * @param {Object} item - 项目对象
     * @returns {number} 复杂度分数
     */
    estimateExportComplexity(item) {
        // 基础复杂度分数
        let complexity = 1;
        
        // 根据项目类型调整
        switch (item.typeName?.toLowerCase()) {
            case 'composition':
                complexity += 5; // 合成导出最复杂
                break;
            case 'footage':
                complexity += 2; // 素材导出相对简单
                break;
            case 'folder':
                complexity += 1; // 文件夹最简单
                break;
            default:
                complexity += 3;
        }
        
        // 可以根据项目属性进一步调整复杂度
        
        return complexity;
    }
    
    /**
     * 执行优化的导出
     * @param {Object} groupedItems - 分组的项目
     * @param {Object} options - 导出选项
     * @returns {Object} 导出结果
     */
    async executeOptimizedExport(groupedItems, options) {
        const allResults = {
            success: true,
            exportedFiles: [],
            failedFiles: [],
            totalProcessed: 0,
            totalErrors: 0
        };
        
        // 按简单程度排序处理
        const exportOrder = ['folders', 'footage', 'other', 'compositions'];
        
        for (const itemType of exportOrder) {
            const itemGroup = groupedItems[itemType];
            if (itemGroup && itemGroup.length > 0) {
                console.log(`🔍 处理 ${itemType} 类型项目: ${itemGroup.length} 个`);
                
                const groupResult = await this.exportItemGroup(itemGroup, options);
                
                allResults.exportedFiles.push(...groupResult.exportedFiles);
                allResults.failedFiles.push(...groupResult.failedFiles);
                allResults.totalProcessed += groupResult.totalProcessed;
                allResults.totalErrors += groupResult.totalErrors;
                
                if (groupResult.totalErrors > 0) {
                    allResults.success = false;
                }
                
                // 组间暂停，避免资源竞争
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        return allResults;
    }
    
    /**
     * 导出项目组
     * @param {Array} itemGroup - 项目组
     * @param {Object} options - 导出选项
     * @returns {Object} 导出结果
     */
    async exportItemGroup(itemGroup, options) {
        const results = {
            success: true,
            exportedFiles: [],
            failedFiles: [],
            totalProcessed: 0,
            totalErrors: 0
        };
        
        // 分批处理
        const batches = this.chunkArray(itemGroup, this.batchSize);
        
        for (const batch of batches) {
            const batchResult = await this.exportManager.exportFiles(batch, options);
            
            results.exportedFiles.push(...batchResult.exportedFiles);
            results.failedFiles.push(...batchResult.failedFiles);
            results.totalProcessed += batchResult.totalProcessed;
            results.totalErrors += batchResult.totalErrors;
            
            if (batchResult.totalErrors > 0) {
                results.success = false;
            }
            
            // 批次间较长时间延迟，给系统恢复时间
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        return results;
    }
    
    /**
     * 分块数组
     * @param {Array} array - 原数组
     * @param {number} chunkSize - 块大小
     * @returns {Array} 分块后的数组
     */
    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}

// 使用批量处理优化器
const optimizer = new BatchExportOptimizer(exportManager);
const optimizedResult = await optimizer.optimizeBatchExport(itemsToExport, {
    destination: 'folder',
    targetFolder: 'D:/Optimized_Export',
    format: 'png',
    quality: 100
});

console.log('优化批量导出结果:', optimizedResult);
```

## 故障排除

### 常见问题

#### 导出失败
- **症状**：调用`exportFiles`后项目未成功导出
- **解决**：
  1. 检查AE项目是否打开且处于活动状态
  2. 验证Eagle连接是否正常（如果是导出到Eagle）
  3. 检查目标路径权限
  4. 查看详细的错误日志

#### 路径解析错误
- **症状**：目标路径包含特殊字符或过长导致解析失败
- **解决**：
  1. 检查目标路径格式
  2. 验证路径长度限制
  3. 确认路径中无非法字符
  4. 使用规范化路径函数

#### 内存不足
- **症状**：大量项目导出时出现内存溢出错误
- **解决**：
  1. 减少批量导出数量
  2. 实施分批处理策略
  3. 增加批量处理间隔
  4. 监控内存使用情况

#### 权限错误
- **症状**：无法创建文件夹或写入文件
- **解决**：
  1. 检查目标文件夹权限
  2. 验证AE扩展权限设置
  3. 确认目标位置可写
  4. 尝试使用不同的目标路径

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
exportManager.config.enableLogging = true;
exportManager.logManager.config.logLevel = 'debug';

// 监控所有导出操作
exportManager.callbacks.onProgress = (progressData) => {
    exportManager.log(`📊 进度: ${progressData.progress.toFixed(1)}%`, 'debug');
};

exportManager.callbacks.onError = (error) => {
    exportManager.log(`❌ 错误: ${error.message}`, 'error', { stack: error.stack });
};
```

#### 导出诊断工具
```javascript
// 创建导出诊断工具
class ExportDiagnostics {
    constructor(exportManager) {
        this.exportManager = exportManager;
    }
    
    /**
     * 运行导出诊断
     */
    async runDiagnostics() {
        console.log('🔍 开始导出诊断...');
        
        // 1. 检查环境状态
        console.log('1. 环境状态检查...');
        await this.checkEnvironment();
        
        // 2. 检查配置
        console.log('2. 配置检查...');
        await this.checkConfiguration();
        
        // 3. 测试基本功能
        console.log('3. 功能测试...');
        await this.testBasicOperations();
        
        // 4. 检查性能
        console.log('4. 性能检查...');
        await this.checkPerformance();
        
        console.log('✅ 导出诊断完成');
    }
    
    /**
     * 检查环境状态
     */
    async checkEnvironment() {
        // 检查AE项目状态
        const projectStatus = await this.exportManager.projectStatusChecker.getProjectStatus();
        console.log(`   AE项目: ${projectStatus.projectExists ? '已打开' : '未打开'}`);
        
        // 检查Eagle连接状态
        const eagleStatus = await this.exportManager.eagleConnectionManager.getConnectionInfo();
        console.log(`   Eagle连接: ${eagleStatus.connected ? '已连接' : '未连接'}`);
        
        // 检查内存使用
        if (performance.memory) {
            const memory = performance.memory;
            console.log(`   内存使用: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        }
    }
    
    /**
     * 检查配置
     */
    async checkConfiguration() {
        const settings = this.exportManager.settingsManager.getSettings();
        console.log(`   导出目标: ${settings.export.destination}`);
        console.log(`   导出格式: ${settings.export.format}`);
        console.log(`   导出质量: ${settings.export.quality}`);
        console.log(`   命名模板: ${settings.export.namingTemplate}`);
    }
    
    /**
     * 测试基本操作
     */
    async testBasicOperations() {
        // 测试路径操作
        const testPath = 'C:/Test/Export/file.png';
        console.log(`   路径提取: ${this.exportManager.extractFolderPath(testPath)}`);
        console.log(`   文件名提取: ${this.exportManager.extractFileName(testPath)}`);
        
        // 测试项目验证
        const testItem = { name: 'test', id: 1, typeName: 'Composition' };
        const validation = this.exportManager.validateItemForExport(testItem);
        console.log(`   项目验证: ${validation.valid ? '通过' : '失败'}`);
    }
    
    /**
     * 检查性能
     */
    async checkPerformance() {
        const startTime = performance.now();
        
        // 模拟简单操作
        for (let i = 0; i < 1000; i++) {
            const path = this.exportManager.normalizePath(`C:\\Test\\Export\\file${i}.png`);
        }
        
        const endTime = performance.now();
        console.log(`   路径处理性能: 1000次操作耗时 ${(endTime - startTime).toFixed(2)}ms`);
    }
}

// 运行诊断
const diagnostics = new ExportDiagnostics(exportManager);
await diagnostics.runDiagnostics();
```

## 扩展性

### 自定义扩展

#### 扩展导出管理器
```javascript
// 创建自定义导出管理器
class CustomExportManager extends ExportManager {
    constructor(aeExtension) {
        super(aeExtension);
        
        // 添加自定义属性
        this.cloudStorageEnabled = false;
        this.cloudStorageConfig = null;
        this.metadataProcessor = null;
        this.exportValidationRules = new Set();
        
        // 初始化扩展功能
        this.initCustomFeatures();
    }
    
    initCustomFeatures() {
        // 初始化元数据处理器
        this.initMetadataProcessor();
        
        // 添加自定义验证规则
        this.addCustomValidationRules();
    }
    
    initMetadataProcessor() {
        this.metadataProcessor = {
            extract: async (item) => {
                // 模拟元数据提取
                return {
                    dimensions: { width: 1920, height: 1080 },
                    duration: item.duration || null,
                    frameRate: item.frameRate || null,
                    colorSpace: 'RGB',
                    bitDepth: 8,
                    createdDate: new Date().toISOString(),
                    sourceApp: 'After Effects',
                    sourceProject: this.exportManager.projectStatusChecker.getProjectInfo().projectName
                };
            },
            inject: async (filePath, metadata) => {
                // 模拟元数据注入
                console.log(`注入元数据到: ${filePath}`, metadata);
                return { success: true };
            }
        };
    }
    
    addCustomValidationRules() {
        // 添加项目类型验证规则
        this.exportValidationRules.add(async (item) => {
            if (!['composition', 'footage'].includes(this.exportManager.getItemType(item))) {
                return {
                    valid: false,
                    error: '项目类型不支持导出'
                };
            }
            return { valid: true };
        });
        
        // 添加路径长度验证规则
        this.exportValidationRules.add((item) => {
            // 项目名称长度检查
            if (item.name && item.name.length > 100) {
                return {
                    valid: false,
                    error: '项目名称过长，超过100字符限制'
                };
            }
            return { valid: true };
        });
    }
    
    /**
     * 重写项目验证方法，添加自定义验证
     * @param {Object} item - 项目对象
     * @returns {Object} 验证结果
     */
    async validateItemForExport(item) {
        // 首先执行父类的基本验证
        const basicValidation = super.validateItemForExport(item);
        if (!basicValidation.valid) {
            return basicValidation;
        }
        
        // 执行自定义验证规则
        for (const rule of this.exportValidationRules) {
            try {
                const ruleResult = await rule(item);
                if (!ruleResult.valid) {
                    return ruleResult;
                }
            } catch (error) {
                this.log(`自定义验证规则执行失败: ${error.message}`, 'warning');
                // 验证规则执行失败不应该阻止导出
                continue;
            }
        }
        
        return { valid: true };
    }
    
    /**
     * 导出到云端存储
     * @param {Object} item - 项目对象
     * @param {Object} options - 选项
     * @returns {Object} 导出结果
     */
    async exportToCloud(item, options = {}) {
        if (!this.cloudStorageEnabled) {
            return {
                success: false,
                error: '云端存储功能未启用'
            };
        }
        
        try {
            this.log(`📤 导出到云端: ${item.name}`, 'debug');
            
            // 首先导出到本地
            const localExportPath = await this.exportItemToTemp(item, options);
            if (!localExportPath) {
                throw new Error('项目导出到临时位置失败');
            }
            
            // 上传到云端
            const uploadResult = await this.uploadToCloud(localExportPath, options);
            if (!uploadResult.success) {
                throw new Error(uploadResult.error);
            }
            
            // 记录云端路径
            const exportedFile = {
                ...item,
                localPath: localExportPath,
                cloudPath: uploadResult.cloudPath,
                exportMode: 'cloud'
            };
            
            // 清理临时文件
            setTimeout(() => {
                this.cleanupTempFiles([{ path: localExportPath }]);
            }, 5000);
            
            this.log(`✅ 项目导出到云端成功: ${uploadResult.cloudPath}`, 'success');
            
            return {
                success: true,
                exportedFile: exportedFile
            };
            
        } catch (error) {
            this.log(`❌ 云端导出失败: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 上传到云端
     * @param {string} localPath - 本地路径
     * @param {Object} options - 选项
     * @returns {Object} 上传结果
     */
    async uploadToCloud(localPath, options = {}) {
        try {
            if (window.__DEMO_MODE_ACTIVE__) {
                // Demo模式：模拟上传
                const cloudPath = `https://cloud.example.com/${this.extractFileName(localPath)}`;
                
                return {
                    success: true,
                    cloudPath: cloudPath,
                    uploadTime: 2000
                };
            }
            
            // 实际云端上传逻辑
            // 这里会根据具体的云存储服务实现
            const file = await this.getFileFromPath(localPath);
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(this.cloudStorageConfig.uploadUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${this.cloudStorageConfig.token}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                
                return {
                    success: true,
                    cloudPath: result.path,
                    uploadTime: Date.now() - startTime
                };
            } else {
                const errorText = await response.text();
                throw new Error(`云端上传失败: ${response.status} - ${errorText}`);
            }
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 提取项目元数据
     * @param {Object} item - 项目对象
     * @returns {Object} 元数据
     */
    async extractMetadata(item) {
        try {
            this.log(`🔍 提取元数据: ${item.name}`, 'debug');
            
            const metadata = await this.metadataProcessor.extract(item);
            
            this.log(`✅ 元数据提取完成`, 'success');
            return {
                success: true,
                metadata: metadata
            };
            
        } catch (error) {
            this.log(`❌ 元数据提取失败: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 设置云端存储配置
     * @param {Object} config - 云端存储配置
     */
    setCloudStorageConfig(config) {
        this.cloudStorageConfig = config;
        this.cloudStorageEnabled = true;
        
        this.log('☁️ 云端存储已配置', 'debug');
    }
}

// 使用自定义导出管理器
const customExportManager = new CustomExportManager(aeExtension);

// 设置云端存储配置
customExportManager.setCloudStorageConfig({
    uploadUrl: 'https://api.cloudstorage.com/upload',
    token: 'your-cloud-token'
});

// 提取项目元数据
const metadataResult = await customExportManager.extractMetadata(itemsToExport[0]);
console.log('元数据结果:', metadataResult);
```

#### 插件化架构
```javascript
// 创建导出插件系统
class ExportPluginManager {
    constructor(exportManager) {
        this.exportManager = exportManager;
        this.plugins = new Map();
        this.hooks = new Map();
    }
    
    /**
     * 注册导出插件
     * @param {string} pluginId - 插件ID
     * @param {Object} plugin - 插件对象
     */
    registerPlugin(pluginId, plugin) {
        this.plugins.set(pluginId, plugin);
        
        // 绑定插件钩子
        if (plugin.onBeforeExport) {
            this.addHook('beforeExport', plugin.onBeforeExport.bind(plugin));
        }
        
        if (plugin.onAfterExport) {
            this.addHook('afterExport', plugin.onAfterExport.bind(plugin));
        }
        
        if (plugin.onExportError) {
            this.addHook('exportError', plugin.onExportError.bind(plugin));
        }
        
        if (plugin.onItemValidate) {
            this.addHook('itemValidate', plugin.onItemValidate.bind(plugin));
        }
        
        if (plugin.onFileProcess) {
            this.addHook('fileProcess', plugin.onFileProcess.bind(plugin));
        }
        
        this.exportManager.log(`🔌 插件已注册: ${pluginId}`, 'debug');
    }
    
    /**
     * 添加钩子函数
     * @param {string} hookName - 钩子名称
     * @param {Function} callback - 回调函数
     */
    addHook(hookName, callback) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        
        const hooks = this.hooks.get(hookName);
        hooks.push(callback);
    }
    
    /**
     * 移除钩子函数
     * @param {string} hookName - 钩子名称
     * @param {Function} callback - 回调函数
     */
    removeHook(hookName, callback) {
        if (this.hooks.has(hookName)) {
            const hooks = this.hooks.get(hookName);
            const index = hooks.indexOf(callback);
            if (index !== -1) {
                hooks.splice(index, 1);
            }
        }
    }
    
    /**
     * 触发钩子
     * @param {string} hookName - 钩子名称
     * @param {...any} args - 参数
     * @returns {Array} 执行结果
     */
    async triggerHook(hookName, ...args) {
        const results = [];
        
        if (this.hooks.has(hookName)) {
            const hooks = this.hooks.get(hookName);
            for (const hook of hooks) {
                try {
                    const result = await hook(...args);
                    results.push(result);
                } catch (error) {
                    this.exportManager.log(`钩子执行失败 ${hookName}: ${error.message}`, 'error');
                }
            }
        }
        
        return results;
    }
    
    /**
     * 执行导出前的插件逻辑
     * @param {Array} items - 项目列表
     * @param {Object} options - 选项
     * @returns {Object} 处理结果
     */
    async executeBeforeExport(items, options) {
        const pluginResults = await this.triggerHook('beforeExport', items, options);
        return { success: true, pluginResults };
    }
    
    /**
     * 执行导出后的插件逻辑
     * @param {Object} exportResult - 导出结果
     * @returns {Object} 处理结果
     */
    async executeAfterExport(exportResult) {
        const pluginResults = await this.triggerHook('afterExport', exportResult);
        return { success: true, pluginResults };
    }
    
    /**
     * 处理文件
     * @param {string} filePath - 文件路径
     * @param {Object} options - 选项
     * @returns {Object} 处理结果
     */
    async processFile(filePath, options) {
        const pluginResults = await this.triggerHook('fileProcess', filePath, options);
        return { success: true, results: pluginResults };
    }
}

// 示例插件：压缩插件
const compressionPlugin = {
    id: 'compression',
    name: 'Compression Plugin',
    
    onBeforeExport: async (items, options) => {
        console.log('📦 压缩插件: 准备压缩设置');
        
        // 可以修改导出选项
        if (options.format === 'png' && options.quality > 90) {
            // 为PNG格式设置压缩
            options.compression = 'high';
        }
        
        return { success: true, modifiedOptions: options };
    },
    
    onAfterExport: async (exportResult) => {
        console.log('📦 压缩插件: 导出完成，执行后处理');
        
        // 可以对导出的文件进行额外处理
        for (const exportedFile of exportResult.exportedFiles) {
            console.log(`处理文件: ${exportedFile.path}`);
        }
        
        return { success: true };
    }
};

// 示例插件：元数据插件
const metadataPlugin = {
    id: 'metadata',
    name: 'Metadata Plugin',
    
    onFileProcess: async (filePath, options) => {
        console.log(`🏷️ 元数据插件: 处理文件 ${filePath}`);
        
        // 可以向文件添加元数据
        const metadata = {
            exportedDate: new Date().toISOString(),
            exportedBy: 'Eagle2AE Extension',
            format: options.format,
            quality: options.quality
        };
        
        console.log('添加元数据:', metadata);
        
        return { success: true, metadata: metadata };
    }
};

// 使用插件管理器
const pluginManager = new ExportPluginManager(exportManager);

// 注册插件
pluginManager.registerPlugin('compression', compressionPlugin);
pluginManager.registerPlugin('metadata', metadataPlugin);

// 在导出前后执行插件
const testItems = [{ name: 'testComp', id: 1, typeName: 'Composition' }];
const testOptions = { destination: 'folder', format: 'png', targetFolder: 'D:/Test' };

// 执行导出前插件
await pluginManager.executeBeforeExport(testItems, testOptions);

// 执行实际导出
const exportResult = await exportManager.exportFiles(testItems, testOptions);

// 执行导出后插件
await pluginManager.executeAfterExport(exportResult);

// 处理导出的文件
for (const exportedFile of exportResult.exportedFiles) {
    await pluginManager.processFile(exportedFile.path, testOptions);
}