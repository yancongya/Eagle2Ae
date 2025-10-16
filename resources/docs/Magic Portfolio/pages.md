# Magic Portfolio - 页面管理 (详细指南)

**核心文件**: `src/resources/once-ui.config.ts` 和 `src/app/` 目录

---

### 如何启用或禁用现有页面？

网站的导航和可访问页面由 `src/resources/once-ui.config.ts` 文件中的 `routes` 对象统一管理。

将一个页面的值设置为 `true` 会在导航栏中显示它，并允许访问。设置为 `false` 则会隐藏并禁止访问。

*示例: 禁用 `/gallery` 页面*
```javascript
// 位于 src/resources/once-ui.config.ts

const routes: RoutesConfig = {
  '/':        true,
  '/about':   true,
  '/work':    true,
  '/blog':    true,
  '/gallery': false, // <-- 将这里改为 false
  '/ae':      true,
  '/eagle':   true,
};
```

---

### 如何添加一个全新的页面？

添加一个新页面（例如，一个名为 “联系我” 的页面，URL为 `/contact`）需要遵循以下步骤：

**第一步：创建页面文件**
在 `src/app/` 目录下创建一个新的文件夹，命名为您想要的URL，例如 `contact`。
然后，在这个新文件夹 (`src/app/contact/`) 中创建一个 `page.tsx` 文件。这是您的页面内容。

*示例: `src/app/contact/page.tsx`*
```jsx
export default function ContactPage() {
  return (
    <div>
      <h1>联系我</h1>
      <p>这里是联系方式...</p>
    </div>
  );
}
```

**第二步：注册新页面的路由**
打开 `src/resources/once-ui.config.ts` 文件，在 `routes` 对象中添加您的新路径。

```javascript
const routes: RoutesConfig = {
  // ... 其他路由
  '/gallery': false,
  '/ae':      true,
  '/eagle':   true,
  '/contact': true, // <-- 在这里添加新行
};
```

**第三步 (可选): 在导航栏添加入口**
如果您希望在顶部导航栏也显示这个新页面的按钮，您需要修改 `src/components/Header.tsx` 文件，模仿 “About”、“Work” 等按钮的结构，添加一个新的 `ToggleButton`。