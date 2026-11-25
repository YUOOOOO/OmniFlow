<template>
  <div
    ref="canvasRef"
    class="infinite-canvas"
    @wheel.prevent="onWheel"
    @mousedown="onPanStart"
  >
    <div
      class="canvas-content"
      :style="canvasTransform"
    >
      <!-- 网格背景 -->
      <div v-if="canvasStore.grid.enabled" class="canvas-grid" />

      <!-- 面板列表 -->
      <Panel
        v-for="panel in panelStore.panels"
        :key="panel.id"
        v-bind="panel"
      />
    </div>

    <!-- 画布控制器 -->
    <div class="canvas-controls">
      <button class="control-btn" @click="canvasStore.resetTransform" title="重置视图">
        <PhHouse :size="16" weight="duotone" />
      </button>
      <button class="control-btn" @click="canvasStore.toggleGrid" title="切换网格">
        <PhGridFour :size="16" weight="duotone" />
      </button>
      <div class="zoom-display">
        {{ Math.round(canvasStore.transform.zoom * 100) }}%
      </div>
    </div>

    <!-- 空状态提示 -->
    <div v-if="panelStore.panels.length === 0" class="empty-state">
      <PhSquaresFour :size="64" weight="duotone" class="empty-icon" />
      <h3>画布是空的</h3>
      <p>点击右下角的 + 按钮添加面板</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  PhHouse, 
  PhGridFour,
  PhSquaresFour
} from '@phosphor-icons/vue';
import { useCanvasStore } from '@/stores/canvas';
import { usePanelStore } from '@/stores/panels';
import Panel from '@/components/Panels/Panel.vue';

const canvasStore = useCanvasStore();
const panelStore = usePanelStore();
const canvasRef = ref<HTMLElement>();

const canvasTransform = computed(() => ({
  transform: `translate(${canvasStore.transform.offset.x}px, ${canvasStore.transform.offset.y}px) scale(${canvasStore.transform.zoom})`,
  transformOrigin: '0 0'
}));

function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  const rect = canvasRef.value?.getBoundingClientRect();
  
  if (rect) {
    const center = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    canvasStore.zoom(delta, center);
  }
}

function onPanStart(e: MouseEvent) {
  if (e.target !== canvasRef.value && !(e.target as HTMLElement).classList.contains('canvas-content')) {
    return;
  }

  const startX = e.clientX;
  const startY = e.clientY;
  const startOffset = { ...canvasStore.transform.offset };

  function onMouseMove(e: MouseEvent) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    canvasStore.transform.offset.x = startOffset.x + deltaX;
    canvasStore.transform.offset.y = startOffset.y + deltaY;
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}
</script>

<style scoped>
.infinite-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--canvas-bg);
  cursor: grab;
}

.infinite-canvas:active {
  cursor: grabbing;
}

.canvas-content {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.05s ease-out;
}

/* 网格背景（点状） */
.canvas-grid {
  position: absolute;
  top: -5000px;
  left: -5000px;
  width: 10000px;
  height: 10000px;
  background-image: radial-gradient(
    circle,
    var(--grid-dot) 1px,
    transparent 1px
  );
  background-size: 20px 20px;
  pointer-events: none;
}

/* 控制器 */
.canvas-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.control-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.zoom-display {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 45px;
  text-align: center;
  padding: 0 4px;
}

/* 空状态 */
.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
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
