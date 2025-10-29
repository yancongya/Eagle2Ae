# 文件处理系统

## 概述

文件处理系统（File Processing System）是 Eagle2Ae AE 扩展 v2.4.0 引入的重要功能模块，负责处理各种文件导入导出操作。该系统支持多种文件格式、智能路径管理、文件验证、错误处理等功能，确保文件操作的安全性和可靠性。

## 核心特性

### 多格式支持
- 支持图片、视频、音频等多种文件格式
- 提供文件类型自动识别和分类
- 支持自定义文件类型扩展

### 智能路径管理
- 支持项目旁复制、指定文件夹、直接导入等多种路径模式
- 提供路径验证和错误处理
- 支持路径智能重命名和冲突解决

### 文件验证机制
- 实现文件完整性验证
- 提供文件格式验证
- 支持文件大小和权限检查

### 错误处理系统
- 完善的错误捕获和处理机制
- 详细的错误日志记录
- 友好的用户错误提示

### 性能优化
- 批量文件处理优化
- 内存使用优化
- 异步处理避免阻塞UI

## 技术实现

### 核心类结构

```javascript
/**
 * 文件处理器
 * 负责处理从Eagle导入到AE的文件，以及从AE导出到Eagle的文件
 */
class FileHandler {
    /**
     * 构造函数
     * @param {Object} settingsManager - 设置管理器
     * @param {Object} csInterface - CEP接口
     * @param {Function} logFunction - 日志函数
     */
    constructor(settingsManager, csInterface, logFunction) {
        this.settingsManager = settingsManager;
        this.csInterface = csInterface;
        this.log = logFunction || console.log;
        
        // 初始化状态
        this.processingQueue = [];
        this.isProcessing = false;
        this.processedFiles = new Map();
        this.fileCategories = new Map();
        this.errorHandlers = new Map();
        
        // 绑定方法上下文
        this.handleImportRequest = this.handleImportRequest.bind(this);
        this.processImportFiles = this.processImportFiles.bind(this);
        this.validateImportFile = this.validateImportFile.bind(this);
        this.executeImportToAE = this.executeImportToAE.bind(this);
        this.handleExportRequest = this.handleExportRequest.bind(this);
        this.processExportFiles = this.processExportFiles.bind(this);
        this.validateExportFile = this.validateExportFile.bind(this);
        this.executeExportToEagle = this.executeExportToEagle.bind(this);
        
        this.log('📁 文件处理器已初始化', 'debug');
    }
}
```

### 文件导入处理实现

```javascript
/**
 * 处理导入请求
 * @param {Array} files - 文件数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导入设置
 * @param {boolean} skipCompositionCheck - 是否跳过合成检查
 * @returns {Promise<Object>} 处理结果
 */
async handleImportRequest(files, projectInfo, settings, skipCompositionCheck = false) {
    try {
        this.log(`📥 开始处理导入请求: ${files.length} 个文件`, 'info');
        
        // 验证文件列表
        if (!Array.isArray(files) || files.length === 0) {
            return {
                success: false,
                error: '没有可导入的文件',
                importedCount: 0
            };
        }
        
        // 验证项目信息
        if (!projectInfo) {
            return {
                success: false,
                error: '项目信息不可用',
                importedCount: 0
            };
        }
        
        // 验证设置
        if (!settings) {
            return {
                success: false,
                error: '导入设置不可用',
                importedCount: 0
            };
        }
        
        // 检查合成状态（除非明确跳过）
        if (!skipCompositionCheck) {
            const compositionCheck = await this.checkCompositionState(projectInfo);
            if (!compositionCheck.valid) {
                return {
                    success: false,
                    error: compositionCheck.error,
                    importedCount: 0
                };
            }
        }
        
        // 处理文件导入
        const importResult = await this.processImportFiles(files, projectInfo, settings);
        
        // 记录处理结果
        this.log(`📥 导入请求处理完成: 成功导入 ${importResult.importedCount} 个文件`, 'success');
        
        return importResult;
        
    } catch (error) {
        this.log(`❌ 处理导入请求失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message,
            importedCount: 0
        };
    }
}

/**
 * 处理文件导入
 * @param {Array} files - 文件数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导入设置
 * @returns {Promise<Object>} 导入结果
 */
