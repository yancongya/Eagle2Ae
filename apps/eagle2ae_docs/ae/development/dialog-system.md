# 对话框系统技术文档 (v2.3.0)

## 概述

本文档详细描述了Eagle2Ae CEP扩展中的对话框系统。目前系统采用混合架构：
1.  **HTML/CSS 模态对话框**: 用于“图层检测总结”等复杂的、信息丰富的场景，确保了UI风格的现代化和统一性。
2.  **JSX 原生对话框**: 用于“警告”、“确认”等简单的、需要阻塞主进程的系统级提示。

## 1. HTML/CSS 模态对话框系统 (主要)

这是当前项目推荐使用的主要对话框系统，尤其适用于需要展示复杂数据和自定义交互的场景。

### 1.1. 架构与实现
- **核心文件**: `Eagle2Ae-Ae/js/ui/summary-dialog.js`
- **实现原理**: 该系统不依赖AE原生的`Window`对象，而是通过JavaScript在CEP扩展的HTML页面内动态创建DOM元素（`div`, `button`等），并使用预设的CSS样式来构建一个模态对话框。
- **调用流程**:
    1.  `main.js`中的业务逻辑（如`detectLayers`）完成数据处理。
    2.  实例化`SummaryDialog`类：`const dialog = new SummaryDialog();`
    3.  调用`.show(data)`方法，将数据传入，触发对话框的创建和显示。
- **优点**:
    - **UI统一**: 实现了与Demo模式完全一致的视觉风格。
    - **高可控性**: 样式和交互完全由Web技术栈控制，易于定制和扩展。
    - **现代感**: 外观比JSX原生窗口更现代化。

### 1.2. 交互逻辑示例 (图层总结对话框)
- **点击图层名称**:
    - 如果是素材类图层，则调用`tryOpenFolderInCEP(filePath)`，最终执行`jsx/utils/folder-opener.js`中的逻辑打开文件所在文件夹。
    - 如果是其他图层，则弹出包含详细信息的子对话框。
- **悬浮提示**: 鼠标悬停在图层上会显示包含完整信息的Tooltip。

### 1.3. 文件结构
```
Eagle2Ae-Ae/
├── js/
│   ├── main.js                 # 业务逻辑，调用SummaryDialog
│   └── ui/
│       └── summary-dialog.js   # HTML对话框的核心实现
└── index.html                  # CEP扩展的主页面，对话框在此渲染
```

---

## 2. 旧版/通用 JSX 原生对话框 (辅助)

> **注意**: 此原生窗口系统目前主要用于简单的、需要强阻塞的**警告**(`dialog-warning.jsx`)和**确认**对话框。复杂的“图层检测总结”对话框已由新的HTML系统取代。

### 2.1 系统组成
- **CEP扩展端 (JavaScript)**: 通过`csInterface.evalScript()`调用JSX函数。
- **ExtendScript端 (JSX)**: 包含创建和管理`Window('dialog')`的代码，如`dialog-warning.jsx`。
- **通信机制**: 通过`CSInterface`在两端之间传递简单的字符串或JSON数据。

### 2.2 文件结构
```
Eagle2Ae-Ae/
└── jsx/
    └── dialog-warning.jsx      # ExtendScript警告对话框实现
    # dialog-summary.jsx 已经废弃，其功能由 summary-dialog.js 代替
```

### 2.3 ExtendScript对话框实现

### 2.1 全局配置对象

```javascript
// 扩展名变量 - 统一弹窗标题
var EXTENSION_NAME = "Eagle2Ae@烟囱鸭";

// 对话框全局配置
var dialogConfig = {
    title: "提示",
    message: "请选择一个选项",
    type: "warning", // warning, error, info, confirm, select
    buttons: ["确定", "取消"],
    defaultButton: 0,
    cancelButton: 1,
    options: [], // 用于选择类型对话框的选项列表
    result: null // 存储用户选择结果
};
```

#### 2.2.4 最新实现 (showPanelConfirmDialog)

```javascript
/**
 * 显示Panel样式确认对话框（双按钮）
 * @param {string} title 对话框标题（将被扩展名覆盖）
 * @param {string} message 消息内容（建议使用简洁单行文本）
 * @param {Array} buttons 按钮文本数组，默认["确定", "取消"]
 * @returns {number} 0表示确认，1表示取消
 */
function showPanelConfirmDialog(title, message, buttons) {
    try {
        var buttonArray = buttons || ["确定", "取消"];
        var result = 1; // 默认为取消
        
        // 使用扩展名作为标题，忽略传入的title参数
        var dialog = new Window("dialog", EXTENSION_NAME);
        dialog.orientation = "column";
        dialog.alignChildren = "fill";
        dialog.spacing = 10;
        dialog.margins = 16;
        dialog.preferredSize.width = 280;
        dialog.preferredSize.height = 110;
        
        // 消息文本 - 居中对齐
        var messageText = dialog.add("statictext", undefined, message, {multiline: false});
        messageText.alignment = ["center", "center"];
        messageText.justify = "center";
        messageText.preferredSize.height = 24;
        
        // 按钮组 - 居中对齐
        var buttonGroup = dialog.add("group");
        buttonGroup.orientation = "row";
        buttonGroup.spacing = 10;
        buttonGroup.alignment = ["center", "bottom"];
        buttonGroup.alignChildren = "center";
        
        // 第一个按钮（确定/继续）
        var firstButton = buttonGroup.add("button", undefined, buttonArray[0]);
        firstButton.preferredSize.width = 70;
        firstButton.preferredSize.height = 24;
        firstButton.onClick = function() {
            result = 0;
            dialog.close();
        };
        
        // 第二个按钮（取消）
        var secondButton = buttonGroup.add("button", undefined, buttonArray[1]);
        secondButton.preferredSize.width = 70;
        secondButton.preferredSize.height = 24;
        secondButton.onClick = function() {
            result = 1;
            dialog.close();
        };
        
        // 设置默认按钮和键盘快捷键
        firstButton.active = true;
        dialog.defaultElement = firstButton;
        dialog.cancelElement = secondButton;
        
        // 居中显示对话框
        dialog.center();
        dialog.show();
        
        return result;
        
    } catch (error) {
        // 如果Panel创建失败，降级到原生confirm
        return confirm((EXTENSION_NAME + "\n\n" + message) || "请确认操作") ? 0 : 1;
    }
}
```

