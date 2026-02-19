/**
 * Simple in-memory rate limiter for auth endpoints.
 * For production at scale, use Redis (e.g. Upstash) or your platform's rate limiting.
 */

const windowMs = 60 * 1000; // 1 minute
const maxAttempts = 10; // per window per identifier

const store = new Map<string, { count: number; resetAt: number }>();

function getIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function cleanup(): void {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetAt < now) store.delete(key);
  }
}

export function checkRateLimit(request: Request): { ok: boolean; retryAfter?: number } {
  cleanup();
  const id = getIdentifier(request);
  const now = Date.now();
  const entry = store.get(id);

  if (!entry) {
    store.set(id, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (now >= entry.resetAt) {
    store.set(id, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  entry.count += 1;
  if (entry.count > maxAttempts) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}
