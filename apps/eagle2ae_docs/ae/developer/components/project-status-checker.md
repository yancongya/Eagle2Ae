# 项目状态检查器

## 概述

项目状态检查器（Project Status Checker）是 Eagle2Ae AE 扩展 v2.4.0 的核心组件，负责验证 After Effects 项目的当前状态，确保执行各种操作前满足必要的条件。该组件提供了项目存在性检查、合成活动状态检查、项目保存状态检查等关键功能。

## 核心特性

### 多维度状态验证
- **项目存在性检查** - 验证当前是否打开项目
- **合成活动状态检查** - 验证是否存在活动合成
- **项目保存状态检查** - 验证项目是否已保存
- **合成设置验证** - 验证当前合成设置是否有效

### 智能状态管理
- 自动检测和更新项目状态
- 提供状态变更事件监听
- 实现状态缓存以提高性能

### 灵活的验证选项
- 可配置的验证要求（必需项目、必需合成等）
- 自定义错误消息和警告显示
- 可选的状态更新和UI反馈

### 实时状态反馈
- 提供详细的状态检查结果
- 显示当前项目和合成信息
- 提供状态变更的历史记录

## 技术实现

### 核心类结构

```javascript
/**
 * 项目状态检查器
 * 负责验证After Effects项目的当前状态，确保执行各种操作前满足必要的条件
 */
class ProjectStatusChecker {
    /**
     * 构造函数
     * @param {Object} aeExtension - AE扩展实例
     */
    constructor(aeExtension) {
        this.aeExtension = aeExtension;
        this.csInterface = aeExtension.csInterface;
        this.settingsManager = aeExtension.settingsManager;
        this.logManager = aeExtension.logManager;
        this.eagleConnectionManager = aeExtension.eagleConnectionManager;
        
        // 初始化状态
        this.currentStatus = {
            projectExists: false,
            projectPath: null,
            projectName: null,
            activeCompExists: false,
            activeCompName: null,
            isProjectSaved: true,
            projectModified: false,
            timestamp: Date.now()
        };
        
        // 状态缓存
        this.statusCache = new Map();
        this.cacheTimeout = 1000; // 1秒缓存
        
        // 绑定方法上下文
        this.validateProjectStatus = this.validateProjectStatus.bind(this);
        this.getProjectStatus = this.getProjectStatus.bind(this);
        this.updateProjectStatus = this.updateProjectStatus.bind(this);
        this.checkProjectExists = this.checkProjectExists.bind(this);
        this.checkActiveComp = this.checkActiveComp.bind(this);
        this.checkProjectSaved = this.checkProjectSaved.bind(this);
        this.getProjectInfo = this.getProjectInfo.bind(this);
        this.getActiveCompInfo = this.getActiveCompInfo.bind(this);
        this.emitStatusChange = this.emitStatusChange.bind(this);
        
        this.log('🔍 项目状态检查器已初始化', 'debug');
    }
}
```

### 项目存在性检查

```javascript
/**
 * 检查项目是否存在
 * @returns {Promise<Object>} 检查结果
 */
async checkProjectExists() {
    try {
        this.log('🔍 检查项目是否存在...', 'debug');

        // 检查是否为Demo模式
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：虚拟项目存在性检查', 'debug');
            
            // Demo模式：返回虚拟项目状态
            if (window.demoProject) {
                const demoStatus = window.demoProject.getProjectStatus();
                this.log(`✅ 虚拟项目存在性检查完成: ${demoStatus.exists}`, 'debug');
                return {
                    exists: demoStatus.exists,
                    projectPath: demoStatus.projectPath,
                    projectName: demoStatus.projectName
                };
            } else {
                // 模拟项目存在
                const mockExists = localStorage.getItem('demoProjectExists') === 'true';
                const mockProjectPath = localStorage.getItem('demoProjectPath') || 'C:/Demo/Project.aep';
                const mockProjectName = localStorage.getItem('demoProjectName') || 'Demo Project.aep';
                
                this.log(`✅ 虚拟项目存在性检查完成: ${mockExists}`, 'debug');
                return {
                    exists: mockExists,
                    projectPath: mockExists ? mockProjectPath : null,
                    projectName: mockExists ? mockProjectName : null
                };
            }
        }

        // CEP模式：使用ExtendScript检查项目存在性
        const result = await this.aeExtension.executeExtendScript('checkProjectExists', {});

        if (result && result.success !== undefined) {
            this.log(`✅ 项目存在性检查完成: ${result.success}`, 'debug');
            return {
                exists: result.success,
                projectPath: result.projectPath || null,
                projectName: result.projectName || null
            };
        } else {
            const errorMsg = result && result.error ? result.error : '未知错误';
            this.log(`❌ 项目存在性检查失败: ${errorMsg}`, 'error');
            return {
                exists: false,
                error: errorMsg,
                projectPath: null,
                projectName: null
            };
        }

    } catch (error) {
        this.log(`💥 项目存在性检查异常: ${error.message}`, 'error');
        return {
            exists: false,
            error: error.message,
            projectPath: null,
            projectName: null
        };
    }
}

/**
 * 获取项目信息
 * @returns {Promise<Object>} 项目信息
 */
async getProjectInfo() {
    try {
        this.log('🔍 获取项目信息...', 'debug');

        // 检查是否为Demo模式
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：虚拟项目信息获取', 'debug');
            
            // Demo模式：返回虚拟项目信息
            if (window.demoProject) {
                const demoInfo = window.demoProject.getProjectInfo();
                this.log('✅ 虚拟项目信息获取完成', 'debug');
                return {
                    success: true,
                    projectPath: demoInfo.projectPath,
                    projectName: demoInfo.projectName,
                    projectSaved: demoInfo.projectSaved,
                    projectModified: demoInfo.projectModified
                };
            } else {
                // 模拟项目信息
                const mockProjectPath = localStorage.getItem('demoProjectPath') || 'C:/Demo/Project.aep';
                const mockProjectName = localStorage.getItem('demoProjectName') || 'Demo Project.aep';
                const mockProjectSaved = localStorage.getItem('demoProjectSaved') !== 'false';
                const mockProjectModified = localStorage.getItem('demoProjectModified') === 'true';
                
                this.log('✅ 虚拟项目信息获取完成', 'debug');
                return {
                    success: true,
                    projectPath: mockProjectPath,
                    projectName: mockProjectName,
                    projectSaved: mockProjectSaved,
                    projectModified: mockProjectModified
                };
            }
        }

        // CEP模式：使用ExtendScript获取项目信息
        const result = await this.aeExtension.executeExtendScript('getProjectInfo', {});

        if (result && result.success) {
            this.log('✅ 项目信息获取完成', 'debug');
            return {
                success: true,
                projectPath: result.projectPath,
                projectName: result.projectName,
                projectSaved: result.projectSaved,
                projectModified: result.projectModified
            };
        } else {
            const errorMsg = result && result.error ? result.error : '未知错误';
            this.log(`❌ 项目信息获取失败: ${errorMsg}`, 'error');
            return {
                success: false,
                error: errorMsg
            };
        }

    } catch (error) {
        this.log(`💥 项目信息获取异常: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}
```

### 合成活动状态检查

```javascript
/**
 * 检查活动合成是否存在
 * @returns {Promise<Object>} 检查结果
 */
