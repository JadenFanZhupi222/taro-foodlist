# Production Rollout Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the database-hardening rollout manually approved, package-complete, able to remove retired cloud functions, and protected by regression tests.

**Architecture:** Keep deployment policy verifiable through source-level Node tests, then make the workflow satisfy those tests. Keep audit behavior in the existing pure audit module and verify it independently. Make only the project-owned Taro configuration correction while treating third-party declaration conflicts separately.

**Tech Stack:** GitHub Actions YAML, Node.js built-in test runner, CloudBase CLI, Taro 4/Vite, TypeScript.

---

### Task 1: Protect the production rollout workflow

**Files:**
- Create: `scripts/production-rollout.test.js`
- Modify: `.github/workflows/database-hardening-rollout.yml`
- Modify: `package.json`

- [ ] **Step 1: Write the failing workflow policy tests**

Create tests that read the workflow source and assert that it contains only `workflow_dispatch`, requires a typed `DEPLOY` confirmation, declares `environment: production`, logs the target commit/environment, and contains explicit deletion commands for `get-user-info` and `reorder-daily-menu`.

- [ ] **Step 2: Verify the policy tests fail**

Run: `node --test scripts/production-rollout.test.js`

Expected: failures for the current push trigger, missing production environment, missing confirmation input, and missing delete commands.

- [ ] **Step 3: Implement the minimal protected workflow**

Replace the push trigger with a `workflow_dispatch` input named `confirmation`. Add a validation job that requires the exact value `DEPLOY`. Make the production job depend on validation and declare `environment: production`. Print `github.sha`, `CLOUDBASE_ENV_ID`, and `ROLLBACK_SHA` before mutation. After successful hardened-function deployment, run CloudBase CLI deletion for both retired functions and fail if either command fails.

- [ ] **Step 4: Add the policy test to `test:backend` and verify green**

Run: `pnpm test:backend`

Expected: all workflow policy and existing backend tests pass.

- [ ] **Step 5: Commit**

Commit the workflow, test, and script registration with message `ci: protect production database rollout`.

### Task 2: Verify cloud-function runtime packaging

**Files:**
- Create: `scripts/cloudfunction-packaging.test.js`
- Modify: `cloudfunctions/create-family/package.json`
- Modify: `cloudfunctions/join-family/package.json`
- Modify: `package.json`

- [ ] **Step 1: Write the failing dependency-declaration test**

Parse the rollout function list, scan each entry module's bare CommonJS imports, and assert that every non-built-in import appears in that function directory's `dependencies`.

- [ ] **Step 2: Verify red**

Run: `node --test scripts/cloudfunction-packaging.test.js`

Expected: failures naming `create-family` and `join-family` with missing `@cloudbase/node-sdk`.

- [ ] **Step 3: Add the minimal runtime dependencies**

Replace the unused `wx-server-sdk` dependency in those two manifests with the same pinned `@cloudbase/node-sdk` version used by the other hardened functions.

- [ ] **Step 4: Verify green and run clean install smoke checks**

Run the packaging test, then run `npm install --package-lock-only --ignore-scripts` in each changed function directory and require its entry module with a temporary stub only if credential-free loading requires it.

- [ ] **Step 5: Commit**

Commit with message `fix: declare cloud function runtime dependencies`.

### Task 3: Correct duplicate-relation audit semantics

**Files:**
- Modify: `cloudfunctions/audit-database/index.test.js`
- Modify: `cloudfunctions/audit-database/audit.js`

- [ ] **Step 1: Add failing audit cases**

Add separate tests proving that two active relations are duplicates, one active plus one soft-deleted relation is not a duplicate, and soft-deleted orphan relations remain reported but do not contribute to active blocking conflicts.

- [ ] **Step 2: Verify red**

Run: `node --test cloudfunctions/audit-database/index.test.js`

Expected: the soft-deleted duplicate test fails against the current grouping behavior.

- [ ] **Step 3: Implement active-only grouping**

Filter relation grouping to `deleted !== true`, retain `deleted` on orphan report entries, and expose counts that let the preflight script block only active orphans.

- [ ] **Step 4: Update preflight blocking calculation and verify green**

Modify `scripts/database-preflight.js` to count only active orphan report entries. Run `pnpm test:backend` and expect all tests to pass.

- [ ] **Step 5: Commit**

Commit with message `fix: ignore soft-deleted relation conflicts`.

### Task 4: Remove the project-owned TypeScript configuration error

**Files:**
- Modify: `config/index.ts`
- Create: `scripts/taro-config.test.js`
- Modify: `package.json`

- [ ] **Step 1: Write the failing configuration test**

Assert that the Vite-backed H5 `output` block does not contain the unsupported webpack-style `filename` and `chunkFilename` keys.

- [ ] **Step 2: Verify red**

Run: `node --test scripts/taro-config.test.js`

Expected: failure identifying the unsupported output keys.

- [ ] **Step 3: Remove the unsupported block**

Delete only the H5 `output` object. Keep `miniCssExtractPluginOption` and all unrelated settings unchanged.

- [ ] **Step 4: Verify configuration and build**

Run the new test and `pnpm build:weapp`. Run `pnpm exec tsc --noEmit` and confirm the `config/index.ts` error is gone, while recording any remaining third-party declaration errors separately.

- [ ] **Step 5: Commit**

Commit with message `fix: remove unsupported Taro output options`.

### Task 5: Clean and verify the complete branch

**Files:**
- Modify: `docs/superpowers/plans/2026-07-20-full-ui-completion.md`
- Modify: `src/pages/recipe/detail/index.tsx`

- [ ] **Step 1: Remove the two whitespace defects**

Remove the extra blank line at the plan EOF and trailing space at the recipe detail component closing brace. Do not touch the pre-existing local line-ending-only plan change or `project.config.json` version bump.

- [ ] **Step 2: Run full verification**

Run `git diff --check`, `pnpm test:backend`, `pnpm test:ui`, `pnpm build:weapp`, and the TypeScript check. Expected: all owned checks pass; only documented third-party declaration failures may remain in the standalone TypeScript command.

- [ ] **Step 3: Review the final diff**

Confirm no secrets, generated build output, local line-ending-only changes, or the unapproved `project.config.json` bump are staged.

- [ ] **Step 4: Commit**

Commit only the intended cleanup with message `chore: clean rollout verification warnings`.
