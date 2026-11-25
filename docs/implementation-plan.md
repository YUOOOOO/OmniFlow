# OmniFlow 实施计划

基于 Vue 3 技术栈，借鉴 Cate 的设计思路

## 技术栈

- Vue 3 + TypeScript
- Electron
- Vite
- Pinia (状态管理)
- Element Plus (UI 组件)
- xterm.js (终端)
- Monaco Editor (代码编辑，可选)

## 架构设计

### 核心模块

```
src/
├── components/
│   ├── Canvas/          # 画布系统
│   ├── Panels/          # 面板系统（借鉴 Cate）
│   ├── Chat/            # 对话界面
│   └── Sidebar/         # 侧边栏
├── composables/         # Vue 组合式函数
│   ├── useDraggable.ts  # 拖拽逻辑
│   ├── useCanvas.ts     # 画布逻辑
│   └── useAgent.ts      # Agent 集成
├── services/            # 服务层
│   ├── agent.ts         # AI Agent
│   ├── terminal.ts      # 终端服务
│   └── workspace.ts     # 工作区管理
├── stores/              # Pinia stores
│   ├── canvas.ts        # 画布状态
│   ├── panels.ts        # 面板状态
│   └── chat.ts          # 对话状态
├── types/               # TypeScript 类型
│   ├── panel.ts
│   ├── agent.ts
│   └── plugin.ts
└── plugins/             # 插件目录（运行时加载）
```

### 借鉴 Cate 的设计

1. **面板系统**（panels/framework）
   - 可拖拽
   - 可停靠
   - 可调整大小
   - 布局持久化

2. **画布系统**（panels/canvas）
   - 无限缩放
   - 平移
   - 网格背景

3. **Agent 集成**（services/agents）
   - Agent 状态管理
   - 对话历史
   - 流式响应

4. **工作区管理**（workspace/）
   - 状态持久化
   - 自动保存

## 实施步骤

### Phase 1: 核心框架（本周）

**任务：**
- [ ] 安装依赖（Pinia、xterm.js 等）
- [ ] 创建目录结构
- [ ] 设置 Pinia stores
- [ ] 创建基础组件骨架

### Phase 2: 面板系统（本周）

**任务：**
- [ ] 实现 Panel.vue 组件
- [ ] 实现拖拽逻辑（useDraggable）
- [ ] 实现 TerminalPanel 组件
- [ ] 面板布局持久化

### Phase 3: 画布系统（本周）

**任务：**
- [ ] 实现 InfiniteCanvas.vue
- [ ] ��放、平移功能
- [ ] 画布状态管理（Pinia）
- [ ] 网格背景

### Phase 4: 对话界面（下周）

**任务：**
- [ ] ChatView.vue 组件
- [ ] 对话历史显示
- [ ] 输入框和发送
- [ ] AI 响应渲染

### Phase 5: Agent 集成（下周）

**任务：**
- [ ] Agent 服务封装
- [ ] AI API 集成
- [ ] 画布操作指令
- [ ] Function Calling

### Phase 6: 插件系统（后续）

**任务：**
- [ ] 插件加载器
- [ ] 节点插件
- [ ] 协议插件
- [ ] 插件市场

## 关键特性

### 1. 对话优先界面

- 默认显示对话界面
- 通过对话创建画布和节点
- 画布状态在对话中展示

### 2. 混合 UI 模式

- 外层：侧边栏、菜单栏、状态栏
- 画布内：节点面板（可拖拽）
- 悬浮：AI 助手对话框

### 3. 插件扩展

- 节点插件：自定义节点类型
- 协议插件：外部服务集成
- 技能插件：Agent 能力扩展

### 4. MCP + Skills（内置）

- MCP：文件系统、命令执行
- Skills：代码生成、文本处理等

## 开发规范

- TypeScript 严格模式
- 组件使用 `<script setup>` 语法
- 样式使用 Tailwind CSS（可选）或 Element Plus 主题
- Git 提交使用 Conventional Commits

## 参考资源

- Cate 源码：/d/YU/cate-reference
- Toonflow：AI 漫剧工具
- 设计文档：docs/plugin-system-design.md