async checkActiveComp() {
    try {
        this.log('🔍 检查活动合成是否存在...', 'debug');

        // 检查是否为Demo模式
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：虚拟合成存在性检查', 'debug');
            
            // Demo模式：返回虚拟合成状态
            if (window.demoProject) {
                const demoStatus = window.demoProject.getActiveCompStatus();
                this.log(`✅ 虚拟合成存在性检查完成: ${demoStatus.exists}`, 'debug');
                return {
                    exists: demoStatus.exists,
                    compName: demoStatus.compName,
                    compWidth: demoStatus.compWidth,
                    compHeight: demoStatus.compHeight,
                    compDuration: demoStatus.compDuration
                };
            } else {
                // 模拟合成存在
                const mockExists = localStorage.getItem('demoCompExists') !== 'false';
                const mockCompName = localStorage.getItem('demoCompName') || '合成 1';
                const mockCompWidth = parseInt(localStorage.getItem('demoCompWidth')) || 1920;
                const mockCompHeight = parseInt(localStorage.getItem('demoCompHeight')) || 1080;
                const mockCompDuration = parseFloat(localStorage.getItem('demoCompDuration')) || 10.0;
                
                this.log(`✅ 虚拟合成存在性检查完成: ${mockExists}`, 'debug');
                return {
                    exists: mockExists,
                    compName: mockExists ? mockCompName : null,
                    compWidth: mockExists ? mockCompWidth : null,
                    compHeight: mockExists ? mockCompHeight : null,
                    compDuration: mockExists ? mockCompDuration : null
                };
            }
        }

        // CEP模式：使用ExtendScript检查活动合成存在性
        const result = await this.aeExtension.executeExtendScript('checkActiveComp', {});

        if (result && result.success !== undefined) {
            this.log(`✅ 合成存在性检查完成: ${result.success}`, 'debug');
            return {
                exists: result.success,
                compName: result.compName || null,
                compWidth: result.compWidth || null,
                compHeight: result.compHeight || null,
                compDuration: result.compDuration || null
            };
        } else {
            const errorMsg = result && result.error ? result.error : '未知错误';
            this.log(`❌ 合成存在性检查失败: ${errorMsg}`, 'error');
            return {
                exists: false,
                error: errorMsg,
                compName: null,
                compWidth: null,
                compHeight: null,
                compDuration: null
            };
        }

    } catch (error) {
        this.log(`💥 合成存在性检查异常: ${error.message}`, 'error');
        return {
            exists: false,
            error: error.message,
            compName: null,
            compWidth: null,
            compHeight: null,
            compDuration: null
        };
    }
}

/**
 * 获取活动合成信息
 * @returns {Promise<Object>} 合成信息
 */
async getActiveCompInfo() {
    try {
        this.log('🔍 获取活动合成信息...', 'debug');

        // 检查是否为Demo模式
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：虚拟合成信息获取', 'debug');
            
            // Demo模式：返回虚拟合成信息
            if (window.demoProject) {
                const demoInfo = window.demoProject.getActiveCompInfo();
                this.log('✅ 虚拟合成信息获取完成', 'debug');
                return {
                    success: true,
                    compName: demoInfo.compName,
                    compWidth: demoInfo.compWidth,
                    compHeight: demoInfo.compHeight,
                    compDuration: demoInfo.compDuration,
                    compFps: demoInfo.compFps
                };
            } else {
                // 模拟合成信息
                const mockCompName = localStorage.getItem('demoCompName') || '合成 1';
                const mockCompWidth = parseInt(localStorage.getItem('demoCompWidth')) || 1920;
                const mockCompHeight = parseInt(localStorage.getItem('demoCompHeight')) || 1080;
                const mockCompDuration = parseFloat(localStorage.getItem('demoCompDuration')) || 10.0;
                const mockCompFps = parseFloat(localStorage.getItem('demoCompFps')) || 29.97;
                
                this.log('✅ 虚拟合成信息获取完成', 'debug');
                return {
                    success: true,
                    compName: mockCompName,
                    compWidth: mockCompWidth,
                    compHeight: mockCompHeight,
                    compDuration: mockCompDuration,
                    compFps: mockCompFps
                };
            }
        }

        // CEP模式：使用ExtendScript获取合成信息
        const result = await this.aeExtension.executeExtendScript('getActiveCompInfo', {});

        if (result && result.success) {
            this.log('✅ 活动合成信息获取完成', 'debug');
            return {
                success: true,
                compName: result.compName,
                compWidth: result.compWidth,
                compHeight: result.compHeight,
                compDuration: result.compDuration,
                compFps: result.compFps
            };
        } else {
            const errorMsg = result && result.error ? result.error : '未知错误';
            this.log(`❌ 活动合成信息获取失败: ${errorMsg}`, 'error');
            return {
                success: false,
                error: errorMsg
            };
        }

    } catch (error) {
        this.log(`💥 活动合成信息获取异常: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message
        };
    }
}
```

### 项目保存状态检查

```javascript
/**
 * 检查项目是否已保存
 * @returns {Promise<Object>} 检查结果
 */
async checkProjectSaved() {
    try {
        this.log('🔍 检查项目是否已保存...', 'debug');

        // 检查是否为Demo模式
        if (window.__DEMO_MODE_ACTIVE__) {
            this.log('🎭 Demo模式：虚拟项目保存状态检查', 'debug');
            
            // Demo模式：返回虚拟保存状态
            if (window.demoProject) {
                const demoStatus = window.demoProject.getProjectSavedStatus();
                this.log(`✅ 虚拟项目保存状态检查完成: ${demoStatus.saved}`, 'debug');
                return {
                    saved: demoStatus.saved,
                    modified: demoStatus.modified
                };
            } else {
                // 模拟保存状态
                const mockSaved = localStorage.getItem('demoProjectSaved') !== 'false';
                const mockModified = localStorage.getItem('demoProjectModified') === 'true';
                
                this.log(`✅ 虚拟项目保存状态检查完成: ${mockSaved}`, 'debug');
                return {
                    saved: mockSaved,
                    modified: mockModified
                };
            }
        }

        // CEP模式：使用ExtendScript检查项目保存状态
        const result = await this.aeExtension.executeExtendScript('checkProjectSaved', {});

        if (result && result.success !== undefined) {
            this.log(`✅ 项目保存状态检查完成: ${result.success}`, 'debug');
            return {
                saved: result.success,
                modified: result.modified || false
            };
        } else {
            const errorMsg = result && result.error ? result.error : '未知错误';
            this.log(`❌ 项目保存状态检查失败: ${errorMsg}`, 'error');
            return {
                saved: false,
                modified: false,
                error: errorMsg
            };
        }

    } catch (error) {
        this.log(`💥 项目保存状态检查异常: ${error.message}`, 'error');
        return {
            saved: false,
            modified: false,
            error: error.message
        };
    }
}
```

### 全面状态验证

```javascript
/**
 * 验证项目状态
 * @param {Object} options - 验证选项
 * @param {boolean} options.requireProject - 是否要求项目存在
 * @param {boolean} options.requireActiveComposition - 是否要求活动合成存在
 * @param {boolean} options.requireProjectSaved - 是否要求项目已保存
 * @param {boolean} options.showWarning - 是否显示警告
 * @param {boolean} options.updateUI - 是否更新UI
 * @returns {Promise<boolean>} 验证结果
 */
async validateProjectStatus(options = {}) {
    try {
        const {
            requireProject = true,
            requireActiveComposition = false,
            requireProjectSaved = false,
            showWarning = true,
            updateUI = true
        } = options;

        this.log(`🔍 验证项目状态 (项目: ${requireProject}, 合成: ${requireActiveComposition}, 已保存: ${requireProjectSaved})`, 'debug');

        // 获取当前状态
        const status = await this.getProjectStatus();
        
        // 验证项目存在性
        if (requireProject && !status.projectExists) {
            this.log('❌ 项目验证失败：项目不存在', 'warning');
            
            if (showWarning) {
                this.showProjectWarning('项目不存在', '请先打开一个After Effects项目');
            }
            
            return false;
        }

        // 验证活动合成存在性
        if (requireActiveComposition && !status.activeCompExists) {
            this.log('❌ 合成验证失败：活动合成不存在', 'warning');
            
            if (showWarning) {
                this.showProjectWarning('活动合成不存在', '请先创建或选择一个合成');
            }
            
            return false;
        }

        // 验证项目保存状态
        if (requireProjectSaved && !status.isProjectSaved) {
            this.log('❌ 项目保存状态验证失败：项目未保存', 'warning');
            
            if (showWarning) {
                this.showProjectWarning('项目未保存', '请先保存项目再执行此操作');
            }
            
            return false;
        }

        // 验证通过
        this.log('✅ 项目状态验证通过', 'success');
        
        // 更新UI
        if (updateUI) {
            this.updateStatusUI(status);
        }

        // 触发状态验证通过事件
        this.emitStatusValidationPassed(status);

        return true;

    } catch (error) {
        this.log(`💥 项目状态验证异常: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 获取项目状态
 * @param {boolean} forceRefresh - 是否强制刷新
 * @returns {Promise<Object>} 项目状态
 */
async getProjectStatus(forceRefresh = false) {
    try {
        const cacheKey = 'projectStatus';
        const now = Date.now();

        // 检查缓存
        if (!forceRefresh && this.statusCache.has(cacheKey)) {
            const cached = this.statusCache.get(cacheKey);
            if ((now - cached.timestamp) < this.cacheTimeout) {
                this.log('📋 使用缓存的项目状态', 'debug');
                return cached.data;
            }
        }

        this.log('🔍 获取最新项目状态...', 'debug');

        // 获取各部分状态
        const [projectCheck, compCheck, savedCheck] = await Promise.all([
            this.checkProjectExists(),
            this.checkActiveComp(),
            this.checkProjectSaved()
        ]);

        // 构建状态对象
        const status = {
            projectExists: projectCheck.exists,
            projectPath: projectCheck.projectPath,
            projectName: projectCheck.projectName,
            activeCompExists: compCheck.exists,
            activeCompName: compCheck.compName,
            activeCompWidth: compCheck.compWidth,
            activeCompHeight: compCheck.compHeight,
            activeCompDuration: compCheck.compDuration,
            isProjectSaved: savedCheck.saved,
            projectModified: savedCheck.modified,
            timestamp: now
        };

        // 更新状态
        this.currentStatus = status;

        // 缓存状态
        this.statusCache.set(cacheKey, {
            data: status,
            timestamp: now
        });

        this.log('✅ 项目状态获取完成', 'debug');
        return status;

    } catch (error) {
        this.log(`💥 获取项目状态异常: ${error.message}`, 'error');
        return this.currentStatus; // 返回最后已知状态
    }
}

/**
 * 更新项目状态
 * @returns {Promise<Object>} 更新后的状态
 */
async updateProjectStatus() {
    try {
        this.log('🔄 更新项目状态...', 'debug');

        // 获取旧状态
        const oldStatus = { ...this.currentStatus };

        // 获取新状态
        const newStatus = await this.getProjectStatus(true);

        // 更新状态
        this.currentStatus = newStatus;

        // 触发状态变更事件
        this.emitStatusChange(oldStatus, newStatus);

        this.log('✅ 项目状态更新完成', 'debug');
        return newStatus;

    } catch (error) {
        this.log(`💥 更新项目状态异常: ${error.message}`, 'error');
        return this.currentStatus;
    }
}
```

### UI更新和警告显示

```javascript
/**
 * 更新状态UI
 * @param {Object} status - 项目状态
 */
updateStatusUI(status) {
    try {
        // 更新项目状态指示器
        const projectStatusIndicator = document.getElementById('project-status-indicator');
        if (projectStatusIndicator) {
            if (status.projectExists) {
                projectStatusIndicator.className = 'status-indicator active';
                projectStatusIndicator.title = `项目: ${status.projectName || 'Unknown'}`;
            } else {
                projectStatusIndicator.className = 'status-indicator inactive';
                projectStatusIndicator.title = '项目: 未打开';
            }
        }

        // 更新合成状态指示器
        const compStatusIndicator = document.getElementById('comp-status-indicator');
        if (compStatusIndicator) {
            if (status.activeCompExists) {
                compStatusIndicator.className = 'status-indicator active';
                compStatusIndicator.title = `合成: ${status.activeCompName || 'Unknown'}`;
            } else {
                compStatusIndicator.className = 'status-indicator inactive';
                compStatusIndicator.title = '合成: 未选择';
            }
        }

        // 更新项目信息显示
        const projectInfoDisplay = document.getElementById('project-info-display');
        if (projectInfoDisplay) {
            projectInfoDisplay.innerHTML = status.projectExists ? 
                `<div class="project-info">
                    <span class="project-name">${status.projectName}</span>
                    <span class="project-path">${status.projectPath}</span>
                </div>` : 
                '<div class="no-project">未打开项目</div>';
        }

        // 更新合成信息显示
        const compInfoDisplay = document.getElementById('comp-info-display');
        if (compInfoDisplay) {
            compInfoDisplay.innerHTML = status.activeCompExists ? 
                `<div class="comp-info">
                    <span class="comp-name">${status.activeCompName}</span>
                    <span class="comp-dimensions">${status.activeCompWidth}×${status.activeCompHeight}</span>
                    <span class="comp-duration">${status.activeCompDuration.toFixed(2)}s</span>
                </div>` : 
                '<div class="no-comp">未选择合成</div>';
        }

        this.log('🔄 状态UI已更新', 'debug');

    } catch (error) {
        this.log(`更新状态UI失败: ${error.message}`, 'error');
    }
}

/**
 * 显示项目警告
 * @param {string} title - 警告标题
 * @param {string} message - 警告消息
 */
showProjectWarning(title, message) {
    try {
        this.log(`⚠️ 显示项目警告: ${title} - ${message}`, 'warning');

        // 创建警告元素
        const warningDiv = document.createElement('div');
        warningDiv.className = 'project-status-warning';
        warningDiv.innerHTML = `
            <div class="warning-header">
                <span class="warning-icon">⚠️</span>
                <span class="warning-title">${title}</span>
                <button class="warning-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="warning-message">${message}</div>
        `;

        // 添加样式
        warningDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // 添加到页面
        document.body.appendChild(warningDiv);

        // 5秒后自动移除
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.remove();
            }
        }, 5000);

    } catch (error) {
        this.log(`显示项目警告失败: ${error.message}`, 'error');
    }
}

