import { jsonError } from "@/lib/json-response";
import env from "@/lib/env";
import { checkClientRateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

const withApiKey = async (request: NextRequest) => {
  try {
    const apiKey = request.headers.get("x-api-key")?.trim();
    if (!apiKey) {
      return jsonError("Unauthorized. x-api-key header is required.", 401);
    }
    if (apiKey !== env.clientApiKey) {
      return jsonError("Unauthorized. Invalid API key.", 401);
    }

    const rate = checkClientRateLimit(apiKey);
    if (!rate.ok) {
      return jsonError(
        rate.reason === "interval"
          ? "Please wait before sending another request."
          : "Rate limit exceeded.",
        429,
        undefined,
        {
          "Retry-After": String(Math.max(1, Math.ceil(rate.retryAfterMs / 1000))),
        },
      );
    }

    return null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server misconfigured.";
    return jsonError(message, 500);
  }
};

export default withApiKey;
