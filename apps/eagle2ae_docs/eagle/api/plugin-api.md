# Eagle 插件 API 参考

## 概述

本文档提供 Eagle2Ae Eagle 插件的完整 API 参考，基于实际的插件实现。包括 Eagle2Ae 主类、WebSocket 服务器、动态端口分配、剪贴板处理和数据库访问等核心功能。

## 插件核心 API

### Eagle2Ae 主类

#### 构造函数

```javascript
/**
 * Eagle2Ae 插件构造函数
 * 自动检测运行环境并初始化相应的服务
 */
constructor() {
    // 初始化状态
    this.httpServer = null;
    this.webSocketServer = null;
    this.aeConnection = null;
    this.clipboardHandler = null;
    this.portAllocator = null;
    
    // 配置信息
    this.config = {
        wsPort: 8080,
        autoExport: false,
        targetDirectory: null,
        useWebSocket: false,
        fallbackToHttp: true,
        useDynamicPort: true
    };
    
    // 自动启动初始化
    this.init();
}
```

**实际使用**:
```javascript
// 插件会在 Eagle 启动时自动创建实例
const eagle2ae = new Eagle2Ae();

// 全局访问
window.eagle2ae = eagle2ae;
```

#### init()
异步初始化插件服务

```javascript
/**
 * 初始化插件服务
 * 启动HTTP服务器、WebSocket服务器、剪切板监控等
 * @returns {Promise<void>} 初始化完成的 Promise
 * @throws {Error} 初始化失败时抛出错误
 */
async init() {
    try {
        // 1. 加载配置
        this.loadPortConfig();
        this.loadImportSettings();
        
        // 2. 启动服务器
        await this.startServer();
        
        // 3. 初始化功能模块
        this.initEagleWebSocket();
        this.initClipboardHandler();
        
        // 4. 设置事件监听
        this.setupEventListeners();
        
        // 5. 启动状态检查
        this.startAEStatusCheck();
        this.startAEPortDetection();
        
        this.log('✅ Eagle2Ae 服务已启动', 'success');
    } catch (error) {
        this.log(`服务启动失败: ${error.message}`, 'error');
        throw error;
    }
}
```

**初始化流程**:
1. 加载端口配置和导入设置
2. 启动HTTP服务器（动态端口分配）
3. 初始化WebSocket兼容层
4. 启动剪切板监控
5. 设置文件选择事件监听
6. 启动AE连接状态检查
7. 显示启动完成通知

**错误处理**:
```javascript
// 初始化失败时的处理
if (typeof eagle !== 'undefined' && eagle.notification) {
    eagle.notification.show({
        title: 'Eagle2Ae 启动失败',
        body: `错误: ${error.message}`,
        mute: false,
        duration: 10000
    });
}
```

#### handleSelectedFiles()
处理选中的文件

```javascript
/**
 * 处理Eagle中选中的文件，发送到AE扩展
 * @param {Array<Object>} selectedItems - Eagle选中的文件项
 * @returns {Promise<void>} 处理完成的 Promise
 * @throws {Error} 处理失败时抛出错误
 */
async handleSelectedFiles(selectedItems) {
    try {
        // 1. 验证文件
        const validFiles = this.validateFiles(selectedItems);
        
        // 2. 检查重复导出
        if (this.isDuplicateExport(validFiles)) {
            this.log('检测到重复导出，跳过操作', 'warning');
            return;
        }
        
        // 3. 处理文件
        const processedFiles = await this.processFiles(validFiles);
        
        // 4. 发送到AE
        await this.sendToAE(processedFiles);
        
        // 5. 更新导出历史
        this.updateExportHistory(validFiles);
        
        this.log(`成功处理 ${validFiles.length} 个文件`, 'success');
    } catch (error) {
        this.log(`文件处理失败: ${error.message}`, 'error');
        throw error;
    }
}
```

#### updateSettings()
更新插件设置

