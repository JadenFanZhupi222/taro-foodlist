---
name: 家庭食谱
description: 让一家人轻松管理家常菜与每日菜单
colors:
  primary: "#C9573A"
  primary-deep: "#9E3D27"
  ink: "#20241F"
  text-secondary: "#62685F"
  background: "#F7F7F4"
  surface: "#FFFFFF"
  surface-muted: "#ECEEE9"
  divider: "#DEE1DA"
  success: "#477554"
  danger: "#B64238"
typography:
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.35
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
  search-field:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  recipe-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
---

# Design System: 家庭食谱

## Overview

**Creative North Star: "一张正在使用的家庭餐桌"**

界面像一张每天都有人使用的家庭餐桌：清楚、耐看、略有生活痕迹，但绝不凌乱。真实菜品图片承担温度，系统字体与克制的中性表面保证全家都能读懂和快速操作。产品不伪装成内容平台，也不以促销式视觉刺激用户。

**Key Characteristics:**
- 中性浅底而非奶油色滤镜
- 单一陶土红只用于行动与选中
- 真实图片主导，控件克制
- iPhone 安全区优先，兼容其他设备
- 动效明确表达切换、选择、增删与加载

## Colors

颜色策略为 restrained：中性色占据绝大多数界面，陶土红只在需要行动的地方出现。

### Primary
- **餐桌陶土红**：用于主按钮、当前导航项、选中筛选和关键进度。
- **深陶土红**：用于按下态与需要更高对比度的文字链接。

### Neutral
- **深橄榄墨色**：所有主标题与正文的基础文字色。
- **草木灰**：辅助说明和元数据；不得用于关键正文。
- **中性雾白**：页面底色，不带明显黄色。
- **纯白餐盘**：输入框之外的主要内容表面。
- **叶灰表面**：搜索、未选中筛选和次级分组。

**The One Accent Rule.** 一个屏幕只有陶土红可以作为高强调色；成功、危险色只在真实状态中出现。

## Typography

**Display Font:** 系统中文无衬线字体栈
**Body Font:** 系统中文无衬线字体栈

**Character:** 熟悉、清楚、没有表演性。界面标签、正文和标题共享一套字体，通过尺寸、字重和留白建立层级。

### Hierarchy
- **Headline**（700，28px，1.2）：页面标题，仅一处。
- **Title**（600，18px，1.35）：区块或核心卡片标题。
- **Body**（400，15px，1.55）：正文与菜单项。
- **Label**（500，12px，1.35）：分类、日期和元数据。

**The Readable Family Rule.** 移动端正文不得小于 14px，按钮文字不得小于 15px；不使用大段全大写或装饰性字距。

## Elevation

系统默认扁平，以色块、间距与图片层级表达结构。阴影只用于悬浮导航、临时面板和被拖动的卡片，不给每张白卡片同时添加描边和宽阴影。

### Shadow Vocabulary
- **悬浮导航** (`0 6px 18px rgba(32,36,31,.12)`): 仅用于底部自定义导航。
- **交互抬升** (`0 3px 8px rgba(32,36,31,.10)`): 仅在活动或拖动状态。

**The Flat-by-Default Rule.** 静止内容不靠阴影证明自己是卡片。

## Components

### Buttons
- **Shape:** 明确但不夸张的圆角（12px）。
- **Primary:** 陶土红底、白字、最小高度 48px。
- **Focus / Active:** 清晰外圈；按下缩放到 0.98，持续 160ms。
- **Secondary:** 叶灰表面和深色文字，不与主按钮竞争。

### Chips
- **Style:** 8px 圆角而非全部胶囊；未选中使用叶灰表面。
- **State:** 选中态使用深橄榄底和白字，同时通过字重表达，不只依赖颜色。

### Cards / Containers
- **Corner Style:** 外层 16px、内部图片 12px。
- **Background:** 图片型卡片允许标题压在渐暗图片底部；信息型卡片使用纯白表面。
- **Shadow Strategy:** 默认无阴影。
- **Internal Padding:** 12–16px。

### Inputs / Fields
- **Style:** 叶灰填充、无装饰性边框、12px 圆角。
- **Focus:** 背景转白并显示 2px 陶土红焦点环。
- **Error / Disabled:** 必须包含文字说明；禁用态降低对比但保持可读。

### Navigation
- 悬浮式三项底部导航，高度 64px，左右各 16px，底部位置包含安全区。
- 默认项为草木灰；当前项使用陶土红、较高字重和独立形状标识。
- 切换使用 180ms 状态过渡，不安排页面入场表演。

### Recipe Card
- 食谱库采用两列图片主导卡片；今日菜单采用横向信息卡。
- 删除动作通过明确按钮或滑动后显示文字“删除”，永远不使用孤立的 `x`。
- 缺图时显示中性占位和菜名，不展示破损图片。

## Do's and Don'ts

### Do:
- **Do** 让真实菜品图片承担情绪表达。
- **Do** 在所有主页面为底部安全区预留至少 96px 内容空间。
- **Do** 为加载使用匹配布局的骨架屏，为空状态提供下一步行动。
- **Do** 让选中状态同时包含颜色、字重或形状变化。
- **Do** 使用 150–250ms 的 ease-out 状态动效，并尊重系统减少动态效果设置。

### Don't:
- **Don't** 制造外卖平台感：禁止促销角标、价格视觉、高饱和多色和拥挤推荐流。
- **Don't** 制造儿童卡通感：禁止糖果色、夸张表情插画和过度圆润组件。
- **Don't** 堆叠模板化奶油色卡片；页面底色必须保持中性。
- **Don't** 为了“高级”隐藏关键入口或降低文字对比度。
- **Don't** 同时给静态卡片添加 1px 描边和大范围软阴影。
