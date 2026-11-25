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

      <!-- 头部 -->
      <div class="agent-header">
        <div class="header-left">
          <PhSparkle :size="20" weight="duotone" />
          <span>OmniFlow Agent</span>
        </div>
        <div class="header-actions">
          <button class="header-btn" @click="toggleDocked" :title="docked ? '取消停靠' : '停靠到右侧'">
            <PhPushPin :size="16" :weight="docked ? 'fill' : 'regular'" />
          </button>
          <button class="header-btn" @click="clearChat" title="清除对话">
            <PhTrash :size="16" />
          </button>
          <button class="header-btn" @click="toggleChat" title="关闭">
            <PhX :size="16" />
          </button>
        </div>
      </div>

      <!-- 对话内容 -->
      <div class="agent-content" ref="contentRef">
        <!-- 欢迎消息 -->
        <div v-if="!chatStore.hasMessages" class="welcome-msg">
          <PhSparkle :size="32" weight="duotone" class="welcome-icon" />
          <p>你好！我可以帮你：</p>
          <ul>
            <li>创建和管理画布</li>
            <li>添加各种面板</li>
            <li>配置 MCP Server</li>
            <li>执行命令和操作</li>
          </ul>
        </div>

        <!-- 消息列表 -->
        <div
          v-for="msg in chatStore.messages"
          :key="msg.id"
          class="message"
          :class="`message-${msg.role}`"
        >
          <div class="message-bubble">{{ msg.content }}</div>
        </div>

        <!-- 思考中 -->
        <div v-if="chatStore.isThinking" class="message message-assistant">
          <div class="message-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="agent-input">
        <textarea
          v-model="input"
          class="input-field"
          placeholder="告诉我你想做什么..."
          rows="1"
          :disabled="chatStore.isThinking"
          @keydown.ctrl.enter="sendMessage"
          @input="adjustHeight"
          ref="inputRef"
        />
        <button
          class="send-btn"
          :disabled="!input.trim() || chatStore.isThinking"
          @click="sendMessage"
        >
          <PhPaperPlaneTilt :size="18" weight="fill" />
        </button>
      </div>
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
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue';
import {
  PhChats,
  PhSparkle,
  PhX,
  PhTrash,
  PhPaperPlaneTilt,
  PhPushPin
} from '@phosphor-icons/vue';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const isOpen = ref(false);
const hasUnread = ref(false);
const docked = ref(false);
const input = ref('');
const contentRef = ref<HTMLElement>();
const inputRef = ref<HTMLTextAreaElement>();

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
    nextTick(() => scrollToBottom());
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

function clearChat() {
  chatStore.clearMessages();
}

async function sendMessage() {
  if (!input.value.trim() || chatStore.isThinking) return;

  await chatStore.sendMessage(input.value);
  input.value = '';

  if (inputRef.value) {
    inputRef.value.style.height = 'auto';
  }

  scrollToBottom();
}

function adjustHeight(e: Event) {
  const textarea = e.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
  nextTick(() => {
    if (contentRef.value) {
      contentRef.value.scrollTop = contentRef.value.scrollHeight;
    }
  });
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
watch(() => chatStore.messages.length, () => {
  if (!isOpen.value) hasUnread.value = true;
  scrollToBottom();
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

.floating-agent:not(.docked) .agent-header {
  cursor: grab;
  user-select: none;
}

.floating-agent.dragging .agent-header {
  cursor: grabbing;
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

/* 头部 */
.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.header-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.header-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

/* 内容区域 */
.agent-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* 欢迎消息 */
.welcome-msg {
  text-align: center;
  color: var(--text-secondary);
  padding: 20px 0;
}

.welcome-icon {
  color: rgb(var(--agent-rgb));
  margin-bottom: 12px;
}

.welcome-msg p {
  font-size: 14px;
  margin-bottom: 12px;
}

.welcome-msg ul {
  text-align: left;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.8;
}

/* 消息 */
.message {
  display: flex;
  margin-bottom: 12px;
}

.message-user {
  justify-content: flex-end;
}

.message-assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}

.message-user .message-bubble {
  background: rgb(var(--agent-rgb));
  color: white;
  border-radius: 12px 12px 4px 12px;
}

.message-assistant .message-bubble {
  background: var(--surface-2);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  border-radius: 12px 12px 12px 4px;
}

/* 输入中动画 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 2px 0;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

/* 输入区域 */
.agent-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: var(--surface-2);
  border-top: 1px solid var(--border-subtle);
  align-items: flex-end;
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  background: var(--surface-0);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-primary);
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 150ms ease-out;
  min-height: 36px;
  max-height: 120px;
}

.input-field:focus {
  border-color: var(--border-focus);
}

.input-field::placeholder {
  color: var(--text-muted);
}

.send-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgb(var(--agent-rgb));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.send-btn:hover:not(:disabled) {
  background: rgb(var(--agent-light-rgb));
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
