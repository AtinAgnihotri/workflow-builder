# Release Checklist

Use this checklist before publishing `@journeys/core` to npm. Manual
publish is recommended for the first release; automate only after contents and
exports are verified.

## Pre-release validation

Run from the repository root:

```bash
pnpm validate
```

Confirm `pnpm validate` passes on the release commit.

## Package contents

From `packages/core`:

```bash
pnpm --filter @journeys/core pack --json
```

Or from `packages/core`, `pnpm pack --json` (lists files; writes a `.tgz` you can delete after inspection).

Verify the tarball includes **only** expected files:

- `dist/**` (compiled ESM and type declarations)
- `package.json`
- `README.md`
- `LICENSE`

No source files, tests, or monorepo-only paths should appear.

## Package manager security

- Confirm `.npmrc` still enforces `minimum-release-age=1440` (1 day).
- Do not add install flags or scripts that bypass the age gate except in a
  separately reviewed emergency security fix.
- Review the dependency tree; confirm each dependency is still justified.

## Exports and runtime

- Confirm ESM imports work: `import { validateWorkflow } from "@journeys/core"`.
- Confirm types resolve from `"types"` and `"exports"` in `package.json`.
- Smoke-test in at least one example app after `pnpm pack` and local install.

## Documentation and governance

- Update [CHANGELOG.md](../CHANGELOG.md) and [docs/release-notes.md](release-notes.md).
- Confirm root and package license fields are `Apache-2.0`.
- Confirm [SECURITY.md](../SECURITY.md) contact path is current.

## Versioning (recommended: Changesets)

When ready for ongoing releases:

1. Add `@changesets/cli` as a dev dependency.
2. Run `pnpm changeset init` and configure `.changeset/config.json` for the
   monorepo (publish `@journeys/core`; keep private workspace packages
   internal).
3. Contributors add changesets in PRs; maintainers run `pnpm changeset version`
   and `pnpm changeset publish` locally after review.

Until Changesets is wired up, bump `packages/core/package.json` version manually
and tag in git.

## Publish

```bash
pnpm --filter @journeys/core publish --dry-run --access public
pnpm --filter @journeys/core publish --access public
```

After publish:

- Verify the npm package page shows README and license.
- Add npm version badge to README when appropriate.
- Announce in release notes / GitHub release.

## Post-1.0 support

After 1.0.0, security fixes target the current major version only. See
[SECURITY.md](../SECURITY.md).
