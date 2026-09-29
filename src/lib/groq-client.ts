import Groq from "groq-sdk";
import env from "@/lib/env";

/** Groq Cloud client — see `src/config/ai-provider.ts` for provider vs Master Prompt terminology. */

let client: Groq | null = null;

export function getGroqClient(): Groq {
  if (!client) {
    client = new Groq({ apiKey: env.groqApiKey });
  }
  return client;
}
