# ExtendScript 文件夹选择功能实现文档

## 概述

本文档描述了 Eagle2Ae After Effects 扩展中使用 ExtendScript 的 `Folder.selectDlg()` 方法实现文件夹选择功能的详细实现。这种方式会弹出 After Effects 原生的文件夹选择对话框，提供与 AE 一致的用户体验。

**重要更新（2024年）**：文件夹选择功能现在优先使用现代Web API，提供更好的用户体验：

1. **File System Access API** - 在支持的浏览器中（Chrome 86+, Edge 86+）提供原生文件夹选择体验
2. **webkitdirectory API** - 作为回退方案，支持大多数现代浏览器
3. **ExtendScript API** - 最后的回退方案，使用AE内置的文件夹选择对话框

用户取消选择时不会显示任何错误提示，提供了更加友好的交互体验。

## 实现方案

### 1. 技术选择（多层回退策略）

**优先级顺序**：
1. **File System Access API** - 现代浏览器原生文件夹选择（Chrome 86+, Edge 86+）
2. **webkitdirectory API** - 广泛支持的Web标准（Chrome, Firefox, Safari）
3. **ExtendScript API** - AE原生文件夹选择对话框（最后回退）

**各方案对比**：
- ✅ **File System Access API** - 系统原生体验，最佳用户体验
- ✅ **webkitdirectory API** - 良好兼容性，Web标准
- ✅ **ExtendScript API** - AE原生界面，稳定可靠
- ❌ CEP `window.cep.fs.showOpenDialog()` - 界面风格不统一

### 2. 实现架构

```
前端 JavaScript (main.js/index.html)
    ↓ 检测浏览器支持

方案1: File System Access API
    ↓ showDirectoryPicker()
    系统原生文件夹选择对话框

方案2: webkitdirectory API (回退)
    ↓ input[webkitdirectory]
    浏览器文件夹选择对话框

方案3: ExtendScript API (最后回退)
    ↓ csInterface.evalScript()
    ExtendScript (hostscript.jsx)
    ↓ Folder.selectDlg()
    After Effects 原生文件夹选择对话框
```

## 技术实现

### 1. ExtendScript 文件夹选择函数 (`jsx/hostscript.jsx`)

```javascript
// 文件夹选择函数
function selectFolder(initialPath, title) {
    try {
        var folder;
        
        // 设置初始文件夹
        if (initialPath && initialPath !== '') {
            folder = new Folder(initialPath);
            if (!folder.exists) {
                folder = Folder.desktop;
            }
        } else {
            folder = Folder.desktop;
        }
        
        // 显示文件夹选择对话框
        var selectedFolder = folder.selectDlg(title || "选择文件夹");
        
        if (selectedFolder) {
            return JSON.stringify({
                success: true,
                path: selectedFolder.fsName,
                cancelled: false
            });
        } else {
            return JSON.stringify({
                success: false,
                path: null,
                cancelled: true
            });
        }
    } catch (error) {
        return JSON.stringify({
            success: false,
            path: null,
            cancelled: false,
            error: error.toString()
        });
    }
}
```

**关键特性**：
- 支持初始路径设置
- 自动回退到桌面（如果初始路径无效）
- 统一的 JSON 返回格式
- 完整的错误处理

### 2. 主应用文件夹选择 (`js/main.js`)

```javascript
// 使用 ExtendScript 文件夹选择对话框
tryExtendScriptFolderPicker() {
    try {
        const currentPath = document.getElementById('custom-folder-path').value || '';
        this.log('正在打开文件夹选择对话框...', 'info');
        
        // 调用 ExtendScript 的文件夹选择函数
        this.csInterface.evalScript(`selectFolder("${currentPath}", "选择目标文件夹")`, (result) => {
            try {
                const parsedResult = JSON.parse(result);
                
                if (parsedResult.success && parsedResult.path) {
                    this.handleSelectedFolder(parsedResult.path);
                    this.log(`已选择文件夹: ${parsedResult.path}`, 'success');
                } else if (parsedResult.cancelled) {
                    this.log('用户取消了文件夹选择', 'info');
                } else {
                    this.log(`文件夹选择失败: ${parsedResult.error || '未知错误'}`, 'error');
                    // 不再回退到其他方式，直接提示用户
                }
            } catch (error) {
                this.log(`解析文件夹选择结果失败: ${error.message}`, 'error');
                // 不再回退到其他方式，直接提示用户
            }
        });
        
        return true;
    } catch (error) {
        this.log(`ExtendScript文件夹选择出错: ${error.message}`, 'error');
        return false;
    }
}
```

### 3. 弹窗中的文件夹选择 (`index.html`)

