const rateMap = new Map<string, { count: number; lastReset: number }>();
const WINDOW_MS = 10000;
const MAX_REQUESTS = 10;

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
