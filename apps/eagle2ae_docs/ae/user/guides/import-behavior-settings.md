# 导入行为设置

## 概述

导入行为设置（Import Behavior Settings）是 Eagle2Ae AE 扩展 v2.4.0 的重要功能模块，它决定了素材导入到 After Effects 后的行为方式。该设置支持多种导入行为选项，包括不导入合成、当前时间放置、时间轴开始放置等，为用户提供灵活的素材管理选项。

## 核心特性

### 多种导入行为选项
- **不导入合成** - 仅将素材导入到项目面板，不添加到时间轴
- **当前时间** - 将素材添加到时间轴当前时间指针位置
- **时间轴开始** - 将素材移至时间轴开始处（0秒位置）

### 智能行为管理
- 自动检测当前合成状态
- 根据导入模式智能调整行为选项
- 提供行为变更确认和回退机制

### 面板特定配置
- 每个面板实例拥有独立的导入行为设置
- 支持行为设置的导出和导入
- 提供行为设置的历史记录

### 实时状态反馈
- 实时显示当前导入行为
- 提供行为变更的视觉反馈
- 显示行为相关的设置说明

## 使用指南

### 导入行为详解

#### 不导入合成 (Do Not Import to Comp)
```javascript
// 不导入合成设置
const doNotImportSettings = {
    addToComposition: false,
    timelineOptions: {
        enabled: false,
        placement: 'current_time', // 此选项被禁用
        sequenceInterval: 1.0
    }
};
```

**特点**：
- 素材仅导入到项目面板，不会自动添加到时间轴
- 保持项目面板整洁，避免意外添加图层
- 提供最大的控制灵活性

**适用场景**：
- 需要手动选择导入时机和位置
- 批量导入大量素材但不立即使用
- 希望精确控制图层添加过程

**优势**：
- ✅ **最安全的模式**
- 防止意外添加图层到合成
- 保持时间轴清洁
- 提供最精确的控制

**注意事项**：
- ⚠️ 需要手动将素材拖拽到时间轴
- 可能需要更多操作步骤

#### 当前时间 (Current Time)
```javascript
// 当前时间放置设置
const currentTimeSettings = {
    addToComposition: true,
    timelineOptions: {
        enabled: true,
        placement: 'current_time',
        sequenceInterval: 1.0
    }
};
```

**特点**：
- 将素材添加到时间轴当前时间指针位置
- 与用户当前工作位置保持一致
- 提供直观的导入体验

**适用场景**：
- 需要在当前位置添加素材
- 与现有图层精确对齐
- 实时预览导入效果

**优势**：
- ✅ **最直观的模式**
- 与用户当前工作位置保持一致
- 提供实时预览效果
- 便于精确对齐

**注意事项**：
- ⚠️ 需要确保时间指针位置正确
- 可能在密集图层区域造成重叠

#### 时间轴开始 (Timeline Start)
```javascript
// 时间轴开始放置设置
const timelineStartSettings = {
    addToComposition: true,
    timelineOptions: {
        enabled: true,
        placement: 'timeline_start',
        sequenceInterval: 1.0
    }
};
```

**特点**：
- 将素材移至时间轴开始处（0秒位置）
- 提供统一的素材组织方式
- 便于批量管理和后续调整

**适用场景**：
- 需要统一组织导入的素材
- 批量导入后统一调整位置
- 希望素材从时间轴开始处排列

**优势**：
- ✅ **最有序的模式**
- 提供统一的素材组织方式
- 便于批量管理和调整
- 避免时间轴位置混乱

**注意事项**：
- ⚠️ 可能需要手动调整素材位置
- 在长时间轴项目中可能不易察觉

### 拖拽悬浮选择导入行为

#### 功能概述
Eagle2Ae AE 扩展 v2.5.0 引入了创新的拖拽悬浮选择导入行为功能，这是对传统导入行为选择方式的重大改进。该功能允许用户在拖拽文件的过程中，通过将鼠标悬浮到不同的导入行为按钮上来实时切换导入行为方式，极大提升了导入操作的灵活性和效率。

#### 技术实现

**鼠标位置检测**：
```javascript
/**
 * 处理拖拽悬浮到导入行为按钮
 * @param {Event} event - 拖拽事件
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

                // 只更新按钮视觉效果，不重新同步到内部设置
                this.updateModeButtonStyles();
            }
        }
    } catch (error) {
        this.log(`处理拖拽悬浮失败: ${error.message}`, 'error');
    }
}
```

**视觉反馈机制**：
- **按钮高亮**：使用现有的选中样式（橙色边框和文字）
- **状态保持**：选中状态会保持到释放文件
- **即时响应**：鼠标移动到不同按钮时立即切换选中状态
- **无干扰设计**：移除了拖拽时的弹窗提示

#### 使用场景

**快速切换不同导入需求**：
```
场景1: 批量导入但不立即使用
→ 拖拽时悬浮到"不导入合成"按钮

场景2: 导入到当前工作位置
→ 拖拽时悬浮到"当前时间"按钮

场景3: 统一组织导入的素材
→ 拖拽时悬浮到"时间轴开始"按钮

场景4: 为复杂项目创建预合成
→ 拖拽时悬浮到"创建预合成"按钮
```

**工作流程优化**：
1. **传统方式**：点击按钮选择行为 → 拖拽文件 → 释放文件
2. **新方式**：拖拽文件 → 悬浮选择行为 → 释放文件（一步完成）

#### 优势特点

**效率提升**：
- ✅ 减少操作步骤：从"选择→拖拽"简化为"拖拽→选择"
- ✅ 节省时间：无需预先设置，导入时动态选择
- ✅ 提升流畅度：操作更符合用户直觉

**灵活性增强**：
- ✅ 实时切换：拖拽过程中随时改变导入行为
- ✅ 视觉反馈：清晰的选中状态指示
- ✅ 撤销简单：移动鼠标到其他按钮即可切换

**用户体验改进**：
- ✅ 无弹窗干扰：移除了"拖拽文件到此处"提示
- ✅ 精确控制：在释放前最后一次悬浮决定最终行为
- ✅ 直观操作：所见即所得的交互方式

#### 技术细节

**事件处理机制**：
```javascript
// 拖拽事件监听器设置
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 检测鼠标悬浮在哪个导入行为按钮上
    this.handleDragHoverBehaviorButton(e);
});
```

**状态管理**：
- **临时状态**：拖拽过程中的选中状态是临时的
- **最终应用**：释放文件时的选中状态被应用到导入操作
- **不影响设置**：不会永久改变用户的导入行为设置

**兼容性处理**：
- 与点击按钮选择方式完全兼容
- 可以在拖拽前后使用传统方式选择
- 两种方式可以随意切换使用

#### 最佳实践

**使用建议**：
1. **熟练用户**：优先使用拖拽悬浮选择，提升效率
2. **批量操作**：对不同文件类型使用不同导入行为
3. **项目组织**：根据项目需求动态选择导入方式
4. **工作流程**：将此功能融入日常操作习惯

**常见使用模式**：
- **项目开始阶段**：使用"不导入合成"收集素材
- **制作阶段**：使用"当前时间"在特定位置导入
- **整理阶段**：使用"时间轴开始"统一组织素材
- **复杂项目**：使用"创建预合成"管理复杂图层

#### 注意事项

**使用限制**：
- 拖拽悬浮功能仅在拖拽文件时激活
- 必须在文件被拖拽到面板范围内才能使用
- 最终行为取决于释放文件时的鼠标位置

**兼容性说明**：
- 该功能与所有现有的导入行为完全兼容
- 不会影响预设管理和设置导出功能
- 支持多面板独立配置

**性能考虑**：
- 实时鼠标位置检测经过优化，不影响性能
- 按钮状态切换使用高效的DOM操作
- 不会造成内存泄漏或资源浪费

### 行为切换实现

