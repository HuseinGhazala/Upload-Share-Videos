import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  evaluateLoginAttempt,
  getClientIp,
  markLoginFailure,
  markLoginSuccess,
} from '@/app/lib/security/loginProtection';
import { verifyCaptchaToken } from '@/app/lib/security/captcha';

async function getSupabaseServerClient() {
  const cookieStore = await cookies();
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
    return NextResponse.json({ ok: false, error: 'بيانات الطلب غير صالحة.' }, { status: 400 });
  }

  const email = normalize(body.email).toLowerCase();
  const password = normalize(body.password);
  const captchaToken = normalize(body.captchaToken);
  const ip = getClientIp(request);

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' }, { status: 400 });
  }

  const gate = evaluateLoginAttempt(ip, email);
  if (!gate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: 'تم إيقاف محاولات تسجيل الدخول مؤقتاً لحماية حسابك. يرجى المحاولة بعد قليل.',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(gate.retryAfterSeconds || 60) },
      }
    );
  }

  const captcha = await verifyCaptchaToken(captchaToken, ip);
  if (!captcha.ok) {
    markLoginFailure(ip, email);
    return NextResponse.json(
      { ok: false, error: 'لم يكتمل التحقق الأمني. يرجى المحاولة مرة أخرى.' },
      { status: 400 }
    );
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'إعدادات الخادم غير مكتملة، يرجى المحاولة لاحقاً.' }, { status: 500 });
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    markLoginFailure(ip, email);
    return NextResponse.json(
      { ok: false, error: 'البيانات غير صحيحة، أو أن الحساب لم يُفعَّل بعد.' },
      { status: 401 }
    );
  }

  markLoginSuccess(ip, email);
  return NextResponse.json({ ok: true });
}
