<template>
  <div class="agent-conversation">
    <!-- 顶部栏 -->
    <div class="conversation-header">
      <el-button text circle @click="$emit('newChat')">
        <PhPlus :size="16" />
      </el-button>
      
      <div class="conversation-title">{{ conversationTitle }}</div>
      
      <div class="header-actions">
        <el-button text circle @click="$emit('openHistory')">
          <PhClockCounterClockwise :size="16" />
        </el-button>
        <el-button text circle @click="$emit('close')">
          <PhX :size="16" />
        </el-button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-list" ref="messagesRef">
      <!-- 欢迎屏幕 -->
      <div v-if="messages.length === 0" class="welcome-screen">
        <div class="welcome-icon">
          <PhSparkle :size="42" weight="duotone" />
        </div>
        <h3 class="welcome-title">开始新的对话</h3>
        <p class="welcome-hint">我可以帮你管理画布、调用工具、执行命令</p>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-row"
      >
        <div class="message-content" :class="`message-${message.role}`">
          <div class="message-text">{{ message.content }}</div>
        </div>
        
        <!-- 操作按钮 -->
        <div v-if="message.role === 'assistant'" class="message-actions">
          <el-button class="message-action" text circle @click="copyMessage(message)">
            <PhCopy :size="14" />
          </el-button>
        </div>
      </div>

      <!-- 思考中 -->
      <div v-if="isRunning" class="message-row">
        <div class="message-content message-assistant">
          <div class="thinking-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <el-button text circle @click="triggerFileUpload">
        <PhPaperclip :size="18" />
      </el-button>
      
      <el-input
        ref="inputRef"
        v-model="inputText"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 4 }"
        :disabled="isRunning"
        placeholder="输入消息..."
        @keydown.ctrl.enter="sendMessage"
      />
      
      <el-button
        type="primary"
        circle
        :disabled="!canSend"
        @click="sendMessage"
      >
        <PhPaperPlaneTilt :size="16" weight="fill" />
      </el-button>

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
  PhClockCounterClockwise,
  PhX,
  PhPaperclip,
  PhPaperPlaneTilt,
  PhSparkle,
  PhCopy
} from '@phosphor-icons/vue';
import { ElButton, ElInput } from 'element-plus';
import { useAgentStore } from '@/stores/agent';
import { agentService } from '@/core/agent/AgentService';
import type { AgentMessage } from '@/types/agent';

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
const inputRef = ref();
const fileInputRef = ref<HTMLInputElement>();
const inputText = ref('');

const messages = computed(() => agentStore.activeConversation?.messages ?? []);
const isRunning = computed(() => agentStore.isRunning);
const conversationTitle = computed(() => agentStore.activeConversation?.title ?? '新对话');
const canSend = computed(() => inputText.value.trim().length > 0 && !isRunning.value);

async function sendMessage() {
  if (!canSend.value) return;

  const text = inputText.value;
  inputText.value = '';

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

function copyMessage(message: AgentMessage) {
  navigator.clipboard.writeText(message.content);
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
.agent-conversation {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 顶部栏 */
.conversation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.conversation-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-actions {
  display: flex;
  gap: 4px;
}

/* 消息列表 */
.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

/* 欢迎屏幕 */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px 20px;
  text-align: center;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-7));
  border-radius: 20px;
  color: var(--el-color-primary);
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.welcome-hint {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

/* 消息行 */
.message-row {
  padding: 0 12px 12px;
}

.message-row:hover .message-actions {
  opacity: 1;
  pointer-events: auto;
}

.message-content {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-user {
  background: var(--el-color-primary);
  color: white;
  margin-left: auto;
  max-width: 75%;
  border-radius: 12px 12px 4px 12px;
}

.message-assistant {
  background: var(--el-fill-color-extra-light);
  color: var(--el-text-color-primary);
  max-width: 85%;
  border-radius: 12px 12px 12px 4px;
}

.message-text {
  margin: 0;
}

/* 消息操作 */
.message-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease-out;
}

.message-action {
  width: 24px;
  height: 24px;
  padding: 0;
}

/* 思考动画 */
.thinking-indicator {
  display: flex;
  gap: 6px;
  padding: 4px 0;
}

.thinking-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
  animation: thinking 1.4s infinite ease-in-out;
}

.thinking-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-indicator span:nth-child(3) {
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
.input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--el-border-color-light);
}

.input-container :deep(.el-textarea__inner) {
  box-shadow: none;
}

.input-hint {
  padding: 0 12px 12px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
</style>
