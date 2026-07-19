# 数据库完整性加固发布手册

## 原则

- 先审计、后写入；发现冲突立即停止。
- 不删除或改名旧集合与旧字段。
- `family_members` 和 `daily_menu_keys` 是兼容锁，旧云函数会忽略它们。
- 禁止未经审计直接全量部署本分支。

## 发布前门禁

1. 从环境 `dev-4gs517j09b896e44` 导出 `user`、`family`、`recipes`、`family_recipes`、`daily_menu`。
2. 记录导出时间、提交 SHA 和操作者，备份文件存放在数据库之外。
3. 在 CloudBase 为 `audit-database` 配置强随机 `DATABASE_AUDIT_TOKEN`。
4. 仅部署 `audit-database`，调用后保存完整 JSON 报告。
5. 若 `multiFamilyUsers`、`duplicateMenus` 或重复食谱关联非零，停止发布并人工处理；审计函数不得修改数据。

## 分组发布

每组完成后执行登录和相关烟雾测试，并重新运行审计：

1. `create-family`、`join-family`、`leave-family`
2. `create-recipe`、`update-recipe`、`delete-recipe`
3. `create-or-update-daily-menu`、`remove-recipe-from-menu`

不要把 `migrate-recipes-once` 纳入发布或再次执行。

## 验证场景

- 同一用户并发加入两个家庭：只能成功一个。
- owner 退出多人家庭：下一位成员成为 owner，退出者缓存被清空。
- 创建食谱中途失败：不能留下无关联食谱。
- 同一日期并发添加相同菜品：只有一个菜单和一个菜品条目。
- 旧用户首次操作：无需预迁移，兼容锁由写入路径惰性建立。

## 观察指标

发布后观察 48 小时：云函数 4xx/5xx、事务写冲突、审计差异、新增孤儿关联和重复菜单。事务冲突短暂增加时先停止后续分组，不直接重试批量写入。

## 回滚

1. 将对应云函数重新部署为发布前提交。
2. 不删除 `family_members` 或 `daily_menu_keys`；旧函数不会读取它们。
3. 重新运行只读审计并比较发布前报告。
4. 除非确认发生数据丢失，不要整体恢复数据库备份；全量恢复会覆盖备份后用户产生的有效写入。
5. 若只出现锁记录异常，先停止相关写函数，再按审计报告逐条人工修正，不批量猜测归属。
