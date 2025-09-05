# AE扩展弹窗系统文档

## 概述

本文档记录了Eagle2AE扩展中弹窗系统的实现、调用方法以及开发过程中遇到的问题和解决方案。

## 弹窗系统架构

### 文件结构
- `jsx/dialog-warning.jsx` - ExtendScript端弹窗系统实现
- `js/services/FileHandler.js` - JavaScript端弹窗调用

### 工作流程
1. JavaScript端检测到需要弹窗的情况
2. 通过CSInterface调用ExtendScript脚本
3. ExtendScript端显示原生AE弹窗
4. 返回用户操作结果

## 可用的弹窗函数

### 1. showPanelWarningDialog(title, message)
**用途**: 显示警告信息弹窗  
**参数**:
- `title` (string): 弹窗标题
- `message` (string): 警告消息内容

**调用示例**:
```javascript
// JavaScript端调用
csInterface.evalScript(`showPanelWarningDialog("没有检测到活动合成", "请在AE中先选择要导入的合成，然后重试。");`);
```

### 2. showWarningDialog(title, message, buttons)
**用途**: 显示带自定义按钮的警告弹窗  
**参数**:
- `title` (string): 弹窗标题
- `message` (string): 警告消息
- `buttons` (array): 按钮文本数组，可选

### 3. showConfirmDialog(title, message, buttons)
**用途**: 显示确认对话框  
**返回值**: 用户点击的按钮索引

### 4. showInfoDialog(title, message)
**用途**: 显示信息提示弹窗

### 5. showErrorDialog(title, message, details)
**用途**: 显示错误信息弹窗  
**参数**:
- `details` (string): 详细错误信息，可选

### 6. showCompositionSelectDialog(title, message)
**用途**: 显示合成选择对话框  
**返回值**: 包含选择结果的对象

### 7. testDialogSystem()
**用途**: 测试所有弹窗功能（开发调试用）  
**注意**: 此函数仅用于开发测试，实际项目中未被调用

## 实际使用案例

### 案例1: 检测活动合成
**位置**: `FileHandler.js` 第89行
```javascript
showPanelWarningDialog("没有检测到活动合成", "请在AE中先选择要导入的合成，然后重试。");
```

### 案例2: 项目中无合成
**位置**: `dialog-warning.jsx` 第95行
```javascript
showPanelWarningDialog("没有可用合成", "项目中没有找到任何合成。\n请先创建一个合成，然后重试。");
```

## 开发过程中遇到的问题和解决方案

### 问题1: 弹窗文本未居中显示
**现象**: 警告弹窗中的文本内容没有水平、垂直居中  
**解决方案**: 
- 为消息文本添加 `justify = "center"` 实现水平居中
- 设置 `alignment = "center"` 实现垂直居中
- 调整对话框尺寸为350x150像素
- 优化文本区域为300x60像素

### 问题2: 弹窗无法正确显示
**现象**: 弹窗调用后不显示或显示异常  
**原因**: Window类型设置错误  
**解决方案**: 将Window类型从"panel"改为"dialog"并使用模态显示

### 问题3: 弹窗调用时机问题
**现象**: ExtendScript端调用弹窗时机不当  
**解决方案**: 将弹窗调用从ExtendScript端移到JavaScript端的FileHandler.js中

### 问题4: ExtendScript语法兼容性
**现象**: 复杂的颜色设置和样式导致语法错误  
**解决方案**: 
- 移除复杂的图标和样式设置
- 简化为基本的ExtendScript兼容语法
- 使用简洁的面板设计

### 问题5: 弹窗结构过于复杂
**现象**: 多层嵌套的面板结构导致布局问题  
**解决方案**: 
- 简化弹窗结构，只包含标题、内容和按钮
- 移除多余的面板容器和间距元素
- 直接在主对话框中添加文本和按钮元素

## 最佳实践

### 1. 弹窗调用位置
- 在JavaScript端检测条件并调用弹窗
- ExtendScript端专注于弹窗显示逻辑

### 2. 文本内容修改
- 警告文本内容在 `FileHandler.js` 中修改
- 弹窗样式和布局在 `dialog-warning.jsx` 中调整

### 3. 兼容性考虑
- 避免使用复杂的ExtendScript语法
- 保持简洁的UI设计
- 测试不同AE版本的兼容性

### 4. 调试方法
- 使用 `testDialogSystem()` 函数测试所有弹窗功能
- 通过CSInterface.evalScript()调用测试
- 检查ExtendScript控制台的错误信息

## 配置选项

### dialogConfig对象
```javascript
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

## 维护说明

1. **添加新弹窗类型**: 在 `dialog-warning.jsx` 中添加新的函数
2. **修改弹窗样式**: 调整 `showPanelWarningDialog` 函数中的UI参数
3. **修改警告文本**: 在 `FileHandler.js` 中修改具体的消息内容
4. **测试弹窗功能**: 调用 `testDialogSystem()` 函数进行全面测试

---

*文档创建时间: 2024年1月*  
*最后更新: 弹窗文本居中问题修复*