# Study Smarter API

Production-oriented **Next.js** backend for the Study Smarter app. The mobile app talks to this API; **Firebase** keeps ads, remote config, and user settings.

## AI provider (technical)

| Item | Value |
|------|--------|
| **Provider** | [Groq Cloud](https://groq.com) (`groq-sdk`) |
| **API key** | `GROQ_API_KEY` — `gsk_...` (server only) |
| **Text + PDF model** | `GROQ_CHAT_MODEL` — default **`openai/gpt-oss-120b`** |
| **Vision model** | `GROQ_VISION_MODEL` — default **`qwen/qwen3.6-27b`** (multimodal; Groq retired `llama-3.3-70b-versatile` / old vision IDs on dev tier) |

Canonical config: `src/lib/env.ts`, `src/config/ai-provider.ts`.

**Master Prompt note:** Product copy may say “Grok model” (xAI). This repository **intentionally uses Groq**, not xAI Grok. Tutor behavior follows the Master Prompt; inference runs on the Groq models above.

## Setup

```bash
cp .env.example .env
# Fill GROQ_API_KEY, X_API_KEY, optional models
npm install
npm run dev
```

Server: `http://localhost:2025`

## API documentation (Swagger)

- **Swagger UI:** [http://localhost:2025/docs](http://localhost:2025/docs)
- **OpenAPI JSON:** `GET /api/openapi` (server URL from `PUBLIC_BASE_URL`)

In Swagger UI, click **Authorize** and enter your client `x-api-key` to try `/api/v1/*` routes.

## Environment

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq secret (`gsk_...`) — server only |
| `GROQ_CHAT_MODEL` | Text + PDF (default `openai/gpt-oss-120b`) |
| `GROQ_VISION_MODEL` | Image (default `qwen/qwen3.6-27b`) |
| `X_API_KEY` | Client key sent as `x-api-key` from the app |
| `MIN_REQUEST_INTERVAL_MS` | Per-key gap (default 2000, matches app requirements) |
| `RATE_LIMIT_PER_HOUR` | Per-key hourly cap (default 2000) |

## Authorization

Every `/api/v1/*` route requires:

```http
x-api-key: <X_API_KEY from Firebase Remote Config>
```

Do **not** put `GROQ_API_KEY` in the app.

## Endpoints

### POST `/api/v1/tutor/ask`

```json
{
  "prompt": "Explain photosynthesis briefly",
  "languageCode": "en"
}
```

Response `data.text` — plain tutor answer.

### POST `/api/v1/tutor/image`

`multipart/form-data`: `image` (JPEG, max 10MB), `languageCode` (optional).

Response `data` — JSON object (math steps or answer/explanation).

### POST `/api/v1/tutor/file`

`multipart/form-data`: `file` (PDF, max 15MB), `languageCode` (optional).

Response `data.answer` — combined summary string.

### GET `/api/health`

No auth. Use for uptime checks.

## Firebase (app side)

Suggested Remote Config keys:

- `tutor_api_base_url` — production: `https://studysmarter.habittrackerapi.com` (local dev: `http://localhost:2025`)
- `tutor_api_key` — same value as server `X_API_KEY`

Groq stays in `.env` on the host (Vercel, VPS, etc.).

## Language enforcement

- Supported app language codes: `en`, `ar`, `zh`, `de`, `fr`, `pt`, `es`, `it`, `tr`, `id`, `ms` (invalid/missing → `en`).
- Strong language instructions are sent on every tutor request (`src/lib/tutor-prompts.ts`).
- **Post-generation checks:** Arabic and Chinese responses must contain expected script (`src/lib/language-validation.ts`). Other locales rely on prompts plus format validation (summary label, document section headers); fully automatic language detection for Latin-script locales is not reliable and is intentionally not faked.

## Output validation

Structured routes validate model JSON with Zod (`src/schema/tutor-responses.ts`) and retry up to 3 times before returning `502`. Plain-text `/tutor/ask` validates no LaTeX, required summary label, and script checks where applicable (`src/lib/text-response-validation.ts`).

## Deploy

VPS files: **`deploy/study-smarter-api/`** — PM2 (`ecosystem.config.cjs`, port **3012**), Nginx site **`study-smarter-api`**. Full steps: [deploy/study-smarter-api/DEPLOY.md](deploy/study-smarter-api/DEPLOY.md).

```bash
npm run build
npm start   # listens on 3012
```

Set all env vars on the host. Use HTTPS in production (`PUBLIC_BASE_URL`).
