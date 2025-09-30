# Eagle 数据库访问 API 参考

## 概述

本文档详细描述了 Eagle2Ae Eagle 插件中通过 Eagle API 进行数据访问的接口。Eagle2Ae 插件主要通过 Eagle 提供的 JavaScript API 来获取文件信息，而不是直接访问数据库文件。

## Eagle API 集成

### Eagle 全局对象

Eagle 插件环境提供了全局的 `eagle` 对象，包含以下主要模块：

```javascript
// Eagle 全局 API 结构
const eagle = {
    app: {           // 应用信息
        version: '3.0.0',
        execPath: '/Applications/Eagle.app',
        // ...
    },
    item: {          // 项目操作
        getSelected: async () => { /* ... */ },
        getAll: async () => { /* ... */ },
        // ...
    },
    library: {       // 库操作
        info: async () => { /* ... */ },
        path: '/Users/username/Eagle',
        // ...
    },
    clipboard: {     // 剪贴板操作
        readText: async () => { /* ... */ },
        has: (format) => { /* ... */ },
        // ...
    },
    notification: {  // 通知系统
        show: (options) => { /* ... */ }
    }
};
```

**配置选项详解**:
```javascript
const database = new EagleDatabase({
    libraryPath: '/Users/username/Eagle',
    autoConnect: true,
    
    // 缓存配置
    cache: {
        enabled: true,
        ttl: 300000,        // 5 分钟 TTL
        maxSize: 1000,      // 最大缓存条目
        strategy: 'lru'     // LRU 策略
    },
    
    // 超时配置
    timeout: {
        connection: 10000,  // 连接超时 10 秒
        query: 30000,       // 查询超时 30 秒
        transaction: 60000  // 事务超时 60 秒
    },
    
    // 连接池配置
    pool: {
        min: 1,
        max: 5,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000
    }
});
```

#### connect()
连接到 Eagle 数据库

```javascript
/**
 * 连接到 Eagle 数据库
 * @returns {Promise<Object>} 连接结果
 * @throws {DatabaseError} 连接失败时抛出错误
 */
async connect()
```

**返回值**:
```javascript
{
    success: true,
    libraryPath: '/Users/username/Eagle',
    version: '3.0.0',
    itemCount: 1247,
    folderCount: 23,
    tagCount: 156,
    lastModified: '2024-01-05T10:30:00.000Z',
    connectionId: 'db_conn_001'
}
```

**示例**:
```javascript
try {
    const result = await database.connect();
    console.log('数据库连接成功:', result.libraryPath);
    console.log('库中共有', result.itemCount, '个项目');
} catch (error) {
    console.error('数据库连接失败:', error.message);
}
```

#### disconnect()
断开数据库连接

```javascript
/**
 * 断开数据库连接
 * @returns {Promise<void>}
 */
async disconnect()
```

#### isConnected()
检查连接状态

```javascript
/**
 * 检查是否已连接到数据库
 * @returns {boolean} 连接状态
 */
isConnected()
```

## 项目查询 API

### getSelectedItems()
获取当前选中的项目

```javascript
/**
 * 获取 Eagle 中当前选中的项目
 * @param {Object} options - 查询选项
 * @returns {Promise<Array<Object>>} 选中项目数组
 */
async getSelectedItems(options = {})
```

**查询选项**:
```javascript
const selectedItems = await database.getSelectedItems({
    includeMetadata: true,     // 包含元数据
    includeFileInfo: true,     // 包含文件信息
    includeThumbnail: false,   // 包含缩略图
    format: 'detailed'         // 'simple' | 'detailed' | 'full'
});
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
        
        // 文件夹信息
        folder: {
            id: 'folder_001',
            name: 'Nature Photos',
            path: 'Nature Photos',
            color: '#4CAF50'
        },
        
        // 时间信息
        dateCreated: '2024-01-01T18:30:00.000Z',
        dateModified: '2024-01-02T09:15:00.000Z',
        dateAdded: '2024-01-01T20:00:00.000Z',
        
        // 元数据（如果 includeMetadata: true）
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
            hasAlpha: false,
            dominantColors: ['#FF6B35', '#F7931E', '#FFD23F']
        },
        
        // 文件信息（如果 includeFileInfo: true）
        fileInfo: {
            exists: true,
            readable: true,
            writable: false,
            executable: false,
            checksum: 'a1b2c3d4e5f6789...',
            lastAccessed: '2024-01-05T10:30:00.000Z'
        },
        
        // 缩略图（如果 includeThumbnail: true）
        thumbnail: {
            path: '/Users/username/Eagle/.thumbnails/eagle_item_001.jpg',
            base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...'
        }
    }
]
```

