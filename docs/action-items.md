# 待办清单（需要你来做的事）

> 本轮所有代码改动都在 **develop** 分支（共 8 个提交，见末尾）。
> 下面是需要**你本人**操作的事项，按优先级排列。代码层面我已做完。

---

## 1. 启用 CI/CD 自动部署（必做，否则改动上不了线）

详细步骤见 [`docs/cicd-setup.md`](./cicd-setup.md)，这里是清单：

- [ ] **加 3 个 GitHub Secret**（仓库 Settings → Secrets and variables → Actions）
  - [ ] `TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`：腾讯云 CAM API 密钥（给 CloudBase/TCB 权限）
  - [ ] `WX_PRIVATE_KEY`：微信「小程序代码上传密钥」文件内容
- [ ] **微信公众平台关掉代码上传 IP 白名单**（开发 → 开发设置 → 小程序代码上传）
      GitHub runner IP 不固定，不关会上传被拒
- [ ] **合并 `develop` → `master` 并 push**，触发第一次自动部署
- [ ] **看首跑日志**：Actions 页面确认两个 job（cloud functions / miniprogram）变绿；
      重点核对 `tcb fn deploy` 参数、`miniprogram-ci` 的 `--ud` 旗标是否被接受（首跑前我无法实测）
- [ ] 部署后到**微信后台「版本管理」提交审核 → 发布**（CI 只能传体验版，正式发布必须人工）

---

## 2. CloudBase 控制台建索引（影响性能，强烈建议）

鉴权改造后，`family.where({ members: openId })` 成了**每个请求的热路径**，没索引会全表扫描。
到云开发控制台 → 数据库 → 对应集合 → 索引管理，新建：

- [ ] **`family` 集合：`members` 字段（数组索引）** ← 最重要
- [ ] `user` 集合：`openId`
- [ ] `daily_menu` 集合：组合索引 `family_id` + `date`
- [ ] `family_recipes` 集合：组合索引 `family_id` + `deleted` + `order`

---

## 3. 部署后冒烟测试（确认这批改动没问题）

逐项点一遍：

- [ ] 看菜谱列表、加菜谱、改菜谱、删菜谱
- [ ] 「今天」页加今天/明天的菜、删菜
- [ ] 改昵称 / 头像
- [ ] 创建家庭 / 通过邀请链接加入家庭 / 退出家庭
- [ ] 家庭成员里**群主徽章**显示是否正确（改用 family_owner 推导了）
- [ ] 日期选择器**星期显示为中文**（"周一"而非"Mo"）
- [ ] 删掉一个已加进某天菜单的菜谱后，那天菜单里**仍能看到菜名**（快照生效）

> 注：`app.auth().getUserInfo()` 是你现有 `create-family`/`get-family-info` 一直在用的机制，
> 理论上没问题，但安全改动建议亲测一遍。

---

## 4. UI 优化（晚点回家做）

- [ ] **截一张「今天」页的图**发给我（其它看着别扭的页也一起）
      → 我才能做真正的视觉优化，对着真实画面调，不会盲改越改越糟
- 已完成的安全打磨（无需你做）：全局字体/抗锯齿/点击高亮/色值修正
- 待你拍板的"有视觉风险"项（需对着截图做）：
  - RecipeCard 等的 `vw/vh → rpx`（卡片高度 `25vh` 随屏高变化的问题）
  - 全局 `box-sizing: border-box`（回归风险最高，最好有真机核对）

---

## 5. 待定 / 可选项（你决定要不要做）

- [ ] **thunk 错误处理样板**抽公共方法（最后一个 P1，纯可维护性，可做可不做）
- [ ] `date-fns` 现已无人使用，可从 `package.json` 依赖里移除（瘦身）
- [ ] 软删除数据清理（DB #8，家用数据量小，低优先）
- [ ] 老 `daily_menu` 历史快照回填脚本 —— **已决定不做**（最坏只是老记录里已删菜谱名字显示不出，数据不丢）

---

## 附：本轮已完成的 8 个提交（develop 分支）

```
e66cc47  style: 全局基础打磨（字体/抗锯齿/点击高亮/色值修正）
bd2e0fb  ci:    GitHub Actions 自动部署 + 配置文档
d05c31b  refactor: DateSelector 去 date-fns，统一日期系统
40e0477  refactor: 删除 types/store.ts 重复死类型
bd0d1e2  refactor: 群主徽章用 family_owner + 统一 JWT 字段名
67bfba8  refactor: 时间字段统一 + 菜单菜名快照 + 共享删除语义
8ddfdb1  refactor: 家庭归属统一以 family 表为单一真相
283e2f5  fix:   鉴权加固（11 个云函数越权修复）+ 3 个 P0 bug
```

**核心成果**：修复越权安全漏洞、3 个确认 bug；数据库设计 8 项里解决 6 项；
家庭归属/role 统一为单一真相，根治"串档"；菜单历史加快照防丢失；搭好 CI/CD。
