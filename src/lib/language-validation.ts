/**
 * Script-based checks for languages where wrong-language output is detectable.
 * Latin-script locales (de, fr, es, …) are not reliably detectable without extra NLP;
 * those rely on strengthened prompts — see README "Language enforcement".
 */

export const SCRIPT_VALIDATED_LANGUAGE_CODES = ["ar", "zh"] as const;

function letterLikeChars(text: string): string {
  return text.replace(/[\s\d\p{P}\p{S}√×÷+=−=]/gu, "");
}

export function validateResponseLanguage(
  text: string,
  langCode: string,
): { ok: true } | { ok: false; reason: string } {
  const code = langCode.toLowerCase();
  const sample = text.trim();
  if (!sample) {
    return { ok: false, reason: "Empty response." };
  }

  if (code === "en") {
    return { ok: true };
  }

  if (code === "ar") {
    const letters = letterLikeChars(sample);
    if (letters.length < 12) return { ok: true };
    const arabic = (letters.match(/[\u0600-\u06FF]/g) ?? []).length;
    if (arabic / letters.length < 0.25) {
      return {
        ok: false,
        reason: "Response does not appear to be in Arabic script.",
      };
    }
    return { ok: true };
  }

  if (code === "zh") {
    const letters = letterLikeChars(sample);
    if (letters.length < 8) return { ok: true };
    const han = (letters.match(/[\u4E00-\u9FFF]/g) ?? []).length;
    if (han / letters.length < 0.2) {
      return {
        ok: false,
        reason: "Response does not appear to be in Chinese characters.",
      };
    }
    return { ok: true };
  }

  return { ok: true };
}

export function collectJsonStringValues(value: unknown): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(value);
  return out;
}

export function validateJsonResponseLanguage(
  value: unknown,
  langCode: string,
): { ok: true } | { ok: false; reason: string } {
  if (!SCRIPT_VALIDATED_LANGUAGE_CODES.includes(langCode as "ar" | "zh")) {
    return { ok: true };
  }
  for (const text of collectJsonStringValues(value)) {
    const check = validateResponseLanguage(text, langCode);
    if (!check.ok) return check;
  }
  return { ok: true };
}