### getItemById()
根据 ID 获取项目

```javascript
/**
 * 根据 ID 获取项目详细信息
 * @param {string} itemId - 项目 ID
 * @param {Object} options - 查询选项
 * @returns {Promise<Object|null>} 项目信息或 null
 */
async getItemById(itemId, options = {})
```

**示例**:
```javascript
const item = await database.getItemById('eagle_item_001', {
    includeMetadata: true,
    includeFileInfo: true
});

if (item) {
    console.log('找到项目:', item.name);
    console.log('文件路径:', item.path);
    console.log('标签:', item.tags.join(', '));
} else {
    console.log('项目不存在');
}
```

### getItemsByIds()
批量获取项目

```javascript
/**
 * 根据 ID 数组批量获取项目
 * @param {Array<string>} itemIds - 项目 ID 数组
 * @param {Object} options - 查询选项
 * @returns {Promise<Array<Object>>} 项目数组
 */
async getItemsByIds(itemIds, options = {})
```

### searchItems()
搜索项目

```javascript
/**
 * 搜索 Eagle 库中的项目
 * @param {Object} criteria - 搜索条件
 * @param {Object} options - 搜索选项
 * @returns {Promise<Object>} 搜索结果
 */
async searchItems(criteria, options = {})
```

**搜索条件**:
```javascript
const searchCriteria = {
    // 关键词搜索
    keyword: 'sunset beach',
    
    // 标签搜索
    tags: {
        include: ['nature', 'landscape'],  // 必须包含的标签
        exclude: ['portrait'],             // 排除的标签
        mode: 'all'                        // 'all' | 'any'
    },
    
    // 文件类型
    type: 'image',  // 'image' | 'video' | 'audio' | 'document' | 'other'
    
    // 文件格式
    formats: ['jpg', 'png', 'tiff'],
    
    // 评分
    rating: {
        min: 3,
        max: 5
    },
    
    // 尺寸
    dimensions: {
        width: { min: 1920, max: 4096 },
        height: { min: 1080, max: 2160 }
    },
    
    // 文件大小
    size: {
        min: 1024 * 1024,      // 1MB
        max: 50 * 1024 * 1024   // 50MB
    },
    
    // 日期范围
    dateRange: {
        field: 'dateCreated',  // 'dateCreated' | 'dateModified' | 'dateAdded'
        start: '2024-01-01',
        end: '2024-01-31'
    },
    
    // 文件夹
    folders: {
        include: ['folder_001', 'folder_002'],
        exclude: ['folder_003'],
        includeSubfolders: true
    },
    
    // 颜色
    colors: {
        dominant: ['#FF6B35', '#F7931E'],
        tolerance: 20  // 颜色容差
    },
    
    // 注释
    annotation: {
        contains: 'beautiful',
        caseSensitive: false
    }
};
```

**搜索选项**:
```javascript
const searchOptions = {
    // 分页
    page: 1,
    limit: 50,
    
    // 排序
    sort: {
        field: 'dateCreated',  // 排序字段
        order: 'desc'          // 'asc' | 'desc'
    },
    
    // 包含选项
    include: {
        metadata: true,
        fileInfo: false,
        thumbnail: false
    },
    
    // 缓存
    cache: true,
    
    // 超时
    timeout: 30000
};
```

