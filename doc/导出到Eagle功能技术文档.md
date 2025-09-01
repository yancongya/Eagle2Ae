# 导出到Eagle功能技术文档

## 概述

本文档详细说明如何在After Effects扩展中实现"导出到Eagle"功能。该功能将允许用户将AE中的图层导出到指定文件夹，然后自动导入到Eagle的当前激活组中。

## 功能需求

1. **前置条件验证**：功能仅在检测到图层且与Eagle成功建立连接后可用
2. **导出操作**：将选定图层导出到当前导入模式设定的项目旁指定文件夹
3. **自动导入**：完成导出后，自动将内容导入到Eagle当前识别的激活组中
4. **现有功能复用**：主要利用现有函数功能和Eagle API实现
5. **日志记录**：实现过程中每个操作步骤都需记录到日志中

## 技术架构分析

### 现有代码结构

#### AE扩展端 (Eagle2Ae-Ae)
- **主文件**: `js/main.js` - 包含核心逻辑和UI事件处理
- **UI文件**: `index.html` - 定义用户界面
- **脚本文件**: `hostscript.jsx` - ExtendScript代码，处理AE操作

#### Eagle插件端 (Eagle2Ae-Eagle)
- **主文件**: `js/plugin.js` - Eagle后台服务插件
- **API配置**: `eagle-api-config-generator.js` - Eagle API配置生成器

### 现有功能分析

#### 检测图层功能 (`detectLayers`)
```javascript
// 位置: Eagle2Ae-Ae/js/main.js
// 功能: 检测选中的图层并记录日志
async detectLayers() {
    // 验证连接状态
    // 调用ExtendScript检测图层
    // 记录检测结果
}
```

#### 导出图层功能 (`exportLayers`)
```javascript
// 位置: Eagle2Ae-Ae/js/main.js
// 功能: 导出选中图层到指定目录
async exportLayers() {
    // 验证前置条件
    // 获取导出设置
    // 执行导出操作
    // 处理导出结果
}
```

#### Eagle连接功能
```javascript
// 位置: Eagle2Ae-Ae/js/main.js
// 功能: 管理与Eagle的HTTP连接
class AEExtension {
    // 连接状态管理
    // 端口发现
    // 消息通信
}
```

## 当前通信机制分析

### 1. 现有通信架构

通过分析现有代码，AE和Eagle之间的通信采用以下机制：

#### 1.1 Eagle端到AE端（导出文件）
- **WebSocket优先**：Eagle优先使用WebSocket实时发送导出请求
- **HTTP队列备用**：WebSocket不可用时，使用HTTP消息队列模式
- **消息类型**：`export` 或 `import_files`，映射为WebSocket的 `file.export_request`

#### 1.2 AE端到Eagle端（状态同步）
- **HTTP POST**：AE通过HTTP POST发送消息到Eagle的 `/ae-message` 端点
- **HTTP轮询**：AE通过HTTP GET轮询Eagle的 `/messages` 端点获取消息

### 2. 现有消息流程

#### 2.1 Eagle导出文件到AE
```javascript
// Eagle端：handleFileExport方法
const exportData = {
    files: data.files,
    settings: this.importSettings,
    timestamp: currentTimestamp,
    requestId: this.generateRequestId(),
    projectInfo: this.aeStatus.projectPath ? {
        path: this.aeStatus.projectPath,
        comp: this.aeStatus.activeComp
    } : null
};

// 优先WebSocket发送
if (this.webSocketServer && this.webSocketServer.isRunning) {
    const sentCount = this.webSocketServer.broadcast(MESSAGE_TYPES.FILE.EXPORT_REQUEST, exportData);
}

// 备用HTTP队列
const exportMessage = {
    type: 'export',
    ...exportData
};
this.messageQueue.push(exportMessage);
```

#### 2.2 AE端处理Eagle消息
```javascript
// AE端：handleEagleMessage方法
handleEagleMessage(message) {
    switch (message.type) {
        case 'export':
            if (message.settings) {
                // 临时应用Eagle发送的设置
            }
            this.handleImportFiles(message);
            break;
        case 'import_files':
            this.handleImportFiles(message.data);
            break;
    }
}
```

## AE扩展端修改方案

### 1. 新增导出功能UI

#### 1.1 导出按钮
在AE扩展的主界面中添加"导出到Eagle"按钮：

```html
<!-- 在index.html中添加 -->
<div class="export-section">
    <button id="exportToEagleBtn" class="export-btn">
        <img src="./public/eagle-icon.png" alt="Eagle">
        导出到Eagle
    </button>
</div>
```

#### 1.2 导出选项面板
```html
<div id="exportOptionsPanel" class="export-panel hidden">
    <div class="panel-header">
        <h3>导出到Eagle</h3>
        <button id="closeExportPanel" class="close-btn">×</button>
    </div>
    
    <div class="panel-content">
        <!-- 目标文件夹选择 -->
        <div class="option-group">
            <label>目标文件夹:</label>
            <select id="targetFolderSelect">
                <option value="">选择文件夹...</option>
            </select>
            <button id="refreshFoldersBtn">刷新</button>
        </div>
        
        <!-- 导出选项 -->
        <div class="option-group">
            <label>
                <input type="checkbox" id="includeTagsOption" checked>
                包含标签信息
            </label>
        </div>
        
        <div class="option-group">
            <label>
                <input type="checkbox" id="includeAnnotationOption">
                添加注释
            </label>
            <textarea id="annotationText" placeholder="输入注释内容..." disabled></textarea>
        </div>
    </div>
    
    <div class="panel-footer">
        <button id="confirmExportBtn" class="primary-btn">确认导出</button>
        <button id="cancelExportBtn" class="secondary-btn">取消</button>
    </div>
</div>
```

### 2. 导出功能实现

