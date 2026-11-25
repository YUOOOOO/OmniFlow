<template>
  <div class="omniflow-app">
    <!-- 主画布（全屏） -->
    <InfiniteCanvas />

    <!-- 画布快速添加按钮 -->
    <button class="fab" @click="addPanel" title="添加面板">
      <PhPlus :size="24" weight="bold" />
    </button>

    <!-- 悬浮对话框 -->
    <FloatingChat />
  </div>
</template>

<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue';
import InfiniteCanvas from '@/components/Canvas/InfiniteCanvas.vue';
import FloatingChat from '@/components/Chat/FloatingChat.vue';
import { usePanelStore } from '@/stores/panels';

const panelStore = usePanelStore();

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
  width: 100vw;
  height: 100vh;
  background: var(--surface-0);
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
