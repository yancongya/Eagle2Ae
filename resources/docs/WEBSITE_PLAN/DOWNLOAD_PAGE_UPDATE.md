# 下载页面更新文档

## 更新概述

本次更新重新设计了下载页面，使其更符合 Eagle 官方网站的风格，并优化了交互逻辑。

## 设计变更

### 1. 视觉设计
- 采用双列卡片布局展示 AE 和 Eagle 扩展
- 使用渐变边框突出显示每个扩展卡片
- 添加悬停效果增强交互体验
- 优化了功能列表的视觉呈现

### 2. 交互优化
- 简化了拖拽检测逻辑，在鼠标按下时就确定模式
- 空区域：进入拖拽模式
- 有元素区域：进入选择模式（允许默认浏览器行为）

### 3. 功能增强
- 添加了 Hero 区域拖拽刷新功能
- 其他区域拖拽滚动到顶部功能
- 改进了光标状态管理，避免闪烁问题

## 技术实现

### 1. 拖拽模式判定
```javascript
const handleMouseDown = (event) => {
  // 在按下时就确定模式
  const isEmptySpace = checkIfOverEmptySpace(event);
  
  if (isEmptySpace) {
    // 空区域：进入拖拽模式
    isDragging.value = true;
    showLogos.value = true;
    document.body.style.cursor = 'grabbing';
    
    // Position logo1 at the click position
    startPos.value = { x: event.clientX, y: event.clientY };
    logo1Pos.value = { x: event.clientX - 20, y: event.clientY - 20 };
    
    currentPos.value = { x: event.clientX, y: event.clientY };
    logo2Pos.value = { x: event.clientX - 20, y: event.clientY - 20 };
  } else {
    // 有元素：进入选择模式（不执行任何操作，允许默认行为）
    return;
  }

  if (event.button !== 0) return; // Only left mouse button

  event.preventDefault(); // Prevent default to avoid text selection during drag
};
```

### 2. 元素检测逻辑
```javascript
const checkIfOverEmptySpace = (event) => {
  const elements = document.elementsFromPoint(event.clientX, event.clientY);
  // 检查最顶层的元素（第一个元素通常是z-index最高的）
  if (elements.length > 0) {
    const topElement = elements[0]; // 最上层的元素
    const tagName = topElement.tagName;
    const className = topElement.className;
    const elementId = topElement.id;
    
    // 检查标签名 - 交互性较强的标签
    const isInteractiveTag = tagName === 'BUTTON' || 
                             tagName === 'A' || 
                             tagName === 'INPUT' || 
                             tagName === 'TEXTAREA' || 
                             tagName === 'SELECT' ||
                             tagName === 'LABEL' ||
                             tagName === 'AUDIO' ||
                             tagName === 'VIDEO' ||
                             tagName === 'IFRAME';
    
    // 检查类名 - 常见的交互类
    const hasInteractiveClass = className.includes('no-drag') ||
                                className.includes('button') ||
                                className.includes('btn') ||
                                className.includes('link') ||
                                className.includes('nav') ||
                                className.includes('menu') ||
                                className.includes('card') ||
                                className.includes('feature');
    
    // 检查ID - 常见的交互ID
    const hasInteractiveId = elementId.includes('button') ||
                             elementId.includes('btn') ||
                             elementId.includes('nav') ||
                             elementId.includes('menu') ||
                             elementId.includes('card') ||
                             elementId.includes('feature');
    
    // 检查属性 - 事件处理属性
    const hasInteractiveAttribute = topElement.hasAttribute('onclick') ||
                                    topElement.hasAttribute('onmousedown') ||
                                    topElement.hasAttribute('data-v-') || // Vue生成的属性
                                    topElement.hasAttribute('href');
    
    // 检查CSS光标样式 - 交互光标
    const hasInteractiveCursor = getComputedStyle(topElement).cursor === 'pointer' ||
                                 getComputedStyle(topElement).cursor === 'move' ||
                                 getComputedStyle(topElement).cursor === 'grab' ||
                                 getComputedStyle(topElement).cursor === 'grabbing';
    
    // 检查是否是明显的交互元素
    return !(isInteractiveTag || 
             hasInteractiveClass || 
             hasInteractiveId || 
             hasInteractiveAttribute || 
             hasInteractiveCursor);
  }
  
  // 如果没有元素（不应该发生），则认为是空区域
  return true;
};
```

