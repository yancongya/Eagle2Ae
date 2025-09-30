# AE插件函数功能映射表

## 概述

本文档详细映射Eagle2Ae AE插件中每个UI组件对应的JavaScript函数、事件处理器和运行逻辑，为开发者提供完整的代码功能参考。

## 1. 主程序入口和初始化

### 1.1 应用初始化

```javascript
// 主应用类 - main.js
class EagleToAeApp {
    constructor() {
        this.connectionManager = new ConnectionManager();
        this.pollingManager = new PollingManager();
        this.connectionQualityMonitor = new ConnectionQualityMonitor();
        this.websocketClient = new WebSocketClient();
        this.portDiscoveryService = new PortDiscoveryService();
        this.logManager = new LogManager();
        this.settingsManager = new SettingsManager();
        this.fileProcessor = new FileProcessor();
        this.soundPlayer = new SoundPlayer();
    }

    // 异步初始化方法
    async initialize() {
        await this.initializeComponents();
        await this.setupEventListeners();
        await this.loadSettings();
        await this.startConnectionAttempt();
    }
}
```

### 1.2 组件初始化映射

| 组件 | 初始化函数 | 功能描述 |
|------|------------|----------|
| ConnectionManager | `initializeConnectionManager()` | 管理与Eagle的连接状态 |
| PollingManager | `initializePollingManager()` | 处理定期轮询任务 |
| WebSocketClient | `initializeWebSocketClient()` | WebSocket通信客户端 |
| PortDiscoveryService | `initializePortDiscovery()` | 自动发现Eagle端口 |
| LogManager | `initializeLogManager()` | 日志系统管理 |
| SettingsManager | `initializeSettingsManager()` | 设置存储和管理 |
| FileProcessor | `initializeFileProcessor()` | 文件处理和导入 |
| SoundPlayer | `initializeSoundPlayer()` | 音效播放功能 |

## 2. UI组件事件映射

### 2.1 标题栏组件

#### 日志面板切换按钮
```javascript
// 元素ID: log-panel-toggle
// 事件: click
// 处理函数: AEExtension.toggleLogPanel() in main.js

// 逻辑概述:
// 该函数在 AEExtension 类的 setupUI 方法中被绑定到按钮的 click 事件。
toggleLogPanel() {
    const logSection = document.querySelector('.section.log');
    const logPanelToggle = document.getElementById('log-panel-toggle');

    if (logSection) {
        // 切换 .visible 类来控制显示状态
        const isVisible = logSection.classList.toggle('visible');
        // 直接修改 display 样式以确保显示/隐藏
        logSection.style.display = isVisible ? 'flex' : 'none';

        if (logPanelToggle) {
            // 根据可见性动态更新按钮文本
            logPanelToggle.textContent = isVisible ? '隐藏日志' : '显示日志';
            logPanelToggle.classList.toggle('active', isVisible);
        }

        // 如果面板变得可见，则滚动到底部
        if (isVisible) {
            this.scrollToLogBottom();
        }
    }
}
```

#### 高级设置按钮
```javascript
// 元素ID: settings-btn
// 事件: click
// 处理函数: AEExtension.showSettingsPanel() in main.js

// 逻辑概述:
// 该函数在 AEExtension 类的 setupUI 方法中被绑定到按钮的 click 事件。
showSettingsPanel() {
    // 检查并实例化 SettingsPanel（如果尚未创建）
    // SettingsPanel 类负责自身的UI渲染和逻辑
    if (!this.settingsPanel) {
        if (typeof SettingsPanel === 'undefined') {
            this.log('❌ SettingsPanel类未定义', 'error');
            return;
        }
        this.settingsPanel = new SettingsPanel(this.settingsManager, this);
    }

    // 在显示之前，将主界面的快速设置同步到高级设置面板
    this.syncQuickToAdvanced();

    // 调用实例的 show 方法来显示面板
    this.settingsPanel.show();
}
```

### 2.2 连接状态组件

