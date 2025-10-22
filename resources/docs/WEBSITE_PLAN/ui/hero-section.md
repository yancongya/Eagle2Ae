# Hero 区域组件

## 组件概述

Hero 组件是页面顶部的关键区域，包含主标题和功能卡导航，是用户进入网站后首先看到的部分。

## 组件结构

### 布局设计
- **主标题**: "Eagle 与 AE 的无缝桥梁"
- **功能卡片导航**: 6个核心功能卡片的网格布局
- **视觉元素**: 背景图案和装饰元素
- **响应式适配**: 不同屏幕尺寸下的布局调整

### 组件层级
```vue
<template>
  <section id="hero-section">
    <div class="hero-content">
      <h1 class="main-title">{{ t('home.title') }}</h1>
      <div class="feature-cards-grid">
        <FeatureCardNav 
          v-for="feature in features" 
          :key="feature.id"
          :feature="feature"
          @click="scrollToFeature"
        />
      </div>
    </div>
  </section>
</template>
```

## 动画效果

### 进场动画
- **卡片序列**: 卡片按顺序延迟进场效果
- **淡入效果**: 从透明到不透明的过渡
- **缩放效果**: 从缩放状态到正常大小的过渡
- **无旋转**: 避免使用旋转效果，保持专业外观

### 交互动画
- **悬停效果**: 卡片悬停时的上浮和放大效果
- **点击反馈**: 点击时的视觉反馈
- **平滑过渡**: 所有动画保持平滑自然

## 交互功能

### 卡片导航
- **点击滚动**: 点击卡片平滑滚动到对应功能详情区域
- **事件处理**: 处理卡片点击事件并触发滚动
- **性能优化**: 避免不必要的重渲染

### 标题动画
- **悬停变化**: 鼠标悬停时 "Eagle" 与 "AE" 文本互相滚动切换
- **自动恢复**: 2秒后自动恢复到原始文本
- **平滑效果**: 使用 GSAP 实现滚动和淡入淡出效果

## 技术实现

### Composition API
```javascript
import { ref, computed, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t, locale, tm } = useI18n()
    
    const features = computed(() => {
      const featureMessages = tm('home.features')
      return [
        // 功能列表
      ]
    })
    
    const scrollToFeature = (featureId) => {
      // 滚动到对应功能区域
    }
    
    return {
      features,
      scrollToFeature
    }
  }
}
```

### GSAP 动画集成
- **进场序列**: 使用 gsap.fromTo 实现卡片进场
- **悬停效果**: 使用 gsap.to 实现悬停动画
- **性能考虑**: 使用 transform 属性优化性能

## 国际化支持

### 多语言适配
- **标题文本**: 支持多语言标题显示
- **功能描述**: 功能卡片的多语言支持
- **动态更新**: 语言切换时动态更新内容

### 本地化考虑
- **文本长度**: 适应不同语言的文本长度
- **阅读方向**: 支持不同语言的阅读方向
- **文化差异**: 考虑不同文化背景的用户

## 响应式设计

### 移动端优化
- **布局调整**: 移动端的卡片布局调整
- **触控优化**: 适配触摸设备的交互
- **性能考虑**: 移动端的动画性能优化

### 桌面端增强
- **悬停细节**: 桌面端的丰富悬停效果
- **动画细节**: 桌面端的精细动画控制
- **交互增强**: 桌面端的增强交互功能

## 性能优化

### 渲染优化
- **虚拟滚动**: 对于大量卡片的虚拟化处理
- **懒加载**: 非关键资源的懒加载策略
- **动画优化**: 使用 CSS transform 和 opacity

### 内存管理
- **事件清理**: 组件卸载时清理事件监听器
- **动画清理**: 清理 GSAP 动画实例
- **内存泄漏**: 避免内存泄漏问题