// Demo 模式虚拟文件系统
// 用于在浏览器中模拟文件系统操作，支持持久化存储

/**
 * 虚拟文件系统类
 * 使用 localStorage 作为持久化存储
 */
class DemoFileSystem {
    constructor() {
        this.STORAGE_PREFIX = 'demo_fs_';
        this.FILE_LIST_KEY = 'demo_fs_file_list';
        this.init();
    }

    /**
     * 初始化文件系统
     */
    init() {
        // 确保文件列表存在
        if (!localStorage.getItem(this.FILE_LIST_KEY)) {
            localStorage.setItem(this.FILE_LIST_KEY, JSON.stringify([]));
        }
        console.log('[Demo FS] 虚拟文件系统已初始化');
    }

    /**
     * 获取文件的存储键
     * @param {string} path - 文件路径
     * @returns {string} 存储键
     */
    getStorageKey(path) {
        // 规范化路径
        const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
        return this.STORAGE_PREFIX + normalizedPath;
    }

    /**
     * 写入文件
     * @param {string} path - 文件路径
     * @param {string} content - 文件内容
     * @param {Object} options - 选项
     * @returns {Object} 结果
     */
    writeFile(path, content, options = {}) {
        try {
            const storageKey = this.getStorageKey(path);
            
            // 创建文件元数据
            const fileInfo = {
                path: path,
                size: content.length,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                type: this.getFileType(path)
            };

            // 保存文件内容
            localStorage.setItem(storageKey, content);
            
            // 更新文件列表
            this.updateFileList(path, fileInfo);

            console.log(`[Demo FS] 文件已写入: ${path} (${fileInfo.size} bytes)`);

            return {
                success: true,
                path: path,
                size: fileInfo.size,
                message: `文件已保存: ${path}`
            };
        } catch (error) {
            console.error('[Demo FS] 写入文件失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 读取文件
     * @param {string} path - 文件路径
     * @returns {Object} 结果
     */
    readFile(path) {
        try {
            const storageKey = this.getStorageKey(path);
            const content = localStorage.getItem(storageKey);

            if (content === null) {
                return {
                    success: false,
                    error: `文件不存在: ${path}`
                };
            }

            console.log(`[Demo FS] 文件已读取: ${path} (${content.length} bytes)`);

            return {
                success: true,
                path: path,
                content: content,
                size: content.length
            };
        } catch (error) {
            console.error('[Demo FS] 读取文件失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 检查文件是否存在
     * @param {string} path - 文件路径
     * @returns {boolean} 是否存在
     */
    exists(path) {
        const storageKey = this.getStorageKey(path);
        return localStorage.getItem(storageKey) !== null;
    }

    /**
     * 删除文件
     * @param {string} path - 文件路径
     * @returns {Object} 结果
     */
    deleteFile(path) {
        try {
            const storageKey = this.getStorageKey(path);
            
            if (!this.exists(path)) {
                return {
                    success: false,
                    error: `文件不存在: ${path}`
                };
            }

            localStorage.removeItem(storageKey);
            this.removeFromFileList(path);

            console.log(`[Demo FS] 文件已删除: ${path}`);

            return {
                success: true,
                path: path,
                message: `文件已删除: ${path}`
            };
        } catch (error) {
            console.error('[Demo FS] 删除文件失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 列出所有文件
     * @returns {Array} 文件列表
     */
    listFiles() {
        try {
            const fileListJson = localStorage.getItem(this.FILE_LIST_KEY);
            return fileListJson ? JSON.parse(fileListJson) : [];
        } catch (error) {
            console.error('[Demo FS] 获取文件列表失败:', error);
            return [];
        }
    }

    /**
     * 获取文件信息
     * @param {string} path - 文件路径
     * @returns {Object|null} 文件信息
     */
    getFileInfo(path) {
        const files = this.listFiles();
        return files.find(f => f.path === path) || null;
    }

    /**
     * 更新文件列表
     * @param {string} path - 文件路径
     * @param {Object} fileInfo - 文件信息
     */
    updateFileList(path, fileInfo) {
        let files = this.listFiles();
        
        // 查找是否已存在
        const index = files.findIndex(f => f.path === path);
        
        if (index >= 0) {
            // 更新现有文件
            files[index] = { ...files[index], ...fileInfo, modified: new Date().toISOString() };
        } else {
            // 添加新文件
            files.push(fileInfo);
        }

        localStorage.setItem(this.FILE_LIST_KEY, JSON.stringify(files));
    }

    /**
     * 从文件列表中移除
     * @param {string} path - 文件路径
     */
    removeFromFileList(path) {
        let files = this.listFiles();
        files = files.filter(f => f.path !== path);
        localStorage.setItem(this.FILE_LIST_KEY, JSON.stringify(files));
    }

    /**
     * 获取文件类型
     * @param {string} path - 文件路径
     * @returns {string} 文件类型
     */
    getFileType(path) {
        const ext = path.split('.').pop().toLowerCase();
        const types = {
            'json': 'application/json',
            'txt': 'text/plain',
            'html': 'text/html',
            'css': 'text/css',
            'js': 'application/javascript'
        };
        return types[ext] || 'application/octet-stream';
    }

    /**
     * 下载文件到本地
     * @param {string} path - 文件路径
     * @param {string} downloadName - 下载文件名（可选）
     */
    downloadFile(path, downloadName = null) {
        const result = this.readFile(path);
        
        if (!result.success) {
            console.error('[Demo FS] 下载失败:', result.error);
            return false;
        }

        const fileName = downloadName || path.split('/').pop();
        const fileInfo = this.getFileInfo(path);
        const mimeType = fileInfo ? fileInfo.type : 'application/octet-stream';

        // 创建 Blob
        const blob = new Blob([result.content], { type: mimeType });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        
        // 触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`[Demo FS] 文件已下载: ${fileName}`);
        return true;
    }

    /**
     * 清空所有文件
     */
    clear() {
        const files = this.listFiles();
        files.forEach(file => {
            const storageKey = this.getStorageKey(file.path);
            localStorage.removeItem(storageKey);
        });
        localStorage.setItem(this.FILE_LIST_KEY, JSON.stringify([]));
        console.log('[Demo FS] 虚拟文件系统已清空');
    }

    /**
     * 获取存储使用情况
     * @returns {Object} 存储信息
     */
    getStorageInfo() {
        const files = this.listFiles();
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
        
        return {
            fileCount: files.length,
            totalSize: totalSize,
            totalSizeFormatted: this.formatBytes(totalSize),
            files: files
        };
    }

    /**
     * 格式化字节数
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的字符串
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.demoFileSystem = new DemoFileSystem();
    console.log('[Demo FS] 虚拟文件系统已加载');
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DemoFileSystem;
}
