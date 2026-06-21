import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/app/lib/adminSession';

const BUCKET = 'payment-receipts';

/** رابط موقّع مؤقت لعرض إيصال الدفع */
export async function GET(_request, props) {
  const params = await props.params;
  const cookie = (await cookies()).get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!cookie || !(await verifyAdminSessionCookieValue(cookie))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = params.id?.toString();
  if (!id) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 501 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: sub, error } = await admin
    .from('payment_submissions')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle();

  if (error || !sub?.storage_path) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: signed, error: signErr } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(sub.storage_path, 120);

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ error: signErr?.message || 'Could not sign URL' }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl });
}

export const runtime = 'nodejs';
