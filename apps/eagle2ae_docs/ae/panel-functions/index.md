# AE 扩展 - 面板功能概览

欢迎查阅 Eagle2Ae AE 扩展的面板功能文档。本部分详细介绍了扩展面板中各个功能模块的使用方法和实现原理。

## 📚 面板功能目录

### 核心功能模块
- **[高级设置面板](./advanced-settings-panel.md)** - 高级设置和配置管理
- **[批量图层导出](./batch-layer-export.md)** - 批量导出AE图层到Eagle
- **[连接状态](./connection-status.md)** - 实时显示连接状态和质量
- **[检测图层](./detect-layers.md)** - 检测和分析AE项目中的图层
- **[导出路径设置](./export-path-settings.md)** - 配置导出文件的保存路径
- **[导出到 Eagle](./export-to-eagle.md)** - 将AE素材导出到Eagle素材库
- **[导入行为设置](./import-behavior-settings.md)** - 配置素材导入AE后的行为
- **[导入模式设置](./import-mode-settings.md)** - 配置素材导入AE的方式
- **[导入设置指南](./import-settings-guide.md)** - 详细说明所有导入设置选项

### 功能模块详解

#### 高级设置面板
提供扩展的所有高级设置选项，包括：
- 导入模式配置（直接导入、项目旁复制、自定义文件夹）
- 导入行为配置（不导入合成、当前时间、时间轴开始）
- 导出路径设置（桌面、项目旁、自定义文件夹）
- 高级选项（自动复制、阅后即焚、时间戳前缀、合成名前缀）
- 通信端口设置（端口号配置）
- UI设置（主题、语言、日志显示等）

#### 批量图层导出
支持将AE项目中的多个图层批量导出为图片文件并自动归档到Eagle：
- 支持多种图层类型（形状图层、文本图层、纯色图层等）
- 可选择导出格式（PNG、JPG、TIFF等）
- 支持自定义导出路径和文件名
- 提供导出进度显示和状态反馈

#### 连接状态
实时监控和显示扩展与各组件的连接状态：
- AE连接状态（与After Effects的连接）
- Eagle连接状态（与Eagle插件的连接）
- 项目状态（AE项目是否打开）
- 合成状态（活动合成是否存在）
- 连接质量（延迟、稳定性等指标）

#### 检测图层
分析和检测AE项目中的图层信息：
- 图层类型识别（形状、文本、纯色、预合成等）
- 素材来源分析（设计文件、素材文件等）
- 图层属性检查（尺寸、位置、效果等）
- 导出可行性评估

#### 导出路径设置
配置导出文件的保存位置：
- 桌面导出（保存到系统桌面）
- 项目旁导出（保存到AE项目文件旁边）
- 指定文件夹导出（保存到用户自定义文件夹）
- 支持路径验证和错误提示

#### 导出到 Eagle
将AE素材导出并自动归档到Eagle素材库：
- 支持多种素材类型（图片、视频、音频等）
- 自动添加标签和分类信息
- 支持自定义导出设置
- 提供导出进度和结果反馈

#### 导入行为设置
配置素材导入AE后的行为：
- 不导入合成（仅添加到项目面板）
- 当前时间（添加到时间轴当前指针位置）
- 时间轴开始（添加到时间轴0秒位置）
- 支持预合成创建选项

#### 导入模式设置
配置素材导入AE的方式：
- 直接导入（直接链接到原始文件）
- 项目旁复制（复制到AE项目文件旁边）
- 自定义文件夹（复制到用户指定文件夹）
- 支持不同模式的详细配置

#### 导入设置指南
提供所有导入设置选项的详细说明：
- 导入模式详解（各种模式的优缺点和适用场景）
- 导入行为详解（不同行为的影响和使用建议）
- 高级选项说明（自动复制、阅后即焚等功能）
- 最佳实践建议（根据不同工作流推荐设置）

## 🚀 功能亮点