### 2.3 Panel样式警告对话框

#### 2.3.1 最新实现 (showPanelWarningDialog)

```javascript
/**
 * 显示Panel样式警告对话框（单按钮）
 * @param {string} title 对话框标题（将被扩展名覆盖）
 * @param {string} message 消息内容（建议使用简洁单行文本）
 * @returns {void}
 */
function showPanelWarningDialog(title, message) {
    try {
        // 使用扩展名作为标题，忽略传入的title参数
        var dialog = new Window("dialog", EXTENSION_NAME);
        dialog.orientation = "column";
        dialog.alignChildren = "fill";
        dialog.spacing = 10;
        dialog.margins = 16;
        dialog.preferredSize.width = 280;
        dialog.preferredSize.height = 110;
        
        // 消息文本 - 居中对齐
        var messageText = dialog.add("statictext", undefined, message, {multiline: false});
        messageText.alignment = ["center", "center"];
        messageText.justify = "center";
        messageText.preferredSize.height = 24;
        
        // 按钮容器 - 确保按钮居中
        var buttonContainer = dialog.add("group");
        buttonContainer.orientation = "row";
        buttonContainer.alignment = ["center", "bottom"];
        buttonContainer.alignChildren = "center";
        
        // 确定按钮
        var okButton = buttonContainer.add("button", undefined, "确定");
        okButton.preferredSize.width = 70;
        okButton.preferredSize.height = 24;
        okButton.onClick = function() {
            dialog.close();
        };
        
        // 设置默认按钮和键盘快捷键
        okButton.active = true;
        dialog.defaultElement = okButton;
        dialog.cancelElement = okButton;
        
        // 居中显示对话框
        dialog.center();
        dialog.show();
        
    } catch (error) {
        // 如果Panel创建失败，降级到原生alert
        alert((EXTENSION_NAME + "\n\n" + message) || "操作提示");
    }
}
```

### 2.4 项目文件安全警告对话框系统 *(v2.3.1新增)*

#### 2.4.1 AE项目文件警告对话框 (showAEProjectWarningDialog)

当检测到用户拖拽的文件中包含AE项目文件时，显示安全警告对话框

```javascript
/**
 * 显示AE项目文件警告对话框
 * @param {Array<string>} aeProjectFiles - 检测到的AE项目文件路径数组
 * @returns {number} 0表示继续导入，1表示取消操作
 */
function showAEProjectWarningDialog(aeProjectFiles)
```

**功能特性**:
- **安全提醒**: 警告用户AE项目文件导入的潜在风险
- **文件列表**: 显示检测到的所有AE项目文件路径
- **操作选择**: 提供"继续导入"和"取消"两个选项
- **智能截断**: 超过3个文件时显示省略号

**支持的文件格式**:
- `.aep` - After Effects 项目文件
- `.aet` - After Effects 项目模板
- `.aepx` - After Effects XML 项目文件

**对话框示例**:
```
标题: Eagle2Ae@烟囱鸭
消息: 检测到AE项目文件，不建议直接导入：
      C:\Projects\MyProject.aep
      C:\Templates\template.aet
      建议使用"导入项目"功能
按钮: [继续导入] [取消]
```

**调用示例**:
```javascript
// 在main.js中调用
var aeFiles = ['C:\\Projects\\test.aep', 'C:\\Templates\\demo.aet'];
var userChoice = await executeHostScript('showAEProjectWarningDialog', aeFiles);
if (userChoice === 1) {
    console.log('用户取消了导入操作');
    return;
}
```

#### 2.4.2 已导入文件警告对话框 (showImportedFilesWarningDialog)

当检测到用户拖拽的文件中包含已导入到项目的文件时，显示重复导入警告

```javascript
/**
 * 显示已导入文件警告对话框
 * @param {Array<string>} importedFiles - 已导入的文件路径数组
 * @returns {number} 0表示继续导入，1表示取消操作
 */
function showImportedFilesWarningDialog(importedFiles)
```

**功能特性**:
- **重复检测**: 提醒用户文件已存在于项目中
- **文件列表**: 显示所有已导入的文件路径
- **操作选择**: 提供"继续导入"和"取消"两个选项
- **性能优化**: 使用哈希表算法快速检测重复文件

**对话框示例**:
```
标题: Eagle2Ae@烟囱鸭
消息: 以下文件已在项目中：
      image1.jpg
      video.mp4
      继续导入将创建重复素材
按钮: [继续导入] [取消]
```

**调用示例**:
```javascript
// 在main.js中调用
var duplicateFiles = ['image1.jpg', 'video.mp4'];
var userChoice = await executeHostScript('showImportedFilesWarningDialog', duplicateFiles);
if (userChoice === 1) {
    console.log('用户取消了重复导入');
    return;
}
```

#### 2.4.3 项目文件检测集成流程

项目文件检测与警告对话框的完整集成流程：

