## 最佳实践

### 使用建议

#### 样式组织
```css
/* 1. 按功能模块组织样式 */
/* 变量定义 */
:root { /* ... */ }

/* 重置样式 */
* { /* ... */ }
body { /* ... */ }

/* 布局样式 */
.container { /* ... */ }
.grid { /* ... */ }

/* 组件样式 */
.btn { /* ... */ }
.card { /* ... */ }

/* 2. 使用语义化类名 */
/* 推荐 */
.user-avatar { }
.project-card { }
.import-button { }

/* 不推荐 */
.blue-text { }
.big-box { }
.btn1 { }

/* 3. 遵循BEM命名规范 */
.component-name { }
.component-name__element { }
.component-name--modifier { }

/* 4. 使用CSS自定义属性 */
:root {
  /* 基础变量 */
  --color-primary: #007acc;
  --spacing-md: 1rem;
  --radius-md: 0.375rem;
}

/* 派生变量 */
.component {
  --component-padding: calc(var(--spacing-md) * 1.5);
  --component-radius: var(--radius-md);
}
```

#### 性能优化
```css
/* 1. 使用transform和opacity进行动画 */
/* 推荐 - 启用硬件加速 */
.element {
  transform: translateZ(0); /* 创建合成层 */
}

/* 推荐 - 使用transform代替left/top */
.animated {
  transition: transform 0.3s ease;
}
.animated.active {
  transform: translateX(100px);
}

/* 不推荐 */
.animated {
  transition: left 0.3s ease;
}
.animated.active {
  left: 100px;
}

/* 2. 避免复杂选择器 */
/* 推荐 */
.card { }
.card__title { }

/* 不推荐 */
div > .container .card:first-child h3.title { }

/* 3. 优化渲染性能 */
.optimized-element {
  will-change: transform; /* 提示浏览器优化 */
  contain: layout style paint; /* 隔离渲染 */
}
```

