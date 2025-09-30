## 日志系统增强 *(v2.4.0增强)*

### LogManager 类增强

#### setLevel()
设置日志级别

```javascript
/**
 * 设置日志级别
 * @param {string} level - 日志级别 ('debug', 'info', 'warn', 'error')
 */
setLevel(level)
```

#### createLogger()
创建子日志器

```javascript
/**
 * 创建子日志器
 * @param {string} name - 日志器名称
 * @returns {Logger} 子日志器实例
 */
createLogger(name)
```

#### enableFileLogging()
启用文件日志

```javascript
/**
 * 启用文件日志
 * @param {string} filePath - 日志文件路径
 * @param {Object} [options={}] - 选项
 */
enableFileLogging(filePath, options = {})
```

### 结构化日志

```javascript
// 使用结构化日志记录
logger.info('文件导入完成', {
    files: fileList.length,
    duration: Date.now() - startTime,
    success: true,
    composition: compName
});

// 记录性能指标
logger.perf('status_check', {
    duration: 1250,
    cacheHit: false,
    errors: 0
});

// 记录用户操作
logger.user('button_click', {
    button: 'import_files',
    context: 'main_panel',
    timestamp: Date.now()
});
```
