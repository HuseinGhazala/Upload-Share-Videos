'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App segment error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-gutter">
      <div className="max-w-md w-full rounded-2xl border border-error/30 bg-error-container p-space-lg text-center shadow-lg">
        <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-space-md">
          <span className="material-symbols-outlined text-[32px]">warning</span>
        </div>
        <h2 className="font-headline-md text-xl font-bold text-on-error-container">حدث خطأ غير متوقع</h2>
        <p className="font-body-sm text-sm text-on-surface-variant mt-2 mb-space-lg leading-relaxed">عذراً، تعذر عرض هذه الصفحة. قد يكون هناك خلل مؤقت، يمكنك محاولة تحديث الصفحة.</p>
        <button
          onClick={reset}
          className="w-full px-5 py-3 rounded-xl bg-error text-on-error font-label-lg font-bold shadow-[0_4px_14px_rgba(179,38,30,0.3)] hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          إعادة المحاولة
        </button>
      </div>
    </main>
  );
}
