# Release Notes

Pre-1.0 releases follow [semantic versioning](https://semver.org/) while the
schema may still evolve.

## Unreleased (main)

### Added

- `@workflow-builder/core` with schema 1.0 types, validation, evaluation, runtime
  state helpers, and graph inspection utilities
- Visual builder app (`apps/builder`) with import/export, preview, and condition
  editor
- Runnable examples: vanilla, React local state, React Router, TanStack Router,
  Next.js client, edge runtime handler
- Docs: quickstart, API reference, examples index, contributing guide
- Portable agent skill under `skills/workflow-builder/`

### Added (0.4 prep)

- GitHub Actions CI, root governance docs, issue/PR templates
- Release checklist and Changesets recommendation ([release-checklist.md](release-checklist.md))

### Planned

- npm publish of `@workflow-builder/core`
- Import/export polish and launch prep

## Version targets

| Version | Scope |
| --- | --- |
| 0.1.0 | Core validator and evaluator |
| 0.2.0 | Builder UI MVP |
| 0.3.0 | Examples and docs site |
| 1.0.0 | Stable schema V1 compatibility promise |

See [implementation roadmap](07-implementation-roadmap.md) for full sequencing.
