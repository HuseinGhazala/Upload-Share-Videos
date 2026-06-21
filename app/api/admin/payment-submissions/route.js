import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/app/lib/adminSession';

/**
 * قائمة طلبات تأكيد الدفع (لوحة الإدارة).
 */
export async function GET() {
  const cookie = (await cookies()).get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!cookie || !(await verifyAdminSessionCookieValue(cookie))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 501 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .from('payment_submissions')
    .select(
      `
      id,
      user_id,
      plan_key,
      status,
      file_name,
      mime_type,
      user_note,
      admin_note,
      created_at,
      reviewed_at,
      profiles ( email, full_name )
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('payment_submissions list:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []).map((row) => {
    const prof = row.profiles;
    const flat = { ...row };
    delete flat.profiles;
    return {
      ...flat,
      email: prof?.email ?? null,
      full_name: prof?.full_name ?? null,
    };
  });

  return NextResponse.json({ submissions: rows });
}

export const runtime = 'nodejs';
