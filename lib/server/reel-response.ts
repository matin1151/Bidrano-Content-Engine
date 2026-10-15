import { failure } from "./api-response";
import { ReelError } from "./reel-providers";
import { limitedBytes } from "./reel-media";
import { MAX_JSON_BYTES } from "../validation";
export function reelFailure(error: unknown) {
  return failure("REEL_ERROR", error instanceof ReelError ? error.message : "Could not process reel request", error instanceof ReelError ? error.status : 500);
}
export async function reelBody(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new ReelError("Use application/json", 415);
  }
  const bytes = await limitedBytes(request, MAX_JSON_BYTES);
  try { return JSON.parse(bytes.toString("utf8")); }
  catch { throw new ReelError("Invalid JSON", 400); }
}
