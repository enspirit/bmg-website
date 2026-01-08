import { describe, it, expect } from 'vitest'
import { stripLeadingComments, transformCodeForReturn } from '../src/components/try/lib/code-transform'

describe('stripLeadingComments', () => {
  it('returns empty comments for code without leading comments', () => {
    const result = stripLeadingComments('suppliers.restrict({})')
    expect(result.comments).toBe('')
    expect(result.code).toBe('suppliers.restrict({})')
  })

  it('strips single-line comment', () => {
    const result = stripLeadingComments('// comment\ncode')
    expect(result.comments).toBe('// comment\n')
    expect(result.code).toBe('code')
  })

  it('strips multiple single-line comments', () => {
    const result = stripLeadingComments('// line 1\n// line 2\ncode')
    expect(result.comments).toBe('// line 1\n// line 2\n')
    expect(result.code).toBe('code')
  })

  it('strips block comment', () => {
    const result = stripLeadingComments('/* block */code')
    expect(result.comments).toBe('/* block */')
    expect(result.code).toBe('code')
  })

  it('strips multiline block comment', () => {
    const result = stripLeadingComments('/* line 1\nline 2 */\ncode')
    expect(result.comments).toBe('/* line 1\nline 2 */\n')
    expect(result.code).toBe('code')
  })

  it('handles whitespace before comments', () => {
    const result = stripLeadingComments('  // comment\ncode')
    expect(result.comments).toBe('  // comment\n')
    expect(result.code).toBe('code')
  })

  it('handles comment-only code', () => {
    const result = stripLeadingComments('// just a comment')
    expect(result.comments).toBe('// just a comment')
    expect(result.code).toBe('')
  })

  it('handles unclosed block comment', () => {
    const result = stripLeadingComments('/* unclosed')
    expect(result.comments).toBe('/* unclosed')
    expect(result.code).toBe('')
  })

  it('does not strip inline comments', () => {
    const result = stripLeadingComments('code // inline')
    expect(result.comments).toBe('')
    expect(result.code).toBe('code // inline')
  })
})

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
    expect(result).toContain('return suppliers')
    expect(result).toContain('.project')
  })

  it('handles code starting with single-line comments', () => {
    const code = `// Filter suppliers from Paris
suppliers.restrict({ city: 'Paris' })`
    const result = transformCodeForReturn(code)
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