#### 连接测试按钮
```javascript
// 元素ID: test-connection-btn
// 事件: click
// 处理函数:
async function testConnection() {
    try {
        // 更新UI状态
        this.updateConnectionStatus('connecting');
        
        // 记录开始时间
        const startTime = Date.now();
        
        // 执行连接测试
        const result = await this.connectionManager.testConnection();
        
        if (result.success) {
            const pingTime = Date.now() - startTime;
            this.updateConnectionStatus('connected', pingTime);
            
            // 刷新Eagle信息
            await this.refreshEagleInfo();
            
            // 播放成功音效
            this.soundPlayer.playSuccess();
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        this.updateConnectionStatus('failed', error.message);
        this.logManager.error('连接测试失败', error);
        
        // 播放错误音效
        this.soundPlayer.playError();
    }
}

// 状态更新函数
function updateConnectionStatus(status, data) {
    const statusIndicator = document.getElementById('status-indicator');
    const statusMain = document.getElementById('status-main');
    const pingTime = document.getElementById('ping-time');
    
    // 移除所有状态类
    statusIndicator.className = 'status-indicator';
    
    switch(status) {
        case 'connecting':
            statusIndicator.classList.add('connecting');
            statusMain.textContent = '连接中...';
            pingTime.textContent = '--ms';
            break;
            
        case 'connected':
            statusIndicator.classList.add('connected');
            statusMain.textContent = '已连接';
            pingTime.textContent = `${data}ms`;
            break;
            
        case 'failed':
            statusIndicator.classList.add('failed');
            statusMain.textContent = '连接失败';
            pingTime.textContent = '--ms';
            break;
            
        default:
            statusMain.textContent = '未连接';
            pingTime.textContent = '--ms';
    }
}
```

### 2.3 导入模式组件

#### 导入模式选择处理
```javascript
// 元素选择器: input[name="import-mode"] (位于高级设置面板中)
// 事件: change
// 处理函数: 在 main.js 的 setupSettingsPanel 方法中定义的匿名箭头函数

// 逻辑概述:
const importModeRadios = document.querySelectorAll('input[name="import-mode"]');
importModeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.checked) {
            // 1. 日志记录
            this.log(`高级导入模式已更改为: ${radio.value}`, 'info');

            // 2. 根据模式决定是否弹出配置窗口
            if (radio.value === 'project_adjacent') {
                this.showProjectAdjacentModal();
            } else if (radio.value === 'custom_folder') {
                this.showCustomFolderModal();
            }

            // 3. 实时保存设置
            // 调用 SettingsManager.js 的 updateField 方法，立即持久化设置
            this.settingsManager.updateField('mode', radio.value, false);

            // 4. 同步到快速设置面板
            // 确保主界面上的快速设置选项也反映出此变更
            const quickRadio = document.querySelector(`input[name="quick-import-mode"][value="${radio.value}"]`);
            if (quickRadio) {
                quickRadio.checked = true;
            }
        }
    });
});
```

#### 导入行为选择处理
```javascript
// 元素选择器: input[name="import-behavior"] (主面板)
//           input[name="advanced-import-behavior"] (高级设置面板)
// 事件: change
// 处理函数: 在 main.js 的 setupQuickSettings 和 setupSettingsPanel 方法中定义的匿名箭头函数

// 逻辑概述 (以快速设置为例):
const importBehaviorRadios = document.querySelectorAll('input[name="import-behavior"]');
importBehaviorRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            // 1. 根据选项值，更新一个或两个设置项
            if (e.target.value === 'no_import') {
                // 选项 "不导入合成" -> 更新 addToComposition 为 false
                this.updateQuickSetting('addToComposition', false);
            } else {
                // 选项 "当前时间" 或 "时间轴开始"
                // -> 确保 addToComposition 为 true
                this.updateQuickSetting('addToComposition', true);
                // -> 更新 timelineOptions.placement
                this.updateQuickSetting('timelineOptions.placement', e.target.value);
            }

            // 2. 同步到高级设置面板的UI
            const advancedRadio = document.querySelector(`input[name="advanced-import-behavior"][value="${e.target.value}"]`);
            if (advancedRadio) {
                advancedRadio.checked = true;
            }
        }
    });
});
```

#### 导出路径设置处理
```javascript
// 元素选择器: input[name="export-mode"], input[type="checkbox"][id^="export-"]
// 事件: change
// 处理函数: 在 main.js 的 setupSettingsPanel 方法中定义的多个匿名箭头函数

// 逻辑概述:
// 1. 为所有导出设置控件（单选按钮和复选框）添加 'change' 事件监听器。
const exportControls = document.querySelectorAll('input[name="export-mode"], input[id^="export-"]');

exportControls.forEach(control => {
    control.addEventListener('change', () => {
        // 2. 任何控件变化时，立即从UI收集完整的导出设置
        const exportSettings = this.getExportSettingsFromUI();

        // 3. 调用 SettingsManager 将整个 exportSettings 对象实时保存
        this.settingsManager.saveExportSettings(exportSettings);
    });
});

// getExportSettingsFromUI 函数负责读取所有相关控件的值，
// 并从导入设置中复用路径信息，然后组装成一个对象。
```

