# ADR 001: Examples Before Adapters

## Status

Accepted

## Context

Journeys integrates with many host environments: vanilla TypeScript,
React, multiple routers, Next.js, edge workers, and assorted state libraries.
Framework-specific adapter packages (`@journeys/react`, router wrappers,
etc.) would multiply maintenance and peer-dependency surface area before real
integration patterns are proven.

The core evaluator is already small. Most framework differences sit in three
application-owned concerns:

1. mapping host state to workflow context
2. interpreting node ids (routes, screens, actions)
3. performing side effects after a match

## Decision

Ship **runnable examples first** and defer framework adapter packages until
repeated boilerplate appears across at least two production-like examples.

Examples must teach one shared integration contract and import
`@journeys/core` directly.

## Consequences

### Positive

- Lower maintenance during schema iteration
- Examples stay readable and copy-paste friendly
- Adapters can be designed from evidence, not speculation
- Core package remains the single source of validation/evaluation truth

### Negative

- Host apps copy a few lines of glue code initially
- No branded hooks such as `useWorkflow` in V1
- Framework communities may expect first-party adapters sooner

## Criteria for revisiting

Create an adapter only when **all** are true:

- at least two examples repeat the same integration code
- the adapter is roughly < 100 lines of runtime code
- the adapter does not hide core concepts
- peer dependencies are stable
- tests cover the adapter without heavy app setup

## References

- [Integration and adapters](../05-integration-and-adapters.md)
- [Examples index](../examples.md)
