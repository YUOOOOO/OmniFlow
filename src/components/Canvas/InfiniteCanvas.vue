<template>
  <div class="infinite-canvas">
    <VueFlow
      v-model="elements"
      :min-zoom="0.2"
      :max-zoom="8"
      :snap-to-grid="true"
      :snap-grid="[20, 20]"
      :default-viewport="{ x: 0, y: 0, zoom: 1 }"
      :pan-on-scroll="true"
      :zoom-on-pinch="true"
      :zoom-on-scroll="true"
      :zoom-on-double-click="false"
      @pane-ready="onPaneReady"
    >
      <!-- 背景网格 -->
      <Background
        :pattern-color="'var(--border-subtle)'"
        :gap="20"
        variant="dots"
      />

      <!-- 控制器 -->
      <Controls
        :show-zoom="true"
        :show-fit-view="true"
        :show-interactive="false"
      />

      <!-- 自定义节点 -->
      <template #node-panel="nodeProps">
        <PanelNode v-bind="nodeProps" />
      </template>
    </VueFlow>

    <!-- 空状态提示 -->
    <div v-if="elements.length === 0" class="empty-state">
      <PhSquaresFour :size="64" weight="duotone" class="empty-icon" />
      <h3>画布是空的</h3>
      <p>点击右下角的 + 按钮添加面板</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { PhSquaresFour } from '@phosphor-icons/vue';
import { usePanelStore } from '@/stores/panels';
import PanelNode from './PanelNode.vue';

// 导入样式
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';

const panelStore = usePanelStore();
const { fitView } = useVueFlow();

// 将面板转换为 Vue Flow 节点
const elements = computed({
  get() {
    return panelStore.panels.map(panel => ({
      id: panel.id,
      type: 'panel',
      position: panel.position,
      data: panel,
      style: {
        width: `${panel.size.w}px`,
        height: `${panel.size.h}px`,
      }
    }));
  },
  set(nodes: any[]) {
    // 更新面板位置
    nodes.forEach(node => {
      const panel = panelStore.panels.find(p => p.id === node.id);
      if (panel && node.position) {
        panel.position = node.position;
      }
    });
  }
});

function onPaneReady() {
  // 画布准备完成
  console.log('Canvas ready');
}

// 监听面板变化，自动适应视图
watch(() => panelStore.panels.length, () => {
  if (panelStore.panels.length > 0) {
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }
});
</script>

<style>
/* Vue Flow 全局样式覆盖 */
.vue-flow {
  background: var(--surface-0);
}

.vue-flow__node {
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.vue-flow__controls {
  left: 20px;
  bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.vue-flow__controls-button {
  background: var(--surface-1);
  border-color: var(--border-subtle);
  color: var(--text-secondary);
}

.vue-flow__controls-button:hover {
  background: var(--surface-hover);
  border-color: var(--border-strong);
  color: var(--text-primary);
}
</style>

<style scoped>
.infinite-canvas {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 空状态 */
.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 1;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: var(--text-muted);
}
</style>