```javascript
/**
 * 更新插件设置
 * @param {Object} settings - 新的设置对象
 * @param {boolean} settings.showNotifications - 是否显示通知
 * @param {number} settings.serverPort - 服务器端口
 * @param {number} settings.clipboardInterval - 剪切板检查间隔
 */
updateSettings(settings) {
    try {
        // 更新配置
        if (settings.serverPort && settings.serverPort !== this.config.httpPort) {
            this.config.httpPort = settings.serverPort;
            this.restartHttpServer();
        }
        
        // 应用剪切板设置
        if (this.clipboardHandler && settings.clipboardInterval) {
            this.clipboardHandler.setCheckInterval(settings.clipboardInterval);
        }
        
        this.log('设置已更新', 'info');
    } catch (error) {
        this.log(`更新设置失败: ${error.message}`, 'error');
    }
}
```

#### getStatus()
获取插件状态

```javascript
/**
 * 获取插件当前状态
 * @returns {Object} 插件状态信息
 */
getStatus()
```

**返回值**:
```javascript
{
    running: true,
    uptime: 3600000,
    connections: {
        active: 2,
        total: 15
    },
    services: {
        webserver: {
            running: true,
            port: 8080,
            connections: 2
        },
        database: {
            connected: true,
            libraryPath: '/Users/username/Eagle'
        },
        clipboard: {
            monitoring: true,
            lastUpdate: '2024-01-05T10:30:00.000Z'
        }
    },
    memory: {
        used: 52428800,
        available: 8589934592
    }
}
```

### 事件系统

#### on()
注册事件监听器

```javascript
/**
 * 注册事件监听器
 * @param {string} event - 事件名称
 * @param {Function} callback - 回调函数
 */
on(event, callback)
```

**事件类型**:
- `initialized` - 插件初始化完成
- `started` - 插件启动完成
- `stopped` - 插件停止
- `connection:new` - 新连接建立
- `connection:closed` - 连接关闭
- `file:selected` - 文件选择变更
- `clipboard:changed` - 剪贴板内容变更
- `error` - 错误发生

**示例**:
```javascript
plugin.on('initialized', (info) => {
    console.log('插件已初始化:', info);
});

plugin.on('connection:new', (connection) => {
    console.log('新连接:', connection.id);
});

plugin.on('file:selected', (files) => {
    console.log('选中文件:', files.length);
});

plugin.on('error', (error) => {
    console.error('插件错误:', error);
});
```

## WebSocket 服务器 API

### WebSocketServer 类

#### 构造函数

```javascript
/**
 * WebSocket 服务器构造函数
 * @param {Object} options - 服务器选项
 * @param {number} options.port - 服务器端口
 * @param {string} options.host - 服务器主机
 * @param {Object} options.cors - CORS 配置
 */
constructor(options = {})
```

#### start()
启动 WebSocket 服务器

```javascript
/**
 * 启动 WebSocket 服务器
 * @returns {Promise<Object>} 启动结果
 */
async start()
```

**返回值**:
```javascript
{
    success: true,
    port: 8080,
    host: 'localhost',
    url: 'ws://localhost:8080'
}
```

#### broadcast()
广播消息到所有连接

```javascript
/**
 * 广播消息到所有连接的客户端
 * @param {string} type - 消息类型
 * @param {Object} data - 消息数据
 * @param {Object} options - 广播选项
 */
broadcast(type, data, options = {})
```

**示例**:
```javascript
// 广播文件选择变更
server.broadcast('file_selection_changed', {
    files: selectedFiles,
    timestamp: new Date().toISOString()
});

// 广播状态更新
server.broadcast('status_update', {
    type: 'eagle_library_changed',
    libraryPath: newLibraryPath
});
```

#### sendToClient()
发送消息到特定客户端

