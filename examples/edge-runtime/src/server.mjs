import { createServer } from "node:http";
import { handleEvaluateRequest } from "./handler.mjs";

const port = 8787;

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/evaluate") {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "POST /evaluate only" }));
    return;
  }

  const body = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

  const request = new Request(`http://localhost:${port}/evaluate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  const response = await handleEvaluateRequest(request);
  const text = await response.text();
  res.writeHead(response.status, { "content-type": "application/json" });
  res.end(text);
});

server.listen(port, async () => {
  console.log(`Edge-style evaluator listening on http://localhost:${port}`);

  const demo = await handleEvaluateRequest(
    new Request("http://localhost/evaluate", {
      method: "POST",
      body: JSON.stringify({
        currentNodeId: "start",
        context: { loanValueRatio: 80 },
      }),
    })
  );

  console.log("Demo response:", await demo.json());
});
