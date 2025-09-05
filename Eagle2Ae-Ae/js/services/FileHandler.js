// Eagle2Ae - 文件处理服务

class FileHandler {
    constructor(settingsManager, csInterface, logger) {
        this.settingsManager = settingsManager;
        this.csInterface = csInterface;
        this.logger = logger; // AE扩展的日志方法
        this.quietMode = false; // 静默模式，用于拖拽导入

        // 获取常量
        const constants = window.ImportSettingsConstants || require('../constants/ImportSettings.js');
        this.ImportModes = constants.ImportModes;
        this.TimelinePlacement = constants.TimelinePlacement;
    }

    // 检查合成状态
    async checkCompositionStatus() {
        return new Promise((resolve) => {
            const scriptCall = `
                (function() {
                    try {
                        var project = app.project;
                        if (!project.activeItem || !(project.activeItem instanceof CompItem)) {
                            return JSON.stringify({
                                success: false,
                                error: "没有活动合成，请先选择合成"
                            });
                        }
                        return JSON.stringify({
                            success: true,
                            compName: project.activeItem.name
                        });
                    } catch (error) {
                        return JSON.stringify({
                            success: false,
                            error: "检查合成状态时出错: " + error.toString()
                        });
                    }
                })();
            `;

            this.csInterface.evalScript(scriptCall, (result) => {
                try {
                    const parsedResult = JSON.parse(result);
                    resolve(parsedResult);
                } catch (error) {
                    resolve({
                        success: false,
                        error: `解析合成检查结果失败: ${result}`
                    });
                }
            });
        });
    }

    // 设置静默模式
    setQuietMode(quiet) {
        this.quietMode = quiet;
    }

    // 静默日志方法
    log(message, type = 'info') {
        if (!this.quietMode && this.logger) {
            this.logger(message, type);
        }
    }

