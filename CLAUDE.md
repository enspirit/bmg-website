# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the documentation website for **Bmg**, a relational algebra Ruby library. The site is built with Astro and Starlight, hosted at https://www.relational-algebra.dev.

## Commands

```bash
pnpm install      # Install dependencies
pnpm dev          # Start development server
pnpm build        # Type-check with astro check, then build
pnpm preview      # Preview production build
```

## Architecture

- **Framework**: Astro 5 with Starlight documentation theme
- **Styling**: Tailwind CSS 4 via Vite plugin
- **Package Manager**: pnpm (v8.9.2 specified)

### Content Structure

Documentation is written in MDX/Markdown files in `src/content/docs/`:

- `ra-primer/` - Relational algebra educational content
- `comparison/` - Bmg vs SQL and other libraries
- `usage/` - Getting started, predicates, RDBMS/Redis integration
- `reference/operators/` - Individual operator documentation (allbut, join, restrict, etc.)
- `recipies/` - Practical usage patterns

Content collections are configured in `src/content/config.ts` using Starlight's `docsSchema()`.

### Sidebar Organization

The sidebar in `astro.config.mjs` auto-generates sections from the content directories. Each section maps to a directory under `src/content/docs/`.

### Ruby Examples

The `examples/` directory contains runnable Ruby examples with a SQLite database (`suppliers-and-parts.db`) for testing Bmg queries against SQL.

The `implementations/bmg/` directory contains the main Bmg Ruby library README which serves as the canonical reference for operators, predicates, and summarizers.

## Rules when touching the documentation

* When adding/removing an operator you MUST
  * Create individual pages in `reference/operators/*.md`
  * Adapt the overview table in `reference/overview.mdx` and put the operator in the correct section
