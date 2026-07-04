# Integration And Adapters

## Recommendation

Do not build framework adapter packages in V1. Build examples first.

Reasoning:

- The core evaluator is already small.
- Frameworks differ mostly in where state comes from and what action is taken
  after a node is selected.
- Premature adapters create maintenance burden across React, Vue, Svelte, Solid,
  routers, and meta-frameworks.
- Good examples can prove real integration patterns before the project commits
  to package APIs.

Revisit adapters after the examples reveal repeated, stable boilerplate.

## Integration Contract

Every host application owns three things:

1. context mapping
2. node interpretation
3. side effects

The core package owns only validation and evaluation.

```ts
const context = mapAppStateToWorkflowContext(appState);
const result = evaluateNext(workflow, { currentNodeId, context });
applyWorkflowResult(result);
```

If the app wants Workflow Builder to track position and history, use the runtime
state helpers:

```ts
const state = createWorkflowState(workflow);
const snapshot = inspectWorkflowState(workflow, { state, context });
const advanced = advanceWorkflow(workflow, { state, context });
```

The host app still owns where that state is stored.

## Context Mapping Pattern

Do this:

```ts
function mapLoanStateToWorkflowContext(state: LoanState) {
  return {
    firstLoanLvr: state.loanApplications[0]?.lvr,
    secondLoanLvr: state.loanApplications[1]?.lvr,
    applicantCountry: state.applicant.address.country,
    applicantAge: state.applicant.age,
  };
}
```

Avoid exposing raw app state paths directly to product users in V1. Product
users should edit stable workflow field names such as `firstLoanLvr`, not
implementation paths like `useState.loanApplications[0].lvr`.

## Node Interpretation Pattern

Nodes can be interpreted several ways.

Route mapping:

```ts
const routeByNodeId = {
  start: "/loan/start",
  offer: "/loan/offer",
  review: "/loan/review",
};
```

Node data:

```json
{
  "id": "offer",
  "label": "Offer",
  "type": "screen",
  "data": {
    "route": "/loan/offer",
    "component": "OfferScreen"
  }
}
```

Use external maps when application details should not live in workflow JSON. Use
node `data` when the workflow JSON is expected to carry destination metadata.

## Vanilla TypeScript Example

```ts
import { evaluateNext } from "@journeys/core";

const result = evaluateNext(workflow, {
  currentNodeId: "start",
  context: { firstLoanLvr: 72 },
});

if (result.status === "matched") {
  console.log("Next node:", result.nextNode.id);
}
```

## React Example

```tsx
import {
  advanceWorkflow,
  createWorkflowState,
  inspectWorkflowState,
} from "@journeys/core";

function LoanJourney({ workflow, loanState }) {
  const [workflowState, setWorkflowState] = useState(() =>
    createWorkflowState(workflow)
  );

  const context = useMemo(
    () => ({
      firstLoanLvr: loanState.loanApplications[0]?.lvr,
      applicantCountry: loanState.applicant.address.country,
    }),
    [loanState]
  );

  const snapshot = inspectWorkflowState(workflow, {
    state: workflowState,
    context,
  });

  function next() {
    const result = advanceWorkflow(workflow, {
      state: workflowState,
      context,
    });

    if (result.status === "advanced") {
      setWorkflowState(result.state);
    }
  }

  return (
    <ScreenForNode
      nodeId={workflowState.currentNodeId}
      previousNodeId={workflowState.previousNodeId}
      possibleNext={snapshot.possibleNext}
      onNext={next}
    />
  );
}
```

## React Router Example

```tsx
function useWorkflowNavigation(workflow, currentNodeId, loanState) {
  const navigate = useNavigate();

  return () => {
    const context = mapLoanStateToWorkflowContext(loanState);
    const result = evaluateNext(workflow, { currentNodeId, context });

    if (result.status === "matched") {
      navigate(result.nextNode.data.route);
    }
  };
}
```

## Zustand Example

```ts
const useLoanStore = create((set, get) => ({
  currentNodeId: "start",
  loanApplications: [],
  goNext(workflow) {
    const state = get();
    const result = evaluateNext(workflow, {
      currentNodeId: state.currentNodeId,
      context: {
        firstLoanLvr: state.loanApplications[0]?.lvr,
      },
    });

    if (result.status === "matched") {
      set({ currentNodeId: result.nextNode.id });
    }
  },
}));
```

## Edge Runtime Example

```ts
export default {
  async fetch(request) {
    const input = await request.json();
    const result = evaluateNext(workflow, {
      currentNodeId: input.currentNodeId,
      context: input.context,
    });

    return Response.json(result);
  },
};
```

## When To Build Adapters

Build an adapter only when all of these are true:

- at least two real examples repeat the same integration code
- the adapter can be less than roughly 100 lines of runtime code
- the adapter does not hide the core concepts
- the adapter's peer dependency is stable
- tests can cover the adapter without complex app setup

Potential future adapters:

- `@journeys/react`
- `@journeys/react-router`
- `@journeys/tanstack-router`

Avoid adapters for every state library. State mapping is usually application
specific and better documented with examples.

## Proposed React Hook If Needed Later

```ts
function useWorkflow(workflow, options) {
  const [currentNodeId, setCurrentNodeId] = useState(
    options.initialNodeId ?? workflow.startNodeId
  );

  const result = useMemo(
    () =>
      evaluateNext(workflow, {
        currentNodeId,
        context: options.context,
      }),
    [workflow, currentNodeId, options.context]
  );

  const goNext = useCallback(() => {
    if (result.status === "matched") {
      setCurrentNodeId(result.nextNode.id);
      options.onTransition?.(result);
    }
    return result;
  }, [result, options]);

  return { currentNodeId, setCurrentNodeId, result, goNext };
}
```

Do not implement this hook until examples prove it is useful.
