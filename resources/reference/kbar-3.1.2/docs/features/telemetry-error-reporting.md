# 功能: 遥测与错误报告

KBar 3 集成了遥测和错误报告功能，旨在收集匿名使用数据和错误信息，以帮助开发者了解用户行为、识别问题并持续改进产品。这些功能主要由 Node.js 后台服务 (`server.js`) 管理。

## 遥测 (Telemetry)

KBar 使用 **Google Analytics (GA)** 收集匿名使用数据。

### 收集的数据 (推测)

*   **事件 (Events)**: 例如按钮点击、功能使用、面板打开/关闭等。
*   **页面视图 (Page Views)**: 面板（工具栏、配置面板）的打开次数。
*   **用户 ID**: 匿名化的用户标识符，用于区分独立用户。
*   **GA 启用状态**: 用户是否同意启用 GA 跟踪。

### 实现细节

*   在 `server.js` 中观察到与 `window.ga` 相关的代码，表明它通过 Google Analytics API 发送数据。
*   `KBarService` 中的 `trackevent(category, action, label, value)` 方法用于发送自定义事件。
*   `KBarService` 中的 `setPage(pageName)` 方法用于发送页面视图事件。
*   用户可以通过配置面板选择是否启用 GA 跟踪，其状态通过 `host.prefs.getPreference("ga.enabled")` 进行管理。

## 错误报告 (Error Reporting)

KBar 使用 **Sentry (通过 Raven.js)** 收集运行时错误和异常。

### 收集的数据 (推测)

*   **JavaScript 运行时错误**: 在前端面板 (`toolbar.js`, `config.js`) 或 Node.js 后台服务 (`server.js`) 中发生的未捕获异常。
*   **面包屑 (Breadcrumbs)**: 错误发生前的一系列用户操作或系统事件，有助于重现问题。
*   **环境信息**: 操作系统、AE 版本、KBar 版本等。

### 实现细节

*   在 `server.js` 中观察到与 `Raven` 相关的代码，表明它集成了 Sentry 客户端。
*   `KBarService` 中的 `exception(error, isFatal)` 方法用于手动报告异常。
*   当发生错误时，Sentry 会捕获错误堆栈、上下文信息和面包屑，并将其发送到 Sentry 服务器。
*   面包屑功能 (`Raven.captureBreadcrumb`) 用于记录关键操作，例如 `trackevent` 也会记录面包屑。

## 用户隐私

*   遥测和错误报告功能通常是匿名的，不收集个人身份信息。
*   用户应在首次启动时被告知这些功能，并有机会选择启用或禁用。
*   GA 启用状态 (`ga.enabled`) 存储在宿主偏好设置中，用户可以随时更改。
