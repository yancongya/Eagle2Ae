# 虚拟对话框系统

## 概述

虚拟对话框系统（Virtual Dialog System）是 Eagle2Ae AE 扩展 v2.4.0 引入的全新功能模块，专为演示模式设计。该系统提供与真实对话框一致的用户体验，在不安装完整AE环境的情况下也能完整体验扩展的所有功能。

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

## API参考

### 构造函数

```javascript
/**
 * 虚拟对话框系统构造函数
 * @param {Object} options - 配置选项
 * @param {boolean} options.enabled - 是否启用虚拟对话框系统
 * @param {string} options.mode - 运行模式 ('auto' | 'always' | 'never')
 * @param {string} options.simulationStrategy - 模拟策略 ('random' | 'smart' | 'preference')
 * @param {number} options.autoCloseDelay - 自动关闭延迟（毫秒）
 * @param {number} options.defaultDelay - 默认模拟延迟（毫秒）
 * @param {Object} options.templates - 自定义模板
 * @param {Object} options.userPreferences - 用户偏好设置
 */
constructor(options = {})
```

### 核心方法

#### showDialog()
显示虚拟对话框

```javascript
/**
 * 显示虚拟对话框
 * @param {Object} config - 对话框配置
 * @param {string} config.type - 对话框类型 ('alert' | 'confirm' | 'prompt')
 * @param {string} config.title - 对话框标题
 * @param {string} config.message - 对话框消息
 * @param {string} config.details - 对话框详细信息
 * @param {Array<string>} config.buttons - 按钮列表
 * @param {string} config.defaultValue - 默认值（用于prompt对话框）
 * @param {string} config.placeholder - 占位符（用于prompt对话框）
 * @param {string} config.template - 自定义模板名称
 * @param {number} config.delay - 模拟延迟（毫秒）
 * @param {number} config.autoClose - 自动关闭延迟（毫秒）
 * @param {Object} config.preferences - 用户偏好设置
 * @param {boolean} config.autoSimulate - 是否自动模拟用户选择
 * @param {string} config.context - 上下文信息
 * @param {string} config.warningLevel - 警告级别
 * @returns {Promise<string|number|null>} 用户选择结果
 */
async showDialog(config)
```

#### simulateUserChoice()
模拟用户选择

```javascript
/**
 * 模拟用户选择
 * @param {Array<string>} buttons - 可选按钮
 * @param {Object} preferences - 选择偏好
 * @returns {string|number|null} 模拟的选择结果
 */
simulateUserChoice(buttons, preferences = {})
```

#### registerTemplate()
注册自定义模板

```javascript
/**
 * 注册自定义对话框模板
 * @param {string} name - 模板名称
 * @param {string} template - 模板内容
 */
registerTemplate(name, template)
```

#### setUserPreferences()
设置用户偏好

```javascript
/**
 * 设置用户偏好
 * @param {Object} preferences - 用户偏好设置
 */
setUserPreferences(preferences)
```

#### shouldShowVirtualDialog()
检查是否应该显示虚拟对话框

```javascript
/**
 * 检查是否应该显示虚拟对话框
 * @returns {boolean} 是否应该显示虚拟对话框
 */
shouldShowVirtualDialog()
```

#### showRealDialog()
显示真实对话框（降级方案）

```javascript
/**
 * 显示真实对话框（作为降级方案）
 * @param {Object} config - 对话框配置
 * @returns {Promise<any>} 真实对话框的结果
 */
async showRealDialog(config)
```

### 辅助方法

#### createDialogElement()
创建对话框元素

```javascript
/**
 * 创建对话框元素
 * @param {Object} dialogConfig - 对话框配置
 * @returns {HTMLElement} 对话框元素
 */
createDialogElement(dialogConfig)
```

#### getDefaultTemplate()
获取默认模板

```javascript
/**
 * 获取默认模板
 * @param {string} type - 对话框类型
 * @param {Object} data - 数据
 * @returns {string} HTML模板
 */
getDefaultTemplate(type, data)
```

#### analyzeButtonSemantic()
分析按钮语义

```javascript
/**
 * 分析按钮语义
 * @param {string} buttonText - 按钮文本
 * @returns {Object} 语义分析结果
 */
analyzeButtonSemantic(buttonText)
```

#### preferenceBasedChoice()
基于用户偏好的选择

```javascript
/**
 * 基于用户偏好的选择
 * @param {Array<string>} buttons - 可选按钮
 * @param {Object} preferences - 选择偏好
 * @returns {string} 选择结果
 */
preferenceBasedChoice(buttons, preferences)
```

#### closeDialog()
关闭对话框

```javascript
/**
 * 关闭对话框
 * @param {string} dialogId - 对话框ID
 * @param {string|number|null} choice - 用户选择
 */
closeDialog(dialogId, choice)
```

#### bindDialogEvents()
绑定对话框事件

```javascript
/**
 * 绑定对话框事件
 * @param {HTMLElement} dialogContainer - 对话框容器
 * @param {Object} dialogConfig - 对话框配置
 */
bindDialogEvents(dialogContainer, dialogConfig)
```

## 使用示例

### 基本使用