#### 快速切换行为
```javascript
// 切换导入行为
function switchImportBehavior(newBehavior) {
    const settingsManager = window.settingsManager;
    
    if (!settingsManager) {
        console.error('设置管理器未初始化');
        return;
    }
    
    // 根据行为类型更新设置
    switch (newBehavior) {
        case 'no_import':
            // 不导入合成
            settingsManager.updateField('addToComposition', false, false);
            settingsManager.updateField('timelineOptions.enabled', false, false);
            break;
            
        case 'current_time':
            // 当前时间
            settingsManager.updateField('addToComposition', true, false);
            settingsManager.updateField('timelineOptions.enabled', true, false);
            settingsManager.updateField('timelineOptions.placement', 'current_time', false);
            break;
            
        case 'timeline_start':
            // 时间轴开始
            settingsManager.updateField('addToComposition', true, false);
            settingsManager.updateField('timelineOptions.enabled', true, false);
            settingsManager.updateField('timelineOptions.placement', 'timeline_start', false);
            break;
            
        default:
            console.warn(`未知的导入行为: ${newBehavior}`);
            return;
    }
    
    // 更新UI状态
    updateImportBehaviorUI(newBehavior);
    
    // 保存设置
    settingsManager.saveSettings(settingsManager.getSettings(), true);
    
    // 显示行为切换提示
    showBehaviorSwitchNotification(newBehavior);
    
    console.log(`✅ 导入行为已切换为: ${newBehavior}`, 'info');
}

// 更新导入行为UI
function updateImportBehaviorUI(behavior) {
    // 更新快速设置面板
    const behaviorRadios = document.querySelectorAll('input[name="import-behavior"]');
    behaviorRadios.forEach(radio => {
        radio.checked = (radio.value === behavior);
        
        // 添加视觉反馈
        const label = radio.closest('.import-behavior-button');
        if (label) {
            if (radio.checked) {
                label.classList.add('checked');
                label.classList.add('active');
            } else {
                label.classList.remove('checked');
                label.classList.remove('active');
            }
        }
    });
    
    // 更新高级设置面板
    const advancedBehaviorRadios = document.querySelectorAll('input[name="advanced-import-behavior"]');
    advancedBehaviorRadios.forEach(radio => {
        radio.checked = (radio.value === behavior);
        
        // 添加视觉反馈
        const label = radio.closest('.import-behavior-option');
        if (label) {
            if (radio.checked) {
                label.classList.add('checked');
                label.classList.add('active');
            } else {
                label.classList.remove('checked');
                label.classList.remove('active');
            }
        }
    });
    
    // 更新导入行为设置指南
    updateImportBehaviorGuide(behavior);
}
```

#### 导入行为设置指南更新
```javascript
// 更新导入行为设置指南
function updateImportBehaviorGuide(behavior) {
    const guideContainer = document.querySelector('.import-behavior-guide');
    if (!guideContainer) return;
    
    const behaviorDescriptions = {
        'no_import': {
            title: '不导入合成',
            description: '仅将素材导入到项目面板，不添加到时间轴',
            advantages: [
                '最安全的模式',
                '防止意外添加图层',
                '保持时间轴清洁',
                '提供最精确的控制'
            ],
            disadvantages: [
                '需要手动拖拽到时间轴',
                '可能需要更多操作步骤'
            ],
            recommendation: '推荐用于需要精确控制图层添加的场景'
        },
        'current_time': {
            title: '当前时间',
            description: '将素材添加到时间轴当前时间指针位置',
            advantages: [
                '最直观的模式',
                '与用户当前工作位置保持一致',
                '提供实时预览效果',
                '便于精确对齐'
            ],
            disadvantages: [
                '需要确保时间指针位置正确',
                '可能在密集图层区域造成重叠'
            ],
            recommendation: '推荐用于需要在当前位置添加素材的场景'
        },
        'timeline_start': {
            title: '时间轴开始',
            description: '将素材移至时间轴开始处（0秒位置）',
            advantages: [
                '最有序的模式',
                '提供统一的素材组织方式',
                '便于批量管理和调整',
                '避免时间轴位置混乱'
            ],
            disadvantages: [
                '可能需要手动调整素材位置',
                '在长时间轴项目中可能不易察觉'
            ],
            recommendation: '推荐用于需要统一组织导入素材的场景'
        }
    };
    
    const behaviorInfo = behaviorDescriptions[behavior] || behaviorDescriptions.no_import;
    
    guideContainer.innerHTML = `
        <div class="import-behavior-guide-content">
            <h4>${behaviorInfo.title}</h4>
            <p>${behaviorInfo.description}</p>
            
            <div class="guide-section">
                <h5>优势</h5>
                <ul>
                    ${behaviorInfo.advantages.map(adv => `<li>✅ ${adv}</li>`).join('')}
                </ul>
            </div>
            
            <div class="guide-section">
                <h5>劣势</h5>
                <ul>
                    ${behaviorInfo.disadvantages.map(dis => `<li>⚠️ ${dis}</li>`).join('')}
                </ul>
            </div>
            
            <div class="guide-section">
                <h5>推荐使用场景</h5>
                <p>${behaviorInfo.recommendation}</p>
            </div>
        </div>
    `;
}
```

### 高级行为设置

#### 序列帧间隔设置
```javascript
// 序列帧间隔设置
function updateSequenceInterval(interval) {
    const settingsManager = window.settingsManager;
    
    if (!settingsManager) {
        console.error('设置管理器未初始化');
        return;
    }
    
    // 验证间隔值
    const intervalValue = parseFloat(interval);
    if (isNaN(intervalValue) || intervalValue <= 0) {
        console.warn('无效的序列帧间隔值');
        return;
    }
    
    // 更新设置
    settingsManager.updateField('timelineOptions.sequenceInterval', intervalValue, false);
    
    // 保存设置
    settingsManager.saveSettings(settingsManager.getSettings(), true);
    
    console.log(`✅ 序列帧间隔已更新为: ${intervalValue}秒`, 'info');
}

// 序列帧间隔输入验证
function validateSequenceIntervalInput(inputElement) {
    const value = parseFloat(inputElement.value);
    
    if (isNaN(value) || value <= 0) {
        inputElement.setCustomValidity('序列帧间隔必须是大于0的数字');
        return false;
    }
    
    if (value > 10) {
        inputElement.setCustomValidity('序列帧间隔不应超过10秒');
        return false;
    }
    
    inputElement.setCustomValidity('');
    return true;
}
```

#### 时间轴放置位置设置
```javascript
// 时间轴放置位置设置
function updateTimelinePlacement(placement) {
    const settingsManager = window.settingsManager;
    
    if (!settingsManager) {
        console.error('设置管理器未初始化');
        return;
    }
    
    // 验证放置位置
    const validPlacements = ['current_time', 'timeline_start'];
    if (!validPlacements.includes(placement)) {
        console.warn(`无效的时间轴放置位置: ${placement}`);
        return;
    }
    
    // 更新设置
    settingsManager.updateField('timelineOptions.placement', placement, false);
    
    // 保存设置
    settingsManager.saveSettings(settingsManager.getSettings(), true);
    
    // 更新UI
    updateTimelinePlacementUI(placement);
    
    console.log(`✅ 时间轴放置位置已更新为: ${placement}`, 'info');
}

// 更新时间轴放置位置UI
function updateTimelinePlacementUI(placement) {
    const placementRadios = document.querySelectorAll('input[name="timeline-placement"]');
    placementRadios.forEach(radio => {
        radio.checked = (radio.value === placement);
        
        // 添加视觉反馈
        const label = radio.closest('.import-behavior-button');
        if (label) {
            if (radio.checked) {
                label.classList.add('checked');
                label.classList.add('active');
            } else {
                label.classList.remove('checked');
                label.classList.remove('active');
            }
        }
    });
}
```

## 技术实现

### 导入行为管理器

```javascript
/**
 * 导入行为管理器
 * 负责管理导入行为设置，支持快速切换和面板特定配置
 */
class ImportBehaviorManager {
    /**
     * 构造函数
     * @param {Object} settingsManager - 设置管理器
     * @param {Object} csInterface - CEP接口
     * @param {Function} logFunction - 日志函数
     */
    constructor(settingsManager, csInterface, logFunction) {
        this.settingsManager = settingsManager;
        this.csInterface = csInterface;
        this.log = logFunction || console.log;
        
        // 初始化状态
        this.currentBehavior = 'current_time';
        this.behaviorHistory = [];
        this.maxHistorySize = 10;
        
        // 绑定方法上下文
        this.switchBehavior = this.switchBehavior.bind(this);
        this.updateBehavior = this.updateBehavior.bind(this);
        this.validateBehavior = this.validateBehavior.bind(this);
        this.getBehaviorDescription = this.getBehaviorDescription.bind(this);
        this.getBehaviorAdvantages = this.getBehaviorAdvantages.bind(this);
        this.getBehaviorDisadvantages = this.getBehaviorDisadvantages.bind(this);
        this.getBehaviorRecommendation = this.getBehaviorRecommendation.bind(this);
        
        this.log('📥 导入行为管理器已初始化', 'debug');
    }
}
```

### 行为切换实现

