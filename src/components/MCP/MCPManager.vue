<template>
  <div class="mcp-manager">
    <div class="mcp-header">
      <h2>MCP Servers</h2>
      <p class="text-secondary">管理模型上下文协议服务</p>
    </div>

    <div v-if="mcpStore.loading" class="mcp-loading">
      <el-skeleton :rows="3" animated />
    </div>

    <div v-else class="mcp-servers">
      <div
        v-for="server in mcpStore.servers"
        :key="server.config.id"
        class="mcp-server-card"
        :class="`status-${server.status}`"
      >
        <!-- Server 头部 -->
        <div class="server-header">
          <div class="server-info">
            <div class="server-status-dot" />
            <div>
              <h3 class="server-name">{{ server.config.name }}</h3>
              <p class="server-desc">{{ server.config.description }}</p>
            </div>
          </div>
          <el-switch
            :model-value="server.status === 'running'"
            @change="mcpStore.toggleServer(server.config.id)"
            :loading="server.status === 'starting'"
          />
        </div>

        <!-- Server 详情 -->
        <div v-if="server.status === 'running'" class="server-details">
          <div class="server-stats">
            <div class="stat-item">
              <PhWrench :size="16" />
              <span>{{ server.tools.length }} 工具</span>
            </div>
            <div class="stat-item">
              <PhFiles :size="16" />
              <span>{{ server.resources.length }} 资源</span>
            </div>
          </div>

          <!-- 工具列表 -->
          <div v-if="server.tools.length > 0" class="tools-list">
            <div class="tools-header">可用工具</div>
            <div
              v-for="tool in server.tools"
              :key="tool.name"
              class="tool-item"
            >
              <PhTerminal :size="14" />
              <span class="tool-name">{{ tool.name }}</span>
              <span class="tool-desc">{{ tool.description }}</span>
            </div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="server.status === 'error'" class="server-error">
          <PhWarning :size="16" />
          <span>{{ server.error }}</span>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <el-alert
      v-if="mcpStore.error"
      type="error"
      :title="mcpStore.error"
      :closable="false"
      style="margin-top: 16px"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { PhWrench, PhFiles, PhTerminal, PhWarning } from '@phosphor-icons/vue';
import { useMCPStore } from '@/stores/mcp';

const mcpStore = useMCPStore();

onMounted(async () => {
  await mcpStore.initialize();
});
</script>

<style scoped>
.mcp-manager {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.mcp-header {
  margin-bottom: 24px;
}

.mcp-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.mcp-loading {
  background: var(--surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 24px;
}

.mcp-servers {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mcp-server-card {
  background: var(--surface-1);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 20px;
  transition: all 150ms ease-out;
}

.mcp-server-card.status-running {
  border-color: var(--activity-green);
  background: var(--surface-2);
}

.mcp-server-card.status-error {
  border-color: var(--activity-orange);
}

.server-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.server-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.server-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  margin-top: 6px;
  flex-shrink: 0;
}

.status-running .server-status-dot {
  background: var(--activity-green);
  box-shadow: 0 0 8px var(--activity-green);
}

.status-error .server-status-dot {
  background: var(--activity-orange);
}

.server-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.server-desc {
  font-size: 13px;
  color: var(--text-secondary);
}

.server-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subtle);
}

.server-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.tools-list {
  margin-top: 12px;
}

.tools-header {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--surface-0);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.tool-name {
  font-family: monospace;
  color: var(--text-primary);
  font-weight: 500;
}

.tool-desc {
  color: var(--text-muted);
  margin-left: auto;
}

.server-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 159, 10, 0.1);
  border-radius: 6px;
  color: var(--activity-orange);
  font-size: 13px;
}
</style>
