# 分页滚动系统

## 分页滚动实现

### 大屏分页滚动
在大屏幕（≥1024px）上实现鼠标滚轮拦截，超过阈值后一次性滚动到下一锚点。

### 滚动阈值控制
```javascript
const THRESHOLD = Math.max(220, Math.floor(window.innerHeight * 0.25)); // 至少220px或视口25%
```

### 锚点系统
- **锚点收集**: 收集页面中所有可滚动到的锚点元素
- **位置计算**: 计算每个锚点相对于页面顶部的位置
- **滚动目标**: 根据滚动方向确定下一个目标锚点

## 滚动动画

### GSAP 滚动动画
```javascript
gsap.to(window, {
  duration: 1.1,
  ease: 'power2.inOut',
  scrollTo: { y: positions[idx], autoKill: true },
  onStart: () => {
    // 开始滚动时的处理
  },
  onUpdate: function () {
    // 滚动过程中的更新
    if (!enterTriggered && this.progress() >= 0.5) {
      // 中点触发入场动画
    }
  },
  onComplete: () => {
    // 滚动完成后的处理
  }
});
```

## 小屏回退方案

### Snap 功能
在小屏幕（<1024px）上使用 ScrollTrigger 的 Snap 功能作为回退方案。

```javascript
snapTrigger = ScrollTrigger.create({
  start: 0,
  end: () => document.documentElement.scrollHeight - window.innerHeight,
  snap: (value) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (!clamped || clamped.length === 0) return value; // 安全兜底
    const y = value * max; // GSAP 传入的是进度(0-1)，需映射到像素
    const nearest = clamped.reduce((prev, curr) => {
      return Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev;
    }, clamped[0]);
    return nearest / max;
  },
  onRefresh: () => {
    // 刷新时更新锚点位置
  }
});
```

## 滚动检测与响应

### 当前段落检测
- **视口检测**: 通过视口检测获取当前应显示的段索引
- **位置比较**: 比较各段落在视口中可见高度和中心距离

### 累积滚动处理
- 使用 `deltaYAcc` 累积滚轮事件的 deltaY
- 设置 250ms 超时重置累积量，避免误触发
- 达到阈值后执行分页滚动

## 性能优化

### 事件管理
- 在 window 和 document 同步监听滚轮事件
- 确保各浏览器场景均可拦截滚轮
- 防止默认滚动行为，实现自定义分页滚动

### 响应式控制
- 根据窗口大小动态切换分页滚动和 Snap 方案
- 窗口大小变化时重建滚动系统
- 避免滚动系统冲突

## 初始状态处理

### 首次渲染初始化
- 使用 `attemptInitialReveal` 确保首次渲染时正确显示当前段落
- 多次尝试获取组件引用，最多 10 次，间隔 80ms
- 确保子组件初始 `gsap.set` 后触发当前段落进场

### 段落进场控制
- 滚动完成后统一触发进场/退场动画
- Hero 区域不参与退场动画
- 延迟触发确保动画同步