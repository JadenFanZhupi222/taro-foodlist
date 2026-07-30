# Recipe Image Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a clear, animated entry point from the recipe detail hero image into the platform-native zoomable image preview.

**Architecture:** Keep the feature local to the recipe detail page. A Taro `View` supplies the press state and click target, `Taro.previewImage` supplies full-screen zoom and drag behavior, and the existing toast helper reports preview failures without introducing page state or dependencies.

**Tech Stack:** Taro 4.1.1, React 18, TypeScript, Sass, Node.js built-in test runner

---

## File Structure

- Modify `scripts/ui-resilience.test.js`: add source-level regression coverage for the preview call, real-image-only rendering, affordance, press animation, and unsupported media-query exclusion.
- Modify `src/pages/recipe/detail/index.tsx`: add the local preview handler and interactive hero-image wrapper.
- Modify `src/pages/recipe/detail/index.scss`: add wrapper, pressed image transform, and “放大查看” affordance styles.

### Task 1: Define the image-preview contract

**Files:**
- Test: `scripts/ui-resilience.test.js`

- [ ] **Step 1: Write the failing source regression test**

Add this test after the existing recipe-detail empty-state test:

```js
test('recipe detail previews real hero images with a restrained press affordance', () => {
  const source = read('src/pages/recipe/detail/index.tsx')
  const styles = read('src/pages/recipe/detail/index.scss')

  assert.match(source, /Taro\.previewImage\(\{\s*current:\s*recipe\.image,\s*urls:\s*\[recipe\.image\]\s*\}\)/s)
  assert.match(source, /recipe-detail__image-wrap/)
  assert.match(source, /hoverClass='recipe-detail__image-wrap--pressed'/)
  assert.match(source, />放大查看<\/Text>/)
  assert.match(source, /图片暂时无法预览/)
  assert.match(
    source,
    /recipe\.image\s*\?\s*\([\s\S]*recipe-detail__image-wrap[\s\S]*\)\s*:\s*\([\s\S]*recipe-detail__image-placeholder/
  )
  assert.match(styles, /\.recipe-detail__image-wrap--pressed\s+\.recipe-detail__image\s*\{[^}]*transform:\s*scale\(\.985\)/s)
  assert.match(styles, /\.recipe-detail__image-hint\s*\{[^}]*position:\s*absolute/s)
  assert.doesNotMatch(styles, /prefers-reduced-motion/)
})
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```powershell
node --test --test-name-pattern="recipe detail previews real hero images" scripts/ui-resilience.test.js
```

Expected: `FAIL`; the current page has no `Taro.previewImage` call or image wrapper.

- [ ] **Step 3: Commit the failing contract test**

```powershell
git add -- scripts/ui-resilience.test.js
git commit -m "test: define recipe image preview contract"
```

### Task 2: Implement native preview and visual feedback

**Files:**
- Modify: `src/pages/recipe/detail/index.tsx`
- Modify: `src/pages/recipe/detail/index.scss`

- [ ] **Step 1: Add the existing toast helper import and preview handler**

Add the import:

```ts
import { showToast } from '@/utils/toast'
```

After the normalized ingredient and step values, add:

```ts
  const handlePreviewImage = () => {
    if (!recipe.image) return

    Taro.previewImage({
      current: recipe.image,
      urls: [recipe.image]
    }).catch(() => {
      showToast({ title: '图片暂时无法预览' })
    })
  }
```

- [ ] **Step 2: Replace only the real-image branch with the interactive wrapper**

Use this rendering while leaving the existing placeholder branch unchanged:

```tsx
      {recipe.image ? (
        <View
          className='recipe-detail__image-wrap'
          hoverClass='recipe-detail__image-wrap--pressed'
          hoverStayTime={160}
          onClick={handlePreviewImage}
        >
          <Image className='recipe-detail__image' src={recipe.image} mode='aspectFill' />
          <Text className='recipe-detail__image-hint'>放大查看</Text>
        </View>
      ) : (
        <View className='recipe-detail__image-placeholder'><View className='recipe-detail__plate' /></View>
      )}
```

- [ ] **Step 3: Add the wrapper, transform, and hint styles**

Expand the existing image rules with:

```scss
.recipe-detail__image-wrap {
  width: 100%;
  height: 18rem;
  position: relative;
  overflow: hidden;
}

.recipe-detail__image {
  height: 100%;
  transition: transform $duration-fast $ease-out;
  transform-origin: center;
}

.recipe-detail__image-wrap--pressed .recipe-detail__image {
  transform: scale(.985);
}

.recipe-detail__image-hint {
  position: absolute;
  right: .75rem;
  bottom: 2rem;
  padding: .35rem .55rem;
  border-radius: $radius-pill;
  background: rgba(32, 36, 31, .66);
  color: $color-text-light;
  font-size: .7rem;
  font-weight: $font-weight-medium;
  line-height: 1.2;
  pointer-events: none;
}
```

Keep `.recipe-detail__image-placeholder` at `18rem`. The hint sits above the content card overlap, whose negative top margin is `1.4rem`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```powershell
node --test --test-name-pattern="recipe detail previews real hero images" scripts/ui-resilience.test.js
```

Expected: `PASS`.

- [ ] **Step 5: Run the complete UI suite**

Run:

```powershell
pnpm test:ui
```

Expected: all UI tests pass.

- [ ] **Step 6: Commit the implementation**

```powershell
git add -- src/pages/recipe/detail/index.tsx src/pages/recipe/detail/index.scss
git commit -m "feat: preview recipe detail images"
```

### Task 3: Verify the target build

**Files:**
- No source changes expected.

- [ ] **Step 1: Build the WeChat mini program**

Run:

```powershell
pnpm build:weapp
```

Expected: the source preflight tests and Taro production build exit successfully.

- [ ] **Step 2: Inspect the final scoped diff and worktree**

Run:

```powershell
git status --short
git log -4 --oneline
```

Expected: only the user's pre-existing modifications remain unstaged; the design, test, and implementation commits are present. No browser preview is started.

## Plan Self-Review

- Spec coverage: native full-screen preview, one-image URL list, press feedback, affordance, placeholder exclusion, failure toast, shared-style compatibility, UI tests, and WeChat build are all mapped to explicit steps.
- Scope: changes remain local to the recipe detail page plus one existing source-regression test file.
- Type consistency: `recipe.image` is guarded before `Taro.previewImage`; `current` and `urls` both receive the same narrowed string.
- Placeholder scan: the plan contains no deferred decisions or incomplete implementation steps.
