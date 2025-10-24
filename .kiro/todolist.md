# Eagle2Ae 多面板功能开发任务清单

## 项目目标
实现 3 个独立的扩展面板，每个面板有独立的配置，所有配置保存在一个 JSON 文件中。

## 面板信息
- **面板 1**: `Eagle2Ae@烟肉鸭` (默认面板)
- **面板 2**: `Eagle2Ae@烟肉鸭2`
- **面板 3**: `Eagle2Ae@烟肉鸭3`

---

## 阶段 1: 配置文件结构设计 ✅

### 1.1 设计多面板配置 JSON 结构
- [ ] 创建新的配置文件结构设计文档
- [ ] 定义面板配置的数据模型
  - 每个面板有独立的 `importSettings`、`uiSettings` 等
  - 添加 `currentPanel` 字段标识当前激活的面板
  - 添加 `panels` 对象存储 3 个面板的配置

**配置结构示例**:
```json
{
  "version": "1.0.0",
  "currentPanel": "panel1",
  "panels": {
    "panel1": {
      "id": "Eagle2Ae@烟肉鸭",
      "name": "面板 1",
      "importSettings": { ... },
      "uiSettings": { ... },
      "language": "zh-CN",
      "aeTheme": "dark",
      ...
    },
    "panel2": {
      "id": "Eagle2Ae@烟肉鸭2",
      "name": "面板 2",
      ...
    },
    "panel3": {
      "id": "Eagle2Ae@烟肉鸭3",
      "name": "面板 3",
      ...
    }
  },
  "globalSettings": {
    "communicationPort": 8080,
    "autoSaveSettings": true
  }
}
```

---

## 阶段 2: CEP Manifest 配置

### 2.1 修改 manifest.xml
- [ ] 在 `CSXS/manifest.xml` 中定义 3 个扩展面板
- [ ] 为每个面板设置唯一的 Extension ID
- [ ] 配置面板的菜单名称（使用 i18n 变量）
- [ ] 确保所有面板共享同一个 HTML 文件

**参考 kbar 的实现**:
```xml
<Extension Id="com.yanrouya.eagle2ae.panel1" Version="1.0"/>
<Extension Id="com.yanrouya.eagle2ae.panel2" Version="1.0"/>
<Extension Id="com.yanrouya.eagle2ae.panel3" Version="1.0"/>
```

### 2.2 配置 i18n 菜单名称
- [ ] 在 `.debug` 文件中添加面板名称的多语言支持
- [ ] 中文: `Eagle2Ae@烟肉鸭`, `Eagle2Ae@烟肉鸭2`, `Eagle2Ae@烟肉鸭3`
- [ ] 英文: `Eagle2Ae@YanRouYa`, `Eagle2Ae@YanRouYa2`, `Eagle2Ae@YanRouYa3`

---

## 阶段 3: 面板识别与初始化

### 3.1 实现面板 ID 识别
- [ ] 在 `main.js` 中添加获取当前面板 ID 的函数
  ```javascript
  getCurrentPanelId() {
      if (window.cep && window.cep.getExtensionId) {
          return window.cep.getExtensionId();
      }
      return 'com.yanrouya.eagle2ae.panel1'; // 默认
  }
  ```

### 3.2 根据面板 ID 加载对应配置
- [ ] 修改 `loadPresetsFromDisk()` 函数
- [ ] 根据当前面板 ID 加载对应的配置分支
- [ ] Demo 模式下也要支持面板识别

---

## 阶段 4: 配置保存与加载

### 4.1 修改配置保存逻辑
- [ ] 修改 `savePresetsSilently()` 函数
- [ ] 保存时只更新当前面板的配置分支
- [ ] 保持其他面板的配置不变
- [ ] 更新 `currentPanel` 字段

### 4.2 修改配置加载逻辑
- [ ] 修改 `loadSettingsToUI()` 函数
- [ ] 根据当前面板 ID 加载对应的配置
- [ ] 如果配置不存在，使用默认配置初始化

### 4.3 配置迁移
- [ ] 实现旧配置格式到新格式的迁移函数
- [ ] 首次运行时将现有配置迁移到 `panel1`
- [ ] 为 `panel2` 和 `panel3` 创建默认配置

---

## 阶段 5: UI 面板切换功能

### 5.1 添加面板切换按钮
- [ ] 在 HTML 的 `UI Settings` 面板组中添加"面板切换"按钮
- [ ] 按钮位置：在现有 UI 设置按钮下方
- [ ] 添加 i18n 支持（中文：面板切换，英文：Switch Panel）

