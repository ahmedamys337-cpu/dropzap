import { execFile } from "child_process";
import { promisify } from "util";
import { writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { getYoutubeInfoViaPiped, extractYoutubeVideoId } from "./youtube-piped";

const execFileAsync = promisify(execFile);

// Write YouTube cookies from env var to a temp file once at startup
let cookiesFilePath: string | null = null;
if (process.env.YOUTUBE_COOKIES) {
  try {
    cookiesFilePath = join(tmpdir(), "yt-cookies.txt");
    writeFileSync(cookiesFilePath, process.env.YOUTUBE_COOKIES, "utf-8");
    console.log("[yt-dlp] Cookies written:", process.env.YOUTUBE_COOKIES.length, "bytes");
  } catch (e) {
    console.error("[yt-dlp] Failed to write cookies file:", e);
    cookiesFilePath = null;
  }
}

function getCookiesArgs(): string[] {
  return cookiesFilePath ? ["--cookies", cookiesFilePath] : [];
}

// Parse YOUTUBE_PROXIES env var into a list of proxy URLs
// Accepts these formats (one per line):
//   host:port:user:pass         (Webshare default download format)
//   user:pass@host:port
//   http://user:pass@host:port
let proxyList: string[] = [];
if (process.env.YOUTUBE_PROXIES) {
  proxyList = process.env.YOUTUBE_PROXIES
    .split(/[\r\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("http://") || line.startsWith("https://")) return line;
      // host:port:user:pass -> http://user:pass@host:port
      const parts = line.split(":");
      if (parts.length === 4) {
        const [host, port, user, pass] = parts;
        return `http://${user}:${pass}@${host}:${port}`;
      }
      // user:pass@host:port -> http://user:pass@host:port
      if (line.includes("@")) return `http://${line}`;
      // host:port (no auth) -> http://host:port
      return `http://${line}`;
    });
  console.log("[yt-dlp] Loaded", proxyList.length, "YouTube proxies");
}

// Pick a random proxy per request to spread load and avoid bans
function getProxyArgs(): string[] {
  if (proxyList.length === 0) return [];
  const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];
  return ["--proxy", proxy];
}

// Always send cookies + proxy together. Render's datacenter IPs are bot-
// flagged and get blocked even with cookies; the rotating residential
// proxy bypasses the IP block, and cookies authenticate the request to
// unlock the full HD format ladder. CRITICAL: cookies must be exported
// from a Google account that was signed-in via the same geo as the proxy
// (USA), otherwise YouTube anti-fraud sees a geo-mismatch and returns
// "Requested format is not available" with an empty format list.
export function getYoutubeAuthArgs(): string[] {
  return [...getCookiesArgs(), ...getProxyArgs()];
}

export function getYoutubeStreamAuthArgs(): string[] {
  return [...getCookiesArgs(), ...getProxyArgs()];
}

// In-memory cache for video info (5 min TTL)
type CacheEntry = { data: any; expires: number };
const infoCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 200;

function cacheGet(key: string): any | null {
  const entry = infoCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    infoCache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key: string, data: any) {
  // Simple LRU-ish: drop oldest if over limit
  if (infoCache.size >= MAX_CACHE_SIZE) {
    const firstKey = infoCache.keys().next().value;
    if (firstKey) infoCache.delete(firstKey);
  }
  infoCache.set(key, { data, expires: Date.now() + CACHE_TTL_MS });
}

// Fast YouTube extraction flags. --no-check-formats skips per-URL HEAD
// validation (saves several seconds on long format ladders).
//
// Player-client choice (the single biggest factor in whether HD comes back):
//   With cookies: mediaconnect first — in production it's the only client
//     that consistently returns the full HD ladder through a residential
//     proxy. android/tv_embedded stay as in-call fallbacks so age-gated
//     content still resolves without bouncing to recovery.
//   Without cookies: tv_embedded first (lightweight, no PO-token) then
//     android, tv_simply, mediaconnect.
// 'web' is deliberately omitted everywhere: it requires a PO-token even
// with cookies, and a cookies/proxy geo mismatch makes it return "Requested
// format is not available".
const YT_FAST_ARGS = [
  "--no-check-certificates",
  "--no-warnings",
  "--no-playlist",
  "--skip-download",
  "--no-check-formats",
  "--socket-timeout", "30",
  "--extractor-args",
  cookiesFilePath
    ? "youtube:player_client=mediaconnect,android,tv_embedded"
    : "youtube:player_client=tv_embedded,android,tv_simply,mediaconnect",
];

