import { z } from "zod";

const mathStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  stepTitle: z.string().min(1),
  stepDescription: z.string().min(1),
});

const mathWhySchema = z.object({
  exampleTitle: z.string().min(1),
  explanation: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).min(1),
  conclusion: z.string().min(1),
});

/** Master Prompt §7 — Mathematics / Calculus image JSON (strict, no extra keys). */
export const imageMathResponseSchema = z
  .object({
    answer: z.string().min(1),
    verification: z.string().min(1),
    steps: z.array(mathStepSchema).min(1),
    why: mathWhySchema,
  })
  .strict();

/** Master Prompt §7 — other study subjects image JSON (strict). */
export const imageNonMathResponseSchema = z
  .object({
    answer: z.string().min(1),
    explanation: z.string().min(1),
  })
  .strict();

/** Master Prompt §8 — external shape (content validated separately). */
export const documentResponseSchema = z
  .object({
    answer: z.string().min(1),
  })
  .strict();

export type ImageMathResponse = z.infer<typeof imageMathResponseSchema>;
export type ImageNonMathResponse = z.infer<typeof imageNonMathResponseSchema>;
export type DocumentResponse = z.infer<typeof documentResponseSchema>;

export function parseImageStructuredResponse(
  value: unknown,
): ImageMathResponse | ImageNonMathResponse {
  const math = imageMathResponseSchema.safeParse(value);
  if (math.success) {
    return math.data;
  }
  const nonMath = imageNonMathResponseSchema.safeParse(value);
  if (nonMath.success) {
    return nonMath.data;
  }
  const issues = [...(math.error?.issues ?? []), ...(nonMath.error?.issues ?? [])];
  const detail = issues
    .slice(0, 5)
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  throw new Error(
    detail || "JSON must match either the math/calculus schema or the non-math image schema.",
  );
}
