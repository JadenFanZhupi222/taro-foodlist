# 家庭食谱全页面 UI 完成 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变业务逻辑的前提下，让全部已注册页面具备统一、完整、可在微信小程序中运行的家庭食谱视觉体验。

**Architecture:** 复用现有 React/Taro 页面和 Redux 回调，只新增展示型基础组件与语义化样式。页面按食谱、家庭、个人与静态说明四批改造，每批均用源文件约束测试和微信生产构建验证，避免再次产生非法 WXSS 或 React/Taro 导出错误。

**Tech Stack:** Taro 4.1.1、React 18、TypeScript、SCSS、Node test runner、微信小程序 Vite 构建。

---

## 文件结构

- `src/components/PageHeader/`：统一页面 eyebrow、标题、说明和右侧操作。
- `src/components/StateView/`：统一加载、空和说明状态，不读取业务状态。
- `src/components/SettingPage/`：静态设置与说明页的语义化页面骨架。
- `src/use/variables.scss`：既有设计 token 的唯一来源。
- `src/pages/recipe/detail/`、`src/pages/recipe/edit/`：食谱详情与表单视觉。
- `src/pages/today/addRecipes/`：选择菜谱视觉状态。
- `src/pages/family/`：家庭摘要、成员与邀请视觉。
- `src/pages/profile/`：个人入口与资料表单视觉。
- `src/pages/favorites/`、`history/`、`settings/`：不新增业务能力的完成态说明页。
- `scripts/ui-source.test.js`：业务边界、占位页移除、React Hook 导入和微信样式约束回归测试。

### Task 1: 建立 UI 回归护栏

**Files:**
- Create: `scripts/ui-source.test.js`
- Modify: `package.json`

- [ ] **Step 1: 写失败测试**

测试必须检查：五个占位页面不再导入 `ComingSoon`；所有使用 `useState` 的 TSX 从 `react` 导入；全局样式不包含 `prefers-reduced-motion`；页面不得修改 thunk、selector、云函数和项目配置。

- [ ] **Step 2: 验证测试因占位页面失败**

Run: `node --test scripts/ui-source.test.js`
Expected: FAIL，指出 favorites/history/settings 页面仍引用 `ComingSoon`。

- [ ] **Step 3: 将测试加入统一命令**

在 `package.json` 添加 `test:ui`，值为 `node --test scripts/app-style.test.js scripts/ui-source.test.js`。

- [ ] **Step 4: 提交测试护栏**

```bash
git add scripts/ui-source.test.js package.json
git commit -m "test: add full UI completion guardrails"
```

### Task 2: 建立共享展示组件

**Files:**
- Create: `src/components/PageHeader/index.tsx`
- Create: `src/components/PageHeader/index.scss`
- Create: `src/components/StateView/index.tsx`
- Create: `src/components/StateView/index.scss`
- Modify: `src/use/variables.scss`

- [ ] **Step 1: 实现 PageHeader**

Props 固定为 `eyebrow?: string`、`title: string`、`description?: string`、`action?: ReactNode`，只负责布局和文本层级。

- [ ] **Step 2: 实现 StateView**

Props 固定为 `kind: 'empty' | 'info' | 'error'`、`title`、`description`、`actionLabel?`、`onAction?`，使用纯 CSS 餐盘意象，禁止引入动态 Lottie。

- [ ] **Step 3: 补齐共享 token**

仅添加缺失的状态色、页面间距和表单 token，不复制已有主色、圆角和动效变量。

- [ ] **Step 4: 运行基础验证并提交**

Run: `pnpm test:ui`
Expected: 仍只因占位页面失败，共享组件无语法错误。

```bash
git add src/components/PageHeader src/components/StateView src/use/variables.scss
git commit -m "feat: add shared family UI primitives"
```

### Task 3: 完成食谱详情、编辑与选择流程

**Files:**
- Modify: `src/pages/recipe/detail/index.tsx`
- Modify: `src/pages/recipe/detail/index.scss`
- Modify: `src/pages/recipe/edit/index.tsx`
- Modify: `src/pages/recipe/edit/index.scss`
- Modify: `src/pages/today/addRecipes/index.tsx`
- Modify: `src/pages/today/addRecipes/index.scss`

- [ ] **Step 1: 重排详情页展示结构**

保留原 selector、路由参数和删除/编辑回调；将封面、元信息、描述、食材和步骤组织为语义区块，并提供无图片占位。

- [ ] **Step 2: 重排编辑页表单**

保留全部 state、上传、校验和提交逻辑；只将基础信息、食材、步骤和底部操作拆为视觉分组。

- [ ] **Step 3: 完善添加菜谱选中态**

保留搜索、分类、选择与保存逻辑；增加已选数量、卡片选中反馈和底部安全区。

