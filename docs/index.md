# Workflow Builder Docs

Workflow Builder is a framework-agnostic TypeScript toolkit for creating and
evaluating workflows represented as JSON adjacency lists.

These docs are intentionally detailed because implementation will be delegated
to an agent that should not need to re-reason the product from first principles.

## Reading Order

1. [Product brief](00-product-brief.md)
2. [Architecture](01-architecture.md)
3. [Workflow JSON schema](02-workflow-json-schema.md)
4. [Evaluation engine](03-evaluation-engine.md)
5. [Builder UI spec](04-builder-ui-spec.md)
6. [Integration and adapters](05-integration-and-adapters.md)
7. [Docs site and OSS strategy](06-docs-site-and-oss-strategy.md)
8. [Implementation roadmap](07-implementation-roadmap.md)
9. [Agent orchestration](08-agent-orchestration.md)
10. [Portable agent skill](09-portable-agent-skill.md)

## Getting Started

- [Quickstart](quickstart.md)
- [API reference](api.md)
- [Examples index](examples.md)
- [Contributing](../CONTRIBUTING.md)
- [Contributing (dev guide)](contributing.md)
- [Release notes](release-notes.md)
- [Release checklist](release-checklist.md)

## Decisions

- [ADR 001: Examples before adapters](adr/001-examples-before-adapters.md)

## Core Promise

A developer maps application state into a stable workflow context. Product or
operations users edit workflow rules in a UI. The system exports plain JSON that
can be stored, reviewed, versioned, and evaluated anywhere JavaScript runs.
