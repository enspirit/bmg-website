// TypeScript type checking logic for Bmg.js playground
// This module can be used in both Node.js (tests) and web workers

import type ts from 'typescript'
import { LIB_DEFINITIONS } from '@enspirit/bmg-js'

export interface Diagnostic {
  from: number
  to: number
  severity: 'error' | 'warning' | 'info'
  message: string
}

export interface TypeCheckResult {
  diagnostics: Diagnostic[]
  libDiagnostics: string[]
}

export interface CheckRequest {
  id: number
  code: string
  dataSourceTypes: Record<string, string>
}

export interface CheckResponse {
  id: number
  diagnostics: Diagnostic[]
}

export interface TypeCheckOptions {
  /** Content of lib.es5.d.ts for proper type checking. Required for full type safety. */
  libEs5Content?: string
}

// Infer TypeScript type string from sample data
export function inferTypeFromData(data: unknown[] | null): string {
  if (!data || data.length === 0) {
    return 'Record<string, unknown>'
  }

  const sample = data[0]
  if (typeof sample !== 'object' || sample === null) {
    return 'Record<string, unknown>'
  }

  const properties: string[] = []
  for (const [key, value] of Object.entries(sample)) {
    let type = 'unknown'
    if (typeof value === 'string') type = 'string'
    else if (typeof value === 'number') type = 'number'
    else if (typeof value === 'boolean') type = 'boolean'
    else if (value === null) type = 'null'
    else if (Array.isArray(value)) type = 'unknown[]'
    else if (typeof value === 'object') type = 'Record<string, unknown>'

    properties.push(`${key}: ${type}`)
  }

  return `{ ${properties.join('; ')} }`
}

// Build the full lib.d.ts content with data source declarations
export function buildLibContent(dataSourceTypes: Record<string, string>, options?: TypeCheckOptions): string {
  const dataSourceDeclarations = Object.entries(dataSourceTypes)
    .map(([name, type]) => `declare const ${name}: Relation<${type}>`)
    .join('\n')

  // Include lib.es5.d.ts if provided (needed for proper generic constraint checking)
  const libPrefix = options?.libEs5Content ? options.libEs5Content + '\n' : ''

  return libPrefix + LIB_DEFINITIONS + '\n' + dataSourceDeclarations
}

// Create a virtual file system for TypeScript
function createCompilerHost(
  tsApi: typeof ts,
  files: Record<string, string>
): ts.CompilerHost {
  return {
    getSourceFile(fileName: string, languageVersion: ts.ScriptTarget) {
      const content = files[fileName]
      if (content !== undefined) {
        return tsApi.createSourceFile(fileName, content, languageVersion, true)
      }
      return undefined
    },
    getDefaultLibFileName: () => '/lib.d.ts',
    writeFile: () => {},
    getCurrentDirectory: () => '/',
    getCanonicalFileName: (fileName: string) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists: (fileName: string) => fileName in files,
    readFile: (fileName: string) => files[fileName],
    directoryExists: () => true,
    getDirectories: () => []
  }
}

// Check TypeScript code and return diagnostics
export function checkCode(
  tsApi: typeof ts,
  code: string,
  dataSourceTypes: Record<string, string>,
  options?: TypeCheckOptions
): TypeCheckResult {
  const files: Record<string, string> = {
    '/lib.d.ts': buildLibContent(dataSourceTypes, options),
    '/input.ts': code
  }

  const compilerOptions: ts.CompilerOptions = {
    target: tsApi.ScriptTarget.ESNext,
    module: tsApi.ModuleKind.ESNext,
    strict: true,
    noEmit: true,
    skipLibCheck: false, // We want to check our lib definitions too
    allowJs: true,
    checkJs: false
  }

  const host = createCompilerHost(tsApi, files)
  const program = tsApi.createProgram(['/input.ts'], compilerOptions, host)
  const sourceFile = program.getSourceFile('/input.ts')

  if (!sourceFile) {
    return { diagnostics: [], libDiagnostics: [] }
  }

  // Check for errors in lib.d.ts (our type definitions)
  const libFile = program.getSourceFile('/lib.d.ts')
  const libDiagnostics = libFile
    ? program.getSemanticDiagnostics(libFile).map(d =>
        tsApi.flattenDiagnosticMessageText(d.messageText, '\n')
      )
    : []

  // Get diagnostics for the input code
  const semanticDiagnostics = program.getSemanticDiagnostics(sourceFile)
  const syntacticDiagnostics = program.getSyntacticDiagnostics(sourceFile)
  const allDiagnostics = [...syntacticDiagnostics, ...semanticDiagnostics]

  const diagnostics: Diagnostic[] = []
  for (const diag of allDiagnostics) {
    if (diag.file && diag.start !== undefined && diag.length !== undefined) {
      const severity = diag.category === tsApi.DiagnosticCategory.Error ? 'error'
        : diag.category === tsApi.DiagnosticCategory.Warning ? 'warning'
        : 'info'

      diagnostics.push({
        from: diag.start,
        to: diag.start + diag.length,
        severity,
        message: tsApi.flattenDiagnosticMessageText(diag.messageText, '\n')
      })
    }
  }

  return { diagnostics, libDiagnostics }
}
