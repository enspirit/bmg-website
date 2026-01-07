import { describe, it, expect } from 'vitest'
import { useExecution, transformCodeForReturn } from '../src/components/try/composables/useExecution'
import type { DataSource } from '../src/components/try/composables/useDataSources'

describe('transformCodeForReturn', () => {
  it('returns undefined for empty code', () => {
    expect(transformCodeForReturn('')).toBe('return undefined;')
    expect(transformCodeForReturn('   ')).toBe('return undefined;')
  })

  it('preserves explicit return statements', () => {
    const code = 'return suppliers.restrict({ city: "Paris" })'
    expect(transformCodeForReturn(code)).toBe(code)
  })

  it('preserves return in multiline code', () => {
    const code = `const x = 1
return x + 2`
    expect(transformCodeForReturn(code)).toBe(code)
  })

  it('adds return to simple expression', () => {
    const code = 'suppliers.restrict({ city: "Paris" })'
    expect(transformCodeForReturn(code)).toBe('return suppliers.restrict({ city: "Paris" });')
  })

  it('adds return to expression with semicolon', () => {
    const code = 'suppliers.restrict({ city: "Paris" });'
    expect(transformCodeForReturn(code)).toBe('return suppliers.restrict({ city: "Paris" });')
  })

  it('adds return to last line of multiline code with semicolons', () => {
    const code = `const filtered = suppliers.restrict({ city: "Paris" });
filtered.project(['sid', 'name'])`
    const result = transformCodeForReturn(code)
    expect(result).toContain("return filtered.project(['sid', 'name']);")
  })

  it('handles variable declaration on last line', () => {
    const code = 'const result = suppliers.toArray()'
    const result = transformCodeForReturn(code)
    expect(result).toContain('return result;')
  })

  it('handles chained method calls', () => {
    const code = `suppliers
  .restrict({ city: 'Paris' })
  .project(['sid', 'name'])`
    const result = transformCodeForReturn(code)
    // Should wrap the entire multiline expression with return
    expect(result).toContain('return suppliers')
    expect(result).toContain('.project')
  })

  // Tests for code with comments
  it('handles code starting with single-line comments', () => {
    const code = `// Filter suppliers from Paris
suppliers.restrict({ city: 'Paris' })`
    const result = transformCodeForReturn(code)
    // The return should be placed AFTER the comment, not before
    expect(result).not.toMatch(/^return\s*\/\//)
    expect(result).toContain('return suppliers')
  })

  it('handles code with multiple comment lines before expression', () => {
    const code = `// Filter & Project
// Find all suppliers located in Paris,
// then keep only the supplier ID and name columns.

suppliers
  .restrict({ city: 'Paris' })
  .project(['sid', 'name'])`
    const result = transformCodeForReturn(code)
    expect(result).not.toMatch(/^return\s*\/\//)
    expect(result).toContain('return suppliers')
  })

  it('handles inline comments in code', () => {
    const code = `suppliers
  .restrict({ city: 'Paris' }) // filter by city
  .project(['sid', 'name'])`
    const result = transformCodeForReturn(code)
    expect(result).toContain('return suppliers')
  })

  it('handles block comments before expression', () => {
    const code = `/* This is a block comment */
suppliers.restrict({ city: 'Paris' })`
    const result = transformCodeForReturn(code)
    expect(result).toContain('return suppliers')
  })

  it('handles comments between statements', () => {
    const code = `const x = suppliers.restrict({ city: 'Paris' });
// Now project the result
x.project(['sid', 'name'])`
    const result = transformCodeForReturn(code)
    expect(result).toContain("return x.project")
  })
})

describe('useExecution', () => {
  const { execute } = useExecution()

  const createDataSource = (name: string, data: unknown[]): DataSource => ({
    id: '1',
    name,
    type: 'json',
    content: JSON.stringify(data),
    data,
    error: undefined
  })

  const suppliers = [
    { sid: 'S1', name: 'Smith', status: 20, city: 'London' },
    { sid: 'S2', name: 'Jones', status: 10, city: 'Paris' },
    { sid: 'S3', name: 'Blake', status: 30, city: 'Paris' },
  ]

  it('executes simple expression and returns result', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const result = execute('suppliers', dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(3)
    expect(result.data).toEqual(suppliers)
  })

  it('executes restrict operation', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const result = execute("suppliers.restrict({ city: 'Paris' })", dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.data).toEqual([
      { sid: 'S2', name: 'Jones', status: 10, city: 'Paris' },
      { sid: 'S3', name: 'Blake', status: 30, city: 'Paris' },
    ])
  })

  it('executes project operation', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const result = execute("suppliers.project(['sid', 'name'])", dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(3)
    expect(result.data![0]).toEqual({ sid: 'S1', name: 'Smith' })
  })

  it('executes chained operations', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const code = `suppliers
      .restrict({ city: 'Paris' })
      .project(['sid', 'name'])`
    const result = execute(code, dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.data).toEqual([
      { sid: 'S2', name: 'Jones' },
      { sid: 'S3', name: 'Blake' },
    ])
  })

  it('executes code with explicit return', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const code = `return suppliers.restrict({ city: 'Paris' })`
    const result = execute(code, dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
  })

  it('executes multiline code with variable assignment', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    // Use semicolons to separate statements properly
    const code = `const filtered = suppliers.restrict({ city: 'Paris' });
const projected = filtered.project(['sid', 'name']);
projected`
    const result = execute(code, dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.data).toEqual([
      { sid: 'S2', name: 'Jones' },
      { sid: 'S3', name: 'Blake' },
    ])
  })

  it('handles multiple data sources', () => {
    const parts = [
      { pid: 'P1', pname: 'Nut', city: 'London' },
      { pid: 'P2', pname: 'Bolt', city: 'Paris' },
    ]
    const dataSources = [
      createDataSource('suppliers', suppliers),
      createDataSource('parts', parts),
    ]
    const code = `suppliers.restrict({ city: 'Paris' })`
    const result = execute(code, dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
  })

  it('handles join operations', () => {
    const supplies = [
      { sid: 'S1', pid: 'P1', qty: 300 },
      { sid: 'S2', pid: 'P1', qty: 200 },
    ]
    const dataSources = [
      createDataSource('suppliers', suppliers),
      createDataSource('supplies', supplies),
    ]
    const code = `suppliers
      .restrict({ city: 'Paris' })
      .join(supplies, ['sid'])`
    const result = execute(code, dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(1)
    expect(result.data![0]).toMatchObject({ sid: 'S2', name: 'Jones', qty: 200 })
  })

  it('returns error for invalid code', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const result = execute('invalid syntax {{{', dataSources)

    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('returns error for undefined variable', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const result = execute('nonexistent.restrict({})', dataSources)

    expect(result.success).toBe(false)
    expect(result.error).toContain('nonexistent')
  })

  it('returns empty array for null result', () => {
    const dataSources: DataSource[] = []
    const result = execute('null', dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
  })

  it('wraps primitive results in array', () => {
    const dataSources: DataSource[] = []
    const result = execute('42', dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toEqual([42])
  })

  it('includes execution time', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const result = execute('suppliers', dataSources)

    expect(result.executionTime).toBeDefined()
    expect(result.executionTime).toBeGreaterThanOrEqual(0)
  })

  // Tests for code with comments (execution-level)
  it('executes code with leading comments', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const code = `// Filter suppliers from Paris
suppliers.restrict({ city: 'Paris' })`
    const result = execute(code, dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
  })

  it('executes code with multiple comment lines (example-style)', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const code = `// Filter & Project
// Find all suppliers located in Paris,
// then keep only the supplier ID and name columns.

suppliers
  .restrict({ city: 'Paris' })
  .project(['sid', 'name'])`
    const result = execute(code, dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.data).toEqual([
      { sid: 'S2', name: 'Jones' },
      { sid: 'S3', name: 'Blake' },
    ])
  })

  it('executes code with inline comments', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const code = `suppliers
  .restrict({ city: 'Paris' }) // filter by city
  .project(['sid', 'name']) // keep only these columns`
    const result = execute(code, dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
  })

  it('executes code with block comments', () => {
    const dataSources = [createDataSource('suppliers', suppliers)]
    const code = `/* Filter suppliers from Paris */
suppliers.restrict({ city: 'Paris' })`
    const result = execute(code, dataSources)

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
  })
})
