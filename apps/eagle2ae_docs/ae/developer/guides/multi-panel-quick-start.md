# 多面板支持快速入门指南

## 概述

Eagle2Ae 扩展支持多面板架构，允许同时打开多个独立的面板实例。每个面板实例都有独立的状态管理、配置存储和通信通道，确保各面板之间的操作互不干扰。

## 快速开始

### 1. 打开多个面板实例

在 After Effects 中，可以通过以下方式打开多个面板实例：

1. 通过菜单栏：`窗口` > `扩展` > `Eagle2Ae`
2. 右键点击已打开的面板标签，选择"新建面板实例"
3. 使用快捷键 Ctrl+Shift+P (Windows) 或 Cmd+Shift+P (Mac)

### 2. 识别不同面板

每个面板实例都有唯一的标识：
- **面板1**: 主面板实例
- **面板2**: 第二个面板实例
- **面板3**: 第三个面板实例

面板标题会显示当前面板的编号，例如"Eagle2Ae - 面板1"。

## 面板独立性

### 独立配置存储

每个面板实例拥有独立的配置存储空间：

```javascript
// 面板ID识别机制
getPanelId() {
    try {
        if (this.csInterface && typeof this.csInterface.getExtensionID === 'function') {
            const extensionId = this.csInterface.getExtensionID();
            
            // 从 Extension ID 中提取面板编号
            if (extensionId.includes('panel1')) {
                return 'panel1';
            } else if (extensionId.includes('panel2')) {
                return 'panel2';
            } else if (extensionId.includes('panel3')) {
                return 'panel3';
            }
        }
        
        // Demo 模式：从 URL 参数获取
        if (window.location && window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            const panelParam = urlParams.get('panel');
            if (panelParam && ['panel1', 'panel2', 'panel3'].includes(panelParam)) {
                return panelParam;
            }
        }
        
        // 默认返回 panel1
        return 'panel1';
    } catch (error) {
        return 'panel1';
    }
}
```

### 独立设置管理

每个面板实例拥有独立的设置管理器：

```javascript
// 使用面板前缀隔离不同面板的设置
getPanelStorageKey(key) {
    return `${this.panelId}_${key}`;
}

getPanelLocalStorage(key) {
    return localStorage.getItem(this.getPanelStorageKey(key));
}

setPanelLocalStorage(key, value) {
    localStorage.setItem(this.getPanelStorageKey(key), value);
}
```

## 使用场景

### 1. 并行工作流

使用多个面板实例可以实现并行工作流：
- **面板1**: 处理主要项目素材导入
- **面板2**: 处理备用项目素材导入
- **面板3**: 专门用于图层检测和分析

### 2. 不同项目间切换

在处理多个项目时，可以为每个项目分配一个面板实例：
- **面板1**: 项目A的素材处理
- **面板2**: 项目B的素材处理
- **面板3**: 项目C的素材处理

### 3. 功能专门化

将不同面板实例用于不同功能：
- **面板1**: 素材导入和管理
- **面板2**: 图层检测和分析
- **面板3**: 预设管理和配置

## 最佳实践

### 1. 合理分配面板用途

为每个面板实例分配明确的用途，避免功能重叠。

### 2. 定期保存配置

定期保存各面板的配置，防止意外丢失。

### 3. 避免过多面板实例

虽然支持多个面板实例，但建议根据实际需要合理使用，避免系统资源浪费。

## 故障排除

### 面板配置混乱

如果发现不同面板间配置相互影响：
1. 检查面板ID是否正确识别
2. 重启面板实例
3. 清除localStorage中的相关配置

### 面板无法打开

如果无法打开新的面板实例：
1. 检查AE版本是否支持多面板
2. 确认扩展是否正确安装
3. 重启After Effects