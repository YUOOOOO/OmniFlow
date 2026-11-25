import { defineStore } from 'pinia';
import type { AgentState, Message } from '@/types/agent';

export const useChatStore = defineStore('chat', {
  state: (): AgentState => ({
    status: 'idle',
    messages: [],
    currentTask: undefined
  }),

  getters: {
    isThinking: (state) => state.status === 'thinking',
    hasMessages: (state) => state.messages.length > 0
  },

  actions: {
    addMessage(message: Omit<Message, 'id' | 'timestamp'>) {
      this.messages.push({
        ...message,
        id: `msg-${Date.now()}`,
        timestamp: Date.now()
      });
    },

    setStatus(status: AgentState['status']) {
      this.status = status;
    },

    clearMessages() {
      this.messages = [];
    },

    async sendMessage(content: string) {
      // 添加用户消息
      this.addMessage({
        role: 'user',
        content
      });

      // 设置状态为思考中
      this.status = 'thinking';
      this.currentTask = content;

      try {
        // TODO: 调用 AI API
        // 临时模拟响应
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.addMessage({
          role: 'assistant',
          content: '收到！我来帮你处理...'
        });

        this.status = 'idle';
        this.currentTask = undefined;
      } catch (error) {
        this.status = 'error';
        this.addMessage({
          role: 'assistant',
          content: '抱歉，出错了：' + (error as Error).message,
          metadata: { error: (error as Error).message }
        });
      }
    }
  }
});
