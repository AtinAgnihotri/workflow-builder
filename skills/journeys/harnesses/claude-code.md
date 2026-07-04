# Claude Code Notes

Add `skills/journeys/SKILL.md` to Claude Code context for tasks that
touch workflow definitions, builder UI behavior, or Journeys integration.

Recommended prompt:

```text
Use the Journeys skill. Read skills/journeys/SKILL.md before
editing. Validate workflow JSON after changes and preserve the documented schema
shape.
```

Keep harness-specific instructions thin. `SKILL.md` is the source of truth.
