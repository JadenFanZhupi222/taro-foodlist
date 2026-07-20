# Guest Recipe Browsing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow WeChat reviewers to browse recipe cards and details before login while preserving authentication for all mutations.

**Architecture:** A small CommonJS-compatible local data module owns guest recipes and pure visibility helpers so Node can test behavior directly and Taro can consume the same data. The recipe list and detail pages select guest data only when no user exists; the global app shell no longer prompts on startup.

**Tech Stack:** Taro 4, React 18, Redux Toolkit, TypeScript/JavaScript, Node test runner, SCSS

---

### Task 1: Guest recipe model

**Files:**
- Create: `src/data/guestRecipes.js`
- Create: `scripts/guest-recipe-browsing.test.js`
- Modify: `package.json`

- [ ] Write a failing Node test that imports `guestRecipes`, `getVisibleRecipes`, and `findVisibleRecipe`, then asserts guests receive at least two complete recipes, signed-in users receive only their real recipes, and guest IDs resolve by ID.
- [ ] Run `node --test scripts/guest-recipe-browsing.test.js` and confirm it fails because the module is missing.
- [ ] Implement the local recipe fixtures and the two pure helpers with JSDoc types and stable `guest:` IDs.
- [ ] Add the test file to `test:ui`, rerun it, and confirm all assertions pass.

### Task 2: Remove startup authentication interruption

**Files:**
- Modify: `src/AppContainer.tsx`
- Modify: `scripts/guest-recipe-browsing.test.js`

- [ ] Add a failing source regression assertion that `AppContainer` contains neither `showModal` nor `switchTab` login guidance.
- [ ] Run the focused test and confirm it fails on the existing global prompt.
- [ ] Remove unused login selectors, modal state, Taro routing code, and the login-guidance effect while retaining loading cleanup behavior.
- [ ] Rerun the focused test and confirm it passes.

### Task 3: Guest list and guarded mutations

**Files:**
- Modify: `src/pages/index/index.tsx`
- Modify: `src/pages/index/index.scss`
- Modify: `scripts/guest-recipe-browsing.test.js`

- [ ] Add failing assertions that the list uses `getVisibleRecipes`, labels guest mode, disables `swipeToDelete` for guests, and routes guest creation/login to `/pages/profile/index`.
- [ ] Run the focused test and confirm failure against the current list.
- [ ] Select visible recipes from local guest data or Redux data, render a guest banner and login action, guard new/delete actions, and base search/count/loading on visible recipes.
- [ ] Add compact banner styling consistent with the existing green editorial UI.
- [ ] Rerun the focused test and confirm it passes.

### Task 4: Guest detail browsing

**Files:**
- Modify: `src/pages/recipe/detail/index.tsx`
- Modify: `scripts/guest-recipe-browsing.test.js`

- [ ] Add a failing assertion that detail lookup uses `findVisibleRecipe` with the current login state.
- [ ] Run the focused test and confirm failure.
- [ ] Resolve the selected recipe from Redux plus guest fixtures; retain the existing `canEdit = !!user` gate.
- [ ] Rerun the focused test and confirm it passes.

### Task 5: Verification and delivery

**Files:**
- Verify all modified files.

- [ ] Run `pnpm test:ui` and expect zero failures.
- [ ] Run `pnpm test:backend` and expect zero failures.
- [ ] Run `pnpm build:weapp` and expect exit code 0.
- [ ] Run `git diff --check` and inspect `git diff --stat`.
- [ ] Commit the implementation, push `codex/guest-recipe-browsing`, open a ready PR to `master`, merge after checks pass, and monitor the deployment workflow.