```javascript
// 1. 文件拖拽触发检测
function handleFileDrop(files) {
    // 2. 检测AE项目文件
    var aeProjectCheck = await executeHostScript('checkAEProjectFiles', files);
    if (aeProjectCheck.aeProjectFiles.length > 0) {
        var userChoice = await executeHostScript('showAEProjectWarningDialog', 
                                                aeProjectCheck.aeProjectFiles);
        if (userChoice === 1) return; // 用户取消
    }
    
    // 3. 检测已导入文件
    var importedCheck = await executeHostScript('checkProjectImportedFiles', files);
    if (importedCheck.importedFiles.length > 0) {
        var userChoice = await executeHostScript('showImportedFilesWarningDialog', 
                                                importedCheck.importedFiles);
        if (userChoice === 1) return; // 用户取消
    }
    
    // 4. 继续正常导入流程
    proceedWithImport(files);
}
```

**性能优化特性**:
- **批量检测**: 一次性检测所有文件，避免重复遍历
- **哈希表算法**: O(n+m) 时间复杂度，显著提升检测速度
- **智能分批**: 超过100个文件时自动分批处理
- **内存优化**: 及时清理临时数据结构

### 2.5 图层详情对话框系统

#### 2.5.1 图层检测总结对话框 (showDetectionSummaryDialog)

显示图层检测完成后的详细统计信息和操作按钮

```javascript
/**
 * 显示图层检测总结弹窗
 * @param {Array} detectionResults - 原始检测结果数组
 * @returns {boolean} 用户是否点击了确定按钮
 */
function showDetectionSummaryDialog(detectionResults)
```

**功能特性**:
- 显示可导出和不可导出图层的统计信息
- 为每个图层提供详细信息和操作按钮
- 支持文件夹打开功能
- 悬浮提示显示图层详细信息
- 响应式布局和滚动支持

#### 2.4.2 文件夹打开按钮 (addOpenFolderButton)

为图层行添加文件夹打开功能按钮

```javascript
/**
 * 添加打开文件夹按钮
 * @param {Group} parent - 父容器
 * @param {Object} layer - 图层对象
 */
function addOpenFolderButton(parent, layer)
```

**按钮特性**:
- **图标**: `▶` (右箭头符号，表示"打开"或"进入"动作)
- **尺寸**: 25x18像素
- **提示**: "打开文件所在文件夹"
- **功能**: 调用`openLayerFolder(layer)`打开文件夹

**图标演进历史**:
1. **v1.0**: 使用表情符号 `📁` (兼容性问题)
2. **v1.1**: 临时修复为 `[...]` (过于简单)
3. **v2.0**: 优化为 `▶` (兼容且美观)

**交互流程**:
```
用户点击▶按钮
    ↓
调用openLayerFolder(layer)
    ↓
获取图层文件路径
    ↓
URI解码处理中文路径
    ↓
验证文件夹存在性
    ↓
使用JSX原生Folder.execute()打开
    ↓
失败时使用explorer.exe备用方案
    ↓
显示成功/失败提示
```

#### 2.4.3 扩展功能按钮 (addExtensionButton)

为图层行添加扩展功能按钮（预留）

```javascript
/**
 * 添加扩展功能按钮
 * @param {Group} parent - 父容器
 * @param {Object} layer - 图层对象
 * @param {boolean} canExport - 是否可导出
 */
function addExtensionButton(parent, layer, canExport)
```

**按钮特性**:
- **图标**: `◈` (菱形符号，表示扩展功能)
- **状态**: 当前禁用，预留扩展
- **功能**: 点击显示图层详细信息对话框

#### 2.4.4 传统实现 (showConfirmDialog)

```javascript
/**
 * 显示Panel样式确认对话框
 * @param {string} title 标题
 * @param {string} message 消息内容
 * @param {Array} buttons 按钮文本数组，默认["确定", "取消"]
 * @return {number} 用户点击的按钮索引，0=第一个按钮，1=第二个按钮
 */
function showPanelConfirmDialog(title, message, buttons) {
    try {
        buttons = buttons || ["确定", "取消"];
        
        // 使用扩展名作为标题，忽略传入的title参数
        var dialog = new Window("dialog", EXTENSION_NAME);
        dialog.orientation = "column";
        dialog.alignChildren = "fill";
        dialog.spacing = 10;
        dialog.margins = 16;
        dialog.preferredSize.width = 280;
        dialog.preferredSize.height = 110;
        
        // 消息文本 - 居中对齐
        var messageText = dialog.add("statictext", undefined, message, {multiline: false});
        messageText.alignment = ["center", "center"];
        messageText.justify = "center";
        messageText.preferredSize.height = 24;
        
        // 按钮容器 - 确保按钮居中
        var buttonContainer = dialog.add("group");
        buttonContainer.orientation = "row";
        buttonContainer.alignment = ["center", "bottom"];
        buttonContainer.alignChildren = "center";
        buttonContainer.spacing = 10;
        
        var result = -1;
        
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttonContainer.add("button", undefined, buttons[i]);
            btn.preferredSize.width = 70;
            btn.preferredSize.height = 24;
            
            // 使用闭包保存索引
            (function(index) {
                btn.onClick = function() {
                    result = index;
                    dialog.close();
                };
            })(i);
            
            // 第一个按钮设为默认
            if (i === 0) {
                btn.active = true;
                dialog.defaultElement = btn;
            }
        }
        
        // 设置取消按钮（通常是最后一个）
        if (buttons.length > 1) {
            dialog.cancelElement = buttonContainer.children[buttons.length - 1];
        }
        
        dialog.center();
        dialog.show();
        
        return result;
        
    } catch (error) {
        // 如果Panel创建失败，降级到原生confirm
        return confirm(message) ? 0 : 1;
    }
}
```

#### 2.2.2 实现细节

