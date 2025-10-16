# Magic Portfolio - 内容管理 (详细指南)

**核心文件**: `src/resources/content.tsx`

这个文件是您网站所有文本内容的“控制中心”。几乎所有您在页面上看到的文字都是在这里定义的。

---

### 如何修改主页文本？

主页的大标题和描述段落由 `home` 对象控制。

- **修改大标题**: 编辑 `home.headline` 的值。
- **修改描述段落**: 编辑 `home.subline` 的值。

*示例: `src/resources/content.tsx`*
```javascript
const home = {
  // ...
  headline: <>这里是您的主页大标题</>,
  subline: (
    <>
      这里是您的描述性文字，
      <br /> 可以换行。
    </>
  ),
};
```

---

### 如何修改导航栏文本？

导航栏中每个按钮的显示文字由各个页面对象的 `label` 属性决定。

- **修改“关于”按钮文本**: 编辑 `about.label` 的值。
- **修改“作品”按钮文本**: 编辑 `work.label` 的值。
- **修改“博客”按钮文本**: 编辑 `blog.label` 的值。

*示例: `src/resources/content.tsx`*
```javascript
const about = {
  label: "关于我", // <-- 修改这里
  // ...
};

const work = {
  label: "我的作品", // <-- 修改这里
  // ...
};
```

---

### 如何修改页面标题 (浏览器标签)？

每个页面的浏览器标签页标题由各自页面对象的 `title` 属性控制。

- **修改主页标题**: 编辑 `home.title` 的值。
- **修改关于页标题**: 编辑 `about.title` 的值。

*示例: `src/resources/content.tsx`*
```javascript
const home = {
  title: "我的作品集 | 首页", // <-- 修改这里
  // ...
};
```

---

### 如何修改个人信息和社交链接？

- **个人信息**: 编辑 `person` 对象中的 `name`, `role`, `avatar` (头像图片路径), `email` 等字段。
- **社交链接**: `social` 是一个数组，您可以修改其中的 `link`，或者增删整个对象来改变页脚和关于页面的社交图标。

*示例: `src/resources/content.tsx`*
```javascript
const person = {
  name: `您的名字`,
  role: "您的职业",
  avatar: "/images/your-avatar.png", // 确保图片存在于 public/images/ 目录下
  email: "your.email@example.com",
  // ...
};

const social = [
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/your-username", // <-- 修改这里
  },
  // ...可以添加更多
];
```