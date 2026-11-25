import { defineStore } from 'pinia';
import type {
  Conversation,
  AgentMessage,
  AgentEvent,
  AgentQueue,
  HistoryItem,
  SubAgent,
  Attachment,
  ToolCall
} from '@/types/agent';

export const useAgentStore = defineStore('agent', {
  state: () => ({
    // 当前激活的会话
    activeConversationId: null as string | null,
    
    // 所有会话
    conversations: new Map<string, Conversation>(),
    
    // 会话历史
    history: [] as HistoryItem[],
    
    // 加载状态
    loading: false,
    historyLoading: false,
    
    // 可见性
    visible: true,
  }),

  getters: {
    // 当前会话
    activeConversation: (state): Conversation | undefined => {
      return state.activeConversationId 
        ? state.conversations.get(state.activeConversationId)
        : undefined;
    },

    // 所有会话列表
    conversationList: (state): Conversation[] => {
      return Array.from(state.conversations.values())
        .sort((a, b) => b.updatedAt - a.updatedAt);
    },

    // 是否有消息
    hasMessages(): boolean {
      return this.activeConversation?.messages.length ?? 0 > 0;
    },

    // 是否正在运行
    isRunning(): boolean {
      return this.activeConversation?.running ?? false;
    },
  },

  actions: {
    /**
     * 创建新会话
     */
    newConversation(config?: { title?: string; model?: string; parentFile?: string }): Conversation {
      const id = `conv-${Date.now()}`;
      const conversation: Conversation = {
        id,
        key: id,
        title: config?.title ?? '新对话',
        messages: [],
        model: config?.model,
        parentFile: config?.parentFile,
        subAgents: [],
        running: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.conversations.set(id, conversation);
      this.activeConversationId = id;
      
      return conversation;
    },

    /**
     * 选择会话
     */
    selectConversation(id: string) {
      if (this.conversations.has(id)) {
        this.activeConversationId = id;
      }
    },

    /**
     * 重命名会话
     */
    renameConversation(id: string, title: string) {
      const conversation = this.conversations.get(id);
      if (conversation) {
        conversation.title = title;
        conversation.updatedAt = Date.now();
      }
    },

    /**
     * 删除会话
     */
    removeConversation(id: string) {
      this.conversations.delete(id);
      
      // 如果删除的是当前会话，切换到其他会话
      if (this.activeConversationId === id) {
        const conversations = this.conversationList;
        this.activeConversationId = conversations[0]?.id ?? null;
      }
    },

    /**
     * 添加消息
     */
    addMessage(message: Omit<AgentMessage, 'id' | 'timestamp'>): AgentMessage {
      const conversation = this.activeConversation;
      if (!conversation) {
        throw new Error('No active conversation');
      }

      const newMessage: AgentMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      conversation.messages.push(newMessage);
      conversation.updatedAt = Date.now();

      // 自动更新标题（取第一条用户消息）
      if (conversation.messages.length === 1 && message.role === 'user') {
        conversation.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
      }

      return newMessage;
    },

    /**
     * 更新消息
     */
    updateMessage(messageId: string, updates: Partial<AgentMessage>) {
      const conversation = this.activeConversation;
      if (!conversation) return;

      const message = conversation.messages.find(m => m.id === messageId);
      if (message) {
        Object.assign(message, updates);
        conversation.updatedAt = Date.now();
      }
    },

    /**
     * 删除消息
     */
    deleteMessage(messageId: string) {
      const conversation = this.activeConversation;
      if (!conversation) return;

      const index = conversation.messages.findIndex(m => m.id === messageId);
      if (index !== -1) {
        conversation.messages.splice(index, 1);
        conversation.updatedAt = Date.now();
      }
    },

    /**
     * 编辑消息
     */
    editMessage(messageId: string, newContent: string): AgentMessage | undefined {
      const conversation = this.activeConversation;
      if (!conversation) return;

      const index = conversation.messages.findIndex(m => m.id === messageId);
      if (index === -1) return;

      // 创建新消息
      const originalMessage = conversation.messages[index];
      const editedMessage: AgentMessage = {
        ...originalMessage,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: newContent,
        editedFrom: messageId,
        timestamp: Date.now(),
      };

      // 删除原消息之后的所有消息
      conversation.messages.splice(index);
      
      // 添加编辑后的消息
      conversation.messages.push(editedMessage);
      conversation.updatedAt = Date.now();

      return editedMessage;
    },

    /**
     * 分支消息
     */
    branchMessage(messageId: string): AgentMessage | undefined {
      const conversation = this.activeConversation;
      if (!conversation) return;

      const index = conversation.messages.findIndex(m => m.id === messageId);
      if (index === -1) return;

      const message = conversation.messages[index];
      
      // 创建分支消息
      const branchMessage: AgentMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        parentId: messageId,
        timestamp: Date.now(),
      };

      return branchMessage;
    },

    /**
     * 添加附件
     */
    addAttachment(messageId: string, attachment: Attachment) {
      const conversation = this.activeConversation;
      if (!conversation) return;

      const message = conversation.messages.find(m => m.id === messageId);
      if (message) {
        if (!message.attachments) {
          message.attachments = [];
        }
        message.attachments.push(attachment);
        conversation.updatedAt = Date.now();
      }
    },

    /**
     * 移除附件
     */
    removeAttachment(messageId: string, attachmentId: string) {
      const conversation = this.activeConversation;
      if (!conversation) return;

      const message = conversation.messages.find(m => m.id === messageId);
      if (message?.attachments) {
        message.attachments = message.attachments.filter(a => a.id !== attachmentId);
        conversation.updatedAt = Date.now();
      }
    },

    /**
     * 添加子 Agent
     */
    addSubAgent(subAgent: SubAgent) {
      const conversation = this.activeConversation;
      if (!conversation) return;

      if (!conversation.subAgents) {
        conversation.subAgents = [];
      }
      conversation.subAgents.push(subAgent);
      conversation.updatedAt = Date.now();
    },

    /**
     * 更新子 Agent 状态
     */
    updateSubAgent(subAgentId: string, updates: Partial<SubAgent>) {
      const conversation = this.activeConversation;
      if (!conversation?.subAgents) return;

      const subAgent = conversation.subAgents.find(sa => sa.id === subAgentId);
      if (subAgent) {
        Object.assign(subAgent, updates);
        conversation.updatedAt = Date.now();
      }
    },

    /**
     * 设置运行状态
     */
    setRunning(running: boolean) {
      const conversation = this.activeConversation;
      if (conversation) {
        conversation.running = running;
      }
    },

    /**
     * 处理 Agent 事件
     */
    handleEvent(event: AgentEvent) {
      const conversation = this.activeConversation;
      if (!conversation) return;

      switch (event.type) {
        case 'start':
          this.setRunning(true);
          break;

        case 'token':
          // 更新最后一条助手消息
          const lastMessage = conversation.messages[conversation.messages.length - 1];
          if (lastMessage?.role === 'assistant' && lastMessage.status === 'streaming') {
            lastMessage.content += event.token;
          }
          break;

        case 'tool_call':
          // 添加工具调用到最后一条消息
          const msg = conversation.messages[conversation.messages.length - 1];
          if (msg) {
            if (!msg.toolCalls) msg.toolCalls = [];
            msg.toolCalls.push(event.toolCall);
          }
          break;

        case 'tool_result':
          // 更新工具调用结果
          const message = conversation.messages[conversation.messages.length - 1];
          if (message?.toolCalls) {
            const tool = message.toolCalls.find(t => t.id === event.toolId);
            if (tool) {
              tool.result = event.result;
            }
          }
          break;

        case 'done':
          this.setRunning(false);
          this.updateMessage(event.message.id, { status: 'done' });
          break;

        case 'error':
          this.setRunning(false);
          const errorMsg = conversation.messages[conversation.messages.length - 1];
          if (errorMsg) {
            this.updateMessage(errorMsg.id, { status: 'error' });
          }
          break;
      }

      conversation.updatedAt = Date.now();
    },

    /**
     * 加载历史
     */
    async loadHistory() {
      this.historyLoading = true;
      
      try {
        // TODO: 从文件系统加载历史
        // 现在先用 localStorage
        const saved = localStorage.getItem('omniflow-agent-history');
        if (saved) {
          this.history = JSON.parse(saved);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      } finally {
        this.historyLoading = false;
      }
    },

    /**
     * 保存历史
     */
    saveHistory() {
      try {
        const historyItems: HistoryItem[] = this.conversationList.map(conv => ({
          id: conv.id,
          title: conv.title,
          file: conv.file ?? '',
          lastMessage: conv.messages[conv.messages.length - 1]?.content,
          timestamp: conv.updatedAt,
        }));

        localStorage.setItem('omniflow-agent-history', JSON.stringify(historyItems));
      } catch (error) {
        console.error('Failed to save history:', error);
      }
    },

    /**
     * 清空当前会话
     */
    clearCurrentConversation() {
      const conversation = this.activeConversation;
      if (conversation) {
        conversation.messages = [];
        conversation.updatedAt = Date.now();
      }
    },

    /**
     * 切换可见性
     */
    toggleVisible() {
      this.visible = !this.visible;
    },
  },
});
