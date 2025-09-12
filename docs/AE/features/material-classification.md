# 素材分类功能文档

## 📋 功能概述

Eagle2Ae v2.0 新增了强大的素材分类功能，能够自动识别和分类不同类型的素材文件，为用户提供更直观的图层管理体验。

## 🎯 主要特性

### 1. 智能素材识别
- **图片素材** 🖼️: JPG, PNG, TIFF, PSD, EXR, HDR等
- **视频素材** 🎬: MP4, MOV, AVI, MKV, WebM等
- **音频素材** 🎵: MP3, WAV, AAC, FLAC等
- **动图素材** 🎞️: GIF, WebP
- **矢量素材** 📐: AI, EPS, SVG
- **原始格式** 🎨: EXR, HDR, DPX, CIN
- **文档素材** 📄: PDF

### 2. 可视化显示
- 图层检测结果中显示对应的素材类型图标
- 统一的"📦素材"标识替代原有的FootageLayer
- 不同图层类型的专用图标（形状🔷、文本📝、纯色🟦等）

### 3. 统计分析
- 实时统计各种素材类型的数量
- 显示可导出和不可导出图层的分布
- 提供详细的类型分布报告

## 🔧 技术实现

### 后端实现 (JSX)

#### 1. analyzeLayer函数增强

```javascript
// 素材类型分类系统
var materialTypes = {
    image: ['jpg', 'jpeg', 'png', 'tiff', 'tga', 'bmp', 'psd', 'exr', 'hdr', 'dpx', 'cin'],
    video: ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm', 'mxf', 'r3d', 'cinema'],
    audio: ['mp3', 'wav', 'aac', 'flac', 'm4a', 'aiff', 'ogg', 'wma'],
    animation: ['gif', 'webp'], // 动图单独分类
    vector: ['ai', 'eps', 'svg'], // 矢量图形
    raw: ['exr', 'hdr', 'dpx', 'cin', 'tiff'], // 原始格式
    document: ['pdf'] // 文档类型
};
```

#### 2. 优先级识别逻辑

素材类型按以下优先级进行识别：
1. 动图素材（GIF, WebP）
2. 矢量素材（AI, EPS, SVG）
3. 原始格式（EXR, HDR, DPX, CIN）
4. 视频素材
5. 音频素材
6. 图片素材
7. 文档素材

#### 3. 扩展的sourceInfo结构

```javascript
layerInfo.sourceInfo = {
    type: "File",
    file: filePath,
    fileName: fileName,
    width: layer.source.width,
    height: layer.source.height,
    duration: layer.source.duration,
    isSequence: isSequence,
    isVideo: isVideoFile,
    // 新增素材分类信息
    materialType: materialType,        // 素材类型标识
    materialCategory: materialCategory, // 中文分类名称
    fileExtension: fileExt             // 文件扩展名
};
```

#### 4. getSupportedFileTypes函数更新

```javascript
function getSupportedFileTypes() {
    return JSON.stringify({
        // 新增素材分类系统
        materials: {
            image: [...],
            video: [...],
            audio: [...],
            animation: [...],
            vector: [...],
            raw: [...],
            document: [...]
        },
        // 保持向后兼容性
        image: [...],
        video: [...],
        audio: [...],
        project: [...]
    });
}
```

### 前端实现 (JavaScript)

#### 1. 日志增强功能

```javascript
enhanceDetectionLogs(logs) {
    const materialIcons = {
        image: '🖼️',
        video: '🎬',
        audio: '🎵',
        animation: '🎞️',
        vector: '📐',
        raw: '🎨',
        document: '📄',
        sequence: '🎯',
        unknown: '❓'
    };
    
    return logs.map(log => {
        // 替换MaterialLayer为更友好的显示
        if (log.includes('MaterialLayer')) {
            log = log.replace(/MaterialLayer/g, '📦素材');
            
            // 根据素材类型添加对应图标
            Object.keys(materialIcons).forEach(type => {
                const typePattern = new RegExp(`${type}素材`, 'gi');
                if (typePattern.test(log)) {
                    log = log.replace(typePattern, `${materialIcons[type]}${type}素材`);
                }
            });
        }
        return log;
    });
}
```

#### 2. 统计信息显示

