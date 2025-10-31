# AE扩展i18n翻译任务清单

## 任务概述
将 AE 扩展中的所有硬编码中文字符串转换为 i18n 系统，以支持多语言功能。

## 待翻译模块列表

### 1. 连接状态与UI标签 (Connection Status and UI Labels)
- [x] "未连接" → "Disconnected"
- [x] "连接中" → "Connecting"
- [x] "已连接" → "Connected"
- [x] "连接失败" → "Connection failed"

### 2. 项目与状态信息 (Project and Status Information)
- [x] "未打开项目" → "No project opened"
- [x] "无" → "None"
- [x] "准备就绪" → "Ready"
- [x] "未知" → "Unknown"
- [x] "未就绪" → "Not ready"

### 3. 日志消息 (Log Messages)
- [x] "轮询消息失败" → "Polling messages failed"
- [x] "状态变更" → "Status changed"
- [x] "正在断开连接..." → "Disconnecting..."
- [x] "已断开连接" → "Disconnected"
- [x] "WebSocket连接已建立" → "WebSocket connected"
- [x] "WebSocket连接已断开" → "WebSocket disconnected"
- [x] "收到Eagle状态更新" → "Eagle status update received"
- [x] "收到配置变更通知" → "Config change notification received"
- [x] "处理了 %d 条新消息" → "Processed %d new messages"

### 4. UI按钮和标签 (UI Buttons and Labels)
- [ ] "左键：连接到Eagle" → "Left-click: Connect to Eagle"
- [ ] "右键：刷新状态" → "Right-click: Refresh status"
- [ ] "左键：取消连接" → "Left-click: Cancel connection"
- [ ] "左键：断开连接" → "Left-click: Disconnect"
- [ ] "左键：重试连接" → "Left-click: Retry connection"
- [ ] "测试连接" → "Test connection"

### 5. 设置面板文字 (Settings Panel Text)
- [ ] "确定要重置所有设置到默认值吗？" → "Are you sure to reset all settings to default?"
- [ ] "设置已重置为默认值" → "Settings reset to default"
- [ ] "重置设置失败" → "Reset settings failed"
- [ ] "开始保存设置..." → "Start saving settings..."
- [ ] "所有设置保存成功" → "All settings saved successfully"
- [ ] "保存设置出错" → "Error saving settings"

### 6. 拖拽功能文字 (Drag and Drop Text)
- [ ] "拖拽文件到此处" → "Drag files here"
- [ ] "检测到项目内文件，无法导入：" → "Project internal files detected, cannot import:"
- [ ] "检测到AE项目文件，无法导入：" → "AE project files detected, cannot import:"
- [ ] "AE项目文件导入限制" → "AE Project File Import Limit"
- [ ] "项目内文件导入限制" → "Project Internal File Import Limit"
- [ ] "检测到 %d 个项目内文件" → "Detected %d project internal files"
- [ ] "项目内文件无法导入" → "Project internal files cannot be imported"
- [ ] "准备导入 %d 个文件" → "Ready to import %d files"
- [ ] "文件夹中没有找到可导入的文件" → "No importable files found in folder"
- [ ] "文件夹中找到 %d 个文件" → "Found %d files in folder"

### 7. 文件导入文字 (File Import Text)
- [ ] "检测到 %d 个文件" → "Detected %d files"
- [ ] "是否要导入到After Effects？" → "Do you want to import to After Effects?"
- [ ] "文件将按照当前设置进行导入。" → "Files will be imported according to current settings."
- [ ] "确认拖拽来源" → "Confirm drag source"
- [ ] "这些文件是否来自Eagle应用程序？" → "Are these files from Eagle application?"

