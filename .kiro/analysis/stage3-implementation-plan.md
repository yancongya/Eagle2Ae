# 阶段 3: 面板识别与初始化 - 实施计划

## 目标
实现面板 ID 识别功能，使每个面板能够自动加载对应的配置。

---

## 任务分解

### 任务 3.1: 实现面板 ID 识别函数

#### 位置
`apps/eagle2ae_web/public/extensions/ae/js/main.js`

#### 实现代码
```javascript
/**
 * 获取当前面板 ID
 * @returns {string} 面板 ID
 */
getCurrentPanelId() {
    // CEP 环境：从 CEP API 获取
    if (window.cep && window.cep.getExtensionId) {
        const extensionId = window.cep.getExtensionId();
        console.log('[Panel ID] CEP 环境，面板 ID:', extensionId);
        return extensionId;
    }
    
    // Demo 模式：从 URL 参数获取
    const urlParams = new URLSearchParams(window.location.search);
    const panelParam = urlParams.get('panel');
    
    if (panelParam) {
        // 支持简写：panel=panel1 或 panel=1
        const panelId = panelParam.startsWith('panel') 
            ? `com.yanrouya.eagle2ae.${panelParam}`
            : `com.yanrouya.eagle2ae.panel${panelParam}`;
        console.log('[Panel ID] Demo 模式，URL 参数:', panelParam, '→', panelId);
        return panelId;
    }
    
    // 默认面板
    const defaultId = 'com.yanrouya.eagle2ae.panel1';
    console.log('[Panel ID] 使用默认面板:', defaultId);
    return defaultId;
}

/**
 * 获取面板显示名称
 * @returns {string} 面板名称
 */
getPanelDisplayName() {
    const panelId = this.getCurrentPanelId();
    const names = {
        'com.yanrouya.eagle2ae.panel1': '默认配置',
        'com.yanrouya.eagle2ae.panel2': '快速预览',
        'com.yanrouya.eagle2ae.panel3': '音频项目'
    };
    return names[panelId] || '未知面板';
}
```

#### 调用位置
在 `constructor()` 中初始化：
```javascript
constructor() {
    // ... 现有代码 ...
    
    // 识别当前面板
    this.currentPanelId = this.getCurrentPanelId();
    this.panelDisplayName = this.getPanelDisplayName();
    
    console.log(`[Init] 当前面板: ${this.panelDisplayName} (${this.currentPanelId})`);
}
```

---

### 任务 3.2: 修改配置加载逻辑

#### 3.2.1 修改 `loadPresetsFromDisk()`

**当前逻辑**:
```javascript
loadPresetsFromDisk() {
    // 读取整个配置文件
    const presets = readFile('Eagle2Ae-Presets.json');
    return presets;
}
```

**新逻辑**:
```javascript
loadPresetsFromDisk() {
    console.log('[Config] 开始加载配置...');
    
    // 读取完整配置文件
    const fullConfig = this.readConfigFile();
    
    if (!fullConfig || !fullConfig.panels) {
        console.warn('[Config] 配置文件格式错误或不存在，使用默认配置');
        return this.createDefaultConfig();
    }
    
    // 获取当前面板 ID
    const panelId = this.currentPanelId;
    
    // 获取当前面板的配置
    let panelConfig = fullConfig.panels[panelId];
    
    if (!panelConfig) {
        console.warn(`[Config] 面板 ${panelId} 的配置不存在，创建默认配置`);
        panelConfig = this.createDefaultPanelConfig();
        
        // 保存默认配置
        fullConfig.panels[panelId] = panelConfig;
        this.saveConfigFile(fullConfig);
    }
    
    // 合并全局设置
    const config = {
        ...panelConfig,
        globalSettings: fullConfig.globalSettings,
        metadata: fullConfig.metadata
    };
    
    console.log(`[Config] 已加载面板配置: ${this.panelDisplayName}`);
    return config;
}
```

#### 3.2.2 添加辅助函数

```javascript
/**
 * 读取完整配置文件
 */
readConfigFile() {
    if (window.__DEMO_MODE_ACTIVE__) {
        // Demo 模式：从虚拟文件系统读取
        const result = window.demoFileSystem.readFile('Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json');
        if (result.success) {
            return JSON.parse(result.content);
        }
        return null;
    } else {
        // CEP 模式：从磁盘读取
        const path = this.getPresetsFilePath();
        const result = window.cep.fs.readFile(path);
        if (result.err === 0) {
            return JSON.parse(result.data);
        }
        return null;
    }
}

/**
 * 保存完整配置文件
 */
saveConfigFile(fullConfig) {
    // 更新元数据
    fullConfig.metadata = fullConfig.metadata || {};
    fullConfig.metadata.lastModified = new Date().toISOString();
    fullConfig.metadata.modifiedBy = this.currentPanelId;
    
    const content = JSON.stringify(fullConfig, null, 2);
    
    if (window.__DEMO_MODE_ACTIVE__) {
        // Demo 模式：保存到虚拟文件系统
        window.demoFileSystem.writeFile(
            'Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json',
            content
        );
    } else {
        // CEP 模式：保存到磁盘
        const path = this.getPresetsFilePath();
        window.cep.fs.writeFile(path, content);
    }
}

/**
 * 创建默认面板配置
 */
createDefaultPanelConfig() {
    return {
        name: this.getPanelDisplayName(),
        description: "默认配置",
        lastUsed: new Date().toISOString(),
        importSettings: {
            mode: "project_adjacent",
            projectAdjacentFolder: "Eagle_Assets",
            customFolderPath: "",
            addToComposition: true,
            // ... 其他默认设置
        },
        uiSettings: {
            theme: false,
            language: true,
            log: true,
            projectInfo: true,
            logPanel: true,
            header: true,
            fullscreen: false
        },
        language: "zh-CN",
        aeTheme: "dark",
        // ... 其他默认设置
    };
}
```

