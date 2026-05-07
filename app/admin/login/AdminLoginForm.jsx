'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function safeNextPath(raw) {
  if (!raw || typeof raw !== 'string') return '/admin';
  if (!raw.startsWith('/admin')) return '/admin';
  if (raw.startsWith('//')) return '/admin';
  return raw;
}

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get('next'));

  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? 'فشل التحقق');
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setErr('خطأ في الاتصال');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050810] text-white px-4 py-16 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <p className="text-center mb-6">
          <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 text-sm">
            ← العودة للأسعار
          </Link>
        </p>
        <h1 className="text-2xl font-bold text-center mb-2">لوحة الإدارة</h1>
        <p className="text-white/45 text-sm text-center mb-8 leading-relaxed">
          أدخل رمز الدخول للمتابعة.
        </p>
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-xl space-y-5"
          dir="rtl"
        >
          <div className="block">
            <label htmlFor="admin-pin" className="text-sm text-white/60 mb-2 block">
              رمز الدخول
            </label>
            <input
              id="admin-pin"
              name="adminPin"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-[#050810] px-4 py-3 text-white outline-none focus:border-emerald-500/50"
              placeholder="••••••"
              required
            />
          </div>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 py-3 font-semibold text-white transition"
          >
            {loading ? 'جاري الدخول…' : 'دخول'}
          </button>
        </form>
      </div>
    </main>
  );
}
