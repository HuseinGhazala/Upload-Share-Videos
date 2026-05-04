import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * تشخيص فقط في التطوير: هل الخادم يقرأ متغيرات البيئة (بدون كشف القيم).
 * GET /api/dev/env-check
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const has = (name) => Boolean(process.env[name]?.trim?.());

  return NextResponse.json({
    cwdHint: process.cwd(),
    loaded: {
      NEXT_PUBLIC_SUPABASE_URL: has('NEXT_PUBLIC_SUPABASE_URL'),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: has('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      SUPABASE_SERVICE_ROLE_KEY: has('SUPABASE_SERVICE_ROLE_KEY'),
    },
    hint:
      'إذا ظهر false رغم وجود المفاتيح في .env.local: شغّل npm run dev من جذر المشروع (مجلد package.json)، أوقف الخادم ثم شغّله من جديد، واحذف مجلد .next ثم أعد التشغيل.',
  });
}

export const runtime = 'nodejs';