// If a residential proxy is configured, we can hit YouTube directly via yt-dlp.
// Public Piped/Invidious instances are mostly dead so skip them in that case.
const HAS_PROXY = proxyList.length > 0;

// Whether YouTube extraction goes through a residential proxy. When true,
// every signed googlevideo.com URL we receive is IP-locked to the proxy
// (YouTube embeds the requesting IP in the URL signature), so we MUST
// download those URLs through the same proxy. The direct-ffmpeg fast path
// in /api/stream uses this flag to decide whether to skip itself and let
// the yt-dlp temp-file path handle the download (which routes through the
// proxy correctly).
export const HAS_YOUTUBE_PROXY = HAS_PROXY;

// Returns a random proxy URL for routing media fetches (e.g. ffmpeg -http_proxy)
// through the same residential IP yt-dlp used to extract the URL. googlevideo.com
// signed URLs are IP-locked to the extracting IP, so ffmpeg fetching them direct
// from the server will 403; routing through the proxy unlocks them.
export function getYoutubeProxyUrl(): string | undefined {
  if (proxyList.length === 0) return undefined;
  return proxyList[Math.floor(Math.random() * proxyList.length)];
}

export async function getVideoInfo(url: string): Promise<any> {
  const cached = cacheGet(url);
  if (cached) return cached;

  const isYoutube = !!extractYoutubeVideoId(url);

  // Only fall back to Piped/Invidious if NO proxy is configured.
  // With a proxy, direct yt-dlp is faster and more reliable.
  if (isYoutube && !HAS_PROXY) {
    try {
      const data = await getYoutubeInfoViaPiped(url);
      cacheSet(url, data);
      return data;
    } catch (e: any) {
      console.warn("[yt-dlp] Piped fallback failed, trying yt-dlp:", e.message);
    }
  }

  // Default path: yt-dlp (works for all non-YouTube + as YouTube fallback).
  // We swallow exec errors HERE so a hard failure on the primary call
  // (e.g. "Requested format is not available" when YouTube blocks the
  // response entirely) still falls through to the recovery chain below.
  // If everything down to Piped also fails, we re-throw the saved error.
  let data: any = { formats: [] };
  let primaryError: any = null;
  try {
    const { stdout, stderr } = await execFileAsync("yt-dlp", [
      url,
      "--dump-single-json",
      ...YT_FAST_ARGS,
      ...getYoutubeAuthArgs(),
    ], { timeout: 45000, maxBuffer: 10 * 1024 * 1024 });
    if (stderr) console.error("[yt-dlp stderr]", stderr.slice(0, 500));
    data = JSON.parse(stdout);
  } catch (e: any) {
    primaryError = e;
    console.warn(
      `[yt-dlp] Primary call failed for ${url}: ${e.message?.slice(0, 200)}`
    );
  }

  // Recovery chain for thin format lists. YouTube has been steadily
  // hardening format extraction against cloud-IP / non-attested clients;
  // the fast primary call above frequently returns just itag 18 (360p
  // progressive) — or sometimes 144/240/360 with NO HD — even for videos
  // that publicly offer full HD. We trigger the recovery chain whenever
  // the primary response is thin (<2 heights) OR is missing any HD format
  // (no height >= 720), so users don't end up stuck at 360p when cookies
  // or alternate clients could unlock 720p+.
  // Always run recovery when the primary returned a thin format ladder.
  // We previously gated recovery on !HAS_PROXY (assuming proxy+cookies
  // always returned full HD), but YouTube has tightened format gating to
  // the point that even cookies+proxy frequently returns just itag 18
  // (360p progressive). Skipping recovery in that case stranded users at
  // 360p, so we now always race alt-clients on thin responses.
  const needsRecovery =
    countUniqueHeights(data.formats) < 2 || !hasHdFormat(data.formats);
  if (isYoutube && needsRecovery) {
    // Helper: run a single retry with a given player_client. Returns the
    // parsed info on success, or null on failure / non-HD result.
    const runRetry = async (label: string, extraArgs: string[]) => {
      try {
        const retry = await execFileAsync("yt-dlp", [
          url,
          "--dump-single-json",
          "--no-check-certificates",
          "--no-warnings",
          "--no-playlist",
          "--skip-download",
          "--no-check-formats",
          "--socket-timeout", "30",
          ...extraArgs,
        ], { timeout: 45000, maxBuffer: 10 * 1024 * 1024 });
        const parsed = JSON.parse(retry.stdout);
        const h = countUniqueHeights(parsed.formats);
        const hd = hasHdFormat(parsed.formats);
        console.log(`[yt-dlp] ${label}: ${h} heights, HD=${hd}`);
        return { label, data: parsed, heights: h, hasHd: hd };
      } catch (e: any) {
        console.warn(`[yt-dlp] ${label} retry failed:`, e.message?.slice(0, 200));
        return null;
      }
    };

    // PARALLEL RECOVERY: race alternate clients that send a different
    // attestation fingerprint than the primary call. First one to return
    // HD wins.
    //
    // We deliberately exclude any client the primary already tried so the
    // recovery list adds fresh signal instead of repeating failures: when
    // cookies are present the primary chain is mediaconnect→android→
    // tv_embedded, so recovery only adds ios/mweb/tv_simply.
    console.log(
      `[yt-dlp] Primary thin (${countUniqueHeights(data.formats)} heights); racing alt-clients`
    );
    const altClients = cookiesFilePath
      ? ["ios", "mweb", "tv_simply"]
      : ["ios", "mweb", "mediaconnect", "tv_simply"];
    const altPromises = altClients.map((c) =>
      runRetry(`alt-clients:${c}`, [
        "--extractor-args", `youtube:player_client=${c}`,
        ...getCookiesArgs(),
        ...getProxyArgs(),
      ]),
    );
    const altResults = await Promise.all(altPromises);
    // Pick the best result: prefer HD, then by height count.
    const successful = altResults
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => {
        if (a.hasHd !== b.hasHd) return a.hasHd ? -1 : 1;
        return b.heights - a.heights;
      });
    if (successful.length > 0) {
      const best = successful[0];
      const currentH = countUniqueHeights(data.formats);
      const currentHd = hasHdFormat(data.formats);
      if (best.heights > currentH || (best.hasHd && !currentHd)) {
        console.log(`[yt-dlp] Adopted ${best.label} (${best.heights}h, HD=${best.hasHd})`);
        data = best.data;
      }
    }

    // Attempt C: Piped / Invidious public instances. Independent code
    // path — doesn't hit YouTube directly so cloud-IP gating doesn't
    // apply. Public instances are mostly dead and add 5-15s of timeout
    // even on fast failure, so skip entirely when a proxy is available
    // (yt-dlp + proxy is faster and more reliable than any public Piped).
    if (
      !HAS_PROXY &&
      (countUniqueHeights(data.formats) < 2 || !hasHdFormat(data.formats))
    ) {
      try {
        console.log(`[yt-dlp] Falling back to Piped/Invidious for ${url}`);
        const pipedData = await getYoutubeInfoViaPiped(url);
        const pipedHeights = countUniqueHeights(pipedData.formats);
        const pipedHasHd = hasHdFormat(pipedData.formats);
        if (
          pipedHeights > countUniqueHeights(data.formats) ||
          (pipedHasHd && !hasHdFormat(data.formats))
        ) {
          console.log(
            `[piped] Succeeded: ${pipedHeights} heights, HD=${pipedHasHd}`
          );
          data = pipedData;
        }
      } catch (e: any) {
        console.warn(`[piped] fallback failed:`, e.message);
      }
    }
  }

  // If everything failed AND the primary call originally threw, propagate
  // that error so the API surface returns a meaningful message instead
  // of pretending success with zero formats.
  if (primaryError && countUniqueHeights(data.formats) === 0) {
    const msg: string = primaryError.message || "";
    if (msg.includes("Sign in to confirm") || msg.includes("bot")) {
      console.error(
        "[yt-dlp] Bot-check hit on all clients — server IP is flagged by YouTube. "
        + "Change Render region to Frankfurt/Singapore or re-add YOUTUBE_PROXIES."
      );
    }
    throw primaryError;
  }

  cacheSet(url, data);
  return data;
}

