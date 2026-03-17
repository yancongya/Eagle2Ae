# 10. 剪贴板导入优化功能

## 概述

Eagle2Ae AE 扩展 v2.4.0 对剪贴板导入功能进行了深度优化，新增了剪贴板图片自动检测、临时文件智能重命名、优化的确认对话框等功能。这些改进使得从剪贴板导入图片变得更加便捷和智能。

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

## 使用指南

### 基本剪贴板导入

#### 从网页复制图片
1. 在网页浏览器中右键点击图片
2. 选择"复制图片"或使用快捷键 `Ctrl+C`/`Cmd+C`
3. 切换到After Effects并激活Eagle2Ae扩展面板
4. 按下快捷键 `Ctrl+V`/`Cmd+V`
5. 系统将自动检测剪贴板内容并显示导入对话框

#### 从截图工具复制
1. 使用系统截图工具（如Windows截图工具、macOS截图）截取屏幕
2. 截图会自动复制到剪贴板
3. 在AE中激活扩展面板并按下 `Ctrl+V`/`Cmd+V`

#### 从聊天软件复制
1. 在微信、QQ等聊天软件中右键点击图片
2. 选择"复制"或使用快捷键 `Ctrl+C`/`Cmd+C`
3. 在AE中激活扩展面板并按下 `Ctrl+V`/`Cmd+V`

### 高级功能

#### 智能文件名识别
系统会尝试从剪贴板中获取原始文件名：
- 网页图片：尝试从图片URL中提取文件名
- 本地文件：使用实际文件名
- 截图工具：使用时间戳命名

#### 文件类型检测
支持以下图片格式的自动检测：
- PNG (.png)
- JPEG/JPG (.jpg, .jpeg)
- GIF (.gif)
- BMP (.bmp)
- WebP (.webp)
- TIFF (.tiff, .tif)
- SVG (.svg)

#### 临时文件处理
对于无法获取原始文件名的临时文件：
- 生成基于时间戳的文件名
- 保持正确的文件扩展名
- 避免与现有文件名冲突

## 技术实现

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
```

### 剪贴板内容处理

```javascript
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
                                const filePathMatch = textContent.match(/([^\\\\/]+\\.(jpg|jpeg|png|gif|bmp|webp|tiff|svg))$/i);
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
            this.log(`检测到剪贴板中有 ${clipboardContent.files.length} 个可导入文件`, 'info');

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
            this.log('剪贴板中没有可导入的内容', 'debug');
        }

    } catch (error) {
        this.log(`处理剪贴板粘贴失败: ${error.message}`, 'error');
    }
}
```

### 文件名智能处理

```javascript
/**
 * 检测剪贴板内容
 * @param {Object} clipboardData - 剪贴板数据
 * @returns {Object|null} 检测结果或null
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
                    const fileName = file.path || file.name;
                    // 改进的临时文件检测逻辑
                    const isTemp = this.isTemporaryFileEnhanced(fileName);

                    result.files.push({
                        name: file.name,
                        path: file.path || file.name,
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
                    this.log(`检测到 ${filePaths.length} 个文件路径`, 'debug');
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
 * 检测是否为临时文件
 * @param {string} filePath - 文件路径
 * @returns {boolean} 是否为临时文件
 */
