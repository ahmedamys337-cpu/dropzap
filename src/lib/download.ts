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
