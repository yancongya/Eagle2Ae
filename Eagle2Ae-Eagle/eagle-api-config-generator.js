// Eagle2Ae Eagle API配置生成器
// 使用Eagle API获取真实的Eagle信息并生成配置文件

const fs = require('fs');
const path = require('path');
const os = require('os');

class EagleAPIConfigGenerator {
    constructor() {
        this.documentsPath = path.join(os.homedir(), 'Documents');
        this.configFolderPath = path.join(this.documentsPath, 'Eagle2Ae');
        this.configFilePath = path.join(this.configFolderPath, 'config.json');
    }

    log(message, level = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const levelColors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            warning: '\x1b[33m',
            error: '\x1b[31m',
            reset: '\x1b[0m'
        };
        
        const color = levelColors[level] || levelColors.info;
        console.log(`${color}[${timestamp}] ${message}${levelColors.reset}`);
    }

    // 检查Eagle环境
    checkEagleEnvironment() {
        this.log('🔍 检查Eagle环境...', 'info');
        
        if (typeof eagle === 'undefined') {
            this.log('❌ Eagle环境未检测到', 'error');
            this.log('请在Eagle插件环境中运行此脚本', 'warning');
            return false;
        }
        
        this.log('✅ Eagle环境检测成功', 'success');
        return true;
    }

    // 获取Eagle版本信息
    getEagleVersionInfo() {
        try {
            const version = eagle.app.version || '未知';
            const build = eagle.app.build || '未知';
            const pid = eagle.app.pid || '未知';
            const execPath = eagle.app.execPath || '未知';
            
            const versionInfo = {
                version: `${version} build ${build} pid ${pid}`,
                execPath: execPath,
                rawVersion: version,
                build: build,
                pid: pid
            };
            
            this.log(`Eagle版本: ${versionInfo.version}`, 'info');
            this.log(`安装路径: ${versionInfo.execPath}`, 'info');
            
            return versionInfo;
            
        } catch (error) {
            this.log(`获取Eagle版本信息失败: ${error.message}`, 'error');
            return {
                version: '获取失败',
                execPath: '获取失败',
                rawVersion: '未知',
                build: '未知',
                pid: '未知'
            };
        }
    }

    // 获取Eagle库信息
    async getEagleLibraryInfo() {
        try {
            this.log('📚 获取Eagle素材库信息...', 'info');
            
            let libraryName = '未知';
            let libraryPath = '未知';
            let librarySize = 0;
            let modificationTime = null;
            
            // 方法1: 直接访问属性
            if (typeof eagle.library !== 'undefined' && eagle.library) {
                this.log('使用直接访问方法获取库信息...', 'info');
                
                let rawName = eagle.library.name || '未知';
                libraryPath = eagle.library.path || '未知';
                
                // 确保显示完整的.library扩展名
                if (rawName !== '未知' && !rawName.endsWith('.library')) {
                    libraryName = rawName + '.library';
                } else {
                    libraryName = rawName;
                }
                
                this.log(`库名称: ${libraryName}`, 'info');
                this.log(`库路径: ${libraryPath}`, 'info');
            }
            
            // 方法2: 如果直接访问失败，尝试使用info()方法
            if (libraryName === '未知' && typeof eagle.library.info === 'function') {
                this.log('使用library.info()方法获取库信息...', 'info');
                
                try {
                    const libraryInfo = await eagle.library.info();
                    
                    if (libraryInfo) {
                        let rawName = libraryInfo.name || '未知';
                        libraryPath = libraryInfo.path || '未知';
                        
                        // 确保显示完整的.library扩展名
                        if (rawName !== '未知' && !rawName.endsWith('.library')) {
                            libraryName = rawName + '.library';
                        } else {
                            libraryName = rawName;
                        }
                        
                        this.log(`库名称: ${libraryName}`, 'info');
                        this.log(`库路径: ${libraryPath}`, 'info');
                    }
                } catch (infoError) {
                    this.log(`library.info()调用失败: ${infoError.message}`, 'warning');
                }
            }
            
            // 如果获取到了有效的库路径，计算大小
            if (libraryPath !== '未知' && fs.existsSync(libraryPath)) {
                this.log('开始计算素材库大小...', 'info');
                librarySize = this.calculateDirectorySize(libraryPath);
                
                const stats = fs.statSync(libraryPath);
                modificationTime = stats.mtime.getTime();
                
                this.log(`库大小: ${this.formatSize(librarySize)}`, 'success');
            } else {
                this.log('库路径无效，跳过大小计算', 'warning');
            }
            
            return {
                name: libraryName,
                path: libraryPath !== '未知' ? libraryPath : null,
                size: librarySize,
                modificationTime: modificationTime,
                lastCalculated: Date.now(),
                cacheValid: librarySize > 0
            };
            
        } catch (error) {
            this.log(`获取Eagle库信息失败: ${error.message}`, 'error');
            return {
                name: 'Eagle Library',
                path: null,
                size: 0,
                modificationTime: null,
                lastCalculated: null,
                cacheValid: false
            };
        }
    }

    // 获取Eagle当前文件夹信息
    getEagleCurrentFolder() {
        try {
            if (typeof eagle.folder !== 'undefined' && eagle.folder) {
                const currentFolder = eagle.folder.current || null;
                const folderName = currentFolder ? (currentFolder.name || '根目录') : '未知';
                const folderPath = currentFolder ? (currentFolder.path || '未知') : '未知';
                
                this.log(`当前文件夹: ${folderName}`, 'info');
                this.log(`文件夹路径: ${folderPath}`, 'info');
                
                return {
                    current: currentFolder,
                    name: folderName,
                    path: folderPath
                };
            }
            
            return {
                current: null,
                name: '未知',
                path: '未知'
            };
            
        } catch (error) {
            this.log(`获取当前文件夹信息失败: ${error.message}`, 'warning');
            return {
                current: null,
                name: '未知',
                path: '未知'
            };
        }
    }

    // 计算目录大小
    calculateDirectorySize(dirPath) {
        let totalSize = 0;
        let fileCount = 0;
        
        try {
            const calculateSize = (currentPath) => {
                const items = fs.readdirSync(currentPath);
                
                for (const item of items) {
                    try {
                        const itemPath = path.join(currentPath, item);
                        const stats = fs.statSync(itemPath);
                        
                        if (stats.isDirectory()) {
                            totalSize += calculateSize(itemPath);
                        } else {
                            totalSize += stats.size;
                            fileCount++;
                            
                            // 每1000个文件显示一次进度
                            if (fileCount % 1000 === 0) {
                                process.stdout.write(`\r扫描进度: ${fileCount} 个文件, ${this.formatSize(totalSize)}`);
                            }
                        }
                    } catch (error) {
                        // 跳过无法访问的文件
                        continue;
                    }
                }
                
                return totalSize;
            };
            
            totalSize = calculateSize(dirPath);
            if (fileCount >= 1000) {
                console.log(''); // 换行
            }
            this.log(`扫描完成: ${fileCount} 个文件`, 'info');
            
        } catch (error) {
            this.log(`计算目录大小失败: ${error.message}`, 'error');
            return 0;
        }
        
        return totalSize;
    }

    // 生成基于Eagle API的真实配置
    async generateEagleAPIConfig() {
        try {
            this.log('🚀 开始生成基于Eagle API的真实配置...', 'info');
            this.log('='.repeat(50), 'info');
            
            // 检查Eagle环境
            if (!this.checkEagleEnvironment()) {
                throw new Error('Eagle环境不可用');
            }
            
            // 创建配置文件夹
            if (!fs.existsSync(this.configFolderPath)) {
                fs.mkdirSync(this.configFolderPath, { recursive: true });
                this.log(`创建配置文件夹: ${this.configFolderPath}`, 'success');
            }
            
            // 获取Eagle版本信息
            const versionInfo = this.getEagleVersionInfo();
            
            // 获取Eagle库信息
            const libraryInfo = await this.getEagleLibraryInfo();
            
            // 获取当前文件夹信息
            const folderInfo = this.getEagleCurrentFolder();
            
            // 获取系统信息
            const systemInfo = {
                platform: os.platform(),
                arch: os.arch(),
                nodeVersion: process.version,
                hostname: os.hostname(),
                username: os.userInfo().username,
                totalMemory: os.totalmem(),
                freeMemory: os.freemem()
            };
            
            // 生成完整配置
            const config = {
                version: '1.0',
                timestamp: Date.now(),
                communication: {
                    port: 8080,
                    lastUpdate: Date.now(),
                    protocol: 'http'
                },
                library: libraryInfo,
                importSettings: {
                    mode: 'project_adjacent',
                    projectAdjacentFolder: 'Eagle_Assets',
                    addToComposition: true,
                    timelineOptions: {
                        enabled: true,
                        placement: 'current_time',
                        sequenceInterval: 1.0
                    },
                    fileManagement: {
                        keepOriginalName: true,
                        addTimestamp: false,
                        createTagFolders: false,
                        deleteFromEagle: false
                    }
                },
                preferences: {
                    autoStartService: true,
                    enableNotifications: true,
                    logLevel: 'info'
                },
                eagleInfo: {
                    version: versionInfo.version,
                    execPath: versionInfo.execPath,
                    rawVersion: versionInfo.rawVersion,
                    build: versionInfo.build,
                    pid: versionInfo.pid,
                    currentFolder: folderInfo
                },
                systemInfo: {
                    ...systemInfo,
                    generatedAt: new Date().toISOString(),
                    configType: 'eagle-api',
                    eagleEnvironment: true
                },
                cacheStats: {
                    hitCount: 0,
                    missCount: 0,
                    hitRate: 0,
                    lastCalculationDuration: 0,
                    totalCalculations: 0
                }
            };
            
            // 保存配置文件
            fs.writeFileSync(this.configFilePath, JSON.stringify(config, null, 2), 'utf8');
            
            this.log('='.repeat(50), 'info');
            this.log('✅ 基于Eagle API的真实配置文件生成成功！', 'success');
            this.log(`📁 配置文件路径: ${this.configFilePath}`, 'success');
            
            // 显示配置摘要
            this.displayConfigSummary(config);
            
            return config;
            
        } catch (error) {
            this.log(`❌ 生成配置失败: ${error.message}`, 'error');
            throw error;
        }
    }

    // 显示配置摘要
    displayConfigSummary(config) {
        this.log('', 'info');
        this.log('📋 Eagle API配置摘要:', 'info');
        this.log('='.repeat(30), 'info');
        this.log(`🔧 版本: ${config.version}`, 'info');
        this.log(`🌐 端口: ${config.communication.port}`, 'info');
        this.log(`🦅 Eagle版本: ${config.eagleInfo.rawVersion}`, 'info');
        this.log(`📁 Eagle路径: ${config.eagleInfo.execPath}`, 'info');
        this.log(`📚 素材库: ${config.library.name}`, 'info');
        this.log(`📂 库路径: ${config.library.path || '未设置'}`, 'info');
        this.log(`📊 库大小: ${this.formatSize(config.library.size)}`, 'info');
        this.log(`📁 当前文件夹: ${config.eagleInfo.currentFolder.name}`, 'info');
        this.log(`💻 系统: ${config.systemInfo.platform} ${config.systemInfo.arch}`, 'info');
        this.log(`👤 用户: ${config.systemInfo.username}@${config.systemInfo.hostname}`, 'info');
        this.log(`🕒 生成时间: ${config.systemInfo.generatedAt}`, 'info');
    }

    // 格式化文件大小
    formatSize(bytes) {
        if (bytes === 0) return '0B';
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + 'GB';
    }
}

// 运行Eagle API配置生成
async function generateEagleAPIConfig() {
    const generator = new EagleAPIConfigGenerator();
    
    try {
        const config = await generator.generateEagleAPIConfig();
        
        console.log('\n🎯 下一步建议:');
        console.log('1. 使用 node view-config.js 查看详细配置');
        console.log('2. 运行第二阶段缓存测试');
        console.log('3. 在AE扩展中验证配置加载');
        console.log(`4. 配置文件路径: ${generator.configFilePath}`);
        
        return config;
        
    } catch (error) {
        console.error('生成Eagle API配置失败:', error);
        return null;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    generateEagleAPIConfig();
}

module.exports = { EagleAPIConfigGenerator, generateEagleAPIConfig };
