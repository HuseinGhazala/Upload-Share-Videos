'use client';

import { Suspense, useEffect, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import AppNavbar from '@/app/components/AppNavbar';
import {
  isSupabaseBrowserConfigured,
} from '@/app/lib/supabase/envPublic';
import { getCaptchaClientConfig } from '@/app/lib/security/captcha';
import { getAttributionFromLocation, trackFunnelEvent } from '@/app/lib/analytics/funnel';

const CAPTCHA = getCaptchaClientConfig();

function captchaScriptSrc(provider) {
  if (provider === 'recaptcha') return 'https://www.google.com/recaptcha/api.js';
  if (provider === 'hcaptcha') return 'https://js.hcaptcha.com/1/api.js';
  return '';
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const resetDone = searchParams.get('reset') === '1';
  const [error, setError] = useState(searchParams.get('error') || '');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const nextPath = searchParams.get('next');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.__authCaptchaDone = (token) => setCaptchaToken(typeof token === 'string' ? token : '');
    window.__authCaptchaExpired = () => setCaptchaToken('');
    return () => {
      delete window.__authCaptchaDone;
      delete window.__authCaptchaExpired;
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (CAPTCHA.provider && CAPTCHA.siteKey && !captchaToken) {
      setError('يرجى إكمال خطوة التحقق الأمني قبل المتابعة.');
      return;
    }
    setLoading(true);
    try {
      trackFunnelEvent('start_login', {
        source: searchParams.get('from') || '',
        ...getAttributionFromLocation(),
      });
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, captchaToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'تعذّر تسجيل الدخول، حاول مرة أخرى.');
      }
      const meRes = await fetch('/api/me', { credentials: 'include' });
      const me = await meRes.json().catch(() => ({}));
      trackFunnelEvent('complete_login', {
        hasPlan: Boolean(me?.uploadAllowed),
        source: searchParams.get('from') || '',
      });
      if (nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')) {
        window.location.href = nextPath;
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      const raw = typeof err?.message === 'string' ? err.message : '';
      setError(raw || 'تعذّر تسجيل الدخول، حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-surface">
      {CAPTCHA.provider && CAPTCHA.siteKey ? (
        <Script src={captchaScriptSrc(CAPTCHA.provider)} strategy="afterInteractive" />
      ) : null}
      <div className="w-full max-w-lg mx-auto py-10 sm:py-14 px-4">
        <AppNavbar />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-surface border border-outline-variant/30 rounded-3xl p-8 sm:p-10 shadow-sm mt-8"
        >
          <h1 className="text-3xl font-headline-md font-bold text-center mb-2 text-primary">
            تسجيل الدخول
          </h1>
          <p className="text-on-surface-variant text-sm text-center mb-8">
            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك.
          </p>
          
          {!isSupabaseBrowserConfigured() && (
            <p className="text-xs text-error bg-error-container/20 border border-error/20 rounded-xl px-3 py-3 mb-4 leading-relaxed whitespace-pre-wrap">
              تنبيه: يبدو أن إعدادات الاتصال غير جاهزة في النسخة الحالية. يمكنك المحاولة، وإذا تكرّر الفشل راجع متغيرات NEXT_PUBLIC ثم أعد نشر الموقع.
            </p>
          )}
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm font-bold text-on-surface mb-2">البريد الإلكتروني</label>
              <input
                id="login-email"
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
              <div className="flex items-center justify-between gap-2 mb-2">
                <label htmlFor="login-password" className="text-sm font-bold text-on-surface">
                  كلمة المرور
                </label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary-hover shrink-0 font-bold">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-background border border-outline-variant/50 px-4 py-3 pr-12 text-on-surface outline-none focus:border-primary placeholder:text-on-surface-variant/50 transition-colors"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
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
            {CAPTCHA.provider && CAPTCHA.siteKey ? (
              <div className="space-y-2 flex justify-center py-2">
                {CAPTCHA.provider === 'recaptcha' ? (
                  <div
                    className="g-recaptcha"
                    data-sitekey={CAPTCHA.siteKey}
                    data-callback="__authCaptchaDone"
                    data-expired-callback="__authCaptchaExpired"
                  />
                ) : (
                  <div
                    className="h-captcha"
                    data-sitekey={CAPTCHA.siteKey}
                    data-callback="__authCaptchaDone"
                    data-expired-callback="__authCaptchaExpired"
                  />
                )}
                <input type="hidden" name="captchaToken" value={captchaToken} />
              </div>
            ) : null}
            {resetDone && (
              <p className="text-sm text-primary bg-primary-container/30 border border-primary/20 rounded-lg px-3 py-2 text-center">
                تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
              </p>
            )}
            {error && (
              <p className="text-sm text-error bg-error-container/30 border border-error/20 rounded-lg px-3 py-2 text-center font-bold">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-hover text-white w-full py-4 rounded-2xl font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'جاري الدخول…' : 'تسجيل الدخول'}
            </button>
          </form>
          <p className="text-center text-sm text-on-surface-variant mt-8">
            ليس لديك حساب بعد؟{' '}
            <Link href="/signup" className="text-primary hover:text-primary-hover font-bold">
              أنشئ حساباً جديداً
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background text-on-surface flex items-center justify-center">
          <p className="text-on-surface-variant">جاري تحميل الصفحة…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
