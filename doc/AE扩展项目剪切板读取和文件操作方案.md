# AE扩展项目剪切板读取和文件操作方案

## 方案思考概述

您的项目是基于Adobe CEP（Common Extensibility Platform）的After Effects（AE）扩展，使用Node.js作为后端，并已与Eagle软件通过插件建立通信。核心需求是：读取系统剪切板内容（假设剪切板中是文件路径或其他可解析的内容），将对应文件移动到指定文件夹，然后导入到AE项目中。但您遇到了权限问题，主要集中在剪切板读取和文件操作/导入上。

我查看了Adobe CEP官方文档（如CEP HTML Extension Cookbook for versions 10-12）、ExtendScript参考资料（AE脚本指南）、相关社区讨论（如Adobe Community forums）和GitHub仓库。CEP环境基于Chromium + Node.js，但有安全沙箱限制：文件系统访问限于用户目录（如`~/Documents`），剪切板访问不直接支持标准浏览器API（如`navigator.clipboard`），因为CEP的Chromium版本弃用了`document.execCommand('copy/paste')`，且需要`secure context`或额外命令行参数。Node.js集成允许文件操作，但需显式启用，且额外模块安装受限（只能用内置或纯JS模块）。

EcoPaste项目（<mcurl name="EcoPaste" url="https://github.com/EcoPasteHub/EcoPaste"></mcurl>）是一个跨平台剪切板管理工具，后端用Rust + Tauri v2，支持文本/图像/文件类型，本地存储数据。但它不兼容CEP的Node.js环境（Rust无法直接集成），且CEP不允许外部二进制执行。您可以借鉴其想法（如本地存储剪切板历史），但需从零用Node.js/JS重实现，无法直接借用代码。

下面是一个可行的方案：结合CEP的Node.js上下文处理剪切板读取和文件移动，然后通过CSInterface调用ExtendScript导入AE。重点解决权限：通过`manifest.xml`启用Node.js，使用系统命令绕过浏览器剪切板限制。如果权限仍有问题，可通过注册表/偏好设置放宽CEP调试模式。
## 步骤1: 配置CEP扩展以启用Node.js和放宽权限

### 为什么需要？

CEP默认禁用Node.js完整上下文，文件/进程操作需启用。权限问题往往因沙箱：Node.js的`fs`/`child_process`只能访问用户级目录，且需调试模式允许跨域/不安全操作。

### 如何实现（参考CEP Cookbook和Adobe Community）：

在`manifest.xml`中添加：

```xml
<CEFCommandLine>
  <Parameter>--enable-nodejs</Parameter>
  <Parameter>--mixed-context</Parameter>  <!-- 允许浏览器和Node.js上下文混合，方便fs访问 -->
  <Parameter>--unsafely-treat-insecure-origin-as-secure=http://localhost</Parameter>  <!-- 使localhost视为secure，辅助任何残留的clipboard API需求 -->
</CEFCommandLine>
```

启用CEP调试模式（绕过部分权限限制）：

*   **Windows**: 注册表编辑 `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`（或您的CEP版本），添加字符串键 `PlayerDebugMode` 值 "1"。
*   **macOS**: `defaults write com.adobe.CSXS.11 PlayerDebugMode -string "1"`（在Terminal运行）。

重启AE，确保扩展加载。测试：用`console.log(require('fs'))` 检查Node.js可用。

如果权限仍报错，检查AE日志（Console.app on macOS或Event Viewer on Windows），常见是路径超出沙箱（如系统根目录）。
## 步骤2: 读取剪切板内容（用Node.js绕过浏览器限制）

### 问题分析：

标准JS clipboard API（`navigator.clipboard.readText()`）在CEP中需用户交互且常失败（非`secure context`或弃用`execCommand`）。ExtendScript无直接clipboard访问（参考ExtendScript指南，只能间接如临时文件）。

### 方案：

用Node.js的`child_process`模块执行系统命令读取剪切板。这跨平台、可靠，且避开浏览器权限。CEP允许`child_process`（参考社区下载文件示例）。

### 实现代码（在您的Node.js后端或CEP JS文件中）：

```javascript
const child_process = require('child_process');
const os = require('os');

function readClipboard(callback) {
  let command;
  if (os.platform() === 'win32') {
    command = 'powershell.exe -command "Get-Clipboard"';
  } else if (os.platform() === 'darwin') {
    command = 'pbpaste';
  } else { // Linux, 假设xclip安装
    command = 'xclip -o -selection clipboard';
  }
  
  child_process.exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Clipboard read error:', error);
      callback(null);
      return;
    }
    const clipboardContent = stdout.trim(); // 假设是文件路径，如 "/path/to/file.jpg"
    callback(clipboardContent);
  });
}

// 使用示例
readClipboard((content) => {
  if (content) {
    // 继续文件移动和导入
    moveAndImportFile(content, '/target/folder/path');
  }
});
```

