# AE插件UI组件详细说明

## 概述

Eagle2Ae AE插件面板提供了完整的用户界面，用于管理Eagle与After Effects之间的文件传输和项目集成。本文档详细说明每个UI组件的功能、参数和运行逻辑。

## 插件面板整体布局

### 主要区域划分

```
┌─────────────────────────────────────┐
│ 标题栏 (Header)                      │
├─────────────────────────────────────┤
│ 项目信息面板 (Project Info)          │
├─────────────────────────────────────┤
│ 导入模式&行为面板 (Import Settings)   │
├─────────────────────────────────────┤
│ 状态信息面板 (Status Panel)          │
├─────────────────────────────────────┤
│ 日志面板 (Log Panel)                │
└─────────────────────────────────────┘
```

## 1. 标题栏组件 (Header)

标题栏是插件的“门面”，包含了应用标题、Logo以及核心功能按钮。

### 1.1 应用标题与动画

- **组件**: `.title` 区域
- **功能**: 显示插件名称 "Eagle2Ae"，并提供一个有趣的纯CSS悬浮动画效果。
- **动画详解**:
  该动画不涉及任何JavaScript，完全通过CSS实现，当用户鼠标悬浮在标题区域时触发：
  1.  **Logo切换**: `.title:hover .title-logo` 选择器通过 `content: url('public/logo2.png');` 规则将Logo图片从 `logo.png` 替换为 `logo2.png`。
  2.  **字母重排**: 标题 "Eagle2Ae" 的每个字母都是一个独立的 `<span>` 元素。通过对父元素设置 `:hover`，并利用 `flex` 布局的 `order` 属性，CSS将字母重新排序，视觉上从 "Eagle2Ae" 变为 "Ae2Eagle"。
      ```css
      /* 示例：将 'A' (char-a2) 移动到第1位 */
      .title:hover .char-a2 { order: 1; }
      /* 示例：将 'e' (char-e3) 移动到第2位 */
      .title:hover .char-e3 { order: 2; }
      /* ...以此类推... */
      ```
  3.  **字符变换**: 在重排的同时，一个名为 `charSwap` 的 `@keyframes` 动画被应用到小写字母 'a' (`.char-a1`) 上，使其平滑地变换为大写 'A'，从而完成 "Ae2Eagle" 的拼写。

### 1.2 头部操作按钮

#### 日志面板切换按钮
- **ID**: `log-panel-toggle`
- **功能**: 控制下方日志面板的显示与隐藏。
- **UI表现**: 按钮的文本在 “显示日志” 和 “隐藏日志” 之间切换。
- **运行逻辑**: 点击该按钮会触发 `main.js` 中的 `toggleLogPanel()` 函数。
  ```javascript
  // main.js - 实际实现
  toggleLogPanel() {
    const logSection = document.querySelector('.section.log');
    const logPanelToggle = document.getElementById('log-panel-toggle');

    if (logSection) {
        // 切换 .visible 类来控制显示
        const isVisible = logSection.classList.toggle('visible');
        logSection.style.display = isVisible ? 'flex' : 'none';

        if (logPanelToggle) {
            // 动态更新按钮文本
            logPanelToggle.textContent = isVisible ? '隐藏日志' : '显示日志';
            logPanelToggle.classList.toggle('active', isVisible);
        }

        if (isVisible) {
            this.scrollToLogBottom(); // 如果可见，滚动到底部
        }
    }
  }
  ```

#### 高级设置按钮
- **ID**: `settings-btn`
- **图标**: ⚙️
- **功能**: 打开包含所有配置项的高级设置面板。
- **运行逻辑**: 点击该按钮会触发 `main.js` 中的 `showSettingsPanel()` 函数。该函数负责：
  1.  检查 `SettingsPanel` 实例是否存在，如果不存在，则 `new SettingsPanel()` 来创建它。
  2.  调用 `syncQuickToAdvanced()` 方法，将主面板上的快速设置同步到高级设置面板中。
  3.  调用设置面板实例的 `show()` 方法，将其显示出来。

