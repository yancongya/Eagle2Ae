# 功能: 工具栏导入与导出 (.kzip)

KBar 提供了强大的工具栏导入和导出功能，允许用户轻松备份、分享和迁移他们的自定义工具栏配置。这些功能通过 `.kzip` 格式的归档文件实现。

## .kzip 文件格式

`.kzip` 文件是一种自定义的 ZIP 归档格式，它包含了 KBar 工具栏的所有配置数据，例如：

*   `manifest.json`: 描述工具栏的元数据和版本信息。
*   `settings.json`: 包含所有按钮的详细配置、布局和外观设置。
*   `icons/`: 任何自定义图标文件。
*   `scripts/`: 任何内联脚本或链接的外部脚本文件。

## 导入工具栏

### 流程概述

1.  用户在配置面板中选择导入 `.kzip` 文件。
2.  前端 JavaScript (`config.js`) 获取用户选择的 `.kzip` 文件路径。
3.  `config.js` 通过 `KBarService.importToolbarFromKZip(zipFilePath, destinationPath)` 方法发起导入请求。
4.  `KBarService` 将请求转发给 Node.js 后台服务 (`server.js`)。
5.  `server.js` 使用 Node.js 的 `archiver` 模块解压 `.kzip` 文件到临时目录。
6.  `server.js` 读取解压后的 `manifest.json` 和 `settings.json`，验证其格式和版本。
7.  `server.js` 将新的工具栏配置合并到现有配置中，并可能将相关文件（如图标、脚本）复制到 KBar 的配置目录。
8.  导入完成后，`server.js` 将结果返回给 `KBarService`，再由 `KBarService` 返回给前端。
9.  前端更新 UI，并可能广播 CEP 事件通知其他工具栏实例刷新。

### 关键 JavaScript 函数

*   `KBarService.importToolbarFromKZip(zipFilePath, destinationPath)`: 前端调用的主要导入方法。
*   `KBarService.getRawManifestFromKZip(zipFilePath)`: 用于在导入前预览 `.kzip` 文件的清单信息。
*   Node.js `archiver` 模块: 在 `server.js` 中用于处理 ZIP 文件的解压。
*   Node.js `fs` 模块: 在 `server.js` 中用于文件读写和目录操作。

## 导出工具栏

### 流程概述

1.  用户在配置面板中选择导出当前工具栏配置。
2.  前端 JavaScript (`config.js`) 获取当前工具栏的配置数据。
3.  `config.js` 通过 `KBarService.exportToolbarToKZip(toolbarConfig, outputPath)` 方法发起导出请求。
4.  `KBarService` 将请求转发给 Node.js 后台服务 (`server.js`)。
5.  `server.js` 根据提供的工具栏配置，收集所有相关文件（设置、图标、脚本）。
6.  `server.js` 使用 Node.js 的 `archiver` 模块将这些文件打包成一个新的 `.kzip` 文件。
7.  导出完成后，`server.js` 将结果返回给 `KBarService`，再由 `KBarService` 返回给前端。

### 关键 JavaScript 函数

*   `KBarService.exportToolbarToKZip(toolbarConfig, outputPath)`: 前端调用的主要导出方法。
*   Node.js `archiver` 模块: 在 `server.js` 中用于创建 ZIP 归档。
*   Node.js `fs` 模块: 在 `server.js` 中用于文件读写和目录操作。
