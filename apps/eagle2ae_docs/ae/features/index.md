# AE 扩展 - 功能概览

欢迎来到 Eagle2Ae AE 扩展的功能文档中心。这里详细介绍了扩展提供的所有核心功能和高级特性。

## 📚 功能目录

### 核心功能
- **[多面板支持](./multi-panel-support.md)** - 支持同时打开多个扩展面板实例，每个面板拥有独立配置
- **[UI 控制系统](./ui-control-system.md)** - 主题切换、语言切换、组件显示控制等个性化功能
- **[拖拽导入增强](./enhanced-drag-and-drop.md)** - 文件夹拖拽、序列帧检测、项目内文件检测
- **[剪贴板导入优化](./optimized-clipboard-import.md)** - 智能剪贴板图片检测和导入
- **[项目状态检测器](./project-status-checker.md)** - 全面的项目状态检测系统
- **[虚拟对话框系统](./virtual-dialog-system.md)** - 演示模式下的虚拟对话框体验

### 管理系统
- **[预设管理系统](./preset-management-system.md)** - 每个面板独立的预设文件管理
- **[设置管理系统](./settings-management-system.md)** - 高级设置管理和字段监听

### 模块功能
- **[文件夹打开模块](./folder-opener-module.md)** - 文件夹打开功能的核心实现
- **[文件夹打开系统升级](./folder-opening-system-upgrade.md)** - 文件夹打开功能的增强实现
- **[图层检测系统升级](./layer-detection-system-upgrade.md)** - 图层检测功能的增强实现
- **[素材分类修复](./material-classification-fix.md)** - 素材分类的修复实现
- **[素材分类](./material-classification.md)** - 素材分类的核心实现

## 🚀 功能亮点

### v2.4.0 版本新增功能
1. **多面板支持** - 突破单面板限制，支持并行工作流
2. **UI 控制系统** - 全方位个性化界面定制
3. **导入功能增强** - 拖拽和剪贴板导入全面优化
4. **状态检测系统** - 确保操作安全性和准确性
5. **虚拟对话框系统** - 提供一致的演示模式体验

### 性能优化
- **智能缓存机制** - 减少重复检测，提高响应速度
- **防抖处理** - 避免频繁操作导致的性能问题
- **内存优化** - 及时清理临时数据，减少内存占用

### 用户体验改进
- **响应式设计** - 适配不同屏幕尺寸
- **视觉反馈** - 提供实时状态提示
- **错误处理** - 优雅处理各种异常情况

## 🛠️ 技术实现

### 架构设计
- **模块化设计** - 功能解耦，便于维护和扩展
- **事件驱动** - 基于事件的通信机制
- **配置管理** - 统一的配置管理系统
- **多面板架构** - 支持同时打开多个扩展面板实例，每个面板拥有独立配置

### 核心技术
- **CEP 扩展技术** - 基于 Adobe CEP 技术栈
- **HTTP 轮询通信** - 通过HTTP轮询机制与Eagle插件通信
- **ExtendScript 集成** - 与 AE 脚本深度集成
- **现代前端技术** - HTML5、CSS3、ES6+

### 核心功能实现

#### 多面板支持
支持同时打开多个扩展面板实例，每个面板拥有独立的预设文件和配置。

```javascript
// 面板ID识别机制
getPanelId() {
    try {
        if (this.csInterface && typeof this.csInterface.getExtensionID === 'function') {
            const extensionId = this.csInterface.getExtensionID();
            
            // 从 Extension ID 中提取面板编号
            if (extensionId.includes('panel1')) {
                return 'panel1';
            } else if (extensionId.includes('panel2')) {
                return 'panel2';
            } else if (extensionId.includes('panel3')) {
                return 'panel3';
            }
        }
        
        // Demo 模式：从 URL 参数获取
        if (window.location && window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            const panelParam = urlParams.get('panel');
            if (panelParam && ['panel1', 'panel2', 'panel3'].includes(panelParam)) {
                return panelParam;
            }
        }
        
        // 默认返回 panel1
        return 'panel1';
    } catch (error) {
        return 'panel1';
    }
}
```

#### UI 控制系统
全新的UI控制系统，支持主题切换、语言切换、组件显示控制等功能。

```javascript
// 主题切换实现
applyTheme(theme) {
    const root = document.documentElement;
    const btn = document.getElementById('theme-toggle-btn');
    const iconSpan = btn ? btn.querySelector('.icon') : null;
    const isLight = theme === 'light';

    // 切换CSS类
    root.classList.toggle('theme-light', isLight);
    
    // 保存到localStorage
    try { 
        this.setPanelLocalStorage('aeTheme', isLight ? 'light' : 'dark'); 
    } catch (_) { }

    // 更新按钮状态
    if (btn) {
        btn.setAttribute('aria-pressed', String(isLight));
        btn.title = isLight ? '切换为暗色模式' : '切换为亮色模式';
        if (iconSpan) iconSpan.textContent = isLight ? '☀️' : '🌙';
    }
}

// 语言切换实现
toggleLanguage() {
    const currentLang = this.getCurrentLanguage();
    const nextLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    
    // 更新语言设置
    this.updateLanguage(nextLang);
    
    // 保存设置
    try {
        this.setPanelLocalStorage('language', nextLang);
        this.setPanelLocalStorage('lang', nextLang);
    } catch (e) {
        console.warn('无法保存语言设置:', e);
    }
    
    // 更新UI文本
    if (this.i18n && typeof this.i18n.updatePageTexts === 'function') {
        this.i18n.updatePageTexts();
    }
}
```

