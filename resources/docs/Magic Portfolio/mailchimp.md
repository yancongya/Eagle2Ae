# Magic Portfolio - Mailchimp 集成 (详细指南)

---

### 如何配置邮件订阅功能？

Mailchimp 的集成主要涉及两个文件：一个用于控制显示和内容，另一个用于连接到您的账户。

---

#### 第一步: 控制显示和文本内容

**核心文件**: `src/resources/content.tsx`

打开此文件并找到 `newsletter` 对象。

- **显示/隐藏**: 将 `display` 属性设置为 `true` 或 `false` 可以在网站上显示或隐藏邮件订阅表单。
- **修改文本**: 编辑 `title` 和 `description` 属性来更改表单区域显示的标题和描述文字。

*示例: `src/resources/content.tsx`*
```javascript
const newsletter = {
  display: true, // 设置为 false 来隐藏
  title: <>订阅我的周报</>,
  description: (
    <>
      我会不定期分享关于设计和技术的文章。
    </>
  ),
}; 
```

---

#### 第二步: 连接到您的 Mailchimp 账户

**核心文件**: `src/resources/once-ui.config.ts`

1.  登录您的 Mailchimp 账户。
2.  进入 "Audience" -> "Signup forms"，然后选择 "Embedded forms"。
3.  在表单代码中，找到 `action` 属性，它看起来像一长串 URL。
4.  **复制**这整个 URL。
5.  打开 `src/resources/once-ui.config.ts` 文件，找到 `mailchimp` 对象，并将您复制的 URL 粘贴为 `action` 的值。

*示例: `src/resources/once-ui.config.ts`*
```javascript
const mailchimp = {
  action: 'https://your-account.us1.list-manage.com/subscribe/post?u=...&id=...', // <-- 粘贴在这里
  effects: {
    ...
  }
}; 
```
完成以上步骤后，您网站上的表单就可以将订阅者添加到您自己的 Mailchimp 列表中了。