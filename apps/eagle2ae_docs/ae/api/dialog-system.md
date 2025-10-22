### 智能对话框系统 *(v2.4.0新增)*

#### showSmartDialog()
显示智能对话框

```javascript
/**
 * 显示智能对话框，根据环境自动选择最佳实现
 * @param {string} type - 对话框类型 ('info'|'warning'|'error'|'confirm')
 * @param {string} title - 对话框标题
 * @param {string} message - 对话框消息
 * @param {Array<string>} buttons - 按钮文本数组
 * @param {Object} [options={}] - 额外选项
 * @returns {Promise<string>} 用户选择的按钮文本
 */
async function showSmartDialog(type, title, message, buttons, options = {})
```

**参数说明**:
- `type`: 对话框类型，影响图标和样式
- `title`: 对话框标题
- `message`: 对话框消息内容
- `buttons`: 按钮文本数组，如 ['确定', '取消']
- `options`: 额外选项
  - `defaultButton`: 默认按钮索引
  - `cancelButton`: 取消按钮索引
  - `modal`: 是否为模态对话框

**示例**:
```javascript
// 显示确认对话框
const result = await showSmartDialog(
    'confirm',
    '确认导入',
    '是否要导入这些文件？',
    ['确定', '取消']
);

if (result === '确定') {
    // 用户确认，继续操作
    await importFiles();
}
```

#### showStatusErrorDialog()
显示状态错误对话框

```javascript
/**
 * 显示状态错误对话框
 * @param {Object} statusResult - 状态检测结果
 * @returns {Promise<string>} 用户选择
 */
async function showStatusErrorDialog(statusResult)
```

#### showStatusSummaryDialog()
显示状态总结对话框

```javascript
/**
 * 显示状态总结对话框
 * @param {Object} statusResult - 状态检测结果
 * @returns {Promise<string>} 用户选择
 */
async function showStatusSummaryDialog(statusResult)
```
