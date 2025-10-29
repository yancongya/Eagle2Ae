# 拖拽导入增强功能

## 概述

拖拽导入增强功能（Enhanced Drag and Drop）是 Eagle2Ae AE 扩展 v2.4.0 引入的重要功能模块，它显著增强了传统的拖拽导入体验，新增了文件夹拖拽支持、序列帧自动检测、项目内文件检测等多项功能。这一功能模块使用户能够更高效、更智能地将素材从Eagle或其他来源导入到After Effects中。

## 核心特性

### 文件夹拖拽支持
- 支持直接拖拽整个文件夹到扩展面板
- 保持文件夹结构，便于组织素材
- 提供实时状态反馈和进度显示

### 序列帧自动检测
- 自动识别图片序列（如 frame001.png, frame002.png, ...）
- 将序列帧作为单个序列导入到AE中
- 支持多种命名模式和数字格式

### 项目内文件检测
- 检测拖拽的文件是否已在当前AE项目中
- 防止重复导入，提高工作效率
- 提供清晰的警告提示和选择选项

### 增强的视觉反馈
- 拖拽过程中的实时状态提示
- 智能文件类型识别和图标显示
- 详细的文件信息预览

## 技术实现

### 核心类结构

```javascript
/**
 * 拖拽导入增强功能
 * 负责处理文件夹拖拽、序列帧检测、项目内文件检测等增强功能
 */
class EnhancedDragAndDrop {
    /**
     * 构造函数
     * @param {Object} aeExtension - AE扩展实例
     */
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.csInterface = aeExtension.csInterface;
        this.settingsManager = aeExtension.settingsManager;
        this.logManager = aeExtension.logManager;
        this.projectStatusChecker = aeExtension.projectStatusChecker;
        
        // 初始化状态
        this.isDragging = false;
        this.draggedFiles = [];
        this.dragPreviewState = {
            hasProjectFiles: false,
            projectFiles: [],
            externalFiles: [],
            totalFiles: 0,
            sequenceCount: 0
        };
        
        // 绑定方法上下文
        this.setupDragAndDrop = this.setupDragAndDrop.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDragEnter = this.handleDragEnter.bind(this);
        this.handleDragLeave = this.handleDragLeave.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleFileDrop = this.handleFileDrop.bind(this);
        this.showDropMessage = this.showDropMessage.bind(this);
        this.log = this.log.bind(this);
        
        this.log('📁 拖拽导入增强功能已初始化', 'debug');
    }
}
```

### 拖拽监听实现

```javascript
/**
 * 设置拖拽监听
 */
setupDragAndDrop() {
    try {
        // 防止默认拖拽行为并进行预检查
        document.addEventListener('dragover', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            // 添加基础视觉反馈
            document.body.classList.add('drag-over');

            // 进行项目内文件预检查
            await this.handleDragPreview(e);
        });

        document.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('dragleave', (e) => {
            // 只有当拖拽完全离开窗口时才移除样式
            if (e.clientX === 0 && e.clientY === 0) {
                document.body.classList.remove('drag-over');
                // 重置拖拽提示状态
                this.resetDragPreviewState();
            }
        });

        // 处理文件拖拽
        document.addEventListener('drop', this.handleFileDrop.bind(this));

        this.log('📁 拖拽事件监听器已设置', 'debug');
    } catch (error) {
        this.log(`设置拖拽监听失败: ${error.message}`, 'error');
    }
}
```

### 拖拽预览实现

```javascript
/**
 * 拖拽预检查处理
 * @param {DragEvent} event - 拖拽事件
 */
async handleDragPreview(event) {
    try {
        // 防抖处理，避免频繁检查
        if (this.dragPreviewTimeout) {
            clearTimeout(this.dragPreviewTimeout);
        }

        this.dragPreviewTimeout = setTimeout(async () => {
            await this.performDragPreviewCheck(event);
        }, 200); // 200ms 防抖延迟

    } catch (error) {
        this.log(`拖拽预检查失败: ${error.message}`, 'error');
    }
}

/**
 * 执行拖拽预检查
 * @param {DragEvent} event - 拖拽事件
 */
async performDragPreviewCheck(event) {
    try {
        this.log('🔍 开始拖拽预检查...', 'debug');

        // 尝试获取拖拽的文件信息
        let files = Array.from(event.dataTransfer.files);
        this.log(`📁 从dataTransfer.files获取到 ${files.length} 个文件`, 'debug');

        // 检查文件路径信息
        if (files.length > 0) {
            files.forEach((file, index) => {
                this.log(`📄 文件 ${index + 1}: ${file.name}, 路径: ${file.path || '无路径信息'}`, 'debug');
            });
        }

        // 如果files为空，尝试从items获取文件信息
        if (files.length === 0 && event.dataTransfer.items) {
            const items = Array.from(event.dataTransfer.items);
            const fileItems = items.filter(item => item.kind === 'file');

            if (fileItems.length > 0) {
                // 显示检测中的提示
                this.updateDragHint(`🔍 正在检测 ${fileItems.length} 个文件...`, 'default');

                // 尝试获取文件对象（这在某些浏览器中可能不可用）
                try {
                    files = fileItems.map(item => item.getAsFile()).filter(file => file !== null);
                } catch (e) {
                    // 如果无法获取文件对象，显示通用提示
                    this.updateDragHint(`📁 准备检测拖拽的文件`, 'default');
                    return;
                }
            }
        }

        if (files.length === 0) {
            // 如果仍然无法获取文件信息，显示默认提示
            this.updateDragHint('拖拽文件到此处');
            return;
        }

        // 检查是否为项目内文件
        const projectFileCheck = await this.isProjectInternalFile(files);

        if (projectFileCheck.hasProjectFiles) {
            // 项目内文件，显示警告提示
            const projectFileCount = projectFileCheck.projectFiles.length;
            const externalFileCount = projectFileCheck.externalFiles.length;

            let hintText = `⚠️ 检测到 ${projectFileCount} 个项目内文件`;
            if (externalFileCount > 0) {
                hintText += `，${externalFileCount} 个外部文件`;
            }
            hintText += '\n项目内文件无法导入';

            this.updateDragHint(hintText, 'warning');
            document.body.classList.add('drag-project-files');
        } else {
            // 外部文件，显示正常提示
            const fileCount = files.length;
            this.updateDragHint(`✅ 准备导入 ${fileCount} 个文件`, 'success');
            document.body.classList.remove('drag-project-files');
            document.body.classList.add('drag-success');
        }

    } catch (error) {
        this.log(`拖拽预检查执行失败: ${error.message}`, 'error');
        this.updateDragHint('拖拽文件到此处');
    }
}
```

### 拖拽处理实现