```javascript
/**
 * 发送消息到特定客户端
 * @param {string} clientId - 客户端 ID
 * @param {string} type - 消息类型
 * @param {Object} data - 消息数据
 * @returns {boolean} 是否发送成功
 */
sendToClient(clientId, type, data)
```

#### getConnections()
获取所有连接信息

```javascript
/**
 * 获取所有活动连接信息
 * @returns {Array<Object>} 连接信息数组
 */
getConnections()
```

**返回值**:
```javascript
[
    {
        id: 'conn_001',
        clientType: 'ae_extension',
        version: '1.0.0',
        connectedAt: '2024-01-05T10:30:00.000Z',
        lastActivity: '2024-01-05T10:35:00.000Z',
        messageCount: 25
    }
]
```

### 消息处理器

#### registerMessageHandler()
注册消息处理器

```javascript
/**
 * 注册消息处理器
 * @param {string} messageType - 消息类型
 * @param {Function} handler - 处理函数
 */
registerMessageHandler(messageType, handler)
```

**示例**:
```javascript
// 注册文件传输处理器
server.registerMessageHandler('file_transfer', async (message, client) => {
    try {
        const { files, settings } = message.data;
        
        // 验证文件
        const validationResult = await validateFiles(files);
        if (!validationResult.valid) {
            return {
                type: 'error',
                data: {
                    code: 'INVALID_FILES',
                    message: '文件验证失败',
                    details: validationResult.errors
                }
            };
        }
        
        // 处理文件传输
        const result = await processFileTransfer(files, settings);
        
        return {
            type: 'file_transfer_response',
            data: result
        };
        
    } catch (error) {
        return {
            type: 'error',
            data: {
                code: 'TRANSFER_FAILED',
                message: error.message
            }
        };
    }
});

// 注册状态查询处理器
server.registerMessageHandler('status_query', async (message, client) => {
    const { queryType } = message.data;
    
    switch (queryType) {
        case 'eagle':
            return {
                type: 'status_response',
                data: await getEagleStatus()
            };
        case 'plugin':
            return {
                type: 'status_response',
                data: plugin.getStatus()
            };
        default:
            return {
                type: 'error',
                data: {
                    code: 'INVALID_QUERY_TYPE',
                    message: '无效的查询类型'
                }
            };
    }
});
```

## 数据库访问 API

### EagleDatabase 类

#### 构造函数

```javascript
/**
 * Eagle 数据库访问类构造函数
 * @param {string} libraryPath - Eagle 库路径
 */
constructor(libraryPath)
```

#### connect()
连接到 Eagle 数据库

```javascript
/**
 * 连接到 Eagle 数据库
 * @returns {Promise<Object>} 连接结果
 */
async connect()
```

#### getSelectedItems()
获取当前选中的项目

```javascript
/**
 * 获取 Eagle 中当前选中的项目
 * @returns {Promise<Array<Object>>} 选中项目数组
 */
async getSelectedItems()
```

**返回值**:
```javascript
[
    {
        id: 'eagle_item_001',
        name: 'sunset.jpg',
        path: '/Users/username/Eagle/images/nature/sunset.jpg',
        size: 2048576,
        type: 'image',
        ext: 'jpg',
        mimeType: 'image/jpeg',
        width: 1920,
        height: 1080,
        tags: ['nature', 'sunset', 'landscape'],
        rating: 5,
        annotation: 'Beautiful sunset photo',
        folder: {
            id: 'folder_001',
            name: 'Nature Photos',
            path: 'Nature Photos'
        },
        dateCreated: '2024-01-01T18:30:00.000Z',
        dateModified: '2024-01-02T09:15:00.000Z',
        metadata: {
            camera: 'Canon EOS R5',
            lens: 'RF 24-70mm F2.8 L IS USM',
            iso: 100,
            aperture: 'f/8',
            shutterSpeed: '1/125',
            focalLength: '35mm'
        }
    }
]
```

#### getItemById()
根据 ID 获取项目