```javascript
/**
 * 切换导入行为
 * @param {string} newBehavior - 新的导入行为
 * @param {boolean} save - 是否保存设置
 * @returns {Object} 切换结果
 */
switchBehavior(newBehavior, save = true) {
    try {
        // 验证新行为
        const validation = this.validateBehavior(newBehavior);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }
        
        // 获取当前行为
        const currentBehavior = this.settingsManager.getField('addToComposition') ? 
                               this.settingsManager.getField('timelineOptions.placement') || 'current_time' : 
                               'no_import';
        
        // 如果行为未变更，直接返回
        if (currentBehavior === newBehavior) {
            this.log(`📥 导入行为未变更: ${newBehavior}`, 'debug');
            return {
                success: true,
                behavior: newBehavior,
                changed: false
            };
        }
        
        // 根据行为类型更新设置
        let updateResults = [];
        
        switch (newBehavior) {
            case 'no_import':
                // 不导入合成
                updateResults.push(this.settingsManager.updateField('addToComposition', false, false));
                updateResults.push(this.settingsManager.updateField('timelineOptions.enabled', false, false));
                break;
                
            case 'current_time':
                // 当前时间
                updateResults.push(this.settingsManager.updateField('addToComposition', true, false));
                updateResults.push(this.settingsManager.updateField('timelineOptions.enabled', true, false));
                updateResults.push(this.settingsManager.updateField('timelineOptions.placement', 'current_time', false));
                break;
                
            case 'timeline_start':
                // 时间轴开始
                updateResults.push(this.settingsManager.updateField('addToComposition', true, false));
                updateResults.push(this.settingsManager.updateField('timelineOptions.enabled', true, false));
                updateResults.push(this.settingsManager.updateField('timelineOptions.placement', 'timeline_start', false));
                break;
                
            default:
                return {
                    success: false,
                    error: `未知的导入行为: ${newBehavior}`
                };
        }
        
        // 检查更新结果
        const failedUpdates = updateResults.filter(result => !result.success);
        if (failedUpdates.length > 0) {
            const firstError = failedUpdates[0].error || '设置更新失败';
            return {
                success: false,
                error: firstError
            };
        }
        
        // 更新当前行为
        this.currentBehavior = newBehavior;
        
        // 添加到历史记录
        this.addToBehaviorHistory(newBehavior);
        
        // 保存设置
        if (save) {
            const saveResult = this.settingsManager.saveSettings(
                this.settingsManager.getSettings(), 
                true
            );
            
            if (!saveResult.success) {
                return saveResult;
            }
        }
        
        // 触发行为变更事件
        this.emitBehaviorChange(currentBehavior, newBehavior);
        
        this.log(`📥 导入行为已切换: ${currentBehavior} -> ${newBehavior}`, 'info');
        
        return {
            success: true,
            behavior: newBehavior,
            changed: true,
            oldValue: currentBehavior,
            newValue: newBehavior
        };
        
    } catch (error) {
        this.log(`❌ 切换导入行为失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 更新导入行为
 * @param {string} newBehavior - 新的导入行为
 * @returns {Object} 更新结果
 */
updateBehavior(newBehavior) {
    try {
        // 验证新行为
        const validation = this.validateBehavior(newBehavior);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }
        
        // 获取当前行为
        const currentBehavior = this.settingsManager.getField('addToComposition') ? 
                               this.settingsManager.getField('timelineOptions.placement') || 'current_time' : 
                               'no_import';
        
        // 更新设置管理器
        let updateResult;
        
        switch (newBehavior) {
            case 'no_import':
                // 不导入合成
                updateResult = this.settingsManager.updateFields({
                    'addToComposition': false,
                    'timelineOptions.enabled': false
                }, false);
                break;
                
            case 'current_time':
                // 当前时间
                updateResult = this.settingsManager.updateFields({
                    'addToComposition': true,
                    'timelineOptions.enabled': true,
                    'timelineOptions.placement': 'current_time'
                }, false);
                break;
                
            case 'timeline_start':
                // 时间轴开始
                updateResult = this.settingsManager.updateFields({
                    'addToComposition': true,
                    'timelineOptions.enabled': true,
                    'timelineOptions.placement': 'timeline_start'
                }, false);
                break;
                
            default:
                return {
                    success: false,
                    error: `未知的导入行为: ${newBehavior}`
                };
        }
        
        if (!updateResult.success) {
            return updateResult;
        }
        
        // 更新当前行为
        this.currentBehavior = newBehavior;
        
        // 添加到历史记录
        this.addToBehaviorHistory(newBehavior);
        
        // 保存设置
        const saveResult = this.settingsManager.saveSettings(
            this.settingsManager.getSettings(), 
            true
        );
        
        if (!saveResult.success) {
            return saveResult;
        }
        
        // 触发行为变更事件
        this.emitBehaviorChange(currentBehavior, newBehavior);
        
        this.log(`📥 导入行为已更新: ${currentBehavior} -> ${newBehavior}`, 'info');
        
        return {
            success: true,
            behavior: newBehavior,
            changed: currentBehavior !== newBehavior,
            oldValue: currentBehavior,
            newValue: newBehavior
        };
        
    } catch (error) {
        this.log(`❌ 更新导入行为失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 验证导入行为
 * @param {string} behavior - 导入行为
 * @returns {Object} 验证结果
 */
validateBehavior(behavior) {
    try {
        if (!behavior || typeof behavior !== 'string') {
            return {
                valid: false,
                error: '导入行为必须是字符串'
            };
        }
        
        const validBehaviors = ['no_import', 'current_time', 'timeline_start'];
        if (!validBehaviors.includes(behavior)) {
            return {
                valid: false,
                error: `无效的导入行为: ${behavior}，必须是以下值之一: ${validBehaviors.join(', ')}`
            };
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `行为验证异常: ${error.message}`
        };
    }
}

/**
 * 添加到行为历史记录
 * @param {string} behavior - 导入行为
 */
addToBehaviorHistory(behavior) {
    try {
        // 移除已存在的相同行为
        this.behaviorHistory = this.behaviorHistory.filter(historyBehavior => historyBehavior !== behavior);
        
        // 添加到历史记录开头
        this.behaviorHistory.unshift(behavior);
        
        // 限制历史记录大小
        if (this.behaviorHistory.length > this.maxHistorySize) {
            this.behaviorHistory = this.behaviorHistory.slice(0, this.maxHistorySize);
        }
        
        // 保存到localStorage
        try {
            localStorage.setItem('ae_extension_behavior_history', JSON.stringify(this.behaviorHistory));
        } catch (storageError) {
            this.log(`⚠️ 无法保存行为历史记录: ${storageError.message}`, 'warning');
        }
        
        this.log(`📥 导入行为历史记录已更新: ${behavior}`, 'debug');
        
    } catch (error) {
        this.log(`添加行为历史记录失败: ${error.message}`, 'error');
    }
}

/**
 * 获取行为历史记录
 * @returns {Array} 行为历史记录
 */
getBehaviorHistory() {
    try {
        // 尝试从localStorage加载
        const savedHistory = localStorage.getItem('ae_extension_behavior_history');
        if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            if (Array.isArray(parsedHistory)) {
                this.behaviorHistory = parsedHistory;
                this.log(`📥 已从localStorage加载 ${parsedHistory.length} 个行为历史记录`, 'debug');
            }
        }
        
        return [...this.behaviorHistory];
        
    } catch (error) {
        this.log(`获取行为历史记录失败: ${error.message}`, 'error');
        return [];
    }
}

/**
 * 清除行为历史记录
 */
clearBehaviorHistory() {
    try {
        this.behaviorHistory = [];
        
        // 清除localStorage
        try {
            localStorage.removeItem('ae_extension_behavior_history');
        } catch (storageError) {
            this.log(`⚠️ 无法清除localStorage中的行为历史记录: ${storageError.message}`, 'warning');
        }
        
        this.log('📥 行为历史记录已清除', 'debug');
        
        // 触发历史记录变更事件
        this.emit('behaviorHistoryChanged', {
            history: [],
            cleared: true
        });
        
    } catch (error) {
        this.log(`清除行为历史记录失败: ${error.message}`, 'error');
    }
}
```

### 行为描述实现

```javascript
/**
 * 获取导入行为描述
 * @param {string} behavior - 导入行为
 * @returns {string} 行为描述
 */
getBehaviorDescription(behavior) {
    const descriptions = {
        'no_import': '仅将素材导入到项目面板，不添加到时间轴',
        'current_time': '将素材添加到时间轴当前时间指针位置',
        'timeline_start': '将素材移至时间轴开始处（0秒位置）'
    };
    
    return descriptions[behavior] || '未知导入行为';
}

/**
 * 获取导入行为优势
 * @param {string} behavior - 导入行为
 * @returns {Array} 优势列表
 */
getBehaviorAdvantages(behavior) {
    const advantages = {
        'no_import': [
            '最安全的模式',
            '防止意外添加图层',
            '保持时间轴清洁',
            '提供最精确的控制'
        ],
        'current_time': [
            '最直观的模式',
            '与用户当前工作位置保持一致',
            '提供实时预览效果',
            '便于精确对齐'
        ],
        'timeline_start': [
            '最有序的模式',
            '提供统一的素材组织方式',
            '便于批量管理和调整',
            '避免时间轴位置混乱'
        ]
    };
    
    return advantages[behavior] || [];
}

/**
 * 获取导入行为劣势
 * @param {string} behavior - 导入行为
 * @returns {Array} 劣势列表
 */
getBehaviorDisadvantages(behavior) {
    const disadvantages = {
        'no_import': [
            '需要手动拖拽到时间轴',
            '可能需要更多操作步骤'
        ],
        'current_time': [
            '需要确保时间指针位置正确',
            '可能在密集图层区域造成重叠'
        ],
        'timeline_start': [
            '可能需要手动调整素材位置',
            '在长时间轴项目中可能不易察觉'
        ]
    };
    
    return disadvantages[behavior] || [];
}

/**
 * 获取导入行为推荐使用场景
 * @param {string} behavior - 导入行为
 * @returns {string} 推荐使用场景
 */
getBehaviorRecommendation(behavior) {
    const recommendations = {
        'no_import': '推荐用于需要精确控制图层添加的场景',
        'current_time': '推荐用于需要在当前位置添加素材的场景',
        'timeline_start': '推荐用于需要统一组织导入素材的场景'
    };
    
    return recommendations[behavior] || '请根据具体需求选择合适的导入行为';
}
```

### 行为变更事件实现

```javascript
/**
 * 触发行为变更事件
 * @param {string} oldBehavior - 旧行为
 * @param {string} newBehavior - 新行为
 */
emitBehaviorChange(oldBehavior, newBehavior) {
    try {
        // 触发自定义事件
        const event = new CustomEvent('importBehaviorChange', {
            detail: {
                oldBehavior: oldBehavior,
                newBehavior: newBehavior,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
        
        // 触发通用变更事件
        this.emit('behaviorChange', {
            oldBehavior: oldBehavior,
            newBehavior: newBehavior,
            timestamp: Date.now()
        });
        
        this.log(`🔊 导入行为变更事件已触发: ${oldBehavior} -> ${newBehavior}`, 'debug');
        
    } catch (error) {
        this.log(`触发行为变更事件失败: ${error.message}`, 'error');
    }
}

/**
 * 添加行为变更监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addBehaviorChangeListener(listener) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }
        
        // 添加到变更监听器列表
        this.changeListeners.push(listener);
        
        this.log('👂 已添加导入行为变更监听器', 'debug');
        
        // 返回移除监听器的函数
        return () => {
            this.removeBehaviorChangeListener(listener);
        };
        
    } catch (error) {
        this.log(`添加行为变更监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数以防调用错误
    }
}

