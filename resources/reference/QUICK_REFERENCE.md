# Eagle2Ae 配置系统快速参考卡

## 🚀 5分钟快速上手

### 1. 初始化配置管理器

```javascript
const configManager = new MultiPanelConfigManager();
await configManager.init();
```

### 2. 读取配置

```javascript
// 读取单个字段
const mode = configManager.getField('importSettings.mode');

// 读取导入设置
const importSettings = configManager.getImportSettings();

// 读取全局设置
const globalSettings = configManager.getGlobalSettings();
```

### 3. 更新配置

```javascript
// 更新单个字段
await configManager.updateField('importSettings.mode', 'custom_folder');

// 批量更新
await configManager.updateFields({
    'importSettings.mode': 'project_adjacent',
    'importSettings.addToComposition': true
});
```

### 4. 监听变化

```javascript
// 监听字段变化
configManager.addFieldListener('importSettings.mode', (newValue, oldValue) => {
    console.log(`${oldValue} → ${newValue}`);
});
```

---

## 📋 常用字段速查

### 导入模式
```javascript
'importSettings.mode'
// 值: 'direct' | 'project_adjacent' | 'custom_folder'
```

### 添加到合成
```javascript
'importSettings.addToComposition'
// 值: true | false
```

### 音量
```javascript
'importSettings.soundSettings.volume'
// 值: 0-100
```

### 导出模式
```javascript
'importSettings.exportSettings.mode'
// 值: 'desktop' | 'project_adjacent' | 'custom_folder'
```

### 独显模式
```javascript
'uiSettings.fullscreen'
// 值: true | false
```

### 主题
```javascript
'userPreferences.theme'
// 值: 'dark' | 'light' | 'ae_native'
```

### 通信端口
```javascript
'globalSettings.communicationPort'
// 值: 1024-65535
```

---

## 🎯 常用配置组合

### 快速预览模式
```javascript
await configManager.updateFields({
    'importSettings.mode': 'project_adjacent',
    'importSettings.addToComposition': false,
    'uiSettings.fullscreen': true,
    'uiSettings.projectInfo': false,
    'uiSettings.logPanel': false
});
```

### 音频项目模式
```javascript
await configManager.updateFields({
    'importSettings.mode': 'project_adjacent',
    'importSettings.addToComposition': true,
    'importSettings.timelineOptions.enabled': true,
    'importSettings.timelineOptions.placement': 'current_time',
    'importSettings.soundSettings.volume': 80
});
```

### 批量导入模式
```javascript
await configManager.updateFields({
    'importSettings.mode': 'custom_folder',
    'importSettings.addToComposition': false,
    'importSettings.fileManagement.createTagFolders': true
});
```

### 极简模式
```javascript
await configManager.updateFields({
    'uiSettings.theme': false,
    'uiSettings.language': false,
    'uiSettings.log': false,
    'uiSettings.projectInfo': false,
    'uiSettings.fullscreen': true
});
```

---

## 🔧 UI绑定模板

### 选择器绑定
```javascript
// HTML
<select id="import-mode">
    <option value="direct">直接导入</option>
    <option value="project_adjacent">项目旁文件夹</option>
    <option value="custom_folder">自定义文件夹</option>
</select>

// JavaScript
// 从配置初始化
document.getElementById('import-mode').value = 
    configManager.getField('importSettings.mode');

// 绑定事件
document.getElementById('import-mode').addEventListener('change', async (e) => {
    await configManager.updateField('importSettings.mode', e.target.value);
});
```

### 滑块绑定
```javascript
// HTML
<input type="range" id="volume" min="0" max="100">

// JavaScript
// 从配置初始化
document.getElementById('volume').value = 
    configManager.getField('importSettings.soundSettings.volume');

// 绑定事件（带防抖）
let timeout;
document.getElementById('volume').addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        await configManager.updateField(
            'importSettings.soundSettings.volume', 
            parseInt(e.target.value)
        );
    }, 300);
});
```

### 复选框绑定
```javascript
// HTML
<input type="checkbox" id="add-to-comp">

// JavaScript
// 从配置初始化
document.getElementById('add-to-comp').checked = 
    configManager.getField('importSettings.addToComposition');

// 绑定事件
document.getElementById('add-to-comp').addEventListener('change', async (e) => {
    await configManager.updateField('importSettings.addToComposition', e.target.checked);
});
```

---

## 🎨 配置预设模板

