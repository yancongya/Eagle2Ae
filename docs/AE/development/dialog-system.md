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

### 2.4 图层详情对话框系统

#### 2.4.1 图层检测总结对话框 (showDetectionSummaryDialog)

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

## 10. 图层检测总结弹窗系统

### 10.1 双弹窗架构实现

#### JSX弹窗实现 (dialog-summary.jsx)
```javascript
/**
 * 显示图层检测总结弹窗（CEP环境）
 * @param {Object} summaryData 检测结果数据
 */
function showLayerDetectionSummary(summaryData) {
    try {
        var dialog = new Window("dialog", "@Eagle2Ae");
        dialog.orientation = "column";
        dialog.alignChildren = "fill";
        dialog.spacing = 10;
        dialog.margins = 16;
        dialog.preferredSize.width = 400;
        dialog.preferredSize.height = 300;
        
        // 添加总结信息
        var summaryGroup = dialog.add("group");
        summaryGroup.orientation = "column";
        summaryGroup.alignChildren = "left";
        
        // 三行总结信息
        summaryGroup.add("statictext", undefined, summaryData.exportableSummary);
        summaryGroup.add("statictext", undefined, summaryData.nonExportableSummary);
        summaryGroup.add("statictext", undefined, summaryData.totalSummary);
        
        // 添加图层详情
        var detailsGroup = dialog.add("group");
        detailsGroup.orientation = "column";
        detailsGroup.alignChildren = "fill";
        
        var detailsTitle = detailsGroup.add("statictext", undefined, "图层详情");
        
        // 图层列表（滚动面板）
        var layersList = detailsGroup.add("listbox");
        layersList.preferredSize.height = 150;
        
        // 添加图层信息
        for (var i = 0; i < summaryData.layers.length; i++) {
            var layer = summaryData.layers[i];
            var listItem = layersList.add("item", layer.displayText);
        }
        
        // 按钮组
        var buttonGroup = dialog.add("group");
        buttonGroup.orientation = "row";
        buttonGroup.alignment = "center";
        
        var confirmBtn = buttonGroup.add("button", undefined, "确定");
        var cancelBtn = buttonGroup.add("button", undefined, "关闭");
        
        confirmBtn.onClick = function() { dialog.close(); };
        cancelBtn.onClick = function() { dialog.close(); };
        
        dialog.defaultElement = confirmBtn;
        dialog.cancelElement = cancelBtn;
        
        dialog.center();
        dialog.show();
        
    } catch (error) {
        alert("显示检测结果失败: " + error.message);
    }
}
```

#### JavaScript弹窗实现 (Demo模式)
```javascript
/**
 * 显示图层检测总结弹窗（Demo模式）
 * @param {Object} summaryData 检测结果数据
 */
function showDetectionSummaryDialog(summaryData) {
    // Demo模式检测
    if (isDemoMode()) {
        console.log('[Demo模式] 使用JavaScript弹窗');
        showJavaScriptSummaryDialog(summaryData);
        return;
    }
    
    // CEP模式：调用ExtendScript
    const script = `showLayerDetectionSummary(${JSON.stringify(summaryData)});`;
    csInterface.evalScript(script, handleDialogResult);
}

function showJavaScriptSummaryDialog(summaryData) {
    // 创建弹窗容器
    const dialog = document.createElement('div');
    dialog.className = 'detection-summary-dialog';
    dialog.innerHTML = `
        <div class="dialog-header">
            <span class="dialog-title">@Eagle2Ae（模拟）</span>
            <button class="dialog-close">×</button>
        </div>
        
        <div class="dialog-content">
            <div class="summary-section">
                <div class="summary-line">${summaryData.exportableSummary}</div>
                <div class="summary-line">${summaryData.nonExportableSummary}</div>
                <div class="summary-line">${summaryData.totalSummary}</div>
            </div>
            
            <div class="separator"></div>
            
            <div class="layers-section">
                <h4>图层详情</h4>
                <div class="layers-list">
                    ${generateLayerListHTML(summaryData.layers)}
                </div>
            </div>
        </div>
        
        <div class="dialog-footer">
            <button class="btn-confirm">确定</button>
            <button class="btn-cancel">关闭</button>
        </div>
    `;
    
    // 添加样式
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        max-height: 500px;
        background-color: #2b2b2b;
        border: 1px solid #555555;
        border-radius: 4px;
        color: #cccccc;
        font-family: 'Segoe UI', sans-serif;
        font-size: 12px;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    // 添加事件监听
    setupDialogEvents(dialog);
    
    // 显示弹窗
    document.body.appendChild(dialog);
}
```

