# 页面过渡动画 (View Transitions API)

## API 概述

View Transitions API 是一个现代浏览器 API，用于创建页面间或元素间的平滑过渡动画。它允许开发者在 DOM 状态变化时创建视觉上连贯的转场效果，而无需复杂的动画代码。

## 在 eagle2ae_web 中的实现

### 1. 路由级别过渡

在 `src/router/index.js` 中实现了全局页面过渡：

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

let vtNavigating = false

router.beforeEach((to, from, next) => {
  // 检查浏览器支持和用户偏好
  const supported = typeof document !== 'undefined' && 'startViewTransition' in document;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!supported || reducedMotion || vtNavigating) return next();
  
  vtNavigating = true;
  
  // 启动视图过渡
  document.startViewTransition(() => {
    next(); // 导航到新页面
  }).finished.finally(() => {
    vtNavigating = false; // 过渡完成后重置状态
  });
});
```

### 2. CSS 样式配合

View Transitions API 会自动生成 CSS 变换，但也需要适当的样式支持：

```css
/* Vue 组件中可能需要的样式 */
::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

/* 自定义过渡动画 */
::view-transition-image-pair(root) {
  isolation: isolate;
}

::view-transition-group(root) {
  animation: none;
}
```

## API 工作原理

### 1. 基本流程
```javascript
// 传统方式
element.style.opacity = '0';
await new Promise(resolve => setTimeout(resolve, 300));
element.remove();

// View Transitions API 方式
document.startViewTransition(() => {
  element.style.opacity = '0';
  element.remove();
});
```

### 2. 状态变化处理
API 会自动：
- 记录过渡前的 DOM 状态
- 执行 DOM 变化
- 创建从旧状态到新状态的视觉过渡
- 清理过渡相关的 DOM 元素

## 在 eagle2ae_web 中的具体应用

### 1. 页面切换动画
- 从首页到预览页的平滑过渡
- 下载页面的进入动画
- 所有路由切换的统一过渡效果

### 2. 组件状态变化
虽然主要在路由层面使用，但 API 也可用于：
- 模态框的显示/隐藏
- 选项卡切换
- 列表项的添加/删除

## 与 GSAP 动画的协作

View Transitions API 与项目中使用的 GSAP 动画系统是互补的：

- **View Transitions**: 处理页面级和布局级的过渡
- **GSAP**: 处理元素级和交互级的精细动画

```javascript
// 两者可以协调使用
const navigateWithAnimation = (path) => {
  // 如果支持 View Transitions，则使用它处理页面过渡
  if ('startViewTransition' in document) {
    document.startViewTransition(() => {
      router.push(path);
    });
  } else {
    // 降级到普通导航
    router.push(path);
  }
};
```

## 浏览器兼容性

### 支持情况
- Chrome 111+
- Edge 111+
- Firefox: 实验性支持
- Safari: 不支持

### 检测和降级
```javascript
const supportsViewTransitions = 'startViewTransition' in document;

if (supportsViewTransitions) {
  // 使用 View Transitions API
  document.startViewTransition(() => {
    // DOM 操作
  });
} else {
  // 降级到传统动画或直接 DOM 操作
  // 可能使用 GSAP 或 CSS 过渡
}
```

## 用户偏好考虑

### 减少动画偏好
```javascript
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// 在路由守卫中检查用户偏好
router.beforeEach((to, from, next) => {
  const supportsVT = 'startViewTransition' in document;
  const prefersReducedMotion = reducedMotion.matches;
  
  if (!supportsVT || prefersReducedMotion) {
    // 不使用 View Transitions
    return next();
  }
  
  // 使用 View Transitions
  document.startViewTransition(() => next());
});
```

## 性能优化

### 1. 避免并发过渡
使用 `vtNavigating` 标志防止过渡并发：

```javascript
let vtNavigating = false;

router.beforeEach((to, from, next) => {
  if (vtNavigating) {
    return next(false); // 取消导航
  }
  
  vtNavigating = true;
  document.startViewTransition(() => {
    next();
  }).finally(() => {
    vtNavigating = false;
  });
});
```

### 2. 合理的动画时长
View Transitions API 会自动计算合理的过渡时长，通常无需手动设置。

## 与项目其他动画的协调

### 1. 与 GSAP 动画的时序同步
- View Transitions 处理大范围布局变化
- GSAP 处理组件内部元素动画
- 两种动画不冲突，可以同时运行

### 2. 与滚动动画的配合
- 页面切换时可能需要重置滚动位置
- 与 ScrollTrigger 插件协调运行

## 未来发展方向

### 1. 高级特性
- 自定义过渡类型
- 部分元素排除过渡
- 过渡动画的细粒度控制

### 2. 与现有动画系统整合
- 更智能的动画协调机制
- 统一的动画时序管理
- 性能监控和优化

## 最佳实践

### 1. 优雅降级
始终检查浏览器支持和用户偏好，提供合适的降级方案。

### 2. 性能监控
监控 View Transitions 的性能影响，特别是在低端设备上。

### 3. 用户体验
确保过渡动画增强而非阻碍用户体验，遵循用户期望的交互模式。

View Transitions API 为 eagle2ae_web 提供了现代化的页面切换体验，与项目中已有的 GSAP 动画系统形成良好的互补，共同创造了流畅的用户界面体验。