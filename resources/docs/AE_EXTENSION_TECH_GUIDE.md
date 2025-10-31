# AE 扩展维护与重构技术指南

- 适用范围：`apps/eagle2ae_web` 的 AE 扩展（CEP + JSX）
- 目标：在不影响现有功能与加载机制前提下，提升可维护性、可测试性与扩展性
- 重点：`main.js` 解耦重构；“检测多合成并提示选择”的逻辑与接口约定

## 目录
- 概述
- 架构与关键文件
- 多合成检测与选择流程
- 重构 main.js 方案
- 模块分层设计
- 迁移计划（Phase 1–5）
- 接口契约与数据模型
- 编码与日志规范
- 测试与验证清单
- 风险与回滚策略
- 运行与自检
- 附录：文件与函数索引

---

## 概述
AE 扩展由前端 CEP 面板与 JSX Host 脚本协作完成。当前 `public\\extensions\\ae\\js\\main.js` 承载大量业务与 UI 逻辑，存在高耦合、难以维护的问题。本指南提供一套分层与渐进迁移方案，确保在不改变外部使用方式的前提下，完成模块化重构。

## 架构与关键文件
- 前端入口与耦合文件：
  - `apps\\eagle2ae_web\\public\\extensions\\ae\\js\\main.js`
- 前端服务层：
  - `apps\\eagle2ae_web\\public\\extensions\\ae\\js\\services\\FileHandler.js`
  - `apps\\eagle2ae_web\\public\\extensions\\ae\\js\\services\\ProjectStatusChecker.js`
- JSX Host 脚本（与 AE 交互）：
  - `apps\\eagle2ae_web\\public\\extensions\\ae\\jsx\\hostscript.jsx`
  - `apps\\eagle2ae_web\\public\\extensions\\ae\\jsx\\dialog-warning.jsx`
- 文案与设置：
  - `apps\\eagle2ae_web\\public\\extensions\\ae\\js\\i18n.js`
  - `apps\\eagle2ae_web\\public\\extensions\\ae\\js\\ImportSettings.js`

## 多合成检测与选择流程
- 项目扫描与标记：
  - `hostscript.jsx:getProjectInfo` 收集项目信息与全部合成，当存在多个合成且无活动合成时，标记需用户选择。
- 前端触发选择对话：
  - 前端检测到需选择后，调用 `hostscript.jsx:handleCompositionDialog`，由 `dialog-warning.jsx:showCompositionSelectDialog` 展示对话框。
- 用户选择与应用：
  - 用户选择目标合成后设置为 `app.project.activeItem`，之后导入将以活动合成为目标。
- 导入行为：
  - `hostscript.jsx:importFilesWithSettings` 在 `settings.addToComposition` 为 `true` 时，将导入素材作为图层加入活动合成；否则仅导入到项目。

## 重构 main.js 方案
- 设计目标：
  - 保持外部可见 API 不变；尽量不修改其他文件对 `main.js` 的调用。
  - 引入命名空间与模块化组织，降低全局符号污染与耦合。
- 技术策略：
  - 使用 `window.E2A` 顶级命名空间，子命名空间如 `E2A.utils`、`E2A.services`、`E2A.ui`。
  - 沿用现有 `<script>` 加载顺序，确保依赖先后；`main.js` 仅做入口组装。

## 模块分层设计
- `js/utils/`：
  - 提供纯函数与工具（路径/文件名处理、类型判断、数组操作、序列检测等）。无副作用、无外部依赖。
- `js/services/`：
  - 业务服务（剪贴板、拖拽、AE 桥接、项目状态、文件处理）。封装宿主交互与数据流。
- `js/ui/`：
  - UI 组件与对话管理（面板提示、选择弹窗、Summary 渲染）。从 `i18n` 获取文案。

## 迁移计划（Phase 1–5）
- Phase 1：提取纯工具函数
  - 从 `main.js` 提炼与 UI/AE 无关逻辑至 `js/utils/*`，保留适配入口（API 兼容）。
- Phase 2：服务层拆分
  - 将剪贴板、拖拽、AE Host 桥接（如 `evalScript` 封装）、项目状态检查拆分至 `js/services/*`；与现有 `FileHandler.js`、`ProjectStatusChecker.js` 保持接口契约。