### 10.2 样式一致性保证

#### CSS样式定义
```css
/* Demo模式弹窗样式 - 完全模拟CEP环境 */
.detection-summary-dialog {
    background-color: #2b2b2b;          /* 主背景色 */
    border: 1px solid #555555;          /* 边框颜色 */
    color: #cccccc;                     /* 主文字颜色 */
    font-family: 'Segoe UI', sans-serif; /* 字体 */
    font-size: 12px;                    /* 字体大小 */
}

.dialog-header {
    background-color: #1e1e1e;          /* 头部背景 */
    color: #ffffff;                     /* 头部文字 */
    padding: 8px 12px;                  /* 内边距 */
    border-bottom: 1px solid #555555;   /* 底部边框 */
}

.dialog-content {
    padding: 12px;                      /* 内容区域内边距 */
    max-height: 300px;                  /* 最大高度 */
    overflow-y: auto;                   /* 垂直滚动 */
}

.summary-section .summary-line {
    margin-bottom: 4px;                 /* 行间距 */
    font-family: monospace;             /* 等宽字体 */
}

.separator {
    height: 1px;
    background-color: #555555;
    margin: 12px 0;
}

.layers-section h4 {
    margin: 0 0 8px 0;
    color: #ffffff;
    font-size: 13px;
}

.layers-list {
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid #555555;
    background-color: #1e1e1e;
    padding: 4px;
}

.layer-item {
    padding: 2px 4px;
    margin-bottom: 1px;
    font-family: monospace;
    font-size: 11px;
}

.dialog-footer {
    background-color: #1e1e1e;          /* 底部背景 */
    padding: 8px 12px;                  /* 内边距 */
    text-align: center;                 /* 按钮居中 */
    border-top: 1px solid #555555;      /* 顶部边框 */
}

.dialog-footer button {
    background-color: #404040;
    border: 1px solid #666666;
    color: #cccccc;
    padding: 4px 12px;
    margin: 0 4px;
    cursor: pointer;
    border-radius: 2px;
}

.dialog-footer button:hover {
    background-color: #505050;
}
```

### 10.3 数据格式标准化

#### 检测结果数据结构
```javascript
// 标准化的检测结果数据格式
const summaryData = {
    // 总结信息
    exportableSummary: "14:28:05 可导出: 无",
    nonExportableSummary: "14:28:05 不可导出: 视频×6",
    totalSummary: "14:28:05 总结: 共检测 6 个图层，0 个可导出，6 个不可导出",
    
    // 详细图层信息
    layers: [
        {
            name: "Snow Transitions HD 1 luma.mp4",
            type: "VideoLayer",
            exportable: false,
            reason: "视频素材，将导出第一帧",
            displayText: "[×] 【视频】 Snow Transitions HD 1 luma.mp4"
        }
        // 更多图层...
    ],
    
    // 统计信息
    stats: {
        total: 6,
        exportable: 0,
        nonExportable: 6,
        byType: {
            video: 6,
            image: 0,
            text: 0,
            solid: 0
        }
    }
};
```

## 11. 相关文件和依赖

### 11.1 核心文件

- `Eagle2Ae-Ae/jsx/dialog-warning.jsx`: ExtendScript警告对话框实现
- `Eagle2Ae-Ae/jsx/dialog-summary.jsx`: ExtendScript图层检测总结对话框
- `Eagle2Ae-Ae/js/main.js`: CEP扩展主逻辑，包含弹窗调用逻辑
- `Eagle2Ae-Ae/js/demo/demo-dialog.js`: Demo模式虚拟弹窗实现
- `Eagle2Ae-Ae/js/CSInterface.js`: Adobe CEP通信接口

### 11.2 依赖关系

```
CEP扩展 (main.js)
    ↓ 环境检测
    ├── CEP环境 → CSInterface.evalScript() → ExtendScript (dialog-*.jsx) → AE原生弹窗
    └── Demo模式 → JavaScript弹窗引擎 → HTML/CSS虚拟弹窗
```

---

**最后更新**: 2024-01-16  
**维护者**: Eagle2Ae开发团队  
**版本**: 2.2.0  
**更新内容**: 新增图层检测总结弹窗系统，实现双弹窗架构，完善Demo模式支持