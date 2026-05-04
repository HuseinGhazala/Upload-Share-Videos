/**
 * قراءة متغيرات Supabase على الخادم (مع قصّ المسافات — أحياناً ترجع قيماً فارغة بسبب مسافة زائدة).
 */
export function readSupabaseAdminEnv() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const missing = [];
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return { url, serviceKey, missing, ok: missing.length === 0 };
}
