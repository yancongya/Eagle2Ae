# Eagle2Ae 多面板文件配置方案

## 🎯 目标

参考 MotionToolsPro 的方式，实现：
1. 每个面板有独立的本地 JSON 配置文件
2. 修改配置后保存到对应的文件
3. 面板切换通过按钮直接切换配置，而不是打开新窗口

## 📁 文件结构

```
apps/eagle2ae_web/public/extensions/ae/
├── configs/                          # 🔥 新增：配置文件目录
│   ├── panel1-config.json           # Panel 1 的配置
│   ├── panel2-config.json           # Panel 2 的配置
│   └── panel3-config.json           # Panel 3 的配置
├── js/
│   ├── main.js
│   └── utils/
│       └── PanelConfigManager.js    # 🔥 新增：面板配置管理器
└── index.html
```

## 🔧 实施方案

### 方案 1: 单窗口 + 配置文件切换（推荐）

**特点**：
- 只有一个物理窗口
- 点击按钮切换配置文件
- 配置保存到本地 JSON 文件
- 类似 MotionToolsPro 的体验

**优势**：
- 不需要 CEP API 支持
- 配置文件易于管理和备份
- 切换速度快
- 可以导入导出配置

### 方案 2: 多窗口 + 独立配置文件

**特点**：
- 3 个独立窗口
- 每个窗口加载自己的配置文件
- 配置完全隔离

**劣势**：
- 需要 CEP API 支持（当前不可用）
- 资源占用更多

## 💡 推荐实施方案 1

### Step 1: 创建配置文件目录和默认配置

创建 3 个默认配置文件：

**configs/panel1-config.json**（默认配置）：
```json
{
  "panelId": "panel1",
  "panelName": "默认配置",
  "version": "1.0.0",
  "lastModified": "2024-01-01T00:00:00.000Z",
  "importSettings": {
    "importMode": "project_adjacent",
    "folderName": "Eagle_Assets",
    "createSubfolders": true,
    "importToComp": true,
    "noImportSubMode": "normal"
  },
  "userPreferences": {
    "autoConnect": true,
    "showNotifications": true,
    "language": "zh-CN",
    "theme": "dark"
  }
}
```

**configs/panel2-config.json**（快速预览）：
```json
{
  "panelId": "panel2",
  "panelName": "快速预览",
  "version": "1.0.0",
  "lastModified": "2024-01-01T00:00:00.000Z",
  "importSettings": {
    "importMode": "project_adjacent",
    "folderName": "Preview_Assets",
    "createSubfolders": false,
    "importToComp": true,
    "noImportSubMode": "pre_comp"
  },
  "userPreferences": {
    "autoConnect": true,
    "showNotifications": true,
    "language": "zh-CN",
    "theme": "dark"
  }
}
```

**configs/panel3-config.json**（音频项目）：
```json
{
  "panelId": "panel3",
  "panelName": "音频项目",
  "version": "1.0.0",
  "lastModified": "2024-01-01T00:00:00.000Z",
  "importSettings": {
    "importMode": "custom_folder",
    "folderPath": "",
    "createSubfolders": true,
    "importToComp": false,
    "noImportSubMode": "normal"
  },
  "userPreferences": {
    "autoConnect": true,
    "showNotifications": true,
    "language": "zh-CN",
    "theme": "dark"
  }
}
```

### Step 2: 创建 PanelConfigManager 类

