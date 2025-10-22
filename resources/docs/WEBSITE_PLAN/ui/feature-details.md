# 功能详情组件

## 组件概述

功能详情组件用于详细展示各个功能特性，采用左右交替的图文布局，展示 Eagle 与 AE 扩展的核心功能。

## 组件结构

### 布局设计
- **交错布局**: 左右交替的图文展示布局
- **响应式适配**: 不同屏幕尺寸下的布局调整
- **内容区域**: 标题、描述文本和示例图片
- **视觉层次**: 清晰的信息层级和视觉引导

### 组件层级
```vue
<template>
  <section :id="id" class="feature-detail">
    <div class="content-container">
      <div 
        class="text-content" 
        :class="{'order-first': !isImageLeft, 'order-last': isImageLeft}"
      >
        <h3 class="feature-title">{{ title }}</h3>
        <div class="description">
          <p v-for="line in descriptionLines" :key="line">{{ line }}</p>
        </div>
      </div>
      <div 
        class="image-content" 
        :class="{'order-last': !isImageLeft, 'order-first': isImageLeft}"
      >
        <img 
          v-for="(url, index) in imageUrls" 
          :key="index" 
          :src="url" 
          :alt="`${title}示例`"
          class="feature-image"
        >
      </div>
    </div>
  </section>
</template>
```

## 动画效果

### 滚动触发动画
- **进入检测**: 使用 ScrollTrigger 检测元素进入视口
- **交错动画**: 图文内容按顺序进入的动画效果
- **延迟播放**: 图片内容延迟于文本内容的进入
- **性能优化**: 使用 transform 和 opacity 属性

### 动画配置
```javascript
onMounted(() => {
  const contentEl = contentRef.value;
  const imageEl = imageRef.value;
  
  ScrollTrigger.create({
    trigger: contentEl,
    start: 'top 80%',
    onEnter: () => {
      // 文本进入动画
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

## 内容管理

### 数据结构
- **功能标题**: 清晰的功能标题展示
- **描述文本**: 详细的功能特性描述
- **示例图片**: 功能操作的示例展示
- **布局控制**: 控制图文左右位置的布尔值

### 动态内容
- **国际化**: 支持多语言内容展示
- **数据驱动**: 通过 props 传入动态内容
- **组件复用**: 支持多个相同组件的复用

## 交互功能

### 导航关联
- **锚点定位**: 与 Hero 区域卡片的锚点关联
- **滚动同步**: 与分页滚动系统的同步
- **状态管理**: 当前显示状态的管理

### 用户体验
- **清晰导航**: 明确的导航路径指示
- **内容连贯**: 与整体页面的连贯体验
- **信息完整性**: 提供完整的功能信息

## 技术实现

### Vue Composition API
```javascript
import { defineProps, ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const props = defineProps({
  id: String,
  title: String,
  descriptionLines: Array,
  imageUrls: Array,
  isImageLeft: Boolean,
  isLast: Boolean
})

// 组件逻辑实现
```

### GSAP 动画系统
- **ScrollTrigger**: 滚动触发的动画控制
- **性能优化**: 使用 transform 和 opacity 属性
- **时序控制**: 精确的动画时序控制

## 响应式设计

### 布局调整
- **移动端**: 垂直堆叠的单列布局
- **平板端**: 适配中等屏幕尺寸的布局
- **桌面端**: 左右交错的双列布局

### 内容适配
- **字体大小**: 不同屏幕尺寸的字体调整
- **图片尺寸**: 响应式图片尺寸调整
- **间距调整**: 适应屏幕的间距调整

## 性能优化

### 渲染性能
- **虚拟化**: 对于大量功能详情的虚拟化处理
- **图片优化**: 图片懒加载和格式优化
- **动画性能**: 高性能的动画属性使用

### 内存管理
- **事件监听器**: 及时清理事件监听器
- **动画实例**: 组件卸载时清理动画实例
- **资源管理**: 有效的资源管理和回收