/**
 * 移除行为变更监听器
 * @param {Function} listener - 监听器函数
 */
removeBehaviorChangeListener(listener) {
    try {
        const index = this.changeListeners.indexOf(listener);
        if (index !== -1) {
            this.changeListeners.splice(index, 1);
            this.log('👂 已移除导入行为变更监听器', 'debug');
        }
        
    } catch (error) {
        this.log(`移除行为变更监听器失败: ${error.message}`, 'error');
    }
}
```

### UI更新实现

```javascript
/**
 * 更新导入行为UI
 * @param {string} behavior - 导入行为
 */
updateImportBehaviorUI(behavior) {
    try {
        // 更新快速设置面板
        this.updateQuickSettingsBehaviorUI(behavior);
        
        // 更新高级设置面板
        this.updateAdvancedSettingsBehaviorUI(behavior);
        
        // 更新导入行为设置指南
        this.updateImportBehaviorGuide(behavior);
        
        // 更新状态显示
        this.updateBehaviorStatusDisplay(behavior);
        
        this.log(`🔄 导入行为UI已更新: ${behavior}`, 'debug');
        
    } catch (error) {
        this.log(`更新导入行为UI失败: ${error.message}`, 'error');
    }
}

/**
 * 更新快速设置面板的行为UI
 * @param {string} behavior - 导入行为
 */
updateQuickSettingsBehaviorUI(behavior) {
    try {
        // 更新快速设置行为单选按钮
        const behaviorButtons = document.querySelectorAll('.import-behavior-button input[type="radio"]');
        behaviorButtons.forEach(button => {
            const buttonValue = button.value;
            const isChecked = buttonValue === behavior;
            
            button.checked = isChecked;
            
            // 更新按钮样式
            const label = button.closest('.import-behavior-button');
            if (label) {
                if (isChecked) {
                    label.classList.add('checked');
                    label.classList.add('active');
                } else {
                    label.classList.remove('checked');
                    label.classList.remove('active');
                }
            }
        });
        
        this.log(`🔄 快速设置面板行为UI已更新: ${behavior}`, 'debug');
        
    } catch (error) {
        this.log(`更新快速设置面板行为UI失败: ${error.message}`, 'error');
    }
}

/**
 * 更新高级设置面板的行为UI
 * @param {string} behavior - 导入行为
 */
updateAdvancedSettingsBehaviorUI(behavior) {
    try {
        // 更新高级设置行为单选按钮
        const behaviorOptions = document.querySelectorAll('.import-behavior-option input[type="radio"]');
        behaviorOptions.forEach(option => {
            const optionValue = option.value;
            const isChecked = optionValue === behavior;
            
            option.checked = isChecked;
            
            // 更新选项样式
            const label = option.closest('.import-behavior-option');
            if (label) {
                if (isChecked) {
                    label.classList.add('checked');
                    label.classList.add('active');
                } else {
                    label.classList.remove('checked');
                    label.classList.remove('active');
                }
            }
        });
        
        // 根据行为更新相关UI元素的显示状态
        this.updateBehaviorSpecificUI(behavior);
        
        this.log(`🔄 高级设置面板行为UI已更新: ${behavior}`, 'debug');
        
    } catch (error) {
        this.log(`更新高级设置面板行为UI失败: ${error.message}`, 'error');
    }
}

/**
 * 更新行为特定UI元素
 * @param {string} behavior - 导入行为
 */
updateBehaviorSpecificUI(behavior) {
    try {
        // 根据行为显示/隐藏相关设置
        const timelineOptions = document.getElementById('timeline-options');
        const addToComposition = document.getElementById('add-to-composition');
        
        if (timelineOptions && addToComposition) {
            const isChecked = addToComposition.checked;
            timelineOptions.style.opacity = isChecked ? '1' : '0.5';
            
            const timelineInputs = timelineOptions.querySelectorAll('input, select');
            timelineInputs.forEach(input => {
                input.disabled = !isChecked;
            });
        }
        
        // 更新行为描述
        this.updateBehaviorDescription(behavior);
        
        this.log(`🔄 行为特定UI已更新: ${behavior}`, 'debug');
        
    } catch (error) {
        this.log(`更新行为特定UI失败: ${error.message}`, 'error');
    }
}

/**
 * 更新行为描述
 * @param {string} behavior - 导入行为
 */
updateBehaviorDescription(behavior) {
    try {
        const descriptionElement = document.getElementById('import-behavior-description');
        if (!descriptionElement) return;
        
        const behaviorInfo = {
            'no_import': {
                title: '不导入合成',
                description: '仅将素材导入到项目面板，不添加到时间轴',
                icon: '🚫'
            },
            'current_time': {
                title: '当前时间',
                description: '将素材添加到时间轴当前时间指针位置',
                icon: '🕒'
            },
            'timeline_start': {
                title: '时间轴开始',
                description: '将素材移至时间轴开始处（0秒位置）',
                icon: '🎬'
            }
        }[behavior] || {
            title: '未知行为',
            description: '未知的导入行为',
            icon: '❓'
        };
        
        descriptionElement.innerHTML = `
            <div class="behavior-description-content">
                <span class="behavior-icon">${behaviorInfo.icon}</span>
                <div class="behavior-info">
                    <div class="behavior-title">${behaviorInfo.title}</div>
                    <div class="behavior-desc">${behaviorInfo.description}</div>
                </div>
            </div>
        `;
        
        this.log(`🔄 行为描述已更新: ${behavior}`, 'debug');
        
    } catch (error) {
        this.log(`更新行为描述失败: ${error.message}`, 'error');
    }
}
```

### 导入行为指南实现

```javascript
/**
 * 更新导入行为指南
 * @param {string} behavior - 导入行为
 */