#### 拖拽导入增强
全面增强的拖拽导入功能，支持文件夹拖拽、序列帧检测等高级特性。

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

#### 项目状态检测器
全面的项目状态检测系统，确保操作的安全性和准确性。

```javascript
// 项目状态检测器类
class ProjectStatusChecker {
    constructor(csInterface, logManager) {
        this.csInterface = csInterface;
        this.logManager = logManager;
        this.cache = new Map();
        this.cacheTimeout = 5000; // 5秒缓存超时
        
        this.log('📊 项目状态检测器已初始化', 'debug');
    }
    
    /**
     * 检测环境
     * @returns {Object} 环境检测结果
     */
    checkEnvironment() {
        const envInfo = {
            isCEP: false,
            isDemo: false,
            hasCSInterface: false,
            aeVersion: 'unknown',
            cepVersion: 'unknown',
            platform: 'unknown'
        };

        try {
            // 检测是否为CEP环境
            envInfo.isCEP = typeof window !== 'undefined' && 
                           typeof window.cep !== 'undefined' && 
                           typeof window.cep.process !== 'undefined';

            // 检测是否为Demo模式
            envInfo.isDemo = window.__DEMO_MODE_ACTIVE__ === true || 
                             (window.demoMode && window.demoMode.state && window.demoMode.state.currentMode !== 'normal');

            // 检测CSInterface
            envInfo.hasCSInterface = typeof CSInterface !== 'undefined';

            // 获取AE版本信息
            if (envInfo.hasCSInterface) {
                try {
                    const csInterface = new CSInterface();
                    const hostEnv = csInterface.getHostEnvironment();
                    if (hostEnv && hostEnv.appVersion) {
                        envInfo.aeVersion = hostEnv.appVersion;
                    }
                } catch (error) {
                    // 忽略获取版本信息的错误
                }
            }

            return envInfo;
        } catch (error) {
            return { ...envInfo, error: error.message };
        }
    }
}
```

#### 预设管理系统
每个面板实例独立的预设文件管理，支持导出导入和备份恢复。

```javascript
// 预设管理器
class PresetManager {
    constructor(panelId, settingsManager, csInterface) {
        this.panelId = panelId;
        this.settingsManager = settingsManager;
        this.csInterface = csInterface;
        
        this.log(`💾 预设管理器已为面板 ${panelId} 初始化`, 'debug');
    }
    
    /**
     * 获取当前面板的预设文件名
     * @returns {string} 'Eagle2Ae1.Presets', 'Eagle2Ae2.Presets', 或 'Eagle2Ae3.Presets'
     */
    getPresetFileName() {
        const panelNumber = this.panelId.replace('panel', '');
        return `Eagle2Ae${panelNumber}.Presets`;
    }
}
```

#### 设置管理系统
高级设置管理功能，支持字段监听和自动保存。

```javascript
// 设置管理器
class SettingsManager {
    constructor(panelId) {
        this.panelId = panelId;
        this.settings = this.getDefaultSettings();
        this.validators = new Map();
        this.fieldListeners = new Map();
        
        this.log(`⚙️ 设置管理器已为面板 ${panelId} 初始化`, 'debug');
    }
    
    /**
     * 添加字段监听器
     * @param {string} fieldPath - 字段路径
     * @param {Function} listener - 监听器函数
     * @param {boolean} once - 是否只监听一次
     * @returns {Function} 移除监听器的函数
     */
    addFieldListener(fieldPath, listener, once = false) {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }
        
        if (!this.fieldListeners.has(fieldPath)) {
            this.fieldListeners.set(fieldPath, []);
        }
        
        this.fieldListeners.get(fieldPath).push(listener);
        
        this.log(`👂 已添加字段 ${fieldPath} 的监听器`, 'debug');
        
        // 返回移除监听器的函数
        return () => {
            this.removeFieldListener(fieldPath, listener);
        };
    }
}
```

## 📖 使用指南

建议按以下顺序阅读功能文档：

1. **入门级功能**
   - [多面板支持](./multi-panel-support.md) - 了解如何使用多个面板实例
   - [UI 控制系统](./ui-control-system.md) - 个性化界面设置
   - [拖拽导入增强](./enhanced-drag-and-drop.md) - 掌握拖拽导入技巧

2. **进阶级功能**
   - [剪贴板导入优化](./optimized-clipboard-import.md) - 提高剪贴板导入效率
   - [项目状态检测器](./project-status-checker.md) - 理解状态检测机制
   - [虚拟对话框系统](./virtual-dialog-system.md) - 了解演示模式功能

3. **专家级功能**
   - [预设管理系统](./preset-management-system.md) - 高级预设管理
   - [设置管理系统](./settings-management-system.md) - 深度设置定制
   - [文件夹打开模块](./folder-opener-module.md) - 文件夹处理机制

## 🎯 最佳实践

### 功能组合使用
- 结合多面板支持和UI控制系统，创建个性化工作环境
- 利用拖拽导入增强和剪贴板导入优化，提高素材处理效率
- 通过项目状态检测器和虚拟对话框系统，确保操作安全性

### 性能优化建议
- 合理使用缓存机制，避免重复检测
- 适时启用防抖处理，减少不必要的操作
- 定期清理临时数据，保持良好性能

### 故障排除
- 查看各功能文档中的故障排除章节
- 利用日志系统定位问题
- 参考常见问题解答

---
**请使用左侧导航栏浏览各个功能文档，获取详细信息。**