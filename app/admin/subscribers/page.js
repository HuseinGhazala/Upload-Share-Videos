import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import AdminNav from '../AdminNav';
import { PLAN_KEYS, planLabelAr } from '@/app/lib/plans';
import SubscriberRowActions from './SubscriberRowActions';
import { readSupabaseAdminEnv } from '@/app/lib/supabaseServerEnv';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'المشتركون والباقات',
  robots: { index: false, follow: false },
};

function creditsLabel(row) {
  const plan = row.plan_key ?? PLAN_KEYS.NONE;
  if (plan === PLAN_KEYS.UNLIMITED) return 'غير محدود';
  const n = row.upload_credits_remaining;
  if (typeof n === 'number' && n >= 0) return `${n} فيديو متبقي`;
  return '—';
}

function hasActivePackage(row) {
  return (row.plan_key ?? PLAN_KEYS.NONE) !== PLAN_KEYS.NONE;
}

export default async function AdminSubscribersPage() {
  const { url, serviceKey, missing } = readSupabaseAdminEnv();

  if (!url || !serviceKey) {
    return (
      <main className="min-h-screen bg-[#050810] text-white px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <AdminNav current="subscribers" />
          <p className="text-red-300">
            الخادم لا يقرأ المتغيرات التالية من البيئة:{' '}
            {missing.map((k) => (
              <code key={k} className="text-white mx-1">
                {k}
              </code>
            ))}
          </p>
          <p className="text-white/55 text-sm leading-relaxed max-w-lg mx-auto">
            تأكد أن الملف <code className="text-white/80">.env.local</code> في نفس مجلد <code className="text-white/80">package.json</code>،
            ثم <strong className="text-white/80">أوقف</strong> خادم التطوير (<code className="text-white/70">Ctrl+C</code>) و<strong className="text-white/80">شغّله من جديد</strong> (
            <code className="text-white/70">npm run dev</code>). إن استمرت المشكلة احذف مجلد{' '}
            <code className="text-white/70">.next</code> ثم أعد التشغيل. في الإنتاج (مثل Vercel) أضف نفس الأسماء في إعدادات Environment للمشروع.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-indigo-300/90">
              للتشخيص افتح: <code dir="ltr">/api/dev/env-check</code>
            </p>
          )}
          <Link href="/pricing" className="inline-block mt-4 text-emerald-400 hover:text-emerald-300">
            ← العودة للأسعار
          </Link>
        </div>
      </main>
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: rows, error } = await admin
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#050810] text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <p className="text-center mb-4">
          <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 text-sm">
            ← العودة للأسعار
          </Link>
        </p>

        <h1 className="text-2xl font-bold text-center mb-2">المشتركون والباقات</h1>
        <p className="text-white/50 text-sm text-center mb-8">
          عرض من جدول <code className="text-indigo-300">profiles</code> في Supabase (آخر تحديث أولاً). من عمود
          «إجراءات» يمكنك <span className="text-white/70">تفعيل</span> باقة لأي مستخدم أو{' '}
          <span className="text-white/70">إلغاء</span> الباقة الحالية (يحتاج دخول الإدارة).
        </p>

        <AdminNav current="subscribers" />

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm mb-6">
            تعذر القراءة: {error.message}
          </div>
        )}

        {!error && (!rows || rows.length === 0) && (
          <p className="text-center text-white/45 py-12">لا توجد صفوف في profiles بعد.</p>
        )}

        {!error && rows && rows.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
            <table className="w-full text-sm text-right min-w-[960px]">
              <thead>
                <tr className="border-b border-white/10 text-white/55">
                  <th className="p-3 font-semibold">البريد</th>
                  <th className="p-3 font-semibold">الاسم</th>
                  <th className="p-3 font-semibold">الباقة الحالية</th>
                  <th className="p-3 font-semibold">رصيد الرفع</th>
                  <th className="p-3 font-semibold">حالة الاشتراك</th>
                  <th className="p-3 font-semibold w-[1%] whitespace-nowrap">إجراءات</th>
                  <th className="p-3 font-semibold">معرّف المستخدم</th>
                  <th className="p-3 font-semibold">أنشئ في</th>
                  <th className="p-3 font-semibold">آخر تحديث</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.04]">
                    <td className="p-3 text-white/90 align-top">{row.email ?? '—'}</td>
                    <td className="p-3 text-white/80 align-top">{row.full_name?.trim() || '—'}</td>
                    <td className="p-3 align-top">
                      <span className="text-emerald-200/95">{planLabelAr(row.plan_key)}</span>
                      {row.subscription_tier && row.subscription_tier !== 'free' && (
                        <span className="block text-[10px] text-white/35 mt-1">
                          (قديم: {row.subscription_tier})
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-white/85 align-top tabular-nums">{creditsLabel(row)}</td>
                    <td className="p-3 align-top text-white/75">{row.subscription_status ?? '—'}</td>
                    <td className="p-3 align-top">
                      <SubscriberRowActions
                        userId={row.id}
                        hasActivePlan={hasActivePackage(row)}
                      />
                    </td>
                    <td className="p-3 align-top">
                      <code dir="ltr" className="text-[11px] text-indigo-300 break-all">
                        {row.id}
                      </code>
                    </td>
                    <td className="p-3 text-white/55 align-top text-xs whitespace-nowrap">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString('ar-SA', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="p-3 text-white/55 align-top text-xs whitespace-nowrap">
                      {row.updated_at
                        ? new Date(row.updated_at).toLocaleString('ar-SA', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-8 text-xs text-white/35 text-center leading-relaxed">
          الوصول يتطلّب تسجيل الدخول من <code className="text-white/50">/admin/login</code> برمز الإدارة.
        </p>
      </div>
    </main>
  );
}
