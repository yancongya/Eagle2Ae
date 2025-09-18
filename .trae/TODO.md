# TODO:

- [x] 9: 在index.html中添加DatabaseService.js的script标签引用 (priority: High)
- [x] 10: 修改DatabaseService.js为全局类定义，移除module.exports (priority: High)
- [x] 11: 修改main.js中testDatabaseAccess方法，直接使用全局DatabaseService类 (priority: High)
- [x] 12: 测试修复后的CEP环境模块加载功能 (priority: Medium)

---
### 待办：移除“调试测试”按钮功能

**原因**: 此功能已决定废弃。

**操作步骤**:

1.  **移除HTML按钮**:
    *   **文件**: `Eagle2Ae-Ae/index.html`
    *   **操作**: 删除以下按钮元素：
      ```html
      <button id="debug-test-btn" class="icon-btn" title="调试和测试">🔧</button>
      ```

2.  **移除JavaScript逻辑**:
    *   **文件**: `Eagle2Ae-Ae/js/main.js`
    *   **操作**:
        *   在 `setupUI()` 函数中，删除为 `#debug-test-btn` 绑定的事件监听器。
        *   删除以下几个完整的函数定义：
            *   `runDebugAndTest()`
            *   `testNodeJSConnection()`
            *   `performNodeJSDiagnostics()`
            *   `performAdvancedDiagnostics()`
            *   `debugCEPEnvironment()`