function countUniqueHeights(formats: any[] | undefined): number {
  if (!Array.isArray(formats)) return 0;
  const heights = new Set<number>();
  for (const f of formats) {
    if (f?.height && (f.vcodec ? f.vcodec !== "none" : f.acodec === "none")) {
      heights.add(f.height);
    }
  }
  return heights.size;
}

// Does the format list contain at least one HD video stream (>=720p)?
// Used by the recovery chain to decide whether to keep trying fallbacks
// when the primary call came back with only low-res formats.
function hasHdFormat(formats: any[] | undefined): boolean {
  if (!Array.isArray(formats)) return false;
  for (const f of formats) {
    if (!f?.height || f.height < 720) continue;
    // Must be a video format, not a storyboard / audio-only entry.
    if (f.vcodec && f.vcodec !== "none") return true;
    if (!f.vcodec && f.acodec === "none") return true;
  }
  return false;
}

// Pick the best matching video and/or audio format from a cached info
// blob. Returned formats include the signed googlevideo.com `url` and
// the `http_headers` yt-dlp would normally send. We use these to drive
// ffmpeg directly, bypassing yt-dlp (and the proxy) for the actual byte
// transfer.
//
// Selection rules mirror what we'd ask yt-dlp for via -f:
//   video: best avc1 with height <= cap → best mp4 → best video-only
//   audio: best m4a (AAC) → best webm/opus → any audio-only
export type PickedFormat = {
  url: string;
  http_headers?: Record<string, string>;
  ext?: string;
  vcodec?: string;
  acodec?: string;
  height?: number;
  filesize?: number;
  // True when this format already contains both video and audio in a single
  // URL (YouTube's "progressive" itag 18 = 360p mp4, etc.). The muxer uses
  // this to avoid a separate audio -i input and just copy both streams.
  combined?: boolean;
};

