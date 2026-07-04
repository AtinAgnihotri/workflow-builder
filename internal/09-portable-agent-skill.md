# Portable Agent Skill

## Goal

Create a portable skill that agentic coding harnesses can pull into context so
their agents understand Journeys and can use it correctly.

Target harnesses include:

- Cursor
- OpenCode
- Claude Code
- Codex
- T3 Chat or T3Code-style agents
- other coding assistants that can ingest Markdown instruction files

## What The Skill Should Teach

The skill should teach an agent:

- what Journeys is
- the workflow JSON adjacency-list shape
- how nodes, edges, priorities, and condition groups work
- how to validate workflow JSON
- how to evaluate the next node
- how to map host app state into workflow context
- how to interpret nodes in a host app
- what not to do

## Portable Format

Use a Markdown-first skill so any harness can ingest it.

Skill files:

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

The canonical file is `SKILL.md`. Harness-specific files should be thin notes,
not separate sources of truth.

The actual skill lives at
[`../skills/journeys/SKILL.md`](../skills/journeys/SKILL.md).

## Skill Behavior

When activated, the agent should:

1. Check whether `@journeys/core` is installed.
2. If installed, inspect the local package version and exported APIs.
3. If not installed, suggest installing it or use documented JSON examples.
4. Read any local workflow JSON files before editing them.
5. Validate workflow JSON after changes.
6. Preserve schema semantics.
7. Avoid expression DSLs.

## Skill Anti-Patterns

The skill must warn agents not to:

- use `eval`
- use `new Function`
- create expression strings like `"age > 29"`
- assume Journeys owns routing
- assume Journeys owns app state
- add React dependencies to the core package
- mutate workflow JSON into a graph-library-only shape
- use nested dot paths unless the schema has explicitly added path arrays

## Proposed Skill Content

The skill should include this compact operating model:

```text
Developer-owned:
- map application state into context
- decide what node IDs mean
- perform navigation/rendering/actions

Journeys-owned:
- JSON schema
- validation
- condition evaluation
- deterministic next-node selection
- builder UI import/export
```

## Example Skill Activation Prompt

```text
Use the Journeys skill. Inspect this app's state shape, propose a
workflow context mapping, create or update workflow JSON, and wire evaluation
without changing routing architecture. Validate the workflow before finishing.
```

## Distribution Options

Start with a repo folder:

```text
skills/journeys
```

Later options:

- publish the skill folder in the npm package under `agent-skill/`
- add a GitHub release asset
- add docs page with copy-paste installation instructions
- maintain harness-specific marketplace metadata if those ecosystems support it

## Versioning

The skill should state which Journeys schema version it supports:

```text
Supported Journeys schema: 1.0
```

When schema changes, update:

- `SKILL.md`
- examples
- harness notes
- docs page

## Acceptance Criteria

- `skills/journeys/SKILL.md` exists.
- The skill can be understood as plain Markdown.
- The skill includes schema summary, examples, safe usage rules, and anti-patterns.
- Harness-specific notes exist where useful.
- README and docs link to the skill.
