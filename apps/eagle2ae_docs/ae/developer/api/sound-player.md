# 音效播放器 API

## 概述

音效播放器（SoundPlayer）是 Eagle2Ae AE 扩展的一个实用工具类，负责播放连接成功、断开连接和其他操作相关的音效。该播放器提供了预加载、音量控制、测试播放等功能，为用户提供更好的听觉反馈。

## 核心特性

### 音效预加载
- 自动预加载所有音效文件
- 支持音效文件错误处理
- 提供音效文件加载状态检查

### 音量控制
- 统一音量控制接口
- 支持0.0-1.0范围的音量设置
- 实时音量调整

### 多音效支持
- 连接成功音效
- 断开连接音效
- Eagle导入音效
- 自定义音效播放

## 技术实现

### 核心类结构

```javascript
/**
 * 音效播放器类
 * 用于播放连接成功和断开连接的音效
 */
class SoundPlayer {
    /**
     * 构造函数
     */
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
}
```

### 音效路径管理

```javascript
/**
 * 获取音效文件路径
 * @returns {string} 音效文件路径
 */
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

/**
 * 获取扩展路径
 * @returns {string} 扩展路径
 */
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
```

### 音效预加载

```javascript
/**
 * 预加载音效文件
 */
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
        
        console.log('音效播放器初始化完成');
    } catch (error) {
        console.warn('预加载音效失败:', error);
    }
}
```

### 音效播放实现

```javascript
/**
 * 播放连接成功音效
 */
playLinkedSound() {
    this.playSound('linked', '🔗 播放连接成功音效');
}

/**
 * 播放断开连接音效
 */
playStopSound() {
    this.playSound('stop', '🔌 播放断开连接音效');
}

/**
 * 播放Eagle导入音效
 */
playEagleSound() {
    this.playSound('eagle', '🦅 播放Eagle导入音效');
}

/**
 * 播放指定音效
 * @param {string} soundKey - 音效键名
 * @param {string} logMessage - 日志消息
 */
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
```

## API参考

### 构造函数

```javascript
/**
 * 音效播放器构造函数
 */
constructor()
```

### 核心方法

#### playLinkedSound()
播放连接成功音效

```javascript
/**
 * 播放连接成功音效
 */
playLinkedSound()
```

#### playStopSound()
播放断开连接音效

```javascript
/**
 * 播放断开连接音效
 */
playStopSound()
```

#### playEagleSound()
播放Eagle导入音效

```javascript
/**
 * 播放Eagle导入音效
 */
playEagleSound()
```

#### playSound()
播放指定音效

```javascript
/**
 * 播放指定音效
 * @param {string} soundKey - 音效键名
 * @param {string} logMessage - 日志消息
 */
playSound(soundKey, logMessage = '')
```

#### setVolume()
设置音量

```javascript
/**
 * 设置音量 (0.0 - 1.0)
 * @param {number} volume - 音量值
 */
setVolume(volume)
```

#### testSounds()
测试音效播放

```javascript
/**
 * 测试音效播放
 */
testSounds()
```

#### checkSoundFiles()
检查音效文件是否存在

```javascript
/**
 * 检查音效文件是否存在
 * @returns {Object} 音效文件检查结果
 */
checkSoundFiles()
```

## 使用示例

### 基本使用

```javascript
// 创建音效播放器实例
const soundPlayer = new SoundPlayer();

// 播放连接成功音效
soundPlayer.playLinkedSound();

// 播放断开连接音效
soundPlayer.playStopSound();

// 播放Eagle导入音效
soundPlayer.playEagleSound();
```

### 音量控制

```javascript
// 创建音效播放器实例
const soundPlayer = new SoundPlayer();

// 设置音量为30%
soundPlayer.setVolume(0.3);

// 播放音效（将以30%音量播放）
soundPlayer.playLinkedSound();

// 调整音量为80%
soundPlayer.setVolume(0.8);

// 播放音效（将以80%音量播放）
soundPlayer.playStopSound();
```

### 音效测试

