<template>
  <div class="message-input">
    <!-- 附件预览 -->
    <div v-if="attachments.length > 0" class="attachments-preview">
      <div
        v-for="attachment in attachments"
        :key="attachment.id"
        class="attachment-preview"
      >
        <PhFile :size="16" />
        <span>{{ attachment.name }}</span>
        <button class="remove-btn" @click="removeAttachment(attachment.id)">
          <PhX :size="14" />
        </button>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <!-- 附件按钮 -->
      <button class="input-action-btn" @click="triggerFileUpload" title="添加附件">
        <PhPaperclip :size="18" />
      </button>

      <!-- 文本输入 -->
      <textarea
        ref="textareaRef"
        v-model="inputText"
        class="text-input"
        :placeholder="placeholder"
        :disabled="disabled"
        rows="1"
        @keydown="handleKeyDown"
        @input="adjustHeight"
      />

      <!-- 发送按钮 -->
      <button
        class="send-btn"
        :disabled="!canSend"
        @click="submit"
        title="发送 (Ctrl+Enter)"
      >
        <PhPaperPlaneTilt :size="18" weight="fill" />
      </button>

      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInputRef"
        type="file"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />
    </div>

    <!-- 提示文字 -->
    <div class="input-hint">
      <span>Ctrl + Enter 发送</span>
      <span v-if="modelName">· {{ modelName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import {
  PhPaperclip,
  PhPaperPlaneTilt,
  PhFile,
  PhX
} from '@phosphor-icons/vue';
import type { Attachment } from '@/types/agent';

interface Props {
  disabled?: boolean;
  placeholder?: string;
  modelName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '输入消息...',
});

const emit = defineEmits<{
  submit: [text: string, attachments: Attachment[]];
  edit: [messageId: string, text: string];
  cancel: [];
}>();

const textareaRef = ref<HTMLTextAreaElement>();
const fileInputRef = ref<HTMLInputElement>();
const inputText = ref('');
const attachments = ref<Attachment[]>([]);
const editingMessageId = ref<string>();

const canSend = computed(() => {
  return (inputText.value.trim().length > 0 || attachments.value.length > 0) && !props.disabled;
});

function adjustHeight() {
  if (!textareaRef.value) return;
  
  textareaRef.value.style.height = 'auto';
  const newHeight = Math.min(textareaRef.value.scrollHeight, 200);
  textareaRef.value.style.height = newHeight + 'px';
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    submit();
  } else if (e.key === 'Escape' && editingMessageId.value) {
    cancelEdit();
  }
}

function submit() {
  if (!canSend.value) return;

  if (editingMessageId.value) {
    emit('edit', editingMessageId.value, inputText.value);
  } else {
    emit('submit', inputText.value, [...attachments.value]);
  }

  // 清空输入
  inputText.value = '';
  attachments.value = [];
  editingMessageId.value = undefined;

  // 重置高度
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  });
}

function triggerFileUpload() {
  fileInputRef.value?.click();
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  files.forEach(file => {
    const attachment: Attachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: file.type.startsWith('image/') ? 'image' : 'file',
      name: file.name,
      size: file.size,
      mimeType: file.type,
    };

    // TODO: 上传文件并获取 URL
    // 现在先用本地 URL
    attachment.url = URL.createObjectURL(file);

    attachments.value.push(attachment);
  });

  // 清空文件输入
  target.value = '';
}

function removeAttachment(id: string) {
  const index = attachments.value.findIndex(a => a.id === id);
  if (index !== -1) {
    const attachment = attachments.value[index];
    if (attachment.url) {
      URL.revokeObjectURL(attachment.url);
    }
    attachments.value.splice(index, 1);
  }
}

function fillPrompt(text: string) {
  inputText.value = text;
  adjustHeight();
  textareaRef.value?.focus();
}

function editMessage(message: { id: string; content: string }) {
  editingMessageId.value = message.id;
  inputText.value = message.content;
  adjustHeight();
  textareaRef.value?.focus();
}

function cancelEdit() {
  editingMessageId.value = undefined;
  inputText.value = '';
  attachments.value = [];
  emit('cancel');
}

// 暴露方法
defineExpose({
  fillPrompt,
  editMessage,
  cancelEdit,
});
</script>

<style scoped>
.message-input {
  flex-shrink: 0;
  background: var(--surface-2);
  border-top: 1px solid var(--border-subtle);
}

.attachments-preview {
  padding: 12px 12px 0 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--surface-3);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.attachment-preview span {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  padding: 2px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 3px;
  transition: all 150ms ease-out;
}

.remove-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
}

.input-action-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.input-action-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.text-input {
  flex: 1;
  min-height: 36px;
  max-height: 200px;
  padding: 8px 12px;
  background: var(--surface-0);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 150ms ease-out;
}

.text-input:focus {
  border-color: var(--border-focus);
}

.text-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.text-input::placeholder {
  color: var(--text-muted);
}

.send-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: rgb(var(--agent-rgb));
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease-out;
}

.send-btn:hover:not(:disabled) {
  background: rgb(var(--agent-light-rgb));
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 12px 12px;
  font-size: 11px;
  color: var(--text-muted);
}
</style>