```javascript
// 创建虚拟对话框系统实例
const virtualDialogSystem = new VirtualDialogSystem({
    enabled: true,
    mode: 'auto',
    simulationStrategy: 'smart'
});

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

### 高级使用

```javascript
// 显示带详细信息的警告对话框
const warningChoice = await virtualDialogSystem.showDialog({
    type: 'confirm',
    title: '⚠️ 重要警告',
    message: '此操作不可逆，请谨慎操作',
    details: '删除的文件将无法恢复',
    buttons: ['继续', '取消'],
    context: 'delete',
    warningLevel: 'high',
    preferences: {
        userPreferences: {
            'button.继续': '继续',
            'button.取消': '取消'
        }
    }
});

// 根据用户选择执行不同操作
switch (warningChoice) {
    case '继续':
        console.log('用户选择继续操作');
        // 执行删除操作
        break;
    case '取消':
        console.log('用户选择取消操作');
        // 取消删除操作
        break;
    default:
        console.log('用户未做选择或对话框被关闭');
        // 默认取消操作
}
```

### 自定义模板使用

```javascript
// 注册自定义模板
virtualDialogSystem.registerTemplate('custom-warning', `
    <div class="virtual-dialog custom-warning-dialog" data-dialog-id="{{id}}">
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
            <button class="dialog-button {{#if @first}}primary{{else}}secondary{{/if}}" data-choice="{{this}}">{{this}}</button>
            {{/each}}
        </div>
    </div>
`);

// 使用自定义模板显示对话框
const customResult = await virtualDialogSystem.showDialog({
    template: 'custom-warning',
    title: '自定义警告',
    message: '这是一个使用自定义模板的警告对话框',
    details: '自定义模板提供了更大的灵活性和个性化能力',
    buttons: ['确定', '取消']
});
```

### 用户偏好设置

```javascript
// 设置用户偏好
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

// 使用偏好设置显示对话框
const preferenceResult = await virtualDialogSystem.showDialog({
    type: 'confirm',
    title: '保存项目',
    message: '项目已修改，是否保存更改？',
    buttons: ['保存', '不保存', '取消']
});

// 根据用户偏好，可能会自动选择"保存"
console.log(`偏好选择结果: ${preferenceResult}`);
```

## 最佳实践

### 性能优化

1. **合理使用缓存**
   ```javascript
   // 对于频繁显示的对话框，使用模板缓存
   const dialogTemplate = virtualDialogSystem.templateCache.get('confirm-dialog');
   if (!dialogTemplate) {
       // 创建新模板并缓存
       const newTemplate = virtualDialogSystem.createDialogTemplate(config);
       virtualDialogSystem.templateCache.set('confirm-dialog', newTemplate);
   }
   ```

2. **避免重复DOM操作**
   ```javascript
   // 批量处理DOM操作
   const fragment = document.createDocumentFragment();
   dialogElements.forEach(element => {
       fragment.appendChild(element);
   });
   document.body.appendChild(fragment);
   ```

3. **优化事件绑定**
   ```javascript
   // 使用事件委托减少事件监听器数量
   dialogContainer.addEventListener('click', (event) => {
       if (event.target.classList.contains('dialog-button')) {
           const choice = event.target.dataset.choice;
           this.closeDialog(dialogId, choice);
       }
   });
   ```

### 用户体验优化

1. **合理的延迟设置**
   ```javascript
   // 根据对话框类型设置不同的延迟
   const delays = {
       'alert': 500,
       'confirm': 1000,
       'prompt': 1500,
       'warning': 2000
   };
   
   const delay = delays[config.type] || 1000;
   ```

2. **智能按钮选择**
   ```javascript
   // 根据按钮语义智能选择默认按钮
   const primaryButton = buttons.find(button => 
       button.includes('确定') || 
       button.includes('保存') || 
       button.includes('继续')
   ) || buttons[0];
   ```

3. **清晰的视觉反馈**
   ```css
   /* 添加悬停和焦点状态 */
   .dialog-button:hover {
       background: #333;
       transform: translateY(-1px);
   }
   
   .dialog-button:focus {
       outline: 2px solid #0078d4;
       outline-offset: 2px;
   }
   ```

### 错误处理

1. **优雅降级**
   ```javascript
   // 当虚拟对话框系统不可用时降级到真实对话框
   async showDialog(config) {
       try {
           if (this.shouldShowVirtualDialog()) {
               return await this.showVirtualDialog(config);
           } else {
               return await this.showRealDialog(config);
           }
       } catch (error) {
           // 如果虚拟对话框失败，降级到真实对话框
           console.warn('虚拟对话框显示失败，降级到真实对话框:', error);
           return await this.showRealDialog(config);
       }
   }
   ```

2. **详细的错误日志**
   ```javascript
   // 记录详细的错误信息
   catch (error) {
       this.log(`显示对话框失败: ${error.message}`, 'error');
       this.log(`配置信息: ${JSON.stringify(config)}`, 'debug');
       this.log(`堆栈信息: ${error.stack}`, 'debug');
   }
   ```

3. **用户友好的错误提示**
   ```javascript
   // 提供用户友好的错误信息
   if (error.message.includes('template')) {
       this.showUserFriendlyError('模板加载失败', '请检查自定义模板语法是否正确');
   } else if (error.message.includes('event')) {
       this.showUserFriendlyError('事件绑定失败', '请重新启动扩展后重试');
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