```javascript
/**
 * 处理文件拖拽
 * @param {DragEvent} event - 拖拽事件
 */
async handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    // 移除视觉反馈
    document.body.classList.remove('drag-over');

    try {
        const files = Array.from(event.dataTransfer.files);
        const items = Array.from(event.dataTransfer.items);

        if (files.length === 0 && items.length === 0) {
            this.log('❌ 拖拽中没有检测到文件', 'warning');
            this.showDropMessage('未检测到文件', 'warning');
            return;
        }

        this.log(`📁 检测到拖拽内容: ${files.length} 个文件, ${items.length} 个项目`, 'info');

        // 检查是否包含文件夹
        const hasDirectories = items.some(item => item.webkitGetAsEntry && item.webkitGetAsEntry()?.isDirectory);

        if (hasDirectories) {
            // 处理文件夹拖拽（可能包含序列帧）
            await this.handleDirectoryDrop(items, files);
        } else {
            // 处理普通文件拖拽
            await this.handleFilesDrop(files, event.dataTransfer);
        }
    } catch (error) {
        this.log(`❌ 处理拖拽失败: ${error.message}`, 'error');
        this.showDropMessage('拖拽处理失败', 'error');
    }
}

/**
 * 处理文件夹拖拽
 * @param {Array} items - DataTransferItem数组
 * @param {Array} files - File数组
 */
async handleDirectoryDrop(items, files) {
    this.log('📁 检测到文件夹拖拽，开始处理...', 'info');

    const allFiles = [];

    // 递归读取文件夹内容
    for (const item of items) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
            const entryFiles = await this.readDirectoryEntry(entry);
            allFiles.push(...entryFiles);
        }
    }

    // 添加直接拖拽的文件
    allFiles.push(...files);

    if (allFiles.length === 0) {
        this.showDropMessage('❌ 文件夹中没有找到可导入的文件', 'warning');
        return;
    }

    this.log(`📁 文件夹中找到 ${allFiles.length} 个文件`, 'info');

    // 首先检查是否包含项目文件
    const projectFileCheck = await this.isProjectInternalFile(allFiles);

    if (projectFileCheck.hasProjectFiles) {
        // 显示项目内文件警告
        this.showProjectInternalFileWarning(projectFileCheck);
        return;
    }

    // 分析文件类型和序列帧
    const analysis = this.analyzeDroppedFiles(allFiles);

    // 显示导入选项对话框（跳过项目文件检查，因为上面已经检查过了）
    await this.showFileImportDialog(allFiles, analysis, true);
}

/**
 * 递归读取文件夹内容
 * @param {FileSystemEntry} entry - 文件系统条目
 * @returns {Promise<Array>} 文件数组
 */
async readDirectoryEntry(entry) {
    const files = [];

    if (entry.isFile) {
        return new Promise((resolve) => {
            entry.file((file) => {
                // 添加路径信息
                file.fullPath = entry.fullPath;
                file.relativePath = entry.fullPath;
                resolve([file]);
            }, () => resolve([]));
        });
    } else if (entry.isDirectory) {
        const reader = entry.createReader();

        // 修复：循环读取所有文件，因为readEntries可能不会一次性返回所有文件
        const allEntries = [];
        let entries;
        do {
            entries = await new Promise((resolve) => {
                reader.readEntries(resolve, () => resolve([]));
            });
            allEntries.push(...entries);
            this.log(`📁 读取目录 ${entry.fullPath}: 本次获取 ${entries.length} 个条目，累计 ${allEntries.length} 个`, 'debug');
        } while (entries.length > 0);

        this.log(`📁 目录 ${entry.fullPath} 总共包含 ${allEntries.length} 个条目`, 'debug');

        for (const childEntry of allEntries) {
            const childFiles = await this.readDirectoryEntry(childEntry);
            files.push(...childFiles);
        }
    }

    return files;
}
```

### 文件分析实现

