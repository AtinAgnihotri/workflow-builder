# PRP 006: Portable Journeys Agent Skill

## Goal

Create a portable agent skill that teaches coding agents how to use Journeys safely and idiomatically.

This skill should be useful in Cursor, OpenCode, Claude Code, Codex, T3Code, and
other harnesses that can pull in Markdown instructions.

## Context To Read First

- `docs/09-portable-agent-skill.md`
- `docs/02-workflow-json-schema.md`
- `docs/03-evaluation-engine.md`
- `docs/05-integration-and-adapters.md`
- `docs/08-agent-orchestration.md`

## Parallelization

This PRP can use subagents after the lead agent creates the folder structure:

- Skill content subagent: writes `SKILL.md`.
- Examples subagent: writes example workflow and usage files.
- Harness notes subagent: writes Cursor, Claude Code, Codex, and OpenCode notes.
- Docs integration subagent: links the skill from README and docs.

The lead agent must review `SKILL.md` for schema correctness before completion.

## Files To Create

```text
skills/journeys/SKILL.md
skills/journeys/examples/basic-workflow.json
skills/journeys/examples/basic-usage.ts
skills/journeys/examples/react-usage.tsx
skills/journeys/harnesses/cursor.md
skills/journeys/harnesses/claude-code.md
skills/journeys/harnesses/codex.md
skills/journeys/harnesses/opencode.md
```

## SKILL.md Required Sections

Include:

- name and purpose
- when to use
- supported schema version
- mental model
- workflow JSON summary
- operator summary
- safe evaluation pattern
- runtime state pattern for current node, previous node, history, and possible
  next nodes
- context mapping pattern
- integration pattern
- validation checklist
- anti-patterns
- small examples
- harness notes pointer

## Required Skill Rules

The skill must instruct agents:

- use `@journeys/core` when available
- validate workflows after editing
- preserve `schemaVersion: "1.0"`
- use adjacency-list `edges`
- use runtime state helpers when the host app needs current/previous/history
  tracking
- keep field names as direct context keys in V1
- keep routing and state ownership in the host app
- do not invent a DSL
- do not use `eval`
- do not use `new Function`
- do not add framework dependencies to core
- preserve the dependency-minimal posture and 1-day package age gate when
  editing this repo

## Example Workflow

Create `examples/basic-workflow.json` with:

- start node
- offer node
- review node
- low-LVR conditional edge
- fallback edge with `always: true`

## Example TypeScript Usage

Create `examples/basic-usage.ts` showing:

- import from `@journeys/core`
- validate workflow
- evaluate from start node
- handle `matched`, `no_match`, and `invalid_current_node`

## Example React Usage

Create `examples/react-usage.tsx` showing:

- mapping component/app state into workflow context
- `evaluateNext`
- local current node state
- no adapter dependency

## Harness Notes

Each harness note should explain how to point the harness at `SKILL.md`.

Keep notes generic where exact marketplace mechanics are unknown. Do not invent
fake commands for harnesses.

## Acceptance Criteria

- Skill files exist.
- Skill examples match schema docs.
- README links to the skill.
- `docs/09-portable-agent-skill.md` links to the actual skill path.
- Skill anti-patterns include no DSL and no code execution.
- The skill is useful as plain Markdown even without harness-specific support.
- skill files are committed separately from runtime implementation unless they
  are part of a small docs-only correction.
