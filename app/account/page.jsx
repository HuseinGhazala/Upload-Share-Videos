'use client';

import Link from 'next/link';
import { useAuth } from '@/app/providers/AuthProvider';
import AppNavbar from '@/app/components/AppNavbar';
import { MAX_VIDEO_BYTES_PER_UPLOAD } from '@/app/lib/plans';

export default function AccountPage() {
  const { user, loading, quota, signOut } = useAuth();

  if (!loading && !user) {
    return (
      <main className="min-h-screen bg-[#0a0a12] text-white px-4 py-12">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <AppNavbar />
          <p className="text-white/60">يجب تسجيل الدخول لعرض هذه الصفحة.</p>
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
        ? `${quota.creditsRemaining} فيديو متبقي`
        : 'لا رصيد — اشترِ باقة';

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white px-4 py-12">
      <div className="max-w-lg mx-auto">
        <AppNavbar />
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-6">حسابي</h1>
          {loading ? (
            <p className="text-white/50">جاري التحميل…</p>
          ) : (
            <>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-white/50">البريد</dt>
                  <dd className="font-medium mt-1">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-white/50">الباقة</dt>
                  <dd className="font-medium mt-1">{quota?.planLabel ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/50">رصيد الرفع</dt>
                  <dd className="font-medium mt-1">{creditsLine}</dd>
                </div>
                <div>
                  <dt className="text-white/50">حد حجم كل فيديو</dt>
                  <dd className="font-medium mt-1">{maxMb} ميجابايت</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/account/payment-proof"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-semibold transition"
                >
                  تأكيد الدفع بإيصال
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold transition"
                >
                  الباقات والأسعار
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-2.5 text-sm text-white/80 hover:bg-white/5 transition"
                >
                  خروج
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
