import { describe, expect, it } from "vitest";
import { validateWorkflow, serializeWorkflow } from "@journeys/core";
import { demoWorkflow } from "../demoWorkflow";
import { computePreview, tryImportWorkflow } from "./preview";
import { copyWorkflowJson } from "./export";

describe("import flow", () => {
  it("preserves draft when import JSON is invalid", () => {
    const draft = structuredClone(demoWorkflow);
    const parsed = tryImportWorkflow("{");
    expect(parsed.ok).toBe(false);
    expect(validateWorkflow(draft).valid).toBe(true);
    expect(draft.name).toBe("Loan Demo");
  });
});

describe("export flow", () => {
  it("produces core-valid JSON", () => {
    const exported = copyWorkflowJson(demoWorkflow);
    const parsed = tryImportWorkflow(exported);
    expect(parsed.ok).toBe(true);
    expect(validateWorkflow(JSON.parse(serializeWorkflow(demoWorkflow))).valid).toBe(
      true
    );
  });
});

describe("preview flow", () => {
  it("calls evaluator with sample context", () => {
    const previewState = {
      currentNodeId: "start",
      history: [],
    };

    const result = computePreview(
      demoWorkflow,
      previewState,
      JSON.stringify({ loanValueRatio: 60 })
    );

    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.evaluation.status).toBe("matched");
      if (result.evaluation.status === "matched") {
        expect(result.evaluation.nextNode.id).toBe("offer");
      }
    }
  });
});