### 2.4 图层操作组件

#### 检测图层按钮
```javascript
// 元素ID: detect-layers-btn
// 事件: click
// 处理函数:
async function detectLayers() {
    try {
        // 更新按钮状态
        const detectBtn = document.getElementById('detect-layers-btn');
        detectBtn.disabled = true;
        detectBtn.textContent = '检测中...';
        
        // 调用ExtendScript获取图层信息
        const layersData = await new Promise((resolve, reject) => {
            window.csInterface.evalScript('getCompositionLayers()', (result) => {
                try {
                    const parsed = JSON.parse(result);
                    if (parsed.success) {
                        resolve(parsed.layers);
                    } else {
                        reject(new Error(parsed.error));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        // 更新图层列表
        this.updateLayersList(layersData);
        
        // 启用导出按钮
        this.enableLayerOperations(layersData.length > 0);
        
        this.logManager.info(`检测到 ${layersData.length} 个图层`);
        
    } catch (error) {
        this.logManager.error('图层检测失败', error);
        this.showError('图层检测失败: ' + error.message);
    } finally {
        // 恢复按钮状态
        const detectBtn = document.getElementById('detect-layers-btn');
        detectBtn.disabled = false;
        detectBtn.textContent = '检测图层';
    }
}

// 图层列表更新函数
function updateLayersList(layers) {
    // 存储图层数据
    this.currentLayers = layers;
    
    // 更新UI显示（如果有图层列表UI）
    const layerCount = layers.length;
    this.updateStatus(`检测到 ${layerCount} 个图层`);
}

// 启用图层操作函数
function enableLayerOperations(hasLayers) {
    const exportBtn = document.getElementById('export-layers-btn');
    const exportToEagleBtn = document.getElementById('export-to-eagle-btn');
    
    if (hasLayers) {
        exportBtn.classList.remove('dimmed');
        exportToEagleBtn.classList.remove('dimmed');
        exportBtn.disabled = false;
        exportToEagleBtn.disabled = false;
    } else {
        exportBtn.classList.add('dimmed');
        exportToEagleBtn.classList.add('dimmed');
        exportBtn.disabled = true;
        exportToEagleBtn.disabled = true;
    }
}
```

#### 导出图层按钮
```javascript
// 元素ID: export-layers-btn
// 事件: click
// 处理函数:
async function exportLayers() {
    if (!this.currentLayers || this.currentLayers.length === 0) {
        this.showWarning('请先检测图层');
        return;
    }
    
    try {
        // 获取导出设置
        const exportSettings = this.settingsManager.getExportSettings();
        
        // 确定导出路径
        const exportPath = await this.determineExportPath(exportSettings);
        
        // 显示进度
        this.showProgress('导出图层中...', 0);
        
        // 执行导出
        const result = await this.fileProcessor.exportLayers(
            this.currentLayers, 
            exportPath, 
            exportSettings,
            (progress) => this.updateProgress(progress)
        );
        
        if (result.success) {
            this.showSuccess(`成功导出 ${result.exportedCount} 个图层到 ${exportPath}`);
            
            // 如果启用了自动复制，复制路径到剪贴板
            if (exportSettings.autoCopy) {
                await this.copyToClipboard(exportPath);
            }
            
            // 播放成功音效
            this.soundPlayer.playSuccess();
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        this.logManager.error('图层导出失败', error);
        this.showError('导出失败: ' + error.message);
        this.soundPlayer.playError();
    } finally {
        this.hideProgress();
    }
}

// 导出路径确定函数
async function determineExportPath(settings) {
    switch(settings.exportMode) {
        case 'desktop':
            return this.getDesktopPath();
            
        case 'project_adjacent':
            return await this.getProjectAdjacentPath(settings.folderName);
            
        case 'custom_folder':
            if (!settings.customExportPath) {
                throw new Error('未设置自定义导出路径');
            }
            return settings.customExportPath;
            
        default:
            throw new Error('未知的导出模式');
    }
}
```

