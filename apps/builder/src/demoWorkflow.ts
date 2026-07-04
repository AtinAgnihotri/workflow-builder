import type { WorkflowDefinition } from "@journeys/core";

export const demoWorkflow: WorkflowDefinition = {
  schemaVersion: "1.0",
  id: "loan-demo",
  name: "Loan Demo",
  description: "Routes an applicant based on loan value ratio.",
  startNodeId: "start",
  nodes: {
    start: {
      id: "start",
      label: "Start",
      type: "start",
      metadata: { builder: { position: { x: 80, y: 180 } } },
    },
    offer: {
      id: "offer",
      label: "Offer",
      type: "screen",
      metadata: { builder: { position: { x: 420, y: 80 } } },
    },
    review: {
      id: "review",
      label: "Manual Review",
      type: "screen",
      metadata: { builder: { position: { x: 420, y: 280 } } },
    },
  },
  edges: {
    start: [
      {
        id: "low-lvr",
        from: "start",
        to: "offer",
        priority: 10,
        when: {
          all: [{ field: "loanValueRatio", operator: "lt", value: 70 }],
        },
      },
      {
        id: "fallback",
        from: "start",
        to: "review",
        priority: 100,
        when: { always: true },
      },
    ],
  },
};

export const defaultSampleContextJson = JSON.stringify(
  {
    loanValueRatio: 74,
    country: "GB",
  },
  null,
  2
);