```javascript
/**
 * 根据 ID 获取项目详细信息
 * @param {string} itemId - 项目 ID
 * @returns {Promise<Object|null>} 项目信息或 null
 */
async getItemById(itemId)
```

#### searchItems()
搜索项目

```javascript
/**
 * 搜索 Eagle 库中的项目
 * @param {Object} criteria - 搜索条件
 * @param {string} criteria.keyword - 关键词
 * @param {Array<string>} criteria.tags - 标签
 * @param {string} criteria.type - 文件类型
 * @param {Object} criteria.dateRange - 日期范围
 * @param {number} criteria.rating - 评分
 * @returns {Promise<Array<Object>>} 搜索结果
 */
async searchItems(criteria)
```

**示例**:
```javascript
// 搜索包含特定标签的图片
const results = await database.searchItems({
    tags: ['nature', 'landscape'],
    type: 'image',
    rating: 4
});

// 搜索特定日期范围的文件
const recentFiles = await database.searchItems({
    dateRange: {
        start: '2024-01-01',
        end: '2024-01-31'
    }
});

// 关键词搜索
const keywordResults = await database.searchItems({
    keyword: 'sunset beach'
});
```

#### getFolders()
获取文件夹列表

```javascript
/**
 * 获取 Eagle 库中的文件夹列表
 * @returns {Promise<Array<Object>>} 文件夹列表
 */
async getFolders()
```

**返回值**:
```javascript
[
    {
        id: 'folder_001',
        name: 'Nature Photos',
        path: 'Nature Photos',
        itemCount: 156,
        subfolders: [
            {
                id: 'folder_002',
                name: 'Landscapes',
                path: 'Nature Photos/Landscapes',
                itemCount: 89
            }
        ],
        dateCreated: '2024-01-01T00:00:00.000Z',
        dateModified: '2024-01-05T10:30:00.000Z'
    }
]
```

#### getTags()
获取标签列表

```javascript
/**
 * 获取 Eagle 库中的所有标签
 * @returns {Promise<Array<Object>>} 标签列表
 */
async getTags()
```

**返回值**:
```javascript
[
    {
        name: 'nature',
        count: 245,
        color: '#4CAF50'
    },
    {
        name: 'landscape',
        count: 189,
        color: '#2196F3'
    },
    {
        name: 'portrait',
        count: 156,
        color: '#FF9800'
    }
]
```

#### getLibraryInfo()
获取库信息

```javascript
/**
 * 获取 Eagle 库的基本信息
 * @returns {Promise<Object>} 库信息
 */
async getLibraryInfo()
```

**返回值**:
```javascript
{
    name: 'My Eagle Library',
    path: '/Users/username/Eagle',
    version: '3.0.0',
    itemCount: 1247,
    folderCount: 23,
    tagCount: 156,
    totalSize: 5368709120, // bytes
    dateCreated: '2023-01-01T00:00:00.000Z',
    dateModified: '2024-01-05T10:30:00.000Z',
    settings: {
        autoBackup: true,
        syncEnabled: false,
        thumbnailQuality: 'high'
    }
}
```

## 文件信息收集器 API

### FileInfoCollector 类

#### collectFileInfo()
收集文件信息

```javascript
/**
 * 收集文件的详细信息
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 文件信息
 */
async collectFileInfo(filePath)
```

**返回值**:
```javascript
{
    path: '/Users/username/Eagle/images/photo.jpg',
    name: 'photo.jpg',
    size: 2048576,
    type: 'image',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    exists: true,
    readable: true,
    dimensions: {
        width: 1920,
        height: 1080
    },
    metadata: {
        exif: {
            camera: 'Canon EOS R5',
            lens: 'RF 24-70mm F2.8 L IS USM',
            iso: 100,
            aperture: 'f/8',
            shutterSpeed: '1/125',
            focalLength: '35mm',
            dateTime: '2024-01-01T18:30:00.000Z'
        },
        colorProfile: 'sRGB',
        hasAlpha: false
    },
    checksum: {
        md5: 'a1b2c3d4e5f6789...',
        sha256: 'x1y2z3a4b5c6789...'
    },
    dateCreated: '2024-01-01T18:30:00.000Z',
    dateModified: '2024-01-02T09:15:00.000Z',
    dateAccessed: '2024-01-05T10:30:00.000Z'
}
```

