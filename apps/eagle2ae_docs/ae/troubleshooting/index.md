# AE 扩展 - 故障排除指南

欢迎查阅 Eagle2Ae AE 扩展的故障排除指南。本指南旨在帮助用户解决在使用扩展过程中可能遇到的各种问题，提供详细的诊断步骤和解决方案。

## 📚 故障排除目录

### 常见问题
- **[概述](./)** - 故障排除指南概览
- **[常见问题](./common-issues.md)** - 使用中遇到的常见问题及解决方案
- **[面板单选切换异常排查总结](./面板单选切换异常-排查总结.md)** - 面板单选按钮切换异常的原因分析和修复方案

### 问题分类
1. **安装与启动问题** - 扩展安装和启动相关问题
2. **连接问题** - 与AE和Eagle的连接相关问题
3. **导入功能问题** - 素材导入相关问题
4. **导出功能问题** - 素材导出相关问题
5. **UI显示问题** - 界面显示和交互相关问题
6. **性能问题** - 性能和响应速度相关问题
7. **兼容性问题** - 不同系统和软件版本的兼容性问题

## 🚀 故障排除流程

### 1. 问题诊断
当遇到问题时，请按以下步骤进行诊断：

#### 环境检查
```bash
# 检查系统信息
系统版本: Windows 10/11 或 macOS 10.14+
AE版本: CC 2018 或更高版本
Eagle版本: 3.0 或更高版本
浏览器支持: Chrome 86+ 或 Firefox 87+
```

#### 扩展状态检查
1. **检查扩展是否正确安装**
   - 确认扩展文件夹已放置在正确的CEP扩展目录中
   - 验证文件夹名称和结构是否正确
   - 确认已启用CEP调试模式

2. **检查扩展是否正常启动**
   - 重启After Effects确保扩展正确加载
   - 在AE菜单中检查扩展是否出现在"窗口 > 扩展"列表中
   - 查看扩展面板是否能正常打开

#### 连接状态检查
1. **检查AE连接状态**
   - 确认AE是否正常运行
   - 验证扩展是否能正确连接到AE
   - 检查ExtendScript脚本是否正确加载

2. **检查Eagle连接状态**
   - 确认Eagle应用是否正在运行
   - 验证扩展是否能正确连接到Eagle插件
   - 检查网络端口是否开放

### 2. 日志分析
扩展提供了详细的日志系统，帮助诊断问题：

#### 启用详细日志
```javascript
// 在浏览器控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0'); // 0=debug, 1=info, 2=warning, 3=error

// 或者在扩展设置中启用详细日志显示
```

#### 日志等级说明
- **DEBUG (0)** - 详细的调试信息，用于开发和深度诊断
- **INFO (1)** - 一般信息，用于了解扩展运行状态
- **WARNING (2)** - 警告信息，表示可能存在问题但不影响功能
- **ERROR (3)** - 错误信息，表示功能受到影响

#### 关键日志关键字
```javascript
// 常见的日志关键字和含义
const logKeywords = {
    '🔍': '检测操作',
    '✅': '成功操作',
    '⚠️': '警告信息',
    '❌': '错误信息',
    '🎭': '演示模式',
    '📡': '网络通信',
    '🔄': '状态更新',
    '📁': '文件操作',
    '📋': '剪贴板操作',
    '🖼️': '图片处理',
    '🎬': '视频处理',
    '🎵': '音频处理',
    '📦': '素材处理',
    '🔧': '设置变更',
    '⚙️': '系统配置',
    '🔌': '连接状态',
    '⏱️': '性能监控',
    '🐛': '调试信息'
};
```

### 3. 问题解决

#### 安装与启动问题

##### 扩展无法找到
- **症状**：在AE的"窗口 > 扩展"菜单中找不到Eagle2Ae扩展
- **诊断**：
  1. 检查扩展是否已正确放置在CEP扩展目录中
  2. 验证文件夹结构是否正确
  3. 确认已启用CEP调试模式
