/**
 * Eagle2Ae - 项目状态检测服务
 * 负责检测After Effects项目状态，包括项目是否打开、合成是否可用等
 * 
 * @author Eagle2Ae Team
 * @date 2024-01-01
 * @version 1.0.0
 */

class ProjectStatusChecker {
    constructor(csInterface, logger) {
        this.csInterface = csInterface;
        this.logger = logger;
        this.lastProjectStatus = null; // 缓存最后的项目状态
        this.statusCheckInterval = null; // 状态检查定时器
    }

    /**
     * 检查After Effects项目是否已打开
     * @returns {Promise<Object>} 项目状态检查结果
     */
    async checkProjectStatus() {
        return new Promise((resolve) => {
            const scriptCall = `
                (function() {
                    try {
                        var project = app.project;
                        
                        // 检查项目是否存在
                        if (!project) {
                            return JSON.stringify({
                                success: false,
                                hasProject: false,
                                error: "无法访问After Effects项目"
                            });
                        }
                        
                        // 检查是否是真正的项目（不是默认空项目）
                        // 如果项目没有任何项目项，且没有保存过，则认为没有真正的项目
                        var hasRealProject = false;
                        try {
                            // 检查项目是否有文件路径（已保存）或者有项目项
                            if (project.file || project.items.length > 0) {
                                hasRealProject = true;
                            }
                        } catch (e) {
                            // 如果访问出错，认为没有项目
                            hasRealProject = false;
                        }
                        
                        if (!hasRealProject) {
                            return JSON.stringify({
                                success: false,
                                hasProject: false,
                                error: "没有打开After Effects项目"
                            });
                        }
                        
                        // 检查项目是否已保存（有文件路径）
                        var projectPath = null;
                        var hasUnsavedChanges = false;
                        
                        try {
                            projectPath = project.file ? project.file.fsName : null;
                            hasUnsavedChanges = project.dirty;
                        } catch (e) {
                            // 项目可能未保存，这是正常情况
                        }
                        
                        // 检查项目中是否有合成
                        var compositions = [];
                        var activeComp = null;
                        
                        try {
                            for (var i = 1; i <= project.items.length; i++) {
                                var item = project.items[i];
                                if (item instanceof CompItem) {
                                    compositions.push({
                                        name: item.name,
                                        duration: item.duration,
                                        width: item.width,
                                        height: item.height
                                    });
                                }
                            }
                            
                            // 检查活动合成
                            if (project.activeItem && project.activeItem instanceof CompItem) {
                                activeComp = {
                                    name: project.activeItem.name,
                                    duration: project.activeItem.duration,
                                    width: project.activeItem.width,
                                    height: project.activeItem.height
                                };
                            }
                        } catch (e) {
                            // 合成访问出错
                        }
                        
                        return JSON.stringify({
                            success: true,
                            hasProject: true,
                            projectPath: projectPath,
                            hasUnsavedChanges: hasUnsavedChanges,
                            compositions: compositions,
                            activeComposition: activeComp,
                            compositionCount: compositions.length
                        });
                        
                    } catch (error) {
                        return JSON.stringify({
                            success: false,
                            hasProject: false,
                            error: "检查项目状态时出错: " + error.toString()
                        });
                    }
                })();
            `;

            this.csInterface.evalScript(scriptCall, (result) => {
                try {
                    const parsedResult = JSON.parse(result);
                    this.lastProjectStatus = parsedResult;
                    resolve(parsedResult);
                } catch (error) {
                    const errorResult = {
                        success: false,
                        hasProject: false,
                        error: `解析项目状态检查结果失败: ${result}`
                    };
                    this.lastProjectStatus = errorResult;
                    resolve(errorResult);
                }
            });
        });
    }

    /**
     * 检查是否有活动合成
     * @returns {Promise<Object>} 合成状态检查结果
     */
    async checkActiveComposition() {
        return new Promise((resolve) => {
            const scriptCall = `
                (function() {
                    try {
                        var project = app.project;
                        if (!project) {
                            return JSON.stringify({
                                success: false,
                                hasActiveComposition: false,
                                error: "无法访问After Effects项目"
                            });
                        }
                        
                        if (!project.activeItem || !(project.activeItem instanceof CompItem)) {
                            return JSON.stringify({
                                success: true,
                                hasActiveComposition: false,
                                error: "没有活动合成，请先选择合成"
                            });
                        }
                        
                        return JSON.stringify({
                            success: true,
                            hasActiveComposition: true,
                            compositionName: project.activeItem.name,
                            compositionDuration: project.activeItem.duration,
                            compositionSize: {
                                width: project.activeItem.width,
                                height: project.activeItem.height
                            }
                        });
                        
                    } catch (error) {
                        return JSON.stringify({
                            success: false,
                            hasActiveComposition: false,
                            error: "检查合成状态时出错: " + error.toString()
                        });
                    }
                })();
            `;

            this.csInterface.evalScript(scriptCall, (result) => {
                try {
                    const parsedResult = JSON.parse(result);
                    resolve(parsedResult);
                } catch (error) {
                    resolve({
                        success: false,
                        hasActiveComposition: false,
                        error: `解析合成检查结果失败: ${result}`
                    });
                }
            });
        });
    }

