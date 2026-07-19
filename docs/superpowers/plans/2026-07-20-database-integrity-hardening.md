# Database Integrity Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不删除、改名或批量覆盖线上现有数据的前提下，为家庭、食谱和每日菜单增加审计、事务保护与并发去重能力。

**Architecture:** 保留 `user`、`family`、`recipes`、`family_recipes`、`daily_menu` 的现有读写契约；先部署只读审计，再将多文档写入改为事务。每日菜单通过新增 `daily_menu_keys` 锁集合保证 `family_id + date` 唯一，同时继续返回现有 `daily_menu` 文档结构。所有发布均支持回滚到旧云函数，且旧集合数据不删除。

**Tech Stack:** Taro 4、腾讯云 CloudBase Node SDK、Node.js 18、Node 内置测试运行器、GitHub Actions

---

## Scope and non-goals

本计划包含：

- 线上数据只读审计与冲突报告
- 家庭创建、加入、退出的事务化
- 食谱与家庭关联创建的事务化
- 每日菜单并发创建和重复菜品保护
- 灰度验证、回滚开关和运行手册

本计划不包含：

- 删除 `user.family_id` 或 `family.members`
- 新增 `family_members` 集合
- 删除或重写已有 `daily_menu` 文档 ID
- 收藏功能
- 修改 30 天历史菜单清理策略

收藏和菜单历史保留属于独立产品功能，应另写计划。

## File map

- Create: `cloudfunctions/audit-database/index.js` — 只读扫描和分页审计入口
- Create: `cloudfunctions/audit-database/audit.js` — 无副作用的冲突检测逻辑
- Create: `cloudfunctions/audit-database/index.test.js` — 审计规则单元测试
- Create: `cloudfunctions/audit-database/package.json` — Node 测试与云函数依赖
- Modify: `cloudbaserc.json` — 注册审计函数
- Create: `cloudfunctions/_shared/family.js` — 家庭身份与事务内查询工具
- Create: `cloudfunctions/_shared/family.test.js` — 单一家庭规则测试
- Modify: `cloudfunctions/create-family/index.js` — 事务创建家庭
- Modify: `cloudfunctions/join-family/index.js` — 事务加入家庭
- Modify: `cloudfunctions/leave-family/index.js` — 事务退出和 owner 转移
- Modify: `cloudfunctions/create-recipe/index.js` — 事务创建食谱及关联
- Create: `cloudfunctions/_shared/menu-key.js` — 上海日期规范化和菜单确定性键
- Create: `cloudfunctions/_shared/menu-key.test.js` — 日期与键测试
- Modify: `cloudfunctions/create-or-update-daily-menu/index.js` — 菜单锁与事务去重
- Modify: `cloudfunctions/remove-recipe-from-menu/index.js` — 事务内删除菜单项
- Create: `docs/database/integrity-rollout.md` — 部署、审计、回滚运行手册

### Task 1: Establish a repeatable backend test command

**Files:**
- Modify: `package.json`
- Create: `cloudfunctions/_shared/menu-key.js`
- Create: `cloudfunctions/_shared/menu-key.test.js`

- [ ] **Step 1: Add the failing menu-key tests**

```js
const test = require('node:test')
const assert = require('node:assert/strict')
const { normalizeDateKey, makeMenuKey } = require('./menu-key')

test('normalizes an ISO timestamp to a Shanghai date key', () => {
  assert.equal(normalizeDateKey('2026-07-20T18:00:00.000Z'), '2026-07-21')
})

test('keeps an existing YYYY-MM-DD key unchanged', () => {
  assert.equal(normalizeDateKey('2026-07-20'), '2026-07-20')
})

test('builds a stable menu key', () => {
  assert.equal(makeMenuKey('family/a', '2026-07-20'), 'family%2Fa_2026-07-20')
})
```

- [ ] **Step 2: Verify the test fails**

Run: `node --test cloudfunctions/_shared/menu-key.test.js`

Expected: FAIL with `Cannot find module './menu-key'`.

- [ ] **Step 3: Implement the pure key helper**

```js
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/

function normalizeDateKey(value) {
  if (typeof value === 'string' && DATE_KEY.test(value)) return value
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) throw new TypeError('invalid date')
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date)
}

function makeMenuKey(familyId, date) {
  if (!familyId) throw new TypeError('familyId is required')
  return `${encodeURIComponent(familyId)}_${normalizeDateKey(date)}`
}

module.exports = { normalizeDateKey, makeMenuKey }
```

- [ ] **Step 4: Add the repository test script**

Add to `package.json` scripts:

```json
"test:backend": "node --test cloudfunctions/**/*.test.js"
```

- [ ] **Step 5: Run and commit**

Run: `pnpm test:backend`

Expected: 3 tests pass.

```bash
git add package.json cloudfunctions/_shared/menu-key.js cloudfunctions/_shared/menu-key.test.js
git commit -m "test: add backend integrity test harness"
```

### Task 2: Add a read-only database audit

