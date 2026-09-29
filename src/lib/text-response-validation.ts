import { getTextSummaryLabel } from "@/lib/tutor-prompts";
import { validateResponseLanguage } from "@/lib/language-validation";

const LATEX_PATTERN =
  /\\(\[|\]|frac|begin\{|end\{|sqrt|sum|int|left|right)|(\$\$[\s\S]*?\$\$)|(\$[^$\n]+\$)/;

export function containsLatex(text: string): boolean {
  return LATEX_PATTERN.test(text);
}

export function hasRequiredTextSummary(text: string, langCode: string): boolean {
  const label = getTextSummaryLabel(langCode);
  const idx = text.lastIndexOf(label);
  if (idx === -1) return false;
  const after = text.slice(idx + label.length).trim();
  return after.length >= 8;
}

export type TextResponseValidation =
  | { ok: true }
  | { ok: false; reasons: string[] };

export function validatePlainTextStudyResponse(
  text: string,
  langCode: string,
): TextResponseValidation {
  const reasons: string[] = [];

  if (containsLatex(text)) {
    reasons.push("Response must not contain LaTeX; use plain-text math symbols only.");
  }

  const langCheck = validateResponseLanguage(text, langCode);
  if (!langCheck.ok) {
    reasons.push(langCheck.reason);
  }

  if (!hasRequiredTextSummary(text, langCode)) {
    const isLikelyNonStudyBrief =
      text.trim().length <= 320 && !containsLatex(text) && text.split(/\n/).length <= 6;
    if (!isLikelyNonStudyBrief) {
      reasons.push(
        `Response must end with a short summary introduced by the exact label: ${getTextSummaryLabel(langCode)}`,
      );
    }
  }

  if (reasons.length) return { ok: false, reasons };
  return { ok: true };
}

export function buildTextRegenerationHint(reasons: string[]): string {
  return `Your previous answer failed validation:\n- ${reasons.join("\n- ")}\n\nRegenerate the full answer. For math: step-by-step, plain symbols (√ × ÷), approximate numeric value when applicable, no LaTeX. End with the required summary label and a concise summary in the selected app language. For non-study questions: brief study-only message only.`;
}
