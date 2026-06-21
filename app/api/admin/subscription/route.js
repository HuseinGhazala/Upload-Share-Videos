import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { PLAN_KEYS } from '@/app/lib/plans';
import { paidPlanProfileUpdate } from '@/app/lib/activatePaidPlan';
import {
  ADMIN_SESSION_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/app/lib/adminSession';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIVATE_PLANS = new Set([PLAN_KEYS.SINGLE, PLAN_KEYS.TRIPLE, PLAN_KEYS.UNLIMITED]);

/**
 * تفعيل أو إلغاء اشتراك مستخدم (جلسة لوحة الإدارة فقط).
 * POST JSON: { "userId": "<uuid>", "action": "activate" | "cancel", "planKey"?: "single" | "triple" | "unlimited" }
 */
export async function POST(request) {
  const cookie = (await cookies()).get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!cookie || !(await verifyAdminSessionCookieValue(cookie))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const userId = body.userId?.toString().trim() ?? '';
  const action = body.action?.toString().trim() ?? '';
  const planKey = body.planKey?.toString().trim() ?? '';

  if (!userId || !UUID_RE.test(userId)) {
    return NextResponse.json({ success: false, error: 'Invalid userId' }, { status: 400 });
  }
  if (action !== 'activate' && action !== 'cancel') {
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }
  if (action === 'activate' && !ACTIVATE_PLANS.has(planKey)) {
    return NextResponse.json({ success: false, error: 'Invalid or missing planKey' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { success: false, error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' },
      { status: 501 }
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const payload =
    action === 'cancel'
      ? {
          plan_key: PLAN_KEYS.NONE,
          upload_credits_remaining: 0,
          subscription_status: 'canceled',
          subscription_tier: 'free',
          updated_at: new Date().toISOString(),
        }
      : paidPlanProfileUpdate(planKey);
  if (action === 'activate' && !payload) {
    return NextResponse.json({ success: false, error: 'Invalid planKey' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('id');

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  if (!data?.length) {
    return NextResponse.json(
      { success: false, error: 'No profile for this user (unknown id or not in profiles)' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

export const runtime = 'nodejs';
