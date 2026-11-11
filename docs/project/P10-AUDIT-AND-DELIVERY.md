# P10 仓库结构与测试基础设施优化

状态：COMPLETED

分支：`codex/p10-repository-test-infra`

开始日期：2026-11-11

完成日期：2026-11-12

## Goal

在不改变业务逻辑、存储结构、历史考试记录和课程内容的前提下，审计并优化仓库结构与测试基础设施，减少重复配置和重复测试执行，统一本地与 CI 质量门禁。

## 范围

- 根目录工具配置、测试目录、Playwright、Vitest、GitHub Actions、依赖与生成物。
- 最小化重构，不迁移 `src/`、`docs/` 业务代码，不修改 IndexedDB、题库或考试蓝图。
- 不执行 Git Push、Pull Request、合并或部署。

## 基线审计

| 对象 | 审计结果 |
| --- | --- |
| 根目录 TypeScript | `tsconfig.json`、`vitest.config.ts`、`playwright.config.ts` |
| 单元测试 | `tests/unit/`，9 个测试文件，46 个测试通过 |
| 端到端测试 | `tests/e2e/`，12 个 spec，2 个 helper |
| Playwright | 2 个项目，所有 spec 在两个项目重复执行，基线 256 passed / 2.8 分钟 |
| Vitest | Node 环境，仅收集 `tests/unit/**/*.test.ts` |
| GitHub Actions | CI 与 Pages 工作流重复执行 typecheck、unit、content、build、E2E |
| 依赖 | 本地依赖树完整；`@vue/test-utils`、`jsdom` 未发现源码引用 |
| 生成物 | `docs/.vitepress/dist` 7.4 MB、`test-results` 57 MB，均已被 `.gitignore` 排除 |
| 安全审计 | `npm audit` 因网络不可达返回 `UNKNOWN`，不据此声称无漏洞 |

