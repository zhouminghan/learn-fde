# 部署说明

## 部署方式

站点通过 GitHub Actions 自动部署到 GitHub Pages。推送 `main` 分支或手动触发工作流即可。

部署地址：`https://zhouminghan.github.io/learn-fde/`

## 前置条件

- 仓库名为 `learn-fde`，GitHub Pages 启用 “GitHub Actions” 作为来源。
- 仓库 `Settings > Pages > Build and deployment > Source` 选择 `GitHub Actions`。

## 工作流

`.github/workflows/deploy-pages.yml` 执行：

1. `npm ci`
2. `npm run typecheck`
3. `npm run test`
4. `npm run content:validate`
5. `npm run docs:build`
6. 上传 `docs/.vitepress/dist` 并部署

## base path

VitePress `base` 由环境变量控制：

```ts
const base = process.env.DOCS_BASE_PATH ?? '/learn-fde/'
```

若仓库名改变，需同步修改工作流中的 `DOCS_BASE_PATH` 与默认值。

## 本地验证部署产物

```bash
npm run docs:build
npm run docs:preview -- --port 4173
```

然后访问 `http://localhost:4173/learn-fde/`。