### 5.2 实现面板切换逻辑
- [ ] 创建 `switchPanel()` 函数
- [ ] 点击按钮时循环切换: panel1 → panel2 → panel3 → panel1
- [ ] 保存当前面板的配置
- [ ] 加载目标面板的配置
- [ ] 更新 UI 显示
- [ ] 更新 `currentPanel` 字段

### 5.3 显示当前面板信息
- [ ] 在 UI 中显示当前面板名称
- [ ] 可以在标题栏或设置面板中显示
- [ ] 例如: "当前面板: 面板 1"

---

## 阶段 6: Demo 模式支持

### 6.1 虚拟文件系统适配
- [ ] 修改 `demo-file-system.js`
- [ ] 支持多面板配置的读写
- [ ] Demo 模式下也能识别当前面板 ID

### 6.2 Demo 模式面板识别
- [ ] 在 Demo 模式下模拟 `getExtensionId()`
- [ ] 可以通过 URL 参数指定面板: `?panel=panel2`
- [ ] 默认使用 `panel1`

### 6.3 网页预览页面
- [ ] 在网页的 iframe 框架中创建 3 个预览页
- [ ] 每个预览页对应一个面板配置
- [ ] 通过 URL 参数区分: `index.html?panel=panel1`

---

## 阶段 7: 测试与验证

### 7.1 CEP 环境测试
- [ ] 测试 3 个面板能否正常打开
- [ ] 测试每个面板的配置独立性
- [ ] 测试面板切换功能
- [ ] 测试配置保存和加载
- [ ] 测试配置迁移功能

### 7.2 Demo 模式测试
- [ ] 测试虚拟文件系统的多面板支持
- [ ] 测试面板切换功能
- [ ] 测试 3 个预览页面
- [ ] 测试配置的持久化

### 7.3 边界情况测试
- [ ] 测试配置文件损坏时的处理
- [ ] 测试面板配置缺失时的默认值
- [ ] 测试同时打开多个面板的情况
- [ ] 测试配置冲突的处理

---

## 阶段 8: 文档与优化

### 8.1 更新文档
- [ ] 更新 README.md 说明多面板功能
- [ ] 创建多面板使用指南
- [ ] 更新配置文件说明文档

### 8.2 代码优化
- [ ] 重构配置管理代码
- [ ] 添加详细的注释
- [ ] 优化性能（减少重复读写）

### 8.3 用户体验优化
- [ ] 添加面板切换动画
- [ ] 添加切换成功提示
- [ ] 优化配置加载速度

---

## 技术要点

### 关键函数需要修改
1. `loadPresetsFromDisk()` - 加载配置
2. `savePresetsSilently()` - 保存配置
3. `loadSettingsToUI()` - 加载 UI 设置
4. `getCurrentPanelId()` - 获取当前面板 ID (新增)
5. `switchPanel()` - 切换面板 (新增)
6. `migrateOldConfig()` - 配置迁移 (新增)

### 需要新增的文件
- 无需新增文件，所有功能在现有文件中实现

### 需要修改的文件
- `CSXS/manifest.xml` - 添加面板定义
- `.debug` - 添加 i18n 菜单名称
- `index.html` - 添加面板切换按钮
- `js/main.js` - 核心逻辑修改
- `js/demo/demo-file-system.js` - Demo 模式支持
- `js/i18n/zh-CN.json` - 中文翻译
- `js/i18n/en-US.json` - 英文翻译

---

## 开发顺序建议

1. **先设计后实现**: 完成配置结构设计和文档
2. **从底层到上层**: 先实现配置管理，再实现 UI
3. **CEP 优先**: 先在 CEP 环境中实现和测试
4. **Demo 模式跟进**: CEP 功能稳定后再适配 Demo 模式
5. **持续测试**: 每完成一个阶段就进行测试

---

## 预计时间

- 阶段 1-2: 配置设计和 Manifest (1-2 小时)
- 阶段 3-4: 核心逻辑实现 (3-4 小时)
- 阶段 5: UI 实现 (2-3 小时)
- 阶段 6: Demo 模式 (2-3 小时)
- 阶段 7-8: 测试和优化 (2-3 小时)

**总计**: 约 10-15 小时

---

## 注意事项

1. **配置兼容性**: 确保旧配置能平滑迁移
2. **数据安全**: 切换面板时不丢失配置
3. **性能考虑**: 避免频繁读写配置文件
4. **用户体验**: 切换过程要流畅，有明确反馈
5. **错误处理**: 配置损坏时要有降级方案

---

## 参考资料

- kbar 多面板实现: `resources/reference/kbar-3.1.2/`
- 当前配置结构: `resources/reference/Eagle2Ae-Presets.json`
- Spec 设计文档: `.kiro/specs/multi-panel-config-system/`