```javascript
/**
 * 分析拖拽的文件
 * @param {Array} files - 文件数组
 * @returns {Object} 分析结果
 */
analyzeDroppedFiles(files) {
    this.log(`🔍 开始分析拖拽文件，总数: ${files.length}`, 'info');

    const analysis = {
        total: files.length,
        categories: {
            image: [],
            video: [],
            audio: [],
            design: [],
            project: [],
            unknown: []
        },
        sequences: [],
        folders: new Set()
    };

    // 按文件夹分组
    const folderGroups = {};
    const folderFullPaths = {}; // 存储文件夹的完整路径映射

    files.forEach(file => {
        const category = this.getFileCategory(file);
        analysis.categories[category].push(file);

        // 提取文件夹路径
        const path = file.fullPath || file.relativePath || file.webkitRelativePath || '';
        const folderPath = path.substring(0, path.lastIndexOf('/'));

        if (folderPath) {
            analysis.folders.add(folderPath);
            if (!folderGroups[folderPath]) {
                folderGroups[folderPath] = [];
            }
            folderGroups[folderPath].push(file);

            // 尝试获取完整的文件夹路径
            if (file.originalFile && file.originalFile.path) {
                // 从完整文件路径中提取文件夹路径
                const fullFilePath = file.originalFile.path;
                const fullFolderPath = fullFilePath.substring(0, fullFilePath.lastIndexOf('\\'));
                if (fullFolderPath && !folderFullPaths[folderPath]) {
                    folderFullPaths[folderPath] = fullFolderPath;
                }
            } else if (file.path && file.path.includes('\\')) {
                // 直接从文件路径提取
                const fullFolderPath = file.path.substring(0, file.path.lastIndexOf('\\'));
                if (fullFolderPath && !folderFullPaths[folderPath]) {
                    folderFullPaths[folderPath] = fullFolderPath;
                }
            }
        }
    });

    this.log(`📊 文件分类统计: 图像${analysis.categories.image.length}, 视频${analysis.categories.video.length}, 音频${analysis.categories.audio.length}, 设计${analysis.categories.design.length}, 项目${analysis.categories.project.length}, 未知${analysis.categories.unknown.length}`, 'info');
    this.log(`📁 检测到 ${analysis.folders.size} 个文件夹`, 'info');

    // 检测序列帧
    let totalSequenceFiles = 0;
    for (const [folderPath, folderFiles] of Object.entries(folderGroups)) {
        this.log(`🔍 检查文件夹: ${folderPath}, 文件数: ${folderFiles.length}`, 'debug');
        const sequence = this.detectImageSequence(folderFiles);
        if (sequence) {
            // 使用完整路径或回退到相对路径
            const fullFolderPath = folderFullPaths[folderPath] || folderPath;

            analysis.sequences.push({
                folder: fullFolderPath, // 使用完整路径
                files: sequence.files,
                pattern: sequence.pattern,
                start: sequence.start,
                end: sequence.end,
                step: sequence.step,
                totalFiles: sequence.totalFiles
            });
            totalSequenceFiles += sequence.totalFiles;
            this.log(`✅ 文件夹 ${folderPath} 识别为序列帧: ${sequence.pattern}`, 'info');
        } else {
            this.log(`❌ 文件夹 ${folderPath} 未识别为序列帧`, 'debug');
        }
    }

    this.log(`🎉 序列帧检测完成: 发现 ${analysis.sequences.length} 个序列帧文件夹，共 ${totalSequenceFiles} 个序列帧文件`, 'info');

    return analysis;
}

/**
 * 检测图片序列
 * @param {Array} files - 文件数组
 * @returns {Object|null} 序列帧信息或null
 */
detectImageSequence(files) {
    // 只检测图片文件
    const imageFiles = files.filter(file => this.getFileCategory(file) === 'image');

    this.log(`🔍 检测序列帧: 图像文件数 ${imageFiles.length}`, 'debug');

    if (imageFiles.length < 2) return null; // 至少需要2个文件才算序列帧

    // 按文件名排序
    imageFiles.sort((a, b) => a.name.localeCompare(b.name));

    // 尝试找到数字模式
    const patterns = [];

    for (const file of imageFiles) {
        const name = file.name;
        const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));

        // 查找数字模式 - 支持多种数字格式，优先匹配最后一个数字序列
        const numberMatches = nameWithoutExt.match(/(.*?)(\d+)([^\d]*)$/);
        if (numberMatches) {
            const [, prefix, number, suffix] = numberMatches;
            patterns.push({
                prefix: prefix || '',
                number: parseInt(number),
                suffix: suffix || '',
                numberLength: number.length,
                originalNumber: number,
                file
            });
            this.log(`🔍 文件 ${file.name} 匹配模式: 前缀="${prefix}", 数字=${number}, 后缀="${suffix}"`, 'debug');
        } else {
            this.log(`🔍 文件 ${file.name} 未匹配数字模式`, 'debug');
        }
    }

    this.log(`🔍 找到 ${patterns.length} 个符合数字模式的文件`, 'debug');

    if (patterns.length < 2) {
        this.log('🔍 数字模式文件数量不足，不构成序列', 'debug');
        return null;
    }

    // 找到最一致的模式
    const patternGroups = {};
    patterns.forEach(p => {
        const key = `${p.prefix}_${p.suffix}_${p.numberLength}`;
        if (!patternGroups[key]) {
            patternGroups[key] = [];
        }
        patternGroups[key].push(p);
    });

    this.log(`🔍 找到 ${Object.keys(patternGroups).length} 个不同的模式组`, 'debug');

    // 找到最大的组
    let bestGroup = null;
    let maxSize = 0;

    for (const [key, group] of Object.entries(patternGroups)) {
        this.log(`🔍 模式组 ${key}: ${group.length} 个文件`, 'debug');
        if (group.length > maxSize) {
            maxSize = group.length;
            bestGroup = group;
        }
    }

    // 对于大量文件，降低要求；对于少量文件，保持较高要求
    const minGroupSize = imageFiles.length >= 10 ? Math.max(2, Math.floor(imageFiles.length * 0.8)) : 2;
    if (!bestGroup || bestGroup.length < minGroupSize) {
        this.log(`🔍 没有找到足够大的模式组，需要至少${minGroupSize}个文件，实际最大组${bestGroup ? bestGroup.length : 0}个`, 'debug');
        return null;
    }

    this.log(`🔍 选择最佳模式组，包含 ${bestGroup.length} 个文件`, 'debug');

    // 排序并检查连续性
    bestGroup.sort((a, b) => a.number - b.number);

    const numbers = bestGroup.map(p => p.number);
    const start = numbers[0];
    const end = numbers[numbers.length - 1];

    // 检测步长
    let step = 1;
    if (numbers.length > 1) {
        const diffs = [];
        for (let i = 1; i < numbers.length; i++) {
            diffs.push(numbers[i] - numbers[i - 1]);
        }

        // 找到最常见的差值作为步长
        const diffCounts = {};
        diffs.forEach(diff => {
            diffCounts[diff] = (diffCounts[diff] || 0) + 1;
        });

        let maxCount = 0;
        for (const [diff, count] of Object.entries(diffCounts)) {
            if (count > maxCount) {
                maxCount = count;
                step = parseInt(diff);
            }
        }
    }

    // 构建模式字符串
    const firstPattern = bestGroup[0];
    const pattern = `${firstPattern.prefix}[${start}-${end}]${firstPattern.suffix}`;

    const result = {
        files: bestGroup.map(p => p.file),
        pattern,
        start,
        end,
        step,
        totalFiles: bestGroup.length,
        detectedRange: `${start}-${end}`,
        prefix: firstPattern.prefix,
        suffix: firstPattern.suffix,
        numberLength: firstPattern.numberLength
    };

    this.log(`🎉 检测到序列帧: ${pattern}, 范围: ${start}-${end}, 步长: ${step}, 文件数: ${bestGroup.length}`, 'info');

    return result;
}
```

### 项目内文件检测实现

