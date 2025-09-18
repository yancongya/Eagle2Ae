# JSX 脚本 API 参考

## 概述

本文档描述了 Eagle2Ae 扩展中使用的 ExtendScript (JSX) API，这些脚本在 After Effects 主机环境中执行，负责实际的项目操作。

**版本**: v2.3.0
**更新时间**: 2025年9月18日
**特性**: 强制中文文件名解码、序列帧识别、对话框系统、文件夹打开功能、增强错误处理

## 核心函数

### testExtendScriptConnection()

测试 ExtendScript 连接

```javascript
/**
 * 测试 ExtendScript 连接状态
 * 验证 ExtendScript 环境是否正常工作
 * @returns {string} JSON 格式的连接状态信息
 */
function testExtendScriptConnection()
```

**返回值**:

```json
{
    "success": true,
    "message": "ExtendScript连接正常",
    "timestamp": "Fri Jan 05 2024 18:30:00 GMT+0800",
    "aeVersion": "24.0.0",
    "scriptVersion": "v2.1.1 - 强制中文文件名解码"
}
```

**错误返回**:

```json
{
    "success": false,
    "error": "错误描述信息"
}
```

### 图层分析模块

#### detectSelectedLayers()
- **描述**: 核心图层分析函数。遍历当前活动合成中所有选中的图层，并为每个图层生成详细的分析数据，包括图层类型、素材类型、导出状态、文件路径等。
- **返回**: `String` - 一个包含分析结果数组的JSON字符串。
- **调用方式**: 由 `main.js` 中的 `detectLayers` 函数调用。
- **数据流**: **此函数返回的JSON数据现在由前端的 `js/ui/summary-dialog.js` 组件负责接收和渲染**，而不是由JSX脚本直接生成UI。

#### analyzeLayer(layer, index)
- **描述**: `detectSelectedLayers` 的内部辅助函数，负责分析单个图层。它包含了识别图像序列、处理图层蒙版等复杂逻辑。
- **返回**: `Object` - 包含单个图层所有分析信息的对象。

#### showLayerDetectionSummary(params)
- **文件**: `jsx/dialog-summary.jsx`
- **描述**: (旧版) 调用一个AE原生的 `Window('dialog')` 来显示图层检测结果。
- **状态**: **[已废弃]**。此函数及其所在的 `dialog-summary.jsx` 文件已被新的HTML对话框 `js/ui/summary-dialog.js` 取代。前端不再调用此函数来显示结果。

### 图层导出模块

#### exportSingleLayer(layer, layerInfo, comp, exportFolder)
- **描述**: 核心的单图层/单帧导出函数。根据传入的图层信息，将其渲染并导出一个PNG文件。
- **调用方式**: 通常由前端的 `handleLayerExport` 逻辑间接触发。
- **实现细节**:
    1.  在AE中创建一个临时的、不可见的合成 (Temporary Composition)。
    2.  将被选中的图层（或合成的当前帧）添加到这个临时合成中，以实现隔离渲染。
    3.  将该临时合成添加到渲染队列，并设置为导出单帧PNG格式的图片。
    4.  执行渲染，操作完成后清理临时合成并返回结果。
- **返回**: `Object` - 包含导出是否成功、文件名、路径等信息。

## 核心模块

### 主机脚本 (hostscript.jsx)

主机脚本是 CEP 扩展与 After Effects 通信的桥梁，提供了所有核心功能的实现。

#### 初始化函数

##### initializeExtension()

初始化扩展环境

```javascript
/**
 * 初始化扩展环境
 * @returns {Object} 初始化结果
 */
function initializeExtension() {
    try {
        // 设置全局变量
        if (typeof EAGLE2AE_INITIALIZED === 'undefined') {
            EAGLE2AE_INITIALIZED = true;
            EAGLE2AE_VERSION = '1.0.0';
            EAGLE2AE_DEBUG = false;
        }
      
        return {
            success: true,
            version: EAGLE2AE_VERSION,
            aeVersion: app.version,
            projectName: app.project.file ? app.project.file.name : 'Untitled'
        };
    } catch (error) {
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

##### getSystemInfo()

获取系统信息

```javascript
/**
 * 获取系统和应用信息
 * @returns {Object} 系统信息
 */