#### collectBatchFileInfo()
批量收集文件信息

```javascript
/**
 * 批量收集多个文件的信息
 * @param {Array<string>} filePaths - 文件路径数组
 * @param {Object} options - 收集选项
 * @returns {Promise<Array<Object>>} 文件信息数组
 */
async collectBatchFileInfo(filePaths, options = {})
```

**选项参数**:
```javascript
{
    includeMetadata: true,     // 是否包含元数据
    includeChecksum: false,    // 是否计算校验和
    parallel: true,            // 是否并行处理
    maxConcurrency: 5,         // 最大并发数
    timeout: 30000            // 超时时间（毫秒）
}
```

#### validateFile()
验证文件

```javascript
/**
 * 验证文件是否有效且可访问
 * @param {string} filePath - 文件路径
 * @returns {Promise<Object>} 验证结果
 */
async validateFile(filePath)
```

**返回值**:
```javascript
{
    valid: true,
    exists: true,
    readable: true,
    supported: true,
    issues: [],
    fileInfo: {
        // 基本文件信息
    }
}

// 或者验证失败时：
{
    valid: false,
    exists: false,
    readable: false,
    supported: false,
    issues: [
        {
            type: 'FILE_NOT_FOUND',
            message: '文件不存在',
            severity: 'error'
        }
    ]
}
```

## 剪贴板集成 API

### ClipboardMonitor 类

#### 构造函数

```javascript
/**
 * 剪贴板监控器构造函数
 * @param {Object} options - 监控选项
 * @param {number} options.interval - 检查间隔（毫秒）
 * @param {boolean} options.autoStart - 是否自动开始监控
 */
constructor(options = {})
```

#### start()
开始监控剪贴板

```javascript
/**
 * 开始监控剪贴板变化
 * @returns {Promise<void>}
 */
async start()
```

#### stop()
停止监控剪贴板

```javascript
/**
 * 停止监控剪贴板
 * @returns {Promise<void>}
 */
async stop()
```

#### getClipboardContent()
获取剪贴板内容

```javascript
/**
 * 获取当前剪贴板内容
 * @returns {Promise<Object>} 剪贴板内容
 */
async getClipboardContent()
```

**返回值**:
```javascript
{
    type: 'files',
    content: [
        {
            path: '/Users/username/Desktop/image.jpg',
            name: 'image.jpg',
            size: 1024000,
            type: 'image/jpeg'
        }
    ],
    timestamp: '2024-01-05T10:30:00.000Z',
    source: 'eagle'
}

// 或者文本内容：
{
    type: 'text',
    content: 'Hello World',
    timestamp: '2024-01-05T10:30:00.000Z',
    source: 'unknown'
}

// 或者图片内容：
{
    type: 'image',
    content: {
        format: 'png',
        width: 1920,
        height: 1080,
        data: 'base64_encoded_image_data...'
    },
    timestamp: '2024-01-05T10:30:00.000Z',
    source: 'screenshot'
}
```

#### setClipboardContent()
设置剪贴板内容

```javascript
/**
 * 设置剪贴板内容
 * @param {Object} content - 要设置的内容
 * @returns {Promise<boolean>} 是否设置成功
 */
async setClipboardContent(content)
```

**示例**:
```javascript
// 设置文件到剪贴板
await clipboardMonitor.setClipboardContent({
    type: 'files',
    content: [
        {
            path: '/path/to/file.jpg'
        }
    ]
});

// 设置文本到剪贴板
await clipboardMonitor.setClipboardContent({
    type: 'text',
    content: 'Hello World'
});
```

