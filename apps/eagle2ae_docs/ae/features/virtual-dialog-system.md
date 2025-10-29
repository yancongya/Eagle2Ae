# 虚拟对话框系统

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了全新的虚拟对话框系统（Virtual Dialog System），该系统在演示模式下提供与真实对话框一致的用户体验。通过模拟用户交互和对话框行为，虚拟对话框系统让用户能够在不安装完整AE环境的情况下体验扩展的所有功能。

## 核心特性

### 真实感模拟
- 提供与真实对话框几乎一致的视觉效果和交互体验
- 支持多种对话框类型（确认框、警告框、输入框、选择框等）
- 模拟真实的动画效果和过渡

### 智能用户行为模拟
- 基于上下文智能模拟用户选择
- 支持自定义用户偏好设置
- 提供可配置的模拟策略

### 无缝集成
- 与现有对话框调用代码完全兼容
- 无需修改业务逻辑即可启用虚拟对话框
- 支持热切换（真实/虚拟模式）

### 扩展性设计
- 支持自定义对话框模板
- 提供丰富的API用于扩展功能
- 支持插件化架构

## 使用指南

### 基本使用

#### 启用虚拟对话框
```javascript
// 在应用初始化时启用虚拟对话框系统
const virtualDialogEngine = new VirtualDialogEngine({
    enabled: true,
    mode: 'auto', // 'auto' | 'always' | 'never'
    simulationStrategy: 'smart' // 'random' | 'smart' | 'preference'
});

// 注册到全局作用域供其他模块使用
window.virtualDialogEngine = virtualDialogEngine;
```

#### 显示虚拟对话框
```javascript
// 显示简单的确认对话框
const userChoice = await virtualDialogEngine.showVirtualDialog({
    type: 'confirm',
    title: '确认操作',
    message: '您确定要执行此操作吗？',
    buttons: ['确定', '取消'],
    defaultButton: 0,
    cancelButton: 1
});

if (userChoice === '确定') {
    console.log('用户确认了操作');
} else {
    console.log('用户取消了操作');
}
```

#### 显示输入对话框
```javascript
// 显示输入对话框
const userInput = await virtualDialogEngine.showVirtualDialog({
    type: 'prompt',
    title: '输入信息',
    message: '请输入您的姓名：',
    defaultValue: '匿名用户',
    placeholder: '请输入姓名',
    buttons: ['确定', '取消']
});

if (userInput !== null) {
    console.log(`用户输入: ${userInput}`);
}
```

### 高级功能

