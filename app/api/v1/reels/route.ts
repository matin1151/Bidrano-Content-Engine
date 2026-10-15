import { success } from "../../../../lib/server/api-response";
import { localReelAccess, createReelJob } from "../../../../lib/server/reel-jobs";
import { publicProviders } from "../../../../lib/server/reel-providers";
import { reelBody, reelFailure } from "../../../../lib/server/reel-response";
import { ffmpegAvailable } from "../../../../lib/server/reel-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    localReelAccess(request, false);
    return success({ enabled: process.env.BIDRANO_REELS_ENABLED === "true", providers: publicProviders(), renderer: await ffmpegAvailable() });
  } catch (error) { return reelFailure(error); }
}
export async function POST(request: Request) {
  try { localReelAccess(request); return success(await createReelJob(await reelBody(request))); }
  catch (error) { return reelFailure(error); }
}
