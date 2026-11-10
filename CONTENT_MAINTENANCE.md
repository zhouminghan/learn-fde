# 内容维护说明

## 内容目录

- 课程元数据：`src/content/curriculum.json`
- 考试蓝图：`src/content/exam-blueprint.json`
- 题库：`src/content/questions/*.json`
- 课程正文：`docs/course/**/*.md`

## 新增章节

1. 在 `docs/course/` 对应模块目录新建 Markdown，按统一模板编写（学习目标、知识讲解、机制/流程图、业务案例、误区、总结、自测题、来源）。
2. 在 `curriculum.json` 的 `lessons` 中登记：稳定 `id`、`title`、`moduleId`、`order`、`path`、`domainIds`、`estimatedMinutes`、`sourceType`、`sourceUrls`、`lastVerifiedAt`、`status`、`summary`。
3. 补充专题必须设置 `sourceType: "supplementary"`。

## 新增题目

1. 在对应知识域 JSON 文件追加题目对象。
2. 校验规则：单选题恰好 1 个正确答案；多选题至少 2 个；`answerIds` 必须在 `options` 中；至少关联 1 个章节与 1 个来源；正式模拟考只抽取 `status: "published"`。
3. 原创题设置 `sourceType: "original"` 并写清 `authorNote`，不得冒充官方真题。

## 校验

```bash
npm run content:validate
```

脚本会校验题目 Schema、ID 唯一、答案选项合法、蓝图合计为 100，并检查各知识域题量是否满足组卷约束。

## 官方信息核验

- 每次发布前及内容更新后，重新检查腾讯云 FDE 认证详情页的考试参数与知识分布。
- 官方参数变化时：更新 `exam-blueprint.json` 的 `version`，并在 `docs/about/` 与本题库记录变更依据。
- 未完成官方核验的内容应标注为待核验，不进入正式题库。
- 多选题判分以官方指南“错选、漏选不得分”为准（https://cloud.tencent.com/document/product/658/137832，2026-09-10 更新），learn-FDE 实现为完全匹配计分。