**返回值**:
```javascript
{
    items: [/* 项目数组 */],
    pagination: {
        page: 1,
        limit: 50,
        total: 156,
        pages: 4,
        hasNext: true,
        hasPrev: false
    },
    facets: {
        types: {
            image: 120,
            video: 25,
            document: 11
        },
        tags: {
            nature: 89,
            landscape: 67,
            portrait: 45
        },
        folders: {
            'Nature Photos': 89,
            'Portraits': 45,
            'Documents': 22
        }
    },
    searchTime: 156,  // 毫秒
    cached: false
}
```

**搜索示例**:
```javascript
// 搜索自然风景照片
const naturePhotos = await database.searchItems({
    tags: { include: ['nature', 'landscape'], mode: 'all' },
    type: 'image',
    rating: { min: 4 },
    dimensions: {
        width: { min: 1920 }
    }
}, {
    limit: 20,
    sort: { field: 'rating', order: 'desc' },
    include: { metadata: true }
});

console.log(`找到 ${naturePhotos.items.length} 张自然风景照片`);

// 搜索最近添加的视频
const recentVideos = await database.searchItems({
    type: 'video',
    dateRange: {
        field: 'dateAdded',
        start: '2024-01-01'
    }
}, {
    sort: { field: 'dateAdded', order: 'desc' },
    limit: 10
});

// 关键词搜索
const keywordResults = await database.searchItems({
    keyword: 'sunset beach vacation'
}, {
    limit: 30,
    include: { metadata: false, fileInfo: false }
});
```

## 文件夹管理 API

### getFolders()
获取文件夹列表

```javascript
/**
 * 获取 Eagle 库中的文件夹列表
 * @param {Object} options - 查询选项
 * @returns {Promise<Array<Object>>} 文件夹列表
 */
async getFolders(options = {})
```

**查询选项**:
```javascript
const folders = await database.getFolders({
    includeEmpty: true,        // 包含空文件夹
    includeSubfolders: true,   // 包含子文件夹
    includeItemCount: true,    // 包含项目数量
    sortBy: 'name',           // 'name' | 'dateCreated' | 'itemCount'
    sortOrder: 'asc'          // 'asc' | 'desc'
});
```

**返回值**:
```javascript
[
    {
        id: 'folder_001',
        name: 'Nature Photos',
        path: 'Nature Photos',
        color: '#4CAF50',
        description: 'Collection of nature photography',
        itemCount: 156,
        
        // 子文件夹
        subfolders: [
            {
                id: 'folder_002',
                name: 'Landscapes',
                path: 'Nature Photos/Landscapes',
                color: '#2196F3',
                itemCount: 89,
                subfolders: []
            },
            {
                id: 'folder_003',
                name: 'Wildlife',
                path: 'Nature Photos/Wildlife',
                color: '#FF9800',
                itemCount: 67,
                subfolders: []
            }
        ],
        
        // 时间信息
        dateCreated: '2024-01-01T00:00:00.000Z',
        dateModified: '2024-01-05T10:30:00.000Z',
        
        // 统计信息
        stats: {
            totalItems: 156,
            imageCount: 120,
            videoCount: 25,
            documentCount: 11,
            totalSize: 2147483648  // 字节
        }
    }
]
```

### getFolderById()
根据 ID 获取文件夹

```javascript
/**
 * 根据 ID 获取文件夹详细信息
 * @param {string} folderId - 文件夹 ID
 * @param {Object} options - 查询选项
 * @returns {Promise<Object|null>} 文件夹信息或 null
 */
async getFolderById(folderId, options = {})
```

### getFolderItems()
获取文件夹中的项目

```javascript
/**
 * 获取指定文件夹中的项目
 * @param {string} folderId - 文件夹 ID
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 文件夹项目列表
 */
async getFolderItems(folderId, options = {})
```

**示例**:
```javascript
const folderItems = await database.getFolderItems('folder_001', {
    page: 1,
    limit: 20,
    sort: { field: 'dateAdded', order: 'desc' },
    include: { metadata: false, fileInfo: false }
});

console.log(`文件夹中有 ${folderItems.pagination.total} 个项目`);
folderItems.items.forEach(item => {
    console.log(`- ${item.name} (${item.type})`);
});
```

## 标签管理 API

### getTags()
获取标签列表

