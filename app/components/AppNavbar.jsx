'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FREE_PUBLIC_MODE } from '@/app/lib/plans';
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
      return `rounded-2xl px-5 py-2 text-sm font-bold border transition-colors ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
      }`;
    }
    return `rounded-2xl px-5 py-2 text-sm font-bold border transition-colors ${
      active
        ? 'bg-surface border-outline-variant/50 text-primary shadow-sm'
        : 'bg-transparent border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface/50'
    }`;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`sticky top-4 z-40 mb-10 rounded-3xl border px-3 py-3 transition-all ${
        scrolled ? 'bg-background/80 border-outline-variant/40 shadow-sm backdrop-blur-xl' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <Link href="/" className={itemClass('/')}>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            الرئيسية
          </span>
        </Link>
        {FREE_PUBLIC_MODE ? (
          <span className="rounded-2xl px-5 py-2 text-sm font-bold border bg-primary/10 border-primary/20 text-primary">
            ✨ مجاني للجميع
          </span>
        ) : (
          <>
            <Link href="/pricing" className={itemClass('/pricing', true)}>
              الأسعار والباقات
            </Link>
            {loading ? (
              <span className="text-on-surface-variant px-4 py-2 text-sm font-bold flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </span>
            ) : user ? (
              <>
                <Link href="/account" className={itemClass('/account')}>
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    حسابي
                    {quota?.planKey === 'unlimited'
                      ? ' · غير محدود'
                      : typeof quota?.creditsRemaining === 'number'
                        ? ` · ${quota.creditsRemaining}`
                        : ''}
                  </span>
                </Link>
                <button type="button" onClick={() => signOut()} className="bg-surface hover:bg-surface-hover text-error border border-outline-variant/30 rounded-2xl px-5 py-2 font-bold text-sm transition-colors flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  تسجيل الخروج
                </button>
                {!hasActivePlan ? (
                  <Link href="/pricing?from=navbar_no_plan" className="bg-primary hover:bg-primary-hover text-white rounded-2xl px-5 py-2 font-bold text-sm transition-colors flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    اشترك الآن
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <Link href="/login" className={itemClass('/login')}>
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    تسجيل الدخول
                  </span>
                </Link>
                <Link href="/signup" className="bg-primary hover:bg-primary-hover text-white rounded-2xl px-5 py-2 font-bold text-sm transition-colors shadow-sm flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  إنشاء حساب
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </motion.nav>
  );
}