```javascript
/**
 * 检查文件是否已在当前AE项目中导入
 * @param {Array} files - 文件数组
 * @returns {Promise<Object>} 检测结果
 */
async isProjectInternalFile(files) {
    try {
        this.log(`🔍 开始检查 ${files.length} 个文件的项目状态`, 'info');

        // 快速提取文件路径数组
        const filePaths = [];
        for (const file of files) {
            const filePath = file.path || file.webkitRelativePath || file.name;
            if (filePath) {
                filePaths.push(filePath);
            }
        }

        if (filePaths.length === 0) {
            this.log('❌ 无法获取任何文件路径，允许导入', 'warning');
            return {
                hasProjectFiles: false,
                projectFiles: [],
                externalFiles: files
            };
        }

        // 首先快速检查是否有AE项目文件（这个检查很快）
        const aeProjectCheck = await this.executeExtendScript('checkAEProjectFiles', filePaths);

        if (aeProjectCheck && aeProjectCheck.success && aeProjectCheck.aeProjectFiles.length > 0) {
            this.log(`⚠️ 检测到 ${aeProjectCheck.aeProjectFiles.length} 个AE项目文件，禁止导入`, 'warning');

            // 使用哈希表快速匹配AE项目文件
            const aeProjectPathsSet = new Set();
            aeProjectCheck.aeProjectFiles.forEach(path => {
                aeProjectPathsSet.add(path.toLowerCase().replace(/\\/g, '/'));
            });

            const projectFiles = [];
            const externalFiles = [];

            for (const file of files) {
                const currentPath = file.path || file.webkitRelativePath || file.name;
                const normalizedCurrent = currentPath.toLowerCase().replace(/\\/g, '/');

                // 检查是否为AE项目文件
                const isAEProject = aeProjectPathsSet.has(normalizedCurrent) ||
                    Array.from(aeProjectPathsSet).some(projectPath =>
                        normalizedCurrent.includes(projectPath) || projectPath.includes(normalizedCurrent)
                    );

                if (isAEProject) {
                    projectFiles.push({
                        name: file.name,
                        path: currentPath,
                        type: 'ae_project'
                    });
                } else {
                    externalFiles.push(file);
                }
            }

            return {
                hasProjectFiles: true,
                projectFiles: projectFiles,
                externalFiles: externalFiles
            };
        }

        // 如果没有AE项目文件，检查是否已在项目中导入
        this.log('📡 检查文件是否已在项目中...', 'info');

        // 对于大量文件，进行分批处理以提高性能
        let checkResult;
        if (filePaths.length > 100) {
            this.log(`📦 文件数量较多(${filePaths.length})，使用分批处理`, 'info');
            const batchSize = 50;
            const allImportedFiles = [];
            const allExternalFiles = [];

            for (let i = 0; i < filePaths.length; i += batchSize) {
                const batch = filePaths.slice(i, i + batchSize);
                const batchResult = await this.executeExtendScript('checkProjectImportedFiles', batch);

                if (batchResult && batchResult.success) {
                    allImportedFiles.push(...(batchResult.importedFiles || []));
                    allExternalFiles.push(...(batchResult.externalFiles || []));
                }
            }

            checkResult = {
                success: true,
                importedFiles: allImportedFiles,
                externalFiles: allExternalFiles
            };
        } else {
            checkResult = await this.executeExtendScript('checkProjectImportedFiles', filePaths);
        }

        if (!checkResult || !checkResult.success) {
            const errorMsg = checkResult?.error || '未知错误';
            this.log(`💥 项目文件检查失败: ${errorMsg}`, 'error');
            // 检测失败时允许导入，避免阻止正常功能
            return {
                hasProjectFiles: false,
                projectFiles: [],
                externalFiles: files
            };
        }

        const importedFiles = checkResult.importedFiles || [];

        if (importedFiles.length > 0) {
            this.log(`⚠️ 检测到 ${importedFiles.length} 个已在项目中的文件`, 'warning');

            // 使用哈希表快速匹配已导入文件
            const importedPathsSet = new Set();
            importedFiles.forEach(path => {
                importedPathsSet.add(path.toLowerCase().replace(/\\/g, '/'));
            });

            const projectFiles = [];
            const externalFiles = [];

            for (const file of files) {
                const currentPath = file.path || file.webkitRelativePath || file.name;
                const normalizedCurrent = currentPath.toLowerCase().replace(/\\/g, '/');

                if (importedPathsSet.has(normalizedCurrent)) {
                    projectFiles.push({
                        name: file.name,
                        path: currentPath
                    });
                } else {
                    externalFiles.push(file);
                }
            }

            return {
                hasProjectFiles: true,
                projectFiles: projectFiles,
                externalFiles: externalFiles
            };
        }

        this.log('✅ 所有文件都不在项目中，允许导入', 'info');
        return {
            hasProjectFiles: false,
            projectFiles: [],
            externalFiles: files
        };

    } catch (error) {
        this.log(`❌ 项目内文件检测失败: ${error.message}`, 'error');
        // 检测失败时允许导入，避免阻止正常功能
        return {
            hasProjectFiles: false,
            projectFiles: [],
            externalFiles: files
        };
    }
}
```

### 导入确认对话框实现