**js/utils/PanelConfigManager.js**：
```javascript
/**
 * 面板配置管理器
 * 负责加载、保存、切换面板配置文件
 */
class PanelConfigManager {
    constructor() {
        this.currentPanelId = 'panel1';
        this.configCache = {};
        this.fs = null;
        this.path = null;
        this.configDir = '';
        
        // 初始化 Node.js 模块
        this.initNodeModules();
    }
    
    /**
     * 初始化 Node.js 模块
     */
    initNodeModules() {
        try {
            if (typeof require !== 'undefined') {
                this.fs = require('fs');
                this.path = require('path');
                
                // 获取配置文件目录路径
                const extensionRoot = this.path.dirname(window.__adobe_cep__.getSystemPath('extension'));
                this.configDir = this.path.join(extensionRoot, 'configs');
                
                // 确保配置目录存在
                if (!this.fs.existsSync(this.configDir)) {
                    this.fs.mkdirSync(this.configDir, { recursive: true });
                    console.log('[Config Manager] 创建配置目录:', this.configDir);
                }
                
                console.log('[Config Manager] Node.js 模块初始化成功');
                console.log('[Config Manager] 配置目录:', this.configDir);
            } else {
                console.warn('[Config Manager] require 不可用，将使用 localStorage');
            }
        } catch (error) {
            console.error('[Config Manager] Node.js 模块初始化失败:', error);
        }
    }
    
    /**
     * 获取配置文件路径
     */
    getConfigFilePath(panelId) {
        if (!this.path || !this.configDir) {
            return null;
        }
        return this.path.join(this.configDir, `${panelId}-config.json`);
    }
    
    /**
     * 加载面板配置
     */
    async loadConfig(panelId) {
        console.log(`[Config Manager] 加载配置: ${panelId}`);
        
        // 如果有缓存，直接返回
        if (this.configCache[panelId]) {
            console.log(`[Config Manager] 使用缓存配置: ${panelId}`);
            return this.configCache[panelId];
        }
        
        // 尝试从文件加载
        if (this.fs && this.path) {
            try {
                const configPath = this.getConfigFilePath(panelId);
                if (this.fs.existsSync(configPath)) {
                    const configData = this.fs.readFileSync(configPath, 'utf8');
                    const config = JSON.parse(configData);
                    this.configCache[panelId] = config;
                    console.log(`[Config Manager] 从文件加载配置成功: ${configPath}`);
                    return config;
                } else {
                    console.log(`[Config Manager] 配置文件不存在，创建默认配置: ${configPath}`);
                    const defaultConfig = this.getDefaultConfig(panelId);
                    await this.saveConfig(panelId, defaultConfig);
                    return defaultConfig;
                }
            } catch (error) {
                console.error(`[Config Manager] 从文件加载配置失败:`, error);
            }
        }
        
        // 降级到 localStorage
        try {
            const storageKey = `eagle2ae_${panelId}_config`;
            const configData = localStorage.getItem(storageKey);
            if (configData) {
                const config = JSON.parse(configData);
                this.configCache[panelId] = config;
                console.log(`[Config Manager] 从 localStorage 加载配置成功`);
                return config;
            }
        } catch (error) {
            console.error(`[Config Manager] 从 localStorage 加载配置失败:`, error);
        }
        
        // 返回默认配置
        const defaultConfig = this.getDefaultConfig(panelId);
        this.configCache[panelId] = defaultConfig;
        return defaultConfig;
    }
    
    /**
     * 保存面板配置
     */
    async saveConfig(panelId, config) {
        console.log(`[Config Manager] 保存配置: ${panelId}`);
        
        // 更新时间戳
        config.lastModified = new Date().toISOString();
        
        // 更新缓存
        this.configCache[panelId] = config;
        
        // 尝试保存到文件
        if (this.fs && this.path) {
            try {
                const configPath = this.getConfigFilePath(panelId);
                const configData = JSON.stringify(config, null, 2);
                this.fs.writeFileSync(configPath, configData, 'utf8');
                console.log(`[Config Manager] 保存配置到文件成功: ${configPath}`);
                return true;
            } catch (error) {
                console.error(`[Config Manager] 保存配置到文件失败:`, error);
            }
        }
        
        // 降级到 localStorage
        try {
            const storageKey = `eagle2ae_${panelId}_config`;
            const configData = JSON.stringify(config);
            localStorage.setItem(storageKey, configData);
            console.log(`[Config Manager] 保存配置到 localStorage 成功`);
            return true;
        } catch (error) {
            console.error(`[Config Manager] 保存配置到 localStorage 失败:`, error);
            return false;
        }
    }
    
    /**
     * 切换到指定面板配置
     */
    async switchToPanel(panelId) {
        console.log(`[Config Manager] 切换到面板: ${panelId}`);
        
        // 保存当前配置
        if (window.aeExtension) {
            const currentConfig = this.getCurrentConfig();
            await this.saveConfig(this.currentPanelId, currentConfig);
        }
        
        // 加载目标配置
        const targetConfig = await this.loadConfig(panelId);
        this.currentPanelId = panelId;
        
        // 应用配置到界面
        if (window.aeExtension) {
            this.applyConfigToUI(targetConfig);
        }
        
        return targetConfig;
    }
    
    /**
     * 获取当前配置
     */
    getCurrentConfig() {
        if (!window.aeExtension) {
            return this.getDefaultConfig(this.currentPanelId);
        }
        
        return {
            panelId: this.currentPanelId,
            panelName: window.aeExtension.getPanelDisplayName(),
            version: '1.0.0',
            lastModified: new Date().toISOString(),
            importSettings: window.aeExtension.settingsManager?.getSettings() || {},
            userPreferences: window.aeExtension.settingsManager?.getPreferences() || {}
        };
    }
    
    /**
     * 应用配置到界面
     */
    applyConfigToUI(config) {
        console.log('[Config Manager] 应用配置到界面');
        
        if (!window.aeExtension) {
            console.warn('[Config Manager] aeExtension 不可用');
            return;
        }
        
        // 应用导入设置
        if (config.importSettings && window.aeExtension.settingsManager) {
            window.aeExtension.settingsManager.settings = { ...config.importSettings };
        }
        
        // 应用用户偏好
        if (config.userPreferences && window.aeExtension.settingsManager) {
            window.aeExtension.settingsManager.preferences = { ...config.userPreferences };
        }
        
        // 刷新界面
        if (typeof window.aeExtension.loadSettingsToUI === 'function') {
            window.aeExtension.loadSettingsToUI();
        }
        
        // 更新标题
        if (typeof window.updatePanelTitle === 'function') {
            window.updatePanelTitle();
        }
        
        console.log('[Config Manager] 配置应用完成');
    }
    
    /**
     * 获取默认配置
     */
    getDefaultConfig(panelId) {
        const defaultConfigs = {
            'panel1': {
                panelId: 'panel1',
                panelName: '默认配置',
                version: '1.0.0',
                lastModified: new Date().toISOString(),
                importSettings: {
                    importMode: 'project_adjacent',
                    folderName: 'Eagle_Assets',
                    createSubfolders: true,
                    importToComp: true,
                    noImportSubMode: 'normal'
                },
                userPreferences: {
                    autoConnect: true,
                    showNotifications: true,
                    language: 'zh-CN',
                    theme: 'dark'
                }
            },
            'panel2': {
                panelId: 'panel2',
                panelName: '快速预览',
                version: '1.0.0',
                lastModified: new Date().toISOString(),
                importSettings: {
                    importMode: 'project_adjacent',
                    folderName: 'Preview_Assets',
                    createSubfolders: false,
                    importToComp: true,
                    noImportSubMode: 'pre_comp'
                },
                userPreferences: {
                    autoConnect: true,
                    showNotifications: true,
                    language: 'zh-CN',
                    theme: 'dark'
                }
            },
            'panel3': {
                panelId: 'panel3',
                panelName: '音频项目',
                version: '1.0.0',
                lastModified: new Date().toISOString(),
                importSettings: {
                    importMode: 'custom_folder',
                    folderPath: '',
                    createSubfolders: true,
                    importToComp: false,
                    noImportSubMode: 'normal'
                },
                userPreferences: {
                    autoConnect: true,
                    showNotifications: true,
                    language: 'zh-CN',
                    theme: 'dark'
                }
            }
        };
        
        return defaultConfigs[panelId] || defaultConfigs['panel1'];
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PanelConfigManager;
}
```

