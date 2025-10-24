# Eagle2Ae 多面板功能开发任务清单

## 项目目标
实现 3 个独立的扩展面板，每个面板有独立的配置，所有配置保存在一个 JSON 文件中。

## 面板信息
- **面板 1**: `Eagle2Ae@烟肉鸭` (默认面板)
- **面板 2**: `Eagle2Ae@烟肉鸭2`
- **面板 3**: `Eagle2Ae@烟肉鸭3`

---

## 阶段 1: 配置文件结构设计 ✅

### 1.1 设计多面板配置 JSON 结构 ✅
- [x] 创建新的配置文件结构设计文档
- [x] 定义面板配置的数据模型
  - 每个面板有独立的 `importSettings`、`uiSettings` 等
  - ~~添加 `currentPanel` 字段~~ (已移除，不需要)
  - 添加 `panels` 对象存储 3 个面板的配置
  - 添加 `metadata` 记录配置元信息

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

## 阶段 3: 面板识别与初始化 ✅

### 3.1 实现面板 ID 识别 ✅
- [x] 在 `main.js` 中添加 `getCurrentPanelId()` 函数
  - 支持 CEP 环境 (通过 CSInterface.getExtensionID)
  - 支持 Demo 模式 (通过 URL 参数)
  - 默认返回 panel1
- [x] 在 `main.js` 中添加 `getPanelDisplayName()` 函数
  - 返回面板的显示名称

### 3.2 根据面板 ID 加载对应配置 ✅
- [x] ConfigManager 根据当前面板 ID 加载配置
- [x] Demo 模式支持面板识别 (通过 URL 参数 `?panel=panel1`)

---

## 阶段 4: 配置保存与加载 ⏸️ (已暂停)

### 4.1 创建 ConfigManager 模块 ✅
- [x] 创建 `js/utils/ConfigManager.js` 独立模块
- [x] 在 `index.html` 中引入 ConfigManager
- [x] 在 `main.js` 中集成 ConfigManager

### 4.2 配置文件操作 ✅
- [x] 实现 `loadConfigFile()` - 加载完整配置文件
  - 支持虚拟文件系统 (Demo模式)
  - 支持 Node.js fs (CEP环境)
  - 支持 fetch (后备方案)
- [x] 实现 `saveConfigFile()` - 保存完整配置文件
  - 自动更新 metadata
  - 支持多种保存方式
- [x] 实现 `getExtensionRoot()` - 获取扩展根目录

### 4.3 面板配置操作 ✅
- [x] 实现 `loadPanelConfig()` - 加载当前面板配置
- [x] 实现 `savePanelConfig()` - 保存当前面板配置
- [x] 实现 `collectPanelConfig()` - 收集当前配置
- [x] 实现 `applyPanelConfigToSettingsManager()` - 应用配置到 settingsManager

### 4.4 配置迁移 ✅
- [x] 实现 `checkIfNeedsMigration()` - 检查是否需要迁移
- [x] 实现 `migrateOldConfig()` - 迁移旧配置到新格式
- [x] 实现 `convertOldConfigToPanelConfig()` - 转换配置格式
- [x] 实现 `migrateTheme()` - 主题值迁移
- [x] 使用迁移标记避免重复迁移

### 4.5 默认配置生成 ✅
- [x] 实现 `getDefaultConfig()` - 默认完整配置
- [x] 实现 `getDefaultPanelConfig()` - 默认面板配置
- [x] 实现 `getDefaultImportSettings()` - 默认导入设置
- [x] 实现 `getDefaultUserPreferences()` - 默认用户偏好
- [x] 实现 `getDefaultUISettings()` - 默认UI设置

### 4.6 自动保存机制 ✅
- [x] 实现 `setupAutoSave()` - 设置自动保存监听
- [x] 实现 `debouncedSave()` - 防抖保存 (500ms)

### 4.7 配置初始化流程 ✅
- [x] 实现 `init()` - 异步配置初始化
  - 加载配置文件
  - 检查并执行迁移
  - 加载面板配置
  - 应用到 settingsManager
  - 设置自动保存

### 4.8 待优化项 ⚠️
- [ ] 添加配置验证机制
- [ ] 添加配置备份机制
- [ ] 优化防抖时间 (500ms → 2000ms)
- [ ] 优化 ConfigManager 与 SettingsManager 的职责划分
- [ ] 添加配置变更通知机制

---

## 阶段 5: UI 面板切换功能 🎯

### 5.1 添加面板切换下拉菜单
- [ ] 在标题栏中间（标题和右侧按钮组之间）添加 `<select>` 下拉菜单
- [ ] 下拉菜单包含3个选项：
  - 选项1: "默认配置" (panel1)
  - 选项2: "快速预览" (panel2)
  - 选项3: "音频项目" (panel3)
