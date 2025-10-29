## API参考

### CSS变量

#### 颜色变量
```css
/* 主要颜色 */
--primary-color: #007acc;          /* 主要蓝色 */
--primary-hover: #005a9e;          /* 主要蓝色悬停态 */
--primary-active: #00447c;         /* 主要蓝色激活态 */
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
```

#### 间距变量
```css
/* 间距变量 */
--spacing-xs: 0.25rem;             /* 超小间距: 4px */
--spacing-sm: 0.5rem;              /* 小间距: 8px */
--spacing-md: 1rem;                /* 中间距: 16px */
--spacing-lg: 1.5rem;              /* 大间距: 24px */
--spacing-xl: 2rem;                /* 超大间距: 32px */
--spacing-2xl: 3rem;               /* 超超级大间距: 48px */
```

#### 尺寸变量
```css
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
```

#### 字体变量
```css
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
```

### 类名参考

#### 布局类
```css
/* 容器类 */
.container                    /* 响应式容器 */

/* Flexbox类 */
.d-flex, .d-inline-flex       /* Flex显示 */
.flex-row, .flex-column       /* 主轴方向 */
.justify-start, .justify-end  /* 主轴对齐 */
.align-start, .align-end      /* 交叉轴对齐 */
.flex-grow-1, .flex-shrink-1  /* Flex属性 */

/* Grid类 */
.grid                         /* 网格容器 */
.grid-cols-{n}                /* n列网格 */

/* 间距类 */
.m-{size}, .p-{size}          /* margin/padding */
.mt-{size}, .mb-{size}        /* 上下margin/padding */
.mr-{size}, .ml-{size}        /* 左右margin/padding */
.pt-{size}, .pb-{size}        /* 上下padding */
.pr-{size}, .pl-{size}        /* 左右padding */
```

#### 文本类
```css
/* 文本对齐 */
.text-left, .text-center, .text-right

/* 文本转换 */
.text-lowercase, .text-uppercase, .text-capitalize

/* 字重 */
.font-light, .font-normal, .font-medium, .font-semibold, .font-bold

/* 字体大小 */
.text-xs, .text-sm, .text-md, .text-lg, .text-xl, .text-2xl
```

#### 组件类
```css
/* 按钮类 */
.btn, .btn-primary, .btn-secondary, .btn-success, .btn-warning, .btn-danger
.btn-lg, .btn-sm, .btn-block

/* 表单类 */
.form-control, .form-label, .form-text

/* 卡片类 */
.card, .card-body, .card-header, .card-footer

/* 导航类 */
.navbar, .nav-link, .nav-tabs

/* 徽章类 */
.badge, .badge-primary, .badge-secondary, .badge-success, .badge-warning, .badge-danger, .badge-info

/* 进度条类 */
.progress, .progress-bar, .progress-bar-striped, .progress-bar-animated
```