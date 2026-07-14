const MAX_CONCURRENT = 3;
let active = 0;
const queue: (() => void)[] = [];

export async function withConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) {
    await new Promise<void>((resolve) => queue.push(resolve));
  }
  active++;
  try {
    return await fn();
  } finally {
    active--;
    const next = queue.shift();
    if (next) next();
  }
}

export function getConcurrencyStats() {
  return { active, queued: queue.length, max: MAX_CONCURRENT };
}
