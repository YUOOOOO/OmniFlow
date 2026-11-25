<template>
  <div
    class="panel"
    :style="panelStyle"
    @mousedown="onPanelClick"
  >
    <!-- 面板头部 -->
    <div class="panel-header" @mousedown.stop="onDragStart">
      <span class="panel-title">{{ title }}</span>
      <div class="panel-actions">
        <button class="panel-btn" @click.stop="onMinimize">
          {{ minimized ? '□' : '_' }}
        </button>
        <button class="panel-btn" @click.stop="onClose">×</button>
      </div>
    </div>

    <!-- 面板内容 -->
    <div v-show="!minimized" class="panel-content">
      <slot />
    </div>

    <!-- 调整大小手柄 -->
    <div
      v-show="!minimized"
      class="resize-handle"
      @mousedown.stop="onResizeStart"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePanelStore } from '@/stores/panels';

const props = defineProps<{
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  zIndex: number;
  minimized: boolean;
}>();

const panelStore = usePanelStore();

const panelStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  width: `${props.size.w}px`,
  height: props.minimized ? 'auto' : `${props.size.h}px`,
  zIndex: props.zIndex
}));

function onPanelClick() {
  panelStore.setActivePanel(props.id);
}

function onDragStart(e: MouseEvent) {
  const startX = e.clientX;
  const startY = e.clientY;
  const startPos = { ...props.position };

  function onMouseMove(e: MouseEvent) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    panelStore.updatePanel(props.id, {
      position: {
        x: startPos.x + deltaX,
        y: startPos.y + deltaY
      }
    });
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onResizeStart(e: MouseEvent) {
  const startX = e.clientX;
  const startY = e.clientY;
  const startSize = { ...props.size };

  function onMouseMove(e: MouseEvent) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    panelStore.updatePanel(props.id, {
      size: {
        w: Math.max(200, startSize.w + deltaX),
        h: Math.max(150, startSize.h + deltaY)
      }
    });
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

function onMinimize() {
  panelStore.updatePanel(props.id, {
    minimized: !props.minimized
  });
}

function onClose() {
  panelStore.removePanel(props.id);
}
</script>

<style scoped>
.panel {
  position: absolute;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #333;
  cursor: move;
  user-select: none;
}

.panel-title {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

.panel-actions {
  display: flex;
  gap: 4px;
}

.panel-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #aaa;
  cursor: pointer;
  border-radius: 4px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-btn:hover {
  background: #444;
  color: #fff;
}

.panel-content {
  padding: 12px;
  overflow: auto;
  color: #fff;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

.resize-handle::before {
  content: '';
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 10px;
  height: 10px;
  border-right: 2px solid #666;
  border-bottom: 2px solid #666;
}
</style>
