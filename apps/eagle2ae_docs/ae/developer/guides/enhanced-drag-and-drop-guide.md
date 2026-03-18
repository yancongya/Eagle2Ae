# 拖拽导入增强功能使用指南

## 概述

拖拽导入增强功能是 Eagle2Ae 的核心特性之一，全面增强的拖拽导入功能支持文件夹拖拽、序列帧检测等高级特性，大幅提升素材处理效率。

## 主要特性

### 1. 文件夹拖拽支持

直接拖拽整个文件夹到扩展面板，系统会自动递归读取文件夹中的所有文件。

### 2. 序列帧自动检测

智能识别图片序列并将其作为单个序列导入，避免导入成百上千张独立图片。

### 3. 项目内文件检测

防止重复导入已在项目中的文件，确保项目面板的整洁性。

### 4. 增强的视觉反馈

提供实时状态提示和进度显示，改善用户体验。

### 5. 拖拽悬浮选择导入行为（v2.5.0新增）

拖拽文件时，通过将鼠标悬浮到不同的导入行为按钮来动态切换导入方式，大幅提升操作效率和灵活性。

## 使用指南

### 基本拖拽操作

1. 从文件管理器中选择一个或多个文件
2. 拖拽到 Eagle2Ae 扩展面板的任意位置
3. 等待系统处理并导入文件

### 文件夹拖拽操作

1. 从文件管理器中选择一个文件夹
2. 拖拽到 Eagle2Ae 扩展面板
3. 系统会自动分析文件夹内容
4. 根据分析结果显示导入选项对话框

### 拖拽悬浮选择导入行为

1. 开始拖拽文件到扩展面板
2. 在释放文件之前，将鼠标移动到想要的导入行为按钮上
3. 按钮会自动显示高亮选中状态
4. 可以继续移动鼠标到其他按钮切换导入行为
5. 在目标按钮上方释放鼠标，文件将使用选中的导入行为进行导入

**注意事项**：
- 拖拽悬浮功能仅在有文件被拖拽时激活
- 导入行为按钮的选择是实时的，可以随时切换
- 最终使用的导入行为取决于释放文件时鼠标悬浮的按钮
- 该功能与点击按钮选择方式完全兼容

## 使用指南

### 基本拖拽操作

1. 从文件管理器中选择一个或多个文件
2. 拖拽到 Eagle2Ae 扩展面板的任意位置
3. 等待系统处理并导入文件

### 文件夹拖拽操作

1. 从文件管理器中选择一个文件夹
2. 拖拽到 Eagle2Ae 扩展面板
3. 系统会自动分析文件夹内容
4. 根据分析结果显示导入选项对话框

### 序列帧检测

```javascript
// 序列帧检测算法
detectImageSequence(files) {
    // 只检测图片文件
    const imageFiles = files.filter(file => this.getFileCategory(file) === 'image');

    if (imageFiles.length < 2) return null;

    // 按文件名排序
    imageFiles.sort((a, b) => a.name.localeCompare(b.name));

    // 尝试找到数字模式
    const patterns = [];

    for (const file of imageFiles) {
        const name = file.name;
        const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));

        // 查找数字模式 - 支持多种数字格式，优先匹配最后一个数字序列
        const numberMatches = nameWithoutExt.match(/(.*?)(\d+)([^\d]*)$/);
        if (numberMatches) {
            const [, prefix, number, suffix] = numberMatches;
            patterns.push({
                prefix: prefix || '',
                number: parseInt(number),
                suffix: suffix || '',
                numberLength: number.length,
                originalNumber: number,
                file
            });
        }
    }

    // 找到最一致的模式
    const patternGroups = {};
    patterns.forEach(p => {
        const key = `${p.prefix}_${p.suffix}_${p.numberLength}`;
        if (!patternGroups[key]) {
            patternGroups[key] = [];
        }
        patternGroups[key].push(p);
    });

    // 找到最大的组
    let bestGroup = null;
    let maxSize = 0;

    for (const [key, group] of Object.entries(patternGroups)) {
        if (group.length > maxSize) {
            maxSize = group.length;
            bestGroup = group;
        }
    }

    // 排序并检查连续性
    bestGroup.sort((a, b) => a.number - b.number);

    const numbers = bestGroup.map(p => p.number);
    const start = numbers[0];
    const end = numbers[numbers.length - 1];

    // 检测步长
    let step = 1;
    if (numbers.length > 1) {
        const diffs = [];
        for (let i = 1; i < numbers.length; i++) {
            diffs.push(numbers[i] - numbers[i - 1]);
        }

        // 找到最常见的差值作为步长
        const diffCounts = {};
        diffs.forEach(diff => {
            diffCounts[diff] = (diffCounts[diff] || 0) + 1;
        });

        let maxCount = 0;
        for (const [diff, count] of Object.entries(diffCounts)) {
            if (count > maxCount) {
                maxCount = count;
                step = parseInt(diff);
            }
        }
    }

    // 构建模式字符串
    const firstPattern = bestGroup[0];
    const pattern = `${firstPattern.prefix}[${start}-${end}]${firstPattern.suffix}`;

    return {
        files: bestGroup.map(p => p.file),
        pattern,
        start,
        end,
        step,
        totalFiles: bestGroup.length
    };
}
```