---

### 任务 3.3: 网页 iframe 预览页面支持

#### 3.3.1 修改 AE_Preview.vue

**位置**: `apps/eagle2ae_web/src/views/AE_Preview.vue`

**修改内容**:
```vue
<template>
  <div ref="pageRef" class="h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto h-full p-4">
      <!-- Mobile: single preview -->
      <div class="md:hidden h-full">
        <iframe src="/extensions/ae/index.html?panel=panel1" class="w-full h-full border-0"></iframe>
      </div>
      
      <!-- Desktop: three-pane preview -->
      <div class="hidden md:block h-full">
        <splitpanes class="default-theme h-full" horizontal>
          <!-- Left Pane (Panel 1 - 默认配置) -->
          <pane :size="70">
            <div class="h-full flex flex-col">
              <div class="bg-blue-500 text-white px-4 py-2 text-sm font-medium">
                面板 1: 默认配置
              </div>
              <iframe src="/extensions/ae/index.html?panel=panel1" class="flex-1 w-full border-0"></iframe>
            </div>
          </pane>
          
          <!-- Right Panes -->
          <pane :size="30">
            <splitpanes>
              <!-- Top-Right Pane (Panel 2 - 快速预览) -->
              <pane :size="50">
                <div class="h-full flex flex-col">
                  <div class="bg-green-500 text-white px-4 py-2 text-sm font-medium">
                    面板 2: 快速预览
                  </div>
                  <iframe src="/extensions/ae/index.html?panel=panel2" class="flex-1 w-full border-0"></iframe>
                </div>
              </pane>
              
              <!-- Bottom-Right Pane (Panel 3 - 音频项目) -->
              <pane :size="50">
                <div class="h-full flex flex-col">
                  <div class="bg-purple-500 text-white px-4 py-2 text-sm font-medium">
                    面板 3: 音频项目
                  </div>
                  <iframe src="/extensions/ae/index.html?panel=panel3" class="flex-1 w-full border-0"></iframe>
                </div>
              </pane>
            </splitpanes>
          </pane>
        </splitpanes>
      </div>
    </div>
  </div>
</template>
```

#### 3.3.2 确保虚拟文件系统支持

**检查点**:
1. `demo-file-system.js` 已经支持读写 JSON 文件 ✓
2. 多面板配置文件已经创建 ✓
3. 需要确保初始化时加载多面板配置

**实现**:
在 `demo-mode.js` 或初始化脚本中：
```javascript
// 初始化多面板配置
if (window.__DEMO_MODE_ACTIVE__ && window.demoFileSystem) {
    // 检查配置文件是否存在
    const configPath = 'Eagle2Ae-Ae/presets/Eagle2Ae-Presets.json';
    
    if (!window.demoFileSystem.exists(configPath)) {
        // 加载默认的多面板配置
        fetch('/resources/reference/Eagle2Ae-Presets-MultiPanel.json')
            .then(res => res.json())
            .then(config => {
                window.demoFileSystem.writeFile(configPath, JSON.stringify(config, null, 2));
                console.log('[Demo] 已初始化多面板配置');
            });
    }
}
```

---

## 测试计划

### CEP 环境测试

#### 测试 1: 面板 ID 识别
1. 分别打开 3 个面板
2. 检查控制台日志
3. 预期：每个面板显示正确的 ID

#### 测试 2: 配置加载
1. 在 Panel 1 中修改设置
2. 关闭并重新打开 Panel 1
3. 预期：设置被正确保存和加载

#### 测试 3: 配置独立性
1. 在 Panel 1 中设置导入模式为"桌面"
2. 在 Panel 2 中设置导入模式为"项目相邻"
3. 预期：两个面板的设置互不影响

### Demo 模式测试

#### 测试 4: URL 参数识别
1. 访问 `index.html?panel=panel1`
2. 访问 `index.html?panel=panel2`
3. 访问 `index.html?panel=panel3`
4. 预期：每个页面加载对应的配置

#### 测试 5: 网页预览页面
1. 访问 AE 预览页面
2. 检查 3 个 iframe 是否正常显示
3. 预期：3 个面板独立运行，配置不同

#### 测试 6: 虚拟文件系统
1. 在 Panel 1 中修改设置并保存
2. 刷新页面
3. 预期：设置被正确保存到虚拟文件系统

---

## 预期结果

### 功能验证
- ✅ 每个面板能正确识别自己的 ID
- ✅ 每个面板加载对应的配置
- ✅ 配置修改只影响当前面板
- ✅ Demo 模式支持 URL 参数
- ✅ 网页预览页面显示 3 个独立面板

### 日志输出示例
```
[Panel ID] CEP 环境，面板 ID: com.yanrouya.eagle2ae.panel2
[Init] 当前面板: 快速预览 (com.yanrouya.eagle2ae.panel2)
[Config] 开始加载配置...
[Config] 已加载面板配置: 快速预览
```

---

## 下一步

完成阶段 3 后，进入 **阶段 4: 配置保存与加载**，实现：
1. 修改 `savePresetsSilently()` 函数
2. 只更新当前面板的配置分支
3. 保持其他面板配置不变
4. 实现配置迁移功能