### 智能配置管理
- **自动保存** - 设置变更时自动保存，无需手动点击保存按钮
- **字段监听** - 支持对特定设置字段的变更监听
- **配置验证** - 提供实时配置验证和错误提示
- **预设管理** - 支持配置预设的导出、导入和备份

### 实时状态监控
- **连接质量监控** - 实时显示连接延迟和稳定性
- **项目状态检测** - 自动检测AE项目和合成状态变化
- **错误处理** - 智能错误检测和恢复机制
- **日志系统** - 详细的日志记录和显示

### 用户体验优化
- **响应式设计** - 适配不同屏幕尺寸和分辨率
- **主题切换** - 支持暗色和亮色主题
- **语言切换** - 支持中英文动态切换
- **快捷操作** - 提供一键式快速操作按钮

## 🛠️ 技术实现

### 面板架构
扩展面板采用模块化设计，每个功能模块相对独立：

```javascript
/**
 * 面板功能模块基类
 */
class PanelFunctionModule {
    constructor(panelId, csInterface) {
        this.panelId = panelId;
        this.csInterface = csInterface;
        this.initialized = false;
    }

    /**
     * 初始化模块
     */
    async initialize() {
        if (this.initialized) return;
        
        try {
            await this.setupEventListeners();
            await this.loadSettings();
            await this.renderUI();
            this.initialized = true;
            
            this.log(`模块 ${this.constructor.name} 初始化完成`, 'debug');
        } catch (error) {
            this.log(`模块 ${this.constructor.name} 初始化失败: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * 设置事件监听器
     */
    async setupEventListeners() {
        // 子类实现
    }

    /**
     * 加载设置
     */
    async loadSettings() {
        // 子类实现
    }

    /**
     * 渲染UI
     */
    async renderUI() {
        // 子类实现
    }

    /**
     * 销毁模块
     */
    async destroy() {
        if (!this.initialized) return;
        
        try {
            await this.cleanupEventListeners();
            await this.saveSettings();
            this.initialized = false;
            
            this.log(`模块 ${this.constructor.name} 已销毁`, 'debug');
        } catch (error) {
            this.log(`模块 ${this.constructor.name} 销毁失败: ${error.message}`, 'error');
        }
    }

    /**
     * 清理事件监听器
     */
    async cleanupEventListeners() {
        // 子类实现
    }

    /**
     * 保存设置
     */
    async saveSettings() {
        // 子类实现
    }

    /**
     * 日志记录
     */
    log(message, level = 'info') {
        if (window.eagleToAeApp && typeof window.eagleToAeApp.log === 'function') {
            window.eagleToAeApp.log(message, level);
        } else {
            console.log(`[${this.constructor.name}] ${message}`);
        }
    }
}
```

### 设置管理系统
每个面板功能模块都有独立的设置管理系统：

```javascript
/**
 * 面板设置管理器
 */
class PanelSettingsManager {
    constructor(panelId) {
        this.panelId = panelId;
        this.settings = {};
        this.listeners = new Map();
    }

    /**
     * 获取面板特定的设置键
     */
    getPanelSettingKey(key) {
        return `${this.panelId}_${key}`;
    }

    /**
     * 获取设置
     */
    getSetting(key, defaultValue = null) {
        const panelKey = this.getPanelSettingKey(key);
        const value = localStorage.getItem(panelKey);
        
        if (value === null) {
            return defaultValue;
        }
        
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    }

