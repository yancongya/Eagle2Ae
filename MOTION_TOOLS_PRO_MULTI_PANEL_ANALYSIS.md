# MotionToolsPro 多面板架构分析

## 📋 概述

MotionToolsPro 是一个成熟的 After Effects CEP 扩展，实现了**真正的多面板架构**。通过分析其结构，我们可以了解如何在一个扩展中管理多个独立面板。

---

## 🏗️ 核心架构

### 1. Manifest.xml 配置

MotionToolsPro 在 `manifest.xml` 中定义了 **7 个独立的扩展面板**：

```xml
<ExtensionList>
    <Extension Id="com.mds.motion-tools-pro.cep.panel-1" Version="1.4.5"/>
    <Extension Id="com.mds.motion-tools-pro.cep.panel-2" Version="1.4.5"/>
    <Extension Id="com.mds.motion-tools-pro.cep.panel-3" Version="1.4.5"/>
    <Extension Id="com.mds.motion-tools-pro.cep.panel-4" Version="1.4.5"/>
    <Extension Id="com.mds.motion-tools-pro.cep.panel-settings" Version="1.4.5"/>
    <Extension Id="com.mds.motion-tools-pro.cep.content-settings" Version="1.4.5"/>
    <Extension Id="com.mds.motion-tools-pro.cep.support" Version="1.4.5"/>
</ExtensionList>
```

#### 关键特点：
- **每个面板都是独立的 Extension**，有自己的 Extension ID
- **共享同一个 ExtensionBundleId**：`com.mds.motion-tools-pro.cep`
- 每个面板可以独立打开、关闭、停靠

---

### 2. 面板配置详情

#### Panel 1-4（主工作面板）

```xml
<Extension Id="com.mds.motion-tools-pro.cep.panel-1">
    <DispatchInfo>
        <Resources>
            <MainPath>./panel/index.html</MainPath>  <!-- 共享同一个 HTML -->
            <ScriptPath>./jsx/motion_tools_core.jsx</ScriptPath>
            <CEFCommandLine>
                <Parameter>--enable-nodejs</Parameter>
                <Parameter>--allow-file-access-from-files</Parameter>
            </CEFCommandLine>
        </Resources>
        <UI>
            <Type>Panel</Type>
            <Menu>Motion Tools Pro MoYiCHS 墨忆汉化 1</Menu>  <!-- 菜单中显示的名称 -->
            <Geometry>
                <Size>
                    <Width>600</Width>
                    <Height>650</Height>
                </Size>
            </Geometry>
        </UI>
    </DispatchInfo>
</Extension>
```

**重要发现：**
- ✅ **所有 Panel 1-4 共享同一个 HTML 文件**：`./panel/index.html`
- ✅ **通过 Extension ID 区分不同面板**
- ✅ **每个面板在 AE 菜单中有独立的菜单项**
- ✅ **每个面板可以独立打开多个实例**

#### Panel-Settings（设置面板）

```xml
<Extension Id="com.mds.motion-tools-pro.cep.panel-settings">
    <DispatchInfo>
        <Resources>
            <MainPath>./panel-settings/index.html</MainPath>  <!-- 独立的 HTML -->
        </Resources>
        <UI>
            <Type>Panel</Type>
            <Geometry>
                <Size>
                    <Width>900</Width>
                    <Height>650</Height>
                </Size>
            </Geometry>
        </UI>
    </DispatchInfo>
</Extension>
```

**特点：**
- 使用独立的 HTML 文件
- 更大的默认尺寸（900x650）
- 专门用于设置管理

---

### 3. 文件结构

```
MotionToolsPro_MoYiCHS/
├── CSXS/
│   └── manifest.xml              # 定义所有面板
├── panel/
│   └── index.html                # Panel 1-4 共享的 HTML
├── panel-settings/
│   └── index.html                # 设置面板的 HTML
├── content-settings/
│   └── index.html                # 内容设置面板的 HTML
├── support/
│   └── index.html                # 支持面板的 HTML
├── assets/
│   ├── panel-1.js                # Panel 1 的逻辑
│   ├── panel-2.js                # Panel 2 的逻辑
│   ├── panel-3.js                # Panel 3 的逻辑
│   ├── panel-4.js                # Panel 4 的逻辑
│   ├── panel-settings.js         # 设置面板的逻辑
│   ├── collectWidgets.js         # 共享组件
│   └── object.js                 # 共享工具
└── jsx/
    └── motion_tools_core.jsx     # AE 脚本层
```

---

## 🔑 关键实现机制

### 1. 面板识别

每个面板通过 **CSInterface.getExtensionID()** 获取自己的 Extension ID：

```javascript
// 伪代码（实际代码被混淆）
const csInterface = new CSInterface();
const extensionId = csInterface.getExtensionID();

// extensionId 可能是：
// - "com.mds.motion-tools-pro.cep.panel-1"
// - "com.mds.motion-tools-pro.cep.panel-2"
// - "com.mds.motion-tools-pro.cep.panel-3"
// - "com.mds.motion-tools-pro.cep.panel-4"

// 根据 ID 加载不同的配置和逻辑
if (extensionId.includes('panel-1')) {
    // 加载 Panel 1 的配置
} else if (extensionId.includes('panel-2')) {
    // 加载 Panel 2 的配置
}
```

### 2. 配置管理策略

#### 方案 A：独立配置存储
```javascript
// 每个面板使用独立的 localStorage key
const configKey = `mtp_${extensionId}_config`;
localStorage.setItem(configKey, JSON.stringify(config));
```

