import { cookies } from 'next/headers';

/** مدة صلاحية جلسة المتصفّح (ثوانٍ) — 7 أيام */
export const BROWSER_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export const BROWSER_SESSION_COOKIE_NAME = 'client_sess';

export function browserSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: BROWSER_SESSION_MAX_AGE_SEC,
  };
}

export function generateBrowserSessionId() {
  return crypto.randomUUID();
}

/** يقرأ معرّف الجلسة من طلب middleware أو Route Handler. */
export function getBrowserSessionIdFromRequest(request) {
  const value = request.cookies?.get?.(BROWSER_SESSION_COOKIE_NAME)?.value;
  return value && value.length > 0 ? value : null;
}

/** يُنشئ معرّفاً جديداً إن لم يكن موجوداً في الكوكي. */
export function getOrCreateBrowserSessionId(request) {
  const existing = getBrowserSessionIdFromRequest(request);
  if (existing) return { sessionId: existing, isNew: false };
  return { sessionId: generateBrowserSessionId(), isNew: true };
}

/** يقرأ معرّف الجلسة من كوكي الخادم (Route Handlers / Server Components). */
export async function getBrowserSessionIdFromCookies() {
  const store = await cookies();
  return store.get(BROWSER_SESSION_COOKIE_NAME)?.value ?? null;
}
