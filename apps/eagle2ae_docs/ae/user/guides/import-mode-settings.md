# 导入模式设置

## 概述

导入模式设置（Import Mode Settings）是 Eagle2Ae AE 扩展 v2.4.0 的核心功能之一，它决定了素材从外部源导入到 After Effects 项目时的处理方式。该设置支持三种不同的导入模式：直接导入、项目旁复制和指定文件夹，每种模式都有其独特的应用场景和优势。

## 核心特性

### 三种导入模式
1. **直接导入** - 从源目录直接导入到AE项目，不复制文件
2. **项目旁复制** - 将文件复制到AE项目文件旁边后导入
3. **指定文件夹** - 将文件复制到用户指定的文件夹后导入

### 智能路径管理
- 自动检测AE项目路径
- 智能生成项目旁文件夹名称
- 支持用户自定义文件夹路径

### 面板特定配置
- 每个面板实例拥有独立的导入模式设置
- 支持导入模式的快速切换
- 提供导入模式历史记录

### 实时状态反馈
- 实时显示当前导入模式
- 提供模式变更确认提示
- 显示导入路径和目标文件夹

## 使用指南

### 导入模式详解

#### 直接导入 (Direct Import)
```javascript
// 直接导入模式配置
const directImportSettings = {
    mode: 'direct',
    addToComposition: true,
    timelineOptions: {
        enabled: true,
        placement: 'current_time', // 'current_time' | 'timeline_start'
        sequenceInterval: 1.0
    }
};
```

**特点**：
- 从源目录直接链接到AE项目，不复制文件
- 速度最快，不占用额外磁盘空间
- 文件路径依赖源目录，移动文件会导致项目丢失链接

**适用场景**：
- 临时项目或测试项目
- 确保源文件不会被移动的稳定环境
- 需要快速导入且不关心文件复制的场景

**注意事项**：
- ⚠️ **极不推荐**在正式项目中使用
- 一旦原始文件被移动、重命名或删除，AE项目中的素材会立即丢失（显示为红色条纹）
- 需要确保源文件路径的稳定性

#### 项目旁复制 (Project Adjacent Copy)
```javascript
// 项目旁复制模式配置
const projectAdjacentSettings = {
    mode: 'project_adjacent',
    projectAdjacentFolder: 'Eagle_Assets',
    addToComposition: true,
    timelineOptions: {
        enabled: true,
        placement: 'current_time',
        sequenceInterval: 1.0
    }
};
```

**特点**：
- 将素材文件复制到当前AE项目文件旁边后导入
- 提供项目"可移植性"，便于打包分享
- 支持自定义项目旁文件夹名称

**适用场景**：
- 正式项目开发
- 需要与团队成员共享项目
- 要求项目完整性和稳定性

**优势**：
- ✅ **最安全、最推荐的模式**
- 保证了项目的"可移植性"，当您需要将整个项目文件夹打包发给他人时，所有素材都会包含在内，不会丢失
- 自动创建项目旁文件夹，便于素材管理

**配置选项**：
- **项目旁文件夹名称**：默认为"Eagle_Assets"，可自定义
- **自动添加到合成**：是否将导入的素材自动添加到当前活动合成
- **时间轴放置位置**：素材在时间轴中的放置位置

#### 指定文件夹 (Custom Folder)
```javascript
// 指定文件夹模式配置
const customFolderSettings = {
    mode: 'custom_folder',
    customFolderPath: '/path/to/custom/folder',
    addToComposition: true,
    timelineOptions: {
        enabled: true,
        placement: 'current_time',
        sequenceInterval: 1.0
    }
};
```

**特点**：
- 将素材文件复制到用户指定的文件夹后导入
- 提供最大的灵活性和自定义能力
- 支持批量处理和统一管理

**适用场景**：
- 需要统一管理所有导入素材的场景
- 特定的文件组织结构要求
- 与其他工具或流程集成

**优势**：
- ✅ **最灵活的模式**
- 可以将所有导入的素材集中管理到指定文件夹
- 支持跨项目的素材复用
- 便于素材的统一处理和优化

**配置选项**：
- **指定文件夹路径**：用户选择的目标文件夹路径
- **自动添加到合成**：是否将导入的素材自动添加到当前活动合成
- **时间轴放置位置**：素材在时间轴中的放置位置

### 导入模式切换

#### 快速切换
```javascript
// 切换导入模式
function switchImportMode(newMode) {
    const settingsManager = window.settingsManager;
    
    if (!settingsManager) {
        console.error('设置管理器未初始化');
        return;
    }
    
    // 更新导入模式
    const updateResult = settingsManager.updateField('mode', newMode, false);
    
    if (updateResult.success) {
        console.log(`✅ 导入模式已切换为: ${newMode}`);
        
        // 根据新模式更新UI状态
        updateImportModeUI(newMode);
        
        // 同步到高级设置面板
        const advancedRadio = document.querySelector(`input[name="import-mode"][value="${newMode}"]`);
        if (advancedRadio) {
            advancedRadio.checked = true;
        }
        
        // 保存设置
        settingsManager.saveSettings(settingsManager.getSettings(), true);
        
        // 显示模式切换提示
        showModeSwitchNotification(newMode);
        
    } else {
        console.error(`❌ 切换导入模式失败: ${updateResult.error}`);
    }
}

// 更新导入模式UI
function updateImportModeUI(mode) {
    // 更新快速设置面板
    const modeRadios = document.querySelectorAll('input[name="quick-import-mode"]');
    modeRadios.forEach(radio => {
        radio.checked = (radio.value === mode);
        
        // 添加视觉反馈
        const label = radio.closest('.mode-button');
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
    const advancedModeRadios = document.querySelectorAll('input[name="import-mode"]');
    advancedModeRadios.forEach(radio => {
        radio.checked = (radio.value === mode);
        
        // 添加视觉反馈
        const label = radio.closest('.import-mode-option');
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
    
    // 更新导入设置指南
    updateImportSettingsGuide(mode);
}
```

