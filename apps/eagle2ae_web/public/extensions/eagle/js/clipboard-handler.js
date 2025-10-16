// Eagle2Ae - 剪切板文件处理模块
// 监控剪切板变化，自动导入文件到After Effects

class ClipboardHandler {
    constructor(eagle2ae) {
        this.eagle2ae = eagle2ae;
        this.isMonitoring = false;
        this.monitorInterval = null;
        this.lastClipboardContent = null;
        this.checkInterval = 1000; // 每秒检查一次剪切板
        
        // 支持的文件类型
        this.supportedFileTypes = [
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tga', '.webp',
            '.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm',
            '.mp3', '.wav', '.aac', '.flac', '.ogg',
            '.psd', '.ai', '.eps', '.svg',
            '.aep', '.aet' // After Effects项目文件
        ];
        
        this.log('剪切板处理器已初始化');
    }

    // 开始监控剪切板
    startMonitoring() {
        if (this.isMonitoring) {
            this.log('剪切板监控已在运行中');
            return;
        }

        this.isMonitoring = true;
        this.log('开始监控剪切板变化...');

        // 定期检查剪切板内容
        this.monitorInterval = setInterval(async () => {
            await this.checkClipboard();
        }, this.checkInterval);

        // 立即检查一次
        this.checkClipboard();
    }

