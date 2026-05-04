import { NextResponse } from 'next/server';
import {
  getAdminPanelPin,
  createAdminSessionCookieValue,
  ADMIN_SESSION_COOKIE_NAME,
  adminSessionCookieOptions,
} from '@/app/lib/adminSession';

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    // ignore
  }
  const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
  if (pin !== getAdminPanelPin()) {
    return NextResponse.json({ ok: false, error: 'رمز الدخول غير صحيح' }, { status: 401 });
  }

  const value = await createAdminSessionCookieValue();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE_NAME, value, adminSessionCookieOptions());
  return res;
}
