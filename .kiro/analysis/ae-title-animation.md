# AE 扩展标题动画实现分析

## 动画效果概述

AE 扩展的标题实现了一个有趣的交互动画：
- **正常状态**：显示 "Eagle2Ae"
- **悬浮状态**：字符重新排列，变成 "Ae2Eagle"（字符顺序打乱）
- **Logo 效果**：悬浮时 Logo 放大并切换图片

**注意**：字符只是重新排列位置，不改变大小写。悬浮后是 "Ae2Eagle"，不是 "Ae2EAgle"。

## 实现原理

### 1. HTML 结构

每个字符都被单独包裹在 `<span>` 标签中，并赋予特定的 class：

```html
<div class="title">
    <img src="public/logo.png" alt="Eagle2AE Logo" class="title-logo">
    <div class="title-text">
        <span class="char char-e1">E</span>
        <span class="char char-a1">a</span>
        <span class="char char-g1">g</span>
        <span class="char char-l1">l</span>
        <span class="char char-e2">e</span>
        <span class="char char-2">2</span>
        <span class="char char-a2">A</span>
        <span class="char char-e3">e</span>
    </div>
</div>
```

### 2. CSS 动画实现

#### 基础样式
```css
.title-text {
    display: flex;
    position: relative;
    min-width: 140px;
    overflow: visible;
    white-space: nowrap;
}

.char {
    display: inline-block;
    transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    position: relative;
    flex-shrink: 0;
    margin: 0 1.5px;
    color: #9966cc;
}
```

#### 字符重排动画（使用 CSS order 属性）

悬浮时通过改变 flex 子元素的 `order` 属性来重新排列字符：

```css
/* 悬浮时字符重新排列动画 - Eagle2Ae -> Ae2Eagle */
.title:hover .char-a2 { order: 1; } /* A -> 位置1 */
.title:hover .char-e3 { order: 2; } /* e -> 位置2 */
.title:hover .char-2 { order: 3; }  /* 2 -> 位置3 */
.title:hover .char-e1 { order: 4; } /* E -> 位置4 */
.title:hover .char-a1 { order: 5; } /* a -> 位置5 (保持小写) */
.title:hover .char-g1 { order: 6; } /* g -> 位置6 */
.title:hover .char-l1 { order: 7; } /* l -> 位置7 */
.title:hover .char-e2 { order: 8; } /* e -> 位置8 */
```

**原理说明**：
- 正常状态：E-a-g-l-e-2-A-e（按 HTML 顺序显示）= "Eagle2Ae"
- 悬浮状态：通过 order 重排为 A-e-2-E-a-g-l-e = "Ae2Eagle"

**重要**：字符只是改变位置，不改变内容或大小写。纯 CSS 实现，无需 JavaScript。

### 3. Logo 悬浮效果

```css
.title-logo {
    width: 28px;
    height: 28px;
    object-fit: contain;
    transition: all 0.3s ease;
    cursor: pointer;
}

/* 悬浮时切换图片并放大 */
.title:hover .title-logo {
    content: url('public/logo2.png');
    transform: scale(1.1);
}
```

## 关键技术点

1. **Flexbox order 属性**：实现字符位置的流畅重排
2. **CSS transition**：使用缓动函数 `cubic-bezier(0.68, -0.55, 0.265, 1.55)` 创建弹性效果
3. **CSS content 属性**：动态切换 Logo 图片
4. **纯 CSS 实现**：无需 JavaScript，性能更好

## 动画时序

```
用户悬浮
  ↓
CSS :hover 伪类触发
  ↓
order 属性立即生效（字符开始移动）
  ↓
transition 动画执行（600ms）
  ↓
字符移动到新位置，显示 "Ae2Eagle"
```

## 优化建议

1. **性能优化**：使用 `will-change: order, transform` 提示浏览器优化
2. **可访问性**：添加 `aria-label` 确保屏幕阅读器正确读取
3. **响应式**：在小屏幕上可能需要调整字符间距