#### 导出到Eagle按钮
```javascript
// 元素ID: export-to-eagle-btn
// 事件: click
// 处理函数:
async function exportToEagle() {
    if (!this.currentLayers || this.currentLayers.length === 0) {
        this.showWarning('请先检测图层');
        return;
    }
    
    // 独立的Eagle连接检测
    if (this.connectionState !== ConnectionState.CONNECTED) {
        this.log('未连接到Eagle，请先建立连接', 'error');
        // 调用JSX显示警告对话框
        try {
            await this.executeExtendScript('exportToEagleWithConnectionCheck', {
                exportSettings: {},
                connectionStatus: { connected: false }
            });
        } catch (error) {
            this.log('显示Eagle连接警告时出错: ' + error.message, 'error');
        }
        return;
    }
    
    try {
        // 显示进度
        this.showProgress('导出到Eagle中...', 0);
        
        // 准备导出数据
        const exportData = await this.prepareEagleExportData(this.currentLayers);
        
        // 发送到Eagle
        const result = await this.websocketClient.sendMessage({
            type: 'EXPORT_LAYERS',
            data: exportData
        });
        
        if (result.success) {
            this.showSuccess(`成功导出 ${exportData.layers.length} 个图层到Eagle`);
            this.soundPlayer.playSuccess();
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        this.logManager.error('导出到Eagle失败', error);
        this.showError('导出到Eagle失败: ' + error.message);
        this.soundPlayer.playError();
    } finally {
        this.hideProgress();
    }
}

// Eagle导出数据准备函数
async function prepareEagleExportData(layers) {
    const exportData = {
        timestamp: Date.now(),
        projectName: await this.getProjectName(),
        compositionName: await this.getCompositionName(),
        layers: []
    };
    
    for (const layer of layers) {
        const layerData = {
            name: layer.name,
            type: layer.type,
            properties: layer.properties,
            thumbnail: await this.generateLayerThumbnail(layer)
        };
        
        exportData.layers.push(layerData);
    }
    
    return exportData;
}
```

### 2.5 拖拽处理组件

#### 拖拽事件处理
```javascript
// 拖拽进入处理
function handleDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // 添加拖拽样式
    document.body.classList.add('drag-over');
    
    // 显示拖拽提示
    this.showDragOverlay();
    
    this.logManager.debug('文件拖拽进入');
}

// 拖拽悬停处理
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // 设置拖拽效果
    event.dataTransfer.dropEffect = 'copy';
}

// 拖拽离开处理
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // 检查是否真正离开窗口
    if (!event.relatedTarget || !document.contains(event.relatedTarget)) {
        document.body.classList.remove('drag-over');
        this.hideDragOverlay();
        this.logManager.debug('文件拖拽离开');
    }
}

// 文件放置处理
async function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // 移除拖拽样式
    document.body.classList.remove('drag-over');
    this.hideDragOverlay();
    
    try {
        // 获取拖拽的文件
        const files = Array.from(event.dataTransfer.files);
        
        if (files.length === 0) {
            this.showWarning('未检测到有效文件');
            return;
        }
        
        this.logManager.info(`接收到 ${files.length} 个拖拽文件`);
        
        // 显示确认对话框
        const confirmed = await this.showImportConfirmDialog(files);
        
        if (confirmed) {
            await this.processDroppedFiles(files);
        }
        
    } catch (error) {
        this.logManager.error('处理拖拽文件失败', error);
        this.showError('处理文件失败: ' + error.message);
    }
}

// 拖拽文件处理函数
async function processDroppedFiles(files) {
    try {
        // 获取当前导入设置
        const importSettings = this.settingsManager.getImportSettings();
        
        // 显示进度
        this.showProgress('处理文件中...', 0);
        
        // 处理文件
        const result = await this.fileProcessor.processFiles(
            files,
            importSettings,
            (progress) => this.updateProgress(progress)
        );
        
        if (result.success) {
            this.showSuccess(`成功导入 ${result.importedCount} 个文件`);
            this.soundPlayer.playSuccess();
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        this.logManager.error('文件处理失败', error);
        this.showError('文件处理失败: ' + error.message);
        this.soundPlayer.playError();
    } finally {
        this.hideProgress();
    }
}

// 事件绑定
document.addEventListener('dragenter', handleDragEnter.bind(this));
document.addEventListener('dragover', handleDragOver.bind(this));
document.addEventListener('dragleave', handleDragLeave.bind(this));
document.addEventListener('drop', handleDrop.bind(this));
```

### 2.6 日志系统组件

#### 日志源切换
```javascript
// 元素ID: log-title 和 log-switch-btn
// 事件: click
// 处理函数: AEExtension.switchLogView() in main.js

// 逻辑概述:
// 点击日志标题或切换按钮时触发
switchLogView() {
    // 在 'ae' 和 'eagle' 之间切换视图状态
    this.currentLogView = this.currentLogView === 'ae' ? 'eagle' : 'ae';
    // 更新UI控件（如标题）以反映新状态
    this.updateLogControls();
    // 使用新视图对应的日志数组重新渲染日志区域
    this.updateLogDisplay();
}
```

