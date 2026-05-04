/** مدة صلاحية جلسة لوحة الإدارة (ثوانٍ) — 7 أيام */
export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export const ADMIN_SESSION_COOKIE_NAME = 'admin_sess';

/** الرقم السري لدخول لوحة الإدارة (غيّره في الإنتاج عبر ADMIN_PANEL_PIN). */
export function getAdminPanelPin() {
  return process.env.ADMIN_PANEL_PIN ?? '123456';
}

function getAdminSessionSigningSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAdminPanelPin();
}

async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) {
    r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return r === 0;
}

export async function createAdminSessionCookieValue() {
  const secret = getAdminSessionSigningSecret();
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SEC;
  const expStr = String(exp);
  const sig = await hmacSha256Hex(secret, expStr);
  return `${expStr}.${sig}`;
}

export async function verifyAdminSessionCookieValue(token) {
  if (!token || typeof token !== 'string') return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const secret = getAdminSessionSigningSecret();
  const expected = await hmacSha256Hex(secret, expStr);
  return timingSafeEqualHex(sig, expected);
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  };
}
