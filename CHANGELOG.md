# Changelog

All notable changes to the Bmg documentation website are documented in this file.

## [1.0.0] - 2026-01-08

### Added

- **TypeScript error highlighting** in the playground editor
  - Real-time type checking with TypeScript compiler running in a Web Worker
  - Type inference from loaded data sources
  - Integration with CodeMirror's linting extension
  - Uses type definitions from `@enspirit/bmg-js` package

- **Interactive playground** (`/try` page)
  - CodeMirror-based editor with JavaScript/TypeScript syntax highlighting
  - Support for CSV, JSON, and Excel data sources
  - Live code execution with Bmg.js
  - Results displayed in a data table

### Changed

- Upgraded to Astro 5, Starlight 0.37, and Tailwind 4

### Documentation

- Added documentation for operators: `prefix`, `suffix`, `constants`, `transform`, `page`, `generator`, `image`, `ungroup`, `unwrap`, `autowrap`, `extend`, `matching`, `not_matching`, `left_join`
- Added operator overview table
- Improved SEO and home page
- Added SQL comparison section
- Showcased TypeScript library (bmg.js) alongside Ruby implementation

## [0.0.1] - Initial Release

### Added

- Documentation website built with Astro and Starlight
- Relational Algebra primer explaining core concepts
- Reference documentation for Bmg operators
- Usage guides for predicates, RDBMS integration, and Redis
- Comparison with SQL
- Ruby examples with SQLite database