现有未提交修改：

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-pages.yml`
- `playwright.config.ts`

上述修改中的 CI browser channel 决策保留；配置文件迁移时一并整合。

## 任务记录

| Task | 内容 | 状态 | 验收标准 |
| --- | --- | --- | --- |
| P10-T1 | 全仓审计与基线验证 | COMPLETED | 真实状态、命令结果和生成物已记录 |
| P10-T2 | 配置集中与测试分层 | COMPLETED | 根配置收敛，E2E/视觉测试边界明确 |
| P10-T3 | 质量门禁统一与依赖清理 | COMPLETED | CI 与本地共用命令，未使用依赖有证据 |
| P10-T4 | 逐阶段测试与独立 Review | COMPLETED | 实际 Diff、测试输出逐项检查 |
| P10-T5 | 最终全量验收与交付 | COMPLETED | verify:full、内容校验、构建与审查通过 |

## 实施结果

### 仓库结构

- 根目录只保留 `tsconfig.json` 作为编辑器与全仓类型检查入口。
- Vitest 配置迁移到 `tests/config/vitest.config.ts`。
- Playwright 配置迁移到 `tests/config/playwright.config.ts`。
- 端到端测试保留在 `tests/e2e/`。
- 截图验收迁移到 `tests/visual/`，并作为独立 `visual` 项目运行。
- E2E 与视觉测试共用的主题辅助迁移到 `tests/helpers/`。
- 390px 视觉用例保留 Pixel 7 的 UA、DPR、触控与移动端上下文，不恢复重复项目执行。

### 测试执行

Playwright 项目边界：

| 项目 | 范围 | 规则 |
| --- | --- | --- |
| `chromium` | `tests/e2e/**/*.spec.ts` | 排除自管移动端视口的 `mobile.spec.ts` |
| `mobile` | `tests/e2e/**/*.spec.ts` | 排除自管全部视口的 `layout.spec.ts` 与移动端专项 `mobile.spec.ts` |
| `visual` | `tests/visual/**/*.spec.ts` | 只运行一次，不再按设备项目重复 |

命令边界：

- `npm run test:e2e`：128 个行为 E2E 用例，按 desktop/mobile 覆盖且去除重复视口执行。
- `npm run test:visual`：46 个截图用例，内部覆盖 1440 与 390 两个宽度及双主题。
- `npm run test:e2e:all`：运行全部三个 Playwright 项目。
- `npm run verify`：typecheck、单测、内容校验、构建、行为 E2E。
- `npm run verify:full`：`verify` 加截图验收。

### 依赖与生成物

- 删除未引用的直接开发依赖：`@vue/test-utils`、`jsdom`。
- `jsdom` 仍作为 `vitest` 的传递 optional peer 存在于 lockfile，不改变测试环境设计。
- `docs/.vitepress/dist` 与 `test-results` 继续由 `.gitignore` 排除，不纳入 Git。
- 原有本地生成物未删除；新视觉运行输出到 `test-results/p9-screenshots/visual`，单次 46 张、约 25 MB。
- `npm audit` 因 `registry.npmjs.org` 网络不可达未取得结果，安全状态保持 `UNKNOWN`。

## 已执行验证

| 检查 | 结果 |
| --- | --- |
| 基线 `npm run typecheck` | 通过 |
| 基线 `npm run test` | 9 files / 46 tests passed |
| 基线 `npm run content:validate` | 326 道已发布题目，全部知识域容量 OK |
| 基线 `npm run docs:build` | 通过 |
| 基线 `npm run test:e2e` | 256 passed / 2.8 min |
| 重构后 `npm run typecheck` | 通过 |
| 重构后 `npm run test` | 9 files / 46 tests passed |
| 重构后 `npm run test:e2e` | 128 passed / 1.4 min |
| 重构后 `npm run test:visual` | 46 passed / 32.1 s，Pixel 7 390px 输出物理宽度 1024px |
| 最终 `npm run verify:full` | typecheck、46 单测、326 题校验、构建、128 E2E、46 visual 全部通过 |
| `npm run content:check-duplicates` | 326 题，完全重复 0 对，高度相似 0 对 |
| 测试发现 | E2E 128 个、visual 46 个，无 Vitest 文件误入 Playwright |
| workflow YAML / JSON 配置 | 两个 workflow、package 与 tsconfig 均解析通过 |
| `git diff --check` | 通过 |

## 独立 Review

Review Agent 为独立上下文，只读检查实际工作树、Diff、配置路径和真实命令输出，未采信执行阶段的自我评价，也未修改文件。

- 首轮技术验收：`PASS`，无 P0/P1/P2 问题。
- 首轮残留风险：390px 截图缺少 Pixel 7 设备上下文。
- 修复后复审：移动端上下文已恢复，`PASS`，无新增问题。
- Review 独立确认：`verify:full`、Playwright 174 个用例发现、`CI=1` Chrome channel 快速验证、`npm ci --dry-run`、依赖树与数据零改动均通过。

## 未解决与风险

- GitHub 托管 Ubuntu 作业未在本机实际执行；系统 Chrome channel 已本地验证，托管 runner 可用性仍属外部依赖。
- 历史 P9 文档仍记录当时的旧测试路径和截图目录；作为历史交付记录保留，不回写为新结构。
- 依赖安全审计状态为 `UNKNOWN`，需要在网络可用时重新运行 `npm audit`。
- 未执行 Git Push、PR、合并、部署；未修改数据、题库、课程正文、存储结构或许可证。

## 变更文件

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-pages.yml`
- `AGENTS.md`
- `README.md`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tests/config/vitest.config.ts`
- `tests/config/playwright.config.ts`
- `tests/helpers/theme.ts`
- `tests/visual/theme-visual.spec.ts`
- `tests/e2e/a11y.spec.ts`
- `tests/e2e/contrast-states.spec.ts`
- `tests/e2e/theme.spec.ts`
- 删除根目录 `vitest.config.ts`、`playwright.config.ts`
- 删除 `tests/e2e/theme-visual.spec.ts`、`tests/e2e/helpers/theme.ts`
