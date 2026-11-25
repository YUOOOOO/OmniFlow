<template>
  <div class="message-list" ref="listRef">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message-item"
      :class="`message-${message.role}`"
    >
      <!-- 消息气泡 -->
      <div class="message-bubble">
        <!-- 消息内容 -->
        <div class="message-content" v-html="renderMarkdown(message.content)" />

        <!-- 附件 -->
        <div v-if="message.attachments?.length" class="message-attachments">
          <div
            v-for="attachment in message.attachments"
            :key="attachment.id"
            class="attachment-item"
          >
            <PhPaperclip :size="14" />
            <span>{{ attachment.name }}</span>
          </div>
        </div>

        <!-- 工具调用 -->
        <div v-if="message.toolCalls?.length" class="message-tools">
          <div
            v-for="tool in message.toolCalls"
            :key="tool.id"
            class="tool-call"
          >
            <PhWrench :size="14" />
            <span>{{ tool.function.name }}</span>
            <PhCheck v-if="tool.result" :size="14" class="tool-success" />
            <PhX v-if="tool.error" :size="14" class="tool-error" />
          </div>
        </div>

        <!-- 消息状态 -->
        <div v-if="message.status === 'streaming'" class="message-status">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <!-- 消息操作 -->
        <div class="message-actions">
          <button class="action-btn" @click="$emit('copy', message)" title="复制">
            <PhCopy :size="14" />
          </button>
          <button
            v-if="message.role === 'user'"
            class="action-btn"
            @click="$emit('edit', message)"
            title="编辑"
          >
            <PhPencil :size="14" />
          </button>
          <button class="action-btn" @click="$emit('branch', message)" title="分支">
            <PhGitBranch :size="14" />
          </button>
          <button class="action-btn" @click="$emit('delete', message.id)" title="删除">
            <PhTrash :size="14" />
          </button>
        </div>
      </div>

      <!-- 时间戳 -->
      <div class="message-timestamp">
        {{ formatTime(message.timestamp) }}
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="messages.length === 0" class="empty-state">
      <PhChatsCircle :size="48" weight="duotone" />
      <p>开始新的对话</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import {
  PhPaperclip,
  PhWrench,
  PhCheck,
  PhX,
  PhCopy,
  PhPencil,
  PhGitBranch,
  PhTrash,
  PhChatsCircle
} from '@phosphor-icons/vue';
import { marked } from 'marked';
import type { AgentMessage } from '@/types/agent';

interface Props {
  messages: AgentMessage[];
  active?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  copy: [message: AgentMessage];
  edit: [message: AgentMessage];
  branch: [message: AgentMessage];
  delete: [messageId: string];
}>();

const listRef = ref<HTMLElement>();

// 渲染 Markdown
function renderMarkdown(content: string): string {
  try {
    return marked(content);
  } catch {
    return content;
  }
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 自动滚动到底部
function scrollToBottom() {
  if (listRef.value) {
    nextTick(() => {
      listRef.value!.scrollTop = listRef.value!.scrollHeight;
    });
  }
}

// 监听消息变化
watch(() => props.messages.length, () => {
  if (props.active) {
    scrollToBottom();
  }
});
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-user {
  align-items: flex-end;
}

.message-assistant,
.message-system {
  align-items: flex-start;
}

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message-user .message-bubble {
  background: rgb(var(--agent-rgb));
  color: white;
  border-radius: 12px 12px 4px 12px;
}

.message-assistant .message-bubble,
.message-system .message-bubble {
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

.message-content :deep(p) {
  margin: 0 0 8px 0;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-content :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

.message-content :deep(pre) {
  background: rgba(0, 0, 0, 0.1);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-content :deep(pre code) {
  background: none;
  padding: 0;
}

.message-attachments {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-size: 13px;
}

.message-tools {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.tool-call {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  font-size: 13px;
  font-family: monospace;
}

.tool-success {
  color: var(--activity-green);
  margin-left: auto;
}

.tool-error {
  color: var(--activity-orange);
  margin-left: auto;
}

.message-status {
  margin-top: 8px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
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
    transform: translateY(-6px);
    opacity: 1;
  }
}

.message-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 150ms ease-out;
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  color: currentColor;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

.message-timestamp {
  font-size: 11px;
  color: var(--text-muted);
  padding: 0 4px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  gap: 12px;
}

.empty-state p {
  font-size: 14px;
}
</style>