/**
 * 显示项目错误
 * @param {string} title - 错误标题
 * @param {string} message - 错误消息
 */
showProjectError(title, message) {
    try {
        this.log(`❌ 显示项目错误: ${title} - ${message}`, 'error');

        // 创建错误元素
        const errorDiv = document.createElement('div');
        errorDiv.className = 'project-status-error';
        errorDiv.innerHTML = `
            <div class="error-header">
                <span class="error-icon">❌</span>
                <span class="error-title">${title}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="error-message">${message}</div>
        `;

        // 添加样式
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        // 添加到页面
        document.body.appendChild(errorDiv);

    } catch (error) {
        this.log(`显示项目错误失败: ${error.message}`, 'error');
    }
}
```

### 事件处理

```javascript
/**
 * 触发状态变更事件
 * @param {Object} oldStatus - 旧状态
 * @param {Object} newStatus - 新状态
 */
emitStatusChange(oldStatus, newStatus) {
    try {
        // 创建状态变更事件
        const event = new CustomEvent('projectStatusChanged', {
            detail: {
                oldStatus: oldStatus,
                newStatus: newStatus,
                timestamp: Date.now()
            }
        });

        // 触发事件
        document.dispatchEvent(event);

        // 触发通用事件
        this.emit('statusChange', {
            oldStatus: oldStatus,
            newStatus: newStatus,
            timestamp: Date.now()
        });

        this.log('🔊 项目状态变更事件已触发', 'debug');

    } catch (error) {
        this.log(`触发状态变更事件失败: ${error.message}`, 'error');
    }
}

/**
 * 触发状态验证通过事件
 * @param {Object} status - 项目状态
 */
emitStatusValidationPassed(status) {
    try {
        // 创建验证通过事件
        const event = new CustomEvent('projectStatusValidationPassed', {
            detail: {
                status: status,
                timestamp: Date.now()
            }
        });

        // 触发事件
        document.dispatchEvent(event);

        // 触发通用事件
        this.emit('validationPassed', {
            status: status,
            timestamp: Date.now()
        });

        this.log('🔊 项目状态验证通过事件已触发', 'debug');

    } catch (error) {
        this.log(`触发验证通过事件失败: ${error.message}`, 'error');
    }
}

/**
 * 添加状态变更监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addStatusChangeListener(listener) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }

        // 添加到变更监听器列表
        this.changeListeners.push(listener);

        this.log('👂 已添加项目状态变更监听器', 'debug');

        // 返回移除监听器的函数
        return () => {
            this.removeStatusChangeListener(listener);
        };

    } catch (error) {
        this.log(`添加状态变更监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数以防调用错误
    }
}

/**
 * 移除状态变更监听器
 * @param {Function} listener - 监听器函数
 */
removeStatusChangeListener(listener) {
    try {
        const index = this.changeListeners.indexOf(listener);
        if (index !== -1) {
            this.changeListeners.splice(index, 1);
            this.log('👂 已移除项目状态变更监听器', 'debug');
        }

    } catch (error) {
        this.log(`移除状态变更监听器失败: ${error.message}`, 'error');
    }
}