#### 清空日志按钮
```javascript
// 元素ID: clear-log-btn
// 事件: click
// 处理函数: AEExtension.clearLog() in main.js

// 逻辑概述:
// 函数行为取决于当前日志视图 (this.currentLogView)
clearLog() {
    if (this.currentLogView === 'ae') {
        // AE视图下：清空本地AE日志数组和LogManager
        this.aeLogs = [];
        this.logManager.clear();
        this.log('AE日志已清理', 'info');
    } else {
        // Eagle视图下：清空本地Eagle日志数组
        this.eagleLogs = [];
        // 立即更新UI
        this.updateLogDisplay();
        // **发送网络请求到Eagle插件，通知其清空日志**
        this.requestEagleClearLogs();
        console.log('Eagle日志已清理');
        return; // 提前返回
    }

    this.updateLogDisplay();
}
```

## 3. 设置管理函数映射

### 3.1 设置面板控制

```javascript
// 设置面板关闭
function closeSettingsPanel() {
    const settingsPanel = document.getElementById('settings-panel');
    settingsPanel.style.display = 'none';
    
    // 移除ESC键监听
    document.removeEventListener('keydown', this.handleSettingsEscape);
}

// 设置保存
async function saveSettings() {
    try {
        // 收集UI中的设置
        const settings = this.collectSettingsFromUI();
        
        // 验证设置
        const validation = this.validateSettings(settings);
        if (!validation.valid) {
            this.showValidationErrors(validation.errors);
            return;
        }
        
        // 保存设置
        await this.settingsManager.saveSettings(settings);
        
        // 应用设置
        await this.applySettings(settings);
        
        this.showSuccess('设置已保存');
        this.closeSettingsPanel();
        
    } catch (error) {
        this.logManager.error('保存设置失败', error);
        this.showError('保存设置失败: ' + error.message);
    }
}

// 设置重置
function resetSettings() {
    if (confirm('确定要重置所有设置为默认值吗？')) {
        // 重置为默认设置
        const defaultSettings = this.settingsManager.getDefaultSettings();
        
        // 更新UI
        this.loadSettingsToUI(defaultSettings);
        
        this.showInfo('设置已重置为默认值');
    }
}
```

### 3.2 设置同步函数

```javascript
// 快速面板到高级设置同步
function syncQuickToAdvanced() {
    // 同步导入模式
    const quickImportMode = document.querySelector('input[name="quick-import-mode"]:checked');
    if (quickImportMode) {
        const advancedImportMode = document.querySelector(`input[name="import-mode"][value="${quickImportMode.value}"]`);
        if (advancedImportMode) {
            advancedImportMode.checked = true;
        }
    }
    
    // 同步导入行为
    const quickImportBehavior = document.querySelector('input[name="import-behavior"]:checked');
    if (quickImportBehavior) {
        const advancedImportBehavior = document.querySelector(`input[name="advanced-import-behavior"][value="${quickImportBehavior.value}"]`);
        if (advancedImportBehavior) {
            advancedImportBehavior.checked = true;
        }
    }
}

// 高级设置到快速面板同步
function syncAdvancedToQuick() {
    // 同步导入模式
    const advancedImportMode = document.querySelector('input[name="import-mode"]:checked');
    if (advancedImportMode) {
        const quickImportMode = document.querySelector(`input[name="quick-import-mode"][value="${advancedImportMode.value}"]`);
        if (quickImportMode) {
            quickImportMode.checked = true;
        }
    }
    
    // 同步导入行为
    const advancedImportBehavior = document.querySelector('input[name="advanced-import-behavior"]:checked');
    if (advancedImportBehavior) {
        const quickImportBehavior = document.querySelector(`input[name="import-behavior"][value="${advancedImportBehavior.value}"]`);
        if (quickImportBehavior) {
            quickImportBehavior.checked = true;
        }
    }
}
```

## 4. 模态对话框函数映射

### 4.1 文件夹选择对话框

