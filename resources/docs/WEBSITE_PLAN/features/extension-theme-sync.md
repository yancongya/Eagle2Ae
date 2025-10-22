# 扩展主题同步

## 功能概述

扩展主题同步功能允许网页预览中的主题模式与 AE 和 Eagle 扩展保持同步。当用户在预览页面切换明暗模式时，扩展也会相应地切换到匹配的主题模式。

## 技术实现

### 消息传递机制

使用 postMessage API 实现网页与 iframe 扩展之间的通信：

```javascript
// 在预览页面中发送主题变更消息
const sendThemeMessageToExtensions = (theme) => {
  const themeMessage = {
    type: 'THEME_CHANGE',
    theme: theme, // 'dark' 或 'light'
    timestamp: Date.now()
  };
  
  // 向所有相关的 iframe 发送消息
  const iframes = document.querySelectorAll('iframe.extension-preview');
  iframes.forEach(iframe => {
    iframe.contentWindow.postMessage(themeMessage, '*');
  });
};

// 在扩展中接收主题变更消息
window.addEventListener('message', (event) => {
  if (event.data.type === 'THEME_CHANGE') {
    applyThemeToExtension(event.data.theme);
  }
});
```

### 主题应用

在扩展端应用接收到的主题：

```javascript
const applyThemeToExtension = (theme) => {
  // 根据主题应用相应的样式
  document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  updateExtensionColors(theme);
};
```

## 用户体验改进

### 从简单反相到真实主题

- **之前**: 扩展界面仅通过简单反相来模拟主题切换
- **现在**: 扩展激活真实的主题模式，应用预设的主题颜色和样式

### 固定主题功能

用户现在可以：

- 选择特定的主题配置并固定
- 确保扩展在特定主题下的一致表现
- 预览扩展在不同主题下的实际效果

## 实现细节

### 主题消息格式

```json
{
  "type": "THEME_CHANGE",
  "theme": "dark|light",
  "timestamp": 1234567890,
  "source": "preview-page"
}
```

### 扩展端处理流程

1. **接收消息**: 扩展端监听来自父页面的消息
2. **主题验证**: 验证主题值的有效性
3. **应用主题**: 根据主题类型应用相应的样式
4. **反馈确认**: 可选地向父页面发送确认消息

### 预览页面流程

1. **主题切换**: 用户操作触发主题切换
2. **状态更新**: 更新页面主题状态
3. **消息广播**: 向所有相关的扩展 iframe 发送主题消息
4. **状态维护**: 保持主题选择的持久性

## 使用场景

### 1. 扩展主题测试

开发者可以：

- 测试扩展在不同主题下的视觉效果
- 验证主题切换的响应速度
- 确保 UI 元素在所有主题下都保持良好的可读性

### 2. 用户体验展示

用户可以：

- 预览扩展在自己偏好的主题下的外观
- 体验扩展现有的主题切换功能
- 查看扩展在不同主题模式下的真实表现

## 技术考虑

### 安全性

- **消息验证**: 验证来自父页面的消息
- **域检查**: 可选地验证消息来源的域名
- **内容安全**: 遵循内容安全策略

### 性能

- **消息频率**: 限制主题切换消息的频率
- **批处理**: 批量处理多个 iframe 的主题更新
- **资源管理**: 及时清理消息监听器以防止内存泄漏

## 维护指南

### 扩展兼容性

- 确保扩展正确实现消息监听
- 处理 iframe 加载完成前的主题消息
- 提供默认主题以防消息处理失败

### 调试

- 使用浏览器开发者工具检查消息传递
- 添加主题切换的日志记录
- 验证跨域通信的正确性