import { readFile } from "node:fs/promises";
import { localReelAccess } from "../../../../../../lib/server/reel-jobs";
import { mediaPath, readRecord } from "../../../../../../lib/server/reel-media";
import { ReelError } from "../../../../../../lib/server/reel-providers";
import { reelFailure } from "../../../../../../lib/server/reel-response";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    localReelAccess(request);
    const { id } = await params;
    const record = await readRecord<{ mime?: string; status?: string }>(id);
    if (!record?.mime || (record.status && record.status !== "ready")) throw new ReelError("Media not found", 404);
    const bytes = await readFile(mediaPath(id));
    const headers = new Headers({ "Content-Type": record.mime, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes" });
    const download = new URL(request.url).searchParams.has("download");
    if (download) headers.set("Content-Disposition", `attachment; filename="bidrano-${id}.${record.mime === "video/mp4" ? "mp4" : record.mime === "image/png" ? "png" : "jpg"}"`);
    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      const start = match ? Number(match[1]) : -1, end = match?.[2] ? Math.min(Number(match[2]), bytes.length - 1) : bytes.length - 1;
      if (start < 0 || start >= bytes.length || end < start) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.length}` } });
      headers.set("Content-Range", `bytes ${start}-${end}/${bytes.length}`); headers.set("Content-Length", String(end - start + 1));
      return new Response(new Uint8Array(bytes.subarray(start, end + 1)), { status: 206, headers });
    }
    headers.set("Content-Length", String(bytes.length));
    return new Response(new Uint8Array(bytes), { headers });
  } catch (error) { return reelFailure(error); }
}
