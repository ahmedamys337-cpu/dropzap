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
} else {
  console.warn("[yt-dlp] No YOUTUBE_COOKIES env var — YouTube may fail on cloud IPs");
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

// Export combined helper for YouTube routes. When a proxy is configured we
// deliberately DO NOT send cookies on the primary call: cookies created
// from your home IP arriving through a rotating residential proxy looks
// like account hijack to YouTube's anti-fraud, which then either returns
// an empty formats list or a hard "Requested format is not available"
// error. Proxy-only is what reliably gets at least the 360p progressive
// for every video; the recovery chain in getVideoInfo will retry WITH
// cookies as needed for videos where 360p isn't enough.
export function getYoutubeAuthArgs(): string[] {
  if (proxyList.length > 0) {
    return getProxyArgs();
  }
  return [...getCookiesArgs(), ...getProxyArgs()];
}

// Streaming auth follows the same rule as /info auth — proxy-only when
// the proxy is present. Sending cookies on the streaming step also tripped
// the same anti-fraud response and caused downloads to fail outright.
export function getYoutubeStreamAuthArgs(): string[] {
  if (proxyList.length > 0) {
    return getProxyArgs();
  }
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

// Fast YouTube extraction flags
// With a residential proxy, we can use the standard web+android clients
// which return ALL formats reliably (tv_embedded etc. sometimes return
// incomplete format lists that cause "Requested format not available" errors).
// --no-check-formats skips per-URL HEAD validation (much faster).
const YT_FAST_ARGS = [
  "--no-check-certificates",
  "--no-warnings",
  "--no-playlist",
  "--skip-download",
  "--no-check-formats",
  "--socket-timeout", "30",
  // tv_embedded + android is the safe non-po-token pair: in production it
  // ALWAYS returns at least the 360p progressive (itag 18), even for
  // videos where the newer tv_simply / ios clients hard-error with
  // "Requested format is not available". The recovery chain handles the
  // upgrade to HD when the primary returns thin.
  "--extractor-args", "youtube:player_client=tv_embedded,android",
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

    // PARALLEL RECOVERY: race the alternate clients that have proven to
    // unlock HD without cookies. Both are TV-app-style clients that send
    // distinct attestation fingerprints from the primary tv_embedded.
    // First one to return HD wins; we don't wait for the slower one.
    // This cuts recovery from ~25s sequential to ~12s parallel.
    //
    // mediaconnect is listed first in our preference because in practice
    // it succeeds on more videos than tv_simply on cloud-IP setups.
    console.log(
      `[yt-dlp] Primary thin (${countUniqueHeights(data.formats)} heights); racing alt-clients`
    );
    const altClients = ["mediaconnect", "tv_simply"];
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

    // Cookies-only attempt: only runs when YOUTUBE_COOKIES is provisioned.
    // Tries the broad client list with auth, which can unlock videos that
    // require account access (age-gated, region-locked).
    if (cookiesFilePath && (countUniqueHeights(data.formats) < 2 || !hasHdFormat(data.formats))) {
      const r = await runRetry("cookies+broad-clients", [
        "--extractor-args",
        "youtube:player_client=tv_simply,tv_embedded,android,ios,mweb,web_safari",
        ...getCookiesArgs(),
        ...getProxyArgs(),
      ]);
      if (r && (r.heights > countUniqueHeights(data.formats) || (r.hasHd && !hasHdFormat(data.formats)))) {
        data = r.data;
      }
    }

    // Attempt C: Piped / Invidious public instances. Entirely independent
    // code path — doesn't hit YouTube directly so cloud-IP gating doesn't
    // apply. Many instances are flaky, but the helper rotates through a
    // pool until one works.
    if (countUniqueHeights(data.formats) < 2 || !hasHdFormat(data.formats)) {
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
  const video = videoCandidates[0] || null;

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
