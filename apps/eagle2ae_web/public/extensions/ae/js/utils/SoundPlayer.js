// 音效播放器类
// 用于播放连接成功和断开连接的音效

class SoundPlayer {
    constructor() {
        this.soundsPath = this.getSoundsPath();
        this.sounds = {
            linked: 'linked.wav',
            stop: 'stop.wav',
            eagle: 'eagle.wav'
        };
        
        // 预加载音效文件
        this.preloadSounds();
    }

    // 获取音效文件路径
    getSoundsPath() {
        try {
            // 获取扩展根目录
            const extensionPath = this.getExtensionPath();
            return extensionPath + '/public/sound/';
        } catch (error) {
            console.warn('获取音效路径失败:', error);
            return './public/sound/';
        }
    }

    // 获取扩展路径
    getExtensionPath() {
        try {
            // 在CEP环境中获取扩展路径
            if (typeof window !== 'undefined' && window.__adobe_cep__) {
                const csInterface = new CSInterface();
                return csInterface.getSystemPath(SystemPath.EXTENSION);
            }
            
            // 备用方法：通过当前脚本路径推断
            const currentScript = document.currentScript || document.querySelector('script[src*="main.js"]');
            if (currentScript && currentScript.src) {
                const scriptPath = currentScript.src;
                const extensionPath = scriptPath.substring(0, scriptPath.lastIndexOf('/js/'));
                return extensionPath;
            }
            
            return '.';
        } catch (error) {
            console.warn('获取扩展路径失败:', error);
            return '.';
        }
    }

    // 预加载音效文件
    preloadSounds() {
        try {
            this.audioElements = {};
            
            for (const [key, filename] of Object.entries(this.sounds)) {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.volume = 0.6; // 设置音量为60%
                audio.src = this.soundsPath + filename;
                
                // 添加错误处理
                audio.addEventListener('error', (e) => {
                    console.warn(`音效文件加载失败: ${filename}`, e);
                });
                
                audio.addEventListener('canplaythrough', () => {
                    console.log(`音效文件已预加载: ${filename}`);
                });
                
                this.audioElements[key] = audio;
            }
            
            console.debug('音效播放器初始化完成');
        } catch (error) {
            console.warn('预加载音效失败:', error);
        }
    }

    // 播放连接成功音效
    playLinkedSound() {
        this.playSound('linked', '🔗 播放连接成功音效');
    }

    // 播放断开连接音效
    playStopSound() {
        this.playSound('stop', '🔌 播放断开连接音效');
    }

    // 播放Eagle导入音效
    playEagleSound() {
        this.playSound('eagle', '🦅 播放Eagle导入音效');
    }

    // 播放指定音效
    playSound(soundKey, logMessage = '') {
        try {
            if (!this.audioElements || !this.audioElements[soundKey]) {
                console.warn(`音效不存在: ${soundKey}`);
                return;
            }

            const audio = this.audioElements[soundKey];
            
            // 重置播放位置
            audio.currentTime = 0;
            
            // 播放音效
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        if (logMessage) {
                            console.log(logMessage);
                        }
                    })
                    .catch((error) => {
                        console.warn(`播放音效失败 (${soundKey}):`, error);
                    });
            }
            
        } catch (error) {
            console.warn(`播放音效出错 (${soundKey}):`, error);
        }
    }

    // 设置音量 (0.0 - 1.0)
    setVolume(volume) {
        try {
            const clampedVolume = Math.max(0, Math.min(1, volume));
            
            if (this.audioElements) {
                for (const audio of Object.values(this.audioElements)) {
                    audio.volume = clampedVolume;
                }
            }
            
            console.log(`音效音量已设置为: ${Math.round(clampedVolume * 100)}%`);
        } catch (error) {
            console.warn('设置音量失败:', error);
        }
    }

    // 测试音效播放
    testSounds() {
        console.log('🎵 测试音效播放...');

        setTimeout(() => {
            this.playLinkedSound();
        }, 500);

        setTimeout(() => {
            this.playStopSound();
        }, 2000);

        setTimeout(() => {
            this.playEagleSound();
        }, 3500);
    }

    // 检查音效文件是否存在
    checkSoundFiles() {
        const results = {};
        
        for (const [key, filename] of Object.entries(this.sounds)) {
            const audio = this.audioElements[key];
            results[key] = {
                filename: filename,
                path: this.soundsPath + filename,
                loaded: audio && audio.readyState >= 2, // HAVE_CURRENT_DATA
                error: audio && audio.error
            };
        }
        
        return results;
    }
}
