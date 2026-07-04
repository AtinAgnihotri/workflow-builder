# For AI assistants

Journeys ships a portable Markdown skill for coding agents. Use it when editing
workflow JSON, integrating `@journeys/core`, or working in this monorepo.

## Canonical skill

[`skills/journeys/SKILL.md`](../../skills/journeys/SKILL.md) — schema summary,
operators, integration patterns, and anti-patterns.

## Harness-specific notes

Thin setup notes for common agent harnesses live under
[`skills/journeys/harnesses/`](../../skills/journeys/harnesses/).

## Repository context

When implementing in this repo, also read:

- [Agent orchestration](../08-agent-orchestration.md) — subagent boundaries
- [Portable agent skill spec](../09-portable-agent-skill.md)
- [PRPs](../../PRPs/) — completed implementation checkpoints

Cursor users: project skill at `.cursor/skills/journeys/SKILL.md` mirrors the
repo skill and loads monorepo navigation.
