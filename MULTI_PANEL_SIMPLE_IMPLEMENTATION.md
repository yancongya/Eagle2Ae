# Eagle2Ae 多面板简化实施方案

## ✅ 已完成的修改

### 1. manifest.xml 配置 ✅

**修改内容**：
- 添加了 3 个独立面板定义
- 每个面板有独立的 Extension ID 和菜单名称

```xml
<ExtensionList>
    <Extension Id="com.eagle.eagle2ae.panel1" Version="1.0.0"/>
    <Extension Id="com.eagle.eagle2ae.panel2" Version="1.0.0"/>
    <Extension Id="com.eagle.eagle2ae.panel3" Version="1.0.0"/>
</ExtensionList>
```

**菜单名称**：
- Panel 1: `Eagle2Ae 1@烟囱鸭`
- Panel 2: `Eagle2Ae 2@烟囱鸭`
- Panel 3: `Eagle2Ae 3@烟囱鸭`

---

### 2. 面板识别逻辑 ✅

**新增方法**：`getPanelId()`

```javascript
getPanelId() {
    // 1. 从 CSInterface.getExtensionID() 获取
    // 2. 从 URL 参数获取（Demo 模式）
    // 3. 默认返回 'panel1'
}
```

**返回值**：`'panel1'`、`'panel2'` 或 `'panel3'`

---

### 3. 配置文件命名 ✅

**新增方法**：`getPresetFileName()`

```javascript
getPresetFileName() {
    const panelNumber = this.panelId.replace('panel', '');
    return `Eagle2Ae${panelNumber}.Presets`;
}
```

**文件名**：
- Panel 1: `Eagle2Ae1.Presets`
- Panel 2: `Eagle2Ae2.Presets`
- Panel 3: `Eagle2Ae3.Presets`

---

### 4. 配置文件路径修改 ✅

**修改位置**：所有使用 `'Eagle2Ae-Presets.json'` 的地方

**修改内容**：
- ✅ 保存配置文件时使用 `this.getPresetFileName()`
- ✅ 加载配置文件时使用 `this.getPresetFileName()`
- ✅ 下载配置文件时使用 `this.getPresetFileName()`
- ✅ 上传配置文件时使用 `this.getPresetFileName()`
- ✅ ConfigManager 使用面板特定的文件路径

**修改的文件**：
1. `apps/eagle2ae_web/public/extensions/ae/js/main.js`
2. `apps/eagle2ae_web/public/extensions/ae/js/utils/ConfigManager.js`

---

## 📁 配置文件结构

### CEP 环境（生产环境）

```
C:\Users\[用户名]\Documents\Eagle2Ae-Ae\presets\
├── Eagle2Ae1.Presets  # Panel 1 的配置
├── Eagle2Ae2.Presets  # Panel 2 的配置
└── Eagle2Ae3.Presets  # Panel 3 的配置
```

### Demo 模式（开发环境）

虚拟文件系统路径：
```
Eagle2Ae-Ae/presets/Eagle2Ae1.Presets
Eagle2Ae-Ae/presets/Eagle2Ae2.Presets
Eagle2Ae-Ae/presets/Eagle2Ae3.Presets
```

---

## 🎯 工作原理

### 1. 面板启动时

```javascript
// 1. 识别当前面板
this.panelId = this.getPanelId();  // 'panel1', 'panel2', 或 'panel3'

// 2. 确定配置文件名
const fileName = this.getPresetFileName();  // 'Eagle2Ae1.Presets', 等

// 3. 加载对应的配置文件
await this.loadPresets();
```

### 2. 保存配置时

```javascript
// 使用面板特定的文件名
const fileName = this.getPresetFileName();

// 保存到对应的文件
// Panel 1 -> Eagle2Ae1.Presets
// Panel 2 -> Eagle2Ae2.Presets
// Panel 3 -> Eagle2Ae3.Presets
```

### 3. 配置隔离

- ✅ Panel 1 的配置保存在 `Eagle2Ae1.Presets`
- ✅ Panel 2 的配置保存在 `Eagle2Ae2.Presets`
- ✅ Panel 3 的配置保存在 `Eagle2Ae3.Presets`
- ✅ 三个面板的配置完全独立，互不影响

---

## 🧪 测试步骤

