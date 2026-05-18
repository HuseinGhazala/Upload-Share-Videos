'use client';

import { Suspense, useEffect, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AppNavbar from '@/app/components/AppNavbar';
import { isSupabaseBrowserConfigured } from '@/app/lib/supabase/envPublic';
import { getCaptchaClientConfig } from '@/app/lib/security/captcha';

const CAPTCHA = getCaptchaClientConfig();

function captchaScriptSrc(provider) {
  if (provider === 'recaptcha') return 'https://www.google.com/recaptcha/api.js';
  if (provider === 'hcaptcha') return 'https://js.hcaptcha.com/1/api.js';
  return '';
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

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
    setMessage('');
    if (CAPTCHA.provider && CAPTCHA.siteKey && !captchaToken) {
      setError('يرجى إكمال خطوة التحقق الأمني قبل المتابعة.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          captchaToken,
          origin: window.location.origin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'تعذّر إرسال الطلب، حاول مرة أخرى.');
      }
      setMessage(
        data.message ||
          'إذا كان البريد مسجّلاً لدينا فستصلك رسالة تتضمن رابط إعادة تعيين كلمة المرور خلال دقائق.'
      );
    } catch (err) {
      const raw = typeof err?.message === 'string' ? err.message : '';
      setError(raw || 'تعذّر إرسال الطلب، حاول مرة أخرى.');
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
            نسيت كلمة المرور؟
          </h1>
          <p className="text-white/55 text-sm text-center mb-8">
            أدخل بريدك الإلكتروني، وسنرسل إليك رابطاً آمناً لإنشاء كلمة مرور جديدة.
          </p>
          {!isSupabaseBrowserConfigured() && (
            <p className="text-xs text-amber-200/90 bg-amber-500/15 border border-amber-400/25 rounded-xl px-3 py-3 mb-4 leading-relaxed whitespace-pre-wrap">
              تنبيه: يبدو أن إعدادات الاتصال غير جاهزة في النسخة الحالية. راجع متغيرات NEXT_PUBLIC ثم أعد نشر الموقع.
            </p>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="forgot-email" className="block text-sm text-white/70 mb-1">
                البريد الإلكتروني
              </label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-indigo-500 placeholder:text-white/30"
                autoComplete="email"
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
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                {message}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'جاري الإرسال…' : 'إرسال رابط إعادة التعيين'}
            </button>
          </form>
          <p className="text-center text-sm text-white/50 mt-6">
            <Link href="/login" className="text-indigo-300 hover:text-indigo-200">
              ← العودة إلى تسجيل الدخول
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
          <p className="text-white/50">جاري تحميل الصفحة…</p>
        </main>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
