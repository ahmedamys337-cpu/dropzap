/**
 * Triggers a browser-native download by creating a hidden <a download> element
 * and programmatically clicking it. The browser then hands the request to its
 * native download manager (Chrome's bottom download bar, Firefox's panel, etc.)
 * and the site no longer has to buffer the file in memory.
 *
 * The server response is responsible for setting the correct
 * `Content-Disposition: attachment; filename="..."` header; when it does, the
 * browser picks up the filename from the response. The local `download`
 * attribute is a hint/fallback for when the response doesn't set it (or for
 * cross-origin blob: urls).
 *
 * Only same-origin or proxied URLs will force-download cross-origin resources;
 * for cross-origin URLs that don't set Content-Disposition, route them through
 * `/api/proxy-download?url=...&name=...` first.
 */
export function triggerNativeDownload(downloadUrl: string, filename?: string): void {
  if (typeof document === "undefined") return;
  const a = document.createElement("a");
  a.href = downloadUrl;
  if (filename) a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  // Defer removal to next tick so the navigation/download has latched on.
  setTimeout(() => {
    try {
      document.body.removeChild(a);
    } catch {}
  }, 0);
}

/**
 * Wraps a remote (cross-origin) asset URL in our same-origin proxy so the
 * browser-native downloader can save it with the right filename. Use this for
 * thumbnails, external image CDNs, or any direct media URL you don't control.
 */
export function proxyDownloadUrl(remoteUrl: string, filename: string): string {
  const qs = new URLSearchParams({ url: remoteUrl, name: filename });
  return `/api/proxy-download?${qs.toString()}`;
}

const LARGE_FILE_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Downloads a same-origin URL with progress tracking for small files, and
 * falls back to a native browser download for very large files so we never
 * buffer hundreds of megabytes into the JS heap on mobile devices.
 */
export async function downloadWithFallback(
  url: string,
  onProgress: (p: DownloadProgress) => void,
  signal?: AbortSignal,
): Promise<{ blob: Blob; response: Response } | { direct: true }> {
  try {
    const headRes = await fetch(url, { method: "HEAD", signal });
    if (headRes.ok) {
      const cl = headRes.headers.get("content-length");
      if (cl && parseInt(cl, 10) > LARGE_FILE_BYTES) {
        triggerNativeDownload(url);
        return { direct: true };
      }
    }
  } catch {
    // HEAD not supported or failed; continue with normal fetch.
  }
  return fetchWithProgress(url, onProgress, signal);
}

/**
 * Sanitises a string so it's safe to use as a filename on all platforms.
 * Trims to 80 chars, strips filesystem-hostile punctuation.
 */
export function safeFilename(raw: string, fallback = "download"): string {
  const cleaned = raw
    .replace(/[\\/:*?"<>|\r\n\t]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  return cleaned || fallback;
}

export type DownloadPhase = "fetching" | "downloading" | "done";

export interface DownloadProgress {
  /** Current phase of the download. */
  phase: DownloadPhase;
  /** Bytes received so far. */
  downloaded: number;
  /** Total bytes from Content-Length, or null if unknown. */
  total: number | null;
  /** Download speed in bytes per second. */
  speed: number;
  /** Estimated seconds remaining, or null if unknown. */
  eta: number | null;
  /** 0–100 progress percentage, or null if total is unknown. */
  percent: number | null;
}

/**
 * Fetches a URL with real-time download progress tracking via the
 * ReadableStream API. Calls onProgress on each chunk received.
 *
 * The download has two phases:
 * - "fetching": waiting for the server to respond (yt-dlp is running, etc.)
 * - "downloading": response headers received, body bytes streaming in
 *
 * Returns the blob and the original Response (for header inspection).
 */
export async function fetchWithProgress(
  url: string,
  onProgress: (p: DownloadProgress) => void,
  signal?: AbortSignal,
): Promise<{ blob: Blob; response: Response }> {
  // Immediately notify that we're fetching (server may take 10-60s to respond)
  onProgress({
    phase: "fetching",
    downloaded: 0,
    total: null,
    speed: 0,
    eta: null,
    percent: null,
  });

  const res = await fetch(url, { signal });
  if (!res.ok) {
    const text = await res.text().catch(() => `Server error (${res.status})`);
    throw new Error(text?.trim() || `Download failed (${res.status})`);
  }

  const contentLength = res.headers.get("content-length");
  const total = contentLength ? parseInt(contentLength, 10) : null;

  // If no streaming body, fall back to blob()
  if (!res.body) {
    const blob = await res.blob();
    onProgress({
      phase: "done",
      downloaded: blob.size,
      total: blob.size,
      speed: 0,
      eta: 0,
      percent: 100,
    });
    return { blob, response: res };
  }

  // Headers received — switch to downloading phase
  onProgress({
    phase: "downloading",
    downloaded: 0,
    total,
    speed: 0,
    eta: null,
    percent: total ? 0 : null,
  });

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let downloaded = 0;
  const startTime = Date.now();
  let lastTime = startTime;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      downloaded += value.length;
    }

    const now = Date.now();
    if (now - lastTime >= 300) {
      const elapsed = (now - startTime) / 1000;
      const speed = elapsed > 0 ? downloaded / elapsed : 0;
      const eta = total && speed > 0 ? (total - downloaded) / speed : null;
      const percent = total ? Math.min(Math.round((downloaded / total) * 100), 99) : null;
      onProgress({ phase: "downloading", downloaded, total, speed, eta, percent });
      lastTime = now;
    }
  }

  // Final progress update
  const elapsed = (Date.now() - startTime) / 1000;
  const speed = elapsed > 0 ? downloaded / elapsed : 0;
  onProgress({
    phase: "done",
    downloaded,
    total: total ?? downloaded,
    speed,
    eta: 0,
    percent: 100,
  });

  const blob = new Blob(chunks as BlobPart[], {
    type: res.headers.get("content-type") || "application/octet-stream",
  });
  return { blob, response: res };
}

/** Formats bytes into a human-readable string (e.g. "1.5 MB"). */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/** Formats seconds into a human-readable duration (e.g. "1m 30s"). */
export function formatEta(seconds: number): string {
  if (seconds < 1) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}
