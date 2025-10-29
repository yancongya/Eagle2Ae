# 多面板支持

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了革命性的多面板支持功能，允许用户同时打开多个扩展面板实例，每个面板都可以拥有独立的配置和预设文件。这一功能极大地提升了工作效率，特别适用于需要同时处理多个项目或不同导入任务的用户。

## 核心特性

### 多实例独立运行
- 支持同时打开多个扩展面板实例
- 每个面板实例拥有独立的配置文件
- 面板间配置互不干扰，可进行个性化设置

### 面板标识系统
- 每个面板实例拥有唯一的面板ID
- 自动识别面板来源，确保配置正确加载
- 支持面板间通信和状态同步

### 预设文件管理
- 每个面板实例对应独立的预设文件
- 支持预设文件的导出和导入
- 提供预设文件版本管理和备份功能

## 使用指南

### 打开多个面板实例

1. **方法一：通过AE菜单**
   - 在After Effects中，点击 `窗口` > `扩展` > `Eagle2Ae`
   - 重复此操作可打开多个面板实例
   - 每个新打开的面板都会自动分配唯一的面板ID

2. **方法二：复制现有面板**
   - 右键点击已打开的Eagle2Ae面板标签
   - 选择"新建窗口"或类似选项（取决于AE版本）
   - 新面板将继承部分设置但拥有独立的配置空间

### 配置独立设置

每个面板实例都可以进行独立的配置：

1. **导入设置**
   - 不同面板可设置不同的导入模式（直接导入、项目旁复制、自定义文件夹）
   - 可分别配置时间轴放置行为
   - 支持不同的文件管理选项

2. **导出设置**
   - 每个面板可设置独立的导出路径
   - 支持不同的导出行为配置
   - 可分别启用或禁用阅后即焚功能

3. **连接设置**
   - 面板间连接状态独立管理
   - 支持连接到不同的Eagle实例（高级用法）
   - 可分别为每个面板配置通信端口

### 预设文件管理

#### 预设文件结构
```
Documents/
└── Eagle2Ae-Ae/
    └── presets/
        ├── Eagle2Ae1.Presets    # 面板1预设文件
        ├── Eagle2Ae2.Presets    # 面板2预设文件
        └── Eagle2Ae3.Presets    # 面板3预设文件
```

#### 导出预设文件
1. 在任一面板中，进入 `高级设置` > `预设管理`
2. 点击 `导出预设文件` 按钮
3. 选择保存位置，预设文件将自动命名为对应面板的文件名

#### 导入预设文件
1. 在目标面板中，进入 `高级设置` > `预设管理`
2. 点击 `打开预设文件` 按钮
3. 选择要导入的预设文件
4. 确认导入，面板将应用新配置

## 技术实现

### 面板ID识别机制

```javascript
/**
 * 获取当前面板 ID
 * @returns {string} 'panel1', 'panel2', 或 'panel3'
 */
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

### 独立配置存储

```javascript
/**
 * 获取面板特定的localStorage键
 * @param {string} key - 原始键名
 * @returns {string} 带面板前缀的键名
 */
getPanelStorageKey(key) {
    return `${this.panelId}_${key}`;
}

/**
 * 获取面板特定的localStorage值
 * @param {string} key - 键名
 * @returns {string|null} 值
 */
getPanelLocalStorage(key) {
    return localStorage.getItem(this.getPanelStorageKey(key));
}

/**
 * 设置面板特定的localStorage值
 * @param {string} key - 键名
 * @param {string} value - 值
 */
setPanelLocalStorage(key, value) {
    localStorage.setItem(this.getPanelStorageKey(key), value);
}
```

### 预设文件管理

```javascript
/**
 * 获取当前面板的配置文件名
 * @returns {string} 'Eagle2Ae1.Presets', 'Eagle2Ae2.Presets', 或 'Eagle2Ae3.Presets'
 */
getPresetFileName() {
    const panelNumber = this.panelId.replace('panel', '');
    return `Eagle2Ae${panelNumber}.Presets`;
}
```

## 最佳实践

### 工作流程优化

1. **项目隔离**
   - 为不同项目分配不同的面板实例
   - 设置项目特定的导入和导出路径
   - 避免配置混淆，提高工作效率

2. **任务分工**
   - 一个面板专门用于素材导入
   - 另一个面板用于图层导出
   - 第三个面板用于连接状态监控

3. **配置备份**
   - 定期导出各面板的预设文件
   - 为重要项目创建专门的配置模板
   - 使用描述性文件名便于识别

### 性能考虑

1. **资源管理**
   - 合理控制同时打开的面板数量
   - 及时关闭不使用的面板实例
   - 定期清理localStorage中的过期数据

2. **内存优化**
   - 避免在多个面板中同时处理大量文件
   - 合理配置日志级别，减少内存占用
   - 定期重启AE以释放系统资源

## 故障排除

### 常见问题

1. **面板配置混乱**
   - 症状：不同面板间配置相互影响
   - 解决：检查面板ID是否正确识别，重新启动面板

2. **预设文件丢失**
   - 症状：面板配置重置为默认值
   - 解决：检查预设文件存储路径，恢复备份文件

3. **面板无法打开**
   - 症状：无法创建新的面板实例
   - 解决：重启AE，检查CEP扩展状态

### 技术支持

如遇到复杂问题，请提供以下信息：
- AE版本和操作系统信息
- 扩展版本号
- 问题复现步骤
- 相关日志文件内容