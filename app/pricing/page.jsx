import Link from 'next/link';
import AppNavbar from '@/app/components/AppNavbar';
import { UPLOAD_PACKAGES } from '@/app/lib/plans';

export const metadata = {
  title: 'الباقات والأسعار بالريال السعودي',
  description: 'باقات رفع فيديو بأسعار بالريال السعودي ضمن منصّة محلية.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center">
          <AppNavbar />
        </div>
        <h1 className="text-3xl font-extrabold text-center mt-4 mb-2 bg-gradient-to-br from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
          باقات الرفع
        </h1>
        <p className="text-center text-white/50 text-sm mb-10 max-w-2xl mx-auto leading-relaxed">
          أسعار بالريال السعودي — لا باقة مجانية. بعد إتمام الدفع يتم تفعيل الرصيد على حسابك (يمكن أتمتة ذلك
          لاحقاً عبر بوابة دفع محلية).
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          {UPLOAD_PACKAGES.map((pkg) => (
            <div
              key={pkg.key}
              className={`rounded-3xl border p-8 flex flex-col ${
                pkg.key === 'triple'
                  ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <h2 className="text-xl font-bold">{pkg.title}</h2>
              <p className="text-3xl font-extrabold mt-4 text-white">
                {pkg.priceSar}{' '}
                <span className="text-lg font-semibold text-white/60">ريال سعودي</span>
              </p>
              <p className="mt-4 text-sm text-white/65 leading-relaxed flex-1">{pkg.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>
                  ✓{' '}
                  {pkg.credits == null
                    ? 'رفع بعدد غير محدود من الفيديوهات'
                    : `حتى ${pkg.credits} فيديو للرفع`}
                </li>
                <li>✓ حتى 50 ميجابايت لكل فيديو</li>
              </ul>
              <Link
                href="/signup"
                className={`mt-8 block text-center rounded-xl py-3 text-sm font-semibold transition ${
                  pkg.key === 'triple'
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'border border-white/20 hover:bg-white/5 text-white/90'
                }`}
              >
                سجّل ثم ادفع
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-sm text-white/60 leading-relaxed max-w-3xl mx-auto text-center">
          <p className="font-medium text-white/90 mb-3">تفعيل الباقة بعد الدفع</p>
          <p className="mb-4">
            بعد التحويل، يمكنك رفع إيصال الدفع (PDF أو صورة) من صفحة{' '}
            <Link href="/account/payment-proof" className="text-emerald-300 hover:text-emerald-200 font-medium">
              تأكيد الدفع بإيصال
            </Link>{' '}
            — يصل الطلب للإدارة للمراجعة. أو يفعّل الفريق الباقة يدوياً من لوحة التفعيل.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/admin/login?next=/admin/subscribers"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-6 py-3 text-sm font-semibold text-white transition"
            >
              المشتركون والباقات
            </Link>
            <Link
              href="/admin/login?next=/admin/billing"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition"
            >
              تفعيل باقة بعد الدفع
            </Link>
            <Link
              href="/admin/login?next=/admin/payments"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600/90 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition"
            >
              طلبات إيصال الدفع
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/40">
            بعد إدخال رمز لوحة الإدارة (اضبط <code dir="ltr">ADMIN_PANEL_PIN</code>؛ الافتراضي محلي{' '}
            <code dir="ltr">123456</code>).
          </p>
        </div>
      </div>
    </main>
  );
}
