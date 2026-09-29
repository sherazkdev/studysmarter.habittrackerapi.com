import env from "@/lib/env";
import { withGroqRetries } from "@/lib/groq-retry";
import {
  buildDocumentRegenerationHint,
  validateDocumentAnswerContent,
} from "@/lib/document-answer-validation";
import { validateJsonResponseLanguage } from "@/lib/language-validation";
import { parseModelJson } from "@/lib/parse-json";
import { extractPdfText } from "@/lib/pdf-text";
import {
  documentResponseSchema,
  parseImageStructuredResponse,
} from "@/schema/tutor-responses";
import { withStructuredOutputAttempts } from "@/lib/structured-output-retry";
import {
  buildTextRegenerationHint,
  validatePlainTextStudyResponse,
} from "@/lib/text-response-validation";
import {
  buildFileUserPrompt,
  buildImageUserPrompt,
  buildLanguageSystemInstruction,
  buildTextAskUserPrompt,
  buildTutorSystemInstruction,
  normalizeLanguageCode,
} from "@/lib/tutor-prompts";
import { getGroqClient } from "@/lib/groq-client";

export class TutorServiceError extends Error {
  status: number;

  constructor(message: string, status = 502) {
    super(message);
    this.name = "TutorServiceError";
    this.status = status;
  }
}

const STRUCTURED_OUTPUT_ATTEMPTS = 3;
const TEXT_OUTPUT_ATTEMPTS = 3;

function groqStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }
  return undefined;
}

function wrapGroqError(error: unknown): never {
  const status = groqStatus(error);
  if (status === 429) {
    throw new TutorServiceError("Quota exceeded. Please try again later.", 429);
  }
  const message = error instanceof Error ? error.message : "AI request failed.";
  const clientStatus =
    status === 404 && message.includes("model") ? 502 : status && status >= 400 ? status : 502;
  throw new TutorServiceError(message.slice(0, 500), clientStatus);
}

function structuredOutputFailure(message: string): never {
  throw new TutorServiceError(message.slice(0, 500), 502);
}

export async function askTextQuestion(input: {
  prompt: string;
  languageCode?: string;
}): Promise<{ text: string }> {
  const langCode = normalizeLanguageCode(input.languageCode);
  const systemText = `${buildLanguageSystemInstruction(langCode)}\n\n${buildTutorSystemInstruction()}`;
  const userText = buildTextAskUserPrompt(input.prompt, langCode);

  if (!input.prompt.trim()) {
    throw new TutorServiceError("Prompt is required.", 400);
  }

  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [
    { role: "system", content: systemText },
    { role: "user", content: userText },
  ];

  try {
    for (let attempt = 0; attempt < TEXT_OUTPUT_ATTEMPTS; attempt += 1) {
      const completion = await withGroqRetries(() =>
        getGroqClient().chat.completions.create({
          model: env.groqChatModel,
          temperature: 0.7,
          messages,
        }),
      );

      const text = completion.choices[0]?.message?.content?.trim();
      if (!text) {
        if (attempt === TEXT_OUTPUT_ATTEMPTS - 1) {
          throw new TutorServiceError("No response from AI.", 502);
        }
        messages.push({
          role: "user",
          content: buildTextRegenerationHint(["Empty response."]),
        });
        continue;
      }

      const validation = validatePlainTextStudyResponse(text, langCode);
      if (validation.ok) {
        return { text };
      }

      if (attempt === TEXT_OUTPUT_ATTEMPTS - 1) {
        structuredOutputFailure(
          `Answer did not meet format requirements: ${validation.reasons.join(" ")}`,
        );
      }

      messages.push({ role: "assistant", content: text });
      messages.push({
        role: "user",
        content: buildTextRegenerationHint(validation.reasons),
      });
    }

    structuredOutputFailure("Failed to generate a valid text answer.");
  } catch (error: unknown) {
    if (error instanceof TutorServiceError) throw error;
    return wrapGroqError(error);
  }
}

