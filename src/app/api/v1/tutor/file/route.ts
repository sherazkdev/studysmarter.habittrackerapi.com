import { jsonError, jsonSuccess } from "@/lib/json-response";
import { multipartLanguageSchema, validatePdfFile } from "@/schema/tutor";
import { analyzePdfDocument, TutorServiceError } from "@/services/tutor-service";
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

    let file: File;
    try {
      file = validatePdfFile(form.get("file") as File | null);
    } catch (validationError: unknown) {
      const message =
        validationError instanceof Error ? validationError.message : "Invalid file.";
      return jsonError(message, 400);
    }

    const result = await analyzePdfDocument({
      file,
      languageCode: languageParsed.data.languageCode,
    });

    return jsonSuccess(result, "Document analyzed.", 200);
  } catch (error: unknown) {
    if (error instanceof TutorServiceError) {
      return jsonError(error.message, error.status);
    }
    console.error("POST /api/v1/tutor/file failed:", error);
    return jsonError("Document analysis failed.", 502);
  }
}
