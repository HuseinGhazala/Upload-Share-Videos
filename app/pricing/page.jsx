'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppNavbar from '@/app/components/AppNavbar';
import { UPLOAD_PACKAGES } from '@/app/lib/plans';
import { getAttributionFromLocation, trackFunnelEvent } from '@/app/lib/analytics/funnel';
import { motion } from 'framer-motion';
import { CinematicSection } from '@/app/components/ui/CinematicSection';

export default function PricingPage() {
  const [experimentVariant, setExperimentVariant] = useState('price_first');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get('v');
    if (forced === 'price_first' || forced === 'value_first') {
      setExperimentVariant(forced);
      return;
    }
    setExperimentVariant(Math.random() < 0.5 ? 'price_first' : 'value_first');
  }, []);

  useEffect(() => {
    trackFunnelEvent('view_pricing', {
      source: 'pricing_page',
      variant: experimentVariant,
      ...getAttributionFromLocation(),
    });
  }, [experimentVariant]);

  const highlightedKey = experimentVariant === 'value_first' ? 'unlimited' : 'triple';

  return (
    <main className="min-h-screen text-white">
      <div className="section-wrap py-10 sm:py-14">
        <AppNavbar />

        <CinematicSection className="text-center mb-10">
          <h1 className="headline-display bg-gradient-to-b from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            باقات مرنة\nبسعر واضح
          </h1>
          <p className="mt-4 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            اختر الباقة المناسبة لمرحلتك الحالية. رحلة شراء مبسطة مع تفعيل سريع بعد رفع إيصال الدفع.
          </p>
        </CinematicSection>

        <CinematicSection className="mb-8 grid gap-3 sm:grid-cols-3 text-sm" delay={0.08}>
          <div className="glass-panel p-4 rounded-xl border">
            <p className="font-semibold text-emerald-200">تفعيل سريع</p>
            <p className="mt-1 text-emerald-100/75">مراجعة الإيصال وتفعيل الباقة خلال نفس اليوم غالباً.</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border">
            <p className="font-semibold text-indigo-100">سعر واضح بدون مفاجآت</p>
            <p className="mt-1 text-white/65">كل باقة بسعر ثابت وحد رفع واضح.</p>
          </div>
          <div className="glass-panel p-4 rounded-xl border">
            <p className="font-semibold text-white">دعم عربي</p>
            <p className="mt-1 text-white/60">إرشاد واضح من التسجيل حتى التفعيل.</p>
          </div>
        </CinematicSection>

        <CinematicSection className="grid sm:grid-cols-3 gap-6" delay={0.12}>
          {UPLOAD_PACKAGES.map((pkg) => (
            <motion.div
              key={pkg.key}
              whileHover={{ y: -5, scale: 1.01 }}
              className={`rounded-3xl border p-8 flex flex-col ${
                pkg.key === highlightedKey
                  ? 'glass-panel border-indigo-400/45 bg-indigo-500/15'
                  : 'glass-panel'
              }`}
            >
              {pkg.key === highlightedKey ? (
                <p className="mb-3 inline-flex w-fit rounded-full bg-indigo-500/20 border border-indigo-400/40 px-3 py-1 text-xs font-semibold text-indigo-200">
                  الأكثر اختياراً
                </p>
              ) : null}
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
                <li>✓ تفعيل يدوي سريع بعد رفع الإيصال</li>
              </ul>
              <div className="mt-8 grid gap-2">
                <Link
                  href={`/signup?from=pricing&plan=${pkg.key}&v=${experimentVariant}`}
                  onClick={() =>
                    trackFunnelEvent('select_package', {
                      plan: pkg.key,
                      variant: experimentVariant,
                      ...getAttributionFromLocation(),
                    })
                  }
                  className={`block text-center rounded-xl py-3 text-sm font-semibold transition ${
                    pkg.key === highlightedKey
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'border border-white/20 hover:bg-white/5 text-white/90'
                  }`}
                >
                  ابدأ الآن
                </Link>
                <Link
                  href={`/login?from=pricing&plan=${pkg.key}&v=${experimentVariant}`}
                  className="block text-center rounded-xl py-2 text-xs font-medium border border-white/15 text-white/70 hover:bg-white/5 transition"
                >
                  لدي حساب بالفعل
                </Link>
              </div>
            </motion.div>
          ))}
        </CinematicSection>

        <CinematicSection className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5" delay={0.1}>
          <h3 className="text-lg font-semibold mb-3">مقارنة سريعة</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-white/10 p-3 bg-[#0f1320]">
              <p className="text-white/80 font-medium">فيديو واحد</p>
              <p className="text-white/55 mt-1">للجربة أو فيديو تسويقي منفرد.</p>
            </div>
            <div className="rounded-xl border border-white/10 p-3 bg-[#0f1320]">
              <p className="text-white/80 font-medium">3 فيديوهات</p>
              <p className="text-white/55 mt-1">لإطلاق حملة أو سلسلة محتوى قصيرة.</p>
            </div>
            <div className="rounded-xl border border-white/10 p-3 bg-[#0f1320]">
              <p className="text-white/80 font-medium">غير محدود</p>
              <p className="text-white/55 mt-1">للاستخدام المستمر للفرق والمبدعين.</p>
            </div>
          </div>
        </CinematicSection>

        <CinematicSection className="mt-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-sm text-white/60 leading-relaxed max-w-3xl mx-auto text-center" delay={0.12}>
          <p className="font-medium text-white/90 mb-3">تفعيل الباقة بعد الدفع</p>
          <p className="mb-4">
            الخطوات: 1) حوّل قيمة الباقة 2) ارفع الإيصال من صفحة{' '}
            <Link href="/account/payment-proof?from=pricing" className="text-emerald-300 hover:text-emerald-200 font-medium">
              تأكيد الدفع بإيصال
            </Link>{' '}
            3) نراجع الطلب ونفعّل حسابك.
          </p>
          <p className="mb-4 text-white/80">تعهد خدمة: إتمام المراجعة خلال ساعات العمل في نفس اليوم غالباً.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/signup?from=pricing_footer"
              onClick={() => trackFunnelEvent('start_signup', { source: 'pricing_footer', variant: experimentVariant })}
                className={`mt-8 block text-center rounded-xl py-3 text-sm font-semibold transition ${
                'bg-indigo-600 hover:bg-indigo-500 text-white px-6'
              }`}
              >
              إنشاء حساب والبدء
            </Link>
            <Link
              href="/account/payment-proof?from=pricing_footer"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition"
            >
              رفـع إيصال الدفع
            </Link>
            <Link
              href="/admin/login?next=/admin/payments"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-6 py-3 text-sm font-semibold text-white transition"
            >
              متابعة حالة الطلب
            </Link>
          </div>
        </CinematicSection>

        <div className="mt-6 text-center text-xs text-white/45">
          نسخة الاختبار الحالية: <span className="font-semibold text-white/65">{experimentVariant}</span>
        </div>
      </div>
    </main>
  );
}
