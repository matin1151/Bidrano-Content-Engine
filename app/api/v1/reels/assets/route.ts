import { randomUUID } from "node:crypto";
import { success } from "../../../../../lib/server/api-response";
import { localReelAccess } from "../../../../../lib/server/reel-jobs";
import { atomicJson, imageMime, limitedBytes, saveMedia } from "../../../../../lib/server/reel-media";
import { reelFailure } from "../../../../../lib/server/reel-response";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    localReelAccess(request);
    const bytes = await limitedBytes(request, 6 * 1024 * 1024);
    const mime = imageMime(bytes), id = randomUUID();
    await saveMedia(id, bytes); await atomicJson(id, { id, mime });
    return success({ id, mediaUrl: `/api/v1/reels/media/${id}` }, 201);
  } catch (error) { return reelFailure(error); }
}