    /**
     * 设置值
     */
    setSetting(key, value) {
        const panelKey = this.getPanelSettingKey(key);
        
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(panelKey, stringValue);
            
            // 触发监听器
            this.triggerListeners(key, value);
            
            return true;
        } catch (error) {
            console.error(`设置保存失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 添加监听器
     */
    addListener(key, listener) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        
        this.listeners.get(key).add(listener);
    }

    /**
     * 移除监听器
     */
    removeListener(key, listener) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).delete(listener);
        }
    }

    /**
     * 触发监听器
     */
    triggerListeners(key, value) {
        if (this.listeners.has(key)) {
            const listeners = this.listeners.get(key);
            listeners.forEach(listener => {
                try {
                    listener(value, key);
                } catch (error) {
                    console.error(`监听器执行失败: ${error.message}`);
                }
            });
        }
    }
}
```

### UI 控制系统
面板UI支持动态控制和自定义：

```javascript
/**
 * UI 控制系统
 */
class UIControlSystem {
    constructor() {
        this.uiSettings = {
            theme: true,
            language: true,
            log: true,
            projectInfo: true,
            logPanel: true,
            header: true,
            fullscreen: false
        };
        
        this.init();
    }

    /**
     * 初始化UI控制系统
     */
    init() {
        // 加载UI设置
        this.loadUISettings();
        
        // 应用UI设置
        this.applyUISettings();
        
        // 绑定UI控制事件
        this.bindUIControlEvents();
    }

    /**
     * 加载UI设置
     */
    loadUISettings() {
        try {
            const savedSettings = localStorage.getItem('uiSettings');
            if (savedSettings) {
                this.uiSettings = { ...this.uiSettings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('加载UI设置失败:', error);
        }
    }

    /**
     * 应用UI设置
     */
    applyUISettings() {
        // 应用主题设置
        this.applyThemeSettings();
        
        // 应用语言设置
        this.applyLanguageSettings();
        
        // 应用组件显示设置
        this.applyComponentVisibility();
    }

    /**
     * 应用主题设置
     */
    applyThemeSettings() {
        const theme = localStorage.getItem('theme') || 'dark';
        document.documentElement.classList.toggle('theme-light', theme === 'light');
    }

    /**
     * 应用语言设置
     */
    applyLanguageSettings() {
        const language = localStorage.getItem('language') || 'zh-CN';
        document.documentElement.setAttribute('lang', language);
    }

    /**
     * 应用组件显示设置
     */
    applyComponentVisibility() {
        // 根据设置控制各组件显示/隐藏
        Object.entries(this.uiSettings).forEach(([component, visible]) => {
            const element = document.getElementById(component);
            if (element) {
                element.style.display = visible ? '' : 'none';
            }
        });
    }

    /**
     * 绑定UI控制事件
     */
    bindUIControlEvents() {
        // 主题切换按钮
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // 语言切换按钮
        const languageToggleBtn = document.getElementById('language-toggle-btn');
        if (languageToggleBtn) {
            languageToggleBtn.addEventListener('click', () => this.toggleLanguage());
        }

        // 全屏模式切换
        const fullscreenToggleBtn = document.getElementById('fullscreen-toggle-btn');
        if (fullscreenToggleBtn) {
            fullscreenToggleBtn.addEventListener('click', () => this.toggleFullscreen());
        }
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        localStorage.setItem('theme', newTheme);
        this.applyThemeSettings();
        
        // 触发主题切换事件
        document.dispatchEvent(new CustomEvent('themechange', {
            detail: { theme: newTheme }
        }));
    }

    /**
     * 切换语言
     */
    toggleLanguage() {
        const currentLang = localStorage.getItem('language') || 'zh-CN';
        const newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
        
        localStorage.setItem('language', newLang);
        this.applyLanguageSettings();
        
        // 触发语言切换事件
        document.dispatchEvent(new CustomEvent('languagechange', {
            detail: { language: newLang }
        }));
        
        // 更新页面文本
        if (window.i18n && typeof window.i18n.updatePageTexts === 'function') {
            window.i18n.updatePageTexts();
        }
    }

    /**
     * 切换全屏模式
     */
    toggleFullscreen() {
        const contentContainer = document.querySelector('.content');
        if (contentContainer) {
            contentContainer.classList.toggle('fullscreen-mode');
            this.uiSettings.fullscreen = contentContainer.classList.contains('fullscreen-mode');
            
            // 保存设置
            try {
                localStorage.setItem('uiSettings', JSON.stringify(this.uiSettings));
            } catch (error) {
                console.warn('保存UI设置失败:', error);
            }
            
            // 调整内容偏移
            if (window.adjustContentOffset) {
                setTimeout(() => window.adjustContentOffset(), 50);
            }
        }
    }
}
```

## 🎯 使用指南

### 功能模块使用建议

#### 高级设置面板
1. **导入模式选择**
   - **直接导入**：适用于临时项目或不需要长期保存素材的场景
   - **项目旁复制**：适用于正式项目，确保项目可移植性
   - **自定义文件夹**：适用于固定工作流，便于素材管理

2. **导入行为配置**
   - **不导入合成**：仅将素材添加到项目面板，不自动添加到时间轴
   - **当前时间**：将素材添加到时间轴当前指针位置
   - **时间轴开始**：将素材移至时间轴开始处（0秒位置）

3. **导出路径设置**
   - **桌面导出**：快速导出到桌面，便于临时使用
   - **项目旁导出**：与项目文件保存在一起，便于管理
   - **指定文件夹导出**：导出到固定文件夹，便于批量处理

#### 批量图层导出
1. **图层选择**
   - 在AE中选择需要导出的图层
   - 支持连续选择和非连续选择
   - 可选择整个合成的所有图层

2. **导出设置**
   - 选择导出格式（PNG、JPG、TIFF等）
   - 设置导出路径和文件名前缀
   - 配置导出选项（分辨率、质量等）

3. **执行导出**
   - 点击"导出图层"或"导出到Eagle"按钮
   - 等待导出完成
   - 查看导出结果和日志

#### 连接状态监控
1. **状态查看**
   - 实时查看AE连接状态和Eagle连接状态
   - 监控连接质量和响应时间
   - 检查项目和合成状态

2. **问题排查**
   - 根据状态指示灯颜色判断连接状态
   - 查看详细日志信息定位问题
   - 使用测试连接功能验证连接

#### 检测图层
1. **图层分析**
   - 点击"检测图层"按钮分析当前合成中的图层
   - 查看图层类型和属性信息
   - 评估图层导出可行性

2. **结果解读**
   - 理解不同类型图层的特点
   - 识别可导出和不可导出的图层
   - 根据分析结果制定导出策略

## 🔧 故障排除

### 常见问题

#### 设置不生效
- **症状**：修改设置后功能未按预期工作
- **解决**：
  1. 检查设置是否已正确保存
  2. 重启扩展面板使设置生效
  3. 检查是否有其他设置冲突

#### 功能模块无响应
- **症状**：点击功能按钮无任何反应
- **解决**：
  1. 检查模块是否已正确初始化
  2. 查看控制台错误日志
  3. 重启AE和扩展面板

#### UI显示异常
- **症状**：界面元素显示不正确或缺失
- **解决**：
  1. 检查UI设置是否正确
  2. 清除浏览器缓存
  3. 重置UI设置到默认值

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控面板功能模块初始化
window.addEventListener('panelModuleInitialized', (event) => {
    console.log('面板模块初始化完成:', event.detail);
});

// 监控设置变更
window.addEventListener('settingsChanged', (event) => {
    console.log('设置已变更:', event.detail);
});
```

#### 性能监控
```javascript
// 监控面板功能模块性能
performance.mark('panel-module-init-start');

// ... 模块初始化代码 ...

performance.mark('panel-module-init-end');
performance.measure('panel-module-init', 'panel-module-init-start', 'panel-module-init-end');

const measure = performance.getEntriesByName('panel-module-init')[0];
console.log(`面板模块初始化耗时: ${measure.duration}ms`);
```

#### 内存使用监控
```javascript
// 监控内存使用情况
function logMemoryUsage() {
    if (performance.memory) {
        console.log('内存使用情况:', {
            used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
            total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`,
            limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        });
    }
}

// 定期监控内存使用
setInterval(logMemoryUsage, 30000); // 每30秒监控一次
```

## 📖 相关文档

- **[使用手册](../使用手册/)** - 用户操作指南
- **[API 参考](../api/)** - 详细的API文档
- **[开发手册](../development/)** - 开发者指南
- **[功能文档](../features/)** - 功能实现说明

---
**请使用左侧导航栏浏览各个面板功能文档，获取详细信息。**