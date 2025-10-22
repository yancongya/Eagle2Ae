# 交互组件 - DragToTop

## 组件概述

### DragToTop.vue
`DragToTop.vue` 是一个创新的拖拽返回顶部功能组件，用户可以通过在页面任意空白处拖拽操作来快速返回页面顶部。该组件优化后不再需要固定的拖拽按钮，用户可以在页面任意位置点击并拖拽来触发返回顶部功能，同时提供视觉反馈显示拖拽轨迹。

## 功能特性

### 1. 全页面拖拽交互
- 在页面任意空白处点击即可开始拖拽
- 跟踪鼠标/触摸移动，显示连接线和两个 logo 图标
- 当拖拽距离超过阈值时触发动画滚动到页面顶部

### 2. 视觉反馈
- 拖拽过程中显示连接线，连接起始点和终点
- 显示两个 logo（蓝色起始点，红色终点）
- 使用 SVG 绘制虚线连接效果

### 3. 流畅动画
- 使用 GSAP 库实现平滑的滚动动画
- 滚动时长为 1.0 秒，使用 power2.out 缓动效果

### 4. 跨平台支持
- 同时支持鼠标事件和触摸事件
- 适配桌面端和移动端设备

### 5. 动态角度旋转
- logo1 会根据拖拽方向自动旋转
- 保持与拖拽路径平行的视觉效果
- 提供更直观的方向反馈

### 6. 动态缩放（带阻尼效果）
- logo1 会根据拖拽距离动态放大
- 距离越远，logo 越大，但放大速率逐渐减缓
- 提供更自然的距离反馈

### 7. 原始外观显示
- logo 显示原始形状，取消圆形裁切效果
- logo 显示原始颜色，移除背景色块
- 保持图片的完整内容和颜色
- 提供更真实的视觉体验

### 8. 事件冲突修复
- 解决了与页面其他元素的交互冲突
- 仅在适当时候显示事件捕获层
- 允许正常页面交互与拖拽功能共存

### 9. 模式判定优化
- 在鼠标按下时确定拖拽或选择模式
- 避免拖拽过程中的模式切换
- 提供更稳定的用户体验

## 组件结构

### 模板部分
```vue
<template>
  <!-- 透明覆盖层：用于捕获页面任意位置的点击事件 -->
  <div 
    v-show="showCaptureLayer" 
    class="fixed inset-0 pointer-events-auto z-[9999]"
    @mousedown="handleMouseDownAnywhere"
    @touchstart="handleTouchStartAnywhere"
  ></div>

  <!-- SVG 层：用于绘制连接线和显示 logo 图标 -->
  <svg 
    v-show="isDragging" 
    class="fixed inset-0 pointer-events-none z-[9998] w-screen h-screen"
    @mousemove="handleMouseMove"
    @touchmove="handleTouchMove"
    @mouseup="handleMouseUp"
    @touchend="handleTouchEnd"
    @mouseleave="handleMouseUp"
  >
    <!-- 连接线 -->
    <line 
      :x1="lineStartX" 
      :y1="lineStartY" 
      :x2="lineEndX" 
      :y2="lineEndY"
      stroke="rgba(59, 130, 246, 0.6)"
      stroke-dasharray="5,5"
      stroke-width="2"
    />
    
    <!-- Logo 1 (起始点) -->
    <image 
      :x="logo1Pos.x - logo1Size/2" 
      :y="logo1Pos.y - logo1Size/2" 
      :width="logo1Size" 
      :height="logo1Size"
      :href="logo1Src"
      :transform="`rotate(${logo1Angle}, ${logo1Pos.x}, ${logo1Pos.y})`"
      class="transition-transform"
    />
    
    <!-- Logo 2 (终点) -->
    <image 
      :x="logo2Pos.x - logo2Size/2" 
      :y="logo2Pos.y - logo2Size/2" 
      :width="logo2Size" 
      :height="logo2Size"
      :href="logo2Src"
      class="transition-opacity"
    />
  </svg>
</template>
```