```javascript
/**
 * 获取 Eagle 库中的所有标签
 * @param {Object} options - 查询选项
 * @returns {Promise<Array<Object>>} 标签列表
 */
async getTags(options = {})
```

**查询选项**:
```javascript
const tags = await database.getTags({
    includeCount: true,        // 包含使用次数
    includeColor: true,        // 包含标签颜色
    sortBy: 'count',          // 'name' | 'count' | 'dateCreated'
    sortOrder: 'desc',        // 'asc' | 'desc'
    minCount: 1,              // 最小使用次数
    search: 'nature'          // 搜索标签名称
});
```

**返回值**:
```javascript
[
    {
        name: 'nature',
        count: 245,
        color: '#4CAF50',
        dateCreated: '2023-06-15T10:00:00.000Z',
        lastUsed: '2024-01-05T09:30:00.000Z'
    },
    {
        name: 'landscape',
        count: 189,
        color: '#2196F3',
        dateCreated: '2023-06-20T14:30:00.000Z',
        lastUsed: '2024-01-04T16:45:00.000Z'
    },
    {
        name: 'portrait',
        count: 156,
        color: '#FF9800',
        dateCreated: '2023-07-01T09:15:00.000Z',
        lastUsed: '2024-01-03T11:20:00.000Z'
    }
]
```

### getTagById()
根据名称获取标签

```javascript
/**
 * 根据名称获取标签详细信息
 * @param {string} tagName - 标签名称
 * @returns {Promise<Object|null>} 标签信息或 null
 */
async getTagById(tagName)
```

### getItemsByTag()
获取包含特定标签的项目

```javascript
/**
 * 获取包含特定标签的项目
 * @param {string} tagName - 标签名称
 * @param {Object} options - 查询选项
 * @returns {Promise<Object>} 项目列表
 */
async getItemsByTag(tagName, options = {})
```

## 库信息 API

### getLibraryInfo()
获取库基本信息

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
    
    // 统计信息
    stats: {
        itemCount: 1247,
        folderCount: 23,
        tagCount: 156,
        totalSize: 5368709120,  // 字节
        
        // 类型分布
        typeDistribution: {
            image: 856,
            video: 234,
            audio: 89,
            document: 68
        },
        
        // 格式分布
        formatDistribution: {
            jpg: 456,
            png: 234,
            mp4: 123,
            pdf: 45
        }
    },
    
    // 时间信息
    dateCreated: '2023-01-01T00:00:00.000Z',
    dateModified: '2024-01-05T10:30:00.000Z',
    lastBackup: '2024-01-04T02:00:00.000Z',
    
    // 设置信息
    settings: {
        autoBackup: true,
        backupInterval: 86400000,  // 24 小时
        syncEnabled: false,
        thumbnailQuality: 'high',
        maxFileSize: 104857600,    // 100MB
        allowedFormats: ['jpg', 'png', 'gif', 'mp4', 'mov', 'pdf']
    },
    
    // 存储信息
    storage: {
        used: 5368709120,
        available: 494780612608,
        total: 500149321728,
        usagePercentage: 1.07
    }
}
```

### getLibraryStats()
获取库统计信息

```javascript
/**
 * 获取库的详细统计信息
 * @param {Object} options - 统计选项
 * @returns {Promise<Object>} 统计信息
 */
async getLibraryStats(options = {})
```

**统计选项**:
```javascript
const stats = await database.getLibraryStats({
    includeTypeDistribution: true,
    includeFormatDistribution: true,
    includeSizeDistribution: true,
    includeDateDistribution: true,
    includeTagDistribution: true,
    includeFolderDistribution: true,
    timeRange: {
        start: '2024-01-01',
        end: '2024-01-31'
    }
});
```

### getRecentActivity()
获取最近活动

```javascript
/**
 * 获取最近的库活动记录
 * @param {Object} options - 查询选项
 * @returns {Promise<Array<Object>>} 活动记录
 */
