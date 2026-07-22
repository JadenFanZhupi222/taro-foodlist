# Navigation and Swipe Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved B-style bottom navigation and a coordinated, full-height, responsive recipe swipe-delete interaction without covering the native date picker.

**Architecture:** Keep the existing Taro custom tab bar and NutUI Swipe dependency, but remove `cover-view`, replace pseudo-element-only icons with explicit child views, and constrain the shell's hit area. Make RecipeCard's Swipe imperative and parent-coordinated so one card is open at a time, while overriding NutUI's slow transition and action-wrapper sizing at the component boundary.

**Tech Stack:** Taro 4.1.1, React 18, TypeScript, Sass, NutUI Swipe, Node test runner, WeChat mini-program build

---

### Task 1: Lock the regressions with source tests

**Files:**
- Modify: `scripts/ui-source.test.js`
- Test: `scripts/ui-source.test.js`

- [ ] **Step 1: Write failing tests for the navigation contract**

Add a test that reads `src/custom-tab-bar/index.wxml` and `index.wxss`, asserts there is no `cover-view`, asserts explicit `custom-tab-icon__head` and `custom-tab-icon__body` elements exist, and asserts the shell is fixed with `pointer-events:none` while the bar is interactive.

```js
test('custom tab bar stays interactive without becoming a native overlay', () => {
  const template = read('src/custom-tab-bar/index.wxml')
  const styles = read('src/custom-tab-bar/index.wxss')
  assert.doesNotMatch(template, /cover-view/)
  assert.match(template, /custom-tab-icon__head/)
  assert.match(template, /custom-tab-icon__body/)
  assert.match(styles, /\.custom-tab-shell\{[^}]*position:fixed[^}]*pointer-events:none/)
  assert.match(styles, /\.custom-tab-bar\{[^}]*pointer-events:auto/)
})
```

- [ ] **Step 2: Write failing tests for the swipe contract**

Read `src/components/RecipeCard/index.tsx`, `index.scss`, and `src/pages/index/index.tsx`. Assert the card exposes `activeSwipeId`/`onSwipeOpen`, uses a `SwipeRef`, closes before card navigation while open, uses `onOpen`/`onClose`, renders one-line `删除`, and overrides `.nut-swipe-wrapper` to a short transform transition with stretched `.nut-swipe-right` action height.

```js
test('recipe swipe deletion is coordinated, full-height, and transform-only', () => {
  const card = read('src/components/RecipeCard/index.tsx')
  const styles = read('src/components/RecipeCard/index.scss')
  const page = read('src/pages/index/index.tsx')
  assert.match(card, /activeSwipeId\?: string \| null/)
  assert.match(card, /onSwipeOpen\?: \(id: string \| null\) => void/)
  assert.match(card, /SwipeRef/)
  assert.match(card, /onOpen=/)
  assert.match(card, /onClose=/)
  assert.match(card, />删除<\/Text>/)
  assert.match(page, /const \[openRecipeId, setOpenRecipeId\] = useState<string \| null>\(null\)/)
  assert.match(page, /activeSwipeId=\{openRecipeId\}/)
  assert.match(page, /onSwipeOpen=\{setOpenRecipeId\}/)
  assert.match(styles, /\.nut-swipe-wrapper\{[^}]*transition:transform \.22s/)
  assert.match(styles, /\.nut-swipe-right\{[^}]*align-self:stretch/)
  assert.doesNotMatch(styles, /\.recipe-card[^}]*:active[^}]*transform/)
})
```

- [ ] **Step 3: Run the targeted test and verify RED**

Run: `node --test scripts/ui-source.test.js`

Expected: FAIL because the current navigation still uses `cover-view` and RecipeCard has no coordinated open state.

- [ ] **Step 4: Commit the red tests**

```powershell
git add scripts/ui-source.test.js
git commit -m "test: lock navigation and swipe interaction contract"
```

### Task 2: Rebuild the bottom navigation

**Files:**
- Modify: `src/custom-tab-bar/index.wxml`
- Modify: `src/custom-tab-bar/index.wxss`

- [ ] **Step 1: Replace native overlay elements**

Convert every `cover-view` in the custom tab bar template to `view`. Keep the existing `wx:for`, route data, labels, active classes, and tap handler. Render explicit icon children:

