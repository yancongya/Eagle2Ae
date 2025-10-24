# 面板切换功能测试指南

## 功能说明

面板切换功能**完全支持**，可以在同一个窗口中切换不同的配置预设。

### 工作原理

1. 点击"面板切换"按钮
2. 保存当前面板的配置到 JSON 文件
3. 更新 `currentPanelId` 为下一个面板
4. 从 JSON 文件加载新面板的配置
5. 更新 UI 显示所有设置
6. 显示切换成功消息

### JSON 配置文件支持

**完全支持！** 配置文件结构如下：

```json
{
  "version": "1.0.0",
  "panels": {
    "com.yanrouya.eagle2ae.panel1": {
      "name": "默认配置",
      "importSettings": { ... },
      "uiSettings": { ... },
      ...
    },
    "com.yanrouya.eagle2ae.panel2": {
      "name": "快速预览",
      "importSettings": { ... },
      "uiSettings": { ... },
      ...
    },
    "com.yanrouya.eagle2ae.panel3": {
      "name": "音频项目",
      "importSettings": { ... },
      "uiSettings": { ... },
      ...
    }
  }
}
```

---

## 测试步骤

### 测试 1: 基本切换功能

**步骤**:
1. 打开扩展（任意面板）
2. 打开设置面板（点击设置按钮）
3. 查看"面板切换"按钮，应该显示："🔄 当前配置: 默认配置"
4. 点击按钮
5. 观察控制台日志

**预期结果**:
```
[Panel Switch] 开始切换面板配置...
[Panel Switch] 从 默认配置 切换到 Panel 2
[Config Save] 开始保存配置 [默认配置]
💾 预设已自动保存 [默认配置]
🔎 Trying to load local presets... [快速预览]
✅ 已加载并应用本地预设
✅ 已切换到配置预设: 快速预览
[Panel Switch] 切换完成: 快速预览
```

**检查点**:
- ✅ 按钮文本更新为："当前配置: 快速预览"
- ✅ 悬浮提示更新为："点击切换到: 音频项目"
- ✅ 日志显示切换成功消息

### 测试 2: 配置实际切换

**准备**:
1. 在 Panel 1 中设置：
   - 导入模式：项目相邻
   - 添加到合成：是
   - 语言：中文

**步骤**:
1. 点击"面板切换"按钮
2. 切换到 Panel 2
3. 检查设置面板中的配置

**预期结果**:
- Panel 2 的配置应该与 Panel 1 不同
- 如果是首次使用，Panel 2 会使用默认配置
- 导入模式可能是：桌面
- 添加到合成可能是：否

**验证方法**:
1. 打开"导入设置"面板
2. 查看"导入模式"选择
3. 查看"添加到合成"复选框
4. 这些设置应该反映 Panel 2 的配置

### 测试 3: 配置保存和隔离

**步骤**:
1. 在 Panel 1 中：设置导入模式为"项目相邻"
2. 点击切换到 Panel 2
3. 在 Panel 2 中：设置导入模式为"桌面"
4. 点击切换到 Panel 3
5. 在 Panel 3 中：设置导入模式为"自定义文件夹"
6. 点击切换回 Panel 1
7. 检查导入模式

**预期结果**:
- Panel 1 的导入模式应该还是"项目相邻"
- 每个面板的配置完全独立
- 切换不会丢失配置

### 测试 4: 循环切换

**步骤**:
1. 从 Panel 1 开始
2. 点击切换 → Panel 2
3. 点击切换 → Panel 3
4. 点击切换 → Panel 1（回到开始）

**预期结果**:
- 按钮文本依次显示：
  - "当前配置: 默认配置"
  - "当前配置: 快速预览"
  - "当前配置: 音频项目"
  - "当前配置: 默认配置"（循环）

---

## 调试方法

### 如果切换不工作

**检查 1: 控制台日志**

打开浏览器控制台（F12），查看是否有错误信息：

```javascript
// 应该看到这些日志
[Panel Switch] 开始切换面板配置...
[Panel Switch] 从 xxx 切换到 Panel x
[Config Save] 开始保存配置 [xxx]
[Panel Switch] 切换完成: xxx
```

