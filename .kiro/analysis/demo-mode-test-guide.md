# Demo 模式预设保存测试指南

## ✅ 修复内容

### 1. Demo 模式预设保存
- ✅ 在 Demo 模式下，预设保存到 `localStorage` 而不是调用文件系统
- ✅ 使用键名：`eagle2ae_preset_json`
- ✅ 保存为格式化的 JSON（便于查看）

### 2. Demo 模式预设加载
- ✅ 启动时自动从 `localStorage` 加载预设
- ✅ 应用所有配置（UI 设置、语言、主题等）

### 3. 修复的错误
- ✅ 修复 `isCustomFolderVisible is not defined` 错误
- ✅ 修复 Demo 模式下的 JSON 解析错误

---

## 🧪 测试步骤

### 步骤 1：启动开发服务器

```bash
pnpm dev:web
```

### 步骤 2：打开浏览器

访问：`http://localhost:5173/extensions/ae/`

### 步骤 3：测试 UI 设置保存

1. **修改 UI 设置**
   - 点击设置按钮（⚙️）
   - 切换几个 UI 按钮（如：隐藏主题、隐藏语言）

2. **检查控制台**
   - 应该看到：`💾 预设已保存到浏览器存储 (Demo 模式)`
   - **不应该**看到：JSON 解析错误

3. **检查 localStorage**
   - 在控制台输入：
   ```javascript
   JSON.parse(localStorage.getItem('eagle2ae_preset_json'))
   ```
   - 应该看到完整的预设对象，包含：
     - `importSettings`
     - `userPreferences`
     - `uiSettings` ✅ 新增
     - `language` ✅ 新增
     - `aeTheme` ✅ 新增
     - `projectAdjacentSettings` ✅ 新增
     - `customFolderSettings` ✅ 新增
     - `exportedAt`

### 步骤 4：测试预设恢复

1. **刷新页面**
   - 按 F5 刷新浏览器

2. **检查控制台日志**
   - 应该看到：
   ```
   🔎 Trying to load local presets...
   ✅ 从浏览器存储加载预设 (Demo 模式)
   ✅ 已恢复 UI 面板组设置
   ✅ 已恢复语言设置: en-US
   ✅ 已恢复主题设置: dark
   ✅ 已恢复项目旁复制设置
   ✅ 已恢复自定义文件夹设置
   ✅ 已加载并应用本地预设（包含 UI 设置、语言、主题等）
   ```

3. **确认设置恢复**
   - UI 按钮的显示/隐藏状态应该保持
   - 语言应该保持
   - 主题应该保持

### 步骤 5：测试完整流程

1. **配置所有设置**
   ```javascript
   // 在控制台执行，快速配置
   localStorage.setItem('uiSettings', JSON.stringify({
       theme: false,
       language: false,
       log: true,
       projectInfo: true,
       logPanel: false,
       header: false,
       fullscreen: false
   }));
   localStorage.setItem('language', 'en-US');
   localStorage.setItem('aeTheme', 'light');
   ```

2. **触发保存**
   ```javascript
   window.eagleToAeApp.savePresetsSilently()
   ```

3. **查看保存的预设**
   ```javascript
   console.log(JSON.parse(localStorage.getItem('eagle2ae_preset_json')))
   ```

4. **清除所有设置**
   ```javascript
   localStorage.removeItem('uiSettings');
   localStorage.removeItem('language');
   localStorage.removeItem('aeTheme');
   ```

5. **刷新页面**
   - 按 F5

6. **确认恢复**
   - 所有设置应该从预设 JSON 恢复

---

## 🔍 验证清单

### ✅ 功能验证

- [ ] UI 设置能保存到预设
- [ ] 语言设置能保存到预设
- [ ] 主题设置能保存到预设
- [ ] 项目旁设置能保存到预设
- [ ] 自定义文件夹设置能保存到预设
- [ ] 刷新后能从预设恢复所有设置
- [ ] 控制台没有错误

### ✅ 日志验证

应该看到的日志：
- [ ] `💾 预设已保存到浏览器存储 (Demo 模式)`
- [ ] `✅ 从浏览器存储加载预设 (Demo 模式)`
- [ ] `✅ 已恢复 UI 面板组设置`
- [ ] `✅ 已恢复语言设置: ...`
- [ ] `✅ 已恢复主题设置: ...`

