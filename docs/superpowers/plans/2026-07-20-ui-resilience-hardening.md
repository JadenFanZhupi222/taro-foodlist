# UI Resilience Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make empty, failed, unresolved, and long-content states truthful and layout-safe across recipe, today-menu, family, invite, profile, and settings flows.

**Architecture:** Add small pure state helpers where UI state currently conflates empty/loading/error, and keep Redux error fields only where errors must survive component boundaries. Page components render explicit state branches; CSS uses container-relative sizing and defensive text wrapping.

**Tech Stack:** Taro 4, React 18, Redux Toolkit, TypeScript, SCSS, Node test runner

---

### Task 1: Recipe empty states and layout boundaries

**Files:** `src/pages/recipe/detail/index.tsx`, `src/pages/recipe/detail/index.scss`, `src/pages/recipe/edit/index.tsx`, `src/pages/recipe/edit/index.scss`, `src/app.scss`, `scripts/ui-resilience.test.js`, `package.json`

- [ ] Write failing tests for empty detail copy, blank edit rows, border-box textareas, and long-text wrapping.
- [ ] Run focused tests and confirm failures match current behavior.
- [ ] Render compact empty content, seed empty arrays, and add defensive box/text styles.
- [ ] Rerun focused and UI tests.

### Task 2: Recipe fetch and save truthfulness

**Files:** `src/pages/recipe/detail/index.tsx`, `src/pages/recipe/edit/index.tsx`, `src/store/recipe/*`, `src/thunks/recipe/thunks.ts`, `scripts/ui-resilience.test.js`

- [ ] Write failing tests for cold detail loading/error/not-found and rejected save behavior.
- [ ] Add the minimum request state needed to distinguish unresolved/error/not-found.
- [ ] Fetch real recipe details when absent; use `.unwrap()` and only toast/navigate after fulfilled save.
- [ ] Verify focused/UI/backend tests.

### Task 3: Today-menu guards and request state

**Files:** `src/pages/today/index.tsx`, `src/store/dailyMenu/*`, `src/thunks/dailyMenu/thunks.ts`, `scripts/ui-resilience.test.js`

- [ ] Write failing tests for no-family guards, rejected-date retry, and unresolved recipe hydration.
- [ ] Add per-date status or equivalent pure state selection without conflating unresolved and empty.
- [ ] Guard all add actions and payload IDs; render login/family action, retry, resolving, and confirmed-empty states.
- [ ] Verify focused/UI/backend tests.

### Task 4: Today add-recipes container layout

**Files:** `src/components/today/AddRecipes/index.scss`, `src/pages/today/addRecipes/index.scss`, `scripts/ui-resilience.test.js`

- [ ] Write a failing layout regression that rejects viewport-width cards/placeholders inside constrained panels.
- [ ] Replace `vw` sizing with `minmax(0,1fr)`, container width, and grid spanning empty states.
- [ ] Verify focused/UI tests and WeChat build.

### Task 5: Family and invite error truthfulness

**Files:** `src/store/family/*`, `src/thunks/family/thunks.ts`, `src/pages/family/index.tsx`, `src/pages/family/acceptInvite/index.tsx`, `src/pages/family/acceptInvite/index.scss`, `scripts/ui-resilience.test.js`

- [ ] Write failing tests proving transient family errors preserve data and invalid invites cannot be accepted.
- [ ] Track fetch/invite errors, clear them on pending/fulfilled, and stop clearing family on rejection.
- [ ] Render retryable `StateView` branches and require a resolved invite family before joining.
- [ ] Verify focused/UI/backend tests.

### Task 6: Shared empty and long-content fallbacks

**Files:** `src/components/family/memberCardList/*`, `src/components/family/memberCard/index.tsx`, `src/pages/profile/index.tsx`, `src/components/SettingPage/index.scss`, `scripts/ui-resilience.test.js`

- [ ] Write failing tests for member empty styling, missing-avatar fallbacks, and setting-value wrapping.
- [ ] Add a compact member empty state, shared/default avatar fallback, and bounded setting value styles.
- [ ] Verify focused/UI tests.

### Task 7: Integrated verification and delivery

- [ ] Run `pnpm test:ui` and `pnpm test:backend` with zero failures.
- [ ] Run `pnpm build:weapp` successfully and `git diff --check` cleanly.
- [ ] Perform final spec and quality review.
- [ ] Commit/push the branch, create a ready PR, merge to `master`, and monitor the deployment workflow through trial-version upload.
