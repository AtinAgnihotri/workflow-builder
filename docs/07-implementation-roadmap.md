# Implementation Roadmap

## Phase 0: Repo Preparation

Deliver:

- pnpm workspace
- root TypeScript config
- root lint/test scripts
- Apache 2.0 license
- basic CI
- package folders
- package-manager age gate requiring packages to be at least 1 day old where
  supported
- minimal dependency baseline, with TypeScript as the only required root dev
  dependency for the scaffold

Do not start the builder before the core package has tests.

## Phase 1: Core Package MVP

Deliver:

- `@journeys/core`
- exported types
- validator
- parser and serializer
- evaluator
- graph helpers
- comprehensive tests

Minimum public APIs:

```ts
validateWorkflow
assertValidWorkflow
parseWorkflowJson
serializeWorkflow
evaluateCondition
evaluateConditionGroup
evaluateNext
createWorkflowState
inspectWorkflowState
advanceWorkflow
getReachableNodeIds
findUnreachableNodes
findDeadEnds
```

Exit criteria:

- all operators in docs are implemented
- validation errors use stable codes
- package builds to ESM and CJS if practical, or ESM-only if documented
- tests pass

## Phase 2: Builder UI MVP

Deliver:

- graph canvas
- node inspector
- edge inspector
- condition editor
- import/export
- validation panel
- preview panel
- demo workflow

Exit criteria:

- exported JSON validates with core
- imported invalid JSON does not destroy current draft
- preview uses core evaluator
- UI is usable without backend

## Phase 3: Examples

Deliver runnable examples:

- vanilla TypeScript
- React local state
- React Router
- TanStack Router
- Next.js
- edge runtime

Exit criteria:

- each example imports the built package
- each example has a README
- examples demonstrate context mapping
- examples demonstrate node interpretation

## Phase 4: Docs Site

Deliver:

- GitHub Pages from `docs/`
- quickstart
- API reference
- schema reference
- builder guide
- integration guide
- examples index
- release notes

Exit criteria:

- docs can be read from GitHub without running local tooling
- docs site link appears in README

## Phase 5: OSS Launch Prep

Deliver:

- license
- contributing guide
- code of conduct
- security policy
- funding file if desired
- issue templates
- PR template
- changelog
- package publishing workflow

Exit criteria:

- new contributor can run tests
- release process is documented
- npm package can be published safely

## Build Order For Implementation Agent

1. Create workspace scaffold.
2. Implement core types.
3. Implement validation.
4. Implement evaluator.
5. Write tests for validation and evaluation.
6. Build package output.
7. Create builder app.
8. Wire builder to core.
9. Add examples.
10. Add docs site publishing.
11. Add release and governance files.
12. Add portable agent skill.

Commit after each coherent checkpoint. At minimum, commit after PRP 001, PRP
002, PRP 003, PRP 004, PRP 005, and PRP 006 are independently complete. If a PRP
is large, split commits by subagent stream, such as validation, evaluator,
runtime state, and graph helpers.

## Subagent-Aware Build Order

When using a harness that supports subagents, keep one lead agent as the
orchestrator. The orchestrator owns schema/API decisions and merges work.

Safe parallel work after the scaffold exists:

- Core validation agent: validation and issue codes.
- Core evaluator agent: condition and edge evaluation.
- Core graph helper agent: reachability, dead ends, graph utilities.
- Docs/examples agent: docs pages and example READMEs.

Safe parallel work after the core API is stable:

- Builder canvas agent.
- Builder inspector and condition editor agent.
- Builder import/export and preview agent.
- Example apps agent.
- OSS governance agent.
- Portable skill agent.

Do not parallelize changes to `packages/core/src/types.ts` without a lead-agent
merge point. That file is the contract for nearly every other stream.

## Important Guardrails

- Do not duplicate schema logic in the UI.
- Do not add expression strings.
- Do not use `eval`.
- Do not build adapters until examples are complete.
- Do not make the builder require a server.
- Do not let graph rendering library data become the exported format.
- Do not change schema semantics without updating docs and tests.

## Suggested Implementation Model Prompt

Use this prompt for the next implementation agent:

```text
You are implementing the Workflow Builder repository. Read README.md, all docs/
files, and the PRPs/ files before coding. Implement PRPs in numeric order. Keep
the core package framework agnostic. Do not invent a DSL or use eval. The JSON
schema in docs/02-workflow-json-schema.md is the source of truth. After each PRP,
run the relevant tests and update docs if implementation details differ.
Use subagents where the PRPs mark work as parallelizable. Keep a single lead
agent responsible for schema/API decisions, conflict resolution, final tests, and
the completion report. Commit logical checkpoints as work is completed.
```
