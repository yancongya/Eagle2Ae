# “导入行为”设置功能逻辑

## 1. 概述

“导入行为”设置决定了从Eagle导入的素材在进入AE项目后，是否以及如何被添加到当前活动的合成中。这是控制时间轴操作的核心功能。

此功能在UI上有两处体现：
1.  **主面板（快速设置）**: 提供最常用的选项。
2.  **高级设置面板**: 提供完全相同的选项，并与主面板保持同步。

本文档详细说明了此功能的完整逻辑链条，从UI交互到最终在ExtendScript中的执行。

## 2. UI与事件处理

### 2.1 UI组件
- **快速设置**: 一组name为 `import-behavior` 的单选按钮。
- **高级设置**: 一组name为 `advanced-import-behavior` 的单选按钮。

两个组件都包含三个选项：
- `no_import` (不导入合成)
- `current_time` (当前时间)
- `timeline_start` (时间轴开始)

### 2.2 事件处理与同步
- **事件监听**: 在 `main.js` 的 `setupQuickSettings` 和 `setupSettingsPanel` 方法中，为这两组单选按钮都添加了 `change` 事件监听器。
- **双向同步**: 任何一组按钮的变更都会触发一个同步函数（`syncQuickToAdvanced` 或 `syncAdvancedToQuick`），确保另一组按钮的状态与之匹配。
- **实时保存**: 用户的选择会**立即**触发设置的保存，无需点击“保存设置”按钮。

## 3. 核心逻辑与数据流

此功能的实现并非通过单一的 `importBehavior` 设置项，而是通过**组合控制两个独立的设置项**来完成：
- `addToComposition` (布尔值): 决定是否要将素材添加到合成中。
- `timelineOptions.placement` (字符串): 如果要添加，具体放置在哪个位置。

### 3.1 逻辑流程详解

```mermaid
graph TD
    A[用户点击<br>任一'导入行为'单选按钮] --> B{main.js<br>change事件监听器};
    B --> C{判断选项值};
    C -- "no_import" --> D[调用 settingsManager.updateField<br>('addToComposition', false)];
    C -- "current_time" 或 "timeline_start" --> E[调用 settingsManager.updateField<br>('addToComposition', true)];
    E --> F[调用 settingsManager.updateField<br>('timelineOptions.placement', 选项值)];
    D --> G[设置被实时保存到localStorage];
    F --> G;
    G --> H[...用户触发导入...];
    H --> I{FileHandler.js<br>handleImportRequest};
    I -- 传递settings对象 --> J{hostscript.jsx<br>importFilesWithSettings};
    J --> K{检查 settings.addToComposition};
    K -- 若为 false --> L[结束流程<br>(仅导入到项目)];
    K -- 若为 true --> M{添加到合成<br>comp.layers.add()};
    M --> N{检查 settings.timelineOptions.placement};
    N -- "current_time" --> O[设置 layer.startTime = comp.time];
    N -- "timeline_start" --> P[设置 layer.startTime = 0];
```

### 3.2 关键代码示例

#### 1. `main.js` 中的设置更新逻辑

当用户选择一个选项时，`main.js` 中的 `setupQuickSettings` 函数会执行以下逻辑：

```javascript
// 位于 main.js -> setupQuickSettings
importBehaviorRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            if (e.target.value === 'no_import') {
                // 如果选择"不导入合成"，只更新 addToComposition
                this.updateQuickSetting('addToComposition', false);
            } else {
                // 否则，确保 addToComposition 为 true，并更新 placement
                this.updateQuickSetting('addToComposition', true);
                this.updateQuickSetting('timelineOptions.placement', e.target.value);
            }
            // ...同步UI...
        }
    });
});
```

#### 2. `hostscript.jsx` 中的最终执行逻辑

在 `importFilesWithSettings` 函数中，从 `main.js` 传递过来的 `settings` 对象被用来决定最终操作。

```javascript
// 位于 hostscript.jsx -> importFilesWithSettings

// ...导入文件到项目后...

// 检查是否需要添加到合成
if (settings.addToComposition) {
    var comp = project.activeItem;
    if (comp) {
        var layer = comp.layers.add(footageItem);

        // 根据时间轴设置放置图层
        if (settings.timelineOptions && settings.timelineOptions.placement) {
            switch (settings.timelineOptions.placement) {
                case 'current_time':
                    layer.startTime = comp.time;
                    break;
                case 'timeline_start':
                    layer.startTime = 0;
                    break;
            }
        }
    }
}
// 如果 settings.addToComposition 为 false，以上代码块完全不执行。
```

## 4. 总结

“导入行为”设置通过一个UI选项，巧妙地控制了两个内部设置参数 (`addToComposition` 和 `timelineOptions.placement`)，最终在ExtendScript层级实现精确的图层添加和定位逻辑。整个过程是实时保存的，为用户提供了流畅的交互体验。