- **解决**：
  ```bash
  # Windows 扩展目录
  C:\Users\[用户名]\AppData\Roaming\Adobe\CEP\extensions\
  
  # macOS 扩展目录
  ~/Library/Application Support/Adobe/CEP/extensions/
  
  # 启用CEP调试模式 (Windows)
  reg add "HKEY_CURRENT_USER\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1
  
  # 启用CEP调试模式 (macOS)
  defaults write com.adobe.CSXS.11 PlayerDebugMode 1
  ```

##### 扩展面板空白
- **症状**：扩展面板打开后显示空白或加载失败
- **诊断**：
  1. 检查控制台是否有JavaScript错误
  2. 验证扩展文件是否完整
  3. 确认AE版本是否兼容
- **解决**：
  ```javascript
  // 在控制台中检查扩展加载状态
  console.log('扩展版本:', window.extensionVersion);
  console.log('AE版本:', window.aeVersion);
  console.log('CEP版本:', window.cepVersion);
  
  // 重启AE和扩展
  // 完全关闭AE后重新启动
  ```

#### 连接问题

##### AE连接失败
- **症状**：扩展无法连接到After Effects
- **诊断**：
  1. 检查AE是否正在运行
  2. 验证ExtendScript脚本是否正确加载
  3. 检查CSInterface是否可用
- **解决**：
  ```javascript
  // 在控制台中测试AE连接
  try {
      const csInterface = new CSInterface();
      const hostEnv = csInterface.getHostEnvironment();
      console.log('AE环境信息:', hostEnv);
  } catch (error) {
      console.error('AE连接测试失败:', error);
  }
  
  // 重新加载ExtendScript脚本
  csInterface.evalScript('$.evalFile("' + scriptPath + '")');
  ```

##### Eagle连接失败
- **症状**：扩展无法连接到Eagle插件
- **诊断**：
  1. 检查Eagle是否正在运行
  2. 验证网络端口是否正确
  3. 检查防火墙设置
- **解决**：
  ```javascript
  // 测试Eagle连接
  fetch('http://localhost:8080/ping')
      .then(response => response.json())
      .then(data => console.log('Eagle连接测试结果:', data))
      .catch(error => console.error('Eagle连接测试失败:', error));
  
  // 检查端口设置
  const port = localStorage.getItem('communicationPort') || '8080';
  console.log('当前通信端口:', port);
  ```

#### 导入功能问题

##### 素材导入失败
- **症状**：拖拽或粘贴素材后无法导入到AE
- **诊断**：
  1. 检查AE项目是否已打开
  2. 验证活动合成是否存在
  3. 检查文件路径和权限
- **解决**：
  ```javascript
  // 检查项目状态
  csInterface.evalScript('app.project != null', (result) => {
      console.log('项目状态:', result === 'true' ? '已打开' : '未打开');
  });
  
  // 检查活动合成
  csInterface.evalScript('app.project.activeItem != null', (result) => {
      console.log('活动合成状态:', result === 'true' ? '存在' : '不存在');
  });
  ```

##### 文件重复导入
- **症状**：同一文件被多次导入到项目中
- **诊断**：
  1. 检查导入模式设置
  2. 验证项目内文件检测功能
  3. 检查文件路径匹配逻辑
- **解决**：
  ```javascript
  // 检查导入模式设置
  const importMode = localStorage.getItem('importMode') || 'project_adjacent';
  console.log('当前导入模式:', importMode);
  
  // 启用项目内文件检测
  localStorage.setItem('enableProjectFileCheck', 'true');
  ```

#### 导出功能问题

##### 图层导出失败
- **症状**：无法将AE图层导出到Eagle
- **诊断**：
  1. 检查图层选择状态
  2. 验证导出路径权限
  3. 检查Eagle连接状态
