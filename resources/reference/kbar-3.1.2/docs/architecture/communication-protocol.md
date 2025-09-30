# 通信协议

KBar 扩展的前端（JavaScript，运行于 CEP 环境）与后端（JSX，运行于 After Effects 宿主环境）之间的通信是单向的，遵循 CEP 的标准 `evalScript` 模式。

## 通信方向

*   **前端 -> 后端**: 这是主要的通信方式。
*   **后端 -> 前端**: CEP 支持从 JSX 向 JS 发送事件，但在此项目的分析中，没有明确的证据表明 KBar 严重依赖此种方式。主要的数据流是从前端发起请求，后端执行任务。

## 前端到后端 (JS -> JSX)

前端通过 `CSInterface` 对象与宿主进行通信。`CSInterface` 是 Adobe CEP 库提供的核心 API。

### 核心方法: `evalScript()`

所有对 After Effects 的操作请求都是通过调用 `CSInterface.evalScript()` 方法发起的。

*   **语法**:
    ```javascript
    var cs = new CSInterface();
    cs.evalScript('functionName("parameter1", "parameter2")', callbackFunction);
    ```

*   **工作流程**:
    1.  **构建脚本字符串**: 前端 JavaScript 根据用户操作，动态构建一个包含要执行的 JSX 函数名和参数的字符串。
    2.  **调用 `evalScript`**: 将构建好的脚本字符串作为第一个参数传递给 `evalScript`。
    3.  **宿主环境执行**: After Effects 的 JSX 引擎接收到该字符串，并像执行普通脚本一样执行它。这会调用到 `all.jsxbin` 中对应的函数。
    4.  **返回值处理**: JSX 函数执行完毕后，可以返回一个值（通常是字符串或序列化后的 JSON）。这个返回值会通过 `evalScript` 的第二个参数——回调函数——异步地返回给前端 JavaScript。

### 示例 (推测)

当用户点击一个配置为“运行菜单命令”的按钮时，通信流程可能如下：

1.  **JS 端 (`toolbar.js`)**:
    ```javascript
    // 用户点击按钮，按钮绑定的数据中包含命令ID: 2083
    const commandId = 2083;

    // 构建脚本字符串
    const script = `KBar.runMenuCommand(${commandId})`; // "KBar.runMenuCommand" 是在 all.jsxbin 中定义的全局函数

    // 调用 evalScript
    const cs = new CSInterface();
    cs.evalScript(script, (result) => {
        if (result === 'success') {
            console.log('菜单命令执行成功');
        } else {
            console.error('菜单命令执行失败:', result);
        }
    });
    ```

2.  **JSX 端 (`all.jsxbin`)**:
    ```jsx
    // all.jsxbin 中包含的等效逻辑
    var KBar = {
        runMenuCommand: function(id) {
            try {
                app.executeCommand(id);
                return 'success'; // 返回执行结果
            } catch (e) {
                return e.toString(); // 返回错误信息
            }
        }
    };
    ```

这个单向的、基于 `evalScript` 的协议是 CEP 扩展的标准实践，它清晰地分离了 UI 逻辑和宿主操作。
