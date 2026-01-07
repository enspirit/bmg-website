import { Bmg } from '@enspirit/bmg-js'
import type { DataSource } from './useDataSources'

export interface ExecutionResult {
  success: boolean
  data?: unknown[]
  error?: string
  executionTime?: number
}

/**
 * Strip leading comments from code and return them separately.
 * Handles both single-line (//) and block comments.
 */
function stripLeadingComments(code: string): { comments: string; code: string } {
  let pos = 0
  const len = code.length

  while (pos < len) {
    // Skip whitespace
    while (pos < len && /\s/.test(code.charAt(pos))) {
      pos++
    }

    if (pos >= len) break

    // Check for single-line comment
    if (code[pos] === '/' && code[pos + 1] === '/') {
      // Find end of line
      const endOfLine = code.indexOf('\n', pos)
      if (endOfLine === -1) {
        // Comment goes to end of code
        return { comments: code.trim(), code: '' }
      }
      pos = endOfLine + 1
      continue
    }

    // Check for block comment
    if (code[pos] === '/' && code[pos + 1] === '*') {
      const endOfComment = code.indexOf('*/', pos + 2)
      if (endOfComment === -1) {
        // Unclosed block comment
        return { comments: code.trim(), code: '' }
      }
      pos = endOfComment + 2
      continue
    }

    // Found non-comment code
    break
  }

  const comments = code.slice(0, pos)
  const remaining = code.slice(pos)

  return { comments: comments, code: remaining }
}

/**
 * Transform code to return the last expression.
 * If the code already has a return statement, use it as-is.
 * Otherwise, try to make the last statement return its value.
 */
export function transformCodeForReturn(code: string): string {
  const trimmed = code.trim()

  // If empty, return undefined
  if (!trimmed) {
    return 'return undefined;'
  }

  // If code already has explicit return at the start of a line, use as-is
  if (/^return\s/m.test(trimmed) || /;\s*return\s/m.test(trimmed)) {
    return trimmed
  }

  // Strip leading comments from the code
  const { comments: leadingComments, code: codeWithoutLeadingComments } = stripLeadingComments(trimmed)
  const codeBody = codeWithoutLeadingComments.trim()

  // If only comments, return undefined
  if (!codeBody) {
    return `${leadingComments}\nreturn undefined;`
  }

  // Helper to prepend leading comments if any
  const withComments = (result: string) => {
    if (leadingComments.trim()) {
      return `${leadingComments.trim()}\n${result}`
    }
    return result
  }

  // Find the last statement by looking for the last semicolon or the whole code
  // This handles multiline chained expressions better
  const lastSemicolonIndex = codeBody.lastIndexOf(';')

  // If there's a semicolon, split there
  if (lastSemicolonIndex !== -1) {
    const beforeLast = codeBody.slice(0, lastSemicolonIndex + 1)
    const lastPart = codeBody.slice(lastSemicolonIndex + 1).trim()

    // Strip comments from the last part too
    const { comments: lastPartComments, code: lastPartCode } = stripLeadingComments(lastPart)

    if (lastPartCode.trim()) {
      // There's code after the last semicolon
      const lastPartWithReturn = lastPartComments.trim()
        ? `${lastPartComments.trim()}\nreturn ${lastPartCode.trim()};`
        : `return ${lastPartCode.trim()};`
      return withComments(`${beforeLast}\n${lastPartWithReturn}`)
    } else {
      // Code ends with semicolon (possibly followed by comments) - look for the last complete statement
      // Find the previous semicolon to isolate the last statement
      const beforeSemi = codeBody.slice(0, lastSemicolonIndex).trim()
      const prevSemiIndex = beforeSemi.lastIndexOf(';')

      if (prevSemiIndex !== -1) {
        const prefix = beforeSemi.slice(0, prevSemiIndex + 1)
        const lastStatementRaw = beforeSemi.slice(prevSemiIndex + 1).trim()

        // Strip leading comments from last statement
        const { comments: stmtComments, code: lastStatement } = stripLeadingComments(lastStatementRaw)

        // Check if lastStatement is a declaration
        const varMatch = lastStatement.match(/^(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/)
        if (varMatch) {
          const stmtWithComments = stmtComments.trim()
            ? `${stmtComments.trim()}\n${lastStatement}`
            : lastStatement
          return withComments(`${prefix}\n${stmtWithComments};\nreturn ${varMatch[2]};`)
        }

        // Don't add return to control flow statements
        if (/^(function|class|if|for|while|do|switch|try|throw)\s/.test(lastStatement)) {
          return trimmed
        }

        const returnStmt = stmtComments.trim()
          ? `${stmtComments.trim()}\nreturn ${lastStatement};`
          : `return ${lastStatement};`
        return withComments(`${prefix}\n${returnStmt}`)
      } else {
        // Only one statement with semicolon
        const { comments: stmtComments, code: stmtCode } = stripLeadingComments(beforeSemi)

        const varMatch = stmtCode.match(/^(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/)
        if (varMatch) {
          const stmtWithComments = stmtComments.trim()
            ? `${stmtComments.trim()}\n${stmtCode}`
            : stmtCode
          return withComments(`${stmtWithComments};\nreturn ${varMatch[2]};`)
        }

        if (/^(function|class|if|for|while|do|switch|try|throw)\s/.test(stmtCode)) {
          return trimmed
        }

        const returnStmt = stmtComments.trim()
          ? `${stmtComments.trim()}\nreturn ${stmtCode};`
          : `return ${stmtCode};`
        return withComments(returnStmt)
      }
    }
  }

  // No semicolon - the whole code is one expression (possibly multiline)
  // Check if it starts with a declaration
  const varMatch = codeBody.match(/^(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/)
  if (varMatch) {
    return withComments(`${codeBody}\nreturn ${varMatch[2]};`)
  }

  // Don't add return to control flow statements
  if (/^(function|class|if|for|while|do|switch|try|throw)\s/.test(codeBody)) {
    return trimmed
  }

  // Wrap the entire expression with return
  return withComments(`return ${codeBody};`)
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
