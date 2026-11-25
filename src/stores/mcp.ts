import { defineStore } from 'pinia';
import { mcpManager } from '@/core/mcp/MCPManager';
import type { MCPServerState, MCPToolCall, MCPToolResult } from '@/core/mcp/types';

export const useMCPStore = defineStore('mcp', {
  state: () => ({
    servers: [] as MCPServerState[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    runningServers: (state) => {
      return state.servers.filter(s => s.status === 'running');
    },

    availableTools: (state) => {
      return mcpManager.getAllTools();
    },

    getServerById: (state) => (id: string) => {
      return state.servers.find(s => s.config.id === id);
    }
  },

  actions: {
    /**
     * 初始化 MCP 系统
     */
    async initialize() {
      this.loading = true;
      this.error = null;

      try {
        // 注册内置 MCP Servers
        mcpManager.registerServer({
          id: 'filesystem',
          name: 'File System',
          description: '文件系统访问',
          command: 'mcp-server-filesystem',
          capabilities: ['tools', 'resources'],
          enabled: true
        });

        mcpManager.registerServer({
          id: 'terminal',
          name: 'Terminal',
          description: '命令行执行',
          command: 'mcp-server-terminal',
          capabilities: ['tools'],
          enabled: true
        });

        mcpManager.registerServer({
          id: 'git',
          name: 'Git',
          description: 'Git 仓库操作',
          command: 'mcp-server-git',
          capabilities: ['tools', 'resources'],
          enabled: false
        });

        // 更新状态
        this.refreshServers();

        // 自动启动已启用的 servers
        for (const server of this.servers) {
          if (server.config.enabled) {
            await this.startServer(server.config.id);
          }
        }
      } catch (error) {
        this.error = (error as Error).message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 刷新 Server 列表
     */
    refreshServers() {
      this.servers = mcpManager.getAllServers();
    },

    /**
     * 启动 Server
     */
    async startServer(serverId: string) {
      this.loading = true;
      this.error = null;

      try {
        await mcpManager.startServer(serverId);
        this.refreshServers();
      } catch (error) {
        this.error = (error as Error).message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 停止 Server
     */
    async stopServer(serverId: string) {
      this.loading = true;
      this.error = null;

      try {
        await mcpManager.stopServer(serverId);
        this.refreshServers();
      } catch (error) {
        this.error = (error as Error).message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 调用 MCP 工具
     */
    async callTool(serverId: string, toolCall: MCPToolCall): Promise<MCPToolResult> {
      return await mcpManager.callTool(serverId, toolCall);
    },

    /**
     * 切换 Server 启用状态
     */
    async toggleServer(serverId: string) {
      const server = this.getServerById(serverId);
      if (!server) return;

      if (server.status === 'running') {
        await this.stopServer(serverId);
      } else {
        await this.startServer(serverId);
      }
    }
  }
});
