<template>
  <teleport to="body">
    <aside
      v-show="isOpen"
      class="floating-agent"
      :class="{ docked, dragging: interaction?.mode === 'move' }"
      :style="panelStyle"
      @pointerdown="startMenuMove"
      @pointermove="moveInteraction"
      @pointerup="stopInteraction"
      @pointercancel="stopInteraction"
      @lostpointercapture="stopInteraction"
    >
      <!-- 调整大小手柄 -->
      <div
        v-for="handle in resizeHandles"
        :key="handle.edge"
        class="resize-handle"
        :class="handle.edge"
        @pointerdown.stop="startInteraction($event, handle.edge)"
      />

      <!-- Agent 面板 -->
      <AgentPanel :active="isOpen" />
    </aside>

    <!-- 悬浮按钮 -->
    <button
      v-if="!isOpen"
      class="agent-trigger"
      :style="triggerStyle"
      @click="toggleChat"
    >
      <PhChats :size="24" weight="duotone" />
      <span v-if="hasUnread" class="unread-badge" />
    </button>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { PhChats } from '@phosphor-icons/vue';
import AgentPanel from '@/components/Agent/AgentPanel.vue';
import { useAgentStore } from '@/stores/agent';

const agentStore = useAgentStore();
const isOpen = ref(false);
const hasUnread = ref(false);
const docked = ref(false);

// 窗口尺寸和位置
const preferredWidth = 420;
const preferredHeight = ref(0.8);
const viewport = { width: window.innerWidth, height: window.innerHeight };

const left = ref(viewport.width - preferredWidth - 20);
const top = ref(20);
const width = ref(preferredWidth);
const height = computed(() => Math.min(preferredHeight.value * viewport.height, viewport.height - 40));

// 交互状态
interface Interaction {
  mode: 'move' | 'left' | 'right' | 'bottom';
  pointerId: number;
  element: HTMLElement;
  x: number;
  y: number;
  left: number;
  top: number;
  right: number;
  width: number;
  height: number;
}

const interaction = ref<Interaction>();

// 调整大小手柄
const resizeHandles = computed(() => {
  const handles = [];
  if (!docked.value) {
    handles.push({ edge: 'left' as const });
    handles.push({ edge: 'right' as const });
  }
  handles.push({ edge: 'bottom' as const });
  return handles;
});

// 面板样式
const panelStyle = computed(() => {
  if (docked.value) {
    return {
      right: '0',
      top: '0',
      bottom: '0',
      width: `${width.value}px`,
      height: '100vh'
    };
  }
  
  return {
    left: `${left.value}px`,
    top: `${top.value}px`,
    width: `${width.value}px`,
    height: `${height.value}px`
  };
});

// 触发按钮样式
const triggerStyle = computed(() => ({
  right: '24px',
  bottom: '24px'
}));

function toggleChat() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    hasUnread.value = false;
  }
}

function toggleDocked() {
  docked.value = !docked.value;
  
  // 切换到停靠模式时，调整位置
  if (docked.value) {
    width.value = Math.min(width.value, viewport.width * 0.45);
  }
  
  // 保存状态
  localStorage.setItem('omniflow-agent-docked', JSON.stringify(docked.value));
}

function startMenuMove(event: PointerEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.agent-header') || target.closest('button')) return;
  if (docked.value) return; // 停靠模式下不允许移动
  startInteraction(event, 'move');
}

function startInteraction(event: PointerEvent, mode: Interaction['mode']) {
  if (event.button !== 0 || interaction.value) return;
  
  event.preventDefault();
  const element = event.currentTarget as HTMLElement;
  element.setPointerCapture(event.pointerId);
  
  interaction.value = {
    mode,
    pointerId: event.pointerId,
    element,
    x: event.clientX,
    y: event.clientY,
    left: left.value,
    top: top.value,
    right: docked.value ? viewport.width : left.value + width.value,
    width: width.value,
    height: height.value
  };
}

function moveInteraction(event: PointerEvent) {
  const current = interaction.value;
  if (!current || current.pointerId !== event.pointerId) return;
  
  if (current.mode === 'move') {
    movePanel(current.left + event.clientX - current.x, current.top + event.clientY - current.y);
  } else if (current.mode === 'left') {
    resizePanel('left', current.width + current.x - event.clientX, current.right);
  } else if (current.mode === 'right') {
    resizePanel('right', current.width + event.clientX - current.x, current.left);
  } else {
    resizePanel('bottom', current.height + event.clientY - current.y, current.top);
  }
}

