'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers/AuthProvider';
import AppNavbar from '@/app/components/AppNavbar';
import { UPLOAD_PACKAGES, planLabelAr } from '@/app/lib/plans';

const OPTIONS = UPLOAD_PACKAGES.map((p) => ({ key: p.key, label: `${p.title} — ${p.priceSar} ر.س` }));

export default function PaymentProofPage() {
  const { user, loading } = useAuth();
  const [planKey, setPlanKey] = useState(OPTIONS[0]?.key ?? 'single');
  const [userNote, setUserNote] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!file) {
      setError('اختر ملف الإيصال (PDF أو صورة).');
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
      setMessage(data.message || 'تم الإرسال بنجاح.');
      setFile(null);
      setUserNote('');
      if (e.target?.reset) e.target.reset();
    } catch (err) {
      setError(err.message || 'فشل الإرسال');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !user) {
    return (
      <main className="min-h-screen bg-[#0a0a12] text-white px-4 py-12">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <AppNavbar />
          <p className="text-white/60">سجّل الدخول لإرسال إيصال الدفع.</p>
          <Link href="/login" className="inline-block text-indigo-400 hover:text-indigo-300">
            تسجيل الدخول →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white px-4 py-12">
      <div className="max-w-lg mx-auto">
        <AppNavbar />
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-2">تأكيد الدفع بإيصال</h1>
          <p className="text-sm text-white/55 mb-8 leading-relaxed">
            بعد التحويل، ارفع صورة أو ملف PDF للإيصال. سيظهر الطلب في لوحة الإدارة للمراجعة وتفعيل الباقة عند
            الموافقة.
          </p>

          {loading ? (
            <p className="text-white/50">جاري التحميل…</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-white/70 mb-1">الباقة التي دفعتها</label>
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
                <p className="text-xs text-white/40 mt-1">المعروض: {planLabelAr(planKey)}</p>
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
                <p className="text-xs text-white/40 mt-1">PDF أو صورة — حتى ٥ ميجابايت</p>
              </div>

              <div>
                <label className="block text-sm text-white/70 mb-1">ملاحظة (اختياري)</label>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-emerald-500 text-sm placeholder:text-white/30"
                  placeholder="مثلاً: رقم العملية، تاريخ التحويل…"
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-semibold transition"
              >
                {submitting ? 'جاري الإرسال…' : 'إرسال الإيصال'}
              </button>
            </form>
          )}

          <p className="mt-8 text-center">
            <Link href="/account" className="text-sm text-indigo-400 hover:text-indigo-300">
              ← العودة لحسابي
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
