# AGENTS.md

本文档面向在本仓库工作的编码代理（Codex、Claude Code 等）。每次开始工作前先阅读本文件，并核对 `PROGRESS.md` 与 `FEATURES.md` 中记录的当前状态。

## 项目硬约束

1. 首期只支持简体中文，不引入国际化框架。
2. 优先使用 VitePress 原生能力和 Vue 组件，不增加不必要的运行时依赖。
3. 页面组件不得直接访问 IndexedDB，必须经过 `src/storage/` 的 Repository。
4. 判分、组卷、统计、数据校验和备份规则必须放在 `src/domain/` 与 `src/storage/` 的独立模块，并有测试。
5. 不得在页面中硬编码考试题量、分值、时长和知识域权重，这些参数必须从 `src/content/exam-blueprint.json` 读取。
6. 任何内容都必须标明官方或补充属性；未经核验的内容不得进入正式题库。
7. 不得声称原创练习题是腾讯云官方真题。
8. 不得提交真实 API Key、账号凭据或个人学习数据。
9. 每项功能完成后运行 `npm run typecheck`、相关测试和 `npm run docs:build`。
10. 修改考试记录结构前，先验证历史快照兼容性。

## 推荐开发顺序

1. 阅读 `AGENTS.md`、`IMPLEMENTATION_PLAN.md`、`PROGRESS.md`。
2. 确认分支、依赖、构建与测试状态。
3. 明确本次改动范围与验收条件。
4. 完成实现及对应测试。
5. 执行 `npm run typecheck && npm run test && npm run content:validate && npm run docs:build`。
6. 更新 `FEATURES.md` 与 `PROGRESS.md`。

## 目录职责

- `docs/`：VitePress 页面与课程正文。
- `src/content/`：课程元数据、题目与考试蓝图（结构化内容，以 Git 为事实来源）。
- `src/domain/`：组卷、判分、校验、统计等纯业务逻辑。
- `src/storage/`：IndexedDB 数据访问、迁移、备份。
- `tests/unit/`：单元测试；`tests/e2e/`：Playwright 端到端测试。
- `scripts/`：内容校验脚本。
