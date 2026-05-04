'use client';

import Link from 'next/link';
import { useAuth } from '@/app/providers/AuthProvider';

export default function AppNavbar() {
  const { user, loading, quota, signOut } = useAuth();

  return (
    <nav className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 text-sm">
      <Link
        href="/"
        className="text-white/80 hover:text-white border border-white/15 rounded-full px-4 py-2 hover:bg-white/5 transition"
      >
        الرئيسية
      </Link>
      <Link
        href="/pricing"
        className="text-emerald-300 hover:text-emerald-200 border border-emerald-500/35 rounded-full px-4 py-2 hover:bg-emerald-500/10 transition"
      >
        الباقات والأسعار
      </Link>
      <Link
        href="/admin/login"
        title="لوحة الإدارة (رمز الدخول)"
        className="text-amber-200/90 hover:text-amber-100 border border-amber-500/35 rounded-full px-4 py-2 hover:bg-amber-500/10 transition"
      >
        لوحة الإدارة
      </Link>
      {loading ? (
        <span className="text-white/40 px-4 py-2">…</span>
      ) : user ? (
        <>
          <Link
            href="/account"
            className="text-white/80 hover:text-white border border-white/15 rounded-full px-4 py-2 hover:bg-white/5 transition"
          >
            حسابي
            {quota?.planKey === 'unlimited'
              ? ' · غير محدود'
              : typeof quota?.creditsRemaining === 'number'
                ? ` · ${quota.creditsRemaining}`
                : ''}
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="text-white/70 hover:text-white border border-white/15 rounded-full px-4 py-2 hover:bg-white/5 transition"
          >
            خروج
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-white/80 hover:text-white border border-white/15 rounded-full px-4 py-2 hover:bg-white/5 transition"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/signup"
            className="text-white bg-indigo-600/80 hover:bg-indigo-500 rounded-full px-4 py-2 border border-indigo-400/50 transition font-medium"
          >
            حساب جديد
          </Link>
        </>
      )}
    </nav>
  );
}
