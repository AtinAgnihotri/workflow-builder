# OpenCode Notes

Use `skills/journeys/SKILL.md` as Markdown context for OpenCode agents
working on Journeys workflows or integrations.

Recommended prompt:

```text
Use the Journeys skill from skills/journeys/SKILL.md. Preserve
the JSON adjacency-list schema, validate workflow changes, and keep routing/state
logic in the host app.
```

If the harness supports custom instruction files, reference `SKILL.md` directly.
If not, paste the skill text into the task context.
