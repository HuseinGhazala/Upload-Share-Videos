'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildShareUrl } from '@/app/lib/shareLinks';

function formatExpiry(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function WatchClient({ id, accessToken }) {
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const streamSrc = useMemo(() => {
    if (!meta?.streamUrl) return '';
    const token = accessToken ? `?accessToken=${encodeURIComponent(accessToken)}` : '';
    return `${meta.streamUrl}${token}`;
  }, [meta?.streamUrl, accessToken]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const query = accessToken ? `?accessToken=${encodeURIComponent(accessToken)}` : '';
        const res = await fetch(`/api/videos/${id}/meta${query}`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'تعذّر تحميل المحتوى.');
        }
        if (!cancelled) setMeta(data.item);
      } catch (e) {
        if (!cancelled) setError(e.message || 'حدث خطأ.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id, accessToken]);

  useEffect(() => {
    if (!meta?.id) return;
    const query = accessToken ? `?accessToken=${encodeURIComponent(accessToken)}` : '';
    fetch(`/api/videos/${meta.id}/view${query}`, { method: 'POST', credentials: 'include' }).catch(() => {});
  }, [meta?.id, accessToken]);

  const shareUrl = useMemo(() => {
    if (!meta?.id || !accessToken) return '';
    const origin = window.location.origin.replace('0.0.0.0', 'localhost');
    return buildShareUrl(meta.id, accessToken, origin);
  }, [meta?.id, accessToken]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0b0f1a] text-white/70">
        جاري التحميل…
      </main>
    );
  }

  if (error || !meta) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0b0f1a] px-6 text-center">
        <div>
          <p className="text-red-300 text-lg mb-2">تعذّر عرض المحتوى</p>
          <p className="text-white/50 text-sm">{error || 'الرابط غير صالح أو منتهي.'}</p>
        </div>
      </main>
    );
  }

  const isImage = meta.mediaKind === 'image';

  return (
    <main className="min-h-screen bg-[#0b0f1a] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-6 text-center">
          <p className="text-xs text-white/40 mb-2">مشاهدة مشتركة</p>
          <h1 className="text-lg font-semibold truncate">{meta.name}</h1>
          {meta.expiresAt && (
            <p className="text-xs text-amber-200/80 mt-2">ينتهي الرابط: {formatExpiry(meta.expiresAt)}</p>
          )}
        </header>

        <div className={`mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black ${isImage ? 'max-w-xl' : 'w-full'}`}>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={streamSrc} alt={meta.name} className="w-full h-auto object-contain" />
          ) : (
            <video src={streamSrc} controls autoPlay className="w-full aspect-video object-contain" playsInline />
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          {shareUrl && (
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="px-4 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 transition"
            >
              نسخ رابط المشاركة
            </button>
          )}
          <a
            href={streamSrc}
            download={meta.name}
            className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition"
          >
            تحميل
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-white/30">
          👁 {new Intl.NumberFormat('ar-SA').format(meta.views || 0)} مشاهدة
        </p>
      </div>
    </main>
  );
}
