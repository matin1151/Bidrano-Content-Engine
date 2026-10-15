import { success } from "../../../../../../lib/server/api-response";
import { localReelAccess, pollReelJob } from "../../../../../../lib/server/reel-jobs";
import { reelFailure } from "../../../../../../lib/server/reel-response";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { localReelAccess(request); return success(await pollReelJob((await params).id)); }
  catch (error) { return reelFailure(error); }
}
