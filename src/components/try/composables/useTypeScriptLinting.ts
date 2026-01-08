import { ref, onUnmounted, type Ref } from 'vue'
import type { Diagnostic as CmDiagnostic } from '@codemirror/lint'
import type { DataSource } from './useDataSources'
import TypeScriptWorker from '../workers/typescript.worker?worker'
import { inferTypeFromData, type CheckRequest, type CheckResponse } from '../lib/typecheck'

export function useTypeScriptLinting(dataSources: Ref<DataSource[]>) {
  const worker = ref<Worker | null>(null)
  const isReady = ref(false)
  const pendingChecks = new Map<number, (diagnostics: CmDiagnostic[]) => void>()
  let requestId = 0

  // Initialize worker
  const initWorker = () => {
    if (worker.value) return

    try {
      // Create worker using Vite's worker import
      worker.value = new TypeScriptWorker()

      worker.value.onmessage = (event: MessageEvent<CheckResponse | { ready: boolean }>) => {
        if ('ready' in event.data) {
          isReady.value = true
          return
        }

        const { id, diagnostics } = event.data as CheckResponse
        const resolve = pendingChecks.get(id)
        if (resolve) {
          pendingChecks.delete(id)
          resolve(diagnostics.map(d => ({
            from: d.from,
            to: d.to,
            severity: d.severity,
            message: d.message
          })))
        }
      }

      worker.value.onerror = (error) => {
        console.error('TypeScript worker error:', error)
        isReady.value = false
      }
    } catch (error) {
      console.error('Failed to create TypeScript worker:', error)
    }
  }

  // Check code and return diagnostics
  const checkCode = (code: string): Promise<CmDiagnostic[]> => {
    return new Promise((resolve) => {
      if (!worker.value || !isReady.value) {
        resolve([])
        return
      }

      const id = ++requestId

      // Build type map from current data sources
      const dataSourceTypes: Record<string, string> = {}
      for (const source of dataSources.value) {
        dataSourceTypes[source.name] = inferTypeFromData(source.data)
      }

      const request: CheckRequest = { id, code, dataSourceTypes }

      // Set timeout to avoid waiting forever
      const timeout = setTimeout(() => {
        pendingChecks.delete(id)
        resolve([])
      }, 5000)

      pendingChecks.set(id, (diagnostics) => {
        clearTimeout(timeout)
        resolve(diagnostics)
      })

      worker.value.postMessage(request)
    })
  }

  // Create a CodeMirror lint source
  const createLintSource = () => {
    return async (view: { state: { doc: { toString: () => string } } }): Promise<CmDiagnostic[]> => {
      const code = view.state.doc.toString()
      if (!code.trim()) return []
      return checkCode(code)
    }
  }

  // Cleanup
  onUnmounted(() => {
    if (worker.value) {
      worker.value.terminate()
      worker.value = null
    }
    pendingChecks.clear()
  })

  // Initialize on first use
  initWorker()

  return {
    isReady,
    checkCode,
    createLintSource
  }
}
