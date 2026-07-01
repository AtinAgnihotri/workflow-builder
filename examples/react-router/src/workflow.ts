import type { WorkflowDefinition } from "@workflow-builder/core";

export const workflow: WorkflowDefinition = {
  schemaVersion: "1.0",
  id: "loan-demo",
  name: "Loan Demo",
  startNodeId: "start",
  nodes: {
    start: {
      id: "start",
      label: "Start",
      type: "start",
      data: { route: "/" },
    },
    offer: {
      id: "offer",
      label: "Offer",
      type: "screen",
      data: { route: "/offer" },
    },
    review: {
      id: "review",
      label: "Manual Review",
      type: "screen",
      data: { route: "/review" },
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

export type LoanAppState = {
  loanApplications: Array<{ lvr: number }>;
};

export function mapLoanAppToWorkflowContext(appState: LoanAppState) {
  return {
    loanValueRatio: appState.loanApplications[0]?.lvr,
  };
}

export const routeByNodeId: Record<string, string> = {
  start: "/",
  offer: "/offer",
  review: "/review",
};

export function routeForNode(nodeId: string): string {
  const node = workflow.nodes[nodeId];
  const dataRoute =
    node?.data && typeof node.data.route === "string" ? node.data.route : undefined;
  return dataRoute ?? routeByNodeId[nodeId] ?? "/fallback";
}
