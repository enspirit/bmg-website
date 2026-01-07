<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ExecutionResult } from './composables/useExecution'
import Papa from 'papaparse'

const props = defineProps<{
  result: ExecutionResult | null
  outputFormat: 'json' | 'csv'
}>()

const emit = defineEmits<{
  'update:outputFormat': [value: 'json' | 'csv']
}>()

const copied = ref(false)

const formattedOutput = computed(() => {
  if (!props.result?.success || !props.result.data) return ''

  if (props.outputFormat === 'json') {
    return JSON.stringify(props.result.data, null, 2)
  } else {
    return Papa.unparse(props.result.data as object[])
  }
})

const rowCount = computed(() => {
  return props.result?.data?.length ?? 0
})

const copyToClipboard = async () => {
  if (!formattedOutput.value) return
  try {
    await navigator.clipboard.writeText(formattedOutput.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

const downloadResults = () => {
  if (!formattedOutput.value) return

  const mimeType = props.outputFormat === 'json' ? 'application/json' : 'text/csv'
  const extension = props.outputFormat === 'json' ? 'json' : 'csv'
  const blob = new Blob([formattedOutput.value], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `results.${extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const setFormat = (format: 'json' | 'csv') => {
  emit('update:outputFormat', format)
}
</script>

<template>
  <div class="results-panel">
    <div class="results-header">
      <span class="results-title">Results</span>
      <div class="results-actions">
        <template v-if="result?.success">
          <span class="row-count">{{ rowCount }} row{{ rowCount !== 1 ? 's' : '' }}</span>
          <span v-if="result.executionTime !== undefined" class="execution-time">
            {{ result.executionTime.toFixed(1) }}ms
          </span>
        </template>
        <div class="format-toggle">
          <button
            :class="['format-btn', { active: outputFormat === 'json' }]"
            @click="setFormat('json')"
          >
            JSON
          </button>
          <button
            :class="['format-btn', { active: outputFormat === 'csv' }]"
            @click="setFormat('csv')"
          >
            CSV
          </button>
        </div>
        <button
          class="copy-btn"
          @click="copyToClipboard"
          :disabled="!formattedOutput"
        >
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button
          class="download-btn"
          @click="downloadResults"
          :disabled="!formattedOutput"
          :title="`Download as ${outputFormat.toUpperCase()}`"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="results-content">
      <template v-if="!result">
        <div class="placeholder">
          Click "Run" to execute your code and see results here.
        </div>
      </template>
      <template v-else-if="result.error">
        <div class="error">
          <div class="error-title">Error</div>
          <pre class="error-message">{{ result.error }}</pre>
        </div>
      </template>
      <template v-else>
        <pre class="output">{{ formattedOutput }}</pre>
      </template>
    </div>
  </div>
</template>

<style scoped>
.results-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--sl-color-bg);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--sl-color-gray-6);
  border-bottom: 1px solid var(--sl-color-gray-5);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.results-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--sl-color-text);
}

.results-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.row-count,
.execution-time {
  font-size: 0.75rem;
  color: var(--sl-color-gray-3);
}

.format-toggle {
  display: flex;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.25rem;
  overflow: hidden;
}

.format-btn {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  font-size: 0.75rem;
  color: var(--sl-color-gray-2);
  cursor: pointer;
  transition: all 0.15s;
}

.format-btn:hover {
  background: var(--sl-color-gray-5);
}

.format-btn.active {
  background: var(--sl-color-accent);
  color: var(--sl-color-accent-high-contrast);
}

.copy-btn {
  padding: 0.25rem 0.5rem;
  background: var(--sl-color-gray-5);
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: var(--sl-color-text);
  cursor: pointer;
  transition: opacity 0.15s;
}

.copy-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.download-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  background: var(--sl-color-gray-5);
  border: none;
  border-radius: 0.25rem;
  color: var(--sl-color-text);
  cursor: pointer;
  transition: opacity 0.15s;
}

.download-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results-content {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.placeholder {
  color: var(--sl-color-gray-3);
  font-style: italic;
}

.error {
  color: var(--sl-color-red);
}

.error-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-message {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  padding: 0.75rem;
  background: var(--sl-color-red-low);
  border-radius: 0.25rem;
}

.output {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

@media (max-width: 768px) {
  .execution-time {
    display: none;
  }
}
</style>
