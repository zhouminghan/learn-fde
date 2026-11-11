# 进度记录

最后更新：2026-11-10（含 GitHub Pages 线上部署与验收）

## 已完成

- **Phase 0 项目骨架**：VitePress + Vue 3 + TypeScript 工程、自定义主题、三态主题切换、顶部品牌导航与 GitHub 链接、GitHub Actions Pages 工作流均已就绪。
- **Phase 1 课程内容与进度**：24 篇章节（19 官方 + 5 补充）、章节导航、上一篇/下一篇、完成状态与 IndexedDB 进度持久化完成。
- **Phase 2 题库与专项练习**：78 道已发布题目、题目结构校验、单选/多选组件、即时解析、题库搜索/筛选/收藏/错题本完成。
- **Phase 3 模拟考试引擎**：考试蓝图、约束组卷、倒计时、答题卡、标记、刷新恢复、超时/主动交卷、成绩与知识域报告完成。
- **Phase 4 学习分析与资源中心**：课程进度、练习/考试统计、错题、收藏、JSON 导出/导入、清空确认、资源中心完成。
- **Phase 5 体验优化**：浅色/深色/跟随系统主题、移动端抽屉导航、键盘焦点可见、窄屏无横向溢出完成。

## 验证证据

```text
npm run typecheck          退出码 0
npm run test               23 passed（5 个测试文件）
npm run content:validate   退出码 0（78 道题，7 个知识域容量全部 OK）
npm run docs:build         退出码 0
npx playwright test        76 passed（desktop + mobile）
横向溢出回归               layout.spec.ts：7 路由 x 4 视口，无横向溢出
GitHub Actions             42807345206：build 33s + deploy 3m55s，成功
线上验收                   PLAYWRIGHT_BASE_URL=线上 Pages，76 passed
资源与控制台检查            关键页面无 404 请求、无控制台错误
```

部署地址：`https://zhouminghan.github.io/learn-fde/`

## 部署状态

- 仓库已重命名为小写 `learn-fde`（原空仓库 `learn-FDE`）。
- 默认分支为 `main`，GitHub Pages 来源已设为 `GitHub Actions`。
- 本地 `main` 分支已推送并跟踪 `origin/main`。

## 未完成项

- 登录与云同步（首期明确不做）。
- AI 自动讲题与动态生成题目（首期明确不做）。
- 多语言（首期明确不做）。
- 在线题目编辑后台（首期明确不做）。

## 下一步

- 按 `README.md` 的“内容维护”章节定期核验官方考试参数。
- 逐步扩充题库规模，降低重复抽题概率。
