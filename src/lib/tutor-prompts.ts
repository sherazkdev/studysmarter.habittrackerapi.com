const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  zh: "Chinese",
  de: "German",
  fr: "French",
  pt: "Portuguese",
  es: "Spanish",
  it: "Italian",
  tr: "Turkish",
  id: "Indonesian",
  ms: "Malay",
};

function resolveLanguageName(code: string): string {
  return LANGUAGE_NAMES[code.toLowerCase()] ?? "English";
}

function languageScriptHint(code: string): string {
  switch (code.toLowerCase()) {
    case "ar":
      return "Write all explanations in Arabic script (العربية).";
    case "zh":
      return "Write all explanations in Simplified Chinese (简体中文).";
    case "de":
      return "Write all explanations in German (Deutsch).";
    case "fr":
      return "Write all explanations in French (Français).";
    case "pt":
      return "Write all explanations in Portuguese (Português).";
    case "es":
      return "Write all explanations in Spanish (Español).";
    case "it":
      return "Write all explanations in Italian (Italiano).";
    case "tr":
      return "Write all explanations in Turkish (Türkçe).";
    case "id":
      return "Write all explanations in Indonesian (Bahasa Indonesia).";
    case "ms":
      return "Write all explanations in Malay (Bahasa Melayu).";
    default:
      return "Write all explanations in English.";
  }
}

export function normalizeLanguageCode(code: string | undefined | null): string {
  if (!code?.trim()) return "en";
  const lower = code.trim().toLowerCase();
  return LANGUAGE_NAMES[lower] ? lower : "en";
}

/** Localized summary line label for plain-text study answers (validated server-side). */
export function getTextSummaryLabel(code: string): string {
  switch (normalizeLanguageCode(code)) {
    case "ar":
      return "ملخص:";
    case "zh":
      return "总结：";
    case "de":
      return "Zusammenfassung:";
    case "fr":
      return "Résumé :";
    case "pt":
      return "Resumo:";
    case "es":
      return "Resumen:";
    case "it":
      return "Riepilogo:";
    case "tr":
      return "Özet:";
    case "id":
      return "Ringkasan:";
    case "ms":
      return "Ringkasan:";
    default:
      return "Summary:";
  }
}

/** Section headers required inside document `answer` string (validated server-side). */
export function getDocumentSectionLabels(code: string): {
  summary: string;
  keyPoints: string;
  answers: string;
} {
  switch (normalizeLanguageCode(code)) {
    case "ar":
      return { summary: "الملخص:", keyPoints: "النقاط الرئيسية:", answers: "الإجابات:" };
    case "zh":
      return { summary: "摘要：", keyPoints: "要点：", answers: "解答：" };
    case "de":
      return { summary: "Zusammenfassung:", keyPoints: "Wichtige Punkte:", answers: "Antworten:" };
    case "fr":
      return { summary: "Résumé :", keyPoints: "Points clés :", answers: "Réponses :" };
    case "pt":
      return { summary: "Resumo:", keyPoints: "Pontos principais:", answers: "Respostas:" };
    case "es":
      return { summary: "Resumen:", keyPoints: "Puntos clave:", answers: "Respuestas:" };
    case "it":
      return { summary: "Riepilogo:", keyPoints: "Punti chiave:", answers: "Risposte:" };
    case "tr":
      return { summary: "Özet:", keyPoints: "Önemli noktalar:", answers: "Yanıtlar:" };
    case "id":
      return { summary: "Ringkasan:", keyPoints: "Poin utama:", answers: "Jawaban:" };
    case "ms":
      return { summary: "Ringkasan:", keyPoints: "Perkara utama:", answers: "Jawapan:" };
    default:
      return { summary: "Summary:", keyPoints: "Key points:", answers: "Answers:" };
  }
}

export function buildLanguageSystemInstruction(code: string): string {
  const languageName = resolveLanguageName(code);
  const scriptHint = languageScriptHint(code);

  return `OUTPUT LANGUAGE (MANDATORY — highest priority after correctness):
- Selected app language: ${languageName} (code: ${code})
- ${scriptHint}
- Every word of the response must be in ${languageName}.
- If the student asks in another language, still answer in ${languageName}.
- If an image or document uses another language, understand it but respond in ${languageName}.
- Do not switch to English unless ${languageName} is English.
- Translate explanations, steps, summaries, titles, and JSON text values into ${languageName}.
- Math symbols (√, ×, ÷, +, −, =) may stay as symbols; surrounding text must be in ${languageName}.`;
}