```javascript
/**
 * 显示文件导入对话框
 * @param {Array} files - 文件数组
 * @param {Object} analysis - 分析结果
 * @param {boolean} skipProjectCheck - 是否跳过项目文件检查
 */
async showFileImportDialog(files, analysis, skipProjectCheck = false) {
    // 移除现有对话框
    const existingDialog = document.querySelector('.eagle-confirm-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    // 检查是否包含项目文件或AE项目文件（仅在未跳过检查时执行）
    if (!skipProjectCheck) {
        try {
            this.log('🔍 检查文件类型和项目状态...', 'info');
            const projectFileCheck = await this.isProjectInternalFile(files);

            if (projectFileCheck.hasProjectFiles) {
                this.log('⚠️ 检测到项目文件，显示警告并阻止导入', 'warning');
                this.showProjectInternalFileWarning(projectFileCheck);
                return; // 阻止继续显示导入对话框
            }

            this.log('✅ 文件检查通过，继续显示导入对话框', 'info');
        } catch (error) {
            this.log(`⚠️ 项目文件检查失败: ${error.message}，继续显示导入对话框`, 'warning');
            // 检查失败时继续显示对话框，避免阻止正常功能
        }
    }

    // 检测是否包含序列帧文件夹
    const hasSequences = analysis.sequences && analysis.sequences.length > 0;
    const folderCount = analysis.folders ? analysis.folders.size : 0;

    // 生成检测统计信息
    let detectionInfo = '';
    if (hasSequences) {
        // 计算实际序列帧文件数量
        const totalSequenceFiles = analysis.sequences.reduce((sum, seq) => sum + seq.files.length, 0);
        detectionInfo = `检测到 ${analysis.sequences.length} 个序列帧文件夹，共 ${totalSequenceFiles} 个文件`;
    } else if (folderCount > 0) {
        detectionInfo = `检测到 ${folderCount} 个文件夹，共 ${files.length} 个文件`;
    } else {
        detectionInfo = `检测到 ${files.length} 个文件`;
    }

    // 确定要显示的文件列表
    let displayFiles = files;
    let totalDisplayFiles = files.length;

    if (hasSequences) {
        // 对于序列帧，显示序列帧中的文件
        displayFiles = [];
        analysis.sequences.forEach(seq => {
            displayFiles = displayFiles.concat(seq.files.slice(0, Math.max(1, Math.floor(5 / analysis.sequences.length))));
        });
        totalDisplayFiles = analysis.sequences.reduce((sum, seq) => sum + seq.files.length, 0);
    }

    // 生成文件信息HTML
    let fileInfoHtml = '';

    if (hasSequences) {
        // 序列帧显示为单行
        analysis.sequences.forEach(seq => {
            // 计算序列帧总大小
            const totalSize = seq.files.reduce((sum, file) => sum + (file.size || 0), 0);
            const sizeText = this.formatFileSize(totalSize);

            fileInfoHtml += `
                <div class="file-item-simple">
                    <span class="file-icon">🎞️</span>
                    <span class="file-name">${seq.pattern}</span>
                    <span class="file-size">${sizeText}</span>
                    <span class="file-type">序列帧</span>
                </div>
            `;
        });
    } else {
        // 普通文件显示
        fileInfoHtml = displayFiles.slice(0, 5).map(file => {
            const icon = this.getFileIcon(file);
            const size = this.formatFileSize(file.size);
            const type = this.getFileType(file);
            return `
                <div class="file-item-simple">
                    <span class="file-icon">${icon}</span>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${size}</span>
                    <span class="file-type">${type}</span>
                </div>
            `;
        }).join('');
    }

    // 如果文件数量超过5个，显示省略提示（仅对非序列帧）
    const moreFilesHtml = (!hasSequences && totalDisplayFiles > 5) ?
        `<div class="file-item-simple"><span class="file-name">... 还有 ${totalDisplayFiles - Math.min(5, displayFiles.length)} 个文件</span></div>` : '';

    // 获取当前设置并确定导入模式和行为
    const settings = this.settingsManager.getSettings();

    // 导入模式映射
    const importModeText = {
        'direct': '直接导入',
        'project_adjacent': '项目旁复制',
        'custom_folder': '自定义文件夹'
    }[settings.mode] || settings.mode;

    // 根据是否自动添加到合成来确定导入行为
    let importBehavior;
    if (settings.addToComposition) {
        // 如果自动添加到合成，显示时间轴放置位置
        const timelinePlacement = {
            'current_time': '当前时间',
            'timeline_start': '时间轴开始'
        }[settings.timelineOptions?.placement] || '当前时间';
        importBehavior = timelinePlacement;
    } else {
        // 如果不自动添加到合成，显示"不导入合成"
        importBehavior = (window.i18n?.getText('common.doNotImportToComp') || '不导入合成');
    }

    let importMode = importModeText;

    // 检查是否是序列帧或文件夹，并根据情况调整导入行为显示
    // 只有当用户没有明确设置导入行为时，才显示特殊的序列帧/文件夹导入提示
    if (hasSequences && settings.mode === 'direct') { // 假设直接导入模式下，序列帧导入是特殊行为
        importBehavior = '序列帧导入';
    } else if (folderCount > 0 && settings.mode === 'direct') { // 假设直接导入模式下，文件夹导入是特殊行为
        importBehavior = '文件夹导入';
    }

    // 创建对话框
    const dialog = document.createElement('div');
    dialog.className = 'eagle-confirm-dialog';

    dialog.innerHTML = `
        <div class="eagle-confirm-content">
            <div class="eagle-confirm-header">
                <h3>拖拽导入确认</h3>
            </div>
            <div class="eagle-confirm-body">
                <p>${detectionInfo}</p>
                <div class="file-list">
                    ${fileInfoHtml}
                    ${moreFilesHtml}
                </div>
                <div class="import-settings-dark">
                    <div class="setting-item"><span class="setting-label">导入模式:</span><span class="setting-value">${importMode}</span></div>
                    <div class="setting-item"><span class="setting-label">导入行为:</span><span class="setting-value">${importBehavior}</span></div>
                </div>
            </div>
            <div class="eagle-confirm-actions-flex">
                <button id="drag-confirm-yes" class="btn-outline-primary">确认导入</button>
                <button id="drag-confirm-no" class="btn-outline-secondary">取消</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // 绑定事件
    document.getElementById('drag-confirm-yes').onclick = async () => {
        dialog.remove();
        try {
            // 根据检测结果选择导入方式
            if (hasSequences) {
                await this.handleImportAction(files, analysis, 'sequences');
            } else if (folderCount > 0) {
                await this.handleImportAction(files, analysis, 'folders');
            } else {
                await this.handleImportAction(files, analysis, 'all');
            }
        } catch (error) {
            this.log(`❌ 导入操作失败: ${error.message}`, 'error');
            // 显示错误弹窗
            this.showErrorDialog('导入失败', error.message);
        }
    };

    document.getElementById('drag-confirm-no').onclick = () => {
        dialog.remove();
    };

    // 样式已统一使用剪贴板导入确认面板的样式
}

/**
 * 处理导入操作
 * @param {Array} files - 文件数组
 * @param {Object} analysis - 分析结果
 * @param {string} action - 操作类型
 */
async handleImportAction(files, analysis, action) {
    let filesToImport = [];

    switch (action) {
        case 'all':
            filesToImport = files;
            break;
        case 'sequences':
            // 导入所有序列帧（以序列为单位）
            this.log(`📁 检测到 ${analysis.sequences.length} 个序列帧文件夹`, 'info');
            await this.handleSequenceImport(analysis.sequences);
            return;
        case 'folders':
            // 导入文件夹（以文件夹为单位）
            this.log(`📁 检测到 ${analysis.folders.size} 个文件夹`, 'info');
            await this.handleFolderImport(analysis, files);
            return;
        case 'images':
            filesToImport = analysis.categories.image;
            break;
        case 'videos':
            filesToImport = analysis.categories.video;
            break;
        default:
            filesToImport = files;
    }

    if (filesToImport.length === 0) {
        this.showDropMessage('❌ 没有文件需要导入', 'warning');
        return;
    }

    this.log(`📁 开始导入 ${filesToImport.length} 个文件 (${action} 模式)`, 'info');

    // 普通文件导入
    await this.handleNonEagleDragImport(filesToImport);
}

/**
 * 处理序列帧导入
 * @param {Array} sequences - 序列帧数组
 */
async handleSequenceImport(sequences) {
    let successCount = 0;
    let totalSequences = sequences.length;

    for (const sequence of sequences) {
        try {
            this.log(`📁 导入序列帧文件夹: ${sequence.folder} (${sequence.pattern})`, 'info');
            this.log(`📊 序列帧范围: ${sequence.start}-${sequence.end}, 步长: ${sequence.step}, 文件数: ${sequence.files.length}`, 'info');

            // 构造序列帧导入消息
            const message = {
                type: 'import_sequence',
                sequence: {
                    files: sequence.files.map(file => ({
                        name: file.name,
                        path: file.fullPath || file.relativePath || file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified
                    })),
                    pattern: sequence.pattern,
                    start: sequence.start,
                    end: sequence.end,
                    step: sequence.step,
                    folder: sequence.folder,
                    totalFiles: sequence.files.length
                },
                source: 'sequence_drag_drop',
                timestamp: Date.now(),
                isDragImport: true
            };

            // 调用序列帧导入处理
            const result = await this.handleImportFiles(message);
            if (result && result.success) {
                successCount++;
                this.log(`✅ 序列帧文件夹导入成功: ${sequence.folder}`, 'success');
            } else {
                const errorMessage = result ? result.error : '序列帧导入失败';
                this.log(`❌ 序列帧文件夹导入失败: ${sequence.folder}`, 'error');
                // 如果只有一个序列帧且失败，抛出异常以触发弹窗
                if (sequences.length === 1) {
                    throw new Error(errorMessage);
                }
            }

        } catch (error) {
            this.log(`❌ 序列帧导入失败: ${sequence.folder} - ${error.message}`, 'error');
            // 如果只有一个序列帧且失败，重新抛出异常以触发弹窗
            if (sequences.length === 1) {
                throw error;
            }
        }
    }

    if (successCount === totalSequences) {
        this.showDropMessage(`✅ 所有序列帧文件夹导入完成 (${successCount}/${totalSequences})`, 'success');
    } else {
        this.showDropMessage(`⚠️ 序列帧导入完成 (${successCount}/${totalSequences})`, 'warning');
    }
}

