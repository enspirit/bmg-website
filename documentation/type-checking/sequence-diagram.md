# TypeScript Type Checking Sequence Diagram

This document shows the message flow between components during type checking.

## Full Sequence Diagram

```
┌──────────┐     ┌─────────────┐     ┌─────────────────────┐     ┌──────────────────┐     ┌────────────┐
│   User   │     │ CodeEditor  │     │ useTypeScriptLinting│     │ typescript.worker│     │ TypeScript │
│          │     │    .vue     │     │        .ts          │     │       .ts        │     │  Compiler  │
└────┬─────┘     └──────┬──────┘     └──────────┬──────────┘     └────────┬─────────┘     └─────┬──────┘
     │                  │                       │                         │                     │
     │                  │                       │                         │                     │
     │  ════════════════════════════════════════════════════════════════════════════════════   │
     │  ║                         INITIALIZATION                                           ║   │
     │  ════════════════════════════════════════════════════════════════════════════════════   │
     │                  │                       │                         │                     │
     │                  │  useTypeScriptLinting(dataSources)              │                     │
     │                  │──────────────────────>│                         │                     │
     │                  │                       │                         │                     │
     │                  │                       │  new Worker()           │                     │
     │                  │                       │────────────────────────>│                     │
     │                  │                       │                         │                     │
     │                  │                       │  { ready: true }        │                     │
     │                  │                       │<────────────────────────│                     │
     │                  │                       │                         │                     │
     │                  │  { createLintSource,  │                         │                     │
     │                  │    isReady }          │                         │                     │
     │                  │<──────────────────────│                         │                     │
     │                  │                       │                         │                     │
     │                  │  linter(createLintSource(), { delay: 500 })     │                     │
     │                  │─────────┐             │                         │                     │
     │                  │         │ Configure   │                         │                     │
     │                  │<────────┘ CodeMirror  │                         │                     │
     │                  │                       │                         │                     │
     │  ════════════════════════════════════════════════════════════════════════════════════   │
     │  ║                      USER TYPES CODE                                             ║   │
     │  ════════════════════════════════════════════════════════════════════════════════════   │
     │                  │                       │                         │                     │
     │  types code      │                       │                         │                     │
     │─────────────────>│                       │                         │                     │
     │                  │                       │                         │                     │
     │                  │  ┌─────────────────┐  │                         │                     │
     │                  │  │ 500ms debounce  │  │                         │                     │
     │                  │  └────────┬────────┘  │                         │                     │
     │                  │           │           │                         │                     │
     │                  │  lintSource(view)     │                         │                     │
     │                  │──────────────────────>│                         │                     │
     │                  │                       │                         │                     │
     │                  │                       │  ┌───────────────────┐  │                     │
     │                  │                       │  │ inferTypeFromData │  │                     │
     │                  │                       │  │ for each source   │  │                     │
     │                  │                       │  └───────────────────┘  │                     │
     │                  │                       │                         │                     │
     │                  │                       │  postMessage({         │                     │
     │                  │                       │    id: 1,              │                     │
     │                  │                       │    code: "...",        │                     │
     │                  │                       │    dataSourceTypes: {  │                     │
     │                  │                       │      suppliers: "{ sid: string; ... }",      │
     │                  │                       │      parts: "{ pid: string; ... }"           │
     │                  │                       │    }                   │                     │
     │                  │                       │  })                    │                     │
     │                  │                       │────────────────────────>│                     │
     │                  │                       │                         │                     │
     │  ════════════════════════════════════════════════════════════════════════════════════   │
     │  ║                  WORKER: FIRST REQUEST (loads TS)                                ║   │
     │  ════════════════════════════════════════════════════════════════════════════════════   │
     │                  │                       │                         │                     │
     │                  │                       │                         │  loadTypeScript()   │
     │                  │                       │                         │────────┐            │
     │                  │                       │                         │        │            │
     │                  │                       │                         │  ┌─────▼──────────┐ │
     │                  │                       │                         │  │ importScripts( │ │
     │                  │                       │                         │  │  typescript.js │ │
     │                  │                       │                         │  │ ) from CDN     │ │
     │                  │                       │                         │  └────────────────┘ │
     │                  │                       │                         │        │            │
     │                  │                       │                         │  ┌─────▼──────────┐ │
     │                  │                       │                         │  │ fetch(         │ │
     │                  │                       │                         │  │  lib.es5.d.ts, │ │
     │                  │                       │                         │  │  lib.decor...  │ │
     │                  │                       │                         │  │ ) from CDN     │ │
     │                  │                       │                         │  └────────────────┘ │
     │                  │                       │                         │<───────┘            │
     │                  │                       │                         │                     │
     │  ════════════════════════════════════════════════════════════════════════════════════   │
     │  ║                  WORKER: TYPE CHECKING                                           ║   │
     │  ════════════════════════════════════════════════════════════════════════════════════   │
     │                  │                       │                         │                     │
     │                  │                       │                         │  createCompilerHost │
     │                  │                       │                         │────────┐            │
     │                  │                       │                         │        │            │
     │                  │                       │                         │  ┌─────▼──────────┐ │
     │                  │                       │                         │  │ Virtual FS:    │ │
     │                  │                       │                         │  │ /lib.d.ts =    │ │
     │                  │                       │                         │  │   lib.es5 +    │ │
     │                  │                       │                         │  │   bmg-types +  │ │
     │                  │                       │                         │  │   dataSource   │ │
     │                  │                       │                         │  │   declarations │ │
     │                  │                       │                         │  │ /input.ts =    │ │
     │                  │                       │                         │  │   user code    │ │
     │                  │                       │                         │  └────────────────┘ │
     │                  │                       │                         │<───────┘            │
     │                  │                       │                         │                     │
     │                  │                       │                         │  ts.createProgram() │
     │                  │                       │                         │────────────────────>│
     │                  │                       │                         │                     │
     │                  │                       │                         │ getSyntacticDiag()  │
     │                  │                       │                         │────────────────────>│
     │                  │                       │                         │                     │
     │                  │                       │                         │  [parse errors]     │
     │                  │                       │                         │<────────────────────│
     │                  │                       │                         │                     │
     │                  │                       │                         │ getSemanticDiag()   │
     │                  │                       │                         │────────────────────>│
     │                  │                       │                         │                     │
     │                  │                       │                         │  [type errors]      │
     │                  │                       │                         │<────────────────────│
     │                  │                       │                         │                     │
     │                  │                       │  postMessage({         │                     │
     │                  │                       │    id: 1,              │                     │
     │                  │                       │    diagnostics: [      │                     │
     │                  │                       │      { from, to,       │                     │
     │                  │                       │        severity,       │                     │
     │                  │                       │        message }       │                     │
     │                  │                       │    ]                   │                     │
     │                  │                       │  })                    │                     │
     │                  │                       │<────────────────────────│                     │
     │                  │                       │                         │                     │
     │                  │  Promise<Diagnostic[]>│                         │                     │
     │                  │<──────────────────────│                         │                     │
     │                  │                       │                         │                     │
     │  ════════════════════════════════════════════════════════════════════════════════════   │
     │  ║                  DISPLAY ERRORS                                                  ║   │
     │  ════════════════════════════════════════════════════════════════════════════════════   │
     │                  │                       │                         │                     │
     │                  │  ┌─────────────────┐  │                         │                     │
     │                  │  │ CodeMirror      │  │                         │                     │
     │                  │  │ renders:        │  │                         │                     │
     │                  │  │ - red squiggles │  │                         │                     │
     │                  │  │ - gutter markers│  │                         │                     │
     │                  │  │ - hover tooltip │  │                         │                     │
     │                  │  └─────────────────┘  │                         │                     │
     │                  │                       │                         │                     │
     │  sees errors     │                       │                         │                     │
     │<─────────────────│                       │                         │                     │
     │                  │                       │                         │                     │
     ▼                  ▼                       ▼                         ▼                     ▼
```

