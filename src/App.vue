<template>
  <div class="omniflow-app">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: currentView === item.id }"
          @click="currentView = item.id"
        >
          <component :is="item.icon" :size="20" weight="duotone" />
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-area">
      <!-- 对话视图 -->
      <ChatView v-if="currentView === 'chat'" />

      <!-- 画布视图 -->
      <InfiniteCanvas v-else-if="currentView === 'canvas'" />

      <!-- 插件视图 -->
      <div v-else-if="currentView === 'plugins'" class="view-container">
        <div class="view-header">
          <h2>插件管理</h2>
          <p class="text-secondary">管理和安装插件</p>
        </div>
        <div class="view-content">
          <p class="text-muted">插件功能开发中...</p>
        </div>
      </div>

      <!-- 设置视图 -->
      <div v-else-if="currentView === 'settings'" class="settings-view">
        <MCPManager />
      </div>
    </main>

    <!-- 画布快速添加按钮 -->
    <button
      v-if="currentView === 'canvas'"
      class="fab"
      @click="addPanel"
      title="添加面板"
    >
      <PhPlus :size="24" weight="bold" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  PhChatCircle, 
  PhSquaresFour, 
  PhPlug, 
  PhGear,
  PhPlus
} from '@phosphor-icons/vue';
import ChatView from '@/components/Chat/ChatView.vue';
import InfiniteCanvas from '@/components/Canvas/InfiniteCanvas.vue';
import MCPManager from '@/components/MCP/MCPManager.vue';
import { usePanelStore } from '@/stores/panels';

type ViewType = 'chat' | 'canvas' | 'plugins' | 'settings';

const currentView = ref<ViewType>('chat');
const panelStore = usePanelStore();

const navItems = [
  { id: 'chat', icon: PhChatCircle, label: '对话' },
  { id: 'canvas', icon: PhSquaresFour, label: '画布' },
  { id: 'plugins', icon: PhPlug, label: '插件' },
  { id: 'settings', icon: PhGear, label: '设置' }
];

function addPanel() {
  panelStore.addPanel({
    type: 'terminal',
    title: 'Terminal',
    position: { x: 100, y: 100 },
    size: { w: 600, h: 400 },
    minimized: false
  });
}
</script>

<style scoped>
.omniflow-app {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: var(--surface-0);
}

/* 侧边栏 */
.sidebar {
  width: 60px;
  background: var(--surface-1);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  gap: 2px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 150ms ease-out;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--focus-blue);
  border-radius: 0 2px 2px 0;
  transition: height 150ms ease-out;
}

.nav-item:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.nav-item.active {
  color: var(--focus-blue);
}

.nav-item.active::before {
  height: 24px;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}

/* 主内容区域 */
.main-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.view-container {
  padding: 32px;
  overflow-y: auto;
  height: 100%;
}

.view-header {
  margin-bottom: 24px;
}

.view-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.view-content {
  background: var(--surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 24px;
}

.settings-view {
  height: 100%;
  overflow-y: auto;
}

/* 浮动操作按钮 */
.fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  border: none;
  background: var(--focus-blue);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(74, 158, 255, 0.4);
  transition: all 150ms ease-out;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(74, 158, 255, 0.5);
}

.fab:active {
  transform: scale(0.95);
}
</style>
