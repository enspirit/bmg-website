import type { DataSourceType } from './useDataSources'

const STORAGE_KEY = 'bmg-playground'

export interface StoredState {
  version: 1
  dataSources: Array<{
    id: string
    name: string
    type: DataSourceType
    content: string
  }>
  code: string
  outputFormat: 'json' | 'csv'
}

export function useStorage() {
  const load = (): StoredState | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const state = JSON.parse(raw)
      if (state.version !== 1) return null
      return state
    } catch {
      return null
    }
  }

  const save = (state: StoredState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY)
  }

  return { load, save, clear }
}