```javascript
// 定义预设
const presets = {
    quickPreview: {
        'importSettings.mode': 'project_adjacent',
        'importSettings.addToComposition': false,
        'uiSettings.fullscreen': true
    },
    audioProject: {
        'importSettings.mode': 'project_adjacent',
        'importSettings.addToComposition': true,
        'importSettings.soundSettings.volume': 80
    },
    batchImport: {
        'importSettings.mode': 'custom_folder',
        'importSettings.fileManagement.createTagFolders': true
    }
};

// 应用预设
async function applyPreset(presetName) {
    await configManager.updateFields(presets[presetName]);
}

// 使用
await applyPreset('quickPreview');
```

---

## 📊 字段路径规则

### 路径格式
```
对象.子对象.字段名
```

### 示例
```javascript
✅ 'importSettings.mode'
✅ 'importSettings.timelineOptions.placement'
✅ 'importSettings.exportSettings.mode'
✅ 'uiSettings.fullscreen'

❌ 'importSettings/mode'
❌ 'importSettings->mode'
❌ 'importSettings[mode]'
```

---

## ⚠️ 常见错误

### 错误1: 字段路径错误
```javascript
// ❌ 错误
const value = configManager.getField('import.mode');

// ✅ 正确
const value = configManager.getField('importSettings.mode');
```

### 错误2: 无效的枚举值
```javascript
// ❌ 错误
await configManager.updateField('importSettings.mode', 'invalid');

// ✅ 正确
await configManager.updateField('importSettings.mode', 'custom_folder');
```

### 错误3: 超出范围的数值
```javascript
// ❌ 错误
await configManager.updateField('importSettings.soundSettings.volume', 150);

// ✅ 正确
await configManager.updateField('importSettings.soundSettings.volume', 80);
```

### 错误4: 忘记 await
```javascript
// ❌ 错误
configManager.updateField('importSettings.mode', 'custom_folder');

// ✅ 正确
await configManager.updateField('importSettings.mode', 'custom_folder');
```

---

## 🔍 调试技巧

### 打印完整配置
```javascript
console.log(JSON.stringify(configManager.config, null, 2));
```

### 打印当前面板配置
```javascript
console.log(JSON.stringify(configManager.panelConfig, null, 2));
```

### 验证字段路径
```javascript
const value = configManager.getField('importSettings.mode');
if (value === undefined) {
    console.error('字段路径错误');
}
```

### 监听所有变化
```javascript
configManager.addListener((type, data) => {
    console.log('配置变化:', type, data);
});
```

---

## 📚 更多资源

| 资源 | 位置 |
|------|------|
| **完整文档** | `docs/CONFIG_SYSTEM.md` |
| **字段速查表** | `resources/reference/CONFIG_FIELDS_REFERENCE.md` |
| **配置示例** | `resources/reference/Eagle2Ae-Presets-Annotated.json` |
| **使用示例** | `examples/config-usage-example.js` |
| **JSON Schema** | `resources/reference/Eagle2Ae-Config-Schema.json` |

---

## 💡 最佳实践

### 1. 使用防抖避免频繁保存
```javascript
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const debouncedUpdate = debounce(async (field, value) => {
    await configManager.updateField(field, value);
}, 500);
```

### 2. 批量更新优于多次单独更新
```javascript
// ❌ 不推荐
await configManager.updateField('importSettings.mode', 'custom_folder');
await configManager.updateField('importSettings.customFolderPath', '/path');
await configManager.updateField('importSettings.addToComposition', true);

// ✅ 推荐
await configManager.updateFields({
    'importSettings.mode': 'custom_folder',
    'importSettings.customFolderPath': '/path',
    'importSettings.addToComposition': true
});
```

### 3. 始终处理错误
```javascript
const result = await configManager.updateField('importSettings.mode', 'custom_folder');

if (!result.success) {
    console.error('更新失败:', result.error);
    showErrorNotification(result.error);
}
```

### 4. 使用字段监听器响应变化
```javascript
configManager.addFieldListener('importSettings.mode', (newValue) => {
    // 根据模式更新UI
    updateUIForMode(newValue);
});
```

---

**版本**: 2.0.0  
**最后更新**: 2025-10-24

---

## 🎯 一句话总结

```javascript
// 初始化 → 读取 → 更新 → 监听
const cm = new MultiPanelConfigManager();
await cm.init();
const mode = cm.getField('importSettings.mode');
await cm.updateField('importSettings.mode', 'custom_folder');
cm.addFieldListener('importSettings.mode', (v) => console.log(v));
```
