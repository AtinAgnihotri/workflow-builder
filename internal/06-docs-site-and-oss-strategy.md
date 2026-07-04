# Docs Site And OSS Strategy

## Docs Site

Start with GitHub Pages served from `docs/`. Maintainer and agent material lives in
`internal/` and is not published to Pages.

Required pages:

- overview
- quickstart
- workflow JSON schema
- evaluator API
- builder UI guide
- examples
- release notes
- contributing
- license and governance

The current docs are Markdown-first so GitHub Pages can publish them with low
maintenance. A static site generator can be introduced later.

## Suggested Docs Navigation

```text
Overview
Quickstart
Core Concepts
JSON Schema
Evaluation
Builder UI
Examples
  Vanilla TypeScript
  React
  React Router
  TanStack Router
  Next.js
  Edge Runtime
OSS
  Contributing
  Governance
  License
  Support
```

## Quickstart Shape

The eventual quickstart should look like this:

```bash
pnpm add @journeys/core
```

```ts
import { evaluateNext, validateWorkflow } from "@journeys/core";

const validation = validateWorkflow(workflow);
if (!validation.valid) {
  console.error(validation.issues);
}

const result = evaluateNext(workflow, {
  currentNodeId: workflow.startNodeId,
  context: { loanValueRatio: 74 },
});
```

## License Recommendation

Use Apache License 2.0.

Why:

- enterprise-friendly
- widely understood
- permissive
- includes explicit patent grant
- preserves copyright notice
- compatible with commercial adoption

MIT is also enterprise-friendly and simpler, but Apache 2.0 is a better default
when the goal is broad business adoption with explicit patent language.

Add:

- `LICENSE` with Apache 2.0 text
- copyright owner
- `NOTICE` if needed later
- SPDX headers only if the project wants stricter provenance

## Contribution Setup

Add:

- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- issue templates
- PR template
- security policy

Keep governance lightweight:

- maintainer-led project
- public roadmap in GitHub issues or discussions
- semantic versioning
- changesets for releases

## Donation Strategy

Do not make donations the first thing users see.

Appropriate places:

- GitHub Sponsors button if the maintainer account supports it
- `FUNDING.yml`
- short "Support" section in README
- optional Open Collective later if multiple maintainers emerge

Tone:

- useful, small, and ignorable
- no popups
- no install-time donation messages
- no runtime banners

Example copy:

```md
## Support

If Journeys saves you time, sponsorship helps fund maintenance,
examples, and documentation. Adoption and feedback are also valuable.
```

## OSS Launch Strategy

### Phase 1: Private Build

Goal: credible MVP.

Do before public launch:

- publish core package API docs
- include builder screenshot or short video
- provide three runnable examples
- document schema
- document non-goals
- add tests and CI badge
- add license

### Phase 2: Friendly Feedback

Share with small, high-signal communities:

- TypeScript developers who build internal tools
- product engineering groups
- workflow/rules-engine discussions
- Discord communities around TypeScript, React, and full-stack tooling
- maintainers or creators who discuss developer tooling

When posting, lead with a concrete use case:

> I built a small TS library plus builder UI for product-editable user journeys.
> It exports plain JSON adjacency lists instead of a DSL. I would love feedback
> on the schema and whether adapters are worth building.

Ask focused questions:

- Is the JSON shape readable?
- Would your team trust product users to edit this?
- Are examples enough, or would you expect framework adapters?
- What operator is missing from V1?

### Phase 3: Public Launch

Potential channels:

- GitHub Discussions
- Hacker News "Show HN"
- Reddit communities focused on TypeScript, webdev, and SaaS builders
- Discord servers for TypeScript and full-stack developer communities
- X/Twitter posts with a short demo clip
- LinkedIn post targeting product engineering and internal tools
- relevant newsletters after the repo has examples and screenshots

Avoid overclaiming. This is not a replacement for every BPMN, rules engine, or
feature flag platform. It is a lightweight JSON journey library for application
journeys and business-configurable branching.

## Positioning

Use phrases like:

- "product-editable workflows as JSON"
- "framework-agnostic TypeScript evaluator"
- "visual builder for adjacency-list workflows"
- "no DSL, no runtime code execution"
- "bring your own router, state, and UI"

Avoid phrases like:

- "Zapier alternative"
- "full workflow automation platform"
- "AI journey builder"
- "enterprise rules engine replacement"

## Repo Badges

Add badges only after they are true:

- CI
- npm version
- license
- type coverage if used

## Release Strategy

Use semantic versioning:

- patch: bug fixes and docs
- minor: new operators, helpers, examples, non-breaking UI improvements
- major: schema meaning changes or breaking API changes

Use pre-1.0 versions while schema is still changing:

```text
0.1.0: core validator and evaluator
0.2.0: builder UI MVP
0.3.0: examples and docs site
0.4.0: import/export polish and launch prep
1.0.0: stable schema V1 and documented compatibility promise
```

## Enterprise Adoption Checklist

Before pitching enterprise users, ensure:

- Apache 2.0 license
- no telemetry by default
- no hosted service dependency
- deterministic evaluator
- schema docs
- changelog
- security policy
- dependency-light core
- minimum 1-day package age gate for installs where package-manager support is
  available
- documented justification for each new dependency
- clear browser and Node support matrix
- examples that show manual integration
