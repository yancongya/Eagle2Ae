# 预设保存修复 - 快速测试清单

## 🚀 测试前准备

### 1. 启动开发环境

```bash
# 在项目根目录运行
pnpm dev:web
```

### 2. 打开浏览器
- 访问：`http://localhost:5173/extensions/ae/`
- 打开浏览器开发者工具（F12）
- 切换到 Console 标签页，查看日志

---

## ✅ 测试 1：UI 面板组设置（最重要）

### 步骤：

1. **修改 UI 设置**
   - 在页面右上角找到设置按钮（齿轮图标）
   - 向下滚动到"UI 设置"区域
   - 点击几个按钮切换状态（例如：隐藏主题按钮、隐藏语言按钮）
   - 观察页面变化：对应的按钮应该消失/出现

2. **检查控制台日志**
   ```
   应该看到：
   [UI Settings] 设置已保存: theme = false
   💾 预设已自动保存到文档目录
   ```

3. **检查 localStorage**
   - 在 Console 中输入：
   ```javascript
   JSON.parse(localStorage.getItem('uiSettings'))
   ```
   - 应该看到你刚才的设置

4. **刷新页面测试**
   - 按 F5 刷新页面
   - 确认 UI 设置保持不变（隐藏的按钮仍然隐藏）

### ✅ 通过标准：
- [ ] UI 按钮能正常切换显示/隐藏
- [ ] 控制台显示保存成功的日志
- [ ] 刷新后设置保持不变

---

## ✅ 测试 2：语言切换

### 步骤：

1. **切换语言**
   - 点击右上角的语言切换按钮（🌐 或 中/EN）
   - 切换到英文

2. **检查控制台日志**
   ```
   应该看到：
   [Iframe Sync] 开始更新语言: en-US
   💾 预设已自动保存到文档目录
   ```

3. **检查 localStorage**
   ```javascript
   localStorage.getItem('language')
   // 应该返回: "en-US"
   ```

4. **刷新页面测试**
   - 按 F5 刷新
   - 确认界面仍然是英文

### ✅ 通过标准：
- [ ] 语言能正常切换
- [ ] 界面文字正确翻译
- [ ] 刷新后语言保持不变

---

## ✅ 测试 3：主题切换

### 步骤：

1. **切换主题**
   - 点击右上角的主题切换按钮（🌙 或 ☀️）
   - 切换到亮色主题

2. **检查控制台日志**
   ```
   应该看到：
   💾 预设已自动保存到文档目录
   ```

3. **检查 localStorage**
   ```javascript
   localStorage.getItem('aeTheme')
   // 应该返回: "light"
   ```

4. **刷新页面测试**
   - 按 F5 刷新
   - 确认主题仍然是亮色

### ✅ 通过标准：
- [ ] 主题能正常切换
- [ ] 页面颜色正确变化
- [ ] 刷新后主题保持不变

---

## ✅ 测试 4：检查预设文件内容（CEP 模式）

> 注意：这个测试需要在 After Effects 中运行扩展

### 步骤：

1. **在 AE 中打开扩展**
   - 打开 After Effects
   - 窗口 → 扩展 → Eagle2Ae

2. **修改一些设置**
   - 切换 UI 设置
   - 切换语言
   - 切换主题

3. **打开预设目录**
   - 点击扩展中的"打开预设目录"按钮
   - 找到 `Eagle2Ae-Presets.json` 文件

4. **检查文件内容**
   - 用文本编辑器打开 JSON 文件
   - 确认包含以下字段：
   ```json
   {
     "importSettings": {...},
     "userPreferences": {...},
     "uiSettings": {
       "theme": true,
       "language": true,
       "log": true,
       "projectInfo": true,
       "logPanel": true,
       "header": true,
       "fullscreen": false
     },
     "language": "zh-CN",
     "aeTheme": "dark",
     "projectAdjacentSettings": {...},
     "customFolderSettings": {...},
     "exportedAt": "2025-10-24T..."
   }
   ```

### ✅ 通过标准：
- [ ] 预设文件存在
- [ ] 包含所有新增字段
- [ ] JSON 格式正确

---

