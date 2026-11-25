import type { AgentEvent } from '@/types/agent';

/**
 * Agent 服务 - 处理 AI 对话
 */
class AgentService {
  private apiKey: string = '';
  private apiUrl: string = 'https://api.openai.com/v1/chat/completions';

  /**
   * 配置 API
   */
  configure(config: { apiKey?: string; apiUrl?: string }) {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.apiUrl) this.apiUrl = config.apiUrl;
  }

  /**
   * 流式发送消息
   */
  async *streamMessage(prompt: string): AsyncGenerator<AgentEvent> {
    // 检查配置
    if (!this.apiKey) {
      yield { type: 'error', error: '请先配置 API Key' };
      return;
    }

    const runId = `run-${Date.now()}`;
    yield { type: 'start', runId };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '你是 OmniFlow 的 AI 助手，可以帮助用户管理画布、调用工具、执行命令。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        yield { type: 'error', error: `API 错误: ${error}` };
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        yield { type: 'error', error: '无法读取响应流' };
        return;
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line === 'data: [DONE]') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const delta = data.choices?.[0]?.delta;
              
              if (delta?.content) {
                yield { type: 'token', token: delta.content };
              }
            } catch (e) {
              console.error('解析流式响应失败:', e);
            }
          }
        }
      }

      yield { 
        type: 'done', 
        message: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: '', // 内容已经通过 token 事件发送
          timestamp: Date.now()
        }
      };

    } catch (error) {
      yield { 
        type: 'error', 
        error: error instanceof Error ? error.message : '未知错误' 
      };
    }
  }

  /**
   * 模拟模式（测试用）
   */
  async *streamMessageMock(prompt: string): AsyncGenerator<AgentEvent> {
    const runId = `run-${Date.now()}`;
    yield { type: 'start', runId };

    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟响应
    const response = `收到你的消息："${prompt}"\n\n我是 OmniFlow Agent，目前处于测试模式。请配置 OpenAI API Key 以启用真实对话功能。\n\n你可以让我：\n- 创建和管理画布\n- 添加各种面板\n- 配置 MCP Server\n- 执行命令和操作`;

    // 逐字输出
    for (const char of response) {
      yield { type: 'token', token: char };
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    yield { 
      type: 'done', 
      message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }
    };
  }
}

export const agentService = new AgentService();