**Files:**
- Create: `cloudfunctions/audit-database/audit.js`
- Create: `cloudfunctions/audit-database/index.js`
- Create: `cloudfunctions/audit-database/index.test.js`
- Create: `cloudfunctions/audit-database/package.json`
- Modify: `cloudbaserc.json`

- [ ] **Step 1: Test conflict detection with in-memory fixtures**

Cover these exact cases in `index.test.js`:

```js
assert.deepEqual(auditFamilies([
  { _id: 'f1', members: ['u1', 'u2'] },
  { _id: 'f2', members: ['u2'] }
]).multiFamilyUsers, [{ openId: 'u2', familyIds: ['f1', 'f2'] }])

assert.deepEqual(auditMenus([
  { _id: 'm1', family_id: 'f1', date: '2026-07-20' },
  { _id: 'm2', family_id: 'f1', date: '2026-07-20' }
]).duplicateMenus[0].menuIds, ['m1', 'm2'])
```

Also assert orphan `family_recipes` and duplicate `family_id + recipe_id` relations.

- [ ] **Step 2: Verify the audit tests fail**

Run: `node --test cloudfunctions/audit-database/index.test.js`

Expected: FAIL because `audit.js` does not exist.

- [ ] **Step 3: Implement pure audit functions**

Implement and export:

```js
auditFamilies(families)
auditUsers(users, families)
auditRecipeRelations(relations, recipes, families)
auditMenus(menus, families)
```

Every result must contain `count` and stable sorted IDs. Never mutate fixtures.

- [ ] **Step 4: Implement the protected read-only cloud function**

`index.js` must:

- Reject unless `event.auditToken === process.env.DATABASE_AUDIT_TOKEN`.
- Page every collection with `.skip(offset).limit(100)` until exhausted.
- Read only `user`, `family`, `recipes`, `family_recipes`, and `daily_menu`.
- Return counts and at most 100 sample conflicts per category.
- Never call `.add()`, `.update()`, `.set()` or `.remove()`.

- [ ] **Step 5: Register and test**

Add `audit-database` to `cloudbaserc.json` with Node 18, 60-second timeout and 512 MB memory.

Run: `pnpm test:backend`

Expected: all audit and key tests pass.

- [ ] **Step 6: Commit**

```bash
git add cloudfunctions/audit-database cloudbaserc.json
git commit -m "feat: add read-only database integrity audit"
```

### Task 3: Transactional family lifecycle

**Files:**
- Create: `cloudfunctions/_shared/family.js`
- Create: `cloudfunctions/_shared/family.test.js`
- Modify: `cloudfunctions/create-family/index.js`
- Modify: `cloudfunctions/join-family/index.js`
- Modify: `cloudfunctions/leave-family/index.js`

- [ ] **Step 1: Test the single-family decision logic**

Create pure helpers and tests for:

