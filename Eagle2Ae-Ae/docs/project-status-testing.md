# 项目状态检测功能测试指南

## 概述

本文档介绍如何测试Eagle2Ae插件中的项目状态检测功能，确保所有功能入口点都能正确检测AE项目状态并在必要时阻止操作。

## 测试目标

验证以下功能的项目状态检测逻辑：

1. **拖拽文件导入** - 在没有打开AE项目时阻止文件拖拽
2. **检测图层按钮** - detectLayers功能的项目状态检查
3. **导出图层按钮** - exportLayers功能的项目状态检查
4. **导出到Eagle按钮** - exportToEagle功能的项目状态检查
5. **警告弹窗显示** - 确保警告信息正确显示给用户

## 测试环境要求

### 软件要求
- After Effects CC 2018 或更高版本
- Eagle 3.0 或更高版本
- Eagle2Ae插件已正确安装

### 测试准备
1. 启动After Effects
2. 加载Eagle2Ae CEP扩展
3. 确保没有打开任何AE项目（关闭所有项目）

## 测试方法

### 方法一：使用测试页面（推荐）

1. **打开测试页面**
   ```
   在浏览器中打开：Eagle2Ae-Ae/test-project-status.html
   ```

2. **运行快速测试**
   - 点击"运行快速测试"按钮
   - 查看当前项目状态信息
   - 验证状态检测是否正确

3. **运行完整测试套件**
   - 点击"运行完整测试"按钮
   - 观察所有测试项目的执行结果
   - 查看详细的测试报告

4. **测试警告弹窗**
   - 点击"测试警告弹窗"按钮
   - 验证弹窗是否正确显示

### 方法二：使用浏览器控制台

1. **打开CEP扩展的调试窗口**
   - 在After Effects中右键点击Eagle2Ae面板
   - 选择"Debug"选项

2. **在控制台中运行测试**
   ```javascript
   // 快速测试
   quickProjectStatusTest();
   
   // 完整测试
   startProjectStatusTest();
   ```

### 方法三：手动功能测试

1. **测试拖拽功能**
   - 确保没有打开AE项目
   - 尝试将文件拖拽到Eagle2Ae面板
   - 验证是否显示项目状态警告

2. **测试导出按钮**
   - 点击"检测图层"按钮
   - 点击"导出图层"按钮
   - 点击"导出到Eagle"按钮
   - 验证每个按钮是否都显示项目状态警告

## 测试用例

### 用例1：无项目状态检测

**前置条件**：After Effects中没有打开任何项目

**测试步骤**：
1. 调用`projectStatusChecker.checkProjectStatus()`
2. 验证返回结果

**期望结果**：
```javascript
{
  hasProject: false,
  projectName: null,
  projectPath: null,
  isValid: false
}
```

### 用例2：活动合成检测

**前置条件**：After Effects中没有活动合成

**测试步骤**：
1. 调用`projectStatusChecker.checkActiveComposition()`
2. 验证返回结果

**期望结果**：
```javascript
{
  hasActiveComp: false,
  compName: null,
  isValid: false
}
```

### 用例3：项目状态验证

**前置条件**：After Effects中没有打开项目

**测试步骤**：
1. 调用`projectStatusChecker.validateProjectStatus()`
2. 验证返回结果和警告显示

**期望结果**：
- 返回值：`false`
- 显示警告弹窗（如果启用）

### 用例4：拖拽事件阻止

**前置条件**：After Effects中没有打开项目

**测试步骤**：
1. 模拟文件拖拽到面板
2. 验证拖拽事件是否被阻止

**期望结果**：
- 拖拽操作被阻止
- 显示项目状态警告
- 控制台记录相关日志

### 用例5：导出功能阻止

**前置条件**：After Effects中没有打开项目

**测试步骤**：
1. 尝试调用detectLayers、exportLayers、exportToEagle方法
2. 验证方法是否被阻止执行

**期望结果**：
- 方法执行被阻止
- 显示项目状态警告
- 控制台记录相关日志

## 测试结果验证

### 成功标准

1. **状态检测准确性**
   - 正确识别是否有打开的AE项目
   - 正确识别是否有活动合成
   - 状态信息完整且准确

2. **功能阻止有效性**
   - 无项目时成功阻止拖拽操作
   - 无项目时成功阻止所有导出操作
   - 阻止操作时显示适当的警告信息

3. **用户体验**
   - 警告弹窗样式与现有UI一致
   - 错误信息清晰易懂
   - 操作响应及时

4. **日志记录**
   - 所有关键操作都有日志记录
   - 日志信息详细且有用
   - 错误信息包含足够的调试信息

### 失败处理

如果测试失败，请检查：

1. **环境问题**
   - CEP扩展是否正确加载
   - ProjectStatusChecker.js是否正确引入
   - After Effects版本是否兼容

2. **代码问题**
   - 检查控制台错误信息
   - 验证ExtendScript通信是否正常
   - 确认所有依赖文件都已加载

3. **配置问题**
   - 检查manifest.json配置
   - 验证文件路径是否正确
   - 确认权限设置是否充足

## 调试技巧

### 启用详细日志

```javascript
// 在控制台中启用调试模式
window.DEBUG_MODE = true;

// 查看详细的项目状态信息
const checker = new ProjectStatusChecker(
    new CSInterface(),
    (msg, level) => console.log(`[${level}] ${msg}`)
);
```

### 手动测试特定功能

```javascript
// 测试项目状态检查
checker.checkProjectStatus().then(status => {
    console.log('项目状态:', status);
});

// 测试活动合成检查
checker.checkActiveComposition().then(comp => {
    console.log('活动合成:', comp);
});

// 测试状态验证
checker.validateProjectStatus({ showWarning: true }).then(isValid => {
    console.log('状态有效:', isValid);
});
```

### 监控ExtendScript通信

```javascript
// 监控ExtendScript调用
const originalEvalScript = csInterface.evalScript;
csInterface.evalScript = function(script, callback) {
    console.log('ExtendScript调用:', script);
    return originalEvalScript.call(this, script, (result) => {
        console.log('ExtendScript结果:', result);
        if (callback) callback(result);
    });
};
```

## 常见问题

### Q: 测试页面无法加载
**A**: 确保在支持CEP的环境中打开，或者使用After Effects的调试窗口。

### Q: ProjectStatusChecker未定义
**A**: 检查ProjectStatusChecker.js是否正确加载，确认HTML中的script标签顺序。

### Q: ExtendScript通信失败
**A**: 验证After Effects是否正在运行，检查CEP扩展是否正确注册。

### Q: 警告弹窗不显示
**A**: 检查showPanelWarningDialog函数是否可用，确认dialog-warning.jsx已正确加载。

## 总结

通过以上测试方法和用例，可以全面验证Eagle2Ae插件的项目状态检测功能。确保在各种场景下都能正确检测项目状态，并在必要时阻止操作以提供良好的用户体验。

定期运行这些测试，特别是在修改相关代码后，可以确保功能的稳定性和可靠性。