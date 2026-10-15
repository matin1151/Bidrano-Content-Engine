import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import type { ReelJob } from "../reels";
import { isUuid, reelDuration, TRANSITIONS, type Transition } from "../reels";
import { configuredProvider, downloadOutput, providerRequest, ReelError, type ProviderConfig } from "./reel-providers";
import { atomicJson, imageMime, limitedBytes, mediaPath, readRecord, renderClips, saveMedia, videoReference } from "./reel-media";

type StoredJob = ReelJob & { fingerprint: string; remoteId?: string; checkedAt?: number; mime?: string; adapter?: string; model?: string };
export type Asset = { id: string; mime: string };
const locks = new Map<string, Promise<unknown>>();
async function locked<T>(id: string, action: () => Promise<T>): Promise<T> {
  const previous = locks.get(id) || Promise.resolve();
  const pending = previous.catch(() => {}).then(action);
  locks.set(id, pending);
  try { return await pending; } finally { if (locks.get(id) === pending) locks.delete(id); }
}
export function publicJob(job: StoredJob): ReelJob {
  return { id: job.id, providerId: job.providerId, capability: job.capability,
    status: job.status, seconds: job.seconds, ...(job.error ? { error: job.error } : {}),
    ...(job.status === "ready" ? { mediaUrl: `/api/v1/reels/media/${job.id}` } : {}) };
}
export function localReelAccess(request: Request, enabled = true) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    (origin && origin !== url.origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new ReelError("Reel studio is local-only until authentication is implemented", 403);
  }
  if (enabled && process.env.BIDRANO_REELS_ENABLED !== "true") throw new ReelError("AI generation is disabled on this server", 503);
}
export async function referenceAsset(id: unknown) {
  if (!isUuid(id)) throw new ReelError("Invalid reference image");
  const asset = await readRecord<Asset>(id);
  if (!asset || !asset.mime?.startsWith("image/")) throw new ReelError("Reference image not found", 404);
  const bytes = await readFile(mediaPath(id));
  return { bytes, mime: imageMime(bytes) };
}
function remoteId(value: unknown) {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,200}$/.test(value)) throw new ReelError("Invalid AI job response", 502);
  return value;
}
async function applyRemote(job: StoredJob, p: ProviderConfig, value: unknown) {
  if (!value || typeof value !== "object") throw new ReelError("Invalid AI response", 502);
  const remote = value as Record<string, unknown>;
  job.remoteId = remoteId(remote.id);
  await atomicJson(job.id, job);
  if (["failed", "canceled"].includes(String(remote.status))) {
    job.status = "failed"; job.error = "AI generation failed or was cancelled. Review the provider dashboard before retrying.";
  } else if (["completed", "succeeded"].includes(String(remote.status))) {
    const response = p.adapter === "openai-video" ? await providerRequest(p, `/videos/${job.remoteId}/content`) :
      await downloadOutput(String(Array.isArray(remote.output) ? remote.output[0] : remote.output));
    const bytes = await limitedBytes(response, 100 * 1024 * 1024);
    if (p.capability === "image") job.mime = imageMime(bytes);
    else {
      if (bytes.subarray(4, 8).toString() !== "ftyp") throw new ReelError("AI output is not an MP4 video", 502);
      job.mime = "video/mp4";
    }
    await saveMedia(job.id, bytes);
    job.status = "ready"; delete job.error;
  } else if (["queued", "starting", "in_progress", "processing"].includes(String(remote.status))) {
    job.status = ["queued", "starting"].includes(String(remote.status)) ? "queued" : "running";
  } else throw new ReelError("Unknown AI job status", 502);
  job.checkedAt = Date.now();
  await atomicJson(job.id, job);
  return publicJob(job);
}
export async function createReelJob(raw: unknown) {
  if (!raw || typeof raw !== "object") throw new ReelError("Invalid generation request");
  const r = raw as Record<string, unknown>;
  if (!isUuid(r.id) || typeof r.providerId !== "string" || typeof r.prompt !== "string" ||
    !r.prompt.trim() || r.prompt.length > 6000 || typeof r.seconds !== "number") throw new ReelError("Invalid generation request");
  const p = configuredProvider(r.providerId);
  if (!p.seconds.includes(r.seconds)) throw new ReelError("Unsupported scene duration");
  if (r.referenceId !== undefined && p.adapter === "replicate" && !p.imageField) throw new ReelError("This provider does not accept reference images");
  if (p.capability === "image" && !r.referenceId) throw new ReelError("Choose a reference image to optimize");
  let reference: { bytes: Buffer; mime: string } | null = r.referenceId ? await referenceAsset(r.referenceId) : null;
  const fingerprint = createHash("sha256").update(JSON.stringify([p, r.prompt.trim(), r.seconds, r.referenceId || null])).digest("hex");
  const id = r.id;
  return locked(id, async () => {
    const existing = await readRecord<StoredJob>(id);
    if (existing) {
      if (existing.fingerprint !== fingerprint) throw new ReelError("This request ID was already used for a different generation", 409);
      return publicJob(existing);
    }
    if (reference && p.adapter === "openai-video") reference = { bytes: await videoReference(String(r.referenceId)), mime: "image/png" };
    const job: StoredJob = { id, providerId: p.id, capability: p.capability, status: "submitting",
      seconds: r.seconds as number, fingerprint, adapter: p.adapter, model: p.model };
    // Reserve the request ID before any billable request; timeouts never trigger another generation.
    await atomicJson(id, job);
    try {
      const prompt = String(r.prompt).trim() + (p.capability === "image" ?
        "\nImprove lighting, clarity and background. Preserve product geometry, exact lettering, logo and identity. Do not invent product details." :
        "\nPortrait 9:16. Keep the subject in the central safe area. No titles, captions or added logos. Consistent lighting and color. Smooth intentional camera movement.");
      if (p.adapter === "replicate") {
        const input = { ...p.input, [p.promptField]: prompt,
          ...(p.secondsField && p.capability === "video" ? { [p.secondsField]: r.seconds } : {}),
          ...(reference && p.imageField ? { [p.imageField]: `data:${reference.mime};base64,${reference.bytes.toString("base64")}` } : {}) };
        const response = await providerRequest(p, "/predictions", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version: p.model, input }) });
        return await applyRemote(job, p, await response.json());
      }
      const form = new FormData();
      form.set("model", p.model); form.set("prompt", prompt);
      if (p.adapter === "openai-video") {
        form.set("seconds", String(r.seconds)); form.set("size", "720x1280");
        if (reference) form.set("input_reference", new Blob([new Uint8Array(reference.bytes)], { type: reference.mime }), "reference");
        const response = await providerRequest(p, "/videos", { method: "POST", body: form });
        return await applyRemote(job, p, await response.json());
      }
      form.set("size", "1024x1536"); form.set("output_format", "png");
      form.set("image", new Blob([new Uint8Array(reference!.bytes)], { type: reference!.mime }), reference!.mime === "image/png" ? "reference.png" : "reference.jpg");
      const response = await providerRequest(p, "/images/edits", { method: "POST", body: form });
      const output = await response.json();
      const encoded = output?.data?.[0]?.b64_json;
      if (typeof encoded !== "string" || encoded.length > 40 * 1024 * 1024) throw new ReelError("Invalid optimized image response", 502);
      const bytes = Buffer.from(encoded, "base64");
      job.mime = imageMime(bytes);
      await saveMedia(id, bytes); job.status = "ready";
      await atomicJson(id, job);
      return publicJob(job);
    } catch (error) {
      job.status = job.remoteId ? "running" : "uncertain";
      job.error = error instanceof ReelError ? error.message : "AI request interrupted. Check the provider dashboard before starting another paid generation.";
      await atomicJson(id, job);
      return publicJob(job);
    }
  });
}
export async function pollReelJob(id: string) {
  return locked(id, async () => {
    const job = await readRecord<StoredJob>(id);
    if (!job || !job.providerId) throw new ReelError("Generation not found", 404);
    if (job.status === "submitting") return publicJob({ ...job, status: "uncertain", error: "Submission may still be running. Check again; do not create a duplicate paid request." });
    if (!["queued", "running"].includes(job.status) || !job.remoteId || Date.now() - (job.checkedAt || 0) < 3000) return publicJob(job);
    const p = configuredProvider(job.providerId);
    if (p.adapter !== job.adapter || p.model !== job.model) throw new ReelError("Provider configuration changed during generation", 409);
    const path = p.adapter === "replicate" ? "/predictions/" : "/videos/";
    const response = await providerRequest(p, path + remoteId(job.remoteId));
    return applyRemote(job, p, await response.json());
  });
}
let rendering = false;
export async function renderReel(raw: unknown) {
  const r = raw as { id?: unknown; scenes?: unknown } | null;
  if (!r || !isUuid(r.id) || !Array.isArray(r.scenes) || r.scenes.length < 2 || r.scenes.length > 6) throw new ReelError("Use 2 to 6 completed video scenes");
  const scenes = r.scenes as { jobId: string; seconds: number; transition: Transition }[];
  if (scenes.some((s) => !s || !isUuid(s.jobId) || !Number.isInteger(s.seconds) || s.seconds < 4 || s.seconds > 12 || !TRANSITIONS.includes(s.transition))) throw new ReelError("Invalid render scenes");
  const duration = reelDuration(scenes);
  if (duration < 15 || duration > 30) throw new ReelError("Final reel duration must be 15 to 30 seconds");
  const fingerprint = createHash("sha256").update(JSON.stringify(scenes)).digest("hex");
  const existing = await readRecord<{ fingerprint?: string; mime?: string }>(r.id);
  if (existing) {
    if (existing.fingerprint !== fingerprint) throw new ReelError("Render request ID conflict", 409);
    return { id: r.id, mediaUrl: `/api/v1/reels/media/${r.id}`, duration };
  }
  if (rendering) throw new ReelError("Another render is in progress; please wait", 409);
  rendering = true;
  try {
    for (const scene of scenes) {
      const job = await readRecord<StoredJob>(scene.jobId);
      if (!job || job.status !== "ready" || job.capability !== "video" || job.seconds !== scene.seconds) throw new ReelError("Every scene must have a matching completed video");
    }
    await renderClips(r.id, scenes.map((s) => mediaPath(s.jobId)), scenes.map((s) => s.seconds), scenes.slice(0, -1).map((s) => s.transition));
    await atomicJson(r.id, { id: r.id, fingerprint, mime: "video/mp4", duration });
    return { id: r.id, mediaUrl: `/api/v1/reels/media/${r.id}`, duration };
  } finally { rendering = false; }
}
