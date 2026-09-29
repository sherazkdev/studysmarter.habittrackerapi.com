import { z } from "zod";

export const languageCodeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z]{2}$/)
  .optional()
  .default("en");

export const askTextBodySchema = z.object({
  prompt: z.string().trim().min(1, "prompt is required").max(8000),
  languageCode: languageCodeSchema,
});

export const multipartLanguageSchema = z.object({
  languageCode: languageCodeSchema,
});

const maxImageBytes = 10 * 1024 * 1024;
const maxPdfBytes = 15 * 1024 * 1024;

export function validateImageFile(file: File | null): File {
  if (!file || !(file instanceof File) || file.size === 0) {
    throw new Error("image file is required");
  }
  if (file.size > maxImageBytes) {
    throw new Error("image must be 10MB or smaller");
  }
  const type = file.type.toLowerCase();
  if (type !== "image/jpeg" && type !== "image/jpg") {
    throw new Error("image must be JPEG");
  }
  return file;
}

export function validatePdfFile(file: File | null): File {
  if (!file || !(file instanceof File) || file.size === 0) {
    throw new Error("file is required");
  }
  if (file.size > maxPdfBytes) {
    throw new Error("PDF must be 15MB or smaller");
  }
  const type = file.type.toLowerCase();
  if (type !== "application/pdf") {
    throw new Error("file must be application/pdf");
  }
  return file;
}
