import pipeline from "@/middlewares/pipeline";
import { NextRequest, NextResponse } from "next/server";

/**
 * Tutor API middleware runs only under /api/v1.
 * POST to marketing/docs pages is rejected early so bot "Server Action" probes
 * (Next-Action: x, etc.) do not spam PM2 logs — see failed-to-find-server-action.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "POST" && !pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, message: "Method not allowed.", statusCode: 405 },
      { status: 405 },
    );
  }

  if (pathname.startsWith("/api/v1/")) {
    const response = await pipeline(request);
    return response ?? NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
