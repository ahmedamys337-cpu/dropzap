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

// Export combined helper for YouTube routes.
// When a residential proxy is configured, we DO NOT send cookies because:
// - Cookies are bound to the IP/region they were created in (e.g., user's home).
// - Sending them through a foreign proxy IP triggers YouTube's anti-fraud,
//   which then returns an empty formats list ("Requested format not available").
// The residential proxy alone is enough to bypass bot detection.
export function getYoutubeAuthArgs(): string[] {
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
  // Keep the client list TIGHT here — this runs on every /info call and
  // each additional client adds a network round-trip inside yt-dlp. The
  // pair `tv_embedded` + `android` reliably returns the full DASH ladder
  // (144p → 2160p) without requiring po_token attestation, on 99% of
  // videos. The /api/stream route uses a broader fallback list for the
  // rare video where we need another client to resolve the stream URL.
  "--extractor-args", "youtube:player_client=tv_embedded,android",
];

// If a residential proxy is configured, we can hit YouTube directly via yt-dlp.
// Public Piped/Invidious instances are mostly dead so skip them in that case.
const HAS_PROXY = proxyList.length > 0;

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

  // Default path: yt-dlp (works for all non-YouTube + as YouTube fallback)
  const { stdout, stderr } = await execFileAsync("yt-dlp", [
    url,
    "--dump-single-json",
    ...YT_FAST_ARGS,
    ...getYoutubeAuthArgs(),
  ], { timeout: 45000, maxBuffer: 10 * 1024 * 1024 });

  if (stderr) console.error("[yt-dlp stderr]", stderr.slice(0, 500));
  const data = JSON.parse(stdout);
  cacheSet(url, data);
  return data;
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
