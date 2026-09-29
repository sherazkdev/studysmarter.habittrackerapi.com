/**
 * Maps original .requirements (3 Flutter methods) to HTTP API + validates responses.
 */
const PORT = process.env.PORT || "3000";
const BASE = `http://localhost:${PORT}`;
const API_KEY = process.env.X_API_KEY || "your_client_api_key_for_app";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jsonReq(method, path, { body, apiKey } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(apiKey !== false ? { "x-api-key": apiKey ?? API_KEY } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} — ${name}${detail ? `: ${detail}` : ""}`);
}

// --- Requirement mapping (static) ---
const requiredEndpoints = [
  { req: "askOpenAI(prompt)", api: "POST /api/v1/tutor/ask", field: "data.text" },
  { req: "analyzeImage(jpeg)", api: "POST /api/v1/tutor/image", field: "data JSON" },
  { req: "analyzeFile(pdf)", api: "POST /api/v1/tutor/file", field: "data.answer" },
];

console.log("=== Requirements → API mapping ===");
for (const e of requiredEndpoints) {
  console.log(`  ${e.req}  →  ${e.api}  (${e.field})`);
}
console.log("  Extra (production): GET /api/health, x-api-key, Groq backend (not Gemini direct)\n");

console.log("=== Live tests ===\n");

try {
  const health = await jsonReq("GET", "/api/health", { apiKey: false });
  check("GET /api/health", health.status === 200 && health.data.success, `status=${health.status}`);

  const noAuth = await jsonReq("POST", "/api/v1/tutor/ask", {
    apiKey: false,
    body: { prompt: "hi", languageCode: "en" },
  });
  check("x-api-key required (401)", noAuth.status === 401, `status=${noAuth.status}`);

  await sleep(2100);

  const text = await jsonReq("POST", "/api/v1/tutor/ask", {
    body: {
      prompt: "What is 5 times 6? Show one step only.",
      languageCode: "en",
    },
  });
  const textOk =
    text.status === 200 &&
    text.data.success &&
    typeof text.data.data?.text === "string" &&
    text.data.data.text.includes("Summary:");
  check(
    "Text tutor (askOpenAI equivalent)",
    textOk,
    textOk ? `has Summary label, len=${text.data.data.text.length}` : text.data.message,
  );

  await sleep(2100);

  const fs = await import("fs");
  const path = await import("path");
  const jpegPath = path.join("scripts", "fixtures", "test-32.jpg");
  if (fs.existsSync(jpegPath)) {
    const buf = fs.readFileSync(jpegPath);
    const form = new FormData();
    form.append("image", new Blob([buf], { type: "image/jpeg" }), "test.jpg");
    form.append("languageCode", "en");
    const imgRes = await fetch(`${BASE}/api/v1/tutor/image`, {
      method: "POST",
      headers: { "x-api-key": API_KEY },
      body: form,
    });
    const img = await imgRes.json();
    const d = img.data;
    const mathShape =
      d &&
      typeof d.answer === "string" &&
      typeof d.verification === "string" &&
      Array.isArray(d.steps);
    const nonMathShape =
      d && typeof d.answer === "string" && typeof d.explanation === "string" && !d.steps;
    const imgOk = imgRes.status === 200 && img.success && (mathShape || nonMathShape);
    check(
      "Image JSON (analyzeImage equivalent)",
      imgOk,
      imgOk ? (mathShape ? "math schema" : "non-math schema") : img.message?.slice(0, 80),
    );
  } else {
    check("Image JSON", false, "fixture test-32.jpg missing");
  }

  await sleep(2100);

  const pdfPath = path.join("scripts", "fixtures", "sample.pdf");
  if (fs.existsSync(pdfPath)) {
    const pdfBuf = fs.readFileSync(pdfPath);
    const pdfForm = new FormData();
    pdfForm.append("file", new Blob([pdfBuf], { type: "application/pdf" }), "sample.pdf");
    pdfForm.append("languageCode", "en");
    const pdfRes = await fetch(`${BASE}/api/v1/tutor/file`, {
      method: "POST",
      headers: { "x-api-key": API_KEY },
      body: pdfForm,
    });
    const pdf = await pdfRes.json();
    const pdfOk =
      pdfRes.status === 200 &&
      pdf.success &&
      typeof pdf.data?.answer === "string" &&
      pdf.data.answer.length > 20;
    check(
      "PDF document (analyzeFile equivalent)",
      pdfOk,
      pdfOk ? `answer len=${pdf.data.answer.length}` : pdf.message?.slice(0, 80),
    );
  } else {
    check("PDF document", false, "fixture sample.pdf missing");
  }

  await sleep(2100);

  const rate = await jsonReq("POST", "/api/v1/tutor/ask", {
    body: { prompt: "ping", languageCode: "en" },
  });
  const rate2 = await jsonReq("POST", "/api/v1/tutor/ask", {
    body: { prompt: "ping2", languageCode: "en" },
  });
  check(
    "2s rate limit (429 on rapid call)",
    rate2.status === 429,
    `first=${rate.status} second=${rate2.status}`,
  );

  await sleep(2100);

  const badLang = await jsonReq("POST", "/api/v1/tutor/ask", {
    body: { prompt: "Say hello in one word.", languageCode: "xx" },
  });
  check(
    "Invalid languageCode → falls back (still 200)",
    badLang.status === 200 && badLang.data.success,
    `status=${badLang.status}`,
  );

  console.log("\n=== Summary ===");
  const failed = checks.filter((c) => !c.ok);
  console.log(`${checks.length - failed.length}/${checks.length} checks passed`);
  if (failed.length) {
    console.log("Failed:", failed.map((f) => f.name).join(", "));
    process.exitCode = 1;
  }
} catch (e) {
  console.error("Server not reachable or test error:", e.message);
  console.error("Start: npx next dev -p 3000");
  process.exitCode = 1;
}
