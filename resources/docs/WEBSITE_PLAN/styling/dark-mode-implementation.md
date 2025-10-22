# 深色模式实现

## 深色模式架构

### VueUse 集成
使用 `@vueuse/core` 的 `useDark` 函数实现深色模式：

```javascript
import { useDark, useToggle } from '@vueuse/core'

// 初始化深色模式
const isDark = useDark({
  storageKey: 'theme',
  initialValue: 'dark'  // 默认为深色模式
})

// 切换主题
const toggleDark = useToggle(isDark)
```

### 扩展主题同步
新增功能使预览页面的深色模式切换能够同步到 AE 和 Eagle 扩展：

```javascript
// 监听主题变化并通知扩展
watch(isDark, (newVal) => {
  // 通知 iframe 中的扩展关于主题变化
  notifyExtensionsOfThemeChange(newVal)
  
  // 发送消息到扩展
  const themeMessage = {
    type: 'THEME_CHANGE',
    theme: newVal ? 'dark' : 'light',
    timestamp: Date.now()
  }
  
  // 向所有相关的 iframe 发送消息
  sendThemeMessageToExtensions(themeMessage)
})
```

## CSS 实现

### Tailwind 暗色模式
```css
/* 使用 class 策略实现暗色模式 */
@config "tailwind.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 确保暗色模式类应用于正确的元素 */
.dark {
  color-scheme: dark;
}
```

### 自定义 CSS 变量
```css
:root {
  --color-primary: #6366f1;
  --color-background: #ffffff;
  --color-text: #1f2937;
}

.dark {
  --color-primary: #818cf8;
  --color-background: #1f2937;
  --color-text: #f9fafb;
}
```

## 组件级实现

### 主题切换组件
- **ThemeSwitcher**: 主题切换 UI 组件
- **状态管理**: 使用响应式数据管理主题状态
- **存储管理**: 使用 localStorage 保存用户偏好

## 颜色策略

### 颜色系统
- **系统颜色**: 使用 Tailwind 的内置颜色系统
- **自定义颜色**: 针对深色模式的特殊颜色调整
- **对比度**: 确保足够的对比度以符合无障碍标准

## 性能优化

### 切换性能
- **快速切换**: 瞬时主题切换，无闪烁
- **缓存策略**: 有效缓存主题相关资源
- **渲染优化**: 最小化重渲染

## 可访问性

### 无障碍考虑
- **高对比度**: 确保文本和背景的适当对比度
- **语义化**: 使用适当的 ARIA 属性
- **用户偏好**: 尊重用户的系统级深色模式偏好

## 用户体验

### 一致性
- **全局一致性**: 所有组件都支持深色模式
- **平滑过渡**: 主题切换时的平滑动画
- **状态记忆**: 记住用户的主题选择