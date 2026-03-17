# CSS样式系统

CSS样式是 Eagle2Ae AE 扩展 v2.4.0 的用户界面设计核心部分，提供了现代化、响应式的用户界面体验。该样式系统采用了模块化设计，支持主题定制，并遵循 After Effects 的用户界面设计规范，确保与 AE 环境的一致性和专业性。

## 核心特性

### 模块化样式架构
- **组件样式** - 每个UI组件拥有独立的样式模块
- **主题系统** - 支持明亮和暗黑主题切换
- **响应式设计** - 适配不同屏幕尺寸和分辨率
- **可访问性** - 遵循WCAG标准的可访问性设计

### 颜色系统
- **主色调** - 专业的蓝色系配色方案
- **辅助色** - 补充色彩，用于状态指示
- **中性色** - 灰色系，用于背景和文本
- **强调色** - 用于重要操作和提醒

### 布局系统
- **Flexbox布局** - 现代化的弹性布局方案
- **Grid系统** - 复杂界面的网格布局
- **响应式断点** - 多尺寸适配策略
- **空间系统** - 统一的间距和尺寸规范

## 技术实现

### 样式架构

```css
/* 
 * Eagle2AE Extension v2.4.0 CSS样式系统
 * 基于模块化的样式架构设计
 */

/* 1. 变量定义 - 提供统一的样式值管理 */
:root {
  /* 颜色变量 */
  --primary-color: #007acc;          /* 主要蓝色 */
  --primary-hover: #005a9e;          /* 主要蓝色悬停态 */
  --primary-active: #00447c;          /* 主要蓝色激活态 */
  --secondary-color: #666666;        /* 次要灰色 */
  --accent-color: #ff6b35;           /* 强调橙色 */
  --success-color: #28a745;          /* 成功绿色 */
  --warning-color: #ffc107;          /* 警告黄色 */
  --error-color: #dc3545;            /* 错误红色 */
  --info-color: #17a2b8;             /* 信息青色 */
  
  /* 背景色 */
  --bg-primary: #ffffff;             /* 主要背景 */
  --bg-secondary: #f8f9fa;           /* 次要背景 */
  --bg-tertiary: #e9ecef;            /* 三级背景 */
  --bg-dark: #2d2d2d;                /* 深色背景 */
  --bg-darker: #1e1e1e;              /* 更深背景 */
  --bg-hover: #f0f0f0;               /* 悬停背景 */
  
  /* 文本颜色 */
  --text-primary: #212529;           /* 主要文本 */
  --text-secondary: #6c757d;         /* 次要文本 */
  --text-muted: #868e96;             /* 弱化文本 */
  --text-light: #ffffff;             /* 浅色文本 */
  --text-dark: #000000;              /* 深色文本 */
  
  /* 边框颜色 */
  --border-primary: #dee2e6;         /* 主要边框 */
  --border-secondary: #ced4da;       /* 次要边框 */
  --border-light: #e9ecef;           /* 浅色边框 */
  --border-dark: #adb5bd;            /* 深色边框 */
  
  /* 间距变量 */
  --spacing-xs: 0.25rem;             /* 超小间距: 4px */
  --spacing-sm: 0.5rem;              /* 小间距: 8px */
  --spacing-md: 1rem;                /* 中间距: 16px */
  --spacing-lg: 1.5rem;              /* 大间距: 24px */
  --spacing-xl: 2rem;                /* 超大间距: 32px */
  --spacing-2xl: 3rem;               /* 超超级大间距: 48px */
  
  /* 尺寸变量 */
  --radius-sm: 0.25rem;              /* 小圆角 */
  --radius-md: 0.375rem;             /* 中圆角 */
  --radius-lg: 0.5rem;               /* 大圆角 */
  --radius-xl: 0.75rem;              /* 超大圆角 */
  --radius-full: 50%;                /* 完整圆角 */
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);           /* 小阴影 */
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);           /* 中阴影 */
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);          /* 大阴影 */
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);         /* 超大阴影 */
  
  /* 字体大小 */
  --font-xs: 0.75rem;                /* 超小字体: 12px */
  --font-sm: 0.875rem;               /* 小字体: 14px */
  --font-md: 1rem;                   /* 中字体: 16px */
  --font-lg: 1.125rem;               /* 大字体: 18px */
  --font-xl: 1.25rem;                /* 超大字体: 20px */
  --font-2xl: 1.5rem;                /* 超超级大字体: 24px */
  
  /* 字重 */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* 行高 */
  --line-height-none: 1;
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
  
  /* 动画变量 */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}

/* 2. 基础重置和通用样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: var(--font-md);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

/* 3. AE主题适配 */
/* 当检测到AE深色主题时应用的样式 */
.ae-dark-theme {
  --bg-primary: #2d2d2d;
  --bg-secondary: #3d3d3d;
  --bg-tertiary: #4d4d4d;
  --bg-hover: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --text-muted: #aaaaaa;
  --border-primary: #444444;
  --border-secondary: #555555;
  --border-light: #3a3a3a;
  --border-dark: #666666;
}

/* 4. 响应式基类 */
.container {
  width: 100%;
  padding-right: var(--spacing-md);
  padding-left: var(--spacing-md);
  margin-right: auto;
  margin-left: auto;
}

/* 响应式容器 */
@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: 992px) {
  .container {
    max-width: 960px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}

/* 5. Flexbox布局工具类 */
.d-flex { display: flex; }
.d-inline-flex { display: inline-flex; }
.flex-row { flex-direction: row; }
.flex-column { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }
.align-start { align-items: flex-start; }
.align-end { align-items: flex-end; }
.align-center { align-items: center; }
.align-stretch { align-items: stretch; }
.align-content-start { align-content: flex-start; }
.align-content-end { align-content: flex-end; }
.align-content-center { align-content: center; }
.align-content-between { align-content: space-between; }
.align-content-around { align-content: space-around; }
.align-content-stretch { align-content: stretch; }
.flex-grow-1 { flex-grow: 1; }
.flex-shrink-1 { flex-shrink: 1; }
.flex-auto { flex: auto; }

/* 6. 网格系统 */
.grid {
  display: grid;
  gap: var(--spacing-md);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.grid-cols-7 { grid-template-columns: repeat(7, minmax(0, 1fr)); }
.grid-cols-8 { grid-template-columns: repeat(8, minmax(0, 1fr)); }
.grid-cols-9 { grid-template-columns: repeat(9, minmax(0, 1fr)); }
.grid-cols-10 { grid-template-columns: repeat(10, minmax(0, 1fr)); }
.grid-cols-11 { grid-template-columns: repeat(11, minmax(0, 1fr)); }
.grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }

/* 7. 间距工具类 */
.m-0 { margin: 0 !important; }
.m-1 { margin: var(--spacing-xs) !important; }
.m-2 { margin: var(--spacing-sm) !important; }
.m-3 { margin: var(--spacing-md) !important; }
.m-4 { margin: var(--spacing-lg) !important; }
.m-5 { margin: var(--spacing-xl) !important; }

.mt-0 { margin-top: 0 !important; }
.mt-1 { margin-top: var(--spacing-xs) !important; }
.mt-2 { margin-top: var(--spacing-sm) !important; }
.mt-3 { margin-top: var(--spacing-md) !important; }
.mt-4 { margin-top: var(--spacing-lg) !important; }
.mt-5 { margin-top: var(--spacing-xl) !important; }

.mr-0 { margin-right: 0 !important; }
.mr-1 { margin-right: var(--spacing-xs) !important; }
.mr-2 { margin-right: var(--spacing-sm) !important; }
.mr-3 { margin-right: var(--spacing-md) !important; }
.mr-4 { margin-right: var(--spacing-lg) !important; }
.mr-5 { margin-right: var(--spacing-xl) !important; }

.mb-0 { margin-bottom: 0 !important; }
.mb-1 { margin-bottom: var(--spacing-xs) !important; }
.mb-2 { margin-bottom: var(--spacing-sm) !important; }
.mb-3 { margin-bottom: var(--spacing-md) !important; }
.mb-4 { margin-bottom: var(--spacing-lg) !important; }
.mb-5 { margin-bottom: var(--spacing-xl) !important; }

.ml-0 { margin-left: 0 !important; }
.ml-1 { margin-left: var(--spacing-xs) !important; }
.ml-2 { margin-left: var(--spacing-sm) !important; }
.ml-3 { margin-left: var(--spacing-md) !important; }
.ml-4 { margin-left: var(--spacing-lg) !important; }
.ml-5 { margin-left: var(--spacing-xl) !important; }

/* 8. 内边距工具类 */
.p-0 { padding: 0 !important; }
.p-1 { padding: var(--spacing-xs) !important; }
.p-2 { padding: var(--spacing-sm) !important; }
.p-3 { padding: var(--spacing-md) !important; }
.p-4 { padding: var(--spacing-lg) !important; }
.p-5 { padding: var(--spacing-xl) !important; }

.pt-0 { padding-top: 0 !important; }
.pt-1 { padding-top: var(--spacing-xs) !important; }
.pt-2 { padding-top: var(--spacing-sm) !important; }
.pt-3 { padding-top: var(--spacing-md) !important; }
.pt-4 { padding-top: var(--spacing-lg) !important; }
.pt-5 { padding-top: var(--spacing-xl) !important; }

.pr-0 { padding-right: 0 !important; }
.pr-1 { padding-right: var(--spacing-xs) !important; }
.pr-2 { padding-right: var(--spacing-sm) !important; }
.pr-3 { padding-right: var(--spacing-md) !important; }
.pr-4 { padding-right: var(--spacing-lg) !important; }
.pr-5 { padding-right: var(--spacing-xl) !important; }

.pb-0 { padding-bottom: 0 !important; }
.pb-1 { padding-bottom: var(--spacing-xs) !important; }
.pb-2 { padding-bottom: var(--spacing-sm) !important; }
.pb-3 { padding-bottom: var(--spacing-md) !important; }
.pb-4 { padding-bottom: var(--spacing-lg) !important; }
.pb-5 { padding-bottom: var(--spacing-xl) !important; }

.pl-0 { padding-left: 0 !important; }
.pl-1 { padding-left: var(--spacing-xs) !important; }
.pl-2 { padding-left: var(--spacing-sm) !important; }
.pl-3 { padding-left: var(--spacing-md) !important; }
.pl-4 { padding-left: var(--spacing-lg) !important; }
.pl-5 { padding-left: var(--spacing-xl) !important; }

/* 9. 文本工具类 */
.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-justify { text-align: justify; }
.text-lowercase { text-transform: lowercase; }
.text-uppercase { text-transform: uppercase; }
.text-capitalize { text-transform: capitalize; }
.font-light { font-weight: var(--font-weight-light); }
.font-normal { font-weight: var(--font-weight-normal); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }
.text-xs { font-size: var(--font-xs); }
.text-sm { font-size: var(--font-sm); }
.text-md { font-size: var(--font-md); }
.text-lg { font-size: var(--font-lg); }
.text-xl { font-size: var(--font-xl); }
.text-2xl { font-size: var(--font-2xl); }
.italic { font-style: italic; }
.line-through { text-decoration: line-through; }
.no-underline { text-decoration: none; }
.break-words { overflow-wrap: break-word; }
.hyphens-auto { hyphens: auto; }

/* 10. 显示工具类 */
.block { display: block; }
.inline-block { display: inline-block; }
.inline { display: inline; }
.hidden { display: none; }
.visible { visibility: visible; }
.invisible { visibility: hidden; }
.overflow-hidden { overflow: hidden; }
.overflow-y-auto { overflow-y: auto; }
.overflow-x-auto { overflow-x: auto; }

/* 11. Position工具类 */
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.sticky { position: sticky; }
.top-0 { top: 0; }
.right-0 { right: 0; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.top-4 { top: var(--spacing-md); }
.right-4 { right: var(--spacing-md); }
.bottom-4 { bottom: var(--spacing-md); }
.left-4 { left: var(--spacing-md); }
.z-10 { z-index: 10; }
.z-20 { z-index: 20; }
.z-30 { z-index: 30; }
.z-40 { z-index: 40; }
.z-50 { z-index: 50; }
.z-100 { z-index: 100; }

/* 12. 尺寸工具类 */
.w-full { width: 100%; }
.w-screen { width: 100vw; }
.w-1 { width: 0.25rem; }
.w-2 { width: 0.5rem; }
.w-3 { width: 0.75rem; }
.w-4 { width: 1rem; }
.w-5 { width: 1.25rem; }
.w-6 { width: 1.5rem; }
.w-8 { width: 2rem; }
.w-10 { width: 2.5rem; }
.w-12 { width: 3rem; }
.w-16 { width: 4rem; }
.w-20 { width: 5rem; }
.w-24 { width: 6rem; }
.w-32 { width: 8rem; }
.w-48 { width: 12rem; }
.w-64 { width: 16rem; }
.w-1/2 { width: 50%; }
.w-1/3 { width: 33.333333%; }
.w-2/3 { width: 66.666667%; }
.w-1/4 { width: 25%; }
.w-2/4 { width: 50%; }
.w-3/4 { width: 75%; }
.w-1/5 { width: 20%; }
.w-2/5 { width: 40%; }
.w-3/5 { width: 60%; }
.w-4/5 { width: 80%; }
.w-1/6 { width: 16.666667%; }
.w-2/6 { width: 33.333333%; }
.w-3/6 { width: 50%; }
.w-4/6 { width: 66.666667%; }
.w-5/6 { width: 83.333333%; }

.h-full { height: 100%; }
.h-screen { height: 100vh; }
.h-1 { height: 0.25rem; }
.h-2 { height: 0.5rem; }
.h-3 { height: 0.75rem; }
.h-4 { height: 1rem; }
.h-5 { height: 1.25rem; }
.h-6 { height: 1.5rem; }
.h-8 { height: 2rem; }
.h-10 { height: 2.5rem; }
.h-12 { height: 3rem; }
.h-16 { height: 4rem; }
.h-20 { height: 5rem; }
.h-24 { height: 6rem; }
.h-32 { height: 8rem; }
.h-48 { height: 12rem; }
.h-64 { height: 16rem; }

/* 13. 边框工具类 */
.border { border: 1px solid var(--border-primary); }
.border-0 { border: 0; }
.border-2 { border-width: 2px; }
.border-4 { border-width: 4px; }
.border-8 { border-width: 8px; }
.border-t { border-top: 1px solid var(--border-primary); }
.border-r { border-right: 1px solid var(--border-primary); }
.border-b { border-bottom: 1px solid var(--border-primary); }
.border-l { border-left: 1px solid var(--border-primary); }
.border-solid { border-style: solid; }
.border-dashed { border-style: dashed; }
.border-dotted { border-style: dotted; }
.rounded-none { border-radius: 0; }
.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-xl { border-radius: var(--radius-xl); }
.rounded-full { border-radius: var(--radius-full); }
.rounded-t-none { border-top-left-radius: 0; border-top-right-radius: 0; }
.rounded-r-none { border-top-right-radius: 0; border-bottom-right-radius: 0; }
.rounded-b-none { border-bottom-right-radius: 0; border-bottom-left-radius: 0; }
.rounded-l-none { border-top-left-radius: 0; border-bottom-left-radius: 0; }
.rounded-t-sm { border-top-left-radius: var(--radius-sm); border-top-right-radius: var(--radius-sm); }
.rounded-r-sm { border-top-right-radius: var(--radius-sm); border-bottom-right-radius: var(--radius-sm); }
.rounded-b-sm { border-bottom-right-radius: var(--radius-sm); border-bottom-left-radius: var(--radius-sm); }
.rounded-l-sm { border-top-left-radius: var(--radius-sm); border-bottom-left-radius: var(--radius-sm); }

/* 14. 阴影工具类 */
.shadow-none { box-shadow: none; }
.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }
.shadow-xl { box-shadow: var(--shadow-xl); }
.shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
.shadow-outline { box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5); }
.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }

/* 15. 背景工具类 */
.bg-transparent { background-color: transparent; }
.bg-white { background-color: #ffffff; }
.bg-black { background-color: #000000; }
.bg-primary { background-color: var(--primary-color); }
.bg-secondary { background-color: var(--secondary-color); }
.bg-accent { background-color: var(--accent-color); }
.bg-success { background-color: var(--success-color); }
.bg-warning { background-color: var(--warning-color); }
.bg-error { background-color: var(--error-color); }
.bg-info { background-color: var(--info-color); }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-gray-300 { background-color: #d1d5db; }
.bg-gray-400 { background-color: #9ca3af; }
.bg-gray-500 { background-color: #6b7280; }
.bg-gray-600 { background-color: #4b5563; }
.bg-gray-700 { background-color: #374151; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-900 { background-color: #111827; }

/* 16. 文本颜色工具类 */
.text-transparent { color: transparent; }
.text-white { color: #ffffff; }
.text-black { color: #000000; }
.text-primary { color: var(--primary-color); }
.text-secondary { color: var(--secondary-color); }
.text-accent { color: var(--accent-color); }
.text-success { color: var(--success-color); }
.text-warning { color: var(--warning-color); }
.text-error { color: var(--error-color); }
.text-info { color: var(--info-color); }
.text-gray-50 { color: #f9fafb; }
.text-gray-100 { color: #f3f4f6; }
.text-gray-200 { color: #e5e7eb; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-800 { color: #1f2937; }
.text-gray-900 { color: #111827; }

/* 17. 图片工具类 */
.img-responsive { max-width: 100%; height: auto; }
.object-contain { object-fit: contain; }
.object-cover { object-fit: cover; }
.object-fill { object-fit: fill; }
.object-scale-down { object-fit: scale-down; }
.object-none { object-fit: none; }
.object-center { object-position: center; }
.object-top { object-position: top; }
.object-right { object-position: right; }
.object-bottom { object-position: bottom; }
.object-left { object-position: left; }

/* 18. 动画工具类 */
.animate-spin {
  animation: spin 1s linear infinite;
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
.animate-bounce {
  animation: bounce 1s infinite;
}
.animate-none {
  animation: none;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}

/* 19. Transition工具类 */
.transition-none { transition: none; }
.transition-all { transition: all var(--transition-normal); }
.transition { transition: background-color var(--transition-normal), border-color var(--transition-normal), color var(--transition-normal), fill var(--transition-normal), stroke var(--transition-normal), opacity var(--transition-normal), box-shadow var(--transition-normal), transform var(--transition-normal); }
.transition-colors { transition: background-color var(--transition-normal), border-color var(--transition-normal), color var(--transition-normal), fill var(--transition-normal), stroke var(--transition-normal); }
.transition-opacity { transition: opacity var(--transition-normal); }
.transition-shadow { transition: box-shadow var(--transition-normal); }
.transition-transform { transition: transform var(--transition-normal); }

/* 20. Transform工具类 */
.transform { transform: translate(0, 0) rotate(0) skew(0) scaleX(1) scaleY(1); }
.transform-none { transform: none; }
.translate-x-0 { transform: translateX(0); }
.translate-x-1 { transform: translateX(0.25rem); }
.translate-x-2 { transform: translateX(0.5rem); }
.translate-x-3 { transform: translateX(0.75rem); }
.translate-x-4 { transform: translateX(1rem); }
.translate-x-5 { transform: translateX(1.25rem); }
.translate-x-6 { transform: translateX(1.5rem); }
.translate-x-8 { transform: translateX(2rem); }
.translate-x-10 { transform: translateX(2.5rem); }
.translate-x-12 { transform: translateX(3rem); }
.translate-x-16 { transform: translateX(4rem); }
.translate-x-20 { transform: translateX(5rem); }
.translate-x-24 { transform: translateX(6rem); }
.translate-x-32 { transform: translateX(8rem); }
.translate-x-48 { transform: translateX(12rem); }
.translate-x-64 { transform: translateX(16rem); }
.translate-x-px { transform: translateX(1px); }
.-translate-x-1 { transform: translateX(-0.25rem); }
.-translate-x-2 { transform: translateX(-0.5rem); }
.-translate-x-3 { transform: translateX(-0.75rem); }
.-translate-x-4 { transform: translateX(-1rem); }
.-translate-x-5 { transform: translateX(-1.25rem); }
.-translate-x-6 { transform: translateX(-1.5rem); }
.-translate-x-8 { transform: translateX(-2rem); }
.-translate-x-10 { transform: translateX(-2.5rem); }
.-translate-x-12 { transform: translateX(-3rem); }
.-translate-x-16 { transform: translateX(-4rem); }
.-translate-x-20 { transform: translateX(-5rem); }
.-translate-x-24 { transform: translateX(-6rem); }
.-translate-x-32 { transform: translateX(-8rem); }
.-translate-x-48 { transform: translateX(-12rem); }
.-translate-x-64 { transform: translateX(-16rem); }
.-translate-x-px { transform: translateX(-1px); }
.translate-y-0 { transform: translateY(0); }
.translate-y-1 { transform: translateY(0.25rem); }
.translate-y-2 { transform: translateY(0.5rem); }
.translate-y-3 { transform: translateY(0.75rem); }
.translate-y-4 { transform: translateY(1rem); }
.translate-y-5 { transform: translateY(1.25rem); }
.translate-y-6 { transform: translateY(1.5rem); }
.translate-y-8 { transform: translateY(2rem); }
.translate-y-10 { transform: translateY(2.5rem); }
.translate-y-12 { transform: translateY(3rem); }
.translate-y-16 { transform: translateY(4rem); }
.translate-y-20 { transform: translateY(5rem); }
.translate-y-24 { transform: translateY(6rem); }
.translate-y-32 { transform: translateY(8rem); }
.translate-y-48 { transform: translateY(12rem); }
.translate-y-64 { transform: translateY(16rem); }
.translate-y-px { transform: translateY(1px); }
.-translate-y-1 { transform: translateY(-0.25rem); }
.-translate-y-2 { transform: translateY(-0.5rem); }
.-translate-y-3 { transform: translateY(-0.75rem); }
.-translate-y-4 { transform: translateY(-1rem); }
.-translate-y-5 { transform: translateY(-1.25rem); }
.-translate-y-6 { transform: translateY(-1.5rem); }
.-translate-y-8 { transform: translateY(-2rem); }
.-translate-y-10 { transform: translateY(-2.5rem); }
.-translate-y-12 { transform: translateY(-3rem); }
.-translate-y-16 { transform: translateY(-4rem); }
.-translate-y-20 { transform: translateY(-5rem); }
.-translate-y-24 { transform: translateY(-6rem); }
.-translate-y-32 { transform: translateY(-8rem); }
.-translate-y-48 { transform: translateY(-12rem); }
.-translate-y-64 { transform: translateY(-16rem); }
.-translate-y-px { transform: translateY(-1px); }
.rotate-0 { transform: rotate(0deg); }
.rotate-1 { transform: rotate(1deg); }
.rotate-2 { transform: rotate(2deg); }
.rotate-3 { transform: rotate(3deg); }
.rotate-6 { transform: rotate(6deg); }
.rotate-12 { transform: rotate(12deg); }
.rotate-45 { transform: rotate(45deg); }
.rotate-90 { transform: rotate(90deg); }
.rotate-180 { transform: rotate(180deg); }
.-rotate-180 { transform: rotate(-180deg); }
.-rotate-90 { transform: rotate(-90deg); }
.-rotate-45 { transform: rotate(-45deg); }
.-rotate-12 { transform: rotate(-12deg); }
.-rotate-6 { transform: rotate(-6deg); }
.-rotate-3 { transform: rotate(-3deg); }
.-rotate-2 { transform: rotate(-2deg); }
.-rotate-1 { transform: rotate(-1deg); }
.scale-0 { transform: scale(0); }
.scale-50 { transform: scale(0.5); }
.scale-75 { transform: scale(0.75); }
.scale-90 { transform: scale(0.9); }
.scale-95 { transform: scale(0.95); }
.scale-100 { transform: scale(1); }
.scale-105 { transform: scale(1.05); }
.scale-110 { transform: scale(1.1); }
.scale-125 { transform: scale(1.25); }
.scale-150 { transform: scale(1.5); }
.scale-x-0 { transform: scaleX(0); }
.scale-x-50 { transform: scaleX(0.5); }
.scale-x-75 { transform: scaleX(0.75); }
.scale-x-90 { transform: scaleX(0.9); }
.scale-x-95 { transform: scaleX(0.95); }
.scale-x-100 { transform: scaleX(1); }
.scale-x-105 { transform: scaleX(1.05); }
.scale-x-110 { transform: scaleX(1.1); }
.scale-x-125 { transform: scaleX(1.25); }
.scale-x-150 { transform: scaleX(1.5); }
.scale-y-0 { transform: scaleY(0); }
.scale-y-50 { transform: scaleY(0.5); }
.scale-y-75 { transform: scaleY(0.75); }
.scale-y-90 { transform: scaleY(0.9); }
.scale-y-95 { transform: scaleY(0.95); }
.scale-y-100 { transform: scaleY(1); }
.scale-y-105 { transform: scaleY(1.05); }
.scale-y-110 { transform: scaleY(1.1); }
.scale-y-125 { transform: scaleY(1.25); }
.scale-y-150 { transform: scaleY(1.5); }