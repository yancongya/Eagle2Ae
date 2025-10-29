# `package-extension.js` 脚本工作原理和流程说明

这个 Node.js 脚本 (`package-extension.js`) 负责将 Adobe After Effects 扩展打包成多种分发格式，并进行代码混淆、文件组织和清理。

## 脚本概览

脚本的主要目标是：
1.  将 `.jsx` 源代码文件混淆为 `.jsxbin` 二进制文件，以保护知识产权。
2.  根据用户需求，生成 `.zxp` 格式的自动安装包。
3.  生成一个包含扩展内容的文件夹，作为手动安装包。
4.  将 `.zxp` 包、手动安装文件夹、多语言 `README` 文件以及 ZXPInstaller 安装程序打包到一个最终的总 `zip` 分发包中。
5.  在整个过程中，管理临时文件和目录，并在完成后进行清理。

## 核心功能模块

### 1. `recursiveCopyAndProcess(source, destination)` 函数

*   **作用**: 递归地从 `source` 目录复制文件到 `destination` 目录，并在复制过程中处理 `.jsx` 文件。
*   **流程**:
    *   检查当前文件/目录是否在 `excludeList` 中，如果在则跳过。
    *   如果是目录，则在 `destination` 创建对应目录，并递归调用自身处理子项。
    *   如果是文件：
        *   如果文件扩展名为 `.jsx`，则使用 `npx jsxbin` 命令将其混淆为 `.jsxbin` 文件，并保存到 `destination` 路径（文件名变为 `.jsxbin`）。
        *   否则，直接将文件复制到 `destination`。
*   **依赖**: `fs` (Node.js 内置), `execSync` (Node.js 内置), `npx jsxbin` (外部工具)。

### 2. `createZip(sourceDir, outputPath, archiveName)` 函数

*   **作用**: 将 `sourceDir` 目录的内容压缩成一个 `zip` 文件，并保存到 `outputPath`。
*   **流程**:
    *   创建一个写入流 (`fs.createWriteStream`) 指向 `outputPath`。
    *   初始化 `archiver` 实例，使用 `zip` 格式和最高压缩级别 (zlib: 9)。
    *   将 `archiver` 的输出管道连接到文件写入流。
    *   使用 `archive.directory(sourceDir, false)` 将 `sourceDir` 的所有内容（不包括 `sourceDir` 本身）添加到压缩包中。
    *   等待压缩完成 (`archive.finalize()`)。
*   **依赖**: `fs` (Node.js 内置), `archiver` (外部库)。

## `packageExtension()` 主函数流程

1.  **初始化和清理**:
    *   定义各种路径常量 (`extensionSourcePath`, `tempBuildPath`, `distPath` 等)。
    *   定义 `excludeList`，列出在复制扩展源文件时需要排除的文件和文件夹。
    *   在 `try` 块开始时，清理旧的 `tempBuildPath` 目录（如果存在），并创建新的 `tempBuildPath` 和 `distPath`。

2.  **版本号读取**: 
    *   从 `public/extensions/ae/version.json` 文件中读取扩展的版本号。如果文件不存在或读取失败，则使用默认版本 `1.0.0`。

3.  **处理扩展源文件**: 
    *   调用 `recursiveCopyAndProcess` 函数，将 `extensionSourcePath` (即 `public/extensions/ae`) 中的文件复制到 `tempBuildPath`。在此过程中，`.jsx` 文件会被转换为 `.jsxbin`，并排除 `excludeList` 中的项。

4.  **动态修改 `manifest.xml`**: 
    *   读取 `tempBuildPath/CSXS/manifest.xml` 的内容。
    *   使用正则表达式将所有 `<ScriptPath>./jsx/xxx.jsx</ScriptPath>` 替换为 `<ScriptPath>./jsx/xxx.jsxbin</ScriptPath>`。
    *   将修改后的内容写回 `tempBuildPath/CSXS/manifest.xml`。

5.  **创建中间打包文件**: 
    *   **ZXP 包**: 调用 `createZip` 函数，将 `tempBuildPath` 的内容压缩成 `Eagle2Ae-Ae__vX.X.X.zxp` 文件，并保存到 `dist` 目录。
    *   **手动安装文件夹**: 使用 `fsExtra.copySync` 将 `tempBuildPath` 的内容复制到一个名为 `Eagle2Ae-Ae_vX.X.X` 的文件夹中，该文件夹也位于 `dist` 目录。

6.  **创建最终的总分发包**: 
    *   定义 `finalContentsFolderName` (例如 `Eagle2Ae-Ae_vX.X.X`) 和 `finalContentsTempPath` (例如 `dist/final_staging_temp`)。
    *   创建 `finalContentsTempPath` 目录。
    *   将之前创建的 `.zxp` 文件、手动安装文件夹、多语言 `README` 文件 (`public/extensions/ae/README.md`, `public/extensions/ae/README_en.md`) 以及 ZXPInstaller 安装程序 (`.dmg`, `.exe`) **复制**到 `finalContentsTempPath` 中。
    *   使用 `archiver` 创建最终的 `Eagle2AE_Installer_vX.X.X.zip` 文件。
    *   使用 `finalArchive.glob('**/*', { cwd: finalContentsTempPath, prefix: finalContentsFolderName })` 将 `finalContentsTempPath` 的内容添加到最终的 `zip` 包中，并确保它们位于 `finalContentsFolderName` 这个子目录下。

7.  **错误处理**: 
    *   `try...catch` 块捕获执行过程中可能发生的任何错误，并打印错误信息，然后退出进程。

8.  **最终清理 (`finally` 块)**: 
    *   无论脚本成功与否，`finally` 块都会执行。
    *   它负责清理所有创建的临时目录和中间文件，包括 `tempBuildPath`、手动安装文件夹 (`manualInstallFolderPath`)、`.zxp` 文件 (`zxpPath`) 和 `finalContentsTempPath`。这是通过在 `finally` 块中重新计算这些路径并调用 `fsExtra.removeSync` 来实现的，以确保即使在 `try` 块中途发生错误，清理也能进行。

## 依赖

*   `child_process` (Node.js 内置): 用于执行命令行命令 (如 `npx jsxbin`)。
*   `fs` (Node.js 内置): 用于基本的文件系统操作。
*   `fs-extra` (外部库): 提供了更高级的文件系统操作，如 `removeSync`, `mkdirSync`, `copySync`。
*   `path` (Node.js 内置): 用于处理文件路径。
*   `archiver` (外部库): 用于创建 `zip` 压缩包。
*   `glob` (外部库): 用于查找匹配特定模式的文件 (虽然在当前版本中 `recursiveCopyAndProcess` 已经替换了 `glob` 的部分功能，但 `glob` 仍然是项目依赖)。

## 如何运行

通过 `package.cmd` 批处理文件或直接使用 `node scripts/package-extension.js` 命令运行。