```javascript
function showPanelConfirmDialog(title, message, buttons) {
    try {
        var buttonArray = buttons || ["确定", "取消"];
        var result = 1; // 默认为取消
        
        // 创建对话框窗口
        var dialog = new Window("dialog", title || "确认");
        dialog.orientation = "column";
        dialog.alignChildren = "center";
        dialog.spacing = 15;
        dialog.margins = 20;
        dialog.preferredSize.width = 400;
        dialog.preferredSize.height = 180;
        
        // 添加消息文本
        var messageText = dialog.add("statictext", undefined, message, {multiline: true});
        messageText.alignment = "center";
        messageText.justify = "center";
        messageText.preferredSize.width = 350;
        messageText.preferredSize.height = 80;
        
        // 创建按钮组
        var buttonGroup = dialog.add("group");
        buttonGroup.orientation = "row";
        buttonGroup.spacing = 10;
        buttonGroup.alignment = "center";
        
        // 第一个按钮（确定/继续）
        var firstButton = buttonGroup.add("button", undefined, buttonArray[0]);
        firstButton.preferredSize.width = 80;
        firstButton.preferredSize.height = 25;
        firstButton.onClick = function() {
            result = 0;
            dialog.close();
        };
        
        // 第二个按钮（取消）
        var secondButton = buttonGroup.add("button", undefined, buttonArray[1]);
        secondButton.preferredSize.width = 80;
        secondButton.preferredSize.height = 25;
        secondButton.onClick = function() {
            result = 1;
            dialog.close();
        };
        
        // 设置默认和取消按钮
        dialog.defaultElement = firstButton;
        dialog.cancelElement = secondButton;
        
        // 居中显示对话框
        dialog.center();
        dialog.show();
        
        // 存储结果到全局配置
        dialogConfig.result = {
            type: "confirm",
            buttonIndex: result,
            buttonText: buttonArray[result],
            confirmed: result === 0
        };
        
        return result;
        
    } catch(error) {
        // 降级处理：使用原生confirm
        var fallbackResult = confirm((title || "确认") + "\n\n" + message);
        return fallbackResult ? 0 : 1;
    }
}
```

### 2.3 Panel样式警告对话框

```javascript
/**
 * 显示Panel样式警告对话框（单按钮）
 * @param {string} title 标题
 * @param {string} message 消息内容
 */
function showPanelWarningDialog(title, message) {
    try {
        var dialog = new Window("dialog", title || "警告");
        dialog.orientation = "column";
        dialog.alignChildren = "center";
        dialog.spacing = 15;
        dialog.margins = 20;
        dialog.preferredSize.width = 350;
        dialog.preferredSize.height = 150;
        
        // 消息文本
        var messageText = dialog.add("statictext", undefined, message, {multiline: true});
        messageText.alignment = "center";
        messageText.justify = "center";
        messageText.preferredSize.width = 300;
        messageText.preferredSize.height = 60;
        
        // 确定按钮
        var okButton = dialog.add("button", undefined, "确定");
        okButton.preferredSize.width = 80;
        okButton.preferredSize.height = 25;
        okButton.alignment = "center";
        okButton.onClick = function() {
            dialog.close();
        };
        
        dialog.defaultElement = okButton;
        dialog.center();
        dialog.show();
        
    } catch(error) {
        alert((title || "警告") + "\n\n" + message);
    }
}
```

## 3. CEP扩展端调用

### 3.1 showImportConfirmDialog 函数实现

```javascript
/**
 * 显示导入确认对话框
 * @param {string} title 对话框标题
 * @param {string} message 消息内容
 * @param {string} button1Text 第一个按钮文本
 * @param {string} button2Text 第二个按钮文本
 * @returns {Promise<number>} 0表示确认，1表示取消
 */
function showImportConfirmDialog(title, message, button1Text = '继续导入', button2Text = '取消') {
    return new Promise((resolve, reject) => {
        try {
            // 字符串转义处理
            const escapedTitle = escapeForExtendScript(title);
            const escapedMessage = escapeForExtendScript(message);
            const escapedButton1 = escapeForExtendScript(button1Text);
            const escapedButton2 = escapeForExtendScript(button2Text);
            
            // 构造ExtendScript调用
            const script = `showPanelConfirmDialog("${escapedTitle}", "${escapedMessage}", "${escapedButton1}", "${escapedButton2}");`;
            
            // 执行ExtendScript
            csInterface.evalScript(script, (result) => {
                try {
                    const buttonIndex = parseInt(result);
                    if (isNaN(buttonIndex)) {
                        console.warn('[对话框] ExtendScript返回值无效:', result);
                        resolve(1); // 默认返回取消
                    } else {
                        resolve(buttonIndex);
                    }
                } catch (parseError) {
                    console.error('[对话框] 解析ExtendScript结果失败:', parseError);
                    resolve(1);
                }
            });
            
        } catch (error) {
            console.error('[对话框] 调用失败:', error);
            reject(error);
        }
    });
}

/**
 * ExtendScript字符串转义函数
 * @param {string} str 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
function escapeForExtendScript(str) {
    if (typeof str !== 'string') {
        return String(str || '');
    }
    
    return str
        .replace(/\\/g, '\\\\')  // 反斜杠
        .replace(/"/g, '\\"')     // 双引号
        .replace(/'/g, "\\'"')     // 单引号
        .replace(/\n/g, '\\n')     // 换行符
        .replace(/\r/g, '\\r')     // 回车符
        .replace(/\t/g, '\\t');    // 制表符
}

// 使用示例
async function handleFileImport() {
    try {
        const result = await showImportConfirmDialog(
            '确认导入',
            '检测到当前合成为空，是否继续导入文件？\n\n导入的文件将直接添加到项目面板中。',
            '继续导入',
            '取消'
        );
        
        if (result === 0) {
            console.log('[导入] 用户确认继续导入');
            // 执行导入逻辑
        } else {
            console.log('[导入] 用户取消导入');
        }
    } catch (error) {
        console.error('[导入] 对话框显示失败:', error);
    }
}

if (buttonIndex === 0) {
    console.log('用户选择继续');
} else {
    console.log('用户选择取消');
}
```