### 8. 剪贴板处理文字 (Clipboard Handling)
- [ ] "检测到剪贴板粘贴操作" → "Clipboard paste operation detected"
- [ ] "剪贴板中没有可导入的内容" → "No importable content in clipboard"
- [ ] "检测到剪贴板中有 %d 个可导入文件" → "Detected %d importable files in clipboard"
- [ ] "检测到 %d 个文件路径，但无法直接访问文件内容。" → "Detected %d file paths, but cannot directly access file content."
- [ ] "剪贴板读取权限被拒绝，这通常发生在直接复制文件时" → "Clipboard read permission denied, usually happens when directly copying files"
- [ ] "检测到文件路径但无法直接访问文件内容" → "Detected file paths but cannot directly access file content"

### 9. 错误消息 (Error Messages)
- [ ] "无法打开文件夹选择对话框" → "Cannot open folder selection dialog"
- [ ] "文件夹选择失败" → "Folder selection failed"
- [ ] "无法获取AE版本信息" → "Cannot get AE version info"
- [ ] "获取AE版本失败" → "Get AE version failed"
- [ ] "CSInterface不可用" → "CSInterface unavailable"
- [ ] "获取项目信息失败" → "Get project info failed"
- [ ] "获取AE状态失败" → "Get AE status failed"
- [ ] "获取Eagle基本信息失败" → "Get Eagle basic info failed"
- [ ] "获取资源库大小失败" → "Get library size failed"
- [ ] "获取Eagle状态失败" → "Get Eagle status failed"
- [ ] "发送消息失败" → "Send message failed"
- [ ] "获取AE状态失败" → "Get AE status failed"

### 10. 成功消息 (Success Messages)
- [ ] "扩展启动 - 端口" → "Extension startup - Port"。
- [ ] "Eagle插件启动完成 - 版本" → "Eagle plugin startup complete - Version"
- [ ] "资源库 已加载" → "Library loaded"
- [ ] "共 个文件，占用" → "Total files,占用"
- [ ] "智能分类系统已启用" → "Smart classification system enabled"
- [ ] "开始监听文件夹变化..." → "Start listening to folder changes..."
- [ ] "Eagle导入成功" → "Eagle import successful"
- [ ] "序列帧导入成功" → "Sequence frames imported successfully"
- [ ] "文件夹导入成功" → "Folder imported successfully"

### 11. 对话框文字 (Modal Dialogs)
- [ ] "导入文件确认" → "Import file confirmation"
- [ ] "确认拖拽来源" → "Confirm drag source"
- [ ] "导入设置" → "Import settings"
- [x] "导入模式" → "Import mode"
- [x] "导入行为" → "Import behavior"
- [x] "不导入合成" → "Do not import to composition"
- [x] "创建预合成" → "Create pre-composition"
- [x] "当前时间" → "Current time"
- [x] "时间轴开始" → "Timeline start"

### 12. 文件分类和类型 (File Categories and Types)
- [ ] "图片文件" → "Image files"
- [ ] "视频文件" → "Video files"
- [ ] "音频文件" → "Audio files"
- [ ] "项目文件" → "Project files"
- [ ] "素材文件" → "Asset files"
- [ ] "设计文件" → "Design files"
- [ ] "纯色图层" → "Solid layer"
- [ ] "预合成" → "Pre-composition"
- [ ] "文本图层" → "Text layer"
- [ ] "形状图层" → "Shape layer"

### 13. 导出和导入操作 (Export and Import Actions)
- [ ] "开始导出图层到Eagle..." → "Start exporting layers to Eagle..."
- [ ] "开始导出选中的图层..." → "Start exporting selected layers..."
- [ ] "开始导入 %d 个文件 (%s 模式)" → "Start importing %d files (%s mode)"
- [ ] "导入成功" → "Import successful"
- [ ] "导入失败" → "Import failed"
- [ ] "导出完成" → "Export completed"
- [ ] "导出失败" → "Export failed"
- [ ] "文件已复制到剪切板" → "Files copied to clipboard"
- [ ] "复制成功" → "Copy successful"
- [ ] "复制失败" → "Copy failed"

