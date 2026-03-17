# Eagle2Ae 项目上下文

## 项目概述

Eagle2Ae 是一个高性能的 Eagle 与 After Effects 之间的图片传输插件系统，采用 Monorepo 架构。项目包含 Eagle 插件、After Effects 扩展（CEP）、Web 应用和文档站点。

### 核心特性
- **极速连接**：连接延迟优化至300ms以内（99.8%性能提升）
- **智能通知**：Eagle通知系统，连接状态实时反馈
- **资源库监控**：自动检测资源库变化，智能更新大小信息
- **预计算机制**：Eagle启动时预计算资源库大小，AE连接时瞬时响应
- **性能优化**：禁用连接时的阻塞操作，确保流畅体验

### 技术栈
- **前端框架**：Vue 3（Composition API）
- **构建工具**：Vite 5.2.0
- **样式系统**：Tailwind CSS
- **动画库**：GSAP + ScrollTrigger, Lenis（平滑滚动）
- **国际化**：vue-i18n
- **PWA**：vite-plugin-pwa + workbox
- **包管理**：pnpm 10.12.4 + workspaces
- **文档**：VitePress
- **Node.js**：20.x

### 项目架构
```
eagle2ae-monorepo/
├── apps/
│   ├── eagle2ae_web/          # Vue 3 Web 应用
│   └── eagle2ae_docs/         # VitePress 文档站点
├── resources/
│   ├── design/                # 设计资源
│   ├── docs/                  # 技术文档
│   └── reference/             # 参考文件
├── package.json               # 根 package.json（scripts 定义）
├── pnpm-workspace.yaml        # pnpm workspace 配置
└── ...
```

## 构建和运行

### 环境要求
- Node.js 20.x
- pnpm 10.12.4

### 开发命令
```bash
# 安装依赖
pnpm install

# 启动 Web 应用开发
pnpm dev:web
# 或
pnpm --filter web dev

# 启动文档站点开发
pnpm dev:docs
# 或
pnpm --filter eagle2ae_docs dev

# 构建 Web 应用
pnpm build:web
# 或
pnpm --filter web build

# 构建文档站点
pnpm build:docs
# 或
pnpm --filter eagle2ae_docs build

# 打包 AE 扩展（在 apps/eagle2ae_web 目录下）
pnpm package:extension
```

### 应用内脚本
- `pnpm dev` - 启动 Vite 开发服务器
- `pnpm build` - 构建生产版本
- `pnpm preview` - 预览生产构建
- `pnpm package:extension` - 打包 AE 扩展为 ZXP 文件

## 开发约定

### 代码风格
- 使用 Vue 3 Composition API（`<script setup>` 语法）
- TypeScript 风格的代码组织（即使是 JS 项目）
- 组件命名使用 PascalCase（如 `Navbar.vue`）
- 文件夹和工具函数使用 camelCase
- 遵循项目中现有代码的风格和结构

### 目录结构
```
apps/eagle2ae_web/src/
├── assets/          # 静态资源
├── blocks/          # 可复用区块（如 Particles, Aurora）
├── components/      # Vue 组件
├── composables/     # Vue 组合式函数
├── config/          # 配置文件
├── constants/       # 常量定义
├── router/          # 路由配置
├── utils/           # 工具函数
├── views/           # 页面视图
├── App.vue          # 根组件
├── main.js          # 入口文件
├── i18n.js          # 国际化配置
└── style.css        # 全局样式
```

### 关键配置文件
- **vite.config.js** - Vite 构建配置，包含 PWA、预设写入 API 等
- **tailwind.config.js** - Tailwind CSS 配置
- **.vitepress/config.js** - 文档站点配置

### 重要技术实现
1. **PWA 预缓存**：使用 vite-plugin-pwa 预缓存核心 JSON 和静态资源
2. **平滑滚动**：Lenis 与 GSAP ScrollTrigger 同步
3. **暗色模式**：使用 @vueuse/core 的 useDark
4. **自定义光标**：在 utils/CustomCursor.js 中实现
5. **AE 扩展打包**：使用 jsxbin 将 .jsx 转换为 .jsxbin，创建 ZXP 包

### 国际化
- 使用 vue-i18n
- 翻译文件位于 src/i18n.js
- 路由标题基于 i18n key（如 `route.title.home`）

### 性能优化实践
- 按需导入第三方库
- PWA 预缓存和运行时缓存
- 请求空闲时预取配置文件
- GSAP ticker 优化
- Lenis 平滑滚动配置

### Git 提交约定
- 提交消息应清晰简洁，更多关注"为什么"而不是"什么"
- 使用中文提交消息（项目团队使用中文）
- 提交前确保代码质量检查通过

### 测试
- 项目当前未配置自动化测试
- 手动测试通过运行开发服务器和构建验证

## 重要注意事项

### 路径处理
- 始终使用绝对路径进行文件操作
- Vite 配置中使用 `@` 别名指向 `src` 目录
- AE 扩展打包时需处理相对路径

### 端口配置
- 固定使用端口 8080
- 避免端口发现延迟

### 缓存策略
- 30秒缓存避免重复请求
- 30分钟自动检测资源库变化
- PWA 缓存配置在 vite.config.js 中

### 错误处理
- 完善的错误处理和日志系统
- 开发环境抑制 Workbox 警告
- 生产环境启用 PWA 自动更新

### 兼容性
- Eagle: 4.0+
- After Effects: CC 2015+
- 操作系统: Windows 10+ / macOS 10.14+

## 项目特色

### 双协议支持
- HTTP + Eagle 兼容 WebSocket
- 灵活的通信机制

### 智能通知系统
- 连接成功通知
- 计算完成通知
- 变化检测通知

### 预计算机制
- Eagle 启动时后台计算资源库大小
- AE 连接时直接使用预计算结果
- 避免连接时的阻塞操作

### 文档系统
- 使用 VitePress 构建专业文档
- 包含 API、架构、开发指南等
- 多语言支持（中文为主）

## 开发工作流

1. **功能开发**
   - 在 `src/views/` 或 `src/components/` 中创建/修改组件
   - 使用 `src/composables/` 复用逻辑
   - 在 `src/router/` 中配置路由
   - 更新国际化配置

2. **样式调整**
   - 优先使用 Tailwind CSS 类名
   - 复杂动画使用 GSAP
   - 全局样式在 `style.css`

3. **构建验证**
   - 运行 `pnpm build` 检查构建
   - 使用 `pnpm preview` 预览生产版本
   - 检查 `stats.html` 分析包大小

4. **AE 扩展打包**
   - 运行 `pnpm package:extension`
   - 生成的 ZXP 文件在 `dist/` 目录
   - 包含自动版本管理

## 相关资源

- **GitHub**: https://github.com/yancongya/Eagle2Ae.git
- **README**: 项目根目录 README.md
- **技术文档**: `resources/docs/` 目录
- **设计资源**: `resources/design/` 目录
- **参考文件**: `resources/reference/` 目录