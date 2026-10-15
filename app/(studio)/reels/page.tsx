"use client";

import { useEffect, useRef, useState } from "react";
import { Clapperboard, Download, Film, ImagePlus, LoaderCircle, Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { isUuid, reelDuration, TRANSITIONS, type AiProvider, type ReelJob, type ReelScene } from "../../../lib/reels";
import { orderData } from "../../../lib/data";
import "./reels.css";

type Draft = { topic: string; scenes: ReelScene[]; referenceId?: string; optimized?: ReelJob; output?: string };
type Capabilities = { enabled: boolean; providers: AiProvider[]; renderer: boolean };
const KEY = "bidrano_reel_draft_v1";
const initialScenes: ReelScene[] = Array.from({ length: 3 }, (_, i) => ({ id: `scene-${i}`, prompt: "", providerId: "", seconds: 8, transition: "fade" }));
const statusLabels: Record<ReelJob["status"], string> = { submitting: "در حال ارسال", queued: "در صف", running: "در حال ساخت", ready: "آماده", failed: "ناموفق", uncertain: "نیازمند بررسی وضعیت" };
const transitionLabels = { fade: "محو نرم", smoothleft: "حرکت نرم", wipeleft: "عبور افقی" };
function validJob(value: unknown): value is ReelJob {
  if (!value || typeof value !== "object") return false;
  const j = value as ReelJob;
  return isUuid(j.id) && typeof j.providerId === "string" && ["video", "image"].includes(j.capability) &&
    Object.hasOwn(statusLabels, j.status) && Number.isInteger(j.seconds) &&
    (j.mediaUrl === undefined || j.mediaUrl === `/api/v1/reels/media/${j.id}`);
}
function readDraft(key: string): Draft | null {
  try {
    const d = JSON.parse(localStorage.getItem(key) || "null") as Draft | null;
    if (!d || typeof d.topic !== "string" || d.topic.length > 500 || !Array.isArray(d.scenes) || d.scenes.length < 2 || d.scenes.length > 6 ||
      new Set(d.scenes.map((s) => s?.id)).size !== d.scenes.length ||
      d.scenes.some((s) => !s || typeof s.id !== "string" || typeof s.prompt !== "string" || s.prompt.length > 6000 || typeof s.providerId !== "string" || !Number.isInteger(s.seconds) || s.seconds < 4 || s.seconds > 12 || !TRANSITIONS.includes(s.transition) || (s.job !== undefined && !validJob(s.job))) ||
      (d.referenceId !== undefined && !isUuid(d.referenceId)) || (d.optimized !== undefined && !validJob(d.optimized)) ||
      (d.output !== undefined && !/^\/api\/v1\/reels\/media\/[a-f0-9-]{36}$/.test(d.output))) return null;
    return d;
  } catch { return null; }
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch("/api/v1/reels" + path, { ...options, cache: "no-store", signal: AbortSignal.timeout(360000) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || "درخواست انجام نشد");
  return result.data as T;
}
export default function ReelStudio() {
  const [draft, setDraft] = useState<Draft>({ topic: "", scenes: initialScenes });
  const [loaded, setLoaded] = useState(false);
  const [config, setConfig] = useState<Capabilities>({ enabled: false, providers: [], renderer: false });
  const [imageProvider, setImageProvider] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [safeArea, setSafeArea] = useState(false);
  const operation = useRef(false);
  const storageKey = useRef(KEY);
  const draftRef = useRef(draft);
  const videoProviders = config.providers.filter((p) => p.capability === "video");
  const imageProviders = config.providers.filter((p) => p.capability === "image");
  const enabled = config.enabled && !busy;
  const duration = reelDuration(draft.scenes);
  function persist(next: Draft) {
    // A paid request cannot start unless its recovery ID has been saved locally.
    localStorage.setItem(storageKey.current, JSON.stringify(next));
    draftRef.current = next; setDraft(next);
  }
  function change(update: Partial<Draft>) {
    try { persist({ ...draftRef.current, ...update, output: undefined }); setError(""); }
    catch { setError("ذخیره پیش‌نویس انجام نشد. فضای ذخیره مرورگر را بررسی کنید."); }
  }
  function editScene(id: string, update: Partial<ReelScene>) {
    change({ scenes: draftRef.current.scenes.map((s) => s.id === id ? { ...s, ...update, ...(Object.keys(update).some((k) => k !== "transition") ? { job: undefined } : {}) } : s) });
  }
  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("order");
    storageKey.current = KEY + (orderId && orderId.length < 200 ? ":" + orderId : "");
    const saved = readDraft(storageKey.current);
    if (saved) { draftRef.current = saved; setDraft(saved); }
    const order = orderId ? orderData.get(orderId) : null;
    if (order?.contentType === "Reel" && !saved) {
      const next = { topic: order.topic, scenes: initialScenes.map((s) => ({ ...s })) };
      draftRef.current = next; setDraft(next);
    }
    setLoaded(true);
    const controller = new AbortController();
    fetch("/api/v1/reels", { signal: controller.signal, cache: "no-store" }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || "تنظیمات دریافت نشد");
      if (!controller.signal.aborted) setConfig(data.data);
    }).catch((e) => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, []);
  async function perform(name: string, action: () => Promise<void>) {
    if (operation.current) return;
    operation.current = true; setBusy(name); setError("");
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : "عملیات انجام نشد"); }
    finally { operation.current = false; setBusy(""); }
  }
  function saveJob(job: ReelJob, sceneId?: string) {
    const current = draftRef.current;
    persist(sceneId ? { ...current, scenes: current.scenes.map((s) => s.id === sceneId ? { ...s, job } : s), output: undefined } : { ...current, optimized: job });
  }
  async function generate(scene?: ReelScene) {
    await perform(scene?.id || "image", async () => {
      const current = draftRef.current;
      const provider = config.providers.find((p) => p.id === (scene ? scene.providerId : imageProvider));
      if (!provider?.ready) throw new Error("سرویس آماده‌ای انتخاب کنید");
      if (!window.confirm(`درخواست به ${provider.label} ارسال شود؟ این تولید ممکن است هزینه داشته باشد؛ تلاش مجدد خودکار انجام نمی‌شود.`)) return;
      const job: ReelJob = { id: crypto.randomUUID(), providerId: provider.id, capability: provider.capability,
        seconds: scene?.seconds || provider.seconds[0], status: "submitting" };
      saveJob(job, scene?.id);
      const referenceId = current.optimized?.status === "ready" ? current.optimized.id : current.referenceId;
      try {
        const result = await request<ReelJob>("", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: job.id,
          providerId: job.providerId, prompt: scene ? `${current.topic}\n${scene.prompt}` : "Improve this product image for a portrait reel, preserving the product and brand.",
          seconds: job.seconds, ...(referenceId ? { referenceId } : {}) }) });
        saveJob(result, scene?.id);
      } catch (e) {
        saveJob({ ...job, status: "uncertain", error: "وضعیت ارسال نامشخص است؛ قبل از تولید دوباره، وضعیت را بررسی کنید." }, scene?.id);
        throw e;
      }
    });
  }
  async function refresh(job: ReelJob, sceneId?: string) {
    await perform("refresh-" + job.id, async () => { saveJob(await request<ReelJob>(`/jobs/${job.id}`), sceneId); });
  }
  const activeJob = (j?: ReelJob) => j && ["submitting", "queued", "running", "uncertain"].includes(j.status);
  const hasActive = draft.scenes.some((s) => activeJob(s.job)) || activeJob(draft.optimized);
  if (!loaded) return <section className="page-main" role="status">در حال بارگذاری...</section>;
  return <section className="page-main reel-studio" dir="rtl">
    <header className="page-header"><div><span className="eyebrow">REEL STUDIO</span><h1>استودیوی ریلز</h1></div><span className="period" dir="ltr">1080 × 1920 · 9:16 · 30 fps</span></header>
    {!config.enabled && <p className="reel-notice" role="status">تولید هوش مصنوعی روی این سرور فعال نشده است.</p>}
    {error && <p className="reel-error" role="alert">{error}</p>}
    <div className="reel-brief">
      <label className="field-input"><span>موضوع ریلز</span><input maxLength={500} value={draft.topic} disabled={Boolean(busy) || Boolean(hasActive)} onChange={(e) => change({ topic: e.target.value })} /></label>
      <div className="reel-meta"><span>مدت نهایی</span><strong>{duration} ثانیه</strong><span>تدوین</span><strong>{config.renderer ? "آماده" : "نیازمند اتصال FFmpeg"}</strong></div>
    </div>
    <section className="reel-reference">
      <h2>تصویر مرجع</h2>
      <div className="reel-reference-fields">
        <label className="field-input"><span><ImagePlus size={16} /> عکس محصول</span><input type="file" accept="image/png,image/jpeg" disabled={!enabled || Boolean(hasActive)} onChange={(e) => {
          const file = e.target.files?.[0]; e.target.value = "";
          if (!file) return;
          void perform("upload", async () => {
            if (file.size > 6 * 1024 * 1024) throw new Error("حداکثر حجم عکس ۶ مگابایت است");
            const asset = await request<{ id: string }>("/assets", { method: "POST", headers: { "Content-Type": file.type }, body: file });
            change({ referenceId: asset.id, optimized: undefined, scenes: draftRef.current.scenes.map((s) => ({ ...s, job: undefined })) });
          });
        }} /></label>
        <label className="field-input"><span>سرویس بهینه‌سازی عکس</span><select value={imageProvider} disabled={Boolean(busy)} onChange={(e) => setImageProvider(e.target.value)}><option value="">انتخاب سرویس</option>{imageProviders.map((p) => <option key={p.id} value={p.id} disabled={!p.ready}>{p.label}{!p.ready ? " — متصل نیست" : ""}</option>)}</select></label>
        <button className="button secondary" disabled={!enabled || !draft.referenceId || !imageProvider || Boolean(hasActive)} onClick={() => void generate()}><Sparkles size={16} /> بهینه‌سازی</button>
      </div>
      {draft.referenceId && <div className="reel-reference-result">
        {/* User-provided local media has no build-time dimensions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/v1/reels/media/${draft.optimized?.status === "ready" ? draft.optimized.id : draft.referenceId}`} width={120} height={160} alt="تصویر مرجع محصول" />
        <button className="icon-button" title="حذف تصویر مرجع" aria-label="حذف تصویر مرجع" disabled={Boolean(busy) || Boolean(hasActive)} onClick={() => change({ referenceId: undefined, optimized: undefined, scenes: draft.scenes.map((s) => ({ ...s, job: undefined })) })}><Trash2 size={16} /></button>
      </div>}
      {draft.optimized && <div className="reel-job-status"><span>{statusLabels[draft.optimized.status]}</span><button className="icon-button" aria-label="بررسی وضعیت عکس" title="بررسی وضعیت عکس" disabled={!enabled} onClick={() => void refresh(draft.optimized!)}><RefreshCw size={16} /></button>{draft.optimized.error && <p role="alert">{draft.optimized.error}</p>}{draft.optimized.status === "uncertain" && <button className="button secondary" disabled={Boolean(busy)} onClick={() => { if (window.confirm("وضعیت و هزینه را در پنل سرویس بررسی کرده‌اید؟ این کار درخواست قبلی را لغو نمی‌کند.")) change({ optimized: undefined }); }}>کنارگذاشتن درخواست</button>}</div>}
    </section>
    <div className="section-head"><h2>صحنه‌ها</h2><button className="button secondary" disabled={draft.scenes.length >= 6 || Boolean(busy) || Boolean(hasActive)} onClick={() => change({ scenes: [...draft.scenes, { id: crypto.randomUUID(), prompt: "", providerId: "", seconds: 8, transition: "fade" }] })}><Plus size={16} /> صحنه</button></div>
    <div className="reel-scenes">{draft.scenes.map((scene, index) => {
      const provider = videoProviders.find((p) => p.id === scene.providerId);
      const locked = Boolean(busy) || Boolean(activeJob(scene.job));
      return <article className="reel-scene" key={scene.id}>
        <div className="reel-scene-heading"><h3>صحنه {index + 1}</h3><button className="icon-button" title="حذف صحنه" aria-label={`حذف صحنه ${index + 1}`} disabled={draft.scenes.length <= 2 || locked} onClick={() => change({ scenes: draft.scenes.filter((s) => s.id !== scene.id) })}><Trash2 size={16} /></button></div>
        <div className="reel-scene-body"><div className="reel-scene-controls">
          <label className="field-input"><span>شرح صحنه</span><textarea maxLength={5000} rows={3} disabled={locked} value={scene.prompt} onChange={(e) => editScene(scene.id, { prompt: e.target.value })} /></label>
          <div className="reel-selects">
            <label className="field-input"><span>هوش مصنوعی</span><select disabled={locked} value={scene.providerId} onChange={(e) => { const p = videoProviders.find((v) => v.id === e.target.value); editScene(scene.id, { providerId: e.target.value, seconds: p?.seconds[0] || 8 }); }}><option value="">انتخاب سرویس</option>{videoProviders.map((p) => <option key={p.id} value={p.id} disabled={!p.ready}>{p.label}{!p.ready ? " — متصل نیست" : ""}</option>)}</select></label>
            <label className="field-input"><span>مدت</span><select disabled={locked} value={scene.seconds} onChange={(e) => editScene(scene.id, { seconds: Number(e.target.value) })}>{(provider?.seconds || [4, 8, 12]).map((n) => <option key={n} value={n}>{n} ثانیه</option>)}</select></label>
            {index < draft.scenes.length - 1 && <label className="field-input"><span>ترنزیشن بعدی</span><select disabled={Boolean(busy)} value={scene.transition} onChange={(e) => editScene(scene.id, { transition: e.target.value as ReelScene["transition"] })}>{TRANSITIONS.map((t) => <option key={t} value={t}>{transitionLabels[t]}</option>)}</select></label>}
          </div>
          <div className="reel-scene-actions"><button className="button primary" disabled={!enabled || locked || Boolean(activeJob(draft.optimized)) || !provider?.ready || !draft.topic.trim() || !scene.prompt.trim() || Boolean(draft.referenceId && !provider.supportsReference)} onClick={() => void generate(scene)}><Sparkles size={16} /> {scene.job?.status === "ready" ? "تولید نسخه جدید" : "ساخت صحنه"}</button>
            {scene.job && <><span role="status">{statusLabels[scene.job.status]}</span><button className="icon-button" title="بررسی وضعیت صحنه" aria-label={`بررسی وضعیت صحنه ${index + 1}`} disabled={!enabled} onClick={() => void refresh(scene.job!, scene.id)}><RefreshCw size={16} /></button></>}
          </div>{scene.job?.error && <p className="reel-error" role="alert">{scene.job.error}</p>}{scene.job?.status === "uncertain" && <button className="button secondary" disabled={Boolean(busy)} onClick={() => { if (window.confirm("وضعیت و هزینه را در پنل سرویس بررسی کرده‌اید؟ این کار درخواست قبلی را لغو نمی‌کند.")) editScene(scene.id, { job: undefined }); }}>کنارگذاشتن درخواست</button>}
        </div><div className="reel-scene-preview">{scene.job?.status === "ready" ? <video src={scene.job.mediaUrl} controls playsInline preload="metadata" aria-label={`پیش‌نمایش صحنه ${index + 1}`} /> : <Film size={32} aria-label="بدون ویدیوی تولیدشده" />}</div></div>
      </article>;
    })}</div>
    <section className="reel-export"><div><h2>خروجی نهایی</h2><span>{duration} ثانیه · MP4 · بدون صدا</span></div>
      <button className="button primary" disabled={!enabled || !config.renderer || duration < 15 || duration > 30 || draft.scenes.some((s) => s.job?.status !== "ready")} onClick={() => void perform("render", async () => {
        const result = await request<{ mediaUrl: string }>("/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: crypto.randomUUID(), scenes: draft.scenes.map((s) => ({ jobId: s.job!.id, seconds: s.seconds, transition: s.transition })) }) });
        persist({ ...draftRef.current, output: result.mediaUrl });
      })}><Clapperboard size={16} /> تدوین نهایی</button>
      {draft.output && <a className="button secondary" href={draft.output + "?download=1"}><Download size={16} /> دانلود MP4</a>}
    </section>
    {draft.output && <div className="reel-final"><label><input type="checkbox" checked={safeArea} onChange={(e) => setSafeArea(e.target.checked)} /> محدوده امن متن</label><div className="reel-final-video"><video src={draft.output} controls playsInline aria-label="ریلز نهایی" />{safeArea && <div className="reel-safe-area" aria-hidden="true" />}</div></div>}
    {busy && <p className="reel-busy" role="status"><LoaderCircle size={16} /> در حال انجام...</p>}
  </section>;
}