## 2. 项目信息面板 (Project Info)

### 2.1 功能概述

此面板是插件的核心信息展示区，旨在为用户提供关于 After Effects 当前项目状态和与 Eagle 连接状态的实时概览。所有信息都会在插件启动时自动获取，并可以通过手动刷新来更新。

### 2.2 数据流与实现

#### After Effects 信息获取

AE 的相关信息（如项目名称、路径等）通过一个“JS -> JSX”调用链来获取。

1.  **UI -> JS**: 当用户点击刷新按钮 (`#refresh-project-info-btn`) 或在插件启动时，会调用 `main.js` 中的 `refreshProjectInfo()` 函数。
2.  **JS -> JSX**: `refreshProjectInfo()` 内部会调用 `getProjectInfo()` 异步函数，该函数通过 `csInterface.evalScript()` 执行 `hostscript.jsx` 中的 `getProjectInfo()` 方法。
3.  **JSX -> JS**: `hostscript.jsx` 中的方法会访问 AE 的项目DOM，获取 `app.project.file.name` (项目名), `app.project.file.fsName` (项目路径) 和 `app.project.activeItem.name` (当前合成名)，并将这些信息打包成一个JSON字符串返回。
4.  **JS -> UI**: `main.js` 收到返回的JSON数据后，会调用 `updateProjectInfoUI()` 函数，将数据填充到对应的HTML元素中。

```javascript
// main.js - 简化流程
async refreshProjectInfo() {
    try {
        // 调用JSX脚本获取数据
        const projectInfo = await this.getProjectInfo();
        // 更新UI
        this.updateProjectInfoUI(projectInfo);
    } catch (error) {
        // 处理错误
    }
}
```

#### Eagle 信息获取

Eagle 的相关信息（如版本、资源库名称等）则通过 WebSocket 从 Eagle 插件端推送。

1.  **Eagle -> WebSocket**: Eagle插件启动或状态变更时，会主动向AE插件发送包含其自身信息的数据包。
2.  **WebSocket -> JS**: `websocket-client.js` 监听这些消息。
3.  **JS -> UI**: 收到消息后，调用 `updateEagleInfoUI()` (示例函数名) 将信息更新到对应的HTML元素上。

### 2.3 UI组件详解

#### 连接状态按钮
- **ID**: `test-connection-btn`
- **功能**: 手动测试与Eagle插件的连接状态，并显示延迟。
- **详细文档**: [`docs/AE/panel-functions/connection-status.md`](../panel-functions/connection-status.md)

#### AE 信息区域
- **刷新按钮**:
  - **ID**: `refresh-project-info-btn`
  - **功能**: 手动触发 `refreshProjectInfo()` 函数，立刻重新获取并更新下方的所有AE项目信息。
- **版本信息**:
  - **ID**: `#ae-version`
  - **来源**: `csInterface.getHostEnvironment().appVersion`
- **项目路径**:
  - **ID**: `#project-path`
  - **来源**: `hostscript.jsx` -> `app.project.file.fsName`
- **项目名称**:
  - **ID**: `#project-name`
  - **来源**: `hostscript.jsx` -> `app.project.file.name`
- **合成名称**:
  - **ID**: `#comp-name`
  - **来源**: `hostscript.jsx` -> `app.project.activeItem.name`

#### Eagle 信息区域
- **版本信息**:
  - **ID**: `#eagle-version`
  - **来源**: WebSocket
- **应用路径**:
  - **ID**: `#eagle-path`
  - **来源**: WebSocket
- **资源库**:
  - **ID**: `#eagle-library`
  - **来源**: WebSocket
- **当前组**:
  - **ID**: `#eagle-folder`
  - **来源**: WebSocket

## 3. 导入模式&行为面板

