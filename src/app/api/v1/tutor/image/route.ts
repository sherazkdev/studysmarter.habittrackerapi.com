import { jsonError, jsonSuccess } from "@/lib/json-response";
import { multipartLanguageSchema, validateImageFile } from "@/schema/tutor";
import { analyzeImageQuestion, TutorServiceError } from "@/services/tutor-service";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const languageParsed = multipartLanguageSchema.safeParse({
      languageCode: form.get("languageCode")?.toString() ?? "en",
    });
    if (!languageParsed.success) {
      return jsonError("Validation failed.", 400, languageParsed.error.issues);
    }

    let image: File;
    try {
      image = validateImageFile(form.get("image") as File | null);
    } catch (validationError: unknown) {
      const message =
        validationError instanceof Error ? validationError.message : "Invalid image.";
      return jsonError(message, 400);
    }

    const result = await analyzeImageQuestion({
      image,
      languageCode: languageParsed.data.languageCode,
    });

    return jsonSuccess(result, "Image analyzed.", 200);
  } catch (error: unknown) {
    if (error instanceof TutorServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error("POST /api/v1/tutor/image failed:", error);
    return jsonError("Image analysis failed.", 502);
  }
}