### Step 3: 修改面板切换逻辑

修改 `initPanelSwitcher()` 函数：

```javascript
function initPanelSwitcher() {
    const switchButtons = document.querySelectorAll('.panel-switch-btn');
    const currentPanelId = aeExtension.currentPanelId;
    
    // 提取面板编号
    const currentPanelNumber = currentPanelId.includes('panel1') ? '1' : 
                               currentPanelId.includes('panel2') ? '2' : 
                               currentPanelId.includes('panel3') ? '3' : '1';
    
    switchButtons.forEach(btn => {
        const targetPanel = btn.dataset.panel;
        const panelNumber = targetPanel.replace('panel', '');
        
        // 高亮当前面板按钮
        if (panelNumber === currentPanelNumber) {
            btn.classList.add('active');
        }
        
        // 添加点击事件 - 🔥 使用配置切换而不是打开新窗口
        btn.addEventListener('click', async () => {
            console.log(`[Panel Switcher] 切换到面板: ${targetPanel}`);
            
            // 移除所有按钮的 active 状态
            switchButtons.forEach(b => b.classList.remove('active'));
            
            // 添加当前按钮的 active 状态
            btn.classList.add('active');
            
            // 切换配置
            if (window.panelConfigManager) {
                try {
                    await window.panelConfigManager.switchToPanel(targetPanel);
                    aeExtension.log(`已切换到面板 ${panelNumber}`, 'info');
                } catch (error) {
                    console.error('[Panel Switcher] 切换配置失败:', error);
                    aeExtension.log(`切换面板失败: ${error.message}`, 'error');
                }
            } else {
                console.error('[Panel Switcher] panelConfigManager 不可用');
                aeExtension.log('配置管理器未初始化', 'error');
            }
        });
    });
    
    console.log(`[Panel Switcher] 面板切换器初始化完成，当前面板: ${currentPanelNumber}`);
}
```

