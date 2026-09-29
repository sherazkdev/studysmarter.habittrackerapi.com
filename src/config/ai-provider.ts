/**
 * Study Smarter tutor inference provider (intentional project choice).
 *
 * Product Master Prompt copy may say "Grok model" (xAI). This API does NOT call xAI Grok.
 * It uses Groq Cloud via `groq-sdk` and `GROQ_API_KEY` (`gsk_...`).
 *
 * Exact model IDs are set in environment variables (see `.env.example` and `src/lib/env.ts`).
 */
import env from "@/lib/env";

export const AI_PROVIDER = {
  name: "Groq Cloud",
  sdk: "groq-sdk",
  apiKeyEnv: "GROQ_API_KEY",
  chatModelEnv: "GROQ_CHAT_MODEL",
  visionModelEnv: "GROQ_VISION_MODEL",
  chatModel: env.groqChatModel,
  visionModel: env.groqVisionModel,
} as const;
