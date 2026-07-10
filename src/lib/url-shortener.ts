// Stateless URL shortener: encodes the original URL into the short code itself.
// No database required, so links work on any server instance. The codes are
// not "short" for very long URLs, but they are stable and self-contained.
//
// Trade-off: the encoded slug grows with the input URL. For typical social
// media share links (~60 chars) the short code is ~80 chars. We still call it
// a "short link" because the domain is short and the link is shareable.

export function encodeShortUrl(originalUrl: string): string {
  // base64url encoding avoids / and + which would break the slug.
  return Buffer.from(originalUrl, "utf8")
    .toString("base64url")
    .replace(/=+$/, "");
}

export function decodeShortUrl(shortCode: string): string | null {
  try {
    // Restore padding if needed.
    const padding = shortCode.length % 4 === 0 ? "" : "=".repeat(4 - (shortCode.length % 4));
    const decoded = Buffer.from(shortCode + padding, "base64url").toString("utf8");
    // Basic validation.
    if (!decoded.startsWith("http://") && !decoded.startsWith("https://")) return null;
    return decoded;
  } catch {
    return null;
  }
}