export function pickYoutubeFormats(
  info: any,
  heightCap: number | null,
  audioOnly: boolean,
): { video: PickedFormat | null; audio: PickedFormat | null } {
  const all = (info?.formats || []) as any[];
  if (!Array.isArray(all) || all.length === 0) {
    return { video: null, audio: null };
  }

  // ---- audio pick ---------------------------------------------------------
  const audioCandidates = all.filter(
    (f) => f?.url && f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none"),
  );
  const scoreAudio = (f: any) => {
    let s = 0;
    if (f.ext === "m4a") s += 1000;
    if (f.acodec?.startsWith("mp4a")) s += 500;
    s += f.abr || 0;
    s += (f.tbr || 0) / 1000;
    return s;
  };
  audioCandidates.sort((a, b) => scoreAudio(b) - scoreAudio(a));
  const audio = audioCandidates[0] || null;

  if (audioOnly) return { video: null, audio };

  // ---- video pick ---------------------------------------------------------
  const cap = heightCap ?? 1080;
  const videoCandidates = all.filter(
    (f) =>
      f?.url &&
      f.vcodec &&
      f.vcodec !== "none" &&
      (!f.acodec || f.acodec === "none") &&
      f.height &&
      f.height <= cap,
  );
  const scoreVideo = (f: any) => {
    let s = (f.height || 0) * 100;
    if (f.vcodec?.startsWith("avc1")) s += 50_000; // strong avc1 preference
    if (f.ext === "mp4") s += 10_000;
    s += (f.tbr || 0);
    return s;
  };
  videoCandidates.sort((a, b) => scoreVideo(b) - scoreVideo(a));
  let video: any = videoCandidates[0] || null;

  // Combined-stream fallback. When YouTube has gated us hard (cookies stale,
  // bot-flagged IP, etc.) it sometimes returns ONLY a single progressive
  // mp4 with audio baked in (typically itag 18, 360p). The strict pure-
  // video filter above rejects it because acodec is present. Without this
  // fallback the caller falls through to the 4-minute yt-dlp temp-file
  // path. Detect it here and pass it along as a combined pick.
  if (!video) {
    const combined = all.find(
      (f) =>
        f?.url &&
        f.vcodec && f.vcodec !== "none" &&
        f.acodec && f.acodec !== "none" &&
        f.height && f.height <= cap,
    );
    if (combined) {
      video = { ...combined, combined: true };
    }
  }

  return { video, audio };
}

export async function getVideoInfoSkipDownload(url: string): Promise<any> {
  const cached = cacheGet(url);
  if (cached) return cached;

  const { stdout } = await execFileAsync("yt-dlp", [
    url,
    "--dump-single-json",
    "--no-check-certificates",
    "--no-warnings",
    "--no-playlist",
    "--skip-download",
    "--no-check-formats",
    "--socket-timeout", "20",
    ...getYoutubeAuthArgs(),
  ], { timeout: 30000, maxBuffer: 10 * 1024 * 1024 });

  const data = JSON.parse(stdout);
  cacheSet(url, data);
  return data;
}
