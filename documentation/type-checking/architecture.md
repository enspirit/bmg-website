# TypeScript Type Checking Architecture

This document describes the architecture of the TypeScript type checking system for the Bmg.js playground editor.

## Quick Start

```bash
# Run tests
pnpm exec vitest run tests/typecheck.test.ts
```

## Overview

The playground provides real-time TypeScript error highlighting as users type Bmg.js code. Type checking runs in a **Web Worker** to avoid blocking the UI thread.

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CodeEditor.vue                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  - Vue component with CodeMirror editor                               │  │
│  │  - Receives dataSources prop                                          │  │
│  │  - Configures linter extension with 500ms debounce                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│         │                                                                   │
│         │ toRef(props, 'dataSources')                                       │
│         ▼                                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  useTypeScriptLinting(dataSourcesRef)                                 │  │
│  │  └─► returns { createLintSource, isReady }                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│         │                                                                   │
│         │ linter(createLintSource())                                        │
│         ▼                                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  CodeMirror linter extension                                          │  │
│  │  └─► calls lintSource(view) on code changes                           │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ checkCode(code)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    useTypeScriptLinting.ts (Composable)                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  initWorker()                                                         │  │
│  │    └─► new TypeScriptWorker()                                         │  │
│  │                                                                       │  │
│  │  inferTypeFromData(data)                                              │  │
│  │    └─► Converts sample data to TS type string                         │  │
│  │        e.g., [{ sid: 'S1', city: 'Paris' }]                           │  │
│  │            → "{ sid: string; city: string }"                          │  │
│  │                                                                       │  │
│  │  checkCode(code)                                                      │  │
│  │    └─► Builds dataSourceTypes from current dataSources                │  │
│  │    └─► Posts { id, code, dataSourceTypes } to worker                  │  │
│  │    └─► Returns Promise<CmDiagnostic[]>                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
          │                                         ▲
          │ postMessage(CheckRequest)               │ onmessage(CheckResponse)
          ▼                                         │
┌─────────────────────────────────────────────────────────────────────────────┐
│                     typescript.worker.ts (Web Worker)                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  loadTypeScript()                                                     │  │
│  │    └─► importScripts('typescript.min.js') from CDN                    │  │
│  │    └─► fetch('lib.es5.d.ts', 'lib.decorators.d.ts') from CDN          │  │
│  │                                                                       │  │
│  │  onmessage({ id, code, dataSourceTypes })                             │  │
│  │    └─► checkCode(ts, code, dataSourceTypes, options)  ◄── imported    │  │
│  │    └─► postMessage({ id, diagnostics })                               │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          │ imports checkCode()
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         lib/typecheck.ts (Shared Module)                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Used by:                                                             │  │
│  │    - typescript.worker.ts (Web Worker, with CDN-loaded ts)            │  │
│  │    - tests/typecheck.test.ts (Node.js, with npm ts)                   │  │
│  │                                                                       │  │
│  │  Exports:                                                             │  │
│  │    - buildLibContent(dataSourceTypes, options)                        │  │
│  │    - checkCode(tsApi, code, dataSourceTypes, options)                 │  │
│  │    - Diagnostic type                                                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│         │                                                                   │
│         │ imports LIB_DEFINITIONS                                           │
│         ▼                                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  @enspirit/bmg-js (npm package)                                       │  │
│  │    - LIB_DEFINITIONS: string constant with TypeScript declarations    │  │
│  │    - Generated from types.ts at build time                            │  │
│  │    - Relation<T> interface, utility types, Bmg() declaration          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Creates virtual FS & runs compiler
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TypeScript Compiler (in worker)                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Virtual File System:                                                 │  │
│  │    /lib.d.ts     ← lib.es5.d.ts + LIB_DEFINITIONS + dataSourceDecls   │  │
│  │    /input.ts     ← user's code                                        │  │
│  │                                                                       │  │
│  │  ts.createProgram(['/input.ts'], compilerOptions, host)               │  │
│  │    └─► getSyntacticDiagnostics()  (parse errors)                      │  │
│  │    └─► getSemanticDiagnostics()   (type errors)                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File Responsibilities

| File | Location | Purpose |
|------|----------|---------|
| `CodeEditor.vue` | `src/components/try/` | Vue component integrating CodeMirror with linting |
| `useTypeScriptLinting.ts` | `src/components/try/composables/` | Vue composable managing worker lifecycle and type inference |
| `typescript.worker.ts` | `src/components/try/workers/` | Web Worker running TypeScript compiler |
| `typecheck.ts` | `src/components/try/lib/` | Shared type-checking logic (used by worker + tests) |
| `typecheck.test.ts` | `tests/` | Vitest tests for type checking behavior |
| `lib-definitions.ts` | `implementations/bmg.js/src/` | Auto-generated LIB_DEFINITIONS export (from types.ts) |

## Data Flow Summary

```
User types code
       │
       ▼
CodeEditor.vue (CodeMirror with linter, 500ms debounce)
       │
       ▼
useTypeScriptLinting.checkCode()
       │
       ├─► Infers types from dataSources (e.g., suppliers → "{ sid: string; ... }")
       │
       ▼
Worker.postMessage({ id, code, dataSourceTypes })
       │
       ▼
typescript.worker.ts
       │
       ├─► Loads TypeScript + lib.es5.d.ts from CDN (once)
       ├─► Calls shared checkCode(ts, code, dataSourceTypes, options)
       │     └─► Builds virtual /lib.d.ts with Bmg types + data source declarations
       │     └─► Runs TypeScript compiler
       │
       ▼
Worker.postMessage({ id, diagnostics })
       │
       ▼
useTypeScriptLinting resolves Promise
       │
       ▼
CodeMirror displays errors (red squiggles, gutter markers, tooltips)
```

## Key Design Decisions

1. **Web Worker**: TypeScript compilation runs off the main thread to keep the UI responsive
2. **CDN Loading**: TypeScript and lib files are loaded from jsDelivr CDN to reduce bundle size
3. **Shared Logic**: `typecheck.ts` is shared between the worker and Node.js tests via dependency injection (`tsApi` parameter)
4. **Library-Owned Types**: `LIB_DEFINITIONS` is exported from `@enspirit/bmg-js`, auto-generated from `types.ts` to stay in sync with the library
5. **Type Inference**: Data source types are inferred from actual data samples at runtime
6. **Virtual File System**: The TypeScript compiler uses an in-memory file system with two files:
   - `/lib.d.ts`: Combined type definitions
   - `/input.ts`: User's code
7. **Debouncing**: Linting is debounced to 500ms to avoid excessive compilations while typing
