# PRP 001: Repo Scaffold And Core Package

## Goal

Create the monorepo scaffold and an empty but buildable core package. This PRP
does not implement the evaluator yet.

## Context To Read First

- `README.md`
- `docs/00-product-brief.md`
- `docs/01-architecture.md`
- `docs/07-implementation-roadmap.md`

## Target Structure

```text
packages/core
apps/builder
examples
docs
PRPs
```

## Subagent Guidance

This PRP is mostly sequential. The lead agent should create the workspace
structure and package contracts before launching subagents. After the scaffold
exists, a subagent may add the Apache 2.0 license while the lead agent finishes
package metadata, but avoid parallel edits to root config files.

## Tasks

1. Add root `package.json`.
2. Add `pnpm-workspace.yaml`.
3. Add `tsconfig.base.json`.
4. Add `packages/core/package.json`.
5. Add `packages/core/tsconfig.json`.
6. Add `packages/core/src/index.ts`.
7. Add `packages/core/src/types.ts`.
8. Add Vitest setup for the core package.
9. Add build and test scripts.
10. Add Apache 2.0 `LICENSE`.
11. Add package-manager config that blocks package versions newer than 1 day
    where supported.
12. Keep the scaffold dependency footprint minimal.

Update to the original Vitest suggestion: prefer Node's built-in test runner for
the scaffold. Add Vitest only later if the implementation materially benefits
from it.

## Package Naming

Use `@journeys/core` unless the package name is unavailable during
publication. If unavailable, choose a scoped package controlled by the maintainer
and update docs consistently.

## Root Package Scripts

Suggested:

```json
{
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck"
  }
}
```

Root dependencies should be minimal. For the scaffold, TypeScript should be the
only required root dev dependency.

## Core Package Scripts

Suggested:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "pnpm build && node --test tests/*.test.mjs",
    "typecheck": "tsc --noEmit"
  }
}
```

Avoid `tsup`, Vitest, or other package exposure in the first scaffold unless a
maintainer explicitly chooses that tradeoff.

## Supply-Chain Requirements

- Add `.npmrc` with a minimum package release age of 1 day where the selected
  package manager supports it.
- With pnpm, represent 1 day as `1440` minutes.
- Pin the package manager version in `packageManager`.
- Add `engine-strict=true` so unsupported package-manager/runtime combinations
  fail early.
- Do not add runtime dependencies to `packages/core` in PRP 001.
- Any new dependency must have a short written justification in the implementing
  PR or completion report.
- Prefer Node built-ins and TypeScript before adding npm packages.

## Initial Types

Implement exported type placeholders matching the docs:

```ts
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type WorkflowDefinition = {
  schemaVersion: "1.0";
  id: string;
  name: string;
  description?: string;
  startNodeId: string;
  nodes: Record<string, WorkflowNode>;
  edges: Record<string, WorkflowEdge[]>;
  metadata?: JsonObject;
};
```

Continue with node, edge, operator, condition, validation, and evaluation result
types from `docs/02-workflow-json-schema.md`, including runtime state types such
as `WorkflowRuntimeState`, `WorkflowTransitionRecord`,
`WorkflowStateSnapshot`, and `WorkflowNextCandidate`.

## Placeholder Functions

It is acceptable for this PRP to add placeholder functions that throw
`Not implemented`. PRP 002 will replace them.

```ts
export function validateWorkflow(_workflow: unknown): ValidationResult {
  throw new Error("Not implemented");
}
```

## Acceptance Criteria

- `pnpm install` succeeds.
- `pnpm build` succeeds.
- `pnpm typecheck` succeeds.
- `pnpm test` succeeds with at least one placeholder test using Node's built-in
  test runner.
- `@journeys/core` exports all planned type names.
- No UI framework dependency is present in `packages/core`.
- `.npmrc` includes the 1-day package age gate.
- `packages/core` has no runtime dependencies.
- changes are committed as a logical PRP 001 scaffold checkpoint once validated,
  or the completion report explains why a commit was deferred.

## Common Mistakes To Avoid

- Do not create a single app-only project.
- Do not put React in the core package.
- Do not skip package exports.
- Do not invent a different schema while scaffolding.
