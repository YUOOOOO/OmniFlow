# OmniFlow

无限画布 + 插件系统

## 特性

- 🎨 无限画布（基于 Vue Flow）
- 🔌 运行时插件系统
- 📦 支持自定义节点类型
- 🎯 混合 UI 模式（画布内节点 + 外层应用 UI）
- 💾 数据持久化
- 🔄 插件间通信

## 技术栈

- Vue 3 + TypeScript
- Vue Flow
- Electron
- Vite
- pnpm (monorepo)

## 项目结构

```
OmniFlow/
├── apps/
│   ├── desktop/      # Electron 主进程
│   └── renderer/     # Vue 渲染进程
├── packages/
│   └── plugin-runtime/  # 插件运行时 API
├── plugins/
│   ├── terminal/     # Terminal 插件
│   └── notebook/     # Notebook 插件
└── docs/            # 文档
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

## 插件开发

详见 [插件开发文档](./docs/plugin-development.md)