#### 事件监听

```javascript
// 监听剪贴板变化
clipboardMonitor.on('changed', (content) => {
    console.log('剪贴板内容变化:', content);
    
    // 如果是文件，通知 WebSocket 客户端
    if (content.type === 'files') {
        webSocketServer.broadcast('clipboard_files_changed', {
            files: content.content,
            timestamp: content.timestamp
        });
    }
});

// 监听错误
clipboardMonitor.on('error', (error) => {
    console.error('剪贴板监控错误:', error);
});
```

## 配置管理 API

### ConfigManager 类

#### get()
获取配置值

```javascript
/**
 * 获取配置值
 * @param {string} key - 配置键名（支持点号分隔）
 * @param {*} defaultValue - 默认值
 * @returns {*} 配置值
 */
get(key, defaultValue = null)
```

#### set()
设置配置值

```javascript
/**
 * 设置配置值
 * @param {string} key - 配置键名
 * @param {*} value - 配置值
 * @returns {Promise<boolean>} 设置是否成功
 */
async set(key, value)
```

#### load()
加载配置文件

```javascript
/**
 * 加载配置文件
 * @param {string} configPath - 配置文件路径
 * @returns {Promise<Object>} 加载的配置
 */
async load(configPath)
```

#### save()
保存配置文件

```javascript
/**
 * 保存配置到文件
 * @param {string} configPath - 配置文件路径
 * @returns {Promise<boolean>} 保存是否成功
 */
async save(configPath)
```

**配置示例**:
```javascript
// 获取服务器配置
const serverPort = configManager.get('server.port', 8080);
const serverHost = configManager.get('server.host', 'localhost');

// 设置日志级别
await configManager.set('logging.level', 'debug');

// 获取 Eagle 库路径
const libraryPath = configManager.get('eagle.libraryPath');

// 设置自动启动
await configManager.set('plugin.autoStart', true);
```

## 日志管理 API

### Logger 类

#### log()
记录日志

```javascript
/**
 * 记录日志
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 * @param {Object} context - 上下文信息
 */
log(level, message, context = {})
```

#### debug(), info(), warn(), error()
便捷日志方法

```javascript
/**
 * 记录不同级别的日志
 * @param {string} message - 日志消息
 * @param {Object} context - 上下文信息
 */
debug(message, context = {})
info(message, context = {})
warn(message, context = {})
error(message, context = {})
```

**示例**:
```javascript
// 记录插件启动
logger.info('Eagle 插件启动', {
    version: '1.0.0',
    port: 8080,
    eagleVersion: '3.0.0'
});

// 记录文件处理
logger.debug('处理文件选择', {
    fileCount: 5,
    totalSize: 10485760,
    source: 'eagle_selection'
});

// 记录错误
logger.error('数据库连接失败', {
    libraryPath: '/path/to/eagle/library',
    error: error.message,
    stack: error.stack
});

// 记录性能信息
logger.info('文件信息收集完成', {
    fileCount: 25,
    duration: 1500,
    averageTime: 60
});
```

## 工具函数 API

### 路径处理

#### normalizePath()
标准化路径

```javascript
/**
 * 标准化文件路径
 * @param {string} path - 原始路径
 * @returns {string} 标准化后的路径
 */
function normalizePath(path)
```

#### isValidPath()
验证路径

```javascript
/**
 * 验证路径是否有效
 * @param {string} path - 文件路径
 * @returns {boolean} 是否有效
 */
function isValidPath(path)
```

#### getFileExtension()
获取文件扩展名

```javascript
/**
 * 获取文件扩展名
 * @param {string} filePath - 文件路径
 * @returns {string} 文件扩展名（小写）
 */
function getFileExtension(filePath)
```

### 文件类型检测

#### getFileType()
获取文件类型

