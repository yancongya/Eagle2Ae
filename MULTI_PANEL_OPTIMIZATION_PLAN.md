# Eagle2Ae 真多面板架构优化方案

## 📋 当前状态分析

### ✅ 已完成的配置

你的 `manifest.xml` 已经正确配置了 3 个独立面板：

```xml
<ExtensionList>
    <Extension Id="com.yanrouya.eagle2ae.panel1" Version="1.0.0"/>
    <Extension Id="com.yanrouya.eagle2ae.panel2" Version="1.0.0"/>
    <Extension Id="com.yanrouya.eagle2ae.panel3" Version="1.0.0"/>
</ExtensionList>
```

每个面板都有：
- ✅ 独立的 Extension ID
- ✅ 独立的菜单项（Eagle2Ae@烟肉鸭、Eagle2Ae@烟肉鸭2、Eagle2Ae@烟肉鸭3）
- ✅ 共享同一个 HTML 文件（`./index.html`）
- ✅ 共享同一个 JSX 脚本（`./jsx/hostscript.jsx`）

### ❌ 需要优化的问题

1. **菜单名称不够清晰**：用户看不出每个面板的用途
2. **面板识别逻辑缺失**：代码中需要根据 Extension ID 自动识别当前面板
3. **配置隔离不完整**：需要确保每个面板的配置独立存储
4. **UI 优化**：移除下拉菜单选择器（因为已经是独立面板了）

---

## 🎯 优化方案

### 阶段 1：优化 Manifest.xml 菜单名称

让用户一眼就能看出每个面板的用途：

```xml
<Extension Id="com.yanrouya.eagle2ae.panel1">
    <UI>
        <Menu>Eagle2Ae - 默认配置</Menu>
    </UI>
</Extension>

<Extension Id="com.yanrouya.eagle2ae.panel2">
    <UI>
        <Menu>Eagle2Ae - 快速预览</Menu>
    </UI>
</Extension>

<Extension Id="com.yanrouya.eagle2ae.panel3">
    <UI>
        <Menu>Eagle2Ae - 音频项目</Menu>
    </UI>
</Extension>
```

### 阶段 2：增强面板识别逻辑

在 `main.js` 中，`getCurrentPanelId()` 方法已经可以识别面板，但需要优化：

```javascript
getCurrentPanelId() {
    try {
        // 在 CEP 环境中获取扩展 ID
        if (this.csInterface && typeof this.csInterface.getExtensionID === 'function') {
            const extensionId = this.csInterface.getExtensionID();
            console.log(`[Panel ID] CEP Extension ID: ${extensionId}`);
            
            // 从扩展 ID 中提取面板编号
            if (extensionId === 'com.yanrouya.eagle2ae.panel1') {
                return 'panel1';
            } else if (extensionId === 'com.yanrouya.eagle2ae.panel2') {
                return 'panel2';
            } else if (extensionId === 'com.yanrouya.eagle2ae.panel3') {
                return 'panel3';
            }
        }
        
        // Demo 模式：从 URL 参数获取
        const urlParams = new URLSearchParams(window.location.search);
        const panelParam = urlParams.get('panel');
        if (panelParam && ['panel1', 'panel2', 'panel3'].includes(panelParam)) {
            return panelParam;
        }
        
        // 默认返回 panel1
        return 'panel1';
    } catch (error) {
        console.error('[Panel ID] 获取面板 ID 失败:', error);
        return 'panel1';
    }
}
```

### 阶段 3：移除下拉菜单选择器

因为现在是真正的多面板架构，用户通过 AE 菜单打开不同面板，不需要在面板内切换：

**移除：**
- HTML 中的 `<select id="panel-selector">`
- CSS 中的 `.panel-selector` 样式
- JS 中的面板切换逻辑

**保留：**
- 面板识别逻辑（自动识别当前是哪个面板）
- 配置加载逻辑（根据面板 ID 加载对应配置）