/**
 * 添加验证通过监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addValidationPassedListener(listener) {
    try {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是函数');
        }

        // 添加到验证通过监听器列表
        this.validationPassedListeners.push(listener);

        this.log('👂 已添加项目状态验证通过监听器', 'debug');

        // 返回移除监听器的函数
        return () => {
            this.removeValidationPassedListener(listener);
        };

    } catch (error) {
        this.log(`添加验证通过监听器失败: ${error.message}`, 'error');
        return () => {}; // 返回空函数以防调用错误
    }
}

/**
 * 移除验证通过监听器
 * @param {Function} listener - 监听器函数
 */
removeValidationPassedListener(listener) {
    try {
        const index = this.validationPassedListeners.indexOf(listener);
        if (index !== -1) {
            this.validationPassedListeners.splice(index, 1);
            this.log('👂 已移除项目状态验证通过监听器', 'debug');
        }

    } catch (error) {
        this.log(`移除验证通过监听器失败: ${error.message}`, 'error');
    }
}
```

## API参考

### 核心方法

#### ProjectStatusChecker
项目状态检查器主类

```javascript
/**
 * 项目状态检查器
 * 负责验证After Effects项目的当前状态，确保执行各种操作前满足必要的条件
 */
class ProjectStatusChecker
```

#### constructor()
构造函数

```javascript
/**
 * 构造函数
 * @param {Object} aeExtension - AE扩展实例
 */
constructor(aeExtension)
```

#### validateProjectStatus()
验证项目状态

```javascript
/**
 * 验证项目状态
 * @param {Object} options - 验证选项
 * @param {boolean} options.requireProject - 是否要求项目存在
 * @param {boolean} options.requireActiveComposition - 是否要求活动合成存在
 * @param {boolean} options.requireProjectSaved - 是否要求项目已保存
 * @param {boolean} options.showWarning - 是否显示警告
 * @param {boolean} options.updateUI - 是否更新UI
 * @returns {Promise<boolean>} 验证结果
 */
async validateProjectStatus(options = {})
```

#### getProjectStatus()
获取项目状态

```javascript
/**
 * 获取项目状态
 * @param {boolean} forceRefresh - 是否强制刷新
 * @returns {Promise<Object>} 项目状态
 */
async getProjectStatus(forceRefresh = false)
```

#### updateProjectStatus()
更新项目状态

```javascript
/**
 * 更新项目状态
 * @returns {Promise<Object>} 更新后的状态
 */
async updateProjectStatus()
```

#### checkProjectExists()
检查项目是否存在

```javascript
/**
 * 检查项目是否存在
 * @returns {Promise<Object>} 检查结果
 */
async checkProjectExists()
```

#### checkActiveComp()
检查活动合成是否存在

```javascript
/**
 * 检查活动合成是否存在
 * @returns {Promise<Object>} 检查结果
 */
async checkActiveComp()
```

#### checkProjectSaved()
检查项目是否已保存

```javascript
/**
 * 检查项目是否已保存
 * @returns {Promise<Object>} 检查结果
 */
async checkProjectSaved()
```

#### getProjectInfo()
获取项目信息

```javascript
/**
 * 获取项目信息
 * @returns {Promise<Object>} 项目信息
 */
async getProjectInfo()
```

#### getActiveCompInfo()
获取活动合成信息

```javascript
/**
 * 获取活动合成信息
 * @returns {Promise<Object>} 合成信息
 */
async getActiveCompInfo()
```

#### updateStatusUI()
更新状态UI

```javascript
/**
 * 更新状态UI
 * @param {Object} status - 项目状态
 */
updateStatusUI(status)
```

#### showProjectWarning()
显示项目警告

```javascript
/**
 * 显示项目警告
 * @param {string} title - 警告标题
 * @param {string} message - 警告消息
 */
showProjectWarning(title, message)
```

#### showProjectError()
显示项目错误

```javascript
/**
 * 显示项目错误
 * @param {string} title - 错误标题
 * @param {string} message - 错误消息
 */
showProjectError(title, message)
```

#### emitStatusChange()
触发状态变更事件

```javascript
/**
 * 触发状态变更事件
 * @param {Object} oldStatus - 旧状态
 * @param {Object} newStatus - 新状态
 */
emitStatusChange(oldStatus, newStatus)
```

#### emitStatusValidationPassed()
触发状态验证通过事件

```javascript
/**
 * 触发状态验证通过事件
 * @param {Object} status - 项目状态
 */
emitStatusValidationPassed(status)
```

#### addStatusChangeListener()
添加状态变更监听器

```javascript
/**
 * 添加状态变更监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addStatusChangeListener(listener)
```

#### removeStatusChangeListener()
移除状态变更监听器

```javascript
/**
 * 移除状态变更监听器
 * @param {Function} listener - 监听器函数
 */
removeStatusChangeListener(listener)
```

#### addValidationPassedListener()
添加验证通过监听器

```javascript
/**
 * 添加验证通过监听器
 * @param {Function} listener - 监听器函数
 * @returns {Function} 移除监听器的函数
 */
addValidationPassedListener(listener)
```

#### removeValidationPassedListener()
移除验证通过监听器

```javascript
/**
 * 移除验证通过监听器
 * @param {Function} listener - 监听器函数
 */
removeValidationPassedListener(listener)
```

### 状态对象结构

```javascript
/**
 * 项目状态对象
 * @typedef {Object} ProjectStatus
 * @property {boolean} projectExists - 项目是否存在
 * @property {string|null} projectPath - 项目路径
 * @property {string|null} projectName - 项目名称
 * @property {boolean} activeCompExists - 活动合成是否存在
 * @property {string|null} activeCompName - 活动合成名称
 * @property {number|null} activeCompWidth - 活动合成宽度
 * @property {number|null} activeCompHeight - 活动合成高度
 * @property {number|null} activeCompDuration - 活动合成时长
 * @property {boolean} isProjectSaved - 项目是否已保存
 * @property {boolean} projectModified - 项目是否被修改
 * @property {number} timestamp - 状态获取时间戳
 */
```

## 使用示例

### 基本使用

#### 验证项目状态
```javascript
// 验证项目是否存在
const projectValid = await projectStatusChecker.validateProjectStatus({
    requireProject: true,
    requireActiveComposition: false,
    showWarning: true
});

if (projectValid) {
    console.log('✅ 项目存在，可以执行相关操作');
} else {
    console.log('❌ 项目不存在，无法执行操作');
}

// 验证项目和活动合成都存在
const projectAndCompValid = await projectStatusChecker.validateProjectStatus({
    requireProject: true,
    requireActiveComposition: true,
    showWarning: true
});

if (projectAndCompValid) {
    console.log('✅ 项目和活动合成都存在，可以执行相关操作');
} else {
    console.log('❌ 项目或活动合成不存在，无法执行操作');
}
```

#### 获取详细状态信息
```javascript
// 获取当前项目状态
const status = await projectStatusChecker.getProjectStatus();

console.log('当前项目状态:', {
    项目存在: status.projectExists,
    项目路径: status.projectPath,
    项目名称: status.projectName,
    合成存在: status.activeCompExists,
    合成名称: status.activeCompName,
    合成尺寸: `${status.activeCompWidth}×${status.activeCompHeight}`,
    项目已保存: status.isProjectSaved,
    项目被修改: status.projectModified
});

// 如果项目存在，获取详细信息
if (status.projectExists) {
    const projectInfo = await projectStatusChecker.getProjectInfo();
    if (projectInfo.success) {
        console.log('项目详细信息:', projectInfo);
    }
}

// 如果合成存在，获取详细信息
if (status.activeCompExists) {
    const compInfo = await projectStatusChecker.getActiveCompInfo();
    if (compInfo.success) {
        console.log('合成详细信息:', compInfo);
    }
}
```

#### 监听状态变更
```javascript
// 监听项目状态变更
const removeStatusListener = projectStatusChecker.addStatusChangeListener((event) => {
    const { oldStatus, newStatus, timestamp } = event.detail;
    console.log('📋 项目状态变更:', {
        旧状态: oldStatus,
        新状态: newStatus,
        时间: new Date(timestamp).toLocaleString()
    });
    
    // 根据状态变更执行相应操作
    if (oldStatus.projectExists !== newStatus.projectExists) {
        console.log('📁 项目打开/关闭状态变更');
    }
    
    if (oldStatus.activeCompExists !== newStatus.activeCompExists) {
        console.log('🎬 合成选择状态变更');
    }
});

