import { createClient } from '@/app/lib/supabase/server';
import {
  FREE_PUBLIC_MODE,
  GUEST_USER_ID,
  MAX_VIDEO_BYTES_PER_UPLOAD,
  hasUploadQuota,
  maxUploadBytesForProfile,
} from '@/app/lib/plans';

export async function getOptionalAuthUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * يبني سياقاً مصطنعاً لمستخدم ضيف عند تشغيل الوضع المجاني العام.
 * يُستخدم لتمرير عمليات الرفع دون الحاجة لتسجيل دخول.
 */
function buildGuestContext() {
  return {
    user: { id: GUEST_USER_ID, email: null, isGuest: true },
    maxUploadBytes: MAX_VIDEO_BYTES_PER_UPLOAD,
    profile: null,
    uploadAllowed: true,
    isGuest: true,
  };
}

/**
 * Resolved session + billing row for upload routes (uses cookies).
 * في الوضع المجاني العام، يُسمح بالرفع للضيوف بسياق مبسّط.
 */
export async function getAuthenticatedUploadContext() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    if (FREE_PUBLIC_MODE) return buildGuestContext();
    return { user: null, maxUploadBytes: null, profile: null, uploadAllowed: false, isGuest: false };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_key, upload_credits_remaining, subscription_tier, subscription_status')
    .eq('id', user.id)
    .maybeSingle();

  const maxUploadBytes = maxUploadBytesForProfile(profile);
  const uploadAllowed = hasUploadQuota(profile);

  return { user, maxUploadBytes, profile, uploadAllowed, isGuest: false };
}

/** بعد نجاح تخزين الملف — يستهلك رصيداً واحداً (أو يمرّ للأبد إن كانت الباقة غير محدودة). */
export async function consumeUploadCreditAfterSuccessfulSave() {
  if (FREE_PUBLIC_MODE) return { ok: true, skipped: true };

  const supabase = createClient();
  const { data, error } = await supabase.rpc('consume_upload_credit');

  if (error) {
    return { ok: false, error: error.message };
  }

  let payload = data;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = null;
    }
  }

  if (payload && typeof payload === 'object' && payload.ok === false) {
    return { ok: false, error: payload.error || 'consume_failed' };
  }

  return { ok: true };
}
