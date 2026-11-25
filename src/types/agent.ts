// Agent 系统类型定义（基于 Toonflow）

// 消息角色
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// 消息状态
export type MessageStatus = 'pending' | 'streaming' | 'done' | 'error';

// 消息内容
export interface MessageContent {
  type: 'text' | 'image' | 'file' | 'tool_call' | 'tool_result';
  text?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  toolCall?: ToolCall;
  toolResult?: any;
}

// Agent 消息
export interface AgentMessage {
  id: string;
  role: MessageRole;
  content: string;
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
  status?: MessageStatus;
  timestamp: number;
  parentId?: string; // 用于消息分支
  editedFrom?: string; // 编辑来源
}

// 附件
export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'reference';
  name: string;
  url?: string;
  size?: number;
  mimeType?: string;
  content?: string; // 文本内容或引用
}

// 工具调用
export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
  result?: any;
  error?: string;
}

// 会话
export interface Conversation {
  id: string;
  key: string;
  title: string;
  messages: AgentMessage[];
  model?: string;
  file?: string; // 保存路径
  parentFile?: string; // 父会话
  subAgents?: SubAgent[]; // 子 Agent
  running?: boolean;
  stats?: ConversationStats;
  contextUsage?: ContextUsage;
  createdAt: number;
  updatedAt: number;
}

// 子 Agent
export interface SubAgent {
  id: string;
  name: string;
  file: string;
  status: 'idle' | 'running' | 'done' | 'error' | 'cancelled';
  result?: string;
  error?: string;
}

// 会话统计
export interface ConversationStats {
  messageCount: number;
  tokenCount: number;
  duration: number;
}

// 上下文使用情况
export interface ContextUsage {
  used: number;
  total: number;
  percentage: number;
}

// Agent 事件
export type AgentEvent =
  | { type: 'start'; runId: string }
  | { type: 'token'; token: string }
  | { type: 'tool_call'; toolCall: ToolCall }
  | { type: 'tool_result'; toolId: string; result: any }
  | { type: 'done'; message: AgentMessage }
  | { type: 'error'; error: string }
  | { type: 'session'; file: string; runId: string }
  | { type: 'report'; parentFile: string; content: string };

// 消息队列
export interface AgentQueue {
  runId: string;
  revision: number;
  steering: QueuedAction[];
  followUp: AgentMessage[];
}

// 排队动作
export interface QueuedAction {
  id: string;
  type: 'steer' | 'delete' | 'edit';
  messageId?: string;
  content?: string;
}

// Agent 配置
export interface AgentConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: string[]; // 启用的工具
}

// 历史记录项
export interface HistoryItem {
  id: string;
  title: string;
  file: string;
  lastMessage?: string;
  timestamp: number;
}
