# OmniFlow 设计规范

基于 Cate/Toonflow 的设计系统

## 配色方案

### Surface (背景层次)
```css
--surface-0: #1d1c1a;    /* 最深背景 */
--surface-1: #232220;    /* 侧边栏 */
--surface-2: #282724;    /* 卡片 */
--surface-3: #2c2b28;    /* 悬停 */
--surface-4: #322f2c;
--surface-5: #3a3733;
--surface-6: #423f3a;
```

### Canvas (画布)
```css
--canvas-bg: #161513;        /* 画布背景 */
--canvas-bg-alt: #1c1b19;    /* 画布次要背景 */
--grid-dot: rgba(255, 255, 255, 0.077);  /* 网格点 */
--grid-line: rgba(255, 255, 255, 0.03);  /* 网格线 */
```

### Border (边框)
```css
--border-subtle: rgba(255, 255, 255, 0.035);  /* 细微边框 */
--border-strong: rgba(255, 255, 255, 0.14);   /* 强调边框 */
--border-focus: #4a9eff;                      /* 聚焦边框 */
```

### Text (文本)
```css
--text-primary: #e8e6e3;      /* 主要文本 */
--text-secondary: #a8a49e;    /* 次要文本 */
--text-muted: #78746e;        /* 弱化文本 */
--text-inverse: #141311;      /* 反色文本 */
```

### Accent (强调色)
```css
--focus-blue: #4a9eff;        /* 蓝色 - 聚焦/链接 */
--activity-green: #4dd964;    /* 绿色 - 成功/活动 */
--activity-orange: #ff9f0a;   /* 橙色 - 警告 */
--agent-rgb: 74 158 255;      /* Agent 主题色 */
```

### Panel Type Colors (面板类型色)
```css
--panel-terminal: #4a9960;    /* Terminal 绿 */
--panel-browser: #4a7ab0;     /* Browser 蓝 */
--panel-editor: #b07440;      /* Editor 橙 */
--panel-canvas: #8857b0;      /* Canvas 紫 */
```

## 字体

```css
--font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
```

## 阴影

```css
--shadow-node: rgba(0, 0, 0, 0.45);              /* 节点阴影 */
--shadow-node-focused: rgba(74, 158, 255, 0.35); /* 聚焦节点阴影 */
```

## 圆角

- 小圆角：4px
- 中圆角：6px
- 大圆角：8px
- 面板：8px

## 间距

- 紧凑：4px, 8px
- 标准：12px, 16px
- 宽松：20px, 24px

## Icon 系统

使用 **Phosphor Icons**（Cate 使用的图标库）

```bash
npm install @phosphor-icons/react
```

常用图标：
- Chat: `ChatCircle`
- Canvas: `SquaresFour`
- Plugins: `Plug`
- Settings: `Gear`
- Terminal: `Terminal`
- Add: `Plus`

## 组件规范

### 侧边栏
- 宽度：240px（展开）/ 60px（收起）
- 背景：`--surface-1`
- 边框：`--border-subtle`

### 面板
- 最小尺寸：200x150px
- 背景：`--surface-2`
- 边框：`--border-strong`
- 圆角：8px
- 阴影：`--shadow-node`
- 聚焦时：边框 `--border-focus`，阴影 `--shadow-node-focused`

### 画布
- 背景：`--canvas-bg`
- 网格：点状或线状，使用 `--grid-dot` / `--grid-line`

### 按钮
- 主按钮：`--focus-blue` 背景
- 次按钮：`--surface-3` 背景
- 悬停：`--surface-hover`

## 动画

- 过渡时长：150ms（快速）/ 250ms（标准）
- 缓动：ease-out

## Tailwind 配置

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: {
          0: 'var(--surface-0)',
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        canvas: {
          bg: 'var(--canvas-bg)',
          alt: 'var(--canvas-bg-alt)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        focus: 'var(--focus-blue)',
        agent: 'rgb(var(--agent-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
    },
  },
};
```

## 参考

- Cate 源码：`/d/YU/cate-reference/src/shells/desktop/renderer/styles/globals.css`
- 设计哲学：温暖的暗色调，细腻的层次，精致的细节
