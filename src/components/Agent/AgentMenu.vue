<template>
  <div class="agent-menu">
    <!-- 顶部栏 -->
    <div class="menu-header">
      <!-- 新建对话 -->
      <button class="menu-btn" @click="$emit('newChat')" title="新建对话">
        <PhPlus :size="16" />
      </button>

      <!-- 会话标题 -->
      <div class="conversation-title" @click="toggleHistory">
        <span>{{ name }}</span>
        <PhCaretDown :size="14" />
      </div>

      <!-- 右侧操作 -->
      <div class="menu-actions">
        <button
          v-if="!loading"
          class="menu-btn"
          @click="toggleHistory"
          title="历史记录"
        >
          <PhClockCounterClockwise :size="16" />
        </button>
        <button class="menu-btn" @click="$emit('close')" title="关闭">
          <PhX :size="16" />
        </button>
      </div>
    </div>

    <!-- 历史记录下拉 -->
    <transition name="dropdown">
      <div v-if="showHistory" class="history-dropdown">
        <div class="history-header">
          <span>历史记录</span>
          <button class="clear-btn" @click="$emit('clearHistory')" title="清空历史">
            <PhTrash :size="14" />
          </button>
        </div>

        <div class="history-list">
          <div
            v-for="item in history"
            :key="item.id"
            class="history-item"
            @click="selectHistory(item)"
          >
            <div class="history-content">
              <div class="history-title">{{ item.title }}</div>
              <div class="history-preview">{{ item.lastMessage }}</div>
            </div>
            <div class="history-time">{{ formatTime(item.timestamp) }}</div>
          </div>

          <div v-if="history.length === 0" class="history-empty">
            <PhClockCounterClockwise :size="32" weight="duotone" />
            <span>暂无历史记录</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  PhPlus,
  PhCaretDown,
  PhClockCounterClockwise,
  PhX,
  PhTrash
} from '@phosphor-icons/vue';
import type { HistoryItem } from '@/types/agent';

interface Props {
  name: string;
  history: HistoryItem[];
  loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  newChat: [];
  select: [item: HistoryItem];
  clearHistory: [];
  close: [];
}>();

const showHistory = ref(false);

function toggleHistory() {
  showHistory.value = !showHistory.value;
}

function selectHistory(item: HistoryItem) {
  emit('select', item);
  showHistory.value = false;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });
}
</script>

<style scoped>
.agent-menu {
  flex-shrink: 0;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border-subtle);
  position: relative;
}

.menu-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
}

.menu-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
  flex-shrink: 0;
}

.menu-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.conversation-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 150ms ease-out;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
}

.conversation-title:hover {
  background: var(--surface-hover);
}

.conversation-title span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-actions {
  display: flex;
  gap: 4px;
}

/* 历史记录下拉 */
.history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface-1);
  border: 1px solid var(--border-strong);
  border-top: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
  max-height: 400px;
  display: flex;
  flex-direction: column;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 200ms ease-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.clear-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.clear-btn:hover {
  background: var(--surface-hover);
  color: var(--activity-orange);
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 150ms ease-out;
  margin-bottom: 4px;
}

.history-item:hover {
  background: var(--surface-hover);
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-preview {
  font-size: 12px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--text-muted);
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-muted);
}

.history-empty span {
  font-size: 13px;
}

/* 加载状态 */
.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--focus-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
