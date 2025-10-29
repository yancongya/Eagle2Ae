# 文件夹打开模块

## 概述

文件夹打开模块（Folder Opener Module）是 Eagle2Ae AE 扩展 v2.4.0 引入的重要功能组件，专门负责处理文件夹的打开操作。该模块支持多种文件夹打开方式，包括项目文件夹、Eagle资源库文件夹、自定义文件夹等，并提供智能路径解析、权限检查、错误处理等功能。

## 核心特性

### 多种文件夹打开方式
- **项目文件夹打开** - 直接打开当前AE项目的文件夹
- **Eagle资源库文件夹打开** - 打开当前连接的Eagle资源库文件夹
- **自定义文件夹打开** - 打开用户指定的任意文件夹
- **最近使用文件夹打开** - 快速打开最近使用的文件夹

### 智能路径解析
- 自动解析文件夹路径，支持相对路径和绝对路径
- 提供路径规范化和验证功能
- 支持跨平台路径处理（Windows/macOS/Linux）

### 权限检查机制
- 检查文件夹访问权限，确保操作安全性
- 验证文件夹是否存在和可访问
- 提供详细的权限错误信息

### 错误处理系统
- 完善的错误捕获和处理机制
- 详细的错误日志记录
- 友好的用户错误提示

### 性能优化
- 使用异步处理避免阻塞UI线程
- 实现路径缓存机制提高响应速度
- 提供批量文件夹打开功能

## 技术实现

### 核心类结构

```javascript
/**
 * 文件夹打开模块
 * 负责处理文件夹打开操作，支持项目文件夹、Eagle资源库文件夹、自定义文件夹等
 */
class FolderOpenerModule {
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
        this.folderCache = new Map();
        this.recentFolders = [];
        this.maxRecentFolders = 10;
        
        // 绑定方法上下文
        this.openProjectFolder = this.openProjectFolder.bind(this);
        this.openEagleLibraryFolder = this.openEagleLibraryFolder.bind(this);
        this.openCustomFolder = this.openCustomFolder.bind(this);
        this.openRecentFolder = this.openRecentFolder.bind(this);
        this.browseFolder = this.browseFolder.bind(this);
        this.validateFolderPath = this.validateFolderPath.bind(this);
        this.normalizeFolderPath = this.normalizeFolderPath.bind(this);
        this.checkFolderPermissions = this.checkFolderPermissions.bind(this);
        this.addToRecentFolders = this.addToRecentFolders.bind(this);
        this.getRecentFolders = this.getRecentFolders.bind(this);
        this.clearRecentFolders = this.clearRecentFolders.bind(this);
        
        this.log('📁 文件夹打开模块已初始化', 'debug');
    }
}
```

### 项目文件夹打开实现

```javascript
/**
 * 打开项目文件夹
 * @returns {Promise<Object>} 打开结果
 */
async openProjectFolder() {
    try {
        this.log('📂 准备打开项目文件夹...', 'info');

        // 首先检查项目状态
        const projectStatusValid = await this.projectStatusChecker.validateProjectStatus({
            requireProject: true,
            requireActiveComposition: false,
            showWarning: true
        });

        if (!projectStatusValid) {
            this.log('❌ 项目状态不满足要求，无法打开项目文件夹', 'warning');
            return {
                success: false,
                error: '项目未打开或状态不满足要求'
            };
        }

        // 获取项目信息
        const projectInfo = await this.aeExtension.getProjectInfo();
        
        if (!projectInfo || !projectInfo.projectPath) {
            this.log('❌ 无法获取项目路径', 'error');
            return {
                success: false,
                error: '无法获取项目路径'
            };
        }

        // 解析项目文件夹路径
        const projectPath = projectInfo.projectPath;
        const projectFolder = this.extractFolderPath(projectPath);
        
        if (!projectFolder || projectFolder.trim() === '') {
            this.log('❌ 无法解析项目文件夹路径', 'error');
            return {
                success: false,
                error: '无法解析项目文件夹路径'
            };
        }

        this.log(`📁 项目文件夹路径: ${projectFolder}`, 'debug');

        // 验证文件夹路径
        const validation = this.validateFolderPath(projectFolder);
        if (!validation.valid) {
            this.log(`❌ 项目文件夹路径验证失败: ${validation.error}`, 'error');
            return {
                success: false,
                error: validation.error
            };
        }

        // 检查文件夹权限
        const permissionCheck = await this.checkFolderPermissions(projectFolder);
        if (!permissionCheck.hasPermission) {
            this.log(`❌ 项目文件夹权限检查失败: ${permissionCheck.error}`, 'error');
            return {
                success: false,
                error: permissionCheck.error
            };
        }

        // 打开文件夹
        const openResult = await this.openFolderReliable(projectFolder);
        
        if (openResult.success) {
            this.log(`✅ 项目文件夹已成功打开: ${projectFolder}`, 'success');
            
            // 添加到最近使用文件夹
            this.addToRecentFolders(projectFolder, 'project');
            
            return {
                success: true,
                folderPath: projectFolder,
                folderType: 'project'
            };
        } else {
            const errorMsg = openResult.error || '未知错误';
            this.log(`❌ 打开项目文件夹失败: ${errorMsg}`, 'error');
            return {
                success: false,
                error: errorMsg
            };
        }

    } catch (error) {
        this.log(`💥 打开项目文件夹异常: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 从文件路径中提取文件夹路径
 * @param {string} filePath - 文件路径
 * @returns {string} 文件夹路径
 */
extractFolderPath(filePath) {
    try {
        if (!filePath || typeof filePath !== 'string') {
            return '';
        }

        // 规范化路径分隔符
        let normalizedPath = filePath.replace(/\\\\/g, '/');

        // 移除文件名部分（最后一个斜杠后面的部分）
        const lastSlashIndex = normalizedPath.lastIndexOf('/');
        if (lastSlashIndex !== -1) {
            normalizedPath = normalizedPath.substring(0, lastSlashIndex);
        }

        // 处理Windows驱动器路径
        if (normalizedPath.includes(':') && !normalizedPath.includes('/')) {
            // 可能是驱动器根路径，如 "C:"
            normalizedPath = normalizedPath + '/';
        }

        return normalizedPath;

    } catch (error) {
        this.log(`提取文件夹路径失败: ${error.message}`, 'error');
        return filePath;
    }
}
```

### Eagle资源库文件夹打开实现

```javascript
/**
 * 打开Eagle资源库文件夹
 * @returns {Promise<Object>} 打开结果
 */
