# 常见问题排除指南

本文档提供Eagle2Ae AE扩展常见问题的解决方案和故障排除步骤。

## 连接问题

### 问题1: 无法连接到Eagle插件

**症状**:
- 扩展显示"连接中"状态但无法建立连接
- 控制台显示连接超时错误
- WebSocket连接失败

**可能原因**:
1. Eagle插件未启动或未安装
2. 端口被其他程序占用
3. 防火墙阻止连接
4. 网络配置问题

**解决方案**:

1. **检查Eagle插件状态**:
   ```
   - 确认Eagle应用程序正在运行
   - 检查Eagle插件是否已安装并启用
   - 重启Eagle应用程序
   ```

2. **检查端口占用**:
   ```bash
   # Windows
   netstat -ano | findstr :8080
   
   # macOS/Linux
   lsof -i :8080
   ```

3. **尝试不同端口**:
   - 在AE扩展设置中修改通信端口
   - 尝试端口范围：8080-8089
   - 重启AE扩展

4. **检查防火墙设置**:
   - 允许After Effects通过防火墙
   - 允许Eagle通过防火墙
   - 临时关闭防火墙测试

5. **使用HTTP轮询模式**:
   ```javascript
   // 在扩展设置中启用HTTP轮询
   this.useWebSocket = false;
   this.fallbackToHttp = true;
   ```

### 问题2: 连接频繁断开

**症状**:
- 连接建立后很快断开
- 频繁的重连尝试
- 不稳定的通信

**解决方案**:

1. **调整心跳间隔**:
   ```javascript
   // 减少心跳间隔
   this.heartbeatInterval = 15000; // 15秒
   ```

2. **增加重连次数**:
   ```javascript
   this.maxReconnectAttempts = 10;
   this.reconnectDelay = 3000;
   ```

3. **检查网络稳定性**:
   - 测试本地网络连接
   - 检查是否有网络代理
   - 尝试有线连接替代WiFi

## 文件导入问题

### 问题3: 文件导入失败

**症状**:
- 文件无法导入到AE项目
- 显示"文件不存在"错误
- 导入过程中断

**可能原因**:
1. 文件路径包含特殊字符
2. 文件权限不足
3. 文件格式不支持
4. AE项目未保存
5. 合成未选择

**解决方案**:

1. **检查文件路径**:
   ```javascript
   // 确保路径使用正确的分隔符
   const normalizedPath = filePath.replace(/\\/g, '/');
   ```

2. **验证文件权限**:
   - 确保AE有读取文件的权限
   - 检查文件是否被其他程序锁定
   - 尝试复制文件到临时目录

3. **检查文件格式**:
   - 支持的图片格式：JPG, PNG, TIFF, PSD等
   - 支持的视频格式：MP4, MOV, AVI等
   - 支持的音频格式：WAV, MP3, AIFF等

4. **确保项目状态**:
   ```javascript
   // 检查项目是否已保存
   if (!app.project.file) {
       alert('请先保存AE项目');
       return;
   }
   ```

### 问题4: 中文文件名显示乱码

**症状**:
- 中文文件名显示为乱码或问号
- 文件导入后名称错误

**解决方案**:

1. **启用强制解码**:
   ```javascript
   // 在hostscript.jsx中已实现
   // v2.1.1版本自动处理中文文件名
   ```

2. **检查系统编码**:
   - Windows: 确保系统区域设置正确
   - macOS: 检查系统语言设置

3. **文件名预处理**:
   ```javascript
   // 避免使用特殊字符
   const safeName = fileName.replace(/[<>:"/\\|?*]/g, '_');
   ```

## 性能问题

### 问题5: 扩展启动缓慢

**症状**:
- AE启动时扩展加载时间过长
- 界面响应缓慢

**解决方案**:

1. **禁用端口发现**:
   ```javascript
   this.enablePortDiscovery = false;
   ```

2. **优化轮询间隔**:
   ```javascript
   // 增加轮询间隔
   const pollingManager = new PollingManager(callback, 1000);
   ```

3. **减少日志输出**:
   ```javascript
   // 在生产环境中减少DEBUG日志
   if (process.env.NODE_ENV === 'production') {
       this.logLevel = 'INFO';
   }
   ```

### 问题6: 内存占用过高

**症状**:
- AE内存使用量异常增长
- 系统响应变慢
- 可能出现内存不足错误

**解决方案**:

1. **及时清理资源**:
   ```javascript
   // 清理事件监听器
   window.removeEventListener('beforeunload', this.cleanup);
   
   // 清理定时器
   clearInterval(this.pollingInterval);
   
   // 清理WebSocket连接
   if (this.webSocketClient) {
       this.webSocketClient.disconnect();
   }
   ```

2. **限制缓存大小**:
   ```javascript
   // 限制日志缓存
   if (this.logs.length > 1000) {
       this.logs = this.logs.slice(-500);
   }
   ```

3. **优化文件处理**:
   ```javascript
   // 分批处理大量文件
   const batchSize = 10;
   for (let i = 0; i < files.length; i += batchSize) {
       const batch = files.slice(i, i + batchSize);
       await this.processBatch(batch);
   }
   ```

