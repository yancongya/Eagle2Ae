# UI 组件库概览

## 组件架构

### 组件分类

#### 1. 布局组件 (Layout Components)
基础页面结构组件，定义页面整体布局和框架：

- **`Navbar.vue`** - 固定头部导航栏
  - Logo 和首页链接
  - 导航菜单项
  - 主题切换功能
  - 下载按钮
  - 响应式汉堡菜单

- **`Footer.vue`** - 页面页脚
  - 版权信息
  - 社交链接
  - 额外导航

- **`App.vue`** - 根组件
  - 路由视图容器
  - 全局组件集成
  - 页面过渡处理

#### 2. 内容组件 (Content Components)
承载页面核心内容的组件：

- **`Hero.vue`** - 首页顶部区域
  - 主标题展示
  - 功能卡导航 (FeatureCardNav)
  - 标题悬停动画
  - 响应式布局

- **`FeatureCardNav.vue`** - 功能卡片导航
  - 六个功能卡片
  - 进场动画
  - 交互效果 (悬停、点击)
  - 平滑滚动到详情区域

- **`FeatureDetail.vue`** - 功能详情展示
  - 图文交错布局
  - 滚动触发动画
  - 响应式设计
  - 可复用的布局结构

#### 3. 交互组件 (Interactive Components)
提供用户交互功能的组件：

- **`DragToTop.vue`** - 拖拽返回顶部
  - 全页面拖拽检测
  - SVG 连接线绘制
  - Logo 角度旋转
  - 动态缩放效果
  - 平滑滚动动画

- **`Splitpanes`** - 分割窗格组件
  - 预览页面布局
  - 可调整大小
  - 响应式设计

#### 4. 功能组件 (Feature Components)
特定功能相关的组件：

- **`Download.vue`** - 下载页面组件
  - AE 和 Eagle 扩展下载选项
  - 版本信息展示
  - 安装指南

- **`AE_Preview.vue` / `Eagle_Preview.vue`** - 预览页面
  - Splitpanes 集成
  - iframe 扩展预览
  - 多视图布局

## 组件设计原则

### 1. 可复用性
- 组件设计为可复用单元
- 通过 props 接收数据和配置
- 通过 events 向父组件通信

### 2. 响应式设计
- 使用 Tailwind CSS 实现响应式布局
- 移动端优先的断点策略
- 触摸友好的交互设计

### 3. 性能优化
- 使用 Vue 3 的响应式优化
- 合理使用 `v-show` vs `v-if`
- 组件懒加载和代码分割

### 4. 动画流畅性
- 使用 GSAP 实现高性能动画
- 合理的缓动函数选择
- 避免布局重排的动画属性

## 组件层次结构

### 主页组件层次
```
App.vue
├── Navbar.vue
├── Home.vue
│   ├── Hero.vue
│   │   ├── FeatureCardNav.vue (x6)
│   ├── FeatureDetail.vue (x6)
│   │   ├── FeatureDetailItem.vue (抽象后的单项)
│   ├── Footer.vue
└── DragToTop.vue (全局组件)
```

### 预览页组件层次
```
App.vue
├── Navbar.vue
├── AE_Preview.vue / Eagle_Preview.vue
│   ├── Splitpanes
│   │   ├── Pane
│   │   ├── Pane
│   │   └── Splitter (可拖拽分隔符)
└── Footer.vue
```

## 组件通信模式

### Props 向下传递
```javascript
// 父组件向子组件传递数据
<FeatureDetail 
  :title="feature.title"
  :description-lines="feature.descriptionLines"
  :image-urls="feature.imageUrls"
  :is-image-left="index % 2 === 0"
/>
```

### Events 向上传递
```javascript
// 子组件向父组件发送事件
// Hero.vue
defineEmits(['scroll-to-feature']);

// 在需要时触发事件
emit('scroll-to-feature', featureId);
```

### Provide/Inject 跨层级通信
用于全局状态或配置的传递，如国际化、主题设置等。

## 组件状态管理

### 本地状态 (Local State)
- 使用 `ref` 和 `reactive` 管理组件内部状态
- 适用于组件内部逻辑，不需要跨组件共享

### 计算属性 (Computed Properties)
- 使用 `computed` 处理派生数据
- 自动缓存，性能优化

### 响应式数据流
```javascript
// 在 Home.vue 中通过计算属性管理功能数据
const features = computed(() => {
  const localeMessages = tm('home.features');
  return [
    {
      id: 'feature-drag-drop',
      title: localeMessages.dragDrop.title,
      descriptionLines: localeMessages.dragDrop.desc,
      imageUrls: [/* image URLs */]
    },
    // ... 其他功能
  ];
});
```

## 组件动画系统

### 进场动画
- 使用 GSAP 实现组件进入视口时的动画
- 结合 ScrollTrigger 实现滚动触发动画
- Hero 区域卡片逐个进场效果

### 交互动画
- 卡片悬停时的缩放和上浮效果
- 拖拽操作的实时反馈动画
- 主题切换时的平滑过渡

### 页面过渡
- 使用 View Transitions API 实现页面切换动画
- 与 Vue Router 集成的过渡效果

## 组件测试策略

### 单元测试
- 组件渲染测试
- 事件处理测试
- Props 验证测试

### 集成测试
- 组件间通信测试
- 复杂交互场景测试
- 动画效果验证

## 组件维护指南

### 命名规范
- 组件名称使用 PascalCase
- 文件名与组件名保持一致
- 功能明确的命名

### 文档要求
- 每个组件应有基本的文档说明
- Prop 类型和默认值定义
- 事件和插槽说明

### 版本控制
- 组件 API 变更时注意向后兼容
- 重大变更需要版本升级说明
- 废弃 API 的迁移指南