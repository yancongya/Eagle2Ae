// i18n.js - Internationalization system for Eagle2Ae
class I18n {
    constructor() {
        this.currentLanguage = 'zh'; // Default to Chinese
        this.supportedLanguages = ['zh', 'en'];
        
        // Check if we're in an iframe and try to get language from parent
        if (window.parent && window !== window.parent) {
            // We're in an iframe, try to get language from main app
            try {
                // Try to get language from parent window's localStorage
                const parentLang = this.getParentLanguage();
                if (parentLang && this.supportedLanguages.includes(parentLang)) {
                    this.currentLanguage = parentLang;
                }
            } catch (e) {
                console.log('Could not access parent language, using fallback');
            }
        } 
        
        // Always check localStorage for any changes made during the session
        const savedLanguage = localStorage.getItem('eagle2ae-language');
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
        }
        
        // Define translations
        this.translations = {
            'zh': {
                // Main UI elements
                'appTitle': 'Eagle2Ae_Eagle',
                'serviceName': 'Eagle2Ae_Eagle',
                'settingsTitle': 'Eagle2Ae_Eagle 设置',
                
                // Status section
                'statusSectionTitle': '服务状态',
                'aePortLabel': 'AE连接端口',
                'connectionStatusLabel': '连接状态',
                'uptimeLabel': '运行时间',
                
                // Connection status values
                'connected': '已连接',
                'disconnected': '未连接',
                'connecting': '连接中',
                'aeRunning': 'AE运行中，等待连接',
                'aeNotRunning': 'AE未运行',
                
                // Files section
                'filesSectionTitle': '当前选中文件',
                'noSelection': '未选择文件',
                'selectedCount': '已选择 {count} 个文件',
                
                // Log section
                'logSectionTitle': '操作日志',
                'logInfo': '等待操作日志...',
                
                // Settings dialog
                'showNotifications': '显示操作通知',
                'serverPort': '服务器端口:',
                'clipboardInterval': '剪切板检查间隔(毫秒):',
                'saveSettings': '保存设置',
                'cancelSettings': '取消',
                
                // Buttons
                'settingsButtonTitle': '设置',
                'exportButton': '导出到AE',
                
                // Notifications
                'serviceStarted': 'Eagle2Ae_Eagle 后台服务已启动',
                'serviceStarting': 'Eagle2Ae_Eagle 后台服务启动中...',
                'exportSuccess': '文件发送完成',
                'exportFailed': '发送失败: {message}',
                'noFilesSelected': '没有选中的文件',
                'serviceNotReady': '服务未就绪，请稍后重试',
                'settingsSaved': '设置已保存',
                'settingsSaveFailed': '保存设置失败',
                'portInUse': '端口被占用，请关闭占用程序或更改端口',
                'aeConnected': 'After Effects 已连接',
                
                // Log messages
                'logFileExportStart': '开始发送 {count} 个文件到AE...',
                'logServiceStatus': '服务状态已更新',
                'logConnectionError': '连接错误: {message}',
                'logFileSelectionUpdate': '文件选择已更新: {count} 个文件',
                
                // Other UI elements
                'initComplete': '初始化完成，用户操作已启用',
                'waitingForOperation': '等待操作...',
                
                // Additional UI elements
                'eagleApiUnavailable': 'Eagle API不可用（可能在浏览器环境中运行）',
                'unknownFile': '未知文件',
                'andMore': '还有 {count} 个文件',
                'selectFilesInEagle': '请在Eagle中选择要导出的文件',
                'uiStarted': 'Eagle2Ae_Eagle 管理界面已启动',
                
                // Language switch
                'language': '语言',
                'chinese': '中文',
                'english': 'English'
            },
            'en': {
                // Main UI elements
                'appTitle': 'Eagle2Ae_Eagle',
                'serviceName': 'Eagle2Ae_Eagle',
                'settingsTitle': 'Eagle2Ae_Eagle Settings',
                
                // Status section
                'statusSectionTitle': 'Service Status',
                'aePortLabel': 'AE Connection Port',
                'connectionStatusLabel': 'Connection Status',
                'uptimeLabel': 'Uptime',
                
                // Connection status values
                'connected': 'Connected',
                'disconnected': 'Disconnected',
                'connecting': 'Connecting',
                'aeRunning': 'AE Running, Waiting for Connection',
                'aeNotRunning': 'AE Not Running',
                
                // Files section
                'filesSectionTitle': 'Current Selected Files',
                'noSelection': 'No files selected',
                'selectedCount': 'Selected {count} files',
                
                // Log section
                'logSectionTitle': 'Operation Log',
                'logInfo': 'Waiting for operation logs...',
                
                // Settings dialog
                'showNotifications': 'Show Operation Notifications',
                'serverPort': 'Server Port:',
                'clipboardInterval': 'Clipboard Check Interval (ms):',
                'saveSettings': 'Save Settings',
                'cancelSettings': 'Cancel',
                
                // Buttons
                'settingsButtonTitle': 'Settings',
                'exportButton': 'Export to AE',
                
                // Notifications
                'serviceStarted': 'Eagle2Ae_Eagle Background Service Started',
                'serviceStarting': 'Eagle2Ae_Eagle Background Service Starting...',
                'exportSuccess': 'File transfer completed',
                'exportFailed': 'Transfer failed: {message}',
                'noFilesSelected': 'No files selected',
                'serviceNotReady': 'Service not ready, please try again later',
                'settingsSaved': 'Settings saved',
                'settingsSaveFailed': 'Failed to save settings',
                'portInUse': 'Port in use, please close the occupying program or change the port',
                'aeConnected': 'After Effects Connected',
                
                // Log messages
                'logFileExportStart': 'Starting to send {count} files to AE...',
                'logServiceStatus': 'Service status updated',
                'logConnectionError': 'Connection error: {message}',
                'logFileSelectionUpdate': 'File selection updated: {count} files',
                
                // Other UI elements
                'initComplete': 'Initialization complete, user operations enabled',
                'waitingForOperation': 'Waiting for operation...',
                
                // Additional UI elements
                'eagleApiUnavailable': 'Eagle API unavailable (may be running in browser environment)',
                'unknownFile': 'Unknown file',
                'andMore': 'And {count} more files',
                'selectFilesInEagle': 'Please select files to export in Eagle',
                'uiStarted': 'Eagle2Ae_Eagle Management Interface Started',
                
                // Language switch
                'language': 'Language',
                'chinese': '中文',
                'english': 'English'
            }
        };
    }
    
    // Set language and save preference
    setLanguage(lang) {
        if (this.supportedLanguages.includes(lang)) {
            this.currentLanguage = lang;
            localStorage.setItem('eagle2ae-language', lang);
            
            // Trigger UI update if window is available
            if (typeof window !== 'undefined') {
                this.updateUI();
                
                // Update the language icon to reflect current language
                const langIcon = document.querySelector('.language-icon');
                if (langIcon) {
                    langIcon.textContent = lang === 'zh' ? '中' : 'EN';
                }
                
                // Update the title of the language switch button
                const langSwitchBtn = document.getElementById('language-switch');
                if (langSwitchBtn) {
                    langSwitchBtn.title = lang === 'zh' ? 'Switch to English' : '切换到中文';
                }
            }
            
            return true;
        }
        return false;
    }
    
    // Get language from parent window if available
    getParentLanguage() {
        try {
            // Try to get language from parent window's localStorage
            if (window.parent && window !== window.parent) {
                // Check if parent window has language info
                const parentLang = localStorage.getItem('lang'); // 'lang' is the key used in main app
                if (parentLang) {
                    // Convert from main app language format to our format
                    if (parentLang === 'en-US') {
                        return 'en';
                    } else if (parentLang === 'zh-CN') {
                        return 'zh';
                    }
                }
            }
        } catch (e) {
            // Cross-origin restrictions may prevent access
            console.log('Could not access parent language due to security restrictions');
        }
        return null;
    }
    
    // Get current language
    getLanguage() {
        return this.currentLanguage;
    }
    
    // Get translation for a key
    t(key, params = {}) {
        const lang = this.translations[this.currentLanguage];
        let translation = lang && lang[key] ? lang[key] : key;
        
        // Replace parameters in the translation
        Object.keys(params).forEach(param => {
            translation = translation.replace(new RegExp(`{${param}}`, 'g'), params[param]);
        });
        
        return translation;
    }
    
    // Update UI elements with current translations
    updateUI() {
        // Update main title
        const mainTitle = document.getElementById('main-title');
        if (mainTitle) {
            mainTitle.textContent = this.t('appTitle');
        }
        
        // Update status section title
        const statusTitle = document.querySelector('.status-section h3');
        if (statusTitle) {
            statusTitle.textContent = this.t('statusSectionTitle');
        }
        
        // Update status labels
        const aePortLabel = document.querySelector('.status-item:nth-child(1) .status-label');
        if (aePortLabel) {
            aePortLabel.textContent = this.t('aePortLabel');
        }
        
        const connectionLabel = document.querySelector('.status-item:nth-child(2) .status-label');
        if (connectionLabel) {
            connectionLabel.textContent = this.t('connectionStatusLabel');
        }
        
        const uptimeLabel = document.querySelector('.status-item:nth-child(3) .status-label');
        if (uptimeLabel) {
            uptimeLabel.textContent = this.t('uptimeLabel');
        }
        
        // Update files section title
        const filesTitle = document.querySelector('.files-section h3');
        if (filesTitle) {
            filesTitle.textContent = this.t('filesSectionTitle');
        }
        
        // Update log section title
        const logTitle = document.querySelector('.log-section h3');
        if (logTitle) {
            logTitle.textContent = this.t('logSectionTitle');
        }
        
        // Update log info text
        const logInfo = document.querySelector('.log-info');
        if (logInfo) {
            logInfo.textContent = this.t('logInfo');
        }
        
        // Update settings button title
        const settingsButton = document.getElementById('title-settings-button');
        if (settingsButton) {
            settingsButton.title = this.t('settingsButtonTitle');
        }
        
        // Update language switch button title
        const langSwitchButton = document.getElementById('language-switch');
        if (langSwitchButton) {
            const currentLang = this.getLanguage();
            langSwitchButton.title = currentLang === 'zh' ? 'Switch to English' : '切换到中文';
        }
        
        // Update settings dialog elements
        const settingsDialogTitle = document.getElementById('settings-dialog-title');
        if (settingsDialogTitle) {
            settingsDialogTitle.textContent = this.t('settingsTitle');
        }
        
        // Update settings labels with proper structure
        const showNotificationsLabel = document.getElementById('show-notifications-label');
        if (showNotificationsLabel) {
            const checkbox = showNotificationsLabel.querySelector('input');
            if (checkbox) {
                showNotificationsLabel.innerHTML = `${checkbox.outerHTML}${this.t('showNotifications')}`;
            } else {
                showNotificationsLabel.textContent = this.t('showNotifications');
            }
        }
        
        const serverPortLabel = document.getElementById('server-port-label');
        if (serverPortLabel) {
            serverPortLabel.textContent = this.t('serverPort');
        }
        
        const clipboardIntervalLabel = document.getElementById('clipboard-interval-label');
        if (clipboardIntervalLabel) {
            clipboardIntervalLabel.textContent = this.t('clipboardInterval');
        }
        
        // Update button texts
        const saveSettingsButton = document.getElementById('save-settings');
        if (saveSettingsButton) {
            saveSettingsButton.textContent = this.t('saveSettings');
        }
        
        const cancelSettingsButton = document.getElementById('cancel-settings');
        if (cancelSettingsButton) {
            cancelSettingsButton.textContent = this.t('cancelSettings');
        }
        
        // Update connection status text (only if it matches known values)
        const connectionStatusElement = document.getElementById('connection-status');
        if (connectionStatusElement) {
            const currentText = connectionStatusElement.textContent;
            if (currentText === '已连接' || currentText === 'Connected') {
                connectionStatusElement.textContent = this.t('connected');
            } else if (currentText === '未连接' || currentText === 'Disconnected') {
                connectionStatusElement.textContent = this.t('disconnected');
            } else if (currentText === 'AE运行中，等待连接' || currentText === 'AE Running, Waiting for Connection') {
                connectionStatusElement.textContent = this.t('aeRunning');
            } else if (currentText === 'AE未运行' || currentText === 'AE Not Running') {
                connectionStatusElement.textContent = this.t('aeNotRunning');
            }
        }
        
        // Update files count text (only if it contains known patterns)
        const filesCount = document.getElementById('files-count');
        if (filesCount) {
            const currentText = filesCount.textContent;
            if (currentText === '未选择文件' || currentText === 'No files selected') {
                filesCount.textContent = this.t('noSelection');
            } else if (currentText.includes('已选择') || currentText.includes('Selected')) {
                // Extract count from text and re-translate
                const countMatch = currentText.match(/\d+/);
                if (countMatch) {
                    const count = countMatch[0];
                    filesCount.textContent = this.t('selectedCount', { count: count });
                }
            }
        }
        
        // Update no-files message
        const noFilesMessage = document.querySelector('.no-files');
        if (noFilesMessage) {
            // Update with the current language's message
            noFilesMessage.textContent = this.t('selectFilesInEagle', { defaultValue: '请在Eagle中选择要导出的文件' });
        }
    }
    
    // Format message with parameters
    format(message, params) {
        return this.t(message, params);
    }
}

// Create global i18n instance
window.i18n = new I18n();