- [ ] **Step 4: 运行 UI 测试与微信构建**

Run: `pnpm test:ui && pnpm build:weapp`
Expected: UI 测试仍只因未处理占位页失败；微信构建成功。

- [ ] **Step 5: 提交食谱流程**

```bash
git add src/pages/recipe/detail src/pages/recipe/edit src/pages/today/addRecipes
git commit -m "feat: complete recipe flow visual design"
```

### Task 4: 完成家庭与个人流程

**Files:**
- Modify: `src/pages/family/index.tsx`
- Modify: `src/pages/family/index.scss`
- Modify: `src/pages/family/acceptInvite/index.tsx`
- Modify: `src/pages/family/acceptInvite/index.scss`
- Modify: `src/components/family/memberCard/index.tsx`
- Modify: `src/components/family/memberCard/index.scss`
- Modify: `src/components/family/noFamilyScreen/index.tsx`
- Modify: `src/components/family/noFamilyScreen/index.scss`
- Modify: `src/pages/profile/edit/index.tsx`
- Modify: `src/pages/profile/edit/index.scss`

- [ ] **Step 1: 完成家庭关系卡和成员层级**

保留家庭查询、创建、加入、退出和邀请逻辑；调整摘要、成员列表和危险操作层级。

- [ ] **Step 2: 完成无家庭与邀请状态**

保留弹层和邀请码逻辑；使用家庭语境说明、明确主次按钮和完整错误状态。

- [ ] **Step 3: 完成个人资料表单**

保留头像选择、上传、昵称和保存逻辑；统一头像区、字段组、帮助文字和底部操作。

- [ ] **Step 4: 构建验证并提交**

Run: `pnpm build:weapp`
Expected: 微信构建成功，生成 WXSS 无空媒体块。

```bash
git add src/pages/family src/components/family src/pages/profile/edit
git commit -m "feat: complete family and profile visual flows"
```

### Task 5: 替换所有通用占位页面

**Files:**
- Create: `src/components/SettingPage/index.tsx`
- Create: `src/components/SettingPage/index.scss`
- Modify: `src/pages/favorites/index.tsx`
- Modify: `src/pages/favorites/index.scss`
- Modify: `src/pages/history/index.tsx`
- Modify: `src/pages/history/index.scss`
- Modify: `src/pages/settings/notification/index.tsx`
- Modify: `src/pages/settings/notification/index.scss`
- Modify: `src/pages/settings/privacy/index.tsx`
- Modify: `src/pages/settings/privacy/index.scss`
- Modify: `src/pages/settings/about/index.tsx`
- Modify: `src/pages/settings/about/index.scss`

- [ ] **Step 1: 实现静态 SettingPage**

组件接受标题、说明、图标语义、分组条目和底部说明，只展示传入内容，不创建开关状态或持久化行为。

- [ ] **Step 2: 为五个页面写真实完成态文案**

收藏和历史说明当前能力边界；通知页说明微信系统通知依赖；隐私页说明家庭数据用途；关于页展示产品定位。不得出现虚假的已开启开关、统计或版本能力。

- [ ] **Step 3: 验证回归测试转绿**

Run: `pnpm test:ui`
Expected: PASS，所有占位页面已移除且 React Hook 导入正确。

- [ ] **Step 4: 微信构建并提交**

Run: `pnpm build:weapp`
Expected: PASS。

```bash
git add src/components/SettingPage src/pages/favorites src/pages/history src/pages/settings
git commit -m "feat: finish informational and settings pages"
```

### Task 6: 全局收口与最终验证

**Files:**
- Modify only if required by verification: `src/components/Loading/index.scss`
- Modify only if required by verification: `src/components/RecipeCard/index.scss`
- Modify only if required by verification: `src/pages/index/index.scss`
- Modify only if required by verification: `src/pages/today/index.scss`
- Modify only if required by verification: `src/pages/profile/index.scss`

- [ ] **Step 1: 检查核心页面间距、动效和安全区**

只修复与设计规格不一致的共享间距、触控反馈和底部导航遮挡，不改变 JSX 业务结构。

- [ ] **Step 2: 运行完整验证**

Run: `pnpm test:ui && pnpm test:backend && pnpm build:weapp`
Expected: 所有测试和构建通过。

- [ ] **Step 3: 检查生成产物**

确认 `dist/app-origin.wxss` 不含空 `@media`；页面产物中的 React Hook 通过 `reactExports` 调用；没有 `taro.useState`。

- [ ] **Step 4: 检查变更边界**

确认没有暂存或提交 `project.config.json`、云函数、数据库脚本、Redux thunk、selector 和用户已有的数据库计划修改。

- [ ] **Step 5: 提交最终收口**

```bash
git add src scripts/ui-source.test.js package.json
git commit -m "feat: finish full family recipe UI redesign"
```
