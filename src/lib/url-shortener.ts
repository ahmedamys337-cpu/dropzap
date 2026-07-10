// Stateless URL shortener: encodes the original URL into the short code itself.
// No database required, so links work on any server instance. The codes are
// not "short" for very long URLs, but they are stable and self-contained.
//
// Trade-off: the encoded slug grows with the input URL. For typical social
// media share links (~60 chars) the short code is ~80 chars. We still call it
// a "short link" because the domain is short and the link is shareable.

function base64UrlEncode(str: string): string {
  // Works in both Node and browser by using built-in btoa + manual base64url.
  const base64 = typeof Buffer !== "undefined"
    ? Buffer.from(str, "utf8").toString("base64")
    : btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(Number("0x" + p1))));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string | null {
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64 + padding, "base64").toString("utf8");
    }
    return decodeURIComponent(
      atob(base64 + padding)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return null;
  }
}

export function encodeShortUrl(originalUrl: string): string {
  return base64UrlEncode(originalUrl);
}

export function decodeShortUrl(shortCode: string): string | null {
  const decoded = base64UrlDecode(shortCode);
  if (!decoded) return null;
  if (!decoded.startsWith("http://") && !decoded.startsWith("https://")) return null;
  return decoded;
}