### 3.2 异步调用方式

```javascript
// 异步调用对话框
function showConfirmDialogAsync(title, message, buttons) {
    return new Promise((resolve, reject) => {
        const escapedTitle = title.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        
        const script = `showPanelConfirmDialog("${escapedTitle}", "${escapedMessage}", ["${buttons[0]}", "${buttons[1]}"])`;;
        
        csInterface.evalScript(script, (result) => {
            const buttonIndex = parseInt(result);
            resolve({
                buttonIndex: buttonIndex,
                confirmed: buttonIndex === 0,
                buttonText: buttons[buttonIndex]
            });
        });
    });
}

// 使用示例
async function handleUserConfirmation() {
    try {
        const result = await showConfirmDialogAsync(
            "导入确认", 
            "是否继续导入文件？", 
            ["继续导入", "取消"]
        );
        
        if (result.confirmed) {
            console.log('用户确认导入');
            // 执行导入操作
        } else {
            console.log('用户取消导入');
        }
    } catch (error) {
        console.error('对话框显示失败:', error);
    }
}
```

## 4. 字符串转义处理

### 4.1 转义的必要性

由于需要将JavaScript字符串传递给ExtendScript执行，必须对特殊字符进行转义以避免语法错误。

### 4.2 转义规则

```javascript
/**
 * 转义字符串中的特殊字符
 * @param {string} str 原始字符串
 * @returns {string} 转义后的字符串
 */
function escapeStringForExtendScript(str) {
    return str
        .replace(/\\/g, '\\\\')  // 反斜杠
        .replace(/"/g, '\\"')     // 双引号
        .replace(/'/g, "\\'')     // 单引号
        .replace(/\n/g, '\\n')    // 换行符
        .replace(/\r/g, '\\r')    // 回车符
        .replace(/\t/g, '\\t');   // 制表符
}
```

### 4.3 使用示例

```javascript
// 包含特殊字符的消息
const message = `文件路径: "C:\\Users\\Name\\Documents"
是否继续？`;

// 转义处理
const escapedMessage = escapeStringForExtendScript(message);

// 安全地传递给ExtendScript
const script = `showPanelConfirmDialog("提示", "${escapedMessage}", ["是", "否"]);`;
```

## 5. 错误处理和降级策略

### 5.1 降级机制

当Panel样式对话框创建失败时，系统会自动降级到原生对话框：

```javascript
try {
    // 尝试创建Panel样式对话框
    var dialog = new Window("dialog", title);
    // ... 对话框创建逻辑
} catch(error) {
    // 降级到原生confirm
    var fallbackResult = confirm((title || "确认") + "\n\n" + message);
    return fallbackResult ? 0 : 1;
}
```

### 5.2 错误日志记录

```javascript
// 在CEP扩展端记录错误
function logDialogError(error, context) {
    console.error(`[对话框系统] ${context}:`, error);
    
    // 可选：发送错误报告到日志服务
    if (window.errorReporter) {
        window.errorReporter.report({
            component: 'DialogSystem',
            error: error.message,
            context: context,
            timestamp: new Date().toISOString()
        });
    }
}
```

## 6. 最佳实践

### 6.1 对话框设计原则

1. **标题统一**: 所有对话框使用 `EXTENSION_NAME` 变量作为标题，确保品牌一致性
2. **消息简洁**: 消息文本使用简洁的单行文本，避免多行换行影响布局
3. **布局统一**: 所有对话框使用相同的尺寸(280x110)和间距(spacing:10, margins:16)
4. **文本居中**: 消息文本设置为居中对齐，提升视觉效果
5. **按钮规范**: 按钮使用统一尺寸(70x24)并居中排列
6. **响应式设计**: 使用 `alignChildren: "fill"` 确保内容填充容器宽度
7. **键盘支持**: 支持Enter和Esc键操作
8. **错误降级**: 当Panel创建失败时，自动降级到原生对话框

### 6.2 用户体验优化

#### 6.2.1 消息文本优化

```javascript
// 标准化的消息文本 - 简洁单行显示
const STANDARD_MESSAGES = {
    NO_PROJECT: "请先打开项目后操作",
    NO_COMPOSITION: "请选择合成后操作", 
    NO_COMPOSITION_CREATE: "请先创建一个合成后重试",
    CONNECTION_ERROR: "请确保After Effects正在运行并重试"
};

// 推荐：简洁明了的单行文本
showPanelWarningDialog("", "请先创建一个合成后重试");
showPanelWarningDialog("", "请确保After Effects正在运行并重试");

// 不推荐：多行文本影响布局
// showPanelWarningDialog("", "项目中没有找到任何合成。\n请先创建一个合成，然后重试。");
// showPanelWarningDialog("", "无法检查After Effects项目状态。\n请确保After Effects正在运行并重试。");

// 使用示例
showPanelWarningDialog("", STANDARD_MESSAGES.NO_PROJECT);
```

#### 6.2.2 按钮文本优化

```javascript
// 根据操作类型使用不同的按钮文本
function getButtonTextByAction(actionType) {
    const buttonTexts = {
        'import': ['继续导入', '取消'],
        'delete': ['确认删除', '取消'],
        'save': ['保存', '不保存'],
        'export': ['导出', '取消']
    };
    
    return buttonTexts[actionType] || ['确定', '取消'];
}

// 推荐：动作明确，使用统一尺寸
showPanelConfirmDialog("", "确定要删除这个文件吗？", ["删除", "取消"]);

// 不推荐：含糊不清
// showPanelConfirmDialog("", "确定要删除这个文件吗？", ["是", "否"]);

// 使用示例 - 注意标题会被扩展名覆盖
const buttons = getButtonTextByAction('import');
showPanelConfirmDialog('', '是否继续导入？', buttons);
```

#### 6.2.3 布局优化特性

