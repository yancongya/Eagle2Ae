# 语言切换器组件

## 功能概述

LanguageSwitcher 组件提供了一个精美的下拉式语言切换功能，具有流畅的动画效果和良好的用户体验。该组件支持键盘导航和无障碍访问。

## 用户界面设计

### 视觉效果
- **圆角设计**: 使用 `rounded-9999` 类创建胶囊型按钮
- **渐变效果**: 按钮支持自定义渐变色配置
- **悬停效果**: 悬停时的缩放和颜色变化效果
- **选中状态**: 显示当前选中的语言选项

### 动画效果
- **展开动画**: 使用 GSAP 实现下拉菜单的展开动画
- **项目动画**: 菜单项逐个进入的动画效果
- **收起动画**: 平滑的收起动画效果
- **过渡效果**: 菜单项悬停时的背景过渡效果

## 技术实现

### 组件结构
```vue
<template>
  <div class="relative inline-flex items-center">
    <button
      ref="triggerRef"
      type="button"
      class="ls-trigger"
      :class="sizeClass"
      @click="toggleOpen"
      @keydown="onKeydown"
      aria-haspopup="listbox"
      :aria-expanded="isOpen ? 'true' : 'false'"
    >
      <span class="ls-label">{{ current.label }}</span>
      <svg class="ls-caret" ...>
        <path d="M6 8l4 4 4-4" ... />
      </svg>
    </button>

    <transition name="ls-menu" @enter="onMenuEnter" @leave="onMenuLeave">
      <ul v-if="isOpen" ref="menuRef" class="ls-menu" role="listbox">
        <li
          v-for="(opt, idx) in options"
          :key="opt.value"
          :data-index="idx"
          role="option"
          :aria-selected="opt.value===locale.value ? 'true' : 'false'"
          class="ls-item"
          :class="{ 'is-active': idx===activeIndex, 'is-current': opt.value===locale.value }"
          @click="onSelect(opt.value)"
          @mouseenter="activeIndex=idx"
        >
          <!-- 项目内容 -->
        </li>
      </ul>
    </transition>
  </div>
</template>
```

### 动画实现
```javascript
const onMenuEnter = (el, done) => {
  const items = el.querySelectorAll('.ls-item');
  gsap.set(el, { transformOrigin: 'top center' });

  const tl = gsap.timeline({ onComplete: done });
  tl.fromTo(el,
    { scaleY: 0, opacity: 0 },
    { scaleY: 1, opacity: 1, duration: 0.35, ease: 'power3.out' }
  );
  tl.fromTo(items,
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, stagger: 0.07, duration: 0.3, ease: 'power3.out' },
    "-=0.2"
  );
};

const onMenuLeave = (el, done) => {
  const items = el.querySelectorAll('.ls-item');
  gsap.set(el, { transformOrigin: 'top center' });

  const tl = gsap.timeline({ onComplete: done });
  tl.to(items, { opacity: 0, x: -15, stagger: 0.05, duration: 0.2, ease: 'power2.in' });
  tl.to(el, { scaleY: 0, opacity: 0, duration: 0.3, ease: 'power3.in' }, "-=0.15");
};
```

## 无障碍功能

### ARIA 属性
- **`aria-haspopup`**: 标识按钮控制一个列表框
- **`aria-expanded`**: 指示下拉菜单的展开状态
- **`role="listbox"`**: 标识下拉列表的角色
- **`role="option"`**: 标识列表项的角色
- **`aria-selected`**: 指示选项的选中状态
- **`aria-hidden`**: 隐藏图标元素

### 键盘导航支持
- **`ArrowDown`**: 展开菜单并移动到下一个选项
- **`ArrowUp`**: 移动到上一个选项
- **`Enter/Space`**: 选择当前选项
- **`Escape`**: 关闭菜单
- **`Alt+ArrowDown`**: 展开菜单

## 国际化集成

### 语言选项
```javascript
const options = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' }
]
```

### 语言切换
- **`setLocale`**: 调用国际化系统的 `setLocale` 函数
- **本地存储**: 自动保存用户选择的语言偏好
- **页面更新**: 切换后自动更新页面内容
- **HTML 属性**: 更新 `html` 元素的 `lang` 属性

## 样式系统

### 主题适配
- **暗色模式**: 完整的暗色模式适配
- **CSS 变量**: 支持 CSS 变量进行主题定制
- **渐变色**: 支持自定义按钮渐变色
- **过渡效果**: 平滑的颜色和尺寸过渡

### 响应式设计
- **尺寸选项**: 支持 `sm` 和 `md` 两种尺寸
- **字体大小**: 响应式字体大小调整
- **内边距**: 适应不同尺寸的内边距
- **图标大小**: 适配不同尺寸的图标

## 性能优化

### 渲染优化
- **虚拟滚动**: 在选项很多时使用虚拟滚动
- **事件委托**: 优化事件处理
- **防抖处理**: 对频繁的用户交互进行防抖

### 动画优化
- **GPU 加速**: 使用 `transform` 和 `opacity` 属性
- **动画拆分**: 将复杂动画拆分为多个时间轴
- **性能监控**: 监控动画性能并进行优化

## 安全考虑

### 外部链接
- **`rel="noopener"`**: 防止新窗口访问原窗口
- **链接验证**: 验证外部链接的安全性
- **协议检查**: 检查链接协议的安全性

### 数据处理
- **输入验证**: 验证语言代码的有效性
- **XSS 防护**: 防止恶意内容注入

## 自定义选项

### 外观定制
- **尺寸**: 支持 `sm` 和 `md` 两种尺寸
- **颜色**: 通过 CSS 类定制颜色方案
- **图标**: 可更换的箭头图标
- **动画**: 可定制的动画效果

### 行为定制
- **选项**: 可自定义的语言选项列表
- **事件**: 可监听的语言切换事件
- **回调**: 切换前后的回调函数

## 使用示例

### 基本用法
```vue
<template>
  <LanguageSwitcher />
</template>

<script setup>
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
</script>
```

### 自定义尺寸
```vue
<LanguageSwitcher size="sm" />
```

## 最佳实践

### 用户体验
- **清晰标识**: 清晰地标识当前选中的语言
- **快速切换**: 确保语言切换的快速响应
- **一致体验**: 保持与其他组件的体验一致

### 技术实现
- **模块化**: 将组件功能模块化
- **可测试性**: 便于单元测试和集成测试
- **向后兼容**: 保持 API 的向后兼容性

### 维护考虑
- **文档完整**: 提供完整的组件文档
- **示例代码**: 提供使用示例
- **错误处理**: 全面的错误处理和边界情况处理