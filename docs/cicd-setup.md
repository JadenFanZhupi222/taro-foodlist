# CI/CD 配置说明

push 到 `master` 会自动：① 部署所有 CloudBase 云函数；② 构建小程序并上传**体验版**。
也可在 GitHub 仓库 **Actions → Deploy → Run workflow** 手动触发。

工作流文件：`.github/workflows/deploy.yml`

---

## 一次性配置：在 GitHub 添加 Secrets

仓库 → **Settings → Secrets and variables → Actions → New repository secret**，添加 3 个：

| Secret 名 | 用途 | 哪里拿 |
|---|---|---|
| `TENCENT_SECRET_ID` | 部署云函数的腾讯云 API 密钥 ID | 腾讯云控制台 → 访问管理 CAM → 访问密钥 → API 密钥管理 |
| `TENCENT_SECRET_KEY` | 对应的 API 密钥 Key | 同上（创建时只显示一次，注意保存） |
| `WX_PRIVATE_KEY` | 小程序代码上传密钥内容 | 见下方「微信侧配置」，把下载的 `private.<appid>.key` 文件**全部内容**粘进来 |

> 建议给这个 CAM 子账号/密钥仅授予 **CloudBase（TCB）** 相关权限，最小权限原则。

---

## 微信侧配置（上传体验版必做）

1. 登录 **微信公众平台** → **开发 → 开发设置 → 小程序代码上传**。
2. **生成上传密钥**，下载 `private.<appid>.key`，把文件内容贴到上面的 `WX_PRIVATE_KEY`。
3. ⚠️ **关闭 IP 白名单**：GitHub Actions 运行器 IP 不固定，若开启白名单上传会被拒。
   在「小程序代码上传」里取消勾选 IP 白名单（或留空）。

---

## 关键说明

- **只能到体验版**：微信规定正式发布必须人工在后台「提交审核 → 发布」。CI 只能传体验版，
  传完到「版本管理 → 开发版本」里能看到 `1.0.<run编号>`，由 robot 1 上传。
- **环境 ID 已硬编码**在 workflow 顶部 `CLOUDBASE_ENV_ID: dev-4gs517j09b896e44`。
  以后若切正式环境，改这一行即可。
- **appid** 同样在 workflow 顶部 `WX_APPID`，与 `project.config.json` 一致。
- **云函数依赖**：各函数 `package.json` 里的依赖由 CloudBase 在云端安装
  （`cloudbaserc.json` 中 `installDependency: true`），CI 不需要本地装函数依赖。
- 首次启用：把 `develop` 合并到 `master` 并 push，即触发第一次部署；
  在 Actions 页面看两个 job（cloud functions / miniprogram）是否绿。

---

## 常见问题

- **云函数 job 报鉴权失败**：检查 `TENCENT_SECRET_ID/KEY` 是否正确、密钥是否有 TCB 权限。
- **上传 job 报 IP 不在白名单**：到微信公众平台关闭「小程序代码上传」的 IP 白名单。
- **某个云函数部署失败导致整体中断**：workflow 用 `set -e` 逐个部署，
  失败会停在那个函数；按日志里的 `::group::deploy <name>` 定位。
