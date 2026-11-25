<template>
  <div
    class="panel"
    :style="panelStyle"
    :class="{ focused: isFocused }"
    @mousedown="onPanelClick"
  >
    <!-- 面板头部 -->
    <div class="panel-header" @mousedown.stop="onDragStart">
      <div class="panel-title-wrapper">
        <div class="panel-type-indicator" :style="{ background: panelColor }" />
        <span class="panel-title">{{ title }}</span>
      </div>
      <div class="panel-actions">
        <button class="panel-btn" @click.stop="onMinimize" :title="minimized ? '展开' : '最小化'">
          <PhMinus v-if="!minimized" :size="14" weight="bold" />
          <PhSquare v-else :size="14" weight="bold" />
        </button>
        <button class="panel-btn" @click.stop="onClose" title="关闭">
          <PhX :size="14" weight="bold" />
        </button>
      </div>
    </div>

    <!-- 面板内容 -->
    <div v-show="!minimized" class="panel-content">
      <slot>
        <div class="panel-placeholder">
          <PhTerminal :size="32" weight="duotone" class="placeholder-icon" />
          <p class="placeholder-text">{{ type }} 面板内容</p>
        </div>
      </slot>
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
import { 
  PhMinus, 
  PhSquare, 
  PhX,
  PhTerminal
} from '@phosphor-icons/vue';
import { usePanelStore } from '@/stores/panels';
import type { PanelType } from '@/types/panel';

const props = defineProps<{
  id: string;
  type: PanelType;
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

const isFocused = computed(() => panelStore.activePanel === props.id);

const panelColor = computed(() => {
  const colors: Record<PanelType, string> = {
    terminal: 'var(--panel-terminal)',
    editor: 'var(--panel-editor)',
    browser: 'var(--panel-browser)',
    chat: 'rgb(var(--agent-rgb))',
    custom: 'var(--text-muted)'
  };
  return colors[props.type] || colors.custom;
});

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
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-node);
  transition: box-shadow 150ms ease-out, border-color 150ms ease-out;
}

.panel.focused {
  border-color: var(--border-focus);
  box-shadow: 0 2px 12px var(--shadow-node-focused);
}

/* 面板头部 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--surface-3);
  border-bottom: 1px solid var(--border-subtle);
  cursor: move;
  user-select: none;
}

.panel-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.panel-type-indicator {
  width: 3px;
  height: 16px;
  border-radius: 2px;
  flex-shrink: 0;
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.panel-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

/* 面板内容 */
.panel-content {
  padding: 16px;
  overflow: auto;
  color: var(--text-primary);
  background: var(--surface-1);
}

.panel-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--text-muted);
}

.placeholder-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 13px;
}

/* 调整大小手柄 */
.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

.resize-handle::after {
  content: '';
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 8px;
  height: 8px;
  border-right: 2px solid var(--border-strong);
  border-bottom: 2px solid var(--border-strong);
  border-radius: 0 0 2px 0;
}

.panel.focused .resize-handle::after {
  border-color: var(--border-focus);
}
</style>
