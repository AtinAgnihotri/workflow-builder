# Contributing to Journeys

Thank you for your interest in Journeys. This project is
**maintainer-led**: the maintainer sets the roadmap, and issues and discussions
collect feedback from the community.

## Getting started

```bash
pnpm install
pnpm validate
```

`pnpm validate` runs install (frozen lockfile), typecheck, test, and build — the same
local validation gate used before releases.

See [internal/contributing.md](internal/contributing.md) for project structure, change
guidelines, and issue reporting details.

## How to contribute

1. Open an issue for bugs or feature ideas before large changes when possible.
2. Fork the repository and create a focused branch.
3. Make your changes with tests for core behavior changes.
4. Run `pnpm validate` locally before opening a PR.
5. Open a pull request using the PR template.

## Pull request expectations

- Link related issues, docs, or PRP acceptance criteria when applicable.
- Keep PRs focused; avoid unrelated refactors.
- Update docs when you change schema semantics, public APIs, or integration
  patterns.
- Schema changes require updates to `docs/02-workflow-json-schema.md`, core types,
  validation, tests, and the portable agent skill.

## Governance

- **Roadmap:** maintainer decides priorities; public roadmap lives in GitHub
  issues, discussions, and [internal/07-implementation-roadmap.md](internal/07-implementation-roadmap.md).
- **Reviews:** PRs that change runtime behavior should include tests.
- **Schema:** treat `docs/02-workflow-json-schema.md` as the source of truth.
- **Dependencies:** keep the core package minimal; justify new npm packages and
  respect the 1-day release age gate in `.npmrc`.

## Releasing

Releases use [semantic versioning](https://semver.org/). Pre-1.0 versions may
still evolve the schema; see [CHANGELOG.md](CHANGELOG.md).

We recommend [Changesets](https://github.com/changesets/changesets) for version
bumps and changelog entries once publishing begins:

1. Add a changeset when your PR includes user-facing changes:
   `pnpm changeset` (after `@changesets/cli` is added to the repo).
2. Merge PRs; maintainers run the release workflow or publish manually.
3. Follow the [release checklist](internal/release-checklist.md) or run
   `./scripts/release.sh <version>` before publishing to npm.

Manual publish is preferred until package contents and exports are verified via
`pnpm validate` and `npm pack --dry-run`.

## Code of conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By
participating, you agree to uphold it.

## License

By contributing, you agree that your contributions are licensed under the
[Apache License 2.0](LICENSE).