export async function analyzeImageQuestion(input: {
  image: File;
  languageCode?: string;
}): Promise<Record<string, unknown>> {
  const langCode = normalizeLanguageCode(input.languageCode);
  const systemText = `${buildLanguageSystemInstruction(langCode)}\n\n${buildTutorSystemInstruction()}`;
  const basePrompt = buildImageUserPrompt(langCode);

  const buffer = Buffer.from(await input.image.arrayBuffer());
  const dataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;

  try {
    const data = await withStructuredOutputAttempts({
      maxAttempts: STRUCTURED_OUTPUT_ATTEMPTS,
      run: async (_attempt, fixHint) => {
        const prompt = fixHint
          ? `${basePrompt}\n\nCORRECTION REQUIRED: ${fixHint}`
          : basePrompt;

        const completion = await withGroqRetries(() =>
          getGroqClient().chat.completions.create({
            model: env.groqVisionModel,
            temperature: 0.3,
            max_completion_tokens: 4096,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemText },
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: dataUrl } },
                ],
              },
            ],
          }),
        );

        return completion.choices[0]?.message?.content ?? undefined;
      },
      validate: (raw) => {
        try {
          const parsed = parseModelJson(raw);
          const structured = parseImageStructuredResponse(parsed);
          const langCheck = validateJsonResponseLanguage(structured, langCode);
          if (!langCheck.ok) {
            return { ok: false, error: langCheck.reason };
          }
          return { ok: true, data: structured };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Invalid JSON structure.";
          return { ok: false, error: message };
        }
      },
    });

    return data as Record<string, unknown>;
  } catch (error: unknown) {
    if (error instanceof TutorServiceError) throw error;
    if (error instanceof Error) {
      structuredOutputFailure(error.message);
    }
    return wrapGroqError(error);
  }
}

export async function analyzePdfDocument(input: {
  file: File;
  languageCode?: string;
}): Promise<{ answer: string }> {
  const langCode = normalizeLanguageCode(input.languageCode);
  const systemText = `${buildLanguageSystemInstruction(langCode)}\n\n${buildTutorSystemInstruction()}`;
  const userPrompt = buildFileUserPrompt(langCode);

  const buffer = Buffer.from(await input.file.arrayBuffer());
  let documentText: string;
  try {
    documentText = await extractPdfText(buffer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "PDF processing failed.";
    throw new TutorServiceError(message, 400);
  }

  const userContentBase = `${userPrompt}\n\n--- DOCUMENT START ---\n${documentText}\n--- DOCUMENT END ---`;

  try {
    const result = await withStructuredOutputAttempts({
      maxAttempts: STRUCTURED_OUTPUT_ATTEMPTS,
      run: async (_attempt, fixHint) => {
        const userContent = fixHint
          ? `${userContentBase}\n\nCORRECTION REQUIRED: ${buildDocumentRegenerationHint(fixHint)}`
          : userContentBase;

        const completion = await withGroqRetries(() =>
          getGroqClient().chat.completions.create({
            model: env.groqChatModel,
            temperature: 0.4,
            max_completion_tokens: 4096,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemText },
              { role: "user", content: userContent },
            ],
          }),
        );

        return completion.choices[0]?.message?.content ?? undefined;
      },
      validate: (raw) => {
        try {
          const parsed = parseModelJson(raw);
          const doc = documentResponseSchema.safeParse(parsed);
          if (!doc.success) {
            return {
              ok: false,
              error: doc.error.issues.map((i) => i.message).join("; "),
            };
          }
          const contentCheck = validateDocumentAnswerContent(doc.data.answer, langCode);
          if (!contentCheck.ok) {
            return { ok: false, error: contentCheck.reason };
          }
          const langCheck = validateJsonResponseLanguage(doc.data, langCode);
          if (!langCheck.ok) {
            return { ok: false, error: langCheck.reason };
          }
          return { ok: true, data: { answer: doc.data.answer.trim() } };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Invalid JSON.";
          return { ok: false, error: message };
        }
      },
    });

    return result;
  } catch (error: unknown) {
    if (error instanceof TutorServiceError) throw error;
    if (error instanceof Error) {
      structuredOutputFailure(error.message);
    }
    return wrapGroqError(error);
  }
}
