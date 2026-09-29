import Link from "next/link";
import { CodePanel } from "@/components/code-panel";
import { DocsNavDesktop, DocsNavMobile } from "@/components/docs-nav";
import { SectionHeading } from "@/components/section-heading";
import { SiteHeader } from "@/components/site-header";

const productionBase = "https://studysmarter.habittrackerapi.com";

const curlExample = `curl -X POST "${productionBase}/api/v1/tutor/ask" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_CLIENT_KEY" \\
  -d '{"prompt":"What is 2+2?","languageCode":"en"}'`;

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick start" },
  { id: "endpoints", label: "Endpoints" },
  { id: "integration", label: "Integration" },
  { id: "errors", label: "Errors" },
];

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/tutor/ask",
    title: "Text question",
    desc: "Plain-text tutor answer with step-by-step math, summary label, and app language.",
    request: `{
  "prompt": "Explain photosynthesis briefly",
  "languageCode": "en"
}`,
    response: `{
  "success": true,
  "message": "Answer generated.",
  "statusCode": 200,
  "data": { "text": "..." }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/tutor/image",
    title: "Image question",
    desc: "JPEG only, max 10MB. Math JSON or { answer, explanation }.",
    request: `Content-Type: multipart/form-data

image: (JPEG file)
languageCode: en`,
    response: `{
  "success": true,
  "data": {
    "answer": "...",
    "verification": "...",
    "steps": [ ... ],
    "why": { ... }
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/tutor/file",
    title: "PDF document",
    desc: "PDF max 15MB. Text extraction only — scanned PDFs return 400.",
    request: `Content-Type: multipart/form-data

file: application/pdf
languageCode: en`,
    response: `{
  "success": true,
  "data": {
    "answer": "Summary + key points + answers (one string)"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/health",
    title: "Health",
    desc: "No x-api-key. Uptime checks.",
    request: "(no body)",
    response: `{
  "success": true,
  "data": { "service": "study-smarter-api", "status": "ok" }
}`,
  },
];

const languages = ["en", "ar", "zh", "de", "fr", "pt", "es", "it", "tr", "id", "ms"];

const statusRows = [
  ["200", "Success", "Response includes data envelope."],
  ["400", "Bad request", "Validation, wrong file type, or unreadable PDF."],
  ["401", "Unauthorized", "Missing or invalid x-api-key."],
  ["429", "Rate limited", "Minimum 2 seconds between requests per key."],
  ["502", "Upstream / format", "Groq error or AI output failed validation."],
];

function MethodBadge({ method }: { method: string }) {
  if (method === "GET") {
    return (
      <span className="inline-flex shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200/90">
        GET
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 rounded-lg bg-accent-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-hover ring-1 ring-accent/25">
      POST
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 docs-page-bg" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[480px] docs-grid-texture opacity-80" />

      <SiteHeader active="home" />

      <div className="relative mx-auto max-w-6xl px-5 py-8 pb-24 sm:py-10 lg:py-12">
        <DocsNavMobile items={navItems} />

        <div className="flex gap-10 lg:gap-12">
          <DocsNavDesktop items={navItems} />

          <main className="min-w-0 flex-1 space-y-14 sm:space-y-16">
            <section id="overview" className="scroll-mt-28">
              <div className="doc-card overflow-hidden">
                <div className="relative border-b border-border bg-gradient-to-br from-accent-soft via-surface to-surface px-7 py-9 sm:px-10 sm:py-10">
                  <div className="absolute right-6 top-6 hidden h-24 w-24 rounded-full bg-accent/10 blur-2xl sm:block" />
                  <p className="inline-flex rounded-full bg-surface/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-accent ring-1 ring-accent/15">
                    REST · OpenAPI 3
                  </p>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-[2.65rem] sm:leading-[1.1]">
                    Study Smarter API
                  </h1>
                  <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-base">
                    Mobile app yahan tutor requests bhejti hai. Firebase ads + Remote Config handle
                    karta hai. Groq sirf server par — client mein kabhi{" "}
                    <code className="docs-code rounded-lg bg-white/90 px-2 py-0.5 text-sm font-medium text-accent-hover ring-1 ring-border">
                      gsk_
                    </code>{" "}
                    mat daalo.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["3 tutor routes", "11 languages", "x-api-key auth", "2s rate limit"].map(
                      (tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-foreground ring-1 ring-border/80 backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/docs"
                      className="inline-flex items-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:bg-accent-hover hover:shadow-accent/40"
                    >
                      Open Swagger
                    </Link>
                    <a
                      href="#quick-start"
                      className="inline-flex items-center rounded-xl bg-surface/90 px-5 py-2.5 text-sm font-semibold ring-1 ring-border backdrop-blur-sm transition hover:bg-accent-soft"
                    >
                      Quick start
                    </a>
                  </div>
                </div>
                <div className="grid gap-px bg-border sm:grid-cols-3">
                  {[
                    { label: "Production", value: productionBase.replace("https://", "") },
                    { label: "Chat model", value: "openai/gpt-oss-120b" },
                    { label: "Vision model", value: "qwen/qwen3.6-27b" },
                  ].map((cell) => (
                    <div key={cell.label} className="bg-surface px-6 py-5 transition hover:bg-accent-soft/30">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                        {cell.label}
                      </p>
                      <p className="docs-code mt-2 break-all text-sm font-semibold text-foreground">
                        {cell.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section id="quick-start" className="scroll-mt-28">
              <SectionHeading
                title="Quick start"
                description="Header x-api-key required on every /api/v1/* route. Send languageCode in JSON body or multipart form — not as a language header."
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="doc-card p-6 sm:p-7">
                  <h3 className="text-sm font-bold text-foreground">Authentication</h3>
                  <div className="mt-4">
                    <CodePanel
                      title="HTTP header"
                      code={`x-api-key: <Firebase tutor_api_key>\n\n# Same value as server env X_API_KEY`}
                    />
                  </div>
                </div>
                <div className="doc-card p-6 sm:p-7">
                  <h3 className="text-sm font-bold text-foreground">Example (text)</h3>
                  <div className="mt-4">
                    <CodePanel title="curl" code={curlExample} />
                  </div>
                </div>
              </div>
            </section>

            <section id="endpoints" className="scroll-mt-28">
              <SectionHeading
                title="Endpoints"
                description="Maps to app requirements: askOpenAI → ask, analyzeImage → image, analyzeFile → file."
              />
              <ul className="space-y-5">
                {endpoints.map((item) => (
                  <li key={item.path} className="doc-card overflow-hidden transition">
                    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-gradient-to-r from-background/80 to-surface px-5 py-4 sm:px-6">
                      <MethodBadge method={item.method} />
                      <code className="docs-code text-sm font-semibold text-foreground">
                        {item.path}
                      </code>
                      <span className="text-sm font-semibold text-muted">{item.title}</span>
                    </div>
                    <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
                      <p className="text-[15px] leading-relaxed text-muted">{item.desc}</p>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <CodePanel title="Request" code={item.request} variant="light" />
                        <CodePanel title="Response" code={item.response} variant="light" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section id="integration" className="scroll-mt-28 grid gap-6 lg:grid-cols-2">
              <div className="doc-card p-6 sm:p-7">
                <SectionHeading title="App languages" description="Invalid or missing code → en." />
                <div className="flex flex-wrap gap-2">
                  {languages.map((code) => (
                    <span
                      key={code}
                      className="docs-code rounded-lg bg-accent-soft px-2.5 py-1.5 text-xs font-bold text-accent-hover ring-1 ring-accent/10"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
              <div className="doc-card p-6 sm:p-7">
                <SectionHeading title="Firebase Remote Config" />
                <ul className="space-y-4 text-[15px]">
                  <li className="flex gap-3 rounded-xl bg-background/70 p-3 ring-1 ring-border/60">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-xs font-bold text-accent">
                      1
                    </span>
                    <span>
                      <code className="docs-code text-xs font-semibold">tutor_api_base_url</code>
                      <span className="mt-1 block text-sm text-muted">{productionBase}</span>
                    </span>
                  </li>
                  <li className="flex gap-3 rounded-xl bg-background/70 p-3 ring-1 ring-border/60">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-xs font-bold text-accent">
                      2
                    </span>
                    <span>
                      <code className="docs-code text-xs font-semibold">tutor_api_key</code>
                      <span className="mt-1 block text-sm text-muted">Matches server X_API_KEY</span>
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            <section id="errors" className="scroll-mt-28">
              <SectionHeading title="HTTP status codes" />
              <div className="doc-card overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-background/70 text-[11px] uppercase tracking-[0.12em] text-muted">
                      <th className="px-6 py-3.5 font-bold">Code</th>
                      <th className="px-6 py-3.5 font-bold">Meaning</th>
                      <th className="hidden px-6 py-3.5 font-bold sm:table-cell">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusRows.map(([code, meaning, when]) => (
                      <tr
                        key={code}
                        className="border-b border-border/80 transition last:border-0 hover:bg-accent-soft/20"
                      >
                        <td className="docs-code px-6 py-4 text-base font-bold text-accent-hover">
                          {code}
                        </td>
                        <td className="px-6 py-4 font-semibold">{meaning}</td>
                        <td className="hidden px-6 py-4 text-muted sm:table-cell">{when}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
        </div>
      </div>

      <footer className="relative border-t border-border bg-surface/90 py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 text-center text-sm text-muted sm:flex-row sm:justify-between sm:text-left">
          <span className="font-medium">Study Smarter API · Groq on server only</span>
          <span>
            <Link href="/docs" className="font-semibold text-accent hover:text-accent-hover">
              Swagger
            </Link>
            {" · "}
            <a href="/api/openapi" className="font-semibold text-accent hover:text-accent-hover">
              OpenAPI JSON
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
