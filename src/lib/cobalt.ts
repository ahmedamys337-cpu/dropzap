// Cobalt.tools API client.
//
// Cobalt (https://github.com/imputnet/cobalt) is a maintained, open-source
// media downloader that solves YouTube's anti-bot extraction problem at
// their end. We POST a URL + quality, they return a download URL we can
// redirect the user's browser to. The video bytes flow direct from cobalt
// to the user; our server only relays a small JSON call.
//
// We keep the existing yt-dlp+proxy path in /api/stream as a fallback so
// non-YouTube sources (Instagram, TikTok, Facebook…) still flow through
// our own pipeline, and YouTube downloads degrade gracefully if cobalt
// is rate-limited or returns an error.

// API spec: https://github.com/imputnet/cobalt/blob/main/docs/api.md

export type CobaltSuccess = {
  status: "tunnel" | "redirect";
  url: string;
  filename?: string;
};

export type CobaltError = {
  status: "error";
  error: { code: string; context?: any };
};

export type CobaltResponse = CobaltSuccess | CobaltError | { status: string };

// Comma-separated list of cobalt API base URLs. First is tried first;
// failures (network error, 5xx, rate limit) move to the next. A small
// curated default ships so the integration works out of the box; ops
// can override via env to point at a self-hosted instance.
const DEFAULT_INSTANCES = [
  "https://api.cobalt.tools",
  "https://cobalt-api.kwiatekmiki.com",
  "https://co.eepy.today",
];

function getInstances(): string[] {
  const env = (process.env.COBALT_API_URLS || process.env.COBALT_API_URL || "").trim();
  const list = env
    ? env.split(/[,\s]+/).map((s) => s.replace(/\/+$/, "")).filter(Boolean)
    : DEFAULT_INSTANCES;
  return list;
}

// Optional per-instance API key. Cobalt v10+ supports an "Api-Key" auth
// header for higher rate limits. We pass it on every request when set.
const COBALT_API_KEY = process.env.COBALT_API_KEY?.trim() || "";

// Is cobalt meaningfully configured? The official api.cobalt.tools has
// required an Api-Key since late 2024 (returns 400 without one), and most
// public community mirrors are unstable. Only consider cobalt "available"
// when either (a) an API key is configured, or (b) the operator has
// explicitly set COBALT_API_URL(S) — i.e. they've pointed us at something
// they expect to work. Otherwise the UI should not advertise cobalt-only
// quality tiers (1080p etc.) because the fallback yt-dlp path frequently
// can't deliver them.
export function isCobaltConfigured(): boolean {
  if (process.env.COBALT_DISABLED === "1") return false;
  if (COBALT_API_KEY) return true;
  const env = (process.env.COBALT_API_URLS || process.env.COBALT_API_URL || "").trim();
  return env.length > 0;
}

export type CobaltRequestOpts = {
  url: string;
  // Map our internal "audio | 1080 | 720 | 480 | 360" choice to the
  // cobalt fields. When audio is requested we set downloadMode=audio +
  // audioFormat=mp3 so the user gets an mp3 file directly; otherwise
  // we set videoQuality and let cobalt pick mp4 by default.
  audio?: boolean;
  videoQuality?: "1080" | "720" | "480" | "360" | "240" | "144" | "max";
  audioFormat?: "mp3" | "best" | "ogg" | "wav" | "opus";
  audioBitrate?: "320" | "256" | "128" | "96" | "64";
  // Hint cobalt to bias for h264 mp4 (best playback compatibility).
  youtubeVideoCodec?: "h264" | "av1" | "vp9";
};

const REQUEST_TIMEOUT_MS = 15000;

async function callInstance(
  instance: string,
  body: Record<string, any>,
): Promise<CobaltResponse | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const headers: Record<string, string> = {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "User-Agent": "dropzap.digital/1.0 (+https://dropzap.digital)",
    };
    if (COBALT_API_KEY) headers["Authorization"] = `Api-Key ${COBALT_API_KEY}`;

    const res = await fetch(`${instance}/`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      // 429 = rate limited; 5xx = instance issue. Either way, try next instance.
      console.warn(`[cobalt] ${instance} returned ${res.status}`);
      return null;
    }

    const json = (await res.json()) as CobaltResponse;
    return json;
  } catch (e: any) {
    console.warn(`[cobalt] ${instance} fetch failed:`, e.message?.slice(0, 200));
    return null;
  } finally {
    clearTimeout(t);
  }
}

// Resolve a download URL via cobalt. Returns null on total failure (all
// instances unreachable / errored), letting callers fall back to their
// existing pipeline. On success, returns the direct media URL the
// browser should download from, plus a server-suggested filename.
export async function resolveViaCobalt(
  opts: CobaltRequestOpts,
): Promise<{ url: string; filename?: string } | null> {
  const body: Record<string, any> = {
    url: opts.url,
    youtubeVideoCodec: opts.youtubeVideoCodec || "h264",
  };

  if (opts.audio) {
    body.downloadMode = "audio";
    body.audioFormat = opts.audioFormat || "mp3";
    body.audioBitrate = opts.audioBitrate || "128";
  } else {
    body.downloadMode = "auto";
    body.videoQuality = opts.videoQuality || "1080";
  }

  for (const instance of getInstances()) {
    const r = await callInstance(instance, body);
    if (!r) continue;

    if (r.status === "tunnel" || r.status === "redirect") {
      const ok = r as CobaltSuccess;
      console.log(`[cobalt] ${instance} -> ${r.status} (${ok.filename || "no name"})`);
      return { url: ok.url, filename: ok.filename };
    }

    if (r.status === "error") {
      const err = (r as CobaltError).error;
      console.warn(`[cobalt] ${instance} error:`, err.code);
      // Some errors (e.g. rate_exceeded, content.video.unavailable on one
      // instance) might succeed on another, so keep iterating.
      continue;
    }

    // 'picker' (multi-item) and 'local-processing' (transcode required) are
    // unsupported by our simple redirect flow; skip and try next instance.
    console.warn(`[cobalt] ${instance} returned unsupported status:`, r.status);
  }

  return null;
}
