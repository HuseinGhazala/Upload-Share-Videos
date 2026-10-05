'use client';

import { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { planLabelAr } from '@/app/lib/plans';

function statusLabel(s) {
  if (s === 'pending') return { text: 'قيد المراجعة', className: 'text-amber-200' };
  if (s === 'approved') return { text: 'تمت الموافقة', className: 'text-emerald-300' };
  if (s === 'rejected') return { text: 'تم الرفض', className: 'text-red-300' };
  return { text: s, className: 'text-white/70' };
}

export default function PaymentQueue() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [rejectNote, setRejectNote] = useState({});

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payment-submissions');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `خطأ ${res.status}`);
      setRows(data.submissions ?? []);
    } catch (e) {
      setError(e.message || 'تعذّر تحميل البيانات.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openReceipt = async (id) => {
    const res = await fetch(`/api/admin/payment-submissions/${id}/receipt-url`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) {
      Swal.fire({ title: 'خطأ', text: data.error || 'تعذّر فتح الإيصال.', icon: 'error', confirmButtonText: 'حسناً', confirmButtonColor: '##ff5e1e' });
      return;
    }
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  const review = async (id, decision) => {
    const note = rejectNote[id]?.trim();
    setActionId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payment-submissions/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          ...(decision === 'reject' && note ? { adminNote: note } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `خطأ ${res.status}`);
      await load();
    } catch (e) {
      setError(e.message || 'لم تكتمل العملية، يرجى المحاولة مرة أخرى.');
    } finally {
      setActionId(null);
    }
  };

  if (loading && rows.length === 0) {
    return <p className="text-center text-white/50 py-12">جاري تحميل الطلبات…</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => load()}
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          تحديث القائمة الآن
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-center text-white/45 py-12">لا توجد طلبات تأكيد دفع حتى الآن.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full text-sm text-right min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10 text-white/55">
                <th className="p-3 font-semibold">تاريخ الإرسال</th>
                <th className="p-3 font-semibold">المستخدم</th>
                <th className="p-3 font-semibold">الباقة</th>
                <th className="p-3 font-semibold">الحالة</th>
                <th className="p-3 font-semibold">ملاحظة العميل</th>
                <th className="p-3 font-semibold w-[1%]">الإيصال</th>
                <th className="p-3 font-semibold">القرار</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const st = statusLabel(row.status);
                const busy = actionId === row.id;
                return (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.04]">
                    <td className="p-3 text-white/60 align-top whitespace-nowrap text-xs">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString('ar-SA', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="p-3 align-top">
                      <span className="text-white/90">{row.email ?? '—'}</span>
                      {row.full_name?.trim() && (
                        <span className="block text-xs text-white/45">{row.full_name}</span>
                      )}
                      <code dir="ltr" className="block text-[10px] text-indigo-400/90 mt-1 break-all">
                        {row.user_id}
                      </code>
                    </td>
                    <td className="p-3 text-emerald-200/95 align-top">{planLabelAr(row.plan_key)}</td>
                    <td className={`p-3 align-top ${st.className}`}>{st.text}</td>
                    <td className="p-3 text-white/65 align-top max-w-[200px] text-xs break-words">
                      {row.user_note || '—'}
                      {row.status === 'rejected' && row.admin_note && (
                        <span className="block mt-1 text-red-200/80">ملاحظة الإدارة: {row.admin_note}</span>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <button
                        type="button"
                        onClick={() => openReceipt(row.id)}
                        className="text-xs text-indigo-300 hover:text-indigo-200 underline"
                      >
                        عرض الإيصال {row.file_name ? `(${row.file_name})` : ''}
                      </button>
                    </td>
                    <td className="p-3 align-top">
                      {row.status === 'pending' ? (
                        <div className="flex flex-col gap-2 items-stretch min-w-[140px]">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => review(row.id, 'approve')}
                            className="rounded-lg bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-50 px-2 py-1.5 text-xs font-medium"
                          >
                            {busy ? '…' : 'قبول وتفعيل الباقة'}
                          </button>
                          <input
                            type="text"
                            dir="rtl"
                            placeholder="سبب الرفض (اختياري)"
                            value={rejectNote[row.id] ?? ''}
                            onChange={(e) =>
                              setRejectNote((prev) => ({ ...prev, [row.id]: e.target.value }))
                            }
                            className="rounded-lg bg-white/10 border border-white/15 px-2 py-1 text-xs text-white placeholder:text-white/35"
                          />
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => review(row.id, 'reject')}
                            className="rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 px-2 py-1.5 text-xs text-red-200"
                          >
                            رفض الطلب
                          </button>
                        </div>
                      ) : (
                        <span className="text-white/35 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
