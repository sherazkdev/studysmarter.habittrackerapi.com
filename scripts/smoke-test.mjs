/**
 * Local smoke tests — run while dev server is up on PORT (default 3000).
 * Usage: node scripts/smoke-test.mjs
 */
const PORT = process.env.PORT || "3000";
const BASE = `http://localhost:${PORT}`;
const API_KEY = process.env.X_API_KEY || "your_client_api_key_for_app";

async function req(method, path, options = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      ...(options.json ? { "Content-Type": "application/json" } : {}),
      ...(options.apiKey ? { "x-api-key": options.apiKey } : {}),
      ...options.headers,
    },
    body: options.body,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { _raw: text.slice(0, 200) };
  }
  return { status: res.status, json, headers: res.headers };
}

const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  const mark = ok ? "OK" : "FAIL";
  console.log(`[${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
}

try {
  const health = await req("GET", "/api/health");
  record(
    "GET /api/health",
    health.status === 200 && health.json.success === true,
    `status=${health.status}`,
  );

  const noKey = await req("POST", "/api/v1/tutor/ask", {
    json: true,
    body: JSON.stringify({ prompt: "test", languageCode: "en" }),
  });
  record("POST /ask without key → 401", noKey.status === 401, `status=${noKey.status}`);

  const badKey = await req("POST", "/api/v1/tutor/ask", {
    json: true,
    apiKey: "wrong-key",
    body: JSON.stringify({ prompt: "test", languageCode: "en" }),
  });
  record("POST /ask wrong key → 401", badKey.status === 401, `status=${badKey.status}`);

  const emptyPrompt = await req("POST", "/api/v1/tutor/ask", {
    json: true,
    apiKey: API_KEY,
    body: JSON.stringify({ prompt: "   ", languageCode: "en" }),
  });
  record("POST /ask empty prompt → 400", emptyPrompt.status === 400, `status=${emptyPrompt.status}`);

  await new Promise((r) => setTimeout(r, 2100));

  const ask = await req("POST", "/api/v1/tutor/ask", {
    json: true,
    apiKey: API_KEY,
    body: JSON.stringify({
      prompt: "What is 2+2? One short step.",
      languageCode: "en",
    }),
  });
  const askOk =
    ask.status === 200 &&
    ask.json.success === true &&
    typeof ask.json.data?.text === "string" &&
    ask.json.data.text.length > 10;
  record(
    "POST /ask Groq text answer",
    askOk,
    askOk
      ? `len=${ask.json.data.text.length}`
      : `status=${ask.status} msg=${ask.json.message ?? ask.json._raw}`,
  );

  const openapi = await req("GET", "/api/openapi");
  record(
    "GET /api/openapi",
    openapi.status === 200 && openapi.json.openapi === "3.0.3",
    `paths=${Object.keys(openapi.json.paths ?? {}).length}`,
  );

  const docs = await req("GET", "/docs");
  record("GET /docs (Swagger UI)", docs.status === 200, `status=${docs.status}`);

  const method = await req("GET", "/api/v1/tutor/ask", { apiKey: API_KEY });
  record("GET /ask → 405", method.status === 405, `status=${method.status}`);

  console.log("\n--- Summary ---");
  const failed = results.filter((r) => !r.ok);
  console.log(`${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exitCode = 1;
} catch (e) {
  console.error("Smoke test error:", e.message);
  process.exitCode = 1;
}