不应该看到的错误：
- [ ] ❌ JSON 解析失败
- [ ] ❌ isCustomFolderVisible is not defined
- [ ] ❌ Demo script execution result

---

## 🎯 快速验证命令

在浏览器控制台中运行：

```javascript
// 1. 检查预设是否存在
console.log('预设存在:', !!localStorage.getItem('eagle2ae_preset_json'));

// 2. 查看预设内容
const preset = JSON.parse(localStorage.getItem('eagle2ae_preset_json'));
console.log('预设内容:', preset);

// 3. 检查新增字段
console.log('UI 设置:', preset.uiSettings);
console.log('语言:', preset.language);
console.log('主题:', preset.aeTheme);
console.log('项目旁设置:', preset.projectAdjacentSettings);
console.log('自定义文件夹设置:', preset.customFolderSettings);

// 4. 手动触发保存
window.eagleToAeApp.savePresetsSilently().then(() => {
    console.log('✅ 保存成功');
    console.log('新预设:', JSON.parse(localStorage.getItem('eagle2ae_preset_json')));
});

// 5. 导出预设（复制到剪贴板）
copy(localStorage.getItem('eagle2ae_preset_json'));
console.log('✅ 预设已复制到剪贴板');
```

---

## 📊 预设文件结构示例

正确的预设 JSON 应该是这样的：

```json
{
  "importSettings": {
    "mode": "custom_folder",
    "projectAdjacentFolder": "Eagle_Assets",
    "customFolderPath": "[已选择] sound",
    "addToComposition": true,
    "noImportSubMode": "normal",
    "timelineOptions": {
      "enabled": false,
      "placement": "timeline_start"
    },
    "fileManagement": {
      "keepOriginalName": true,
      "addTimestamp": false,
      "createTagFolders": false,
      "deleteFromEagle": false
    },
    "soundSettings": {
      "enabled": true,
      "volume": 60
    },
    "exportSettings": {
      "mode": "desktop",
      "projectAdjacentFolder": "Eagle_Assets",
      "customExportPath": "[已选择] sound",
      "autoCopy": true,
      "addTimestamp": false,
      "createSubfolders": false,
      "burnAfterReading": true
    }
  },
  "userPreferences": {
    "lastUsedMode": "project_adjacent",
    "favoriteFolder": "",
    "autoSaveSettings": true,
    "showWelcomeWizard": true,
    "theme": "ae_native",
    "communicationPort": 8080,
    "lastUsedExportMode": "project_adjacent",
    "favoriteExportFolder": ""
  },
  "uiSettings": {
    "theme": true,
    "language": false,
    "log": false,
    "projectInfo": false,
    "logPanel": false,
    "header": false,
    "fullscreen": false
  },
  "language": "en-US",
  "aeTheme": "dark",
  "projectAdjacentSettings": {
    "folderName": "Eagle_Assets"
  },
  "customFolderSettings": {
    "folderPath": "[已选择] sound",
    "recentFolders": ["[已选择] sound"],
    "directoryHandle": {}
  },
  "exportedAt": "2025-10-24T02:14:51.091Z"
}
```

---

## 🐛 常见问题

### 问题：控制台仍然显示 JSON 解析错误

**原因：** 浏览器缓存了旧代码

**解决：**
1. 硬刷新：Ctrl + Shift + R (Windows) 或 Cmd + Shift + R (Mac)
2. 或清除缓存后刷新

### 问题：预设没有保存

**检查：**
```javascript
// 检查 Demo 模式是否激活
console.log('Demo 模式:', window.__DEMO_MODE_ACTIVE__);

// 检查主应用是否加载
console.log('App 加载:', !!window.eagleToAeApp);

// 手动触发保存
window.eagleToAeApp.savePresetsSilently();
```

### 问题：刷新后设置丢失

**检查：**
```javascript
// 检查预设是否存在
console.log(localStorage.getItem('eagle2ae_preset_json'));

// 检查是否在隐私模式
console.log('Storage 可用:', typeof(Storage) !== "undefined");
```

---

## ✨ 成功标准

测试通过的标准：

1. ✅ 控制台没有错误
2. ✅ 能看到 "预设已保存到浏览器存储 (Demo 模式)"
3. ✅ localStorage 中有 `eagle2ae_preset_json` 键
4. ✅ 预设 JSON 包含所有新增字段
5. ✅ 刷新后所有设置正确恢复
6. ✅ 日志显示所有恢复消息

如果所有标准都满足，说明修复成功！🎉
