# Plan: Multi-Language Documentation for Bmg

Adapt the documentation website to support both Ruby (Bmg) and TypeScript (Bmg.js) libraries using tabbed code examples and language badges.

## Summary of Changes

- Add language tabs (Ruby | TypeScript) to operator pages using Starlight's `<Tabs>` component
- Add badges ("Ruby only" / "TS only") for language-specific operators
- Update overview table with language availability columns
- Create new pages for operators missing from docs
- Create library alignment suggestions page

## Component Strategy

**Tabs**: Use Starlight's built-in `<Tabs>` with `syncKey="lang"` for persistent preference
```mdx
import { Tabs, TabItem } from '@astrojs/starlight/components';

<Tabs syncKey="lang">
  <TabItem label="Ruby">...</TabItem>
  <TabItem label="TypeScript">...</TabItem>
</Tabs>
```

**Badges**: Use Starlight's `<Badge>` component
```mdx
import { Badge } from '@astrojs/starlight/components';
<Badge text="Ruby only" variant="note" />
<Badge text="TypeScript only" variant="tip" />
```

## Operator Availability

| Status | Operators |
|--------|-----------|
| **Both** (22) | restrict, where, exclude, project, allbut, extend, constants, rename, prefix, suffix, transform, join, left_join, cross_product, matching, not_matching, union, minus, image, group, ungroup, unwrap, autowrap, summarize, wrap |
| **Ruby only** (5) | page, rxmatch, autosummarize, undress, images |
| **TS only** (5) | intersect, one, yByX, isEqual, toArray |

## Implementation Phases

### Phase 1: Navigation Updates

1. Update homepage `src/content/docs/index.mdx` to mention both libraries
2. Create `src/content/docs/usage/getting-started-ts.mdx` for TypeScript setup

### Phase 2: Infrastructure Test

1. Convert `restrict.md` to `restrict.mdx` with tabs as template
2. Verify tabs work correctly with syncKey

### Phase 3: Overview Table

Update `src/content/docs/reference/overview.mdx`:
- Add Ruby/TS columns to table
- Add rows for missing operators (exclude, wrap, intersect, etc.)

### Phase 4: Convert Existing Operator Pages

Convert all 24 operator `.md` files to `.mdx` and add TypeScript examples:

| File | Action |
|------|--------|
| `reference/operators/restrict.md` | Convert to .mdx, add TS tabs |
| `reference/operators/join.md` | Convert to .mdx, add TS tabs |
| `reference/operators/project.md` | Convert to .mdx, add TS tabs |
| `reference/operators/allbut.md` | Convert to .mdx, add TS tabs |
| `reference/operators/extend.md` | Convert to .mdx, add TS tabs |
| `reference/operators/summarize.md` | Convert to .mdx, add TS tabs |
| `reference/operators/group.md` | Convert to .mdx, add TS tabs |
| `reference/operators/ungroup.md` | Convert to .mdx, add TS tabs |
| `reference/operators/image.md` | Convert to .mdx, add TS tabs |
| `reference/operators/matching.md` | Convert to .mdx, add TS tabs |
| `reference/operators/not-matching.md` | Convert to .mdx, add TS tabs |
| `reference/operators/union.md` | Convert to .mdx, add TS tabs |
| `reference/operators/minus.md` | Convert to .mdx, add TS tabs |
| `reference/operators/left-join.md` | Convert to .mdx, add TS tabs |
| `reference/operators/cross-product.md` | Convert to .mdx, add TS tabs |
| `reference/operators/rename.md` | Convert to .mdx, add TS tabs |
| `reference/operators/prefix.md` | Convert to .mdx, add TS tabs |
| `reference/operators/suffix.md` | Convert to .mdx, add TS tabs |
| `reference/operators/constants.md` | Convert to .mdx, add TS tabs |
| `reference/operators/transform.md` | Convert to .mdx, add TS tabs |
| `reference/operators/autowrap.md` | Convert to .mdx, add TS tabs |
| `reference/operators/unwrap.md` | Convert to .mdx, add TS tabs |
| `reference/operators/page.md` | Convert to .mdx, add Ruby-only badge |
| `reference/operators/generator.md` | Convert to .mdx, add Ruby-only badge |

### Phase 5: Create New Operator Pages

- `reference/operators/exclude.mdx` - Filter tuples NOT matching predicate

### Phase 6: Library Alignment Suggestions

Create `src/content/docs/reference/library-alignment.mdx` for alignment suggestions.

**Currently in Ruby only:**
- `reference/operators/page.mdx` - Regex match restriction
- `reference/operators/rxmatch.mdx` - Regex match restriction
- `reference/operators/autosummarize.mdx` - Auto summarization
- `reference/operators/undress.mdx` - Convert values to scalars
- `reference/operators/images.mdx` - Multiple image shortcut

**Currently in TypeScript only:**
- `reference/operators/wrap.mdx` - Wrap attributes into tuple-valued attribute
- `reference/operators/intersect.mdx` - Set intersection
- `reference/operators/one.mdx` - Extract single tuple
- `reference/operators/ybyx.mdx` - Create mapping object
- `reference/operators/is-equal.mdx` - Check set equality
- `reference/operators/to-array.mdx` - Convert to array

## Critical Files

| File | Purpose |
|------|---------|
| `src/content/docs/reference/overview.mdx` | Operator table - add language columns |
| `src/content/docs/reference/operators/*.md` | Convert to .mdx with tabs |
| `src/content/docs/index.mdx` | Homepage - add TypeScript mentions |
| `implementations/bmg.js/README.md` | TypeScript API reference source |
| `implementations/bmg/README.md` | Ruby API reference source |

## TypeScript Syntax Differences (for reference)

| Concept | Ruby | TypeScript |
|---------|------|------------|
| Predicate (hash) | `restrict(a: "foo")` | `restrict({ a: "foo" })` |
| Predicate (func) | `restrict(->(t) { t[:a] == "foo" })` | `restrict(t => t.a === "foo")` |
| Extension | `extend(x: ->(t) { t[:y].upcase })` | `extend({ x: t => t.y.toUpperCase() })` |
| Summarize | `summarize([:a], x: :sum)` | `summarize(['a'], { x: { op: 'sum', attr: 'y' } })` |
| Output | `.to_a` | `.toArray()` |
