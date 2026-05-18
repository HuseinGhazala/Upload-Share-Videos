import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionCookieValue } from '@/app/lib/adminSession';
import AdminNav from './AdminNav';

export const metadata = {
  title: 'لوحة الإدارة — الرئيسية',
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const cookie = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!cookie || !(await verifyAdminSessionCookieValue(cookie))) {
    redirect('/admin/login');
  }

  return (
    <main className="min-h-screen bg-[#050810] text-white px-4 py-12">
      <div className="max-w-lg mx-auto text-center">
        <p className="mb-4">
          <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 text-sm">
            ← العودة إلى صفحة الأسعار
          </Link>
        </p>
        <h1 className="text-2xl font-bold mb-2">لوحة الإدارة</h1>
        <p className="text-white/50 text-sm mb-10 leading-relaxed">اختر القسم الذي تريد إدارته من القوائم أدناه.</p>
        <AdminNav current="home" />
        <div className="grid gap-4 text-right">
          <Link
            href="/admin/subscribers"
            className="block rounded-2xl border border-white/12 bg-white/5 hover:bg-white/10 px-6 py-5 transition"
          >
            <span className="font-semibold text-emerald-200">المشتركون والباقات</span>
            <span className="block text-sm text-white/45 mt-1">عرض المستخدمين ومتابعة حالة كل باقة.</span>
          </Link>
          <Link
            href="/admin/billing"
            className="block rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 px-6 py-5 transition"
          >
            <span className="font-semibold text-white">تفعيل الباقات بعد الدفع</span>
            <span className="block text-sm text-white/45 mt-1">تفعيل يدوي للحسابات بعد التأكد من التحويل.</span>
          </Link>
          <Link
            href="/admin/payments"
            className="block rounded-2xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15 px-6 py-5 transition"
          >
            <span className="font-semibold text-indigo-200">طلبات إيصالات الدفع</span>
            <span className="block text-sm text-white/45 mt-1">مراجعة الإيصالات (PDF أو صورة) والقبول أو الرفض.</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
