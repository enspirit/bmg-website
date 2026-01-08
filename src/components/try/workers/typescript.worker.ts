/// <reference lib="webworker" />

// TypeScript Web Worker for code checking
// Loads TypeScript dynamically from CDN and uses shared checkCode logic

import { checkCode, type CheckRequest, type CheckResponse } from '../lib/typecheck'

// Minimal TypeScript API interface for the CDN-loaded compiler
interface TypeScriptApi {
  ScriptTarget: { ESNext: number }
  ModuleKind: { ESNext: number }
  DiagnosticCategory: { Error: number; Warning: number }
  createSourceFile(fileName: string, content: string, languageVersion: number, setParentNodes?: boolean): unknown
  createProgram(rootNames: string[], options: unknown, host?: unknown): unknown
  flattenDiagnosticMessageText(messageText: string | { messageText: string }, newLine: string): string
}

declare const ts: TypeScriptApi

let tsLoaded = false
let tsLoadPromise: Promise<void> | null = null
let libEs5Content: string | null = null

const TS_VERSION = '5.3.3'
const TS_CDN_BASE = `https://cdn.jsdelivr.net/npm/typescript@${TS_VERSION}`

// Load TypeScript and lib files from CDN
async function loadTypeScript(): Promise<void> {
  if (tsLoaded) return
  if (tsLoadPromise) return tsLoadPromise

  tsLoadPromise = (async () => {
    // Load TypeScript compiler
    importScripts(`${TS_CDN_BASE}/lib/typescript.min.js`)

    // Fetch lib.es5.d.ts and its dependencies for proper type checking
    const [es5Res, decoratorsRes, decoratorsLegacyRes] = await Promise.all([
      fetch(`${TS_CDN_BASE}/lib/lib.es5.d.ts`),
      fetch(`${TS_CDN_BASE}/lib/lib.decorators.d.ts`),
      fetch(`${TS_CDN_BASE}/lib/lib.decorators.legacy.d.ts`)
    ])

    if (es5Res.ok && decoratorsRes.ok && decoratorsLegacyRes.ok) {
      const [es5, decorators, decoratorsLegacy] = await Promise.all([
        es5Res.text(),
        decoratorsRes.text(),
        decoratorsLegacyRes.text()
      ])

      // Combine all lib files (remove reference directives since we're inlining everything)
      libEs5Content = [decorators, decoratorsLegacy, es5]
        .join('\n')
        .replace(/\/\/\/\s*<reference\s+lib="[^"]+"\s*\/>/g, '')
    }

    tsLoaded = true
  })()

  return tsLoadPromise
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<CheckRequest>) => {
  const { id, code, dataSourceTypes } = event.data

  try {
    // Ensure TypeScript is loaded
    await loadTypeScript()

    // Use shared checkCode function, passing the CDN-loaded TypeScript API
    const result = checkCode(
      ts as never, // Cast to satisfy type checker (CDN ts is compatible at runtime)
      code,
      dataSourceTypes,
      libEs5Content ? { libEs5Content } : undefined
    )

    const response: CheckResponse = { id, diagnostics: result.diagnostics }
    self.postMessage(response)
  } catch (error) {
    // If TypeScript fails to load or check, send empty diagnostics
    console.error('TypeScript worker error:', error)
    const response: CheckResponse = { id, diagnostics: [] }
    self.postMessage(response)
  }
}

// Signal that worker is ready (will load TypeScript on first check request)
self.postMessage({ ready: true })
