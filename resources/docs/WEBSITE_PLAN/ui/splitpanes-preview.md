# Splitpanes 多窗格预览系统

## 功能概述

Splitpanes 组件实现了高级的多窗格预览功能，允许用户在一个页面上同时查看多个扩展示例。该系统支持响应式布局，在移动设备和桌面设备上提供不同的预览体验。

## 布局设计

### 移动端适配
- **单窗格模式**: 移动设备上显示单个预览窗格
- **全屏预览**: 单个 iframe 占据整个屏幕空间
- **简化交互**: 避免复杂的窗格调整操作

### 桌面端增强
- **三窗格布局**: 左面设备上显示三个并列的预览窗格
  - **主窗格**: 左侧占据 70% 的空间，显示主要预览
  - **辅助窗格**: 右侧 30% 的空间垂直分割为两个小窗格
- **可调整大小**: 用户可以通过拖拽分割线调整窗格大小
- **嵌套布局**: 使用水平和垂直分割创建复杂的布局结构

## 实现技术

### Splitpanes 集成
```vue
<splitpanes class="default-theme" style="height: 100%">
  <!-- 左侧主窗格 -->
  <pane :size="70">
    <iframe src="/extensions/ae/index.html" class="w-full h-full border-0"></iframe>
  </pane>

  <!-- 右侧窗格容器 -->
  <pane :size="30">
    <splitpanes horizontal>
      <!-- 右上窗格 -->
      <pane :size="50">
        <iframe src="/extensions/ae/index.html" class="w-full h-full border-0"></iframe>
      </pane>
      <!-- 右下窗格 -->
      <pane :size="50">
        <iframe src="/extensions/ae/index.html" class="w-full h-full border-0"></iframe>
      </pane>
    </splitpanes>
  </pane>
</splitpanes>
```

### 响应式控制
- **CSS 媒体查询**: 使用 `md:` 前缀控制桌面/移动布局
- **条件渲染**: 桌面端隐藏单窗格，移动端隐藏多窗格
- **高度管理**: 确保预览区域占据完整的视口高度

## 主题同步机制

### 深色/亮色模式适配
预览页面实现了与全局主题同步的机制：

```javascript
// 监听主题变化
watch(isDark, () => {
  applyIframeTheme();
});

// 应用主题到 iframe
const applyIframeTheme = () => {
  const iframes = root.querySelectorAll('iframe');
  if (isDark.value) {
    iframes.forEach((f) => removeLightThemeFromIframe(f));
  } else {
    iframes.forEach((f) => injectLightThemeIntoIframe(f));
  }
};
```

### iframe 主题管理
- **注入机制**: 动态向 iframe 注入亮色主题 CSS
- **移除机制**: 从 iframe 移除亮色主题，恢复暗色模式
- **错误处理**: 妥善处理跨域 iframe 的访问限制
- **生命周期**: iframe 重载时重新应用主题

### 主题注入实现
`injectLightThemeIntoIframe` 函数实现了完整的亮色主题注入：

- **CSS 规则**: 注入覆盖性的亮色主题 CSS
- **类名管理**: 添加/移除主题相关的 CSS 类
- **细粒度控制**: 针对不同 UI 元素的专门样式规则
- **安全检查**: 验证 iframe 文档的可访问性

## 性能优化

### 渲染优化
- **虚拟化**: 避免不必要的 iframe 重绘
- **懒加载**: 按需加载和初始化窗格
- **内存管理**: 组件卸载时清理事件监听器

### 事件管理
- **清理函数**: 维护 iframe 事件监听器的清理函数数组
- **生命周期**: 在 `onBeforeUnmount` 中清理所有事件监听器
- **错误处理**: 捕获并静默处理清理过程中的错误

## 动画效果

### 页面过渡
- **入场动画**: 页面加载时的淡入和垂直滑动效果
- **GSAP 集成**: 使用 GSAP 实现流畅的动画效果
- **缓动函数**: 使用 `power2.out` 缓动函数

```javascript
onMounted(() => {
  gsap.set(pageRef.value, { opacity: 0, y: 12 });
  gsap.to(pageRef.value, { 
    opacity: 1, 
    y: 0, 
    duration: 0.45, 
    ease: 'power2.out' 
  });
});
```

### View Transition 支持
- **过渡名称**: 设置 `view-transition-name` 属性
- **兼容性**: 检查浏览器对 View Transition API 的支持
- **降级**: 不支持时使用传统的 CSS 过渡

## 使用场景

### AE 预览页面
- **多角度预览**: 同时显示扩展的多个界面状态
- **布局对比**: 比较不同布局下的扩展外观
- **功能演示**: 展示扩展在不同场景下的功能

### Eagle 预览页面
- **界面一致性**: 确保界面在不同窗格中的一致性
- **交互测试**: 测试扩展在不同尺寸下的交互效果
- **主题验证**: 验证主题模式在所有预览中的正确应用

## 配置与自定义

### Splitpanes 配置
- **默认主题**: 使用 `default-theme` 类应用默认样式
- **窗格大小**: 通过 `size` 属性控制窗格初始大小比例
- **分割线**: 支持拖拽调整窗格大小
- **嵌套布局**: 支持水平和垂直布局的嵌套

### 响应式配置
- **断点设置**: 使用 Tailwind 的 `md` 断点控制布局切换
- **高度管理**: 确保预览区域在不同设备上占用适当空间
- **边框处理**: 移除 iframe 的默认边框以获得更好的视觉效果

## 最佳实践

### 性能考虑
- **最小化 iframe**: 避免过多的 iframe 实例
- **缓存策略**: 合理配置 iframe 内容的缓存
- **资源管理**: 及时清理不再需要的事件监听器

### 用户体验
- **直观操作**: 提供清晰的窗格调整提示
- **响应速度**: 确保窗格调整的流畅响应
- **视觉反馈**: 提供窗格调整的视觉反馈

### 维护考虑
- **模块化**: 将预览功能模块化以便于维护
- **文档完整**: 记录所有配置选项和 API
- **错误处理**: 提供全面的错误处理和降级策略