<template>
  <div class="file-explorer">
    <!-- 左侧文件列表 -->
    <div class="file-sidebar">
      <div class="file-header">
        <h3>文件浏览器</h3>
        <button class="refresh-btn" @click="refreshFiles">
          <PhArrowClockwise :size="16" />
        </button>
      </div>
      
      <div class="file-tree">
        <div class="file-item" @click="selectFile(null)">
          <PhFolder :size="16" />
          <span>项目根目录</span>
        </div>
        
        <!-- 文件列表（模拟） -->
        <div
          v-for="file in files"
          :key="file.path"
          class="file-item"
          :class="{ active: selectedFile?.path === file.path }"
          @click="selectFile(file)"
        >
          <PhFile :size="16" />
          <span>{{ file.name }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧文件内容 -->
    <div class="file-content">
      <div v-if="!selectedFile" class="empty-state">
        <PhFiles :size="48" weight="duotone" />
        <p>选择一个文件查看内容</p>
      </div>
      
      <div v-else class="editor-container">
        <div class="editor-header">
          <span class="file-path">{{ selectedFile.path }}</span>
          <button class="close-btn" @click="closeFile">
            <PhX :size="16" />
          </button>
        </div>
        
        <div class="editor-content">
          <pre>{{ selectedFile.content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  PhFolder,
  PhFile,
  PhFiles,
  PhArrowClockwise,
  PhX
} from '@phosphor-icons/vue';

interface FileItem {
  name: string;
  path: string;
  content: string;
}

const files = ref<FileItem[]>([
  {
    name: 'App.vue',
    path: 'src/App.vue',
    content: '<template>\n  <div class="app">\n    Hello OmniFlow\n  </div>\n</template>'
  },
  {
    name: 'main.ts',
    path: 'src/main.ts',
    content: 'import { createApp } from "vue";\nimport App from "./App.vue";\n\nconst app = createApp(App);\napp.mount("#app");'
  },
  {
    name: 'README.md',
    path: 'README.md',
    content: '# OmniFlow\n\n无限画布 + AI Agent 工作流平台'
  }
]);

const selectedFile = ref<FileItem | null>(null);

function selectFile(file: FileItem | null) {
  selectedFile.value = file;
}

function closeFile() {
  selectedFile.value = null;
}

function refreshFiles() {
  // TODO: 实际读取文件系统
  console.log('Refreshing files...');
}
</script>

<style scoped>
.file-explorer {
  display: flex;
  height: 100%;
  background: var(--surface-0);
}

/* 左侧文件列表 */
.file-sidebar {
  width: 280px;
  background: var(--surface-1);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-subtle);
}

.file-header h3 {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.refresh-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.refresh-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.file-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 13px;
  transition: all 150ms ease-out;
  user-select: none;
}

.file-item:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.file-item.active {
  background: var(--surface-3);
  color: var(--text-primary);
}

/* 右侧文件内容 */
.file-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  gap: 12px;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--surface-1);
  border-bottom: 1px solid var(--border-subtle);
}

.file-path {
  font-size: 13px;
  color: var(--text-secondary);
  font-family: monospace;
}

.close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.close-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.editor-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  background: var(--surface-0);
}

.editor-content pre {
  margin: 0;
  font-family: 'Cascadia Code', 'Fira Code', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