### 注意：

*   Linux需用户安装`xclip`（或用`xsel`），但既然您的项目已与Eagle通信，可假设环境。
*   如果`child_process`权限不足，确认调试模式启用。测试：在CEP控制台运行简单exec如`'echo hello'`。
*   如果剪切板是文件（非路径），需解析（如用`os.tmpdir()`保存临时文件），但假设您的场景是路径。


## 步骤3: 文件操作（移动到指定文件夹）

### 参考：

CEP Node.js支持`fs`模块（参考CEP Cookbook的"Node Context"部分），允许读写用户目录。

### 实现代码：

```javascript
const fs = require('fs');
const path = require('path');

function moveAndImportFile(sourcePath, targetFolder) {
  if (!fs.existsSync(sourcePath)) {
    console.error('File not found:', sourcePath);
    return;
  }
  
  const fileName = path.basename(sourcePath);
  const targetPath = path.join(targetFolder, fileName);
  
  try {
    fs.renameSync(sourcePath, targetPath); // 或fs.copyFileSync如果不想删除原文件
    console.log('File moved to:', targetPath);
    // 继续导入到AE
    importToAE(targetPath);
  } catch (error) {
    console.error('File move error:', error); // 权限问题？确保targetFolder在~/Documents等允许路径
  }
}
```

### 权限解决：

目标文件夹设在用户文档目录（如`process.env.HOME + '/Documents/AE_Imports'`）。如果跨驱动器移动，用`copy+delete`代替`rename`。


步骤4: ## 步骤4: 导入文件到AE（用ExtendScript）

### 参考：

AE ExtendScript支持`app.project.importFile()`（参考AE Scripting Guide的Project对象）。

### 实现：

用`CSInterface.evalScript()`从CEP调用ExtendScript。

```javascript
const CSInterface = require('./CSInterface'); // 假设您已include CSInterface.js

function importToAE(filePath) {
  const script = `
    var importOptions = new ImportOptions(new File("${filePath.replace(/\\/g, '\\\\')}"));
    app.project.importFile(importOptions);
  `;
  
  const cs = new CSInterface();
  cs.evalScript(script, (result) => {
    if (result === 'EvalScript error.') {
      console.error('Import failed');
    }
    else {
      console.log('File imported to AE project');
    }
  });
}
```

### 注意：

*   路径需转义（Windows反斜杠）。
*   如果导入特定类型（如图像序列），调整`ImportOptions.asSequence = true`。 '\\\\')}"));
    app.project.importFile(importOptions);
  `;
  
  const cs = new CSInterface();
  cs.evalScript(script, (result) => {
    if (result === 'EvalScript error.') {
      console.error('Import failed');
    } else {
      console.log('File imported to AE project');
    }
  });
}
```

## 潜在问题与优化

*   **权限测试**：先单独测试每个部分（如读剪切板、移动文件）。如果`child_process`失败，fallback到浏览器hack：创建创建隐藏`<textarea>`，focus，`document.execCommand('paste')`，读value（但CEP 11+可能无效，需`--enable-blink-features=ClipboardCustomFormats`参数）。
*   **跨平台兼容**：用`os.platform()`检测，处理差异。
*   **可靠仓库借用**：
    *   <mcurl name="Adobe-CEP/Samples" url="https://github.com/Adobe-CEP/Samples"></mcurl>：有Node.js `fs`示例（如文件下载/读写），可借用PProPanel示例的`file handling`代码。
    *   <mcurl name="extend-chrome/clipboard" url="https://github.com/extend-chrome/clipboard"></mcurl>：纯JS clipboard库，用`execCommand`模拟读写，可作为fallback集成到CEP（无native依赖）。
    *   无直接CEP clipboard仓库，但社区帖子（如Adobe forums on clipboard API）有代码片段，可复制。

*   **与Eagle集成**：既然已有通信，可让Eagle插件处理剪切板/文件移动（Eagle有文件管理API），然后CEP只负责导入，减少权限问题。
*   **调试**：用CEP控制台（Chrome DevTools: `localhost:port/debug`）监控错误。更新到最新CEP版本（2025年AE支持CEP 12+）可能改善clipboard支持。
