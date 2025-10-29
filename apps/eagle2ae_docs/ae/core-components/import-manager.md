# 导入管理器

## 概述

导入管理器（Import Manager）是 Eagle2Ae AE 扩展 v2.4.0 的核心组件，负责处理从 Eagle 素材库到 After Effects 的素材导入流程。该组件支持多种导入模式，提供智能路径管理、进度跟踪、错误处理等功能，确保素材导入过程的稳定性和可靠性。

## 核心特性

### 多种导入模式
- **直接导入** - 从源目录直接导入到AE项目（不复制文件）
- **项目旁复制** - 将文件复制到AE项目文件旁边后导入
- **指定文件夹** - 将文件复制到用户指定的文件夹后导入
- **智能导入** - 根据文件类型自动选择最佳导入方式

### 智能路径管理
- **自动路径解析** - 智能解析和验证文件路径
- **路径规范化** - 统一处理不同操作系统的路径格式
- **权限检查** - 验证文件访问权限
- **冲突处理** - 处理文件名冲突和覆盖问题

### 进度跟踪和监控
- **导入进度** - 实时显示导入进度和状态
- **性能监控** - 监控导入过程的性能指标
- **错误统计** - 统计导入过程中的错误
- **日志记录** - 详细记录导入过程

### 错误处理和恢复
- **重试机制** - 自动重试失败的导入操作
- **错误隔离** - 隔离和处理单个文件导入错误
- **回滚支持** - 支持导入失败时的清理操作
- **详细错误信息** - 提供详细的错误描述和解决方案

## 技术实现

### 核心类结构

```javascript
/**
 * 导入管理器
 * 负责处理从Eagle素材库到After Effects的素材导入流程
 */
class ImportManager {
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
        
        // 导入配置
        this.config = {
            maxConcurrentImports: 5, // 最大并发导入数
            retryAttempts: 3, // 重试次数
            retryDelay: 1000, // 重试延迟（毫秒）
            chunkSize: 10, // 分批处理大小
            timeout: 30000, // 操作超时时间
            enableProgressTracking: true, // 启用进度跟踪
            enableLogging: true, // 启用日志记录
            enableValidation: true // 启用验证
        };
        
        // 当前导入状态
        this.currentImport = {
            active: false,
            progress: 0,
            total: 0,
            completed: 0,
            failed: 0,
            currentFile: null,
            startTime: null,
            estimatedTime: null
        };
        
        // 导入队列
        this.importQueue = [];
        this.activeImports = new Set();
        
        // 性能监控
        this.performanceMetrics = {
            totalImportTime: 0,
            averageImportTime: 0,
            importRate: 0,
            memoryUsage: new Map()
        };
        
        // 统计数据
        this.stats = {
            totalImports: 0,
            successfulImports: 0,
            failedImports: 0,
            byType: new Map(),
            bySource: new Map(),
            startTime: Date.now()
        };
        
        // 回调函数
        this.callbacks = {
            onProgress: null,
            onComplete: null,
            onError: null,
            onCancel: null
        };
        
        // 绑定方法上下文
        this.importFiles = this.importFiles.bind(this);
        this.importFile = this.importFile.bind(this);
        this.importToProject = this.importToProject.bind(this);
        this.importToProjectAdjacent = this.importToProjectAdjacent.bind(this);
        this.importToCustomFolder = this.importToCustomFolder.bind(this);
        this.validateImport = this.validateImport.bind(this);
        this.processImportQueue = this.processImportQueue.bind(this);
        this.handleImportError = this.handleImportError.bind(this);
        this.updateProgress = this.updateProgress.bind(this);
        this.cancelImport = this.cancelImport.bind(this);
        
        this.log('📥 导入管理器已初始化', 'debug');
    }
}
```

### 导入模式实现

```javascript
/**
 * 导入文件到AE项目
 * @param {Array} files - 要导入的文件列表
 * @param {Object} options - 导入选项
 * @returns {Object} 导入结果
 */
async importFiles(files, options = {}) {
    try {
        this.log('📥 开始导入文件...', 'info', { 
            fileCount: files.length, 
            options: options 
        });
        
        // 验证导入条件
        const validation = this.validateImportConditions(options);
        if (!validation.valid) {
            this.log(`❌ 导入条件验证失败: ${validation.error}`, 'error');
            return {
                success: false,
                error: validation.error,
                importedCount: 0,
                failedCount: files.length
            };
        }
        
        // 初始化导入状态
        this.currentImport = {
            active: true,
            progress: 0,
            total: files.length,
            completed: 0,
            failed: 0,
            currentFile: null,
            startTime: Date.now(),
            estimatedTime: this.estimateImportTime(files.length)
        };
        
        // 分批处理文件
        const chunks = this.chunkArray(files, this.config.chunkSize);
        let results = {
            success: true,
            importedFiles: [],
            failedFiles: [],
            totalProcessed: 0,
            totalErrors: 0
        };
        
        for (const chunk of chunks) {
            const chunkResult = await this.processImportChunk(chunk, options);
            
            results.importedFiles.push(...chunkResult.importedFiles);
            results.failedFiles.push(...chunkResult.failedFiles);
            results.totalProcessed += chunkResult.totalProcessed;
            results.totalErrors += chunkResult.totalErrors;
            
            // 更新总体状态
            this.currentImport.completed = results.importedFiles.length;
            this.currentImport.failed = results.failedFiles.length;
            
            if (results.totalErrors > 0 && options.stopOnError) {
                this.log(`❌ 遇到错误且设置为停止，终止导入`, 'error');
                break;
            }
        }
        
        // 更新统计
        this.stats.totalImports += results.totalProcessed;
        this.stats.successfulImports += results.importedFiles.length;
        this.stats.failedImports += results.failedFiles.length;
        
        // 更新导入状态
        this.currentImport.active = false;
        
        const success = results.totalErrors === 0;
        
        this.log(`📥 导入完成: ${success ? '成功' : '部分失败'}`, 'info', {
            total: files.length,
            successful: results.importedFiles.length,
            failed: results.failedFiles.length
        });
        
        // 调用完成回调
        if (this.callbacks.onComplete) {
            this.callbacks.onComplete(results);
        }
        
        return {
            success: success,
            importedFiles: results.importedFiles,
            failedFiles: results.failedFiles,
            totalProcessed: results.totalProcessed,
            totalErrors: results.totalErrors,
            importTime: Date.now() - this.currentImport.startTime
        };
        
    } catch (error) {
        this.log(`💥 导入过程异常: ${error.message}`, 'error');
        this.currentImport.active = false;
        
        if (this.callbacks.onError) {
            this.callbacks.onError(error);
        }
        
        return {
            success: false,
            error: error.message,
            importedCount: 0,
            failedCount: files.length
        };
    }
}

/**
 * 处理导入块
 * @param {Array} chunk - 文件块
 * @param {Object} options - 导入选项
 * @returns {Object} 块处理结果
 */
async processImportChunk(chunk, options) {
    const results = {
        importedFiles: [],
        failedFiles: [],
        totalProcessed: 0,
        totalErrors: 0
    };
    
    // 并发处理块中的文件
    const promises = chunk.map(async (file) => {
        if (!this.currentImport.active) {
            return { success: false, file: file, error: '导入已取消' };
        }
        
        try {
            const result = await this.importFile(file, options);
            
            if (result.success) {
                results.importedFiles.push(result.file);
            } else {
                results.failedFiles.push({ 
                    file: file, 
                    error: result.error 
                });
                results.totalErrors++;
            }
            
            results.totalProcessed++;
            
            // 更新进度
            this.updateProgress();
            
        } catch (error) {
            results.failedFiles.push({ 
                file: file, 
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
 * 导入单个文件
 * @param {Object} file - 要导入的文件
 * @param {Object} options - 导入选项
 * @returns {Object} 导入结果
 */
async importFile(file, options) {
    try {
        this.currentImport.currentFile = file;
        
        this.log(`📥 开始导入文件: ${file.name}`, 'debug', { 
            file: file, 
            path: file.path 
        });
        
        // 验证单个文件
        const fileValidation = this.validateFileForImport(file);
        if (!fileValidation.valid) {
            throw new Error(fileValidation.error);
        }
        
        // 根据导入模式处理
        let importResult;
        
        switch (options.mode || this.settingsManager.getField('import.mode')) {
            case 'direct':
                importResult = await this.importToProject(file, options);
                break;
                
            case 'project_adjacent':
                importResult = await this.importToProjectAdjacent(file, options);
                break;
                
            case 'custom_folder':
                importResult = await this.importToCustomFolder(file, options);
                break;
                
            default:
                // 根据设置获取默认模式
                const defaultMode = this.settingsManager.getField('import.mode');
                switch (defaultMode) {
                    case 'direct':
                        importResult = await this.importToProject(file, options);
                        break;
                    case 'project_adjacent':
                        importResult = await this.importToProjectAdjacent(file, options);
                        break;
                    case 'custom_folder':
                        importResult = await this.importToCustomFolder(file, options);
                        break;
                    default:
                        throw new Error(`未知的导入模式: ${defaultMode}`);
                }
        }
        
        if (importResult.success) {
            this.log(`✅ 文件导入成功: ${file.name}`, 'success', { file: file });
            
            // 如果需要添加到合成
            if (options.addToComposition !== false && 
                this.settingsManager.getField('import.addToComposition')) {
                
                const addToCompResult = await this.addToComposition(importResult.importedFile, options);
                if (!addToCompResult.success) {
                    this.log(`⚠️ 添加到合成失败: ${addToCompResult.error}`, 'warning');
                }
            }
            
            return {
                success: true,
                file: file,
                importedFile: importResult.importedFile,
                mode: options.mode
            };
        } else {
            throw new Error(importResult.error || '未知错误');
        }
        
    } catch (error) {
        this.log(`❌ 文件导入失败: ${file.name} - ${error.message}`, 'error', { 
            file: file, 
            error: error.message 
        });
        
        return {
            success: false,
            file: file,
            error: error.message
        };
    }
}
```

