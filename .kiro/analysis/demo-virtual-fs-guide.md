# Demo 模式虚拟文件系统使用指南

## 🎯 功能概述

在 Demo 模式下，现在使用虚拟文件系统来模拟真实的文件操作，提供更接近实际使用的体验。

### 核心特性

✅ **持久化存储** - 使用 localStorage 保存文件
✅ **文件元数据** - 记录文件大小、创建时间、修改时间
✅ **文件列表管理** - 可以查看所有虚拟文件
✅ **下载功能** - 可以将虚拟文件下载到本地
✅ **自动降级** - 如果虚拟文件系统不可用，自动降级到 localStorage

---

## 📁 虚拟文件系统结构

```
虚拟文件系统 (localStorage)
└── Eagle2Ae-Ae/
    └── presets/
        └── Eagle2Ae-Presets.json  (预设文件)
```

---

## 🧪 测试步骤

### 步骤 1：启动并查看虚拟文件系统

1. **启动开发服务器**
   ```bash
   pnpm dev:web
   ```

2. **打开浏览器**
   - 访问：`http://localhost:5173/extensions/ae/`
   - 打开控制台（F12）

3. **检查虚拟文件系统是否加载**
   ```javascript
   // 在控制台输入
   window.demoFileSystem
   // 应该返回 DemoFileSystem 对象
   ```

### 步骤 2：测试预设保存

1. **修改一些设置**
   - 切换 UI 设置
   - 切换语言
   - 切换主题

2. **检查控制台日志**
   ```
   应该看到：
   💾 预设已保存到虚拟文件系统 (xxxx bytes)
   ```

3. **查看虚拟文件**
   ```javascript
   // 列出所有文件
   window.demoFileSystem.listFiles()
   
   // 查看预设文件内容
   const result = window.demoFileSystem.readFile('Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json');
   console.log(JSON.parse(result.content));
   ```

### 步骤 3：测试预设加载

1. **刷新页面**（F5）

2. **检查控制台日志**
   ```
   应该看到：
   [Demo FS] 虚拟文件系统已初始化
   [Demo FS] 虚拟文件系统已加载
   🔎 Trying to load local presets...
   [Demo FS] 文件已读取: Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json (xxxx bytes)
   ✅ 从虚拟文件系统加载预设 (xxxx bytes)
   ```

3. **确认设置恢复**
   - 所有设置应该保持不变

### 步骤 4：使用 Demo 模式专用按钮

1. **打开设置面板**
   - 点击右上角设置按钮（⚙️）

2. **找到预设管理区域**
   - 应该看到两个新按钮：
     - 📥 下载预设文件
     - 📂 查看文件

3. **点击"查看文件"按钮**
   - 控制台会显示虚拟文件系统的详细信息
   - 包括文件数量、总大小、文件列表

4. **点击"下载预设文件"按钮**
   - 浏览器会下载 `Eagle2Ae-Presets.json` 文件
   - 可以用文本编辑器打开查看内容

---

## 🔍 虚拟文件系统 API

### 基础操作

```javascript
// 1. 写入文件
window.demoFileSystem.writeFile('path/to/file.json', '{"key": "value"}');

// 2. 读取文件
const result = window.demoFileSystem.readFile('path/to/file.json');
if (result.success) {
    console.log(result.content);
}

// 3. 检查文件是否存在
const exists = window.demoFileSystem.exists('path/to/file.json');

// 4. 删除文件
window.demoFileSystem.deleteFile('path/to/file.json');

// 5. 列出所有文件
const files = window.demoFileSystem.listFiles();
console.log(files);

// 6. 获取文件信息
const info = window.demoFileSystem.getFileInfo('path/to/file.json');
console.log(info);

// 7. 下载文件到本地
window.demoFileSystem.downloadFile('path/to/file.json', 'download-name.json');

// 8. 获取存储使用情况
const storageInfo = window.demoFileSystem.getStorageInfo();
console.log(`文件数: ${storageInfo.fileCount}`);
console.log(`总大小: ${storageInfo.totalSizeFormatted}`);

// 9. 清空所有文件
window.demoFileSystem.clear();
```

### 高级操作

```javascript
// 批量操作示例
const fs = window.demoFileSystem;

// 创建多个文件
fs.writeFile('config/settings.json', '{"theme": "dark"}');
fs.writeFile('data/user.json', '{"name": "User"}');
fs.writeFile('logs/app.log', 'Application started');

// 查看所有文件
console.table(fs.listFiles());

// 下载所有 JSON 文件
fs.listFiles()
    .filter(f => f.path.endsWith('.json'))
    .forEach(f => fs.downloadFile(f.path));
```

---

## 📊 存储信息

### 查看存储使用情况