### 14. 文件夹和路径操作 (Folder and Path Operations)
- [ ] "临时文件夹清理完成" → "Temporary folder cleanup completed"
- [ ] "临时文件夹需要清理" → "Temporary folder needs cleanup"
- [ ] "临时文件夹状态" → "Temporary folder status"
- [ ] "检测到临时文件夹需要清理" → "Detected temporary folder needs cleanup"
- [ ] "启动时临时文件夹清理完成" → "Startup temporary folder cleanup completed"
- [ ] "临时文件夹已打开" → "Temporary folder opened"
- [ ] "检查临时文件夹状态失败" → "Check temporary folder status failed"
- [ ] "临时文件夹已自动清理" → "Temporary folder auto cleaned"

### 15. 各种UI元素 (Various UI Elements)
- [ ] "当前活动合成" → "Current active composition"
- [ ] "等待导入请求..." → "Waiting for import request..."
- [ ] "正在导入 %d 个文件..." → "Importing %d files..."
- [ ] "拖拽导入" → "Drag and drop import"
- [ ] "剪贴板导入" → "Clipboard import"
- [ ] "Eagle导入" → "Eagle import"
- [ ] "导出到Eagle" → "Export to Eagle"
- [ ] "检测到新文件" → "New files detected"
- [ ] "生成缩略图完成" → "Thumbnail generation completed"
- [ ] "自动标签分析中..." → "Auto tag analysis in progress..."
- [ ] "智能分类完成" → "Smart classification completed"

### 16. 序列和帧处理 (Sequence and Frame Handling)
- [ ] "文件夹识别为序列帧" → "Folder identified as sequence frames"
- [ ] "检测到 %d 个序列帧文件夹，共 %d 个文件" → "Detected %d sequence frame folders, total %d files"
- [ ] "检测到 %d 个文件夹，共 %d 个文件" → "Detected %d folders, total %d files"
- [ ] "序列帧导入" → "Sequence frame import"
- [ ] "文件夹导入" → "Folder import"
- [x] "直接导入" → "Direct import"
- [x] "项目旁复制" → "Project adjacent copy"
- [x] "自定义文件夹" → "Custom folder"

### 17. 时间和持续时间 (Time and Duration)
- [ ] "时长" → "Duration"
- [ ] "大小" → "Size"
- [ ] "修改时间" → "Modification time"
- [ ] "尺寸" → "Dimensions"

### 18. 预设和设置 (Presets and Settings)
- [ ] "正在导出预设为JSON..." → "Exporting presets to JSON..."
- [ ] "预设导出成功" → "Presets exported successfully"
- [ ] "预设导出失败" → "Presets export failed"
- [ ] "导出预设过程出错" → "Error exporting presets"
- [ ] "自动保存预设失败" → "Auto save presets failed"
- [ ] "自动保存预设异常" → "Auto save presets exception"
- [ ] "尝试加载预设文件" → "Trying to load preset file"
- [ ] "正在创建默认预设文件" → "Creating default preset file"
- [ ] "默认预设文件创建成功" → "Default preset file created successfully"
- [ ] "预设目录就绪" → "Preset directory ready"
- [ ] "预设目录已设置为" → "Preset directory set to"
- [ ] "预设文件不存在" → "Preset file does not exist"
- [ ] "正在创建预设文件" → "Creating preset file"
- [ ] "创建默认预设文件" → "Create default preset file"
- [ ] "预设文件" → "Preset file"
- [ ] "预设目录" → "Preset directory"
- [ ] "预设文件管理" → "Preset file management"

### 19. 主题和UI文字 (Theme and UI Text)
- [ ] "切换为暗色模式" → "Switch to dark mode"
- [ ] "切换为亮色模式" → "Switch to light mode"
- [ ] "已被宿主锁定" → "Host locked"
- [ ] "亮色模式" → "Light mode"
- [ ] "暗色模式" → "Dark mode"
- [x] "主题" → "Theme"
- [x] "语言" → "Language"
- [x] "日志" → "Log"
- [x] "项目信息" → "Project info"
- [x] "日志面板" → "Log panel"
- [x] "头部" → "Header"
- [x] "全屏" → "Fullscreen"

