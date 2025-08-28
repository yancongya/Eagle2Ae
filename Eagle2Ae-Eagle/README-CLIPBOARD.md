# Eagle2Ae 剪切板功能说明

## 功能概述

Eagle2Ae 插件现在支持剪切板文件监控功能，可以自动检测剪切板中的文件并导入到After Effects中。这个功能让您可以从任何应用程序复制文件，然后自动导入到AE项目中。

## 主要特性

### 🔍 自动监控
- **实时监控**：每秒检查剪切板内容变化
- **智能检测**：自动识别文件路径和支持的文件类型
- **后台运行**：无需手动操作，自动处理剪切板文件

### 📁 文件类型支持
支持以下文件类型的自动导入：

**图像文件**
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tiff`, `.tga`, `.webp`

**视频文件**
- `.mp4`, `.mov`, `.avi`, `.mkv`, `.wmv`, `.flv`, `.webm`

**音频文件**
- `.mp3`, `.wav`, `.aac`, `.flac`, `.ogg`

**设计文件**
- `.psd`, `.ai`, `.eps`, `.svg`

**After Effects文件**
- `.aep`, `.aet`

### ⚙️ 灵活配置
- **监控开关**：可以随时启动/停止剪切板监控
- **检查间隔**：可调整剪切板检查频率（500ms-10s）
- **手动检查**：支持手动触发剪切板检查

## 使用方法

### 1. 基本使用流程

1. **启动插件**：Eagle2Ae 插件启动时会自动初始化剪切板监控
2. **复制文件**：在任何应用程序中复制文件到剪切板
   - Windows：Ctrl+C
   - macOS：Cmd+C
3. **自动导入**：插件检测到剪切板文件后自动导入到After Effects

### 2. 支持的复制方式

**文件管理器复制**
- 在Windows资源管理器中选择文件并复制
- 在macOS Finder中选择文件并复制

**应用程序内复制**
- 从Photoshop、Illustrator等应用程序复制文件路径
- 从浏览器复制文件链接（本地文件）

**文本路径复制**
- 复制包含文件路径的文本
- 支持多行文本，每行一个文件路径

### 3. 管理界面操作

**状态监控**
- 查看剪切板监控状态
- 查看检测到的文件数量
- 查看操作日志

**手动操作**
- 点击"检查剪切板"按钮手动检查
- 点击"停止/启动剪切板监控"切换监控状态

**设置配置**
- 启用/禁用剪切板监控
- 调整检查间隔时间
- 配置导入选项

## 技术实现

### 剪切板检测机制

```javascript
// 检查剪切板是否有文件
async hasClipboardFiles() {
    const fileFormats = [
        'Files',           // Windows
        'public.file-url', // macOS
        'text/uri-list'    // 通用
    ];
    
    for (const format of fileFormats) {
        if (eagle.clipboard.has(format)) {
            return true;
        }
    }
    return false;
}
```

### 文件路径提取

```javascript
// 从文本中提取文件路径
isFilePath(text) {
    // 检查绝对路径格式
    const isAbsolutePath = /^([a-zA-Z]:\\|\/|\\\\)/.test(text);
    // 检查文件扩展名
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(text);
    return isAbsolutePath && hasExtension;
}
```

### 文件验证

```javascript
// 验证文件是否存在
async validateFiles(filePaths) {
    const fs = require('fs');
    return filePaths.filter(filePath => fs.existsSync(filePath));
}
```

## 配置选项

### 基本设置

| 设置项 | 默认值 | 说明 |
|--------|--------|------|
| 启用剪切板监控 | true | 是否自动监控剪切板 |
| 检查间隔 | 1000ms | 剪切板检查频率 |
| 自动导入 | true | 检测到文件后是否自动导入 |
| 显示通知 | true | 是否显示操作通知 |

### 高级设置

```javascript
// 自定义支持的文件类型
this.supportedFileTypes = [
    '.jpg', '.png', '.mp4', // 添加更多类型
];

// 自定义检查间隔
clipboardHandler.setCheckInterval(2000); // 2秒检查一次
```

## 故障排除

### 常见问题

**Q: 剪切板监控不工作**
A: 检查以下项目：
- 确认插件已正确启动
- 检查剪切板监控状态是否为"监控中"
- 尝试手动检查剪切板功能

**Q: 文件没有被检测到**
A: 可能的原因：
- 文件类型不在支持列表中
- 文件路径格式不正确
- 文件不存在或无法访问

**Q: 导入失败**
A: 检查以下项目：
- After Effects是否正在运行
- 网络连接是否正常
- 文件是否被其他程序占用

### 调试方法

**启用详细日志**
```javascript
// 在浏览器控制台中查看详细日志
console.log(eagle2ae.clipboardHandler.getStatus());
```

**手动测试**
```javascript
// 手动触发剪切板检查
await eagle2ae.clipboardHandler.manualCheck();
```

**测试页面**
- 打开 `test-clipboard.html` 进行功能测试
- 查看剪切板内容和检测结果

## 更新日志

### v1.0.2 (当前版本)
- ✅ 添加剪切板文件监控功能
- ✅ 支持多种文件类型自动检测
- ✅ 集成到管理界面
- ✅ 添加配置选项和手动操作
- ✅ 完善错误处理和日志记录

### 计划功能
- 🔄 支持更多剪切板格式
- 🔄 添加文件预览功能
- 🔄 支持批量操作优化
- 🔄 添加快捷键支持

## 注意事项

1. **性能影响**：剪切板监控会定期检查剪切板，建议根据需要调整检查间隔
2. **文件权限**：确保插件有权限访问要导入的文件
3. **路径格式**：支持Windows和macOS的标准文件路径格式
4. **内存使用**：大量文件操作时注意内存使用情况

## 技术支持

如果遇到问题或需要帮助，请：
1. 查看操作日志中的错误信息
2. 使用测试页面验证功能
3. 检查Eagle和After Effects的版本兼容性
4. 确认文件路径和权限设置
