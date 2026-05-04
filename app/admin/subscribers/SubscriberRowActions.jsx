'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLAN_KEYS } from '@/app/lib/plans';

const ACTIVATE_OPTIONS = [
  { value: PLAN_KEYS.SINGLE, label: 'فيديو واحد' },
  { value: PLAN_KEYS.TRIPLE, label: '٣ فيديوهات' },
  { value: PLAN_KEYS.UNLIMITED, label: 'غير محدود' },
];

export default function SubscriberRowActions({ userId, hasActivePlan }) {
  const router = useRouter();
  const [planKey, setPlanKey] = useState(PLAN_KEYS.SINGLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (action) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          action === 'activate' ? { userId, action: 'activate', planKey } : { userId, action: 'cancel' }
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `خطأ ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e.message || 'فشل الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 min-w-[200px]">
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <select
          value={planKey}
          onChange={(e) => setPlanKey(e.target.value)}
          disabled={loading}
          className="rounded-lg bg-white/10 border border-white/20 px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500 max-w-[9rem]"
        >
          {ACTIVATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#0a0a12] text-white">
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={loading}
          onClick={() => run('activate')}
          className="rounded-lg bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-50 px-2.5 py-1.5 text-xs font-medium transition"
        >
          تفعيل
        </button>
        <button
          type="button"
          disabled={loading || !hasActivePlan}
          onClick={() => run('cancel')}
          title={!hasActivePlan ? 'لا يوجد اشتراك/Bاقة نشطة' : undefined}
          className="rounded-lg border border-red-500/50 bg-red-500/15 hover:bg-red-500/25 disabled:opacity-40 px-2.5 py-1.5 text-xs text-red-200 transition"
        >
          إلغاء
        </button>
      </div>
      {error && <p className="text-[11px] text-red-400 leading-snug text-right">{error}</p>}
    </div>
  );
}