- **解决**：
  ```javascript
  // 检查选中图层数量
  csInterface.evalScript('getSelectedLayersCount()', (result) => {
      console.log('选中图层数量:', result);
  });
  
  // 验证导出路径
  const exportPath = localStorage.getItem('exportPath') || 'desktop';
  console.log('导出路径:', exportPath);
  
  // 检查路径是否存在和可写
  csInterface.evalScript(`validateExportPath("${exportPath}")`, (result) => {
      console.log('路径验证结果:', result);
  });
  ```

##### 导出文件损坏
- **症状**：导出的文件无法正常打开或显示异常
- **诊断**：
  1. 检查AE渲染设置
  2. 验证导出格式支持
  3. 检查文件写入权限
- **解决**：
  ```javascript
  // 检查渲染设置
  csInterface.evalScript('getRenderSettings()', (result) => {
      console.log('渲染设置:', result);
  });
  
  // 验证文件格式
  const exportFormat = localStorage.getItem('exportFormat') || 'PNG';
  console.log('导出格式:', exportFormat);
  
  // 检查文件权限
  csInterface.evalScript('checkFilePermissions()', (result) => {
      console.log('文件权限检查:', result);
  });
  ```

#### UI显示问题

##### 界面元素缺失
- **症状**：部分界面元素无法显示或显示异常
- **诊断**：
  1. 检查CSS样式是否正确加载
  2. 验证DOM元素是否正确创建
  3. 检查浏览器兼容性
- **解决**：
  ```css
  /* 检查关键CSS变量 */
  :root {
      --bg-color: #383838;
      --panel-bg: #2a2a2a;
      --text-color: #e0e0e0;
      --border-color: #555;
  }
  
  /* 强制刷新样式 */
  * {
      transition: none !important;
  }
  ```

##### 响应式布局异常
- **症状**：在不同屏幕尺寸下布局显示异常
- **诊断**：
  1. 检查媒体查询是否正确应用
  2. 验证弹性布局设置
  3. 检查元素尺寸约束
- **解决**：
  ```css
  /* 响应式断点检查 */
  @media (max-width: 768px) {
      .header {
          gap: 8px;
          padding: 12px;
      }
  }
  
  @media (max-width: 480px) {
      .header {
          gap: 6px;
          padding: 10px;
      }
  }
  
  /* 强制重置布局 */
  .content {
      display: flex !important;
      flex-direction: column !important;
  }
  ```

#### 性能问题

##### 扩展响应缓慢
- **症状**：扩展操作响应时间过长
- **诊断**：
  1. 检查系统资源使用情况
  2. 验证网络连接质量
  3. 检查文件处理效率
- **解决**：
  ```javascript
  // 性能监控
  performance.mark('operation-start');
  
  // 执行操作...
  
  performance.mark('operation-end');
  performance.measure('operation-duration', 'operation-start', 'operation-end');
  
  const measure = performance.getEntriesByName('operation-duration')[0];
  console.log(`操作耗时: ${measure.duration}ms`);
  
  // 优化文件处理
  const batchSize = 50; // 批量处理大小
  for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await processBatch(batch);
  }
  ```

##### 内存占用过高
- **症状**：扩展运行时内存使用量持续增长
- **诊断**：
  1. 检查事件监听器是否正确清理
  2. 验证定时器是否及时清除
  3. 检查缓存机制是否合理