### 三种导入模式实现

```javascript
/**
 * 直接导入到项目
 * @param {Object} file - 文件对象
 * @param {Object} options - 选项
 * @returns {Object} 导入结果
 */
async importToProject(file, options = {}) {
    try {
        this.log('🔄 直接导入模式: 从源目录导入到AE项目', 'debug');
        
        // 验证文件存在
        const fileExists = await this.checkFileExists(file.path);
        if (!fileExists) {
            throw new Error(`文件不存在: ${file.path}`);
        }
        
        // 在DEMO模式下模拟导入
        if (window.__DEMO_MODE_ACTIVE__) {
            return {
                success: true,
                importedFile: {
                    ...file,
                    importedPath: file.path,
                    importMode: 'direct'
                }
            };
        }
        
        // CEP模式：使用ExtendScript导入
        const script = `
            var file = new File("${this.normalizePath(file.path)}");
            if (file.exists) {
                try {
                    var project = app.project;
                    var item = project.importFile(new ImportOptions(file));
                    { success: true, itemId: item.id, importedPath: file.fsName }
                } catch (e) {
                    { success: false, error: e.message }
                }
            } else {
                { success: false, error: "文件不存在" }
            }
        `;
        
        const result = await this.aeExtension.executeExtendScript(script);
        
        if (result && result.success) {
            return {
                success: true,
                importedFile: {
                    ...file,
                    importedPath: result.importedPath,
                    itemId: result.itemId,
                    importMode: 'direct'
                }
            };
        } else {
            throw new Error(result.error || '导入失败');
        }
        
    } catch (error) {
        this.log(`❌ 直接导入失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 项目旁复制后导入
 * @param {Object} file - 文件对象
 * @param {Object} options - 选项
 * @returns {Object} 导入结果
 */
