import { Bmg } from '@enspirit/bmg-js'
import type { DataSource } from './useDataSources'
import { transformCodeForReturn } from '../lib/code-transform'

export interface ExecutionResult {
  success: boolean
  data?: unknown[]
  error?: string
  executionTime?: number
}

export function useExecution() {
  const execute = (code: string, dataSources: DataSource[]): ExecutionResult => {
    const startTime = performance.now()

    try {
      // Build scope object with data sources as Bmg relations
      const scope: Record<string, unknown> = { Bmg }

      for (const source of dataSources) {
        if (source.data) {
          scope[source.name] = Bmg(source.data)
        }
      }

      // Create function with explicit parameters
      const paramNames = Object.keys(scope)
      const paramValues = Object.values(scope)

      // Transform code to return the last expression
      const transformedCode = transformCodeForReturn(code)

      // Wrap in strict mode
      const wrappedCode = `"use strict";\n${transformedCode}`

      // Use Function constructor (safer than eval, no closure access)
      const fn = new Function(...paramNames, wrappedCode)
      const result = fn(...paramValues)

      // Handle Relation objects - call toArray()
      let output: unknown[]
      if (result && typeof result === 'object' && 'toArray' in result && typeof result.toArray === 'function') {
        output = result.toArray()
      } else if (Array.isArray(result)) {
        output = result
      } else if (result === undefined || result === null) {
        output = []
      } else {
        output = [result]
      }

      return {
        success: true,
        data: output,
        executionTime: performance.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: performance.now() - startTime
      }
    }
  }

  return { execute }
}
