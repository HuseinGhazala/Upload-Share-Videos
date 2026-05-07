const attemptsByKey = new Map();

const WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
const MAX_ATTEMPTS = Number(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS || 7);
const LOCK_MS = Number(process.env.AUTH_LOCKOUT_MS || 15 * 60 * 1000);

function now() {
  return Date.now();
}

function makeKey(ip, email) {
  const safeIp = (ip || 'unknown').trim();
  const safeEmail = (email || 'unknown').trim().toLowerCase();
  return `${safeIp}::${safeEmail}`;
}

function normalizeRecord(record) {
  const t = now();
  if (!record) return { firstTs: t, count: 0, lockUntil: 0 };
  if (record.lockUntil && t >= record.lockUntil) {
    return { firstTs: t, count: 0, lockUntil: 0 };
  }
  if (t - record.firstTs > WINDOW_MS) {
    return { firstTs: t, count: 0, lockUntil: record.lockUntil || 0 };
  }
  return record;
}

export function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for') || '';
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export function evaluateLoginAttempt(ip, email) {
  const key = makeKey(ip, email);
  const record = normalizeRecord(attemptsByKey.get(key));
  attemptsByKey.set(key, record);

  if (record.lockUntil && now() < record.lockUntil) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.lockUntil - now()) / 1000),
      reason: 'locked',
    };
  }

  if (record.count >= MAX_ATTEMPTS) {
    const lockUntil = now() + LOCK_MS;
    attemptsByKey.set(key, { ...record, lockUntil });
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(LOCK_MS / 1000),
      reason: 'too_many_attempts',
    };
  }

  return { allowed: true, retryAfterSeconds: 0, reason: 'ok' };
}

export function markLoginFailure(ip, email) {
  const key = makeKey(ip, email);
  const record = normalizeRecord(attemptsByKey.get(key));
  const next = { ...record, count: record.count + 1 };
  if (next.count >= MAX_ATTEMPTS) {
    next.lockUntil = now() + LOCK_MS;
  }
  attemptsByKey.set(key, next);
}

export function markLoginSuccess(ip, email) {
  attemptsByKey.delete(makeKey(ip, email));
}
