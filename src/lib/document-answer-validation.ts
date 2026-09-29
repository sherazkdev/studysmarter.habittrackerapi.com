import { getDocumentSectionLabels } from "@/lib/tutor-prompts";

const MIN_DOCUMENT_ANSWER_LENGTH = 40;

export function validateDocumentAnswerContent(
  answer: string,
  langCode: string,
): { ok: true } | { ok: false; reason: string } {
  const trimmed = answer.trim();
  if (trimmed.length < MIN_DOCUMENT_ANSWER_LENGTH) {
    return {
      ok: false,
      reason: `Document answer must be at least ${MIN_DOCUMENT_ANSWER_LENGTH} characters and include summary, key points, and answers sections.`,
    };
  }

  const labels = getDocumentSectionLabels(langCode);
  for (const label of [labels.summary, labels.keyPoints, labels.answers]) {
    if (!trimmed.includes(label)) {
      return {
        ok: false,
        reason: `Document answer must include section header "${label}" with content below it.`,
      };
    }
  }

  return { ok: true };
}

export function buildDocumentRegenerationHint(reason: string): string {
  return `Your previous JSON failed validation: ${reason}\n\nReturn ONLY valid JSON: { "answer": "..." }. Inside answer, include all three section headers (translated to the app language) with a short summary, key points, and answers to document questions when available.`;
}
