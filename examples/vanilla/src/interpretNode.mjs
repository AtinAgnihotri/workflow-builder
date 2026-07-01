/** Developer-owned: decide what a workflow node means in the host app. */
export function describeNode(node) {
  switch (node.id) {
    case "start":
      return "Show intake form";
    case "offer":
      return "Render automated offer screen";
    case "review":
      return "Route to manual review queue";
    default:
      return `Handle node ${node.id}`;
  }
}
