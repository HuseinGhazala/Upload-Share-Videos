'use client';

import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { buildShareUrl } from '@/app/lib/shareLinks';

export default function ShareTools({ item, onCopy, compact = false }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showQr, setShowQr] = useState(false);

  const shareUrl = useMemo(() => {
    if (!item?.id || !item?.accessToken) return '';
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin.replace('0.0.0.0', 'localhost')
        : '';
    return buildShareUrl(item.id, item.accessToken, origin);
  }, [item?.id, item?.accessToken]);

  useEffect(() => {
    if (!showQr || !shareUrl) return;
    let cancelled = false;
    QRCode.toDataURL(shareUrl, { width: 200, margin: 1, color: { dark: '#1e1b4b', light: '#ffffff' } })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [showQr, shareUrl]);

  if (!item?.accessToken) return null;

  return (
    <div className={`${compact ? 'mt-2' : 'mt-3'} space-y-2`}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCopy?.(shareUrl)}
          className="flex-1 min-w-[120px] text-xs px-3 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 border border-indigo-500/30 transition"
        >
          نسخ رابط المشاركة
        </button>
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          className="text-xs px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/20 transition"
        >
          {showQr ? 'إخفاء QR' : 'QR Code'}
        </button>
        <a
          href={`${item.url}?accessToken=${encodeURIComponent(item.accessToken)}`}
          download={item.name}
          className="text-xs px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/20 transition"
        >
          تحميل
        </a>
      </div>
      {item.expiresAt && (
        <p className="text-[11px] text-amber-200/80">
          ينتهي الرابط:{' '}
          {new Date(item.expiresAt).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
      )}
      {showQr && qrDataUrl && (
        <div className="inline-block rounded-xl border border-white/15 bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR للمشاركة" width={200} height={200} className="rounded-lg" />
        </div>
      )}
    </div>
  );
}