- [ ] CSS 样式：
  - 自适应宽度（flex-grow）
  - 与标题栏风格一致
  - 支持深色/浅色主题
- [ ] 添加 i18n 支持（中文/英文）

### 5.2 实现面板切换逻辑
- [ ] 创建 `switchToPanel(panelId)` 函数
- [ ] 切换流程：
  1. 保存当前面板的配置到 localStorage
  2. 从 localStorage 加载目标面板的配置
  3. 应用配置到 settingsManager
  4. 刷新 UI（重新加载设置到界面）
  5. 更新下拉菜单的选中状态
- [ ] 监听下拉菜单的 `change` 事件
- [ ] 添加切换动画/过渡效果（可选）

### 5.3 配置存储方案（简化版）
- [ ] 使用 localStorage 存储每个面板的配置
  - Key: `eagle2ae_panel1_config`
  - Key: `eagle2ae_panel2_config`
  - Key: `eagle2ae_panel3_config`
- [ ] 配置内容：
  - importSettings
  - userPreferences
  - uiSettings
  - language
  - aeTheme
- [ ] 首次加载时，如果面板配置不存在，使用默认配置

### 5.4 UI 更新
- [ ] 修改标题栏 HTML 结构：
  ```html
  <div class="header-title-bar">
    <h1>Eagle2Ae</h1>
    <select id="panel-selector" class="panel-selector">
      <option value="panel1">默认配置</option>
      <option value="panel2">快速预览</option>
      <option value="panel3">音频项目</option>
    </select>
    <div class="header-buttons">
      <!-- 现有按钮 -->
    </div>
  </div>
  ```
- [ ] 添加 CSS 样式
- [ ] 确保响应式布局正常

### 5.5 测试
- [ ] 测试面板切换功能
- [ ] 测试配置保存和加载
- [ ] 测试刷新后配置保持
- [ ] 测试不同面板的独立性

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

### 关键函数实现状态
1. ✅ `getCurrentPanelId()` - 获取当前面板 ID (已实现)
2. ✅ `getPanelDisplayName()` - 获取面板显示名称 (已实现)
3. ✅ `ConfigManager.loadConfigFile()` - 加载配置文件 (已实现)
4. ✅ `ConfigManager.saveConfigFile()` - 保存配置文件 (已实现)
5. ✅ `ConfigManager.loadPanelConfig()` - 加载面板配置 (已实现)
6. ✅ `ConfigManager.savePanelConfig()` - 保存面板配置 (已实现)
7. ✅ `ConfigManager.migrateOldConfig()` - 配置迁移 (已实现)
8. ⏳ `switchPanel()` - 切换面板 (待实现 - 阶段5)
9. ⏳ `applyConfigToUI()` - 应用配置到UI (待实现 - 阶段5)

### 已新增的文件
- ✅ `js/utils/ConfigManager.js` - 配置管理器模块 (阶段4)

### 已修改的文件
- ✅ `index.html` - 引入 ConfigManager (阶段4)
- ✅ `js/main.js` - 集成 ConfigManager (阶段4)

### 待修改的文件
- ⏳ `CSXS/manifest.xml` - 添加面板定义 (阶段2)
- ⏳ `.debug` - 添加 i18n 菜单名称 (阶段2)
- ⏳ `index.html` - 添加面板切换按钮 (阶段5)
- ⏳ `js/main.js` - 添加面板切换逻辑 (阶段5)
- ⏳ `js/demo/demo-file-system.js` - Demo 模式支持 (阶段6)
- ⏳ `js/i18n/zh-CN.json` - 中文翻译 (阶段5)
- ⏳ `js/i18n/en-US.json` - 英文翻译 (阶段5)

---

## 开发顺序建议

1. **先设计后实现**: 完成配置结构设计和文档
2. **从底层到上层**: 先实现配置管理，再实现 UI
3. **CEP 优先**: 先在 CEP 环境中实现和测试
4. **Demo 模式跟进**: CEP 功能稳定后再适配 Demo 模式
5. **持续测试**: 每完成一个阶段就进行测试

---

## 预计时间

- ✅ 阶段 1: 配置设计 (已完成)
- ⏳ 阶段 2: Manifest 配置 (1-2 小时)
- ✅ 阶段 3: 面板识别 (已完成)
- ✅ 阶段 4: 配置管理 (已完成)
- ⏳ 阶段 5: UI 实现 (2-3 小时)
- ⏳ 阶段 6: Demo 模式 (2-3 小时)
- ⏳ 阶段 7-8: 测试和优化 (2-3 小时)

**已完成**: 约 4-5 小时  
**剩余**: 约 7-11 小时  
**总计**: 约 11-16 小时

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
