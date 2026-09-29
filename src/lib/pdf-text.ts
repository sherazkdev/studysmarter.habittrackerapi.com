export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    const result = await parser.getText();
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
  } finally {
    await parser.destroy();
  }
}
