"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { evaluateNext } from "@workflow-builder/core";
import { mapContext, workflow } from "../lib/workflow";

const routeByNodeId: Record<string, string> = {
  offer: "/offer",
  review: "/review",
};

export default function HomePage() {
  const router = useRouter();
  const [lvr, setLvr] = useState(65);
  const context = useMemo(() => mapContext(lvr), [lvr]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Next.js client example</h1>
      <label>
        Loan value ratio:
        <input
          type="number"
          value={lvr}
          onChange={(event) => setLvr(Number(event.target.value))}
        />
      </label>
      <button
        type="button"
        onClick={() => {
          const result = evaluateNext(workflow, {
            currentNodeId: workflow.startNodeId,
            context,
          });

          if (result.status === "matched") {
            router.push(routeByNodeId[result.nextNode.id] ?? "/fallback");
          } else {
            router.push("/fallback");
          }
        }}
      >
        Evaluate and navigate
      </button>
    </main>
  );
}