### 阶段 4：优化配置存储策略

每个面板使用独立的 localStorage key：

```javascript
// 配置 key 格式：eagle2ae_panel1_config, eagle2ae_panel2_config, eagle2ae_panel3_config
const configKey = `eagle2ae_${this.currentPanelId}_config`;

// 保存配置
saveCurrentPanelConfig() {
    const panelConfig = {
        panelId: this.currentPanelId,
        panelName: this.getPanelDisplayName(),
        lastUsed: new Date().toISOString(),
        importSettings: this.settingsManager.getSettings(),
        userPreferences: this.settingsManager.getPreferences(),
        // ... 其他配置
    };
    
    localStorage.setItem(configKey, JSON.stringify(panelConfig));
}

// 加载配置
loadPanelConfig() {
    const configStr = localStorage.getItem(configKey);
    if (configStr) {
        const config = JSON.parse(configStr);
        // 应用配置
        this.settingsManager.settings = config.importSettings;
        this.settingsManager.preferences = config.userPreferences;
    } else {
        // 使用默认配置
        this.loadDefaultConfig();
    }
}
```

### 阶段 5：优化标题栏显示

在标题栏显示当前面板名称，让用户知道自己在哪个面板：

```html
<div class="header" id="main-header">
    <a href="#" id="title-link" class="title">
        <div class="title-text" id="title-text">
            Eagle2Ae - 默认配置  <!-- 根据面板 ID 动态显示 -->
        </div>
    </a>
    <div class="header-actions">
        <!-- 按钮组 -->
    </div>
</div>
```

### 阶段 6：添加面板标识

在页面加载时，在标题栏或其他位置显示当前面板的标识：

```javascript
// 在 DOMContentLoaded 中
document.addEventListener('DOMContentLoaded', async () => {
    aeExtension = new AEExtension();
    
    // 更新标题显示当前面板名称
    const titleElement = document.getElementById('title-text');
    if (titleElement) {
        titleElement.textContent = `Eagle2Ae - ${aeExtension.getPanelDisplayName()}`;
    }
    
    // 在控制台显示面板信息
    console.log(`[Eagle2Ae] 当前面板: ${aeExtension.currentPanelId}`);
    console.log(`[Eagle2Ae] 面板名称: ${aeExtension.getPanelDisplayName()}`);
});
```

---

## 🔄 实施步骤

### Step 1: 优化 manifest.xml 菜单名称 ✅

```xml
<!-- 修改菜单名称，让用户一眼看出用途 -->
<Menu>Eagle2Ae - 默认配置</Menu>
<Menu>Eagle2Ae - 快速预览</Menu>
<Menu>Eagle2Ae - 音频项目</Menu>
```

### Step 2: 移除下拉菜单选择器

从 HTML 中移除：
```html
<!-- 删除这部分 -->
<select id="panel-selector" class="panel-selector">
    <option value="panel1">默认配置</option>
    <option value="panel2">快速预览</option>
    <option value="panel3">音频项目</option>
</select>
```

从 CSS 中移除：
```css
/* 删除 .panel-selector 相关样式 */
```

从 JS 中移除：
```javascript
// 删除面板选择器的事件监听器
// 删除 switchToPanel() 方法（不再需要手动切换）
```

### Step 3: 简化配置管理

保留配置加载和保存逻辑，但移除切换逻辑：

```javascript
// 保留
- saveCurrentPanelConfig()
- loadPanelConfig()
- getDefaultPanelConfig()

// 移除
- switchToPanel()  // 不再需要手动切换
- 面板选择器的事件监听
```

### Step 4: 优化标题栏显示

```javascript
// 在初始化时更新标题
updatePanelTitle() {
    const titleElement = document.getElementById('title-text');
    if (titleElement) {
        const panelName = this.getPanelDisplayName();
        titleElement.textContent = `Eagle2Ae - ${panelName}`;
    }
}
```