// 监听状态验证通过事件
const removeValidationListener = projectStatusChecker.addValidationPassedListener((event) => {
    const { status, timestamp } = event.detail;
    console.log('✅ 项目状态验证通过:', status);
    
    // 验证通过后执行相关操作
    performProjectOperations(status);
});

// 使用完成后移除监听器
// removeStatusListener();
// removeValidationListener();
```

### 高级使用

#### 批量状态检查
```javascript
// 批量检查多个状态
async function batchCheckStatus() {
    const checks = [
        projectStatusChecker.checkProjectExists(),
        projectStatusChecker.checkActiveComp(),
        projectStatusChecker.checkProjectSaved()
    ];
    
    const results = await Promise.allSettled(checks);
    
    console.log('批量状态检查结果:', {
        项目存在: results[0].status === 'fulfilled' && results[0].value.exists,
        合成存在: results[1].status === 'fulfilled' && results[1].value.exists,
        项目已保存: results[2].status === 'fulfilled' && results[2].value.saved
    });
    
    // 处理可能的错误
    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(`状态检查${index + 1}失败:`, result.reason);
        }
    });
}

// 使用示例
await batchCheckStatus();
```

#### 状态监控
```javascript
// 创建状态监控器
class ProjectStatusMonitor {
    constructor(projectStatusChecker) {
        this.projectStatusChecker = projectStatusChecker;
        this.monitorInterval = null;
        this.monitorTimeout = 5000; // 5秒间隔
        this.lastStatus = null;
    }
    
    /**
     * 开始监控项目状态
     */
    startMonitoring() {
        if (this.monitorInterval) {
            console.log('📋 项目状态监控已在运行');
            return;
        }
        
        this.monitorInterval = setInterval(async () => {
            try {
                const currentStatus = await this.projectStatusChecker.getProjectStatus();
                
                // 检查状态是否发生变化
                if (this.lastStatus) {
                    this.checkStatusChanges(this.lastStatus, currentStatus);
                }
                
                this.lastStatus = currentStatus;
                
            } catch (error) {
                console.error('监控项目状态失败:', error);
            }
        }, this.monitorTimeout);
        
        console.log('📋 开始监控项目状态');
    }
    
    /**
     * 停止监控项目状态
     */
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
            console.log('📋 停止监控项目状态');
        }
    }
    
    /**
     * 检查状态变化
     * @param {Object} oldStatus - 旧状态
     * @param {Object} newStatus - 新状态
     */
    checkStatusChanges(oldStatus, newStatus) {
        // 检查项目存在性变化
        if (oldStatus.projectExists !== newStatus.projectExists) {
            console.log(`📁 项目状态变化: ${oldStatus.projectExists ? '关闭' : '打开'}了项目`);
            
            if (newStatus.projectExists) {
                console.log(`📄 打开了项目: ${newStatus.projectName}`);
            } else {
                console.log('📄 项目已关闭');
            }
        }
        
        // 检查合成存在性变化
        if (oldStatus.activeCompExists !== newStatus.activeCompExists) {
            console.log(`🎬 合成状态变化: ${oldStatus.activeCompExists ? '取消选择' : '选择了'}合成`);
            
            if (newStatus.activeCompExists) {
                console.log(`📺 选择了合成: ${newStatus.activeCompName}`);
            } else {
                console.log('📺 合成已取消选择');
            }
        }
        
        // 检查保存状态变化
        if (oldStatus.isProjectSaved !== newStatus.isProjectSaved) {
            console.log(`💾 项目保存状态变化: ${newStatus.isProjectSaved ? '已保存' : '未保存'}`);
        }
        
        // 检查项目修改状态变化
        if (oldStatus.projectModified !== newStatus.projectModified) {
            console.log(`✏️ 项目修改状态变化: ${newStatus.projectModified ? '已修改' : '未修改'}`);
        }
    }
}

// 使用项目状态监控器
const statusMonitor = new ProjectStatusMonitor(projectStatusChecker);
statusMonitor.startMonitoring();

// 在需要时停止监控
// statusMonitor.stopMonitoring();
```

#### 状态驱动的操作
```javascript
// 基于项目状态执行不同操作
class StatusBasedOperation {
    constructor(projectStatusChecker) {
        this.projectStatusChecker = projectStatusChecker;
    }
    
    /**
     * 执行状态相关的操作
     */
    async executeStatusBasedOperation() {
        // 首先获取当前状态
        const status = await this.projectStatusChecker.getProjectStatus();
        
        console.log('当前项目状态:', {
            projectExists: status.projectExists,
            activeCompExists: status.activeCompExists,
            isProjectSaved: status.isProjectSaved
        });
        
        // 根据状态执行不同操作
        if (!status.projectExists) {
            // 项目不存在
            console.log('📁 项目不存在，需要先创建或打开项目');
            await this.handleNoProject();
            return;
        }
        
        if (!status.activeCompExists) {
            // 活动合成不存在，但项目存在
            console.log('🎬 项目存在但没有活动合成，可能需要创建合成');
            await this.handleNoActiveComp(status);
            return;
        }
        
        if (!status.isProjectSaved) {
            // 项目存在且有活动合成，但项目未保存
            console.log('💾 项目未保存，可能需要先保存项目');
            await this.handleUnsavedProject(status);
            return;
        }
        
        // 所有条件都满足，执行主要操作
        console.log('✅ 所有条件满足，执行主要操作');
        await this.executeMainOperation(status);
    }
    
    /**
     * 处理项目不存在的情况
     */
    async handleNoProject() {
        console.log('📁 项目不存在，提示用户创建或打开项目');
        
        // 显示创建/打开项目的UI
        this.showProjectCreationUI();
    }
    
    /**
     * 处理活动合成不存在的情况
     * @param {Object} status - 项目状态
     */
    async handleNoActiveComp(status) {
        console.log('🎬 活动合成不存在，提示用户创建或选择合成');
        
        // 显示创建/选择合成的UI
        this.showCompCreationUI(status);
    }
    
    /**
     * 处理项目未保存的情况
     * @param {Object} status - 项目状态
     */
    async handleUnsavedProject(status) {
        console.log('💾 项目未保存，提示用户保存项目');
        
        // 显示保存项目的UI或确认对话框
        const shouldSave = await this.showSaveConfirmation();
        if (shouldSave) {
            const saveResult = await this.saveProject();
            if (saveResult.success) {
                console.log('✅ 项目已保存，继续执行操作');
                await this.executeMainOperation({ ...status, isProjectSaved: true });
            } else {
                console.log('❌ 项目保存失败', saveResult.error);
            }
        }
    }
    
    /**
     * 执行主要操作
     * @param {Object} status - 项目状态
     */
    async executeMainOperation(status) {
        console.log('🔧 执行主要操作，当前状态:', status);
        
        // 这里执行主要业务逻辑
        // 例如：导入素材、创建图层、应用效果等
        console.log('✅ 主要操作执行完成');
    }
    
    /**
     * 显示项目创建UI
     */
    showProjectCreationUI() {
        // 实现项目创建UI
        console.log('📱 显示项目创建UI');
    }
    
    /**
     * 显示合成创建UI
     * @param {Object} status - 项目状态
     */
    showCompCreationUI(status) {
        // 实现合成创建UI
        console.log('📱 显示合成创建UI');
    }
    
    /**
     * 显示保存确认对话框
     * @returns {Promise<boolean>} 用户确认结果
     */
    async showSaveConfirmation() {
        return new Promise((resolve) => {
            // 模拟确认对话框
            const confirmed = confirm('项目未保存，是否先保存项目？');
            resolve(confirmed);
        });
    }
    
