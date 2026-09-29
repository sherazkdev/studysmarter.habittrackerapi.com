import pipeline from "@/middlewares/pipeline";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = await pipeline(request);
  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
