// YouTube fallback via Piped public instances.
// Used when yt-dlp can't reach YouTube directly (cloud IP block).
// Piped instances proxy YouTube requests through their servers (free, but rate-limited and sometimes down).
// We rotate through multiple instances and cache successful ones.

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://api.piped.yt",
  "https://pipedapi.r4fo.com",
  "https://pipedapi.darkness.services",
  "https://pipedapi.smnz.de",
  "https://pipedapi.reallyaweso.me",
  "https://pipedapi.ducks.party",
  "https://pipedapi.drgns.space",
  "https://pipedapi.leptons.xyz",
];

// Track instance health: prefer recently-working instances
const instanceHealth = new Map<string, { lastSuccess: number; failures: number }>();

function rankInstances(): string[] {
  const now = Date.now();
  return [...PIPED_INSTANCES].sort((a, b) => {
    const ha = instanceHealth.get(a);
    const hb = instanceHealth.get(b);
    const sa = ha ? (now - ha.lastSuccess) / 1000 + ha.failures * 60 : 999999;
    const sb = hb ? (now - hb.lastSuccess) / 1000 + hb.failures * 60 : 999999;
    return sa - sb;
  });
}

export function extractYoutubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

interface PipedStream {
  url: string;
  format: string;
  quality: string;
  videoOnly?: boolean;
  bitrate?: number;
  mimeType?: string;
  fps?: number;
  width?: number;
  height?: number;
  codec?: string;
  contentLength?: number;
}

interface PipedResponse {
  title: string;
  description: string;
  uploader: string;
  uploaderUrl: string;
  duration: number;
  thumbnailUrl: string;
  views: number;
  uploadDate: string;
  videoStreams: PipedStream[];
  audioStreams: PipedStream[];
}

async function fetchFromInstance(instance: string, videoId: string): Promise<PipedResponse> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${instance}/streams/${videoId}`, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.videoStreams || !data.audioStreams) throw new Error("Invalid response");
    return data;
  } finally {
    clearTimeout(t);
  }
}

// Convert Piped's response into yt-dlp's --dump-single-json shape so the rest of our code works unchanged.
function transformToYtdlpShape(data: PipedResponse, videoId: string): any {
  const formats: any[] = [];

  // Combined video+audio (Piped doesn't provide these directly — generate a "best" virtual format)
  // Audio-only formats
  for (const a of data.audioStreams) {
    formats.push({
      format_id: `audio-${a.quality || a.bitrate}`,
      ext: a.format?.toLowerCase().includes("m4a") ? "m4a" : "webm",
      url: a.url,
      acodec: a.codec || "unknown",
      vcodec: "none",
      abr: a.bitrate ? a.bitrate / 1000 : undefined,
      filesize: a.contentLength,
      protocol: "https",
      audio_ext: a.format?.toLowerCase().includes("m4a") ? "m4a" : "webm",
    });
  }

  // Video-only formats (adaptive)
  for (const v of data.videoStreams) {
    formats.push({
      format_id: `video-${v.quality}`,
      ext: v.format?.toLowerCase().includes("mp4") ? "mp4" : "webm",
      url: v.url,
      vcodec: v.codec || "unknown",
      acodec: v.videoOnly ? "none" : "unknown",
      width: v.width,
      height: v.height,
      fps: v.fps,
      filesize: v.contentLength,
      protocol: "https",
      video_ext: v.format?.toLowerCase().includes("mp4") ? "mp4" : "webm",
    });
  }

  return {
    id: videoId,
    title: data.title,
    description: data.description,
    uploader: data.uploader,
    channel: data.uploader,
    channel_url: data.uploaderUrl,
    duration: data.duration,
    thumbnail: data.thumbnailUrl,
    view_count: data.views,
    upload_date: data.uploadDate,
    webpage_url: `https://youtube.com/watch?v=${videoId}`,
    formats,
    extractor: "piped",
    extractor_key: "Piped",
  };
}

// Invidious instances — different network, used as second fallback
const INVIDIOUS_INSTANCES = [
  "https://yewtu.be",
  "https://inv.nadeko.net",
  "https://invidious.fdn.fr",
  "https://inv.zzls.xyz",
  "https://invidious.privacyredirect.com",
  "https://invidious.protokolla.fi",
  "https://iv.melmac.space",
  "https://invidious.lunar.icu",
];

async function fetchFromInvidious(instance: string, videoId: string): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${instance}/api/v1/videos/${videoId}`, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    if (!d.formatStreams && !d.adaptiveFormats) throw new Error("Invalid response");

    // Invidious response → yt-dlp shape
    const formats: any[] = [];
    for (const f of d.adaptiveFormats || []) {
      formats.push({
        format_id: `inv-${f.itag}`,
        ext: f.container,
        url: f.url,
        width: f.size ? parseInt(f.size.split("x")[0]) : undefined,
        height: f.size ? parseInt(f.size.split("x")[1]) : undefined,
        fps: f.fps,
        vcodec: f.encoding && !f.audioQuality ? f.encoding : "none",
        acodec: f.audioQuality ? f.encoding : "none",
        filesize: f.clen ? parseInt(f.clen) : undefined,
        protocol: "https",
      });
    }
    for (const f of d.formatStreams || []) {
      formats.push({
        format_id: `inv-${f.itag}`,
        ext: f.container,
        url: f.url,
        width: f.size ? parseInt(f.size.split("x")[0]) : undefined,
        height: f.size ? parseInt(f.size.split("x")[1]) : undefined,
        fps: f.fps,
        vcodec: "h264",
        acodec: "aac",
        protocol: "https",
      });
    }
    return {
      id: videoId,
      title: d.title,
      description: d.description,
      uploader: d.author,
      channel: d.author,
      duration: d.lengthSeconds,
      thumbnail: d.videoThumbnails?.[0]?.url,
      view_count: d.viewCount,
      webpage_url: `https://youtube.com/watch?v=${videoId}`,
      formats,
      extractor: "invidious",
    };
  } finally {
    clearTimeout(t);
  }
}

export async function getYoutubeInfoViaPiped(url: string): Promise<any> {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) throw new Error("Could not extract YouTube video ID");

  // Tier 1: Piped instances
  for (const instance of rankInstances()) {
    try {
      const data = await fetchFromInstance(instance, videoId);
      instanceHealth.set(instance, { lastSuccess: Date.now(), failures: 0 });
      console.log(`[piped] ${instance} succeeded for ${videoId}`);
      return transformToYtdlpShape(data, videoId);
    } catch (e: any) {
      const h = instanceHealth.get(instance) || { lastSuccess: 0, failures: 0 };
      instanceHealth.set(instance, { ...h, failures: h.failures + 1 });
      console.warn(`[piped] ${instance} failed:`, e.message);
    }
  }

  // Tier 2: Invidious instances
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const data = await fetchFromInvidious(instance, videoId);
      console.log(`[invidious] ${instance} succeeded for ${videoId}`);
      return data;
    } catch (e: any) {
      console.warn(`[invidious] ${instance} failed:`, e.message);
    }
  }

  throw new Error("All Piped + Invidious instances failed");
}
