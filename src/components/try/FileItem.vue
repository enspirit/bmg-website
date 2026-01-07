<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DataSource } from './composables/useDataSources'

const props = defineProps<{
  source: DataSource
}>()

const emit = defineEmits<{
  'edit': [source: DataSource]
  'delete': [id: string]
}>()

const rowCount = computed(() => {
  return props.source.data?.length ?? 0
})
</script>

<template>
  <div :class="['file-item', { 'has-error': source.error }]">
    <div class="file-info">
      <span class="file-name">{{ source.name }}</span>
      <span :class="['file-type', source.type]">{{ source.type.toUpperCase() }}</span>
    </div>
    <div class="file-meta">
      <span v-if="source.error" class="file-error" :title="source.error">Error</span>
      <span v-else class="file-rows">{{ rowCount }} rows</span>
    </div>
    <div class="file-actions">
      <button class="action-btn" @click="emit('edit', source)" title="Edit">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="action-btn delete" @click="emit('delete', source.id)" title="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--sl-color-gray-6);
  border-radius: 0.375rem;
  border: 1px solid var(--sl-color-gray-5);
}

.file-item.has-error {
  border-color: var(--sl-color-red);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--sl-color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-type {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
}

.file-type.json {
  background: var(--sl-color-blue-low);
  color: var(--sl-color-blue);
}

.file-type.csv {
  background: var(--sl-color-green-low);
  color: var(--sl-color-green);
}

.file-type.excel {
  background: var(--sl-color-orange-low);
  color: var(--sl-color-orange);
}

.file-meta {
  font-size: 0.75rem;
  color: var(--sl-color-gray-3);
}

.file-error {
  color: var(--sl-color-red);
}

.file-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: var(--sl-color-gray-3);
  cursor: pointer;
  transition: all 0.15s;
}

.action-btn:hover {
  background: var(--sl-color-gray-5);
  color: var(--sl-color-text);
}

.action-btn.delete:hover {
  background: var(--sl-color-red-low);
  color: var(--sl-color-red);
}
</style>
