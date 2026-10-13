import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { CustomerConflictError, CustomerValidationError } from "./customers";
import { MAX_JSON_BYTES } from "../validation";

export function success(data: unknown, status = 200, nextCursor?: string | null) {
  return NextResponse.json({ data, meta: { requestId: randomUUID(), ...(nextCursor !== undefined ? { nextCursor } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } });
}
export function failure(code: string, message: string, status: number, fields?: Record<string, string>) {
  return NextResponse.json({ error: { code, message, requestId: randomUUID(), ...(fields ? { fields } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } });
}
class RequestError extends Error {
  constructor(public code: string, message: string, public status: number) { super(message); }
}
export function handleError(error: unknown) {
  if (error instanceof CustomerValidationError) return failure("VALIDATION_ERROR", error.message, 400, error.fields);
  if (error instanceof CustomerConflictError) return failure("CONFLICT", error.message, 409);
  if (error instanceof RequestError) return failure(error.code, error.message, error.status);
  return failure("INTERNAL_ERROR", "Could not access customer data", 500);
}
export async function body(request: Request): Promise<unknown> {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new RequestError("FORBIDDEN", "Cross-origin writes are not allowed", 403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new RequestError("UNSUPPORTED_MEDIA_TYPE", "Use application/json", 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new CustomerValidationError({ body: "Invalid JSON" });
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_JSON_BYTES) {
        await reader.cancel();
        throw new RequestError("PAYLOAD_TOO_LARGE", "Request is too large", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new CustomerValidationError({ body: "Invalid JSON" }); }
}