```javascript
/**
 * 根据文件扩展名获取文件类型
 * @param {string} extension - 文件扩展名
 * @returns {string} 文件类型（'image'|'video'|'audio'|'document'|'other'）
 */
function getFileType(extension)
```

#### isSupportedFormat()
检查支持的格式

```javascript
/**
 * 检查文件格式是否被支持
 * @param {string} extension - 文件扩展名
 * @returns {boolean} 是否支持
 */
function isSupportedFormat(extension)
```

### 数据验证

#### validateFileInfo()
验证文件信息

```javascript
/**
 * 验证文件信息对象
 * @param {Object} fileInfo - 文件信息
 * @returns {Object} 验证结果
 */
function validateFileInfo(fileInfo)
```

#### validateMessage()
验证消息格式

```javascript
/**
 * 验证 WebSocket 消息格式
 * @param {Object} message - 消息对象
 * @returns {Object} 验证结果
 */
function validateMessage(message)
```

### 性能监控

#### measureExecutionTime()
测量执行时间

```javascript
/**
 * 测量函数执行时间
 * @param {Function} func - 要测量的函数
 * @param {string} operationName - 操作名称
 * @returns {Promise<Object>} 执行结果和时间
 */
async function measureExecutionTime(func, operationName)
```

**返回值**:
```javascript
{
    result: /* 函数返回值 */,
    duration: 1500, // 毫秒
    operationName: 'file_info_collection',
    timestamp: '2024-01-05T10:30:00.000Z'
}
```

#### getMemoryUsage()
获取内存使用情况

```javascript
/**
 * 获取当前内存使用情况
 * @returns {Object} 内存使用信息
 */
function getMemoryUsage()
```

**返回值**:
```javascript
{
    rss: 52428800,        // 常驻集大小
    heapTotal: 41943040,  // 堆总大小
    heapUsed: 29884416,   // 已使用堆大小
    external: 1024000,    // 外部内存
    arrayBuffers: 512000  // ArrayBuffer 大小
}
```

## 错误处理

### 错误类型定义

#### PluginError
插件基础错误类

```javascript
class PluginError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'PluginError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}
```

#### DatabaseError
数据库相关错误

```javascript
class DatabaseError extends PluginError {
    constructor(message, code, libraryPath) {
        super(message, code, { libraryPath });
        this.name = 'DatabaseError';
    }
}
```

#### FileError
文件相关错误

```javascript
class FileError extends PluginError {
    constructor(message, code, filePath) {
        super(message, code, { filePath });
        this.name = 'FileError';
    }
}
```

### 错误代码

#### 插件错误
- `PLUGIN_INIT_FAILED` - 插件初始化失败
- `PLUGIN_START_FAILED` - 插件启动失败
- `SERVICE_UNAVAILABLE` - 服务不可用

#### 数据库错误
- `DATABASE_CONNECTION_FAILED` - 数据库连接失败
- `LIBRARY_NOT_FOUND` - Eagle 库不存在
- `LIBRARY_ACCESS_DENIED` - 库访问被拒绝
- `QUERY_FAILED` - 查询失败

#### 文件错误
- `FILE_NOT_FOUND` - 文件不存在
- `FILE_ACCESS_DENIED` - 文件访问被拒绝
- `UNSUPPORTED_FORMAT` - 不支持的文件格式
- `FILE_CORRUPTED` - 文件损坏

#### 网络错误
- `CONNECTION_FAILED` - 连接失败
- `MESSAGE_SEND_FAILED` - 消息发送失败
- `INVALID_MESSAGE_FORMAT` - 无效的消息格式

## 使用示例

### 基础插件设置