### 3.1 导入模式选择

#### 直接导入模式
- **值**: `direct`
- **功能**: 从Eagle源目录直接导入到AE项目
- **特点**: 不复制文件，直接引用原始路径
- **适用场景**: 文件已在合适位置，无需移动

#### 项目旁复制模式
- **值**: `project_adjacent`
- **功能**: 复制文件到AE项目文件旁边的指定文件夹
- **默认状态**: 选中状态
- **配置**: 可设置文件夹名称（默认：Eagle_Assets）

#### 指定文件夹模式
- **值**: `custom_folder`
- **功能**: 复制文件到用户指定的任意文件夹
- **配置**: 需要设置目标文件夹路径

### 3.2 导入行为设置

#### 不导入合成
- **值**: `no_import`
- **功能**: 仅导入到项目面板，不添加到合成
- **适用场景**: 批量导入素材，稍后手动添加

#### 当前时间导入
- **值**: `current_time`
- **功能**: 将素材放置在时间轴当前时间指针位置
- **默认状态**: 选中状态

#### 时间轴开始导入
- **值**: `timeline_start`
- **功能**: 将素材移至时间轴开始处（0秒位置）
- **适用场景**: 素材作为背景或基础层

### 3.3 图层操作按钮组

#### 检测图层按钮
- **ID**: `detect-layers-btn`
- **功能**: 扫描当前合成中的所有图层
- **运行逻辑**:
  ```javascript
  detectLayers() {
    // 调用ExtendScript获取图层信息
    csInterface.evalScript('getCompositionLayers()', (result) => {
      // 处理图层数据并更新UI
    });
  }
  ```

#### 导出图层按钮
- **ID**: `export-layers-btn`
- **功能**: 导出选中的图层到文件系统
- **状态管理**: 根据是否有选中图层动态启用/禁用

#### 导出到Eagle按钮
- **ID**: `export-to-eagle-btn`
- **功能**: 将AE图层数据直接导出到Eagle资源库
- **运行逻辑**: 调用Eagle API进行数据传输

## 4. 状态信息面板 (Status Panel)

此面板是用户操作后获得即时反馈的主要区域，由两个功能不同的部分组成。

### 4.1 导入状态显示 (`#import-status`)

- **功能**: 此区域专门用于显示**文件导入操作的最终结果**，是一个总结性反馈。
- **更新时机**: 在 `main.js` 的 `handleImportFiles()` 异步函数执行完毕后，会调用 `updateImportStatus()` 方法来更新此UI。
- **逻辑**: `updateImportStatus()` 函数会根据导入成功或失败，为 `#import-status` 元素添加 `.success` 或 `.error` 的CSS类（改变其左边框颜色），并更新内部文本，如“已导入 5 个文件”或“导入失败: 请先打开AE项目”。

### 4.2 最新状态消息 (`#latest-log-message`)

- **功能**: 此区域是插件内部活动的**实时“滚动播报”窗口**，它会显示最新的一条日志消息。
- **更新时机**: 每当插件的任何部分调用 `aeExtension.log()` 方法记录一条新日志时，此区域就会被刷新。
- **逻辑**: `LogManager` 类中的 `updateLatestLogDisplay()` 方法负责将最新日志的文本内容和级别（如 `info`, `error`）同步到 `#latest-log-message` 元素及其CSS类上。这为开发者提供了一个无需展开日志面板即可监控插件当前状态的便捷窗口。

## 5. 日志面板 (Log Panel)

日志面板是插件诊断和监控的核心窗口，它不仅显示AE插件自身的日志，还能接收并展示来自Eagle插件的日志。

### 5.1 核心架构

日志系统由 `main.js` 中的 `AEExtension` 主类和 `LogManager` 辅助类共同管理。

