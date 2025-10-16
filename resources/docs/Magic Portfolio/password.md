# Magic Portfolio - 密码保护 (详细指南)

---

### 如何为特定页面添加密码保护？

**第一步：配置受保护的路由**

打开 `src/resources/once-ui.config.ts` 文件，找到 `protectedRoutes` 对象。将您想要保护的页面路径作为键（key），并将其值设置为 `true`。

*示例: 保护 `/work/once-ui` 页面*
```javascript
// 位于 src/resources/once-ui.config.ts

const protectedRoutes: ProtectedRoutesConfig = {
  '/work/once-ui': true,
  '/blog/my-secret-post': true, // 您也可以添加其他路径
}; 
```
添加后，`RouteGuard` 组件将自动为这些页面启用密码验证。

---

### 如何设置您的密码？

**第二步：创建密码文件**

1.  在项目的根目录 (`magic-portfolio/`)下，找到 `.env.example` 文件。
2.  **复制**这个文件并将其重命名为 `.env.local`。 (注意：`.local` 文件不会被上传到 Git 仓库，保证了密码的安全)。

**第三步：在文件中设置密码**

打开您刚刚创建的 `.env.local` 文件，在里面写入您的密码。变量名必须是 `PAGE_ACCESS_PASSWORD`。

*示例: `.env.local`*
```
PAGE_ACCESS_PASSWORD=my_secret_password_123
```
将 `my_secret_password_123` 替换为您自己的强密码。

**第四步：重启服务器**

修改 `.env.local` 文件后，您**必须**重启开发服务器（`Ctrl+C` 后 `pnpm dev`），新的密码才会生效。