async processImportFiles(files, projectInfo, settings) {
    try {
        // 分类文件
        const categorizedFiles = this.categorizeFiles(files);
        
        // 验证文件
        const validatedFiles = await this.validateImportFiles(categorizedFiles, settings);
        
        // 过滤无效文件
        const validFiles = validatedFiles.filter(file => file.valid);
        const invalidFiles = validatedFiles.filter(file => !file.valid);
        
        if (validFiles.length === 0) {
            return {
                success: false,
                error: '没有有效的文件可以导入',
                importedCount: 0,
                validFiles: validFiles,
                invalidFiles: invalidFiles
            };
        }
        
        // 执行导入到AE
        const importResult = await this.executeImportToAE(validFiles, projectInfo, settings);
        
        // 构造完整结果
        const result = {
            success: importResult.success,
            error: importResult.error,
            importedCount: importResult.importedCount || 0,
            validFiles: validFiles,
            invalidFiles: invalidFiles,
            importedFiles: importResult.importedFiles || [],
            debug: importResult.debug || []
        };
        
        // 记录详细日志
        if (result.success) {
            this.log(`✅ 成功导入 ${result.importedCount} 个文件`, 'success');
            
            if (invalidFiles.length > 0) {
                this.log(`⚠️ ${invalidFiles.length} 个文件导入失败:`, 'warning');
                invalidFiles.forEach(file => {
                    this.log(`  ❌ ${file.name}: ${file.error}`, 'warning');
                });
            }
        } else {
            this.log(`❌ 文件导入失败: ${result.error}`, 'error');
        }
        
        return result;
        
    } catch (error) {
        this.log(`❌ 处理文件导入失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message,
            importedCount: 0,
            validFiles: [],
            invalidFiles: files.map(file => ({
                ...file,
                valid: false,
                error: error.message
            }))
        };
    }
}
```

### 文件分类实现

```javascript
/**
 * 分类文件
 * @param {Array} files - 文件数组
 * @returns {Object} 分类结果
 */
categorizeFiles(files) {
    try {
        const categories = {
            image: [],
            video: [],
            audio: [],
            design: [],
            project: [],
            unknown: []
        };
        
        files.forEach(file => {
            const category = this.getFileCategory(file);
            categories[category].push(file);
        });
        
        this.log(`📁 文件分类完成:`, 'debug');
        Object.entries(categories).forEach(([category, fileList]) => {
            if (fileList.length > 0) {
                this.log(`  ${category}: ${fileList.length} 个文件`, 'debug');
            }
        });
        
        return categories;
        
    } catch (error) {
        this.log(`❌ 文件分类失败: ${error.message}`, 'error');
        return {
            unknown: files
        };
    }
}

/**
 * 获取文件分类
 * @param {Object} file - 文件对象
 * @returns {string} 文件分类
 */
getFileCategory(file) {
    try {
        // 检查缓存
        const cacheKey = `${file.name}_${file.type}_${file.size}`;
        if (this.fileCategories.has(cacheKey)) {
            return this.fileCategories.get(cacheKey);
        }
        
        // 获取文件扩展名
        const ext = this.getFileExtension(file.name).toLowerCase();
        
        // 根据扩展名分类
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg', 'exr', 'hdr', 'dpx', 'cin'];
        const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'mxf', 'r3d', 'cinema', 'c4d', 'prores', 'dnxhd', 'h264', 'h265', 'hevc'];
        const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'aiff'];
        const designExtensions = ['psd', 'ai', 'eps', 'pdf', 'sketch', 'fig', 'xd'];
        const projectExtensions = ['aep', 'aet', 'prproj', 'aepx'];
        
        let category = 'unknown';
        
        if (imageExtensions.includes(ext)) {
            category = 'image';
        } else if (videoExtensions.includes(ext)) {
            category = 'video';
        } else if (audioExtensions.includes(ext)) {
            category = 'audio';
        } else if (designExtensions.includes(ext)) {
            category = 'design';
        } else if (projectExtensions.includes(ext)) {
            category = 'project';
        }
        
        // 缓存结果
        this.fileCategories.set(cacheKey, category);
        
        return category;
        
    } catch (error) {
        return 'unknown';
    }
}

/**
 * 获取文件扩展名
 * @param {string} fileName - 文件名
 * @returns {string} 文件扩展名
 */
getFileExtension(fileName) {
    try {
        const lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : '';
    } catch (error) {
        return '';
    }
}
```

### 文件验证实现

```javascript
/**
 * 验证导入文件
 * @param {Object} categorizedFiles - 分类的文件
 * @param {Object} settings - 导入设置
 * @returns {Promise<Array>} 验证结果
 */
async validateImportFiles(categorizedFiles, settings) {
    try {
        const allFiles = [
            ...categorizedFiles.image,
            ...categorizedFiles.video,
            ...categorizedFiles.audio,
            ...categorizedFiles.design,
            ...categorizedFiles.project,
            ...categorizedFiles.unknown
        ];
        
        const validationResults = [];
        
        for (const file of allFiles) {
            const validationResult = await this.validateImportFile(file, settings);
            validationResults.push(validationResult);
        }
        
        return validationResults;
        
    } catch (error) {
        this.log(`❌ 批量验证文件失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 验证单个导入文件
 * @param {Object} file - 文件对象
 * @param {Object} settings - 导入设置
 * @returns {Promise<Object>} 验证结果
 */
async validateImportFile(file, settings) {
    try {
        const result = {
            ...file,
            valid: false,
            error: null,
            category: this.getFileCategory(file),
            extension: this.getFileExtension(file.name)
        };
        
        // 检查文件大小
        if (file.size && file.size > 0) {
            const sizeValidation = this.validateFileSize(file.size);
            if (!sizeValidation.valid) {
                result.valid = false;
                result.error = sizeValidation.error;
                return result;
            }
        }
        
        // 检查文件扩展名
        const extValidation = this.validateFileExtension(file.name);
        if (!extValidation.valid) {
            result.valid = false;
            result.error = extValidation.error;
            return result;
        }
        
        // 检查文件路径
        const pathValidation = this.validateFilePath(file.path || file.webkitRelativePath || file.name);
        if (!pathValidation.valid) {
            result.valid = false;
            result.error = pathValidation.error;
            return result;
        }
        
        // 检查文件类型支持
        const typeValidation = this.validateFileType(file);
        if (!typeValidation.valid) {
            result.valid = false;
            result.error = typeValidation.error;
            return result;
        }
        
        // 检查文件是否已在项目中
        const projectCheck = await this.checkFileInProject(file);
        if (projectCheck.inProject) {
            result.valid = false;
            result.error = '文件已存在于项目中';
            result.inProject = true;
            return result;
        }
        
        // 文件验证通过
        result.valid = true;
        return result;
        
    } catch (error) {
        this.log(`❌ 验证文件 ${file.name} 失败: ${error.message}`, 'error');
        return {
            ...file,
            valid: false,
            error: error.message,
            category: this.getFileCategory(file),
            extension: this.getFileExtension(file.name)
        };
    }
}

/**
 * 验证文件大小
 * @param {number} fileSize - 文件大小（字节）
 * @returns {Object} 验证结果
 */
validateFileSize(fileSize) {
    try {
        // 检查文件大小是否合理
        if (fileSize <= 0) {
            return {
                valid: false,
                error: '文件大小无效'
            };
        }
        
        // 检查是否超出限制（10GB）
        const maxSize = 10 * 1024 * 1024 * 1024; // 10GB
        if (fileSize > maxSize) {
            return {
                valid: false,
                error: `文件过大 (${this.formatFileSize(fileSize)} > ${this.formatFileSize(maxSize)})`
            };
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `文件大小验证失败: ${error.message}`
        };
    }
}

/**
 * 验证文件扩展名
 * @param {string} fileName - 文件名
 * @returns {Object} 验证结果
 */
validateFileExtension(fileName) {
    try {
        const ext = this.getFileExtension(fileName).toLowerCase();
        
        // 检查扩展名是否有效
        if (!ext || ext.trim() === '') {
            return {
                valid: false,
                error: '文件扩展名无效'
            };
        }
        
        // 检查扩展名是否包含非法字符
        const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
        if (invalidChars.test(ext)) {
            return {
                valid: false,
                error: '文件扩展名包含非法字符'
            };
        }
        
        // 检查扩展名长度
        if (ext.length > 10) {
            return {
                valid: false,
                error: '文件扩展名过长'
            };
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `文件扩展名验证失败: ${error.message}`
        };
    }
}

/**
 * 验证文件路径
 * @param {string} filePath - 文件路径
 * @returns {Object} 验证结果
 */
validateFilePath(filePath) {
    try {
        // 检查路径是否有效
        if (!filePath || filePath.trim() === '') {
            return {
                valid: false,
                error: '文件路径无效'
            };
        }
        
        // 检查路径是否包含非法字符
        const invalidChars = /[<>:"|?*\x00-\x1f]/;
        if (invalidChars.test(filePath)) {
            return {
                valid: false,
                error: '文件路径包含非法字符'
            };
        }
        
        // 检查路径长度
        if (filePath.length > 260) {
            return {
                valid: false,
                error: '文件路径过长'
            };
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `文件路径验证失败: ${error.message}`
        };
    }
}

/**
 * 验证文件类型
 * @param {Object} file - 文件对象
 * @returns {Object} 验证结果
 */
validateFileType(file) {
    try {
        const category = this.getFileCategory(file);
        
        // 检查是否支持该类别
        const supportedCategories = ['image', 'video', 'audio', 'design'];
        if (!supportedCategories.includes(category)) {
            // 对于项目文件，给出特殊提示
            if (category === 'project') {
                return {
                    valid: false,
                    error: '不支持直接导入项目文件，请在AE中打开项目文件'
                };
            }
            
            return {
                valid: false,
                error: `不支持的文件类型: ${category}`
            };
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `文件类型验证失败: ${error.message}`
        };
    }
}
```

### 导入到AE实现

```javascript
/**
 * 执行导入到AE
 * @param {Array} files - 文件数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导入设置
 * @returns {Promise<Object>} 导入结果
 */
async executeImportToAE(files, projectInfo, settings) {
    try {
        this.log(`🚀 开始导入 ${files.length} 个文件到AE`, 'info');
        
        // 根据导入模式准备文件路径
        const preparedFiles = await this.prepareFilesForImport(files, settings);
        
        // 构造导入参数
        const importParams = {
            files: preparedFiles.map(file => ({
                name: file.name,
                path: file.finalPath || file.path,
                size: file.size,
                type: file.type,
                category: file.category,
                originalPath: file.originalPath || file.path
            })),
            settings: {
                mode: settings.mode,
                projectAdjacentFolder: settings.projectAdjacentFolder,
                customFolderPath: settings.customFolderPath,
                addToComposition: settings.addToComposition,
                timelineOptions: settings.timelineOptions
            },
            projectInfo: {
                projectPath: projectInfo.projectPath,
                projectName: projectInfo.projectName,
                activeComp: projectInfo.activeComp
            }
        };
        
        // 执行ExtendScript导入
        const result = await this.executeExtendScript('importFilesToAE', importParams);
        
        if (result && result.success) {
            this.log(`✅ 成功导入 ${result.importedCount} 个文件到AE`, 'success');
            
            return {
                success: true,
                importedCount: result.importedCount,
                importedFiles: result.importedFiles,
                debug: result.debug || []
            };
        } else {
            const errorMsg = result && result.error ? result.error : '导入失败';
            this.log(`❌ 导入到AE失败: ${errorMsg}`, 'error');
            
            return {
                success: false,
                error: errorMsg,
                importedCount: 0,
                importedFiles: [],
                debug: result && result.debug ? result.debug : []
            };
        }
        
    } catch (error) {
        this.log(`❌ 执行导入到AE失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message,
            importedCount: 0,
            importedFiles: [],
            debug: [error.message]
        };
    }
}

/**
 * 准备文件用于导入
 * @param {Array} files - 文件数组
 * @param {Object} settings - 导入设置
 * @returns {Promise<Array>} 准备好的文件数组
 */
async prepareFilesForImport(files, settings) {
    try {
        const preparedFiles = [];
        
        for (const file of files) {
            const preparedFile = {
                ...file,
                category: this.getFileCategory(file),
                extension: this.getFileExtension(file.name)
            };
            
            // 根据导入模式准备文件路径
            switch (settings.mode) {
                case 'direct':
                    // 直接导入：使用原始路径
                    preparedFile.finalPath = file.path || file.webkitRelativePath || file.name;
                    break;
                    
                case 'project_adjacent':
                    // 项目旁复制：准备项目旁路径
                    preparedFile.finalPath = await this.prepareProjectAdjacentPath(file, settings);
                    break;
                    
                case 'custom_folder':
                    // 指定文件夹：准备指定文件夹路径
                    preparedFile.finalPath = await this.prepareCustomFolderPath(file, settings);
                    break;
                    
                default:
                    // 默认使用直接导入
                    preparedFile.finalPath = file.path || file.webkitRelativePath || file.name;
            }
            
            preparedFiles.push(preparedFile);
        }
        
        return preparedFiles;
        
    } catch (error) {
        this.log(`❌ 准备导入文件失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 准备项目旁路径
 * @param {Object} file - 文件对象
 * @param {Object} settings - 导入设置
 * @returns {Promise<string>} 项目旁路径
 */
async prepareProjectAdjacentPath(file, settings) {
    try {
        const projectAdjacentFolder = settings.projectAdjacentFolder || 'Eagle_Assets';
        
        // 获取项目路径
        const projectPath = this.getProjectPath();
        if (!projectPath) {
            throw new Error('无法获取项目路径');
        }
        
        // 构造项目旁路径
        const projectDir = projectPath.substring(0, projectPath.lastIndexOf('\\'));
        const finalPath = `${projectDir}\\${projectAdjacentFolder}\\${file.name}`;
        
        this.log(`📁 项目旁路径: ${finalPath}`, 'debug');
        
        return finalPath;
        
    } catch (error) {
        this.log(`❌ 准备项目旁路径失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 准备指定文件夹路径
 * @param {Object} file - 文件对象
 * @param {Object} settings - 导入设置
 * @returns {Promise<string>} 指定文件夹路径
 */
async prepareCustomFolderPath(file, settings) {
    try {
        const customFolderPath = settings.customFolderPath;
        
        if (!customFolderPath || customFolderPath.trim() === '') {
            throw new Error('指定文件夹路径为空');
        }
        
        // 检查路径格式
        if (customFolderPath.startsWith('[已选择]')) {
            throw new Error('指定文件夹路径格式无效');
        }
        
        // 构造指定文件夹路径
        const finalPath = `${customFolderPath}\\${file.name}`;
        
        this.log(`📁 指定文件夹路径: ${finalPath}`, 'debug');
        
        return finalPath;
        
    } catch (error) {
        this.log(`❌ 准备指定文件夹路径失败: ${error.message}`, 'error');
        throw error;
    }
}
```

### 文件导出处理实现

```javascript
/**
 * 处理导出请求
 * @param {Array} layers - 图层数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导出设置
 * @returns {Promise<Object>} 处理结果
 */
async handleExportRequest(layers, projectInfo, settings) {
    try {
        this.log(`📤 开始处理导出请求: ${layers.length} 个图层`, 'info');
        
        // 验证图层数组
        if (!Array.isArray(layers) || layers.length === 0) {
            return {
                success: false,
                error: '没有可导出的图层',
                exportedCount: 0
            };
        }
        
        // 验证项目信息
        if (!projectInfo) {
            return {
                success: false,
                error: '项目信息不可用',
                exportedCount: 0
            };
        }
        
        // 验证设置
        if (!settings) {
            return {
                success: false,
                error: '导出设置不可用',
                exportedCount: 0
            };
        }
        
        // 处理图层导出
        const exportResult = await this.processExportFiles(layers, projectInfo, settings);
        
        // 记录处理结果
        this.log(`📤 导出请求处理完成: 成功导出 ${exportResult.exportedCount} 个图层`, 'success');
        
        return exportResult;
        
    } catch (error) {
        this.log(`❌ 处理导出请求失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message,
            exportedCount: 0
        };
    }
}

/**
 * 处理文件导出
 * @param {Array} layers - 图层数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导出设置
 * @returns {Promise<Object>} 导出结果
 */
async processExportFiles(layers, projectInfo, settings) {
    try {
        // 验证图层
        const validatedLayers = await this.validateExportLayers(layers, settings);
        
        // 过滤无效图层
        const validLayers = validatedLayers.filter(layer => layer.valid);
        const invalidLayers = validatedLayers.filter(layer => !layer.valid);
        
        if (validLayers.length === 0) {
            return {
                success: false,
                error: '没有有效的图层可以导出',
                exportedCount: 0,
                validLayers: validLayers,
                invalidLayers: invalidLayers
            };
        }
        
        // 执行导出到Eagle
        const exportResult = await this.executeExportToEagle(validLayers, projectInfo, settings);
        
        // 构造完整结果
        const result = {
            success: exportResult.success,
            error: exportResult.error,
            exportedCount: exportResult.exportedCount || 0,
            validLayers: validLayers,
            invalidLayers: invalidLayers,
            exportedLayers: exportResult.exportedLayers || [],
            debug: exportResult.debug || []
        };
        
        // 记录详细日志
        if (result.success) {
            this.log(`✅ 成功导出 ${result.exportedCount} 个图层`, 'success');
            
            if (invalidLayers.length > 0) {
                this.log(`⚠️ ${invalidLayers.length} 个图层导出失败:`, 'warning');
                invalidLayers.forEach(layer => {
                    this.log(`  ❌ ${layer.name}: ${layer.error}`, 'warning');
                });
            }
        } else {
            this.log(`❌ 图层导出失败: ${result.error}`, 'error');
        }
        
        return result;
        
    } catch (error) {
        this.log(`❌ 处理文件导出失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message,
            exportedCount: 0,
            validLayers: [],
            invalidLayers: layers.map(layer => ({
                ...layer,
                valid: false,
                error: error.message
            }))
        };
    }
}

/**
 * 验证导出图层
 * @param {Array} layers - 图层数组
 * @param {Object} settings - 导出设置
 * @returns {Promise<Array>} 验证结果
 */
async validateExportLayers(layers, settings) {
    try {
        const validationResults = [];
        
        for (const layer of layers) {
            const validationResult = await this.validateExportLayer(layer, settings);
            validationResults.push(validationResult);
        }
        
        return validationResults;
        
    } catch (error) {
        this.log(`❌ 批量验证图层失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 验证单个导出图层
 * @param {Object} layer - 图层对象
 * @param {Object} settings - 导出设置
 * @returns {Promise<Object>} 验证结果
 */
async validateExportLayer(layer, settings) {
    try {
        const result = {
            ...layer,
            valid: false,
            error: null,
            type: layer.type || 'Unknown',
            category: this.getLayerCategory(layer)
        };
        
        // 检查图层名称
        if (!layer.name || layer.name.trim() === '') {
            result.valid = false;
            result.error = '图层名称无效';
            return result;
        }
        
        // 检查图层类型
        const typeValidation = this.validateLayerType(layer);
        if (!typeValidation.valid) {
            result.valid = false;
            result.error = typeValidation.error;
            return result;
        }
        
        // 检查图层是否可导出
        const exportableValidation = this.validateLayerExportable(layer);
        if (!exportableValidation.valid) {
            result.valid = false;
            result.error = exportableValidation.error;
            return result;
        }
        
        // 图层验证通过
        result.valid = true;
        return result;
        
    } catch (error) {
        this.log(`❌ 验证图层 ${layer.name} 失败: ${error.message}`, 'error');
        return {
            ...layer,
            valid: false,
            error: error.message,
            type: layer.type || 'Unknown',
            category: this.getLayerCategory(layer)
        };
    }
}

/**
 * 获取图层分类
 * @param {Object} layer - 图层对象
 * @returns {string} 图层分类
 */
getLayerCategory(layer) {
    try {
        // 根据图层类型分类
        switch (layer.type) {
            case 'ShapeLayer':
                return 'shape';
            case 'TextLayer':
                return 'text';
            case 'SolidLayer':
                return 'solid';
            case 'PrecompLayer':
                return 'precomp';
            case 'CameraLayer':
                return 'camera';
            case 'LightLayer':
                return 'light';
            case 'AdjustmentLayer':
                return 'adjustment';
            case 'SequenceLayer':
                return 'sequence';
            default:
                return 'unknown';
        }
        
    } catch (error) {
        return 'unknown';
    }
}

/**
 * 验证图层类型
 * @param {Object} layer - 图层对象
 * @returns {Object} 验证结果
 */
validateLayerType(layer) {
    try {
        const supportedTypes = [
            'ShapeLayer', 'TextLayer', 'SolidLayer', 'PrecompLayer',
            'CameraLayer', 'LightLayer', 'AdjustmentLayer', 'SequenceLayer'
        ];
        
        if (layer.type && !supportedTypes.includes(layer.type)) {
            return {
                valid: false,
                error: `不支持的图层类型: ${layer.type}`
            };
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `图层类型验证失败: ${error.message}`
        };
    }
}

/**
 * 验证图层是否可导出
 * @param {Object} layer - 图层对象
 * @returns {Object} 验证结果
 */
validateLayerExportable(layer) {
    try {
        // 检查图层是否标记为可导出
        if (layer.exportable === false) {
            return {
                valid: false,
                error: layer.reason || '图层不可导出'
            };
        }
        
        // 检查图层是否有源信息
        if (!layer.sourceInfo) {
            return {
                valid: false,
                error: '图层缺少源信息'
            };
        }
        
        // 检查源信息是否完整
        if (!layer.sourceInfo.originalPath || layer.sourceInfo.originalPath.trim() === '') {
            return {
                valid: false,
                error: '图层源路径无效'
            };
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `图层可导出性验证失败: ${error.message}`
        };
    }
}
```

### 导出到Eagle实现

```javascript
/**
 * 执行导出到Eagle
 * @param {Array} layers - 图层数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导出设置
 * @returns {Promise<Object>} 导出结果
 */
async executeExportToEagle(layers, projectInfo, settings) {
    try {
        this.log(`🚀 开始导出 ${layers.length} 个图层到Eagle`, 'info');
        
        // 根据导出模式准备导出路径
        const exportPath = await this.prepareExportPath(settings);
        
        // 构造导出参数
        const exportParams = {
            layers: layers.map(layer => ({
                name: layer.name,
                type: layer.type,
                category: layer.category,
                sourceInfo: layer.sourceInfo,
                tooltipInfo: layer.tooltipInfo
            })),
            settings: {
                mode: settings.exportSettings.mode,
                customExportPath: settings.exportSettings.customExportPath,
                projectAdjacentFolder: settings.exportSettings.projectAdjacentFolder,
                autoCopy: settings.exportSettings.autoCopy,
                burnAfterReading: settings.exportSettings.burnAfterReading,
                addTimestamp: settings.exportSettings.addTimestamp,
                createSubfolders: settings.exportSettings.createSubfolders
            },
            projectInfo: {
                projectPath: projectInfo.projectPath,
                projectName: projectInfo.projectName,
                activeComp: projectInfo.activeComp
            },
            exportPath: exportPath
        };
        
        // 执行ExtendScript导出
        const result = await this.executeExtendScript('exportLayersToEagle', exportParams);
        
        if (result && result.success) {
            this.log(`✅ 成功导出 ${result.exportedCount} 个图层到Eagle`, 'success');
            
            return {
                success: true,
                exportedCount: result.exportedCount,
                exportedLayers: result.exportedLayers,
                exportPath: result.exportPath,
                debug: result.debug || []
            };
        } else {
            const errorMsg = result && result.error ? result.error : '导出失败';
            this.log(`❌ 导出到Eagle失败: ${errorMsg}`, 'error');
            
            return {
                success: false,
                error: errorMsg,
                exportedCount: 0,
                exportedLayers: [],
                exportPath: null,
                debug: result && result.debug ? result.debug : []
            };
        }
        
    } catch (error) {
        this.log(`❌ 执行导出到Eagle失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message,
            exportedCount: 0,
            exportedLayers: [],
            exportPath: null,
            debug: [error.message]
        };
    }
}

/**
 * 准备导出路径
 * @param {Object} settings - 导出设置
 * @returns {Promise<string>} 导出路径
 */
async prepareExportPath(settings) {
    try {
        const exportSettings = settings.exportSettings || {};
        const mode = exportSettings.mode || 'project_adjacent';
        
        switch (mode) {
            case 'desktop':
                // 桌面导出：使用系统桌面路径
                return await this.getDesktopPath();
                
            case 'project_adjacent':
                // 项目旁导出：使用项目旁路径
                const projectAdjacentFolder = exportSettings.projectAdjacentFolder || 'Eagle_Assets';
                return await this.getProjectAdjacentExportPath(projectAdjacentFolder);
                
            case 'custom_folder':
                // 指定文件夹导出：使用指定路径
                const customExportPath = exportSettings.customExportPath;
                if (!customExportPath || customExportPath.trim() === '') {
                    throw new Error('指定导出路径为空');
                }
                
                if (customExportPath.startsWith('[已选择]')) {
                    throw new Error('指定导出路径格式无效');
                }
                
                return customExportPath;
                
            default:
                // 默认使用项目旁导出
                return await this.getProjectAdjacentExportPath('Eagle_Assets');
        }
        
    } catch (error) {
        this.log(`❌ 准备导出路径失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 获取桌面路径
 * @returns {Promise<string>} 桌面路径
 */
async getDesktopPath() {
    try {
        // 使用ExtendScript获取桌面路径
        const result = await this.executeExtendScript('getDesktopPath', {});
        
        if (result && result.success && result.desktopPath) {
            this.log(`🖥️ 桌面路径: ${result.desktopPath}`, 'debug');
            return result.desktopPath;
        } else {
            const errorMsg = result && result.error ? result.error : '无法获取桌面路径';
            throw new Error(errorMsg);
        }
        
    } catch (error) {
        this.log(`获取桌面路径失败: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * 获取项目旁导出路径
 * @param {string} folderName - 文件夹名称
 * @returns {Promise<string>} 项目旁导出路径
 */
async getProjectAdjacentExportPath(folderName) {
    try {
        // 获取项目路径
        const projectPath = this.getProjectPath();
        if (!projectPath) {
            throw new Error('无法获取项目路径');
        }
        
        // 构造项目旁路径
        const projectDir = projectPath.substring(0, projectPath.lastIndexOf('\\'));
        const exportPath = `${projectDir}\\${folderName}`;
        
        this.log(`📁 项目旁导出路径: ${exportPath}`, 'debug');
        
        return exportPath;
        
    } catch (error) {
        this.log(`获取项目旁导出路径失败: ${error.message}`, 'error');
        throw error;
    }
}
```

## API参考

### 核心方法

#### FileHandler
文件处理器主类

```javascript
/**
 * 文件处理器
 * 负责处理从Eagle导入到AE的文件，以及从AE导出到Eagle的文件
 */
class FileHandler
```

#### constructor()
构造函数

```javascript
/**
 * 构造函数
 * @param {Object} settingsManager - 设置管理器
 * @param {Object} csInterface - CEP接口
 * @param {Function} logFunction - 日志函数
 */
constructor(settingsManager, csInterface, logFunction)
```

#### handleImportRequest()
处理导入请求

```javascript
/**
 * 处理导入请求
 * @param {Array} files - 文件数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导入设置
 * @param {boolean} skipCompositionCheck - 是否跳过合成检查
 * @returns {Promise<Object>} 处理结果
 */
async handleImportRequest(files, projectInfo, settings, skipCompositionCheck = false)
```

#### processImportFiles()
处理文件导入

```javascript
/**
 * 处理文件导入
 * @param {Array} files - 文件数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导入设置
 * @returns {Promise<Object>} 导入结果
 */
async processImportFiles(files, projectInfo, settings)
```

#### categorizeFiles()
分类文件

```javascript
/**
 * 分类文件
 * @param {Array} files - 文件数组
 * @returns {Object} 分类结果
 */
categorizeFiles(files)
```

#### getFileCategory()
获取文件分类

```javascript
/**
 * 获取文件分类
 * @param {Object} file - 文件对象
 * @returns {string} 文件分类
 */
getFileCategory(file)
```

#### getFileExtension()
获取文件扩展名

```javascript
/**
 * 获取文件扩展名
 * @param {string} fileName - 文件名
 * @returns {string} 文件扩展名
 */
getFileExtension(fileName)
```

#### validateImportFiles()
验证导入文件

```javascript
/**
 * 验证导入文件
 * @param {Object} categorizedFiles - 分类的文件
 * @param {Object} settings - 导入设置
 * @returns {Promise<Array>} 验证结果
 */
async validateImportFiles(categorizedFiles, settings)
```

#### validateImportFile()
验证单个导入文件

```javascript
/**
 * 验证单个导入文件
 * @param {Object} file - 文件对象
 * @param {Object} settings - 导入设置
 * @returns {Promise<Object>} 验证结果
 */
async validateImportFile(file, settings)
```

#### validateFileSize()
验证文件大小

```javascript
/**
 * 验证文件大小
 * @param {number} fileSize - 文件大小（字节）
 * @returns {Object} 验证结果
 */
validateFileSize(fileSize)
```

#### validateFileExtension()
验证文件扩展名

```javascript
/**
 * 验证文件扩展名
 * @param {string} fileName - 文件名
 * @returns {Object} 验证结果
 */
validateFileExtension(fileName)
```

#### validateFilePath()
验证文件路径

```javascript
/**
 * 验证文件路径
 * @param {string} filePath - 文件路径
 * @returns {Object} 验证结果
 */
validateFilePath(filePath)
```

#### validateFileType()
验证文件类型

```javascript
/**
 * 验证文件类型
 * @param {Object} file - 文件对象
 * @returns {Object} 验证结果
 */
validateFileType(file)
```

#### executeImportToAE()
执行导入到AE

```javascript
/**
 * 执行导入到AE
 * @param {Array} files - 文件数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导入设置
 * @returns {Promise<Object>} 导入结果
 */
async executeImportToAE(files, projectInfo, settings)
```

#### prepareFilesForImport()
准备文件用于导入

```javascript
/**
 * 准备文件用于导入
 * @param {Array} files - 文件数组
 * @param {Object} settings - 导入设置
 * @returns {Promise<Array>} 准备好的文件数组
 */
async prepareFilesForImport(files, settings)
```

#### prepareProjectAdjacentPath()
准备项目旁路径

```javascript
/**
 * 准备项目旁路径
 * @param {Object} file - 文件对象
 * @param {Object} settings - 导入设置
 * @returns {Promise<string>} 项目旁路径
 */
async prepareProjectAdjacentPath(file, settings)
```

#### prepareCustomFolderPath()
准备指定文件夹路径

```javascript
/**
 * 准备指定文件夹路径
 * @param {Object} file - 文件对象
 * @param {Object} settings - 导入设置
 * @returns {Promise<string>} 指定文件夹路径
 */
async prepareCustomFolderPath(file, settings)
```

#### handleExportRequest()
处理导出请求

```javascript
/**
 * 处理导出请求
 * @param {Array} layers - 图层数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导出设置
 * @returns {Promise<Object>} 处理结果
 */
async handleExportRequest(layers, projectInfo, settings)
```

#### processExportFiles()
处理文件导出

```javascript
/**
 * 处理文件导出
 * @param {Array} layers - 图层数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导出设置
 * @returns {Promise<Object>} 导出结果
 */
async processExportFiles(layers, projectInfo, settings)
```

#### validateExportLayers()
验证导出图层

```javascript
/**
 * 验证导出图层
 * @param {Array} layers - 图层数组
 * @param {Object} settings - 导出设置
 * @returns {Promise<Array>} 验证结果
 */
async validateExportLayers(layers, settings)
```

#### validateExportLayer()
验证单个导出图层

```javascript
/**
 * 验证单个导出图层
 * @param {Object} layer - 图层对象
 * @param {Object} settings - 导出设置
 * @returns {Promise<Object>} 验证结果
 */
async validateExportLayer(layer, settings)
```

#### getLayerCategory()
获取图层分类

```javascript
/**
 * 获取图层分类
 * @param {Object} layer - 图层对象
 * @returns {string} 图层分类
 */
getLayerCategory(layer)
```

#### validateLayerType()
验证图层类型

```javascript
/**
 * 验证图层类型
 * @param {Object} layer - 图层对象
 * @returns {Object} 验证结果
 */
validateLayerType(layer)
```

#### validateLayerExportable()
验证图层是否可导出

```javascript
/**
 * 验证图层是否可导出
 * @param {Object} layer - 图层对象
 * @returns {Object} 验证结果
 */
validateLayerExportable(layer)
```

#### executeExportToEagle()
执行导出到Eagle

```javascript
/**
 * 执行导出到Eagle
 * @param {Array} layers - 图层数组
 * @param {Object} projectInfo - 项目信息
 * @param {Object} settings - 导出设置
 * @returns {Promise<Object>} 导出结果
 */
async executeExportToEagle(layers, projectInfo, settings)
```

#### prepareExportPath()
准备导出路径

```javascript
/**
 * 准备导出路径
 * @param {Object} settings - 导出设置
 * @returns {Promise<string>} 导出路径
 */
async prepareExportPath(settings)
```

#### getDesktopPath()
获取桌面路径

```javascript
/**
 * 获取桌面路径
 * @returns {Promise<string>} 桌面路径
 */
async getDesktopPath()
```

#### getProjectAdjacentExportPath()
获取项目旁导出路径

```javascript
/**
 * 获取项目旁导出路径
 * @param {string} folderName - 文件夹名称
 * @returns {Promise<string>} 项目旁导出路径
 */
async getProjectAdjacentExportPath(folderName)
```

### 辅助方法

#### getProjectPath()
获取项目路径

```javascript
/**
 * 获取项目路径
 * @returns {string|null} 项目路径或null
 */
getProjectPath()
```

#### formatFileSize()
格式化文件大小

```javascript
/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化的文件大小
 */
formatFileSize(bytes)
```

#### executeExtendScript()
执行ExtendScript

```javascript
/**
 * 执行ExtendScript
 * @param {string} functionName - 函数名称
 * @param {Object} params - 参数
 * @returns {Promise<Object>} 执行结果
 */
async executeExtendScript(functionName, params)
```

#### addFieldListener()
添加字段监听器

```javascript
/**
 * 添加字段监听器
 * @param {string} fieldPath - 字段路径
 * @param {Function} listener - 监听器函数
 * @param {boolean} once - 是否只监听一次
 * @returns {Function} 移除监听器的函数
 */
addFieldListener(fieldPath, listener, once = false)
```

#### removeFieldListener()
移除字段监听器

```javascript
/**
 * 移除字段监听器
 * @param {string} fieldPath - 字段路径
 * @param {Function} listener - 监听器函数
 */
removeFieldListener(fieldPath, listener)
```

#### emitFieldChange()
触发字段变更事件

```javascript
/**
 * 触发字段变更事件
 * @param {string} fieldPath - 字段路径
 * @param {*} newValue - 新值
 * @param {*} oldValue - 旧值
 */
emitFieldChange(fieldPath, newValue, oldValue)
```

#### getFieldFromObject()
从对象中获取字段值

```javascript
/**
 * 从对象中获取字段值
 * @param {Object} obj - 对象
 * @param {string} fieldPath - 字段路径
 * @returns {*} 字段值
 */
getFieldFromObject(obj, fieldPath)
```

#### setFieldToObject()
将字段值设置到对象中

```javascript
/**
 * 将字段值设置到对象中
 * @param {Object} obj - 对象
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 值
 * @returns {boolean} 是否设置成功
 */
setFieldToObject(obj, fieldPath, value)
```

#### shouldShowVirtualDialog()
检查是否应该显示虚拟对话框

```javascript
/**
 * 检查是否应该显示虚拟对话框
 * @returns {boolean} 是否应该显示虚拟对话框
 */
shouldShowVirtualDialog()
```

#### showRealDialog()
显示真实对话框

```javascript
/**
 * 显示真实对话框
 * @param {Object} config - 对话框配置
 * @returns {Promise<any>} 对话框结果
 */
async showRealDialog(config)
```

#### log()
记录日志

```javascript
/**
 * 记录日志
 * @param {string} message - 日志消息
 * @param {string} level - 日志级别
 * @param {Object} options - 日志选项
 */
log(message, level = 'info', options = {})
```

#### mergeSettings()
合并设置对象

```javascript
/**
 * 合并设置对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
mergeSettings(target, source)
```

#### deepClone()
深拷贝对象

```javascript
/**
 * 深拷贝对象
 * @param {Object} obj - 要拷贝的对象
 * @returns {Object} 拷贝后的对象
 */
deepClone(obj)
```

#### isEqual()
比较两个对象是否相等

```javascript
/**
 * 比较两个对象是否相等
 * @param {Object} obj1 - 对象1
 * @param {Object} obj2 - 对象2
 * @returns {boolean} 是否相等
 */
isEqual(obj1, obj2)
```

## 使用示例

### 基本使用

#### 文件导入处理
```javascript
// 创建文件处理器实例
const fileHandler = new FileHandler(settingsManager, csInterface, logFunction);

// 处理文件导入请求
const importResult = await fileHandler.handleImportRequest(
    files,           // 文件数组
    projectInfo,     // 项目信息
    settings,        // 导入设置
    false            // 是否跳过合成检查
);

if (importResult.success) {
    console.log(`✅ 成功导入 ${importResult.importedCount} 个文件`);
} else {
    console.error(`❌ 导入失败: ${importResult.error}`);
}
```

#### 图层导出处理
```javascript
// 处理图层导出请求
const exportResult = await fileHandler.handleExportRequest(
    layers,          // 图层数组
    projectInfo,     // 项目信息
    settings         // 导出设置
);

if (exportResult.success) {
    console.log(`✅ 成功导出 ${exportResult.exportedCount} 个图层`);
    console.log(`📁 导出路径: ${exportResult.exportPath}`);
} else {
    console.error(`❌ 导出失败: ${exportResult.error}`);
}
```

### 高级使用

#### 文件分类和验证
```javascript
// 分类文件
const categorizedFiles = fileHandler.categorizeFiles(files);
console.log('文件分类结果:', categorizedFiles);

// 验证文件
const validationResults = await fileHandler.validateImportFiles(categorizedFiles, settings);
const validFiles = validationResults.filter(file => file.valid);
const invalidFiles = validationResults.filter(file => !file.valid);

console.log(`有效文件: ${validFiles.length} 个`);
console.log(`无效文件: ${invalidFiles.length} 个`);
```

#### 自定义文件处理
```javascript
// 添加自定义验证器
fileHandler.addValidator('customFilePath', (filePath) => {
    // 自定义文件路径验证逻辑
    if (!filePath || filePath.trim() === '') {
        return {
            valid: false,
            error: '文件路径不能为空'
        };
    }
    
    // 检查路径是否包含非法字符
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(filePath)) {
        return {
            valid: false,
            error: '文件路径包含非法字符'
        };
    }
    
    return {
        valid: true
    };
});

// 使用自定义验证器
const customValidation = fileHandler.validateField('customFilePath', '/path/to/file.png');
if (!customValidation.valid) {
    console.error(`自定义验证失败: ${customValidation.error}`);
}
```

#### 批量文件处理
```javascript
// 批量处理多个文件导入请求
async function batchImportFiles(fileGroups, projectInfos, settings) {
    const results = [];
    
    for (let i = 0; i < fileGroups.length; i++) {
        try {
            const result = await fileHandler.handleImportRequest(
                fileGroups[i],
                projectInfos[i],
                settings[i],
                false
            );
            
            results.push({
                groupIndex: i,
                success: result.success,
                importedCount: result.importedCount,
                error: result.error
            });
            
        } catch (error) {
            results.push({
                groupIndex: i,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

// 使用批量处理
const fileGroups = [group1Files, group2Files, group3Files];
const projectInfos = [projectInfo1, projectInfo2, projectInfo3];
const settings = [settings1, settings2, settings3];

const batchResults = await batchImportFiles(fileGroups, projectInfos, settings);
console.log('批量导入结果:', batchResults);
```

## 最佳实践

### 使用建议

#### 文件处理优化
```javascript
// 使用防抖避免频繁文件处理
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 防抖处理文件导入
const debouncedImport = debounce((files, projectInfo, settings) => {
    fileHandler.handleImportRequest(files, projectInfo, settings);
}, 500);
```

#### 错误处理
```javascript
// 完善的错误处理
async function safeImportFiles(files, projectInfo, settings) {
    try {
        const result = await fileHandler.handleImportRequest(files, projectInfo, settings);
        
        if (result.success) {
            // 成功处理
            console.log(`✅ 文件导入成功: ${result.importedCount} 个文件`);
            return result;
        } else {
            // 处理错误
            console.error(`❌ 文件导入失败: ${result.error}`);
            
            // 显示用户友好的错误提示
            showUserFriendlyError('文件导入失败', result.error);
            
            return result;
        }
        
    } catch (error) {
        // 异常处理
        console.error(`💥 文件导入异常: ${error.message}`);
        
        // 记录详细错误日志
        fileHandler.log(`文件导入异常: ${error.message}`, 'error');
        fileHandler.log(`异常堆栈: ${error.stack}`, 'debug');
        
        // 显示错误提示
        showUserFriendlyError('文件导入异常', error.message);
        
        throw error;
    }
}
```

#### 性能优化
```javascript
// 批量处理大文件列表
async function processLargeFileList(files, projectInfo, settings) {
    const batchSize = 50; // 每批处理50个文件
    
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        try {
            const result = await fileHandler.handleImportRequest(batch, projectInfo, settings);
            
            if (result.success) {
                console.log(`✅ 批次 ${Math.floor(i/batchSize) + 1} 处理成功: ${result.importedCount} 个文件`);
            } else {
                console.error(`❌ 批次 ${Math.floor(i/batchSize) + 1} 处理失败: ${result.error}`);
            }
            
        } catch (error) {
            console.error(`💥 批次 ${Math.floor(i/batchSize) + 1} 处理异常: ${error.message}`);
        }
        
        // 避免阻塞UI线程
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
```

### 内存管理

#### 及时清理资源
```javascript
// 清理文件处理器资源
function cleanupFileHandler() {
    // 移除所有字段监听器
    fileHandler.fieldListeners.clear();
    
    // 清理缓存
    fileHandler.fileCategories.clear();
    fileHandler.processedFiles.clear();
    
    // 清理错误处理器
    fileHandler.errorHandlers.clear();
    
    // 清理变更监听器
    fileHandler.changeListeners = [];
    
    fileHandler.log('📁 文件处理器资源已清理', 'debug');
}

// 在组件销毁时调用
window.addEventListener('beforeunload', cleanupFileHandler);
```

#### 缓存优化
```javascript
// 实现智能缓存清理
class SmartFileHandler extends FileHandler {
    constructor(settingsManager, csInterface, logFunction) {
        super(settingsManager, csInterface, logFunction);
        this.cacheTimeouts = new Map();
        this.maxCacheSize = 1000;
    }
    
    /**
     * 智能缓存文件分类结果
     * @param {string} cacheKey - 缓存键
     * @param {string} category - 分类结果
     * @param {number} timeout - 超时时间（毫秒）
     */
    smartCacheFileCategory(cacheKey, category, timeout = 30000) {
        // 添加到缓存
        this.fileCategories.set(cacheKey, category);
        
        // 设置超时清理
        if (this.cacheTimeouts.has(cacheKey)) {
            clearTimeout(this.cacheTimeouts.get(cacheKey));
        }
        
        const timeoutId = setTimeout(() => {
            this.fileCategories.delete(cacheKey);
            this.cacheTimeouts.delete(cacheKey);
        }, timeout);
        
        this.cacheTimeouts.set(cacheKey, timeoutId);
        
        // 限制缓存大小
        if (this.fileCategories.size > this.maxCacheSize) {
            const firstKey = this.fileCategories.keys().next().value;
            this.fileCategories.delete(firstKey);
            if (this.cacheTimeouts.has(firstKey)) {
                clearTimeout(this.cacheTimeouts.get(firstKey));
                this.cacheTimeouts.delete(firstKey);
            }
        }
    }
    
    /**
     * 清理所有缓存
     */
    clearAllCache() {
        this.fileCategories.clear();
        
        // 清理超时定时器
        this.cacheTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.cacheTimeouts.clear();
        
        this.log('🧹 所有文件处理缓存已清理', 'debug');
    }
}
```

## 故障排除

### 常见问题

#### 文件导入失败
- **症状**：文件无法正确导入到AE项目中
- **解决**：
  1. 检查文件路径是否正确
  2. 验证文件格式是否受支持
  3. 确认AE项目已打开且有活动合成

#### 图层导出失败
- **症状**：AE图层无法正确导出到Eagle
- **解决**：
  1. 检查导出路径权限
  2. 验证图层是否可导出
  3. 确认Eagle插件已正确安装并运行

#### 文件验证错误
- **症状**：文件被错误地标记为无效
- **解决**：
  1. 检查文件验证规则设置
  2. 验证文件扩展名和路径格式
  3. 确认文件大小是否超出限制

#### 设置保存失败
- **症状**：配置变更后无法正确保存
- **解决**：
  1. 检查localStorage权限
  2. 验证设置验证规则
  3. 确认设置格式是否正确

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控文件处理过程
fileHandler.addFieldListener('fileProcessing', (event) => {
    console.log('📁 文件处理事件:', event);
});

// 监控设置变更
fileHandler.addFieldListener('settingsChange', (event) => {
    console.log('⚙️ 设置变更事件:', event);
});
```

#### 性能分析
```javascript
// 记录文件处理性能
const startTime = performance.now();
const result = await fileHandler.handleImportRequest(files, projectInfo, settings);
const endTime = performance.now();

console.log(`⏱️ 文件处理耗时: ${endTime - startTime}ms`);

// 分析内存使用
if (performance.memory) {
    console.log('🧠 内存使用情况:', {
        used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
    });
}
```

#### 错误追踪
```javascript
// 添加错误追踪
fileHandler.errorHandlers.set('fileImportError', (error, fileInfo) => {
    console.error('📁 文件导入错误:', {
        fileName: fileInfo.name,
        filePath: fileInfo.path,
        error: error.message,
        stack: error.stack
    });
    
    // 记录到错误日志系统
    if (window.errorLogger) {
        window.errorLogger.logError('fileImportError', {
            fileInfo: fileInfo,
            error: error,
            timestamp: new Date().toISOString()
        });
    }
});

// 监控未处理的Promise错误
window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 未处理的Promise错误:', event.reason);
    
    // 记录到文件处理器日志
    fileHandler.log(`未处理的Promise错误: ${event.reason.message}`, 'error');
});
```

## 扩展性

### 自定义扩展

#### 扩展文件处理器
```javascript
// 创建自定义文件处理器
class CustomFileHandler extends FileHandler {
    constructor(settingsManager, csInterface, logFunction) {
        super(settingsManager, csInterface, logFunction);
        this.customValidators = new Map();
        this.customProcessors = new Map();
    }
    
    /**
     * 添加自定义验证器
     * @param {string} fieldPath - 字段路径
     * @param {Function} validator - 验证函数
     */
    addCustomValidator(fieldPath, validator) {
        this.customValidators.set(fieldPath, validator);
    }
    
    /**
     * 添加自定义处理器
     * @param {string} fileType - 文件类型
     * @param {Function} processor - 处理函数
     */
    addCustomProcessor(fileType, processor) {
        this.customProcessors.set(fileType, processor);
    }
    
    /**
     * 验证字段（重写父类方法）
     * @param {string} fieldPath - 字段路径
     * @param {*} value - 字段值
     * @returns {Object} 验证结果
     */
    validateField(fieldPath, value) {
        // 首先检查自定义验证器
        if (this.customValidators.has(fieldPath)) {
            const validator = this.customValidators.get(fieldPath);
            return validator(value);
        }
        
        // 调用父类验证方法
        return super.validateField(fieldPath, value);
    }
    
    /**
     * 处理文件导入（重写父类方法）
     * @param {Array} files - 文件数组
     * @param {Object} projectInfo - 项目信息
     * @param {Object} settings - 导入设置
     * @returns {Promise<Object>} 处理结果
     */
    async processImportFiles(files, projectInfo, settings) {
        // 检查是否有自定义处理器
        const fileTypes = [...new Set(files.map(file => this.getFileCategory(file)))];
        
        for (const fileType of fileTypes) {
            if (this.customProcessors.has(fileType)) {
                const processor = this.customProcessors.get(fileType);
                const typeFiles = files.filter(file => this.getFileCategory(file) === fileType);
                
                try {
                    const result = await processor(typeFiles, projectInfo, settings);
                    if (result.handled) {
                        // 自定义处理器已处理这些文件
                        this.log(`📁 自定义处理器已处理 ${typeFiles.length} 个 ${fileType} 类型文件`, 'debug');
                        // 从文件列表中移除已处理的文件
                        files = files.filter(file => this.getFileCategory(file) !== fileType);
                    }
                } catch (error) {
                    this.log(`📁 自定义处理器处理 ${fileType} 类型文件失败: ${error.message}`, 'error');
                }
            }
        }
        
        // 调用父类处理剩余文件
        return super.processImportFiles(files, projectInfo, settings);
    }
}

// 使用自定义文件处理器
const customFileHandler = new CustomFileHandler(settingsManager, csInterface, logFunction);

// 添加自定义验证器
customFileHandler.addCustomValidator('customProjectPath', (value) => {
    if (!value || value.trim() === '') {
        return { valid: false, error: '项目路径不能为空' };
    }
    return { valid: true };
});

// 添加自定义处理器
customFileHandler.addCustomProcessor('special_video', async (files, projectInfo, settings) => {
    // 处理特殊视频文件
    console.log(`处理 ${files.length} 个特殊视频文件`);
    return { handled: true };
});
```

#### 插件化架构
```javascript
// 创建文件处理插件
class FileProcessingPlugin {
    constructor(fileHandler) {
        this.fileHandler = fileHandler;
        this.init();
    }
    
    init() {
        // 注册插件特定的验证规则
        this.fileHandler.addValidator('plugin.customOption', (value) => {
            // 自定义验证逻辑
            return { valid: true };
        });
        
        // 添加插件特定的迁移规则
        this.fileHandler.addMigration(3, (settings) => {
            // 迁移逻辑
            return settings;
        });
        
        // 绑定插件事件
        this.bindPluginEvents();
    }
    
    /**
     * 绑定插件事件
     */
    bindPluginEvents() {
        // 监听文件处理事件
        this.fileHandler.addFieldListener('fileProcessing', (event) => {
            this.handleFileProcessingEvent(event);
        });
        
        // 监听设置变更事件
        this.fileHandler.addFieldListener('settingsChange', (event) => {
            this.handleSettingsChangeEvent(event);
        });
    }
    
    /**
     * 处理文件处理事件
     * @param {Object} event - 事件对象
     */
    handleFileProcessingEvent(event) {
        const { type, data } = event;
        
        switch (type) {
            case 'importStart':
                console.log(`📥 开始导入 ${data.fileCount} 个文件`);
                break;
                
            case 'importComplete':
                console.log(`✅ 导入完成: 成功 ${data.successCount}, 失败 ${data.failCount}`);
                break;
                
            case 'exportStart':
                console.log(`📤 开始导出 ${data.layerCount} 个图层`);
                break;
                
            case 'exportComplete':
                console.log(`✅ 导出完成: 成功 ${data.successCount}, 失败 ${data.failCount}`);
                break;
                
            default:
                console.log(`📁 文件处理事件: ${type}`, data);
        }
    }
    
    /**
     * 处理设置变更事件
     * @param {Object} event - 事件对象
     */
    handleSettingsChangeEvent(event) {
        const { field, newValue, oldValue } = event;
        console.log(`⚙️ 设置变更: ${field} ${oldValue} -> ${newValue}`);
        
        // 根据变更字段执行特定逻辑
        switch (field) {
            case 'mode':
                this.handleModeChange(newValue, oldValue);
                break;
                
            case 'addToComposition':
                this.handleAddToCompositionChange(newValue, oldValue);
                break;
                
            case 'timelineOptions.placement':
                this.handleTimelinePlacementChange(newValue, oldValue);
                break;
                
            default:
                // 通用处理逻辑
                break;
        }
    }
    
    /**
     * 处理导入模式变更
     * @param {string} newValue - 新值
     * @param {string} oldValue - 旧值
     */
    handleModeChange(newValue, oldValue) {
        console.log(`🔄 导入模式变更: ${oldValue} -> ${newValue}`);
        
        // 根据新模式执行特定逻辑
        switch (newValue) {
            case 'direct':
                console.log('📁 使用直接导入模式');
                break;
                
            case 'project_adjacent':
                console.log('📁 使用项目旁复制模式');
                break;
                
            case 'custom_folder':
                console.log('📁 使用指定文件夹模式');
                break;
                
            default:
                console.log('📁 使用未知导入模式');
        }
    }
    
    /**
     * 处理添加到合成选项变更
     * @param {boolean} newValue - 新值
     * @param {boolean} oldValue - 旧值
     */
    handleAddToCompositionChange(newValue, oldValue) {
        console.log(`🔄 添加到合成选项变更: ${oldValue} -> ${newValue}`);
        
        if (newValue) {
            console.log('📁 已启用添加到合成');
        } else {
            console.log('📁 已禁用添加到合成');
        }
    }
    
    /**
     * 处理时间轴放置位置变更
     * @param {string} newValue - 新值
     * @param {string} oldValue - 旧值
     */
    handleTimelinePlacementChange(newValue, oldValue) {
        console.log(`🔄 时间轴放置位置变更: ${oldValue} -> ${newValue}`);
        
        switch (newValue) {
            case 'current_time':
                console.log('📁 使用当前时间放置');
                break;
                
            case 'timeline_start':
                console.log('📁 使用时间轴开始放置');
                break;
                
            default:
                console.log('📁 使用未知放置位置');
        }
    }
}

// 应用插件
const plugin = new FileProcessingPlugin(fileHandler);