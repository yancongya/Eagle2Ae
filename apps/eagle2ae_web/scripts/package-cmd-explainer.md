# `package.cmd` 批处理文件工作原理和流程说明

这个批处理文件 (`package.cmd`) 提供了一个方便的入口点，用于在 Windows 环境下双击运行 Node.js 打包脚本 (`scripts/package-extension.js`)。它包含了必要的环境设置、错误检查和用户交互，以确保脚本能够顺利执行并提供反馈。

## 脚本概览

`package.cmd` 的主要目标是：
1.  设置批处理环境，启用延迟环境变量扩展。
2.  将当前工作目录切换到 `.cmd` 文件所在的目录。
3.  检查系统是否安装了 Node.js。
4.  调用 `scripts/package-extension.js` Node.js 脚本来执行实际的打包任务。
5.  在每个关键步骤后进行错误检查，并在出错时暂停并显示错误信息。
6.  在脚本执行完毕后暂停，以便用户查看最终结果。

## 核心命令和流程

1.  **`@echo off`**:
    *   作用: 阻止批处理脚本中的命令本身显示在命令行窗口中，只显示命令的输出。

2.  **`SETLOCAL ENABLEDELAYEDEXPANSION`**:
    *   作用: 启用延迟环境变量扩展。这对于在 `FOR` 循环或 `IF` 语句块内部正确使用 `!` 括起来的变量（如 `!ERRORLEVEL!`）至关重要，可以确保变量在执行时而不是解析时被扩展，从而避免一些批处理脚本中常见的解析错误。

3.  **`echo Batch file started...` & `pause`**:
    *   作用: 在脚本开始时显示一条消息并暂停，允许用户确认脚本已启动。

4.  **切换目录**:
    *   `echo Changing to script directory: %~dp0`: 显示当前脚本所在的目录。
    *   `cd /d "%~dp0"`: 将当前工作目录切换到 `.cmd` 文件所在的目录。`%~dp0` 是一个特殊的批处理变量，它扩展为批处理文件本身的驱动器号和路径。`/d` 选项允许在切换目录时同时切换驱动器。
    *   `echo ERRORLEVEL after cd: !ERRORLEVEL!`: 显示 `cd` 命令执行后的 `ERRORLEVEL` 值。
    *   `if not !ERRORLEVEL! == 0 (...)`: 检查 `cd` 命令是否成功。如果 `ERRORLEVEL` 不为 `0`（表示失败），则显示错误信息，暂停，并退出脚本。

5.  **检查 Node.js 可用性**:
    *   `echo Checking if Node.js is available...`: 提示正在检查 Node.js。
    *   `node -v >nul 2>&1`: 尝试运行 `node -v` 命令来检查 Node.js 是否安装并可执行。
        *   `>nul`: 将标准输出重定向到空设备，不显示版本号。
        *   `2>&1`: 将标准错误重定向到标准输出，这样任何错误信息也会被 `nul` 吞掉。
    *   `echo ERRORLEVEL after node -v: !ERRORLEVEL!`: 显示 `node -v` 命令执行后的 `ERRORLEVEL` 值。
    *   `pause`: 暂停，允许用户查看 `ERRORLEVEL`。
    *   `if not !ERRORLEVEL! == 0 (...)`: 检查 `node -v` 命令是否成功。如果失败，则显示错误信息，暂停，并退出脚本。
    *   `echo Node.js found.`: 如果 Node.js 检查通过，则显示此消息。

6.  **运行打包脚本**:
    *   `echo Running packaging script...`: 提示正在运行 Node.js 脚本。
    *   `call node scripts/package-extension.js`: 调用 Node.js 解释器来执行 `scripts/package-extension.js` 脚本。`call` 命令确保在 Node.js 脚本执行完毕后，批处理脚本会继续执行，而不是直接退出。
    *   `if not !ERRORLEVEL! == 0 (...)`: 检查 Node.js 脚本的执行结果。如果 `ERRORLEVEL` 不为 `0`（表示 Node.js 脚本内部有错误），则显示错误信息，暂停，并退出脚本。

7.  **完成和清理**:
    *   `echo Packaging process completed. Check the dist directory.`: 显示打包完成信息。
    *   `pause`: 暂停，允许用户查看最终的输出信息，然后手动关闭窗口。

## 如何使用

双击 `package.cmd` 文件即可运行。脚本会在关键步骤暂停，以便您查看执行状态和任何潜在的错误信息。