### Step 5: 测试多面板功能

1. 重新加载扩展
2. 从 AE 菜单打开 3 个不同的面板
3. 验证每个面板：
   - 显示正确的标题
   - 加载独立的配置
   - 配置互不干扰
   - 可以同时使用

---

## 📊 优化前后对比

### 优化前（阶段 5 方案）

```
用户体验：
1. 打开 Eagle2Ae 面板
2. 通过下拉菜单选择配置
3. 切换配置时重新加载设置

限制：
- 同一时间只能使用一种配置
- 需要手动切换配置
```

### 优化后（真多面板方案）

```
用户体验：
1. 从 AE 菜单选择：
   - Eagle2Ae - 默认配置
   - Eagle2Ae - 快速预览
   - Eagle2Ae - 音频项目
2. 可以同时打开多个面板
3. 每个面板独立工作，互不干扰

优势：
- 可以同时使用多种配置
- 不需要手动切换
- 更符合专业工作流
```

---

## 🎨 UI 优化建议

### 标题栏布局（移除下拉菜单后）

```
┌─────────────────────────────────────────┐
│ Eagle2Ae - 默认配置    [🌙] [🌐] [📋] │
└─────────────────────────────────────────┘
```

更简洁，更清晰！

### 面板标识（可选）

在面板底部或顶部添加一个小标签，显示当前面板类型：

```html
<div class="panel-badge">
    <span class="badge-icon">⚙️</span>
    <span class="badge-text">默认配置</span>
</div>
```

---

## 🚀 实施优先级

### 高优先级（必须做）

1. ✅ 优化 manifest.xml 菜单名称
2. ✅ 移除下拉菜单选择器
3. ✅ 优化标题栏显示当前面板名称
4. ✅ 确保配置独立存储

### 中优先级（建议做）

5. 添加面板标识徽章
6. 优化面板间的视觉区分
7. 添加面板使用说明

### 低优先级（可选）

8. 添加面板间通信功能
9. 添加全局设置面板
10. 添加面板预设导入导出

---

## 💡 关键代码修改点

### 1. manifest.xml

```xml
<!-- 修改菜单名称 -->
<Menu>Eagle2Ae - 默认配置</Menu>
<Menu>Eagle2Ae - 快速预览</Menu>
<Menu>Eagle2Ae - 音频项目</Menu>
```

### 2. index.html

```html
<!-- 移除面板选择器 -->
<!-- 删除 <select id="panel-selector"> -->

<!-- 保留标题栏 -->
<div class="title-text" id="title-text">Eagle2Ae</div>
```

### 3. main.js

```javascript
// 移除
- switchToPanel() 方法
- 面板选择器事件监听

// 保留并优化
- getCurrentPanelId()
- getPanelDisplayName()
- saveCurrentPanelConfig()
- loadPanelConfig()

// 新增
- updatePanelTitle()  // 更新标题显示
```

---

## ✅ 验收标准

完成优化后，应该满足：

1. ✅ 从 AE 菜单可以看到 3 个清晰的面板选项
2. ✅ 可以同时打开 3 个面板
3. ✅ 每个面板显示正确的标题
4. ✅ 每个面板加载独立的配置
5. ✅ 配置修改互不影响
6. ✅ 面板关闭后重新打开，配置保持不变
7. ✅ UI 简洁，没有多余的下拉菜单

---

## 🎯 下一步行动

我建议按以下顺序实施：

1. **立即执行**：优化 manifest.xml 菜单名称
2. **立即执行**：移除 HTML 中的下拉菜单选择器
3. **立即执行**：移除 CSS 中的面板选择器样式
4. **立即执行**：移除 JS 中的切换逻辑
5. **立即执行**：优化标题栏显示
6. **测试验证**：重新加载扩展，测试多面板功能

准备好了吗？我可以帮你逐步实施这些修改！
