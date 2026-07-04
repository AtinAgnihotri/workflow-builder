import { useState } from "react";
import type {
  Condition,
  ConditionGroup,
  ConditionNode,
  JsonValue,
  Operator,
} from "@journeys/core";
import { ALL_OPERATORS } from "../lib/operators";
import {
  formatConditionValue,
  inferValueKind,
  operatorRequiresValue,
  parseConditionValue,
  type ValueInputKind,
} from "../lib/workflowMutations";

type ConditionGroupEditorProps = {
  group: ConditionGroup;
  onChange: (group: ConditionGroup) => void;
  depth?: number;
  onRemove?: () => void;
};

function defaultComparison(): Condition {
  return {
    field: "fieldName",
    operator: "eq",
    value: "",
  };
}

function ConditionRowEditor({
  condition,
  onChange,
  onRemove,
}: {
  condition: Condition;
  onChange: (condition: Condition) => void;
  onRemove: () => void;
}) {
  const requiresValue = operatorRequiresValue(condition.operator);
  const valueKind = inferValueKind(condition.value);
  const [valueError, setValueError] = useState<string | null>(null);

  return (
    <div className="condition-row">
      <div className="field">
        <label>Field</label>
        <input
          value={condition.field}
          onChange={(event) => onChange({ ...condition, field: event.target.value })}
        />
      </div>
      <div className="field">
        <label>Operator</label>
        <select
          value={condition.operator}
          onChange={(event) => {
            const operator = event.target.value as Operator;
            const next: Condition = { ...condition, operator };
            if (!operatorRequiresValue(operator)) {
              delete next.value;
            } else if (next.value === undefined) {
              next.value = "";
            }
            onChange(next);
          }}
        >
          {ALL_OPERATORS.map((operator) => (
            <option key={operator} value={operator}>
              {operator}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Value type</label>
        <select
          value={valueKind}
          disabled={!requiresValue}
          onChange={(event) => {
            const kind = event.target.value as ValueInputKind;
            const parsed = parseConditionValue(kind, kind === "null" ? "null" : "");
            if (parsed.ok) {
              onChange({ ...condition, value: parsed.value });
              setValueError(null);
            }
          }}
        >
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="null">null</option>
          <option value="json">JSON</option>
        </select>
      </div>
      <div className="field">
        <label>Value</label>
        {valueKind === "boolean" && requiresValue ? (
          <select
            className="condition-row__value"
            value={String(condition.value ?? "true")}
            onChange={(event) => {
              const parsed = parseConditionValue("boolean", event.target.value);
              if (parsed.ok) {
                onChange({ ...condition, value: parsed.value });
              }
            }}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            className="condition-row__value"
            disabled={!requiresValue || valueKind === "null"}
            value={
              valueKind === "null"
                ? "null"
                : formatConditionValue(condition.value as JsonValue | undefined)
            }
            onChange={(event) => {
              const parsed = parseConditionValue(valueKind, event.target.value);
              if (parsed.ok) {
                onChange({ ...condition, value: parsed.value });
                setValueError(null);
              } else {
                setValueError(parsed.message);
              }
            }}
          />
        )}
        {valueError ? <span className="helper-text">{valueError}</span> : null}
      </div>
      <button type="button" className="button button--danger" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
}

function ConditionNodeEditor({
  node,
  onChange,
  onRemove,
  depth,
}: {
  node: ConditionNode;
  onChange: (node: ConditionNode) => void;
  onRemove?: () => void;
  depth: number;
}) {
  if ("field" in node && "operator" in node) {
    return (
      <ConditionRowEditor
        condition={node}
        onChange={onChange}
        onRemove={onRemove ?? (() => undefined)}
      />
    );
  }

  return (
    <ConditionGroupEditor
      group={node}
      onChange={onChange}
      depth={depth}
      onRemove={onRemove}
    />
  );
}

export function ConditionGroupEditor({
  group,
  onChange,
  depth = 0,
  onRemove,
}: ConditionGroupEditorProps) {
  const groupKind = "always" in group
    ? "always"
    : "all" in group
      ? "all"
      : "any" in group
        ? "any"
        : "not";

  const setKind = (kind: "always" | "all" | "any" | "not") => {
    switch (kind) {
      case "always":
        onChange({ always: true });
        break;
      case "all":
        onChange({ all: [defaultComparison()] });
        break;
      case "any":
        onChange({ any: [defaultComparison()] });
        break;
      case "not":
        onChange({ not: defaultComparison() });
        break;
    }
  };

  return (
    <div className="condition-group">
      <div className="inline-actions">
        <div className="field">
          <label>Group type</label>
          <select
            value={groupKind}
            onChange={(event) =>
              setKind(event.target.value as "always" | "all" | "any" | "not")
            }
          >
            <option value="always">always</option>
            <option value="all">all</option>
            <option value="any">any</option>
            <option value="not">not</option>
          </select>
        </div>
        {onRemove ? (
          <button type="button" className="button button--danger" onClick={onRemove}>
            Remove group
          </button>
        ) : null}
      </div>

      {groupKind === "always" ? (
        <p className="helper-text">This edge always matches when reached.</p>
      ) : null}

      {groupKind === "all" && "all" in group ? (
        <>
          {group.all.map((child, index) => (
            <ConditionNodeEditor
              key={index}
              node={child}
              depth={depth + 1}
              onChange={(next) => {
                const items = [...group.all];
                items[index] = next;
                onChange({ all: items });
              }}
              onRemove={() => {
                const items = group.all.filter((_, itemIndex) => itemIndex !== index);
                onChange({ all: items.length > 0 ? items : [defaultComparison()] });
              }}
            />
          ))}
          <button
            type="button"
            className="button"
            onClick={() => onChange({ all: [...group.all, defaultComparison()] })}
          >
            Add condition
          </button>
        </>
      ) : null}

      {groupKind === "any" && "any" in group ? (
        <>
          {group.any.map((child, index) => (
            <ConditionNodeEditor
              key={index}
              node={child}
              depth={depth + 1}
              onChange={(next) => {
                const items = [...group.any];
                items[index] = next;
                onChange({ any: items });
              }}
              onRemove={() => {
                const items = group.any.filter((_, itemIndex) => itemIndex !== index);
                onChange({ any: items.length > 0 ? items : [defaultComparison()] });
              }}
            />
          ))}
          <button
            type="button"
            className="button"
            onClick={() => onChange({ any: [...group.any, defaultComparison()] })}
          >
            Add condition
          </button>
        </>
      ) : null}

      {groupKind === "not" && "not" in group ? (
        <ConditionNodeEditor
          node={group.not}
          depth={depth + 1}
          onChange={(next) => onChange({ not: next })}
        />
      ) : null}
    </div>
  );
}