**检查 2: 按钮是否绑定**

在控制台运行：
```javascript
const btn = document.getElementById('panel-switch-btn');
console.log('按钮:', btn);
console.log('点击事件:', btn.onclick);
```

应该看到按钮元素和 onclick 函数。

**检查 3: 手动触发切换**

在控制台运行：
```javascript
window.aeExtension.switchToNextPanel();
```

如果这个能工作，说明函数本身没问题，可能是按钮绑定的问题。

**检查 4: 配置文件**

查看配置文件是否正确：
- CEP 模式：文档目录下的 `Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json`
- Demo 模式：虚拟文件系统或 localStorage

在控制台运行：
```javascript
// Demo 模式
if (window.demoFileSystem) {
    const result = window.demoFileSystem.readFile('Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json');
    console.log(JSON.parse(result.content));
}

// 或者
const config = localStorage.getItem('eagle2ae_preset_json');
console.log(JSON.parse(config));
```

---

## 常见问题

### Q1: 点击按钮没有反应

**可能原因**:
1. 按钮事件未绑定
2. JavaScript 错误阻止执行

**解决方法**:
1. 刷新页面
2. 检查控制台错误
3. 重新打开设置面板

### Q2: 配置没有真正切换

**可能原因**:
1. 配置文件格式错误
2. 配置加载失败

**解决方法**:
1. 检查控制台日志
2. 查看配置文件内容
3. 尝试手动触发切换

### Q3: 切换后 UI 没有更新

**可能原因**:
1. `updateSettingsUI()` 未执行
2. UI 元素未找到

**解决方法**:
1. 关闭并重新打开设置面板
2. 检查控制台日志
3. 刷新页面

---

## 验证配置切换成功的方法

### 方法 1: 查看按钮文本

最直观的方法：
- 切换前："当前配置: 默认配置"
- 切换后："当前配置: 快速预览"

### 方法 2: 查看设置值

打开设置面板，查看具体的设置项：
- 导入模式
- 添加到合成
- 语言设置
- 主题设置

### 方法 3: 查看日志消息

日志面板应该显示：
```
✅ 已切换到配置预设: 快速预览
```

### 方法 4: 查看控制台

控制台应该显示：
```
[Panel Switch] 切换完成: 快速预览
```

---

## 配置文件示例

### 正确的多面板配置

```json
{
  "version": "1.0.0",
  "metadata": {
    "lastModified": "2025-10-24T10:00:00.000Z",
    "modifiedBy": "com.yanrouya.eagle2ae.panel1"
  },
  "globalSettings": {
    "communicationPort": 8080
  },
  "panels": {
    "com.yanrouya.eagle2ae.panel1": {
      "name": "默认配置",
      "importSettings": {
        "mode": "project_adjacent",
        "addToComposition": true
      },
      "language": "zh-CN"
    },
    "com.yanrouya.eagle2ae.panel2": {
      "name": "快速预览",
      "importSettings": {
        "mode": "desktop",
        "addToComposition": false
      },
      "language": "zh-CN"
    },
    "com.yanrouya.eagle2ae.panel3": {
      "name": "音频项目",
      "importSettings": {
        "mode": "custom_folder",
        "addToComposition": true
      },
      "language": "en-US"
    }
  }
}
```

---

## 总结

### 功能状态

- ✅ **完全支持** 配置切换
- ✅ **JSON 文件支持** 多面板配置
- ✅ **配置隔离** 每个面板独立
- ✅ **自动保存** 切换时自动保存
- ✅ **循环切换** Panel 1 → 2 → 3 → 1

### 如果功能不工作

1. 检查控制台日志
2. 验证配置文件格式
3. 尝试手动触发切换
4. 刷新页面重试

### 需要帮助

如果按照测试步骤操作后功能仍然不工作，请提供：
1. 控制台的完整日志
2. 配置文件的内容
3. 具体的错误信息

这样我可以帮你诊断具体的问题！
