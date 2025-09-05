# 对话框系统技术文档

## 概述

本文档详细描述了Eagle2Ae CEP扩展中的对话框系统实现，包括Panel样式对话框的创建、使用方法和最佳实践。

## 1. 对话框系统架构

### 1.1 系统组成

对话框系统由以下组件构成：

- **CEP扩展端 (JavaScript)**: 负责触发对话框显示和处理结果
- **ExtendScript端 (JSX)**: 负责创建和管理Panel样式对话框
- **通信机制**: 通过CSInterface在两端之间传递数据

### 1.2 文件结构

```
Eagle2Ae-Ae/
├── js/
│   └── main.js                 # CEP扩展主逻辑
└── jsx/
    └── dialog-warning.jsx      # ExtendScript对话框实现
```

## 2. ExtendScript对话框实现

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

#### 2.3.2 传统实现 (showConfirmDialog)

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

## 10. 相关文件和依赖

### 10.1 核心文件

- `Eagle2Ae-Ae/jsx/dialog-warning.jsx`: ExtendScript对话框实现
- `Eagle2Ae-Ae/js/main.js`: CEP扩展主逻辑
- `Eagle2Ae-Ae/js/CSInterface.js`: Adobe CEP通信接口

### 10.2 依赖关系

```
CEP扩展 (main.js)
    ↓ CSInterface.evalScript()
ExtendScript (dialog-warning.jsx)
    ↓ new Window()
Adobe After Effects
```

---

**最后更新**: 2024-01-16  
**维护者**: Eagle2Ae开发团队  
**版本**: 1.3.0  
**更新内容**: 添加弹窗优化方案，统一标题使用扩展名变量，优化布局和文本显示