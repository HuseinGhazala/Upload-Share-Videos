'use client';

import { useEffect } from 'react';

const RELOAD_AT_KEY = '__chunk_reload_at';
const RELOAD_WINDOW_MS = 45_000;

function shouldRecoverFromChunkFailure(message, reasonStr) {
  const m = (message || '') + (reasonStr || '');
  return (
    m.includes('ChunkLoadError') ||
    m.includes('Loading chunk') ||
    m.includes('Failed to fetch dynamically imported module')
  );
}

/**
 * بعد نشر نسخة جديدة قد يبقى HTML قديماً يشير لملفات JS حُذفت → ChunkLoadError.
 * إعادة تحميل كاملة مرة واحدة تجلب HTML جديداً غالباً.
 */
export default function ChunkLoadRecovery() {
  useEffect(() => {
    const tryReloadOnce = () => {
      if (typeof window === 'undefined') return;
      const now = Date.now();
      const last = Number(sessionStorage.getItem(RELOAD_AT_KEY) || 0);
      if (last && now - last < RELOAD_WINDOW_MS) return;
      sessionStorage.setItem(RELOAD_AT_KEY, String(now));
      window.location.reload();
    };

    const onError = (event) => {
      const msg = event?.message || '';
      if (shouldRecoverFromChunkFailure(msg, '')) tryReloadOnce();
    };

    const onRejection = (event) => {
      const r = event?.reason;
      const msg = typeof r?.message === 'string' ? r.message : String(r || '');
      if (shouldRecoverFromChunkFailure(msg, '')) tryReloadOnce();
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      sessionStorage.removeItem(RELOAD_AT_KEY);
    }, RELOAD_WINDOW_MS + 2000);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
