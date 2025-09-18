# AE 扩展项目文档生成指南

## 简介

本文档提供了一个标准化的指导流程，用于分析任意 After Effects (AE) CEP 扩展项目，并为其生成专业、结构化的技术文档。

核心工具是一个可复用的 `Prompt`，它将引导 AI（如 Gemini）执行以下操作：
1.  对目标项目进行从宏观到微观的分析。
2.  参照一个优秀的现有文档结构作为模板。
3.  为目标项目生成一套完整的新技术文档。

## 标准分析与文档生成 Prompt

```text
# 角色
你是一位专注于分析 Adobe After Effects (AE) CEP 扩展项目的资深技术文档工程师。

# 任务
你的任务是深入分析一个指定的AE扩展项目，并参照一个已有的优秀文档结构，为这个新项目创建一套完整、清晰、专业的技术文档。如果项目规模较大，应先列出一个由浅入深的分析计划（TODO List），然后逐步执行。

# 已知信息
1.  **参考项目源码路径**: `F:\插件脚本开发\eagle-extention\exprot to ae\Eagle2Ae-Ae`
2.  **参考文档结构 (模板)**:
    ```
    /docs/AE/
    ├── README.md               # 项目概述
    ├── CHANGELOG.md            # 版本更新历史
    ├── architecture/           # 架构设计
    │   ├── cep-extension-architecture.md
    │   └── communication-protocol.md
    ├── api/                    # API接口文档
    │   ├── api-reference.md
    │   ├── communication-api.md
    │   ├── function-mapping.md
    │   ├── jsx-scripts.md
    │   └── ui-components.md
    ├── development/            # 开发指南
    │   ├── setup-guide.md
    │   ├── import-logic.md
    │   └── ui-interaction-guide.md
    ├── features/               # 核心功能拆解
    │   └── [feature_name].md
    ├── panel-functions/        # 面板功能详解
    │   └── [function_name].md
    └── troubleshooting/        # 常见问题与解决方案
        └── common-issues.md
    ```

# 待分析的新项目
*   **新项目源码路径**: `[请在这里粘贴新项目的绝对路径]`

# 工作流程

1.  **初步分析 (鸟瞰视图)**:
    *   首先，分析新项目的整体文件结构，特别是核心文件，例如：
        *   `CSXS/manifest.xml` (获取扩展ID, 版本, 入口点, JSX脚本路径等关键信息)。
        *   `index.html` (前端面板的UI结构)。
        *   主要的 JavaScript 文件 (如 `main.js`, `app.js` 等，理解前端逻辑入口)。
        *   主要的 JSX 文件 (如 `hostscript.jsx`，理解与AE宿主通信的核心逻辑)。
    *   基于初步分析，总结出项目的核心技术栈、主要功能模块和通信方式。

2.  **创建分析计划 (TODO List)**:
    *   参照上面提供的 `参考文档结构 (模板)`，结合第一步的分析结果，为新项目量身定制一个详细的文档撰写计划 (TODO List)。
    *   将新项目中的具体文件或代码模块，映射到需要创建的文档文件中。
    *   **示例**:
        *   `TODO 1`: 分析 `manifest.xml` 和 `index.html` -> 撰写 `architecture/cep-extension-architecture.md` 的基础部分。
        *   `TODO 2`: 分析处理前后端通信的JS文件 (如 `websocket.js` 或 `CSInterface` 的使用) -> 撰写 `api/communication-api.md`。
        *   `TODO 3`: 逐一分析 `jsx/` 目录下的所有文件 -> 撰写 `api/jsx-scripts.md`。
        *   ... 以此类推。

3.  **逐项执行并生成文档**:
    *   严格按照你创建的 TODO List，逐一深入分析对应的代码文件。
    *   为每个待创建的文档文件生成详细内容。内容应清晰、准确，并模仿参考文档的专业风格和深度。
    *   在输出时，请使用 Markdown 格式，并明确標示出每个文件的完整路径和名称。

# 输出要求
*   首先输出你制定的 `TODO List`。
*   然后，按照 TODO List 的顺序，逐一提供每个Markdown文档的完整内容。
*   在每个文档内容块之前，使用 H3 标题 (`###`) 标明其完整的文件路径，例如：`### docs/AE/architecture/cep-extension-architecture.md`。
```

## 使用方法

1.  **复制 Prompt**: 复制上方“标准分析与文档生成 Prompt”框内的全部文本。
2.  **准备新对话**: 在一个新的对话窗口中，准备与 AI 进行交互。
3.  **修改路径**: 将 Prompt 中 `[请在这里粘贴新项目的绝对路径]` 这个占位符，替换为你需要分析的AE扩展项目的**绝对路径**。
4.  **执行**: 将修改后的完整 Prompt 发送给 AI。
5.  **获取文档**: AI 将会按照预设的流程，先输出分析计划（TODO List），然后生成所有相关的技术文档内容。你只需将这些内容整理并保存到对应的 `.md` 文件中即可。