async getRecentActivity(options = {})
```

**返回值**:
```javascript
[
    {
        id: 'activity_001',
        type: 'item_added',
        itemId: 'eagle_item_123',
        itemName: 'new_photo.jpg',
        timestamp: '2024-01-05T10:30:00.000Z',
        details: {
            size: 2048576,
            type: 'image',
            folder: 'Nature Photos'
        }
    },
    {
        id: 'activity_002',
        type: 'item_modified',
        itemId: 'eagle_item_122',
        itemName: 'sunset.jpg',
        timestamp: '2024-01-05T10:25:00.000Z',
        details: {
            changes: ['tags', 'rating'],
            oldRating: 4,
            newRating: 5
        }
    }
]
```

## 缓存管理 API

### 缓存控制

#### clearCache()
清除缓存

```javascript
/**
 * 清除数据库缓存
 * @param {Object} options - 清除选项
 * @returns {Promise<Object>} 清除结果
 */
async clearCache(options = {})
```

**清除选项**:
```javascript
// 清除所有缓存
await database.clearCache();

// 清除特定类型的缓存
await database.clearCache({
    types: ['items', 'folders'],  // 'items' | 'folders' | 'tags' | 'search'
    olderThan: 300000            // 清除 5 分钟前的缓存
});

// 清除特定查询的缓存
await database.clearCache({
    queries: ['search:nature', 'folder:folder_001']
});
```

#### getCacheStats()
获取缓存统计

```javascript
/**
 * 获取缓存统计信息
 * @returns {Object} 缓存统计
 */
getCacheStats()
```

**返回值**:
```javascript
{
    enabled: true,
    size: 156,
    maxSize: 1000,
    hitRate: 0.78,
    missRate: 0.22,
    totalHits: 1247,
    totalMisses: 345,
    memoryUsage: 52428800,  // 字节
    oldestEntry: '2024-01-05T10:00:00.000Z',
    newestEntry: '2024-01-05T10:30:00.000Z'
}
```

## 事务管理 API

### 事务操作

#### beginTransaction()
开始事务

```javascript
/**
 * 开始数据库事务
 * @param {Object} options - 事务选项
 * @returns {Promise<Transaction>} 事务对象
 */
async beginTransaction(options = {})
```

#### 事务使用示例

```javascript
// 使用事务进行批量操作
const transaction = await database.beginTransaction();

try {
    // 在事务中执行多个操作
    const items = await transaction.searchItems({ type: 'image' });
    
    for (const item of items.items) {
        await transaction.updateItem(item.id, {
            tags: [...item.tags, 'processed']
        });
    }
    
    // 提交事务
    await transaction.commit();
    console.log('批量更新完成');
    
} catch (error) {
    // 回滚事务
    await transaction.rollback();
    console.error('批量更新失败，已回滚:', error);
}
```

## 监听和事件 API

### 数据变更监听

#### watchChanges()
监听数据变更

```javascript
/**
 * 监听数据库变更
 * @param {Object} options - 监听选项
 * @returns {EventEmitter} 事件发射器
 */
watchChanges(options = {})
```

**监听示例**:
```javascript
// 监听所有变更
const watcher = database.watchChanges();

watcher.on('item:added', (item) => {
    console.log('新增项目:', item.name);
});

watcher.on('item:modified', (item, changes) => {
    console.log('项目修改:', item.name, changes);
});

watcher.on('item:deleted', (itemId) => {
    console.log('项目删除:', itemId);
});

watcher.on('folder:added', (folder) => {
    console.log('新增文件夹:', folder.name);
});

watcher.on('tag:added', (tag) => {
    console.log('新增标签:', tag.name);
});

// 停止监听
watcher.stop();
```

#### 选择性监听

```javascript
// 只监听特定文件夹的变更
const folderWatcher = database.watchChanges({
    folders: ['folder_001', 'folder_002'],
    events: ['item:added', 'item:modified']
});

// 只监听特定类型的项目
const imageWatcher = database.watchChanges({
    itemTypes: ['image'],
    events: ['item:added']
});
```

## 性能优化 API

### 查询优化

#### createIndex()
创建索引

```javascript
/**
 * 创建数据库索引以提高查询性能
 * @param {Object} indexConfig - 索引配置
 * @returns {Promise<Object>} 创建结果
 */