- **`LogManager` 类**: 一个独立的日志处理器，负责日志的格式化、分级（info, error等）、静默模式（过滤重复信息）和最终的DOM渲染。
- **双日志队列**: `AEExtension` 实例中维护着两个独立的数组来存储不同来源的日志：
  - `aeLogs`: 存储当前AE插件自身运行产生的日志。
  - `eagleLogs`: 存储通过HTTP轮询或WebSocket从Eagle插件获取的日志。

### 5.2 UI组件与功能

#### 日志标题 (`#log-title`) 与切换按钮 (`#log-switch-btn`)
- **功能**: 显示当前日志来源（AE扩展/Eagle插件），并且两者均可点击。
- **运行逻辑**: 点击标题或切换按钮会触发 `AEExtension.switchLogView()` 函数。该函数会：
  1. 切换 `AEExtension.currentLogView` 属性的值（在 'ae' 和 'eagle' 之间）。
  2. 调用 `updateLogControls()` 更新标题文本。
  3. 调用 `updateLogDisplay()` 使用对应的日志数组 (`aeLogs` 或 `eagleLogs`) 重新渲染日志输出区域。

#### 清空日志按钮 (`#clear-log-btn`)
- **图标**: 🗑️
- **功能**: 清空当前视图下的日志内容。
- **运行逻辑**: 点击此按钮会触发 `AEExtension.clearLog()` 函数，其行为取决于当前日志视图：
  - **AE视图**: 直接清空 `aeLogs` 数组和 `LogManager` 中的日志，纯前端操作。
  - **Eagle视图**: 除了清空本地的 `eagleLogs` 数组外，还会调用 `requestEagleClearLogs()` 函数，向Eagle插件的 `/clear-logs` 接口发送一个 **POST请求**，以清空Eagle插件端的日志缓存。这是一个关键的网络交互行为。

#### 日志输出区域 (`#log-output`)
- **功能**: 显示格式化后的日志条目。
- **运行逻辑**: 此区域的内容完全由 `AEExtension.updateLogDisplay()` 函数动态生成。该函数会根据 `currentLogView` 的值，遍历 `aeLogs` 或 `eagleLogs` 数组，并为每条日志创建一个带时间戳、级别和消息的DOM元素。

### 5.3 数据流

- **AE日志**: 插件内部通过调用 `aeExtension.log(...)` 方法生成日志，经由 `LogManager` 处理后存入 `aeLogs` 数组，并实时更新UI。
- **Eagle日志**: `AEExtension.pollMessages()` 或WebSocket消息处理器在收到来自Eagle插件的数据后，会调用 `updateEagleLogs()`，将日志存入 `eagleLogs` 数组。如果当前正在查看Eagle日志，则UI会同步更新。

## 6. 模态对话框组件

### 6.1 文件夹选择器
- **ID**: `folder-picker-modal`
- **功能**: 选择目标文件夹
- **支持方式**:
  - 拖拽选择
  - 手动输入路径
  - 浏览器文件夹选择API

### 6.2 高级设置面板
- **ID**: `settings-panel`
- **功能**: 提供对插件所有功能的详细配置，采用即时保存机制。
- **详细文档**: [“高级设置”面板功能说明](../panel-functions/advanced-settings-panel.md)

### 6.3 项目旁复制设置
- **ID**: `project-adjacent-modal`
- **功能**: 配置项目旁复制的文件夹名称

## 7. UI 组件 (v2.3.0+)

从 v2.3.0 开始，插件的核心UI组件正逐步迁移到基于Web技术（HTML/CSS/JS）的实现，以提供更统一和现代的用户体验。

### 7.1 SummaryDialog (图层检测总结对话框) - [主要组件]

这是用于显示图层检测结果的模态对话框，完全在CEP面板内部渲染。