### 步骤 1: 重新加载扩展

1. 关闭所有 Eagle2Ae 面板
2. 在 AE 中重新加载扩展（或重启 AE）

### 步骤 2: 验证菜单

在 AE 菜单中应该看到：
```
窗口 > 扩展 >
  ├── Eagle2Ae 1@烟囱鸭
  ├── Eagle2Ae 2@烟囱鸭
  └── Eagle2Ae 3@烟囱鸭
```

### 步骤 3: 测试面板识别

1. 打开 `Eagle2Ae 1@烟囱鸭`
2. 按 F12 打开控制台
3. 应该看到：
   ```
   [Panel] Extension ID: com.eagle.eagle2ae.panel1
   [Panel] 当前面板: panel1
   [ConfigManager] 配置文件路径: Eagle2Ae-Ae/presets/Eagle2Ae1.Presets
   ```

4. 对 Panel 2 和 Panel 3 重复测试

### 步骤 4: 测试配置独立性

1. 打开 Panel 1，修改一些设置（如文件夹名）
2. 保存配置
3. 打开 Panel 2，修改不同的设置
4. 保存配置
5. 关闭所有面板
6. 重新打开 Panel 1，检查配置是否保持
7. 重新打开 Panel 2，检查配置是否保持

### 步骤 5: 验证配置文件

在文件系统中检查：
```
C:\Users\[用户名]\Documents\Eagle2Ae-Ae\presets\
```

应该看到 3 个独立的配置文件。

---

## 📊 方案对比

### 修改前

- ❌ 只有 1 个面板
- ❌ 只有 1 个配置文件 `Eagle2Ae-Presets.json`
- ❌ 无法同时使用不同配置

### 修改后

- ✅ 3 个独立面板
- ✅ 3 个独立配置文件 `Eagle2Ae1/2/3.Presets`
- ✅ 可以同时打开多个面板
- ✅ 每个面板的配置完全独立
- ✅ 配置文件自动识别和加载

---

## 🎨 配置文件格式

配置文件格式保持不变，仍然是相同的 JSON 结构：

```json
{
  "version": "1.0.0",
  "lastModified": "2024-01-01T00:00:00.000Z",
  "importSettings": {
    "importMode": "project_adjacent",
    "folderName": "Eagle_Assets",
    "createSubfolders": true,
    "importToComp": true,
    "noImportSubMode": "normal"
  },
  "userPreferences": {
    "autoConnect": true,
    "showNotifications": true,
    "communicationPort": 8080,
    "language": "zh-CN",
    "theme": "dark"
  }
}
```

**唯一的区别**：文件名不同
- Panel 1: `Eagle2Ae1.Presets`
- Panel 2: `Eagle2Ae2.Presets`
- Panel 3: `Eagle2Ae3.Presets`

---

## 💡 使用场景

### 场景 1: 不同项目类型

- **Panel 1**：视频项目配置
  - 导入到合成
  - 创建子文件夹
  
- **Panel 2**：快速预览配置
  - 不导入到合成
  - 不创建子文件夹
  
- **Panel 3**：音频项目配置
  - 指定文件夹
  - 特殊命名规则

### 场景 2: 不同工作流程

- **Panel 1**：标准工作流
- **Panel 2**：快速测试流
- **Panel 3**：最终交付流

### 场景 3: 团队协作

- **Panel 1**：个人配置
- **Panel 2**：团队标准配置
- **Panel 3**：客户特定配置

---

## ✅ 优势

1. **简单直接**：只修改文件名，不改变文件结构
2. **完全隔离**：每个面板有独立的配置文件
3. **易于管理**：配置文件命名清晰
4. **向后兼容**：保持相同的 JSON 结构
5. **易于备份**：可以单独备份每个面板的配置
6. **易于分享**：可以分享特定面板的配置给其他人

---

## 🚀 下一步

现在你可以：

1. ✅ 重新加载扩展测试
2. ✅ 为每个面板配置不同的设置
3. ✅ 同时打开多个面板工作
4. ✅ 备份和分享配置文件

如果一切正常，你应该能够：
- 在 AE 菜单中看到 3 个面板选项
- 每个面板加载自己的配置文件
- 配置修改互不影响
- 重启后配置保持不变

祝使用愉快！🎉