/**
 * 处理文件夹导入
 * @param {Object} analysis - 分析结果
 * @param {Array} allFiles - 所有文件
 */
async handleFolderImport(analysis, allFiles) {
    const folderGroups = {};

    // 按文件夹分组文件
    allFiles.forEach(file => {
        const path = file.fullPath || file.relativePath || file.webkitRelativePath || '';
        const folderPath = path.substring(0, path.lastIndexOf('/'));
        if (folderPath) {
            if (!folderGroups[folderPath]) {
                folderGroups[folderPath] = [];
            }
            folderGroups[folderPath].push(file);
        }
    });

    let successCount = 0;
    let totalFolders = Object.keys(folderGroups).length;

    // 逐个文件夹导入
    for (const [folderPath, folderFiles] of Object.entries(folderGroups)) {
        try {
            this.log(`📁 导入文件夹: ${folderPath} (${folderFiles.length} 个文件)`, 'info');

            // 构造文件夹导入消息
            const message = {
                type: 'import_folder',
                folder: {
                    path: folderPath,
                    files: folderFiles.map(file => ({
                        name: file.name,
                        path: file.fullPath || file.relativePath || file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified
                    })),
                    totalFiles: folderFiles.length
                },
                source: 'folder_drag_drop',
                timestamp: Date.now(),
                isDragImport: true
            };

            // 调用文件夹导入处理
            const result = await this.handleImportFiles(message);
            if (result && result.success) {
                successCount++;
                this.log(`✅ 文件夹导入成功: ${folderPath}`, 'success');
            } else {
                const errorMessage = result ? result.error : '文件夹导入失败';
                this.log(`❌ 文件夹导入失败: ${folderPath}`, 'error');
                // 如果只有一个文件夹且失败，抛出异常以触发弹窗
                if (totalFolders === 1) {
                    throw new Error(errorMessage);
                }
            }

        } catch (error) {
            this.log(`❌ 文件夹导入失败: ${folderPath} - ${error.message}`, 'error');
        }
    }

    if (successCount === totalFolders) {
        this.showDropMessage(`✅ 所有文件夹导入完成 (${successCount}/${totalFolders})`, 'success');
    } else {
        this.showDropMessage(`⚠️ 文件夹导入完成 (${successCount}/${totalFolders})`, 'warning');
    }
}

/**
 * 处理Eagle拖拽导入
 * @param {Array} files - 文件数组
 */
async handleEagleDragImport(files) {
    try {
        // 优先检查项目状态 - 确保AE项目已打开
        const projectStatusValid = await this.projectStatusChecker.validateProjectStatus({
            requireProject: true,
            requireActiveComposition: false, // 拖拽时不强制要求合成，后续会检查
            showWarning: true
        });

        if (!projectStatusValid) {
            this.log('❌ 拖拽导入被阻止：项目状态不满足要求', 'warning');
            return;
        }

        // 转换文件格式以匹配现有的导入接口
        const fileData = files.map(file => {
            // 尝试获取完整路径信息
            let fullPath = file.path || file.webkitRelativePath || file.name;

            // 如果是拖拽导入且有完整路径信息，尝试提取目录路径
            if (file.path && file.path.includes('\\')) {
                // Windows路径格式，保持完整路径
                fullPath = file.path;
            } else if (file.webkitRelativePath) {
                // 相对路径，需要结合其他信息构建完整路径
                fullPath = file.webkitRelativePath;
            }

            return {
                name: file.name,
                path: fullPath,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                isDragImport: true,
                // 添加原始文件对象引用，用于后续路径解析
                originalFile: file
            };
        });

        // 构造消息对象，模拟Eagle扩展发送的消息格式
        const message = {
            type: 'export',
            files: fileData,
            source: 'drag_drop',
            timestamp: Date.now(),
            isDragImport: true
        };

        // 调用现有的文件处理流程
        const result = await this.handleImportFiles(message);

        // 只有导入成功时才播放音效和显示提示
        if (result && result.success) {
            // 播放Eagle导入音效
            try {
                if (this.soundPlayer && typeof this.soundPlayer.playEagleSound === 'function') {
                    this.soundPlayer.playEagleSound();
                }
            } catch (soundError) {
                // 忽略音效播放错误，不影响主要功能
                console.warn('❌ 播放Eagle音效失败:', soundError);
            }

            // 显示简洁的成功提示
            this.showDropMessage(`✅ 导入成功`, 'success');
        }

    } catch (error) {
        this.log(`❌ Eagle拖拽导入失败: ${error.message}`, 'error');
        this.showDropMessage('❌ 导入失败', 'error');
    }
}

/**
 * 处理非Eagle文件拖拽导入
 * @param {Array} files - 文件数组
 */
async handleNonEagleDragImport(files) {
    try {
        // 转换文件格式以匹配现有的导入接口
        const fileData = files.map(file => ({
            name: file.name,
            path: file.path || file.webkitRelativePath || file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            isDragImport: true,
            isNonEagleFile: true // 标记为非Eagle文件
        }));

        // 构造消息对象，模拟文件导入消息格式
        const message = {
            type: 'import',
            files: fileData,
            source: 'file_drag_drop',
            timestamp: Date.now(),
            isDragImport: true
        };

        // 调用现有的文件处理流程
        const result = await this.handleImportFiles(message);

        // 只有导入成功时才显示提示
        if (result && result.success) {
            // 显示简洁的成功提示
            this.showDropMessage(`✅ 导入成功`, 'success');
        }

    } catch (error) {
        this.log(`❌ 文件拖拽导入失败: ${error.message}`, 'error');
        this.showDropMessage('❌ 导入失败', 'error');
        // 显示详细错误弹窗
        this.showErrorDialog('文件导入失败', error.message);
    }
}
```

## API参考

### 核心方法

#### setupDragAndDrop()
设置拖拽监听

```javascript
/**
 * 设置拖拽监听
 */
setupDragAndDrop()
```

#### handleDragPreview()
处理拖拽预览

```javascript
/**
 * 处理拖拽预览
 * @param {DragEvent} event - 拖拽事件
 */
async handleDragPreview(event)
```

#### performDragPreviewCheck()
执行拖拽预览检查

```javascript
/**
 * 执行拖拽预览检查
 * @param {DragEvent} event - 拖拽事件
 */
async performDragPreviewCheck(event)
```

#### updateDragHint()
更新拖拽提示文本

```javascript
/**
 * 更新拖拽提示文本
 * @param {string} text - 提示文本
 * @param {string} type - 提示类型
 */
