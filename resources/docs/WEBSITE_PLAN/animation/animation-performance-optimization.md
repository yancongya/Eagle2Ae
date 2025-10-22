# 动画性能优化

## 性能优化原则

### 1. 关键性能指标
- **FPS (Frames Per Second)**: 目标保持在 60 FPS
- **Jank**: 最小化动画卡顿
- **内存使用**: 避免内存泄漏
- **CPU 使用率**: 优化计算密集型操作

## CSS 层次优化

### 1. 合成属性动画
```javascript
// 推荐 - 使用 transform 和 opacity (合成属性)
gsap.to(element, {
  x: 100,        // transform: translateX(100px)
  y: 50,         // transform: translateY(50px)  
  rotation: 45,  // transform: rotate(45deg)
  scale: 1.2,    // transform: scale(1.2)
  opacity: 0.8,  // 不会触发布局重排
  duration: 1
});

// 避免 - 使用可能触发布局的属性
gsap.to(element, {
  left: 100,     // 会触发布局重排
  top: 50,       // 会触发布局重排
  width: 200,    // 会触发布局重排
  height: 100,   // 会触发布局重排
  duration: 1
});
```

### 2. will-change 属性
```css
/* 提示浏览器优化动画元素 */
.animated-element {
  will-change: transform, opacity;
}

/* 动画结束后移除 will-change */
.animated-element.inactive {
  will-change: auto;
}
```

## GSAP 性能优化

### 1. 动画实例管理
```javascript
// 在组件卸载时清理动画
import { onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

onUnmounted(() => {
  // 清理所有 ScrollTrigger 实例
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  
  // 清理 GSAP 时间轴
  gsap.globalTimeline.clear();
  
  // 杀死特定元素的动画
  gsap.killTweensOf('.animated-elements');
});
```

### 2. 动画配置优化
```javascript
// 全局配置优化
gsap.config({
  force3D: true,           // 强制使用3D加速
  nullTargetWarn: false,   // 防止未找到元素的警告
  autoSleep: 60,           // 非活动动画自动休眠
  lazy: true               // 懒加载更新
});

// 针对性优化
gsap.set(element, {
  force3D: true,           // 单个动画强制3D
  immediateRender: false   // 延迟立即渲染
});
```

## 滚动性能优化

### 1. 滚动事件节流
```javascript
// 避免频繁的滚动事件处理
let ticking = false;

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      // 执行滚动相关的动画逻辑
      updateScrollAnimations();
      ticking = false;
    });
    ticking = true;
  }
};

// 与 ScrollTrigger 协调
ScrollTrigger.addEventListener('refresh', () => {
  // 优化滚动触发器
});
```

### 2. ScrollTrigger 优化
```javascript
// 滚动触发器性能优化
const createOptimizedTrigger = (element, animation) => {
  return ScrollTrigger.create({
    trigger: element,
    start: 'top 80%',
    end: 'bottom 20%',
    // 仅在需要时创建动画
    animation: animation,
    // 优化 scrub 效果
    scrub: 1,
    // 更新频率控制
    refreshPriority: -999
  });
};
```

## 组件级优化

### 1. 条件动画
```javascript
// 根据条件决定是否执行动画
const shouldAnimate = computed(() => {
  return !props.disableAnimations && 
         !userPrefersReducedMotion.value &&
         isElementVisible.value;
});

const animateElement = () => {
  if (shouldAnimate.value) {
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.8
    });
  } else {
    // 直接应用最终状态，跳过动画
    element.style.opacity = '1';
    element.style.transform = 'translateY(0px)';
  }
};
```

### 2. 虚拟化动画
```javascript
// 只为可见元素创建动画
const createAnimationForVisibleItems = () => {
  const visibleElements = document.querySelectorAll('.visible-element');
  
  visibleElements.forEach((el, index) => {
    gsap.fromTo(el,
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true  // 只执行一次
        }
      }
    );
  });
};
```

## 内存管理

