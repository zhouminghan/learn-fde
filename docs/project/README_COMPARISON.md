# README 对比报告

日期：2026-11-11

对比对象：参考仓库 `learn-harness-engineering` 的 README 与 Learning FDE 的 README。

## 结论

Learning FDE 的 README 已按参考仓库的完整度补齐：品牌区、徽章、目录链接、预览图、项目叙事、学习路径、带链接的完整课程大纲、适合人群、学习要求、核心参考资料、技术栈、项目结构与免责声明均已覆盖。

## 结构对比

| 参考 README 章节 | Learning FDE 对应章节 | 说明 |
|---|---|---|
| 居中标题 + Logo + 徽章 + 一句话定位 | 同构 | 使用自己的 Logo、徽章与定位语 |
| What's New | 无 | 本项目为个人学习站，暂无版本更新公告区，按需再加入 |
| Table of Contents | 目录 | 16 个锚点链接，全部可跳转 |
| Visual Preview | 页面预览 | 首页与 FDE 实验室两张顶部裁剪图，限宽 880px |
| 项目叙事（Why This Course Exists） | 为什么有这个项目 | 用学习闭环图说明“学、看、做、测” |
| Curriculum & Documentation | 核心能力 + FDE 实验室 | 对应我们的课程、题库、考试与实验室 |
| Quick Start | 快速开始 | 本地运行与常用命令 |
| Capstone Project | FDE 实验室 | 对应企业 IT 服务台案例 |
| Learning Path | 学习路径 | 五阶段路径 + 补充专题 |
| Syllabus（带链接表格） | 课程大纲 | 24 章全部带相对链接，已验证文件存在 |
| Who This Is For | 适合人群 | 按 FDE 学习者与交付工程师定位 |
| Requirements / Prerequisites | 学习要求 | 精简为 3 条 |
| Local Preview | 快速开始 | 与常用命令合并 |
| Core References | 核心参考资料 | 仅保留腾讯云官方来源 |
| Repository Structure | 项目结构 | 与当前目录一致 |
| How the Course Is Organized | 如何组织 | 说明内容与组件、案例与执行逻辑解耦 |
| Skills / Tools / Acknowledgments | 无 | 本项目暂无独立 skill/tool，不硬造内容 |

## 关键差异

- 参考 README 是多语言课程、多项目工程；Learning FDE 是单语言学习站，因此去掉多语言徽章、Electron 项目与多语言资源库。
- 参考 README 的“核心参考”是 Harness 工程文章；Learning FDE 的“核心参考资料”是腾讯云官方考试指南与产品文档，符合内容可信度要求。
- Learning FDE 把部署与内容维护合并进 README，根目录只保留 `README.md` 与 `AGENTS.md`。
- 学习路径和课程大纲按官方四大模块 + 补充专题组织，24 个章节链接全部有效。
