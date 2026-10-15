import { mkdir, readFile, writeFile, rename, unlink } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { isUuid, REEL_OUTPUT, TRANSITION_SECONDS, TRANSITIONS, type Transition } from "../reels";
import { ReelError } from "./reel-providers";

export const reelDirectory = () => join(process.cwd(), ".bidrano-data", "reels");
export function mediaPath(id: string) {
  if (!isUuid(id)) throw new ReelError("Media not found", 404);
  return join(reelDirectory(), id + ".bin");
}
export async function atomicJson(id: string, data: unknown) {
  mediaPath(id);
  await mkdir(reelDirectory(), { recursive: true });
  const target = join(reelDirectory(), id + ".json");
  const temporary = target + "." + randomUUID() + ".tmp";
  try { await writeFile(temporary, JSON.stringify(data)); await rename(temporary, target); }
  finally { await unlink(temporary).catch(() => {}); }
}
export async function readRecord<T>(id: string): Promise<T | null> {
  mediaPath(id);
  try { return JSON.parse(await readFile(join(reelDirectory(), id + ".json"), "utf8")) as T; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}
export async function limitedBytes(request: Request | Response, limit: number) {
  const reader = request.body?.getReader();
  if (!reader) throw new ReelError("Empty media", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); throw new ReelError("Media file is too large", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (!size) throw new ReelError("Empty media", 400);
  return Buffer.concat(chunks);
}
export function imageMime(bytes: Buffer) {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  throw new ReelError("Use a PNG or JPEG image", 415);
}
export async function saveMedia(id: string, bytes: Buffer) {
  await mkdir(reelDirectory(), { recursive: true });
  const path = mediaPath(id), temp = path + "." + randomUUID() + ".tmp";
  try { await writeFile(temp, bytes); await rename(temp, path); }
  finally { await unlink(temp).catch(() => {}); }
}
const execute = promisify(execFile);
export async function ffmpegAvailable() {
  if (!process.env.BIDRANO_FFMPEG_PATH) return false;
  try { await execute(process.env.BIDRANO_FFMPEG_PATH, ["-version"], { timeout: 5000, windowsHide: true }); return true; }
  catch { return false; }
}
function fitFrame(input: string, name: string, width: number, height: number) {
  return `${input}split[${name}a][${name}b];[${name}a]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},boxblur=24:2[${name}bg];[${name}b]scale=${width}:${height}:force_original_aspect_ratio=decrease[${name}fg];[${name}bg][${name}fg]overlay=(W-w)/2:(H-h)/2,setsar=1`;
}
export async function videoReference(id: string): Promise<Buffer> {
  if (!process.env.BIDRANO_FFMPEG_PATH) throw new ReelError("FFmpeg is required to fit the reference image to 720x1280", 503);
  const output = mediaPath(id) + "." + randomUUID() + ".png";
  try {
    await execute(process.env.BIDRANO_FFMPEG_PATH, ["-y", "-nostdin", "-filter_complex_threads", "1", "-i", mediaPath(id),
      "-filter_complex", fitFrame("[0:v]", "ref", 720, 1280) + "[out]", "-map", "[out]", "-frames:v", "1", output],
      { timeout: 30000, windowsHide: true });
    return await readFile(output);
  } catch { throw new ReelError("Could not prepare reference image. No AI request was sent.", 422); }
  finally { await unlink(output).catch(() => {}); }
}
export function transitionGraph(seconds: number[], transitions: Transition[]) {
  const { width, height, fps } = REEL_OUTPUT;
  const filters = seconds.map((duration, i) => fitFrame(`[${i}:v]`, `s${i}`, width, height) + `,fps=${fps},tpad=stop_mode=clone:stop_duration=${duration},trim=duration=${duration},settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p[v${i}]`);
  let elapsed = seconds[0];
  for (let i = 1; i < seconds.length; i++) {
    if (!TRANSITIONS.includes(transitions[i - 1])) throw new ReelError("Invalid transition");
    const left = i === 1 ? "v0" : `x${i - 1}`;
    filters.push(`[${left}][v${i}]xfade=transition=${transitions[i - 1]}:duration=${TRANSITION_SECONDS}:offset=${(elapsed - TRANSITION_SECONDS).toFixed(3)}[x${i}]`);
    elapsed += seconds[i] - TRANSITION_SECONDS;
  }
  return filters.join(";");
}
export async function renderClips(id: string, inputs: string[], seconds: number[], transitions: Transition[]) {
  if (!process.env.BIDRANO_FFMPEG_PATH) throw new ReelError("FFmpeg is not configured", 503);
  const output = mediaPath(id) + ".mp4";
  // All paths are server-created IDs; execFile does not invoke a shell.
  const args = ["-y", "-nostdin", "-filter_complex_threads", "1", ...inputs.flatMap((path) => ["-i", path]),
    "-filter_complex", transitionGraph(seconds, transitions), "-map", `[x${inputs.length - 1}]`,
    "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output];
  try {
    await execute(process.env.BIDRANO_FFMPEG_PATH, args, { timeout: 300000, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
    await rename(output, mediaPath(id));
  } catch { throw new ReelError("Video render failed. Original scene clips are unchanged.", 502); }
  finally { await unlink(output).catch(() => {}); }
}
