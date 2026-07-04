# Contributing

Thank you for helping improve Workflow Builder. This project is maintainer-led
with a public roadmap in docs and PRPs.

## Development setup

```bash
pnpm install
pnpm validate
```

`pnpm validate` runs install (frozen lockfile), typecheck, test, and build.

## Project structure

```text
packages/core    — @journeys/core
apps/builder     — visual editor
examples/        — integration examples
docs/            — product and API docs
PRPs/            — implementation prompts
```

## Change guidelines

1. **Schema changes** require updates to `docs/02-workflow-json-schema.md`, core
   types, validation, tests, and the portable skill.
2. **Core stays framework-agnostic** — no React or DOM in `packages/core`.
3. **Minimal dependencies** — justify new npm packages; respect the 1-day release
   age gate in `.npmrc`.
4. **Examples before adapters** — prove integration patterns in `examples/`
   before adding framework wrapper packages.
5. **Commit logically** — separate scaffold, feature, test, and docs commits when
   possible.

## Pull requests

- Link related docs or PRP acceptance criteria.
- Run `pnpm validate` before opening a PR.
- Include tests for core behavior changes.
- Avoid drive-by refactors outside the PR scope.

## Reporting issues

Include:

- workflow JSON (if applicable)
- sample context object
- expected vs actual evaluation result
- `@journeys/core` version or commit SHA

## License

Contributions are licensed under Apache 2.0, consistent with the project
[LICENSE](../LICENSE).