```javascript
// 推荐：使用优化后的统一布局参数
var dialog = new Window("dialog", EXTENSION_NAME);
dialog.orientation = "column";
dialog.alignChildren = "fill";  // 填充容器宽度
dialog.spacing = 10;            // 统一间距
dialog.margins = 16;            // 统一边距
dialog.preferredSize.width = 280;   // 统一宽度
dialog.preferredSize.height = 110;  // 统一高度

// 消息文本居中对齐
var messageText = dialog.add("statictext", undefined, message, {multiline: false});
messageText.alignment = ["center", "center"];
messageText.justify = "center";
messageText.preferredSize.height = 24;

// 按钮容器确保居中
var buttonContainer = dialog.add("group");
buttonContainer.orientation = "row";
buttonContainer.alignment = ["center", "bottom"];
buttonContainer.alignChildren = "center";
buttonContainer.spacing = 10;

// 按钮尺寸统一设置
var btn = buttonContainer.add("button", undefined, buttonText);
btn.preferredSize.width = 70;
btn.preferredSize.height = 24;
```

**布局优化要点**:
- **统一尺寸**: 对话框宽度280px，高度110px，保持紧凑
- **居中对齐**: 文本和按钮都采用居中对齐，视觉统一
- **合理间距**: 元素间距10px，边距16px，提供良好的视觉呼吸感
- **按钮规格**: 按钮宽度70px，高度24px，确保点击区域适中

### 6.3 国际化支持

```javascript
// 多语言支持
const dialogTexts = {
    'zh-CN': {
        confirm: '确认',
        cancel: '取消',
        continue: '继续',
        warning: '警告',
        error: '错误'
    },
    'en-US': {
        confirm: 'Confirm',
        cancel: 'Cancel',
        continue: 'Continue',
        warning: 'Warning',
        error: 'Error'
    }
};

function getLocalizedText(key, locale = 'zh-CN') {
    return dialogTexts[locale]?.[key] || dialogTexts['zh-CN'][key];
}
```

## 7. 性能优化

### 7.1 对话框缓存

```javascript
// 缓存常用对话框配置
const dialogCache = new Map();

function getCachedDialog(key, factory) {
    if (!dialogCache.has(key)) {
        dialogCache.set(key, factory());
    }
    return dialogCache.get(key);
}
```

### 7.2 延迟加载

```javascript
// 延迟加载对话框脚本
let dialogScriptLoaded = false;

function ensureDialogScriptLoaded() {
    if (!dialogScriptLoaded) {
        csInterface.evalScript('$.evalFile("' + extensionPath + '/jsx/dialog-warning.jsx")');
        dialogScriptLoaded = true;
    }
}
```

## 8. 测试指南

### 8.1 功能测试

1. **基本显示测试**: 验证对话框能正确显示
2. **按钮功能测试**: 验证各按钮的点击响应
3. **键盘操作测试**: 验证Enter和Esc键的功能
4. **多行文本测试**: 验证长文本的显示效果

### 8.2 边界测试

1. **特殊字符测试**: 测试包含引号、换行符等特殊字符的文本
2. **长文本测试**: 测试超长标题和消息的处理
3. **空值测试**: 测试空标题或空消息的处理
4. **错误场景测试**: 测试对话框创建失败时的降级处理

### 8.3 性能测试

1. **响应速度测试**: 测试对话框显示的响应时间
2. **内存使用测试**: 测试频繁显示对话框的内存占用
3. **并发测试**: 测试同时显示多个对话框的处理

## 9. 故障排除

### 9.1 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 对话框不显示 | ExtendScript脚本错误 | 检查字符串转义和语法 |
| 按钮无响应 | 事件处理函数错误 | 检查onClick函数实现 |
| 文本显示异常 | 特殊字符未转义 | 使用转义函数处理文本 |
| 样式不正确 | 窗口属性设置错误 | 检查窗口和控件属性 |

### 9.2 调试技巧

```javascript
// 启用调试模式
const DEBUG_DIALOG = true;

function debugLog(message, data) {
    if (DEBUG_DIALOG) {
        console.log(`[对话框调试] ${message}`, data);
    }
}

// 在对话框调用前后添加调试信息
debugLog('准备显示对话框', { title, message, buttons });
const result = csInterface.evalScript(script);
debugLog('对话框结果', { result, buttonIndex: parseInt(result) });
```

## 1. Eagle2Ae 对话框系统

## 1. 系统概述

Eagle2Ae 采用混合对话框架构，结合了 HTML/CSS 模态对话框和 JSX 原生对话框的优势，为用户提供一致的交互体验。

### 1.1 架构特点

- **双重架构**: HTML/CSS模态对话框 + JSX原生对话框
- **环境适配**: 自动检测CEP环境和Demo模式
- **统一接口**: 提供统一的调用接口，屏蔽底层实现差异
- **智能降级**: 当一种方式失败时，自动切换到备用方案

### 1.2 项目状态检测集成

对话框系统与项目状态检测深度集成，提供智能化的用户交互：

- **预检查机制**: 在显示对话框前进行项目状态检测
- **分层错误提示**: 根据错误类型显示不同的对话框
- **智能错误处理**: 自动选择最合适的对话框类型
- **演示模式支持**: Demo模式下使用虚拟对话框系统

### 1.3 弹窗优化功能

#### 智能项目状态检测
- **双重连接检测**: 同时检测AE连接和Eagle连接状态
- **分层错误提示**: 根据错误类型显示不同级别的提示
- **统一错误处理**: 标准化的错误处理流程

#### 演示模式支持
- **虚拟弹窗系统**: Demo模式下使用JavaScript模拟原生弹窗
- **样式一致性**: 确保Demo模式与CEP模式视觉效果一致
- **功能完整性**: Demo模式支持所有弹窗功能