async openEagleLibraryFolder() {
    try {
        this.log('📂 准备打开Eagle资源库文件夹...', 'info');

        // 检查Eagle连接状态
        const eagleConnection = await this.aeExtension.checkEagleConnection();
        
        if (!eagleConnection.connected) {
            this.log('❌ Eagle未连接，无法打开资源库文件夹', 'warning');
            return {
                success: false,
                error: 'Eagle未连接'
            };
        }

        // 获取Eagle信息
        const eagleInfo = await this.aeExtension.getEagleInfo();
        
        if (!eagleInfo || !eagleInfo.libraryPath) {
            this.log('❌ 无法获取Eagle资源库路径', 'error');
            return {
                success: false,
                error: '无法获取Eagle资源库路径'
            };
        }

        const libraryPath = eagleInfo.libraryPath;
        this.log(`📁 Eagle资源库路径: ${libraryPath}`, 'debug');

        // 验证文件夹路径
        const validation = this.validateFolderPath(libraryPath);
        if (!validation.valid) {
            this.log(`❌ Eagle资源库路径验证失败: ${validation.error}`, 'error');
            return {
                success: false,
                error: validation.error
            };
        }

        // 检查文件夹权限
        const permissionCheck = await this.checkFolderPermissions(libraryPath);
        if (!permissionCheck.hasPermission) {
            this.log(`❌ Eagle资源库权限检查失败: ${permissionCheck.error}`, 'error');
            return {
                success: false,
                error: permissionCheck.error
            };
        }

        // 打开文件夹
        const openResult = await this.openFolderReliable(libraryPath);
        
        if (openResult.success) {
            this.log(`✅ Eagle资源库文件夹已成功打开: ${libraryPath}`, 'success');
            
            // 添加到最近使用文件夹
            this.addToRecentFolders(libraryPath, 'eagle_library');
            
            return {
                success: true,
                folderPath: libraryPath,
                folderType: 'eagle_library'
            };
        } else {
            const errorMsg = openResult.error || '未知错误';
            this.log(`❌ 打开Eagle资源库文件夹失败: ${errorMsg}`, 'error');
            return {
                success: false,
                error: errorMsg
            };
        }

    } catch (error) {
        this.log(`💥 打开Eagle资源库文件夹异常: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}
```

### 自定义文件夹打开实现

```javascript
/**
 * 打开自定义文件夹
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Object>} 打开结果
 */
async openCustomFolder(folderPath = null) {
    try {
        this.log('📂 准备打开自定义文件夹...', 'info');

        let targetFolderPath = folderPath;

        // 如果没有提供路径，让用户选择
        if (!targetFolderPath) {
            const browseResult = await this.browseFolder();
            
            if (!browseResult.success) {
                const errorMsg = browseResult.error || '用户取消了文件夹选择';
                this.log(`❌ 文件夹选择失败: ${errorMsg}`, 'warning');
                return {
                    success: false,
                    error: errorMsg
                };
            }
            
            targetFolderPath = browseResult.folderPath;
        }

        if (!targetFolderPath || targetFolderPath.trim() === '') {
            this.log('❌ 未提供有效的文件夹路径', 'error');
            return {
                success: false,
                error: '未提供有效的文件夹路径'
            };
        }

        this.log(`📁 自定义文件夹路径: ${targetFolderPath}`, 'debug');

        // 规范化路径
        const normalizedPath = this.normalizeFolderPath(targetFolderPath);
        
        // 验证文件夹路径
        const validation = this.validateFolderPath(normalizedPath);
        if (!validation.valid) {
            this.log(`❌ 自定义文件夹路径验证失败: ${validation.error}`, 'error');
            return {
                success: false,
                error: validation.error
            };
        }

        // 检查文件夹权限
        const permissionCheck = await this.checkFolderPermissions(normalizedPath);
        if (!permissionCheck.hasPermission) {
            this.log(`❌ 自定义文件夹权限检查失败: ${permissionCheck.error}`, 'error');
            return {
                success: false,
                error: permissionCheck.error
            };
        }

        // 打开文件夹
        const openResult = await this.openFolderReliable(normalizedPath);
        
        if (openResult.success) {
            this.log(`✅ 自定义文件夹已成功打开: ${normalizedPath}`, 'success');
            
            // 添加到最近使用文件夹
            this.addToRecentFolders(normalizedPath, 'custom');
            
            return {
                success: true,
                folderPath: normalizedPath,
                folderType: 'custom'
            };
        } else {
            const errorMsg = openResult.error || '未知错误';
            this.log(`❌ 打开自定义文件夹失败: ${errorMsg}`, 'error');
            return {
                success: false,
                error: errorMsg
            };
        }

    } catch (error) {
        this.log(`💥 打开自定义文件夹异常: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 浏览文件夹
 * @returns {Promise<Object>} 浏览结果
 */
async browseFolder() {
    try {
        this.log('🔍 显示文件夹选择对话框...', 'info');

        // 检查是否为Demo模式
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：使用虚拟文件夹选择', 'debug');
            
            // Demo模式：使用虚拟文件夹选择器
            if (window.demoFileSystem) {
                const result = window.demoFileSystem.showFolderPicker({
                    title: '选择文件夹',
                    mode: 'selectFolder'
                });
                
                if (result.success) {
                    this.log(`✅ 虚拟文件夹选择成功: ${result.folderPath}`, 'success');
                    return {
                        success: true,
                        folderPath: result.folderPath
                    };
                } else {
                    const errorMsg = result.error || '用户取消了文件夹选择';
                    this.log(`❌ 虚拟文件夹选择失败: ${errorMsg}`, 'warning');
                    return {
                        success: false,
                        error: errorMsg
                    };
                }
            } else {
                // 降级：使用简单的输入框
                const folderPath = prompt('请输入文件夹路径:');
                if (folderPath && folderPath.trim() !== '') {
                    this.log(`✅ 用户输入文件夹路径: ${folderPath}`, 'success');
                    return {
                        success: true,
                        folderPath: folderPath.trim()
                    };
                } else {
                    this.log('❌ 用户取消了文件夹输入', 'warning');
                    return {
                        success: false,
                        error: '用户取消了文件夹选择'
                    };
                }
            }
        }

        // CEP模式：使用ExtendScript文件夹选择器
        const result = await this.aeExtension.executeExtendScript('selectFolder', {
            title: '选择文件夹',
            mode: 'selectFolder'
        });

        if (result && result.success && result.folderPath) {
            this.log(`✅ 文件夹选择成功: ${result.folderPath}`, 'success');
            return {
                success: true,
                folderPath: result.folderPath
            };
        } else {
            const errorMsg = result && result.error ? result.error : '用户取消了文件夹选择';
            this.log(`❌ 文件夹选择失败: ${errorMsg}`, 'warning');
            return {
                success: false,
                error: errorMsg
            };
        }

    } catch (error) {
        this.log(`💥 文件夹选择异常: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}
```

### 最近使用文件夹实现

```javascript
/**
 * 打开最近使用的文件夹
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Object>} 打开结果
 */
async openRecentFolder(folderPath) {
    try {
        this.log(`📂 准备打开最近使用的文件夹: ${folderPath}`, 'info');

        if (!folderPath || folderPath.trim() === '') {
            this.log('❌ 未提供有效的文件夹路径', 'error');
            return {
                success: false,
                error: '未提供有效的文件夹路径'
            };
        }

        // 验证文件夹路径
        const validation = this.validateFolderPath(folderPath);
        if (!validation.valid) {
            this.log(`❌ 最近使用文件夹路径验证失败: ${validation.error}`, 'error');
            return {
                success: false,
                error: validation.error
            };
        }

        // 检查文件夹权限
        const permissionCheck = await this.checkFolderPermissions(folderPath);
        if (!permissionCheck.hasPermission) {
            this.log(`❌ 最近使用文件夹权限检查失败: ${permissionCheck.error}`, 'error');
            return {
                success: false,
                error: permissionCheck.error
            };
        }

        // 打开文件夹
        const openResult = await this.openFolderReliable(folderPath);
        
        if (openResult.success) {
            this.log(`✅ 最近使用文件夹已成功打开: ${folderPath}`, 'success');
            
            // 更新最近使用文件夹列表（移到顶部）
            this.addToRecentFolders(folderPath, 'recent');
            
            return {
                success: true,
                folderPath: folderPath,
                folderType: 'recent'
            };
        } else {
            const errorMsg = openResult.error || '未知错误';
            this.log(`❌ 打开最近使用文件夹失败: ${errorMsg}`, 'error');
            return {
                success: false,
                error: errorMsg
            };
        }

    } catch (error) {
        this.log(`💥 打开最近使用文件夹异常: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 添加到最近使用文件夹列表
 * @param {string} folderPath - 文件夹路径
 * @param {string} folderType - 文件夹类型
 */
addToRecentFolders(folderPath, folderType = 'unknown') {
    try {
        if (!folderPath || folderPath.trim() === '') {
            return;
        }

        const normalizedPath = this.normalizeFolderPath(folderPath);

        // 移除已存在的相同路径
        this.recentFolders = this.recentFolders.filter(folder => 
            folder.path !== normalizedPath
        );

        // 添加到列表开头
        this.recentFolders.unshift({
            path: normalizedPath,
            type: folderType,
            timestamp: Date.now()
        });

        // 限制列表长度
        if (this.recentFolders.length > this.maxRecentFolders) {
            this.recentFolders = this.recentFolders.slice(0, this.maxRecentFolders);
        }

        // 保存到localStorage
        try {
            localStorage.setItem('ae_extension_recent_folders', JSON.stringify(this.recentFolders));
        } catch (storageError) {
            this.log(`⚠️ 无法保存最近文件夹到localStorage: ${storageError.message}`, 'warning');
        }

        this.log(`📁 已添加到最近使用文件夹: ${normalizedPath} (${folderType})`, 'debug');

        // 触发最近文件夹变更事件
        this.emit('recentFoldersChanged', {
            folders: this.recentFolders,
            added: normalizedPath,
            type: folderType
        });

    } catch (error) {
        this.log(`添加最近使用文件夹失败: ${error.message}`, 'error');
    }
}

/**
 * 获取最近使用文件夹列表
 * @returns {Array} 最近使用文件夹列表
 */
getRecentFolders() {
    try {
        // 尝试从localStorage加载
        const savedFolders = localStorage.getItem('ae_extension_recent_folders');
        if (savedFolders) {
            const parsedFolders = JSON.parse(savedFolders);
            if (Array.isArray(parsedFolders)) {
                this.recentFolders = parsedFolders;
                this.log(`📁 已从localStorage加载 ${parsedFolders.length} 个最近使用文件夹`, 'debug');
            }
        }

        return [...this.recentFolders];

    } catch (error) {
        this.log(`获取最近使用文件夹失败: ${error.message}`, 'error');
        return [];
    }
}

/**
 * 清除最近使用文件夹列表
 */
clearRecentFolders() {
    try {
        this.recentFolders = [];
        
        // 清除localStorage
        try {
            localStorage.removeItem('ae_extension_recent_folders');
        } catch (storageError) {
            this.log(`⚠️ 无法清除localStorage中的最近文件夹: ${storageError.message}`, 'warning');
        }

        this.log('📁 最近使用文件夹列表已清除', 'debug');

        // 触发最近文件夹变更事件
        this.emit('recentFoldersChanged', {
            folders: [],
            cleared: true
        });

    } catch (error) {
        this.log(`清除最近使用文件夹失败: ${error.message}`, 'error');
    }
}
```

### 路径验证实现

```javascript
/**
 * 验证文件夹路径
 * @param {string} folderPath - 文件夹路径
 * @returns {Object} 验证结果
 */
validateFolderPath(folderPath) {
    try {
        if (!folderPath || typeof folderPath !== 'string') {
            return {
                valid: false,
                error: '文件夹路径必须是字符串'
            };
        }

        const path = folderPath.trim();

        if (path === '') {
            return {
                valid: false,
                error: '文件夹路径不能为空'
            };
        }

        // 检查路径是否包含非法字符
        const invalidChars = /[<>:"|?*\x00-\x1f]/;
        if (invalidChars.test(path)) {
            return {
                valid: false,
                error: '文件夹路径包含非法字符'
            };
        }

        // 检查路径长度
        if (path.length > 260) {
            return {
                valid: false,
                error: '文件夹路径过长'
            };
        }

        // 检查是否为保留名称
        const reservedNames = [
            'CON', 'PRN', 'AUX', 'NUL',
            'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
            'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
        ];

        const pathParts = path.split(/[\\\\/]/);
        const fileName = pathParts[pathParts.length - 1].toUpperCase();
        
        if (reservedNames.includes(fileName)) {
            return {
                valid: false,
                error: '文件夹名称是系统保留名称'
            };
        }

        // 检查路径格式
        if (path.startsWith('[已选择]')) {
            return {
                valid: false,
                error: '文件夹路径格式无效'
            };
        }

        return {
            valid: true
        };

    } catch (error) {
        return {
            valid: false,
            error: `路径验证异常: ${error.message}`
        };
    }
}

/**
 * 规范化文件夹路径
 * @param {string} folderPath - 文件夹路径
 * @returns {string} 规范化后的路径
 */
normalizeFolderPath(folderPath) {
    try {
        if (!folderPath || typeof folderPath !== 'string') {
            return '';
        }

        let normalizedPath = folderPath.trim();

        // 规范化路径分隔符
        normalizedPath = normalizedPath.replace(/\\\\/g, '/');

        // 移除末尾的斜杠（除非是根路径）
        if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
            normalizedPath = normalizedPath.slice(0, -1);
        }

        // 处理相对路径
        if (normalizedPath.startsWith('./') || normalizedPath.startsWith('../')) {
            // 尝试解析相对路径为绝对路径
            try {
                const absolutePath = new URL(normalizedPath, window.location.href).pathname;
                normalizedPath = absolutePath;
            } catch (urlError) {
                // 如果URL解析失败，保持原路径
                this.log(`相对路径解析失败: ${urlError.message}`, 'warning');
            }
        }

        // 处理Windows路径
        if (normalizedPath.includes(':')) {
            normalizedPath = normalizedPath.replace(/\//g, '\\\\');
        }

        return normalizedPath;

    } catch (error) {
        this.log(`规范化文件夹路径失败: ${error.message}`, 'error');
        return folderPath;
    }
}
```

### 权限检查实现

```javascript
/**
 * 检查文件夹权限
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Object>} 权限检查结果
 */
async checkFolderPermissions(folderPath) {
    try {
        this.log(`🔐 开始检查文件夹权限: ${folderPath}`, 'debug');

        // 检查是否为Demo模式
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：虚拟权限检查', 'debug');
            
            // Demo模式：虚拟权限检查
            if (window.demoFileSystem) {
                const result = window.demoFileSystem.checkFolderPermissions(folderPath);
                
                if (result.success) {
                    this.log(`✅ 虚拟权限检查通过: ${folderPath}`, 'debug');
                    return {
                        hasPermission: true,
                        readable: true,
                        writable: true,
                        executable: true
                    };
                } else {
                    const errorMsg = result.error || '权限检查失败';
                    this.log(`❌ 虚拟权限检查失败: ${errorMsg}`, 'warning');
                    return {
                        hasPermission: false,
                        error: errorMsg
                    };
                }
            } else {
                // 降级：假设权限通过
                this.log('⚠️ Demo模式：假设权限通过', 'debug');
                return {
                    hasPermission: true,
                    readable: true,
                    writable: true,
                    executable: true
                };
            }
        }

        // CEP模式：使用ExtendScript检查权限
        const params = {
            folderPath: folderPath
        };

        const result = await this.aeExtension.executeExtendScript('checkFolderPermissions', params);

        if (result && result.success) {
            const permissions = result.permissions || {};
            
            this.log(`✅ 权限检查通过: ${folderPath}`, 'debug');
            
            return {
                hasPermission: true,
                readable: permissions.readable !== false,
                writable: permissions.writable !== false,
                executable: permissions.executable !== false,
                details: permissions
            };
        } else {
            const errorMsg = result && result.error ? result.error : '权限检查失败';
            this.log(`❌ 权限检查失败: ${errorMsg}`, 'warning');
            
            return {
                hasPermission: false,
                error: errorMsg
            };
        }

    } catch (error) {
        this.log(`💥 权限检查异常: ${error.message}`, 'error');
        return {
            hasPermission: false,
            error: error.message
        };
    }
}
```

### 可靠的文件夹打开实现

```javascript
/**
 * 可靠地打开文件夹（跨平台）
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Object>} 打开结果
 */
async openFolderReliable(folderPath) {
    try {
        this.log(`📂 尝试可靠地打开文件夹: ${folderPath}`, 'debug');

        // 检查是否为Demo模式
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：使用虚拟文件夹打开', 'debug');
            
            // Demo模式：使用虚拟文件系统打开文件夹
            if (window.demoFileSystem) {
                const result = window.demoFileSystem.openFolder(folderPath);
                
                if (result.success) {
                    this.log(`✅ 虚拟文件夹已打开: ${folderPath}`, 'success');
                    return {
                        success: true,
                        folderPath: folderPath
                    };
                } else {
                    const errorMsg = result.error || '打开文件夹失败';
                    this.log(`❌ 虚拟文件夹打开失败: ${errorMsg}`, 'error');
                    return {
                        success: false,
                        error: errorMsg
                    };
                }
            } else {
                // 降级：复制路径到剪贴板
                try {
                    await navigator.clipboard.writeText(folderPath);
                    this.log(`📋 文件夹路径已复制到剪贴板: ${folderPath}`, 'success');
                    return {
                        success: true,
                        folderPath: folderPath,
                        copiedToClipboard: true
                    };
                } catch (clipboardError) {
                    this.log(`❌ 复制路径到剪贴板失败: ${clipboardError.message}`, 'error');
                    return {
                        success: false,
                        error: `无法打开文件夹，请手动复制路径: ${clipboardError.message}`
                    };
                }
            }
        }

        // CEP模式：使用ExtendScript打开文件夹
        const params = {
            folderPath: folderPath
        };

        const result = await this.aeExtension.executeExtendScript('openFolder', params);

        if (result && result.success) {
            this.log(`✅ 文件夹已成功打开: ${folderPath}`, 'success');
            return {
                success: true,
                folderPath: folderPath
            };
        } else {
            const errorMsg = result && result.error ? result.error : '打开文件夹失败';
            this.log(`❌ 文件夹打开失败: ${errorMsg}`, 'error');
            
            // 尝试降级方案：复制路径到剪贴板
            try {
                await navigator.clipboard.writeText(folderPath);
                this.log(`📋 文件夹路径已复制到剪贴板: ${folderPath}`, 'info');
                return {
                    success: false,
                    error: `${errorMsg}，但路径已复制到剪贴板，请手动打开文件夹`
                };
            } catch (clipboardError) {
                this.log(`❌ 复制路径到剪贴板失败: ${clipboardError.message}`, 'error');
                return {
                    success: false,
                    error: `${errorMsg}，也无法复制路径到剪贴板`
                };
            }
        }

    } catch (error) {
        this.log(`💥 打开文件夹异常: ${error.message}`, 'error');
        
        // 降级方案：复制路径到剪贴板
        try {
            await navigator.clipboard.writeText(folderPath);
            this.log(`📋 文件夹路径已复制到剪贴板: ${folderPath}`, 'info');
            return {
                success: false,
                error: `打开文件夹异常: ${error.message}，但路径已复制到剪贴板`
            };
        } catch (clipboardError) {
            this.log(`❌ 复制路径到剪贴板失败: ${clipboardError.message}`, 'error');
            return {
                success: false,
                error: `打开文件夹异常: ${error.message}，也无法复制路径到剪贴板`
            };
        }
    }
}
```

## API参考

### 核心方法

#### FolderOpenerModule
文件夹打开模块主类

```javascript
/**
 * 文件夹打开模块
 * 负责处理文件夹打开操作，支持项目文件夹、Eagle资源库文件夹、自定义文件夹等
 */
class FolderOpenerModule
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

#### openProjectFolder()
打开项目文件夹

```javascript
/**
 * 打开项目文件夹
 * @returns {Promise<Object>} 打开结果
 */
async openProjectFolder()
```

#### openEagleLibraryFolder()
打开Eagle资源库文件夹

```javascript
/**
 * 打开Eagle资源库文件夹
 * @returns {Promise<Object>} 打开结果
 */
async openEagleLibraryFolder()
```

#### openCustomFolder()
打开自定义文件夹

```javascript
/**
 * 打开自定义文件夹
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Object>} 打开结果
 */
async openCustomFolder(folderPath = null)
```

#### openRecentFolder()
打开最近使用的文件夹

```javascript
/**
 * 打开最近使用的文件夹
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Object>} 打开结果
 */
async openRecentFolder(folderPath)
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

#### addToRecentFolders()
添加到最近使用文件夹列表

```javascript
/**
 * 添加到最近使用文件夹列表
 * @param {string} folderPath - 文件夹路径
 * @param {string} folderType - 文件夹类型
 */
addToRecentFolders(folderPath, folderType = 'unknown')
```

#### getRecentFolders()
获取最近使用文件夹列表

```javascript
/**
 * 获取最近使用文件夹列表
 * @returns {Array} 最近使用文件夹列表
 */
getRecentFolders()
```

#### clearRecentFolders()
清除最近使用文件夹列表

```javascript
/**
 * 清除最近使用文件夹列表
 */
clearRecentFolders()
```

#### validateFolderPath()
验证文件夹路径

```javascript
/**
 * 验证文件夹路径
 * @param {string} folderPath - 文件夹路径
 * @returns {Object} 验证结果
 */
validateFolderPath(folderPath)
```

#### normalizeFolderPath()
规范化文件夹路径

```javascript
/**
 * 规范化文件夹路径
 * @param {string} folderPath - 文件夹路径
 * @returns {string} 规范化后的路径
 */
normalizeFolderPath(folderPath)
```

#### checkFolderPermissions()
检查文件夹权限

```javascript
/**
 * 检查文件夹权限
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Object>} 权限检查结果
 */
async checkFolderPermissions(folderPath)
```

#### openFolderReliable()
可靠地打开文件夹（跨平台）

```javascript
/**
 * 可靠地打开文件夹（跨平台）
 * @param {string} folderPath - 文件夹路径
 * @returns {Promise<Object>} 打开结果
 */
async openFolderReliable(folderPath)
```

### 辅助方法

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

#### addValidator()
添加字段验证器

```javascript
/**
 * 添加字段验证器
 * @param {string} fieldPath - 字段路径
 * @param {Function} validator - 验证函数
 */
addValidator(fieldPath, validator)
```

#### removeValidator()
移除字段验证器

```javascript
/**
 * 移除字段验证器
 * @param {string} fieldPath - 字段路径
 */
removeValidator(fieldPath)
```

#### addMigration()
添加设置迁移规则

```javascript
/**
 * 添加设置迁移规则
 * @param {number} version - 目标版本号
 * @param {Function} migration - 迁移函数
 */
addMigration(version, migration)
```

#### applyMigrations()
应用设置迁移

```javascript
/**
 * 应用设置迁移
 * @param {Object} settings - 要迁移的设置
 * @returns {Object} 迁移后的设置
 */
applyMigrations(settings)
```

#### validateSettings()
验证设置

```javascript
/**
 * 验证设置
 * @param {Object} settings - 要验证的设置
 * @returns {Object} 验证结果
 */
validateSettings(settings)
```

#### validateField()
验证特定字段

```javascript
/**
 * 验证特定字段
 * @param {string} fieldPath - 字段路径
 * @param {*} value - 字段值
 * @returns {Object} 验证结果
 */
validateField(fieldPath, value)
```

#### saveSettings()
保存设置

```javascript
/**
 * 保存设置
 * @param {Object} settings - 要保存的设置
 * @param {boolean} silent - 是否静默保存
 * @returns {Object} 保存结果
 */
saveSettings(settings, silent = false)
```

#### loadSettings()
加载设置

```javascript
/**
 * 加载设置
 * @returns {Object|null} 设置对象或null
 */
loadSettings()
```

#### savePreferences()
保存用户偏好

```javascript
/**
 * 保存用户偏好
 * @param {Object} preferences - 用户偏好
 * @param {boolean} silent - 是否静默保存
 * @returns {Object} 保存结果
 */
savePreferences(preferences, silent = false)
```

#### loadPreferences()
加载用户偏好

```javascript
/**
 * 加载用户偏好
 * @returns {Object|null} 用户偏好对象或null
 */
loadPreferences()
```

#### resetSettings()
重置设置

```javascript
/**
 * 重置设置
 * @returns {Object} 重置结果
 */
resetSettings()
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

#### emit()
触发事件

```javascript
/**
 * 触发事件
 * @param {string} eventType - 事件类型
 * @param {*} data - 事件数据
 */
emit(eventType, data)
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

## 使用示例

### 基本使用

#### 打开项目文件夹
```javascript
// 打开当前AE项目的文件夹
const projectFolderResult = await folderOpenerModule.openProjectFolder();

if (projectFolderResult.success) {
    console.log(`✅ 项目文件夹已打开: ${projectFolderResult.folderPath}`);
} else {
    console.error(`❌ 打开项目文件夹失败: ${projectFolderResult.error}`);
}
```

#### 打开Eagle资源库文件夹
```javascript
// 打开当前连接的Eagle资源库文件夹
const eagleFolderResult = await folderOpenerModule.openEagleLibraryFolder();

if (eagleFolderResult.success) {
    console.log(`✅ Eagle资源库文件夹已打开: ${eagleFolderResult.folderPath}`);
} else {
    console.error(`❌ 打开Eagle资源库文件夹失败: ${eagleFolderResult.error}`);
}
```

#### 打开自定义文件夹
```javascript
// 打开指定路径的文件夹
const customFolderResult = await folderOpenerModule.openCustomFolder('/path/to/folder');

if (customFolderResult.success) {
    console.log(`✅ 自定义文件夹已打开: ${customFolderResult.folderPath}`);
} else {
    console.error(`❌ 打开自定义文件夹失败: ${customFolderResult.error}`);
}

// 或者让用户选择文件夹
const browseResult = await folderOpenerModule.openCustomFolder();

if (browseResult.success) {
    console.log(`✅ 用户选择的文件夹已打开: ${browseResult.folderPath}`);
} else {
    console.error(`❌ 打开用户选择的文件夹失败: ${browseResult.error}`);
}
```

#### 打开最近使用的文件夹
```javascript
// 获取最近使用的文件夹列表
const recentFolders = folderOpenerModule.getRecentFolders();

// 打开第一个最近使用的文件夹
if (recentFolders.length > 0) {
    const recentFolderResult = await folderOpenerModule.openRecentFolder(recentFolders[0].path);
    
    if (recentFolderResult.success) {
        console.log(`✅ 最近使用的文件夹已打开: ${recentFolderResult.folderPath}`);
    } else {
        console.error(`❌ 打开最近使用的文件夹失败: ${recentFolderResult.error}`);
    }
}
```

### 高级使用

#### 批量打开文件夹
```javascript
// 批量打开多个文件夹
async function batchOpenFolders(folderPaths) {
    const results = [];
    
    for (const folderPath of folderPaths) {
        try {
            const result = await folderOpenerModule.openCustomFolder(folderPath);
            results.push({
                folderPath: folderPath,
                success: result.success,
                error: result.error
            });
            
            // 添加小延迟避免系统阻塞
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            results.push({
                folderPath: folderPath,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

// 使用示例
const folderPaths = [
    '/path/to/folder1',
    '/path/to/folder2',
    '/path/to/folder3'
];

const batchResults = await batchOpenFolders(folderPaths);
console.log('批量打开文件夹结果:', batchResults);
```

#### 添加字段监听器
```javascript
// 监听最近文件夹变更
const removeListener = folderOpenerModule.addFieldListener('recentFolders', (newValue, oldValue, fieldPath) => {
    console.log(`📁 最近文件夹列表已变更: ${fieldPath}`);
    console.log('新值:', newValue);
    console.log('旧值:', oldValue);
    
    // 更新UI显示
    updateRecentFoldersUI(newValue);
});

// 使用完成后移除监听器
// removeListener();

// 添加一次性监听器
folderOpenerModule.addFieldListener('recentFolders', (newValue, oldValue, fieldPath) => {
    console.log(`📁 最近文件夹列表一次性变更: ${fieldPath}`);
}, true); // 第三个参数设为true表示一次性监听
```

#### 自定义验证器
```javascript
// 添加自定义文件夹路径验证器
folderOpenerModule.addValidator('customFolderPath', (value) => {
    if (!value || typeof value !== 'string') {
        return {
            valid: false,
            error: '自定义文件夹路径必须是字符串'
        };
    }
    
    // 检查路径是否包含非法字符
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(value)) {
        return {
            valid: false,
            error: '文件夹路径包含非法字符'
        };
    }
    
    // 检查路径长度
    if (value.length > 255) {
        return {
            valid: false,
            error: '文件夹路径过长'
        };
    }
    
    return {
        valid: true
    };
});

// 验证字段
const validation = folderOpenerModule.validateField('customFolderPath', '/valid/path/to/folder');
if (!validation.valid) {
    console.error(`验证失败: ${validation.error}`);
}
```

#### 设置迁移
```javascript
// 添加版本1到版本2的迁移规则
folderOpenerModule.addMigration(2, (oldSettings) => {
    const newSettings = { ...oldSettings };
    
    // 迁移旧字段名
    if (oldSettings.hasOwnProperty('folderPath')) {
        newSettings.customFolderPath = oldSettings.folderPath;
        delete newSettings.folderPath;
    }
    
    // 设置默认值
    if (!newSettings.recentFolders) {
        newSettings.recentFolders = [];
    }
    
    return newSettings;
});

// 应用迁移
const migratedSettings = folderOpenerModule.applyMigrations(oldSettings);
```

## 最佳实践

### 使用建议

#### 文件夹路径处理
```javascript
// 正确处理文件夹路径
function handleFolderPath(folderPath) {
    // 1. 规范化路径
    const normalizedPath = folderOpenerModule.normalizeFolderPath(folderPath);
    
    // 2. 验证路径
    const validation = folderOpenerModule.validateFolderPath(normalizedPath);
    if (!validation.valid) {
        throw new Error(validation.error);
    }
    
    // 3. 检查权限
    const permissionCheck = await folderOpenerModule.checkFolderPermissions(normalizedPath);
    if (!permissionCheck.hasPermission) {
        throw new Error(permissionCheck.error);
    }
    
    // 4. 打开文件夹
    const openResult = await folderOpenerModule.openFolderReliable(normalizedPath);
    return openResult;
}
```

#### 错误处理
```javascript
// 完善的错误处理
async function safeOpenFolder(folderPath) {
    try {
        const result = await folderOpenerModule.openCustomFolder(folderPath);
        
        if (result.success) {
            // 成功处理
            console.log(`✅ 文件夹已成功打开: ${result.folderPath}`);
            
            // 添加到最近使用文件夹
            folderOpenerModule.addToRecentFolders(result.folderPath, 'custom');
            
            return result;
        } else {
            // 失败处理
            console.error(`❌ 打开文件夹失败: ${result.error}`);
            
            // 提供用户友好的错误提示
            showUserFriendlyError('文件夹打开失败', result.error);
            
            return result;
        }
        
    } catch (error) {
        // 异常处理
        console.error(`💥 打开文件夹异常: ${error.message}`);
        
        // 记录详细错误日志
        folderOpenerModule.log(`文件夹打开异常: ${error.message}`, 'error');
        folderOpenerModule.log(`异常堆栈: ${error.stack}`, 'debug');
        
        // 显示错误提示
        showUserFriendlyError('文件夹打开异常', error.message);
        
        throw error;
    }
}
```

#### 性能优化
```javascript
// 使用防抖避免频繁操作
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

// 防抖处理文件夹打开
const debouncedOpenFolder = debounce((folderPath) => {
    folderOpenerModule.openCustomFolder(folderPath);
}, 300);
```

### 内存管理

#### 及时清理资源
```javascript
// 清理文件夹打开模块资源
function cleanupFolderOpenerModule() {
    // 移除所有字段监听器
    folderOpenerModule.fieldListeners.clear();
    
    // 清理缓存
    folderOpenerModule.folderCache.clear();
    
    // 清理最近文件夹列表
    folderOpenerModule.recentFolders = [];
    
    // 清理变更监听器
    folderOpenerModule.changeListeners = [];
    
    // 清理验证器
    folderOpenerModule.validators.clear();
    
    // 清理迁移规则
    folderOpenerModule.migrations.clear();
    
    folderOpenerModule.log('📁 文件夹打开模块资源已清理', 'debug');
}

// 在组件销毁时调用
window.addEventListener('beforeunload', cleanupFolderOpenerModule);
```

#### 缓存优化
```javascript
// 实现智能缓存清理
class SmartFolderOpenerModule extends FolderOpenerModule {
    constructor(aeExtension) {
        super(aeExtension);
        this.cacheTimeouts = new Map();
        this.maxCacheSize = 100;
    }
    
    /**
     * 智能缓存文件夹权限检查结果
     * @param {string} folderPath - 文件夹路径
     * @param {Object} permissionResult - 权限检查结果
     * @param {number} timeout - 超时时间（毫秒）
     */
    smartCacheFolderPermissions(folderPath, permissionResult, timeout = 30000) {
        // 添加到缓存
        this.folderCache.set(folderPath, {
            data: permissionResult,
            timestamp: Date.now(),
            expiry: Date.now() + timeout
        });
        
        // 设置超时清理
        if (this.cacheTimeouts.has(folderPath)) {
            clearTimeout(this.cacheTimeouts.get(folderPath));
        }
        
        const timeoutId = setTimeout(() => {
            this.folderCache.delete(folderPath);
            this.cacheTimeouts.delete(folderPath);
        }, timeout);
        
        this.cacheTimeouts.set(folderPath, timeoutId);
        
        // 限制缓存大小
        if (this.folderCache.size > this.maxCacheSize) {
            const firstKey = this.folderCache.keys().next().value;
            this.folderCache.delete(firstKey);
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
        this.folderCache.clear();
        
        // 清理超时定时器
        this.cacheTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.cacheTimeouts.clear();
        
        this.log('🧹 所有文件夹权限缓存已清理', 'debug');
    }
}
```

## 故障排除

### 常见问题

#### 文件夹打开失败
- **症状**：点击文件夹打开按钮无反应或报错
- **解决**：
  1. 检查文件夹路径是否正确
  2. 验证文件夹权限
  3. 确认文件夹是否存在

#### 权限检查失败
- **症状**：提示无权限访问文件夹
- **解决**：
  1. 检查系统权限设置
  2. 验证用户账户控制(UAC)设置
  3. 确认文件夹所有权

#### 路径验证错误
- **症状**：文件夹路径被标记为无效
- **解决**：
  1. 检查路径格式是否正确
  2. 验证路径中是否包含非法字符
  3. 确认路径长度是否超出限制

#### 最近文件夹列表异常
- **症状**：最近使用的文件夹列表不更新或显示错误
- **解决**：
  1. 检查localStorage权限
  2. 验证文件夹路径规范化逻辑
  3. 确认列表长度限制设置

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控文件夹打开过程
folderOpenerModule.addFieldListener('folderOpening', (event) => {
    console.log('📁 文件夹打开事件:', event);
});

// 监控权限检查过程
folderOpenerModule.addFieldListener('permissionCheck', (event) => {
    console.log('🔐 权限检查事件:', event);
});
```

#### 性能分析
```javascript
// 记录文件夹打开性能
const startTime = performance.now();
const result = await folderOpenerModule.openCustomFolder(folderPath);
const endTime = performance.now();

console.log(`⏱️ 文件夹打开耗时: ${endTime - startTime}ms`);

// 分析内存使用
if (performance.memory) {
    console.log('🧠 内存使用情况:', {
        used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
    });
}
```

#### 路径调试
```javascript
// 调试路径处理
function debugPathProcessing(folderPath) {
    console.log('🔍 路径调试信息:', {
        original: folderPath,
        normalized: folderOpenerModule.normalizeFolderPath(folderPath),
        validated: folderOpenerModule.validateFolderPath(folderPath),
        extracted: folderOpenerModule.extractFolderPath(folderPath)
    });
}
```

## 扩展性

### 自定义扩展

#### 扩展文件夹打开模块
```javascript
// 创建自定义文件夹打开类
class CustomFolderOpenerModule extends FolderOpenerModule {
    constructor(aeExtension) {
        super(aeExtension);
        this.customFeatures = new Map();
        this.folderProviders = new Map();
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
     * 注册文件夹提供者
     * @param {string} providerName - 提供者名称
     * @param {Function} provider - 提供者实现
     */
    registerFolderProvider(providerName, provider) {
        this.folderProviders.set(providerName, provider);
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
    
    /**
     * 获取文件夹列表（支持自定义提供者）
     * @param {string} providerName - 提供者名称
     * @param {Object} options - 选项
     * @returns {Promise<Array>} 文件夹列表
     */
    async getFolderList(providerName, options = {}) {
        const provider = this.folderProviders.get(providerName);
        if (provider && typeof provider === 'function') {
            return await provider(options);
        }
        
        // 回退到默认实现
        return await super.getRecentFolders();
    }
}

// 使用自定义文件夹打开模块
const customFolderOpener = new CustomFolderOpenerModule(aeExtension);

// 注册自定义功能
customFolderOpener.registerCustomFeature('cloudFolderSync', async (folderPath) => {
    // 实现云端文件夹同步逻辑
    console.log(`同步文件夹到云端: ${folderPath}`);
    return { success: true };
});

// 注册文件夹提供者
customFolderOpener.registerFolderProvider('cloudStorage', async (options) => {
    // 实现云端存储文件夹列表获取逻辑
    return [
        { path: '/cloud/folder1', name: '云端文件夹1', type: 'cloud' },
        { path: '/cloud/folder2', name: '云端文件夹2', type: 'cloud' }
    ];
});
```

#### 插件化架构
```javascript
// 创建文件夹打开插件
class FolderOpenerPlugin {
    constructor(folderOpenerModule) {
        this.folderOpener = folderOpenerModule;
        this.init();
    }
    
    init() {
        // 添加插件特定的验证规则
        this.folderOpener.addValidator('plugin.customFolderOption', (value) => {
            // 自定义验证逻辑
            return { valid: true };
        });
        
        // 添加插件特定的迁移规则
        this.folderOpener.addMigration(3, (settings) => {
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
        // 监听文件夹打开事件
        this.folderOpener.addFieldListener('folderOpened', (event) => {
            this.handleFolderOpened(event);
        });
        
        // 监听最近文件夹变更事件
        this.folderOpener.addFieldListener('recentFolders', (newValue, oldValue, fieldPath) => {
            this.handleRecentFoldersChange(newValue, oldValue, fieldPath);
        });
        
        // 监听权限检查事件
        this.folderOpener.addFieldListener('permissionChecked', (event) => {
            this.handlePermissionChecked(event);
        });
    }
    
    /**
     * 处理文件夹打开事件
     * @param {Object} event - 事件对象
     */
    handleFolderOpened(event) {
        const { folderPath, folderType, success, error } = event;
        
        if (success) {
            console.log(`📁 插件: 文件夹已打开 (${folderType}): ${folderPath}`);
            
            // 执行插件特定的打开后逻辑
            this.afterFolderOpened(folderPath, folderType);
        } else {
            console.error(`❌ 插件: 文件夹打开失败: ${error}`);
            
            // 执行插件特定的失败处理逻辑
            this.onFolderOpenFailed(folderPath, folderType, error);
        }
    }
    
    /**
     * 文件夹打开后的处理逻辑
     * @param {string} folderPath - 文件夹路径
     * @param {string} folderType - 文件夹类型
     */
    afterFolderOpened(folderPath, folderType) {
        // 插件特定的打开后处理逻辑
        switch (folderType) {
            case 'project':
                console.log('📁 项目文件夹已打开，执行项目相关逻辑');
                break;
                
            case 'eagle_library':
                console.log('📁 Eagle资源库文件夹已打开，执行资源库相关逻辑');
                break;
                
            case 'custom':
                console.log('📁 自定义文件夹已打开，执行自定义逻辑');
                break;
                
            case 'recent':
                console.log('📁 最近使用文件夹已打开，执行最近文件夹相关逻辑');
                break;
                
            default:
                console.log(`📁 未知类型文件夹已打开: ${folderType}`);
        }
    }
    
    /**
     * 文件夹打开失败的处理逻辑
     * @param {string} folderPath - 文件夹路径
     * @param {string} folderType - 文件夹类型
     * @param {string} error - 错误信息
     */
    onFolderOpenFailed(folderPath, folderType, error) {
        // 插件特定的失败处理逻辑
        console.log(`📁 文件夹打开失败处理 (${folderType}): ${folderPath} - ${error}`);
        
        // 根据错误类型执行不同处理
        if (error.includes('权限')) {
            console.log('🔐 权限错误，建议检查文件夹权限');
        } else if (error.includes('路径')) {
            console.log('📁 路径错误，建议检查文件夹路径');
        } else {
            console.log('💥 其他错误，建议查看详细日志');
        }
    }
    
    /**
     * 处理最近文件夹变更
     * @param {Array} newValue - 新值
     * @param {Array} oldValue - 旧值
     * @param {string} fieldPath - 字段路径
     */
    handleRecentFoldersChange(newValue, oldValue, fieldPath) {
        console.log(`📁 插件: 最近文件夹列表已变更: ${fieldPath}`);
        console.log('新值:', newValue);
        console.log('旧值:', oldValue);
        
        // 执行插件特定的变更处理逻辑
        this.updateRecentFoldersUI(newValue);
    }
    
    /**
     * 更新最近文件夹UI
     * @param {Array} folders - 文件夹列表
     */
    updateRecentFoldersUI(folders) {
        // 插件特定的UI更新逻辑
        console.log(`📁 更新最近文件夹UI (${folders.length} 个项目)`);
        
        // 可以在这里更新扩展面板中的最近文件夹下拉列表
        const recentFoldersSelect = document.getElementById('recent-folders-select');
        if (recentFoldersSelect) {
            // 清空现有选项
            recentFoldersSelect.innerHTML = '<option value="">选择最近使用的文件夹...</option>';
            
            // 添加最近使用的文件夹选项
            folders.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.path;
                option.textContent = this.truncatePath(folder.path, 50); // 截断长路径
                option.title = folder.path; // 完整路径作为提示
                recentFoldersSelect.appendChild(option);
            });
        }
    }
    
    /**
     * 截断路径显示
     * @param {string} path - 路径
     * @param {number} maxLength - 最大长度
     * @returns {string} 截断后的路径
     */
    truncatePath(path, maxLength) {
        if (path.length <= maxLength) {
            return path;
        }
        
        const parts = path.split(/[\\\\\\/]/);
        if (parts.length <= 2) {
            return path.substring(0, maxLength - 3) + '...';
        }
        
        const fileName = parts[parts.length - 1];
        const firstPart = parts[0];
        const remaining = maxLength - firstPart.length - fileName.length - 6; // 6 for "...\\"
        
        if (remaining > 0) {
            return `${firstPart}\\\\...\\\\${fileName}`;
        } else {
            return `...\\\\${fileName}`;
        }
    }
    
    /**
     * 处理权限检查事件
     * @param {Object} event - 事件对象
     */
    handlePermissionChecked(event) {
        const { folderPath, hasPermission, error } = event;
        
        if (hasPermission) {
            console.log(`🔐 插件: 文件夹权限检查通过: ${folderPath}`);
        } else {
            console.error(`❌ 插件: 文件夹权限检查失败: ${folderPath} - ${error}`);
        }
    }
}

// 应用插件
const plugin = new FolderOpenerPlugin(folderOpenerModule);