#### 2.1 主要导出函数
```javascript
// 在main.js中添加导出功能
class AEExtension {
    // 现有代码...
    
    // 初始化导出功能
    initializeExportFeature() {
        const exportBtn = document.getElementById('exportToEagleBtn');
        const exportPanel = document.getElementById('exportOptionsPanel');
        const confirmBtn = document.getElementById('confirmExportBtn');
        const cancelBtn = document.getElementById('cancelExportBtn');
        const closeBtn = document.getElementById('closeExportPanel');
        
        exportBtn.addEventListener('click', () => this.showExportPanel());
        confirmBtn.addEventListener('click', () => this.executeExport());
        cancelBtn.addEventListener('click', () => this.hideExportPanel());
        closeBtn.addEventListener('click', () => this.hideExportPanel());
        
        // 初始化文件夹列表
        this.loadEagleFolders();
    }
    
    // 显示导出面板
    async showExportPanel() {
        // 检查Eagle连接状态
        if (!this.isEagleConnected()) {
            this.showMessage('请先确保Eagle正在运行并已连接', 'error');
            return;
        }
        
        // 获取当前选中的文件
        const selectedFiles = await this.getSelectedFiles();
        if (selectedFiles.length === 0) {
            this.showMessage('请先选择要导出的文件', 'warning');
            return;
        }
        
        // 刷新文件夹列表
        await this.loadEagleFolders();
        
        // 显示面板
        document.getElementById('exportOptionsPanel').classList.remove('hidden');
    }
    
    // 隐藏导出面板
    hideExportPanel() {
        document.getElementById('exportOptionsPanel').classList.add('hidden');
    }
    
    // 加载Eagle文件夹列表
    async loadEagleFolders() {
        try {
            // 使用HTTP GET请求获取激活文件夹
            const response = await fetch(`http://localhost:${this.eaglePort}/get-active-folder`);
            const result = await response.json();
            
            if (result.success && result.folderId) {
                // 获取文件夹列表
                const foldersResponse = await fetch('http://localhost:41595/api/folder/list');
                const foldersData = await foldersResponse.json();
                
                if (foldersData.status === 'success') {
                    this.updateFolderSelect(foldersData.data, result.folderId);
                }
            } else {
                console.error('获取激活文件夹失败:', result.error);
            }
        } catch (error) {
            console.error('加载文件夹列表时出错:', error);
        }
    }
    
    // 更新文件夹选择下拉框
    updateFolderSelect(folders, activeFolderId) {
        const select = document.getElementById('targetFolderSelect');
        select.innerHTML = '<option value="">选择文件夹...</option>';
        
        folders.forEach(folder => {
            const option = document.createElement('option');
            option.value = folder.id;
            option.textContent = folder.name;
            if (folder.id === activeFolderId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }
    
    // 执行导出
    async executeExport() {
        try {
            // 获取导出配置
            const config = this.getExportConfig();
            if (!config.targetFolderId) {
                this.showMessage('请选择目标文件夹', 'warning');
                return;
            }
            
            // 获取要导出的文件
            const files = await this.getSelectedFiles();
            if (files.length === 0) {
                this.showMessage('没有选中的文件可导出', 'warning');
                return;
            }
            
            // 显示进度
            this.showProgress('正在导出到Eagle...');
            
            // 发送导出请求
            const result = await this.sendExportRequest(files, config);
            
            // 处理结果
            this.handleExportResult(result);
            
        } catch (error) {
            console.error('导出过程中出错:', error);
            this.showMessage('导出失败: ' + error.message, 'error');
        } finally {
            this.hideProgress();
            this.hideExportPanel();
        }
    }
    
    // 获取导出配置
    getExportConfig() {
        return {
            targetFolderId: document.getElementById('targetFolderSelect').value,
            includeTags: document.getElementById('includeTagsOption').checked,
            includeAnnotation: document.getElementById('includeAnnotationOption').checked,
            annotation: document.getElementById('annotationText').value
        };
    }
    
    // 发送导出请求到Eagle
    async sendExportRequest(files, config) {
        const requestData = {
            files: files,
            targetFolderId: config.targetFolderId,
            options: {
                tags: config.includeTags ? this.generateFileTags(files) : [],
                annotation: config.includeAnnotation ? config.annotation : ''
            }
        };
        
        // 使用HTTP POST请求发送到Eagle的新端点
        const response = await fetch(`http://localhost:${this.eaglePort}/export-to-eagle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP请求失败: ${response.status}`);
        }
        
        return await response.json();
    }
    
    // 处理导出结果
    handleExportResult(result) {
        if (result.success) {
            const { importedCount, failedCount } = result;
            let message = `导出完成！成功: ${importedCount}个文件`;
            if (failedCount > 0) {
                message += `，失败: ${failedCount}个文件`;
            }
            this.showMessage(message, 'success');
        } else {
            this.showMessage('导出失败: ' + result.error, 'error');
        }
    }
    
    // 生成文件标签
    generateFileTags(files) {
        const tags = ['AE导出'];
        
        // 根据文件类型添加标签
        const fileTypes = [...new Set(files.map(f => f.extension.toLowerCase()))];
        fileTypes.forEach(type => {
            tags.push(type.toUpperCase());
        });
        
        return tags;
    }
    
    // 检查Eagle连接状态
    isEagleConnected() {
        return this.connectionState === ConnectionState.CONNECTED;
    }
}
```

#### 2.2 获取选中文件的函数
```javascript
// 获取当前选中的文件
async getSelectedFiles() {
    try {
        // 调用AE脚本获取选中的项目文件
        const result = await this.csInterface.evalScript('getSelectedProjectItems()');
        const selectedItems = JSON.parse(result);
        
        // 过滤出文件类型的项目
        const files = selectedItems.filter(item => item.type === 'file').map(item => ({
            path: item.path,
            name: item.name,
            extension: item.extension,
            type: item.mediaType
        }));
        
        return files;
        
    } catch (error) {
        console.error('获取选中文件失败:', error);
        return [];
    }
}
```

## Eagle插件端修改方案

### 1. 新增HTTP端点

基于现有HTTP服务器架构，在Eagle端新增以下端点：

#### 1.1 导出到Eagle端点
```javascript
// 在startHttpServer方法中新增
app.post('/export-to-eagle', async (req, res) => {
    try {
        const data = req.body;
        const result = await this.handleExportToEagle(data);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
```

#### 1.2 获取激活文件夹端点
```javascript
app.get('/get-active-folder', async (req, res) => {
    try {
        const activeFolderId = await this.getActiveFolderId();
        res.json({ 
            success: true, 
            folderId: activeFolderId,
            timestamp: Date.now()
        });
    } catch (error) {
        res.json({ 
            success: false, 
            error: error.message,
            folderId: null 
        });
    }
});
```

### 2. 处理导出请求

#### 2.1 主要处理函数
```javascript
// 处理来自AE的导出请求
async handleExportToEagle(data) {
    const { files, targetFolderId, options = {} } = data;
    
    // 验证目标文件夹
    const isValidFolder = await this.validateTargetFolder(targetFolderId);
    if (!isValidFolder) {
        throw new Error(`目标文件夹ID无效: ${targetFolderId}`);
    }
    
    // 执行文件导入
    const result = await this.importFilesToEagle(files, targetFolderId, options);
    
    return {
        importedCount: result.importedCount,
        failedCount: result.failedCount,
        details: result.details
    };
}
```

#### 2.2 文件夹验证函数
```javascript
// 验证目标文件夹是否存在且可访问
async validateTargetFolder(folderId) {
    try {
        if (!folderId) {
            return false;
        }
        
        // 使用Eagle API验证文件夹
        const response = await fetch(`http://localhost:41595/api/folder/list`);
        const folders = await response.json();
        return folders.data.some(folder => folder.id === folderId);
        
    } catch (error) {
        console.error('文件夹验证失败:', error);
        return false;
    }
}
```

#### 2.3 文件导入函数
```javascript
// 批量导入文件到Eagle
async importFilesToEagle(files, targetFolderId, options = {}) {
    const results = {
        importedCount: 0,
        failedCount: 0,
        details: []
    };
    
    for (const file of files) {
        try {
            const importData = {
                path: file.path,
                name: file.name,
                folderId: targetFolderId,
                tags: options.tags || [],
                annotation: options.annotation || ''
            };
            
            const response = await fetch('http://localhost:41595/api/item/addFromPath', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(importData)
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                results.importedCount++;
                results.details.push({
                    file: file.name,
                    success: true,
                    id: result.data.id
                });
            } else {
                throw new Error(result.message || '导入失败');
            }
            
        } catch (error) {
            results.failedCount++;
            results.details.push({
                file: file.name,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}
```

### 3. 获取激活文件夹
```javascript
// 获取当前激活的文件夹ID
async getActiveFolderId() {
    try {
        // 尝试获取当前选中的文件夹
        const response = await fetch('http://localhost:41595/api/folder/list');
        const folders = await response.json();
        
        // 查找当前激活的文件夹（通常是第一个或根文件夹）
        if (folders.status === 'success' && folders.data.length > 0) {
            return folders.data[0].id;
        }
        
        return null;
        
    } catch (error) {
        console.error('获取激活文件夹失败:', error);
        return null;
    }
}
```

#### 导出请求处理函数

```javascript
/**
 * 处理来自AE的导出请求
 */
async handleExportToEagleRequest(message) {
    try {
        const { files, targetFolderId, metadata } = message.data;
        
        this.log(`收到AE导出请求: ${files.length} 个文件`, 'info');
        this.log(`目标文件夹ID: ${targetFolderId}`, 'info');
        
        // 验证目标文件夹
        const isValidFolder = await this.validateTargetFolder(targetFolderId);
        if (!isValidFolder) {
            throw new Error('目标文件夹无效或不存在');
        }
        
        // 执行文件导入
        const importResult = await this.importFilesToEagle(files, targetFolderId, metadata);
        
        // 发送成功响应
        this.sendResponse(message.id, {
            type: MESSAGE_TYPES.EXPORT_TO_EAGLE_RESPONSE,
            success: true,
            data: {
                importedCount: importResult.successCount,
                failedCount: importResult.failedCount,
                importedItems: importResult.items
            }
        });
        
        // 显示成功通知
        if (typeof eagle !== 'undefined' && eagle.notification) {
            eagle.notification.show({
                title: 'Eagle2Ae',
                body: `成功导入 ${importResult.successCount} 个文件从After Effects`,
                mute: false,
                duration: 3000
            });
        }
        
    } catch (error) {
        this.log(`处理AE导出请求失败: ${error.message}`, 'error');
        
        // 发送错误响应
        this.sendResponse(message.id, {
            type: MESSAGE_TYPES.EXPORT_TO_EAGLE_RESPONSE,
            success: false,
            error: error.message
        });
    }
}
```

#### 文件夹验证函数

```javascript
/**
 * 验证目标文件夹是否有效
 */
async validateTargetFolder(folderId) {
    try {
        if (!folderId) {
            return false;
        }
        
        // 通过Eagle API验证文件夹存在性
        const response = await this.callEagleAPI('/api/folder/list');
        if (response.status === 'success' && response.data) {
            return response.data.some(folder => folder.id === folderId);
        }
        
        return false;
    } catch (error) {
        this.log(`验证文件夹失败: ${error.message}`, 'error');
        return false;
    }
}
```

#### 文件导入执行函数

```javascript
/**
 * 执行文件导入到Eagle
 */
async importFilesToEagle(files, targetFolderId, metadata) {
    const results = {
        successCount: 0,
        failedCount: 0,
        items: []
    };
    
    try {
        // 准备Eagle API请求数据
        const eagleItems = files.map(file => ({
            path: file.fullPath,
            name: file.name,
            tags: ['AE导出', 'After Effects', ...(metadata.tags || [])],
            annotation: metadata.annotation || `从After Effects导出 - ${new Date().toLocaleString()}`,
            website: metadata.website || '',
            folderId: targetFolderId
        }));
        
        // 批量导入文件
        const response = await this.callEagleAPI('/api/item/addFromPaths', {
            items: eagleItems
        });
        
        if (response.status === 'success') {
            results.successCount = files.length;
            results.items = response.data || [];
            this.log(`成功导入 ${files.length} 个文件到Eagle`, 'success');
        } else {
            throw new Error('Eagle API返回失败状态');
        }
        
    } catch (error) {
        this.log(`批量导入失败，尝试逐个导入: ${error.message}`, 'warning');
        
        // 逐个导入文件（备用方案）
        for (const file of files) {
            try {
                const response = await this.callEagleAPI('/api/item/addFromPath', {
                    path: file.fullPath,
                    name: file.name,
                    tags: ['AE导出', 'After Effects'],
                    annotation: `从After Effects导出 - ${new Date().toLocaleString()}`,
                    folderId: targetFolderId
                });
                
                if (response.status === 'success') {
                    results.successCount++;
                    results.items.push(response.data);
                } else {
                    results.failedCount++;
                }
            } catch (fileError) {
                this.log(`导入文件失败 ${file.name}: ${fileError.message}`, 'error');
                results.failedCount++;
            }
        }
    }
    
    return results;
}
```

### 激活文件夹信息提供

```javascript
/**
 * 处理获取激活文件夹请求
 */
async handleGetActiveFolderRequest(message) {
    try {
        const folderInfo = {
            currentFolder: this.eagleStatus.currentFolder,
            currentFolderName: this.eagleStatus.currentFolderName,
            folderPath: this.eagleStatus.folderPath
        };
        
        this.sendResponse(message.id, {
            type: MESSAGE_TYPES.GET_ACTIVE_FOLDER_RESPONSE,
            success: true,
            data: folderInfo
        });
        
    } catch (error) {
        this.log(`获取激活文件夹信息失败: ${error.message}`, 'error');
        
        this.sendResponse(message.id, {
            type: MESSAGE_TYPES.GET_ACTIVE_FOLDER_RESPONSE,
            success: false,
            error: error.message
        });
    }
}
```

### 消息路由扩展

在Eagle插件的消息处理函数中添加新的路由：

```javascript
// 在现有的消息处理函数中添加
switch (message.type) {
    // 现有消息类型处理...
    
    case MESSAGE_TYPES.EXPORT_TO_EAGLE_REQUEST:
        await this.handleExportToEagleRequest(message);
        break;
        
    case MESSAGE_TYPES.GET_ACTIVE_FOLDER_REQUEST:
        await this.handleGetActiveFolderRequest(message);
        break;
        
    default:
        this.log(`未知消息类型: ${message.type}`, 'warning');
}
```

## Eagle API分析

### 添加文件到Eagle的API

根据Eagle API文档，有以下几种添加文件的方法：

#### 1. 单个文件添加 (`/api/item/addFromPath`)
```javascript
// HTTP POST 请求
const data = {
    "path": "C://Users/User/Downloads/test.jpg",
    "name": "文件名称",
    "website": "来源网站",
    "tags": ["标签1", "标签2"],
    "annotation": "注释",
    "folderId": "目标文件夹ID"
};

fetch("http://localhost:41595/api/item/addFromPath", {
    method: 'POST',
    body: JSON.stringify(data)
})
```

#### 2. 批量文件添加 (`/api/item/addFromPaths`)
```javascript
// HTTP POST 请求
const data = {
    "items": [
        {
            "path": "文件路径1",
            "name": "文件名1",
            "tags": ["AE导出"],
            "annotation": "从After Effects导出"
        },
        {
            "path": "文件路径2",
            "name": "文件名2",
            "tags": ["AE导出"],
            "annotation": "从After Effects导出"
        }
    ],
    "folderId": "目标文件夹ID"
};

fetch("http://localhost:41595/api/item/addFromPaths", {
    method: 'POST',
    body: JSON.stringify(data)
})
```

### Eagle API响应格式
```json
{
    "status": "success"
}
```

## 实现方案

### 设计理念

"导出到Eagle"功能的核心设计理念是**复用现有的导入模式设置**，确保导出路径与用户的导入偏好保持一致。这样做有以下优势：

1. **用户体验一致性**：导出的文件会保存到用户习惯的导入路径，减少文件管理的复杂性
2. **设置统一管理**：避免重复的路径配置，用户只需要在一个地方设置文件夹偏好
3. **工作流程优化**：导出的文件可以直接被后续的导入操作使用，形成完整的工作闭环
4. **减少用户困惑**：不需要额外的导出路径设置，降低学习成本

### 路径映射逻辑

- **项目旁复制模式**：导出到项目文件旁的指定文件夹（如 `Eagle_Assets`）
- **自定义文件夹模式**：导出到用户指定的自定义文件夹路径
- **直接导入模式**：导出到临时文件夹，适用于一次性操作

### 1. Eagle目标文件夹ID获取机制

在执行导出到Eagle功能之前，需要确定目标文件夹ID。这是整个导出流程的关键步骤：

#### 获取策略（按优先级排序）

**方法1: 从Eagle连接状态获取（推荐）**
- 利用现有的Eagle WebSocket连接状态信息
- 从`this.eagleStatus.currentFolder`获取当前激活文件夹ID
- 从`this.eagleStatus.currentFolderName`获取文件夹名称
- 从`this.eagleStatus.folderPath`获取完整路径
- 优势：实时性强，与用户当前操作状态一致

**方法2: 通过Eagle API查询最近文件夹（备用）**
- 调用`/api/folder/listRecents`获取最近使用的文件夹
- 使用第一个最近文件夹作为目标
- 适用于WebSocket连接异常但API可用的情况

**方法3: 获取根文件夹（最后备用）**
- 调用`/api/folder/list`获取所有文件夹
- 使用第一个文件夹（通常是根文件夹）
- 确保在任何情况下都有可用的目标文件夹

#### Eagle状态信息来源

根据Eagle插件代码分析，Eagle状态信息通过以下方式获取：

```javascript
// Eagle插件中的实现逻辑
const selectedFolders = await eagle.folder.getSelected();
if (selectedFolders && selectedFolders.length > 0) {
    const folder = selectedFolders[0];
    this.eagleStatus.currentFolder = folder.id;
    this.eagleStatus.currentFolderName = folder.name;
    this.eagleStatus.folderPath = await this.buildFolderPath(folder);
} else {
    // 备用：获取最近使用的文件夹
    const recentFolders = await eagle.folder.getRecents();
    // ...
}
```

#### 错误处理机制

- 如果所有方法都无法获取到有效的文件夹ID，抛出明确的错误信息
- 提示用户在Eagle中选择或创建文件夹
- 记录详细的调试日志，便于问题排查

### 2. UI层面修改

#### 在 `index.html` 中添加新按钮
```html
<!-- 在现有的检测图层和导出图层按钮旁边添加 -->
<button id="export-to-eagle-btn" class="action-button" onclick="exportToEagle()" disabled>
    <span class="button-icon">🦅</span>
    <span class="button-text">导出到Eagle</span>
</button>
```

### 2. 核心功能实现

#### 在 `main.js` 中添加 `exportToEagle` 函数

```javascript
/**
 * 导出图层到Eagle
 * 实现流程：
 * 1. 验证前置条件（图层检测状态和Eagle连接状态）
 * 2. 获取当前项目设置的导入模式参数
 * 3. 确定目标导出目录路径
 * 4. 执行图层导出操作
 * 5. 调用Eagle API将导出内容导入到激活组
 * 6. 记录每个步骤的详细日志
 */
async function exportToEagle() {
    try {
        // 步骤1: 验证前置条件
        this.log('开始导出到Eagle流程', 'info');
        
        if (!this.validatePreConditions()) {
            return;
        }
        
        // 步骤2: 获取导出设置
        const exportSettings = this.getExportSettings();
        this.log(`获取导出设置: ${JSON.stringify(exportSettings)}`, 'info');
        
        // 步骤3: 执行图层导出
        const exportResult = await this.performLayerExport(exportSettings);
        if (!exportResult.success) {
            throw new Error(exportResult.error);
        }
        
        this.log(`图层导出完成，导出文件: ${exportResult.files.length} 个`, 'success');
        
        // 步骤4: 导入到Eagle
        const importResult = await this.importToEagle(exportResult.files, exportSettings);
        if (!importResult.success) {
            throw new Error(importResult.error);
        }
        
        this.log('导出到Eagle完成', 'success');
        
        // 步骤5: 显示成功通知
        this.showSuccessNotification(exportResult.files.length);
        
    } catch (error) {
        this.log(`导出到Eagle失败: ${error.message}`, 'error');
        this.showErrorNotification(error.message);
    }
}
```

#### 辅助函数实现

```javascript
/**
 * 验证前置条件
 */
validatePreConditions() {
    // 检查图层检测状态
    if (!this.layersDetected) {
        this.log('未检测到图层，请先执行检测图层操作', 'warning');
        return false;
    }
    
    // 检查Eagle连接状态
    if (this.connectionState !== ConnectionState.CONNECTED) {
        this.log('Eagle连接未建立，请检查Eagle是否运行', 'warning');
        return false;
    }
    
    this.log('前置条件验证通过', 'info');
    return true;
}

/**
 * 获取导出设置
 */
getExportSettings() {
    // 获取当前导入模式设置
    const importSettings = this.settingsManager.getSettings();
    
    const settings = {
        mode: importSettings.mode, // 使用导入模式设置
        projectPath: this.getProjectPath(), // 获取项目路径
        exportFolder: this.getExportFolderByImportMode(importSettings), // 根据导入模式获取导出文件夹
        timestamp: Date.now(),
        // 添加导入模式相关的配置
        projectAdjacentFolder: importSettings.projectAdjacentFolder || 'Eagle_Assets',
        customFolderPath: importSettings.customFolderPath || ''
    };
    
    return settings;
}

/**
 * 根据导入模式设置获取导出文件夹路径
 */
getExportFolderByImportMode(importSettings) {
    const projectPath = this.getProjectPath();
    
    switch (importSettings.mode) {
        case this.ImportModes.PROJECT_ADJACENT:
            // 项目旁复制模式：在项目文件旁创建指定名称的文件夹
            if (!projectPath) {
                throw new Error('项目未保存，无法使用项目旁复制模式');
            }
            const projectDir = require('path').dirname(projectPath);
            const folderName = importSettings.projectAdjacentFolder || 'Eagle_Assets';
            return require('path').join(projectDir, folderName);
            
        case this.ImportModes.CUSTOM_FOLDER:
            // 自定义文件夹模式：使用用户指定的文件夹路径
            if (!importSettings.customFolderPath) {
                throw new Error('请先设置自定义文件夹路径');
            }
            return importSettings.customFolderPath;
            
        case this.ImportModes.DIRECT:
        default:
            // 直接导入模式：使用临时文件夹
            const tempDir = require('os').tmpdir();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            return require('path').join(tempDir, `Eagle2Ae_Export_${timestamp}`);
    }
}

/**
 * 执行图层导出
 */
async performLayerExport(settings) {
    try {
        this.log('开始执行图层导出...', 'info');
        this.log(`导出模式: ${settings.mode}, 目标文件夹: ${settings.exportFolder}`, 'info');
        
        // 确保导出文件夹存在
        await this.ensureDirectoryExists(settings.exportFolder);
        
        // 构建导出参数，使用导入模式设置
        const exportParams = {
            exportPath: settings.exportFolder,
            projectPath: settings.projectPath,
            mode: settings.mode,
            // 传递导入模式相关的配置给JSX脚本
            exportSettings: {
                mode: settings.mode,
                projectAdjacentFolder: settings.projectAdjacentFolder,
                customExportPath: settings.customFolderPath,
                addTimestamp: false, // 由于使用导入模式，不需要额外时间戳
                createSubfolders: false // 简化文件夹结构
            }
        };
        
        // 复用现有的导出逻辑
        const result = await this.callExtendScript('exportLayers', exportParams);
        
        if (result.success) {
            this.log(`图层导出成功，文件保存到: ${settings.exportFolder}`, 'success');
            this.log(`导出文件数量: ${result.exportedFiles ? result.exportedFiles.length : 0}`, 'info');
            return {
                success: true,
                files: result.exportedFiles || [],
                exportPath: settings.exportFolder
            };
        } else {
            throw new Error(result.error || '图层导出失败');
        }
        
    } catch (error) {
        this.log(`图层导出失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 确保目录存在
 */
async ensureDirectoryExists(dirPath) {
    try {
        const fs = require('fs').promises;
        await fs.mkdir(dirPath, { recursive: true });
        this.log(`确保目录存在: ${dirPath}`, 'info');
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw new Error(`创建目录失败: ${error.message}`);
        }
    }
}

/**
 * 导入文件到Eagle
 */
async importToEagle(files, settings) {
    try {
        this.log(`开始导入 ${files.length} 个文件到Eagle...`, 'info');
        
        // 获取Eagle当前激活文件夹ID
        const activeFolderId = await this.getEagleActiveFolderId();
        
        if (!activeFolderId) {
            throw new Error('无法获取Eagle目标文件夹ID，请确保Eagle中已选择或创建文件夹');
        }
        
        this.log(`Eagle目标文件夹ID: ${activeFolderId}`, 'info');
        
        // 准备Eagle API请求数据
        const eagleItems = files.map(file => ({
            path: file.fullPath,
            name: file.name,
            tags: ['AE导出', 'After Effects'],
            annotation: `从After Effects导出 - ${new Date().toLocaleString()}`,
            website: '', // 可选
        }));
        
        const requestData = {
            items: eagleItems,
            folderId: activeFolderId
        };
        
        // 调用Eagle API
        const response = await this.callEagleAPI('/api/item/addFromPaths', requestData);
        
        if (response.status === 'success') {
            this.log(`成功导入 ${files.length} 个文件到Eagle`, 'success');
            return { success: true };
        } else {
            throw new Error('Eagle API返回失败状态');
        }
        
    } catch (error) {
        this.log(`导入到Eagle失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 获取Eagle激活文件夹ID
 */
async getEagleActiveFolderId() {
    try {
        this.log('开始获取Eagle当前激活文件夹ID...', 'info');
        
        // 方法1: 通过WebSocket获取Eagle状态信息（推荐）
        if (this.connectionState === ConnectionState.CONNECTED && this.eagleStatus) {
            const folderId = this.eagleStatus.currentFolder;
            const folderName = this.eagleStatus.currentFolderName;
            const folderPath = this.eagleStatus.folderPath;
            
            if (folderId) {
                this.log(`从Eagle状态获取到激活文件夹: ${folderName} (${folderPath})`, 'info');
                this.log(`文件夹ID: ${folderId}`, 'info');
                return folderId;
            }
        }
        
        // 方法2: 通过Eagle API直接查询（备用方案）
        this.log('尝试通过Eagle API获取激活文件夹...', 'info');
        const response = await this.callEagleAPI('/api/folder/listRecents');
        
        if (response.status === 'success' && response.data && response.data.length > 0) {
            // 使用最近使用的文件夹作为目标
            const recentFolder = response.data[0];
            this.log(`使用最近文件夹: ${recentFolder.name}`, 'info');
            return recentFolder.id;
        }
        
        // 方法3: 获取根文件夹ID（最后备用方案）
        const rootResponse = await this.callEagleAPI('/api/folder/list');
        if (rootResponse.status === 'success' && rootResponse.data && rootResponse.data.length > 0) {
            // 使用第一个文件夹（通常是根文件夹）
            const rootFolder = rootResponse.data[0];
            this.log(`使用根文件夹: ${rootFolder.name}`, 'warning');
            return rootFolder.id;
        }
        
        this.log('无法获取任何可用的文件夹ID', 'warning');
        return null;
        
    } catch (error) {
        this.log(`获取Eagle激活文件夹失败: ${error.message}`, 'error');
        return null;
    }
}

/**
 * 调用Eagle API
 */
async callEagleAPI(endpoint, data = null) {
    try {
        const url = `http://localhost:${this.eaglePort}${endpoint}`;
        const options = {
            method: data ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        this.log(`调用Eagle API: ${endpoint}`, 'info');
        const response = await fetch(url, options);
        const result = await response.json();
        
        this.log(`Eagle API响应: ${JSON.stringify(result)}`, 'info');
        return result;
        
    } catch (error) {
        this.log(`Eagle API调用失败: ${error.message}`, 'error');
        throw error;
    }
}
```

### 3. 按钮状态管理

```javascript
/**
 * 更新导出到Eagle按钮状态
 */
updateExportToEagleButtonState() {
    const button = document.getElementById('export-to-eagle-btn');
    if (!button) return;
    
    // 只有在检测到图层且Eagle连接正常时才启用按钮
    const shouldEnable = this.layersDetected && 
                        this.connectionState === ConnectionState.CONNECTED;
    
    button.disabled = !shouldEnable;
    
    if (shouldEnable) {
        button.classList.remove('disabled');
        button.title = '将检测到的图层导出并导入到Eagle';
    } else {
        button.classList.add('disabled');
        if (!this.layersDetected) {
            button.title = '请先检测图层';
        } else if (this.connectionState !== ConnectionState.CONNECTED) {
            button.title = '请先连接Eagle';
        }
    }
}
```

### 4. 事件绑定

```javascript
// 在现有的事件绑定代码中添加
document.getElementById('export-to-eagle-btn')?.addEventListener('click', () => {
    this.exportToEagle();
});
```

### 5. CSS样式

```css
/* 在现有CSS中添加 */
#export-to-eagle-btn {
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
}

#export-to-eagle-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #e55a2b, #e8841a);
    transform: translateY(-1px);
}

#export-to-eagle-btn:disabled {
    background: #cccccc;
    cursor: not-allowed;
    opacity: 0.6;
}

#export-to-eagle-btn .button-icon {
    margin-right: 6px;
}
```

## 错误处理和日志记录

### 错误类型定义

```javascript
const ExportToEagleErrors = {
    NO_LAYERS_DETECTED: 'NO_LAYERS_DETECTED',
    EAGLE_NOT_CONNECTED: 'EAGLE_NOT_CONNECTED',
    EXPORT_FAILED: 'EXPORT_FAILED',
    EAGLE_API_FAILED: 'EAGLE_API_FAILED',
    INVALID_SETTINGS: 'INVALID_SETTINGS'
};
```

### 日志记录策略

```javascript
/**
 * 记录导出到Eagle的详细日志
 */
logExportToEagleStep(step, data, level = 'info') {
    const logEntry = {
        timestamp: new Date().toISOString(),
        step: step,
        level: level,
        data: data,
        feature: 'export-to-eagle'
    };
    
    this.log(`[导出到Eagle] ${step}: ${JSON.stringify(data)}`, level);
    
    // 可选：发送到Eagle端进行记录
    this.sendToEagle({
        type: 'export_to_eagle_log',
        logEntry: logEntry
    });
}
```

## 测试计划

### 单元测试

1. **前置条件验证测试**
   - 测试图层未检测时的行为
   - 测试Eagle未连接时的行为
   - 测试正常条件下的验证

2. **导出功能测试**
   - 测试不同导出模式
   - 测试文件路径生成
   - 测试导出失败处理

3. **Eagle API调用测试**
   - 测试API连接
   - 测试数据格式
   - 测试错误响应处理

### 集成测试

1. **Eagle插件端功能测试**
   - **消息处理测试**: 验证Eagle插件能正确接收和处理AE的导出请求
   - **文件夹验证测试**: 测试 `validateTargetFolder()` 函数对各种文件夹ID的验证准确性
   - **批量导入测试**: 验证 `importFilesToEagle()` 函数的批量文件导入功能
   - **错误恢复测试**: 测试批量导入失败时的逐个导入备用方案
   - **通知显示测试**: 验证导入成功后Eagle中的通知显示
   - **激活文件夹信息测试**: 测试 `handleGetActiveFolderRequest()` 函数返回的文件夹信息准确性

2. **双端通信测试**
   - **WebSocket连接测试**: 验证AE端与Eagle插件的WebSocket通信稳定性
   - **消息序列化测试**: 测试复杂数据结构在双端传输中的完整性
   - **超时处理测试**: 验证通信超时时的错误处理机制
   - **并发请求测试**: 测试多个导出请求的并发处理能力

3. **Eagle目标文件夹ID获取测试**
   - 测试在Eagle中选择不同文件夹时的ID获取准确性
   - 验证WebSocket连接状态下的文件夹信息同步
   - 测试Eagle API备用方案的可靠性（`/api/folder/listRecents`、`/api/folder/list`）
   - 验证在Eagle未选择文件夹时的错误处理
   - 测试文件夹层级路径的正确显示

4. **完整流程测试**
   - 从检测图层到导入Eagle的完整流程
   - 多文件导出测试
   - 错误恢复测试
   - 验证导出文件在Eagle中的正确分组
   - 测试标签和注释信息的正确传递

5. **兼容性测试**
   - 不同AE版本测试
   - 不同Eagle版本测试
   - 不同操作系统测试
   - 验证Eagle连接状态变化时的文件夹ID更新
   - 测试Eagle插件更新后的向后兼容性

## 实施流程设计

### 开发阶段

1. **第一阶段：Eagle插件端扩展**
   - 在Eagle插件中新增导出请求处理的消息类型定义
   - 实现 `handleExportToEagleRequest()` 函数处理AE导出请求
   - 实现 `validateTargetFolder()` 函数验证目标文件夹有效性
   - 实现 `importFilesToEagle()` 函数执行批量文件导入
   - 实现 `handleGetActiveFolderRequest()` 函数提供激活文件夹信息
   - 扩展消息路由，添加新消息类型的处理逻辑

2. **第二阶段：Eagle目标文件夹ID获取机制**
   - 实现 `getEagleActiveFolderId` 函数的三层获取策略
   - 验证从Eagle WebSocket连接状态获取文件夹ID的可靠性
   - 测试Eagle API备用方案（`/api/folder/listRecents`和`/api/folder/list`）
   - 实现完善的错误处理和日志记录机制
   - 确保在各种Eagle状态下都能获取到有效的目标文件夹ID

3. **第三阶段：路径配置验证**
   - 验证现有导入模式设置的完整性
   - 实现 `getExportFolderByImportMode` 函数
   - 测试各种导入模式下的路径生成逻辑
   - 确保项目旁复制模式的文件夹名称配置正确

4. **第四阶段：核心功能实现**
   - 实现 `exportToEagle` 主函数
   - 修改 `performLayerExport` 以使用导入模式设置
   - 实现 Eagle API 调用逻辑（集成文件夹ID获取机制）
   - 集成与Eagle插件的通信机制
   - 基础错误处理和日志记录

5. **第五阶段：UI集成**
   - 添加导出到Eagle按钮
   - 实现按钮状态管理
   - 集成到现有事件系统
   - 确保按钮状态与导入模式设置联动

6. **第六阶段：优化和测试**
   - 测试不同导入模式下的导出行为
   - 验证路径一致性
   - 测试Eagle插件端的消息处理
   - 性能优化
   - 全面测试
   - 用户体验优化

## 部署和维护

### 版本控制

- 在代码中添加版本标识
- 记录功能变更日志
- 保持向后兼容性

### 性能优化

- 批量处理文件导入
- 异步操作避免UI阻塞
- 缓存Eagle连接信息

### 用户体验

- 提供清晰的进度指示
- 详细的错误信息提示
- 操作成功的确认反馈

## 总结

本技术文档详细规划了"导出到Eagle"功能的完整实现方案。该功能采用双端协作的架构设计，通过AE端和Eagle插件端的紧密配合，实现了从图层导出到Eagle导入的无缝工作流程。

### 关键技术要点

1. **Eagle插件端扩展**：新增专门的导出请求处理机制
   - 实现 `handleExportToEagleRequest()` 处理AE导出请求
   - 实现 `validateTargetFolder()` 验证目标文件夹有效性
   - 实现 `importFilesToEagle()` 执行批量文件导入
   - 支持批量导入失败时的逐个导入备用方案
   - 提供实时用户通知和详细日志记录

2. **Eagle目标文件夹ID获取机制**：建立三层获取策略，确保在各种情况下都能准确获取目标文件夹
   - 优先从WebSocket连接状态获取当前激活文件夹
   - 备用Eagle API查询最近使用文件夹
   - 最后备用根文件夹方案

3. **双端通信机制**：基于HTTP请求的直接通信
   - **AE到Eagle**：通过HTTP POST请求发送导出请求到 `/export-to-eagle` 端点
   - **Eagle到AE**：保持现有的WebSocket优先，HTTP队列备用机制
   - 新增专用的导出端点，独立于现有消息队列系统
   - 支持复杂数据结构的可靠传输和完善的错误处理机制

4. **路径一致性设计**：导出路径与导入模式设置保持一致，减少用户配置负担

5. **现有架构复用**：充分利用现有的设置管理、文件处理和Eagle连接功能

6. **渐进式实现**：分阶段开发，优先实现Eagle插件端扩展和文件夹ID获取机制

### 实施优势

- **双端协作优势**：AE端专注导出，Eagle端专注导入，职责分离清晰
- **目标精确性**：通过多层策略确保文件导入到用户期望的Eagle文件夹
- **用户体验一致**：导入和导出使用相同的路径逻辑
- **开发效率高**：复用现有代码和设置
- **维护成本低**：统一的配置管理
- **扩展性强**：模块化设计为未来功能扩展奠定基础
- **可靠性高**：多重备用方案和错误恢复机制确保功能稳定性

### 核心创新点

- **智能文件夹识别**：自动识别用户当前在Eagle中的操作上下文
- **无缝工作流程**：从AE导出到Eagle导入的一键式操作
- **状态同步机制**：实时同步Eagle的文件夹选择状态
- **渐进式降级策略**：从批量导入到逐个导入的智能备用方案
- **专业化消息处理**：Eagle端专门的导出请求处理机制

### Eagle插件端修改的重要性

1. **专业化处理能力**：专门的消息类型和处理函数确保导出请求的高效处理
2. **批量导入优化**：优先使用Eagle批量API，提升大量文件的导入效率
3. **智能错误恢复**：批量导入失败时自动降级为逐个导入，确保操作成功率
4. **用户体验提升**：实时通知和详细反馈让用户清楚了解操作进度和结果
5. **系统稳定性**：完善的验证和错误处理机制确保Eagle端的稳定运行

通过本方案的实施，用户将能够无缝地将AE图层导出到Eagle中的指定文件夹，导出的文件位置与其导入模式设置完全一致，并且能够精确控制在Eagle中的存储位置。Eagle插件端的专业化扩展确保了整个流程的高效性和可靠性，形成完整的工作流程闭环。

## 功能触发流程

### 完整操作流程

以下是"导出到Eagle"功能从用户触发到完成导入的完整流程：

#### 1. 用户操作阶段
```
用户在AE中选择图层 → 点击"导出到Eagle"按钮
```

#### 2. AE端处理阶段
```
2.1 检测选中图层
    ├── 验证图层类型和状态
    ├── 获取图层属性信息
    └── 确认可导出性

2.2 读取导入模式设置
    ├── 调用 getImportModeSettings()
    ├── 解析当前导入模式配置
    └── 确定导出路径策略

2.3 确定导出路径
    ├── 调用 getExportFolderByImportMode()
    ├── 根据导入模式映射导出路径
    │   ├── 项目旁复制模式 → 项目文件旁的指定文件夹
    │   ├── 自定义文件夹模式 → 用户设定的自定义路径
    │   └── 直接导入模式 → 临时文件夹
    └── 调用 ensureDirectoryExists() 确保目录存在

2.4 执行图层导出
    ├── 调用 performLayerExport()
    ├── 渲染图层为文件
    ├── 保存到确定的导出路径
    └── 收集导出文件信息
```

#### 3. Eagle目标文件夹获取阶段
```
3.1 获取Eagle激活文件夹ID
    ├── 优先：从WebSocket连接状态获取
    │   ├── 读取 eagleStatus.currentFolder
    │   └── 验证文件夹ID有效性
    ├── 备用：通过Eagle API查询
    │   ├── 调用 /api/folder/listRecent
    │   └── 获取最近使用文件夹
    └── 最后备用：获取根文件夹ID
        └── 调用 /api/folder/list 获取根目录

3.2 验证目标文件夹
    ├── 检查文件夹ID是否存在
    ├── 验证文件夹访问权限
    └── 确认文件夹状态正常
```

#### 4. 双端通信阶段
```
4.1 AE端发送导出请求
    ├── 构建导出请求数据
    │   ├── 文件信息：路径、名称、元数据
    │   ├── 目标文件夹ID
    │   └── 附加信息：标签、注释等
    ├── 通过HTTP POST请求发送到Eagle的 /export-to-eagle 端点
    └── 等待Eagle端HTTP响应

4.2 Eagle端接收和处理
    ├── HTTP服务器接收POST请求
    ├── 调用 handleExportToEagle() 处理请求
    ├── 解析请求数据
    └── 验证请求有效性
```

#### 5. Eagle端导入执行阶段
```
5.1 文件夹验证
    ├── 调用 validateTargetFolder()
    ├── 验证目标文件夹存在性
    └── 确认文件夹访问权限

5.2 执行文件导入
    ├── 调用 importFilesToEagle()
    ├── 准备Eagle API请求数据
    │   ├── 文件路径映射
    │   ├── 标签信息：['AE导出', 'After Effects', ...]
    │   ├── 注释信息：导出时间和来源
    │   └── 目标文件夹ID
    ├── 优先尝试批量导入
    │   ├── 调用 /api/item/addFromPaths
    │   └── 批量处理所有文件
    └── 失败时降级为逐个导入
        ├── 遍历每个文件
        ├── 调用 /api/item/addFromPath
        └── 记录成功和失败数量

5.3 结果处理
    ├── 统计导入结果
    │   ├── 成功导入数量
    │   ├── 失败导入数量
    │   └── 导入的文件项信息
    ├── 显示Eagle通知
    │   ├── 标题：'Eagle2Ae'
    │   ├── 内容：导入成功数量
    │   └── 显示时长：3秒
    └── 记录详细日志
```

#### 6. 响应反馈阶段
```
6.1 Eagle端发送响应
    ├── 构建HTTP响应数据
    │   ├── 操作状态：成功/失败
    │   ├── 导入统计：成功数量、失败数量
    │   └── 导入项目信息
    └── 通过HTTP响应返回给AE端

6.2 AE端接收响应
    ├── 解析HTTP响应数据
    ├── 更新UI状态
    ├── 显示操作结果
    │   ├── 成功：显示导入成功信息
    │   └── 失败：显示错误信息和建议
    └── 记录操作日志
```

#### 7. 用户反馈阶段
```
7.1 AE端用户反馈
    ├── 按钮状态恢复
    ├── 显示操作结果通知
    └── 更新操作历史记录

7.2 Eagle端用户反馈
    ├── 文件出现在目标文件夹
    ├── 显示导入完成通知
    ├── 文件带有正确的标签和注释
    └── 可在Eagle中正常预览和管理
```

### 错误处理流程

```
错误检测点：
├── AE端图层检测失败 → 提示用户选择有效图层
├── 导出路径创建失败 → 检查磁盘空间和权限
├── 文件导出失败 → 重试或提示用户检查AE项目
├── Eagle连接失败 → 提示用户启动Eagle并检查插件
├── 文件夹ID获取失败 → 使用备用方案或根文件夹
├── Eagle端验证失败 → 提示文件夹不存在或无权限
├── 批量导入失败 → 自动降级为逐个导入
├── 逐个导入失败 → 记录失败文件并继续处理其他文件
└── 通信超时 → 重试机制或提示用户检查网络
```

### 流程特点

1. **双端协作**：AE端负责文件导出，Eagle端负责文件导入
2. **直接HTTP通信**：AE通过HTTP POST直接发送导出请求到Eagle
3. **实时响应**：Eagle立即处理请求并返回结果，无需轮询
4. **智能降级**：批量导入失败时自动切换到逐个导入
5. **多重备用**：文件夹ID获取有三层备用策略
6. **独立端点**：导出功能使用专用端点，不依赖现有消息队列
7. **实时反馈**：每个阶段都有相应的用户反馈
8. **错误恢复**：完善的错误处理和恢复机制
9. **双向兼容**：保持与现有通信机制的兼容性

这个完整的触发流程确保了用户从点击按钮到文件成功导入Eagle的每个环节都有可靠的处理机制，实现了真正的一键式导出体验。