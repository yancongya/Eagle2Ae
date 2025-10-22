# 开发指南

## 环境搭建

### 前置要求

- Node.js (推荐 v18.x 或更高版本)
- pnpm (基于根目录的工作空间管理)
- Git

### 项目初始化

```bash
# 克隆项目
git clone <repository-url>
cd <project-root>

# 安装依赖
pnpm install

# 进入 web 应用目录
cd apps/eagle2ae_web

# 启动开发服务器
pnpm dev
```

### 开发服务器

```bash
# 启动开发服务器
pnpm dev

# 指定端口启动
pnpm dev -- --port 3000

# 监听所有网络接口
pnpm dev -- --host
```

## 项目结构

### 目录结构说明

```
apps/eagle2ae_web/
├── public/                 # 静态资源 (构建时直接复制)
│   ├── extensions/         # 扩展预览资源
│   ├── images/            # 图片资源
│   ├── favicon.ico        # 网站图标
│   └── ...
├── src/                   # 源代码目录
│   ├── assets/            # 静态资源 (构建时处理)
│   ├── components/        # Vue 组件
│   │   ├── common/        # 通用组件
│   │   ├── layout/        # 布局组件
│   │   └── features/      # 功能组件
│   ├── views/             # 页面组件
│   ├── router/            # 路由配置
│   ├── composables/       # Vue Composition 函数
│   ├── utils/             # 工具函数
│   ├── locales/           # 国际化资源
│   ├── styles/            # 样式文件
│   ├── i18n.js           # 国际化配置
│   ├── main.js           # 应用入口
│   └── App.vue           # 根组件
├── index.html            # HTML 模板
├── package.json          # 项目配置
├── vite.config.js        # Vite 配置
├── tailwind.config.js    # Tailwind 配置
└── postcss.config.js     # PostCSS 配置
```

## 组件开发

### 组件结构规范

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup>
// 组合式 API
import { ref, computed, onMounted } from 'vue'

// Props 定义
const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

// 组件逻辑
const count = ref(0)
const doubleCount = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})
</script>

<style scoped>
/* 组件样式 */
.component {
  @apply p-4 bg-white dark:bg-gray-800;
}
</style>
```

### 组件分类

#### 通用组件 (Common Components)
- 存放于 `src/components/common/`
- 可在多个页面复用的 UI 元素
- 如按钮、卡片、模态框等

#### 布局组件 (Layout Components)
- 存放于 `src/components/layout/`
- 负责页面整体布局结构
- 如导航栏、页脚、侧边栏等

#### 功能组件 (Feature Components)
- 存放于 `src/components/features/`
- 实现特定业务功能的组件
- 如 Hero 区域、功能详情、预览面板等

## 动画开发

### GSAP 动画规范

#### 基础动画

```javascript
import { gsap } from 'gsap'

// 简单动画
gsap.to(element, {
  duration: 1,
  x: 100,
  ease: 'power2.out',
  onComplete: () => {
    console.log('Animation completed')
  }
})
```

#### 滚动触发动画

```javascript
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 滚动触发动画
gsap.from(element, {
  scrollTrigger: {
    trigger: element,
    start: 'top 80%',
    end: 'bottom 20%',
    toggleActions: 'play none none reverse'
  },
  opacity: 0,
  y: 50,
  duration: 1
})
```

### 动画性能优化

1. **使用 transform 和 opacity** - 避免触发布局重排
2. **及时销毁动画实例** - 在组件卸载时清理
3. **合理设置动画时机** - 避免不必要的重复动画

## 国际化开发

### 添加新语言

1. 在 `src/locales/` 目录下创建新的语言文件
2. 在 `src/i18n.js` 中注册新的语言包
3. 在组件中使用 `t('key')` 进行文本替换

### 语言文件结构

```json
{
  "nav": {
    "home": "首页",
    "aePreview": "AE 预览",
    "eaglePreview": "Eagle 预览"
  },
  "home": {
    "title": "Eagle 与 AE 的无缝桥梁",
    "features": {
      "dragDrop": {
        "title": "拖拽导入",
        "desc": [
          "从 Eagle 直接拖拽素材到 AE",
          "支持多种文件格式"
        ]
      }
    }
  }
}
```

### 在组件中使用国际化

```vue
<template>
  <h1>{{ t('home.title') }}</h1>
  <nav>
    <router-link to="/">{{ t('nav.home') }}</router-link>
    <router-link to="/ae-preview">{{ t('nav.aePreview') }}</router-link>
  </nav>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
</script>
```

## 路由开发

### 添加新路由

```javascript
// src/router/index.js
const routes = [
  // 现有路由...
  {
    path: '/new-page',
    name: 'NewPage',
    component: () => import('../views/NewPage.vue')
  }
]
```

### 路由参数和查询

```javascript
// 获取路由参数
const { params, query } = useRoute()

// 编程式导航
const router = useRouter()
router.push({ name: 'Home', params: { id: 123 } })
```

## 样式开发

### Tailwind CSS 使用

#### 基础用法

```vue
<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <h2 class="text-xl font-bold text-gray-900 dark:text-white">标题</h2>
    <p class="text-gray-600 dark:text-gray-300">内容</p>
  </div>
</template>
```

#### 响应式设计

```vue
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- 内容 -->
  </div>
</template>
```

#### 自定义样式

```css
/* src/styles/custom.css */
.custom-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 在组件中使用 */
<style scoped>
@import '../styles/custom.css';
</style>
```

## 提交规范

### Git 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 类型说明

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例

```
feat(home): 添加 Hero 区域动画效果

- 实现卡片进场动画
- 添加悬停交互效果
- 优化动画性能

Closes #123
```

## 代码质量

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 Prettier 代码格式化规范
- 组件名称使用 PascalCase
- Props 使用 camelCase

### 性能优化

1. **组件懒加载** - 对非首屏组件使用动态导入
2. **图片优化** - 使用 WebP 格式，添加尺寸属性
3. **动画优化** - 使用 transform 和 opacity 属性
4. **包大小优化** - 按需引入第三方库

### 测试策略

1. **单元测试** - 对核心逻辑进行测试
2. **组件测试** - 测试组件的交互和渲染
3. **集成测试** - 测试功能模块的集成

## 部署流程

### 构建命令

```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

### 部署配置

- 构建输出目录：`dist/`
- 静态资源路径：根据部署环境配置
- 路由模式：使用 History 模式，需要服务器支持

### 环境变量

```javascript
// .env
VITE_APP_TITLE=应用标题
VITE_API_BASE_URL=https://api.example.com

// 在代码中使用
const title = import.meta.env.VITE_APP_TITLE
```