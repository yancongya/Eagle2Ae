# 项目状态检测器详细使用指南

## 检测项目详解

### 1. 环境检测 (Environment Check)

检测当前运行环境和基础配置。

```javascript
const envResult = checker.checkEnvironment();
console.log('环境状态:', envResult);
```

**检测内容**:
- CEP 环境可用性
- After Effects 版本兼容性
- 系统资源状况
- 插件权限验证

**返回结果**:
```javascript
{
    isCEP: true,
    isDemo: false,
    hasCSInterface: true,
    aeVersion: "2024",
    cepVersion: "11.0",
    systemInfo: {
        platform: "Windows",
        memory: "16GB",
        availableMemory: "8GB"
    },
    permissions: {
        fileAccess: true,
        networkAccess: true,
        scriptAccess: true
    }
}
```

### 2. AE 连接检测 (AE Connection Check)

检测与 After Effects 的通信状态。

```javascript
const aeResult = await checker.checkAEConnection();
console.log('AE连接状态:', aeResult);
```

**检测内容**:
- ExtendScript 通信可用性
- AE 应用响应性
- 版本信息获取
- 响应时间测量
- 脚本执行权限

**可能的问题及解决方案**:
- **AE 应用未启动**: 自动提示用户启动 AE
- **ExtendScript 引擎错误**: 提供重启 AE 的建议
- **通信超时**: 自动重试并调整超时时间
- **权限不足**: 指导用户调整安全设置

### 3. 项目状态检测 (Project State Check)

检测当前 AE 项目的状态。

```javascript
const projectResult = await checker.checkProjectState();
console.log('项目状态:', projectResult);
```

**检测内容**:
- 项目是否已打开
- 项目保存状态
- 项目文件路径
- 素材数量统计
- 项目复杂度评估

**智能建议**:
```javascript
// 根据项目状态提供智能建议
if (projectResult.itemCount > 200) {
    result.recommendations.push({
        type: 'performance',
        message: '项目素材较多，建议启用代理模式以提高性能',
        action: 'enableProxy'
    });
}

if (!projectResult.isSaved) {
    result.recommendations.push({
        type: 'safety',
        message: '项目尚未保存，建议先保存项目',
        action: 'saveProject'
    });
}
```

### 4. 合成状态检测 (Composition State Check)

检测当前活动合成的状态。

```javascript
const compResult = await checker.checkCompositionState();
console.log('合成状态:', compResult);
```

**检测内容**:
- 活动合成存在性
- 合成基本信息（尺寸、帧率、时长）
- 图层数量统计
- 合成设置验证
- 渲染队列状态

**性能评估**:
```javascript
// 合成复杂度评估
const complexity = evaluateCompositionComplexity(compResult);
if (complexity.level === 'high') {
    result.warnings.push({
        type: 'performance',
        message: `合成复杂度较高（${complexity.score}/100），可能影响导入性能`,
        suggestions: [
            '考虑预合成复杂图层',
            '临时禁用不必要的效果',
            '使用代理文件'
        ]
    });
}
```

### 5. Eagle 连接检测 (Eagle Connection Check)

检测与 Eagle 应用的连接状态。

```javascript
const eagleResult = await checker.checkEagleConnection();
console.log('Eagle连接状态:', eagleResult);
```

**检测内容**:
- Eagle 应用运行状态
- API 端点可访问性
- 版本兼容性检查
- 网络延迟测量
- 数据库连接状态

**连接优化**:
```javascript
// 自动优化连接参数
if (eagleResult.responseTime > 1000) {
    // 响应时间过长，调整超时设置
    checker.setConnectionTimeout(5000);
    
    result.recommendations.push({
        type: 'performance',
        message: 'Eagle 响应较慢，已自动调整连接超时时间',
        action: 'adjustTimeout'
    });
}
```

## 智能对话框系统

### 错误对话框

当检测到错误时，系统会自动显示智能错误对话框：

```javascript
// 自动显示错误对话框
const userChoice = await showStatusErrorDialog(statusResult);

// 处理用户选择
switch (userChoice) {
    case '重试':
        // 重新执行检测
        const retryResult = await checker.checkProjectStatus();
        break;
    case '忽略':
        // 忽略错误继续操作
        console.warn('用户选择忽略错误');
        break;
    case '取消':
        // 取消当前操作
        return false;
    case '查看详情':
        // 显示详细错误信息
        await showDetailedErrorDialog(statusResult);
        break;
}
```

**错误对话框类型**:
- **连接错误**: 提供重连、检查设置、查看帮助选项
- **项目错误**: 提供打开项目、创建新项目、忽略选项
- **权限错误**: 提供权限设置指导和解决方案
- **性能警告**: 提供优化建议和继续选项

### 状态总结对话框

显示详细的状态信息和操作建议：

```javascript
// 显示状态总结
await showStatusSummaryDialog(statusResult);
```

**包含信息**:
- 系统状态概览
- 性能指标和建议
- 操作建议和优化提示
- 潜在风险提示
- 历史状态对比

**总结示例**:
```
✅ 系统状态良好
📊 性能指标: 内存使用 45%, CPU 使用 23%
🎯 AE 连接: 正常 (响应时间: 120ms)
📁 项目状态: 已打开 "我的项目.aep" (85个素材)
🎬 合成状态: "主合成" 1920x1080 (12个图层)
🦅 Eagle 连接: 正常 (版本 3.0.2)

💡 建议:
• 项目素材较多，建议定期清理未使用素材
• 合成图层适中，性能良好
```