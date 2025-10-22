# “导入行为”设置功能逻辑

## 1. 概述

“导入行为”设置面板组用于精确控制文件在被导入到After Effects项目后，如何在合成（时间轴）中进行处理。这些设置与“导入模式”协同工作，共同构成了完整的导入工作流。

此设置同样遵循**即时保存**机制，任何修改都会被立即持久化。

## 2. 功能组件详解

### 2.1 添加到合成 (Add to Composition)

这是一个总开关，决定了导入的素材是否会自动被添加到当前活动的合成中。

- **勾选状态 (默认)**: 导入的素材会被添加为新图层。
- **未勾选状态**: 素材仅出现在项目面板中，不会影响当前合成。这等同于激活了“不导入合成”的快速设置。

### 2.2 时间轴放置 (Timeline Placement)

当“添加到合成”被勾选时，此设置组才生效，它决定了新图层在时间轴上的初始位置。

- **播放头位置 (`current_time`)**:
  - **功能**: 新图层的入点（In-point）将与当前时间指示器（播放头）的位置对齐。
  - **适用场景**: 需要在视频的特定时间点精确插入素材时。

- **时间轴起点 (`timeline_start`)**:
  - **功能**: 新图层的入点将被设置为 `0`，即合成的开始位置。
  - **适用场景**: 适用于添加背景、水印或作为项目起始的基础图层。

### 2.3 导入行为 (高级子模式)

此部分提供了对导入素材的进一步处理选项。

- **无特殊处理 (`normal`)**:
  - **功能**: 默认行为。素材被作为标准的`FootageItem`导入，并根据上述设置添加到合成中。

- **创建预合成 (`pre_comp`)**:
  - **功能**: 为每一个导入的素材自动创建一个新的预合成（Pre-composition）。原始素材会被放入这个新的预合成中。如果“添加到合成”被勾选，那么最终被添加到时间轴上的是这个新创建的预合成，而不是原始素材。
  - **组织**: 所有通过此方式创建的预合成都会被自动归类到项目面板根目录下的一个名为 `Precomps` 的文件夹中（如果该文件夹不存在，则会自动创建）。
  - **适用场景**: 当您希望为每个导入的素材创建一个独立的、可进行复杂动画或效果处理的容器时，这非常有用。

## 3. 逻辑流程与数据持久化

1.  **事件监听**: `main.js` 中的 `setupSettingsPanel` 方法为所有相关控件（复选框、单选按钮）绑定了 `change` 事件监听器。

2.  **数据收集与保存**: 当用户修改设置时，会触发一个回调函数，该函数从UI收集所有导入行为相关的设置值，并立即调用 `settingsManager` 将这些值作为一个整体对象，实时保存到 `localStorage` 的 `eagle2ae-import-settings` 主键下。

### 关键代码示例

```javascript
// 位于 main.js，展示了如何从UI收集所有导入行为设置
getImportBehaviorSettingsFromUI() {
    const addToComp = document.getElementById('add-to-composition-checkbox')?.checked;
    const placement = document.querySelector('input[name="timeline-placement"]:checked')?.value;
    const subMode = document.querySelector('input[name="import-sub-mode"]:checked')?.value;

    const behaviorSettings = {
        addToComposition: addToComp,
        timelineOptions: {
            placement: addToComp ? placement : 'current_time' // 如果不添加，则此项无意义
        },
        noImportSubMode: subMode || 'normal'
    };

    return behaviorSettings;
}

// 在事件监听器中调用
this.settingsManager.updateSettings(this.getImportBehaviorSettingsFromUI());
```
