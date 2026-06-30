const rateMap = new Map<string, { count: number; lastReset: number }>();
const WINDOW_MS = 10000;
const MAX_REQUESTS = 10;

// Prune stale entries every 5 minutes to prevent unbounded memory growth.
// Without this, every unique IP that ever hits the server stays in the map
// forever, potentially consuming hundreds of MB on a busy server.
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateMap.entries()) {
      if (now - entry.lastReset > WINDOW_MS * 2) rateMap.delete(key);
    }
  }, 5 * 60 * 1000).unref?.();
}

export function rateLimit(ip: string): { success: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now - entry.lastReset > WINDOW_MS) {
    rateMap.set(ip, { count: 1, lastReset: now });
    return { success: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.lastReset)) / 1000);
    return { success: false, retryAfter };
  }

  entry.count++;
  return { success: true };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "127.0.0.1";
}