```javascript
// 显示项目旁复制设置
function showProjectAdjacentModal() {
    const modal = document.getElementById('project-adjacent-modal');
    modal.style.display = 'block';
    
    // 加载当前设置
    this.loadProjectAdjacentSettings();
}

// 确认项目旁复制设置
function confirmProjectAdjacentSettings() {
    const presetSelect = document.getElementById('project-folder-preset-select');
    const customInput = document.getElementById('project-custom-folder-input');
    
    let folderName;
    if (presetSelect.value === 'custom') {
        folderName = customInput.value.trim();
        if (!folderName) {
            this.showError('请输入自定义文件夹名称');
            return;
        }
    } else {
        folderName = presetSelect.value;
    }
    
    // 保存设置
    this.projectAdjacentSettings.folderName = folderName;
    this.settingsManager.updateSetting('projectAdjacentFolder', folderName);
    
    // 关闭对话框
    this.closeProjectAdjacentModal();
    
    this.logManager.info(`项目旁复制文件夹设置为: ${folderName}`);
}

// 显示自定义文件夹设置
function showCustomFolderModal() {
    const modal = document.getElementById('custom-folder-modal');
    modal.style.display = 'block';
    
    // 加载当前设置
    this.loadCustomFolderSettings();
    
    // 显示最近使用的文件夹
    this.updateRecentFoldersList();
}

// 浏览文件夹路径
async function browseFolderPath() {
    try {
        // 使用系统文件夹选择对话框
        const selectedPath = await this.showSystemFolderDialog();
        
        if (selectedPath) {
            const pathInput = document.getElementById('custom-folder-path-input');
            pathInput.value = selectedPath;
            
            // 验证路径
            const isValid = await this.validateFolderPath(selectedPath);
            if (!isValid) {
                this.showWarning('选择的路径可能无效或无写入权限');
            }
        }
        
    } catch (error) {
        this.logManager.error('文件夹选择失败', error);
        this.showError('文件夹选择失败: ' + error.message);
    }
}
```

## 5. 预设管理

### 5.1 预设保存按钮
```javascript
// 元素ID: save-preset-btn
// 事件: click
// 处理函数: AEExtension.savePreset() in main.js

// 逻辑概述:
// 1. 收集当前所有设置（包括导入、导出、连接等）
// 2. 弹出对话框让用户输入预设名称
// 3. 调用 SettingsManager.savePreset() 将设置保存到本地文件系统
// 4. 更新UI，例如刷新预设列表
async function savePreset() {
    try {
        const presetName = await this.showPrompt('保存预设', '请输入预设名称:');
        if (!presetName) {
            this.showInfo('预设保存已取消');
            return;
        }

        const currentSettings = this.settingsManager.getAllSettings();
        await this.settingsManager.savePreset(presetName, currentSettings);
        this.showSuccess(`预设 "${presetName}" 已保存`);
        this.updatePresetList(); // 刷新预设列表
    } catch (error) {
        this.logManager.error('保存预设失败', error);
        this.showError('保存预设失败: ' + error.message);
    }
}
```

### 5.2 预设加载按钮
```javascript
// 元素ID: load-preset-btn
// 事件: click
// 处理函数: AEExtension.loadPreset() in main.js

// 逻辑概述:
// 1. 弹出对话框显示可用预设列表供用户选择
// 2. 调用 SettingsManager.loadPreset() 加载选定的预设
// 3. 将加载的设置应用到UI和应用状态
// 4. 更新UI，例如刷新预设列表
async function loadPreset() {
    try {
        const presets = await this.settingsManager.listPresets();
        if (presets.length === 0) {
            this.showWarning('没有可用的预设');
            return;
        }

        const selectedPresetName = await this.showPresetSelectionDialog(presets);
        if (!selectedPresetName) {
            this.showInfo('预设加载已取消');
            return;
        }

        const loadedSettings = await this.settingsManager.loadPreset(selectedPresetName);
        this.applySettings(loadedSettings); // 应用设置到UI和应用状态
        this.showSuccess(`预设 "${selectedPresetName}" 已加载`);
    } catch (error) {
        this.logManager.error('加载预设失败', error);
        this.showError('加载预设失败: ' + error.message);
    }
}
```

### 5.3 预设导出按钮
```javascript
// 元素ID: export-preset-btn
// 事件: click
// 处理函数: AEExtension.exportPreset() in main.js

// 逻辑概述:
// 1. 弹出对话框显示可用预设列表供用户选择
// 2. 调用 SettingsManager.exportPreset() 将选定的预设导出到用户指定的位置
async function exportPreset() {
    try {
        const presets = await this.settingsManager.listPresets();
        if (presets.length === 0) {
            this.showWarning('没有可用的预设可导出');
            return;
        }

        const selectedPresetName = await this.showPresetSelectionDialog(presets, '选择要导出的预设:');
        if (!selectedPresetName) {
            this.showInfo('预设导出已取消');
            return;
        }

        const exportPath = await this.showSaveDialog('导出预设', `${selectedPresetName}.json`);
        if (!exportPath) {
            this.showInfo('预设导出已取消');
            return;
        }

        await this.settingsManager.exportPreset(selectedPresetName, exportPath);
        this.showSuccess(`预设 "${selectedPresetName}" 已导出到 ${exportPath}`);
    } catch (error) {
        this.logManager.error('导出预设失败', error);
        this.showError('导出预设失败: ' + error.message);
    }
}
```

