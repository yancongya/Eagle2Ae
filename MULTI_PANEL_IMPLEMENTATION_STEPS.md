# Eagle2Ae 真多面板实施步骤

## ✅ 已完成

### 1. Manifest.xml 配置
- ✅ 已配置 3 个独立面板（panel1, panel2, panel3）
- ✅ 已优化菜单名称：
  - Eagle2Ae - 默认配置
  - Eagle2Ae - 快速预览
  - Eagle2Ae - 音频项目

---

## 🔧 需要实施的修改

### 修改 1: 优化面板识别逻辑（main.js）

**位置**：`getCurrentPanelId()` 方法

**当前问题**：
- 使用 `includes()` 方法匹配，不够精确
- 没有处理完整的 Extension ID

**优化方案**：
```javascript
getCurrentPanelId() {
    try {
        // 在 CEP 环境中获取扩展 ID
        if (this.csInterface && typeof this.csInterface.getExtensionID === 'function') {
            const extensionId = this.csInterface.getExtensionID();
            console.log(`[Panel ID] CEP Extension ID: ${extensionId}`);
            
            // 精确匹配完整的 Extension ID
            if (extensionId === 'com.yanrouya.eagle2ae.panel1') {
                return 'panel1';
            } else if (extensionId === 'com.yanrouya.eagle2ae.panel2') {
                return 'panel2';
            } else if (extensionId === 'com.yanrouya.eagle2ae.panel3') {
                return 'panel3';
            }
            
            // 兼容旧的 includes 方式（向后兼容）
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
                console.log(`[Panel ID] URL 参数面板: ${panelParam}`);
                return panelParam;
            }
        }
        
        // 默认返回 panel1
        console.log('[Panel ID] 使用默认面板: panel1');
        return 'panel1';
        
    } catch (error) {
        console.error('[Panel ID] 获取面板 ID 失败:', error);
        return 'panel1';
    }
}
```

---

### 修改 2: 优化面板显示名称（main.js）

**位置**：`getPanelDisplayName()` 方法

**优化方案**：
```javascript
getPanelDisplayName() {
    const panelNames = {
        // 新格式 (panel1, panel2, panel3)
        'panel1': window.i18n?.getText('panels.defaultConfig') || '默认配置',
        'panel2': window.i18n?.getText('panels.quickPreview') || '快速预览',
        'panel3': window.i18n?.getText('panels.audioProject') || '音频项目',
        // 完整 Extension ID 格式
        'com.yanrouya.eagle2ae.panel1': window.i18n?.getText('panels.defaultConfig') || '默认配置',
        'com.yanrouya.eagle2ae.panel2': window.i18n?.getText('panels.quickPreview') || '快速预览',
        'com.yanrouya.eagle2ae.panel3': window.i18n?.getText('panels.audioProject') || '音频项目'
    };
    
    return panelNames[this.currentPanelId] || (window.i18n?.getText('panels.unknownPanel') || '未知面板');
}
```

---

### 修改 3: 在标题栏显示面板名称（main.js）

**位置**：在 `DOMContentLoaded` 事件中添加

**新增代码**：
```javascript
// 在 DOMContentLoaded 中，初始化完成后
document.addEventListener('DOMContentLoaded', async () => {
    aeExtension = new AEExtension();
    window.eagleToAeApp = aeExtension;
    window.aeExtension = aeExtension;
    
    // 🔥 新增：更新标题栏显示当前面板名称
    updatePanelTitle();
    
    // ... 其他初始化代码
});

// 🔥 新增：更新面板标题的函数
function updatePanelTitle() {
    const titleElement = document.getElementById('title-text');
    if (titleElement && aeExtension) {
        const panelName = aeExtension.getPanelDisplayName();
        titleElement.textContent = `Eagle2Ae - ${panelName}`;
        console.log(`[Panel Title] 已更新标题: Eagle2Ae - ${panelName}`);
    }
}
```

---

### 修改 4: 移除不需要的代码（main.js）

**需要移除的方法**（如果存在）：
- `switchToPanel()` - 不再需要手动切换面板
- 面板选择器的事件监听器

**需要保留的方法**：
- `getCurrentPanelId()` - 识别当前面板
- `getPanelDisplayName()` - 获取面板显示名称
- `saveCurrentPanelConfig()` - 保存配置
- `loadPanelConfig()` - 加载配置
- `getDefaultPanelConfig()` - 获取默认配置

---

### 修改 5: 优化配置存储键名（main.js）

**当前问题**：
- 配置键名可能不够清晰

