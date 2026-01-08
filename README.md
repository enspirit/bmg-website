# Bmg Documentation Website

Documentation website for Bmg, a relational algebra library. Hosted at https://www.relational-algebra.dev

## Features

- **Relational Algebra Primer** - Educational content explaining core RA concepts
- **Operator Reference** - Documentation for all Bmg operators
- **Interactive Playground** - Try Bmg.js in the browser with:
  - CodeMirror editor with syntax highlighting
  - Real-time TypeScript error checking
  - Support for CSV, JSON, and Excel data sources
  - Live code execution

## Implementations

- **[Bmg](https://github.com/enspirit/bmg)** - Ruby library with SQL compilation and ActiveRecord integration
- **[Bmg.js](https://github.com/enspirit/bmg.js)** - TypeScript library for type-safe in-memory operations

## Development

```bash
pnpm install      # Install dependencies
pnpm dev          # Start development server
pnpm build        # Type-check and build
pnpm preview      # Preview production build
pnpm test         # Run tests
```

## Project Structure

```
src/
├── content/docs/     # Documentation pages (MDX/Markdown)
│   ├── ra-primer/    # Relational algebra educational content
│   ├── reference/    # Operator reference documentation
│   ├── comparison/   # Bmg vs SQL comparisons
│   └── usage/        # Getting started guides
├── components/try/   # Interactive playground
│   ├── composables/  # Vue composables
│   ├── lib/          # Shared utilities
│   └── workers/      # Web Workers
tests/                # Vitest test suites
```

## Built with

- [Astro](https://astro.build/) + [Starlight](https://starlight.astro.build/)
- [Vue.js](https://vuejs.org/) + [CodeMirror](https://codemirror.net/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Bmg.js](https://github.com/enspirit/bmg.js)

## License

MIT
