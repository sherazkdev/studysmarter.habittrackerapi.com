import { jsonError, jsonSuccess } from "@/lib/json-response";
import { askTextBodySchema } from "@/schema/tutor";
import { askTextQuestion, TutorServiceError } from "@/services/tutor-service";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = askTextBodySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Validation failed.", 400, parsed.error.issues);
    }

    const result = await askTextQuestion(parsed.data);
    return jsonSuccess(result, "Answer generated.", 200);
  } catch (error: unknown) {
    if (error instanceof TutorServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error("POST /api/v1/tutor/ask failed:", error);
    return jsonError("Failed to generate answer.", 502);
  }
}