```xml
<view class="custom-tab-icon custom-tab-icon--{{item.icon}}">
  <view class="custom-tab-icon__inner" />
  <view class="custom-tab-icon__head" />
  <view class="custom-tab-icon__body" />
</view>
```

- [ ] **Step 2: Apply the approved B layout**

Keep the shell fixed but non-interactive, position it `16rpx` above the safe area, and reduce the capsule to `112rpx` high with `28rpx` radius and a warm tinted shadow. Restore `pointer-events:auto` only on the capsule. Draw book, plate, and person icons with explicit descendants and one consistent `3rpx` stroke.

- [ ] **Step 3: Run targeted test and verify GREEN for navigation**

Run: `node --test scripts/ui-source.test.js`

Expected: navigation assertions pass; swipe assertions still fail.

- [ ] **Step 4: Build the WeChat target**

Run: `pnpm build:weapp`

Expected: exit 0 and generated custom tab bar contains ordinary `view` nodes.

- [ ] **Step 5: Commit the navigation change**

```powershell
git add src/custom-tab-bar/index.wxml src/custom-tab-bar/index.wxss
git commit -m "fix: keep tab navigation below native overlays"
```

### Task 3: Coordinate and polish swipe deletion

**Files:**
- Modify: `src/components/RecipeCard/index.tsx`
- Modify: `src/components/RecipeCard/index.scss`
- Modify: `src/pages/index/index.tsx`
- Test: `scripts/ui-source.test.js`

- [ ] **Step 1: Add parent-owned open state**

In `src/pages/index/index.tsx`, add `openRecipeId` state. Pass `activeSwipeId={openRecipeId}` and `onSwipeOpen={setOpenRecipeId}` to each deletable RecipeCard. Clear the ID when search or category changes so filtered cards cannot remain logically open.

- [ ] **Step 2: Add the imperative Swipe boundary**

Import `useEffect`, `useRef`, and `SwipeRef`. Add optional `activeSwipeId` and `onSwipeOpen` props. Use the Swipe ref to close whenever another ID becomes active. On `onOpen`, set the current ID; on `onClose`, clear only the current ID. When the row is open, card click closes it and returns without navigating.

- [ ] **Step 3: Make deletion explicit and safe**

Render a single-line `删除` action. Its click handler stops propagation, closes the Swipe, clears the active ID, then calls the existing `onRemove`; no swipe distance directly invokes deletion.

- [ ] **Step 4: Remove competing transforms and fix action sizing**

Move pressed feedback from `.recipe-card { transform: scale(...) }` to a non-transform visual change. Set `.recipe-card__swipe-wrap`, `.nut-swipe-wrapper`, and `.nut-swipe-right` to stretch to the content height; use a `4.5rem` full-height rounded delete block with an `0.5rem` gap. Override the wrapper transition to `transform 220ms` with the project ease token.

- [ ] **Step 5: Run targeted test and verify GREEN**

Run: `node --test scripts/ui-source.test.js`

Expected: all navigation and swipe contract tests pass.

- [ ] **Step 6: Run all UI tests**

Run: `pnpm test:ui`

Expected: all tests pass with no warnings or failures.

- [ ] **Step 7: Commit the swipe change**

```powershell
git add src/components/RecipeCard/index.tsx src/components/RecipeCard/index.scss src/pages/index/index.tsx
git commit -m "fix: coordinate smooth full-height recipe deletion"
```

### Task 4: Final verification

**Files:**
- Verify only

- [ ] **Step 1: Run TypeScript without emitting files**

Run: `pnpm exec tsc --noEmit`

Expected: exit 0.

- [ ] **Step 2: Run all UI and backend regression tests**

Run: `pnpm test:ui`

Run: `pnpm test:backend`

Expected: both commands exit 0.

- [ ] **Step 3: Build the WeChat mini-program**

Run: `pnpm build:weapp`

Expected: exit 0.

- [ ] **Step 4: Manual acceptance in WeChat Developer Tools**

Verify the person icon is visible; the capsule remains fixed near the safe-area bottom; the date picker confirm and cancel buttons are clickable; vertical scrolling wins over diagonal gestures; only one card opens; the action matches card height; card tap closes an open action; and delete still requires modal confirmation.
