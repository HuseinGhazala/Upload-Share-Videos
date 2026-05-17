import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getClientIp } from '@/app/lib/security/loginProtection';
import { verifyCaptchaToken } from '@/app/lib/security/captcha';

function getSupabaseServerClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  if (!url || !key) return null;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

function normalize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'بيانات الطلب غير صالحة' }, { status: 400 });
  }

  const email = normalize(body.email).toLowerCase();
  const captchaToken = normalize(body.captchaToken);
  const origin = normalize(body.origin);
  const ip = getClientIp(request);

  if (!email) {
    return NextResponse.json({ ok: false, error: 'أدخل البريد الإلكتروني' }, { status: 400 });
  }

  const captcha = await verifyCaptchaToken(captchaToken, ip);
  if (!captcha.ok) {
    return NextResponse.json(
      { ok: false, error: 'فشل تحقق الأمان. أعد المحاولة.' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'إعدادات الخادم غير مكتملة' }, { status: 500 });
  }

  const callbackOrigin = origin || new URL(request.url).origin;
  const nextPath = encodeURIComponent('/reset-password');
  const redirectTo = `${callbackOrigin}/auth/callback?next=${nextPath}`;

  await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  return NextResponse.json({
    ok: true,
    message:
      'إذا كان البريد مسجّلاً لدينا، ستصلك رسالة تحتوي رابط إعادة تعيين كلمة المرور. تحقق من صندوق الوارد والرسائل غير المرغوب فيها.',
  });
}
