# workflow-builder

[![CI](https://github.com/AtinAgnihotri/workflow-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/AtinAgnihotri/workflow-builder/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Workflow Builder is a planned TypeScript library and builder UI for representing
business-configurable workflows as plain JSON adjacency lists.

The source prompt for the project lives in [main-prompt.md](main-prompt.md).
This repository currently contains the detailed product, architecture, schema,
UI, integration, release, and PRP docs needed for an implementation agent to
build the first version.

## Start Here

- [Quickstart](docs/quickstart.md)
- [API reference](docs/api.md)
- [Examples](docs/examples.md) — runnable code in [`examples/`](examples/)
- [Product brief](docs/00-product-brief.md)
- [Architecture](docs/01-architecture.md)
- [Workflow JSON schema](docs/02-workflow-json-schema.md)
- [Evaluation engine](docs/03-evaluation-engine.md)
- [Builder UI spec](docs/04-builder-ui-spec.md)
- [Integration and adapters](docs/05-integration-and-adapters.md)
- [Docs site and OSS strategy](docs/06-docs-site-and-oss-strategy.md)
- [Implementation roadmap](docs/07-implementation-roadmap.md)
- [Contributing](CONTRIBUTING.md)
- [Contributing (dev guide)](docs/contributing.md)
- [Release notes](docs/release-notes.md)
- [Agent orchestration plan](docs/08-agent-orchestration.md)
- [Portable agent skill spec](docs/09-portable-agent-skill.md)
- [Portable Workflow Builder skill](skills/workflow-builder/SKILL.md)

## PRPs

The PRPs are written for a less capable implementation model. They include
scope, file targets, pseudocode, validation requirements, and acceptance
criteria.

- [PRP 001: Repo scaffold and core package](PRPs/001-repo-scaffold-core-package.md)
- [PRP 002: Schema validation and evaluator](PRPs/002-workflow-schema-validation-evaluator.md)
- [PRP 003: Builder UI MVP](PRPs/003-builder-ui-mvp.md)
- [PRP 004: Examples and docs site](PRPs/004-examples-integrations-docs-site.md)
- [PRP 005: Release, OSS, and governance](PRPs/005-release-oss-governance.md)
- [PRP 006: Portable agent skill](PRPs/006-portable-agent-skill.md)

## Implementation Direction

Build the core package first. Keep it framework agnostic, dependency-light, and
safe to run in browsers, Node.js, and edge runtimes. Build the UI only after the
schema, validator, and evaluator are stable enough to import from the package.
When using Cursor or another harness with subagents, use
[the orchestration plan](docs/08-agent-orchestration.md) to parallelize
independent work while keeping schema decisions centralized.

The recommended initial package structure is:

```text
packages/core
apps/builder
examples
docs
PRPs
```

The initial public API should focus on:

- defining workflow JSON types
- validating workflow definitions
- evaluating the next node from a context object
- tracking runtime workflow position with current node, previous node, history,
  and possible next-node inspection
- exporting and importing JSON safely
- showing integration examples before committing to framework adapters

## Agent Skill

The repo includes a portable Markdown skill at
[skills/workflow-builder/SKILL.md](skills/workflow-builder/SKILL.md). Agents in
Cursor, OpenCode, Claude Code, Codex, T3Code-style harnesses, and similar tools
can ingest it to understand how to validate, edit, and integrate Workflow
Builder JSON without inventing a DSL or taking over app routing/state.

## License

Licensed under the [Apache License 2.0](LICENSE).
