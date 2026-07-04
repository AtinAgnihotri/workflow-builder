# PRP 005: Release, OSS, And Governance

## Goal

Prepare the project for open source release and npm publishing.

## Context To Read First

- `internal/06-docs-site-and-oss-strategy.md`
- `internal/07-implementation-roadmap.md`

## Files To Add

```text
LICENSE
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
CHANGELOG.md
.github/workflows/ci.yml
.github/ISSUE_TEMPLATE/bug_report.md
.github/ISSUE_TEMPLATE/feature_request.md
.github/pull_request_template.md
.github/FUNDING.yml
```

Only add `FUNDING.yml` if the maintainer has a real funding target.

## Subagent Guidance

This PRP can be parallelized:

- CI subagent: GitHub Actions and package validation commands.
- Governance subagent: contributing, code of conduct, security policy.
- Templates subagent: issue templates and PR template.
- Release subagent: changelog, changesets recommendation, publish checklist.

The lead agent must confirm license metadata matches across all package files
and that CI commands reflect the actual package manager.

## License

Use Apache 2.0 unless the maintainer explicitly chooses MIT.

Ensure:

- root `package.json` license field is `Apache-2.0`
- package license fields match
- README mentions license

## CI

CI should run:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

CI must preserve the package age gate. Do not pass flags that bypass package
manager security settings except in a separately reviewed emergency security
fix.

## Release Tooling

Recommended:

- Changesets for versioning and changelog
- GitHub Actions for CI
- manual npm publish at first
- automated publish only after package contents are verified

## Package Publish Checklist

Before publishing:

- `pnpm build`
- `pnpm test`
- confirm package-manager config enforces the 1-day package age gate where
  supported
- inspect dependency tree and confirm dependency justifications are still true
- inspect `packages/core/dist`
- run `npm pack --dry-run` in `packages/core`
- confirm README and license are included
- confirm package exports work in ESM
- confirm package exports work in CJS if CJS is supported

## Governance

Use maintainer-led governance for V1:

- maintainer decides roadmap
- issues and discussions collect feedback
- PRs require tests for behavior changes
- schema changes require docs updates

## Security Policy

Mention:

- no arbitrary code execution by design
- imported JSON is untrusted input
- report vulnerabilities through GitHub Security Advisories or maintainer email
- supported versions are latest minor until 1.0, then current major

## Donation Setup

Donation support is optional. If added:

- use GitHub Sponsors or Open Collective
- add `.github/FUNDING.yml`
- add a short README support section
- do not add install-time prompts
- do not add runtime banners

## Acceptance Criteria

- CI passes.
- License is present and package metadata matches.
- Contribution and security docs exist.
- Release checklist is documented.
- npm dry run shows expected package files only.
- release/governance changes are committed separately from product or runtime
  code changes.
