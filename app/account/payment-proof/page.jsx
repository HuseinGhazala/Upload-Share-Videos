'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers/AuthProvider';
import AppNavbar from '@/app/components/AppNavbar';
import { UPLOAD_PACKAGES, planLabelAr } from '@/app/lib/plans';
import { getAttributionFromLocation, trackFunnelEvent } from '@/app/lib/analytics/funnel';

const OPTIONS = UPLOAD_PACKAGES.map((p) => ({ key: p.key, label: `${p.title} — ${p.priceSar} ر.س` }));

export default function PaymentProofPage() {
  const { user, loading } = useAuth();
  const [planKey, setPlanKey] = useState(OPTIONS[0]?.key ?? 'single');
  const [userNote, setUserNote] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const prefPlan = params.get('plan');
    if (prefPlan && OPTIONS.some((o) => o.key === prefPlan)) {
      setPlanKey(prefPlan);
    }
    trackFunnelEvent('start_payment_proof', {
      ...getAttributionFromLocation(),
      plan: prefPlan || '',
    });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!file) {
      setError('يرجى اختيار ملف الإيصال (PDF أو صورة).');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set('planKey', planKey);
      fd.set('file', file);
      if (userNote.trim()) fd.set('userNote', userNote.trim());
      const res = await fetch('/api/payment-receipt', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `خطأ ${res.status}`);
      }
      trackFunnelEvent('submit_payment_proof', {
        plan: planKey,
        hasNote: Boolean(userNote.trim()),
        ...getAttributionFromLocation(),
      });
      setMessage(data.message || 'تم استلام طلبك بنجاح.');
      setFile(null);
      setUserNote('');
      if (e.target?.reset) e.target.reset();
    } catch (err) {
      setError(err.message || 'تعذّر إرسال الطلب. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !user) {
    return (
      <main className="min-h-screen text-white">
        <div className="section-wrap max-w-3xl py-10 sm:py-14 text-center space-y-4">
          <AppNavbar />
          <p className="text-white/60">يلزم تسجيل الدخول لإرسال إيصال الدفع.</p>
          <Link href="/login" className="inline-block text-indigo-400 hover:text-indigo-300">
            تسجيل الدخول →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white">
      <div className="section-wrap max-w-3xl py-10 sm:py-14">
        <AppNavbar />
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel p-8 sm:p-10"
        >
          <h1 className="text-2xl font-bold mb-2">تأكيد الدفع</h1>
          <p className="text-sm text-white/55 mb-8 leading-relaxed">
            بعد إتمام التحويل، أرفق صورة الإيصال أو ملف PDF. سيُحال الطلب إلى فريقنا للمراجعة، ويُفعَّل
            حسابك فور الموافقة.
          </p>
          <div className="mb-7 grid gap-2 sm:grid-cols-3 text-xs">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="font-semibold text-emerald-200">١. حدّد الباقة</p>
              <p className="text-emerald-100/80 mt-1">اختر الباقة التي قمت بدفع قيمتها.</p>
            </div>
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3">
              <p className="font-semibold text-indigo-200">٢. أرفق الإيصال</p>
              <p className="text-indigo-100/80 mt-1">صورة واضحة أو PDF بحجم لا يتجاوز ٥ ميجابايت.</p>
            </div>
            <div className="rounded-lg border border-white/20 bg-white/5 p-3">
              <p className="font-semibold text-white/90">٣. التفعيل</p>
              <p className="text-white/60 mt-1">نراجع الطلب ونفعّل الباقة خلال ساعات العمل.</p>
            </div>
          </div>

          {loading ? (
            <p className="text-white/50">جاري التحميل…</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-white/70 mb-1">الباقة المدفوعة</label>
                <select
                  value={planKey}
                  onChange={(e) => setPlanKey(e.target.value)}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-emerald-500"
                >
                  {OPTIONS.map((o) => (
                    <option key={o.key} value={o.key} className="bg-[#0a0a12] text-white">
                      {o.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-white/40 mt-1">المختار: {planLabelAr(planKey)}</p>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">ملف الإيصال</label>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp,image/gif"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-white/80 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white"
                />
                <p className="text-xs text-white/40 mt-1">PDF أو صورة — بحد أقصى ٥ ميجابايت</p>
                <p className="text-xs text-white/35 mt-1">نصيحة: الإيصال الواضح يُسرّع عملية المراجعة.</p>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">ملاحظات إضافية (اختياري)</label>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-emerald-500 text-sm placeholder:text-white/30"
                  placeholder="مثال: رقم العملية، تاريخ التحويل، أو أي تفاصيل تساعدنا…"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {message && (
                <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-3 py-2">
                  {message}
                </p>
              )}
              {message && (
                <p className="text-xs text-white/60 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  ما الخطوة التالية؟ يمكنك متابعة حالة طلبك من صفحة الحساب، وسيُفعَّل اشتراكك فور إتمام المراجعة.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full disabled:opacity-50"
              >
                {submitting ? 'جاري الإرسال…' : 'إرسال الطلب'}
              </button>
            </form>
          )}

          <p className="mt-8 text-center">
            <Link href="/account" className="text-sm text-indigo-300 hover:text-indigo-200">
              ← العودة إلى حسابي
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