**导入文件夹选择**：
```javascript
function browseFolderPath() {
    try {
        // 使用 ExtendScript 文件夹选择对话框
        if (window.csInterface) {
            const currentPath = customFolderSettings.folderPath || '';
            console.log('正在打开文件夹选择对话框...');
            
            window.csInterface.evalScript(`selectFolder("${currentPath}", "选择目标文件夹")`, (result) => {
                try {
                    const parsedResult = JSON.parse(result);
                    
                    if (parsedResult.success && parsedResult.path) {
                        const pathInput = document.getElementById('custom-folder-path-input');
                        pathInput.value = parsedResult.path;
                        console.log('已选择文件夹:', parsedResult.path);
                    } else if (parsedResult.cancelled) {
                        console.log('用户取消了文件夹选择');
                    } else {
                        console.error('文件夹选择失败:', parsedResult.error || '未知错误');
                        fallbackToInputDialog('导入');
                    }
                } catch (error) {
                    console.error('解析文件夹选择结果失败:', error);
                    fallbackToInputDialog('导入');
                }
            });
        } else {
            console.warn('CSInterface不可用，使用输入框');
            fallbackToInputDialog('导入');
        }
    } catch (error) {
        console.error('文件夹选择出错:', error);
        fallbackToInputDialog('导入');
    }
}
```

**导出文件夹选择**：
```javascript
function browseExportFolderPath() {
    // 类似的实现，标题改为"选择导出文件夹"
}
```

## 返回值格式

### 成功选择文件夹
```json
{
    "success": true,
    "path": "C:\\Users\\Username\\Documents\\MyFolder",
    "cancelled": false
}
```

### 用户取消选择
```json
{
    "success": false,
    "path": null,
    "cancelled": true
}
```

### 发生错误
```json
{
    "success": false,
    "path": null,
    "cancelled": false,
    "error": "Error message"
}
```

## 错误处理和回退机制

### 1. 回退策略

1. **优先级1**：ExtendScript `Folder.selectDlg()` 原生对话框
2. **优先级2**：自定义文件夹选择模态框（现有功能）
3. **优先级3**：prompt 输入框（最后回退）

### 2. 错误处理场景

- **CSInterface 不可用**：回退到自定义模态框
- **ExtendScript 执行失败**：回退到自定义模态框
- **JSON 解析失败**：回退到输入框
- **用户取消选择**：正常处理，不显示错误，**不回退到输入框**
- **真正的执行错误**：回退到相应的备用方案

## 用户体验特点

### 1. 原生 AE 体验
- 使用 After Effects 原生的文件夹选择对话框
- 界面风格与 AE 完全一致
- 支持 AE 的所有界面语言

### 2. 功能特性
- ✅ 支持初始路径设置
- ✅ 可自定义对话框标题
- ✅ 支持中文路径和文件夹名
- ✅ 自动处理无效路径
- ✅ 完整的错误处理
- ✅ 用户取消操作的正确处理

### 3. 取消操作处理
- ✅ 用户点击"Cancel"时，不会弹出输入框
- ✅ 取消操作被视为正常用户行为，不是错误
- ✅ 只有在真正出错时才会回退到备用方案
- ✅ 提供清晰的日志信息区分取消和错误

### 4. 性能优势
- 响应速度快
- 内存占用小
- 与 AE 集成度高
- 稳定性好

## 测试验证

### 测试文件
创建了 `test_extendscript_folder_picker.html` 测试文件，包含：

1. **CSInterface 可用性检查**
2. **基础文件夹选择测试**
3. **导入文件夹选择测试**
4. **导出文件夹选择测试**
5. **错误处理测试**

### 测试场景
- CSInterface 初始化和可用性
- 正常文件夹选择流程
- 用户取消选择的处理
- 无效初始路径的处理
- 空标题的处理
- ExtendScript 执行错误的处理

## 使用说明

### 1. 导入文件夹选择
1. 在设置面板中选择"自定义文件夹"模式
2. 点击"浏览..."按钮
3. 在弹出的 AE 原生文件夹选择对话框中选择目标文件夹
4. 点击"确定"完成选择

### 2. 导出文件夹选择
1. 在导出设置中选择"自定义文件夹"模式
2. 点击"浏览..."按钮
3. 在弹出的 AE 原生文件夹选择对话框中选择导出文件夹
4. 点击"确定"完成选择

## 兼容性说明

- **AE 环境**：完全支持，使用原生文件夹选择对话框
- **CSInterface 可用**：正常工作
- **CSInterface 不可用**：自动回退到自定义模态框
- **ExtendScript 执行失败**：回退到输入框方式

## 总结

通过使用 ExtendScript 的 `Folder.selectDlg()` 方法，我们实现了：

- **最佳用户体验**：与 After Effects 原生界面完全一致
- **高度集成**：无缝融入 AE 工作流程
- **稳定可靠**：基于 AE 原生 API，稳定性极高
- **完整功能**：支持初始路径、自定义标题、错误处理
- **优雅回退**：多层回退机制确保功能可用性

这个实现方案提供了最接近原生 After Effects 体验的文件夹选择功能，是当前最优的解决方案。
