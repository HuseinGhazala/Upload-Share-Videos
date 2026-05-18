import Link from 'next/link';
import AdminNav from '../AdminNav';
import PaymentQueue from './PaymentQueue';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'طلبات تأكيد الدفع — لوحة الإدارة',
  robots: { index: false, follow: false },
};

export default function AdminPaymentsPage() {
  return (
    <main className="min-h-screen bg-[#050810] text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <p className="text-center mb-4">
          <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 text-sm">
            ← العودة إلى صفحة الأسعار
          </Link>
        </p>

        <h1 className="text-2xl font-bold text-center mb-2">طلبات تأكيد الدفع</h1>
        <p className="text-white/50 text-sm text-center mb-8 leading-relaxed">
          طلبات العملاء الذين أرسلوا إيصالاً من صفحة «تأكيد الدفع». الموافقة على الطلب تُفعِّل الباقة تلقائياً
          في حساب العميل.
        </p>

        <AdminNav current="payments" />

        <PaymentQueue />

        <p className="mt-10 text-xs text-white/35 text-center leading-relaxed">
          تأكد من تشغيل ترحيلات قاعدة البيانات وإنشاء حاوية التخزين{' '}
          <code className="text-white/50">payment-receipts</code> في Supabase عند الحاجة.
        </p>
      </div>
    </main>
  );
}