## Simplified Flow

```
┌──────┐          ┌───────────┐          ┌─────────────┐          ┌────────┐
│ User │          │ CodeEditor│          │  Composable │          │ Worker │
└──┬───┘          └─────┬─────┘          └──────┬──────┘          └───┬────┘
   │                    │                       │                     │
   │  type "suppliers.  │                       │                     │
   │   nonsuch()"       │                       │                     │
   │───────────────────>│                       │                     │
   │                    │                       │                     │
   │                    │  ~~~ 500ms ~~~        │                     │
   │                    │                       │                     │
   │                    │  checkCode(code)      │                     │
   │                    │──────────────────────>│                     │
   │                    │                       │                     │
   │                    │                       │  { code, types }    │
   │                    │                       │────────────────────>│
   │                    │                       │                     │
   │                    │                       │                     │──┐ TypeScript
   │                    │                       │                     │  │ compiles
   │                    │                       │                     │<─┘
   │                    │                       │                     │
   │                    │                       │  { diagnostics }    │
   │                    │                       │<────────────────────│
   │                    │                       │                     │
   │                    │  [{ from: 10,         │                     │
   │                    │     to: 17,           │                     │
   │                    │     message: "Property│                     │
   │                    │       'nonsuch' does  │                     │
   │                    │       not exist..." }]│                     │
   │                    │<──────────────────────│                     │
   │                    │                       │                     │
   │  ~~~~~~~~~~~~~~~   │                       │                     │
   │  ~ red squiggle ~  │                       │                     │
   │  ~ under 'nonsuch' │                       │                     │
   │<───────────────────│                       │                     │
   │                    │                       │                     │
   ▼                    ▼                       ▼                     ▼
```

## Message Types

### CheckRequest (Main Thread → Worker)

```typescript
interface CheckRequest {
  id: number                           // Unique request ID for correlation
  code: string                         // User's code to check
  dataSourceTypes: Record<string, string>  // e.g., { suppliers: "{ sid: string; ... }" }
}
```

### CheckResponse (Worker → Main Thread)

```typescript
interface CheckResponse {
  id: number              // Matches the request ID
  diagnostics: Diagnostic[]
}

interface Diagnostic {
  from: number            // Start position in code
  to: number              // End position in code
  severity: 'error' | 'warning' | 'info'
  message: string         // Error message from TypeScript
}
```

## Timing Characteristics

| Phase | Timing |
|-------|--------|
| Debounce delay | 500ms after last keystroke |
| First request (cold start) | ~1-2s (loads TypeScript from CDN) |
| Subsequent requests | ~50-200ms (TypeScript already loaded) |
| Request timeout | 5000ms (returns empty diagnostics on timeout) |
