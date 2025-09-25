// AE原生弹窗系统
// 支持警告、错误、选择等多种对话框类型
// 可通过变量配置内容和获取用户选择结果

// 扩展名变量
var EXTENSION_NAME = "@Eagle2Ae";

// 全局变量，用于存储对话框配置
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

/**
 * 显示警告对话框
 * @param {string} title 标题
 * @param {string} message 消息内容
 * @param {Array} buttons 按钮文本数组，默认["确定"]
 * @return {number} 用户点击的按钮索引
 */
function showWarningDialog(title, message, buttons) {
    try {
        var buttonArray = buttons || ["确定"];
        var buttonText = buttonArray.join("\n");
        
        var result = alert(title + "\n\n" + message + "\n\n" + buttonText, true);
        
        // 存储结果
        dialogConfig.result = {
            type: "warning",
            buttonIndex: result ? 0 : 1,
            buttonText: result ? buttonArray[0] : (buttonArray[1] || "取消")
        };
        
        return result ? 0 : 1;
    } catch (error) {
        return -1;
    }
}

/**
 * 显示确认对话框
 * @param {string} title 标题
 * @param {string} message 消息内容
 * @param {Array} buttons 按钮文本数组，默认["确定", "取消"]
 * @return {number} 用户点击的按钮索引，0=确定，1=取消
 */
function showConfirmDialog(title, message, buttons) {
    try {
        var buttonArray = buttons || ["确定", "取消"];
        
        var result = confirm(title + "\n\n" + message);
        
        // 存储结果
        dialogConfig.result = {
            type: "confirm",
            buttonIndex: result ? 0 : 1,
            buttonText: result ? buttonArray[0] : buttonArray[1],
            confirmed: result
        };
        
        return result ? 0 : 1;
    } catch (error) {
        return -1;
    }
}

/**
 * 显示合成选择对话框（使用Panel样式）
 * @param {string} title 标题
 * @param {string} message 消息内容
 * @return {Object} 包含用户选择结果的对象
 */
function showCompositionSelectDialog(title, message) {
    try {
        // 获取所有合成
        var compositions = [];
        var compNames = [];
        
        if (app.project) {
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof CompItem) {
                    compositions.push(item);
                    compNames.push(item.name);
                }
            }
        }
        
        if (compositions.length === 0) {
            // 没有合成，显示警告
            showPanelWarningDialog("没有可用合成", "请先创建一个合成后重试");
            
            dialogConfig.result = {
                type: "composition_select",
                success: false,
                selectedComp: null,
                message: "没有可用合成"
            };
            
            return dialogConfig.result;
        }
        
        // 使用Panel样式的合成选择对话框
        var selectedIndex = showPanelCompositionSelectDialog(title, message, compositions);
        
        if (selectedIndex === -1) {
            // 用户取消
            dialogConfig.result = {
                type: "composition_select",
                success: false,
                selectedComp: null,
                message: "用户取消选择"
            };
            
            return dialogConfig.result;
        }
        
        if (selectedIndex >= 0 && selectedIndex < compositions.length) {
            // 有效选择
            var selectedComp = compositions[selectedIndex];
            
            dialogConfig.result = {
                type: "composition_select",
                success: true,
                selectedComp: {
                    name: selectedComp.name,
                    id: selectedComp.id,
                    width: selectedComp.width,
                    height: selectedComp.height,
                    duration: selectedComp.duration,
                    frameRate: selectedComp.frameRate,
                    item: selectedComp
                },
                selectedIndex: selectedIndex,
                message: "已选择合成: " + selectedComp.name
            };
            
            // 设置为活动合成
            app.project.activeItem = selectedComp;
            
            return dialogConfig.result;
        } else {
            // 无效选择
            dialogConfig.result = {
                type: "composition_select",
                success: false,
                selectedComp: null,
                message: "无效的合成选择"
            };
            
            return dialogConfig.result;
        }
        
    } catch (error) {
        dialogConfig.result = {
            type: "composition_select",
            success: false,
            selectedComp: null,
            message: "对话框错误: " + error.toString()
        };
        
        return dialogConfig.result;
    }
}

/**
 * 显示错误对话框
 * @param {string} title 标题
 * @param {string} message 错误消息
 * @param {string} details 详细错误信息（可选）
 */