#### 用户体验优化
- **响应速度**: 优化弹窗显示速度，减少等待时间
- **视觉统一**: 统一的弹窗样式和布局
- **操作便捷**: 支持键盘快捷键和鼠标操作

### 2. 项目状态检测与对话框集成

### 2.1 检测流程

```javascript
/**
 * 项目状态检测与对话框显示流程
 */
async function checkProjectStatusAndShowDialog(actionType) {
    try {
        // 1. 执行项目状态检测
        const statusResult = await ProjectStatusChecker.checkProjectStatus();
        
        // 2. 根据检测结果决定对话框类型
        if (statusResult.hasErrors) {
            // 显示错误对话框
            await showStatusErrorDialog(statusResult);
            return false;
        }
        
        // 3. 显示确认对话框
        const confirmed = await showActionConfirmDialog(actionType);
        return confirmed;
        
    } catch (error) {
        // 4. 显示系统错误对话框
        await showSystemErrorDialog(error);
        return false;
    }
}
```

### 2.2 错误类型与对话框映射

```javascript
/**
 * 错误类型定义
 */
const ERROR_TYPES = {
    NO_PROJECT: 'no_project',           // 无项目
    NO_COMPOSITION: 'no_composition',   // 无合成
    CONNECTION_ERROR: 'connection_error', // 连接错误
    EAGLE_OFFLINE: 'eagle_offline',     // Eagle离线
    SYSTEM_ERROR: 'system_error'        // 系统错误
};

/**
 * 错误对话框映射
 */
const ERROR_DIALOG_MAP = {
    [ERROR_TYPES.NO_PROJECT]: {
        type: 'warning',
        title: '项目检查',
        message: '请先打开一个After Effects项目',
        buttons: ['确定']
    },
    [ERROR_TYPES.NO_COMPOSITION]: {
        type: 'warning', 
        title: '合成检查',
        message: '请先创建一个合成后重试',
        buttons: ['确定']
    },
    [ERROR_TYPES.CONNECTION_ERROR]: {
        type: 'error',
        title: '连接错误',
        message: '请确保After Effects正在运行并重试',
        buttons: ['重试', '取消']
    },
    [ERROR_TYPES.EAGLE_OFFLINE]: {
        type: 'warning',
        title: 'Eagle连接',
        message: '请确保Eagle应用正在运行',
        buttons: ['重试', '取消']
    }
};
```

### 2.3 智能对话框选择

```javascript
/**
 * 智能选择对话框类型
 */
function selectDialogType(errorType, context) {
    // Demo模式强制使用JavaScript对话框
    if (isDemoMode()) {
        return 'javascript';
    }
    
    // 根据错误严重程度选择
    const severityMap = {
        [ERROR_TYPES.SYSTEM_ERROR]: 'jsx',      // 系统错误用原生弹窗
        [ERROR_TYPES.CONNECTION_ERROR]: 'jsx',   // 连接错误用原生弹窗
        [ERROR_TYPES.NO_PROJECT]: 'javascript', // 项目检查用轻量弹窗
        [ERROR_TYPES.NO_COMPOSITION]: 'javascript' // 合成检查用轻量弹窗
    };
    
    return severityMap[errorType] || 'javascript';
}
```

### 2.4 演示模式虚拟弹窗系统

### 3.1 虚拟弹窗引擎

