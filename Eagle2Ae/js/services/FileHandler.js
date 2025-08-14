// Export to AE - 文件处理服务

class FileHandler {
    constructor(settingsManager, csInterface, logger) {
        this.settingsManager = settingsManager;
        this.csInterface = csInterface;
        this.logger = logger; // AE扩展的日志方法

        // 获取常量
        const constants = window.ImportSettingsConstants || require('../constants/ImportSettings.js');
        this.ImportModes = constants.ImportModes;
        this.TimelinePlacement = constants.TimelinePlacement;
    }

    // 处理文件导入请求
    async handleImportRequest(files, projectInfo) {
        const settings = this.settingsManager.getSettings();

        if (this.logger) {
            this.logger(`FileHandler: 开始处理导入请求`, 'info');
            this.logger(`FileHandler: 文件数量: ${files.length}`, 'info');
            this.logger(`FileHandler: 导入模式: ${settings.mode}`, 'info');
            this.logger(`FileHandler: 项目信息: ${JSON.stringify(projectInfo)}`, 'info');
        }

        try {
            // 根据导入模式处理文件
            if (this.logger) this.logger('FileHandler: 开始处理文件...', 'info');
            const processedFiles = await this.processFilesByMode(files, settings, projectInfo);
            if (this.logger) this.logger(`FileHandler: 文件处理完成，处理后文件数量: ${processedFiles.length}`, 'info');

            // 导入文件到AE
            if (this.logger) this.logger('FileHandler: 开始导入到AE...', 'info');
            const importResult = await this.importFilesToAE(processedFiles, settings, projectInfo);
            if (this.logger) this.logger(`FileHandler: AE导入完成，结果: ${JSON.stringify(importResult)}`, 'info');

            return {
                success: true,
                importedCount: importResult.importedCount,
                processedFiles: processedFiles,
                message: `成功导入 ${importResult.importedCount} 个文件`
            };

        } catch (error) {
            if (this.logger) this.logger(`FileHandler: 处理失败: ${error.message}`, 'error');
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
    async processDirectImport(files, settings) {
        // 直接使用原始文件路径
        return files.map(file => ({
            originalPath: file.path,
            importPath: file.path,
            name: this.processFileName(file.name, settings),
            tags: file.tags || [],
            processed: false // 标记为未处理（直接使用原文件）
        }));
    }

    // 项目旁复制模式
    async processProjectAdjacentImport(files, settings, projectInfo) {
        if (this.logger) {
            this.logger('FileHandler: 项目旁复制模式', 'info');
            this.logger(`FileHandler: 项目信息: ${JSON.stringify(projectInfo)}`, 'info');
        }

        if (!projectInfo || !projectInfo.projectPath) {
            throw new Error('无法获取AE项目路径，请确保项目已保存');
        }

        // 获取项目目录
        const projectDir = this.getProjectDirectory(projectInfo.projectPath);
        const targetFolder = settings.projectAdjacentFolder || 'Eagle_Assets';
        const targetDir = this.joinPath(projectDir, targetFolder);

        if (this.logger) {
            this.logger(`FileHandler: 项目目录: ${projectDir}`, 'info');
            this.logger(`FileHandler: 目标文件夹: ${targetFolder}`, 'info');
            this.logger(`FileHandler: 完整目标路径: ${targetDir}`, 'info');
        }

        // 创建目标目录
        if (this.logger) this.logger('FileHandler: 创建目标目录...', 'info');
        await this.ensureDirectoryExists(targetDir);
        if (this.logger) this.logger('FileHandler: 目标目录创建完成', 'info');

        // 复制文件
        const processedFiles = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (this.logger) this.logger(`FileHandler: 处理文件 ${i + 1}/${files.length}: ${file.name}`, 'info');
            try {
                const processedFile = await this.copyFileToDirectory(file, targetDir, settings);
                processedFiles.push(processedFile);
                if (this.logger) this.logger(`FileHandler: 文件 ${i + 1} 处理成功`, 'info');
            } catch (error) {
                if (this.logger) this.logger(`FileHandler: 文件 ${i + 1} 处理失败: ${error.message}`, 'error');
                throw error;
            }
        }

        if (this.logger) this.logger(`FileHandler: 所有文件处理完成，成功处理: ${processedFiles.length}`, 'info');
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

        if (this.logger) {
            this.logger(`FileHandler: 复制文件 ${file.name}`, 'info');
            this.logger(`FileHandler: 源路径: ${normalizedSourcePath}`, 'info');
            this.logger(`FileHandler: 目标路径: ${normalizedTargetPath}`, 'info');
        }

        // 执行文件复制
        await this.copyFile(normalizedSourcePath, normalizedTargetPath);

        const result = {
            originalPath: file.path,
            importPath: normalizedTargetPath,
            name: fileName, // 现在包含完整的文件名和扩展名
            tags: file.tags || [],
            processed: true
        };

        if (this.logger) {
            this.logger(`FileHandler: 文件处理结果 - 原始: ${file.name}, 处理后: ${fileName}`, 'info');
        }

        return result;
    }

    // 处理文件名
    processFileName(originalName, settings) {
        let fileName = originalName;

        // 确保文件名有扩展名
        if (!fileName.includes('.')) {
            // 如果文件名没有扩展名，尝试从原始路径获取
            if (this.logger) this.logger(`FileHandler: 警告 - 文件名缺少扩展名: ${fileName}`, 'warning');
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
        if (this.logger) {
            this.logger(`FileHandler: 开始导入到AE，文件数量: ${processedFiles.length}`, 'info');
        }

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
                        if (this.logger) this.logger(`FileHandler: 导入成功，导入了 ${parsedResult.importedCount} 个文件`, 'success');
                        resolve(parsedResult);
                    } else {
                        if (this.logger) this.logger(`FileHandler: 导入失败: ${parsedResult.error}`, 'error');
                        reject(new Error(parsedResult.error || '导入失败'));
                    }
                } catch (error) {
                    if (this.logger) this.logger(`FileHandler: 解析结果失败: ${result}`, 'error');
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
                        if (this.logger) this.logger('FileHandler: 文件复制成功', 'info');
                        resolve();
                    } else {
                        if (this.logger) this.logger(`FileHandler: 文件复制失败: ${parsedResult.error}`, 'error');
                        reject(new Error(parsedResult.error || '复制文件失败'));
                    }
                } catch (error) {
                    if (this.logger) this.logger(`FileHandler: 解析复制结果失败: ${result}`, 'error');
                    reject(new Error(`复制文件失败: ${result}`));
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
