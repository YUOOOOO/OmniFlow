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
      <el-button size="small" @click="canvasStore.resetTransform">
        重置视图
      </el-button>
      <el-button size="small" @click="canvasStore.toggleGrid">
        {{ canvasStore.grid.enabled ? '隐藏' : '显示' }}网格
      </el-button>
      <span class="zoom-level">{{ Math.round(canvasStore.transform.zoom * 100) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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
  background: v-bind('canvasStore.background');
  cursor: grab;
}

.infinite-canvas:active {
  cursor: grabbing;
}

.canvas-content {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.1s ease-out;
}

.canvas-grid {
  position: absolute;
  top: -5000px;
  left: -5000px;
  width: 10000px;
  height: 10000px;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.canvas-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.zoom-level {
  color: #fff;
  font-size: 12px;
  min-width: 50px;
  text-align: center;
}
</style>
