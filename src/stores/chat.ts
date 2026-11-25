import { defineStore } from 'pinia';
import type { AgentState, Message } from '@/types/agent';
import { agentService } from '@/core/agent/AgentService';

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
      agentService.clearHistory();
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
        // 调用 Agent 服务
        const response = await agentService.sendMessage(content);
        
        this.addMessage({
          role: 'assistant',
          content: typeof response.message.content === 'string' 
            ? response.message.content 
            : JSON.stringify(response.message.content)
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
        this.currentTask = undefined;
      }
    },

    async sendMessageStream(content: string) {
      // 添加用户消息
      this.addMessage({
        role: 'user',
        content
      });

      this.status = 'thinking';
      this.currentTask = content;

      try {
        let assistantMessage = '';
        
        // 流式接收
        for await (const event of agentService.streamMessage(content)) {
          if (event.type === 'token') {
            assistantMessage += event.token;
            
            // 更新最后一条消息（如果是助手消息）
            const lastMsg = this.messages[this.messages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = assistantMessage;
            } else {
              this.addMessage({
                role: 'assistant',
                content: assistantMessage
              });
            }
          } else if (event.type === 'done') {
            this.status = 'idle';
            this.currentTask = undefined;
          } else if (event.type === 'error') {
            this.status = 'error';
            this.addMessage({
              role: 'assistant',
              content: '抱歉，出错了：' + event.error,
              metadata: { error: event.error }
            });
            this.currentTask = undefined;
          }
        }
      } catch (error) {
        this.status = 'error';
        this.addMessage({
          role: 'assistant',
          content: '抱歉，出错了：' + (error as Error).message,
          metadata: { error: (error as Error).message }
        });
        this.currentTask = undefined;
      }
    }
  }
});
