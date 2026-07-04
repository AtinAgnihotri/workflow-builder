---
name: workflow-builder
description: >-
  Loads Workflow Builder monorepo context for implementation, validation, and
  integration tasks. Use when working in this repository, implementing PRPs,
  editing @journeys/core, workflow JSON, the builder UI, or when the
  user mentions Workflow Builder, adjacency-list workflows, or PRP checkpoints.
---

# Workflow Builder (Repository Context)

## What This Repo Is

TypeScript monorepo for a **framework-agnostic workflow library** and **visual builder**.
Workflows are plain JSON adjacency lists — not a custom DSL. The core package validates
and evaluates transitions; host apps own state, routing, and side effects.

## Context Loading Order

Read only what the task needs. Default order:

1. [README.md](../../README.md) — navigation and current status
2. [docs/index.md](../../docs/index.md) — doc reading order
3. Relevant PRP under [PRPs/](../../PRPs/) for the active implementation step
4. [skills/workflow-builder/SKILL.md](../../skills/workflow-builder/SKILL.md) — JSON schema, operators, integration patterns
5. [docs/08-agent-orchestration.md](../../docs/08-agent-orchestration.md) — when using subagents

### By task type

| Task | Read first |
|------|------------|
| Core types / validation / evaluator | `docs/02-workflow-json-schema.md`, `docs/03-evaluation-engine.md`, active PRP |
| Builder UI | `docs/04-builder-ui-spec.md`, PRP 003 |
| Examples / adapters | `docs/05-integration-and-adapters.md`, PRP 004 |
| Release / CI | `docs/06-docs-site-and-oss-strategy.md`, PRP 005 |
| Editing workflow JSON | `skills/workflow-builder/SKILL.md`, `docs/02-workflow-json-schema.md` |

## Monorepo Layout

```text
packages/core   — @journeys/core (types, validation, evaluation)
apps/builder    — visual editor (imports core)
examples/       — integration contracts
docs/           — product and architecture specs
PRPs/           — step-by-step implementation prompts
skills/         — portable agent skill (OSS distribution)
```

## Hard Rules

1. **JSON is source of truth** — schema in `docs/02-workflow-json-schema.md` wins.
2. **No DSL, no eval** — conditions are structured `{ field, operator, value }` trees.
3. **Core stays framework-agnostic** — no React, DOM, `fs`, or network in `packages/core`.
4. **Deterministic edges** — sort by `priority` ascending; first match wins.
5. **Minimal dependencies** — TypeScript + Node built-ins first; justify every npm add;
   respect `.npmrc` 1-day release age gate (`minimum-release-age=1440`).
6. **One lead for types** — only one agent edits `packages/core/src/types.ts` at a time.
7. **Commit at PRP checkpoints** — validate (`pnpm install`, `build`, `typecheck`, `test`) before committing scaffold or feature work.

## Commands

From repo root:

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
```

## PRP Status

Check [PRPs/](../../PRPs/) numbering. Complete each PRP's acceptance criteria before moving on.
PRP 001 = scaffold; PRP 002 = validator + evaluator; PRP 003 = builder UI; etc.

## Additional Resources

- Workflow JSON and integration details: [skills/workflow-builder/SKILL.md](../../skills/workflow-builder/SKILL.md)
- Example workflow: [skills/workflow-builder/examples/basic-workflow.json](../../skills/workflow-builder/examples/basic-workflow.json)
- Architecture: [docs/01-architecture.md](../../docs/01-architecture.md)
- Implementation roadmap: [docs/07-implementation-roadmap.md](../../docs/07-implementation-roadmap.md)
