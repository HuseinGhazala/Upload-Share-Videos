'use client';

import { useState } from 'react';

const PLANS = [
  { value: 'single', label: 'فيديو واحد — ١٠ ر.س (رصيد فيديو واحد)' },
  { value: 'triple', label: 'ثلاثة فيديوهات — ٢٥ ر.س (رصيد ٣ فيديوهات)' },
  { value: 'unlimited', label: 'باقة غير محدودة — ٥٠ ر.س' },
];

export default function BillingActivationForm() {
  const [userId, setUserId] = useState('');
  const [planKey, setPlanKey] = useState('single');
  const [adminSecret, setAdminSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/billing/activate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-billing-secret': adminSecret.trim(),
        },
        body: JSON.stringify({
          userId: userId.trim(),
          planKey,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `خطأ ${res.status}`);
      }
      setMessage('تم تفعيل الباقة بنجاح. ينبغي للمستخدم تحديث صفحة «حسابي» أو إعادة تسجيل الدخول لرؤية التحديث.');
      setAdminSecret('');
    } catch (err) {
      setError(err.message || 'تعذّر تنفيذ الطلب.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm text-white/70 mb-1">معرّف المستخدم (UUID)</label>
        <input
          type="text"
          required
          dir="ltr"
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-emerald-500 font-mono text-sm"
          placeholder="انسخه من Supabase → Authentication → Users"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-1">الباقة المراد تفعيلها</label>
        <select
          value={planKey}
          onChange={(e) => setPlanKey(e.target.value)}
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-emerald-500"
        >
          {PLANS.map((p) => (
            <option key={p.value} value={p.value} className="bg-[#0a0a12] text-white">
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-white/70 mb-1">رمز التفعيل (نفس قيمة BILLING_ADMIN_SECRET)</label>
        <input
          type="password"
          required
          dir="ltr"
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white outline-none focus:border-emerald-500 font-mono text-sm"
          placeholder="لا يُخزَّن — يُرسل مع الطلب فقط"
          value={adminSecret}
          onChange={(e) => setAdminSecret(e.target.value)}
          autoComplete="off"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-lg px-3 py-2">{error}</p>
      )}
      {message && (
        <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-semibold transition"
      >
        {loading ? 'جاري تفعيل الباقة…' : 'تفعيل الباقة الآن'}
      </button>
    </form>
  );
}
