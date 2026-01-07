<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DataSource, DataSourceType } from './composables/useDataSources'
import FileItem from './FileItem.vue'

const props = defineProps<{
  dataSources: DataSource[]
}>()

const emit = defineEmits<{
  'add': [name: string, type: DataSourceType, content: string]
  'update': [id: string, updates: Partial<Pick<DataSource, 'name' | 'type' | 'content'>>]
  'delete': [id: string]
  'loadDefaults': []
}>()

const showModal = ref(false)
const editingSource = ref<DataSource | null>(null)

const modalName = ref('')
const modalType = ref<DataSourceType>('json')
const modalContent = ref('')
const modalError = ref('')

const isEditing = computed(() => editingSource.value !== null)

const openAddModal = () => {
  editingSource.value = null
  modalName.value = ''
  modalType.value = 'json'
  modalContent.value = ''
  modalError.value = ''
  showModal.value = true
}

const openEditModal = (source: DataSource) => {
  editingSource.value = source
  modalName.value = source.name
  modalType.value = source.type
  modalContent.value = source.content
  modalError.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingSource.value = null
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const isExcel = file.name.match(/\.xlsx?$/i)

  const reader = new FileReader()
  reader.onload = (e) => {
    if (isExcel) {
      // Store Excel as base64
      const arrayBuffer = e.target?.result as ArrayBuffer
      const bytes = new Uint8Array(arrayBuffer)
      let binary = ''
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]!)
      }
      modalContent.value = btoa(binary)
      modalType.value = 'excel'
    } else {
      modalContent.value = e.target?.result as string
      // Auto-detect type from extension
      if (file.name.endsWith('.csv')) {
        modalType.value = 'csv'
      } else {
        modalType.value = 'json'
      }
    }
    // Suggest name from filename
    if (!modalName.value) {
      modalName.value = file.name.replace(/\.(json|csv|xlsx?)$/i, '')
        .replace(/[^a-zA-Z0-9_$]/g, '_')
        .replace(/^(\d)/, '_$1')
    }
  }

  if (isExcel) {
    reader.readAsArrayBuffer(file)
  } else {
    reader.readAsText(file)
  }
  // Reset input for re-upload
  input.value = ''
}

const handleSave = () => {
  if (!modalName.value.trim()) {
    modalError.value = 'Name is required'
    return
  }
  if (!modalContent.value.trim()) {
    modalError.value = 'Content is required'
    return
  }

  if (isEditing.value && editingSource.value) {
    emit('update', editingSource.value.id, {
      name: modalName.value,
      type: modalType.value,
      content: modalContent.value
    })
  } else {
    emit('add', modalName.value, modalType.value, modalContent.value)
  }
  closeModal()
}

const handleDelete = (id: string) => {
  if (confirm('Are you sure you want to delete this data source?')) {
    emit('delete', id)
  }
}
</script>

<template>
  <div class="file-manager">
    <div class="manager-header">
      <span class="manager-title">Data Sources</span>
      <button class="add-btn" @click="openAddModal" title="Add data source">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <div class="file-list">
      <FileItem
        v-for="source in dataSources"
        :key="source.id"
        :source="source"
        @edit="openEditModal"
        @delete="handleDelete"
      />

      <div v-if="dataSources.length === 0" class="empty-state">
        <p>No data sources yet.</p>
        <button class="load-defaults-btn" @click="emit('loadDefaults')">
          Load example data
        </button>
      </div>
    </div>

    <div v-if="dataSources.length > 0" class="manager-footer">
      <button class="load-defaults-btn small" @click="emit('loadDefaults')">
        Reset to examples
      </button>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Edit' : 'Add' }} Data Source</h3>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label for="source-name">Variable name</label>
              <input
                id="source-name"
                v-model="modalName"
                type="text"
                placeholder="e.g., customers"
                autocomplete="off"
              />
              <small>Use a valid JavaScript identifier</small>
            </div>

            <div class="form-group">
              <label>Type</label>
              <div class="type-toggle">
                <button
                  :class="['type-btn', { active: modalType === 'json' }]"
                  @click="modalType = 'json'"
                >
                  JSON
                </button>
                <button
                  :class="['type-btn', { active: modalType === 'csv' }]"
                  @click="modalType = 'csv'"
                >
                  CSV
                </button>
                <button
                  :class="['type-btn', { active: modalType === 'excel' }]"
                  @click="modalType = 'excel'"
                >
                  Excel
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Content</label>
              <div class="upload-area">
                <input
                  type="file"
                  accept=".json,.csv,.xlsx,.xls"
                  @change="handleFileUpload"
                  id="file-upload"
                />
                <label for="file-upload" class="upload-label">
                  {{ modalType === 'excel' ? 'Upload Excel file (.xlsx, .xls)' : 'Upload file or paste below' }}
                </label>
              </div>
              <textarea
                v-if="modalType !== 'excel'"
                v-model="modalContent"
                :placeholder="modalType === 'json' ? '[\n  { &quot;id&quot;: 1, &quot;name&quot;: &quot;Example&quot; }\n]' : 'id,name\n1,Example'"
                rows="10"
              ></textarea>
              <div v-else class="excel-info">
                <template v-if="modalContent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span>Excel file loaded</span>
                </template>
                <template v-else>
                  <span class="muted">Upload an Excel file above</span>
                </template>
              </div>
            </div>

            <div v-if="modalError" class="form-error">{{ modalError }}</div>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="closeModal">Cancel</button>
            <button class="save-btn" @click="handleSave">
              {{ isEditing ? 'Update' : 'Add' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.file-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--sl-color-bg);
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--sl-color-gray-6);
  border-bottom: 1px solid var(--sl-color-gray-5);
}

