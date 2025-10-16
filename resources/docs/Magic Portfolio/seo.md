# Magic Portfolio - SEO (详细指南)

**核心文件**: `src/resources/content.tsx` 和 `src/resources/once-ui.config.ts`

---

### SEO是如何工作的？

这个模板会自动根据您在 `content.tsx` 中填写的内容，为每个页面生成有利于搜索引擎收录的 `meta` 标签、`Schema` 结构化数据以及 `Open Graph` 标签（用于社交媒体分享）。

您需要关注以下几个关键点来优化您网站的SEO。

---

### 如何修改页面标题和描述？

搜索引擎结果中显示的标题和描述，由 `src/resources/content.tsx` 文件中每个页面对象（如 `home`, `about` 等）的 `title` 和 `description` 属性控制。

*示例: 修改主页的SEO信息*
```javascript
// 位于 src/resources/content.tsx
const home = {
  // ...
  title: "您的网站标题 | 您的名字",
  description: "关于您网站的一段简短、吸引人的描述。",
  // ...
};
```

---

### 如何修改社交分享预览图？

当您在社交媒体上分享您的**主页**时，显示的预览图是 `public/images/og/home.jpg`。

- **修改方法**: 直接替换这个文件为您自己的图片。推荐尺寸为 1200x630 像素。

对于其他页面（如博客、作品），分享图是根据页面标题自动生成的。

---

### **(重要)** 如何设置您的网站域名？

为了让所有自动生成的链接都指向您的正确域名，您**必须**修改 `src/resources/once-ui.config.ts` 文件中的 `baseURL` 变量。

*示例: `src/resources/once-ui.config.ts`*
```javascript
// 将这里的地址替换为您自己的最终域名
const baseURL: string = "https://your-domain.com";
```
**忘记修改此项会导致您网站的SEO效果大打折扣。**