updateDragHint(text, type = 'default')
```

#### resetDragPreviewState()
重置拖拽预览状态

```javascript
/**
 * 重置拖拽预览状态
 */
resetDragPreviewState()
```

#### handleFileDrop()
处理文件拖拽

```javascript
/**
 * 处理文件拖拽
 * @param {DragEvent} event - 拖拽事件
 */
async handleFileDrop(event)
```

#### handleDirectoryDrop()
处理文件夹拖拽

```javascript
/**
 * 处理文件夹拖拽
 * @param {Array} items - DataTransferItem数组
 * @param {Array} files - File数组
 */
async handleDirectoryDrop(items, files)
```

#### readDirectoryEntry()
递归读取文件夹内容

```javascript
/**
 * 递归读取文件夹内容
 * @param {FileSystemEntry} entry - 文件系统条目
 * @returns {Promise<Array>} 文件数组
 */
async readDirectoryEntry(entry)
```

#### analyzeDroppedFiles()
分析拖拽的文件

```javascript
/**
 * 分析拖拽的文件
 * @param {Array} files - 文件数组
 * @returns {Object} 分析结果
 */
analyzeDroppedFiles(files)
```

#### detectImageSequence()
检测图片序列

```javascript
/**
 * 检测图片序列
 * @param {Array} files - 文件数组
 * @returns {Object|null} 序列帧信息或null
 */
detectImageSequence(files)
```

#### isProjectInternalFile()
检查文件是否已在当前AE项目中导入

```javascript
/**
 * 检查文件是否已在当前AE项目中导入
 * @param {Array} files - 文件数组
 * @returns {Promise<Object>} 检测结果
 */
async isProjectInternalFile(files)
```

#### showFileImportDialog()
显示文件导入对话框

```javascript
/**
 * 显示文件导入对话框
 * @param {Array} files - 文件数组
 * @param {Object} analysis - 分析结果
 * @param {boolean} skipProjectCheck - 是否跳过项目文件检查
 */
async showFileImportDialog(files, analysis, skipProjectCheck = false)
```

#### handleImportAction()
处理导入操作

```javascript
/**
 * 处理导入操作
 * @param {Array} files - 文件数组
 * @param {Object} analysis - 分析结果
 * @param {string} action - 操作类型
 */
async handleImportAction(files, analysis, action)
```

#### handleSequenceImport()
处理序列帧导入

```javascript
/**
 * 处理序列帧导入
 * @param {Array} sequences - 序列帧数组
 */
async handleSequenceImport(sequences)
```

#### handleFolderImport()
处理文件夹导入

```javascript
/**
 * 处理文件夹导入
 * @param {Object} analysis - 分析结果
 * @param {Array} allFiles - 所有文件
 */
async handleFolderImport(analysis, allFiles)
```

#### handleEagleDragImport()
处理Eagle拖拽导入

```javascript
/**
 * 处理Eagle拖拽导入
 * @param {Array} files - 文件数组
 */
async handleEagleDragImport(files)
```

#### handleNonEagleDragImport()
处理非Eagle文件拖拽导入

```javascript
/**
 * 处理非Eagle文件拖拽导入
 * @param {Array} files - 文件数组
 */
async handleNonEagleDragImport(files)
```

### 辅助方法

#### getFileCategory()
获取文件分类

```javascript
/**
 * 获取文件分类
 * @param {File} file - 文件对象
 * @returns {string} 文件分类
 */
getFileCategory(file)
```

#### getFileIcon()
获取文件图标

```javascript
/**
 * 获取文件图标
 * @param {File} file - 文件对象
 * @returns {string} 文件图标
 */
getFileIcon(file)
```

#### getFileType()
获取文件类型

```javascript
/**
 * 获取文件类型
 * @param {File} file - 文件对象
 * @returns {string} 文件类型
 */
getFileType(file)
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

#### showDropMessage()
显示拖拽消息

```javascript
/**
 * 显示拖拽消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型
 */
showDropMessage(message, type = 'info')
```

#### showErrorDialog()
显示错误对话框

```javascript
/**
 * 显示错误对话框
 * @param {string} title - 错误标题
 * @param {string} message - 错误消息
 */
showErrorDialog(title, message)
```

## 使用示例

### 基本使用

```javascript
// 初始化拖拽导入增强功能
const enhancedDragDrop = new EnhancedDragAndDrop(aeExtension);

// 设置拖拽监听
enhancedDragDrop.setupDragAndDrop();

// 处理文件拖拽
document.addEventListener('drop', async (event) => {
    await enhancedDragDrop.handleFileDrop(event);
});
```

### 高级使用

```javascript
// 自定义拖拽预览
enhancedDragDrop.updateDragHint('拖拽文件到此处', 'default');

// 处理文件夹拖拽
const folderItems = [...]; // FileSystemItem 数组
const files = [...]; // File 数组
await enhancedDragDrop.handleDirectoryDrop(folderItems, files);

// 分析拖拽文件
const analysis = enhancedDragDrop.analyzeDroppedFiles(files);
console.log('文件分析结果:', analysis);

// 检测序列帧
const sequences = files.filter(file => enhancedDragDrop.getFileCategory(file) === 'image');
const sequenceInfo = enhancedDragDrop.detectImageSequence(sequences);
if (sequenceInfo) {
    console.log('检测到序列帧:', sequenceInfo.pattern);
}

// 检查项目内文件
const projectCheck = await enhancedDragDrop.isProjectInternalFile(files);
if (projectCheck.hasProjectFiles) {
    console.log('检测到项目内文件:', projectCheck.projectFiles);
}

// 显示导入确认对话框
await enhancedDragDrop.showFileImportDialog(files, analysis);
```

## 最佳实践

### 性能优化

1. **防抖处理**
   ```javascript
   // 使用防抖避免频繁的拖拽预检查
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
   
   const debouncedDragPreview = debounce(handleDragPreview, 200);
   ```

2. **批量处理**
   ```javascript
   // 对于大量文件，使用批量处理提高性能
   async function batchProcessFiles(filePaths, batchSize = 50) {
       const results = [];
       
       for (let i = 0; i < filePaths.length; i += batchSize) {
           const batch = filePaths.slice(i, i + batchSize);
           const batchResult = await processFileBatch(batch);
           results.push(...batchResult);
       }
       
       return results;
   }
   ```

3. **缓存机制**
   ```javascript
   // 缓存检测结果避免重复计算
   const fileCache = new Map();
   
   function getCachedFileCategory(file) {
       const cacheKey = `${file.name}_${file.size}_${file.lastModified}`;
       
       if (fileCache.has(cacheKey)) {
           return fileCache.get(cacheKey);
       }
       
       const category = getFileCategory(file);
       fileCache.set(cacheKey, category);
       
       // 限制缓存大小
       if (fileCache.size > 1000) {
           const firstKey = fileCache.keys().next().value;
           fileCache.delete(firstKey);
       }
       
       return category;
   }
   ```

