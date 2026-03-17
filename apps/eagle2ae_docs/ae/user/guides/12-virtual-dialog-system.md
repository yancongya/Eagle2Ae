# 12. 虚拟对话框系统

## 概述

Eagle2Ae AE 扩展 v2.4.0 引入了创新的虚拟对话框系统（Virtual Dialog System），该系统在演示模式下提供与真实对话框一致的用户体验。通过模拟真实的用户交互和对话框行为，虚拟对话框系统让用户能够在不安装完整AE环境的情况下完整体验扩展的所有功能。

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

### 可扩展架构
- 支持自定义对话框模板
- 提供丰富的API用于扩展功能
- 支持插件化架构

## 使用指南

### 基本使用

#### 启用虚拟对话框
```javascript
// 在应用初始化时启用虚拟对话框系统
const virtualDialogSystem = new VirtualDialogSystem({
    enabled: true,
    mode: 'auto', // 'auto' | 'always' | 'never'
    simulationStrategy: 'smart' // 'random' | 'smart' | 'preference'
});

// 注册到全局作用域供其他模块使用
window.virtualDialogSystem = virtualDialogSystem;
```

#### 显示虚拟对话框
```javascript
// 显示简单的确认对话框
const userChoice = await virtualDialogSystem.showDialog({
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
const userInput = await virtualDialogSystem.showDialog({
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
virtualDialogSystem.registerTemplate('custom-warning', `
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
const result = await virtualDialogSystem.showDialog({
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
virtualDialogSystem.setUserPreferences({
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
const smartChoice = await virtualDialogSystem.showDialog({
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
const batchResults = await virtualDialogSystem.batchShowDialogs([
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
 * 虚拟对话框系统
 * 在演示模式下提供虚拟的对话框体验，模拟真实对话框的行为和外观
 */
class VirtualDialogSystem {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     */
    constructor(options = {}) {
        this.options = {
            enabled: true,
            mode: 'auto', // 'auto' | 'always' | 'never'
            simulationStrategy: 'smart', // 'random' | 'smart' | 'preference'
            autoCloseDelay: 15000, // 自动关闭延迟（毫秒）
            defaultDelay: 1000, // 默认模拟延迟（毫秒）
            templates: {},
            userPreferences: {},
            ...options
        };

        // 初始化状态
        this.dialogCounter = 0;
        this.activeDialogs = new Map();
        this.templateCache = new Map();
        this.userPreferences = { ...this.options.userPreferences };

        // 绑定方法上下文
        this.showDialog = this.showDialog.bind(this);
        this.simulateUserChoice = this.simulateUserChoice.bind(this);
        this.createDialogElement = this.createDialogElement.bind(this);

        this.log('🎭 虚拟对话框系统已初始化', 'debug');
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
    const userPrefs = { ...this.userPreferences, ...preferences.userPreferences };

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
async showDialog(config) {
    // 检查是否应该显示虚拟对话框
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
        autoClose = this.options.autoCloseDelay,
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

    // 设置自动关闭定时器
    if (autoClose > 0) {
        setTimeout(() => {
            if (this.activeDialogs.has(dialogId)) {
                this.log(`虚拟对话框 ${dialogId} 自动关闭`, 'debug');
                this.closeDialog(dialogId, null);
            }
        }, autoClose);
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

## 对话框类型

### 警告对话框

```javascript
// 显示警告对话框
const warningResult = await virtualDialogSystem.showDialog({
    type: 'warning',
    title: '⚠️ 警告',
    message: '检测到项目中存在潜在问题',
    details: '某些图层可能会影响导出性能',
    buttons: ['继续', '取消'],
    context: 'warning',
    warningLevel: 'medium'
});
```

### 错误对话框

```javascript
// 显示错误对话框
const errorResult = await virtualDialogSystem.showDialog({
    type: 'error',
    title: '❌ 错误',
    message: '无法连接到Eagle插件',
    details: '请确保Eagle应用正在运行并且插件已启用',
    buttons: ['重试', '取消']
});
```

### 信息对话框

```javascript
// 显示信息对话框
const infoResult = await virtualDialogSystem.showDialog({
    type: 'info',
    title: 'ℹ️ 信息',
    message: '操作已完成',
    details: '3个文件已成功导入到项目中',
    buttons: ['确定']
});
```

### 自定义对话框

```javascript
// 注册并显示自定义对话框
virtualDialogSystem.registerTemplate('custom-progress', `
    <div class="virtual-dialog custom-progress-dialog">
        <div class="dialog-header">
            <h3>{{title}}</h3>
        </div>
        <div class="dialog-content">
            <div class="message">{{message}}</div>
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: {{progress}}%"></div>
                </div>
                <div class="progress-text">{{progress}}%</div>
            </div>
            <div class="details">{{details}}</div>
        </div>
        <div class="dialog-footer">
            <button class="dialog-button secondary" data-choice="cancel">取消</button>
        </div>
    </div>
`);

// 显示自定义进度对话框
const progressResult = await virtualDialogSystem.showDialog({
    template: 'custom-progress',
    title: '处理中...',
    message: '正在处理文件',
    progress: 75,
    details: '剩余时间约 2 分钟',
    buttons: ['取消']
});
```

## 批量处理

### 批量对话框处理

```javascript
/**
 * 批量显示对话框
 * @param {Array<Object>} dialogConfigs - 对话框配置数组
 * @returns {Promise<Array<Object>>} 对话框结果数组
 */
async batchShowDialogs(dialogConfigs) {
    const results = [];
    
    // 顺序处理对话框，避免UI混乱
    for (const config of dialogConfigs) {
        try {
            const result = await this.showDialog(config);
            results.push({
                id: config.id,
                choice: result,
                success: true
            });
        } catch (error) {
            results.push({
                id: config.id,
                error: error.message,
                success: false
            });
        }
    }
    
    return results;
}
```

### 并行对话框处理

```javascript
/**
 * 并行显示对话框（适用于独立的对话框）
 * @param {Array<Object>} dialogConfigs - 对话框配置数组
 * @returns {Promise<Array<Object>>} 对话框结果数组
 */
async parallelShowDialogs(dialogConfigs) {
    // 创建所有对话框的Promise
    const dialogPromises = dialogConfigs.map(async (config) => {
        try {
            const result = await this.showDialog(config);
            return {
                id: config.id,
                choice: result,
                success: true
            };
        } catch (error) {
            return {
                id: config.id,
                error: error.message,
                success: false
            };
        }
    });
    
    // 等待所有对话框完成
    return Promise.all(dialogPromises);
}
```

## 模板系统

### 内置模板

```javascript
// 注册内置模板
const builtinTemplates = {
    'alert': `
        <div class="virtual-dialog alert-dialog" data-dialog-id="{{id}}">
            <div class="dialog-header">
                <h3>{{title}}</h3>
            </div>
            <div class="dialog-content">
                <div class="message">{{message}}</div>
                {{#if details}}
                <div class="details">{{details}}</div>
                {{/if}}
            </div>
            <div class="dialog-footer">
                <button class="dialog-button primary" data-choice="{{buttons.[0]}}">{{buttons.[0]}}</button>
            </div>
        </div>
    `,
    
    'confirm': `
        <div class="virtual-dialog confirm-dialog" data-dialog-id="{{id}}">
            <div class="dialog-header">
                <h3>{{title}}</h3>
            </div>
            <div class="dialog-content">
                <div class="message">{{message}}</div>
                {{#if details}}
                <div class="details">{{details}}</div>
                {{/if}}
            </div>
            <div class="dialog-footer">
                {{#each buttons}}
                <button class="dialog-button {{#if @first}}primary{{else}}secondary{{/if}}" data-choice="{{this}}">{{this}}</button>
                {{/each}}
            </div>
        </div>
    `,
    
    'prompt': `
        <div class="virtual-dialog prompt-dialog" data-dialog-id="{{id}}">
            <div class="dialog-header">
                <h3>{{title}}</h3>
            </div>
            <div class="dialog-content">
                <div class="message">{{message}}</div>
                {{#if details}}
                <div class="details">{{details}}</div>
                {{/if}}
                <input type="text" class="dialog-input" 
                       value="{{defaultValue}}" 
                       placeholder="{{placeholder}}"
                       data-default-value="{{defaultValue}}">
            </div>
            <div class="dialog-footer">
                {{#each buttons}}
                <button class="dialog-button {{#if @first}}primary{{else}}secondary{{/if}}" data-choice="{{this}}">{{this}}</button>
                {{/each}}
            </div>
        </div>
    `
};

// 注册所有内置模板
Object.entries(builtinTemplates).forEach(([name, template]) => {
    virtualDialogSystem.registerTemplate(name, template);
});
```

### 自定义模板

```javascript
// 注册自定义模板
virtualDialogSystem.registerTemplate('file-list', `
    <div class="virtual-dialog file-list-dialog" data-dialog-id="{{id}}">
        <div class="dialog-header">
            <h3>{{title}}</h3>
            <button class="dialog-close">&times;</button>
        </div>
        <div class="dialog-content">
            <div class="message">{{message}}</div>
            <div class="file-list-container">
                <ul class="file-list">
                    {{#each files}}
                    <li class="file-item" data-file-path="{{this.path}}">
                        <span class="file-icon">{{this.icon}}</span>
                        <span class="file-name">{{this.name}}</span>
                        <span class="file-size">{{this.size}}</span>
                    </li>
                    {{/each}}
                </ul>
            </div>
            {{#if details}}
            <div class="details">{{details}}</div>
            {{/if}}
        </div>
        <div class="dialog-footer">
            {{#each buttons}}
            <button class="dialog-button {{#if @first}}primary{{else}}secondary{{/if}}" data-choice="{{this}}">{{this}}</button>
            {{/each}}
        </div>
    </div>
`);

// 使用自定义模板
const fileListResult = await virtualDialogSystem.showDialog({
    template: 'file-list',
    title: '文件列表',
    message: '以下是将要导入的文件：',
    files: [
        { name: 'image1.png', path: '/path/to/image1.png', size: '1.2 MB', icon: '🖼️' },
        { name: 'video1.mp4', path: '/path/to/video1.mp4', size: '15.7 MB', icon: '🎬' },
        { name: 'audio1.mp3', path: '/path/to/audio1.mp3', size: '3.4 MB', icon: '🎵' }
    ],
    buttons: ['导入', '取消']
});
```

## 样式系统

### 基础样式

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
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
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
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
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

/* 对话框类型特定样式 */
.alert-dialog .dialog-header {
    border-left: 4px solid #3498db;
}

.confirm-dialog .dialog-header {
    border-left: 4px solid #f39c12;
}

.prompt-dialog .dialog-header {
    border-left: 4px solid #27ae60;
}

.warning-dialog .dialog-header {
    border-left: 4px solid #e74c3c;
}

.info-dialog .dialog-header {
    border-left: 4px solid #9b59b6;
}

.error-dialog .dialog-header {
    border-left: 4px solid #c0392b;
}
```

### 响应式设计

```css
/* 响应式对话框样式 */
@media (max-width: 768px) {
    .virtual-dialog {
        margin: 16px;
        min-width: auto;
        max-width: calc(100% - 32px);
    }
    
    .dialog-header {
        padding: 10px 12px;
    }
    
    .dialog-header h3 {
        font-size: 13px;
    }
    
    .dialog-content {
        padding: 16px;
    }
    
    .message {
        font-size: 12px;
    }
    
    .details {
        font-size: 11px;
    }
    
    .dialog-input {
        font-size: 12px;
        padding: 6px 10px;
    }
    
    .dialog-footer {
        padding: 12px;
        flex-direction: column;
    }
    
    .dialog-button {
        width: 100%;
        padding: 8px 16px;
        font-size: 13px;
    }
}

@media (max-width: 480px) {
    .virtual-dialog {
        margin: 8px;
        max-width: calc(100% - 16px);
    }
    
    .dialog-header {
        padding: 8px 10px;
    }
    
    .dialog-header h3 {
        font-size: 12px;
    }
    
    .dialog-content {
        padding: 12px;
    }
    
    .message {
        font-size: 11px;
    }
    
    .details {
        font-size: 10px;
    }
    
    .dialog-input {
        font-size: 11px;
        padding: 5px 8px;
    }
    
    .dialog-footer {
        padding: 10px;
    }
    
    .dialog-button {
        padding: 6px 12px;
        font-size: 12px;
    }
}
```

## 最佳实践

### 使用建议

#### 场景选择
1. **演示模式**: 在产品演示中使用虚拟对话框提供完整的用户体验
2. **开发调试**: 在开发过程中使用虚拟对话框进行快速测试
3. **用户培训**: 在用户培训材料中使用虚拟对话框展示操作流程
4. **文档说明**: 在帮助文档中使用虚拟对话框截图说明功能

#### 性能优化
1. **合理使用缓存**: 对于频繁显示的对话框类型，使用模板缓存
2. **避免过度动画**: 在低端设备上适度减少动画效果
3. **批量处理**: 对于多个相关对话框，使用批量处理功能
4. **及时清理**: 关闭对话框后及时清理DOM元素和事件监听器

#### 用户体验
1. **保持一致性**: 使虚拟对话框与真实对话框外观和行为一致
2. **提供反馈**: 在用户操作后提供清晰的视觉反馈
3. **合理延迟**: 模拟真实的用户操作延迟，避免过于迅速
4. **优雅降级**: 在虚拟对话框不可用时提供备选方案

### 示例代码

#### 基本确认对话框
```javascript
// 显示基本确认对话框
async function showBasicConfirm() {
    const result = await virtualDialogSystem.showDialog({
        type: 'confirm',
        title: '确认删除',
        message: '您确定要删除选中的文件吗？',
        details: '此操作不可撤销',
        buttons: ['删除', '取消']
    });
    
    if (result === '删除') {
        console.log('用户确认删除');
        // 执行删除操作
    } else {
        console.log('用户取消删除');
        // 取消操作
    }
}
```

#### 带输入的对话框
```javascript
// 显示带输入的对话框
async function showInputDialog() {
    const result = await virtualDialogSystem.showDialog({
        type: 'prompt',
        title: '重命名文件',
        message: '请输入新的文件名：',
        defaultValue: 'untitled.png',
        placeholder: '输入文件名',
        buttons: ['确定', '取消']
    });
    
    if (result !== null && result !== '取消') {
        console.log(`新文件名: ${result}`);
        // 执行重命名操作
    } else {
        console.log('用户取消重命名');
        // 取消操作
    }
}
```

#### 自定义进度对话框
```javascript
// 显示自定义进度对话框
async function showProgressDialog() {
    const result = await virtualDialogSystem.showDialog({
        template: 'custom-progress',
        title: '文件处理中',
        message: '正在处理文件，请稍候...',
        progress: 0,
        details: '准备开始处理',
        buttons: ['取消']
    });
    
    // 模拟进度更新
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
            clearInterval(interval);
            virtualDialogSystem.closeDialog('custom-progress', '完成');
        } else {
            // 更新进度显示
            const dialogElement = document.querySelector('.custom-progress-dialog');
            if (dialogElement) {
                const progressBar = dialogElement.querySelector('.progress-fill');
                const progressText = dialogElement.querySelector('.progress-text');
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `${progress}%`;
            }
        }
    }, 500);
    
    return result;
}
```

## 故障排除

### 常见问题

#### 对话框不显示
- **症状**：调用showDialog后无任何反应
- **解决**：
  1. 检查虚拟对话框系统是否已正确初始化
  2. 验证对话框配置是否正确
  3. 检查DOM元素是否正确添加到页面
  4. 查看控制台是否有错误信息

#### 对话框样式异常
- **症状**：对话框显示样式与预期不符
- **解决**：
  1. 检查CSS样式是否正确加载
  2. 验证模板是否正确渲染
  3. 检查样式优先级设置
  4. 确认响应式样式是否正确应用

#### 用户选择未返回
- **症状**：用户点击按钮后Promise未解析
- **解决**：
  1. 检查事件监听器是否正确绑定
  2. 验证按钮data-choice属性是否正确设置
  3. 检查Promise的resolve函数是否正确调用
  4. 查看是否有JavaScript错误阻止执行

### 调试技巧

#### 启用详细日志
```javascript
// 在控制台中启用详细日志
localStorage.setItem('debugLogLevel', '0');

// 监控对话框创建过程
virtualDialogSystem.addEventListener('dialogcreated', (event) => {
    console.log('对话框已创建:', event.detail);
});

// 监控对话框关闭过程
virtualDialogSystem.addEventListener('dialogclosed', (event) => {
    console.log('对话框已关闭:', event.detail);
});
```

#### 性能监控
```javascript
// 监控对话框显示性能
const startTime = performance.now();
const result = await virtualDialogSystem.showDialog(config);
const endTime = performance.now();

console.log(`对话框显示耗时: ${endTime - startTime}ms`);
```

#### 内存泄漏检测
```javascript
// 定期检查内存使用情况
setInterval(() => {
    if (virtualDialogSystem.activeDialogs.size > 10) {
        console.warn('可能存在对话框内存泄漏');
    }
}, 30000);
```

## 扩展性

### 自定义扩展

#### 扩展虚拟对话框系统
```javascript
// 创建自定义虚拟对话框类
class CustomVirtualDialogSystem extends VirtualDialogSystem {
    constructor(options = {}) {
        super(options);
        this.customFeatures = new Map();
    }
    
    // 添加自定义功能
    addCustomFeature(name, feature) {
        this.customFeatures.set(name, feature);
    }
    
    // 执行自定义功能
    executeCustomFeature(name, ...args) {
        const feature = this.customFeatures.get(name);
        if (feature && typeof feature === 'function') {
            return feature(...args);
        }
        throw new Error(`未知的自定义功能: ${name}`);
    }
}
```

#### 插件化架构
```javascript
// 创建对话框插件
class DialogPlugin {
    constructor(virtualDialogSystem) {
        this.system = virtualDialogSystem;
        this.init();
    }
    
    init() {
        // 注册自定义模板
        this.system.registerTemplate('plugin-dialog', this.getTemplate());
        
        // 添加自定义方法
        this.system.showPluginDialog = this.showPluginDialog.bind(this);
    }
    
    getTemplate() {
        return `
            <div class="virtual-dialog plugin-dialog" data-dialog-id="{{id}}">
                <div class="dialog-header">
                    <h3>{{title}}</h3>
                </div>
                <div class="dialog-content">
                    <div class="plugin-content">{{content}}</div>
                </div>
                <div class="dialog-footer">
                    {{#each buttons}}
                    <button class="dialog-button {{#if @first}}primary{{else}}secondary{{/if}}" data-choice="{{this}}">{{this}}</button>
                    {{/each}}
                </div>
            </div>
        `;
    }
    
    async showPluginDialog(config) {
        return await this.system.showDialog({
            template: 'plugin-dialog',
            ...config
        });
    }
}

// 注册插件
const plugin = new DialogPlugin(virtualDialogSystem);
```