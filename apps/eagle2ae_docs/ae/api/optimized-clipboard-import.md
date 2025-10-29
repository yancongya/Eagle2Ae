# 剪贴板导入优化功能

## 概述

剪贴板导入优化功能（Optimized Clipboard Import）是 Eagle2Ae AE 扩展 v2.4.0 引入的重要功能模块，它显著提升了从剪贴板导入图片的效率和用户体验。该功能新增了剪贴板图片自动检测、临时文件智能重命名、优化的确认对话框等多项功能，让剪贴板导入变得更加智能和便捷。

## 核心特性

### 剪贴板图片自动检测
- 自动检测剪贴板中的图片内容
- 支持多种图片格式（PNG、JPG、GIF、BMP、WebP等）
- 提供实时检测和导入提示

### 临时文件智能重命名
- 自动识别剪贴板图片的真实文件名
- 智能重命名临时文件，避免使用通用名称
- 保持文件扩展名正确性

### 优化的确认对话框
- 简洁明了的文件信息展示
- 实时显示当前导入设置
- 支持快速导入操作

### 增强的兼容性
- 支持现代剪贴板API和传统API
- 兼容不同操作系统的剪贴板行为
- 提供降级处理机制

## 技术实现

### 核心类结构

```javascript
/**
 * 剪贴板导入优化功能
 * 负责剪贴板图片检测、智能重命名、确认对话框等优化功能
 */
class OptimizedClipboardImport {
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
        this.soundPlayer = aeExtension.soundPlayer;
        
        // 初始化状态
        this.clipboardCheckTimeout = null;
        this.lastClipboardContent = null;
        this.clipboardDetectionCount = 0;
        
        // 绑定方法上下文
        this.setupClipboardListener = this.setupClipboardListener.bind(this);
        this.handleClipboardPaste = this.handleClipboardPaste.bind(this);
        this.detectClipboardContent = this.detectClipboardContent.bind(this);
        this.showClipboardConfirmDialog = this.showClipboardConfirmDialog.bind(this);
        this.handleClipboardImport = this.handleClipboardImport.bind(this);
        
        this.log('📋 剪贴板导入优化功能已初始化', 'debug');
    }
}
```

### 剪贴板监听实现

```javascript
/**
 * 设置剪贴板监听
 */
setupClipboardListener() {
    try {
        // 监听键盘事件，检测Ctrl+V/Cmd+V
        document.addEventListener('keydown', (e) => {
            // 检测Ctrl+V (Windows) 或 Cmd+V (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                // 延迟一点执行，确保剪贴板内容已更新
                setTimeout(() => {
                    this.handleClipboardPaste(e);
                }, 50);
            }
        });

        // 也监听paste事件作为备用
        document.addEventListener('paste', (e) => {
            this.handleClipboardPaste(e);
        });

        this.log('📋 剪贴板监听器已设置', 'debug');
    } catch (error) {
        this.log(`设置剪贴板监听失败: ${error.message}`, 'error');
    }
}

/**
 * 处理剪贴板粘贴事件
 * @param {Event} event - 粘贴事件对象
 */
async handleClipboardPaste(event) {
    try {
        // 防止在输入框中触发
        if (event.target && (
            event.target.tagName === 'INPUT' ||
            event.target.tagName === 'TEXTAREA' ||
            event.target.contentEditable === 'true'
        )) {
            return;
        }

        this.log('🔍 检测到剪贴板粘贴操作', 'debug');

        let clipboardData = null;

        // 尝试从事件获取剪贴板数据
        if (event.clipboardData) {
            clipboardData = event.clipboardData;
        } else {
            // 尝试使用现代的 Clipboard API
            try {
                const clipboardItems = await navigator.clipboard.read();
                if (clipboardItems && clipboardItems.length > 0) {
                    // 构造类似clipboardData的对象
                    clipboardData = {
                        files: [],
                        types: [],
                        getData: () => ''
                    };

                    // 首先尝试获取文本信息，可能包含文件名
                    let possibleFileName = null;
                    for (const item of clipboardItems) {
                        if (item.types.includes('text/plain')) {
                            try {
                                const text = await item.getType('text/plain');
                                const textContent = await text.text();
                                // 检查文本是否像文件路径
                                const filePathMatch = textContent.match(/([^\\\\/]+\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg))$/i);
                                if (filePathMatch) {
                                    possibleFileName = filePathMatch[1];
                                }
                            } catch (e) {
                                // 忽略文本获取错误
                            }
                        }
                    }

                    for (const item of clipboardItems) {
                        for (const type of item.types) {
                            clipboardData.types.push(type);
                            if (type.startsWith('image/')) {
                                const blob = await item.getType(type);
                                const ext = type.split('/')[1] === 'jpeg' ? 'jpg' : type.split('/')[1];

                                // 智能文件名选择
                                let fileName;
                                if (possibleFileName && this.isValidImageFileName(possibleFileName)) {
                                    // 使用检测到的原始文件名
                                    fileName = possibleFileName;
                                } else {
                                    // 使用通用名称，将被标记为临时文件
                                    fileName = `clipboard_image.${ext}`;
                                }

                                const file = new File([blob], fileName, { type });
                                clipboardData.files.push(file);
                            }
                        }
                    }
                }
            } catch (clipboardError) {
                this.log(`无法访问剪贴板API: ${clipboardError.message}`, 'debug');
            }
        }

        if (!clipboardData) {
            this.log('无法获取剪贴板数据', 'debug');
            return;
        }

        // 检测剪贴板内容
        const clipboardContent = await this.detectClipboardContent(clipboardData);

        if (clipboardContent && clipboardContent.files.length > 0) {
            this.log(`✅ 检测到剪贴板中有 ${clipboardContent.files.length} 个可导入文件`, 'info');

            // 预处理文件名称，在显示对话框时就显示最终名称
            const processedFiles = clipboardContent.files.map(file => {
                if (file.isTemporary && !file.hasOriginalName) {
                    // 只有临时文件且没有原始名称时才重命名
                    const ext = this.getFileExtension(file.name);
                    const newName = this.generateTimestampFilename(ext);

                    return {
                        ...file,
                        displayName: newName, // 用于显示的名称
                        originalName: file.name, // 保存原始名称
                        name: newName, // 更新实际名称
                        isTemporary: true,
                        wasRenamed: true // 标记已重命名
                    };
                } else if (file.hasOriginalName) {
                    // 有原始名称的文件，保持原名
                    return {
                        ...file,
                        displayName: file.name,
                        hasOriginalName: true
                    };
                }
                return {
                    ...file,
                    displayName: file.name
                };
            });

            this.showClipboardConfirmDialog({ ...clipboardContent, files: processedFiles });
        } else {
            this.log('📋 剪贴板中没有可导入的内容', 'debug');
        }

    } catch (error) {
        this.log(`❌ 处理剪贴板粘贴失败: ${error.message}`, 'error');
    }
}
```