async importToProjectAdjacent(file, options = {}) {
    try {
        this.log('🔄 项目旁复制模式: 复制到项目旁后导入', 'debug');
        
        // 获取项目路径
        const projectInfo = await this.projectStatusChecker.getProjectInfo();
        if (!projectInfo.success) {
            throw new Error('无法获取项目信息');
        }
        
        // 确定目标文件夹
        const projectFolder = this.extractFolderPath(projectInfo.projectPath);
        const customFolderName = this.settingsManager.getField('import.projectAdjacentFolder') || 'Eagle_Assets';
        const targetFolder = this.joinPath(projectFolder, customFolderName);
        
        // 创建目标文件夹
        await this.createFolder(targetFolder);
        
        // 确定目标文件路径
        const targetPath = this.joinPath(targetFolder, file.name);
        
        // 如果文件已存在，处理重命名
        let finalTargetPath = targetPath;
        if (await this.checkFileExists(targetPath)) {
            finalTargetPath = await this.resolveFileNameConflict(targetPath);
        }
        
        // 复制文件
        const copyResult = await this.copyFile(file.path, finalTargetPath);
        if (!copyResult.success) {
            throw new Error(`文件复制失败: ${copyResult.error}`);
        }
        
        // 导入复制的文件
        const importResult = await this.importToProject({
            ...file,
            path: finalTargetPath,
            name: this.extractFileName(finalTargetPath)
        }, { ...options, mode: 'direct' });
        
        if (importResult.success) {
            return {
                success: true,
                importedFile: {
                    ...importResult.importedFile,
                    originalPath: file.path,
                    importMode: 'project_adjacent'
                }
            };
        } else {
            throw new Error(importResult.error);
        }
        
    } catch (error) {
        this.log(`❌ 项目旁复制导入失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 自定义文件夹导入
 * @param {Object} file - 文件对象
 * @param {Object} options - 选项
 * @returns {Object} 导入结果
 */
async importToCustomFolder(file, options = {}) {
    try {
        this.log('🔄 自定义文件夹模式: 复制到指定文件夹后导入', 'debug');
        
        // 获取自定义文件夹路径
        let customFolderPath = options.customFolder || 
                              this.settingsManager.getField('import.customFolderPath');
        
        if (!customFolderPath) {
            // 如果没有指定路径，让用户选择
            const browseResult = await this.browseFolder();
            if (!browseResult.success) {
                throw new Error('未选择自定义文件夹');
            }
            customFolderPath = browseResult.folderPath;
        }
        
        // 确定目标文件路径
        const targetPath = this.joinPath(customFolderPath, file.name);
        
        // 如果文件已存在，处理重命名
        let finalTargetPath = targetPath;
        if (await this.checkFileExists(targetPath)) {
            finalTargetPath = await this.resolveFileNameConflict(targetPath);
        }
        
        // 复制文件
        const copyResult = await this.copyFile(file.path, finalTargetPath);
        if (!copyResult.success) {
            throw new Error(`文件复制失败: ${copyResult.error}`);
        }
        
        // 导入复制的文件
        const importResult = await this.importToProject({
            ...file,
            path: finalTargetPath,
            name: this.extractFileName(finalTargetPath)
        }, { ...options, mode: 'direct' });
        
        if (importResult.success) {
            return {
                success: true,
                importedFile: {
                    ...importResult.importedFile,
                    originalPath: file.path,
                    importMode: 'custom_folder'
                }
            };
        } else {
            throw new Error(importResult.error);
        }
        
    } catch (error) {
        this.log(`❌ 自定义文件夹导入失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 添加到合成
 * @param {Object} importedFile - 导入的文件
 * @param {Object} options - 选项
 * @returns {Object} 添加结果
 */
async addToComposition(importedFile, options = {}) {
    try {
        this.log('🔄 将文件添加到当前合成', 'debug');
        
        // 检查时间轴选项
        const timelineOptions = this.settingsManager.getField('import.timelineOptions');
        const addToComposition = this.settingsManager.getField('import.addToComposition');
        
        if (!addToComposition || !timelineOptions.enabled) {
            this.log('⏭️ 未启用添加到合成选项', 'debug');
            return { success: true, message: '跳过添加到合成' };
        }
        
        // 确保有活动合成
        const activeComp = await this.projectStatusChecker.getActiveCompInfo();
        if (!activeComp.success) {
            throw new Error('没有活动合成');
        }
        
        // 在DEMO模式下模拟添加
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：模拟添加到合成', 'debug');
            return { success: true, demo: true };
        }
        
        // CEP模式：使用ExtendScript添加到合成
        let script = `
            try {
                var project = app.project;
                var comp = app.project.activeItem;
                
                if (!(comp instanceof CompItem)) {
                    throw "没有活动合成";
                }
                
                // 根据导入的项目ID获取素材
                var item = project.item(${importedFile.itemId || 1});
                
                // 计算放置时间
                var time = 0;
        `;
        
        if (timelineOptions.placement === 'current_time') {
            script += `
                time = comp.time;
            `;
        }
        
        script += `
                // 添加图层到合成
                var layer = comp.layers.add(item);
                layer.startTime = time;
                
                // 设置序列帧间隔
                if (${timelineOptions.sequenceInterval} && item.hasVideo && item.frameDuration) {
                    layer.outPoint = layer.inPoint + (${timelineOptions.sequenceInterval} / item.frameDuration);
                }
                
                { success: true, layerId: layer.index, startTime: time }
            } catch (e) {
                { success: false, error: e.message }
            }
        `;
        
        const result = await this.aeExtension.executeExtendScript(script);
        
        if (result && result.success) {
            this.log('✅ 文件成功添加到合成', 'success');
            return result;
        } else {
            throw new Error(result.error || '添加到合成失败');
        }
        
    } catch (error) {
        this.log(`❌ 添加到合成失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
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
                    title: '选择导入文件夹',
                    mode: 'selectFolder'
                });
                
                return {
                    success: result.success,
                    folderPath: result.folderPath || null
                };
            } else {
                // 降级到输入框
                const folderPath = prompt('请输入目标文件夹路径:');
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
                var folder = Folder.selectDialog("选择导入文件夹");
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
```

### 验证和进度管理

```javascript
/**
 * 验证导入条件
 * @param {Object} options - 导入选项
 * @returns {Object} 验证结果
 */
validateImportConditions(options = {}) {
    try {
        // 检查AE项目状态
        const projectValid = this.projectStatusChecker.validateProjectStatus({
            requireProject: true,
            requireActiveComposition: false, // 导入不一定需要活动合成
            showWarning: true
        });
        
        if (!projectValid) {
            return {
                valid: false,
                error: 'AE项目状态不满足导入条件'
            };
        }
        
        // 检查Eagle连接
        const eagleConnected = this.eagleConnectionManager.validateConnection();
        if (!eagleConnected) {
            return {
                valid: false,
                error: 'Eagle连接不可用'
            };
        }
        
        // 检查导入模式设置
        const importMode = this.settingsManager.getField('import.mode');
        if (!['direct', 'project_adjacent', 'custom_folder'].includes(importMode)) {
            return {
                valid: false,
                error: `无效的导入模式: ${importMode}`
            };
        }
        
        // 检查项目旁文件夹设置（如果使用该模式）
        if (importMode === 'project_adjacent') {
            const folderName = this.settingsManager.getField('import.projectAdjacentFolder');
            if (!folderName || folderName.trim() === '') {
                return {
                    valid: false,
                    error: '项目旁文件夹名称不能为空'
                };
            }
        }
        
        // 检查自定义文件夹设置（如果使用该模式）
        if (importMode === 'custom_folder' && !options.customFolder) {
            const customPath = this.settingsManager.getField('import.customFolderPath');
            if (!customPath || customPath.trim() === '') {
                return {
                    valid: false,
                    error: '自定义文件夹路径未设置'
                };
            }
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        this.log(`验证导入条件失败: ${error.message}`, 'error');
        return {
            valid: false,
            error: error.message
        };
    }
}

/**
 * 验证单个文件
 * @param {Object} file - 文件对象
 * @returns {Object} 验证结果
 */
validateFileForImport(file) {
    try {
        if (!file) {
            return {
                valid: false,
                error: '文件对象不能为空'
            };
        }
        
        if (!file.path) {
            return {
                valid: false,
                error: '文件路径不能为空'
            };
        }
        
        if (!file.name) {
            return {
                valid: false,
                error: '文件名不能为空'
            };
        }
        
        // 检查文件路径长度
        if (file.path.length > 260) {
            return {
                valid: false,
                error: '文件路径过长'
            };
        }
        
        // 检查文件名是否包含非法字符
        const invalidChars = /[<>:"|?*\x00-\x1f]/;
        if (invalidChars.test(file.name)) {
            return {
                valid: false,
                error: '文件名包含非法字符'
            };
        }
        
        // 检查文件类型（如果需要）
        const allowedExtensions = this.getAllowedFileExtensions();
        const fileExt = this.getFileExtension(file.path).toLowerCase();
        
        if (allowedExtensions && allowedExtensions.length > 0) {
            if (!allowedExtensions.includes(fileExt)) {
                return {
                    valid: false,
                    error: `不支持的文件类型: ${fileExt}，支持的类型: ${allowedExtensions.join(', ')}`
                };
            }
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        this.log(`验证文件失败: ${error.message}`, 'error');
        return {
            valid: false,
            error: error.message
        };
    }
}

/**
 * 获取允许的文件扩展名
 * @returns {Array} 允许的文件扩展名数组
 */
getAllowedFileExtensions() {
    // 根据AE支持的格式返回允许的扩展名
    // 这里可以根据需要进行配置
    return [
        '.png', '.jpg', '.jpeg', '.gif', '.psd', '.tga', '.tiff', '.tif',
        '.ai', '.pdf', '.eps', '.svg', '.mov', '.mp4', '.avi', '.mkv',
        '.wav', '.mp3', '.aif', '.aiff'
    ];
}

/**
 * 更新导入进度
 */
updateProgress() {
    try {
        const total = this.currentImport.total;
        const completed = this.currentImport.completed + this.currentImport.failed;
        const progress = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
        
        this.currentImport.progress = progress;
        
        // 计算剩余时间
        if (this.currentImport.startTime && completed > 0) {
            const elapsed = Date.now() - this.currentImport.startTime;
            const rate = completed / (elapsed / 1000); // items per second
            const remaining = total - completed;
            const remainingTime = remaining / rate; // seconds
            
            this.currentImport.estimatedTime = remainingTime;
        }
        
        this.log(`📈 导入进度: ${progress.toFixed(1)}% (${completed}/${total})`, 'debug');
        
        // 调用进度回调
        if (this.callbacks.onProgress) {
            this.callbacks.onProgress({
                progress: progress,
                completed: completed,
                total: total,
                currentFile: this.currentImport.currentFile,
                estimatedTime: this.currentImport.estimatedTime
            });
        }
        
    } catch (error) {
        this.log(`更新进度失败: ${error.message}`, 'error');
    }
}

/**
 * 估算导入时间
 * @param {number} fileCount - 文件数量
 * @returns {number} 估算时间（秒）
 */
estimateImportTime(fileCount) {
    // 基于经验估算，可以结合历史数据进行更准确的估算
    const avgTimePerFile = 2; // 平均每文件2秒
    return fileCount * avgTimePerFile;
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
 * 取消导入
 */
cancelImport() {
    try {
        this.log('🚫 取消导入操作', 'warning');
        
        this.currentImport.active = false;
        
        // 调用取消回调
        if (this.callbacks.onCancel) {
            this.callbacks.onCancel();
        }
        
    } catch (error) {
        this.log(`取消导入失败: ${error.message}`, 'error');
    }
}
```

### 错误处理和恢复

```javascript
/**
 * 处理导入错误
 * @param {Object} file - 出错的文件
 * @param {Error} error - 错误对象
 * @param {number} retryCount - 重试次数
 * @returns {Object} 处理结果
 */
async handleImportError(file, error, retryCount = 0) {
    try {
        this.log(`⚠️ 处理导入错误 (尝试 ${retryCount + 1}/${this.config.retryAttempts}): ${error.message}`, 'warning', {
            file: file.name,
            error: error.message,
            retryCount: retryCount
        });
        
        // 如果重试次数未达到上限，尝试重试
        if (retryCount < this.config.retryAttempts) {
            // 等待重试延迟
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (retryCount + 1)));
            
            // 递增重试次数
            retryCount++;
            
            // 重新尝试导入
            const result = await this.importFile(file, { retryCount: retryCount });
            
            if (result.success) {
                this.log(`✅ 重试成功: ${file.name}`, 'success');
                return result;
            } else {
                // 重试失败，继续处理错误
                return await this.handleImportError(file, new Error(result.error), retryCount);
            }
        } else {
            // 重试次数达到上限，记录错误
            this.log(`❌ 导入失败，已达到最大重试次数: ${file.name}`, 'error', {
                file: file.name,
                error: error.message
            });
            
            return {
                success: false,
                file: file,
                error: error.message,
                retryCount: retryCount
            };
        }
        
    } catch (handlingError) {
        this.log(`处理导入错误时发生异常: ${handlingError.message}`, 'error');
        
        return {
            success: false,
            file: file,
            error: handlingError.message,
            retryCount: retryCount
        };
    }
}

/**
 * 清理导入过程中产生的临时文件
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
 * 回滚导入操作（当导入失败时清理已导入的文件）
 * @param {Array} importedFiles - 已导入的文件列表
 */
async rollbackImport(importedFiles) {
    try {
        if (!importedFiles || importedFiles.length === 0) {
            return;
        }
        
        this.log(`🔄 回滚导入操作，清理 ${importedFiles.length} 个已导入的文件`, 'warning');
        
        // 在DEMO模式下模拟回滚
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：模拟回滚操作', 'debug');
            return;
        }
        
        // CEP模式：在AE中移除已导入的项目
        for (const importedFile of importedFiles) {
            try {
                if (importedFile.itemId) {
                    const script = `
                        try {
                            var project = app.project;
                            var item = project.item(${importedFile.itemId});
                            if (item) {
                                item.remove();
                            }
                            true;
                        } catch (e) {
                            false;
                        }
                    `;
                    
                    await this.aeExtension.executeExtendScript(script);
                    this.log(`🗑️ 已回滚导入的文件: ${importedFile.name}`, 'debug');
                }
            } catch (rollbackError) {
                this.log(`回滚导入失败: ${importedFile.name} - ${rollbackError.message}`, 'warning');
            }
        }
        
    } catch (error) {
        this.log(`回滚导入操作时发生异常: ${error.message}`, 'error');
    }
}
```

## API参考

### 核心方法

#### ImportManager
导入管理器主类

```javascript
/**
 * 导入管理器
 * 负责处理从Eagle素材库到After Effects的素材导入流程
 */
class ImportManager
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

#### importFiles()
导入文件到AE项目

```javascript
/**
 * 导入文件到AE项目
 * @param {Array} files - 要导入的文件列表
 * @param {Object} options - 导入选项
 * @returns {Object} 导入结果
 */
async importFiles(files, options = {})
```

#### importFile()
导入单个文件

```javascript
/**
 * 导入单个文件
 * @param {Object} file - 要导入的文件
 * @param {Object} options - 导入选项
 * @returns {Object} 导入结果
 */
async importFile(file, options)
```

#### importToProject()
直接导入到项目

```javascript
/**
 * 直接导入到项目
 * @param {Object} file - 文件对象
 * @param {Object} options - 选项
 * @returns {Object} 导入结果
 */
async importToProject(file, options = {})
```

#### importToProjectAdjacent()
项目旁复制后导入

```javascript
/**
 * 项目旁复制后导入
 * @param {Object} file - 文件对象
 * @param {Object} options - 选项
 * @returns {Object} 导入结果
 */
async importToProjectAdjacent(file, options = {})
```

#### importToCustomFolder()
自定义文件夹导入

```javascript
/**
 * 自定义文件夹导入
 * @param {Object} file - 文件对象
 * @param {Object} options - 选项
 * @returns {Object} 导入结果
 */
async importToCustomFolder(file, options = {})
```

#### addToComposition()
添加到合成

```javascript
/**
 * 添加到合成
 * @param {Object} importedFile - 导入的文件
 * @param {Object} options - 选项
 * @returns {Object} 添加结果
 */
async addToComposition(importedFile, options = {})
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

#### validateImportConditions()
验证导入条件

```javascript
/**
 * 验证导入条件
 * @param {Object} options - 导入选项
 * @returns {Object} 验证结果
 */
validateImportConditions(options = {})
```

#### validateFileForImport()
验证单个文件

```javascript
/**
 * 验证单个文件
 * @param {Object} file - 文件对象
 * @returns {Object} 验证结果
 */
validateFileForImport(file)
```

#### updateProgress()
更新导入进度

```javascript
/**
 * 更新导入进度
 */
updateProgress()
```

#### cancelImport()
取消导入

```javascript
/**
 * 取消导入
 */
cancelImport()
```

#### handleImportError()
处理导入错误

```javascript
/**
 * 处理导入错误
 * @param {Object} file - 出错的文件
 * @param {Error} error - 错误对象
 * @param {number} retryCount - 重试次数
 * @returns {Object} 处理结果
 */
async handleImportError(file, error, retryCount = 0)
```

#### cleanupTempFiles()
清理临时文件

```javascript
/**
 * 清理导入过程中产生的临时文件
 * @param {Array} tempFiles - 临时文件列表
 */
async cleanupTempFiles(tempFiles)
```

#### rollbackImport()
回滚导入操作

```javascript
/**
 * 回滚导入操作（当导入失败时清理已导入的文件）
 * @param {Array} importedFiles - 已导入的文件列表
 */
async rollbackImport(importedFiles)
```

### 导入选项

```javascript
/**
 * 导入选项
 * @typedef {Object} ImportOptions
 * @property {string} mode - 导入模式 ('direct', 'project_adjacent', 'custom_folder')
 * @property {string} customFolder - 自定义文件夹路径（mode为'custom_folder'时使用）
 * @property {boolean} addToComposition - 是否添加到当前合成
 * @property {boolean} stopOnError - 遇到错误时是否停止导入
 * @property {boolean} forceOverwrite - 是否强制覆盖同名文件
 * @property {Object} timelineOptions - 时间轴选项
 * @property {string} timelineOptions.placement - 放置位置 ('current_time', 'timeline_start')
 * @property {number} timelineOptions.sequenceInterval - 序列帧间隔（秒）
 * @property {boolean} timelineOptions.enabled - 是否启用时间轴选项
 */
```

### 导入结果

```javascript
/**
 * 导入结果
 * @typedef {Object} ImportResult
 * @property {boolean} success - 是否成功
 * @property {Array} importedFiles - 成功导入的文件列表
 * @property {Array} failedFiles - 导入失败的文件列表
 * @property {number} totalProcessed - 总处理数量
 * @property {number} totalErrors - 总错误数量
 * @property {number} importTime - 导入耗时（毫秒）
 * @property {string} error - 错误信息（失败时）
 */
```

## 使用示例

### 基本使用

#### 导入单个文件
```javascript
// 创建导入管理器实例
const importManager = new ImportManager(aeExtension);

// 准备文件对象
const fileToImport = {
    name: 'example.png',
    path: 'C:/Eagle/Assets/example.png',
    size: 1024000, // 1MB
    type: 'image',
    extension: '.png'
};

// 执行导入（使用默认设置）
const result = await importManager.importFiles([fileToImport]);

if (result.success) {
    console.log(`✅ 成功导入 ${result.importedFiles.length} 个文件`);
    console.log('导入的文件:', result.importedFiles);
} else {
    console.log(`❌ 导入失败，错误数量: ${result.totalErrors}`);
    console.log('失败的文件:', result.failedFiles);
}
```

#### 导入多个文件
```javascript
// 准备多个文件
const filesToImport = [
    {
        name: 'image1.png',
        path: 'C:/Eagle/Assets/image1.png',
        size: 512000,
        type: 'image'
    },
    {
        name: 'image2.jpg',
        path: 'C:/Eagle/Assets/image2.jpg',
        size: 768000,
        type: 'image'
    },
    {
        name: 'video.mp4',
        path: 'C:/Eagle/Assets/video.mp4',
        size: 5242880,
        type: 'video'
    }
];

// 使用项目旁复制模式导入
const result = await importManager.importFiles(filesToImport, {
    mode: 'project_adjacent',
    addToComposition: true
});

console.log('批量导入结果:', result);
```

#### 监听导入进度
```javascript
// 设置进度回调
importManager.callbacks.onProgress = (progressData) => {
    console.log(`导入进度: ${progressData.progress.toFixed(1)}%`);
    console.log(`已处理: ${progressData.completed}/${progressData.total}`);
    console.log(`当前文件: ${progressData.currentFile?.name || 'N/A'}`);
    
    // 更新UI进度条
    updateProgressBar(progressData.progress);
};

// 设置完成回调
importManager.callbacks.onComplete = (result) => {
    console.log('导入完成:', result);
    showImportSummary(result);
};

// 设置错误回调
importManager.callbacks.onError = (error) => {
    console.error('导入过程中发生错误:', error);
    showErrorNotification(error.message);
};

// 执行导入
await importManager.importFiles(filesToImport);
```

### 高级使用

#### 自定义导入模式
```javascript
// 使用自定义文件夹模式
const customImportResult = await importManager.importFiles(filesToImport, {
    mode: 'custom_folder',
    customFolder: 'D:/AE_Projects/Imported_Assets',
    addToComposition: true,
    timelineOptions: {
        enabled: true,
        placement: 'current_time',
        sequenceInterval: 1.0
    }
});

console.log('自定义文件夹导入结果:', customImportResult);

// 使用直接导入模式
const directImportResult = await importManager.importFiles(filesToImport, {
    mode: 'direct',
    addToComposition: false // 不添加到合成，仅导入到项目面板
});

console.log('直接导入结果:', directImportResult);
```

#### 错误处理和重试
```javascript
// 创建带错误处理的导入函数
async function robustImport(files) {
    try {
        const result = await importManager.importFiles(files, {
            stopOnError: false, // 遇到错误不停止，继续处理其他文件
            retryAttempts: 2,   // 设置重试次数
            forceOverwrite: true // 强制覆盖同名文件
        });
        
        if (!result.success) {
            console.log(`⚠️ 部分文件导入失败 (${result.totalErrors}/${result.totalProcessed})`);
            
            // 处理失败的文件
            for (const failedFile of result.failedFiles) {
                console.error(`❌ ${failedFile.file.name}: ${failedFile.error}`);
                
                // 根据错误类型采取相应措施
                if (failedFile.error.includes('权限')) {
                    console.log('💡 建议检查文件权限');
                } else if (failedFile.error.includes('路径')) {
                    console.log('💡 建议检查文件路径');
                }
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('导入过程异常:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 使用带错误处理的导入
const robustResult = await robustImport(filesToImport);
```

#### 性能优化的批量导入
```javascript
// 创建高性能导入助手
class HighPerformanceImporter {
    constructor(importManager) {
        this.importManager = importManager;
        this.batchSize = 20; // 批处理大小
        this.concurrentImports = 3; // 并发导入数
    }
    
    /**
     * 批量导入大量文件
     * @param {Array} files - 文件列表
     * @returns {Object} 导入结果
     */
    async importLargeBatch(files) {
        console.log(`🔄 开始批量导入 ${files.length} 个文件...`);
        
        // 按文件类型分组，优化导入顺序
        const groupedFiles = this.groupFilesByType(files);
        
        const results = {
            success: true,
            importedFiles: [],
            failedFiles: [],
            totalProcessed: 0,
            totalErrors: 0
        };
        
        // 按组处理文件
        for (const [fileType, fileGroup] of Object.entries(groupedFiles)) {
            console.log(`📁 处理 ${fileType} 类型文件: ${fileGroup.length} 个`);
            
            // 分批处理
            const batches = this.chunkArray(fileGroup, this.batchSize);
            
            for (const batch of batches) {
                const batchResult = await this.importManager.importFiles(batch, {
                    mode: 'project_adjacent',
                    addToComposition: false // 大批量导入时先不添加到合成
                });
                
                results.importedFiles.push(...batchResult.importedFiles);
                results.failedFiles.push(...batchResult.failedFiles);
                results.totalProcessed += batchResult.totalProcessed;
                results.totalErrors += batchResult.totalErrors;
                
                if (batchResult.totalErrors > 0) {
                    results.success = false;
                }
                
                // 批次间暂停，避免系统负载过高
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        // 如果需要，统一添加到合成
        if (results.importedFiles.length > 0 && this.shouldAddToComposition()) {
            console.log('🎬 统一添加到合成...');
            await this.addToCompositionBatch(results.importedFiles);
        }
        
        console.log(`✅ 批量导入完成: ${results.totalProcessed} 个文件，${results.totalErrors} 个失败`);
        return results;
    }
    
    /**
     * 按文件类型分组
     * @param {Array} files - 文件列表
     * @returns {Object} 分组结果
     */
    groupFilesByType(files) {
        const grouped = {};
        
        for (const file of files) {
            const extension = this.importManager.getFileExtension(file.path).toLowerCase();
            const fileType = this.getFileType(extension);
            
            if (!grouped[fileType]) {
                grouped[fileType] = [];
            }
            
            grouped[fileType].push(file);
        }
        
        return grouped;
    }
    
    /**
     * 获取文件类型
     * @param {string} extension - 文件扩展名
     * @returns {string} 文件类型
     */
    getFileType(extension) {
        const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.tga', '.tiff', '.tif', '.psd'];
        const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.m4v'];
        const audioExts = ['.wav', '.mp3', '.aif', '.aiff'];
        const vectorExts = ['.ai', '.pdf', '.eps', '.svg'];
        
        if (imageExts.includes(extension)) return 'image';
        if (videoExts.includes(extension)) return 'video';
        if (audioExts.includes(extension)) return 'audio';
        if (vectorExts.includes(extension)) return 'vector';
        
        return 'other';
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
     * 是否需要添加到合成
     * @returns {boolean} 是否添加到合成
     */
    shouldAddToComposition() {
        // 根据设置或用户选择决定
        return this.importManager.settingsManager.getField('import.addToComposition');
    }
    
    /**
     * 批量添加到合成
     * @param {Array} importedFiles - 已导入的文件
     */
    async addToCompositionBatch(importedFiles) {
        // 这里实现批量添加到合成的逻辑
        // 可以根据文件类型和数量优化添加策略
        console.log(`🎬 批量添加 ${importedFiles.length} 个文件到合成`);
        
        for (const importedFile of importedFiles) {
            try {
                await this.importManager.addToComposition(importedFile);
            } catch (error) {
                console.error(`添加到合成失败 ${importedFile.name}: ${error.message}`);
            }
        }
    }
}

// 使用高性能导入
const highPerformanceImporter = new HighPerformanceImporter(importManager);
const largeFileList = generateLargeFileList(); // 假设有大量文件

const largeImportResult = await highPerformanceImporter.importLargeBatch(largeFileList);
console.log('大量文件导入结果:', largeImportResult);
```

#### 导入状态监控
```javascript
// 创建导入状态监控器
class ImportStatusMonitor {
    constructor(importManager) {
        this.importManager = importManager;
        this.monitorInterval = null;
        this.statusHistory = [];
        this.maxHistory = 100;
    }
    
    /**
     * 开始监控导入状态
     */
    startMonitoring() {
        if (this.monitorInterval) {
            console.log('📊 导入监控已在运行');
            return;
        }
        
        this.monitorInterval = setInterval(() => {
            this.checkImportStatus();
        }, 1000); // 每秒检查一次
        
        console.log('📊 开始监控导入状态');
    }
    
    /**
     * 停止监控导入状态
     */
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            console.log('📊 停止监控导入状态');
        }
    }
    
    /**
     * 检查导入状态
     */
    checkImportStatus() {
        if (this.importManager.currentImport.active) {
            const status = {
                ...this.importManager.currentImport,
                timestamp: Date.now(),
                active: true
            };
            
            this.statusHistory.push(status);
            
            // 限制历史记录大小
            if (this.statusHistory.length > this.maxHistory) {
                this.statusHistory = this.statusHistory.slice(-this.maxHistory);
            }
            
            // 计算导入速度
            this.calculateImportSpeed(status);
            
            // 输出监控信息
            this.logStatus(status);
        }
    }
    
    /**
     * 计算导入速度
     * @param {Object} status - 当前状态
     */
    calculateImportSpeed(status) {
        if (this.statusHistory.length > 1) {
            const previousStatus = this.statusHistory[this.statusHistory.length - 2];
            const timeDiff = (status.timestamp - previousStatus.timestamp) / 1000; // 秒
            const itemDiff = (status.completed + status.failed) - (previousStatus.completed + previousStatus.failed);
            
            if (timeDiff > 0) {
                const speed = itemDiff / timeDiff;
                status.importSpeed = speed;
            }
        }
    }
    
    /**
     * 输出状态信息
     * @param {Object} status - 状态对象
     */
    logStatus(status) {
        const progress = status.progress.toFixed(1);
        const speed = status.importSpeed ? status.importSpeed.toFixed(2) : '0.00';
        const eta = status.estimatedTime ? (status.estimatedTime).toFixed(0) : 'unknown';
        
        console.log(`📊 进度: ${progress}% | 速度: ${speed} items/s | 预计剩余: ${eta}s`);
    }
    
    /**
     * 获取导入统计
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

// 使用导入状态监控器
const monitor = new ImportStatusMonitor(importManager);
monitor.startMonitoring();

// 执行导入
await importManager.importFiles(filesToImport);

// 停止监控
monitor.stopMonitoring();

// 获取统计信息
const stats = monitor.getStats();
console.log('导入统计:', stats);
```

## 最佳实践

### 使用建议

#### 导入前准备
```javascript
// 创建导入准备助手
class ImportPreparationHelper {
    constructor(importManager) {
        this.importManager = importManager;
    }
    
    /**
     * 准备导入操作
     * @param {Array} files - 文件列表
     * @returns {Object} 准备结果
     */
    async prepareImport(files) {
        console.log('🔍 准备导入操作...');
        
        // 1. 验证导入条件
        const conditionsValid = await this.validateImportConditions();
        if (!conditionsValid) {
            return {
                success: false,
                error: '导入条件验证失败'
            };
        }
        
        // 2. 验证所有文件
        const validationResults = await this.validateAllFiles(files);
        if (!validationResults.allValid) {
            return {
                success: false,
                error: '部分文件验证失败',
                validationResults: validationResults
            };
        }
        
        // 3. 检查磁盘空间（如果使用复制模式）
        const hasEnoughSpace = await this.checkDiskSpace(files);
        if (!hasEnoughSpace) {
            return {
                success: false,
                error: '磁盘空间不足'
            };
        }
        
        // 4. 获取导入设置
        const importSettings = await this.getImportSettings();
        
        console.log('✅ 导入准备完成');
        
        return {
            success: true,
            validFiles: validationResults.validFiles,
            invalidFiles: validationResults.invalidFiles,
            importSettings: importSettings
        };
    }
    
    /**
     * 验证导入条件
     * @returns {boolean} 条件是否有效
     */
    async validateImportConditions() {
        try {
            // 检查项目是否存在
            const projectValid = await this.importManager.projectStatusChecker.validateProjectStatus({
                requireProject: true,
                requireActiveComposition: false,
                showWarning: false
            });
            
            if (!projectValid) {
                console.error('❌ AE项目状态无效');
                return false;
            }
            
            // 检查Eagle连接
            const eagleConnected = await this.importManager.eagleConnectionManager.validateConnection();
            if (!eagleConnected) {
                console.error('❌ Eagle连接无效');
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('验证导入条件失败:', error.message);
            return false;
        }
    }
    
    /**
     * 验证所有文件
     * @param {Array} files - 文件列表
     * @returns {Object} 验证结果
     */
    async validateAllFiles(files) {
        const validFiles = [];
        const invalidFiles = [];
        
        for (const file of files) {
            const validation = this.importManager.validateFileForImport(file);
            
            if (validation.valid) {
                validFiles.push(file);
            } else {
                invalidFiles.push({
                    file: file,
                    error: validation.error
                });
            }
        }
        
        return {
            allValid: invalidFiles.length === 0,
            validFiles: validFiles,
            invalidFiles: invalidFiles
        };
    }
    
    /**
     * 检查磁盘空间
     * @param {Array} files - 文件列表
     * @returns {boolean} 空间是否充足
     */
    async checkDiskSpace(files) {
        try {
            // 计算总文件大小
            const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
            
            // 获取可用空间（这里简化处理，实际需要根据目标位置检查）
            // 在实际实现中，需要检查目标文件夹的可用空间
            console.log(`📊 需要空间: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
            
            // 假设空间充足（实际应用中需要真实检查）
            return true;
            
        } catch (error) {
            console.error('检查磁盘空间失败:', error.message);
            return false;
        }
    }
    
    /**
     * 获取导入设置
     * @returns {Object} 导入设置
     */
    async getImportSettings() {
        return {
            mode: this.importManager.settingsManager.getField('import.mode'),
            addToComposition: this.importManager.settingsManager.getField('import.addToComposition'),
            timelineOptions: this.importManager.settingsManager.getField('import.timelineOptions'),
            projectAdjacentFolder: this.importManager.settingsManager.getField('import.projectAdjacentFolder'),
            customFolderPath: this.importManager.settingsManager.getField('import.customFolderPath')
        };
    }
}

// 使用导入准备助手
const preparationHelper = new ImportPreparationHelper(importManager);

const preparationResult = await preparationHelper.prepareImport(filesToImport);
if (preparationResult.success) {
    console.log('✅ 导入准备成功，开始导入文件');
    
    // 使用验证后的文件列表进行导入
    const importResult = await importManager.importFiles(preparationResult.validFiles);
    console.log('导入结果:', importResult);
} else {
    console.log('❌ 导入准备失败:', preparationResult.error);
    
    if (preparationResult.validationResults) {
        console.log('无效文件:', preparationResult.validationResults.invalidFiles);
    }
}
```

#### 内存管理
```javascript
// 创建导入内存管理器
class ImportMemoryManager {
    constructor(importManager) {
        this.importManager = importManager;
        this.monitorInterval = null;
        this.gcThreshold = 50 * 1024 * 1024; // 50MB
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
        }, 5000); // 每5秒检查一次
        
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
        if (this.importManager.activeImports && this.importManager.activeImports.size === 0) {
            // 清理导入队列中的完成项
            this.importManager.importQueue = this.importManager.importQueue.filter(
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
const memoryManager = new ImportMemoryManager(importManager);
memoryManager.startMonitoring();
```

### 性能优化

#### 批量处理优化
```javascript
// 创建批量处理优化器
class BatchImportOptimizer {
    constructor(importManager) {
        this.importManager = importManager;
        this.batchSize = 10;
        this.concurrentBatches = 3;
    }
    
    /**
     * 优化批量导入
     * @param {Array} files - 文件列表
     * @param {Object} options - 导入选项
     * @returns {Object} 优化的导入结果
     */
    async optimizeBatchImport(files, options = {}) {
        console.log(`🔄 优化批量导入 ${files.length} 个文件...`);
        
        // 1. 按文件类型分组
        const groupedFiles = this.groupFilesByType(files);
        
        // 2. 按大小排序（小文件优先，提高初始反馈速度）
        for (const group of Object.values(groupedFiles)) {
            group.sort((a, b) => (a.size || 0) - (b.size || 0));
        }
        
        // 3. 执行优化的批量导入
        const results = await this.executeOptimizedImport(groupedFiles, options);
        
        return results;
    }
    
    /**
     * 按文件类型分组
     * @param {Array} files - 文件列表
     * @returns {Object} 分组结果
     */
    groupFilesByType(files) {
        const grouped = {
            images: [],
            videos: [],
            audios: [],
            vectors: [],
            others: []
        };
        
        for (const file of files) {
            const extension = this.importManager.getFileExtension(file.path).toLowerCase();
            
            if (this.isImageFile(extension)) {
                grouped.images.push(file);
            } else if (this.isVideoFile(extension)) {
                grouped.videos.push(file);
            } else if (this.isAudioFile(extension)) {
                grouped.audios.push(file);
            } else if (this.isVectorFile(extension)) {
                grouped.vectors.push(file);
            } else {
                grouped.others.push(file);
            }
        }
        
        return grouped;
    }
    
    /**
     * 判断是否为图片文件
     * @param {string} extension - 文件扩展名
     * @returns {boolean} 是否为图片
     */
    isImageFile(extension) {
        return ['.png', '.jpg', '.jpeg', '.gif', '.tga', '.tiff', '.tif', '.psd', '.bmp'].includes(extension);
    }
    
    /**
     * 判断是否为视频文件
     * @param {string} extension - 文件扩展名
     * @returns {boolean} 是否为视频
     */
    isVideoFile(extension) {
        return ['.mp4', '.mov', '.avi', '.mkv', '.m4v', '.wmv', '.flv'].includes(extension);
    }
    
    /**
     * 判断是否为音频文件
     * @param {string} extension - 文件扩展名
     * @returns {boolean} 是否为音频
     */
    isAudioFile(extension) {
        return ['.wav', '.mp3', '.aif', '.aiff', '.flac', '.m4a'].includes(extension);
    }
    
    /**
     * 判断是否为矢量文件
     * @param {string} extension - 文件扩展名
     * @returns {boolean} 是否为矢量
     */
    isVectorFile(extension) {
        return ['.ai', '.pdf', '.eps', '.svg'].includes(extension);
    }
    
    /**
     * 执行优化的导入
     * @param {Object} groupedFiles - 分组的文件
     * @param {Object} options - 导入选项
     * @returns {Object} 导入结果
     */
    async executeOptimizedImport(groupedFiles, options) {
        const allResults = {
            success: true,
            importedFiles: [],
            failedFiles: [],
            totalProcessed: 0,
            totalErrors: 0
        };
        
        // 按优先级处理不同类型的文件
        const importOrder = ['images', 'audios', 'vectors', 'videos', 'others'];
        
        for (const fileType of importOrder) {
            const fileGroup = groupedFiles[fileType];
            if (fileGroup && fileGroup.length > 0) {
                console.log(`🔍 处理 ${fileType} 类型文件: ${fileGroup.length} 个`);
                
                const groupResult = await this.importFileGroup(fileGroup, options);
                
                allResults.importedFiles.push(...groupResult.importedFiles);
                allResults.failedFiles.push(...groupResult.failedFiles);
                allResults.totalProcessed += groupResult.totalProcessed;
                allResults.totalErrors += groupResult.totalErrors;
                
                if (groupResult.totalErrors > 0) {
                    allResults.success = false;
                }
            }
        }
        
        return allResults;
    }
    
    /**
     * 导入文件组
     * @param {Array} fileGroup - 文件组
     * @param {Object} options - 导入选项
     * @returns {Object} 导入结果
     */
    async importFileGroup(fileGroup, options) {
        const results = {
            success: true,
            importedFiles: [],
            failedFiles: [],
            totalProcessed: 0,
            totalErrors: 0
        };
        
        // 分批处理
        const batches = this.chunkArray(fileGroup, this.batchSize);
        
        for (const batch of batches) {
            const batchResult = await this.importManager.importFiles(batch, options);
            
            results.importedFiles.push(...batchResult.importedFiles);
            results.failedFiles.push(...batchResult.failedFiles);
            results.totalProcessed += batchResult.totalProcessed;
            results.totalErrors += batchResult.totalErrors;
            
            if (batchResult.totalErrors > 0) {
                results.success = false;
            }
            
            // 批次间小延迟，避免系统过载
            await new Promise(resolve => setTimeout(resolve, 50));
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
const optimizer = new BatchImportOptimizer(importManager);
const optimizedResult = await optimizer.optimizeBatchImport(filesToImport, {
    mode: 'project_adjacent',
    addToComposition: true
});

console.log('优化批量导入结果:', optimizedResult);
```

## 故障排除

### 常见问题

#### 导入失败
- **症状**：调用`importFiles`后文件未成功导入AE项目
- **解决**：
  1. 检查AE项目是否打开且处于活动状态
  2. 验证Eagle连接是否正常
  3. 检查文件路径和权限
  4. 查看详细的错误日志

#### 路径解析错误
- **症状**：文件路径包含特殊字符或过长导致解析失败
- **解决**：
  1. 检查文件路径格式
  2. 验证路径长度限制
  3. 确认路径中无非法字符
  4. 使用规范化路径函数

#### 内存不足
- **症状**：大量文件导入时出现内存溢出错误
- **解决**：
  1. 减少批量导入数量
  2. 实施分批处理策略
  3. 增加批量处理间隔
  4. 监控内存使用情况

#### 权限错误
- **症状**：无法创建文件夹或复制文件
- **解决**：
  1. 检查目标文件夹权限
  2. 验证源文件访问权限
  3. 确认AE扩展权限设置
  4. 尝试使用不同的目标路径

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
importManager.config.enableLogging = true;
importManager.logManager.config.logLevel = 'debug';

// 监控所有导入操作
importManager.callbacks.onProgress = (progressData) => {
    importManager.log(`📊 进度: ${progressData.progress.toFixed(1)}%`, 'debug');
};

importManager.callbacks.onError = (error) => {
    importManager.log(`❌ 错误: ${error.message}`, 'error', { stack: error.stack });
};
```

#### 导入诊断工具
```javascript
// 创建导入诊断工具
class ImportDiagnostics {
    constructor(importManager) {
        this.importManager = importManager;
    }
    
    /**
     * 运行导入诊断
     */
    async runDiagnostics() {
        console.log('🔍 开始导入诊断...');
        
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
        
        console.log('✅ 导入诊断完成');
    }
    
    /**
     * 检查环境状态
     */
    async checkEnvironment() {
        // 检查AE项目状态
        const projectStatus = await this.importManager.projectStatusChecker.getProjectStatus();
        console.log(`   AE项目: ${projectStatus.projectExists ? '已打开' : '未打开'}`);
        
        // 检查Eagle连接状态
        const eagleStatus = await this.importManager.eagleConnectionManager.getConnectionInfo();
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
        const settings = this.importManager.settingsManager.getSettings();
        console.log(`   导入模式: ${settings.import.mode}`);
        console.log(`   添加到合成: ${settings.import.addToComposition}`);
        console.log(`   项目旁文件夹: ${settings.import.projectAdjacentFolder}`);
        console.log(`   自定义路径: ${settings.import.customFolderPath}`);
    }
    
    /**
     * 测试基本操作
     */
    async testBasicOperations() {
        // 测试路径操作
        const testPath = 'C:/Test/Path/file.png';
        console.log(`   路径提取: ${this.importManager.extractFolderPath(testPath)}`);
        console.log(`   文件名提取: ${this.importManager.extractFileName(testPath)}`);
        
        // 测试文件验证
        const testFile = { name: 'test.png', path: testPath };
        const validation = this.importManager.validateFileForImport(testFile);
        console.log(`   文件验证: ${validation.valid ? '通过' : '失败'}`);
    }
    
    /**
     * 检查性能
     */
    async checkPerformance() {
        const startTime = performance.now();
        
        // 模拟简单操作
        for (let i = 0; i < 1000; i++) {
            const path = this.importManager.normalizePath(`C:\\Test\\Path\\file${i}.png`);
        }
        
        const endTime = performance.now();
        console.log(`   路径处理性能: 1000次操作耗时 ${(endTime - startTime).toFixed(2)}ms`);
    }
}

// 运行诊断
const diagnostics = new ImportDiagnostics(importManager);
await diagnostics.runDiagnostics();
```

## 扩展性

### 自定义扩展

#### 扩展导入管理器
```javascript
// 创建自定义导入管理器
class CustomImportManager extends ImportManager {
    constructor(aeExtension) {
        super(aeExtension);
        
        // 添加自定义属性
        this.cloudStorageEnabled = false;
        this.cloudStorageConfig = null;
        this.metadataExtractor = null;
        this.previewGenerator = null;
        this.importValidationRules = new Set();
        
        // 初始化扩展功能
        this.initCustomFeatures();
    }
    
    initCustomFeatures() {
        // 初始化元数据提取器
        this.initMetadataExtractor();
        
        // 初始化预览生成器
        this.initPreviewGenerator();
        
        // 添加自定义验证规则
        this.addCustomValidationRules();
    }
    
    initMetadataExtractor() {
        this.metadataExtractor = {
            extract: async (filePath) => {
                // 模拟元数据提取
                return {
                    dimensions: { width: 1920, height: 1080 },
                    duration: null,
                    frameRate: null,
                    colorSpace: 'RGB',
                    bitDepth: 8,
                    createdDate: new Date().toISOString()
                };
            }
        };
    }
    
    initPreviewGenerator() {
        this.previewGenerator = {
            generate: async (filePath, options = {}) => {
                // 模拟预览生成
                return {
                    thumbnail: null, // 实际应用中会返回缩略图数据
                    previewVideo: null,
                    metadata: await this.metadataExtractor.extract(filePath)
                };
            }
        };
    }
    
    addCustomValidationRules() {
        // 添加文件大小验证规则
        this.importValidationRules.add(async (file) => {
            if (file.size > 100 * 1024 * 1024) { // 100MB
                return {
                    valid: false,
                    error: '文件大小超过100MB限制'
                };
            }
            return { valid: true };
        });
        
        // 添加路径长度验证规则
        this.importValidationRules.add((file) => {
            if (file.path.length > 200) {
                return {
                    valid: false,
                    error: '文件路径过长，超过200字符限制'
                };
            }
            return { valid: true };
        });
    }
    
    /**
     * 重写文件验证方法，添加自定义验证
     * @param {Object} file - 文件对象
     * @returns {Object} 验证结果
     */
    async validateFileForImport(file) {
        // 首先执行父类的基本验证
        const basicValidation = super.validateFileForImport(file);
        if (!basicValidation.valid) {
            return basicValidation;
        }
        
        // 执行自定义验证规则
        for (const rule of this.importValidationRules) {
            try {
                const ruleResult = await rule(file);
                if (!ruleResult.valid) {
                    return ruleResult;
                }
            } catch (error) {
                this.log(`自定义验证规则执行失败: ${error.message}`, 'warning');
                // 验证规则执行失败不应该阻止导入
                continue;
            }
        }
        
        return { valid: true };
    }
    
    /**
     * 从云端存储导入
     * @param {string} cloudPath - 云端路径
     * @param {Object} options - 选项
     * @returns {Object} 导入结果
     */
    async importFromCloud(cloudPath, options = {}) {
        if (!this.cloudStorageEnabled) {
            return {
                success: false,
                error: '云端存储功能未启用'
            };
        }
        
        try {
            this.log(`📥 从云端导入: ${cloudPath}`, 'debug');
            
            // 下载云端文件到临时位置
            const downloadResult = await this.downloadFromCloud(cloudPath);
            if (!downloadResult.success) {
                throw new Error(downloadResult.error);
            }
            
            // 导入下载的文件
            const importResult = await this.importFile({
                name: downloadResult.fileName,
                path: downloadResult.localPath,
                size: downloadResult.fileSize,
                type: 'downloaded'
            }, options);
            
            // 清理临时文件
            setTimeout(() => {
                this.cleanupTempFiles([{ path: downloadResult.localPath }]);
            }, 5000); // 5秒后清理
            
            if (importResult.success) {
                return {
                    success: true,
                    importedFile: {
                        ...importResult.importedFile,
                        cloudPath: cloudPath,
                        downloadTime: downloadResult.downloadTime
                    }
                };
            } else {
                throw new Error(importResult.error);
            }
            
        } catch (error) {
            this.log(`❌ 云端导入失败: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 下载云端文件
     * @param {string} cloudPath - 云端路径
     * @returns {Object} 下载结果
     */
    async downloadFromCloud(cloudPath) {
        try {
            // 模拟云端下载
            if (window.__DEMO_MODE_ACTIVE__) {
                // Demo模式：模拟下载
                const fileName = this.extractFileName(cloudPath);
                const localPath = `C:/Temp/${fileName}`;
                
                return {
                    success: true,
                    fileName: fileName,
                    localPath: localPath,
                    fileSize: 1024000, // 1MB
                    downloadTime: 1000 // 1秒
                };
            }
            
            // 实际云端下载逻辑
            // 这里会根据具体的云存储服务实现
            const response = await fetch(cloudPath);
            if (!response.ok) {
                throw new Error(`下载失败: ${response.status} ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const fileName = this.extractFileName(cloudPath);
            
            // 保存到本地临时位置
            const localPath = await this.saveBlobToFile(blob, fileName);
            
            return {
                success: true,
                fileName: fileName,
                localPath: localPath,
                fileSize: blob.size,
                downloadTime: Date.now() - startTime
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 保存Blob到文件
     * @param {Blob} blob - Blob对象
     * @param {string} fileName - 文件名
     * @returns {string} 本地文件路径
     */
    async saveBlobToFile(blob, fileName) {
        // 在实际实现中，这会将Blob保存到本地文件
        // 由于浏览器限制，这通常需要用户手动保存
        return `C:/Temp/${fileName}`;
    }
    
    /**
     * 生成文件预览
     * @param {string} filePath - 文件路径
     * @param {Object} options - 选项
     * @returns {Object} 预览结果
     */
    async generatePreview(filePath, options = {}) {
        try {
            this.log(`🔍 生成预览: ${filePath}`, 'debug');
            
            const preview = await this.previewGenerator.generate(filePath, options);
            
            this.log(`✅ 预览生成完成`, 'success');
            return {
                success: true,
                preview: preview
            };
            
        } catch (error) {
            this.log(`❌ 预览生成失败: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 提取文件元数据
     * @param {string} filePath - 文件路径
     * @returns {Object} 元数据
     */
    async extractMetadata(filePath) {
        try {
            this.log(`🔍 提取元数据: ${filePath}`, 'debug');
            
            const metadata = await this.metadataExtractor.extract(filePath);
            
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
}

// 使用自定义导入管理器
const customImportManager = new CustomImportManager(aeExtension);

// 生成文件预览
const previewResult = await customImportManager.generatePreview('C:/test/image.png');
console.log('预览结果:', previewResult);

// 提取文件元数据
const metadataResult = await customImportManager.extractMetadata('C:/test/video.mp4');
console.log('元数据结果:', metadataResult);
```

#### 插件化架构
```javascript
// 创建导入插件系统
class ImportPluginManager {
    constructor(importManager) {
        this.importManager = importManager;
        this.plugins = new Map();
        this.hooks = new Map();
    }
    
    /**
     * 注册导入插件
     * @param {string} pluginId - 插件ID
     * @param {Object} plugin - 插件对象
     */
    registerPlugin(pluginId, plugin) {
        this.plugins.set(pluginId, plugin);
        
        // 绑定插件钩子
        if (plugin.onBeforeImport) {
            this.addHook('beforeImport', plugin.onBeforeImport.bind(plugin));
        }
        
        if (plugin.onAfterImport) {
            this.addHook('afterImport', plugin.onAfterImport.bind(plugin));
        }
        
        if (plugin.onImportError) {
            this.addHook('importError', plugin.onImportError.bind(plugin));
        }
        
        if (plugin.onFileValidate) {
            this.addHook('fileValidate', plugin.onFileValidate.bind(plugin));
        }
        
        this.importManager.log(`🔌 插件已注册: ${pluginId}`, 'debug');
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
                    this.importManager.log(`钩子执行失败 ${hookName}: ${error.message}`, 'error');
                }
            }
        }
        
        return results;
    }
    
    /**
     * 执行导入前的插件逻辑
     * @param {Array} files - 文件列表
     * @param {Object} options - 选项
     * @returns {Object} 处理结果
     */
    async executeBeforeImport(files, options) {
        const pluginResults = await this.triggerHook('beforeImport', files, options);
        return { success: true, pluginResults };
    }
    
    /**
     * 执行导入后的插件逻辑
     * @param {Object} importResult - 导入结果
     * @returns {Object} 处理结果
     */
    async executeAfterImport(importResult) {
        const pluginResults = await this.triggerHook('afterImport', importResult);
        return { success: true, pluginResults };
    }
}

// 示例插件：水印添加插件
const watermarkPlugin = {
    id: 'watermark',
    name: 'Watermark Plugin',
    
    onBeforeImport: async (files, options) => {
        console.log('🖼️ 水印插件: 准备添加水印');
        
        // 这里可以实现水印添加逻辑
        // 例如：修改文件路径以指向水印处理后的副本
        return { success: true };
    },
    
    onAfterImport: async (importResult) => {
        console.log('🖼️ 水印插件: 导入完成，应用水印设置');
        
        // 这里可以实现导入后的水印处理
        return { success: true };
    }
};

// 示例插件：格式转换插件
const formatConverterPlugin = {
    id: 'formatConverter',
    name: 'Format Converter Plugin',
    
    onFileValidate: async (file) => {
        console.log(`🔄 格式转换插件: 验证文件 ${file.name}`);
        
        // 检查是否需要格式转换
        const supportedFormats = this.importManager.getAllowedFileExtensions();
        const fileExt = this.importManager.getFileExtension(file.path).toLowerCase();
        
        if (!supportedFormats.includes(fileExt)) {
            // 可以尝试转换格式
            console.log(`📁 不支持的格式 ${fileExt}，可能需要转换`);
        }
        
        return { success: true };
    }
};

// 使用插件管理器
const pluginManager = new ImportPluginManager(importManager);

// 注册插件
pluginManager.registerPlugin('watermark', watermarkPlugin);
pluginManager.registerPlugin('formatConverter', formatConverterPlugin);

// 在导入前后执行插件
const testFiles = [{ name: 'test.png', path: 'C:/test/test.png' }];
const testOptions = { mode: 'project_adjacent' };

// 执行导入前插件
await pluginManager.executeBeforeImport(testFiles, testOptions);

// 执行实际导入
const importResult = await importManager.importFiles(testFiles, testOptions);

// 执行导入后插件
await pluginManager.executeAfterImport(importResult);