# Product Brief

## One-Sentence Summary

Workflow Builder lets teams model product journeys, rules engines, and other
decision flows as plain JSON adjacency lists, then edit those flows in a visual
UI without requiring product users to write code.

## Problem

Many applications contain flows that change more often than the surrounding
software:

- onboarding journeys
- loan or insurance decision paths
- conditional UI cards
- eligibility screens
- routing through forms
- rules-based escalation paths
- experimentation paths

Today, those decisions are usually embedded in framework code, router config,
feature flag conditionals, or ad hoc JSON formats. Product teams need developer
support for small threshold changes, and developers end up maintaining brittle
business logic that should be configurable.

## Goals

- Represent workflows as JSON, not as a custom DSL.
- Use an adjacency-list graph shape.
- Treat nodes as workflow states or destinations.
- Treat edges as weighted transitions where the weight is a structured group of
  operands and operators.
- Keep the core TypeScript package framework agnostic.
- Run the core package in browsers, Node.js, Cloudflare Workers, and similar JS
  runtimes.
- Provide a builder UI for non-technical users.
- Export JSON that developers can wire to their application manually or through
  a pipeline.
- Provide examples for React, non-React, routers, and state-management tools
  before committing to adapter packages.
- Publish as an open source package that enterprise developers can adopt
  without license anxiety.

## Non-Goals For V1

- Do not invent a textual expression DSL.
- Do not use `eval`, `new Function`, or arbitrary JavaScript execution.
- Do not require React in the core package.
- Do not require a backend service for the core package.
- Do not build a full workflow automation platform.
- Do not implement persistence, authentication, collaboration, or approvals in
  the first UI unless they are needed for local import/export.
- Do not attempt framework adapters before examples prove repeated boilerplate.

## Primary Users

### Developer

The developer integrates the core package into an application. They map app
state into a workflow context and decide what a node means in their product.

Example mapping:

```ts
const workflowContext = {
  applicantName: user.profile.name,
  firstLoanLvr: state.loanApplications[0]?.lvr,
  secondLoanLvr: state.loanApplications[1]?.lvr,
  country: state.address.country,
};
```

The developer decides that node `loan-summary` maps to a route, page, card,
service action, or other application behavior.

### Product Or Operations User

The product user edits rules in a visual builder. They should be able to change
thresholds such as `firstLoanLvr < 70` to `firstLoanLvr < 80` without editing
application code.

### Maintainer

The maintainer keeps the schema stable, writes migration paths, publishes
packages, manages docs, reviews issues, and decides when examples should become
official adapters.

## Core Concepts

### Workflow

A named, versioned graph with a start node.

### Node

A point in a workflow. A node may represent a route, UI view, content card,
decision state, terminal state, or any other host-application concept.

### Edge

A directed transition from one node to another. Edges are stored in an adjacency
list keyed by source node ID.

### Edge Weight

The condition group that decides whether an edge can be taken. The term
"weight" should be documented as a business-rule weight, not a numeric graph
weight. A weight is made of operands such as:

```json
{ "field": "name", "operator": "eq", "value": "John Doe" }
```

```json
{ "field": "age", "operator": "gte", "value": 29 }
```

```json
{ "field": "address", "operator": "contains", "value": "London" }
```

### Context

Runtime data supplied by the host app. The workflow does not know where context
values came from. It only evaluates keys and values.

## V1 Success Criteria

- A developer can install `@journeys/core`.
- A developer can define a workflow JSON object with nodes and adjacency-list
  edges.
- A developer can validate a workflow and get actionable errors.
- A developer can evaluate a current node plus context and get the next node.
- A developer can track runtime workflow position, including current node,
  previous node, transition history, and possible next nodes.
- A non-technical user can build a simple graph in the UI and export JSON.
- The exported JSON can be pasted into an example application and used without
  translation.
- Docs explain how to map app state into workflow context.
- Docs explain how to host the builder internally or use it locally.

## Example User Journey

1. Developer defines application destinations:

```ts
const destinations = {
  start: "/loan/start",
  lowLvrOffer: "/loan/low-lvr",
  highLvrReview: "/loan/review",
  fallback: "/loan/manual",
};
```

2. Product user creates edges:

```json
{
  "start": [
    {
      "id": "edge-low-lvr",
      "from": "start",
      "to": "lowLvrOffer",
      "priority": 10,
      "when": {
        "all": [
          { "field": "firstLoanLvr", "operator": "lt", "value": 70 }
        ]
      }
    },
    {
      "id": "edge-high-lvr",
      "from": "start",
      "to": "highLvrReview",
      "priority": 20,
      "when": {
        "all": [
          { "field": "firstLoanLvr", "operator": "gte", "value": 70 }
        ]
      }
    }
  ]
}
```

3. Developer evaluates:

```ts
const result = evaluateNext(workflow, {
  currentNodeId: "start",
  context: { firstLoanLvr: 74 },
});

// result.status === "matched"
// result.nextNode.id === "highLvrReview"
```
