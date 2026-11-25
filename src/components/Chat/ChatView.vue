<template>
  <div class="chat-view">
    <!-- 对话历史 -->
    <div class="chat-history" ref="historyRef">
      <!-- 欢迎页 -->
      <div v-if="!chatStore.hasMessages" class="welcome">
        <h2>👋 你好！</h2>
        <p>我可以帮你：</p>
        <ul>
          <li>创建和管理画布</li>
          <li>添加各种面板（Terminal、Editor...）</li>
          <li>生成内容和代码</li>
        </ul>

        <div class="quick-actions">
          <h3>快速开始</h3>
          <el-button @click="quickStart('创建一个空白画布')">
            创建空白画布
          </el-button>
          <el-button @click="quickStart('添加一个 Terminal 面板')">
            添加 Terminal
          </el-button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div
        v-for="msg in chatStore.messages"
        :key="msg.id"
        class="message"
        :class="`message-${msg.role}`"
      >
        <div class="message-content">
          {{ msg.content }}
        </div>
        <div class="message-time">
          {{ formatTime(msg.timestamp) }}
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="chatStore.isThinking" class="message message-assistant">
        <div class="message-content">
          <el-skeleton :rows="2" animated />
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <el-input
        v-model="input"
        type="textarea"
        :rows="3"
        placeholder="告诉我你想做什么..."
        :disabled="chatStore.isThinking"
        @keydown.ctrl.enter="sendMessage"
      />
      <el-button
        type="primary"
        :loading="chatStore.isThinking"
        @click="sendMessage"
      >
        发送
      </el-button>
      <div class="input-hint">Ctrl + Enter 发送</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chat';

const chatStore = useChatStore();
const input = ref('');
const historyRef = ref<HTMLElement>();

function quickStart(text: string) {
  input.value = text;
  sendMessage();
}

async function sendMessage() {
  if (!input.value.trim() || chatStore.isThinking) return;
  
  await chatStore.sendMessage(input.value);
  input.value = '';
  
  // 滚动到底部
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
watch(() => chatStore.messages.length, () => {
  nextTick(() => {
    if (historyRef.value) {
      historyRef.value.scrollTop = historyRef.value.scrollHeight;
    }
  });
});
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1a1a1a;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.welcome {
  max-width: 600px;
  margin: 0 auto;
  color: #fff;
  text-align: center;
}

.welcome h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.welcome p {
  font-size: 1.1rem;
  color: #aaa;
  margin-bottom: 1rem;
}

.welcome ul {
  text-align: left;
  color: #ccc;
  margin-bottom: 2rem;
}

.quick-actions {
  margin-top: 2rem;
}

.quick-actions h3 {
  margin-bottom: 1rem;
  color: #fff;
}

.quick-actions button {
  margin: 0 8px;
}

.message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.message-user {
  align-items: flex-end;
}

.message-user .message-content {
  background: #409eff;
  color: #fff;
  border-radius: 12px 12px 4px 12px;
}

.message-assistant {
  align-items: flex-start;
}

.message-assistant .message-content {
  background: #2a2a2a;
  color: #fff;
  border-radius: 12px 12px 12px 4px;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  word-wrap: break-word;
}

.message-time {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.chat-input {
  padding: 16px;
  background: #2a2a2a;
  border-top: 1px solid #444;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-input :deep(.el-textarea__inner) {
  background: #333;
  border-color: #555;
  color: #fff;
}

.chat-input :deep(.el-textarea__inner):focus {
  border-color: #409eff;
}

.input-hint {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}
</style>