/** Study Smarter master tutor policy (sections 1, 3–6, 9–12). */
export function buildTutorSystemInstruction(): string {
  return `You are the AI Study Tutor for the Study Smarter application.

Act as an intelligent, helpful study tutor. Help with Mathematics, Physics, Chemistry, Biology, Computer Science, History, Geography, Programming, general study questions, and other academic subjects.

Primary purpose: help the student understand the topic, not only give an unexplained final answer.

Prioritize: (1) correctness, (2) clear explanations, (3) simple language, (4) student understanding, (5) concise easy-to-follow responses. Do not make answers unnecessarily long or complicated.

MATHEMATICS (plain-text responses):
- Solve correctly; explain step-by-step; label steps clearly; every step understandable.
- Plain-text math only — no LaTeX. Use √, ×, ÷, +, −, = where appropriate.
- Do not skip important calculation steps.
- State the final answer clearly and give the approximate numerical value when applicable.

NON-MATH STUDY:
- Clear, simple explanations; focus on the question; avoid unnecessary information; use examples when helpful; stay concise but sufficient.

NON-STUDY QUESTIONS:
- Briefly and politely say you are designed for study-related topics only. Do not give a long unrelated answer.

SUMMARY (normal text answers only — not image/document JSON):
- Always end with a new line starting with the exact summary label provided in the user message, then a short summary in the selected app language (plain text, no Markdown).

ACCURACY:
- Understand what the student is asking; use provided text, image, or document; do not invent facts from images/documents.
- If content is unclear or unreadable, say so instead of guessing.
- Check calculations; final answer must match the steps.

TONE:
- Clear, simple, concise, educational, easy to follow. Avoid long intros, repetition, jargon, and irrelevant detail. Prefer simpler wording when accuracy allows.

OUTPUT:
- Follow the required format for each request type. Never add unnecessary content outside the required format.`;
}

export function languageReminder(code: string): string {
  const languageName = resolveLanguageName(code);
  return `\n\n[REMINDER: Your complete response must be written in ${languageName} (${code}) only.]`;
}

export function buildImageUserPrompt(langCode: string): string {
  return `Read and understand the image. Identify the study question. Solve or explain it in the selected app language.

For Mathematics or Calculus, return valid JSON only:
{
  "answer": "...",
  "verification": "...",
  "steps": [
    {"stepNumber": 1, "stepTitle": "...", "stepDescription": "..."}
  ],
  "why": {
    "exampleTitle": "...",
    "explanation": "...",
    "keyPoints": ["...", "..."],
    "conclusion": "..."
  }
}
- answer: final answer. verification: check the result when applicable.
- steps: full logical solution; include approximate numeric value in the final step when applicable.
- why: concept behind the solution; keyPoints and conclusion for the student.
- Plain-text math symbols only (no LaTeX). All JSON text in the app language.

For other study subjects, return valid JSON only:
{
  "answer": "...",
  "explanation": "..."
}

Use exactly one of the two schemas above. Do not mix fields from both. Do not add extra JSON keys.

No Markdown outside JSON. No text before or after the JSON.
${languageReminder(langCode)}`;
}

export function buildFileUserPrompt(langCode: string): string {
  const labels = getDocumentSectionLabels(langCode);
  return `Read the document text below. Combine into one string inside JSON field "answer":
1) Short summary under header line: ${labels.summary}
2) Key points under header line: ${labels.keyPoints}
3) Answers to questions in the document (when available) under header line: ${labels.answers}

Return ONLY valid JSON:
{
  "answer": "Everything combined here as one text string with the three headers above"
}

All text in the selected app language. No Markdown outside JSON.
${languageReminder(langCode)}`;
}

export function buildTextAskUserPrompt(prompt: string, langCode: string): string {
  const summaryLabel = getTextSummaryLabel(langCode);
  return `${prompt.trim()}

FORMAT (mandatory for study questions):
- Plain text only for math (no LaTeX).
- Step-by-step for math; approximate numeric value when applicable.
- End with a final line starting with exactly: ${summaryLabel}
  then write a short summary on the same or following lines.
${languageReminder(langCode)}`;
}
