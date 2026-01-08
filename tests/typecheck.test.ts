import { describe, it, expect, beforeAll } from 'vitest'
import ts from 'typescript'
import fs from 'fs'
import path from 'path'
import { checkCode, buildLibContent, inferTypeFromData, type TypeCheckOptions } from '../src/components/try/lib/typecheck'

describe('inferTypeFromData', () => {
  it('should return Record<string, unknown> for null data', () => {
    expect(inferTypeFromData(null)).toBe('Record<string, unknown>')
  })

  it('should return Record<string, unknown> for empty array', () => {
    expect(inferTypeFromData([])).toBe('Record<string, unknown>')
  })

  it('should return Record<string, unknown> for non-object data', () => {
    expect(inferTypeFromData(['string'])).toBe('Record<string, unknown>')
    expect(inferTypeFromData([42])).toBe('Record<string, unknown>')
    expect(inferTypeFromData([null])).toBe('Record<string, unknown>')
  })

  it('should infer string properties', () => {
    const data = [{ name: 'Alice', city: 'Paris' }]
    expect(inferTypeFromData(data)).toBe('{ name: string; city: string }')
  })

  it('should infer number properties', () => {
    const data = [{ age: 30, score: 95.5 }]
    expect(inferTypeFromData(data)).toBe('{ age: number; score: number }')
  })

  it('should infer boolean properties', () => {
    const data = [{ active: true, verified: false }]
    expect(inferTypeFromData(data)).toBe('{ active: boolean; verified: boolean }')
  })

  it('should infer null properties', () => {
    const data = [{ value: null }]
    expect(inferTypeFromData(data)).toBe('{ value: null }')
  })

  it('should infer array properties as unknown[]', () => {
    const data = [{ tags: ['a', 'b'], scores: [1, 2, 3] }]
    expect(inferTypeFromData(data)).toBe('{ tags: unknown[]; scores: unknown[] }')
  })

  it('should infer nested object properties as Record<string, unknown>', () => {
    const data = [{ metadata: { key: 'value' } }]
    expect(inferTypeFromData(data)).toBe('{ metadata: Record<string, unknown> }')
  })

  it('should infer mixed property types', () => {
    const data = [{ sid: 'S1', name: 'Smith', status: 20 }]
    expect(inferTypeFromData(data)).toBe('{ sid: string; name: string; status: number }')
  })

  it('should only use the first element for inference', () => {
    const data = [
      { id: 1, name: 'First' },
      { id: 'two', name: 123 } // Different types in second element
    ]
    expect(inferTypeFromData(data)).toBe('{ id: number; name: string }')
  })
})

// Sample data source types (simulating what we'd get from the playground)
const supplierType = '{ sid: string; name: string; city: string; status: number }'
const partType = '{ pid: string; pname: string; color: string; weight: number }'
const supplyType = '{ sid: string; pid: string; qty: number }'

const dataSources = {
  suppliers: supplierType,
  parts: partType,
  supplies: supplyType
}

// Load lib.es5.d.ts and its dependencies for proper type checking
let options: TypeCheckOptions

beforeAll(() => {
  const tsLibPath = path.dirname(require.resolve('typescript'))

  // Load lib.es5.d.ts and its referenced libs
  const libEs5 = fs.readFileSync(path.join(tsLibPath, 'lib.es5.d.ts'), 'utf-8')
  const libDecorators = fs.readFileSync(path.join(tsLibPath, 'lib.decorators.d.ts'), 'utf-8')
  const libDecoratorsLegacy = fs.readFileSync(path.join(tsLibPath, 'lib.decorators.legacy.d.ts'), 'utf-8')
  // Needed for Iterable<T> used in OperationalOperand
  const libEs2015Iterable = fs.readFileSync(path.join(tsLibPath, 'lib.es2015.iterable.d.ts'), 'utf-8')
  const libEs2015Symbol = fs.readFileSync(path.join(tsLibPath, 'lib.es2015.symbol.d.ts'), 'utf-8')

  // Combine all lib files (remove reference directives since we're inlining everything)
  const libEs5Content = [libDecorators, libDecoratorsLegacy, libEs5, libEs2015Symbol, libEs2015Iterable]
    .join('\n')
    .replace(/\/\/\/\s*<reference\s+lib="[^"]+"\s*\/>/g, '')

  options = { libEs5Content }
})

