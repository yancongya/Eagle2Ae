# “导入模式”设置面板功能逻辑

## 概述

“导入模式”是Eagle2Ae插件中的一个核心设置，它决定了从Eagle发送到AE的文件在导入项目前应如何处理。用户可以在“高级设置”面板中配置此功能，该面板提供了三种不同的文件处理策略。

本文档详细说明了该设置面板中三个选项按钮的UI交互、功能逻辑和数据持久化机制。

## 1. 功能映射

- **UI 元素**: 在 `index.html` 中，这是一个由三个 `label` 元素组成的单选按钮组，位于 `<div class="import-mode-options-horizontal">` 容器内。每个 `label` 包含一个 `input[type="radio"]`，它们的 `name` 属性均为 `import-mode`。

- **事件处理**: 在 `main.js` 的 `setupSettingsPanel` 方法中，为所有 `input[name="import-mode"]` 元素绑定了一个 `change` 事件的监听器。

## 2. 模式详解与交互流程

当用户在设置面板中点击不同的导入模式时，会触发相应的UI交互和后台逻辑。

### 2.1 直接导入 (`direct`)

- **用户操作**: 用户点击“直接导入”选项。
- **UI 响应**: 该选项被选中，其他选项取消选中。
- **后台逻辑**: 
    1.  `main.js` 中的事件监听器被触发。
    2.  调用 `settingsManager.updateField('mode', 'direct', false)`，将设置**立即保存**到 `localStorage`。
    3.  将此变更同步到主面板的快速设置UI上。

### 2.2 项目旁复制 (`project_adjacent`)

- **用户操作**: 用户点击“项目旁复制”选项。
- **UI 响应**: 
    1. 该选项被选中。
    2. **触发 `showProjectAdjacentModal()` 函数**，弹出一个模态框，允许用户配置要创建的子文件夹名称（如 `Eagle_Assets`）。
- **后台逻辑**: 
    1.  `main.js` 中的事件监听器被触发。
    2.  调用 `settingsManager.updateField('mode', 'project_adjacent', false)`，立即保存新模式。
    3.  当用户在模态框中确认文件夹名称后，该名称会通过另一个 `settingsManager` 调用被保存下来。

### 2.3 指定文件夹 (`custom_folder`)

- **用户操作**: 用户点击“指定文件夹”选项。
- **UI 响应**: 
    1. 该选项被选中。
    2. **触发 `showCustomFolderModal()` 函数**，弹出一个模态框，允许用户选择或输入一个全局的目标文件夹路径。
- **后台逻辑**: 
    1.  `main.js` 中的事件监听器被触发。
    2.  调用 `settingsManager.updateField('mode', 'custom_folder', false)`，立即保存新模式。
    3.  当用户在模态框中确认文件夹路径后，该路径会通过另一个 `settingsManager` 调用被保存下来。

## 3. 数据持久化

导入模式的设置是**实时持久化**的，这意味着用户的选择会立即生效并保存，无需点击设置面板右下角的“保存设置”按钮。

- **实现方式**: 通过调用 `SettingsManager.js` 中的 `updateField` 方法实现。
- **存储位置**: 浏览器 `localStorage`。
- **存储键名**: `eagle2ae-import-settings`。

用户的选择（`direct`, `project_adjacent`, 或 `custom_folder`）作为 `mode` 字段的值，被保存在一个JSON对象中。

## 4. 关联文档

关于每种模式在文件导入过程中的具体后台文件操作（如检查路径、创建文件夹、复制文件等），请参阅更详细的实现文档：

- **[导入逻辑技术文档](../development/import-logic.md)**