function getSystemInfo() {
    return {
        aeVersion: app.version,
        aeBuild: app.buildNumber,
        osVersion: system.osVersion,
        language: app.isoLanguage,
        projectInfo: {
            name: app.project.file ? app.project.file.name : 'Untitled',
            path: app.project.file ? app.project.file.fsName : null,
            modified: app.project.dirty,
            itemCount: app.project.items.length
        }
    };
}
```

### 文件夹打开模块

#### openLayerFolder()

打开图层文件所在文件夹

```javascript
/**
 * 打开图层文件所在文件夹（使用JSX原生Folder对象和URI解码）
 * 参考7zhnegli3.jsx脚本的编解码和文件夹打开功能
 * @param {Object} layer - 图层对象
 * @returns {void}
 */
function openLayerFolder(layer)
```

**功能特性**:
- 支持多种路径获取策略（tooltipInfo、sourceInfo、source.file等）
- 使用URI解码处理中文路径编码问题
- JSX原生Folder对象和execute()方法
- Windows Explorer备用打开方案
- 智能错误处理和用户提示

**路径获取优先级**:
1. `layer.tooltipInfo.originalPath` - Demo模式数据
2. `layer.sourceInfo.originalPath` - 源信息路径
3. `layer.source.file.fsName` - 文件系统名称
4. `layer.source.file.fullName` - 完整文件名
5. `layer.originalPath` - 原始路径属性

**使用示例**:
```javascript
// 基本使用
var layer = app.project.activeItem.selectedLayers[0];
openLayerFolder(layer);

// 在图层检测结果中使用
var detectionResults = getCompositionLayers();
for (var i = 0; i < detectionResults.length; i++) {
    var layer = detectionResults[i];
    if (layer.canExport) {
        // 为可导出图层添加文件夹打开功能
        openLayerFolder(layer);
    }
}
```

#### decodeStr()

URI解码函数，处理中文路径编码问题

```javascript
/**
 * URI解码函数，参考7zhnegli3.jsx脚本实现
 * @param {string} str - 需要解码的字符串
 * @returns {string} 解码后的字符串
 */
function decodeStr(str)
```

**功能说明**:
- 使用`decodeURIComponent`进行URI解码
- 安全的错误处理，解码失败时返回原字符串
- 专门解决中文文件名编码问题

#### openFolderWithJSX()

使用JSX原生Folder对象打开文件夹

```javascript
/**
 * 使用JSX原生Folder对象打开文件夹
 * 参考7zhnegli3.jsx脚本中的outputFolder.execute()方法
 * @param {string} folderPath - 文件夹路径
 * @returns {boolean} 是否成功打开
 */
function openFolderWithJSX(folderPath)
```

**实现特点**:
- 创建JSX原生Folder对象
- 验证文件夹存在性
- 使用execute()方法打开文件夹
- 失败时自动调用备用方案

#### openFolderWithExplorerBackup()

备用方法：使用Windows Explorer打开文件夹

```javascript
/**
 * 备用方法：使用Windows Explorer打开文件夹
 * 当JSX原生方法失败时使用
 * @param {string} folderPath - 文件夹路径
 * @returns {boolean} 是否成功打开
 */
function openFolderWithExplorerBackup(folderPath)
```

**技术实现**:
- 使用双引号包围路径处理空格和中文字符
- 调用`system.callSystem`执行explorer.exe命令
- 返回码检查确认执行结果

### 文件导入模块

#### importFileToProject()

导入单个文件到项目

```javascript
/**
 * 导入文件到 After Effects 项目
 * @param {string} filePath - 文件绝对路径
 * @param {Object} options - 导入选项
 * @param {string} options.importAs - 导入类型 ('footage'|'composition'|'project')
 * @param {boolean} options.sequence - 是否作为序列导入
 * @param {boolean} options.forceAlphabetical - 强制字母排序
 * @param {string} options.folder - 目标文件夹名称
 * @param {boolean} options.replaceExisting - 是否替换现有项目
 * @returns {Object} 导入结果
 */
