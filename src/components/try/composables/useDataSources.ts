import { ref } from 'vue'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export type DataSourceType = 'json' | 'csv' | 'excel'

export interface DataSource {
  id: string
  name: string
  type: DataSourceType
  content: string
  data: unknown[] | null
  error: string | undefined
}

// Default data
import suppliersData from '../../../data/suppliers-and-parts/suppliers.json'
import partsData from '../../../data/suppliers-and-parts/parts.json'
import suppliesData from '../../../data/suppliers-and-parts/supplies.json'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function parseContent(content: string, type: DataSourceType): { data: unknown[] | null; error: string | undefined } {
  try {
    if (type === 'json') {
      const parsed = JSON.parse(content)
      if (!Array.isArray(parsed)) {
        return { data: null, error: 'JSON must be an array of objects' }
      }
      return { data: parsed, error: undefined }
    } else if (type === 'csv') {
      const result = Papa.parse(content, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      })
      if (result.errors.length > 0 && result.errors[0]) {
        return { data: null, error: result.errors[0].message }
      }
      return { data: result.data as unknown[], error: undefined }
    } else if (type === 'excel') {
      // Excel content is stored as base64
      const binaryStr = atob(content)
      const workbook = XLSX.read(binaryStr, { type: 'binary' })
      // Get first sheet
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        return { data: null, error: 'Excel file has no sheets' }
      }
      const sheet = workbook.Sheets[sheetName]
      if (!sheet) {
        return { data: null, error: 'Could not read sheet from Excel file' }
      }
      // Convert to JSON with header row
      const data = XLSX.utils.sheet_to_json(sheet) as unknown[]
      return { data, error: undefined }
    } else {
      return { data: null, error: `Unknown type: ${type}` }
    }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Parse error' }
  }
}

function isValidVariableName(name: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)
}

export function useDataSources() {
  const dataSources = ref<DataSource[]>([])

  const createDataSource = (name: string, type: DataSourceType, content: string): DataSource => {
    const { data, error } = parseContent(content, type)
    return {
      id: generateId(),
      name,
      type,
      content,
      data,
      error
    }
  }

  const loadDefaults = () => {
    dataSources.value = [
      {
        id: generateId(),
        name: 'suppliers',
        type: 'json',
        content: JSON.stringify(suppliersData, null, 2),
        data: suppliersData as unknown[],
        error: undefined
      },
      {
        id: generateId(),
        name: 'parts',
        type: 'json',
        content: JSON.stringify(partsData, null, 2),
        data: partsData as unknown[],
        error: undefined
      },
      {
        id: generateId(),
        name: 'supplies',
        type: 'json',
        content: JSON.stringify(suppliesData, null, 2),
        data: suppliesData as unknown[],
        error: undefined
      }
    ]
  }

  const addDataSource = (name: string, type: DataSourceType, content: string): string | null => {
    if (!isValidVariableName(name)) {
      return 'Invalid variable name. Use letters, numbers, _ or $ (cannot start with number).'
    }
    if (dataSources.value.some(ds => ds.name === name)) {
      return `A data source named "${name}" already exists.`
    }
    const source = createDataSource(name, type, content)
    dataSources.value.push(source)
    return source.error ?? null
  }

  const updateDataSource = (id: string, updates: Partial<Pick<DataSource, 'name' | 'type' | 'content'>>): string | null => {
    const index = dataSources.value.findIndex(ds => ds.id === id)
    if (index === -1) return 'Data source not found'

    const current = dataSources.value[index]!
    const newName = updates.name ?? current.name
    const newType = updates.type ?? current.type
    const newContent = updates.content ?? current.content

    if (newName !== current.name) {
      if (!isValidVariableName(newName)) {
        return 'Invalid variable name'
      }
      if (dataSources.value.some(ds => ds.id !== id && ds.name === newName)) {
        return `A data source named "${newName}" already exists.`
      }
    }

    const { data, error } = parseContent(newContent, newType)
    dataSources.value[index] = {
      id: current.id,
      name: newName,
      type: newType,
      content: newContent,
      data,
      error
    }
    return error ?? null
  }

  const removeDataSource = (id: string) => {
    const index = dataSources.value.findIndex(ds => ds.id === id)
    if (index !== -1) {
      dataSources.value.splice(index, 1)
    }
  }

  const setDataSources = (sources: DataSource[]) => {
    dataSources.value = sources
  }

  const reparse = () => {
    dataSources.value = dataSources.value.map(ds => {
      const { data, error } = parseContent(ds.content, ds.type)
      return {
        id: ds.id,
        name: ds.name,
        type: ds.type,
        content: ds.content,
        data,
        error
      }
    })
  }

  return {
    dataSources,
    loadDefaults,
    addDataSource,
    updateDataSource,
    removeDataSource,
    setDataSources,
    reparse,
    isValidVariableName
  }
}