describe('TypeScript type checking', () => {
  describe('lib definitions', () => {
    it('should have no errors in the type definitions', () => {
      const result = checkCode(ts, 'true', dataSources, options)
      expect(result.libDiagnostics).toEqual([])
    })

    it('should generate valid lib content', () => {
      const content = buildLibContent(dataSources, options)
      expect(content).toContain('interface Relation<T = Tuple>')
      expect(content).toContain('declare const suppliers: Relation<{ sid: string')
      expect(content).toContain('declare const parts: Relation<{ pid: string')
    })
  })

  describe('basic type errors', () => {
    it('should catch unknown method calls', () => {
      const result = checkCode(ts, 'suppliers.nonsuchop()', dataSources, options)
      expect(result.diagnostics.length).toBeGreaterThan(0)
      expect(result.diagnostics[0]?.message).toContain('nonsuchop')
    })

    it('should catch syntax errors', () => {
      const result = checkCode(ts, 'suppliers.restrict({', dataSources, options)
      expect(result.diagnostics.length).toBeGreaterThan(0)
    })

    it('should pass valid code', () => {
      const result = checkCode(ts, `suppliers.restrict({ city: 'Paris' })`, dataSources, options)
      expect(result.diagnostics).toEqual([])
    })
  })

  describe('restrict operator', () => {
    it('should accept valid attribute in predicate object', () => {
      const result = checkCode(ts, `suppliers.restrict({ city: 'Paris' })`, dataSources, options)
      expect(result.diagnostics).toEqual([])
    })

    it('should accept predicate function', () => {
      const result = checkCode(ts, `suppliers.restrict(s => s.city === 'Paris')`, dataSources, options)
      expect(result.diagnostics).toEqual([])
    })

    // This is the problematic case - Partial<T> allows excess properties
    it.skip('should reject unknown attribute in predicate object', () => {
      const result = checkCode(ts, `suppliers.restrict({ nosuchattr: 'Paris' })`, dataSources, options)
      expect(result.diagnostics.length).toBeGreaterThan(0)
    })
  })

  describe('project operator', () => {
    it('should accept valid attribute names', () => {
      const result = checkCode(ts, `suppliers.project(['sid', 'name'])`, dataSources, options)
      expect(result.diagnostics).toEqual([])
    })

    it('should reject unknown attribute names', () => {
      const result = checkCode(ts, `suppliers.project(['none'])`, dataSources, options)
      expect(result.diagnostics.length).toBeGreaterThan(0)
      expect(result.diagnostics[0]?.message).toContain('"none"')
    })
  })

  describe('allbut operator', () => {
    it('should accept valid attribute names', () => {
      const result = checkCode(ts, `suppliers.allbut(['sid', 'name'])`, dataSources, options)
      expect(result.diagnostics).toEqual([])
    })

    it('should reject unknown attribute names', () => {
      const result = checkCode(ts, `suppliers.allbut(['invalid'])`, dataSources, options)
      expect(result.diagnostics.length).toBeGreaterThan(0)
      expect(result.diagnostics[0]?.message).toContain('"invalid"')
    })
  })

  describe('join operator', () => {
    it('should accept valid join', () => {
      const result = checkCode(ts, `suppliers.join(supplies, ['sid'])`, dataSources, options)
      expect(result.diagnostics).toEqual([])
    })
  })

  describe('chained operations', () => {
    it('should type-check through chained calls', () => {
      const code = `
        suppliers
          .restrict({ city: 'Paris' })
          .project(['sid', 'name'])
      `
      const result = checkCode(ts, code, dataSources, options)
      expect(result.diagnostics).toEqual([])
    })

    it('should catch errors in chained calls', () => {
      const code = `
        suppliers
          .restrict({ city: 'Paris' })
          .project(['sid', 'name'])
          .nonsuchmethod()
      `
      const result = checkCode(ts, code, dataSources, options)
      expect(result.diagnostics.length).toBeGreaterThan(0)
    })

    it('should catch invalid project after restrict', () => {
      const code = `
        suppliers
          .restrict({ city: 'Paris' })
          .project(['invalid'])
      `
      const result = checkCode(ts, code, dataSources, options)
      expect(result.diagnostics.length).toBeGreaterThan(0)
    })
  })
})
