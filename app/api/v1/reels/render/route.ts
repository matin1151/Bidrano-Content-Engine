import { success } from "../../../../../lib/server/api-response";
import { localReelAccess, renderReel } from "../../../../../lib/server/reel-jobs";
import { reelBody, reelFailure } from "../../../../../lib/server/reel-response";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try { localReelAccess(request); return success(await renderReel(await reelBody(request))); }
  catch (error) { return reelFailure(error); }
}