### 5.4 预设重置按钮
```javascript
// 元素ID: reset-preset-btn
// 事件: click
// 处理函数: AEExtension.resetPreset() in main.js

// 逻辑概述:
// 1. 弹出确认对话框
// 2. 调用 SettingsManager.resetPreset() 将所有预设删除
// 3. 刷新预设列表UI
async function resetPreset() {
    try {
        const confirmed = await this.showConfirm('重置预设', '确定要删除所有预设吗？此操作不可撤销。');
        if (!confirmed) {
            this.showInfo('预设重置已取消');
            return;
        }

        await this.settingsManager.resetAllPresets();
        this.showSuccess('所有预设已删除');
        this.updatePresetList(); // 刷新预设列表
    } catch (error) {
        this.logManager.error('重置预设失败', error);
        this.showError('重置预设失败: ' + error.message);
    }
}
```

### 5.5 浏览预设路径按钮
```javascript
// 元素ID: browse-preset-path-btn
// 事件: click
// 处理函数: AEExtension.browsePresetPath() in main.js

// 逻辑概述:
// 1. 获取预设存储路径
// 2. 调用系统API打开该路径的文件夹
async function browsePresetPath() {
    try {
        const presetFolderPath = this.settingsManager.getPresetFolderPath();
        await this.fileProcessor.openFolder(presetFolderPath);
        this.showInfo(`已打开预设文件夹: ${presetFolderPath}`);
    } catch (error) {
        this.logManager.error('打开预设文件夹失败', error);
        this.showError('打开预设文件夹失败: ' + error.message);
    }
}
```

## 6. 工具函数映射

### 6.1 UI更新函数

```javascript
// 状态消息更新
function updateStatus(message, type = 'info') {
    const statusElement = document.getElementById('latest-log-message');
    const statusContainer = document.getElementById('import-status');
    
    statusElement.textContent = message;
    
    // 更新状态样式
    statusContainer.className = `import-status ${type}`;
    
    // 记录到日志
    this.logManager.log(type, message);
}

// 进度显示
function showProgress(message, percentage) {
    this.updateStatus(`${message} ${percentage}%`, 'processing');
    
    // 如果有进度条，更新进度条
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

// 隐藏进度
function hideProgress() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
}

// 显示成功消息
function showSuccess(message) {
    this.updateStatus(message, 'success');
    this.showToast(message, 'success');
}

// 显示错误消息
function showError(message) {
    this.updateStatus(message, 'error');
    this.showToast(message, 'error');
}

// 显示警告消息
function showWarning(message) {
    this.updateStatus(message, 'warning');
    this.showToast(message, 'warning');
}

// 显示信息消息
function showInfo(message) {
    this.updateStatus(message, 'info');
    this.showToast(message, 'info');
}
```

### 6.2 数据处理函数

```javascript
// 收集UI设置
function collectSettingsFromUI() {
    return {
        importMode: document.querySelector('input[name="import-mode"]:checked')?.value,
        importBehavior: document.querySelector('input[name="advanced-import-behavior"]:checked')?.value,
        exportMode: document.querySelector('input[name="export-mode"]:checked')?.value,
        communicationPort: parseInt(document.getElementById('communication-port').value),
        projectAdjacentFolder: this.projectAdjacentSettings.folderName,
        customFolderPath: this.customFolderSettings.folderPath,
        exportSettings: {
            autoCopy: document.getElementById('export-auto-copy').checked,
            burnAfterReading: document.getElementById('export-burn-after-reading').checked,
            addTimestamp: document.getElementById('export-add-timestamp').checked,
            createSubfolders: document.getElementById('export-create-subfolders').checked
        }
    };
}

// 加载设置到UI
function loadSettingsToUI(settings) {
    if (!settings) {
        settings = this.settingsManager.getSettings();
    }
    
    // 设置导入模式
    if (settings.importMode) {
        const importModeInput = document.querySelector(`input[name="import-mode"][value="${settings.importMode}"]`);
        if (importModeInput) importModeInput.checked = true;
    }
    
    // 设置导入行为
    if (settings.importBehavior) {
        const importBehaviorInput = document.querySelector(`input[name="advanced-import-behavior"][value="${settings.importBehavior}"]`);
        if (importBehaviorInput) importBehaviorInput.checked = true;
    }
    
    // 设置导出模式
    if (settings.exportMode) {
        const exportModeInput = document.querySelector(`input[name="export-mode"][value="${settings.exportMode}"]`);
        if (exportModeInput) exportModeInput.checked = true;
    }
    
    // 设置通信端口
    if (settings.communicationPort) {
        document.getElementById('communication-port').value = settings.communicationPort;
    }
    
    // 设置导出选项
    if (settings.exportSettings) {
        document.getElementById('export-auto-copy').checked = settings.exportSettings.autoCopy || false;
        document.getElementById('export-burn-after-reading').checked = settings.exportSettings.burnAfterReading || false;
        document.getElementById('export-add-timestamp').checked = settings.exportSettings.addTimestamp || false;
        document.getElementById('export-create-subfolders').checked = settings.exportSettings.createSubfolders || false;
    }
}
```

