import { NextResponse } from "next/server";

export function jsonError(
  message: string,
  statusCode: number,
  errors?: unknown,
  headers?: HeadersInit,
) {
  return NextResponse.json(
    {
      success: false,
      message,
      statusCode,
      ...(errors !== undefined ? { errors } : {}),
    },
    { status: statusCode, headers },
  );
}

export function jsonSuccess<T>(
  data: T,
  message: string,
  statusCode = 200,
  headers?: HeadersInit,
) {
  return NextResponse.json(
    {
      success: true,
      message,
      statusCode,
      data,
    },
    { status: statusCode, headers },
  );
}
