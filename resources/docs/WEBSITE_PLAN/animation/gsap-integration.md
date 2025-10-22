# 动画系统集成

## GSAP 集成架构

### 核心插件

#### 1. GSAP Core
- **功能**: 基础动画引擎
- **用途**: 创建时间轴、基础动画、补间动画
- **性能**: 高性能，使用 requestAnimationFrame

#### 2. ScrollTrigger
- **功能**: 滚动触发动画
- **用途**: 滚动时触发动画、视差效果、滚动进度控制
- **特性**: 灵活的触发条件、可控制动画进度

#### 3. ScrollToPlugin
- **功能**: 平滑滚动控制
- **用途**: 滚动到特定元素或位置
- **特性**: 可自定义滚动时长、缓动效果

#### 4. CustomEase
- **功能**: 自定义缓动函数
- **用途**: 创建独特的动画缓动效果
- **特性**: 可视化编辑缓动曲线

### 动画类型分类

#### 1. 页面过渡动画
```javascript
// 在 router/index.js 中实现页面过渡
router.beforeEach((to, from, next) => {
  const supported = typeof document !== 'undefined' && 'startViewTransition' in document;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!supported || reducedMotion || vtNavigating) return next();
  vtNavigating = true;
  document.startViewTransition(() => {
    next();
  }).finished.finally(() => {
    vtNavigating = false;
  });
});
```

#### 2. 滚动触发动画
```javascript
// 在 FeatureDetail.vue 中使用
gsap.from(element, {
  scrollTrigger: {
    trigger: element,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse'
  },
  opacity: 0,
  x: isImageLeft ? -50 : 50,
  duration: 1,
  ease: 'power2.out'
});
```

#### 3. 交互动画
- 卡片悬停效果
- 拖拽操作反馈
- 按钮点击效果

#### 4. 物理动画
- DragToTop 组件中的重力效果
- 碰撞检测和反弹效果

## 动画性能优化

### 1. 使用 transform 和 opacity
```javascript
// 推荐 - 使用 transform 和 opacity (合成属性)
gsap.to(element, {
  x: 100,        // transform: translateX(100px)
  opacity: 0.5,  // 不会触发布局重排
  duration: 1
});

// 避免 - 使用 left, top 等属性 (可能导致重排)
gsap.to(element, {
  left: 100,     // 会触发布局重排
  duration: 1
});
```

### 2. 动画实例管理
```javascript
// 在组件卸载时清理动画
onUnmounted(() => {
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  gsap.globalTimeline.clear();
});
```

### 3. 防抖处理
```javascript
// 滚动和窗口调整大小事件的防抖
let scrollTimer;
const handleScroll = () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    // 执行滚动相关逻辑
  }, 10);
};
```

## 动画时序管理

### 1. 时间轴控制
```javascript
// 创建复杂的动画序列
const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
tl.from('.element1', { opacity: 0, y: 50 })
  .from('.element2', { opacity: 0, y: 50 }, '-=0.5') // 重叠前一个动画
  .to('.element3', { rotation: 360 }, '+=1'); // 延迟1秒后执行
```

### 2. 滚动进度同步
```javascript
// 同步动画进度与滚动位置
ScrollTrigger.create({
  trigger: '.trigger-element',
  start: 'top center',
  end: 'bottom center',
  scrub: true,  // 平滑同步滚动与动画
  pin: true,    // 固定元素
  animation: gsap.to('.animated-element', {
    x: 100,
    rotation: 360
  })
});
```

## 具体动画实现

### 1. Hero 卡片进场动画

#### 进场序列
- 卡片按顺序延迟进入
- 使用淡入和缩放效果
- 不使用旋转效果（根据需求）

#### 实现代码
```javascript
// Hero.vue 中的卡片动画
const animateCards = () => {
  const cards = document.querySelectorAll('.feature-card');
  gsap.fromTo(cards, 
    { opacity: 0, scale: 0.8, y: 30 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'back.out(1.7)'
    }
  );
};
```

### 2. FeatureDetail 滚动触发动画

#### 交错布局动画
- 左侧内容从左滑入
- 右侧内容从右滑入
- 图片和文字分层动画

