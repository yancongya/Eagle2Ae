# 预览页面主题同步

## 功能概述

预览页面主题同步功能确保预览页面中的扩展界面能够与主页面的主题模式保持同步。当用户在主页面切换明暗模式时，预览 iframe 中的扩展界面也会相应地切换到匹配的主题模式。

## 技术实现

### 主题同步机制

使用 iframe 主题注入技术实现主题同步：

```javascript
// 在预览页面中注入主题样式到 iframe
const injectThemeIntoIframe = (iframe, isDarkMode) => {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return;
    
    // 创建或更新主题样式元素
    let themeStyle = doc.getElementById('__preview_theme_style__');
    if (!themeStyle) {
      themeStyle = doc.createElement('style');
      themeStyle.id = '__preview_theme_style__';
      doc.head.appendChild(themeStyle);
    }
    
    // 根据主题模式注入相应样式
    if (isDarkMode) {
      themeStyle.textContent = `
        :root {
          color-scheme: dark;
        }
        body {
          background-color: #1e1e1e !important;
          color: #e0e0e0 !important;
        }
        /* 添加更多深色主题样式 */
      `;
    } else {
      themeStyle.textContent = `
        :root {
          color-scheme: light;
        }
        body {
          background-color: #ffffff !important;
          color: #222222 !important;
        }
        /* 添加更多浅色主题样式 */
      `;
    }
    
    // 更新 iframe 的主题类
    doc.documentElement.classList.toggle('dark', isDarkMode);
    doc.body.classList.toggle('dark', isDarkMode);
  } catch (error) {
    console.warn('无法向 iframe 注入主题样式:', error);
  }
};
```

### 主题监听器

监听主页面主题变化并同步到所有预览 iframe：

```javascript
// 监听主题变化
const setupThemeSync = () => {
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: 'light'
  });
  
  // 监听主题变化
  watch(isDark, (newVal) => {
    // 获取所有预览 iframe
    const iframes = document.querySelectorAll('iframe.extension-preview');
    
    // 向每个 iframe 注入主题
    iframes.forEach(iframe => {
      injectThemeIntoIframe(iframe, newVal);
    });
  });
  
  // 初始同步
  nextTick(() => {
    const iframes = document.querySelectorAll('iframe.extension-preview');
    iframes.forEach(iframe => {
      injectThemeIntoIframe(iframe, isDark.value);
    });
  });
};
```

## 样式注入策略

### 深色主题样式

```css
/* 深色主题注入样式 */
:root {
  color-scheme: dark;
}

html, body {
  background-color: #1e1e1e !important;
  color: #e0e0e0 !important;
}

/* 文本颜色 */
h1, h2, h3, h4, h5, h6, p, span, li, dt, dd, th, td, label, small, div {
  color: #e0e0e0 !important;
}

a {
  color: #4a90e2 !important;
}

/* 代码和预格式化文本 */
pre, code, kbd, samp {
  background-color: #2a2a2a !important;
  color: #e0e0e0 !important;
}

/* 容器背景 */
header, main, section, aside, footer, nav, article {
  background-color: #1e1e1e !important;
}

/* 边框 */
hr, table, th, td, .card, .panel, .section, .box, .wrapper {
  border-color: #444444 !important;
}

/* 表格 */
table {
  background-color: #1e1e1e !important;
}

thead {
  background-color: #2a2a2a !important;
}

/* 表单控件 */
input, textarea, select {
  background-color: #2a2a2a !important;
  color: #e0e0e0 !important;
  border-color: #555555 !important;
}

button {
  background-color: #333333 !important;
  color: #e0e0e0 !important;
  border-color: #555555 !important;
}
```

### 浅色主题样式

```css
/* 浅色主题注入样式 */
:root {
  color-scheme: light;
}

html, body {
  background-color: #ffffff !important;
  color: #222222 !important;
}

/* 文本颜色 */
h1, h2, h3, h4, h5, h6, p, span, li, dt, dd, th, td, label, small, div {
  color: #222222 !important;
}

a {
  color: #0066cc !important;
}

/* 代码和预格式化文本 */
pre, code, kbd, samp {
  background-color: #f5f5f5 !important;
  color: #222222 !important;
}

/* 容器背景 */
header, main, section, aside, footer, nav, article {
  background-color: #ffffff !important;
}

/* 边框 */
hr, table, th, td, .card, .panel, .section, .box, .wrapper {
  border-color: #dddddd !important;
}

/* 表格 */
table {
  background-color: #ffffff !important;
}

thead {
  background-color: #f0f0f0 !important;
}

/* 表单控件 */
input, textarea, select {
  background-color: #ffffff !important;
  color: #222222 !important;
  border-color: #cccccc !important;
}

button {
  background-color: #f0f0f0 !important;
  color: #222222 !important;
  border-color: #cccccc !important;
}
```