- Phase 3：UI 层拆分
  - 提取对话框与面板渲染到 `js/ui/*`，避免业务逻辑掺杂。
- Phase 4：入口清理
  - `main.js` 仅做初始化（注册事件、绑定 UI、组装服务调用），禁止新增业务逻辑。
- Phase 5：回归与验证
  - 全量功能回归：剪贴板导入、拖拽导入、合成选择、预合成、图层放置、序列/文件夹导入。

## 接口契约与数据模型
- AE 交互（JSX）：
  - `getProjectInfo()`：返回项目状态、合成列表、活动合成信息与 `needsSelection` 标记。
  - `showCompositionSelectDialog()`：展示合成选择弹窗，返回用户选择。
  - `importFilesWithSettings(data, settings)`：根据设置导入并可加入活动合成。
  - `setActiveComposition(compIdOrName)`：程序化设置活动合成。
- 前端服务（JS）：
  - `ProjectStatusChecker.checkProjectStatus()`：获取项目状态并提示必要的对话。
  - `FileHandler.handleImportRequest(files, settings)`：处理导入时的状态检查与调用 JSX 导入。
- 数据约定：
  - `ImportSettings`：`{ mode, addToComposition, precompose, placement, ... }`
  - 合成对象：`{ id, name, width, height, duration, frameRate }`；活动合成为 `activeItem`。

## 编码与日志规范
- 单一职责：模块仅承担明确功能，不掺杂 UI 与业务调用。
- 纯函数：`utils/*` 保证无副作用与外部依赖。
- 命名规则：动词开头（如 `parseFileName`、`detectSequences`），服务以资源命名（如 `ClipboardService`、`AEBridge`）。
- 错误处理：跨进程/宿主交互处统一捕获与用户可读错误提示；关键路径最小化日志但可定位问题；避免输出敏感路径与隐私信息。
- 安全：禁止记录密钥或敏感信息；避免写入仓库。

## 测试与验证清单
- 单元测试（逻辑层）：
  - `utils/*` 用例：路径解析、序列检测、文件类型判断。
- 集成测试（服务层）：
  - 模拟 `AEBridge` 与 `evalScript` 调用，验证参数与返回结构。
- 手动回归（UI/宿主）：
  - 场景覆盖：
    - 有/无活动合成、多个合成需选择。
    - `addToComposition` 与 `precompose` 开/关组合。
    - 文件夹与序列导入、单文件导入。

## 风险与回滚策略
- 风险：
  - 加载顺序导致未定义引用；外部模块暗依赖 `main.js` 内部函数；数据结构变更引发序列化不兼容。
- 缓解：
  - 逐步迁移、保留适配层；关键交互加容错；为重大变更设置 Feature Flag。
- 回滚：
  - 保留迁移前 `main.js` 快照；采用文件级回滚；出现阻塞即回滚入口并禁用新模块加载。

## 运行与自检
- 启动命令：
  - `npm run dev --prefix apps\eagle2ae_web`
- 验证项：
  - 打开 CEP 面板进行导入：是否能正确弹出合成选择对话并将素材加入目标合成。
  - 控制台无未捕获错误；所有既有功能按预期运作。

## 附录：文件与函数索引
- 入口与重构目标：
  - `apps\eagle2ae_web\public\extensions\ae\js\main.js`
- Host 交互与合成选择：
  - `apps\eagle2ae_web\public\extensions\ae\jsx\hostscript.jsx#getProjectInfo`
  - `apps\eagle2ae_web\public\extensions\ae\jsx\dialog-warning.jsx#showCompositionSelectDialog`
  - `apps\eagle2ae_web\public\extensions\ae\jsx\hostscript.jsx#handleCompositionDialog`
  - `apps\eagle2ae_web\public\extensions\ae\jsx\hostscript.jsx#importFilesWithSettings`
  - `apps\eagle2ae_web\public\extensions\ae\jsx\hostscript.jsx#setActiveComposition`
- 前端服务：
  - `apps\eagle2ae_web\public\extensions\ae\js\services\FileHandler.js`
  - `apps\eagle2ae_web\public\extensions\ae\js\services\ProjectStatusChecker.js`

---

如需将本指南纳入文档站点（`apps/eagle2ae_docs`），可在 `ae/` 目录下新增 `tech-guide.md` 并引用本文件内容，或直接移动到该目录以参与 VitePress 生成与发布。