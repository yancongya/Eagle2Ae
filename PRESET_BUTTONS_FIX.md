# 预设按钮修复指南

## 🐛 问题

1. **extComms error**: `TypeError: null 不是对象` - 已修复 ✅
2. **预设文件未自动创建** - 需要在 JSX 中处理
3. **预设按钮逻辑需要更新** - 需要添加 `getPresetsFilePath()` 方法

---

## ✅ 已修复

### 1. getPanelId() 方法的 null 检查

已添加安全检查，确保 `extensionId` 不是 null：

```javascript
if (extensionId && typeof extensionId === 'string') {
    // 从 Extension ID 中提取面板编号
    if (extensionId.includes('panel1')) {
        return 'panel1';
    } else if (extensionId.includes('panel2')) {
        return 'panel2';
    } else if (extensionId.includes('panel3')) {
        return 'panel3';
    }
}
```

---

## 🔧 需要手动添加的代码

### 在 main.js 中添加 `getPresetsFilePath()` 方法

**位置**：在 `updateOpenPresetsBtnTooltip()` 方法之前

```javascript
/**
 * 获取当前面板的预设文件完整路径
 * 🔥 使用面板特定的文件名
 * @returns {string} 预设文件的完整路径
 */
getPresetsFilePath() {
    const baseFolder = this.getPresetsBaseFolderPath();
    const fileName = this.getPresetFileName();
    
    if (baseFolder) {
        // 用户自定义目录
        return `${baseFolder}\\${fileName}`;
    } else {
        // 默认目录
        if (window.require) {
            const path = window.require('path');
            const os = window.require('os');
            const documentsPath = path.join(os.homedir(), 'Documents');
            return path.join(documentsPath, 'Eagle2Ae-Ae', 'presets', fileName);
        } else {
            // 降级方案
            return `我的文档\\Eagle2Ae-Ae\\presets\\${fileName}`;
        }
    }
}
```

**插入位置**：大约在第 9075 行，`updateOpenPresetsBtnTooltip()` 方法之前

---

## 📝 预设按钮功能说明

### 1. 下载预设按钮 (`handleDownloadPreset`)

**当前状态**：✅ 已更新，使用 `this.getPresetFileName()`

**功能**：
- Demo 模式：从虚拟文件系统下载
- CEP 模式：另存为对话框

**文件名**：
- Panel 1: `Eagle2Ae1.Presets`
- Panel 2: `Eagle2Ae2.Presets`
- Panel 3: `Eagle2Ae3.Presets`

### 2. 打开预设文件按钮 (`handleOpenPreset`)

**当前状态**：✅ 已更新，使用 `this.getPresetFileName()`

**功能**：
- Demo 模式：显示虚拟文件内容
- CEP 模式：用系统默认程序打开文件

**依赖**：需要 `getPresetsFilePath()` 方法

### 3. 打开预设目录按钮 (`handleOpenPresetsFolder`)

**当前状态**：✅ 正常工作

**功能**：
- 打开预设文件所在的目录
- 如果目录不存在，会自动创建

### 4. 重置默认按钮

**位置**：需要查找是否存在

**功能**：重置当前面板的配置为默认值

---

## 🧪 测试步骤

### 测试 1: 下载预设文件

1. 打开 Panel 1
2. 修改一些设置
3. 点击"下载预设"按钮
4. 应该下载 `Eagle2Ae1.Presets` 文件

### 测试 2: 打开预设文件

1. 确保预设文件存在
2. 点击"打开预设文件"按钮
3. 应该用默认程序（如记事本）打开文件

### 测试 3: 打开预设目录

1. 点击"打开预设目录"按钮
2. 应该打开 `我的文档\Eagle2Ae-Ae\presets\` 目录
3. 目录中应该有对应的预设文件

---

## 🔍 调试信息

如果按钮不工作，检查控制台日志：

```javascript
[Preset] handleDownloadPreset 被调用
[Preset] Demo 模式: false
[Preset] 开始下载预设文件...
[Preset] 预设文件名: Eagle2Ae1.Presets
```

---

## 💡 预设文件自动创建

预设文件应该在以下情况自动创建：

1. **首次保存配置时**：调用 `savePresetsSilently()`
2. **修改设置时**：自动触发保存
3. **手动保存时**：点击保存按钮

**检查点**：
- 确保 `savePresetsSilently()` 使用 `this.getPresetFileName()`
- 确保 JSX 脚本中的文件保存逻辑正确

---

## 🚀 快速修复命令

如果需要手动创建预设文件，可以在控制台执行：

```javascript
// 保存当前配置
aeExtension.savePresetsSilently();

// 检查文件名
console.log(aeExtension.getPresetFileName());

// 检查文件路径
console.log(aeExtension.getPresetsFilePath());
```

---

## ✅ 验收标准

完成修复后，应该满足：

1. ✅ 启动 AE 不报错
2. ✅ 每个面板使用独立的预设文件
3. ✅ 下载预设按钮正常工作
4. ✅ 打开预设文件按钮正常工作
5. ✅ 打开预设目录按钮正常工作
6. ✅ 预设文件自动创建
7. ✅ 配置修改自动保存

---

## 📋 待办事项

- [ ] 手动添加 `getPresetsFilePath()` 方法到 main.js
- [ ] 测试所有预设按钮功能
- [ ] 验证预设文件自动创建
- [ ] 检查 JSX 脚本中的文件保存逻辑
