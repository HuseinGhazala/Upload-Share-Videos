import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLAN_KEYS } from '@/app/lib/plans';
import { updateProfilePaidPlan } from '@/app/lib/activatePaidPlan';

const VALID = new Set([PLAN_KEYS.SINGLE, PLAN_KEYS.TRIPLE, PLAN_KEYS.UNLIMITED]);

/**
 * تفعيل باقة بعد استلام الدفع (يدوي أو من نظام خارجي).
 * POST header: x-billing-secret: BILLING_ADMIN_SECRET
 * Body JSON: { "userId": "<uuid>", "planKey": "single" | "triple" | "unlimited" }
 *
 * يتطلب SUPABASE_SERVICE_ROLE_KEY في البيئة (لوحة Supabase → Settings → API → service_role).
 */
export async function POST(request) {
  const secret = request.headers.get('x-billing-secret');
  if (!secret || secret !== process.env.BILLING_ADMIN_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const userId = body.userId?.toString();
  const planKey = body.planKey?.toString();
  if (!userId || !VALID.has(planKey)) {
    return NextResponse.json({ success: false, error: 'Invalid userId or planKey' }, { status: 400 });
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

  const result = await updateProfilePaidPlan(admin, userId, planKey);
  if (!result.ok) {
    const status = result.error === 'no_profile' ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json({ success: true });
}

export const runtime = 'nodejs';