## 导入选项对话框

当检测到复杂文件结构时，系统会显示导入选项对话框：

### 1. 序列帧导入选项

- **作为序列导入**: 将图片序列作为一个素材项导入
- **作为独立文件导入**: 将每张图片作为独立素材导入

### 2. 文件夹导入选项

- **保持文件夹结构**: 在AE项目中保持原始文件夹结构
- **扁平化导入**: 将所有文件导入到同一文件夹中

### 3. 重复文件处理选项

- **跳过重复文件**: 不导入已在项目中的文件
- **覆盖现有文件**: 替换项目中的同名文件
- **保留两个版本**: 同时保留新旧文件

## 最佳实践

### 1. 大量素材处理

处理大量素材时建议：
- 使用文件夹拖拽功能批量导入
- 启用序列帧检测功能优化图片序列处理
- 合理设置导入模式避免文件重复

### 2. 项目组织

- 使用文件夹结构组织素材
- 为不同类型的素材创建不同的文件夹
- 定期清理项目中未使用的素材

### 3. 性能优化

- 避免同时拖拽过多文件
- 合理使用序列帧检测功能
- 定期重启AE释放内存资源

## 故障排除

### 拖拽无响应

如果拖拽操作无响应：
1. 检查扩展面板是否为当前激活窗口
2. 确认文件路径是否有效
3. 查看控制台错误日志

### 序列帧未正确识别

如果序列帧未被正确识别：
1. 检查文件命名是否符合序列帧规范
2. 确认文件格式是否支持
3. 手动选择"作为序列导入"选项

### 重复文件导入

如果出现重复文件导入：
1. 启用项目内文件检测功能
2. 检查导入模式设置
3. 手动选择跳过重复文件选项

## 高级技巧

### 1. 自定义序列帧模式

支持自定义序列帧命名模式：
- 标准模式: `frame_001.png, frame_002.png, ...`
- 自定义模式: `render_v1_001.jpg, render_v1_002.jpg, ...`

### 2. 批量操作优化

- 使用Shift键选择连续文件
- 使用Ctrl键选择不连续文件
- 拖拽前预览选中文件列表

### 3. 快捷键支持

- `Ctrl+A`: 全选文件
- `Delete`: 删除选中文件
- `Enter`: 确认导入操作

## 技术实现

### 拖拽悬浮选择导入行为实现

#### 概述
拖拽悬浮选择导入行为是 v2.5.0 版本新增的功能，通过实时检测鼠标位置并动态切换导入行为按钮的选中状态，为用户提供更灵活的导入方式选择。

#### 核心实现

**1. 拖拽事件监听器设置**
```javascript
// 在 setupDragAndDrop() 函数中设置拖拽监听
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 检测鼠标悬浮在哪个导入行为按钮上
    this.handleDragHoverBehaviorButton(e);
});

document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('dragleave', (e) => {
    // 当鼠标指针离开窗口时清理状态
    if (!e.relatedTarget) {
        // 可以在这里添加其他清理逻辑
    }
});

document.addEventListener('drop', this.handleFileDrop.bind(this));
```

