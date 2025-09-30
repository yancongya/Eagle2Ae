# 素材分类修复文档

## 修复概述

本次修复解决了PSD文件被错误识别为普通图片素材的问题，为设计源文件创建了专门的分类。

## 问题描述

**修复前的问题**:
- PSD文件被归类为"图片"类型，显示为🖼️图片素材
- 无法区分普通图片文件和设计源文件
- 缺乏对Adobe设计文件的专门识别

## 修复内容

### 1. 新增设计文件分类

在 `hostscript.jsx` 中的 `materialTypes` 定义中新增了 `design` 分类：

```javascript
var materialTypes = {
    design: ['psd', 'ai', 'sketch', 'xd', 'fig'], // 设计源文件
    image: ['jpg', 'jpeg', 'png', 'tiff', 'tga', 'bmp'], // 纯图片格式
    // ... 其他类型
};
```

### 2. 优化分类优先级

设计文件现在具有最高的识别优先级：

```javascript
// 按优先级检查素材类型（设计文件优先级最高）
if (materialTypes.design.indexOf(fileExt) !== -1) {
    materialType = 'design';
    materialCategory = '设计文件';
} else if (materialTypes.animation.indexOf(fileExt) !== -1) {
    // ... 其他类型检查
}
```

### 3. 更新统计功能

在 `generateMaterialStatistics` 函数中添加了 `design` 类型的统计：

```javascript
var stats = {
    design: 0, // 新增设计文件统计
    image: 0,
    // ... 其他类型
};
```

### 4. 前端显示优化

在 `main.js` 中为设计文件分配了专用的🎨图标：

```javascript
const materialIcons = {
    design: '🎨', // 设计文件专用图标
    image: '🖼️',
    // ... 其他图标
};
```

### 5. 更新支持的文件类型

在 `getSupportedFileTypes` 函数中添加了 `design` 分类：

```javascript
materials: {
    design: ['psd', 'ai', 'sketch', 'xd', 'fig'], // 设计源文件
    image: ['jpg', 'jpeg', 'png', 'tiff', 'tga', 'bmp'], // 纯图片格式
    // ... 其他分类
}
```

## 修复后的效果

### 检测结果示例

**修复前**:
```
✅ 1. 光 (📦素材) [男_副本.psd 4206x4715]
📋 类型分布: 图片:1
📋 类型分布: 🖼️图片: 1
```

**修复后**:
```
✅ 1. 光 (📦素材) [男_副本.psd 4206x4715]
📋 类型分布: 设计:1
📋 类型分布: 🎨设计: 1
```

### 支持的设计文件类型

- **PSD**: Adobe Photoshop文档
- **AI**: Adobe Illustrator文档
- **SKETCH**: Sketch设计文件
- **XD**: Adobe XD设计文件
- **FIG**: Figma设计文件

## 分类体系

修复后的完整素材分类体系：

1. **🎨设计文件**: psd, ai, sketch, xd, fig
2. **🖼️图片素材**: jpg, jpeg, png, tiff, tga, bmp
3. **🎬视频素材**: mp4, mov, avi, mkv等
4. **🎵音频素材**: mp3, wav, aac, flac等
5. **🎞️动图素材**: gif, webp
6. **📐矢量素材**: eps, svg
7. **🔬原始格式**: exr, hdr, dpx, cin
8. **📄文档素材**: pdf

## 向后兼容性

- 保持了原有的API接口不变
- 现有的图层检测功能完全兼容
- 旧版本的配置和设置继续有效

## 测试验证

可以使用以下文件类型进行测试：

1. **PSD文件**: 应显示为🎨设计文件
2. **AI文件**: 应显示为🎨设计文件
3. **PNG文件**: 应显示为🖼️图片素材
4. **MP4文件**: 应显示为🎬视频素材

## 注意事项

1. **优先级**: 设计文件具有最高的识别优先级
2. **图标变更**: 原始格式的图标从🎨改为🔬，避免与设计文件冲突
3. **分类精确**: AI文件从矢量分类移动到设计分类
4. **统计准确**: 素材统计会正确显示各类型的数量

## 版本信息

- **修复版本**: v2.2.0
- **修复日期**: 2024-01-15
- **影响范围**: 图层检测、素材分类、统计显示
- **兼容性**: 完全向