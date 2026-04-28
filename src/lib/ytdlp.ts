import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

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
// - player_client=web,default — use web client to avoid cloud IP bot detection
// - skip=hls,dash,translated_subs — skip extra manifests we don't need
// - --no-check-formats — skip HEAD-request validation of every format URL
// - --socket-timeout 15 — slightly longer for cloud network latency
// - --no-call-home — skip yt-dlp's update check call
const YT_FAST_ARGS = [
  "--no-check-certificates",
  "--no-warnings",
  "--no-playlist",
  "--skip-download",
  "--no-check-formats",
  "--no-call-home",
  "--socket-timeout", "15",
  "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "--extractor-args", "youtube:player_client=web,default;skip=hls,dash,translated_subs",
];

export async function getVideoInfo(url: string): Promise<any> {
  const cached = cacheGet(url);
  if (cached) return cached;

  const { stdout } = await execFileAsync("yt-dlp", [
    url,
    "--dump-single-json",
    ...YT_FAST_ARGS,
  ], { timeout: 25000, maxBuffer: 10 * 1024 * 1024 });

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
    "--socket-timeout", "10",
  ], { timeout: 25000, maxBuffer: 10 * 1024 * 1024 });

  const data = JSON.parse(stdout);
  cacheSet(url, data);
  return data;
}
