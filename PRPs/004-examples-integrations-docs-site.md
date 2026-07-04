# PRP 004: Examples And Docs Site

## Goal

Create runnable examples and publishable docs that explain how developers use
Journeys in real applications.

## Context To Read First

- `docs/05-integration-and-adapters.md`
- `docs/06-docs-site-and-oss-strategy.md`
- `docs/07-implementation-roadmap.md`

## Examples To Build

Create:

```text
examples/vanilla
examples/react-local-state
examples/react-router
examples/tanstack-router
examples/next
examples/edge-runtime
```

If time is limited, prioritize:

1. vanilla
2. react-local-state
3. react-router

## Subagent Guidance

This PRP is highly parallelizable after the core package can be imported:

- Vanilla/edge subagent: `examples/vanilla` and `examples/edge-runtime`.
- React subagent: `examples/react-local-state`.
- Router subagent: `examples/react-router` and `examples/tanstack-router`.
- Next subagent: `examples/next`.
- Docs subagent: quickstart, API, examples index, and ADR.

The lead agent should run the examples that are feasible locally and ensure all
examples teach the same integration contract.

## Example Requirements

Each example must include:

- `README.md`
- a small workflow JSON file or TS object
- context mapping function
- node interpretation logic
- command to run
- explanation of what product edits vs what developer owns

## Vanilla Example

Should show:

- loading workflow object
- validating it
- evaluating from start node
- printing next node

## React Local State Example

Should show:

- React state containing current node
- runtime state helpers for current node, previous node, and possible next nodes
- app state mapped to workflow context
- next button calls `advanceWorkflow`
- screen changes without router

## React Router Example

Should show:

- node ID to route mapping, or route in node data
- `useNavigate`
- fallback when no edge matches

## TanStack Router Example

Should show the same concept as React Router, but with TanStack Router idioms.

## Next Example

Keep it client-side for V1. Do not create server complexity unless needed.

## Edge Runtime Example

Show a request handler that evaluates a workflow and returns JSON.

## Docs Site

Keep docs in `docs/` and make them GitHub Pages friendly.

Add pages:

```text
docs/quickstart.md
docs/api.md
docs/examples.md
docs/contributing.md
docs/release-notes.md
```

Update `docs/index.md` to link to them.

## Adapter Decision Record

Add a short document:

```text
docs/adr/001-examples-before-adapters.md
```

Record:

- decision: examples before adapters
- status: accepted
- context
- consequences
- criteria for revisiting

## Acceptance Criteria

- At least three examples run locally.
- Examples import the local core package.
- Docs link to examples.
- Adapter decision is documented.
- README links to docs and examples.
- examples and docs-site work are committed in logical chunks so broken examples
  do not get hidden inside broad documentation commits.