.manager-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--sl-color-text);
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: var(--sl-color-accent);
  color: var(--sl-color-accent-high-contrast);
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: opacity 0.15s;
}

.add-btn:hover {
  opacity: 0.9;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 1.5rem;
  color: var(--sl-color-gray-3);
}

.empty-state p {
  margin: 0 0 1rem;
}

.load-defaults-btn {
  padding: 0.5rem 1rem;
  background: var(--sl-color-accent);
  color: var(--sl-color-accent-high-contrast);
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.15s;
}

.load-defaults-btn:hover {
  opacity: 0.9;
}

.load-defaults-btn.small {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  background: var(--sl-color-gray-5);
  color: var(--sl-color-text);
}

.manager-footer {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid var(--sl-color-gray-5);
  text-align: center;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--sl-color-bg);
  border-radius: 0.5rem;
  width: 100%;
  max-width: 32rem;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--sl-color-gray-5);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--sl-color-gray-3);
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: var(--sl-color-text);
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
  color: var(--sl-color-text);
}

.form-group small {
  display: block;
  font-size: 0.75rem;
  color: var(--sl-color-gray-3);
  margin-top: 0.25rem;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.25rem;
  background: var(--sl-color-bg);
  color: var(--sl-color-text);
  font-size: 0.875rem;
}

.form-group textarea {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  resize: vertical;
}

.type-toggle {
  display: flex;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.25rem;
  overflow: hidden;
  width: fit-content;
}

.type-btn {
  padding: 0.375rem 1rem;
  background: transparent;
  border: none;
  font-size: 0.875rem;
  color: var(--sl-color-gray-2);
  cursor: pointer;
  transition: all 0.15s;
}

.type-btn:hover {
  background: var(--sl-color-gray-5);
}

.type-btn.active {
  background: var(--sl-color-accent);
  color: var(--sl-color-accent-high-contrast);
}

.upload-area {
  margin-bottom: 0.5rem;
}

.upload-area input[type="file"] {
  display: none;
}

.upload-label {
  display: block;
  padding: 0.75rem;
  border: 2px dashed var(--sl-color-gray-5);
  border-radius: 0.25rem;
  text-align: center;
  color: var(--sl-color-gray-3);
  cursor: pointer;
  transition: all 0.15s;
}

.upload-label:hover {
  border-color: var(--sl-color-accent);
  color: var(--sl-color-accent);
}

.form-error {
  padding: 0.5rem;
  background: var(--sl-color-red-low);
  color: var(--sl-color-red);
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.excel-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.25rem;
  color: var(--sl-color-accent);
  font-size: 0.875rem;
}

.excel-info .muted {
  color: var(--sl-color-gray-3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--sl-color-gray-5);
}

.cancel-btn,
.save-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.15s;
}

.cancel-btn {
  background: var(--sl-color-gray-5);
  color: var(--sl-color-text);
}

.save-btn {
  background: var(--sl-color-accent);
  color: var(--sl-color-accent-high-contrast);
}

.cancel-btn:hover,
.save-btn:hover {
  opacity: 0.9;
}
</style>
