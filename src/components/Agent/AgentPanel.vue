<template>
  <div class="agent-panel">
    <!-- 顶部栏 -->
    <div class="agent-header">
      <button class="header-action" @click="$emit('newChat')" title="新建对话">
        <PhPlus :size="16" />
      </button>
      
      <div class="conversation-name">{{ conversationTitle }}</div>
      
      <div class="header-actions">
        <button class="header-action" @click="toggleHistory">
          <PhCaretDown :size="14" />
        </button>
        <button class="header-action" @click="$emit('openHistory')">
          <PhClockCounterClockwise :size="16" />
        </button>
        <button class="header-action" @click="$emit('close')">
          <PhX :size="16" />
        </button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesRef">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-wrapper"
        :class="`message-${message.role}`"
      >
        <div class="message-content">{{ message.content }}</div>
      </div>

      <!-- 思考中动画 -->
      <div v-if="isRunning" class="message-wrapper message-assistant">
        <div class="message-content">
          <div class="thinking-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <button class="attach-btn" @click="triggerFileUpload">
        <PhPaperclip :size="20" />
      </button>
      
      <textarea
        ref="inputRef"
        v-model="inputText"
        class="message-input"
        placeholder="输入消息..."
        rows="1"
        :disabled="isRunning"
        @keydown.ctrl.enter="sendMessage"
        @input="adjustHeight"
      />
      
      <button
        class="send-btn"
        :disabled="!canSend"
        @click="sendMessage"
      >
        <PhPaperPlaneTilt :size="18" weight="fill" />
      </button>

      <input
        ref="fileInputRef"
        type="file"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />
    </div>

    <div class="input-hint">Ctrl + Enter 发送</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import {
  PhPlus,
  PhCaretDown,
  PhClockCounterClockwise,
  PhX,
  PhPaperclip,
  PhPaperPlaneTilt
} from '@phosphor-icons/vue';
import { useAgentStore } from '@/stores/agent';
import { agentService } from '@/core/agent/AgentService';
import type { Attachment } from '@/types/agent';

interface Props {
  active?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  newChat: [];
  openHistory: [];
  close: [];
}>();

const agentStore = useAgentStore();
const messagesRef = ref<HTMLElement>();
const inputRef = ref<HTMLTextAreaElement>();
const fileInputRef = ref<HTMLInputElement>();
const inputText = ref('');

const messages = computed(() => agentStore.activeConversation?.messages ?? []);
const isRunning = computed(() => agentStore.isRunning);
const conversationTitle = computed(() => agentStore.activeConversation?.title ?? '新对话');
const canSend = computed(() => inputText.value.trim().length > 0 && !isRunning.value);

function toggleHistory() {
  // TODO
}

async function sendMessage() {
  if (!canSend.value) return;

  const text = inputText.value;
  inputText.value = '';
  
  if (inputRef.value) {
    inputRef.value.style.height = 'auto';
  }

  // 添加用户消息
  agentStore.addMessage({
    role: 'user',
    content: text,
  });

  // 创建助手消息
  const assistantMessage = agentStore.addMessage({
    role: 'assistant',
    content: '',
    status: 'streaming',
  });

  try {
    for await (const event of agentService.streamMessage(text)) {
      agentStore.handleEvent(event);
      
      if (event.type === 'token') {
        assistantMessage.content += event.token;
      } else if (event.type === 'done') {
        assistantMessage.status = 'done';
      } else if (event.type === 'error') {
        assistantMessage.status = 'error';
        assistantMessage.content = `错误：${event.error}`;
      }
    }
  } catch (error) {
    assistantMessage.status = 'error';
    assistantMessage.content = `错误：${(error as Error).message}`;
  }

  agentStore.saveHistory();
}

function adjustHeight() {
  if (!inputRef.value) return;
  inputRef.value.style.height = 'auto';
  inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 120) + 'px';
}

function triggerFileUpload() {
  fileInputRef.value?.click();
}

function handleFileSelect() {
  // TODO
}

function scrollToBottom() {
  if (messagesRef.value) {
    nextTick(() => {
      messagesRef.value!.scrollTop = messagesRef.value!.scrollHeight;
    });
  }
}

watch(() => messages.value.length, () => {
  if (props.active) {
    scrollToBottom();
  }
});

onMounted(() => {
  if (!agentStore.activeConversation) {
    agentStore.newConversation();
  }
});
</script>

<style scoped>
.agent-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
}

/* 顶部栏 */
.agent-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-action {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
  flex-shrink: 0;
}

.header-action:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.conversation-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 4px;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-wrapper {
  display: flex;
}

.message-user {
  justify-content: flex-end;
}

.message-assistant {
  justify-content: flex-start;
}

.message-content {
  padding: 10px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  max-width: 75%;
  word-wrap: break-word;
}

.message-user .message-content {
  background: #4A9EFF;
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.message-assistant .message-content {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 16px 16px 16px 4px;
  max-width: 85%;
}

/* 思考动画 */
.thinking-dots {
  display: flex;
  gap: 6px;
  padding: 4px 0;
}

.thinking-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  animation: thinking 1.4s infinite ease-in-out;
}

.thinking-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes thinking {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

/* 输入区域 */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.attach-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.attach-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
}

.message-input {
  flex: 1;
  min-height: 36px;
  max-height: 120px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: all 150ms ease-out;
}

.message-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.send-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: #4A9EFF;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.send-btn:hover:not(:disabled) {
  background: #5BA8FF;
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.input-hint {
  padding: 0 16px 10px 16px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
}
</style>
