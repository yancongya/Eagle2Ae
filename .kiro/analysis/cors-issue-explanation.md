# CORS 错误说明

## 🔍 错误信息

```
Access to fetch at 'file:///...' from origin 'null' has been blocked by CORS policy
```

## 📋 原因

当你直接用 `file://` 协议打开 HTML 文件时，浏览器的安全策略（CORS）会阻止加载其他本地文件。这是浏览器的安全机制。

## ✅ 解决方案

### 方案 1：使用开发服务器（推荐）⭐

这是最简单、最正确的方式：

```bash
# 在项目根目录运行
pnpm dev:web

# 然后在浏览器访问
http://localhost:5173/extensions/ae/
```

**优点：**
- ✅ 无 CORS 问题
- ✅ 支持热重载
- ✅ 完整的开发体验
- ✅ 控制台干净无错误

### 方案 2：使用内联 JSON（已实现）

项目已经实现了内联 JSON 回退机制，所以即使看到 CORS 错误，功能仍然正常。

**工作原理：**
1. 尝试通过 fetch 加载外部 JSON 文件
2. 如果失败（CORS 错误），自动回退到内联 JSON
3. 内联 JSON 在 `index.html` 中：
   ```html
   <script type="application/json" id="i18n-zh-CN">
   {...}
   </script>
   <script type="application/json" id="i18n-en-US">
   {...}
   </script>
   ```

**优点：**
- ✅ 功能正常工作
- ✅ 支持 file:// 协议
- ✅ 适合 CEP 扩展

**缺点：**
- ⚠️ 控制台会显示 CORS 错误（但不影响功能）
- ⚠️ 需要维护两份 i18n 数据（外部文件 + 内联）

### 方案 3：启动本地服务器（替代方案）

如果不想用 Vite 开发服务器，可以用其他简单的 HTTP 服务器：

```bash
# 使用 Python（如果已安装）
cd apps/eagle2ae_web/public/extensions/ae
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server apps/eagle2ae_web/public/extensions/ae -p 8000

# 然后访问
http://localhost:8000
```

### 方案 4：在 After Effects 中运行（CEP 扩展）

如果作为 CEP 扩展在 After Effects 中运行，不会有 CORS 问题，因为 CEP 有特殊的文件访问权限。

---

## 🎯 推荐使用场景

| 场景 | 推荐方案 | 说明 |
|------|---------|------|
| 开发和测试 | 方案 1（开发服务器） | 最佳开发体验 |
| 在 AE 中运行 | 方案 2（内联 JSON） | 自动回退，无需配置 |
| 快速演示 | 方案 1 或 3 | 避免 CORS 错误 |
| 生产环境 | 方案 2（内联 JSON） | CEP 扩展标准方式 |

---

## 🐛 如何判断功能是否正常

即使看到 CORS 错误，如果满足以下条件，说明功能正常：

1. ✅ 界面文字正确显示（中文或英文）
2. ✅ 语言切换功能正常
3. ✅ 控制台显示：`[i18n] 翻译加载成功`
4. ✅ 没有其他功能性错误

### 检查方法

在控制台输入：

```javascript
// 检查 i18n 是否加载
console.log('i18n 加载:', !!window.i18n);

// 检查翻译是否可用
console.log('翻译数据:', window.i18n.translations);

// 测试获取文本
console.log('测试文本:', window.i18n.getText('common.connected'));
```

如果都返回正确的值，说明功能正常，CORS 错误可以忽略。

---

## 📊 错误日志分析

### 正常的日志流程（file:// 协议）

```
1. [i18n] loadTranslations 开始，语言: zh-CN
2. ❌ CORS 错误（预期的，会被捕获）
3. [i18n] 回退到内联 JSON
4. [i18n] 翻译加载成功
5. ✅ 功能正常
```

### 异常的日志流程

```
1. [i18n] loadTranslations 开始，语言: zh-CN
2. ❌ CORS 错误
3. ❌ 内联 JSON 也失败
4. ❌ 翻译加载失败
5. ❌ 界面显示错误
```

如果是第二种情况，需要检查：
- 内联 JSON 是否存在
- JSON 格式是否正确
- 是否有其他 JavaScript 错误

---

## 🔧 开发建议

### 开发时

**始终使用开发服务器：**
```bash
pnpm dev:web
```

这样可以：
- 避免 CORS 问题
- 享受热重载
- 看到真实的错误（而不是 CORS 错误）

### 测试 CEP 扩展时

1. 在 After Effects 中测试
2. 或使用 CEP 调试工具
3. 不要直接用浏览器打开 file://

### 更新 i18n 时

记得同时更新：
1. 外部 JSON 文件（`js/i18n/*.json`）
2. 内联 JSON（`index.html` 中的 `<script>` 标签）

---

## ✨ 总结

**CORS 错误是正常的**，当你用 `file://` 协议打开 HTML 时。

**解决方法：**
- 开发时：使用 `pnpm dev:web`
- 生产时：内联 JSON 自动回退

**不需要担心**，只要功能正常工作即可。

如果想要完全消除 CORS 错误日志，唯一的方法是使用 HTTP 服务器而不是 file:// 协议。