### Step 4: 在 DOMContentLoaded 中初始化

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    aeExtension = new AEExtension();
    window.eagleToAeApp = aeExtension;
    window.aeExtension = aeExtension;
    
    // 🔥 初始化配置管理器
    window.panelConfigManager = new PanelConfigManager();
    
    // 🔥 加载当前面板配置
    const currentPanelId = aeExtension.currentPanelId.includes('panel1') ? 'panel1' :
                          aeExtension.currentPanelId.includes('panel2') ? 'panel2' :
                          aeExtension.currentPanelId.includes('panel3') ? 'panel3' : 'panel1';
    
    const config = await window.panelConfigManager.loadConfig(currentPanelId);
    window.panelConfigManager.applyConfigToUI(config);
    
    // 更新标题和初始化切换器
    updatePanelTitle();
    initPanelSwitcher();
    
    // 输出面板信息
    console.log('='.repeat(60));
    console.log('[Eagle2Ae] 面板初始化完成');
    console.log(`[Eagle2Ae] 面板 ID: ${aeExtension.currentPanelId}`);
    console.log(`[Eagle2Ae] 面板名称: ${aeExtension.getPanelDisplayName()}`);
    console.log(`[Eagle2Ae] 配置文件: ${currentPanelId}-config.json`);
    console.log('='.repeat(60));
    
    // ... 其他初始化代码
});
```

### Step 5: 自动保存配置

在配置变更时自动保存：

```javascript
// 在 settingsManager 的 updateField 方法中添加
updateField(field, value, saveToStorage = true, reloadUI = true) {
    // ... 现有代码
    
    // 🔥 保存到配置文件
    if (saveToStorage && window.panelConfigManager) {
        const currentConfig = window.panelConfigManager.getCurrentConfig();
        window.panelConfigManager.saveConfig(
            window.panelConfigManager.currentPanelId,
            currentConfig
        );
    }
    
    return { success: true };
}
```

## 📊 方案对比

### 当前问题
- ❌ 所有面板共享配置
- ❌ CEP API 不可用
- ❌ 无法打开其他面板

### 新方案
- ✅ 每个面板独立配置文件
- ✅ 不依赖 CEP API
- ✅ 单窗口快速切换
- ✅ 配置文件易于管理
- ✅ 可以导入导出配置

## 🎯 实施步骤

1. 创建 `PanelConfigManager.js` 文件
2. 创建 `configs/` 目录和默认配置文件
3. 修改 `initPanelSwitcher()` 函数
4. 修改 `DOMContentLoaded` 初始化逻辑
5. 添加自动保存功能
6. 测试配置切换和保存

准备好了吗？我可以立即开始实施！