## ✅ 测试 5：重置和恢复（完整流程）

### 步骤：

1. **配置所有设置**
   - 隐藏几个 UI 按钮
   - 切换语言为英文
   - 切换主题为亮色

2. **记录当前状态**
   - 截图或记录当前的设置

3. **点击"重置默认"按钮**
   - 在设置面板中找到"重置默认"按钮
   - 点击它

4. **检查是否重置**
   - 所有 UI 按钮应该恢复显示
   - 语言应该恢复为中文
   - 主题应该恢复为暗色

5. **刷新页面**
   - 按 F5 刷新
   - 观察控制台日志：
   ```
   应该看到：
   🔎 Trying to load local presets...
   ✅ 已恢复 UI 面板组设置
   ✅ 已恢复语言设置: zh-CN
   ✅ 已恢复主题设置: dark
   ✅ 已加载并应用本地预设（包含 UI 设置、语言、主题等）
   ```

6. **确认恢复成功**
   - 所有设置应该恢复为默认值

### ✅ 通过标准：
- [ ] 重置功能正常工作
- [ ] 刷新后能从预设文件恢复
- [ ] 控制台显示所有恢复日志

---

## 🐛 常见问题排查

### 问题 1：控制台没有看到保存日志

**检查：**
```javascript
// 在控制台输入
window.eagleToAeApp
// 应该返回一个对象，不是 undefined

typeof window.eagleToAeApp.savePresetsSilently
// 应该返回 "function"
```

**解决：**
- 确保 `main.js` 已加载
- 检查是否有 JavaScript 错误
- 刷新页面重试

### 问题 2：刷新后设置丢失

**检查：**
```javascript
// 检查 localStorage
localStorage.getItem('uiSettings')
localStorage.getItem('language')
localStorage.getItem('aeTheme')
```

**解决：**
- 确保浏览器允许 localStorage
- 检查是否在隐私模式下运行
- 清除缓存后重试

### 问题 3：预设文件没有新字段

**检查：**
- 确认修改后的代码已生效
- 手动触发一次保存：
```javascript
window.eagleToAeApp.savePresetsSilently()
```

**解决：**
- 重新构建项目
- 清除浏览器缓存
- 检查文件是否正确修改

---

## 📊 测试结果记录

### 测试环境
- [ ] 浏览器 Demo 模式（开发环境）
- [ ] After Effects CEP 扩展模式

### 测试结果

| 测试项 | 状态 | 备注 |
|--------|------|------|
| UI 面板组设置 | ⬜ 通过 / ⬜ 失败 | |
| 语言切换 | ⬜ 通过 / ⬜ 失败 | |
| 主题切换 | ⬜ 通过 / ⬜ 失败 | |
| 预设文件内容 | ⬜ 通过 / ⬜ 失败 | |
| 重置和恢复 | ⬜ 通过 / ⬜ 失败 | |

### 发现的问题

1. 
2. 
3. 

---

## 🎯 快速验证命令

在浏览器控制台中运行这些命令快速验证：

```javascript
// 1. 检查 UI 设置
console.log('UI Settings:', JSON.parse(localStorage.getItem('uiSettings')));

// 2. 检查语言
console.log('Language:', localStorage.getItem('language'));

// 3. 检查主题
console.log('Theme:', localStorage.getItem('aeTheme'));

// 4. 检查主应用对象
console.log('App loaded:', !!window.eagleToAeApp);

// 5. 手动触发保存
window.eagleToAeApp?.savePresetsSilently().then(() => console.log('✅ 保存成功'));

// 6. 查看所有 localStorage 数据
Object.keys(localStorage).forEach(key => {
    if (key.includes('eagle') || key.includes('ae_') || key.includes('ui') || key.includes('language') || key.includes('theme')) {
        console.log(key, ':', localStorage.getItem(key));
    }
});
```

---

## ✨ 测试完成后

如果所有测试都通过：
- ✅ 代码修改成功
- ✅ 功能正常工作
- ✅ 可以提交代码

如果有测试失败：
- 📝 记录失败的测试项
- 🐛 查看控制台错误信息
- 💬 提供详细的错误描述以便修复