```js
resolveCurrentFamily([], 'target')                // null
resolveCurrentFamily([{ _id: 'target' }], 'target') // same
resolveCurrentFamily([{ _id: 'other' }], 'target')  // throws FAMILY_CONFLICT
nextFamilyOwner(['u1', 'u2'], 'u1')               // 'u2'
nextFamilyOwner(['u1'], 'u1')                     // null
```

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test cloudfunctions/_shared/family.test.js`

Expected: FAIL because the helpers are absent.

- [ ] **Step 3: Implement the pure helpers and pass tests**

Run: `pnpm test:backend`

Expected: all tests pass.

- [ ] **Step 4: Wrap create-family in one transaction**

Inside `db.startTransaction()` perform, in order:

1. Query `family` for `members: openId`.
2. Abort with the existing response code if any family exists.
3. Add the family document.
4. Update `user.family_id`.
5. Commit.

On any error call `rollback()` and preserve the existing API response shape.

- [ ] **Step 5: Wrap join-family in one transaction**

Read the target family and current membership inside the same transaction. Use atomic array push only after the conflict check, then update `user.family_id`. Repeated joining of the same family remains idempotent.

- [ ] **Step 6: Wrap leave-family in one transaction**

Within one transaction remove the member, clear `user.family_id`, and either delete the empty family or transfer `family_owner` to `newMembers[0]`.

- [ ] **Step 7: Verify and commit**

Run: `pnpm test:backend && pnpm build:weapp`

Expected: tests and build pass.

```bash
git add cloudfunctions/_shared/family.js cloudfunctions/_shared/family.test.js cloudfunctions/create-family cloudfunctions/join-family cloudfunctions/leave-family
git commit -m "fix: make family lifecycle writes transactional"
```

### Task 4: Transactional recipe creation

**Files:**
- Modify: `cloudfunctions/create-recipe/index.js`
- Modify: `cloudfunctions/update-recipe/index.js`
- Modify: `cloudfunctions/delete-recipe/index.js`

- [ ] **Step 1: Add a regression fixture for deterministic relation IDs**

Extend `_shared/family.test.js` with:

```js
assert.equal(makeRelationKey('f/1', 'r/2'), 'f%2F1_r%2F2')
```

- [ ] **Step 2: Implement `makeRelationKey` and pass tests**

Use `encodeURIComponent` for both ID segments.

- [ ] **Step 3: Transactionalize create-recipe**

Within one transaction:

1. Resolve the caller's family.
2. Add the recipe with server-owned `created_by`, `createdAt`, and `updatedAt`.
3. Create `family_recipes` using deterministic `_id = makeRelationKey(familyId, recipeId)`.
4. Commit only when both writes succeed.

Keep reads compatible with old random relation IDs.

- [ ] **Step 4: Harden update and delete**

Run authorization lookup and mutation in a transaction so membership or relation state cannot change between check and write. Preserve soft deletion of `family_recipes`; do not delete shared recipe bodies.

- [ ] **Step 5: Verify and commit**

Run: `pnpm test:backend && pnpm build:weapp`

```bash
git add cloudfunctions/create-recipe cloudfunctions/update-recipe cloudfunctions/delete-recipe cloudfunctions/_shared/family.js cloudfunctions/_shared/family.test.js
git commit -m "fix: make recipe mutations atomic"
```

### Task 5: Prevent duplicate daily menus and dishes

**Files:**
- Modify: `cloudfunctions/create-or-update-daily-menu/index.js`
- Modify: `cloudfunctions/remove-recipe-from-menu/index.js`
- Modify: `cloudbaserc.json`

- [ ] **Step 1: Register no new migration or destructive function**

Add no cleanup job. The new `daily_menu_keys` collection is created lazily by normal writes.

- [ ] **Step 2: Implement transactional menu creation**

For `menuKey = makeMenuKey(familyId, dateStr)`:

1. Start a transaction.
2. Read `daily_menu_keys.doc(menuKey)`.
3. If it exists, read its `menu_id` and update that menu.
4. If absent, query old `daily_menu` by `family_id + date`.
5. If exactly one old menu exists, create only the key mapping to it.
6. If more than one exists, abort with `code: 409` and log the IDs; never auto-merge.
7. If none exists, create the menu and key mapping in the same transaction.
8. Check duplicate `recipe_id` and update the array inside the same transaction.

- [ ] **Step 3: Transactionalize removal**

Read ownership, date and recipes inside the transaction, filter the requested item, update `updatedAt`, then commit. Preserve the current response format.

- [ ] **Step 4: Verify concurrency manually in the development environment**

Invoke two simultaneous additions of the same recipe to the same date.

Expected database result:

- one `daily_menu_keys` document
- one mapped `daily_menu` document
- one occurrence of the recipe ID

- [ ] **Step 5: Commit**

```bash
git add cloudfunctions/create-or-update-daily-menu cloudfunctions/remove-recipe-from-menu cloudbaserc.json
git commit -m "fix: prevent duplicate daily menus under concurrency"
```

### Task 6: Rollout, verification and rollback documentation

**Files:**
- Create: `docs/database/integrity-rollout.md`

- [ ] **Step 1: Document the pre-deploy gate**

Require:

```text
1. Export user, family, recipes, family_recipes, daily_menu.
2. Record export time and CloudBase environment ID.
3. Run audit-database in audit mode.
4. Save the JSON report outside the database.
5. Stop if multiFamilyUsers or duplicateMenus is non-zero.
```

- [ ] **Step 2: Document staged deployment order**

Deploy in this order:

```text
audit-database
create-family, join-family, leave-family
create-recipe, update-recipe, delete-recipe
create-or-update-daily-menu, remove-recipe-from-menu
```

After each group, repeat the audit and compare counts.

- [ ] **Step 3: Document rollback**

Rollback means redeploying the previous cloud-function commit. Do not remove `daily_menu_keys`; old functions ignore it. Do not restore a full database export unless verified data loss occurred, because doing so could overwrite valid writes made after the export.

- [ ] **Step 4: Final verification**

Run:

```bash
pnpm test:backend
pnpm build:weapp
git diff --check
```

Expected: all commands pass. Existing Sass/Lottie dependency warnings are allowed; new test or build errors are not.

- [ ] **Step 5: Commit**

```bash
git add docs/database/integrity-rollout.md
git commit -m "docs: add database integrity rollout runbook"
```

## Release decision gates

- Gate A — audit only: no writes or behavior changes.
- Gate B — family transactions: proceed only when create/join/leave smoke tests pass.
- Gate C — recipe transactions: proceed only when no new orphan recipe or relation appears.
- Gate D — menu uniqueness: proceed only when existing duplicate menu count is zero or conflicts have been manually resolved.
- Gate E — production observation: watch cloud-function errors and audit deltas for 48 hours before considering old compatibility fields for any future cleanup.

## Self-review

- Existing `family_recipes` migration is reused rather than repeated.
- No task deletes or renames an existing collection or field.
- Old clients remain compatible because cloud-function names and response shapes stay unchanged.
- Transaction and uniqueness changes are independently deployable and independently reversible.
- Favorites and history retention are deliberately excluded to keep the reliability rollout bounded.