- **文件**: `js/ui/summary-dialog.js`
- **描述**: 一个用于显示图层检测结果的模态对话框。它提供了丰富的交互，如点击打开文件夹、导出图层（包括设计文件和合成的当前帧）以及悬浮显示详细信息。
- **用法 (在 `main.js` 中)**:
  ```javascript
  // 1. 确保 SummaryDialog 类在页面中可用
  // 2. 实例化对话框
  const dialog = new SummaryDialog();
  // 3. 调用 show 方法并传入从 hostscript.jsx 返回的图层分析数据
  dialog.show(detectionResults).then(userClickedOk => {
      if (userClickedOk) {
          console.log("用户点击了确定");
      }
  });
  ```
- **特点**:
    - UI风格与Demo模式完全统一。
    - 交互和样式由CSS和JS控制，易于扩展和维护。
    - 不再包含行内操作按钮，交互通过点击图层名称本身完成。

### 7.2 JSX 原生UI组件 (辅助/旧版)

这些是使用ExtendScript的 `Window` 对象创建的原生AE风格组件，目前仅用于简单的、需要强阻塞的提示。

#### 7.2.1 showPanelWarningDialog (警告对话框)
- **文件**: `jsx/dialog-warning.jsx`
- **描述**: 显示一个带“确定”按钮的简单模态警告框。
- **状态**: **仍在使用**，适用于需要快速阻塞用户的简单提示。

#### 7.2.2 旧版图层检测对话框
- **文件**: `jsx/dialog-summary.jsx`
- **描述**: (旧版) 用于显示图层检测结果的原生窗口。
- **状态**: **已废弃**。此组件的所有功能现已由 `SummaryDialog` (7.1) 完全取代。不应再用于新功能开发。

## 8. 响应式设计

### 8.1 断点设置
- **大尺寸**: > 400px
- **中等尺寸**: 321px - 400px
- **小尺寸**: 280px - 320px
- **极小尺寸**: < 280px

### 8.2 自适应调整
- **按钮尺寸**: 根据屏幕大小调整padding和字体
- **间距优化**: 小屏幕下减少间距
- **文字大小**: 动态调整以保持可读性

## 9. 数据流向和交互逻辑

### 9.1 设置同步机制
```javascript
// 快速面板 → 高级设置
syncQuickToAdvanced() {
  // 同步导入模式和行为设置
}

// 高级设置 → 快速面板
syncAdvancedToQuick() {
  // 反向同步设置
}
```

### 9.2 数据持久化
- **存储方式**: localStorage
- **存储内容**: 用户设置、最近使用路径
- **恢复机制**: 页面加载时自动恢复设置

### 9.3 错误处理机制
- **连接错误**: 自动重试机制
- **文件操作错误**: 友好错误提示
- **设置验证**: 输入验证和格式检查

## 10. 性能优化特性

### 10.1 动画优化
- **CSS动画**: 使用transform和opacity避免重排
- **节流处理**: 拖拽事件节流处理
- **内存管理**: 及时清理事件监听器

### 10.2 异步处理
- **文件操作**: 异步处理避免UI阻塞
- **网络请求**: Promise-based异步通信
- **状态更新**: 批量更新减少DOM操作

## 11. 安全性考虑

### 11.1 路径验证
- **输入验证**: 防止路径注入攻击
- **权限检查**: 确保文件访问权限
- **错误信息**: 不暴露敏感系统信息

### 11.2 数据保护
- **本地存储**: 仅存储必要的配置信息
- **传输安全**: 本地通信避免网络风险
- **临时文件**: 及时清理临时数据

---

## 开发者注意事项

1. **组件独立性**: 每个组件应保持功能独立，便于维护
2. **状态管理**: 使用统一的状态管理机制
3. **错误处理**: 所有用户操作都应有适当的错误处理
4. **可访问性**: 确保键盘导航和屏幕阅读器支持
5. **测试覆盖**: 关键交互功能需要充分测试

## 相关文档

- [API参考文档](./api-reference.md)
- [开发指南](../development/setup-guide.md)
- [架构设计](../architecture/system-design.md)
- [通信协议](../../shared/communication-protocol.md)