function optional(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

function requiredAtRuntime(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const env = {
  get groqApiKey() {
    return requiredAtRuntime("GROQ_API_KEY");
  },
  get clientApiKey() {
    return requiredAtRuntime("X_API_KEY");
  },
  groqChatModel: optional("GROQ_CHAT_MODEL", "openai/gpt-oss-120b"),
  groqVisionModel: optional("GROQ_VISION_MODEL", "qwen/qwen3.6-27b"),
  publicBaseUrl: optional("PUBLIC_BASE_URL", "http://localhost:2025"),
  rateLimitPerHour: Number(optional("RATE_LIMIT_PER_HOUR", "2000")),
  minRequestIntervalMs: Number(optional("MIN_REQUEST_INTERVAL_MS", "2000")),
};

export default env;