    // 停止监控剪切板
    stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }

        this.isMonitoring = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        
        this.log('剪切板监控已停止');
    }

    // 检查剪切板内容
    async checkClipboard() {
        try {
            // 先尝试获取剪切板文件路径（更宽松的检测）
            const filePaths = await this.getClipboardFiles();

            // 如果没有找到文件路径，检查是否有特定格式
            if (!filePaths || filePaths.length === 0) {
                const hasFiles = await this.hasClipboardFiles();
                if (!hasFiles) {
                    return;
                }
                // 如果有文件格式但没有提取到路径，记录调试信息
                this.log('检测到剪切板文件格式，但无法提取文件路径', 'warning');
                return;
            }

            // 检查是否是新的剪切板内容
            const currentContent = JSON.stringify(filePaths.sort());
            if (currentContent === this.lastClipboardContent) {
                return; // 内容没有变化
            }

            this.lastClipboardContent = currentContent;
            this.log(`检测到剪切板文件变化: ${filePaths.length} 个文件`);

            // 过滤支持的文件类型
            const supportedFiles = this.filterSupportedFiles(filePaths);
            if (supportedFiles.length === 0) {
                this.log(`剪切板中有 ${filePaths.length} 个文件，但没有支持的文件类型`);
                this.log(`文件列表: ${filePaths.join(', ')}`);
                return;
            }

            // 处理剪切板文件
            await this.handleClipboardFiles(supportedFiles);

        } catch (error) {
            this.log(`检查剪切板失败: ${error.message}`, 'error');
        }
    }

    // 检查剪切板是否有文件
    async hasClipboardFiles() {
        try {
            // 检查是否有文件格式
            if (typeof eagle !== 'undefined' && eagle.clipboard) {
                // 检查常见的文件格式
                const fileFormats = [
                    'Files', // Windows
                    'public.file-url', // macOS
                    'text/uri-list' // 通用
                ];

                for (const format of fileFormats) {
                    if (eagle.clipboard.has(format)) {
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            this.log(`检查剪切板文件失败: ${error.message}`, 'error');
            return false;
        }
    }

    // 获取剪切板文件路径
    async getClipboardFiles() {
        try {
            const filePaths = [];

            if (typeof eagle !== 'undefined' && eagle.clipboard) {
                // 尝试读取文本格式的文件路径
                try {
                    const textContent = await eagle.clipboard.readText();
                    if (textContent) {
                        this.log(`剪切板文本内容: ${textContent.substring(0, 200)}...`);

                        // 检查是否是文件路径
                        const lines = textContent.split('\n').filter(line => line.trim());
                        for (const line of lines) {
                            const trimmedLine = line.trim();
                            if (this.isFilePath(trimmedLine)) {
                                filePaths.push(trimmedLine);
                                this.log(`检测到文件路径: ${trimmedLine}`);
                            }
                        }

                        // 如果没有检测到标准文件路径，尝试更宽松的检测
                        if (filePaths.length === 0) {
                            for (const line of lines) {
                                const trimmedLine = line.trim();
                                // 检查是否包含文件扩展名
                                if (this.containsFileExtension(trimmedLine)) {
                                    filePaths.push(trimmedLine);
                                    this.log(`检测到可能的文件路径: ${trimmedLine}`);
                                }
                            }
                        }
                    }
                } catch (error) {
                    this.log(`读取剪切板文本失败: ${error.message}`, 'warning');
                }

                // 尝试读取HTML格式（可能包含文件链接）
                try {
                    const htmlContent = await eagle.clipboard.readHTML();
                    if (htmlContent) {
                        this.log(`剪切板HTML内容: ${htmlContent.substring(0, 200)}...`);
                        const extractedPaths = this.extractFilePathsFromHTML(htmlContent);
                        filePaths.push(...extractedPaths);
                    }
                } catch (error) {
                    this.log(`读取剪切板HTML失败: ${error.message}`, 'warning');
                }
            }

            const uniquePaths = [...new Set(filePaths)]; // 去重
            if (uniquePaths.length > 0) {
                this.log(`总共检测到 ${uniquePaths.length} 个文件路径`);
            }
            return uniquePaths;
        } catch (error) {
            this.log(`获取剪切板文件失败: ${error.message}`, 'error');
            return [];
        }
    }

    // 检查是否是文件路径
    isFilePath(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }

        // 检查是否是绝对路径
        const isAbsolutePath = /^([a-zA-Z]:\\|\/|\\\\)/.test(text);
        if (!isAbsolutePath) {
            return false;
        }

        // 检查是否有文件扩展名
        const hasExtension = /\.[a-zA-Z0-9]+$/.test(text);
        return hasExtension;
    }

    // 检查是否包含文件扩展名（更宽松的检测）
    containsFileExtension(text) {
        if (!text || typeof text !== 'string') {
            return false;
        }

        // 检查是否包含支持的文件扩展名
        for (const ext of this.supportedFileTypes) {
            if (text.toLowerCase().includes(ext)) {
                return true;
            }
        }
        return false;
    }

    // 从HTML中提取文件路径
    extractFilePathsFromHTML(html) {
        const filePaths = [];
        
        // 匹配文件URL
        const urlRegex = /(?:href|src)=["']([^"']+)["']/gi;
        let match;
        
        while ((match = urlRegex.exec(html)) !== null) {
            const url = match[1];
            if (this.isFilePath(url)) {
                filePaths.push(url);
            }
        }

        return filePaths;
    }

    // 过滤支持的文件类型
    filterSupportedFiles(filePaths) {
        return filePaths.filter(filePath => {
            const ext = this.getFileExtension(filePath).toLowerCase();
            return this.supportedFileTypes.includes(ext);
        });
    }

    // 获取文件扩展名
    getFileExtension(filePath) {
        const lastDot = filePath.lastIndexOf('.');
        return lastDot > 0 ? filePath.substring(lastDot) : '';
    }

    // 处理剪切板文件
    async handleClipboardFiles(filePaths) {
        try {
            this.log(`开始处理 ${filePaths.length} 个剪切板文件`);

            // 验证文件是否存在
            const validFiles = await this.validateFiles(filePaths);
            if (validFiles.length === 0) {
                this.log('没有找到有效的文件');
                return;
            }

            // 显示通知
            if (typeof eagle !== 'undefined' && eagle.notification) {
                eagle.notification.show({
                    title: 'Eagle2Ae - 剪切板导入',
                    body: `检测到 ${validFiles.length} 个文件，正在导入到After Effects...`,
                    mute: false,
                    duration: 3000
                });
            }

            // 创建虚拟的Eagle项目数据结构
            const clipboardItems = validFiles.map((filePath, index) => ({
                id: `clipboard_${Date.now()}_${index}`,
                name: this.getFileName(filePath),
                ext: this.getFileExtension(filePath).substring(1), // 去掉点号
                filePath: filePath,
                size: 0, // 无法获取大小
                tags: ['剪切板导入'],
                folders: [],
                isClipboardImport: true,
                importTime: new Date().toISOString()
            }));

            // 使用现有的文件处理逻辑
            await this.eagle2ae.handleSelectedFiles(clipboardItems);

            this.log(`剪切板文件处理完成: ${validFiles.length} 个文件`);

        } catch (error) {
            this.log(`处理剪切板文件失败: ${error.message}`, 'error');
            
            // 显示错误通知
            if (typeof eagle !== 'undefined' && eagle.notification) {
                eagle.notification.show({
                    title: 'Eagle2Ae - 导入失败',
                    body: `剪切板文件导入失败: ${error.message}`,
                    mute: false,
                    duration: 5000
                });
            }
        }
    }

    // 验证文件是否存在
    async validateFiles(filePaths) {
        const validFiles = [];
        
        for (const filePath of filePaths) {
            try {
                // 使用Node.js fs模块检查文件是否存在
                const fs = require('fs');
                if (fs.existsSync(filePath)) {
                    validFiles.push(filePath);
                } else {
                    this.log(`文件不存在: ${filePath}`, 'warning');
                }
            } catch (error) {
                this.log(`验证文件失败 ${filePath}: ${error.message}`, 'warning');
            }
        }

        return validFiles;
    }

    // 获取文件名
    getFileName(filePath) {
        const path = require('path');
        return path.basename(filePath);
    }

    // 手动触发剪切板检查
    async manualCheck() {
        this.log('手动检查剪切板...');

        // 重置上次内容，强制检查
        const originalContent = this.lastClipboardContent;
        this.lastClipboardContent = null;

        try {
            await this.checkClipboard();

            // 如果没有检测到变化，提供更多调试信息
            if (this.lastClipboardContent === null) {
                this.log('未检测到剪切板内容变化，进行详细检查...');
                await this.debugClipboardContent();
            }
        } finally {
            // 如果检查失败，恢复原来的内容
            if (this.lastClipboardContent === null) {
                this.lastClipboardContent = originalContent;
            }
        }
    }

    // 调试剪切板内容
    async debugClipboardContent() {
        try {
            if (typeof eagle !== 'undefined' && eagle.clipboard) {
                this.log('=== 剪切板调试信息 ===');

                // 检查文本内容
                try {
                    const text = await eagle.clipboard.readText();
                    this.log(`文本内容长度: ${text ? text.length : 0}`);
                    if (text) {
                        this.log(`文本内容预览: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
                    }
                } catch (e) {
                    this.log(`读取文本失败: ${e.message}`, 'warning');
                }

                // 检查HTML内容
                try {
                    const html = await eagle.clipboard.readHTML();
                    this.log(`HTML内容长度: ${html ? html.length : 0}`);
                    if (html) {
                        this.log(`HTML内容预览: ${html.substring(0, 200)}${html.length > 200 ? '...' : ''}`);
                    }
                } catch (e) {
                    this.log(`读取HTML失败: ${e.message}`, 'warning');
                }

                // 检查各种格式
                const formats = ['Files', 'public.file-url', 'text/uri-list', 'text/plain', 'text/html'];
                for (const format of formats) {
                    try {
                        const hasFormat = eagle.clipboard.has(format);
                        this.log(`格式 ${format}: ${hasFormat ? '存在' : '不存在'}`);
                    } catch (e) {
                        this.log(`检查格式 ${format} 失败: ${e.message}`, 'warning');
                    }
                }

                this.log('=== 调试信息结束 ===');
            } else {
                this.log('Eagle clipboard API 不可用', 'error');
            }
        } catch (error) {
            this.log(`调试剪切板内容失败: ${error.message}`, 'error');
        }
    }

    // 获取监控状态
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            checkInterval: this.checkInterval,
            supportedTypes: this.supportedFileTypes.length,
            lastCheck: this.lastClipboardContent ? '有内容' : '无内容'
        };
    }

    // 设置检查间隔
    setCheckInterval(interval) {
        if (interval < 500) {
            interval = 500; // 最小500ms
        }
        
        this.checkInterval = interval;
        this.log(`剪切板检查间隔已设置为: ${interval}ms`);

        // 如果正在监控，重启监控以应用新间隔
        if (this.isMonitoring) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }

    // 日志记录
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[剪切板] ${message}`;
        
        if (this.eagle2ae && this.eagle2ae.log) {
            this.eagle2ae.log(logMessage, type);
        } else {
            console.log(`[${timestamp}] ${logMessage}`);
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClipboardHandler;
} else if (typeof window !== 'undefined') {
    window.ClipboardHandler = ClipboardHandler;
}
