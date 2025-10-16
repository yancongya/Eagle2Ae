# Magic Portfolio - 作品 (Work) (详细指南)

**核心目录**: `src/app/work/projects/`

---

### 作品集管理的核心原理

您的每一个“作品”都对应 `src/app/work/projects/` 目录下的一个独立的 `.mdx` 文件。整个作品集系统是完全由文件驱动的。

- **添加新作品**: 在该目录下创建一个新的 `.mdx` 文件 (例如 `my-new-project.mdx`)。
- **删除作品**: 直接删除对应的 `.mdx` 文件。
- **修改作品**: 编辑对应的 `.mdx` 文件。

---

### 文件结构详解

每个 `.mdx` 文件由两部分组成：`Frontmatter` (文件头信息) 和 `MDX` (正文内容)。

#### Frontmatter (文件头信息)

这部分位于文件顶部，由 `---` 包裹，用于定义项目的核心数据。

*示例: `src/app/work/projects/project-1.mdx`*
```yaml
---
title: "项目标题"
publishedAt: "2025-03-17"
summary: "显示在作品列表页的简短描述。"
images:
- "/images/projects/project-01/cover-02.jpg"
- "/images/projects/project-01/image-03.jpg"
team:
- name: "Lorant One"
  role: "Software Engineer"
  avatar: "/images/avatar.jpg"
  linkedIn: "https://www.linkedin.com/company/once-ui/"
link: "https://once-ui.com/"
---
```

**字段说明:**
- `title`: **(必须)** 项目的标题。
- `publishedAt`: **(必须)** 发布日期，用于排序。
- `summary`: **(必须)** 项目的简短摘要，会显示在主页或 `/work` 页面的项目卡片上。
- `images`: **(可选)** 一个图片路径列表，这些图片会展示在项目详情页中。路径应指向 `public/` 目录下的图片。
- `team`: **(可选)** 参与该项目的团队成员列表。
- `link`: **(可选)** 指向该项目实际线上版本的外部链接。

#### MDX (正文内容)

在 `---` 分隔符下方，您可以像写普通 Markdown 文件一样编写项目的详细介绍，并可以嵌入 React 组件，提供了极高的灵活性。