### 用户体验优化

1. **视觉反馈**
   ```css
   /* 拖拽悬停时的整体效果 */
   body.drag-over {
       transition: all 0.3s ease;
   }
   
   /* 拖拽时的背景蒙版 */
   body.drag-over::before {
       content: '';
       position: fixed;
       top: 0;
       left: 0;
       right: 0;
       bottom: 0;
       background: rgba(0, 0, 0, 0.6);
       backdrop-filter: blur(4px);
       -webkit-backdrop-filter: blur(4px);
       z-index: 999;
       pointer-events: none;
       animation: fadeIn 0.3s ease;
   }
   
   /* 拖拽时的边框效果 */
   body.drag-over::after {
       content: '';
       position: fixed;
       top: 8px;
       left: 8px;
       right: 8px;
       bottom: 8px;
       border: 2px dashed #3498db;
       border-radius: 12px;
       z-index: 1000;
       pointer-events: none;
       animation: dragPulse 1.5s ease-in-out infinite alternate;
   }
   ```

2. **响应式设计**
   ```css
   /* 响应式断点 */
   @media (max-width: 768px) {
       .virtual-dialog {
           margin: 16px;
           min-width: auto;
           max-width: calc(100% - 32px);
       }
   }
   
   @media (max-width: 480px) {
       .virtual-dialog {
           margin: 8px;
           max-width: calc(100% - 16px);
       }
   }
   ```

3. **动画效果**
   ```css
   @keyframes dragPulse {
       from {
           opacity: 0.3;
       }
       to {
           opacity: 0.7;
       }
   }
   
   @keyframes fadeIn {
       from {
           opacity: 0;
       }
       to {
           opacity: 1;
       }
   }
   ```

## 故障排除

### 常见问题

#### 拖拽无响应
- **症状**：拖拽文件到面板无任何反应
- **解决**：
  1. 检查拖拽事件监听器是否正确绑定
  2. 验证event.preventDefault()是否正确调用
  3. 检查CSS pointer-events属性

#### 文件夹拖拽失败
- **症状**：拖拽文件夹时无法正确读取内容
- **解决**：
  1. 检查webkitGetAsEntry API支持情况
  2. 验证递归读取文件夹权限
  3. 检查文件路径解析逻辑

#### 序列帧检测不准
- **症状**：序列帧文件未被正确识别
- **解决**：
  1. 检查文件命名是否符合标准格式
  2. 验证数字模式匹配正则表达式
  3. 调整最小序列帧数量阈值

#### 项目内文件检测失败
- **症状**：已在项目中的文件被错误标记为新文件
- **解决**：
  1. 检查AE连接状态
  2. 验证文件路径匹配算法
  3. 确认ExtendScript脚本执行结果

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控拖拽事件
document.addEventListener('dragover', (e) => {
    console.log('dragover事件触发:', e);
});

document.addEventListener('drop', (e) => {
    console.log('drop事件触发:', e);
    console.log('文件数量:', e.dataTransfer.files.length);
});
```

#### 检查文件信息
```javascript
// 检查拖拽文件的详细信息
function inspectDraggedFiles(event) {
    const files = Array.from(event.dataTransfer.files);
    
    files.forEach((file, index) => {
        console.log(`文件 ${index + 1}:`, {
            name: file.name,
            path: file.path || file.webkitRelativePath,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });
    });
}
```

#### 性能分析
```javascript
// 记录拖拽处理性能
const startTime = performance.now();
await enhancedDragDrop.handleFileDrop(event);
const endTime = performance.now();
console.log(`拖拽处理耗时: ${endTime - startTime}ms`);
```

## 扩展性

### 自定义扩展

#### 扩展拖拽处理逻辑
```javascript
// 创建自定义拖拽处理类
class CustomDragHandler extends EnhancedDragAndDrop {
    constructor(aeExtension) {
        super(aeExtension);
        this.customHandlers = new Map();
    }
    
    /**
     * 注册自定义拖拽处理程序
     * @param {string} mimeType - MIME类型
     * @param {Function} handler - 处理函数
     */
    registerCustomHandler(mimeType, handler) {
        this.customHandlers.set(mimeType, handler);
    }
    
    /**
     * 处理自定义MIME类型
     * @param {string} mimeType - MIME类型
     * @param {Object} data - 数据
     */
    async handleCustomMimeType(mimeType, data) {
        const handler = this.customHandlers.get(mimeType);
        if (handler && typeof handler === 'function') {
            return await handler(data);
        }
        throw new Error(`未找到处理程序: ${mimeType}`);
    }
}

// 注册自定义处理程序
const customDragHandler = new CustomDragHandler(aeExtension);
customDragHandler.registerCustomHandler('application/x-eagle-item', async (data) => {
    // 处理Eagle项目文件
    console.log('处理Eagle项目文件:', data);
    return { success: true };
});
```

#### 插件化架构
```javascript
// 创建拖拽插件
class DragDropPlugin {
    constructor(enhancedDragDrop) {
        this.dragDrop = enhancedDragDrop;
        this.init();
    }
    
    init() {
        // 添加自定义功能
        this.dragDrop.addCustomFeature('batchImport', this.batchImport.bind(this));
        this.dragDrop.addCustomFeature('smartSort', this.smartSort.bind(this));
        
        // 监听拖拽事件
        this.dragDrop.addEventListener('fileDrop', this.handleFileDrop.bind(this));
    }
    
    /**
     * 批量导入功能
     * @param {Array} files - 文件数组
     */
    async batchImport(files) {
        // 实现批量导入逻辑
        console.log('批量导入文件:', files.length);
    }
    
    /**
     * 智能排序功能
     * @param {Array} files - 文件数组
     */
    smartSort(files) {
        // 实现智能排序逻辑
        return files.sort((a, b) => {
            // 按文件类型排序
            const typeA = this.dragDrop.getFileCategory(a);
            const typeB = this.dragDrop.getFileCategory(b);
            
            if (typeA !== typeB) {
                return typeA.localeCompare(typeB);
            }
            
            // 按文件名排序
            return a.name.localeCompare(b.name);
        });
    }
    
    /**
     * 处理文件拖拽事件
     * @param {CustomEvent} event - 拖拽事件
     */
    async handleFileDrop(event) {
        const { files, analysis } = event.detail;
        
        // 应用智能排序
        const sortedFiles = this.smartSort(files);
        
        // 触发批量导入
        await this.batchImport(sortedFiles);
    }
}

// 应用插件
const plugin = new DragDropPlugin(enhancedDragDrop);
```