    // 处理文件导入请求
    async handleImportRequest(files, projectInfo, customSettings = null) {
        // 使用传入的自定义设置，如果没有则使用默认设置
        const settings = customSettings || this.settingsManager.getSettings();

        // 只在非静默模式下显示详细信息
        if (!this.quietMode) {
            this.log(`FileHandler: 开始处理导入请求`, 'info');
            this.log(`FileHandler: 文件数量: ${files.length}`, 'info');
            this.log(`FileHandler: 导入模式: ${settings.mode}`, 'info');
        }

        try {
            // 如果需要添加到合成，先检查合成状态
            if (settings.addToComposition) {
                this.log('FileHandler: 检查合成状态...', 'info');
                const compCheckResult = await this.checkCompositionStatus();
                if (!compCheckResult.success) {
                    this.log(`FileHandler: 合成检查失败: ${compCheckResult.error}`, 'error');
                    
                    // 调用ExtendScript显示警告弹窗
                    const showDialogScript = `showPanelWarningDialog("没有检测到活动合成", "请先选择要导入的合成后重试。");`;
                    this.csInterface.evalScript(showDialogScript);
                    
                    return {
                        success: false,
                        error: compCheckResult.error,
                        importedCount: 0
                    };
                }
            }

            // 根据导入模式处理文件
            this.log('FileHandler: 开始处理文件...', 'info');
            const processedFiles = await this.processFilesByMode(files, settings, projectInfo);

            // 导入文件到AE
            this.log('FileHandler: 开始导入到AE...', 'info');
            const importResult = await this.importFilesToAE(processedFiles, settings, projectInfo);

            return {
                success: true,
                importedCount: importResult.importedCount,
                processedFiles: processedFiles,
                targetComp: importResult.targetComp
            };

        } catch (error) {
            this.log(`FileHandler: 处理失败: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message,
                importedCount: 0
            };
        }
    }

    // 根据导入模式处理文件
    async processFilesByMode(files, settings, projectInfo) {
        switch (settings.mode) {
            case this.ImportModes.DIRECT:
                return this.processDirectImport(files, settings);
                
            case this.ImportModes.PROJECT_ADJACENT:
                return this.processProjectAdjacentImport(files, settings, projectInfo);
                
            case this.ImportModes.CUSTOM_FOLDER:
                return this.processCustomFolderImport(files, settings);
                
            default:
                throw new Error(`未知的导入模式: ${settings.mode}`);
        }
    }

    // 直接导入模式
    async processDirectImport(files, settings, projectInfo) {
        const processedFiles = [];

        for (const file of files) {
            // 检查是否为临时文件（剪贴板导入的临时文件）
            if (file.isTemporary && file.isClipboardImport) {
                this.log('FileHandler: 检测到临时文件，强制使用项目旁复制模式', 'info');

                // 临时文件强制使用项目旁复制模式
                const tempProcessed = await this.processProjectAdjacentImport([file], settings, projectInfo);
                processedFiles.push(...tempProcessed);
            } else {
                // 普通文件直接使用原始文件路径
                processedFiles.push({
                    originalPath: file.path,
                    importPath: file.path,
                    name: this.processFileName(file.name, settings),
                    tags: file.tags || [],
                    processed: false // 标记为未处理（直接使用原文件）
                });
            }
        }

        return processedFiles;
    }

    // 项目旁复制模式
    async processProjectAdjacentImport(files, settings, projectInfo) {
        this.log('FileHandler: 项目旁复制模式', 'info');

        if (!projectInfo || !projectInfo.projectPath) {
            throw new Error('无法获取AE项目路径，请确保项目已保存');
        }

        // 获取项目目录
        const projectDir = this.getProjectDirectory(projectInfo.projectPath);
        const targetFolder = settings.projectAdjacentFolder || 'Eagle_Assets';
        const targetDir = this.joinPath(projectDir, targetFolder);

        // 静默模式下不显示详细路径信息

        // 创建目标目录
        await this.ensureDirectoryExists(targetDir);

        // 复制文件
        const processedFiles = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const processedFile = await this.copyFileToDirectory(file, targetDir, settings);
                processedFiles.push(processedFile);
            } catch (error) {
                this.log(`FileHandler: 文件 ${i + 1} 处理失败: ${error.message}`, 'error');
                throw error;
            }
        }

        // 静默模式下不显示处理完成信息
        return processedFiles;
    }

    // 指定文件夹模式
    async processCustomFolderImport(files, settings) {
        if (!settings.customFolderPath) {
            throw new Error('请先设置目标文件夹路径');
        }

        const targetDir = settings.customFolderPath;

        // 确保目标目录存在
        await this.ensureDirectoryExists(targetDir);

        // 复制文件
        const processedFiles = [];
        for (const file of files) {
            const processedFile = await this.copyFileToDirectory(file, targetDir, settings);
            processedFiles.push(processedFile);
        }

        return processedFiles;
    }

    // 复制文件到指定目录
    async copyFileToDirectory(file, targetDir, settings) {
        // 处理剪贴板文件的特殊情况
        if (file.isClipboardImport && file.file) {
            return await this.copyClipboardFileToDirectory(file, targetDir, settings);
        }

        // 从原始路径提取完整文件名（包含扩展名）
        const originalFileName = this.getFileNameFromPath(file.path);
        const fileName = this.processFileName(originalFileName, settings);
        let targetPath = this.joinPath(targetDir, fileName);

        // 如果启用了标签文件夹
        if (settings.fileManagement.createTagFolders && file.tags && file.tags.length > 0) {
            const tagFolder = file.tags[0]; // 使用第一个标签作为文件夹名
            const tagDir = this.joinPath(targetDir, this.sanitizeFolderName(tagFolder));
            await this.ensureDirectoryExists(tagDir);
            targetPath = this.joinPath(tagDir, fileName);
        }

        // 规范化路径
        const normalizedSourcePath = this.normalizePath(file.path);
        const normalizedTargetPath = this.normalizePath(targetPath);

        // 静默模式下不显示复制详情

        // 执行文件复制
        await this.copyFile(normalizedSourcePath, normalizedTargetPath);

        const result = {
            originalPath: file.path,
            importPath: normalizedTargetPath,
            name: fileName, // 现在包含完整的文件名和扩展名
            tags: file.tags || [],
            processed: true
        };

        // 静默模式下不显示处理结果

        return result;
    }

    // 复制剪贴板文件到指定目录
    async copyClipboardFileToDirectory(file, targetDir, settings) {
        this.log('FileHandler: 处理剪贴板文件', 'debug');

        // 使用处理后的文件名（可能已经重命名）
        const fileName = this.processFileName(file.name, settings);
        let targetPath = this.joinPath(targetDir, fileName);

        // 如果启用了标签文件夹
        if (settings.fileManagement.createTagFolders && file.tags && file.tags.length > 0) {
            const tagFolder = file.tags[0]; // 使用第一个标签作为文件夹名
            const tagDir = this.joinPath(targetDir, this.sanitizeFolderName(tagFolder));
            await this.ensureDirectoryExists(tagDir);
            targetPath = this.joinPath(tagDir, fileName);
        }

        // 规范化路径
        const normalizedTargetPath = this.normalizePath(targetPath);

        // 只有在用户确认后才写入文件
        // 检查文件是否已确认导入
        if (file.confirmed !== false) {
            // 将File对象写入到目标路径
            await this.writeFileObjectToPath(file.file, normalizedTargetPath);
            this.log(`FileHandler: 剪贴板文件已保存到 ${normalizedTargetPath}`, 'debug');
        } else {
            this.log('FileHandler: 剪贴板文件未确认，跳过写入', 'debug');
        }

        const result = {
            originalPath: file.path,
            importPath: normalizedTargetPath,
            name: fileName,
            tags: file.tags || [],
            processed: true,
            isClipboardFile: true,
            confirmed: file.confirmed
        };

        return result;
    }

    // 将File对象写入到指定路径
    async writeFileObjectToPath(fileObject, targetPath) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const arrayBuffer = e.target.result;
                        const base64Data = this.arrayBufferToBase64Fast(arrayBuffer);

                        // 使用JSX脚本写入文件
                        const script = `writeBase64ToFile("${base64Data}", "${targetPath.replace(/\\/g, '/')}")`;

                        const csInterface = new CSInterface();
                        csInterface.evalScript(script, (result) => {
                            try {
                                const response = JSON.parse(result);
                                if (response.success) {
                                    resolve();
                                } else {
                                    reject(new Error(`JSX文件写入失败: ${response.error}`));
                                }
                            } catch (parseError) {
                                reject(new Error(`JSX响应解析失败: ${result}`));
                            }
                        });

                    } catch (writeError) {
                        reject(new Error(`处理文件数据失败: ${writeError.message}`));
                    }
                };

                reader.onerror = () => {
                    reject(new Error('读取文件对象失败'));
                };

                reader.readAsArrayBuffer(fileObject);

            } catch (error) {
                reject(new Error(`处理文件对象失败: ${error.message}`));
            }
        });
    }

    // 优化的Base64编码方法
    arrayBufferToBase64Fast(buffer) {
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;

        // 对于小文件，使用原来的方法
        if (len < 1024 * 1024) { // 1MB以下
            return this.arrayBufferToBase64(bytes);
        }

        // 对于大文件，分块处理
        let binary = '';
        const chunkSize = 8192; // 8KB chunks

        for (let i = 0; i < len; i += chunkSize) {
            const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
            for (let j = 0; j < chunk.length; j++) {
                binary += String.fromCharCode(chunk[j]);
            }
        }

        return window.btoa(binary);
    }

    // 将ArrayBuffer转换为Base64
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // 处理文件名
    processFileName(originalName, settings) {
        let fileName = originalName;

        // 确保文件名有扩展名
        if (!fileName.includes('.')) {
            // 如果文件名没有扩展名，尝试从原始路径获取
            this.log(`FileHandler: 警告 - 文件名缺少扩展名: ${fileName}`, 'warning');
            // 这里应该不会发生，因为我们传入的是完整的文件名
        }

        // 添加时间戳前缀
        if (settings.fileManagement.addTimestamp) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const ext = this.getFileExtension(fileName);
            const nameWithoutExt = fileName.replace(ext, '');
            fileName = `${timestamp}_${nameWithoutExt}${ext}`;
        }

        // 如果不保持原始文件名，可以在这里添加其他处理逻辑

        return fileName;
    }

    // 导入文件到AE
    async importFilesToAE(processedFiles, settings, projectInfo) {
        // 静默模式下不显示导入开始信息

        const importParams = {
            files: processedFiles,
            settings: settings,
            projectInfo: projectInfo
        };

        return new Promise((resolve, reject) => {
            const scriptCall = `importFilesWithSettings(${JSON.stringify(importParams)})`;

            this.csInterface.evalScript(scriptCall, (result) => {
                try {
                    const parsedResult = JSON.parse(result);
                    if (parsedResult.success) {
                        resolve(parsedResult);
                    } else {
                        this.log(`FileHandler: 导入失败: ${parsedResult.error}`, 'error');
                        reject(new Error(parsedResult.error || '导入失败'));
                    }
                } catch (error) {
                    this.log(`FileHandler: 解析结果失败: ${result}`, 'error');
                    reject(new Error(`解析导入结果失败: ${result}`));
                }
            });
        });
    }

    // 工具方法：获取项目目录
    getProjectDirectory(projectPath) {
        // 移除文件名，只保留目录路径
        const lastSlash = Math.max(projectPath.lastIndexOf('/'), projectPath.lastIndexOf('\\'));
        return projectPath.substring(0, lastSlash);
    }

    // 工具方法：路径拼接
    joinPath(dir, file) {
        const separator = dir.includes('\\') ? '\\' : '/';
        return dir.endsWith(separator) ? dir + file : dir + separator + file;
    }

    // 工具方法：获取文件扩展名
    getFileExtension(fileName) {
        const lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot) : '';
    }

    // 工具方法：从路径中提取文件名
    getFileNameFromPath(filePath) {
        if (!filePath) return '';

        // 处理不同的路径分隔符
        const normalizedPath = filePath.replace(/\\/g, '/');
        const lastSlash = normalizedPath.lastIndexOf('/');

        return lastSlash >= 0 ? normalizedPath.substring(lastSlash + 1) : filePath;
    }

    // 工具方法：清理文件夹名称
    sanitizeFolderName(name) {
        // 移除或替换不允许的字符
        return name.replace(/[<>:"/\\|?*]/g, '_').trim();
    }

    // 工具方法：规范化路径
    normalizePath(path) {
        if (!path) return path;

        // 解码URL编码的字符
        let normalized = path;
        try {
            normalized = decodeURIComponent(path);
        } catch (e) {
            // 如果解码失败，使用原始路径
            console.warn('路径解码失败:', path, e);
        }

        // 规范化路径分隔符（Windows使用反斜杠，其他系统使用正斜杠）
        if (navigator.platform.indexOf('Win') > -1) {
            normalized = normalized.replace(/\//g, '\\');
        } else {
            normalized = normalized.replace(/\\/g, '/');
        }

        return normalized;
    }

    // 工具方法：确保目录存在
    async ensureDirectoryExists(dirPath) {
        return new Promise((resolve, reject) => {
            const normalizedPath = this.normalizePath(dirPath);
            const escapedPath = this.escapePathForScript(normalizedPath);

            this.csInterface.evalScript(`ensureDirectoryExists(${escapedPath})`, (result) => {
                try {
                    const parsedResult = JSON.parse(result);
                    if (parsedResult.success) {
                        resolve();
                    } else {
                        reject(new Error(parsedResult.error || '创建目录失败'));
                    }
                } catch (error) {
                    reject(new Error(`创建目录失败: ${result}`));
                }
            });
        });
    }

    // 工具方法：复制文件
    async copyFile(sourcePath, targetPath) {
        return new Promise((resolve, reject) => {
            // 转义路径中的特殊字符
            const escapedSourcePath = this.escapePathForScript(sourcePath);
            const escapedTargetPath = this.escapePathForScript(targetPath);

            this.csInterface.evalScript(`copyFile(${escapedSourcePath}, ${escapedTargetPath})`, (result) => {
                try {
                    const parsedResult = JSON.parse(result);
                    if (parsedResult.success) {
                        resolve();
                    } else {
                        this.log(`FileHandler: 文件复制失败: ${parsedResult.error}`, 'error');
                        reject(new Error(parsedResult.error || '复制文件失败'));
                    }
                } catch (error) {
                    this.log(`FileHandler: 解析复制结果失败: ${result}`, 'error');
                    reject(new Error(`复制文件失败: ${result}`));
                }
            });
        });
    }

    // 工具方法：递归复制文件夹
    async copyFolder(sourceFolderPath, targetFolderPath) {
        return new Promise((resolve, reject) => {
            // 转义路径中的特殊字符
            const escapedSourcePath = this.escapePathForScript(sourceFolderPath);
            const escapedTargetPath = this.escapePathForScript(targetFolderPath);

            this.csInterface.evalScript(`copyFolder(${escapedSourcePath}, ${escapedTargetPath})`, (result) => {
                try {
                    const parsedResult = JSON.parse(result);
                    if (parsedResult.success) {
                        this.log(`FileHandler: 文件夹复制成功，复制了 ${parsedResult.copiedFiles} 个文件`, 'info');
                        resolve(parsedResult);
                    } else {
                        this.log(`FileHandler: 文件夹复制失败: ${parsedResult.error}`, 'error');
                        reject(new Error(parsedResult.error || '复制文件夹失败'));
                    }
                } catch (error) {
                    this.log(`FileHandler: 解析文件夹复制结果失败: ${result}`, 'error');
                    reject(new Error(`复制文件夹失败: ${result}`));
                }
            });
        });
    }

    // 工具方法：为ExtendScript转义路径
    escapePathForScript(path) {
        if (!path) return '""';

        // 转义反斜杠和引号
        const escaped = path
            .replace(/\\/g, '\\\\')  // 转义反斜杠
            .replace(/"/g, '\\"');   // 转义引号

        return `"${escaped}"`;
    }
}

// 导出文件处理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileHandler;
} else {
    window.FileHandler = FileHandler;
}