#### 可访问性
```css
/* 1. 确保足够的颜色对比度 */
.high-contrast-text {
  color: #000000;
  background-color: #ffffff;
  /* WCAG AA: 4.5:1 minimum */
}

/* 2. 提供焦点指示 */
.focusable-element {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* 3. 高可见性焦点样式 */
.btn:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* 4. 屏幕阅读器优化 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 5. 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 代码规范

#### CSS规范
```css
/* 1. 属性排序 */
.component {
  /* 定位 */
  position: relative;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  
  /* 盒模型 */
  display: flex;
  width: 100%;
  min-height: 50px;
  padding: 1rem;
  margin: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  
  /* 排版 */
  font: normal 16px/1.5 "Helvetica", sans-serif;
  text-align: center;
  color: #333;
  
  /* 视觉效果 */
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  /* 其他 */
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 2. 注释规范 */
/* ==========================================================================
   组件: 按钮
   描述: 提供多种样式和状态的按钮组件
   依赖: 无
   作者: Your Name
   日期: YYYY-MM-DD
   ========================================================================== */

/* 3. 媒体查询位置 */
.element {
  /* 默认样式 */
  display: block;
}

@media (min-width: 768px) {
  .element {
    /* 平板样式 */
    display: flex;
  }
}

@media (min-width: 1024px) {
  .element {
    /* 桌面样式 */
    display: grid;
  }
}
```

## 故障排除

### 常见问题

#### 样式不生效
- **症状**：添加的CSS样式没有效果
- **解决**：
  1. 检查类名拼写是否正确
  2. 确认CSS文件是否正确引入
  3. 验证选择器优先级是否足够
  4. 检查是否有!important规则冲突

#### 响应式布局问题
- **症状**：在不同屏幕尺寸下布局异常
- **解决**：
  1. 验证媒体查询断点设置
  2. 确认响应式类名使用正确
  3. 检查viewport meta标签设置
  4. 测试不同设备尺寸

#### 主题切换问题
- **症状**：主题切换后样式显示异常
- **解决**：
  1. 确认CSS变量定义完整
  2. 验证主题类名应用正确
  3. 检查继承属性处理
  4. 测试所有组件主题适配

#### 性能问题
- **症状**：界面渲染缓慢或卡顿
- **解决**：
  1. 使用transform和opacity优化动画
  2. 避免复杂CSS选择器
  3. 启用GPU硬件加速
  4. 优化图片和资源加载

### 调试技巧

#### 开发者工具使用
```css
/* 1. 可视化网格系统 */
.debug-grid {
  background-image: linear-gradient(rgba(255,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,0,0,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 2. 边框可视化 */
.debug-borders * {
  border: 1px solid rgba(255,0,0,0.2);
}

/* 3. 盒模型可视化 */
.debug-boxmodel * {
  box-shadow: 0 0 0 1px rgba(0,255,0,0.3),
              0 0 0 2px rgba(255,255,0,0.3),
              0 0 0 3px rgba(0,255,255,0.3);
  outline: 1px solid rgba(255,0,255,0.3);
  outline-offset: 3px;
}
```

#### CSS变量调试
```css
/* 显示当前使用的CSS变量值 */
.debug-variables {
  position: fixed;
  top: 0;
  right: 0;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 1rem;
  font-family: monospace;
  font-size: 12px;
  z-index: 10000;
}

.debug-variables::before {
  content: "CSS Variables:" var(--debug-info);
}
```

## 扩展性

### 自定义主题

#### 主题扩展
```css
/* 扩展主题变量 */
:root {
  /* 基础主题 */
  --primary-color: #007acc;
  --success-color: #28a745;
  
  /* 扩展主题变量 */
  --theme-accent: #ff6b35;
  --theme-gradient-start: #007acc;
  --theme-gradient-end: #00447c;
  
  /* 组件特定变量 */
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --card-hover-shadow: 0 10px 15px rgba(0, 0, 0, 0.15);
}

/* 主题特定的组件样式 */
.card.themed {
  --card-shadow: var(--shadow-lg);
  --card-background: linear-gradient(135deg, 
    var(--theme-gradient-start) 0%, 
    var(--theme-gradient-end) 100%);
}

/* 暗色主题 */
[data-theme="dark"] {
  --primary-color: #4da6ff;
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
}
```

#### 主题切换系统
```javascript
// 主题切换逻辑 (CSS + JavaScript)
class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themes = {
      light: 'light-theme',
      dark: 'dark-theme',
      highContrast: 'high-contrast-theme'
    };
    
    this.init();
  }
  
  init() {
    // 检测系统偏好
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.setTheme('dark');
    }
    
    // 监听主题变化
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (this.currentTheme === 'system') {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
  }
  
  setTheme(themeName) {
    // 移除所有主题类
    Object.values(this.themes).forEach(themeClass => {
      document.body.classList.remove(themeClass);
    });
    
    // 添加新主题类
    document.body.classList.add(this.themes[themeName]);
    this.currentTheme = themeName;
    
    // 保存用户选择
    localStorage.setItem('preferred-theme', themeName);
  }
}
```

#### 组件主题系统
```css
/* 组件主题变量 */
.btn {
  --btn-bg: var(--primary-color);
  --btn-text: var(--text-light);
  --btn-border: var(--primary-color);
  --btn-hover-bg: var(--primary-hover);
  --btn-hover-border: var(--primary-hover);
  --btn-active-bg: var(--primary-active);
  --btn-active-border: var(--primary-active);
}

/* 主题变体 */
.btn.success-themed {
  --btn-bg: var(--success-color);
  --btn-border: var(--success-color);
  --btn-hover-bg: #218838;
  --btn-hover-border: #1e7e34;
  --btn-active-bg: #1e7e34;
  --btn-active-border: #1c7430;
}

/* 状态主题 */
.btn:disabled {
  --btn-bg: var(--bg-secondary);
  --btn-text: var(--text-muted);
  --btn-border: var(--border-secondary);
  cursor: not-allowed;
}
```

### 插件化架构

#### 样式插件系统
```css
/* 插件样式容器 */
.stylesheet-plugin {
  /* 插件特定的变量 */
  --plugin-primary: #blue;
  --plugin-secondary: #gray;
  
  /* 插件特定的组件样式 */
  --plugin-button-radius: var(--radius-lg);
  --plugin-card-shadow: var(--shadow-xl);
}

/* 插件组件样式 */
.plugin-component {
  border-radius: var(--plugin-button-radius);
  box-shadow: var(--plugin-card-shadow);
}

/* 插件主题 */
[data-plugin-theme="plugin-name"] {
  --plugin-primary: #custom-color;
  --plugin-secondary: #custom-color-secondary;
}
```