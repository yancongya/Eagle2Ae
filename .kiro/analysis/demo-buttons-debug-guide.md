# Demo 模式按钮调试指南

## 🐛 问题：Demo 模式按钮不显示

### 检查步骤

#### 1. 确认 Demo 模式已激活

在浏览器控制台输入：

```javascript
console.log('Demo 模式:', window.__DEMO_MODE_ACTIVE__);
```

**预期结果**：应该返回 `true`

**如果返回 `undefined` 或 `false`**：
- Demo 模式没有正确激活
- 检查 `demo-override.js` 是否加载
- 检查 `demo-mode.js` 是否加载

#### 2. 检查按钮容器是否存在

```javascript
const container = document.getElementById('demo-preset-buttons');
console.log('按钮容器:', container);
console.log('容器显示状态:', container ? container.style.display : 'not found');
```

**预期结果**：
- 容器应该存在
- `display` 应该是 `'flex'`（在打开设置面板后）

#### 3. 检查按钮是否存在

```javascript
console.log('下载按钮:', document.getElementById('download-preset-btn'));
console.log('查看文件按钮:', document.getElementById('view-demo-files-btn'));
```

**预期结果**：两个按钮都应该存在

#### 4. 手动显示按钮

如果按钮存在但不显示，手动设置：

```javascript
const container = document.getElementById('demo-preset-buttons');
if (container) {
    container.style.display = 'flex';
    console.log('✅ 按钮容器已手动显示');
}
```

#### 5. 检查初始化状态

```javascript
console.log('App 对象:', window.eagleToAeApp);
console.log('按钮已初始化:', window.eagleToAeApp?._demoButtonsInitialized);
```

#### 6. 手动初始化按钮

```javascript
if (window.eagleToAeApp && typeof window.eagleToAeApp.initDemoModeButtons === 'function') {
    window.eagleToAeApp.initDemoModeButtons();
    console.log('✅ 手动初始化完成');
}
```

---

## 🔍 调试日志

打开设置面板时，应该在控制台看到以下日志：

```
[Debug] Demo 模式状态: true
[Debug] 按钮已初始化: false
[Debug] 开始初始化 Demo 按钮
[Demo] 初始化 Demo 模式按钮
[Demo] Demo 按钮容器已显示
[Demo] 下载预设按钮已绑定
[Demo] 查看文件按钮已绑定
```

**如果没有看到这些日志**：
- `showSettingsPanel()` 函数可能没有被调用
- 或者 Demo 模式没有激活

---

## 🛠️ 快速修复

### 方法 1：硬刷新浏览器

```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### 方法 2：清除缓存

1. 打开开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

### 方法 3：手动显示按钮

在控制台执行：

```javascript
// 1. 显示按钮容器
document.getElementById('demo-preset-buttons').style.display = 'flex';

// 2. 绑定事件
const app = window.eagleToAeApp;

document.getElementById('download-preset-btn').onclick = () => {
    app.handleDownloadPreset();
};

document.getElementById('view-demo-files-btn').onclick = () => {
    app.handleViewDemoFiles();
};

console.log('✅ 按钮已手动修复');
```

---

## 📊 常见问题

### 问题 1：按钮容器不存在

**原因**：HTML 文件没有正确加载或被修改

**解决**：
- 检查 `index.html` 中是否有 `id="demo-preset-buttons"` 的元素
- 确认元素在 `preset-management-section` 内部

### 问题 2：Demo 模式未激活

**原因**：Demo 脚本没有加载

**解决**：
- 检查 `demo-override.js` 是否在最前面加载
- 检查 `demo-mode.js` 是否加载
- 查看控制台是否有脚本加载错误

### 问题 3：按钮存在但不显示

**原因**：CSS 样式问题或 `display: none` 没有被移除

**解决**：
```javascript
// 强制显示
const container = document.getElementById('demo-preset-buttons');
container.style.display = 'flex !important';
container.style.visibility = 'visible';
container.style.opacity = '1';
```

### 问题 4：点击按钮没反应

**原因**：事件监听器没有绑定

**解决**：
```javascript
// 手动绑定
window.eagleToAeApp.initDemoModeButtons();
```

---

## 🎯 完整测试脚本

在控制台运行这个完整的测试脚本：

```javascript
console.log('=== Demo 按钮诊断 ===');

// 1. 检查 Demo 模式
console.log('1. Demo 模式:', window.__DEMO_MODE_ACTIVE__);

// 2. 检查 App 对象
console.log('2. App 对象:', !!window.eagleToAeApp);

// 3. 检查按钮容器
const container = document.getElementById('demo-preset-buttons');
console.log('3. 按钮容器:', !!container);
if (container) {
    console.log('   - display:', container.style.display);
    console.log('   - visibility:', container.style.visibility);
}

// 4. 检查按钮
const downloadBtn = document.getElementById('download-preset-btn');
const viewBtn = document.getElementById('view-demo-files-btn');
console.log('4. 下载按钮:', !!downloadBtn);
console.log('5. 查看按钮:', !!viewBtn);

// 5. 检查初始化状态
console.log('6. 已初始化:', window.eagleToAeApp?._demoButtonsInitialized);

// 6. 尝试修复
if (window.__DEMO_MODE_ACTIVE__ && container && !container.style.display.includes('flex')) {
    console.log('🔧 尝试修复...');
    if (window.eagleToAeApp && typeof window.eagleToAeApp.initDemoModeButtons === 'function') {
        window.eagleToAeApp.initDemoModeButtons();
        console.log('✅ 修复完成');
    }
}

console.log('=== 诊断完成 ===');
```

---

## ✅ 成功标准

按钮正常显示时，应该满足：

1. ✅ `window.__DEMO_MODE_ACTIVE__` 为 `true`
2. ✅ 按钮容器的 `display` 为 `'flex'`
3. ✅ 两个按钮都存在于 DOM 中
4. ✅ 点击按钮有反应（控制台有日志）
5. ✅ 下载按钮能下载文件
6. ✅ 查看文件按钮能显示文件信息

---

现在打开浏览器控制台，运行完整测试脚本，看看哪一步出了问题！
