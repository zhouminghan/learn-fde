# Learning FDE

Learning FDE 是一个简体中文的 FDE（腾讯云 ADP 前沿部署工程师）学习与实战训练平台。项目以 VitePress 构建，内置结构化课程、可视化讲解、交互式 FDE 实验室、专项练习和模拟考试，帮助学习者把 FDE 技术体系转化为可交付的企业级 Agent 能力。

在线访问：[https://zhouminghan.github.io/learn-fde/](https://zhouminghan.github.io/learn-fde/)

## 核心能力

- **结构化课程**：覆盖官方四大模块与补充专题，包含学习目标、知识讲解、架构图、流程图、业务案例、误区和自测题。
- **FDE 实验室**：以企业 IT 服务台智能助手为案例，逐步模拟 Agent 的意图识别、知识检索、工具调用、Workflow、人工审批与评测。
- **专项练习**：按知识域、章节、题型和难度筛选，答题后即时查看解析。
- **模拟考试**：按官方公开蓝图组卷（60 题 / 单选 40 / 多选 20 / 90 分钟 / 100 分 / 70 分合格），支持倒计时、答题卡、标记、刷新恢复、自动交卷与知识域报告。
- **题库浏览**：搜索、筛选、收藏、查看解析与加入错题本。
- **学习记录**：课程进度、练习与考试记录、错题、收藏，以及本地 JSON 导出/导入。

所有学习数据仅保存在当前浏览器（IndexedDB），不会上传到任何服务器。

## 课程体系

- 第一部分：AI 和 Agent 基础
- 第二部分：ADP 产品能力
- 第三部分：使用 ADP 开发智能体
- 第四部分：评测与优化智能体
- 补充训练专题：场景理解、行业方案、交付运维、安全合规、方案表达

## 技术栈

VitePress · Vue 3 · TypeScript · Markdown/JSON · IndexedDB（Dexie） · Mermaid · Vitest · Playwright · GitHub Actions · GitHub Pages。

## 本地运行

```bash
npm install
npm run dev          # http://localhost:5173/learn-fde/
```

## 常用命令

```bash
npm run typecheck        # vue-tsc --noEmit
npm run test             # vitest run（单元测试）
npm run test:e2e         # playwright test（端到端测试）
npm run content:validate # 题目与考试蓝图结构校验
npm run docs:build       # 生产构建
npm run docs:preview     # 预览生产构建
```

## 项目结构

```text
docs/                  # VitePress 页面、课程正文与主题组件
src/content/           # 课程元数据、题库、考试蓝图与实验室案例
src/domain/            # 组卷、判分、评测、统计、实验执行等纯业务逻辑
src/storage/           # IndexedDB 数据访问、迁移与备份
tests/unit/            # 单元测试
tests/e2e/             # Playwright 端到端测试
scripts/               # 内容校验脚本
```

## 内容来源

- 课程目录与考试参数以腾讯云官方考试指南和认证详情页为准，并记录核验日期。
- 题目为根据公开知识点设计的原创练习，非腾讯云官方真题。
- 补充专题与实验室案例均为原创演示内容，使用虚构的企业与数据。

## 免责声明

- 模拟考试题目为原创练习，非腾讯云官方真题。
- 模拟成绩不代表腾讯云官方成绩或认证结果。
- 多选题按官方指南“错选、漏选不得分”判分，learn-fde 实现为完全匹配计分。
- 学习数据仅保存在用户浏览器本地。

## 部署

推送 `main` 分支后，GitHub Actions 自动执行类型检查、单元测试、内容校验、构建并部署到 GitHub Pages。详见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

内容维护方式见 [CONTENT_MAINTENANCE.md](./CONTENT_MAINTENANCE.md)。
