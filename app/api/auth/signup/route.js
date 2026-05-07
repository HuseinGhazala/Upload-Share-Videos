import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

  const fullName = normalize(body.fullName);
  const email = normalize(body.email).toLowerCase();
  const password = normalize(body.password);
  const origin = normalize(body.origin);

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'أدخل البريد الإلكتروني وكلمة المرور' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'إعدادات الخادم غير مكتملة' }, { status: 500 });
  }

  const callbackOrigin = origin || new URL(request.url).origin;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${callbackOrigin}/auth/callback`,
      data: { full_name: fullName },
    },
  });

  if (error) {
    return NextResponse.json({ ok: false, error: 'تعذر إنشاء الحساب. تحقق من البيانات وحاول مرة أخرى' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
