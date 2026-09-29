import { buildOpenApiDocument } from "@/openapi/spec";
import env from "@/lib/env";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const doc = buildOpenApiDocument(env.publicBaseUrl);
  return NextResponse.json(doc, {
    headers: {
      "Cache-Control": "public, max-age=60",
    },
  });
}
