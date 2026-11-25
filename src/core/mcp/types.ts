// MCP 相关类型定义

// MCP Server 配置
export interface MCPServerConfig {
  id: string;
  name: string;
  description?: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  capabilities?: ('tools' | 'resources' | 'prompts')[];
  enabled: boolean;
}

// MCP 工具定义
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// MCP 资源定义
export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// MCP 工具调用请求
export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

// MCP 工具调用结果
export interface MCPToolResult {
  success: boolean;
  content?: any;
  error?: string;
}

// MCP Server 状态
export type MCPServerStatus = 'stopped' | 'starting' | 'running' | 'error';

export interface MCPServerState {
  config: MCPServerConfig;
  status: MCPServerStatus;
  tools: MCPTool[];
  resources: MCPResource[];
  error?: string;
}
