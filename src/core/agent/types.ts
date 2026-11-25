// Agent 服务类型定义

// AI Provider 类型
export type AIProvider = 'openai' | 'anthropic' | 'ollama';

// Agent 配置
export interface AgentConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

// 消息角色
export type MessageRole = 'user' | 'assistant' | 'system' | 'function';

// 消息内容
export interface MessageContent {
  type: 'text' | 'function_call' | 'function_result';
  text?: string;
  functionCall?: {
    name: string;
    arguments: Record<string, any>;
  };
  functionResult?: {
    name: string;
    result: any;
  };
}

// Agent 消息
export interface AgentMessage {
  id: string;
  role: MessageRole;
  content: string | MessageContent[];
  timestamp: number;
  metadata?: {
    toolCalls?: ToolCall[];
    error?: string;
  };
}

// 工具调用
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// 工具定义（给 AI 的）
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// 流式响应事件
export type StreamEvent = 
  | { type: 'start' }
  | { type: 'token'; token: string }
  | { type: 'tool_call'; toolCall: ToolCall }
  | { type: 'done'; message: AgentMessage }
  | { type: 'error'; error: string };

// Agent 响应
export interface AgentResponse {
  message: AgentMessage;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