```javascript
displayMaterialStatistics(selectedLayers) {
    // 统计各种素材类型
    const materialStats = {
        image: 0, video: 0, audio: 0, animation: 0,
        vector: 0, raw: 0, document: 0, sequence: 0,
        shape: 0, text: 0, solid: 0, precomp: 0, other: 0
    };
    
    // 统计逻辑...
    
    // 生成统计报告
    const statsMessages = [];
    statsMessages.push(`📊 图层统计: 总计 ${totalCount} 个，可导出 ${exportableCount} 个`);
    
    // 输出统计信息
    this.logGroup('素材统计', statsMessages, 'info', false);
}
```

## 🧪 测试验证

### 自动化测试

项目包含完整的测试脚本 `test-material-classification.jsx`，可以验证：

1. **文件类型支持测试**
   - 检查 `getSupportedFileTypes` 函数是否包含新的 materials 分类
   - 验证向后兼容性

2. **图层检测功能测试**
   - 验证图层检测功能是否正常工作
   - 检查素材统计功能是否正确

3. **素材类型识别测试**
   - 测试不同文件扩展名的识别准确性
   - 验证优先级逻辑是否正确

### 运行测试

```javascript
// 在AE的ExtendScript工具包中运行
#include "test-material-classification.jsx"
runMaterialClassificationTest();
```

## 📊 使用示例

### 检测结果示例

```
📋 合成名称: 主合成
🔍 检测到 5 个选中图层:
✅ 1. 背景图片 (📦素材) [🖼️image素材，可以导出]
✅ 2. 产品视频 (📦素材) [🎬video素材，将导出第一帧]
❌ 3. 背景音乐 (📦素材) [🎵audio素材，音频文件不支持导出]
✅ 4. Logo矢量 (📦素材) [📐vector素材，可以导出]
✅ 5. 标题文字 (📝文本图层) [文本图层，可以导出]
📊 检测结果: 4 个可导出，1 个不可导出
📦 素材统计: 共 4 个素材文件
📋 类型分布: 图片:1, 视频:1, 音频:1, 矢量:1
```

### 统计信息示例

```
📊 图层统计: 总计 5 个，可导出 4 个
📋 类型分布: 🖼️图片: 1, 🎬视频: 1, 🎵音频: 1, 📐矢量: 1, 📝文本: 1
```

## 🔄 向后兼容性

### 保持兼容的功能

1. **原有API接口**
   - `getSupportedFileTypes()` 仍然返回原有的 image、video、audio、project 分类
   - 现有的图层检测逻辑完全兼容

2. **数据结构**
   - `detectSelectedLayers()` 返回的数据结构保持不变
   - 新增字段不影响现有功能

3. **图层类型**
   - 原有的图层类型标识仍然有效
   - MaterialLayer 是新增类型，不影响现有类型

### 迁移指南

对于使用旧版本API的代码，无需修改即可正常工作。如需使用新功能：

```javascript
// 旧版本用法（仍然有效）
if (layer.type === 'VideoLayer') {
    // 处理视频图层
}

// 新版本用法（推荐）
if (layer.type === 'MaterialLayer' && layer.sourceInfo.materialType === 'video') {
    // 处理视频素材
}
```

## 🚀 性能优化

### 优化措施

1. **缓存机制**
   - 文件扩展名解析结果缓存
   - 素材类型判断结果缓存

2. **批量处理**
   - 统计信息一次性计算
   - 日志信息批量处理

3. **内存管理**
   - 及时清理临时变量
   - 避免重复创建对象

## 🔮 未来扩展

### 计划中的功能

1. **更多素材类型支持**
   - 3D模型文件（OBJ, FBX）
   - 字体文件（TTF, OTF）
   - 脚本文件（JSX, JSXBIN）

2. **智能分析**
   - 基于文件内容的类型识别
   - 素材质量评估
   - 使用频率统计

3. **自定义分类**
   - 用户自定义素材类型
   - 项目特定的分类规则
   - 标签系统集成

## 📝 更新日志

### v2.0.0 (2024-01-01)
- ✨ 新增素材分类功能
- 🎨 优化图层检测界面显示
- 📊 添加素材统计功能
- 🧪 完善测试覆盖
- 📚 更新文档和示例

## 🤝 贡献指南

如需为素材分类功能贡献代码或建议：

1. 遵循项目的代码规范
2. 确保向后兼容性
3. 添加相应的测试用例
4. 更新相关文档

## 📞 技术支持

如遇到问题或需要技术支持，请：

1. 运行测试脚本检查功能状态
2. 查看日志输出获取详细信息
3. 提供复现步骤和环境信息
4. 联系开发团队获取帮助