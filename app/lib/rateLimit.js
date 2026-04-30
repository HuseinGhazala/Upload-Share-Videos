const buckets = new Map();

export function rateLimit(key, { max = 20, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.start >= windowMs) {
    buckets.set(key, { count: 1, start: now });
    return { allowed: true, remaining: max - 1 };
  }

  if (bucket.count >= max) {
    return { allowed: false, remaining: 0, retryAfterMs: windowMs - (now - bucket.start) };
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  return { allowed: true, remaining: max - bucket.count };
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}