#### 导入设置指南更新
```javascript
// 更新导入设置指南
function updateImportSettingsGuide(mode) {
    const guideContainer = document.querySelector('.import-settings-guide');
    if (!guideContainer) return;
    
    const modeDescriptions = {
        'direct': {
            title: '直接导入模式',
            description: '从源目录直接导入到AE项目，不复制文件',
            advantages: [
                '导入速度最快',
                '不占用额外磁盘空间',
                '适合临时项目或测试'
            ],
            disadvantages: [
                '项目不可移植',
                '文件移动会导致链接丢失',
                '不适合正式项目'
            ],
            recommendation: '仅适用于临时项目或测试场景'
        },
        'project_adjacent': {
            title: '项目旁复制模式',
            description: '将文件复制到AE项目文件旁边后导入',
            advantages: [
                '项目具有可移植性',
                '素材与项目文件同目录',
                '适合正式项目和团队协作'
            ],
            disadvantages: [
                '占用额外磁盘空间',
                '复制过程需要时间'
            ],
            recommendation: '推荐用于正式项目和团队协作'
        },
        'custom_folder': {
            title: '指定文件夹模式',
            description: '将文件复制到用户指定的文件夹后导入',
            advantages: [
                '最大的灵活性',
                '统一管理所有素材',
                '支持跨项目素材复用'
            ],
            disadvantages: [
                '需要手动选择文件夹',
                '可能分散项目素材'
            ],
            recommendation: '适用于需要统一素材管理的场景'
        }
    };
    
    const modeInfo = modeDescriptions[mode] || modeDescriptions.direct;
    
    guideContainer.innerHTML = `
        <div class="import-settings-guide-content">
            <h4>${modeInfo.title}</h4>
            <p>${modeInfo.description}</p>
            
            <div class="guide-section">
                <h5>优势</h5>
                <ul>
                    ${modeInfo.advantages.map(adv => `<li>✅ ${adv}</li>`).join('')}
                </ul>
            </div>
            
            <div class="guide-section">
                <h5>劣势</h5>
                <ul>
                    ${modeInfo.disadvantages.map(dis => `<li>⚠️ ${dis}</li>`).join('')}
                </ul>
            </div>
            
            <div class="guide-section">
                <h5>推荐使用场景</h5>
                <p>${modeInfo.recommendation}</p>
            </div>
        </div>
    `;
}
```

### 导入行为设置

#### 时间轴放置选项
```javascript
// 时间轴放置选项配置
const timelinePlacementOptions = {
    'current_time': {
        title: '当前时间',
        description: '将素材放置在当前时间指针位置',
        icon: '🕒'
    },
    'timeline_start': {
        title: '时间轴开始',
        description: '将素材移至时间轴开始处（0秒位置）',
        icon: '🎬'
    }
};

// 更新时间轴放置选项UI
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
    
    // 更新快速设置面板
    const quickBehaviorRadios = document.querySelectorAll('input[name="import-behavior"]');
    quickBehaviorRadios.forEach(radio => {
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

#### 自动添加到合成
```javascript
// 自动添加到合成设置
function updateAddToCompositionSetting(addToComposition) {
    const checkbox = document.getElementById('add-to-composition');
    if (checkbox) {
        checkbox.checked = addToComposition;
        
        // 更新相关UI元素的启用状态
        const timelineOptions = document.getElementById('timeline-options');
        if (timelineOptions) {
            timelineOptions.style.opacity = addToComposition ? '1' : '0.5';
            
            const timelineInputs = timelineOptions.querySelectorAll('input, select');
            timelineInputs.forEach(input => {
                input.disabled = !addToComposition;
            });
        }
        
        // 显示设置说明
        const description = addToComposition ? 
            '素材将自动添加到当前活动合成' : 
            '素材仅导入到项目面板，不自动添加到合成';
            
        showSettingDescription('addToComposition', description);
    }
}
```

## 技术实现

### 导入模式管理器

```javascript
/**
 * 导入模式管理器
 * 负责管理导入模式设置，支持快速切换和面板特定配置
 */
class ImportModeManager {
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
        this.currentMode = 'project_adjacent';
        this.modeHistory = [];
        this.maxHistorySize = 10;
        
        // 绑定方法上下文
        this.switchMode = this.switchMode.bind(this);
        this.updateMode = this.updateMode.bind(this);
        this.validateMode = this.validateMode.bind(this);
        this.getModeDescription = this.getModeDescription.bind(this);
        this.getModeAdvantages = this.getModeAdvantages.bind(this);
        this.getModeDisadvantages = this.getModeDisadvantages.bind(this);
        this.getModeRecommendation = this.getModeRecommendation.bind(this);
        
        this.log('📥 导入模式管理器已初始化', 'debug');
    }
}
```

### 模式切换实现

```javascript
/**
 * 切换导入模式
 * @param {string} newMode - 新的导入模式
 * @param {boolean} save - 是否保存设置
 * @returns {Object} 切换结果
 */
