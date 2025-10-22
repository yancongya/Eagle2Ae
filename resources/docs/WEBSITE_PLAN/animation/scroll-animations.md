# 滚动动画系统

## 滚动触发动画

### ScrollTrigger 插件
GSAP 的 ScrollTrigger 插件用于创建滚动触发动画，允许在滚动到特定位置时触发动画效果。

### 基本配置
```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 基本用法
gsap.to(element, {
  scrollTrigger: {
    trigger: element,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse'
  },
  opacity: 1,
  y: 0,
  duration: 1
});
```

## 滚动进度动画

### 进度控制
- **scrub**: 平滑同步滚动与动画
- **pin**: 固定元素直到触发器结束
- **pinSpacing**: 控制固定元素是否影响布局

### 滚动性能
- **性能优化**: 使用 transform 和 opacity 属性
- **防抖处理**: 滚动事件的防抖和节流
- **元素复用**: 避免频繁创建动画实例

## 滚动导航动画

### 导航高亮
- **滚动检测**: 检测当前滚动位置对应的内容区域
- **视觉反馈**: 为当前区域的导航项添加高亮状态
- **平滑过渡**: 导航状态切换的平滑过渡

## 自定义滚动行为

### 滚动控制
- **自定义滚动**: 实现自定义滚动行为
- **滚动锁定**: 在特定情况下锁定滚动
- **滚动同步**: 多个元素的滚动同步

## 与分页滚动的协调

### 滚动系统协调
- **冲突避免**: 避免不同滚动系统间的冲突
- **优先级管理**: 管理不同滚动行为的优先级
- **状态同步**: 同步不同的滚动状态