# Eagle2Ae 功能待实现清单

## 1. AE 扩展标题动画效果 ✅
- [x] 分析 AE 扩展项目中的标题动画实现原理
  - 悬浮时文本从正常（Eagle2Ae）通过乱码转场变为（Ae2Eagle）
  - 离开时文本通过乱码转场恢复为（Eagle2Ae）
  - Logo 悬浮时有放大交互效果
- [x] 实现乱码转场动画
  - 使用 JavaScript 动态改变文本内容
  - requestAnimationFrame 实现流畅动画
  - 随机字符乱码效果

## 2. Eagle 扩展和网页标题动画复刻 ✅
- [x] 在 Eagle 扩展中实现乱码转场标题动画
  - 路径：`apps/eagle2ae_web/public/extensions/eagle/`
  - 正常状态：Eagle2Ae
  - 悬浮状态：Ae2Eagle（乱码转场）
- [x] 在网页版本中实现相同的标题动画效果
  - 网页导航栏 Navbar.vue 组件
  - 应用乱码转场动画
- [x] 更新多语言文件
  - 将 Eagle2Ae_Eagle 改为 Eagle2Ae
  - 更新中英文翻译

## 3. AE 扩展标题链接功能 ✅
- [x] 为 AE 扩展标题添加点击打开链接功能
  - 在 CEP 环境中使用 CSInterface.openURLInDefaultBrowser()
  - 在网页环境中使用 window.open()
  - 添加环境检测和降级处理
- [x] 参考 Eagle 扩展的实现方式
  - 将标题包裹在 `<a>` 标签中
  - 添加 TITLE_LINK_URL 配置
  - 实现点击事件处理

## 4. 语言切换过渡动画优化 ✅
- [x] 研究网页使用 View Transitions API 的实现
  - 网页主应用已使用 View Transitions API
  - 通过 `lang-changed` 事件触发
- [x] 实现跨 iframe 的语言同步
  - 预览页面监听语言变化并通过 postMessage 发送到 iframe
  - 扩展监听 LANGUAGE_UPDATE 消息
- [x] 在扩展中应用 View Transitions
  - AE 扩展：添加消息监听器和 View Transitions 支持
  - Eagle 扩展：增强现有监听器，添加 View Transitions
  - 使用 300ms 过渡动画实现平滑切换
- [x] 创建工具函数
  - `iframeLanguageSync.js` 用于统一管理 iframe 语言同步

## 5. 主题切换圆形蒙版动画 ✅
- [x] 在预览页面中监听主题变化
  - AE_Preview.vue 和 Eagle_Preview.vue
  - 通过 postMessage 向 iframe 发送 THEME_UPDATE 消息
- [x] 在扩展中实现圆形蒙版动画
  - AE 扩展：监听 THEME_UPDATE 消息
  - Eagle 扩展：监听 THEME_UPDATE 消息
  - 使用 View Transitions API 的 clipPath 动画
  - 520ms 动画时长，从右上角扩散
- [x] 与主应用保持一致的动画效果
  - 相同的动画时长和缓动函数
  - 相同的圆形扩散效果

## 6. 主题切换动画同步优化 ✅
- [x] 创建主题同步工具
  - `iframeThemeSync.js` 用于统一管理 iframe 主题同步
  - 支持传递点击坐标实现同步动画
- [x] 优化 Navbar 主题切换
  - 广播 `themeToggle` 自定义事件
  - 包含点击坐标和新主题信息
- [x] 预览页面监听主题切换事件
  - AE_Preview.vue 和 Eagle_Preview.vue
  - 监听 `themeToggle` 事件并同步到 iframe
  - 传递点击坐标实现同步动画起点
- [x] 扩展接收点击坐标
  - AE 和 Eagle 扩展接收 clickPosition 参数
  - 使用传递的坐标作为圆形蒙版动画起点
  - 如果没有坐标则使用默认位置（右上角）
- [x] 添加 prefers-reduced-motion 支持
  - 检测用户的动画偏好设置
  - 在不支持或用户禁用动画时降级处理
- [x] 同步主题切换按钮图标状态
  - AE 扩展：更新主题按钮图标（☀️/🌙）和 title
  - 保存主题状态到 localStorage
  - 确保按钮状态与实际主题一致

## 7. AE 扩展按钮和复选框文本省略优化 ✅
- [x] 优化主面板导入模式按钮
  - 为 `.mode-button` 添加 `min-width: 0`
  - 为 `.mode-text` 添加完整文本省略样式
  - 防止 "Direct Import"、"Project Adjacent Copy"、"Custom Folder" 换行
- [x] 优化主面板导入行为按钮
  - 为 `.import-behavior-button` 添加 `min-width: 0`
  - 为 `.behavior-text` 添加文本省略样式
  - 防止 "Don't Import to Comp"、"Current Time"、"Timeline Start" 换行
- [x] 优化高级设置导入模式按钮
  - `.import-mode-option` 已有 `min-width: 0`
  - `.import-mode-option span` 已有文本省略样式
- [x] 优化高级设置导入行为按钮
  - 为 `.import-behavior-option` 添加 `min-width: 0`
  - 为 `.import-behavior-option span` 添加文本省略样式
- [x] 优化图层操作按钮
  - 为 `.layer-operation-button` 添加 `min-width: 0`
  - 为 `.operation-text` 添加文本省略样式
  - 防止 "Detect Layers"、"Export Layers"、"Export to Eagle" 换行
- [x] 优化预设管理按钮
  - 为 `.preset-button` 添加 `min-width: 0` 和文本省略样式
- [x] 优化通用按钮样式
  - 为 `.btn` 基础类添加 `min-width: 0`
- [x] 优化导出路径设置复选框
  - 移除 `.checkbox-group-horizontal` 的 `flex-wrap: wrap`，改为 `nowrap`
  - 为 `.checkbox-label` 添加文本省略样式
  - 移除超小屏幕的垂直排列响应式规则
  - 确保四个复选框在小屏幕下保持同一行，文本省略而不换行
- [x] 优化通信设置面板
  - 将"通信设置"改为"通信端口设置"
  - 移除"通信端口"标签文本，直接显示输入框
  - 更新中英文多语言文件

## 8. AE 扩展标题栏响应式优化 ✅
- [x] 优化标题栏布局
  - 将 `.header-actions` 的 `flex-shrink` 从 0 改为 1，允许按钮组收缩
  - 将 `.title` 的 `flex` 从 `1 1 240px` 改为 `1 1 auto`，移除最小宽度限制
  - 将 `.title` 的 `overflow` 从 `visible` 改为 `hidden`，防止溢出
- [x] 添加响应式断点
  - 480px 以下：减小间距和按钮尺寸
  - 360px 以下（极限尺寸）：隐藏标题文本，只显示 logo 和按钮组
  - 确保标题栏内容始终在容器内，不会溢出
- [x] 优化标题栏间距
  - 将标题栏和内容区域的间距从 8px 减小到 4px
  - 修改 `adjustContentOffset` 函数中的 spacing 参数
  - 实现动态靠近效果