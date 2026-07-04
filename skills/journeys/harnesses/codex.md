# Codex Notes

Use `skills/journeys/SKILL.md` as the skill entrypoint. For implementation
inside this repository, also read `README.md`, `docs/`, and `PRPs/`.

Recommended prompt:

```text
Use the Journeys skill. Read skills/journeys/SKILL.md and the
repo docs before editing. Keep the core package framework agnostic, validate
workflow JSON, and avoid eval/new Function/expression strings.
```

For repo implementation, follow PRPs in numeric order and use the agent
orchestration guidance in `docs/08-agent-orchestration.md`.
