<template>
  <div class="omniflow-app">
    <!-- 顶部标签栏 -->
    <header class="top-tabs">
      <nav class="tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="tab-item"
          :class="{ active: currentView === tab.id }"
          @click="currentView = tab.id"
        >
          <component :is="tab.icon" :size="18" weight="duotone" />
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 画布视图 -->
      <InfiniteCanvas v-if="currentView === 'canvas'" />

      <!-- 文件视图 -->
      <FileExplorer v-else-if="currentView === 'files'" />
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

    <!-- 悬浮对话框 -->
    <FloatingChat />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  PhSquaresFour, 
  PhFiles,
  PhPlus
} from '@phosphor-icons/vue';
import InfiniteCanvas from '@/components/Canvas/InfiniteCanvas.vue';
import FileExplorer from '@/components/Files/FileExplorer.vue';
import FloatingChat from '@/components/Chat/FloatingChat.vue';
import { usePanelStore } from '@/stores/panels';

type ViewType = 'canvas' | 'files';

const currentView = ref<ViewType>('canvas');
const panelStore = usePanelStore();

const tabs = [
  { id: 'canvas', icon: PhSquaresFour, label: '画布' },
  { id: 'files', icon: PhFiles, label: '文件' }
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
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background: var(--surface-0);
}

/* 顶部标签栏 */
.top-tabs {
  height: 48px;
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tabs-nav {
  display: flex;
  gap: 4px;
  padding: 0 12px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 150ms ease-out;
  position: relative;
}

.tab-item:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.tab-item.active {
  background: var(--surface-3);
  color: var(--focus-blue);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--focus-blue);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  position: relative;
  overflow: hidden;
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
