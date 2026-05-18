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
        router.push(nextPath);
      } else if (!me?.uploadAllowed) {
        router.push('/pricing?from=login_no_plan');
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      const raw = typeof err?.message === 'string' ? err.message : '';
      setError(raw || 'تعذّر تسجيل الدخول، حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-white">
      {CAPTCHA.provider && CAPTCHA.siteKey ? (
        <Script src={captchaScriptSrc(CAPTCHA.provider)} strategy="afterInteractive" />
      ) : null}
      <div className="section-wrap max-w-2xl py-10 sm:py-14">
        <AppNavbar />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel p-8 sm:p-10"
        >
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-b from-white to-indigo-200 bg-clip-text text-transparent">
            تسجيل الدخول
          </h1>
          <p className="text-white/55 text-sm text-center mb-8">
            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك.
          </p>
          <p className="text-center text-xs text-white/45 mb-5">
            سنوجّهك تلقائياً بعد الدخول إلى الخطوة المناسبة لإكمال اشتراكك أو بدء الرفع.
          </p>
          {!isSupabaseBrowserConfigured() && (
            <p className="text-xs text-amber-200/90 bg-amber-500/15 border border-amber-400/25 rounded-xl px-3 py-3 mb-4 leading-relaxed whitespace-pre-wrap">
              تنبيه: يبدو أن إعدادات الاتصال غير جاهزة في النسخة الحالية. يمكنك المحاولة، وإذا تكرّر الفشل
              راجع متغيرات NEXT_PUBLIC ثم أعد نشر الموقع.
            </p>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm text-white/70 mb-1">البريد الإلكتروني</label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-indigo-500 placeholder:text-white/30"
                autoComplete="email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label htmlFor="login-password" className="text-sm text-white/70">
                  كلمة المرور
                </label>
                <Link href="/forgot-password" className="text-xs text-indigo-300 hover:text-indigo-200 shrink-0">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-indigo-500 placeholder:text-white/30"
                autoComplete="current-password"
              />
            </div>
            {CAPTCHA.provider && CAPTCHA.siteKey ? (
              <div className="space-y-2">
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
              <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
              </p>
            )}
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'جاري الدخول…' : 'تسجيل الدخول'}
            </button>
          </form>
          <p className="text-center text-sm text-white/50 mt-6">
            ليس لديك حساب بعد؟{' '}
            <Link href="/signup" className="text-indigo-300 hover:text-indigo-200">
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
        <main className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
          <p className="text-white/50">جاري تحميل الصفحة…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
