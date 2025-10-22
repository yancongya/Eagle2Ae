# 核心功能详解

## 功能概述

eagle2ae_web 提供了完整的产品展示和用户体验功能，专注于展示 Eagle 与 After Effects 扩展的集成能力。

## 核心功能模块

### 1. 首页展示系统

#### Hero 区域
- **标题展示**: "Eagle 与 AE 的无缝桥梁"
- **功能卡片导航**: 6个核心功能卡片，支持悬停和点击交互
- **动画效果**: 卡片逐个进场动画，悬停时上浮放大
- **点击交互**: 点击卡片平滑滚动到对应的功能详情区域

#### 功能详情展示
- **交错布局**: 左右交替的图文布局
- **滚动触发动画**: 滚动到区域时触发动画
- **响应式设计**: 适配不同屏幕尺寸
- **内容结构**: 标题、描述文本、示例图片

### 2. 预览系统

#### Splitpanes 集成
- **多视图展示**: 可调整大小的窗格布局
- **交互式预览**: 展示扩展的实际操作界面
- **响应式布局**: 适配不同屏幕尺寸
- **内容加载**: 通过 iframe 加载扩展界面

#### AE 预览页面
- **功能**: 展示 AE 扩展的界面和操作流程
- **布局**: 使用 Splitpanes 组件实现多视图
- **内容**: 展示 AE 扩展的核心功能

#### Eagle 预览页面
- **功能**: 展示 Eagle 扩展的界面和操作流程
- **布局**: 使用 Splitpanes 组件实现多视图
- **内容**: 展示 Eagle 扩展的核心功能

### 3. 下载系统

#### 扩展下载
- **AE 扩展**: 提供 AE 插件下载选项
- **Eagle 扩展**: 提供 Eagle 插件或相关组件
- **版本信息**: 显示版本号、需求、更新日期
- **安装指南**: 提供详细的安装步骤

#### 用户引导
- **清晰的 CTA**: 明确的下载和安装按钮
- **要求说明**: 明确的软件版本要求
- **兼容性信息**: 支持的平台和版本

### 4. 导航系统

#### 全局导航
- **固定导航栏**: 持续可见的导航体验
- **多页面链接**: Home、AE Preview、Eagle Preview、About、Download
- **主题切换**: 深色/浅色模式切换
- **多语言支持**: 语言切换功能

#### 响应式适配
- **桌面端**: 完整导航菜单
- **移动端**: 汉堡菜单设计
- **自适应布局**: 根据屏幕尺寸自动调整

### 5. 动画系统

#### 页面过渡
- **View Transitions API**: 现代化的页面切换动画
- **平滑过渡**: 无缝的页面切换体验
- **性能优化**: 高性能的动画执行

#### 滚动动画
- **GSAP 集成**: GreenSock 动画平台
- **ScrollTrigger**: 滚动触发动画
- **分页滚动**: 大屏鼠标滚轮拦截功能
- **性能优化**: 合理的动画属性使用

### 6. 交互系统

#### DragToTop 功能
- **全页面拖拽**: 页面任意位置拖拽返回顶部
- **视觉反馈**: SVG 连接线和 logo 显示
- **物理效果**: 基于 Matter.js 的物理动画
- **模式识别**: 智能区分拖拽和文本选择

#### 悬停交互
- **卡片悬停**: 悬停时上浮和放大效果
- **按钮效果**: 点击和悬停的视觉反馈
- **导航交互**: 菜单展开和收起动画

## 技术实现细节

### 1. Vue 3 Composition API

#### 响应式数据管理
```javascript
// 使用 ref 和 reactive 管理组件状态
const activeFeature = ref(null);
const features = reactive([]);
const heroAnimationState = shallowReactive({});
```

#### 逻辑复用
```javascript
// 自定义组合式函数
const useScrollHandler = () => {
  const scrollY = ref(0);
  
  const handleScroll = () => {
    scrollY.value = window.scrollY;
  };
  
  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
  });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
  
  return { scrollY, handleScroll };
};
```

### 2. 路由管理

#### Vue Router 配置
```javascript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/ae-preview',
    name: 'AE_Preview',
    component: AE_Preview,
  },
  // ... 其他路由
];

// 滚动行为控制
const scrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) return savedPosition;
  
  if (to.hash) {
    return { el: to.hash, behavior: 'smooth' };
  }
  
  return { left: 0, top: 0 };
};
```

#### 页面过渡动画
```javascript
// 在路由守卫中实现页面过渡
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

### 3. 国际化实现

#### vue-i18n 集成
```javascript
// 消息结构
const messages = {
  'zh-CN': {
    nav: {
      home: '首页',
      aePreview: 'AE 预览',
      eaglePreview: 'Eagle 预览'
    }
  }
};

// 在组件中使用
const { t, locale } = useI18n();
```

### 4. 动画系统实现

#### GSAP 集成
```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 注册插件
gsap.registerPlugin(ScrollTrigger);

// 滚动触发动画
const createScrollAnimation = (element) => {
  gsap.fromTo(element,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    }
  );
};
```

## 性能优化策略

### 1. 渲染性能
- **虚拟滚动**: 对于大量列表项
- **组件懒加载**: 非首屏组件动态导入
- **事件防抖**: 滚动和窗口调整事件

### 2. 资源优化
- **图片优化**: WebP 格式，尺寸适配
- **CSS 优化**: PurgeCSS 移除未使用样式
- **JS 优化**: Tree Shaking 移除未使用代码

### 3. 网络优化
- **代码分割**: 按路由分割代码包
- **资源预加载**: 重要资源优先加载
- **缓存策略**: 合理的 HTTP 缓存配置

## 用户体验优化

### 1. 响应式设计
- **移动优先**: 从小屏幕开始设计
- **断点管理**: 合理的响应式断点
- **触摸优化**: 移动端触摸体验优化

### 2. 可访问性
- **键盘导航**: 完整的键盘操作支持
- **屏幕阅读器**: ARIA 属性支持
- **颜色对比**: 符合 WCAG 标准

### 3. 加载体验
- **骨架屏**: 内容加载时的占位显示
- **进度指示**: 长操作的进度反馈
- **错误处理**: 友好的错误提示

## 扩展性考虑

### 1. 功能扩展
- **组件化架构**: 便于添加新功能组件
- **配置驱动**: 通过配置扩展功能
- **插件系统**: 可扩展的第三方库集成

### 2. 国际化扩展
- **多语言支持**: 易于添加新语言
- **文本管理**: 集中的文本管理
- **格式化支持**: 数字、日期等格式化

### 3. 主题扩展
- **深色模式**: 现有的深色模式基础
- **主题定制**: 易于扩展的 CSS 变量系统
- **品牌定制**: 便于品牌化定制

## 测试策略

### 1. 单元测试
- **组件测试**: 组件渲染和交互测试
- **工具函数**: 工具函数逻辑测试
- **组合式函数**: Composition API 函数测试

### 2. 集成测试
- **页面流程**: 完整的用户操作流程
- **跨组件通信**: 组件间通信测试
- **路由跳转**: 路由功能测试

### 3. 用户体验测试
- **响应速度**: 页面加载和交互响应
- **动画流畅性**: 动画执行是否流畅
- **兼容性测试**: 不同设备和浏览器