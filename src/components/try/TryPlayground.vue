<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import CodeEditor from './CodeEditor.vue'
import ResultsPanel from './ResultsPanel.vue'
import FileManager from './FileManager.vue'
import { useDataSources, type DataSource, type DataSourceType } from './composables/useDataSources'
import { useExecution, type ExecutionResult } from './composables/useExecution'
import { useStorage, type StoredState } from './composables/useStorage'

const { dataSources, loadDefaults, addDataSource, updateDataSource, removeDataSource, setDataSources, reparse } = useDataSources()
const { execute } = useExecution()
const { load, save } = useStorage()

const code = ref(`// Explore suppliers from Paris and their supplies
const parisSuppliers = suppliers
  .restrict({ city: 'Paris' })
  .project(['sid', 'name'])

parisSuppliers
  .join(supplies, ['sid'])
  .join(parts, ['pid'])
  .project(['name', 'pname', 'qty'])`)

const result = ref<ExecutionResult | null>(null)
const outputFormat = ref<'json' | 'csv'>('json')

// Persistence
const saveState = () => {
  const state: StoredState = {
    version: 1,
    dataSources: dataSources.value.map(ds => ({
      id: ds.id,
      name: ds.name,
      type: ds.type,
      content: ds.content
    })),
    code: code.value,
    outputFormat: outputFormat.value
  }
  save(state)
}

// Watch for changes and auto-save
watch([dataSources, code, outputFormat], saveState, { deep: true })

// Load on mount
onMounted(() => {
  const stored = load()
  if (stored && stored.dataSources.length > 0) {
    // Restore from storage
    const sources: DataSource[] = stored.dataSources.map(ds => ({
      id: ds.id,
      name: ds.name,
      type: ds.type,
      content: ds.content,
      data: null
    }))
    setDataSources(sources)
    reparse()
    code.value = stored.code
    outputFormat.value = stored.outputFormat
  } else {
    // Load defaults
    loadDefaults()
  }
})

const handleRun = () => {
  result.value = execute(code.value, dataSources.value)
}

const handleAddSource = (name: string, type: DataSourceType, content: string) => {
  const error = addDataSource(name, type, content)
  if (error) {
    alert(error)
  }
}

const handleUpdateSource = (id: string, updates: Partial<Pick<DataSource, 'name' | 'type' | 'content'>>) => {
  const error = updateDataSource(id, updates)
  if (error) {
    alert(error)
  }
}

const handleDeleteSource = (id: string) => {
  removeDataSource(id)
}

const handleLoadDefaults = () => {
  loadDefaults()
  result.value = null
}
</script>

<template>
  <div class="playground-wrapper">
    <header class="playground-header">
      <a href="/" class="site-title">
        <span class="site-name">Bmg.js</span>
        <span class="page-name">Playground</span>
      </a>
      <nav class="header-nav">
        <a href="/usage/getting-started-ts/" class="nav-link">Docs</a>
        <a href="/reference/overview/" class="nav-link">Reference</a>
        <a href="https://github.com/enspirit/bmg.js" class="nav-link" target="_blank" rel="noopener">GitHub</a>
      </nav>
    </header>

    <div class="playground">
      <aside class="sidebar">
        <FileManager
          :dataSources="dataSources"
          @add="handleAddSource"
          @update="handleUpdateSource"
          @delete="handleDeleteSource"
          @loadDefaults="handleLoadDefaults"
        />
      </aside>

      <main class="main-content">
        <div class="editor-pane">
          <CodeEditor v-model="code" @run="handleRun" />
        </div>
        <div class="results-pane">
          <ResultsPanel
            :result="result"
            v-model:outputFormat="outputFormat"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.playground-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  height: 3rem;
  background: var(--sl-color-gray-6);
  border-bottom: 1px solid var(--sl-color-gray-5);
  flex-shrink: 0;
}

.site-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--sl-color-text);
}

.site-name {
  font-weight: 700;
  font-size: 1rem;
}

.page-name {
  font-weight: 400;
  font-size: 0.875rem;
  color: var(--sl-color-gray-2);
}

.page-name::before {
  content: '/';
  margin-right: 0.5rem;
  color: var(--sl-color-gray-4);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  font-size: 0.875rem;
  color: var(--sl-color-gray-2);
  text-decoration: none;
  transition: color 0.15s;
}

.nav-link:hover {
  color: var(--sl-color-text);
}

.playground {
  display: grid;
  grid-template-columns: 20% 80%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sidebar {
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.main-content {
  display: grid;
  grid-template-rows: 50% 50%;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.editor-pane {
  min-height: 0;
  overflow: visible;
}

.results-pane {
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .playground {
    grid-template-columns: 1fr;
    grid-template-rows: 150px 1fr 1fr;
  }

  .sidebar {
    height: 150px;
  }

  .header-nav {
    gap: 1rem;
  }

  .nav-link {
    font-size: 0.75rem;
  }
}
</style>
