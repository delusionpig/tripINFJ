# tripINFJ

旅行规划应用：前端为 React + Vite 静态站点（GitHub Pages），用户数据存放在 Supabase。

## 本地运行

```bash
cp .env.example .env.local   # 填写 Supabase URL 与 anon key
npm install
npm run dev
```

## 初始化 Supabase

在 Supabase 控制台的 SQL Editor 中执行 `supabase/schema.sql`，创建 `trips` 表并启用 RLS（用户只能访问自己的数据）。anon key 可公开，数据安全由 RLS 保证，切勿在前端使用 service_role key。

在 Authentication 的 URL Configuration 中，将 Site URL 设为 GitHub Pages 地址。

## 部署到 GitHub Pages

1. 在仓库 Settings > Pages 中将 Source 设为 GitHub Actions。
2. 在仓库 Settings > Secrets and variables > Actions 中添加 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`。
3. 推送到 `main` 分支，`.github/workflows/deploy.yml` 会自动构建并发布。

路由使用 HashRouter，避免 GitHub Pages 对深层链接返回 404。