#### 方案 B：共享配置 + 面板特定覆盖
```javascript
// 全局配置
const globalConfig = localStorage.getItem('mtp_global_config');

// 面板特定配置
const panelConfig = localStorage.getItem(`mtp_${extensionId}_config`);

// 合并配置
const finalConfig = { ...globalConfig, ...panelConfig };
```

### 3. 面板间通信

CEP 提供了面板间通信的 API：

```javascript
// 发送消息到其他面板
csInterface.evalScript('app.executeScript("someFunction")', (result) => {
    console.log(result);
});

// 或使用事件系统
csInterface.addEventListener('com.mds.motion-tools-pro.event', (event) => {
    console.log('Received event:', event.data);
});

csInterface.dispatchEvent(new CSEvent('com.mds.motion-tools-pro.event', 'APPLICATION'));
```

---

## 📊 与 Eagle2Ae 的对比

### MotionToolsPro 的方式（真多面板）

| 特性 | 实现方式 |
|------|---------|
| 面板数量 | 7 个独立面板 |
| Manifest 配置 | 每个面板一个 `<Extension>` 定义 |
| HTML 文件 | Panel 1-4 共享，其他独立 |
| 菜单显示 | 每个面板独立菜单项 |
| 打开方式 | 用户从 AE 菜单选择打开 |
| 配置管理 | 每个面板独立配置 |
| 适用场景 | 需要同时打开多个面板工作 |

### Eagle2Ae 当前方式（单面板多配置）

| 特性 | 实现方式 |
|------|---------|
| 面板数量 | 1 个面板，3 种配置 |
| Manifest 配置 | 只有 1 个 `<Extension>` 定义 |
| HTML 文件 | 1 个 HTML 文件 |
| 菜单显示 | 1 个菜单项 |
| 打开方式 | 打开后通过下拉菜单切换 |
| 配置管理 | 通过下拉菜单切换配置 |
| 适用场景 | 不同工作场景快速切换配置 |

---

## 💡 关键洞察

### 1. 两种架构的本质区别

**MotionToolsPro（真多面板）：**
- 每个面板是**独立的窗口实例**
- 可以**同时打开多个面板**
- 每个面板有**独立的生命周期**
- 适合：需要同时查看多个工具集

**Eagle2Ae（单面板多配置）：**
- 只有**一个窗口实例**
- **同一时间只能使用一种配置**
- 通过**切换配置改变行为**
- 适合：不同工作场景的快速切换

### 2. 为什么 Eagle2Ae 不需要真多面板

1. **功能特性**：Eagle2Ae 是文件导入工具，不需要同时打开多个面板
2. **用户体验**：通过下拉菜单切换配置更简单直观
3. **开发复杂度**：单面板架构更容易维护
4. **资源占用**：单面板占用更少的系统资源

### 3. 如果要实现真多面板

需要修改 `manifest.xml`：

```xml
<ExtensionList>
    <Extension Id="com.yanrouya.eagle2ae.panel1" Version="1.0.0"/>
    <Extension Id="com.yanrouya.eagle2ae.panel2" Version="1.0.0"/>
    <Extension Id="com.yanrouya.eagle2ae.panel3" Version="1.0.0"/>
</ExtensionList>

<DispatchInfoList>
    <Extension Id="com.yanrouya.eagle2ae.panel1">
        <DispatchInfo>
            <Resources>
                <MainPath>./index.html</MainPath>
            </Resources>
            <UI>
                <Type>Panel</Type>
                <Menu>Eagle2Ae - 默认配置</Menu>
            </UI>
        </DispatchInfo>
    </Extension>
    
    <Extension Id="com.yanrouya.eagle2ae.panel2">
        <DispatchInfo>
            <Resources>
                <MainPath>./index.html</MainPath>
            </Resources>
            <UI>
                <Type>Panel</Type>
                <Menu>Eagle2Ae - 快速预览</Menu>
            </UI>
        </DispatchInfo>
    </Extension>
    
    <Extension Id="com.yanrouya.eagle2ae.panel3">
        <DispatchInfo>
            <Resources>
                <MainPath>./index.html</MainPath>
            </Resources>
            <UI>
                <Type>Panel</Type>
                <Menu>Eagle2Ae - 音频项目</Menu>
            </UI>
        </DispatchInfo>
    </Extension>
</DispatchInfoList>
```

---

## ✅ 结论

### MotionToolsPro 的多面板实现方式：

1. **Manifest 层面**：在 `<ExtensionList>` 中定义多个 `<Extension>`
2. **文件结构**：可以共享 HTML，也可以使用独立 HTML
3. **面板识别**：通过 `CSInterface.getExtensionID()` 获取当前面板 ID
4. **配置管理**：每个面板使用独立的 localStorage key 存储配置
5. **菜单显示**：每个面板在 AE 菜单中有独立的菜单项

### Eagle2Ae 的当前方案（阶段5）更合适：

- ✅ **单面板 + 下拉菜单切换配置**
- ✅ **更简单的用户体验**
- ✅ **更低的开发和维护成本**
- ✅ **符合工具的使用场景**

### 如果未来需要真多面板：

参考 MotionToolsPro 的 manifest.xml 配置方式，但目前的单面板多配置方案已经足够满足需求。

---

## 📚 参考资料

- Adobe CEP 文档：https://github.com/Adobe-CEP/CEP-Resources
- CSInterface API：https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_11.x/CSInterface.js
- MotionToolsPro 扩展结构分析
