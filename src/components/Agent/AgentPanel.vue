<template>
  <div class="agent-panel">
    <!-- 菜单栏 -->
    <AgentMenu
      :name="conversationTitle"
      :history="agentStore.history"
      :loading="agentStore.loading"
      @new-chat="newConversation"
      @select="selectConversation"
      @clear-history="clearHistory"
      @close="agentStore.toggleVisible()"
    />

    <!-- 消息列表 -->
    <MessageList
      :messages="messages"
      :active="active"
      @copy="copyMessage"
      @edit="editMessage"
      @branch="branchMessage"
      @delete="deleteMessage"
    />

    <!-- 输入框 -->
    <MessageInput
      ref="inputRef"
      :disabled="isRunning"
      :model-name="currentModel"
      @submit="sendMessage"
      @edit="updateMessage"
      @cancel="cancelEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import AgentMenu from './AgentMenu.vue';
import MessageList from './MessageList.vue';
import MessageInput from './MessageInput.vue';
import { useAgentStore } from '@/stores/agent';
import { agentService } from '@/core/agent/AgentService';
import type { AgentMessage, Attachment } from '@/types/agent';

interface Props {
  active?: boolean;
}

const props = defineProps<Props>();

const agentStore = useAgentStore();
const inputRef = ref<InstanceType<typeof MessageInput>>();

const messages = computed(() => agentStore.activeConversation?.messages ?? []);
const isRunning = computed(() => agentStore.isRunning);
const conversationTitle = computed(() => agentStore.activeConversation?.title ?? '新对话');
const currentModel = computed(() => agentStore.activeConversation?.model);

function newConversation() {
  agentStore.newConversation();
}

function selectConversation(item: any) {
  agentStore.selectConversation(item.id);
}

function clearHistory() {
  // TODO: 实现清空历史
  agentStore.history = [];
}

async function sendMessage(text: string, attachments: Attachment[]) {
  // 添加用户消息
  const userMessage = agentStore.addMessage({
    role: 'user',
    content: text,
    attachments: attachments.length > 0 ? attachments : undefined,
  });

  // 创建助手消息占位符
  const assistantMessage = agentStore.addMessage({
    role: 'assistant',
    content: '',
    status: 'streaming',
  });

  try {
    // 调用 Agent 服务（流式）
    for await (const event of agentService.streamMessage(text)) {
      agentStore.handleEvent(event);
      
      if (event.type === 'token') {
        // 更新助手消息内容
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

  // 保存历史
  agentStore.saveHistory();
}

function copyMessage(message: AgentMessage) {
  navigator.clipboard.writeText(message.content);
  // TODO: 显示成功提示
}

function editMessage(message: AgentMessage) {
  inputRef.value?.editMessage({ id: message.id, content: message.content });
}

function branchMessage(message: AgentMessage) {
  // TODO: 实现消息分支
  console.log('Branch message:', message);
}

function deleteMessage(messageId: string) {
  agentStore.deleteMessage(messageId);
}

function updateMessage(messageId: string, newContent: string) {
  const edited = agentStore.editMessage(messageId, newContent);
  if (edited) {
    // 重新发送从编辑的消息开始
    sendMessage(newContent, []);
  }
}

function cancelEdit() {
  // 取消编辑
}

// 初始化
onMounted(() => {
  // 加载历史记录
  agentStore.loadHistory();
  
  // 如果没有活动会话，创建新会话
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
  background: var(--surface-1);
}
</style>