```javascript
// 创建音效播放器实例
const soundPlayer = new SoundPlayer();

// 测试所有音效
soundPlayer.testSounds();

// 检查音效文件加载状态
const soundFiles = soundPlayer.checkSoundFiles();
console.log('音效文件状态:', soundFiles);
```

### 自定义音效播放

```javascript
// 创建音效播放器实例
const soundPlayer = new SoundPlayer();

// 直接播放指定音效
soundPlayer.playSound('linked', '播放自定义消息');

// 在特定事件中播放音效
function onConnectionSuccess() {
    soundPlayer.playLinkedSound();
    console.log('连接成功');
}

function onConnectionLost() {
    soundPlayer.playStopSound();
    console.log('连接断开');
}

function onEagleImport() {
    soundPlayer.playEagleSound();
    console.log('Eagle导入完成');
}
```

## 最佳实践

### 性能优化

1. **预加载音效**
   ```javascript
   // 在应用初始化时预加载音效
   const soundPlayer = new SoundPlayer(); // 自动预加载
   
   // 检查音效是否已加载
   const soundFiles = soundPlayer.checkSoundFiles();
   if (soundFiles.linked.loaded) {
       console.log('连接音效已就绪');
   }
   ```

2. **合理控制音量**
   ```javascript
   // 根据用户设置调整音量
   const userVolume = getUserPreference('soundVolume') || 0.6;
   soundPlayer.setVolume(userVolume);
   ```

3. **避免频繁播放**
   ```javascript
   // 使用防抖避免频繁播放相同音效
   let soundTimeout;
   function playSoundWithDebounce(soundPlayer, soundMethod) {
       if (soundTimeout) clearTimeout(soundTimeout);
       soundTimeout = setTimeout(() => {
           soundPlayer[soundMethod]();
       }, 100);
   }
   
   // 使用示例
   playSoundWithDebounce(soundPlayer, 'playLinkedSound');
   ```

### 错误处理

1. **音效文件缺失处理**
   ```javascript
   // 检查音效文件是否存在
   const soundFiles = soundPlayer.checkSoundFiles();
   
   // 为缺失的音效提供降级方案
   if (!soundFiles.linked.loaded) {
       console.log('连接音效文件缺失，使用系统提示音');
       // 使用系统提示音或其他替代方案
   }
   ```

2. **播放失败处理**
   ```javascript
   // 在播放音效时捕获错误
   try {
       soundPlayer.playLinkedSound();
   } catch (error) {
       console.warn('播放音效失败:', error);
       // 提供视觉反馈作为替代
       showVisualNotification('连接成功');
   }
   ```

### 内存管理

1. **及时清理资源**
   ```javascript
   // 在应用关闭时清理音频资源
   window.addEventListener('beforeunload', () => {
       if (soundPlayer && soundPlayer.audioElements) {
           // 停止所有正在播放的音效
           Object.values(soundPlayer.audioElements).forEach(audio => {
               if (!audio.paused) {
                   audio.pause();
                   audio.currentTime = 0;
               }
           });
       }
   });
   ```

2. **避免内存泄漏**
   ```javascript
   // 在组件销毁时清理事件监听器
   function cleanupSoundPlayer(soundPlayer) {
       if (soundPlayer && soundPlayer.audioElements) {
           Object.values(soundPlayer.audioElements).forEach(audio => {
               // 移除事件监听器
               audio.removeEventListener('error');
               audio.removeEventListener('canplaythrough');
               
               // 重置音频元素
               audio.src = '';
               audio.load();
           });
       }
   }
   ```

## 故障排除

### 常见问题

#### 音效无法播放
- **症状**：调用播放方法后无声音输出
- **解决**：
  1. 检查音效文件是否存在
  2. 验证音频格式是否支持
  3. 确认系统音量设置
  4. 检查浏览器音频策略

#### 音效文件加载失败
- **症状**：控制台显示音效文件加载错误
- **解决**：
  1. 检查音效文件路径是否正确
  2. 验证文件权限
  3. 确认文件格式是否正确
  4. 检查网络连接状态

