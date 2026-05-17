'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AppNavbar from '@/app/components/AppNavbar';
import { isSupabaseBrowserConfigured } from '@/app/lib/supabase/envPublic';

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setHasSession(Boolean(data?.authenticated));
        setSessionChecked(true);
      })
      .catch(() => {
        if (!cancelled) {
          setHasSession(false);
          setSessionChecked(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'تعذر تحديث كلمة المرور');
      }
      router.push('/login?reset=1');
      router.refresh();
    } catch (err) {
      const raw = typeof err?.message === 'string' ? err.message : '';
      setError(raw || 'تعذر تحديث كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-white">
      <div className="section-wrap max-w-2xl py-10 sm:py-14">
        <AppNavbar />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel p-8 sm:p-10"
        >
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-transparent">
            كلمة مرور جديدة
          </h1>
          <p className="text-white/55 text-sm text-center mb-8">
            اختر كلمة مرور جديدة لحسابك.
          </p>
          {!isSupabaseBrowserConfigured() && (
            <p className="text-xs text-amber-200/90 bg-amber-500/15 border border-amber-400/25 rounded-xl px-3 py-3 mb-4 leading-relaxed whitespace-pre-wrap">
              تنبيه: إعدادات Supabase الظاهرة للمتصفح تبدو غير جاهزة. راجع متغيرات NEXT_PUBLIC ثم أعد النشر.
            </p>
          )}
          {!sessionChecked ? (
            <p className="text-center text-white/50 text-sm">جاري التحقق من الرابط…</p>
          ) : !hasSession ? (
            <motion.div className="space-y-4">
              <p className="text-sm text-amber-200/90 bg-amber-500/15 border border-amber-400/25 rounded-lg px-3 py-3">
                الرابط غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً من صفحة استعادة كلمة المرور.
              </p>
              <Link href="/forgot-password" className="btn-primary w-full inline-block text-center">
                طلب رابط جديد
              </Link>
              <p className="text-center text-sm text-white/50">
                <Link href="/login" className="text-indigo-300 hover:text-indigo-200">
                  تسجيل الدخول
                </Link>
              </p>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-password" className="block text-sm text-white/70 mb-1">
                  كلمة المرور الجديدة
                </label>
                <input
                  id="reset-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-indigo-500 placeholder:text-white/30"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor="reset-confirm" className="block text-sm text-white/70 mb-1">
                  تأكيد كلمة المرور
                </label>
                <input
                  id="reset-confirm"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-indigo-500 placeholder:text-white/30"
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? 'جاري الحفظ…' : 'حفظ كلمة المرور'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
          <p className="text-white/50">جاري التحميل…</p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
