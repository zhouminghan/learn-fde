# P1-P8 总体进度

## 状态总览

| Phase | 状态 | 说明 |
|---|---|---|
| P1 工程治理 | COMPLETED（待推送） | 许可证、README、.gitignore、CI、E2E、AGENTS.md 已完成；依赖高危项与分支保护待人工决策 |
| P2 题库质量治理 | COMPLETED | 重复题 3 对已删除，19 道记忆题校准为 easy，新增 21 道 hard 场景/故障题，新增重复题检测脚本 |
| P3 FDE Lab | COMPLETED | Lab 引擎支持 choice 分支与 nextStepId，新增知识问答/天气/智能客服三个入门案例 |
| P4 可视化教学 | COMPLETED | 修复 SVG Marker SSR 水合、Mermaid securityLevel、InteractiveWorkflow 定时器防御 |
| P5 学习闭环 | COMPLETED | 掌握度与个性化复习基于现有数据实时计算，样本不足不给出虚假精度 |
| P6 整体验收 | RUNNING | 对 P1-P5 做功能/测试/兼容/安全审计 |
| P7 模拟考试 | PENDING | 已有基础，验收为主 |
| P8 发布运营 | PENDING | 需人工授权 |

## 已知风险

- 依赖审计 17 项漏洞（2 critical / 1 high），均为 dev 工具链（vitest/vite/mermaid/vue-tsc/vitepress）。修复需多包主版本协同升级，暂缓并记录。
- `main` 分支保护未启用，需仓库管理员手动配置。

## 人工审批待办

- Git Push（P1 完成后）。
- 依赖主版本升级（可选，需决策）。