#### 音量控制无效
- **症状**：调用setVolume后音量未改变
- **解决**：
  1. 检查音量值范围是否正确(0.0-1.0)
  2. 验证音频元素是否正确引用
  3. 确认浏览器音量控制策略

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控音效播放状态
soundPlayer.playLinkedSound = function() {
    console.log('准备播放连接音效');
    // 原始实现
    SoundPlayer.prototype.playLinkedSound.call(this);
};
```

#### 性能监控
```javascript
// 监控音效播放性能
function monitorSoundPerformance(soundPlayer, methodName) {
    const originalMethod = soundPlayer[methodName];
    soundPlayer[methodName] = function(...args) {
        const startTime = performance.now();
        const result = originalMethod.apply(this, args);
        const endTime = performance.now();
        
        console.log(`${methodName} 执行耗时: ${endTime - startTime}ms`);
        return result;
    };
}

// 使用示例
monitorSoundPerformance(soundPlayer, 'playLinkedSound');
```

#### 内存使用监控
```javascript
// 监控音频元素内存使用
function logAudioMemoryUsage(soundPlayer) {
    if (soundPlayer.audioElements) {
        const audioElements = Object.values(soundPlayer.audioElements);
        console.log(`音频元素数量: ${audioElements.length}`);
        
        // 检查每个音频元素的状态
        audioElements.forEach((audio, index) => {
            console.log(`音频元素 ${index}:`, {
                src: audio.src,
                duration: audio.duration,
                currentTime: audio.currentTime,
                paused: audio.paused,
                readyState: audio.readyState
            });
        });
    }
}
```

## 扩展性

### 自定义音效

```javascript
// 扩展音效播放器以支持更多音效
class ExtendedSoundPlayer extends SoundPlayer {
    constructor() {
        super();
        // 添加自定义音效
        this.sounds.custom = 'custom.wav';
        this.sounds.alert = 'alert.wav';
        
        // 重新预加载
        this.preloadSounds();
    }
    
    /**
     * 播放自定义音效
     */
    playCustomSound() {
        this.playSound('custom', '🎵 播放自定义音效');
    }
    
    /**
     * 播放警告音效
     */
    playAlertSound() {
        this.playSound('alert', '⚠️ 播放警告音效');
    }
}

// 使用扩展的音效播放器
const extendedSoundPlayer = new ExtendedSoundPlayer();
extendedSoundPlayer.playCustomSound();
extendedSoundPlayer.playAlertSound();
```

### 音效事件系统

```javascript
// 为音效播放器添加事件系统
class EventedSoundPlayer extends SoundPlayer {
    constructor() {
        super();
        this.eventListeners = {};
    }
    
    /**
     * 添加事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(event, callback) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }
    
    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {Object} data - 事件数据
     */
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('事件回调执行失败:', error);
                }
            });
        }
    }
    
    /**
     * 重写播放方法以触发事件
     */
    playSound(soundKey, logMessage = '') {
        // 触发播放开始事件
        this.emit('sound:play:start', { soundKey, logMessage });
        
        try {
            super.playSound(soundKey, logMessage);
            
            // 触发播放完成事件
            this.emit('sound:play:complete', { soundKey, logMessage });
        } catch (error) {
            // 触发播放错误事件
            this.emit('sound:play:error', { soundKey, error, logMessage });
        }
    }
}

// 使用带事件的音效播放器
const eventedSoundPlayer = new EventedSoundPlayer();

// 监听音效播放事件
eventedSoundPlayer.on('sound:play:start', (data) => {
    console.log('开始播放音效:', data.soundKey);
});

eventedSoundPlayer.on('sound:play:complete', (data) => {
    console.log('音效播放完成:', data.soundKey);
});

eventedSoundPlayer.on('sound:play:error', (data) => {
    console.error('音效播放出错:', data.soundKey, data.error);
});

// 播放音效将触发相应事件
eventedSoundPlayer.playLinkedSound();