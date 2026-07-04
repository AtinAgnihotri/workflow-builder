import type { WorkflowDefinition } from "@journeys/core";

export const workflow: WorkflowDefinition = {
  schemaVersion: "1.0",
  id: "loan-demo",
  name: "Loan Demo",
  startNodeId: "start",
  nodes: {
    start: { id: "start", label: "Start", type: "start" },
    offer: { id: "offer", label: "Offer", type: "screen", data: { route: "/offer" } },
    review: { id: "review", label: "Review", type: "screen", data: { route: "/review" } },
  },
  edges: {
    start: [
      {
        id: "low-lvr",
        from: "start",
        to: "offer",
        priority: 10,
        when: { all: [{ field: "loanValueRatio", operator: "lt", value: 70 }] },
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

export function mapContext(lvr: number) {
  return { loanValueRatio: lvr };
}

export function routeForNode(nodeId: string): string {
  const node = workflow.nodes[nodeId];
  const route = node?.data?.route;
  return typeof route === "string" ? route : "/";
}
