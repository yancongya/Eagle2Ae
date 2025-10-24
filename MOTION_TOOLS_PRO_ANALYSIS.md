# MotionToolsPro 多面板管理分析

## 📋 核心发现

### 1. **多面板架构**

MotionToolsPro 使用了 **7个独立的扩展面板**：

```
- panel-1: Motion Tools Pro MoYiCHS 墨忆汉化 1
- panel-2: Motion Tools Pro MoYiCHS 墨忆汉化 2  
- panel-3: Motion Tools Pro MoYiCHS 墨忆汉化 3
- panel-4: Motion Tools Pro MoYiCHS 墨忆汉化 4
- panel-settings: 设置面板（无菜单名称）
- content-settings: 内容设置面板（无菜单名称）
- support: 支持面板（无菜单名称）
```

### 2. **关键实现方式**

#### 2.1 Manifest.xml 配置

**所有面板共享同一个 HTML 文件**：
```xml
<!-- panel-1, panel-2, panel-3, panel-4 都使用 -->
<MainPath>./panel/index.html</MainPath>

<!-- 设置面板使用不同的 HTML -->
<MainPath>./panel-settings/index.html</MainPath>
<MainPath>./content-settings/index.html</MainPath>
<MainPath>./support/index.html</MainPath>
```

**每个面板有唯一的 Extension ID**：
```xml
<Extension Id="com.mds.motion-tools-pro.cep.panel-1" Version="1.4.5"/>
<Extension Id="com.mds.motion-tools-pro.cep.panel-2" Version="1.4.5"/>
<Extension Id="com.mds.motion-tools-pro.cep.panel-3" Version="1.4.5"/>
<Extension Id="com.mds.motion-tools-pro.cep.panel-4" Version="1.4.5"/>
```

#### 2.2 HTML 结构

查看 `panel/index.html`：
```html
<body>
  <div id="root"></div>
  <script src="../assets/panel-1.js"></script>
</body>
```

**关键点**：
- 所有4个主面板共享同一个 HTML 文件
- 但是加载的 JavaScript 文件是 `panel-1.js`
- 这意味着 JavaScript 需要在运行时识别当前是哪个面板

#### 2.3 JavaScript 识别面板

虽然 JS 代码被混淆了，但可以推断出识别逻辑：

```javascript
// 伪代码示例
const csInterface = new CSInterface();
const extensionId = csInterface.getExtensionID();

// extensionId 会是以下之一：
// - com.mds.motion-tools-pro.cep.panel-1
// - com.mds.motion-tools-pro.cep.panel-2
// - com.mds.motion-tools-pro.cep.panel-3
// - com.mds.motion-tools-pro.cep.panel-4

// 根据 extensionId 加载不同的配置或UI
if (extensionId.includes('panel-1')) {
    // 加载 panel-1 的配置
} else if (extensionId.includes('panel-2')) {
    // 加载 panel-2 的配置
}
```

### 3. **与我们项目的对比**

#### 3.1 相似之处

✅ 我们已经实现的：
- 多个 Extension ID 定义在 manifest.xml 中
- 共享同一个 HTML 文件
- 使用 `getCurrentPanelId()` 识别当前面板

#### 3.2 不同之处

❌ 我们还没有的：
- **MotionToolsPro**: 4个面板是**完全独立的窗口**，用户可以同时打开多个
- **我们的需求**: 在**同一个窗口**内通过下拉菜单切换配置

### 4. **MotionToolsPro 的配置管理方式**

根据文件结构推断：

```
assets/
  ├── panel-1.js    # Panel 1 的逻辑
  ├── panel-2.js    # Panel 2 的逻辑
  ├── panel-3.js    # Panel 3 的逻辑
  ├── panel-4.js    # Panel 4 的逻辑
  └── panel-settings.js  # 设置面板的逻辑
```

**推断的配置管理方式**：
1. 每个面板有独立的 JS 文件
2. 每个面板可能有独立的配置存储
3. 通过 localStorage 或文件系统存储配置
4. 使用 Extension ID 作为配置的命名空间

### 5. **对我们项目的启示**

#### 方案A：完全独立的面板（类似 MotionToolsPro）

**优点**：
- ✅ 用户可以同时打开多个面板
- ✅ 每个面板完全独立，不会互相干扰
- ✅ 配置管理简单

**缺点**：
- ❌ 用户需要在 AE 菜单中选择不同的面板
- ❌ 不符合你的需求（你想要在同一个窗口内切换）

#### 方案B：单窗口内切换（你的需求）

**实现方式**：
```javascript
// 1. 在标题栏添加下拉菜单
<select id="panel-selector">
  <option value="panel1">默认配置</option>
  <option value="panel2">快速预览</option>
  <option value="panel3">音频项目</option>
</select>

// 2. 切换逻辑
function switchToPanel(panelId) {
    // 保存当前配置
    const currentConfig = {
        importSettings: settingsManager.getSettings(),
        userPreferences: settingsManager.getPreferences(),
        // ... 其他设置
    };
    localStorage.setItem(`eagle2ae_${currentPanelId}_config`, JSON.stringify(currentConfig));
    
    // 加载目标配置
    const targetConfig = localStorage.getItem(`eagle2ae_${panelId}_config`);
    if (targetConfig) {
        const config = JSON.parse(targetConfig);
        settingsManager.settings = config.importSettings;
        settingsManager.preferences = config.userPreferences;
        // ... 应用其他设置
    }
    
    // 刷新 UI
    loadSettingsToUI();
    
    // 更新当前面板ID
    currentPanelId = panelId;
    localStorage.setItem('eagle2ae_current_panel', panelId);
}
```

**优点**：
- ✅ 符合你的需求
- ✅ 用户体验更好（不需要关闭窗口）
- ✅ 实现相对简单

**缺点**：
- ❌ 不能同时打开多个面板
- ❌ 需要手动管理配置的保存和加载

## 📊 总结

### MotionToolsPro 的方式：
- **多个独立窗口**，每个窗口是一个独立的扩展实例
- 通过 manifest.xml 定义多个 Extension
- 每个 Extension 有独立的 Extension ID
- 共享同一个 HTML，但通过 Extension ID 识别身份

### 我们的方式（推荐）：
- **单个窗口**，通过下拉菜单切换配置
- 使用 localStorage 分别存储每个"虚拟面板"的配置
- 切换时保存当前配置，加载目标配置，刷新 UI
- 更符合你的需求，实现也更简单

## 🎯 下一步行动

建议采用**方案B（单窗口内切换）**：

1. ✅ 在标题栏添加下拉菜单
2. ✅ 实现 `switchToPanel()` 函数
3. ✅ 使用 localStorage 存储配置
4. ✅ 刷新 UI 显示

这个方案不需要修改 manifest.xml，不需要创建多个扩展实例，实现起来更简单，也更符合你的需求。

---

**创建时间**: 2025-10-24  
**分析对象**: MotionToolsPro_MoYiCHS  
**目的**: 为 Eagle2Ae 的多面板功能提供参考
