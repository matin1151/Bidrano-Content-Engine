import type { AiProvider } from "../reels";

export class ReelError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export type ProviderConfig = {
  id: string; label: string; adapter: "openai-video" | "openai-image" | "replicate";
  capability: "video" | "image"; model: string; tokenEnv: string;
  seconds: number[]; promptField: string; imageField?: string; secondsField?: string;
  input: Record<string, unknown>;
};
const field = (value: unknown) => typeof value === "string" && /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(value);
export function providerConfigs(): ProviderConfig[] {
  let raw: unknown;
  try { raw = JSON.parse(process.env.BIDRANO_AI_PROVIDERS || "[]"); }
  catch { throw new ReelError("AI provider configuration is invalid", 503); }
  if (!Array.isArray(raw) || raw.length > 20) throw new ReelError("AI provider configuration is invalid", 503);
  const ids = new Set<string>();
  return raw.map((value) => {
    const p = value as Partial<ProviderConfig> | null;
    if (!p || typeof p.id !== "string" || !/^[a-z0-9-]{1,50}$/.test(p.id) || ids.has(p.id) ||
      typeof p.label !== "string" || !p.label.trim() || p.label.length > 100 ||
      !["openai-video", "openai-image", "replicate"].includes(p.adapter || "") ||
      !["video", "image"].includes(p.capability || "") || typeof p.model !== "string" || !p.model.trim() ||
      !field(p.tokenEnv) || !Array.isArray(p.seconds) || !p.seconds.length ||
      p.seconds.some((n) => !Number.isInteger(n) || n < 4 || n > 12) ||
      (p.adapter === "openai-video" && p.capability !== "video") ||
      (p.adapter === "openai-image" && p.capability !== "image") ||
      (p.promptField !== undefined && !field(p.promptField)) ||
      (p.imageField !== undefined && !field(p.imageField)) ||
      (p.secondsField !== undefined && !field(p.secondsField)) ||
      (p.input !== undefined && (!p.input || typeof p.input !== "object" || Array.isArray(p.input)))) {
      throw new ReelError("AI provider configuration is invalid", 503);
    }
    ids.add(p.id);
    return { ...p, promptField: p.promptField || "prompt", input: p.input || {} } as ProviderConfig;
  });
}
export function publicProviders(): AiProvider[] {
  return providerConfigs().map((p) => ({ id: p.id, label: p.label, model: p.model, capability: p.capability,
    ready: Boolean(process.env[p.tokenEnv]), supportsReference: p.adapter !== "replicate" || Boolean(p.imageField), seconds: p.seconds }));
}
export function configuredProvider(id: string) {
  const p = providerConfigs().find((item) => item.id === id);
  if (!p || !process.env[p.tokenEnv]) throw new ReelError("This AI provider is not configured", 503);
  return p;
}
export async function providerRequest(p: ProviderConfig, path: string, init: RequestInit = {}) {
  const root = p.adapter === "replicate" ? "https://api.replicate.com/v1" : "https://api.openai.com/v1";
  const response = await fetch(root + path, { ...init, redirect: "error", cache: "no-store",
    headers: { ...Object.fromEntries(new Headers(init.headers)), Authorization: `Bearer ${process.env[p.tokenEnv]}` },
    signal: AbortSignal.timeout(180000) });
  if (!response.ok) {
    await response.body?.cancel();
    // Do not expose upstream response bodies: they can contain credentials or reference images.
    throw new ReelError(`AI service returned HTTP ${response.status}. No automatic retry was made.`, 502);
  }
  return response;
}
export async function downloadOutput(url: string): Promise<Response> {
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new ReelError("Invalid provider media URL", 502); }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port ||
    !(parsed.hostname === "replicate.delivery" || parsed.hostname.endsWith(".replicate.delivery"))) {
    throw new ReelError("Provider media host is not allowed", 502);
  }
  // Never forward the API token to an output CDN or follow redirects to arbitrary hosts.
  const response = await fetch(parsed, { redirect: "error", signal: AbortSignal.timeout(180000) });
  if (!response.ok) throw new ReelError("Could not download AI output; check again without regenerating", 502);
  return response;
}
