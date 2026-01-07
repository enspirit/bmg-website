<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'run': []
}>()

const code = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

// Example queries
const examples = [
  {
    name: 'Filter & Project',
    description: 'Find Paris suppliers and show only their IDs and names',
    code: `// Filter & Project
// Find all suppliers located in Paris,
// then keep only the supplier ID and name columns.

suppliers
  .restrict({ city: 'Paris' })
  .project(['sid', 'name'])`
  },
  {
    name: 'Join Relations',
    description: 'Combine suppliers with their shipments',
    code: `// Join Relations
// Connect suppliers to their shipments by matching
// the supplier ID (sid) in both relations.
// This gives us shipment details with supplier info.

suppliers
  .join(supplies, ['sid'])
  .project(['name', 'pid', 'qty'])`
  },
  {
    name: 'Multi-way Join',
    description: 'Full supply chain: suppliers → shipments → parts',
    code: `// Multi-way Join
// Build a complete picture of the supply chain:
// 1. Start with suppliers
// 2. Join their shipments
// 3. Join the parts they supply
// Result: who supplies what part, and how many.

suppliers
  .join(supplies, ['sid'])
  .join(parts, ['pid'])
  .project(['name', 'pname', 'qty'])`
  },
  {
    name: 'Aggregation',
    description: 'Total quantity supplied by each supplier',
    code: `// Aggregation with Summarize
// Group all shipments by supplier ID and calculate
// the total quantity each supplier has shipped.
// Great for finding your most active suppliers.

supplies
  .summarize(['sid'], {
    total_qty: { op: 'sum', attr: 'qty' }
  })
  .join(suppliers.project(['sid', 'name']), ['sid'])
  .project(['name', 'total_qty'])`
  },
  {
    name: 'Set Operations',
    description: 'Find suppliers who supply both red and blue parts',
    code: `// Set Operations - Intersection
// Find suppliers who deliver BOTH red and blue parts.
// 1. Get supplier IDs for red parts
// 2. Get supplier IDs for blue parts
// 3. Intersect to find those in both sets

const redPartSuppliers = supplies
  .join(parts, ['pid'])
  .restrict({ color: 'Red' })
  .project(['sid']);

const bluePartSuppliers = supplies
  .join(parts, ['pid'])
  .restrict({ color: 'Blue' })
  .project(['sid']);

redPartSuppliers
  .intersect(bluePartSuppliers)
  .join(suppliers, ['sid'])
  .project(['sid', 'name'])`
  },
  {
    name: 'Group & Ungroup',
    description: 'Nest supplies per supplier, then flatten back',
    code: `// Group & Ungroup
// Group creates nested relations by grouping attributes.
// Here we group supplies by supplier, creating a nested
// relation of (pid, qty) pairs for each supplier.

const grouped = supplies
  .group(['pid', 'qty'], 'items');

// grouped now has: { sid, items: Relation([{pid, qty}, ...]) }
// Ungroup flattens it back to the original structure.
//
// grouped.ungroup('items')`
  },
  {
    name: 'Wrap & Unwrap',
    description: 'Nest attributes into objects, then flatten back',
    code: `// Wrap & Unwrap
// Wrap combines attributes into a nested object.
// Useful for creating structured JSON output.

const wrapped = suppliers
  .wrap(['city', 'status'], 'details');

// Each tuple now has: { sid, name, details: { city, status } }
// Unwrap flattens nested objects back to top-level attributes.
//
// wrapped.unwrap('details')`
  },
  {
    name: 'Image (Nested Relations)',
    description: 'Attach related supplies to each supplier',
    code: `// Image - Nested Relations
// Unlike join (which duplicates rows), image attaches
// all matching tuples as a nested relation.
// Perfect for hierarchical/JSON output.

// Get each supplier with their supplies nested inside
suppliers
  .image(supplies, 'shipments', ['sid'])
  .project(['sid', 'name', 'shipments'])`
  },
  {
    name: 'Transform Values',
    description: 'Modify attribute values in place',
    code: `// Transform - Modify Values
// Transform applies functions to modify attribute values.
// Unlike extend (which adds new attributes), transform
// modifies existing ones.

suppliers.transform({
  // Uppercase all names
  name: v => v.toUpperCase(),
  // Format status as a label
  status: v => v >= 20 ? 'Senior' : 'Junior'
})`
  }
]