```javascript
/**
 * 虚拟弹窗引擎 - Demo模式专用
 */
class VirtualDialogEngine {
    constructor() {
        this.activeDialogs = new Map();
        this.dialogCounter = 0;
        this.initializeStyles();
    }
    
    /**
     * 显示虚拟警告对话框
     */
    async showWarningDialog(title, message, buttons = ['确定']) {
        return this.createVirtualDialog({
            type: 'warning',
            title: title || '警告',
            message,
            buttons,
            icon: '⚠️'
        });
    }
    
    /**
     * 显示虚拟确认对话框
     */
    async showConfirmDialog(title, message, buttons = ['确定', '取消']) {
        return this.createVirtualDialog({
            type: 'confirm',
            title: title || '确认',
            message,
            buttons,
            icon: '❓'
        });
    }
    
    /**
     * 创建虚拟对话框
     */
    createVirtualDialog(config) {
        return new Promise((resolve) => {
            const dialogId = `virtual-dialog-${++this.dialogCounter}`;
            
            // 创建对话框元素
            const dialog = this.buildDialogElement(dialogId, config);
            
            // 添加事件监听
            this.attachDialogEvents(dialog, config.buttons, resolve);
            
            // 显示对话框
            document.body.appendChild(dialog);
            this.activeDialogs.set(dialogId, dialog);
            
            // 添加显示动画
            requestAnimationFrame(() => {
                dialog.classList.add('show');
            });
        });
    }
    
    /**
     * 构建对话框元素
     */
    buildDialogElement(dialogId, config) {
        const dialog = document.createElement('div');
        dialog.id = dialogId;
        dialog.className = 'virtual-dialog-overlay';
        
        dialog.innerHTML = `
            <div class="virtual-dialog">
                <div class="virtual-dialog-header">
                    <span class="virtual-dialog-icon">${config.icon}</span>
                    <span class="virtual-dialog-title">${config.title}</span>
                </div>
                <div class="virtual-dialog-content">
                    <p class="virtual-dialog-message">${config.message}</p>
                </div>
                <div class="virtual-dialog-footer">
                    ${config.buttons.map((btn, index) => 
                        `<button class="virtual-dialog-btn" data-index="${index}">${btn}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        return dialog;
    }
    
    /**
     * 初始化样式
     */
    initializeStyles() {
        if (document.getElementById('virtual-dialog-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'virtual-dialog-styles';
        styles.textContent = `
            .virtual-dialog-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            
            .virtual-dialog-overlay.show {
                opacity: 1;
            }
            
            .virtual-dialog {
                background-color: #2b2b2b;
                border: 1px solid #555555;
                border-radius: 4px;
                min-width: 280px;
                max-width: 400px;
                color: #cccccc;
                font-family: 'Segoe UI', sans-serif;
                font-size: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                transform: scale(0.9);
                transition: transform 0.2s ease;
            }
            
            .virtual-dialog-overlay.show .virtual-dialog {
                transform: scale(1);
            }
            
            .virtual-dialog-header {
                background-color: #1e1e1e;
                padding: 8px 12px;
                border-bottom: 1px solid #555555;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .virtual-dialog-icon {
                font-size: 16px;
            }
            
            .virtual-dialog-title {
                color: #ffffff;
                font-weight: 500;
            }
            
            .virtual-dialog-content {
                padding: 16px;
            }
            
            .virtual-dialog-message {
                margin: 0;
                line-height: 1.4;
                color: #cccccc;
            }
            
            .virtual-dialog-footer {
                background-color: #1e1e1e;
                padding: 8px 12px;
                border-top: 1px solid #555555;
                display: flex;
                justify-content: center;
                gap: 8px;
            }
            
            .virtual-dialog-btn {
                background-color: #404040;
                border: 1px solid #666666;
                color: #cccccc;
                padding: 4px 12px;
                border-radius: 2px;
                cursor: pointer;
                font-size: 11px;
                min-width: 60px;
                transition: background-color 0.2s ease;
            }
            
            .virtual-dialog-btn:hover {
                background-color: #505050;
            }
            
            .virtual-dialog-btn:active {
                background-color: #353535;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// 全局虚拟弹窗引擎实例
const virtualDialogEngine = new VirtualDialogEngine();
```

### 3.2 Demo模式检测与切换

```javascript
/**
 * Demo模式检测
 */
function isDemoMode() {
    // 检测是否在CEP环境中
    if (typeof CSInterface === 'undefined' || !window.cep) {
        return true;
    }
    
    // 检测是否有ExtendScript连接
    try {
        const testResult = csInterface.evalScript('1+1');
        return testResult === 'EvalScript error.';
    } catch (error) {
        return true;
    }
}

/**
 * 智能对话框调用
 */
async function showSmartDialog(type, title, message, buttons) {
    if (isDemoMode()) {
        // Demo模式：使用虚拟弹窗
        console.log('[Demo模式] 使用虚拟弹窗系统');
        
        if (type === 'warning') {
            return await virtualDialogEngine.showWarningDialog(title, message, buttons);
        } else if (type === 'confirm') {
            return await virtualDialogEngine.showConfirmDialog(title, message, buttons);
        }
    } else {
        // CEP模式：使用ExtendScript弹窗
        console.log('[CEP模式] 使用ExtendScript弹窗');
        
        if (type === 'warning') {
            return await showPanelWarningDialog(title, message);
        } else if (type === 'confirm') {
            return await showPanelConfirmDialog(title, message, buttons);
        }
    }
}
```

### 4. 性能优化与安全机制

### 4.1 弹窗性能优化

```javascript
/**
 * 弹窗缓存管理
 */
class DialogCache {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 10;
    }
    
    /**
     * 缓存弹窗配置
     */
    cacheDialog(key, config) {
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            config,
            timestamp: Date.now()
        });
    }
    
    /**
     * 获取缓存的弹窗配置
     */
    getCachedDialog(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < 300000) { // 5分钟有效期
            return cached.config;
        }
        return null;
    }
}

const dialogCache = new DialogCache();
```

### 4.2 内存管理

```javascript
/**
 * 弹窗内存管理
 */
class DialogMemoryManager {
    constructor() {
        this.activeDialogs = new Set();
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000); // 每分钟清理一次
    }
    
    /**
     * 注册活动弹窗
     */
    registerDialog(dialogElement) {
        this.activeDialogs.add(dialogElement);
    }
    
    /**
     * 注销弹窗
     */
    unregisterDialog(dialogElement) {
        this.activeDialogs.delete(dialogElement);
        
        // 清理DOM元素
        if (dialogElement.parentNode) {
            dialogElement.parentNode.removeChild(dialogElement);
        }
    }
    
    /**
     * 清理无效弹窗
     */
    cleanup() {
        this.activeDialogs.forEach(dialog => {
            if (!document.contains(dialog)) {
                this.activeDialogs.delete(dialog);
            }
        });
    }
    
    /**
     * 销毁管理器
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.activeDialogs.forEach(dialog => {
            this.unregisterDialog(dialog);
        });
    }
}

const dialogMemoryManager = new DialogMemoryManager();
```

### 4.3 安全机制

```javascript
/**
 * 弹窗安全验证
 */
class DialogSecurity {
    /**
     * 验证弹窗内容安全性
     */
    static validateContent(title, message) {
        // 防止XSS攻击
        const sanitizedTitle = this.sanitizeHTML(title);
        const sanitizedMessage = this.sanitizeHTML(message);
        
        // 长度限制
        if (sanitizedTitle.length > 100) {
            throw new Error('弹窗标题过长');
        }
        
        if (sanitizedMessage.length > 500) {
            throw new Error('弹窗消息过长');
        }
        
        return {
            title: sanitizedTitle,
            message: sanitizedMessage
        };
    }
    
    /**
     * HTML内容清理
     */
    static sanitizeHTML(input) {
        if (typeof input !== 'string') {
            return String(input);
        }
        
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
    
    /**
     * 验证按钮配置
     */
    static validateButtons(buttons) {
        if (!Array.isArray(buttons)) {
            return ['确定'];
        }
        
        if (buttons.length === 0) {
            return ['确定'];
        }
        
        if (buttons.length > 3) {
            return buttons.slice(0, 3);
        }
        
        return buttons.map(btn => this.sanitizeHTML(btn));
    }
}
```