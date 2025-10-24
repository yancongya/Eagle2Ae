# 多面板预设文件测试指南

## 🎯 期望行为

每个面板打开时应该：
1. 识别自己的面板 ID（panel1/panel2/panel3）
2. 尝试加载对应的预设文件
3. 如果文件不存在，自动创建默认预设文件
4. 应用配置到界面

## 📝 测试步骤

### 步骤 1: 清理环境

删除所有现有的预设文件：
```
C:\Users\Administrator\Documents\Eagle2Ae-Ae\presets\
```

### 步骤 2: 测试 Panel 1

1. 在 AE 中打开 `Eagle2Ae 1@烟囱鸭`
2. 按 F12 打开开发者工具
3. 查看控制台输出：

**期望日志**：
```
============================================================
[Panel] 当前面板 ID: panel1
[Panel] 预设文件名: Eagle2Ae1.Presets
============================================================
🔎 Trying to load local presets...
ℹ️ 本地预设不可用：未找到预设文件
📝 正在创建默认预设文件: Eagle2Ae1.Presets
💾 预设已自动保存到文档目录
✅ 默认预设文件已创建: Eagle2Ae1.Presets
```

4. 检查文件系统：
   - 应该看到 `C:\Users\Administrator\Documents\Eagle2Ae-Ae\presets\Eagle2Ae1.Presets`

### 步骤 3: 测试 Panel 2

1. 在 AE 中打开 `Eagle2Ae 2@烟囱鸭`
2. 查看控制台输出：

**期望日志**：
```
============================================================
[Panel] 当前面板 ID: panel2
[Panel] 预设文件名: Eagle2Ae2.Presets
============================================================
🔎 Trying to load local presets...
ℹ️ 本地预设不可用：未找到预设文件
📝 正在创建默认预设文件: Eagle2Ae2.Presets
💾 预设已自动保存到文档目录
✅ 默认预设文件已创建: Eagle2Ae2.Presets
```

3. 检查文件系统：
   - 应该看到 `C:\Users\Administrator\Documents\Eagle2Ae-Ae\presets\Eagle2Ae2.Presets`

### 步骤 4: 测试 Panel 3

1. 在 AE 中打开 `Eagle2Ae 3@烟囱鸭`
2. 查看控制台输出：

**期望日志**：
```
============================================================
[Panel] 当前面板 ID: panel3
[Panel] 预设文件名: Eagle2Ae3.Presets
============================================================
🔎 Trying to load local presets...
ℹ️ 本地预设不可用：未找到预设文件
📝 正在创建默认预设文件: Eagle2Ae3.Presets
💾 预设已自动保存到文档目录
✅ 默认预设文件已创建: Eagle2Ae3.Presets
```

3. 检查文件系统：
   - 应该看到 `C:\Users\Administrator\Documents\Eagle2Ae-Ae\presets\Eagle2Ae3.Presets`

### 步骤 5: 验证最终结果

检查预设目录，应该有 3 个文件：
```
C:\Users\Administrator\Documents\Eagle2Ae-Ae\presets\
├── Eagle2Ae1.Presets
├── Eagle2Ae2.Presets
└── Eagle2Ae3.Presets
```

---

## 🐛 故障排查

### 问题 1: 只创建了一个预设文件

**可能原因**：
- 只打开了一个面板
- 其他面板没有正确识别

**解决方案**：
1. 确保在 AE 菜单中看到 3 个面板选项
2. 逐个打开每个面板
3. 检查每个面板的控制台日志

### 问题 2: 面板 ID 识别错误

**症状**：
```
[Panel] 当前面板 ID: panel1  // 所有面板都显示 panel1
```

**解决方案**：
1. 检查 manifest.xml 中的 Extension ID 是否正确
2. 重新加载扩展或重启 AE

### 问题 3: 预设文件创建失败

**症状**：
```
⚠️ 创建默认预设文件失败
```

**解决方案**：
1. 检查文件权限
2. 手动创建目录：`C:\Users\Administrator\Documents\Eagle2Ae-Ae\presets\`
3. 检查 JSX 脚本是否正确加载

### 问题 4: 预设文件创建在错误的位置

**症状**：
- 文件创建在项目目录而不是用户文档目录

**原因**：
- 在浏览器中打开扩展（Demo 模式）

**解决方案**：
- 必须在 AE 中打开扩展

---

## 📊 调试命令

在控制台执行以下命令进行调试：

### 检查当前面板信息
```javascript
console.log('Panel ID:', aeExtension.panelId);
console.log('Preset File:', aeExtension.getPresetFileName());
console.log('Preset Path:', aeExtension.getPresetsFilePath());
```

### 手动创建预设文件
```javascript
aeExtension.savePresetsSilently().then(result => {
    console.log('Save result:', result);
});
```

### 检查 Extension ID
```javascript
console.log('Extension ID:', aeExtension.csInterface.getExtensionID());
```

---

## ✅ 成功标准

测试成功的标准：

1. ✅ 每个面板正确识别自己的 ID
2. ✅ 每个面板创建自己的预设文件
3. ✅ 3 个预设文件都在正确的目录
4. ✅ 每个预设文件包含正确的配置
5. ✅ 配置应用到界面
6. ✅ 控制台日志清晰明确

---

## 🎉 完成

如果所有测试都通过，你应该看到：
- 3 个独立的预设文件
- 每个面板加载自己的配置
- 配置修改自动保存
- 重启后配置保持不变

现在多面板预设系统应该完全正常工作了！
