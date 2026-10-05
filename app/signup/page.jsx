'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AppNavbar from '@/app/components/AppNavbar';
import {
  isSupabaseBrowserConfigured,
} from '@/app/lib/supabase/envPublic';
import { getAttributionFromLocation, trackFunnelEvent } from '@/app/lib/analytics/funnel';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [nextPlan, setNextPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setNextPlan(params.get('plan') || '');
    }, 0);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      trackFunnelEvent('start_signup', getAttributionFromLocation());
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email,
          password,
          origin: window.location.origin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'تعذّر إنشاء الحساب، حاول مرة أخرى.');
      }
      trackFunnelEvent('complete_signup', {
        plan: nextPlan || '',
        ...getAttributionFromLocation(),
      });
      setMessage('تم إنشاء حسابك بنجاح! جاري التحويل...');
      setTimeout(() => {
        window.location.href = '/';
      }, 900);
    } catch (err) {
      const raw = typeof err?.message === 'string' ? err.message : '';
      setError(raw || 'تعذّر إنشاء الحساب، حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-surface">
      <div className="w-full max-w-lg mx-auto py-10 sm:py-14 px-4">
        <AppNavbar />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-surface border border-outline-variant/30 rounded-3xl p-8 sm:p-10 shadow-sm mt-8"
        >
          <h1 className="text-3xl font-headline-md font-bold text-center mb-6 text-primary">
            إنشاء حساب جديد
          </h1>
          {!isSupabaseBrowserConfigured() && (
            <p className="text-xs text-error bg-error-container/20 border border-error/20 rounded-xl px-3 py-3 mb-4 leading-relaxed whitespace-pre-wrap">
              تنبيه: يبدو أن إعدادات الاتصال غير جاهزة في النسخة الحالية. يمكنك المحاولة، وإذا تكرّر الفشل راجع متغيرات NEXT_PUBLIC ثم أعد نشر الموقع.
            </p>
          )}
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="signup-name" className="block text-sm font-bold text-on-surface mb-2">الاسم الكامل</label>
              <input
                id="signup-name"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl bg-background border border-outline-variant/50 px-4 py-3 text-on-surface outline-none focus:border-primary placeholder:text-on-surface-variant/50 transition-colors"
                autoComplete="name"
                placeholder="أحمد محمد"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-bold text-on-surface mb-2">البريد الإلكتروني</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-background border border-outline-variant/50 px-4 py-3 text-on-surface outline-none focus:border-primary placeholder:text-on-surface-variant/50 transition-colors"
                autoComplete="email"
                placeholder="name@example.com"
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-bold text-on-surface mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-background border border-outline-variant/50 px-4 py-3 pe-12 text-on-surface outline-none focus:border-primary placeholder:text-on-surface-variant/50 transition-colors"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 p-1 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-error bg-error-container/30 border border-error/20 rounded-lg px-3 py-2 text-center font-bold">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-primary bg-primary-container/30 border border-primary/20 rounded-lg px-3 py-2 text-center font-bold">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-hover text-white w-full py-4 rounded-2xl font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'جاري إنشاء الحساب…' : 'إنشاء الحساب'}
            </button>
          </form>
          <p className="text-center text-sm text-on-surface-variant mt-8">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary hover:text-primary-hover font-bold">
              تسجيل الدخول
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