- **解决**：
  ```javascript
  // 内存监控
  if (performance.memory) {
      console.log('内存使用情况:', {
          used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
          total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`,
          limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
      });
  }
  
  // 清理事件监听器
  function cleanup() {
      element.removeEventListener('click', handler);
      if (timer) clearTimeout(timer);
  }
  
  // 优化缓存
  const cacheTimeout = 5000; // 5秒缓存超时
  setTimeout(() => {
      cache.clear();
  }, cacheTimeout);
  ```

#### 兼容性问题

##### 不同AE版本兼容性
- **症状**：在某些AE版本上功能异常或缺失
- **诊断**：
  1. 检查AE版本信息
  2. 验证功能兼容性矩阵
  3. 检查ExtendScript版本支持
- **解决**：
  ```javascript
  // 检查AE版本
  const csInterface = new CSInterface();
  const hostEnv = csInterface.getHostEnvironment();
  console.log('AE版本:', hostEnv.appVersion);
  console.log('CEP版本:', hostEnv.extensionVersion);
  
  // 版本兼容性检查
  function isAEVersionSupported(version) {
      const supportedVersions = ['15.0', '16.0', '17.0', '18.0', '22.0', '23.0', '24.0'];
      return supportedVersions.some(supported => version.startsWith(supported));
  }
  ```

##### 不同操作系统兼容性
- **症状**：在Windows和macOS上表现不一致
- **诊断**：
  1. 检查操作系统平台信息
  2. 验证路径处理逻辑
  3. 检查文件系统权限
- **解决**：
  ```javascript
  // 检查操作系统
  console.log('平台信息:', navigator.platform);
  console.log('用户代理:', navigator.userAgent);
  
  // 跨平台路径处理
  function normalizePath(path) {
      if (navigator.platform.includes('Win')) {
          return path.replace(/\//g, '\\\\');
      } else {
          return path.replace(/\\\\/g, '/');
      }
  }
  
  // 文件系统权限检查
  csInterface.evalScript('checkFileSystemPermissions()', (result) => {
      console.log('文件系统权限:', result);
  });
  ```

## 🛠️ 高级故障排除

### 使用开发者工具

#### Chrome DevTools 调试
1. **启用调试模式**
   ```bash
   # 访问调试页面
   http://localhost:8088/
   ```

2. **检查控制台日志**
   ```javascript
   // 过滤特定类型的日志
   console.log('🔍', '检测日志');
   console.log('✅', '成功日志');
   console.log('⚠️', '警告日志');
   console.log('❌', '错误日志');
   ```

3. **监控网络请求**
   ```javascript
   // 监控WebSocket连接
   const ws = new WebSocket('ws://localhost:8080/ws');
   ws.onopen = () => console.log('WebSocket连接已建立');
   ws.onclose = () => console.log('WebSocket连接已关闭');
   ws.onerror = (error) => console.error('WebSocket错误:', error);
   ```

#### ExtendScript 调试
1. **使用ExtendScript Toolkit**
   ```javascript
   // 在ExtendScript中添加调试输出
   $.writeln('调试信息: ' + new Date());
   
   // 检查变量值
   $.writeln('变量值: ' + variable.toString());
   
   // 错误处理
   try {
       // 执行操作
   } catch (error) {
       $.writeln('错误信息: ' + error.toString());
       $.writeln('错误行号: ' + error.line);
   }
   ```

2. **性能分析**
   ```javascript
   // 记录执行时间
   var startTime = new Date().getTime();
   
   // 执行操作...
   
   var endTime = new Date().getTime();
   var duration = endTime - startTime;
   $.writeln('执行耗时: ' + duration + 'ms');
   ```

### 系统诊断工具

#### 系统信息收集
```javascript
// 收集系统信息用于诊断
function collectSystemInfo() {
    return {
        // 浏览器信息
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        
        // 屏幕信息
        screenWidth: screen.width,
        screenHeight: screen.height,
        colorDepth: screen.colorDepth,
        
        // 窗口信息
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        
        // 内存信息
        memory: performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
        } : null,
        
        // 性能时间
        timing: performance.timing,
        
        // 导航信息
        navigation: performance.navigation
    };
}

