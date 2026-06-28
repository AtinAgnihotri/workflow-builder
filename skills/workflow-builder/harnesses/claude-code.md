# Claude Code Notes

Add `skills/workflow-builder/SKILL.md` to Claude Code context for tasks that
touch workflow definitions, builder UI behavior, or Workflow Builder integration.

Recommended prompt:

```text
Use the Workflow Builder skill. Read skills/workflow-builder/SKILL.md before
editing. Validate workflow JSON after changes and preserve the documented schema
shape.
```

Keep harness-specific instructions thin. `SKILL.md` is the source of truth.
