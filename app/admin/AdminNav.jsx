'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminNav({ current }) {
  const router = useRouter();
  const base =
    'rounded-xl px-4 py-2 text-sm font-medium border transition ';
  const active = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200';
  const idle = 'border-white/15 text-white/70 hover:bg-white/5 hover:text-white';

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap justify-center items-center gap-2 mb-8" dir="rtl">
      <Link href="/admin" className={base + (current === 'home' ? active : idle)}>
        الرئيسية
      </Link>
      <Link
        href="/admin/subscribers"
        className={base + (current === 'subscribers' ? active : idle)}
      >
        المشتركون
      </Link>
      <Link href="/admin/billing" className={base + (current === 'billing' ? active : idle)}>
        تفعيل الباقات
      </Link>
      <Link href="/admin/payments" className={base + (current === 'payments' ? active : idle)}>
        طلبات الدفع
      </Link>
      <button
        type="button"
        onClick={logout}
        className={`${base}${idle}`}
      >
        تسجيل الخروج
      </button>
    </nav>
  );
}
