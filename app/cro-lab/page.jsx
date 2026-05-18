import Link from 'next/link';
import AppNavbar from '@/app/components/AppNavbar';

export const metadata = {
  title: 'مختبر تحسين التحويلات (CRO Lab)',
  description: 'خطة اختبارات A/B ومؤشرات التحويل المتابَعة أسبوعياً.',
};

const tests = [
  {
    week: 'الأسبوع الأول',
    name: 'زر الحث على الإجراء في القسم الرئيسي',
    goal: 'زيادة الانتقال من الصفحة الرئيسية إلى صفحة الأسعار.',
    metric: 'view_pricing / visits_home',
  },
  {
    week: 'الأسبوع الثاني',
    name: 'صياغة عرض الأسعار',
    goal: 'زيادة معدّل اختيار الباقة وبدء التسجيل.',
    metric: 'select_package, start_signup',
  },
  {
    week: 'الأسبوع الثالث',
    name: 'تجربة إرسال إيصال الدفع',
    goal: 'تحسين نسبة إكمال إرسال الإيصال.',
    metric: 'submit_payment_proof / start_payment_proof',
  },
];

export default function CroLabPage() {
  return (
    <main className="min-h-screen bg-[#0a0a12] text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <AppNavbar />
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2">مختبر تحسين التحويلات</h1>
          <p className="text-sm text-white/60 mb-6">
            مساحة لإطلاق تجارب التحويل على مدى ثلاثة أسابيع. استخدم الروابط أدناه لمعاينة كل نسخة من
            الصفحة (التركيز على السعر أو على القيمة).
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            <Link
              href="/pricing?v=price_first&campaign=ab_week_2"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 transition"
            >
              فتح النسخة المركّزة على السعر
            </Link>
            <Link
              href="/pricing?v=value_first&campaign=ab_week_2"
              className="rounded-xl border border-indigo-400/40 bg-indigo-500/10 px-4 py-3 text-sm hover:bg-indigo-500/20 transition"
            >
              فتح النسخة المركّزة على القيمة
            </Link>
          </div>

          <div className="space-y-3">
            {tests.map((test) => (
              <div key={test.week} className="rounded-xl border border-white/10 bg-[#0f1320] p-4">
                <p className="text-xs text-white/50 mb-1">{test.week}</p>
                <p className="font-semibold">{test.name}</p>
                <p className="text-sm text-white/65 mt-1">{test.goal}</p>
                <p className="text-xs text-emerald-300 mt-2">المؤشر: {test.metric}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