### 剪贴板内容检测实现

```javascript
/**
 * 检测剪贴板内容
 * @param {Object} clipboardData - 剪贴板数据
 * @returns {Promise<Object|null>} 检测结果或null
 */
async detectClipboardContent(clipboardData) {
    try {
        const result = {
            files: [],
            hasImages: false,
            hasFilePaths: false
        };

        // 检查文件
        if (clipboardData.files && clipboardData.files.length > 0) {
            const files = Array.from(clipboardData.files);
            for (const file of files) {
                if (this.isImportableFile(file)) {
                    const fileName = file.path || file.webkitRelativePath || file.name;
                    // 改进的临时文件检测逻辑
                    const isTemp = this.isTemporaryFileEnhanced(fileName);

                    result.files.push({
                        name: file.name,
                        path: file.path || file.webkitRelativePath || file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified || Date.now(),
                        isClipboardImport: true,
                        isTemporary: isTemp,
                        hasOriginalName: !isTemp, // 如果不是临时文件，说明有原始名称
                        file: file // 保存原始文件对象
                    });
                    result.hasImages = true;
                }
            }
        }

        // 检查文本内容（可能包含文件路径）
        if (clipboardData.getData) {
            const textData = clipboardData.getData('text/plain') || '';
            if (textData.trim()) {
                const filePaths = this.extractFilePathsFromText(textData);
                if (filePaths.length > 0) {
                    result.hasFilePaths = true;
                    // 这里可以进一步处理文件路径，但需要文件系统访问权限
                    this.log(`📋 检测到 ${filePaths.length} 个文件路径`, 'debug');
                }
            }
        }

        return result.files.length > 0 ? result : null;

    } catch (error) {
        this.log(`检测剪贴板内容失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 检查文件是否可导入
 * @param {File} file - 文件对象
 * @returns {boolean} 是否可导入
 */
isImportableFile(file) {
    if (!file || !file.type) return false;

    const importableTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp',
        'image/tiff', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm',
        'audio/mp3', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg'
    ];

    return importableTypes.some(type => file.type.startsWith(type.split('/')[0]));
}

/**
 * 增强的临时文件检测（专门用于剪贴板导入）
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否为临时文件
 */
isTemporaryFileEnhanced(fileName) {
    if (!fileName) return false;

    // 1. 检查是否为通用的剪贴板文件名
    const genericNames = [
        /^clipboard_image\.(png|jpg|jpeg|gif|bmp|webp)$/i,
        /^image\.(png|jpg|jpeg|gif|bmp|webp)$/i,
        /^screenshot\.(png|jpg|jpeg|gif|bmp|webp)$/i,
        /^capture\.(png|jpg|jpeg|gif|bmp|webp)$/i,
        /^untitled\.(png|jpg|jpeg|gif|bmp|webp)$/i
    ];

    for (const pattern of genericNames) {
        if (pattern.test(fileName)) {
            return true;
        }
    }

    // 2. 使用原有的临时文件检测逻辑
    return this.isTemporaryFile(fileName);
}
```

### 剪贴板确认对话框实现

```javascript
/**
 * 显示剪贴板确认对话框
 * @param {Object} clipboardContent - 剪贴板内容
 */