switchMode(newMode, save = true) {
    try {
        // 验证新模式
        const validation = this.validateMode(newMode);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }
        
        // 获取当前模式
        const currentMode = this.settingsManager.getField('mode') || this.currentMode;
        
        // 如果模式未变更，直接返回
        if (currentMode === newMode) {
            this.log(`📥 导入模式未变更: ${newMode}`, 'debug');
            return {
                success: true,
                mode: newMode,
                changed: false
            };
        }
        
        // 更新设置管理器
        const updateResult = this.settingsManager.updateField('mode', newMode, false);
        
        if (!updateResult.success) {
            return updateResult;
        }
        
        // 更新当前模式
        this.currentMode = newMode;
        
        // 添加到历史记录
        this.addToModeHistory(newMode);
        
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
        
        // 触发模式变更事件
        this.emitModeChange(currentMode, newMode);
        
        this.log(`📥 导入模式已切换: ${currentMode} -> ${newMode}`, 'info');
        
        return {
            success: true,
            mode: newMode,
            changed: true,
            oldValue: currentMode,
            newValue: newMode
        };
        
    } catch (error) {
        this.log(`❌ 切换导入模式失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 更新导入模式
 * @param {string} newMode - 新的导入模式
 * @returns {Object} 更新结果
 */
updateMode(newMode) {
    try {
        // 验证新模式
        const validation = this.validateMode(newMode);
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error
            };
        }
        
        // 获取当前模式
        const currentMode = this.settingsManager.getField('mode') || this.currentMode;
        
        // 更新设置管理器
        const updateResult = this.settingsManager.updateField('mode', newMode, false);
        
        if (!updateResult.success) {
            return updateResult;
        }
        
        // 更新当前模式
        this.currentMode = newMode;
        
        // 添加到历史记录
        this.addToModeHistory(newMode);
        
        // 触发模式变更事件
        this.emitModeChange(currentMode, newMode);
        
        this.log(`📥 导入模式已更新: ${currentMode} -> ${newMode}`, 'info');
        
        return {
            success: true,
            mode: newMode,
            changed: currentMode !== newMode,
            oldValue: currentMode,
            newValue: newMode
        };
        
    } catch (error) {
        this.log(`❌ 更新导入模式失败: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 验证导入模式
 * @param {string} mode - 导入模式
 * @returns {Object} 验证结果
 */
validateMode(mode) {
    try {
        if (!mode || typeof mode !== 'string') {
            return {
                valid: false,
                error: '导入模式必须是字符串'
            };
        }
        
        const validModes = ['direct', 'project_adjacent', 'custom_folder'];
        if (!validModes.includes(mode)) {
            return {
                valid: false,
                error: `无效的导入模式: ${mode}，必须是以下值之一: ${validModes.join(', ')}`
            };
        }
        
        return {
            valid: true
        };
        
    } catch (error) {
        return {
            valid: false,
            error: `模式验证异常: ${error.message}`
        };
    }
}

/**
 * 添加到模式历史记录
 * @param {string} mode - 导入模式
 */
addToModeHistory(mode) {
    try {
        // 移除已存在的相同模式
        this.modeHistory = this.modeHistory.filter(historyMode => historyMode !== mode);
        
        // 添加到历史记录开头
        this.modeHistory.unshift(mode);
        
        // 限制历史记录大小
        if (this.modeHistory.length > this.maxHistorySize) {
            this.modeHistory = this.modeHistory.slice(0, this.maxHistorySize);
        }
        
        // 保存到localStorage
        try {
            localStorage.setItem('ae_extension_mode_history', JSON.stringify(this.modeHistory));
        } catch (storageError) {
            this.log(`⚠️ 无法保存模式历史记录: ${storageError.message}`, 'warning');
        }
        
        this.log(`📥 导入模式历史记录已更新: ${mode}`, 'debug');
        
    } catch (error) {
        this.log(`添加模式历史记录失败: ${error.message}`, 'error');
    }
}

/**
 * 获取模式历史记录
 * @returns {Array} 模式历史记录
 */
getModeHistory() {
    try {
        // 尝试从localStorage加载
        const savedHistory = localStorage.getItem('ae_extension_mode_history');
        if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            if (Array.isArray(parsedHistory)) {
                this.modeHistory = parsedHistory;
                this.log(`📥 已从localStorage加载 ${parsedHistory.length} 个模式历史记录`, 'debug');
            }
        }
        
        return [...this.modeHistory];
        
    } catch (error) {
        this.log(`获取模式历史记录失败: ${error.message}`, 'error');
        return [];
    }
}

/**
 * 清除模式历史记录
 */
clearModeHistory() {
    try {
        this.modeHistory = [];
        
        // 清除localStorage
        try {
            localStorage.removeItem('ae_extension_mode_history');
        } catch (storageError) {
            this.log(`⚠️ 无法清除localStorage中的模式历史记录: ${storageError.message}`, 'warning');
        }
        
        this.log('📥 模式历史记录已清除', 'debug');
        
        // 触发历史记录变更事件
        this.emit('modeHistoryChanged', {
            history: [],
            cleared: true
        });
        
    } catch (error) {
        this.log(`清除模式历史记录失败: ${error.message}`, 'error');
    }
}
```

### 模式描述实现

```javascript
/**
 * 获取导入模式描述
 * @param {string} mode - 导入模式
 * @returns {string} 模式描述
 */
getModeDescription(mode) {
    const descriptions = {
        'direct': '从源目录直接导入到AE项目，不复制文件',
        'project_adjacent': '将文件复制到AE项目文件旁边后导入',
        'custom_folder': '将文件复制到用户指定的文件夹后导入'
    };
    
    return descriptions[mode] || '未知导入模式';
}

/**
 * 获取导入模式优势
 * @param {string} mode - 导入模式
 * @returns {Array} 优势列表
 */
getModeAdvantages(mode) {
    const advantages = {
        'direct': [
            '导入速度最快',
            '不占用额外磁盘空间',
            '适合临时项目或测试'
        ],
        'project_adjacent': [
            '项目具有可移植性',
            '素材与项目文件同目录',
            '适合正式项目和团队协作'
        ],
        'custom_folder': [
            '最大的灵活性',
            '统一管理所有素材',
            '支持跨项目素材复用'
        ]
    };
    
    return advantages[mode] || [];
}

/**
 * 获取导入模式劣势
 * @param {string} mode - 导入模式
 * @returns {Array} 劣势列表
 */
getModeDisadvantages(mode) {
    const disadvantages = {
        'direct': [
            '项目不可移植',
            '文件移动会导致链接丢失',
            '不适合正式项目'
        ],
        'project_adjacent': [
            '占用额外磁盘空间',
            '复制过程需要时间'
        ],
        'custom_folder': [
            '需要手动选择文件夹',
            '可能分散项目素材'
        ]
    };
    
    return disadvantages[mode] || [];
}

/**
 * 获取导入模式推荐使用场景
 * @param {string} mode - 导入模式
 * @returns {string} 推荐使用场景
 */
getModeRecommendation(mode) {
    const recommendations = {
        'direct': '仅适用于临时项目或测试场景',
        'project_adjacent': '推荐用于正式项目和团队协作',
        'custom_folder': '适用于需要统一素材管理的场景'
    };
    
    return recommendations[mode] || '请根据具体需求选择合适的导入模式';
}
```

### 模式变更事件实现

```javascript
/**
 * 触发模式变更事件
 * @param {string} oldMode - 旧模式
 * @param {string} newMode - 新模式
 */
emitModeChange(oldMode, newMode) {
    try {
        // 触发自定义事件
        const event = new CustomEvent('importModeChange', {
            detail: {
                oldMode: oldMode,
                newMode: newMode,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
        
        // 触发通用变更事件
        this.emit('modeChange', {
            oldMode: oldMode,
            newMode: newMode,
            timestamp: Date.now()
        });
        
        this.log(`🔊 导入模式变更事件已触发: ${oldMode} -> ${newMode}`, 'debug');
        
    } catch (error) {
        this.log(`触发模式变更事件失败: ${error.message}`, 'error');
    }
}

/**
 * 添加模式变更监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addModeChangeListener(listener) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }
        
        // 添加到变更监听器列表
        this.changeListeners.push(listener);
        
        this.log('👂 已添加导入模式变更监听器', 'debug');
        
        // 返回移除监听器的函数
        return () => {
            this.removeModeChangeListener(listener);
        };
        
    } catch (error) {
        this.log(`添加模式变更监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数以防调用错误
    }
}

/**
 * 移除模式变更监听器
 * @param {Function} listener - 监听器函数
 */
removeModeChangeListener(listener) {
    try {
        const index = this.changeListeners.indexOf(listener);
        if (index !== -1) {
            this.changeListeners.splice(index, 1);
            this.log('👂 已移除导入模式变更监听器', 'debug');
        }
        
    } catch (error) {
        this.log(`移除模式变更监听器失败: ${error.message}`, 'error');
    }
}
```

### UI更新实现

```javascript
/**
 * 更新导入模式UI
 * @param {string} mode - 导入模式
 */
updateImportModeUI(mode) {
    try {
        // 更新快速设置面板
        this.updateQuickSettingsModeUI(mode);
        
        // 更新高级设置面板
        this.updateAdvancedSettingsModeUI(mode);
        
        // 更新导入设置指南
        this.updateImportSettingsGuide(mode);
        
        // 更新状态显示
        this.updateModeStatusDisplay(mode);
        
        this.log(`🔄 导入模式UI已更新: ${mode}`, 'debug');
        
    } catch (error) {
        this.log(`更新导入模式UI失败: ${error.message}`, 'error');
    }
}

/**
 * 更新快速设置面板的模式UI
 * @param {string} mode - 导入模式
 */
updateQuickSettingsModeUI(mode) {
    try {
        // 更新快速设置模式单选按钮
        const modeButtons = document.querySelectorAll('.mode-button input[type="radio"]');
        modeButtons.forEach(button => {
            const buttonValue = button.value;
            const isChecked = buttonValue === mode;
            
            button.checked = isChecked;
            
            // 更新按钮样式
            const label = button.closest('.mode-button');
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
        
        this.log(`🔄 快速设置面板模式UI已更新: ${mode}`, 'debug');
        
    } catch (error) {
        this.log(`更新快速设置面板模式UI失败: ${error.message}`, 'error');
    }
}

/**
 * 更新高级设置面板的模式UI
 * @param {string} mode - 导入模式
 */
updateAdvancedSettingsModeUI(mode) {
    try {
        // 更新高级设置模式单选按钮
        const modeOptions = document.querySelectorAll('.import-mode-option input[type="radio"]');
        modeOptions.forEach(option => {
            const optionValue = option.value;
            const isChecked = optionValue === mode;
            
            option.checked = isChecked;
            
            // 更新选项样式
            const label = option.closest('.import-mode-option');
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
        
        // 根据模式更新相关UI元素的显示状态
        this.updateModeSpecificUI(mode);
        
        this.log(`🔄 高级设置面板模式UI已更新: ${mode}`, 'debug');
        
    } catch (error) {
        this.log(`更新高级设置面板模式UI失败: ${error.message}`, 'error');
    }
}

/**
 * 更新模式特定UI元素
 * @param {string} mode - 导入模式
 */
updateModeSpecificUI(mode) {
    try {
        // 根据模式显示/隐藏相关设置
        const projectAdjacentConfig = document.getElementById('project-adjacent-config');
        const customFolderConfig = document.getElementById('custom-folder-config');
        
        if (projectAdjacentConfig) {
            projectAdjacentConfig.style.display = mode === 'project_adjacent' ? '' : 'none';
        }
        
        if (customFolderConfig) {
            customFolderConfig.style.display = mode === 'custom_folder' ? '' : 'none';
        }
        
        // 更新设置说明
        this.updateModeDescription(mode);
        
        this.log(`🔄 模式特定UI已更新: ${mode}`, 'debug');
        
    } catch (error) {
        this.log(`更新模式特定UI失败: ${error.message}`, 'error');
    }
}

/**
 * 更新模式描述
 * @param {string} mode - 导入模式
 */
updateModeDescription(mode) {
    try {
        const descriptionElement = document.getElementById('import-mode-description');
        if (!descriptionElement) return;
        
        const modeInfo = {
            'direct': {
                title: '直接导入模式',
                description: '从源目录直接导入到AE项目，不复制文件',
                icon: '🔗'
            },
            'project_adjacent': {
                title: '项目旁复制模式',
                description: '将文件复制到AE项目文件旁边后导入',
                icon: '📂'
            },
            'custom_folder': {
                title: '指定文件夹模式',
                description: '将文件复制到用户指定的文件夹后导入',
                icon: '📁'
            }
        }[mode] || {
            title: '未知模式',
            description: '未知的导入模式',
            icon: '❓'
        };
        
        descriptionElement.innerHTML = `
            <div class="mode-description-content">
                <span class="mode-icon">${modeInfo.icon}</span>
                <div class="mode-info">
                    <div class="mode-title">${modeInfo.title}</div>
                    <div class="mode-desc">${modeInfo.description}</div>
                </div>
            </div>
        `;
        
        this.log(`🔄 模式描述已更新: ${mode}`, 'debug');
        
    } catch (error) {
        this.log(`更新模式描述失败: ${error.message}`, 'error');
    }
}
```

### 导入设置指南实现

```javascript
/**
 * 更新导入设置指南
 * @param {string} mode - 导入模式
 */
updateImportSettingsGuide(mode) {
    try {
        const guideContainer = document.querySelector('.import-settings-guide');
        if (!guideContainer) return;
        
        const modeDescriptions = {
            'direct': {
                title: '直接导入模式',
                description: '从源目录直接导入到AE项目，不复制文件',
                advantages: [
                    '导入速度最快',
                    '不占用额外磁盘空间',
                    '适合临时项目或测试'
                ],
                disadvantages: [
                    '项目不可移植',
                    '文件移动会导致链接丢失',
                    '不适合正式项目'
                ],
                recommendation: '仅适用于临时项目或测试场景',
                useCases: [
                    '快速原型设计',
                    '临时素材测试',
                    '演示和教学'
                ]
            },
            'project_adjacent': {
                title: '项目旁复制模式',
                description: '将文件复制到AE项目文件旁边后导入',
                advantages: [
                    '项目具有可移植性',
                    '素材与项目文件同目录',
                    '适合正式项目和团队协作'
                ],
                disadvantages: [
                    '占用额外磁盘空间',
                    '复制过程需要时间'
                ],
                recommendation: '推荐用于正式项目和团队协作',
                useCases: [
                    '正式项目开发',
                    '团队协作项目',
                    '客户交付项目'
                ]
            },
            'custom_folder': {
                title: '指定文件夹模式',
                description: '将文件复制到用户指定的文件夹后导入',
                advantages: [
                    '最大的灵活性',
                    '统一管理所有素材',
                    '支持跨项目素材复用'
                ],
                disadvantages: [
                    '需要手动选择文件夹',
                    '可能分散项目素材'
                ],
                recommendation: '适用于需要统一素材管理的场景',
                useCases: [
                    '素材库管理',
                    '跨项目素材复用',
                    '批量素材处理'
                ]
            }
        };
        
        const modeInfo = modeDescriptions[mode] || modeDescriptions.direct;
        
        guideContainer.innerHTML = `
            <div class="import-settings-guide-content">
                <h4>${modeInfo.title}</h4>
                <p>${modeInfo.description}</p>
                
                <div class="guide-section">
                    <h5>优势</h5>
                    <ul>
                        ${modeInfo.advantages.map(adv => `<li>✅ ${adv}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guide-section">
                    <h5>劣势</h5>
                    <ul>
                        ${modeInfo.disadvantages.map(dis => `<li>⚠️ ${dis}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="guide-section">
                    <h5>推荐使用场景</h5>
                    <p>${modeInfo.recommendation}</p>
                </div>
                
                <div class="guide-section">
                    <h5>典型应用案例</h5>
                    <ul>
                        ${modeInfo.useCases.map(useCase => `<li>📌 ${useCase}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        this.log(`🔄 导入设置指南已更新: ${mode}`, 'debug');
        
    } catch (error) {
        this.log(`更新导入设置指南失败: ${error.message}`, 'error');
    }
}
```

## API参考

### 核心方法

#### ImportModeManager
导入模式管理器主类

```javascript
/**
 * 导入模式管理器
 * 负责管理导入模式设置，支持快速切换和面板特定配置
 */
class ImportModeManager
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

#### switchMode()
切换导入模式

```javascript
/**
 * 切换导入模式
 * @param {string} newMode - 新的导入模式
 * @param {boolean} save - 是否保存设置
 * @returns {Object} 切换结果
 */
switchMode(newMode, save = true)
```

#### updateMode()
更新导入模式

```javascript
/**
 * 更新导入模式
 * @param {string} newMode - 新的导入模式
 * @returns {Object} 更新结果
 */
updateMode(newMode)
```

#### validateMode()
验证导入模式

```javascript
/**
 * 验证导入模式
 * @param {string} mode - 导入模式
 * @returns {Object} 验证结果
 */
validateMode(mode)
```

#### getModeDescription()
获取导入模式描述

```javascript
/**
 * 获取导入模式描述
 * @param {string} mode - 导入模式
 * @returns {string} 模式描述
 */
getModeDescription(mode)
```

#### getModeAdvantages()
获取导入模式优势

```javascript
/**
 * 获取导入模式优势
 * @param {string} mode - 导入模式
 * @returns {Array} 优势列表
 */
getModeAdvantages(mode)
```

#### getModeDisadvantages()
获取导入模式劣势

```javascript
/**
 * 获取导入模式劣势
 * @param {string} mode - 导入模式
 * @returns {Array} 劣势列表
 */
getModeDisadvantages(mode)
```

#### getModeRecommendation()
获取导入模式推荐使用场景

```javascript
/**
 * 获取导入模式推荐使用场景
 * @param {string} mode - 导入模式
 * @returns {string} 推荐使用场景
 */
getModeRecommendation(mode)
```

#### addToModeHistory()
添加到模式历史记录

```javascript
/**
 * 添加到模式历史记录
 * @param {string} mode - 导入模式
 */
addToModeHistory(mode)
```

#### getModeHistory()
获取模式历史记录

```javascript
/**
 * 获取模式历史记录
 * @returns {Array} 模式历史记录
 */
getModeHistory()
```

#### clearModeHistory()
清除模式历史记录

```javascript
/**
 * 清除模式历史记录
 */
clearModeHistory()
```

#### emitModeChange()
触发模式变更事件

```javascript
/**
 * 触发模式变更事件
 * @param {string} oldMode - 旧模式
 * @param {string} newMode - 新模式
 */
emitModeChange(oldMode, newMode)
```

#### addModeChangeListener()
添加模式变更监听器

```javascript
/**
 * 添加模式变更监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addModeChangeListener(listener)
```

#### removeModeChangeListener()
移除模式变更监听器

```javascript
/**
 * 移除模式变更监听器
 * @param {Function} listener - 监听器函数
 */
removeModeChangeListener(listener)
```

#### updateImportModeUI()
更新导入模式UI

```javascript
/**
 * 更新导入模式UI
 * @param {string} mode - 导入模式
 */
updateImportModeUI(mode)
```

#### updateQuickSettingsModeUI()
更新快速设置面板的模式UI

```javascript
/**
 * 更新快速设置面板的模式UI
 * @param {string} mode - 导入模式
 */
updateQuickSettingsModeUI(mode)
```

#### updateAdvancedSettingsModeUI()
更新高级设置面板的模式UI

```javascript
/**
 * 更新高级设置面板的模式UI
 * @param {string} mode - 导入模式
 */
updateAdvancedSettingsModeUI(mode)
```

#### updateModeSpecificUI()
更新模式特定UI元素

```javascript
/**
 * 更新模式特定UI元素
 * @param {string} mode - 导入模式
 */
updateModeSpecificUI(mode)
```

#### updateModeDescription()
更新模式描述

```javascript
/**
 * 更新模式描述
 * @param {string} mode - 导入模式
 */
updateModeDescription(mode)
```

#### updateImportSettingsGuide()
更新导入设置指南

```javascript
/**
 * 更新导入设置指南
 * @param {string} mode - 导入模式
 */
updateImportSettingsGuide(mode)
```

## 使用示例

### 基本使用

#### 切换导入模式
```javascript
// 创建导入模式管理器实例
const importModeManager = new ImportModeManager(settingsManager, csInterface, logFunction);

// 切换到直接导入模式
const directResult = importModeManager.switchMode('direct');
if (directResult.success) {
    console.log('✅ 已切换到直接导入模式');
} else {
    console.error(`❌ 切换失败: ${directResult.error}`);
}

// 切换到项目旁复制模式
const projectAdjacentResult = importModeManager.switchMode('project_adjacent');
if (projectAdjacentResult.success) {
    console.log('✅ 已切换到项目旁复制模式');
} else {
    console.error(`❌ 切换失败: ${projectAdjacentResult.error}`);
}

// 切换到指定文件夹模式
const customFolderResult = importModeManager.switchMode('custom_folder');
if (customFolderResult.success) {
    console.log('✅ 已切换到指定文件夹模式');
} else {
    console.error(`❌ 切换失败: ${customFolderResult.error}`);
}
```

#### 获取模式信息
```javascript
// 获取当前导入模式
const currentMode = importModeManager.settingsManager.getField('mode');
console.log(`当前导入模式: ${currentMode}`);

// 获取模式描述
const modeDescription = importModeManager.getModeDescription(currentMode);
console.log(`模式描述: ${modeDescription}`);

// 获取模式优势
const modeAdvantages = importModeManager.getModeAdvantages(currentMode);
console.log(`模式优势:`, modeAdvantages);

// 获取模式劣势
const modeDisadvantages = importModeManager.getModeDisadvantages(currentMode);
console.log(`模式劣势:`, modeDisadvantages);

// 获取模式推荐使用场景
const modeRecommendation = importModeManager.getModeRecommendation(currentMode);
console.log(`推荐使用场景: ${modeRecommendation}`);
```

#### 监听模式变更
```javascript
// 添加模式变更监听器
const removeListener = importModeManager.addModeChangeListener((event) => {
    const { oldMode, newMode, timestamp } = event.detail;
    console.log(`📥 导入模式变更: ${oldMode} -> ${newMode}`);
    
    // 根据新模式更新UI
    importModeManager.updateImportModeUI(newMode);
});

// 使用完成后移除监听器
// removeListener();

// 也可以监听自定义事件
document.addEventListener('importModeChange', (event) => {
    const { oldMode, newMode, timestamp } = event.detail;
    console.log(`📥 导入模式变更事件: ${oldMode} -> ${newMode}`);
});
```

### 高级使用

#### 批量模式操作
```javascript
// 批量切换导入模式
async function batchSwitchModes(modes) {
    const results = [];
    
    for (const mode of modes) {
        try {
            const result = await importModeManager.switchMode(mode);
            results.push({
                mode: mode,
                success: result.success,
                error: result.error
            });
            
            // 添加延迟避免过快切换
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            results.push({
                mode: mode,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

// 使用示例
const modes = ['direct', 'project_adjacent', 'custom_folder'];
const batchResults = await batchSwitchModes(modes);
console.log('批量模式切换结果:', batchResults);
```

#### 模式历史记录
```javascript
// 获取模式历史记录
const modeHistory = importModeManager.getModeHistory();
console.log('导入模式历史记录:', modeHistory);

// 清除模式历史记录
importModeManager.clearModeHistory();
console.log('模式历史记录已清除');

// 添加自定义模式历史记录
importModeManager.addToModeHistory('project_adjacent');
importModeManager.addToModeHistory('custom_folder');
importModeManager.addToModeHistory('direct');

const updatedHistory = importModeManager.getModeHistory();
console.log('更新后的模式历史记录:', updatedHistory);
```

#### 模式验证
```javascript
// 验证导入模式
const validation = importModeManager.validateMode('project_adjacent');
if (validation.valid) {
    console.log('✅ 导入模式验证通过');
} else {
    console.error(`❌ 导入模式验证失败: ${validation.error}`);
}

// 验证无效模式
const invalidValidation = importModeManager.validateMode('invalid_mode');
if (!invalidValidation.valid) {
    console.error(`❌ 无效模式验证失败: ${invalidValidation.error}`);
}
```

#### 自定义模式描述
```javascript
// 扩展模式描述
importModeManager.getModeDescription = function(mode) {
    const customDescriptions = {
        'direct': '🚀 直接导入模式 - 从源目录直接导入到AE项目，不复制文件',
        'project_adjacent': '📂 项目旁复制模式 - 将文件复制到AE项目文件旁边后导入',
        'custom_folder': '📁 指定文件夹模式 - 将文件复制到用户指定的文件夹后导入'
    };
    
    return customDescriptions[mode] || this.constructor.prototype.getModeDescription.call(this, mode);
};

// 获取自定义模式描述
const customDescription = importModeManager.getModeDescription('project_adjacent');
console.log('自定义模式描述:', customDescription);
```

## 最佳实践

### 使用建议

#### 模式选择策略
```javascript
// 根据项目类型选择合适的导入模式
function recommendImportMode(projectType) {
    const recommendations = {
        'prototype': 'direct',           // 原型设计项目使用直接导入
        'production': 'project_adjacent', // 生产项目使用项目旁复制
        'collaboration': 'project_adjacent', // 协作项目使用项目旁复制
        'asset_management': 'custom_folder', // 素材管理项目使用指定文件夹
        'training': 'direct',            // 培训项目使用直接导入
        'demo': 'direct'                 // 演示项目使用直接导入
    };
    
    return recommendations[projectType] || 'project_adjacent';
}

// 使用示例
const recommendedMode = recommendImportMode('production');
console.log(`推荐的导入模式: ${recommendedMode}`);
```

#### 批量操作优化
```javascript
// 使用防抖避免频繁模式切换
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

// 防抖处理模式切换
const debouncedModeSwitch = debounce((newMode) => {
    importModeManager.switchMode(newMode);
}, 300);

// 绑定到UI事件
document.querySelectorAll('.mode-button input[type="radio"]').forEach(button => {
    button.addEventListener('change', (e) => {
        if (e.target.checked) {
            debouncedModeSwitch(e.target.value);
        }
    });
});
```

#### 错误处理
```javascript
// 完善的错误处理
async function safeSwitchMode(newMode) {
    try {
        const result = await importModeManager.switchMode(newMode);
        
        if (result.success) {
            console.log(`✅ 导入模式已切换为: ${newMode}`);
            
            // 显示成功提示
            showNotification(`导入模式已切换为: ${importModeManager.getModeDescription(newMode)}`, 'success');
            
            return result;
        } else {
            const errorMsg = result.error || '未知错误';
            console.error(`❌ 切换导入模式失败: ${errorMsg}`);
            
            // 显示错误提示
            showNotification(`切换导入模式失败: ${errorMsg}`, 'error');
            
            return result;
        }
        
    } catch (error) {
        console.error(`💥 切换导入模式异常: ${error.message}`);
        
        // 记录详细错误日志
        importModeManager.log(`切换导入模式异常: ${error.message}`, 'error');
        importModeManager.log(`异常堆栈: ${error.stack}`, 'debug');
        
        // 显示错误提示
        showNotification(`切换导入模式异常: ${error.message}`, 'error');
        
        throw error;
    }
}
```

### 性能优化

#### 缓存机制
```javascript
// 实现模式信息缓存
class CachedImportModeManager extends ImportModeManager {
    constructor(settingsManager, csInterface, logFunction) {
        super(settingsManager, csInterface, logFunction);
        this.modeCache = new Map();
        this.cacheTimeouts = new Map();
    }
    
    /**
     * 获取缓存的模式信息
     * @param {string} mode - 导入模式
     * @param {string} infoType - 信息类型
     * @returns {any} 缓存的信息或null
     */
    getCachedModeInfo(mode, infoType) {
        const cacheKey = `${mode}_${infoType}`;
        const cached = this.modeCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp) < 30000) { // 30秒缓存
            return cached.data;
        }
        
        return null;
    }
    
    /**
     * 缓存模式信息
     * @param {string} mode - 导入模式
     * @param {string} infoType - 信息类型
     * @param {any} data - 数据
     */
    cacheModeInfo(mode, infoType, data) {
        const cacheKey = `${mode}_${infoType}`;
        
        // 添加到缓存
        this.modeCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        // 设置缓存清理定时器
        if (this.cacheTimeouts.has(cacheKey)) {
            clearTimeout(this.cacheTimeouts.get(cacheKey));
        }
        
        const timeoutId = setTimeout(() => {
            this.modeCache.delete(cacheKey);
            this.cacheTimeouts.delete(cacheKey);
        }, 30000); // 30秒后清理
        
        this.cacheTimeouts.set(cacheKey, timeoutId);
    }
    
    /**
     * 获取模式描述（带缓存）
     * @param {string} mode - 导入模式
     * @returns {string} 模式描述
     */
    getModeDescription(mode) {
        const cached = this.getCachedModeInfo(mode, 'description');
        if (cached) {
            return cached;
        }
        
        const description = super.getModeDescription(mode);
        this.cacheModeInfo(mode, 'description', description);
        
        return description;
    }
    
    /**
     * 获取模式优势（带缓存）
     * @param {string} mode - 导入模式
     * @returns {Array} 优势列表
     */
    getModeAdvantages(mode) {
        const cached = this.getCachedModeInfo(mode, 'advantages');
        if (cached) {
            return cached;
        }
        
        const advantages = super.getModeAdvantages(mode);
        this.cacheModeInfo(mode, 'advantages', advantages);
        
        return advantages;
    }
    
    /**
     * 获取模式劣势（带缓存）
     * @param {string} mode - 导入模式
     * @returns {Array} 劣势列表
     */
    getModeDisadvantages(mode) {
        const cached = this.getCachedModeInfo(mode, 'disadvantages');
        if (cached) {
            return cached;
        }
        
        const disadvantages = super.getModeDisadvantages(mode);
        this.cacheModeInfo(mode, 'disadvantages', disadvantages);
        
        return disadvantages;
    }
    
    /**
     * 获取模式推荐使用场景（带缓存）
     * @param {string} mode - 导入模式
     * @returns {string} 推荐使用场景
     */
    getModeRecommendation(mode) {
        const cached = this.getCachedModeInfo(mode, 'recommendation');
        if (cached) {
            return cached;
        }
        
        const recommendation = super.getModeRecommendation(mode);
        this.cacheModeInfo(mode, 'recommendation', recommendation);
        
        return recommendation;
    }
}
```

#### 内存管理
```javascript
// 及时清理资源
function cleanupImportModeManager() {
    // 移除所有模式变更监听器
    importModeManager.changeListeners = [];
    
    // 清理字段监听器
    importModeManager.fieldListeners.clear();
    
    // 清理验证器
    importModeManager.validators.clear();
    
    // 清理迁移规则
    importModeManager.migrations.clear();
    
    // 清理模式历史记录
    importModeManager.modeHistory = [];
    
    // 清理缓存
    if (importModeManager.modeCache) {
        importModeManager.modeCache.clear();
    }
    
    if (importModeManager.cacheTimeouts) {
        importModeManager.cacheTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        importModeManager.cacheTimeouts.clear();
    }
    
    importModeManager.log('📥 导入模式管理器资源已清理', 'debug');
}

// 在组件销毁时调用
window.addEventListener('beforeunload', cleanupImportModeManager);
```

## 故障排除

### 常见问题

#### 模式切换无响应
- **症状**：点击模式按钮后无任何反应
- **解决**：
  1. 检查导入模式管理器是否正确初始化
  2. 验证单选按钮事件监听器是否正确绑定
  3. 查看控制台错误日志

#### 模式描述未更新
- **症状**：切换模式后描述信息未变化
- **解决**：
  1. 检查模式描述元素是否存在
  2. 验证updateModeDescription方法是否正确执行
  3. 查看CSS样式是否正确应用

#### 设置未保存
- **症状**：模式切换后刷新页面发现设置未保存
- **解决**：
  1. 检查localStorage权限
  2. 验证设置保存逻辑
  3. 查看控制台错误日志

#### 模式历史记录异常
- **症状**：模式历史记录不更新或显示错误
- **解决**：
  1. 检查localStorage保存逻辑
  2. 验证模式历史记录更新机制
  3. 重启AE和扩展面板

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控模式变更事件
importModeManager.addModeChangeListener((event) => {
    const { oldMode, newMode, timestamp } = event.detail;
    console.log(`📥 导入模式变更: ${oldMode} -> ${newMode} (${timestamp})`);
});

// 监控字段变更事件
importModeManager.addFieldListener('mode', (newValue, oldValue, fieldPath) => {
    console.log(`⚙️ 字段变更: ${fieldPath} ${oldValue} -> ${newValue}`);
});
```

#### 性能监控
```javascript
// 记录模式切换性能
const startTime = performance.now();
const result = importModeManager.switchMode('project_adjacent');
const endTime = performance.now();

console.log(`⏱️ 模式切换耗时: ${endTime - startTime}ms`);

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
function inspectModeCache() {
    if (importModeManager.modeCache) {
        console.log('📥 模式缓存状态:', {
            size: importModeManager.modeCache.size,
            entries: Array.from(importModeManager.modeCache.entries()).map(([key, value]) => ({
                key: key,
                age: Date.now() - value.timestamp,
                data: value.data
            }))
        });
    }
    
    if (importModeManager.cacheTimeouts) {
        console.log('⏰ 缓存定时器数量:', importModeManager.cacheTimeouts.size);
    }
}

// 定期检查缓存状态
setInterval(inspectModeCache, 30000); // 每30秒检查一次
```

## 扩展性

### 自定义扩展

#### 扩展导入模式管理器
```javascript
// 创建自定义导入模式管理器类
class CustomImportModeManager extends ImportModeManager {
    constructor(settingsManager, csInterface, logFunction) {
        super(settingsManager, csInterface, logFunction);
        this.customModes = new Map();
        this.modeTransitions = new Map();
    }
    
    /**
     * 注册自定义导入模式
     * @param {string} modeName - 模式名称
     * @param {Object} modeConfig - 模式配置
     */
    registerCustomMode(modeName, modeConfig) {
        this.customModes.set(modeName, modeConfig);
        this.log(`📥 已注册自定义导入模式: ${modeName}`, 'debug');
    }
    
    /**
     * 获取所有可用的导入模式
     * @returns {Array} 可用模式列表
     */
    getAllAvailableModes() {
        const builtInModes = ['direct', 'project_adjacent', 'custom_folder'];
        const customModes = Array.from(this.customModes.keys());
        return [...builtInModes, ...customModes];
    }
    
    /**
     * 验证自定义导入模式
     * @param {string} mode - 导入模式
     * @returns {Object} 验证结果
     */
    validateMode(mode) {
        const builtInValidation = super.validateMode(mode);
        
        // 如果内置验证通过，直接返回
        if (builtInValidation.valid) {
            return builtInValidation;
        }
        
        // 检查自定义模式
        if (this.customModes.has(mode)) {
            return { valid: true };
        }
        
        // 返回原始验证结果
        return builtInValidation;
    }
    
    /**
     * 获取自定义模式描述
     * @param {string} mode - 导入模式
     * @returns {string} 模式描述
     */
    getModeDescription(mode) {
        if (this.customModes.has(mode)) {
            const customMode = this.customModes.get(mode);
            return customMode.description || `自定义模式: ${mode}`;
        }
        
        return super.getModeDescription(mode);
    }
    
    /**
     * 获取自定义模式优势
     * @param {string} mode - 导入模式
     * @returns {Array} 优势列表
     */
    getModeAdvantages(mode) {
        if (this.customModes.has(mode)) {
            const customMode = this.customModes.get(mode);
            return customMode.advantages || [];
        }
        
        return super.getModeAdvantages(mode);
    }
    
    /**
     * 获取自定义模式劣势
     * @param {string} mode - 导入模式
     * @returns {Array} 劣势列表
     */
    getModeDisadvantages(mode) {
        if (this.customModes.has(mode)) {
            const customMode = this.customModes.get(mode);
            return customMode.disadvantages || [];
        }
        
        return super.getModeDisadvantages(mode);
    }
    
    /**
     * 获取自定义模式推荐使用场景
     * @param {string} mode - 导入模式
     * @returns {string} 推荐使用场景
     */
    getModeRecommendation(mode) {
        if (this.customModes.has(mode)) {
            const customMode = this.customModes.get(mode);
            return customMode.recommendation || '请根据具体需求选择';
        }
        
        return super.getModeRecommendation(mode);
    }
}

// 使用自定义导入模式管理器
const customImportModeManager = new CustomImportModeManager(settingsManager, csInterface, logFunction);

// 注册自定义模式
customImportModeManager.registerCustomMode('cloud_sync', {
    description: '云端同步模式 - 将文件同步到云端后导入',
    advantages: [
        '支持云端存储',
        '跨设备同步',
        '自动备份'
    ],
    disadvantages: [
        '需要网络连接',
        '上传时间较长',
        '依赖云端服务'
    ],
    recommendation: '适用于需要云端备份和跨设备同步的项目'
});

// 切换到自定义模式
const cloudSyncResult = customImportModeManager.switchMode('cloud_sync');
if (cloudSyncResult.success) {
    console.log('✅ 已切换到云端同步模式');
}
```

#### 插件化架构
```javascript
// 创建导入模式插件
class ImportModePlugin {
    constructor(importModeManager) {
        this.importModeManager = importModeManager;
        this.init();
    }
    
    init() {
        // 注册插件特定的验证规则
        this.importModeManager.addValidator('plugin.customOption', (value) => {
            // 自定义验证逻辑
            return { valid: true };
        });
        
        // 注册插件特定的迁移规则
        this.importModeManager.addMigration(3, (settings) => {
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
        // 监听模式变更事件
        this.importModeManager.addModeChangeListener((event) => {
            this.handleModeChange(event);
        });
        
        // 监听字段变更事件
        this.importModeManager.addFieldListener('mode', (newValue, oldValue, fieldPath) => {
            this.handleFieldChange(newValue, oldValue, fieldPath);
        });
        
        // 监听设置保存事件
        this.importModeManager.addListener((eventType, data) => {
            if (eventType === 'saved') {
                this.handleSettingsSaved(data);
            }
        });
    }
    
    /**
     * 处理模式变更事件
     * @param {CustomEvent} event - 模式变更事件
     */
    handleModeChange(event) {
        const { oldMode, newMode, timestamp } = event.detail;
        console.log(`📥 插件: 导入模式变更 ${oldMode} -> ${newMode}`);
        
        // 执行插件特定的逻辑
        this.onModeChanged(oldMode, newMode);
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
     * 模式变更时的处理逻辑
     * @param {string} oldMode - 旧模式
     * @param {string} newMode - 新模式
     */
    onModeChanged(oldMode, newMode) {
        // 插件特定的模式变更处理逻辑
        switch (newMode) {
            case 'direct':
                console.log('📥 插件: 已切换到直接导入模式');
                break;
                
            case 'project_adjacent':
                console.log('📥 插件: 已切换到项目旁复制模式');
                break;
                
            case 'custom_folder':
                console.log('📥 插件: 已切换到指定文件夹模式');
                break;
                
            default:
                console.log(`📥 插件: 已切换到未知模式: ${newMode}`);
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
            case 'mode':
                console.log(`📥 插件: 导入模式字段变更 ${oldValue} -> ${newValue}`);
                break;
                
            case 'projectAdjacentFolder':
                console.log(`📥 插件: 项目旁文件夹字段变更 ${oldValue} -> ${newValue}`);
                break;
                
            case 'customFolderPath':
                console.log(`📥 插件: 指定文件夹路径字段变更 ${oldValue} -> ${newValue}`);
                break;
                
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
            const event = new CustomEvent(`importModePlugin_${eventType}`, {
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
const plugin = new ImportModePlugin(importModeManager);