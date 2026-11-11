# P1-P8 总体进度

## 状态总览

| Phase | 状态 | 说明 |
|---|---|---|
| P1 工程治理 | COMPLETED（待推送） | 许可证、README、.gitignore、CI、E2E、AGENTS.md 已完成；依赖高危项与分支保护待人工决策 |
| P2 题库质量治理 | COMPLETED | 重复题 3 对已删除，19 道记忆题校准为 easy，新增 21 道 hard 场景/故障题，新增重复题检测脚本 |
| P3 FDE Lab | RUNNING | Lab 引擎与案例扩展启动中 |
| P4 可视化教学 | PENDING | 可与 P3 并行 |
| P5 学习闭环 | PENDING | 依赖 P3、IndexedDB 迁移设计 |
| P6 整体验收 | PENDING | 依赖 P1-P5 |
| P7 模拟考试 | PENDING | 已有基础，验收为主 |
| P8 发布运营 | PENDING | 需人工授权 |

## 已知风险

- 依赖审计 17 项漏洞（2 critical / 1 high），均为 dev 工具链（vitest/vite/mermaid/vue-tsc/vitepress）。修复需多包主版本协同升级，暂缓并记录。
- `main` 分支保护未启用，需仓库管理员手动配置。

## 人工审批待办

- Git Push（P1 完成后）。
- 依赖主版本升级（可选，需决策）。
