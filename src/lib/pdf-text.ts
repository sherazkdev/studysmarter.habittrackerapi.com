export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  const text = result.text?.trim() ?? "";
  if (!text) {
    throw new Error(
      "Could not extract text from this PDF. Scanned or image-only PDFs are not supported (text extraction only, no OCR).",
    );
  }
  const maxChars = 120_000;
  return text.length > maxChars
    ? `${text.slice(0, maxChars)}\n\n[Document truncated for processing.]`
    : text;
}
