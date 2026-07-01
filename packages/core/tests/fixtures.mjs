export const basicWorkflow = {
  schemaVersion: "1.0",
  id: "loan-demo",
  name: "Loan Demo",
  startNodeId: "start",
  nodes: {
    start: { id: "start", label: "Start", type: "start" },
    offer: { id: "offer", label: "Offer", type: "screen" },
    review: { id: "review", label: "Review", type: "screen" },
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
        id: "fallback-review",
        from: "start",
        to: "review",
        priority: 100,
        when: { always: true },
      },
    ],
  },
};

export const priorityWorkflow = {
  schemaVersion: "1.0",
  id: "priority-demo",
  name: "Priority Demo",
  startNodeId: "start",
  nodes: {
    start: { id: "start", label: "Start" },
    a: { id: "a", label: "A" },
    b: { id: "b", label: "B" },
    c: { id: "c", label: "C" },
  },
  edges: {
    start: [
      {
        id: "edge-b",
        from: "start",
        to: "b",
        priority: 10,
        when: {
          all: [{ field: "pick", operator: "eq", value: "b" }],
        },
      },
      {
        id: "edge-a",
        from: "start",
        to: "a",
        priority: 10,
        when: {
          all: [{ field: "pick", operator: "eq", value: "a" }],
        },
      },
      {
        id: "edge-c",
        from: "start",
        to: "c",
        priority: 20,
        when: { always: true },
      },
    ],
  },
};

export const linearWorkflow = {
  schemaVersion: "1.0",
  id: "linear",
  name: "Linear",
  startNodeId: "a",
  nodes: {
    a: { id: "a", label: "A" },
    b: { id: "b", label: "B", type: "terminal" },
    orphan: { id: "orphan", label: "Orphan" },
  },
  edges: {
    a: [
      {
        id: "a-to-b",
        from: "a",
        to: "b",
        when: { always: true },
      },
    ],
  },
};