function showErrorDialog(title, message, details) {
    try {
        var fullMessage = message;
        if (details) {
            fullMessage += "\n\n详细信息：\n" + details;
        }
        
        alert(title + "\n\n" + fullMessage);
        
        dialogConfig.result = {
            type: "error",
            message: message,
            details: details || ""
        };
        
    } catch (error) {
        // 静默处理错误
    }
}

/**
 * 显示信息对话框
 * @param {string} title 标题
 * @param {string} message 信息内容
 */
function showInfoDialog(title, message) {
    try {
        alert(title + "\n\n" + message);
        
        dialogConfig.result = {
            type: "info",
            message: message
        };
        
    } catch (error) {
        // 静默处理错误
    }
}

/**
 * 获取最后一次对话框的结果
 * @return {Object} 对话框结果对象
 */
function getLastDialogResult() {
    return dialogConfig.result;
}

/**
 * 清除对话框结果
 */
function clearDialogResult() {
    dialogConfig.result = null;
}

/**
 * 显示Panel样式的警告对话框
 * @param {string} title 标题
 * @param {string} message 消息内容
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
        
        // 设置默认按钮
        dialog.defaultElement = okButton;
        
        // 居中显示对话框
        dialog.center();
        dialog.show();
        
    } catch(error) {
        // 如果创建对话框失败，使用简单的alert作为备选
        alert(EXTENSION_NAME + "\n\n" + message);
    }
}

/**
 * 显示Panel样式确认对话框
 * @param {string} title 标题
 * @param {string} message 消息内容
 * @param {Array} buttons 按钮文本数组，默认["确定", "取消"]
 * @return {number} 用户点击的按钮索引，0=第一个按钮，1=第二个按钮
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
        
        // 设置默认和取消按钮
        dialog.defaultElement = firstButton;
        dialog.cancelElement = secondButton;
        
        // 居中显示对话框
        dialog.center();
        dialog.show();
        
        // 存储结果
        dialogConfig.result = {
            type: "confirm",
            buttonIndex: result,
            buttonText: buttonArray[result],
            confirmed: result === 0
        };
        
        return result;
        
    } catch(error) {
        // 如果创建对话框失败，使用简单的confirm作为备选
        var fallbackResult = confirm((title || "确认") + "\n\n" + message);
        return fallbackResult ? 0 : 1;
    }
}

// 移除复杂的合成选择对话框，已简化为直接检查活动合成

/**
 * 设置对话框配置
 * @param {Object} config 配置对象
 */
function setDialogConfig(config) {
    if (config.title !== undefined) dialogConfig.title = config.title;
    if (config.message !== undefined) dialogConfig.message = config.message;
    if (config.type !== undefined) dialogConfig.type = config.type;
    if (config.buttons !== undefined) dialogConfig.buttons = config.buttons;
    if (config.defaultButton !== undefined) dialogConfig.defaultButton = config.defaultButton;
    if (config.cancelButton !== undefined) dialogConfig.cancelButton = config.cancelButton;
    if (config.options !== undefined) dialogConfig.options = config.options;
}

/**
 * 获取当前对话框配置
 * @return {Object} 配置对象
 */
function getDialogConfig() {
    return dialogConfig;
}

/**
 * 通用对话框函数，根据配置显示不同类型的对话框
 * @param {Object} config 对话框配置
 * @return {Object} 对话框结果
 */
function showDialog(config) {
    try {
        // 更新配置
        setDialogConfig(config);
        
        switch (dialogConfig.type) {
            case "warning":
                showWarningDialog(dialogConfig.title, dialogConfig.message, dialogConfig.buttons);
                break;
            case "error":
                showErrorDialog(dialogConfig.title, dialogConfig.message);
                break;
            case "info":
                showInfoDialog(dialogConfig.title, dialogConfig.message);
                break;
            case "confirm":
                showConfirmDialog(dialogConfig.title, dialogConfig.message, dialogConfig.buttons);
                break;
            case "composition_select":
                showCompositionSelectDialog(dialogConfig.title, dialogConfig.message);
                break;
            default:
                showInfoDialog(dialogConfig.title, dialogConfig.message);
                break;
        }
        
        return getLastDialogResult();
        
    } catch (error) {
        return {
            type: "error",
            success: false,
            message: "对话框系统错误: " + error.toString()
        };
    }
}