#### 实现代码
```javascript
// FeatureDetail.vue 中的滚动触发
onMounted(() => {
  const contentEl = contentRef.value;
  const imageEl = imageRef.value;
  
  ScrollTrigger.create({
    trigger: contentEl,
    start: 'top 80%',
    onEnter: () => {
      // 内容进入动画
      gsap.fromTo(contentEl,
        { opacity: 0, x: isImageLeft.value ? -50 : 50 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
      );
      
      // 图片进入动画
      gsap.fromTo(imageEl,
        { opacity: 0, x: isImageLeft.value ? 50 : -50 },
        { opacity: 1, x: 0, duration: 1, ease: 'power2.out', delay: 0.2 }
      );
    }
  });
});
```

### 3. DragToTop 物理效果动画

#### 2D 物理引擎
- Matter-js 用于实现物理效果
- 重力、碰撞、弹跳效果
- Logo 随拖拽方向旋转

#### 实现代码
```javascript
// DragToTop.vue 中的物理效果
import Matter from 'matter-js';

// 创建物理世界
const engine = Matter.Engine.create();
const world = engine.world;

// 添加重力效果
world.gravity.y = baseGravityY;

// 应用重力变化
const applyGravityEffect = (up, down) => {
  // 向上拖拽时减少重力
  gsap.to(world.gravity, { 
    y: Math.min(baseGravityY * (up.gravityFactor ?? 1.45), (up.gravityMax ?? 2.0)), 
    duration: (up.durationMs ?? 200) / 1000, 
    overwrite: true 
  });
  
  // 拖拽结束后恢复重力
  gsap.to(world.gravity, { 
    y: baseGravityY, 
    duration: (up.restoreDurationMs ?? 800) / 1000, 
    delay: (up.restoreDelayMs ?? 50) / 1000, 
    ease: 'power1.out', 
    overwrite: true 
  });
};
```

## 动画配置管理

### 1. 全局动画设置
```javascript
// 在 main.js 中设置全局动画配置
gsap.config({
  nullTargetWarn: false,  // 防止未找到元素的警告
  force3D: true,          // 强制使用3D加速
});
```

### 2. 动画常量定义
```javascript
// 定义动画常量
export const ANIMATION_CONFIG = {
  DURATION: {
    SHORT: 0.3,
    MEDIUM: 0.6,
    LONG: 1.0
  },
  EASE: {
    DEFAULT: 'power2.out',
    BOUNCE: 'bounce.out',
    ELASTIC: 'elastic.out(1, 0.3)'
  },
  STAGGER: {
    CARD: 0.15,
    SECTION: 0.3
  }
};
```

## 动画调试工具

### 1. GSAP DevTools
- 使用 GSAP DevTools 进行动画调试
- 可视化时间轴
- 实时调整动画参数

### 2. 性能监控
```javascript
// 启用 GSAP 性能监控
gsap.ticker.add(() => {
  // 性能指标监控
  if (performance.now() % 1000 < 16.67) { // 每秒约60次
    console.log('FPS:', gsap.ticker.fps());
  }
});
```

## 动画可访问性

### 1. 减少动画偏好
```javascript
// 检查用户是否偏好减少动画
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) {
  gsap.globalTimeline.clear(); // 清除所有动画
}
```

### 2. 动画暂停与控制
- 提供动画控制选项
- 在必要时暂停动画
- 遵循 WCAG 动画指导原则

## 动画扩展性

### 1. 可配置动画
```javascript
// 创建可配置的动画函数
const createConfigurableAnimation = (element, config = {}) => {
  const defaultConfig = {
    duration: 1,
    ease: 'power2.out',
    delay: 0
  };
  
  return gsap.to(element, { ...defaultConfig, ...config });
};
```

### 2. 动画库封装
```javascript
// 创建项目特定的动画库
export const eagle2aeAnimations = {
  cardHover: (element) => gsap.to(element, { scale: 1.05, y: -5, duration: 0.3 }),
  cardLeave: (element) => gsap.to(element, { scale: 1, y: 0, duration: 0.3 }),
  fadeInUp: (element, index = 0) => gsap.fromTo(element,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8, delay: index * 0.1 }
  )
};
```