// 输出系统信息
console.log('系统信息:', collectSystemInfo());
```

#### 网络诊断
```javascript
// 网络连接诊断
async function diagnoseNetwork() {
    const diagnostics = {
        timestamp: new Date().toISOString(),
        tests: []
    };

    // 测试本地连接
    try {
        const localResponse = await fetch('http://localhost:8080/ping', { timeout: 5000 });
        diagnostics.tests.push({
            name: 'Local Connection',
            status: localResponse.ok ? 'PASS' : 'FAIL',
            details: localResponse.ok ? 'Local server reachable' : `HTTP ${localResponse.status}`
        });
    } catch (error) {
        diagnostics.tests.push({
            name: 'Local Connection',
            status: 'FAIL',
            details: error.message
        });
    }

    // 测试网络延迟
    const startTime = Date.now();
    try {
        await fetch('https://httpbin.org/delay/0', { timeout: 5000 });
        const endTime = Date.now();
        diagnostics.tests.push({
            name: 'Network Latency',
            status: 'PASS',
            details: `${endTime - startTime}ms`
        });
    } catch (error) {
        diagnostics.tests.push({
            name: 'Network Latency',
            status: 'FAIL',
            details: error.message
        });
    }

    return diagnostics;
}

// 执行网络诊断
diagnoseNetwork().then(result => {
    console.log('网络诊断结果:', result);
});
```

## 🎯 最佳实践

### 预防性维护

#### 定期检查
1. **每周检查**
   - 检查扩展更新
   - 验证连接状态
   - 清理临时文件

2. **每月检查**
   - 备份预设文件
   - 检查系统兼容性
   - 优化设置配置

3. **每季度检查**
   - 审查工作流程
   - 更新操作规范
   - 培训新用户

#### 性能优化
1. **资源管理**
   - 及时关闭不使用的面板实例
   - 定期清理localStorage缓存
   - 优化文件处理流程

2. **内存优化**
   - 及时清理事件监听器
   - 避免内存泄漏
   - 定期重启AE释放资源

3. **网络优化**
   - 使用连接池减少重复连接
   - 启用压缩减少数据传输
   - 实施重试机制提高可靠性

### 用户教育

#### 培训材料
1. **入门培训**
   - 快速入门指南
   - 基本操作演示
   - 常见问题解答

2. **进阶培训**
   - 高级功能使用
   - 工作流程优化
   - 故障排除技巧

3. **专家培训**
   - 系统架构理解
   - 自定义开发指南
   - 性能调优方法

#### 知识库建设
1. **问题记录**
   - 记录所有遇到的问题和解决方案
   - 建立问题分类和标签系统
   - 定期更新和维护

2. **最佳实践**
   - 收集用户反馈和建议
   - 整理高效工作流程
   - 分享经验和技巧

3. **版本更新**
   - 跟踪版本变更历史
   - 记录新功能和改进
   - 提供升级指南

## 📞 技术支持

### 联系方式
如遇到复杂问题无法通过本指南解决，请通过以下方式联系技术支持：

1. **GitHub Issues**
   - 提交问题报告
   - 获取社区支持
   - 跟踪问题进展

2. **官方邮箱**
   - support@eagle2ae.com
   - 提供一对一技术支持
   - 快速响应问题反馈

3. **在线文档**
   - https://docs.eagle2ae.com
   - 查阅最新文档和指南
   - 获取版本更新信息

### 问题报告模板
提交问题时请提供以下信息：

```markdown
## 问题描述
简要描述遇到的问题

## 复现步骤
1. 
2. 
3. 

## 预期结果
描述期望的结果

## 实际结果
描述实际的结果

## 环境信息
- **操作系统**: Windows 10/11 或 macOS 10.14+
- **AE版本**: CC 2018 或更高版本
- **Eagle版本**: 3.0 或更高版本
- **扩展版本**: v2.4.0
- **浏览器**: Chrome 86+ 或 Firefox 87+

## 日志信息
复制相关的控制台日志信息

## 截图
如果可能，提供问题截图
```

## 📚 相关文档

- **[使用手册](../使用手册/)** - 用户操作指南
- **[API 参考](../api/)** - 详细的API文档
- **[开发手册](../development/)** - 开发者指南
- **[功能文档](../features/)** - 功能实现说明

---
**请使用左侧导航栏浏览各个故障排除文档，获取详细信息。**