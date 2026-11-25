<template>
  <div class="chat-view">
    <!-- 对话历史 -->
    <div class="chat-history" ref="historyRef">
      <!-- 欢迎页 -->
      <div v-if="!chatStore.hasMessages" class="welcome">
        <div class="welcome-icon">
          <PhSparkle :size="48" weight="duotone" />
        </div>
        <h1 class="welcome-title">你好！我是 OmniFlow</h1>
        <p class="welcome-desc">
          我可以帮你创建画布、管理节点、生成内容，或者回答问题。
        </p>

        <div class="quick-actions">
          <button
            v-for="action in quickActions"
            :key="action.text"
            class="quick-action-btn"
            @click="quickStart(action.text)"
          >
            <component :is="action.icon" :size="20" weight="duotone" />
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="msg in chatStore.messages"
        :key="msg.id"
        class="message-wrapper"
        :class="`message-${msg.role}`"
      >
        <div class="message-bubble">
          <div class="message-content">{{ msg.content }}</div>
          <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="chatStore.isThinking" class="message-wrapper message-assistant">
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
    <div class="chat-input-wrapper">
      <div class="chat-input-container">
        <textarea
          v-model="input"
          class="chat-input"
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
          <PhPaperPlaneTilt :size="20" weight="fill" />
        </button>
      </div>
      <div class="input-hint">
        Ctrl + Enter 发送
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { 
  PhSparkle,
  PhPaperPlaneTilt,
  PhSquaresFour,
  PhTerminal,
  PhPlus
} from '@phosphor-icons/vue';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const input = ref('');
const historyRef = ref<HTMLElement>();
const inputRef = ref<HTMLTextAreaElement>();

const quickActions = [
  { icon: PhPlus, label: '创建空白画布', text: '创建一个空白画布' },
  { icon: PhTerminal, label: '添加 Terminal', text: '添加一个 Terminal 面板' },
  { icon: PhSquaresFour, label: '项目看板', text: '创建一个项目看板' },
];

function quickStart(text: string) {
  input.value = text;
  sendMessage();
}

async function sendMessage() {
  if (!input.value.trim() || chatStore.isThinking) return;
  
  await chatStore.sendMessage(input.value);
  input.value = '';
  
  // 重置输入框高度
  if (inputRef.value) {
    inputRef.value.style.height = 'auto';
  }
  
  // 滚动到底部
  scrollToBottom();
}

function adjustHeight(e: Event) {
  const textarea = e.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

function scrollToBottom() {
  nextTick(() => {
    if (historyRef.value) {
      historyRef.value.scrollTop = historyRef.value.scrollHeight;
    }
  });
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// 监听新消息，自动滚动
watch(() => chatStore.messages.length, scrollToBottom);
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface-0);
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 欢迎页 */
.welcome {
  max-width: 600px;
  margin: 60px auto 0;
  text-align: center;
}

.welcome-icon {
  color: rgb(var(--agent-rgb));
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.welcome-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease-out;
}

.quick-action-btn:hover {
  background: var(--surface-3);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

/* 消息 */
.message-wrapper {
  display: flex;
  margin-bottom: 16px;
}

.message-user {
  justify-content: flex-end;
}

.message-assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
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

.message-content {
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.message-assistant .message-time {
  color: var(--text-muted);
}

/* 输入中动画 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
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
.chat-input-wrapper {
  padding: 16px 24px 20px;
  background: var(--surface-1);
  border-top: 1px solid var(--border-subtle);
}

.chat-input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: var(--surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 12px;
  transition: border-color 150ms ease-out;
}

.chat-input-container:focus-within {
  border-color: var(--border-focus);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  min-height: 24px;
  max-height: 200px;
}

.chat-input::placeholder {
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

.input-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
  padding: 0 4px;
}
</style>