    /**
     * 显示项目状态警告弹窗
     * @param {string} title 弹窗标题
     * @param {string} message 警告消息
     */
    showProjectStatusWarning(title = "项目状态警告", message = "请先打开After Effects项目") {
        try {
            // 正确转义字符串中的特殊字符，避免"未终止的字符串常数"错误
            const escapedTitle = title.replace(/"/g, '\\"').replace(/\n/g, '\\n');
            const escapedMessage = message.replace(/"/g, '\\"').replace(/\n/g, '\\n');
            
            // 使用现有的showPanelWarningDialog函数保持UI一致性
            const showDialogScript = `showPanelWarningDialog("${escapedTitle}", "${escapedMessage}");`;
            this.csInterface.evalScript(showDialogScript);
            
            // 同时在控制台记录日志
            if (this.logger) {
                this.logger(`[项目状态检查] ${title}: ${message}`, 'warning');
            }
        } catch (error) {
            console.error('[ProjectStatusChecker] 显示警告弹窗失败:', error);
            // 降级处理：使用浏览器alert
            alert(`${title}\n\n${message}`);
        }
    }

    /**
     * 检查项目状态并在必要时显示警告
     * @param {Object} options 检查选项
     * @param {boolean} options.requireProject 是否需要项目已打开
     * @param {boolean} options.requireActiveComposition 是否需要活动合成
     * @param {boolean} options.showWarning 检查失败时是否显示警告弹窗
     * @returns {Promise<boolean>} 检查是否通过
     */
    async validateProjectStatus(options = {}) {
        const {
            requireProject = true,
            requireActiveComposition = false,
            showWarning = true
        } = options;

        try {
            // 优先检查项目状态 - 这是最基础的要求
            if (requireProject) {
                const projectStatus = await this.checkProjectStatus();
                
                if (!projectStatus.success || !projectStatus.hasProject) {
                    if (showWarning) {
                        this.showProjectStatusWarning(
                            "请先打开项目",
                            "请先打开项目后操作"
                        );
                    }
                    return false;
                }
                
                // 项目检查通过后，再检查合成状态（如果需要）
                if (requireActiveComposition) {
                    const compositionStatus = await this.checkActiveComposition();
                    
                    if (!compositionStatus.success || !compositionStatus.hasActiveComposition) {
                        if (showWarning) {
                            this.showProjectStatusWarning(
                                "请选择合成",
                                "请选择合成后操作"
                            );
                        }
                        return false;
                    }
                }
            } else if (requireActiveComposition) {
                // 如果不要求项目但要求合成，直接检查合成
                const compositionStatus = await this.checkActiveComposition();
                
                if (!compositionStatus.success || !compositionStatus.hasActiveComposition) {
                    if (showWarning) {
                        this.showProjectStatusWarning(
                            "请选择合成",
                            "请选择合成后操作"
                        );
                    }
                    return false;
                }
            }

            return true;
            
        } catch (error) {
            console.error('[ProjectStatusChecker] 项目状态验证失败:', error);
            
            if (showWarning) {
                this.showProjectStatusWarning(
                    "状态检查失败",
                    "请确保After Effects正在运行并重试"
                );
            }
            
            return false;
        }
    }

    /**
     * 获取最后缓存的项目状态
     * @returns {Object|null} 最后的项目状态
     */
    getLastProjectStatus() {
        return this.lastProjectStatus;
    }

    /**
     * 启动项目状态监控
     * @param {number} interval 监控间隔（毫秒），默认30秒
     */
    startStatusMonitoring(interval = 30000) {
        if (this.statusCheckInterval) {
            this.stopStatusMonitoring();
        }

        this.statusCheckInterval = setInterval(async () => {
            try {
                await this.checkProjectStatus();
            } catch (error) {
                console.error('[ProjectStatusChecker] 定期状态检查失败:', error);
            }
        }, interval);

        console.log(`[ProjectStatusChecker] 已启动项目状态监控，间隔: ${interval}ms`);
    }

    /**
     * 停止项目状态监控
     */
    stopStatusMonitoring() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
            console.log('[ProjectStatusChecker] 已停止项目状态监控');
        }
    }

    /**
     * 销毁实例，清理资源
     */
    destroy() {
        this.stopStatusMonitoring();
        this.lastProjectStatus = null;
        this.csInterface = null;
        this.logger = null;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectStatusChecker;
} else {
    window.ProjectStatusChecker = ProjectStatusChecker;
}