# 面板切换器调试指南

## 🔍 问题描述

点击面板切换按钮（1、2、3）没有反应，控制台也不报错。

## 🧪 调试步骤

### 步骤 1: 检查按钮是否渲染

1. 打开扩展
2. 按 F12 打开开发者工具
3. 在 Elements 标签中查找：
```html
<div class="panel-switcher">
    <button class="panel-switch-btn" data-panel="panel1">1</button>
    <button class="panel-switch-btn" data-panel="panel2">2</button>
    <button class="panel-switch-btn" data-panel="panel3">3</button>
</div>
```

**预期结果**：应该能看到 3 个按钮

### 步骤 2: 检查控制台日志

在控制台中查找以下日志：

```
[Init] 检查 PanelConfigManager 类: function
[Init] PanelConfigManager 类已加载
[Init] panelConfigManager 实例已创建
[Init] 当前面板 ID: panel1
[Config Manager] Node.js 模块初始化成功
[Panel Switcher] 开始初始化...
[Panel Switcher] 找到 3 个按钮
[Panel Switcher] 当前面板编号: 1
[Panel Switcher] panelConfigManager 可用: true
[Panel Switcher] 初始化按钮 1: panel1
[Panel Switcher] 初始化按钮 2: panel2
[Panel Switcher] 初始化按钮 3: panel3
[Panel Switcher] 面板切换器初始化完成，当前面板: 1
```

### 步骤 3: 手动测试按钮点击

在控制台中执行：

```javascript
// 测试按钮是否存在
document.querySelectorAll('.panel-switch-btn').length
// 应该返回 3

// 测试按钮点击
document.querySelector('.panel-switch-btn[data-panel="panel2"]').click()
// 应该在控制台看到：[Panel Switcher] ========== 按钮被点击 ==========
```

### 步骤 4: 检查 PanelConfigManager 是否加载

在控制台中执行：

```javascript
// 检查类是否定义
typeof PanelConfigManager
// 应该返回 "function"

// 检查实例是否创建
typeof window.panelConfigManager
// 应该返回 "object"

// 检查实例方法
typeof window.panelConfigManager.switchToPanel
// 应该返回 "function"
```

### 步骤 5: 检查事件监听器

在 Elements 标签中：
1. 选中一个按钮元素
2. 在右侧面板找到 "Event Listeners" 标签
3. 展开 "click" 事件
4. 应该能看到一个监听器

## 🐛 可能的问题

### 问题 1: PanelConfigManager 未加载

**症状**：
```
[Init] PanelConfigManager 类未定义！
```

**解决方案**：
检查 `index.html` 中是否正确引入：
```html
<script src="js/utils/PanelConfigManager.js"></script>
<script src="js/main.js"></script>
```

### 问题 2: 按钮未渲染

**症状**：
```
[Panel Switcher] 找到 0 个按钮
```

**解决方案**：
检查 HTML 中是否有面板切换器：
```html
<div class="panel-switcher">
    <button class="panel-switch-btn" data-panel="panel1">1</button>
    <button class="panel-switch-btn" data-panel="panel2">2</button>
    <button class="panel-switch-btn" data-panel="panel3">3</button>
</div>
```

### 问题 3: 事件监听器未绑定

**症状**：点击按钮没有任何日志输出

**可能原因**：
1. `initPanelSwitcher()` 在按钮渲染之前执行
2. 事件监听器被其他代码移除
3. 按钮被 CSS 遮挡（z-index 问题）

**解决方案**：
在 `initPanelSwitcher()` 中添加延迟：
```javascript
setTimeout(() => {
    initPanelSwitcher();
}, 100);
```

### 问题 4: CSS 遮挡

**症状**：按钮可见但无法点击

**解决方案**：
检查按钮的 z-index 和 pointer-events：
```css
.panel-switcher {
    z-index: 1001;
    pointer-events: auto;
}

.panel-switch-btn {
    pointer-events: auto;
    cursor: pointer;
}
```

## 🔧 快速修复

如果上述步骤都没有问题，尝试以下快速修复：

### 修复 1: 添加延迟初始化

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // ... 其他初始化代码
    
    // 延迟初始化面板切换器
    setTimeout(() => {
        console.log('[Init] 延迟初始化面板切换器');
        initPanelSwitcher();
    }, 500);
});
```

### 修复 2: 使用事件委托

```javascript
// 在 document 上监听点击事件
document.addEventListener('click', async (event) => {
    const btn = event.target.closest('.panel-switch-btn');
    if (btn) {
        console.log('[Panel Switcher] 按钮被点击（事件委托）');
        const targetPanel = btn.dataset.panel;
        
        if (window.panelConfigManager) {
            await window.panelConfigManager.switchToPanel(targetPanel);
        }
    }
});
```

### 修复 3: 直接在 HTML 中添加 onclick

```html
<button class="panel-switch-btn" 
        data-panel="panel1" 
        onclick="handlePanelSwitch('panel1')">1</button>
```

```javascript
// 在 main.js 中添加全局函数
window.handlePanelSwitch = async function(panelId) {
    console.log('[Panel Switch] 切换到:', panelId);
    if (window.panelConfigManager) {
        await window.panelConfigManager.switchToPanel(panelId);
    }
};
```

## 📝 调试清单

- [ ] 按钮是否渲染？
- [ ] PanelConfigManager 是否加载？
- [ ] initPanelSwitcher 是否执行？
- [ ] 找到了几个按钮？
- [ ] 事件监听器是否绑定？
- [ ] 点击按钮是否有日志？
- [ ] panelConfigManager 是否可用？
- [ ] switchToPanel 方法是否执行？

## 🎯 下一步

根据调试结果，我可以帮你：
1. 修复具体的问题
2. 添加更多调试日志
3. 尝试其他实现方案
4. 简化代码逻辑

请告诉我你在控制台看到了什么日志！