**优化方案**：
```javascript
saveCurrentPanelConfig() {
    try {
        const panelConfig = {
            panelId: this.currentPanelId,
            panelName: this.getPanelDisplayName(),
            lastUsed: new Date().toISOString(),
            importSettings: this.settingsManager.getSettings(),
            userPreferences: this.settingsManager.getPreferences(),
            // ... 其他配置
        };
        
        // 使用清晰的配置键名
        const configKey = `eagle2ae_${this.currentPanelId}_config`;
        localStorage.setItem(configKey, JSON.stringify(panelConfig));
        
        console.log(`[Panel Config] 已保存面板配置: ${this.currentPanelId}`);
        console.log(`[Panel Config] 配置键名: ${configKey}`);
        return true;
    } catch (error) {
        console.error('[Panel Config] 保存面板配置失败:', error);
        return false;
    }
}
```

---

### 修改 6: 添加面板初始化日志（main.js）

**位置**：在 `AEExtension` 构造函数中

**新增代码**：
```javascript
constructor() {
    // ... 现有代码
    
    // 🔥 新增：输出面板信息
    console.log('='.repeat(60));
    console.log('[Eagle2Ae] 面板初始化');
    console.log(`[Eagle2Ae] 面板 ID: ${this.currentPanelId}`);
    console.log(`[Eagle2Ae] 面板名称: ${this.panelDisplayName}`);
    console.log(`[Eagle2Ae] Extension ID: ${this.csInterface?.getExtensionID?.() || 'N/A'}`);
    console.log('='.repeat(60));
}
```

---

## 🎨 UI 优化（可选）

### 选项 1: 在标题栏添加面板徽章

```html
<!-- 在标题栏中添加 -->
<div class="header" id="main-header">
    <a href="#" id="title-link" class="title">
        <img src="public/logo.png" alt="Eagle2AE Logo" class="title-logo">
        <div class="title-text" id="title-text">Eagle2Ae</div>
        <!-- 🔥 新增：面板徽章 -->
        <span class="panel-badge" id="panel-badge">默认</span>
    </a>
    <!-- ... -->
</div>
```

```css
/* 面板徽章样式 */
.panel-badge {
    display: inline-block;
    padding: 2px 8px;
    margin-left: 8px;
    font-size: 10px;
    font-weight: 600;
    background: rgba(153, 102, 204, 0.2);
    border: 1px solid rgba(153, 102, 204, 0.4);
    border-radius: 12px;
    color: #9966cc;
}

html.theme-light .panel-badge {
    background: rgba(153, 102, 204, 0.1);
    border-color: rgba(153, 102, 204, 0.3);
}
```

### 选项 2: 使用不同颜色区分面板

```javascript
// 根据面板 ID 设置主题色
const panelColors = {
    'panel1': '#9966cc',  // 紫色 - 默认配置
    'panel2': '#3498db',  // 蓝色 - 快速预览
    'panel3': '#e74c3c'   // 红色 - 音频项目
};

const panelColor = panelColors[this.currentPanelId] || '#9966cc';
document.documentElement.style.setProperty('--panel-color', panelColor);
```

---

## 🧪 测试清单

完成修改后，需要测试：

### 基础功能测试
- [ ] 从 AE 菜单可以看到 3 个面板选项
- [ ] 每个面板显示正确的名称
- [ ] 可以同时打开 3 个面板
- [ ] 每个面板的标题栏显示正确

### 配置测试
- [ ] Panel 1 修改配置后，Panel 2 不受影响
- [ ] Panel 2 修改配置后，Panel 3 不受影响
- [ ] 关闭面板后重新打开，配置保持不变
- [ ] 每个面板的 localStorage 键名正确

### 日志测试
- [ ] 控制台输出正确的面板 ID
- [ ] 控制台输出正确的 Extension ID
- [ ] 配置保存和加载有正确的日志

### 国际化测试
- [ ] 切换语言后，面板名称正确显示
- [ ] 中文和英文都能正确显示

---

## 📝 实施顺序

建议按以下顺序实施：

1. ✅ **已完成**：优化 manifest.xml 菜单名称
2. **立即执行**：优化 `getCurrentPanelId()` 方法
3. **立即执行**：优化 `getPanelDisplayName()` 方法
4. **立即执行**：添加 `updatePanelTitle()` 函数
5. **立即执行**：在 DOMContentLoaded 中调用 `updatePanelTitle()`
6. **立即执行**：添加面板初始化日志
7. **测试验证**：重新加载扩展，测试所有功能
8. **可选**：添加面板徽章或颜色区分

---

## 🚀 快速实施命令

我可以帮你快速实施这些修改，只需要确认：

1. 是否需要添加面板徽章？（推荐：是）
2. 是否需要使用不同颜色区分面板？（推荐：否，保持统一）
3. 是否需要移除阶段 5 的相关代码？（推荐：是）

准备好了吗？我可以立即开始实施！
