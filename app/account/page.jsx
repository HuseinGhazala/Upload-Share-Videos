'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthProvider';
import AppNavbar from '@/app/components/AppNavbar';
import { MAX_VIDEO_BYTES_PER_UPLOAD } from '@/app/lib/plans';
import { trackFunnelEvent } from '@/app/lib/analytics/funnel';

export default function AccountPage() {
  const { user, loading, quota, signOut } = useAuth();

  useEffect(() => {
    if (!user || !quota?.uploadAllowed) return;
    if (typeof window === 'undefined') return;
    const key = `plan-activated-${user.id}-${quota?.planKey || 'none'}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
    trackFunnelEvent('plan_activated', {
      plan: quota?.planKey || '',
    });
  }, [user, quota?.uploadAllowed, quota?.planKey]);

  if (!loading && !user) {
    return (
      <main className="min-h-screen text-white">
        <div className="section-wrap max-w-3xl py-10 sm:py-14 text-center space-y-4">
          <AppNavbar />
          <p className="text-white/60">يلزم تسجيل الدخول لعرض هذه الصفحة.</p>
          <Link href="/login" className="inline-block text-indigo-400 hover:text-indigo-300">
            تسجيل الدخول →
          </Link>
        </div>
      </main>
    );
  }

  const maxMb = Math.round(
    (quota?.maxUploadBytes ?? MAX_VIDEO_BYTES_PER_UPLOAD) / (1024 * 1024)
  );
  const creditsLine =
    quota?.creditsRemaining === null
      ? 'غير محدود'
      : typeof quota?.creditsRemaining === 'number'
        ? `${quota.creditsRemaining} فيديو متبقٍّ`
        : 'لا يوجد رصيد — اختر باقة';

  return (
    <main className="min-h-screen text-white">
      <div className="section-wrap max-w-3xl py-10 sm:py-14">
        <AppNavbar />
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel p-8 sm:p-10"
        >
          <h1 className="text-2xl font-bold mb-6">حسابي</h1>
          {loading ? (
            <p className="text-white/50">جاري التحميل…</p>
          ) : (
            <>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-white/50">البريد الإلكتروني</dt>
                  <dd className="font-medium mt-1">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-white/50">الباقة الحالية</dt>
                  <dd className="font-medium mt-1">{quota?.planLabel ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/50">الرصيد المتاح</dt>
                  <dd className="font-medium mt-1">{creditsLine}</dd>
                </div>
                <div>
                  <dt className="text-white/50">الحد الأقصى لحجم الفيديو</dt>
                  <dd className="font-medium mt-1">{maxMb} ميجابايت</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/account/payment-proof"
                  className="btn-primary px-5 py-2.5"
                >
                  إرسال إيصال الدفع
                </Link>
                <Link
                  href="/pricing"
                  className="btn-secondary px-5 py-2.5"
                >
                  استعراض الباقات
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="btn-secondary px-5 py-2.5"
                >
                  تسجيل الخروج
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </main>
  );
}