const showExamplesDropdown = ref(false)

const loadExample = (example: typeof examples[0]) => {
  code.value = example.code
  showExamplesDropdown.value = false
  emit('run')
}

const toggleDropdown = () => {
  showExamplesDropdown.value = !showExamplesDropdown.value
}

const closeDropdown = () => {
  showExamplesDropdown.value = false
}

const isDark = ref(false)

const checkTheme = () => {
  isDark.value = document.documentElement.dataset.theme === 'dark'
}

let observer: MutationObserver | null = null

onMounted(() => {
  checkTheme()
  observer = new MutationObserver(checkTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })

  // Close dropdown when clicking outside
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  observer?.disconnect()
  document.removeEventListener('click', closeDropdown)
})

// Create run keybinding
const runKeymap = Prec.highest(keymap.of([
  {
    key: 'Mod-Enter',
    run: () => {
      emit('run')
      return true
    }
  }
]))

const extensions = computed(() => {
  const base = [
    javascript({ typescript: true }),
    EditorView.lineWrapping,
    runKeymap
  ]
  if (isDark.value) {
    base.push(oneDark)
  }
  return base
})

const handleRun = () => {
  emit('run')
}
</script>

<template>
  <div class="code-editor">
    <div class="editor-header">
      <div class="editor-title-area">
        <span class="editor-title">Code Editor</span>
        <div class="examples-dropdown" @click.stop>
          <button class="examples-button" @click="toggleDropdown">
            Examples
            <svg class="dropdown-arrow" :class="{ open: showExamplesDropdown }" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div v-if="showExamplesDropdown" class="examples-menu">
            <button
              v-for="example in examples"
              :key="example.name"
              class="example-item"
              @click="loadExample(example)"
            >
              <span class="example-name">{{ example.name }}</span>
              <span class="example-desc">{{ example.description }}</span>
            </button>
          </div>
        </div>
      </div>
      <div class="editor-actions">
        <span class="shortcut-hint">Ctrl/Cmd + Enter to run</span>
        <button class="run-button" @click="handleRun">
          Run
        </button>
      </div>
    </div>
    <div class="editor-container">
      <Codemirror
        v-model="code"
        :extensions="extensions"
        :style="{ height: '100%' }"
        placeholder="// Write your Bmg.js code here...
// Available variables: suppliers, parts, supplies (or your custom data sources)

// Example:
suppliers
  .restrict({ city: 'Paris' })
  .project(['sid', 'name'])"
      />
    </div>
  </div>
</template>

<style scoped>
.code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.5rem;
  background: var(--sl-color-bg);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--sl-color-gray-6);
  border-bottom: 1px solid var(--sl-color-gray-5);
}

.editor-title-area {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.editor-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--sl-color-text);
}

.examples-dropdown {
  position: relative;
}

.examples-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background: var(--sl-color-gray-5);
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: var(--sl-color-text);
  cursor: pointer;
  transition: background 0.15s;
}

.examples-button:hover {
  background: var(--sl-color-gray-4);
}

.dropdown-arrow {
  transition: transform 0.15s;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.examples-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 1000;
  min-width: 280px;
  background: var(--sl-color-bg);
  border: 1px solid var(--sl-color-gray-5);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.example-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  border-bottom: 1px solid var(--sl-color-gray-5);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.example-item:last-child {
  border-bottom: none;
}

.example-item:hover {
  background: var(--sl-color-gray-6);
}

.example-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--sl-color-text);
}

.example-desc {
  font-size: 0.75rem;
  color: var(--sl-color-gray-3);
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.shortcut-hint {
  font-size: 0.75rem;
  color: var(--sl-color-gray-3);
}

.run-button {
  padding: 0.375rem 1rem;
  background: var(--sl-color-accent);
  color: var(--sl-color-accent-high-contrast);
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.run-button:hover {
  opacity: 0.9;
}

.editor-container {
  flex: 1;
  overflow: auto;
}

.editor-container :deep(.cm-editor) {
  height: 100%;
}

.editor-container :deep(.cm-scroller) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .shortcut-hint {
    display: none;
  }

  .examples-menu {
    min-width: 240px;
  }
}
</style>