### 3. Hero 区域拖拽刷新
```javascript
const handleMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false;
    showLogos.value = false; // Hide logos after drag ends
    document.body.style.cursor = ''; // Reset cursor

    const dx = currentPos.value.x - startPos.value.x;
    const dy = currentPos.value.y - startPos.value.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);

    if (dragDistance > dragThreshold) {
      // 检查拖拽是否发生在Hero区域（通常在页面顶部）
      const heroHeight = 800; // 假设Hero区域高度为800px，可根据实际情况调整
      if (startPos.value.y < heroHeight && currentPos.value.y < heroHeight) {
        // 在Hero区域拖拽，执行刷新
        location.reload();
      } else {
        // 在其他区域拖拽，执行滚动到顶部
        gsap.to(window, { duration: 1.0, scrollTo: 0, ease: 'power2.out' });
      }
    }
    
    // 拖拽结束后一小段时间再重新评估光标状态，避免立即变化
    setTimeout(() => {
      if (!isDragging.value) { // 确保没有新的拖拽开始
        const event = new MouseEvent('mousemove', {
          clientX: currentPos.value.x,
          clientY: currentPos.value.y
        });
        const isEmptySpace = checkIfOverEmptySpace(event);
        isMouseOverEmptySpace.value = isEmptySpace;
        document.body.style.cursor = isEmptySpace ? 'grab' : '';
      }
    }, 150); // 延迟150ms重新评估状态
  }
};
```

## 用户体验改进

### 1. 模式判定稳定性
- 在鼠标按下时就确定拖拽或选择模式
- 避免在拖拽过程中模式切换
- 提供更稳定的交互体验

### 2. 视觉反馈优化
- 拖拽时显示 grabbing 光标
- 选择时保持默认光标
- 拖拽结束时延迟更新光标状态，避免闪烁

### 3. 功能区分
- Hero 区域拖拽执行页面刷新
- 其他区域拖拽执行滚动到顶部
- 两种操作提供不同的用户体验

## 性能优化

### 1. 事件处理优化
- 使用防抖机制优化光标状态更新
- 避免在拖拽过程中频繁检测元素类型
- 减少不必要的 DOM 操作

### 2. 状态管理
- 简化状态变更逻辑
- 避免重复的状态检查
- 使用合理的延时机制

## 响应式设计

### 1. 移动端适配
- 单列布局在小屏幕上
- 适当的字体大小和间距
- 触摸友好的按钮尺寸

### 2. 桌面端优化
- 双列布局在大屏幕上
- 丰富的视觉效果
- 鼠标悬停交互

## 可访问性

### 1. 键盘导航
- 保持标准的键盘导航功能
- 不干扰屏幕阅读器使用

### 2. 视觉反馈
- 清晰的光标状态指示
- 足够的颜色对比度
- 一致的交互模式

## 测试要点

### 1. 功能测试
- 空区域拖拽功能正常
- 元素区域选择功能正常
- Hero 区域拖拽刷新功能
- 其他区域拖拽滚动功能

### 2. 兼容性测试
- 不同浏览器下的表现
- 移动端和桌面端的适配
- 与页面其他功能的兼容性

### 3. 性能测试
- 页面加载速度
- 交互响应时间
- 内存使用情况

## 维护建议

### 1. 内容更新
- 定期更新功能列表
- 更新版本信息
- 添加新扩展支持

### 2. 样式维护
- 跟随设计规范更新色彩方案
- 优化视觉效果
- 适配新的设计趋势

### 3. 功能扩展
- 添加用户反馈机制
- 集成 analytics 统计
- 提供多语言支持