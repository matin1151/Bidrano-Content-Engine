import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { CustomerValidationError } from "./customers";

export function success(data: unknown, status = 200, nextCursor?: string | null) {
  return NextResponse.json({ data, meta: { requestId: randomUUID(), ...(nextCursor !== undefined ? { nextCursor } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } });
}

export function failure(code: string, message: string, status: number, fields?: Record<string, string>) {
  return NextResponse.json({ error: { code, message, requestId: randomUUID(), ...(fields ? { fields } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } });
}

export function handleError(error: unknown) {
  if (error instanceof CustomerValidationError) return failure("VALIDATION_ERROR", error.message, 400, error.fields);
  return failure("INTERNAL_ERROR", "Could not access customer data", 500);
}

export async function body(request: Request): Promise<unknown> {
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > 65536) throw new CustomerValidationError({ body: "Request is too large" });
  try { return JSON.parse(text); }
  catch { throw new CustomerValidationError({ body: "Invalid JSON" }); }
}
