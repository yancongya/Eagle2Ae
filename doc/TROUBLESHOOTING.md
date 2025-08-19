# 复制导出功能故障排除

## 问题1：文件名显示为 undefined.png

### 问题描述
复制功能显示文件路径中包含 `undefined.png`，表明图层名称没有正确传递。

### 原因分析
JSX脚本返回的导出信息结构与JavaScript代码中使用的字段名不匹配：
- JSX返回：`{ fileName: "Layer1.png", layerName: "Layer1" }`
- JavaScript期望：`{ name: "Layer1", exportName: "Layer1.png" }`

### 解决方案
已修复JavaScript代码中的字段映射：
```javascript
// 修复前
const fileName = `${layer.exportName || layer.name}.png`;

// 修复后  
const fileName = layer.fileName || `${layer.layerName || 'unknown'}.png`;
```

## 问题2：AbortSignal.timeout is not a function

### 问题描述
在较老版本的Node.js/CEP环境中，`AbortSignal.timeout()` 方法不存在。

### 原因分析
`AbortSignal.timeout()` 是较新的Web API，在CEP环境中可能不支持。

### 解决方案
已替换为使用 `setTimeout` 和 `Promise` 的兼容实现：
```javascript
// 修复前
signal: AbortSignal.timeout(10000)

// 修复后
return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
        reject(new Error('请求超时'));
    }, 10000);
    // ... 请求逻辑
    clearTimeout(timeoutId);
});
```

## 问题3：Eagle插件没有收到请求

### 可能原因
1. **端口不匹配**：AE扩展和Eagle插件使用不同端口
2. **Eagle插件未运行**：插件服务没有正确启动
3. **网络连接问题**：本地HTTP连接被阻止

### 调试步骤

#### 1. 检查端口配置
在AE扩展日志中查看：
```
✅ Eagle2Ae 服务已启动 (端口: 8080)
```

在浏览器中访问：`http://localhost:8080/ping`
应该返回：
```json
{
  "pong": true,
  "timestamp": 1640995200000,
  "service": "Eagle2Ae",
  "version": "1.0.1"
}
```

#### 2. 检查Eagle插件状态
Eagle插件日志应显示：
```
🚀 Eagle扩展已启动 - 版本: 2.1 (精简版)
✅ Eagle2Ae 服务已启动 (端口: 8080)
```

#### 3. 手动测试API
使用curl或Postman测试：
```bash
curl -X POST http://localhost:8080/copy-to-clipboard \
  -H "Content-Type: application/json" \
  -d '{
    "type": "copy_files",
    "filePaths": ["C:/test/file.png"],
    "timestamp": 1640995200000
  }'
```

#### 4. 检查文件路径
确保导出的文件确实存在：
- 检查导出路径是否正确
- 验证文件权限
- 确认文件名格式

### 常见错误信息

#### "无法连接到Eagle插件"
- 确保Eagle应用正在运行
- 检查Eagle2Ae插件是否已启用
- 验证端口配置是否一致

#### "请求超时"
- 检查网络连接
- 确认Eagle插件响应正常
- 增加超时时间进行测试

#### "文件不存在"
- 验证导出是否成功完成
- 检查文件路径格式
- 确认文件权限

## 调试技巧

### 1. 启用详细日志
在Eagle插件中已添加详细的日志记录：
```javascript
this.log('📋 收到复制到剪贴板的HTTP请求', 'info');
this.log(`📋 解析请求数据: ${body}`, 'info');
this.log(`📋 文件列表: ${data.filePaths.join(', ')}`, 'info');
```

### 2. 检查导出信息结构
在AE扩展中添加调试日志：
```javascript
console.log('导出信息结构:', JSON.stringify(this.lastExportInfo, null, 2));
```

### 3. 验证文件存在性
在复制前检查文件：
```javascript
const fs = require('fs');
filePaths.forEach(path => {
    console.log(`文件存在: ${path} -> ${fs.existsSync(path)}`);
});
```

## 解决步骤总结

1. **重启Eagle应用**：确保插件重新加载
2. **重启After Effects**：确保扩展重新加载
3. **检查日志**：查看详细的错误信息
4. **测试连接**：使用ping端点验证通信
5. **验证文件**：确认导出文件确实存在
6. **手动测试**：使用curl测试API端点

如果问题仍然存在，请提供完整的日志信息以便进一步诊断。