### 20. 高级设置 (Advanced Settings)
- [ ] "高级设置导入行为已更改为" → "Advanced settings import behavior changed to"
- [ ] "不导入合成" → "Do not import to composition"
- [ ] "创建预合成" → "Create pre-composition"
- [ ] "素材将仅复制到项目文件夹，不导入到合成" → "Assets will only be copied to project folder, not imported to composition"
- [ ] "素材将导入到合成并放置在当前时间指针位置" → "Assets will be imported to composition and placed at current time pointer position"
- [ ] "素材将导入到合成并移至时间轴开始处（0秒位置）" → "Assets will be imported to composition and moved to timeline start (0s position)"
- [ ] "时间轴选项" → "Timeline options"
- [ ] "序列间隔" → "Sequence interval"
- [ ] "当前时间指针位置" → "Current time pointer position"
- [ ] "时间轴开始处" → "Timeline start position"

### 21. 音频和声音 (Audio and Sound)
- [ ] "音效设置" → "Sound settings"
- [ ] "音效已启用" → "Sound enabled"
- [ ] "音效已禁用" → "Sound disabled"
- [ ] "音量" → "Volume"
- [ ] "连接音效" → "Connection sound"
- [ ] "断开音效" → "Disconnection sound"
- [ ] "导入音效" → "Import sound"
- [ ] "导出音效" → "Export sound"

### 22. 文件命名和重命名 (File Naming and Renaming)
- [ ] "临时文件重命名: %s -> %s" → "Temporary file rename: %s -> %s"
- [ ] "保留文件名: %s" → "Keep filename: %s"
- [ ] "文件名已修改: %s -> %s" → "Filename modified: %s -> %s"
- [ ] "时间戳" → "Timestamp"
- [ ] "序列号" → "Sequence number"
- [ ] "原文件名" → "Original filename"
- [ ] "自定义名称" → "Custom name"

### 23. 检测和分析 (Detection and Analysis)
- [ ] "开始检测选中图层" → "Start detecting selected layers"
- [ ] "检测完成" → "Detection completed"
- [ ] "没有选中任何图层" → "No layers selected"
- [ ] "可导出" → "Exportable"
- [ ] "不可导出" → "Not exportable"
- [ ] "图层详情" → "Layer details"
- [ ] "统计信息" → "Statistics"
- [ ] "类型" → "Type"
- [ ] "名称" → "Name"
- [x] "路径" → "Path"
- [ ] "尺寸" → "Dimensions"
- [ ] "文件大小" → "File size"
- [ ] "修改时间" → "Modification time"

### 24. 摘要信息 (Summary Information)
- [ ] "可导出: " → "Exportable: "
- [ ] "不可导出: " → "Not exportable: "
- [ ] "总结: 共检测 %d 个图层，%d 个可导出，%d 个不可导出" → "Summary: Total %d layers detected, %d exportable, %d not exportable"
- [ ] "素材分布" → "Asset distribution"
- [ ] "其他图层" → "Other layers"
- [ ] "路径汇总" → "Path summary"
- [ ] "文件已导出，可手动拖拽到Eagle中" → "Files exported, can manually drag to Eagle"
- [ ] "文件路径无效" → "File path invalid"
- [ ] "文件路径验证通过" → "File path validation passed"

## 总结
- **总共模块**: 24个
- **总字符串数**: 139个
- **预计完成时间**: 需要根据实际开发进度调整
- **优先级**: 建议根据用户交互频率确定优先级，UI按钮和状态信息应优先翻译

## 注意事项
1. 确保所有字符串均已适配i18n系统
2. 保留占位符（例如 %d、%s）的正确格式
3. 考虑字符串长度对UI布局的影响
4. 完成翻译后需测试所有功能正常工作
5. 保留原始中文作为默认语言后备选项