## 性能优化

### 样式注入优化

```javascript
// 优化样式注入性能
const optimizedInjectTheme = (() => {
  // 缓存样式字符串
  const themeStyles = {
    dark: generateDarkThemeCSS(),
    light: generateLightThemeCSS()
  };
  
  // 防抖处理
  let debounceTimer = null;
  
  return (iframe, isDark) => {
    // 防抖处理，避免频繁注入
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      // 仅在需要时注入样式
      const themeKey = isDark ? 'dark' : 'light';
      injectCachedStyle(iframe, themeStyles[themeKey]);
    }, 100);
  };
})();
```

### 内存管理

```javascript
// 清理 iframe 主题样式
const cleanupIframeTheme = (iframe) => {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return;
    
    const themeStyle = doc.getElementById('__preview_theme_style__');
    if (themeStyle) {
      themeStyle.remove();
    }
    
    // 移除主题类
    doc.documentElement.classList.remove('dark');
    doc.body.classList.remove('dark');
  } catch (error) {
    console.warn('清理 iframe 主题样式失败:', error);
  }
};
```

## 错误处理

### 跨域处理

```javascript
// 处理跨域 iframe
const handleCrossOriginIframe = (iframe) => {
  try {
    // 尝试访问 iframe 内容
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (doc) {
      // 同域 iframe，正常注入样式
      injectThemeIntoIframe(iframe, isDark.value);
    }
  } catch (error) {
    // 跨域 iframe，使用 postMessage 方式
    const themeMessage = {
      type: 'THEME_SYNC',
      theme: isDark.value ? 'dark' : 'light',
      timestamp: Date.now()
    };
    
    iframe.contentWindow.postMessage(themeMessage, '*');
  }
};
```

### 兼容性处理

```javascript
// 检查浏览器支持
const checkThemeSupport = () => {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports !== 'undefined' &&
    CSS.supports('color-scheme', 'dark')
  );
};

// 降级处理
const fallbackThemeHandling = (iframe, isDark) => {
  if (!checkThemeSupport()) {
    // 不支持 color-scheme 的浏览器使用简单样式
    injectFallbackStyle(iframe, isDark);
    return;
  }
  
  // 正常注入主题样式
  injectThemeIntoIframe(iframe, isDark);
};
```

## 用户体验

### 平滑过渡

```css
/* 添加主题切换过渡效果 */
html, body {
  transition: background-color 0.3s ease, color 0.3s ease;
}

* {
  transition-property: background-color, color, border-color;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}
```

### 视觉反馈

```javascript
// 主题切换时的视觉反馈
const provideVisualFeedback = (isDark) => {
  // 添加主题切换动画类
  document.documentElement.classList.add('theme-transitioning');
  
  // 在过渡完成后移除动画类
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 300);
};
```

## 维护指南

### 样式更新

当需要更新主题样式时：

1. **修改样式生成函数**: 更新 `generateDarkThemeCSS()` 和 `generateLightThemeCSS()` 函数
2. **清除缓存**: 清除样式缓存以确保新样式生效
3. **测试兼容性**: 在不同浏览器中测试样式效果
4. **性能监控**: 监控样式注入对性能的影响

### 调试工具

```javascript
// 主题同步调试函数
const debugThemeSync = () => {
  console.log('=== 主题同步调试信息 ===');
  console.log('当前主题:', isDark.value ? 'dark' : 'light');
  
  const iframes = document.querySelectorAll('iframe.extension-preview');
  console.log('预览 iframe 数量:', iframes.length);
  
  iframes.forEach((iframe, index) => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const hasThemeStyle = !!doc.getElementById('__preview_theme_style__');
      const isDarkClass = doc.documentElement.classList.contains('dark');
      console.log(`iframe ${index}:`, {
        hasThemeStyle,
        isDarkClass,
        themeMatch: isDarkClass === isDark.value
      });
    } catch (error) {
      console.log(`iframe ${index}: 跨域访问受限`);
    }
  });
  
  console.log('=========================');
};
```

## 最佳实践

### 1. 性能考虑
- 使用防抖处理避免频繁样式注入
- 缓存样式字符串减少重复计算
- 及时清理不需要的事件监听器

### 2. 安全考虑
- 验证 iframe 的可访问性
- 处理跨域访问异常
- 避免注入恶意样式代码

### 3. 兼容性考虑
- 提供降级处理方案
- 检查浏览器特性支持
- 测试不同浏览器的表现

### 4. 用户体验
- 添加平滑的过渡动画
- 提供即时的视觉反馈
- 保持主题切换的一致性