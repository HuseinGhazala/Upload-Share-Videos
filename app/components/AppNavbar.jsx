'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthProvider';

export default function AppNavbar() {
  const { user, loading, quota, signOut } = useAuth();
  const hasActivePlan = Boolean(quota?.uploadAllowed);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function itemClass(href, accent = false) {
    const active = pathname === href;
    if (accent) {
      return `rounded-full px-4 py-2 text-sm font-medium border transition ${
        active
          ? 'bg-emerald-500/25 border-emerald-300/60 text-white'
          : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-200 hover:bg-emerald-500/20'
      }`;
    }
    return `rounded-full px-4 py-2 text-sm border transition ${
      active
        ? 'bg-white/15 border-white/35 text-white'
        : 'bg-white/5 border-white/15 text-white/80 hover:text-white hover:bg-white/10'
    }`;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`sticky top-4 z-40 mb-10 rounded-full border px-3 py-2 backdrop-blur-xl ${
        scrolled ? 'bg-[#0c1530]/75 border-white/20 shadow-2xl' : 'bg-[#0c1530]/45 border-white/10'
      }`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <Link href="/" className={itemClass('/')}>
          الرئيسية
        </Link>
        <Link href="/pricing" className={itemClass('/pricing', true)}>
          الباقات والأسعار
        </Link>
        <Link href="/admin/login" title="لوحة الإدارة (رمز الدخول)" className={itemClass('/admin/login')}>
          لوحة الإدارة
        </Link>
        {loading ? (
          <span className="text-white/40 px-4 py-2 text-sm">…</span>
        ) : user ? (
          <>
            <Link href="/account" className={itemClass('/account')}>
              حسابي
              {quota?.planKey === 'unlimited'
                ? ' · غير محدود'
                : typeof quota?.creditsRemaining === 'number'
                  ? ` · ${quota.creditsRemaining}`
                  : ''}
            </Link>
            <button type="button" onClick={() => signOut()} className="btn-secondary px-4 py-2">
              خروج
            </button>
            {!hasActivePlan ? (
              <Link href="/pricing?from=navbar_no_plan" className="btn-primary px-4 py-2">
                ابدأ باقتك
              </Link>
            ) : null}
          </>
        ) : (
          <>
            <Link href="/login" className={itemClass('/login')}>
              تسجيل الدخول
            </Link>
            <Link href="/signup" className="btn-primary px-4 py-2">
              حساب جديد
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}