```javascript
const info = window.demoFileSystem.getStorageInfo();
console.log('=== 存储信息 ===');
console.log(`文件数量: ${info.fileCount}`);
console.log(`总大小: ${info.totalSizeFormatted}`);
console.log('文件列表:');
info.files.forEach(file => {
    console.log(`  ${file.path} - ${window.demoFileSystem.formatBytes(file.size)}`);
});
```

### localStorage 使用情况

```javascript
// 查看所有虚拟文件系统相关的 localStorage 键
Object.keys(localStorage)
    .filter(key => key.startsWith('demo_fs_'))
    .forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`${key}: ${value.length} bytes`);
    });
```

---

## 🎯 测试场景

### 场景 1：完整的保存和恢复流程

```javascript
// 1. 配置所有设置
// （通过 UI 操作）

// 2. 触发保存
window.eagleToAeApp.savePresetsSilently();

// 3. 查看保存的文件
const result = window.demoFileSystem.readFile('Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json');
console.log('保存的预设:', JSON.parse(result.content));

// 4. 下载文件
window.demoFileSystem.downloadFile('Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json');

// 5. 清除所有设置
localStorage.clear();

// 6. 刷新页面
location.reload();

// 7. 确认设置恢复
// （检查 UI 状态）
```

### 场景 2：手动编辑预设

```javascript
// 1. 读取当前预设
const result = window.demoFileSystem.readFile('Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json');
const preset = JSON.parse(result.content);

// 2. 修改预设
preset.language = 'en-US';
preset.aeTheme = 'light';
preset.uiSettings.theme = false;

// 3. 保存修改后的预设
window.demoFileSystem.writeFile(
    'Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json',
    JSON.stringify(preset, null, 2)
);

// 4. 重新加载预设
window.eagleToAeApp.loadPresetsFromDisk();
```

### 场景 3：备份和恢复

```javascript
// 备份当前预设
const backup = window.demoFileSystem.readFile('Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json');
if (backup.success) {
    // 保存到另一个位置
    window.demoFileSystem.writeFile('Eagle2Ae-Ae/presets/backup.json', backup.content);
    console.log('✅ 预设已备份');
}

// 恢复备份
const restore = window.demoFileSystem.readFile('Eagle2Ae-Ae/presets/backup.json');
if (restore.success) {
    window.demoFileSystem.writeFile('Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json', restore.content);
    window.eagleToAeApp.loadPresetsFromDisk();
    console.log('✅ 预设已恢复');
}
```

---

## 🐛 故障排查

### 问题 1：虚拟文件系统未加载

**检查：**
```javascript
console.log('FS 加载:', !!window.demoFileSystem);
```

**解决：**
- 确保 `demo-file-system.js` 已加载
- 检查控制台是否有加载错误
- 硬刷新页面（Ctrl + Shift + R）

### 问题 2：文件保存失败

**检查：**
```javascript
// 检查 localStorage 是否可用
console.log('Storage 可用:', typeof(Storage) !== "undefined");

// 检查存储空间
const used = JSON.stringify(localStorage).length;
console.log(`已使用: ${used} bytes`);
```

**解决：**
- 清理不需要的 localStorage 数据
- 检查是否在隐私模式下运行
- 检查浏览器存储配额

### 问题 3：文件读取失败

**检查：**
```javascript
// 列出所有文件
console.log(window.demoFileSystem.listFiles());

// 检查文件是否存在
console.log('文件存在:', window.demoFileSystem.exists('Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json'));
```

**解决：**
- 确认文件路径正确
- 检查文件是否已保存
- 尝试重新保存文件

---

## ✨ 优势

### 相比直接使用 localStorage

1. **更好的组织** - 文件系统结构清晰
2. **元数据支持** - 记录文件大小、时间等信息
3. **文件管理** - 可以列出、查看、删除文件
4. **下载功能** - 可以导出虚拟文件到本地
5. **更接近真实** - 模拟真实的文件操作

### 开发体验

- 📝 清晰的 API
- 🔍 详细的日志
- 🐛 完善的错误处理
- 📊 存储使用情况统计
- 💾 自动降级机制

---

## 📚 相关文档

- **虚拟文件系统源码**：`apps/eagle2ae_web/public/extensions/ae/js/demo/demo-file-system.js`
- **使用示例**：`apps/eagle2ae_web/public/extensions/ae/js/main.js` (savePresetsSilently, loadPresetsFromDisk)
- **Demo 模式测试**：`.kiro/analysis/demo-mode-test-guide.md`

---

## 🎉 成功标准

测试通过的标准：

1. ✅ 虚拟文件系统成功加载
2. ✅ 预设能保存到虚拟文件系统
3. ✅ 刷新后能从虚拟文件系统恢复
4. ✅ 可以查看虚拟文件列表
5. ✅ 可以下载虚拟文件到本地
6. ✅ 控制台显示正确的日志
7. ✅ 没有错误信息

如果所有标准都满足，说明虚拟文件系统工作正常！🎊
