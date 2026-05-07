'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppNavbar from '@/app/components/AppNavbar';
import {
  isSupabaseBrowserConfigured,
} from '@/app/lib/supabase/envPublic';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
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
        throw new Error(data.error || 'فشل إنشاء الحساب');
      }
      setMessage('تم إنشاء الحساب. افتح الرابط الذي أُرسل لبريدك إذا كان تأكيد البريد مفعّلاً.');
      router.refresh();
    } catch (err) {
      const raw = typeof err?.message === 'string' ? err.message : '';
      setError(raw || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white px-4 py-12">
      <div className="max-w-md mx-auto">
        <AppNavbar />
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-2">حساب جديد</h1>
          <p className="text-white/50 text-sm text-center mb-8">
            التسجيل لإنشاء حساب فقط — الرفع يتطلّب شراء إحدى الباقات (١٠ / ٢٥ / ٥٠ ريال).
          </p>
          {!isSupabaseBrowserConfigured() && (
            <p className="text-xs text-amber-200/90 bg-amber-500/15 border border-amber-400/25 rounded-xl px-3 py-3 mb-4 leading-relaxed whitespace-pre-wrap">
              تنبيه: إعدادات Supabase الظاهرة للمتصفح تبدو غير جاهزة من نسخة البناء الحالية. يمكنك المتابعة بالمحاولة، وإن استمر الفشل راجع متغيرات
              NEXT_PUBLIC ثم أعد النشر.
            </p>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="block text-sm text-white/70 mb-1">الاسم</label>
              <input
                id="signup-name"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm text-white/70 mb-1">البريد الإلكتروني</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm text-white/70 mb-1">كلمة المرور</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                autoComplete="new-password"
              />
            </div>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold transition"
            >
              {loading ? 'جاري التسجيل…' : 'إنشاء الحساب'}
            </button>
          </form>
          <p className="text-center text-sm text-white/50 mt-6">
            لديك حساب؟{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
