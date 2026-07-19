# Core UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将食谱库、今日食谱、我的和底部导航升级为统一、现代、适合家庭使用的移动端界面。

**Architecture:** 保留现有 Taro 4 + React + Redux 数据流，只调整视图结构与 Sass。新增一个无业务状态依赖的 React 自定义 TabBar；各页继续调用已有 thunk 和导航 API。

**Tech Stack:** Taro 4.1.1、React 18、TypeScript、Sass、Redux Toolkit、微信小程序自定义 TabBar

---

### Task 1: 设计令牌与全局基础

**Files:**
- Modify: `src/use/variables.scss`
- Modify: `src/app.scss`

- [ ] 用 DESIGN.md 中的颜色、圆角、间距、阴影和动效替换旧令牌。
- [ ] 为页面背景、按钮、图片和减少动态效果建立全局规则。
- [ ] 运行 `pnpm build:weapp`，预期退出码 0。

### Task 2: 自定义底部导航

**Files:**
- Create: `src/custom-tab-bar/index.tsx`
- Create: `src/custom-tab-bar/index.scss`
- Create: `src/custom-tab-bar/index.config.ts`
- Modify: `src/app.config.ts`

- [ ] 在配置中启用 `tabBar.custom`，保留三个既有路径。
- [ ] 使用当前路由计算激活项，点击调用 `Taro.switchTab`。
- [ ] 以 CSS 图形绘制统一线性图标，避免新增图标依赖。
- [ ] 为安全区、按下态与激活态实现样式。
- [ ] 运行 `pnpm build:weapp`，预期退出码 0 且产物包含 `custom-tab-bar`。

### Task 3: 食谱卡片系统

**Files:**
- Modify: `src/components/RecipeCard/index.tsx`
- Modify: `src/components/RecipeCard/index.scss`

- [ ] 保留现有 props 和滑动删除接口，增加缺图占位与明确删除文字。
- [ ] 建立 grid 与 horizontal 两种由父级上下文控制的响应式表现。
- [ ] 验证食谱库、今日菜单和加菜面板均能复用。

### Task 4: 食谱库页面

**Files:**
- Modify: `src/pages/index/index.tsx`
- Modify: `src/pages/index/index.scss`
- Modify: `src/components/SearchBar/index.scss`
- Modify: `src/components/CategoryNav/index.scss`

- [ ] 增加标题、食谱数量与明确新增按钮。
- [ ] 将分类改为横向滚动，将食谱改为双列网格。
- [ ] 增加搜索无结果和食谱为空状态。
- [ ] 验证搜索、分类、详情、删除和新建路径不变。

### Task 5: 今日食谱页面

**Files:**
- Modify: `src/pages/today/index.tsx`
- Modify: `src/pages/today/index.scss`
- Modify: `src/components/DateSelector/index.scss`

- [ ] 增加页面标题和菜单摘要。
- [ ] 将菜单改为纵向横卡并保留日期滑动逻辑。
- [ ] 优化加载、空状态和添加按钮。
- [ ] 验证过去日期不可编辑，当前日期可添加和移除。

### Task 6: 我的页面

**Files:**
- Modify: `src/pages/profile/index.tsx`
- Modify: `src/pages/profile/index.scss`
- Modify: `src/components/profile/userCard/index.scss`

- [ ] 增加页面标题与家庭语境说明。
- [ ] 重构登录卡、用户卡和功能分组层级。
- [ ] 保留所有登录保护和跳转路径。

### Task 7: 验证与清理

**Files:**
- Verify all modified files

- [ ] 运行 `pnpm build:weapp`，预期退出码 0。
- [ ] 运行 `pnpm build:h5`，预期退出码 0。
- [ ] 用 `rg` 检查旧主色 `#ff6b6b` 和旧 `100vh` 页面布局残留。
- [ ] 检查 `git diff --check`，预期无空白错误。
- [ ] 对照设计规范逐项检查三个核心页面与导航。
