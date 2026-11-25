<template>
  <div class="floating-chat">
    <!-- 悬浮按钮 -->
    <button
      v-if="!isOpen"
      class="chat-trigger"
      @click="toggleChat"
    >
      <PhChats :size="24" weight="duotone" />
      <span v-if="hasUnread" class="unread-badge" />
    </button>

    <!-- 对话窗口 -->
    <transition name="chat-slide">
      <div v-if="isOpen" class="chat-window">
        <!-- 头部 -->
        <div class="chat-header">
          <div class="header-left">
            <PhSparkle :size="20" weight="duotone" />
            <span>OmniFlow Agent</span>
          </div>
          <div class="header-actions">
            <button class="header-btn" @click="clearChat" title="清除对话">
              <PhTrash :size="16" />
            </button>
            <button class="header-btn" @click="toggleChat" title="关闭">
              <PhX :size="16" />
            </button>
          </div>
        </div>

        <!-- 对话内容 -->
        <div class="chat-content" ref="contentRef">
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
        <div class="chat-input">
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
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import {
  PhChats,
  PhSparkle,
  PhX,
  PhTrash,
  PhPaperPlaneTilt
} from '@phosphor-icons/vue';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const isOpen = ref(false);
const hasUnread = ref(false);
const input = ref('');
const contentRef = ref<HTMLElement>();
const inputRef = ref<HTMLTextAreaElement>();

function toggleChat() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    hasUnread.value = false;
    nextTick(() => scrollToBottom());
  }
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

// 监听新消息
watch(() => chatStore.messages.length, () => {
  if (!isOpen.value) {
    hasUnread.value = true;
  }
  scrollToBottom();
});
</script>

<style scoped>
.floating-chat {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}

/* 悬浮按钮 */
.chat-trigger {
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
  position: relative;
}

.chat-trigger:hover {
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

/* 对话窗口 */
.chat-window {
  width: 380px;
  height: 580px;
  background: var(--surface-1);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 动画 */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 250ms ease-out;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 头部 */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border-subtle);
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

/* 对话内容 */
.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

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
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
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
.chat-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: var(--surface-2);
  border-top: 1px solid var(--border-subtle);
  align-items: flex-end;
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
</style>