## 兼容性问题

### 问题7: AE版本兼容性

**症状**:
- 扩展在某些AE版本中无法正常工作
- API调用失败

**解决方案**:

1. **检查AE版本**:
   ```javascript
   const aeVersion = parseFloat(app.version);
   if (aeVersion < 15.0) {
       alert('需要After Effects CC 2018或更高版本');
       return;
   }
   ```

2. **使用兼容性API**:
   ```javascript
   // 检查API可用性
   if (typeof app.project.importFile !== 'undefined') {
       // 使用新API
   } else {
       // 使用旧API或提示升级
   }
   ```

### 问题8: 操作系统兼容性

**症状**:
- 在某些操作系统上功能异常
- 路径处理错误

**解决方案**:

1. **跨平台路径处理**:
   ```javascript
   // 统一路径分隔符
   const path = filePath.replace(/\\/g, '/');
   
   // 检查操作系统
   const isWindows = navigator.platform.indexOf('Win') > -1;
   const isMac = navigator.platform.indexOf('Mac') > -1;
   ```

2. **平台特定代码**:
   ```javascript
   if (isWindows) {
       // Windows特定处理
   } else if (isMac) {
       // macOS特定处理
   }
   ```

## 调试技巧

### 启用调试模式

1. **CEP调试**:
   ```
   - 运行enable_cep_debug_mode.reg
   - 在Chrome中访问：http://localhost:8092
   - 选择对应的扩展进行调试
   ```

2. **增强调试**:
   ```
   - 运行enable_cep_debug_enhanced.reg
   - 启用更详细的调试信息
   ```

3. **日志调试**:
   ```javascript
   // 启用详细日志
   this.logManager.setLevel('DEBUG');
   
   // 查看日志文件
   console.log('日志路径:', this.logManager.getLogPath());
   ```

### 常用调试命令

```javascript
// 检查连接状态
console.log('连接状态:', aeExtension.getConnectionState());

// 检查项目信息
aeExtension.csInterface.evalScript('getProjectInfo()', (result) => {
    console.log('项目信息:', result);
});

// 测试ExtendScript连接
aeExtension.csInterface.evalScript('testExtendScriptConnection()', (result) => {
    console.log('ExtendScript状态:', result);
});

// 检查端口状态
fetch('http://localhost:8080/api/status')
    .then(response => response.json())
    .then(data => console.log('Eagle状态:', data))
    .catch(error => console.error('连接失败:', error));
```

## 获取帮助

如果以上解决方案无法解决您的问题，请：

1. **收集诊断信息**:
   - AE版本和操作系统信息
   - 扩展版本号
   - 错误日志和控制台输出
   - 重现问题的具体步骤

2. **联系支持**:
   - 在项目仓库创建Issue
   - 提供详细的问题描述
   - 附上相关日志文件

3. **社区支持**:
   - 查看项目文档和FAQ
   - 参与社区讨论
   - 搜索已知问题和解决方案

## 预防措施

1. **定期更新**:
   - 保持扩展版本最新
   - 及时更新AE和Eagle
   - 关注版本兼容性说明

2. **备份配置**:
   - 定期备份扩展设置
   - 保存重要的项目配置
   - 记录自定义设置

3. **监控性能**:
   - 定期检查内存使用
   - 监控连接稳定性
   - 及时清理临时文件

4. **测试环境**:
   - 在测试项目中验证新功能
   - 避免在重要项目中使用未测试的功能
   - 保持开发和生产环境分离

## 时间轴设置问题

### 问题: 导入的图层位置不正确

**症状**:
- 设置为"当前时间"模式，但图层仍放置在时间轴开始位置
- 图层位置与预期的时间轴设置不符
- 时间轴设置似乎不生效

**可能原因**:
1. 时间轴设置检查逻辑错误（v2.1.1及之前版本的已知问题）
2. 设置传递过程中丢失或被覆盖
3. ExtendScript执行时设置解析错误

**解决方案**:

1. **升级到v2.1.2或更高版本**:
   ```
   v2.1.2版本修复了时间轴设置检查逻辑错误
   将检查条件从timelineOptions.enabled改为timelineOptions.placement
   ```

2. **验证设置配置**:
   ```javascript
   // 检查设置是否正确配置
   console.log('timelineOptions:', settingsManager.getSettings().timelineOptions);
   // 应该显示: { enabled: true, placement: 'current_time' }
   ```

3. **检查ExtendScript日志**:
   ```javascript
   // 在hostscript.jsx中查看调试日志
   console.log('[时间轴设置] placement模式:', settings.timelineOptions.placement);
   console.log('[时间轴设置] 当前合成时间:', targetComp.time);
   ```

4. **手动验证时间轴位置**:
   - 在AE中移动时间指针到特定位置
   - 执行导入操作
   - 检查图层是否放置在正确的时间位置

5. **重置设置**:
   ```javascript
   // 如果问题持续，尝试重置时间轴设置
   settingsManager.resetTimelineOptions();
   ```

**预防措施**:
- 定期检查扩展版本，确保使用最新版本
- 在重要项目中使用前，先在测试项目中验证时间轴设置
- 启用调试模式以便查看详细的执行日志