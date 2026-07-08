import { execFile } from "child_process";
import { promisify } from "util";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const execFileAsync = promisify(execFile);

// Log yt-dlp version on startup. YouTube ships anti-bot updates ~weekly
// and yt-dlp counter-fixes ~daily; a stale binary is by far the most
// common cause of "HD worked yesterday, only 360p today" regressions.
// This single log line in Render's startup output answers the question
// "is the latest fix actually deployed?" in 3 seconds.
//
// Skip during `next build` — Next.js imports this module from each page's
// data-collection pass, where yt-dlp isn't installed yet (it lives only in
// the Stage 3 runner image of our Dockerfile). Without this guard the build
// log fills with a dozen scary-looking ENOENT lines per build.
if (process.env.NEXT_PHASE !== "phase-production-build") {
  execFile("yt-dlp", ["--version"], (err) => {
    if (err) console.error("[yt-dlp] version check failed:", err.message);
  });
}

// Write cookies from env var to a temp file once at startup. We prefer the
// new MEDIA_COOKIES name (since the same file holds IG/FB/X/etc. cookies,
// not just YouTube's), but fall back to the legacy YOUTUBE_COOKIES name so
// existing deployments keep working until the env var is renamed.
//
// Whichever variable is present, the file format is unchanged: a single
// Netscape cookies.txt blob. yt-dlp filters by domain at request time, so
// it doesn't matter that the file holds cookies for many platforms — only
// the cookies whose domain matches the URL being downloaded are sent.
//
// MEDIA_COOKIES_INSTAGRAM can be used to add/override Instagram cookies
// without touching the shared MEDIA_COOKIES blob.
const cookiesSources: { name: string; value?: string }[] = [
  { name: "MEDIA_COOKIES", value: process.env.MEDIA_COOKIES },
  { name: "MEDIA_COOKIES_INSTAGRAM", value: process.env.MEDIA_COOKIES_INSTAGRAM },
  { name: "YOUTUBE_COOKIES", value: process.env.YOUTUBE_COOKIES },
].filter((s) => !!s.value);

const cookiesEnvSource = cookiesSources.map((s) => s.name).join(", ") || null;
const cookiesEnvValue = cookiesSources.map((s) => s.value).join("\n");

let cookiesFilePath: string | null = null;
if (cookiesEnvValue && cookiesEnvSource) {
  try {
    cookiesFilePath = join(tmpdir(), "yt-cookies.txt");
    writeFileSync(cookiesFilePath, cookiesEnvValue, "utf-8");
    const cookieLines = cookiesEnvValue
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#"))
      .length;
    console.log(`[yt-dlp] cookies loaded from ${cookiesEnvSource} (${cookieLines} cookie lines) -> ${cookiesFilePath}`);
  } catch (e) {
    console.error("[yt-dlp] Failed to write cookies file:", e);
    cookiesFilePath = null;
  }
} else {
  console.log("[yt-dlp] no cookie env vars configured (MEDIA_COOKIES, MEDIA_COOKIES_INSTAGRAM, YOUTUBE_COOKIES)");
}

function getCookiesArgs(): string[] {
  return cookiesFilePath ? ["--cookies", cookiesFilePath] : [];
}

// Public counterpart for endpoints outside the YouTube pipeline (e.g.
// /api/photos, /api/auto for IG/FB/Reddit/X/Pinterest/Threads). Instagram
// in particular often returns 401 for anonymous extraction of newer
// posts; passing the same cookies file (which can carry IG/FB/etc.
// cookies alongside YouTube's) bumps success rates significantly.
// Returns [] when no cookies env var is configured, so callers can
// always spread it into their args list without conditional checks.
export function getGenericCookiesArgs(): string[] {
  return getCookiesArgs();
}

// Build a Cookie header string for a given hostname from the same Netscape
// cookies file yt-dlp uses. Needed by endpoints that bypass yt-dlp and call
// platform APIs directly (e.g. Instagram's private /api/v1/media/.../info/
// endpoint, which yt-dlp can't see). Returns "" if no cookies file is set
// or no cookies match the host's domain.
//
// Netscape cookies.txt format (tab-separated, one cookie per line):
//   domain  HTTPONLY_FLAG  path  secure  expires  name  value
// Lines starting with `#` are comments, except `#HttpOnly_` which prefixes
// HttpOnly cookies. Domain matching: a cookie with domain `.foo.com` is
// sent for any subdomain of foo.com; an exact-match cookie (no leading dot)
// only matches that exact host. We replicate that here.
export function getCookieHeader(hostname: string): string {
  if (!cookiesFilePath) return "";
  let raw = "";
  try { raw = readFileSync(cookiesFilePath, "utf-8"); } catch { return ""; }
  const host = hostname.toLowerCase();
  const pairs: string[] = [];
  for (const rawLine of raw.split(/\r?\n/)) {
    let line = rawLine;
    if (!line) continue;
    if (line.startsWith("#HttpOnly_")) line = line.slice("#HttpOnly_".length);
    if (line.startsWith("#")) continue;
    const cols = line.split("\t");
    if (cols.length < 7) continue;
    const [domainRaw, , , , , name, value] = cols;
    const domain = domainRaw.toLowerCase();
    const isWild = domain.startsWith(".");
    const bare = isWild ? domain.slice(1) : domain;
    const match = isWild
      ? host === bare || host.endsWith("." + bare)
      : host === bare;
    if (!match) continue;
    if (!name) continue;
    pairs.push(`${name}=${value ?? ""}`);
  }
  return pairs.join("; ");
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
}

// Pick a random proxy per request to spread load and avoid bans
export function getProxyArgs(): string[] {
  if (proxyList.length === 0) return [];
  const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];
  return ["--proxy", proxy];
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

export async function getVideoInfo(url: string): Promise<any> {
  const cached = cacheGet(url);
  if (cached) return cached;

  const { stdout, stderr } = await execFileAsync("yt-dlp", [
    url,
    "--dump-single-json",
    "--no-check-certificates",
    "--no-warnings",
    "--no-playlist",
    "--skip-download",
    "--no-check-formats",
    "--socket-timeout", "30",
    ...getGenericCookiesArgs(),
    ...getProxyArgs(),
  ], { timeout: 45000, maxBuffer: 10 * 1024 * 1024 });
  if (stderr) console.error("[yt-dlp stderr]", stderr.slice(0, 500));

  const data = JSON.parse(stdout);
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

export function pickFormats(
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
    ...getGenericCookiesArgs(),
    ...getProxyArgs(),
  ], { timeout: 30000, maxBuffer: 10 * 1024 * 1024 });

  const data = JSON.parse(stdout);
  cacheSet(url, data);
  return data;
}