### 脚本部分
- 使用 Vue 3 Composition API
- 响应式数据：拖拽状态、位置信息、logo 显示状态等
- 计算属性：连接线起点偏移量计算
- 事件处理：鼠标和触摸事件的完整处理流程

## 核心功能实现

### 1. 拖拽事件处理
```javascript
// 从任意位置开始拖拽
const handleMouseDownAnywhere = (e) => {
  if (e.target.matches('a, button, input, textarea, select, [contenteditable]')) {
    return; // 避免与表单元素冲突
  }
  
  isDragging.value = true;
  dragStartX.value = e.clientX;
  dragStartY.value = e.clientY;
  logo1Pos.value = { x: e.clientX, y: e.clientY };
  logo2Pos.value = { x: e.clientX, y: e.clientY };
  showCaptureLayer.value = true;
  
  // 防止文本选择
  e.preventDefault();
};

const handleTouchStartAnywhere = (e) => {
  if (e.target.matches('a, button, input, textarea, select, [contenteditable]')) {
    return;
  }
  
  const touch = e.touches[0];
  isDragging.value = true;
  dragStartX.value = touch.clientX;
  dragStartY.value = touch.clientY;
  logo1Pos.value = { x: touch.clientX, y: touch.clientY };
  logo2Pos.value = { x: touch.clientX, y: touch.clientY };
  showCaptureLayer.value = true;
};

// 更新终点位置
const handleMouseMove = (e) => {
  if (!isDragging.value) return;
  
  logo2Pos.value = { x: e.clientX, y: e.clientY };
  updateLogoAngleAndScale();
};

const handleTouchMove = (e) => {
  if (!isDragging.value) return;
  
  e.preventDefault(); // 防止页面滚动
  const touch = e.touches[0];
  logo2Pos.value = { x: touch.clientX, y: touch.clientY };
  updateLogoAngleAndScale();
};

// 结束拖拽，判断是否触发返回顶部
const handleMouseUp = () => {
  if (!isDragging.value) return;
  
  const distance = calculateDistance(
    dragStartX.value, 
    dragStartY.value, 
    logo2Pos.value.x, 
    logo2Pos.value.y
  );
  
  if (distance > DRAG_THRESHOLD) {
    scrollToTop();
  }
  
  resetDragState();
};
```

### 2. 距离判断
- 设置拖拽阈值为 100 像素（优化后）
- 计算起始点和结束点之间的距离
- 超过阈值则执行滚动到顶部操作

### 3. 位置计算
- 实时计算 logo 位置和连接线起点偏移
- 确保连接线正确连接两个 logo 的边缘

## 技术要点

### 1. 事件捕获
- 使用透明覆盖层捕获全页面点击事件
- 避免与页面其他元素的事件冲突
- 通过 `pointer-events-none` 确保不影响页面正常交互

### 2. SVG 绘制
- 使用 SVG 的 line 元素绘制连接线
- 实时更新线段的起点和终点坐标
- 应用虚线样式和透明度效果

### 3. 动画效果
- 使用 GSAP 的 scrollTo 插件实现平滑滚动
- 预防文本选择（preventDefault）
- 增加触摸事件支持，使用 passive 选项

## 优化改进

### 1. 用户体验改进
- 从固定按钮改为全页面可拖拽，提升便利性
- 增加拖拽阈值，减少误触发
- 增加触摸事件支持，适配移动端

### 2. 视觉反馈改进
- 使用透明覆盖层提示用户正在拖拽操作
- 更清晰的连接线和 logo 动画

### 3. 性能改进
- 更合理的事件监听器管理
- 避免不必要的重渲染
- 触摸事件优化，使用 passive 选项提升性能

## 使用场景

### 适用于
- 长页面内容浏览
- 需要快速返回顶部的场景
- 各种设备类型的用户（桌面端和移动端）
- 提供更直观的操作体验