    /**
     * 保存项目
     * @returns {Object} 保存结果
     */
    async saveProject() {
        try {
            // 检查是否为Demo模式
            if (window.__DEMO_MODE_ACTIVE__) {
                console.log('🎭 Demo模式：模拟项目保存');
                return { success: true };
            }
            
            // CEP模式：使用ExtendScript保存项目
            const result = await this.projectStatusChecker.aeExtension.executeExtendScript('saveProject');
            
            if (result && result.success) {
                console.log('✅ 项目保存成功');
                return { success: true };
            } else {
                console.error('❌ 项目保存失败:', result?.error || '未知错误');
                return { success: false, error: result?.error || '未知错误' };
            }
            
        } catch (error) {
            console.error('💥 项目保存异常:', error.message);
            return { success: false, error: error.message };
        }
    }
}

// 使用状态驱动的操作
const statusBasedOp = new StatusBasedOperation(projectStatusChecker);
await statusBasedOp.executeStatusBasedOperation();
```

## 最佳实践

### 使用建议

#### 状态验证模式
```javascript
// 创建状态验证助手函数
class ProjectStatusHelper {
    constructor(projectStatusChecker) {
        this.checker = projectStatusChecker;
    }
    
    /**
     * 验证是否可以执行导入操作
     * @returns {Promise<boolean>} 验证结果
     */
    async canPerformImport() {
        return await this.checker.validateProjectStatus({
            requireProject: true,
            requireActiveComposition: true,
            requireProjectSaved: false, // 导入操作不一定需要保存项目
            showWarning: true,
            updateUI: true
        });
    }
    
    /**
     * 验证是否可以执行导出操作
     * @returns {Promise<boolean>} 验证结果
     */
    async canPerformExport() {
        return await this.checker.validateProjectStatus({
            requireProject: true,
            requireActiveComposition: false, // 导出操作不需要活动合成
            requireProjectSaved: true, // 导出操作需要项目已保存
            showWarning: true,
            updateUI: true
        });
    }
    
    /**
     * 验证是否可以执行设置操作
     * @returns {Promise<boolean>} 验证结果
     */
    async canPerformSettings() {
        return await this.checker.validateProjectStatus({
            requireProject: false, // 设置操作不需要项目
            requireActiveComposition: false,
            requireProjectSaved: false,
            showWarning: false, // 设置操作不需要显示警告
            updateUI: true
        });
    }
    
    /**
     * 等待项目状态满足条件
     * @param {Function} conditionFn - 条件函数
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {Promise<boolean>} 是否满足条件
     */
    async waitForCondition(conditionFn, timeout = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const status = await this.checker.getProjectStatus();
            if (conditionFn(status)) {
                return true;
            }
            
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return false;
    }
}

// 使用状态验证助手
const statusHelper = new ProjectStatusHelper(projectStatusChecker);

// 验证是否可以导入
const canImport = await statusHelper.canPerformImport();
if (canImport) {
    console.log('✅ 可以执行导入操作');
    // 执行导入操作
} else {
    console.log('❌ 无法执行导入操作');
}
```

#### 状态缓存优化
```javascript
// 实现智能状态缓存
class SmartStatusCache {
    constructor(timeout = 1000) { // 默认1秒缓存
        this.cache = new Map();
        this.timeout = timeout;
        this.timers = new Map();
    }
    
    /**
     * 设置缓存值
     * @param {string} key - 缓存键
     * @param {any} value - 缓存值
     */
    set(key, value) {
        // 清除旧的定时器
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }
        
        // 设置新值
        this.cache.set(key, {
            value: value,
            timestamp: Date.now()
        });
        
        // 设置过期定时器
        const timer = setTimeout(() => {
            this.delete(key);
        }, this.timeout);
        
        this.timers.set(key, timer);
    }
    
    /**
     * 获取缓存值
     * @param {string} key - 缓存键
     * @returns {any} 缓存值或undefined
     */
    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }
        
        const cached = this.cache.get(key);
        const age = Date.now() - cached.timestamp;
        
        if (age > this.timeout) {
            this.delete(key);
            return undefined;
        }
        
        return cached.value;
    }
    
    /**
     * 检查缓存是否存在且未过期
     * @param {string} key - 缓存键
     * @returns {boolean} 是否存在且未过期
     */
    has(key) {
        return this.get(key) !== undefined;
    }
    
    /**
     * 删除缓存值
     * @param {string} key - 缓存键
     */
    delete(key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
        
        this.cache.delete(key);
    }
    
    /**
     * 清空所有缓存
     */
    clear() {
        // 清除所有定时器
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        
        this.timers.clear();
        this.cache.clear();
    }
}

// 在ProjectStatusChecker中使用智能缓存
class EnhancedProjectStatusChecker extends ProjectStatusChecker {
    constructor(aeExtension) {
        super(aeExtension);
        
        // 使用智能缓存替代简单Map
        this.statusCache = new SmartStatusCache(2000); // 2秒缓存
    }
    
    /**
     * 获取项目状态（使用智能缓存）
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise<Object>} 项目状态
     */
    async getProjectStatus(forceRefresh = false) {
        try {
            const cacheKey = 'projectStatus';
            
            // 如果不是强制刷新且缓存存在，直接返回缓存值
            if (!forceRefresh && this.statusCache.has(cacheKey)) {
                const cached = this.statusCache.get(cacheKey);
                this.log('📋 使用智能缓存的项目状态', 'debug');
                return cached;
            }
            
            this.log('🔍 获取最新项目状态...', 'debug');
            
            // 获取各部分状态
            const [projectCheck, compCheck, savedCheck] = await Promise.all([
                this.checkProjectExists(),
                this.checkActiveComp(),
                this.checkProjectSaved()
            ]);
            
            // 构建状态对象
            const status = {
                projectExists: projectCheck.exists,
                projectPath: projectCheck.projectPath,
                projectName: projectCheck.projectName,
                activeCompExists: compCheck.exists,
                activeCompName: compCheck.compName,
                activeCompWidth: compCheck.compWidth,
                activeCompHeight: compCheck.compHeight,
                activeCompDuration: compCheck.compDuration,
                isProjectSaved: savedCheck.saved,
                projectModified: savedCheck.modified,
                timestamp: Date.now()
            };
            
            // 更新状态
            this.currentStatus = status;
            
            // 设置智能缓存
            this.statusCache.set(cacheKey, status);
            
            this.log('✅ 项目状态获取完成', 'debug');
            return status;
            
        } catch (error) {
            this.log(`💥 获取项目状态异常: ${error.message}`, 'error');
            return this.currentStatus; // 返回最后已知状态
        }
    }
}
```

#### 错误处理和重试机制
```javascript
// 实现带重试机制的状态检查
class RetryableProjectStatusChecker extends ProjectStatusChecker {
    constructor(aeExtension, retryConfig = {}) {
        super(aeExtension);
        
        this.retryConfig = {
            maxRetries: retryConfig.maxRetries || 3,
            retryDelay: retryConfig.retryDelay || 1000,
            backoffMultiplier: retryConfig.backoffMultiplier || 2,
            ...retryConfig
        };
    }
    
    /**
     * 使用重试机制检查项目存在性
     * @returns {Promise<Object>} 检查结果
     */
    async checkProjectExists() {
        return await this.withRetry(super.checkProjectExists.bind(this));
    }
    
    /**
     * 使用重试机制检查活动合成
     * @returns {Promise<Object>} 检查结果
     */
    async checkActiveComp() {
        return await this.withRetry(super.checkActiveComp.bind(this));
    }
    
    /**
     * 使用重试机制检查项目保存状态
     * @returns {Promise<Object>} 检查结果
     */
    async checkProjectSaved() {
        return await this.withRetry(super.checkProjectSaved.bind(this));
    }
    
