import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { evaluateNext } from "@workflow-builder/core";
import { mapContext, routeForNode, workflow } from "./workflow";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});

const offerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/offer",
  component: () => <h1>Offer</h1>,
});

const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/review",
  component: () => <h1>Manual Review</h1>,
});

const routeTree = rootRoute.addChildren([indexRoute, offerRoute, reviewRoute]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function IndexPage() {
  const navigate = useNavigate();

  return (
    <section style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Start</h1>
      <button
        type="button"
        onClick={() => {
          const result = evaluateNext(workflow, {
            currentNodeId: "start",
            context: mapContext(65),
          });

          if (result.status === "matched") {
            navigate({ to: routeForNode(result.nextNode.id) });
          }
        }}
      >
        Continue with LVR 65
      </button>
    </section>
  );
}
