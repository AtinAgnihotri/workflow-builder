# Agent Orchestration

## Purpose

This project is intentionally documented so one lead agent can launch subagents
inside a single chat, coordinate parallel implementation, and report back when
the work is complete.

Assume a 200k context window. That is large enough for the lead agent to read
all docs and PRPs once, keep the architecture in memory, and delegate scoped
tasks without asking each subagent to rediscover the whole project.

## Lead Agent Responsibilities

The lead agent owns:

- reading all docs and PRPs before starting
- choosing which PRP is active
- freezing schema/API decisions for the active PRP
- launching subagents with narrow prompts
- reviewing subagent outputs
- resolving conflicts
- running final tests
- updating docs when implementation differs
- committing logical checkpoints when a coherent unit of work is complete
- reporting completion to the user

The lead agent should not delegate final API judgment. Subagents can implement,
test, and draft docs, but the lead agent merges.

## Subagent Rules

Subagents should receive:

- the relevant docs and PRP names
- exact files they may edit
- exact APIs they must preserve
- acceptance criteria
- tests they should add or run
- instruction to report changed files and risks

Subagents should not:

- change schema semantics unless explicitly assigned
- rename public APIs
- add framework dependencies to core
- add expression DSLs
- use `eval` or `new Function`
- make broad repo-wide formatting changes

## Parallelization Map

### PRP 001

Mostly sequential. Scaffold first. Parallel work is not useful until package
structure exists.

### PRP 002

Parallelizable after `types.ts` is stable:

- validation subagent
- evaluator subagent
- graph helpers subagent
- test coverage subagent

The lead agent should merge all exports through `src/index.ts`.

### PRP 003

Parallelizable after the app shell exists:

- graph canvas subagent
- inspector and condition editor subagent
- import/export subagent
- preview and validation panel subagent
- styling/accessibility pass subagent

The lead agent should keep builder state shape consistent.

### PRP 004

Highly parallelizable:

- vanilla and edge examples subagent
- React examples subagent
- router examples subagent
- docs site subagent
- adapter ADR subagent

### PRP 005

Parallelizable:

- CI and release tooling subagent
- governance docs subagent
- issue templates subagent

### PRP 006

Parallelizable:

- portable skill content subagent
- harness packaging notes subagent
- example agent prompts subagent
- validation docs subagent

## Orchestrator Prompt

Use this prompt in Cursor or another harness with subagents:

```text
You are the lead implementation agent for Journeys.

First, read README.md, docs/*.md, and PRPs/*.md. Keep docs/02-workflow-json-schema.md
as the source of truth for schema semantics. Keep docs/08-agent-orchestration.md
as the source of truth for delegation.

Implement PRPs in numeric order. For each PRP:
1. identify which work can run in parallel,
2. launch subagents with narrow file ownership,
3. keep public types and schema decisions centralized,
4. review and merge subagent work,
5. run relevant tests,
6. update docs if implementation differs,
7. commit a logical checkpoint when the repo is in a coherent state,
8. report changed files, tests, commits, and risks.

Do not use eval, new Function, or expression strings. Do not put UI framework
dependencies in packages/core. Do not build adapters before examples.
```

## Subagent Prompt Template

```text
You are a scoped subagent working on Journeys.

Read:
- <specific doc files>
- <specific PRP>

You may edit:
- <file or folder list>

You must preserve:
- schemaVersion "1.0"
- public API names in the PRP
- JSON adjacency-list workflow shape
- no eval/new Function/expression DSL

Task:
<specific task>

Before finishing:
- add or update tests where relevant
- run the narrowest useful validation command
- report changed files
- report any assumptions or risks
```

## Completion Report Template

```text
Completed PRP <number>: <name>

Changed:
- <important files>

Validation:
- <commands run and result>

Commits:
- <commit hash and subject>

Subagents used:
- <subagent name/task>

Notes:
- <risks, follow-ups, or doc deviations>
```

## 200k Context Guidance

With a 200k context window, the lead agent should load the full documentation
set once at the beginning. Subagents should load only their relevant docs to
avoid noisy reasoning.

Suggested context allocation:

- lead agent: all docs, all PRPs, current code
- core validation subagent: schema, evaluation docs, PRP 002
- builder subagents: UI spec, schema, PRP 003
- examples subagents: integration docs, PRP 004
- OSS subagents: OSS docs, PRP 005
- skill subagent: portable skill docs, PRP 006

The lead agent should periodically summarize decisions in the chat so later
subagents inherit current reality rather than stale docs.

## Commit Discipline

Commit when a coherent unit is complete and validated enough for handoff. Good
commit boundaries are:

- docs and PRP planning
- portable agent skill
- repo scaffold
- core validator
- evaluator and runtime state helpers
- builder UI shell
- examples
- release/governance files

Do not make one large mixed commit for unrelated docs, runtime code, and release
metadata. Do not commit broken intermediate states unless the commit message
clearly marks the work as an intentional scaffold.