    /**
     * 带重试机制的函数执行器
     * @param {Function} fn - 要执行的函数
     * @param {number} retries - 重试次数
     * @returns {Promise<any>} 函数执行结果
     */
    async withRetry(fn, retries = this.retryConfig.maxRetries) {
        let lastError;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                if (attempt > 0) {
                    const delay = this.retryConfig.retryDelay * 
                                Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);
                    this.log(`🔄 第${attempt}次重试，等待${delay}ms...`, 'debug');
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
                const result = await fn();
                
                if (result.error) {
                    throw new Error(result.error);
                }
                
                return result;
                
            } catch (error) {
                lastError = error;
                
                if (attempt === retries) {
                    this.log(`❌ 所有重试都失败了: ${error.message}`, 'error');
                    break;
                }
                
                this.log(`⚠️ 第${attempt + 1}次尝试失败: ${error.message}，准备重试...`, 'warning');
            }
        }
        
        // 返回最后的错误结果
        return {
            exists: false,
            error: lastError ? lastError.message : '未知错误',
            projectPath: null,
            projectName: null
        };
    }
    
    /**
     * 验证项目状态（带重试机制）
     * @param {Object} options - 验证选项
     * @returns {Promise<boolean>} 验证结果
     */
    async validateProjectStatus(options = {}) {
        return await this.withRetry(async () => {
            return await super.validateProjectStatus(options);
        });
    }
}
```

### 性能优化

#### 内存管理
```javascript
// 实现状态管理器的内存清理
function cleanupProjectStatusChecker(projectStatusChecker) {
    try {
        // 清理状态缓存
        if (projectStatusChecker.statusCache && typeof projectStatusChecker.statusCache.clear === 'function') {
            projectStatusChecker.statusCache.clear();
        } else {
            projectStatusChecker.statusCache.clear();
        }
        
        // 清理变更监听器
        projectStatusChecker.changeListeners = [];
        
        // 清理验证通过监听器
        projectStatusChecker.validationPassedListeners = [];
        
        // 清理通用事件监听器
        projectStatusChecker.eventListeners = [];
        
        // 清理字段监听器
        if (projectStatusChecker.fieldListeners) {
            projectStatusChecker.fieldListeners.clear();
        }
        
        // 清理验证器
        if (projectStatusChecker.validators) {
            projectStatusChecker.validators.clear();
        }
        
        // 清理迁移规则
        if (projectStatusChecker.migrations) {
            projectStatusChecker.migrations.clear();
        }
        
        projectStatusChecker.log('🧹 项目状态检查器资源已清理', 'debug');
        
    } catch (error) {
        projectStatusChecker.log(`清理项目状态检查器资源失败: ${error.message}`, 'error');
    }
}

// 在适当的时候调用清理函数
window.addEventListener('beforeunload', () => {
    cleanupProjectStatusChecker(projectStatusChecker);
});
```

## 故障排除

### 常见问题

#### 状态检查失败
- **症状**：调用`validateProjectStatus`失败或返回错误结果
- **解决**：
  1. 检查AE是否正确连接
  2. 验证ExtendScript函数是否正常工作
  3. 查看控制台错误日志
  4. 确认AE版本兼容性

#### 状态信息不准确
- **症状**：获取的状态信息与实际情况不符
- **解决**：
  1. 清除状态缓存：`await checker.getProjectStatus(true)`
  2. 验证缓存超时设置
  3. 检查AE项目是否真的存在和活跃

#### 事件监听器泄露
- **症状**：事件监听器数量持续增长
- **解决**：
  1. 确保在不需要时移除监听器
  2. 使用返回的移除函数：`const remove = addListener(...); remove();`
  3. 检查监听器清理逻辑

#### UI更新延迟
- **症状**：状态变更后UI没有及时更新
- **解决**：
  1. 检查`updateUI`参数是否正确设置
  2. 验证UI元素是否存在
  3. 确认UI更新函数是否正确执行

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控状态变更
projectStatusChecker.addStatusChangeListener((event) => {
    const { oldStatus, newStatus, timestamp } = event.detail;
    console.log('📋 项目状态变更:', {
        oldStatus,
        newStatus,
        time: new Date(timestamp).toLocaleString()
    });
});

// 监控验证通过事件
projectStatusChecker.addValidationPassedListener((event) => {
    console.log('✅ 项目状态验证通过:', event.detail.status);
});
```

#### 状态检查调试
```javascript
// 调试状态检查过程
async function debugStatusCheck() {
    console.log('🔍 开始调试状态检查...');
    
    // 检查各个组件
    const projectCheck = await projectStatusChecker.checkProjectExists();
    console.log('📁 项目存在性检查:', projectCheck);
    
    const compCheck = await projectStatusChecker.checkActiveComp();
    console.log('🎬 合成存在性检查:', compCheck);
    
    const savedCheck = await projectStatusChecker.checkProjectSaved();
    console.log('💾 项目保存状态检查:', savedCheck);
    
    // 获取完整状态
    const fullStatus = await projectStatusChecker.getProjectStatus(true);
    console.log('📊 完整状态信息:', fullStatus);
    
    // 验证状态
    const validation = await projectStatusChecker.validateProjectStatus({
        requireProject: true,
        requireActiveComposition: true,
        showWarning: false
    });
    console.log('✅ 状态验证结果:', validation);
}

// 运行调试
debugStatusCheck();
```

#### 性能分析
```javascript
// 分析状态获取性能
async function analyzeStatusPerformance() {
    const iterations = 10;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const status = await projectStatusChecker.getProjectStatus();
        const endTime = performance.now();
        
        times.push(endTime - startTime);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log('⏱️ 状态获取性能分析:', {
        平均时间: avgTime.toFixed(2) + 'ms',
        最短时间: minTime.toFixed(2) + 'ms',
        最长时间: maxTime.toFixed(2) + 'ms',
        测试次数: iterations,
        缓存效果: '首次可能较慢，后续由于缓存会更快'
    });
    
    // 分析内存使用
    if (performance.memory) {
        console.log('🧠 内存使用:', {
            used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
            total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`,
            limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        });
    }
}

// 运行性能分析
analyzeStatusPerformance();
```

## 扩展性

### 自定义扩展

#### 扩展状态检查功能
```javascript
// 创建自定义项目状态检查器
class CustomProjectStatusChecker extends ProjectStatusChecker {
    constructor(aeExtension) {
        super(aeExtension);
        
        // 添加自定义状态属性
        this.customStatus = {
            renderQueueStatus: 'idle', // 渲染队列状态
            memoryUsage: null, // 内存使用情况
            gpuStatus: 'available' // GPU状态
        };
    }
    
