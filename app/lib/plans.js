/** باقات الرفع بالريال السعودي — لا يوجد مجاني؛ التفعيل من لوحة التحكم أو واجهة `/api/billing/activate-plan`. */

/**
 * وضع مجاني للجميع: يسمح بالرفع دون تسجيل دخول أو باقة.
 * عطّله بإعداد NEXT_PUBLIC_FREE_PUBLIC_MODE=false لاحقاً عند التحوّل إلى نموذج مدفوع.
 */
const RAW_FREE_MODE = (process.env.NEXT_PUBLIC_FREE_PUBLIC_MODE ?? 'true').trim().toLowerCase();
export const FREE_PUBLIC_MODE = RAW_FREE_MODE !== 'false' && RAW_FREE_MODE !== '0';

/** معرّف ضيف ثابت يُستخدم للرفع المجهول في الوضع المجاني. */
export const GUEST_USER_ID = 'guest';

/** حجم أقصى لكل فيديو (جميع الباقات). */
export const MAX_VIDEO_BYTES_PER_UPLOAD = 50 * 1024 * 1024;

export const PLAN_KEYS = {
  NONE: 'none',
  SINGLE: 'single',
  TRIPLE: 'triple',
  UNLIMITED: 'unlimited',
};

/** عرض في الواجهة والتوثيق فقط — السعر الحقيقي عند الدفع. */
export const UPLOAD_PACKAGES = [
  {
    key: PLAN_KEYS.SINGLE,
    title: 'فيديو واحد',
    priceSar: 10,
    credits: 1,
    description: 'مناسبة لتجربة المنصّة أو لرفع محتوى واحد مهم.',
  },
  {
    key: PLAN_KEYS.TRIPLE,
    title: 'ثلاثة فيديوهات',
    priceSar: 25,
    credits: 3,
    description: 'مناسبة لسلسلة محتوى قصيرة أو حملة تسويقية بسيطة.',
  },
  {
    key: PLAN_KEYS.UNLIMITED,
    title: 'باقة غير محدودة',
    priceSar: 50,
    credits: null,
    description: 'الخيار الأمثل لصنّاع المحتوى وفرق العمل التي تحتاج إلى رفع مستمر.',
  },
];

/**
 * @param {object|null|undefined} profile — صف من جدول profiles
 * @returns {boolean}
 */
export function hasUploadQuota(profile) {
  if (FREE_PUBLIC_MODE) return true;
  if (!profile) return false;
  const plan = profile.plan_key ?? PLAN_KEYS.NONE;
  if (plan === PLAN_KEYS.UNLIMITED) return true;
  const n = profile.upload_credits_remaining;
  if (typeof n !== 'number') return false;
  return n > 0;
}

/**
 * رصيد غير محدود يُخزَّن كـ plan_key = unlimited و upload_credits_remaining = -1
 * @returns {number|null} — متبقي أو null إذا غير محدود
 */
export function effectiveCreditsRemaining(profile) {
  if (!profile) return 0;
  if ((profile.plan_key ?? PLAN_KEYS.NONE) === PLAN_KEYS.UNLIMITED) return null;
  const n = profile.upload_credits_remaining;
  return typeof n === 'number' && n >= 0 ? n : 0;
}

export function maxUploadBytesForProfile(_profile) {
  return MAX_VIDEO_BYTES_PER_UPLOAD;
}

/** تسمية عربية للعرض */      
export function planLabelAr(planKey) {
  const k = planKey ?? PLAN_KEYS.NONE;
  if (k === PLAN_KEYS.SINGLE) return 'باقة فيديو واحد';
  if (k === PLAN_KEYS.TRIPLE) return 'باقة ثلاثة فيديوهات';
  if (k === PLAN_KEYS.UNLIMITED) return 'باقة غير محدودة';
  return 'لا توجد باقة نشطة';
}
