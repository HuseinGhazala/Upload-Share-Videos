import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/app/lib/adminSession';
import { updateProfilePaidPlan } from '@/app/lib/activatePaidPlan';

/**
 * POST body: { decision: "approve" | "reject", adminNote?: string }
 */
export async function POST(request, { params }) {
  const cookie = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!cookie || !(await verifyAdminSessionCookieValue(cookie))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const id = params.id?.toString();
  if (!id) {
    return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const decision = body.decision?.toString().trim();
  if (decision !== 'approve' && decision !== 'reject') {
    return NextResponse.json({ success: false, error: 'قيمة decision يجب أن تكون approve أو reject.' }, { status: 400 });
  }

  let adminNote = body.adminNote?.toString?.() ?? '';
  adminNote = adminNote.trim().length > 2000 ? adminNote.trim().slice(0, 2000) : adminNote.trim();
  if (decision === 'reject' && !adminNote) {
    adminNote = 'تم رفض الطلب';
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ success: false, error: 'Server misconfigured' }, { status: 501 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: sub, error: fetchErr } = await admin
    .from('payment_submissions')
    .select('id, user_id, plan_key, status')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !sub) {
    return NextResponse.json({ success: false, error: 'الطلب غير موجود.' }, { status: 404 });
  }

  if (sub.status !== 'pending') {
    return NextResponse.json({ success: false, error: 'تمت معالجة هذا الطلب مسبقاً.' }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (decision === 'approve') {
    const act = await updateProfilePaidPlan(admin, sub.user_id, sub.plan_key);
    if (!act.ok) {
      return NextResponse.json(
        { success: false, error: act.error === 'no_profile' ? 'لا يوجد ملف تعريفي لهذا المستخدم.' : act.error },
        { status: act.error === 'no_profile' ? 404 : 500 }
      );
    }

    const { error: upErr } = await admin
      .from('payment_submissions')
      .update({
        status: 'approved',
        admin_note: adminNote || null,
        reviewed_at: now,
      })
      .eq('id', id);

    if (upErr) {
      return NextResponse.json({ success: false, error: upErr.message }, { status: 500 });
    }
  } else {
    const { error: upErr } = await admin
      .from('payment_submissions')
      .update({
        status: 'rejected',
        admin_note: adminNote,
        reviewed_at: now,
      })
      .eq('id', id);

    if (upErr) {
      return NextResponse.json({ success: false, error: upErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export const runtime = 'nodejs';
