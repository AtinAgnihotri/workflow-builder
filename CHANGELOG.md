# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `@journeys/core` — schema 1.0 types, validation, evaluation, runtime
  state helpers, and graph utilities (47 tests)
- Visual builder app (`apps/builder`) with import/export, preview, and condition
  editor
- Runnable examples: vanilla TypeScript, React local state, React Router,
  TanStack Router, Next.js client, edge runtime
- Docs: quickstart, API reference, examples index, contributing guide, ADR 001
- Portable agent skill under `skills/workflow-builder/`
- Local `pnpm validate` script, governance docs, issue/PR templates, and
  release checklist

### Planned

- npm publish of `@journeys/core` (manual first publish)
- Changesets-based versioning once publishing begins

## Version history (targets)

| Version | Scope |
| --- | --- |
| 0.1.0 | Core validator and evaluator |
| 0.2.0 | Builder UI MVP |
| 0.3.0 | Examples and docs site |
| 0.4.0 | OSS launch prep (CI, governance, publish checklist) |
| 1.0.0 | Stable schema V1 compatibility promise |

See [docs/release-notes.md](docs/release-notes.md) and
[docs/release-checklist.md](docs/release-checklist.md) for release process
details.