isTemporaryFile(filePath) {
    if (!filePath) return false;

    const tempKeywords = [
        'temp', 'tmp', 'temporary',
        'screenshot', 'screen shot', 'screen_shot', 'capture',
        'snip', 'clip', 'paste', 'clipboard',
        'appdata\\\\local\\\\temp', 'appdata/local/temp',
        '/tmp/', '/var/tmp/', '/private/tmp/',
        'c:\\\\windows\\\\temp', 'c:/windows/temp',
        '\\\\temp\\\\', '/temp/',
        'snipping tool', 'snipaste', 'lightshot'
    ];

    const pathLower = filePath.toLowerCase();
    return tempKeywords.some(keyword => pathLower.includes(keyword.toLowerCase()));
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
        /^clipboard_image\\.(png|jpg|jpeg|gif|bmp|webp)$/i,
        /^image\\.(png|jpg|jpeg|gif|bmp|webp)$/i,
        /^screenshot\\.(png|jpg|jpeg|gif|bmp|webp)$/i,
        /^capture\\.(png|jpg|jpeg|gif|bmp|webp)$/i,
        /^untitled\\.(png|jpg|jpeg|gif|bmp|webp)$/i
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

### 确认对话框实现

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
            'custom_folder': '指定文件夹'
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
```

## 确认对话框设计

### 功能特点

1. **简洁的文件信息展示**
   - 清晰显示文件名、大小、类型
   - 使用图标区分不同文件类型
   - 提供文件数量统计

2. **实时设置预览**
   - 显示当前导入模式
   - 展示时间轴放置行为
   - 提供设置修改入口

3. **快速操作**
   - 一键导入所有文件
   - 支持取消导入操作
   - 自动超时关闭

### 界面设计

```html
<!-- 剪贴板导入确认对话框 -->
<div class="eagle-confirm-dialog">
    <div class="eagle-confirm-content">
        <div class="eagle-confirm-header">
            <h3>剪贴板导入确认</h3>
        </div>
        <div class="eagle-confirm-body">
            <p>检测到剪贴板中有 2 个可导入文件</p>
            <div class="file-list">
                <div class="file-item-simple">
                    <span class="file-icon">🖼️</span>
                    <span class="file-name" title="screenshot_20250915_143022.png">screenshot_20250915_143022.png</span>
                    <span class="file-size">1.2 MB</span>
                    <span class="file-type">image/png</span>
                </div>
                <div class="file-item-simple">
                    <span class="file-icon">🎬</span>
                    <span class="file-name" title="capture_20250915_143045.jpg">capture_20250915_143045.jpg</span>
                    <span class="file-size">856 KB</span>
                    <span class="file-type">image/jpeg</span>
                </div>
            </div>
            <div class="import-settings-dark">
                <div class="setting-item"><span class="setting-label">导入模式:</span><span class="setting-value">项目旁复制</span></div>
                <div class="setting-item"><span class="setting-label">导入行为:</span><span class="setting-value">当前时间</span></div>
            </div>
        </div>
        <div class="eagle-confirm-actions-flex">
            <button class="btn-outline-primary" id="clipboard-confirm-yes">导入文件</button>
            <button class="btn-outline-secondary" id="clipboard-confirm-no">取消</button>
        </div>
    </div>
</div>
```

## 最佳实践

### 使用建议

#### 高效操作流程
1. 在截图工具中截取图片后直接粘贴到扩展面板
2. 结合快捷键使用，提高工作效率
3. 合理利用自动重命名功能

#### 文件管理
1. 定期清理不需要的临时文件
2. 建立合理的文件命名规范
3. 使用有意义的文件名便于后续查找

#### 质量控制
1. 检查剪贴板图片的质量和分辨率
2. 避免导入过大尺寸的图片
3. 注意图片的版权和使用权限

### 性能优化

#### 剪贴板处理优化
```javascript
// 使用防抖处理避免频繁检查
if (this.clipboardCheckTimeout) {
    clearTimeout(this.clipboardCheckTimeout);
}

this.clipboardCheckTimeout = setTimeout(() => {
    this.performClipboardCheck();
}, 100); // 100ms 防抖延迟
```

#### 文件处理优化
```javascript
// 对于大文件，提供进度反馈
const fileSize = file.size;
if (fileSize > 10 * 1024 * 1024) { // 10MB
    this.showProgressIndicator('处理大文件中...');
}
```

#### 内存管理
```javascript
// 及时释放Blob URL
const url = URL.createObjectURL(blob);
// 使用完后及时释放
setTimeout(() => URL.revokeObjectURL(url), 1000);
```

## 故障排除

### 常见问题

#### 剪贴板导入无响应
- **症状**：按下Ctrl+V后无任何反应
- **解决**：检查扩展面板是否处于激活状态，重启AE

#### 文件名重命名失败
- **症状**：临时文件名未被正确重命名
- **解决**：检查文件名验证逻辑，确保时间戳生成正确

#### 图片格式不支持
- **症状**：某些格式的图片无法导入
- **解决**：检查文件类型检测逻辑，添加缺失的格式支持

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');
```

#### 监控剪贴板事件
```javascript
// 在handleClipboardPaste方法中添加详细日志
this.log(`📋 剪贴板事件: ${event.type}`, 'debug');
this.log(`📋 剪贴板数据类型: ${Array.from(clipboardData.types).join(', ')}`, 'debug');
```

#### 性能监控
```javascript
// 记录处理时间
const startTime = Date.now();
// ... 处理逻辑 ...
const endTime = Date.now();
this.log(`⏱️ 剪贴板处理耗时: ${endTime - startTime}ms`, 'debug');
```

## 兼容性说明

### 操作系统兼容性
- **Windows 10/11**: 完全支持
- **macOS 10.14+**: 完全支持
- **Linux**: 部分支持（依赖浏览器兼容性）

### 浏览器兼容性
- **Chrome 86+**: 完全支持现代剪贴板API
- **Firefox 87+**: 支持基础功能
- **Safari 13.1+**: 支持基础功能
- **Edge 86+**: 完全支持

### AE版本兼容性
- **After Effects CC 2018+**: 完全兼容
- **After Effects 2023+**: 推荐使用