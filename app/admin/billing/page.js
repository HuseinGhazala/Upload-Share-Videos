import Link from 'next/link';
import BillingActivationForm from './BillingActivationForm';
import AdminNav from '../AdminNav';

export const metadata = {
  title: 'تفعيل الباقات بعد الدفع — لوحة الإدارة',
  robots: { index: false, follow: false },
};

export default function AdminBillingPage() {
  return (
    <main className="min-h-screen bg-[#050810] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <p className="text-center mb-4">
          <Link href="/pricing" className="text-emerald-400 hover:text-emerald-300 text-sm">
            ← العودة إلى صفحة الأسعار
          </Link>
        </p>

        <AdminNav current="billing" />

        <h1 className="text-2xl font-bold text-center mb-2">تفعيل الباقات بعد الدفع</h1>
        <p className="text-white/55 text-sm text-center mb-10 leading-relaxed">
          أداة لتفعيل الباقات يدوياً بعد التأكد من إتمام الدفع (تحويل بنكي ونحوه). يتطلب ضبط
          متغيّرَي{' '}
          <code className="text-emerald-300/90 text-xs">SUPABASE_SERVICE_ROLE_KEY</code> و{' '}
          <code className="text-emerald-300/90 text-xs">BILLING_ADMIN_SECRET</code> في{' '}
          <code className="text-white/70 text-xs">.env.local</code> على الخادم.
        </p>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-xl">
          <BillingActivationForm />
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/50 leading-relaxed space-y-3">
          <p>
            <strong className="text-white/75">للحصول على معرّف المستخدم:</strong> افتح Supabase → Authentication → Users،
            ثم انسخ{' '}
            <span dir="ltr" className="font-mono text-xs">
              User UID
            </span>
            .
          </p>
          <p>
            <strong className="text-white/75">بديل لهذه الصفحة:</strong> يمكنك تعديل صف المستخدم مباشرة في جدول{' '}
            <code className="text-indigo-300">profiles</code> عبر الحقلَين{' '}
            <code className="text-indigo-300">plan_key</code> و{' '}
            <code className="text-indigo-300">upload_credits_remaining</code>.
          </p>
        </div>
      </div>
    </main>
  );
}
