<template>
  <div class="omniflow-app">
    <!-- 侧边栏 -->
    <div class="sidebar">
      <div
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: currentView === item.id }"
        @click="currentView = item.id"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </div>
    </div>

    <!-- 主视图区域 -->
    <div class="main-area">
      <!-- 对话视图 -->
      <ChatView v-if="currentView === 'chat'" />

      <!-- 画布视图 -->
      <InfiniteCanvas v-else-if="currentView === 'canvas'" />

      <!-- 插件视图 -->
      <div v-else-if="currentView === 'plugins'" class="plugins-view">
        <h2>插件管理</h2>
        <p>插件功能开发中...</p>
      </div>

      <!-- 设置视图 -->
      <div v-else-if="currentView === 'settings'" class="settings-view">
        <h2>设置</h2>
        <p>设置功能开发中...</p>
      </div>
    </div>

    <!-- 快速添加按钮 -->
    <el-button
      v-if="currentView === 'canvas'"
      class="quick-add-btn"
      type="primary"
      circle
      size="large"
      @click="addPanel"
    >
      +
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ChatView from '@/components/Chat/ChatView.vue';
import InfiniteCanvas from '@/components/Canvas/InfiniteCanvas.vue';
import { usePanelStore } from '@/stores/panels';

type ViewType = 'chat' | 'canvas' | 'plugins' | 'settings';

const currentView = ref<ViewType>('chat');
const panelStore = usePanelStore();

const navItems = [
  { id: 'chat', icon: '💬', label: '对话' },
  { id: 'canvas', icon: '📋', label: '画布' },
  { id: 'plugins', icon: '🔌', label: '插件' },
  { id: 'settings', icon: '⚙️', label: '设置' }
];

function addPanel() {
  panelStore.addPanel({
    type: 'terminal',
    title: 'Terminal',
    position: { x: 100, y: 100 },
    size: { w: 600, h: 400 },
    minimized: false
  });
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

.omniflow-app {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: #1a1a1a;
}

.sidebar {
  width: 60px;
  background: #2a2a2a;
  border-right: 1px solid #444;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  color: #aaa;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #333;
  color: #fff;
}

.nav-item.active {
  background: #409eff;
  color: #fff;
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 11px;
}

.main-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.plugins-view,
.settings-view {
  padding: 40px;
  color: #fff;
}

.plugins-view h2,
.settings-view h2 {
  margin-bottom: 1rem;
}

.quick-add-btn {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 56px;
  height: 56px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}
</style>
