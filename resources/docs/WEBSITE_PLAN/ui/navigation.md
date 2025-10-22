# 导航组件

## 组件概述

### Navbar.vue
`Navbar.vue` 是应用的全局导航组件，提供一致的导航体验，包含主题切换、多语言支持等功能。

## 组件功能

### 1. 导航菜单
- **首页 (Home)** - 返回主页
- **AE 预览 (AE Preview)** - AE 扩展预览页面
- **Eagle 预览 (Eagle Preview)** - Eagle 扩展预览页面
- **关于 (About)** - 项目信息页面
- **下载 (Download)** - 扩展下载页面

### 2. 主题切换
- 深色/浅色模式切换
- 使用 `@vueuse/core` 的 `useDark` 函数
- 主题偏好保存到 localStorage

### 3. 响应式设计
- 桌面端显示完整导航菜单
- 移动端使用汉堡菜单
- 适配不同屏幕尺寸

## 组件结构

### 模板结构
```vue
<template>
  <nav class="navbar fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-md">
    <div class="flex items-center justify-between p-4">
      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-2">
        <img src="/logo.png" alt="Logo" class="h-8 w-8" />
        <span class="text-xl font-bold">Eagle2AE</span>
      </router-link>
      
      <!-- 桌面端导航菜单 -->
      <div class="hidden md:flex space-x-6">
        <router-link to="/" class="nav-link">{{ t('nav.home') }}</router-link>
        <router-link to="/ae-preview" class="nav-link">{{ t('nav.aePreview') }}</router-link>
        <router-link to="/eagle-preview" class="nav-link">{{ t('nav.eaglePreview') }}</router-link>
        <router-link to="/about" class="nav-link">{{ t('nav.about') }}</router-link>
        <router-link to="/download" class="nav-link">{{ t('nav.download') }}</router-link>
      </div>
      
      <!-- 右侧功能区 -->
      <div class="flex items-center space-x-4">
        <!-- 主题切换 -->
        <ThemeSwitcher />
        
        <!-- 语言切换 -->
        <LanguageSwitcher />
        
        <!-- 移动端菜单按钮 -->
        <button class="md:hidden" @click="toggleMobileMenu">
          <MenuIcon />
        </button>
      </div>
    </div>
    
    <!-- 移动端菜单 -->
    <div v-show="mobileMenuOpen" class="md:hidden bg-white dark:bg-gray-800 shadow-lg">
      <div class="flex flex-col space-y-2 p-4">
        <router-link to="/" class="nav-link" @click="mobileMenuOpen = false">{{ t('nav.home') }}</router-link>
        <router-link to="/ae-preview" class="nav-link" @click="mobileMenuOpen = false">{{ t('nav.aePreview') }}</router-link>
        <router-link to="/eagle-preview" class="nav-link" @click="mobileMenuOpen = false">{{ t('nav.eaglePreview') }}</router-link>
        <router-link to="/about" class="nav-link" @click="mobileMenuOpen = false">{{ t('nav.about') }}</router-link>
        <router-link to="/download" class="nav-link" @click="mobileMenuOpen = false">{{ t('nav.download') }}</router-link>
      </div>
    </div>
  </nav>
</template>
```

### 样式类说明
- `fixed top-0`: 固定在顶部
- `z-50`: 确保导航在其他元素之上
- `bg-white dark:bg-gray-800`: 支持深色模式
- `shadow-md`: 添加阴影效果

## 主题切换实现

### 深色模式逻辑
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

### 样式适配
- 所有颜色都提供深色模式变体
- 使用 Tailwind 的 `dark:` 前缀
- 保持视觉一致性

## 国际化集成

### 多语言支持
```javascript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 在模板中使用
const navItems = [
  { path: '/', label: t('nav.home') },
  { path: '/ae-preview', label: t('nav.aePreview') },
  // ... 其他导航项
]
```

### 语言变化响应
```javascript
// 监听语言变化事件
onMounted(() => {
  window.addEventListener('lang-changed', handleLanguageChange)
})

const handleLanguageChange = (event) => {
  // 重新计算导航项文本
  updateNavigationLabels()
}
```

## 滚动效果

### 滚动隐藏/显示
```javascript
let lastScrollY = 0
let ticking = false

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY
      
      // 向下滚动时隐藏导航，向上滚动时显示
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 隐藏导航
        navbarRef.value.classList.add('navbar-hidden')
      } else {
        // 显示导航
        navbarRef.value.classList.remove('navbar-hidden')
      }
      
      lastScrollY = currentScrollY
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
```

## 响应式设计

### 断点配置
- `md:` (768px) - 桌面端和移动端的分界点
- 移动端使用汉堡菜单
- 桌面端显示完整导航

### 移动端优化
- 简洁的汉堡菜单界面
- 触摸友好的按钮尺寸
- 平滑的菜单展开动画

## 组件交互

### 悬停效果
```css
.nav-link {
  @apply transition-colors duration-200;
}

.nav-link:hover {
  @apply text-indigo-600 dark:text-indigo-400;
}
```

### 活动状态
```javascript
// 计算当前活动的导航项
const activeRoute = computed(() => {
  return $route.path
})

// 高亮当前活动项
const isActive = (path) => {
  return activeRoute.value === path
}
```

## 性能优化

### 防抖处理
```javascript
// 滚动事件防抖
const debouncedScroll = debounce(handleScroll, 10)
```

### 条件渲染
- 移动端菜单按需渲染
- 减少不必要的 DOM 元素

## 可访问性

### 键盘导航
- 支持 Tab 键导航
- 为焦点元素提供视觉反馈

### 屏幕阅读器
- 使用语义化 HTML
- 提供适当的 ARIA 属性

## 扩展性

### 自定义导航项
```javascript
// 可配置的导航项
const navigationConfig = ref([
  { 
    id: 'home',
    path: '/', 
    label: 'nav.home',
    icon: HomeIcon,
    visible: true
  },
  // ... 其他配置项
])
```

### 插槽支持
```vue
<!-- 允许父组件插入自定义内容 -->
<slot name="right-actions"></slot>
```

## 测试要点

### 功能测试
- 导航链接是否正确跳转
- 主题切换功能
- 移动端菜单功能
- 滚动效果

### 兼容性测试
- 不同浏览器的支持
- 不同屏幕尺寸的适配
- 各种设备的触摸支持