'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import AppNavbar from '@/app/components/AppNavbar';
import {
  isSupabaseBrowserConfigured,
  messageForSupabaseConnectivityError,
} from '@/app/lib/supabase/envPublic';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(searchParams.get('error') || '');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!isSupabaseBrowserConfigured()) {
        setError(messageForSupabaseConnectivityError(''));
        setLoading(false);
        return;
      }
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      router.push('/');
      router.refresh();
    } catch (err) {
      const raw = typeof err?.message === 'string' ? err.message : String(err ?? '');
      setError(messageForSupabaseConnectivityError(raw) || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white px-4 py-12">
      <div className="max-w-md mx-auto">
        <AppNavbar />
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-center mb-2">تسجيل الدخول</h1>
          <p className="text-white/50 text-sm text-center mb-8">
            ادخل بريدك وكلمة المرور للمتابعة.
          </p>
          {!isSupabaseBrowserConfigured() && (
            <p className="text-xs text-amber-200/90 bg-amber-500/15 border border-amber-400/25 rounded-xl px-3 py-3 mb-4 leading-relaxed whitespace-pre-wrap">
              {messageForSupabaseConnectivityError('')}
            </p>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">كلمة المرور</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-indigo-500"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold transition"
            >
              {loading ? 'جاري الدخول…' : 'دخول'}
            </button>
          </form>
          <p className="text-center text-sm text-white/50 mt-6">
            ليس لديك حساب؟{' '}
            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300">
              إنشاء حساب
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
          <p className="text-white/50">جاري التحميل…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
