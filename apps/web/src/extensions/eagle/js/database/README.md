# EcoPaste数据库读取模块

这个模块提供了读取EcoPaste剪贴板管理工具数据库的功能，允许Eagle插件访问和查询EcoPaste的剪贴板历史记录。

## 功能特性

- ✅ 连接和读取EcoPaste SQLite数据库
- ✅ 查询剪贴板历史记录
- ✅ 按类型过滤（文本、图片、文件）
- ✅ 搜索功能
- ✅ 获取收藏项目
- ✅ 统计信息
- ✅ 完整的错误处理
- ✅ 简洁的API接口

## 文件结构

```
js/database/
├── sqlite-reader.js      # SQLite数据库读取器
├── database-manager.js   # 数据库管理器
├── index.js             # API接口
├── test-database.js     # 基础测试
├── test-api.js          # API测试
└── README.md           # 说明文档
```

## 快速开始

### 1. 基本使用

```javascript
const { init, getRecent, close } = require('./js/database');

// 初始化数据库
const initResult = await init();
if (initResult.success) {
    console.log('数据库连接成功');
    
    // 获取最近的10条记录
    const recent = await getRecent(10);
    console.log('最近记录:', recent.data);
    
    // 关闭连接
    await close();
}
```

### 2. 高级查询

```javascript
const { init, getByType, search, getFavorites, getStats } = require('./js/database');

await init();

// 获取文本类型的记录
const textItems = await getByType('text', 20);

// 搜索包含特定关键词的记录
const searchResults = await search('关键词', 30);

// 获取收藏的记录
const favorites = await getFavorites(50);

// 获取统计信息
const stats = await getStats();
console.log('统计信息:', stats.data);
```

## API 参考

### 初始化和状态

#### `init()`
初始化数据库连接
- **返回**: `Promise<Object>` - 包含success、message和statistics的对象

#### `close()`
关闭数据库连接
- **返回**: `Promise<void>`

#### `isReady()`
检查数据库是否就绪
- **返回**: `boolean`

#### `getStatus()`
获取数据库状态信息
- **返回**: `Object` - 包含initialized、ready和dbPath的对象

### 数据查询

#### `getRecent(count)`
获取最近的剪贴板记录
- **参数**: `count` (number) - 记录数量，默认10
- **返回**: `Promise<Object>` - 查询结果

#### `getByType(type, count)`
按类型获取剪贴板记录
- **参数**: 
  - `type` (string) - 类型：'text'、'image'、'files'
  - `count` (number) - 记录数量，默认20
- **返回**: `Promise<Object>` - 查询结果

#### `search(query, count)`
搜索剪贴板记录
- **参数**: 
  - `query` (string) - 搜索关键词
  - `count` (number) - 记录数量，默认30
- **返回**: `Promise<Object>` - 查询结果

#### `getFavorites(count)`
获取收藏的剪贴板记录
- **参数**: `count` (number) - 记录数量，默认50
- **返回**: `Promise<Object>` - 查询结果

#### `getStats()`
获取数据库统计信息
- **返回**: `Promise<Object>` - 统计信息

## 数据结构

### 剪贴板记录对象

```javascript
{
    id: string,              // 唯一标识符
    type: string,            // 类型：'text'、'image'、'files'、'html'、'rtf'
    group: string,           // 分组：'text'、'image'、'files'
    content: string,         // 内容
    searchText: string,      // 搜索文本
    count: number,           // 使用次数
    dimensions: {            // 尺寸信息（图片）
        width: number,
        height: number
    },
    isFavorite: boolean,     // 是否收藏
    createdAt: string,       // 创建时间
    note: string,            // 备注
    subtype: string          // 子类型
}
```

### 统计信息对象

```javascript
{
    total: number,           // 总记录数
    byType: {               // 按类型统计
        text: number,
        image: number,
        files: number
    },
    favorites: number,       // 收藏数量
    lastUpdated: string     // 最后更新时间
}
```

## 测试

### 运行基础测试
```bash
node js/database/test-database.js
```

### 运行API测试
```bash
node js/database/test-api.js
```

## 配置

### 数据库路径
默认数据库路径：`C:\Users\Administrator\AppData\Roaming\com.ayangweb.EcoPaste\EcoPaste.db`

如需修改路径，可以在`sqlite-reader.js`中的`getEcoPasteDatabasePath()`方法中调整。

## 错误处理

所有API方法都返回统一的结果格式：

```javascript
{
    success: boolean,        // 操作是否成功
    message: string,         // 结果消息
    data: any,              // 返回数据（成功时）
    error: string,          // 错误信息（失败时）
    count: number           // 记录数量（查询时）
}
```

## 注意事项

1. **权限要求**: 需要读取EcoPaste数据库文件的权限
2. **数据库锁定**: 如果EcoPaste正在运行，可能会遇到数据库锁定问题
3. **路径依赖**: 确保EcoPaste数据库文件存在于预期路径
4. **内存使用**: 大量数据查询时注意内存使用情况

## 依赖项

- `sqlite3`: SQLite数据库驱动
- `path`: Node.js路径处理模块
- `os`: Node.js操作系统模块

## 版本历史

- **v1.0.0**: 初始版本，支持基本的数据库读取功能

## 许可证

本模块遵循项目的整体许可证。