    /**
     * 检查渲染队列状态
     * @returns {Promise<Object>} 渲染队列状态
     */
    async checkRenderQueueStatus() {
        try {
            this.log('🔍 检查渲染队列状态...', 'debug');
            
            // 检查是否为Demo模式
            if (window.__DEMO_MODE_ACTIVE__) {
                this.log('🎭 Demo模式：虚拟渲染队列状态检查', 'debug');
                
                // 模拟渲染队列状态
                return {
                    success: true,
                    status: 'idle',
                    itemCount: 0,
                    isRendering: false
                };
            }
            
            // CEP模式：使用ExtendScript检查渲染队列状态
            const result = await this.aeExtension.executeExtendScript('checkRenderQueueStatus');
            
            if (result && result.success) {
                this.log(`✅ 渲染队列状态检查完成: ${result.status}`, 'debug');
                this.customStatus.renderQueueStatus = result.status;
                return result;
            } else {
                const errorMsg = result && result.error ? result.error : '未知错误';
                this.log(`❌ 渲染队列状态检查失败: ${errorMsg}`, 'error');
                return {
                    success: false,
                    error: errorMsg
                };
            }
            
        } catch (error) {
            this.log(`💥 渲染队列状态检查异常: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 检查内存使用情况
     * @returns {Promise<Object>} 内存使用情况
     */
    async checkMemoryUsage() {
        try {
            this.log('🔍 检查内存使用情况...', 'debug');
            
            // 检查是否为Demo模式
            if (window.__DEMO_MODE_ACTIVE__) {
                this.log('🎭 Demo模式：虚拟内存使用检查', 'debug');
                
                // 模拟内存使用情况
                return {
                    success: true,
                    used: 1024 * 1024 * 1024, // 1GB
                    total: 16 * 1024 * 1024 * 1024, // 16GB
                    available: 15 * 1024 * 1024 * 1024 // 15GB
                };
            }
            
            // CEP模式：使用ExtendScript检查内存使用
            const result = await this.aeExtension.executeExtendScript('checkMemoryUsage');
            
            if (result && result.success) {
                this.log('✅ 内存使用情况检查完成', 'debug');
                this.customStatus.memoryUsage = result;
                return result;
            } else {
                const errorMsg = result && result.error ? result.error : '未知错误';
                this.log(`❌ 内存使用情况检查失败: ${errorMsg}`, 'error');
                return {
                    success: false,
                    error: errorMsg
                };
            }
            
        } catch (error) {
            this.log(`💥 内存使用情况检查异常: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 获取增强的状态信息
     * @param {boolean} forceRefresh - 是否强制刷新
     * @returns {Promise<Object>} 增强的状态信息
     */
    async getEnhancedStatus(forceRefresh = false) {
        try {
            // 获取基础状态
            const basicStatus = await this.getProjectStatus(forceRefresh);
            
            // 获取自定义状态
            const [renderQueueStatus, memoryUsage] = await Promise.all([
                this.checkRenderQueueStatus(),
                this.checkMemoryUsage()
            ]);
            
            // 合并状态信息
            return {
                ...basicStatus,
                renderQueueStatus: renderQueueStatus,
                memoryUsage: memoryUsage,
                gpuStatus: this.customStatus.gpuStatus
            };
            
        } catch (error) {
            this.log(`获取增强状态信息异常: ${error.message}`, 'error');
            return await this.getProjectStatus(forceRefresh);
        }
    }
}

// 使用自定义项目状态检查器
const customStatusChecker = new CustomProjectStatusChecker(aeExtension);

// 获取增强状态信息
const enhancedStatus = await customStatusChecker.getEnhancedStatus();
console.log('增强状态信息:', enhancedStatus);
```

#### 插件化架构
```javascript
// 创建项目状态检查插件
class ProjectStatusPlugin {
    constructor(projectStatusChecker) {
        this.projectStatusChecker = projectStatusChecker;
        this.pluginData = new Map();
        this.init();
    }
    
    init() {
        // 注册插件特定的事件监听器
        this.projectStatusChecker.addStatusChangeListener((event) => {
            this.onStatusChange(event);
        });
        
        this.projectStatusChecker.addValidationPassedListener((event) => {
            this.onValidationPassed(event);
        });
        
        // 添加插件特定的验证规则
        this.projectStatusChecker.addValidator('plugin.customCheck', (status) => {
            // 自定义验证逻辑
            return { valid: true };
        });
        
        // 添加插件特定的状态处理器
        this.bindPluginHandlers();
    }
    
    /**
     * 绑定插件处理器
     */
    bindPluginHandlers() {
        // 监听项目状态变更
        document.addEventListener('projectStatusChanged', (event) => {
            this.handleStatusChange(event);
        });
        
        // 监听状态验证通过
        document.addEventListener('projectStatusValidationPassed', (event) => {
            this.handleValidationPassed(event);
        });
    }
    
    /**
     * 处理状态变更事件
     * @param {CustomEvent} event - 状态变更事件
     */
    handleStatusChange(event) {
        const { oldStatus, newStatus, timestamp } = event.detail;
        
        // 插件特定的状态变更处理逻辑
        this.logPluginEvent('Status change', { oldStatus, newStatus, timestamp });
        
        // 根据状态变更执行特定操作
        this.onStatusChange({ oldStatus, newStatus, timestamp });
    }
    
    /**
     * 处理验证通过事件
     * @param {CustomEvent} event - 验证通过事件
     */
    handleValidationPassed(event) {
        const { status, timestamp } = event.detail;
        
        // 插件特定的验证通过处理逻辑
        this.logPluginEvent('Validation passed', { status, timestamp });
        
        // 根据验证通过执行特定操作
        this.onValidationPassed({ status, timestamp });
    }
    
    /**
     * 状态变更时的处理逻辑
     * @param {Object} event - 状态变更事件数据
     */
    onStatusChange(event) {
        const { oldStatus, newStatus } = event;
        
        // 插件特定的处理逻辑
        console.log('🔌 项目状态插件: 状态已变更');
        
        // 例如：根据状态变更执行特定操作
        if (!oldStatus.projectExists && newStatus.projectExists) {
            console.log('🔌 项目状态插件: 项目已打开');
            this.onProjectOpened(newStatus);
        }
        
        if (oldStatus.projectExists && !newStatus.projectExists) {
            console.log('🔌 项目状态插件: 项目已关闭');
            this.onProjectClosed();
        }
    }
    
    /**
     * 验证通过时的处理逻辑
     * @param {Object} event - 验证通过事件数据
     */
    onValidationPassed(event) {
        const { status } = event;
        
        // 插件特定的处理逻辑
        console.log('🔌 项目状态插件: 状态验证通过');
        
        // 例如：在状态验证通过后执行特定操作
        this.onValidationSuccess(status);
    }
    
    /**
     * 项目打开时的处理
     * @param {Object} status - 项目状态
     */
    onProjectOpened(status) {
        // 项目打开时的插件特定逻辑
        console.log(`🔌 项目状态插件: 项目 ${status.projectName} 已打开`);
        
        // 可以在这里执行项目打开后的初始化操作
        this.initializeProjectData(status);
    }
    
    /**
     * 项目关闭时的处理
     */
    onProjectClosed() {
        // 项目关闭时的插件特定逻辑
        console.log('🔌 项目状态插件: 项目已关闭');
        
        // 可以在这里执行项目关闭后的清理操作
        this.cleanupProjectData();
    }
    
    /**
     * 验证成功时的处理
     * @param {Object} status - 项目状态
     */
    onValidationSuccess(status) {
        // 验证成功时的插件特定逻辑
        console.log('🔌 项目状态插件: 状态验证成功');
        
        // 可以在这里执行验证成功后的操作
        this.onValidationSuccessActions(status);
    }
    
    /**
     * 项目数据初始化
     * @param {Object} status - 项目状态
     */
    initializeProjectData(status) {
        // 初始化插件特定的项目数据
        this.pluginData.set('currentProject', status.projectName);
        this.pluginData.set('openTime', Date.now());
        
        console.log('🔌 项目状态插件: 项目数据已初始化');
    }
    
    /**
     * 项目数据清理
     */
    cleanupProjectData() {
        // 清理插件特定的项目数据
        this.pluginData.clear();
        
        console.log('🔌 项目状态插件: 项目数据已清理');
    }
    
    /**
     * 验证成功后执行的操作
     * @param {Object} status - 项目状态
     */
    onValidationSuccessActions(status) {
        // 验证成功后执行的插件特定操作
        console.log('🔌 项目状态插件: 验证成功后操作');
        
        // 例如：更新插件UI、同步数据等
        this.updatePluginUI(status);
        this.syncPluginData(status);
    }
    
    /**
     * 更新插件UI
     * @param {Object} status - 项目状态
     */
    updatePluginUI(status) {
        // 更新插件特定的UI元素
        const pluginUI = document.getElementById('plugin-status-ui');
        if (pluginUI) {
            pluginUI.innerHTML = `
                <div>Plugin Status: Active</div>
                <div>Project: ${status.projectName || 'None'}</div>
                <div>Comp: ${status.activeCompName || 'None'}</div>
            `;
        }
    }
    
    /**
     * 同步插件数据
     * @param {Object} status - 项目状态
     */
    syncPluginData(status) {
        // 同步插件特定的数据到外部服务
        console.log('🔌 项目状态插件: 同步插件数据');
        
        // 例如：将状态信息发送到云端服务
        this.sendStatusToCloud(status);
    }
    
    /**
     * 将状态发送到云端
     * @param {Object} status - 项目状态
     */
    async sendStatusToCloud(status) {
        try {
            const syncData = {
                status: status,
                timestamp: Date.now(),
                userId: this.getUserId(),
                pluginVersion: '1.0.0'
            };
            
            // 发送状态到云端服务
            const response = await fetch('/api/project-status/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(syncData)
            });
            
            if (response.ok) {
                console.log('云端状态同步成功');
            } else {
                console.error('云端状态同步失败:', response.statusText);
            }
        } catch (error) {
            console.error('云端状态同步异常:', error.message);
        }
    }
    
    /**
     * 获取用户ID
     * @returns {string} 用户ID
     */
    getUserId() {
        try {
            return localStorage.getItem('userId') || 'anonymous';
        } catch (error) {
            return 'anonymous';
        }
    }
    
    /**
     * 记录插件事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     */
    logPluginEvent(eventType, data) {
        console.log(`🔌 项目状态插件事件: ${eventType}`, data);
        
        // 可以在这里添加更详细的事件记录逻辑
        // 例如：记录到本地日志、发送到监控服务等
    }
}

// 应用插件
const plugin = new ProjectStatusPlugin(projectStatusChecker);