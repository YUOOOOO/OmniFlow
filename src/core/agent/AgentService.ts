import type {
  AgentConfig,
  AgentMessage,
  AgentResponse,
  StreamEvent,
  ToolDefinition,
  ToolCall
} from './types';
import { mcpManager } from '@/core/mcp/MCPManager';

/**
 * Agent 服务
 * 负责与 AI 模型交互，支持工具调用和流式响应
 */
export class AgentService {
  private config: AgentConfig;
  private messages: AgentMessage[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * 发送消息（非流式）
   */
  async sendMessage(userMessage: string): Promise<AgentResponse> {
    const message: AgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };

    this.messages.push(message);

    // 获取可用工具
    const tools = this.getAvailableTools();

    try {
      // 调用 AI API
      const response = await this.callAI(this.messages, tools);
      
      this.messages.push(response.message);

      // 如果有工具调用，执行工具
      if (response.toolCalls && response.toolCalls.length > 0) {
        await this.executeTools(response.toolCalls);
        // 递归调用，让 AI 看到工具结果
        return await this.sendMessage('');
      }

      return response;
    } catch (error) {
      throw new Error(`Agent error: ${(error as Error).message}`);
    }
  }

  /**
   * 流式发送消息
   */
  async *streamMessage(userMessage: string): AsyncGenerator<StreamEvent> {
    const message: AgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };

    this.messages.push(message);

    yield { type: 'start' };

    const tools = this.getAvailableTools();

    try {
      // 模拟流式响应
      const response = await this.callAI(this.messages, tools);
      
      // 逐字输出
      const text = typeof response.message.content === 'string' 
        ? response.message.content 
        : '';
      
      for (const char of text) {
        yield { type: 'token', token: char };
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      this.messages.push(response.message);

      yield { type: 'done', message: response.message };
    } catch (error) {
      yield { type: 'error', error: (error as Error).message };
    }
  }

  /**
   * 调用 AI API
   */
  private async callAI(
    messages: AgentMessage[],
    tools: ToolDefinition[]
  ): Promise<AgentResponse> {
    // TODO: 实际调用 AI API（OpenAI/Anthropic/Ollama）
    // 这里先返回模拟响应
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lastMessage = messages[messages.length - 1];
    const userText = typeof lastMessage.content === 'string' 
      ? lastMessage.content 
      : '';

    // 简单的规则响应
    let responseText = '';
    
    if (userText.includes('画布') || userText.includes('canvas')) {
      responseText = '好的！我可以帮你创建一个新的画布。画布已经准备好了，你可以在上面添加各种面板。';
    } else if (userText.includes('Terminal') || userText.includes('终端')) {
      responseText = '我来帮你添加一个 Terminal 面板。你可以在里面执行命令。';
    } else if (userText.includes('MCP') || userText.includes('工具')) {
      responseText = `我现在可以使用 ${tools.length} 个 MCP 工具，包括文件读写、命令执行等功能。`;
    } else {
      responseText = '收到！我是 OmniFlow 的 AI 助手。我可以帮你管理画布、调用工具、执行命令。有什么我可以帮你的吗？';
    }

    const responseMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: responseText,
      timestamp: Date.now()
    };

    return {
      message: responseMessage,
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150
      }
    };
  }

  /**
   * 获取可用工具
   */
  private getAvailableTools(): ToolDefinition[] {
    const mcpTools = mcpManager.getAllTools();
    
    return mcpTools.map(({ serverId, tool }) => ({
      name: `${serverId}_${tool.name}`,
      description: tool.description,
      parameters: {
        type: 'object' as const,
        properties: tool.inputSchema.properties,
        required: tool.inputSchema.required
      }
    }));
  }

  /**
   * 执行工具调用
   */
  private async executeTools(toolCalls: ToolCall[]): Promise<void> {
    for (const call of toolCalls) {
      const [serverId, toolName] = call.function.name.split('_');
      const args = JSON.parse(call.function.arguments);
      
      const result = await mcpManager.callTool(serverId, {
        name: toolName,
        arguments: args
      });

      // 将结果添加到消息历史
      this.messages.push({
        id: `tool-${Date.now()}`,
        role: 'function',
        content: JSON.stringify(result),
        timestamp: Date.now()
      });
    }
  }

  /**
   * 清除消息历史
   */
  clearHistory(): void {
    this.messages = [];
  }

  /**
   * 获取消息历史
   */
  getHistory(): AgentMessage[] {
    return [...this.messages];
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// 默认实例
export const agentService = new AgentService({
  provider: 'openai',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000
});