showClipboardConfirmDialog(clipboardContent) {
    try {
        const files = clipboardContent.files;
        const settings = this.settingsManager.getSettings();

        // 创建确认对话框
        const dialog = document.createElement('div');
        dialog.className = 'eagle-confirm-dialog';

        // 构建文件信息 - 简化为一行显示
        const fileInfoHtml = files.map((file, index) => {
            const sizeText = file.size ? this.formatFileSize(file.size) : '未知大小';
            const typeIcon = this.getFileIcon(file);
            const displayName = file.displayName || file.name;
            const fileType = file.type || '未知类型';

            return `
                <div class="file-item-simple" data-file-index="${index}">
                    <span class="file-icon">${typeIcon}</span>
                    <span class="file-name" title="${displayName}">${displayName}</span>
                    <span class="file-size">${sizeText}</span>
                    <span class="file-type">${fileType}</span>
                </div>
            `;
        }).join('');

        // 构建导入设置信息 - 简化显示
        const importModeText = {
            'direct': '直接导入',
            'project_adjacent': '项目旁复制',
            'custom_folder': '自定义文件夹'
        }[settings.mode] || settings.mode;

        // 获取当前设置
        const currentSettings = this.settingsManager.getSettings();

        // 根据是否自动添加到合成来确定导入行为
        let importBehavior;
        if (currentSettings.addToComposition) {
            // 如果自动添加到合成，显示时间轴放置位置
            const timelinePlacement = {
                'current_time': '当前时间',
                'timeline_start': '时间轴开始'
            }[currentSettings.timelineOptions?.placement] || '当前时间';
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

        dialog.innerHTML = `
            <div class="eagle-confirm-content">
                <div class="eagle-confirm-header">
                    <h3>剪贴板导入确认</h3>
                </div>
                <div class="eagle-confirm-body">
                    <p>检测到剪贴板中有 ${files.length} 个可导入文件</p>
                    <div class="file-list">
                        ${fileInfoHtml}
                    </div>
                    <div class="import-settings-dark">
                        <div class="setting-item"><span class="setting-label">导入模式:</span><span class="setting-value">${importModeText}</span></div>
                        <div class="setting-item"><span class="setting-label">导入行为:</span><span class="setting-value">${importBehavior}</span></div>
                    </div>
                </div>
                <div class="eagle-confirm-actions-flex">
                    <button class="btn-outline-primary" id="clipboard-confirm-yes">导入文件</button>
                    <button class="btn-outline-secondary" id="clipboard-confirm-no">取消</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // 绑定事件
        document.getElementById('clipboard-confirm-yes').onclick = async () => {
            dialog.remove();
            this.log('用户确认导入剪贴板内容', 'info');
            await this.handleClipboardImport(files);
        };

        document.getElementById('clipboard-confirm-no').onclick = () => {
            dialog.remove();
            this.log('用户取消剪贴板导入', 'info');
            this.showDropMessage('已取消导入', 'info');
        };

        // 点击对话框外部关闭
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
                this.log('剪贴板确认对话框被关闭', 'info');
            }
        });

        // 15秒后自动关闭
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.remove();
                this.log('剪贴板确认对话框超时关闭', 'info');
            }
        }, 15000);

    } catch (error) {
        this.log(`显示剪贴板确认对话框失败: ${error.message}`, 'error');
    }
}

/**
 * 处理剪贴板导入
 * @param {Array} files - 文件数组
 */
async handleClipboardImport(files) {
    try {
        // 不显示处理提示，直接开始导入

        // 处理临时文件重命名并标记为已确认
        const processedFiles = files.map(file => {
            // 标记文件为已确认导入
            const confirmedFile = {
                ...file,
                confirmed: true
            };

            if (file.isTemporary && !file.customName && !file.wasRenamed) {
                // 只有在用户没有自定义文件名且未重命名时才自动重命名
                const ext = this.getFileExtension(file.name);
                const newName = this.generateTimestampFilename(ext);

                this.log(`临时文件重命名: ${file.name} -> ${newName}`, 'info');

                return {
                    ...confirmedFile,
                    name: newName,
                    originalName: file.originalName || file.name,
                    isTemporary: true
                };
            } else if (file.isTemporary && (file.customName || file.wasRenamed)) {
                this.log(`保留文件名: ${file.name} (用户自定义: ${file.customName}, 已重命名: ${file.wasRenamed})`, 'info');
            }
            return confirmedFile;
        });

        // 构造消息对象，模拟文件导入消息格式
        const message = {
            type: 'import',
            files: processedFiles,
            source: 'clipboard_import',
            timestamp: Date.now(),
            isClipboardImport: true,
            // 优化：跳过一些不必要的检查
            skipValidation: true,
            fastMode: true
        };

        // 调用现有的文件处理流程
        const result = await this.handleImportFiles(message);

        // 显示结果 - 改进判断逻辑
        if (result && (result.success === true || result.importedCount > 0)) {
            this.showDropMessage(`✅ 剪贴板导入成功 (${result.importedCount || 1} 个文件)`, 'success');
        } else {
            this.showDropMessage(`❌ 剪贴板导入失败: ${result?.error || '未知错误'}`, 'error');
        }

    } catch (error) {
        this.log(`❌ 剪贴板导入失败: ${error.message}`, 'error');
        this.showDropMessage(`❌ 剪贴板导入失败: ${error.message}`, 'error');
    }
}
```

## API参考

### 核心方法

#### setupClipboardListener()
设置剪贴板监听器

```javascript
/**
 * 设置剪贴板监听器
 */
setupClipboardListener()
```

#### handleClipboardPaste()
处理剪贴板粘贴事件

```javascript
/**
 * 处理剪贴板粘贴事件
 * @param {Event} event - 粘贴事件对象
 */
async handleClipboardPaste(event)
```

#### detectClipboardContent()
检测剪贴板内容

```javascript
/**
 * 检测剪贴板内容
 * @param {Object} clipboardData - 剪贴板数据
 * @returns {Promise<Object|null>} 检测结果或null
 */
async detectClipboardContent(clipboardData)
```

#### isImportableFile()
检查文件是否可导入

```javascript
/**
 * 检查文件是否可导入
 * @param {File} file - 文件对象
 * @returns {boolean} 是否可导入
 */
isImportableFile(file)
```

#### isTemporaryFileEnhanced()
增强的临时文件检测（专门用于剪贴板导入）

```javascript
/**
 * 增强的临时文件检测（专门用于剪贴板导入）
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否为临时文件
 */
isTemporaryFileEnhanced(fileName)
```

#### showClipboardConfirmDialog()
显示剪贴板确认对话框

```javascript
/**
 * 显示剪贴板确认对话框
 * @param {Object} clipboardContent - 剪贴板内容
 */
showClipboardConfirmDialog(clipboardContent)
```

#### handleClipboardImport()
处理剪贴板导入

```javascript
/**
 * 处理剪贴板导入
 * @param {Array} files - 文件数组
 */
async handleClipboardImport(files)
```

### 辅助方法

#### isValidImageFileName()
验证是否为有效的图片文件名

```javascript
/**
 * 验证是否为有效的图片文件名
 * @param {string} fileName - 文件名
 * @returns {boolean} 是否为有效的图片文件名
 */
isValidImageFileName(fileName)
```

#### extractFilePathsFromText()
从文本中提取文件路径

```javascript
/**
 * 从文本中提取文件路径
 * @param {string} text - 文本内容
 * @returns {Array} 文件路径数组
 */
extractFilePathsFromText(text)
```

#### generateTimestampFilename()
生成时间戳文件名

```javascript
/**
 * 生成时间戳文件名
 * @param {string} originalExt - 原始扩展名
 * @returns {string} 时间戳文件名
 */
generateTimestampFilename(originalExt)
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

#### getFileExtension()
获取文件扩展名

```javascript
/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string} 文件扩展名
 */
getFileExtension(filename)
```

#### getFileNameWithoutExtension()
获取不含扩展名的文件名

```javascript
/**
 * 获取不含扩展名的文件名
 * @param {string} filename - 文件名
 * @returns {string} 不含扩展名的文件名
 */
getFileNameWithoutExtension(filename)
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

#### isTemporaryFile()
检查是否为临时文件

```javascript
/**
 * 检查是否为临时文件
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否为临时文件
 */
isTemporaryFile(filePath)
```

#### supportsWebkitDirectory()
检查是否支持webkitdirectory

```javascript
/**
 * 检查是否支持webkitdirectory
 * @returns {boolean} 是否支持webkitdirectory
 */
supportsWebkitDirectory()
```

#### useWebkitDirectoryPicker()
使用webkitdirectory API选择文件夹

```javascript
/**
 * 使用webkitdirectory API选择文件夹
 */
useWebkitDirectoryPicker()
```

#### useCEPFolderPicker()
使用CEP ExtendScript方式选择文件夹

```javascript
/**
 * 使用CEP ExtendScript方式选择文件夹
 */
useCEPFolderPicker()
```

#### fallbackToInputPrompt()
降级到输入提示方式

```javascript
/**
 * 降级到输入提示方式
 * @param {string} currentPath - 当前路径
 */
fallbackToInputPrompt(currentPath)
```

#### extractFolderPath()
从文件路径中提取文件夹路径

```javascript
/**
 * 从文件路径中提取文件夹路径
 * @param {string} filePath - 文件路径
 * @returns {string} 文件夹路径
 */
extractFolderPath(filePath)
```

#### getDirectoryPath()
尝试获取目录的完整路径

```javascript
/**
 * 尝试获取目录的完整路径（File System Access API）
 * @param {FileSystemDirectoryHandle} directoryHandle - 目录句柄
 * @returns {Promise<string>} 目录路径
 */
async getDirectoryPath(directoryHandle)
```

#### handleSelectedFolder()
处理选择的文件夹

```javascript
/**
 * 处理选择的文件夹（统一处理方法）
 * @param {string} folderPath - 文件夹路径
 */
handleSelectedFolder(folderPath)
```

#### showFolderPickerModal()
显示文件夹选择模态框

```javascript
/**
 * 显示文件夹选择模态框
 */
showFolderPickerModal()
```

#### resetFolderPickerModal()
重置文件夹选择模态框状态

```javascript
/**
 * 重置文件夹选择模态框状态
 */
resetFolderPickerModal()
```

#### setupFolderPickerEvents()
设置文件夹选择模态框事件监听器

```javascript
/**
 * 设置文件夹选择模态框事件监听器
 */
setupFolderPickerEvents()
```

#### hideFolderPickerModal()
隐藏文件夹选择模态框

```javascript
/**
 * 隐藏文件夹选择模态框
 */
hideFolderPickerModal()
```

#### tryModernWebFolderPicker()
尝试使用现代Web API选择文件夹

```javascript
/**
 * 尝试使用现代Web API选择文件夹
 * @returns {boolean} 是否成功
 */
tryModernWebFolderPicker()
```

#### useModernFolderPicker()
使用系统文件夹选择器

```javascript
/**
 * 使用系统文件夹选择器
 */
useModernFolderPicker()
```

#### confirmFolderSelection()
确认文件夹选择

```javascript
/**
 * 确认文件夹选择
 */
confirmFolderSelection()
```

#### setupDragDropEvents()
设置拖拽事件

```javascript
/**
 * 设置拖拽事件
 */
setupDragDropEvents()
```

#### setupManualInputEvents()
设置手动输入事件

```javascript
/**
 * 设置手动输入事件
 */
setupManualInputEvents()
```

#### loadRecentFoldersInModal()
在模态框中加载最近使用的文件夹

```javascript
/**
 * 在模态框中加载最近使用的文件夹（简化版 - 暂时不显示）
 */
loadRecentFoldersInModal()
```

#### enableConfirmButton()
启用确认按钮

```javascript
/**
 * 启用确认按钮
 */
enableConfirmButton()
```

#### toggleConfirmButton()
切换确认按钮状态

```javascript
/**
 * 切换确认按钮状态
 * @param {boolean} enabled - 是否启用
 */
toggleConfirmButton(enabled)
```

#### validateFolderPath()
验证文件夹路径

```javascript
/**
 * 验证文件夹路径
 * @param {string} path - 文件夹路径
 */
validateFolderPath(path)
```

#### updateRecentFoldersDropdown()
更新最近文件夹下拉列表

```javascript
/**
 * 更新最近文件夹下拉列表
 */
updateRecentFoldersDropdown()
```

#### truncatePath()
截断路径显示

```javascript
/**
 * 截断路径显示
 * @param {string} path - 路径
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的路径
 */
truncatePath(path, maxLength)
```

#### saveSettings()
保存设置

```javascript
/**
 * 保存设置
 * @param {boolean} hidePanel - 是否隐藏面板
 */
saveSettings(hidePanel = true)
```

#### resetSettings()
重置设置

```javascript
/**
 * 重置设置
 */
resetSettings()
```

#### syncSettingsToEagle()
同步设置到Eagle插件

```javascript
/**
 * 同步设置到Eagle插件
 * @param {Object} settings - 设置对象
 */
async syncSettingsToEagle(settings)
```

#### syncPortToEagle()
智能端口同步

```javascript
/**
 * 智能端口同步 - 多端口尝试
 * @param {number} oldPort - 旧端口
 * @param {number} newPort - 新端口
 * @returns {Promise<boolean>} 是否成功
 */
async syncPortToEagle(oldPort, newPort)
```

#### updateEagleUrl()
更新Eagle URL

```javascript
/**
 * 更新Eagle URL
 * @param {number} port - 端口号
 */
updateEagleUrl(port)
```

#### updateEagleUrlWithDiscovery()
使用动态端口发现更新Eagle URL

```javascript
/**
 * 使用动态端口发现更新Eagle URL
 */
async updateEagleUrlWithDiscovery()
```

#### startDemoLogs()
启动演示模式虚拟日志

```javascript
/**
 * 启动演示模式虚拟日志
 * @param {number} port - 端口号
 */
startDemoLogs(port)
```

#### startDemoActivityLogs()
启动演示活动日志

```javascript
/**
 * 启动演示活动日志
 */
startDemoActivityLogs()
```

#### startEagleDemoLogs()
启动Eagle虚拟日志

```javascript
/**
 * 启动Eagle虚拟日志
 */
startEagleDemoLogs()
```

#### handlePortChange()
处理端口更改

```javascript
/**
 * 处理端口更改（异步方法）
 * @param {number} oldPort - 旧端口
 * @param {number} newPort - 新端口
 */
async handlePortChange(oldPort, newPort)
```

#### detectEaglePort()
检测Eagle扩展运行端口

```javascript
/**
 * 检测Eagle扩展运行端口
 */
async detectEaglePort()
```

#### playConnectionSound()
播放连接音效

```javascript
/**
 * 播放连接音效（默认启用）
 * @param {string} soundType - 音效类型
 */
playConnectionSound(soundType)
```

#### setupQuickSettings()
设置快速设置管理

```javascript
/**
 * 设置快速设置管理
 */
setupQuickSettings()
```

#### updateQuickSetting()
更新快速设置

```javascript
/**
 * 更新快速设置
 * @param {string} fieldPath - 字段路径
 * @param {any} value - 值
 */
updateQuickSetting(fieldPath, value)
```

#### updateQuickSettingsVisibility()
更新快速设置的可见性

```javascript
/**
 * 更新快速设置的可见性
 */
updateQuickSettingsVisibility()
```

#### updateLayerOperationButtonsVisual()
更新图层操作按钮的视觉状态

```javascript
/**
 * 更新图层操作按钮的视觉状态
 * @param {string} importBehavior - 导入行为
 */
updateLayerOperationButtonsVisual(importBehavior)
```

#### loadQuickSettings()
加载快速设置

```javascript
/**
 * 加载快速设置
 */
loadQuickSettings()
```

#### syncQuickToAdvanced()
同步快速设置到高级设置

```javascript
/**
 * 同步快速设置到高级设置
 */
syncQuickToAdvanced()
```

#### updateModeButtonStyles()
更新模式按钮样式

```javascript
/**
 * 更新模式按钮样式
 */
updateModeButtonStyles()
```

#### showCurrentSettings()
显示当前设置状态

```javascript
/**
 * 显示当前设置状态
 */
showCurrentSettings()
```

#### debugSettings()
调试设置功能

```javascript
/**
 * 调试设置功能
 */
debugSettings()
```

#### continueDebugSettings()
继续调试设置的其余部分

```javascript
/**
 * 继续调试设置的其余部分
 */
continueDebugSettings()
```

#### syncSettingsUI()
同步设置UI

```javascript
/**
 * 同步设置UI
 */
syncSettingsUI()
```

#### loadExportSettingsToUI()
加载导出设置到UI

```javascript
/**
 * 加载导出设置到UI
 */
loadExportSettingsToUI()
```

#### getExportSettingsFromUI()
从UI获取导出设置

```javascript
/**
 * 从UI获取导出设置（现在直接读取导入模式的设置）
 * @returns {Object} 导出设置
 */
getExportSettingsFromUI()
```

#### updateExportSettingsUI()
更新导出设置UI状态

```javascript
/**
 * 更新导出设置UI状态
 */
updateExportSettingsUI()
```

#### handleExportPresets()
导出当前预设为JSON到文档目录的指定子目录

```javascript
/**
 * 导出当前预设为JSON到文档目录的指定子目录
 * @returns {Promise<void>} 无返回值
 */
async handleExportPresets()
```

#### getUISettingsFromLocalStorage()
从localStorage获取UI面板组设置

```javascript
/**
 * 从localStorage获取UI面板组设置
 * @returns {Object} UI设置对象
 */
getUISettingsFromLocalStorage()
```

#### getProjectAdjacentSettings()
从localStorage获取项目旁复制设置

```javascript
/**
 * 从localStorage获取项目旁复制设置
 * @returns {Object} 项目旁设置对象
 */
getProjectAdjacentSettings()
```

#### getCustomFolderSettings()
从localStorage获取自定义文件夹设置

```javascript
/**
 * 从localStorage获取自定义文件夹设置
 * @returns {Object} 自定义文件夹设置对象
 */
getCustomFolderSettings()
```

#### savePresetsSilently()
静默保存预设到JSON（无弹窗与打开文件夹）

```javascript
/**
 * 静默保存预设到JSON（无弹窗与打开文件夹）
 * @returns {Promise<boolean>} 是否保存成功
 */
async savePresetsSilently()
```

#### loadPresetsFromDisk()
从JSON自动读取预设并应用到UI

```javascript
/**
 * 从JSON自动读取预设并应用到UI
 * @returns {Promise<void>}
 */
async loadPresetsFromDisk()
```

#### setupAutoPresetSync()
设置自动预设同步（监听变更并防抖保存）

```javascript
/**
 * 设置自动预设同步（监听变更并防抖保存）
 */
setupAutoPresetSync()
```

#### getPresetsBaseFolderPath()
获取当前预设目录（用户自定义的绝对路径）

```javascript
/**
 * 获取当前预设目录（用户自定义的绝对路径），如果未设置则返回null
 * @returns {string|null} 预设目录路径
 */
getPresetsBaseFolderPath()
```

#### updateOpenPresetsBtnTooltip()
更新"打开预设目录"按钮的悬浮提示为当前目录

```javascript
/**
 * 更新"打开预设目录"按钮的悬浮提示为当前目录
 */
updateOpenPresetsBtnTooltip()
```

#### handleOpenPresetsFolder()
打开当前预设目录（如果不存在则创建）

```javascript
/**
 * 打开当前预设目录（如果不存在则创建）
 */
async handleOpenPresetsFolder()
```

#### ensurePresetsFolderReady()
确保预设目录存在（启动时调用）

```javascript
/**
 * 确保预设目录存在（启动时调用）
 * @returns {Promise<void>}
 */
async ensurePresetsFolderReady()
```

#### handleChoosePresetsDirectory()
选择自定义预设目录并保存到偏好中

```javascript
/**
 * 选择自定义预设目录并保存到偏好中
 */
async handleChoosePresetsDirectory()
```

#### initPresetFileButtons()
初始化预设文件管理按钮（两种模式通用）

```javascript
/**
 * 初始化预设文件管理按钮（两种模式通用）
 */
initPresetFileButtons()
```

#### handleDownloadPreset()
下载预设文件（两种模式自适应）

```javascript
/**
 * 下载预设文件（两种模式自适应）
 */
handleDownloadPreset()
```

#### handleOpenPreset()
打开预设文件（两种模式自适应）

```javascript
/**
 * 打开预设文件（两种模式自适应）
 */
handleOpenPreset()
```

#### formatTimestamp()
生成时间戳字符串（YYYYMMDD-HHMMSS），用于文件名

```javascript
/**
 * 生成时间戳字符串（YYYYMMDD-HHMMSS），用于文件名
 * @param {Date} date - 时间对象
 * @returns {string} 时间戳
 */
formatTimestamp(date)
```

#### showProjectAdjacentModal()
显示项目旁复制模态框

```javascript
/**
 * 显示项目旁复制模态框
 */
showProjectAdjacentModal()
```

#### showCustomFolderModal()
显示自定义文件夹模态框

```javascript
/**
 * 显示自定义文件夹模态框
 */
showCustomFolderModal()
```

#### testQuickSettingsEventListeners()
测试快速设置事件监听器

```javascript
/**
 * 测试快速设置事件监听器
 */
testQuickSettingsEventListeners()
```

#### forceReinitQuickSettings()
强制重新初始化快速设置（用于调试）

```javascript
/**
 * 强制重新初始化快速设置（用于调试）
 */
forceReinitQuickSettings()
```

#### testQuickSettingChange()
手动测试快速设置变化（用于调试）

```javascript
/**
 * 手动测试快速设置变化（用于调试）
 * @param {string} type - 类型
 * @param {string} value - 值
 */
testQuickSettingChange(type, value)
```

#### testAllQuickSettings()
测试所有快速设置选项

```javascript
/**
 * 测试所有快速设置选项
 */
testAllQuickSettings()
```

#### diagnoseQuickSettings()
诊断快速设置问题

```javascript
/**
 * 诊断快速设置问题
 */
diagnoseQuickSettings()
```

#### rebindQuickSettingsEventListeners()
手动绑定事件监听器（用于修复）

```javascript
/**
 * 手动绑定事件监听器（用于修复）
 */
rebindQuickSettingsEventListeners()
```

#### fixAllQuickSettingsIssues()
一键修复所有快速设置问题

```javascript
/**
 * 一键修复所有快速设置问题
 */
fixAllQuickSettingsIssues()
```

#### setupDragAndDrop()
设置拖拽监听

```javascript
/**
 * 设置拖拽监听
 */
setupDragAndDrop()
```

#### handleDragPreview()
拖拽预检查处理

```javascript
/**
 * 拖拽预检查处理
 * @param {DragEvent} event - 拖拽事件
 */
async handleDragPreview(event)
```

#### performDragPreviewCheck()
执行拖拽预检查

```javascript
/**
 * 执行拖拽预检查
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
重置拖拽预检查状态

```javascript
/**
 * 重置拖拽预检查状态
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

#### handleFilesDrop()
处理普通文件拖拽

```javascript
/**
 * 处理普通文件拖拽
 * @param {Array} files - 文件数组
 * @param {DataTransfer} dataTransfer - 数据传输对象
 */
async handleFilesDrop(files, dataTransfer)
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

#### showProjectInternalFileWarning()
显示项目内文件警告提示

```javascript
/**
 * 显示项目内文件警告提示
 * @param {Object} projectFileCheck - 项目文件检测结果
 */
showProjectInternalFileWarning(projectFileCheck)
```

#### isEagleDrag()
识别Eagle拖拽

```javascript
/**
 * 识别Eagle拖拽
 * @param {DataTransfer} dataTransfer - 数据传输对象
 * @param {Array} files - 文件数组
 * @returns {boolean} 是否为Eagle拖拽
 */
isEagleDrag(dataTransfer, files)
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

#### showDragHint()
显示拖拽提示

```javascript
/**
 * 显示拖拽提示
 */
showDragHint()
```

#### showDragImportStarted()
显示拖拽导入开始提示

```javascript
/**
 * 显示拖拽导入开始提示
 * @param {number} fileCount - 文件数量
 */
showDragImportStarted(fileCount)
```

#### showDragImportError()
显示拖拽导入错误

```javascript
/**
 * 显示拖拽导入错误
 * @param {string} errorMessage - 错误消息
 */
showDragImportError(errorMessage)
```

#### showDropMessage()
显示拖拽反馈消息

```javascript
/**
 * 显示拖拽反馈消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型
 */
showDropMessage(message, type = 'info')
```

#### getDropMessageIcon()
获取拖拽消息图标

```javascript
/**
 * 获取拖拽消息图标
 * @param {string} type - 消息类型
 * @returns {string} 图标
 */
getDropMessageIcon(type)
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

#### showNonEagleConfirmDialog()
显示非Eagle文件确认对话框

```javascript
/**
 * 显示非Eagle文件确认对话框
 * @param {Array} files - 文件数组
 */
showNonEagleConfirmDialog(files)
```

#### showEagleConfirmDialog()
显示Eagle确认对话框

```javascript
/**
 * 显示Eagle确认对话框
 * @param {Array} files - 文件数组
 */
showEagleConfirmDialog(files)
```

## 使用示例

### 基本使用

```javascript
// 初始化剪贴板导入优化功能
const clipboardImport = new OptimizedClipboardImport(aeExtension);

// 设置剪贴板监听
clipboardImport.setupClipboardListener();

// 监听Ctrl+V/Cmd+V事件
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        clipboardImport.handleClipboardPaste(e);
    }
});
```

### 高级使用

```javascript
// 自定义剪贴板检测逻辑
clipboardImport.isImportableFile = (file) => {
    // 只允许导入PNG和JPG文件
    const allowedTypes = ['image/png', 'image/jpeg'];
    return allowedTypes.includes(file.type);
};

// 自定义临时文件检测逻辑
clipboardImport.isTemporaryFileEnhanced = (fileName) => {
    // 更严格的临时文件检测
    const tempPatterns = [
        /^clipboard_image\./i,
        /^image\./i,
        /^screenshot\./i,
        /^capture\./i,
        /^untitled\./i,
        /temp/i,
        /tmp/i
    ];
    
    return tempPatterns.some(pattern => pattern.test(fileName));
};

// 自定义文件名生成逻辑
clipboardImport.generateTimestampFilename = (originalExt) => {
    // 使用自定义的时间戳格式
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').replace('T', '_');
    return `import_${timestamp}${originalExt}`;
};
```

### 批量处理

```javascript
// 批量处理多个剪贴板导入
async function batchClipboardImport(fileGroups) {
    const results = [];
    
    for (const files of fileGroups) {
        try {
            const result = await clipboardImport.handleClipboardImport(files);
            results.push({
                files: files.length,
                success: true,
                result: result
            });
        } catch (error) {
            results.push({
                files: files.length,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

// 使用示例
const fileGroups = [
    [file1, file2, file3], // 第一组文件
    [file4, file5],        // 第二组文件
    [file6]                // 第三组文件
];

const batchResults = await batchClipboardImport(fileGroups);
console.log('批量剪贴板导入结果:', batchResults);
```

## 最佳实践

### 使用建议

#### 文件格式处理
```javascript
// 推荐的文件格式处理策略
const recommendedFormats = {
    'image/png': true,
    'image/jpeg': true,
    'image/jpg': true,
    'image/gif': true,
    'image/bmp': true,
    'image/tiff': true,
    'image/webp': true,
    'image/svg+xml': true
};

// 检查文件格式是否受支持
function isSupportedFormat(file) {
    return recommendedFormats[file.type] === true;
}
```

#### 临时文件管理
```javascript
// 临时文件命名策略
function generateSmartFilename(originalName, fileType) {
    // 如果是临时文件，生成智能名称
    if (clipboardImport.isTemporaryFileEnhanced(originalName)) {
        const ext = clipboardImport.getFileExtension(originalName);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `import_${timestamp}${ext}`;
    }
    
    // 如果有原始名称，保持原名
    return originalName;
}
```

#### 性能优化
```javascript
// 使用防抖处理避免频繁检查
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

// 防抖处理剪贴板粘贴
const debouncedClipboardPaste = debounce((event) => {
    clipboardImport.handleClipboardPaste(event);
}, 300);
```

#### 内存管理
```javascript
// 及时清理事件监听器
function cleanupClipboardListeners() {
    // 移除键盘监听器
    document.removeEventListener('keydown', handleKeyDown);
    
    // 移除粘贴监听器
    document.removeEventListener('paste', handlePaste);
    
    // 清理定时器
    if (clipboardImport.clipboardCheckTimeout) {
        clearTimeout(clipboardImport.clipboardCheckTimeout);
    }
}

// 在组件销毁时调用
window.addEventListener('beforeunload', cleanupClipboardListeners);
```

### 用户体验优化

#### 视觉反馈
```css
/* 剪贴板导入视觉反馈 */
.clipboard-import-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(52, 152, 219, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.clipboard-import-indicator.success {
    background: rgba(46, 204, 113, 0.9);
}

.clipboard-import-indicator.error {
    background: rgba(231, 76, 60, 0.9);
}

.clipboard-import-indicator.warning {
    background: rgba(241, 196, 15, 0.9);
}
```

#### 交互设计
```javascript
// 提供清晰的用户指引
function showClipboardImportGuide() {
    const guide = `
        📋 剪贴板导入使用指南
        
        1. 在任何地方复制图片 (Ctrl+C / Cmd+C)
        2. 回到AE并激活Eagle2Ae扩展面板
        3. 按下粘贴快捷键 (Ctrl+V / Cmd+V)
        4. 确认导入设置并点击"导入文件"
        
        💡 提示：
        - 支持从网页、聊天软件、截图工具等复制图片
        - 智能重命名功能会避免使用通用文件名
        - 可以在高级设置中自定义导入行为
    `;
    
    console.log(guide);
}
```

## 故障排除

### 常见问题

#### 剪贴板导入无响应
- **症状**：按下Ctrl+V/Cmd+V后无任何反应
- **解决**：
  1. 检查剪贴板监听器是否正确绑定
  2. 验证扩展面板是否处于激活状态
  3. 重启AE和扩展面板

#### 文件名重命名失败
- **症状**：临时文件名未被正确重命名
- **解决**：
  1. 检查临时文件检测逻辑
  2. 验证时间戳生成函数
  3. 检查文件扩展名提取逻辑

#### 图片格式不支持
- **症状**：某些格式的图片无法导入
- **解决**：
  1. 检查文件类型检测逻辑
  2. 添加缺失的格式支持
  3. 验证MIME类型匹配规则

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控剪贴板事件
document.addEventListener('paste', (e) => {
    console.log('📋 粘贴事件触发:', e);
    console.log('📋 剪贴板数据类型:', Array.from(e.clipboardData.types));
});

// 监控剪贴板导入过程
window.addEventListener('clipboardImportStart', (e) => {
    console.log('📋 剪贴板导入开始:', e.detail);
});

window.addEventListener('clipboardImportComplete', (e) => {
    console.log('📋 剪贴板导入完成:', e.detail);
});
```

#### 性能监控
```javascript
// 监控剪贴板导入性能
const performanceMarkers = [];

function markClipboardImportStep(step) {
    performance.mark(`clipboard-import-${step}`);
    performanceMarkers.push(step);
}

function measureClipboardImportPerformance() {
    for (let i = 1; i < performanceMarkers.length; i++) {
        const start = `clipboard-import-${performanceMarkers[i-1]}`;
        const end = `clipboard-import-${performanceMarkers[i]}`;
        performance.measure(`clipboard-import-${performanceMarkers[i-1]}-to-${performanceMarkers[i]}`, start, end);
    }
    
    const measures = performance.getEntriesByType('measure');
    measures.forEach(measure => {
        console.log(`⏱️ ${measure.name}: ${measure.duration}ms`);
    });
}
```

#### 内存使用监控
```javascript
// 监控内存使用情况
function logMemoryUsage() {
    if (performance.memory) {
        console.log('📋 内存使用情况:', {
            used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
            total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`,
            limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        });
    }
}

// 定期监控内存使用
setInterval(logMemoryUsage, 30000); // 每30秒监控一次
```

## 扩展性

### 自定义扩展

#### 扩展剪贴板导入功能
```javascript
// 创建自定义剪贴板导入类
class CustomClipboardImport extends OptimizedClipboardImport {
    constructor(aeExtension) {
        super(aeExtension);
        this.customFeatures = new Map();
    }
    
    /**
     * 注册自定义功能
     * @param {string} name - 功能名称
     * @param {Function} feature - 功能实现
     */
    registerCustomFeature(name, feature) {
        this.customFeatures.set(name, feature);
    }
    
    /**
     * 执行自定义功能
     * @param {string} name - 功能名称
     * @param {...any} args - 参数
     * @returns {any} 功能执行结果
     */
    executeCustomFeature(name, ...args) {
        const feature = this.customFeatures.get(name);
        if (feature && typeof feature === 'function') {
            return feature(...args);
        }
        throw new Error(`未知的自定义功能: ${name}`);
    }
}
```

#### 插件化架构
```javascript
// 创建剪贴板导入插件
class ClipboardImportPlugin {
    constructor(clipboardImport) {
        this.clipboardImport = clipboardImport;
        this.init();
    }
    
    init() {
        // 添加自定义事件监听器
        this.clipboardImport.addEventListener('clipboardImport', this.handleClipboardImport.bind(this));
        
        // 添加自定义方法
        this.clipboardImport.customImport = this.customImport.bind(this);
        
        // 注册自定义文件类型处理
        this.registerCustomFileTypeHandlers();
    }
    
    /**
     * 处理剪贴板导入事件
     * @param {CustomEvent} event - 剪贴板导入事件
     */
    handleClipboardImport(event) {
        const { files, settings } = event.detail;
        
        // 执行插件特定的处理逻辑
        this.processImportedFiles(files, settings);
    }
    
    /**
     * 自定义导入处理
     * @param {Array} files - 文件数组
     * @param {Object} options - 导入选项
     */
    async customImport(files, options) {
        // 执行自定义导入逻辑
        console.log('执行自定义剪贴板导入:', files, options);
        
        // 调用原始导入方法
        const result = await this.clipboardImport.handleClipboardImport(files);
        
        // 执行插件特定的后处理
        await this.postProcessImport(result, options);
        
        return result;
    }
    
    /**
     * 处理导入的文件
     * @param {Array} files - 文件数组
     * @param {Object} settings - 设置
     */
    async processImportedFiles(files, settings) {
        // 执行插件特定的文件处理逻辑
        for (const file of files) {
            await this.processSingleFile(file, settings);
        }
    }
    
    /**
     * 处理单个文件
     * @param {File} file - 文件对象
     * @param {Object} settings - 设置
     */
    async processSingleFile(file, settings) {
        // 插件特定的文件处理逻辑
        console.log(`处理文件: ${file.name}`, file);
    }
    
    /**
     * 导入后处理
     * @param {Object} result - 导入结果
     * @param {Object} options - 导入选项
     */
    async postProcessImport(result, options) {
        // 执行导入完成后的处理逻辑
        console.log('导入后处理:', result, options);
    }
    
    /**
     * 注册自定义文件类型处理
     */
    registerCustomFileTypeHandlers() {
        // 注册自定义文件类型处理函数
        this.clipboardImport.registerFileTypeHandler('application/custom', (file) => {
            // 自定义文件类型处理逻辑
            console.log(`处理自定义文件类型: ${file.name}`);
            return true; // 返回true表示处理成功
        });
    }
}

// 应用插件
const plugin = new ClipboardImportPlugin(clipboardImport);
```