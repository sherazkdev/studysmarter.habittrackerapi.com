export async function withStructuredOutputAttempts<T>(options: {
  maxAttempts?: number;
  run: (attemptIndex: number, fixHint?: string) => Promise<string | null | undefined>;
  validate: (raw: string) => { ok: true; data: T } | { ok: false; error: string };
}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  let lastError = "Invalid model output.";

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const fixHint = attempt > 0 ? lastError : undefined;
    const raw = await options.run(attempt, fixHint);
    if (!raw?.trim()) {
      lastError = "Empty model response.";
      continue;
    }
    const result = options.validate(raw.trim());
    if (result.ok) {
      return result.data;
    }
    lastError = result.error;
  }

  throw new Error(lastError);
}
