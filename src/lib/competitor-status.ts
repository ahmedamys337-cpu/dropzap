export interface StatusResult {
  up: boolean;
  statusCode: number;
  responseTimeMs: number;
  checkedAt: string;
  error?: string;
}

export async function checkStatus(url: string, timeoutMs = 10000): Promise<StatusResult> {
  const start = Date.now();
  const checkedAt = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timer);
    const responseTimeMs = Date.now() - start;

    // Treat 2xx and 3xx as up. 4xx/5xx as down for our purposes (the site is reachable but broken).
    const up = res.status < 400;

    return {
      up,
      statusCode: res.status,
      responseTimeMs,
      checkedAt,
    };
  } catch (err: any) {
    return {
      up: false,
      statusCode: 0,
      responseTimeMs: Date.now() - start,
      checkedAt,
      error: err?.name === "AbortError" ? "Timed out" : err?.message || "Network error",
    };
  }
}