**2. 鼠标位置检测函数**
```javascript
/**
 * 处理拖拽悬浮到导入行为按钮
 * @param {Event} event - 拖拽事件对象
 */
handleDragHoverBehaviorButton(event) {
    try {
        // 获取所有导入行为按钮
        const behaviorButtons = document.querySelectorAll('.import-behavior-button');

        // 检测鼠标位置是否在某个按钮上
        let hoveredButton = null;
        let hoveredIndex = -1;

        behaviorButtons.forEach((button, index) => {
            const rect = button.getBoundingClientRect();
            const isHovered = event.clientX >= rect.left && event.clientX <= rect.right &&
                             event.clientY >= rect.top && event.clientY <= rect.bottom;

            if (isHovered) {
                hoveredButton = button;
                hoveredIndex = index;
            }
        });

        if (hoveredButton) {
            // 先清除所有按钮的选中状态
            behaviorButtons.forEach(button => {
                const radio = button.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = false;
                }
            });

            // 选中当前悬浮的按钮
            const radio = hoveredButton.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                // 只更新按钮视觉效果
                this.updateModeButtonStyles();
            }
        }
    } catch (error) {
        this.log(`处理拖拽悬浮失败: ${error.message}`, 'error');
    }
}
```

#### 技术要点

**1. 性能优化**
- 使用 `getBoundingClientRect()` 获取按钮位置，避免重复查询
- 每次拖拽事件只处理一次鼠标位置检测
- 避免在拖拽过程中进行繁重的DOM操作

**2. 状态管理**
- 临时状态：拖拽过程中的选中状态是临时的
- 最终应用：释放文件时的选中状态被应用到导入操作
- 不影响设置：不会永久改变用户的导入行为设置

**3. 视觉反馈**
- 使用现有的高亮样式（橙色边框和文字）
- 实时响应鼠标移动
- 清晰的选中状态指示

**4. 兼容性处理**
- 与点击按钮选择方式完全兼容
- 不会影响预设管理和设置导出功能
- 支持多面板独立配置

#### 实现注意事项

**1. 避免状态冲突**
```javascript
// ❌ 错误做法：会根据内部设置重新覆盖选择
this.syncSettingsUI(); // 会根据内部设置重新覆盖我们的选择

// ✅ 正确做法：只更新视觉效果
this.updateModeButtonStyles(); // 只更新按钮的视觉样式
```

**2. 确保单选逻辑**
```javascript
// 先清除所有按钮的选中状态
behaviorButtons.forEach(button => {
    const radio = button.querySelector('input[type="radio"]');
    if (radio) {
        radio.checked = false;
    }
});

// 然后选中当前悬浮的按钮
const radio = hoveredButton.querySelector('input[type="radio"]');
if (radio) {
    radio.checked = true;
}
```

**3. 错误处理**
```javascript
try {
    // 处理拖拽悬浮逻辑
} catch (error) {
    // 捕获并记录错误，避免拖拽功能失效
    this.log(`处理拖拽悬浮失败: ${error.message}`, 'error');
}
```

#### 扩展性考虑

**1. 支持更多按钮类型**
```javascript
// 可以扩展为支持其他类型的按钮
const allButtons = document.querySelectorAll('.interactive-button');
allButtons.forEach(button => {
    // 统一处理所有交互按钮的悬浮逻辑
});
```

**2. 添加更多交互效果**
```javascript
// 可以添加更丰富的视觉效果
if (hoveredButton) {
    hoveredButton.classList.add('drag-hover');
    hoveredButton.classList.add('pulse-effect');
    // 添加更多动画效果
}
```

**3. 集成到其他功能**
```javascript
// 可以将此机制应用到其他需要选择的功能
function handleGenericHoverSelection(event, selector, callback) {
    const elements = document.querySelectorAll(selector);
    // 通用化的悬浮选择逻辑
    // ...
}
```

## 最佳实践

### 1. 代码组织
- 将拖拽相关的功能模块化
- 使用清晰的函数命名和注释
- 保持函数职责单一

### 2. 性能优化
- 避免在拖拽事件中进行复杂计算
- 使用防抖技术处理频繁事件
- 及时清理临时对象和状态

### 3. 用户体验
- 提供清晰的视觉反馈
- 保持操作的直观性和一致性
- 考虑不同用户的使用习惯

### 4. 测试覆盖
- 测试各种边界情况
- 验证不同屏幕尺寸的显示效果
- 确保跨浏览器兼容性