function importFileToProject(filePath, options) {
    options = options || {};
  
    try {
        // 验证文件路径
        var file = new File(filePath);
        if (!file.exists) {
            return {
                success: false,
                error: '文件不存在: ' + filePath
            };
        }
      
        // 获取或创建目标文件夹
        var targetFolder = null;
        if (options.folder) {
            targetFolder = getOrCreateFolder(options.folder);
        }
      
        // 执行导入
        var importOptions = new ImportOptions(file);
      
        // 设置导入选项
        if (options.importAs === 'composition') {
            importOptions.importAs = ImportAsType.COMP;
        } else if (options.importAs === 'project') {
            importOptions.importAs = ImportAsType.PROJECT;
        } else {
            importOptions.importAs = ImportAsType.FOOTAGE;
        }
      
        if (options.sequence) {
            importOptions.sequence = true;
        }
      
        if (options.forceAlphabetical) {
            importOptions.forceAlphabetical = true;
        }
      
        // 导入文件
        var importedItem = app.project.importFile(importOptions);
      
        // 移动到目标文件夹
        if (targetFolder && importedItem) {
            importedItem.parentFolder = targetFolder;
        }
      
        return {
            success: true,
            item: {
                id: importedItem.id,
                name: importedItem.name,
                typeName: importedItem.typeName,
                folder: targetFolder ? targetFolder.name : null,
                duration: importedItem.duration || 0,
                width: importedItem.width || 0,
                height: importedItem.height || 0
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

#### importMultipleFiles()

批量导入文件

```javascript
/**
 * 批量导入文件到项目
 * @param {Array} fileList - 文件信息数组
 * @param {Object} globalOptions - 全局导入选项
 * @returns {Object} 批量导入结果
 */
function importMultipleFiles(fileList, globalOptions) {
    globalOptions = globalOptions || {};
  
    var results = {
        success: true,
        imported: 0,
        failed: 0,
        details: {
            successItems: [],
            failedItems: []
        }
    };
  
    // 开始撤销组
    app.beginUndoGroup('Eagle2Ae 批量导入');
  
    try {
        for (var i = 0; i < fileList.length; i++) {
            var fileInfo = fileList[i];
            var filePath = fileInfo.path;
          
            // 合并文件特定选项和全局选项
            var options = {};
            for (var key in globalOptions) {
                options[key] = globalOptions[key];
            }
            if (fileInfo.options) {
                for (var key in fileInfo.options) {
                    options[key] = fileInfo.options[key];
                }
            }
          
            // 导入单个文件
            var result = importFileToProject(filePath, options);
          
            if (result.success) {
                results.imported++;
                results.details.successItems.push({
                    originalPath: filePath,
                    name: fileInfo.name || result.item.name,
                    item: result.item
                });
            } else {
                results.failed++;
                results.details.failedItems.push({
                    originalPath: filePath,
                    name: fileInfo.name || filePath,
                    error: result.error
                });
            }
        }
      
        // 如果有失败项目，标记整体结果
        if (results.failed > 0) {
            results.success = false;
        }
      
    } catch (error) {
        results.success = false;
        results.error = error.toString();
    } finally {
        app.endUndoGroup();
    }
  
    return results;
}
```

### 项目管理模块

#### getOrCreateFolder()

获取或创建文件夹

```javascript
/**
 * 获取或创建项目文件夹
 * @param {string} folderName - 文件夹名称
 * @param {FolderItem} parentFolder - 父文件夹 (可选)
 * @returns {FolderItem} 文件夹对象
 */
function getOrCreateFolder(folderName, parentFolder) {
    parentFolder = parentFolder || app.project.rootFolder;
  
    // 查找现有文件夹
    for (var i = 1; i <= parentFolder.items.length; i++) {
        var item = parentFolder.items[i];
        if (item instanceof FolderItem && item.name === folderName) {
            return item;
        }
    }
  
    // 创建新文件夹
    return parentFolder.items.addFolder(folderName);
}
```

#### organizeProjectItems()

组织项目素材

```javascript
/**
 * 组织项目素材到指定文件夹
 * @param {Array} itemIds - 项目素材 ID 数组
 * @param {string} folderName - 目标文件夹名称
 * @param {Object} options - 组织选项
 * @returns {Object} 组织结果
 */
function organizeProjectItems(itemIds, folderName, options) {
    options = options || {};
  
    try {
        var targetFolder = getOrCreateFolder(folderName);
        var movedCount = 0;
        var errors = [];
      
        app.beginUndoGroup('组织项目素材');
      
        for (var i = 0; i < itemIds.length; i++) {
            try {
                var item = app.project.itemByID(itemIds[i]);
                if (item && item !== targetFolder) {
                    item.parentFolder = targetFolder;
                    movedCount++;
                }
            } catch (error) {
                errors.push({
                    itemId: itemIds[i],
                    error: error.toString()
                });
            }
        }
      
        app.endUndoGroup();
      
        return {
            success: true,
            moved: movedCount,
            errors: errors,
            targetFolder: {
                id: targetFolder.id,
                name: targetFolder.name
            }
        };
      
    } catch (error) {
        app.endUndoGroup();
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

#### getProjectInfo()

获取当前项目信息

```javascript
/**
 * 获取当前 After Effects 项目的基本信息
 * 包括项目路径、名称和活动合成信息
 * @returns {string} JSON 格式的项目信息
 */
function getProjectInfo()
```

**返回值**:

```json
{
    "projectPath": "C:\\Projects\\MyProject.aep",
    "projectName": "MyProject",
    "activeComp": {
        "name": "Main Comp",
        "id": 123,
        "width": 1920,
        "height": 1080,
        "duration": 10.0,
        "frameRate": 30
    },
    "isReady": true
}
```

**无项目时返回**:

```json
{
    "projectPath": null,
    "projectName": null,
    "activeComp": {
        "name": null,
        "id": null,
        "width": null,
        "height": null,
        "duration": null,
        "frameRate": null
    },
    "isReady": false
}
```

**错误返回**:

```json
{
    "error": "错误描述信息",
    "projectPath": null,
    "projectName": null,
    "activeComp": null,
    "isReady": false
}
```

#### importFiles()

导入文件到 After Effects

```javascript
/**
 * 导入文件到 After Effects 项目
 * 支持图片、视频、音频等多种文件类型
 * @param {Object} data - 导入数据对象
 * @returns {string} JSON 格式的导入结果
 */
function importFiles(data)
```

**参数格式**:

```javascript
{
    files: [
        {
            path: 'string',      // 文件绝对路径
            name: 'string',      // 文件名
            type: 'string'       // 文件类型 ('image'|'video'|'audio')
        }
    ],
    targetComp: 'string',        // 目标合成名称（可选）
    importOptions: {
        createLayers: 'boolean'  // 是否创建图层
    }
}
```

**返回值**:

```json
{
    "success": true,
    "importedCount": 3,
    "targetComp": "Main Comp",
    "importedFiles": [
        {
            "file": "image1.jpg",
            "footageName": "image1.jpg"
        }
    ],
    "failedFiles": []
}
```

**失败返回**:

```json
{
    "success": false,
    "importedCount": 0,
    "error": "没有打开的项目",
    "targetComp": null
}
```

**部分失败返回**:

```json
{
    "success": true,
    "importedCount": 2,
    "error": "部分文件导入失败: 1 个",
    "targetComp": "Main Comp",
    "importedFiles": [
        {
            "file": "image1.jpg",
            "footageName": "image1.jpg"
        }
    ],
    "failedFiles": [
        {
            "file": "corrupted.jpg",
            "error": "文件不存在"
        }
    ]
}
```

#### getProjectInfo()

获取项目详细信息

```javascript
/**
 * 获取当前项目的详细信息
 * @returns {Object} 项目信息
 */
function getProjectInfo() {
    try {
        var project = app.project;
        var info = {
            name: project.file ? project.file.name : 'Untitled',
            path: project.file ? project.file.fsName : null,
            modified: project.dirty,
            itemCount: project.items.length,
            compCount: 0,
            footageCount: 0,
            folderCount: 0,
            duration: 0,
            workAreaStart: project.workAreaStart,
            workAreaDuration: project.workAreaDuration,
            activeItem: null,
            renderQueue: {
                numItems: app.project.renderQueue.numItems,
                rendering: app.project.renderQueue.rendering
            }
        };
      
        // 统计不同类型的项目
        for (var i = 1; i <= project.items.length; i++) {
            var item = project.items[i];
          
            if (item instanceof CompItem) {
                info.compCount++;
                if (item.duration > info.duration) {
                    info.duration = item.duration;
                }
            } else if (item instanceof FootageItem) {
                info.footageCount++;
            } else if (item instanceof FolderItem) {
                info.folderCount++;
            }
        }
      
        // 获取当前活动项目
        if (app.project.activeItem) {
            info.activeItem = {
                id: app.project.activeItem.id,
                name: app.project.activeItem.name,
                typeName: app.project.activeItem.typeName
            };
        }
      
        return {
            success: true,
            data: info
        };
      
    } catch (error) {
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

### 合成管理模块

#### createCompositionFromItems()

从素材创建合成

```javascript
/**
 * 从项目素材创建合成
 * @param {Array} itemIds - 素材 ID 数组
 * @param {Object} compSettings - 合成设置
 * @returns {Object} 创建结果
 */
function createCompositionFromItems(itemIds, compSettings) {
    compSettings = compSettings || {};
  
    try {
        // 默认合成设置
        var settings = {
            name: compSettings.name || 'Eagle Import Comp',
            width: compSettings.width || 1920,
            height: compSettings.height || 1080,
            pixelAspect: compSettings.pixelAspect || 1,
            duration: compSettings.duration || 10,
            frameRate: compSettings.frameRate || 30
        };
      
        app.beginUndoGroup('创建合成');
      
        // 创建合成
        var comp = app.project.items.addComp(
            settings.name,
            settings.width,
            settings.height,
            settings.pixelAspect,
            settings.duration,
            settings.frameRate
        );
      
        // 添加素材到合成
        var addedLayers = [];
        var currentTime = 0;
        var layerDuration = compSettings.layerDuration || 3; // 每层默认3秒
      
        for (var i = 0; i < itemIds.length; i++) {
            try {
                var item = app.project.itemByID(itemIds[i]);
                if (item && (item instanceof FootageItem)) {
                    var layer = comp.layers.add(item, currentTime);
                  
                    // 设置层属性
                    if (compSettings.arrangeMode === 'sequence') {
                        // 序列排列
                        layer.startTime = currentTime;
                        layer.outPoint = currentTime + layerDuration;
                        currentTime += layerDuration;
                    } else {
                        // 堆叠排列 (默认)
                        layer.startTime = 0;
                    }
                  
                    addedLayers.push({
                        id: layer.index,
                        name: layer.name,
                        startTime: layer.startTime,
                        duration: layer.outPoint - layer.inPoint
                    });
                }
            } catch (error) {
                // 忽略单个素材的错误，继续处理其他素材
            }
        }
      
        // 调整合成持续时间
        if (compSettings.arrangeMode === 'sequence' && currentTime > 0) {
            comp.duration = currentTime;
        }
      
        app.endUndoGroup();
      
        return {
            success: true,
            composition: {
                id: comp.id,
                name: comp.name,
                width: comp.width,
                height: comp.height,
                duration: comp.duration,
                frameRate: comp.frameRate,
                layerCount: addedLayers.length
            },
            layers: addedLayers
        };
      
    } catch (error) {
        app.endUndoGroup();
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

#### duplicateComposition()

复制合成

```javascript
/**
 * 复制现有合成
 * @param {number} compId - 源合成 ID
 * @param {string} newName - 新合成名称
 * @returns {Object} 复制结果
 */
function duplicateComposition(compId, newName) {
    try {
        var sourceComp = app.project.itemByID(compId);
        if (!sourceComp || !(sourceComp instanceof CompItem)) {
            return {
                success: false,
                error: '无效的合成 ID'
            };
        }
      
        app.beginUndoGroup('复制合成');
      
        var newComp = sourceComp.duplicate();
        if (newName) {
            newComp.name = newName;
        }
      
        app.endUndoGroup();
      
        return {
            success: true,
            composition: {
                id: newComp.id,
                name: newComp.name,
                width: newComp.width,
                height: newComp.height,
                duration: newComp.duration,
                frameRate: newComp.frameRate
            }
        };
      
    } catch (error) {
        app.endUndoGroup();
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

### 渲染和导出模块

#### checkEagleConnection()

检查Eagle连接状态

```javascript
/**
 * 检查Eagle连接状态
 * 返回需要CEP层处理的连接状态标识
 * @returns {Object} 连接状态信息
 */
function checkEagleConnection() {
    // 返回需要CEP层处理的连接状态标识
    return {
        success: true,
        needsCEPCheck: true,
        message: '需要CEP层检查Eagle连接状态'
    };
}
```

**返回值**:

```json
{
    "success": true,
    "needsCEPCheck": true,
    "message": "需要CEP层检查Eagle连接状态"
}
```

#### exportToEagleWithConnectionCheck()

带连接检测的导出到Eagle函数

```javascript
/**
 * 带连接检测的导出到Eagle函数
 * 如果Eagle未连接，显示警告对话框
 * @param {Object} params - 参数对象
 * @param {Object} params.exportSettings - 导出设置
 * @param {Object} params.connectionStatus - 连接状态
 * @returns {Object} 操作结果
 */
function exportToEagleWithConnectionCheck(params) {
    try {
        // 检查连接状态
        if (!params.connectionStatus || !params.connectionStatus.connected) {
            // 显示Eagle连接警告对话框
            var result = showWarningDialog(
                'Eagle连接检查',
                'Eagle插件未连接或连接异常。\n\n请确保：\n1. Eagle应用程序已启动\n2. Eagle2Ae插件已安装并启用\n3. 网络连接正常\n\n是否要重新检查连接？',
                ['重新检查', '取消']
            );
            
            return {
                success: false,
                userAction: result === 0 ? 'retry' : 'cancel',
                message: result === 0 ? '用户选择重新检查连接' : '用户取消操作'
            };
        }
        
        // 连接正常，调用原始导出函数
        return exportToEagle(params.exportSettings);
        
    } catch (error) {
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

**参数说明**:
- `params.exportSettings`: 导出设置对象
- `params.connectionStatus.connected`: 连接状态布尔值

**返回值**:

```json
{
    "success": false,
    "userAction": "retry",
    "message": "用户选择重新检查连接"
}
```

#### addToRenderQueue()

添加到渲染队列

```javascript
/**
 * 添加合成到渲染队列
 * @param {number} compId - 合成 ID
 * @param {Object} renderSettings - 渲染设置
 * @returns {Object} 添加结果
 */
function addToRenderQueue(compId, renderSettings) {
    renderSettings = renderSettings || {};
  
    try {
        var comp = app.project.itemByID(compId);
        if (!comp || !(comp instanceof CompItem)) {
            return {
                success: false,
                error: '无效的合成 ID'
            };
        }
      
        app.beginUndoGroup('添加到渲染队列');
      
        var renderQueueItem = app.project.renderQueue.items.add(comp);
      
        // 设置输出模块
        if (renderSettings.outputPath) {
            var outputModule = renderQueueItem.outputModules[1];
            outputModule.file = new File(renderSettings.outputPath);
        }
      
        // 设置渲染设置
        if (renderSettings.quality) {
            renderQueueItem.render = true;
        }
      
        app.endUndoGroup();
      
        return {
            success: true,
            renderItem: {
                index: renderQueueItem.index,
                compName: comp.name,
                status: renderQueueItem.status
            }
        };
      
    } catch (error) {
        app.endUndoGroup();
        return {
            success: false,
            error: error.toString()
        };
    }
}
```

### 工具函数模块

#### validateFilePath()

验证文件路径

```javascript
/**
 * 验证文件路径是否有效
 * @param {string} filePath - 文件路径
 * @returns {Object} 验证结果
 */
function validateFilePath(filePath) {
    try {
        if (!filePath || typeof filePath !== 'string') {
            return {
                valid: false,
                error: '文件路径不能为空'
            };
        }
      
        var file = new File(filePath);
      
        if (!file.exists) {
            return {
                valid: false,
                error: '文件不存在: ' + filePath
            };
        }
      
        // 检查文件扩展名
        var extension = file.name.split('.').pop().toLowerCase();
        var supportedFormats = [
            'jpg', 'jpeg', 'png', 'tiff', 'tif', 'bmp', 'gif',
            'psd', 'ai', 'eps', 'pdf',
            'mov', 'mp4', 'avi', 'wmv', 'mpg', 'mpeg',
            'wav', 'mp3', 'aiff', 'aif'
        ];
      
        if (supportedFormats.indexOf(extension) === -1) {
            return {
                valid: false,
                error: '不支持的文件格式: ' + extension
            };
        }
      
        return {
            valid: true,
            fileInfo: {
                name: file.name,
                path: file.fsName,
                size: file.length,
                extension: extension,
                modified: file.modified
            }
        };
      
    } catch (error) {
        return {
            valid: false,
            error: error.toString()
        };
    }
}
```

#### logMessage()

记录日志消息

```javascript
/**
 * 记录日志消息到文件
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 * @param {Object} context - 上下文信息
 */
function logMessage(level, message, context) {
    try {
        if (!EAGLE2AE_DEBUG && level === 'debug') {
            return;
        }
      
        var timestamp = new Date().toISOString();
        var logEntry = '[' + timestamp + '] [' + level.toUpperCase() + '] ' + message;
      
        if (context) {
            logEntry += ' | Context: ' + JSON.stringify(context);
        }
      
        // 输出到控制台
        $.writeln(logEntry);
      
        // 可选：写入日志文件
        // writeToLogFile(logEntry);
      
    } catch (error) {
        $.writeln('[ERROR] 日志记录失败: ' + error.toString());
    }
}
```

#### getUniqueItemName()

生成唯一项目名称

```javascript
/**
 * 生成唯一的项目名称
 * @param {string} baseName - 基础名称
 * @param {FolderItem} parentFolder - 父文件夹
 * @returns {string} 唯一名称
 */
function getUniqueItemName(baseName, parentFolder) {
    parentFolder = parentFolder || app.project.rootFolder;
  
    var uniqueName = baseName;
    var counter = 1;
  
    while (itemNameExists(uniqueName, parentFolder)) {
        uniqueName = baseName + ' ' + counter;
        counter++;
    }
  
    return uniqueName;
}

/**
 * 检查项目名称是否已存在
 * @param {string} name - 项目名称
 * @param {FolderItem} parentFolder - 父文件夹
 * @returns {boolean} 是否存在
 */
function itemNameExists(name, parentFolder) {
    for (var i = 1; i <= parentFolder.items.length; i++) {
        if (parentFolder.items[i].name === name) {
            return true;
        }
    }
    return false;
}
```

## 错误处理

### 错误类型

#### 文件相关错误

- `FILE_NOT_FOUND` - 文件不存在
- `UNSUPPORTED_FORMAT` - 不支持的文件格式
- `FILE_ACCESS_DENIED` - 文件访问被拒绝
- `FILE_CORRUPTED` - 文件损坏

#### 项目相关错误

- `PROJECT_NOT_OPEN` - 项目未打开
- `ITEM_NOT_FOUND` - 项目素材不存在
- `INVALID_COMPOSITION` - 无效的合成
- `FOLDER_CREATION_FAILED` - 文件夹创建失败

#### 系统相关错误

- `INSUFFICIENT_MEMORY` - 内存不足
- `DISK_SPACE_LOW` - 磁盘空间不足
- `PERMISSION_DENIED` - 权限被拒绝

### 错误处理最佳实践

```javascript
/**
 * 标准错误处理包装器
 * @param {Function} func - 要执行的函数
 * @param {string} operation - 操作名称
 * @returns {Object} 执行结果
 */
function safeExecute(func, operation) {
    try {
        var result = func();
      
        logMessage('info', operation + ' 执行成功');
      
        return {
            success: true,
            data: result
        };
      
    } catch (error) {
        var errorMessage = operation + ' 执行失败: ' + error.toString();
      
        logMessage('error', errorMessage, {
            operation: operation,
            error: error.toString(),
            stack: error.stack || 'No stack trace'
        });
      
        return {
            success: false,
            error: errorMessage,
            errorCode: getErrorCode(error)
        };
    }
}

/**
 * 获取错误代码
 * @param {Error} error - 错误对象
 * @returns {string} 错误代码
 */
function getErrorCode(error) {
    var message = error.toString().toLowerCase();
  
    if (message.indexOf('file') !== -1 && message.indexOf('not found') !== -1) {
        return 'FILE_NOT_FOUND';
    } else if (message.indexOf('permission') !== -1) {
        return 'PERMISSION_DENIED';
    } else if (message.indexOf('memory') !== -1) {
        return 'INSUFFICIENT_MEMORY';
    } else {
        return 'UNKNOWN_ERROR';
    }
}
```

## 性能优化

### 批处理操作

```javascript
/**
 * 批处理操作包装器
 * @param {Array} items - 要处理的项目数组
 * @param {Function} processor - 处理函数
 * @param {Object} options - 选项
 * @returns {Object} 批处理结果
 */
function batchProcess(items, processor, options) {
    options = options || {};
    var batchSize = options.batchSize || 10;
    var undoGroupName = options.undoGroupName || 'Batch Operation';
  
    var results = {
        success: true,
        processed: 0,
        failed: 0,
        errors: []
    };
  
    app.beginUndoGroup(undoGroupName);
  
    try {
        for (var i = 0; i < items.length; i += batchSize) {
            var batch = items.slice(i, i + batchSize);
          
            for (var j = 0; j < batch.length; j++) {
                try {
                    processor(batch[j]);
                    results.processed++;
                } catch (error) {
                    results.failed++;
                    results.errors.push({
                        item: batch[j],
                        error: error.toString()
                    });
                }
            }
          
            // 可选：在批次之间暂停以避免阻塞 UI
            if (options.pauseBetweenBatches) {
                app.doScript('', ScriptLanguage.JAVASCRIPT, false);
            }
        }
      
        if (results.failed > 0) {
            results.success = false;
        }
      
    } catch (error) {
        results.success = false;
        results.error = error.toString();
    } finally {
        app.endUndoGroup();
    }
  
    return results;
}
```

## 调试工具

### 调试信息收集

```javascript
/**
 * 收集调试信息
 * @returns {Object} 调试信息
 */
function collectDebugInfo() {
    return {
        timestamp: new Date().toISOString(),
        system: getSystemInfo(),
        project: getProjectInfo(),
        memory: {
            used: app.memoryInUse,
            available: system.totalPhysicalMemory
        },
        preferences: {
            language: app.isoLanguage,
            cacheSize: app.preferences.getPrefAsLong('Main Pref Section', 'Pref_DISK_CACHE_MAX_SIZE')
        }
    };
}
```

## 更新记录

| 日期       | 版本 | 更新内容               | 作者     |
| ---------- | ---- | ---------------------- | -------- |
| 2024-01-05 | 1.0  | 初始 JSX 脚本 API 文档 | 开发团队 |

---

## 版本更新记录

### v2.3.0 - 增强错误处理和Unicode支持

#### 新增功能

1. **Unicode字符处理增强**
   - 在处理包含非ASCII字符（如中文）的文件路径时，系统现在能够更好地处理Unicode字符问题。
   - 实现了错误恢复机制，在导入失败后尝试在项目中查找同名素材。

2. **重复导入检查**
   - 为避免重复导入相同文件到项目面板中，系统实现了重复导入检查机制。
   - 在导入前先检查项目中是否已存在同名素材，如果存在则跳过导入步骤。

3. **调试日志增强**
   - 增强了调试日志功能，提供更详细的导入过程信息。
   - 在`importFilesWithSettings`函数中添加了详细的调试日志，便于问题排查。

#### 技术实现细节

```javascript
// 在importFilesWithSettings函数中添加的关键错误处理逻辑
function importFilesWithSettings(data) {
    var debugLog = [];
    
    try {
        debugLog.push("ExtendScript: importFilesWithSettings 开始");
        
        // ... 其他代码 ...
        
        for (var i = 0; i < data.files.length; i++) {
            var file = data.files[i];
            
            try {
                // 检查文件是否存在
                var fileObj = new File(file.importPath);
                
                if (!fileObj.exists) {
                    debugLog.push("ExtendScript: 文件不存在，跳过: " + file.importPath);
                    continue;
                }
                
                // 在导入前先检查项目中是否已存在同名素材
                var footageItem = null;
                for (var itemIndex = 1; itemIndex <= project.numItems; itemIndex++) {
                    var item = project.item(itemIndex);
                    if (item instanceof FootageItem && item.name === file.name) {
                        footageItem = item;
                        debugLog.push("ExtendScript: 在项目中找到同名素材: " + item.name);
                        break;
                    }
                }
                
                // 如果项目中没有同名素材，则尝试导入
                if (!footageItem) {
                    try {
                        var importOptions = new ImportOptions(fileObj);
                        footageItem = project.importFile(importOptions);
                        debugLog.push("ExtendScript: 文件导入完成，footageItem: " + (footageItem ? "成功" : "失败"));
                    } catch (importError) {
                        debugLog.push("ExtendScript: 导入尝试失败: " + importError.toString());
                    }
                }
                
                // ... 其他代码 ...
                
            } catch (fileError) {
                debugLog.push("ExtendScript: 文件处理错误: " + fileError.toString());
                continue;
            }
        }
        
        // ... 其他代码 ...
        
        return JSON.stringify(result);
        
    } catch (error) {
        // ... 错误处理 ...
    }
}
```

### v2.1.2 - 时间轴设置修复

#### 修复内容

修复了时间轴设置检查逻辑错误，确保图层正确放置在指定的时间位置。

#### 修复前的问题代码

```javascript
// 错误的检查逻辑 - 只检查enabled字段
if (settings.timelineOptions.enabled) {
    // 无法区分current_time和timeline_start模式
    layer.startTime = targetComp.time;
}
```

#### 修复后的正确代码

```javascript
// 正确的检查逻辑 - 检查placement字段
if (settings.timelineOptions.placement === 'current_time') {
    // current_time模式：放置在当前时间位置
    layer.startTime = targetComp.time;
    console.log('[时间轴设置] 图层放置在当前时间:', targetComp.time);
} else if (settings.timelineOptions.placement === 'timeline_start') {
    // timeline_start模式：放置在时间轴开始位置
    layer.startTime = 0;
    console.log('[时间轴设置] 图层放置在时间轴开始');
}
```

#### 设置对象结构

```javascript
// timelineOptions设置对象的正确结构
settings.timelineOptions = {
    enabled: true,                    // 是否启用时间轴设置
    placement: 'current_time'         // 放置模式：'current_time' | 'timeline_start'
};
```

#### 调试方法

```javascript
// 添加调试日志以验证设置传递
console.log('[调试] timelineOptions设置:', JSON.stringify(settings.timelineOptions));
console.log('[调试] placement模式:', settings.timelineOptions.placement);
console.log('[调试] 当前合成时间:', targetComp.time);
console.log('[调试] 图层开始时间:', layer.startTime);
```

---

**相关文档**:

- [API 参考手册](./api-reference.md)
- [通信 API](./communication-api.md)
- [CEP 开发指南](../development/cep-development-guide.md)
- [UI交互指南 - 时间轴设置](../development/ui-interaction-guide.md#43-时间轴设置实现细节)
- [故障排除 - 时间轴设置问题](../troubleshooting/common-issues.md#时间轴设置问题)