# 预设管理系统使用指南

## 概述

预设管理系统是 Eagle2Ae v2.4.0 引入的重要功能，每个面板实例独立的预设文件管理，支持导出导入和备份恢复，为用户提供便捷的配置管理功能。

## 核心特性

### 1. 面板特定预设

每个面板实例拥有独立的预设文件：
- **面板1**: Eagle2Ae1.Presets
- **面板2**: Eagle2Ae2.Presets
- **面板3**: Eagle2Ae3.Presets

### 2. 预设文件管理

支持预设文件的导出和导入，便于配置的迁移和共享。

### 3. 自动保存机制

配置变更时自动保存到预设文件，确保数据不丢失。

### 4. 备份恢复功能

提供预设文件的备份和恢复，防止配置意外丢失。

## 使用指南

### 预设管理器实现

```javascript
// 预设管理器
class PresetManager {
    constructor(panelId, settingsManager, csInterface) {
        this.panelId = panelId;
        this.settingsManager = settingsManager;
        this.csInterface = csInterface;
        
        this.log(`💾 预设管理器已为面板 ${panelId} 初始化`, 'debug');
    }
    
    /**
     * 获取当前面板的预设文件名
     * @returns {string} 'Eagle2Ae1.Presets', 'Eagle2Ae2.Presets', 或 'Eagle2Ae3.Presets'
     */
    getPresetFileName() {
        const panelNumber = this.panelId.replace('panel', '');
        return `Eagle2Ae${panelNumber}.Presets`;
    }
    
    /**
     * 保存预设到文件
     * @param {Object} settings - 当前设置
     * @returns {Promise<Object>} 保存结果
     */
    async savePresets(settings) {
        try {
            const presetFileName = this.getPresetFileName();
            const presetData = {
                version: '2.4.0',
                timestamp: new Date().toISOString(),
                settings: settings
            };
            
            // 将预设数据保存到文件
            const result = await this.csInterface.evalScript(`
                savePresetFile("${presetFileName}", "${JSON.stringify(presetData).replace(/"/g, '\\"')}")
            `);
            
            if (result.success) {
                this.log(`✅ 预设已保存到 ${presetFileName}`, 'success');
                return { success: true };
            } else {
                this.log(`❌ 保存预设失败: ${result.error}`, 'error');
                return { success: false, error: result.error };
            }
            
        } catch (error) {
            this.log(`❌ 保存预设时发生异常: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 从文件加载预设
     * @returns {Promise<Object>} 加载的预设数据
     */
    async loadPresets() {
        try {
            const presetFileName = this.getPresetFileName();
            
            // 从文件加载预设数据
            const result = await this.csInterface.evalScript(`
                loadPresetFile("${presetFileName}")
            `);
            
            if (result.success && result.data) {
                const presetData = JSON.parse(result.data);
                this.log(`✅ 从 ${presetFileName} 加载预设成功`, 'success');
                return { success: true, data: presetData };
            } else {
                this.log(`⚠️ 无法加载预设: ${result.error || '文件不存在'}`, 'warning');
                return { success: false, error: result.error || '文件不存在' };
            }
            
        } catch (error) {
            this.log(`❌ 加载预设时发生异常: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 导出预设文件
     * @param {string} exportPath - 导出路径
     * @returns {Promise<Object>} 导出结果
     */
    async exportPresets(exportPath) {
        try {
            const presetFileName = this.getPresetFileName();
            
            // 导出预设文件
            const result = await this.csInterface.evalScript(`
                exportPresetFile("${presetFileName}", "${exportPath.replace(/\\/g, '\\\\')}")
            `);
            
            if (result.success) {
                this.log(`✅ 预设已导出到 ${exportPath}`, 'success');
                return { success: true, path: exportPath };
            } else {
                this.log(`❌ 导出预设失败: ${result.error}`, 'error');
                return { success: false, error: result.error };
            }
            
        } catch (error) {
            this.log(`❌ 导出预设时发生异常: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 导入预设文件
     * @param {string} importPath - 导入路径
     * @returns {Promise<Object>} 导入结果
     */
    async importPresets(importPath) {
        try {
            const presetFileName = this.getPresetFileName();
            
            // 导入预设文件
            const result = await this.csInterface.evalScript(`
                importPresetFile("${presetFileName}", "${importPath.replace(/\\/g, '\\\\')}")
            `);
            
            if (result.success) {
                this.log(`✅ 从 ${importPath} 导入预设成功`, 'success');
                
                // 重新加载设置
                const loadResult = await this.loadPresets();
                if (loadResult.success) {
                    this.settingsManager.loadSettings(loadResult.data.settings);
                }
                
                return { success: true };
            } else {
                this.log(`❌ 导入预设失败: ${result.error}`, 'error');
                return { success: false, error: result.error };
            }
            
        } catch (error) {
            this.log(`❌ 导入预设时发生异常: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 备份预设文件
     * @returns {Promise<Object>} 备份结果
     */
    async backupPresets() {
        try {
            const presetFileName = this.getPresetFileName();
            const backupFileName = `${presetFileName}.backup.${Date.now()}`;
            
            // 备份预设文件
            const result = await this.csInterface.evalScript(`
                backupPresetFile("${presetFileName}", "${backupFileName}")
            `);
            
            if (result.success) {
                this.log(`✅ 预设已备份为 ${backupFileName}`, 'success');
                return { success: true, backupFile: backupFileName };
            } else {
                this.log(`❌ 备份预设失败: ${result.error}`, 'error');
                return { success: false, error: result.error };
            }
            
        } catch (error) {
            this.log(`❌ 备份预设时发生异常: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    /**
     * 恢复预设文件
     * @param {string} backupFile - 备份文件名
     * @returns {Promise<Object>} 恢复结果
     */
    async restorePresets(backupFile) {
        try {
            const presetFileName = this.getPresetFileName();
            
            // 恢复预设文件
            const result = await this.csInterface.evalScript(`
                restorePresetFile("${presetFileName}", "${backupFile}")
            `);
            
            if (result.success) {
                this.log(`✅ 从 ${backupFile} 恢复预设成功`, 'success');
                
                // 重新加载设置
                const loadResult = await this.loadPresets();
                if (loadResult.success) {
                    this.settingsManager.loadSettings(loadResult.data.settings);
                }
                
                return { success: true };
            } else {
                this.log(`❌ 恢复预设失败: ${result.error}`, 'error');
                return { success: false, error: result.error };
            }
            
        } catch (error) {
            this.log(`❌ 恢复预设时发生异常: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
}
```

## 操作步骤

### 1. 保存当前配置

1. 在面板中进行所需的设置
2. 点击"保存预设"按钮
3. 系统会自动将当前配置保存到对应的预设文件

### 2. 加载预设配置

1. 点击"加载预设"按钮
2. 系统会从预设文件中读取配置
3. 自动应用保存的设置

### 3. 导出预设文件

1. 点击"导出预设"按钮
2. 选择导出路径
3. 系统会将预设文件复制到指定位置

### 4. 导入预设文件

1. 点击"导入预设"按钮
2. 选择要导入的预设文件
3. 系统会将文件内容导入并应用

### 5. 备份预设文件

1. 点击"备份预设"按钮
2. 系统会创建当前预设文件的备份副本
3. 备份文件会带有时间戳后缀

### 6. 恢复预设文件

1. 点击"恢复预设"按钮
2. 选择要恢复的备份文件
3. 系统会用备份文件替换当前预设文件

## 最佳实践

### 1. 定期备份

建议定期备份预设文件，防止配置意外丢失：
- 每周进行一次完整备份
- 在重大配置更改前进行备份
- 保留多个时间点的备份

### 2. 配置管理

- 为不同项目创建专门的预设模板
- 使用有意义的预设文件名便于识别
- 定期清理过时的预设文件

### 3. 团队协作

- 导出预设文件与团队成员共享
- 建立统一的配置标准
- 定期同步最新的预设配置

## 故障排除

### 预设文件丢失

如果预设文件丢失：
1. 检查预设文件存储路径
2. 从备份文件中恢复
3. 重新创建配置并保存

### 导入导出失败

如果导入导出操作失败：
1. 检查文件路径是否有效
2. 验证文件权限
3. 确认磁盘空间是否充足

### 配置不生效

如果加载预设后配置不生效：
1. 检查预设文件格式是否正确
2. 确认预设版本是否兼容
3. 重启面板实例

## 高级功能

### 1. 批量操作

支持批量处理多个预设文件：
- 批量导出所有面板的预设
- 批量导入预设文件
- 批量备份预设文件

### 2. 版本管理

预设文件包含版本信息，支持：
- 版本兼容性检查
- 自动升级机制
- 版本回退功能

### 3. 云端同步

支持将预设文件同步到云端：
- 自动上传最新预设
- 从云端下载预设
- 多设备间配置同步