## 6. 事件监听器注册映射

### 6.1 主要事件绑定

```javascript
// 设置所有事件监听器
function setupEventListeners() {
    // 标题栏按钮
    document.getElementById('log-panel-toggle').addEventListener('click', this.toggleLogPanel.bind(this));
    document.getElementById('settings-btn').addEventListener('click', this.openSettingsPanel.bind(this));
    
    // 连接测试
    document.getElementById('test-connection-btn').addEventListener('click', this.testConnection.bind(this));
    
    // 导入模式选择
    document.querySelectorAll('input[name="quick-import-mode"]').forEach(input => {
        input.addEventListener('change', this.handleImportModeChange.bind(this));
    });
    
    // 导入行为选择
    document.querySelectorAll('input[name="import-behavior"]').forEach(input => {
        input.addEventListener('change', this.handleImportBehaviorChange.bind(this));
    });
    
    // 图层操作按钮
    document.getElementById('detect-layers-btn').addEventListener('click', this.detectLayers.bind(this));
    document.getElementById('export-layers-btn').addEventListener('click', this.exportLayers.bind(this));
    document.getElementById('export-to-eagle-btn').addEventListener('click', this.exportToEagle.bind(this));
    
    // 日志控制
    document.getElementById('log-title').addEventListener('click', this.switchLogSource.bind(this));
    document.getElementById('clear-log-btn').addEventListener('click', this.clearLogs.bind(this));
    
    // 设置面板控制
    document.getElementById('settings-close-btn').addEventListener('click', this.closeSettingsPanel.bind(this));
    document.getElementById('save-settings-btn').addEventListener('click', this.saveSettings.bind(this));
    document.getElementById('reset-settings-btn').addEventListener('click', this.resetSettings.bind(this));
    
    // 拖拽事件
    document.addEventListener('dragenter', this.handleDragEnter.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
    
    // 键盘快捷键
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    
    // 设置同步
    document.addEventListener('change', this.handleSettingsSync.bind(this));
}
```

### 6.2 键盘快捷键映射

```javascript
// 键盘快捷键处理
function handleKeyboardShortcuts(event) {
    // Ctrl+L: 清空日志
    if (event.ctrlKey && event.key === 'l') {
        event.preventDefault();
        this.clearLogs();
    }
    
    // Ctrl+R: 刷新连接
    if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        this.testConnection();
    }
    
    // Ctrl+S: 保存设置（在设置面板打开时）
    if (event.ctrlKey && event.key === 's') {
        const settingsPanel = document.getElementById('settings-panel');
        if (settingsPanel.style.display !== 'none') {
            event.preventDefault();
            this.saveSettings();
        }
    }
    
    // Escape: 关闭模态框
    if (event.key === 'Escape') {
        this.closeAllModals();
    }
    
    // F5: 刷新Eagle信息
    if (event.key === 'F5') {
        event.preventDefault();
        this.refreshEagleInfo();
    }
}
```

---

## 总结

本文档提供了Eagle2Ae AE插件中所有UI组件对应的JavaScript函数映射，包括：

1. **初始化函数**: 应用启动和组件初始化
2. **事件处理函数**: 用户交互事件的处理逻辑
3. **状态管理函数**: UI状态更新和同步
4. **数据处理函数**: 设置收集、验证和保存
5. **工具函数**: 通用的UI操作和反馈
6. **事件绑定**: 完整的事件监听器注册

开发者可以根据此映射表快速定位和理解每个UI组件的功能实现，便于维护和扩展插件功能。

## 相关文档

- [UI组件详细说明](./ui-components.md)
- [UI交互指南](../development/ui-interaction-guide.md)
- [API参考文档](./api-reference.md)
- [开发指南](../development/setup-guide.md)