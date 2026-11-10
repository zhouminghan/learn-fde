# 功能清单与状态

状态：已完成（附证据）/ 部分完成 / 未开始 / 明确不做。

## 核心功能

| 编号 | 需求 | 状态 | 证据 |
|---|---|---|---|
| F-01 | 简体中文站点首页与完整一级导航 | 已完成 | 首页 `docs/index.md`，导航见 `config.mts`，E2E `home.spec.ts` 通过 |
| F-02 | 官方四大课程模块目录及章节 | 已完成 | 19 篇官方章节 + 5 篇补充，见 `docs/course/` |
| F-03 | 课程阅读进度与继续学习 | 已完成 | `LessonControls.vue` + `course-progress.ts`，E2E `course.spec.ts` 验证刷新持久化 |
| F-04 | 七大知识域题目分类 | 已完成 | `curriculum.json` domains D1-D7，78 道题均带 `domainId` |
| F-05 | 单选/多选专项练习 | 已完成 | `PracticePage.vue`，E2E `practice.spec.ts` 通过 |
| F-06 | 60 题模拟考试 | 已完成 | `exam-generator.ts` + `exam-blueprint.json`，单元测试通过 |
| F-07 | 考试报告、错题本、收藏、本机记录 | 已完成 | `ExamPage.vue` 报告 + `RecordsPage.vue`，E2E `exam.spec.ts` 通过 |
| F-08 | JSON 备份导出/导入 | 已完成 | `backup.ts` + `RecordsPage.vue`，单元测试 `backup.test.ts` 通过 |
| F-09 | GitHub Pages 自动部署 | 已完成 | `.github/workflows/deploy-pages.yml`，运行 42807345206 成功，线上 `https://zhouminghan.github.io/learn-fde/` |

## 考试引擎

| 编号 | 需求 | 状态 | 证据 |
|---|---|---|---|
| E-01 | 官方参数：60 题 / 40 单选 / 20 多选 / 90 分钟 / 100 分 / 70 分合格 | 已完成 | `exam-blueprint.json`，内容校验通过 |
| E-02 | 按七个知识域权重组卷 | 已完成 | `exam-generator.ts`，单元测试覆盖约束与缺口提示 |
| E-03 | 多选完全匹配计分（官方指南：错选、漏选不得分） | 已完成 | `exam-scoring.ts` + 考试说明文案，依据官方指南 2026-09-10 |
| E-04 | 倒计时与超时自动交卷 | 已完成 | `ExamPage.vue` 计时器，与主动交卷共用 `submitExam` |
| E-05 | 答题卡、标记、未答提示 | 已完成 | `ExamPage.vue` 答题卡 |
| E-06 | 刷新恢复与交卷幂等 | 已完成 | 进行中草稿恢复 + `submitExam` 幂等，E2E `exam.spec.ts` 通过 |
| E-07 | 成绩报告与知识域分析 | 已完成 | `exam-scoring.ts` + 报告 UI |
| E-08 | 题目不足时明确提示，禁止重复拼题 | 已完成 | `exam-generator.ts` 返回具体缺口 |

## 本地数据

| 编号 | 需求 | 状态 | 证据 |
|---|---|---|---|
| D-01 | IndexedDB 保存进度/练习/考试/错题/收藏/设置 | 已完成 | `src/storage/database.ts` 七张表 |
| D-02 | 页面层不直接操作数据库 | 已完成 | 页面统一走 `src/storage/` Repository |
| D-03 | 导出/导入带版本与结构校验 | 已完成 | `backup.ts` `parseBackup`，单元测试通过 |
| D-04 | 清空前二次确认 | 已完成 | `RecordsPage.vue` 双重确认 |
| D-05 | 存储不可用时明确提示 | 已完成 | `LessonControls.vue` 与 `RecordsPage.vue` 提示 |

## UI/UX

| 编号 | 需求 | 状态 | 证据 |
|---|---|---|---|
| U-01 | 顶部品牌导航 + GitHub 图标 | 已完成 | `config.mts` nav + socialLinks |
| U-02 | 浅色/深色/跟随系统三态主题并持久化 | 已完成 | `ThemeToggle.vue`，E2E 验证 |
| U-03 | 课程页章节树 + 页内目录 + 抽屉导航 | 已完成 | VitePress sidebar/outline + 960px 以下抽屉，E2E 验证 |
| U-04 | 站内搜索、上一篇/下一篇、返回顶部 | 已完成 | 本地搜索 + docFooter + returnToTop |
| U-05 | 首页入口卡片、进度、继续学习、薄弱域 | 已完成 | `HomePage.vue` |
| U-06 | 考试页答题效率、剩余时间、答题卡 | 已完成 | `ExamPage.vue` |
| U-07 | 键盘可操作、焦点可见、窄屏可用 | 已完成 | `:focus-visible` + 响应式 + `layout.spec.ts` 横向溢出回归（76 条 E2E 通过） |

## 内容质量

| 编号 | 需求 | 状态 | 证据 |
|---|---|---|---|
| C-01 | 章节含目标/讲解/机制/案例/误区/总结/自测/来源 | 已完成 | 24 篇章节均按模板 |
| C-02 | 补充专题标注“补充学习” | 已完成 | `docs/course/supplementary/*.md` 与课程页标识 |
| C-03 | 题目含答案/解析/知识域/来源，单选 1 答案，多选 ≥2 | 已完成 | `validate-content.ts` 校验通过 |
| C-04 | 草稿/待核验不进入正式题库 | 已完成 | `exam-generator.ts` 仅抽取 `published` |
| C-05 | 原创题不冒充官方真题 | 已完成 | 题目 `sourceType` 与 `authorNote`，站点免责声明 |

## 明确不做（首期）

- 登录与云同步、AI 自动讲题与动态生成题目、多语言、在线题目编辑后台、用户排名与社区讨论、PDF 自动排版导出。
