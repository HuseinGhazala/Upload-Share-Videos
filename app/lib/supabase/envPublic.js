/**
 * Client-safe checks for NEXT_PUBLIC_* (inlined by Next.js at bundle time).
 * Call after editing .env.local: stop dev server → start again (`npm run dev`).
 */

export function trimEnv(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function isSupabaseBrowserConfigured() {
  const url = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = trimEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !key) return false;
  if (url.includes('placeholder.supabase.co')) return false;
  if (key.includes('BUILD_PLACEHOLDER')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Arabic guidance when signUp/signIn fails at the network layer. */
export function messageForSupabaseConnectivityError(originalMessage) {
  const m = (originalMessage || '').toLowerCase();
  const invalidCredentials =
    m.includes('invalid login credentials') ||
    m.includes('invalid email or password') ||
    m.includes('email not confirmed');
  const network =
    m.includes('failed to fetch') ||
    m.includes('networkerror') ||
    m.includes('network request failed') ||
    m.includes('load failed');

  const configHint =
    'إذا لم تضبط المشروع بعد: أنشئ ملف `.env.local` في جذر المشروع وأضف `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY` من لوحة Supabase → Settings → API، ثم **أوقف وأعد تشغيل** `npm run dev`.';

  if (!isSupabaseBrowserConfigured() && !originalMessage) {
    return `خطأ الإعدادات: عنوان Supabase أو المفتاح غير موجودين أو ما زالت القيم الافتراضية للبناء نشطة.\n${configHint}`;
  }
  if (invalidCredentials) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من البيانات وحاول مرة أخرى.';
  }
  if (network) {
    return `تعذر الاتصال بخدمة Supabase. تحقق من الإنترنت، والإضافات التي تحجب الطلبات، وأن عنوان المشروع يبدأ بـ https وليس له مسافات زائدة. ${configHint}`;
  }
  return originalMessage || 'حدث خطأ غير متوقع.';
}