async createIndex(indexConfig)
```

**索引配置示例**:
```javascript
// 为标签创建索引
await database.createIndex({
    name: 'tags_index',
    fields: ['tags'],
    type: 'btree'
});

// 为日期创建索引
await database.createIndex({
    name: 'date_index',
    fields: ['dateCreated', 'dateModified'],
    type: 'btree'
});

// 为文件类型创建索引
await database.createIndex({
    name: 'type_index',
    fields: ['type', 'ext'],
    type: 'hash'
});
```

#### optimizeQueries()
优化查询

```javascript
/**
 * 优化数据库查询性能
 * @returns {Promise<Object>} 优化结果
 */
async optimizeQueries()
```

### 批量操作

#### batchQuery()
批量查询

```javascript
/**
 * 执行批量查询操作
 * @param {Array<Object>} queries - 查询数组
 * @param {Object} options - 批量选项
 * @returns {Promise<Array<Object>>} 查询结果数组
 */
async batchQuery(queries, options = {})
```

**批量查询示例**:
```javascript
const batchResults = await database.batchQuery([
    {
        type: 'getItemById',
        params: ['eagle_item_001']
    },
    {
        type: 'searchItems',
        params: [{ tags: { include: ['nature'] } }]
    },
    {
        type: 'getFolders',
        params: [{ includeItemCount: true }]
    }
], {
    parallel: true,
    maxConcurrency: 3
});

console.log('批量查询结果:', batchResults);
```

## 错误处理

### 错误类型

#### DatabaseError
数据库基础错误

```javascript
class DatabaseError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'DatabaseError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}
```

#### ConnectionError
连接错误

```javascript
class ConnectionError extends DatabaseError {
    constructor(message, libraryPath) {
        super(message, 'CONNECTION_ERROR', { libraryPath });
        this.name = 'ConnectionError';
    }
}
```

#### QueryError
查询错误

```javascript
class QueryError extends DatabaseError {
    constructor(message, query, details = {}) {
        super(message, 'QUERY_ERROR', { query, ...details });
        this.name = 'QueryError';
    }
}
```

### 错误代码

#### 连接错误
- `CONNECTION_FAILED` - 数据库连接失败
- `LIBRARY_NOT_FOUND` - Eagle 库不存在
- `LIBRARY_ACCESS_DENIED` - 库访问被拒绝
- `LIBRARY_CORRUPTED` - 库文件损坏
- `VERSION_MISMATCH` - 版本不匹配

#### 查询错误
- `QUERY_FAILED` - 查询执行失败
- `INVALID_QUERY` - 无效的查询
- `QUERY_TIMEOUT` - 查询超时
- `RESULT_TOO_LARGE` - 结果集过大

#### 数据错误
- `ITEM_NOT_FOUND` - 项目不存在
- `FOLDER_NOT_FOUND` - 文件夹不存在
- `TAG_NOT_FOUND` - 标签不存在
- `INVALID_DATA` - 无效数据

### 错误处理示例

```javascript
try {
    const items = await database.searchItems({
        keyword: 'nature',
        type: 'image'
    });
    
    console.log('搜索成功:', items.items.length);
    
} catch (error) {
    if (error instanceof ConnectionError) {
        console.error('数据库连接错误:', error.message);
        console.error('库路径:', error.details.libraryPath);
        
        // 尝试重新连接
        await database.reconnect();
        
    } else if (error instanceof QueryError) {
        console.error('查询错误:', error.message);
        console.error('查询条件:', error.details.query);
        
    } else {
        console.error('未知错误:', error);
    }
}
```

## 使用示例

### 基础使用

```javascript
const { EagleDatabase } = require('./eagle-database');

// 创建数据库实例
const database = new EagleDatabase({
    libraryPath: '/Users/username/Eagle',
    autoConnect: true,
    cache: {
        enabled: true,
        ttl: 300000
    }
});

