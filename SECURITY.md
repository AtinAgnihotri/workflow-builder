# Security Policy

## Design posture

Journeys is designed **not** to execute arbitrary code:

- Conditions are structured JSON trees (`field`, `operator`, `value`), not
  expression strings.
- The evaluator does not use `eval`, `new Function`, or similar dynamic code
  execution.
- Host applications own routing, rendering, and side effects.

## Untrusted input

Workflow JSON imported from users, files, or APIs should be treated as
**untrusted input**. Always run `validateWorkflow` (or equivalent) before
evaluation, and never pass unvalidated JSON directly into application logic that
assumes schema correctness.

## Supported versions

| Version | Supported |
| --- | --- |
| Latest minor on `main` (pre-1.0) | Yes |
| After 1.0.0 | Current major only |

Security fixes are applied to the latest release line. Upgrade to the newest
patch or minor when possible.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report them through one of:

1. [GitHub Security Advisories](https://github.com/advisories) for this
   repository (preferred when enabled), or
2. A private message to the repository maintainer.

Include:

- Affected package and version (or commit SHA)
- Steps to reproduce
- Impact assessment
- Suggested fix if you have one

We aim to acknowledge reports within a few business days and will coordinate
disclosure timing with the reporter.

## Dependency policy

The core package stays dependency-light. New dependencies require justification
and should respect the 1-day package age gate configured in `.npmrc` for this
repository.
