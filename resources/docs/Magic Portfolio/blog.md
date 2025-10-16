# Magic Portfolio - 博客 (Blog) (详细指南)

**核心目录**: `src/app/blog/posts/`

---

### 博客文章管理的核心原理

您的每一篇“博客文章”都对应 `src/app/blog/posts/` 目录下的一个独立的 `.mdx` 文件。整个博客系统与作品集一样，是完全由文件驱动的。

- **添加新文章**: 在该目录下创建一个新的 `.mdx` 文件 (例如 `my-new-post.mdx`)。
- **删除文章**: 直接删除对应的 `.mdx` 文件。
- **修改文章**: 编辑对应的 `.mdx` 文件。

---

### 文件结构详解

每个 `.mdx` 文件由两部分组成：`Frontmatter` (文件头信息) 和 `MDX` (正文内容)。

#### Frontmatter (文件头信息)

这部分位于文件顶部，由 `---` 包裹，用于定义文章的元数据。

*示例: `src/app/blog/posts/post-1.mdx`*
```yaml
---
title: "文章标题"
publishedAt: "2024-04-08"
image: "/images/gallery/img-02.jpg"
summary: "显示在博客列表页的简短描述。"
tag: "分类标签"
---
```

**字段说明:**
- `title`: **(必须)** 文章的标题。
- `publishedAt`: **(必须)** 发布日期，用于排序。
- `image`: **(可选)** 文章的封面图。路径应指向 `public/` 目录下的图片。
- `summary`: **(必须)** 文章的简短摘要，会显示在 `/blog` 页面的文章卡片上。
- `tag`: **(可选)** 文章的分类标签。

#### MDX (正文内容)

在 `---` 分隔符下方，您可以像写普通 Markdown 文件一样编写文章的详细内容，并可以嵌入 React 组件。