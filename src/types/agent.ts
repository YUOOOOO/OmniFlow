// Agent 类型定义

export type AgentStatus = 'idle' | 'thinking' | 'running' | 'error';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    canvasId?: string;
    panelIds?: string[];
    error?: string;
  };
}

export interface AgentState {
  status: AgentStatus;
  messages: Message[];
  currentTask?: string;
}

export interface AgentConfig {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
}
