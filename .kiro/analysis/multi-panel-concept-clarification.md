# 多面板功能概念澄清

## 核心概念

### 1. 面板定义（manifest.xml）
面板的 **ID** 和 **名称** 在 `manifest.xml` 中定义，这是 CEP 扩展的基础配置：

```xml
<Extension Id="com.yanrouya.eagle2ae.panel1" Version="1.0"/>
<Extension Id="com.yanrouya.eagle2ae.panel2" Version="1.0"/>
<Extension Id="com.yanrouya.eagle2ae.panel3" Version="1.0"/>
```

菜单名称：
```xml
<Menu>Eagle2Ae@烟肉鸭</Menu>
<Menu>Eagle2Ae@烟肉鸭2</Menu>
<Menu>Eagle2Ae@烟肉鸭3</Menu>
```

### 2. 配置存储（JSON 文件）
JSON 配置文件**不定义面板**，只存储每个面板的**设置数据**：

```json
{
  "panels": {
    "com.yanrouya.eagle2ae.panel1": {
      "importSettings": { ... },
      "uiSettings": { ... }
    },
    "com.yanrouya.eagle2ae.panel2": {
      "importSettings": { ... },
      "uiSettings": { ... }
    },
    "com.yanrouya.eagle2ae.panel3": {
      "importSettings": { ... },
      "uiSettings": { ... }
    }
  }
}
```

---

## 工作原理

### CEP 环境
1. **用户打开面板**: 在 AE 的 Window 菜单中选择 `Eagle2Ae@烟肉鸭2`
2. **面板识别自己**: 通过 `window.cep.getExtensionId()` 获取 ID
3. **加载对应配置**: 从 JSON 文件中读取 `panels["com.yanrouya.eagle2ae.panel2"]`
4. **应用配置**: 将配置应用到 UI 和功能逻辑

### 多面板同时运行
- 用户可以同时打开 3 个面板窗口
- 每个窗口独立运行，互不干扰
- 每个窗口自动加载自己的配置
- 修改配置时只影响当前窗口对应的配置分支

---

## "面板切换"功能的真实含义

### 不是切换窗口
"面板切换"按钮**不是**让用户在不同的面板窗口之间切换。

### 是切换配置预设
"面板切换"按钮的作用是：
- 在**当前面板窗口**中
- 加载**其他面板的配置**
- 相当于"配置预设切换"

### 使用场景
假设用户在 `Eagle2Ae@烟肉鸭` 面板中：
1. 当前使用的是 Panel 1 的配置（导入到桌面）
2. 点击"面板切换"按钮
3. 切换到 Panel 2 的配置（导入到项目相邻文件夹）
4. 再次点击，切换到 Panel 3 的配置
5. 再次点击，回到 Panel 1 的配置

这样用户可以快速在不同的配置预设之间切换，而不需要手动修改每个设置。

---

## 实际应用场景

### 场景 1: 不同项目类型
- **Panel 1 配置**: 用于广告项目（导入到桌面，不添加到合成）
- **Panel 2 配置**: 用于 MG 动画（导入到项目文件夹，自动添加到合成）
- **Panel 3 配置**: 用于音频项目（导入到自定义文件夹，启用音频设置）

### 场景 2: 不同工作流程
- **Panel 1 配置**: 快速预览模式（最小化设置）
- **Panel 2 配置**: 正式制作模式（完整设置）
- **Panel 3 配置**: 导出交付模式（特殊导出设置）

### 场景 3: 团队协作
- **Panel 1 配置**: 个人偏好设置
- **Panel 2 配置**: 团队标准设置
- **Panel 3 配置**: 客户要求设置

---

## 技术实现要点

### 1. 面板启动时
```javascript
// 获取当前面板 ID
const panelId = window.cep.getExtensionId();
// 例如: "com.yanrouya.eagle2ae.panel2"

// 加载对应的配置
const config = loadConfig(panelId);

// 应用到 UI
applyConfigToUI(config);
```

### 2. 保存配置时
```javascript
// 获取当前面板 ID
const panelId = getCurrentPanelId();

// 读取完整配置文件
const allConfig = readConfigFile();

// 只更新当前面板的配置
allConfig.panels[panelId] = getCurrentSettings();

// 保存回文件
saveConfigFile(allConfig);
```

### 3. 切换配置时
```javascript
function switchToNextPanel() {
    const currentId = getCurrentPanelId();
    const allPanelIds = [
        'com.yanrouya.eagle2ae.panel1',
        'com.yanrouya.eagle2ae.panel2',
        'com.yanrouya.eagle2ae.panel3'
    ];
    
    // 找到下一个面板 ID
    const currentIndex = allPanelIds.indexOf(currentId);
    const nextIndex = (currentIndex + 1) % allPanelIds.length;
    const nextPanelId = allPanelIds[nextIndex];
    
    // 保存当前配置
    saveCurrentConfig();
    
    // 加载下一个面板的配置
    const nextConfig = loadConfig(nextPanelId);
    
    // 应用到 UI
    applyConfigToUI(nextConfig);
    
    // 提示用户
    showMessage(`已切换到配置预设 ${nextIndex + 1}`);
}
```

---

## 与 kbar 的对比

### kbar 的实现
- 4 个独立的面板窗口（toolbar-1 到 toolbar-4）
- 每个面板有独立的配置文件
- 面板之间通过 server 扩展通信

### Eagle2Ae 的实现
- 3 个独立的面板窗口
- 所有面板共享一个配置文件（不同分支）
- 面板之间不需要通信（各自独立）
- 额外提供"配置切换"功能方便用户

---

## 总结

1. **manifest.xml 定义面板** - 面板的身份和名称
2. **JSON 存储配置** - 每个面板的设置数据
3. **面板自动识别** - 启动时知道自己是谁
4. **独立运行** - 多个面板可以同时打开
5. **配置切换** - 在当前窗口中快速切换配置预设

这样的设计既保持了面板的独立性，又提供了配置管理的灵活性。
