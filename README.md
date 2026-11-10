# learn-FDE

腾讯云 ADP FDE 认证学习与能力训练站（简体中文）。

learn-FDE 是独立的学习与模拟练习项目，用于整理公开课程知识、训练企业级 Agent 交付能力并记录个人学习过程。项目与腾讯云官方认证无隶属关系，不提供真实考试题，不承诺认证结果。

## 功能

- **课程学习**：四大官方模块 + 补充训练专题，含学习目标、知识讲解、流程图、业务案例、误区、自测题与来源。
- **专项练习**：按知识域、章节、题型、难度筛选，答题后即时查看解析。
- **模拟考试**：按官方公开蓝图组卷（60 题 / 单选 40 / 多选 20 / 90 分钟 / 100 分 / 70 分合格），支持倒计时、答题卡、标记、刷新恢复、自动交卷、成绩与知识域报告。
- **题库浏览**：搜索、筛选、收藏、查看解析、加入错题本。
- **学习记录**：课程进度、练习与考试记录、错题、收藏、JSON 导出/导入、清空确认。
- **资源中心**：术语表、交付模板、检查清单、官方资料入口。

所有学习数据仅保存在当前浏览器（IndexedDB），不会上传到任何服务器。

## 本地开发

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

## 部署

推送 `main` 分支后，GitHub Actions 会自动执行类型检查、单元测试、内容校验、构建并部署到 GitHub Pages：

`https://zhouminghan.github.io/learn-fde/`

详细说明见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 内容维护

课程、题库与考试蓝图的内容维护方式见 [CONTENT_MAINTENANCE.md](./CONTENT_MAINTENANCE.md)。

## 免责声明

- 模拟考试题目为根据公开知识点设计的原创练习，非腾讯云官方真题。
- 模拟成绩不代表腾讯云官方成绩或认证结果。
- 多选题按官方指南“错选、漏选不得分”判分，learn-FDE 实现为完全匹配计分。
- 官方参数以腾讯云认证详情页最新公开信息为准，本项目会记录核验日期。
