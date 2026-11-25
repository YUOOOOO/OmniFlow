# OmniFlow 重构计划

基于 Cate 架构 + Toonflow UI 风格

## 核心原则

1. **UI 风格**：完全参考 Toonflow/Cate 的设计（配色、字体、图标）
2. **插件优先**：Terminal、Editor 等都是插件，不是内置组件
3. **精致细节**：不是 Demo，要做成可用的产品

## 架构分层

### 核心层（Core）
**不可插拔，内置功能：**
- 画布系统（InfiniteCanvas）
- 对话界面（ChatView）
- 插件管理器（PluginManager）
- Agent 服务（AgentService）
- MCP 基础设施（MCPManager）
- UI 框架（Sidebar、MenuBar、StatusBar）

### 插件层（Plugins）
**动态加载，可扩展：**
- Terminal 插件
- Editor 插件
- Browser 插件
- Notebook 插件
- 协议插件（GitHub、Jira 等）

## 重构步骤

### Phase 1: 核心 UI 重构（今天）

**任务：**
1. ✅ 创建设计规范文档
2. [ ] 安装 Tailwind CSS
3. [ ] 安装 Phosphor Icons
4. [ ] 创建全局样式（参考 Cate globals.css）
5. [ ] 重写组件使用 Toonflow 风格：
   - [ ] App.vue（侧边栏 + 主区域）
   - [ ] ChatView.vue（对话界面）
   - [ ] InfiniteCanvas.vue（画布）
   - [ ] Panel.vue（面板框架）

### Phase 2: 插件系统核心（明天）

**任务：**
1. [ ] 创建 PluginManager
2. [ ] 实现插件加载器
3. [ ] 定义插件 API
4. [ ] 实现节点注册表
5. [ ] 插件目录扫描

### Phase 3: 第一个插件（后天）

**任务：**
1. [ ] 创建 Terminal 插件项目
2. [ ] 集成 xterm.js
3. [ ] 实现 TerminalNode 组件
4. [ ] 插件打包和加载测试

### Phase 4: Agent 集成（下周）

**任务：**
1. [ ] AgentService 实现
2. [ ] AI API 集成
3. [ ] 画布操作指令
4. [ ] Function Calling

### Phase 5: 协议插件（下周）

**任务：**
1. [ ] ProtocolManager
2. [ ] GitHub 协议插件示例
3. [ ] Agent 调用协议

## 技术栈更新

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "pinia": "^2.1.0",
    "element-plus": "^2.5.0",
    "@phosphor-icons/vue": "^2.1.0",
    "@xterm/xterm": "^5.5.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## UI 组件清单

### 核心组件（Core）
- [x] App.vue - 应用外壳
- [x] ChatView.vue - 对话界面
- [x] InfiniteCanvas.vue - 画布
- [x] Panel.vue - 面板框架
- [ ] Sidebar.vue - 侧边栏（需重写）
- [ ] MenuBar.vue - 菜单栏（新建）
- [ ] StatusBar.vue - 状态栏（新建）

### 插件组件（Plugin Templates）
- [ ] TerminalNode.vue - Terminal 插件示例
- [ ] EditorNode.vue - Editor 插件示例

## 配色应用

**侧边栏：**
- 背景：`--surface-1` (#232220)
- 边框：`--border-subtle`
- 激活项：`--focus-blue`

**画布：**
- 背景：`--canvas-bg` (#161513)
- 网格：`--grid-dot`

**面板：**
- 背景：`--surface-2` (#282724)
- 边框：`--border-strong`
- 阴影：`--shadow-node`

**文本：**
- 主要：`--text-primary` (#e8e6e3)
- 次要：`--text-secondary` (#a8a49e)
- 弱化：`--text-muted` (#78746e)

## 关键区别

### ❌ 之前的问题
- 随便定义的暗黑风格
- Terminal 作为内置组件
- 简陋的 Demo UI

### ✅ 现在的方向
- 严格遵循 Toonflow 设计系统
- Terminal 作为插件开发
- 精致的产品级 UI

## 下一步行动

立即执行 Phase 1：
1. 安装 Tailwind CSS 和 Phosphor Icons
2. 创建全局样式
3. 重写所有组件使用新设计系统
