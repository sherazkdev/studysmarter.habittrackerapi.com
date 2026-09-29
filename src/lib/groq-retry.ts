function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 500 || status === 502 || status === 503 || status === 504;
}

export async function withGroqRetries<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: unknown) {
      attempt += 1;
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status?: unknown }).status === "number"
          ? (error as { status: number }).status
          : undefined;

      const message = error instanceof Error ? error.message : String(error);
      const retryable =
        status !== undefined
          ? isRetryableStatus(status)
          : message.includes("ECONNRESET") || message.includes("fetch failed");

      if (!retryable || attempt > maxRetries) {
        throw error;
      }

      await sleep(1000 * (1 << (attempt - 1)));
    }
  }
}
