// Eagle2Ae 彩蛋功能 - 标题连续点击检测
// 仅在CEP环境中启用，连续点击5次切换演示模式

class EasterEgg {
    constructor(demoMode) {
        this.demoMode = demoMode;
        this.config = {
            clickThreshold: 5,
            timeWindow: 3000, // 3秒时间窗口
            enabled: false // 只在CEP环境中启用
        };
        
        this.state = {
            clickCount: 0,
            lastClickTime: 0,
            isActive: false,
            titleElement: null
        };
        
        this.init();
    }
    
    init() {
        console.log('🥚 彩蛋功能初始化开始...');
        console.log('🔍 CEP环境检测:', this.isCEPEnvironment());
        console.log('🔍 window.__adobe_cep__:', !!window.__adobe_cep__);
        console.log('🔍 window.cep:', !!window.cep);
        console.log('🔍 CSInterface:', typeof CSInterface !== 'undefined');

        // 只在CEP环境中启用彩蛋功能
        if (!this.isCEPEnvironment()) {
            console.debug('🎭 彩蛋功能仅在CEP环境中可用');
            return;
        }

        this.config.enabled = true;
        this.injectStyles(); // 注入CSS样式
        this.setupTitleClickListener();
        console.log('🥚 彩蛋功能已启用 - 连续点击"项目信息"标题5次试试看');
    }
    
    isCEPEnvironment() {
        return !!(
            window.__adobe_cep__ ||
            (window.cep && window.cep.process) ||
            (typeof CSInterface !== 'undefined')
        );
    }
    
    setupTitleClickListener() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindTitleClick());
        } else {
            this.bindTitleClick();
        }
    }
    
    bindTitleClick() {
        // 查找顶部标题栏的"Eagle2Ae"标题元素
        const titleElement = document.querySelector('.header .title');
        const titleText = titleElement ? titleElement.textContent.trim().replace(/\s+/g, '') : '';

        if (titleElement && (titleText === 'Eagle2Ae' || titleText === 'Ae2Eagle')) {
            this.state.titleElement = titleElement;
            this.state.titleElement.addEventListener('click', (e) => this.handleTitleClick(e));
            this.state.titleElement.style.cursor = 'pointer';
            this.state.titleElement.style.userSelect = 'none';

            // 添加视觉提示（微妙的样式变化）
            this.state.titleElement.style.transition = 'all 0.2s ease';

            console.log('🎯 标题点击监听器已绑定到顶部"Eagle2Ae"标题');
            console.log('🥚 彩蛋提示: 连续快速点击顶部"Eagle2Ae"标题5次可切换演示模式');
        } else {
            console.warn('⚠️ 未找到顶部"Eagle2Ae"标题元素，彩蛋功能无法启用');
            console.log('🔍 查找的元素:', titleElement);
            console.log('🔍 元素文本内容:', titleElement?.textContent);

            // 延迟重试，可能DOM还没完全加载
            setTimeout(() => {
                this.bindTitleClick();
            }, 1000);
        }
    }
    
    handleTitleClick(event) {
        if (!this.config.enabled) return;
        
        const currentTime = Date.now();
        
        // 检查时间窗口
        if (currentTime - this.state.lastClickTime > this.config.timeWindow) {
            // 超出时间窗口，重置计数
            this.state.clickCount = 1;
        } else {
            // 在时间窗口内，增加计数
            this.state.clickCount++;
        }
        
        this.state.lastClickTime = currentTime;
        
        // 视觉反馈
        this.showClickFeedback();
        
        console.log(`🖱️ 标题点击 ${this.state.clickCount}/${this.config.clickThreshold}`);
        
        // 检查是否达到阈值
        if (this.state.clickCount >= this.config.clickThreshold) {
            this.triggerModeSwitch();
            this.resetClickState();
        }
    }
    
    showClickFeedback() {
        if (!this.state.titleElement) return;
        
        // 移除之前的动画类
        this.state.titleElement.classList.remove('easter-egg-click', 'easter-egg-glow');
        
        // 强制重排以确保类被移除
        this.state.titleElement.offsetHeight;
        
        if (this.state.clickCount < this.config.clickThreshold) {
            // 普通点击反馈
            this.state.titleElement.classList.add('easter-egg-click');
            setTimeout(() => {
                this.state.titleElement.classList.remove('easter-egg-click');
            }, 200);
        } else {
            // 第5次点击的特殊效果
            this.state.titleElement.classList.add('easter-egg-glow');
            setTimeout(() => {
                this.state.titleElement.classList.remove('easter-egg-glow');
            }, 1000);
        }
    }
    
    triggerModeSwitch() {
        console.log('🎉 彩蛋触发！切换演示模式');
        
        // 显示模式切换动画
        this.showModeSwitchAnimation();
        
        // 延迟执行模式切换，让动画播放完成
        setTimeout(() => {
            this.demoMode.toggleMode();
        }, 500);
    }
    
    showModeSwitchAnimation() {
        // 创建模式切换提示
        const notification = document.createElement('div');
        notification.className = 'easter-egg-notification';
        notification.innerHTML = `
            <div class="easter-egg-icon">🎭</div>
            <div class="easter-egg-text">模式切换中...</div>
        `;
        
        document.body.appendChild(notification);
        
        // 动画效果
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 自动移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }
    
    resetClickState() {
        this.state.clickCount = 0;
        this.state.lastClickTime = 0;
    }
    
    // 添加CSS样式
    injectStyles() {
        if (document.getElementById('easter-egg-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'easter-egg-styles';
        style.textContent = `
            .easter-egg-click {
                animation: easterEggPulse 0.2s ease-out;
            }
            
            .easter-egg-glow {
                animation: easterEggGlow 1s ease-out;
            }
            
            @keyframes easterEggPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); opacity: 0.8; }
                100% { transform: scale(1); }
            }
            
            @keyframes easterEggGlow {
                0% { 
                    transform: scale(1);
                    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
                }
                50% { 
                    transform: scale(1.1);
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
                    background-size: 400% 400%;
                    animation: easterEggRainbow 0.5s ease infinite;
                }
                100% { 
                    transform: scale(1);
                    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
                }
            }
            
            @keyframes easterEggRainbow {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            .easter-egg-notification {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.8);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px 30px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 10000;
                opacity: 0;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .easter-egg-notification.show {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            .easter-egg-icon {
                font-size: 24px;
                animation: easterEggSpin 2s linear infinite;
            }
            
            .easter-egg-text {
                font-size: 16px;
                font-weight: 500;
            }
            
            @keyframes easterEggSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// 导出类
window.EasterEgg = EasterEgg;