// 连接数据库
try {
    await database.connect();
    console.log('数据库连接成功');
    
    // 获取库信息
    const libraryInfo = await database.getLibraryInfo();
    console.log('库名称:', libraryInfo.name);
    console.log('项目数量:', libraryInfo.stats.itemCount);
    
    // 获取选中项目
    const selectedItems = await database.getSelectedItems({
        includeMetadata: true
    });
    
    if (selectedItems.length > 0) {
        console.log('当前选中项目:');
        selectedItems.forEach(item => {
            console.log(`- ${item.name} (${item.type})`);;
            console.log(`  路径: ${item.path}`);
            console.log(`  标签: ${item.tags.join(', ')}`);
        });
    } else {
        console.log('没有选中的项目');
    }
    
} catch (error) {
    console.error('数据库操作失败:', error);
}
```

### 高级搜索示例

```javascript
// 复杂搜索示例
async function performAdvancedSearch() {
    try {
        // 搜索高质量的自然风景照片
        const landscapePhotos = await database.searchItems({
            tags: {
                include: ['nature', 'landscape'],
                exclude: ['portrait', 'indoor'],
                mode: 'all'
            },
            type: 'image',
            rating: { min: 4 },
            dimensions: {
                width: { min: 1920 },
                height: { min: 1080 }
            },
            size: {
                min: 1024 * 1024,  // 至少 1MB
                max: 50 * 1024 * 1024  // 最多 50MB
            },
            dateRange: {
                field: 'dateCreated',
                start: '2023-01-01',
                end: '2024-12-31'
            }
        }, {
            limit: 50,
            sort: { field: 'rating', order: 'desc' },
            include: {
                metadata: true,
                fileInfo: false
            }
        });
        
        console.log(`找到 ${landscapePhotos.items.length} 张符合条件的风景照片`);
        
        // 分析搜索结果
        const avgRating = landscapePhotos.items.reduce((sum, item) => 
            sum + item.rating, 0) / landscapePhotos.items.length;
        
        console.log(`平均评分: ${avgRating.toFixed(2)}`);
        
        // 按文件夹分组
        const folderGroups = landscapePhotos.items.reduce((groups, item) => {
            const folderName = item.folder.name;
            if (!groups[folderName]) {
                groups[folderName] = [];
            }
            groups[folderName].push(item);
            return groups;
        }, {});
        
        console.log('按文件夹分布:');
        Object.entries(folderGroups).forEach(([folder, items]) => {
            console.log(`  ${folder}: ${items.length} 张`);
        });
        
    } catch (error) {
        console.error('搜索失败:', error);
    }
}
```

### 数据监听示例

```javascript
// 设置数据变更监听
function setupDataWatcher() {
    const watcher = database.watchChanges({
        events: ['item:added', 'item:modified', 'item:deleted']
    });
    
    watcher.on('item:added', (item) => {
        console.log(`新增项目: ${item.name}`);
        
        // 通知 WebSocket 客户端
        webSocketServer.broadcast('eagle_item_added', {
            item: item,
            timestamp: new Date().toISOString()
        });
    });
    
    watcher.on('item:modified', (item, changes) => {
        console.log(`项目修改: ${item.name}`);
        console.log('变更内容:', changes);
        
        // 通知 WebSocket 客户端
        webSocketServer.broadcast('eagle_item_modified', {
            item: item,
            changes: changes,
            timestamp: new Date().toISOString()
        });
    });
    
    watcher.on('item:deleted', (itemId) => {
        console.log(`项目删除: ${itemId}`);
        
        // 通知 WebSocket 客户端
        webSocketServer.broadcast('eagle_item_deleted', {
            itemId: itemId,
            timestamp: new Date().toISOString()
        });
    });
    
    // 处理监听错误
    watcher.on('error', (error) => {
        console.error('数据监听错误:', error);
        
        // 尝试重新启动监听
        setTimeout(() => {
            setupDataWatcher();
        }, 5000);
    });
    
    return watcher;
}
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始 Eagle 数据库 API 文档 | 开发团队 |

---

**相关文档**:
- [Eagle 插件 API](./plugin-api.md)
- [WebSocket 服务器 API](./websocket-server.md)
- [Eagle 插件架构](../architecture/eagle-plugin-architecture.md)