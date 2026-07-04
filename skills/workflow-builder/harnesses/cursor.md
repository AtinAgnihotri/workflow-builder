# Cursor Notes

Point Cursor at `skills/workflow-builder/SKILL.md` as project context or paste it
into the agent instructions for Workflow Builder tasks.

Recommended Cursor prompt:

```text
Use the Workflow Builder skill from skills/workflow-builder/SKILL.md. Inspect the
local code before editing. Preserve schemaVersion "1.0", use @journeys/core
when available, validate changed workflow JSON, and do not invent an expression
DSL.
```

When using Cursor subagents, keep one lead agent responsible for public schema
and API decisions. Delegate examples, UI panels, tests, and docs as scoped tasks.