#### 自定义对话框模板
```javascript
// 注册自定义对话框模板
virtualDialogEngine.registerTemplate('custom-warning', `
    <div class="virtual-dialog custom-warning-dialog">
        <div class="dialog-header">
            <h3>{{title}}</h3>
            <button class="dialog-close">&times;</button>
        </div>
        <div class="dialog-content">
            <div class="warning-icon">⚠️</div>
            <div class="message">{{message}}</div>
            <div class="details">{{details}}</div>
        </div>
        <div class="dialog-footer">
            {{#each buttons}}
            <button class="dialog-button" data-index="{{@index}}">{{this}}</button>
            {{/each}}
        </div>
    </div>
`);

// 使用自定义模板显示对话框
const result = await virtualDialogEngine.showVirtualDialog({
    template: 'custom-warning',
    title: '重要警告',
    message: '此操作不可逆，请谨慎操作',
    details: '删除的文件将无法恢复',
    buttons: ['继续', '取消']
});
```

#### 智能用户行为模拟
```javascript
// 配置用户偏好
virtualDialogEngine.setUserPreferences({
    // 对于确认操作，默认选择"确定"
    'confirm.default': '确定',
    
    // 对于警告操作，默认选择"取消"
    'warning.default': '取消',
    
    // 对于输入操作，提供默认值
    'prompt.defaults': {
        '请输入姓名': '张三',
        '请输入邮箱': 'example@email.com'
    },
    
    // 模拟策略设置
    simulationStrategy: 'preference' // 使用用户偏好进行模拟
});

// 使用智能模拟
const smartChoice = await virtualDialogEngine.showVirtualDialog({
    type: 'confirm',
    title: '保存项目',
    message: '项目已修改，是否保存更改？',
    buttons: ['保存', '不保存', '取消']
});

// 根据用户偏好，可能会自动选择"保存"
console.log(`智能选择结果: ${smartChoice}`);
```

#### 批量对话框处理
```javascript
// 批量处理多个对话框
const batchResults = await virtualDialogEngine.batchShowDialogs([
    {
        id: 'warning1',
        type: 'confirm',
        title: '警告1',
        message: '这是第一个警告',
        buttons: ['继续', '取消']
    },
    {
        id: 'warning2',
        type: 'confirm',
        title: '警告2',
        message: '这是第二个警告',
        buttons: ['继续', '取消']
    },
    {
        id: 'input1',
        type: 'prompt',
        title: '输入',
        message: '请输入备注信息',
        buttons: ['确定', '取消']
    }
]);

// 处理批量结果
batchResults.forEach(result => {
    console.log(`对话框 ${result.id} 结果: ${result.choice}`);
});
```

## 技术实现

### 核心类结构

```javascript
/**
 * 虚拟对话框引擎
 * 在演示模式下提供虚拟的对话框体验
 */
class VirtualDialogEngine {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            enabled: true,
            mode: 'auto', // 'auto' | 'always' | 'never'
            simulationStrategy: 'smart', // 'random' | 'smart' | 'preference'
            defaultDelay: 1000, // 默认模拟延迟（毫秒）
            templates: {},
            userPreferences: {},
            ...options
        };

        // 初始化状态
        this.dialogCounter = 0;
        this.activeDialogs = new Map();
        this.templateCache = new Map();

        // 绑定方法上下文
        this.showVirtualDialog = this.showVirtualDialog.bind(this);
        this.simulateUserChoice = this.simulateUserChoice.bind(this);
        this.createDialogElement = this.createDialogElement.bind(this);

        this.log('虚拟对话框引擎已初始化', 'debug');
    }
}
```

### 对话框创建实现

```javascript
/**
 * 创建对话框元素
 * @param {Object} dialogConfig - 对话框配置
 * @returns {HTMLElement} 对话框元素
 */
createDialogElement(dialogConfig) {
    const {
        id,
        type,
        title,
        message,
        details,
        buttons,
        defaultValue,
        placeholder,
        template
    } = dialogConfig;

    // 使用自定义模板或默认模板
    let dialogHTML;
    if (template && this.options.templates[template]) {
        // 使用 Handlebars 风格的模板引擎
        dialogHTML = this.renderTemplate(template, {
            id, type, title, message, details, buttons, defaultValue, placeholder
        });
    } else {
        // 使用默认模板
        dialogHTML = this.getDefaultTemplate(type, {
            id, title, message, details, buttons, defaultValue, placeholder
        });
    }

    // 创建对话框容器
    const dialogContainer = document.createElement('div');
    dialogContainer.className = 'virtual-dialog-overlay';
    dialogContainer.dataset.dialogId = id;
    dialogContainer.innerHTML = dialogHTML;

    // 添加样式
    this.addDialogStyles();

    // 绑定事件
    this.bindDialogEvents(dialogContainer, dialogConfig);

    return dialogContainer;
}

/**
 * 获取默认模板
 * @param {string} type - 对话框类型
 * @param {Object} data - 数据
 * @returns {string} HTML模板
 */
getDefaultTemplate(type, data) {
    const { id, title, message, details, buttons, defaultValue, placeholder } = data;

    switch (type) {
        case 'alert':
            return `
                <div class="virtual-dialog alert-dialog" data-dialog-id="${id}">
                    <div class="dialog-header">
                        <h3>${title || '提示'}</h3>
                    </div>
                    <div class="dialog-content">
                        <div class="message">${message}</div>
                        ${details ? `<div class="details">${details}</div>` : ''}
                    </div>
                    <div class="dialog-footer">
                        <button class="dialog-button primary" data-choice="${buttons[0] || '确定'}">${buttons[0] || '确定'}</button>
                    </div>
                </div>
            `;

        case 'confirm':
            return `
                <div class="virtual-dialog confirm-dialog" data-dialog-id="${id}">
                    <div class="dialog-header">
                        <h3>${title || '确认'}</h3>
                    </div>
                    <div class="dialog-content">
                        <div class="message">${message}</div>
                        ${details ? `<div class="details">${details}</div>` : ''}
                    </div>
                    <div class="dialog-footer">
                        ${buttons.map((button, index) => 
                            `<button class="dialog-button ${index === 0 ? 'primary' : 'secondary'}" data-choice="${button}">${button}</button>`
                        ).join('')}
                    </div>
                </div>
            `;

        case 'prompt':
            return `
                <div class="virtual-dialog prompt-dialog" data-dialog-id="${id}">
                    <div class="dialog-header">
                        <h3>${title || '输入'}</h3>
                    </div>
                    <div class="dialog-content">
                        <div class="message">${message}</div>
                        ${details ? `<div class="details">${details}</div>` : ''}
                        <input type="text" class="dialog-input" 
                               value="${defaultValue || ''}" 
                               placeholder="${placeholder || ''}"
                               data-default-value="${defaultValue || ''}">
                    </div>
                    <div class="dialog-footer">
                        ${buttons.map((button, index) => 
                            `<button class="dialog-button ${index === 0 ? 'primary' : 'secondary'}" data-choice="${button}">${button}</button>`
                        ).join('')}
                    </div>
                </div>
            `;

        default:
            return `
                <div class="virtual-dialog default-dialog" data-dialog-id="${id}">
                    <div class="dialog-header">
                        <h3>${title || '对话框'}</h3>
                    </div>
                    <div class="dialog-content">
                        <div class="message">${message}</div>
                        ${details ? `<div class="details">${details}</div>` : ''}
                    </div>
                    <div class="dialog-footer">
                        ${buttons.map((button, index) => 
                            `<button class="dialog-button ${index === 0 ? 'primary' : 'secondary'}" data-choice="${button}">${button}</button>`
                        ).join('')}
                    </div>
                </div>
            `;
    }
}
```

### 用户行为模拟实现

```javascript
/**
 * 模拟用户选择
 * @param {Array<string>} buttons - 可选按钮
 * @param {Object} preferences - 选择偏好
 * @returns {string|number|null} 模拟的选择结果
 */
simulateUserChoice(buttons, preferences = {}) {
    const { simulationStrategy = this.options.simulationStrategy } = preferences;

    switch (simulationStrategy) {
        case 'random':
            // 随机选择
            return buttons[Math.floor(Math.random() * buttons.length)];

        case 'smart':
            // 智能选择
            return this.smartUserChoice(buttons, preferences);

        case 'preference':
            // 基于用户偏好的选择
            return this.preferenceBasedChoice(buttons, preferences);

        default:
            // 默认随机选择
            return buttons[Math.floor(Math.random() * buttons.length)];
    }
}

/**
 * 智能用户选择
 * @param {Array<string>} buttons - 可选按钮
 * @param {Object} preferences - 选择偏好
 * @returns {string} 选择结果
 */
smartUserChoice(buttons, preferences) {
    // 分析按钮语义
    const semanticAnalysis = buttons.map(button => ({
        text: button,
        semantic: this.analyzeButtonSemantic(button)
    }));

    // 根据上下文智能选择
    const context = preferences.context || 'default';
    
    switch (context) {
        case 'save':
            // 保存场景：优先选择"保存"
            const saveButton = semanticAnalysis.find(item => 
                item.semantic.type === 'positive' || 
                item.semantic.keywords.includes('保存') ||
                item.semantic.keywords.includes('确定') ||
                item.semantic.keywords.includes('ok')
            );
            return saveButton ? saveButton.text : buttons[0];

        case 'delete':
            // 删除场景：优先选择"取消"
            const cancelButton = semanticAnalysis.find(item => 
                item.semantic.type === 'negative' || 
                item.semantic.keywords.includes('取消') ||
                item.semantic.keywords.includes('cancel')
            );
            return cancelButton ? cancelButton.text : buttons[buttons.length - 1];

        case 'warning':
            // 警告场景：根据警告级别选择
            const warningLevel = preferences.warningLevel || 'medium';
            if (warningLevel === 'high') {
                // 高级别警告：默认选择最安全的选项
                return buttons[buttons.length - 1]; // 通常是"取消"
            } else {
                // 中低级别警告：默认选择积极选项
                return buttons[0];
            }

        default:
            // 默认场景：使用用户偏好或随机选择
            return this.preferenceBasedChoice(buttons, preferences);
    }
}

/**
 * 分析按钮语义
 * @param {string} buttonText - 按钮文本
 * @returns {Object} 语义分析结果
 */
analyzeButtonSemantic(buttonText) {
    const text = buttonText.toLowerCase();
    const keywords = text.match(/[\u4e00-\u9fa5a-z]+/g) || [text];

    // 定义语义关键词
    const positiveKeywords = ['确定', '确认', '保存', '继续', '是', 'ok', 'yes', 'save', 'continue'];
    const negativeKeywords = ['取消', '否', '取消', 'no', 'cancel', 'abort'];
    const neutralKeywords = ['关闭', '忽略', '跳过', 'close', 'ignore', 'skip'];

    // 判断语义类型
    let type = 'neutral';
    if (positiveKeywords.some(keyword => keywords.includes(keyword))) {
        type = 'positive';
    } else if (negativeKeywords.some(keyword => keywords.includes(keyword))) {
        type = 'negative';
    }

    return {
        text: buttonText,
        keywords,
        type,
        confidence: 0.8 // 置信度
    };
}

/**
 * 基于用户偏好的选择
 * @param {Array<string>} buttons - 可选按钮
 * @param {Object} preferences - 选择偏好
 * @returns {string} 选择结果
 */
preferenceBasedChoice(buttons, preferences) {
    const userPrefs = { ...this.options.userPreferences, ...preferences.userPreferences };

    // 查找匹配的偏好设置
    for (const [prefKey, prefValue] of Object.entries(userPrefs)) {
        if (prefKey.startsWith('button.')) {
            const buttonLabel = prefKey.substring(7); // 移除 'button.' 前缀
            if (buttons.includes(buttonLabel)) {
                return buttonLabel;
            }
        }
    }

    // 查找默认选择
    const defaultChoice = userPrefs['default.choice'] || buttons[0];
    if (buttons.includes(defaultChoice)) {
        return defaultChoice;
    }

    // 如果没有匹配的偏好，使用第一个按钮
    return buttons[0];
}
```

### 对话框显示实现

```javascript
/**
 * 显示虚拟对话框
 * @param {Object} config - 对话框配置
 * @returns {Promise<string|number|null>} 用户选择结果
 */
async showVirtualDialog(config) {
    // 检查是否启用虚拟对话框
    if (!this.shouldShowVirtualDialog()) {
        // 如果不应该显示虚拟对话框，尝试调用真实的对话框
        return this.showRealDialog(config);
    }

    const {
        type = 'alert',
        title = '提示',
        message = '',
        details = '',
        buttons = ['确定'],
        defaultValue = '',
        placeholder = '',
        template = null,
        delay = this.options.defaultDelay,
        preferences = {}
    } = config;

    // 生成唯一ID
    const dialogId = `virtual-dialog-${++this.dialogCounter}`;
    
    // 创建对话框配置
    const dialogConfig = {
        id: dialogId,
        type,
        title,
        message,
        details,
        buttons,
        defaultValue,
        placeholder,
        template,
        preferences
    };

    // 创建对话框元素
    const dialogElement = this.createDialogElement(dialogConfig);

    // 添加到DOM
    document.body.appendChild(dialogElement);

    // 记录活跃对话框
    this.activeDialogs.set(dialogId, {
        element: dialogElement,
        config: dialogConfig,
        resolve: null,
        reject: null
    });

    // 创建Promise用于返回结果
    const resultPromise = new Promise((resolve, reject) => {
        // 保存resolve和reject函数
        const dialogRecord = this.activeDialogs.get(dialogId);
        if (dialogRecord) {
            dialogRecord.resolve = resolve;
            dialogRecord.reject = reject;
        }
    });

    // 如果设置了延迟，先进行模拟等待
    if (delay > 0) {
        // 模拟用户思考时间
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 根据配置决定是否自动模拟用户选择
    if (config.autoSimulate !== false) {
        // 模拟用户选择
        const simulatedChoice = this.simulateUserChoice(buttons, {
            context: config.context,
            warningLevel: config.warningLevel,
            ...preferences
        });

        // 模拟用户操作延迟
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

        // 自动关闭对话框并返回结果
        this.closeDialog(dialogId, simulatedChoice);
    }

    return resultPromise;
}

/**
 * 关闭对话框
 * @param {string} dialogId - 对话框ID
 * @param {string|number|null} choice - 用户选择
 */
closeDialog(dialogId, choice) {
    const dialogRecord = this.activeDialogs.get(dialogId);
    if (!dialogRecord) return;

    // 移除DOM元素
    if (dialogRecord.element && dialogRecord.element.parentNode) {
        dialogRecord.element.parentNode.removeChild(dialogRecord.element);
    }

    // 解析Promise
    if (dialogRecord.resolve) {
        dialogRecord.resolve(choice);
    }

    // 从活跃对话框列表中移除
    this.activeDialogs.delete(dialogId);

    this.log(`虚拟对话框 ${dialogId} 已关闭，用户选择: ${choice}`, 'debug');
}
```

### 事件绑定实现

```javascript
/**
 * 绑定对话框事件
 * @param {HTMLElement} dialogContainer - 对话框容器
 * @param {Object} dialogConfig - 对话框配置
 */
bindDialogEvents(dialogContainer, dialogConfig) {
    const { id: dialogId, buttons } = dialogConfig;

    // 绑定按钮点击事件
    const buttonElements = dialogContainer.querySelectorAll('.dialog-button');
    buttonElements.forEach((button, index) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const choice = button.dataset.choice || buttons[index] || index;
            this.closeDialog(dialogId, choice);
        });
    });

    // 绑定输入框回车事件（针对prompt对话框）
    const inputElement = dialogContainer.querySelector('.dialog-input');
    if (inputElement) {
        inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const inputValue = inputElement.value;
                this.closeDialog(dialogId, inputValue);
            }
        });
    }

    // 绑定ESC键关闭事件
    dialogContainer.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            // ESC通常对应取消操作
            const cancelButton = buttons.find(button => 
                button.toLowerCase().includes('取消') || 
                button.toLowerCase().includes('cancel')
            ) || buttons[buttons.length - 1];
            this.closeDialog(dialogId, cancelButton);
        }
    });

    // 绑定点击遮罩关闭事件
    dialogContainer.addEventListener('click', (event) => {
        if (event.target === dialogContainer) {
            event.preventDefault();
            // 点击遮罩通常对应取消操作
            const cancelButton = buttons.find(button => 
                button.toLowerCase().includes('取消') || 
                button.toLowerCase().includes('cancel')
            ) || buttons[buttons.length - 1];
            this.closeDialog(dialogId, cancelButton);
        }
    });

    // 绑定关闭按钮事件
    const closeButton = dialogContainer.querySelector('.dialog-close');
    if (closeButton) {
        closeButton.addEventListener('click', (event) => {
            event.preventDefault();
            const cancelButton = buttons.find(button => 
                button.toLowerCase().includes('取消') || 
                button.toLowerCase().includes('cancel')
            ) || buttons[buttons.length - 1];
            this.closeDialog(dialogId, cancelButton);
        });
    }
}
```

## 样式系统

### CSS样式实现

```css
/* 虚拟对话框基础样式 */
.virtual-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.virtual-dialog {
    background: #2b2b2b;
    border: 1px solid #404040;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    min-width: 300px;
    max-width: 500px;
    overflow: hidden;
    animation: dialogAppear 0.3s ease-out;
}

@keyframes dialogAppear {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.dialog-header {
    padding: 12px 16px;
    border-bottom: 1px solid #404040;
    background: #1e1e1e;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dialog-header h3 {
    margin: 0;
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
}

.dialog-close {
    background: none;
    border: none;
    color: #999;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.dialog-close:hover {
    background: #333;
    color: #fff;
}

.dialog-content {
    padding: 20px;
    color: #cccccc;
    line-height: 1.5;
}

.message {
    margin-bottom: 12px;
    font-size: 13px;
}

.details {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #404040;
}

.dialog-input {
    width: 100%;
    padding: 8px 12px;
    background: #1e1e1e;
    border: 1px solid #404040;
    border-radius: 4px;
    color: #ffffff;
    font-size: 13px;
    margin-top: 12px;
    box-sizing: border-box;
}

.dialog-input:focus {
    outline: none;
    border-color: #0078d4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.3);
}

.dialog-footer {
    padding: 16px;
    background: #1e1e1e;
    border-top: 1px solid #404040;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

.dialog-button {
    padding: 6px 16px;
    border: 1px solid #404040;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 60px;
}

.dialog-button.primary {
    background: #0078d4;
    color: #ffffff;
    border-color: #0078d4;
}

.dialog-button.primary:hover {
    background: #106ebe;
    border-color: #106ebe;
}

.dialog-button.secondary {
    background: #404040;
    color: #cccccc;
}

.dialog-button.secondary:hover {
    background: #4a4a4a;
    border-color: #555;
}

/* 警告对话框样式 */
.virtual-dialog.warning-dialog .dialog-header {
    border-left: 4px solid #f0ad4e;
}

.warning-icon {
    font-size: 24px;
    margin-bottom: 12px;
    text-align: center;
}

/* 错误对话框样式 */
.virtual-dialog.error-dialog .dialog-header {
    border-left: 4px solid #d9534f;
}

.error-icon {
    font-size: 24px;
    margin-bottom: 12px;
    text-align: center;
    color: #d9534f;
}

/* 成功对话框样式 */
.virtual-dialog.success-dialog .dialog-header {
    border-left: 4px solid #5cb85c;
}

.success-icon {
    font-size: 24px;
    margin-bottom: 12px;
    text-align: center;
    color: #5cb85c;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .virtual-dialog {
        margin: 16px;
        min-width: auto;
        max-width: calc(100% - 32px);
    }
    
    .dialog-header {
        padding: 10px 12px;
    }
    
    .dialog-content {
        padding: 16px;
    }
    
    .dialog-footer {
        padding: 12px;
        flex-direction: column;
    }
    
    .dialog-button {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .virtual-dialog {
        margin: 8px;
        max-width: calc(100% - 16px);
    }
    
    .dialog-header h3 {
        font-size: 13px;
    }
    
    .message {
        font-size: 12px;
    }
    
    .details {
        font-size: 11px;
    }
}
```

## 最佳实践

### 使用建议

1. **合理配置模拟策略**
   ```javascript
   // 根据使用场景选择合适的模拟策略
   const virtualDialogEngine = new VirtualDialogEngine({
       simulationStrategy: 'smart', // 智能模拟
       userPreferences: {
           'confirm.default': '确定',
           'warning.default': '取消'
       }
   });
   ```

2. **性能优化**
   ```javascript
   // 对于频繁调用的对话框，适当减少模拟延迟
   const quickDialog = await virtualDialogEngine.showVirtualDialog({
       message: '操作完成',
       buttons: ['确定'],
       delay: 300 // 减少延迟
   });
   
   // 对于重要决策对话框，保持适当的模拟时间
   const importantDialog = await virtualDialogEngine.showVirtualDialog({
       title: '重要确认',
       message: '此操作不可逆，请确认',
       buttons: ['继续', '取消'],
       delay: 1500 // 增加模拟时间以体现重要性
   });
   ```

3. **用户体验优化**
   ```javascript
   // 提供清晰的上下文信息
   const contextualDialog = await virtualDialogEngine.showVirtualDialog({
       context: 'save', // 提供上下文帮助智能选择
       title: '保存项目',
       message: '项目已修改，是否保存更改？',
       details: '未保存的更改将会丢失',
       buttons: ['保存', '不保存', '取消']
   });
   ```

### 错误处理

1. **异常捕获**
   ```javascript
   try {
       const userChoice = await virtualDialogEngine.showVirtualDialog({
           title: '确认操作',
           message: '您确定要执行此操作吗？',
           buttons: ['确定', '取消']
       });
       
       if (userChoice === '确定') {
           // 执行操作
           await performAction();
       }
   } catch (error) {
       // 处理对话框显示或用户选择过程中的错误
       console.error('虚拟对话框操作失败:', error);
       
       // 可以选择降级到其他交互方式
       // 或者显示错误提示
   }
   ```

2. **降级处理**
   ```javascript
   // 当虚拟对话框系统不可用时，降级到简单提示
   if (!virtualDialogEngine.isEnabled()) {
       // 使用简单的alert或console.log替代
       alert('请在真实环境中执行此操作');
       return;
   }
   ```

## 故障排除

### 常见问题

1. **对话框未显示**
   - 症状：调用showVirtualDialog后无任何反应
   - 解决：检查虚拟对话框系统是否已正确初始化和启用

2. **模拟选择不准确**
   - 症状：自动模拟的用户选择不符合预期
   - 解决：调整模拟策略和用户偏好设置

3. **样式显示异常**
   - 症状：对话框样式错乱或显示不完整
   - 解决：检查CSS样式是否正确加载，确保z-index设置合适

### 调试技巧

1. **启用详细日志**
   ```javascript
   const virtualDialogEngine = new VirtualDialogEngine({
       enabled: true,
       debug: true // 启用调试日志
   });
   ```

2. **监控对话框生命周期**
   ```javascript
   // 监听对话框事件
   virtualDialogEngine.on('dialogCreated', (dialogId, config) => {
       console.log(`对话框创建: ${dialogId}`, config);
   });
   
   virtualDialogEngine.on('dialogClosed', (dialogId, choice) => {
       console.log(`对话框关闭: ${dialogId}, 选择: ${choice}`);
   });
   ```

3. **性能分析**
   ```javascript
   // 记录对话框显示性能
   const startTime = performance.now();
   const result = await virtualDialogEngine.showVirtualDialog(config);
   const endTime = performance.now();
   
   console.log(`对话框显示耗时: ${endTime - startTime}ms`);
   ```

## 扩展性

### 自定义扩展

1. **添加新的对话框类型**
   ```javascript
   // 注册自定义对话框类型
   virtualDialogEngine.registerDialogType('custom', {
       template: customTemplate,
       handler: customHandler
   });
   ```

2. **插件化架构**
   ```javascript
   // 创建插件
   class CustomDialogPlugin {
       constructor(engine) {
           this.engine = engine;
           this.registerCustomFeatures();
       }
       
       registerCustomFeatures() {
           // 扩展功能
           this.engine.addMethod('showCustomDialog', this.showCustomDialog.bind(this));
       }
       
       async showCustomDialog(config) {
           // 自定义实现
       }
   }
   
   // 注册插件
   virtualDialogEngine.use(CustomDialogPlugin);
   ```