function stopInteraction(event?: PointerEvent) {
  const current = interaction.value;
  if (event && current?.pointerId !== event.pointerId) return;
  
  interaction.value = undefined;
  if (current?.element.hasPointerCapture(current.pointerId)) {
    current.element.releasePointerCapture(current.pointerId);
  }
}

function movePanel(newLeft: number, newTop: number) {
  const gap = 20;
  left.value = Math.max(gap, Math.min(newLeft, viewport.width - width.value - gap));
  top.value = Math.max(gap, Math.min(newTop, viewport.height - height.value - gap));
  
  // 保存位置
  localStorage.setItem('omniflow-agent-position', JSON.stringify({ left: left.value, top: top.value }));
}

function resizePanel(edge: 'left' | 'right' | 'bottom', size: number, anchor?: number) {
  const gap = 20;
  
  if (edge === 'bottom') {
    preferredHeight.value = Math.max(240, Math.min(size, viewport.height - top.value - gap)) / viewport.height;
  } else {
    const newWidth = Math.max(320, Math.min(size, docked.value ? viewport.width * 0.45 : viewport.width - gap * 2));
    
    if (edge === 'left' && anchor !== undefined) {
      left.value = Math.max(gap, anchor - newWidth);
    }
    
    width.value = newWidth;
  }
  
  // 保存尺寸
  localStorage.setItem('omniflow-agent-size', JSON.stringify({ width: width.value, height: preferredHeight.value }));
}

function resizeViewport() {
  stopInteraction();
  viewport.width = window.innerWidth;
  viewport.height = window.innerHeight;
}

// 恢复保存的状态
const savedDocked = localStorage.getItem('omniflow-agent-docked');
if (savedDocked) docked.value = JSON.parse(savedDocked);

const savedPosition = localStorage.getItem('omniflow-agent-position');
if (savedPosition) {
  const pos = JSON.parse(savedPosition);
  left.value = pos.left;
  top.value = pos.top;
}

const savedSize = localStorage.getItem('omniflow-agent-size');
if (savedSize) {
  const size = JSON.parse(savedSize);
  width.value = size.width;
  preferredHeight.value = size.height;
}

// 监听新消息
watch(() => agentStore.activeConversation?.messages.length, () => {
  if (!isOpen.value) hasUnread.value = true;
});

window.addEventListener('resize', resizeViewport);
onBeforeUnmount(() => {
  stopInteraction();
  window.removeEventListener('resize', resizeViewport);
});
</script>

<style scoped>
/* 悬浮 Agent */
.floating-agent {
  position: fixed;
  z-index: 1001;
  box-sizing: border-box;
  max-width: 100vw;
  max-height: 100vh;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  background: color-mix(in srgb, var(--surface-1) 70%, transparent);
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.floating-agent.docked {
  border-width: 0 0 0 1px;
  border-radius: 0;
  background: var(--surface-1);
  box-shadow: none;
}

.floating-agent.dragging {
  user-select: none;
}

/* 调整大小手柄 */
.resize-handle {
  position: absolute;
  z-index: 1;
  touch-action: none;
}

.resize-handle.left,
.resize-handle.right {
  top: 0;
  bottom: 5px;
  width: 5px;
  cursor: ew-resize;
}

.resize-handle.left {
  left: 0;
}

.resize-handle.right {
  right: 0;
}

.resize-handle.bottom {
  right: 0;
  bottom: 0;
  left: 0;
  height: 5px;
  cursor: ns-resize;
}

.resize-handle:hover {
  background: var(--focus-blue);
  opacity: 0.5;
}

/* 悬浮按钮 */
.agent-trigger {
  position: fixed;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  border: none;
  background: rgb(var(--agent-rgb));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(74, 158, 255, 0.4);
  transition: all 150ms ease-out;
  z-index: 1000;
}

.agent-trigger:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(74, 158, 255, 0.5);
}

.unread-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--activity-orange);
  border: 2px solid white;
}
</style>