```javascript
const { EaglePlugin } = require('./eagle-plugin');

// 创建插件实例
const plugin = new EaglePlugin({
    port: 8080,
    host: 'localhost',
    autoStart: true,
    logging: {
        level: 'info',
        file: true
    }
});

// 监听插件事件
plugin.on('initialized', (info) => {
    console.log('插件初始化完成:', info);
});

plugin.on('connection:new', (connection) => {
    console.log('新客户端连接:', connection.clientType);
});

plugin.on('file:selected', async (files) => {
    console.log(`用户选择了 ${files.length} 个文件`);
    
    // 收集文件详细信息
    const fileInfos = await Promise.all(
        files.map(file => plugin.fileCollector.collectFileInfo(file.path))
    );
    
    // 广播文件信息到所有连接的客户端
    plugin.webServer.broadcast('file_info_collected', {
        files: fileInfos,
        timestamp: new Date().toISOString()
    });
});

// 启动插件
async function startPlugin() {
    try {
        await plugin.initialize();
        await plugin.start();
        console.log('Eagle 插件启动成功');
    } catch (error) {
        console.error('插件启动失败:', error);
    }
}

startPlugin();
```

### 文件处理示例

```javascript
// 处理文件传输请求
plugin.webServer.registerMessageHandler('file_transfer', async (message, client) => {
    const { files, settings } = message.data;
    
    try {
        // 1. 验证文件
        const validationResults = await Promise.all(
            files.map(file => plugin.fileCollector.validateFile(file.path))
        );
        
        const validFiles = files.filter((file, index) => 
            validationResults[index].valid
        );
        
        const invalidFiles = files.filter((file, index) => 
            !validationResults[index].valid
        );
        
        // 2. 收集有效文件的详细信息
        const fileInfos = await plugin.fileCollector.collectBatchFileInfo(
            validFiles.map(file => file.path),
            {
                includeMetadata: true,
                includeChecksum: false,
                parallel: true,
                maxConcurrency: 5
            }
        );
        
        // 3. 返回处理结果
        return {
            type: 'file_transfer_response',
            data: {
                status: 'success',
                processed: validFiles.length,
                failed: invalidFiles.length,
                files: fileInfos,
                invalidFiles: invalidFiles.map((file, index) => ({
                    ...file,
                    error: validationResults[files.indexOf(file)].issues[0]
                }))
            }
        };
        
    } catch (error) {
        plugin.logger.error('文件传输处理失败', {
            error: error.message,
            fileCount: files.length
        });
        
        return {
            type: 'error',
            data: {
                code: 'FILE_TRANSFER_FAILED',
                message: '文件传输处理失败',
                details: error.message
            }
        };
    }
});
```

### 数据库查询示例

```javascript
// 处理 Eagle 数据查询
plugin.webServer.registerMessageHandler('eagle_query', async (message, client) => {
    const { queryType, criteria } = message.data;
    
    try {
        let result;
        
        switch (queryType) {
            case 'selected_items':
                result = await plugin.database.getSelectedItems();
                break;
                
            case 'search':
                result = await plugin.database.searchItems(criteria);
                break;
                
            case 'folders':
                result = await plugin.database.getFolders();
                break;
                
            case 'tags':
                result = await plugin.database.getTags();
                break;
                
            case 'library_info':
                result = await plugin.database.getLibraryInfo();
                break;
                
            default:
                throw new Error(`不支持的查询类型: ${queryType}`);
        }
        
        return {
            type: 'eagle_query_response',
            data: {
                queryType,
                result,
                timestamp: new Date().toISOString()
            }
        };
        
    } catch (error) {
        plugin.logger.error('Eagle 查询失败', {
            queryType,
            criteria,
            error: error.message
        });
        
        return {
            type: 'error',
            data: {
                code: 'EAGLE_QUERY_FAILED',
                message: 'Eagle 查询失败',
                details: error.message
            }
        };
    }
});
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始 Eagle 插件 API 文档 | 开发团队 |

---

**相关文档**:
- [WebSocket 服务器 API](./websocket-server.md)
- [数据库访问 API](./database-api.md)
- [Eagle 插件架构](../architecture/eagle-plugin-architecture.md)