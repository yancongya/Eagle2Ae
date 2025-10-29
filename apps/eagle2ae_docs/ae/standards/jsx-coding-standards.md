# JSX 编码规范

## 概述

本文档定义了 Eagle2Ae After Effects CEP 扩展的 JSX 编码规范和最佳实践，确保 ExtendScript 代码质量、可维护性和团队协作效率。

## 基础语法规范

### 函数定义

```javascript
/**
 * 导入文件到 After Effects 项目
 * @param {string} filePath - 文件绝对路径
 * @param {Object} options - 导入选项
 * @returns {Object} 导入结果
 */
function importFileToProject(filePath, options) {
    // 设置默认选项
    options = options || {};
    
    try {
        // 验证文件存在性
        var file = new File(filePath);
        if (!file.exists) {
            return {
                success: false,
                error: '文件不存在: ' + filePath
            };
        }
        
        // 执行导入操作
        var importOptions = new ImportOptions(file);
        var importedItem = app.project.importFile(importOptions);
        
        return {
            success: true,
            item: {
                id: importedItem.id,
                name: importedItem.name,
                typeName: importedItem.typeName
            }
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

### 变量声明

```javascript
// 使用 var 声明变量（JSX 不支持 let/const）
function processMultipleFiles(fileList) {
    var results = [];
    var successCount = 0;
    var failureCount = 0;
    
    // 循环处理文件
    for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];
        var result = importFileToProject(file.path, file.options);
        
        if (result.success) {
            successCount++;
        } else {
            failureCount++;
        }
        
        results.push(result);
    }
    
    return {
        results: results,
        summary: {
            total: fileList.length,
            success: successCount,
            failure: failureCount
        }
    };
}
```

### 错误处理

```javascript
// JSX 错误处理模式
function safeExecuteOperation(operation, operationName) {
    try {
        var result = operation();
        
        // 记录成功日志
        $.writeln('[INFO] ' + operationName + ' 执行成功');
        
        return {
            success: true,
            data: result
        };
        
    } catch (error) {
        // 记录错误日志
        $.writeln('[ERROR] ' + operationName + ' 执行失败: ' + error.toString());
        
        return {
            success: false,
            error: error.toString(),
            errorLine: error.line || 'unknown'
        };
    }
}