### 1. 动画清理
```javascript
// 创建可清理的动画
const animationController = {
  timeline: null,
  trigger: null,
  
  init() {
    this.timeline = gsap.timeline();
    this.trigger = ScrollTrigger.create({
      trigger: '.trigger-element',
      animation: this.timeline
    });
  },
  
  destroy() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    if (this.trigger) {
      this.trigger.kill();
      this.trigger = null;
    }
  }
};
```

### 2. 事件监听器管理
```javascript
// 管理自定义事件监听器
const eventController = {
  listeners: [],
  
  addListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  },
  
  removeAll() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
  }
};
```

## 性能监控

### 1. FPS 监控
```javascript
// 监控动画性能
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;

const fpsMonitor = () => {
  frameCount++;
  const now = performance.now();
  
  if (now >= lastTime + 1000) {
    fps = Math.round((frameCount * 1000) / (now - lastTime));
    frameCount = 0;
    lastTime = now;
    
    console.log(`Current FPS: ${fps}`);
    
    // 如果 FPS 过低，可以采取措施
    if (fps < 30) {
      // 降低动画复杂度或暂停某些动画
      reduceAnimationQuality();
    }
  }
  
  requestAnimationFrame(fpsMonitor);
};
```

### 2. 性能分析工具
```javascript
// 性能分析辅助函数
const performanceTracker = {
  start: (name) => {
    performance.mark(`start-${name}`);
  },
  
  end: (name) => {
    performance.mark(`end-${name}`);
    performance.measure(name, `start-${name}`, `end-${name}`);
    
    const measure = performance.getEntriesByName(name)[0];
    console.log(`${name} took ${measure.duration} milliseconds`);
  }
};
```

## 用户偏好适配

### 1. 减少动画偏好
```javascript
// 检测用户动画偏好
const reducedMotionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const handleMotionPreferenceChange = (e) => {
  if (e.matches) {
    // 用户偏好减少动画，禁用复杂动画
    disableComplexAnimations();
  } else {
    // 启用完整动画
    enableAllAnimations();
  }
};

reducedMotionMediaQuery.addEventListener('change', handleMotionPreferenceChange);
```

### 2. 设备性能检测
```javascript
// 根据设备性能调整动画质量
const adjustAnimationQuality = () => {
  const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isLowEndDevice) {
    // 降低动画质量
    gsap.config({
      force3D: false,  // 在低性能设备上禁用3D加速
      autoSleep: 30,   // 更快的休眠时间
    });
  }
};
```

## 动画优化模式

### 1. 预渲染模式
```javascript
// 对于复杂动画，考虑预渲染
const precomputeAnimation = (element) => {
  // 预计算关键帧位置和属性
  const keyframes = [];
  
  for (let i = 0; i <= 100; i += 10) {
    const progress = i / 100;
    keyframes.push({
      progress,
      style: calculateStyleAtProgress(element, progress)
    });
  }
  
  return keyframes;
};
```

### 2. 分层动画
```javascript
// 将复杂动画分解为多个简单动画层
const createLayeredAnimation = (container) => {
  // 背景层动画
  gsap.to(container.querySelector('.background'), {
    x: 100,
    duration: 2,
    ease: 'power2.out'
  });
  
  // 前景层动画
  gsap.to(container.querySelector('.foreground'), {
    y: -50,
    rotation: 15,
    duration: 1.5,
    ease: 'back.out(1.7)'
  });
  
  // 装饰层动画
  gsap.to(container.querySelector('.decoration'), {
    scale: 1.2,
    opacity: 0.8,
    duration: 1,
    ease: 'elastic.out(1, 0.3)'
  });
};
```

## 最佳实践总结

1. **使用合成属性**: 优先使用 transform 和 opacity
2. **及时清理**: 在组件卸载时清理动画实例
3. **条件渲染**: 根据用户偏好和设备性能调整动画
4. **性能监控**: 持续监控动画性能指标
5. **优雅降级**: 为低性能设备提供简化版本
6. **内存管理**: 避免内存泄漏和过度动画

通过这些优化策略，eagle2ae_web 可以提供流畅的动画体验，同时保持良好的性能表现。