### 注意事项
- 需要引入 GSAP 和其 ScrollToPlugin
- 需要准备 logo 图片资源
- 避免在需要精确文本选择的区域使用

## 性能优化

- 更合理的事件监听器管理
- 透明覆盖层的使用，不影响正常页面交互
- 触摸事件优化，使用 passive 选项提升性能
- 响应式数据最小化，减少不必要的重渲染

## 附加功能：标题悬停动画

### 功能概述
除了 DragToTop 组件的优化外，Hero 组件也增加了标题悬停动画功能。

### 动画效果
- 鼠标悬停时 "Eagle" 与 "AE" 文本互相滚动切换
- 2 秒后自动恢复到原始文本
- 平滑的滚动和淡入淡出效果

### 技术实现
- 使用 GSAP 库实现动画效果
- 通过 DOM 操作动态更新文本内容
- 事件处理确保动画按预期时间执行

### 用户体验
- 增强了页面的交互体验
- 为用户提供有趣的视觉反馈
- 与整体网站设计风格协调一致

## 代码实现示例

```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

export default {
  setup() {
    // 响应式数据
    const isDragging = ref(false);
    const showCaptureLayer = ref(false);
    const dragStartX = ref(0);
    const dragStartY = ref(0);
    const logo1Pos = ref({ x: 0, y: 0 });
    const logo2Pos = ref({ x: 0, y: 0 });
    const logo1Angle = ref(0);
    const logo1Size = ref(32);
    
    // 常量
    const DRAG_THRESHOLD = 100; // 像素
    
    // 计算属性
    const lineStartX = computed(() => {
      // 考虑 logo 大小的偏移
      return logo1Pos.value.x + Math.cos(logo1Angle.value * Math.PI / 180) * (logo1Size.value / 2);
    });
    
    const lineStartY = computed(() => {
      return logo1Pos.value.y + Math.sin(logo1Angle.value * Math.PI / 180) * (logo1Size.value / 2);
    });
    
    const lineEndX = computed(() => logo2Pos.value.x);
    const lineEndY = computed(() => logo2Pos.value.y);
    
    // 方法实现
    const scrollToTop = () => {
      gsap.to(window, {
        duration: 1.0,
        scrollTo: 0,
        ease: 'power2.out'
      });
    };
    
    const calculateDistance = (x1, y1, x2, y2) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };
    
    const updateLogoAngleAndScale = () => {
      // 根据拖拽方向计算角度
      const deltaX = logo2Pos.value.x - logo1Pos.value.x;
      const deltaY = logo2Pos.value.y - logo1Pos.value.y;
      logo1Angle.value = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      // 根据距离计算缩放
      const distance = calculateDistance(
        logo1Pos.value.x, 
        logo1Pos.value.y, 
        logo2Pos.value.x, 
        logo2Pos.value.y
      );
      
      // 阻尼缩放效果
      logo1Size.value = 32 + Math.min(distance * 0.1, 32); // 最大放大到64px
    };
    
    const resetDragState = () => {
      isDragging.value = false;
      showCaptureLayer.value = false;
      logo1Size.value = 32; // 重置大小
    };
    
    // 事件处理器
    const handleMouseDownAnywhere = (e) => {
      // 实现拖拽开始逻辑
    };
    
    // 生命周期钩子
    onMounted(() => {
      // 组件挂载时的初始化
    });
    
    onUnmounted(() => {
      // 清理事件监听器
      resetDragState();
    });
    
    return {
      isDragging,
      showCaptureLayer,
      lineStartX,
      lineStartY,
      lineEndX,
      lineEndY,
      logo1Pos,
      logo2Pos,
      logo1Angle,
      logo1Size,
      handleMouseDownAnywhere,
      handleTouchStartAnywhere,
      handleMouseMove,
      handleTouchMove,
      handleMouseUp,
      handleTouchEnd: handleMouseUp
    };
  }
};
```