// 使用示例
function createComposition(name, width, height) {
    return safeExecuteOperation(function() {
        return app.project.items.addComp(name, width, height, 1, 10, 30);
    }, '创建合成');
}
```

## JSX 最佳实践

### 撤销组管理

```javascript
// 正确使用撤销组
function batchImportFiles(fileList) {
    // 开始撤销组
    app.beginUndoGroup('Eagle2Ae 批量导入');
    
    try {
        var results = [];
        
        for (var i = 0; i < fileList.length; i++) {
            var result = importFileToProject(fileList[i].path);
            results.push(result);
        }
        
        // 成功完成，结束撤销组
        app.endUndoGroup();
        
        return {
            success: true,
            results: results
        };
        
    } catch (error) {
        // 发生错误，结束撤销组
        app.endUndoGroup();
        
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

### 项目状态检查

```javascript
// 检查项目状态
function validateProjectState() {
    var issues = [];
    
    // 检查项目是否打开
    if (!app.project) {
        issues.push('没有打开的项目');
    }
    
    // 检查项目是否已保存
    if (app.project && !app.project.file) {
        issues.push('项目尚未保存');
    }
    
    // 检查内存使用情况
    if (app.memoryInUse > 0.8 * system.totalPhysicalMemory) {
        issues.push('内存使用率过高');
    }
    
    return {
        valid: issues.length === 0,
        issues: issues
    };
}

// 在执行操作前检查状态
function safeImportFiles(fileList) {
    var validation = validateProjectState();
    
    if (!validation.valid) {
        return {
            success: false,
            error: '项目状态检查失败: ' + validation.issues.join(', ')
        };
    }
    
    return batchImportFiles(fileList);
}
```

### 性能优化

```javascript
// 避免频繁的 UI 更新
function processFilesWithProgress(fileList, progressCallback) {
    var total = fileList.length;
    var processed = 0;
    
    // 批量处理，减少 UI 更新频率
    for (var i = 0; i < total; i++) {
        importFileToProject(fileList[i].path);
        processed++;
        
        // 每处理 10 个文件更新一次进度
        if (processed % 10 === 0 || processed === total) {
            if (progressCallback) {
                progressCallback(processed, total);
            }
            
            // 允许 UI 更新
            app.scheduleTask(function() {}, 1, false);
        }
    }
}
```

### 内存管理

```javascript
// 及时释放文件对象
function processFile(filePath) {
    var file = new File(filePath);
    
    try {
        if (file.exists) {
            // 处理文件
            var content = file.read();
            // 处理内容...
        }
    } finally {
        // 确保文件对象被释放
        file.close();
        file = null;
    }
}

// 清理临时变量
function cleanupTempVariables() {
    // 清理大型数组或对象
    if (typeof tempArray !== 'undefined') {
        tempArray = null;
    }
    
    if (typeof tempObject !== 'undefined') {
        tempObject = null;
    }
}
```

## 命名规范

### 函数命名

```javascript
// 动词开头，描述操作
function importFileToProject(filePath) { /* ... */ }
function validateFilePath(filePath) { /* ... */ }
function createCompositionFromFiles(files) { /* ... */ }
function organizeProjectFolders() { /* ... */ }

// 布尔值函数使用 is/has 前缀
function isFileSupported(filePath) { /* ... */ }
function hasValidProject() { /* ... */ }
function isValidComposition(comp) { /* ... */ }
```

### 变量命名

```javascript
// 描述性命名
var fileList = [];           // 文件列表
var projectItems = [];       // 项目项
var importSettings = {};     // 导入设置
var errorMessage = '';       // 错误消息

// 循环变量
for (var i = 0; i < fileList.length; i++) {
    var currentFile = fileList[i];
    // 处理当前文件
}

// 临时变量
var tempResult = null;
var tempArray = [];
```

## 注释规范

### 函数注释

```javascript
/**
 * 导入文件到 After Effects 项目
 * @param {string} filePath - 文件绝对路径
 * @param {Object} [options] - 导入选项
 * @param {string} [options.importAs=footage] - 导入类型 ('footage', 'composition', 'footageInterpretation')
 * @param {boolean} [options.createProxy=false] - 是否创建代理
 * @returns {Object} 导入结果
 * @returns {boolean} returns.success - 是否成功
 * @returns {Object} [returns.item] - 导入的项目项
 * @returns {string} [returns.error] - 错误信息
 */
function importFileToProject(filePath, options) {
    // 实现代码...
}
```

### 复杂逻辑注释

```javascript
function processComplexImport(fileList, settings) {
    // 1. 验证输入参数
    if (!fileList || fileList.length === 0) {
        throw new Error('文件列表不能为空');
    }
    
    // 2. 过滤支持的文件格式
    var supportedFiles = fileList.filter(function(file) {
        return isFileSupported(file.path);
    });
    
    // 3. 检查项目状态
    var projectState = validateProjectState();
    if (!projectState.valid) {
        throw new Error('项目状态无效: ' + projectState.issues.join(', '));
    }
    
    // 4. 执行批量导入
    var results = batchImportFiles(supportedFiles, settings);
    
    // 5. 组织项目结构
    if (settings.organizeFolders) {
        organizeImportedItems(results);
    }
    
    return results;
}
```

## 错误处理最佳实践

### 自定义错误类型

```javascript
/**
 * 文件导入错误
 * @param {string} message - 错误消息
 * @param {string} code - 错误代码
 * @param {string} filePath - 相关文件路径
 */
function FileImportError(message, code, filePath) {
    this.name = 'FileImportError';
    this.message = message;
    this.code = code;
    this.filePath = filePath;
    this.stack = (new Error()).stack;
}

FileImportError.prototype = Object.create(Error.prototype);
FileImportError.prototype.constructor = FileImportError;
```

### 错误处理模式

```javascript
/**
 * 安全执行文件操作
 * @param {Function} operation - 要执行的操作
 * @param {string} operationName - 操作名称
 * @returns {Object} 操作结果
 */
function safeFileOperation(operation, operationName) {
    try {
        var result = operation();
        
        // 记录成功日志
        $.writeln('[SUCCESS] ' + operationName + ' 完成');
        
        return {
            success: true,
            data: result
        };
        
    } catch (error) {
        // 记录错误日志
        $.writeln('[ERROR] ' + operationName + ' 失败: ' + error.toString());
        
        return {
            success: false,
            error: {
                message: error.toString(),
                name: error.name,
                line: error.line || 'unknown'
            }
        };
    }
}
```

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2024-01-05 | 1.0 | 初始 JSX 编码规范文档 | 开发团队 |

---

**相关文档**:
- [JavaScript 编码规范](./javascript-coding-standards.md)
- [文件组织规范](./file-organization-standards.md)
- [项目规范](./project-standards.md)