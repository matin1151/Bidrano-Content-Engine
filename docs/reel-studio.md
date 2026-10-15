# Reel Studio: local integration preview

This is the first video integration, not a finished autonomous reel producer.
The existing non-video mock pipeline remains unchanged. Reel orders link to
`/reels`, where an operator writes a scene brief and chooses an AI per scene.
Reel orders do not advance through the simulated production timer.
No paid service is called until explicitly enabled and the operator confirms.

## Implemented

- Multiple server-configured AI profiles, including different accounts/models of
  the same service. Independent image and video selection; no secret in client
  bundles, browser storage, URLs, logs, or provider-list responses.
- OpenAI video job creation/polling/download and image edits; Replicate versioned
  predictions for image/video using model-specific input mappings.
- PNG/JPEG upload, explicit AI optimization with preservation instructions, then
  reference-guided generation. Product/text fidelity still needs human review.
- Request IDs saved before paid submission. Duplicate IDs reuse a saved job;
  conflicting inputs return 409. Unknown submissions are never auto-retried or
  routed to a second provider. The operator must check upstream billing/status.
- Local download of ready outputs before their upstream URL expires. CDN fetches
  accept only HTTPS replicate.delivery hosts, do not follow redirects and never
  carry API credentials. Media is bounded to 100 MiB, uploads to 6 MiB.
- Draft persistence, per-scene preview/regeneration, three FFmpeg transitions,
  0.4-second overlaps and validated 15-30-second final duration. Final output is
  H.264 MP4, 1080x1920, 30 fps, yuv420p, fast-start. Source aspect ratios are kept;
  a blurred background fills unused space instead of stretching/cropping products.
- Reference images for OpenAI video are fitted to 720x1280 by FFmpeg. Generated
  720p video is upscaled for export; this does NOT mean native 1080p AI quality.
- Silent export in this first phase. Source audio is deliberately removed;
  narration, music, Persian captions and beat-aware cuts are not yet implemented.

## Enable locally

1. Create `.env.local` using `.env.example`, add actual keys on the SERVER only,
   set `BIDRANO_FFMPEG_PATH` to your installed FFmpeg executable, and restart Next.
2. Review access, regional availability, billing and model permissions with each
   provider. Configure provider-side spending limits. An API subscription/key is
   separate from a consumer chatbot subscription.
3. Set `BIDRANO_REELS_ENABLED=true` only after configuring spending limits.
4. Open `/reels` on localhost. No generation fallback runs silently; each scene
   has an explicit provider. You may deliberately use a different AI for a new
   version after reviewing a scene. More APIs do not automatically improve quality.

The provider array is server-owned. Profiles can reference different secret env
variables, so separate accounts can coexist. Never paste real keys into GitHub
source or the browser. Renaming/reconfiguring a profile during a job prevents
polling it with a mismatched model/adapter.

### Replicate profile example

Add an entry to `BIDRANO_AI_PROVIDERS` after inspecting the selected model's exact
input schema. Replace the placeholders; they are not runnable model defaults:

```json
{
  "id": "secondary-video",
  "label": "Secondary video model",
  "adapter": "replicate",
  "capability": "video",
  "model": "REPLACE_WITH_PINNED_VERSION_ID",
  "tokenEnv": "REPLICATE_API_TOKEN",
  "seconds": [4, 8],
  "promptField": "prompt",
  "imageField": "start_image",
  "secondsField": "duration",
  "input": {"aspect_ratio": "9:16"}
}
```

Omit `imageField` for text-only models; they cannot be used with an attached image.
`seconds` declares durations actually supported by that model, not arbitrary UI
preferences. `input` holds its fixed model-specific options. Output must be an
MP4 or PNG/JPEG (a URL or first entry in a URL array). Other output schemas need
an explicit adapter. Do not assume all Replicate models share a schema.

## Deployment and recovery boundaries

- All reel endpoints reject non-localhost request URLs and cross-origin browser
  requests. Disabled by default because this prototype has no authentication.
  This is NOT a public paid-generation service. Hostname guards are not a
  substitute for authentication, quotas and trusted reverse-proxy configuration.
- Persistent files live in ignored `.bidrano-data/reels`. Single local Node server
  only: not serverless, not multi-instance, no durable queue/worker, no auto cleanup.
  Back up or remove this directory explicitly when needed; it can grow large.
- Rendering is bounded to one process-wide render and five minutes. Do not stop
  the server while rendering. If interrupted, repeat render with a new request;
  it reuses the original clips and does not call AI. Scene generation reserves
  its ID first, so a crash cannot silently issue a second paid generation.
- The UI exposes each job ID in its saved draft; interrupted submissions without
  a remote ID need manual reconciliation in the provider dashboard. Switching
  browser origin loses access to that browser's draft, not server media.
- Final files are not yet attached to Content Memory or synchronized with order
  approval. Only the latest local draft per order (and one standalone draft) is
  retained. Do not treat simulated
  production status as proof of a generated or approved reel.
- Next phase: durable project/job ownership, AI storyboard, narration/captions,
  music rights, final human review, then order/memory integration and public auth.

## API documentation used

- https://developers.openai.com/api/docs/guides/video-generation
- https://developers.openai.com/api/docs/guides/image-generation
- https://replicate.com/docs/reference/http/

Adapters must be smoke-tested with your real account and model before production.
Offline tests do not validate model access, AI quality or provider billing.
