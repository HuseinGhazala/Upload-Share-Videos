import { PLAN_KEYS } from '@/app/lib/plans';

const PAID = new Set([PLAN_KEYS.SINGLE, PLAN_KEYS.TRIPLE, PLAN_KEYS.UNLIMITED]);

/**
 * @param {string} planKey
 * @returns {object|null} — صف التحديث لجدول profiles أو null إن لم تكن باقة مدفوعة
 */
export function paidPlanProfileUpdate(planKey) {
  if (!PAID.has(planKey)) return null;
  const upload_credits_remaining =
    planKey === PLAN_KEYS.SINGLE ? 1 : planKey === PLAN_KEYS.TRIPLE ? 3 : -1;
  return {
    plan_key: planKey,
    upload_credits_remaining,
    subscription_status: 'active',
    subscription_tier: 'pro',
    updated_at: new Date().toISOString(),
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabaseAdmin
 * @param {string} userId
 * @param {string} planKey
 */
export async function updateProfilePaidPlan(supabaseAdmin, userId, planKey) {
  const payload = paidPlanProfileUpdate(planKey);
  if (!payload) return { ok: false, error: 'invalid_plan' };
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select('id');
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: 'no_profile' };
  return { ok: true };
}
