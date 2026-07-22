# Native Recipe Swipe Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make recipe-card swipe gestures follow the finger at native WeChat rendering speed.

**Architecture:** Replace React-driven `touchmove` state updates with Taro's `MovableArea` and `MovableView`, which delegate movement to the mini-program view layer. Keep only the last native x-coordinate in a ref during movement, and update React state once after touch end to coordinate the open card.

**Tech Stack:** Taro 4, React 18, WeChat Mini Program native view components, Node test runner.

---

### Task 1: Lock the native-motion performance boundary

**Files:**
- Modify: `scripts/ui-source.test.js`

- [ ] Add assertions that `RecipeCard` imports and renders `MovableArea`/`MovableView`, does not bind `onTouchMove`, and does not call `setOffset` or `setDragging`.
- [ ] Run `node --test scripts/ui-source.test.js` and confirm the new assertions fail against the React-driven implementation.

### Task 2: Replace React-driven movement

**Files:**
- Modify: `src/components/RecipeCard/index.tsx`
- Modify: `src/components/RecipeCard/index.scss`

- [ ] Render the card inside a horizontal `MovableView` with no inertia or out-of-bounds movement.
- [ ] Store `onChange` x values in a ref only; settle open/closed state from the wrapper's touch-end event.
- [ ] Size the native movement area from the rendered card while keeping the delete action full height.
- [ ] Run `node --test scripts/ui-source.test.js` and confirm all assertions pass.

### Task 3: Verify and package

**Files:**
- Verify: `src/components/RecipeCard/index.tsx`
- Verify: `src/components/RecipeCard/index.scss`

- [ ] Run `pnpm test:ui`; expect zero failures.
- [ ] Run `pnpm test:backend`; expect zero failures.
- [ ] Run `pnpm build:weapp`; expect exit code 0 and refreshed `dist` output.
- [ ] Run `git diff --check`, then commit only the swipe implementation, regression test, and this plan.