updateImportBehaviorGuide(behavior) {
    try {
        const guideContainer = document.querySelector('.import-behavior-guide');
        if (!guideContainer) return;
        
        const behaviorDescriptions = {
            'no_import': {
                title: '不导入合成',
                description: '仅将素材导入到项目面板，不添加到时间轴',
                advantages: [
                    '最安全的模式',
                    '防止意外添加图层',
                    '保持时间轴清洁',
                    '提供最精确的控制'
                ],
                disadvantages: [
                    '需要手动拖拽到时间轴',
                    '可能需要更多操作步骤'
                ],
                recommendation: '推荐用于需要精确控制图层添加的场景',
                useCases: [
                    '批量导入大量素材但不立即使用',
                    '需要手动选择导入时机和位置',
                    '希望精确控制图层添加过程'
                ]
            },
            'current_time': {
                title: '当前时间',
                description: '将素材添加到时间轴当前时间指针位置',
                advantages: [
                    '最直观的模式',
                    '与用户当前工作位置保持一致',
                    '提供实时预览效果',
                    '便于精确对齐'
                ],
                disadvantages: [
                    '需要确保时间指针位置正确',
                    '可能在密集图层区域造成重叠'
                ],
                recommendation: '推荐用于需要在当前位置添加素材的场景',
                useCases: [
                    '需要在当前位置添加素材',
                    '与现有图层精确对齐',
                    '实时预览导入效果'
                ]
            },
            'timeline_start': {
                title: '时间轴开始',
                description: '将素材移至时间轴开始处（0秒位置）',
                advantages: [
                    '最有序的模式',
                    '提供统一的素材组织方式',
                    '便于批量管理和调整',
                    '避免时间轴位置混乱'
                ],
                disadvantages: [
                    '可能需要手动调整素材位置',
                    '在长时间轴项目中可能不易察觉'
                ],
                recommendation: '推荐用于需要统一组织导入素材的场景',
                useCases: [
                    '需要统一组织导入的素材',
                    '批量导入后统一调整位置',
                    '希望素材从时间轴开始处排列'
                ]
            }
        };
        
        const behaviorInfo = behaviorDescriptions[behavior] || behaviorDescriptions.no_import;
        
        guideContainer.innerHTML = `
            <div class="import-behavior-guide-content">
                <h4>${behaviorInfo.title}</h4>
                <p>${behaviorInfo.description}</p>
                
                <div class="guide-section">
                    <h5>优势</h5>
                    <ul>
                        ${behaviorInfo.advantages.map(adv => `<li>✅ ${adv}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guide-section">
                    <h5>劣势</h5>
                    <ul>
                        ${behaviorInfo.disadvantages.map(dis => `<li>⚠️ ${dis}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guide-section">
                    <h5>推荐使用场景</h5>
                    <p>${behaviorInfo.recommendation}</p>
                </div>
                
                <div class="guide-section">
                    <h5>典型应用案例</h5>
                    <ul>
                        ${behaviorInfo.useCases.map(useCase => `<li>📌 ${useCase}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        this.log(`🔄 导入行为指南已更新: ${behavior}`, 'debug');
        
    } catch (error) {
        this.log(`更新导入行为指南失败: ${error.message}`, 'error');
    }
}
```

## API参考

### 核心方法

#### ImportBehaviorManager
导入行为管理器主类

```javascript
/**
 * 导入行为管理器
 * 负责管理导入行为设置，支持快速切换和面板特定配置
 */
class ImportBehaviorManager
```

#### constructor()
构造函数

```javascript
/**
 * 构造函数
 * @param {Object} settingsManager - 设置管理器
 * @param {Object} csInterface - CEP接口
 * @param {Function} logFunction - 日志函数
 */
constructor(settingsManager, csInterface, logFunction)
```

#### switchBehavior()
切换导入行为

```javascript
/**
 * 切换导入行为
 * @param {string} newBehavior - 新的导入行为
 * @param {boolean} save - 是否保存设置
 * @returns {Object} 切换结果
 */
switchBehavior(newBehavior, save = true)
```

#### updateBehavior()
更新导入行为

```javascript
/**
 * 更新导入行为
 * @param {string} newBehavior - 新的导入行为
 * @returns {Object} 更新结果
 */
updateBehavior(newBehavior)
```

#### validateBehavior()
验证导入行为

```javascript
/**
 * 验证导入行为
 * @param {string} behavior - 导入行为
 * @returns {Object} 验证结果
 */
validateBehavior(behavior)
```

#### getBehaviorDescription()
获取导入行为描述

```javascript
/**
 * 获取导入行为描述
 * @param {string} behavior - 导入行为
 * @returns {string} 行为描述
 */
getBehaviorDescription(behavior)
```

#### getBehaviorAdvantages()
获取导入行为优势

```javascript
/**
 * 获取导入行为优势
 * @param {string} behavior - 导入行为
 * @returns {Array} 优势列表
 */
getBehaviorAdvantages(behavior)
```

#### getBehaviorDisadvantages()
获取导入行为劣势

```javascript
/**
 * 获取导入行为劣势
 * @param {string} behavior - 导入行为
 * @returns {Array} 劣势列表
 */
getBehaviorDisadvantages(behavior)
```

#### getBehaviorRecommendation()
获取导入行为推荐使用场景

```javascript
/**
 * 获取导入行为推荐使用场景
 * @param {string} behavior - 导入行为
 * @returns {string} 推荐使用场景
 */
getBehaviorRecommendation(behavior)
```

#### addToBehaviorHistory()
添加到行为历史记录

```javascript
/**
 * 添加到行为历史记录
 * @param {string} behavior - 导入行为
 */
addToBehaviorHistory(behavior)
```

#### getBehaviorHistory()
获取行为历史记录

```javascript
/**
 * 获取行为历史记录
 * @returns {Array} 行为历史记录
 */
getBehaviorHistory()
```

#### clearBehaviorHistory()
清除行为历史记录

```javascript
/**
 * 清除行为历史记录
 */
clearBehaviorHistory()
```

#### emitBehaviorChange()
触发行为变更事件

```javascript
/**
 * 触发行为变更事件
 * @param {string} oldBehavior - 旧行为
 * @param {string} newBehavior - 新行为
 */
emitBehaviorChange(oldBehavior, newBehavior)
```

#### addBehaviorChangeListener()
添加行为变更监听器

```javascript
/**
 * 添加行为变更监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addBehaviorChangeListener(listener)
```

#### removeBehaviorChangeListener()
移除行为变更监听器

```javascript
/**
 * 移除行为变更监听器
 * @param {Function} listener - 监听器函数
 */
removeBehaviorChangeListener(listener)
```

#### updateImportBehaviorUI()
更新导入行为UI

```javascript
/**
 * 更新导入行为UI
 * @param {string} behavior - 导入行为
 */
updateImportBehaviorUI(behavior)
```

#### updateQuickSettingsBehaviorUI()
更新快速设置面板的行为UI

```javascript
/**
 * 更新快速设置面板的行为UI
 * @param {string} behavior - 导入行为
 */
updateQuickSettingsBehaviorUI(behavior)
```

#### updateAdvancedSettingsBehaviorUI()
更新高级设置面板的行为UI

```javascript
/**
 * 更新高级设置面板的行为UI
 * @param {string} behavior - 导入行为
 */
updateAdvancedSettingsBehaviorUI(behavior)
```

#### updateBehaviorSpecificUI()
更新行为特定UI元素

```javascript
/**
 * 更新行为特定UI元素
 * @param {string} behavior - 导入行为
 */
updateBehaviorSpecificUI(behavior)
```

#### updateBehaviorDescription()
更新行为描述

```javascript
/**
 * 更新行为描述
 * @param {string} behavior - 导入行为
 */
updateBehaviorDescription(behavior)
```

#### updateImportBehaviorGuide()
更新导入行为指南

```javascript
/**
 * 更新导入行为指南
 * @param {string} behavior - 导入行为
 */
updateImportBehaviorGuide(behavior)
```

## 使用示例

### 基本使用

#### 切换导入行为
```javascript
// 创建导入行为管理器实例
const importBehaviorManager = new ImportBehaviorManager(settingsManager, csInterface, logFunction);

// 切换到不导入合成模式
const noImportResult = importBehaviorManager.switchBehavior('no_import');
if (noImportResult.success) {
    console.log('✅ 已切换到不导入合成模式');
} else {
    console.error(`❌ 切换失败: ${noImportResult.error}`);
}

// 切换到当前时间模式
const currentTimeResult = importBehaviorManager.switchBehavior('current_time');
if (currentTimeResult.success) {
    console.log('✅ 已切换到当前时间模式');
} else {
    console.error(`❌ 切换失败: ${currentTimeResult.error}`);
}

// 切换到时间轴开始模式
const timelineStartResult = importBehaviorManager.switchBehavior('timeline_start');
if (timelineStartResult.success) {
    console.log('✅ 已切换到时间轴开始模式');
} else {
    console.error(`❌ 切换失败: ${timelineStartResult.error}`);
}
```

#### 获取行为信息
```javascript
// 获取当前导入行为
const addToComposition = importBehaviorManager.settingsManager.getField('addToComposition');
const timelinePlacement = importBehaviorManager.settingsManager.getField('timelineOptions.placement');
const currentBehavior = addToComposition ? timelinePlacement || 'current_time' : 'no_import';

console.log(`当前导入行为: ${currentBehavior}`);

// 获取行为描述
const behaviorDescription = importBehaviorManager.getBehaviorDescription(currentBehavior);
console.log(`行为描述: ${behaviorDescription}`);

// 获取行为优势
const behaviorAdvantages = importBehaviorManager.getBehaviorAdvantages(currentBehavior);
console.log(`行为优势:`, behaviorAdvantages);

// 获取行为劣势
const behaviorDisadvantages = importBehaviorManager.getBehaviorDisadvantages(currentBehavior);
console.log(`行为劣势:`, behaviorDisadvantages);

// 获取行为推荐使用场景
const behaviorRecommendation = importBehaviorManager.getBehaviorRecommendation(currentBehavior);
console.log(`推荐使用场景: ${behaviorRecommendation}`);
```

#### 监听行为变更
```javascript
// 添加行为变更监听器
const removeListener = importBehaviorManager.addBehaviorChangeListener((event) => {
    const { oldBehavior, newBehavior, timestamp } = event.detail;
    console.log(`📥 导入行为变更: ${oldBehavior} -> ${newBehavior}`);
    
    // 根据新行为更新UI
    importBehaviorManager.updateImportBehaviorUI(newBehavior);
});

// 使用完成后移除监听器
// removeListener();

// 也可以监听自定义事件
document.addEventListener('importBehaviorChange', (event) => {
    const { oldBehavior, newBehavior, timestamp } = event.detail;
    console.log(`📥 导入行为变更事件: ${oldBehavior} -> ${newBehavior}`);
});
```

### 高级使用

#### 批量行为操作
```javascript
// 批量切换导入行为
async function batchSwitchBehaviors(behaviors) {
    const results = [];
    
    for (const behavior of behaviors) {
        try {
            const result = await importBehaviorManager.switchBehavior(behavior);
            results.push({
                behavior: behavior,
                success: result.success,
                error: result.error
            });
            
            // 添加延迟避免过快切换
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            results.push({
                behavior: behavior,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

// 使用示例
const behaviors = ['no_import', 'current_time', 'timeline_start'];
const batchResults = await batchSwitchBehaviors(behaviors);
console.log('批量行为切换结果:', batchResults);
```

#### 行为历史记录
```javascript
// 获取行为历史记录
const behaviorHistory = importBehaviorManager.getBehaviorHistory();
console.log('导入行为历史记录:', behaviorHistory);

// 清除行为历史记录
importBehaviorManager.clearBehaviorHistory();
console.log('行为历史记录已清除');

// 添加自定义行为历史记录
importBehaviorManager.addToBehaviorHistory('current_time');
importBehaviorManager.addToBehaviorHistory('timeline_start');
importBehaviorManager.addToBehaviorHistory('no_import');

const updatedHistory = importBehaviorManager.getBehaviorHistory();
console.log('更新后的行为历史记录:', updatedHistory);
```

#### 行为验证
```javascript
// 验证导入行为
const validation = importBehaviorManager.validateBehavior('current_time');
if (validation.valid) {
    console.log('✅ 导入行为验证通过');
} else {
    console.error(`❌ 导入行为验证失败: ${validation.error}`);
}

// 验证无效行为
const invalidValidation = importBehaviorManager.validateBehavior('invalid_behavior');
if (!invalidValidation.valid) {
    console.error(`❌ 无效行为验证失败: ${invalidValidation.error}`);
}
```

#### 自定义行为描述
```javascript
// 扩展行为描述
importBehaviorManager.getBehaviorDescription = function(behavior) {
    const customDescriptions = {
        'no_import': '🚫 不导入合成模式 - 仅导入到项目面板',
        'current_time': '🕒 当前时间模式 - 在时间轴当前指针位置导入',
        'timeline_start': '🎬 时间轴开始模式 - 在时间轴起始位置导入'
    };
    
    return customDescriptions[behavior] || this.constructor.prototype.getBehaviorDescription.call(this, behavior);
};

// 获取自定义行为描述
const customDescription = importBehaviorManager.getBehaviorDescription('current_time');
console.log('自定义行为描述:', customDescription);
```

## 最佳实践

### 使用建议

#### 行为选择策略
```javascript
// 根据工作场景选择合适的导入行为
function recommendImportBehavior(workScenario) {
    const recommendations = {
        'precision_work': 'no_import',      // 精确工作场景使用不导入合成
        'real_time_preview': 'current_time', // 实时预览场景使用当前时间
        'bulk_import': 'timeline_start',    // 批量导入场景使用时间轴开始
        'demo': 'current_time',             // 演示场景使用当前时间
        'training': 'no_import'             // 培训场景使用不导入合成
    };
    
    return recommendations[workScenario] || 'current_time';
}

// 使用示例
const recommendedBehavior = recommendImportBehavior('precision_work');
console.log(`推荐的导入行为: ${recommendedBehavior}`);
```

#### 批量操作优化
```javascript
// 使用防抖避免频繁行为切换
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 防抖处理行为切换
const debouncedBehaviorSwitch = debounce((newBehavior) => {
    importBehaviorManager.switchBehavior(newBehavior);
}, 300);

// 绑定到UI事件
document.querySelectorAll('.behavior-button input[type="radio"]').forEach(button => {
    button.addEventListener('change', (e) => {
        if (e.target.checked) {
            debouncedBehaviorSwitch(e.target.value);
        }
    });
});
```

#### 错误处理
```javascript
// 完善的错误处理
async function safeSwitchBehavior(newBehavior) {
    try {
        const result = await importBehaviorManager.switchBehavior(newBehavior);
        
        if (result.success) {
            console.log(`✅ 导入行为已切换为: ${newBehavior}`);
            
            // 显示成功提示
            showNotification(`导入行为已切换为: ${importBehaviorManager.getBehaviorDescription(newBehavior)}`, 'success');
            
            return result;
        } else {
            const errorMsg = result.error || '未知错误';
            console.error(`❌ 切换导入行为失败: ${errorMsg}`);
            
            // 显示错误提示
            showNotification(`切换导入行为失败: ${errorMsg}`, 'error');
            
            return result;
        }
        
    } catch (error) {
        console.error(`💥 切换导入行为异常: ${error.message}`);
        
        // 记录详细错误日志
        importBehaviorManager.log(`切换导入行为异常: ${error.message}`, 'error');
        importBehaviorManager.log(`异常堆栈: ${error.stack}`, 'debug');
        
        // 显示错误提示
        showNotification(`切换导入行为异常: ${error.message}`, 'error');
        
        throw error;
    }
}
```

### 性能优化

#### 缓存机制
```javascript
// 实现行为信息缓存
class CachedImportBehaviorManager extends ImportBehaviorManager {
    constructor(settingsManager, csInterface, logFunction) {
        super(settingsManager, csInterface, logFunction);
        this.behaviorCache = new Map();
        this.cacheTimeouts = new Map();
    }
    
    /**
     * 获取缓存的行为信息
     * @param {string} behavior - 导入行为
     * @param {string} infoType - 信息类型
     * @returns {any} 缓存的信息或null
     */
    getCachedBehaviorInfo(behavior, infoType) {
        const cacheKey = `${behavior}_${infoType}`;
        const cached = this.behaviorCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < 30000) { // 30秒缓存
            return cached.data;
        }
        
        return null;
    }
    
    /**
     * 缓存行为信息
     * @param {string} behavior - 导入行为
     * @param {string} infoType - 信息类型
     * @param {any} data - 数据
     */
    cacheBehaviorInfo(behavior, infoType, data) {
        const cacheKey = `${behavior}_${infoType}`;
        
        // 添加到缓存
        this.behaviorCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        // 设置缓存清理定时器
        if (this.cacheTimeouts.has(cacheKey)) {
            clearTimeout(this.cacheTimeouts.get(cacheKey));
        }
        
        const timeoutId = setTimeout(() => {
            this.behaviorCache.delete(cacheKey);
            this.cacheTimeouts.delete(cacheKey);
        }, 30000); // 30秒后清理
        
        this.cacheTimeouts.set(cacheKey, timeoutId);
    }
    
    /**
     * 获取行为描述（带缓存）
     * @param {string} behavior - 导入行为
     * @returns {string} 行为描述
     */
    getBehaviorDescription(behavior) {
        const cached = this.getCachedBehaviorInfo(behavior, 'description');
        if (cached) {
            return cached;
        }
        
        const description = super.getBehaviorDescription(behavior);
        this.cacheBehaviorInfo(behavior, 'description', description);
        
        return description;
    }
    
    /**
     * 获取行为优势（带缓存）
     * @param {string} behavior - 导入行为
     * @returns {Array} 优势列表
     */
    getBehaviorAdvantages(behavior) {
        const cached = this.getCachedBehaviorInfo(behavior, 'advantages');
        if (cached) {
            return cached;
        }
        
        const advantages = super.getBehaviorAdvantages(behavior);
        this.cacheBehaviorInfo(behavior, 'advantages', advantages);
        
        return advantages;
    }
    
    /**
     * 获取行为劣势（带缓存）
     * @param {string} behavior - 导入行为
     * @returns {Array} 劣势列表
     */
    getBehaviorDisadvantages(behavior) {
        const cached = this.getCachedBehaviorInfo(behavior, 'disadvantages');
        if (cached) {
            return cached;
        }
        
        const disadvantages = super.getBehaviorDisadvantages(behavior);
        this.cacheBehaviorInfo(behavior, 'disadvantages', disadvantages);
        
        return disadvantages;
    }
    
    /**
     * 获取行为推荐使用场景（带缓存）
     * @param {string} behavior - 导入行为
     * @returns {string} 推荐使用场景
     */
    getBehaviorRecommendation(behavior) {
        const cached = this.getCachedBehaviorInfo(behavior, 'recommendation');
        if (cached) {
            return cached;
        }
        
        const recommendation = super.getBehaviorRecommendation(behavior);
        this.cacheBehaviorInfo(behavior, 'recommendation', recommendation);
        
        return recommendation;
    }
}
```

#### 内存管理
```javascript
// 及时清理资源
function cleanupImportBehaviorManager() {
    // 移除所有行为变更监听器
    importBehaviorManager.changeListeners = [];
    
    // 清理字段监听器
    importBehaviorManager.fieldListeners.clear();
    
    // 清理验证器
    importBehaviorManager.validators.clear();
    
    // 清理迁移规则
    importBehaviorManager.migrations.clear();
    
    // 清理行为历史记录
    importBehaviorManager.behaviorHistory = [];
    
    // 清理缓存
    if (importBehaviorManager.behaviorCache) {
        importBehaviorManager.behaviorCache.clear();
    }
    
    if (importBehaviorManager.cacheTimeouts) {
        importBehaviorManager.cacheTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        importBehaviorManager.cacheTimeouts.clear();
    }
    
    importBehaviorManager.log('📥 导入行为管理器资源已清理', 'debug');
}

// 在组件销毁时调用
window.addEventListener('beforeunload', cleanupImportBehaviorManager);
```

## 故障排除

### 常见问题

#### 行为切换无响应
- **症状**：点击行为按钮后无任何反应
- **解决**：
  1. 检查导入行为管理器是否正确初始化
  2. 验证单选按钮事件监听器是否正确绑定
  3. 查看控制台错误日志

#### 行为描述未更新
- **症状**：切换行为后描述信息未变化
- **解决**：
  1. 检查行为描述元素是否存在
  2. 验证updateBehaviorDescription方法是否正确执行
  3. 查看CSS样式是否正确应用

#### 设置未保存
- **症状**：行为切换后刷新页面发现设置未保存
- **解决**：
  1. 检查localStorage权限
  2. 验证设置保存逻辑
  3. 查看控制台错误日志

#### 行为历史记录异常
- **症状**：行为历史记录不更新或显示错误
- **解决**：
  1. 检查localStorage保存逻辑
  2. 验证行为历史记录更新机制
  3. 重启AE和扩展面板

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控行为变更事件
importBehaviorManager.addBehaviorChangeListener((event) => {
    const { oldBehavior, newBehavior, timestamp } = event.detail;
    console.log(`📥 导入行为变更: ${oldBehavior} -> ${newBehavior} (${timestamp})`);
});

// 监控字段变更事件
importBehaviorManager.addFieldListener('addToComposition', (newValue, oldValue, fieldPath) => {
    console.log(`⚙️ 字段变更: ${fieldPath} ${oldValue} -> ${newValue}`);
});

importBehaviorManager.addFieldListener('timelineOptions.placement', (newValue, oldValue, fieldPath) => {
    console.log(`⚙️ 字段变更: ${fieldPath} ${oldValue} -> ${newValue}`);
});
```

#### 性能监控
```javascript
// 记录行为切换性能
const startTime = performance.now();
const result = importBehaviorManager.switchBehavior('current_time');
const endTime = performance.now();

console.log(`⏱️ 行为切换耗时: ${endTime - startTime}ms`);

// 分析内存使用
if (performance.memory) {
    console.log('🧠 内存使用情况:', {
        used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
    });
}
```

#### 缓存状态检查
```javascript
// 检查缓存状态
function inspectBehaviorCache() {
    if (importBehaviorManager.behaviorCache) {
        console.log('📥 行为缓存状态:', {
            size: importBehaviorManager.behaviorCache.size,
            entries: Array.from(importBehaviorManager.behaviorCache.entries()).map(([key, value]) => ({
                key: key,
                age: Date.now() - value.timestamp,
                data: value.data
            }))
        });
    }
    
    if (importBehaviorManager.cacheTimeouts) {
        console.log('⏰ 缓存定时器数量:', importBehaviorManager.cacheTimeouts.size);
    }
}

// 定期检查缓存状态
setInterval(inspectBehaviorCache, 30000); // 每30秒检查一次
```

## 扩展性

### 自定义扩展

#### 扩展导入行为管理器
```javascript
// 创建自定义导入行为管理器类
class CustomImportBehaviorManager extends ImportBehaviorManager {
    constructor(settingsManager, csInterface, logFunction) {
        super(settingsManager, csInterface, logFunction);
        this.customBehaviors = new Map();
        this.behaviorTransitions = new Map();
    }
    
    /**
     * 注册自定义导入行为
     * @param {string} behaviorName - 行为名称
     * @param {Object} behaviorConfig - 行为配置
     */
    registerCustomBehavior(behaviorName, behaviorConfig) {
        this.customBehaviors.set(behaviorName, behaviorConfig);
        this.log(`📥 已注册自定义导入行为: ${behaviorName}`, 'debug');
    }
    
    /**
     * 获取所有可用的导入行为
     * @returns {Array} 可用行为列表
     */
    getAllAvailableBehaviors() {
        const builtInBehaviors = ['no_import', 'current_time', 'timeline_start'];
        const customBehaviors = Array.from(this.customBehaviors.keys());
        return [...builtInBehaviors, ...customBehaviors];
    }
    
    /**
     * 验证自定义导入行为
     * @param {string} behavior - 导入行为
     * @returns {Object} 验证结果
     */
    validateBehavior(behavior) {
        const builtInValidation = super.validateBehavior(behavior);
        
        // 如果内置验证通过，直接返回
        if (builtInValidation.valid) {
            return builtInValidation;
        }
        
        // 检查自定义行为
        if (this.customBehaviors.has(behavior)) {
            return { valid: true };
        }
        
        // 返回原始验证结果
        return builtInValidation;
    }
    
    /**
     * 获取自定义行为描述
     * @param {string} behavior - 导入行为
     * @returns {string} 行为描述
     */
    getBehaviorDescription(behavior) {
        if (this.customBehaviors.has(behavior)) {
            const customBehavior = this.customBehaviors.get(behavior);
            return customBehavior.description || `自定义行为: ${behavior}`;
        }
        
        return super.getBehaviorDescription(behavior);
    }
    
    /**
     * 获取自定义行为优势
     * @param {string} behavior - 导入行为
     * @returns {Array} 优势列表
     */
    getBehaviorAdvantages(behavior) {
        if (this.customBehaviors.has(behavior)) {
            const customBehavior = this.customBehaviors.get(behavior);
            return customBehavior.advantages || [];
        }
        
        return super.getBehaviorAdvantages(behavior);
    }
    
    /**
     * 获取自定义行为劣势
     * @param {string} behavior - 导入行为
     * @returns {Array} 劣势列表
     */
    getBehaviorDisadvantages(behavior) {
        if (this.customBehaviors.has(behavior)) {
            const customBehavior = this.customBehaviors.get(behavior);
            return customBehavior.disadvantages || [];
        }
        
        return super.getBehaviorDisadvantages(behavior);
    }
    
    /**
     * 获取自定义行为推荐使用场景
     * @param {string} behavior - 导入行为
     * @returns {string} 推荐使用场景
     */
    getBehaviorRecommendation(behavior) {
        if (this.customBehaviors.has(behavior)) {
            const customBehavior = this.customBehaviors.get(behavior);
            return customBehavior.recommendation || '请根据具体需求选择';
        }
        
        return super.getBehaviorRecommendation(behavior);
    }
}

// 使用自定义导入行为管理器
const customImportBehaviorManager = new CustomImportBehaviorManager(settingsManager, csInterface, logFunction);

// 注册自定义行为
customImportBehaviorManager.registerCustomBehavior('smart_position', {
    description: '智能位置行为 - 根据图层类型自动选择最佳导入位置',
    advantages: [
        '智能化位置选择',
        '自动避让已有图层',
        '提高工作效率'
    ],
    disadvantages: [
        '需要复杂的算法支持',
        '可能不满足特定需求'
    ],
    recommendation: '适用于需要智能位置选择的场景'
});

// 切换到自定义行为
const smartPositionResult = customImportBehaviorManager.switchBehavior('smart_position');
if (smartPositionResult.success) {
    console.log('✅ 已切换到智能位置行为');
}
```

#### 插件化架构
```javascript
// 创建导入行为插件
class ImportBehaviorPlugin {
    constructor(importBehaviorManager) {
        this.importBehaviorManager = importBehaviorManager;
        this.init();
    }
    
    init() {
        // 注册插件特定的验证规则
        this.importBehaviorManager.addValidator('plugin.customOption', (value) => {
            // 自定义验证逻辑
            return { valid: true };
        });
        
        // 注册插件特定的迁移规则
        this.importBehaviorManager.addMigration(3, (settings) => {
            // 迁移逻辑
            return settings;
        });
        
        // 绑定插件事件
        this.bindPluginEvents();
    }
    
    /**
     * 绑定插件事件
     */
    bindPluginEvents() {
        // 监听行为变更事件
        this.importBehaviorManager.addBehaviorChangeListener((event) => {
            this.handleBehaviorChange(event);
        });
        
        // 监听字段变更事件
        this.importBehaviorManager.addFieldListener('addToComposition', (newValue, oldValue, fieldPath) => {
            this.handleFieldChange(newValue, oldValue, fieldPath);
        });
        
        this.importBehaviorManager.addFieldListener('timelineOptions.placement', (newValue, oldValue, fieldPath) => {
            this.handleFieldChange(newValue, oldValue, fieldPath);
        });
        
        // 监听设置保存事件
        this.importBehaviorManager.addListener((eventType, data) => {
            if (eventType === 'saved') {
                this.handleSettingsSaved(data);
            }
        });
    }
    
    /**
     * 处理行为变更事件
     * @param {CustomEvent} event - 行为变更事件
     */
    handleBehaviorChange(event) {
        const { oldBehavior, newBehavior, timestamp } = event.detail;
        console.log(`📥 插件: 导入行为变更 ${oldBehavior} -> ${newBehavior}`);
        
        // 执行插件特定的逻辑
        this.onBehaviorChanged(oldBehavior, newBehavior);
    }
    
    /**
     * 处理字段变更事件
     * @param {*} newValue - 新值
     * @param {*} oldValue - 旧值
     * @param {string} fieldPath - 字段路径
     */
    handleFieldChange(newValue, oldValue, fieldPath) {
        console.log(`📥 插件: 字段变更 ${fieldPath} ${oldValue} -> ${newValue}`);
        
        // 执行插件特定的逻辑
        this.onFieldChanged(fieldPath, newValue, oldValue);
    }
    
    /**
     * 处理设置保存事件
     * @param {Object} settings - 保存的设置
     */
    handleSettingsSaved(settings) {
        console.log('📥 插件: 设置已保存', settings);
        
        // 执行插件特定的逻辑
        this.onSettingsSaved(settings);
    }
    
    /**
     * 行为变更时的处理逻辑
     * @param {string} oldBehavior - 旧行为
     * @param {string} newBehavior - 新行为
     */
    onBehaviorChanged(oldBehavior, newBehavior) {
        // 插件特定的行为变更处理逻辑
        switch (newBehavior) {
            case 'no_import':
                console.log('📥 插件: 已切换到不导入合成行为');
                break;
                
            case 'current_time':
                console.log('📥 插件: 已切换到当前时间行为');
                break;
                
            case 'timeline_start':
                console.log('📥 插件: 已切换到时间轴开始行为');
                break;
                
            default:
                console.log(`📥 插件: 已切换到未知行为: ${newBehavior}`);
        }
    }
    
    /**
     * 字段变更时的处理逻辑
     * @param {string} fieldPath - 字段路径
     * @param {*} newValue - 新值
     * @param {*} oldValue - 旧值
     */
    onFieldChanged(fieldPath, newValue, oldValue) {
        // 插件特定的字段变更处理逻辑
        switch (fieldPath) {
            case 'addToComposition':
                console.log(`📥 插件: 添加到合成字段变更 ${oldValue} -> ${newValue}`);
                break;
                
            case 'timelineOptions.placement':
                console.log(`📥 插件: 时间轴放置位置字段变更 ${oldValue} -> ${newValue}`);
                break;
                
            default:
                console.log(`📥 插件: 未知字段变更 ${fieldPath} ${oldValue} -> ${newValue}`);
        }
    }
    
    /**
     * 设置保存时的处理逻辑
     * @param {Object} settings - 保存的设置
     */
    onSettingsSaved(settings) {
        // 插件特定的设置保存处理逻辑
        console.log('📥 插件: 设置保存完成');
        
        // 可以在这里执行额外的保存后处理
        this.postProcessSettings(settings);
    }
    
    /**
     * 设置保存后的后处理
     * @param {Object} settings - 保存的设置
     */
    postProcessSettings(settings) {
        // 插件特定的后处理逻辑
        console.log('📥 插件: 执行设置保存后处理');
        
        // 例如：同步设置到云端、发送通知等
        this.syncSettingsToCloud(settings);
        this.notifySettingsChange(settings);
    }
    
    /**
     * 同步设置到云端
     * @param {Object} settings - 设置对象
     */
    async syncSettingsToCloud(settings) {
        try {
            // 实现云端同步逻辑
            console.log('📥 插件: 同步设置到云端...');
            
            // 构造同步数据
            const syncData = {
                settings: settings,
                timestamp: Date.now(),
                userId: this.getUserId(),
                deviceId: this.getDeviceId()
            };
            
            // 发送同步请求
            const response = await fetch('/api/settings/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(syncData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('📥 插件: 设置已同步到云端', result);
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('📥 插件: 同步设置到云端失败', error);
        }
    }
    
    /**
     * 通知设置变更
     * @param {Object} settings - 设置对象
     */
    notifySettingsChange(settings) {
        try {
            // 实现通知逻辑
            console.log('📥 插件: 发送设置变更通知');
            
            // 例如：发送WebSocket消息、触发自定义事件等
            this.emitCustomEvent('settingsChanged', {
                settings: settings,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('📥 插件: 发送设置变更通知失败', error);
        }
    }
    
    /**
     * 获取用户ID
     * @returns {string} 用户ID
     */
    getUserId() {
        try {
            return localStorage.getItem('userId') || 'anonymous';
        } catch (error) {
            return 'anonymous';
        }
    }
    
    /**
     * 获取设备ID
     * @returns {string} 设备ID
     */
    getDeviceId() {
        try {
            return localStorage.getItem('deviceId') || this.generateDeviceId();
        } catch (error) {
            return this.generateDeviceId();
        }
    }
    
    /**
     * 生成设备ID
     * @returns {string} 设备ID
     */
    generateDeviceId() {
        try {
            const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('deviceId', deviceId);
            return deviceId;
        } catch (error) {
            return `device_${Date.now()}`;
        }
    }
    
    /**
     * 触发自定义事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     */
    emitCustomEvent(eventType, data) {
        try {
            // 触发自定义事件
            const event = new CustomEvent(`importBehaviorPlugin_${eventType}`, {
                detail: data
            });
            
            document.dispatchEvent(event);
            
            console.log(`📥 插件: 自定义事件已触发 ${eventType}`, data);
            
        } catch (error) {
            console.error('📥 插件: 触发自定义事件失败', error);
        }
    }
}

// 应用插件
const plugin = new ImportBehaviorPlugin(importBehaviorManager);