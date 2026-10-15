export const REEL_OUTPUT = { width: 1080, height: 1920, fps: 30 } as const;
export const TRANSITIONS = ["fade", "smoothleft", "wipeleft"] as const;
export type Transition = typeof TRANSITIONS[number];
export type AiProvider = {
  id: string; label: string; capability: "video" | "image"; model: string;
  ready: boolean; supportsReference: boolean; seconds: number[];
};
export type ReelJob = {
  id: string; providerId: string; capability: "video" | "image";
  status: "submitting" | "queued" | "running" | "ready" | "failed" | "uncertain";
  seconds: number; error?: string; mediaUrl?: string;
};
export type ReelScene = { id: string; prompt: string; providerId: string; seconds: number; transition: Transition; job?: ReelJob };
export const TRANSITION_SECONDS = 0.4;
export function reelDuration(scenes: Pick<ReelScene, "seconds">[]) {
  return Math.round((scenes.reduce((sum, scene) => sum + scene.seconds, 0) - Math.max(0, scenes.length - 1) * TRANSITION_SECONDS) * 10) / 10;
}
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
}
